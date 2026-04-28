import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://gkzdepanaphjijrqepie.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdremRlcGFuYXBoamlqcnFlcGllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMjQyMzEsImV4cCI6MjA5MjgwMDIzMX0.Rsh4wgCtLSa7tQEUuvYLyFfDOSqVwzizibLA0MTORoc";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── Constants ────────────────────────────────────────────────
const QUOTES = [
  "النجاح ليس نهاية الطريق، والفشل ليس نهاية المطاف.",
  "ابدأ من حيث أنت، استخدم ما لديك، افعل ما تستطيع.",
  "كل يوم هو فرصة جديدة لتكون أفضل مما كنت عليه بالأمس.",
  "الإنتاجية تعني اتخاذ الإجراءات الصحيحة في الوقت المناسب.",
  "الوقت عملة لا تُسترجع، أنفقها بحكمة.",
  "خطوة واحدة كل يوم تصنع الفارق بعد عام كامل.",
  "التركيز هو الفن الأعلى للنجاح.",
];

const REPEAT_LABELS = { none:"لا تكرار", daily:"يومي", weekly:"أسبوعي", monthly:"شهري" };
const WEEK_DAYS = [
  {id:0,label:"أحد"},{id:1,label:"اثنين"},{id:2,label:"ثلاثاء"},
  {id:3,label:"أربعاء"},{id:4,label:"خميس"},{id:5,label:"جمعة"},{id:6,label:"سبت"},
];
const COLORS = ["#6366f1","#10b981","#f59e0b","#ef4444","#3b82f6","#06b6d4","#8b5cf6","#ec4899"];
const PRAYERS = [
  {id:"fajr",name:"الفجر",icon:"🌙"},{id:"dhuhr",name:"الظهر",icon:"☀️"},
  {id:"asr",name:"العصر",icon:"🌤️"},{id:"maghrib",name:"المغرب",icon:"🌅"},
  {id:"isha",name:"العشاء",icon:"🌃"},
];
const WEEKLY_STATS = [
  {day:"السبت",tasks:8,focus:3.5},{day:"الأحد",tasks:6,focus:2.8},
  {day:"الاثنين",tasks:9,focus:4.2},{day:"الثلاثاء",tasks:7,focus:3.1},
  {day:"الأربعاء",tasks:10,focus:5.0},{day:"الخميس",tasks:5,focus:2.5},
  {day:"الجمعة",tasks:4,focus:1.8},
];

const EMPTY_TASK_FORM = { title:"", goalId:"", priority:"medium", date: new Date().toISOString().split("T")[0], repeat:"none", note:"", time:"", weekDays:[] };
const EMPTY_GOAL_FORM = { title:"", category:"", startDate:"", endDate:"", color:"#6366f1", status:"active" };

function getNextRepeatDate(fromDate, repeat) {
  const d = new Date(fromDate + "T00:00:00");
  if (repeat === "daily")   d.setDate(d.getDate() + 1);
  else if (repeat === "weekly")  d.setDate(d.getDate() + 7);
  else if (repeat === "monthly") d.setMonth(d.getMonth() + 1);
  return d.toISOString().split("T")[0];
}

// ── Global Styles ────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;900&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap');
  :root {
    --bg:#0a0b0f; --bg2:#111218; --bg3:#1a1b24; --bg4:#22232f;
    --border:rgba(255,255,255,0.07); --border2:rgba(255,255,255,0.12);
    --text:#f0f0f8; --text2:#9899b0; --text3:#5a5b72;
    --accent:#7c6ef0; --accent2:#9d8ff5; --accent3:#5c4fd4;
    --green:#10b981; --amber:#f59e0b; --red:#ef4444; --blue:#3b82f6; --cyan:#06b6d4;
    --card-shadow:0 2px 20px rgba(0,0,0,0.4); --glow:0 0 30px rgba(124,110,240,0.15);
  }
  *{margin:0;padding:0;box-sizing:border-box;}
  body{font-family:'IBM Plex Sans Arabic','Tajawal',sans-serif;background:var(--bg);color:var(--text);direction:rtl;text-align:right;min-height:100vh;overflow-x:hidden;}
  ::-webkit-scrollbar{width:5px;} ::-webkit-scrollbar-track{background:var(--bg2);} ::-webkit-scrollbar-thumb{background:var(--accent3);border-radius:3px;}
  .app-shell{display:flex;min-height:100vh;}
  .sidebar{width:260px;background:var(--bg2);border-left:1px solid var(--border);display:flex;flex-direction:column;position:fixed;top:0;right:0;bottom:0;z-index:100;transition:transform 0.3s ease;}
  .sidebar-logo{padding:24px 20px 20px;border-bottom:1px solid var(--border);}
  .logo-mark{display:flex;align-items:center;gap:12px;}
  .logo-icon{width:40px;height:40px;background:linear-gradient(135deg,var(--accent),var(--accent3));border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px;box-shadow:0 4px 15px rgba(124,110,240,0.4);}
  .logo-text{font-family:'Tajawal',sans-serif;font-weight:900;font-size:16px;} .logo-sub{font-size:11px;color:var(--text2);margin-top:2px;}
  .nav-section{padding:16px 12px 8px;} .nav-label{font-size:10px;color:var(--text3);letter-spacing:1px;padding:0 8px 8px;text-transform:uppercase;}
  .nav-item{display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:10px;cursor:pointer;transition:all 0.2s;color:var(--text2);font-size:14px;font-weight:500;margin-bottom:2px;}
  .nav-item:hover{background:var(--bg3);color:var(--text);}
  .nav-item.active{background:linear-gradient(135deg,rgba(124,110,240,0.2),rgba(92,79,212,0.1));color:var(--accent2);border:1px solid rgba(124,110,240,0.2);}
  .nav-item .icon{font-size:18px;width:24px;text-align:center;} .nav-badge{margin-right:auto;background:var(--accent);color:white;font-size:10px;padding:2px 7px;border-radius:20px;font-weight:700;}
  .sidebar-footer{padding:16px 12px;margin-top:auto;border-top:1px solid var(--border);}
  .user-card{display:flex;align-items:center;gap:12px;padding:10px;border-radius:12px;background:var(--bg3);cursor:pointer;}
  .user-avatar{width:38px;height:38px;border-radius:10px;background:linear-gradient(135deg,var(--accent),var(--cyan));display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;}
  .user-name{font-size:13px;font-weight:600;} .user-role{font-size:11px;color:var(--text2);}
  .main{margin-right:260px;flex:1;min-height:100vh;display:flex;flex-direction:column;}
  .topbar{background:var(--bg2);border-bottom:1px solid var(--border);padding:0 28px;height:64px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:50;backdrop-filter:blur(10px);}
  .topbar-title{font-family:'Tajawal',sans-serif;font-size:20px;font-weight:700;} .topbar-date{font-size:13px;color:var(--text2);}
  .topbar-actions{display:flex;gap:8px;align-items:center;}
  .btn-icon{width:36px;height:36px;border-radius:10px;background:var(--bg3);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:16px;transition:all 0.2s;color:var(--text2);}
  .btn-icon:hover{background:var(--bg4);color:var(--text);}
  .page{padding:24px 28px;animation:fadeIn 0.3s ease;}
  @keyframes fadeIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
  .card{background:var(--bg2);border:1px solid var(--border);border-radius:16px;padding:20px;transition:all 0.2s;}
  .card:hover{border-color:var(--border2);box-shadow:var(--card-shadow);}
  .stats-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px;margin-bottom:20px;}
  .stat-card{background:var(--bg2);border:1px solid var(--border);border-radius:16px;padding:18px;position:relative;overflow:hidden;transition:all 0.3s;}
  .stat-card:hover{transform:translateY(-2px);box-shadow:var(--glow);border-color:var(--border2);}
  .stat-icon{font-size:26px;margin-bottom:10px;} .stat-value{font-family:'Tajawal',sans-serif;font-size:30px;font-weight:900;line-height:1;}
  .stat-label{font-size:12px;color:var(--text2);margin-top:4px;} .stat-trend{font-size:11px;color:var(--green);margin-top:6px;}
  .progress-bar{height:6px;background:var(--bg4);border-radius:10px;overflow:hidden;}
  .progress-fill{height:100%;border-radius:10px;transition:width 1s ease;}
  .task-item{display:flex;align-items:flex-start;gap:12px;padding:14px 16px;border-radius:12px;background:var(--bg3);border:1px solid var(--border);margin-bottom:8px;transition:all 0.2s;}
  .task-item:hover{border-color:var(--border2);}
  .task-check{width:20px;height:20px;border-radius:6px;border:2px solid var(--border2);cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px;transition:all 0.2s;font-size:11px;color:white;}
  .task-check.done{background:var(--green);border-color:var(--green);} .task-check.high{border-color:var(--red);} .task-check.medium{border-color:var(--amber);} .task-check.low{border-color:var(--blue);}
  .task-title{font-size:14px;font-weight:500;flex:1;} .task-title.done{text-decoration:line-through;}
  .task-meta{display:flex;gap:6px;align-items:center;margin-top:4px;flex-wrap:wrap;}
  .badge{font-size:10px;padding:2px 8px;border-radius:20px;font-weight:600;}
  .badge.high{background:rgba(239,68,68,0.15);color:var(--red);} .badge.medium{background:rgba(245,158,11,0.15);color:var(--amber);} .badge.low{background:rgba(59,130,246,0.15);color:var(--blue);} .badge.goal{background:rgba(124,110,240,0.15);color:var(--accent2);}
  .btn{padding:10px 20px;border-radius:10px;border:none;cursor:pointer;font-family:inherit;font-size:14px;font-weight:600;transition:all 0.2s;display:inline-flex;align-items:center;gap:8px;}
  .btn-primary{background:var(--accent);color:white;} .btn-primary:hover{background:var(--accent2);transform:translateY(-1px);box-shadow:0 4px 15px rgba(124,110,240,0.4);}
  .btn-ghost{background:var(--bg3);color:var(--text2);border:1px solid var(--border);} .btn-ghost:hover{background:var(--bg4);color:var(--text);}
  .btn-sm{padding:6px 14px;font-size:12px;border-radius:8px;}
  .btn-danger{background:rgba(239,68,68,0.15);color:var(--red);border:1px solid rgba(239,68,68,0.2);} .btn-danger:hover{background:rgba(239,68,68,0.28);}
  .goal-card{background:var(--bg2);border:1px solid var(--border);border-radius:16px;padding:20px;margin-bottom:16px;transition:all 0.3s;position:relative;overflow:hidden;}
  .goal-card:hover{transform:translateX(-4px);box-shadow:var(--card-shadow);}
  .goal-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;}
  .goal-title{font-size:16px;font-weight:700;} .goal-category{font-size:11px;color:var(--text2);margin-top:3px;}
  .goal-status{font-size:11px;padding:4px 10px;border-radius:20px;font-weight:600;}
  .status-active{background:rgba(16,185,129,0.15);color:var(--green);} .status-paused{background:rgba(245,158,11,0.15);color:var(--amber);} .status-done{background:rgba(59,130,246,0.15);color:var(--blue);}
  .subtask-list{margin-top:12px;} .subtask-item{display:flex;align-items:center;gap:8px;padding:6px 0;font-size:13px;color:var(--text2);border-bottom:1px solid var(--border);} .subtask-item:last-child{border-bottom:none;}
  .pomo-circle-bg{fill:none;stroke:var(--bg4);stroke-width:8;}
  .tabs{display:flex;gap:4px;background:var(--bg3);border-radius:12px;padding:4px;margin-bottom:20px;}
  .tab{flex:1;padding:8px;border-radius:8px;text-align:center;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.2s;color:var(--text2);}
  .tab.active{background:var(--accent);color:white;box-shadow:0 2px 10px rgba(124,110,240,0.3);}
  .section-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;}
  .section-title{font-size:16px;font-weight:700;display:flex;align-items:center;gap:8px;}
  .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.7);backdrop-filter:blur(6px);z-index:200;display:flex;align-items:center;justify-content:center;padding:20px;animation:fadeIn 0.2s;}
  .modal{background:var(--bg2);border:1px solid var(--border2);border-radius:20px;padding:28px;width:100%;max-width:520px;max-height:90vh;overflow-y:auto;}
  .modal-title{font-size:18px;font-weight:700;margin-bottom:20px;display:flex;align-items:center;gap:10px;}
  .form-group{margin-bottom:16px;} .form-label{font-size:13px;color:var(--text2);margin-bottom:6px;display:block;font-weight:500;}
  .form-input,.form-select,.form-textarea{width:100%;background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:10px 14px;font-family:inherit;font-size:14px;color:var(--text);outline:none;direction:rtl;transition:border-color 0.2s;}
  .form-input:focus,.form-select:focus,.form-textarea:focus{border-color:var(--accent);box-shadow:0 0 0 3px rgba(124,110,240,0.1);}
  .form-select option{background:var(--bg3);} .form-textarea{resize:vertical;min-height:80px;}
  .form-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
  .modal-actions{display:flex;gap:10px;margin-top:20px;justify-content:flex-end;}
  .notif-stack{position:fixed;bottom:24px;left:24px;z-index:300;display:flex;flex-direction:column;gap:8px;}
  .notif{background:var(--bg2);border:1px solid var(--border2);border-radius:12px;padding:14px 18px;font-size:13px;display:flex;align-items:center;gap:12px;min-width:280px;animation:slideIn 0.3s ease;box-shadow:0 8px 30px rgba(0,0,0,0.4);}
  .notif.success{border-color:rgba(16,185,129,0.3);} .notif.info{border-color:rgba(124,110,240,0.3);} .notif.warning{border-color:rgba(245,158,11,0.3);}
  @keyframes slideIn{from{opacity:0;transform:translateX(-20px);}to{opacity:1;transform:translateX(0);}}
  .empty{text-align:center;padding:40px 20px;color:var(--text3);} .empty-icon{font-size:40px;margin-bottom:12px;} .empty-text{font-size:14px;}
  .scroll-area{max-height:420px;overflow-y:auto;padding-left:4px;}
  .spinner{width:20px;height:20px;border:2px solid rgba(124,110,240,0.3);border-top-color:var(--accent);border-radius:50%;animation:spin 0.7s linear infinite;}
  @keyframes spin{to{transform:rotate(360deg);}}
  .ai-chat{display:flex;flex-direction:column;gap:12px;}
  .ai-message{display:flex;gap:12px;} .ai-message.user{flex-direction:row-reverse;}
  .ai-avatar{width:34px;height:34px;border-radius:10px;background:linear-gradient(135deg,var(--accent),var(--cyan));display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;}
  .ai-avatar.user{background:var(--bg3);border:1px solid var(--border);}
  .ai-bubble{padding:12px 16px;border-radius:12px;font-size:14px;line-height:1.7;max-width:85%;}
  .ai-bubble.bot{background:var(--bg3);border:1px solid var(--border);color:var(--text);border-radius:12px 2px 12px 12px;}
  .ai-bubble.user{background:var(--accent);color:white;border-radius:2px 12px 12px 12px;}
  .ai-input-row{display:flex;gap:8px;margin-top:8px;}
  .ai-input{flex:1;background:var(--bg3);border:1px solid var(--border);border-radius:12px;padding:12px 16px;font-family:inherit;font-size:14px;color:var(--text);outline:none;direction:rtl;transition:border-color 0.2s;}
  .ai-input:focus{border-color:var(--accent);}
  .alert-banner{position:fixed;top:80px;left:50%;transform:translateX(-50%);z-index:500;display:flex;flex-direction:column;gap:8px;width:calc(100% - 40px);max-width:400px;}
  .alert-card{border-radius:14px;padding:14px 18px;display:flex;align-items:center;gap:12px;box-shadow:0 8px 30px rgba(0,0,0,0.5);backdrop-filter:blur(20px);}
  .alert-card.now{background:linear-gradient(135deg,rgba(239,68,68,0.95),rgba(220,38,38,0.95));border:1px solid rgba(255,255,255,0.2);}
  .alert-card.warn{background:linear-gradient(135deg,rgba(245,158,11,0.95),rgba(217,119,6,0.95));border:1px solid rgba(255,255,255,0.2);}
  .pomo-btn{width:52px;height:52px;border-radius:50%;border:none;cursor:pointer;font-size:22px;display:flex;align-items:center;justify-content:center;transition:all 0.2s;}
  .pomo-btn-main{background:var(--accent);color:white;width:64px;height:64px;font-size:26px;box-shadow:0 4px 20px rgba(124,110,240,0.4);}
  .pomo-btn-main:hover{transform:scale(1.05);}
  .pomo-btn-secondary{background:var(--bg3);color:var(--text2);border:1px solid var(--border);}
  .pomo-dot{width:10px;height:10px;border-radius:50%;background:var(--bg4);transition:all 0.3s;}
  .pomo-dot.done{background:var(--accent);box-shadow:0 0 8px rgba(124,110,240,0.6);}
  .chart-bar-wrap{display:flex;align-items:flex-end;gap:8px;height:120px;}
  .chart-bar-col{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;height:100%;justify-content:flex-end;}
  .chart-bar{width:100%;border-radius:6px 6px 0 0;transition:height 1s ease;min-height:4px;cursor:pointer;}
  .chart-bar-label{font-size:10px;color:var(--text3);} .chart-bar-value{font-size:10px;color:var(--text2);font-weight:600;}
  .menu-btn{display:none;}
  .mobile-overlay{display:none;}
  /* Dashboard responsive */
  .db-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:14px;}
  .db-layout{display:grid;grid-template-columns:1fr 320px;gap:18px;align-items:start;}
  .db-tasks-grid{display:grid;grid-template-columns:1fr;gap:10px;}
  .db-sidebar{display:flex;flex-direction:column;gap:14px;}
  .db-quote-top{display:none;} .db-quote-side{display:block;}
  @media(max-width:900px){
    .db-layout{grid-template-columns:1fr;}
    .db-quote-top{display:block;margin-bottom:14px;}
    .db-quote-side{display:none;}
  }
  @media(max-width:768px){
    .sidebar{transform:translateX(260px);}
    .sidebar.open{transform:translateX(0);}
    .main{margin-right:0;}
    .menu-btn{display:flex!important;}
    .mobile-overlay.show{display:block;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:99;}
    .page{padding:16px;}
    .form-row{grid-template-columns:1fr;}
    .topbar{padding:0 16px;}
    .db-stats{grid-template-columns:repeat(2,1fr);}
  }
`;

// ── Small shared components ──────────────────────────────────
function ProgressBar({ pct, color = "var(--accent)", h = 6 }) {
  return (
    <div className="progress-bar" style={{ height: h }}>
      <div className="progress-fill" style={{ width: `${Math.min(100, pct)}%`, background: color, height: h }} />
    </div>
  );
}

function Notification({ notifs }) {
  return (
    <div className="notif-stack">
      {notifs.map(n => (
        <div key={n.id} className={`notif ${n.type}`}>
          <span style={{ fontSize: 20 }}>{n.icon}</span>
          <div>
            <div style={{ fontWeight: 600 }}>{n.title}</div>
            {n.msg && <div style={{ fontSize: 12, color: "var(--text2)", marginTop: 2 }}>{n.msg}</div>}
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

function ConfirmDialog({ open, onClose, onConfirm, title, msg }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 380 }}>
        <div style={{ textAlign: "center", padding: "8px 0 20px" }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>🗑️</div>
          <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{title}</div>
          <div style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.7 }}>{msg}</div>
        </div>
        <div className="modal-actions" style={{ justifyContent: "center" }}>
          <button className="btn btn-ghost" onClick={onClose}>إلغاء</button>
          <button className="btn btn-danger" onClick={onConfirm}>نعم، احذف</button>
        </div>
      </div>
    </div>
  );
}

// ── Prayer Tracker ───────────────────────────────────────────
function PrayerTracker() {
  const today = new Date().toISOString().split("T")[0];
  const key = `prayers-${today}`;
  const [checked, setChecked] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; }
  });
  useEffect(() => {
    const last = localStorage.getItem("prayer-last-day");
    if (last !== today) { localStorage.setItem("prayer-last-day", today); localStorage.removeItem(key); setChecked([]); }
  }, []);
  function toggle(id) {
    setChecked(prev => {
      const next = prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id];
      localStorage.setItem(key, JSON.stringify(next));
      return next;
    });
  }
  const allDone = checked.length === 5;
  return (
    <div style={{ background:"linear-gradient(135deg,rgba(124,110,240,0.1),rgba(6,182,212,0.05))", border:"1px solid rgba(124,110,240,0.2)", borderRadius:16, padding:"14px 16px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
        <span style={{ fontSize:14, fontWeight:700, display:"flex", alignItems:"center", gap:8 }}>🕌 الصلوات الخمس</span>
        <span style={{ fontSize:11, fontWeight:700, color: allDone ? "var(--green)" : "var(--text2)" }}>{checked.length}/5 {allDone ? "✅" : ""}</span>
      </div>
      <div style={{ display:"flex", gap:6 }}>
        {PRAYERS.map(p => {
          const done = checked.includes(p.id);
          return (
            <div key={p.id} onClick={() => toggle(p.id)} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:5, padding:"10px 2px", borderRadius:12, cursor:"pointer", transition:"all 0.25s", background: done ? "rgba(124,110,240,0.25)" : "var(--bg3)", border:`1px solid ${done ? "rgba(124,110,240,0.45)" : "var(--border)"}`, transform: done ? "translateY(-3px)" : "none", boxShadow: done ? "0 6px 16px rgba(124,110,240,0.2)" : "none" }}>
              <span style={{ fontSize:20 }}>{done ? "✅" : p.icon}</span>
              <span style={{ fontSize:9, fontWeight:700, color: done ? "var(--accent2)" : "var(--text3)" }}>{p.name}</span>
            </div>
          );
        })}
      </div>
      {allDone && <div style={{ textAlign:"center", marginTop:10, fontSize:11, color:"var(--green)", fontWeight:700 }}>🌟 ماشاء الله — أكملت صلواتك اليوم!</div>}
    </div>
  );
}

// ── Dashboard ────────────────────────────────────────────────
function DashboardPage({ tasks, setTasks, goals, pomodoroSessions, todayFocus, addNotif }) {
  const today = new Date().toISOString().split("T")[0];
  const todayTasks  = tasks.filter(t => t.date === today);
  const doneTasks   = todayTasks.filter(t => t.done);
  const pct         = todayTasks.length ? Math.round(doneTasks.length / todayTasks.length * 100) : 0;
  const quote       = QUOTES[new Date().getDay() % QUOTES.length];
  const activeGoals = goals.filter(g => g.status === "active");

  const sortedTasks = [...todayTasks].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    return ({"high":0,"medium":1,"low":2}[a.priority]??1) - ({"high":0,"medium":1,"low":2}[b.priority]??1);
  });

  async function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const done = !task.done;
    const now  = new Date();
    const completedAt = done ? `${now.getHours().toString().padStart(2,"0")}:${now.getMinutes().toString().padStart(2,"0")}` : null;
    await supabase.from("tasks").update({ done, completed_at: completedAt }).eq("id", id);
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done, completedAt } : t));
    if (done) addNotif({ type:"success", icon:"🎉", title:"أحسنت!", msg: task.title });
  }

  const QuoteCard = () => (
    <div style={{ background:"linear-gradient(135deg,rgba(124,110,240,0.12),rgba(92,79,212,0.06))", border:"1px solid rgba(124,110,240,0.2)", borderRadius:16, padding:"16px 20px", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", top:-10, right:10, fontSize:80, color:"var(--accent)", opacity:0.07, lineHeight:1, fontFamily:"serif", pointerEvents:"none" }}>"</div>
      <div style={{ fontSize:13, lineHeight:1.9, color:"var(--text)", fontWeight:500, position:"relative" }}>{quote}</div>
      <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:12 }}>
        <div style={{ flex:1, height:1, background:"rgba(124,110,240,0.2)" }}/>
        <span style={{ fontSize:10, color:"var(--accent2)", fontWeight:700 }}>✨ اقتباس اليوم</span>
        <div style={{ flex:1, height:1, background:"rgba(124,110,240,0.2)" }}/>
      </div>
    </div>
  );

  return (
    <div className="page" style={{ padding:"18px 20px" }}>

      {/* Quote — mobile top */}
      <div className="db-quote-top" style={{ marginBottom:14 }}><QuoteCard /></div>

      {/* Stats */}
      <div className="db-stats">
        {[
          { icon:"✅", val:doneTasks.length,                     label:"مكتملة",  sub:`${todayTasks.length} إجمالاً`, color:"var(--accent)" },
          { icon:"⏳", val:todayTasks.filter(t=>!t.done).length, label:"متبقية",  sub:"اليوم",                        color:"var(--amber)"  },
          { icon:"🎯", val:todayFocus.toFixed(1)+"س",            label:"تركيز",   sub:`${pomodoroSessions} جلسة`,      color:"var(--green)"  },
          { icon:"📈", val:pct+"%",                              label:"الإنجاز", sub:pct>=70?"🔥 رائع":"💪 استمر",   color:pct>=70?"var(--green)":"var(--amber)" },
        ].map((s,i) => (
          <div key={i} style={{ background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:14, padding:"12px 14px", display:"flex", alignItems:"center", gap:12 }}>
            <span style={{ fontSize:24 }}>{s.icon}</span>
            <div>
              <div style={{ fontSize:20, fontWeight:900, fontFamily:"Tajawal,sans-serif", color:s.color, lineHeight:1 }}>{s.val}</div>
              <div style={{ fontSize:10, color:"var(--text2)", marginTop:2 }}>{s.label}</div>
              <div style={{ fontSize:9, color:s.color }}>{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 2-col layout */}
      <div className="db-layout">

        {/* LEFT: Tasks */}
        <div style={{ background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:16, overflow:"hidden" }}>
          <div style={{ padding:"14px 20px 12px", borderBottom:"1px solid var(--border)", display:"flex", justifyContent:"space-between", alignItems:"center", background:"linear-gradient(135deg,rgba(124,110,240,0.04),transparent)" }}>
            <div>
              <div style={{ fontSize:15, fontWeight:700 }}>📋 مهام اليوم</div>
              <div style={{ fontSize:10, color:"var(--text3)", marginTop:2 }}>{new Date().toLocaleDateString("ar-EG",{weekday:"long",day:"numeric",month:"long"})}</div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ fontSize:12, color:"var(--text2)" }}>{doneTasks.length}/{todayTasks.length} مكتملة</span>
              <div style={{ position:"relative", width:44, height:44 }}>
                <svg width="44" height="44" viewBox="0 0 44 44">
                  <circle cx="22" cy="22" r="16" fill="none" stroke="var(--bg4)" strokeWidth="5"/>
                  <circle cx="22" cy="22" r="16" fill="none" stroke="var(--accent)" strokeWidth="5" strokeLinecap="round"
                    strokeDasharray={100.5} strokeDashoffset={100.5-(100.5*pct/100)}
                    style={{ transform:"rotate(-90deg)", transformOrigin:"22px 22px", transition:"stroke-dashoffset 1s ease" }}/>
                </svg>
                <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", fontSize:9, fontWeight:900, color:"var(--accent)", fontFamily:"Tajawal,sans-serif" }}>{pct}%</div>
              </div>
            </div>
          </div>
          <div style={{ padding:"12px 14px 16px" }}>
            {sortedTasks.length === 0 ? (
              <div style={{ textAlign:"center", padding:"40px 0", color:"var(--text3)" }}>
                <div style={{ fontSize:36, marginBottom:8 }}>🌟</div>
                <div style={{ fontSize:13 }}>لا مهام اليوم — أضف مهمتك الأولى!</div>
              </div>
            ) : (
              <div className="db-tasks-grid">
                {sortedTasks.map(t => {
                  const linkedGoal = goals.find(g => String(g.id) === String(t.goalId || t.goal_id));
                  const isOverdue  = !t.done && t.time && new Date(`${today}T${t.time}:00`) < new Date();
                  const pc = t.priority==="high" ? "var(--red)" : t.priority==="medium" ? "var(--amber)" : "var(--blue)";
                  return (
                    <div key={t.id} style={{ background:t.done?"rgba(16,185,129,0.04)":"var(--bg3)", border:`1px solid ${t.done?"rgba(16,185,129,0.14)":isOverdue?"rgba(239,68,68,0.28)":"var(--border)"}`, borderRadius:12, padding:"11px 13px", borderRight:`3px solid ${pc}`, opacity:t.done?0.65:1, transition:"all 0.2s" }}>
                      <div style={{ display:"flex", alignItems:"flex-start", gap:9 }}>
                        <div onClick={() => toggleTask(t.id)} style={{ width:20, height:20, borderRadius:6, flexShrink:0, marginTop:2, cursor:"pointer", border:`2px solid ${t.done?"var(--green)":pc}`, background:t.done?"var(--green)":"transparent", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:11, fontWeight:700, transition:"all 0.2s" }}>{t.done?"✓":""}</div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ display:"flex", justifyContent:"space-between", gap:6, marginBottom:5 }}>
                            <div onClick={() => toggleTask(t.id)} style={{ fontSize:13, fontWeight:600, cursor:"pointer", flex:1, textDecoration:t.done?"line-through":"none", color:t.done?"var(--text3)":"var(--text)" }}>{t.title}</div>
                            {t.time && <span style={{ fontSize:10, padding:"2px 7px", borderRadius:20, flexShrink:0, fontWeight:700, background:isOverdue&&!t.done?"rgba(239,68,68,0.14)":"rgba(245,158,11,0.12)", color:isOverdue&&!t.done?"var(--red)":"var(--amber)" }}>⏰{t.time}{isOverdue&&!t.done?" ⚠️":""}</span>}
                          </div>
                          <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                            <span style={{ fontSize:9, padding:"2px 7px", borderRadius:20, fontWeight:600, background:t.priority==="high"?"rgba(239,68,68,0.1)":t.priority==="medium"?"rgba(245,158,11,0.1)":"rgba(59,130,246,0.1)", color:pc }}>{t.priority==="high"?"🔴 عالية":t.priority==="medium"?"🟡 متوسطة":"🔵 منخفضة"}</span>
                            {linkedGoal && <span style={{ fontSize:9, padding:"2px 7px", borderRadius:20, fontWeight:600, background:`${linkedGoal.color}18`, color:linkedGoal.color }}>🎯 {linkedGoal.title}</span>}
                            {t.repeat&&t.repeat!=="none"&&<span style={{ fontSize:9, padding:"2px 7px", borderRadius:20, fontWeight:600, background:"rgba(124,110,240,0.1)", color:"var(--accent2)" }}>{t.repeat==="daily"?"🔁 يومي":t.repeat==="weekly"?"📆 أسبوعي":"🗓️ شهري"}</span>}
                            {t.done&&t.completedAt&&<span style={{ fontSize:9, padding:"2px 7px", borderRadius:20, fontWeight:600, background:"rgba(16,185,129,0.1)", color:"var(--green)" }}>✅ {t.completedAt}</span>}
                          </div>
                          {t.note && <div style={{ marginTop:6, padding:"5px 8px", background:"var(--bg4)", borderRadius:7, borderRight:"2px solid var(--accent3)", fontSize:11, color:"var(--text2)" }}>📝 {t.note}</div>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Sidebar */}
        <div className="db-sidebar">
          <PrayerTracker />

          {/* Goals compact */}
          <div style={{ background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:16, padding:"14px 16px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
              <div>
                <div style={{ fontSize:14, fontWeight:700 }}>🎯 إنجاز الأهداف</div>
                <div style={{ fontSize:9, color:"var(--text3)", marginTop:2 }}>النسبة اليومية — تتصفر كل يوم</div>
              </div>
              <div style={{ width:34, height:34, borderRadius:"50%", background:"var(--bg3)", border:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>🎯</div>
            </div>
            {activeGoals.length === 0 ? (
              <div style={{ textAlign:"center", padding:"12px 0", color:"var(--text3)", fontSize:12 }}>لا أهداف نشطة</div>
            ) : activeGoals.map(g => {
              const gTasks = tasks.filter(t => String(t.goalId||t.goal_id) === String(g.id) && t.date === today);
              const gDone  = gTasks.filter(t => t.done);
              const dp     = gTasks.length ? Math.round(gDone.length / gTasks.length * 100) : 0;
              return (
                <div key={g.id} style={{ marginBottom:14 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                      <div style={{ width:8, height:8, borderRadius:"50%", background:g.color, boxShadow:`0 0 5px ${g.color}80`, flexShrink:0 }}/>
                      <span style={{ fontSize:12, fontWeight:600 }}>{g.title}</span>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:5, flexShrink:0 }}>
                      <span style={{ fontSize:13, color:g.color, fontWeight:900, fontFamily:"Tajawal,sans-serif" }}>{dp}%</span>
                      <span style={{ fontSize:9, color:"var(--text3)" }}>/{g.progress}%</span>
                    </div>
                  </div>
                  <ProgressBar pct={dp} color={g.color} h={7}/>
                  <div style={{ fontSize:9, color:"var(--text3)", marginTop:4 }}>{gTasks.length===0?"💡 لا مهام مرتبطة اليوم":`${gDone.length}/${gTasks.length} مهمة اليوم`}</div>
                </div>
              );
            })}
          </div>

          {/* Quote — desktop only */}
          <div className="db-quote-side"><QuoteCard /></div>
        </div>
      </div>
    </div>
  );
}

// ── Goals Page ───────────────────────────────────────────────
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
            <option value="active">نشط</option><option value="paused">متوقف</option><option value="done">مكتمل</option>
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
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          {COLORS.map(c => <div key={c} onClick={() => setForm(p => ({ ...p, color: c }))} style={{ width:28, height:28, borderRadius:8, background:c, cursor:"pointer", border: form.color===c ? "3px solid white" : "2px solid transparent", boxSizing:"border-box", transition:"all 0.2s" }} />)}
        </div>
      </div>
    </>
  );
}

function GoalsPage({ goals, setGoals, addNotif }) {
  const [showAdd, setShowAdd]     = useState(false);
  const [editGoal, setEditGoal]   = useState(null);
  const [deleteGoal, setDeleteGoal] = useState(null);
  const [addForm, setAddForm]     = useState(EMPTY_GOAL_FORM);
  const [editForm, setEditForm]   = useState(EMPTY_GOAL_FORM);
  const [expandedGoal, setExpandedGoal] = useState(null);
  const [newSubtask, setNewSubtask] = useState("");

  async function addGoal() {
    if (!addForm.title.trim()) return;
    const uid = (await supabase.auth.getUser()).data.user?.id;
    const { data } = await supabase.from("goals").insert({ user_id:uid, title:addForm.title, category:addForm.category||"", progress:0, status:addForm.status||"active", color:addForm.color||"#6366f1", start_date:addForm.startDate||"", end_date:addForm.endDate||"", subtasks:[] }).select().single();
    if (data) { setGoals(prev => [...prev, { ...data, subtasks:[] }]); addNotif({ type:"success", icon:"🎯", title:"تم إنشاء الهدف", msg:data.title }); }
    setShowAdd(false); setAddForm(EMPTY_GOAL_FORM);
  }

  function openEdit(g) { setEditForm({ title:g.title, category:g.category||"", startDate:g.start_date||g.startDate||"", endDate:g.end_date||g.endDate||"", color:g.color, status:g.status }); setEditGoal(g); }

  async function saveEdit() {
    if (!editForm.title.trim()) return;
    await supabase.from("goals").update({ title:editForm.title, category:editForm.category, status:editForm.status, color:editForm.color, start_date:editForm.startDate, end_date:editForm.endDate }).eq("id", editGoal.id);
    setGoals(prev => prev.map(g => g.id===editGoal.id ? { ...g, ...editForm, start_date:editForm.startDate, end_date:editForm.endDate } : g));
    addNotif({ type:"info", icon:"✏️", title:"تم تعديل الهدف", msg:editForm.title }); setEditGoal(null);
  }

  async function doDelete() {
    await supabase.from("goals").delete().eq("id", deleteGoal.id);
    setGoals(prev => prev.filter(g => g.id !== deleteGoal.id));
    addNotif({ type:"warning", icon:"🗑️", title:"تم حذف الهدف", msg:deleteGoal.title });
    setDeleteGoal(null); if (expandedGoal === deleteGoal.id) setExpandedGoal(null);
  }

  async function addSubtask(goalId) {
    if (!newSubtask.trim()) return;
    const goal = goals.find(g => g.id === goalId); if (!goal) return;
    const updated = [...(goal.subtasks||[]), { id:Date.now(), title:newSubtask, done:false }];
    await supabase.from("goals").update({ subtasks:updated }).eq("id", goalId);
    setGoals(prev => prev.map(g => g.id===goalId ? { ...g, subtasks:updated } : g)); setNewSubtask("");
  }

  async function deleteSubtask(goalId, subId) {
    const goal = goals.find(g => g.id===goalId); if (!goal) return;
    const updated = goal.subtasks.filter(s => s.id!==subId);
    const progress = updated.length ? Math.round(updated.filter(s=>s.done).length/updated.length*100) : goal.progress;
    await supabase.from("goals").update({ subtasks:updated, progress }).eq("id", goalId);
    setGoals(prev => prev.map(g => g.id===goalId ? { ...g, subtasks:updated, progress } : g));
  }

  async function toggleSubtask(goalId, subId) {
    const goal = goals.find(g => g.id===goalId); if (!goal) return;
    const updated = goal.subtasks.map(s => s.id===subId ? { ...s, done:!s.done } : s);
    const progress = updated.length ? Math.round(updated.filter(s=>s.done).length/updated.length*100) : goal.progress;
    await supabase.from("goals").update({ subtasks:updated, progress }).eq("id", goalId);
    setGoals(prev => prev.map(g => g.id===goalId ? { ...g, subtasks:updated, progress } : g));
  }

  return (
    <div className="page">
      <div className="section-header">
        <div className="section-title"><span>🎯</span>إدارة الأهداف</div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ هدف جديد</button>
      </div>
      <div className="stats-grid">
        {[["🔥","active","أهداف نشطة"],["✅","done","أهداف مكتملة"],["⏸️","paused","أهداف متوقفة"]].map(([icon,s,label])=>(
          <div key={s} className="stat-card" style={{ padding:16 }}>
            <div style={{ fontSize:22, marginBottom:8 }}>{icon}</div>
            <div className="stat-value" style={{ fontSize:28 }}>{goals.filter(g=>g.status===s).length}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>
      {goals.length===0 && <div className="card empty"><div className="empty-icon">🎯</div><div className="empty-text">لا توجد أهداف بعد.</div></div>}
      {goals.map(g => (
        <div key={g.id} className="goal-card" style={{ borderRight:`4px solid ${g.color}` }}>
          <div className="goal-header">
            <div style={{ flex:1, minWidth:0 }}>
              <div className="goal-title">{g.title}</div>
              <div className="goal-category">📂 {g.category||"عام"}</div>
            </div>
            <div style={{ display:"flex", gap:6, alignItems:"center", flexShrink:0 }}>
              <span className={`goal-status status-${g.status==="active"?"active":g.status==="done"?"done":"paused"}`}>{g.status==="active"?"🟢 نشط":g.status==="done"?"✅ مكتمل":"⏸️ متوقف"}</span>
              <button className="btn-icon" style={{ fontSize:14 }} onClick={() => openEdit(g)}>✏️</button>
              <button className="btn-icon" style={{ fontSize:14, color:"var(--red)" }} onClick={() => setDeleteGoal(g)}>🗑️</button>
              <button className="btn-icon" style={{ fontSize:14 }} onClick={() => setExpandedGoal(expandedGoal===g.id?null:g.id)}>{expandedGoal===g.id?"▲":"▼"}</button>
            </div>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
            <span style={{ fontSize:13, color:"var(--text2)" }}>التقدم: <strong style={{ color:g.color }}>{g.progress}%</strong></span>
            {(g.end_date||g.endDate) && <span style={{ fontSize:11, color:"var(--text2)" }}>🗓️ حتى {g.end_date||g.endDate}</span>}
          </div>
          <ProgressBar pct={g.progress} color={g.color} h={8}/>
          {expandedGoal===g.id && (
            <div className="subtask-list">
              <div style={{ fontSize:12, color:"var(--text2)", margin:"12px 0 8px", fontWeight:600 }}>المهام الفرعية</div>
              {(!g.subtasks||g.subtasks.length===0)&&<div style={{ fontSize:12, color:"var(--text3)", padding:"6px 0" }}>لا مهام فرعية بعد.</div>}
              {(g.subtasks||[]).map(s => (
                <div key={s.id} className="subtask-item">
                  <span style={{ cursor:"pointer" }} onClick={() => toggleSubtask(g.id,s.id)}>{s.done?"✅":"⬜"}</span>
                  <span style={{ flex:1, textDecoration:s.done?"line-through":"none", color:s.done?"var(--text3)":"var(--text)", cursor:"pointer" }} onClick={() => toggleSubtask(g.id,s.id)}>{s.title}</span>
                  <button onClick={() => deleteSubtask(g.id,s.id)} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--text3)", fontSize:13, padding:"0 4px" }}>✕</button>
                </div>
              ))}
              <div style={{ display:"flex", gap:8, marginTop:12 }}>
                <input className="form-input" style={{ flex:1, padding:"8px 12px" }} placeholder="أضف مهمة فرعية..." value={newSubtask} onChange={e => setNewSubtask(e.target.value)} onKeyDown={e => e.key==="Enter"&&addSubtask(g.id)} />
                <button className="btn btn-primary btn-sm" onClick={() => addSubtask(g.id)}>+</button>
              </div>
            </div>
          )}
        </div>
      ))}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="إنشاء هدف جديد" icon="🎯">
        <GoalForm form={addForm} setForm={setAddForm}/>
        <div className="modal-actions"><button className="btn btn-ghost" onClick={() => setShowAdd(false)}>إلغاء</button><button className="btn btn-primary" onClick={addGoal}>إنشاء ✨</button></div>
      </Modal>
      <Modal open={!!editGoal} onClose={() => setEditGoal(null)} title="تعديل الهدف" icon="✏️">
        <GoalForm form={editForm} setForm={setEditForm}/>
        <div className="modal-actions"><button className="btn btn-ghost" onClick={() => setEditGoal(null)}>إلغاء</button><button className="btn btn-primary" onClick={saveEdit}>حفظ ✅</button></div>
      </Modal>
      <ConfirmDialog open={!!deleteGoal} onClose={() => setDeleteGoal(null)} onConfirm={doDelete} title="حذف الهدف" msg={`هل أنت متأكد من حذف "${deleteGoal?.title}"؟`}/>
    </div>
  );
}

// ── Tasks Page ───────────────────────────────────────────────
function TaskForm({ form, setForm, goals }) {
  function toggleDay(id) { setForm(p => ({ ...p, weekDays:(p.weekDays||[]).includes(id)?p.weekDays.filter(d=>d!==id):[...(p.weekDays||[]),id] })); }
  return (
    <>
      <div className="form-group"><label className="form-label">عنوان المهمة *</label><input className="form-input" placeholder="ما الذي تريد إنجازه؟" value={form.title} onChange={e => setForm(p=>({...p,title:e.target.value}))}/></div>
      <div className="form-row">
        <div className="form-group"><label className="form-label">الأولوية</label><select className="form-select" value={form.priority} onChange={e=>setForm(p=>({...p,priority:e.target.value}))}><option value="high">🔴 عالية</option><option value="medium">🟡 متوسطة</option><option value="low">🔵 منخفضة</option></select></div>
        <div className="form-group"><label className="form-label">📅 التاريخ</label><input type="date" className="form-input" value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))}/></div>
      </div>
      <div className="form-row">
        <div className="form-group"><label className="form-label">⏰ وقت التذكير</label><input type="time" className="form-input" value={form.time||""} onChange={e=>setForm(p=>({...p,time:e.target.value}))}/></div>
        <div className="form-group"><label className="form-label">🔁 التكرار</label><select className="form-select" value={form.repeat||"none"} onChange={e=>setForm(p=>({...p,repeat:e.target.value,weekDays:[]}))}>
          <option value="none">🚫 لا تكرار</option><option value="daily">🔁 يومي</option><option value="weekly">📆 أسبوعي — أيام محددة</option><option value="monthly">🗓️ شهري</option>
        </select></div>
      </div>
      {form.repeat==="weekly" && (
        <div className="form-group"><label className="form-label">📆 أيام الأسبوع</label>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            {WEEK_DAYS.map(d => { const sel=(form.weekDays||[]).includes(d.id); return <div key={d.id} onClick={()=>toggleDay(d.id)} style={{ padding:"6px 12px", borderRadius:20, fontSize:12, fontWeight:600, cursor:"pointer", border:`1px solid ${sel?"var(--accent)":"var(--border)"}`, background:sel?"var(--accent)":"var(--bg3)", color:sel?"white":"var(--text2)", transition:"all 0.2s" }}>{d.label}</div>; })}
          </div>
        </div>
      )}
      <div className="form-group"><label className="form-label">ربط بهدف (اختياري)</label><select className="form-select" value={form.goalId} onChange={e=>setForm(p=>({...p,goalId:e.target.value}))}><option value="">-- بدون هدف --</option>{goals.map(g=><option key={g.id} value={g.id}>{g.title}</option>)}</select></div>
      {form.repeat&&form.repeat!=="none"&&<div style={{ background:"rgba(124,110,240,0.08)", border:"1px solid rgba(124,110,240,0.2)", borderRadius:10, padding:"10px 14px", fontSize:12, color:"var(--accent2)", display:"flex", alignItems:"center", gap:8, marginBottom:8 }}><span>✨</span><span>عند الإكمال ستُجدَّد تلقائياً ({REPEAT_LABELS[form.repeat]}){form.time?` • تذكير ${form.time} 🔔`:""}</span></div>}
      <div className="form-group"><label className="form-label">📝 ملاحظات (اختياري)</label><textarea className="form-textarea" placeholder="أضف ملاحظاتك..." value={form.note||""} onChange={e=>setForm(p=>({...p,note:e.target.value}))} style={{ minHeight:64 }}/></div>
    </>
  );
}

function TasksPage({ tasks, setTasks, goals, setGoals, addNotif }) {
  const [showAdd, setShowAdd]       = useState(false);
  const [editTask, setEditTask]     = useState(null);
  const [deleteTask, setDeleteTask] = useState(null);
  const [addForm, setAddForm]       = useState(EMPTY_TASK_FORM);
  const [editForm, setEditForm]     = useState(EMPTY_TASK_FORM);
  const [filter, setFilter]         = useState("all");

  async function addTask() {
    if (!addForm.title.trim()) return;
    const uid = (await supabase.auth.getUser()).data.user?.id;
    const { data, error } = await supabase.from("tasks").insert({ user_id:uid, title:addForm.title, priority:addForm.priority, date:addForm.date, done:false, completed_at:null, repeat:addForm.repeat||"none", goal_id:addForm.goalId||null, note:addForm.note||null, time:addForm.time||null, week_days:addForm.weekDays?.length?addForm.weekDays:null }).select().single();
    if (data) { setTasks(prev=>[...prev,{...data,completedAt:null,goalId:data.goal_id,note:data.note,time:data.time,weekDays:data.week_days}]); addNotif({type:"success",icon:"✅",title:"تم إضافة المهمة",msg:data.title}); }
    else addNotif({type:"warning",icon:"⚠️",title:"خطأ",msg:error?.message});
    setShowAdd(false); setAddForm(EMPTY_TASK_FORM);
  }

  function openEdit(t) { setEditForm({title:t.title,goalId:t.goalId?String(t.goalId):"",priority:t.priority,date:t.date,repeat:t.repeat||"none",note:t.note||"",time:t.time||"",weekDays:t.weekDays||t.week_days||[]}); setEditTask(t); }

  async function saveEdit() {
    if (!editForm.title.trim()) return;
    await supabase.from("tasks").update({title:editForm.title,priority:editForm.priority,date:editForm.date,repeat:editForm.repeat||"none",goal_id:editForm.goalId||null,note:editForm.note||null,time:editForm.time||null,week_days:editForm.weekDays?.length?editForm.weekDays:null}).eq("id",editTask.id);
    setTasks(prev=>prev.map(t=>t.id===editTask.id?{...t,...editForm,repeat:editForm.repeat||"none",goalId:editForm.goalId||null,weekDays:editForm.weekDays}:t));
    addNotif({type:"info",icon:"✏️",title:"تم تعديل المهمة",msg:editForm.title}); setEditTask(null);
  }

  async function doDeleteTask() {
    await supabase.from("tasks").delete().eq("id",deleteTask.id);
    setTasks(prev=>prev.filter(t=>t.id!==deleteTask.id));
    addNotif({type:"warning",icon:"🗑️",title:"تم حذف المهمة",msg:deleteTask.title}); setDeleteTask(null);
  }

  async function toggleTask(id) {
    const task = tasks.find(t=>t.id===id); if(!task) return;
    const done = !task.done;
    const now  = new Date();
    const completedAt = done?`${now.getHours().toString().padStart(2,"0")}:${now.getMinutes().toString().padStart(2,"0")}`:null;
    await supabase.from("tasks").update({done,completed_at:completedAt}).eq("id",id);
    const updatedTasks = tasks.map(t=>t.id===id?{...t,done,completedAt}:t);
    setTasks(updatedTasks);
    if(done){
      addNotif({type:"success",icon:"🎉",title:"أحسنت! 🌟",msg:`أكملت: ${task.title}`});
      const linkedGoalId = task.goalId||task.goal_id;
      if(linkedGoalId){
        const linkedGoal = goals.find(g=>g.id===linkedGoalId);
        if(linkedGoal){
          const goalTasks = updatedTasks.filter(t=>(t.goalId||t.goal_id)===linkedGoalId);
          const donePct = goalTasks.length?Math.round(goalTasks.filter(t=>t.done).length/goalTasks.length*100):0;
          const newProgress = Math.min(100,Math.max(linkedGoal.progress,donePct));
          await supabase.from("goals").update({progress:newProgress}).eq("id",linkedGoalId);
          setGoals(prev=>prev.map(g=>g.id===linkedGoalId?{...g,progress:newProgress}:g));
          addNotif({type:"info",icon:"📈",title:`تقدم "${linkedGoal.title}"`,msg:`${newProgress}% ↑`});
        }
      }
      if(task.repeat&&task.repeat!=="none"){
        const uid = (await supabase.auth.getUser()).data.user?.id;
        if(task.repeat==="weekly"&&task.weekDays?.length){
          const base=new Date(task.date+"T00:00:00");
          for(let i=1;i<=7;i++){const d=new Date(base);d.setDate(d.getDate()+i);if(task.weekDays.includes(d.getDay())){const nd=d.toISOString().split("T")[0];const{data:exW}=await supabase.from("tasks").select("id").eq("user_id",uid).eq("title",task.title).eq("date",nd).eq("done",false).limit(1);
            if(!exW||exW.length===0){const{data:next}=await supabase.from("tasks").insert({user_id:uid,title:task.title,priority:task.priority,date:nd,done:false,completed_at:null,repeat:task.repeat,goal_id:task.goalId||task.goal_id||null,time:task.time||null,week_days:task.weekDays,note:task.note||null}).select().single();if(next)setTasks(prev=>[...prev,{...next,completedAt:null,goalId:next.goal_id,weekDays:next.week_days}]);}}}}
          addNotif({type:"info",icon:"🔁",title:"تم جدولة التكرار الأسبوعي",msg:task.title});
        } else {
          const nextDate=getNextRepeatDate(task.date,task.repeat);
          // Check in Supabase directly to avoid state sync issues
          const {data:existing}=await supabase.from("tasks").select("id").eq("user_id",uid).eq("title",task.title).eq("date",nextDate).eq("done",false).limit(1);
          if(!existing||existing.length===0){
            const{data:next}=await supabase.from("tasks").insert({user_id:uid,title:task.title,priority:task.priority,date:nextDate,done:false,completed_at:null,repeat:task.repeat,goal_id:task.goalId||task.goal_id||null,time:task.time||null,week_days:task.weekDays||null,note:task.note||null}).select().single();
            if(next){
              setTasks(prev=>[...prev,{...next,completedAt:null,goalId:next.goal_id,weekDays:next.week_days}]);
              addNotif({type:"info",icon:"🔁",title:"تم جدولة التكرار",msg:`${task.title} ← ${nextDate}`});
            }
          }
        }
      }
    }
  }

  async function reschedule(id) {
    const tomorrow=new Date();tomorrow.setDate(tomorrow.getDate()+1);
    const newDate=tomorrow.toISOString().split("T")[0];
    await supabase.from("tasks").update({date:newDate}).eq("id",id);
    setTasks(prev=>prev.map(t=>t.id===id?{...t,date:newDate}:t));
    addNotif({type:"info",icon:"📅",title:"تم إعادة الجدولة",msg:"المهمة ستظهر غداً"});
  }

  const today=new Date().toISOString().split("T")[0];
  const filtered=tasks.filter(t=>{
    if(filter==="today") return t.date===today;
    if(filter==="done")  return t.done;
    if(filter==="pending") return !t.done;
    if(filter==="high")  return t.priority==="high";
    return true;
  }).sort((a,b)=>{if(a.done!==b.done)return a.done?1:-1;return({"high":0,"medium":1,"low":2}[a.priority]??1)-({"high":0,"medium":1,"low":2}[b.priority]??1);});

  return (
    <div className="page">
      <div className="section-header">
        <div className="section-title"><span>📋</span>المهام اليومية</div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ مهمة جديدة</button>
      </div>
      <div className="tabs">
        {[["all","الكل"],["today","اليوم"],["pending","معلقة"],["done","مكتملة"],["high","عالية"]].map(([v,l])=>(
          <div key={v} className={`tab ${filter===v?"active":""}`} onClick={()=>setFilter(v)}>{l}</div>
        ))}
      </div>
      {filtered.length===0?<div className="card empty"><div className="empty-icon">🎯</div><div className="empty-text">لا توجد مهام. أضف مهمتك الأولى!</div></div>
      :filtered.map(t=>{
        const goal=goals.find(g=>g.id===t.goalId);
        return(
          <div key={t.id} className={`task-item ${t.done?"done":""}`}>
            <div className={`task-check ${t.done?"done":t.priority}`} onClick={()=>toggleTask(t.id)}>{t.done?"✓":""}</div>
            <div style={{flex:1,minWidth:0}}>
              <div className={`task-title ${t.done?"done":""}`}>{t.title}</div>
              <div className="task-meta">
                <span className={`badge ${t.priority}`}>{t.priority==="high"?"🔴 عالية":t.priority==="medium"?"🟡 متوسطة":"🔵 منخفضة"}</span>
                {goal&&<span className="badge goal" style={{background:`${goal.color}20`,color:goal.color}}>🎯 {goal.title}</span>}
                {t.time&&<span style={{fontSize:10,padding:"2px 7px",borderRadius:20,background:"rgba(245,158,11,0.12)",color:"var(--amber)",fontWeight:600}}>⏰ {t.time}</span>}
                {t.repeat&&t.repeat!=="none"&&<span style={{fontSize:10,padding:"2px 7px",borderRadius:20,background:"rgba(124,110,240,0.12)",color:"var(--accent2)",fontWeight:600}}>{t.repeat==="daily"?"🔁 يومي":t.repeat==="weekly"&&t.weekDays?.length?`📆 ${t.weekDays.map(d=>["أحد","اثنين","ثلاثاء","أربعاء","خميس","جمعة","سبت"][d]).join("،")}`:"🗓️ شهري"}</span>}
                <span style={{fontSize:10,color:"var(--text3)"}}>📅 {t.date}</span>
                {t.completedAt&&<span style={{fontSize:10,color:"var(--green)"}}>✓ {t.completedAt}</span>}
              </div>
              {t.note&&<div style={{marginTop:5,padding:"4px 8px",background:"var(--bg4)",borderRadius:6,borderRight:"2px solid var(--accent3)",fontSize:11,color:"var(--text2)"}}>📝 {t.note}</div>}
            </div>
            <div style={{display:"flex",gap:4,flexShrink:0}}>
              {!t.done&&<button className="btn-icon" style={{fontSize:13}} onClick={()=>reschedule(t.id)} title="إعادة جدولة">📅</button>}
              <button className="btn-icon" style={{fontSize:13}} onClick={()=>openEdit(t)} title="تعديل">✏️</button>
              <button className="btn-icon" style={{fontSize:13,color:"var(--red)"}} onClick={()=>setDeleteTask(t)} title="حذف">🗑️</button>
            </div>
          </div>
        );
      })}
      <Modal open={showAdd} onClose={()=>setShowAdd(false)} title="إضافة مهمة جديدة" icon="✅"><TaskForm form={addForm} setForm={setAddForm} goals={goals}/><div className="modal-actions"><button className="btn btn-ghost" onClick={()=>setShowAdd(false)}>إلغاء</button><button className="btn btn-primary" onClick={addTask}>إضافة المهمة</button></div></Modal>
      <Modal open={!!editTask} onClose={()=>setEditTask(null)} title="تعديل المهمة" icon="✏️"><TaskForm form={editForm} setForm={setEditForm} goals={goals}/><div className="modal-actions"><button className="btn btn-ghost" onClick={()=>setEditTask(null)}>إلغاء</button><button className="btn btn-primary" onClick={saveEdit}>حفظ ✅</button></div></Modal>
      <ConfirmDialog open={!!deleteTask} onClose={()=>setDeleteTask(null)} onConfirm={doDeleteTask} title="حذف المهمة" msg={`هل أنت متأكد من حذف "${deleteTask?.title}"؟`}/>
    </div>
  );
}

// ── Pomodoro Page ────────────────────────────────────────────
function PomodoroPage({ onSession, addNotif }) {
  const [workMin, setWorkMin]   = useState(25);
  const [breakMin, setBreakMin] = useState(5);
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase]       = useState("work");
  const [secs, setSecs]         = useState(25*60);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef(null);
  const totalSecs = phase==="work" ? workMin*60 : breakMin*60;

  useEffect(()=>{
    if(!isRunning) return;
    intervalRef.current = setInterval(()=>{
      setSecs(s=>{
        if(s<=1){
          clearInterval(intervalRef.current);
          if(phase==="work"){ addNotif({type:"success",icon:"🍅",title:"انتهت جلسة التركيز!",msg:"خذ استراحة"}); onSession(workMin); setSessions(p=>p+1); setPhase("break"); setSecs(breakMin*60); }
          else { addNotif({type:"info",icon:"💪",title:"انتهت الاستراحة!",msg:"جاهز للجولة التالية؟"}); setPhase("work"); setSecs(workMin*60); }
          setIsRunning(false); return 0;
        }
        return s-1;
      });
    },1000);
    return ()=>clearInterval(intervalRef.current);
  },[isRunning,phase,workMin,breakMin]);

  const mins=Math.floor(secs/60).toString().padStart(2,"0");
  const sec2=(secs%60).toString().padStart(2,"0");
  const circum=2*Math.PI*90;
  const dashOffset=circum-(circum*(1-secs/totalSecs));
  const strokeColor=phase==="work"?"var(--accent)":"var(--green)";

  return(
    <div className="page">
      <div className="section-title" style={{justifyContent:"center",fontSize:20,marginBottom:24}}><span>🍅</span> مؤقت بومودورو</div>
      <div className="card" style={{maxWidth:480,margin:"0 auto 20px"}}>
        <div style={{textAlign:"center"}}>
          <div className="tabs" style={{maxWidth:240,margin:"0 auto 24px"}}>
            <div className={`tab ${phase==="work"?"active":""}`} onClick={()=>{setPhase("work");setSecs(workMin*60);setIsRunning(false);}}>عمل</div>
            <div className={`tab ${phase==="break"?"active":""}`} onClick={()=>{setPhase("break");setSecs(breakMin*60);setIsRunning(false);}}>راحة</div>
          </div>
          <div style={{position:"relative",width:220,height:220,margin:"0 auto 24px"}}>
            <svg width="220" height="220" viewBox="0 0 220 220" style={{transform:"rotate(-90deg)"}}>
              <circle className="pomo-circle-bg" cx="110" cy="110" r="90"/>
              <circle cx="110" cy="110" r="90" fill="none" stroke={strokeColor} strokeWidth="8" strokeLinecap="round" strokeDasharray={circum} strokeDashoffset={dashOffset} style={{filter:`drop-shadow(0 0 12px ${phase==="work"?"rgba(124,110,240,0.5)":"rgba(16,185,129,0.5)"})`}}/>
            </svg>
            <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",textAlign:"center"}}>
              <div style={{fontFamily:"Tajawal,sans-serif",fontSize:44,fontWeight:900,lineHeight:1,color:strokeColor}}>{mins}:{sec2}</div>
              <div style={{fontSize:12,color:"var(--text2)",marginTop:4}}>{phase==="work"?"🎯 وقت التركيز":"☕ وقت الراحة"}</div>
            </div>
          </div>
          <div style={{display:"flex",justifyContent:"center",gap:12,marginBottom:20}}>
            <button className="pomo-btn pomo-btn-secondary" onClick={()=>{setIsRunning(false);setPhase("work");setSecs(workMin*60);}}>↺</button>
            <button className="pomo-btn pomo-btn-main" onClick={()=>setIsRunning(p=>!p)}>{isRunning?"⏸":"▶"}</button>
            <button className="pomo-btn pomo-btn-secondary" onClick={()=>{setPhase(phase==="work"?"break":"work");setSecs(phase==="work"?breakMin*60:workMin*60);setIsRunning(false);}}>⏭</button>
          </div>
          <div style={{marginBottom:16}}>
            <div style={{fontSize:12,color:"var(--text2)",marginBottom:8}}>جلسات اليوم: <strong style={{color:"var(--accent2)"}}>{sessions}</strong></div>
            <div style={{display:"flex",justifyContent:"center",gap:6}}>{[...Array(8)].map((_,i)=><div key={i} className={`pomo-dot ${i<sessions?"done":""}`}/>)}</div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            {[["workMin","⏱️ دقائق العمل",workMin,setWorkMin],["breakMin","☕ دقائق الراحة",breakMin,setBreakMin]].map(([k,lbl,val,setter])=>(
              <div key={k} style={{background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:12,padding:12,textAlign:"center"}}>
                <div style={{fontSize:11,color:"var(--text2)",marginBottom:6}}>{lbl}</div>
                <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                  <div onClick={()=>setter(p=>Math.max(1,p-1))} style={{width:24,height:24,borderRadius:6,background:"var(--bg4)",border:"1px solid var(--border)",cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",color:"var(--text2)"}}>−</div>
                  <div style={{fontSize:20,fontWeight:700,fontFamily:"Tajawal,sans-serif"}}>{val}</div>
                  <div onClick={()=>setter(p=>Math.min(90,p+1))} style={{width:24,height:24,borderRadius:6,background:"var(--bg4)",border:"1px solid var(--border)",cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",color:"var(--text2)"}}>+</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Stats Page ───────────────────────────────────────────────
function StatsPage({ tasks, goals, pomodoroSessions, todayFocus }) {
  const [chartType, setChartType] = useState("tasks");
  const done=tasks.filter(t=>t.done).length;
  const total=tasks.length;
  const pct=total?Math.round(done/total*100):0;
  const topGoal=[...goals].sort((a,b)=>b.progress-a.progress)[0];
  const maxVal=Math.max(...WEEKLY_STATS.map(d=>chartType==="tasks"?d.tasks:d.focus),1);
  return(
    <div className="page">
      <div className="section-title" style={{fontSize:20,marginBottom:20}}><span>📊</span> الإحصائيات</div>
      <div className="stats-grid">
        {[["✅",done,"مهام مكتملة","purple"],["🎯",todayFocus.toFixed(1)+"س","ساعات تركيز","green"],["🍅",pomodoroSessions,"جلسات بومودورو","amber"],["📈",pct+"%","معدل الإنجاز","blue"]].map(([icon,val,label,cls])=>(
          <div key={label} className={`stat-card ${cls}`} style={{padding:16}}>
            <div style={{fontSize:22,marginBottom:6}}>{icon}</div>
            <div className="stat-value" style={{fontSize:28}}>{val}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
        <div className="card">
          <div className="section-header">
            <div className="section-title"><span>📅</span> هذا الأسبوع</div>
            <div style={{display:"flex",gap:4}}>
              <button className={`btn btn-sm ${chartType==="tasks"?"btn-primary":"btn-ghost"}`} onClick={()=>setChartType("tasks")}>مهام</button>
              <button className={`btn btn-sm ${chartType==="focus"?"btn-primary":"btn-ghost"}`} onClick={()=>setChartType("focus")}>تركيز</button>
            </div>
          </div>
          <div className="chart-bar-wrap">
            {WEEKLY_STATS.map((d,i)=>{const val=chartType==="tasks"?d.tasks:d.focus;const h=Math.max(8,val/maxVal*100);return(<div key={i} className="chart-bar-col"><div className="chart-bar-value">{chartType==="tasks"?d.tasks:`${d.focus}س`}</div><div className="chart-bar" style={{height:`${h}%`,background:"linear-gradient(180deg,var(--accent),var(--accent3))"}}/><div className="chart-bar-label">{d.day.slice(0,2)}</div></div>);})}
          </div>
        </div>
        <div className="card">
          <div className="section-title" style={{marginBottom:16}}><span>🎯</span> تقدم الأهداف</div>
          {goals.slice(0,4).map(g=>(
            <div key={g.id} style={{marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><span style={{fontSize:13}}>{g.title}</span><span style={{fontSize:12,color:g.color,fontWeight:700}}>{g.progress}%</span></div>
              <ProgressBar pct={g.progress} color={g.color} h={7}/>
            </div>
          ))}
          {topGoal&&<div style={{marginTop:14,padding:"10px 14px",background:"var(--bg3)",borderRadius:10,border:"1px solid var(--border)"}}><div style={{fontSize:11,color:"var(--text2)",marginBottom:4}}>🏆 أفضل هدف</div><div style={{fontSize:14,fontWeight:600,color:topGoal.color}}>{topGoal.title} — {topGoal.progress}%</div></div>}
        </div>
      </div>
    </div>
  );
}

// ── AI Page ──────────────────────────────────────────────────
function AIPage({ tasks, goals, addNotif }) {
  const [messages, setMessages] = useState([{ role:"bot", text:"مرحباً! أنا مساعدك الذكي للإنتاجية 🤖\n\nيمكنني مساعدتك في:\n• تحليل مهامك وأهدافك\n• اقتراح جدول يومك\n• تحديد أسباب التأجيل\n• تقديم نصائح مخصصة\n\nما الذي تريد معرفته اليوم؟" }]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const bottomRef = useRef(null);
  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); },[messages]);

  const suggestions=["ما أهم مهمة يجب إنجازها اليوم؟","حلل أسباب تأجيلي للمهام","كيف أحسّن إنتاجيتي؟","رتّب لي جدول اليوم","راجع أدائي هذا الأسبوع"];

  async function send() {
    if(!input.trim()||loading) return;
    const userMsg=input.trim(); setInput(""); setMessages(prev=>[...prev,{role:"user",text:userMsg}]); setLoading(true);
    const today=new Date().toISOString().split("T")[0];
    const todayTasks=tasks.filter(t=>t.date===today);
    const systemPrompt=`أنت مساعد إنتاجية ذكي باللغة العربية.\nبيانات المستخدم:\n- المهام اليوم: ${todayTasks.length} (${tasks.filter(t=>t.done&&t.date===today).length} مكتملة)\n- الأهداف النشطة: ${goals.filter(g=>g.status==="active").map(g=>`${g.title} (${g.progress}%)`).join("، ")}\nقدم نصائح مخصصة وعملية باللغة العربية. كن موجزاً ومفيداً. استخدم الإيموجي.`;
    try {
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:systemPrompt,messages:[{role:"user",content:userMsg}]})});
      const data=await res.json();
      setMessages(prev=>[...prev,{role:"bot",text:data.content?.[0]?.text||"عذراً، حدث خطأ."}]);
    } catch { setMessages(prev=>[...prev,{role:"bot",text:"عذراً، لم أتمكن من الاتصال."}]); }
    setLoading(false);
  }

  return(
    <div className="page">
      <div className="section-title" style={{fontSize:20,marginBottom:16}}><span>🤖</span> المساعد الذكي</div>
      <div className="card" style={{marginBottom:16,padding:"16px 20px"}}>
        <div style={{fontSize:12,color:"var(--text2)",marginBottom:10,fontWeight:600}}>💡 اقتراحات سريعة:</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:8}}>{suggestions.map(s=><button key={s} className="btn btn-ghost btn-sm" onClick={()=>setInput(s)}>{s}</button>)}</div>
      </div>
      <div className="card" style={{display:"flex",flexDirection:"column",minHeight:400}}>
        <div className="ai-chat" style={{flex:1,maxHeight:450,overflowY:"auto",padding:4}}>
          {messages.map((m,i)=>(
            <div key={i} className={`ai-message ${m.role==="user"?"user":""}`}>
              <div className={`ai-avatar ${m.role==="user"?"user":""}`}>{m.role==="bot"?"🤖":"👤"}</div>
              <div className={`ai-bubble ${m.role==="bot"?"bot":"user"}`} style={{whiteSpace:"pre-line"}}>{m.text}</div>
            </div>
          ))}
          {loading&&<div className="ai-message"><div className="ai-avatar">🤖</div><div className="ai-bubble bot" style={{display:"flex",gap:8,alignItems:"center"}}><div className="spinner"/><span style={{color:"var(--text2)",fontSize:13}}>يفكر...</span></div></div>}
          <div ref={bottomRef}/>
        </div>
        <div style={{borderTop:"1px solid var(--border)",paddingTop:16,marginTop:12}}>
          <div className="ai-input-row">
            <input className="ai-input" placeholder="اسألني أي شيء عن إنتاجيتك..." value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&send()}/>
            <button className="btn btn-primary" onClick={send} disabled={loading} style={{flexShrink:0}}>{loading?<div className="spinner"/>:"إرسال ✈️"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Auth Page ────────────────────────────────────────────────
function AuthPage({ onAuth }) {
  const [mode, setMode]       = useState("login");
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  async function submit() {
    if(!email||!password){setError("يرجى إدخال البريد وكلمة المرور");return;}
    setLoading(true);setError("");
    try {
      let result;
      if(mode==="login") result=await supabase.auth.signInWithPassword({email,password});
      else result=await supabase.auth.signUp({email,password});
      if(result.error) setError(result.error.message);
      else if(result.data?.user) onAuth(result.data.user);
      else if(mode==="signup"){setError("تم إنشاء الحساب! تحقق من بريدك للتفعيل ثم سجّل دخول.");setMode("login");}
    } catch { setError("حدث خطأ، حاول مرة أخرى"); }
    setLoading(false);
  }

  return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"var(--bg)",fontFamily:"'IBM Plex Sans Arabic',sans-serif",direction:"rtl"}}>
      <style>{styles}</style>
      <div style={{width:"100%",maxWidth:400,padding:"0 20px"}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{width:64,height:64,background:"linear-gradient(135deg,var(--accent),var(--accent3))",borderRadius:18,display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,margin:"0 auto 16px",boxShadow:"0 8px 30px rgba(124,110,240,0.4)"}}>⚡</div>
          <div style={{fontSize:28,fontWeight:900,fontFamily:"Tajawal,sans-serif",color:"var(--text)"}}>إنجاز</div>
          <div style={{fontSize:13,color:"var(--text2)",marginTop:4}}>نظام إدارة حياتك الشخصية</div>
        </div>
        <div className="card" style={{padding:28}}>
          <div className="tabs" style={{marginBottom:24}}>
            <div className={`tab ${mode==="login"?"active":""}`} onClick={()=>{setMode("login");setError("");}}>تسجيل الدخول</div>
            <div className={`tab ${mode==="signup"?"active":""}`} onClick={()=>{setMode("signup");setError("");}}>حساب جديد</div>
          </div>
          <div className="form-group"><label className="form-label">📧 البريد الإلكتروني</label><input className="form-input" type="email" placeholder="your@email.com" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()}/></div>
          <div className="form-group"><label className="form-label">🔒 كلمة المرور</label><input className="form-input" type="password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()}/></div>
          {error&&<div style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:10,padding:"10px 14px",fontSize:13,color:"var(--red)",marginBottom:16}}>{error}</div>}
          <button className="btn btn-primary" onClick={submit} disabled={loading} style={{width:"100%",justifyContent:"center",height:44,fontSize:15}}>
            {loading?<div className="spinner"/>:mode==="login"?"🚀 دخول":"✨ إنشاء حساب"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main App ─────────────────────────────────────────────────
export default function App() {
  const [page, setPage]           = useState("dashboard");
  const [user, setUser]           = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoaded, setDataLoaded]   = useState(false);
  const [goals, setGoalsState]    = useState([]);
  const [tasks, setTasksState]    = useState([]);
  const [pomodoroSessions, setPomodoroSessions] = useState(0);
  const [todayFocus, setTodayFocus]   = useState(0);
  const [notifs, setNotifs]       = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dbLoading, setDbLoading] = useState(true);
  const [activeAlerts, setActiveAlerts] = useState([]);

  const setGoals = setGoalsState;
  const setTasks = setTasksState;

  // Auth
  useEffect(()=>{
    supabase.auth.getSession().then(({data})=>{ setUser(data.session?.user||null); setAuthLoading(false); });
    const {data:listener}=supabase.auth.onAuthStateChange((_e,session)=>setUser(session?.user||null));
    return ()=>listener.subscription.unsubscribe();
  },[]);

  useEffect(()=>{ if(user) loadData(user.id); else { setGoalsState([]); setTasksState([]); } },[user]);

  async function loadData(uid) {
    setDbLoading(true); setDataLoaded(false); setGoalsState([]); setTasksState([]);
    try {
      const [{data:gd},{data:td}]=await Promise.all([
        supabase.from("goals").select("*").eq("user_id",uid).order("created_at"),
        supabase.from("tasks").select("*").eq("user_id",uid).order("created_at"),
      ]);
      if(gd) setGoalsState(gd.map(g=>({...g,subtasks:g.subtasks||[]})));
      if(td) setTasksState(td.map(t=>({...t,completedAt:t.completed_at,goalId:t.goal_id,note:t.note,time:t.time,weekDays:t.week_days||[]})));
    } catch(e) { console.error(e); }
    setDbLoading(false); setDataLoaded(true);
  }

  // Notifications
  useEffect(()=>{
    if(!user) return;
    if("Notification" in window && Notification.permission==="default") Notification.requestPermission();
    function sendAlert(task,type){
      const key=`alert-${task.id}-${type}-${new Date().toDateString()}`;
      if(sessionStorage.getItem(key)) return; sessionStorage.setItem(key,"1");
      const isNow=type==="now"; const alertId=Date.now()+Math.random();
      setActiveAlerts(prev=>[...prev,{id:alertId,task,isNow}]);
      setTimeout(()=>setActiveAlerts(prev=>prev.filter(a=>a.id!==alertId)),10000);
      if("Notification" in window&&Notification.permission==="granted"){
        try{ new Notification(isNow?"⏰ حان وقت المهمة!":"🔔 تذكير — بعد 5 دقائق",{body:task.title,dir:"rtl",lang:"ar",icon:"/icons/icon-192.png",tag:key}); }catch(e){}
      }
      try{
        const ctx=new(window.AudioContext||window.webkitAudioContext)();
        [isNow?880:660,isNow?1100:880].forEach((freq,i)=>{
          const osc=ctx.createOscillator(); const gain=ctx.createGain();
          osc.connect(gain); gain.connect(ctx.destination);
          osc.frequency.value=freq; osc.type="sine";
          gain.gain.setValueAtTime(0.25,ctx.currentTime+i*0.25);
          gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+i*0.25+0.4);
          osc.start(ctx.currentTime+i*0.25); osc.stop(ctx.currentTime+i*0.25+0.4);
        });
      }catch(e){}
    }
    function checkTasks(){
      const now=new Date(); const today=now.toISOString().split("T")[0];
      const hh=now.getHours().toString().padStart(2,"0"); const mm=now.getMinutes().toString().padStart(2,"0");
      const currentTime=`${hh}:${mm}`;
      tasks.forEach(t=>{
        if(t.done||t.date!==today||!t.time) return;
        if(t.time===currentTime) sendAlert(t,"now");
        else{ try{ const td2=new Date(`${today}T${t.time}:00`); const diff=td2-now; if(diff>0&&diff<=5*60*1000+59000) sendAlert(t,"warn"); }catch(e){} }
      });
    }
    const interval=setInterval(checkTasks,30000); checkTasks();
    return ()=>clearInterval(interval);
  },[user,tasks]);

  function addNotif(n) { const id=Date.now(); setNotifs(p=>[...p,{...n,id}]); setTimeout(()=>setNotifs(p=>p.filter(x=>x.id!==id)),3500); }
  function onPomodoroSession(mins) { setPomodoroSessions(p=>p+1); setTodayFocus(p=>p+mins/60); }
  async function logout() { await supabase.auth.signOut(); setUser(null); }

  const today=new Date();
  const dateStr=today.toLocaleDateString("ar-EG",{weekday:"long",year:"numeric",month:"long",day:"numeric"});
  const pendingCount=tasks.filter(t=>!t.done&&t.date===today.toISOString().split("T")[0]).length;
  const NAV=[
    {id:"dashboard",icon:"🏠",label:"الرئيسية"},
    {id:"goals",icon:"🎯",label:"الأهداف"},
    {id:"tasks",icon:"✅",label:"المهام",badge:pendingCount||null},
    {id:"pomodoro",icon:"🍅",label:"بومودورو"},
    {id:"stats",icon:"📊",label:"الإحصائيات"},
    {id:"ai",icon:"🤖",label:"المساعد الذكي"},
  ];
  const PAGE_TITLES={dashboard:"لوحة التحكم",goals:"إدارة الأهداف",tasks:"المهام اليومية",pomodoro:"مؤقت بومودورو",stats:"الإحصائيات",ai:"المساعد الذكي"};

  const LoadingScreen=()=>(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#0a0b0f",flexDirection:"column",gap:16}}>
      <style>{styles}</style>
      <div style={{fontSize:52}}>⚡</div>
      <div className="spinner" style={{margin:"0 auto"}}/>
      <div style={{color:"var(--text2)",fontSize:13,fontFamily:"IBM Plex Sans Arabic,sans-serif"}}>جاري تحميل بياناتك...</div>
    </div>
  );

  if(authLoading) return <LoadingScreen/>;
  if(!user) return <AuthPage onAuth={setUser}/>;
  if(!dataLoaded) return <LoadingScreen/>;

  return(
    <>
      <style>{styles}</style>
      <div className="app-shell">
        <div className={`mobile-overlay ${sidebarOpen?"show":""}`} onClick={()=>setSidebarOpen(false)}/>
        <nav className={`sidebar ${sidebarOpen?"open":""}`}>
          <div className="sidebar-logo">
            <div className="logo-mark">
              <div className="logo-icon">⚡</div>
              <div><div className="logo-text">إنجاز</div><div className="logo-sub">نظام إدارة حياتك</div></div>
            </div>
          </div>
          <div className="nav-section">
            <div className="nav-label">القائمة الرئيسية</div>
            {NAV.map(n=>(
              <div key={n.id} className={`nav-item ${page===n.id?"active":""}`} onClick={()=>{setPage(n.id);setSidebarOpen(false);}}>
                <span className="icon">{n.icon}</span>{n.label}
                {n.badge?<span className="nav-badge">{n.badge}</span>:null}
              </div>
            ))}
          </div>
          <div className="sidebar-footer">
            <div className="user-card" onClick={logout} title="تسجيل الخروج">
              <div className="user-avatar">{user.email?.[0]?.toUpperCase()||"م"}</div>
              <div><div className="user-name" style={{fontSize:12}}>{user.email}</div><div className="user-role" style={{color:"var(--red)",fontSize:11}}>🚪 تسجيل خروج</div></div>
            </div>
          </div>
        </nav>
        <div className="main">
          <div className="topbar">
            <div><div className="topbar-title">{PAGE_TITLES[page]}</div><div className="topbar-date">{dateStr}</div></div>
            <div className="topbar-actions">
              <div className="btn-icon menu-btn" onClick={()=>setSidebarOpen(!sidebarOpen)}>☰</div>
              {dbLoading&&<div className="spinner" style={{width:18,height:18}}/>}
              <div className="btn-icon" onClick={()=>addNotif({type:"info",icon:"🔔",title:"لا إشعارات جديدة"})}>🔔</div>
            </div>
          </div>
          {page==="dashboard"&&<DashboardPage tasks={tasks} setTasks={setTasks} goals={goals} setGoals={setGoals} pomodoroSessions={pomodoroSessions} todayFocus={todayFocus} addNotif={addNotif}/>}
          {page==="goals"&&<GoalsPage goals={goals} setGoals={setGoals} addNotif={addNotif}/>}
          {page==="tasks"&&<TasksPage tasks={tasks} setTasks={setTasks} goals={goals} setGoals={setGoals} addNotif={addNotif}/>}
          {page==="pomodoro"&&<PomodoroPage onSession={onPomodoroSession} addNotif={addNotif}/>}
          {page==="stats"&&<StatsPage tasks={tasks} goals={goals} pomodoroSessions={pomodoroSessions} todayFocus={todayFocus}/>}
          {page==="ai"&&<AIPage tasks={tasks} goals={goals} addNotif={addNotif}/>}
        </div>
      </div>
      <Notification notifs={notifs}/>
      {activeAlerts.length>0&&(
        <div className="alert-banner">
          {activeAlerts.map(a=>(
            <div key={a.id} className={`alert-card ${a.isNow?"now":"warn"}`}>
              <div style={{fontSize:24,flexShrink:0}}>{a.isNow?"⏰":"🔔"}</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:13,color:"white"}}>{a.isNow?"حان وقت المهمة!":"تذكير — بعد 5 دقائق"}</div>
                <div style={{fontSize:12,color:"rgba(255,255,255,0.85)",marginTop:2}}>{a.task.title}</div>
              </div>
              <div onClick={()=>setActiveAlerts(prev=>prev.filter(x=>x.id!==a.id))} style={{color:"rgba(255,255,255,0.7)",cursor:"pointer",fontSize:16,flexShrink:0}}>✕</div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
