"use strict";

const API_URL = "https://script.google.com/macros/s/AKfycbwDPuv7-9Vv_fYArKtMcdZ9WOvJzT3eDJKHF6SjzyEKzzP2z4c83hnz4NdpA_6dO5_Hbw/exec";

const state = {
  currentMonth: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  selectedDate: dateKey(new Date()),
  appointments: []
};

const el = {
  monthLabel: document.getElementById("monthLabel"),
  calendarGrid: document.getElementById("calendarGrid"),
  previousMonth: document.getElementById("previousMonth"),
  nextMonth: document.getElementById("nextMonth"),
  todayButton: document.getElementById("todayButton"),
  form: document.getElementById("appointmentForm"),
  user: document.getElementById("appointmentUser"),
  date: document.getElementById("appointmentDate"),
  time: document.getElementById("appointmentTime"),
  details: document.getElementById("appointmentDetails"),
  saveButton: document.getElementById("saveAppointmentButton"),
  formMessage: document.getElementById("formMessage"),
  selectedDateBadge: document.getElementById("selectedDateBadge"),
  list: document.getElementById("appointmentList"),
  count: document.getElementById("appointmentCount"),
  status: document.getElementById("connectionStatus")
};

document.addEventListener("DOMContentLoaded", init);

async function init(){
  el.date.value = state.selectedDate;
  el.previousMonth.onclick = ()=>changeMonth(-1);
  el.nextMonth.onclick = ()=>changeMonth(1);
  el.todayButton.onclick = ()=>selectDate(dateKey(new Date()));
  el.date.onchange = ()=>selectDate(el.date.value,false);
  el.form.onsubmit = saveAppointment;
  renderAll();
  await loadAppointments();
}

function changeMonth(amount){
  state.currentMonth = new Date(state.currentMonth.getFullYear(), state.currentMonth.getMonth()+amount, 1);
  renderCalendar();
}

function renderAll(){renderCalendar();renderList();updateSelectedDate();}

function renderCalendar(){
  const y = state.currentMonth.getFullYear();
  const m = state.currentMonth.getMonth();
  el.monthLabel.textContent = new Intl.DateTimeFormat("th-TH",{month:"long",year:"numeric"}).format(state.currentMonth);
  el.calendarGrid.innerHTML="";
  const first = new Date(y,m,1);
  const start = new Date(y,m,1-first.getDay());

  for(let i=0;i<42;i++){
    const d=new Date(start); d.setDate(start.getDate()+i);
    const key=dateKey(d);
    const items=appointmentsFor(key);
    const btn=document.createElement("button");
    btn.type="button"; btn.className="calendar-day";
    if(d.getMonth()!==m) btn.classList.add("outside");
    if(key===dateKey(new Date())) btn.classList.add("today");
    if(key===state.selectedDate) btn.classList.add("selected");
    const num=document.createElement("span");
    num.className="day-number"; num.textContent=d.getDate();
    const events=document.createElement("div"); events.className="day-events";
    items.slice(0,2).forEach(item=>{
      const event=document.createElement("div");
      event.className="day-event";
      event.textContent=`${item.time} ${item.details}`;
      events.appendChild(event);
    });
    btn.append(num,events);
    btn.onclick=()=>selectDate(key);
    el.calendarGrid.appendChild(btn);
  }
}

function renderList(){
  const items=appointmentsFor(state.selectedDate);
  el.list.innerHTML="";
  el.count.textContent=`${items.length} รายการ`;
  if(!items.length){
    const empty=document.createElement("div");
    empty.className="empty-state";
    empty.textContent="ยังไม่มีนัดหมายในวันนี้";
    el.list.appendChild(empty);
    return;
  }
  items.forEach(item=>{
    const card=document.createElement("article");
    card.className="appointment-item";
    card.innerHTML=`
      <div class="appointment-time">${escapeHtml(item.time)}</div>
      <div class="appointment-content">
        <h3>${escapeHtml(item.details)}</h3>
        <p>ผู้บันทึก: ${escapeHtml(item.user)}</p>
        <p>${escapeHtml(formatThaiDate(item.date))}</p>
      </div>
      <button class="delete-button" type="button">ลบ</button>`;
    card.querySelector(".delete-button").onclick=()=>deleteAppointment(item.id);
    el.list.appendChild(card);
  });
}

function selectDate(key,moveMonth=true){
  state.selectedDate=key;
  if(moveMonth){
    const d=parseDateKey(key);
    state.currentMonth=new Date(d.getFullYear(),d.getMonth(),1);
  }
  renderAll();
}

function updateSelectedDate(){
  el.date.value=state.selectedDate;
  el.selectedDateBadge.textContent=formatThaiDate(state.selectedDate);
}

async function loadAppointments(){
  if(!apiReady()){
    setStatus(false,"กรุณาใส่ Web App URL ใน script.js");
    showMessage("ยังไม่ได้ตั้งค่า Google Apps Script Web App URL","error");
    return;
  }
  try{
    const res=await fetch(`${API_URL}?action=listAppointments&t=${Date.now()}`);
    const result=await res.json();
    if(!result.success) throw new Error(result.message||"โหลดข้อมูลไม่สำเร็จ");
    state.appointments=Array.isArray(result.data)?result.data:[];
    setStatus(true,"เชื่อมต่อ Google Sheets แล้ว");
    renderAll();
  }catch(err){
    setStatus(false,"เชื่อมต่อไม่สำเร็จ");
    showMessage(err.message||"โหลดข้อมูลไม่สำเร็จ","error");
  }
}

async function saveAppointment(event){
  event.preventDefault();
  const payload={action:"createAppointment",user:el.user.value.trim(),date:el.date.value,time:el.time.value,details:el.details.value.trim()};
  if(!payload.user||!payload.date||!payload.time||!payload.details){
    showMessage("กรุณากรอกข้อมูลให้ครบ","error");return;
  }
  if(state.appointments.some(x=>x.date===payload.date&&x.time===payload.time)){
    showMessage("วันและเวลานี้มีนัดหมายอยู่แล้ว","error");return;
  }
  el.saveButton.disabled=true; el.saveButton.textContent="กำลังบันทึก...";
  try{
    const result=await postApi(payload);
    if(!result.success) throw new Error(result.message||"บันทึกไม่สำเร็จ");
    showMessage(result.message||"บันทึกเรียบร้อย","success");
    el.details.value=""; el.time.value="";
    state.selectedDate=payload.date;
    await loadAppointments();
  }catch(err){showMessage(err.message||"บันทึกไม่สำเร็จ","error")}
  finally{el.saveButton.disabled=false;el.saveButton.textContent="บันทึกนัดหมาย"}
}

async function deleteAppointment(id){
  if(!confirm("ต้องการลบนัดหมายนี้ใช่หรือไม่?")) return;
  try{
    const result=await postApi({action:"deleteAppointment",appointmentId:id});
    if(!result.success) throw new Error(result.message||"ลบไม่สำเร็จ");
    showMessage(result.message||"ลบเรียบร้อย","success");
    await loadAppointments();
  }catch(err){showMessage(err.message||"ลบไม่สำเร็จ","error")}
}

async function postApi(payload){
  if(!apiReady()) throw new Error("กรุณาใส่ Web App URL ใน script.js");
  const res=await fetch(API_URL,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(payload)});
  return res.json();
}

function appointmentsFor(key){
  return state.appointments.filter(x=>x.date===key&&x.status!=="deleted").sort((a,b)=>String(a.time).localeCompare(String(b.time)));
}
function setStatus(ok,text){el.status.className=`status ${ok?"online":"offline"}`;el.status.querySelector("span:last-child").textContent=text}
function showMessage(text,type=""){el.formMessage.textContent=text;el.formMessage.className=`form-message ${type}`}
function apiReady(){return API_URL.startsWith("https://script.google.com/macros/s/")&&API_URL.endsWith("/exec")}
function dateKey(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`}
function parseDateKey(key){const [y,m,d]=key.split("-").map(Number);return new Date(y,m-1,d)}
function formatThaiDate(key){return new Intl.DateTimeFormat("th-TH",{day:"numeric",month:"short",year:"numeric"}).format(parseDateKey(key))}
function escapeHtml(value){return String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[ch]))}
