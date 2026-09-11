/** Wires the HTML control panel to the scene. */
export function initUI(api) {
  const $ = (id) => document.getElementById(id);

  const toggles = {
    roof: $('t-roof'),
    upper: $('t-upper'),
    labels: $('t-labels'),
    furniture: $('t-furniture'),
  };
  for (const [key, el] of Object.entries(toggles)) {
    el?.addEventListener('change', () => api.setToggle(key, el.checked));
  }

  document.querySelectorAll('[data-view]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-view]').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      api.setView(btn.dataset.view);
    });
  });

  const pairs = $('pairs');
  const pairsOut = $('pairs-value');
  pairs?.addEventListener('input', () => {
    pairsOut.textContent = pairs.value;
    api.setPairs(Number(pairs.value));
  });

  const hour = $('hour');
  const hourOut = $('hour-value');
  const fmt = (h) => {
    const hh = Math.floor(h);
    const mm = Math.round((h - hh) * 60);
    return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
  };
  hour?.addEventListener('input', () => {
    hourOut.textContent = fmt(Number(hour.value));
    api.setHour(Number(hour.value));
  });

  $('panel-toggle')?.addEventListener('click', () => {
    document.body.classList.toggle('panel-hidden');
  });

  document.addEventListener('keydown', (e) => {
    const map = { 1: 'street', 2: 'facade', 3: 'aerial', 4: 'ground', 5: 'upper', 6: 'interior', 7: 'cutaway' };
    if (map[e.key]) {
      api.setView(map[e.key]);
      document.querySelectorAll('[data-view]').forEach((b) => b.classList.toggle('active', b.dataset.view === map[e.key]));
    }
    if (e.key === 'h') document.body.classList.toggle('panel-hidden');
    if (e.key === 'r') api.resetCamera();
  });

  return {
    sync(state) {
      for (const [key, el] of Object.entries(toggles)) if (el) el.checked = state[key];
      if (pairs) {
        pairs.value = String(state.pairs);
        pairsOut.textContent = String(state.pairs);
      }
      if (hour) {
        hour.value = String(state.hour);
        hourOut.textContent = fmt(Number(state.hour));
      }
    },
  };
}
