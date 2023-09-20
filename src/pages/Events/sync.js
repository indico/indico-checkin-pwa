import db from '../../db/db';
import {
  getEvent,
  getParticipant,
  getParticipants,
  getRegform,
  getRegforms,
} from '../../utils/client';

function split(a, b) {
  const existingById = a.reduce((acc, v) => {
    acc[v.indicoId] = v;
    return acc;
  }, {});

  const newById = b.reduce((acc, v) => {
    acc[v.indicoId] = v;
    return acc;
  }, {});

  const onlyExisting = a.filter(v => !(v.indicoId in newById));
  const onlyNew = b.filter(v => !(v.indicoId in existingById));
  const common = a.filter(v => v.indicoId in newById).map(v => [v, newById[v.indicoId]]);
  return [onlyExisting, onlyNew, common];
}

async function bulkUpdate(table, ids, data) {
  return Promise.all(ids.map((id, i) => table.update(id, data[i])));
}

export async function syncEvents(events, signal, errorModal) {
  const serversById = (await db.servers.toArray()).reduce((acc, server) => {
    acc[server.id] = server;
    return acc;
  }, {});

  const responses = await Promise.all(
    events.map(event => {
      const server = serversById[event.serverId];
      return getEvent(server, event, {signal});
    })
  );

  for (const [i, response] of responses.entries()) {
    if (response.ok) {
      const {id, title, startDt: date} = response.data;
      await db.events.update(events[i].id, {indicoId: id, title, date});
    } else if (response.status === 404) {
      await db.events.update(events[i].id, {deleted: true});
    } else {
      handleError(response, 'Something went wrong when updating events', errorModal);
    }
  }
}

export async function syncEvent(event, signal, errorModal) {
  return syncEvents([event], signal, errorModal);
}

export async function syncRegforms(event, signal, errorModal) {
  const server = await db.servers.get(event.serverId);
  const response = await getRegforms(server, event, {
    signal,
  });

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
      await db.transaction('readwrite', db.regforms, async () => {
        const existingIds = onlyExisting.map(r => r.id);
        const deleted = onlyExisting.map(() => ({deleted: true}));
        await bulkUpdate(db.regforms, existingIds, deleted);
        // regforms that we have both locally and in Indico, just update them
        const commonIds = common.map(([r]) => r.id);
        const commonData = common.map(([, r]) => r);
        await bulkUpdate(db.regforms, commonIds, commonData);
      });
    });
  } else {
    handleError(response, 'Something went wrong when updating registration forms', errorModal);
  }
}

export async function syncRegform(event, regform, signal, errorModal) {
  const server = await db.servers.get(event.serverId);
  const response = await getRegform(server, event, regform, {
    signal,
  });

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
    await db.regforms.update(regform.id, {deleted: true});
  } else {
    handleError(response, 'Something went wrong when updating registration form', errorModal);
  }
}

export async function syncParticipants(event, regform, signal, errorModal) {
  const server = await db.servers.get(event.serverId);
  const response = await getParticipants(server, event, regform, {
    signal,
  });

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
        })
      );
      const [onlyExisting, onlyNew, common] = split(existingParticipants, newParticipants);

      // regforms that don't exist in Indico anymore, mark them as deleted
      const existingIds = onlyExisting.map(r => r.id);
      const deleted = onlyExisting.map(() => ({deleted: true}));
      await bulkUpdate(db.participants, existingIds, deleted);
      // regforms that we don't have locally, add them
      const newData = onlyNew.map(r => ({...r, notes: '', deleted: false, regformId: regform.id}));
      await db.participants.bulkAdd(newData);
      // regforms that we have both locally and in Indico, just update them
      const commonIds = common.map(([r]) => r.id);
      const commonData = common.map(([, r]) => r);
      await bulkUpdate(db.participants, commonIds, commonData);
    });
  } else {
    handleError(response, 'Something went wrong when updating participants', errorModal);
  }
}

export async function syncParticipant(event, regform, participant, signal, errorModal) {
  const server = await db.servers.get(event.serverId);
  const response = await getParticipant(server, event, regform, participant, {
    signal,
  });

  if (response.ok) {
    const {
      id,
      fullName,
      registrationDate,
      registrationData,
      state,
      checkedIn,
      checkedInDt,
      occupiedSlots,
    } = response.data;
    await db.participants.update(participant.id, {
      indicoId: id,
      fullName,
      registrationDate,
      registrationData,
      state,
      occupiedSlots,
      checkedIn,
      checkedInDt,
    });
  } else if (response.status === 404) {
    await db.participants.update(participant.id, {deleted: true});
  } else {
    handleError(response, 'Something went wrong when updating participant', errorModal);
  }
}

export function handleError(response, msg, errorModal) {
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
