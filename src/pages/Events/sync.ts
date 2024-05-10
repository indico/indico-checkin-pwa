import db, {
  Event,
  type IDBBoolean,
  Participant,
  Regform,
  updateParticipant,
  addParticipants,
  updateParticipants,
  updateRegform,
  updateRegforms,
  updateEvent,
} from '../../db/db';
import {HandleError} from '../../hooks/useError';
import {
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

function split<T extends {id: number; indicoId: number}, U extends {id: number}>(
  existingItems: T[],
  newData: U[]
): [T[], U[], [number[], U[]]] {
  const existingById = byId(existingItems, 'indicoId');
  const newById = byId(newData, 'id');

  // Items that exist locally but not in Indico (aka deleted in Indico)
  const onlyExisting = existingItems.filter(v => !(v.indicoId in newById));
  // Items that exist in Indico but not locally (newly added)
  const onlyNew = newData.filter(v => !(v.id in existingById));
  // Items that exist both locally and in Indico (will be updated)
  const commonItems = existingItems.filter(v => v.indicoId in newById);
  const commonIds = commonItems.map(v => v.id);
  const commonData = commonItems.map(v => newById[v.indicoId as keyof typeof newById]);
  return [onlyExisting, onlyNew, [commonIds, commonData]];
}

export async function syncEvents(events: Event[], signal: AbortSignal, handleError: HandleError) {
  const responses = await Promise.all(
    events.map(event => {
      return getEvent({serverId: event.serverId, eventId: event.indicoId}, {signal});
    })
  );

  for (const [i, response] of responses.entries()) {
    if (response.ok) {
      await updateEvent(events[i].id, response.data);
    } else if (response.status === 404) {
      await db.events.update(events[i].id, {deleted: 1});
    } else {
      handleError(response, 'Something went wrong when updating events');
    }
  }
}

export async function syncEvent(event: Event, signal: AbortSignal, handleError: HandleError) {
  return syncEvents([event], signal, handleError);
}

export async function syncRegforms(event: Event, signal: AbortSignal, handleError: HandleError) {
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
      await updateRegforms(...common);
    });
  } else {
    handleError(response, 'Something went wrong when updating registration forms');
  }
}

export async function syncRegform(
  event: Event,
  regform: Regform,
  signal: AbortSignal,
  handleError: HandleError
) {
  const response = await getRegform(
    {serverId: event.serverId, eventId: event.indicoId, regformId: regform.indicoId},
    {
      signal,
    }
  );

  if (response.ok) {
    await updateRegform(regform.id, response.data);
  } else if (response.status === 404) {
    await db.regforms.update(regform.id, {deleted: 1});
  } else {
    handleError(response, 'Something went wrong when updating registration form');
  }
}

export async function syncParticipants(
  event: Event,
  regform: Regform,
  signal: AbortSignal,
  handleError: HandleError
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
      const newData = onlyNew.map(({id, eventId, regformId, ...p}) => ({
        ...p,
        indicoId: id,
        regformId: regform.id,
      }));
      await addParticipants(newData);
      // participants that we have both locally and in Indico, just update them
      await updateParticipants(...common);
    });
  } else {
    handleError(response, 'Something went wrong when updating participants');
  }
}

export async function syncParticipant(
  event: Event,
  regform: Regform,
  participant: Participant,
  signal: AbortSignal,
  handleError: HandleError
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
    handleError(response, 'Something went wrong when updating participant');
  }
}
