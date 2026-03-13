/* AI Tool Vault — Main JS */

// ---- Mobile Menu Toggle ----
(function () {
  const toggle = document.getElementById('menu-toggle');
  const menu = document.getElementById('main-menu');
  if (!toggle || !menu) return;
  toggle.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
    toggle.textContent = open ? '✕' : '☰';
  });
  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!toggle.contains(e.target) && !menu.contains(e.target)) {
      menu.classList.remove('open');
      toggle.setAttribute('aria-expanded', false);
      toggle.textContent = '☰';
    }
  });
})();

// ---- Cookie Consent Banner ----
(function () {
  const banner = document.getElementById('cookie-banner');
  if (!banner) return;

  const accepted = localStorage.getItem('cookie_consent');
  if (accepted) {
    banner.classList.add('hidden');
    return;
  }

  const acceptBtn = document.getElementById('cookie-accept');
  const declineBtn = document.getElementById('cookie-decline');

  if (acceptBtn) {
    acceptBtn.addEventListener('click', () => {
      localStorage.setItem('cookie_consent', 'accepted');
      banner.classList.add('hidden');
      // Load AdSense after consent
      loadAdsense();
    });
  }
  if (declineBtn) {
    declineBtn.addEventListener('click', () => {
      localStorage.setItem('cookie_consent', 'declined');
      banner.classList.add('hidden');
    });
  }
})();

// ---- Load AdSense after consent ----
function loadAdsense() {
  if (document.querySelector('script[src*="adsbygoogle"]')) return;
  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4613426749830025';
  s.setAttribute('crossorigin', 'anonymous');
  document.head.appendChild(s);
}

// Auto-load if already consented
if (localStorage.getItem('cookie_consent') === 'accepted') {
  loadAdsense();
}

// ---- Active nav link ----
(function () {
  const path = window.location.pathname;
  document.querySelectorAll('.menu a').forEach(link => {
    const href = link.getAttribute('href');
    if (href && (path === href || path.startsWith(href.replace('index.html', '')) && href !== '/index.html')) {
      link.classList.add('active');
    }
    if (path === '/' || path === '/index.html') {
      const homeLink = document.querySelector('.menu a[href="/index.html"]');
      if (homeLink) homeLink.classList.add('active');
    }
  });
})();
