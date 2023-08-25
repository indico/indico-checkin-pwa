import config from '../../config';

export const redirectURI = `${config.CLIENT_URL}/auth/redirect`;

export const discoveryEndpoint = '.well-known/oauth-authorization-server';

export function validateQRCodeData(data) {
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
