/**
 * Formats a date
 * @param dt
 */
export const formatDate = (dt: string | Date) => {
  if (dt instanceof Date) {
    return dt.toLocaleDateString();
  } else {
    return new Date(dt).toLocaleDateString();
  }
};

/**
 * Formats a datetime
 * @param dt
 */
export const formatDatetime = (dt: string | Date) => {
  if (dt instanceof Date) {
    return dt.toLocaleString();
  } else {
    return new Date(dt).toLocaleString();
  }
};
