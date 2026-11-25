(() => {
  const $ = id => document.getElementById(id);
  const notes = [
    'Если бы улыбки были заклинаниями, твоя была бы моей любимой.',
    'Викусик, пусть сегодня найдётся хотя бы одна причина улыбнуться. Можно начать с этой звёздочки: ✦',
    'Даже ведьмочкам иногда нужен отдых. Завернись в уют и побудь немножко без дел.',
    'У меня нет волшебной палочки. Поэтому я сделал тебе маленькую вселенную.',
    'Ты умеешь делать обычный день чуть менее обычным. Мне это очень нравится.',
    'Тебе не обязательно сегодня покорять мир. Можно просто быть собой. Этого достаточно.',
    'Осторожно: это сообщение заряжено на тёплую улыбку. Побочные эффекты — уют и звёздочки.'
  ];
  let noteIndex = 0, sound = false, audio, toastTimer;
  const read = () => { try { return JSON.parse(localStorage.getItem('little-magic-v1')) || {}; } catch { return {}; } };
  let progress = read();
  if (!progress || typeof progress !== 'object' || Array.isArray(progress)) progress = {};
  const updateProgress = () => {
    const count = ['memory', 'stars', 'constellation'].filter(g => progress[g] === true).length;
    $('progressNote').textContent = count ? `Твои открытия: ${count} из 3 ${count === 3 ? '— вся маленькая вселенная сияет! ♡' : '— продолжим волшебство? ✧'}` : 'Твои открытия будут ждать здесь ✧';
  };
  updateProgress();
  const toast = message => { $('toast').textContent = message; $('toast').hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => $('toast').hidden = true, 3500); };
  const chime = () => {
    if (!sound) return;
    try {
      audio ||= new (window.AudioContext || window.webkitAudioContext)();
      audio.resume();
      [523.25, 659.25, 783.99].forEach((hz, i) => {
        const osc = audio.createOscillator(), gain = audio.createGain(), time = audio.currentTime + i * .1;
        osc.type = 'sine'; osc.frequency.value = hz;
        gain.gain.setValueAtTime(0, time); gain.gain.linearRampToValueAtTime(.045, time + .02); gain.gain.exponentialRampToValueAtTime(.001, time + .55);
        osc.connect(gain).connect(audio.destination); osc.start(time); osc.stop(time + .6);
      });
    } catch { sound = false; $('soundToggle').setAttribute('aria-pressed', 'false'); $('soundToggle').setAttribute('aria-label', 'Включить звуки'); toast('В этом браузере звук недоступен. Магия продолжается ♡'); }
  };
  $('soundToggle').addEventListener('click', () => {
    sound = !sound;
    $('soundToggle').setAttribute('aria-pressed', String(sound));
    $('soundToggle').setAttribute('aria-label', sound ? 'Выключить звуки' : 'Включить звуки');
    toast(sound ? 'Тихие звуки включены ♫' : 'Звуки выключены'); chime();
  });
  document.querySelectorAll('[data-game]').forEach(button => button.addEventListener('click', () => window.UniverseGames.open(button.dataset.game)));
  $('newNote').addEventListener('click', () => { noteIndex = (noteIndex + 1) % notes.length; $('kindNote').textContent = notes[noteIndex]; chime(); });
  window.addEventListener('universe:win', event => {
    const game = event.detail?.game;
    if (!['memory', 'stars', 'constellation'].includes(game)) return;
    progress[game] = true;
    try { localStorage.setItem('little-magic-v1', JSON.stringify(progress)); } catch {}
    updateProgress(); chime();
  });
  $('openLetter').addEventListener('click', () => { $('letterDialog').showModal(); chime(); });
  $('closeLetter').addEventListener('click', () => $('letterDialog').close());
  $('letterDialog').addEventListener('click', e => { if (e.target === $('letterDialog')) { const r = e.target.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) e.target.close(); } });
  $('hugButton').addEventListener('click', () => { $('hugStatus').textContent = 'Лови тёплое виртуальное объятие ♡ Оно остаётся здесь, только для тебя.'; chime(); });
})();
