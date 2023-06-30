/**
 * Formats a date object to a string in format DD:MM:YYYY hh:mm
 * @param date 
 * @returns String in format DD:MM:YYYY hh:mm
 */
export const formatDateObj = (date: Date) => {
    return `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}