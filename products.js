/* ZaynXwear dynamic product catalog: Supabase-backed single source of truth. */
(function () {
  const SUPABASE_URL = (window.ZaynXwearAdminConfig && window.ZaynXwearAdminConfig.supabaseUrl) || '';
  const SUPABASE_ANON_KEY = (window.ZaynXwearAdminConfig && window.ZaynXwearAdminConfig.supabaseAnonKey) || '';

  let products = [];
  let productFamilies = [];
  let categories = [];
  let loadState = 'idle'; // 'idle' | 'loading' | 'loaded' | 'error'
  let currentOffset = 0;
  let hasMoreProducts = true;
  let currentSearch = '';
  let currentCategoryFilter = '';
  let isFetching = false;
  const PAGE_LIMIT = 24;

  let resolveReady;
  let rejectReady;
  let isReadyResolved = false;

  const productsReady = new Promise((resolve, reject) => {
    resolveReady = resolve;
    rejectReady = reject;
  });

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

  const calculateEffectiveSalePrice = (mrpPaise, customSalePaise, pricingMode, category) => {
    const mrp = Number(mrpPaise) || 0;
    const customSale = Number(customSalePaise) || mrp;
    const mode = pricingMode || 'custom';

    if (mrp <= 0) return Math.max(0, customSale);

    if (mode === 'none') {
      return mrp;
    }

    if (mode === 'category') {
      if (category && category.discount_is_active && category.discount_type && category.discount_type !== 'none' && Number(category.discount_value) > 0) {
        if (category.discount_type === 'percentage') {
          const pct = Math.min(100, Math.max(0, Number(category.discount_value)));
          const effective = Math.round(mrp * (100 - pct) / 100);
          return Math.min(mrp, Math.max(0, effective));
        } else if (category.discount_type === 'fixed') {
          const fixedVal = Math.max(0, Number(category.discount_value));
          const effective = Math.max(0, mrp - fixedVal);
          return Math.min(mrp, effective);
        }
      }
      // Fallback if category discount inactive or none
      return Math.min(mrp, Math.max(0, customSale));
    }

    // Default 'custom' mode
    return Math.min(mrp, Math.max(0, customSale));
  };

  const normalizeProduct = (raw, categoryMap) => {
    let images = [];
    if (Array.isArray(raw.images)) {
      images = raw.images.filter(img => typeof img === 'string' && img.trim());
    } else if (typeof raw.images === 'string') {
      try {
        const parsed = JSON.parse(raw.images);
        if (Array.isArray(parsed)) images = parsed.filter(img => typeof img === 'string' && img.trim());
      } catch {
        images = [raw.images.trim()];
      }
    }
    if (!images.length) {
      images = ['images/ca2e03bc34d1c75b624003e138376397.jpg'];
    }

    const categoryRule = (categoryMap && (
      (raw.category_id && categoryMap.get(raw.category_id)) ||
      (raw.category_slug && categoryMap.get(raw.category_slug.toLowerCase())) ||
      (raw.category && categoryMap.get(raw.category.toLowerCase()))
    )) || null;

    const rawSalePaise = raw.sale_price_paise ?? raw.price_paise ?? ((typeof raw.price === 'number' ? raw.price : 0) * 100);
    const customSalePaise = Number(rawSalePaise) || 0;
    const mrpPaise = Number(raw.mrp_paise ?? customSalePaise) || customSalePaise;
    const pricingMode = raw.pricing_mode || 'custom';

    const effectiveSalePricePaise = calculateEffectiveSalePrice(mrpPaise, customSalePaise, pricingMode, categoryRule);
    const salePricePaise = effectiveSalePricePaise;
    const salePrice = Math.round(salePricePaise / 100);
    const mrp = Math.round(mrpPaise / 100);

    // Backward compatibility: price and pricePaise point to sale price
    const price = salePrice;
    const pricePaise = salePricePaise;

    const rawVariants = Array.isArray(raw.product_variants) ? raw.product_variants : [];
    const variants = rawVariants
      .filter(v => v && v.is_active !== false)
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
      .map(v => {
        const vStock = Number.isFinite(Number(v.stock_quantity)) ? Number(v.stock_quantity) : 0;
        const vReserved = Number.isFinite(Number(v.reserved_quantity)) ? Number(v.reserved_quantity) : 0;

        const vRawSalePaise = v.sale_price_paise ?? v.price_paise ?? customSalePaise;
        const vCustomSalePaise = Number(vRawSalePaise) || customSalePaise;
        const vMrpPaise = Number(v.mrp_paise ?? vCustomSalePaise ?? mrpPaise) || vCustomSalePaise;
        const vPricingMode = v.pricing_mode || pricingMode;

        const vEffectiveSalePricePaise = calculateEffectiveSalePrice(vMrpPaise, vCustomSalePaise, vPricingMode, categoryRule);
        const vSalePricePaise = vEffectiveSalePricePaise;
        const vSalePrice = Math.round(vSalePricePaise / 100);
        const vMrp = Math.round(vMrpPaise / 100);
        const vPrice = vSalePrice;
        const vPricePaise = vSalePricePaise;

        let vImages = [];
        if (Array.isArray(v.images)) {
          vImages = v.images.filter(img => typeof img === 'string' && img.trim());
        }
        return {
          id: String(v.id),
          sku: v.sku || '',
          title: String(v.title || 'Standard Fit'),
          color: v.color ? String(v.color).trim() : null,
          size: v.size ? String(v.size).trim() : null,
          attributes: typeof v.attributes === 'object' && v.attributes !== null ? v.attributes : {},
          pricingMode: vPricingMode,
          price: vPrice,
          pricePaise: vPricePaise,
          salePrice: vSalePrice,
          salePricePaise: vSalePricePaise,
          mrp: vMrp,
          mrpPaise: vMrpPaise,
          stockQuantity: vStock,
          reservedQuantity: vReserved,
          availableStock: Math.max(0, vStock - vReserved),
          images: vImages.length ? vImages : images,
          isActive: Boolean(v.is_active !== false)
        };
      });

    const hasVariants = variants.length > 0;
    const stock = hasVariants
      ? variants.reduce((sum, v) => sum + v.stockQuantity, 0)
      : (Number.isFinite(Number(raw.stock_quantity)) ? Number(raw.stock_quantity) : 0);
    const reserved = hasVariants
      ? variants.reduce((sum, v) => sum + v.reservedQuantity, 0)
      : (Number.isFinite(Number(raw.reserved_quantity)) ? Number(raw.reserved_quantity) : 0);
    const availableStock = Math.max(0, stock - reserved);

    const colors = [...new Set(variants.map(v => v.color).filter(Boolean))];
    const sizes = [...new Set(variants.map(v => v.size).filter(Boolean))];

    return {
      id: String(raw.id || '').trim(),
      slug: String(raw.slug || raw.id || '').trim(),
      name: String(raw.name || '').trim(),
      sortOrder: typeof raw.sort_order === 'number' ? raw.sort_order : 0,
      familyId: raw.family_id ? String(raw.family_id).trim() : null,
      familyName: String(raw.family_name || raw.name || '').trim(),
      varietyName: raw.variety_name ? String(raw.variety_name).trim() : null,
      productMode: String(raw.product_mode || (raw.variety_name ? 'variety' : 'single')).trim(),
      pricingMode,
      price,
      pricePaise,
      salePrice,
      salePricePaise,
      mrp,
      mrpPaise,
      currency: String(raw.currency || 'INR').trim(),
      category: String(raw.category || 'Streetwear').trim(),
      categoryId: raw.category_id ? String(raw.category_id).trim() : null,
      categorySlug: String(raw.category_slug || 'streetwear').trim().toLowerCase(),
      description: String(raw.description || '').trim(),
      images,
      alt: String(raw.alt_text || raw.alt || raw.name || 'E-Commerce Demo apparel').trim(),
      stockQuantity: stock,
      reservedQuantity: reserved,
      availableStock,
      variants,
      colors,
      sizes,
      hasVariants,
      isActive: Boolean(raw.is_active !== false)
    };
  };

  const getProduct = identifier => {
    if (!identifier || typeof identifier !== 'string') return null;
    const raw = String(identifier).trim();
    if (!raw) return null;

    let decoded = raw;
    try {
      decoded = decodeURIComponent(raw).trim();
    } catch {
      decoded = raw;
    }

    const normalized = decoded.toLowerCase();

    // 1. Exact match by slug or id
    const exactMatch = products.find(p => p && (p.slug === decoded || p.id === decoded || p.slug === raw || p.id === raw));
    if (exactMatch) return exactMatch;

    // 2. Case-insensitive slug match (canonical)
    const slugMatch = products.find(p => p && p.slug && p.slug.toLowerCase() === normalized);
    if (slugMatch) return slugMatch;

    // 3. Case-insensitive ID match (backward compatibility fallback)
    const idMatch = products.find(p => p && p.id && p.id.toLowerCase() === normalized);
    if (idMatch) return idMatch;

    return null;
  };

  const getProducts = () => [...products];
  const getFamilies = () => [...productFamilies];
  const getFamily = familyIdentifier => {
    if (!familyIdentifier) return null;
    const raw = String(familyIdentifier).trim().toLowerCase();
    return productFamilies.find(f => f && (f.id === familyIdentifier || f.slug?.toLowerCase() === raw || f.name?.toLowerCase() === raw)) || null;
  };

  const getFamilyVarieties = familyId => {
    if (!familyId) return [];
    const targetId = String(familyId).trim();
    return products.filter(p => p && p.isActive !== false && p.familyId === targetId);
  };

  const getSiblingVarieties = productIdentifier => {
    const p = getProduct(productIdentifier);
    if (!p || !p.familyId) return p ? [p] : [];
    return getFamilyVarieties(p.familyId);
  };

  const skeletonCard = () => `
    <div class="product-card product-card-skeleton" aria-hidden="true">
      <div class="product-media skeleton-media"></div>
      <div class="product-info">
        <div class="skeleton-line skeleton-cat"></div>
        <div class="skeleton-line skeleton-title"></div>
        <div class="skeleton-line skeleton-price"></div>
      </div>
    </div>`;

  const errorState = message => `
    <div class="catalog-error-state" role="alert">
      <p class="eyebrow">CATALOG UNAVAILABLE</p>
      <h3>${escapeHtml(message || 'Unable to load products.')}</h3>
      <p>Please check your connection and try again.</p>
      <button class="btn btn-primary btn-retry" id="catalogRetryBtn" type="button">Try Again</button>
    </div>`;

  const emptyState = () => `
    <div class="catalog-empty-state" role="status">
      <p class="eyebrow">NEW DROPS COMING SOON</p>
      <h3>No products are currently available.</h3>
      <p>Check back shortly for our next small-batch drop.</p>
    </div>`;

  const productCard = product => {
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

  const familyCard = item => {
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

  const catalogCard = item => {
    if (!item) return '';
    if (item.type === 'family') {
      return familyCard(item);
    }
    return productCard(item);
  };

  const getCatalogDisplayItems = (filterCategoryId = null) => {
    const activeProducts = products.filter(p => p && p.isActive !== false);
    const allFamilies = [...productFamilies]
      .filter(f => f && f.is_active !== false)
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.name.localeCompare(b.name));

    const familyProductsMap = new Map();
    const standaloneProducts = [];

    activeProducts.forEach(p => {
      if (filterCategoryId) {
        const catMatch = (p.categoryId === filterCategoryId) ||
          (p.categorySlug && p.categorySlug.toLowerCase() === String(filterCategoryId).toLowerCase());
        if (!catMatch) return;
      }
      if (p.familyId) {
        if (!familyProductsMap.has(p.familyId)) {
          familyProductsMap.set(p.familyId, []);
        }
        familyProductsMap.get(p.familyId).push(p);
      } else {
        standaloneProducts.push(p);
      }
    });

    const displayItems = [];
    const processedFamilyIds = new Set();

    // Iterate through allFamilies (which is already sorted by sort_order.asc, name.asc)
    // to guarantee that Family Cards appear in the exact admin-defined Display Order.
    allFamilies.forEach(famMeta => {
      const famId = famMeta.id;
      if (!familyProductsMap.has(famId)) return;
      if (processedFamilyIds.has(famId)) return;
      processedFamilyIds.add(famId);

      const famProds = [...familyProductsMap.get(famId)].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name));
      const isMultiVariety = famProds.length > 1 || famProds.some(p => p.productMode === 'variety');
      const isCapsFamily = (famMeta?.slug === 'caps-family' || famMeta?.slug === 'caps' || famMeta?.name?.toLowerCase() === 'caps' || famProds[0]?.categorySlug === 'caps');

      if (isMultiVariety || isCapsFamily || famProds[0]?.productMode === 'variety') {
        const firstProd = famProds[0];
        const minSalePrice = Math.min(...famProds.map(p => (p.salePrice ?? p.price ?? 0)));
        const matchingProdForPrice = famProds.find(p => (p.salePrice ?? p.price ?? 0) === minSalePrice) || firstProd;
        const totalStock = famProds.reduce((sum, p) => sum + (p.availableStock || 0), 0);
        const familyDp = famMeta?.display_image || null;

        displayItems.push({
          type: 'family',
          id: famId,
          familyId: famId,
          slug: famMeta?.slug || firstProd.slug || famId,
          name: famMeta?.name || firstProd.familyName || firstProd.name,
          category: famMeta?.category_name || firstProd.category || 'Streetwear',
          categorySlug: famMeta?.category_slug || firstProd.categorySlug || 'streetwear',
          description: famMeta?.description || firstProd.description || '',
          displayImage: familyDp,
          images: familyDp ? [familyDp] : ((firstProd.images && firstProd.images.length) ? firstProd.images : ['images/ca2e03bc34d1c75b624003e138376397.jpg']),
          alt: famMeta?.name || firstProd.alt || 'E-Commerce Demo collection',
          salePrice: minSalePrice,
          price: minSalePrice,
          mrp: matchingProdForPrice.mrp || minSalePrice,
          availableStock: totalStock,
          productCount: famProds.length,
          products: famProds,
          isActive: true,
          sortOrder: typeof famMeta?.sort_order === 'number' ? famMeta.sort_order : 9999
        });
      } else {
        famProds.forEach(p => {
          displayItems.push({
            type: 'product',
            ...p
          });
        });
      }
    });

    // Catch any remaining product families not found in allFamilies list
    familyProductsMap.forEach((famProds, famId) => {
      if (processedFamilyIds.has(famId)) return;
      processedFamilyIds.add(famId);
      famProds.forEach(p => displayItems.push({ type: 'product', ...p }));
    });

    standaloneProducts.forEach(p => {
      displayItems.push({
        type: 'product',
        ...p
      });
    });

    return displayItems;
  };

  const renderHomepageProducts = () => {
    const grid = document.getElementById('shop');
    if (!grid) return;

    if (loadState === 'loading' && !products.length) {
      grid.innerHTML = Array.from({ length: 4 }, skeletonCard).join('');
      return;
    }

    if (loadState === 'error' && !products.length) {
      grid.innerHTML = errorState();
      document.getElementById('catalogRetryBtn')?.addEventListener('click', () => loadProducts({ forceRefresh: true }));
      return;
    }

    const displayItems = getCatalogDisplayItems();

    if (!displayItems.length) {
      grid.innerHTML = emptyState();
      return;
    }

    grid.innerHTML = displayItems.map(catalogCard).join('');
  };

  const loadProducts = async ({ forceRefresh = false, search = '', categorySlug = '', isNextPage = false } = {}) => {
    if (isFetching) return productsReady;
    
    // Only return cached if we don't force refresh and aren't fetching next page
    if (loadState === 'loaded' && !forceRefresh && !isNextPage && search === currentSearch && categorySlug === currentCategoryFilter) {
      return products;
    }

    isFetching = true;
    loadState = 'loading';

    if (!isNextPage) {
      currentOffset = 0;
      hasMoreProducts = true;
      currentSearch = search || '';
      currentCategoryFilter = categorySlug || '';
      if (forceRefresh || search !== '' || categorySlug !== '') {
        products = [];
      }
    }

    if (!hasMoreProducts) {
      isFetching = false;
      return products;
    }

    const grid = document.getElementById('shop');
    if (grid && !products.length && !isNextPage) {
      grid.innerHTML = Array.from({ length: 4 }, skeletonCard).join('');
    }

    if (window.ZaynXwearMockData || (window.ZaynXwearAdminConfig && window.ZaynXwearAdminConfig.isDemoMode)) {
      const mock = window.ZaynXwearMockData || { products: [], categories: [], families: [] };
      categories = mock.categories || [];
      productFamilies = mock.families || [];
      const categoryMap = new Map();
      categories.forEach(c => {
        if (c.id) categoryMap.set(c.id, c);
        if (c.slug) categoryMap.set(c.slug.toLowerCase(), c);
        if (c.name) categoryMap.set(c.name.toLowerCase(), c);
      });

      let rawList = mock.products || [];
      if (currentSearch) {
        const s = currentSearch.toLowerCase();
        rawList = rawList.filter(p =>
          (p.name && p.name.toLowerCase().includes(s)) ||
          (p.description && p.description.toLowerCase().includes(s)) ||
          (p.family_name && p.family_name.toLowerCase().includes(s)) ||
          (p.category && p.category.toLowerCase().includes(s))
        );
      }
      if (currentCategoryFilter) {
        const c = currentCategoryFilter.toLowerCase();
        rawList = rawList.filter(p =>
          (p.category_slug && p.category_slug.toLowerCase() === c) ||
          (p.category && p.category.toLowerCase() === c)
        );
      }

      hasMoreProducts = false;
      const newProducts = rawList.map(raw => normalizeProduct(raw, categoryMap));
      if (isNextPage) {
        products = [...products, ...newProducts];
      } else {
        products = newProducts;
      }

      loadState = 'loaded';
      isFetching = false;

      if (!isReadyResolved) {
        isReadyResolved = true;
        resolveReady(products);
      }

      if (!isNextPage) {
        renderHomepageProducts();
      }

      window.ZaynXwearLogger?.info('catalog_loaded_mock', {
        productCount: products.length,
        categoriesCount: categoryMap.size,
        familiesCount: productFamilies.length
      });

      document.dispatchEvent(new CustomEvent('zaynxwear:products-loaded', {
        detail: { products: [...products], families: [...productFamilies], isNextPage: false, hasMoreProducts: false }
      }));

      return products;
    }

    try {
      let endpointWithVariants = `${SUPABASE_URL}/rest/v1/products?is_active=eq.true&select=id,slug,name,price_paise,mrp_paise,sale_price_paise,pricing_mode,category_id,currency,is_active,category,category_slug,description,images,alt_text,stock_quantity,reserved_quantity,family_id,family_name,variety_name,product_mode,sort_order,product_variants(id,sku,title,color,size,attributes,price_paise,mrp_paise,sale_price_paise,pricing_mode,stock_quantity,reserved_quantity,images,is_active,sort_order)&order=name.asc`;
      let endpointLegacy = `${SUPABASE_URL}/rest/v1/products?is_active=eq.true&select=id,slug,name,price_paise,mrp_paise,sale_price_paise,currency,is_active,category,category_slug,description,images,alt_text,stock_quantity,reserved_quantity,sort_order&order=name.asc`;

      if (currentSearch) {
        const encodedSearch = encodeURIComponent(currentSearch);
        const searchFilter = `&or=(name.ilike.*${encodedSearch}*,description.ilike.*${encodedSearch}*,family_name.ilike.*${encodedSearch}*,category.ilike.*${encodedSearch}*)`;
        endpointWithVariants += searchFilter;
        endpointLegacy += searchFilter;
      }
      
      if (currentCategoryFilter) {
        const catFilter = `&or=(category_slug.ilike.*${encodeURIComponent(currentCategoryFilter)}*,category.ilike.*${encodeURIComponent(currentCategoryFilter)}*)`;
        endpointWithVariants += catFilter;
        endpointLegacy += catFilter;
      }

      endpointWithVariants += `&limit=${PAGE_LIMIT}&offset=${currentOffset}`;
      endpointLegacy += `&limit=${PAGE_LIMIT}&offset=${currentOffset}`;

      const headers = {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      };

      const fetchPromises = [
        fetch(endpointWithVariants, { method: 'GET', headers })
      ];

      // Fetch categories and families only if we don't have them
      if (categories.length === 0) {
        const endpointCategories = `${SUPABASE_URL}/rest/v1/categories?is_active=eq.true&select=id,name,slug,description,is_active,discount_type,discount_value,discount_is_active,sort_order&order=sort_order.asc`;
        fetchPromises.push(fetch(endpointCategories, { method: 'GET', headers }));
      } else {
        fetchPromises.push(Promise.resolve({ status: 'fulfilled', value: null }));
      }

      if (productFamilies.length === 0) {
        const endpointFamilies = `${SUPABASE_URL}/rest/v1/product_families?is_active=eq.true&order=sort_order.asc,name.asc`;
        fetchPromises.push(fetch(endpointFamilies, { method: 'GET', headers }));
      } else {
        fetchPromises.push(Promise.resolve({ status: 'fulfilled', value: null }));
      }

      const [productsResResult, categoriesResResult, familiesResResult] = await Promise.allSettled(fetchPromises);

      let response = productsResResult.status === 'fulfilled' ? productsResResult.value : null;

      if (!response || (!response.ok && response.status === 400)) {
        // Try requesting endpointWithVariants without sort_order first
        const endpointWithVariantsNoSort = endpointWithVariants.replace(',sort_order', '');
        response = await fetch(endpointWithVariantsNoSort, { method: 'GET', headers });
        if (!response.ok) {
          const endpointLegacyNoSort = endpointLegacy.replace(',sort_order', '');
          response = await fetch(endpointLegacyNoSort, { method: 'GET', headers });
        }
      }

      if (!response.ok) {
        throw new Error(`Catalog request failed with status ${response.status}`);
      }

      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error('Invalid catalog response.');
      }

      // Update hasMoreProducts and currentOffset
      if (data.length < PAGE_LIMIT) {
        hasMoreProducts = false;
      }
      currentOffset += PAGE_LIMIT;

      const categoryMap = new Map();
      if (categoriesResResult.status === 'fulfilled' && categoriesResResult.value && categoriesResResult.value.ok) {
        try {
          const catsData = await categoriesResResult.value.json();
          if (Array.isArray(catsData)) {
            categories = catsData;
          }
        } catch (catErr) {
          window.ZaynXwearLogger?.warn('category_fetch_failed', {}, catErr);
        }
      }
      categories.forEach(c => {
        if (c.id) categoryMap.set(c.id, c);
        if (c.slug) categoryMap.set(c.slug.toLowerCase(), c);
        if (c.name) categoryMap.set(c.name.toLowerCase(), c);
      });

      if (familiesResResult.status === 'fulfilled' && familiesResResult.value && familiesResResult.value.ok) {
        try {
          const famsData = await familiesResResult.value.json();
          if (Array.isArray(famsData)) {
            productFamilies = famsData;
          }
        } catch (famErr) {
          window.ZaynXwearLogger?.warn('families_fetch_failed', {}, famErr);
        }
      }

      const newProducts = data.map(raw => normalizeProduct(raw, categoryMap));
      if (isNextPage) {
        products = [...products, ...newProducts];
      } else {
        products = newProducts;
      }
      
      loadState = 'loaded';
      isFetching = false;

      if (!isReadyResolved) {
        isReadyResolved = true;
        resolveReady(products);
      }

      if (!isNextPage) {
        renderHomepageProducts();
      }

      window.ZaynXwearLogger?.info('catalog_loaded', {
        productCount: products.length,
        categoriesCount: categoryMap.size,
        familiesCount: productFamilies.length
      });

      document.dispatchEvent(new CustomEvent('zaynxwear:products-loaded', {
        detail: { products: [...products], families: [...productFamilies], isNextPage, hasMoreProducts }
      }));

      return products;
    } catch (error) {
      isFetching = false;
      loadState = 'error';
      window.ZaynXwearLogger?.error('catalog_load_failed', {}, error);

      if (grid && !isNextPage) {
        grid.innerHTML = errorState(error.message);
        document.getElementById('catalogRetryBtn')?.addEventListener('click', () => loadProducts({ forceRefresh: true }));
      }

      document.dispatchEvent(new CustomEvent('zaynxwear:products-error', {
        detail: { error }
      }));

      if (!isReadyResolved) {
        rejectReady?.(error);
      }

      throw error;
    }
  };

  const loadNextPage = () => loadProducts({ isNextPage: true });

  const catalogApi = {
    getProduct,
    getProducts,
    getFamilies,
    getFamily,
    getFamilyVarieties,
    getSiblingVarieties,
    formatPrice,
    calculateDiscountPercent,
    calculateEffectiveSalePrice,
    normalizeProduct,
    productCard,
    familyCard,
    catalogCard,
    getCatalogDisplayItems,
    skeletonCard,
    errorState,
    emptyState,
    renderHomepageProducts,
    loadProducts,
    loadNextPage,
    productsReady,
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  };

  Object.defineProperty(catalogApi, 'products', {
    get: () => products,
    enumerable: true,
    configurable: true
  });

  Object.defineProperty(catalogApi, 'families', {
    get: () => productFamilies,
    enumerable: true,
    configurable: true
  });

  Object.defineProperty(catalogApi, 'categories', {
    get: () => categories,
    enumerable: true,
    configurable: true
  });

  window.ZaynXwearProducts = catalogApi;
  window.ECommerceDemoProducts = catalogApi;

  // Auto-initiate dynamic fetch as early as possible
  const initFetch = () => {
    const params = new URLSearchParams(window.location.search);
    const search = params.get('q') || '';
    const categorySlug = params.get('category') || params.get('id') || '';
    loadProducts({ search, categorySlug }).catch(() => {});
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFetch);
  } else {
    initFetch();
  }
}());
