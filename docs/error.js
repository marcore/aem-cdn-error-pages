/*
 * Generic branded CDN error page for AEM as a Cloud Service.
 * Rebrand: change BRAND below, the logo SVG (LOGO) and the CSS custom properties.
 *
 * The Adobe-managed CDN serves a minimal HTML shell when it cannot reach the
 * AEM origin, roughly:
 *
 *   <link rel="stylesheet" href="{cssUrl}">
 *   <div id="root" status="503"></div>
 *   <script src="{jsUrl}"></script>
 *
 * This script builds the page inside #root. It has no dependencies and loads
 * nothing from the AEM origin (which is, by definition, unavailable).
 *
 * Preview: open index.html?code=404 (or 403, 406, 500, 503) on GitHub Pages.
 */
(function () {
  'use strict';

  var BRAND = 'My Company';

  var SUPPORTED = ['403', '404', '406', '500', '503'];
  var RETRY_SECONDS = 30;
  var MAX_AUTO_RETRIES = 5;

  // Asset base = the folder this script was served from (e.g. GitHub Pages).
  var script = document.currentScript || document.querySelector('script[src$="error.js"]');
  var BASE = script ? script.src.replace(/[^/]*(\?.*)?$/, '') : './';

  var COPY = {
    en: {
      code: {
        403: { eyebrow: 'Error 403', title: 'Access to this page is restricted', lede: 'Your request was blocked before it reached the website. If you think this is a mistake, contact us and include the reference below.' },
        404: { eyebrow: 'Error 404', title: 'We can\u2019t find this page', lede: 'The address may be mistyped, or the page may have moved. Check the URL or go back to the home page.' },
        406: { eyebrow: 'Error 406', title: 'We couldn\u2019t process this request', lede: 'Your browser asked for the page in a format we can\u2019t provide. Try reloading the page or using a different browser.' },
        500: { eyebrow: 'Error 500', title: 'Something went wrong on our side', lede: 'We\u2019re having trouble loading this page right now. Our teams have been alerted. Please try again in a few moments.' },
        503: { eyebrow: 'Error 503', title: 'We\u2019ll be back shortly', lede: 'This website is temporarily unavailable. Our teams are working to restore it. Please try again in a few moments.' }
      },
      retry: 'Try again',
      home: 'Go to home page',
      countdown: 'Retrying automatically in {s} seconds.',
      cancel: 'Cancel',
      stopped: 'Automatic retry stopped.',
      helpTitle: 'Need help?',
      helpText: 'If the problem continues, contact our support team and share the reference details.',
      refTitle: 'Reference',
      refStatus: 'Status',
      refTime: 'Time (UTC)',
      refUrl: 'URL',
      lang: 'Language'
    },
    de: {
      code: {
        403: { eyebrow: 'Fehler 403', title: 'Der Zugriff auf diese Seite ist eingeschr\u00e4nkt', lede: 'Ihre Anfrage wurde blockiert, bevor sie die Website erreicht hat. Wenn Sie glauben, dass es sich um einen Fehler handelt, kontaktieren Sie uns mit der unten stehenden Referenz.' },
        404: { eyebrow: 'Fehler 404', title: 'Diese Seite wurde nicht gefunden', lede: 'Die Adresse ist m\u00f6glicherweise falsch geschrieben oder die Seite wurde verschoben. Pr\u00fcfen Sie die URL oder kehren Sie zur Startseite zur\u00fcck.' },
        406: { eyebrow: 'Fehler 406', title: 'Diese Anfrage konnte nicht verarbeitet werden', lede: 'Ihr Browser hat die Seite in einem Format angefordert, das wir nicht bereitstellen k\u00f6nnen. Laden Sie die Seite neu oder verwenden Sie einen anderen Browser.' },
        500: { eyebrow: 'Fehler 500', title: 'Bei uns ist etwas schiefgelaufen', lede: 'Diese Seite kann gerade nicht geladen werden. Unsere Teams wurden informiert. Bitte versuchen Sie es in K\u00fcrze erneut.' },
        503: { eyebrow: 'Fehler 503', title: 'Wir sind gleich wieder da', lede: 'Diese Website ist vor\u00fcbergehend nicht verf\u00fcgbar. Unsere Teams arbeiten an der Wiederherstellung. Bitte versuchen Sie es in K\u00fcrze erneut.' }
      },
      retry: 'Erneut versuchen',
      home: 'Zur Startseite',
      countdown: 'Automatischer neuer Versuch in {s} Sekunden.',
      cancel: 'Abbrechen',
      stopped: 'Automatischer neuer Versuch gestoppt.',
      helpTitle: 'Brauchen Sie Hilfe?',
      helpText: 'Wenn das Problem weiterhin besteht, wenden Sie sich an unser Support-Team und geben Sie die Referenzdaten an.',
      refTitle: 'Referenz',
      refStatus: 'Status',
      refTime: 'Zeit (UTC)',
      refUrl: 'URL',
      lang: 'Sprache'
    },
    es: {
      code: {
        403: { eyebrow: 'Error 403', title: 'El acceso a esta p\u00e1gina est\u00e1 restringido', lede: 'Tu solicitud se bloque\u00f3 antes de llegar al sitio web. Si crees que es un error, cont\u00e1ctanos e incluye la referencia que aparece abajo.' },
        404: { eyebrow: 'Error 404', title: 'No encontramos esta p\u00e1gina', lede: 'Es posible que la direcci\u00f3n est\u00e9 mal escrita o que la p\u00e1gina se haya movido. Revisa la URL o vuelve a la p\u00e1gina de inicio.' },
        406: { eyebrow: 'Error 406', title: 'No pudimos procesar esta solicitud', lede: 'Tu navegador pidi\u00f3 la p\u00e1gina en un formato que no podemos ofrecer. Vuelve a cargar la p\u00e1gina o usa otro navegador.' },
        500: { eyebrow: 'Error 500', title: 'Algo ha fallado por nuestra parte', lede: 'Ahora mismo no podemos cargar esta p\u00e1gina. Nuestros equipos ya est\u00e1n avisados. Int\u00e9ntalo de nuevo en unos momentos.' },
        503: { eyebrow: 'Error 503', title: 'Volvemos enseguida', lede: 'Este sitio web no est\u00e1 disponible temporalmente. Nuestros equipos est\u00e1n trabajando para restablecerlo. Int\u00e9ntalo de nuevo en unos momentos.' }
      },
      retry: 'Reintentar',
      home: 'Ir a la p\u00e1gina de inicio',
      countdown: 'Reintentando autom\u00e1ticamente en {s} segundos.',
      cancel: 'Cancelar',
      stopped: 'Reintento autom\u00e1tico detenido.',
      helpTitle: '\u00bfNecesitas ayuda?',
      helpText: 'Si el problema contin\u00faa, contacta con nuestro equipo de soporte e indica los datos de referencia.',
      refTitle: 'Referencia',
      refStatus: 'Estado',
      refTime: 'Hora (UTC)',
      refUrl: 'URL',
      lang: 'Idioma'
    }
  };
  var LANGS = [['en', 'EN'], ['de', 'DE'], ['es', 'ES']];

  // ---------- state ----------
  var params = new URLSearchParams(window.location.search);
  var root = document.getElementById('root');
  if (!root) {
    root = document.createElement('div');
    root.id = 'root';
    document.body.insertBefore(root, document.body.firstChild);
  }
  var cdnStatus = root.getAttribute('status');
  var isPreview = !cdnStatus;
  var status = String(cdnStatus || params.get('code') || '503');
  if (SUPPORTED.indexOf(status) === -1) status = status.charAt(0) === '4' ? '404' : '503';
  var isServerError = status.charAt(0) === '5';

  var lang = detectLang();
  var timer = null;
  var timestamp = new Date().toISOString().replace('T', ' ').replace(/\.\d+Z$/, '');

  function detectLang() {
    var fromParam = params.get('lang');
    if (fromParam && COPY[fromParam]) return fromParam;
    var seg = window.location.pathname.split('/')[1];
    if (seg && COPY[seg.toLowerCase()]) return seg.toLowerCase();
    var nav = (navigator.languages && navigator.languages[0]) || navigator.language || 'en';
    nav = nav.slice(0, 2).toLowerCase();
    return COPY[nav] ? nav : 'en';
  }

  // ---------- tiny DOM helper ----------
  function h(tag, attrs, children) {
    var el = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v === null || v === undefined || v === false) return;
        if (k === 'text') el.textContent = v;
        else if (k.slice(0, 2) === 'on') el.addEventListener(k.slice(2), v);
        else el.setAttribute(k, v === true ? '' : v);
      });
    }
    (children || []).forEach(function (c) {
      if (c) el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return el;
  }

  function svg(markup, cls) {
    var wrap = document.createElement('span');
    wrap.innerHTML = markup; // static, trusted markup only
    var el = wrap.firstChild;
    if (cls) el.setAttribute('class', cls);
    return el;
  }

  var ARROW = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 12h15m-6-6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var REFRESH = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M20 12a8 8 0 1 1-2.34-5.66M20 4v5h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  // Placeholder logo mark: replace with your own SVG.
  var LOGO = '<svg viewBox="0 0 32 32" aria-hidden="true" focusable="false"><rect width="32" height="32" rx="8" fill="#0c66e1"/><path d="M9 22V10l7 7 7-7v12" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  // Decorative line motif for the hero.
  var LINES = '<svg viewBox="0 0 1440 560" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">' +
    '<path d="M-40 520 L360 120"/><path d="M180 600 L560 220"/>' +
    '<path d="M520 600 C620 300 820 300 920 600"/>' +
    '<path d="M1040 -20 L1480 380"/><path d="M1240 -20 L1480 210"/>' +
    '<path d="M900 120 L1260 560"/></svg>';

  // ---------- auto retry (5xx only, capped per session) ----------
  function retryKey() { return 'mc-cdn-retry:' + window.location.pathname; }
  function retryCount() {
    try { return parseInt(sessionStorage.getItem(retryKey()) || '0', 10); } catch (e) { return MAX_AUTO_RETRIES; }
  }
  function bumpRetry() {
    try { sessionStorage.setItem(retryKey(), String(retryCount() + 1)); } catch (e) { /* ignore */ }
  }
  function reload() {
    if (!isPreview) bumpRetry();
    window.location.reload();
  }
  function startCountdown(region, t) {
    if (isPreview || !isServerError || retryCount() >= MAX_AUTO_RETRIES) return;
    var left = RETRY_SECONDS;
    function paint() {
      region.textContent = '';
      region.appendChild(document.createTextNode(t.countdown.replace('{s}', left)));
      region.appendChild(h('button', { type: 'button', text: t.cancel, onclick: stop }));
    }
    function stop() {
      clearInterval(timer);
      timer = null;
      region.textContent = t.stopped;
    }
    paint();
    timer = setInterval(function () {
      left -= 1;
      if (left <= 0) { clearInterval(timer); reload(); return; }
      // Only re-announce every 10s to avoid screen-reader noise.
      if (left % 10 === 0 || left <= 5) paint();
      else region.firstChild.nodeValue = t.countdown.replace('{s}', left);
    }, 1000);
  }

  // ---------- render ----------
  function render() {
    if (timer) { clearInterval(timer); timer = null; }
    var t = COPY[lang];
    var c = t.code[status];
    document.documentElement.lang = lang;
    document.title = c.title + ' | ' + BRAND;

    var langSwitch = h('div', { class: 'mc-lang', role: 'group', 'aria-label': t.lang },
      LANGS.map(function (l) {
        return h('button', {
          type: 'button',
          lang: l[0],
          'aria-pressed': String(l[0] === lang),
          text: l[1],
          onclick: function () { lang = l[0]; render(); }
        });
      }));

    var retryRegion = h('p', { class: 'mc-retry', role: 'status', 'aria-live': 'polite' });

    // 5xx: retrying is the useful action. 4xx: sending people home is.
    var retryBtn = h('button', { type: 'button', class: 'mc-btn ' + (isServerError ? 'mc-btn--primary' : 'mc-btn--ghost'), onclick: reload },
      [svg(REFRESH), t.retry]);
    var homeBtn = h('a', { class: 'mc-btn ' + (isServerError ? 'mc-btn--ghost' : 'mc-btn--primary'), href: '/' },
      [t.home, svg(ARROW)]);
    var actions = status === '403' ? [homeBtn] : (isServerError ? [retryBtn, homeBtn] : [homeBtn, retryBtn]);

    var page = [
      h('header', { class: 'mc-header' }, [
        h('div', { class: 'mc-wrap' }, [h('a', { class: 'mc-brand', href: '/' }, [svg(LOGO, 'mc-logo'), h('span', { class: 'mc-brand-name', text: BRAND })]), langSwitch])
      ]),
      h('main', { class: 'mc-hero', id: 'main' }, [
        svg(LINES, 'mc-hero__lines'),
        h('div', { class: 'mc-wrap' }, [
          h('p', { class: 'mc-eyebrow', text: c.eyebrow }),
          h('h1', { class: 'mc-title', text: c.title }),
          h('p', { class: 'mc-lede', text: c.lede }),
          h('div', { class: 'mc-actions' }, actions),
          retryRegion
        ])
      ]),
      h('section', { class: 'mc-band', 'aria-label': t.helpTitle }, [
        h('div', { class: 'mc-wrap' }, [
          h('div', null, [h('h2', { text: t.helpTitle }), h('p', { text: t.helpText })]),
          h('div', { class: 'mc-ref' }, [
            h('h2', { text: t.refTitle }),
            h('dl', null, [
              h('dt', { text: t.refStatus }), h('dd', { text: status }),
              h('dt', { text: t.refTime }), h('dd', { text: timestamp }),
              h('dt', { text: t.refUrl }), h('dd', { text: window.location.href })
            ])
          ])
        ])
      ]),
      h('footer', { class: 'mc-footer' }, [
        h('div', { class: 'mc-wrap' }, [
          h('span', { text: '\u00a9 ' + new Date().getFullYear() + ' ' + BRAND })
        ])
      ])
    ];

    if (isPreview) {
      page.push(h('nav', { class: 'mc-preview', 'aria-label': 'Preview error code' },
        SUPPORTED.map(function (code) {
          return h('a', {
            href: '?code=' + code + '&lang=' + lang,
            'aria-current': code === status ? 'true' : null,
            text: code
          });
        })));
    }

    document.body.classList.toggle('mc-is-preview', isPreview);
    root.textContent = '';
    page.forEach(function (el) { root.appendChild(el); });
    startCountdown(retryRegion, t);
  }

  render();
})();
