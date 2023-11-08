import {ErrorModalFunction} from '../../context/ModalContextProvider';
import db, {
  Event,
  type IDBBoolean,
  Participant,
  Regform,
  updateParticipant,
  addParticipants,
} from '../../db/db';
import {
  FailedResponse,
  getEvent,
  getParticipant,
  getParticipants,
  getRegform,
  getRegforms,
} from '../../utils/client';

function byId<T, TKey extends keyof T, TKeyValue extends T[TKey] & (number | string | symbol)>(
  arr: T[],
  c: TKey
): Record<TKeyValue, T> {
  return Object.fromEntries(arr.map(v => [v[c], v]));
}

function split<T extends {indicoId: number}, U extends {id: number}>(
  currentRegforms: T[],
  newRegforms: U[]
): [T[], U[], [T, U][]] {
  const existingById = byId(currentRegforms, 'indicoId');
  const newById = byId(newRegforms, 'id');

  // Items that exist locally but not in Indico (aka deleted in Indico)
  const onlyExisting = currentRegforms.filter(v => !(v.indicoId in newById));
  // Items that exist in Indico but not locally (newly added)
  const onlyNew = newRegforms.filter(v => !(v.id in existingById));
  // Items that exist both locally and in Indico (will be updated)
  const common: [T, U][] = currentRegforms
    .filter(v => v.indicoId in newById)
    .map(v => {
      const u = newById[v.indicoId as keyof typeof newById];
      return [v, u];
    });
  return [onlyExisting, onlyNew, common];
}

export async function syncEvents(
  events: Event[],
  signal: AbortSignal,
  errorModal: ErrorModalFunction
) {
  const responses = await Promise.all(
    events.map(event => {
      return getEvent({serverId: event.serverId, eventId: event.indicoId}, {signal});
    })
  );

  for (const [i, response] of responses.entries()) {
    if (response.ok) {
      const {id, title, startDt: date} = response.data;
      await db.events.update(events[i].id, {indicoId: id, title, date});
    } else if (response.status === 404) {
      await db.events.update(events[i].id, {deleted: 1});
    } else {
      handleError(response, 'Something went wrong when updating events', errorModal);
    }
  }
}

export async function syncEvent(event: Event, signal: AbortSignal, errorModal: ErrorModalFunction) {
  return syncEvents([event], signal, errorModal);
}

export async function syncRegforms(
  event: Event,
  signal: AbortSignal,
  errorModal: ErrorModalFunction
) {
  const response = await getRegforms(
    {serverId: event.serverId, eventId: event.indicoId},
    {
      signal,
    }
  );

  if (response.ok) {
    await db.transaction('readwrite', db.regforms, async () => {
      const existingRegforms = await db.regforms.where({eventId: event.id}).toArray();
      const [onlyExisting, , common] = split(existingRegforms, response.data);

      // regforms that don't exist in Indico anymore, mark them as deleted
      const deleted = onlyExisting.map(r => ({key: r.id, changes: {deleted: 1 as IDBBoolean}}));
      await db.regforms.bulkUpdate(deleted);
      // regforms that we have both locally and in Indico, just update them
      const commonData = common.map(([{id}, data]) => ({key: id, changes: data}));
      await db.regforms.bulkUpdate(commonData);
    });
  } else {
    handleError(response, 'Something went wrong when updating registration forms', errorModal);
  }
}

export async function syncRegform(
  event: Event,
  regform: Regform,
  signal: AbortSignal,
  errorModal: ErrorModalFunction
) {
  const response = await getRegform(
    {serverId: event.serverId, eventId: event.indicoId, regformId: regform.indicoId},
    {
      signal,
    }
  );

  if (response.ok) {
    const {id, title, isOpen, registrationCount, checkedInCount} = response.data;
    await db.regforms.update(regform.id, {
      indicoId: id,
      title,
      isOpen,
      registrationCount,
      checkedInCount,
    });
  } else if (response.status === 404) {
    await db.regforms.update(regform.id, {deleted: 1});
  } else {
    handleError(response, 'Something went wrong when updating registration form', errorModal);
  }
}

export async function syncParticipants(
  event: Event,
  regform: Regform,
  signal: AbortSignal,
  errorModal: ErrorModalFunction
) {
  const response = await getParticipants(
    {serverId: event.serverId, eventId: event.indicoId, regformId: regform.indicoId},
    {
      signal,
    }
  );

  if (response.ok) {
    await db.transaction('readwrite', db.participants, async () => {
      const existingParticipants = await db.participants.where({regformId: regform.id}).toArray();
      const [onlyExisting, onlyNew, common] = split(existingParticipants, response.data);

      // participants that don't exist in Indico anymore, mark them as deleted
      const deleted = onlyExisting.map(r => ({key: r.id, changes: {deleted: 1 as IDBBoolean}}));
      await db.participants.bulkUpdate(deleted);
      // participants that we don't have locally, add them
      const newData = onlyNew.map(({id, ...p}) => ({
        ...p,
        indicoId: id,
        regformId: regform.id,
      }));
      await addParticipants(newData);
      // participants that we have both locally and in Indico, just update them
      const commonData = common.map(([{id}, data]) => ({key: id, changes: data}));
      await db.participants.bulkUpdate(commonData);
    });
  } else {
    handleError(response, 'Something went wrong when updating participants', errorModal);
  }
}

export async function syncParticipant(
  event: Event,
  regform: Regform,
  participant: Participant,
  signal: AbortSignal,
  errorModal: ErrorModalFunction
) {
  const response = await getParticipant(
    {
      serverId: event.serverId,
      eventId: event.indicoId,
      regformId: regform.indicoId,
      participantId: participant.indicoId,
    },
    {
      signal,
    }
  );

  if (response.ok) {
    await updateParticipant(participant.id, response.data);
  } else if (response.status === 404) {
    await db.participants.update(participant.id, {deleted: 1});
  } else {
    handleError(response, 'Something went wrong when updating participant', errorModal);
  }
}

export function handleError(response: FailedResponse, msg: string, errorModal: ErrorModalFunction) {
  if (response.network || response.aborted) {
    // Either a network error in which case we fallback to indexedDB,
    // or aborted because the component unmounted
    return;
  } else if (response.err) {
    errorModal({title: msg, content: response.err.message});
  } else {
    errorModal({title: msg, content: `Response status: ${response.status}`});
  }
}
