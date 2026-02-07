(() => {
  const KEY_PREFIX = 'bpa.v23.';

  function get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(KEY_PREFIX + key);
      if (raw === null || raw === undefined) return fallback;
      return JSON.parse(raw);
    } catch (_e) {
      return fallback;
    }
  }

  function set(key, value) {
    localStorage.setItem(KEY_PREFIX + key, JSON.stringify(value));
  }

  function remove(key) {
    localStorage.removeItem(KEY_PREFIX + key);
  }

  window.Storage = { get, set, remove };
})();