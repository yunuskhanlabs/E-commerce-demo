/*
 * Public browser configuration for the admin panel.
 *
 * Add the project's Supabase anon (publishable) key below. This key is safe
 * for browser use; access remains controlled by Supabase Auth and RLS.
 * Never put a service-role or secret key in this file.
 */
window.ZaynXwearAdminConfig = Object.freeze({
  isDemoMode: true,
  supabaseUrl: '',
  supabaseAnonKey: '',
});
window.ECommerceDemoAdminConfig = window.ZaynXwearAdminConfig;
