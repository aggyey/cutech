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

    // Update count
    if (devicesCount) devicesCount.textContent = `${detected.length} detected`;

    // Render Detected Devices
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

    // Render Band 6 TEEL Sentences
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

  // Textarea input & button handlers
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

  // Run initial sample analysis on load
  if (textarea) {
    textarea.value = samples.macbeth;
    updateStats(textarea.value);
    analyzeText(textarea.value);
  }

  requestAnimationFrame(() => root.classList.add('is-ready'));
})();
