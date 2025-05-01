// NEW Helper Function for Formatting Date Ranges (more flexible)
export function formatTaskDate(startDateStr, endDateStr) {
  if (!startDateStr) return ""; // No date if no start date

  try {
    const startDate = new Date(startDateStr);
    const endDate = endDateStr ? new Date(endDateStr) : null;

    const options = { month: "short", day: "numeric" }; // e.g., Dec 2

    const startFormatted = startDate.toLocaleDateString("en-US", options);

    if (endDate && startDate.toDateString() !== endDate.toDateString()) {
      // If end date exists and is different from start date
      const endFormatted = endDate.toLocaleDateString("en-US", options);
      if (startDate.getMonth() === endDate.getMonth()) {
        // Same month, different day: Dec 2 - 7
        return `${
          startFormatted.split(" ")[0]
        } ${startDate.getDate()} - ${endDate.getDate()}`;
      } else {
        // Different month: Dec 28 - Jan 5
        return `${startFormatted} - ${endFormatted}`;
      }
    } else {
      // Only start date or start/end are the same day: Dec 20 or Jan 4
      return startFormatted;
    }
  } catch (e) {
    console.error("Error formatting date:", startDateStr, endDateStr, e);
    // Fallback to simpler format or original strings if formatting fails
    return startDateStr
      ? `${startDateStr}${endDateStr ? ` - ${endDateStr}` : ""}`
      : "";
  }
}
