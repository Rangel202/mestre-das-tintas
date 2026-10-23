/* ==========================================================================
   MESTRE DAS TINTAS — interações e animações
   ========================================================================== */
(() => {
  'use strict';

  /* ======================================================
     CONFIGURAÇÃO — edite aqui os dados do cliente
     ====================================================== */
  const CONFIG = {
    // WhatsApp com DDI + DDD + número, só dígitos. Ex.: 5511987654321
    whatsapp: '5500000000000',
    // Mensagem usada quando um link não define a própria
    mensagemPadrao: 'Olá, Mestre das Tintas! Vim pelo site e quero um orçamento grátis.',
    // Parâmetros da calculadora (ajuste à realidade da equipe)
    calc: {
      demaos: 2,
      rendimento: { interna: 11, externa: 9, comercial: 11 },       // m² por litro, por demão
      fatorParede: { interna: 2.7, externa: 1.4, comercial: 2.2 },  // m² de parede por m² de piso
      produtividade: { interna: 45, externa: 35, comercial: 55 },   // m² pintados por dia (equipe)
      fatorEstado: { boa: 1, reparos: 1.35, danificada: 1.7 },      // tempo extra de preparo
      absorcao: { boa: 1, reparos: 1.05, danificada: 1.12 },        // tinta extra em parede porosa
    },
  };

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const gsap = window.gsap;
  const ST = window.ScrollTrigger;
  const motion = Boolean(gsap && ST) && !reduce;

  if (motion) {
    gsap.registerPlugin(ST);
    ST.config({ ignoreMobileResize: true });
    root.classList.add('gsap', 'is-loading');
  } else {
    root.classList.add('no-gsap');
  }

  // Vibração curta (Android) — só depois que a pessoa já tocou na página
  const vibrate = (ms = 8) => {
    const ua = navigator.userActivation;
    if (!navigator.vibrate || (ua && !ua.hasBeenActive)) return;
    try { navigator.vibrate(ms); } catch (e) { /* sem vibração */ }
  };
  const waLink = (msg) => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg || CONFIG.mensagemPadrao)}`;
  const setWa = (a, msg) => { if (a) a.href = waLink(msg); };

  /* ---------- Links de WhatsApp ---------- */
  $$('[data-wa]').forEach((a) => {
    setWa(a, a.dataset.wa);
    a.target = '_blank';
    a.rel = 'noopener';
  });

  /* ---------- Ano no rodapé ---------- */
  const year = $('[data-year]');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Escorridos de tinta (formas geradas por semente) ---------- */
  function dripPath(seed) {
    let s = (seed * 9973) % 233280;
    const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
    const W = 400, base = 8, drips = [];
    let x = 6 + rnd() * 18;
    while (x < W - 24) {
      const w = 9 + rnd() * 16;
      drips.push([x, w, 8 + rnd() * 52]);
      x += w + 10 + rnd() * 40;
    }
    const f = (n) => n.toFixed(1);
    let d = `M0 0H${W}V${base}`;
    for (let i = drips.length - 1; i >= 0; i--) {
      const [x0, w, h] = drips[i];
      const x1 = x0 + w, y = base + h, m = x0 + w / 2;
      d += `L${f(x1)} ${base}C${f(x1 - w * .12)} ${base} ${f(x1 - w * .02)} ${f(y)} ${f(m)} ${f(y)}`;
      d += `C${f(x0 + w * .02)} ${f(y)} ${f(x0 + w * .12)} ${base} ${f(x0)} ${base}`;
    }
    return `${d}L0 ${base}Z`;
  }
  $$('.drips-shape').forEach((svg) => {
    const p = $('path', svg);
    if (p) p.setAttribute('d', dripPath(Number(svg.dataset.seed) || 1));
  });

  /* ---------- Header, barra de progresso e dock ---------- */
  const hdr = $('.hdr');
  const bar = $('.progress span');
  const dock = $('.dock');
  const hero = $('.hero');
  const ctaSec = $('.cta');
  let lastY = window.scrollY, ticking = false, ctaVisible = false;

  function onScroll() {
    const y = window.scrollY;
    const max = root.scrollHeight - window.innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
    hdr.classList.toggle('is-solid', y > 40);
    if (Math.abs(y - lastY) > 6) {
      if (!root.classList.contains('menu-open')) hdr.classList.toggle('is-hidden', y > lastY && y > 320);
      lastY = y;
    }
    dock.classList.toggle('is-on', y > hero.offsetHeight * .6 && !ctaVisible);
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  if ('IntersectionObserver' in window && ctaSec) {
    new IntersectionObserver(([e]) => { ctaVisible = e.isIntersecting; onScroll(); }, { threshold: .2 }).observe(ctaSec);
  }
  onScroll();

  /* ---------- Menu ---------- */
  const burger = $('.burger');
  const menu = $('#menu');
  function setMenu(open) {
    const r = burger.getBoundingClientRect();
    menu.style.setProperty('--mx', `${r.left + r.width / 2}px`);
    menu.style.setProperty('--my', `${r.top + r.height / 2}px`);
    root.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    menu.setAttribute('aria-hidden', String(!open));
    menu.inert = !open;
    if (open) hdr.classList.remove('is-hidden');
    vibrate(10);
  }
  burger.addEventListener('click', () => setMenu(!root.classList.contains('menu-open')));
  $$('a', menu).forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && root.classList.contains('menu-open')) { setMenu(false); burger.focus(); }
  });

  /* ---------- Gotinhas de tinta ao tocar nos botões ---------- */
  if (motion) {
    document.addEventListener('pointerdown', (e) => {
      const b = e.target.closest('.btn, .dock__wa, .dock__call, .sw, .icon-btn, .svc__cta');
      if (!b) return;
      const color = b.classList.contains('sw') ? b.style.getPropertyValue('--c') : '';
      for (let i = 0; i < 9; i++) {
        const d = document.createElement('span');
        const size = 4 + Math.random() * 7;
        d.className = 'splash';
        d.style.width = d.style.height = `${size}px`;
        if (color) d.style.background = color;
        document.body.appendChild(d);
        const a = Math.random() * Math.PI * 2, r = 26 + Math.random() * 46;
        const x = e.clientX - size / 2, y = e.clientY - size / 2;
        gsap.fromTo(d, { x, y, scale: 1, opacity: 1 }, {
          x: x + Math.cos(a) * r, y: y + Math.sin(a) * r + 16, scale: .3, opacity: 0,
          duration: .6 + Math.random() * .3, ease: 'power3.out', onComplete: () => d.remove(),
        });
      }
    }, { passive: true });
  }

  /* ---------- Antes & Depois ---------- */
  const ba = $('.ba');
  if (ba) {
    const handle = $('.ba__handle', ba);
    let pos = 28, dragging = false, demo = null;
    const set = (p) => {
      pos = Math.max(2, Math.min(98, p));
      ba.style.setProperty('--pos', `${pos}%`);
      handle.setAttribute('aria-valuenow', String(Math.round(pos)));
    };
    const fromX = (x) => { const r = ba.getBoundingClientRect(); set(((x - r.left) / r.width) * 100); };
    const stopDemo = () => { if (demo) { demo.kill(); demo = null; } };
    ba.addEventListener('pointerdown', (e) => {
      dragging = true;
      stopDemo();
      ba.classList.add('is-drag');
      vibrate(6);
      if (e.pointerType === 'mouse') { fromX(e.clientX); ba.setPointerCapture(e.pointerId); }
    });
    ba.addEventListener('pointermove', (e) => { if (dragging) fromX(e.clientX); });
    const end = () => { dragging = false; ba.classList.remove('is-drag'); };
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((t) => ba.addEventListener(t, end));
    handle.addEventListener('keydown', (e) => {
      const step = e.shiftKey ? 10 : 4;
      const keys = { ArrowLeft: -step, ArrowDown: -step, ArrowRight: step, ArrowUp: step };
      if (e.key in keys) { e.preventDefault(); stopDemo(); set(pos + keys[e.key]); }
      if (e.key === 'Home') { e.preventDefault(); set(0); }
      if (e.key === 'End') { e.preventDefault(); set(100); }
    });
    if (motion) {
      const st = { p: pos };
      ST.create({
        trigger: ba, start: 'top 70%', once: true,
        onEnter: () => {
          demo = gsap.timeline({ delay: .35 })
            .to(st, { p: 80, duration: 1.5, ease: 'power2.inOut', onUpdate: () => set(st.p) })
            .to(st, { p: 52, duration: 1.1, ease: 'power2.inOut', onUpdate: () => set(st.p) });
        },
      });
    }
  }

  /* ---------- Barras de progresso dos carrosséis ---------- */
  $$('[data-rail]').forEach((rail) => {
    const track = rail.nextElementSibling;
    const thumb = track && track.classList.contains('rail-bar') ? $('span', track) : null;
    if (!thumb) return;
    const update = () => {
      const max = rail.scrollWidth - rail.clientWidth;
      if (max <= 1) { thumb.style.width = '100%'; thumb.style.transform = 'none'; return; }
      thumb.style.width = `${(rail.clientWidth / rail.scrollWidth) * 100}%`;
      thumb.style.transform = `translateX(${(rail.scrollLeft / rail.clientWidth) * 100}%)`;
    };
    rail.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  });

  /* ---------- Simulador de cores ---------- */
  const sim = $('.sim');
  if (sim) {
    const oldWall = $('.sim__wall-old', sim);
    const newWall = $('.sim__wall-new', sim);
    const clip = $('.sim__clip', sim);
    const roller = $('.sim__roller', sim);
    const cover = $('.sim__roller-cover', sim);
    const info = $('.sim__info', sim);
    const nameEl = $('.sim__name', sim);
    const hexEl = $('.sim__hex', sim);
    const dot = $('.sim__dot', sim);
    const cta = $('.sim__cta', sim);
    const ctaName = $('.sim__cta-name', sim);
    const sws = $$('.sw', sim);
    let tl = null, touched = false;

    const choose = (btn, byUser = true) => {
      const color = btn.style.getPropertyValue('--c').trim();
      const hex = color.toUpperCase();
      const name = btn.dataset.name;
      sws.forEach((b) => b.setAttribute('aria-checked', String(b === btn)));
      nameEl.textContent = name;
      ctaName.textContent = name;
      hexEl.textContent = hex;
      dot.style.setProperty('--c', color);
      setWa(cta, `Olá! Usei o simulador do site e gostei da cor ${name} (${hex}). Quero um orçamento!`);
      if (byUser) { touched = true; vibrate(8); }
      if (!motion) { oldWall.setAttribute('fill', color); return; }

      if (tl) tl.progress(1);
      newWall.setAttribute('fill', color);
      cover.setAttribute('fill', color);
      const s = { h: 0 };
      tl = gsap.timeline({
        onComplete: () => { oldWall.setAttribute('fill', color); clip.setAttribute('height', '0'); },
      })
        .set(roller, { opacity: 1 })
        .to(s, {
          h: 232, duration: .95, ease: 'power2.inOut',
          onUpdate: () => { clip.setAttribute('height', s.h.toFixed(1)); roller.setAttribute('transform', `translate(0 ${s.h.toFixed(1)})`); },
        })
        .to(roller, { opacity: 0, duration: .25 })
        .fromTo(info, { scale: .88 }, { scale: 1, duration: .7, ease: 'elastic.out(1, .5)' }, 0);
    };

    sws.forEach((b) => b.addEventListener('click', () => choose(b)));
    $('.swatches', sim).addEventListener('keydown', (e) => {
      const i = sws.findIndex((b) => b.getAttribute('aria-checked') === 'true');
      const delta = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (!delta) return;
      e.preventDefault();
      const n = sws[(i + delta + sws.length) % sws.length];
      n.focus();
      choose(n);
    });
    if (motion) {
      ST.create({
        trigger: sim, start: 'top 60%', once: true,
        onEnter: () => setTimeout(() => { if (!touched) choose(sws[2], false); }, 600),
      });
    }
  }

  /* ---------- Calculadora ---------- */
  const calc = $('.calc');
  if (calc) {
    const area = $('#area', calc);
    const areaOut = $('.calc__area span', calc);
    const cansEl = $('.cans', calc);
    const cta = $('.calc__cta', calc);
    const outs = { m2: $('[data-out="m2"]', calc), latas: $('[data-out="latas"]', calc), dias: $('[data-out="dias"]', calc) };
    const shown = { m2: 0, latas: 0, dias: 0 };
    const labels = { interna: 'Interna', externa: 'Externa', comercial: 'Comercial', boa: 'Boas', reparos: 'Precisam de reparos', danificada: 'Muito danificadas' };
    const roofLabel = $('.switch', calc);
    let lastCans = -1, lastTick = 0;

    const animateNum = (k, v) => {
      if (!motion) { outs[k].textContent = v; shown[k] = v; return; }
      gsap.to(shown, { [k]: v, duration: .65, ease: 'power2.out', overwrite: 'auto', onUpdate: () => { outs[k].textContent = Math.round(shown[k]); } });
    };

    const renderCans = (n) => {
      if (n === lastCans) return;
      const prev = lastCans < 0 ? 0 : Math.min(lastCans, 12);
      lastCans = n;
      cansEl.innerHTML = '';
      for (let i = 0; i < Math.min(n, 12); i++) cansEl.insertAdjacentHTML('beforeend', '<svg viewBox="0 0 28 36"><use href="#i-can"/></svg>');
      if (n > 12) cansEl.insertAdjacentHTML('beforeend', `<span class="more">+${n - 12}</span>`);
      const fresh = Array.from(cansEl.children).slice(prev);
      if (motion && fresh.length) gsap.from(fresh, { y: -16, scale: .4, opacity: 0, duration: .45, stagger: .04, ease: 'back.out(2.4)' });
    };

    const compute = () => {
      const c = CONFIG.calc;
      const tipo = calc.elements.tipo.value;
      const estado = calc.elements.estado.value;
      const externa = tipo === 'externa';
      roofLabel.style.opacity = externa ? .4 : 1;
      calc.elements.teto.disabled = externa;
      const teto = calc.elements.teto.checked && !externa;
      const a = Number(area.value);
      const m2 = Math.round(a * c.fatorParede[tipo] + (teto ? a : 0));
      const litros = ((m2 * c.demaos) / c.rendimento[tipo]) * c.absorcao[estado];
      const latas = Math.max(1, Math.ceil(litros / 18));
      const dias = Math.max(1, Math.ceil((m2 / c.produtividade[tipo]) * c.fatorEstado[estado]));

      areaOut.textContent = a;
      area.style.setProperty('--v', `${((a - area.min) / (area.max - area.min)) * 100}%`);
      animateNum('m2', m2);
      animateNum('latas', latas);
      animateNum('dias', dias);
      renderCans(latas);
      setWa(cta, `Olá! Fiz a simulação no site:\n• Tipo: ${labels[tipo]}\n• Área do imóvel: ${a} m²\n• Paredes: ${labels[estado]}\n• Teto: ${teto ? 'sim' : 'não'}\nEstimativa: ${m2} m² de pintura, ~${latas} lata(s) de 18 L e ~${dias} dia(s) de obra.\nQuero um orçamento exato!`);
    };

    calc.addEventListener('input', (e) => {
      if (e.target === area) {
        const v = Number(area.value);
        if (v % 50 === 0 && v !== lastTick) { vibrate(4); lastTick = v; }
      }
      compute();
    });
    calc.addEventListener('change', (e) => { if (e.target.type !== 'range') vibrate(8); });

    if (motion) ST.create({ trigger: calc, start: 'top 75%', once: true, onEnter: compute });
    else compute();
  }

  /* ---------- Obras: pilha de cards arrastável ---------- */
  const stack = $('.stack');
  if (stack) {
    const cards = $$('.stack__card', stack);
    const countEl = $('.stack__count b');
    const order = cards.map((_, i) => i);
    let busy = false;

    const pose = (k) => ({ x: 0, y: k * 19, scale: 1 - k * .042, rotation: k === 0 ? 0 : (k % 2 ? 2.5 : -2.5), opacity: k > 3 ? 0 : 1 });
    const place = (el, p, dur) => {
      if (motion) { gsap.to(el, { ...p, duration: dur, ease: 'power3.out', overwrite: 'auto' }); return; }
      el.style.transform = `translate(${p.x}px, ${p.y}px) rotate(${p.rotation}deg) scale(${p.scale})`;
      el.style.opacity = p.opacity;
    };
    const layout = (dur = .6, skip = null) => {
      order.forEach((ci, k) => {
        const el = cards[ci];
        if (el === skip) return;
        el.style.zIndex = String(cards.length - k);
        el.setAttribute('aria-hidden', String(k !== 0));
        place(el, pose(k), dur);
      });
      countEl.textContent = String(order[0] + 1).padStart(2, '0');
    };

    const go = (dir, fling = 0) => {
      if (busy) return;
      busy = true;
      vibrate(10);
      const w = stack.offsetWidth * 1.35;
      if (dir > 0) {
        const el = cards[order[0]];
        const side = fling ? Math.sign(fling) : -1;
        order.push(order.shift());
        layout(.6, el);
        if (motion) {
          gsap.to(el, {
            x: side * w, rotation: side * 24, duration: .42, ease: 'power2.in', overwrite: 'auto',
            onComplete: () => {
              el.style.zIndex = '0';
              el.setAttribute('aria-hidden', 'true');
              place(el, pose(order.length - 1), .01);
              busy = false;
            },
          });
        } else { layout(); busy = false; }
      } else {
        order.unshift(order.pop());
        const el = cards[order[0]];
        if (motion) gsap.set(el, { x: -w, rotation: -24, opacity: 1 });
        el.style.zIndex = String(cards.length + 1);
        layout(.6);
        setTimeout(() => { busy = false; }, 350);
      }
    };

    let sx = 0, dx = 0, t0 = 0, dragging = false;
    stack.addEventListener('pointerdown', (e) => {
      const top = cards[order[0]];
      if (busy || !e.isPrimary || !top.contains(e.target)) return;
      dragging = true; sx = e.clientX; dx = 0; t0 = performance.now();
      try { stack.setPointerCapture(e.pointerId); } catch (err) { /* sem captura */ }
      if (motion) gsap.killTweensOf(top); else top.style.transition = 'none';
    });
    stack.addEventListener('pointermove', (e) => {
      if (!dragging || !e.isPrimary) return;
      if (e.pointerType === 'mouse' && e.buttons === 0) { release(); return; }
      dx = e.clientX - sx;
      const top = cards[order[0]];
      if (motion) gsap.set(top, { x: dx, rotation: dx * .07 });
      else top.style.transform = `translateX(${dx}px) rotate(${dx * .07}deg)`;
    });
    function release() {
      if (!dragging) return;
      dragging = false;
      cards[order[0]].style.transition = '';
      const speed = Math.abs(dx) / Math.max(1, performance.now() - t0);
      if (Math.abs(dx) > 80 || (speed > .5 && Math.abs(dx) > 30)) go(1, dx);
      else layout(.5);
    }
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((t) => stack.addEventListener(t, release));
    $('[data-stack="next"]').addEventListener('click', () => go(1));
    $('[data-stack="prev"]').addEventListener('click', () => go(-1));

    layout(0);
    if (motion) {
      ST.create({
        trigger: stack, start: 'top 65%', once: true,
        onEnter: () => {
          const top = cards[order[0]];
          gsap.timeline({ delay: .6 })
            .to(top, { x: -46, rotation: -4, duration: .45, ease: 'power2.out' })
            .to(top, { x: 30, rotation: 3, duration: .4, ease: 'power2.inOut' })
            .to(top, { x: 0, rotation: 0, duration: .6, ease: 'elastic.out(1, .5)' });
        },
      });
    }
  }

  /* ---------- FAQ (acordeão) ---------- */
  const qs = $$('.faq__q');
  qs.forEach((q) => q.addEventListener('click', () => {
    const open = q.getAttribute('aria-expanded') !== 'true';
    qs.forEach((o) => {
      const isMe = o === q;
      o.setAttribute('aria-expanded', String(isMe ? open : false));
      $(`#${o.getAttribute('aria-controls')}`).classList.toggle('is-open', isMe ? open : false);
    });
    vibrate(6);
    if (motion) setTimeout(() => ST.refresh(), 560);
  }));

  /* ======================================================
     ANIMAÇÕES (GSAP) — só roda com GSAP e sem "reduzir movimento"
     ====================================================== */
  const counters = $$('[data-count]');
  if (!motion) {
    const loader = $('.loader');
    if (loader) loader.remove();
    $$('.brush').forEach((b) => b.classList.add('is-in'));
    counters.forEach((el) => { el.textContent = `${el.dataset.prefix || ''}${el.dataset.count}${el.dataset.suffix || ''}`; });
    return;
  }

  // Divide títulos em palavras (mantém <em class="brush"> inteiro)
  function splitWords(el) {
    const wrap = (node) => {
      const o = document.createElement('span');
      const i = document.createElement('span');
      o.className = 'w';
      i.className = 'wi';
      i.appendChild(node);
      o.appendChild(i);
      return o;
    };
    const frag = document.createDocumentFragment();
    Array.from(el.childNodes).forEach((n) => {
      if (n.nodeType === 3) {
        n.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          frag.appendChild(/^\s+$/.test(part) ? document.createTextNode(' ') : wrap(document.createTextNode(part)));
        });
      } else if (n.nodeType === 1 && n.tagName !== 'EM') {
        const words = n.textContent.trim().split(/\s+/);
        words.forEach((w, k) => {
          const c = n.cloneNode(false);
          c.textContent = w;
          frag.appendChild(wrap(c));
          if (k < words.length - 1) frag.appendChild(document.createTextNode(' '));
        });
      } else {
        frag.appendChild(wrap(n));
      }
    });
    el.textContent = '';
    el.appendChild(frag);
    return $$('.wi', el);
  }

  // Estados iniciais
  const heroPaint = $('.hero__paint');
  const heroRoller = $('.hero__roller');
  const heroFade = ['.hero__lead', '.hero__ctas .btn', '.note', '.hero__trust li'];
  gsap.set(heroPaint, { clipPath: 'inset(0% 0% 100% 0%)' });
  gsap.set('.hero__title .ln > span', { yPercent: 118 });
  gsap.set('.hero .tape', { opacity: 0, scale: 1.4, rotation: -12 });
  gsap.set(heroFade, { opacity: 0, y: 26, transition: 'none' });
  gsap.set(hdr, { yPercent: -110, transition: 'none' });

  /* ---------- Preloader ---------- */
  const loader = $('.loader');
  const level = $('.loader__level');
  const pct = $('.loader__count span');
  const prog = { v: 0 };
  const drawLoader = () => { level.setAttribute('y', String(293 - (293 * prog.v) / 100)); pct.textContent = Math.round(prog.v); };
  const fill = gsap.to(prog, { v: 86, duration: 1.2, ease: 'power2.out', onUpdate: drawLoader });

  const heroImg = $('.hero__paint img');
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const assets = Promise.all([
    heroImg.decode ? heroImg.decode().catch(() => {}) : Promise.resolve(),
    document.fonts ? document.fonts.ready : Promise.resolve(),
  ]);
  Promise.all([Promise.race([assets, wait(2600)]), wait(950)]).then(() => {
    fill.kill();
    gsap.timeline()
      .to(prog, { v: 100, duration: .45, ease: 'power2.inOut', onUpdate: drawLoader })
      .to('.loader__inner', { scale: .9, opacity: 0, duration: .4, ease: 'power2.in' }, '+=.1')
      .to(loader, { yPercent: -100, duration: 1, ease: 'power4.inOut' }, '-=.15')
      .fromTo('.loader__drips', { scaleY: .3 }, { scaleY: 1.9, duration: 1, ease: 'power2.inOut' }, '<')
      .add(() => { loader.remove(); root.classList.remove('is-loading'); })
      .add(heroIntro(), '-=.6');
  });

  /* ---------- Hero: o rolo pinta a tela ---------- */
  function heroIntro() {
    const st = { p: 0 };
    return gsap.timeline()
      .set(heroRoller, { opacity: 1, y: 0 })
      .to(st, {
        p: 100, duration: 1.9, ease: 'power2.inOut',
        onUpdate: () => {
          heroPaint.style.clipPath = `inset(0% 0% ${(100 - st.p).toFixed(2)}% 0%)`;
          gsap.set(heroRoller, { y: (hero.offsetHeight * st.p) / 100 });
        },
      }, 0)
      .to(heroRoller, { y: '+=140', opacity: 0, duration: .5, ease: 'power2.in' })
      .to(hdr, { yPercent: 0, duration: .9, ease: 'power3.out', clearProps: 'transform,transition' }, .25)
      .to('.hero .tape', { opacity: 1, scale: 1, rotation: -2.5, duration: .8, ease: 'back.out(2.2)' }, .55)
      .to('.hero__title .ln > span', { yPercent: 0, duration: 1.15, stagger: .12, ease: 'power4.out' }, .7)
      .add(() => $('.hero .brush').classList.add('is-in'), 1.3)
      .to(heroFade, { opacity: 1, y: 0, duration: .85, stagger: .07, ease: 'power3.out', clearProps: 'transition' }, 1.2)
      .to('.note', { y: -5, duration: 1.6, ease: 'sine.inOut', yoyo: true, repeat: -1 }, '+=.2');
  }

  // Parallax do hero ao rolar
  gsap.to('.hero__media', { yPercent: 14, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero__content', { y: -70, opacity: .2, ease: 'none', scrollTrigger: { trigger: hero, start: '35% top', end: 'bottom top', scrub: true } });

  /* ---------- Fitas: marquee que acelera com a rolagem ---------- */
  const marquees = $$('.tapes__track').map((t) => {
    const d = Number(t.dataset.dir);
    return gsap.fromTo(t, { xPercent: d > 0 ? -50 : 0 }, { xPercent: d > 0 ? 0 : -50, duration: 32, ease: 'none', repeat: -1 });
  });
  let boost = 0;
  ST.create({ trigger: '.tapes', start: 'top bottom', end: 'bottom top', onUpdate: (s) => { boost = Math.min(Math.abs(s.getVelocity()) / 220, 9); } });
  gsap.ticker.add(() => {
    boost *= .93;
    marquees.forEach((m) => m.timeScale(1 + boost));
  });
  gsap.fromTo('.tapes__band--a', { yPercent: -50, rotation: -9 }, { rotation: -3, ease: 'none', scrollTrigger: { trigger: '.tapes', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.fromTo('.tapes__band--b', { yPercent: -50, rotation: 9 }, { rotation: 3, ease: 'none', scrollTrigger: { trigger: '.tapes', start: 'top bottom', end: 'bottom top', scrub: true } });

  /* ---------- Títulos palavra por palavra ---------- */
  $$('[data-split]').forEach((h) => {
    const words = splitWords(h);
    gsap.set(words, { yPercent: 118 });
    ST.create({
      trigger: h, start: 'top 86%', once: true,
      onEnter: () => {
        gsap.to(words, { yPercent: 0, duration: 1.05, stagger: .055, ease: 'power4.out' });
        $$('.brush', h).forEach((b) => setTimeout(() => b.classList.add('is-in'), 550));
      },
    });
  });

  /* ---------- Fitas-crepe "colando" ---------- */
  $$('.sec__head .tape, .cta .tape').forEach((t) => {
    gsap.fromTo(t, { opacity: 0, scale: 1.5, rotation: -14 }, {
      opacity: 1, scale: 1, rotation: -2.5, duration: .8, ease: 'back.out(2.2)',
      scrollTrigger: { trigger: t, start: 'top 90%', once: true },
    });
  });

  /* ---------- Revelações ao rolar ---------- */
  gsap.set('[data-reveal]', { opacity: 0, y: 40, transition: 'none' });
  ST.batch('[data-reveal]', {
    start: 'top 90%', once: true,
    onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: .95, stagger: .09, ease: 'power3.out', overwrite: true, clearProps: 'opacity,transform,transition' }),
  });

  gsap.from('.svc', {
    x: 80, opacity: 0, duration: 1.05, stagger: .1, ease: 'power3.out', clearProps: 'opacity,transform',
    scrollTrigger: { trigger: '.rail--svc', start: 'top 85%', once: true },
  });
  gsap.from('.sw', {
    y: 34, opacity: 0, duration: .6, stagger: .035, ease: 'back.out(2)', clearProps: 'opacity,transform,transition',
    scrollTrigger: { trigger: '.swatches', start: 'top 95%', once: true },
    onStart: () => gsap.set('.sw', { transition: 'none' }),
  });
  gsap.from('.review', {
    x: 70, opacity: 0, duration: 1, stagger: .1, ease: 'power3.out', clearProps: 'opacity,transform',
    scrollTrigger: { trigger: '.rail--reviews', start: 'top 88%', once: true },
  });
  gsap.from('.why__ico', {
    scale: 0, rotation: -40, duration: .8, stagger: .1, ease: 'back.out(2.5)',
    scrollTrigger: { trigger: '.why', start: 'top 80%', once: true },
  });

  /* ---------- Parallax suave em imagens ---------- */
  gsap.fromTo('.cta__bg', { yPercent: -8, scale: 1.18 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.cta', start: 'top bottom', end: 'bottom top', scrub: true } });

  /* ---------- Escorridos crescem ao rolar ---------- */
  $$('.drips').forEach((d) => {
    gsap.fromTo(d, { scaleY: .2 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: d, start: 'top bottom', end: 'top 40%', scrub: .6 } });
  });

  /* ---------- Como funciona: a tinta escorre pela linha ---------- */
  const steps = $('.steps');
  if (steps) {
    const line = $('.steps__line', steps);
    gsap.timeline({ scrollTrigger: { trigger: steps, start: 'top 62%', end: 'bottom 62%', scrub: .5, invalidateOnRefresh: true } })
      .fromTo('.steps__fill', { scaleY: 0 }, { scaleY: 1, ease: 'none' }, 0)
      .fromTo('.steps__drop', { y: 0 }, { y: () => line.offsetHeight, ease: 'none' }, 0);
    $$('.step', steps).forEach((s) => {
      ST.create({
        trigger: s, start: 'top 64%',
        onEnter: () => s.classList.add('is-on'),
        onLeaveBack: () => s.classList.remove('is-on'),
      });
    });
  }

  /* ---------- Contadores ---------- */
  counters.forEach((el) => {
    const end = Number(el.dataset.count), pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
    const o = { v: 0 };
    el.textContent = `${pre}0${suf}`;
    ST.create({
      trigger: el, start: 'top 92%', once: true,
      onEnter: () => gsap.to(o, { v: end, duration: 1.9, ease: 'power3.out', onUpdate: () => { el.textContent = `${pre}${Math.round(o.v)}${suf}`; } }),
    });
  });

  window.addEventListener('load', () => ST.refresh());
})();
