import db, {ServerTable, EventTable, RegFormTable} from './db';

/**
 * Add a server to the IndexedDB if it doesn't already exist
 * @param {ServerTable} server - The server to add
 */
export const addServer = async ({baseUrl, clientId, scope, authToken}: ServerTable) => {
  const server = await db.servers.get({baseUrl: baseUrl});
  if (server) {
    return server.id;
  }

  return await db.servers.add({
    baseUrl,
    clientId,
    scope,
    authToken,
  });
};

/**
 * Add an event to the IndexedDB if it doesn't already exist
 * @param {EventTable} event - The event to add
 */
export const addEvent = async ({id, serverId, title, date}: EventTable) => {
  const event = await db.events.get(id);
  if (!event) {
    await db.events.add({
      id,
      serverId,
      title,
      date,
    });
  }
};

/**
 * Add a RegistrationForm to the IndexedDB if it doesn't already exist
 * @param {RegFormTable} regForm - The registrationForm to add
 */
export const addRegistrationForm = async ({
  id,
  eventId,
  title,
  registrationCount = 0,
  checkedInCount = 0,
}: RegFormTable) => {
  return db.regForms.put({
    id,
    eventId,
    title,
    registrationCount,
    checkedInCount,
  });
};
