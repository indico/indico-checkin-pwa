import db, {ServerTable, EventTable, RegFormTable, ParticipantTable} from './db';

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

/**
 * Adds a participant to a registration form if it doesn't already exist
 * @param participant
 */
export const addParticipant = async (participant: ParticipantTable) => {
  return await db.participants.add(participant);
};

/**
 * Adds a participant to a registration form if it doesn't already exist
 * @param id
 */
export const deleteParticipant = async (id: number) => {
  return db.participants.delete(id);
};

/**
 * Get all the RegistrationForms that belong to an Event
 * @param eventId Event ID
 * @returns {RegFormTable[]}
 */
export const getRegistrationForms = async (eventId: string) => {
  return db.regForms.where({eventId}).toArray();
};

/**
 * Updates the title and date of an event if defined
 * TODO: Check if this can throw errors
 * @param eventId
 * @param newTitle
 * @param newDate
 */
export const updateEvent = async (eventId: number, newTitle?: string, newDate?: string) => {
  try {
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
  } catch (err) {
    console.log(`Error updating event: ${err}`);
  }
};

/**
 * Updates the label of a registration form if defined
 * @param id
 * @param data
 * @returns
 */
export const updateRegForm = async (id: number, data: object) => {
  return db.regForms.update(id, data);
};

/**
 * Get The list of participants for a registration form
 * @param regFormUserIds
 * @returns
 */
export const getParticipants = async regFormId => {
  return db.participants.where({regForm_id: regFormId}).sortBy('id');
};

/**
 * Updates the check-in status of a participant
 * @param participant
 * @param newCheckedIn
 */
export const changeParticipantCheckIn = async (
  participant: ParticipantTable,
  newCheckedIn: boolean
) => {
  try {
    const participantExists = await db.participants.get({id: participant.id});
    if (participantExists) {
      await db.participants.update(participant.id, {checked_in: newCheckedIn});
    }
  } catch (err) {
    console.log(`Error changing participant check-in status: ${err}`);
  }
};

/**
 * Updates a Participant if there are changes
 * @param id
 * @param data
 */
export const updateParticipant = async (id: number, data: object) => {
  return db.participants.update(id, data);
};

export interface fullParticipantDetails {
  participant?: ParticipantTable;
  regForm?: RegFormTable;
  event?: EventTable;
}

/**
 * Get the necessary Event Details derived from the IDs
 * Returns the respective entities if the IDs are defined
 * @param eventId
 * @param regFormId
 * @param participantId
 * @returns Object containing the event, registration form, and participant details if their IDs are defined
 */
export const getEventDetailsFromIds = async ({
  eventId,
  regFormId,
  participantId,
}: {
  eventId?: number | null;
  regFormId?: number | null;
  participantId?: number | null;
}): Promise<fullParticipantDetails | null> => {
  try {
    const response: fullParticipantDetails = {};

    if (eventId) {
      // Get the Event
      const event = await db.events.get({id: Number(eventId)});
      if (!event) {
        return null;
      }
      // Format the date
      response.event = event;
    }

    if (regFormId) {
      // Get the Registration Form
      const regForm = await db.regForms.get({id: Number(regFormId)});
      if (!regForm) {
        return null;
      }
      response.regForm = regForm;
    }

    if (participantId) {
      // Get the Participant
      const participant = await db.participants.get({id: Number(participantId)});
      if (!participant) {
        return null;
      }
      // Format the dates
      response.participant = participant;
    }

    return response;
  } catch (err) {
    return null;
  }
};
