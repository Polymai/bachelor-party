(() => {
  function randChunk() {
    return Math.random().toString(36).slice(2, 6).toUpperCase();
  }

  function newEventCode() {
    return `BP-${randChunk()}${randChunk()}`;
  }

  function normalizeCode(code) {
    return (code || '').trim().toUpperCase();
  }

  async function createEvent(name) {
    const code = newEventCode();
    const adminCode = newEventCode();

    const payload = {
      name: (name || 'Bachelor Party').trim(),
      code,
      adminCode,
      dateStart: '',
      dateEnd: '',
      place: { name: '', notes: '', lat: null, lng: null, zoom: 13 },
      costNotes: '',
      travelNotes: '',
      restaurantsNotes: '',
      hotelNotes: '',
      createdAt: new Date().toISOString()
    };

    const row = await window.AppData.insert('event', payload);
    window.Storage.set('currentEventId', row.id);
    window.State.setState({ currentEventId: row.id, event: row });
    return row;
  }

  async function loadEventById(id) {
    const row = await window.AppData.getById(id);
    if (!row || row.type !== 'event') throw new Error('Event not found');
    window.Storage.set('currentEventId', row.id);
    window.State.setState({ currentEventId: row.id, event: row });
    return row;
  }

  async function findEventByCode(code) {
    const target = normalizeCode(code);
    if (!target) return null;

    const events = await window.AppData.listByType('event', { limit: 200, asc: false });
    const match = events.find((e) => e && e.payload && normalizeCode(e.payload.code) === target);
    return match || null;
  }

  async function joinEventByCode(code, displayName) {
    const ev = await findEventByCode(code);
    if (!ev) throw new Error('Invalid event code');

    await window.AppData.insert('membership', {
      eventId: ev.id,
      displayName: (displayName || '').trim(),
      rsvp: 'maybe',
      updatedAt: new Date().toISOString()
    });

    window.Storage.set('currentEventId', ev.id);
    window.State.setState({ currentEventId: ev.id, event: ev });
    return ev;
  }

  window.EventService = { createEvent, loadEventById, joinEventByCode };
})();