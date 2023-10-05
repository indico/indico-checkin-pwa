export const redirectUri = `${window.location.origin}/auth/redirect`;
export const discoveryEndpoint = '.well-known/oauth-authorization-server';

interface QRCodeServerData {
  baseUrl: string;
  clientId: string;
  scope: string;
}

export interface QRCodeEventData {
  eventId: number;
  regformId: number;
  title: string;
  date: string;
  regformTitle: string;
  server: QRCodeServerData;
}

export function validateEventData(data: any): data is QRCodeEventData {
  if (typeof data !== 'object') {
    return false;
  }

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

  const {server = {}} = data;
  if (typeof server !== 'object') {
    return false;
  }

  const {baseUrl, clientId, scope} = server;
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

interface _BaseQRCodeParticipantData {
  serverUrl: string;
  regformId: number;
  registrationId: number;
  checkinSecret: string;
}

// For compatibility with legacy string event ids, the API returns eventId as a string
// TODO: Update the API to return a number instead
interface IndicoQRCodeParticipantData extends _BaseQRCodeParticipantData {
  eventId: string;
}

export interface QRCodeParticipantData extends _BaseQRCodeParticipantData {
  eventId: number;
}

export function validateParticipantData(data: any): data is IndicoQRCodeParticipantData {
  if (typeof data !== 'object') {
    return false;
  }

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
