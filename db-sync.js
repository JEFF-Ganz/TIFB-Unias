// ============================================================
// DB-SYNC.JS — Realtime Firebase → Main Website Sync
// TIF-B CyberSquad | Loads all content from Firebase
// and applies it to the page in real-time
// ============================================================

(function() {
  'use strict';

  // ─── Utility helpers ────────────────────────────────────
  function setText(selector, value, isHTML = false) {
    const el = document.querySelector(selector);
    if (!el || !value) return;
    if (isHTML) el.innerHTML = value;
    else el.textContent = value;
  }

  function setAttr(selector, attr, value) {
    const el = document.querySelector(selector);
    if (!el || !value) return;
    el.setAttribute(attr, value);
  }

  function setAll(selector, attr, value) {
    document.querySelectorAll(selector).forEach(el => el.setAttribute(attr, value));
  }

  // ─── HERO SECTION ────────────────────────────────────────
  function applyHero(data) {
    if (!data) return;
    if (data.title)    setText('#home h1', data.title, true);
    if (data.subtitle) setText('#home p',  data.subtitle, true);

    const btn1 = document.querySelector('#home a:first-of-type');
    const btn2 = document.querySelector('#home a:nth-of-type(2)');
    if (btn1) {
      if (data.btn1Text) btn1.textContent = data.btn1Text;
      if (data.btn1Link) btn1.href = data.btn1Link;
    }
    if (btn2) {
      if (data.btn2Text) btn2.textContent = data.btn2Text;
      if (data.btn2Link) btn2.href = data.btn2Link;
    }

    // Dispatch slides separately
    if (data.slides) {
      document.dispatchEvent(new CustomEvent('firebase:heroSlides', { detail: data.slides }));
    }
  }

  // ─── ABOUT SECTION ───────────────────────────────────────
  function applyAbout(data) {
    if (!data) return;
    const paras = document.querySelectorAll('#about .fade-in:first-child p');
    if (paras[0] && data.historyText1) paras[0].innerHTML = data.historyText1;
    if (paras[1] && data.historyText2) paras[1].innerHTML = data.historyText2;

    // Visi
    if (data.visi) {
      const visiEl = document.querySelector('#about .fa-eye')?.closest('div.bg-gray-800')?.querySelector('p');
      if (visiEl) visiEl.innerHTML = data.visi;
    }
    // Misi
    if (data.misi) {
      const misiEl = document.querySelector('#about .fa-bullseye')?.closest('div.bg-gray-800')?.querySelector('p');
      if (misiEl) misiEl.innerHTML = data.misi;
    }
    // Motto
    if (data.motto) {
      const mottoEl = document.querySelector('#about .fa-quote-left')?.closest('div.bg-gray-800')?.querySelector('p');
      if (mottoEl) mottoEl.innerHTML = data.motto;
    }

    // Photo
    if (data.photo) {
      setAttr('#aboutImg', 'src', data.photo);
    }
  }

  // ─── MEMBERS SECTION ─────────────────────────────────────
  function applyMembers(data) {
    const memberData = data ? Object.values(data) : null;
    if (!memberData || !memberData.length) return;

    // Override the script.js memberData — since script.js runs independently,
    // we dispatch a custom event with the new member data
    window._firebaseMembers = memberData;
    document.dispatchEvent(new CustomEvent('firebase:members', { detail: memberData }));
  }

  // ─── SCHEDULE SECTION ────────────────────────────────────
  function applySchedule(data) {
    if (!data) return;
    const entries = Object.values(data);
    window._firebaseSchedule = entries;
    document.dispatchEvent(new CustomEvent('firebase:schedule', { detail: entries }));
  }

  // ─── GALLERY SECTION ─────────────────────────────────────
  function applyGallery(data) {
    if (!data) return;
    const entries = Object.values(data);
    document.dispatchEvent(new CustomEvent('firebase:gallery', { detail: entries }));
  }

  // ─── PENGURUS KELAS SECTION ──────────────────────────────
  function applyPengurus(data) {
    if (!data) return;
    const entries = Object.values(data);
    window._firebasePengurus = entries;
    document.dispatchEvent(new CustomEvent('firebase:pengurus', { detail: entries }));
  }

  // ─── CONTACT SECTION ─────────────────────────────────────
  function applyContact(data) {
    if (!data) return;
    if (data.email) {
      const emailLink = document.querySelector('#contact .fa-envelope').closest('.text-center').querySelector('a');
      if (emailLink) { emailLink.href = `mailto:${data.email}`; emailLink.textContent = data.email; }
    }
    if (data.waLink) {
      const waLink = document.querySelector('#contact .fa-whatsapp').closest('.text-center').querySelector('a');
      if (waLink) { waLink.href = data.waLink; }
    }
    if (data.whatsapp) {
      const waText = document.querySelector('#contact .fa-whatsapp').closest('.text-center').querySelector('a');
      if (waText) waText.textContent = data.whatsapp;
    }
    if (data.address) {
      const addrEl = document.querySelector('#contact .fa-map-marker-alt').closest('.text-center').querySelector('p');
      if (addrEl) addrEl.textContent = data.address;
    }
    if (data.workHours) {
      const hoursEl = document.querySelector('#contact .fa-clock').closest('.text-center').querySelector('p');
      if (hoursEl) hoursEl.innerHTML = data.workHours;
    }
    if (data.instagramUrl) {
      const igEl = document.querySelector('a[href*="instagram.com"]');
      if (igEl) igEl.href = data.instagramUrl;
      const ftrIgEl = document.querySelector('.fab.fa-instagram').closest('a');
      if (ftrIgEl) ftrIgEl.href = data.instagramUrl;
    }
    if (data.youtubeUrl) {
      const ytEl = document.querySelector('a[href*="youtube.com"]');
      if (ytEl) ytEl.href = data.youtubeUrl;
    }
    if (data.facebookUrl) {
      const fbEl = document.querySelector('a[href*="facebook.com"]');
      if (fbEl) fbEl.href = data.facebookUrl;
    }
  }

  // ─── NAV & FOOTER ────────────────────────────────────────
  function applyNav(data) {
    if (!data) return;
    if (data.logoText) {
      const logo = document.querySelector('header a.gradient-text');
      if (logo) logo.textContent = data.logoText;
    }
  }

  function applyFooter(data) {
    if (!data) return;
    if (data.copyright) {
      const cpEl = document.getElementById('footerCopyrightText');
      if (cpEl) cpEl.innerHTML = data.copyright;
    }
    if (data.developerName) {
      const devEl = document.querySelector('footer h4.text-white.font-bold.text-lg');
      if (devEl) devEl.textContent = data.developerName;
    }
    if (data.developerRole) {
      const roleEl = document.querySelector('footer .text-purple-400.text-sm');
      if (roleEl) roleEl.textContent = data.developerRole;
    }
    if (data.developerName) {
      const devCredit = document.getElementById('footerDevCredit');
      if (devCredit) devCredit.textContent = `Developed by ${data.developerName}`;
    }
    if (data.developerPhoto) {
      const devPhoto = document.getElementById('footerDevPhoto');
      if (devPhoto) devPhoto.src = data.developerPhoto;
    }
  }

  // ─── MAIN: Subscribe to Firebase Realtime Updates ────────
  function startSync() {
    try {
      // siteContent (hero, about, contact, nav, footer)
      db.ref('siteContent').on('value', snap => {
        const d = snap.val() || {};
        applyHero(d.hero);
        applyAbout(d.about);
        applyContact(d.contact);
        applyNav(d.nav);
        applyFooter(d.footer);
        
        // Dispatch music array so script.js can pick it up
        const musicList = d.music || [];
        window._firebaseMusic = musicList;
        document.dispatchEvent(new CustomEvent('firebase:music', { detail: musicList }));
      });

      // members
      db.ref('members').on('value', snap => {
        applyMembers(snap.val());
      });

      // pengurus
      db.ref('pengurus').on('value', snap => applyPengurus(snap.val()));

      // schedule
      db.ref('schedule').on('value', snap => {
        applySchedule(snap.val());
      });

      // gallery
      db.ref('gallery').on('value', snap => {
        applyGallery(snap.val());
      });

    } catch(e) {
      console.warn('Firebase sync error (site will use default content):', e);
    }
  }

  // Start after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startSync);
  } else {
    startSync();
  }
})();
