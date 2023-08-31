import {useEffect, useState} from 'react';
import {Event, Participant, Regform, Server} from '../db/db';
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

interface Response {
  ok: boolean;
  status?: number;
  aborted?: boolean;
  network?: boolean;
  err?: any;
  data?: any;
}

async function makeRequest(
  server: {baseUrl: string; authToken: string},
  endpoint: string,
  options: object = {}
): Promise<Response> {
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

export async function getEvent(server: Server, event: Event, options?: object) {
  return makeRequest(server, `api/checkin/event/${event.indicoId}`, options);
}

export async function getRegform(server: Server, event: Event, regform: Regform, options?: object) {
  return makeRequest(
    server,
    `api/checkin/event/${event.indicoId}/registration/${regform.indicoId}`,
    options
  );
}

export async function getRegforms(server: Server, event: Event, options?: object) {
  return makeRequest(server, `api/checkin/event/${event.indicoId}/registrations`, options);
}

export async function getParticipant(
  server: Server,
  event: Event,
  regform: Regform,
  participant: Participant,
  options?: object
) {
  return makeRequest(
    server,
    `api/checkin/event/${event.indicoId}/registration/${regform.indicoId}/${participant.indicoId}`,
    options
  );
}

export async function getParticipants(
  server: Server,
  event: Event,
  regform: Regform,
  options?: object
) {
  return makeRequest(
    server,
    `api/checkin/event/${event.indicoId}/registration/${regform.indicoId}/registrations`,
    options
  );
}

export async function checkInParticipant(
  server: Server,
  event: Event,
  regform: Regform,
  participant: Participant,
  checkInState: boolean
) {
  return makeRequest(
    server,
    `api/checkin/event/${event.indicoId}/registration/${regform.indicoId}/${participant.indicoId}`,
    {
      method: 'PATCH',
      body: JSON.stringify({checked_in: checkInState}),
    }
  );
}
