/**
 * Validates if a Date object is valid
 * @param date The Date object to validate
 * @returns true if the date is valid, false otherwise
 */
export const isValidDate = (date: Date | null | undefined): date is Date => {
  return date != null && !isNaN(date.getTime());
};
