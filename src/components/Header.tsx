'use client';

import React from 'react';
import { Sparkles, Database, Sun, Moon, Volume2, VolumeX, Plus } from 'lucide-react';
import styles from './Header.module.css';
import type { DbHealthResult } from '@/lib/types';
import { sound } from '@/lib/sound';

interface HeaderProps {
  health: DbHealthResult | null;
  onOpenDbModal: () => void;
  onOpenCreateModal: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export function Header({
  health,
  onOpenDbModal,
  onOpenCreateModal,
  isDark,
  onToggleTheme,
}: HeaderProps) {
  const [muted, setMuted] = React.useState(false);

  const handleToggleSound = () => {
    const isNowMuted = sound.toggleMute();
    setMuted(isNowMuted);
  };

  const isConnected = health?.connected ?? false;

  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Brand */}
        <div className={styles.brandGroup}>
          <div className={styles.logoBadge}>
            <Sparkles className={styles.logoIcon} size={22} />
          </div>
          <div>
            <h1 className={styles.title}>OmniTask</h1>
            <p className={styles.dateSubtitle}>{todayFormatted}</p>
          </div>
        </div>

        {/* Actions & DB indicator */}
        <div className={styles.actions}>
          {/* Database Status Button */}
          <button
            id="db-status-button"
            className={`${styles.dbBadge} ${isConnected ? styles.dbConnected : styles.dbFallback}`}
            onClick={() => {
              sound.playTap();
              onOpenDbModal();
            }}
            title={
              isConnected
                ? `MySQL Connected (${health?.latencyMs ?? 0}ms)`
                : 'MySQL Offline - Running in Local Fallback Mode (Click to configure)'
            }
          >
            <span className={styles.statusDot} />
            <Database size={14} className={styles.dbIcon} />
            <span className={styles.dbText}>
              {isConnected ? `MySQL Connected (${health?.latencyMs}ms)` : 'Storage: Fallback'}
            </span>
          </button>

          {/* Sound Toggle */}
          <button
            id="sound-toggle-btn"
            className={styles.iconButton}
            onClick={handleToggleSound}
            aria-label={muted ? 'Unmute sound effects' : 'Mute sound effects'}
            title={muted ? 'Enable sound' : 'Mute sound'}
          >
            {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          {/* Theme Toggle */}
          <button
            id="theme-toggle-btn"
            className={styles.iconButton}
            onClick={() => {
              sound.playTap();
              onToggleTheme();
            }}
            aria-label="Toggle theme"
            title="Toggle theme"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Desktop New Task Button */}
          <button
            id="desktop-add-task-btn"
            className={styles.primaryButton}
            onClick={() => {
              sound.playTap();
              onOpenCreateModal();
            }}
          >
            <Plus size={18} />
            <span>New Task</span>
          </button>
        </div>
      </div>
    </header>
  );
}
