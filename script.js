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

  const copyToClipboard = text => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(() => showToast());
    } else {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast();
    }
  };

  // Click-to-copy for verb pills
  document.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', () => {
      const word = btn.getAttribute('data-copy');
      if (word) copyToClipboard(word);
    });
  });

  // ==========================================
  // LITERARY TECHNIQUE & QUOTE ANALYZER ENGINE
  // ==========================================
  const samples = {
    macbeth: "Life's but a walking shadow, a poor player that struts and frets his hour upon the stage, and then is heard no more.",
    poetry: "And the bush hath friends to meet him, and their kindly voices greet him In the murmur of the breezes and the river on its bars.",
    dystopian: "War is peace. Freedom is slavery. Ignorance is strength. Big Brother is watching you.",
    speech: "The silence of good people is more dangerous than the brutality of bad people. Shall we stand motionless, or shall we rise?"
  };

  const textarea = document.getElementById('quote-input');
  const textStats = document.getElementById('text-stats');
  const analyzeBtn = document.getElementById('analyze-btn');
  const clearBtn = document.getElementById('clear-btn');
  const chips = document.querySelectorAll('.chip-btn');
  const techniquesOutput = document.getElementById('techniques-output');
  const sentencesOutput = document.getElementById('sentences-output');
  const devicesCount = document.getElementById('devices-count');

  const updateStats = text => {
    if (!textStats) return;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    textStats.textContent = `${words} word${words === 1 ? '' : 's'} • ${chars} char${chars === 1 ? '' : 's'}`;
  };

  const analyzeText = input => {
    const text = (input || '').trim();
    if (!text) {
      if (techniquesOutput) techniquesOutput.innerHTML = '<p class="tech-desc" style="padding:10px 0;">Paste or type a quote above to detect literary techniques.</p>';
      if (sentencesOutput) sentencesOutput.innerHTML = '<p class="tech-desc" style="padding:10px 0;">Analytical sentence starters will appear here.</p>';
      if (devicesCount) devicesCount.textContent = '0 found';
      return;
    }

    const detected = [];
    const lower = text.toLowerCase();

    // 1. Simile
    const simileMatch = text.match(/\b(like|as\s+\w+\s+as)\s+([a-zA-Z0-9\s,']+)/i);
    if (/\b(like\s+(?:a|an|the|\w+)|as\s+\w+\s+as)\b/i.test(text)) {
      detected.push({
        name: 'Simile',
        type: 'Figurative Language',
        desc: 'Direct comparison using "like" or "as" to evoke vivid sensory associations.',
        example: simileMatch ? simileMatch[0].trim() : 'Comparative phrase detected',
        verb: 'illuminates',
        effect: 'draws a direct comparison that heightens the emotional resonance for the reader'
      });
    }

    // 2. Metaphor
    if (/\b(is|are|was|were)\s+(?:a|an|the)?\s*([a-z]+(?:\s+[a-z]+)?)\b/i.test(text) || /\b(shadow|cage|sea|fire|cloak|prison|veil|mirror|storm|abyss|mask|tapestry)\b/i.test(text)) {
      const isMetaphor = !/\b(like|as)\b/i.test(text);
      if (isMetaphor) {
        detected.push({
          name: 'Metaphor / Symbolic Imagery',
          type: 'Figurative Language',
          desc: 'Implied comparison that equates one concept with another to convey deeper conceptual meaning.',
          example: 'Equates figurative concepts without comparative qualifiers',
          verb: 'encapsulates',
          effect: 'creates a symbolic parallel that enriches thematic depth and audience interpretation'
        });
      }
    }

    // 3. Personification
    if (/\b(wind|breeze|shadow|night|sun|flame|fire|silence|death|time|river|bush|city|heart|trees)\b.*?\b(whisper|creep|dance|swallow|greet|laugh|mourn|scream|weep|bleed|breath|speak|march|watch|stare)/i.test(text) ||
        /\b(walking shadow|struts and frets|voices greet|river on its bars|watching you)\b/i.test(text)) {
      detected.push({
        name: 'Personification / Anthropomorphism',
        type: 'Figurative Language',
        desc: 'Attributing human qualities, emotions, or actions to inanimate objects or abstract ideas.',
        example: 'Endows inanimate elements with human agency or emotion',
        verb: 'breathes life into',
        effect: 'imbues non-human entities with agency, intensifying emotional proximity and tension'
      });
    }

    // 4. Juxtaposition / Paradox / Contrast
    const contrastPairs = [
      ['war', 'peace'], ['freedom', 'slavery'], ['ignorance', 'strength'],
      ['light', 'dark'], ['life', 'death'], ['silence', 'sound'], ['good', 'bad'],
      ['rich', 'poor'], ['fire', 'ice'], ['hope', 'despair'], ['heaven', 'hell']
    ];
    let foundContrast = false;
    for (const [w1, w2] of contrastPairs) {
      if (lower.includes(w1) && lower.includes(w2)) {
        foundContrast = true;
        break;
      }
    }
    if (foundContrast || /\b(however|yet|while|in contrast|contrary|opposed)\b/i.test(text)) {
      detected.push({
        name: 'Juxtaposition / Paradoxical Contrast',
        type: 'Structural & Thematic Device',
        desc: 'Placing two contrasting concepts side-by-side to highlight disparities or expose tension.',
        example: 'Contrasting dichotomous terms placed in direct proximity',
        verb: 'juxtaposes',
        effect: 'accentuates stark contradictions to challenge the audience’s preconceived worldview'
      });
    }

    // 5. Alliteration
    const wordsList = text.replace(/[^a-zA-Z\s]/g, '').split(/\s+/).filter(w => w.length > 2);
    let alliterationLetters = [];
    for (let i = 0; i < wordsList.length - 1; i++) {
      const c1 = wordsList[i][0].toLowerCase();
      const c2 = wordsList[i+1][0].toLowerCase();
      if (c1 === c2 && !'aeiou'.includes(c1) && !alliterationLetters.includes(c1)) {
        alliterationLetters.push(c1);
      }
    }
    if (alliterationLetters.length > 0) {
      detected.push({
        name: `Alliteration (Consonance /${alliterationLetters.join(', ').toUpperCase()}/ sound)`,
        type: 'Auditory & Poetic Device',
        desc: 'Repetition of identical initial consonant sounds in successive or closely positioned words.',
        example: `Repeated initial /${alliterationLetters[0].toUpperCase()}/ consonant cadence`,
        verb: 'accentuates',
        effect: 'establishes an evocative auditory rhythm that heightens lyrical engagement and memorability'
      });
    }

    // 6. Visual & Sensory Imagery
    if (/\b(crimson|golden|dark|shadow|emerald|azure|gleam|bright|burn|radiant|flicker|gloom|hollow|smoke|dust|crystal)\b/i.test(text)) {
      detected.push({
        name: 'Visual & Sensory Imagery',
        type: 'Descriptive Technique',
        desc: 'Sensory language that appeals to sight, creating vivid mental pictures and visceral atmosphere.',
        example: 'Sensory and descriptive imagery vocabulary',
        verb: 'delineates',
        effect: 'immerses the reader into an atmospheric sensory landscape, amplifying emotional tone'
      });
    }

    // 7. Rhetorical Question / Interrogative Tone
    if (text.includes('?')) {
      detected.push({
        name: 'Rhetorical Question',
        type: 'Rhetorical & Persuasive Device',
        desc: 'A question posed for persuasive effect or contemplation with no direct response required.',
        example: 'Interrogative sentence structure terminating in a rhetorical question',
        verb: 'provokes',
        effect: 'compels the audience into active self-reflection, positioning them to accept the core contention'
      });
    }

    // 8. High Modality / Emotive Diction
    if (/\b(must|will|shall|never|always|danger|brutality|silent|devastating|crucial|essential|tyranny|freedom|suffering)\b/i.test(text)) {
      detected.push({
        name: 'High Modality & Emotive Diction',
        type: 'Persuasive & Lexical Choice',
        desc: 'Strong, resolute vocabulary that conveys certainty, moral urgency, and persuasive authority.',
        example: 'High-certainty and evocative lexical choices',
        verb: 'reinforces',
        effect: 'establishes an authoritative moral imperative that leaves little room for ambiguity'
      });
    }

    // 9. Fallback if no specific rule triggered
    if (detected.length === 0) {
      detected.push({
        name: 'Syntactic Structure & Diction',
        type: 'Textual Feature',
        desc: 'Deliberate phrasing, rhythm, and word choice selected by the author to build mood and tone.',
        example: text.length > 50 ? `"${text.substring(0, 45)}..."` : `"${text}"`,
        verb: 'foregrounds',
        effect: 'articulates the overarching conceptual tone and guides the reader’s thematic interpretation'
      });
    }

    if (devicesCount) devicesCount.textContent = `${detected.length} detected`;

    if (techniquesOutput) {
      techniquesOutput.innerHTML = detected.map(item => `
        <div class="tech-item ${item.name.includes('Juxtaposition') || item.name.includes('Metaphor') ? 'high-priority' : ''}">
          <div class="tech-item-head">
            <span class="tech-name">${item.name}</span>
            <span class="tech-tag">${item.type}</span>
          </div>
          <p class="tech-desc">${item.desc}</p>
          <p class="tech-quote">Effect: ${item.effect}</p>
        </div>
      `).join('');
    }

    if (sentencesOutput) {
      const quoteSnippet = text.length > 35 ? `"${text.substring(0, 32)}..."` : `"${text}"`;
      const primaryTech = detected[0];
      const secondaryTech = detected[1] || detected[0];

      const sentences = [
        {
          tag: 'TEEL Analysis (Band 6)',
          text: `Through the judicious deployment of ${primaryTech.name.toLowerCase()} in ${quoteSnippet}, the composer ${primaryTech.verb} the underlying tension between expectation and reality.`
        },
        {
          tag: 'HSC / VCE Analytical Synthesis',
          text: `By manipulating ${secondaryTech.name.toLowerCase()}, the text actively ${secondaryTech.verb} a nuanced perspective on the human condition, ${secondaryTech.effect}.`
        },
        {
          tag: 'Technique & Effect Integration',
          text: `The author’s deliberate reliance on ${primaryTech.name.toLowerCase()} serves to ${primaryTech.verb} critical thematic motifs, compelling the audience to interrogate the deeper implications of the narrative.`
        }
      ];

      sentencesOutput.innerHTML = sentences.map(s => `
        <div class="sentence-item" title="Click to copy sentence">
          <p class="sentence-text">${s.text}</p>
          <span class="sentence-tag">${s.tag} • Click to copy</span>
        </div>
      `).join('');

      sentencesOutput.querySelectorAll('.sentence-item').forEach(el => {
        el.addEventListener('click', () => {
          const txt = el.querySelector('.sentence-text')?.textContent;
          if (txt) copyToClipboard(txt);
        });
      });
    }
  };

  // Preset sample chips handler
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const key = chip.getAttribute('data-sample');
      if (key && samples[key] && textarea) {
        textarea.value = samples[key];
        updateStats(textarea.value);
        analyzeText(textarea.value);
      }
    });
  });

  if (textarea) {
    textarea.addEventListener('input', () => {
      updateStats(textarea.value);
      analyzeText(textarea.value);
    });
  }

  if (analyzeBtn && textarea) {
    analyzeBtn.addEventListener('click', () => {
      analyzeText(textarea.value);
      showToast('Scan complete!');
    });
  }

  if (clearBtn && textarea) {
    clearBtn.addEventListener('click', () => {
      textarea.value = '';
      updateStats('');
      analyzeText('');
      chips.forEach(c => c.classList.remove('active'));
    });
  }

  if (textarea) {
    textarea.value = samples.macbeth;
    updateStats(textarea.value);
    analyzeText(textarea.value);
  }

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
      previewReason.textContent = certReasonInput.value.trim() || 'For outstanding achievement and dedication to reading and literacy.';
    }
    if (previewPresenter && certPresenterInput) {
      previewPresenter.textContent = certPresenterInput.value.trim() || 'Educator / Parent';
    }
    if (previewDate && certDateInput) {
      previewDate.textContent = certDateInput.value.trim() || 'October 2026';
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
    let awardTitle = certAwardSelect?.value || 'Excellence in Literary Analysis';
    if (awardTitle === 'custom') awardTitle = certCustomAward?.value || 'Custom Award';
    ctx.fillStyle = '#13233f';
    ctx.font = '900 52px Inter, sans-serif';
    ctx.fillText(awardTitle, canvas.width / 2, 670);

    // Reason Text
    ctx.fillStyle = '#475569';
    ctx.font = 'italic 500 28px Inter, sans-serif';
    const reasonText = (certReasonInput?.value || 'For exceptional dedication to reading comprehension, literary insight, and critical thinking.').trim();
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
