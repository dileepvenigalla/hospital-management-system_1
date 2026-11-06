const USERS = {
  admin: {pass:'admin123', name:'Vikram Malhotra', role:'System Administrator'},
  drsharma: {pass:'doctor123', name:'Dr. Ananya Sharma', role:'Sr. Consultant (Cardiology)'},
  frontdesk: {pass:'desk123', name:'Rajesh Verma', role:'Front Desk Officer'}
};

function load(key, defaultVal){
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : defaultVal;
  } catch(e) { return defaultVal; }
}

function save(key, val){
  try { localStorage.setItem(key, JSON.stringify(val)); } catch(e) {}
}

// Seed Indian patient directory
let patients = load('aarogya_patients', null);
if(!patients){
  patients = [
    {id:1, name:'Aarav Patel', age:42, condition:'Hypertensive Emergency', ward:'Cardio Ward — C12', status:'Admitted'},
    {id:2, name:'Sunita Sundaram', age:61, condition:'Post Total Knee Arthroplasty', ward:'Ortho Recovery — 305', status:'Admitted'},
    {id:3, name:'Rohan Sengupta', age:29, condition:'Viral Gastroenteritis', ward:'Daycare OPD — Bed 4', status:'Discharged'},
    {id:4, name:'Ishaan Kulkarni', age:9, condition:'Bronchial Asthma Flare', ward:'Pediatric ICU — 03', status:'Admitted'}
  ];
  save('aarogya_patients', patients);
}

// Seed Indian doctors
let doctors = load('aarogya_doctors', null);
if(!doctors){
  doctors = [
    {id:1, name:'Dr. Ananya Sharma', specialty:'Cardiology', avail:'Available'},
    {id:2, name:'Dr. Arjun Venkatraman', specialty:'Orthopedics & Joint Care', avail:'In Surgery'},
    {id:3, name:'Dr. Meera Nambiar', specialty:'Pediatrics & Neonatology', avail:'Available'},
    {id:4, name:'Dr. Devang Joshi', specialty:'Neurology', avail:'On Call'}
  ];
  save('aarogya_doctors', doctors);
}

// Seed consultations
let appts = load('aarogya_appointments', null);
const todayStr = new Date().toISOString().slice(0,10);
if(!appts){
  appts = [
    {id:1, date:todayStr, time:'09:30', patient:'Aarav Patel', doctor:'Dr. Ananya Sharma', status:'Completed'},
    {id:2, date:todayStr, time:'11:15', patient:'Sunita Sundaram', doctor:'Dr. Arjun Venkatraman', status:'In Progress'},
    {id:3, date:todayStr, time:'14:00', patient:'Ishaan Kulkarni', doctor:'Dr. Meera Nambiar', status:'Scheduled'},
    {id:4, date:todayStr, time:'16:30', patient:'Rohan Sengupta', doctor:'Dr. Devang Joshi', status:'Scheduled'}
  ];
  save('aarogya_appointments', appts);
}

let session = null;

function fillLogin(u,p){
  document.getElementById('luser').value = u;
  document.getElementById('lpass').value = p;
}

document.getElementById('loginForm').addEventListener('submit', function(e){
  e.preventDefault();
  const u = document.getElementById('luser').value.trim().toLowerCase();
  const p = document.getElementById('lpass').value;
  const rec = USERS[u];
  const err = document.getElementById('lerr');
  if(rec && rec.pass === p){
    session = {user:u, ...rec};
    err.textContent = '';
    document.getElementById('login').style.display = 'none';
    document.getElementById('app').classList.add('on');
    document.getElementById('whoName').textContent = rec.name;
    document.getElementById('whoRole').textContent = rec.role;
    renderAll();
  } else {
    err.textContent = 'Invalid credentials. Please verify ID and security key.';
  }
});

function logout(){
  session = null;
  document.getElementById('app').classList.remove('on');
  document.getElementById('login').style.display = 'flex';
  document.getElementById('loginForm').reset();
}

function showView(v){
  ['dash','patients','doctors','appts'].forEach(x => {
    document.getElementById('view-'+x).style.display = (x === v) ? '' : 'none';
    document.querySelector(`.navitem[data-v="${x}"]`).classList.toggle('active', x === v);
  });
}

function statusTag(s){
  let cls = 'neutral';
  if(s==='Admitted' || s==='Available' || s==='Completed') cls = 'success';
  if(s==='In Surgery' || s==='In Progress' || s==='On Call') cls = 'warning';
  if(s==='Cancelled' || s==='Off Duty') cls = 'danger';
  return `<span class="badge ${cls}">${s}</span>`;
}

function renderAll(){
  document.getElementById('dateline').textContent = new Date().toLocaleDateString('en-IN', {
    weekday:'long', year:'numeric', month:'long', day:'numeric'
  });

  const statsEl = document.getElementById('stats');
  const admitted = patients.filter(p => p.status === 'Admitted').length;
  const todays = appts.filter(a => a.date === todayStr).length;

  statsEl.innerHTML = `
    <div class="stat-card highlight">
      <div class="val">${patients.length}</div>
      <div class="lbl">Registered Patients</div>
    </div>
    <div class="stat-card">
      <div class="val">${admitted}</div>
      <div class="lbl">Currently Admitted</div>
    </div>
    <div class="stat-card">
      <div class="val">${doctors.length}</div>
      <div class="lbl">Active Faculty & Staff</div>
    </div>
    <div class="stat-card">
      <div class="val">${todays}</div>
      <div class="lbl">Today's Consultations</div>
    </div>
  `;

  // Render Dashboard Schedule
  const todayBody = document.getElementById('todayBody');
  const todaysA = appts.filter(a => a.date === todayStr).sort((a,b) => a.time.localeCompare(b.time));
  todayBody.innerHTML = todaysA.length ? todaysA.map(a => `
    <tr>
      <td><b>${a.time}</b></td>
      <td>${a.patient}</td>
      <td>${a.doctor}</td>
      <td>${statusTag(a.status)}</td>
    </tr>
  `).join('') : '<tr><td colspan="4" class="empty-state">No appointments booked for today.</td></tr>';

  // Render Patients
  document.getElementById('patCount').textContent = `${patients.length} Registered Patients`;
  document.getElementById('patBody').innerHTML = patients.length ? patients.map(p => `
    <tr>
      <td><b>${p.name}</b></td>
      <td>${p.age} yrs</td>
      <td>${p.condition}</td>
      <td>${p.ward}</td>
      <td>${statusTag(p.status)}</td>
      <td><button class="action-btn del" onclick="removeItem('patients', ${p.id})">Discharge / Remove</button></td>
    </tr>
  `).join('') : '<tr><td colspan="6" class="empty-state">No patient records available.</td></tr>';

  // Render Doctors
  document.getElementById('docCount').textContent = `${doctors.length} Doctors Registered`;
  document.getElementById('docBody').innerHTML = doctors.length ? doctors.map(d => `
    <tr>
      <td><b>${d.name}</b></td>
      <td>${d.specialty}</td>
      <td>${statusTag(d.avail)}</td>
      <td><button class="action-btn del" onclick="removeItem('doctors', ${d.id})">Remove</button></td>
    </tr>
  `).join('') : '<tr><td colspan="4" class="empty-state">No doctors in directory.</td></tr>';

  // Render Appointments
  document.getElementById('apCount').textContent = `${appts.length} Scheduled Sessions`;
  document.getElementById('apBody').innerHTML = appts.length ? appts.slice().sort((a,b) => (a.date+a.time).localeCompare(b.date+b.time)).map(a => `
    <tr>
      <td>${a.date}</td>
      <td><b>${a.time}</b></td>
      <td>${a.patient}</td>
      <td>${a.doctor}</td>
      <td>${statusTag(a.status)}</td>
      <td>
        <button class="action-btn" onclick="cycleAppt(${a.id})">Status Step</button>
        <button class="action-btn del" onclick="removeItem('appts', ${a.id})">Cancel</button>
      </td>
    </tr>
  `).join('') : '<tr><td colspan="6" class="empty-state">No scheduled consultations.</td></tr>';
}

function removeItem(type, id){
  if(type === 'patients'){ patients = patients.filter(x => x.id !== id); save('aarogya_patients', patients); }
  if(type === 'doctors'){ doctors = doctors.filter(x => x.id !== id); save('aarogya_doctors', doctors); }
  if(type === 'appts'){ appts = appts.filter(x => x.id !== id); save('aarogya_appointments', appts); }
  renderAll();
}

function cycleAppt(id){
  const order = ['Scheduled', 'In Progress', 'Completed', 'Cancelled'];
  const a = appts.find(x => x.id === id);
  if(a){
    a.status = order[(order.indexOf(a.status) + 1) % order.length];
    save('aarogya_appointments', appts);
    renderAll();
  }
}

function nextId(arr){
  return arr.length ? Math.max(...arr.map(x => x.id)) + 1 : 1;
}

function openModal(type){
  const ov = document.getElementById('overlay');
  const mb = document.getElementById('modalBody');
  let html = '';

  if(type === 'patient'){
    html = `
      <h3>Admit New Patient</h3>
      ${field('pName','Full Name (e.g. Meenakshi Sundaram)','text')}
      ${field('pAge','Age','number')}
      ${field('pCond','Clinical Diagnosis / Symptoms','text')}
      ${field('pWard','Assigned Ward / Room','text')}
      <div class="field">
        <label>Admission Status</label>
        <select class="input-box" id="pStatus">
          <option>Admitted</option>
          <option>Discharged</option>
        </select>
      </div>
      ${actions("submitPatient()")}`;
  } else if(type === 'doctor'){
    html = `
      <h3>Register Doctor</h3>
      ${field('dName','Doctor Name (e.g. Dr. Rajesh Kulkarni)','text')}
      ${field('dSpec','Department / Specialty (e.g. Oncology)','text')}
      <div class="field">
        <label>Current Shift Status</label>
        <select class="input-box" id="dAvail">
          <option>Available</option>
          <option>In Surgery</option>
          <option>On Call</option>
          <option>Off Duty</option>
        </select>
      </div>
      ${actions("submitDoctor()")}`;
  } else {
    const patOpts = patients.map(p => `<option>${p.name}</option>`).join('');
    const docOpts = doctors.map(d => `<option>${d.name}</option>`).join('');
    html = `
      <h3>Schedule Clinical Consultation</h3>
      ${field('aDate','Consultation Date','date')}
      ${field('aTime','Time Slot','time')}
      <div class="field">
        <label>Select Patient</label>
        <select class="input-box" id="aPatient">${patOpts}</select>
      </div>
      <div class="field">
        <label>Assign Doctor</label>
        <select class="input-box" id="aDoctor">${docOpts}</select>
      </div>
      ${actions("submitAppt()")}`;
  }

  mb.innerHTML = html;
  ov.classList.add('on');
}

function field(id, label, type){
  return `<div class="field"><label>${label}</label><input class="input-box" id="${id}" type="${type}"></div>`;
}

function actions(fn){
  return `
    <div class="modal-actions">
      <button class="btn-secondary" type="button" onclick="closeModal()">Discard</button>
      <button class="btn-primary" type="button" onclick="${fn}">Confirm & Save</button>
    </div>`;
}

function closeModal(){
  document.getElementById('overlay').classList.remove('on');
}

function submitPatient(){
  const name = document.getElementById('pName').value.trim();
  if(!name) return;
  patients.push({
    id: nextId(patients),
    name,
    age: document.getElementById('pAge').value || '—',
    condition: document.getElementById('pCond').value || 'General Evaluation',
    ward: document.getElementById('pWard').value || 'General Ward',
    status: document.getElementById('pStatus').value
  });
  save('aarogya_patients', patients);
  closeModal();
  renderAll();
}

function submitDoctor(){
  const name = document.getElementById('dName').value.trim();
  if(!name) return;
  doctors.push({
    id: nextId(doctors),
    name,
    specialty: document.getElementById('dSpec').value || 'General Medicine',
    avail: document.getElementById('dAvail').value
  });
  save('aarogya_doctors', doctors);
  closeModal();
  renderAll();
}

function submitAppt(){
  const date = document.getElementById('aDate').value || todayStr;
  const time = document.getElementById('aTime').value || '10:00';
  appts.push({
    id: nextId(appts),
    date,
    time,
    patient: document.getElementById('aPatient').value,
    doctor: document.getElementById('aDoctor').value,
    status: 'Scheduled'
  });
  save('aarogya_appointments', appts);
  closeModal();
  renderAll();
}