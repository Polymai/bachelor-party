(() => {
  function setActiveSection(key) {
    const tabs = Array.from(document.querySelectorAll('.section-tab'));
    tabs.forEach((t) => t.classList.toggle('is-active', t.getAttribute('data-section') === key));

    const map = {
      date: 'event-section-date',
      rsvp: 'event-section-rsvp',
      place: 'event-section-place',
      cost: 'event-section-cost',
      travel: 'event-section-travel',
      comments: 'event-section-comments',
      restaurants: 'event-section-restaurants',
      hotel: 'event-section-hotel'
    };

    Object.keys(map).forEach((k) => {
      const id = map[k];
      const panel = document.getElementById(id);
      if (!panel) return;
      panel.classList.toggle('is-active', k === key);
    });

    if (key === 'place') window.MapOSM.ensureMap();
  }

  function bindSectionTabs() {
    const tabs = Array.from(document.querySelectorAll('.section-tab'));
    tabs.forEach((tab) => {
      tab.addEventListener('click', async () => {
        const key = tab.getAttribute('data-section');
        if (!key) return;
        setActiveSection(key);

        if (key === 'comments') {
          try { await window.Comments.refresh(); } catch (_e) {}
        }
        if (key === 'rsvp') {
          try { await window.RSVP.refreshList(); } catch (_e) {}
        }
      });
    });
  }

  window.UISections = { bindSectionTabs, setActiveSection };
})();