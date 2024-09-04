import {isRecord} from './typeguards';

export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) {
    return true;
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    return deepEqualArray(a, b);
  }

  if (isRecord(a) && isRecord(b)) {
    return deepEqualObject(a, b);
  }

  return false;
}

function deepEqualArray(a: unknown[], b: unknown[]): boolean {
  if (a.length !== b.length) {
    return false;
  }

  for (let i = 0; i < a.length; i++) {
    if (!deepEqual(a[i], b[i])) {
      return false;
    }
  }
  return true;
}

function deepEqualObject(a: Record<string, unknown>, b: Record<string, unknown>): boolean {
  const keys = Object.keys(a);
  if (keys.length !== Object.keys(b).length) {
    return false;
  }

  for (const key of keys) {
    if (!deepEqual(a[key], b[key])) {
      return false;
    }
  }
  return true;
}
