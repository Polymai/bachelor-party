(() => {
  let map = null;
  let marker = null;
  let last = null;

  function qs(id) {
    return document.getElementById(id);
  }

  function setCoordsText() {
    const el = qs('place-coords');
    if (!el) return;
    if (!last) {
      el.textContent = 'No pin set.';
      return;
    }
    el.textContent = `Lat ${last.lat.toFixed(5)}, Lng ${last.lng.toFixed(5)} (zoom ${last.zoom})`;
  }

  function ensureMap() {
    if (map) return map;
    const box = qs('map');
    if (!box) return null;
    if (!window.L) return null;

    map = window.L.map(box, { zoomControl: true }).setView([40.0, -98.0], 4);
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    map.on('click', (e) => {
      setMarker(e.latlng.lat, e.latlng.lng);
    });

    map.on('zoomend', () => {
      if (!map) return;
      if (last) last.zoom = map.getZoom();
      setCoordsText();
    });

    setCoordsText();
    return map;
  }

  function setMarker(lat, lng, zoom) {
    const m = ensureMap();
    if (!m) return;
    const z = typeof zoom === 'number' ? zoom : m.getZoom();

    last = { lat, lng, zoom: z };

    const ll = window.L.latLng(lat, lng);
    if (!marker) {
      marker = window.L.marker(ll, { draggable: true }).addTo(m);
      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        last = { lat: pos.lat, lng: pos.lng, zoom: m.getZoom() };
        setCoordsText();
      });
    } else {
      marker.setLatLng(ll);
    }

    m.setView(ll, z);
    setCoordsText();
  }

  function clearMarker() {
    if (marker && map) {
      map.removeLayer(marker);
    }
    marker = null;
    last = null;
    setCoordsText();
  }

  function getCoords() {
    if (!last) return null;
    return Object.assign({}, last);
  }

  function syncFromEvent() {
    const st = window.State.getState();
    const ev = st.event;
    if (!ev) return;

    const place = ev.payload && ev.payload.place ? ev.payload.place : null;
    ensureMap();

    if (!place || typeof place.lat !== 'number' || typeof place.lng !== 'number') {
      clearMarker();
      return;
    }
    const zoom = typeof place.zoom === 'number' ? place.zoom : 13;
    setMarker(place.lat, place.lng, zoom);
  }

  function bindControls() {
    const btnMy = qs('btn-use-my-location');
    const btnClear = qs('btn-clear-location');

    if (btnMy) {
      btnMy.addEventListener('click', () => {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setMarker(pos.coords.latitude, pos.coords.longitude, 14);
          },
          () => {}
        );
      });
    }

    if (btnClear) {
      btnClear.addEventListener('click', () => {
        clearMarker();
      });
    }
  }

  window.MapOSM = { ensureMap, setMarker, clearMarker, getCoords, syncFromEvent, bindControls };
})();