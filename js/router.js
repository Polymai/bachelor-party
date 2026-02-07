(() => {
  const VIEW_AUTH = 'view-auth';
  const VIEW_DASH = 'view-dashboard';
  const VIEW_EVENT = 'view-event';

  function setView(id) {
    const views = [VIEW_AUTH, VIEW_DASH, VIEW_EVENT];
    views.forEach((vid) => {
      const el = document.getElementById(vid);
      if (!el) return;
      el.classList.toggle('is-active', vid === id);
    });
  }

  function route() {
    const signedIn = window.State.isSignedIn();
    const hasEvent = window.State.isEventLoaded() || !!window.State.getState().currentEventId;

    if (!signedIn) {
      setView(VIEW_AUTH);
      return { view: 'auth' };
    }

    if (hasEvent) {
      setView(VIEW_EVENT);
      return { view: 'event' };
    }

    setView(VIEW_DASH);
    return { view: 'dashboard' };
  }

  window.Router = { route, setView };
})();