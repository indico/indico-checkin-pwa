import db, {ServerTable, EventTable, RegFormTable} from './db';

/**
 * Add a server to the IndexedDB if it doesn't already exist
 * @param {ServerTable} server - The server to add
 */
export const addServer = async ({base_url, client_id, scope, auth_token}: ServerTable) => {
  const serverExists = await db.servers.get({base_url: base_url});
  if (!serverExists) {
    // Add the server to IndexedDB
    await db.servers.add({
      base_url: base_url,
      client_id: client_id,
      scope: scope,
      auth_token: auth_token,
    });
  }
};

/**
 * Add an event to the IndexedDB if it doesn't already exist
 * @param {EventTable} event - The event to add
 */
export const addEvent = async ({id, title, date, server_base_url}: EventTable) => {
  const eventExists = await db.events.get({id: id});
  if (!eventExists) {
    await db.events.add({
      id: id,
      title: title,
      date: date,
      server_base_url: server_base_url,
    });
  }
};

/**
 * Add a RegistrationForm to the IndexedDB if it doesn't already exist
 * @param {RegFormTable} regForm - The registrationForm to add
 */
export const addRegistrationForm = async ({
  id,
  label,
  event_id,
  participants = [],
}: RegFormTable) => {
  const regFormExists = await db.regForms.get({id: id});
  if (!regFormExists) {
    await db.regForms.add({
      id: id,
      label: label,
      event_id: event_id,
      participants: participants,
    });
  }
};

/**
 * Get all the RegistrationForms that belong to an Event
 * @param eventId Event ID
 * @returns {RegFormTable[]}
 */
export const getRegistrationForms = async (eventId: string) => {
  const regForms = await db.regForms.where({event_id: eventId}).toArray();
  return regForms;
};

/**
 * Updates the title and date of an event if defined
 * TODO: Check if this can throw errors
 * @param eventId
 * @param newTitle
 * @param newDate
 */
export const updateEvent = async (eventId: number, newTitle?: string, newDate?: string) => {
  const event = await db.events.get({id: eventId});
  if (event) {
    const updateObj: {title?: string; date?: string} = {};
    if (event.title !== newTitle) {
      updateObj['title'] = newTitle;
    }

    if (event.date !== newDate) {
      updateObj['date'] = newDate;
    }
    if (Object.keys(updateObj).length === 0) {
      // Nothing to update
      return;
    }

    await db.events.update(eventId, updateObj);
  }
};
