import db, {Event, Regform, Participant} from '../../db/db';
import {HandleError} from '../../hooks/useError';
import {checkInParticipant, checkOutParticipant} from '../../utils/client';
import {playVibration} from '../../utils/haptics';
import {playSound} from '../../utils/sound';

async function resetCheckedStateLoading(participant: Participant) {
  await db.participants.update(participant.id, {checkedStateLoading: 0});
}

async function updateCheckinState(
  regform: Regform,
  participant: Participant,
  newCheckInState: boolean
) {
  return db.transaction('readwrite', db.regforms, db.participants, async () => {
    await resetCheckedStateLoading(participant);
    await db.participants.update(participant.id, {
      checkedIn: newCheckInState,
      checkedStateLoading: 0,
    });
    const slots = participant.occupiedSlots;
    const checkedInCount = regform.checkedInCount + (newCheckInState ? slots : -slots);
    await db.regforms.update(regform.id, {checkedInCount});
  });
}

async function updateCheckoutState(
  regform: Regform,
  participant: Participant,
  newCheckOutState: boolean
) {
  return db.transaction('readwrite', db.regforms, db.participants, async () => {
    await resetCheckedStateLoading(participant);
    await db.participants.update(participant.id, {
      checkedOut: newCheckOutState,
      checkedStateLoading: 0,
    });
    const slots = participant.occupiedSlots;
    const checkedInCount = regform.checkedInCount + (newCheckOutState ? -slots : slots);
    await db.regforms.update(regform.id, {checkedInCount});
  });
}

export async function CheckInOrOut(
  event: Event,
  regform: Regform,
  participant: Participant,
  newCheckState: boolean,
  sound: string,
  hapticFeedback: boolean,
  handleError: HandleError,
  checkOut: boolean,
  checkTypeId?: number
) {
  await db.participants.update(participant.id, {checkedStateLoading: 1});
  const checkParticipant = checkOut ? checkOutParticipant : checkInParticipant;
  const response = await checkParticipant(
    {
      serverId: event.serverId,
      eventId: event.indicoId,
      regformId: regform.indicoId,
      participantId: participant.indicoId,
    },
    newCheckState,
    checkTypeId
  );

  if (response.ok) {
    if (checkOut) {
      await updateCheckoutState(regform, participant, newCheckState);
    } else {
      await updateCheckinState(regform, participant, newCheckState);
    }
    if (newCheckState) {
      playSound(sound);
      if (hapticFeedback) {
        playVibration.success();
      }
    }
  } else {
    await resetCheckedStateLoading(participant);
    handleError(response, 'Something went wrong when updating check-in status');
  }
}
