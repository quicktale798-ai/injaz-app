import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://gkzdepanaphjijrqepie.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdremj0ZXBhbmFwaGppanJxZXBpZSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzQ1NjY1NzA2LCJleHAiOjIwNjEyNDE3MDZ9.eyJhbGciOiJIUzI1NiJ9";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================================
// ARABIC PRODUCTIVITY SYSTEM - نظام إدارة المهام والأهداف
// ============================================================

const QUOTES = [
  "النجاح ليس نهاية الطريق، والفشل ليس نهاية المطاف.",
  "ابدأ من حيث أنت، استخدم ما لديك، افعل ما تستطيع.",
  "كل يوم هو فرصة جديدة لتكون أفضل مما كنت عليه بالأمس.",
  "الإنتاجية تعني اتخاذ الإجراءات الصحيحة في الوقت المناسب.",
  "الوقت عملة لا تُسترجع، أنفقها بحكمة.",
  "خطوة واحدة كل يوم تصنع الفارق بعد عام كامل.",
  "التركيز هو الفن الأعلى للنجاح.",
];

const INITIAL_GOALS = [
  {
    id: 1, title: "تعلم البرمجة بالذكاء الاصطناعي", category: "تعليم",
    progress: 65, startDate: "2025-01-01", endDate: "2025-12-31",
    status: "active", color: "#6366f1",
    subtasks: [
      { id: 11, title: "دورة Python المتقدمة", done: true },
      { id: 12, title: "مشروع تطبيقي بالذكاء الاصطناعي", done: false },
      { id: 13, title: "نشر المشروع على GitHub", done: false },
    ]
  },
  {
    id: 2, title: "اللياقة البدنية والصحة", category: "صحة",
    progress: 40, startDate: "2025-01-01", endDate: "2025-06-30",
    status: "active", color: "#10b981",
    subtasks: [
      { id: 21, title: "تمرين يومي 30 دقيقة", done: true },
      { id: 22, title: "نظام غذائي صحي", done: false },
    ]
  },
  {
    id: 3, title: "قراءة 24 كتاباً هذا العام", category: "ثقافة",
    progress: 87, startDate: "2025-01-01", endDate: "2025-12-31",
    status: "active", color: "#f59e0b",
    subtasks: [
      { id: 31, title: "الكتب التقنية (8 كتب)", done: true },
      { id: 32, title: "روايات عالمية (8 كتب)", done: true },
      { id: 33, title: "كتب الفلسفة (8 كتب)", done: false },
    ]
  },
];

const INITIAL_TASKS = [
  { id: 1, title: "مراجعة مفاهيم الـ Machine Learning", goalId: 1, priority: "high", date: new Date().toISOString().split("T")[0], done: false, completedAt: null, repeat: 'none' },
  { id: 2, title: "تمرين الصباح", goalId: 2, priority: "high", date: new Date().toISOString().split("T")[0], done: true, completedAt: "08:30" },
  { id: 3, title: "قراءة فصل من كتاب Atomic Habits", goalId: 3, priority: "medium", date: new Date().toISOString().split("T")[0], done: false, completedAt: null },
  { id: 4, title: "مراجعة البريد الإلكتروني", goalId: null, priority: "low", date: new Date().toISOString().split("T")[0], done: false, completedAt: null },
  { id: 5, title: "كتابة تقرير التقدم الأسبوعي", goalId: 1, priority: "medium", date: new Date().toISOString().split("T")[0], done: true, completedAt: "14:15" },
];

const WEEKLY_STATS = [
  { day: "السبت", tasks: 8, focus: 3.5 },
  { day: "الأحد", tasks: 6, focus: 2.8 },
  { day: "الاثنين", tasks: 9, focus: 4.2 },
  { day: "الثلاثاء", tasks: 7, focus: 3.1 },
  { day: "الأربعاء", tasks: 10, focus: 5.0 },
  { day: "الخميس", tasks: 5, focus: 2.5 },
  { day: "الجمعة", tasks: 4, focus: 1.8 },
];

// ============================================================
// STYLES
// ============================================================
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;900&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap');

  :root {
    --bg: #0a0b0f;
    --bg2: #111218;
    --bg3: #1a1b24;
    --bg4: #22232f;
    --border: rgba(255,255,255,0.07);
    --border2: rgba(255,255,255,0.12);
    --text: #f0f0f8;
    --text2: #9899b0;
    --text3: #5a5b72;
    --accent: #7c6ef0;
    --accent2: #9d8ff5;
    --accent3: #5c4fd4;
    --green: #10b981;
    --amber: #f59e0b;
    --red: #ef4444;
    --blue: #3b82f6;
    --cyan: #06b6d4;
    --card-shadow: 0 2px 20px rgba(0,0,0,0.4);
    --glow: 0 0 30px rgba(124,110,240,0.15);
  }

  * { margin:0; padding:0; box-sizing:border-box; }

  body {
    font-family: 'IBM Plex Sans Arabic', 'Tajawal', sans-serif;
    background: var(--bg);
    color: var(--text);
    direction: rtl;
    text-align: right;
    min-height: 100vh;
    overflow-x: hidden;
  }

  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: var(--bg2); }
  ::-webkit-scrollbar-thumb { background: var(--accent3); border-radius: 3px; }

  .app-shell {
    display: flex;
    min-height: 100vh;
  }

  /* SIDEBAR */
  .sidebar {
    width: 260px;
    background: var(--bg2);
    border-left: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0; right: 0; bottom: 0;
    z-index: 100;
    transition: transform 0.3s ease;
  }

  .sidebar-logo {
    padding: 24px 20px 20px;
    border-bottom: 1px solid var(--border);
  }

  .logo-mark {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .logo-icon {
    width: 40px; height: 40px;
    background: linear-gradient(135deg, var(--accent), var(--accent3));
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 20px;
    box-shadow: 0 4px 15px rgba(124,110,240,0.4);
  }

  .logo-text { font-family: 'Tajawal', sans-serif; font-weight: 900; font-size: 16px; }
  .logo-sub { font-size: 11px; color: var(--text2); margin-top: 2px; }

  .nav-section { padding: 16px 12px 8px; }
  .nav-label { font-size: 10px; color: var(--text3); letter-spacing: 1px; padding: 0 8px 8px; text-transform: uppercase; }

  .nav-item {
    display: flex; align-items: center; gap: 12px;
    padding: 10px 12px; border-radius: 10px;
    cursor: pointer; transition: all 0.2s;
    color: var(--text2); font-size: 14px; font-weight: 500;
    margin-bottom: 2px;
  }
  .nav-item:hover { background: var(--bg3); color: var(--text); }
  .nav-item.active { background: linear-gradient(135deg, rgba(124,110,240,0.2), rgba(92,79,212,0.1)); color: var(--accent2); border: 1px solid rgba(124,110,240,0.2); }
  .nav-item .icon { font-size: 18px; width: 24px; text-align: center; }
  .nav-badge { margin-right: auto; background: var(--accent); color: white; font-size: 10px; padding: 2px 7px; border-radius: 20px; font-weight: 700; }

  .sidebar-footer { padding: 16px 12px; margin-top: auto; border-top: 1px solid var(--border); }
  .user-card { display: flex; align-items: center; gap: 12px; padding: 10px; border-radius: 12px; background: var(--bg3); cursor: pointer; }
  .user-avatar { width: 38px; height: 38px; border-radius: 10px; background: linear-gradient(135deg, var(--accent), var(--cyan)); display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 700; }
  .user-name { font-size: 13px; font-weight: 600; }
  .user-role { font-size: 11px; color: var(--text2); }

  /* MAIN */
  .main {
    margin-right: 260px;
    flex: 1;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .topbar {
    background: var(--bg2);
    border-bottom: 1px solid var(--border);
    padding: 0 28px;
    height: 64px;
    display: flex; align-items: center; justify-content: space-between;
    position: sticky; top: 0; z-index: 50;
    backdrop-filter: blur(10px);
  }

  .topbar-title { font-family: 'Tajawal', sans-serif; font-size: 20px; font-weight: 700; }
  .topbar-date { font-size: 13px; color: var(--text2); }
  .topbar-actions { display: flex; gap: 8px; align-items: center; }

  .btn-icon {
    width: 36px; height: 36px; border-radius: 10px;
    background: var(--bg3); border: 1px solid var(--border);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; font-size: 16px; transition: all 0.2s; color: var(--text2);
  }
  .btn-icon:hover { background: var(--bg4); color: var(--text); }

  .page { padding: 28px; animation: fadeIn 0.3s ease; }

  @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }

  /* CARDS */
  .card {
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 20px;
    transition: all 0.2s;
  }
  .card:hover { border-color: var(--border2); box-shadow: var(--card-shadow); }

  .card-glass {
    background: rgba(26,27,36,0.8);
    backdrop-filter: blur(20px);
    border: 1px solid var(--border);
    border-radius: 16px;
  }

  /* STAT CARDS */
  .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }

  .stat-card {
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 20px;
    position: relative;
    overflow: hidden;
    cursor: default;
    transition: all 0.3s;
  }
  .stat-card:hover { transform: translateY(-2px); box-shadow: var(--glow); border-color: var(--border2); }
  .stat-card::before {
    content: '';
    position: absolute;
    top: -40px; left: -40px;
    width: 120px; height: 120px;
    border-radius: 50%;
    opacity: 0.08;
  }
  .stat-card.purple::before { background: var(--accent); }
  .stat-card.green::before { background: var(--green); }
  .stat-card.amber::before { background: var(--amber); }
  .stat-card.blue::before { background: var(--blue); }

  .stat-icon { font-size: 28px; margin-bottom: 12px; }
  .stat-value { font-family: 'Tajawal', sans-serif; font-size: 32px; font-weight: 900; line-height: 1; }
  .stat-label { font-size: 12px; color: var(--text2); margin-top: 4px; }
  .stat-trend { font-size: 11px; color: var(--green); margin-top: 6px; }

  /* GRID LAYOUTS */
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
  .grid-3 { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-bottom: 20px; }

  /* QUOTE CARD */
  .quote-card {
    background: linear-gradient(135deg, rgba(124,110,240,0.15), rgba(92,79,212,0.08));
    border: 1px solid rgba(124,110,240,0.25);
    border-radius: 16px;
    padding: 20px 24px;
    margin-bottom: 24px;
    position: relative;
    overflow: hidden;
  }
  .quote-mark { font-size: 60px; color: var(--accent); opacity: 0.15; position: absolute; top: -10px; right: 20px; font-family: serif; line-height: 1; }
  .quote-text { font-size: 15px; font-weight: 500; line-height: 1.8; color: var(--text); position: relative; }
  .quote-label { font-size: 11px; color: var(--accent2); margin-top: 8px; font-weight: 600; }

  /* PROGRESS BAR */
  .progress-wrap { margin: 8px 0; }
  .progress-bar { height: 6px; background: var(--bg4); border-radius: 10px; overflow: hidden; }
  .progress-fill { height: 100%; border-radius: 10px; transition: width 1s ease; }

  /* TASKS */
  .task-item {
    display: flex; align-items: flex-start; gap: 12px;
    padding: 14px 16px; border-radius: 12px;
    background: var(--bg3); border: 1px solid var(--border);
    margin-bottom: 8px; transition: all 0.2s; cursor: default;
  }
  .task-item:hover { border-color: var(--border2); }
  .task-item.done { opacity: 0.5; }

  .task-check {
    width: 20px; height: 20px; border-radius: 6px;
    border: 2px solid var(--border2); cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; margin-top: 2px; transition: all 0.2s;
    font-size: 11px; color: white;
  }
  .task-check.done { background: var(--green); border-color: var(--green); }
  .task-check.high { border-color: var(--red); }
  .task-check.medium { border-color: var(--amber); }
  .task-check.low { border-color: var(--blue); }

  .task-title { font-size: 14px; font-weight: 500; flex: 1; }
  .task-title.done { text-decoration: line-through; }
  .task-meta { display: flex; gap: 6px; align-items: center; margin-top: 4px; flex-wrap: wrap; }
  .badge { font-size: 10px; padding: 2px 8px; border-radius: 20px; font-weight: 600; }
  .badge.high { background: rgba(239,68,68,0.15); color: var(--red); }
  .badge.medium { background: rgba(245,158,11,0.15); color: var(--amber); }
  .badge.low { background: rgba(59,130,246,0.15); color: var(--blue); }
  .badge.goal { background: rgba(124,110,240,0.15); color: var(--accent2); }

  .task-time { font-size: 11px; color: var(--text3); display: flex; align-items: center; gap: 4px; }

  /* BUTTONS */
  .btn {
    padding: 10px 20px; border-radius: 10px; border: none;
    cursor: pointer; font-family: inherit; font-size: 14px; font-weight: 600;
    transition: all 0.2s; display: inline-flex; align-items: center; gap: 8px;
  }
  .btn-primary { background: var(--accent); color: white; }
  .btn-primary:hover { background: var(--accent2); transform: translateY(-1px); box-shadow: 0 4px 15px rgba(124,110,240,0.4); }
  .btn-ghost { background: var(--bg3); color: var(--text2); border: 1px solid var(--border); }
  .btn-ghost:hover { background: var(--bg4); color: var(--text); }
  .btn-sm { padding: 6px 14px; font-size: 12px; border-radius: 8px; }
  .btn-danger { background: rgba(239,68,68,0.15); color: var(--red); border: 1px solid rgba(239,68,68,0.2); }
  .btn-danger:hover { background: rgba(239,68,68,0.28); transform: translateY(-1px); }

  /* GOAL CARDS */
  .goal-card {
    background: var(--bg2); border: 1px solid var(--border);
    border-radius: 16px; padding: 20px; margin-bottom: 16px;
    transition: all 0.3s; position: relative; overflow: hidden;
  }
  .goal-card::after {
    content: ''; position: absolute;
    top: 0; right: 0; width: 4px; height: 100%;
  }
  .goal-card:hover { transform: translateX(-4px); box-shadow: var(--card-shadow); }
  .goal-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
  .goal-title { font-size: 16px; font-weight: 700; }
  .goal-category { font-size: 11px; color: var(--text2); margin-top: 3px; }
  .goal-status { font-size: 11px; padding: 4px 10px; border-radius: 20px; font-weight: 600; }
  .status-active { background: rgba(16,185,129,0.15); color: var(--green); }
  .status-paused { background: rgba(245,158,11,0.15); color: var(--amber); }
  .status-done { background: rgba(59,130,246,0.15); color: var(--blue); }

  .subtask-list { margin-top: 12px; }
  .subtask-item { display: flex; align-items: center; gap: 8px; padding: 6px 0; font-size: 13px; color: var(--text2); border-bottom: 1px solid var(--border); }
  .subtask-item:last-child { border-bottom: none; }
  .subtask-check { font-size: 14px; }

  /* POMODORO */
  .pomodoro-wrap { max-width: 360px; margin: 0 auto; text-align: center; }
  .pomo-timer-ring { position: relative; width: 220px; height: 220px; margin: 0 auto 24px; }
  .pomo-circle { transform: rotate(-90deg); }
  .pomo-circle-bg { fill: none; stroke: var(--bg4); stroke-width: 8; }
  .pomo-circle-fill { fill: none; stroke-width: 8; stroke-linecap: round; transition: stroke-dashoffset 1s linear; }
  .pomo-time { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); text-align: center; }
  .pomo-digits { font-family: 'Tajawal', sans-serif; font-size: 44px; font-weight: 900; line-height: 1; }
  .pomo-phase { font-size: 12px; color: var(--text2); margin-top: 4px; font-weight: 500; }

  .pomo-controls { display: flex; justify-content: center; gap: 12px; margin-bottom: 20px; }
  .pomo-btn { width: 52px; height: 52px; border-radius: 50%; border: none; cursor: pointer; font-size: 22px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
  .pomo-btn-main { background: var(--accent); color: white; width: 64px; height: 64px; font-size: 26px; box-shadow: 0 4px 20px rgba(124,110,240,0.4); }
  .pomo-btn-main:hover { transform: scale(1.05); }
  .pomo-btn-secondary { background: var(--bg3); color: var(--text2); border: 1px solid var(--border); }
  .pomo-btn-secondary:hover { background: var(--bg4); color: var(--text); }

  .pomo-sessions { display: flex; justify-content: center; gap: 6px; margin-bottom: 20px; }
  .pomo-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--bg4); transition: all 0.3s; }
  .pomo-dot.done { background: var(--accent); box-shadow: 0 0 8px rgba(124,110,240,0.6); }

  .pomo-settings { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 16px; }
  .pomo-setting { background: var(--bg3); border: 1px solid var(--border); border-radius: 12px; padding: 12px; text-align: center; }
  .pomo-setting-label { font-size: 11px; color: var(--text2); margin-bottom: 6px; }
  .pomo-setting-value { display: flex; align-items: center; justify-content: center; gap: 8px; }
  .pomo-setting-num { font-size: 20px; font-weight: 700; font-family: 'Tajawal', sans-serif; }
  .pomo-adj { width: 24px; height: 24px; border-radius: 6px; background: var(--bg4); border: 1px solid var(--border); cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; color: var(--text2); }
  .pomo-adj:hover { background: var(--accent); color: white; }

  /* CHART */
  .chart-bar-wrap { display: flex; align-items: flex-end; gap: 8px; height: 120px; }
  .chart-bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; height: 100%; justify-content: flex-end; }
  .chart-bar { width: 100%; border-radius: 6px 6px 0 0; transition: height 1s ease; min-height: 4px; cursor: pointer; position: relative; }
  .chart-bar:hover { opacity: 0.85; }
  .chart-bar-label { font-size: 10px; color: var(--text3); }
  .chart-bar-value { font-size: 10px; color: var(--text2); font-weight: 600; }

  /* AI ASSISTANT */
  .ai-chat { display: flex; flex-direction: column; gap: 12px; }
  .ai-message { display: flex; gap: 12px; }
  .ai-message.user { flex-direction: row-reverse; }
  .ai-avatar { width: 34px; height: 34px; border-radius: 10px; background: linear-gradient(135deg, var(--accent), var(--cyan)); display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
  .ai-avatar.user { background: var(--bg3); border: 1px solid var(--border); font-size: 14px; }
  .ai-bubble { padding: 12px 16px; border-radius: 12px; font-size: 14px; line-height: 1.7; max-width: 85%; }
  .ai-bubble.bot { background: var(--bg3); border: 1px solid var(--border); color: var(--text); border-radius: 12px 2px 12px 12px; }
  .ai-bubble.user { background: var(--accent); color: white; border-radius: 2px 12px 12px 12px; }

  .ai-input-row { display: flex; gap: 8px; margin-top: 8px; }
  .ai-input { flex: 1; background: var(--bg3); border: 1px solid var(--border); border-radius: 12px; padding: 12px 16px; font-family: inherit; font-size: 14px; color: var(--text); outline: none; direction: rtl; transition: border-color 0.2s; }
  .ai-input:focus { border-color: var(--accent); }
  .ai-input::placeholder { color: var(--text3); }

  /* MODAL */
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(6px); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 20px; animation: fadeIn 0.2s; }
  .modal { background: var(--bg2); border: 1px solid var(--border2); border-radius: 20px; padding: 28px; width: 100%; max-width: 520px; max-height: 90vh; overflow-y: auto; }
  .modal-title { font-size: 18px; font-weight: 700; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; }

  .form-group { margin-bottom: 16px; }
  .form-label { font-size: 13px; color: var(--text2); margin-bottom: 6px; display: block; font-weight: 500; }
  .form-input, .form-select, .form-textarea {
    width: 100%; background: var(--bg3); border: 1px solid var(--border);
    border-radius: 10px; padding: 10px 14px; font-family: inherit; font-size: 14px;
    color: var(--text); outline: none; direction: rtl; transition: border-color 0.2s;
  }
  .form-input:focus, .form-select:focus, .form-textarea:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(124,110,240,0.1); }
  .form-select option { background: var(--bg3); }
  .form-textarea { resize: vertical; min-height: 80px; }

  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .modal-actions { display: flex; gap: 10px; margin-top: 20px; justify-content: flex-end; }

  /* NOTIFICATION */
  .notif-stack { position: fixed; bottom: 24px; left: 24px; z-index: 300; display: flex; flex-direction: column; gap: 8px; }
  .notif {
    background: var(--bg2); border: 1px solid var(--border2);
    border-radius: 12px; padding: 14px 18px; font-size: 13px;
    display: flex; align-items: center; gap: 12px; min-width: 280px;
    animation: slideIn 0.3s ease; box-shadow: 0 8px 30px rgba(0,0,0,0.4);
  }
  .notif.success { border-color: rgba(16,185,129,0.3); }
  .notif.info { border-color: rgba(124,110,240,0.3); }
  .notif.warning { border-color: rgba(245,158,11,0.3); }

  @keyframes slideIn { from { opacity:0; transform: translateX(-20px); } to { opacity:1; transform:translateX(0); } }

  /* SECTION HEADER */
  .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
  .section-title { font-size: 16px; font-weight: 700; display: flex; align-items: center; gap: 8px; }
  .section-icon { font-size: 18px; }

  /* TABS */
  .tabs { display: flex; gap: 4px; background: var(--bg3); border-radius: 12px; padding: 4px; margin-bottom: 20px; }
  .tab { flex: 1; padding: 8px; border-radius: 8px; text-align: center; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; color: var(--text2); }
  .tab.active { background: var(--accent); color: white; box-shadow: 0 2px 10px rgba(124,110,240,0.3); }

  /* TODAY PROGRESS */
  .today-ring-wrap { display: flex; align-items: center; gap: 20px; }
  .today-ring { position: relative; width: 80px; height: 80px; flex-shrink: 0; }
  .today-ring svg { transform: rotate(-90deg); }
  .today-ring-pct { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); font-size: 16px; font-weight: 900; font-family: 'Tajawal', sans-serif; }

  /* RESPONSIVE */
  @media (max-width: 768px) {
    .sidebar { transform: translateX(260px); }
    .sidebar.open { transform: translateX(0); }
    .main { margin-right: 0; }
    .grid-2, .grid-3 { grid-template-columns: 1fr; }
    .stats-grid { grid-template-columns: repeat(2, 1fr); }
    .page { padding: 16px; }
    .form-row { grid-template-columns: 1fr; }
    .topbar { padding: 0 16px; }
    .menu-btn { display: flex !important; }
  }

  .menu-btn { display: none; }
  .mobile-overlay { display: none; }
  @media (max-width: 768px) {
    .mobile-overlay.show { display: block; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 99; }
  }

  /* LOADING SPINNER */
  .spinner { width: 20px; height: 20px; border: 2px solid rgba(124,110,240,0.3); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.7s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* EMPTY STATE */
  .empty { text-align: center; padding: 40px 20px; color: var(--text3); }
  .empty-icon { font-size: 40px; margin-bottom: 12px; }
  .empty-text { font-size: 14px; }

  /* SCROLLBAR WRAPPER */
  .scroll-area { max-height: 400px; overflow-y: auto; padding-left: 4px; }

  .text-sm { font-size: 13px; }
  .text-xs { font-size: 11px; }
  .text-muted { color: var(--text2); }
  .text-accent { color: var(--accent2); }
  .text-green { color: var(--green); }
  .text-amber { color: var(--amber); }
  .text-red { color: var(--red); }
  .fw-bold { font-weight: 700; }
  .mt-8 { margin-top: 8px; }
  .mt-12 { margin-top: 12px; }
  .mt-16 { margin-top: 16px; }
  .mb-8 { margin-bottom: 8px; }
  .mb-16 { margin-bottom: 16px; }
  .flex { display: flex; }
  .flex-col { flex-direction: column; }
  .items-center { align-items: center; }
  .justify-between { justify-content: space-between; }
  .gap-8 { gap: 8px; }
  .gap-12 { gap: 12px; }
  .w-full { width: 100%; }
`;

// ============================================================
// COMPONENTS
// ============================================================

function Notification({ notifs }) {
  return (
    <div className="notif-stack">
      {notifs.map(n => (
        <div key={n.id} className={`notif ${n.type}`}>
          <span style={{ fontSize: 20 }}>{n.icon}</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{n.title}</div>
            {n.msg && <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>{n.msg}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

function Modal({ open, onClose, title, icon, children }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">{icon && <span>{icon}</span>}{title}</div>
        {children}
      </div>
    </div>
  );
}

function ProgressBar({ pct, color = "var(--accent)", h = 6 }) {
  return (
    <div className="progress-bar" style={{ height: h }}>
      <div className="progress-fill" style={{ width: `${Math.min(100, pct)}%`, background: color, height: h }} />
    </div>
  );
}

// ============================================================
// DASHBOARD PAGE
// ============================================================
function DashboardPage({ tasks, setTasks, goals, pomodoroSessions, todayFocus, addNotif }) {
  const today = new Date().toISOString().split("T")[0];
  const todayTasks = tasks.filter(t => t.date === today);
  const doneTasks = todayTasks.filter(t => t.done);
  const pct = todayTasks.length ? Math.round((doneTasks.length / todayTasks.length) * 100) : 0;
  const quote = QUOTES[new Date().getDay() % QUOTES.length];

  function toggleTask(id) {
    setTasks(prev => {
      const updated = prev.map(t => {
        if (t.id !== id) return t;
        const done = !t.done;
        const now = new Date();
        if (done) addNotif({ type: 'success', icon: '🎉', title: 'أحسنت! 🌟', msg: `أكملت: ${t.title}` });
        return { ...t, done, completedAt: done ? `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}` : null };
      });

      const task = prev.find(t => t.id === id);
      if (task && !task.done && task.repeat && task.repeat !== 'none') {
        const nextDate = getNextRepeatDate(task.date, task.repeat);
        const alreadyExists = updated.some(t => t.repeatParentId === id && t.date === nextDate);
        if (!alreadyExists) {
          const nextTask = { ...task, id: Date.now() + Math.random(), done: false, completedAt: null, date: nextDate, repeatParentId: id };
          addNotif({ type: 'info', icon: '🔁', title: 'تم جدولة التكرار', msg: `${task.title} ← ${nextDate}` });
          return [...updated, nextTask];
        }
      }
      return updated;
    });
  }

  return (
    <div className="page">
      {/* Quote */}
      <div className="quote-card">
        <div className="quote-mark">"</div>
        <div className="quote-text">{quote}</div>
        <div className="quote-label">✨ اقتباس اليوم</div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card purple">
          <div className="stat-icon">✅</div>
          <div className="stat-value">{doneTasks.length}</div>
          <div className="stat-label">مهام مكتملة اليوم</div>
          <div className="stat-trend">↑ {todayTasks.length} مهمة إجمالاً</div>
        </div>
        <div className="stat-card amber">
          <div className="stat-icon">⏳</div>
          <div className="stat-value">{todayTasks.filter(t => !t.done).length}</div>
          <div className="stat-label">مهام متبقية</div>
          <div className="stat-trend" style={{ color: 'var(--amber)' }}>تحتاج إنجاز اليوم</div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon">🎯</div>
          <div className="stat-value">{todayFocus.toFixed(1)}س</div>
          <div className="stat-label">وقت التركيز اليوم</div>
          <div className="stat-trend">{pomodoroSessions} جلسة بومودورو</div>
        </div>
        <div className="stat-card blue">
          <div className="stat-icon">📈</div>
          <div className="stat-value">{pct}%</div>
          <div className="stat-label">نسبة الإنجاز اليومي</div>
          <div className="stat-trend" style={{ color: pct >= 70 ? 'var(--green)' : 'var(--amber)' }}>
            {pct >= 70 ? '🔥 أداء رائع' : '💪 استمر في المحاولة'}
          </div>
        </div>
      </div>

      <div className="grid-3">
        {/* Today Tasks */}
        <div className="card">
          <div className="section-header">
            <div className="section-title"><span className="section-icon">📋</span>مهام اليوم</div>
            <div className="today-ring">
              <svg width="80" height="80" viewBox="0 0 80 80">
                <circle className="pomo-circle-bg" cx="40" cy="40" r="32" style={{ stroke: 'var(--bg4)' }} />
                <circle cx="40" cy="40" r="32"
                  fill="none" stroke="var(--accent)" strokeWidth="7" strokeLinecap="round"
                  strokeDasharray={201}
                  strokeDashoffset={201 - (201 * pct / 100)}
                  style={{ transform: 'rotate(-90deg)', transformOrigin: '40px 40px', transition: 'stroke-dashoffset 1s ease' }}
                />
              </svg>
              <div className="today-ring-pct">{pct}%</div>
            </div>
          </div>
          <div className="scroll-area">
            {todayTasks.length === 0 ? (
              <div className="empty"><div className="empty-icon">🌟</div><div className="empty-text">لا مهام اليوم. أضف مهمتك الأولى!</div></div>
            ) : todayTasks.map(t => (
              <div
                key={t.id}
                className={`task-item ${t.done ? 'done' : ''}`}
                style={{ cursor: 'default' }}
              >
                {/* Clickable checkbox */}
                <div
                  className={`task-check ${t.done ? 'done' : t.priority}`}
                  onClick={() => toggleTask(t.id)}
                  style={{ cursor: 'pointer', flexShrink: 0 }}
                  title={t.done ? 'إلغاء الإكمال' : 'إكمال المهمة'}
                >
                  {t.done ? '✓' : ''}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    className={`task-title ${t.done ? 'done' : ''}`}
                    onClick={() => toggleTask(t.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    {t.title}
                  </div>
                  <div className="task-meta">
                    <span className={`badge ${t.priority}`}>{t.priority === 'high' ? '🔴 عالية' : t.priority === 'medium' ? '🟡 متوسطة' : '🔵 منخفضة'}</span>
                    {t.repeat && t.repeat !== 'none' && (
                      <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 20, background: 'rgba(124,110,240,0.15)', color: 'var(--accent2)', fontWeight: 600 }}>
                        {t.repeat === 'daily' ? '🔁 يومي' : t.repeat === 'weekly' ? '📆 أسبوعي' : '🗓️ شهري'}
                      </span>
                    )}
                    {t.completedAt && <span className="task-time" style={{ color: 'var(--green)' }}>✓ {t.completedAt}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Goals */}
        <div className="card">
          <div className="section-title mb-16"><span className="section-icon">🎯</span>الأهداف النشطة</div>
          {goals.filter(g => g.status === 'active').map(g => (
            <div key={g.id} style={{ marginBottom: 16 }}>
              <div className="flex justify-between items-center mb-8">
                <span style={{ fontSize: 13, fontWeight: 600 }}>{g.title}</span>
                <span style={{ fontSize: 12, color: g.color, fontWeight: 700 }}>{g.progress}%</span>
              </div>
              <ProgressBar pct={g.progress} color={g.color} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// GOALS PAGE
// ============================================================
const EMPTY_GOAL_FORM = { title: '', category: '', startDate: '', endDate: '', color: '#6366f1', status: 'active' };
const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#06b6d4', '#8b5cf6', '#ec4899'];

function GoalForm({ form, setForm }) {
  return (
    <>
      <div className="form-group">
        <label className="form-label">عنوان الهدف *</label>
        <input className="form-input" placeholder="مثال: تعلم لغة جديدة" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">الفئة</label>
          <input className="form-input" placeholder="تعليم، صحة، مال..." value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} />
        </div>
        <div className="form-group">
          <label className="form-label">الحالة</label>
          <select className="form-select" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
            <option value="active">نشط</option>
            <option value="paused">متوقف</option>
            <option value="done">مكتمل</option>
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">تاريخ البداية</label>
          <input type="date" className="form-input" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} />
        </div>
        <div className="form-group">
          <label className="form-label">تاريخ النهاية</label>
          <input type="date" className="form-input" value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">اللون</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {COLORS.map(c => (
            <div key={c} onClick={() => setForm(p => ({ ...p, color: c }))} style={{ width: 28, height: 28, borderRadius: 8, background: c, cursor: 'pointer', border: form.color === c ? '3px solid white' : '2px solid transparent', boxSizing: 'border-box', transition: 'all 0.2s' }} />
          ))}
        </div>
      </div>
    </>
  );
}

function ConfirmDialog({ open, onClose, onConfirm, title, msg }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 380 }}>
        <div style={{ textAlign: 'center', padding: '8px 0 20px' }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>🗑️</div>
          <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{title}</div>
          <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7 }}>{msg}</div>
        </div>
        <div className="modal-actions" style={{ justifyContent: 'center' }}>
          <button className="btn btn-ghost" onClick={onClose}>إلغاء</button>
          <button className="btn btn-danger" onClick={onConfirm}>نعم، احذف</button>
        </div>
      </div>
    </div>
  );
}

function GoalsPage({ goals, setGoals, addNotif }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editGoal, setEditGoal] = useState(null);   // goal object being edited
  const [deleteGoal, setDeleteGoal] = useState(null); // goal object to confirm delete
  const [addForm, setAddForm] = useState(EMPTY_GOAL_FORM);
  const [editForm, setEditForm] = useState(EMPTY_GOAL_FORM);
  const [expandedGoal, setExpandedGoal] = useState(null);
  const [newSubtask, setNewSubtask] = useState('');

  function addGoal() {
    if (!addForm.title.trim()) return;
    const g = { ...addForm, id: Date.now(), progress: 0, subtasks: [] };
    setGoals(prev => [...prev, g]);
    setShowAdd(false);
    setAddForm(EMPTY_GOAL_FORM);
    addNotif({ type: 'success', icon: '🎯', title: 'تم إنشاء الهدف', msg: g.title });
  }

  function openEdit(g) {
    setEditForm({ title: g.title, category: g.category || '', startDate: g.startDate || '', endDate: g.endDate || '', color: g.color, status: g.status });
    setEditGoal(g);
  }

  function saveEdit() {
    if (!editForm.title.trim()) return;
    setGoals(prev => prev.map(g => g.id === editGoal.id ? { ...g, ...editForm } : g));
    addNotif({ type: 'info', icon: '✏️', title: 'تم تعديل الهدف', msg: editForm.title });
    setEditGoal(null);
  }

  function confirmDelete(g) { setDeleteGoal(g); }

  function doDelete() {
    setGoals(prev => prev.filter(g => g.id !== deleteGoal.id));
    addNotif({ type: 'warning', icon: '🗑️', title: 'تم حذف الهدف', msg: deleteGoal.title });
    setDeleteGoal(null);
    if (expandedGoal === deleteGoal.id) setExpandedGoal(null);
  }

  function addSubtask(goalId) {
    if (!newSubtask.trim()) return;
    setGoals(prev => prev.map(g => g.id === goalId
      ? { ...g, subtasks: [...g.subtasks, { id: Date.now(), title: newSubtask, done: false }] }
      : g
    ));
    setNewSubtask('');
  }

  function deleteSubtask(goalId, subId) {
    setGoals(prev => prev.map(g => {
      if (g.id !== goalId) return g;
      const updated = g.subtasks.filter(s => s.id !== subId);
      const progress = updated.length ? Math.round(updated.filter(s => s.done).length / updated.length * 100) : g.progress;
      return { ...g, subtasks: updated, progress };
    }));
  }

  function toggleSubtask(goalId, subId) {
    setGoals(prev => prev.map(g => {
      if (g.id !== goalId) return g;
      const updated = g.subtasks.map(s => s.id === subId ? { ...s, done: !s.done } : s);
      const progress = Math.round((updated.filter(s => s.done).length / updated.length) * 100);
      return { ...g, subtasks: updated, progress: updated.length ? progress : g.progress };
    }));
  }

  return (
    <div className="page">
      <div className="section-header">
        <div className="section-title"><span className="section-icon">🎯</span>إدارة الأهداف</div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ هدف جديد</button>
      </div>

      <div className="stats-grid" style={{ marginBottom: 20 }}>
        <div className="stat-card purple" style={{ padding: 16 }}>
          <div style={{ fontSize: 22, marginBottom: 8 }}>🔥</div>
          <div className="stat-value" style={{ fontSize: 28 }}>{goals.filter(g => g.status === 'active').length}</div>
          <div className="stat-label">أهداف نشطة</div>
        </div>
        <div className="stat-card green" style={{ padding: 16 }}>
          <div style={{ fontSize: 22, marginBottom: 8 }}>✅</div>
          <div className="stat-value" style={{ fontSize: 28 }}>{goals.filter(g => g.status === 'done').length}</div>
          <div className="stat-label">أهداف مكتملة</div>
        </div>
        <div className="stat-card amber" style={{ padding: 16 }}>
          <div style={{ fontSize: 22, marginBottom: 8 }}>⏸️</div>
          <div className="stat-value" style={{ fontSize: 28 }}>{goals.filter(g => g.status === 'paused').length}</div>
          <div className="stat-label">أهداف متوقفة</div>
        </div>
      </div>

      {goals.length === 0 && (
        <div className="card empty"><div className="empty-icon">🎯</div><div className="empty-text">لا توجد أهداف بعد. أنشئ هدفك الأول!</div></div>
      )}

      {goals.map(g => (
        <div key={g.id} className="goal-card" style={{ borderRight: `4px solid ${g.color}` }}>
          <div className="goal-header">
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="goal-title">{g.title}</div>
              <div className="goal-category">📂 {g.category || 'عام'}</div>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
              <span className={`goal-status status-${g.status === 'active' ? 'active' : g.status === 'done' ? 'done' : 'paused'}`}>
                {g.status === 'active' ? '🟢 نشط' : g.status === 'done' ? '✅ مكتمل' : '⏸️ متوقف'}
              </span>
              {/* Edit */}
              <button className="btn-icon" style={{ fontSize: 14 }} title="تعديل" onClick={() => openEdit(g)}>✏️</button>
              {/* Delete */}
              <button className="btn-icon" style={{ fontSize: 14, color: 'var(--red)' }} title="حذف" onClick={() => confirmDelete(g)}>🗑️</button>
              {/* Expand */}
              <button className="btn-icon" style={{ fontSize: 14 }} onClick={() => setExpandedGoal(expandedGoal === g.id ? null : g.id)}>
                {expandedGoal === g.id ? '▲' : '▼'}
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center mb-8">
            <span className="text-sm text-muted">التقدم: <strong style={{ color: g.color }}>{g.progress}%</strong></span>
            {g.endDate && <span className="text-xs text-muted">🗓️ حتى {g.endDate}</span>}
          </div>
          <ProgressBar pct={g.progress} color={g.color} h={8} />

          {expandedGoal === g.id && (
            <div className="subtask-list">
              <div style={{ fontSize: 12, color: 'var(--text2)', margin: '12px 0 8px', fontWeight: 600 }}>المهام الفرعية</div>
              {g.subtasks.length === 0 && <div style={{ fontSize: 12, color: 'var(--text3)', padding: '6px 0' }}>لا مهام فرعية بعد.</div>}
              {g.subtasks.map(s => (
                <div key={s.id} className="subtask-item">
                  <span className="subtask-check" style={{ cursor: 'pointer' }} onClick={() => toggleSubtask(g.id, s.id)}>{s.done ? '✅' : '⬜'}</span>
                  <span style={{ flex: 1, textDecoration: s.done ? 'line-through' : 'none', color: s.done ? 'var(--text3)' : 'var(--text)', cursor: 'pointer' }} onClick={() => toggleSubtask(g.id, s.id)}>{s.title}</span>
                  <button onClick={() => deleteSubtask(g.id, s.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', fontSize: 13, padding: '0 4px', lineHeight: 1 }} title="حذف">✕</button>
                </div>
              ))}
              <div className="flex gap-8 mt-12">
                <input className="form-input" style={{ flex: 1, padding: '8px 12px' }} placeholder="أضف مهمة فرعية..." value={newSubtask} onChange={e => setNewSubtask(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSubtask(g.id)} />
                <button className="btn btn-primary btn-sm" onClick={() => addSubtask(g.id)}>+</button>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* ADD MODAL */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="إنشاء هدف جديد" icon="🎯">
        <GoalForm form={addForm} setForm={setAddForm} />
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={() => setShowAdd(false)}>إلغاء</button>
          <button className="btn btn-primary" onClick={addGoal}>إنشاء الهدف ✨</button>
        </div>
      </Modal>

      {/* EDIT MODAL */}
      <Modal open={!!editGoal} onClose={() => setEditGoal(null)} title="تعديل الهدف" icon="✏️">
        <GoalForm form={editForm} setForm={setEditForm} />
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={() => setEditGoal(null)}>إلغاء</button>
          <button className="btn btn-primary" onClick={saveEdit}>حفظ التعديلات ✅</button>
        </div>
      </Modal>

      {/* CONFIRM DELETE */}
      <ConfirmDialog
        open={!!deleteGoal}
        onClose={() => setDeleteGoal(null)}
        onConfirm={doDelete}
        title="حذف الهدف"
        msg={`هل أنت متأكد من حذف "${deleteGoal?.title}"؟ سيتم حذف جميع مهامه الفرعية أيضاً ولا يمكن التراجع.`}
      />
    </div>
  );
}

// ============================================================
// TASKS PAGE
// ============================================================
const EMPTY_TASK_FORM = { title: '', goalId: '', priority: 'medium', date: new Date().toISOString().split("T")[0], repeat: 'none' };

const REPEAT_LABELS = { none: 'لا تكرار', daily: 'يومي', weekly: 'أسبوعي', monthly: 'شهري' };

function getNextRepeatDate(fromDate, repeat) {
  const d = new Date(fromDate + 'T00:00:00');
  if (repeat === 'daily')        d.setDate(d.getDate() + 1);
  else if (repeat === 'weekly')  d.setDate(d.getDate() + 7);
  else if (repeat === 'monthly') d.setMonth(d.getMonth() + 1);
  return d.toISOString().split('T')[0];
}

function TaskForm({ form, setForm, goals }) {
  return (
    <>
      <div className="form-group">
        <label className="form-label">عنوان المهمة *</label>
        <input className="form-input" placeholder="ما الذي تريد إنجازه؟" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">الأولوية</label>
          <select className="form-select" value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}>
            <option value="high">🔴 عالية</option>
            <option value="medium">🟡 متوسطة</option>
            <option value="low">🔵 منخفضة</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">التاريخ</label>
          <input type="date" className="form-input" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">🔁 التكرار</label>
          <select className="form-select" value={form.repeat || 'none'} onChange={e => setForm(p => ({ ...p, repeat: e.target.value }))}>
            <option value="none">🚫 لا تكرار</option>
            <option value="daily">🔁 يومي</option>
            <option value="weekly">📆 أسبوعي</option>
            <option value="monthly">🗓️ شهري</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">ربط بهدف (اختياري)</label>
          <select className="form-select" value={form.goalId} onChange={e => setForm(p => ({ ...p, goalId: e.target.value }))}>
            <option value="">-- بدون هدف --</option>
            {goals.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
          </select>
        </div>
      </div>
      {form.repeat && form.repeat !== 'none' && (
        <div style={{ background: 'rgba(124,110,240,0.08)', border: '1px solid rgba(124,110,240,0.2)', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: 'var(--accent2)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>✨</span>
          <span>عند الإكمال ستُجدَّد تلقائياً ({REPEAT_LABELS[form.repeat]})</span>
        </div>
      )}
    </>
  );
}

function TasksPage({ tasks, setTasks, goals, addNotif }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [deleteTask, setDeleteTask] = useState(null);
  const [addForm, setAddForm] = useState(EMPTY_TASK_FORM);
  const [editForm, setEditForm] = useState(EMPTY_TASK_FORM);
  const [filter, setFilter] = useState('all');

  function addTask() {
    if (!addForm.title.trim()) return;
    const t = { ...addForm, id: Date.now(), done: false, completedAt: null, goalId: addForm.goalId ? parseInt(addForm.goalId) : null, repeat: addForm.repeat || 'none' };
    setTasks(prev => [...prev, t]);
    setShowAdd(false);
    setAddForm(EMPTY_TASK_FORM);
    addNotif({ type: 'success', icon: '✅', title: 'تم إضافة المهمة', msg: t.title });
  }

  function openEdit(t) {
    setEditForm({ title: t.title, goalId: t.goalId ? String(t.goalId) : '', priority: t.priority, date: t.date, repeat: t.repeat || 'none' });
    setEditTask(t);
  }

  function saveEdit() {
    if (!editForm.title.trim()) return;
    setTasks(prev => prev.map(t => t.id === editTask.id
      ? { ...t, ...editForm, goalId: editForm.goalId ? parseInt(editForm.goalId) : null, repeat: editForm.repeat || 'none' }
      : t
    ));
    addNotif({ type: 'info', icon: '✏️', title: 'تم تعديل المهمة', msg: editForm.title });
    setEditTask(null);
  }

  function doDeleteTask() {
    setTasks(prev => prev.filter(t => t.id !== deleteTask.id));
    addNotif({ type: 'warning', icon: '🗑️', title: 'تم حذف المهمة', msg: deleteTask.title });
    setDeleteTask(null);
  }

  function toggleTask(id) {
    setTasks(prev => {
      const updated = prev.map(t => {
        if (t.id !== id) return t;
        const done = !t.done;
        const now = new Date();
        if (done) addNotif({ type: 'success', icon: '🎉', title: 'أحسنت! 🌟', msg: `أكملت: ${t.title}` });
        return { ...t, done, completedAt: done ? `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}` : null };
      });

      // If completing a repeating task → add fresh copy for next occurrence
      const task = prev.find(t => t.id === id);
      if (task && !task.done && task.repeat && task.repeat !== 'none') {
        const nextDate = getNextRepeatDate(task.date, task.repeat);
        // Don't duplicate if a future copy already exists
        const alreadyExists = updated.some(t => t.repeatParentId === id && t.date === nextDate);
        if (!alreadyExists) {
          const nextTask = {
            ...task,
            id: Date.now() + Math.random(),
            done: false,
            completedAt: null,
            date: nextDate,
            repeatParentId: id,
          };
          addNotif({ type: 'info', icon: '🔁', title: 'تم جدولة التكرار', msg: `${task.title} ← ${nextDate}` });
          return [...updated, nextTask];
        }
      }
      return updated;
    });
  }

  function reschedule(id) {
    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
    setTasks(prev => prev.map(t => t.id === id ? { ...t, date: tomorrow.toISOString().split("T")[0] } : t));
    addNotif({ type: 'info', icon: '📅', title: 'تم إعادة الجدولة', msg: 'المهمة ستظهر غداً' });
  }

  const today = new Date().toISOString().split("T")[0];
  const filtered = tasks.filter(t => {
    if (filter === 'today') return t.date === today;
    if (filter === 'done') return t.done;
    if (filter === 'pending') return !t.done;
    if (filter === 'high') return t.priority === 'high';
    return true;
  }).sort((a, b) => {
    const p = { high: 0, medium: 1, low: 2 };
    return (a.done ? 1 : 0) - (b.done ? 1 : 0) || p[a.priority] - p[b.priority];
  });

  return (
    <div className="page">
      <div className="section-header">
        <div className="section-title"><span className="section-icon">📋</span>المهام اليومية</div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ مهمة جديدة</button>
      </div>

      <div className="tabs">
        {[['all','الكل'],['today','اليوم'],['pending','معلقة'],['done','مكتملة'],['high','عالية']].map(([v,l]) => (
          <div key={v} className={`tab ${filter === v ? 'active' : ''}`} onClick={() => setFilter(v)}>{l}</div>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card empty"><div className="empty-icon">🎯</div><div className="empty-text">لا توجد مهام. أضف مهمتك الأولى!</div></div>
      ) : filtered.map(t => {
        const goal = goals.find(g => g.id === t.goalId);
        return (
          <div key={t.id} className={`task-item ${t.done ? 'done' : ''}`}>
            {/* Checkbox */}
            <div className={`task-check ${t.done ? 'done' : t.priority}`} onClick={() => toggleTask(t.id)}>
              {t.done ? '✓' : ''}
            </div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className={`task-title ${t.done ? 'done' : ''}`}>{t.title}</div>
              <div className="task-meta">
                <span className={`badge ${t.priority}`}>{t.priority === 'high' ? '🔴 عالية' : t.priority === 'medium' ? '🟡 متوسطة' : '🔵 منخفضة'}</span>
                {goal && <span className="badge goal" style={{ background: `${goal.color}20`, color: goal.color }}>🎯 {goal.title}</span>}
                <span className="task-time">📅 {t.date}</span>
                {t.repeat && t.repeat !== 'none' && (
                  <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 20, background: 'rgba(124,110,240,0.15)', color: 'var(--accent2)', fontWeight: 600 }}>
                    {t.repeat === 'daily' ? '🔁 يومي' : t.repeat === 'weekly' ? '📆 أسبوعي' : '🗓️ شهري'}
                  </span>
                )}
                {t.completedAt && <span className="task-time" style={{ color: 'var(--green)' }}>✓ {t.completedAt}</span>}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
              {!t.done && (
                <button className="btn-icon" style={{ fontSize: 13 }} title="إعادة جدولة" onClick={() => reschedule(t.id)}>📅</button>
              )}
              <button className="btn-icon" style={{ fontSize: 13 }} title="تعديل" onClick={() => openEdit(t)}>✏️</button>
              <button className="btn-icon" style={{ fontSize: 13, color: 'var(--red)' }} title="حذف" onClick={() => setDeleteTask(t)}>🗑️</button>
            </div>
          </div>
        );
      })}

      {/* ADD MODAL */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="إضافة مهمة جديدة" icon="✅">
        <TaskForm form={addForm} setForm={setAddForm} goals={goals} />
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={() => setShowAdd(false)}>إلغاء</button>
          <button className="btn btn-primary" onClick={addTask}>إضافة المهمة</button>
        </div>
      </Modal>

      {/* EDIT MODAL */}
      <Modal open={!!editTask} onClose={() => setEditTask(null)} title="تعديل المهمة" icon="✏️">
        <TaskForm form={editForm} setForm={setEditForm} goals={goals} />
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={() => setEditTask(null)}>إلغاء</button>
          <button className="btn btn-primary" onClick={saveEdit}>حفظ التعديلات ✅</button>
        </div>
      </Modal>

      {/* CONFIRM DELETE */}
      <ConfirmDialog
        open={!!deleteTask}
        onClose={() => setDeleteTask(null)}
        onConfirm={doDeleteTask}
        title="حذف المهمة"
        msg={`هل أنت متأكد من حذف "${deleteTask?.title}"؟`}
      />
    </div>
  );
}

// ============================================================
// POMODORO PAGE
// ============================================================
function PomodoroPage({ onSession, addNotif }) {
  const [workMin, setWorkMin] = useState(25);
  const [breakMin, setBreakMin] = useState(5);
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState('work'); // 'work' | 'break'
  const [secs, setSecs] = useState(25 * 60);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef(null);
  const totalSecs = phase === 'work' ? workMin * 60 : breakMin * 60;

  useEffect(() => {
    if (!isRunning) return;
    intervalRef.current = setInterval(() => {
      setSecs(s => {
        if (s <= 1) {
          clearInterval(intervalRef.current);
          if (phase === 'work') {
            addNotif({ type: 'success', icon: '🍅', title: 'انتهت جلسة التركيز!', msg: 'خذ استراحة مكتسبة' });
            onSession(workMin);
            setSessions(prev => prev + 1);
            setPhase('break');
            setSecs(breakMin * 60);
          } else {
            addNotif({ type: 'info', icon: '💪', title: 'انتهت الاستراحة!', msg: 'جاهز للجولة التالية؟' });
            setPhase('work');
            setSecs(workMin * 60);
          }
          setIsRunning(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [isRunning, phase, workMin, breakMin]);

  function toggle() { setIsRunning(p => !p); }
  function reset() { setIsRunning(false); setPhase('work'); setSecs(workMin * 60); }

  const mins = Math.floor(secs / 60).toString().padStart(2, '0');
  const sec2 = (secs % 60).toString().padStart(2, '0');
  const circum = 2 * Math.PI * 90;
  const dashOffset = circum - (circum * (1 - secs / totalSecs));
  const strokeColor = phase === 'work' ? 'var(--accent)' : 'var(--green)';

  return (
    <div className="page">
      <div className="section-title mb-16" style={{ justifyContent: 'center', fontSize: 20 }}>
        <span>🍅</span> مؤقت بومودورو
      </div>

      <div className="card" style={{ maxWidth: 480, margin: '0 auto 20px' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="tabs" style={{ maxWidth: 240, margin: '0 auto 24px' }}>
            <div className={`tab ${phase === 'work' ? 'active' : ''}`} onClick={() => { setPhase('work'); setSecs(workMin * 60); setIsRunning(false); }}>عمل</div>
            <div className={`tab ${phase === 'break' ? 'active' : ''}`} onClick={() => { setPhase('break'); setSecs(breakMin * 60); setIsRunning(false); }}>راحة</div>
          </div>

          <div className="pomo-timer-ring">
            <svg width="220" height="220" viewBox="0 0 220 220" className="pomo-circle">
              <circle className="pomo-circle-bg" cx="110" cy="110" r="90" />
              <circle cx="110" cy="110" r="90" fill="none" stroke={strokeColor} strokeWidth="8"
                strokeLinecap="round" strokeDasharray={circum} strokeDashoffset={dashOffset}
                style={{ transition: 'stroke-dashoffset 1s linear', filter: `drop-shadow(0 0 12px ${phase === 'work' ? 'rgba(124,110,240,0.5)' : 'rgba(16,185,129,0.5)'})` }} />
            </svg>
            <div className="pomo-time">
              <div className="pomo-digits" style={{ color: strokeColor }}>{mins}:{sec2}</div>
              <div className="pomo-phase">{phase === 'work' ? '🎯 وقت التركيز' : '☕ وقت الراحة'}</div>
            </div>
          </div>

          <div className="pomo-controls">
            <button className="pomo-btn pomo-btn-secondary" onClick={reset} title="إعادة">↺</button>
            <button className="pomo-btn pomo-btn-main" onClick={toggle}>{isRunning ? '⏸' : '▶'}</button>
            <button className="pomo-btn pomo-btn-secondary" onClick={() => { setPhase(phase === 'work' ? 'break' : 'work'); setSecs(phase === 'work' ? breakMin * 60 : workMin * 60); setIsRunning(false); }} title="تخطي">⏭</button>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 8 }}>جلسات اليوم: <strong style={{ color: 'var(--accent2)' }}>{sessions}</strong></div>
            <div className="pomo-sessions">
              {[...Array(8)].map((_, i) => (
                <div key={i} className={`pomo-dot ${i < sessions ? 'done' : ''}`} />
              ))}
            </div>
          </div>
        </div>

        <div className="pomo-settings">
          {[['workMin', setWorkMin, '⏱️ دقائق العمل'], ['breakMin', setBreakMin, '☕ دقائق الراحة']].map(([key, setter, label]) => (
            <div key={key} className="pomo-setting">
              <div className="pomo-setting-label">{label}</div>
              <div className="pomo-setting-value">
                <div className="pomo-adj" onClick={() => { setter(p => Math.max(1, p - 1)); if (!isRunning) setSecs(key === 'workMin' ? Math.max(1, workMin - 1) * 60 : Math.max(1, breakMin - 1) * 60); }}>−</div>
                <div className="pomo-setting-num">{key === 'workMin' ? workMin : breakMin}</div>
                <div className="pomo-adj" onClick={() => { setter(p => Math.min(90, p + 1)); if (!isRunning) setSecs(key === 'workMin' ? Math.min(90, workMin + 1) * 60 : Math.min(90, breakMin + 1) * 60); }}>+</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ maxWidth: 480, margin: '0 auto' }}>
        <div className="section-title mb-16"><span>💡</span> نصائح التركيز</div>
        {[
          ['📵', 'أغلق الإشعارات أثناء جلسة العمل'],
          ['💧', 'احتفظ بكوب ماء بجانبك'],
          ['🎵', 'استمع لموسيقى بدون كلمات'],
          ['📝', 'حدد هدفًا واحدًا للجلسة'],
        ].map(([icon, tip]) => (
          <div key={tip} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: 20 }}>{icon}</span>
            <span style={{ fontSize: 13, color: 'var(--text2)' }}>{tip}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// STATS PAGE
// ============================================================
function StatsPage({ tasks, goals, pomodoroSessions, todayFocus }) {
  const maxTasks = Math.max(...WEEKLY_STATS.map(d => d.tasks), 1);
  const maxFocus = Math.max(...WEEKLY_STATS.map(d => d.focus), 1);
  const [chartType, setChartType] = useState('tasks');

  const done = tasks.filter(t => t.done).length;
  const total = tasks.length;
  const pct = total ? Math.round(done / total * 100) : 0;
  const topGoal = goals.sort((a, b) => b.progress - a.progress)[0];

  return (
    <div className="page">
      <div className="section-title mb-16" style={{ fontSize: 20 }}><span>📊</span> الإحصائيات والتحليلات</div>

      <div className="stats-grid">
        <div className="stat-card purple" style={{ padding: 16 }}>
          <div style={{ fontSize: 20, marginBottom: 6 }}>✅</div>
          <div className="stat-value" style={{ fontSize: 28 }}>{done}</div>
          <div className="stat-label">مهام مكتملة</div>
        </div>
        <div className="stat-card green" style={{ padding: 16 }}>
          <div style={{ fontSize: 20, marginBottom: 6 }}>🎯</div>
          <div className="stat-value" style={{ fontSize: 28 }}>{todayFocus.toFixed(1)}س</div>
          <div className="stat-label">ساعات تركيز اليوم</div>
        </div>
        <div className="stat-card amber" style={{ padding: 16 }}>
          <div style={{ fontSize: 20, marginBottom: 6 }}>🍅</div>
          <div className="stat-value" style={{ fontSize: 28 }}>{pomodoroSessions}</div>
          <div className="stat-label">جلسات بومودورو</div>
        </div>
        <div className="stat-card blue" style={{ padding: 16 }}>
          <div style={{ fontSize: 20, marginBottom: 6 }}>📈</div>
          <div className="stat-value" style={{ fontSize: 28 }}>{pct}%</div>
          <div className="stat-label">معدل الإنجاز</div>
        </div>
      </div>

      <div className="grid-2">
        {/* Weekly Chart */}
        <div className="card">
          <div className="section-header">
            <div className="section-title"><span>📅</span> هذا الأسبوع</div>
            <div style={{ display: 'flex', gap: 4 }}>
              <button className={`btn btn-sm ${chartType === 'tasks' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setChartType('tasks')}>مهام</button>
              <button className={`btn btn-sm ${chartType === 'focus' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setChartType('focus')}>تركيز</button>
            </div>
          </div>
          <div className="chart-bar-wrap">
            {WEEKLY_STATS.map((d, i) => {
              const val = chartType === 'tasks' ? d.tasks : d.focus;
              const max = chartType === 'tasks' ? maxTasks : maxFocus;
              const h = Math.max(10, (val / max) * 100);
              return (
                <div key={i} className="chart-bar-col">
                  <div className="chart-bar-value">{chartType === 'tasks' ? d.tasks : `${d.focus}س`}</div>
                  <div className="chart-bar" style={{ height: `${h}%`, background: `linear-gradient(180deg, var(--accent), var(--accent3))` }} />
                  <div className="chart-bar-label">{d.day.slice(0,2)}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Goals Progress */}
        <div className="card">
          <div className="section-title mb-16"><span>🎯</span> تقدم الأهداف</div>
          {goals.slice(0, 4).map(g => (
            <div key={g.id} style={{ marginBottom: 14 }}>
              <div className="flex justify-between items-center" style={{ marginBottom: 6 }}>
                <span style={{ fontSize: 13 }}>{g.title}</span>
                <span style={{ fontSize: 12, color: g.color, fontWeight: 700 }}>{g.progress}%</span>
              </div>
              <ProgressBar pct={g.progress} color={g.color} h={7} />
            </div>
          ))}
          {topGoal && (
            <div style={{ marginTop: 16, padding: '10px 14px', background: 'var(--bg3)', borderRadius: 10, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 4 }}>🏆 أفضل هدف</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: topGoal.color }}>{topGoal.title} — {topGoal.progress}%</div>
            </div>
          )}
        </div>
      </div>

      {/* Priority Breakdown */}
      <div className="card">
        <div className="section-title mb-16"><span>📌</span> توزيع المهام حسب الأولوية</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[['high','🔴','عالية','var(--red)'],['medium','🟡','متوسطة','var(--amber)'],['low','🔵','منخفضة','var(--blue)']].map(([p, icon, label, color]) => {
            const c = tasks.filter(t => t.priority === p).length;
            const d = tasks.filter(t => t.priority === p && t.done).length;
            return (
              <div key={p} style={{ background: 'var(--bg3)', borderRadius: 12, padding: 16, border: '1px solid var(--border)', textAlign: 'center' }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
                <div style={{ fontSize: 22, fontWeight: 900, color, fontFamily: 'Tajawal, sans-serif' }}>{c}</div>
                <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>{label}</div>
                <div style={{ fontSize: 11, color: 'var(--green)', marginTop: 4 }}>{d} مكتملة</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// AI ASSISTANT PAGE
// ============================================================
function AIPage({ tasks, goals, addNotif }) {
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'مرحباً! أنا مساعدك الذكي للإنتاجية 🤖\n\nيمكنني مساعدتك في:\n• تحليل مهامك وأهدافك\n• اقتراح جدول يومك\n• تحديد أسباب التأجيل\n• تقديم نصائح مخصصة\n\nما الذي تريد معرفته اليوم؟' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function send() {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    const today = new Date().toISOString().split("T")[0];
    const todayTasks = tasks.filter(t => t.date === today);
    const donePct = todayTasks.length ? Math.round(tasks.filter(t=>t.done).length/todayTasks.length*100) : 0;

    const systemPrompt = `أنت مساعد إنتاجية ذكي باللغة العربية. تساعد المستخدم في إدارة مهامه وأهدافه الشخصية.

بيانات المستخدم الحالية:
- المهام اليوم: ${todayTasks.length} مهمة (${tasks.filter(t=>t.done&&t.date===today).length} مكتملة، ${donePct}% إنجاز)
- الأهداف النشطة: ${goals.filter(g=>g.status==='active').map(g=>`${g.title} (${g.progress}%)`).join('، ')}
- المهام المعلقة: ${tasks.filter(t=>!t.done&&t.priority==='high').length} مهام عالية الأولوية غير مكتملة

قدم نصائح مخصصة وعملية باللغة العربية. كن موجزاً ومفيداً. استخدم الإيموجي بشكل مناسب.`;

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: systemPrompt,
          messages: [{ role: 'user', content: userMsg }]
        })
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || 'عذراً، حدث خطأ. حاول مرة أخرى.';
      setMessages(prev => [...prev, { role: 'bot', text: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'bot', text: 'عذراً، لم أتمكن من الاتصال. تأكد من اتصالك بالإنترنت وحاول مرة أخرى.' }]);
    } finally {
      setLoading(false);
    }
  }

  const suggestions = [
    'ما أهم مهمة يجب إنجازها اليوم؟',
    'حلل أسباب تأجيلي للمهام',
    'كيف أحسّن إنتاجيتي؟',
    'رتّب لي جدول اليوم',
    'راجع أدائي هذا الأسبوع',
  ];

  return (
    <div className="page">
      <div className="section-title mb-16" style={{ fontSize: 20 }}><span>🤖</span> المساعد الذكي</div>

      <div className="card" style={{ marginBottom: 16, padding: '16px 20px' }}>
        <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 10, fontWeight: 600 }}>💡 اقتراحات سريعة:</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {suggestions.map(s => (
            <button key={s} className="btn btn-ghost btn-sm" onClick={() => { setInput(s); }}>{s}</button>
          ))}
        </div>
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 0, minHeight: 400 }}>
        <div className="ai-chat" style={{ flex: 1, maxHeight: 450, overflowY: 'auto', padding: 4 }}>
          {messages.map((m, i) => (
            <div key={i} className={`ai-message ${m.role === 'user' ? 'user' : ''}`}>
              <div className={`ai-avatar ${m.role === 'user' ? 'user' : ''}`}>{m.role === 'bot' ? '🤖' : '👤'}</div>
              <div className={`ai-bubble ${m.role === 'bot' ? 'bot' : 'user'}`} style={{ whiteSpace: 'pre-line' }}>{m.text}</div>
            </div>
          ))}
          {loading && (
            <div className="ai-message">
              <div className="ai-avatar">🤖</div>
              <div className="ai-bubble bot" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div className="spinner" />
                <span style={{ color: 'var(--text2)', fontSize: 13 }}>يفكر...</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 12 }}>
          <div className="ai-input-row">
            <input className="ai-input" placeholder="اسألني أي شيء عن إنتاجيتك..." value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            />
            <button className="btn btn-primary" onClick={send} disabled={loading} style={{ flexShrink: 0 }}>
              {loading ? <div className="spinner" /> : 'إرسال ✈️'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// AUTH PAGE
// ============================================================
function AuthPage({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit() {
    if (!email || !password) { setError('يرجى إدخال البريد وكلمة المرور'); return; }
    setLoading(true); setError('');
    try {
      let result;
      if (mode === 'login') {
        result = await supabase.auth.signInWithPassword({ email, password });
      } else {
        result = await supabase.auth.signUp({ email, password });
      }
      if (result.error) { setError(result.error.message); }
      else if (result.data?.user) { onAuth(result.data.user); }
      else if (mode === 'signup') { setError('تم إنشاء الحساب! تحقق من بريدك للتفعيل ثم سجّل دخول.'); setMode('login'); }
    } catch (e) { setError('حدث خطأ، حاول مرة أخرى'); }
    setLoading(false);
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', fontFamily: "'IBM Plex Sans Arabic', sans-serif", direction: 'rtl' }}>
      <style>{styles}</style>
      <div style={{ width: '100%', maxWidth: 400, padding: '0 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 64, height: 64, background: 'linear-gradient(135deg, var(--accent), var(--accent3))', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 16px', boxShadow: '0 8px 30px rgba(124,110,240,0.4)' }}>⚡</div>
          <div style={{ fontSize: 28, fontWeight: 900, fontFamily: 'Tajawal, sans-serif', color: 'var(--text)' }}>إنجاز</div>
          <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 4 }}>نظام إدارة حياتك الشخصية</div>
        </div>

        <div className="card" style={{ padding: 28 }}>
          <div className="tabs" style={{ marginBottom: 24 }}>
            <div className={`tab ${mode === 'login' ? 'active' : ''}`} onClick={() => { setMode('login'); setError(''); }}>تسجيل الدخول</div>
            <div className={`tab ${mode === 'signup' ? 'active' : ''}`} onClick={() => { setMode('signup'); setError(''); }}>حساب جديد</div>
          </div>

          <div className="form-group">
            <label className="form-label">📧 البريد الإلكتروني</label>
            <input className="form-input" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} />
          </div>
          <div className="form-group">
            <label className="form-label">🔒 كلمة المرور</label>
            <input className="form-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} />
          </div>

          {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: 'var(--red)', marginBottom: 16 }}>{error}</div>}

          <button className="btn btn-primary w-full" onClick={submit} disabled={loading} style={{ width: '100%', justifyContent: 'center', height: 44, fontSize: 15 }}>
            {loading ? <div className="spinner" /> : mode === 'login' ? '🚀 دخول' : '✨ إنشاء حساب'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MAIN APP
// ============================================================
export default function App() {
  const [page, setPage] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [goals, setGoalsState] = useState([]);
  const [tasks, setTasksState] = useState([]);
  const [pomodoroSessions, setPomodoroSessions] = useState(2);
  const [todayFocus, setTodayFocus] = useState(0.83);
  const [notifs, setNotifs] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dbLoading, setDbLoading] = useState(false);

  // Check session on load
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null);
      setAuthLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user || null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // Load data when user logs in
  useEffect(() => {
    if (user) { loadData(); }
    else { setGoalsState([]); setTasksState([]); }
  }, [user]);

  async function loadData() {
    setDbLoading(true);
    const [{ data: goalsData }, { data: tasksData }] = await Promise.all([
      supabase.from('goals').select('*').eq('user_id', user.id).order('created_at'),
      supabase.from('tasks').select('*').eq('user_id', user.id).order('created_at'),
    ]);
    if (goalsData) setGoalsState(goalsData.map(g => ({ ...g, subtasks: g.subtasks || [] })));
    if (tasksData) setTasksState(tasksData);
    setDbLoading(false);
  }

  // Wrap setGoals to sync with Supabase
  async function setGoals(updater) {
    setGoalsState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      syncGoals(prev, next);
      return next;
    });
  }

  async function syncGoals(prev, next) {
    const added = next.filter(n => !prev.find(p => p.id === n.id));
    const removed = prev.filter(p => !next.find(n => n.id === p.id));
    const changed = next.filter(n => {
      const old = prev.find(p => p.id === n.id);
      return old && JSON.stringify(old) !== JSON.stringify(n);
    });
    for (const g of added) {
      await supabase.from('goals').insert({ ...g, user_id: user.id, id: undefined });
    }
    for (const g of removed) {
      await supabase.from('goals').delete().eq('id', g.id);
    }
    for (const g of changed) {
      await supabase.from('goals').update({ title: g.title, category: g.category, progress: g.progress, status: g.status, color: g.color, start_date: g.startDate || g.start_date, end_date: g.endDate || g.end_date, subtasks: g.subtasks }).eq('id', g.id);
    }
  }

  async function setTasks(updater) {
    setTasksState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      syncTasks(prev, next);
      return next;
    });
  }

  async function syncTasks(prev, next) {
    const added = next.filter(n => !prev.find(p => p.id === n.id));
    const removed = prev.filter(p => !next.find(n => n.id === p.id));
    const changed = next.filter(n => {
      const old = prev.find(p => p.id === n.id);
      return old && JSON.stringify(old) !== JSON.stringify(n);
    });
    for (const t of added) {
      await supabase.from('tasks').insert({ title: t.title, priority: t.priority, date: t.date, done: t.done, completed_at: t.completedAt, repeat: t.repeat || 'none', goal_id: null, user_id: user.id });
    }
    for (const t of removed) {
      await supabase.from('tasks').delete().eq('id', t.id);
    }
    for (const t of changed) {
      await supabase.from('tasks').update({ title: t.title, priority: t.priority, date: t.date, done: t.done, completed_at: t.completedAt, repeat: t.repeat || 'none' }).eq('id', t.id);
    }
  }

  function addNotif(n) {
    const id = Date.now();
    setNotifs(p => [...p, { ...n, id }]);
    setTimeout(() => setNotifs(p => p.filter(x => x.id !== id)), 3500);
  }

  function onPomodoroSession(mins) {
    setPomodoroSessions(p => p + 1);
    setTodayFocus(p => p + mins / 60);
  }

  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
  }

  const today = new Date();
  const dateStr = today.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const pendingCount = tasks.filter(t => !t.done && t.date === today.toISOString().split("T")[0]).length;

  const NAV = [
    { id: 'dashboard', icon: '🏠', label: 'الرئيسية' },
    { id: 'goals', icon: '🎯', label: 'الأهداف' },
    { id: 'tasks', icon: '✅', label: 'المهام', badge: pendingCount || null },
    { id: 'pomodoro', icon: '🍅', label: 'بومودورو' },
    { id: 'stats', icon: '📊', label: 'الإحصائيات' },
    { id: 'ai', icon: '🤖', label: 'المساعد الذكي' },
  ];

  const PAGE_TITLES = { dashboard: 'لوحة التحكم', goals: 'إدارة الأهداف', tasks: 'المهام اليومية', pomodoro: 'مؤقت بومودورو', stats: 'الإحصائيات', ai: 'المساعد الذكي' };

  if (authLoading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0b0f' }}>
      <style>{styles}</style>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚡</div>
        <div className="spinner" style={{ margin: '0 auto' }} />
      </div>
    </div>
  );

  if (!user) return <AuthPage onAuth={setUser} />;

  return (
    <>
      <style>{styles}</style>
      <div className="app-shell">
        <div className={`mobile-overlay ${sidebarOpen ? 'show' : ''}`} onClick={() => setSidebarOpen(false)} />

        <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-logo">
            <div className="logo-mark">
              <div className="logo-icon">⚡</div>
              <div>
                <div className="logo-text">إنجاز</div>
                <div className="logo-sub">نظام إدارة حياتك</div>
              </div>
            </div>
          </div>

          <div className="nav-section">
            <div className="nav-label">القائمة الرئيسية</div>
            {NAV.map(n => (
              <div key={n.id} className={`nav-item ${page === n.id ? 'active' : ''}`}
                onClick={() => { setPage(n.id); setSidebarOpen(false); }}>
                <span className="icon">{n.icon}</span>
                {n.label}
                {n.badge ? <span className="nav-badge">{n.badge}</span> : null}
              </div>
            ))}
          </div>

          <div className="sidebar-footer">
            <div className="user-card" onClick={logout} title="تسجيل الخروج">
              <div className="user-avatar">{user.email?.[0]?.toUpperCase() || 'م'}</div>
              <div>
                <div className="user-name" style={{ fontSize: 12 }}>{user.email}</div>
                <div className="user-role" style={{ color: 'var(--red)', fontSize: 11 }}>🚪 تسجيل خروج</div>
              </div>
            </div>
          </div>
        </nav>

        <div className="main">
          <div className="topbar">
            <div>
              <div className="topbar-title">{PAGE_TITLES[page]}</div>
              <div className="topbar-date">{dateStr}</div>
            </div>
            <div className="topbar-actions">
              <div className="btn-icon menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</div>
              {dbLoading && <div className="spinner" style={{ width: 18, height: 18 }} />}
              <div className="btn-icon" onClick={() => addNotif({ type: 'info', icon: '🔔', title: 'لا إشعارات جديدة' })}>🔔</div>
            </div>
          </div>

          {page === 'dashboard' && <DashboardPage tasks={tasks} setTasks={setTasks} goals={goals} pomodoroSessions={pomodoroSessions} todayFocus={todayFocus} addNotif={addNotif} />}
          {page === 'goals' && <GoalsPage goals={goals} setGoals={setGoals} addNotif={addNotif} />}
          {page === 'tasks' && <TasksPage tasks={tasks} setTasks={setTasks} goals={goals} addNotif={addNotif} />}
          {page === 'pomodoro' && <PomodoroPage onSession={onPomodoroSession} addNotif={addNotif} />}
          {page === 'stats' && <StatsPage tasks={tasks} goals={goals} pomodoroSessions={pomodoroSessions} todayFocus={todayFocus} />}
          {page === 'ai' && <AIPage tasks={tasks} goals={goals} addNotif={addNotif} />}
        </div>
      </div>

      <Notification notifs={notifs} />
    </>
  );
}
