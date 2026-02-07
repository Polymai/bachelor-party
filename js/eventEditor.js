(() => {
  function qs(id) {
    return document.getElementById(id);
  }

  function setText(id, text) {
    const el = qs(id);
    if (el) el.textContent = text || '';
  }

  function setMsg(id, msg) {
    setText(id, msg || '');
  }

  function toInputDateTimeValue(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    const pad = (n) => String(n).padStart(2, '0');
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mi = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
  }

  function fromInputDateTimeValue(v) {
    const val = (v || '').trim();
    if (!val) return '';
    const d = new Date(val);
    if (Number.isNaN(d.getTime())) return '';
    return d.toISOString();
  }

  function renderEventHeader() {
    const st = window.State.getState();
    const ev = st.event;
    if (!ev) return;

    const payload = ev.payload || {};
    const name = payload.name || 'Event';
    setText('event-name', name);

    const code = payload.code ? `Code: ${payload.code}` : '';
    const adminHint = st.user && ev.created_by === st.user.id ? 'Admin: yes' : 'Admin: no';
    setText('event-meta', [code, adminHint].filter(Boolean).join(' • '));
  }

  function fillFormFieldsFromEvent() {
    const ev = window.State.getState().event;
    if (!ev) return;
    const p = ev.payload || {};

    const start = qs('date-start');
    const end = qs('date-end');
    if (start) start.value = toInputDateTimeValue(p.dateStart || '');
    if (end) end.value = toInputDateTimeValue(p.dateEnd || '');

    const placeName = qs('place-name');
    const placeNotes = qs('place-notes');
    if (placeName) placeName.value = (p.place && p.place.name) ? p.place.name : '';
    if (placeNotes) placeNotes.value = (p.place && p.place.notes) ? p.place.notes : '';

    const costNotes = qs('cost-notes');
    const travelNotes = qs('travel-notes');
    const restaurantsNotes = qs('restaurants-notes');
    const hotelNotes = qs('hotel-notes');

    if (costNotes) costNotes.value = p.costNotes || '';
    if (travelNotes) travelNotes.value = p.travelNotes || '';
    if (restaurantsNotes) restaurantsNotes.value = p.restaurantsNotes || '';
    if (hotelNotes) hotelNotes.value = p.hotelNotes || '';

    window.MapOSM.syncFromEvent();
  }

  function isAdminForLoadedEvent() {
    const st = window.State.getState();
    return !!st.user && !!st.event && st.event.created_by === st.user.id;
  }

  async function saveEventPatch(patch, msgId) {
    const st = window.State.getState();
    if (!st.event) throw new Error('No event loaded');
    if (!isAdminForLoadedEvent()) throw new Error('Admin only');

    const nextPayload = Object.assign({}, st.event.payload || {}, patch);
    const updated = await window.AppData.updateById(st.event.id, 'event', nextPayload);
    window.State.setState({ event: updated });
    renderEventHeader();
    fillFormFieldsFromEvent();
    setMsg(msgId, 'Saved.');
  }

  function bindEditorButtons() {
    const btnRefresh = qs('btn-refresh-event');
    if (btnRefresh) {
      btnRefresh.addEventListener('click', async () => {
        const st = window.State.getState();
        if (!st.currentEventId) return;
        try {
          await window.EventService.loadEventById(st.currentEventId);
          renderEventHeader();
          fillFormFieldsFromEvent();
        } catch (_e) {}
      });
    }

    const btnSaveDate = qs('btn-save-date');
    if (btnSaveDate) {
      btnSaveDate.addEventListener('click', async () => {
        setMsg('date-msg', '');
        try {
          const start = fromInputDateTimeValue(qs('date-start')?.value || '');
          const end = fromInputDateTimeValue(qs('date-end')?.value || '');
          await saveEventPatch({ dateStart: start, dateEnd: end }, 'date-msg');
        } catch (err) {
          setMsg('date-msg', err && err.message ? err.message : 'Save failed.');
        }
      });
    }

    const btnSavePlace = qs('btn-save-place');
    if (btnSavePlace) {
      btnSavePlace.addEventListener('click', async () => {
        setMsg('place-msg', '');
        try {
          const st = window.State.getState();
          const prev = (st.event && st.event.payload && st.event.payload.place) ? st.event.payload.place : {};
          const place = Object.assign({}, prev, {
            name: (qs('place-name')?.value || '').trim(),
            notes: (qs('place-notes')?.value || '').trim()
          });
          const coords = window.MapOSM.getCoords();
          if (coords) {
            place.lat = coords.lat;
            place.lng = coords.lng;
            place.zoom = coords.zoom;
          } else {
            place.lat = null;
            place.lng = null;
          }
          await saveEventPatch({ place }, 'place-msg');
        } catch (err) {
          setMsg('place-msg', err && err.message ? err.message : 'Save failed.');
        }
      });
    }

    const btnSaveCost = qs('btn-save-cost');
    if (btnSaveCost) {
      btnSaveCost.addEventListener('click', async () => {
        setMsg('cost-msg', '');
        try {
          await saveEventPatch({ costNotes: (qs('cost-notes')?.value || '').trim() }, 'cost-msg');
        } catch (err) {
          setMsg('cost-msg', err && err.message ? err.message : 'Save failed.');
        }
      });
    }

    const btnSaveTravel = qs('btn-save-travel');
    if (btnSaveTravel) {
      btnSaveTravel.addEventListener('click', async () => {
        setMsg('travel-msg', '');
        try {
          await saveEventPatch({ travelNotes: (qs('travel-notes')?.value || '').trim() }, 'travel-msg');
        } catch (err) {
          setMsg('travel-msg', err && err.message ? err.message : 'Save failed.');
        }
      });
    }

    const btnSaveRestaurants = qs('btn-save-restaurants');
    if (btnSaveRestaurants) {
      btnSaveRestaurants.addEventListener('click', async () => {
        setMsg('restaurants-msg', '');
        try {
          await saveEventPatch({ restaurantsNotes: (qs('restaurants-notes')?.value || '').trim() }, 'restaurants-msg');
        } catch (err) {
          setMsg('restaurants-msg', err && err.message ? err.message : 'Save failed.');
        }
      });
    }

    const btnSaveHotel = qs('btn-save-hotel');
    if (btnSaveHotel) {
      btnSaveHotel.addEventListener('click', async () => {
        setMsg('hotel-msg', '');
        try {
          await saveEventPatch({ hotelNotes: (qs('hotel-notes')?.value || '').trim() }, 'hotel-msg');
        } catch (err) {
          setMsg('hotel-msg', err && err.message ? err.message : 'Save failed.');
        }
      });
    }
  }

  function bindDashboardActions() {
    const formCreate = qs('form-create-event');
    const createMsg = qs('create-event-msg');
    const formJoin = qs('form-join-event');
    const joinMsg = qs('join-event-msg');

    const openCurrent = qs('btn-open-current-event');
    const clearCurrent = qs('btn-clear-current-event');
    const currentMsg = qs('current-event-msg');

    if (formCreate) {
      formCreate.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (createMsg) createMsg.textContent = '';
        try {
          const name = (qs('create-event-name')?.value || '').trim();
          const row = await window.EventService.createEvent(name);
          if (createMsg) createMsg.textContent = `Created. Event code: ${row.payload.code}`;
          renderEventHeader();
          fillFormFieldsFromEvent();
          window.Router.route();
        } catch (err) {
          if (createMsg) createMsg.textContent = err && err.message ? err.message : 'Create failed.';
        }
      });
    }

    if (formJoin) {
      formJoin.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (joinMsg) joinMsg.textContent = '';
        try {
          const code = (qs('join-event-code')?.value || '').trim();
          const dn = (qs('join-display-name')?.value || '').trim();
          await window.EventService.joinEventByCode(code, dn);
          if (joinMsg) joinMsg.textContent = 'Joined.';
          renderEventHeader();
          fillFormFieldsFromEvent();
          window.Router.route();
          await window.RSVP.refreshList();
        } catch (err) {
          if (joinMsg) joinMsg.textContent = err && err.message ? err.message : 'Join failed.';
        }
      });
    }

    if (openCurrent) {
      openCurrent.addEventListener('click', async () => {
        if (currentMsg) currentMsg.textContent = '';
        const id = window.Storage.get('currentEventId', null);
        if (!id) {
          if (currentMsg) currentMsg.textContent = 'No current event stored on this device.';
          return;
        }
        try {
          await window.EventService.loadEventById(id);
          renderEventHeader();
          fillFormFieldsFromEvent();
          window.Router.route();
          await window.RSVP.refreshList();
          await window.Comments.refresh();
        } catch (err) {
          if (currentMsg) currentMsg.textContent = err && err.message ? err.message : 'Could not load.';
        }
      });
    }

    if (clearCurrent) {
      clearCurrent.addEventListener('click', () => {
        window.Storage.remove('currentEventId');
        window.State.setState({ currentEventId: null, event: null });
        if (currentMsg) currentMsg.textContent = 'Cleared.';
        window.Router.route();
      });
    }
  }

  function renderAdminHints() {
    const admin = isAdminForLoadedEvent();
    const ids = [
      'btn-save-date',
      'btn-save-place',
      'btn-save-cost',
      'btn-save-travel',
      'btn-save-restaurants',
      'btn-save-hotel'
    ];
    ids.forEach((id) => {
      const el = qs(id);
      if (el) el.disabled = !admin;
    });
  }

  function onEventLoaded() {
    renderEventHeader();
    fillFormFieldsFromEvent();
    renderAdminHints();
  }

  window.EventEditor = { bindEditorButtons, bindDashboardActions, onEventLoaded, isAdminForLoadedEvent };
})();