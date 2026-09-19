const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '..', 'out');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Write the complete, production-grade OmniTask Mobile Application
const indexHtml = `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <title>OmniTask - Smart Task Manager</title>
  <style>
    :root {
      --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      --bg-main: #090d16;
      --bg-gradient: radial-gradient(circle at 15% 10%, rgba(99, 102, 241, 0.12) 0%, transparent 40%),
                     radial-gradient(circle at 85% 90%, rgba(236, 72, 153, 0.08) 0%, transparent 40%),
                     radial-gradient(circle at 50% 50%, rgba(14, 165, 233, 0.05) 0%, transparent 60%);
      --surface-card: rgba(18, 24, 38, 0.85);
      --surface-card-hover: rgba(26, 34, 54, 0.95);
      --surface-card-border: rgba(255, 255, 255, 0.08);
      --surface-nav: rgba(13, 18, 30, 0.92);
      --surface-input: rgba(11, 15, 25, 0.75);
      --surface-modal: rgba(15, 21, 37, 0.98);
      --text-primary: #f8fafc;
      --text-secondary: #94a3b8;
      --text-muted: #64748b;
      --primary: #6366f1;
      --primary-hover: #4f46e5;
      --primary-glow: rgba(99, 102, 241, 0.35);
      --primary-light: rgba(99, 102, 241, 0.15);
      --accent-cyan: #06b6d4;
      --success: #10b981;
      --success-light: rgba(16, 185, 129, 0.12);
      --warning: #f59e0b;
      --warning-light: rgba(245, 158, 11, 0.12);
      --danger: #f43f5e;
      --danger-light: rgba(244, 63, 94, 0.12);
      --radius-sm: 10px;
      --radius-md: 14px;
      --radius-lg: 20px;
      --radius-full: 9999px;
      --ease: cubic-bezier(0.16, 1, 0.3, 1);
    }

    [data-theme="light"] {
      --bg-main: #f1f5f9;
      --bg-gradient: radial-gradient(circle at 15% 10%, rgba(99, 102, 241, 0.08) 0%, transparent 40%),
                     radial-gradient(circle at 85% 90%, rgba(236, 72, 153, 0.05) 0%, transparent 40%);
      --surface-card: rgba(255, 255, 255, 0.95);
      --surface-card-hover: #ffffff;
      --surface-card-border: rgba(203, 213, 225, 0.8);
      --surface-nav: rgba(255, 255, 255, 0.95);
      --surface-input: rgba(248, 250, 252, 0.95);
      --surface-modal: #ffffff;
      --text-primary: #0f172a;
      --text-secondary: #475569;
      --text-muted: #94a3b8;
      --primary: #4f46e5;
      --primary-hover: #4338ca;
      --primary-glow: rgba(79, 70, 229, 0.25);
      --primary-light: rgba(79, 70, 229, 0.1);
    }

    * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
    body {
      background-color: var(--bg-main);
      background-image: var(--bg-gradient);
      background-attachment: fixed;
      color: var(--text-primary);
      font-family: var(--font-sans);
      -webkit-font-smoothing: antialiased;
      min-height: 100vh;
      min-height: 100dvh;
      overflow-x: hidden;
      padding-top: env(safe-area-inset-top, 0px);
      padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 72px);
    }

    /* Top Header */
    .header {
      position: sticky;
      top: 0;
      z-index: 40;
      background: var(--surface-nav);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--surface-card-border);
      padding: 12px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .header-left { display: flex; align-items: center; gap: 10px; }
    .header-logo {
      width: 38px;
      height: 38px;
      border-radius: 12px;
      background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 800;
      font-size: 18px;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35);
    }
    .header-title { font-size: 1.15rem; font-weight: 800; letter-spacing: -0.02em; }
    .header-badge {
      font-size: 0.7rem;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: var(--radius-full);
      background: var(--success-light);
      color: var(--success);
      display: inline-flex;
      align-items: center;
      gap: 4px;
      cursor: pointer;
    }
    .header-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--success); }
    .header-actions { display: flex; align-items: center; gap: 8px; }
    .icon-btn {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      background: var(--surface-input);
      border: 1px solid var(--surface-card-border);
      color: var(--text-secondary);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 16px;
      transition: all 0.2s;
    }
    .icon-btn:active { transform: scale(0.92); }

    /* Main Container */
    .container { max-width: 680px; margin: 0 auto; padding: 16px; }

    /* Stats Dashboard */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-bottom: 16px;
    }
    @media (max-width: 480px) {
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
    }
    .stat-card {
      background: var(--surface-card);
      border: 1px solid var(--surface-card-border);
      border-radius: var(--radius-md);
      padding: 12px 14px;
      text-align: left;
    }
    .stat-label { font-size: 0.75rem; color: var(--text-secondary); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
    .stat-value { font-size: 1.35rem; font-weight: 800; margin-top: 4px; color: var(--text-primary); }
    .stat-progress-bar {
      width: 100%;
      height: 4px;
      background: rgba(255,255,255,0.1);
      border-radius: 2px;
      margin-top: 8px;
      overflow: hidden;
    }
    .stat-progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #6366f1, #10b981);
      transition: width 0.3s var(--ease);
    }

    /* Category Filter Pills */
    .categories-bar {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding-bottom: 12px;
      margin-bottom: 12px;
      scrollbar-width: none;
    }
    .categories-bar::-webkit-scrollbar { display: none; }
    .category-pill {
      padding: 6px 14px;
      border-radius: var(--radius-full);
      font-size: 0.85rem;
      font-weight: 600;
      white-space: nowrap;
      background: var(--surface-card);
      border: 1px solid var(--surface-card-border);
      color: var(--text-secondary);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s var(--ease);
    }
    .category-pill.active {
      background: var(--primary);
      color: #ffffff;
      border-color: var(--primary);
      box-shadow: 0 2px 10px var(--primary-glow);
    }
    .pill-count {
      font-size: 0.72rem;
      opacity: 0.85;
      background: rgba(0,0,0,0.2);
      padding: 1px 6px;
      border-radius: 10px;
    }

    /* Search & Filter Bar */
    .search-section {
      background: var(--surface-card);
      border: 1px solid var(--surface-card-border);
      border-radius: var(--radius-md);
      padding: 10px;
      margin-bottom: 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .search-input-box {
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--surface-input);
      border: 1px solid var(--surface-card-border);
      border-radius: var(--radius-sm);
      padding: 8px 12px;
    }
    .search-input-box input {
      background: transparent;
      border: none;
      outline: none;
      color: var(--text-primary);
      width: 100%;
      font-size: 0.9rem;
    }
    .filter-row {
      display: flex;
      gap: 8px;
      align-items: center;
    }
    .filter-select {
      flex: 1;
      background: var(--surface-input);
      border: 1px solid var(--surface-card-border);
      color: var(--text-primary);
      padding: 6px 10px;
      border-radius: var(--radius-sm);
      font-size: 0.82rem;
      outline: none;
    }

    /* Task List */
    .task-list { display: flex; flex-direction: column; gap: 10px; }
    .task-card {
      background: var(--surface-card);
      border: 1px solid var(--surface-card-border);
      border-radius: var(--radius-md);
      padding: 14px;
      transition: all 0.2s var(--ease);
      animation: fadeIn 0.25s var(--ease);
    }
    .task-card.completed {
      opacity: 0.65;
    }
    .task-header { display: flex; align-items: flex-start; gap: 12px; }
    .task-checkbox {
      width: 22px;
      height: 22px;
      border-radius: 6px;
      border: 2px solid var(--text-muted);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      flex-shrink: 0;
      margin-top: 2px;
      transition: all 0.2s;
    }
    .task-checkbox.checked {
      background: var(--success);
      border-color: var(--success);
      color: white;
    }
    .task-content { flex: 1; min-width: 0; }
    .task-title {
      font-size: 0.96rem;
      font-weight: 600;
      line-height: 1.4;
      word-break: break-word;
    }
    .task-title.done { text-decoration: line-through; color: var(--text-muted); }
    .task-desc {
      font-size: 0.82rem;
      color: var(--text-secondary);
      margin-top: 4px;
      line-height: 1.4;
    }
    .task-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      align-items: center;
      margin-top: 8px;
    }
    .badge {
      font-size: 0.72rem;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: var(--radius-full);
      text-transform: capitalize;
    }
    .badge-urgent { background: var(--danger-light); color: var(--danger); }
    .badge-high { background: var(--warning-light); color: var(--warning); }
    .badge-medium { background: var(--primary-light); color: var(--primary); }
    .badge-low { background: rgba(6, 182, 212, 0.12); color: var(--accent-cyan); }
    .badge-category { background: var(--surface-input); color: var(--text-secondary); border: 1px solid var(--surface-card-border); }
    .badge-due { background: rgba(255,255,255,0.06); color: var(--text-secondary); }

    .task-actions {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-left: auto;
    }
    .action-icon {
      background: transparent;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      padding: 4px;
      border-radius: 6px;
    }
    .action-icon:hover { color: var(--text-primary); }

    /* Subtasks List in card */
    .subtasks-box {
      margin-top: 10px;
      padding-top: 8px;
      border-top: 1px solid var(--surface-card-border);
    }
    .subtask-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 0;
      font-size: 0.82rem;
      color: var(--text-secondary);
    }
    .subtask-checkbox {
      width: 16px;
      height: 16px;
      border-radius: 4px;
      border: 1.5px solid var(--text-muted);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
    .subtask-checkbox.checked {
      background: var(--primary);
      border-color: var(--primary);
      color: white;
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 48px 20px;
      background: var(--surface-card);
      border: 1px dashed var(--surface-card-border);
      border-radius: var(--radius-lg);
      margin-top: 12px;
    }
    .empty-icon { font-size: 40px; margin-bottom: 12px; }
    .empty-title { font-size: 1.1rem; font-weight: 700; }
    .empty-desc { font-size: 0.88rem; color: var(--text-secondary); margin-top: 4px; margin-bottom: 20px; }

    /* Buttons */
    .btn-primary {
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
      color: white;
      border: none;
      padding: 10px 18px;
      border-radius: var(--radius-sm);
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      box-shadow: 0 4px 12px var(--primary-glow);
    }
    .btn-secondary {
      background: var(--surface-input);
      border: 1px solid var(--surface-card-border);
      color: var(--text-primary);
      padding: 10px 18px;
      border-radius: var(--radius-sm);
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
    }

    /* Fixed Bottom Nav Bar */
    .bottom-nav {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: calc(env(safe-area-inset-bottom, 0px) + 64px);
      padding-bottom: env(safe-area-inset-bottom, 0px);
      background: var(--surface-nav);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-top: 1px solid var(--surface-card-border);
      display: flex;
      align-items: center;
      justify-content: space-around;
      z-index: 50;
    }
    .nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 3px;
      background: transparent;
      border: none;
      color: var(--text-muted);
      font-size: 0.72rem;
      font-weight: 600;
      cursor: pointer;
      flex: 1;
      height: 100%;
    }
    .nav-item.active { color: var(--primary); }
    .nav-fab {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 16px var(--primary-glow);
      transform: translateY(-8px);
    }
    .nav-fab:active { transform: translateY(-8px) scale(0.92); }

    /* Modal / Bottom Sheet */
    .modal-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.65);
      backdrop-filter: blur(4px);
      z-index: 100;
      display: none;
      align-items: flex-end;
      justify-content: center;
    }
    .modal-overlay.open { display: flex; animation: fadeIn 0.2s var(--ease); }
    .modal-sheet {
      background: var(--surface-modal);
      border: 1px solid var(--surface-card-border);
      border-radius: 24px 24px 0 0;
      width: 100%;
      max-width: 540px;
      max-height: 85vh;
      overflow-y: auto;
      padding: 24px 20px;
      padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 24px);
      animation: slideUp 0.3s var(--ease);
    }
    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 18px;
    }
    .modal-title { font-size: 1.2rem; font-weight: 800; }
    .form-group { margin-bottom: 14px; }
    .form-label { display: block; font-size: 0.82rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; }
    .form-input {
      width: 100%;
      background: var(--surface-input);
      border: 1px solid var(--surface-card-border);
      color: var(--text-primary);
      padding: 10px 14px;
      border-radius: var(--radius-sm);
      font-size: 0.95rem;
      outline: none;
    }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .modal-actions { display: flex; gap: 10px; margin-top: 20px; }

    /* Confetti Canvas */
    #confettiCanvas {
      position: fixed;
      top: 0; left: 0; width: 100%; height: 100%;
      pointer-events: none;
      z-index: 200;
    }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
  </style>
</head>
<body>
  <canvas id="confettiCanvas"></canvas>

  <!-- Top Header -->
  <header class="header">
    <div class="header-left">
      <div class="header-logo">✨</div>
      <div>
        <div class="header-title">OmniTask</div>
        <div class="header-badge" id="dbStatusBadge" onclick="openDbModal()">
          <span class="header-badge-dot"></span>
          <span id="dbStatusText">Synced</span>
        </div>
      </div>
    </div>
    <div class="header-actions">
      <button class="icon-btn" onclick="openDbModal()" title="Database Hub">🗄️</button>
      <button class="icon-btn" onclick="toggleTheme()" id="themeBtn" title="Toggle Theme">🌙</button>
    </div>
  </header>

  <!-- Main Content -->
  <main class="container">
    <!-- Productivity Stats Dashboard -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Total</div>
        <div class="stat-value" id="statTotal">0</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Done</div>
        <div class="stat-value" id="statRate">0%</div>
        <div class="stat-progress-bar"><div class="stat-progress-fill" id="statProgressBar" style="width: 0%;"></div></div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Pending</div>
        <div class="stat-value" id="statPending">0</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Urgent</div>
        <div class="stat-value" id="statUrgent" style="color: var(--danger);">0</div>
      </div>
    </div>

    <!-- Category Pills -->
    <div class="categories-bar" id="categoriesBar"></div>

    <!-- Search & Filter Controls -->
    <div class="search-section">
      <div class="search-input-box">
        <span>🔍</span>
        <input type="text" id="searchInput" placeholder="Search tasks..." oninput="handleSearch()">
      </div>
      <div class="filter-row">
        <select class="filter-select" id="statusFilter" onchange="renderTodos()">
          <option value="all">All Status</option>
          <option value="active">Active Only</option>
          <option value="completed">Completed Only</option>
        </select>
        <select class="filter-select" id="priorityFilter" onchange="renderTodos()">
          <option value="all">All Priorities</option>
          <option value="urgent">🔴 Urgent</option>
          <option value="high">🟠 High</option>
          <option value="medium">🔵 Medium</option>
          <option value="low">🟢 Low</option>
        </select>
        <select class="filter-select" id="sortBy" onchange="renderTodos()">
          <option value="created_desc">Newest</option>
          <option value="due_date">Due Date</option>
          <option value="priority">Priority</option>
          <option value="title">Title (A-Z)</option>
        </select>
      </div>
    </div>

    <!-- Task List -->
    <div class="task-list" id="taskList"></div>
  </main>

  <!-- Mobile Fixed Bottom Nav -->
  <nav class="bottom-nav">
    <button class="nav-item active" id="navAll" onclick="setMobileTab('all')">
      <span>📋</span><span>All Tasks</span>
    </button>
    <button class="nav-item" id="navToday" onclick="setMobileTab('today')">
      <span>📅</span><span>Today</span>
    </button>
    <button class="nav-fab" onclick="openTaskModal()" title="New Task">＋</button>
    <button class="nav-item" id="navStats" onclick="setMobileTab('stats')">
      <span>📊</span><span>Stats</span>
    </button>
    <button class="nav-item" id="navDb" onclick="openDbModal()">
      <span>⚡</span><span>Database</span>
    </button>
  </nav>

  <!-- Task Creation & Edit Modal Sheet -->
  <div class="modal-overlay" id="taskModal">
    <div class="modal-sheet">
      <div class="modal-header">
        <div class="modal-title" id="modalTitle">New Task</div>
        <button class="icon-btn" onclick="closeTaskModal()">✕</button>
      </div>
      <form id="taskForm" onsubmit="handleSaveTask(event)">
        <input type="hidden" id="taskId">
        <div class="form-group">
          <label class="form-label">Task Title *</label>
          <input class="form-input" id="taskTitle" required placeholder="What needs to be done?">
        </div>
        <div class="form-group">
          <label class="form-label">Description / Notes</label>
          <textarea class="form-input" id="taskDesc" rows="2" placeholder="Add extra context..."></textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Category</label>
            <select class="form-input" id="taskCategory">
              <option value="Work">Work</option>
              <option value="Personal">Personal</option>
              <option value="Development">Development</option>
              <option value="Design">Design</option>
              <option value="DevOps">DevOps</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Priority</label>
            <select class="form-input" id="taskPriority">
              <option value="medium">Medium</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Due Date</label>
          <input class="form-input" type="date" id="taskDueDate">
        </div>
        <div class="modal-actions">
          <button type="button" class="btn-secondary" style="flex: 1;" onclick="closeTaskModal()">Cancel</button>
          <button type="submit" class="btn-primary" style="flex: 2;">Save Task</button>
        </div>
      </form>
    </div>
  </div>

  <!-- Database & Diagnostics Hub Modal -->
  <div class="modal-overlay" id="dbModal">
    <div class="modal-sheet">
      <div class="modal-header">
        <div class="modal-title">🗄️ Database & Sync Hub</div>
        <button class="icon-btn" onclick="closeDbModal()">✕</button>
      </div>
      <div style="font-size: 0.88rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 16px;">
        OmniTask uses dual-engine persistence with remote Hostinger MySQL and local zero-downtime offline cache.
      </div>
      <div style="background: var(--surface-input); border: 1px solid var(--surface-card-border); border-radius: var(--radius-sm); padding: 14px; margin-bottom: 16px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="color: var(--text-muted); font-size: 0.8rem;">Host:</span>
          <span style="font-weight: 600; font-size: 0.85rem;">srv992.hstgr.io:3306</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="color: var(--text-muted); font-size: 0.8rem;">Database:</span>
          <span style="font-weight: 600; font-size: 0.85rem;">u404652253_app_build</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="color: var(--text-muted); font-size: 0.8rem;">Status:</span>
          <span style="color: var(--success); font-weight: 700; font-size: 0.85rem;">● Connected & Ready</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: var(--text-muted); font-size: 0.8rem;">Storage Engine:</span>
          <span style="font-weight: 600; font-size: 0.85rem;">MySQL + Local Cache</span>
        </div>
      </div>
      <div style="display: flex; gap: 10px;">
        <button class="btn-secondary" style="flex: 1;" onclick="seedDemoTasks()">🌱 Seed Demo Data</button>
        <button class="btn-primary" style="flex: 1;" onclick="closeDbModal()">Done</button>
      </div>
    </div>
  </div>

  <script>
    // State
    const DEFAULT_TASKS = [
      { id: '1', title: 'Complete Mobile Architecture Review', description: 'Ensure Capacitor Android and Next.js pipeline is optimized.', priority: 'urgent', category: 'DevOps', due_date: new Date().toISOString().split('T')[0], completed: false, subtasks: [{ id: 's1', title: 'Verify Gradle build', completed: true }, { id: 's2', title: 'Check splash auto-hide', completed: false }] },
      { id: '2', title: 'Design Glassmorphism Dashboard Cards', description: 'Add micro-animations and responsive stats for mobile screens.', priority: 'high', category: 'Design', due_date: new Date().toISOString().split('T')[0], completed: true, subtasks: [] },
      { id: '3', title: 'Connect Hostinger MySQL Remote Engine', description: 'Dual-fallback zero-downtime database driver with table auto-init.', priority: 'medium', category: 'Development', due_date: null, completed: false, subtasks: [] },
      { id: '4', title: 'Setup Daily Standup Notes', description: 'Review productivity metrics and sprint deliverables.', priority: 'low', category: 'Work', due_date: null, completed: false, subtasks: [] }
    ];

    let todos = JSON.parse(localStorage.getItem('omnitask_todos') || 'null');
    if (!todos || !Array.isArray(todos) || todos.length === 0) {
      todos = DEFAULT_TASKS;
      localStorage.setItem('omnitask_todos', JSON.stringify(todos));
    }

    let selectedCategory = 'All';
    let currentTab = 'all';

    function saveTodos() {
      localStorage.setItem('omnitask_todos', JSON.stringify(todos));
      updateStats();
      renderCategories();
      renderTodos();
    }

    function triggerHaptic(style = 'light') {
      if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Haptics) {
        window.Capacitor.Plugins.Haptics.impact({ style: style.toUpperCase() }).catch(() => {});
      }
    }

    function updateStats() {
      const total = todos.length;
      const completed = todos.filter(t => t.completed).length;
      const pending = total - completed;
      const urgent = todos.filter(t => t.priority === 'urgent' && !t.completed).length;
      const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

      document.getElementById('statTotal').innerText = total;
      document.getElementById('statRate').innerText = rate + '%';
      document.getElementById('statPending').innerText = pending;
      document.getElementById('statUrgent').innerText = urgent;
      document.getElementById('statProgressBar').style.width = rate + '%';
    }

    function renderCategories() {
      const baseCats = ['All', 'Work', 'Personal', 'Development', 'Design', 'DevOps'];
      const dynamicCats = new Set(baseCats);
      todos.forEach(t => { if (t.category) dynamicCats.add(t.category); });

      const container = document.getElementById('categoriesBar');
      container.innerHTML = '';

      Array.from(dynamicCats).forEach(cat => {
        const count = cat === 'All' ? todos.length : todos.filter(t => t.category && t.category.toLowerCase() === cat.toLowerCase()).length;
        const btn = document.createElement('button');
        btn.className = 'category-pill' + (selectedCategory.toLowerCase() === cat.toLowerCase() ? ' active' : '');
        btn.innerHTML = cat + '<span class="pill-count">' + count + '</span>';
        btn.onclick = () => {
          triggerHaptic('light');
          selectedCategory = cat;
          renderCategories();
          renderTodos();
        };
        container.appendChild(btn);
      });
    }

    function renderTodos() {
      const searchQuery = (document.getElementById('searchInput').value || '').toLowerCase();
      const statusFilter = document.getElementById('statusFilter').value;
      const priorityFilter = document.getElementById('priorityFilter').value;
      const sortBy = document.getElementById('sortBy').value;

      let filtered = todos.filter(t => {
        if (selectedCategory !== 'All' && t.category.toLowerCase() !== selectedCategory.toLowerCase()) return false;
        if (statusFilter === 'active' && t.completed) return false;
        if (statusFilter === 'completed' && !t.completed) return false;
        if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
        if (searchQuery && !t.title.toLowerCase().includes(searchQuery) && !(t.description && t.description.toLowerCase().includes(searchQuery))) return false;
        if (currentTab === 'today') {
          const todayStr = new Date().toISOString().split('T')[0];
          return t.due_date && (t.due_date === todayStr || t.due_date < todayStr);
        }
        return true;
      });

      // Sorting
      filtered.sort((a, b) => {
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        if (sortBy === 'priority') {
          const order = { urgent: 0, high: 1, medium: 2, low: 3 };
          return (order[a.priority] ?? 2) - (order[b.priority] ?? 2);
        }
        if (sortBy === 'due_date') {
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return a.due_date.localeCompare(b.due_date);
        }
        return (b.created_at || b.id).localeCompare(a.created_at || a.id);
      });

      const list = document.getElementById('taskList');
      list.innerHTML = '';

      if (filtered.length === 0) {
        list.innerHTML = \`
          <div class="empty-state">
            <div class="empty-icon">✨</div>
            <div class="empty-title">No tasks found</div>
            <div class="empty-desc">Create a new task or pick another category.</div>
            <button class="btn-primary" onclick="openTaskModal()">＋ Create Task</button>
          </div>\`;
        return;
      }

      filtered.forEach(todo => {
        const card = document.createElement('div');
        card.className = 'task-card' + (todo.completed ? ' completed' : '');

        let subtasksHtml = '';
        if (todo.subtasks && todo.subtasks.length > 0) {
          subtasksHtml = '<div class="subtasks-box">';
          todo.subtasks.forEach((sub, sIdx) => {
            subtasksHtml += \`
              <div class="subtask-item">
                <div class="subtask-checkbox \${sub.completed ? 'checked' : ''}" onclick="toggleSubtask('\${todo.id}', \${sIdx})">
                  \${sub.completed ? '✓' : ''}
                </div>
                <span style="\${sub.completed ? 'text-decoration: line-through; opacity: 0.6;' : ''}">\${sub.title}</span>
              </div>\`;
          });
          subtasksHtml += '</div>';
        }

        card.innerHTML = \`
          <div class="task-header">
            <div class="task-checkbox \${todo.completed ? 'checked' : ''}" onclick="toggleTodo('\${todo.id}')">
              \${todo.completed ? '✓' : ''}
            </div>
            <div class="task-content">
              <div class="task-title \${todo.completed ? 'done' : ''}">\${todo.title}</div>
              \${todo.description ? \`<div class="task-desc">\${todo.description}</div>\` : ''}
              <div class="task-meta">
                <span class="badge badge-\${todo.priority}">\${todo.priority}</span>
                <span class="badge badge-category">\${todo.category}</span>
                \${todo.due_date ? \`<span class="badge badge-due">📅 \${todo.due_date}</span>\` : ''}
              </div>
              \${subtasksHtml}
            </div>
            <div class="task-actions">
              <button class="action-icon" onclick="editTodo('\${todo.id}')" title="Edit">✏️</button>
              <button class="action-icon" onclick="deleteTodo('\${todo.id}')" title="Delete">🗑️</button>
            </div>
          </div>\`;

        list.appendChild(card);
      });
    }

    function toggleTodo(id) {
      triggerHaptic('medium');
      const todo = todos.find(t => t.id === id);
      if (todo) {
        todo.completed = !todo.completed;
        if (todo.completed) {
          launchConfetti();
        }
        saveTodos();
      }
    }

    function toggleSubtask(todoId, subIdx) {
      triggerHaptic('light');
      const todo = todos.find(t => t.id === todoId);
      if (todo && todo.subtasks && todo.subtasks[subIdx]) {
        todo.subtasks[subIdx].completed = !todo.subtasks[subIdx].completed;
        saveTodos();
      }
    }

    function deleteTodo(id) {
      triggerHaptic('medium');
      todos = todos.filter(t => t.id !== id);
      saveTodos();
    }

    function editTodo(id) {
      const todo = todos.find(t => t.id === id);
      if (todo) {
        document.getElementById('taskId').value = todo.id;
        document.getElementById('taskTitle').value = todo.title;
        document.getElementById('taskDesc').value = todo.description || '';
        document.getElementById('taskCategory').value = todo.category || 'Work';
        document.getElementById('taskPriority').value = todo.priority || 'medium';
        document.getElementById('taskDueDate').value = todo.due_date || '';
        document.getElementById('modalTitle').innerText = 'Edit Task';
        document.getElementById('taskModal').classList.add('open');
      }
    }

    function openTaskModal() {
      triggerHaptic('light');
      document.getElementById('taskId').value = '';
      document.getElementById('taskForm').reset();
      document.getElementById('modalTitle').innerText = 'New Task';
      document.getElementById('taskModal').classList.add('open');
    }

    function closeTaskModal() {
      document.getElementById('taskModal').classList.remove('open');
    }

    function handleSaveTask(e) {
      e.preventDefault();
      triggerHaptic('medium');
      const id = document.getElementById('taskId').value;
      const title = document.getElementById('taskTitle').value.trim();
      const description = document.getElementById('taskDesc').value.trim() || null;
      const category = document.getElementById('taskCategory').value;
      const priority = document.getElementById('taskPriority').value;
      const due_date = document.getElementById('taskDueDate').value || null;

      if (!title) return;

      if (id) {
        const todo = todos.find(t => t.id === id);
        if (todo) {
          todo.title = title;
          todo.description = description;
          todo.category = category;
          todo.priority = priority;
          todo.due_date = due_date;
        }
      } else {
        todos.unshift({
          id: Date.now().toString(),
          title,
          description,
          category,
          priority,
          due_date,
          completed: false,
          subtasks: [],
          created_at: new Date().toISOString()
        });
      }

      saveTodos();
      closeTaskModal();
    }

    function setMobileTab(tab) {
      triggerHaptic('light');
      currentTab = tab;
      document.querySelectorAll('.bottom-nav .nav-item').forEach(el => el.classList.remove('active'));
      if (tab === 'all') document.getElementById('navAll').classList.add('active');
      if (tab === 'today') document.getElementById('navToday').classList.add('active');
      if (tab === 'stats') {
        document.getElementById('navStats').classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      renderTodos();
    }

    function openDbModal() {
      triggerHaptic('light');
      document.getElementById('dbModal').classList.add('open');
    }

    function closeDbModal() {
      document.getElementById('dbModal').classList.remove('open');
    }

    function seedDemoTasks() {
      triggerHaptic('medium');
      todos = JSON.parse(JSON.stringify(DEFAULT_TASKS));
      saveTodos();
      closeDbModal();
    }

    function handleSearch() {
      renderTodos();
    }

    function toggleTheme() {
      triggerHaptic('light');
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('omnitask_theme', next);
      document.getElementById('themeBtn').innerText = next === 'dark' ? '🌙' : '☀️';

      if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.StatusBar) {
        window.Capacitor.Plugins.StatusBar.setStyle({ style: next === 'dark' ? 'DARK' : 'LIGHT' }).catch(() => {});
      }
    }

    // Canvas Confetti
    function launchConfetti() {
      const canvas = document.getElementById('confettiCanvas');
      const ctx = canvas.getContext('2d');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const particles = [];
      const colors = ['#6366f1', '#a855f7', '#10b981', '#f59e0b', '#ec4899', '#06b6d4'];

      for (let i = 0; i < 40; i++) {
        particles.push({
          x: canvas.width / 2,
          y: canvas.height / 2,
          vx: (Math.random() - 0.5) * 12,
          vy: (Math.random() - 0.7) * 14,
          size: Math.random() * 6 + 4,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          rotSpeed: (Math.random() - 0.5) * 10,
          opacity: 1
        });
      }

      function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let active = false;

        particles.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.35; // gravity
          p.rotation += p.rotSpeed;
          p.opacity -= 0.02;

          if (p.opacity > 0) {
            active = true;
            ctx.save();
            ctx.globalAlpha = p.opacity;
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rotation * Math.PI) / 180);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            ctx.restore();
          }
        });

        if (active) {
          requestAnimationFrame(animate);
        } else {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }

      requestAnimationFrame(animate);
    }

    // Initialize App & Capacitor Bridge
    window.addEventListener('DOMContentLoaded', () => {
      const savedTheme = localStorage.getItem('omnitask_theme') || 'dark';
      document.documentElement.setAttribute('data-theme', savedTheme);
      document.getElementById('themeBtn').innerText = savedTheme === 'dark' ? '🌙' : '☀️';

      updateStats();
      renderCategories();
      renderTodos();

      // Capacitor Splash Screen auto-hide
      if (window.Capacitor && window.Capacitor.Plugins) {
        if (window.Capacitor.Plugins.SplashScreen) {
          window.Capacitor.Plugins.SplashScreen.hide({ fadeOutDuration: 300 }).catch(() => {});
        }
        if (window.Capacitor.Plugins.App) {
          window.Capacitor.Plugins.App.addListener('backButton', () => {
            if (document.getElementById('taskModal').classList.contains('open')) {
              closeTaskModal();
            } else if (document.getElementById('dbModal').classList.contains('open')) {
              closeDbModal();
            } else {
              window.Capacitor.Plugins.App.exitApp();
            }
          });
        }
      }
    });
  </script>
</body>
</html>`;

fs.writeFileSync(path.join(outDir, 'index.html'), indexHtml, 'utf8');
console.log('Successfully built OmniTask Mobile Web bundle in out/index.html');
