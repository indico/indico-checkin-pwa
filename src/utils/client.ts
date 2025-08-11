import {useEffect, useState} from 'react';
import db, {RegistrationData, RegistrationState} from '../db/db';
import {camelizeKeys} from './case';

export const useIsOffline = () => {
  const [offline, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const onOnline = () => setOffline(false);
    const onOffline = () => setOffline(true);

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  return offline;
};

export interface IndicoEvent {
  id: number;
  title: string;
  description?: string;
  startDt: string;
  endDt: string;
}

export interface IndicoRegform {
  id: number;
  eventId: number;
  title: string;
  introduction?: string;
  startDt?: string;
  endDt?: string;
  registrationCount: number;
  checkedInCount: number;
  isOpen: boolean;
}

interface _IndicoParticipant {
  id: number;
  regformId: number;
  eventId: number;
  fullName: string;
  email: string;
  state: RegistrationState;
  registrationDate: string;
  checkedIn: boolean;
  checkedInDt?: string;
  checkedOut: boolean;
  checkedOutDt?: string;
  checkinSecret: string;
  occupiedSlots: number;
  registrationData: RegistrationData[];
  tags: string[];
  price: number;
  currency: string;
  formattedPrice: string;
  isPaid: boolean;
}

export interface IndicoParticipant extends _IndicoParticipant {
  registrationData: RegistrationData[];
}

// Returned for /forms/:regformId/registrations/
// The registration data is not needed to display the list of participants
// and it saves a lot of bandwith to not include it
export type IndicoParticipantList = _IndicoParticipant[];

interface EventLocator {
  serverId: number;
  eventId: number;
}

interface RegformLocator extends EventLocator {
  regformId: number;
}

interface ParticipantLocator extends RegformLocator {
  participantId: number;
}

interface SuccessfulResponse<T> {
  ok: true;
  status: number;
  data: T;
}

export interface FailedResponse {
  ok: false;
  status?: number;
  aborted?: boolean;
  network?: boolean;
  err?: unknown;
  endpoint?: string;
  options?: object;
  data?: unknown;
  description?: string;
}

type Response<T> = SuccessfulResponse<T> | FailedResponse;

async function makeRequest<T>(
  serverId: number,
  endpoint: string,
  options: object = {}
): Promise<Response<T>> {
  const server = await db.servers.get(serverId);
  if (!server) {
    return {
      ok: false,
      endpoint,
      options,
      description: `Server (id <${serverId}>) not found in IndexedDB`,
    };
  }

  const url = new URL(endpoint, server.baseUrl);
  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${server.authToken}`,
        'Content-Type': 'application/json',
      },
    });
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') {
      // Ignore cancelled requests
      return {ok: false, aborted: true};
    }
    // Assume everything else is a network issue (impossible to distinguish from other TypeErrors)
    return {ok: false, network: true, endpoint, options, err: e};
  }

  let data;
  try {
    data = await response.json();
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') {
      // Ignore cancelled requests
      return {ok: false, aborted: true};
    }
    return {ok: false, endpoint, options, err: e, description: 'response.json() failed'};
  }
  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      err: data.error?.message,
      endpoint,
      options,
      data,
    };
  }

  data = camelizeKeys(data);
  return {ok: true, status: response.status, data};
}

export async function getEvent({serverId, eventId}: EventLocator, options?: object) {
  return makeRequest<IndicoEvent>(serverId, `api/checkin/event/${eventId}/`, options);
}

export async function getRegforms(
  {serverId, eventId}: EventLocator,
  checkTypeId?: number,
  options?: object
) {
  const url = checkTypeId
    ? `api/checkin/event/${eventId}/forms/?check_type_id=${checkTypeId}`
    : `api/checkin/event/${eventId}/forms/`;
  return makeRequest<IndicoRegform[]>(serverId, url, options);
}

export async function getRegform(
  {serverId, eventId, regformId}: RegformLocator,
  checkTypeId?: number,
  options?: object
) {
  const url = checkTypeId
    ? `api/checkin/event/${eventId}/forms/${regformId}/?check_type_id=${checkTypeId}`
    : `api/checkin/event/${eventId}/forms/${regformId}/`;
  return makeRequest<IndicoRegform>(serverId, url, options);
}

export async function getParticipants(
  {serverId, eventId, regformId}: RegformLocator,
  checkTypeId?: number,
  options?: object
) {
  const url = checkTypeId
    ? `api/checkin/event/${eventId}/forms/${regformId}/registrations/?check_type_id=${checkTypeId}`
    : `api/checkin/event/${eventId}/forms/${regformId}/registrations/`;
  return makeRequest<IndicoParticipantList>(serverId, url, options);
}

export async function getParticipant(
  {serverId, eventId, regformId, participantId}: ParticipantLocator,
  checkTypeId?: number,
  options?: object
) {
  const url = checkTypeId
    ? `api/checkin/event/${eventId}/forms/${regformId}/registrations/${participantId}?check_type_id=${checkTypeId}`
    : `api/checkin/event/${eventId}/forms/${regformId}/registrations/${participantId}/`;
  return makeRequest<IndicoParticipant>(serverId, url, options);
}

export async function getParticipantByUuid(
  {serverId, uuid}: {serverId: number; uuid: string},
  checkTypeId?: number,
  options?: object
) {
  const url = checkTypeId
    ? `api/checkin/ticket/${uuid}?check_type_id=${checkTypeId}`
    : `api/checkin/ticket/${uuid}`;
  return makeRequest<IndicoParticipant>(serverId, url, options);
}

export async function checkInParticipant(
  {serverId, eventId, regformId, participantId}: ParticipantLocator,
  checkInState: boolean,
  checkTypeId?: number
) {
  return makeRequest<IndicoParticipant>(
    serverId,
    `api/checkin/event/${eventId}/forms/${regformId}/registrations/${participantId}`,
    {
      method: 'PATCH',
      body: JSON.stringify({checked_in: checkInState, check_type_id: checkTypeId}),
    }
  );
}

export async function checkOutParticipant(
  {serverId, eventId, regformId, participantId}: ParticipantLocator,
  checkOutState: boolean,
  checkTypeId?: number
) {
  return makeRequest<IndicoParticipant>(
    serverId,
    `api/checkin/event/${eventId}/forms/${regformId}/registrations/${participantId}`,
    {
      method: 'PATCH',
      body: JSON.stringify({checked_out: checkOutState, check_type_id: checkTypeId}),
    }
  );
}

export async function togglePayment(
  {serverId, eventId, regformId, participantId}: ParticipantLocator,
  paid: boolean
) {
  return makeRequest<IndicoParticipant>(
    serverId,
    `api/checkin/event/${eventId}/forms/${regformId}/registrations/${participantId}`,
    {
      method: 'PATCH',
      body: JSON.stringify({paid}),
    }
  );
}
