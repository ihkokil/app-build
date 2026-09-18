'use client';

import React from 'react';
import { CheckSquare, Calendar, BarChart3, Database, Plus } from 'lucide-react';
import styles from './MobileNavBar.module.css';
import { sound } from '@/lib/sound';

interface MobileNavBarProps {
  currentTab: 'all' | 'today' | 'stats' | 'db';
  onSelectTab: (tab: 'all' | 'today' | 'stats' | 'db') => void;
  onOpenCreate: () => void;
  urgentCount: number;
}

export function MobileNavBar({
  currentTab,
  onSelectTab,
  onOpenCreate,
  urgentCount,
}: MobileNavBarProps) {
  return (
    <nav className={styles.navBar} aria-label="Mobile Navigation">
      <div className={styles.navContainer}>
        {/* All Tasks Tab */}
        <button
          id="mobile-tab-all"
          className={`${styles.navItem} ${currentTab === 'all' ? styles.active : ''}`}
          onClick={() => {
            sound.playTap();
            onSelectTab('all');
          }}
          aria-label="All Tasks"
        >
          <CheckSquare size={20} className={styles.icon} />
          <span className={styles.label}>Tasks</span>
        </button>

        {/* Today Tab */}
        <button
          id="mobile-tab-today"
          className={`${styles.navItem} ${currentTab === 'today' ? styles.active : ''}`}
          onClick={() => {
            sound.playTap();
            onSelectTab('today');
          }}
          aria-label="Today's Tasks"
        >
          <div className={styles.iconWrapper}>
            <Calendar size={20} className={styles.icon} />
            {urgentCount > 0 && <span className={styles.badgeDot} />}
          </div>
          <span className={styles.label}>Today</span>
        </button>

        {/* Center Floating Action Button (+) */}
        <div className={styles.fabWrapper}>
          <button
            id="mobile-fab-create-btn"
            className={styles.fab}
            onClick={() => {
              sound.playTap();
              onOpenCreate();
            }}
            aria-label="Create new task"
          >
            <Plus size={26} className={styles.fabIcon} />
          </button>
        </div>

        {/* Stats Tab */}
        <button
          id="mobile-tab-stats"
          className={`${styles.navItem} ${currentTab === 'stats' ? styles.active : ''}`}
          onClick={() => {
            sound.playTap();
            onSelectTab('stats');
          }}
          aria-label="Productivity Analytics"
        >
          <BarChart3 size={20} className={styles.icon} />
          <span className={styles.label}>Stats</span>
        </button>

        {/* Database Tab */}
        <button
          id="mobile-tab-db"
          className={`${styles.navItem} ${currentTab === 'db' ? styles.active : ''}`}
          onClick={() => {
            sound.playTap();
            onSelectTab('db');
          }}
          aria-label="Database Settings"
        >
          <Database size={20} className={styles.icon} />
          <span className={styles.label}>MySQL</span>
        </button>
      </div>
    </nav>
  );
}
