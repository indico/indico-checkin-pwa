export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) {
    return true;
  }

  if (a === null || b === null) {
    return false;
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    return deepEqualArray(a, b);
  }

  if (typeof a === 'object' && typeof b === 'object') {
    return deepEqualObject(a as Record<string, unknown>, b as Record<string, unknown>);
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
