export default function dateToTimestamp(date) {
  let dateObject;
  if (typeof date === 'string') {
    dateObject = new Date(date);
  } else {
    dateObject = date;
  }
  // return the timestamp in miliseconds
  return dateObject.getTime();
}
