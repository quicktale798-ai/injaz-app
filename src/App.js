import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://gkzdepanaphjijrqepie.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdremRlcGFuYXBoamlqcnFlcGllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMjQyMzEsImV4cCI6MjA5MjgwMDIzMX0.Rsh4wgCtLSa7tQEUuvYLyFfDOSqVwzizibLA0MTORoc";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── Week helpers (Saturday→Friday) ───────────────────────────
function getWeekStart(date = new Date()) {
  const d = new Date(date); const day = d.getDay();
  d.setDate(d.getDate() - (day === 6 ? 0 : day + 1));
  d.setHours(0,0,0,0); return d;
}
function getWeekEnd(ws) { const d = new Date(ws); d.setDate(d.getDate()+6); return d; }
function getWeekNumber(date = new Date()) {
  const s = new Date(date.getFullYear(),0,1);
  const fs = new Date(s); fs.setDate(s.getDate()+((6-s.getDay()+7)%7));
  return Math.max(1, Math.floor((getWeekStart(date)-fs)/(7*86400000))+1);
}
function isThisWeek(dateStr, offset=0) {
  const base = new Date(); base.setDate(base.getDate()+offset*7);
  const ws=getWeekStart(base); const we=getWeekEnd(ws);
  const d=new Date(dateStr+"T00:00:00"); return d>=ws&&d<=we;
}
function fmtDate(d) { return new Date(d).toLocaleDateString("ar-EG",{day:"numeric",month:"short"}); }
function toDay() { return new Date().toISOString().split("T")[0]; }
function getNextRepeat(from, repeat) {
  const d=new Date(from+"T00:00:00");
  if(repeat==="daily") d.setDate(d.getDate()+1);
  else if(repeat==="weekly") d.setDate(d.getDate()+7);
  else if(repeat==="monthly") d.setMonth(d.getMonth()+1);
  return d.toISOString().split("T")[0];
}

const COLORS=["#6366f1","#10b981","#f59e0b","#ef4444","#3b82f6","#06b6d4","#8b5cf6","#ec4899","#f97316","#14b8a6"];
const PRAYERS=[{id:"fajr",n:"الفجر",i:"🌙"},{id:"dhuhr",n:"الظهر",i:"☀️"},{id:"asr",n:"العصر",i:"🌤️"},{id:"maghrib",n:"المغرب",i:"🌅"},{id:"isha",n:"العشاء",i:"🌃"}];
const WD=["أحد","اثنين","ثلاثاء","أربعاء","خميس","جمعة","سبت"];
const QUOTES=["النجاح ليس نهاية الطريق.","ابدأ من حيث أنت.","كل يوم فرصة جديدة.","الوقت عملة لا تُسترجع.","خطوة كل يوم تصنع الفارق.","التركيز هو الفن الأعلى.","اجعل كل يوم تحفة فنية."];
const POMO_KEY="injaz-pomo-v2";

// ── STYLES ───────────────────────────────────────────────────
const S = `
@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;900&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap');
:root{--bg:#0d0e14;--bg2:#13141c;--bg3:#1c1d28;--bg4:#252636;--brd:rgba(255,255,255,0.06);--brd2:rgba(255,255,255,0.11);--t:#eeeef8;--t2:#8b8ca8;--t3:#4a4b62;--a:#7c6ef0;--a2:#9d8ff5;--a3:#5c4fd4;--g:#10b981;--am:#f59e0b;--r:#ef4444;--b:#3b82f6;}
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'IBM Plex Sans Arabic','Tajawal',sans-serif;background:var(--bg);color:var(--t);direction:rtl;text-align:right;min-height:100vh;}
::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-thumb{background:var(--a3);border-radius:4px;}
.shell{display:flex;min-height:100vh;}
.sidebar{width:220px;background:var(--bg2);border-left:1px solid var(--brd);display:flex;flex-direction:column;position:fixed;top:0;right:0;bottom:0;z-index:100;transition:transform 0.3s;}
.logo{padding:16px 14px;border-bottom:1px solid var(--brd);display:flex;align-items:center;gap:10px;}
.logo-i{width:34px;height:34px;background:linear-gradient(135deg,var(--a),var(--a3));border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:17px;}
.logo-n{font-family:'Tajawal',sans-serif;font-weight:900;font-size:17px;}
.logo-s{font-size:9px;color:var(--t3);}
.nav{padding:10px 8px;flex:1;overflow-y:auto;}
.ni{display:flex;align-items:center;gap:9px;padding:8px 10px;border-radius:8px;cursor:pointer;transition:all .15s;color:var(--t2);font-size:12px;font-weight:500;margin-bottom:1px;}
.ni:hover{background:var(--bg3);color:var(--t);}
.ni.active{background:linear-gradient(135deg,rgba(124,110,240,.18),rgba(92,79,212,.08));color:var(--a2);border:1px solid rgba(124,110,240,.18);}
.ni-ic{font-size:15px;width:18px;text-align:center;}
.ni-b{margin-right:auto;background:var(--r);color:white;font-size:9px;padding:1px 5px;border-radius:20px;font-weight:700;}
.wbox{background:var(--bg3);border:1px solid var(--brd);border-radius:9px;padding:9px 11px;margin:0 8px 10px;}
.sb-bot{padding:10px 8px;border-top:1px solid var(--brd);}
.upill{display:flex;align-items:center;gap:9px;padding:7px 9px;border-radius:9px;background:var(--bg3);cursor:pointer;}
.uav{width:30px;height:30px;border-radius:7px;background:linear-gradient(135deg,var(--a),#06b6d4);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;}
.main{margin-right:220px;flex:1;display:flex;flex-direction:column;}
.topbar{height:52px;background:var(--bg2);border-bottom:1px solid var(--brd);padding:0 20px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:50;}
.ib{width:30px;height:30px;border-radius:7px;background:var(--bg3);border:1px solid var(--brd);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;color:var(--t2);transition:all .15s;}
.ib:hover{background:var(--bg4);color:var(--t);}
.menu-btn{display:none;}
.page{padding:16px 20px;animation:fu .22s ease;}
@keyframes fu{from{opacity:0;transform:translateY(5px);}to{opacity:1;transform:translateY(0);}}
.card{background:var(--bg2);border:1px solid var(--brd);border-radius:13px;padding:16px;}
.g4{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:13px;}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
.g3c{display:grid;grid-template-columns:1fr 1fr 265px;gap:12px;}
.sm{background:var(--bg2);border:1px solid var(--brd);border-radius:11px;padding:11px 12px;display:flex;align-items:center;gap:9px;}
.pbar{height:6px;background:var(--bg4);border-radius:10px;overflow:hidden;}
.pf{height:100%;border-radius:10px;transition:width .8s ease;}
.tc{background:var(--bg3);border:1px solid var(--brd);border-radius:10px;padding:10px 12px;margin-bottom:6px;transition:border-color .15s;}
.tc:hover{border-color:var(--brd2);}
.tc.dn{opacity:.55;}
.tc.ov{border-color:rgba(239,68,68,.22);}
.cb{width:18px;height:18px;border-radius:5px;border:2px solid var(--brd2);cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .15s;font-size:10px;font-weight:700;color:white;}
.bdg{font-size:9px;padding:2px 6px;border-radius:18px;font-weight:700;}
.gc{background:var(--bg2);border:1px solid var(--brd);border-radius:13px;overflow:hidden;margin-bottom:11px;}
.ov-lay{position:fixed;inset:0;background:rgba(0,0,0,.72);backdrop-filter:blur(6px);z-index:200;display:flex;align-items:center;justify-content:center;padding:16px;}
.modal{background:var(--bg2);border:1px solid var(--brd2);border-radius:16px;padding:22px;width:100%;max-width:480px;max-height:90vh;overflow-y:auto;}
.fl{font-size:11px;color:var(--t2);margin-bottom:4px;display:block;font-weight:600;}
.fi,.fs,.fta{width:100%;background:var(--bg3);border:1px solid var(--brd);border-radius:8px;padding:8px 11px;font-family:inherit;font-size:13px;color:var(--t);outline:none;direction:rtl;transition:border-color .15s;}
.fi:focus,.fs:focus,.fta:focus{border-color:var(--a);}
.fs option{background:var(--bg3);}
.fta{resize:vertical;min-height:60px;}
.fr{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
.btn{padding:8px 15px;border-radius:8px;border:none;cursor:pointer;font-family:inherit;font-size:12px;font-weight:600;transition:all .15s;display:inline-flex;align-items:center;gap:6px;}
.bp{background:var(--a);color:white;}.bp:hover{background:var(--a2);transform:translateY(-1px);}
.bg{background:var(--bg3);color:var(--t2);border:1px solid var(--brd);}.bg:hover{background:var(--bg4);color:var(--t);}
.bd{background:rgba(239,68,68,.12);color:var(--r);border:1px solid rgba(239,68,68,.2);}
.bsm{padding:4px 10px;font-size:11px;border-radius:7px;}
.ns{position:fixed;bottom:16px;left:16px;z-index:300;display:flex;flex-direction:column;gap:5px;}
.ntf{background:var(--bg2);border:1px solid var(--brd2);border-radius:10px;padding:10px 14px;font-size:12px;display:flex;align-items:center;gap:9px;min-width:230px;animation:sli .2s ease;box-shadow:0 6px 20px rgba(0,0,0,.4);}
.ntf.success{border-color:rgba(16,185,129,.3);}.ntf.info{border-color:rgba(124,110,240,.3);}.ntf.warning{border-color:rgba(245,158,11,.3);}
@keyframes sli{from{opacity:0;transform:translateX(-12px);}to{opacity:1;transform:translateX(0);}}
.sh{display:flex;justify-content:space-between;align-items:center;margin-bottom:11px;}
.st{font-size:13px;font-weight:700;display:flex;align-items:center;gap:6px;}
.sp{width:16px;height:16px;border:2px solid rgba(124,110,240,.3);border-top-color:var(--a);border-radius:50%;animation:spin .6s linear infinite;}
@keyframes spin{to{transform:rotate(360deg);}}
.mob-ov{display:none;}
.pomo-btn{width:44px;height:44px;border-radius:50%;border:none;cursor:pointer;font-size:18px;display:flex;align-items:center;justify-content:center;transition:all .2s;}
.pomo-main{background:var(--a);color:white;width:56px;height:56px;font-size:22px;box-shadow:0 4px 16px rgba(124,110,240,.4);}
.pomo-main:hover{transform:scale(1.05);}
.pomo-sec{background:var(--bg3);color:var(--t2);border:1px solid var(--brd);}
.pdot{width:8px;height:8px;border-radius:50%;background:var(--bg4);}
.pdot.on{background:var(--a);box-shadow:0 0 6px rgba(124,110,240,.6);}
.ai-in{width:100%;background:var(--bg3);border:1px solid var(--brd);border-radius:9px;padding:9px 12px;font-family:inherit;font-size:13px;color:var(--t);outline:none;direction:rtl;}
.ai-in:focus{border-color:var(--a);}
.pr{display:flex;gap:5px;}
.pb2{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;padding:8px 2px;border-radius:9px;cursor:pointer;transition:all .2s;background:var(--bg3);border:1px solid var(--brd);}
.pb2.pd{background:rgba(124,110,240,.22);border-color:rgba(124,110,240,.4);transform:translateY(-2px);}
.empty{text-align:center;padding:28px 14px;color:var(--t3);}
@media(max-width:960px){.g3c{grid-template-columns:1fr 1fr;}.g3c>*:last-child{grid-column:span 2;}}
@media(max-width:768px){
  .sidebar{transform:translateX(220px);}.sidebar.open{transform:translateX(0);}
  .main{margin-right:0;}.menu-btn{display:flex!important;}
  .g4{grid-template-columns:repeat(2,1fr);}.g2{grid-template-columns:1fr;}.g3c{grid-template-columns:1fr;}
  .g3c>*:last-child{grid-column:span 1;}.page{padding:13px;}.topbar{padding:0 12px;}
  .mob-ov.show{display:block;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:99;}
  .fr{grid-template-columns:1fr;}
}
`;

// ── SHARED ───────────────────────────────────────────────────
function PBar({pct,color="var(--a)",h=6}){return <div className="pbar" style={{height:h}}><div className="pf" style={{width:`${Math.min(100,Math.max(0,pct))}%`,background:color}}/></div>;}
function Notifs({notifs}){return <div className="ns">{notifs.map(n=><div key={n.id} className={`ntf ${n.type}`}><span style={{fontSize:17}}>{n.icon}</span><div><div style={{fontWeight:600}}>{n.title}</div>{n.msg&&<div style={{fontSize:11,color:"var(--t2)",marginTop:1}}>{n.msg}</div>}</div></div>)}</div>;}
function Modal({open,onClose,title,icon,children}){if(!open)return null;return <div className="ov-lay" onClick={e=>e.target===e.currentTarget&&onClose()}><div className="modal"><div style={{fontSize:16,fontWeight:700,marginBottom:16,display:"flex",alignItems:"center",gap:7}}>{icon&&<span>{icon}</span>}{title}</div>{children}</div></div>;}
function Confirm({open,onClose,onOk,title,msg}){if(!open)return null;return <div className="ov-lay" onClick={e=>e.target===e.currentTarget&&onClose()}><div className="modal" style={{maxWidth:340}}><div style={{textAlign:"center",padding:"4px 0 16px"}}><div style={{fontSize:38,marginBottom:9}}>🗑️</div><div style={{fontSize:15,fontWeight:700,marginBottom:5}}>{title}</div><div style={{fontSize:12,color:"var(--t2)",lineHeight:1.7}}>{msg}</div></div><div style={{display:"flex",gap:7,justifyContent:"center"}}><button className="btn bg" onClick={onClose}>إلغاء</button><button className="btn bd" onClick={onOk}>نعم، احذف</button></div></div></div>;}

function PrayerTracker(){
  const today=toDay(); const key=`prayers-${today}`;
  const [chk,setChk]=useState(()=>{try{return JSON.parse(localStorage.getItem(key))||[];}catch{return [];}});
  useEffect(()=>{const l=localStorage.getItem("pl");if(l!==today){localStorage.setItem("pl",today);localStorage.removeItem(key);setChk([]);}},[]);
  function toggle(id){setChk(p=>{const n=p.includes(id)?p.filter(x=>x!==id):[...p,id];localStorage.setItem(key,JSON.stringify(n));return n;});}
  const all=chk.length===5;
  return(
    <div style={{background:"linear-gradient(135deg,rgba(124,110,240,.1),rgba(6,182,212,.04))",border:"1px solid rgba(124,110,240,.18)",borderRadius:13,padding:"12px 13px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <span style={{fontSize:13,fontWeight:700}}>🕌 الصلوات الخمس</span>
        <span style={{fontSize:10,color:all?"var(--g)":"var(--t3)",fontWeight:700}}>{chk.length}/5{all?" ✅":""}</span>
      </div>
      <div className="pr">
        {PRAYERS.map(p=>{const done=chk.includes(p.id);return(
          <div key={p.id} className={`pb2 ${done?"pd":""}`} onClick={()=>toggle(p.id)}>
            <span style={{fontSize:18}}>{done?"✅":p.i}</span>
            <span style={{fontSize:8,fontWeight:700,color:done?"var(--a2)":"var(--t3)"}}>{p.n}</span>
          </div>
        );})}
      </div>
      {all&&<div style={{textAlign:"center",marginTop:8,fontSize:10,color:"var(--g)",fontWeight:700}}>🌟 أكملت صلواتك اليوم!</div>}
    </div>
  );
}
// ── THIS WEEK PAGE ───────────────────────────────────────────
function ThisWeekPage({tasks,setTasks,goals,setGoals,addNotif,weekOffset}){
  const base=new Date();base.setDate(base.getDate()+weekOffset*7);
  const ws=getWeekStart(base);const we=getWeekEnd(ws);
  const today=toDay();
  const wTasks=tasks.filter(t=>{const d=new Date(t.date+"T00:00:00");return d>=ws&&d<=we;});
  const wDone=wTasks.filter(t=>t.done);
  const tTasks=tasks.filter(t=>t.date===today);
  const tDone=tTasks.filter(t=>t.done);
  const wPct=wTasks.length?Math.round(wDone.length/wTasks.length*100):0;
  const tPct=tTasks.length?Math.round(tDone.length/tTasks.length*100):0;
  const days=Array.from({length:7},(_,i)=>{const d=new Date(ws);d.setDate(ws.getDate()+i);const s=d.toISOString().split("T")[0];const dt=tasks.filter(t=>t.date===s);return{d,s,dt,done:dt.filter(t=>t.done).length,isTod:s===today};});
  const gProg=goals.filter(g=>g.status==="active").map(g=>{const gt=wTasks.filter(t=>String(t.goalId||t.goal_id)===String(g.id));const gd=gt.filter(t=>t.done);return{...g,wt:gt.length,wd:gd.length,wp:gt.length?Math.round(gd.length/gt.length*100):0};});
  const quote=QUOTES[new Date().getDay()%QUOTES.length];

  async function toggle(id){
    const task=tasks.find(t=>t.id===id);if(!task)return;
    const done=!task.done;const now=new Date();
    const ca=done?`${now.getHours().toString().padStart(2,"0")}:${now.getMinutes().toString().padStart(2,"0")}`:null;
    await supabase.from("tasks").update({done,completed_at:ca}).eq("id",id);
    setTasks(prev=>prev.map(t=>t.id===id?{...t,done,completedAt:ca}:t));
    if(done){
      addNotif({type:"success",icon:"🎉",title:"أحسنت!",msg:task.title});
      if(task.repeat&&task.repeat!=="none"){
        const uid=(await supabase.auth.getUser()).data.user?.id;
        const nd=getNextRepeat(today,task.repeat);
        const{data:ex}=await supabase.from("tasks").select("id").eq("user_id",uid).eq("title",task.title).eq("date",nd).eq("done",false).limit(1);
        if(!ex||!ex.length){const{data:nx}=await supabase.from("tasks").insert({user_id:uid,title:task.title,priority:task.priority,date:nd,done:false,completed_at:null,repeat:task.repeat,goal_id:task.goalId||task.goal_id||null,time:task.time||null,week_days:task.weekDays||null,note:task.note||null}).select().single();if(nx)setTasks(prev=>[...prev,{...nx,completedAt:null,goalId:nx.goal_id,weekDays:nx.week_days}]);}
      }
    }
  }

  return(
    <div className="page">
      <div className="g4">
        {[{i:"✅",v:wDone.length,l:"مكتملة الأسبوع",s:`${wTasks.length} إجمالاً`,c:"var(--a)"},{i:"📅",v:`${tDone.length}/${tTasks.length}`,l:"إنجاز اليوم",s:tPct+"%",c:"var(--g)"},{i:"📈",v:wPct+"%",l:"نسبة الأسبوع",s:wPct>=70?"🔥 رائع":"💪 استمر",c:wPct>=70?"var(--g)":"var(--am)"},{i:"🎯",v:gProg.length,l:"أهداف نشطة",s:"هذا الأسبوع",c:"var(--b)"}].map((s,i)=>(
          <div key={i} className="sm"><span style={{fontSize:22}}>{s.i}</span><div><div style={{fontSize:19,fontWeight:900,fontFamily:"Tajawal",color:s.c,lineHeight:1}}>{s.v}</div><div style={{fontSize:9,color:"var(--t2)",marginTop:2}}>{s.l}</div></div></div>
        ))}
      </div>
      <div className="g3c">
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div className="card">
            <div className="sh">
              <div className="st">📋 مهام اليوم <span style={{fontSize:10,color:"var(--t3)",background:"var(--bg3)",padding:"2px 7px",borderRadius:20}}>{tDone.length}/{tTasks.length}</span></div>
              <div style={{position:"relative",width:38,height:38}}>
                <svg width="38" height="38" viewBox="0 0 38 38"><circle cx="19" cy="19" r="14" fill="none" stroke="var(--bg4)" strokeWidth="4"/><circle cx="19" cy="19" r="14" fill="none" stroke="var(--a)" strokeWidth="4" strokeLinecap="round" strokeDasharray={88} strokeDashoffset={88-(88*tPct/100)} style={{transform:"rotate(-90deg)",transformOrigin:"19px 19px",transition:"stroke-dashoffset .8s"}}/></svg>
                <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",fontSize:8,fontWeight:900,color:"var(--a)",fontFamily:"Tajawal"}}>{tPct}%</div>
              </div>
            </div>
            {tTasks.length===0?<div className="empty"><div style={{fontSize:32,marginBottom:7}}>🌟</div><div style={{fontSize:12}}>لا مهام اليوم</div></div>
            :[...tTasks].sort((a,b)=>a.done?1:-1).map(t=>{
              const g=goals.find(x=>String(x.id)===String(t.goalId||t.goal_id));
              const pc=t.priority==="high"?"var(--r)":t.priority==="medium"?"var(--am)":"var(--b)";
              return(
                <div key={t.id} className={`tc ${t.done?"dn":""}`} style={{borderRight:`3px solid ${pc}`}}>
                  <div style={{display:"flex",alignItems:"flex-start",gap:9}}>
                    <div className="cb" onClick={()=>toggle(t.id)} style={{borderColor:t.done?"var(--g)":pc,background:t.done?"var(--g)":"transparent"}}>{t.done?"✓":""}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:13,fontWeight:600,textDecoration:t.done?"line-through":"none",color:t.done?"var(--t3)":"var(--t)",marginBottom:4}}>{t.title}</div>
                      <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                        {g&&<span className="bdg" style={{background:`${g.color}18`,color:g.color}}>🎯{g.title}</span>}
                        {t.time&&<span className="bdg" style={{background:"rgba(245,158,11,.1)",color:"var(--am)"}}>⏰{t.time}</span>}
                        {t.done&&t.completedAt&&<span className="bdg" style={{background:"rgba(16,185,129,.1)",color:"var(--g)"}}>✅{t.completedAt}</span>}
                        {t.note&&<span className="bdg" style={{background:"var(--bg4)",color:"var(--t3)"}}>📝</span>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="card">
            <div className="st" style={{marginBottom:10}}>📆 أيام الأسبوع</div>
            {days.map(d=>(
              <div key={d.s} style={{display:"flex",alignItems:"center",gap:9,marginBottom:7,padding:"6px 9px",borderRadius:8,background:d.isTod?"rgba(124,110,240,.08)":"var(--bg3)",border:`1px solid ${d.isTod?"rgba(124,110,240,.25)":"var(--brd)"}`}}>
                <div style={{width:34,flexShrink:0,textAlign:"center"}}>
                  <div style={{fontSize:8,color:d.isTod?"var(--a2)":"var(--t3)",fontWeight:700}}>{WD[d.d.getDay()]}</div>
                  <div style={{fontSize:13,fontWeight:800,color:d.isTod?"var(--a2)":"var(--t)",fontFamily:"Tajawal"}}>{d.d.getDate()}</div>
                </div>
                <div style={{flex:1}}><PBar pct={d.dt.length?Math.round(d.done/d.dt.length*100):0} color={d.isTod?"var(--a)":"var(--g)"} h={5}/></div>
                <div style={{fontSize:9,color:"var(--t3)",width:36,textAlign:"left",flexShrink:0}}>{d.done}/{d.dt.length}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="sh"><div className="st">🎯 تقدم الأهداف</div><span style={{fontSize:10,color:"var(--t3)",background:"var(--bg3)",padding:"2px 7px",borderRadius:20}}>هذا الأسبوع</span></div>
          {gProg.length===0?<div className="empty"><div style={{fontSize:30,marginBottom:7}}>🎯</div><div style={{fontSize:12}}>لا أهداف نشطة</div></div>
          :gProg.map(g=>(
            <div key={g.id} style={{marginBottom:15}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <div style={{display:"flex",alignItems:"center",gap:7}}><div style={{width:8,height:8,borderRadius:"50%",background:g.color,flexShrink:0}}/><span style={{fontSize:12,fontWeight:600}}>{g.title}</span></div>
                <div style={{display:"flex",alignItems:"center",gap:5}}><span style={{fontSize:12,color:g.color,fontWeight:800,fontFamily:"Tajawal"}}>{g.wp}%</span><span style={{fontSize:9,color:"var(--t3)"}}>/{g.progress}%</span></div>
              </div>
              <PBar pct={g.wp} color={g.color} h={7}/>
              <div style={{display:"flex",justifyContent:"space-between",marginTop:3}}>
                <span style={{fontSize:9,color:"var(--t3)"}}>{g.wd}/{g.wt} مهمة</span>
                <span style={{fontSize:9,color:"var(--t3)"}}>إجمالي {g.progress}%</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:11}}>
          <PrayerTracker/>
          <div style={{background:"linear-gradient(135deg,rgba(124,110,240,.08),rgba(92,79,212,.04))",border:"1px solid rgba(124,110,240,.15)",borderRadius:13,padding:"13px 15px",flex:1}}>
            <div style={{fontSize:34,color:"var(--a)",opacity:.15,lineHeight:1,fontFamily:"serif",marginBottom:-3}}>"</div>
            <div style={{fontSize:12,lineHeight:1.85,color:"var(--t)",fontWeight:500}}>{quote}</div>
            <div style={{fontSize:10,color:"var(--a2)",marginTop:9,fontWeight:700}}>✨ اقتباس اليوم</div>
          </div>
        </div>
      </div>
    </div>
  );
}
// ── GOALS PAGE ───────────────────────────────────────────────
function GoalsPage({goals,setGoals,tasks,addNotif,weekOffset}){
  const [showAdd,setShowAdd]=useState(false);
  const [editG,setEditG]=useState(null);
  const [delG,setDelG]=useState(null);
  const [exp,setExp]=useState(null);
  const [aF,setAF]=useState({title:"",category:"",color:"#6366f1",status:"active",startDate:"",endDate:""});
  const [eF,setEF]=useState({});
  const [ns,setNs]=useState("");
  const base=new Date();base.setDate(base.getDate()+weekOffset*7);
  const ws=getWeekStart(base);const we=getWeekEnd(ws);

  async function addGoal(){if(!aF.title.trim())return;const uid=(await supabase.auth.getUser()).data.user?.id;const{data}=await supabase.from("goals").insert({user_id:uid,title:aF.title,category:aF.category||"",progress:0,status:aF.status||"active",color:aF.color||"#6366f1",start_date:aF.startDate||"",end_date:aF.endDate||"",subtasks:[]}).select().single();if(data){setGoals(p=>[...p,{...data,subtasks:[]}]);addNotif({type:"success",icon:"🎯",title:"تم إنشاء الهدف",msg:data.title});}setShowAdd(false);setAF({title:"",category:"",color:"#6366f1",status:"active",startDate:"",endDate:""});}
  async function saveEdit(){if(!eF.title?.trim())return;await supabase.from("goals").update({title:eF.title,category:eF.category,status:eF.status,color:eF.color,start_date:eF.startDate,end_date:eF.endDate}).eq("id",editG.id);setGoals(p=>p.map(g=>g.id===editG.id?{...g,...eF,start_date:eF.startDate,end_date:eF.endDate}:g));addNotif({type:"info",icon:"✏️",title:"تم التعديل"});setEditG(null);}
  async function doDelete(){await supabase.from("goals").delete().eq("id",delG.id);setGoals(p=>p.filter(g=>g.id!==delG.id));addNotif({type:"warning",icon:"🗑️",title:"تم الحذف"});setDelG(null);}
  async function toggleSub(gid,sid){const g=goals.find(x=>x.id===gid);if(!g)return;const upd=g.subtasks.map(s=>s.id===sid?{...s,done:!s.done}:s);const prog=upd.length?Math.round(upd.filter(s=>s.done).length/upd.length*100):g.progress;await supabase.from("goals").update({subtasks:upd,progress:prog}).eq("id",gid);setGoals(p=>p.map(x=>x.id===gid?{...x,subtasks:upd,progress:prog}:x));}
  async function addSub(gid){if(!ns.trim())return;const g=goals.find(x=>x.id===gid);if(!g)return;const upd=[...(g.subtasks||[]),{id:Date.now(),title:ns,done:false}];await supabase.from("goals").update({subtasks:upd}).eq("id",gid);setGoals(p=>p.map(x=>x.id===gid?{...x,subtasks:upd}:x));setNs("");}
  async function delSub(gid,sid){const g=goals.find(x=>x.id===gid);if(!g)return;const upd=g.subtasks.filter(s=>s.id!==sid);const prog=upd.length?Math.round(upd.filter(s=>s.done).length/upd.length*100):g.progress;await supabase.from("goals").update({subtasks:upd,progress:prog}).eq("id",gid);setGoals(p=>p.map(x=>x.id===gid?{...x,subtasks:upd,progress:prog}:x));}

  const GF=({form,setForm})=>(<>
    <div style={{marginBottom:12}}><label className="fl">عنوان الهدف *</label><input className="fi" value={form.title||""} onChange={e=>setForm(p=>({...p,title:e.target.value}))} placeholder="مثال: قراءة 12 كتاب"/></div>
    <div className="fr"><div style={{marginBottom:12}}><label className="fl">الفئة</label><input className="fi" value={form.category||""} onChange={e=>setForm(p=>({...p,category:e.target.value}))} placeholder="تعليم، صحة..."/></div><div style={{marginBottom:12}}><label className="fl">الحالة</label><select className="fs" value={form.status||"active"} onChange={e=>setForm(p=>({...p,status:e.target.value}))}><option value="active">نشط</option><option value="paused">متوقف</option><option value="done">مكتمل</option></select></div></div>
    <div className="fr"><div style={{marginBottom:12}}><label className="fl">البداية</label><input type="date" className="fi" value={form.startDate||""} onChange={e=>setForm(p=>({...p,startDate:e.target.value}))}/></div><div style={{marginBottom:12}}><label className="fl">النهاية</label><input type="date" className="fi" value={form.endDate||""} onChange={e=>setForm(p=>({...p,endDate:e.target.value}))}/></div></div>
    <div style={{marginBottom:12}}><label className="fl">اللون</label><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{COLORS.map(c=><div key={c} onClick={()=>setForm(p=>({...p,color:c}))} style={{width:24,height:24,borderRadius:6,background:c,cursor:"pointer",border:(form.color||"#6366f1")===c?"3px solid white":"2px solid transparent",transition:"all .15s"}}/>)}</div></div>
  </>);

  return(<div className="page">
    <div className="sh"><div className="st">🎯 الأهداف</div><button className="btn bp bsm" onClick={()=>setShowAdd(true)}>+ هدف جديد</button></div>
    <div className="g4" style={{marginBottom:14}}>
      {[["🔥","active","نشطة"],["✅","done","مكتملة"],["⏸️","paused","متوقفة"]].map(([ic,s,l])=><div key={s} className="sm"><span style={{fontSize:20}}>{ic}</span><div><div style={{fontSize:19,fontWeight:900,fontFamily:"Tajawal",lineHeight:1}}>{goals.filter(g=>g.status===s).length}</div><div style={{fontSize:9,color:"var(--t2)",marginTop:2}}>أهداف {l}</div></div></div>)}
      <div className="sm"><span style={{fontSize:20}}>📊</span><div><div style={{fontSize:19,fontWeight:900,fontFamily:"Tajawal",lineHeight:1}}>{goals.length?Math.round(goals.reduce((a,g)=>a+g.progress,0)/goals.length):0}%</div><div style={{fontSize:9,color:"var(--t2)",marginTop:2}}>متوسط التقدم</div></div></div>
    </div>
    {goals.length===0&&<div className="empty card"><div style={{fontSize:34,marginBottom:8}}>🎯</div><div style={{fontSize:13}}>لا أهداف بعد</div></div>}
    {goals.map(g=>{
      const wt=tasks.filter(t=>{const d=new Date(t.date+"T00:00:00");return String(t.goalId||t.goal_id)===String(g.id)&&d>=ws&&d<=we;});
      const wd=wt.filter(t=>t.done);const wp=wt.length?Math.round(wd.length/wt.length*100):0;
      const isExp=exp===g.id;
      return(<div key={g.id} className="gc" style={{borderRight:`4px solid ${g.color}`}}>
        <div style={{padding:"13px 15px",cursor:"pointer"}} onClick={()=>setExp(isExp?null:g.id)}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                <span style={{fontSize:14,fontWeight:700}}>{g.title}</span>
                <span style={{fontSize:9,padding:"2px 7px",borderRadius:18,fontWeight:700,background:g.status==="active"?"rgba(16,185,129,.12)":g.status==="done"?"rgba(59,130,246,.12)":"rgba(245,158,11,.12)",color:g.status==="active"?"var(--g)":g.status==="done"?"var(--b)":"var(--am)"}}>{g.status==="active"?"نشط":g.status==="done"?"مكتمل":"متوقف"}</span>
                {g.category&&<span style={{fontSize:9,color:"var(--t3)"}}>{g.category}</span>}
              </div>
              <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:5}}><span style={{fontSize:10,color:"var(--t2)",flexShrink:0}}>الإجمالي</span><div style={{flex:1,maxWidth:150}}><PBar pct={g.progress} color={g.color} h={5}/></div><span style={{fontSize:12,color:g.color,fontWeight:800,fontFamily:"Tajawal"}}>{g.progress}%</span></div>
              <div style={{display:"flex",alignItems:"center",gap:9}}><span style={{fontSize:10,color:"var(--t2)",flexShrink:0}}>هذا الأسبوع</span><div style={{flex:1,maxWidth:150}}><PBar pct={wp} color={`${g.color}90`} h={4}/></div><span style={{fontSize:10,color:"var(--t3)"}}>{wd.length}/{wt.length} ({wp}%)</span></div>
            </div>
            <div style={{display:"flex",gap:5,alignItems:"center",flexShrink:0,marginRight:8}}>
              <button className="ib" style={{width:27,height:27,fontSize:12}} onClick={e=>{e.stopPropagation();setEF({title:g.title,category:g.category||"",color:g.color,status:g.status,startDate:g.start_date||"",endDate:g.end_date||""});setEditG(g);}}>✏️</button>
              <button className="ib" style={{width:27,height:27,fontSize:12,color:"var(--r)"}} onClick={e=>{e.stopPropagation();setDelG(g);}}>🗑️</button>
              <span style={{fontSize:11,color:"var(--t3)",width:14,textAlign:"center"}}>{isExp?"▲":"▼"}</span>
            </div>
          </div>
        </div>
        {isExp&&(<div style={{padding:"0 15px 13px",borderTop:"1px solid var(--brd)"}}>
          <div style={{fontSize:11,color:"var(--t2)",margin:"10px 0 7px",fontWeight:600}}>المهام الفرعية</div>
          {(!g.subtasks||!g.subtasks.length)&&<div style={{fontSize:11,color:"var(--t3)",marginBottom:7}}>لا مهام فرعية.</div>}
          {(g.subtasks||[]).map(s=><div key={s.id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderBottom:"1px solid var(--brd)"}}>
            <div className="cb" onClick={()=>toggleSub(g.id,s.id)} style={{borderColor:s.done?"var(--g)":g.color,background:s.done?"var(--g)":"transparent",width:16,height:16}}>{s.done?"✓":""}</div>
            <span style={{flex:1,fontSize:12,textDecoration:s.done?"line-through":"none",color:s.done?"var(--t3)":"var(--t)"}}>{s.title}</span>
            <button onClick={()=>delSub(g.id,s.id)} style={{background:"none",border:"none",cursor:"pointer",color:"var(--t3)",fontSize:12}}>✕</button>
          </div>)}
          <div style={{display:"flex",gap:6,marginTop:9}}>
            <input className="fi" style={{flex:1,padding:"6px 9px",fontSize:12}} placeholder="مهمة فرعية..." value={ns} onChange={e=>setNs(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addSub(g.id)}/>
            <button className="btn bp bsm" onClick={()=>addSub(g.id)}>+</button>
          </div>
        </div>)}
      </div>);
    })}
    <Modal open={showAdd} onClose={()=>setShowAdd(false)} title="إنشاء هدف جديد" icon="🎯"><GF form={aF} setForm={setAF}/><div style={{display:"flex",gap:7,justifyContent:"flex-end",marginTop:14}}><button className="btn bg" onClick={()=>setShowAdd(false)}>إلغاء</button><button className="btn bp" onClick={addGoal}>إنشاء ✨</button></div></Modal>
    <Modal open={!!editG} onClose={()=>setEditG(null)} title="تعديل الهدف" icon="✏️"><GF form={eF} setForm={setEF}/><div style={{display:"flex",gap:7,justifyContent:"flex-end",marginTop:14}}><button className="btn bg" onClick={()=>setEditG(null)}>إلغاء</button><button className="btn bp" onClick={saveEdit}>حفظ ✅</button></div></Modal>
    <Confirm open={!!delG} onClose={()=>setDelG(null)} onOk={doDelete} title="حذف الهدف" msg={`حذف "${delG?.title}"؟`}/>
  </div>);
}
// ── TASKS PAGE ───────────────────────────────────────────────
function TasksPage({tasks,setTasks,goals,setGoals,addNotif}){
  const [filter,setFilter]=useState("today");
  const [showAdd,setShowAdd]=useState(false);
  const [editT,setEditT]=useState(null);
  const [delT,setDelT]=useState(null);
  const today=toDay();
  const [aF,setAF]=useState({title:"",goalId:"",priority:"medium",date:today,repeat:"none",note:"",time:"",weekDays:[]});
  const [eF,setEF]=useState({});

  async function addTask(){
    if(!aF.title.trim())return;
    const uid=(await supabase.auth.getUser()).data.user?.id;
    const{data,error}=await supabase.from("tasks").insert({user_id:uid,title:aF.title,priority:aF.priority,date:aF.date,done:false,completed_at:null,repeat:aF.repeat||"none",goal_id:aF.goalId||null,note:aF.note||null,time:aF.time||null,week_days:aF.weekDays?.length?aF.weekDays:null}).select().single();
    if(data){setTasks(p=>[...p,{...data,completedAt:null,goalId:data.goal_id,weekDays:data.week_days}]);addNotif({type:"success",icon:"✅",title:"تم الإضافة",msg:data.title});}
    else addNotif({type:"warning",icon:"⚠️",title:"خطأ",msg:error?.message});
    setShowAdd(false);setAF({title:"",goalId:"",priority:"medium",date:today,repeat:"none",note:"",time:"",weekDays:[]});
  }

  async function saveEdit(){
    if(!eF.title?.trim())return;
    await supabase.from("tasks").update({title:eF.title,priority:eF.priority,date:eF.date,repeat:eF.repeat||"none",goal_id:eF.goalId||null,note:eF.note||null,time:eF.time||null,week_days:eF.weekDays?.length?eF.weekDays:null}).eq("id",editT.id);
    setTasks(p=>p.map(t=>t.id===editT.id?{...t,...eF,goalId:eF.goalId||null,weekDays:eF.weekDays}:t));
    addNotif({type:"info",icon:"✏️",title:"تم التعديل"});setEditT(null);
  }

  async function doDelete(){await supabase.from("tasks").delete().eq("id",delT.id);setTasks(p=>p.filter(t=>t.id!==delT.id));addNotif({type:"warning",icon:"🗑️",title:"تم الحذف"});setDelT(null);}

  async function toggle(id){
    const task=tasks.find(t=>t.id===id);if(!task)return;
    const done=!task.done;const now=new Date();
    const ca=done?`${now.getHours().toString().padStart(2,"0")}:${now.getMinutes().toString().padStart(2,"0")}`:null;
    await supabase.from("tasks").update({done,completed_at:ca}).eq("id",id);
    const upd=tasks.map(t=>t.id===id?{...t,done,completedAt:ca}:t);setTasks(upd);
    if(done){
      addNotif({type:"success",icon:"🎉",title:"أحسنت!",msg:task.title});
      const gid=task.goalId||task.goal_id;
      if(gid){const g=goals.find(x=>x.id===gid);if(g){const gt=upd.filter(t=>(t.goalId||t.goal_id)===gid);const p=gt.length?Math.round(gt.filter(t=>t.done).length/gt.length*100):0;const np=Math.min(100,Math.max(g.progress,p));await supabase.from("goals").update({progress:np}).eq("id",gid);setGoals(prev=>prev.map(x=>x.id===gid?{...x,progress:np}:x));}}
      if(task.repeat&&task.repeat!=="none"){
        const uid=(await supabase.auth.getUser()).data.user?.id;
        const nd=getNextRepeat(today,task.repeat);
        const{data:ex}=await supabase.from("tasks").select("id").eq("user_id",uid).eq("title",task.title).eq("date",nd).eq("done",false).limit(1);
        if(!ex||!ex.length){const{data:nx}=await supabase.from("tasks").insert({user_id:uid,title:task.title,priority:task.priority,date:nd,done:false,completed_at:null,repeat:task.repeat,goal_id:task.goalId||task.goal_id||null,time:task.time||null,week_days:task.weekDays||null,note:task.note||null}).select().single();if(nx){setTasks(p=>[...p,{...nx,completedAt:null,goalId:nx.goal_id,weekDays:nx.week_days}]);addNotif({type:"info",icon:"🔁",title:"تم جدولة التكرار",msg:nd});}}
      }
    }
  }

  async function reschedule(id){const t=new Date();t.setDate(t.getDate()+1);const nd=t.toISOString().split("T")[0];await supabase.from("tasks").update({date:nd}).eq("id",id);setTasks(p=>p.map(t=>t.id===id?{...t,date:nd}:t));addNotif({type:"info",icon:"📅",title:"غداً ✅"});}

  const ovCount=tasks.filter(t=>!t.done&&t.date<today).length;
  const filtered=tasks.filter(t=>{
    if(filter==="today") return t.date===today;
    if(filter==="week")  return isThisWeek(t.date,0);
    if(filter==="overdue") return !t.done&&t.date<today;
    if(filter==="done")  return t.done;
    if(filter==="high")  return t.priority==="high";
    return true;
  }).sort((a,b)=>(a.done?1:-1)||({"high":0,"medium":1,"low":2}[a.priority]??1)-({"high":0,"medium":1,"low":2}[b.priority]??1));

  const TF=({form,setForm})=>(<>
    <div style={{marginBottom:11}}><label className="fl">عنوان المهمة *</label><input className="fi" value={form.title||""} onChange={e=>setForm(p=>({...p,title:e.target.value}))} placeholder="ما الذي تريد إنجازه؟"/></div>
    <div className="fr"><div style={{marginBottom:11}}><label className="fl">الأولوية</label><select className="fs" value={form.priority||"medium"} onChange={e=>setForm(p=>({...p,priority:e.target.value}))}><option value="high">🔴 عالية</option><option value="medium">🟡 متوسطة</option><option value="low">🔵 منخفضة</option></select></div><div style={{marginBottom:11}}><label className="fl">التاريخ</label><input type="date" className="fi" value={form.date||today} onChange={e=>setForm(p=>({...p,date:e.target.value}))}/></div></div>
    <div className="fr"><div style={{marginBottom:11}}><label className="fl">⏰ وقت التذكير</label><input type="time" className="fi" value={form.time||""} onChange={e=>setForm(p=>({...p,time:e.target.value}))}/></div><div style={{marginBottom:11}}><label className="fl">🔁 التكرار</label><select className="fs" value={form.repeat||"none"} onChange={e=>setForm(p=>({...p,repeat:e.target.value,weekDays:[]}))}><option value="none">لا تكرار</option><option value="daily">🔁 يومي</option><option value="weekly">📆 أسبوعي</option><option value="monthly">🗓️ شهري</option></select></div></div>
    {form.repeat==="weekly"&&<div style={{marginBottom:11}}><label className="fl">أيام الأسبوع</label><div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{WD.map((d,i)=>{const s=(form.weekDays||[]).includes(i);return<div key={i} onClick={()=>setForm(p=>({...p,weekDays:s?p.weekDays.filter(x=>x!==i):[...(p.weekDays||[]),i]}))} style={{padding:"4px 9px",borderRadius:17,fontSize:11,fontWeight:600,cursor:"pointer",background:s?"var(--a)":"var(--bg3)",border:`1px solid ${s?"var(--a)":"var(--brd)"}`,color:s?"white":"var(--t2)",transition:"all .15s"}}>{d}</div>;})}  </div></div>}
    <div style={{marginBottom:11}}><label className="fl">ربط بهدف</label><select className="fs" value={form.goalId||""} onChange={e=>setForm(p=>({...p,goalId:e.target.value}))}><option value="">بدون هدف</option>{goals.map(g=><option key={g.id} value={g.id}>{g.title}</option>)}</select></div>
    <div style={{marginBottom:4}}><label className="fl">📝 ملاحظات</label><textarea className="fta" value={form.note||""} onChange={e=>setForm(p=>({...p,note:e.target.value}))} placeholder="اختياري..." style={{minHeight:55}}/></div>
  </>);

  return(<div className="page">
    <div className="sh"><div className="st">📋 المهام</div><button className="btn bp bsm" onClick={()=>setShowAdd(true)}>+ مهمة جديدة</button></div>
    <div style={{display:"flex",gap:4,background:"var(--bg3)",borderRadius:9,padding:3,marginBottom:14,flexWrap:"wrap"}}>
      {[["today","اليوم",null],["week","الأسبوع",null],["overdue","متأخرة",ovCount||null],["done","مكتملة",null],["high","عالية",null],["all","الكل",null]].map(([v,l,b])=>(
        <div key={v} onClick={()=>setFilter(v)} style={{flex:1,minWidth:55,textAlign:"center",padding:"6px 7px",borderRadius:7,fontSize:11,fontWeight:600,cursor:"pointer",transition:"all .15s",background:filter===v?"var(--a)":"transparent",color:filter===v?"white":"var(--t2)",display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>
          {l}{b?<span style={{background:"var(--r)",color:"white",fontSize:9,padding:"1px 4px",borderRadius:18}}>{b}</span>:null}
        </div>
      ))}
    </div>
    {filtered.length===0?<div className="empty card"><div style={{fontSize:32,marginBottom:7}}>✨</div><div style={{fontSize:13}}>لا مهام هنا</div></div>
    :filtered.map(t=>{
      const g=goals.find(x=>String(x.id)===String(t.goalId||t.goal_id));
      const pc=t.priority==="high"?"var(--r)":t.priority==="medium"?"var(--am)":"var(--b)";
      const ov=!t.done&&t.date<today;
      return(<div key={t.id} className={`tc ${t.done?"dn":""} ${ov?"ov":""}`} style={{borderRight:`3px solid ${pc}`}}>
        <div style={{display:"flex",alignItems:"flex-start",gap:9}}>
          <div className="cb" onClick={()=>toggle(t.id)} style={{borderColor:t.done?"var(--g)":pc,background:t.done?"var(--g)":"transparent"}}>{t.done?"✓":""}</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:"flex",justifyContent:"space-between",gap:6,marginBottom:4}}>
              <div style={{fontSize:13,fontWeight:600,textDecoration:t.done?"line-through":"none",color:t.done?"var(--t3)":"var(--t)"}}>{t.title}</div>
              {t.time&&<span className="bdg" style={{background:"rgba(245,158,11,.1)",color:"var(--am)",flexShrink:0}}>⏰{t.time}</span>}
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
              <span className="bdg" style={{background:t.priority==="high"?"rgba(239,68,68,.1)":t.priority==="medium"?"rgba(245,158,11,.1)":"rgba(59,130,246,.1)",color:pc}}>{t.priority==="high"?"🔴 عالية":t.priority==="medium"?"🟡 متوسطة":"🔵 منخفضة"}</span>
              {g&&<span className="bdg" style={{background:`${g.color}18`,color:g.color}}>🎯{g.title}</span>}
              <span className="bdg" style={{background:"var(--bg4)",color:"var(--t3)"}}>📅{t.date}</span>
              {t.repeat&&t.repeat!=="none"&&<span className="bdg" style={{background:"rgba(124,110,240,.1)",color:"var(--a2)"}}>{t.repeat==="daily"?"🔁 يومي":t.repeat==="weekly"?"📆 أسبوعي":"🗓️ شهري"}</span>}
              {ov&&<span className="bdg" style={{background:"rgba(239,68,68,.1)",color:"var(--r)"}}>⚠️ متأخرة</span>}
              {t.done&&t.completedAt&&<span className="bdg" style={{background:"rgba(16,185,129,.1)",color:"var(--g)"}}>✅{t.completedAt}</span>}
            </div>
            {t.note&&<div style={{marginTop:5,padding:"4px 8px",background:"var(--bg4)",borderRadius:6,borderRight:"2px solid var(--a3)",fontSize:11,color:"var(--t2)"}}>📝{t.note}</div>}
          </div>
          <div style={{display:"flex",gap:3,flexShrink:0}}>
            {!t.done&&<button className="ib" style={{width:27,height:27,fontSize:12}} onClick={()=>reschedule(t.id)} title="غداً">📅</button>}
            <button className="ib" style={{width:27,height:27,fontSize:12}} onClick={()=>{setEF({title:t.title,goalId:t.goalId?String(t.goalId):"",priority:t.priority,date:t.date,repeat:t.repeat||"none",note:t.note||"",time:t.time||"",weekDays:t.weekDays||[]});setEditT(t);}}>✏️</button>
            <button className="ib" style={{width:27,height:27,fontSize:12,color:"var(--r)"}} onClick={()=>setDelT(t)}>🗑️</button>
          </div>
        </div>
      </div>);
    })}
    <Modal open={showAdd} onClose={()=>setShowAdd(false)} title="مهمة جديدة" icon="✅"><TF form={aF} setForm={setAF}/><div style={{display:"flex",gap:7,justifyContent:"flex-end",marginTop:12}}><button className="btn bg" onClick={()=>setShowAdd(false)}>إلغاء</button><button className="btn bp" onClick={addTask}>إضافة</button></div></Modal>
    <Modal open={!!editT} onClose={()=>setEditT(null)} title="تعديل المهمة" icon="✏️"><TF form={eF} setForm={setEF}/><div style={{display:"flex",gap:7,justifyContent:"flex-end",marginTop:12}}><button className="btn bg" onClick={()=>setEditT(null)}>إلغاء</button><button className="btn bp" onClick={saveEdit}>حفظ ✅</button></div></Modal>
    <Confirm open={!!delT} onClose={()=>setDelT(null)} onOk={doDelete} title="حذف المهمة" msg={`حذف "${delT?.title}"؟`}/>
  </div>);
}
// ── POMODORO ─────────────────────────────────────────────────
function PomodoroPage({onSession,addNotif,goals}){
  const load=()=>{try{return JSON.parse(localStorage.getItem(POMO_KEY));}catch{return null;}};
  const sv=load();
  const getR=()=>{const s=load();if(s?.isRunning&&s?.startedAt){const el=Math.floor((Date.now()-s.startedAt)/1000);const tot=(s.phase==="work"?s.workMin:s.breakMin)*60;return Math.max(0,tot-el);}return(sv?.workMin||25)*60;};
  const [wMin,setWMin]=useState(sv?.workMin||25);
  const [bMin,setBMin]=useState(sv?.breakMin||5);
  const [phase,setPhase]=useState(sv?.phase||"work");
  const [sess,setSess]=useState(sv?.sessions||0);
  const [selG,setSelG]=useState(sv?.selGoal||null);
  const [showPick,setShowPick]=useState(false);
  const [secs,setSecs]=useState(getR);
  const [running,setRunning]=useState(()=>{const s=sv;if(s?.isRunning&&s?.startedAt){const el=Math.floor((Date.now()-s.startedAt)/1000);const tot=(s.phase==="work"?s.workMin:s.breakMin)*60;return el<tot;}return false;});
  const [log,setLog]=useState(()=>{try{return JSON.parse(localStorage.getItem("injaz-pomo-log"))||[];}catch{return [];}});
  const iv=useRef(null);
  const tot=phase==="work"?wMin*60:bMin*60;
  const save=(patch={})=>{const s=load()||{};localStorage.setItem(POMO_KEY,JSON.stringify({...s,workMin:wMin,breakMin:bMin,phase,sessions:sess,secs,isRunning:running,selGoal:selG,...patch}));};

  useEffect(()=>{
    if(!running)return;
    const s=load()||{};if(!s.startedAt)save({isRunning:true,startedAt:Date.now()});
    function tick(){const st=load()||{};if(!st.startedAt)return;const el=Math.floor((Date.now()-st.startedAt)/1000);const t=(st.phase==="work"?st.workMin:st.breakMin)*60;const rem=Math.max(0,t-el);setSecs(rem);
      if(rem<=0){clearInterval(iv.current);setRunning(false);
        if(st.phase==="work"){const ns=(st.sessions||0)+1;setSess(ns);addNotif({type:"success",icon:"🍅",title:"انتهت الجلسة!",msg:st.selGoal?.title||""});onSession(st.workMin);
          const nl=[{id:Date.now(),goalTitle:st.selGoal?.title||"بدون هدف",goalColor:st.selGoal?.color,mins:st.workMin,date:new Date().toLocaleDateString("ar-EG",{day:"numeric",month:"short"}),time:new Date().toLocaleTimeString("ar",{hour:"2-digit",minute:"2-digit"})},...(()=>{try{return JSON.parse(localStorage.getItem("injaz-pomo-log"))||[];}catch{return [];}})().slice(0,29)];
          localStorage.setItem("injaz-pomo-log",JSON.stringify(nl));setLog(nl);
          setPhase("break");setSecs(st.breakMin*60);localStorage.setItem(POMO_KEY,JSON.stringify({...st,phase:"break",sessions:ns,secs:st.breakMin*60,startedAt:Date.now(),isRunning:true}));
        }else{addNotif({type:"info",icon:"💪",title:"انتهت الاستراحة!"});setPhase("work");setSecs(st.workMin*60);localStorage.setItem(POMO_KEY,JSON.stringify({...st,phase:"work",secs:st.workMin*60,startedAt:Date.now(),isRunning:true}));}
      }
    }
    iv.current=setInterval(tick,500);tick();return()=>clearInterval(iv.current);
  },[running]);

  useEffect(()=>{function onV(){if(document.visibilityState!=="visible")return;const s=load();if(s?.isRunning&&s?.startedAt){const el=Math.floor((Date.now()-s.startedAt)/1000);const t=(s.phase==="work"?s.workMin:s.breakMin)*60;setSecs(Math.max(0,t-el));}}document.addEventListener("visibilitychange",onV);return()=>document.removeEventListener("visibilitychange",onV);},[]);

  const start=()=>{if(!selG){setShowPick(true);return;}save({isRunning:true,startedAt:Date.now()});setRunning(true);};
  const pause=()=>{clearInterval(iv.current);setRunning(false);save({isRunning:false,startedAt:null,secs});};
  const reset=()=>{clearInterval(iv.current);setRunning(false);setPhase("work");setSecs(wMin*60);save({isRunning:false,startedAt:null,phase:"work",secs:wMin*60});};

  const m=Math.floor(secs/60).toString().padStart(2,"0");const s2=(secs%60).toString().padStart(2,"0");
  const circ=2*Math.PI*78;const doff=circ-(circ*(1-secs/tot));const sc=phase==="work"?"var(--a)":"var(--g)";

  return(<div className="page">
    <div className="st" style={{justifyContent:"center",fontSize:17,marginBottom:18}}>🍅 مؤقت بومودورو</div>
    {showPick&&<div className="ov-lay" onClick={()=>setShowPick(false)}><div className="modal" style={{maxWidth:360}} onClick={e=>e.stopPropagation()}><div style={{fontSize:15,fontWeight:700,marginBottom:14}}>🎯 اختر هدف الجلسة</div>{goals.filter(g=>g.status==="active").map(g=><div key={g.id} onClick={()=>{setSelG(g);setShowPick(false);save({selGoal:g,isRunning:true,startedAt:Date.now()});setRunning(true);}} style={{display:"flex",alignItems:"center",gap:9,padding:"10px 13px",borderRadius:9,cursor:"pointer",background:"var(--bg3)",border:"1px solid var(--brd)",marginBottom:6,transition:"all .15s"}} onMouseEnter={e=>e.currentTarget.style.borderColor=g.color} onMouseLeave={e=>e.currentTarget.style.borderColor="var(--brd)"}><div style={{width:9,height:9,borderRadius:"50%",background:g.color,flexShrink:0}}/><div><div style={{fontSize:13,fontWeight:600}}>{g.title}</div><div style={{fontSize:10,color:"var(--t2)"}}>{g.progress}%</div></div></div>)}<button className="btn bg" style={{width:"100%",justifyContent:"center",marginTop:4}} onClick={()=>setShowPick(false)}>إلغاء</button></div></div>}
    <div className="g2" style={{maxWidth:780,margin:"0 auto"}}>
      <div className="card" style={{textAlign:"center"}}>
        {selG?<div style={{display:"inline-flex",alignItems:"center",gap:6,padding:"4px 11px",borderRadius:17,background:`${selG.color}14`,border:`1px solid ${selG.color}30`,marginBottom:13,cursor:"pointer"}} onClick={()=>!running&&setShowPick(true)}><div style={{width:7,height:7,borderRadius:"50%",background:selG.color}}/><span style={{fontSize:11,fontWeight:600,color:selG.color}}>{selG.title}</span>{!running&&<span style={{fontSize:9,color:"var(--t3)"}}>✎</span>}</div>:<div style={{fontSize:11,color:"var(--t3)",marginBottom:13}}>اختر هدفاً للبدء ▶</div>}
        <div style={{display:"flex",justifyContent:"center",gap:4,marginBottom:14}}>{[["work","عمل",sc],["break","راحة","var(--g)"]].map(([p,l,c])=><div key={p} onClick={()=>!running&&(setPhase(p),setSecs(p==="work"?wMin*60:bMin*60))} style={{padding:"5px 14px",borderRadius:7,fontSize:11,fontWeight:600,cursor:"pointer",background:phase===p?c:"var(--bg3)",color:phase===p?"white":"var(--t2)",border:`1px solid ${phase===p?c:"var(--brd)"}`,transition:"all .15s"}}>{l}</div>)}</div>
        <div style={{position:"relative",width:168,height:168,margin:"0 auto 18px"}}><svg width="168" height="168" viewBox="0 0 168 168" style={{transform:"rotate(-90deg)"}}><circle cx="84" cy="84" r="78" fill="none" stroke="var(--bg4)" strokeWidth="7"/><circle cx="84" cy="84" r="78" fill="none" stroke={sc} strokeWidth="7" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={doff} style={{filter:`drop-shadow(0 0 9px ${phase==="work"?"rgba(124,110,240,.5)":"rgba(16,185,129,.5)"})`}}/></svg><div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",textAlign:"center"}}><div style={{fontFamily:"Tajawal",fontSize:38,fontWeight:900,color:sc,lineHeight:1}}>{m}:{s2}</div><div style={{fontSize:10,color:"var(--t2)",marginTop:3}}>{phase==="work"?"🎯 تركيز":"☕ راحة"}</div></div></div>
        <div style={{display:"flex",justifyContent:"center",gap:9,marginBottom:14}}><button className="pomo-btn pomo-sec" onClick={reset}>↺</button><button className="pomo-btn pomo-main" onClick={running?pause:start}>{running?"⏸":"▶"}</button><button className="pomo-btn pomo-sec" onClick={()=>!running&&(setPhase(phase==="work"?"break":"work"),setSecs(phase==="work"?bMin*60:wMin*60))}>⏭</button></div>
        <div style={{fontSize:10,color:"var(--t2)",marginBottom:7}}>جلسات: <strong style={{color:"var(--a2)"}}>{sess}</strong></div>
        <div style={{display:"flex",justifyContent:"center",gap:5,marginBottom:14}}>{[...Array(8)].map((_,i)=><div key={i} className={`pdot ${i<sess?"on":""}`}/>)}</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>{[["⏱️ عمل",wMin,setWMin],["☕ راحة",bMin,setBMin]].map(([l,v,setter])=><div key={l} style={{background:"var(--bg3)",border:"1px solid var(--brd)",borderRadius:8,padding:"8px",textAlign:"center"}}><div style={{fontSize:9,color:"var(--t2)",marginBottom:4}}>{l}</div><div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:7}}><div onClick={()=>!running&&setter(p=>Math.max(1,p-1))} style={{width:19,height:19,borderRadius:5,background:"var(--bg4)",border:"1px solid var(--brd)",cursor:"pointer",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center",color:"var(--t2)"}}>−</div><div style={{fontSize:16,fontWeight:700,fontFamily:"Tajawal"}}>{v}</div><div onClick={()=>!running&&setter(p=>Math.min(90,p+1))} style={{width:19,height:19,borderRadius:5,background:"var(--bg4)",border:"1px solid var(--brd)",cursor:"pointer",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center",color:"var(--t2)"}}>+</div></div></div>)}</div>
      </div>
      <div className="card"><div className="st" style={{marginBottom:13}}>📊 سجل الجلسات</div>
        {log.length===0?<div className="empty"><div style={{fontSize:30,marginBottom:7}}>🍅</div><div style={{fontSize:12}}>لا جلسات بعد</div></div>
        :<div style={{maxHeight:370,overflowY:"auto"}}>
          {log.map((s,i)=><div key={s.id} style={{display:"flex",alignItems:"center",gap:9,padding:"8px 9px",borderRadius:8,background:"var(--bg3)",border:"1px solid var(--brd)",marginBottom:6}}><div style={{width:30,height:30,borderRadius:7,background:s.goalColor?`${s.goalColor}18`:"var(--bg4)",border:`1px solid ${s.goalColor||"var(--brd)"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>🍅</div><div style={{flex:1,minWidth:0}}><div style={{fontSize:12,fontWeight:600,color:s.goalColor||"var(--t)"}}>{s.goalTitle}</div><div style={{fontSize:10,color:"var(--t2)"}}>{s.date} · {s.time} · {s.mins} دقيقة</div></div><div style={{fontSize:9,padding:"2px 6px",borderRadius:17,background:"rgba(124,110,240,.1)",color:"var(--a2)",fontWeight:700}}>#{log.length-i}</div></div>)}
          <div style={{marginTop:9,padding:"9px 11px",background:"var(--bg3)",borderRadius:8,border:"1px solid var(--brd)"}}><div style={{fontSize:10,color:"var(--t2)",marginBottom:6,fontWeight:600}}>⏱️ إجمالي التركيز</div>{Object.entries(log.reduce((a,s)=>{const k=s.goalTitle||"بدون هدف";if(!a[k])a[k]={m:0,c:s.goalColor||"var(--t2)"};a[k].m+=s.mins;return a;},{})).map(([g,{m,c}])=><div key={g} style={{display:"flex",justifyContent:"space-between",marginBottom:2}}><span style={{fontSize:10,color:c}}>{g}</span><span style={{fontSize:10,fontWeight:700,color:c}}>{Math.floor(m/60)}س {m%60}د</span></div>)}</div>
        </div>}
      </div>
    </div>
  </div>);
}

// ── STATS ─────────────────────────────────────────────────────
function StatsPage({tasks,goals}){
  const today=toDay();
  const wt=tasks.filter(t=>isThisWeek(t.date,0));
  const weeks=Array.from({length:4},(_,i)=>{const base=new Date();base.setDate(base.getDate()-(3-i)*7);const ws=getWeekStart(base);const we=getWeekEnd(ws);const wts=tasks.filter(t=>{const d=new Date(t.date+"T00:00:00");return d>=ws&&d<=we;});const wd=wts.filter(t=>t.done);return{l:`أ${4-i}`,t:wts.length,d:wd.length,p:wts.length?Math.round(wd.length/wts.length*100):0};});
  const maxT=Math.max(...weeks.map(w=>w.t),1);
  return(<div className="page">
    <div className="st" style={{fontSize:17,marginBottom:18}}>📊 الإحصائيات</div>
    <div className="g4" style={{marginBottom:18}}>
      {[{i:"✅",v:tasks.filter(t=>t.done).length,l:"مكتملة الكل",c:"var(--a)"},{i:"📅",v:`${wt.filter(t=>t.done).length}/${wt.length}`,l:"هذا الأسبوع",c:"var(--g)"},{i:"🎯",v:goals.filter(g=>g.status==="active").length,l:"أهداف نشطة",c:"var(--b)"},{i:"📈",v:(goals.length?Math.round(goals.reduce((a,g)=>a+g.progress,0)/goals.length):0)+"%",l:"متوسط الأهداف",c:"var(--am)"}].map((s,i)=><div key={i} className="sm"><span style={{fontSize:21}}>{s.i}</span><div><div style={{fontSize:18,fontWeight:900,fontFamily:"Tajawal",color:s.c,lineHeight:1}}>{s.v}</div><div style={{fontSize:9,color:"var(--t2)",marginTop:2}}>{s.l}</div></div></div>)}
    </div>
    <div className="g2">
      <div className="card"><div className="st" style={{marginBottom:14}}>📆 آخر 4 أسابيع</div><div style={{display:"flex",alignItems:"flex-end",gap:11,height:110}}>{weeks.map((w,i)=><div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3,height:"100%",justifyContent:"flex-end"}}><div style={{fontSize:9,color:"var(--t2)",fontWeight:600}}>{w.p}%</div><div style={{width:"100%",borderRadius:"4px 4px 0 0",background:"linear-gradient(180deg,var(--a),var(--a3))",height:`${Math.max(7,w.t/maxT*100)}%`,transition:"height .8s ease"}}/><div style={{fontSize:8,color:"var(--t3)"}}>{w.l}</div><div style={{fontSize:8,color:"var(--t2)"}}>{w.d}/{w.t}</div></div>)}</div></div>
      <div className="card"><div className="st" style={{marginBottom:14}}>🎯 تقدم الأهداف</div>{goals.slice(0,6).map(g=><div key={g.id} style={{marginBottom:12}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}><div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:7,height:7,borderRadius:"50%",background:g.color,flexShrink:0}}/><span style={{fontSize:12,fontWeight:600}}>{g.title}</span></div><span style={{fontSize:12,color:g.color,fontWeight:800,fontFamily:"Tajawal"}}>{g.progress}%</span></div><PBar pct={g.progress} color={g.color} h={6}/></div>)}</div>
    </div>
  </div>);
}

// ── AI ─────────────────────────────────────────────────────────
function AIPage({tasks,goals}){
  const [msgs,setMsgs]=useState([{role:"bot",text:"مرحباً! أنا مساعدك الذكي 🤖\n\nاسألني عن:\n• أفضل مهام اليوم\n• تحليل أسباب التأجيل\n• نصائح لتحسين الإنتاجية\n• مراجعة أدائك الأسبوعي"}]);
  const [inp,setInp]=useState(""); const [load,setLoad]=useState(false); const bot=useRef(null);
  useEffect(()=>bot.current?.scrollIntoView({behavior:"smooth"}),[msgs]);
  const suggs=["ما أهم مهمة اليوم؟","حلل أسباب التأجيل","راجع أدائي هذا الأسبوع","كيف أحسن إنتاجيتي؟"];
  async function send(){
    if(!inp.trim()||load)return;
    const um=inp.trim();setInp("");setMsgs(p=>[...p,{role:"user",text:um}]);setLoad(true);
    const today=toDay();const tt=tasks.filter(t=>t.date===today);
    const sys=`أنت مساعد إنتاجية ذكي باللغة العربية. المستخدم لديه:\n- ${tt.length} مهمة اليوم (${tt.filter(t=>t.done).length} مكتملة)\n- أهداف: ${goals.filter(g=>g.status==="active").map(g=>`${g.title}(${g.progress}%)`).join("،")}\nقدم نصائح عملية موجزة.`;
    try{const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:700,system:sys,messages:[{role:"user",content:um}]})});const d=await r.json();setMsgs(p=>[...p,{role:"bot",text:d.content?.[0]?.text||"عذراً."}]);}
    catch{setMsgs(p=>[...p,{role:"bot",text:"تعذر الاتصال."}]);}
    setLoad(false);
  }
  return(<div className="page">
    <div className="st" style={{fontSize:17,marginBottom:15}}>🤖 المساعد الذكي</div>
    <div className="card" style={{marginBottom:12,padding:"12px 16px"}}><div style={{fontSize:11,color:"var(--t2)",marginBottom:8,fontWeight:600}}>💡 اقتراحات</div><div style={{display:"flex",flexWrap:"wrap",gap:6}}>{suggs.map(s=><button key={s} className="btn bg bsm" onClick={()=>setInp(s)}>{s}</button>)}</div></div>
    <div className="card" style={{display:"flex",flexDirection:"column",minHeight:380}}>
      <div style={{flex:1,maxHeight:400,overflowY:"auto",display:"flex",flexDirection:"column",gap:10,padding:4}}>
        {msgs.map((m,i)=><div key={i} style={{display:"flex",gap:10,flexDirection:m.role==="user"?"row-reverse":"row"}}><div style={{width:30,height:30,borderRadius:8,background:m.role==="bot"?"linear-gradient(135deg,var(--a),#06b6d4)":"var(--bg3)",border:m.role==="user"?"1px solid var(--brd)":"none",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>{m.role==="bot"?"🤖":"👤"}</div><div style={{padding:"10px 14px",borderRadius:m.role==="bot"?"10px 2px 10px 10px":"2px 10px 10px 10px",fontSize:13,lineHeight:1.7,maxWidth:"85%",background:m.role==="bot"?"var(--bg3)":"var(--a)",color:m.role==="user"?"white":"var(--t)",whiteSpace:"pre-line"}}>{m.text}</div></div>)}
        {load&&<div style={{display:"flex",gap:10}}><div style={{width:30,height:30,borderRadius:8,background:"linear-gradient(135deg,var(--a),#06b6d4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>🤖</div><div style={{padding:"10px 14px",borderRadius:"10px 2px 10px 10px",background:"var(--bg3)",display:"flex",gap:8,alignItems:"center"}}><div className="sp"/><span style={{fontSize:12,color:"var(--t2)"}}>يفكر...</span></div></div>}
        <div ref={bot}/>
      </div>
      <div style={{borderTop:"1px solid var(--brd)",paddingTop:12,marginTop:8,display:"flex",gap:8}}>
        <input className="ai-in" placeholder="اسألني..." value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&send()}/>
        <button className="btn bp" onClick={send} disabled={load} style={{flexShrink:0}}>{load?<div className="sp"/>:"إرسال"}</button>
      </div>
    </div>
  </div>);
}
// ── AUTH ──────────────────────────────────────────────────────
function AuthPage({onAuth}){
  const [mode,setMode]=useState("login");
  const [email,setEmail]=useState("");
  const [pass,setPass]=useState("");
  const [loading,setLoading]=useState(false);
  const [err,setErr]=useState("");
  async function submit(){
    if(!email||!pass){setErr("أدخل البريد وكلمة المرور");return;}
    setLoading(true);setErr("");
    try{const r=mode==="login"?await supabase.auth.signInWithPassword({email,password:pass}):await supabase.auth.signUp({email,password:pass});if(r.error)setErr(r.error.message);else if(r.data?.user)onAuth(r.data.user);else if(mode==="signup"){setErr("تحقق من بريدك ثم سجّل دخول.");setMode("login");}}catch{setErr("خطأ، حاول مرة أخرى.");}
    setLoading(false);
  }
  return(<div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"var(--bg)",fontFamily:"'IBM Plex Sans Arabic',sans-serif",direction:"rtl"}}>
    <style>{S}</style>
    <div style={{width:"100%",maxWidth:370,padding:"0 18px"}}>
      <div style={{textAlign:"center",marginBottom:26}}>
        <div style={{width:54,height:54,background:"linear-gradient(135deg,var(--a),var(--a3))",borderRadius:15,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,margin:"0 auto 13px",boxShadow:"0 8px 26px rgba(124,110,240,.4)"}}>⚡</div>
        <div style={{fontSize:25,fontWeight:900,fontFamily:"Tajawal",color:"var(--t)"}}>إنجاز</div>
        <div style={{fontSize:11,color:"var(--t3)",marginTop:3}}>نظام إدارة حياتك الأسبوعي</div>
      </div>
      <div className="card" style={{padding:22}}>
        <div style={{display:"flex",gap:4,background:"var(--bg3)",borderRadius:9,padding:3,marginBottom:18}}>
          {[["login","دخول"],["signup","حساب جديد"]].map(([v,l])=><div key={v} onClick={()=>{setMode(v);setErr("");}} style={{flex:1,textAlign:"center",padding:"7px",borderRadius:7,fontSize:12,fontWeight:600,cursor:"pointer",background:mode===v?"var(--a)":"transparent",color:mode===v?"white":"var(--t2)",transition:"all .15s"}}>{l}</div>)}
        </div>
        <div style={{marginBottom:12}}><label className="fl">📧 البريد</label><input className="fi" type="email" placeholder="your@email.com" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()}/></div>
        <div style={{marginBottom:12}}><label className="fl">🔒 كلمة المرور</label><input className="fi" type="password" placeholder="••••••••" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()}/></div>
        {err&&<div style={{background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.25)",borderRadius:8,padding:"8px 11px",fontSize:12,color:"var(--r)",marginBottom:13}}>{err}</div>}
        <button className="btn bp" onClick={submit} disabled={loading} style={{width:"100%",justifyContent:"center",height:41,fontSize:13}}>
          {loading?<div className="sp"/>:mode==="login"?"🚀 دخول":"✨ إنشاء حساب"}
        </button>
      </div>
    </div>
  </div>);
}

// ── MAIN APP ──────────────────────────────────────────────────
export default function App(){
  const [page,setPage]=useState("week");
  const [user,setUser]=useState(null);
  const [authLoading,setAuthLoading]=useState(true);
  const [dataLoaded,setDataLoaded]=useState(false);
  const [goals,setGoals]=useState([]);
  const [tasks,setTasks]=useState([]);
  const [pomoSess,setPomoSess]=useState(0);
  const [todayFocus,setTodayFocus]=useState(0);
  const [notifs,setNotifs]=useState([]);
  const [sidebarOpen,setSidebarOpen]=useState(false);
  const [weekOffset,setWeekOffset]=useState(0);
  const [dbLoading,setDbLoading]=useState(true);

  useEffect(()=>{
    supabase.auth.getSession().then(({data})=>{setUser(data.session?.user||null);setAuthLoading(false);});
    const{data:l}=supabase.auth.onAuthStateChange((_e,s)=>setUser(s?.user||null));
    return()=>l.subscription.unsubscribe();
  },[]);

  useEffect(()=>{if(user)load(user.id);else{setGoals([]);setTasks([]);}},[user]);

  async function load(uid){
    setDbLoading(true);setDataLoaded(false);setGoals([]);setTasks([]);
    try{const [{data:gd},{data:td}]=await Promise.all([supabase.from("goals").select("*").eq("user_id",uid).order("created_at"),supabase.from("tasks").select("*").eq("user_id",uid).order("created_at")]);if(gd)setGoals(gd.map(g=>({...g,subtasks:g.subtasks||[]})));if(td)setTasks(td.map(t=>({...t,completedAt:t.completed_at,goalId:t.goal_id,note:t.note,time:t.time,weekDays:t.week_days||[]})));}catch(e){console.error(e);}
    setDbLoading(false);setDataLoaded(true);
  }

  useEffect(()=>{
    if(!user)return;
    if("Notification"in window&&Notification.permission==="default")Notification.requestPermission();
    function check(){
      const now=new Date();const today=toDay();
      const hh=now.getHours().toString().padStart(2,"0");const mm=now.getMinutes().toString().padStart(2,"0");const cur=`${hh}:${mm}`;
      tasks.forEach(t=>{
        if(t.done||t.date!==today||!t.time)return;
        function snd(title,body,tag){if(sessionStorage.getItem(tag))return;sessionStorage.setItem(tag,"1");addNotif({type:"info",icon:"⏰",title,msg:body});if("Notification"in window&&Notification.permission==="granted")try{new Notification(title,{body,dir:"rtl",tag});}catch(e){}}
        if(t.time===cur)snd("⏰ حان وقت المهمة!",t.title,`n-${t.id}-${today}-${cur}`);
        else{try{const d=new Date(`${today}T${t.time}:00`);const diff=d-now;if(diff>0&&diff<=5*60*1000+59000)snd("🔔 بعد 5 دقائق",t.title,`w-${t.id}-${today}-${hh}:${mm}`);}catch(e){}}
      });
    }
    const iv=setInterval(check,30000);check();return()=>clearInterval(iv);
  },[user,tasks]);

  function addNotif(n){const id=Date.now();setNotifs(p=>[...p,{...n,id}]);setTimeout(()=>setNotifs(p=>p.filter(x=>x.id!==id)),3500);}
  function onPomoSession(mins){setPomoSess(p=>p+1);setTodayFocus(p=>p+mins/60);}
  async function logout(){await supabase.auth.signOut();setUser(null);}

  const today=new Date();
  const ovCount=tasks.filter(t=>!t.done&&t.date<toDay()).length;
  const todayCount=tasks.filter(t=>!t.done&&t.date===toDay()).length;
  const base=new Date();base.setDate(base.getDate()+weekOffset*7);
  const ws=getWeekStart(base);const we=getWeekEnd(ws);const wn=getWeekNumber(ws);

  const NAV=[
    {id:"week",  icon:"📅", label:"هذا الأسبوع"},
    {id:"goals", icon:"🎯", label:"الأهداف"},
    {id:"tasks", icon:"✅", label:"المهام", badge:ovCount||null},
    {id:"pomodoro",icon:"🍅",label:"بومودورو"},
    {id:"stats", icon:"📊", label:"الإحصائيات"},
    {id:"ai",    icon:"🤖", label:"المساعد الذكي"},
  ];
  const TITLES={week:`الأسبوع ${wn}`,goals:"الأهداف",tasks:"المهام",pomodoro:"بومودورو",stats:"الإحصائيات",ai:"المساعد الذكي"};

  const LS=()=>(<div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"var(--bg)",flexDirection:"column",gap:14}}><style>{S}</style><div style={{fontSize:46}}>⚡</div><div className="sp" style={{width:20,height:20}}/><div style={{color:"var(--t3)",fontSize:12,fontFamily:"IBM Plex Sans Arabic"}}>جاري التحميل...</div></div>);

  if(authLoading)return <LS/>;
  if(!user)return <AuthPage onAuth={setUser}/>;
  if(!dataLoaded)return <LS/>;

  return(<>
    <style>{S}</style>
    <div className="shell">
      <div className={`mob-ov ${sidebarOpen?"show":""}`} onClick={()=>setSidebarOpen(false)}/>
      <nav className={`sidebar ${sidebarOpen?"open":""}`}>
        <div className="logo">
          <div className="logo-i">⚡</div>
          <div><div className="logo-n">إنجاز</div><div className="logo-s">نظام أسبوعي</div></div>
        </div>
        <div className="nav">
          {/* Week navigator */}
          <div className="wbox">
            <div style={{fontSize:11,color:"var(--a2)",fontWeight:700,marginBottom:3}}>الأسبوع {wn} {weekOffset===0?"📍":weekOffset<0?"↩️":"↪️"}</div>
            <div style={{fontSize:10,color:"var(--t3)",marginBottom:9}}>{fmtDate(ws)} — {fmtDate(we)}</div>
            <div style={{display:"flex",gap:4}}>
              <div onClick={()=>setWeekOffset(p=>p-1)} style={{flex:1,padding:"5px",borderRadius:6,background:"var(--bg4)",border:"1px solid var(--brd)",cursor:"pointer",fontSize:14,textAlign:"center",color:"var(--t2)"}}>‹</div>
              {weekOffset!==0&&<div onClick={()=>setWeekOffset(0)} style={{flex:1,padding:"5px",borderRadius:6,background:"var(--a)",border:"1px solid var(--a)",cursor:"pointer",fontSize:10,textAlign:"center",color:"white",fontWeight:700}}>اليوم</div>}
              <div onClick={()=>setWeekOffset(p=>p+1)} style={{flex:1,padding:"5px",borderRadius:6,background:"var(--bg4)",border:"1px solid var(--brd)",cursor:"pointer",fontSize:14,textAlign:"center",color:"var(--t2)"}}>›</div>
            </div>
          </div>
          {NAV.map(n=>(
            <div key={n.id} className={`ni ${page===n.id?"active":""}`} onClick={()=>{setPage(n.id);setSidebarOpen(false);}}>
              <span className="ni-ic">{n.icon}</span>{n.label}
              {n.badge?<span className="ni-b">{n.badge}</span>:null}
            </div>
          ))}
        </div>
        <div className="sb-bot">
          <div className="upill" onClick={logout} title="تسجيل خروج">
            <div className="uav">{user.email?.[0]?.toUpperCase()||"م"}</div>
            <div style={{overflow:"hidden"}}>
              <div style={{fontSize:10,color:"var(--t2)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.email}</div>
              <div style={{fontSize:9,color:"var(--r)"}}>🚪 تسجيل خروج</div>
            </div>
          </div>
        </div>
      </nav>
      <div className="main">
        <div className="topbar">
          <div>
            <div style={{fontSize:15,fontWeight:700,fontFamily:"Tajawal"}}>{TITLES[page]}</div>
            <div style={{fontSize:10,color:"var(--t3)"}}>{today.toLocaleDateString("ar-EG",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</div>
          </div>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            <div className="ib menu-btn" onClick={()=>setSidebarOpen(!sidebarOpen)}>☰</div>
            {dbLoading&&<div className="sp" style={{width:15,height:15}}/>}
            {todayCount>0&&<div style={{fontSize:11,padding:"3px 9px",borderRadius:20,background:"rgba(124,110,240,.15)",color:"var(--a2)",fontWeight:700}}>📋{todayCount} اليوم</div>}
            <div className="ib" onClick={()=>addNotif({type:"info",icon:"🔔",title:"لا إشعارات جديدة"})}>🔔</div>
          </div>
        </div>
        {page==="week"     &&<ThisWeekPage tasks={tasks} setTasks={setTasks} goals={goals} setGoals={setGoals} addNotif={addNotif} weekOffset={weekOffset}/>}
        {page==="goals"    &&<GoalsPage goals={goals} setGoals={setGoals} tasks={tasks} addNotif={addNotif} weekOffset={weekOffset}/>}
        {page==="tasks"    &&<TasksPage tasks={tasks} setTasks={setTasks} goals={goals} setGoals={setGoals} addNotif={addNotif}/>}
        {page==="pomodoro" &&<PomodoroPage onSession={onPomoSession} addNotif={addNotif} goals={goals}/>}
        {page==="stats"    &&<StatsPage tasks={tasks} goals={goals}/>}
        {page==="ai"       &&<AIPage tasks={tasks} goals={goals}/>}
      </div>
    </div>
    <Notifs notifs={notifs}/>
  </>);
}
