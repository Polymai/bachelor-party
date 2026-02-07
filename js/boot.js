(() => {
  function qs(id) {
    return document.getElementById(id);
  }

  function setText(id, text) {
    const el = qs(id);
    if (el) el.textContent = text || '';
  }

  async function initSession() {
    const session = await window.SupabaseClient.getSession();
    const user = session ? session.user : null;
    window.State.setState({ session, user });
    setText('header-status', user ? (user.email || 'Signed in') : '');
  }

  function bindRSVP() {
    const btn = qs('btn-save-rsvp');
    const msg = qs('rsvp-msg');

    async function refreshList() {
      const st = window.State.getState();
      if (!st.event) return;

      const all = await window.AppData.listByType('membership', { limit: 200, asc: true });
      const rows = all.filter((r) => r && r.payload && r.payload.eventId === st.event.id);

      const host = qs('rsvp-list');
      if (!host) return;

      if (rows.length === 0) {
        host.textContent = 'No RSVPs yet.';
        return;
      }

      const by = rows.map((r) => {
        const p = r.payload || {};
        const name = p.displayName ? String(p.displayName) : 'Someone';
        const status = p.rsvp ? String(p.rsvp) : 'maybe';
        return `${name}: ${status}`;
      });

      host.textContent = by.join('\n');
    }

    if (btn) {
      btn.addEventListener('click', async () => {
        if (msg) msg.textContent = '';
        const st = window.State.getState();
        if (!st.event) {
          if (msg) msg.textContent = 'No event loaded.';
          return;
        }

        const name = (qs('rsvp-name')?.value || '').trim();
        const status = (qs('rsvp-status')?.value || 'maybe').trim();

        if (!name) {
          if (msg) msg.textContent = 'Enter your name.';
          return;
        }

        try {
          await window.AppData.insert('membership', {
            eventId: st.event.id,
            displayName: name,
            rsvp: status,
            updatedAt: new Date().toISOString()
          });
          if (msg) msg.textContent = 'Saved.';
          await refreshList();
        } catch (err) {
          if (msg) msg.textContent = err && err.message ? err.message : 'Save failed.';
        }
      });
    }

    window.RSVP = { refreshList };
  }

  async function loadCurrentEventIfAny() {
    const id = window.Storage.get('currentEventId', null);
    if (!id) return;
    try {
      await window.EventService.loadEventById(id);
    } catch (_e) {
      window.Storage.remove('currentEventId');
      window.State.setState({ currentEventId: null, event: null });
    }
  }

  async function boot() {
    await window.Mounts.mountAllSequential();

    window.Auth.bindAuthForms();
    window.Auth.attachAuthListener();
    window.Menu.bindMenu();
    window.EventEditor.bindDashboardActions();
    window.EventEditor.bindEditorButtons();
    window.MapOSM.bindControls();
    window.UISections.bindSectionTabs();
    window.Comments.bind();
    bindRSVP();

    await initSession();
    await loadCurrentEventIfAny();

    if (window.State.getState().event) {
      window.EventEditor.onEventLoaded();
      try { await window.RSVP.refreshList(); } catch (_e) {}
      try { await window.Comments.refresh(); } catch (_e) {}
    }

    window.Router.route();
    window.Menu.updateVisibility();

    window.State.subscribe((st) => {
      if (st.event) window.EventEditor.onEventLoaded();
      window.Menu.updateVisibility();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { boot(); });
  } else {
    boot();
  }
})();