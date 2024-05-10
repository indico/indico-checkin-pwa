import {ExclamationCircleIcon} from '@heroicons/react/20/solid';
import {CheckIcon} from '@heroicons/react/24/outline';
import {Button} from '../../Components/Tailwind';
import {LoadingIndicator} from '../../Components/Tailwind/LoadingIndicator';
import db, {Event, Regform, Participant} from '../../db/db';
import {HandleError} from '../../hooks/useError';
import {togglePayment as _togglePayment} from '../../utils/client';

async function resetPaidLoading(participant: Participant) {
  await db.participants.update(participant.id, {isPaidLoading: 0});
}

async function markAsPaid(
  event: Event,
  regform: Regform,
  participant: Participant,
  handleError: HandleError
) {
  return await togglePayment(event, regform, participant, true, handleError);
}

export async function markAsUnpaid(
  event: Event,
  regform: Regform,
  participant: Participant,
  handleError: HandleError
) {
  return await togglePayment(event, regform, participant, false, handleError);
}

async function togglePayment(
  event: Event,
  regform: Regform,
  participant: Participant,
  paid: boolean,
  handleError: HandleError
) {
  await db.participants.update(participant.id, {isPaidLoading: 1});
  const response = await _togglePayment(
    {
      serverId: event.serverId,
      eventId: event.indicoId,
      regformId: regform.indicoId,
      participantId: participant.indicoId,
    },
    paid
  );

  if (response.ok) {
    return await db.participants.update(participant.id, {
      state: response.data.state,
      isPaid: response.data.isPaid,
      isPaidLoading: 0,
    });
  } else {
    await resetPaidLoading(participant);
    handleError(response, 'Something went wrong when updating payment status');
  }
}

export function PaymentWarning({
  event,
  regform,
  participant,
  handleError,
}: {
  event: Event;
  regform: Regform;
  participant: Participant;
  handleError: HandleError;
}) {
  const onClick = async () => {
    await markAsPaid(event, regform, participant, handleError);
  };

  return (
    <div
      className="rounded-xl border border-yellow-300 bg-yellow-100 p-4 text-sm text-yellow-800 dark:border-yellow-800
                 dark:border-yellow-800 dark:bg-gray-800 dark:text-yellow-300"
      role="alert"
    >
      <div className="flex items-center gap-2">
        <ExclamationCircleIcon className="h-5 w-5 min-w-[1.25rem]" />
        <div>This registration has not been paid</div>
      </div>
      <div className="mt-4 flex justify-center gap-4">
        {!!participant.isPaidLoading && <LoadingIndicator />}
        {!participant.isPaidLoading && (
          <Button variant="warning" onClick={onClick}>
            <CheckIcon className="h-5 w-5" />
            Mark as paid
          </Button>
        )}
      </div>
    </div>
  );
}
