import db from '../db/db';

/**
 * @param serverBaseUrl - The base url of the server
 * @param url - The Request URL
 * @param options - The options to pass to the fetch function
 * @returns The response from the fetch function
 * @throws {Error} if an error occurs during the fetch
 */
export const authFetch = async (
  serverBaseUrl: string,
  urlSuffix: string,
  options: RequestInit = {}
) => {
  try {
    // Get the token from IndexedDB Server Table
    const server = await db.servers.get({base_url: serverBaseUrl});
    if (!server) {
      throw new Error('Unable to retrieve the server');
    }
    const token = server.auth_token;

    const fullUrl = serverBaseUrl + urlSuffix;

    const response = await fetch(fullUrl, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // Throw Mock Error
    if (urlSuffix.length > 30) {
      throw new Error('Mock Error ' + urlSuffix);
    }

    // console.log('response:', response);
    const data = await response.json();
    // console.log('data:', data);

    // Check if the data is ok
    if (!response.ok) {
      console.log('Error in authFetch: ', response.statusText);
      return Promise.reject(response.statusText);
    }

    return Promise.resolve(data);
    /* if (response.status === 401) {
      throw new Error('Unauthorized');
      // TODO: Handle refreshing the token?
    }
    return response; */
  } catch (error) {
    console.log('[authFetch] Error: ', error);
    return Promise.reject(error);
  }
};
