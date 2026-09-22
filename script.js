/* ZaynXwear homepage interactions. Shared catalog and cart live in products.js and cart.js. */
document.addEventListener('DOMContentLoaded', () => {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const navbar = document.getElementById('navbar');
  const backToTop = document.getElementById('backToTop');
  let scrollTick = false;
  const onScroll = () => {
    if (!scrollTick) {
      scrollTick = true;
      requestAnimationFrame(() => {
        navbar?.classList.toggle('scrolled', window.scrollY > 40);
        backToTop?.classList.toggle('visible', window.scrollY > 600);
        scrollTick = false;
      });
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  backToTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu');
  const menuIcon = document.getElementById('menuIcon');
  let syncMenuAccessibility = () => { };

  if (menuToggle && navMenu && menuIcon) {
    const mobileMenuQuery = window.matchMedia('(max-width: 860px)');
    const menuLinks = navMenu.querySelectorAll('a');
    syncMenuAccessibility = (isOpen = navMenu.classList.contains('open')) => {
      const isClosedMobileMenu = mobileMenuQuery.matches && !isOpen;
      navMenu.setAttribute('aria-hidden', String(isClosedMobileMenu));
      navMenu.inert = isClosedMobileMenu;
      menuLinks.forEach(link => isClosedMobileMenu ? link.setAttribute('tabindex', '-1') : link.removeAttribute('tabindex'));
    };
    const closeMenu = () => {
      navMenu.classList.remove('open');
      menuIcon.innerHTML = '<use href="#icon-menu"></use>';
      menuToggle.setAttribute('aria-expanded', 'false');
      syncMenuAccessibility(false);
      document.body.style.overflow = '';
    };

    syncMenuAccessibility(false);
    mobileMenuQuery.addEventListener('change', closeMenu);
    menuToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      menuIcon.innerHTML = isOpen ? '<use href="#icon-close"></use>' : '<use href="#icon-menu"></use>';
      menuToggle.setAttribute('aria-expanded', String(isOpen));
      syncMenuAccessibility(isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    menuLinks.forEach(link => link.addEventListener('click', closeMenu));
  }

  // Search panel controls
  const searchBtn = document.getElementById('searchBtn');
  const searchPanel = document.getElementById('searchPanel');
  const closeSearch = document.getElementById('closeSearch');
  const searchInput = document.getElementById('searchInput');

  const toggleSearch = open => {
    if (!searchPanel || !searchBtn) return;
    searchPanel.classList.toggle('open', open);
    searchBtn.setAttribute('aria-expanded', String(open));
    if (open) window.setTimeout(() => searchInput?.focus(), 300);
  };

  if (searchBtn && searchPanel && closeSearch && searchInput) {
    searchBtn.addEventListener('click', () => toggleSearch(!searchPanel.classList.contains('open')));
    closeSearch.addEventListener('click', () => toggleSearch(false));
    searchInput.addEventListener('keydown', event => {
      if (event.key === 'Enter') document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (event.key === 'Escape') {
        if (searchInput.value) {
          searchInput.value = '';
          searchInput.dispatchEvent(new Event('input'));
        } else {
          toggleSearch(false);
        }
      }
    });
  }

  // Catalog filtering & sorting engine
  const productGrid = document.getElementById('shop');
  const categoryFilter = document.getElementById('categoryFilter');
  const sizeFilter = document.getElementById('sizeFilter');
  const colorFilter = document.getElementById('colorFilter');
  const priceFilter = document.getElementById('priceFilter');
  const sortFilter = document.getElementById('sortFilter');
  const clearFilters = document.getElementById('clearFilters');
  const resultCount = document.getElementById('productResultCount');
  const noProducts = document.getElementById('noProducts');

  let productCards = [];
  let displayItemsById = new Map();
  let defaultProductOrder = new Map();
  let priceRanges = [];
  let appliedSort = '';

  // Size order comparator
  const standardSizeWeights = { 'xs': 1, 's': 2, 'm': 3, 'l': 4, 'xl': 5, 'xxl': 6, '2xl': 6, '3xl': 7, 'free': 8 };
  const sortSizes = (a, b) => {
    const aLower = a.toLowerCase();
    const bLower = b.toLowerCase();
    if (standardSizeWeights[aLower] && standardSizeWeights[bLower]) {
      return standardSizeWeights[aLower] - standardSizeWeights[bLower];
    }
    const aNum = Number.parseInt(a, 10);
    const bNum = Number.parseInt(b, 10);
    if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) {
      return aNum - bNum;
    }
    return a.localeCompare(b);
  };

  const sortProductCards = sort => {
    if (!productGrid || sort === appliedSort) return;
    const orderedCards = [...productCards].sort((firstCard, secondCard) => {
      const firstId = firstCard.dataset.productId || firstCard.dataset.familyId;
      const secondId = secondCard.dataset.productId || secondCard.dataset.familyId;
      const first = displayItemsById.get(firstId);
      const second = displayItemsById.get(secondId);
      if (!first || !second || !sort) {
        return (defaultProductOrder.get(firstId) ?? 0) - (defaultProductOrder.get(secondId) ?? 0);
      }
      if (sort === 'price-asc') return (first.salePrice ?? first.price) - (second.salePrice ?? second.price);
      if (sort === 'price-desc') return (second.salePrice ?? second.price) - (first.salePrice ?? first.price);
      if (sort === 'name-asc') return first.name.localeCompare(second.name);
      if (sort === 'name-desc') return second.name.localeCompare(first.name);
      return 0;
    });
    productGrid.append(...orderedCards);
    appliedSort = sort;
  };

  let debounceTimeout;

  const syncFiltersToUrl = () => {
    const params = new URLSearchParams(window.location.search);
    if (searchInput?.value.trim()) params.set('q', searchInput.value.trim());
    else params.delete('q');
    
    if (categoryFilter?.value) params.set('category', categoryFilter.value);
    else params.delete('category');

    if (sizeFilter?.value) params.set('size', sizeFilter.value);
    else params.delete('size');

    if (colorFilter?.value) params.set('color', colorFilter.value);
    else params.delete('color');
    
    if (priceFilter?.value) params.set('price', priceFilter.value);
    else params.delete('price');
    
    if (sortFilter?.value) params.set('sort', sortFilter.value);
    else params.delete('sort');

    const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.replaceState({}, '', newUrl);
  };

  const loadFiltersFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    let filtersChanged = false;
    
    if (searchInput && params.has('q')) {
      searchInput.value = params.get('q');
      filtersChanged = true;
    }
    if (categoryFilter && params.has('category')) {
      categoryFilter.value = params.get('category');
      filtersChanged = true;
    }
    if (sizeFilter && params.has('size')) {
      sizeFilter.value = params.get('size');
      filtersChanged = true;
    }
    if (colorFilter && params.has('color')) {
      colorFilter.value = params.get('color');
      filtersChanged = true;
    }
    if (priceFilter && params.has('price')) {
      priceFilter.value = params.get('price');
      filtersChanged = true;
    }
    if (sortFilter && params.has('sort')) {
      sortFilter.value = params.get('sort');
      filtersChanged = true;
    }
    return filtersChanged;
  };

  const fetchFilteredProducts = async () => {
    const term = searchInput?.value.trim().toLowerCase() || '';
    const category = categoryFilter?.value || '';
    if (window.ZaynXwearProducts?.loadProducts) {
      await window.ZaynXwearProducts.loadProducts({ forceRefresh: true, search: term, categorySlug: category });
    }
  };

  const filterProductsClientSide = () => {
    const selectedRange = priceRanges.find(range => range.value === priceFilter?.value);
    const selectedSizeVal = sizeFilter?.value?.trim().toLowerCase() || '';
    const selectedColorVal = colorFilter?.value?.trim().toLowerCase() || '';

    let visibleCount = 0;
    productCards.forEach(card => {
      const itemId = card.dataset.productId || card.dataset.familyId;
      const item = displayItemsById.get(itemId);
      if (!item) {
        card.classList.add('is-filtered-out');
        return;
      }

      // 1. Price match
      const effectivePrice = item.salePrice ?? item.price ?? 0;
      const matchesPrice = !selectedRange || selectedRange.matches(effectivePrice);

      // Extract variants for this item
      const itemVariants = Array.isArray(item.variants) && item.variants.length > 0
        ? item.variants
        : (item.type === 'family' && Array.isArray(item.products) ? item.products.flatMap(p => p.variants || []) : []);

      // 2. Size match
      let matchesSize = true;
      if (selectedSizeVal) {
        if (itemVariants.length > 0) {
          matchesSize = itemVariants.some(v => v && v.size && v.size.toLowerCase() === selectedSizeVal && (v.availableStock > 0 || (v.stockQuantity > 0 && (v.stockQuantity - (v.reservedQuantity || 0)) > 0)));
        } else if (Array.isArray(item.sizes)) {
          matchesSize = item.sizes.some(s => s && s.toLowerCase() === selectedSizeVal);
        } else {
          matchesSize = false;
        }
      }

      // 3. Color match
      let matchesColor = true;
      if (selectedColorVal) {
        if (itemVariants.length > 0) {
          matchesColor = itemVariants.some(v => v && v.color && v.color.toLowerCase() === selectedColorVal);
        } else if (Array.isArray(item.colors)) {
          matchesColor = item.colors.some(c => c && c.toLowerCase() === selectedColorVal);
        } else {
          matchesColor = false;
        }
      }

      const isVisible = matchesPrice && matchesSize && matchesColor;
      card.classList.toggle('is-filtered-out', !isVisible);
      if (isVisible) visibleCount++;
    });

    sortProductCards(sortFilter?.value || '');
    if (noProducts) noProducts.hidden = visibleCount !== 0;
    if (resultCount) resultCount.textContent = `${visibleCount} item${visibleCount === 1 ? '' : 's'}`;
  };

  let scrollObserver;

  const initCatalogControls = (isNextPage = false, hasMoreProducts = false) => {
    const catalogApi = window.ZaynXwearProducts;
    const displayItems = (catalogApi && typeof catalogApi.getCatalogDisplayItems === 'function')
      ? catalogApi.getCatalogDisplayItems()
      : (catalogApi?.products || []);

    if (!displayItems || !displayItems.length && !isNextPage) return;

    productCards = Array.from(document.querySelectorAll('#shop .product-card'));
    displayItemsById = new Map(displayItems.map(item => [item.id, item]));
    defaultProductOrder = new Map(productCards.map((card, index) => [card.dataset.productId || card.dataset.familyId, index]));

    const formatPrice = catalogApi?.formatPrice || (price => `₹${price}`);
    const urlParams = new URLSearchParams(window.location.search);

    // 1. Populate category dropdown dynamically
    if (categoryFilter && !isNextPage) {
      const targetCat = urlParams.get('category') || categoryFilter.value;
      categoryFilter.innerHTML = '<option value="">All categories</option>';
      const uniqueCategories = [...new Map(displayItems.map(p => [p.categorySlug, p.category])).entries()];
      uniqueCategories.forEach(([slug, name]) => {
        if (slug) {
            const opt = new Option(name, slug);
            categoryFilter.add(opt);
        }
      });
      if (targetCat) categoryFilter.value = targetCat;
    }

    // 2. Populate dynamic size dropdown
    const availableSizes = new Set();
    displayItems.forEach(item => {
      const variants = Array.isArray(item.variants) && item.variants.length > 0
        ? item.variants
        : (item.type === 'family' && Array.isArray(item.products) ? item.products.flatMap(p => p.variants || []) : []);

      variants.forEach(v => {
        if (v && v.size && (v.availableStock > 0 || (v.stockQuantity > 0 && (v.stockQuantity - (v.reservedQuantity || 0)) > 0))) {
          availableSizes.add(v.size);
        }
      });
      if (Array.isArray(item.sizes) && (!item.variants || !item.variants.length) && (item.availableStock > 0 || item.stockQuantity > 0)) {
        item.sizes.forEach(sz => sz && availableSizes.add(sz));
      }
    });

    const sortedSizeList = [...availableSizes].sort(sortSizes);
    if (sizeFilter && !isNextPage) {
      const targetSize = urlParams.get('size') || sizeFilter.value;
      sizeFilter.innerHTML = '<option value="">All sizes</option>';
      sortedSizeList.forEach(sz => sizeFilter.add(new Option(sz, sz)));
      if (targetSize && sortedSizeList.some(s => s.toLowerCase() === targetSize.toLowerCase())) {
        sizeFilter.value = sortedSizeList.find(s => s.toLowerCase() === targetSize.toLowerCase());
      }
    }

    // 3. Populate dynamic color dropdown
    const availableColors = new Set();
    displayItems.forEach(item => {
      const variants = Array.isArray(item.variants) && item.variants.length > 0
        ? item.variants
        : (item.type === 'family' && Array.isArray(item.products) ? item.products.flatMap(p => p.variants || []) : []);

      variants.forEach(v => {
        if (v && v.color) availableColors.add(v.color);
      });
      if (Array.isArray(item.colors) && (!item.variants || !item.variants.length)) {
        item.colors.forEach(col => col && availableColors.add(col));
      }
    });

    const sortedColorList = [...availableColors].sort((a, b) => a.localeCompare(b));
    if (colorFilter && !isNextPage) {
      const targetColor = urlParams.get('color') || colorFilter.value;
      colorFilter.innerHTML = '<option value="">All colors</option>';
      sortedColorList.forEach(c => colorFilter.add(new Option(c, c)));
      if (targetColor && sortedColorList.some(c => c.toLowerCase() === targetColor.toLowerCase())) {
        colorFilter.value = sortedColorList.find(c => c.toLowerCase() === targetColor.toLowerCase());
      }
    }

    // 4. Populate dynamic price ranges
    const sortedPrices = [...new Set(displayItems.map(p => (p.salePrice ?? p.price)))].sort((a, b) => a - b);
    const lowPriceMax = sortedPrices[Math.max(0, Math.ceil(sortedPrices.length / 3) - 1)] || 699;
    const midPriceMax = sortedPrices[Math.max(0, Math.ceil(sortedPrices.length * 2 / 3) - 1)] || 899;

    priceRanges = [
      { value: 'low', label: `Up to ${formatPrice(lowPriceMax)}`, matches: price => price <= lowPriceMax },
      ...(midPriceMax > lowPriceMax ? [{ value: 'mid', label: `${formatPrice(lowPriceMax + 1)} – ${formatPrice(midPriceMax)}`, matches: price => price > lowPriceMax && price <= midPriceMax }] : []),
      { value: 'high', label: `${formatPrice(midPriceMax + 1)} and above`, matches: price => price > midPriceMax }
    ];

    if (priceFilter && !isNextPage) {
      const targetPrice = urlParams.get('price') || priceFilter.value;
      priceFilter.innerHTML = '<option value="">All prices</option>';
      priceRanges.forEach(range => priceFilter.add(new Option(range.label, range.value)));
      if (targetPrice && priceRanges.some(r => r.value === targetPrice)) {
        priceFilter.value = targetPrice;
      }
    }

    // 5. Sort filter restore
    if (sortFilter && !isNextPage) {
      const targetSort = urlParams.get('sort') || sortFilter.value;
      if (targetSort) sortFilter.value = targetSort;
    }

    // Connect reveal observer to dynamically rendered product cards
    if ('IntersectionObserver' in window) {
      const cardObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            cardObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
      productCards.forEach(card => cardObserver.observe(card));
    } else {
      productCards.forEach(card => card.classList.add('is-visible'));
    }

    // Infinite scroll observer
    if (scrollObserver) scrollObserver.disconnect();
    if (hasMoreProducts && 'IntersectionObserver' in window && productCards.length > 0) {
      scrollObserver = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
           scrollObserver.disconnect();
           if (window.ZaynXwearProducts?.loadNextPage) {
               window.ZaynXwearProducts.loadNextPage();
           }
        }
      }, { rootMargin: '200px' });
      scrollObserver.observe(productCards[productCards.length - 1]);
    }

    filterProductsClientSide();
  };

  // Wire filter event listeners once
  searchInput?.addEventListener('input', () => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      syncFiltersToUrl();
      fetchFilteredProducts();
    }, 300);
  });

  categoryFilter?.addEventListener('change', () => {
    syncFiltersToUrl();
    fetchFilteredProducts();
  });

  sizeFilter?.addEventListener('change', () => {
    syncFiltersToUrl();
    filterProductsClientSide();
  });

  colorFilter?.addEventListener('change', () => {
    syncFiltersToUrl();
    filterProductsClientSide();
  });

  priceFilter?.addEventListener('change', () => {
    syncFiltersToUrl();
    filterProductsClientSide();
  });

  sortFilter?.addEventListener('change', () => {
    syncFiltersToUrl();
    filterProductsClientSide();
  });

  clearFilters?.addEventListener('click', () => {
    if (searchInput) searchInput.value = '';
    if (categoryFilter) categoryFilter.value = '';
    if (sizeFilter) sizeFilter.value = '';
    if (colorFilter) colorFilter.value = '';
    if (priceFilter) priceFilter.value = '';
    if (sortFilter) sortFilter.value = '';
    syncFiltersToUrl();
    fetchFilteredProducts();
  });

  document.querySelectorAll('[data-category-filter]').forEach(link => link.addEventListener('click', () => {
    if (categoryFilter) {
      categoryFilter.value = link.dataset.categoryFilter;
      syncFiltersToUrl();
      fetchFilteredProducts();
    }
  }));

  document.querySelectorAll('a[href="#shop"]:not([data-category-filter])').forEach(link => link.addEventListener('click', () => {
    if (searchInput) searchInput.value = '';
    if (categoryFilter) categoryFilter.value = '';
    if (sizeFilter) sizeFilter.value = '';
    if (colorFilter) colorFilter.value = '';
    if (priceFilter) priceFilter.value = '';
    if (sortFilter) sortFilter.value = '';
    syncFiltersToUrl();
    fetchFilteredProducts();
  }));

  // Listen for dynamic products loaded event
  document.addEventListener('zaynxwear:products-loaded', (e) => {
    const isNextPage = e.detail?.isNextPage || false;
    const hasMoreProducts = e.detail?.hasMoreProducts !== false; // default true if undefined
    initCatalogControls(isNextPage, hasMoreProducts);
  });

  // Also check if products ready promise is already resolved
  if (window.ZaynXwearProducts?.productsReady) {
    if (loadFiltersFromUrl()) {
        fetchFilteredProducts();
    } else {
        window.ZaynXwearProducts.productsReady.then(() => {
          initCatalogControls(false, true); // true since first load likely has more
        }).catch(() => {});
    }
  }

  // Scroll reveal for static sections
  const revealEls = document.querySelectorAll('[data-reveal]:not(.product-card)');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(element => revealObserver.observe(element));
  } else revealEls.forEach(element => element.classList.add('is-visible'));

  // Animated counters
  const counters = document.querySelectorAll('[data-count]');
  const setCounterValue = element => {
    const target = Number.parseInt(element.dataset.count, 10);
    element.textContent = element.hasAttribute('data-decimal') ? (target / 10).toFixed(1) : target.toLocaleString('en-IN');
  };
  const animateCounter = element => {
    const target = Number.parseInt(element.dataset.count, 10);
    const decimal = element.hasAttribute('data-decimal');
    const start = performance.now();
    const step = now => {
      const progress = Math.min((now - start) / 1400, 1);
      const value = target * (1 - Math.pow(1 - progress, 3));
      element.textContent = decimal ? (value / 10).toFixed(1) : Math.round(value).toLocaleString('en-IN');
      if (progress < 1) requestAnimationFrame(step); else setCounterValue(element);
    };
    requestAnimationFrame(step);
  };
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduceMotion && 'IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { animateCounter(entry.target); counterObserver.unobserve(entry.target); }
    }), { threshold: 0.5 });
    counters.forEach(counter => counterObserver.observe(counter));
  } else counters.forEach(setCounterValue);

  // Reviews carousel
  const track = document.getElementById('reviewTrack');
  const dotsWrap = document.getElementById('reviewDots');
  const cards = track ? Array.from(track.children) : [];
  const prevBtn = document.getElementById('revPrev');
  const nextBtn = document.getElementById('revNext');
  let currentSlide = 0;
  let autoplayId;
  if (track && dotsWrap && prevBtn && nextBtn && cards.length) {
    const updateSlide = () => {
      track.style.transform = `translateX(-${currentSlide * 100}%)`;
      dotsWrap.querySelectorAll('span').forEach((dot, index) => dot.classList.toggle('active', index === currentSlide));
    };
    const goToSlide = index => { currentSlide = (index + cards.length) % cards.length; updateSlide(); resetAutoplay(); };
    const resetAutoplay = () => { clearInterval(autoplayId); autoplayId = setInterval(() => goToSlide(currentSlide + 1), 6000); };
    cards.forEach((_, index) => {
      const dot = document.createElement('span');
      if (index === 0) dot.classList.add('active');
      dot.addEventListener('click', () => goToSlide(index));
      dotsWrap.appendChild(dot);
    });
    prevBtn.addEventListener('click', () => goToSlide(currentSlide - 1));
    nextBtn.addEventListener('click', () => goToSlide(currentSlide + 1));
    resetAutoplay();
  }

  // Newsletter form
  const newsletterForm = document.getElementById('newsletterForm');
  const newsletterEmail = document.getElementById('newsletterEmail');
  const formMsg = document.getElementById('formMsg');
  if (newsletterForm && newsletterEmail && formMsg) {
    newsletterForm.addEventListener('submit', event => {
      event.preventDefault();
      const email = newsletterEmail.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        formMsg.textContent = 'Please enter a valid email address.';
        formMsg.className = 'form-msg error';
        return;
      }
      try {
        const newsKey = 'ecommerce-demo-newsletter';
        const legacyNewsKey = 'zaynxwear-newsletter';
        let raw = localStorage.getItem(newsKey) || localStorage.getItem(legacyNewsKey);
        const signups = JSON.parse(raw || '[]');
        if (!signups.includes(email)) {
          signups.push(email);
          localStorage.setItem(newsKey, JSON.stringify(signups));
          localStorage.removeItem(legacyNewsKey);
        }
      } catch { /* Storage may be unavailable. */ }
      formMsg.textContent = "You're in! Your sign-up has been saved on this device.";
      formMsg.className = 'form-msg success';
      newsletterForm.reset();
    });
  }

  // Escape key behavior
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    if (searchPanel?.classList.contains('open')) {
      if (searchInput && searchInput.value) {
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('input'));
      } else {
        toggleSearch(false);
      }
    }
    if (navMenu?.classList.contains('open')) {
      navMenu.classList.remove('open');
      menuIcon.innerHTML = '<use href="#icon-menu"></use>';
      menuToggle?.setAttribute('aria-expanded', 'false');
      syncMenuAccessibility(false);
      document.body.style.overflow = '';
    }
  });

  // Smooth hash link scrolling
  document.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener('click', event => {
    const id = link.getAttribute('href');
    const target = id?.length > 1 ? document.querySelector(id) : null;
    if (target && navbar) {
      event.preventDefault();
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - navbar.offsetHeight + 1, behavior: 'smooth' });
    }
  }));
});
