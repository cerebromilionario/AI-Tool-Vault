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

// ---- Cookie Consent Plugin (with fallback banner) ----
function loadCookieConsentPlugin() {
  return new Promise((resolve, reject) => {
    if (window.CookieConsent) {
      resolve();
      return;
    }

    if (!document.querySelector('link[data-cookieconsent-css]')) {
      const css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = 'https://cdn.jsdelivr.net/gh/orestbida/cookieconsent@v3.1.0/dist/cookieconsent.css';
      css.setAttribute('data-cookieconsent-css', 'true');
      document.head.appendChild(css);
    }

    const existingScript = document.querySelector('script[data-cookieconsent-js]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('Cookie consent plugin failed to load.')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/gh/orestbida/cookieconsent@v3.1.0/dist/cookieconsent.umd.js';
    script.defer = true;
    script.setAttribute('data-cookieconsent-js', 'true');
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Cookie consent plugin failed to load.'));
    document.head.appendChild(script);
  });
}

function initLegacyCookieBanner() {
  const banner = document.getElementById('cookie-banner');
  if (!banner) return;

  const accepted = localStorage.getItem('cookie_consent');
  if (accepted) {
    banner.classList.add('hidden');
    return;
  }

  banner.classList.remove('hidden');

  const acceptBtn = document.getElementById('cookie-accept');
  const declineBtn = document.getElementById('cookie-decline');

  if (acceptBtn) {
    acceptBtn.addEventListener('click', () => {
      localStorage.setItem('cookie_consent', 'accepted');
      banner.classList.add('hidden');
      loadAdsense();
    });
  }

  if (declineBtn) {
    declineBtn.addEventListener('click', () => {
      localStorage.setItem('cookie_consent', 'declined');
      banner.classList.add('hidden');
    });
  }
}

(function () {
  const legacyBanner = document.getElementById('cookie-banner');
  if (legacyBanner) legacyBanner.classList.add('hidden');

  loadCookieConsentPlugin()
    .then(() => {
      if (!window.CookieConsent || typeof window.CookieConsent.run !== 'function') {
        initLegacyCookieBanner();
        return;
      }

      window.CookieConsent.run({
        root: 'body',
        guiOptions: {
          consentModal: {
            layout: 'box',
            position: 'bottom right',
            equalWeightButtons: true
          },
          preferencesModal: {
            layout: 'box',
            position: 'right'
          }
        },
        categories: {
          necessary: {
            enabled: true,
            readOnly: true
          },
          analytics: {},
          advertising: {}
        },
        language: {
          default: 'en',
          translations: {
            en: {
              consentModal: {
                title: 'We use cookies',
                description: 'We use cookies to improve experience, analyze traffic, and support advertising. See our <a href="/privacy-policy.html">Privacy Policy</a>.',
                acceptAllBtn: 'Accept all',
                acceptNecessaryBtn: 'Reject optional',
                showPreferencesBtn: 'Manage preferences'
              },
              preferencesModal: {
                title: 'Manage cookie preferences',
                acceptAllBtn: 'Accept all',
                acceptNecessaryBtn: 'Reject optional',
                savePreferencesBtn: 'Save preferences',
                closeIconLabel: 'Close modal',
                sections: [
                  {
                    title: 'Cookie usage',
                    description: 'You can choose which optional cookie categories you want to allow.'
                  },
                  {
                    title: 'Strictly necessary cookies',
                    description: 'Required for core website functionality.',
                    linkedCategory: 'necessary'
                  },
                  {
                    title: 'Analytics cookies',
                    description: 'Help us understand how visitors use the website.',
                    linkedCategory: 'analytics'
                  },
                  {
                    title: 'Advertising cookies',
                    description: 'Used to serve and measure relevant ads.',
                    linkedCategory: 'advertising'
                  }
                ]
              }
            }
          }
        },
        onConsent: ({ cookie }) => {
          if (cookie.categories.includes('advertising')) {
            localStorage.setItem('cookie_consent', 'accepted');
            loadAdsense();
          } else {
            localStorage.setItem('cookie_consent', 'declined');
          }
        },
        onChange: ({ cookie }) => {
          if (cookie.categories.includes('advertising')) {
            localStorage.setItem('cookie_consent', 'accepted');
            loadAdsense();
          } else {
            localStorage.setItem('cookie_consent', 'declined');
          }
        }
      });
    })
    .catch(() => {
      initLegacyCookieBanner();
    });
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
