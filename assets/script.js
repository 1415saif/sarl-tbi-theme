(() => {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const menuButton = $('#nav-toggle');
  const mobileMenu = $('#mobile-menu');
  const closeMenu = () => {
    if (!menuButton || !mobileMenu) return;
    mobileMenu.hidden = true;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Ouvrir le menu');
    menuButton.querySelector('i').className = 'icon fa-solid fa-bars';
  };
  menuButton?.addEventListener('click', () => {
    const shouldOpen = mobileMenu.hidden;
    mobileMenu.hidden = !shouldOpen;
    menuButton.setAttribute('aria-expanded', String(shouldOpen));
    menuButton.setAttribute('aria-label', shouldOpen ? 'Fermer le menu' : 'Ouvrir le menu');
    menuButton.querySelector('i').className = 'icon fa-solid ' + (shouldOpen ? 'fa-xmark' : 'fa-bars');
  });
  mobileMenu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') closeMenu(); });

  // Sticky header and current section/page feedback.
  const stickyHeader = document.querySelector('.site-header');
  const navigationLinks = [...document.querySelectorAll('.desktop-nav a, .mobile-nav a')];
  const linkedSections = navigationLinks.map(link => {
    const hash = link.dataset.activeSection || (link.getAttribute('href').startsWith('#') ? link.getAttribute('href').slice(1) : '');
    return {link,section:hash ? document.getElementById(hash) : null};
  }).filter(item => item.section);
  let navTick = false;
  const refreshNavigation = () => {
    stickyHeader?.classList.toggle('is-scrolled',window.scrollY > 30);
    const offset = (stickyHeader?.getBoundingClientRect().height || 90) + 30;
    const candidates = linkedSections.filter(item => item.section.getBoundingClientRect().top <= offset);
    const current = candidates.sort((a,b) => b.section.getBoundingClientRect().top-a.section.getBoundingClientRect().top)[0];
    linkedSections.forEach(({link,section}) => {
      const selected = !!current && section === current.section;
      link.classList.toggle('is-active',selected);
      if(selected) link.setAttribute('aria-current','location');
      else if(link.getAttribute('aria-current') === 'location') link.removeAttribute('aria-current');
    });
    navTick=false;
  };
  window.addEventListener('scroll', () => {if(!navTick){navTick=true;requestAnimationFrame(refreshNavigation);}}, {passive:true});
  window.addEventListener('resize',refreshNavigation,{passive:true});refreshNavigation();
  $('#year').textContent = String(new Date().getFullYear());

  // No third-party analytics is loaded by default. A configured consent manager
  // may set window.tbiAnalyticsConsent = true before events can be sent to GTM.
  const track = (eventName, detail = {}) => {
    if (window.tbiAnalyticsConsent !== true || !Array.isArray(window.dataLayer)) return;
    window.dataLayer.push({event: eventName, ...detail});
  };
  document.querySelectorAll('a[href^="tel:"]').forEach((a) => a.addEventListener('click', () => track('click_to_call')));
  document.querySelectorAll('a[href^="mailto:"]').forEach((a) => a.addEventListener('click', () => track('click_email')));
  document.querySelectorAll('a[href="#devis"]').forEach((a) => a.addEventListener('click', () => track('cta_click', {cta_label: a.textContent.trim().slice(0,80)})));

  const allowedServices = [
    "Flocage coupe-feu",
    "Flocage thermique & acoustique",
    "Calorifugeage CVC",
    "Gaines coupe-feu / STAFF",
    "Conduits de désenfumage",
    "Encoffrements coupe-feu",
    "Isolation soufflée des combles",
    "Isolation thermique",
    "Isolation acoustique",
    "Anti-condensation",
    "Peinture intumescente coupe-feu",
    "Insufflation dans les parois creuses",
    "Joints de dilatation coupe-feu",
    "Panneaux isolants rapportés",
    "Calfeutrement coupe-feu",
    "Protection passive incendie",
    "Autre demande"
];
  const form = $('#lead-form');
  const serviceSelect = $('#lead-service');
  const cityInput = $('#lead-city');

  const quoteDialog = $('#quote-dialog');
  const quoteCard = form.closest('.contact-card');
  const quoteHome = document.createComment('Quote form home');
  quoteCard.before(quoteHome);
  let quoteTrigger;
  const openQuote = (trigger) => {
    quoteTrigger = trigger || document.activeElement;
    closeMenu();
    $('#quote-slot').append(quoteCard);
    quoteDialog.showModal();
    document.body.classList.add('quote-open');
    requestAnimationFrame(() => form.querySelector('input[name="name"]').focus({preventScroll:true}));
  };
  $('#quote-close').addEventListener('click', () => quoteDialog.close());
  quoteDialog.addEventListener('click', (event) => {
    if (event.target === quoteDialog) {
      const r = quoteDialog.getBoundingClientRect();
      if(event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) quoteDialog.close();
    }
  });
  quoteDialog.addEventListener('close', () => {
    quoteHome.after(quoteCard);
    document.body.classList.remove('quote-open');
    quoteTrigger?.focus({preventScroll:true});
  });
  document.querySelectorAll('a[href="#devis"]:not([data-quote-inline])').forEach(link => {
    link.setAttribute('aria-haspopup','dialog');
    link.setAttribute('aria-controls','quote-dialog');
    link.addEventListener('click', event => {event.preventDefault();openQuote(link);});
  });

  const heroTitle = $('#hero-title');
  const variants = {
    'flocage-coupe-feu': ['Flocage coupe-feu','Flocage coupe-feu pour vos chantiers. Notre métier.'],
    'calorifugeage': ['Calorifugeage CVC','Calorifugeage CVC pour vos réseaux techniques.'],
    'gaines-coupe-feu': ['Gaines coupe-feu / STAFF','Gaines coupe-feu : des solutions adaptées à vos ouvrages.'],
    'isolation-thermique': ['Flocage thermique & acoustique','Isolation thermique et acoustique pour vos bâtiments.'],
    'desenfumage': ['Conduits de désenfumage','Des solutions techniques pour vos conduits de désenfumage.'],
    'encoffrements': ['Encoffrements coupe-feu','Encoffrements coupe-feu pour vos installations.'],
    'isolation-combles': ['Isolation soufflée des combles','Isolation soufflée des combles pour vos projets.']
  };
  const params = new URLSearchParams(location.search);
  const variant = variants[params.get('prestation') || ''];
  if (variant && serviceSelect) {
    serviceSelect.value = variant[0];
    if (heroTitle) heroTitle.textContent = variant[1];
  }
  const quickForm = $('#quick-form');
  quickForm?.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const data = new FormData(quickForm);
    const service = String(data.get('service') || '');
    const city = String(data.get('city') || '').trim();
    if (allowedServices.includes(service)) serviceSelect.value = service;
    if (city) cityInput.value = city.slice(0,120);
    openQuote(quickForm.querySelector('button'));
    track('cta_click',{cta_label:'quick_form'});
  });
  document.querySelectorAll('[data-service]').forEach((a) => a.addEventListener('click', () => {
    const service = a.getAttribute('data-service');
    if (allowedServices.includes(service)) serviceSelect.value = service;
  }));

  const accordionItems = [...document.querySelectorAll('.faq-list details')];
  accordionItems.forEach((item) => item.addEventListener('toggle', () => {
    if (item.open) accordionItems.forEach((other) => { if (other !== item) other.open = false; });
  }));
  const statusBox = $('#form-status');
  const submitButton = $('#lead-submit');
  const status = (kind, message) => {
    statusBox.hidden = false;
    statusBox.className = 'form-status '+kind;
    statusBox.textContent = message;
    statusBox.scrollIntoView({behavior:'smooth',block:'nearest'});
  };
  let started = false;
  form?.addEventListener('input', () => { if (!started) { started=true; track('form_start'); } }, {passive:true});
  form?.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    statusBox.hidden = true;
    if (!form.reportValidity()) return;
    if (!serviceSelect.value) {serviceSelect.focus(); return;}
    if (location.protocol === 'file:') {
      status('error','Pour envoyer une demande, lancez le serveur du projet (npm start). Vous pouvez aussi nous appeler au +33 7 61 39 00 04.');
      return;
    }
    const data = new FormData(form);
    const payload = {
      name: String(data.get('name') || '').trim(),
      phone: String(data.get('phone') || '').trim(),
      email: String(data.get('email') || '').trim(),
      service: String(data.get('service') || ''),
      address: String(data.get('address') || '').trim(),
      website: String(data.get('website') || ''),
      attribution: Object.fromEntries(['utm_source','utm_medium','utm_campaign','utm_content','utm_term','gclid','gbraid','wbraid']
        .filter((k) => params.has(k)).map((k) => [k,(params.get(k)||'').slice(0,150)]))
    };
    submitButton.disabled = true;
    submitButton.textContent = 'Envoi en cours…';
    try {
      const response = await fetch('/api/leads', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
      const result = await response.json().catch(()=>({}));
      if (!response.ok || !result.ok) throw new Error(result.message || 'L’envoi du formulaire n’est pas encore configuré. Merci de nous contacter directement.');
      status('success','Merci, votre demande a bien été envoyée. Nous avons reçu les informations de votre projet.');
      track('generate_lead',{lead_service:payload.service});
      form.reset();started=false;
      if (variant) serviceSelect.value = variant[0];
      if (quoteDialog.open) quoteDialog.close();
      $('#lead-confirmation').hidden = false;
      setTimeout(() => { $('#lead-confirmation').hidden = true; }, 7000);
    } catch (err) {
      status('error', (err && err.message ? err.message : 'L’envoi a échoué.')+' Vous pouvez aussi nous joindre au +33 7 61 39 00 04.');
    } finally {
      submitButton.disabled=false;
      submitButton.innerHTML='Envoyer ma demande <i class="icon fa-solid fa-arrow-right" aria-hidden="true"></i>';
    }
  });
  const logoPause = $('.carousel-toggle');
  logoPause?.addEventListener('click', () => {
    const paused = logoPause.getAttribute('aria-pressed') !== 'true';
    logoPause.setAttribute('aria-pressed',String(paused));
    $('.logo-track').classList.toggle('is-paused', paused);
    logoPause.textContent = paused ? 'Reprendre le défilement' : 'Mettre les logos en pause';
  });
  // Service orientation and new inline enquiry actions.
  const croContent = window.TBI_CRO_CONTENT || {categories:[],testimonials:[]};
  document.addEventListener('click', event => {
    const link = event.target.closest('a[data-quote-inline]');
    if (!link) return;
    event.preventDefault();
    if (allowedServices.includes(link.dataset.service)) serviceSelect.value = link.dataset.service;
    closeMenu();
    if (quoteDialog.open) quoteDialog.close();
    $('#devis').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',block:'start'});
    form.querySelector('input[name="name"]').focus({preventScroll:true});
    track('cta_click',{cta_label:'service_orientation',lead_service:serviceSelect.value});
  });

  if ($('#testimonial-cards')) {
  // Real, publication-approved testimonials replace factual trust cards when supplied.
  const approvedReviews = (croContent.testimonials || []).filter(review =>
    review.verified === true && review.approved === true &&
    typeof review.quote === 'string' && review.quote.trim() &&
    typeof review.name === 'string' && review.name.trim() &&
    typeof review.company === 'string' && review.company.trim()
  ).slice(0,3);
  if (approvedReviews.length) {
    const grid = $('#testimonial-cards');
    grid.replaceChildren();
    approvedReviews.forEach(review => {
      const card = document.createElement('figure');card.className = 'testimonial-card';
      const mark = document.createElement('span');mark.className = 'testimonial-mark';mark.textContent = '“';mark.setAttribute('aria-hidden','true');
      const quote = document.createElement('blockquote');quote.textContent = review.quote;
      const caption = document.createElement('figcaption');
      const name = document.createElement('strong');name.textContent = review.name;
      const company = document.createElement('span');company.textContent = [review.role,review.company].filter(Boolean).join(' · ');
      caption.append(name,company);
      if (typeof review.portrait === 'string' && review.portrait.startsWith('/public/images/') && !review.portrait.includes('..')) {
        const portrait = document.createElement('img');portrait.src = review.portrait;portrait.alt = '';portrait.className = 'testimonial-portrait';portrait.loading = 'lazy';caption.prepend(portrait);
      }
      if (typeof review.logo === 'string' && review.logo.startsWith('/public/images/') && !review.logo.includes('..')) {
        const logo = document.createElement('img');logo.src = review.logo;logo.alt = review.company;logo.loading = 'lazy';caption.append(logo);
      }
      card.append(mark,quote,caption);grid.append(card);
    });
    grid.hidden = false;
    $('#trust-description').textContent = 'Les retours de nos clients sur leurs échanges et leurs projets avec SARL TBI.';
  }


  const reviewTrack = $('#testimonial-cards');
  const reviewPrev = $('#review-prev');
  const reviewNext = $('#review-next');
  const reviewPosition = $('#review-position');
  const reviewMetrics = () => {
    const card = reviewTrack.firstElementChild;
    const gap = parseFloat(getComputedStyle(reviewTrack).columnGap) || 20;
    const stride = card ? card.getBoundingClientRect().width + gap : 1;
    const count = reviewTrack.children.length;
    const first = Math.min(count,Math.round(reviewTrack.scrollLeft / stride) + 1);
    const visible = Math.max(1,Math.floor((reviewTrack.clientWidth + gap + 1) / stride));
    reviewPrev.disabled = reviewTrack.scrollLeft <= 2;
    reviewNext.disabled = reviewTrack.scrollLeft >= reviewTrack.scrollWidth - reviewTrack.clientWidth - 2;
    reviewPosition.textContent = first + '–' + Math.min(count,first + visible - 1) + ' / ' + count;
    return stride;
  };
  const moveReviews = direction => reviewTrack.scrollBy({left:direction * reviewMetrics(),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
  reviewPrev.addEventListener('click', () => moveReviews(-1));
  reviewNext.addEventListener('click', () => moveReviews(1));
  reviewTrack.addEventListener('scroll', reviewMetrics, {passive:true});
  reviewTrack.addEventListener('keydown', event => {
    if(event.target !== reviewTrack) return;
    if(event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();moveReviews(event.key === 'ArrowRight' ? 1 : -1);
    }
  });
  window.addEventListener('resize', reviewMetrics, {passive:true});
  reviewMetrics();

  }
})();
