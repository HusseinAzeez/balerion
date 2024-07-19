export function hasPassedDaysAgo(date: Date, days: number): boolean {
  if (!date) return false;

  const currentDate = new Date();

  // Calculate the difference in milliseconds
  const diffInMs: number = currentDate.valueOf() - date.valueOf();

  // Convert milliseconds to days
  const daysDiff = diffInMs / (1000 * 60 * 60 * 24);

  return daysDiff >= days;
}
