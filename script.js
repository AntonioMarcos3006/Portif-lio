const lsGet = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };

const reveals = document.querySelectorAll('.reveal');
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
reveals.forEach(el => revealObs.observe(el));

const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');
const secObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navLinks.forEach(a => {
        a.style.color = '';
        if (a.getAttribute('href') === '#' + e.target.id) {
          a.style.color = 'var(--accent)';
        }
      });
    }
  });
}, { rootMargin: '-45% 0px -50% 0px' });
sections.forEach(s => secObs.observe(s));

const LS_THEME  = 'am2_theme';
const LS_COLOR  = 'am2_color';
const LS_FONT   = 'am2_font';

const COLOR_MAP = {
  '#e6b877': { label: 'Dourado'  },
  '#00bfff': { label: 'Azul'     },
  '#1D9E75': { label: 'Verde'    },
  '#E24B4A': { label: 'Vermelho' },
  '#7F77DD': { label: 'Roxo'     },
  '#EF9F27': { label: 'Laranja'  },
};

const FONT_MAP = {
  'Space Grotesk': "'Space Grotesk', sans-serif",
  'Inter':         "'Inter', sans-serif",
  'Poppins':       "'Poppins', sans-serif",
  'Roboto':        "'Roboto', sans-serif",
  'Montserrat':    "'Montserrat', sans-serif",
};

let currentTheme = lsGet(LS_THEME) || 'dark';
let currentColor = lsGet(LS_COLOR) || '#e6b877';
let currentFont  = lsGet(LS_FONT)  || 'Poppins';

const panel      = document.getElementById('custom-panel');
const fab        = document.getElementById('custom-fab');
const overlay    = document.getElementById('custom-overlay');
const closeBtn   = document.getElementById('cp-close-btn');
const btnDark    = document.getElementById('btn-dark');
const btnLight   = document.getElementById('btn-light');
const swatches   = document.querySelectorAll('.cp-swatch:not(.cp-swatch-custom)');
const colorPicker= document.getElementById('cp-color-picker');
const fontBtns   = document.querySelectorAll('.cp-font-btn');
const toast      = document.getElementById('cp-toast');

let toastTimer = null;

function applyTheme(theme) {
  currentTheme = theme;
  if (theme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
  btnDark.classList.toggle('active',  theme === 'dark');
  btnLight.classList.toggle('active', theme === 'light');
  lsSet(LS_THEME, theme);
}

function applyColor(hex) {
  currentColor = hex;
  document.documentElement.style.setProperty('--accent', hex);
  swatches.forEach(s => {
    s.classList.toggle('active', s.dataset.color.toLowerCase() === hex.toLowerCase());
  });
  colorPicker.value = hex;
  lsSet(LS_COLOR, hex);
}

function applyFont(fontName) {
  currentFont = fontName;
  const stack = FONT_MAP[fontName] || "'Poppins', sans-serif";
  document.documentElement.style.setProperty('--font', stack);
  fontBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.font === fontName);
  });
  lsSet(LS_FONT, fontName);
}

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

function openPanel() {
  panel.classList.add('open');
  overlay.classList.add('visible');
  fab.classList.add('open');
  fab.setAttribute('aria-expanded', 'true');
  btnDark.focus();
}
function closePanel() {
  panel.classList.remove('open');
  overlay.classList.remove('visible');
  fab.classList.remove('open');
  fab.setAttribute('aria-expanded', 'false');
}

fab.addEventListener('click', () => {
  panel.classList.contains('open') ? closePanel() : openPanel();
});
overlay.addEventListener('click', closePanel);
closeBtn.addEventListener('click', closePanel);

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && panel.classList.contains('open')) closePanel();
});

btnDark.addEventListener('click', () => {
  applyTheme('dark');
  showToast('Tema escuro ativado');
});
btnLight.addEventListener('click', () => {
  applyTheme('light');
  showToast('Tema claro ativado');
});

swatches.forEach(swatch => {
  swatch.addEventListener('click', () => {
    const hex = swatch.dataset.color;
    applyColor(hex);
    const label = COLOR_MAP[hex] ? COLOR_MAP[hex].label : 'Cor';
    showToast(`Cor ${label} aplicada`);
  });
  swatch.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      swatch.click();
    }
  });
});

colorPicker.addEventListener('input', e => {
  const hex = e.target.value;
  applyColor(hex);
  swatches.forEach(s => s.classList.remove('active'));
});
colorPicker.addEventListener('change', e => {
  showToast('Cor personalizada aplicada');
  lsSet(LS_COLOR, e.target.value);
});

fontBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    applyFont(btn.dataset.font);
    showToast(`Fonte ${btn.dataset.font} aplicada`);
  });
});

(function init() {
  applyTheme(currentTheme);
  applyColor(currentColor);
  applyFont(currentFont);

  const isPreset = Object.keys(COLOR_MAP).map(c => c.toLowerCase()).includes(currentColor.toLowerCase());
  if (!isPreset) {
    colorPicker.value = currentColor;
  }
})();
