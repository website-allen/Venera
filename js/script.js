/* ============================================
   VENERA — Site Scripts
   ============================================ */

/* --------------------------------------------
   1. THEME TOGGLE
   -------------------------------------------- */
(function(){
  var root = document.documentElement;
  var toggle = document.getElementById('themeToggle');
  if (!toggle) return;

  try {
    var saved = localStorage.getItem('venera-theme');
    if (saved) root.setAttribute('data-theme', saved);
  } catch (e) { /* localStorage blocked */ }

  toggle.addEventListener('click', function(){
    var next = root.getAttribute('data-theme') === 'noir' ? 'paper' : 'noir';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('venera-theme', next); } catch (e) {}
  });
})();

/* --------------------------------------------
   2. HEADER SCROLL STATE
   -------------------------------------------- */
(function(){
  var header = document.getElementById('header');
  if (!header) return;

  window.addEventListener('scroll', function(){
    header.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
})();

/* --------------------------------------------
   3. REVEAL ON SCROLL (index.html)
   -------------------------------------------- */
(function(){
  var targets = document.querySelectorAll('.reveal');
  if (!targets.length) return;

  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  targets.forEach(function(el){ io.observe(el); });
})();

/* --------------------------------------------
   4. NAV DROPDOWNS — click toggles
   -------------------------------------------- */
(function(){
  var items = document.querySelectorAll('.nav-item');
  if (!items.length) return;

  items.forEach(function(item){
    var link = item.querySelector('.nav-link');
    var drop = item.querySelector('.nav-drop');
    if (!drop || !link) return;

    link.addEventListener('click', function(e){
      e.preventDefault();
      var isOpen = drop.classList.contains('open');
      document.querySelectorAll('.nav-drop.open').forEach(function(d){ d.classList.remove('open'); });
      if (!isOpen) drop.classList.add('open');
    });

    item.addEventListener('mouseleave', function(){
      drop.classList.remove('open');
    });
  });

  document.addEventListener('click', function(e){
    if (!e.target.closest('.nav-item')) {
      document.querySelectorAll('.nav-drop.open').forEach(function(d){ d.classList.remove('open'); });
    }
  });

  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape') {
      document.querySelectorAll('.nav-drop.open').forEach(function(d){ d.classList.remove('open'); });
    }
  });
})();

/* --------------------------------------------
   5. ACTIVE JUMP PILL (category pages)
   -------------------------------------------- */
(function(){
  var pills = document.querySelectorAll('.jump-pill');
  var sections = document.querySelectorAll('.coll');
  if (!pills.length || !sections.length) return;

  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if (entry.isIntersecting) {
        var id = entry.target.id;
        pills.forEach(function(p){
          p.classList.toggle('active', p.getAttribute('href') === '#' + id);
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

  sections.forEach(function(s){ io.observe(s); });
})();

/* --------------------------------------------
   6. TOAST
   -------------------------------------------- */
(function(){
  var toastContainer = document.getElementById('toastContainer');
  if (!toastContainer) return;

  window.showToast = function(itemName) {
    var toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML =
      '<span class="check">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">' +
          '<polyline points="20 6 9 17 4 12"/>' +
        '</svg>' +
      '</span>' +
      '<span class="msg">Added <b>' + itemName + '</b> to cart successfully</span>';
    toastContainer.appendChild(toast);

    setTimeout(function(){
      toast.classList.add('removing');
      setTimeout(function(){ toast.remove(); }, 350);
    }, 3200);
  };
})();

/* --------------------------------------------
   7. CARD POPULATION — tags + add buttons
   -------------------------------------------- */
(function(){
  var cards = document.querySelectorAll('.h-card');
  if (!cards.length) return;

  cards.forEach(function(card){
    var tags = (card.dataset.tags || '').split(',').map(function(t){ return t.trim(); }).filter(Boolean);
    var tagsEl = card.querySelector('.card-tags');
    if (tagsEl) {
      tagsEl.innerHTML = tags.map(function(t){
        return '<span class="card-tag">' + t + '</span>';
      }).join('');
    }

    var info = card.querySelector('.card-info');
    if (info && !info.querySelector('.card-add')) {
      var btn = document.createElement('button');
      btn.className = 'card-add';
      btn.setAttribute('type', 'button');
      btn.setAttribute('aria-label', 'Add ' + (card.dataset.name || 'item') + ' to cart');
      btn.setAttribute('data-name', card.dataset.name || 'Item');
      btn.innerHTML =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
          '<line x1="12" y1="5" x2="12" y2="19"/>' +
          '<line x1="5" y1="12" x2="19" y2="12"/>' +
        '</svg> Add to Cart';
      info.appendChild(btn);
    }
  });

  document.addEventListener('click', function(e){
    var btn = e.target.closest('.card-add');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();

    if (window.showToast) window.showToast(btn.dataset.name || 'Item');

    var cartCount = document.getElementById('cartCount');
    if (cartCount) {
      cartCount.textContent = String(parseInt(cartCount.textContent || '0', 10) + 1);
    }
  });
})();

/* --------------------------------------------
   8. SECTION SEARCH (category pages)
   -------------------------------------------- */
(function(){
  var searchBoxes = document.querySelectorAll('.section-search');
  if (!searchBoxes.length) return;

  searchBoxes.forEach(function(searchBox){
    var section = searchBox.closest('.coll');
    if (!section) return;

    var input = searchBox.querySelector('.search-input');
    var modeSelect = searchBox.querySelector('.search-mode');
    var tagCloud = searchBox.querySelector('.tag-cloud');
    var clearBtn = searchBox.querySelector('.search-clear');
    var noResults = section.querySelector('.no-results');
    var cards = section.querySelectorAll('.h-card');
    if (!input || !modeSelect || !tagCloud || !clearBtn) return;

    var tagSet = new Set();
    cards.forEach(function(card){
      (card.dataset.tags || '').split(',').forEach(function(t){
        var tag = t.trim();
        if (tag) tagSet.add(tag);
      });
    });
    var tags = Array.from(tagSet).sort();
    tagCloud.innerHTML = tags.map(function(t){
      return '<button type="button" class="tag-pill" data-tag="' + t + '">' + t + '</button>';
    }).join('');

    var activeTag = null;

    function applyFilter(){
      var query = (input.value || '').trim().toLowerCase();
      var mode = modeSelect.value;
      var visible = 0;

      cards.forEach(function(card){
        var name = (card.dataset.name || '').toLowerCase();
        var cardTags = (card.dataset.tags || '').toLowerCase().split(',').map(function(t){ return t.trim(); });
        var show = true;

        if (mode === 'name') {
          if (query) show = name.indexOf(query) !== -1;
        } else {
          if (activeTag) {
            show = cardTags.indexOf(activeTag.toLowerCase()) !== -1;
          } else if (query) {
            show = cardTags.some(function(t){ return t.indexOf(query) !== -1; });
          }
        }
        card.style.display = show ? '' : 'none';
        if (show) visible++;
      });

      clearBtn.hidden = !query && !activeTag;
      if (noResults) noResults.hidden = visible > 0;
    }

    modeSelect.addEventListener('change', function(){
      var isTag = modeSelect.value === 'tag';
      tagCloud.hidden = !isTag;
      if (!isTag) {
        activeTag = null;
        tagCloud.querySelectorAll('.tag-pill').forEach(function(p){ p.classList.remove('active'); });
      }
      applyFilter();
    });

    input.addEventListener('input', applyFilter);

    tagCloud.addEventListener('click', function(e){
      var pill = e.target.closest('.tag-pill');
      if (!pill) return;
      var tag = pill.dataset.tag;
      if (activeTag === tag) {
        activeTag = null;
        pill.classList.remove('active');
      } else {
        activeTag = tag;
        tagCloud.querySelectorAll('.tag-pill').forEach(function(p){ p.classList.remove('active'); });
        pill.classList.add('active');
      }
      applyFilter();
    });

    clearBtn.addEventListener('click', function(){
      input.value = '';
      activeTag = null;
      tagCloud.querySelectorAll('.tag-pill').forEach(function(p){ p.classList.remove('active'); });
      applyFilter();
    });
  });
})();

/* --------------------------------------------
   9. FOOTER YEAR — no document.write
   -------------------------------------------- */
(function(){
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();