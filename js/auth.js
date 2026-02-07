(() => {
  function qs(id) {
    return document.getElementById(id);
  }

  function setMsg(el, msg) {
    if (!el) return;
    el.textContent = msg || '';
  }

  async function signUp(email, password) {
    const sb = window.SupabaseClient.getSupabase();
    const { data, error } = await sb.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  }

  async function signIn(email, password) {
    const sb = window.SupabaseClient.getSupabase();
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  async function signOut() {
    const sb = window.SupabaseClient.getSupabase();
    const { error } = await sb.auth.signOut();
    if (error) throw error;
  }

  function bindAuthForms() {
    const formSignup = qs('form-signup');
    const formLogin = qs('form-login');
    const signupMsg = qs('signup-msg');
    const loginMsg = qs('login-msg');

    if (formSignup) {
      formSignup.addEventListener('submit', async (e) => {
        e.preventDefault();
        setMsg(signupMsg, '');
        const email = (qs('signup-email')?.value || '').trim();
        const password = qs('signup-password')?.value || '';
        try {
          await signUp(email, password);
          setMsg(signupMsg, 'Check your email for a confirmation link (if required), then log in.');
        } catch (err) {
          setMsg(signupMsg, err && err.message ? err.message : 'Sign up failed.');
        }
      });
    }

    if (formLogin) {
      formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();
        setMsg(loginMsg, '');
        const email = (qs('login-email')?.value || '').trim();
        const password = qs('login-password')?.value || '';
        try {
          await signIn(email, password);
          setMsg(loginMsg, 'Logged in.');
        } catch (err) {
          setMsg(loginMsg, err && err.message ? err.message : 'Login failed.');
        }
      });
    }
  }

  function attachAuthListener() {
    const sb = window.SupabaseClient.getSupabase();
    sb.auth.onAuthStateChange((_event, session) => {
      const user = session ? session.user : null;
      window.State.setState({ session: session || null, user });
      const headerStatus = document.getElementById('header-status');
      if (headerStatus) headerStatus.textContent = user ? (user.email || 'Signed in') : '';
      window.Router.route();
      window.Menu.updateVisibility();
    });
  }

  window.Auth = { bindAuthForms, attachAuthListener, signOut };
})();