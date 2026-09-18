'use client';

import React, { useState } from 'react';
import {
  X,
  Database,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
  Server,
  ShieldCheck,
  Zap,
  Sparkles,
  FileCode,
} from 'lucide-react';
import styles from './DatabaseModal.module.css';
import type { DbHealthResult } from '@/lib/types';
import { sound } from '@/lib/sound';

interface DatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  health: DbHealthResult | null;
  onRefreshHealth: () => Promise<void>;
  onSeedData: () => Promise<void>;
}

export function DatabaseModal({
  isOpen,
  onClose,
  health,
  onRefreshHealth,
  onSeedData,
}: DatabaseModalProps) {
  const [isTesting, setIsTesting] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'status' | 'config' | 'schema'>('status');

  if (!isOpen) return null;

  const isConnected = health?.connected ?? false;

  const handleTestConnection = async () => {
    sound.playTap();
    setIsTesting(true);
    try {
      await onRefreshHealth();
    } finally {
      setIsTesting(false);
    }
  };

  const handleSeed = async () => {
    sound.playTap();
    setIsSeeding(true);
    try {
      await onSeedData();
    } finally {
      setIsSeeding(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    sound.playTap();
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const envSnippet = `# Set your Remote MySQL database credentials in .env.local
DB_HOST=${health?.host || 'your-remote-host.com'}
DB_PORT=${health?.port || 3306}
DB_USER=root
DB_PASSWORD=your_secure_password
DB_NAME=${health?.database || 'todo_db'}
DB_SSL=true # Set to true for remote AWS RDS, PlanetScale, Aiven, or Railway`;

  const sqlSnippet = `-- Execute on your remote MySQL server:
CREATE DATABASE IF NOT EXISTS todo_db;
USE todo_db;

CREATE TABLE IF NOT EXISTS todos (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  priority ENUM('low', 'medium', 'high', 'urgent') NOT NULL DEFAULT 'medium',
  category VARCHAR(50) NOT NULL DEFAULT 'General',
  due_date DATETIME NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at DATETIME NULL,
  subtasks JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_todos_status (completed),
  INDEX idx_todos_priority (priority),
  INDEX idx_todos_category (category),
  INDEX idx_todos_due_date (due_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="db-modal-title"
      >
        <div className={styles.dragHandle} />

        {/* Modal Header */}
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <div className={styles.dbIconWrapper}>
              <Database size={20} className={styles.dbIcon} />
            </div>
            <div>
              <h2 id="db-modal-title" className={styles.title}>
                MySQL Connection Hub
              </h2>
              <p className={styles.subtitle}>
                Dual-Engine Database Management & Remote Diagnostics
              </p>
            </div>
          </div>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className={styles.tabNav}>
          <button
            className={`${styles.tabBtn} ${activeTab === 'status' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('status')}
          >
            <Server size={14} />
            <span>Live Status</span>
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'config' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('config')}
          >
            <Zap size={14} />
            <span>Remote Setup (.env)</span>
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'schema' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('schema')}
          >
            <FileCode size={14} />
            <span>SQL Schema</span>
          </button>
        </div>

        {/* Body based on Tab */}
        <div className={styles.body}>
          {activeTab === 'status' && (
            <div className={styles.statusSection}>
              {/* Status Banner */}
              <div
                className={`${styles.statusBanner} ${
                  isConnected ? styles.bannerConnected : styles.bannerFallback
                }`}
              >
                <div className={styles.bannerIcon}>
                  {isConnected ? (
                    <CheckCircle2 size={24} className={styles.successColor} />
                  ) : (
                    <AlertCircle size={24} className={styles.warningColor} />
                  )}
                </div>
                <div className={styles.bannerContent}>
                  <h3 className={styles.bannerTitle}>
                    {isConnected
                      ? 'Live Remote MySQL Active'
                      : 'Dual-Engine Fallback Active'}
                  </h3>
                  <p className={styles.bannerDesc}>
                    {isConnected
                      ? `Queries are executing directly on MySQL (${health?.latencyMs}ms ping).`
                      : 'MySQL server is offline or unreachable. Tasks are stored safely in local runtime storage with 0 downtime.'}
                  </p>
                </div>
              </div>

              {/* Server Parameters Grid */}
              <div className={styles.paramsGrid}>
                <div className={styles.paramItem}>
                  <span className={styles.paramLabel}>Target Host</span>
                  <span className={styles.paramValue}>{health?.host || 'localhost'}</span>
                </div>
                <div className={styles.paramItem}>
                  <span className={styles.paramLabel}>Port</span>
                  <span className={styles.paramValue}>{health?.port || 3306}</span>
                </div>
                <div className={styles.paramItem}>
                  <span className={styles.paramLabel}>Database</span>
                  <span className={styles.paramValue}>{health?.database || 'todo_db'}</span>
                </div>
                <div className={styles.paramItem}>
                  <span className={styles.paramLabel}>Engine Mode</span>
                  <span className={styles.paramValue}>
                    {isConnected ? 'Remote MySQL' : 'In-Memory Mirror'}
                  </span>
                </div>
                <div className={styles.paramItem}>
                  <span className={styles.paramLabel}>Round-Trip Latency</span>
                  <span className={styles.paramValue}>
                    {isConnected ? `${health?.latencyMs} ms` : 'N/A (Offline)'}
                  </span>
                </div>
                <div className={styles.paramItem}>
                  <span className={styles.paramLabel}>Table Schema</span>
                  <span className={styles.paramValue}>
                    {health?.tableReady ? 'Verified (todos)' : 'Pending Connection'}
                  </span>
                </div>
              </div>

              {health?.error && (
                <div className={styles.errorBox}>
                  <p className={styles.errorBoxTitle}>Last Connection Error</p>
                  <code className={styles.errorText}>{health.error}</code>
                </div>
              )}

              {/* Action Buttons */}
              <div className={styles.actionsRow}>
                <button
                  id="test-db-connection-btn"
                  className={styles.testBtn}
                  onClick={handleTestConnection}
                  disabled={isTesting}
                >
                  <RefreshCw
                    size={15}
                    className={isTesting ? styles.rotating : ''}
                  />
                  <span>{isTesting ? 'Testing Handshake...' : 'Test Connection'}</span>
                </button>

                <button
                  id="seed-demo-tasks-btn"
                  className={styles.seedBtn}
                  onClick={handleSeed}
                  disabled={isSeeding}
                >
                  <Sparkles size={15} />
                  <span>{isSeeding ? 'Seeding...' : 'Load Demo Tasks'}</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'config' && (
            <div className={styles.configSection}>
              <div className={styles.infoBanner}>
                <ShieldCheck size={18} className={styles.infoIcon} />
                <p>
                  Connect your remote MySQL instance (AWS RDS, PlanetScale, Aiven, Railway, or remote VPS) by updating your <code className={styles.inlineCode}>.env.local</code> file in this project root:
                </p>
              </div>

              <div className={styles.codeBlockWrapper}>
                <div className={styles.codeHeader}>
                  <span>.env.local</span>
                  <button
                    className={styles.copyBtn}
                    onClick={() => copyToClipboard(envSnippet, 'env')}
                  >
                    {copiedKey === 'env' ? (
                      <>
                        <Check size={13} /> Copied
                      </>
                    ) : (
                      <>
                        <Copy size={13} /> Copy
                      </>
                    )}
                  </button>
                </div>
                <pre className={styles.codePre}>{envSnippet}</pre>
              </div>

              <div className={styles.tipBox}>
                <p className={styles.tipTitle}>💡 Remote Cloud Hosting Tip</p>
                <p className={styles.tipText}>
                  Cloud database providers enforce SSL connections. Set <code className={styles.inlineCode}>DB_SSL=true</code> to enable TLS handshake with <code className={styles.inlineCode}>rejectUnauthorized: false</code>.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'schema' && (
            <div className={styles.schemaSection}>
              <p className={styles.schemaIntro}>
                The app automatically executes table creation on cold start. You can also run this SQL script manually in MySQL Workbench, phpMyAdmin, or CLI:
              </p>

              <div className={styles.codeBlockWrapper}>
                <div className={styles.codeHeader}>
                  <span>schema.sql</span>
                  <button
                    className={styles.copyBtn}
                    onClick={() => copyToClipboard(sqlSnippet, 'sql')}
                  >
                    {copiedKey === 'sql' ? (
                      <>
                        <Check size={13} /> Copied
                      </>
                    ) : (
                      <>
                        <Copy size={13} /> Copy
                      </>
                    )}
                  </button>
                </div>
                <pre className={styles.codePre}>{sqlSnippet}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
