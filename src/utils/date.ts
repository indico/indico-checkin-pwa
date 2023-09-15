/**
 * Formats a date
 * @param dt
 */
export const formatDate = (dt: string | Date) => {
  if (!(dt instanceof Date)) {
    dt = new Date(dt);
  }
  return dt.toLocaleDateString(undefined, {dateStyle: 'short'});
};

/**
 * Formats a datetime
 * @param dt
 */
export const formatDatetime = (dt: string | Date) => {
  if (!(dt instanceof Date)) {
    dt = new Date(dt);
  }
  return dt.toLocaleString(undefined, {dateStyle: 'short', timeStyle: 'short'});
};
