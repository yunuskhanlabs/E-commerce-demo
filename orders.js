/**
 * ZaynXwear — Customer Orders Dashboard Controller
 * Handles order history rendering, order details, cancellation, and return requests.
 */
document.addEventListener('DOMContentLoaded', async () => {
  const config = window.ZaynXwearAdminConfig || {
    isDemoMode: true,
    supabaseUrl: '',
    supabaseAnonKey: ''
  };

  const supabase = window.ZaynXwearSupabase || (window.ZaynXwearAuth && typeof window.ZaynXwearAuth.getClient === 'function' ? window.ZaynXwearAuth.getClient() : (window.supabase ? window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey) : null));

  const yearEl = document.getElementById('ordersYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Elements
  const authGate = document.getElementById('ordersAuthGate');
  const contentSection = document.getElementById('ordersContentSection');
  const gateLoginBtn = document.getElementById('gateLoginBtn');
  const listContainer = document.getElementById('ordersListContainer');
  const emptyState = document.getElementById('ordersEmptyState');
  const filterTabs = document.querySelectorAll('.orders-tab');

  // Modal elements
  const modalBackdrop = document.getElementById('ordersModalBackdrop');
  const modalTitle = document.getElementById('modalOrderTitle');
  const modalBody = document.getElementById('modalOrderBody');
  const closeModalBtn = document.getElementById('closeOrderModal');

  // State
  let customerOrders = [];
  let currentFilter = 'all';
  let activeUser = null;

  const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[character]));

  const formatMoney = paise => `₹${(Number(paise || 0) / 100).toLocaleString('en-IN')}`;
  const formatDate = value => new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));

  // Initialize Auth module
  if (window.ZaynXwearAuth) {
    await window.ZaynXwearAuth.init();
    activeUser = await window.ZaynXwearAuth.getUser();
  }

  // Handle Login Gate button
  if (gateLoginBtn) {
    gateLoginBtn.addEventListener('click', () => {
      window.ZaynXwearAuth?.openAuthModal((user) => {
        activeUser = user;
        checkAuthStateAndLoad();
      });
    });
  }

  // Listen to Auth changes
  window.onZaynXwearAuthChanged = (user) => {
    activeUser = user;
    checkAuthStateAndLoad();
  };

  const checkAuthStateAndLoad = async () => {
    if (!activeUser) {
      authGate.hidden = false;
      contentSection.hidden = true;
      customerOrders = [];
      return;
    }

    authGate.hidden = true;
    contentSection.hidden = false;
    await loadCustomerOrders();
  };

  const loadCustomerOrders = async () => {
    listContainer.innerHTML = '<div class="orders-loading-state"><span>Loading your orders…</span></div>';
    emptyState.hidden = true;

    try {
      if (config.isDemoMode || !config.supabaseUrl || !supabase) {
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

        if (!saved.length) {
          saved = [{
            order_id: 'demo-ord-1',
            order_reference: 'ZX-849201',
            order_status: 'delivered',
            payment_status: 'completed',
            payment_method: 'cod',
            shipping_address: 'Flat 402, Nashik Heights, Gangapur Road, Nashik - 422005',
            subtotal_paise: 79900,
            total_paise: 79900,
            created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
            items: [{
              product_id: 'collar-t-shirt-full-sleeve',
              product_name: 'Collar T-Shirt Full Sleeve',
              variant_title: 'M',
              size: 'M',
              color: 'White',
              unit_price_paise: 79900,
              quantity: 1,
              line_total_paise: 79900
            }],
            return_requests: [],
            refunds: []
          }];
          try {
            localStorage.setItem(ordersKey, JSON.stringify(saved));
          } catch (e) {}
        }

        customerOrders = saved.map(o => ({
          order_id: o.orderId || o.order_id,
          order_reference: o.reference || o.order_reference,
          order_status: o.order_status || 'confirmed',
          payment_status: o.payment_status || 'pending',
          payment_method: o.payment_method || 'cod',
          shipping_address: o.shipping_address || '',
          subtotal_paise: o.subtotal_paise || o.total_paise || 0,
          total_paise: o.total_paise || o.total || 0,
          created_at: o.created_at || new Date().toISOString(),
          items: o.items || [],
          return_requests: o.return_requests || [],
          refunds: o.refunds || []
        }));

        updateCounts();
        renderOrders();
        return;
      }

      if (!supabase) throw new Error('Database client unavailable');

      // Call get_customer_orders RPC
      const { data, error } = await supabase.rpc('get_customer_orders', {
        p_user_id: activeUser.id
      });

      if (error) throw error;

      customerOrders = Array.isArray(data) ? data : [];
      updateCounts();
      renderOrders();
    } catch (err) {
      window.ZaynXwearLogger?.error('customer_orders_load_error', { user_id: activeUser?.id }, err);
      listContainer.innerHTML = `
        <div class="orders-error-state">
          <p>Unable to load your orders right now. Please check your connection and try again.</p>
          <button class="btn btn-outline" id="retryLoadBtn" type="button">Retry</button>
        </div>
      `;
      document.getElementById('retryLoadBtn')?.addEventListener('click', loadCustomerOrders);
    }
  };

  const updateCounts = () => {
    const all = customerOrders.length;
    const active = customerOrders.filter(o => ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery'].includes(o.order_status)).length;
    const delivered = customerOrders.filter(o => o.order_status === 'delivered').length;
    const cancelled = customerOrders.filter(o => o.order_status === 'cancelled' || (o.return_requests && o.return_requests.length > 0)).length;

    const countAll = document.getElementById('countAll');
    const countActive = document.getElementById('countActive');
    const countDelivered = document.getElementById('countDelivered');
    const countCancelled = document.getElementById('countCancelled');

    if (countAll) countAll.textContent = String(all);
    if (countActive) countActive.textContent = String(active);
    if (countDelivered) countDelivered.textContent = String(delivered);
    if (countCancelled) countCancelled.textContent = String(cancelled);
  };

  const filterOrders = () => {
    if (currentFilter === 'active') {
      return customerOrders.filter(o => ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery'].includes(o.order_status));
    }
    if (currentFilter === 'delivered') {
      return customerOrders.filter(o => o.order_status === 'delivered');
    }
    if (currentFilter === 'cancelled') {
      return customerOrders.filter(o => o.order_status === 'cancelled' || (o.return_requests && o.return_requests.length > 0));
    }
    return customerOrders;
  };

  const isEligibleForReturn = (order) => {
    if (order.order_status !== 'delivered') return false;
    const orderDate = new Date(order.created_at).getTime();
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    return orderDate >= sevenDaysAgo;
  };

  const isEligibleForCancellation = (order) => {
    return ['pending', 'confirmed', 'processing'].includes(order.order_status);
  };

  const renderOrders = () => {
    const visible = filterOrders();

    if (visible.length === 0) {
      listContainer.innerHTML = '';
      emptyState.hidden = false;
      return;
    }

    emptyState.hidden = true;
    listContainer.innerHTML = visible.map(order => {
      const items = Array.isArray(order.items) ? order.items : [];
      const isCancellable = isEligibleForCancellation(order);
      const isReturnable = isEligibleForReturn(order);
      const requestedReturn = Array.isArray(order.return_requests) ? order.return_requests.find(r => r.status === 'requested') : null;
      const hasActiveReturns = Array.isArray(order.return_requests) && order.return_requests.some(r => ['requested', 'approved', 'pickup_scheduled', 'received', 'completed'].includes(r.status));
      const hasRefunds = Array.isArray(order.refunds) && order.refunds.length > 0;

      // Item thumbnails & meta
      const itemsPreviewHtml = items.map(item => {
        const details = [];
        if (item.color) details.push(`Color: ${escapeHtml(item.color)}`);
        if (item.size) details.push(`Size: ${escapeHtml(item.size)}`);
        if (!details.length && item.variant_title && item.variant_title !== 'Standard Fit') {
          details.push(escapeHtml(item.variant_title));
        }
        const varText = details.length ? `<span class="order-card-item-variant">${details.join(' • ')}</span>` : '';
        const imgUrl = escapeHtml(item.product_image || 'images/ca2e03bc34d1c75b624003e138376397.jpg');

        return `
          <div class="order-card-item-row">
            <div class="order-card-thumb">
              <img src="${imgUrl}" alt="${escapeHtml(item.product_name || 'Product')}" loading="lazy" decoding="async" onerror="this.src='images/ca2e03bc34d1c75b624003e138376397.jpg'">
            </div>
            <div class="order-card-meta">
              <strong>${escapeHtml(item.product_name || 'Product')}</strong>
              ${varText}
              <span class="order-card-calc">Qty: ${escapeHtml(item.quantity)} × ${formatMoney(item.unit_price_paise)}</span>
            </div>
            <div class="order-card-price">
              <strong>${formatMoney(item.line_total_paise)}</strong>
            </div>
          </div>
        `;
      }).join('');

      // Status tags
      let returnTagHtml = '';
      if (Array.isArray(order.return_requests) && order.return_requests.length > 0) {
        const latestReq = order.return_requests[0];
        returnTagHtml = `<span class="admin-badge admin-badge-return admin-badge-${escapeHtml(latestReq.status)}">${escapeHtml(latestReq.request_type.toUpperCase())}: ${escapeHtml(latestReq.status.replace(/_/g, ' ').toUpperCase())}</span>`;
      }

      let refundTagHtml = '';
      if (hasRefunds) {
        const latestRef = order.refunds[0];
        refundTagHtml = `<span class="admin-badge admin-badge-refund admin-badge-${escapeHtml(latestRef.refund_status)}">REFUND: ${escapeHtml(latestRef.refund_status)}</span>`;
      }

      return `
        <article class="order-card" data-order-id="${escapeHtml(order.order_id)}">
          <header class="order-card-head">
            <div class="order-card-id-block">
              <span class="eyebrow">ORDER REFERENCE</span>
              <h3>${escapeHtml(order.order_reference)}</h3>
              <span class="order-card-date">Placed on ${escapeHtml(formatDate(order.created_at))}</span>
            </div>
            <div class="order-card-badges">
              <span class="admin-badge admin-badge-order admin-badge-${escapeHtml(order.order_status)}">${escapeHtml(order.order_status.replace(/_/g, ' '))}</span>
              <span class="admin-badge admin-badge-payment admin-badge-${escapeHtml(order.payment_status)}">${escapeHtml(order.payment_status)}</span>
              ${returnTagHtml}
              ${refundTagHtml}
            </div>
          </header>

          <div class="order-card-items-list">
            ${itemsPreviewHtml}
          </div>

          <footer class="order-card-foot">
            <div class="order-card-total">
              <span>Total Amount</span>
              <strong>${formatMoney(order.total_paise)}</strong>
            </div>

            <div class="order-card-actions">
              <button class="btn btn-outline btn-sm view-details-btn" type="button" data-order-id="${escapeHtml(order.order_id)}">
                View Details
              </button>
              <a href="track.html?ref=${encodeURIComponent(order.order_reference)}" class="btn btn-outline btn-sm">
                Track Shipment
              </a>
              ${isCancellable ? `
                <button class="btn btn-danger-outline btn-sm cancel-order-btn" type="button" data-order-id="${escapeHtml(order.order_id)}">
                  Cancel Order
                </button>
              ` : ''}
              ${requestedReturn ? `
                <button class="btn btn-danger-outline btn-sm cancel-return-btn" type="button" data-order-id="${escapeHtml(order.order_id)}" data-return-id="${escapeHtml(requestedReturn.id)}">
                  Cancel Request
                </button>
              ` : ''}
              ${isReturnable && !hasActiveReturns ? `
                <button class="btn btn-secondary btn-sm return-order-btn" type="button" data-order-id="${escapeHtml(order.order_id)}">
                  Return / Exchange
                </button>
              ` : ''}
            </div>
          </footer>
        </article>
      `;
    }).join('');

    // Bind action listeners
    listContainer.querySelectorAll('.view-details-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const orderId = btn.dataset.orderId;
        const order = customerOrders.find(o => o.order_id === orderId);
        if (order) openOrderModal(order);
      });
    });

    listContainer.querySelectorAll('.cancel-order-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const orderId = btn.dataset.orderId;
        const order = customerOrders.find(o => o.order_id === orderId);
        if (order) openCancellationModal(order);
      });
    });

    listContainer.querySelectorAll('.cancel-return-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const orderId = btn.dataset.orderId;
        const returnId = btn.dataset.returnId;
        const order = customerOrders.find(o => o.order_id === orderId);
        const returnReq = order?.return_requests?.find(r => r.id === returnId);
        if (order && returnReq) openCancelReturnModal(order, returnReq);
      });
    });

    listContainer.querySelectorAll('.return-order-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const orderId = btn.dataset.orderId;
        const order = customerOrders.find(o => o.order_id === orderId);
        if (order) openReturnModal(order);
      });
    });
  };

  // Filter tabs click handling
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => {
        t.classList.remove('is-active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');
      currentFilter = tab.dataset.filter;
      renderOrders();
    });
  });

  // Modal open/close helpers
  const openModal = () => {
    modalBackdrop.hidden = false;
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    modalBackdrop.hidden = true;
    document.body.style.overflow = '';
  };

  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) closeModal();
    });
  }

  // Render Order Details Modal
  const openOrderModal = (order) => {
    modalTitle.textContent = order.order_reference;

    const items = Array.isArray(order.items) ? order.items : [];
    const isCancellable = isEligibleForCancellation(order);
    const isReturnable = isEligibleForReturn(order);
    const requestedReturn = Array.isArray(order.return_requests) ? order.return_requests.find(r => r.status === 'requested') : null;
    const hasActiveReturns = Array.isArray(order.return_requests) && order.return_requests.some(r => ['requested', 'approved', 'pickup_scheduled', 'received', 'completed'].includes(r.status));

    const itemsHtml = items.map(item => {
      const details = [];
      if (item.color) details.push(`Color: ${escapeHtml(item.color)}`);
      if (item.size) details.push(`Size: ${escapeHtml(item.size)}`);
      if (!details.length && item.variant_title && item.variant_title !== 'Standard Fit') {
        details.push(escapeHtml(item.variant_title));
      }
      if (item.sku) details.push(`SKU: ${escapeHtml(item.sku)}`);
      const varText = details.length ? `<span class="order-card-item-variant">${details.join(' • ')}</span>` : '';
      const imgUrl = escapeHtml(item.product_image || 'images/ca2e03bc34d1c75b624003e138376397.jpg');

      return `
        <div class="modal-item-row">
          <div class="modal-item-thumb">
            <img src="${imgUrl}" alt="${escapeHtml(item.product_name)}" loading="lazy" decoding="async" onerror="this.src='images/ca2e03bc34d1c75b624003e138376397.jpg'">
          </div>
          <div class="modal-item-info">
            <strong>${escapeHtml(item.product_name)}</strong>
            ${varText}
            <span>Quantity: ${escapeHtml(item.quantity)} · ${formatMoney(item.unit_price_paise)} each</span>
          </div>
          <strong>${formatMoney(item.line_total_paise)}</strong>
        </div>
      `;
    }).join('');

    // Tracking info block
    let trackingBlock = '';
    if (order.courier_partner || order.tracking_number || order.tracking_url) {
      trackingBlock = `
        <div class="modal-section modal-tracking-box">
          <h4>Shipment Tracking</h4>
          <dl class="modal-grid-dl">
            <dt>Courier Partner</dt>
            <dd><strong>${escapeHtml(order.courier_partner || 'Assigned Courier')}</strong></dd>
            ${order.tracking_number ? `<dt>Tracking / AWB #</dt><dd><code>${escapeHtml(order.tracking_number)}</code></dd>` : ''}
            ${order.tracking_url ? `<dt>Live Tracking</dt><dd><a href="${escapeHtml(order.tracking_url)}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-outline">Track on Carrier Portal ↗</a></dd>` : ''}
          </dl>
        </div>
      `;
    }

    // Return / Refund Status Details
    let returnStatusBlock = '';
    if (Array.isArray(order.return_requests) && order.return_requests.length > 0) {
      const ret = order.return_requests[0];
      returnStatusBlock = `
        <div class="modal-section modal-return-box">
          <h4>${escapeHtml(ret.request_type.toUpperCase())} REQUEST DETAILS</h4>
          <dl class="modal-grid-dl">
            <dt>Status</dt>
            <dd><span class="admin-badge admin-badge-return admin-badge-${escapeHtml(ret.status)}">${escapeHtml(ret.status.replace(/_/g, ' ').toUpperCase())}</span></dd>
            <dt>Reason</dt>
            <dd>${escapeHtml(ret.reason)}</dd>
            ${ret.requested_replacement_size ? `<dt>Requested Size</dt><dd>${escapeHtml(ret.requested_replacement_size)}</dd>` : ''}
            ${ret.customer_notes ? `<dt>Customer Explanation</dt><dd>${escapeHtml(ret.customer_notes)}</dd>` : ''}
            ${ret.admin_message ? `<dt style="font-weight:600;">Admin Message</dt><dd style="white-space:pre-wrap;word-break:break-word;line-height:1.5;color:#0f172a;background:#f0f9ff;padding:8px 12px;border-radius:6px;border:1px solid #bae6fd;">${escapeHtml(ret.admin_message)}</dd>` : ''}
            ${ret.refund_method ? `
              <dt>Refund Destination</dt>
              <dd>
                ${ret.refund_method === 'upi' ? `
                  <strong style="color:var(--navy);">UPI:</strong> <code>${escapeHtml(ret.payout_details?.upi_id || 'N/A')}</code>
                ` : ret.refund_method === 'bank_transfer' ? `
                  <strong style="color:var(--navy);">Bank Account:</strong> ${escapeHtml(ret.payout_details?.account_holder_name || '')} · <code>••••${escapeHtml(String(ret.payout_details?.account_number || '').slice(-4))}</code> · IFSC: <code>${escapeHtml(ret.payout_details?.ifsc_code || '')}</code>
                ` : 'Original Payment Method'}
              </dd>
            ` : ''}
            ${ret.refund_amount_paise ? `<dt>Refund Value</dt><dd><strong>${formatMoney(ret.refund_amount_paise)}</strong></dd>` : ''}
            ${Array.isArray(ret.images) && ret.images.length > 0 ? `
              <dt>Uploaded Photos</dt>
              <dd>
                <div class="return-previews-grid" id="modalCustomerReturnPhotos" style="margin-top:4px;">
                  ${ret.images.map(img => `
                    <div class="return-preview-item">
                      <img src="${escapeHtml(img.startsWith('http') ? img : '')}" data-storage-path="${escapeHtml(img)}" class="return-preview-img customer-return-photo-thumb" alt="Product Evidence">
                    </div>
                  `).join('')}
                </div>
              </dd>
            ` : ''}
          </dl>
          ${ret.status === 'requested' ? `
            <div style="margin-top:12px;">
              <button type="button" class="btn btn-danger-outline btn-sm modal-cancel-return-btn" data-return-id="${escapeHtml(ret.id)}">
                Cancel Request
              </button>
            </div>
          ` : ''}
        </div>
      `;
    }

    let refundStatusBlock = '';
    if (Array.isArray(order.refunds) && order.refunds.length > 0) {
      const ref = order.refunds[0];
      let payoutText = ref.payment_method === 'razorpay' ? 'Original Payment Source (Razorpay)' : 'Bank Transfer / UPI (COD)';
      if (ref.payout_details?.upi_id) {
        payoutText = `UPI (${ref.payout_details.upi_id})`;
      } else if (ref.payout_details?.account_number) {
        const masked = '••••' + String(ref.payout_details.account_number).slice(-4);
        payoutText = `Bank Transfer (${ref.payout_details.account_holder_name || 'A/C'} · ${masked} · IFSC: ${ref.payout_details.ifsc_code || ''})`;
      }

      refundStatusBlock = `
        <div class="modal-section modal-refund-box">
          <h4>REFUND INFORMATION</h4>
          <dl class="modal-grid-dl">
            <dt>Refund Status</dt>
            <dd><span class="admin-badge admin-badge-refund admin-badge-${escapeHtml(ref.refund_status)}">${escapeHtml(ref.refund_status.toUpperCase())}</span></dd>
            <dt>Amount</dt>
            <dd><strong>${formatMoney(ref.amount_paise)}</strong></dd>
            <dt>Method</dt>
            <dd>${escapeHtml(payoutText)}</dd>
            ${ref.razorpay_refund_id ? `<dt>Refund Ref</dt><dd><code>${escapeHtml(ref.razorpay_refund_id)}</code></dd>` : ''}
          </dl>
        </div>
      `;
    }

    const discountRow = (order.coupon_discount_paise && order.coupon_discount_paise > 0)
      ? `<div class="modal-summary-row modal-discount-row"><span>Coupon (${escapeHtml(order.coupon_code || 'APPLIED')})</span><strong>-${formatMoney(order.coupon_discount_paise)}</strong></div>`
      : '';

    modalBody.innerHTML = `
      <div class="modal-details-view">
        <div class="modal-section modal-header-info">
          <div class="modal-badges-row">
            <span class="admin-badge admin-badge-order admin-badge-${escapeHtml(order.order_status)}">${escapeHtml(order.order_status.replace(/_/g, ' '))}</span>
            <span class="admin-badge admin-badge-payment admin-badge-${escapeHtml(order.payment_status)}">${escapeHtml(order.payment_status)}</span>
          </div>
          <p class="modal-meta-text">Placed on ${escapeHtml(formatDate(order.created_at))} · Payment via ${escapeHtml(order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online (Razorpay)')}</p>
        </div>

        ${trackingBlock}
        ${returnStatusBlock}
        ${refundStatusBlock}

        <div class="modal-section">
          <h4>Delivery Address</h4>
          <p class="modal-address-text">
            ${escapeHtml(order.shipping_address)}<br>
            ${escapeHtml(order.shipping_city)}, ${escapeHtml(order.shipping_state)} — ${escapeHtml(order.shipping_pincode)}
          </p>
        </div>

        <div class="modal-section">
          <h4>Purchased Items (Order Snapshot)</h4>
          <div class="modal-items-list">
            ${itemsHtml}
          </div>

          <div class="modal-totals-block">
            <div class="modal-summary-row"><span>Subtotal</span><strong>${formatMoney(order.subtotal_paise)}</strong></div>
            ${discountRow}
            <div class="modal-summary-row modal-grand-total"><span>Grand Total</span><strong>${formatMoney(order.total_paise)}</strong></div>
          </div>
        </div>

        <div class="modal-footer-actions">
          ${isCancellable ? `
            <button class="btn btn-danger-outline modal-cancel-btn" type="button">Cancel Order</button>
          ` : ''}
          ${requestedReturn ? `
            <button class="btn btn-danger-outline modal-cancel-return-btn" type="button" data-return-id="${escapeHtml(requestedReturn.id)}">Cancel Request</button>
          ` : ''}
          ${isReturnable && !hasActiveReturns ? `
            <button class="btn btn-secondary modal-return-btn" type="button">Return / Exchange</button>
          ` : ''}
          <button class="btn btn-outline modal-close-btn" type="button">Close</button>
        </div>
      </div>
    `;

    modalBody.querySelector('.modal-close-btn')?.addEventListener('click', closeModal);
    modalBody.querySelector('.modal-cancel-btn')?.addEventListener('click', () => {
      openCancellationModal(order);
    });
    modalBody.querySelectorAll('.modal-cancel-return-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const retId = btn.dataset.returnId;
        const returnReq = order.return_requests?.find(r => r.id === retId);
        if (returnReq) openCancelReturnModal(order, returnReq);
      });
    });
    modalBody.querySelector('.modal-return-btn')?.addEventListener('click', () => {
      openReturnModal(order);
    });

    openModal();
  };

  // Render Cancellation Confirmation Dialog
  const openCancellationModal = (order) => {
    modalTitle.textContent = `Cancel Order: ${order.order_reference}`;

    modalBody.innerHTML = `
      <form class="modal-action-form" id="cancelOrderForm">
        <div class="modal-warning-notice">
          <strong>Confirm Order Cancellation</strong>
          <p>Are you sure you want to cancel this order? This action cannot be undone. Any items reserved will be released back to inventory immediately.</p>
          ${order.payment_method === 'razorpay' && order.payment_status === 'paid' ? `
            <p class="modal-refund-hint">💡 Because you paid online via Razorpay, a refund for <strong>${formatMoney(order.total_paise)}</strong> will be automatically scheduled to your original payment method.</p>
          ` : ''}
        </div>

        <div class="checkout-field">
          <label for="cancelReasonSelect">Reason for cancellation <span aria-hidden="true">*</span></label>
          <select id="cancelReasonSelect" required class="modal-select">
            <option value="">Please select a reason…</option>
          <p>Are you sure you want to cancel this order? Once cancelled, this action cannot be undone.</p>
        </div>

        <div class="checkout-field">
          <label for="cancellationReason">Reason for Cancellation (Optional)</label>
          <select id="cancellationReason" class="modal-select">
            <option value="Changed my mind">Changed my mind</option>
            <option value="Found a better price">Found a better price</option>
            <option value="Ordered by mistake / wrong size">Ordered by mistake / wrong size</option>
            <option value="Delivery time is too long">Delivery time is too long</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div class="modal-form-actions">
          <button class="btn btn-danger" id="confirmCancelSubmitBtn" type="submit">
            <span>Yes, Cancel Order</span>
          </button>
          <button class="btn btn-outline modal-back-btn" type="button">Keep Order</button>
        </div>

        <p class="modal-status-msg" id="cancelStatusMsg" aria-live="polite"></p>
      </form>
    `;

    modalBody.querySelector('.modal-back-btn')?.addEventListener('click', () => openOrderModal(order));

    const form = document.getElementById('cancelOrderForm');
    const submitBtn = document.getElementById('confirmCancelSubmitBtn');
    const statusMsg = document.getElementById('cancelStatusMsg');
    const reasonSelect = document.getElementById('cancellationReason');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      submitBtn.disabled = true;
      submitBtn.querySelector('span').textContent = 'Cancelling…';
      statusMsg.textContent = '';
      statusMsg.className = 'modal-status-msg';

      try {
        if (config.isDemoMode || !config.supabaseUrl || !supabase) {
          try {
            const ordersKey = 'ecommerce-demo-orders';
            const legacyOrdersKey = 'zaynxwear-demo-orders';
            let raw = localStorage.getItem(ordersKey) || localStorage.getItem(legacyOrdersKey);
            const saved = JSON.parse(raw || '[]');
            const target = saved.find(o => (o.orderId || o.order_id) === order.order_id);
            if (target) {
              target.order_status = 'cancelled';
              localStorage.setItem(ordersKey, JSON.stringify(saved));
              localStorage.removeItem(legacyOrdersKey);
            }
          } catch (e) {}

          statusMsg.textContent = 'Order successfully cancelled.';
          statusMsg.className = 'modal-status-msg is-success';

          setTimeout(async () => {
            closeModal();
            await loadCustomerOrders();
          }, 1000);
          return;
        }

        const { data, error } = await supabase.rpc('cancel_customer_order', {
          p_order_id: order.order_id,
          p_reason: reasonSelect.value || 'Customer requested cancellation'
        });

        if (error) throw error;

        window.ZaynXwearLogger?.info('customer_order_cancelled', {
          order_id: order.order_id,
          reference: order.order_reference
        });

        statusMsg.textContent = data?.[0]?.message || 'Order successfully cancelled.';
        statusMsg.className = 'modal-status-msg is-success';

        setTimeout(async () => {
          closeModal();
          await loadCustomerOrders();
        }, 1200);
      } catch (err) {
        window.ZaynXwearLogger?.error('order_cancellation_failed', { order_id: order.order_id }, err);
        statusMsg.textContent = err.message || 'Unable to cancel order. Please try again.';
        statusMsg.className = 'modal-status-msg is-error';
        submitBtn.disabled = false;
        submitBtn.querySelector('span').textContent = 'Yes, Cancel Order';
      }
    });

    openModal();
  };

  // Render Return / Exchange Request Cancellation Confirmation Dialog
  const openCancelReturnModal = (order, returnReq) => {
    modalTitle.textContent = `Cancel Request: ${returnReq.request_type.toUpperCase()}`;

    modalBody.innerHTML = `
      <form class="modal-action-form" id="cancelReturnForm">
        <div class="modal-warning-notice">
          <strong>Confirm Request Cancellation</strong>
          <p>Are you sure you want to cancel this return/exchange request?</p>
        </div>

        <div class="modal-section" style="background:#f8fafc;padding:12px;border-radius:6px;margin:12px 0;">
          <dl class="modal-grid-dl" style="margin:0;">
            <dt>Request Type</dt>
            <dd><strong>${escapeHtml(returnReq.request_type.toUpperCase())}</strong></dd>
            <dt>Reason</dt>
            <dd>${escapeHtml(returnReq.reason)}</dd>
            <dt>Status</dt>
            <dd><span class="admin-badge admin-badge-return admin-badge-${escapeHtml(returnReq.status)}">${escapeHtml(returnReq.status.replace(/_/g, ' ').toUpperCase())}</span></dd>
          </dl>
        </div>

        <div class="modal-form-actions">
          <button class="btn btn-danger" id="confirmCancelReturnSubmitBtn" type="submit">
            <span>Cancel</span>
          </button>
          <button class="btn btn-outline modal-keep-return-btn" type="button">Keep Request</button>
        </div>

        <p class="modal-status-msg" id="cancelReturnStatusMsg" aria-live="polite"></p>
      </form>
    `;

    modalBody.querySelector('.modal-keep-return-btn')?.addEventListener('click', () => openOrderModal(order));

    const form = document.getElementById('cancelReturnForm');
    const submitBtn = document.getElementById('confirmCancelReturnSubmitBtn');
    const statusMsg = document.getElementById('cancelReturnStatusMsg');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      submitBtn.disabled = true;
      submitBtn.querySelector('span').textContent = 'Cancelling…';
      statusMsg.textContent = '';
      statusMsg.className = 'modal-status-msg';

      try {
        const { data, error } = await supabase.rpc('cancel_return_request', {
          p_request_id: returnReq.id
        });

        if (error) throw error;

        window.ZaynXwearLogger?.info('customer_return_request_cancelled', {
          order_id: order.order_id,
          return_id: returnReq.id
        });

        statusMsg.textContent = data?.[0]?.message || 'Your return/exchange request has been cancelled.';
        statusMsg.className = 'modal-status-msg is-success';

        setTimeout(async () => {
          closeModal();
          await loadCustomerOrders();
        }, 1200);
      } catch (err) {
        window.ZaynXwearLogger?.error('cancel_return_request_failed', { return_id: returnReq.id }, err);
        statusMsg.textContent = err.message || 'Unable to cancel request. Please try again.';
        statusMsg.className = 'modal-status-msg is-error';
        submitBtn.disabled = false;
        submitBtn.querySelector('span').textContent = 'Cancel';
      }
    });

    openModal();
  };

  // Render Return / Exchange Modal
  const openReturnModal = (order) => {
    modalTitle.textContent = `Return or Exchange: ${order.order_reference}`;
    const items = Array.isArray(order.items) ? order.items : [];

    const REASON_QUESTIONS = {
      'Size / fitting issue': 'Please tell us what size or fitting issue you experienced.',
      'Wrong product received': 'Please tell us what product you received and what you ordered.',
      'Damaged or defective product': 'Please describe the damage or defect.',
      'Product different from description': 'Please tell us how the product differs from its description.',
      'Quality issue': 'Please describe the quality issue you experienced.',
      'Other reason': 'Please describe your reason in detail.'
    };

    const itemsOptionsHtml = items.map(item => `
      <option value="${escapeHtml(item.id)}">${escapeHtml(item.product_name)} (${escapeHtml(item.size || item.variant_title || 'Standard')} · ${formatMoney(item.unit_price_paise)})</option>
    `).join('');

    modalBody.innerHTML = `
      <form class="modal-action-form" id="returnOrderForm" novalidate>
        <div class="modal-info-notice">
          <strong>7-Day Exchange &amp; Return Policy</strong>
          <p>E-Commerce Demo offers size exchanges and returns for eligible items within 7 days of delivery. Items must be unused, unwashed, and in original condition with tags attached.</p>
        </div>

        <div class="checkout-field">
          <label for="returnRequestType">I want to <span aria-hidden="true">*</span></label>
          <select id="returnRequestType" required class="modal-select">
            <option value="exchange">Exchange for a Different Size</option>
            <option value="return">Return &amp; Request Refund</option>
          </select>
        </div>

        <div class="checkout-field">
          <label for="returnItemSelect">Select Item <span aria-hidden="true">*</span></label>
          <select id="returnItemSelect" required class="modal-select">
            <option value="">Choose item…</option>
            ${itemsOptionsHtml}
          </select>
        </div>

        <div class="checkout-field">
          <label for="returnReasonSelect">Reason <span aria-hidden="true">*</span></label>
          <select id="returnReasonSelect" required class="modal-select">
            <option value="">Select a reason…</option>
            <option value="Size / fitting issue">Size / fitting issue</option>
            <option value="Wrong product received">Wrong product received</option>
            <option value="Damaged or defective product">Damaged or defective product</option>
            <option value="Product different from description">Product different from description</option>
            <option value="Quality issue">Quality issue</option>
            <option value="Other reason">Other reason</option>
          </select>
        </div>

        <div class="checkout-field" id="exchangeSizeField" hidden>
          <label for="replacementSizeInput">Requested Replacement Size <span aria-hidden="true">*</span></label>
          <div id="replacementSizeContainer">
            <input type="text" id="replacementSizeInput" class="modal-input" placeholder="e.g. S, M, L, XL, 32, 34" maxlength="20">
          </div>
        </div>

        <div class="checkout-field" id="returnQuestionField" hidden>
          <label for="returnExplanationInput" id="returnQuestionLabel">Customer Explanation <span aria-hidden="true">*</span></label>
          <textarea id="returnExplanationInput" class="modal-textarea" rows="3" placeholder="Please provide your answer in detail..." maxlength="1500"></textarea>
        </div>

        <!-- COD Refund Method Section (Visible only when Request Type is Return and Order is COD) -->
        <div class="checkout-field" id="codRefundSection" hidden>
          <label style="font-weight:700;font-size:13px;display:block;margin-bottom:6px;color:var(--navy);">
            Refund Payment Method (COD Order) <span aria-hidden="true">*</span>
          </label>
          <div class="cod-payout-methods-toggle" role="radiogroup" aria-label="Select Refund Method">
            <label class="cod-payout-method-option is-active" id="codMethodUpiLabel">
              <input type="radio" name="codRefundMethod" id="codRefundMethodUpi" value="upi" checked>
              <span>Instant UPI / VPA</span>
            </label>
            <label class="cod-payout-method-option" id="codMethodBankLabel">
              <input type="radio" name="codRefundMethod" id="codRefundMethodBank" value="bank_transfer">
              <span>Bank Account Transfer (NEFT/IMPS)</span>
            </label>
          </div>

          <!-- UPI Form Details -->
          <div class="cod-payout-details-box" id="codUpiDetailsBox">
            <div class="checkout-field" style="margin-top:10px;margin-bottom:0;">
              <label for="codUpiIdInput">UPI ID / VPA <span aria-hidden="true">*</span></label>
              <input type="text" id="codUpiIdInput" class="modal-input" placeholder="e.g. yourname@okhdfcbank, mobile@upi" maxlength="60" autocomplete="off">
              <span class="return-upload-help" style="font-size:11px;color:#64748b;margin-top:4px;display:block;">Refund will be transferred to this UPI VPA after return verification.</span>
            </div>
          </div>

          <!-- Bank Account Form Details -->
          <div class="cod-payout-details-box" id="codBankDetailsBox" hidden>
            <div class="checkout-field" style="margin-top:10px;">
              <label for="codAccountHolderInput">Account Holder Name <span aria-hidden="true">*</span></label>
              <input type="text" id="codAccountHolderInput" class="modal-input" placeholder="Name as registered with bank" maxlength="80" autocomplete="name">
            </div>
            <div class="checkout-field" style="margin-top:10px;">
              <label for="codAccountNumberInput">Bank Account Number <span aria-hidden="true">*</span></label>
              <input type="text" id="codAccountNumberInput" class="modal-input" placeholder="e.g. 123456789012" maxlength="35" autocomplete="off">
            </div>
            <div class="checkout-field" style="margin-top:10px;margin-bottom:0;">
              <label for="codIfscInput">IFSC Code <span aria-hidden="true">*</span></label>
              <input type="text" id="codIfscInput" class="modal-input" placeholder="e.g. HDFC0001234" maxlength="15" style="text-transform:uppercase;" autocomplete="off">
            </div>
          </div>
        </div>

        <!-- Required Photos Upload (Exactly 3) -->
        <div class="checkout-field" id="returnPhotosField">
          <label for="returnPhotosInput">Upload Photos <span aria-hidden="true">*</span> (3 Photos Required)</label>
          <p class="return-upload-help" style="margin:0 0 8px 0;font-size:12px;color:#64748b;">
            Please upload exactly 3 clear photos of the product, packaging, tags, damage, defect, or other issue.
          </p>
          <div class="return-upload-dropzone" id="returnPhotosDropzone" tabindex="0" role="button" aria-label="Upload photos">
            <svg class="return-upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <rect x="3" y="3" width="18" height="18" rx="3" ry="3"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <span class="return-upload-title">Click to browse or drop images here</span>
            <span class="return-upload-help" style="font-size:11px;">PNG, JPG, WEBP up to 5MB each (Exactly 3 photos required)</span>
            <input type="file" id="returnPhotosInput" accept="image/jpeg,image/png,image/webp" multiple style="display:none;">
          </div>
          <div class="return-previews-grid" id="returnPhotosPreviewGrid"></div>
        </div>

        <div class="modal-form-actions">
          <button class="btn btn-primary" id="confirmReturnSubmitBtn" type="submit">
            <span>Submit Request</span>
          </button>
          <button class="btn btn-outline modal-back-btn" type="button">Back</button>
        </div>

        <p class="modal-status-msg" id="returnStatusMsg" aria-live="polite"></p>
      </form>
    `;

    modalBody.querySelector('.modal-back-btn')?.addEventListener('click', () => openOrderModal(order));

    const reqTypeSelect = document.getElementById('returnRequestType');
    const itemSelect = document.getElementById('returnItemSelect');
    const reasonSelect = document.getElementById('returnReasonSelect');
    const sizeField = document.getElementById('exchangeSizeField');
    const sizeContainer = document.getElementById('replacementSizeContainer');
    const questionField = document.getElementById('returnQuestionField');
    const questionLabel = document.getElementById('returnQuestionLabel');
    const explanationInput = document.getElementById('returnExplanationInput');
    const codRefundSection = document.getElementById('codRefundSection');
    const codMethodUpiLabel = document.getElementById('codMethodUpiLabel');
    const codMethodBankLabel = document.getElementById('codMethodBankLabel');
    const codUpiDetailsBox = document.getElementById('codUpiDetailsBox');
    const codBankDetailsBox = document.getElementById('codBankDetailsBox');
    const codUpiIdInput = document.getElementById('codUpiIdInput');
    const codAccountHolderInput = document.getElementById('codAccountHolderInput');
    const codAccountNumberInput = document.getElementById('codAccountNumberInput');
    const codIfscInput = document.getElementById('codIfscInput');
    const photosDropzone = document.getElementById('returnPhotosDropzone');
    const photosInput = document.getElementById('returnPhotosInput');
    const photosPreviewGrid = document.getElementById('returnPhotosPreviewGrid');
    const form = document.getElementById('returnOrderForm');
    const submitBtn = document.getElementById('confirmReturnSubmitBtn');
    const statusMsg = document.getElementById('returnStatusMsg');

    const isCodOrder = order.payment_method === 'cod';

    // COD Payout Method Toggle Handler
    const updateCodPayoutDisplay = () => {
      const selectedMethod = form.querySelector('input[name="codRefundMethod"]:checked')?.value || 'upi';
      if (selectedMethod === 'upi') {
        codMethodUpiLabel?.classList.add('is-active');
        codMethodBankLabel?.classList.remove('is-active');
        if (codUpiDetailsBox) codUpiDetailsBox.hidden = false;
        if (codBankDetailsBox) codBankDetailsBox.hidden = true;
      } else {
        codMethodBankLabel?.classList.add('is-active');
        codMethodUpiLabel?.classList.remove('is-active');
        if (codBankDetailsBox) codBankDetailsBox.hidden = false;
        if (codUpiDetailsBox) codUpiDetailsBox.hidden = true;
      }
    };

    form.querySelectorAll('input[name="codRefundMethod"]').forEach(radio => {
      radio.addEventListener('change', updateCodPayoutDisplay);
    });

    // Local selected images state (max 3)
    let selectedPhotos = [];
    const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

    const renderPhotoPreviews = () => {
      photosPreviewGrid.innerHTML = selectedPhotos.map((file, idx) => {
        const objectUrl = URL.createObjectURL(file);
        return `
          <div class="return-preview-item" data-index="${idx}">
            <img src="${objectUrl}" class="return-preview-img" alt="Photo ${idx + 1}">
            <button type="button" class="return-preview-remove" data-index="${idx}" aria-label="Remove photo ${idx + 1}">✕</button>
          </div>
        `;
      }).join('');

      // Attach remove handlers
      photosPreviewGrid.querySelectorAll('.return-preview-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const removeIdx = parseInt(btn.dataset.index, 10);
          if (!isNaN(removeIdx) && removeIdx >= 0 && removeIdx < selectedPhotos.length) {
            selectedPhotos.splice(removeIdx, 1);
            renderPhotoPreviews();
            statusMsg.textContent = '';
            statusMsg.className = 'modal-status-msg';
          }
        });
      });
    };

    const handlePhotoFiles = (files) => {
      statusMsg.textContent = '';
      statusMsg.className = 'modal-status-msg';

      if (!files || files.length === 0) return;

      const newFiles = Array.from(files);

      for (const file of newFiles) {
        // Validate MIME type
        if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
          statusMsg.textContent = `File "${file.name}" is not a supported format. Please upload JPG, PNG, or WEBP images.`;
          statusMsg.className = 'modal-status-msg is-error';
          return;
        }

        // Validate File Size
        if (file.size > MAX_FILE_SIZE) {
          statusMsg.textContent = `File "${file.name}" exceeds the 5MB size limit.`;
          statusMsg.className = 'modal-status-msg is-error';
          return;
        }
      }

      // Validate total file count
      if (selectedPhotos.length + newFiles.length > 3) {
        statusMsg.textContent = 'You can upload a maximum of 3 images per request.';
        statusMsg.className = 'modal-status-msg is-error';
        return;
      }

      // Add files
      for (const file of newFiles) {
        if (selectedPhotos.length < 3) {
          selectedPhotos.push(file);
        }
      }

      renderPhotoPreviews();
    };

    // Dropzone event listeners
    photosDropzone?.addEventListener('click', () => {
      photosInput.value = '';
      photosInput.click();
    });

    photosDropzone?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        photosInput.value = '';
        photosInput.click();
      }
    });

    photosInput?.addEventListener('change', (e) => {
      handlePhotoFiles(e.target.files);
    });

    photosDropzone?.addEventListener('dragover', (e) => {
      e.preventDefault();
      photosDropzone.classList.add('is-dragover');
    });

    photosDropzone?.addEventListener('dragleave', () => {
      photosDropzone.classList.remove('is-dragover');
    });

    photosDropzone?.addEventListener('drop', (e) => {
      e.preventDefault();
      photosDropzone.classList.remove('is-dragover');
      if (e.dataTransfer?.files) {
        handlePhotoFiles(e.dataTransfer.files);
      }
    });

    // Auto-select single item if only one item in order
    if (items.length === 1 && itemSelect) {
      itemSelect.value = items[0].id;
    }

    const updateReplacementSizeOptions = async () => {
      const selectedItemId = itemSelect?.value;
      const selectedItem = items.find(i => String(i.id) === String(selectedItemId));

      if (!selectedItem || !selectedItem.product_id) {
        sizeContainer.innerHTML = `
          <input type="text" id="replacementSizeInput" class="modal-input" placeholder="e.g. S, M, L, XL, 32, 34" maxlength="20" required>
        `;
        return;
      }

      try {
        const { data: variants, error } = await supabase
          .from('product_variants')
          .select('size, stock_quantity, is_active')
          .eq('product_id', selectedItem.product_id)
          .eq('is_active', true)
          .gt('stock_quantity', 0);

        if (!error && Array.isArray(variants) && variants.length > 0) {
          const availableSizes = [...new Set(variants.map(v => v.size).filter(Boolean))];
          if (availableSizes.length > 0) {
            sizeContainer.innerHTML = `
              <select id="replacementSizeInput" class="modal-select" required>
                <option value="">Select available size…</option>
                ${availableSizes.map(sz => `<option value="${escapeHtml(sz)}">${escapeHtml(sz)}</option>`).join('')}
              </select>
            `;
            return;
          }
        }
      } catch (err) {
        console.warn('Could not load variant sizes:', err);
      }

      sizeContainer.innerHTML = `
        <input type="text" id="replacementSizeInput" class="modal-input" placeholder="e.g. S, M, L, XL, 32, 34" maxlength="20" required>
      `;
    };

    const syncFormState = async () => {
      const requestType = reqTypeSelect.value;
      const reason = reasonSelect.value;
      const isExchange = requestType === 'exchange';
      const isReturn = requestType === 'return';
      const isSizeIssue = reason === 'Size / fitting issue';

      // Question field visibility & label
      if (reason && REASON_QUESTIONS[reason]) {
        questionField.hidden = false;
        questionLabel.innerHTML = `${escapeHtml(REASON_QUESTIONS[reason])} <span aria-hidden="true">*</span>`;
        explanationInput.setAttribute('required', 'true');
        explanationInput.setAttribute('placeholder', REASON_QUESTIONS[reason]);
      } else {
        questionField.hidden = true;
        explanationInput.removeAttribute('required');
      }

      // Replacement size field visibility (Exchange + Size / fitting issue only)
      if (isExchange && isSizeIssue) {
        sizeField.hidden = false;
        await updateReplacementSizeOptions();
        const currentSizeInput = document.getElementById('replacementSizeInput');
        if (currentSizeInput) currentSizeInput.setAttribute('required', 'true');
      } else {
        sizeField.hidden = true;
        const currentSizeInput = document.getElementById('replacementSizeInput');
        if (currentSizeInput) currentSizeInput.removeAttribute('required');
      }

      // COD Refund Section Visibility (Only for COD Orders when Request Type is Return)
      if (codRefundSection) {
        if (isReturn && isCodOrder) {
          codRefundSection.hidden = false;
          updateCodPayoutDisplay();
        } else {
          codRefundSection.hidden = true;
        }
      }
    };

    reqTypeSelect.addEventListener('change', syncFormState);
    reasonSelect.addEventListener('change', syncFormState);
    itemSelect.addEventListener('change', async () => {
      const isExchange = reqTypeSelect.value === 'exchange';
      const isSizeIssue = reasonSelect.value === 'Size / fitting issue';
      if (isExchange && isSizeIssue) {
        await updateReplacementSizeOptions();
      }
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const requestType = reqTypeSelect.value;
      const itemId = itemSelect.value;
      const reason = reasonSelect.value;
      const explanation = (explanationInput?.value || '').trim();
      const sizeInput = document.getElementById('replacementSizeInput');
      const replacementSize = (sizeInput?.value || '').trim();

      if (!requestType || !['exchange', 'return'].includes(requestType)) {
        statusMsg.textContent = 'Please select a valid request type.';
        statusMsg.className = 'modal-status-msg is-error';
        return;
      }

      if (!itemId) {
        statusMsg.textContent = 'Please select an item.';
        statusMsg.className = 'modal-status-msg is-error';
        itemSelect.focus();
        return;
      }

      if (!reason || !REASON_QUESTIONS[reason]) {
        statusMsg.textContent = 'Please select a reason.';
        statusMsg.className = 'modal-status-msg is-error';
        reasonSelect.focus();
        return;
      }

      if (!explanation) {
        statusMsg.textContent = 'Please answer the question before submitting your request.';
        statusMsg.className = 'modal-status-msg is-error';
        explanationInput?.focus();
        return;
      }

      const isExchange = requestType === 'exchange';
      const isReturn = requestType === 'return';
      const isSizeIssue = reason === 'Size / fitting issue';

      if (isExchange && isSizeIssue && !replacementSize) {
        statusMsg.textContent = 'Please select or provide the requested replacement size.';
        statusMsg.className = 'modal-status-msg is-error';
        sizeInput?.focus();
        return;
      }

      // COD Refund validation (Only when requestType is 'return' and order is 'cod')
      let refundMethod = null;
      let payoutDetails = null;

      if (isReturn) {
        if (isCodOrder) {
          const selectedMethod = form.querySelector('input[name="codRefundMethod"]:checked')?.value || 'upi';
          if (selectedMethod === 'upi') {
            const upiId = (codUpiIdInput?.value || '').trim();
            if (!upiId || !upiId.includes('@') || upiId.length < 3) {
              statusMsg.textContent = 'Please provide a valid UPI ID (e.g. yourname@bank).';
              statusMsg.className = 'modal-status-msg is-error';
              codUpiIdInput?.focus();
              return;
            }
            refundMethod = 'upi';
            payoutDetails = { upi_id: upiId };
          } else if (selectedMethod === 'bank_transfer') {
            const accountHolder = (codAccountHolderInput?.value || '').trim();
            const accountNumber = (codAccountNumberInput?.value || '').trim();
            const ifscCode = (codIfscInput?.value || '').trim().toUpperCase();

            if (!accountHolder || accountHolder.length < 2) {
              statusMsg.textContent = 'Please enter a valid Account Holder Name.';
              statusMsg.className = 'modal-status-msg is-error';
              codAccountHolderInput?.focus();
              return;
            }
            if (!accountNumber || accountNumber.length < 6 || accountNumber.length > 35) {
              statusMsg.textContent = 'Please enter a valid Bank Account Number (minimum 6 digits).';
              statusMsg.className = 'modal-status-msg is-error';
              codAccountNumberInput?.focus();
              return;
            }
            if (!ifscCode || ifscCode.length < 8 || ifscCode.length > 15) {
              statusMsg.textContent = 'Please enter a valid Bank IFSC Code (e.g. HDFC0001234).';
              statusMsg.className = 'modal-status-msg is-error';
              codIfscInput?.focus();
              return;
            }
            refundMethod = 'bank_transfer';
            payoutDetails = {
              account_holder_name: accountHolder,
              account_number: accountNumber,
              ifsc_code: ifscCode
            };
          } else {
            statusMsg.textContent = 'Please select a refund method for your COD order.';
            statusMsg.className = 'modal-status-msg is-error';
            return;
          }
        } else {
          refundMethod = 'original_payment_method';
          payoutDetails = null;
        }
      }

      // Validate exactly 3 photos are uploaded
      if (selectedPhotos.length !== 3) {
        statusMsg.textContent = 'Please upload exactly 3 photos before submitting your request.';
        statusMsg.className = 'modal-status-msg is-error';
        return;
      }

      submitBtn.disabled = true;
      submitBtn.querySelector('span').textContent = 'Uploading photos…';
      statusMsg.textContent = '';
      statusMsg.className = 'modal-status-msg';

      try {
        const uploadedImagePaths = [];

        const user = await window.ZaynXwearAuth?.getUser?.();
        const userId = user?.id || (await supabase.auth.getUser())?.data?.user?.id;

        if (!userId) {
          throw new Error('Authentication required to upload photos.');
        }

        for (let i = 0; i < selectedPhotos.length; i++) {
          const photoFile = selectedPhotos[i];
          const ext = photoFile.name.split('.').pop() || 'jpg';
          const cleanExt = ext.toLowerCase().replace(/[^a-z0-9]/g, '');
          const filePath = `${userId}/${order.order_id}/${Date.now()}_${i}_${Math.random().toString(36).slice(2, 6)}.${cleanExt}`;

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('return-evidence')
            .upload(filePath, photoFile, {
              contentType: photoFile.type,
              upsert: false
            });

          if (uploadError) {
            console.error('Storage upload failed:', uploadError);
            throw new Error(`Failed to upload photo "${photoFile.name}": ${uploadError.message}`);
          }

          uploadedImagePaths.push(filePath);
        }

        submitBtn.querySelector('span').textContent = 'Submitting request…';

        const { data, error } = await supabase.rpc('request_order_return', {
          p_order_id: order.order_id,
          p_item_id: itemId || null,
          p_request_type: requestType,
          p_reason: reason,
          p_notes: explanation,
          p_replacement_size: (isExchange && isSizeIssue) ? replacementSize : null,
          p_images: uploadedImagePaths,
          p_refund_method: refundMethod,
          p_payout_details: payoutDetails
        });

        if (error) throw error;

        window.ZaynXwearLogger?.info('customer_return_requested', {
          order_id: order.order_id,
          request_type: requestType,
          reason,
          explanation,
          refund_method: refundMethod,
          photos_count: uploadedImagePaths.length
        });

        statusMsg.textContent = data?.[0]?.message || 'Request submitted successfully.';
        statusMsg.className = 'modal-status-msg is-success';

        setTimeout(async () => {
          closeModal();
          await loadCustomerOrders();
        }, 1500);
      } catch (err) {
        window.ZaynXwearLogger?.error('return_request_failed', { order_id: order.order_id }, err);
        statusMsg.textContent = err.message || 'Unable to submit request. Please try again.';
        statusMsg.className = 'modal-status-msg is-error';
        submitBtn.disabled = false;
        submitBtn.querySelector('span').textContent = 'Submit Request';
      }
    });

    openModal();
  };

  // Initial check
  checkAuthStateAndLoad();
});
