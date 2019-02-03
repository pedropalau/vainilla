import months from '../constants/months.js';

export default function formatPostDate(dateToParse, simple = false) {
  const date = typeof dateToParse === 'string'
    ? new Date(dateToParse)
    : dateToParse;

  if (simple) {
    return [
      // zero-based index
      date.getMonth() + 1,
      // zero-based day
      date.getDate() + 1,
      date.getFullYear(),
    ].join('/');
  }
  else {
    return [
      months[date.getMonth()],
      `${date.getDate() + 1},`,
      date.getFullYear(),
    ].join(' ');
  }
}
