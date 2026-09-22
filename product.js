/* Reusable ZaynXwear product detail page with dynamic Supabase product loading. */
document.addEventListener('DOMContentLoaded', () => {
  const catalog = window.ZaynXwearProducts;
  const productPage = document.getElementById('productPage');
  const urlParams = new URLSearchParams(window.location.search);
  const productParam = (urlParams.get('product') || urlParams.get('id') || urlParams.get('slug') || '').trim();

  const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[character]));

  const setupMobileMenu = () => {
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    const menuIcon = document.getElementById('menuIcon');
    if (!menuToggle || !navMenu || !menuIcon) return;
    const media = window.matchMedia('(max-width: 860px)');
    const links = navMenu.querySelectorAll('a');
    const sync = (open = navMenu.classList.contains('open')) => {
      const hidden = media.matches && !open;
      navMenu.setAttribute('aria-hidden', String(hidden));
      navMenu.inert = hidden;
      links.forEach(link => hidden ? link.setAttribute('tabindex', '-1') : link.removeAttribute('tabindex'));
    };
    const close = () => {
      navMenu.classList.remove('open');
      menuIcon.innerHTML = '<use href="#icon-menu"></use>';
      menuToggle.setAttribute('aria-expanded', 'false');
      sync(false);
      document.body.style.overflow = '';
    };
    sync(false);
    media.addEventListener('change', close);
    menuToggle.addEventListener('click', () => {
      const open = navMenu.classList.toggle('open');
      menuIcon.innerHTML = open ? '<use href="#icon-close"></use>' : '<use href="#icon-menu"></use>';
      menuToggle.setAttribute('aria-expanded', String(open));
      sync(open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    links.forEach(link => link.addEventListener('click', close));
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && navMenu.classList.contains('open')) close(); });
  };

  setupMobileMenu();
  if (!productPage) return;

  // Show loading skeleton placeholder while catalog loads
  productPage.innerHTML = `
    <section class="pdp section">
      <div class="section-inner">
        <a class="pdp-back" href="index.html#shop"><svg class="ic"><use href="#icon-arrow"/></svg> Back to Shop</a>
        <div class="pdp-layout pdp-skeleton-layout" aria-hidden="true">
          <div class="pdp-gallery"><div class="skeleton-media skeleton-pdp-img"></div></div>
          <div class="pdp-info">
            <div class="skeleton-line skeleton-cat" style="width: 120px; height: 18px; margin-bottom: 12px;"></div>
            <div class="skeleton-line skeleton-title" style="width: 80%; height: 36px; margin-bottom: 16px;"></div>
            <div class="skeleton-line skeleton-price" style="width: 140px; height: 24px; margin-bottom: 24px;"></div>
            <div class="skeleton-line" style="width: 100%; height: 48px;"></div>
          </div>
        </div>
      </div>
    </section>`;

  const renderProduct = product => {
    if (!product || product.isActive === false) {
      document.title = 'Product Not Found | E-Commerce Demo';
      productPage.innerHTML = `
        <section class="pdp-not-found" style="text-align: center; padding: 80px 20px;">
          <p class="eyebrow">NOT FOUND</p>
          <h1 style="font-family: var(--font-display); font-size: clamp(28px, 4vw, 42px); margin: 12px 0 16px;">That fit is not here.</h1>
          <p style="color: var(--grey); max-width: 480px; margin: 0 auto 28px;">The product you are looking for is either unavailable or has ended its small-batch run.</p>
          <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
            <a class="btn btn-primary" href="index.html#shop">Shop All Drops</a>
            <a class="btn btn-outline" href="index.html#categories">Explore Categories</a>
          </div>
        </section>`;
      return;
    }

    document.title = `${product.name} | E-Commerce Demo`;

    const variants = product.variants || [];
    const colors = product.colors || [];
    const sizes = product.sizes || [];
    const hasMultipleVariants = variants.length > 1 || colors.length > 0 || sizes.length > 0;

    // Pick initial variant: first in-stock variant or first variant
    let activeVariant = variants.find(v => v.availableStock > 0) || variants[0] || null;
    let selectedColor = activeVariant?.color || colors[0] || null;
    let selectedSize = activeVariant?.size || sizes[0] || null;

    const getMatchingVariant = (color, size) => {
      if (!variants.length) return null;
      // 1. Exact match (both color and size match)
      const exact = variants.find(v => {
        const colorMatch = !color || (v.color && v.color.toLowerCase() === color.toLowerCase());
        const sizeMatch = !size || (v.size && v.size.toLowerCase() === size.toLowerCase());
        return colorMatch && sizeMatch;
      });
      if (exact) return exact;

      // 2. Color match fallback
      if (color) {
        const colorMatch = variants.find(v => v.color && v.color.toLowerCase() === color.toLowerCase());
        if (colorMatch) return colorMatch;
      }

      // 3. Size match fallback
      if (size) {
        const sizeMatch = variants.find(v => v.size && v.size.toLowerCase() === size.toLowerCase());
        if (sizeMatch) return sizeMatch;
      }

      return variants[0] || null;
    };

    activeVariant = getMatchingVariant(selectedColor, selectedSize) || activeVariant;

    // Resolve gallery images for a specific color
    const getImagesForColor = color => {
      if (color) {
        // Look for any variant of this color that has a non-empty image list
        const varWithImages = variants.find(v =>
          v.color &&
          v.color.toLowerCase() === color.toLowerCase() &&
          Array.isArray(v.images) &&
          v.images.length > 0
        );
        if (varWithImages && varWithImages.images.length > 0) {
          return varWithImages.images;
        }
      }

      // If activeVariant has images
      if (activeVariant && Array.isArray(activeVariant.images) && activeVariant.images.length > 0) {
        return activeVariant.images;
      }

      // Fallback to parent product images
      if (Array.isArray(product.images) && product.images.length > 0) {
        return product.images;
      }

      // Default fallback placeholder
      return ['images/ca2e03bc34d1c75b624003e138376397.jpg'];
    };

    const descriptionHtml = product.description
      ? `<div class="pdp-description"><p>${escapeHtml(product.description)}</p></div>`
      : '';

    const renderVariantsOptionsHtml = () => {
      if (!hasMultipleVariants) return '';
      let html = '';

      if (colors.length > 0) {
        html += `
          <div class="pdp-option-group" id="colorOptionGroup">
            <span class="pdp-option-label">Color: <strong id="selectedColorDisplay">${escapeHtml(selectedColor || '')}</strong></span>
            <div class="pdp-option-pills" role="radiogroup" aria-label="Select Color">
              ${colors.map(color => {
                const isSelected = selectedColor && color.toLowerCase() === selectedColor.toLowerCase();
                const hasColorStock = variants.some(v => v.color && v.color.toLowerCase() === color.toLowerCase() && v.availableStock > 0);
                return `<button type="button" class="pdp-option-pill${isSelected ? ' is-selected' : ''}${!hasColorStock ? ' is-out' : ''}" data-option-type="color" data-option-value="${escapeHtml(color)}" aria-checked="${isSelected}" role="radio">${escapeHtml(color)}</button>`;
              }).join('')}
            </div>
          </div>
        `;
      }

      if (sizes.length > 0) {
        html += `
          <div class="pdp-option-group" id="sizeOptionGroup">
            <span class="pdp-option-label">Size / Option: <strong id="selectedSizeDisplay">${escapeHtml(selectedSize || '')}</strong></span>
            <div class="pdp-option-pills" role="radiogroup" aria-label="Select Size">
              ${sizes.map(size => {
                const isSelected = selectedSize && size.toLowerCase() === selectedSize.toLowerCase();
                const varForSize = variants.find(v =>
                  (!selectedColor || (v.color && v.color.toLowerCase() === selectedColor.toLowerCase())) &&
                  v.size && v.size.toLowerCase() === size.toLowerCase()
                );
                const isSizeInStock = varForSize ? varForSize.availableStock > 0 : false;
                return `<button type="button" class="pdp-option-pill${isSelected ? ' is-selected' : ''}${!isSizeInStock ? ' is-out' : ''}" data-option-type="size" data-option-value="${escapeHtml(size)}" aria-checked="${isSelected}" role="radio">${escapeHtml(size)}${!isSizeInStock ? ' (Sold Out)' : ''}</button>`;
              }).join('')}
            </div>
          </div>
        `;
      }

      return `<div class="pdp-variants-wrapper">${html}</div>`;
    };

    const isOutOfStock = activeVariant ? activeVariant.availableStock <= 0 : product.availableStock <= 0;
    const currentStock = activeVariant ? activeVariant.availableStock : product.availableStock;
    const isLowStock = !isOutOfStock && currentStock <= 5;
    const currentSalePrice = activeVariant ? (activeVariant.salePrice ?? activeVariant.price ?? product.salePrice ?? product.price ?? 0) : (product.salePrice ?? product.price ?? 0);
    const currentMrp = activeVariant ? (activeVariant.mrp ?? activeVariant.salePrice ?? product.mrp ?? currentSalePrice) : (product.mrp ?? currentSalePrice);
    const initialDiscountPct = (currentMrp > currentSalePrice && currentMrp > 0 && currentSalePrice >= 0)
      ? Math.round(((currentMrp - currentSalePrice) / currentMrp) * 100)
      : 0;

    const stockBadge = isOutOfStock
      ? '<span class="stock-badge stock-badge-out" id="pdpStockBadge" style="display:inline-block;margin-left:10px;">Sold Out</span>'
      : isLowStock
        ? `<span class="stock-badge stock-badge-low" id="pdpStockBadge" style="display:inline-block;margin-left:10px;">Only ${currentStock} left</span>`
        : '<span class="stock-badge" id="pdpStockBadge" style="display:none;"></span>';

    // State for the color-based gallery
    let currentGalleryImages = [];
    let currentGalleryIndex = 0;
    let currentRenderedColor = null;

    const renderProductGallery = (images, activeIndex = 0) => {
      const validImages = Array.isArray(images) && images.length > 0
        ? images.filter(img => typeof img === 'string' && img.trim())
        : (Array.isArray(product.images) && product.images.length > 0 ? product.images : ['images/ca2e03bc34d1c75b624003e138376397.jpg']);

      const safeImages = validImages.length ? validImages : ['images/ca2e03bc34d1c75b624003e138376397.jpg'];
      currentGalleryImages = safeImages;
      currentGalleryIndex = Math.max(0, Math.min(activeIndex, safeImages.length - 1));

      const galleryContainer = productPage.querySelector('#pdpGalleryContainer');
      if (!galleryContainer) return;

      const mainImageSrc = safeImages[currentGalleryIndex] || safeImages[0];
      const colorLabel = selectedColor ? `${selectedColor} ` : '';

      const mainImageHtml = `
        <div class="pdp-main-image">
          <img id="pdpMainImage" src="${escapeHtml(mainImageSrc)}" alt="${escapeHtml(product.alt || product.name)}" fetchpriority="high" decoding="async">
        </div>
      `;

      const thumbnailsHtml = safeImages.length > 1
        ? `
          <div class="pdp-thumbnails" role="region" aria-label="${escapeHtml(product.name)} image gallery">
            ${safeImages.map((image, index) => {
              const isCurrent = index === currentGalleryIndex;
              return `
                <button type="button" class="pdp-thumbnail${isCurrent ? ' active' : ''}" data-gallery-index="${index}" data-image="${escapeHtml(image)}" aria-label="View image ${index + 1} of ${safeImages.length} for ${escapeHtml(colorLabel)}${escapeHtml(product.name)}" aria-pressed="${isCurrent}">
                  <img src="${escapeHtml(image)}" alt="" loading="lazy" decoding="async">
                </button>
              `;
            }).join('')}
          </div>
        `
        : '';

      galleryContainer.innerHTML = mainImageHtml + thumbnailsHtml;

      // Bind thumbnail click and keyboard handlers
      const mainImage = galleryContainer.querySelector('#pdpMainImage');
      const thumbnailButtons = Array.from(galleryContainer.querySelectorAll('.pdp-thumbnail'));

      thumbnailButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.galleryIndex, 10);
          if (!Number.isNaN(idx) && safeImages[idx]) {
            currentGalleryIndex = idx;
            if (mainImage) {
              mainImage.src = safeImages[idx];
              mainImage.alt = product.alt || product.name;
            }
            thumbnailButtons.forEach(tb => {
              const active = tb === btn;
              tb.classList.toggle('active', active);
              tb.setAttribute('aria-pressed', String(active));
            });
          }
        });
      });
    };

    const categoryLink = product.categorySlug ? `category.html?category=${encodeURIComponent(product.categorySlug)}` : 'index.html#categories';
    const categoryName = product.category || 'Collection';

    const familyBreadcrumbSubtitle = product.familyName && product.familyName !== product.name
      ? `<span class="eyebrow">${escapeHtml(product.category)} • ${escapeHtml(product.familyName)}</span>`
      : `<span class="eyebrow">${escapeHtml(product.category)}</span>`;

    const varietyBadgeHtml = product.varietyName
      ? `<div class="pdp-variety-badge">${escapeHtml(product.varietyName)}</div>`
      : '';

    productPage.innerHTML = `
      <section class="pdp section">
        <div class="section-inner">
          <nav class="category-breadcrumbs pdp-breadcrumbs" aria-label="Breadcrumb">
            <a href="index.html#home">Home</a>
            <span class="crumb-sep">/</span>
            <a href="${categoryLink}">${escapeHtml(categoryName)}</a>
            <span class="crumb-sep">/</span>
            <span class="crumb-current">${escapeHtml(product.name)}</span>
          </nav>
          <div class="pdp-layout">
            <div class="pdp-gallery" id="pdpGalleryContainer"></div>
            <div class="pdp-info">
              ${familyBreadcrumbSubtitle}
              ${varietyBadgeHtml}
              <h1>${escapeHtml(product.name)}</h1>
              <div class="pdp-price-row" id="pdpPriceContainer">
                <span class="price" id="pdpPriceDisplay">${catalog ? catalog.formatPrice(currentSalePrice) : `₹${currentSalePrice}`}</span>
                <span class="mrp-price" id="pdpMrpDisplay" style="${initialDiscountPct > 0 ? 'display:inline-flex;' : 'display:none;'}">
                  <span class="mrp-label">MRP</span> <span class="mrp-value" id="pdpMrpValue">${catalog ? catalog.formatPrice(currentMrp) : `₹${currentMrp}`}</span>
                </span>
                <span class="discount-badge" id="pdpDiscountBadge" style="${initialDiscountPct > 0 ? 'display:inline-flex;' : 'display:none;'}">${initialDiscountPct}% OFF</span>
                ${stockBadge}
              </div>
              ${descriptionHtml}
              ${renderVariantsOptionsHtml()}
              <div class="pdp-actions">
                <div class="pdp-quantity" id="pdpQuantityContainer" aria-label="Quantity" style="${isOutOfStock ? 'opacity:0.5;pointer-events:none;' : ''}">
                  <button type="button" id="pdpDecrease" aria-label="Decrease quantity">−</button>
                  <span id="pdpQuantity">1</span>
                  <button type="button" id="pdpIncrease" aria-label="Increase quantity">+</button>
                </div>
                <button class="btn btn-primary pdp-add${isOutOfStock ? ' is-sold-out' : ''}" id="pdpAdd" type="button"${isOutOfStock ? ' disabled' : ''}>${isOutOfStock ? 'Sold Out' : 'Add to Cart'}</button>
              </div>
              <p class="pdp-message" id="pdpMessage" aria-live="polite">${isOutOfStock ? 'This fit is currently out of stock. Follow our drops for restocks.' : ''}</p>
            </div>
          </div>
        </div>
      </section>`;

    // Initial render of gallery for selected color
    currentRenderedColor = selectedColor;
    renderProductGallery(getImagesForColor(selectedColor), 0);

    let quantity = 1;
    const quantityEl = document.getElementById('pdpQuantity');
    const updateQuantityLimits = () => {
      const maxQty = activeVariant ? (activeVariant.availableStock > 0 ? Math.min(10, activeVariant.availableStock) : 1) : Math.min(10, product.availableStock);
      quantity = Math.max(1, Math.min(quantity, maxQty));
      if (quantityEl) quantityEl.textContent = quantity;
    };

    document.getElementById('pdpDecrease')?.addEventListener('click', () => {
      if (quantity > 1) {
        quantity -= 1;
        if (quantityEl) quantityEl.textContent = quantity;
      }
    });

    document.getElementById('pdpIncrease')?.addEventListener('click', () => {
      const maxQty = activeVariant ? (activeVariant.availableStock > 0 ? Math.min(10, activeVariant.availableStock) : 1) : Math.min(10, product.availableStock);
      if (quantity < maxQty) {
        quantity += 1;
        if (quantityEl) quantityEl.textContent = quantity;
      }
    });

    const updateVariantSelectionState = (colorChanged = false) => {
      activeVariant = getMatchingVariant(selectedColor, selectedSize);

      // Update Displays
      const colorDisplay = document.getElementById('selectedColorDisplay');
      if (colorDisplay && selectedColor) colorDisplay.textContent = selectedColor;
      const sizeDisplay = document.getElementById('selectedSizeDisplay');
      if (sizeDisplay && selectedSize) sizeDisplay.textContent = selectedSize;

      // Update pills active states
      document.querySelectorAll('[data-option-type="color"]').forEach(btn => {
        const isSel = selectedColor && btn.dataset.optionValue.toLowerCase() === selectedColor.toLowerCase();
        btn.classList.toggle('is-selected', isSel);
        btn.setAttribute('aria-checked', String(isSel));
      });

      document.querySelectorAll('[data-option-type="size"]').forEach(btn => {
        const sizeVal = btn.dataset.optionValue;
        const isSel = selectedSize && sizeVal.toLowerCase() === selectedSize.toLowerCase();
        const vCheck = variants.find(v =>
          (!selectedColor || (v.color && v.color.toLowerCase() === selectedColor.toLowerCase())) &&
          v.size && v.size.toLowerCase() === sizeVal.toLowerCase()
        );
        const inStock = vCheck ? vCheck.availableStock > 0 : false;
        btn.classList.toggle('is-selected', isSel);
        btn.classList.toggle('is-out', !inStock);
        btn.textContent = inStock ? sizeVal : `${sizeVal} (Sold Out)`;
        btn.setAttribute('aria-checked', String(isSel));
      });

      // Price & Stock
      const vSalePrice = activeVariant ? (activeVariant.salePrice ?? activeVariant.price ?? product.salePrice ?? product.price ?? 0) : (product.salePrice ?? product.price ?? 0);
      const vMrp = activeVariant ? (activeVariant.mrp ?? activeVariant.salePrice ?? product.mrp ?? vSalePrice) : (product.mrp ?? vSalePrice);
      const vStock = activeVariant ? activeVariant.availableStock : product.availableStock;
      const vOutOfStock = vStock <= 0;
      const vLowStock = !vOutOfStock && vStock <= 5;

      const priceDisplay = document.getElementById('pdpPriceDisplay');
      if (priceDisplay) priceDisplay.textContent = catalog ? catalog.formatPrice(vSalePrice) : `₹${vSalePrice}`;

      const mrpDisplay = document.getElementById('pdpMrpDisplay');
      const mrpValue = document.getElementById('pdpMrpValue');
      const discountBadge = document.getElementById('pdpDiscountBadge');

      if (vMrp > vSalePrice && vMrp > 0 && vSalePrice >= 0) {
        const discountPct = Math.round(((vMrp - vSalePrice) / vMrp) * 100);
        if (discountPct > 0) {
          if (mrpValue) mrpValue.textContent = catalog ? catalog.formatPrice(vMrp) : `₹${vMrp}`;
          if (mrpDisplay) mrpDisplay.style.display = 'inline-flex';
          if (discountBadge) {
            discountBadge.textContent = `${discountPct}% OFF`;
            discountBadge.style.display = 'inline-flex';
          }
        } else {
          if (mrpDisplay) mrpDisplay.style.display = 'none';
          if (discountBadge) discountBadge.style.display = 'none';
        }
      } else {
        if (mrpDisplay) mrpDisplay.style.display = 'none';
        if (discountBadge) discountBadge.style.display = 'none';
      }

      const stockBadgeEl = document.getElementById('pdpStockBadge');
      if (stockBadgeEl) {
        if (vOutOfStock) {
          stockBadgeEl.className = 'stock-badge stock-badge-out';
          stockBadgeEl.textContent = 'Sold Out';
          stockBadgeEl.style.display = 'inline-block';
        } else if (vLowStock) {
          stockBadgeEl.className = 'stock-badge stock-badge-low';
          stockBadgeEl.textContent = `Only ${vStock} left`;
          stockBadgeEl.style.display = 'inline-block';
        } else {
          stockBadgeEl.style.display = 'none';
        }
      }

      // Add to Cart Button & Quantity state
      const addBtn = document.getElementById('pdpAdd');
      const qtyContainer = document.getElementById('pdpQuantityContainer');
      const msgEl = document.getElementById('pdpMessage');

      if (addBtn) {
        addBtn.disabled = vOutOfStock;
        addBtn.classList.toggle('is-sold-out', vOutOfStock);
        addBtn.textContent = vOutOfStock ? 'Sold Out' : 'Add to Cart';
      }
      if (qtyContainer) {
        qtyContainer.style.opacity = vOutOfStock ? '0.5' : '1';
        qtyContainer.style.pointerEvents = vOutOfStock ? 'none' : 'auto';
      }
      if (msgEl) {
        msgEl.textContent = vOutOfStock ? 'This combination is currently sold out.' : '';
      }

      // Re-render gallery if color changed or if gallery color is out of sync
      if (colorChanged || (selectedColor !== currentRenderedColor)) {
        currentRenderedColor = selectedColor;
        renderProductGallery(getImagesForColor(selectedColor), 0);
      } else if (!colors.length && activeVariant && Array.isArray(activeVariant.images) && activeVariant.images.length > 0) {
        // Edge case: single-color product with size-specific images
        const imagesForVariant = activeVariant.images;
        const isDifferent = imagesForVariant.length !== currentGalleryImages.length ||
          imagesForVariant.some((img, i) => img !== currentGalleryImages[i]);
        if (isDifferent) {
          renderProductGallery(imagesForVariant, 0);
        }
      }

      updateQuantityLimits();
    };

    // Bind option click events
    productPage.addEventListener('click', event => {
      const pill = event.target.closest('.pdp-option-pill');
      if (!pill) return;

      const type = pill.dataset.optionType;
      const val = pill.dataset.optionValue;

      if (type === 'color') {
        if (selectedColor && selectedColor.toLowerCase() === val.toLowerCase()) return;
        selectedColor = val;
        // If current selected size is out of stock in this new color, try to switch to an in-stock size
        const matchingCurrentSize = variants.find(v =>
          v.color && v.color.toLowerCase() === selectedColor.toLowerCase() &&
          v.size && selectedSize && v.size.toLowerCase() === selectedSize.toLowerCase() &&
          v.availableStock > 0
        );
        if (!matchingCurrentSize) {
          const firstInStockSize = variants.find(v =>
            v.color && v.color.toLowerCase() === selectedColor.toLowerCase() &&
            v.availableStock > 0
          );
          if (firstInStockSize && firstInStockSize.size) {
            selectedSize = firstInStockSize.size;
          }
        }
        updateVariantSelectionState(true);
      } else if (type === 'size') {
        if (selectedSize && selectedSize.toLowerCase() === val.toLowerCase()) return;
        selectedSize = val;
        updateVariantSelectionState(false);
      }
    });

    document.getElementById('pdpAdd')?.addEventListener('click', () => {
      if (isOutOfStock || (activeVariant && activeVariant.availableStock <= 0)) {
        window.ZaynXwearLogger?.warn('stock_check_failed', {
          productId: product.id,
          variantId: activeVariant?.id,
          availableStock: activeVariant ? activeVariant.availableStock : product.availableStock
        });
        return;
      }
      if (window.ZaynXwearCart?.addProduct(product.id, quantity, activeVariant)) {
        const msgEl = document.getElementById('pdpMessage');
        const varTitle = activeVariant && activeVariant.title && activeVariant.title !== 'Standard Fit'
          ? ` (${activeVariant.title})`
          : '';
        if (msgEl) msgEl.textContent = `${quantity} item${quantity > 1 ? 's' : ''}${varTitle} added to your cart.`;
      }
    });
  };

  const resolveAndRender = () => {
    if (!productParam) {
      renderProduct(null);
      return;
    }

    const product = catalog?.getProduct(productParam);
    if (product) {
      renderProduct(product);
    } else if (catalog?.productsReady) {
      catalog.productsReady.then(() => {
        renderProduct(catalog.getProduct(productParam));
      }).catch(() => {
        renderProduct(null);
      });
    } else {
      renderProduct(null);
    }
  };

  if (catalog?.productsReady) {
    catalog.productsReady.then(resolveAndRender).catch(() => renderProduct(null));
  } else {
    document.addEventListener('zaynxwear:products-loaded', resolveAndRender);
  }
});
