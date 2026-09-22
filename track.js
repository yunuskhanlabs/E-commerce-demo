/* ZaynXwear Customer Self-Service Order Tracking */
document.addEventListener('DOMContentLoaded', () => {
  const config = {
    rpcUrl: window.ZaynXwearAdminConfig?.supabaseUrl ? `${window.ZaynXwearAdminConfig.supabaseUrl}/rest/v1/rpc/get_order_status` : '',
    anonKey: window.ZaynXwearAdminConfig?.supabaseAnonKey || ''
  };

  const yearEl = document.getElementById('trackYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Mobile menu setup
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
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && navMenu.classList.contains('open')) close();
    });
  };
  setupMobileMenu();

  const form = document.getElementById('trackForm');
  const refInput = document.getElementById('trackRef');
  const mobileInput = document.getElementById('trackMobile');
  const submitBtn = document.getElementById('trackSubmitBtn');
  const statusMsg = document.getElementById('trackStatusMsg');
  const resultContainer = document.getElementById('trackResult');

  if (!form || !refInput || !mobileInput || !submitBtn || !resultContainer) return;

  // Auto-uppercase reference input
  refInput.addEventListener('input', () => {
    const start = refInput.selectionStart;
    const end = refInput.selectionEnd;
    refInput.value = refInput.value.toUpperCase();
    refInput.setSelectionRange(start, end);
    clearFieldError('trackRef');
  });

  // Filter numeric characters only for mobile
  mobileInput.addEventListener('input', () => {
    mobileInput.value = mobileInput.value.replace(/\D/g, '').slice(0, 10);
    clearFieldError('trackMobile');
  });

  const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[character]));

  const formatMoney = paise => `₹${(Number(paise || 0) / 100).toLocaleString('en-IN')}`;
  const formatDate = value => new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));

  const clearFieldError = inputId => {
    const input = document.getElementById(inputId);
    const field = input?.closest('.checkout-field');
    if (field) {
      field.classList.remove('has-error');
      const err = field.querySelector('.checkout-error');
      if (err) err.textContent = '';
    }
  };

  const showFieldError = (inputId, message) => {
    const input = document.getElementById(inputId);
    const field = input?.closest('.checkout-field');
    if (field) {
      field.classList.add('has-error');
      const err = field.querySelector('.checkout-error');
      if (err) err.textContent = message;
    }
  };

  const validateInputs = (ref, mobile) => {
    let isValid = true;
    clearFieldError('trackRef');
    clearFieldError('trackMobile');

    if (!ref.trim()) {
      showFieldError('trackRef', 'Order reference is required.');
      isValid = false;
    }

    if (!mobile.trim()) {
      showFieldError('trackMobile', 'Mobile number is required.');
      isValid = false;
    } else if (!/^[6-9]\d{9}$/.test(mobile.trim())) {
      showFieldError('trackMobile', 'Enter a valid 10-digit mobile number.');
      isValid = false;
    }

    return isValid;
  };

  const orderSteps = [
    { key: 'pending', label: 'Order Placed', desc: 'Order received & verified' },
    { key: 'confirmed', label: 'Confirmed', desc: 'Order accepted for fulfillment' },
    { key: 'processing', label: 'Processing', desc: 'Packed & awaiting dispatch' },
    { key: 'shipped', label: 'Shipped', desc: 'Handed over to courier partner' },
    { key: 'out_for_delivery', label: 'Out for Delivery', desc: 'Package with local delivery agent' },
    { key: 'delivered', label: 'Delivered', desc: 'Delivered to your doorstep' }
  ];

  const getStepStatus = (currentStatus, stepIndex) => {
    const statusOrder = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    if (currentIndex === -1) return 'pending';
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  const renderOrder = order => {
    const isCancelled = order.order_status === 'cancelled';
    const items = Array.isArray(order.items) ? order.items : [];

    const timelineHtml = isCancelled
      ? `<div class="track-cancelled-notice">
          <strong>Order Cancelled</strong>
          <p>This order was cancelled. If you have any questions or require assistance, please reach out to contact@ecommercedemo.com or WhatsApp +91 98765 43210 (Demo Support).</p>
        </div>`
      : `<div class="track-timeline" aria-label="Order progress">
          ${orderSteps.map((step, idx) => {
            const state = getStepStatus(order.order_status, idx);
            return `
              <div class="track-step track-step-${state}">
                <div class="track-step-dot" aria-hidden="true">
                  ${state === 'completed' ? '✓' : idx + 1}
                </div>
                <div class="track-step-info">
                  <strong>${escapeHtml(step.label)}</strong>
                  <span>${escapeHtml(step.desc)}</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>`;

    // Render snapshot items
    const itemsHtml = items.map(item => {
      const details = [];
      if (item.color) details.push(`Color: ${escapeHtml(item.color)}`);
      if (item.size) details.push(`Size: ${escapeHtml(item.size)}`);
      if (!details.length && item.variant_title && item.variant_title !== 'Standard Fit') {
        details.push(escapeHtml(item.variant_title));
      }
      if (item.sku) details.push(`SKU: ${escapeHtml(item.sku)}`);

      const varSub = details.length ? `<span class="track-item-variant">${details.join(' • ')}</span>` : '';
      const imgUrl = escapeHtml(item.product_image || 'images/ca2e03bc34d1c75b624003e138376397.jpg');

      return `
        <div class="track-item-row track-item-snapshot">
          <div class="track-item-thumb">
            <img src="${imgUrl}" alt="${escapeHtml(item.product_name || 'Product')}" loading="lazy" decoding="async" onerror="this.src='images/ca2e03bc34d1c75b624003e138376397.jpg'">
          </div>
          <div class="track-item-meta">
            <strong>${escapeHtml(item.product_name || 'Product')}</strong>
            ${varSub}
            <span class="track-item-calc">Qty: ${escapeHtml(item.quantity)} × ${formatMoney(item.unit_price_paise)}</span>
          </div>
          <div class="track-item-total">
            <strong>${formatMoney(item.line_total_paise)}</strong>
          </div>
        </div>
      `;
    }).join('');

    const paymentMethodLabel = order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment (Razorpay)';

    // Courier / Shipment Section
    let courierSectionHtml = '';
    if (order.courier_partner || order.tracking_number || order.tracking_url) {
      const partner = escapeHtml(order.courier_partner || 'Courier Partner');
      const trackNo = escapeHtml(order.tracking_number || '');
      const trackUrl = order.tracking_url ? escapeHtml(order.tracking_url) : null;

      courierSectionHtml = `
        <section class="track-section track-courier-box">
          <h3>Shipment Tracking</h3>
          <div class="track-courier-details">
            <div class="track-courier-info">
              <span class="track-courier-label">Courier Partner:</span>
              <strong class="track-courier-val">${partner}</strong>
            </div>
            ${trackNo ? `
              <div class="track-courier-info">
                <span class="track-courier-label">AWB / Tracking #:</span>
                <strong class="track-courier-val track-courier-num" id="trackAwbNumber">${trackNo}</strong>
                <button type="button" class="btn btn-sm btn-outline track-copy-awb" id="copyAwbBtn" title="Copy tracking number">Copy</button>
              </div>
            ` : ''}
            ${trackUrl ? `
              <div class="track-courier-action">
                <a href="${trackUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary track-portal-link">
                  <span>Track on ${partner}</span>
                  <svg class="ic" style="width:14px;height:14px;margin-left:6px;"><use href="#icon-arrow" /></svg>
                </a>
              </div>
            ` : ''}
          </div>
        </section>
      `;
    }

    resultContainer.innerHTML = `
      <article class="track-card track-result-card">
        <header class="track-result-head">
          <div>
            <span class="eyebrow">ORDER DETAILS</span>
            <h2>${escapeHtml(order.order_reference)}</h2>
            <span class="track-timestamp">Placed on ${escapeHtml(formatDate(order.created_at))}</span>
          </div>
          <div class="track-badges">
            <span class="admin-badge admin-badge-order admin-badge-${escapeHtml(order.order_status)}">${escapeHtml(order.order_status.replace(/_/g, ' '))}</span>
            <span class="admin-badge admin-badge-payment admin-badge-${escapeHtml(order.payment_status)}">${escapeHtml(order.payment_status)}</span>
          </div>
        </header>

        <section class="track-section">
          <h3>Fulfillment Status</h3>
          ${timelineHtml}
        </section>

        ${courierSectionHtml}

        <div class="track-details-grid">
          <section class="track-section">
            <h3>Delivery Details</h3>
            <p class="track-destination">
              <strong>Destination:</strong> ${escapeHtml(order.shipping_city)}, ${escapeHtml(order.shipping_state)}
            </p>
            <p class="track-payment-info">
              <strong>Payment:</strong> ${escapeHtml(paymentMethodLabel)}
            </p>
          </section>

          <section class="track-section">
            <h3>Purchased Items (Order Snapshot)</h3>
            <div class="track-items-list">
              ${itemsHtml}
            </div>
            <div class="track-total-row">
              <span>Order Total</span>
              <strong>${formatMoney(order.total_paise)}</strong>
            </div>
          </section>
        </div>
      </article>
    `;

    // Hook copy button if present
    const copyBtn = document.getElementById('copyAwbBtn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const awbEl = document.getElementById('trackAwbNumber');
        if (awbEl && navigator.clipboard) {
          navigator.clipboard.writeText(awbEl.textContent.trim()).then(() => {
            copyBtn.textContent = 'Copied!';
            setTimeout(() => { copyBtn.textContent = 'Copy'; }, 2000);
          });
        }
      });
    }

    resultContainer.hidden = false;
    resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const fetchOrderStatus = async (reference, mobile) => {
    submitBtn.disabled = true;
    submitBtn.classList.add('is-loading');
    submitBtn.querySelector('span').textContent = 'Tracking…';
    statusMsg.textContent = '';
    statusMsg.className = 'track-form-status';
    resultContainer.hidden = true;
    resultContainer.innerHTML = '';

    try {
      if (window.ZaynXwearAdminConfig?.isDemoMode || !config.rpcUrl) {
        let saved = [];
        const ordersKey = 'ecommerce-demo-orders';
        const legacyOrdersKey = 'zaynxwear-demo-orders';
        try {
          let raw = localStorage.getItem(ordersKey);
          if (!raw) {
            raw = localStorage.getItem(legacyOrdersKey);
            if (raw) {
              localStorage.setItem(ordersKey, raw);
              localStorage.removeItem(legacyOrdersKey);
            }
          }
          saved = JSON.parse(raw || '[]');
        } catch (e) {}

        const cleanRef = reference.trim().toUpperCase();
        let matched = saved.find(o => (o.reference || o.order_reference || '').toUpperCase() === cleanRef);

        if (!matched && (cleanRef === 'ZX-849201' || saved.length === 0)) {
          matched = {
            order_id: 'demo-ord-1',
            order_reference: cleanRef,
            order_status: 'out_for_delivery',
            payment_status: 'completed',
            payment_method: 'cod',
            shipping_city: 'Nashik',
            shipping_state: 'Maharashtra',
            shipping_address: 'Gangapur Road, Nashik - 422005',
            subtotal_paise: 79900,
            total_paise: 79900,
            created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
            awb_number: 'ZX-EXP-99281726',
            courier_partner: 'Delhivery Surface',
            items: [{
              product_id: 'collar-t-shirt-full-sleeve',
              product_name: 'Collar T-Shirt Full Sleeve',
              product_image: 'images/de490593b2c52fd6f19df8b228bb2bc3.jpg',
              variant_title: 'M',
              size: 'M',
              color: 'White',
              sku: 'ZX-TEE-01',
              unit_price_paise: 79900,
              quantity: 1,
              line_total_paise: 79900
            }]
          };
        }

        if (matched) {
          const orderData = {
            order_id: matched.orderId || matched.order_id,
            order_reference: matched.reference || matched.order_reference,
            order_status: matched.order_status || 'confirmed',
            payment_status: matched.payment_status || 'pending',
            payment_method: matched.payment_method || 'cod',
            shipping_city: matched.shipping_city || 'Nashik',
            shipping_state: matched.shipping_state || 'Maharashtra',
            total_paise: matched.total_paise || matched.total || 0,
            created_at: matched.created_at || new Date().toISOString(),
            awb_number: matched.awb_number || 'ZX-EXP-DEMO123',
            courier_partner: matched.courier_partner || 'BlueDart Express',
            items: (matched.items || []).map(it => ({
              ...it,
              product_image: it.product_image || 'images/ca2e03bc34d1c75b624003e138376397.jpg'
            }))
          };
          renderOrder(orderData);
          return;
        }

        statusMsg.textContent = 'No order found matching this order reference. (Hint: Try ZX-849201 or place a new order)';
        statusMsg.className = 'track-form-status is-error';
        return;
      }

      const response = await fetch(config.rpcUrl, {
        method: 'POST',
        headers: {
          'apikey': config.anonKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          p_reference: reference.trim().toUpperCase(),
          p_mobile: mobile.trim()
        })
      });

      if (!response.ok) {
        throw new Error('Network error');
      }

      const data = await response.json();

      if (!Array.isArray(data) || data.length === 0) {
        statusMsg.textContent = 'No order found matching this order reference and mobile number. Please verify your details.';
        statusMsg.className = 'track-form-status is-error';
        window.ZaynXwearLogger?.warn('order_tracking_failed', { reference });
        return;
      }

      window.ZaynXwearLogger?.info('order_tracking_lookup', {
        reference,
        status: data[0].order_status
      });
      renderOrder(data[0]);
    } catch (err) {
      window.ZaynXwearLogger?.error('order_tracking_error', { reference }, err);
      statusMsg.textContent = 'No order found matching this order reference and mobile number. Please verify your details.';
      statusMsg.className = 'track-form-status is-error';
    } finally {
      submitBtn.disabled = false;
      submitBtn.classList.remove('is-loading');
      submitBtn.querySelector('span').textContent = 'Track Order';
    }
  };

  form.addEventListener('submit', event => {
    event.preventDefault();
    const reference = refInput.value.trim().toUpperCase();
    const mobile = mobileInput.value.trim();

    if (validateInputs(reference, mobile)) {
      fetchOrderStatus(reference, mobile);
    }
  });

  // URL parameter prefill and auto-track
  const params = new URLSearchParams(window.location.search);
  const paramRef = params.get('ref');
  const paramMobile = params.get('mobile');

  if (paramRef && paramMobile) {
    const cleanRef = paramRef.trim().toUpperCase();
    const cleanMobile = paramMobile.replace(/\D/g, '').slice(0, 10);
    refInput.value = cleanRef;
    mobileInput.value = cleanMobile;

    if (validateInputs(cleanRef, cleanMobile)) {
      fetchOrderStatus(cleanRef, cleanMobile);
    }
  }
});
