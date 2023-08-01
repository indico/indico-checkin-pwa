import {formatDateObj} from '../utils/date';
import db, {
  ServerTable,
  EventTable,
  RegFormTable,
  ParticipantTable,
  ServerParticipantTable,
} from './db';

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
 * Adds a participant to a registration form if it doesn't already exist
 * @param participant
 */
export const addRegFormParticipant = async (participant: ParticipantTable) => {
  try {
    // Check if the Reg. Form exists
    const regFormExists = await db.regForms.get({id: participant.regForm_id});
    if (regFormExists) {
      const participantExists = await db.participants.get({id: participant.id});
      if (!participantExists || participantExists.regForm_id !== participant.regForm_id) {
        await db.participants.add({
          id: participant.id,
          full_name: participant.full_name,
          regForm_id: participant.regForm_id,
          registration_date: participant.registration_date,
          state: participant.state,
          checked_in: participant.checked_in,
          checked_in_dt: participant.checked_in_dt,
        });

        // Add the participant to the registration form
        await db.regForms.update(participant.regForm_id, {
          participants: [...regFormExists.participants, participant.id],
        });
      }
    }
  } catch (err) {
    console.log(`Error adding participant to registration form: ${err}`);
  }
};

/**
 * Adds a participant to a registration form if it doesn't already exist
 * @param participantID
 */
export const removeRegFormParticipant = async (participantID: number) => {
  try {
    // Check if the participant exists
    const participantExists = await db.participants.get({id: participantID});
    if (participantExists) {
      // Get the registration form
      const regFormExists = await db.regForms.get({id: participantExists.regForm_id});

      if (regFormExists) {
        // Remove the participant from the registration form
        await db.regForms.update(participantExists.regForm_id, {
          participants: regFormExists.participants.filter(id => id !== participantID),
        });
      }

      // Remove the participant from the IndexedDB
      await db.participants.delete(participantID);
    }
  } catch (err) {
    console.log(`Error adding participant to registration form: ${err}`);
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
 * @param regFormId
 * @param newLabel
 * @returns
 */
export const updateRegForm = async (regFormId: number, newLabel?: string) => {
  try {
    const regForm = await db.regForms.get({id: regFormId});
    if (regForm) {
      const updateObj: {label?: string} = {};
      if (regForm.label !== newLabel) {
        updateObj['label'] = newLabel;
      }

      if (Object.keys(updateObj).length === 0) {
        // Nothing to update
        return;
      }

      await db.regForms.update(regFormId, updateObj);
    }
  } catch (err) {
    console.log(`Error updating registration form: ${err}`);
  }
};

/**
 * Get The list of participants for a registration form
 * @param regFormUserIds
 * @returns
 */
export const getRegFormParticipants = async (regFormUserIds: number[]) => {
  try {
    const participants: ParticipantTable[] = [];
    for (const userId of regFormUserIds) {
      const participant = await db.participants.get({id: userId});
      if (participant) {
        participants.push(participant);
      }
    }

    return participants;
  } catch (err) {
    console.log(`Error getting participants for registration form: ${err}`);
  }
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
 * @param participant
 * @param newCheckedIn
 * @returns true if the participant was updated, false otherwise
 */
export const changeRegFormParticipant = async (
  participant: ParticipantTable,
  newParticipant: ServerParticipantTable
) => {
  try {
    const participantExists = await db.participants.get({id: participant.id});
    if (participantExists) {
      // Check changes
      const changesObj: {[key: string]: any} = {};

      if (participant.full_name !== newParticipant.full_name) {
        changesObj.full_name = newParticipant.full_name;
      }
      if (participant.registration_date !== newParticipant.registration_date) {
        changesObj.registration_date = newParticipant.registration_date;
      }
      if (participant.state !== newParticipant.state) {
        changesObj.state = newParticipant.state;
      }
      if (participant.checked_in !== newParticipant.checked_in) {
        changesObj.checked_in = newParticipant.checked_in;
      }
      if (participant.checked_in_dt !== newParticipant.checked_in_dt) {
        changesObj.checked_in_dt = newParticipant.checked_in_dt;
      }

      if (Object.keys(changesObj).length === 0) {
        // Nothing to update
        return false;
      }

      // Update the participant
      await db.participants.update(participant.id, changesObj);
      return true;
    }

    return false;
  } catch (err) {
    console.log(`Error changing participant check-in status: ${err}`);
    return false;
  }
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
      event.date = formatDateObj(new Date(event.date));
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
      participant.registration_date = formatDateObj(new Date(participant.registration_date));
      participant.checked_in_dt = formatDateObj(new Date(participant.checked_in_dt));
      response.participant = participant;
    }

    return response;
  } catch (err) {
    return null;
  }
};
