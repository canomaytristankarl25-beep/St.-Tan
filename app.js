/* ═══════════════════════════════════════════════════════
   TRISTAN'S DIGITAL SANCTUARY — app.js
   Vanilla JS · Firebase v10 · No frameworks
═══════════════════════════════════════════════════════ */

'use strict';

// ── STATE ──────────────────────────────────────────────
let isAdmin = false;
let galleryItems = [];
let currentModal = {};
let fb; // Firebase refs, set after module loads

// ── WAIT FOR FIREBASE MODULE ──────────────────────────
function waitForFb(cb) {
  if (window._fb) { fb = window._fb; cb(); }
  else setTimeout(() => waitForFb(cb), 80);
}

/* ════════════════════════════════════════════════════════
   UNIVERSE CANVAS — Stars, Aurora, Particles
════════════════════════════════════════════════════════ */
(function initCanvas() {
  const canvas = document.getElementById('universeCanvas');
  const ctx = canvas.getContext('2d');
  let W, H, stars = [], particles = [], auroraT = 0;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function mkStars() {
    stars = Array.from({length: 220}, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.6 + 0.2,
      a: Math.random(),
      speed: Math.random() * 0.4 + 0.1,
      twinkle: Math.random() * Math.PI * 2
    }));
  }

  function mkParticles() {
    particles = Array.from({length: 55}, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 2.5 + 0.8,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      a: Math.random() * 0.5 + 0.15,
      hue: Math.random() < 0.5 ? 195 : 285
    }));
  }

  function drawAurora(t) {
    const layers = [
      { color1:'rgba(0,212,255,0.04)', color2:'rgba(0,212,255,0)', yOff: H*0.18, amp: 80, freq: 0.003 },
      { color1:'rgba(170,60,255,0.05)', color2:'rgba(0,0,0,0)', yOff: H*0.30, amp: 60, freq: 0.004 },
      { color1:'rgba(0,255,179,0.03)', color2:'rgba(0,0,0,0)', yOff: H*0.12, amp: 100, freq: 0.002 }
    ];
    layers.forEach(l => {
      ctx.beginPath();
      ctx.moveTo(0, l.yOff);
      for (let x = 0; x <= W; x += 8) {
        const y = l.yOff + Math.sin(x * l.freq + t) * l.amp + Math.sin(x * l.freq * 2.3 + t * 1.4) * (l.amp * 0.4);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(W, 0); ctx.lineTo(0, 0); ctx.closePath();
      const grad = ctx.createLinearGradient(0, 0, 0, l.yOff + l.amp);
      grad.addColorStop(0, l.color1);
      grad.addColorStop(1, l.color2);
      ctx.fillStyle = grad;
      ctx.fill();
    });
  }

  function drawNebula(t) {
    [[W*0.15, H*0.4, 260, 'rgba(58,26,110,0.12)'],
     [W*0.8,  H*0.6, 200, 'rgba(0,100,180,0.09)'],
     [W*0.5,  H*0.2, 180, 'rgba(0,212,255,0.05)']].forEach(([cx,cy,r,c]) => {
      const g = ctx.createRadialGradient(cx,cy,0, cx,cy, r + Math.sin(t)*20);
      g.addColorStop(0, c); g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.ellipse(cx, cy, r*1.4, r*0.7, t*0.05, 0, Math.PI*2); ctx.fill();
    });
  }

  function draw(t) {
    ctx.clearRect(0, 0, W, H);

    // Background gradient
    const bg = ctx.createLinearGradient(0,0,W,H);
    bg.addColorStop(0, '#050818');
    bg.addColorStop(0.5, '#0a0f2e');
    bg.addColorStop(1, '#120828');
    ctx.fillStyle = bg; ctx.fillRect(0,0,W,H);

    auroraT = t * 0.0004;
    drawNebula(auroraT);
    drawAurora(auroraT);

    // Stars
    stars.forEach(s => {
      s.twinkle += 0.012;
      const alpha = s.a * (0.6 + 0.4 * Math.sin(s.twinkle));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(232,234,246,${alpha})`;
      ctx.fill();
      if (s.r > 1.1) {
        ctx.shadowBlur = 6; ctx.shadowColor = 'rgba(232,234,246,0.5)';
        ctx.fill(); ctx.shadowBlur = 0;
      }
    });

    // Particles
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fillStyle = `hsla(${p.hue},100%,70%,${p.a})`;
      ctx.shadowBlur = 8; ctx.shadowColor = `hsla(${p.hue},100%,70%,0.5)`;
      ctx.fill(); ctx.shadowBlur = 0;
    });

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => { resize(); mkStars(); mkParticles(); });
  resize(); mkStars(); mkParticles();
  requestAnimationFrame(draw);
})();

/* ════════════════════════════════════════════════════════
   RIPPLE EFFECT
════════════════════════════════════════════════════════ */
document.querySelectorAll('.btn-primary').forEach(btn => {
  btn.addEventListener('click', function(e) {
    const rc = this.querySelector('.ripple-container');
    if (!rc) return;
    const r = document.createElement('span');
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    r.style.cssText = `position:absolute;border-radius:50%;width:${size}px;height:${size}px;
      left:${e.clientX-rect.left-size/2}px;top:${e.clientY-rect.top-size/2}px;
      background:rgba(255,255,255,0.2);transform:scale(0);animation:rippleAnim 0.6s ease;pointer-events:none;`;
    rc.appendChild(r);
    setTimeout(() => r.remove(), 650);
  });
});

const rippleStyle = document.createElement('style');
rippleStyle.textContent = `@keyframes rippleAnim{to{transform:scale(4);opacity:0}}`;
document.head.appendChild(rippleStyle);

/* ════════════════════════════════════════════════════════
   TOAST
════════════════════════════════════════════════════════ */
function showToast(msg, color = 'var(--cosmic-cyan)') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.style.borderColor = color;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

/* ════════════════════════════════════════════════════════
   AUTH / LOGIN
════════════════════════════════════════════════════════ */

// Passwords → permission group mapping via Firestore
// In Firestore: collection 'config' / doc 'auth'
// { adminPass: "...", visitorPass: "..." }
// This avoids embedding any password in client code.

async function handleLogin() {
  const pw = document.getElementById('passwordInput').value.trim();
  const errEl = document.getElementById('loginError');
  errEl.textContent = '';
  if (!pw) { errEl.textContent = 'Please enter a passphrase.'; return; }

  const btn = document.getElementById('loginBtn');
  btn.querySelector('span').textContent = '…';
  btn.disabled = true;

  try {
    const { db, doc, getDoc } = fb;
    const snap = await getDoc(doc(db, 'config', 'auth'));
    if (!snap.exists()) { errEl.textContent = 'Sanctuary not configured yet.'; reset(); return; }
    const data = snap.data();

    if (pw === data.adminPass) {
      isAdmin = true;
      enterSite();
    } else if (pw === data.visitorPass) {
      isAdmin = false;
      enterSite();
    } else {
      errEl.textContent = 'Incorrect passphrase. Try again.';
    }
  } catch(e) {
    errEl.textContent = 'Connection error. Check Firebase config.';
    console.error(e);
  }

  function reset() { btn.querySelector('span').textContent = 'Enter'; btn.disabled = false; }
  reset();
}

document.getElementById('passwordInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') handleLogin();
});

function enterSite() {
  if (isAdmin) document.body.classList.add('is-admin');
  document.getElementById('loginPage').classList.remove('active');
  document.getElementById('mainSite').classList.add('active');
  showSection('home');
  initLiveData();
}

function handleLogout() {
  isAdmin = false;
  document.body.classList.remove('is-admin');
  document.getElementById('mainSite').classList.remove('active');
  document.getElementById('loginPage').classList.add('active');
  document.getElementById('passwordInput').value = '';
}

/* ════════════════════════════════════════════════════════
   NAVIGATION
════════════════════════════════════════════════════════ */
function showSection(name) {
  document.querySelectorAll('.site-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

  const pageMap = { home:'homePage', about:'aboutPage', favorites:'favoritesPage', hobbies:'hobbiesPage', goals:'goalsPage', bucket:'bucketPage' };
  const el = document.getElementById(pageMap[name]);
  if (el) { el.classList.add('active'); }

  const link = document.querySelector(`.nav-link[data-page="${name}"]`);
  if (link) link.classList.add('active');

  document.getElementById('mainSite').scrollTo({ top: 0, behavior: 'smooth' });
  return false;
}

/* ════════════════════════════════════════════════════════
   LIVE DATA — FIRESTORE LISTENERS
════════════════════════════════════════════════════════ */
function initLiveData() {
  waitForFb(() => {
    loadProfile();
    // Gallery is now hardcoded in index.html — no Firebase load needed
    loadAbout();
    loadFavorites();
    loadHobbies();
    loadGoals();
    loadBucketList();
  });
}

/* ── PROFILE ── */
async function loadProfile() {
  const { db, doc, onSnapshot } = fb;
  onSnapshot(doc(db, 'profile', 'main'), snap => {
    if (!snap.exists()) return;
    const d = snap.data();
    if (d.name) document.getElementById('profileName').textContent = d.name;
    if (d.motto) { const m = document.getElementById('profileMotto'); m.textContent = d.motto; m.classList.remove('admin-placeholder'); }
    if (d.intro) { const i = document.getElementById('profileIntro'); i.textContent = d.intro; i.classList.remove('admin-placeholder'); }
    // Profile photo is now set directly in index.html — no Firebase photo sync needed
  });
  // Set edit placeholders
  document.getElementById('profileMotto').setAttribute('data-placeholder', 'Add a motto…');
  document.getElementById('profileIntro').setAttribute('data-placeholder', 'Write a short introduction…');
  if (isAdmin) {
    document.getElementById('profileMotto').setAttribute('data-editable','motto');
    document.getElementById('profileMotto').onclick = () => editField('motto');
    document.getElementById('profileIntro').setAttribute('data-editable','intro');
    document.getElementById('profileIntro').onclick = () => editField('intro');
  }
}

async function saveProfile(field, value) {
  const { db, doc, setDoc } = fb;
  await setDoc(doc(db, 'profile', 'main'), { [field]: value }, { merge: true });
  showToast('Profile updated ✦');
}

function triggerProfilePicUpload() { document.getElementById('profilePicInput').click(); }

async function uploadProfilePic(e) {
  const file = e.target.files[0];
  if (!file) return;
  showToast('Uploading photo…');
  const { storage, ref, uploadBytesResumable, getDownloadURL, db, doc, setDoc } = fb;
  const r = ref(storage, `profile/photo_${Date.now()}`);
  const task = uploadBytesResumable(r, file);
  task.on('state_changed', null, err => showToast('Upload failed', '#ff6b8a'), async () => {
    const url = await getDownloadURL(task.snapshot.ref);
    await setDoc(doc(db, 'profile', 'main'), { photoURL: url }, { merge: true });
    showToast('Photo updated ✦');
  });
}

/* ── GALLERY ── */
function loadGallery() {
  const { db, collection, onSnapshot } = fb;
  onSnapshot(collection(db, 'gallery'), snap => {
    galleryItems = [];
    snap.forEach(d => galleryItems.push({ id: d.id, ...d.data() }));
    galleryItems.sort((a,b) => (b.createdAt||0) - (a.createdAt||0));
    renderGallery();
  });
}

function renderGallery() {
  const grid = document.getElementById('galleryGrid');
  const empty = document.getElementById('galleryEmpty');
  grid.innerHTML = '';
  if (!galleryItems.length) { grid.appendChild(empty); return; }

  galleryItems.forEach(item => {
    const wrap = document.createElement('div');
    wrap.className = 'gallery-item';

    const overlay = document.createElement('div');
    overlay.className = 'gallery-item-overlay';
    const actions = document.createElement('div');
    actions.className = 'gallery-item-actions';

    if (item.type === 'image') {
      const img = document.createElement('img');
      img.src = item.url; img.alt = item.name || '';
      img.loading = 'lazy';
      wrap.appendChild(img);
      wrap.addEventListener('click', e => { if (!e.target.closest('.gallery-item-actions')) openLightboxImg(item.url); });
    } else {
      const vid = document.createElement('video');
      vid.src = item.url; vid.preload = 'metadata';
      wrap.appendChild(vid);
      wrap.addEventListener('click', e => { if (!e.target.closest('.gallery-item-actions')) openLightboxVid(item.url); });
    }

    if (isAdmin) {
      const delBtn = document.createElement('button');
      delBtn.className = 'gallery-action-btn del';
      delBtn.textContent = '✕ Delete';
      delBtn.onclick = e => { e.stopPropagation(); deleteGalleryItem(item); };
      actions.appendChild(delBtn);
    }

    overlay.appendChild(actions);
    wrap.appendChild(overlay);
    grid.appendChild(wrap);
  });
}

async function uploadMedia(e, type) {
  const file = e.target.files[0];
  if (!file) return;
  showToast(`Uploading ${type}…`);
  const { storage, ref, uploadBytesResumable, getDownloadURL, db, collection, addDoc } = fb;
  const r = ref(storage, `gallery/${type}_${Date.now()}_${file.name}`);
  const task = uploadBytesResumable(r, file);
  task.on('state_changed', null, () => showToast('Upload failed','#ff6b8a'), async () => {
    const url = await getDownloadURL(task.snapshot.ref);
    await addDoc(collection(db, 'gallery'), { url, type, name: file.name, createdAt: Date.now() });
    showToast('Media added to gallery ✦');
  });
  e.target.value = '';
}

async function deleteGalleryItem(item) {
  if (!confirm(`Delete "${item.name}"?`)) return;
  const { db, doc, deleteDoc, storage, ref, deleteObject } = fb;
  try { await deleteObject(ref(storage, item.url)); } catch(e) {}
  await deleteDoc(doc(db, 'gallery', item.id));
  showToast('Deleted ✦');
}

/* ── LIGHTBOX ── */
function openLightboxImg(url) {
  const lb = document.getElementById('lightbox');
  document.getElementById('lightboxImg').src = url;
  document.getElementById('lightboxImg').style.display = 'block';
  document.getElementById('lightboxVideo').style.display = 'none';
  lb.classList.add('open');
}
function openLightboxVid(url) {
  const lb = document.getElementById('lightbox');
  document.getElementById('lightboxVideo').src = url;
  document.getElementById('lightboxVideo').style.display = 'block';
  document.getElementById('lightboxImg').style.display = 'none';
  lb.classList.add('open');
}
function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  document.getElementById('lightboxVideo').pause();
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeLightbox(); closeModal(); } });

/* ── ABOUT ME ── */
const ABOUT_SECTIONS = ['Introduction','Personality','My Story','Philosophy','Values','Life Lessons'];

function loadAbout() {
  const { db, doc, onSnapshot } = fb;
  const grid = document.getElementById('aboutContent');
  grid.innerHTML = '';
  ABOUT_SECTIONS.forEach(sec => {
    const card = document.createElement('div');
    card.className = 'about-card';
    card.innerHTML = `<h3>${sec}</h3><p id="about_${sec.replace(/\s/g,'_')}" data-section="${sec}"></p>`;
    if (isAdmin) {
      card.querySelector('p').style.cursor = 'pointer';
      card.querySelector('p').title = 'Click to edit';
      card.querySelector('p').onclick = () => editAboutSection(sec, card.querySelector('p').textContent);
    }
    grid.appendChild(card);
  });

  onSnapshot(doc(db, 'about', 'main'), snap => {
    if (!snap.exists()) return;
    const d = snap.data();
    ABOUT_SECTIONS.forEach(sec => {
      const el = document.getElementById(`about_${sec.replace(/\s/g,'_')}`);
      if (el && d[sec]) el.textContent = d[sec];
    });
  });
}

function editAboutSection(sec, current) {
  openModal(`Edit: ${sec}`, `
    <label>${sec}</label>
    <textarea id="aboutInput" rows="5" placeholder="Write about ${sec.toLowerCase()}…">${current || ''}</textarea>
  `, async () => {
    const val = document.getElementById('aboutInput').value.trim();
    const { db, doc, setDoc } = fb;
    await setDoc(doc(db, 'about', 'main'), { [sec]: val }, { merge: true });
    showToast(`${sec} updated ✦`);
  });
}

/* ── FAVORITES ── */
const FAV_CATEGORIES = [
  'Favorite Food','Favorite Drink','Favorite Dessert','Favorite Snack',
  'Favorite Color','Favorite Colors','Favorite Music','Favorite Music Genre',
  'Favorite Artist','Favorite Song','Favorite Album','Favorite Movie',
  'Favorite Series','Favorite Anime','Favorite Book','Favorite Game',
  'Favorite Sport','Favorite Hobby','Favorite Animal','Favorite Place',
  'Favorite Subject','Favorite Season','Favorite Quote','Favorite Memory',
  'Favorite Dream Destination','Favorite Life Goal'
];

function loadFavorites() {
  const { db, doc, onSnapshot } = fb;
  const grid = document.getElementById('favoritesGrid');
  grid.innerHTML = '';
  FAV_CATEGORIES.forEach((cat, i) => {
    const card = document.createElement('div');
    card.className = `fav-card${isAdmin?' editable':''}`;
    card.style.setProperty('--delay', `${(i % 8) * 0.15}s`);
    card.innerHTML = `<div class="fav-label">${cat}</div><div class="fav-value" id="fav_${i}" data-cat="${cat}"></div>`;
    if (isAdmin) {
      card.querySelector('.fav-value').onclick = () => editFav(cat, i);
    }
    grid.appendChild(card);
  });

  onSnapshot(doc(db, 'favorites', 'main'), snap => {
    if (!snap.exists()) return;
    const d = snap.data();
    FAV_CATEGORIES.forEach((cat, i) => {
      const el = document.getElementById(`fav_${i}`);
      if (el && d[cat]) el.textContent = d[cat];
    });
  });
}

function editFav(cat, i) {
  const cur = document.getElementById(`fav_${i}`).textContent;
  openModal(`Edit: ${cat}`, `
    <label>${cat}</label>
    <input type="text" id="favInput" value="${cur || ''}" placeholder="Enter ${cat.toLowerCase()}…" style="min-height:auto;resize:none;"/>
  `, async () => {
    const val = document.getElementById('favInput').value.trim();
    const { db, doc, setDoc } = fb;
    await setDoc(doc(db, 'favorites', 'main'), { [cat]: val }, { merge: true });
    showToast('Favorite updated ✦');
  });
}

/* ── HOBBIES ── */
function loadHobbies() {
  const { db, collection, onSnapshot } = fb;
  onSnapshot(collection(db, 'hobbies'), snap => {
    const items = [];
    snap.forEach(d => items.push({ id: d.id, ...d.data() }));
    renderHobbies(items);
  });
}

function renderHobbies(items) {
  const grid = document.getElementById('hobbiesGrid');
  grid.innerHTML = '';
  if (!items.length) {
    grid.innerHTML = '<p style="color:rgba(232,234,246,0.3);text-align:center;padding:60px;font-style:italic;grid-column:1/-1;">No hobbies added yet ✦</p>';
    return;
  }
  items.forEach((h, i) => {
    const card = document.createElement('div');
    card.className = 'hobby-card';
    card.style.setProperty('--delay', `${i * 0.2}s`);
    card.innerHTML = `
      <div class="hobby-img">${h.photoURL ? `<img src="${h.photoURL}" alt="${h.name||''}"/>` : '✦'}</div>
      <div class="hobby-info">
        <div class="hobby-name">${h.name || 'Unnamed Hobby'}</div>
        <div class="hobby-desc">${h.desc || ''}</div>
      </div>
      ${isAdmin ? `<div class="hobby-card-actions admin-only" style="display:flex">
        <button class="btn-icon" onclick="editHobby('${h.id}','${escQ(h.name)}','${escQ(h.desc)}')">Edit</button>
        <button class="btn-icon del" onclick="deleteHobby('${h.id}')">Delete</button>
      </div>` : ''}
    `;
    grid.appendChild(card);
  });
}

function addHobby() { editHobby(null, '', ''); }

function editHobby(id, name, desc) {
  openModal(id ? 'Edit Hobby' : 'Add Hobby', `
    <label>Hobby Name</label>
    <input type="text" id="hobbyName" value="${name||''}" placeholder="e.g. Stargazing" style="min-height:auto;resize:none;"/>
    <label>Description</label>
    <textarea id="hobbyDesc" rows="3" placeholder="Describe this hobby…">${desc||''}</textarea>
  `, async () => {
    const n = document.getElementById('hobbyName').value.trim();
    const d = document.getElementById('hobbyDesc').value.trim();
    if (!n) { showToast('Name required','#ff6b8a'); return; }
    const { db, doc, updateDoc, addDoc, collection, setDoc } = fb;
    if (id) {
      await updateDoc(doc(db, 'hobbies', id), { name:n, desc:d });
    } else {
      await addDoc(collection(db, 'hobbies'), { name:n, desc:d, createdAt: Date.now() });
    }
    showToast('Hobby saved ✦');
  });
}

async function deleteHobby(id) {
  if (!confirm('Delete this hobby?')) return;
  const { db, doc, deleteDoc } = fb;
  await deleteDoc(doc(db, 'hobbies', id));
  showToast('Deleted ✦');
}

/* ── GOALS ── */
function loadGoals() {
  const { db, collection, onSnapshot } = fb;
  onSnapshot(collection(db, 'goals'), snap => {
    const items = [];
    snap.forEach(d => items.push({ id: d.id, ...d.data() }));
    renderGoals(items);
  });
}

function renderGoals(items) {
  const grid = document.getElementById('goalsGrid');
  grid.innerHTML = '';
  if (!items.length) {
    grid.innerHTML = '<p style="color:rgba(232,234,246,0.3);text-align:center;padding:60px;font-style:italic;grid-column:1/-1;">No goals added yet ✦</p>';
    return;
  }
  items.forEach(g => {
    const pct = Math.min(100, Math.max(0, g.progress || 0));
    const card = document.createElement('div');
    card.className = 'goal-card';
    card.innerHTML = `
      <div class="goal-title">${g.title || 'Untitled Goal'}</div>
      <div class="goal-desc">${g.desc || ''}</div>
      <div class="progress-bar-wrap">
        <div class="progress-bar"><div class="progress-fill" style="width:0%" data-target="${pct}"></div></div>
        <div class="progress-label">${pct}%</div>
      </div>
      ${isAdmin ? `<div class="goal-card-actions admin-only" style="display:flex">
        <button class="btn-icon" onclick="editGoal('${g.id}','${escQ(g.title)}','${escQ(g.desc)}',${pct})">Edit</button>
        <button class="btn-icon del" onclick="deleteGoal('${g.id}')">Delete</button>
      </div>` : ''}
    `;
    grid.appendChild(card);
    // Animate progress bar
    requestAnimationFrame(() => {
      setTimeout(() => {
        const fill = card.querySelector('.progress-fill');
        if (fill) fill.style.width = pct + '%';
      }, 100);
    });
  });
}

function addGoal() { editGoal(null,'','',0); }

function editGoal(id, title, desc, progress) {
  openModal(id ? 'Edit Goal' : 'Add Goal', `
    <label>Goal Title</label>
    <input type="text" id="goalTitle" value="${title||''}" placeholder="e.g. Learn to play piano" style="min-height:auto;resize:none;"/>
    <label>Description</label>
    <textarea id="goalDesc" rows="3" placeholder="Describe this goal…">${desc||''}</textarea>
    <label>Progress (0–100)</label>
    <input type="number" id="goalProgress" value="${progress||0}" min="0" max="100" style="min-height:auto;resize:none;"/>
  `, async () => {
    const t = document.getElementById('goalTitle').value.trim();
    const d = document.getElementById('goalDesc').value.trim();
    const p = parseInt(document.getElementById('goalProgress').value) || 0;
    if (!t) { showToast('Title required','#ff6b8a'); return; }
    const { db, doc, updateDoc, addDoc, collection } = fb;
    if (id) {
      await updateDoc(doc(db, 'goals', id), { title:t, desc:d, progress:p });
    } else {
      await addDoc(collection(db, 'goals'), { title:t, desc:d, progress:p, createdAt: Date.now() });
    }
    showToast('Goal saved ✦');
  });
}

async function deleteGoal(id) {
  if (!confirm('Delete this goal?')) return;
  const { db, doc, deleteDoc } = fb;
  await deleteDoc(doc(db, 'goals', id));
  showToast('Deleted ✦');
}

/* ── BUCKET LIST ── */
function loadBucketList() {
  const { db, collection, onSnapshot } = fb;
  onSnapshot(collection(db, 'bucket'), snap => {
    const items = [];
    snap.forEach(d => items.push({ id: d.id, ...d.data() }));
    items.sort((a,b) => (a.createdAt||0) - (b.createdAt||0));
    renderBucketList(items);
  });
}

function renderBucketList(items) {
  const list = document.getElementById('bucketList');
  list.innerHTML = '';
  const done = items.filter(i => i.done).length;
  const pct = items.length ? Math.round(done/items.length*100) : 0;
  document.getElementById('bucketProgressFill').style.width = pct + '%';
  document.getElementById('bucketProgressText').textContent = `${done} of ${items.length} completed`;

  if (!items.length) {
    list.innerHTML = '<li style="color:rgba(232,234,246,0.3);text-align:center;padding:60px;font-style:italic;">No items yet ✦</li>';
    return;
  }
  items.forEach(item => {
    const li = document.createElement('li');
    li.className = `bucket-item${item.done ? ' done' : ''}`;
    li.innerHTML = `
      <div class="bucket-check" onclick="toggleBucket('${item.id}',${!item.done})">${item.done ? '✦' : ''}</div>
      <span class="bucket-text">${item.text || ''}</span>
      ${isAdmin ? `<button class="bucket-del admin-only" style="display:revert" onclick="deleteBucket('${item.id}')">✕</button>` : ''}
    `;
    list.appendChild(li);
  });
}

function addBucketItem() {
  openModal('Add Bucket List Item', `
    <label>Item</label>
    <input type="text" id="bucketInput" placeholder="e.g. Watch sunrise on a mountain…" style="min-height:auto;resize:none;"/>
  `, async () => {
    const text = document.getElementById('bucketInput').value.trim();
    if (!text) { showToast('Text required','#ff6b8a'); return; }
    const { db, addDoc, collection } = fb;
    await addDoc(collection(db, 'bucket'), { text, done: false, createdAt: Date.now() });
    showToast('Added to bucket list ✦');
  });
}

async function toggleBucket(id, done) {
  const { db, doc, updateDoc } = fb;
  await updateDoc(doc(db, 'bucket', id), { done });
  if (done) showToast('✦ Achievement unlocked!', 'var(--aurora-green)');
}

async function deleteBucket(id) {
  const { db, doc, deleteDoc } = fb;
  await deleteDoc(doc(db, 'bucket', id));
  showToast('Deleted ✦');
}

/* ── PROFILE FIELD EDIT ── */
function editField(field) {
  if (!isAdmin) return;
  const labels = { motto:'Motto', intro:'Introduction', name:'Display Name' };
  const current = document.getElementById(`profile${field.charAt(0).toUpperCase()+field.slice(1)}`).textContent;
  openModal(`Edit ${labels[field]||field}`, `
    <label>${labels[field]||field}</label>
    <textarea id="fieldInput" rows="3" placeholder="Enter ${field}…">${current||''}</textarea>
  `, () => {
    const val = document.getElementById('fieldInput').value.trim();
    saveProfile(field, val);
  });
}

/* ════════════════════════════════════════════════════════
   MODAL
════════════════════════════════════════════════════════ */
function openModal(title, bodyHTML, onSave) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalBody').innerHTML = bodyHTML;
  currentModal.onSave = onSave;
  document.getElementById('editModal').classList.add('open');
  // Focus first input
  setTimeout(() => {
    const first = document.querySelector('#editModal input, #editModal textarea');
    if (first) first.focus();
  }, 80);
}

function closeModal() {
  document.getElementById('editModal').classList.remove('open');
  currentModal = {};
}

async function saveModal() {
  if (currentModal.onSave) {
    await currentModal.onSave();
    closeModal();
  }
}

/* ── HELPERS ── */
function escQ(s) { return (s||'').replace(/'/g, "\\'").replace(/"/g, '&quot;'); }

/* ════════════════════════════════════════════════════════
   INIT — wait for Firebase then start
════════════════════════════════════════════════════════ */
waitForFb(() => {
  // Ready — login page is shown by default
  console.log('%c✦ Tristan\'s Digital Sanctuary — Initialized', 'color:#00d4ff;font-size:14px;font-family:serif');
});
