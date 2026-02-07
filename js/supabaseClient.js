(() => {
  function getSupabase() {
    if (window.__SUPABASE__) return window.__SUPABASE__;
    const env = window.__ENV__;
    if (!env || !env.supabase || !env.supabase.url || !env.supabase.anonKey) {
      throw new Error('Missing Supabase env');
    }
    if (!window.supabase || !window.supabase.createClient) {
      throw new Error('Supabase JS not loaded');
    }
    window.__SUPABASE__ = window.supabase.createClient(env.supabase.url, env.supabase.anonKey);
    return window.__SUPABASE__;
  }

  async function getSession() {
    const sb = getSupabase();
    const { data, error } = await sb.auth.getSession();
    if (error) throw error;
    return data.session || null;
  }

  async function getUser() {
    const session = await getSession();
    return session ? session.user : null;
  }

  window.SupabaseClient = { getSupabase, getSession, getUser };
})();