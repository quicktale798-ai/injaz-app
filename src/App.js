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

  return (
    <div style={{ padding: '20px 28px', height: 'calc(100vh - 64px)', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Top row: Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, flexShrink: 0 }}>
        {[
          { icon: '✅', val: doneTasks.length, label: 'مكتملة', sub: `${todayTasks.length} إجمالاً`, color: 'var(--accent)' },
          { icon: '⏳', val: todayTasks.filter(t=>!t.done).length, label: 'متبقية', sub: 'اليوم', color: 'var(--amber)' },
          { icon: '🎯', val: todayFocus.toFixed(1)+'س', label: 'تركيز', sub: `${pomodoroSessions} جلسة`, color: 'var(--green)' },
          { icon: '📈', val: pct+'%', label: 'الإنجاز', sub: pct>=70?'🔥 رائع':'💪 استمر', color: pct>=70?'var(--green)':'var(--amber)' },
        ].map((s,i) => (
          <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 26 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 900, fontFamily: 'Tajawal,sans-serif', color: s.color, lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>{s.label}</div>
              <div style={{ fontSize: 10, color: s.color, marginTop: 1 }}>{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main area: 3 columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 320px', gap: 16, flex: 1, minHeight: 0 }}>

        {/* Col 1: Tasks */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 700 }}>
              <span>📋</span> مهام اليوم
            </div>
            <div style={{ position: 'relative', width: 52, height: 52, flexShrink: 0 }}>
              <svg width="52" height="52" viewBox="0 0 52 52">
                <circle cx="26" cy="26" r="20" fill="none" stroke="var(--bg4)" strokeWidth="5"/>
                <circle cx="26" cy="26" r="20" fill="none" stroke="var(--accent)" strokeWidth="5"
                  strokeLinecap="round" strokeDasharray={125.6}
                  strokeDashoffset={125.6-(125.6*pct/100)}
                  style={{transform:'rotate(-90deg)',transformOrigin:'26px 26px',transition:'stroke-dashoffset 1s ease'}}/>
              </svg>
              <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',fontSize:10,fontWeight:900,color:'var(--accent)',fontFamily:'Tajawal,sans-serif'}}>{pct}%</div>
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
            {sortedTasks.length === 0 ? (
              <div style={{ textAlign:'center', padding:'40px 0', color:'var(--text3)' }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>🌟</div>
                <div style={{ fontSize: 13 }}>لا مهام اليوم</div>
              </div>
            ) : sortedTasks.map(t => {
              const linkedGoal = goals.find(g => String(g.id) === String(t.goalId || t.goal_id));
              const isOverdue = !t.done && t.time && new Date(`${today}T${t.time}:00`) < new Date();
              return (
                <div key={t.id} style={{
                  background: t.done ? 'rgba(16,185,129,0.04)' : 'var(--bg3)',
                  border: `1px solid ${t.done ? 'rgba(16,185,129,0.12)' : isOverdue ? 'rgba(239,68,68,0.25)' : 'var(--border)'}`,
                  borderRadius: 12, padding: '11px 14px', marginBottom: 8,
                  borderRight: `3px solid ${t.priority==='high'?'var(--red)':t.priority==='medium'?'var(--amber)':'var(--blue)'}`,
                  opacity: t.done ? 0.65 : 1, transition: 'all 0.2s',
                }}>
                  <div style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
                    <div onClick={()=>toggleTask(t.id)} style={{
                      width:20,height:20,borderRadius:6,flexShrink:0,marginTop:2,cursor:'pointer',
                      border:`2px solid ${t.done?'var(--green)':t.priority==='high'?'var(--red)':t.priority==='medium'?'var(--amber)':'var(--blue)'}`,
                      background:t.done?'var(--green)':'transparent',
                      display:'flex',alignItems:'center',justifyContent:'center',
                      color:'white',fontSize:11,fontWeight:700,transition:'all 0.2s',
                    }}>{t.done?'✓':''}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{ display:'flex', justifyContent:'space-between', gap:6 }}>
                        <div onClick={()=>toggleTask(t.id)} style={{
                          fontSize:13,fontWeight:600,cursor:'pointer',flex:1,
                          textDecoration:t.done?'line-through':'none',
                          color:t.done?'var(--text3)':'var(--text)',
                        }}>{t.title}</div>
                        {t.time && <span style={{fontSize:10,padding:'2px 7px',borderRadius:20,flexShrink:0,background:isOverdue&&!t.done?'rgba(239,68,68,0.15)':'rgba(245,158,11,0.12)',color:isOverdue&&!t.done?'var(--red)':'var(--amber)',fontWeight:700}}>⏰{t.time}</span>}
                      </div>
                      <div style={{display:'flex',flexWrap:'wrap',gap:4,marginTop:5}}>
                        {linkedGoal && <span style={{fontSize:9,padding:'2px 6px',borderRadius:20,background:`${linkedGoal.color}18`,color:linkedGoal.color,fontWeight:600}}>🎯{linkedGoal.title}</span>}
                        {t.repeat&&t.repeat!=='none'&&<span style={{fontSize:9,padding:'2px 6px',borderRadius:20,background:'rgba(124,110,240,0.12)',color:'var(--accent2)',fontWeight:600}}>{t.repeat==='daily'?'🔁يومي':t.repeat==='weekly'?'📆أسبوعي':'🗓️شهري'}</span>}
                        {t.done&&t.completedAt&&<span style={{fontSize:9,padding:'2px 6px',borderRadius:20,background:'rgba(16,185,129,0.12)',color:'var(--green)',fontWeight:600}}>✅{t.completedAt}</span>}
                      </div>
                      {t.note&&<div style={{marginTop:6,padding:'5px 8px',background:'var(--bg4)',borderRadius:7,borderRight:'2px solid var(--accent3)',fontSize:11,color:'var(--text2)'}}>📝{t.note}</div>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Col 2: Goals daily progress */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 700, display:'flex', alignItems:'center', gap:8 }}><span>🎯</span>إنجاز الأهداف اليوم</div>
            <span style={{ fontSize: 10, color:'var(--text3)', background:'var(--bg3)', padding:'3px 8px', borderRadius:20 }}>يتصفر يومياً</span>
          </div>
          <div style={{ flex:1, overflowY:'auto', padding:'12px 16px' }}>
            {activeGoals.length===0&&<div style={{textAlign:'center',padding:'40px 0',color:'var(--text3)'}}><div style={{fontSize:36,marginBottom:8}}>🎯</div><div style={{fontSize:13}}>لا أهداف نشطة</div></div>}
            {activeGoals.map(g=>{
              const gTasks = tasks.filter(t=>String(t.goalId||t.goal_id)===String(g.id)&&t.date===today);
              const gDone = gTasks.filter(t=>t.done);
              const dp = gTasks.length?Math.round(gDone.length/gTasks.length*100):0;
              const exp = expandedGoal===g.id;
              return (
                <div key={g.id} style={{marginBottom:10,background:'var(--bg3)',borderRadius:12,border:`1px solid ${exp?g.color+'40':'var(--border)'}`,overflow:'hidden',transition:'all 0.2s'}}>
                  <div style={{padding:'12px 14px',cursor:'pointer'}} onClick={()=>setExpandedGoal(exp?null:g.id)}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <div style={{width:9,height:9,borderRadius:'50%',background:g.color,boxShadow:`0 0 6px ${g.color}80`}}/>
                        <span style={{fontSize:13,fontWeight:700}}>{g.title}</span>
                      </div>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <div style={{position:'relative',width:34,height:34}}>
                          <svg width="34" height="34" viewBox="0 0 34 34" style={{transform:'rotate(-90deg)'}}>
                            <circle cx="17" cy="17" r="13" fill="none" stroke="var(--bg4)" strokeWidth="4"/>
                            <circle cx="17" cy="17" r="13" fill="none" stroke={g.color} strokeWidth="4" strokeLinecap="round"
                              strokeDasharray={81.7} strokeDashoffset={81.7-(81.7*dp/100)}
                              style={{transition:'stroke-dashoffset 0.8s ease'}}/>
                          </svg>
                          <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',fontSize:8,fontWeight:900,color:g.color,fontFamily:'Tajawal,sans-serif'}}>{dp}%</div>
                        </div>
                        <span style={{fontSize:10,color:'var(--text3)'}}>{exp?'▲':'▼'}</span>
                      </div>
                    </div>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
                      <span style={{fontSize:10,color:'var(--text2)'}}>{gDone.length}/{gTasks.length} مهام اليوم</span>
                      <span style={{fontSize:10,color:'var(--text3)'}}>إجمالي: <span style={{color:g.color,fontWeight:700}}>{g.progress}%</span></span>
                    </div>
                    <ProgressBar pct={dp} color={g.color} h={5}/>
                    {gTasks.length===0&&<div style={{fontSize:10,color:'var(--text3)',marginTop:5,fontStyle:'italic'}}>💡 أضف مهمة وربطها بهذا الهدف</div>}
                  </div>
                  {exp&&gTasks.length>0&&(
                    <div style={{borderTop:'1px solid var(--border)',padding:'8px 14px 10px'}}>
                      {gTasks.map(t=>(
                        <div key={t.id} style={{display:'flex',alignItems:'center',gap:8,padding:'7px 8px',borderRadius:8,background:t.done?'rgba(16,185,129,0.06)':'var(--bg4)',border:`1px solid ${t.done?'rgba(16,185,129,0.15)':'var(--border)'}`,marginBottom:5}}>
                          <div onClick={()=>toggleTask(t.id)} style={{width:18,height:18,borderRadius:5,border:`2px solid ${t.done?'var(--green)':g.color}`,background:t.done?'var(--green)':'transparent',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,fontSize:10,color:'white',fontWeight:700,transition:'all 0.2s'}}>{t.done?'✓':''}</div>
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

        {/* Col 3: Prayers + Quote */}
        <div style={{ display:'flex', flexDirection:'column', gap:16, overflow:'hidden' }}>
          {/* Prayers */}
          <div style={{ background:'linear-gradient(135deg,rgba(124,110,240,0.1),rgba(6,182,212,0.06))', border:'1px solid rgba(124,110,240,0.2)', borderRadius:16, padding:'16px 16px 12px', flexShrink:0 }}>
            <PrayerTrackerWidget />
          </div>
          {/* Quote */}
          <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:16, padding:'18px 20px', flex:1, display:'flex', flexDirection:'column', justifyContent:'center' }}>
            <div style={{ fontSize:48, color:'var(--accent)', opacity:0.15, lineHeight:1, marginBottom:-8, fontFamily:'serif' }}>"</div>
            <div style={{ fontSize:14, lineHeight:1.8, color:'var(--text)', fontWeight:500 }}>{quote}</div>
            <div style={{ fontSize:11, color:'var(--accent2)', marginTop:10, fontWeight:600 }}>✨ اقتباس اليوم</div>
          </div>
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

  async function addGoal() {
    if (!addForm.title.trim()) return;
    const uid = (await supabase.auth.getUser()).data.user?.id;
    const { data, error } = await supabase.from('goals').insert({
      user_id: uid, title: addForm.title, category: addForm.category || '',
      progress: 0, status: addForm.status || 'active', color: addForm.color || '#6366f1',
      start_date: addForm.startDate || '', end_date: addForm.endDate || '', subtasks: []
    }).select().single();
    if (data) {
      setGoals(prev => [...prev, { ...data, subtasks: [] }]);
      addNotif({ type: 'success', icon: '🎯', title: 'تم إنشاء الهدف', msg: data.title });
    } else { addNotif({ type: 'warning', icon: '⚠️', title: 'خطأ', msg: error?.message }); }
    setShowAdd(false);
    setAddForm(EMPTY_GOAL_FORM);
  }

  function openEdit(g) {
    setEditForm({ title: g.title, category: g.category || '', startDate: g.start_date || g.startDate || '', endDate: g.end_date || g.endDate || '', color: g.color, status: g.status });
    setEditGoal(g);
  }

  async function saveEdit() {
    if (!editForm.title.trim()) return;
    await supabase.from('goals').update({
      title: editForm.title, category: editForm.category, status: editForm.status,
      color: editForm.color, start_date: editForm.startDate, end_date: editForm.endDate
    }).eq('id', editGoal.id);
    setGoals(prev => prev.map(g => g.id === editGoal.id ? { ...g, ...editForm, start_date: editForm.startDate, end_date: editForm.endDate } : g));
    addNotif({ type: 'info', icon: '✏️', title: 'تم تعديل الهدف', msg: editForm.title });
    setEditGoal(null);
  }

  function confirmDelete(g) { setDeleteGoal(g); }

  async function doDelete() {
    await supabase.from('goals').delete().eq('id', deleteGoal.id);
    setGoals(prev => prev.filter(g => g.id !== deleteGoal.id));
    addNotif({ type: 'warning', icon: '🗑️', title: 'تم حذف الهدف', msg: deleteGoal.title });
    setDeleteGoal(null);
    if (expandedGoal === deleteGoal.id) setExpandedGoal(null);
  }

  async function addSubtask(goalId) {
    if (!newSubtask.trim()) return;
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;
    const updatedSubtasks = [...(goal.subtasks || []), { id: Date.now(), title: newSubtask, done: false }];
    await supabase.from('goals').update({ subtasks: updatedSubtasks }).eq('id', goalId);
    setGoals(prev => prev.map(g => g.id === goalId ? { ...g, subtasks: updatedSubtasks } : g));
    setNewSubtask('');
  }

  async function deleteSubtask(goalId, subId) {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;
    const updated = goal.subtasks.filter(s => s.id !== subId);
    const progress = updated.length ? Math.round(updated.filter(s => s.done).length / updated.length * 100) : goal.progress;
    await supabase.from('goals').update({ subtasks: updated, progress }).eq('id', goalId);
    setGoals(prev => prev.map(g => g.id === goalId ? { ...g, subtasks: updated, progress } : g));
  }

  async function toggleSubtask(goalId, subId) {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;
    const updated = goal.subtasks.map(s => s.id === subId ? { ...s, done: !s.done } : s);
    const progress = updated.length ? Math.round(updated.filter(s => s.done).length / updated.length * 100) : goal.progress;
    await supabase.from('goals').update({ subtasks: updated, progress }).eq('id', goalId);
    setGoals(prev => prev.map(g => g.id === goalId ? { ...g, subtasks: updated, progress } : g));
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
const EMPTY_TASK_FORM = { title: '', goalId: '', priority: 'medium', date: new Date().toISOString().split("T")[0], repeat: 'none', note: '', time: '', weekDays: [] };

const REPEAT_LABELS = { none: 'لا تكرار', daily: 'يومي', weekly: 'أسبوعي', monthly: 'شهري' };
const WEEK_DAYS = [
  { id: 0, label: 'أحد' }, { id: 1, label: 'اثنين' }, { id: 2, label: 'ثلاثاء' },
  { id: 3, label: 'أربعاء' }, { id: 4, label: 'خميس' }, { id: 5, label: 'جمعة' }, { id: 6, label: 'سبت' }
];

function getNextRepeatDate(fromDate, repeat) {
  const d = new Date(fromDate + 'T00:00:00');
  if (repeat === 'daily')        d.setDate(d.getDate() + 1);
  else if (repeat === 'weekly')  d.setDate(d.getDate() + 7);
  else if (repeat === 'monthly') d.setMonth(d.getMonth() + 1);
  return d.toISOString().split('T')[0];
}

function TaskForm({ form, setForm, goals }) {
  function toggleWeekDay(id) {
    const days = form.weekDays || [];
    const next = days.includes(id) ? days.filter(d => d !== id) : [...days, id];
    setForm(p => ({ ...p, weekDays: next }));
  }
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
          <label className="form-label">📅 التاريخ</label>
          <input type="date" className="form-input" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">⏰ وقت التذكير</label>
          <input type="time" className="form-input" value={form.time || ''} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} />
        </div>
        <div className="form-group">
          <label className="form-label">🔁 التكرار</label>
          <select className="form-select" value={form.repeat || 'none'} onChange={e => setForm(p => ({ ...p, repeat: e.target.value, weekDays: [] }))}>
            <option value="none">🚫 لا تكرار</option>
            <option value="daily">🔁 يومي</option>
            <option value="weekly">📆 أسبوعي — أيام محددة</option>
            <option value="monthly">🗓️ شهري</option>
          </select>
        </div>
      </div>

      {/* Weekly days selector */}
      {form.repeat === 'weekly' && (
        <div className="form-group">
          <label className="form-label">📆 اختر أيام الأسبوع</label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {WEEK_DAYS.map(d => {
              const selected = (form.weekDays || []).includes(d.id);
              return (
                <div key={d.id} onClick={() => toggleWeekDay(d.id)} style={{ padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: `1px solid ${selected ? 'var(--accent)' : 'var(--border)'}`, background: selected ? 'var(--accent)' : 'var(--bg3)', color: selected ? 'white' : 'var(--text2)', transition: 'all 0.2s' }}>
                  {d.label}
                </div>
              );
            })}
          </div>
          {(form.weekDays || []).length === 0 && <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 6 }}>اختر يوماً واحداً على الأقل</div>}
        </div>
      )}

      <div className="form-group">
        <label className="form-label">ربط بهدف (اختياري)</label>
        <select className="form-select" value={form.goalId} onChange={e => setForm(p => ({ ...p, goalId: e.target.value }))}>
          <option value="">-- بدون هدف --</option>
          {goals.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
        </select>
      </div>

      {form.repeat && form.repeat !== 'none' && (
        <div style={{ background: 'rgba(124,110,240,0.08)', border: '1px solid rgba(124,110,240,0.2)', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: 'var(--accent2)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>✨</span>
          <span>عند الإكمال ستُجدَّد تلقائياً ({REPEAT_LABELS[form.repeat]})</span>
          {form.time && <span>• تذكير {form.time} 🔔</span>}
        </div>
      )}

      <div className="form-group">
        <label className="form-label">📝 ملاحظات (اختياري)</label>
        <textarea className="form-textarea" placeholder="أضف ملاحظاتك..." value={form.note || ''} onChange={e => setForm(p => ({ ...p, note: e.target.value }))} style={{ minHeight: 64 }} />
      </div>
    </>
  );
}

function TasksPage({ tasks, setTasks, goals, setGoals, addNotif }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [deleteTask, setDeleteTask] = useState(null);
  const [addForm, setAddForm] = useState(EMPTY_TASK_FORM);
  const [editForm, setEditForm] = useState(EMPTY_TASK_FORM);
  const [filter, setFilter] = useState('all');

  async function addTask() {
    if (!addForm.title.trim()) return;
    const goalId = addForm.goalId || null;
    const { data, error } = await supabase.from('tasks').insert({
      user_id: (await supabase.auth.getUser()).data.user?.id,
      title: addForm.title, priority: addForm.priority,
      date: addForm.date, done: false, completed_at: null,
      repeat: addForm.repeat || 'none', goal_id: goalId,
      note: addForm.note || null,
      time: addForm.time || null,
      week_days: addForm.weekDays?.length ? addForm.weekDays : null
    }).select().single();
    if (data) {
      setTasks(prev => [...prev, { ...data, completedAt: null, goalId: data.goal_id, note: data.note, time: data.time, weekDays: data.week_days }]);
      addNotif({ type: 'success', icon: '✅', title: 'تم إضافة المهمة', msg: data.title });
    } else { addNotif({ type: 'warning', icon: '⚠️', title: 'خطأ', msg: error?.message }); }
    setShowAdd(false);
    setAddForm(EMPTY_TASK_FORM);
  }

  function openEdit(t) {
    setEditForm({ title: t.title, goalId: t.goalId ? String(t.goalId) : '', priority: t.priority, date: t.date, repeat: t.repeat || 'none', note: t.note || '', time: t.time || '', weekDays: t.weekDays || t.week_days || [] });
    setEditTask(t);
  }

  async function saveEdit() {
    if (!editForm.title.trim()) return;
    await supabase.from('tasks').update({
      title: editForm.title, priority: editForm.priority,
      date: editForm.date, repeat: editForm.repeat || 'none',
      goal_id: editForm.goalId || null, note: editForm.note || null,
      time: editForm.time || null,
      week_days: editForm.weekDays?.length ? editForm.weekDays : null
    }).eq('id', editTask.id);
    setTasks(prev => prev.map(t => t.id === editTask.id ? { ...t, ...editForm, repeat: editForm.repeat || 'none', goalId: editForm.goalId || null, weekDays: editForm.weekDays } : t));
    addNotif({ type: 'info', icon: '✏️', title: 'تم تعديل المهمة', msg: editForm.title });
    setEditTask(null);
  }

  async function doDeleteTask() {
    await supabase.from('tasks').delete().eq('id', deleteTask.id);
    setTasks(prev => prev.filter(t => t.id !== deleteTask.id));
    addNotif({ type: 'warning', icon: '🗑️', title: 'تم حذف المهمة', msg: deleteTask.title });
    setDeleteTask(null);
  }

  async function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const done = !task.done;
    const now = new Date();
    const completedAt = done ? `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}` : null;
    await supabase.from('tasks').update({ done, completed_at: completedAt }).eq('id', id);
    const updatedTasks = tasks.map(t => t.id === id ? { ...t, done, completedAt } : t);
    setTasks(updatedTasks);

    if (done) {
      addNotif({ type: 'success', icon: '🎉', title: 'أحسنت! 🌟', msg: `أكملت: ${task.title}` });

      // Update linked goal progress
      const linkedGoalId = task.goalId || task.goal_id;
      if (linkedGoalId) {
        const linkedGoal = goals.find(g => g.id === linkedGoalId);
        if (linkedGoal) {
          // Count completed tasks linked to this goal today
          const goalTasks = updatedTasks.filter(t => (t.goalId || t.goal_id) === linkedGoalId);
          const donePct = goalTasks.length ? Math.round(goalTasks.filter(t => t.done).length / goalTasks.length * 100) : 0;
          const newProgress = Math.min(100, Math.max(linkedGoal.progress, donePct));
          await supabase.from('goals').update({ progress: newProgress }).eq('id', linkedGoalId);
          setGoals(prev => prev.map(g => g.id === linkedGoalId ? { ...g, progress: newProgress } : g));
          addNotif({ type: 'info', icon: '📈', title: `تقدم "${linkedGoal.title}"`, msg: `${newProgress}% ↑` });
        }
      }

      // Handle repeat
      if (task.repeat && task.repeat !== 'none') {
        const uid = (await supabase.auth.getUser()).data.user?.id;
        if (task.repeat === 'weekly' && task.weekDays?.length) {
          // Generate next occurrence for each selected day
          const today2 = new Date(task.date + 'T00:00:00');
          const nextDates = [];
          for (let i = 1; i <= 7; i++) {
            const d = new Date(today2); d.setDate(d.getDate() + i);
            if (task.weekDays.includes(d.getDay())) nextDates.push(d.toISOString().split('T')[0]);
          }
          for (const nextDate of nextDates) {
            const exists = updatedTasks.some(t => t.date === nextDate && t.title === task.title && !t.done);
            if (!exists) {
              const { data: next } = await supabase.from('tasks').insert({
                user_id: uid, title: task.title, priority: task.priority,
                date: nextDate, done: false, completed_at: null, repeat: task.repeat,
                goal_id: task.goalId || task.goal_id || null,
                time: task.time || null, week_days: task.weekDays,
                note: task.note || null
              }).select().single();
              if (next) setTasks(prev => [...prev, { ...next, completedAt: null, goalId: next.goal_id, weekDays: next.week_days }]);
            }
          }
          addNotif({ type: 'info', icon: '🔁', title: 'تم جدولة التكرار الأسبوعي', msg: task.title });
        } else {
          const nextDate = getNextRepeatDate(task.date, task.repeat);
          const exists = updatedTasks.some(t => t.date === nextDate && t.title === task.title && !t.done);
          if (!exists) {
            const { data: next } = await supabase.from('tasks').insert({
              user_id: uid, title: task.title, priority: task.priority,
              date: nextDate, done: false, completed_at: null, repeat: task.repeat,
              goal_id: task.goalId || task.goal_id || null,
              time: task.time || null, week_days: task.weekDays || null,
              note: task.note || null
            }).select().single();
            if (next) {
              setTasks(prev => [...prev, { ...next, completedAt: null, goalId: next.goal_id, weekDays: next.week_days }]);
              addNotif({ type: 'info', icon: '🔁', title: 'تم جدولة التكرار', msg: `${task.title} ← ${nextDate}` });
            }
          }
        }
      }
    }
  }

  async function reschedule(id) {
    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
    const newDate = tomorrow.toISOString().split("T")[0];
    await supabase.from('tasks').update({ date: newDate }).eq('id', id);
    setTasks(prev => prev.map(t => t.id === id ? { ...t, date: newDate } : t));
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
                {t.time && <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: 'rgba(245,158,11,0.15)', color: 'var(--amber)', fontWeight: 600 }}>⏰ {t.time}</span>}
                {t.repeat && t.repeat !== 'none' && (
                  <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 20, background: 'rgba(124,110,240,0.15)', color: 'var(--accent2)', fontWeight: 600 }}>
                    {t.repeat === 'daily' ? '🔁 يومي' : t.repeat === 'weekly' ? `📆 ${(t.weekDays||[]).map(d=>['أحد','اثنين','ثلاثاء','أربعاء','خميس','جمعة','سبت'][d]).join('،')}` : '🗓️ شهري'}
                  </span>
                )}
                {t.completedAt && <span className="task-time" style={{ color: 'var(--green)' }}>✓ {t.completedAt}</span>}
              </div>
              {t.note && <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 5, padding: '4px 8px', background: 'var(--bg4)', borderRadius: 6, borderRight: '2px solid var(--accent3)' }}>📝 {t.note}</div>}
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
// PWA INSTALL BUTTON
// ============================================================
function InstallPWAButton() {
  const [canInstall, setCanInstall] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true); return;
    }
    window.addEventListener('pwaInstallReady', () => setCanInstall(true));
    return () => window.removeEventListener('pwaInstallReady', () => {});
  }, []);

  if (installed || !canInstall) return null;

  return (
    <button className="btn btn-primary btn-sm" onClick={async () => {
      const ok = await window.installPWA?.();
      if (ok) setInstalled(true);
    }} style={{ gap: 6, fontSize: 12 }}>
      📲 تثبيت التطبيق
    </button>
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
  const [pomodoroSessions, setPomodoroSessions] = useState(0);
  const [todayFocus, setTodayFocus] = useState(0);
  const [notifs, setNotifs] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dbLoading, setDbLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);

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
    if (user) { loadData(user.id); }
    else { setGoalsState([]); setTasksState([]); }
  }, [user]);

  // Daily reset tracking
  useEffect(() => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('injaz-last-reset', today);
  }, [user]);

  // ── Notification System ──────────────────────────────────
  const [activeAlerts, setActiveAlerts] = useState([]);

  useEffect(() => {
    if (!user) return;
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    function sendAlert(task, type) {
      const key = `alert-${task.id}-${type}-${new Date().toDateString()}`;
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, '1');
      const isNow = type === 'now';
      const alertId = Date.now() + Math.random();

      // In-app banner
      setActiveAlerts(prev => [...prev, { id: alertId, task, isNow }]);
      setTimeout(() => setActiveAlerts(prev => prev.filter(a => a.id !== alertId)), 10000);

      // Browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification(isNow ? '⏰ حان وقت المهمة!' : '🔔 تذكير — بعد 5 دقائق', {
            body: task.title, dir: 'rtl', lang: 'ar',
            icon: '/icons/icon-192.png', tag: key,
          });
        } catch(e) {}
      }

      // Beep sound
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        [isNow ? 880 : 660, isNow ? 1100 : 880].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain); gain.connect(ctx.destination);
          osc.frequency.value = freq; osc.type = 'sine';
          gain.gain.setValueAtTime(0.25, ctx.currentTime + i * 0.25);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.25 + 0.4);
          osc.start(ctx.currentTime + i * 0.25);
          osc.stop(ctx.currentTime + i * 0.25 + 0.4);
        });
      } catch(e) {}
    }

    function checkTasks() {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const hh = now.getHours().toString().padStart(2,'0');
      const mm = now.getMinutes().toString().padStart(2,'0');
      const currentTime = `${hh}:${mm}`;

      tasks.forEach(t => {
        if (t.done || t.date !== today || !t.time) return;
        if (t.time === currentTime) {
          sendAlert(t, 'now');
        } else {
          try {
            const taskDate = new Date(`${today}T${t.time}:00`);
            const diff = taskDate - now;
            if (diff > 0 && diff <= 5 * 60 * 1000 + 59000) sendAlert(t, 'warn');
          } catch(e) {}
        }
      });
    }

    const interval = setInterval(checkTasks, 30000);
    checkTasks();
    return () => clearInterval(interval);
  }, [user, tasks]);

  async function loadData(uid) {
    setDbLoading(true);
    setDataLoaded(false);
    // Reset state first to avoid duplicates
    setGoalsState([]);
    setTasksState([]);
    try {
      const [{ data: goalsData }, { data: tasksData }] = await Promise.all([
        supabase.from('goals').select('*').eq('user_id', uid).order('created_at'),
        supabase.from('tasks').select('*').eq('user_id', uid).order('created_at'),
      ]);
      if (goalsData) setGoalsState(goalsData.map(g => ({ ...g, subtasks: g.subtasks || [] })));
      if (tasksData) setTasksState(tasksData.map(t => ({ ...t, completedAt: t.completed_at, goalId: t.goal_id, note: t.note, time: t.time, weekDays: t.week_days || [] })));
    } catch(e) { console.error('loadData error', e); }
    setDbLoading(false);
    setDataLoaded(true);
  }

  // Simple state setters - all DB ops done directly in components
  const setGoals = setGoalsState;
  const setTasks = setTasksState;

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

  const LoadingScreen = () => (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0b0f', flexDirection: 'column', gap: 16 }}>
      <style>{styles}</style>
      <div style={{ fontSize: 52 }}>⚡</div>
      <div className="spinner" style={{ margin: '0 auto' }} />
      <div style={{ color: 'var(--text2)', fontSize: 13, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>جاري تحميل بياناتك...</div>
    </div>
  );

  if (authLoading) return <LoadingScreen />;
  if (!user) return <AuthPage onAuth={setUser} />;
  if (!dataLoaded) return <LoadingScreen />;

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
              <InstallPWAButton />
              <div className="btn-icon" onClick={() => addNotif({ type: 'info', icon: '🔔', title: 'لا إشعارات جديدة' })}>🔔</div>
            </div>
          </div>

          {page === 'dashboard' && <DashboardPage tasks={tasks} setTasks={setTasks} goals={goals} setGoals={setGoals} pomodoroSessions={pomodoroSessions} todayFocus={todayFocus} addNotif={addNotif} />}
          {page === 'goals' && <GoalsPage goals={goals} setGoals={setGoals} addNotif={addNotif} />}
          {page === 'tasks' && <TasksPage tasks={tasks} setTasks={setTasks} goals={goals} setGoals={setGoals} addNotif={addNotif} />}
          {page === 'pomodoro' && <PomodoroPage onSession={onPomodoroSession} addNotif={addNotif} />}
          {page === 'stats' && <StatsPage tasks={tasks} goals={goals} pomodoroSessions={pomodoroSessions} todayFocus={todayFocus} />}
          {page === 'ai' && <AIPage tasks={tasks} goals={goals} addNotif={addNotif} />}
        </div>
      </div>

      <Notification notifs={notifs} />

      {/* In-app alert banners */}
      {activeAlerts.length > 0 && (
        <div className="alert-banner">
          {activeAlerts.map(a => (
            <div key={a.id} className={`alert-card ${a.isNow ? 'now' : 'warn'}`}>
              <div className="alert-icon">{a.isNow ? '⏰' : '🔔'}</div>
              <div className="alert-content">
                <div className="alert-title">{a.isNow ? 'حان وقت المهمة!' : 'تذكير — بعد 5 دقائق'}</div>
                <div className="alert-task">{a.task.title}</div>
              </div>
              <div className="alert-close" onClick={() => setActiveAlerts(prev => prev.filter(x => x.id !== a.id))}>✕</div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
