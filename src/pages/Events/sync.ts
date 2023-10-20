import Dexie from 'dexie';
import {ErrorModalFunction} from '../../context/ModalContextProvider';
import db, {Event, Participant, Regform, updateParticipant} from '../../db/db';
import {
  FailedResponse,
  getEvent,
  getParticipant,
  getParticipants,
  getRegform,
  getRegforms,
} from '../../utils/client';

interface IndicoId {
  indicoId: number;
}

function split<T extends IndicoId, U extends IndicoId>(a: T[], b: U[]): [T[], U[], [T, U][]] {
  const existingById = a.reduce(
    (acc, v) => {
      acc[v.indicoId] = v;
      return acc;
    },
    {} as {[key: number]: T}
  );

  const newById = b.reduce(
    (acc, v) => {
      acc[v.indicoId] = v;
      return acc;
    },
    {} as {[key: number]: U}
  );

  const onlyExisting = a.filter(v => !(v.indicoId in newById));
  const onlyNew = b.filter(v => !(v.indicoId in existingById));
  const common: [T, U][] = a.filter(v => v.indicoId in newById).map(v => [v, newById[v.indicoId]]);
  return [onlyExisting, onlyNew, common];
}

async function bulkUpdate(table: Dexie.Table, ids: number[], data: object[]) {
  return Promise.all(ids.map((id, i) => table.update(id, data[i])));
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
      await db.events.update(events[i].id!, {indicoId: id, title, date});
    } else if (response.status === 404) {
      await db.events.update(events[i].id!, {deleted: true});
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
      const newRegforms = response.data.map(
        ({id, title, isOpen, registrationCount, checkedInCount}) => ({
          indicoId: id,
          title,
          isOpen,
          registrationCount,
          checkedInCount,
        })
      );
      const [onlyExisting, , common] = split(existingRegforms, newRegforms);

      // no bulkUpdate yet..
      // regforms that don't exist in Indico anymore, mark them as deleted
      const existingIds = onlyExisting.map(r => r.id!);
      const deleted = onlyExisting.map(() => ({deleted: true}));
      await bulkUpdate(db.regforms, existingIds, deleted);
      // regforms that we have both locally and in Indico, just update them
      const commonIds = common.map(([r]) => r.id!);
      const commonData = common.map(([, r]) => r);
      await bulkUpdate(db.regforms, commonIds, commonData);
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
    await db.regforms.update(regform.id!, {
      indicoId: id,
      title,
      isOpen,
      registrationCount,
      checkedInCount,
    });
  } else if (response.status === 404) {
    await db.regforms.update(regform.id!, {deleted: true});
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
      const newParticipants = response.data.map(
        ({
          id,
          fullName,
          registrationDate,
          registrationData,
          state,
          checkinSecret,
          checkedIn,
          checkedInDt,
          occupiedSlots,
          price,
          currency,
          formattedPrice,
          isPaid,
        }) => ({
          indicoId: id,
          fullName,
          registrationDate,
          registrationData,
          state,
          checkinSecret,
          checkedIn,
          checkedInDt,
          occupiedSlots,
          price,
          currency,
          formattedPrice,
          isPaid,
        })
      );
      const [onlyExisting, onlyNew, common] = split(existingParticipants, newParticipants);

      // participants that don't exist in Indico anymore, mark them as deleted
      const existingIds = onlyExisting.map(r => r.id!);
      const deleted = onlyExisting.map(() => ({deleted: true}));
      await bulkUpdate(db.participants, existingIds, deleted);
      // participants that we don't have locally, add them
      const newData = onlyNew.map(p => ({
        ...p,
        notes: '',
        deleted: false,
        regformId: regform.id as number,
      }));
      await db.participants.bulkAdd(newData);
      // participants that we have both locally and in Indico, just update them
      const commonIds = common.map(([r]) => r.id!);
      const commonData = common.map(([, r]) => r);
      await bulkUpdate(db.participants, commonIds, commonData);
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
    await updateParticipant(participant.id!, response.data);
  } else if (response.status === 404) {
    await db.participants.update(participant.id!, {deleted: true});
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
