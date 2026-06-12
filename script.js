/**
 * SOP Lab Komputer - Bootstrap Carousel Web App
 * JavaScript Controller
 * PTI FKIP Universitas Lampung
 */

// ==========================================
// SIDEBAR / HAMBURGER MENU
// ==========================================

const hamburgerBtn = document.getElementById('hamburgerBtn');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');

function toggleSidebar() {
  const isActive = sidebar.classList.contains('active');
  if (isActive) {
    closeSidebar();
  } else {
    openSidebar();
  }
}

function openSidebar() {
  sidebar.classList.add('active');
  sidebarOverlay.classList.add('active');
  hamburgerBtn.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeSidebar() {
  sidebar.classList.remove('active');
  sidebarOverlay.classList.remove('active');
  hamburgerBtn.classList.remove('active');
  document.body.style.overflow = '';
}

hamburgerBtn.addEventListener('click', toggleSidebar);
sidebarOverlay.addEventListener('click', closeSidebar);

// Close sidebar with Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeSidebar();
});


// ==========================================
// PAGE NAVIGATION
// ==========================================

let currentPage = 'welcome';

function navigateTo(pageId) {
  closeSidebar();

  // Hide all pages
  document.querySelectorAll('.sop-page, .welcome-page').forEach(page => {
    page.classList.remove('active');
    if (page.classList.contains('welcome-page')) {
      page.style.display = 'none';
    }
  });

  // Update nav items
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
    if (item.dataset.sop === pageId) {
      item.classList.add('active');
    }
  });

  // Show target page
  if (pageId === 'welcome') {
    const welcomePage = document.getElementById('page-welcome');
    welcomePage.style.display = 'block';
    welcomePage.style.animation = 'none';
    welcomePage.offsetHeight;
    welcomePage.style.animation = '';
  } else {
    const targetPage = document.getElementById('page-' + pageId);
    if (targetPage) {
      targetPage.classList.add('active');
      
      // Reset Bootstrap Carousel to first slide when entering SOP page
      const carouselEl = targetPage.querySelector('.carousel');
      if (carouselEl && window.bootstrap) {
        const bsCarousel = bootstrap.Carousel.getInstance(carouselEl) || new bootstrap.Carousel(carouselEl);
        bsCarousel.to(0);
      }
    }
  }

  currentPage = pageId;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Set initial page
document.querySelector('.nav-item[data-sop="welcome"]').classList.add('active');


// ==========================================
// HEADER SCROLL EFFECT
// ==========================================

const header = document.getElementById('mainHeader');

window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 10);
});


// ==========================================
// AUDIO ENGINE (Local Audio File)
// ==========================================

// Click Sound (Web Audio API)
let audioCtx = null;

function ensureAudioCtx() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AC();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function playClickSound() {
  const ctx = ensureAudioCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(880, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.08);

  gain.gain.setValueAtTime(0.12, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.08);
}

// Background Music (Local backsound.wav)
let isBgmPlaying = false;
const bgm = new Audio('sounds/backsound.wav');
bgm.loop = true;
bgm.volume = 0.3; // Default volume

const musicToggleBtn = document.getElementById('musicToggleBtn');
const musicIcon = document.getElementById('musicIcon');

function startMusic() {
  bgm.play().then(() => {
    isBgmPlaying = true;
    musicIcon.className = 'fas fa-volume-up';
    musicToggleBtn.classList.add('playing');
  }).catch(err => {
    console.log('Music play blocked:', err.message);
  });
}

function stopMusic() {
  bgm.pause();
  isBgmPlaying = false;
  musicIcon.className = 'fas fa-volume-xmark';
  musicToggleBtn.classList.remove('playing');
}

function toggleMusic() {
  isBgmPlaying ? stopMusic() : startMusic();
}

musicToggleBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  playClickSound();
  toggleMusic();
});

// Auto-start music on first user interaction anywhere on the page
function onFirstInteraction() {
  if (!isBgmPlaying) startMusic();
  document.removeEventListener('click', onFirstInteraction);
  document.removeEventListener('touchstart', onFirstInteraction);
}
document.addEventListener('click', onFirstInteraction);
document.addEventListener('touchstart', onFirstInteraction, { passive: true });

// Attach click sound to interactive elements
document.addEventListener('click', (e) => {
  // Add click sound to any button, nav item, or clickable card
  const isClickable = e.target.closest('button, .nav-item, .welcome-card');
  // Don't play default click sound for music toggle (it has its own handler)
  if (isClickable && !e.target.closest('#musicToggleBtn')) {
    playClickSound();
  }
});


// ==========================================
// PWA SERVICE WORKER
// ==========================================

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').then(reg => {
      console.log('SW registered:', reg.scope);
    }).catch(err => {
      console.log('SW failed:', err);
    });
  });
}

// ==========================================
// SPLASH SCREEN & 3D BACKGROUND LOGIC
// ==========================================
window.addEventListener('load', () => {
  // Initialize Vanta.js 3D Background
  if (window.VANTA && window.VANTA.NET) {
    VANTA.NET({
      el: "#vanta-bg",
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      minHeight: 200.00,
      minWidth: 200.00,
      scale: 1.00,
      scaleMobile: 1.00,
      color: 0xa689e1, /* Light purple connections */
      backgroundColor: 0x1a0b2e, /* Deep dark purple background */
      points: 14.00,
      maxDistance: 22.00,
      spacing: 16.00
    });
  }

  // Splash Screen Fade Out
  const splash = document.getElementById('splashScreen');
  if (splash) {
    setTimeout(() => {
      splash.classList.add('fade-out');
      // Optionally remove from DOM after transition
      setTimeout(() => {
        splash.style.display = 'none';
      }, 800);
    }, 2500); // Tampil selama 2.5 detik
  }
});
