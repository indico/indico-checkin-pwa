import {useLiveQuery} from 'dexie-react-hooks';

export const LOADING: unique symbol = Symbol('loading');

export function isLoading(v: object | typeof LOADING | undefined): v is typeof LOADING {
  return v === LOADING;
}

export function hasValue(v: object | typeof LOADING | undefined): v is object {
  return !isLoading(v) && v !== undefined;
}

export function useQuery<T>(query: () => Promise<T> | T, deps: any[] = []): T | typeof LOADING {
  return useLiveQuery(query, deps, LOADING);
}
