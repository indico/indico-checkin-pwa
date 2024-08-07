import db, {Event, Regform, Participant} from '../../db/db';
import {HandleError} from '../../hooks/useError';
import {checkInParticipant} from '../../utils/client';
import {playVibration} from '../../utils/haptics';
import {playSound} from '../../utils/sound';

async function resetCheckedInLoading(participant: Participant) {
  await db.participants.update(participant.id, {checkedInLoading: 0});
}

async function updateCheckinState(
  regform: Regform,
  participant: Participant,
  newCheckInState: boolean
) {
  return db.transaction('readwrite', db.regforms, db.participants, async () => {
    await resetCheckedInLoading(participant);
    await db.participants.update(participant.id, {checkedIn: newCheckInState, checkedInLoading: 0});
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
  hapticFeedback: boolean,
  handleError: HandleError
) {
  await db.participants.update(participant.id, {checkedInLoading: 1});
  const response = await checkInParticipant(
    {
      serverId: event.serverId,
      eventId: event.indicoId,
      regformId: regform.indicoId,
      participantId: participant.indicoId,
    },
    newCheckInState
  );

  if (response.ok) {
    await updateCheckinState(regform, participant, newCheckInState);
    if (newCheckInState) {
      playSound(sound);
      if (hapticFeedback) {
        playVibration.success();
      }
    }
  } else {
    await resetCheckedInLoading(participant);
    handleError(response, 'Something went wrong when updating check-in status');
  }
}
