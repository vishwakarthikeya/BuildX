// ---------- SCRIPT.JS · COMPLETE ----------
// 3D NEURAL NETWORK BACKGROUND (Three.js)
function initNeuralBackground() {
  const canvas = document.getElementById('neural-bg');
  if (!canvas) return;
  
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050a14);
  
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 25);
  
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: false, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  
  // Neural network particles
  const particlesCount = 600;
  const positions = new Float32Array(particlesCount * 3);
  
  for (let i = 0; i < particlesCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 60;
    positions[i + 1] = (Math.random() - 0.5) * 60;
    positions[i + 2] = (Math.random() - 0.5) * 40 - 20; // z spread
  }
  
  const particlesGeometry = new THREE.BufferGeometry();
  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  
  const particlesMaterial = new THREE.PointsMaterial({
    color: 0x00d9ff,
    size: 0.25,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
  });
  
  const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
  scene.add(particlesMesh);
  
  // Connecting lines (neural edges)
  const linePositions = [];
  for (let i = 0; i < particlesCount; i++) {
    for (let j = i + 1; j < particlesCount; j++) {
      const dx = positions[i * 3] - positions[j * 3];
      const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
      const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
      
      if (distance < 12) {
        linePositions.push(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
        linePositions.push(positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]);
      }
    }
  }
  
  const lineGeometry = new THREE.BufferGeometry();
  lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
  
  const lineMaterial = new THREE.LineBasicMaterial({ 
    color: 0x006688, 
    transparent: true, 
    opacity: 0.15,
    blending: THREE.AdditiveBlending
  });
  
  const linesMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
  scene.add(linesMesh);
  
  // Slow rotation animation
  function animate() {
    requestAnimationFrame(animate);
    
    particlesMesh.rotation.y += 0.0002;
    particlesMesh.rotation.x += 0.0001;
    linesMesh.rotation.y += 0.0002;
    linesMesh.rotation.x += 0.0001;
    
    renderer.render(scene, camera);
  }
  
  animate();
  
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

// ---------- GLOBAL STATE & LOCALSTORAGE ----------
const STORAGE_KEYS = {
  PROBLEMS_ENABLED: 'problemStatementsEnabled',
  SUBMISSION_ENABLED: 'submissionEnabled',
  REGISTRATION_OPEN: 'registrationOpen',
  ADMIN_LOGGED_IN: 'adminLoggedIn'
};

// Default values
let problemEnabled = localStorage.getItem(STORAGE_KEYS.PROBLEMS_ENABLED) === 'true';
let submissionEnabled = localStorage.getItem(STORAGE_KEYS.SUBMISSION_ENABLED) === 'true';
let registrationOpen = localStorage.getItem(STORAGE_KEYS.REGISTRATION_OPEN) !== 'false'; // default true
let adminLoggedIn = localStorage.getItem(STORAGE_KEYS.ADMIN_LOGGED_IN) === 'true';

// PLACEHOLDER URLS (update via comments)
const REGISTRATION_URL = 'https://forms.gle/oDMg2YssdVJv1qSC9';
const SUBMISSION_URL = 'https://forms.gle/CrJ3Udjs5kVbvsrJ8';   
const WHATSAPP_URL = 'https://chat.whatsapp.com/FjsNz7s6wcv5gPKI3yUCtF?mode=gi_t';         
const PROBLEMS_PDF_URL = 'https://raw.githubusercontent.com/vishwakarthikeya/BuildX/main/assets/problem%20statement.pdf';            
const TIMETABLE_PDF_URL = 'https://raw.githubusercontent.com/vishwakarthikeya/BuildX/main/assets/Time%20Table.pdf';          
const MARKING_PDF_URL = 'https://raw.githubusercontent.com/vishwakarthikeya/BuildX/main/assets/Marks%20Distribution.pdf';              

// ---------- DOM ELEMENTS ----------
const problemSection = document.getElementById('problemStatementsSection');
const registerBtn = document.getElementById('registerBtn');
const adminLoginBtn = document.getElementById('adminLoginBtn');
const adminModal = document.getElementById('adminModal');
const adminPanelModal = document.getElementById('adminPanelModal');
const adminLoginSubmit = document.getElementById('adminLoginSubmit');
const adminLoginCancel = document.getElementById('adminLoginCancel');
const adminError = document.getElementById('adminError');
const adminLogoutBtn = document.getElementById('adminLogoutBtn');
const toggleProblems = document.getElementById('toggleProblems');
const toggleSubmission = document.getElementById('toggleSubmission');
const toggleRegistration = document.getElementById('toggleRegistration');
const downloadProblemsBtn = document.getElementById('downloadProblemsBtn');
const downloadTimetableBtn = document.getElementById('downloadTimetableBtn');
const downloadMarkingBtn = document.getElementById('downloadMarkingBtn');
const whatsappBtn = document.getElementById('whatsappBtn');

// ---------- INITIAL UI UPDATE ----------
function updateUIFromStorage() {
  // Problem statements visibility
  if (problemSection) {
    problemSection.style.display = problemEnabled ? 'block' : 'none';
  }
  
  // Registration button state
  updateRegistrationButton();
  
  // Admin panel toggles sync
  if (toggleProblems) toggleProblems.checked = problemEnabled;
  if (toggleSubmission) toggleSubmission.checked = submissionEnabled;
  if (toggleRegistration) toggleRegistration.checked = registrationOpen;
}

function updateRegistrationButton() {
  if (!registerBtn) return;
  
  // Set href based on submission enabled
  if (submissionEnabled) {
    registerBtn.textContent = 'Submit Your Project';
    registerBtn.href = SUBMISSION_URL;
  } else {
    registerBtn.textContent = 'Register Now';
    registerBtn.href = REGISTRATION_URL;
  }
  
  // Disable if registration closed
  if (!registrationOpen) {
    registerBtn.classList.add('disabled');
    registerBtn.textContent = 'Registration Closed';
    registerBtn.href = '#'; // prevent navigation
    registerBtn.style.pointerEvents = 'none';
  } else {
    registerBtn.classList.remove('disabled');
    registerBtn.style.pointerEvents = 'auto';
  }
}

// ---------- ACCORDION FUNCTIONALITY ----------
function initAccordion() {
  const problemCards = document.querySelectorAll('.problem-card');
  problemCards.forEach(card => {
    const header = card.querySelector('.problem-header');
    header.addEventListener('click', () => {
      card.classList.toggle('active');
      const toggle = card.querySelector('.problem-toggle');
      if (toggle) toggle.textContent = card.classList.contains('active') ? '−' : '+';
    });
  });
}

// ---------- ADMIN AUTHENTICATION ----------
const ADMIN_EMAIL = 'buildx@gmail.com';
const ADMIN_PASSWORD = 'buildxvishwakarthikeya';

function openAdminModal() {
  adminModal.style.display = 'flex';
  adminError.textContent = '';
  document.getElementById('adminEmail').value = ADMIN_EMAIL;
  document.getElementById('adminPassword').value = '';
}

function closeAdminModal() {
  adminModal.style.display = 'none';
}

function openAdminPanel() {
  adminPanelModal.style.display = 'flex';
  // sync toggles with current state
  if (toggleProblems) toggleProblems.checked = problemEnabled;
  if (toggleSubmission) toggleSubmission.checked = submissionEnabled;
  if (toggleRegistration) toggleRegistration.checked = registrationOpen;
}

function closeAdminPanel() {
  adminPanelModal.style.display = 'none';
}

function adminLogin() {
  const email = document.getElementById('adminEmail').value.trim();
  const password = document.getElementById('adminPassword').value;
  
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    adminLoggedIn = true;
    localStorage.setItem(STORAGE_KEYS.ADMIN_LOGGED_IN, 'true');
    closeAdminModal();
    openAdminPanel();
  } else {
    adminError.textContent = 'Invalid credentials. Please try again.';
  }
}

function adminLogout() {
  adminLoggedIn = false;
  localStorage.removeItem(STORAGE_KEYS.ADMIN_LOGGED_IN);
  closeAdminPanel();
}

// ---------- ADMIN TOGGLE HANDLERS ----------
function handleToggleProblems(e) {
  problemEnabled = e.target.checked;
  localStorage.setItem(STORAGE_KEYS.PROBLEMS_ENABLED, problemEnabled);
  if (problemSection) problemSection.style.display = problemEnabled ? 'block' : 'none';
}

function handleToggleSubmission(e) {
  submissionEnabled = e.target.checked;
  localStorage.setItem(STORAGE_KEYS.SUBMISSION_ENABLED, submissionEnabled);
  updateRegistrationButton();
}

function handleToggleRegistration(e) {
  registrationOpen = e.target.checked;
  localStorage.setItem(STORAGE_KEYS.REGISTRATION_OPEN, registrationOpen);
  updateRegistrationButton();
}

// ---------- SETUP PLACEHOLDER LINKS ----------
function setupDownloadButtons() {
  if (downloadProblemsBtn) downloadProblemsBtn.href = PROBLEMS_PDF_URL;
  if (downloadTimetableBtn) downloadTimetableBtn.href = TIMETABLE_PDF_URL;
  if (downloadMarkingBtn) downloadMarkingBtn.href = MARKING_PDF_URL;
  if (whatsappBtn) whatsappBtn.href = WHATSAPP_URL;
}

// ---------- EVENT LISTENERS ----------
function bindEvents() {
  // Admin login
  if (adminLoginBtn) {
    adminLoginBtn.addEventListener('click', openAdminModal);
  }
  
  // Modal close
  const closeButtons = document.querySelectorAll('.close-modal');
  closeButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      adminModal.style.display = 'none';
      adminPanelModal.style.display = 'none';
    });
  });
  
  if (adminLoginSubmit) {
    adminLoginSubmit.addEventListener('click', adminLogin);
  }
  
  if (adminLoginCancel) {
    adminLoginCancel.addEventListener('click', closeAdminModal);
  }
  
  if (adminLogoutBtn) {
    adminLogoutBtn.addEventListener('click', adminLogout);
  }
  
  // Toggle listeners
  if (toggleProblems) {
    toggleProblems.addEventListener('change', handleToggleProblems);
  }
  if (toggleSubmission) {
    toggleSubmission.addEventListener('change', handleToggleSubmission);
  }
  if (toggleRegistration) {
    toggleRegistration.addEventListener('change', handleToggleRegistration);
  }
  
  // Click outside modal to close
  window.addEventListener('click', (e) => {
    if (e.target === adminModal) closeAdminModal();
    if (e.target === adminPanelModal) closeAdminPanel();
  });
}

// ---------- INITIALIZE ON PAGE LOAD ----------
window.addEventListener('DOMContentLoaded', () => {
  initNeuralBackground();
  initAccordion();
  setupDownloadButtons();
  updateUIFromStorage();
  bindEvents();
  
  // If admin already logged in, open panel automatically? (optional)
  if (adminLoggedIn) {
    openAdminPanel();
  }
});