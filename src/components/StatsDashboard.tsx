'use client';

import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, Flame } from 'lucide-react';
import styles from './StatsDashboard.module.css';
import type { TodoStats } from '@/lib/types';

interface StatsDashboardProps {
  stats: TodoStats;
}

export function StatsDashboard({ stats }: StatsDashboardProps) {
  const { total, completed, pending, urgent, completedToday, completionRate } = stats;

  // SVG Circular progress math
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completionRate / 100) * circumference;

  let message = 'Ready to conquer your goals today?';
  if (total === 0) {
    message = 'Your task list is clear. Add a new task to get started!';
  } else if (completionRate === 100) {
    message = 'Incredible job! All tasks are completed today! 🎉';
  } else if (completionRate >= 60) {
    message = `Over halfway there! ${pending} remaining to hit the finish line.`;
  } else if (urgent > 0) {
    message = `Heads up: You have ${urgent} urgent ${urgent === 1 ? 'task' : 'tasks'} waiting.`;
  }

  return (
    <section className={styles.dashboardCard}>
      <div className={styles.content}>
        {/* Left: Progress Ring */}
        <div className={styles.progressRingWrapper}>
          <svg className={styles.progressSvg} width="96" height="96" viewBox="0 0 96 96">
            <circle
              className={styles.progressBg}
              cx="48"
              cy="48"
              r={radius}
              strokeWidth="7"
            />
            <circle
              className={styles.progressBar}
              cx="48"
              cy="48"
              r={radius}
              strokeWidth="7"
              style={{
                strokeDasharray: circumference,
                strokeDashoffset,
              }}
            />
          </svg>
          <div className={styles.progressTextCenter}>
            <span className={styles.progressValue}>{completionRate}%</span>
            <span className={styles.progressLabel}>Done</span>
          </div>
        </div>

        {/* Right: Quick Stats & Message */}
        <div className={styles.statsInfo}>
          <p className={styles.motivationalMessage}>{message}</p>

          <div className={styles.tilesGrid}>
            <div className={styles.statTile}>
              <div className={`${styles.tileIcon} ${styles.tileIconTotal}`}>
                <Clock size={16} />
              </div>
              <div>
                <span className={styles.tileNumber}>{pending}</span>
                <span className={styles.tileLabel}>Active</span>
              </div>
            </div>

            <div className={styles.statTile}>
              <div className={`${styles.tileIcon} ${styles.tileIconSuccess}`}>
                <CheckCircle2 size={16} />
              </div>
              <div>
                <span className={styles.tileNumber}>{completedToday}</span>
                <span className={styles.tileLabel}>Today</span>
              </div>
            </div>

            <div className={styles.statTile}>
              <div className={`${styles.tileIcon} ${styles.tileIconUrgent}`}>
                <AlertTriangle size={16} />
              </div>
              <div>
                <span className={styles.tileNumber}>{urgent}</span>
                <span className={styles.tileLabel}>Urgent</span>
              </div>
            </div>

            <div className={styles.statTile}>
              <div className={`${styles.tileIcon} ${styles.tileIconFlame}`}>
                <Flame size={16} />
              </div>
              <div>
                <span className={styles.tileNumber}>{completed}/{total}</span>
                <span className={styles.tileLabel}>Total</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
