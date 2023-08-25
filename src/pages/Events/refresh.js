import db from '../../db/db';
import {
  getEvent,
  getParticipant,
  getParticipants,
  getRegform,
  getRegforms,
} from '../../utils/client';

export async function refreshEvents(events, signal, showModal) {
  const serversById = (await db.servers.toArray()).reduce((acc, server) => {
    acc[server.id] = server;
    return acc;
  }, {});

  const responses = await Promise.all(
    events.map(event => {
      const server = serversById[event.serverId];
      return getEvent(server, event.id, {signal});
    })
  );

  for (const response of responses) {
    if (response.ok) {
      const {id, ...data} = response.data;
      await db.events.update(id, data);
    } else if (response.status === 404) {
      // Mark as deleted?
    } else {
      handleError(response, 'Something went wrong when updating events', showModal);
    }
  }
}

export async function refreshEvent(event, signal, showModal) {
  return refreshEvents([event], signal, showModal);
}

export async function refreshRegforms(event, signal, showModal) {
  const server = await db.servers.get(event.serverId);
  const response = await getRegforms(server, event, {
    signal,
  });

  if (response.ok) {
    await db.transaction('readwrite', db.participants, async () => {
      await db.regForms.where({eventId: event.id}).delete();
      await db.regForms.bulkAdd(response.data);
    });
  } else {
    handleError(response, 'Something went wrong when updating registration forms', showModal);
  }
}

export async function refreshRegform(event, regform, signal, showModal) {
  const server = await db.servers.get(event.serverId);
  const response = await getRegform(server, regform, {
    signal,
  });

  if (response.ok) {
    const {id, ...data} = response.data;
    await db.regForms.update(id, data);
  } else if (response.status === 404) {
    // Mark as deleted?
  } else {
    handleError(response, 'Something went wrong when updating registration form', showModal);
  }
}

export async function refreshParticipants(event, regform, signal, showModal) {
  const server = await db.servers.get(event.serverId);
  const response = await getParticipants(server, regform, {
    signal,
  });

  if (response.ok) {
    await db.transaction('readwrite', db.participants, async () => {
      // XXX: If we decide to keep any data locally, we will need to update rather than delete here
      await db.participants.where({regformId: regform.id}).delete();
      await db.participants.bulkAdd(response.data);
    });
  } else {
    handleError(response, 'Something went wrong when updating participants', showModal);
  }
}

export async function refreshParticipant(event, participant, signal, showModal) {
  const server = await db.servers.get(event.serverId);
  const response = await getParticipant(server, participant, {
    signal,
  });

  if (response.ok) {
    const {id, ...data} = response.data;
    await db.participants.update(id, data);
  } else if (response.status === 404) {
    // Mark as deleted?
  } else {
    handleError(response, 'Something went wrong when updating participant', showModal);
  }
}

export function handleError(response, msg, showModal) {
  if (response.network || response.aborted) {
    // Either a network error in which case we fallback to indexedDB,
    // or aborted because the component unmounted
    return;
  } else if (response.err) {
    showModal(msg, response.err.message);
  } else {
    showModal(msg, `Response status: ${response.status}`);
  }
}
