/* ZaynXwear dedicated category product listing controller */
document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  const config = window.ZaynXwearAdminConfig || {};
  const SUPABASE_URL = config.supabaseUrl || '';
  const SUPABASE_ANON_KEY = config.supabaseAnonKey || '';
  const catalog = window.ZaynXwearProducts;

  // DOM Elements
  const categoryCrumbTitle = document.getElementById('categoryCrumbTitle');
  const categoryTitle = document.getElementById('categoryTitle');
  const categoryDesc = document.getElementById('categoryDesc');
  const categoryProductBadge = document.getElementById('categoryProductBadge');
  const categoryDiscountBanner = document.getElementById('categoryDiscountBanner');
  const familyHeroDpWrap = document.getElementById('familyHeroDpWrap');
  const familyHeroDpImg = document.getElementById('familyHeroDpImg');
  const categoryFilters = document.getElementById('categoryFilters');
  const priceFilter = document.getElementById('priceFilter');
  const sizeFilter = document.getElementById('sizeFilter');
  const colorFilter = document.getElementById('colorFilter');
  const sortFilter = document.getElementById('sortFilter');
  const sizeFilterControl = document.getElementById('sizeFilterControl');
  const colorFilterControl = document.getElementById('colorFilterControl');
  const clearFilters = document.getElementById('clearFilters');
  const activeFilterPills = document.getElementById('activeFilterPills');
  const categoryResultCount = document.getElementById('categoryResultCount');
  const categoryProductGrid = document.getElementById('categoryProductGrid');
  const noCategoryProducts = document.getElementById('noCategoryProducts');
  const resetFiltersBtn = document.getElementById('resetFiltersBtn');
  const categoryNotFound = document.getElementById('categoryNotFound');
  const exploreOtherCategories = document.getElementById('exploreOtherCategories');
  const otherCategoriesGrid = document.getElementById('otherCategoriesGrid');
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Mobile menu & navbar interactions
  const navbar = document.getElementById('navbar');
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu');
  const menuIcon = document.getElementById('menuIcon');

  let scrollTick = false;
  const onScroll = () => {
    if (!scrollTick) {
      scrollTick = true;
      requestAnimationFrame(() => {
        navbar?.classList.toggle('scrolled', window.scrollY > 40);
        scrollTick = false;
      });
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (menuToggle && navMenu && menuIcon) {
    const mobileMenuQuery = window.matchMedia('(max-width: 860px)');
    const menuLinks = navMenu.querySelectorAll('a');
    const syncMenuAccessibility = (isOpen = navMenu.classList.contains('open')) => {
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
      if (event.key === 'Enter') categoryProductGrid?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

  // Helpers
  const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[character]));

  const formatPrice = price => `₹${Number(price || 0).toLocaleString('en-IN')}`;

  const calculateDiscountPercent = (mrp, salePrice) => {
    const m = Number(mrp);
    const s = Number(salePrice);
    if (!Number.isFinite(m) || !Number.isFinite(s) || m <= 0 || s < 0) return 0;
    if (s >= m) return 0;
    return Math.round(((m - s) / m) * 100);
  };


  const renderProductCard = product => {
    const isOutOfStock = product.availableStock <= 0;
    const isLowStock = !isOutOfStock && product.availableStock <= 5;
    const stockBadge = isOutOfStock
      ? '<span class="stock-badge stock-badge-out">Sold Out</span>'
      : isLowStock
        ? `<span class="stock-badge stock-badge-low">Only ${product.availableStock} Left</span>`
        : '';

    const varietyBadge = product.varietyName
      ? `<span class="product-variety-badge">${escapeHtml(product.varietyName)}</span>`
      : '';

    const salePrice = product.salePrice ?? product.price ?? 0;
    const mrp = product.mrp ?? salePrice;
    const discountPct = calculateDiscountPercent(mrp, salePrice);

    const priceRowHtml = discountPct > 0
      ? `<div class="price-row">
          <span class="price">${formatPrice(salePrice)}</span>
          <span class="mrp-price"><span class="mrp-label">MRP</span> <span class="mrp-value">${formatPrice(mrp)}</span></span>
          <span class="discount-badge">${discountPct}% OFF</span>
        </div>`
      : `<div class="price-row"><span class="price">${formatPrice(salePrice)}</span></div>`;

    const productIdentifier = encodeURIComponent(product.slug || product.id);

    return `
      <article class="product-card${isOutOfStock ? ' is-sold-out' : ''}" data-reveal data-category="${escapeHtml(product.categorySlug)}" data-product-id="${escapeHtml(product.id)}" data-product-slug="${escapeHtml(product.slug || product.id)}" data-item-type="product">
        <a class="product-card-link" href="product.html?product=${productIdentifier}" aria-label="View ${escapeHtml(product.name)}"></a>
        <div class="product-media">
          <img class="product-image" src="${escapeHtml(product.images[0])}" alt="${escapeHtml(product.alt)}" loading="lazy" decoding="async">
          ${stockBadge}
        </div>
        <div class="product-info">
          <div class="product-cat-row">
            <span class="product-cat">${escapeHtml(product.category)}</span>
            ${varietyBadge}
          </div>
          <h3>${escapeHtml(product.name)}</h3>
          ${priceRowHtml}
        </div>
      </article>`;
  };

  const renderFamilyCard = item => {
    const familyIdentifier = encodeURIComponent(item.slug || item.id);
    const repImage = item.displayImage || (item.images && item.images[0]) || 'images/ca2e03bc34d1c75b624003e138376397.jpg';
    const countText = item.productCount > 1 ? `${item.productCount} Designs` : 'Collection';
    const descText = item.description ? item.description : 'Explore our collection featuring multiple designs and styles.';

    return `
      <article class="product-card is-family-card" data-reveal data-category="${escapeHtml(item.categorySlug)}" data-family-id="${escapeHtml(item.id)}" data-family-slug="${escapeHtml(item.slug || item.id)}" data-product-id="${escapeHtml(item.id)}" data-item-type="family">
        <a class="product-card-link" href="category.html?family=${familyIdentifier}" aria-label="Explore ${escapeHtml(item.name)} Collection"></a>
        <div class="product-media family-media">
          <img class="product-image family-dp-image" src="${escapeHtml(repImage)}" alt="${escapeHtml(item.alt || item.name)}" loading="lazy" decoding="async">
          <span class="family-collection-badge">
            <span class="family-collection-dot">●</span> ${escapeHtml(countText)}
          </span>
        </div>
        <div class="product-info family-card-info">
          <div class="product-cat-row family-cat-row">
            <span class="product-cat family-cat-name">${escapeHtml(item.category)}</span>
            <span class="family-pill-tag">VARIETY</span>
          </div>
          <h3 class="family-card-title">${escapeHtml(item.name)}</h3>
          <p class="family-card-desc">${escapeHtml(descText)}</p>
          <div class="family-card-action">
            <span class="family-action-text">View Collection</span>
            <span class="family-action-arrow">→</span>
          </div>
        </div>
      </article>`;
  };

  const renderCatalogCard = item => {
    if (!item) return '';
    if (item.type === 'family') {
      return renderFamilyCard(item);
    }
    return renderProductCard(item);
  };

  // State
  let currentViewMode = 'category'; // 'category' | 'family'
  let currentTarget = null;
  let currentCategory = null;
  let currentFamily = null;
  let categoryProducts = [];
  let allActiveCategories = [];
  let allActiveFamilies = [];
  let priceRanges = [];

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

  // Filter and Sort Engine
  const filterAndRenderProducts = () => {
    if (!currentTarget) return;

    const term = searchInput?.value.trim().toLowerCase() || '';
    const selectedPriceVal = priceFilter?.value || '';
    const selectedSizeVal = sizeFilter?.value || '';
    const selectedColorVal = colorFilter?.value || '';
    const selectedSortVal = sortFilter?.value || '';

    const selectedPriceRange = priceRanges.find(r => r.value === selectedPriceVal);

    // Filter
    let filtered = categoryProducts.filter(item => {
      // 1. Search term match
      if (term) {
        let matchesName = item.name.toLowerCase().includes(term)
          || (item.varietyName && item.varietyName.toLowerCase().includes(term))
          || (item.familyName && item.familyName.toLowerCase().includes(term))
          || (item.description && item.description.toLowerCase().includes(term));

        if (!matchesName && item.type === 'family' && Array.isArray(item.products)) {
          matchesName = item.products.some(p =>
            p.name.toLowerCase().includes(term) ||
            (p.varietyName && p.varietyName.toLowerCase().includes(term)) ||
            (p.description && p.description.toLowerCase().includes(term))
          );
        }

        if (!matchesName) return false;
      }

      // 2. Price match
      const effectivePrice = item.salePrice ?? item.price ?? 0;
      if (selectedPriceRange && !selectedPriceRange.matches(effectivePrice)) {
        return false;
      }

      // Extract all variants for this item
      const itemVariants = Array.isArray(item.variants) && item.variants.length > 0
        ? item.variants
        : (item.type === 'family' && Array.isArray(item.products) ? item.products.flatMap(p => p.variants || []) : []);

      // 3. Size match
      if (selectedSizeVal) {
        const hasSize = itemVariants.some(v => v && v.size && v.size.toLowerCase() === selectedSizeVal.toLowerCase() && (v.availableStock > 0 || (v.stockQuantity > 0 && (v.stockQuantity - (v.reservedQuantity || 0)) > 0)));
        if (!hasSize && !(Array.isArray(item.sizes) && item.sizes.some(s => s && s.toLowerCase() === selectedSizeVal.toLowerCase()))) return false;
      }

      // 4. Color match
      if (selectedColorVal) {
        const hasColor = itemVariants.some(v => v && v.color && v.color.toLowerCase() === selectedColorVal.toLowerCase());
        if (!hasColor && !(Array.isArray(item.colors) && item.colors.some(c => c && c.toLowerCase() === selectedColorVal.toLowerCase()))) return false;
      }

      return true;
    });

    // Sort
    if (selectedSortVal === 'price-asc') {
      filtered.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
    } else if (selectedSortVal === 'price-desc') {
      filtered.sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price));
    } else if (selectedSortVal === 'name-asc') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (selectedSortVal === 'name-desc') {
      filtered.sort((a, b) => b.name.localeCompare(a.name));
    }

    // Render Grid
    if (categoryProductGrid) {
      if (filtered.length === 0) {
        categoryProductGrid.innerHTML = '';
        if (noCategoryProducts) noCategoryProducts.hidden = false;
      } else {
        if (noCategoryProducts) noCategoryProducts.hidden = true;
        categoryProductGrid.innerHTML = filtered.map(renderCatalogCard).join('');

        // Card reveal animations
        if ('IntersectionObserver' in window) {
          const cardObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                cardObserver.unobserve(entry.target);
              }
            });
          }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
          categoryProductGrid.querySelectorAll('.product-card').forEach(card => cardObserver.observe(card));
        } else {
          categoryProductGrid.querySelectorAll('.product-card').forEach(card => card.classList.add('is-visible'));
        }
      }
    }

    // Update Result Count Text
    if (categoryResultCount) {
      const count = filtered.length;
      const noun = currentViewMode === 'family' ? (count === 1 ? 'variety' : 'varieties') : (count === 1 ? 'product' : 'products');
      categoryResultCount.textContent = `Showing ${count} ${noun}`;
    }

    // Render Active Filter Pills
    renderActiveFilterPills();
  };

  const renderActiveFilterPills = () => {
    if (!activeFilterPills) return;
    const pills = [];

    if (priceFilter?.value) {
      const range = priceRanges.find(r => r.value === priceFilter.value);
      if (range) {
        pills.push({ label: `Price: ${range.label}`, clear: () => { priceFilter.value = ''; filterAndRenderProducts(); } });
      }
    }
    if (sizeFilter?.value) {
      pills.push({ label: `Size: ${sizeFilter.value}`, clear: () => { sizeFilter.value = ''; filterAndRenderProducts(); } });
    }
    if (colorFilter?.value) {
      pills.push({ label: `Color: ${colorFilter.value}`, clear: () => { colorFilter.value = ''; filterAndRenderProducts(); } });
    }
    if (searchInput?.value) {
      pills.push({ label: `"${searchInput.value}"`, clear: () => { searchInput.value = ''; filterAndRenderProducts(); } });
    }

    if (!pills.length) {
      activeFilterPills.hidden = true;
      activeFilterPills.innerHTML = '';
      return;
    }

    activeFilterPills.hidden = false;
    activeFilterPills.innerHTML = pills.map((p, idx) => `
      <button class="active-filter-pill" data-pill-index="${idx}" type="button">
        <span>${escapeHtml(p.label)}</span>
        <span class="pill-remove" aria-hidden="true">✕</span>
      </button>
    `).join('') + '<button class="clear-all-pills-link" id="clearAllPillsBtn" type="button">Clear All</button>';

    activeFilterPills.querySelectorAll('.active-filter-pill').forEach((btn, idx) => {
      btn.addEventListener('click', () => pills[idx]?.clear());
    });
    document.getElementById('clearAllPillsBtn')?.addEventListener('click', resetAllFilters);
  };

  const resetAllFilters = () => {
    if (priceFilter) priceFilter.value = '';
    if (sizeFilter) sizeFilter.value = '';
    if (colorFilter) colorFilter.value = '';
    if (sortFilter) sortFilter.value = '';
    if (searchInput) searchInput.value = '';
    filterAndRenderProducts();
  };

  // Setup Dynamic Filters based on loaded items
  const setupDynamicFilters = items => {
    const urlParams = new URLSearchParams(window.location.search);

    // 1. Dynamic Price Ranges
    const prices = [...new Set(items.map(p => (p.salePrice ?? p.price)))].sort((a, b) => a - b);
    if (prices.length > 0) {
      const minPrice = prices[0];
      const maxPrice = prices[prices.length - 1];

      if (minPrice === maxPrice) {
        priceRanges = [{ value: 'all', label: formatPrice(minPrice), matches: () => true }];
      } else {
        const lowMax = prices[Math.max(0, Math.ceil(prices.length / 3) - 1)];
        const midMax = prices[Math.max(0, Math.ceil(prices.length * 2 / 3) - 1)];

        priceRanges = [
          { value: 'low', label: `Up to ${formatPrice(lowMax)}`, matches: p => p <= lowMax },
          ...(midMax > lowMax ? [{ value: 'mid', label: `${formatPrice(lowMax + 1)} – ${formatPrice(midMax)}`, matches: p => p > lowMax && p <= midMax }] : []),
          { value: 'high', label: `${formatPrice(midMax + 1)} and above`, matches: p => p > midMax }
        ];
      }
    } else {
      priceRanges = [];
    }

    if (priceFilter) {
      const targetPrice = urlParams.get('price') || priceFilter.value;
      priceFilter.innerHTML = '<option value="">All prices</option>';
      priceRanges.forEach(r => priceFilter.add(new Option(r.label, r.value)));
      if (targetPrice && priceRanges.some(r => r.value === targetPrice)) {
        priceFilter.value = targetPrice;
      }
    }

    // 2. Dynamic Available Sizes
    const availableSizes = new Set();
    items.forEach(item => {
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

    if (sizeFilter && sizeFilterControl) {
      const targetSize = urlParams.get('size') || sizeFilter.value;
      if (sortedSizeList.length > 0) {
        sizeFilterControl.hidden = false;
        sizeFilter.innerHTML = '<option value="">All sizes</option>';
        sortedSizeList.forEach(sz => sizeFilter.add(new Option(sz, sz)));
        if (targetSize && sortedSizeList.some(s => s.toLowerCase() === targetSize.toLowerCase())) {
          sizeFilter.value = sortedSizeList.find(s => s.toLowerCase() === targetSize.toLowerCase());
        }
      } else {
        sizeFilterControl.hidden = true;
      }
    }

    // 3. Dynamic Available Colors
    const availableColors = new Set();
    items.forEach(item => {
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

    if (colorFilter && colorFilterControl) {
      const targetColor = urlParams.get('color') || colorFilter.value;
      if (sortedColorList.length > 0) {
        colorFilterControl.hidden = false;
        colorFilter.innerHTML = '<option value="">All colors</option>';
        sortedColorList.forEach(c => colorFilter.add(new Option(c, c)));
        if (targetColor && sortedColorList.some(c => c.toLowerCase() === targetColor.toLowerCase())) {
          colorFilter.value = sortedColorList.find(c => c.toLowerCase() === targetColor.toLowerCase());
        }
      } else {
        colorFilterControl.hidden = true;
      }
    }

    // 4. Sort filter restore
    if (sortFilter) {
      const targetSort = urlParams.get('sort') || sortFilter.value;
      if (targetSort) sortFilter.value = targetSort;
    }
  };

  // Render Category Not Found State
  const showCategoryNotFound = (msg = 'The requested collection does not exist or has ended its run.') => {
    document.body.classList.remove('is-family-page');
    document.title = 'Collection Not Found | ZaynXwear';
    if (categoryCrumbTitle) categoryCrumbTitle.textContent = 'Not Found';
    if (categoryTitle) categoryTitle.textContent = 'Collection Unavailable';
    if (categoryDesc) categoryDesc.textContent = msg;
    if (categoryProductBadge) categoryProductBadge.textContent = '0 Fits';
    if (categoryFilters) categoryFilters.hidden = true;
    if (categoryResultCount) categoryResultCount.hidden = true;
    if (categoryProductGrid) categoryProductGrid.hidden = true;
    if (categoryNotFound) categoryNotFound.hidden = false;
    if (familyHeroDpWrap) familyHeroDpWrap.hidden = true;
    if (noCategoryProducts) noCategoryProducts.hidden = true;
  };

  // Render Other Categories
  const renderOtherCategories = (categories, currentSlug) => {
    if (!otherCategoriesGrid || !categories.length) return;

    const others = categories.filter(c => c && c.is_active && c.slug !== currentSlug);
    if (!others.length) {
      if (exploreOtherCategories) exploreOtherCategories.hidden = true;
      return;
    }

    const iconMap = {
      't-shirts': 'icon-tshirt',
      'shirts': 'icon-shirt',
      'jeans': 'icon-jeans',
      'pants': 'icon-pants',
      'track-pants': 'icon-pants',
      'caps': 'icon-tshirt'
    };

    otherCategoriesGrid.innerHTML = others.map(cat => {
      const icon = iconMap[cat.slug] || 'icon-tshirt';
      return `
        <a href="category.html?category=${encodeURIComponent(cat.slug)}" class="category-card" data-reveal>
          <div class="cat-icon-wrap">
            <svg class="cat-icon" aria-hidden="true">
              <use href="#${icon}" />
            </svg>
          </div>
          <div class="category-label">
            <h3>${escapeHtml(cat.name)}</h3>
            <span class="cat-explore">Explore <span class="cat-arrow">→</span></span>
          </div>
        </a>
      `;
    }).join('');
  };

  let scrollObserver;

  // Main Loader (Supports both ?family=... and ?category=...)
  const loadCategory = async (isNextPage = false, hasMoreProducts = false) => {
    const urlParams = new URLSearchParams(window.location.search);
    const familyParam = (urlParams.get('family') || '').trim();
    const categoryParam = (urlParams.get('category') || urlParams.get('id') || '').trim();

    if (!familyParam && !categoryParam && !isNextPage) {
      showCategoryNotFound();
      return;
    }

    try {
      if (!catalog) {
        throw new Error('Catalog API not loaded on page');
      }
      await catalog.productsReady;

      allActiveCategories = catalog.categories || [];
      allActiveFamilies = catalog.families || [];

      // ==========================================
      // SCENARIO 1: VIEWING A PRODUCT FAMILY
      // ==========================================
      if (familyParam) {
        currentViewMode = 'family';
        document.body.classList.add('is-family-page');
        const targetFamilyKey = familyParam.toLowerCase();
        currentFamily = allActiveFamilies.find(f =>
          (f.slug && f.slug.toLowerCase() === targetFamilyKey) ||
          (f.id && f.id.toLowerCase() === targetFamilyKey) ||
          (f.name && f.name.toLowerCase() === targetFamilyKey)
        );

        let rawList = [];
        if (currentFamily) {
          rawList = catalog.products
            .filter(p => p.familyId === currentFamily.id)
            .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name));
        } else {
          rawList = catalog.products
            .filter(p =>
              (p.familyId && p.familyId.toLowerCase() === targetFamilyKey) ||
              (p.familyName && p.familyName.toLowerCase() === targetFamilyKey) ||
              (p.slug && p.slug.toLowerCase() === targetFamilyKey)
            )
            .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name));
        }

        if (!currentFamily && rawList.length > 0 && rawList[0].familyId) {
          const matchedFamId = rawList[0].familyId;
          currentFamily = allActiveFamilies.find(f => f.id === matchedFamId) || {
            id: matchedFamId,
            name: rawList[0].familyName || rawList[0].name,
            slug: familyParam,
            category_name: rawList[0].category,
            category_slug: rawList[0].categorySlug
          };
        }

        if (!currentFamily && rawList.length === 0) {
          showCategoryNotFound('The requested product variety could not be found.');
          renderOtherCategories(allActiveCategories, '');
          return;
        }

        currentTarget = currentFamily;
        const parentCategory = allActiveCategories.find(c =>
          c.id === currentFamily?.category_id ||
          (c.slug && currentFamily?.category_slug && c.slug.toLowerCase() === currentFamily.category_slug.toLowerCase())
        );

        categoryProducts = rawList;

        // Set Headers and Breadcrumbs
        const familyDisplayName = currentFamily?.name || (categoryProducts[0]?.familyName) || 'Collection';
        document.title = `${familyDisplayName} | ZaynXwear Streetwear`;

        // Set Family DP in Hero
        const familyDp = currentFamily?.display_image || (categoryProducts[0]?.images?.[0]) || 'images/ca2e03bc34d1c75b624003e138376397.jpg';
        if (familyHeroDpWrap && familyHeroDpImg) {
          familyHeroDpImg.src = familyDp;
          familyHeroDpImg.alt = familyDisplayName;
          familyHeroDpWrap.hidden = false;
        }

        const categoryEyebrow = document.getElementById('categoryEyebrow');
        if (categoryEyebrow) categoryEyebrow.textContent = 'PRODUCT VARIETIES COLLECTION';

        if (categoryCrumbTitle) {
          if (parentCategory) {
            categoryCrumbTitle.innerHTML = `<a href="category.html?category=${encodeURIComponent(parentCategory.slug)}">${escapeHtml(parentCategory.name)}</a> <span class="crumb-sep">/</span> <span class="crumb-current">${escapeHtml(familyDisplayName)}</span>`;
          } else {
            categoryCrumbTitle.textContent = familyDisplayName;
          }
        }

        if (categoryTitle) categoryTitle.textContent = familyDisplayName;
        if (categoryDesc) {
          categoryDesc.textContent = currentFamily?.description || `Explore all individual designs and variations in the ${familyDisplayName} collection.`;
        }

        if (categoryDiscountBanner) {
          if (parentCategory?.discount_is_active && parentCategory.discount_type && parentCategory.discount_type !== 'none' && Number(parentCategory.discount_value) > 0) {
            const discountText = parentCategory.discount_type === 'percentage'
              ? `Special Offer: ${parentCategory.discount_value}% OFF on all ${familyDisplayName} (Applied at Checkout)`
              : `Special Offer: ₹${parentCategory.discount_value} OFF on all ${familyDisplayName} (Applied at Checkout)`;
            categoryDiscountBanner.innerHTML = `<span class="discount-pill">● SPECIAL OFFER</span> <strong>${escapeHtml(discountText)}</strong>`;
            categoryDiscountBanner.hidden = false;
          } else {
            categoryDiscountBanner.hidden = true;
          }
        }

        if (categoryProductBadge) {
          const count = categoryProducts.length;
          categoryProductBadge.textContent = `${count} ${count === 1 ? 'Variety' : 'Varieties'}`;
        }

        setupDynamicFilters(categoryProducts);
        filterAndRenderProducts();
        renderOtherCategories(allActiveCategories, parentCategory?.slug || '');

        window.ZaynXwearLogger?.info('family_page_loaded', {
          family: familyDisplayName,
          varietyCount: categoryProducts.length
        });
        return;
      }

      // ==========================================
      // SCENARIO 2: VIEWING A CATEGORY
      // ==========================================
      currentViewMode = 'category';
      document.body.classList.remove('is-family-page');
      if (familyHeroDpWrap) familyHeroDpWrap.hidden = true;
      const targetSlug = categoryParam.toLowerCase();
      currentCategory = allActiveCategories.find(c =>
        (c.slug && c.slug.toLowerCase() === targetSlug) ||
        (c.id && c.id.toLowerCase() === targetSlug) ||
        (c.name && c.name.toLowerCase() === targetSlug)
      );

      if (!currentCategory) {
        showCategoryNotFound();
        renderOtherCategories(allActiveCategories, '');
        return;
      }

      currentTarget = currentCategory;

      // 2. Set Category Header Meta & Content
      document.title = `${currentCategory.name} | ZaynXwear Streetwear`;
      const categoryEyebrow = document.getElementById('categoryEyebrow');
      if (categoryEyebrow) categoryEyebrow.textContent = 'COLLECTION DROP';
      if (categoryCrumbTitle) categoryCrumbTitle.textContent = currentCategory.name;
      if (categoryTitle) categoryTitle.textContent = currentCategory.name;
      if (categoryDesc) {
        categoryDesc.textContent = currentCategory.description || `Explore our latest ${currentCategory.name} drop made in small batches with premium craftsmanship.`;
      }

      // Discount Banner
      if (categoryDiscountBanner) {
        if (currentCategory.discount_is_active && currentCategory.discount_type && currentCategory.discount_type !== 'none' && Number(currentCategory.discount_value) > 0) {
          const discountText = currentCategory.discount_type === 'percentage'
            ? `Special Drop: ${currentCategory.discount_value}% OFF on all ${currentCategory.name} (Applied at Checkout)`
            : `Special Drop: ₹${currentCategory.discount_value} OFF on all ${currentCategory.name} (Applied at Checkout)`;
          categoryDiscountBanner.innerHTML = `<span class="discount-pill">● SPECIAL OFFER</span> <strong>${escapeHtml(discountText)}</strong>`;
          categoryDiscountBanner.hidden = false;
        } else {
          categoryDiscountBanner.hidden = true;
        }
      }

      // Filter products belonging to this Category in-memory from central catalog
      const normalizedProds = catalog.products.filter(p =>
        p.categoryId === currentCategory.id ||
        (p.categorySlug && p.categorySlug.toLowerCase() === currentCategory.slug.toLowerCase()) ||
        (p.category && currentCategory.name && p.category.toLowerCase() === currentCategory.name.toLowerCase()) ||
        (p.category && currentCategory.slug && p.category.toLowerCase() === currentCategory.slug.toLowerCase())
      );

      // Resolve Family vs Single grouping inside this Category
      const familyProdsMap = new Map();
      const standalone = [];

      normalizedProds.forEach(p => {
        if (p.familyId) {
          if (!familyProdsMap.has(p.familyId)) familyProdsMap.set(p.familyId, []);
          familyProdsMap.get(p.familyId).push(p);
        } else {
          standalone.push(p);
        }
      });

      const displayItems = [];
      const processedFamIds = new Set();

      // Explicitly sort active families by sort_order ascending, then by name alphabetically
      const sortedActiveFamilies = [...allActiveFamilies].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.name.localeCompare(b.name));

      // Iterate through sortedActiveFamilies to guarantee Family Cards appear in the exact admin-defined Display Order.
      sortedActiveFamilies.forEach(famMeta => {
        const fId = famMeta.id;
        if (!familyProdsMap.has(fId)) return;
        if (processedFamIds.has(fId)) return;
        processedFamIds.add(fId);

        const fProds = [...familyProdsMap.get(fId)].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name));
        const isMulti = fProds.length > 1 || fProds.some(p => p.productMode === 'variety');
        const isCaps = famMeta?.slug === 'caps-family' || famMeta?.slug === 'caps' || famMeta?.name?.toLowerCase() === 'caps' || fProds[0]?.categorySlug === 'caps';

        if (isMulti || isCaps || fProds[0]?.productMode === 'variety') {
          const first = fProds[0];
          const minSale = Math.min(...fProds.map(p => p.salePrice ?? p.price ?? 0));
          const matchP = fProds.find(p => (p.salePrice ?? p.price ?? 0) === minSale) || first;
          const totStock = fProds.reduce((sum, p) => sum + (p.availableStock || 0), 0);
          const familyDp = famMeta?.display_image || null;

          displayItems.push({
            type: 'family',
            id: fId,
            familyId: fId,
            slug: famMeta?.slug || first.slug || fId,
            name: famMeta?.name || first.familyName || first.name,
            category: currentCategory.name,
            categorySlug: currentCategory.slug,
            description: famMeta?.description || first.description || '',
            displayImage: familyDp,
            images: familyDp ? [familyDp] : ((first.images && first.images.length) ? first.images : ['images/ca2e03bc34d1c75b624003e138376397.jpg']),
            alt: famMeta?.name || first.alt || 'ZaynXwear collection',
            salePrice: minSale,
            price: minSale,
            mrp: matchP.mrp || minSale,
            availableStock: totStock,
            productCount: fProds.length,
            products: fProds,
            isActive: true,
            sortOrder: typeof famMeta?.sort_order === 'number' ? famMeta.sort_order : 9999
          });
        } else {
          fProds.forEach(p => displayItems.push({ type: 'product', ...p }));
        }
      });

      // Catch any remaining product families not found in allActiveFamilies
      familyProdsMap.forEach((fProds, fId) => {
        if (processedFamIds.has(fId)) return;
        processedFamIds.add(fId);
        fProds.forEach(p => displayItems.push({ type: 'product', ...p }));
      });

      standalone.forEach(p => displayItems.push({ type: 'product', ...p }));

      categoryProducts = displayItems;

      // Update Header Product Badge
      if (categoryProductBadge) {
        const count = categoryProducts.length;
        categoryProductBadge.textContent = `${count} Fit${count === 1 ? '' : 's'}`;
      }

      // 4. Setup Dynamic Filters for this Category
      setupDynamicFilters(categoryProducts);

      // 5. Initial Render
      filterAndRenderProducts();

      // Infinite scroll observer
      if (scrollObserver) scrollObserver.disconnect();
      if (hasMoreProducts && 'IntersectionObserver' in window && categoryProducts.length > 0) {
        const cards = categoryProductGrid.querySelectorAll('.product-card');
        if (cards.length > 0) {
          scrollObserver = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
               scrollObserver.disconnect();
               if (window.ZaynXwearProducts?.loadNextPage) {
                   window.ZaynXwearProducts.loadNextPage();
               }
            }
          }, { rootMargin: '200px' });
          scrollObserver.observe(cards[cards.length - 1]);
        }
      }

      // 6. Render Other Categories for navigation
      renderOtherCategories(allActiveCategories, currentCategory.slug);

      window.ZaynXwearLogger?.info('category_page_loaded', {
        category: currentCategory.name,
        slug: currentCategory.slug,
        itemCount: categoryProducts.length
      });

    } catch (error) {
      window.ZaynXwearLogger?.error('category_load_failed', {}, error);
      showCategoryNotFound();
    }
  };

  let debounceTimeout;

  const syncFiltersToUrl = () => {
    const params = new URLSearchParams(window.location.search);
    if (searchInput?.value.trim()) params.set('q', searchInput.value.trim());
    else params.delete('q');
    
    if (priceFilter?.value) params.set('price', priceFilter.value);
    else params.delete('price');
    
    if (sizeFilter?.value) params.set('size', sizeFilter.value);
    else params.delete('size');
    
    if (colorFilter?.value) params.set('color', colorFilter.value);
    else params.delete('color');
    
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
    if (priceFilter && params.has('price')) {
      priceFilter.value = params.get('price');
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
    if (sortFilter && params.has('sort')) {
      sortFilter.value = params.get('sort');
      filtersChanged = true;
    }
    return filtersChanged;
  };

  const fetchFilteredProducts = async () => {
    const term = searchInput?.value.trim().toLowerCase() || '';
    if (catalog?.loadProducts) {
      const params = new URLSearchParams(window.location.search);
      const categorySlug = params.get('category') || params.get('id') || '';
      await catalog.loadProducts({ forceRefresh: true, search: term, categorySlug });
    }
  };

  // Wire Filter Event Listeners
  priceFilter?.addEventListener('change', () => { syncFiltersToUrl(); filterAndRenderProducts(); });
  sizeFilter?.addEventListener('change', () => { syncFiltersToUrl(); filterAndRenderProducts(); });
  colorFilter?.addEventListener('change', () => { syncFiltersToUrl(); filterAndRenderProducts(); });
  sortFilter?.addEventListener('change', () => { syncFiltersToUrl(); filterAndRenderProducts(); });
  
  searchInput?.addEventListener('input', () => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      syncFiltersToUrl();
      fetchFilteredProducts();
    }, 300);
  });
  
  const handleClearFilters = () => {
    if (priceFilter) priceFilter.value = '';
    if (sizeFilter) sizeFilter.value = '';
    if (colorFilter) colorFilter.value = '';
    if (sortFilter) sortFilter.value = '';
    if (searchInput) searchInput.value = '';
    syncFiltersToUrl();
    fetchFilteredProducts();
  };
  
  clearFilters?.addEventListener('click', handleClearFilters);
  resetFiltersBtn?.addEventListener('click', handleClearFilters);

  document.addEventListener('zaynxwear:products-loaded', (e) => {
    const isNextPage = e.detail?.isNextPage || false;
    const hasMoreProducts = e.detail?.hasMoreProducts !== false;
    loadCategory(isNextPage, hasMoreProducts);
  });

  // Initialize
  if (loadFiltersFromUrl()) {
      fetchFilteredProducts();
  } else {
      loadCategory();
  }
});
