(() => {
  const mounts = [
    { id: 'app-header', fragment: 'html/header.html' },
    { id: 'app-menu', fragment: 'html/menu.html' },
    { id: 'view-auth', fragment: 'html/auth.html' },
    { id: 'view-dashboard', fragment: 'html/dashboard.html' },
    { id: 'view-event', fragment: 'html/event_main.html' },
    { id: 'event-section-date', fragment: 'html/section_date.html' },
    { id: 'event-section-rsvp', fragment: 'html/section_rsvp.html' },
    { id: 'event-section-place', fragment: 'html/section_place.html' },
    { id: 'event-section-cost', fragment: 'html/section_cost.html' },
    { id: 'event-section-travel', fragment: 'html/section_travel.html' },
    { id: 'event-section-comments', fragment: 'html/section_comments.html' },
    { id: 'event-section-restaurants', fragment: 'html/section_restaurants.html' },
    { id: 'event-section-hotel', fragment: 'html/section_hotel.html' }
  ];

  async function mountOne(m) {
    const host = document.getElementById(m.id);
    if (!host) throw new Error(`Missing mount id: ${m.id}`);
    const res = await fetch(m.fragment, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to load fragment: ${m.fragment}`);
    const html = await res.text();
    host.innerHTML = html;
  }

  async function mountAllSequential() {
    for (let i = 0; i < mounts.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await mountOne(mounts[i]);
    }
  }

  window.Mounts = { mountAllSequential };
})();