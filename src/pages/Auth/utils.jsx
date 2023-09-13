export const redirectUri = `${window.location.origin}/auth/redirect`;
export const discoveryEndpoint = '.well-known/oauth-authorization-server';

export function validateEventData(data) {
  const {eventId, regformId, title, regformTitle, date} = data;
  if (!Number.isInteger(eventId) || !Number.isInteger(regformId)) {
    return false;
  }
  if (typeof title !== 'string' || typeof regformTitle !== 'string') {
    return false;
  }
  if (new Date(date).toString() === 'Invalid Date') {
    return false;
  }

  const {server: {baseUrl, clientId, scope} = {}} = data;
  try {
    new URL(baseUrl);
  } catch (err) {
    return false;
  }
  if (typeof clientId !== 'string' || typeof scope !== 'string') {
    return false;
  }
  return true;
}

export function validateParticipantData(data) {
  const {checkinSecret, eventId, registrationId, serverUrl, regformId} = data;

  if (
    !Number.isInteger(parseInt(eventId, 10)) ||
    !Number.isInteger(regformId) ||
    !Number.isInteger(registrationId)
  ) {
    return false;
  }
  if (typeof checkinSecret !== 'string') {
    return false;
  }
  try {
    new URL(serverUrl);
  } catch (err) {
    return false;
  }
  return true;
}
