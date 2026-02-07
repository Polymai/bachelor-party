(() => {
  function qs(id) {
    return document.getElementById(id);
  }

  function isOpen() {
    return qs('menu')?.classList.contains('is-open');
  }

  function open() {
    const m = qs('menu');
    if (!m) return;
    m.classList.add('is-open');
    m.setAttribute('aria-hidden', 'false');
  }

  function close() {
    const m = qs('menu');
    if (!m) return;
    m.classList.remove('is-open');
    m.setAttribute('aria-hidden', 'true');
  }

  function updateVisibility() {
    const signedIn = window.State.isSignedIn();
    const menuBtn = qs('btn-menu');
    const menu = qs('menu');
    if (menuBtn) menuBtn.style.display = signedIn ? '' : 'none';
    if (menu && !signedIn) close();
  }

  function bindMenu() {
    const menuBtn = qs('btn-menu');
    const closeBtn = qs('btn-menu-close');
    const goDash = qs('menu-go-dashboard');
    const goEvent = qs('menu-go-event');
    const signOutBtn = qs('menu-signout');
    const menuBackdrop = qs('menu');

    if (menuBtn) menuBtn.addEventListener('click', () => open());
    if (closeBtn) closeBtn.addEventListener('click', () => close());

    if (menuBackdrop) {
      menuBackdrop.addEventListener('click', (e) => {
        if (e.target === menuBackdrop) close();
      });
    }

    if (goDash) {
      goDash.addEventListener('click', () => {
        close();
        window.State.setState({ event: null, currentEventId: null });
        window.Storage.remove('currentEventId');
        window.Router.setView('view-dashboard');
      });
    }

    if (goEvent) {
      goEvent.addEventListener('click', () => {
        close();
        window.Router.setView('view-event');
      });
    }

    if (signOutBtn) {
      signOutBtn.addEventListener('click', async () => {
        close();
        window.Storage.remove('currentEventId');
        window.State.setState({ event: null, currentEventId: null });
        try {
          await window.Auth.signOut();
        } catch (_e) {
          window.Router.route();
        }
      });
    }

    updateVisibility();
  }

  window.Menu = { bindMenu, open, close, isOpen, updateVisibility };
})();