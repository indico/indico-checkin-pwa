export function deepEqual(a: any, b: any): boolean {
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
    return deepEqualObject(a, b);
  }

  return false;
}

function deepEqualArray(a: any[], b: any[]): boolean {
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

function deepEqualObject(a: {[key: string]: any}, b: {[key: string]: any}): boolean {
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
