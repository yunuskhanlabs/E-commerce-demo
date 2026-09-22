// @ts-check
/* ZaynXwear Homepage Dynamic Banner Management & Carousel Engine */
(function () {
  'use strict';

  /**
   * @typedef {Object} ElementAnimationConfig
   * @property {string} [type]
   * @property {number|string} [delay]
   * @property {number|string} [duration]
   * @property {number|string} [x]
   * @property {number|string} [y]
   * @property {string} [size_desktop]
   * @property {string} [size_tablet]
   * @property {string} [size_mobile]
   * @property {string} [font_family]
   * @property {Record<string, string>|null} [colors]
   * @property {Array<{x: number, y: number}>|null} [lines]
   */

  /**
   * @typedef {Object} ElementPositionConfig
   * @property {number|string} [x]
   * @property {number|string} [y]
   * @property {string} [size_desktop]
   * @property {string} [size_tablet]
   * @property {string} [size_mobile]
   * @property {string} [font_family]
   * @property {Record<string, string>|null} [colors]
   * @property {Array<{x: number, y: number}>|null} [lines]
   */

  /**
   * @typedef {Object} BannerItem
   * @property {string} [id]
   * @property {string} [desktop_image]
   * @property {string} [mobile_image]
   * @property {string} [tablet_image]
   * @property {string} [badge_text]
   * @property {string} [heading]
   * @property {string} [subheading]
   * @property {string} [button_text]
   * @property {string} [button_link]
   * @property {string} [animation_type]
   * @property {boolean} [enable_ken_burns]
   * @property {Record<string, ElementAnimationConfig>} [text_animations]
   * @property {Record<string, ElementPositionConfig>} [text_positions]
   * @property {boolean} [autoplay]
   * @property {number} [autoplay_interval]
   * @property {number} [display_order]
   * @property {boolean} [is_active]
   * @property {string} [created_at]
   * @property {string} [updated_at]
   */

  const globalWin = /** @type {any} */ (window);

  const SUPABASE_URL = (globalWin.ZaynXwearAdminConfig && globalWin.ZaynXwearAdminConfig.supabaseUrl) || '';
  const SUPABASE_ANON_KEY = (globalWin.ZaynXwearAdminConfig && globalWin.ZaynXwearAdminConfig.supabaseAnonKey) || '';

  /** @type {BannerItem[]} */
  let activeBanners = [];
  let currentSlideIndex = 0;
  /** @type {any} */
  let autoplayTimer = null;
  let isPaused = false;

  /** @type {HTMLElement | null} */
  let heroSection = null;
  /** @type {HTMLElement | null} */
  let heroBaselineInner = null;
  /** @type {HTMLElement | null} */
  let heroDynamicSlot = null;

  /**
   * @param {any} value
   * @returns {string}
   */
  const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, character => {
    /** @type {Record<string, string>} */
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    };
    return map[character] || character;
  });

  const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /**
   * Normalize element animation configuration with strict defaults
   * @param {BannerItem} banner
   * @param {string} elementKey
   * @param {string} defaultType
   * @param {number} defaultDelay
   * @param {number} defaultDuration
   * @returns {{ type: string, delay: string, duration: string }}
   */
  function getElementAnimConfig(banner, elementKey, defaultType, defaultDelay, defaultDuration) {
    const animMap = (banner && typeof banner.text_animations === 'object' && banner.text_animations !== null)
      ? banner.text_animations
      : {};
    const cfg = animMap[elementKey] || {};

    const rawType = String(cfg.type || defaultType).trim().toLowerCase().replace(/-/g, '_');
    const validTypes = ['slide_left', 'slide_right', 'slide_up', 'slide_down', 'fade', 'none'];
    const type = validTypes.includes(rawType) ? rawType : defaultType;

    const rawDelay = typeof cfg.delay === 'number' ? cfg.delay : parseFloat(String(cfg.delay ?? defaultDelay));
    const delayNum = isNaN(rawDelay) || rawDelay < 0 ? defaultDelay : rawDelay;

    const rawDur = typeof cfg.duration === 'number' ? cfg.duration : parseFloat(String(cfg.duration ?? defaultDuration));
    const durationNum = isNaN(rawDur) || rawDur <= 0 ? defaultDuration : rawDur;

    return {
      type,
      delay: `${delayNum}s`,
      duration: `${durationNum}s`
    };
  }

  /**
   * Fetch active banners from Supabase REST API
   * @returns {Promise<BannerItem[]>}
   */
  async function fetchActiveBanners() {
    if (globalWin.ZaynXwearMockData?.banners) {
      return globalWin.ZaynXwearMockData.banners;
    }
    if (globalWin.ZaynXwearAdminConfig?.isDemoMode || !SUPABASE_URL) {
      return [];
    }
    try {
      const endpoint = `${SUPABASE_URL}/rest/v1/banners?is_active=eq.true&order=display_order.asc,created_at.desc`;
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Banner fetch failed with HTTP ${response.status}`);
      }

      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error('Invalid banners response format');
      }

      return data;
    } catch (err) {
      globalWin.ZaynXwearLogger?.warn('banners_fetch_failed', {}, err);
      return [];
    }
  }

  /**
   * Render text with optional letter, word, and full-text color formatting
   * @param {string} text
   * @param {any} colorsConfig
   * @returns {string}
   */
  function renderColoredTextHtml(text, colorsConfig) {
    if (!text) return '';
    const colors = (colorsConfig && typeof colorsConfig === 'object') ? colorsConfig : null;
    const hasFull = Boolean(colors?.full);
    const hasWords = Boolean(colors?.words && Object.keys(colors.words).length > 0);
    const hasLetters = Boolean(colors?.letters && Object.keys(colors.letters).length > 0);

    // Fast-path: No custom colors
    if (!colors || (!hasFull && !hasWords && !hasLetters)) {
      return escapeHtml(text);
    }

    // Fast-path: Only full element color applied
    if (hasFull && !hasWords && !hasLetters) {
      return `<span style="color: ${escapeHtml(colors.full)};">${escapeHtml(text)}</span>`;
    }

    // Map character index to word index
    const charWordMap = new Array(text.length);
    let currentWordIdx = 0;
    let inWord = false;

    for (let i = 0; i < text.length; i++) {
      const isWhitespace = /\s/.test(text[i]);
      if (!isWhitespace) {
        if (!inWord && i > 0 && /\s/.test(text[i - 1])) {
          currentWordIdx++;
        }
        inWord = true;
        charWordMap[i] = currentWordIdx;
      } else {
        inWord = false;
        charWordMap[i] = -1;
      }
    }

    // Resolve color per character
    const charColors = new Array(text.length);
    for (let i = 0; i < text.length; i++) {
      const letterColor = colors.letters?.[i] || colors.letters?.[String(i)];
      if (letterColor) {
        charColors[i] = letterColor;
        continue;
      }
      const wordIdx = charWordMap[i];
      if (wordIdx >= 0) {
        const wordColor = colors.words?.[wordIdx] || colors.words?.[String(wordIdx)];
        if (wordColor) {
          charColors[i] = wordColor;
          continue;
        }
      }
      if (colors.full) {
        charColors[i] = colors.full;
        continue;
      }
      charColors[i] = '';
    }

    // Group adjacent characters with identical colors into spans
    let html = '';
    let currColor = null;
    let currRun = '';

    for (let i = 0; i < text.length; i++) {
      const cColor = charColors[i];
      if (currColor === null) {
        currColor = cColor;
        currRun = text[i];
      } else if (currColor === cColor) {
        currRun += text[i];
      } else {
        if (currColor) {
          html += `<span style="color: ${escapeHtml(currColor)};">${escapeHtml(currRun)}</span>`;
        } else {
          html += escapeHtml(currRun);
        }
        currColor = cColor;
        currRun = text[i];
      }
    }

    if (currRun) {
      if (currColor) {
        html += `<span style="color: ${escapeHtml(currColor)};">${escapeHtml(currRun)}</span>`;
      } else {
        html += escapeHtml(currRun);
      }
    }

    return html;
  }

  /**
   * Render multiline text with letter, word, and full-text color formatting
   * preserving character indexes across newlines.
   * @param {string} text
   * @param {any} colorsConfig
   * @returns {string[]}
   */
  function renderColoredTextLinesHtml(text, colorsConfig) {
    if (!text) return [];
    const colors = (colorsConfig && typeof colorsConfig === 'object') ? colorsConfig : null;
    const hasFull = Boolean(colors?.full);
    const hasWords = Boolean(colors?.words && Object.keys(colors.words).length > 0);
    const hasLetters = Boolean(colors?.letters && Object.keys(colors.letters).length > 0);

    const linesText = text.split('\n');

    if (!colors || (!hasFull && !hasWords && !hasLetters)) {
      return linesText.map(line => escapeHtml(line));
    }

    if (hasFull && !hasWords && !hasLetters) {
      return linesText.map(line => `<span style="color: ${escapeHtml(colors.full)};">${escapeHtml(line)}</span>`);
    }

    const charWordMap = new Array(text.length);
    let currentWordIdx = 0;
    let inWord = false;

    for (let i = 0; i < text.length; i++) {
      const isWhitespace = /\s/.test(text[i]);
      if (!isWhitespace) {
        if (!inWord && i > 0 && /\s/.test(text[i - 1])) {
          currentWordIdx++;
        }
        inWord = true;
        charWordMap[i] = currentWordIdx;
      } else {
        inWord = false;
        charWordMap[i] = -1;
      }
    }

    const charColors = new Array(text.length);
    for (let i = 0; i < text.length; i++) {
      const letterColor = colors.letters?.[i] || colors.letters?.[String(i)];
      if (letterColor) {
        charColors[i] = letterColor;
        continue;
      }
      const wordIdx = charWordMap[i];
      if (wordIdx >= 0) {
        const wordColor = colors.words?.[wordIdx] || colors.words?.[String(wordIdx)];
        if (wordColor) {
          charColors[i] = wordColor;
          continue;
        }
      }
      if (colors.full) {
        charColors[i] = colors.full;
        continue;
      }
      charColors[i] = '';
    }

    const results = [];
    let charIdx = 0;
    for (let l = 0; l < linesText.length; l++) {
      const lineText = linesText[l];
      let lineHtml = '';
      let currColor = null;
      let currRun = '';

      for (let i = 0; i < lineText.length; i++) {
        const cColor = charColors[charIdx + i];
        if (currColor === null) {
          currColor = cColor;
          currRun = lineText[i];
        } else if (currColor === cColor) {
          currRun += lineText[i];
        } else {
          if (currColor) {
            lineHtml += `<span style="color: ${escapeHtml(currColor)};">${escapeHtml(currRun)}</span>`;
          } else {
            lineHtml += escapeHtml(currRun);
          }
          currColor = cColor;
          currRun = lineText[i];
        }
      }

      if (currRun) {
        if (currColor) {
          lineHtml += `<span style="color: ${escapeHtml(currColor)};">${escapeHtml(currRun)}</span>`;
        } else {
          lineHtml += escapeHtml(currRun);
        }
      }

      results.push(lineHtml);
      charIdx += lineText.length + 1; // +1 for newline character
    }

    return results;
  }


  /** @type {Record<string, string>} */
  const BANNER_FONT_STACKS = {
    'Rajdhani': "'Rajdhani', sans-serif",
    'Comfortaa': "'Comfortaa', cursive, sans-serif",
    'Bungee': "'Bungee', cursive, sans-serif",
    'Orbitron': "'Orbitron', sans-serif",
    'Lora': "'Lora', serif",
    'Barlow Condensed': "'Barlow Condensed', sans-serif",
    'Electrolize': "'Electrolize', sans-serif",
    'Montserrat Subrayada': "'Montserrat Subrayada', sans-serif",
    'Spectral': "'Spectral', serif",
    'Yanone Kaffeesatz': "'Yanone Kaffeesatz', sans-serif",
    'Red Hat Mono': "'Red Hat Mono', monospace",
    'Bebas Neue': "'Bebas Neue', sans-serif",
    'Oswald': "'Oswald', sans-serif",
    'Anton': "'Anton', sans-serif",
    'Archivo Black': "'Archivo Black', sans-serif",
    'Space Grotesk': "'Space Grotesk', sans-serif",
    'DM Sans': "'DM Sans', sans-serif",
    'Playfair Display': "'Playfair Display', serif",
    'Cursive': "'Pacifico', cursive, sans-serif",
    'Permanent Marker': "'Permanent Marker', cursive, sans-serif"
  };

  /**
   * Normalize element position configuration
   * @param {BannerItem} banner
   * @param {string} elementKey
   * @returns {{ x: number, y: number, size_desktop: string, size_tablet: string, size_mobile: string, font_family: string, colors: any, lines: Array<{x: number, y: number}>|null }}
   */
  function getElementPosConfig(banner, elementKey) {
    // Check text_positions column object or fallback to text_animations
    const posMap = (banner && typeof banner.text_positions === 'object' && banner.text_positions !== null)
      ? banner.text_positions
      : null;
    const animMap = (banner && typeof banner.text_animations === 'object' && banner.text_animations !== null)
      ? banner.text_animations
      : null;

    const cfg = posMap?.[elementKey] || animMap?.[elementKey] || {};

    const rawX = parseFloat(String(cfg.x ?? 0));
    const rawY = parseFloat(String(cfg.y ?? 0));

    return {
      x: isNaN(rawX) ? 0 : rawX,
      y: isNaN(rawY) ? 0 : rawY,
      size_desktop: cfg.size_desktop || 'medium',
      size_tablet: cfg.size_tablet || 'medium',
      size_mobile: cfg.size_mobile || 'medium',
      font_family: String(cfg.font_family || '').trim(),
      colors: (cfg.colors && typeof cfg.colors === 'object') ? cfg.colors : null,
      lines: Array.isArray(cfg.lines) ? cfg.lines : null
    };
  }

  /**
   * Build clean CMS text content (Badge, Heading, Subheading, Primary CTA)
   * with independent animation, X/Y positioning and font color configurations
   * @param {BannerItem} banner
   * @param {boolean} isH1
   * @returns {string}
   */
  function buildCmsTextContent(banner, isH1 = false) {
    const badgeText = (banner.badge_text || '').trim();
    const heading = (banner.heading || '').trim();
    const subheading = (banner.subheading || '').trim();
    const buttonText = (banner.button_text || '').trim();
    const buttonLink = (banner.button_link || '#featured').trim();

    const badgeAnim = getElementAnimConfig(banner, 'badge', 'slide_right', 0.1, 0.5);
    const headingAnim = getElementAnimConfig(banner, 'heading', 'slide_left', 0.2, 0.7);
    const subAnim = getElementAnimConfig(banner, 'subheading', 'slide_up', 0.45, 0.6);
    const btnAnim = getElementAnimConfig(banner, 'button', 'slide_up', 0.7, 0.6);

    const badgePos = getElementPosConfig(banner, 'badge');
    const headingPos = getElementPosConfig(banner, 'heading');
    const subPos = getElementPosConfig(banner, 'subheading');
    const btnPos = getElementPosConfig(banner, 'button');

    const badgeFont = BANNER_FONT_STACKS[badgePos.font_family] ? `--element-font: ${BANNER_FONT_STACKS[badgePos.font_family]}; font-family: ${BANNER_FONT_STACKS[badgePos.font_family]};` : '';
    const headingFont = BANNER_FONT_STACKS[headingPos.font_family] ? `--element-font: ${BANNER_FONT_STACKS[headingPos.font_family]}; font-family: ${BANNER_FONT_STACKS[headingPos.font_family]};` : '';
    const subFont = BANNER_FONT_STACKS[subPos.font_family] ? `--element-font: ${BANNER_FONT_STACKS[subPos.font_family]}; font-family: ${BANNER_FONT_STACKS[subPos.font_family]};` : '';
    const btnFont = BANNER_FONT_STACKS[btnPos.font_family] ? `--element-font: ${BANNER_FONT_STACKS[btnPos.font_family]}; font-family: ${BANNER_FONT_STACKS[btnPos.font_family]};` : '';

    const titleTag = isH1 ? 'h1' : 'h2';
    /** @type {Record<string, number>} */
    const sizeScales = { xxsmall: 0.6, xsmall: 0.7, small: 0.8, medium: 1.0, large: 1.2, xlarge: 1.4, xxlarge: 1.6 };

    let html = '';

    if (badgeText) {
      html += `
        <div class="hero-banner-badge-wrap banner-anim-el" data-anim="${escapeHtml(badgeAnim.type)}" style="--pos-x: ${badgePos.x}px; --pos-x-val: ${badgePos.x}; --pos-y: ${badgePos.y}px; --pos-y-val: ${badgePos.y}; --scale-desktop: ${sizeScales[badgePos.size_desktop] || 1.0}; --scale-tablet: ${sizeScales[badgePos.size_tablet] || 1.0}; --scale-mobile: ${sizeScales[badgePos.size_mobile] || 1.0}; ${badgeFont} --anim-delay: ${escapeHtml(badgeAnim.delay)}; --anim-dur: ${escapeHtml(badgeAnim.duration)};">
          <span class="hero-banner-badge" style="${badgeFont}">${renderColoredTextHtml(badgeText, badgePos.colors)}</span>
        </div>
      `;
    }

    if (heading) {
      const headingTextLines = heading.split('\n');
      if (headingTextLines.length > 1) {
        const coloredLines = renderColoredTextLinesHtml(heading, headingPos.colors);
        let headingInnerHtml = '';
        for (let i = 0; i < headingTextLines.length; i++) {
          const lineX = headingPos.lines?.[i]?.x ?? (i === 0 ? headingPos.x : 0);
          const lineY = headingPos.lines?.[i]?.y ?? (i === 0 ? headingPos.y : 0);
          headingInnerHtml += `<span class="banner-line-el" style="display: block; position: relative; --pos-x: ${lineX}px; --pos-x-val: ${lineX}; --pos-y: ${lineY}px; --pos-y-val: ${lineY}; white-space: nowrap;">${coloredLines[i]}</span>`;
        }
        html += `<${titleTag} class="hero-title banner-anim-el" data-anim="${escapeHtml(headingAnim.type)}" style="--pos-x: 0px; --pos-x-val: 0; --pos-y: 0px; --pos-y-val: 0; --scale-desktop: ${sizeScales[headingPos.size_desktop] || 1.0}; --scale-tablet: ${sizeScales[headingPos.size_tablet] || 1.0}; --scale-mobile: ${sizeScales[headingPos.size_mobile] || 1.0}; ${headingFont} --anim-delay: ${escapeHtml(headingAnim.delay)}; --anim-dur: ${escapeHtml(headingAnim.duration)};">${headingInnerHtml}</${titleTag}>`;
      } else {
        html += `<${titleTag} class="hero-title banner-anim-el" data-anim="${escapeHtml(headingAnim.type)}" style="--pos-x: ${headingPos.x}px; --pos-x-val: ${headingPos.x}; --pos-y: ${headingPos.y}px; --pos-y-val: ${headingPos.y}; --scale-desktop: ${sizeScales[headingPos.size_desktop] || 1.0}; --scale-tablet: ${sizeScales[headingPos.size_tablet] || 1.0}; --scale-mobile: ${sizeScales[headingPos.size_mobile] || 1.0}; ${headingFont} --anim-delay: ${escapeHtml(headingAnim.delay)}; --anim-dur: ${escapeHtml(headingAnim.duration)};">${renderColoredTextHtml(heading, headingPos.colors)}</${titleTag}>`;
      }
    }

    if (subheading) {
      const subTextLines = subheading.split('\n');
      if (subTextLines.length > 1) {
        const coloredLines = renderColoredTextLinesHtml(subheading, subPos.colors);
        let subInnerHtml = '';
        for (let i = 0; i < subTextLines.length; i++) {
          const lineX = subPos.lines?.[i]?.x ?? (i === 0 ? subPos.x : 0);
          const lineY = subPos.lines?.[i]?.y ?? (i === 0 ? subPos.y : 0);
          subInnerHtml += `<span class="banner-line-el" style="display: block; position: relative; --pos-x: ${lineX}px; --pos-x-val: ${lineX}; --pos-y: ${lineY}px; --pos-y-val: ${lineY}; white-space: nowrap;">${coloredLines[i]}</span>`;
        }
        html += `<p class="hero-sub banner-anim-el" data-anim="${escapeHtml(subAnim.type)}" style="--pos-x: 0px; --pos-x-val: 0; --pos-y: 0px; --pos-y-val: 0; --scale-desktop: ${sizeScales[subPos.size_desktop] || 1.0}; --scale-tablet: ${sizeScales[subPos.size_tablet] || 1.0}; --scale-mobile: ${sizeScales[subPos.size_mobile] || 1.0}; ${subFont} --anim-delay: ${escapeHtml(subAnim.delay)}; --anim-dur: ${escapeHtml(subAnim.duration)};">${subInnerHtml}</p>`;
      } else {
        html += `<p class="hero-sub banner-anim-el" data-anim="${escapeHtml(subAnim.type)}" style="--pos-x: ${subPos.x}px; --pos-x-val: ${subPos.x}; --pos-y: ${subPos.y}px; --pos-y-val: ${subPos.y}; --scale-desktop: ${sizeScales[subPos.size_desktop] || 1.0}; --scale-tablet: ${sizeScales[subPos.size_tablet] || 1.0}; --scale-mobile: ${sizeScales[subPos.size_mobile] || 1.0}; ${subFont} --anim-delay: ${escapeHtml(subAnim.delay)}; --anim-dur: ${escapeHtml(subAnim.duration)};">${renderColoredTextHtml(subheading, subPos.colors)}</p>`;
      }
    }

    if (buttonText) {
      html += `
        <div class="hero-cta banner-anim-el" data-anim="${escapeHtml(btnAnim.type)}" style="--pos-x: ${btnPos.x}px; --pos-x-val: ${btnPos.x}; --pos-y: ${btnPos.y}px; --pos-y-val: ${btnPos.y}; --scale-desktop: ${sizeScales[btnPos.size_desktop] || 1.0}; --scale-tablet: ${sizeScales[btnPos.size_tablet] || 1.0}; --scale-mobile: ${sizeScales[btnPos.size_mobile] || 1.0}; ${btnFont} --anim-delay: ${escapeHtml(btnAnim.delay)}; --anim-dur: ${escapeHtml(btnAnim.duration)};">
          <a href="${escapeHtml(buttonLink)}" class="btn btn-primary hero-banner-btn" style="${btnFont}">

            ${renderColoredTextHtml(buttonText, btnPos.colors)}
            <svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="4" y1="12" x2="20" y2="12"></line>
              <polyline points="14 6 20 12 14 18"></polyline>
            </svg>
          </a>
        </div>
      `;
    }

    return html ? `<div class="hero-banner-content">${html}</div>` : '';
  }

  /**
   * Build the three-tier art-directed image markup. Legacy records retain
   * their existing desktop/mobile behaviour when tablet_image is absent.
   * @param {BannerItem} banner
   * @param {boolean} eager
   * @returns {string}
   */
  function buildBannerPicture(banner, eager) {
    const desktopImg = banner.desktop_image || '';
    const tabletImg = banner.tablet_image || desktopImg;
    const phoneImg = banner.mobile_image || desktopImg;
    const loading = eager ? 'eager' : 'lazy';
    const priority = eager ? ' fetchpriority="high"' : '';

    return `
      <picture class="hero-banner-picture">
        <source media="(min-width: 1280px)" srcset="${escapeHtml(desktopImg)}">
        <source media="(min-width: 768px)" srcset="${escapeHtml(tabletImg)}">
        <source media="(max-width: 767px)" srcset="${escapeHtml(phoneImg)}">
        <img class="hero-banner-img" src="${escapeHtml(phoneImg)}" alt="${escapeHtml(banner.heading || 'E-Commerce Demo')}" loading="${loading}"${priority}>
      </picture>
    `;
  }

  /**
   * Comprehensive Runtime Diagnostic Tracer
   * Inspects and logs the exact runtime state requested for debugging
   * @param {HTMLElement} slideEl
   * @param {BannerItem} [banner]
   */
  function logBannerAnimationDiagnostics(slideEl, banner) {
    if (!slideEl || typeof window === 'undefined') return;
    const reducedMotionMatch = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const forceAnimAttr = document.documentElement.getAttribute('data-force-anim');
    const heroEl = document.getElementById('home');
    const headingEl = /** @type {HTMLElement | null} */ (slideEl.querySelector('.hero-title'));

    const headingComputed = headingEl ? window.getComputedStyle(headingEl) : null;
    const headingInline = headingEl ? {
      animation: headingEl.style.animation,
      animationName: headingEl.style.animationName,
      animationDuration: headingEl.style.animationDuration,
      animationDelay: headingEl.style.animationDelay,
      opacity: headingEl.style.opacity,
      transform: headingEl.style.transform
    } : null;

    const reducedMotionRuleMatching = Boolean(reducedMotionMatch && forceAnimAttr !== 'true');

    const diagnosticReport = {
      '1. prefers-reduced-motion matches': reducedMotionMatch,
      '2. data-force-anim attribute': forceAnimAttr,
      '3. Active hero element classes': heroEl?.className || '',
      '4. Active heading element classes': headingEl?.className || '',
      '5. Active heading computed animation-name': headingComputed?.animationName || '',
      '5. Active heading computed animation-duration': headingComputed?.animationDuration || '',
      '5. Active heading computed animation-delay': headingComputed?.animationDelay || '',
      '5. Active heading computed animation-play-state': headingComputed?.animationPlayState || '',
      '5. Active heading computed opacity': headingComputed?.opacity || '',
      '5. Active heading computed transform': headingComputed?.transform || '',
      '6. Reduced-motion CSS rule matching': reducedMotionRuleMatching,
      '7. data-force-anim set only on ?anim=1': Boolean(window.location.search.includes('anim=1') || window.location.search.includes('force-anim')),
      '8. Heading inline style overrides': headingInline,
      '9. Active banner has is-active class': slideEl.classList.contains('is-active')
    };

    globalWin.ZaynXwearLogger?.debug('banner_diagnostic_report', diagnosticReport);
  }

  /**
   * Render single static banner (when only 1 banner exists)
  /**
   * Play choreographed entrance animation for a slide or single banner
   * Reuses the exact same reset, reflow, and activation sequence as Admin Preview
   * @param {HTMLElement} slide
   * @param {BannerItem} [banner]
   */
  function playSlideAnimation(slide, banner) {
    if (!slide) return;
    const bgImg = /** @type {HTMLElement | null} */ (slide.querySelector('.hero-banner-img'));
    const animEls = /** @type {HTMLElement[]} */ (Array.from(slide.querySelectorAll('.banner-anim-el')));

    // 1. Reset slide and child elements to hidden/suppressed state
    slide.classList.remove('is-active');
    slide.classList.add('is-resetting');

    if (bgImg) {
      bgImg.style.animation = 'none';
    }

    animEls.forEach(el => {
      el.style.animation = 'none';
      el.style.opacity = '0';
      void el.offsetWidth;
    });

    // Force synchronous reflow
    void slide.offsetWidth;

    // 2. Schedule re-activation on next frame (30ms matching Admin Preview)
    setTimeout(() => {
      animEls.forEach(el => {
        el.style.animation = '';
        el.style.opacity = '';
      });
      if (bgImg) {
        bgImg.style.animation = '';
      }

      slide.classList.remove('is-resetting');
      slide.classList.add('is-active');
      slide.setAttribute('aria-hidden', 'false');

      if (banner) {
        logBannerAnimationDiagnostics(slide, banner);
      }
    }, 30);
  }

  /**
   * Render single active banner (when exactly 1 banner exists)
   * @param {BannerItem} banner
   */
  function renderSingleBanner(banner) {
    if (!heroDynamicSlot) return;

    const enableKenBurns = Boolean(banner.enable_ken_burns);
    const contentHtml = buildCmsTextContent(banner, true);

    heroDynamicSlot.innerHTML = `
      <div class="hero-banner-single" ${enableKenBurns ? 'data-ken-burns="true"' : ''}>
        ${buildBannerPicture(banner, true)}
        <div class="hero-banner-overlay"></div>
        ${contentHtml ? `<div class="hero-banner-content-wrap">${contentHtml}</div>` : ''}
      </div>
    `;

    const singleEl = /** @type {HTMLElement | null} */ (heroDynamicSlot.querySelector('.hero-banner-single'));
    if (singleEl) {
      playSlideAnimation(singleEl, banner);
    }

    bindHeroSmoothScroll();
  }

  /**
   * Render interactive carousel/slider (when > 1 banners exist)
   * @param {BannerItem[]} banners
   */
  function renderBannerCarousel(banners) {
    if (!heroDynamicSlot || !banners.length) return;

    const firstBanner = banners[0];
    const defaultAnimationType = firstBanner.animation_type || 'slide';

    const slidesHtml = banners.map((banner, index) => {
      const animType = banner.animation_type || 'slide';
      const enableKenBurns = Boolean(banner.enable_ken_burns);
      const contentHtml = buildCmsTextContent(banner, index === 0);

      return `
        <div class="hero-slide" data-slide-index="${index}" data-animation="${escapeHtml(animType)}" ${enableKenBurns ? 'data-ken-burns="true"' : ''} aria-hidden="${index === 0 ? 'false' : 'true'}">
          ${buildBannerPicture(banner, index === 0)}
          <div class="hero-banner-overlay"></div>
          ${contentHtml ? `<div class="hero-banner-content-wrap">${contentHtml}</div>` : ''}
        </div>
      `;
    }).join('');

    const dotsHtml = banners.map((_, index) => `
      <button type="button" class="hero-slider-dot ${index === 0 ? 'is-active' : ''}" data-goto-slide="${index}" aria-label="Go to slide ${index + 1}"></button>
    `).join('');

    heroDynamicSlot.innerHTML = `
      <div class="hero-slider-container" id="heroSliderContainer" data-animation-mode="${escapeHtml(defaultAnimationType)}">
        <div class="hero-slider-track" id="heroSliderTrack">
          ${slidesHtml}
        </div>

        <!-- Slider Navigation Arrows -->
        <button type="button" class="hero-slider-nav hero-slider-prev" id="heroSliderPrev" aria-label="Previous slide">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>

        <button type="button" class="hero-slider-nav hero-slider-next" id="heroSliderNext" aria-label="Next slide">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>

        <!-- Slider Navigation Dots -->
        <div class="hero-slider-dots" id="heroSliderDots" role="tablist">
          ${dotsHtml}
        </div>
      </div>
    `;

    setupCarouselEngine(banners);
    bindHeroSmoothScroll();
  }

  /**
   * Interactive Carousel Engine
   * @param {BannerItem[]} banners
   */
  function setupCarouselEngine(banners) {
    if (!heroDynamicSlot) return;
    const container = /** @type {HTMLElement | null} */ (document.getElementById('heroSliderContainer'));
    const track = /** @type {HTMLElement | null} */ (document.getElementById('heroSliderTrack'));
    const slides = /** @type {HTMLElement[]} */ (Array.from(heroDynamicSlot.querySelectorAll('.hero-slide')));
    const dots = /** @type {HTMLButtonElement[]} */ (Array.from(heroDynamicSlot.querySelectorAll('.hero-slider-dot')));
    const prevBtn = document.getElementById('heroSliderPrev');
    const nextBtn = document.getElementById('heroSliderNext');

    if (!slides.length) return;

    currentSlideIndex = 0;

    // Trigger initial slide entrance cleanly matching Admin Preview sequence
    const firstSlide = slides[0];
    if (firstSlide) {
      playSlideAnimation(firstSlide, banners[0]);
    }

    /**
     * @param {number} targetIndex
     */
    function goToSlide(targetIndex) {
      if (targetIndex < 0) {
        targetIndex = slides.length - 1;
      } else if (targetIndex >= slides.length) {
        targetIndex = 0;
      }

      currentSlideIndex = targetIndex;
      const currentBanner = banners[currentSlideIndex];
      const animType = currentBanner?.animation_type || 'slide';

      if (container) {
        container.dataset.animationMode = animType;
      }

      slides.forEach((slide, idx) => {
        if (idx === currentSlideIndex) {
          playSlideAnimation(slide, banners[currentSlideIndex]);
        } else {
          slide.classList.remove('is-active', 'is-resetting');
          slide.setAttribute('aria-hidden', 'true');
        }
      });

      dots.forEach((dot, idx) => {
        dot.classList.toggle('is-active', idx === currentSlideIndex);
      });

      if (track && animType === 'slide') {
        track.style.transform = `translateX(-${currentSlideIndex * 100}%)`;
      } else if (track) {
        track.style.transform = 'none';
      }

      restartAutoplay();
    }

    function nextSlide() {
      goToSlide(currentSlideIndex + 1);
    }

    function prevSlide() {
      goToSlide(currentSlideIndex - 1);
    }

    function startAutoplay() {
      clearInterval(autoplayTimer);
      if (isPaused || prefersReducedMotion()) return;

      const currentBanner = banners[currentSlideIndex];
      if (currentBanner && currentBanner.autoplay === false) return;

      const intervalMs = Math.max(2000, Number(currentBanner?.autoplay_interval) || 5000);
      autoplayTimer = setInterval(() => {
        if (!isPaused && document.visibilityState === 'visible') {
          nextSlide();
        }
      }, intervalMs);
    }

    function restartAutoplay() {
      clearInterval(autoplayTimer);
      startAutoplay();
    }

    // Prev / Next button clicks
    prevBtn?.addEventListener('click', () => {
      prevSlide();
    });

    nextBtn?.addEventListener('click', () => {
      nextSlide();
    });

    // Dot clicks
    dots.forEach((dot, idx) => {
      dot.addEventListener('click', () => {
        goToSlide(idx);
      });
    });

    // Pause autoplay on mouse enter / hover / focus
    container?.addEventListener('mouseenter', () => {
      isPaused = true;
      clearInterval(autoplayTimer);
    });

    container?.addEventListener('mouseleave', () => {
      isPaused = false;
      startAutoplay();
    });

    // Keyboard navigation
    container?.addEventListener('keydown', (/** @type {KeyboardEvent} */ e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextSlide();
      }
    });

    // Touch swipe support for mobile devices
    let touchStartX = 0;
    let touchEndX = 0;

    container?.addEventListener('touchstart', (/** @type {TouchEvent} */ e) => {
      touchStartX = e.changedTouches[0].screenX;
      isPaused = true;
      clearInterval(autoplayTimer);
    }, { passive: true });

    container?.addEventListener('touchend', (/** @type {TouchEvent} */ e) => {
      touchEndX = e.changedTouches[0].screenX;
      const swipeDistance = touchEndX - touchStartX;
      if (Math.abs(swipeDistance) > 40) {
        if (swipeDistance < 0) {
          nextSlide();
        } else {
          prevSlide();
        }
      }
      touchStartX = 0;
      touchEndX = 0;
      isPaused = false;
      startAutoplay();
    });

    // Start initial autoplay
    startAutoplay();
  }

  /**
   * Bind smooth scroll behavior to any newly created hash link buttons in the hero
   */
  function bindHeroSmoothScroll() {
    if (!heroDynamicSlot) return;
    const navbar = /** @type {HTMLElement | null} */ (document.getElementById('navbar'));

    heroDynamicSlot.querySelectorAll('a[href^="#"]').forEach(el => {
      const link = /** @type {HTMLAnchorElement} */ (el);
      link.addEventListener('click', event => {
        const id = link.getAttribute('href');
        const target = id && id.length > 1 ? /** @type {HTMLElement | null} */ (document.querySelector(id)) : null;
        if (target) {
          event.preventDefault();
          const navOffset = navbar ? navbar.offsetHeight : 70;
          window.scrollTo({
            top: target.getBoundingClientRect().top + window.scrollY - navOffset + 1,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  const CACHE_KEY = 'zaynxwear_active_banners_cache';
  let lastRenderedJson = '';

  /**
   * Apply banners data to hero DOM
   * @param {BannerItem[]} banners
   * @param {boolean} [force=false]
   */
  function applyBannersToDom(banners, force = false) {
    const bannersJson = JSON.stringify(banners || []);
    if (!force && lastRenderedJson === bannersJson && heroDynamicSlot && heroDynamicSlot.innerHTML.trim() !== '') {
      // Data is already rendered and active; avoid tearing down and flashing active animations
      return;
    }
    lastRenderedJson = bannersJson;
    activeBanners = banners;

    if (!banners || banners.length === 0) {
      // Show ONLY baseline fallback hero
      if (heroBaselineInner) {
        heroBaselineInner.hidden = false;
        heroBaselineInner.style.display = '';
      }
      if (heroDynamicSlot) {
        heroDynamicSlot.hidden = true;
        heroDynamicSlot.style.display = 'none';
        heroDynamicSlot.innerHTML = '';
      }
      if (heroSection) {
        heroSection.classList.remove('hero-loading', 'hero-dynamic-mode', 'hero-carousel-mode');
        heroSection.classList.add('hero-fallback-mode');
      }
      return;
    }

    // Hide baseline fallback completely - exactly ONE hero active
    if (heroBaselineInner) {
      heroBaselineInner.hidden = true;
      heroBaselineInner.style.display = 'none';
    }
    if (heroDynamicSlot) {
      heroDynamicSlot.hidden = false;
      heroDynamicSlot.style.display = 'block';
    }

    if (heroSection) {
      heroSection.classList.remove('hero-loading', 'hero-fallback-mode');
      heroSection.classList.add('hero-dynamic-mode');
    }

    if (banners.length === 1) {
      if (heroSection) heroSection.classList.remove('hero-carousel-mode');
      renderSingleBanner(banners[0]);
    } else {
      if (heroSection) heroSection.classList.add('hero-carousel-mode');
      renderBannerCarousel(banners);
    }


    document.dispatchEvent(new CustomEvent('zaynxwear:banners-loaded', {
      detail: { banners: [...activeBanners] }
    }));
  }

  /**
   * Initialize Banner System
   */
  async function initBanners() {
    if (typeof window !== 'undefined' && window.location) {
      if (window.location.search.includes('anim=1') || window.location.search.includes('force-anim')) {
        document.documentElement.dataset.forceAnim = 'true';
      }
    }

    heroSection = /** @type {HTMLElement | null} */ (document.getElementById('home'));
    heroBaselineInner = /** @type {HTMLElement | null} */ (document.getElementById('heroBaselineInner'));
    heroDynamicSlot = /** @type {HTMLElement | null} */ (document.getElementById('heroDynamicSlot'));

    if (!heroSection) return;

    // Fast-path: Check session cache for instant zero-flash render
    try {
      const cachedRaw = sessionStorage.getItem(CACHE_KEY);
      if (cachedRaw) {
        const cached = JSON.parse(cachedRaw);
        if (Array.isArray(cached) && cached.length > 0) {
          applyBannersToDom(cached);
        }
      }
    } catch (e) {
      // Ignore cache parse error
    }

    // Fetch fresh active banners from Supabase
    try {
      const banners = await fetchActiveBanners();

      if (banners && banners.length > 0) {
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify(banners));
        } catch (e) { }
        applyBannersToDom(banners);
      } else if (banners && banners.length === 0) {
        try {
          sessionStorage.removeItem(CACHE_KEY);
        } catch (e) { }
        applyBannersToDom([]);
      }
    } catch (err) {
      globalWin.ZaynXwearLogger?.warn('banners_init_failed', {}, err);
      if (!activeBanners || activeBanners.length === 0) {
        applyBannersToDom([]);
      }
    }
  }

  // Public API
  globalWin.ZaynXwearBanners = {
    init: initBanners,
    getActiveBanners: () => [...activeBanners],
    buildCmsTextContent: buildCmsTextContent,
    BANNER_FONT_STACKS: BANNER_FONT_STACKS
  };

  // Run on DOMContentLoaded or immediate if already ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBanners);
  } else {
    initBanners();
  }
})();
