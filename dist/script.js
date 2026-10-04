(() => {
  const root = document.documentElement;
  const header = document.querySelector('[data-header]');
  const toggle = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('[data-nav]');
  const label = toggle?.querySelector('.sr-only');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Mobile menu
  const closeMenu = () => {
    toggle?.setAttribute('aria-expanded', 'false');
    if (label) label.textContent = 'Open navigation';
    nav?.classList.remove('open');
    document.body.classList.remove('menu-open');
  };
  toggle?.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    if (label) label.textContent = open ? 'Close navigation' : 'Open navigation';
    nav?.classList.toggle('open', open);
    document.body.classList.toggle('menu-open', open);
  });
  nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  window.addEventListener('keydown', event => {
    if (event.key === 'Escape' && nav?.classList.contains('open')) { closeMenu(); toggle?.focus(); }
  });

  // Header scroll state
  const updateHeader = () => header?.classList.toggle('scrolled', window.scrollY > 16);
  updateHeader(); window.addEventListener('scroll', updateHeader, { passive: true });

  // Reveal animations
  const items = document.querySelectorAll('[data-reveal]');
  if (reduced || !('IntersectionObserver' in window)) items.forEach(item => item.classList.add('revealed'));
  else {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('revealed'); observer.unobserve(entry.target); }
    }), { threshold: .14, rootMargin: '0px 0px -40px' });
    items.forEach(item => observer.observe(item));
  }

  // Dynamic Year
  const year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());

  // Copy toast notification
  const toast = document.getElementById('copy-toast');
  let toastTimer;
  const showToast = (msg = 'Copied to clipboard!') => {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
  };

  // ==========================================
  // CERTIFICATE GENERATOR ENGINE
  // ==========================================
  const certNameInput = document.getElementById('cert-name');
  const certAwardSelect = document.getElementById('cert-award');
  const certCustomAward = document.getElementById('cert-custom-award');
  const certReasonInput = document.getElementById('cert-reason');
  const certPresenterInput = document.getElementById('cert-presenter');
  const certDateInput = document.getElementById('cert-date');
  const themeBtns = document.querySelectorAll('.theme-btn');
  const certFrame = document.getElementById('printable-certificate');
  const printBtn = document.getElementById('cert-print-btn');
  const downloadBtn = document.getElementById('cert-download-btn');

  const previewName = document.getElementById('preview-name');
  const previewAward = document.getElementById('preview-award');
  const previewReason = document.getElementById('preview-reason');
  const previewPresenter = document.getElementById('preview-presenter');
  const previewDate = document.getElementById('preview-date');

  const updateCertificate = () => {
    if (previewName && certNameInput) {
      previewName.textContent = certNameInput.value.trim() || 'Student Name';
    }
    if (previewAward && certAwardSelect) {
      if (certAwardSelect.value === 'custom') {
        previewAward.textContent = (certCustomAward?.value || '').trim() || 'Custom Award of Excellence';
      } else {
        previewAward.textContent = certAwardSelect.value;
      }
    }
    if (previewReason && certReasonInput) {
      previewReason.textContent = certReasonInput.value.trim() || 'For exceptional dedication to reading comprehension, literacy growth, and academic effort.';
    }
    if (previewPresenter && certPresenterInput) {
      previewPresenter.textContent = certPresenterInput.value.trim() || 'Educator / Parent';
    }
    if (previewDate && certDateInput) {
      previewDate.textContent = certDateInput.value.trim() || 'Term 4, 2026';
    }
  };

  [certNameInput, certReasonInput, certPresenterInput, certDateInput, certCustomAward].forEach(input => {
    input?.addEventListener('input', updateCertificate);
  });

  certAwardSelect?.addEventListener('change', () => {
    if (certCustomAward) {
      certCustomAward.style.display = certAwardSelect.value === 'custom' ? 'block' : 'none';
      if (certAwardSelect.value === 'custom') certCustomAward.focus();
    }
    updateCertificate();
  });

  themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      themeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const theme = btn.getAttribute('data-theme');
      if (certFrame) {
        certFrame.className = `cert-frame theme-${theme}`;
      }
    });
  });

  printBtn?.addEventListener('click', () => {
    window.print();
  });

  // High-Resolution PNG Canvas Generator
  downloadBtn?.addEventListener('click', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1920;
    canvas.height = 1357; // A4 Landscape ratio
    const ctx = canvas.getContext('2d');

    const theme = document.querySelector('.theme-btn.active')?.getAttribute('data-theme') || 'gold';
    let primaryColor = '#13233f';
    let accentColor = '#f7c948';
    let subColor = '#1d4ed8';

    if (theme === 'emerald') {
      primaryColor = '#064e3b';
      accentColor = '#10b981';
      subColor = '#047857';
    } else if (theme === 'crimson') {
      primaryColor = '#881337';
      accentColor = '#f43f5e';
      subColor = '#be123c';
    }

    // Background
    ctx.fillStyle = '#fffdfa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Outer Borders
    ctx.lineWidth = 32;
    ctx.strokeStyle = primaryColor;
    ctx.strokeRect(32, 32, canvas.width - 64, canvas.height - 64);

    ctx.lineWidth = 14;
    ctx.strokeStyle = accentColor;
    ctx.strokeRect(60, 60, canvas.width - 120, canvas.height - 120);

    // Inner Dashed Line
    ctx.lineWidth = 3;
    ctx.setLineDash([12, 12]);
    ctx.strokeStyle = '#d1d5db';
    ctx.strokeRect(90, 90, canvas.width - 180, canvas.height - 180);
    ctx.setLineDash([]);

    // Typography
    ctx.textAlign = 'center';
    ctx.fillStyle = '#64748b';
    ctx.font = '900 24px Inter, sans-serif';
    ctx.fillText('CUTECH AUSTRALIA • READINGWILLOW INITIATIVE', canvas.width / 2, 210);

    ctx.fillStyle = primaryColor;
    ctx.font = '900 68px Inter, sans-serif';
    ctx.fillText('Certificate of Achievement', canvas.width / 2, 300);

    ctx.fillStyle = '#64748b';
    ctx.font = '800 24px Inter, sans-serif';
    ctx.fillText('THIS OFFICIAL CITATION IS PROUDLY PRESENTED TO', canvas.width / 2, 370);

    // Recipient Name
    ctx.fillStyle = subColor;
    ctx.font = 'italic 900 84px Georgia, serif';
    const student = (certNameInput?.value || 'Alex Johnson').trim();
    ctx.fillText(student, canvas.width / 2, 490);

    // Name underline
    ctx.lineWidth = 6;
    ctx.strokeStyle = accentColor;
    const nameWidth = ctx.measureText(student).width;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - nameWidth / 2 - 20, 520);
    ctx.lineTo(canvas.width / 2 + nameWidth / 2 + 20, 520);
    ctx.stroke();

    ctx.fillStyle = '#64748b';
    ctx.font = '800 22px Inter, sans-serif';
    ctx.fillText('IN RECOGNITION OF', canvas.width / 2, 590);

    // Award Title
    let awardTitle = certAwardSelect?.value || 'Excellence in Reading & Comprehension';
    if (awardTitle === 'custom') awardTitle = certCustomAward?.value || 'Custom Award';
    ctx.fillStyle = '#13233f';
    ctx.font = '900 52px Inter, sans-serif';
    ctx.fillText(awardTitle, canvas.width / 2, 670);

    // Reason Text
    ctx.fillStyle = '#475569';
    ctx.font = 'italic 500 28px Inter, sans-serif';
    const reasonText = (certReasonInput?.value || 'For exceptional dedication to reading comprehension, literacy growth, and academic effort.').trim();
    ctx.fillText(reasonText, canvas.width / 2, 750);

    // Signatures & Date
    const leftX = 350;
    const rightX = canvas.width - 350;
    const sigY = 1040;

    // Left Sig
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#13233f';
    ctx.beginPath();
    ctx.moveTo(leftX - 160, sigY);
    ctx.lineTo(leftX + 160, sigY);
    ctx.stroke();

    ctx.fillStyle = '#13233f';
    ctx.font = '800 28px Inter, sans-serif';
    ctx.fillText((certPresenterInput?.value || 'Ms. E. Harrison').trim(), leftX, sigY + 45);
    ctx.fillStyle = '#64748b';
    ctx.font = '700 20px Inter, sans-serif';
    ctx.fillText('PRESENTER / EDUCATOR', leftX, sigY + 80);

    // Right Sig (Date)
    ctx.beginPath();
    ctx.moveTo(rightX - 160, sigY);
    ctx.lineTo(rightX + 160, sigY);
    ctx.stroke();

    ctx.fillStyle = '#13233f';
    ctx.font = '800 28px Inter, sans-serif';
    ctx.fillText((certDateInput?.value || 'Term 4, 2026').trim(), rightX, sigY + 45);
    ctx.fillStyle = '#64748b';
    ctx.font = '700 20px Inter, sans-serif';
    ctx.fillText('DATE OF PRESENTATION', rightX, sigY + 80);

    // Center Seal
    const sealX = canvas.width / 2;
    const sealY = 1020;
    ctx.beginPath();
    ctx.arc(sealX, sealY, 95, 0, Math.PI * 2);
    ctx.fillStyle = accentColor;
    ctx.fill();
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    ctx.fillStyle = theme === 'gold' ? '#13233f' : '#ffffff';
    ctx.font = '900 50px Inter, sans-serif';
    ctx.fillText('★', sealX, sealY - 10);
    ctx.font = '900 22px Inter, sans-serif';
    ctx.fillText('EXCELLENCE', sealX, sealY + 25);
    ctx.font = '800 18px Inter, sans-serif';
    ctx.fillText('CUTECH', sealX, sealY + 50);

    // Watermark
    ctx.fillStyle = '#9ca3af';
    ctx.font = '700 20px Inter, sans-serif';
    ctx.fillText('Presented through Cutech Pty Ltd • ReadingWillow.com', canvas.width / 2, 1260);

    // Trigger Download
    const link = document.createElement('a');
    link.download = `Certificate-${student.replace(/\s+/g, '_')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    showToast('Certificate PNG downloaded!');
  });

  requestAnimationFrame(() => root.classList.add('is-ready'));
})();
