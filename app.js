/**
 * ANANT RAJ // THE CONTINUOUS THREAD
 * Award-Winning Creative Engineering & Interactive Systems
 * Primary Design Inspiration: Yogi Suria "One Thread" (ysuriadesign.co / Awwwards)
 */

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // 1. STATE & GLOBAL CONFIGURATION
  // ---------------------------------------------------------------------------
  const state = {
    audioEnabled: false,
    audioContext: null,
    scrollProgress: 0,
    mouse: { x: window.innerWidth * 0.5, y: window.innerHeight * 0.5, targetX: window.innerWidth * 0.5, targetY: window.innerHeight * 0.5 },
    currentChapter: '01',
    currentChapterTitle: 'GENESIS',
    isDrawerOpen: false,
    prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
  };

  // ---------------------------------------------------------------------------
  // 2. PROLOGUE / OPENING CURTAIN CONTROLLER
  // ---------------------------------------------------------------------------
  const prologue = document.getElementById('prologue');
  const prologueBar = document.getElementById('prologue-bar');
  const prologueStatus = document.getElementById('prologue-status');
  const skipBtn = document.getElementById('skip-prologue');

  let prologueProgress = 0;
  const prologueSteps = [
    { p: 25, label: 'ALLOCATING SYSTEM VECTORS...' },
    { p: 55, label: 'SYNCHRONIZING THE SYSTEM THREAD...' },
    { p: 85, label: 'INITIALIZING LOW-LEVEL CANVASES...' },
    { p: 100, label: 'SYSTEM THREAD ONLINE // DISCIPLINE ACTIVE' }
  ];

  function advancePrologue() {
    if (!prologue) return;
    const interval = setInterval(() => {
      prologueProgress += 5;
      if (prologueBar) prologueBar.style.width = prologueProgress + '%';

      const currentStep = prologueSteps.find(s => prologueProgress <= s.p);
      if (currentStep && prologueStatus) {
        prologueStatus.textContent = currentStep.label;
      }

      if (prologueProgress >= 100) {
        clearInterval(interval);
        setTimeout(dismissPrologue, 450);
      }
    }, 40);
  }

  function dismissPrologue() {
    if (!prologue || prologue.classList.contains('is-hidden')) return;
    prologue.classList.add('is-hidden');
    document.body.classList.remove('is-loading');
  }

  if (skipBtn) skipBtn.addEventListener('click', dismissPrologue);
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && prologue && !prologue.classList.contains('is-hidden')) {
      dismissPrologue();
    }
  });

  // Start initialization after DOM is ready
  window.addEventListener('DOMContentLoaded', advancePrologue);

  // ---------------------------------------------------------------------------
  // 3. AMBIENT AUDIO & SYNTHESIZED MICRO-FEEDBACK
  // ---------------------------------------------------------------------------
  const audioElement = document.getElementById('ambient-audio');
  const soundToggleBtn = document.getElementById('sound-toggle');
  const soundStateText = document.getElementById('sound-state-text');

  function initAudioContext() {
    if (!state.audioContext) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        state.audioContext = new AudioCtx();
      }
    }
    if (state.audioContext && state.audioContext.state === 'suspended') {
      state.audioContext.resume();
    }
  }

  // Subtle Web Audio micro-click for physical interaction feedback
  function playMicroClick(freq = 880, duration = 0.04) {
    if (!state.audioEnabled || !state.audioContext) return;
    try {
      const osc = state.audioContext.createOscillator();
      const gain = state.audioContext.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, state.audioContext.currentTime);
      gain.gain.setValueAtTime(0.03, state.audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, state.audioContext.currentTime + duration);
      osc.connect(gain);
      gain.connect(state.audioContext.destination);
      osc.start();
      osc.stop(state.audioContext.currentTime + duration);
    } catch (_) {}
  }

  if (soundToggleBtn && audioElement) {
    soundToggleBtn.addEventListener('click', () => {
      initAudioContext();
      state.audioEnabled = !state.audioEnabled;

      if (state.audioEnabled) {
        audioElement.volume = 0;
        audioElement.play().then(() => {
          soundToggleBtn.classList.add('is-active');
          if (soundStateText) soundStateText.textContent = 'ON';
          // Smooth volume ramp
          let vol = 0;
          const ramp = setInterval(() => {
            vol += 0.05;
            if (vol >= 0.45) {
              audioElement.volume = 0.45;
              clearInterval(ramp);
            } else {
              audioElement.volume = vol;
            }
          }, 60);
          playMicroClick(1200, 0.05);
        }).catch(() => {
          state.audioEnabled = false;
        });
      } else {
        soundToggleBtn.classList.remove('is-active');
        if (soundStateText) soundStateText.textContent = 'OFF';
        // Fade out
        let vol = audioElement.volume;
        const ramp = setInterval(() => {
          vol -= 0.08;
          if (vol <= 0.02) {
            audioElement.pause();
            audioElement.volume = 0;
            clearInterval(ramp);
          } else {
            audioElement.volume = vol;
          }
        }, 40);
      }
    });
  }

  // ---------------------------------------------------------------------------
  // 4. SUBTLE POINTER TRACKER (DESKTOP)
  // ---------------------------------------------------------------------------
  const cursorTracker = document.getElementById('cursor-tracker');
  if (cursorTracker && !state.prefersReducedMotion) {
    window.addEventListener('mousemove', (e) => {
      state.mouse.targetX = e.clientX;
      state.mouse.targetY = e.clientY;
    }, { passive: true });

    function renderCursor() {
      state.mouse.x += (state.mouse.targetX - state.mouse.x) * 0.22;
      state.mouse.y += (state.mouse.targetY - state.mouse.y) * 0.22;
      cursorTracker.style.transform = `translate3d(${state.mouse.x}px, ${state.mouse.y}px, 0)`;
      requestAnimationFrame(renderCursor);
    }
    requestAnimationFrame(renderCursor);

    // Hover effect on clickable elements
    const clickables = document.querySelectorAll('a, button, input, .interactive-visual-canvas');
    clickables.forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-active'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-active'));
    });
  }

  // ---------------------------------------------------------------------------
  // 5. CHAPTER NAVIGATION & SCROLL TRACKER
  // ---------------------------------------------------------------------------
  const chapterNumEl = document.getElementById('current-chapter-num');
  const chapterNameEl = document.getElementById('current-chapter-name');
  const scenes = document.querySelectorAll('.scene');

  const chapterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const idx = entry.target.getAttribute('data-chapter-index');
        const title = entry.target.getAttribute('data-chapter-title');
        if (idx && chapterNumEl) chapterNumEl.textContent = idx;
        if (title && chapterNameEl) chapterNameEl.textContent = title;
        playMicroClick(440 + parseInt(idx || '1', 10) * 80, 0.03);
      }
    });
  }, { threshold: 0.35 });

  scenes.forEach(scene => chapterObserver.observe(scene));

  // Navigation Drawer Open/Close
  const navDrawer = document.getElementById('nav-drawer');
  const navOpenBtn = document.getElementById('nav-open-btn');
  const navCloseBtn = document.getElementById('nav-close-btn');
  const navBackdrop = document.getElementById('nav-backdrop');
  const navLinks = document.querySelectorAll('.nav-chapter-link');

  function openNav() {
    if (!navDrawer) return;
    navDrawer.classList.add('is-open');
    navDrawer.setAttribute('aria-hidden', 'false');
    if (navOpenBtn) navOpenBtn.setAttribute('aria-expanded', 'true');
    playMicroClick(620, 0.04);
  }

  function closeNav() {
    if (!navDrawer) return;
    navDrawer.classList.remove('is-open');
    navDrawer.setAttribute('aria-hidden', 'true');
    if (navOpenBtn) navOpenBtn.setAttribute('aria-expanded', 'false');
    playMicroClick(420, 0.04);
  }

  if (navOpenBtn) navOpenBtn.addEventListener('click', openNav);
  if (navCloseBtn) navCloseBtn.addEventListener('click', closeNav);
  if (navBackdrop) navBackdrop.addEventListener('click', closeNav);

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeNav();
    });
  });

  // ---------------------------------------------------------------------------
  // 6. THE ANTIGRAVITY (AGY) 3D DOT GRID INNER SPHERE ENGINE
  // ---------------------------------------------------------------------------
  const threadCanvas = document.getElementById('thread-canvas');
  let tCtx = null;
  let canvasW = window.innerWidth;
  let canvasH = window.innerHeight;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);

  if (threadCanvas) {
    tCtx = threadCanvas.getContext('2d');
  }

  // Dot Grid State (Green dots forming an invisible grid, no lines)
  let dots = [];
  const gridSpacing = 24; // Spacing between dots in resting grid
  let sphereRadius = 145; // 3D sphere radius of influence

  // Virtual Light for 3D Sphere Shading
  const Lx = -0.35, Ly = -0.45, Lz = 0.82;
  const lLen = Math.sqrt(Lx * Lx + Ly * Ly + Lz * Lz);
  const normLx = Lx / lLen, normLy = Ly / lLen, normLz = Lz / lLen;

  // Pointer & Motion State (Tracks mouse & mobile touch)
  const pointer = {
    x: canvasW * 0.5,
    y: canvasH * 0.45,
    targetX: canvasW * 0.5,
    targetY: canvasH * 0.45,
    isHovering: false,
    lastActive: Date.now()
  };

  function initDotGrid() {
    dots = [];
    sphereRadius = Math.min(185, Math.max(115, canvasW * 0.16));
    const cols = Math.ceil(canvasW / gridSpacing) + 2;
    const rows = Math.ceil(canvasH / gridSpacing) + 2;
    const offsetX = (canvasW - (cols - 1) * gridSpacing) / 2;
    const offsetY = (canvasH - (rows - 1) * gridSpacing) / 2;

    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const ox = offsetX + c * gridSpacing;
        const oy = offsetY + r * gridSpacing;
        dots.push({
          ox: ox,
          oy: oy,
          x: ox,
          y: oy,
          z: 0,
          rad: 1.25,
          color: 'rgba(46, 213, 115, 0.32)'
        });
      }
    }
  }

  function resizeThreadCanvas() {
    if (!threadCanvas || !tCtx) return;
    canvasW = window.innerWidth;
    canvasH = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    threadCanvas.width = canvasW * dpr;
    threadCanvas.height = canvasH * dpr;
    tCtx.scale(dpr, dpr);
    initDotGrid();
  }

  window.addEventListener('resize', resizeThreadCanvas, { passive: true });
  resizeThreadCanvas();

  // Mouse & Touch Interaction Listeners
  window.addEventListener('mousemove', (e) => {
    pointer.targetX = e.clientX;
    pointer.targetY = e.clientY;
    pointer.isHovering = true;
    pointer.lastActive = Date.now();
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches[0]) {
      pointer.targetX = e.touches[0].clientX;
      pointer.targetY = e.touches[0].clientY;
      pointer.isHovering = true;
      pointer.lastActive = Date.now();
    }
  }, { passive: true });

  window.addEventListener('touchstart', (e) => {
    if (e.touches && e.touches[0]) {
      pointer.targetX = e.touches[0].clientX;
      pointer.targetY = e.touches[0].clientY;
      pointer.isHovering = true;
      pointer.lastActive = Date.now();
    }
  }, { passive: true });

  window.addEventListener('touchend', () => {
    pointer.isHovering = false;
  }, { passive: true });

  // Render Loop for 3D Dot Grid Inner Sphere
  let animTime = 0;

  function renderThread() {
    if (!tCtx || state.prefersReducedMotion) return;
    tCtx.clearRect(0, 0, canvasW, canvasH);
    animTime += 0.02;

    // Smooth cursor interpolation or ambient floating figure-8 when idle
    const idleSeconds = (Date.now() - pointer.lastActive) / 1000;
    if (idleSeconds > 2.5) {
      // Ambient floating 3D sphere wandering smoothly across the grid
      pointer.targetX = canvasW * 0.5 + Math.cos(animTime * 0.6) * (canvasW * 0.28);
      pointer.targetY = canvasH * 0.5 + Math.sin(animTime * 1.2) * (canvasH * 0.20);
    }

    pointer.x += (pointer.targetX - pointer.x) * 0.14;
    pointer.y += (pointer.targetY - pointer.y) * 0.14;

    const R = sphereRadius;
    const curX = pointer.x;
    const curY = pointer.y;

    // Update and draw each dot
    const len = dots.length;
    for (let i = 0; i < len; i++) {
      const dot = dots[i];
      const dx = dot.ox - curX;
      const dy = dot.oy - curY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < R) {
        // Dot is inside 3D Sphere of influence
        const z = Math.sqrt(Math.max(0, R * R - dist * dist));
        const nx = dx / R;
        const ny = dy / R;
        const nz = z / R;

        // 3D Inner Sphere projection (dots curve inward around the sphere surface)
        const angle = Math.atan2(dy, dx);
        const normDist = Math.min(1, dist / R);
        const sphereAngle = Math.asin(normDist);
        const projR = R * Math.sin(sphereAngle * 0.76);

        const targetX = curX + Math.cos(angle) * projR;
        const targetY = curY + Math.sin(angle) * projR;

        // Spring smoothly into sphere position
        dot.x += (targetX - dot.x) * 0.25;
        dot.y += (targetY - dot.y) * 0.25;
        dot.z += (z - dot.z) * 0.25;

        // 3D Lighting calculation
        const NdotL = Math.max(0, nx * normLx + ny * normLy + nz * normLz);
        const spec = Math.pow(NdotL, 16);

        // Size & brightness scaling with depth
        const zFactor = dot.z / R;
        dot.rad = 1.35 + 2.0 * zFactor;
        const illum = 0.5 + 0.5 * NdotL + spec * 0.8;
        const r = Math.min(255, Math.floor(20 + 200 * spec));
        const g = Math.min(255, Math.floor(185 + 70 * illum));
        const b = Math.min(255, Math.floor(60 + 190 * spec));
        const alpha = Math.min(1.0, 0.4 + 0.6 * zFactor);
        dot.color = 'rgba(' + r + ', ' + g + ', ' + b + ', ' + alpha.toFixed(2) + ')';
      } else {
        // Dot is outside: spring back to resting grid position
        dot.x += (dot.ox - dot.x) * 0.15;
        dot.y += (dot.oy - dot.y) * 0.15;
        dot.z += (0 - dot.z) * 0.15;
        dot.rad += (1.25 - dot.rad) * 0.15;
        dot.color = 'rgba(46, 213, 115, 0.30)';
      }

      // Draw dot (NO lines visible!)
      tCtx.beginPath();
      tCtx.arc(dot.x, dot.y, dot.rad, 0, Math.PI * 2);
      tCtx.fillStyle = dot.color;
      tCtx.fill();
    }

    requestAnimationFrame(renderThread);
  }

  if (!state.prefersReducedMotion) {
    requestAnimationFrame(renderThread);
  }


  // 7. INTERACTIVE VISUAL CANVASES FOR FEATURED ARTIFACTS
  // ---------------------------------------------------------------------------

  // A. VeriPack Live Provenance Visualizer
  const veripackCanvas = document.getElementById('canvas-veripack');
  if (veripackCanvas) {
    const vCtx = veripackCanvas.getContext('2d');
    let vTime = 0;
    const entropyEl = document.getElementById('veripack-entropy-val');

    function drawVeriPack() {
      vTime += 0.03;
      const w = veripackCanvas.width;
      const h = veripackCanvas.height;
      vCtx.clearRect(0, 0, w, h);

      // Grid background
      vCtx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      vCtx.lineWidth = 1;
      for (let x = 40; x < w; x += 40) {
        vCtx.beginPath();
        vCtx.moveTo(x, 0);
        vCtx.lineTo(x, h);
        vCtx.stroke();
      }
      for (let y = 40; y < h; y += 40) {
        vCtx.beginPath();
        vCtx.moveTo(0, y);
        vCtx.lineTo(w, y);
        vCtx.stroke();
      }

      // Tarball Extraction Chamber (Left)
      vCtx.strokeStyle = '#2ed573';
      vCtx.fillStyle = 'rgba(46, 213, 115, 0.06)';
      vCtx.strokeRect(60, 60, 180, 180);
      vCtx.fillRect(60, 60, 180, 180);

      vCtx.fillStyle = '#2ed573';
      vCtx.font = '11px "JetBrains Mono", monospace';
      vCtx.fillText('TARBALL ARCHIVE', 70, 85);
      vCtx.fillText('SAFE EXTRACTION BOUND', 70, 105);

      // Decompressed Nodes
      const nodeCount = 5;
      for (let i = 0; i < nodeCount; i++) {
        const ny = 130 + i * 20;
        const progress = (Math.sin(vTime * 2 + i) + 1) / 2;
        vCtx.fillStyle = progress > 0.8 ? '#ff3344' : '#2ed573';
        vCtx.fillRect(75, ny, 10, 8);
        vCtx.fillStyle = '#8e95a5';
        vCtx.fillText(`file_${i}.js [CLEAN]`, 95, ny + 7);
      }

      // Reconciliation Differential Waves (Center)
      vCtx.beginPath();
      vCtx.strokeStyle = '#ff3344';
      vCtx.lineWidth = 2;
      for (let x = 250; x <= 360; x += 2) {
        const wave = Math.sin((x * 0.08) - (vTime * 4)) * 25;
        const y = 150 + wave;
        if (x === 250) vCtx.moveTo(x, y);
        else vCtx.lineTo(x, y);
      }
      vCtx.stroke();

      // Git Tree Verified Core (Right)
      vCtx.strokeStyle = '#70a1ff';
      vCtx.fillStyle = 'rgba(112, 161, 255, 0.06)';
      vCtx.strokeRect(370, 60, 180, 180);
      vCtx.fillRect(370, 60, 180, 180);

      vCtx.fillStyle = '#70a1ff';
      vCtx.fillText('UPSTREAM GIT TREE', 380, 85);
      vCtx.fillText('SHA-256 MATCHED', 380, 105);

      for (let i = 0; i < nodeCount; i++) {
        const ny = 130 + i * 20;
        vCtx.fillStyle = '#70a1ff';
        vCtx.fillRect(385, ny, 10, 8);
        vCtx.fillStyle = '#8e95a5';
        vCtx.fillText(`commit_${i} // git`, 405, ny + 7);
      }

      // Shannon Entropy Waveform at Bottom
      vCtx.strokeStyle = 'rgba(255, 51, 68, 0.7)';
      vCtx.lineWidth = 1.5;
      vCtx.beginPath();
      for (let x = 60; x <= 540; x += 4) {
        const entropyVal = 3.8 + Math.sin(x * 0.04 + vTime * 2) * 0.9 + Math.cos(x * 0.1) * 0.4;
        const y = 350 - (entropyVal * 15);
        if (x === 60) vCtx.moveTo(x, y);
        else vCtx.lineTo(x, y);
      }
      vCtx.stroke();

      // Threshold Line (>5.0 bits/byte = packed/encrypted)
      vCtx.strokeStyle = 'rgba(255, 165, 2, 0.5)';
      vCtx.setLineDash([4, 4]);
      vCtx.beginPath();
      vCtx.moveTo(60, 275);
      vCtx.lineTo(540, 275);
      vCtx.stroke();
      vCtx.setLineDash([]);

      vCtx.fillStyle = '#ffa502';
      vCtx.fillText('OBFUSCATION CEILING: 5.0 bits/byte', 65, 268);

      if (entropyEl && Math.random() < 0.05) {
        const currentBits = (4.75 + Math.sin(vTime) * 0.15).toFixed(2);
        entropyEl.textContent = `ENTROPY: ${currentBits} bits/byte (SAFE)`;
      }

      requestAnimationFrame(drawVeriPack);
    }
    requestAnimationFrame(drawVeriPack);
  }

  // B. mac-insomnia Apple Silicon Lid & Assertion Visualizer
  const insomniaCanvas = document.getElementById('canvas-insomnia');
  if (insomniaCanvas) {
    const iCtx = insomniaCanvas.getContext('2d');
    let iTime = 0;

    function drawInsomnia() {
      iTime += 0.04;
      const w = insomniaCanvas.width;
      const h = insomniaCanvas.height;
      iCtx.clearRect(0, 0, w, h);

      // Chassis outline (MacBook Lid in closed state)
      iCtx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      iCtx.fillStyle = '#0a0d14';
      iCtx.lineWidth = 2;
      iCtx.strokeRect(100, 110, 400, 200);
      iCtx.fillRect(100, 110, 400, 200);

      // Apple Silicon SoC Core
      iCtx.strokeStyle = '#ff3344';
      iCtx.fillStyle = 'rgba(255, 51, 68, 0.1)';
      iCtx.strokeRect(250, 160, 100, 100);
      iCtx.fillRect(250, 160, 100, 100);

      iCtx.fillStyle = '#ff3344';
      iCtx.font = '12px "JetBrains Mono", monospace';
      iCtx.fillText('M-SERIES SoC', 260, 205);
      iCtx.fillText('0 MB IDLE RAM', 260, 225);

      // Radiating assertion pulse rings
      const pulseRadius = (iTime * 25) % 90;
      iCtx.beginPath();
      iCtx.arc(300, 210, pulseRadius, 0, Math.PI * 2);
      iCtx.strokeStyle = `rgba(255, 51, 68, ${Math.max(0, 1 - pulseRadius / 90)})`;
      iCtx.lineWidth = 1.5;
      iCtx.stroke();

      // Telemetry Signal Lines
      iCtx.strokeStyle = '#2ed573';
      iCtx.fillStyle = '#2ed573';
      iCtx.font = '11px "JetBrains Mono", monospace';

      // Closed lid indicator
      iCtx.fillText('HINGE SENSOR: CLOSED (0°)', 120, 140);
      iCtx.fillText('IOPMAssertion: PREVENT SLEEP', 120, 160);
      iCtx.fillText('ACTIVE TASKS: LOCAL LLM PIPELINE', 120, 180);

      iCtx.fillStyle = '#ffa502';
      iCtx.fillText('BATTERY: 98% (THRESHOLD >20%)', 120, 280);
      iCtx.fillText('DISPLAY: UNATTACHED (0 W)', 320, 280);

      requestAnimationFrame(drawInsomnia);
    }
    requestAnimationFrame(drawInsomnia);
  }

  // C. mac-lumitrack Interactive Trackpad & Keyboard Matrix Simulator
  const lumitrackCanvas = document.getElementById('canvas-lumitrack');
  if (lumitrackCanvas) {
    const lCtx = lumitrackCanvas.getContext('2d');
    let brightness = 0.74;
    const valEl = document.getElementById('lumitrack-val');
    const statusEl = document.getElementById('lumitrack-status');

    lumitrackCanvas.addEventListener('mousemove', (e) => {
      const rect = lumitrackCanvas.getBoundingClientRect();
      const relativeY = e.clientY - rect.top;
      // Invert so moving upwards increases brightness
      brightness = Math.min(Math.max(1 - (relativeY / rect.height), 0.05), 1.0);
      if (valEl) valEl.textContent = `LUMEN: ${(brightness * 100).toFixed(0)}%`;
      if (statusEl) statusEl.textContent = 'GESTURE: TRACKPAD DRAG DETECTED';
      playMicroClick(500 + brightness * 500, 0.02);
    });

    lumitrackCanvas.addEventListener('mouseleave', () => {
      if (statusEl) statusEl.textContent = 'GESTURE: HOVER OR DRAG ACROSS TRACKPAD';
    });

    function drawLumiTrack() {
      const w = lumitrackCanvas.width;
      const h = lumitrackCanvas.height;
      lCtx.clearRect(0, 0, w, h);

      // Keyboard Backlight Matrix (Top half)
      const rows = 4;
      const cols = 10;
      const keyW = 34;
      const keyH = 24;
      const gap = 6;
      const startX = (w - (cols * (keyW + gap))) / 2;
      const startY = 50;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const kx = startX + c * (keyW + gap);
          const ky = startY + r * (keyH + gap);

          // Glow calculation
          lCtx.fillStyle = `rgba(255, 235, 180, ${brightness * 0.75})`;
          lCtx.shadowColor = 'rgba(255, 210, 130, 0.8)';
          lCtx.shadowBlur = brightness * 16;
          lCtx.fillRect(kx, ky, keyW, keyH);

          lCtx.strokeStyle = `rgba(255, 255, 255, ${0.1 + brightness * 0.4})`;
          lCtx.strokeRect(kx, ky, keyW, keyH);
        }
      }
      lCtx.shadowBlur = 0;

      // Trackpad Touch Surface (Bottom half)
      const tpW = 280;
      const tpH = 120;
      const tpX = (w - tpW) / 2;
      const tpY = 220;

      lCtx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      lCtx.fillStyle = '#0a0d14';
      lCtx.strokeRect(tpX, tpY, tpW, tpH);
      lCtx.fillRect(tpX, tpY, tpW, tpH);

      // Slider feedback indicator
      const sliderY = tpY + (1 - brightness) * tpH;
      lCtx.strokeStyle = '#ffa502';
      lCtx.lineWidth = 2;
      lCtx.beginPath();
      lCtx.moveTo(tpX + 10, sliderY);
      lCtx.lineTo(tpX + tpW - 10, sliderY);
      lCtx.stroke();

      lCtx.fillStyle = '#ffa502';
      lCtx.font = '11px "JetBrains Mono", monospace';
      lCtx.fillText('APPLE COREBRIGHTNESS BUS', tpX + 15, tpY + 25);
      lCtx.fillText(`PWM LUMINANCE: ${(brightness * 100).toFixed(0)}%`, tpX + 15, tpY + 45);

      requestAnimationFrame(drawLumiTrack);
    }
    requestAnimationFrame(drawLumiTrack);
  }

  // D. mac-keyglow Hardware Illumination & Instant Strike Visualizer
  const keyglowCanvas = document.getElementById('canvas-keyglow');
  if (keyglowCanvas) {
    const kCtx = keyglowCanvas.getContext('2d');
    let kTime = 0;
    let strikeVal = 0;

    // Listen to keydown anywhere for Instant Strike!
    window.addEventListener('keydown', () => {
      strikeVal = 1.0;
      playMicroClick(900, 0.03);
    });

    keyglowCanvas.addEventListener('click', () => {
      strikeVal = 1.0;
      playMicroClick(900, 0.03);
    });

    function drawKeyGlow() {
      kTime += 0.05;
      strikeVal *= 0.88; // Fast release decay

      const w = keyglowCanvas.width;
      const h = keyglowCanvas.height;
      kCtx.clearRect(0, 0, w, h);

      // Grid Lines
      kCtx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      for (let y = 50; y < h; y += 40) {
        kCtx.beginPath();
        kCtx.moveTo(40, y);
        kCtx.lineTo(w - 40, y);
        kCtx.stroke();
      }

      // Mathematical Sine Oscillation Wave
      kCtx.beginPath();
      kCtx.strokeStyle = '#70a1ff';
      kCtx.lineWidth = 2;
      for (let x = 40; x < w - 40; x += 3) {
        const wave = Math.sin(x * 0.03 - kTime * 2) * 45;
        const y = 180 + wave;
        if (x === 40) kCtx.moveTo(x, y);
        else kCtx.lineTo(x, y);
      }
      kCtx.stroke();

      // Instant Strike Peak Waveform
      if (strikeVal > 0.02) {
        kCtx.beginPath();
        kCtx.strokeStyle = `rgba(255, 51, 68, ${strikeVal})`;
        kCtx.lineWidth = 3;
        kCtx.shadowColor = '#ff3344';
        kCtx.shadowBlur = strikeVal * 20;

        for (let x = 40; x < w - 40; x += 3) {
          const spike = Math.exp(-Math.pow((x - w / 2) / 40, 2)) * (120 * strikeVal);
          const y = 180 - spike;
          if (x === 40) kCtx.moveTo(x, y);
          else kCtx.lineTo(x, y);
        }
        kCtx.stroke();
        kCtx.shadowBlur = 0;
      }

      // Readout
      kCtx.fillStyle = strikeVal > 0.3 ? '#ff3344' : '#70a1ff';
      kCtx.font = '12px "JetBrains Mono", monospace';
      kCtx.fillText(strikeVal > 0.3 ? 'INSTANT STRIKE: ACTIVE' : 'MODE: 60 FPS MATHEMATICAL WAVE', 50, 65);
      kCtx.fillText(`ENERGY RESISTANCE: < 0.2% CPU`, 50, 85);

      requestAnimationFrame(drawKeyGlow);
    }
    requestAnimationFrame(drawKeyGlow);
  }

  // E. 3-DOF Robotics Kinematics Leg Solver
  const roboticsCanvas = document.getElementById('canvas-robotics');
  if (roboticsCanvas) {
    const rCtx = roboticsCanvas.getContext('2d');
    const ikXSlider = document.getElementById('ik-x');
    const ikYSlider = document.getElementById('ik-y');
    const ikXVal = document.getElementById('ik-x-val');
    const ikYVal = document.getElementById('ik-y-val');

    let reachX = 120;
    let depthY = 90;

    if (ikXSlider) {
      ikXSlider.addEventListener('input', (e) => {
        reachX = parseFloat(e.target.value);
        if (ikXVal) ikXVal.textContent = `${reachX} mm`;
        playMicroClick(300 + reachX * 2, 0.015);
      });
    }

    if (ikYSlider) {
      ikYSlider.addEventListener('input', (e) => {
        depthY = parseFloat(e.target.value);
        if (ikYVal) ikYVal.textContent = `${depthY} mm`;
        playMicroClick(300 + depthY * 2, 0.015);
      });
    }

    function solve2DJoints(targetX, targetY, l1, l2) {
      const dist = Math.hypot(targetX, targetY);
      const clampedDist = Math.min(Math.max(dist, 10), l1 + l2 - 2);

      // Law of cosines
      const cosAngle2 = (clampedDist * clampedDist - l1 * l1 - l2 * l2) / (2 * l1 * l2);
      const angle2 = Math.acos(Math.max(-1, Math.min(1, cosAngle2)));

      const beta = Math.atan2(targetY, targetX);
      const alpha = Math.asin((l2 * Math.sin(angle2)) / clampedDist);
      const angle1 = beta - alpha;

      return { theta1: angle1, theta2: angle2 };
    }

    function drawRobotics() {
      const w = roboticsCanvas.width;
      const h = roboticsCanvas.height;
      rCtx.clearRect(0, 0, w, h);

      const originX = 140;
      const originY = 160;
      const l1 = 90;
      const l2 = 100;

      const angles = solve2DJoints(reachX, depthY, l1, l2);

      // Joint 1 (Coxa-Femur)
      const j1X = originX + l1 * Math.cos(angles.theta1);
      const j1Y = originY + l1 * Math.sin(angles.theta1);

      // Joint 2 (Femur-Tibia Foot)
      const footX = j1X + l2 * Math.cos(angles.theta1 + angles.theta2);
      const footY = j1Y + l2 * Math.sin(angles.theta1 + angles.theta2);

      // Ground plane
      rCtx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      rCtx.setLineDash([6, 6]);
      rCtx.beginPath();
      rCtx.moveTo(40, originY + 120);
      rCtx.lineTo(w - 40, originY + 120);
      rCtx.stroke();
      rCtx.setLineDash([]);
      rCtx.fillStyle = '#5a6272';
      rCtx.font = '10px "JetBrains Mono", monospace';
      rCtx.fillText('GROUND CONTACT PLANE', 50, originY + 135);

      // Link 1 (Femur)
      rCtx.strokeStyle = '#ffa502';
      rCtx.lineWidth = 6;
      rCtx.lineCap = 'round';
      rCtx.beginPath();
      rCtx.moveTo(originX, originY);
      rCtx.lineTo(j1X, j1Y);
      rCtx.stroke();

      // Link 2 (Tibia)
      rCtx.strokeStyle = '#ff3344';
      rCtx.lineWidth = 5;
      rCtx.beginPath();
      rCtx.moveTo(j1X, j1Y);
      rCtx.lineTo(footX, footY);
      rCtx.stroke();

      // Joint nodes
      const joints = [
        { x: originX, y: originY, label: 'J0 (BASE)' },
        { x: j1X, y: j1Y, label: 'J1 (SERVO)' },
        { x: footX, y: footY, label: 'FOOT CONTACT' }
      ];

      joints.forEach((j, i) => {
        rCtx.beginPath();
        rCtx.arc(j.x, j.y, 7, 0, Math.PI * 2);
        rCtx.fillStyle = '#f4f6fa';
        rCtx.fill();
        rCtx.strokeStyle = '#07080a';
        rCtx.lineWidth = 2;
        rCtx.stroke();

        rCtx.fillStyle = '#8e95a5';
        rCtx.font = '10px "JetBrains Mono", monospace';
        rCtx.fillText(j.label, j.x + 12, j.y + 4);
      });

      // Kinematic angles text
      rCtx.fillStyle = '#2ed573';
      rCtx.font = '11px "JetBrains Mono", monospace';
      const deg1 = (angles.theta1 * (180 / Math.PI)).toFixed(1);
      const deg2 = (angles.theta2 * (180 / Math.PI)).toFixed(1);
      rCtx.fillText(`θ1 (FEMUR): ${deg1}°`, 360, 80);
      rCtx.fillText(`θ2 (TIBIA): ${deg2}°`, 360, 105);
      rCtx.fillText(`TARGET: (${reachX}mm, ${depthY}mm)`, 360, 130);

      requestAnimationFrame(drawRobotics);
    }
    requestAnimationFrame(drawRobotics);
  }

  // ---------------------------------------------------------------------------
  // 8. TECHNICAL SPECIFICATIONS SLIDE-OUT DRAWER
  // ---------------------------------------------------------------------------
  const technicalDrawer = document.getElementById('technical-drawer');
  const drawerContent = document.getElementById('drawer-content');
  const drawerCloseBtn = document.getElementById('drawer-close-btn');
  const drawerBackdrop = document.getElementById('drawer-backdrop');
  const inspectBtns = document.querySelectorAll('.inspect-drawer-btn');

  const projectSpecs = {
    veripack: {
      id: 'SPECIFICATION SHEET // 01',
      title: 'VeriPack (pratyancha)',
      subtitle: 'Software Supply-Chain Provenance & Tarball Integrity Verifier',
      html: `
        <div class="drawer-project-header">
          <h2 class="drawer-project-title">VeriPack (pratyancha)</h2>
          <p class="drawer-project-tagline mono">Hack Day Sonipat &bull; Problem Statement 04 &bull; 42/42 Tests Passing</p>
        </div>

        <div>
          <span class="drawer-section-title">01 // THE ATTACK SURFACE &amp; MOTIVATION</span>
          <p style="color: var(--text-muted); line-height: 1.6; font-size: 0.95rem;">
            Package registries like npm and PyPI accept pre-built archives that can diverge silently from public git repositories.
            Malicious actors exploit this gap to inject install-time telemetry hooks, hidden binary payloads, and lifecycle scripts 
            into release tarballs while maintaining a spotless public source tree.
          </p>
        </div>

        <div>
          <span class="drawer-section-title">02 // ARCHITECTURAL DEFENSE SPECIFICATION</span>
          <table class="spec-matrix-table">
            <thead>
              <tr>
                <th>Vulnerability Vector</th>
                <th>Deterministic Defense Mechanism</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Zip-Slip (CVE-2018-1002204)</strong></td>
                <td><code>Path.resolve()</code> boundary traversal rejection + 500 MB decompression ceiling</td>
                <td><span class="badge-pill badge-green mono">PASS (42/42)</span></td>
              </tr>
              <tr>
                <td><strong>AST Capability Escalations</strong></td>
                <td>Inspects dangerous primitives: <code>child_process</code>, <code>socket</code>, <code>fs.chmod</code>, <code>dlopen</code></td>
                <td><span class="badge-pill badge-green mono">ISOLATED</span></td>
              </tr>
              <tr>
                <td><strong>Shannon Entropy Obfuscation</strong></td>
                <td>Byte-level frequency analysis detecting packed payloads (>5.0 bits/byte threshold)</td>
                <td><span class="badge-pill badge-green mono">CONTAINED</span></td>
              </tr>
              <tr>
                <td><strong>Trojan Source (CVE-2021-42574)</strong></td>
                <td>Unicode bidirectional control character parsing and zero-width token isolation</td>
                <td><span class="badge-pill badge-green mono">NEUTRALIZED</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div>
          <span class="drawer-section-title">03 // CORE EXTRACTION DEFENSE IMPLEMENTATION</span>
          <pre class="spec-code-block"><code>def safe_extract_tarball(tar_stream, destination_root: Path):
    """
    Enforces strict Zip-Slip boundary containment and cumulative size guards.
    """
    MAX_CUMULATIVE_BYTES = 500 * 1024 * 1024  # 500 MB ceiling
    cumulative_size = 0

    with tarfile.open(fileobj=tar_stream, mode="r:*") as archive:
        for member in archive.getmembers():
            target_path = (destination_root / member.name).resolve()
            if not target_path.is_relative_to(destination_root.resolve()):
                raise SecurityBoundaryError(f"Zip-Slip attempt detected: {member.name}")

            cumulative_size += member.size
            if cumulative_size > MAX_CUMULATIVE_BYTES:
                raise DecompressionBombError("Archive exceeded 500MB safety explosion ceiling")

            archive.extract(member, path=destination_root)</code></pre>
        </div>

        <div>
          <span class="drawer-section-title">04 // VERIFIED ARTIFACT ACCESS</span>
          <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
            <a href="https://github.com/anant-rajj/pratyancha-hacktoberfest" target="_blank" rel="noopener noreferrer" class="btn btn-crimson">
              <span>GITHUB REPOSITORY ↗</span>
            </a>
            <a href="https://anant-rajj.github.io/pratyancha-hacktoberfest/" target="_blank" rel="noopener noreferrer" class="btn btn-ghost">
              <span>LIVE DASHBOARD ↗</span>
            </a>
          </div>
        </div>
      `
    },
    insomnia: {
      id: 'SPECIFICATION SHEET // 02',
      title: 'mac-insomnia',
      subtitle: 'Zero-Bloat Native Apple Silicon Stay-Awake Execution Engine',
      html: `
        <div class="drawer-project-header">
          <h2 class="drawer-project-title">mac-insomnia</h2>
          <p class="drawer-project-tagline mono">Native macOS CLI &bull; Low-Level IOKit Assertions &bull; Apple Silicon M-Series</p>
        </div>

        <div>
          <span class="drawer-section-title">01 // THE RESOURCE CONSTRAINTS</span>
          <p style="color: var(--text-muted); line-height: 1.6; font-size: 0.95rem;">
            Common stay-awake utilities consume 50–100 MB of resident RAM and keep entire WebKit/Electron or SwiftUI runtimes active. 
            mac-insomnia was built for systems researchers and developers who need MacBooks to run local LLMs (Ollama, llama.cpp), 
            long compilations, and autonomous agent loops with the laptop lid closed without external displays.
          </p>
        </div>

        <div>
          <span class="drawer-section-title">02 // LOW-LEVEL IOKit HARNESS</span>
          <pre class="spec-code-block"><code>// Low-overhead IOPMAssertion invocation in pure C / Swift
#include &lt;IOKit/pwr_mgt/IOPMLib.h&gt;

IOPMAssertionID assertionID = kIOPMNullAssertionID;
CFStringRef reasonForActivity = CFSTR("mac-insomnia: AI Agent Autonomous Execution");

IOReturn success = IOPMAssertionCreateWithName(
    kIOPMAssertionTypePreventUserIdleSystemSleep,
    kIOPMAssertionLevelOn,
    reasonForActivity,
    &assertionID
);

if (success == kIOReturnSuccess) {
    // Assert battery cutoff threshold >20% to prevent deep discharge
    monitor_battery_threshold_and_yield(&assertionID);
}</code></pre>
        </div>

        <div>
          <span class="drawer-section-title">03 // MEASURED RESOURCE PROFILE</span>
          <table class="spec-matrix-table">
            <tr>
              <th>Metric</th>
              <th>mac-insomnia</th>
              <th>Standard Electron GUI Alternative</th>
            </tr>
            <tr>
              <td>Disk Binary Size</td>
              <td class="text-green mono">~24 KB</td>
              <td class="text-dim mono">185 MB</td>
            </tr>
            <tr>
              <td>Active RAM Footprint</td>
              <td class="text-green mono">&lt; 8 MB</td>
              <td class="text-dim mono">92 MB</td>
            </tr>
            <tr>
              <td>Idle Resident RAM</td>
              <td class="text-green mono">0 MB (On-Demand CLI)</td>
              <td class="text-dim mono">64 MB continuous daemon</td>
            </tr>
          </table>
        </div>

        <div>
          <a href="https://github.com/anant-rajj/mac-insomnia" target="_blank" rel="noopener noreferrer" class="btn btn-crimson">
            <span>INSPECT ON GITHUB ↗</span>
          </a>
        </div>
      `
    },
    lumitrack: {
      id: 'SPECIFICATION SHEET // 03',
      title: 'mac-lumitrack',
      subtitle: 'Hardware Keyboard Backlight Daemon via Multitouch Gesture',
      html: `
        <div class="drawer-project-header">
          <h2 class="drawer-project-title">mac-lumitrack</h2>
          <p class="drawer-project-tagline mono">Native C / Objective-C &bull; MultitouchSupport &bull; CoreBrightness</p>
        </div>

        <div>
          <span class="drawer-section-title">01 // ZERO-DEPENDENCY MAKEFILE ARCHITECTURE</span>
          <p style="color: var(--text-muted); line-height: 1.6; font-size: 0.95rem;">
            Built with pure C and Objective-C without Xcode bundles or Swift runtime overhead. 
            Connects to Apple's private MultitouchSupport and CoreBrightness frameworks to dynamically translate 
            Command or Fn + multi-finger trackpad slides into smooth hardware luminance adjustments.
          </p>
        </div>

        <div>
          <span class="drawer-section-title">02 // TECHNICAL PROFILE</span>
          <table class="spec-matrix-table">
            <tr><td>Binary Size</td><td class="mono text-green">~50 KB</td></tr>
            <tr><td>Resident Memory (RSS)</td><td class="mono text-green">~3.5 MB</td></tr>
            <tr><td>Idle CPU Utilization</td><td class="mono text-green">0.0% (Event-driven taps)</td></tr>
            <tr><td>Private Frameworks</td><td class="mono">MultitouchSupport, CoreBrightness</td></tr>
          </table>
        </div>

        <div>
          <a href="https://github.com/anant-rajj/mac-lumitrack" target="_blank" rel="noopener noreferrer" class="btn btn-crimson">
            <span>INSPECT ON GITHUB ↗</span>
          </a>
        </div>
      `
    },
    keyglow: {
      id: 'SPECIFICATION SHEET // 04',
      title: 'mac-keyglow',
      subtitle: 'Mathematical Illumination Engine & Instant Key Strike',
      html: `
        <div class="drawer-project-header">
          <h2 class="drawer-project-title">mac-keyglow</h2>
          <p class="drawer-project-tagline mono">Native Swift &bull; Mathematical Waveform Oscillator &bull; Instant Strike Hook</p>
        </div>

        <div>
          <span class="drawer-section-title">01 // INSTANT STRIKE MECHANISM</span>
          <p style="color: var(--text-muted); line-height: 1.6; font-size: 0.95rem;">
            Captures global key events using a low-overhead CGEventTap monitor. 
            On keydown, triggers an instant luminance spike (0.0ms delay) that snaps down upon key release.
            Also includes hardware-timed wave generators (sine, triangle, exponential) running at 45–60 FPS with &lt; 0.2% CPU overhead.
          </p>
        </div>

        <div>
          <span class="drawer-section-title">02 // MATHEMATICAL WAVE EQUATIONS</span>
          <pre class="spec-code-block"><code>// Mathematical Illumination Equations running on 60 FPS clock
func computeWaveLuminance(t: Double, mode: WaveMode) -> Float {
    switch mode {
    case .sine:
        return Float((sin(t * frequency) + 1.0) / 2.0)
    case .exponentialPulse:
        let phase = fmod(t, period) / period
        return Float(exp(-phase * decayRate))
    case .instantStrike:
        return isKeyDepressed ? 1.0 : 0.0
    }
}</code></pre>
        </div>

        <div>
          <a href="https://github.com/anant-rajj/mac-keyglow" target="_blank" rel="noopener noreferrer" class="btn btn-crimson">
            <span>INSPECT ON GITHUB ↗</span>
          </a>
        </div>
      `
    }
  };

  function openDrawer(projectId) {
    const spec = projectSpecs[projectId];
    if (!spec || !technicalDrawer || !drawerContent) return;

    const specIdEl = document.getElementById('drawer-spec-id');
    if (specIdEl) specIdEl.textContent = spec.id;

    drawerContent.innerHTML = spec.html;
    technicalDrawer.classList.add('is-open');
    technicalDrawer.setAttribute('aria-hidden', 'false');
    state.isDrawerOpen = true;
    playMicroClick(780, 0.04);
  }

  function closeDrawer() {
    if (!technicalDrawer) return;
    technicalDrawer.classList.remove('is-open');
    technicalDrawer.setAttribute('aria-hidden', 'true');
    state.isDrawerOpen = false;
    playMicroClick(380, 0.03);
  }

  inspectBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const p = btn.getAttribute('data-project');
      if (p) openDrawer(p);
    });
  });

  if (drawerCloseBtn) drawerCloseBtn.addEventListener('click', closeDrawer);
  if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeDrawer);

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (state.isDrawerOpen) closeDrawer();
      if (navDrawer && navDrawer.classList.contains('is-open')) closeNav();
    }
  });

  // ---------------------------------------------------------------------------
  // 9. COPY EMAIL DISPATCH & AENGEL.IO TRANSMISSION TERMINAL ENGINE
  // ---------------------------------------------------------------------------
  const copyBtn = document.getElementById('copy-email-btn');
  const copyText = document.getElementById('copy-text');

  if (copyBtn && copyText) {
    copyBtn.addEventListener('click', () => {
      const email = copyBtn.getAttribute('data-email') || 'anantraj.clcs@gmail.com';
      navigator.clipboard.writeText(email).then(() => {
        copyText.textContent = 'COPIED TO CLIPBOARD ✓';
        playMicroClick(1000, 0.06);
        setTimeout(() => {
          copyText.textContent = 'COPY ADDRESS';
        }, 2500);
      }).catch(() => {
        window.location.href = `mailto:${email}`;
      });
    });
  }

  // Live Local Clock in IST (UTC+5:30)
  const headerClock = document.getElementById('header-local-clock');
  const contactClock = document.getElementById('contact-live-clock');
  const previewTimestamp = document.getElementById('preview-timestamp');

  function updateLiveClocks() {
    const now = new Date();
    // Format in IST (UTC+5:30)
    const options = {
      timeZone: 'Asia/Kolkata',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    };
    const timeStr = now.toLocaleTimeString('en-GB', options) + ' IST';
    const dateStr = now.toISOString().split('T')[0];

    if (headerClock) headerClock.textContent = timeStr;
    if (contactClock) contactClock.textContent = timeStr;
    if (previewTimestamp) previewTimestamp.textContent = `${dateStr} ${timeStr}`;
  }
  setInterval(updateLiveClocks, 1000);
  updateLiveClocks();

  // Transmission Terminal Form & Live Packet Compiler
  const senderNameInput = document.getElementById('sender-name');
  const senderEmailInput = document.getElementById('sender-email');
  const senderMessageInput = document.getElementById('sender-message');
  const byteCounter = document.getElementById('byte-counter');
  const previewSender = document.getElementById('preview-sender');
  const previewEmail = document.getElementById('preview-email');
  const previewDomain = document.getElementById('preview-domain');
  const previewPayload = document.getElementById('preview-payload');
  const previewHash = document.getElementById('preview-hash');
  const domainPills = document.querySelectorAll('.domain-pill');

  let activeDomain = 'Low-Level Systems & macOS';

  domainPills.forEach(pill => {
    pill.addEventListener('click', () => {
      domainPills.forEach(p => p.classList.remove('is-active'));
      pill.classList.add('is-active');
      activeDomain = pill.getAttribute('data-domain') || 'Low-Level Systems & macOS';
      updatePacketPreview();
      playMicroClick(650, 0.03);
    });
  });

  function updatePacketPreview() {
    const name = (senderNameInput && senderNameInput.value.trim()) || '<Awaiting Identity>';
    const email = (senderEmailInput && senderEmailInput.value.trim()) || '<Awaiting Frequency>';
    const msg = (senderMessageInput && senderMessageInput.value) || '';
    const byteLen = new Blob([msg]).size;

    if (byteCounter) byteCounter.textContent = `${byteLen} BYTES`;
    if (previewSender) previewSender.textContent = name;
    if (previewEmail) previewEmail.textContent = email;
    if (previewDomain) previewDomain.textContent = activeDomain;

    if (previewPayload) {
      if (msg.trim().length > 0) {
        previewPayload.textContent = msg;
        previewPayload.classList.remove('text-muted');
      } else {
        previewPayload.textContent = '<Awaiting transmission payload... Type into the console to compile in real-time>';
        previewPayload.classList.add('text-muted');
      }
    }

    // Dynamic hash calculation for authenticity
    let hash = 0x811c9dc5;
    const str = `${name}|${email}|${activeDomain}|${msg}`;
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193);
    }
    const hexHash = '0x' + (hash >>> 0).toString(16).toUpperCase().padStart(8, '0');
    if (previewHash) previewHash.textContent = hexHash;
  }

  [senderNameInput, senderEmailInput, senderMessageInput].forEach(input => {
    if (input) {
      input.addEventListener('input', updatePacketPreview);
    }
  });

  // Transmit Action (Mailto trigger)
  const transmitBtn = document.getElementById('transmit-btn');
  if (transmitBtn) {
    transmitBtn.addEventListener('click', () => {
      const name = (senderNameInput && senderNameInput.value.trim()) || 'Collaborator';
      const email = (senderEmailInput && senderEmailInput.value.trim()) || '';
      const msg = (senderMessageInput && senderMessageInput.value.trim()) || 'Hello Anant, I would like to discuss a systems collaboration.';
      const subject = encodeURIComponent(`[Transmission: ${activeDomain}] From ${name}`);
      const body = encodeURIComponent(
`DISPATCH METADATA:
SENDER: ${name}
RETURN ADDRESS: ${email}
DOMAIN: ${activeDomain}
TIMESTAMP: ${new Date().toISOString()}

TRANSMISSION PAYLOAD:
${msg}
`
      );
      playMicroClick(1100, 0.08);
      window.location.href = `mailto:anantraj.clcs@gmail.com?subject=${subject}&body=${body}`;
    });
  }

  // Copy Compiled Packet
  const copyPacketBtn = document.getElementById('copy-packet-btn');
  if (copyPacketBtn) {
    copyPacketBtn.addEventListener('click', () => {
      const name = (senderNameInput && senderNameInput.value.trim()) || 'Unknown';
      const email = (senderEmailInput && senderEmailInput.value.trim()) || 'None';
      const msg = (senderMessageInput && senderMessageInput.value.trim()) || '(No message)';
      const packetText = 
`// DISPATCH PACKET [COMPILED STREAM]
TARGET: Anant Raj <anantraj.clcs@gmail.com>
SENDER: ${name} <${email}>
DOMAIN: ${activeDomain}
TIMESTAMP: ${new Date().toLocaleString()}
------------------------------------------------------------
${msg}
------------------------------------------------------------
[END PACKET]`;

      navigator.clipboard.writeText(packetText).then(() => {
        const span = copyPacketBtn.querySelector('span');
        const oldText = span ? span.textContent : 'COPY COMPILED PACKET';
        if (span) span.textContent = 'PACKET COPIED ✓';
        playMicroClick(1200, 0.06);
        setTimeout(() => {
          if (span) span.textContent = oldText;
        }, 2500);
      });
    });
  }

  // Reset Console
  const resetFormBtn = document.getElementById('reset-form-btn');
  if (resetFormBtn) {
    resetFormBtn.addEventListener('click', () => {
      setTimeout(updatePacketPreview, 50);
      playMicroClick(350, 0.03);
    });
  }

})();
