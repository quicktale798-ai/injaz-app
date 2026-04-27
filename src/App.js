import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://gkzdepanaphjijrqepie.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdremRlcGFuYXBoamlqcnFlcGllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMjQyMzEsImV4cCI6MjA5MjgwMDIzMX0.Rsh4wgCtLSa7tQEUuvYLyFfDOSqVwzizibLA0MTORoc";
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

  /* ALERT BANNER */
  .alert-banner {
    position: fixed; top: 80px; left: 50%; transform: translateX(-50%);
    z-index: 500; display: flex; flex-direction: column; gap: 8px;
    width: calc(100% - 40px); max-width: 400px;
    animation: slideDown 0.3s ease;
  }
  @keyframes slideDown { from { opacity:0; transform: translateX(-50%) translateY(-20px); } to { opacity:1; transform: translateX(-50%) translateY(0); } }
  .alert-card {
    border-radius: 14px; padding: 14px 18px;
    display: flex; align-items: center; gap: 12px;
    box-shadow: 0 8px 30px rgba(0,0,0,0.5);
    backdrop-filter: blur(20px);
    animation: fadeIn 0.3s ease;
  }
  .alert-card.now { background: linear-gradient(135deg, rgba(239,68,68,0.95), rgba(220,38,38,0.95)); border: 1px solid rgba(255,255,255,0.2); }
  .alert-card.warn { background: linear-gradient(135deg, rgba(245,158,11,0.95), rgba(217,119,6,0.95)); border: 1px solid rgba(255,255,255,0.2); }
  .alert-icon { font-size: 24px; flex-shrink: 0; }
  .alert-content { flex: 1; }
  .alert-title { font-size: 13px; font-weight: 700; color: white; }
  .alert-task { font-size: 12px; color: rgba(255,255,255,0.85); margin-top: 2px; }
  .alert-close { color: rgba(255,255,255,0.7); cursor: pointer; font-size: 16px; flex-shrink: 0; }
  .alert-close:hover { color: white; }

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
const PRAYERS = [
  { id: 'fajr',    name: 'الفجر',   icon: '🌙' },
  { id: 'dhuhr',   name: 'الظهر',   icon: '☀️' },
  { id: 'asr',     name: 'العصر',   icon: '🌤️' },
  { id: 'maghrib', name: 'المغرب',  icon: '🌅' },
  { id: 'isha',    name: 'العشاء',  icon: '🌃' },
];

function PrayerTrackerWidget() {
  const todayKey = `prayers-${new Date().toISOString().split('T')[0]}`;
  const [checked, setChecked] = useState(() => {
    try { return JSON.parse(localStorage.getItem(todayKey)) || []; } catch { return []; }
  });

  // Reset daily
  useEffect(() => {
    const lastDay = localStorage.getItem('prayer-last-day');
    const today = new Date().toISOString().split('T')[0];
    if (lastDay !== today) {
      localStorage.setItem('prayer-last-day', today);
      localStorage.removeItem(todayKey);
      setChecked([]);
    }
  }, []);

  function toggle(id) {
    setChecked(prev => {
      const next = prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id];
      localStorage.setItem(todayKey, JSON.stringify(next));
      return next;
    });
  }

  const donePct = Math.round(checked.length / 5 * 100);

  return (
    <div style={{ background: 'linear-gradient(135deg, rgba(124,110,240,0.1), rgba(6,182,212,0.06))', border: '1px solid rgba(124,110,240,0.2)', borderRadius: 16, padding: '16px 20px', marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>🕌</span>
          <span style={{ fontSize: 15, fontWeight: 700 }}>الصلوات الخمس</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--text2)' }}>{checked.length}/5</span>
          <div style={{ background: 'var(--bg4)', borderRadius: 20, padding: '3px 10px', fontSize: 11, color: donePct === 100 ? 'var(--green)' : 'var(--accent2)', fontWeight: 700 }}>
            {donePct === 100 ? '✅ أكملت صلواتك' : `${donePct}%`}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {PRAYERS.map(p => {
          const done = checked.includes(p.id);
          return (
            <div key={p.id} onClick={() => toggle(p.id)} style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              padding: '10px 4px', borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s',
              background: done ? 'rgba(124,110,240,0.25)' : 'var(--bg3)',
              border: `1px solid ${done ? 'rgba(124,110,240,0.5)' : 'var(--border)'}`,
              transform: done ? 'translateY(-2px)' : 'none',
              boxShadow: done ? '0 4px 12px rgba(124,110,240,0.2)' : 'none',
            }}>
              <span style={{ fontSize: 18 }}>{done ? '✅' : p.icon}</span>
              <span style={{ fontSize: 10, fontWeight: 600, color: done ? 'var(--accent2)' : 'var(--text2)' }}>{p.name}</span>
            </div>
          );
        })}
      </div>
      {donePct === 100 && (
        <div style={{ marginTop: 10, textAlign: 'center', fontSize: 12, color: 'var(--green)', fontWeight: 600 }}>
          🌟 ماشاء الله — أكملت صلواتك اليوم!
        </div>
      )}
    </div>
  );
}

function DashboardPage({ tasks, setTasks, goals, setGoals, pomodoroSessions, todayFocus, addNotif }) {
  const today = new Date().toISOString().split("T")[0];
  const todayTasks = tasks.filter(t => t.date === today);
  const doneTasks = todayTasks.filter(t => t.done);
  const pct = todayTasks.length ? Math.round((doneTasks.length / todayTasks.length) * 100) : 0;
  const quote = QUOTES[new Date().getDay() % QUOTES.length];
  const [expandedGoal, setExpandedGoal] = useState(null);

  async function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const done = !task.done;
    const now = new Date();
    const completedAt = done ? `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}` : null;
    await supabase.from('tasks').update({ done, completed_at: completedAt }).eq('id', id);
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done, completedAt } : t));
    if (done) addNotif({ type: 'success', icon: '🎉', title: 'أحسنت!', msg: task.title });
  }

  const sortedTasks = [...todayTasks].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    const p = { high: 0, medium: 1, low: 2 };
    return (p[a.priority] ?? 1) - (p[b.priority] ?? 1);
  });

  const activeGoals = goals.filter(g => g.status === 'active');

  const [mobileTab, setMobileTab] = useState('tasks'); // 'tasks' | 'goals' | 'prayers'

  return (
    <div style={{ height: 'calc(100vh - 64px)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

      {/* ── Stats Row ─────────────────────────────────── */}
      <div style={{ padding: '12px 16px 0', flexShrink: 0 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 12 }}>
          {[
            { icon: '✅', val: doneTasks.length,                     label: 'مكتملة',  sub: `${todayTasks.length} إجمالاً`, color: 'var(--accent)' },
            { icon: '⏳', val: todayTasks.filter(t=>!t.done).length, label: 'متبقية',  sub: 'اليوم',                        color: 'var(--amber)'  },
            { icon: '🎯', val: todayFocus.toFixed(1)+'س',            label: 'تركيز',   sub: `${pomodoroSessions} جلسة`,      color: 'var(--green)'  },
            { icon: '📈', val: pct+'%',                              label: 'الإنجاز', sub: pct>=70?'🔥رائع':'💪استمر',     color: pct>=70?'var(--green)':'var(--amber)' },
          ].map((s,i) => (
            <div key={i} style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:12, padding:'10px 8px', textAlign:'center' }}>
              <div style={{ fontSize:18, marginBottom:3 }}>{s.icon}</div>
              <div style={{ fontSize:18, fontWeight:900, fontFamily:'Tajawal,sans-serif', color:s.color, lineHeight:1 }}>{s.val}</div>
              <div style={{ fontSize:9, color:'var(--text2)', marginTop:2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Mobile tabs ── (hidden on desktop) */}
        <div className="mobile-tabs" style={{ display:'none', gap:0, background:'var(--bg3)', borderRadius:12, padding:3, marginBottom:10 }}>
          {[['tasks','📋 المهام'],['goals','🎯 الأهداف'],['prayers','🕌 الصلوات']].map(([id,lbl])=>(
            <div key={id} onClick={()=>setMobileTab(id)} style={{
              flex:1, textAlign:'center', padding:'8px 4px', borderRadius:9, fontSize:12, fontWeight:600, cursor:'pointer', transition:'all 0.2s',
              background: mobileTab===id ? 'var(--accent)' : 'transparent',
              color: mobileTab===id ? 'white' : 'var(--text2)',
            }}>{lbl}</div>
          ))}
        </div>
      </div>

      {/* ── Desktop: 3 columns  /  Mobile: tabbed ───── */}
      <div className="dash-body" style={{ flex:1, minHeight:0, padding:'0 16px 16px', display:'grid', gridTemplateColumns:'1fr 1fr 300px', gap:14, overflow:'hidden' }}>

        {/* ═══ COL 1: Tasks ═══ */}
        <div className="dash-col-tasks" style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:16, display:'flex', flexDirection:'column', overflow:'hidden', minHeight:0 }}>
          <div style={{ padding:'14px 16px 10px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
            <span style={{ fontSize:14, fontWeight:700 }}>📋 مهام اليوم</span>
            <div style={{ position:'relative', width:46, height:46 }}>
              <svg width="46" height="46" viewBox="0 0 46 46">
                <circle cx="23" cy="23" r="17" fill="none" stroke="var(--bg4)" strokeWidth="5"/>
                <circle cx="23" cy="23" r="17" fill="none" stroke="var(--accent)" strokeWidth="5"
                  strokeLinecap="round" strokeDasharray={106.8}
                  strokeDashoffset={106.8-(106.8*pct/100)}
                  style={{transform:'rotate(-90deg)',transformOrigin:'23px 23px',transition:'stroke-dashoffset 1s ease'}}/>
              </svg>
              <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',fontSize:9,fontWeight:900,color:'var(--accent)',fontFamily:'Tajawal,sans-serif'}}>{pct}%</div>
            </div>
          </div>
          <div style={{ flex:1, overflowY:'auto', padding:'10px 12px' }}>
            {sortedTasks.length===0 ? (
              <div style={{textAlign:'center',padding:'30px 0',color:'var(--text3)'}}>
                <div style={{fontSize:32,marginBottom:8}}>🌟</div>
                <div style={{fontSize:12}}>لا مهام اليوم</div>
              </div>
            ) : sortedTasks.map(t => {
              const linkedGoal = goals.find(g=>String(g.id)===String(t.goalId||t.goal_id));
              const isOverdue = !t.done && t.time && new Date(`${today}T${t.time}:00`) < new Date();
              return (
                <div key={t.id} style={{
                  background:t.done?'rgba(16,185,129,0.04)':'var(--bg3)',
                  border:`1px solid ${t.done?'rgba(16,185,129,0.12)':isOverdue?'rgba(239,68,68,0.25)':'var(--border)'}`,
                  borderRadius:11, padding:'10px 12px', marginBottom:8,
                  borderRight:`3px solid ${t.priority==='high'?'var(--red)':t.priority==='medium'?'var(--amber)':'var(--blue)'}`,
                  opacity:t.done?0.65:1, transition:'all 0.2s',
                }}>
                  <div style={{display:'flex',alignItems:'flex-start',gap:9}}>
                    <div onClick={()=>toggleTask(t.id)} style={{
                      width:19,height:19,borderRadius:6,flexShrink:0,marginTop:2,cursor:'pointer',
                      border:`2px solid ${t.done?'var(--green)':t.priority==='high'?'var(--red)':t.priority==='medium'?'var(--amber)':'var(--blue)'}`,
                      background:t.done?'var(--green)':'transparent',
                      display:'flex',alignItems:'center',justifyContent:'center',
                      color:'white',fontSize:10,fontWeight:700,transition:'all 0.2s',
                    }}>{t.done?'✓':''}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:'flex',justifyContent:'space-between',gap:6}}>
                        <div onClick={()=>toggleTask(t.id)} style={{
                          fontSize:13,fontWeight:600,cursor:'pointer',flex:1,
                          textDecoration:t.done?'line-through':'none',
                          color:t.done?'var(--text3)':'var(--text)',
                        }}>{t.title}</div>
                        {t.time&&<span style={{fontSize:10,padding:'2px 6px',borderRadius:20,flexShrink:0,background:isOverdue&&!t.done?'rgba(239,68,68,0.15)':'rgba(245,158,11,0.12)',color:isOverdue&&!t.done?'var(--red)':'var(--amber)',fontWeight:700}}>⏰{t.time}</span>}
                      </div>
                      <div style={{display:'flex',flexWrap:'wrap',gap:4,marginTop:4}}>
                        {linkedGoal&&<span style={{fontSize:9,padding:'2px 6px',borderRadius:20,background:`${linkedGoal.color}18`,color:linkedGoal.color,fontWeight:600}}>🎯{linkedGoal.title}</span>}
                        {t.repeat&&t.repeat!=='none'&&<span style={{fontSize:9,padding:'2px 6px',borderRadius:20,background:'rgba(124,110,240,0.12)',color:'var(--accent2)',fontWeight:600}}>{t.repeat==='daily'?'🔁يومي':t.repeat==='weekly'?'📆أسبوعي':'🗓️شهري'}</span>}
                        {t.done&&t.completedAt&&<span style={{fontSize:9,padding:'2px 6px',borderRadius:20,background:'rgba(16,185,129,0.12)',color:'var(--green)',fontWeight:600}}>✅{t.completedAt}</span>}
                      </div>
                      {t.note&&<div style={{marginTop:5,padding:'4px 8px',background:'var(--bg4)',borderRadius:6,borderRight:'2px solid var(--accent3)',fontSize:11,color:'var(--text2)'}}>📝{t.note}</div>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ═══ COL 2: Goals ═══ */}
        <div className="dash-col-goals" style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:16, display:'flex', flexDirection:'column', overflow:'hidden', minHeight:0 }}>
          <div style={{ padding:'14px 16px 10px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
            <span style={{ fontSize:14, fontWeight:700 }}>🎯 إنجاز الأهداف</span>
            <span style={{ fontSize:10, color:'var(--text3)', background:'var(--bg3)', padding:'3px 8px', borderRadius:20 }}>يتصفر يومياً</span>
          </div>
          <div style={{ flex:1, overflowY:'auto', padding:'10px 12px' }}>
            {activeGoals.length===0&&<div style={{textAlign:'center',padding:'30px 0',color:'var(--text3)'}}><div style={{fontSize:32,marginBottom:8}}>🎯</div><div style={{fontSize:12}}>لا أهداف نشطة</div></div>}
            {activeGoals.map(g=>{
              const gTasks=tasks.filter(t=>String(t.goalId||t.goal_id)===String(g.id)&&t.date===today);
              const gDone=gTasks.filter(t=>t.done);
              const dp=gTasks.length?Math.round(gDone.length/gTasks.length*100):0;
              const exp=expandedGoal===g.id;
              return (
                <div key={g.id} style={{marginBottom:10,background:'var(--bg3)',borderRadius:12,border:`1px solid ${exp?g.color+'40':'var(--border)'}`,overflow:'hidden',transition:'all 0.2s'}}>
                  <div style={{padding:'11px 13px',cursor:'pointer'}} onClick={()=>setExpandedGoal(exp?null:g.id)}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:7}}>
                      <div style={{display:'flex',alignItems:'center',gap:7}}>
                        <div style={{width:8,height:8,borderRadius:'50%',background:g.color,boxShadow:`0 0 5px ${g.color}80`}}/>
                        <span style={{fontSize:12,fontWeight:700}}>{g.title}</span>
                      </div>
                      <div style={{display:'flex',alignItems:'center',gap:7}}>
                        <div style={{position:'relative',width:30,height:30}}>
                          <svg width="30" height="30" viewBox="0 0 30 30" style={{transform:'rotate(-90deg)'}}>
                            <circle cx="15" cy="15" r="11" fill="none" stroke="var(--bg4)" strokeWidth="4"/>
                            <circle cx="15" cy="15" r="11" fill="none" stroke={g.color} strokeWidth="4" strokeLinecap="round"
                              strokeDasharray={69.1} strokeDashoffset={69.1-(69.1*dp/100)}
                              style={{transition:'stroke-dashoffset 0.8s ease'}}/>
                          </svg>
                          <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',fontSize:7,fontWeight:900,color:g.color,fontFamily:'Tajawal,sans-serif'}}>{dp}%</div>
                        </div>
                        <span style={{fontSize:10,color:'var(--text3)'}}>{exp?'▲':'▼'}</span>
                      </div>
                    </div>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                      <span style={{fontSize:10,color:'var(--text2)'}}>{gDone.length}/{gTasks.length} مهام اليوم</span>
                      <span style={{fontSize:10,color:'var(--text3)'}}>إجمالي: <span style={{color:g.color,fontWeight:700}}>{g.progress}%</span></span>
                    </div>
                    <ProgressBar pct={dp} color={g.color} h={4}/>
                    {gTasks.length===0&&<div style={{fontSize:9,color:'var(--text3)',marginTop:4,fontStyle:'italic'}}>💡 أضف مهمة وربطها بهذا الهدف</div>}
                  </div>
                  {exp&&gTasks.length>0&&(
                    <div style={{borderTop:'1px solid var(--border)',padding:'7px 12px 9px'}}>
                      {gTasks.map(t=>(
                        <div key={t.id} style={{display:'flex',alignItems:'center',gap:7,padding:'6px 8px',borderRadius:8,background:t.done?'rgba(16,185,129,0.06)':'var(--bg4)',border:`1px solid ${t.done?'rgba(16,185,129,0.15)':'var(--border)'}`,marginBottom:4}}>
                          <div onClick={()=>toggleTask(t.id)} style={{width:16,height:16,borderRadius:5,border:`2px solid ${t.done?'var(--green)':g.color}`,background:t.done?'var(--green)':'transparent',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,fontSize:9,color:'white',fontWeight:700,transition:'all 0.2s'}}>{t.done?'✓':''}</div>
                          <div style={{flex:1,fontSize:12,fontWeight:500,textDecoration:t.done?'line-through':'none',color:t.done?'var(--text3)':'var(--text)',cursor:'pointer'}} onClick={()=>toggleTask(t.id)}>{t.title}</div>
                          {t.completedAt&&<span style={{fontSize:9,color:'var(--green)'}}>✅{t.completedAt}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ═══ COL 3: Prayers + Quote ═══ */}
        <div className="dash-col-prayers" style={{ display:'flex', flexDirection:'column', gap:12, overflow:'hidden', minHeight:0 }}>
          {/* Prayers */}
          <div style={{ background:'linear-gradient(135deg,rgba(124,110,240,0.1),rgba(6,182,212,0.06))', border:'1px solid rgba(124,110,240,0.2)', borderRadius:16, padding:'14px', flexShrink:0 }}>
            <PrayerTrackerWidget />
          </div>
          {/* Quote */}
          <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:16, padding:'16px 18px', flex:1 }}>
            <div style={{ fontSize:40, color:'var(--accent)', opacity:0.15, lineHeight:1, fontFamily:'serif', marginBottom:-4 }}>"</div>
            <div style={{ fontSize:13, lineHeight:1.8, color:'var(--text)', fontWeight:500 }}>{quote}</div>
            <div style={{ fontSize:11, color:'var(--accent2)', marginTop:10, fontWeight:600 }}>✨ اقتباس اليوم</div>
          </div>
        </div>

      </div>
    </div>
  )
