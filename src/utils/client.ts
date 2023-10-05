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

interface IndicoEvent {
  id: number;
  title: string;
  description?: string;
  startDt: string;
  endDt: string;
}

interface IndicoRegform {
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

interface IndicoParticipant {
  id: number;
  regformId: number;
  eventId: number;
  fullName: string;
  email: string;
  state: RegistrationState;
  registrationDate: string;
  checkedIn: boolean;
  checkedInDt?: string;
  checkinSecret: string;
  occupiedSlots: number;
  registrationData: RegistrationData[];
  tags: string[];
}

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
  err?: any;
}

type Response<T> = SuccessfulResponse<T> | FailedResponse;

async function makeRequest<T>(
  serverId: number,
  endpoint: string,
  options: object = {}
): Promise<Response<T>> {
  const server = await db.servers.get(serverId);
  if (!server) {
    return {ok: false};
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
  } catch (err: any) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      // Ignore cancelled requests
      return {ok: false, aborted: true};
    }
    // Assume everything else is a network issue (impossible to distinguish from other TypeErrors)
    return {ok: false, network: true};
  }

  if (!response.ok) {
    return {ok: false, status: response.status};
  }

  let data;
  try {
    data = await response.json();
  } catch (err) {
    return {ok: false, err};
  }
  data = camelizeKeys(data);
  return {ok: true, status: response.status, data};
}

export async function getEvent({serverId, eventId}: EventLocator, options?: object) {
  return makeRequest<IndicoEvent>(serverId, `api/checkin/event/${eventId}`, options);
}

export async function getRegform({serverId, eventId, regformId}: RegformLocator, options?: object) {
  return makeRequest<IndicoRegform>(
    serverId,
    `api/checkin/event/${eventId}/registration/${regformId}`,
    options
  );
}

export async function getRegforms({serverId, eventId}: EventLocator, options?: object) {
  return makeRequest<IndicoRegform[]>(
    serverId,
    `api/checkin/event/${eventId}/registrations`,
    options
  );
}

export async function getParticipant(
  {serverId, eventId, regformId, participantId}: ParticipantLocator,
  options?: object
) {
  return makeRequest<IndicoParticipant>(
    serverId,
    `api/checkin/event/${eventId}/registration/${regformId}/${participantId}`,
    options
  );
}

export async function getParticipants(
  {serverId, eventId, regformId}: RegformLocator,
  options?: object
) {
  return makeRequest<IndicoParticipant[]>(
    serverId,
    `api/checkin/event/${eventId}/registration/${regformId}/registrations`,
    options
  );
}

export async function checkInParticipant(
  {serverId, eventId, regformId, participantId}: ParticipantLocator,
  checkInState: boolean
) {
  return makeRequest(
    serverId,
    `api/checkin/event/${eventId}/registration/${regformId}/${participantId}`,
    {
      method: 'PATCH',
      body: JSON.stringify({checked_in: checkInState}),
    }
  );
}
