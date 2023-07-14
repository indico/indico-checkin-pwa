/**
 *
 * @param url
 * @param options
 * @returns
 */
export const authFetch = async (url: string, options: RequestInit, token: string) => {
  try {
    // TODO: Fix this
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status === 401) {
      throw new Error('Unauthorized');
    }

    return response;
  } catch (error) {
    console.error(error);
  }
};
