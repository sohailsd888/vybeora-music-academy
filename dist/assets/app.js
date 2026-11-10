/* VYBEORA interactive front-end demonstration. No real authentication or payments. */
(()=>{'use strict';
// Some preview environments deny storage; keep the entire interface interactive anyway.
const storageFallback=()=>{const values={};return {getItem:key=>Object.hasOwn(values,key)?values[key]:null,setItem:(key,val)=>{values[key]=String(val)},removeItem:key=>{delete values[key]}}};
const localStorage=(()=>{try{const s=window.localStorage;const key='__vybeora_storage_test';s.setItem(key,'1');s.removeItem(key);return s}catch{return storageFallback()}})();
const sessionStorage=(()=>{try{const s=window.sessionStorage;const key='__vybeora_session_test';s.setItem(key,'1');s.removeItem(key);return s}catch{return storageFallback()}})();
const $=(selector,root=document)=>root.querySelector(selector);
const $$=(selector,root=document)=>[...root.querySelectorAll(selector)];
const safeJSON=(key,fallback)=>{try{let item=JSON.parse(localStorage.getItem(key));return Array.isArray(item)?item:fallback}catch{return fallback}};
const data={Guitar:{when:'Monday & Wednesday · 5:00 PM',days:'Mon & Wed',fee:1800,label:'Guitar Essentials',icon:'♬'},Keyboard:{when:'Tuesday & Thursday · 6:00 PM',days:'Tue & Thu',fee:2000,label:'Keyboard Essentials',icon:'▥'},Vocals:{when:'Wednesday & Friday · 4:30 PM',days:'Wed & Fri',fee:1600,label:'Vocal Essentials',icon:'♪'},Drums:{when:'Saturday & Sunday · 10:00 AM',days:'Sat & Sun',fee:2200,label:'Drum Essentials',icon:'◉'}};
const demoKeys=['vybeora-batches','vybeora-paid','vybeora-profile','vybeora-newsletter','vybeora-alert-read','vybeora-theme','vybeora-rtl'];
let activeToastTimer=null;
function toast(message){let e=$('#toast');if(!e)return;clearTimeout(activeToastTimer);e.textContent=message;e.classList.add('show');activeToastTimer=setTimeout(()=>e.classList.remove('show'),3500)}
const body=document.body;
const theme=localStorage.getItem('vybeora-theme')||'light';if(theme==='dark')body.classList.add('dark');
if(localStorage.getItem('vybeora-rtl')==='true')body.setAttribute('dir','rtl');
function syncTheme(){const t=$('#themeToggle');if(t){t.textContent=body.classList.contains('dark')?'☀':'☾';t.title='Toggle light and dark theme'}}
syncTheme();
$('#themeToggle')?.addEventListener('click',()=>{body.classList.toggle('dark');localStorage.setItem('vybeora-theme',body.classList.contains('dark')?'dark':'light');syncTheme()});
$('#rtlToggle')?.addEventListener('click',()=>{let rtl=body.getAttribute('dir')!=='rtl';body.setAttribute('dir',rtl?'rtl':'ltr');localStorage.setItem('vybeora-rtl',String(rtl))});
$('#menuToggle')?.addEventListener('click',()=>{const n=$('.nav');if(n){n.classList.toggle('open');$('#menuToggle').setAttribute('aria-expanded',String(n.classList.contains('open')))}});
const dropdown=$('.dropdown');
$('.nav-home')?.addEventListener('click',e=>{if(window.matchMedia('(max-width: 1020px)').matches){e.preventDefault();dropdown?.classList.toggle('dropdown-open')}});
// Entrance animations in four varied directions, keeping content visible without IO.
if('IntersectionObserver' in window&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}}),{threshold:.07,rootMargin:'0px 0px 75px 0px'});
$$('.reveal').forEach((node,i)=>{if(!node.classList.contains('feature-card')&&node.classList.contains('section'))node.classList.add(['slide-left','slide-right','zoom-in'][i%3]);observer.observe(node)});
}else{$$('.reveal').forEach(node=>node.classList.add('visible'))}
$$('.feature-card,.step,.enrol-card').forEach(card=>{
 card.addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;const r=card.getBoundingClientRect();let x=((e.clientX-r.left)/r.width*100).toFixed(0),y=((e.clientY-r.top)/r.height*100).toFixed(0);card.style.setProperty('--mx',x+'%');card.style.setProperty('--my',y+'%')});
});
$('#newsletter')?.addEventListener('submit',e=>{e.preventDefault();let email=$('#newsEmail')?.value.trim();if(email)localStorage.setItem('vybeora-newsletter',email);toast('Saved on this device (demo). No email was sent.');e.target.reset()});
$('#contactForm')?.addEventListener('submit',e=>{e.preventDefault();toast('Form preview complete. Connect an academy backend to send enquiries.');e.target.reset()});
function togglePassword(button,input){if(!button||!input)return;const shown=input.type==='password';input.type=shown?'text':'password';button.textContent=shown?'⊘':'◉';button.setAttribute('aria-label',shown?'Hide password':'Show password')}
$('#showPassword')?.addEventListener('click',()=>togglePassword($('#showPassword'),$('#password')));
$$('[data-password]').forEach(button=>button.addEventListener('click',()=>togglePassword(button,document.getElementById(button.dataset.password))));
$('#forgotPassword')?.addEventListener('click',e=>{e.preventDefault();toast('Password recovery needs a live authentication service. This is a demo.')});
$$('[data-provider]').forEach(button=>button.addEventListener('click',()=>toast(button.dataset.provider+' sign-in is not connected in this front-end preview.')));
$('#signupForm')?.addEventListener('submit',e=>{e.preventDefault();let name=$('#fullName').value.trim(),email=$('#signupEmail').value.trim();if(name.length<2)return toast('Please enter your name.');localStorage.setItem('vybeora-profile',JSON.stringify({name,email}));sessionStorage.setItem('vybeora-session','preview');location.href='dashboard.html'});
$('#loginForm')?.addEventListener('submit',e=>{e.preventDefault();let email=$('#email').value.trim();let current={};try{current=JSON.parse(localStorage.getItem('vybeora-profile')||'{}')}catch{};if(!current.name)current={name:'Ari Mehta',email};else current.email=email;localStorage.setItem('vybeora-profile',JSON.stringify(current));sessionStorage.setItem('vybeora-session','preview');location.href='dashboard.html'});
$('#clearDemo')?.addEventListener('click',()=>{demoKeys.forEach(key=>localStorage.removeItem(key));sessionStorage.removeItem('vybeora-session');body.classList.remove('dark');body.dir='ltr';syncTheme();toast('Local demonstration data has been cleared.')});
// Music academy student dashboard with switchable panels and sample enrolments.
let enrolled=safeJSON('vybeora-batches',[]).filter(course=>Object.hasOwn(data,course));
let profile={name:'Ari Mehta',email:'student@example.test'};try{profile={...profile,...JSON.parse(localStorage.getItem('vybeora-profile')||'{}')}}catch{}
const first=(profile.name||'Ari').trim().split(/\s+/)[0];
if($('#studentFirst'))$('#studentFirst').textContent=first;
if($('#studentFull'))$('#studentFull').textContent=profile.name;
if($('#profileMenuName'))$('#profileMenuName').textContent=profile.name;
const initials=(profile.name||'Ari Mehta').trim().split(/\s+/).slice(0,2).map(word=>word[0]).join('').toUpperCase();
$$('.avatar').forEach(el=>el.textContent=initials);
if($('#dashToday'))$('#dashToday').textContent=new Intl.DateTimeFormat('en-IN',{weekday:'long',day:'numeric',month:'long'}).format(new Date()).toUpperCase()+' · SAMPLE STUDIO DAY';
const feeTotal=()=>enrolled.reduce((total,key)=>total+data[key].fee,0);
const formatInr=(n)=>'₹'+n.toLocaleString('en-IN');
const courseMarkup=(course)=>`<div class="course-pill"><span>${data[course].icon}</span><div>${data[course].label}<small style="display:block;font-weight:400;color:var(--muted)">${data[course].days}</small></div></div>`;
const scheduleMarkup=(course)=>`<div class="schedule-item"><div><strong>${data[course].label}</strong><span>Studio A · Instructor-led · Sample booking</span></div><span>${data[course].when}</span></div>`;
function dashboard(){
 if(!$('.dashboard-page'))return;
 const total=feeTotal(),paid=localStorage.getItem('vybeora-paid')==='yes';
 if($('#enrolCount'))$('#enrolCount').textContent=enrolled.length;
 if($('#totalFee'))$('#totalFee').textContent=formatInr(total);
 if($('#feeMetricStatus'))$('#feeMetricStatus').textContent=enrolled.length?(paid?'Paid · demonstration only':'Unpaid · demonstration only'):'No batch selected';
 if($('#nextClass'))$('#nextClass').textContent=enrolled.length?data[enrolled[0]].days:'—';
 if($('#nextClassSub'))$('#nextClassSub').textContent=enrolled.length?data[enrolled[0]].label:'Enrol to see a class';
 if($('#myCoursesOverview'))$('#myCoursesOverview').innerHTML=enrolled.length?enrolled.map(courseMarkup).join(''):'<div class="portal-empty">No classes yet. Choose your first batch to begin.</div>';
 if($('#myCoursesPanel'))$('#myCoursesPanel').innerHTML=enrolled.length?enrolled.map(courseMarkup).join(''):'<div class="portal-empty">You have not chosen a course yet. Pick a batch that excites you!</div>';
 if($('#mySchedule'))$('#mySchedule').innerHTML=enrolled.length?enrolled.map(scheduleMarkup).join(''):'<div class="portal-empty">Your timetable will appear after you enrol in a batch.</div>';
 if($('#upcomingList'))$('#upcomingList').innerHTML=enrolled.length?enrolled.map(scheduleMarkup).join(''):'<div class="portal-empty">Enrol in a batch to see upcoming lessons.</div>';
 if($('#feesPanel'))$('#feesPanel').innerHTML=enrolled.length?`<p><strong style="font-size:38px;color:var(--portal-text)">${formatInr(total)}</strong> <span style="font-size:14px">per sample month</span></p><p>Status: <strong>${paid?'Paid (demo)':'Unpaid (demo)'}</strong></p><div style="font-size:13px;color:var(--muted)">${enrolled.map(k=>`${data[k].label} · ${formatInr(data[k].fee)}`).join('<br>')}</div>`:'<p>No batches selected. Enrol to see an example monthly fee.</p>';
 if($('#quickFee'))$('#quickFee').textContent=formatInr(total);
 if($('#quickFeeStatus'))$('#quickFeeStatus').textContent=enrolled.length?(paid?'Paid · demo':'Unpaid · demo'):'No enrolments yet';
 $$('.enroll').forEach(button=>{let has=enrolled.includes(button.dataset.course);button.disabled=has;button.textContent=has?'Enrolled ✓':'Enrol in '+button.dataset.course+' ↗'});
 const read=localStorage.getItem('vybeora-alert-read')==='yes';if($('#alertBadge'))$('#alertBadge').hidden=read;
}
$$('.enroll').forEach(button=>button.addEventListener('click',()=>{const course=button.dataset.course;if(!Object.hasOwn(data,course))return;if(enrolled.includes(course))return;enrolled.push(course);localStorage.setItem('vybeora-batches',JSON.stringify(enrolled));localStorage.removeItem('vybeora-paid');dashboard();toast('Added '+course+' to your demo batches.')}));
function selectTab(tab,updateHistory=true){const t=$(`[data-view="${tab}"]`);if(!t)return;$$('.portal-view').forEach(e=>e.classList.toggle('active',e===t));$$('.portal-link').forEach(e=>e.classList.toggle('active',e.dataset.tab===tab));const label=$(`.portal-link[data-tab="${tab}"]`)?.textContent.trim()||'Overview';if($('#tabBreadcrumb'))$('#tabBreadcrumb').textContent=label.replace(/^[^a-zA-Z]+/,'');if(updateHistory)history.replaceState(null,'','#'+tab);$('.portal-sidebar')?.classList.remove('open');window.scrollTo({top:0,behavior:'smooth'});}
$$('[data-tab]').forEach(btn=>btn.addEventListener('click',()=>selectTab(btn.dataset.tab)));
$$('[data-go]').forEach(btn=>btn.addEventListener('click',()=>selectTab(btn.dataset.go)));
if($('.dashboard-page')){const hash=location.hash.replace('#','');if($(`[data-view="${hash}"]`))selectTab(hash,false);dashboard()}
$('#demoPay')?.addEventListener('click',()=>{if(!enrolled.length)return toast('Choose at least one demo batch first.');localStorage.setItem('vybeora-paid','yes');dashboard();toast('Sample status updated. No payment was processed.')});
$('#downloadReceipt')?.addEventListener('click',()=>{if(!enrolled.length)return toast('Enrol in a sample batch before downloading a receipt.');const text=['VYBEORA MUSIC ACADEMY — SAMPLE RECEIPT','Not a real payment receipt','',...enrolled.map(k=>`${data[k].label}: ${formatInr(data[k].fee)}`),`TOTAL: ${formatInr(feeTotal())}`,`DEMO STATUS: ${localStorage.getItem('vybeora-paid')==='yes'?'Marked paid':'Not marked paid'}`].join('\n');let blob=new Blob([text],{type:'text/plain'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='vybeora-sample-receipt.txt';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),800)});
$('#markAlerts')?.addEventListener('click',()=>{localStorage.setItem('vybeora-alert-read','yes');dashboard();toast('Demo notifications marked as read.')});
$('#notificationToggle')?.addEventListener('click',()=>selectTab('overview'));
$('#sideToggle')?.addEventListener('click',()=>$('.portal-sidebar')?.classList.toggle('open'));
const menu=$('#profileMenu');const profButton=$('#profileToggle');profButton?.addEventListener('click',()=>{if(!menu)return;menu.hidden=!menu.hidden;profButton.setAttribute('aria-expanded',String(!menu.hidden))});
document.addEventListener('pointerdown',e=>{if(menu&&!menu.hidden&&!e.target.closest('.profile-wrap')){menu.hidden=true;profButton?.setAttribute('aria-expanded','false')}});
$('#signOut')?.addEventListener('click',()=>{sessionStorage.removeItem('vybeora-session');location.href='login.html'});
})();
