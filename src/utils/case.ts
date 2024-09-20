export function titleCase(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function camelizeKey(key: string) {
  const [start, ...rest] = key.split('_');
  return start + rest.map(titleCase).join('');
}

export function camelizeKeys<T>(obj: T[]): T[];
export function camelizeKeys<T>(obj: T): T;
export function camelizeKeys<T>(obj: T | T[]): T | T[] {
  if (obj === null) {
    return obj;
  } else if (Array.isArray(obj)) {
    return obj.map(t => camelizeKeys(t));
  } else if (typeof obj === 'object') {
    const camelized: {[key: string]: unknown} = {};
    for (const key in obj) {
      const value = obj[key];
      camelized[camelizeKey(key)] = camelizeKeys(value);
    }
    return camelized as T;
  }
  return obj;
}
