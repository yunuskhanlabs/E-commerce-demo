document.addEventListener('DOMContentLoaded', () => {
  const isDemo = Boolean(window.ZaynXwearAdminConfig?.isDemoMode || !window.ZaynXwearAdminConfig?.supabaseUrl);
  const baseUrl = window.ZaynXwearAdminConfig?.supabaseUrl || '';
  const endpoints = {
    cod: baseUrl ? `${baseUrl}/functions/v1/create-order` : '',
    razorpayOrder: baseUrl ? `${baseUrl}/functions/v1/create-razorpay-order` : '',
    razorpayVerify: baseUrl ? `${baseUrl}/functions/v1/verify-razorpay-payment` : '',
    couponRpc: baseUrl ? `${baseUrl}/rest/v1/rpc/validate_and_apply_coupon` : '',
    anonKey: window.ZaynXwearAdminConfig?.supabaseAnonKey || ''
  };
  const checkoutContent = document.getElementById('checkoutContent');
  const cartApi = window.ZaynXwearCart;
  const rawCart = cartApi?.getCart() || [];
  const cart = rawCart.filter(item => !item.isUnavailable && item.quantity > 0);
  const formatPrice = amount => '₹' + Number(amount).toLocaleString('en-IN');
  if (!checkoutContent) return;
  if (!cart.length) {
    checkoutContent.innerHTML = `<section class="checkout-empty-state"><p class="eyebrow">CHECKOUT</p><h1>Your cart is empty</h1><p>Add a fit before continuing to checkout.</p><a class="btn btn-primary" href="index.html#shop">Back to Shop</a></section>`;
    return;
  }
  const rawSubtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  let appliedCoupon = null; // { code, discountPaise, subtotalPaise, totalPaise, message }

  const renderItemVariantSubtitle = item => {
    const details = [];
    if (item.color) details.push(`Color: ${escapeHtml(item.color)}`);
    if (item.size) details.push(`Size: ${escapeHtml(item.size)}`);
    if (!details.length && item.variantTitle && item.variantTitle !== 'Standard Fit') {
      details.push(escapeHtml(item.variantTitle));
    }
    return details.length ? `<span class="checkout-item-variant">${details.join(' • ')}</span>` : '';
  };

  const summaryItems = cart.map(item => `
    <div class="checkout-item">
      <div>
        <strong>${escapeHtml(item.name)}</strong>
        ${renderItemVariantSubtitle(item)}
        <span>Qty: ${item.quantity} × ${formatPrice(item.price)}</span>
      </div>
      <strong>${formatPrice(item.price * item.quantity)}</strong>
    </div>
  `).join('');

  checkoutContent.innerHTML = `
    <div class="checkout-heading"><p class="eyebrow">SECURE CHECKOUT</p><h1>Complete your order</h1><p>Review your details and choose a payment method.</p></div>
    <div id="checkoutAuthContainer"></div>
    <div class="checkout-layout">
      <form class="checkout-form" id="checkoutForm" novalidate>
        <section class="checkout-card"><h2>Customer Information</h2><div class="checkout-fields">${field('fullName', 'Full Name', 'text', true, 'Your full name')}${field('mobile', 'Mobile Number', 'tel', true, '10-digit mobile number', 'inputmode="numeric" autocomplete="tel"')}${field('email', 'Email (optional)', 'email', false, 'you@example.com', 'autocomplete="email"')}</div></section>
        <section class="checkout-card"><h2>Shipping Address</h2><div class="checkout-fields">${field('address', 'House/Street Address', 'text', true, 'House number, street, area', 'autocomplete="street-address"')}${field('city', 'City', 'text', true, 'Your city', 'autocomplete="address-level2"')}${field('state', 'State', 'text', true, 'Your state', 'autocomplete="address-level1"')}${field('pincode', 'Pincode', 'text', true, '6-digit pincode', 'inputmode="numeric" autocomplete="postal-code"')}</div></section>
        <section class="checkout-card checkout-payment"><h2>Payment</h2><div class="payment-method"><input id="paymentCod" name="payment" value="cod" type="radio" checked><label for="paymentCod"><strong>Cash on Delivery (COD)</strong><span>Pay when your order arrives</span></label></div><div class="payment-method"><input id="paymentOnline" name="payment" value="razorpay" type="radio"><label for="paymentOnline"><div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; margin-bottom: 2px;"><strong>Online Payment</strong><span class="prepaid-discount-badge" id="prepaidOfferBadge" style="display: none;">Pay Online &amp; Get 5% OFF</span></div><span>Secure Razorpay checkout</span></label></div><p class="checkout-note">Online payments are processed securely through Razorpay.</p></section>
        <button class="btn btn-primary checkout-submit" type="submit">Place Order</button><p class="checkout-request-status" id="checkoutRequestStatus" aria-live="polite" role="status"></p>
      </form>
      <aside class="checkout-card checkout-summary-card" id="checkoutSummaryCard" aria-label="Order summary"></aside>
    </div>`;

  const form = document.getElementById('checkoutForm');
  const authContainer = document.getElementById('checkoutAuthContainer');
  const submitButton = form.querySelector('.checkout-submit');
  const requestStatus = document.getElementById('checkoutRequestStatus');

  let currentAuthUser = null;
  let currentAuthSession = null;

  const authGateHtml = `
    <div class="checkout-auth-gate">
      <div class="checkout-auth-banner">
        <div class="checkout-auth-banner-left">
          <div class="checkout-auth-icon">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" fill="none" stroke="currentColor" stroke-width="2"/>
              <circle cx="12" cy="7" r="4" fill="none" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <div class="checkout-auth-content">
            <h3 class="checkout-auth-title">Demo Login</h3>
            <p class="checkout-auth-desc">Tap Login to continue — demo number &amp; OTP pre-filled, no real OTP sent.</p>
          </div>
        </div>
        <button class="btn btn-primary checkout-auth-login-btn" id="checkoutLoginBtn" type="button">
          Login / Signup
        </button>
      </div>
    </div>
  `;

  const syncAuthCheckoutUI = (user, session) => {
    currentAuthUser = user;
    currentAuthSession = session;

    if (user && authContainer) {
      const userMobile = user.user_metadata?.mobile || user.phone?.replace(/^\+91/, '') || '';
      const displayLabel = userMobile ? `+91 ${userMobile.slice(0, 5)} ${userMobile.slice(5)}` : 'Customer';

      authContainer.innerHTML = `
        <div class="checkout-user-badge">
          <svg viewBox="0 0 24 24" width="16" height="16"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="7" r="4" fill="none" stroke="currentColor" stroke-width="2"/></svg>
          <span>Signed in as <strong>${escapeHtml(displayLabel)}</strong></span>
        </div>
      `;
      // Prefill fields if empty
      const mobileInput = form.elements['mobile'];
      if (mobileInput && !mobileInput.value && userMobile) {
        mobileInput.value = userMobile;
      }
    } else if (authContainer) {
      authContainer.innerHTML = authGateHtml;
      const loginBtn = authContainer.querySelector('#checkoutLoginBtn');
      if (loginBtn) {
        loginBtn.addEventListener('click', () => {
          window.ZaynXwearAuth?.openAuthModal((u, s) => syncAuthCheckoutUI(u, s));
        });
      }
    }
  };

  // Check initial session
  if (window.ZaynXwearAuth) {
    window.ZaynXwearAuth.getSession().then(session => {
      syncAuthCheckoutUI(session?.user || null, session);
    });
  } else {
    syncAuthCheckoutUI(null, null);
  }

  window.onZaynXwearAuthChanged = (user) => {
    syncAuthCheckoutUI(user, null);
  };

  const summaryCard = document.getElementById('checkoutSummaryCard');

  let prepaidOfferSettings = null;

  let activePrepaidSlabInfo = null;

  const updatePrepaidOfferBadgeUI = () => {
    const badge = document.getElementById('prepaidOfferBadge');
    if (!badge) return;
    if (prepaidOfferSettings && prepaidOfferSettings.is_enabled && prepaidOfferSettings.is_currently_active) {
      if (prepaidOfferSettings.offer_mode === 'tiered' && activePrepaidSlabInfo) {
        const minValRupees = (activePrepaidSlabInfo.min_order_value_paise / 100).toLocaleString('en-IN');
        const discValText = activePrepaidSlabInfo.discount_type === 'percentage'
          ? `${activePrepaidSlabInfo.discount_value}%`
          : `₹${activePrepaidSlabInfo.discount_value}`;
        badge.textContent = `Pay Online & Save ${discValText} (₹${minValRupees}+ Offer)`;
      } else if (prepaidOfferSettings.offer_mode === 'tiered' && Array.isArray(prepaidOfferSettings.slabs) && prepaidOfferSettings.slabs.length > 0) {
        badge.textContent = prepaidOfferSettings.offer_text || 'Pay Online & Save with Tiered Offers';
      } else {
        badge.textContent = prepaidOfferSettings.offer_text || 'Pay Online & Get Discount';
      }
      badge.style.display = 'inline-block';
    } else {
      badge.style.display = 'none';
    }
  };

  const fetchPrepaidOfferSettings = async () => {
    if (isDemo || !endpoints.anonKey) {
      prepaidOfferSettings = {
        is_enabled: true,
        is_currently_active: true,
        offer_mode: 'single',
        discount_type: 'percentage',
        discount_value: 5,
        offer_text: 'Pay Online & Get 5% OFF'
      };
      updatePrepaidOfferBadgeUI();
      updateSummaryUI();
      return;
    }
    try {
      const rpcUrl = baseUrl ? `${baseUrl}/rest/v1/rpc/get_active_prepaid_offer` : '';
      if (!rpcUrl) return;
      const res = await fetch(rpcUrl, {
        method: 'POST',
        headers: {
          'apikey': endpoints.anonKey,
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data[0]) {
          prepaidOfferSettings = data[0];
          updatePrepaidOfferBadgeUI();
          updateSummaryUI();
        }
      }
    } catch (err) {
      console.warn('Failed to fetch prepaid offer settings:', err);
    }
  };

  const calculatePrepaidDiscount = (netSubtotal, selectedPayment) => {
    activePrepaidSlabInfo = null;
    if (selectedPayment !== 'razorpay') return 0;
    if (!prepaidOfferSettings || !prepaidOfferSettings.is_enabled || !prepaidOfferSettings.is_currently_active) return 0;

    const mode = prepaidOfferSettings.offer_mode || 'single';

    if (mode === 'tiered' && Array.isArray(prepaidOfferSettings.slabs)) {
      const netSubtotalPaise = Math.round(netSubtotal * 100);
      const eligibleSlabs = prepaidOfferSettings.slabs.filter(s => s.is_enabled && s.min_order_value_paise <= netSubtotalPaise);

      if (eligibleSlabs.length === 0) return 0;

      eligibleSlabs.sort((a, b) => b.min_order_value_paise - a.min_order_value_paise);
      const winningSlab = eligibleSlabs[0];
      activePrepaidSlabInfo = winningSlab;

      let discount = 0;
      if (winningSlab.discount_type === 'percentage') {
        const pct = Math.min(100, Math.max(0, Number(winningSlab.discount_value) || 0));
        discount = (netSubtotal * pct) / 100;
      } else if (winningSlab.discount_type === 'fixed') {
        discount = Number(winningSlab.discount_value) || 0;
      }

      if (discount < 0) discount = 0;
      if (discount > netSubtotal) discount = netSubtotal;
      return Math.round(discount * 100) / 100;
    }

    // Single Offer Mode
    const minOrderRupees = prepaidOfferSettings.min_order_value_paise ? (prepaidOfferSettings.min_order_value_paise / 100) : 0;
    if (minOrderRupees > 0 && netSubtotal < minOrderRupees) return 0;

    let discount = 0;
    if (prepaidOfferSettings.discount_type === 'percentage') {
      const pct = Math.min(100, Math.max(0, Number(prepaidOfferSettings.discount_value) || 0));
      discount = (netSubtotal * pct) / 100;
      const maxCapRupees = prepaidOfferSettings.max_discount_paise ? (prepaidOfferSettings.max_discount_paise / 100) : null;
      if (maxCapRupees !== null && maxCapRupees > 0 && discount > maxCapRupees) {
        discount = maxCapRupees;
      }
    } else if (prepaidOfferSettings.discount_type === 'fixed') {
      discount = Number(prepaidOfferSettings.discount_value) || 0;
    }

    if (discount < 0) discount = 0;
    if (discount > netSubtotal) discount = netSubtotal;
    return Math.round(discount * 100) / 100;
  };

  const updateSummaryUI = (statusMessage = '', isError = false, isSuccess = false) => {
    if (!summaryCard) return;
    const selectedPayment = form ? (form.elements['payment']?.value || 'cod') : 'cod';
    const subtotalAmount = appliedCoupon ? (appliedCoupon.subtotalPaise / 100) : rawSubtotal;
    const couponDiscountAmount = appliedCoupon ? (appliedCoupon.discountPaise / 100) : 0;
    const netSubtotal = Math.max(0, subtotalAmount - couponDiscountAmount);

    const prepaidDiscountAmount = calculatePrepaidDiscount(netSubtotal, selectedPayment);
    const finalTotal = Math.max(0, netSubtotal - prepaidDiscountAmount);

    let couponHtml = '';
    if (appliedCoupon) {
      couponHtml = `
        <div class="checkout-coupon-applied">
          <div class="checkout-coupon-applied-info">
            <span class="checkout-coupon-code-pill">${escapeHtml(appliedCoupon.code)}</span>
            <span class="checkout-coupon-saved-text">You save ${formatPrice(couponDiscountAmount)}</span>
          </div>
          <button type="button" class="checkout-coupon-remove-btn" id="removeCouponBtn" aria-label="Remove coupon ${escapeHtml(appliedCoupon.code)}">Remove</button>
        </div>
      `;
    } else {
      couponHtml = `
        <form class="checkout-coupon-form" id="couponForm" novalidate>
          <input class="checkout-coupon-input" id="couponCodeInput" type="text" placeholder="COUPON CODE" autocomplete="off" spellcheck="false" maxlength="30" aria-label="Coupon code">
          <button class="btn btn-outline checkout-coupon-btn" id="applyCouponBtn" type="submit">Apply</button>
        </form>
        <p class="checkout-coupon-status ${isError ? 'is-error' : ''} ${isSuccess ? 'is-success' : ''}" id="couponStatusMsg" aria-live="polite" role="status">${escapeHtml(statusMessage)}</p>
      `;
    }

    const couponRowHtml = (appliedCoupon && couponDiscountAmount > 0)
      ? `<div class="checkout-totals checkout-discount-row"><span>Coupon (${escapeHtml(appliedCoupon.code)})</span><strong>-${formatPrice(couponDiscountAmount)}</strong></div>`
      : '';

    let prepaidLabel = 'Prepaid Discount';
    if (prepaidOfferSettings?.offer_mode === 'tiered' && activePrepaidSlabInfo) {
      const minValRupees = (activePrepaidSlabInfo.min_order_value_paise / 100).toLocaleString('en-IN');
      prepaidLabel = `Prepaid Discount (₹${minValRupees}+ Offer)`;
    }

    const prepaidRowHtml = (selectedPayment === 'razorpay' && prepaidDiscountAmount > 0)
      ? `<div class="checkout-totals checkout-discount-row"><span>${escapeHtml(prepaidLabel)}</span><strong style="color: #059669;">-${formatPrice(prepaidDiscountAmount)}</strong></div>`
      : '';

    summaryCard.innerHTML = `
      <h2>Order Summary</h2>
      <div class="checkout-items">${summaryItems}</div>
      <div class="checkout-coupon-section" id="checkoutCouponSection">
        ${couponHtml}
      </div>
      <div class="checkout-totals"><span>Subtotal</span><strong>${formatPrice(subtotalAmount)}</strong></div>
      ${couponRowHtml}
      ${prepaidRowHtml}
      <div class="checkout-totals checkout-total"><span>Total</span><strong>${formatPrice(finalTotal)}</strong></div>
    `;

    updatePrepaidOfferBadgeUI();

    // Wire up coupon form event listeners
    const couponForm = document.getElementById('couponForm');
    const couponInput = document.getElementById('couponCodeInput');
    const removeBtn = document.getElementById('removeCouponBtn');

    if (couponInput) {
      couponInput.addEventListener('input', () => {
        couponInput.value = couponInput.value.toUpperCase();
      });
    }

    if (couponForm) {
      couponForm.addEventListener('submit', async event => {
        event.preventDefault();
        const code = (couponInput?.value || '').trim().toUpperCase();
        if (!code) {
          updateSummaryUI('Please enter a coupon code.', true);
          return;
        }

        const applyBtn = document.getElementById('applyCouponBtn');
        if (applyBtn) {
          applyBtn.disabled = true;
          applyBtn.textContent = '…';
        }

        if (isDemo || !endpoints.anonKey) {
          const discountPct = (code === 'WELCOME10' || code === 'DEMO10') ? 10 : (code === 'STREET20' ? 20 : 15);
          const rawSubtotalPaise = Math.round(rawSubtotal * 100);
          const discountPaise = Math.round(rawSubtotalPaise * (discountPct / 100));
          const totalPaise = Math.max(0, rawSubtotalPaise - discountPaise);

          appliedCoupon = {
            code: code,
            discountPaise: discountPaise,
            subtotalPaise: rawSubtotalPaise,
            totalPaise: totalPaise,
            message: `Coupon ${code} applied! (${discountPct}% OFF)`
          };

          idempotencyKey = undefined;
          updateSummaryUI(`Coupon ${code} applied! (${discountPct}% OFF)`, false, true);
          if (applyBtn) {
            applyBtn.disabled = false;
            applyBtn.textContent = 'Apply';
          }
          return;
        }

        try {
          const rpcResponse = await fetch(endpoints.couponRpc, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': endpoints.anonKey
            },
            body: JSON.stringify({
              p_coupon_code: code,
              p_items: cart.map(item => ({
                product_id: item.id,
                variant_id: item.variantId || undefined,
                quantity: item.quantity
              }))
            })
          });

          const rpcData = await rpcResponse.json().catch(() => null);

          if (!rpcResponse.ok || !rpcData || !rpcData[0]) {
            appliedCoupon = null;
            idempotencyKey = undefined;
            const errorMsg = rpcData?.message || 'Unable to apply coupon. Please try again.';
            updateSummaryUI(errorMsg, true);
            window.ZaynXwearLogger?.warn('coupon_application_failed', { couponCode: code, reason: errorMsg });
            return;
          }

          const result = rpcData[0];
          const isValid = Boolean(result.valid ?? result.is_valid);
          if (!isValid) {
            appliedCoupon = null;
            idempotencyKey = undefined;
            updateSummaryUI(result.message || 'Invalid coupon code.', true);
            window.ZaynXwearLogger?.warn('coupon_application_rejected', { couponCode: code, reason: result.message });
            return;
          }

          appliedCoupon = {
            code: result.coupon_code,
            discountPaise: Number(result.discount_paise) || 0,
            subtotalPaise: Number(result.subtotal_paise) || 0,
            totalPaise: Number(result.total_paise) || 0,
            message: result.message
          };

          idempotencyKey = undefined; // reset key so coupon changes recalculate cleanly
          updateSummaryUI(result.message || `Coupon ${result.coupon_code} applied!`, false, true);
          window.ZaynXwearLogger?.info('coupon_applied', {
            couponCode: result.coupon_code,
            discountPaise: Number(result.discount_paise),
            totalPaise: Number(result.total_paise)
          });
        } catch (err) {
          appliedCoupon = null;
          idempotencyKey = undefined;
          updateSummaryUI('Unable to validate coupon. Please check your connection.', true);
          window.ZaynXwearLogger?.error('coupon_rpc_error', { couponCode: code }, err);
        }
      });
    }

    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        const removedCode = appliedCoupon?.code;
        appliedCoupon = null;
        idempotencyKey = undefined;
        updateSummaryUI('Coupon removed.');
        window.ZaynXwearLogger?.info('coupon_removed', { couponCode: removedCode });
      });
    }
  };

  updateSummaryUI();
  window.ZaynXwearLogger?.info('checkout_started', {
    itemCount: cart.length,
    subtotalPaise: Math.round(rawSubtotal * 100)
  });

  fetchPrepaidOfferSettings();

  let idempotencyKey;
  const setRequestStatus = (message = '', isError = false) => { requestStatus.textContent = message; requestStatus.classList.toggle('is-error', isError); };
  form.addEventListener('input', () => { idempotencyKey = undefined; });
  form.addEventListener('change', event => {
    if (event.target.name === 'payment') {
      idempotencyKey = undefined;
      updateSummaryUI();
    }
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (submitButton.disabled) return;

    // Check if customer is authenticated
    const activeSession = await window.ZaynXwearAuth?.getSession();
    if (!activeSession || !activeSession.user) {
      window.ZaynXwearLogger?.warn('checkout_auth_required', { action: 'place_order' });
      setRequestStatus('Please login with your mobile number to place your order.', true);
      window.ZaynXwearAuth?.openAuthModal((u, s) => {
        syncAuthCheckoutUI(u, s);
        setRequestStatus('');
        // Automatically continue to order placement once verified
        setTimeout(() => form.requestSubmit(), 100);
      });
      return;
    }

    const values = Object.fromEntries(new FormData(form));
    const errors = validate(values);
    clearErrors(form); setRequestStatus();
    if (Object.keys(errors).length) {
      window.ZaynXwearLogger?.warn('checkout_validation_failed', { fields: Object.keys(errors) });
      Object.entries(errors).forEach(([name, message]) => showError(form, name, message));
      form.querySelector(`[name="${Object.keys(errors)[0]}"]`)?.focus();
      return;
    }
    const paymentMethod = values.payment === 'razorpay' ? 'razorpay' : 'cod';
    idempotencyKey ||= createIdempotencyKey();
    submitButton.disabled = true; submitButton.textContent = paymentMethod === 'cod' ? 'Placing Order…' : 'Opening Secure Payment…'; form.setAttribute('aria-busy', 'true');
    window.ZaynXwearLogger?.info('order_creation_started', {
      paymentMethod,
      itemCount: cart.length,
      hasCoupon: Boolean(appliedCoupon)
    });
    const requestBody = {
      customer: { fullName: values.fullName.trim(), mobile: values.mobile.trim(), email: values.email.trim() || null },
      shippingAddress: { address: values.address.trim(), city: values.city.trim(), state: values.state.trim(), pincode: values.pincode.trim() },
      items: cart.map(item => ({
        productId: item.id,
        variantId: item.variantId || undefined,
        quantity: item.quantity
      })),
      idempotencyKey,
      couponCode: (appliedCoupon && typeof appliedCoupon.code === 'string' && appliedCoupon.code.trim()) ? appliedCoupon.code.trim() : undefined
    };
    try {
      if (isDemo || !endpoints.cod) {
        const orderRef = 'ZX-' + Math.floor(100000 + Math.random() * 900000);
        const subtotalPaise = Math.round(rawSubtotal * 100);
        const discountPaise = appliedCoupon ? appliedCoupon.discountPaise : 0;
        const totalPaise = Math.max(0, subtotalPaise - discountPaise);

        const demoOrder = {
          orderId: 'demo-ord-' + Date.now(),
          reference: orderRef,
          customer_full_name: values.fullName.trim(),
          customer_mobile: values.mobile.trim(),
          customer_email: values.email.trim() || null,
          shipping_address: `${values.address.trim()}, ${values.city.trim()}, ${values.state.trim()} - ${values.pincode.trim()}`,
          subtotal_paise: subtotalPaise,
          total_paise: totalPaise,
          total: totalPaise,
          currency: 'INR',
          payment_method: paymentMethod,
          payment_status: paymentMethod === 'razorpay' ? 'completed' : 'pending',
          order_status: 'confirmed',
          created_at: new Date().toISOString(),
          items: cart.map(item => ({
            product_id: item.id,
            product_name: item.name,
            variant_title: item.variantTitle || null,
            color: item.color || null,
            size: item.size || null,
            unit_price_paise: Math.round(item.price * 100),
            quantity: item.quantity,
            line_total_paise: Math.round(item.price * item.quantity * 100)
          }))
        };

        try {
          const ordersKey = 'ecommerce-demo-orders';
          // Also read legacy key and merge on first save
          let existing = JSON.parse(localStorage.getItem(ordersKey) || 'null');
          if (!existing) {
            existing = JSON.parse(localStorage.getItem('zaynxwear-demo-orders') || '[]');
            localStorage.removeItem('zaynxwear-demo-orders');
          }
          existing.unshift(demoOrder);
          localStorage.setItem(ordersKey, JSON.stringify(existing));
        } catch (e) {}

        window.ZaynXwearLogger?.info('demo_order_created', { orderRef, totalPaise });
        showConfirmation(
          { orderId: demoOrder.orderId, reference: orderRef, total: totalPaise },
          values,
          paymentMethod === 'razorpay' ? 'Online Payment (Demo)' : 'Cash on Delivery',
          'Your demo order has been received successfully!',
          appliedCoupon
        );
        return;
      }

      if (paymentMethod === 'cod') {
        const result = await postJson(endpoints.cod, { ...requestBody, paymentMethod: 'cod' }, 'We could not place your order. Please try again.');
        window.ZaynXwearLogger?.info('cod_order_created', {
          orderId: result.orderId,
          orderReference: result.reference,
          totalPaise: Number(result.total)
        });
        window.ZaynXwearLogger?.info('order_created', {
          orderId: result.orderId,
          orderReference: result.reference,
          paymentMethod: 'cod',
          totalPaise: Number(result.total)
        });
        showConfirmation(result, values, 'Cash on Delivery', 'Your Cash on Delivery order has been received.', appliedCoupon);
      } else {
        const order = await postJson(endpoints.razorpayOrder, requestBody, 'We could not start online payment. Please try again.');
        if (!window.Razorpay || typeof order.keyId !== 'string' || !order.keyId.startsWith('rzp_test_') || !Number.isSafeInteger(Number(order.amount)) || Number(order.amount) < 0 || typeof order.orderId !== 'string' || typeof order.currency !== 'string') throw new Error('We received an invalid payment order. Please try again.');
        window.ZaynXwearLogger?.info('payment_initiated', {
          razorpayOrderId: order.orderId,
          amountPaise: Number(order.amount),
          currency: order.currency
        });
        setRequestStatus('Complete payment in the Razorpay window.');
        const payment = await openRazorpay({ key: order.keyId, amount: Number(order.amount), currency: order.currency, orderId: order.orderId, customer: requestBody.customer });
        window.ZaynXwearLogger?.info('payment_success', {
          razorpayOrderId: payment.razorpay_order_id,
          razorpayPaymentId: payment.razorpay_payment_id
        });
        const result = await postJson(endpoints.razorpayVerify, payment, 'We could not verify this payment. Your order has not been confirmed yet.');
        window.ZaynXwearLogger?.info('order_created', {
          orderId: result.orderId,
          orderReference: result.reference,
          paymentMethod: 'razorpay',
          totalPaise: Number(result.total)
        });
        showConfirmation(result, values, 'Online Payment (Razorpay)', 'Your payment was verified and your order has been received.', appliedCoupon);
      }
    } catch (error) {
      window.ZaynXwearLogger?.error('order_creation_failed', { paymentMethod }, error);
      const message = error instanceof TypeError ? 'We could not reach the order service. Please check your connection and try again.' : error instanceof Error ? error.message : 'We could not place your order. Please try again.';
      setRequestStatus(message, true);
    } finally { form.setAttribute('aria-busy', 'false'); submitButton.disabled = false; submitButton.textContent = 'Place Order'; }
  });
});

async function postJson(endpoint, body, fallback) {
  let response;
  const session = await window.ZaynXwearAuth?.getSession();
  const token = session?.access_token;
  if (!token) {
    window.ZaynXwearLogger?.warn('checkout_auth_required', { endpoint });
    throw new Error('Please sign in or create an account to place your order.');
  }

  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });
  } catch {
    throw new TypeError('Network request failed.');
  }
  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.success) {
    const serverMessage = (result && typeof result.error === 'string' && result.error.trim()) ? result.error.trim() : fallback;
    throw new Error(serverMessage);
  }
  return result;
}

function openRazorpay({ key, amount, currency, orderId, customer }) {
  return new Promise((resolve, reject) => {
    let completed = false;
    const checkout = new window.Razorpay({
      key,
      amount,
      currency,
      order_id: orderId,
      name: 'E-Commerce Demo',
      description: 'E-Commerce Demo order',
      prefill: { name: customer.fullName, email: customer.email || '', contact: customer.mobile },
      theme: { color: '#111111' },
      handler: response => { completed = true; resolve(response); },
      modal: {
        ondismiss: () => {
          if (!completed) {
            window.ZaynXwearLogger?.warn('payment_cancelled', { razorpayOrderId: orderId });
            reject(new Error('Payment was cancelled. Your order has not been confirmed.'));
          }
        }
      }
    });
    checkout.on('payment.failed', response => {
      window.ZaynXwearLogger?.error('payment_failed', { razorpayOrderId: orderId, reason: response?.error?.description || 'Gateway failure' });
      reject(new Error('Payment failed. Please try again or choose Cash on Delivery.'));
    });
    checkout.open();
  });
}

function showConfirmation(result, values, paymentLabel, message, appliedCoupon = null) {
  const checkoutContent = document.getElementById('checkoutContent');
  const cartApi = window.ZaynXwearCart;
  const cart = cartApi?.getCart() || [];
  const formatPrice = amount => '₹' + Number(amount).toLocaleString('en-IN');
  const serverTotalPaise = Number(result.total);
  if (!Number.isSafeInteger(serverTotalPaise) || serverTotalPaise < 0 || typeof result.reference !== 'string') throw new Error('We received an invalid order confirmation. Please try again.');
  const cleanMobile = String(values.mobile || '').replace(/[\s-]/g, '');
  const trackUrl = `track.html?ref=${encodeURIComponent(result.reference)}&mobile=${encodeURIComponent(cleanMobile)}`;

  const renderConfirmedVariantSubtitle = item => {
    const details = [];
    if (item.color) details.push(`Color: ${escapeHtml(item.color)}`);
    if (item.size) details.push(`Size: ${escapeHtml(item.size)}`);
    if (!details.length && item.variantTitle && item.variantTitle !== 'Standard Fit') {
      details.push(escapeHtml(item.variantTitle));
    }
    return details.length ? `<span class="checkout-item-variant">${details.join(' • ')}</span>` : '';
  };

  const confirmationItems = cart.map(item => `
    <div class="checkout-item">
      <div>
        <strong>${escapeHtml(item.name)}</strong>
        ${renderConfirmedVariantSubtitle(item)}
        <span>Qty: ${item.quantity} × ${formatPrice(item.price)}</span>
      </div>
      <strong>${formatPrice(item.price * item.quantity)}</strong>
    </div>
  `).join('');

  const couponDiscountAmount = appliedCoupon ? (appliedCoupon.discountPaise / 100) : 0;
  const prepaidDiscountAmount = Number(result.prepaid_discount || result.prepaid_discount_paise || 0) / 100;

  const couponDiscountRow = (couponDiscountAmount > 0)
    ? `<div class="confirmation-item checkout-discount-row"><div><strong>Coupon Discount (${escapeHtml(appliedCoupon.code)})</strong><span>Promo savings applied</span></div><strong>-${formatPrice(couponDiscountAmount)}</strong></div>`
    : '';

  const prepaidDiscountRow = (prepaidDiscountAmount > 0)
    ? `<div class="confirmation-item checkout-discount-row"><div><strong>Prepaid Discount</strong><span>Online payment discount</span></div><strong>-${formatPrice(prepaidDiscountAmount)}</strong></div>`
    : '';

  checkoutContent.innerHTML = `<section class="checkout-success-state"><div class="confirmation-intro"><p class="eyebrow">ORDER CONFIRMED</p><h1>Thank you, ${escapeHtml(values.fullName)}.</h1><p>${escapeHtml(message)}</p></div><div class="confirmation-meta"><span>Order reference</span><strong>${escapeHtml(result.reference)}</strong></div><section class="confirmation-details" aria-label="Confirmed order summary"><div class="confirmation-section-head"><h2>Your order</h2><span>${escapeHtml(paymentLabel)}</span></div><div class="confirmation-items">${confirmationItems}${couponDiscountRow}${prepaidDiscountRow}</div><div class="confirmation-total"><span>Order total</span><strong>${formatPrice(serverTotalPaise / 100)}</strong></div></section><div style="display:flex;gap:14px;flex-wrap:wrap;margin-top:26px;"><a class="btn btn-primary" href="${trackUrl}">Track Your Order</a><a class="btn btn-outline" href="index.html#shop">Continue Shopping</a></div></section>`;
  cartApi?.clearCart();
  try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch {}
}

function createIdempotencyKey() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  const bytes = window.crypto?.getRandomValues ? window.crypto.getRandomValues(new Uint8Array(16)) : new Uint8Array(Array.from({ length: 16 }, () => Math.floor(Math.random() * 256)));
  bytes[6] = (bytes[6] & 0x0f) | 0x40; bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, value => value.toString(16).padStart(2, '0')).join(''); return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
function field(name, label, type, required, placeholder, attributes = '') { return `<div class="checkout-field"><label for="${name}">${label}${required ? ' <span aria-hidden="true">*</span>' : ''}</label><input id="${name}" name="${name}" type="${type}" placeholder="${placeholder}"${required ? ' required' : ''} ${attributes} aria-describedby="${name}Error"><p class="checkout-error" id="${name}Error" aria-live="polite"></p></div>`; }
function validate(values) { const errors = {}; ['fullName', 'mobile', 'address', 'city', 'state', 'pincode'].forEach(name => { if (!values[name]?.trim()) errors[name] = 'This field is required.'; }); if (values.mobile && !/^[6-9]\d{9}$/.test(values.mobile.replace(/[\s-]/g, ''))) errors.mobile = 'Enter a valid 10-digit mobile number.'; if (values.pincode && !/^\d{6}$/.test(values.pincode.trim())) errors.pincode = 'Enter a valid 6-digit pincode.'; if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = 'Enter a valid email address or leave this field blank.'; return errors; }
function clearErrors(form) { form.querySelectorAll('.checkout-field').forEach(fieldElement => { fieldElement.classList.remove('has-error'); fieldElement.querySelector('.checkout-error').textContent = ''; }); }
function showError(form, name, message) { const input = form.elements[name]; input.closest('.checkout-field').classList.add('has-error'); document.getElementById(`${name}Error`).textContent = message; }
function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character])); }

