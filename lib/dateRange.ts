export function getDateRange(range: 'weekly' | 'monthly' | 'yearly') {
  const now = new Date();
  const start = new Date();

  if (range === 'weekly') {
    start.setDate(now.getDate() - 7);
  } else if (range === 'monthly') {
    start.setMonth(now.getMonth() - 1);
  } else if (range === 'yearly') {
    start.setFullYear(now.getFullYear() - 1);
  }

  return { start, end: now };
}