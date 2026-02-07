(() => {
  const state = {
    session: null,
    user: null,
    event: null,
    currentEventId: null
  };

  const listeners = new Set();

  function getState() {
    return state;
  }

  function setState(patch) {
    Object.assign(state, patch);
    listeners.forEach((fn) => fn(state));
  }

  function subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }

  function isSignedIn() {
    return !!state.user;
  }

  function isEventLoaded() {
    return !!state.event && !!state.event.id;
  }

  window.State = { getState, setState, subscribe, isSignedIn, isEventLoaded };
})();