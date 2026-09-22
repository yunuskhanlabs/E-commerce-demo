/* Shared ZaynXwear cart for the storefront and product detail pages. */
(function () {
  const storageKey = 'ecommerce-demo-cart';
  const legacyStorageKey = 'zaynxwear-cart';
  const getCatalog = () => window.ZaynXwearProducts;
  const formatPrice = amount => (getCatalog()?.formatPrice ? getCatalog().formatPrice(amount) : `₹${amount}`);
  let cart = [];

  const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[character]));

  const normalizeCart = rawCart => {
    if (!Array.isArray(rawCart)) return [];
    const catalog = getCatalog();
    const catalogLoaded = catalog && typeof catalog.getProducts === 'function' && catalog.getProducts().length > 0;

    return rawCart.reduce((items, entry) => {
      if (!entry) return items;
      const id = String(entry.id || '').trim();
      const variantId = entry.variantId ? String(entry.variantId).trim() : null;
      const itemKey = entry.itemKey || (variantId ? `${id}:${variantId}` : id);
      const product = catalog?.getProduct(id) || (catalogLoaded ? catalog.getProducts().find(p => p.name === entry.name) : null);
      const quantity = Math.max(1, Math.min(10, Number.parseInt(entry.quantity, 10) || 1));

      if (product) {
        let variant = null;
        if (variantId && product.variants) {
          variant = product.variants.find(v => v.id === variantId);
        }

        const isUnavailable = product.isActive === false ||
          (variant ? (variant.isActive === false || variant.availableStock <= 0) : (Number.isFinite(product.availableStock) && product.availableStock <= 0));

        const price = variant ? (variant.price || product.price) : (Number(entry.price) || product.price);
        const variantTitle = variant?.title || entry.variantTitle || null;
        const color = variant?.color || entry.color || null;
        const size = variant?.size || entry.size || null;
        const maxStock = variant ? (variant.availableStock > 0 ? variant.availableStock : 10) : (product.availableStock > 0 ? product.availableStock : 10);

        items.push({
          id: product.id,
          variantId,
          itemKey,
          name: product.name,
          variantTitle,
          color,
          size,
          price,
          quantity: Math.min(quantity, Math.max(1, maxStock)),
          isUnavailable
        });
      } else if (id && entry.name && Number.isFinite(Number(entry.price))) {
        items.push({
          id,
          variantId,
          itemKey,
          name: String(entry.name),
          variantTitle: entry.variantTitle || null,
          color: entry.color || null,
          size: entry.size || null,
          price: Number(entry.price),
          quantity,
          isUnavailable: false
        });
      }
      return items;
    }, []);
  };

  const loadCart = () => {
    try {
      let raw = localStorage.getItem(storageKey);
      if (!raw) {
        // Migrate from legacy key if present
        const legacyRaw = localStorage.getItem(legacyStorageKey);
        if (legacyRaw) {
          localStorage.setItem(storageKey, legacyRaw);
          localStorage.removeItem(legacyStorageKey);
          raw = legacyRaw;
        }
      }
      cart = normalizeCart(JSON.parse(raw) || []);
    } catch {
      cart = [];
    }
  };

  const saveCart = () => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(cart));
    } catch {
      /* Storage may be unavailable. */
    }
  };

  const renderCart = () => {
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const cartEmpty = document.getElementById('cartEmpty');
    const cartSubtotal = document.getElementById('cartSubtotal');
    const checkoutBtn = document.getElementById('checkoutBtn');

    const activeItems = cart.filter(item => !item.isUnavailable);
    const itemCount = activeItems.reduce((total, item) => total + item.quantity, 0);
    const subtotal = activeItems.reduce((total, item) => total + item.price * item.quantity, 0);

    if (cartCount) cartCount.textContent = itemCount;
    if (cartSubtotal) cartSubtotal.textContent = formatPrice(subtotal);
    if (cartEmpty) cartEmpty.hidden = cart.length > 0;

    if (cartItems) {
      cartItems.innerHTML = cart.map(item => {
        const unavailableNotice = item.isUnavailable
          ? '<span class="cart-item-badge-unavailable">Currently Unavailable</span>'
          : '';

        const variantDetails = [];
        if (item.color) variantDetails.push(`Color: ${escapeHtml(item.color)}`);
        if (item.size) variantDetails.push(`Size: ${escapeHtml(item.size)}`);
        if (!variantDetails.length && item.variantTitle && item.variantTitle !== 'Standard Fit') {
          variantDetails.push(escapeHtml(item.variantTitle));
        }

        const variantSubtitleHtml = variantDetails.length
          ? `<span class="cart-item-variant">${variantDetails.join(' • ')}</span>`
          : '';

        return `
          <div class="cart-item${item.isUnavailable ? ' is-unavailable' : ''}">
            <div class="cart-item-details">
              <strong>${escapeHtml(item.name)}</strong>
              ${variantSubtitleHtml}
              ${unavailableNotice}
              <span>${formatPrice(item.price)} each</span>
            </div>
            <div class="cart-item-actions">
              <div class="quantity-control" aria-label="Quantity for ${escapeHtml(item.name)}">
                <button type="button" data-cart-action="decrease" data-cart-key="${escapeHtml(item.itemKey)}" aria-label="Decrease quantity">−</button>
                <span aria-label="${item.quantity} items">${item.quantity}</span>
                <button type="button" data-cart-action="increase" data-cart-key="${escapeHtml(item.itemKey)}" aria-label="Increase quantity">+</button>
              </div>
              <strong class="cart-line-total">${formatPrice(item.price * item.quantity)}</strong>
              <button class="cart-remove" type="button" data-cart-action="remove" data-cart-key="${escapeHtml(item.itemKey)}" aria-label="Remove ${escapeHtml(item.name)}">Remove</button>
            </div>
          </div>`;
      }).join('');
    }

    if (checkoutBtn) {
      checkoutBtn.disabled = !activeItems.length;
    }

    saveCart();
  };

  const addProduct = (productId, quantity = 1, variant = null) => {
    const catalog = getCatalog();
    const product = catalog?.getProduct(productId);
    if (!product) return false;

    // If no variant passed but product has variants, pick first in-stock variant
    let selectedVariant = variant;
    if (!selectedVariant && product.variants && product.variants.length > 0) {
      selectedVariant = product.variants.find(v => v.availableStock > 0) || product.variants[0];
    }

    const availableStock = selectedVariant ? selectedVariant.availableStock : product.availableStock;
    if (availableStock <= 0) return false;

    const variantId = selectedVariant?.id || null;
    const itemKey = variantId ? `${product.id}:${variantId}` : product.id;
    const maxAllowed = availableStock > 0 ? Math.min(10, availableStock) : 10;
    const amount = Math.max(1, Math.min(maxAllowed, Number.parseInt(quantity, 10) || 1));
    const price = selectedVariant?.price || product.price;

    const existing = cart.find(item => item.itemKey === itemKey);
    if (existing) {
      existing.quantity = Math.min(maxAllowed, existing.quantity + amount);
      existing.isUnavailable = false;
    } else {
      cart.push({
        id: product.id,
        variantId,
        itemKey,
        name: product.name,
        variantTitle: selectedVariant?.title || null,
        color: selectedVariant?.color || null,
        size: selectedVariant?.size || null,
        price,
        quantity: amount,
        isUnavailable: false
      });
    }
    renderCart();
    window.ZaynXwearLogger?.info('cart_item_added', {
      productId: product.id,
      variantId,
      quantity: amount,
      cartCount: cart.length
    });
    return true;
  };

  const changeQuantity = (itemKey, change) => {
    const item = cart.find(entry => entry.itemKey === itemKey || entry.id === itemKey);
    if (!item) return;
    const catalog = getCatalog();
    const product = catalog?.getProduct(item.id);
    let maxAllowed = 10;
    if (product) {
      if (item.variantId && product.variants) {
        const v = product.variants.find(varItem => varItem.id === item.variantId);
        if (v && v.availableStock > 0) maxAllowed = Math.min(10, v.availableStock);
      } else if (product.availableStock > 0) {
        maxAllowed = Math.min(10, product.availableStock);
      }
    }

    const previousQty = item.quantity;
    item.quantity = Math.max(0, Math.min(maxAllowed, item.quantity + change));
    if (item.quantity < 1) cart = cart.filter(entry => entry.itemKey !== item.itemKey);
    renderCart();
    window.ZaynXwearLogger?.info('cart_quantity_updated', {
      itemKey,
      previousQty,
      newQty: item.quantity,
      cartCount: cart.length
    });
  };

  const removeProduct = itemKey => {
    cart = cart.filter(item => item.itemKey !== itemKey && item.id !== itemKey);
    renderCart();
    window.ZaynXwearLogger?.info('cart_item_removed', {
      itemKey,
      cartCount: cart.length
    });
  };

  const clearCart = () => {
    cart = [];
    renderCart();
  };

  const setCartOpen = open => {
    const cartBtn = document.getElementById('cartBtn');
    const cartPanel = document.getElementById('cartPanel');
    const cartBackdrop = document.getElementById('cartBackdrop');
    const closeCart = document.getElementById('closeCart');
    if (!cartBtn || !cartPanel || !cartBackdrop) return;
    cartPanel.classList.toggle('open', open);
    cartPanel.setAttribute('aria-hidden', String(!open));
    cartBtn.setAttribute('aria-expanded', String(open));
    cartBackdrop.hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) closeCart?.focus();
  };

  const initCart = () => {
    loadCart();
    renderCart();

    const cartBtn = document.getElementById('cartBtn');
    const cartPanel = document.getElementById('cartPanel');
    const closeCart = document.getElementById('closeCart');
    const cartBackdrop = document.getElementById('cartBackdrop');
    const cartItems = document.getElementById('cartItems');
    const checkoutBtn = document.getElementById('checkoutBtn');

    cartBtn?.addEventListener('click', () => setCartOpen(!cartPanel?.classList.contains('open')));
    closeCart?.addEventListener('click', () => setCartOpen(false));
    cartBackdrop?.addEventListener('click', () => setCartOpen(false));
    checkoutBtn?.addEventListener('click', () => { window.location.href = 'checkout.html'; });

    cartItems?.addEventListener('click', event => {
      const button = event.target.closest('[data-cart-action]');
      if (!button) return;
      const key = button.dataset.cartKey || button.dataset.cartId;
      if (button.dataset.cartAction === 'increase') changeQuantity(key, 1);
      if (button.dataset.cartAction === 'decrease') changeQuantity(key, -1);
      if (button.dataset.cartAction === 'remove') removeProduct(key);
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && cartPanel?.classList.contains('open')) setCartOpen(false);
    });

    // Revalidate cart items when dynamic catalog loads
    document.addEventListener('zaynxwear:products-loaded', () => {
      loadCart();
      renderCart();
    });
  };

  window.ZaynXwearCart = {
    addProduct,
    changeQuantity,
    removeProduct,
    clearCart,
    renderCart,
    setCartOpen,
    getCart: () => [...cart]
  };
  // Alias for new naming convention
  window.ECommerceDemoCart = window.ZaynXwearCart;

  document.addEventListener('DOMContentLoaded', initCart);
}());
