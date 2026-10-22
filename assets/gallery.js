/* SARL TBI gallery: latest-request wins; controls stay responsive while images load. */
(() => {
  'use strict';
  const dialog = document.querySelector('#gallery-dialog');
  const buttons = [...document.querySelectorAll('.portfolio-open')];
  if (!dialog || !buttons.length) return;
  const image = dialog.querySelector('#gallery-large-image');
  const stage = dialog.querySelector('.gallery-dialog-stage');
  const status = dialog.querySelector('#gallery-load-status');
  const retry = dialog.querySelector('#gallery-retry');
  const cache = new Map();
  let active = 0, sequence = 0, trigger, swipeStart, lastWheel = 0;
  const normalize = index => (index % buttons.length + buttons.length) % buttons.length;
  const load = index => {
    const src = buttons[normalize(index)].dataset.gallerySrc;
    if (cache.has(src)) return cache.get(src);
    const promise = new Promise((resolve,reject) => {
      const preload = new Image();
      let done = false;
      const timeout = setTimeout(() => finish(false),15000);
      const finish = ok => {
        if (done) return;done = true;clearTimeout(timeout);
        preload.onload = null;preload.onerror = null;
        if(ok) resolve(src);else reject(new Error('Image indisponible'));
      };
      preload.onload = () => finish(true);
      preload.onerror = () => finish(false);
      preload.decoding = 'async';preload.src = src;
    }).catch(error => {cache.delete(src);throw error;});
    cache.set(src,promise);return promise;
  };
  const preloadNeighbors = index => {
    load(index - 1).catch(() => {});load(index + 1).catch(() => {});
  };
  const show = async index => {
    active = normalize(index);
    const current = ++sequence;
    const selected = buttons[active];
    dialog.querySelector('#gallery-large-title').textContent = selected.dataset.galleryTitle;
    dialog.querySelector('#gallery-large-location').textContent = selected.dataset.galleryLocation;
    dialog.querySelector('#gallery-count').textContent = `${active + 1} / ${buttons.length}`;
    stage.setAttribute('aria-busy','true');image.classList.add('is-loading');image.hidden = false;
    retry.hidden = true;status.textContent = 'Chargement de la photographie…';status.hidden = false;
    preloadNeighbors(active);
    try {
      const src = await load(active);
      if(current !== sequence || !dialog.open) return;
      image.src = src;image.alt = 'Photographie du site : ' + selected.dataset.galleryTitle;
      image.classList.remove('is-loading');image.hidden = false;status.hidden = true;
    } catch {
      if(current !== sequence || !dialog.open) return;
      image.hidden = true;status.textContent = 'Cette photographie ne peut pas être chargée. Vous pouvez continuer la navigation.';retry.hidden = false;
    } finally {
      if(current === sequence) stage.setAttribute('aria-busy','false');
    }
  };
  buttons.forEach((button,index) => {
    button.addEventListener('click', () => {
      trigger = button;
      if(!dialog.open) dialog.showModal();
      document.body.classList.add('gallery-open');
      show(index);
    });
    button.addEventListener('pointerenter', () => load(index).catch(() => {}), {passive:true});
    button.addEventListener('focus', () => load(index).catch(() => {}));
  });
  dialog.querySelector('#gallery-prev').addEventListener('click', () => show(active - 1));
  dialog.querySelector('#gallery-next').addEventListener('click', () => show(active + 1));
  dialog.querySelector('#gallery-close').addEventListener('click', () => dialog.close());
  retry.addEventListener('click', () => show(active));
  dialog.addEventListener('close', () => {sequence++;document.body.classList.remove('gallery-open');trigger?.focus({preventScroll:true});});
  dialog.addEventListener('click', event => {if(event.target === dialog) dialog.close();});
  dialog.addEventListener('keydown', event => {
    if(event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();show(active + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  stage.addEventListener('wheel', event => {
    if(event.ctrlKey || !dialog.open) return;
    event.preventDefault();
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    const now = performance.now();
    if(Math.abs(delta) < 8 || now-lastWheel < 220) return;
    lastWheel = now;show(active + (delta>0 ? 1 : -1));
  }, {passive:false});
  stage.addEventListener('pointerdown', event => {
    if(event.pointerType !== 'touch' || event.target.closest('button')) return;
    swipeStart = {x:event.clientX,y:event.clientY};
  }, {passive:true});
  stage.addEventListener('pointerup', event => {
    if(!swipeStart) return;
    const dx=event.clientX-swipeStart.x,dy=event.clientY-swipeStart.y;swipeStart=null;
    if(Math.abs(dx)>45 && Math.abs(dx)>Math.abs(dy)) show(active + (dx<0 ? 1 : -1));
  }, {passive:true});
  stage.addEventListener('pointercancel', () => {swipeStart=null;}, {passive:true});
})();
