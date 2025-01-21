import { useEffect, useState } from "react";

import { getUserActivityStats } from "./getUserActivityStats.js";
import styles from "./Panel.module.css";

export const Panel = () => {
  const [stats, setStats] = useState({});

  useEffect(() => {
    chrome.storage.local.get(["linkedinSessions"], (result) => {
      setStats(getUserActivityStats(result.linkedinSessions));
    });
  }, []);

  return (
    <div className={styles.mainContainer}>
      <div className={styles.title}>
        <span className="material-symbols-outlined">schedule</span>
        <h3>Time Spent On LinkedIn</h3>
      </div>

      <div className={styles.durations}>
        <section>
          <strong>Today</strong>
          <span>{`${stats.counterToday} Visits, ${stats.todayTotal}`}</span>
        </section>
        <section>
          <strong>Yesterday</strong>
          <span>{`${stats.counterYesterday} Visits, ${stats.yesterdayTotal}`}</span>
        </section>
        <section>
          <strong>Weekly Average</strong> <span> {stats.weeklyAvg}</span>
        </section>
      </div>
    </div>
  );
};
