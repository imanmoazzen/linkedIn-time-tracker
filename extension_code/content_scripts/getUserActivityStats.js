export function getUserActivityStats(sessions) {
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0]; // YYYY-MM-DD
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  let dailyTotals = {}; // Stores { YYYY-MM-DD: total_duration }
  let todayTotal = 0;
  let yesterdayTotal = 0;
  let counterToday = 0;
  let counterYesterday = 0;

  sessions.forEach(({ duration, timestamp }) => {
    const date = timestamp.split("T")[0]; // Extract YYYY-MM-DD

    if (!dailyTotals[date]) {
      dailyTotals[date] = 0;
    }
    dailyTotals[date] += duration;

    if (date === todayStr) {
      todayTotal += duration;
      counterToday++;
    }
    if (date === yesterdayStr) {
      yesterdayTotal += duration;
      counterYesterday++;
    }
  });

  // Compute last 7 days' average
  const last7Days = Object.keys(dailyTotals)
    .sort((a, b) => new Date(b) - new Date(a)) // Sort latest first
    .slice(0, 7) // Keep last 7 days
    .map((date) => dailyTotals[date]); // Extract durations

  const weeklyAvg = last7Days.length > 0 ? last7Days.reduce((sum, d) => sum + d, 0) / last7Days.length : 0;

  // Function to convert seconds to "HH hours, MM minutes, SS seconds"
  function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    let timeStr = "";
    if (hours > 0) timeStr += `${hours} hr${hours > 1 ? "s" : ""}, `;
    if (minutes > 0) timeStr += `${minutes} min${minutes > 1 ? "s" : ""}, `;
    timeStr += `${secs} sec${secs > 1 ? "s" : ""}`;

    return timeStr;
  }

  return {
    todayTotal: formatTime(todayTotal),
    yesterdayTotal: formatTime(yesterdayTotal),
    weeklyAvg: formatTime(weeklyAvg),
    counterToday,
    counterYesterday,
  };
}
