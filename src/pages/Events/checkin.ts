import {ErrorModalData} from '../../context/ModalContextProvider';
import db, {Event, Regform, Participant} from '../../db/db';
import {checkInParticipant} from '../../utils/client';
import {playSound} from '../../utils/sound';
import {handleError} from './sync';

async function updateCheckinState(
  regform: Regform,
  participant: Participant,
  newCheckInState: boolean
) {
  return db.transaction('readwrite', db.regforms, db.participants, async () => {
    await db.participants.update(participant.id, {checkedIn: newCheckInState});
    const slots = participant.occupiedSlots;
    const checkedInCount = regform.checkedInCount + (newCheckInState ? slots : -slots);
    await db.regforms.update(regform.id, {checkedInCount});
  });
}

export async function checkIn(
  event: Event,
  regform: Regform,
  participant: Participant,
  newCheckInState: boolean,
  sound: string,
  errorModal: (data: ErrorModalData) => void
) {
  const server = await db.servers.get(event.serverId);
  if (!server) {
    return;
  }
  const response = await checkInParticipant(server, event, regform, participant, newCheckInState);

  if (response.ok) {
    await updateCheckinState(regform, participant, newCheckInState);
    if (newCheckInState) {
      playSound(sound);
    }
  } else {
    handleError(response, 'Something went wrong when updating check-in status', errorModal);
  }
}
