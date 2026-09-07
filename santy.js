/*! santy.js — SantyCSS behavior layer v2.9.3 | MIT | https://santycss.santy.in
 *
 * Zero-dependency interactive behaviour for SantyCSS components.
 * Drives the state classes the CSS already ships (.open / .active / .show),
 * so no existing markup or stylesheet has to change.
 *
 *   <script src="https://cdn.jsdelivr.net/npm/santycss@2/dist/santy.js" defer></script>
 *
 * Declarative — nothing to call:
 *   <button data-santy-toggle="modal" data-santy-target="#confirm">Delete</button>
 *   <div class="modal-overlay" id="confirm"> … <button data-santy-dismiss>Close</button> </div>
 *
 * Programmatic:
 *   Santy.modal.open('#confirm');
 *   Santy.toast('Saved', { variant: 'success' });
 *   Santy.theme.toggle();
 *
 * Every component emits cancelable lifecycle events on its own element:
 *   santy:show → santy:shown → santy:hide → santy:hidden
 */
(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Santy = factory();
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ─── environment ────────────────────────────────────────────────────── */

  var hasDOM = typeof document !== 'undefined';
  var VERSION = '2.9.3';

  /* ─── tiny DOM helpers ───────────────────────────────────────────────── */

  function $(sel, ctx) {
    if (!sel) return null;
    if (sel.nodeType) return sel;
    try { return (ctx || document).querySelector(sel); } catch (e) { return null; }
  }

  function $$(sel, ctx) {
    if (!sel) return [];
    try { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
    catch (e) { return []; }
  }

  function on(el, type, fn, opts) { el.addEventListener(type, fn, opts || false); }
  function off(el, type, fn, opts) { el.removeEventListener(type, fn, opts || false); }

  function addClass(el, c) { if (el) el.classList.add(c); }
  function removeClass(el, c) { if (el) el.classList.remove(c); }
  function hasClass(el, c) { return !!el && el.classList.contains(c); }

  function attr(el, name, val) {
    if (val === undefined) return el.getAttribute(name);
    if (val === null) el.removeAttribute(name);
    else el.setAttribute(name, val);
  }

  /**
   * Fire a cancelable lifecycle event. Returns false when a listener called
   * preventDefault(), which every caller honours as "abort this transition".
   */
  function emit(el, name, detail) {
    if (!el) return true;
    var ev;
    try {
      ev = new CustomEvent(name, { bubbles: true, cancelable: true, detail: detail || {} });
    } catch (e) {
      ev = document.createEvent('CustomEvent');
      ev.initCustomEvent(name, true, true, detail || {});
    }
    el.dispatchEvent(ev);
    return !ev.defaultPrevented;
  }

  /** Resolve the element a trigger points at, via data-santy-target or href. */
  function targetOf(trigger) {
    var sel = attr(trigger, 'data-santy-target') || '';
    if (!sel) {
      var href = attr(trigger, 'href') || '';
      if (href.charAt(0) === '#') sel = href;
    }
    return sel && sel !== '#' ? $(sel) : null;
  }

  function prefersReducedMotion() {
    return hasDOM && window.matchMedia &&
           window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /** Run fn after el's CSS transition ends, with a timeout fallback. */
  function afterTransition(el, fn) {
    if (!el || prefersReducedMotion()) return fn();
    var dur = 0;
    try {
      var cs = getComputedStyle(el);
      var t = parseFloat(cs.transitionDuration) || 0;
      var a = parseFloat(cs.animationDuration) || 0;
      dur = Math.max(t, a) * 1000;
    } catch (e) { /* detached node */ }
    if (!dur) return fn();
    var done = false;
    var finish = function () {
      if (done) return;
      done = true;
      off(el, 'transitionend', finish);
      off(el, 'animationend', finish);
      fn();
    };
    on(el, 'transitionend', finish);
    on(el, 'animationend', finish);
    setTimeout(finish, dur + 50);
  }

  /* ─── tabbable / focus trap ──────────────────────────────────────────── */

  var TABBABLE = [
    'a[href]', 'area[href]', 'button:not([disabled])', 'input:not([disabled])',
    'select:not([disabled])', 'textarea:not([disabled])', 'iframe', 'object',
    'embed', 'audio[controls]', 'video[controls]', '[contenteditable]',
    '[tabindex]'
  ].join(',');

  function isVisible(el) {
    return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
  }

  function tabbables(container) {
    return $$(TABBABLE, container).filter(function (el) {
      return el.tabIndex > -1 && !el.hasAttribute('disabled') &&
             attr(el, 'aria-hidden') !== 'true' && isVisible(el);
    });
  }

  /**
   * Focus trap stack. Nested overlays push; only the topmost trap handles Tab,
   * so a dialog opened from a drawer restores focus correctly on the way out.
   */
  var trapStack = [];
  var trapListening = false;

  function onTrapKeydown(e) {
    if (e.key !== 'Tab' && e.keyCode !== 9) return;
    var trap = trapStack[trapStack.length - 1];
    if (!trap) return;
    var items = tabbables(trap.el);
    if (!items.length) { e.preventDefault(); trap.el.focus(); return; }
    var first = items[0], last = items[items.length - 1];
    // activeElement can sit outside the trap after a programmatic blur.
    if (!trap.el.contains(document.activeElement)) {
      e.preventDefault();
      first.focus();
      return;
    }
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  var focusTrap = {
    activate: function (el, opts) {
      opts = opts || {};
      trapStack.push({ el: el, restore: opts.restore !== false ? document.activeElement : null });
      if (!trapListening) { on(document, 'keydown', onTrapKeydown, true); trapListening = true; }
      // Wait a frame: focus() on a still-hidden element is a no-op.
      requestAnimationFrame(function () {
        var initial = $('[data-santy-autofocus]', el) || tabbables(el)[0];
        if (initial) initial.focus();
        else { if (el.tabIndex < 0) attr(el, 'tabindex', '-1'); el.focus(); }
      });
    },
    deactivate: function (el) {
      for (var i = trapStack.length - 1; i >= 0; i--) {
        if (trapStack[i].el === el) {
          var restore = trapStack[i].restore;
          trapStack.splice(i, 1);
          if (restore && restore.focus && document.contains(restore)) restore.focus();
          break;
        }
      }
      if (!trapStack.length && trapListening) {
        off(document, 'keydown', onTrapKeydown, true);
        trapListening = false;
      }
    }
  };

  /* ─── background inert ───────────────────────────────────────────────── */

  var supportsInert = hasDOM && typeof HTMLElement !== 'undefined' && 'inert' in HTMLElement.prototype;
  var inertApplied = [];

  /** Hide everything except `keep` from AT and tab order while an overlay is up. */
  function setBackgroundInert(keep) {
    if (inertApplied.length) return; // an outer overlay already applied it
    var body = document.body;
    if (!body) return;
    Array.prototype.forEach.call(body.children, function (child) {
      if (child === keep || child.contains(keep) || child.tagName === 'SCRIPT') return;
      var rec = { el: child, inert: child.inert, hidden: attr(child, 'aria-hidden') };
      if (supportsInert) child.inert = true;
      else attr(child, 'aria-hidden', 'true');
      inertApplied.push(rec);
    });
  }

  function releaseBackgroundInert() {
    inertApplied.forEach(function (rec) {
      if (supportsInert) rec.el.inert = rec.inert;
      if (rec.hidden === null) attr(rec.el, 'aria-hidden', null);
      else attr(rec.el, 'aria-hidden', rec.hidden);
    });
    inertApplied = [];
  }

  /* ─── scroll lock ────────────────────────────────────────────────────── */

  var scrollLocks = 0;
  var savedBody = null;

  function lockScroll() {
    if (scrollLocks++ > 0) return;
    var body = document.body;
    var gap = window.innerWidth - document.documentElement.clientWidth;
    savedBody = { overflow: body.style.overflow, paddingRight: body.style.paddingRight };
    body.style.overflow = 'hidden';
    // Compensate for the vanishing scrollbar so the page does not jump.
    if (gap > 0) {
      var current = parseFloat(getComputedStyle(body).paddingRight) || 0;
      body.style.paddingRight = (current + gap) + 'px';
    }
  }

  function unlockScroll() {
    if (--scrollLocks > 0) return;
    scrollLocks = 0;
    if (!savedBody) return;
    document.body.style.overflow = savedBody.overflow;
    document.body.style.paddingRight = savedBody.paddingRight;
    savedBody = null;
  }

  /* ─── positioning engine (flip + shift collision handling) ───────────── */

  var OPPOSITE = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };

  /**
   * Position `floating` against `anchor`, flipping to the opposite side when it
   * would overflow the viewport and shifting along the cross axis to stay in
   * view. Mirrors CSS anchor positioning for browsers that lack it.
   */
  function position(anchor, floating, opts) {
    opts = opts || {};
    var placement = opts.placement || 'bottom';
    var offset = opts.offset == null ? 8 : opts.offset;
    var padding = opts.padding == null ? 8 : opts.padding;

    // Measure laid out but not yet painted at the final spot.
    floating.style.position = 'fixed';
    floating.style.top = '0px';
    floating.style.left = '0px';
    floating.style.margin = '0';

    var a = anchor.getBoundingClientRect();
    var f = floating.getBoundingClientRect();
    var vw = document.documentElement.clientWidth;
    var vh = document.documentElement.clientHeight;

    var parts = placement.split('-');
    var side = parts[0];
    var align = parts[1] || 'center';

    function room(s) {
      if (s === 'top') return a.top;
      if (s === 'bottom') return vh - a.bottom;
      if (s === 'left') return a.left;
      return vw - a.right;
    }
    var need = (side === 'top' || side === 'bottom') ? f.height : f.width;
    if (room(side) < need + offset + padding && room(OPPOSITE[side]) > room(side)) {
      side = OPPOSITE[side];
    }

    var top, left;
    if (side === 'top')         top = a.top - f.height - offset;
    else if (side === 'bottom') top = a.bottom + offset;
    else if (side === 'left')   left = a.left - f.width - offset;
    else                        left = a.right + offset;

    if (side === 'top' || side === 'bottom') {
      if (align === 'start') left = a.left;
      else if (align === 'end') left = a.right - f.width;
      else left = a.left + (a.width - f.width) / 2;
      left = Math.min(Math.max(padding, left), Math.max(padding, vw - f.width - padding));
    } else {
      if (align === 'start') top = a.top;
      else if (align === 'end') top = a.bottom - f.height;
      else top = a.top + (a.height - f.height) / 2;
      top = Math.min(Math.max(padding, top), Math.max(padding, vh - f.height - padding));
    }

    floating.style.top = Math.round(top) + 'px';
    floating.style.left = Math.round(left) + 'px';
    attr(floating, 'data-santy-placement', side + (align !== 'center' ? '-' + align : ''));
    return side;
  }

  /* ─── overlay base (modal / drawer / bottom-sheet / command palette) ─── */

  var openOverlays = [];

  /**
   * Shared show/hide machinery for anything that covers the page: state class,
   * focus trap, scroll lock, background inert, Esc, and backdrop dismissal.
   */
  function Overlay(el, config) {
    this.el = el;
    this.cfg = config;
  }

  Overlay.prototype.isOpen = function () {
    return hasClass(this.el, this.cfg.openClass);
  };

  Overlay.prototype.open = function () {
    var self = this, el = this.el, cfg = this.cfg;
    if (this.isOpen() || !emit(el, 'santy:show')) return this;

    attr(el, 'aria-hidden', 'false');
    if (cfg.role && !attr(el, 'role')) attr(el, 'role', cfg.role);
    if (cfg.role === 'dialog') attr(el, 'aria-modal', 'true');

    // display:none elements cannot animate — paint once, then add the class.
    el.style.display = cfg.display || '';
    /* force reflow so the transition has a starting frame */
    void el.offsetHeight;
    addClass(el, cfg.openClass);

    if (cfg.lockScroll !== false) lockScroll();
    if (cfg.inertBackground !== false) setBackgroundInert(el);
    if (cfg.trapFocus !== false) focusTrap.activate(el);

    openOverlays.push(this);
    afterTransition(cfg.animated || el, function () { emit(el, 'santy:shown'); });
    return this;
  };

  Overlay.prototype.close = function () {
    var self = this, el = this.el, cfg = this.cfg;
    if (!this.isOpen() || !emit(el, 'santy:hide')) return this;

    removeClass(el, cfg.openClass);
    attr(el, 'aria-hidden', 'true');

    if (cfg.trapFocus !== false) focusTrap.deactivate(el);
    if (cfg.inertBackground !== false) releaseBackgroundInert();
    if (cfg.lockScroll !== false) unlockScroll();

    var i = openOverlays.indexOf(this);
    if (i > -1) openOverlays.splice(i, 1);

    afterTransition(cfg.animated || el, function () {
      // Only hide if it was not reopened during the transition.
      if (!hasClass(el, cfg.openClass)) el.style.display = 'none';
      emit(el, 'santy:hidden');
    });
    return this;
  };

  Overlay.prototype.toggle = function () {
    return this.isOpen() ? this.close() : this.open();
  };

  /** Cache one Overlay instance per element so state is never duplicated. */
  function overlayFor(el, cfg) {
    if (!el) return null;
    if (!el.__santyOverlay) el.__santyOverlay = new Overlay(el, cfg);
    return el.__santyOverlay;
  }

  /** Build the public open/close/toggle facade for an overlay flavour. */
  function overlayAPI(cfg) {
    return {
      open:   function (t) { var o = overlayFor($(t), cfg); return o && o.open(); },
      close:  function (t) { var o = overlayFor($(t), cfg); return o && o.close(); },
      toggle: function (t) { var o = overlayFor($(t), cfg); return o && o.toggle(); },
      isOpen: function (t) { var o = overlayFor($(t), cfg); return !!o && o.isOpen(); }
    };
  }

  var MODAL_CFG  = { openClass: 'open', display: 'flex',  role: 'dialog' };
  var DRAWER_CFG = { openClass: 'open', display: 'block', role: 'dialog',
                     animated: null /* resolved per element below */ };
  var SHEET_CFG  = { openClass: 'open', display: '',      role: 'dialog' };
  var PALETTE_CFG = { openClass: 'open', display: 'flex', role: 'dialog' };

  var modal   = overlayAPI(MODAL_CFG);
  var drawer  = overlayAPI(DRAWER_CFG);
  var sheet   = overlayAPI(SHEET_CFG);

  /* ─── dropdown ───────────────────────────────────────────────────────── */

  var openDropdowns = [];

  function dropdownRoot(el) {
    return el.closest ? (el.closest('.dropdown') || el.closest('.make-dropdown')) : null;
  }

  function closeDropdown(root, opts) {
    if (!root || !hasClass(root, 'open')) return;
    if (!emit(root, 'santy:hide')) return;
    removeClass(root, 'open');
    var toggle = $('[data-santy-toggle="dropdown"], .dropdown-toggle', root);
    if (toggle) attr(toggle, 'aria-expanded', 'false');
    var menu = $('.dropdown-menu, .menu', root);
    // Positioning wrote inline styles; clear them so CSS owns the closed state.
    if (menu) { menu.style.position = ''; menu.style.top = ''; menu.style.left = ''; menu.style.margin = ''; }
    var i = openDropdowns.indexOf(root);
    if (i > -1) openDropdowns.splice(i, 1);
    if (opts && opts.focus && toggle) toggle.focus();
    emit(root, 'santy:hidden');
  }

  function closeAllDropdowns(except) {
    openDropdowns.slice().forEach(function (d) { if (d !== except) closeDropdown(d); });
  }

  function openDropdown(root) {
    if (!root || hasClass(root, 'open')) return;
    if (!emit(root, 'santy:show')) return;
    closeAllDropdowns(root);
    addClass(root, 'open');
    var toggle = $('[data-santy-toggle="dropdown"], .dropdown-toggle', root);
    if (toggle) attr(toggle, 'aria-expanded', 'true');
    var menu = $('.dropdown-menu, .menu', root);
    if (menu && attr(root, 'data-santy-fixed') !== 'false' && toggle) {
      // Escape overflow:hidden ancestors by pinning the menu to the viewport.
      var placement = attr(root, 'data-santy-placement') ||
                      (hasClass(menu, 'dropdown-menu-top') ? 'top-start' :
                       hasClass(menu, 'dropdown-menu-right') ? 'bottom-end' : 'bottom-start');
      position(toggle, menu, { placement: placement, offset: 4 });
    }
    openDropdowns.push(root);
    emit(root, 'santy:shown');
  }

  function toggleDropdown(root) {
    if (hasClass(root, 'open')) closeDropdown(root); else openDropdown(root);
  }

  /** Arrow-key roving within an open menu, per WAI-ARIA menu pattern. */
  function dropdownKeydown(e) {
    var root = dropdownRoot(e.target);
    if (!root || !hasClass(root, 'open')) return;
    var items = $$('.dropdown-item, .menu a, .menu button', root).filter(function (i) {
      return !i.hasAttribute('disabled') && isVisible(i);
    });
    if (!items.length) return;
    var idx = items.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') { e.preventDefault(); items[(idx + 1) % items.length].focus(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); items[(idx - 1 + items.length) % items.length].focus(); }
    else if (e.key === 'Home') { e.preventDefault(); items[0].focus(); }
    else if (e.key === 'End') { e.preventDefault(); items[items.length - 1].focus(); }
  }

  var dropdown = {
    open:   function (t) { openDropdown($(t)); },
    close:  function (t) { closeDropdown($(t)); },
    toggle: function (t) { toggleDropdown($(t)); },
    closeAll: function () { closeAllDropdowns(); }
  };

  /* ─── collapse / accordion ───────────────────────────────────────────── */

  /**
   * Animate max-height from the measured content height instead of the CSS
   * fallback of 2000px, so long panels do not snap and short ones do not lag.
   */
  function collapseShow(body, header) {
    if (!emit(body, 'santy:show')) return;
    addClass(body, 'open');
    if (header) attr(header, 'aria-expanded', 'true');
    attr(body, 'aria-hidden', 'false');
    body.style.maxHeight = body.scrollHeight + 'px';
    afterTransition(body, function () {
      // Drop the fixed height so nested content can grow freely afterwards.
      if (hasClass(body, 'open')) body.style.maxHeight = 'none';
      emit(body, 'santy:shown');
    });
  }

  function collapseHide(body, header) {
    if (!emit(body, 'santy:hide')) return;
    // From 'none' the browser has nothing to animate from — pin the current height first.
    body.style.maxHeight = body.scrollHeight + 'px';
    void body.offsetHeight;
    removeClass(body, 'open');
    if (header) attr(header, 'aria-expanded', 'false');
    attr(body, 'aria-hidden', 'true');
    body.style.maxHeight = '';
    afterTransition(body, function () { emit(body, 'santy:hidden'); });
  }

  function collapseToggle(body, header) {
    if (hasClass(body, 'open')) collapseHide(body, header); else collapseShow(body, header);
  }

  function accordionToggle(header) {
    var item = header.closest('.accordion-item') || header.parentElement;
    var body = $('.accordion-body', item) || targetOf(header);
    if (!body) return;
    var group = header.closest('.accordion');
    var multi = group && attr(group, 'data-santy-multi') === 'true';
    if (!multi && group && !hasClass(body, 'open')) {
      // Single-open mode: collapse siblings first.
      $$('.accordion-body.open', group).forEach(function (other) {
        if (other !== body) collapseHide(other, $('.accordion-header[aria-expanded="true"]', other.closest('.accordion-item')));
      });
    }
    collapseToggle(body, header);
  }

  var collapse = {
    show:   function (t) { var b = $(t); if (b) collapseShow(b); },
    hide:   function (t) { var b = $(t); if (b) collapseHide(b); },
    toggle: function (t) { var b = $(t); if (b) collapseToggle(b); }
  };

  /* ─── tabs (WAI-ARIA tabs pattern with roving tabindex) ──────────────── */

  function tabList(tab) {
    return tab.closest('.tabs') || tab.parentElement;
  }

  function tabItems(list) {
    return $$('.tabs-item', list).filter(function (t) { return !t.hasAttribute('disabled'); });
  }

  function activateTab(tab, setFocus) {
    var list = tabList(tab);
    if (!list || !emit(tab, 'santy:show')) return;
    var items = tabItems(list);

    items.forEach(function (t) {
      var selected = t === tab;
      t.classList.toggle('active', selected);
      attr(t, 'aria-selected', selected ? 'true' : 'false');
      // Roving tabindex: only the active tab is reachable by Tab.
      attr(t, 'tabindex', selected ? '0' : '-1');
      var panel = targetOf(t) || (attr(t, 'aria-controls') ? $('#' + attr(t, 'aria-controls')) : null);
      if (panel) {
        panel.classList.toggle('active', selected);
        attr(panel, 'aria-hidden', selected ? 'false' : 'true');
      }
    });

    if (setFocus) tab.focus();
    emit(tab, 'santy:shown');
  }

  function tabsKeydown(e) {
    var tab = e.target.closest && e.target.closest('.tabs-item');
    if (!tab) return;
    var list = tabList(tab);
    var items = tabItems(list);
    var idx = items.indexOf(tab);
    if (idx < 0) return;
    var vertical = attr(list, 'aria-orientation') === 'vertical';
    var next = vertical ? 'ArrowDown' : 'ArrowRight';
    var prev = vertical ? 'ArrowUp' : 'ArrowLeft';

    if (e.key === next) { e.preventDefault(); activateTab(items[(idx + 1) % items.length], true); }
    else if (e.key === prev) { e.preventDefault(); activateTab(items[(idx - 1 + items.length) % items.length], true); }
    else if (e.key === 'Home') { e.preventDefault(); activateTab(items[0], true); }
    else if (e.key === 'End') { e.preventDefault(); activateTab(items[items.length - 1], true); }
  }

  var tabs = {
    show: function (t) { var el = $(t); if (el) activateTab(el, false); }
  };

  /* ─── tooltip ────────────────────────────────────────────────────────── */

  var activeTip = null;

  function showTooltip(anchor) {
    var text = attr(anchor, 'data-santy-tooltip');
    if (!text) return;
    hideTooltip();
    var tip = document.createElement('div');
    tip.className = 'santy-tip ' + (attr(anchor, 'data-santy-tooltip-class') || '');
    tip.setAttribute('role', 'tooltip');
    tip.id = 'santy-tip-' + Date.now();
    tip.textContent = text;
    document.body.appendChild(tip);
    position(anchor, tip, { placement: attr(anchor, 'data-santy-placement') || 'top', offset: 8 });
    // Paint at the final position before fading in.
    requestAnimationFrame(function () { addClass(tip, 'show'); });
    attr(anchor, 'aria-describedby', tip.id);
    activeTip = { el: tip, anchor: anchor };
  }

  function hideTooltip() {
    if (!activeTip) return;
    var tip = activeTip.el, anchor = activeTip.anchor;
    activeTip = null;
    attr(anchor, 'aria-describedby', null);
    removeClass(tip, 'show');
    afterTransition(tip, function () { if (tip.parentNode) tip.parentNode.removeChild(tip); });
  }

  var tooltip = { show: function (t) { showTooltip($(t)); }, hide: hideTooltip };

  /* ─── popover ────────────────────────────────────────────────────────── */

  var openPopovers = [];

  function openPopover(trigger) {
    var pop = targetOf(trigger);
    if (!pop || hasClass(pop, 'open')) return;
    if (!emit(pop, 'santy:show')) return;
    pop.style.display = 'block';
    void pop.offsetHeight;
    addClass(pop, 'open');
    position(trigger, pop, { placement: attr(trigger, 'data-santy-placement') || 'bottom', offset: 8 });
    attr(trigger, 'aria-expanded', 'true');
    pop.__santyTrigger = trigger;
    openPopovers.push(pop);
    emit(pop, 'santy:shown');
  }

  function closePopover(pop, focusTrigger) {
    if (!pop || !hasClass(pop, 'open')) return;
    if (!emit(pop, 'santy:hide')) return;
    removeClass(pop, 'open');
    var trigger = pop.__santyTrigger;
    if (trigger) attr(trigger, 'aria-expanded', 'false');
    var i = openPopovers.indexOf(pop);
    if (i > -1) openPopovers.splice(i, 1);
    afterTransition(pop, function () {
      if (!hasClass(pop, 'open')) pop.style.display = 'none';
      emit(pop, 'santy:hidden');
    });
    if (focusTrigger && trigger) trigger.focus();
  }

  function closeAllPopovers() { openPopovers.slice().forEach(function (p) { closePopover(p); }); }

  var popover = {
    open:  function (t) { openPopover($(t)); },
    close: function (t) { closePopover($(t)); },
    closeAll: closeAllPopovers
  };

  /* ─── carousel ───────────────────────────────────────────────────────── */

  function Carousel(el) {
    this.el = el;
    this.items = $$('.carousel-item, .swipe-carousel-item', el);
    this.dots = $$('.carousel-dot, .swipe-carousel-dot', el.parentElement || el);
    this.index = 0;
    this.timer = null;
    this.interval = parseInt(attr(el, 'data-santy-interval'), 10) || 0;
    this.loop = attr(el, 'data-santy-loop') !== 'false';
    this.init();
  }

  Carousel.prototype.init = function () {
    var self = this;
    if (!attr(this.el, 'role')) attr(this.el, 'role', 'region');
    attr(this.el, 'aria-roledescription', 'carousel');

    this.dots.forEach(function (dot, i) {
      if (!attr(dot, 'role')) attr(dot, 'role', 'button');
      if (dot.tabIndex < 0) attr(dot, 'tabindex', '0');
      attr(dot, 'aria-label', 'Go to slide ' + (i + 1));
      on(dot, 'click', function () { self.go(i); });
      on(dot, 'keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); self.go(i); }
      });
    });

    // Keep dots in sync when the user scrolls/swipes the track directly.
    var scrollTimer;
    on(this.el, 'scroll', function () {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(function () { self.syncFromScroll(); }, 90);
    }, { passive: true });

    on(this.el, 'keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); self.next(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); self.prev(); }
    });

    // Pause autoplay whenever the user is likely reading.
    on(this.el, 'mouseenter', function () { self.pause(); });
    on(this.el, 'mouseleave', function () { self.play(); });
    on(this.el, 'focusin', function () { self.pause(); });
    on(this.el, 'focusout', function () { self.play(); });

    this.update();
    this.play();
  };

  Carousel.prototype.syncFromScroll = function () {
    if (!this.items.length) return;
    var left = this.el.scrollLeft;
    var best = 0, bestDist = Infinity;
    for (var i = 0; i < this.items.length; i++) {
      var d = Math.abs(this.items[i].offsetLeft - this.el.offsetLeft - left);
      if (d < bestDist) { bestDist = d; best = i; }
    }
    if (best !== this.index) { this.index = best; this.update(); }
  };

  Carousel.prototype.go = function (i, smooth) {
    if (!this.items.length) return;
    if (i < 0) i = this.loop ? this.items.length - 1 : 0;
    if (i >= this.items.length) i = this.loop ? 0 : this.items.length - 1;
    this.index = i;
    var item = this.items[i];
    if (item) {
      this.el.scrollTo({
        left: item.offsetLeft - this.el.offsetLeft,
        behavior: (smooth === false || prefersReducedMotion()) ? 'auto' : 'smooth'
      });
    }
    this.update();
    emit(this.el, 'santy:slide', { index: i });
  };

  Carousel.prototype.update = function () {
    var self = this;
    this.dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === self.index);
      attr(dot, 'aria-current', i === self.index ? 'true' : 'false');
    });
    this.items.forEach(function (item, i) {
      attr(item, 'aria-hidden', i === self.index ? 'false' : 'true');
    });
  };

  Carousel.prototype.next = function () { this.go(this.index + 1); };
  Carousel.prototype.prev = function () { this.go(this.index - 1); };

  Carousel.prototype.play = function () {
    var self = this;
    if (!this.interval || this.timer || prefersReducedMotion()) return;
    this.timer = setInterval(function () { self.next(); }, this.interval);
  };

  Carousel.prototype.pause = function () {
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
  };

  function carouselFor(el) {
    if (!el) return null;
    if (!el.__santyCarousel) el.__santyCarousel = new Carousel(el);
    return el.__santyCarousel;
  }

  var carousel = {
    next: function (t) { var c = carouselFor($(t)); if (c) c.next(); },
    prev: function (t) { var c = carouselFor($(t)); if (c) c.prev(); },
    go:   function (t, i) { var c = carouselFor($(t)); if (c) c.go(i); },
    play: function (t) { var c = carouselFor($(t)); if (c) c.play(); },
    pause: function (t) { var c = carouselFor($(t)); if (c) c.pause(); }
  };

  /* ─── toast ──────────────────────────────────────────────────────────── */

  var toastContainer = null;

  function ensureToastContainer(pos) {
    var id = 'santy-toast-' + (pos || 'default');
    var existing = document.getElementById(id);
    if (existing) return existing;
    var c = document.createElement('div');
    c.id = id;
    c.className = 'toast-container' + (pos ? ' toast-container-' + pos : '');
    // Announce politely so a toast does not interrupt the user mid-sentence.
    attr(c, 'role', 'status');
    attr(c, 'aria-live', 'polite');
    attr(c, 'aria-atomic', 'false');
    document.body.appendChild(c);
    return c;
  }

  /**
   * Santy.toast('Saved')
   * Santy.toast('Upload failed', { variant: 'error', duration: 0, action: {…} })
   */
  function toast(message, opts) {
    opts = opts || {};
    var container = ensureToastContainer(opts.position);
    var el = document.createElement('div');
    el.className = 'toast toast-' + (opts.variant || 'info');
    if (opts.className) el.className += ' ' + opts.className;
    // Errors need to cut through; everything else stays polite.
    attr(el, 'role', opts.variant === 'error' || opts.variant === 'danger' ? 'alert' : 'status');

    var body = document.createElement('div');
    body.className = 'toast-body';
    if (opts.title) {
      var t = document.createElement('div');
      t.className = 'toast-title';
      t.textContent = opts.title;
      body.appendChild(t);
    }
    var msg = document.createElement('div');
    msg.className = 'toast-message';
    msg.textContent = message == null ? '' : String(message);
    body.appendChild(msg);
    el.appendChild(body);

    if (opts.action && opts.action.label) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'toast-action';
      btn.textContent = opts.action.label;
      on(btn, 'click', function () {
        if (typeof opts.action.onClick === 'function') opts.action.onClick();
        dismiss();
      });
      el.appendChild(btn);
    }

    if (opts.dismissible !== false) {
      var close = document.createElement('button');
      close.type = 'button';
      close.className = 'toast-close';
      close.setAttribute('aria-label', opts.closeLabel || 'Dismiss notification');
      close.innerHTML = '&times;';
      on(close, 'click', dismiss);
      el.appendChild(close);
    }

    container.appendChild(el);
    requestAnimationFrame(function () { addClass(el, 'show'); });

    var duration = opts.duration == null ? 4000 : opts.duration;
    var timer = duration > 0 ? setTimeout(dismiss, duration) : null;
    // Do not yank a toast away while the user is reading or using its action.
    on(el, 'mouseenter', function () { if (timer) { clearTimeout(timer); timer = null; } });
    on(el, 'mouseleave', function () {
      if (duration > 0 && !timer) timer = setTimeout(dismiss, duration);
    });

    var dismissed = false;
    function dismiss() {
      if (dismissed) return;
      dismissed = true;
      if (timer) clearTimeout(timer);
      removeClass(el, 'show');
      afterTransition(el, function () {
        if (el.parentNode) el.parentNode.removeChild(el);
        if (typeof opts.onDismiss === 'function') opts.onDismiss();
      });
    }

    return { el: el, dismiss: dismiss };
  }

  ['success', 'error', 'warning', 'info'].forEach(function (v) {
    toast[v] = function (msg, opts) {
      opts = opts || {};
      opts.variant = v;
      return toast(msg, opts);
    };
  });

  /* ─── theme ──────────────────────────────────────────────────────────── */

  var THEME_KEY = 'santy-theme';

  function storedTheme() {
    try { return localStorage.getItem(THEME_KEY); } catch (e) { return null; }
  }

  function systemTheme() {
    return (hasDOM && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
      ? 'dark' : 'light';
  }

  var theme = {
    /** 'light' | 'dark' | any named data-theme preset. */
    get: function () {
      return document.documentElement.getAttribute('data-theme') ||
             (hasClass(document.documentElement, 'dark') ? 'dark' : 'light');
    },
    set: function (name, persist) {
      var html = document.documentElement;
      attr(html, 'data-theme', name);
      // .dark is the variant hook the utility classes key off.
      html.classList.toggle('dark', name === 'dark' || name === 'midnight');
      if (persist !== false) {
        try { localStorage.setItem(THEME_KEY, name); } catch (e) { /* private mode */ }
      }
      $$('[data-santy-theme-toggle]').forEach(function (btn) {
        attr(btn, 'aria-pressed', name === 'dark' ? 'true' : 'false');
      });
      emit(document.documentElement, 'santy:theme', { theme: name });
      return name;
    },
    toggle: function () {
      return theme.set(theme.get() === 'dark' ? 'light' : 'dark');
    },
    /** Clear the saved choice and follow the OS again. */
    system: function () {
      try { localStorage.removeItem(THEME_KEY); } catch (e) { /* ignore */ }
      return theme.set(systemTheme(), false);
    },
    init: function () {
      theme.set(storedTheme() || systemTheme(), false);
      if (window.matchMedia) {
        var mq = window.matchMedia('(prefers-color-scheme: dark)');
        var handler = function () { if (!storedTheme()) theme.set(systemTheme(), false); };
        if (mq.addEventListener) mq.addEventListener('change', handler);
        else if (mq.addListener) mq.addListener(handler);
      }
    }
  };

  /* ─── scrollspy ──────────────────────────────────────────────────────── */

  function scrollspy(nav, opts) {
    nav = $(nav);
    if (!nav || typeof IntersectionObserver === 'undefined') return;
    opts = opts || {};
    var links = $$('a[href^="#"]', nav);
    var map = {};
    var sections = [];
    links.forEach(function (link) {
      var section = $(link.getAttribute('href'));
      if (!section) return;
      map[section.id] = link;
      sections.push(section);
    });
    if (!sections.length) return;

    var visible = {};
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { visible[e.target.id] = e.isIntersecting ? e.intersectionRatio : 0; });
      // Highlight whichever tracked section currently occupies the most viewport.
      var bestId = null, best = 0;
      Object.keys(visible).forEach(function (id) {
        if (visible[id] > best) { best = visible[id]; bestId = id; }
      });
      links.forEach(function (l) { l.classList.remove('active'); attr(l, 'aria-current', null); });
      if (bestId && map[bestId]) {
        addClass(map[bestId], 'active');
        attr(map[bestId], 'aria-current', 'true');
      }
    }, {
      rootMargin: opts.rootMargin || '-20% 0px -70% 0px',
      threshold: opts.threshold || [0, 0.25, 0.5, 0.75, 1]
    });
    sections.forEach(function (s) { obs.observe(s); });
    return obs;
  }

  /* ─── ripple (Material-style press feedback) ─────────────────────────── */

  function ripple(e) {
    var host = e.currentTarget;
    if (prefersReducedMotion()) return;
    var rect = host.getBoundingClientRect();
    var size = Math.max(rect.width, rect.height);
    var span = document.createElement('span');
    span.className = 'santy-ripple';
    span.style.width = span.style.height = size + 'px';
    span.style.left = (e.clientX - rect.left - size / 2) + 'px';
    span.style.top = (e.clientY - rect.top - size / 2) + 'px';
    // The ripple is decoration; keep it away from assistive tech.
    span.setAttribute('aria-hidden', 'true');
    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
    host.appendChild(span);
    on(span, 'animationend', function () {
      if (span.parentNode) span.parentNode.removeChild(span);
    });
  }

  /* ─── data table ─────────────────────────────────────────────────────── */

  /**
   * Sort a .data-table by the given header column.
   *
   * Cell values come from data-sort-value when present, otherwise textContent.
   * Columns declare their kind with data-sort-type="number|date|text" (default
   * text, compared with localeCompare so accented names order correctly).
   */
  function sortTable(th, direction) {
    var table = th.closest('table');
    if (!table) return;
    var tbody = table.tBodies[0];
    if (!tbody) return;
    var headers = $$('th', th.parentElement);
    var col = headers.indexOf(th);
    if (col < 0) return;

    var current = attr(th, 'aria-sort');
    var dir = direction || (current === 'ascending' ? 'descending' : 'ascending');
    if (!emit(table, 'santy:sort', { column: col, direction: dir })) return;

    var type = attr(th, 'data-sort-type') || 'text';
    var sign = dir === 'ascending' ? 1 : -1;

    function keyOf(row) {
      var cell = row.cells[col];
      if (!cell) return '';
      var raw = attr(cell, 'data-sort-value');
      return raw === null ? cell.textContent.trim() : raw;
    }

    // Detail rows belong to the row above and must travel with it.
    var rows = $$('tr', tbody).filter(function (r) { return !hasClass(r, 'data-table-detail'); });
    var details = {};
    rows.forEach(function (r) {
      var next = r.nextElementSibling;
      if (next && hasClass(next, 'data-table-detail')) details[rows.indexOf(r)] = next;
    });

    var decorated = rows.map(function (row, i) { return { row: row, key: keyOf(row), i: i }; });
    decorated.sort(function (a, b) {
      var av = a.key, bv = b.key, cmp;
      if (type === 'number') {
        var an = parseFloat(String(av).replace(/[^0-9.eE+-]/g, ''));
        var bn = parseFloat(String(bv).replace(/[^0-9.eE+-]/g, ''));
        // Blanks always sink, regardless of direction.
        if (isNaN(an) && isNaN(bn)) cmp = 0;
        else if (isNaN(an)) return 1;
        else if (isNaN(bn)) return -1;
        else cmp = an - bn;
      } else if (type === 'date') {
        var ad = Date.parse(av), bd = Date.parse(bv);
        if (isNaN(ad) && isNaN(bd)) cmp = 0;
        else if (isNaN(ad)) return 1;
        else if (isNaN(bd)) return -1;
        else cmp = ad - bd;
      } else {
        cmp = String(av).localeCompare(String(bv), undefined, { numeric: true, sensitivity: 'base' });
      }
      // Fall back to original order so equal keys keep a stable sort.
      return cmp === 0 ? a.i - b.i : cmp * sign;
    });

    var frag = document.createDocumentFragment();
    decorated.forEach(function (d) {
      frag.appendChild(d.row);
      if (details[d.i]) frag.appendChild(details[d.i]);
    });
    tbody.appendChild(frag);

    headers.forEach(function (h) { if (h !== th && attr(h, 'aria-sort')) attr(h, 'aria-sort', 'none'); });
    attr(th, 'aria-sort', dir);
    emit(table, 'santy:sorted', { column: col, direction: dir });
  }

  /** Toggle every row checkbox from the header checkbox, and keep it in sync. */
  function tableSelectAll(master) {
    var table = master.closest('table');
    if (!table) return;
    var boxes = $$('tbody .data-table-select input[type="checkbox"]', table)
      .filter(function (b) { return !b.disabled; });
    boxes.forEach(function (b) {
      b.checked = master.checked;
      var row = b.closest('tr');
      if (row) row.classList.toggle('selected', master.checked);
    });
    master.indeterminate = false;
    emit(table, 'santy:select', { count: master.checked ? boxes.length : 0 });
  }

  function tableRowSelect(box) {
    var table = box.closest('table');
    var row = box.closest('tr');
    if (row) row.classList.toggle('selected', box.checked);
    if (!table) return;
    var boxes = $$('tbody .data-table-select input[type="checkbox"]', table);
    var checked = boxes.filter(function (b) { return b.checked; }).length;
    var master = $('thead .data-table-select input[type="checkbox"]', table);
    if (master) {
      master.checked = checked > 0 && checked === boxes.length;
      // Partial selection is a third state, not just "off".
      master.indeterminate = checked > 0 && checked < boxes.length;
    }
    emit(table, 'santy:select', { count: checked });
  }

  var table = {
    sort: function (th, dir) { var el = $(th); if (el) sortTable(el, dir); },
    selectAll: function (t) { var el = $(t); if (el) tableSelectAll(el); }
  };

  /* ─── combobox / autocomplete ────────────────────────────────────────── */

  function comboOptions(combo) {
    return $$('.combobox-option', combo).filter(function (o) {
      return attr(o, 'aria-disabled') !== 'true';
    });
  }

  function escapeRegExp(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  /** Filter the list to options containing `query`, highlighting the match. */
  function comboFilter(combo, query) {
    var q = (query || '').trim();
    var re = q ? new RegExp('(' + escapeRegExp(q) + ')', 'i') : null;
    var shown = 0;

    $$('.combobox-option', combo).forEach(function (opt) {
      var label = $('.combobox-option-label', opt);
      // Without a dedicated label node, only a text-only option is safe to
      // rewrite — otherwise highlighting would blow away child markup.
      var target = label || (opt.children.length === 0 ? opt : null);
      var text = attr(opt, 'data-value') ||
                 (target ? target.textContent : opt.textContent);
      var match = !q || text.toLowerCase().indexOf(q.toLowerCase()) > -1;
      opt.hidden = !match;
      if (match) {
        shown++;
        if (target) {
          if (re) target.innerHTML = escapeHTML(text).replace(re, '<mark>$1</mark>');
          else target.textContent = text;
        }
      }
      removeClass(opt, 'active');
    });

    // Hide a group heading when everything under it is filtered out.
    $$('.combobox-group-label', combo).forEach(function (g) {
      var any = false, n = g.nextElementSibling;
      while (n && !hasClass(n, 'combobox-group-label')) {
        if (hasClass(n, 'combobox-option') && !n.hidden) { any = true; break; }
        n = n.nextElementSibling;
      }
      g.hidden = !any;
    });

    var empty = $('.combobox-empty', combo);
    if (empty) empty.hidden = shown > 0;
    return shown;
  }

  function escapeHTML(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function comboOpen(combo) {
    if (hasClass(combo, 'open') || !emit(combo, 'santy:show')) return;
    addClass(combo, 'open');
    var input = $('.combobox-input', combo);
    if (input) attr(input, 'aria-expanded', 'true');
    emit(combo, 'santy:shown');
  }

  function comboClose(combo) {
    if (!hasClass(combo, 'open') || !emit(combo, 'santy:hide')) return;
    removeClass(combo, 'open');
    var input = $('.combobox-input', combo);
    if (input) { attr(input, 'aria-expanded', 'false'); attr(input, 'aria-activedescendant', null); }
    $$('.combobox-option.active', combo).forEach(function (o) { removeClass(o, 'active'); });
    emit(combo, 'santy:hidden');
  }

  /** Move the virtual cursor; the input keeps DOM focus for typing. */
  function comboMove(combo, delta) {
    var opts = comboOptions(combo).filter(function (o) { return !o.hidden; });
    if (!opts.length) return;
    var currentIdx = -1;
    opts.forEach(function (o, i) { if (hasClass(o, 'active')) currentIdx = i; });
    var next = currentIdx + delta;
    if (next < 0) next = opts.length - 1;
    if (next >= opts.length) next = 0;
    opts.forEach(function (o) { removeClass(o, 'active'); });
    var target = opts[next];
    addClass(target, 'active');
    if (!target.id) target.id = 'santy-opt-' + Math.random().toString(36).slice(2, 8);
    var input = $('.combobox-input', combo);
    if (input) attr(input, 'aria-activedescendant', target.id);
    // scrollIntoView with block:'nearest' avoids yanking the whole page.
    if (target.scrollIntoView) target.scrollIntoView({ block: 'nearest' });
  }

  function comboSelect(combo, option) {
    if (!option) return;
    var multi = attr(combo, 'data-santy-multiple') === 'true';
    var label = $('.combobox-option-label', option) || option;
    var value = attr(option, 'data-value') || label.textContent.trim();
    var input = $('.combobox-input', combo);

    if (!emit(combo, 'santy:select', { value: value, option: option })) return;

    if (multi) {
      var already = attr(option, 'aria-selected') === 'true';
      attr(option, 'aria-selected', already ? 'false' : 'true');
      if (already) removeChip(combo, value); else addChip(combo, value);
      if (input) { input.value = ''; comboFilter(combo, ''); input.focus(); }
    } else {
      comboOptions(combo).forEach(function (o) { attr(o, 'aria-selected', 'false'); });
      attr(option, 'aria-selected', 'true');
      if (input) input.value = value;
      comboClose(combo);
    }
    syncComboValue(combo);
    emit(combo, 'santy:change', { value: comboValue(combo) });
  }

  function addChip(combo, value) {
    var control = $('.combobox-control', combo);
    var input = $('.combobox-input', combo);
    if (!control) return;
    var chip = document.createElement('span');
    chip.className = 'combobox-chip';
    chip.setAttribute('data-value', value);
    var lab = document.createElement('span');
    lab.className = 'combobox-chip-label';
    lab.textContent = value;
    var rm = document.createElement('button');
    rm.type = 'button';
    rm.className = 'combobox-chip-remove';
    rm.setAttribute('aria-label', 'Remove ' + value);
    rm.innerHTML = '&times;';
    chip.appendChild(lab);
    chip.appendChild(rm);
    control.insertBefore(chip, input || null);
  }

  function removeChip(combo, value) {
    $$('.combobox-chip', combo).forEach(function (c) {
      if (attr(c, 'data-value') === value && c.parentNode) c.parentNode.removeChild(c);
    });
  }

  function comboValue(combo) {
    if (attr(combo, 'data-santy-multiple') === 'true') {
      return $$('.combobox-chip', combo).map(function (c) { return attr(c, 'data-value'); });
    }
    var sel = $('.combobox-option[aria-selected="true"]', combo);
    return sel ? (attr(sel, 'data-value') || sel.textContent.trim()) : '';
  }

  /** Mirror the selection into a hidden input so plain form posts work. */
  function syncComboValue(combo) {
    var hidden = $('input[type="hidden"]', combo);
    if (!hidden) return;
    var v = comboValue(combo);
    hidden.value = Array.isArray(v) ? v.join(',') : v;
  }

  function comboKeydown(e) {
    var combo = e.target.closest && e.target.closest('.combobox');
    if (!combo) return;
    var open = hasClass(combo, 'open');

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) comboOpen(combo);
      comboMove(combo, 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!open) comboOpen(combo);
      comboMove(combo, -1);
    } else if (e.key === 'Enter') {
      if (open) {
        var active = $('.combobox-option.active', combo);
        if (active) { e.preventDefault(); comboSelect(combo, active); }
      }
    } else if (e.key === 'Escape') {
      if (open) { e.stopPropagation(); comboClose(combo); }
    } else if (e.key === 'Backspace') {
      // Empty input + Backspace removes the last chip, as in every chip UI.
      var input = $('.combobox-input', combo);
      if (input && !input.value) {
        var chips = $$('.combobox-chip', combo);
        var last = chips[chips.length - 1];
        if (last) {
          var v = attr(last, 'data-value');
          removeChip(combo, v);
          $$('.combobox-option', combo).forEach(function (o) {
            if ((attr(o, 'data-value') || o.textContent.trim()) === v) attr(o, 'aria-selected', 'false');
          });
          syncComboValue(combo);
          emit(combo, 'santy:change', { value: comboValue(combo) });
        }
      }
    }
  }

  var combobox = {
    open:   function (t) { var c = $(t); if (c) comboOpen(c); },
    close:  function (t) { var c = $(t); if (c) comboClose(c); },
    filter: function (t, q) { var c = $(t); return c ? comboFilter(c, q) : 0; },
    value:  function (t) { var c = $(t); return c ? comboValue(c) : null; }
  };

  /* ─── global delegated event wiring ──────────────────────────────────── */

  var OVERLAY_KINDS = {
    modal:          MODAL_CFG,
    drawer:         DRAWER_CFG,
    offcanvas:      DRAWER_CFG,
    'bottom-sheet': SHEET_CFG,
    palette:        PALETTE_CFG
  };

  function onDocumentClick(e) {
    var t = e.target;
    if (!t.closest) return;

    /* dismiss buttons — walk up to the overlay they belong to */
    var dismiss = t.closest('[data-santy-dismiss]');
    if (dismiss) {
      // data-santy-dismiss="#id" targets explicitly; bare attribute walks up.
      var explicit = attr(dismiss, 'data-santy-dismiss');
      var named = explicit && explicit.charAt(0) === '#' ? $(explicit) : null;
      if (named && named.__santyOverlay) { e.preventDefault(); named.__santyOverlay.close(); return; }
      var overlayEl = dismiss.closest('.modal-overlay, .drawer-overlay, .bottom-sheet, .command-palette-wrap, .cmd-palette-backdrop');
      if (overlayEl && overlayEl.__santyOverlay) { e.preventDefault(); overlayEl.__santyOverlay.close(); return; }
      var pop = dismiss.closest('.popover');
      if (pop) { e.preventDefault(); closePopover(pop, true); return; }
      var toastEl = dismiss.closest('.toast');
      if (toastEl) { e.preventDefault(); removeClass(toastEl, 'show');
        afterTransition(toastEl, function () { if (toastEl.parentNode) toastEl.parentNode.removeChild(toastEl); });
        return; }
      var dd = dropdownRoot(dismiss);
      if (dd) { e.preventDefault(); closeDropdown(dd, { focus: true }); return; }
    }

    /* toggles */
    var toggle = t.closest('[data-santy-toggle]');
    if (toggle) {
      var kind2 = attr(toggle, 'data-santy-toggle');

      if (OVERLAY_KINDS[kind2]) {
        var target = targetOf(toggle);
        if (target) {
          e.preventDefault();
          var cfg = OVERLAY_KINDS[kind2];
          if (!attr(toggle, 'aria-haspopup')) attr(toggle, 'aria-haspopup', 'dialog');
          overlayFor(target, cfg).toggle();
          return;
        }
      }

      if (kind2 === 'dropdown') {
        e.preventDefault();
        e.stopPropagation();
        var root = dropdownRoot(toggle);
        if (root) toggleDropdown(root);
        return;
      }

      if (kind2 === 'tab') { e.preventDefault(); activateTab(toggle, false); return; }

      if (kind2 === 'accordion') { e.preventDefault(); accordionToggle(toggle); return; }

      if (kind2 === 'collapse') {
        e.preventDefault();
        var body = targetOf(toggle);
        if (body) collapseToggle(body, toggle);
        return;
      }

      if (kind2 === 'popover') {
        e.preventDefault();
        e.stopPropagation();
        var pop2 = targetOf(toggle);
        if (pop2) { hasClass(pop2, 'open') ? closePopover(pop2, true) : openPopover(toggle); }
        return;
      }
    }

    /* bare .tabs-item / .accordion-header without data attributes */
    var tabEl = t.closest('.tabs-item');
    if (tabEl && !attr(tabEl, 'data-santy-toggle') && (targetOf(tabEl) || attr(tabEl, 'aria-controls'))) {
      e.preventDefault();
      activateTab(tabEl, false);
      return;
    }

    /* carousel arrows */
    var prevBtn = t.closest('[data-santy-carousel-prev]');
    var nextBtn = t.closest('[data-santy-carousel-next]');
    if (prevBtn || nextBtn) {
      var btn = prevBtn || nextBtn;
      var sel = attr(btn, 'data-santy-carousel-prev') || attr(btn, 'data-santy-carousel-next');
      var track = sel ? $(sel) : $('.carousel, .swipe-carousel', btn.closest('[data-santy-carousel-root]') || document);
      var inst = carouselFor(track);
      if (inst) { e.preventDefault(); prevBtn ? inst.prev() : inst.next(); }
      return;
    }

    /* number input steppers */
    var numBtn = t.closest('.number-input-btn');
    if (numBtn) {
      e.preventDefault();
      numberStep(numBtn, attr(numBtn, 'data-santy-step') === 'down' ? -1 : 1);
      return;
    }

    /* sortable table headers */
    var sortTh = t.closest('th[aria-sort]');
    if (sortTh) { e.preventDefault(); sortTable(sortTh); return; }

    /* data-table row expand */
    var rowToggle = t.closest('.data-table-row-toggle');
    if (rowToggle) {
      e.preventDefault();
      var tr = rowToggle.closest('tr');
      var detail = tr && tr.nextElementSibling;
      if (detail && hasClass(detail, 'data-table-detail')) {
        var nowOpen = detail.hidden;
        detail.hidden = !nowOpen;
        attr(rowToggle, 'aria-expanded', nowOpen ? 'true' : 'false');
      }
      return;
    }

    /* combobox */
    var chipRemove = t.closest('.combobox-chip-remove');
    if (chipRemove) {
      e.preventDefault();
      var chip = chipRemove.closest('.combobox-chip');
      var cb = chipRemove.closest('.combobox');
      if (chip && cb) {
        var val = attr(chip, 'data-value');
        removeChip(cb, val);
        $$('.combobox-option', cb).forEach(function (o) {
          if ((attr(o, 'data-value') || o.textContent.trim()) === val) attr(o, 'aria-selected', 'false');
        });
        syncComboValue(cb);
        emit(cb, 'santy:change', { value: comboValue(cb) });
      }
      return;
    }
    var comboOpt = t.closest('.combobox-option');
    if (comboOpt) {
      e.preventDefault();
      var cbo = comboOpt.closest('.combobox');
      if (cbo) comboSelect(cbo, comboOpt);
      return;
    }
    var comboHit = t.closest('.combobox-control, .combobox-toggle');
    if (comboHit) {
      var cb2 = comboHit.closest('.combobox');
      if (cb2) {
        if (t.closest('.combobox-toggle')) {
          e.preventDefault();
          hasClass(cb2, 'open') ? comboClose(cb2) : comboOpen(cb2);
        } else {
          comboOpen(cb2);
          var inp = $('.combobox-input', cb2);
          if (inp) inp.focus();
        }
      }
      return;
    }
    // Any click elsewhere closes open comboboxes.
    $$('.combobox.open').forEach(function (c) { if (!c.contains(t)) comboClose(c); });

    /* theme toggle */
    var themeBtn = t.closest('[data-santy-theme-toggle]');
    if (themeBtn) {
      e.preventDefault();
      var named = attr(themeBtn, 'data-santy-theme-toggle');
      if (named && named !== 'true' && named !== '') theme.set(named);
      else theme.toggle();
      return;
    }

    /* click-outside dismissal */
    if (!t.closest('.dropdown, .make-dropdown')) closeAllDropdowns();
    if (!t.closest('.popover') && !t.closest('[data-santy-toggle="popover"]')) closeAllPopovers();

    /* backdrop click on the topmost overlay */
    var top = openOverlays[openOverlays.length - 1];
    if (top && t === top.el && attr(top.el, 'data-santy-backdrop') !== 'static') top.close();
  }

  function onDocumentKeydown(e) {
    if (e.key === 'Escape' || e.key === 'Esc') {
      // Unwind one layer at a time, innermost first.
      if (activeTip) { hideTooltip(); return; }
      if (openPopovers.length) { closePopover(openPopovers[openPopovers.length - 1], true); return; }
      if (openDropdowns.length) { closeDropdown(openDropdowns[openDropdowns.length - 1], { focus: true }); return; }
      var top = openOverlays[openOverlays.length - 1];
      if (top && attr(top.el, 'data-santy-keyboard') !== 'false') top.close();
      return;
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Home' || e.key === 'End') {
      dropdownKeydown(e);
    }
    tabsKeydown(e);
    comboKeydown(e);
    pinKeydown(e);
  }

  /* ─── pin / OTP input ────────────────────────────────────────────────── */

  function pinDigits(wrap) {
    return $$('.pin-digit', wrap).filter(function (d) { return !d.disabled; });
  }

  /** Advance on entry, retreat on Backspace, and accept a pasted full code. */
  function pinInput(e) {
    var digit = e.target.closest && e.target.closest('.pin-digit');
    if (!digit) return;
    var wrap = digit.closest('.pin-input');
    if (!wrap) return;
    var digits = pinDigits(wrap);
    var idx = digits.indexOf(digit);

    // A paste lands entirely in one box — spread it across the rest.
    if (digit.value.length > 1) {
      var chars = digit.value.split('');
      for (var i = 0; i < chars.length && idx + i < digits.length; i++) {
        digits[idx + i].value = chars[i];
      }
      var last = Math.min(idx + chars.length, digits.length - 1);
      digits[last].focus();
    } else if (digit.value && idx < digits.length - 1) {
      digits[idx + 1].focus();
    }

    var code = digits.map(function (d) { return d.value; }).join('');
    emit(wrap, 'santy:change', { value: code });
    if (code.length === digits.length) emit(wrap, 'santy:complete', { value: code });
  }

  function pinKeydown(e) {
    var digit = e.target.closest && e.target.closest('.pin-digit');
    if (!digit) return;
    var wrap = digit.closest('.pin-input');
    if (!wrap) return;
    var digits = pinDigits(wrap);
    var idx = digits.indexOf(digit);

    if (e.key === 'Backspace' && !digit.value && idx > 0) {
      e.preventDefault();
      digits[idx - 1].focus();
      digits[idx - 1].value = '';
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      e.preventDefault();
      digits[idx - 1].focus();
    } else if (e.key === 'ArrowRight' && idx < digits.length - 1) {
      e.preventDefault();
      digits[idx + 1].focus();
    }
  }

  /* ─── number input ───────────────────────────────────────────────────── */

  function numberStep(btn, dir) {
    var wrap = btn.closest('.number-input');
    var field = wrap && $('.number-input-field', wrap);
    if (!field) return;
    var step = parseFloat(attr(field, 'step')) || 1;
    var min = attr(field, 'min') === null ? -Infinity : parseFloat(attr(field, 'min'));
    var max = attr(field, 'max') === null ? Infinity : parseFloat(attr(field, 'max'));
    var current = parseFloat(field.value);
    if (isNaN(current)) current = isFinite(min) ? min : 0;
    var next = Math.min(max, Math.max(min, current + dir * step));
    // Re-round to the step's precision so 0.1 + 0.2 does not leak through.
    var decimals = (String(step).split('.')[1] || '').length;
    field.value = decimals ? next.toFixed(decimals) : String(next);
    emit(field, 'input', { value: field.value });
    emit(wrap, 'santy:change', { value: field.value });
  }

  /* ─── initialisation ─────────────────────────────────────────────────── */

  var wired = false;

  /**
   * Prepare ARIA and per-element instances inside `root`. Safe to call again
   * after injecting markup — every step is guarded against double-application.
   */
  function init(root) {
    if (!hasDOM) return;
    root = root || document;

    if (!wired) {
      on(document, 'click', onDocumentClick);
      on(document, 'keydown', onDocumentKeydown);
      // Keep floating elements glued to their anchors.
      var reflow = function () {
        openDropdowns.forEach(function (d) {
          var toggle = $('[data-santy-toggle="dropdown"], .dropdown-toggle', d);
          var menu = $('.dropdown-menu, .menu', d);
          if (toggle && menu && menu.style.position === 'fixed') {
            position(toggle, menu, { placement: attr(d, 'data-santy-placement') || 'bottom-start', offset: 4 });
          }
        });
        openPopovers.forEach(function (p) {
          if (p.__santyTrigger) {
            position(p.__santyTrigger, p, { placement: attr(p.__santyTrigger, 'data-santy-placement') || 'bottom' });
          }
        });
        if (activeTip) {
          position(activeTip.anchor, activeTip.el,
            { placement: attr(activeTip.anchor, 'data-santy-placement') || 'top' });
        }
      };
      on(window, 'resize', reflow);
      on(window, 'scroll', reflow, true);
      wired = true;
    }

    /* tabs — ARIA roles + roving tabindex */
    $$('.tabs', root).forEach(function (list) {
      if (!attr(list, 'role')) attr(list, 'role', 'tablist');
      var items = tabItems(list);
      var active = items.filter(function (t) { return hasClass(t, 'active'); })[0] || items[0];
      items.forEach(function (t) {
        if (!attr(t, 'role')) attr(t, 'role', 'tab');
        attr(t, 'aria-selected', t === active ? 'true' : 'false');
        attr(t, 'tabindex', t === active ? '0' : '-1');
        var panel = targetOf(t);
        if (panel) {
          if (!attr(panel, 'role')) attr(panel, 'role', 'tabpanel');
          if (!panel.id) panel.id = 'santy-panel-' + Math.random().toString(36).slice(2, 8);
          attr(t, 'aria-controls', panel.id);
          if (!attr(panel, 'aria-labelledby')) {
            if (!t.id) t.id = 'santy-tab-' + Math.random().toString(36).slice(2, 8);
            attr(panel, 'aria-labelledby', t.id);
          }
        }
      });
    });

    /* accordion headers */
    $$('.accordion-header', root).forEach(function (h) {
      var item = h.closest('.accordion-item') || h.parentElement;
      var body = $('.accordion-body', item);
      if (!attr(h, 'aria-expanded')) attr(h, 'aria-expanded', body && hasClass(body, 'open') ? 'true' : 'false');
      if (body) {
        if (!body.id) body.id = 'santy-acc-' + Math.random().toString(36).slice(2, 8);
        attr(h, 'aria-controls', body.id);
        if (!attr(body, 'role')) attr(body, 'role', 'region');
      }
      // Header may be a <div>; make it operable by keyboard.
      if (h.tagName !== 'BUTTON') {
        if (!attr(h, 'role')) attr(h, 'role', 'button');
        if (h.tabIndex < 0) attr(h, 'tabindex', '0');
        if (!h.__santyKeys) {
          h.__santyKeys = true;
          on(h, 'keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); accordionToggle(h); }
          });
        }
      }
      if (!attr(h, 'data-santy-toggle')) attr(h, 'data-santy-toggle', 'accordion');
    });

    /* dropdown toggles */
    $$('.dropdown-toggle', root).forEach(function (t) {
      if (!attr(t, 'data-santy-toggle')) attr(t, 'data-santy-toggle', 'dropdown');
      if (!attr(t, 'aria-haspopup')) attr(t, 'aria-haspopup', 'menu');
      if (!attr(t, 'aria-expanded')) attr(t, 'aria-expanded', 'false');
    });

    /* overlays start hidden and labelled */
    $$('.modal-overlay, .drawer-overlay, .bottom-sheet, .command-palette-wrap', root).forEach(function (el) {
      if (!hasClass(el, 'open')) attr(el, 'aria-hidden', 'true');
      var title = $('.modal-title, .drawer-header, .bottom-sheet-title', el);
      if (title && !attr(el, 'aria-labelledby')) {
        if (!title.id) title.id = 'santy-title-' + Math.random().toString(36).slice(2, 8);
        attr(el, 'aria-labelledby', title.id);
      }
    });

    /* tooltips */
    $$('[data-santy-tooltip]', root).forEach(function (el) {
      if (el.__santyTip) return;
      el.__santyTip = true;
      on(el, 'mouseenter', function () { showTooltip(el); });
      on(el, 'mouseleave', hideTooltip);
      on(el, 'focus', function () { showTooltip(el); });
      on(el, 'blur', hideTooltip);
    });

    /* carousels */
    $$('[data-santy-carousel], .carousel[data-santy-interval], .swipe-carousel[data-santy-interval]', root)
      .forEach(function (el) { carouselFor(el); });

    /* ripple */
    $$('[data-santy-ripple]', root).forEach(function (el) {
      if (el.__santyRipple) return;
      el.__santyRipple = true;
      on(el, 'click', ripple);
    });

    /* scrollspy */
    $$('[data-santy-scrollspy]', root).forEach(function (el) {
      if (el.__santySpy) return;
      el.__santySpy = true;
      scrollspy(el);
    });

    /* data tables — sortable headers need to be keyboard operable */
    $$('.data-table', root).forEach(function (tbl) {
      $$('thead th[data-sort-type], thead th[data-santy-sortable]', tbl).forEach(function (th) {
        if (!attr(th, 'aria-sort')) attr(th, 'aria-sort', 'none');
        if (th.tabIndex < 0) attr(th, 'tabindex', '0');
        if (!attr(th, 'role')) attr(th, 'role', 'columnheader');
        if (th.__santySort) return;
        th.__santySort = true;
        on(th, 'keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); sortTable(th); }
        });
      });
      // Detail rows start collapsed unless the author expanded them.
      $$('.data-table-row-toggle', tbl).forEach(function (tg) {
        if (!attr(tg, 'aria-expanded')) attr(tg, 'aria-expanded', 'false');
        var tr = tg.closest('tr');
        var detail = tr && tr.nextElementSibling;
        if (detail && hasClass(detail, 'data-table-detail')) {
          detail.hidden = attr(tg, 'aria-expanded') !== 'true';
        }
      });
      if (tbl.__santySelect) return;
      tbl.__santySelect = true;
      on(tbl, 'change', function (e) {
        var box = e.target.closest && e.target.closest('.data-table-select input[type="checkbox"]');
        if (!box) return;
        if (box.closest('thead')) tableSelectAll(box); else tableRowSelect(box);
      });
    });

    /* comboboxes */
    $$('.combobox', root).forEach(function (combo) {
      var input = $('.combobox-input', combo);
      var list = $('.combobox-list', combo);
      if (list && !list.id) list.id = 'santy-combo-' + Math.random().toString(36).slice(2, 8);
      if (list && !attr(list, 'role')) attr(list, 'role', 'listbox');
      $$('.combobox-option', combo).forEach(function (o) {
        if (!attr(o, 'role')) attr(o, 'role', 'option');
        if (!attr(o, 'aria-selected')) attr(o, 'aria-selected', 'false');
      });
      if (input) {
        attr(input, 'role', 'combobox');
        attr(input, 'aria-autocomplete', 'list');
        if (!attr(input, 'aria-expanded')) attr(input, 'aria-expanded', 'false');
        if (list) attr(input, 'aria-controls', list.id);
        if (!input.__santyCombo) {
          input.__santyCombo = true;
          on(input, 'input', function () {
            comboOpen(combo);
            comboFilter(combo, input.value);
          });
        }
      }
    });

    /* pin / OTP inputs */
    $$('.pin-input', root).forEach(function (wrap) {
      if (wrap.__santyPin) return;
      wrap.__santyPin = true;
      $$('.pin-digit', wrap).forEach(function (d) {
        if (!attr(d, 'inputmode')) attr(d, 'inputmode', 'numeric');
        if (!attr(d, 'autocomplete')) attr(d, 'autocomplete', 'one-time-code');
        if (!attr(d, 'maxlength')) attr(d, 'maxlength', '1');
      });
      on(wrap, 'input', pinInput);
    });

    /* file uploaders — drag-over affordance */
    $$('.uploader', root).forEach(function (up) {
      if (up.__santyUpload) return;
      up.__santyUpload = true;
      ['dragenter', 'dragover'].forEach(function (evt) {
        on(up, evt, function (e) { e.preventDefault(); addClass(up, 'dragover'); });
      });
      ['dragleave', 'drop'].forEach(function (evt) {
        on(up, evt, function (e) {
          e.preventDefault();
          // dragleave fires for child elements too; ignore those.
          if (evt === 'dragleave' && up.contains(e.relatedTarget)) return;
          removeClass(up, 'dragover');
        });
      });
      on(up, 'drop', function (e) {
        var files = e.dataTransfer && e.dataTransfer.files;
        if (files && files.length) emit(up, 'santy:files', { files: files });
      });
    });

    /* speed dial */
    $$('.speed-dial', root).forEach(function (dial) {
      if (dial.__santyDial) return;
      dial.__santyDial = true;
      var toggle = $('.fab, .speed-dial-toggle', dial);
      if (!toggle) return;
      if (!attr(toggle, 'aria-expanded')) attr(toggle, 'aria-expanded', 'false');
      on(toggle, 'click', function (e) {
        e.preventDefault();
        var open = dial.classList.toggle('open');
        attr(toggle, 'aria-expanded', open ? 'true' : 'false');
      });
      // Pointer users expect hover; keyboard users get the click toggle above.
      on(dial, 'mouseleave', function () {
        removeClass(dial, 'open');
        attr(toggle, 'aria-expanded', 'false');
      });
    });

    /* infinite scroll sentinels */
    $$('.infinite-sentinel', root).forEach(function (sentinel) {
      if (sentinel.__santyInfinite || typeof IntersectionObserver === 'undefined') return;
      sentinel.__santyInfinite = true;
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) emit(sentinel, 'santy:loadmore', { sentinel: sentinel });
        });
      }, { rootMargin: attr(sentinel, 'data-santy-margin') || '200px' });
      obs.observe(sentinel);
    });
  }

  /* ─── auto-start ─────────────────────────────────────────────────────── */

  if (hasDOM) {
    theme.init();
    if (document.readyState === 'loading') {
      on(document, 'DOMContentLoaded', function () { init(); });
    } else {
      init();
    }
  }

  /* ─── public API ─────────────────────────────────────────────────────── */

  return {
    version: VERSION,
    init: init,
    modal: modal,
    drawer: drawer,
    offcanvas: drawer,
    sheet: sheet,
    bottomSheet: sheet,
    dropdown: dropdown,
    collapse: collapse,
    tabs: tabs,
    tooltip: tooltip,
    popover: popover,
    carousel: carousel,
    table: table,
    combobox: combobox,
    toast: toast,
    theme: theme,
    scrollspy: scrollspy,
    // Escape hatches for building custom components on the same primitives.
    utils: {
      $: $, $$: $$, on: on, off: off, emit: emit,
      position: position,
      focusTrap: focusTrap,
      lockScroll: lockScroll,
      unlockScroll: unlockScroll,
      tabbables: tabbables,
      afterTransition: afterTransition,
      prefersReducedMotion: prefersReducedMotion
    }
  };
}));
