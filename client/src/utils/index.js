export const daysLeft = (deadline) => {
  const difference = deadline - Math.floor(Date.now() / 1000); // Convert current time to seconds
  const remainingDays = difference / (60 * 60 * 24); // Convert seconds to days
  console.log("remainingDays", remainingDays);
  return Math.max(0, Math.ceil(remainingDays)); // Ensure no negative values
};
export const calculateBarPercentage = (goal, raisedAmount) => {
  const percentage = Math.round((raisedAmount * 100) / goal);

  return percentage;
};

export const checkIfImage = (url, callback) => {
  const img = new Image();
  img.src = url;

  if (img.complete) callback(true);

  img.onload = () => callback(true);
  img.onerror = () => callback(false);
};
