export function titleCase(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function camelizeKey(key: string) {
  const [start, ...rest] = key.split('_');
  return start + rest.map(titleCase).join('');
}

export function camelizeKeys<T>(obj: T): T {
  if (Array.isArray(obj)) {
    return obj.map(camelizeKeys) as unknown as T;
  } else if (obj === null) {
    return obj;
  } else if (typeof obj === 'object') {
    const camelized: {[key: string]: unknown} = {};
    for (const key in obj) {
      camelized[camelizeKey(key)] = camelizeKeys(obj[key]);
    }
    return camelized as unknown as T;
  }
  return obj;
}
