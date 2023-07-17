import db from '../db/db';

/**
 *
 * @param url - The Request URL
 * @param options - The options to pass to the fetch function
 * @param serverBaseUrl - The base url of the server
 * @returns The response from the fetch function
 * @throws {Error} if an error occurs during the fetch
 */
export const authFetch = async (url: string, options: RequestInit, serverBaseUrl: string) => {
  try {
    // Get the token from IndexedDB Server Table
    const server = await db.servers.get({base_url: serverBaseUrl});
    if (!server) {
      throw new Error('Unable to retrieve the server');
    }
    const token = server.auth_token;

    // TODO: Fix this
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options?.headers,
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status === 401) {
      throw new Error('Unauthorized');
      // TODO: Handle refreshing the token?
    }

    return response;
  } catch (error) {
    console.error(error);
  }
};
