/**
 * ZaynXwear — Central Customer Mobile OTP Authentication Module
 * 
 * Manages customer mobile OTP login/signup, session state, modal UI,
 * navbar auth state synchronization, and audit logging.
 */
(function (global) {
  'use strict';

  const DEFAULT_CONFIG = {
    supabaseUrl: '',
    supabaseAnonKey: '',
  };

  let supabaseClient = null;
  let currentSession = null;
  let currentUser = null;
  let authCallback = null;
  let isInitialized = false;
  let initRetryCount = 0;

  // Active OTP state
  let activeMobile = '';
  let activeNotifyUpdates = false;
  let activeChannel = 'whatsapp';
  let resendTimerInterval = null;
  let resendRemainingSeconds = 0;

  const getLogger = () => global.ZaynXwearLogger || {
    info: () => {},
    warn: () => {},
    error: () => {}
  };

  const getSupabase = () => {
    if (supabaseClient) return supabaseClient;
    const config = global.ZaynXwearAdminConfig || DEFAULT_CONFIG;
    if (global.supabase && typeof global.supabase.createClient === 'function') {
      supabaseClient = global.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false,  // OTP-only auth — no OAuth hash fragments expected
          storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        }
      });
    }
    if (supabaseClient && typeof window !== 'undefined') {
      window.ZaynXwearSupabase = supabaseClient;
    }
    return supabaseClient;
  };

  const cleanMobileNumber = (mobile) => {
    if (typeof mobile !== 'string') return '';
    return mobile.replace(/[\s-]/g, '').replace(/^\+91/, '').trim();
  };

  const isValidIndianMobile = (mobile) => {
    const clean = cleanMobileNumber(mobile);
    return /^[6-9]\d{9}$/.test(clean);
  };

  const formatMobileDisplay = (mobile) => {
    const clean = cleanMobileNumber(mobile);
    if (clean.length === 10) {
      return `+91 ${clean.slice(0, 5)} ${clean.slice(5)}`;
    }
    return clean ? `+91 ${clean}` : '';
  };

  const ZaynXwearAuth = {
    getClient() {
      return getSupabase();
    },

    /**
     * Initializes Auth subsystem, injects modal, binds listeners, and renders navbar.
     */
    async init() {
      if (isInitialized) return;
      isInitialized = true;

      injectAuthModal();

      // Check for demo session in localStorage (supports both new and legacy key names)
      try {
        const sessionKey = 'ecommerce-demo-session';
        const legacyKey  = 'zaynxwear-demo-session';
        let raw = localStorage.getItem(sessionKey);
        if (!raw) {
          raw = localStorage.getItem(legacyKey);
          if (raw) {
            // Migrate legacy key to new key
            localStorage.setItem(sessionKey, raw);
            localStorage.removeItem(legacyKey);
          }
        }
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.user) {
            currentSession = parsed;
            currentUser = parsed.user;
          }
        }
      } catch (e) {}

      const config = global.ZaynXwearAdminConfig || DEFAULT_CONFIG;
      if (config.isDemoMode || !config.supabaseUrl) {
        ZaynXwearAuth.renderNavbarAuthState();
        return;
      }

      const client = getSupabase();
      if (!client) {
        if (initRetryCount >= 5) {
          getLogger().warn('customer_auth_init_failed', { reason: 'supabase_sdk_unavailable' });
          return;
        }
        initRetryCount++;
        setTimeout(() => {
          isInitialized = false;
          ZaynXwearAuth.init();
        }, 150);
        return;
      }
      initRetryCount = 0;

      try {
        const { data: { session }, error } = await client.auth.getSession();
        if (!error && session) {
          currentSession = session;
          currentUser = session.user;
        }
      } catch (err) {
        getLogger().warn('customer_auth_session_check_failed', { error: err?.message });
      }

      ZaynXwearAuth.renderNavbarAuthState();

      client.auth.onAuthStateChange((event, session) => {
        // TOKEN_REFRESHED is a silent background refresh — skip all UI updates
        // to prevent unnecessary re-renders and visible page flicker.
        if (event === 'TOKEN_REFRESHED') {
          currentSession = session;
          currentUser = session?.user || null;
          return;
        }

        currentSession = session;
        currentUser = session?.user || null;
        ZaynXwearAuth.renderNavbarAuthState();

        if (event === 'SIGNED_IN' && session?.user) {
          getLogger().info('customer_login_success', {
            user_id: session.user.id,
            phone: session.user.phone || session.user.user_metadata?.mobile
          });
          if (typeof authCallback === 'function') {
            const cb = authCallback;
            authCallback = null;
            cb(session.user, session);
          }
          ZaynXwearAuth.closeAuthModal();
        } else if (event === 'SIGNED_OUT') {
          getLogger().info('customer_logout', {});
        }
      });
    },

    /**
     * Returns current customer user or null
     */
    async getUser() {
      const client = getSupabase();
      if (!client) return currentUser;
      try {
        const { data: { user } } = await client.auth.getUser();
        currentUser = user;
        return user;
      } catch {
        return currentUser;
      }
    },

    /**
     * Returns current customer session or null
     */
    async getSession() {
      const client = getSupabase();
      if (!client) return currentSession;
      try {
        const { data: { session } } = await client.auth.getSession();
        currentSession = session;
        currentUser = session?.user || null;
        return session;
      } catch {
        return currentSession;
      }
    },

    /**
     * Requests an OTP for mobile number
     */
    async sendOtp(mobile, notifyUpdates = false, channel = 'whatsapp') {
      const clean = cleanMobileNumber(mobile);
      if (!isValidIndianMobile(clean)) {
        return { success: false, error: 'Please enter a valid 10-digit Indian mobile number.' };
      }

      const chosenChannel = channel === 'sms' ? 'sms' : 'whatsapp';
      const config = global.ZaynXwearAdminConfig || DEFAULT_CONFIG;

      if (config.isDemoMode || !config.supabaseUrl) {
        activeMobile = clean;
        activeNotifyUpdates = Boolean(notifyUpdates);
        activeChannel = chosenChannel;
        getLogger().info('customer_otp_request_demo', { mobile: clean });
        return {
          success: true,
          message: 'Demo OTP: 123456 (or any 6 digits)',
          mobile: clean,
          maskedMobile: formatMobileDisplay(clean),
          cooldownSeconds: 15,
          channel: activeChannel,
          otpDelivery: 'demo'
        };
      }

      const endpoint = `${config.supabaseUrl}/functions/v1/send-mobile-otp`;

      getLogger().info('customer_otp_request_started', {
        mobile_masked: `${clean.slice(0, 2)}******${clean.slice(-2)}`,
        notifyUpdates,
        channel: chosenChannel
      });

      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': config.supabaseAnonKey
          },
          body: JSON.stringify({
            mobile: clean,
            notifyUpdates: Boolean(notifyUpdates),
            channel: chosenChannel
          })
        });

        const data = await res.json().catch(() => null);

        if (!res.ok || !data?.success) {
          const errorMsg = data?.error || 'Unable to send OTP. Please try again.';
          getLogger().warn('customer_otp_request_failed', {
            error: errorMsg,
            status: res.status
          });
          return {
            success: false,
            error: errorMsg,
            cooldownRemaining: data?.cooldownRemaining
          };
        }

        activeMobile = clean;
        activeNotifyUpdates = Boolean(notifyUpdates);
        activeChannel = data.channel || chosenChannel;

        getLogger().info('customer_otp_request_dispatched', {
          mobile_masked: `${clean.slice(0, 2)}******${clean.slice(-2)}`,
          channel: activeChannel
        });

        return {
          success: true,
          message: data.message || 'OTP sent successfully.',
          mobile: clean,
          maskedMobile: data.maskedMobile || formatMobileDisplay(clean),
          cooldownSeconds: data.cooldownSeconds || 30,
          channel: activeChannel,
          otpDelivery: data.otpDelivery || null
        };
      } catch (err) {
        getLogger().error('customer_otp_request_error', {}, err);
        return { success: false, error: 'Network error. Please check your connection and try again.' };
      }
    },

    /**
     * Verifies submitted OTP for mobile number
     */
    async verifyOtp(mobile, otp) {
      const clean = cleanMobileNumber(mobile || activeMobile);
      const cleanOtp = String(otp || '').trim();

      if (!isValidIndianMobile(clean)) {
        return { success: false, error: 'Please enter a valid 10-digit Indian mobile number.' };
      }
      if (!/^\d{6}$/.test(cleanOtp)) {
        return { success: false, error: 'Please enter the complete 6-digit OTP code.' };
      }

      const config = global.ZaynXwearAdminConfig || DEFAULT_CONFIG;

      if (config.isDemoMode || !config.supabaseUrl) {
        const demoUser = {
          id: 'demo-user-' + clean,
          phone: '+91' + clean,
          user_metadata: { mobile: clean, full_name: 'Demo Customer' }
        };
        const demoSession = {
          user: demoUser,
          access_token: 'demo-token-' + Date.now(),
          refresh_token: 'demo-refresh-token'
        };
        currentUser = demoUser;
        currentSession = demoSession;
        try {
          localStorage.setItem('ecommerce-demo-session', JSON.stringify(demoSession));
          localStorage.removeItem('zaynxwear-demo-session'); // remove legacy key if present
        } catch (e) {}

        ZaynXwearAuth.renderNavbarAuthState();

        getLogger().info('customer_otp_verification_demo_success', {
          user_id: demoUser.id,
          mobile_masked: `${clean.slice(0, 2)}******${clean.slice(-2)}`
        });

        if (typeof authCallback === 'function') {
          const cb = authCallback;
          authCallback = null;
          cb(demoUser, demoSession);
        }

        ZaynXwearAuth.closeAuthModal();

        return {
          success: true,
          user: demoUser,
          session: demoSession
        };
      }

      const endpoint = `${config.supabaseUrl}/functions/v1/verify-mobile-otp`;

      getLogger().info('customer_otp_verification_started', {
        mobile_masked: `${clean.slice(0, 2)}******${clean.slice(-2)}`
      });

      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': config.supabaseAnonKey
          },
          body: JSON.stringify({
            mobile: clean,
            otp: cleanOtp
          })
        });

        const data = await res.json().catch(() => null);

        if (!res.ok || !data?.success || !data?.session) {
          const errorMsg = data?.error || 'Invalid OTP. Please try again.';
          getLogger().warn('customer_otp_verification_failed', {
            error: errorMsg,
            status: res.status
          });
          return { success: false, error: errorMsg };
        }

        const client = getSupabase();
        if (client && data.session.access_token && data.session.refresh_token) {
          try {
            await client.auth.setSession({
              access_token: data.session.access_token,
              refresh_token: data.session.refresh_token
            });
          } catch (sessionErr) {
            getLogger().warn('set_session_warning', { error: sessionErr?.message });
          }
        }

        currentSession = data.session;
        currentUser = data.session.user;

        ZaynXwearAuth.renderNavbarAuthState();

        getLogger().info('customer_otp_verification_success', {
          user_id: data.session.user?.id,
          mobile_masked: `${clean.slice(0, 2)}******${clean.slice(-2)}`
        });

        if (typeof authCallback === 'function') {
          const cb = authCallback;
          authCallback = null;
          cb(data.session.user, data.session);
        }

        ZaynXwearAuth.closeAuthModal();

        return {
          success: true,
          user: data.session.user,
          session: data.session
        };
      } catch (err) {
        getLogger().error('customer_otp_verification_error', {}, err);
        return { success: false, error: 'Network error during verification. Please try again.' };
      }
    },

    /**
     * Signs out current customer
     */
    async signOut() {
      try {
        localStorage.removeItem('ecommerce-demo-session');
        localStorage.removeItem('zaynxwear-demo-session'); // also clear legacy key
      } catch (e) {}
      const client = getSupabase();
      if (client && !global.ZaynXwearAdminConfig?.isDemoMode) {
        try {
          await client.auth.signOut();
        } catch (err) {
          getLogger().warn('customer_signout_error', { error: err?.message });
        }
      }
      currentSession = null;
      currentUser = null;
      ZaynXwearAuth.renderNavbarAuthState();
      if (typeof global.onZaynXwearAuthChanged === 'function') {
        global.onZaynXwearAuthChanged(null);
      }
    },

    /**
     * Opens Customer Auth Modal
     * @param {Function} [onSuccess] 
     */
    openAuthModal(onSuccess = null) {
      injectAuthModal();
      if (typeof onSuccess === 'function') {
        authCallback = onSuccess;
      }
      const modal = document.getElementById('customerAuthModal');
      if (!modal) return;

      modal.hidden = false;
      modal.setAttribute('aria-hidden', 'false');
      modal.classList.add('is-open');
      document.body.classList.add('auth-modal-open');

      // Default to mobile input screen
      showMobileScreen(activeMobile);
    },

    /**
     * Closes Customer Auth Modal
     */
    closeAuthModal() {
      const modal = document.getElementById('customerAuthModal');
      if (!modal) return;
      modal.hidden = true;
      modal.setAttribute('aria-hidden', 'true');
      modal.classList.remove('is-open');
      document.body.classList.remove('auth-modal-open');
      stopResendCountdown();
      clearStatusAlert();
    },

    /**
     * Synchronizes navbar with current auth state
     */
    renderNavbarAuthState() {
      const user = currentUser;
      const userMobile = user?.user_metadata?.mobile || user?.phone?.replace(/^\+91/, '') || '';
      const displayTitle = userMobile ? formatMobileDisplay(userMobile) : 'Account';
      const initial = userMobile ? userMobile[0] : 'U';

      // 1. Desktop Nav Actions
      const desktopActions = document.querySelectorAll('.nav-actions');
      desktopActions.forEach(actions => {
        let authContainer = actions.querySelector('.nav-auth-container');
        if (!authContainer) {
          authContainer = document.createElement('div');
          authContainer.className = 'nav-auth-container';
          const cartBtn = actions.querySelector('#cartBtn');
          if (cartBtn) {
            actions.insertBefore(authContainer, cartBtn);
          } else {
            actions.prepend(authContainer);
          }
        }

        if (user) {
          authContainer.innerHTML = `
            <div class="nav-auth-user-dropdown" id="navAuthDropdown">
              <button class="nav-auth-user-btn" id="navAuthUserBtn" type="button" aria-expanded="false" title="${escapeHtml(displayTitle)}">
                <span class="nav-auth-avatar">${escapeHtml(initial)}</span>
                <span class="nav-auth-name">${escapeHtml(userMobile ? `+91 ${userMobile.slice(0, 5)}...` : 'Account')}</span>
                <svg class="nav-auth-chevron" viewBox="0 0 24 24" width="14" height="14"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2"/></svg>
              </button>
              <div class="nav-auth-menu" id="navAuthMenu" hidden>
                <div class="nav-auth-menu-header">
                  <strong>${escapeHtml(displayTitle)}</strong>
                  <small>Customer Account</small>
                </div>
                <hr class="nav-auth-menu-divider">
                <a href="orders.html" class="nav-auth-menu-item">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v1"/><path d="M18 8h4a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-4"/><circle cx="8" cy="18" r="2"/><circle cx="18" cy="18" r="2"/></svg>
                  My Orders
                </a>
                <button class="nav-auth-menu-item" type="button" id="navLogoutBtn">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" fill="none" stroke="currentColor" stroke-width="2"/></svg>
                  Sign Out
                </button>
              </div>
            </div>
          `;

          const userBtn = authContainer.querySelector('#navAuthUserBtn');
          const menu = authContainer.querySelector('#navAuthMenu');
          const logoutBtn = authContainer.querySelector('#navLogoutBtn');

          if (userBtn && menu) {
            userBtn.addEventListener('click', (e) => {
              e.stopPropagation();
              const isHidden = menu.hidden;
              menu.hidden = !isHidden;
              userBtn.setAttribute('aria-expanded', String(!isHidden));
            });
          }

          if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
              ZaynXwearAuth.signOut();
            });
          }
        } else {
          authContainer.innerHTML = `
            <button class="nav-auth-btn" id="navSignInBtn" type="button" aria-label="Login or Signup">
              <svg class="ic" viewBox="0 0 24 24" width="18" height="18">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" fill="none" stroke="currentColor" stroke-width="2"/>
                <circle cx="12" cy="7" r="4" fill="none" stroke="currentColor" stroke-width="2"/>
              </svg>
              <span>Login</span>
            </button>
          `;
          const signInBtn = authContainer.querySelector('#navSignInBtn');
          if (signInBtn) {
            signInBtn.addEventListener('click', () => ZaynXwearAuth.openAuthModal());
          }
        }
      });

      // 2. Mobile Drawer Nav (Compact Collapsible Accordion Row)
      const mobileNav = document.getElementById('navMenu');
      if (mobileNav) {
        let mobileAuth = mobileNav.querySelector('.mobile-nav-auth');
        if (!mobileAuth) {
          mobileAuth = document.createElement('div');
          mobileAuth.className = 'mobile-nav-auth';
          mobileNav.appendChild(mobileAuth);
        }

        if (user) {
          mobileAuth.innerHTML = `
            <div class="mobile-nav-auth-accordion" id="mobileAuthAccordion">
              <button class="mobile-nav-auth-trigger" id="mobileAuthTrigger" type="button" aria-expanded="false" aria-controls="mobileAuthPanel">
                <div class="mobile-nav-auth-trigger-left">
                  <span>ACCOUNT</span>
                </div>
                <svg class="mobile-nav-auth-chevron" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </button>
              <div class="mobile-nav-auth-panel" id="mobileAuthPanel" hidden>
                <div class="mobile-nav-user-info">
                  <span class="nav-auth-avatar">${escapeHtml(initial)}</span>
                  <div>
                    <strong>${escapeHtml(displayTitle)}</strong>
                    <small>Customer Account</small>
                  </div>
                </div>
                <a href="orders.html" class="btn btn-outline mobile-nav-orders-btn">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v1"/><circle cx="8" cy="18" r="2"/><circle cx="18" cy="18" r="2"/></svg>
                  My Orders
                </a>
                <button class="btn btn-outline mobile-nav-signout-btn" id="mobileSignOutBtn" type="button">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
                  Sign Out
                </button>
              </div>
            </div>
          `;
        } else {
          mobileAuth.innerHTML = `
            <div class="mobile-nav-auth-accordion" id="mobileAuthAccordion">
              <button class="mobile-nav-auth-trigger" id="mobileAuthTrigger" type="button" aria-expanded="false" aria-controls="mobileAuthPanel">
                <div class="mobile-nav-auth-trigger-left">
                  <span>ACCOUNT</span>
                </div>
                <svg class="mobile-nav-auth-chevron" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </button>
              <div class="mobile-nav-auth-panel" id="mobileAuthPanel" hidden>
                <button class="btn btn-primary mobile-nav-signin-btn" id="mobileSignInBtn" type="button">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  Login / Signup
                </button>
              </div>
            </div>
          `;
        }

        // Accordion Toggle
        const accordion = mobileAuth.querySelector('#mobileAuthAccordion');
        const trigger = mobileAuth.querySelector('#mobileAuthTrigger');
        const panel = mobileAuth.querySelector('#mobileAuthPanel');

        trigger?.addEventListener('click', (e) => {
          e.stopPropagation();
          const isHidden = panel.hidden;
          panel.hidden = !isHidden;
          trigger.setAttribute('aria-expanded', String(!isHidden));
          accordion?.classList.toggle('is-expanded', !isHidden);
        });

        // Sign Out Listener
        const mobileSignOut = mobileAuth.querySelector('#mobileSignOutBtn');
        if (mobileSignOut) {
          mobileSignOut.addEventListener('click', () => {
            ZaynXwearAuth.signOut();
            const navMenu = document.getElementById('navMenu');
            const menuToggle = document.getElementById('menuToggle');
            if (navMenu && navMenu.classList.contains('open')) {
              navMenu.classList.remove('open');
              document.body.style.overflow = '';
              const menuIcon = document.getElementById('menuIcon');
              if (menuIcon) menuIcon.innerHTML = '<use href="#icon-menu"/>';
              if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
            }
          });
        }

        // Sign In Listener
        const mobileSignIn = mobileAuth.querySelector('#mobileSignInBtn');
        if (mobileSignIn) {
          mobileSignIn.addEventListener('click', () => {
            const navMenu = document.getElementById('navMenu');
            const menuToggle = document.getElementById('menuToggle');
            if (navMenu && navMenu.classList.contains('open')) {
              navMenu.classList.remove('open');
              document.body.style.overflow = '';
              const menuIcon = document.getElementById('menuIcon');
              if (menuIcon) menuIcon.innerHTML = '<use href="#icon-menu"/>';
              if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
            }
            ZaynXwearAuth.openAuthModal();
          });
        }
      }

      // Close dropdown when clicking outside
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-auth-user-dropdown')) {
          document.querySelectorAll('.nav-auth-menu').forEach(m => m.hidden = true);
          document.querySelectorAll('.nav-auth-user-btn').forEach(b => b.setAttribute('aria-expanded', 'false'));
        }
      });
    }
  };

  /**
   * Injects the unified Auth Modal markup if not already present
   */
  function injectAuthModal() {
    if (document.getElementById('customerAuthModal')) return;

    const modal = document.createElement('div');
    modal.id = 'customerAuthModal';
    modal.className = 'auth-modal-overlay';
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    modal.classList.remove('is-open');
    modal.innerHTML = `
      <div class="auth-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="authModalTitle">
        <button class="auth-modal-close" id="authModalClose" type="button" aria-label="Close modal">
          <svg viewBox="0 0 24 24" width="20" height="20"><path d="M18 6L6 18M6 6l12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </button>

        <div class="auth-modal-header">
          <div class="auth-brand">E-COMMERCE <span>DEMO</span></div>
          <h3 id="authModalTitle">Login / Signup</h3>
          <p class="auth-modal-subtitle" id="authModalSubtitle">Demo login — no real OTP required.</p>
        </div>

        <!-- Status Message Alert -->
        <div class="auth-status-alert" id="authStatusAlert" hidden role="alert"></div>

        <!-- SCREEN 1: MOBILE NUMBER INPUT FORM -->
        <form class="auth-form" id="formAuthMobile" novalidate>
          <div class="auth-demo-notice" style="background:rgba(74,222,128,0.1);border:1px solid rgba(74,222,128,0.3);border-radius:8px;padding:10px 14px;margin-bottom:12px;font-size:13px;color:#4ade80;display:flex;gap:8px;align-items:flex-start;">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;margin-top:1px"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>
            <span>This is a demo. A fake number is pre-filled. No real OTP will be sent.</span>
          </div>
          <div class="auth-form-group">
            <label for="authMobileInput">Mobile Number <span style="font-size:11px;opacity:0.6;font-weight:400">(Demo pre-filled)</span></label>
            <div class="auth-phone-input-group">
              <span class="auth-country-code">+91</span>
              <input
                type="tel"
                id="authMobileInput"
                class="auth-phone-input"
                placeholder="10-digit mobile number"
                maxlength="10"
                inputmode="numeric"
                autocomplete="tel"
                value="9876543210"
                required
              >
            </div>
          </div>

          <button type="submit" class="btn btn-primary auth-submit-btn" id="btnSubmitMobile">
            <span>Continue</span>
          </button>
        </form>
        <!-- SCREEN 2: OTP VERIFICATION FORM -->
        <form class="auth-form" id="formAuthOtp" hidden novalidate>
          <div class="auth-target-mobile-card">
            <div class="auth-target-mobile-info">
              <span class="auth-target-mobile-label">Demo number:</span>
              <strong class="auth-target-mobile-number" id="authTargetMobileDisplay">+91 </strong>
            </div>
            <button type="button" class="auth-edit-mobile-btn" id="btnEditMobile" aria-label="Edit mobile number">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              <span>Edit</span>
            </button>
          </div>

          <!-- Demo OTP hint -->
          <div class="auth-demo-notice" style="background:rgba(74,222,128,0.1);border:1px solid rgba(74,222,128,0.3);border-radius:8px;padding:10px 14px;margin-bottom:14px;font-size:13px;color:#4ade80;display:flex;gap:8px;align-items:center;">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0"><path d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/></svg>
            <span>Demo OTP: <strong style="letter-spacing:2px">123456</strong> — pre-filled below. Just click Verify.</span>
          </div>

          <div class="auth-form-group">
            <label class="auth-otp-label">Enter 6-Digit OTP <span style="font-size:11px;opacity:0.6;font-weight:400">(Demo: any code works)</span></label>
            <div class="auth-otp-container" id="authOtpContainer">
              <input type="text" class="auth-otp-box" maxlength="1" inputmode="numeric" pattern="[0-9]*" data-index="0" autocomplete="one-time-code" aria-label="Digit 1" value="1">
              <input type="text" class="auth-otp-box" maxlength="1" inputmode="numeric" pattern="[0-9]*" data-index="1" aria-label="Digit 2" value="2">
              <input type="text" class="auth-otp-box" maxlength="1" inputmode="numeric" pattern="[0-9]*" data-index="2" aria-label="Digit 3" value="3">
              <input type="text" class="auth-otp-box" maxlength="1" inputmode="numeric" pattern="[0-9]*" data-index="3" aria-label="Digit 4" value="4">
              <input type="text" class="auth-otp-box" maxlength="1" inputmode="numeric" pattern="[0-9]*" data-index="4" aria-label="Digit 5" value="5">
              <input type="text" class="auth-otp-box" maxlength="1" inputmode="numeric" pattern="[0-9]*" data-index="5" aria-label="Digit 6" value="6">
            </div>
          </div>

          <button type="submit" class="btn btn-primary auth-submit-btn" id="btnSubmitOtp">
            <span>Verify &amp; Continue</span>
          </button>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    const closeBtn = modal.querySelector('#authModalClose');
    if (closeBtn) closeBtn.addEventListener('click', ZaynXwearAuth.closeAuthModal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) ZaynXwearAuth.closeAuthModal();
    });

    // ESC key closes modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const m = document.getElementById('customerAuthModal');
        if (m && !m.hidden && m.classList.contains('is-open')) {
          ZaynXwearAuth.closeAuthModal();
        }
      }
    });

    const mobileInput = modal.querySelector('#authMobileInput');
    if (mobileInput) {
      mobileInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
      });
      mobileInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          modal.querySelector('#formAuthMobile')?.requestSubmit();
        }
      });
    }

    // Submit Mobile Number -> Demo: skip real OTP, go straight to OTP screen
    modal.querySelector('#formAuthMobile')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearStatusAlert();
      const mobileVal = mobileInput?.value || '9876543210';
      const submitBtn = modal.querySelector('#btnSubmitMobile');

      // In demo mode: accept any number (including the pre-filled demo number)
      const cleanVal = cleanMobileNumber(mobileVal);
      const mobile = cleanVal.length >= 6 ? cleanVal : '9876543210';

      setButtonLoading(submitBtn, true);
      // Use demo sendOtp path — always returns success with demo OTP info
      const res = await ZaynXwearAuth.sendOtp(mobile, false, 'whatsapp');
      setButtonLoading(submitBtn, false);

      if (!res.success) {
        showStatusAlert(res.error || 'Unable to proceed. Please try again.', 'error');
      } else {
        showOtpScreen(res.mobile || mobile, res.cooldownSeconds || 15, 'demo');
      }
    });

    // Edit Mobile Button -> Return to Screen 1
    modal.querySelector('#btnEditMobile')?.addEventListener('click', () => {
      showMobileScreen(activeMobile);
    });

    // Channel Selector Interactions
    const btnWhatsApp = modal.querySelector('#btnChannelWhatsApp');
    const btnSms = modal.querySelector('#btnChannelSms');

    btnWhatsApp?.addEventListener('click', async () => {
      if (activeChannel === 'whatsapp') return;
      clearStatusAlert();
      showStatusAlert('Requesting OTP via WhatsApp...', 'info');
      const res = await ZaynXwearAuth.sendOtp(activeMobile, activeNotifyUpdates, 'whatsapp');
      if (!res.success) {
        showStatusAlert(res.error, 'error');
      } else {
        showStatusAlert('OTP sent via WhatsApp.', 'success');
        showOtpScreen(activeMobile, res.cooldownSeconds || 30, 'whatsapp');
      }
    });

    btnSms?.addEventListener('click', async () => {
      if (activeChannel === 'sms') return;
      clearStatusAlert();
      showStatusAlert('Requesting OTP via SMS...', 'info');
      const res = await ZaynXwearAuth.sendOtp(activeMobile, activeNotifyUpdates, 'sms');
      if (!res.success) {
        showStatusAlert(res.error, 'error');
      } else {
        showStatusAlert('OTP sent via SMS.', 'success');
        showOtpScreen(activeMobile, res.cooldownSeconds || 30, 'sms');
      }
    });

    // Wire OTP Boxes
    setupOtpBoxes(modal);

    // Resend OTP Button
    modal.querySelector('#btnResendOtp')?.addEventListener('click', async () => {
      clearStatusAlert();
      const resendBtn = modal.querySelector('#btnResendOtp');
      if (resendBtn) resendBtn.disabled = true;

      const res = await ZaynXwearAuth.sendOtp(activeMobile, activeNotifyUpdates, activeChannel);
      if (resendBtn) resendBtn.disabled = false;

      if (!res.success) {
        showStatusAlert(res.error, 'error');
      } else {
        const channelLabel = activeChannel === 'sms' ? 'SMS' : 'WhatsApp';
        showStatusAlert(`A new OTP has been sent via ${channelLabel}.`, 'success');
        showOtpScreen(res.mobile, res.cooldownSeconds || 30, res.channel);
      }
    });

    // Submit OTP Form -> Demo: any 6-digit code (or pre-filled 123456) verifies
    modal.querySelector('#formAuthOtp')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearStatusAlert();
      const otpCode = getOtpCode(modal);
      const submitBtn = modal.querySelector('#btnSubmitOtp');

      // In demo mode accept any 6 digits (pre-filled is 123456)
      const codeToVerify = /^\d{6}$/.test(otpCode) ? otpCode : '123456';

      setButtonLoading(submitBtn, true);
      const res = await ZaynXwearAuth.verifyOtp(activeMobile || '9876543210', codeToVerify);
      setButtonLoading(submitBtn, false);

      if (!res.success) {
        showStatusAlert(res.error, 'error');
        clearOtpBoxes(modal);
        // Re-fill with demo OTP so user can just click again
        const boxes = modal.querySelectorAll('.auth-otp-box');
        '123456'.split('').forEach((d, i) => { if (boxes[i]) boxes[i].value = d; });
      }
    });
  }

  function showMobileScreen(prefilledNumber = '') {
    const formMobile = document.getElementById('formAuthMobile');
    const formOtp = document.getElementById('formAuthOtp');
    const modalTitle = document.getElementById('authModalTitle');
    const modalSubtitle = document.getElementById('authModalSubtitle');
    const mobileInput = document.getElementById('authMobileInput');

    clearStatusAlert();
    stopResendCountdown();

    if (formMobile) formMobile.hidden = false;
    if (formOtp) formOtp.hidden = true;
    if (modalTitle) modalTitle.textContent = 'Login / Signup';
    if (modalSubtitle) modalSubtitle.textContent = 'Demo login — no real OTP required.';

    if (mobileInput) {
      // Always pre-fill with demo number (use provided number or default demo number)
      mobileInput.value = prefilledNumber ? cleanMobileNumber(prefilledNumber) : '9876543210';
      setTimeout(() => mobileInput.focus(), 50);
    }
  }

  function showOtpScreen(mobile, cooldownSeconds = 15, channel = 'demo') {
    const formMobile = document.getElementById('formAuthMobile');
    const formOtp = document.getElementById('formAuthOtp');
    const modalTitle = document.getElementById('authModalTitle');
    const modalSubtitle = document.getElementById('authModalSubtitle');
    const displayEl = document.getElementById('authTargetMobileDisplay');
    const modal = document.getElementById('customerAuthModal');

    clearStatusAlert();

    if (formMobile) formMobile.hidden = true;
    if (formOtp) formOtp.hidden = false;

    activeChannel = 'whatsapp'; // demo always uses internal channel

    if (modalTitle) modalTitle.textContent = 'Demo OTP Verification';
    if (modalSubtitle) modalSubtitle.textContent = 'OTP pre-filled below. Click Verify & Continue to proceed.';

    if (displayEl) displayEl.textContent = formatMobileDisplay(mobile || '9876543210');

    // Pre-fill OTP boxes with demo code 123456
    const boxes = modal?.querySelectorAll('.auth-otp-box') || [];
    '123456'.split('').forEach((d, i) => { if (boxes[i]) boxes[i].value = d; });
    // Focus last box so user can immediately submit
    if (boxes[5]) boxes[5].focus();
  }

  function setupOtpBoxes(modal) {
    const boxes = modal.querySelectorAll('.auth-otp-box');
    boxes.forEach((box, index) => {
      box.addEventListener('input', (e) => {
        const val = e.target.value.replace(/\D/g, '');
        e.target.value = val ? val[0] : '';
        if (e.target.value && index < boxes.length - 1) {
          boxes[index + 1].focus();
        }
        // If all 6 boxes filled, auto-submit
        if (getOtpCode(modal).length === 6) {
          modal.querySelector('#formAuthOtp')?.requestSubmit();
        }
      });

      box.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace') {
          if (!e.target.value && index > 0) {
            boxes[index - 1].focus();
          }
        } else if (e.key === 'ArrowLeft' && index > 0) {
          boxes[index - 1].focus();
        } else if (e.key === 'ArrowRight' && index < boxes.length - 1) {
          boxes[index + 1].focus();
        }
      });

      box.addEventListener('paste', (e) => {
        e.preventDefault();
        const pastedData = (e.clipboardData || window.clipboardData).getData('text');
        const digits = pastedData.replace(/\D/g, '').slice(0, 6);
        if (digits) {
          digits.split('').forEach((d, i) => {
            if (boxes[i]) boxes[i].value = d;
          });
          const nextIndex = Math.min(digits.length, boxes.length - 1);
          boxes[nextIndex]?.focus();
          if (digits.length === 6) {
            modal.querySelector('#formAuthOtp')?.requestSubmit();
          }
        }
      });
    });
  }

  function getOtpCode(modal) {
    const boxes = modal?.querySelectorAll('.auth-otp-box') || [];
    return Array.from(boxes).map(b => b.value || '').join('');
  }

  function clearOtpBoxes(modal) {
    const boxes = modal?.querySelectorAll('.auth-otp-box') || [];
    boxes.forEach(b => b.value = '');
  }

  function focusFirstEmptyOtpBox(modal) {
    const boxes = modal?.querySelectorAll('.auth-otp-box') || [];
    const firstEmpty = Array.from(boxes).find(b => !b.value);
    if (firstEmpty) {
      firstEmpty.focus();
    } else if (boxes[0]) {
      boxes[0].focus();
    }
  }

  function startResendCountdown(seconds = 30) {
    stopResendCountdown();
    resendRemainingSeconds = seconds;

    const timerEl = document.getElementById('authResendTimer');
    const resendBtn = document.getElementById('btnResendOtp');

    const updateUI = () => {
      if (resendRemainingSeconds > 0) {
        if (timerEl) {
          timerEl.hidden = false;
          timerEl.innerHTML = `Resend OTP in <strong>${resendRemainingSeconds}s</strong>`;
        }
        if (resendBtn) resendBtn.hidden = true;
      } else {
        if (timerEl) timerEl.hidden = true;
        if (resendBtn) {
          resendBtn.hidden = false;
          resendBtn.disabled = false;
        }
        stopResendCountdown();
      }
    };

    updateUI();
    resendTimerInterval = setInterval(() => {
      resendRemainingSeconds--;
      updateUI();
    }, 1000);
  }

  function stopResendCountdown() {
    if (resendTimerInterval) {
      clearInterval(resendTimerInterval);
      resendTimerInterval = null;
    }
  }

  function showStatusAlert(msg, type = 'error') {
    const alert = document.getElementById('authStatusAlert');
    if (!alert) return;
    alert.className = `auth-status-alert auth-status-${type}`;
    alert.textContent = msg;
    alert.hidden = false;
  }

  function clearStatusAlert() {
    const alert = document.getElementById('authStatusAlert');
    if (!alert) return;
    alert.hidden = true;
    alert.textContent = '';
  }

  function setButtonLoading(btn, isLoading) {
    if (!btn) return;
    btn.disabled = isLoading;
    if (isLoading) {
      btn.dataset.originalText = btn.innerHTML;
      btn.innerHTML = '<span class="auth-spinner"></span> Processing...';
    } else if (btn.dataset.originalText) {
      btn.innerHTML = btn.dataset.originalText;
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, m => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[m]);
  }

  // Auto initialize on DOM ready
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => ZaynXwearAuth.init());
    } else {
      ZaynXwearAuth.init();
    }
  }

  // Export — keep legacy name for backward compat, also expose new name
  global.ZaynXwearAuth = ZaynXwearAuth;
  global.ECommerceDemoAuth = ZaynXwearAuth;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ZaynXwearAuth;
  }
})(typeof window !== 'undefined' ? window : globalThis);
