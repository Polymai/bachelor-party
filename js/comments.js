(() => {
  function qs(id) {
    return document.getElementById(id);
  }

  function setMsg(msg) {
    const el = qs('comment-msg');
    if (el) el.textContent = msg || '';
  }

  function renderList(rows) {
    const host = qs('comments-list');
    if (!host) return;
    if (!rows || rows.length === 0) {
      host.textContent = 'No comments yet.';
      return;
    }

    const lines = rows.map((r) => {
      const p = r.payload || {};
      const when = r.created_at ? new Date(r.created_at).toLocaleString() : '';
      const name = p.name ? String(p.name) : 'Someone';
      const text = p.text ? String(p.text) : '';
      return `${name} (${when}): ${text}`;
    });
    host.textContent = lines.join('\n\n');
  }

  async function refresh() {
    const st = window.State.getState();
    if (!st.event) return;

    const all = await window.AppData.listByType('comment', { limit: 200, asc: true });
    const rows = all.filter((r) => r && r.payload && r.payload.eventId === st.event.id);
    renderList(rows);
  }

  function bind() {
    const form = qs('form-add-comment');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      setMsg('');
      const st = window.State.getState();
      if (!st.event) {
        setMsg('No event loaded.');
        return;
      }

      const name = (qs('comment-name')?.value || '').trim();
      const text = (qs('comment-text')?.value || '').trim();
      if (!name || !text) {
        setMsg('Name and message required.');
        return;
      }

      try {
        await window.AppData.insert('comment', {
          eventId: st.event.id,
          name,
          text
        });
        qs('comment-text').value = '';
        await refresh();
        setMsg('Posted.');
      } catch (err) {
        setMsg(err && err.message ? err.message : 'Post failed.');
      }
    });
  }

  window.Comments = { bind, refresh };
})();