/* ZaynXwear Admin Panel Controller */
const config = window.ZaynXwearAdminConfig;
const orderStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
const orderStatusTransitions = {
  pending: ['pending', 'confirmed', 'cancelled'],
  confirmed: ['confirmed', 'processing', 'cancelled'],
  processing: ['processing', 'shipped', 'cancelled'],
  shipped: ['shipped', 'delivered'],
  delivered: ['delivered'],
  cancelled: ['cancelled']
};
const paymentStatuses = ['pending', 'paid', 'failed', 'refunded'];
const login = document.getElementById('adminLogin');
const denied = document.getElementById('adminDenied');
const dashboard = document.getElementById('adminDashboard');
const headerActions = document.getElementById('adminHeaderActions');
const loginForm = document.getElementById('adminLoginForm');
const loginStatus = document.getElementById('adminLoginStatus');

// Tab & View elements
const tabOverview = document.getElementById('tabOverview');
const tabOrders = document.getElementById('tabOrders');
const tabReturns = document.getElementById('tabReturns');
const tabInventory = document.getElementById('tabInventory');
const tabProducts = document.getElementById('tabProducts');
const tabCategories = document.getElementById('tabCategories');
const tabAttributes = document.getElementById('tabAttributes');
const tabCoupons = document.getElementById('tabCoupons');
const tabBanners = document.getElementById('tabBanners');
const tabLogs = document.getElementById('tabLogs');
const tabWhatsApp = document.getElementById('tabWhatsApp');

const overviewView = document.getElementById('adminOverviewView');
const ordersView = document.getElementById('adminOrdersView');
const returnsView = document.getElementById('adminReturnsView');
const whatsappView = document.getElementById('adminWhatsAppView');
const inventoryView = document.getElementById('adminInventoryView');
const productsView = document.getElementById('adminProductsView');
const categoriesView = document.getElementById('adminCategoriesView');
const attributesView = document.getElementById('adminAttributesView');
const couponsView = document.getElementById('adminCouponsView');
const offersView = document.getElementById('adminOffersView');
const bannersView = document.getElementById('adminBannersView');
const logsView = document.getElementById('adminLogsView');

// WhatsApp Messages elements
const whatsappStatus = document.getElementById('adminWhatsAppStatus');
const whatsappRefresh = document.getElementById('adminWhatsAppRefresh');
const whatsappSearch = document.getElementById('adminWhatsAppSearch');
const whatsappTypeFilter = document.getElementById('adminWhatsAppTypeFilter');
const whatsappDateFilter = document.getElementById('adminWhatsAppDateFilter');
const whatsappCustomDateRange = document.getElementById('adminWhatsAppCustomDateRange');
const whatsappDateFrom = document.getElementById('adminWhatsAppDateFrom');
const whatsappDateTo = document.getElementById('adminWhatsAppDateTo');
const whatsappTable = document.getElementById('adminWhatsAppTable');
const whatsappList = document.getElementById('adminWhatsAppList');
const whatsappEmpty = document.getElementById('adminWhatsAppEmpty');

// Quick filter pills
const waFilterAll = document.getElementById('waFilterAll');
const waFilterAccepted = document.getElementById('waFilterAccepted');
const waFilterShipped = document.getElementById('waFilterShipped');
const waFilterDelivered = document.getElementById('waFilterDelivered');
const waFilterRefund = document.getElementById('waFilterRefund');
const waFilterRefundComplete = document.getElementById('waFilterRefundComplete');
const waFilterExchange = document.getElementById('waFilterExchange');
const waFilterExchangeComplete = document.getElementById('waFilterExchangeComplete');

const waCountAll = document.getElementById('waCountAll');
const waCountAccepted = document.getElementById('waCountAccepted');
const waCountShipped = document.getElementById('waCountShipped');
const waCountDelivered = document.getElementById('waCountDelivered');
const waCountRefund = document.getElementById('waCountRefund');
const waCountRefundComplete = document.getElementById('waCountRefundComplete');
const waCountExchange = document.getElementById('waCountExchange');
const waCountExchangeComplete = document.getElementById('waCountExchangeComplete');

let currentWaTypeFilter = 'all';

// WhatsApp Modal elements
const adminWhatsAppModal = document.getElementById('adminWhatsAppModal');
const adminWhatsAppModalClose = document.getElementById('adminWhatsAppModalClose');
const waModalOrderRef = document.getElementById('waModalOrderRef');
const waModalTypeBadge = document.getElementById('waModalTypeBadge');
const waModalCustomerName = document.getElementById('waModalCustomerName');
const waModalCustomerMobile = document.getElementById('waModalCustomerMobile');
const waMessageTextarea = document.getElementById('waMessageTextarea');
const waCharCount = document.getElementById('waCharCount');
const waResetTemplateBtn = document.getElementById('waResetTemplateBtn');
const waModalCancelBtn = document.getElementById('waModalCancelBtn');
const waModalSendBtn = document.getElementById('waModalSendBtn');

let currentWaModalData = {
  recordId: null,
  recordType: null,
  messageType: null,
  customerMobile: '',
  defaultMessage: ''
};

// Prepaid Offers elements
const offersStatus = document.getElementById('adminOffersStatus');
const offersForm = document.getElementById('adminOffersForm');
const offersRefresh = document.getElementById('adminOffersRefresh');
const prepaidEnableSelect = document.getElementById('prepaidEnableSelect');
const prepaidOfferMode = document.getElementById('prepaidOfferMode');
const singleOfferSection = document.getElementById('singleOfferSection');
const prepaidDiscountType = document.getElementById('prepaidDiscountType');
const prepaidDiscountValue = document.getElementById('prepaidDiscountValue');
const prepaidMinOrderValue = document.getElementById('prepaidMinOrderValue');
const prepaidMaxDiscount = document.getElementById('prepaidMaxDiscount');
const prepaidStartDate = document.getElementById('prepaidStartDate');
const prepaidEndDate = document.getElementById('prepaidEndDate');
const prepaidOfferText = document.getElementById('prepaidOfferText');

// Slabs elements & Modal
const prepaidSlabsSection = document.getElementById('prepaidSlabsSection');
const prepaidSlabsList = document.getElementById('prepaidSlabsList');
const addSlabBtn = document.getElementById('addSlabBtn');
const slabModal = document.getElementById('slabModal');
const slabModalForm = document.getElementById('slabModalForm');
const slabModalTitle = document.getElementById('slabModalTitle');
const slabModalStatus = document.getElementById('slabModalStatus');
const slabEditId = document.getElementById('slabEditId');
const slabMinOrderValue = document.getElementById('slabMinOrderValue');
const slabDiscountType = document.getElementById('slabDiscountType');
const slabDiscountValue = document.getElementById('slabDiscountValue');
const slabIsEnabled = document.getElementById('slabIsEnabled');
const closeSlabModalBtn = document.getElementById('closeSlabModalBtn');
const closeSlabModalCloseBtn = document.getElementById('closeSlabModalCloseBtn');
let currentSlabsList = [];

// Logs elements
const logsStatus = document.getElementById('adminLogsStatus');
const logsRefreshButton = document.getElementById('adminLogsRefresh');
const logsSearch = document.getElementById('adminLogsSearch');
const logsLevelFilter = document.getElementById('adminLogsLevelFilter');
const logsEventFilter = document.getElementById('adminLogsEventFilter');
const logsDateFilter = document.getElementById('adminLogsDateFilter');
const logsCustomDateRange = document.getElementById('adminLogsCustomDateRange');
const logsDateFrom = document.getElementById('adminLogsDateFrom');
const logsDateTo = document.getElementById('adminLogsDateTo');
const logsClearFilters = document.getElementById('adminLogsClearFilters');
const logQuickAll = document.getElementById('logQuickAll');
const logQuickInfo = document.getElementById('logQuickInfo');
const logQuickWarn = document.getElementById('logQuickWarn');
const logQuickError = document.getElementById('logQuickError');
const logsActiveFiltersBar = document.getElementById('adminLogsActiveFiltersBar');
const logsActiveFiltersList = document.getElementById('adminLogsActiveFiltersList');
const logsTable = document.getElementById('adminLogsTable');
const logsList = document.getElementById('adminLogsList');
const logsEmpty = document.getElementById('adminLogsEmpty');
const logsEmptyClearBtn = document.getElementById('adminLogsEmptyClearBtn');
const logsPagination = document.getElementById('adminLogsPagination');
const logsPageInfo = document.getElementById('adminLogsPageInfo');
const logsPrevPage = document.getElementById('adminLogsPrevPage');
const logsNextPage = document.getElementById('adminLogsNextPage');
const logsCurrentPage = document.getElementById('adminLogsCurrentPage');

// Log Detail Modal elements
const logDetailModal = document.getElementById('adminLogDetailModal');
const logDetailCloseBtn = document.getElementById('logDetailCloseBtn');
const logDetailCloseFooterBtn = document.getElementById('logDetailCloseFooterBtn');
const logDetailId = document.getElementById('logDetailId');
const logDetailTimestamp = document.getElementById('logDetailTimestamp');
const logDetailLevelBadge = document.getElementById('logDetailLevelBadge');
const logDetailSource = document.getElementById('logDetailSource');
const logDetailEvent = document.getElementById('logDetailEvent');
const logDetailOrderId = document.getElementById('logDetailOrderId');
const logDetailOrderGroup = document.getElementById('logDetailOrderGroup');
const logDetailErrorBox = document.getElementById('logDetailErrorBox');
const logDetailErrorMessage = document.getElementById('logDetailErrorMessage');
const logDetailJsonCode = document.getElementById('logDetailJsonCode');
const logDetailCopyJsonBtn = document.getElementById('logDetailCopyJsonBtn');

// Overview elements
const overviewStatus = document.getElementById('adminOverviewStatus');
const overviewRefreshButton = document.getElementById('adminOverviewRefresh');
const kpiRevenueVal = document.getElementById('kpiRevenueVal');
const kpiTotalOrdersVal = document.getElementById('kpiTotalOrdersVal');
const kpiActiveOrdersVal = document.getElementById('kpiActiveOrdersVal');
const kpiDeliveredOrdersVal = document.getElementById('kpiDeliveredOrdersVal');
const kpiLowStockVal = document.getElementById('kpiLowStockVal');
const kpiOutOfStockSub = document.getElementById('kpiOutOfStockSub');
const kpiAovVal = document.getElementById('kpiAovVal');
const countPendingOrders = document.getElementById('countPendingOrders');
const countProcessingOrders = document.getElementById('countProcessingOrders');
const countShippedOrders = document.getElementById('countShippedOrders');
const countCancelledOrders = document.getElementById('countCancelledOrders');

const kpiTotalOrdersCard = document.getElementById('kpiTotalOrdersCard');
const kpiActiveOrdersCard = document.getElementById('kpiActiveOrdersCard');
const kpiDeliveredOrdersCard = document.getElementById('kpiDeliveredOrdersCard');
const kpiLowStockCard = document.getElementById('kpiLowStockCard');
const chipPendingOrders = document.getElementById('chipPendingOrders');
const chipProcessingOrders = document.getElementById('chipProcessingOrders');
const chipShippedOrders = document.getElementById('chipShippedOrders');
const chipCancelledOrders = document.getElementById('chipCancelledOrders');

// Orders elements
const status = document.getElementById('adminStatus');
const ordersList = document.getElementById('adminOrdersList');
const empty = document.getElementById('adminEmpty');
const orderSearch = document.getElementById('adminOrderSearch');
const orderStatusFilter = document.getElementById('adminOrderStatusFilter');
const orderPaymentFilter = document.getElementById('adminOrderPaymentFilter');
const orderDateFilter = document.getElementById('adminOrderDateFilter');
const orderCustomDateRange = document.getElementById('adminOrderCustomDateRange');
const orderDateFrom = document.getElementById('adminOrderDateFrom');
const orderDateTo = document.getElementById('adminOrderDateTo');
const detail = document.getElementById('adminOrderDetail');
const refreshButton = document.getElementById('adminRefresh');

// Returns & Exchanges elements
const returnsStatus = document.getElementById('adminReturnsStatus');
const returnsList = document.getElementById('adminReturnsList');
const returnsEmpty = document.getElementById('adminReturnsEmpty');
const returnsSearch = document.getElementById('adminReturnsSearch');
const returnsStatusFilter = document.getElementById('adminReturnsStatusFilter');
const returnsTypeFilter = document.getElementById('adminReturnsTypeFilter');
const returnDetail = document.getElementById('adminReturnDetail');
const returnsRefreshButton = document.getElementById('adminReturnsRefresh');

// Return Reason Modal elements
const returnReasonModal = document.getElementById('adminReturnReasonModal');
const modalReturnId = document.getElementById('modalReturnId');
const modalReturnOrderRef = document.getElementById('modalReturnOrderRef');
const modalReturnTypeBadge = document.getElementById('modalReturnTypeBadge');
const modalReturnStatusBadge = document.getElementById('modalReturnStatusBadge');
const modalReturnCustomer = document.getElementById('modalReturnCustomer');
const modalReturnProduct = document.getElementById('modalReturnProduct');
const modalReturnReplacementWrap = document.getElementById('modalReturnReplacementWrap');
const modalReturnReplacementSize = document.getElementById('modalReturnReplacementSize');
const modalReturnReasonText = document.getElementById('modalReturnReasonText');
const modalReturnNotesWrap = document.getElementById('modalReturnNotesWrap');
const modalReturnNotesText = document.getElementById('modalReturnNotesText');
const returnReasonCloseBtn = document.getElementById('returnReasonCloseBtn');
const returnReasonCloseFooterBtn = document.getElementById('returnReasonCloseFooterBtn');
const returnReasonViewDetailsBtn = document.getElementById('returnReasonViewDetailsBtn');

// Inventory elements
const inventoryStatus = document.getElementById('adminInventoryStatus');
const inventoryList = document.getElementById('adminInventoryList');
const inventoryEmpty = document.getElementById('adminInventoryEmpty');
const inventorySearch = document.getElementById('adminInventorySearch');
const inventoryRefreshButton = document.getElementById('adminInventoryRefresh');
const invFilterAll = document.getElementById('invFilterAll');
const invFilterLow = document.getElementById('invFilterLow');
const invFilterOut = document.getElementById('invFilterOut');
const invCountAll = document.getElementById('invCountAll');
const invCountLow = document.getElementById('invCountLow');
const invCountOut = document.getElementById('invCountOut');
let currentInventoryStockFilter = 'all';

// Products elements
const productsStatus = document.getElementById('adminProductsStatus');
const productsList = document.getElementById('adminProductsList');
const productsEmpty = document.getElementById('adminProductsEmpty');
const productsSearch = document.getElementById('adminProductsSearch');
const productsRefreshButton = document.getElementById('adminProductsRefresh');
const addProductButton = document.getElementById('adminAddProduct');

// Categories elements
const categoriesStatus = document.getElementById('adminCategoriesStatus');
const categoriesList = document.getElementById('adminCategoriesList');
const categoriesEmpty = document.getElementById('adminCategoriesEmpty');
const categoriesSearch = document.getElementById('adminCategoriesSearch');
const categoriesRefreshButton = document.getElementById('adminCategoriesRefresh');
const addCategoryButton = document.getElementById('adminAddCategory');

// Product Families elements
const familiesStatus = document.getElementById('adminFamiliesStatus');
const familiesList = document.getElementById('adminFamiliesList');
const familiesEmpty = document.getElementById('adminFamiliesEmpty');
const familiesSearch = document.getElementById('adminFamiliesSearch');
const familiesRefreshButton = document.getElementById('adminFamiliesRefresh');
const addFamilyButton = document.getElementById('adminAddFamily');

// Add Family Modal elements
const addFamilyModal = document.getElementById('adminAddFamilyModal');
const addFamilyForm = document.getElementById('adminAddFamilyForm');
const addFamilyCloseBtn = document.getElementById('adminAddFamilyCloseBtn');
const addFamilyCancelBtn = document.getElementById('adminAddFamilyCancelBtn');
const addFamilySaveBtn = document.getElementById('adminAddFamilySaveBtn');
const addFamilyStatus = document.getElementById('adminAddFamilyStatus');
const addFamilyName = document.getElementById('addFamilyName');
const addFamilyCategory = document.getElementById('addFamilyCategory');
const addFamilySortOrder = document.getElementById('addFamilySortOrder');
const addFamilyDpPreview = document.getElementById('addFamilyDpPreview');
const addFamilyDpFile = document.getElementById('addFamilyDpFile');
const addFamilyDpUrl = document.getElementById('addFamilyDpUrl');
const addFamilyDescription = document.getElementById('addFamilyDescription');
const addFamilyIsActive = document.getElementById('addFamilyIsActive');

// Edit Family Modal elements
const editFamilyModal = document.getElementById('adminEditFamilyModal');
const editFamilyForm = document.getElementById('adminEditFamilyForm');
const editFamilyCloseBtn = document.getElementById('adminEditFamilyCloseBtn');
const editFamilyCancelBtn = document.getElementById('adminEditFamilyCancelBtn');
const editFamilySaveBtn = document.getElementById('adminEditFamilySaveBtn');
const editFamilyStatus = document.getElementById('adminEditFamilyStatus');
const editFamilyId = document.getElementById('editFamilyId');
const editFamilyName = document.getElementById('editFamilyName');
const editFamilyCategory = document.getElementById('editFamilyCategory');
const editFamilySortOrder = document.getElementById('editFamilySortOrder');
const editFamilyDpPreview = document.getElementById('editFamilyDpPreview');
const editFamilyDpFile = document.getElementById('editFamilyDpFile');
const editFamilyDpUrl = document.getElementById('editFamilyDpUrl');
const editFamilyAdjustBtn = document.getElementById('editFamilyAdjustBtn');
const addFamilyAdjustBtn = document.getElementById('addFamilyAdjustBtn');
const editFamilyDescription = document.getElementById('editFamilyDescription');
const editFamilyIsActive = document.getElementById('editFamilyIsActive');
const editFamilyProductsList = document.getElementById('editFamilyProductsList');

let addFamilyDpState = {
  file: null,
  originalFile: null,
  url: '',
  previewUrl: '',
  hasAdjustment: false
};

let editFamilyDpState = {
  file: null,
  originalFile: null,
  url: '',
  previewUrl: '',
  hasAdjustment: false
};

// Attributes elements (Sizes & Colors)
const sizesStatus = document.getElementById('adminSizesStatus');
const sizesList = document.getElementById('adminSizesList');
const sizesEmpty = document.getElementById('adminSizesEmpty');
const sizesSearch = document.getElementById('adminSizesSearch');
const sizesRefreshButton = document.getElementById('adminSizesRefresh');
const addSizeButton = document.getElementById('adminAddSize');

const colorsStatus = document.getElementById('adminColorsStatus');
const colorsList = document.getElementById('adminColorsList');
const colorsEmpty = document.getElementById('adminColorsEmpty');
const colorsSearch = document.getElementById('adminColorsSearch');
const colorsRefreshButton = document.getElementById('adminColorsRefresh');
const addColorButton = document.getElementById('adminAddColor');

// Coupons elements
const couponsStatus = document.getElementById('adminCouponsStatus');
const couponsList = document.getElementById('adminCouponsList');
const couponsEmpty = document.getElementById('adminCouponsEmpty');
const couponsSearch = document.getElementById('adminCouponsSearch');
const couponsStatusFilter = document.getElementById('adminCouponsStatusFilter');
const couponsRefreshButton = document.getElementById('adminCouponsRefresh');
const addCouponButton = document.getElementById('adminAddCoupon');

// Add Coupon Modal elements
const addCouponModal = document.getElementById('adminAddCouponModal');
const addCouponForm = document.getElementById('adminAddCouponForm');
const addCouponCloseBtn = document.getElementById('addCouponCloseBtn');
const addCouponCancelBtn = document.getElementById('addCouponCancelBtn');
const addCouponSaveBtn = document.getElementById('addCouponSaveBtn');
const addCouponStatus = document.getElementById('addCouponStatus');
const addCouponCode = document.getElementById('addCouponCode');
const addCouponDescription = document.getElementById('addCouponDescription');
const addCouponDiscountType = document.getElementById('addCouponDiscountType');
const addCouponDiscountValue = document.getElementById('addCouponDiscountValue');
const addCouponDiscountValueGroup = document.getElementById('addCouponDiscountValueGroup');
const addCouponDiscountValueLabel = document.getElementById('addCouponDiscountValueLabel');
const addCouponDiscountValueHint = document.getElementById('addCouponDiscountValueHint');
const addCouponMinimumOrder = document.getElementById('addCouponMinimumOrder');
const addCouponMaxDiscountGroup = document.getElementById('addCouponMaxDiscountGroup');
const addCouponMaxDiscount = document.getElementById('addCouponMaxDiscount');
const addCouponStartAt = document.getElementById('addCouponStartAt');
const addCouponEndAt = document.getElementById('addCouponEndAt');
const addCouponUsageLimit = document.getElementById('addCouponUsageLimit');
const addCouponIsActive = document.getElementById('addCouponIsActive');

// Edit Coupon Modal elements
const editCouponModal = document.getElementById('adminEditCouponModal');
const editCouponForm = document.getElementById('adminEditCouponForm');
const editCouponCloseBtn = document.getElementById('editCouponCloseBtn');
const editCouponCancelBtn = document.getElementById('editCouponCancelBtn');
const editCouponSaveBtn = document.getElementById('editCouponSaveBtn');
const editCouponStatus = document.getElementById('editCouponStatus');
const editCouponId = document.getElementById('editCouponId');
const editCouponCode = document.getElementById('editCouponCode');
const editCouponDescription = document.getElementById('editCouponDescription');
const editCouponDiscountType = document.getElementById('editCouponDiscountType');
const editCouponDiscountValue = document.getElementById('editCouponDiscountValue');
const editCouponDiscountValueGroup = document.getElementById('editCouponDiscountValueGroup');
const editCouponDiscountValueLabel = document.getElementById('editCouponDiscountValueLabel');
const editCouponDiscountValueHint = document.getElementById('editCouponDiscountValueHint');
const editCouponMinimumOrder = document.getElementById('editCouponMinimumOrder');
const editCouponMaxDiscountGroup = document.getElementById('editCouponMaxDiscountGroup');
const editCouponMaxDiscount = document.getElementById('editCouponMaxDiscount');
const editCouponStartAt = document.getElementById('editCouponStartAt');
const editCouponEndAt = document.getElementById('editCouponEndAt');
const editCouponUsageLimit = document.getElementById('editCouponUsageLimit');
const editCouponUsageCount = document.getElementById('editCouponUsageCount');
const editCouponIsActive = document.getElementById('editCouponIsActive');

// Delete Coupon Modal elements
const deleteCouponModal = document.getElementById('adminDeleteCouponModal');
const deleteCouponCloseBtn = document.getElementById('deleteCouponCloseBtn');
const deleteCouponCancelBtn = document.getElementById('deleteCouponCancelBtn');
const deleteCouponConfirmBtn = document.getElementById('deleteCouponConfirmBtn');
const deleteCouponStatus = document.getElementById('deleteCouponStatus');
const deleteCouponModalEyebrow = document.getElementById('deleteCouponModalEyebrow');
const deleteCouponModalTitle = document.getElementById('deleteCouponModalTitle');
const deleteCouponWarning = document.getElementById('deleteCouponWarning');
const deleteCouponCode = document.getElementById('deleteCouponCode');
const deleteCouponDiscountSubtext = document.getElementById('deleteCouponDiscountSubtext');
const deleteCouponUsageNotice = document.getElementById('deleteCouponUsageNotice');

// Banners elements
const bannersStatus = document.getElementById('adminBannersStatus');
const bannersList = document.getElementById('adminBannersList');
const bannersEmpty = document.getElementById('adminBannersEmpty');
const bannersSearch = document.getElementById('adminBannersSearch');
const bannersStatusFilter = document.getElementById('adminBannersStatusFilter');
const bannersRefreshButton = document.getElementById('adminBannersRefresh');
const addBannerButton = document.getElementById('adminAddBanner');

// Add Banner Modal elements
const addBannerModal = document.getElementById('adminAddBannerModal');
const addBannerForm = document.getElementById('adminAddBannerForm');
const addBannerCloseBtn = document.getElementById('addBannerCloseBtn');
const addBannerCancelBtn = document.getElementById('addBannerCancelBtn');
const addBannerSaveBtn = document.getElementById('addBannerSaveBtn');
const addBannerStatus = document.getElementById('addBannerStatus');
const addBannerDesktopDropzone = document.getElementById('addBannerDesktopDropzone');
const addBannerDesktopFile = document.getElementById('addBannerDesktopFile');
const addBannerDesktopPrompt = document.getElementById('addBannerDesktopPrompt');
const addBannerDesktopPreviewWrapper = document.getElementById('addBannerDesktopPreviewWrapper');
const addBannerDesktopPreviewImg = document.getElementById('addBannerDesktopPreviewImg');
const addBannerDesktopRemoveBtn = document.getElementById('addBannerDesktopRemoveBtn');
const addBannerDesktopAdjustBtn = document.getElementById('addBannerDesktopAdjustBtn');
const addBannerDesktopProgress = document.getElementById('addBannerDesktopProgress');
const addBannerDesktopUrl = document.getElementById('addBannerDesktopUrl');
const addBannerTabletDropzone = document.getElementById('addBannerTabletDropzone');
const addBannerTabletFile = document.getElementById('addBannerTabletFile');
const addBannerTabletPrompt = document.getElementById('addBannerTabletPrompt');
const addBannerTabletPreviewWrapper = document.getElementById('addBannerTabletPreviewWrapper');
const addBannerTabletPreviewImg = document.getElementById('addBannerTabletPreviewImg');
const addBannerTabletRemoveBtn = document.getElementById('addBannerTabletRemoveBtn');
const addBannerTabletAdjustBtn = document.getElementById('addBannerTabletAdjustBtn');
const addBannerTabletProgress = document.getElementById('addBannerTabletProgress');
const addBannerTabletUrl = document.getElementById('addBannerTabletUrl');
const addBannerMobileDropzone = document.getElementById('addBannerMobileDropzone');
const addBannerMobileFile = document.getElementById('addBannerMobileFile');
const addBannerMobilePrompt = document.getElementById('addBannerMobilePrompt');
const addBannerMobilePreviewWrapper = document.getElementById('addBannerMobilePreviewWrapper');
const addBannerMobilePreviewImg = document.getElementById('addBannerMobilePreviewImg');
const addBannerMobileRemoveBtn = document.getElementById('addBannerMobileRemoveBtn');
const addBannerMobileAdjustBtn = document.getElementById('addBannerMobileAdjustBtn');
const addBannerMobileProgress = document.getElementById('addBannerMobileProgress');
const addBannerMobileUrl = document.getElementById('addBannerMobileUrl');
const addBannerBadgeText = document.getElementById('addBannerBadgeText');
const addBannerHeading = document.getElementById('addBannerHeading');
const addBannerSubheading = document.getElementById('addBannerSubheading');
const addBannerButtonText = document.getElementById('addBannerButtonText');
const addBannerButtonLink = document.getElementById('addBannerButtonLink');

// Add Banner Animation & Customize Elements
const addBannerBadgeAnimType = document.getElementById('addBannerBadgeAnimType');
const addBannerBadgeAnimDelay = document.getElementById('addBannerBadgeAnimDelay');
const addBannerBadgeAnimDur = document.getElementById('addBannerBadgeAnimDur');
const addBannerHeadingAnimType = document.getElementById('addBannerHeadingAnimType');
const addBannerHeadingAnimDelay = document.getElementById('addBannerHeadingAnimDelay');
const addBannerHeadingAnimDur = document.getElementById('addBannerHeadingAnimDur');
const addBannerSubheadingAnimType = document.getElementById('addBannerSubheadingAnimType');
const addBannerSubheadingAnimDelay = document.getElementById('addBannerSubheadingAnimDelay');
const addBannerSubheadingAnimDur = document.getElementById('addBannerSubheadingAnimDur');
const addBannerButtonAnimType = document.getElementById('addBannerButtonAnimType');
const addBannerButtonAnimDelay = document.getElementById('addBannerButtonAnimDelay');
const addBannerButtonAnimDur = document.getElementById('addBannerButtonAnimDur');
const addBannerCustomizeTextBtn = document.getElementById('addBannerCustomizeTextBtn');
const addBannerPreviewAnimBtn = document.getElementById('addBannerPreviewAnimBtn');
const addBannerAnimPreviewStage = document.getElementById('addBannerAnimPreviewStage');
const addBannerStageBadgeWrap = document.getElementById('addBannerStageBadgeWrap');
const addBannerStageBadge = document.getElementById('addBannerStageBadge');
const addBannerStageHeading = document.getElementById('addBannerStageHeading');
const addBannerStageSubheading = document.getElementById('addBannerStageSubheading');
const addBannerStageCta = document.getElementById('addBannerStageCta');
const addBannerStageBtn = document.getElementById('addBannerStageBtn');

const addBannerAnimationType = document.getElementById('addBannerAnimationType');
const addBannerAutoplayInterval = document.getElementById('addBannerAutoplayInterval');
const addBannerAutoplay = document.getElementById('addBannerAutoplay');
const addBannerKenBurns = document.getElementById('addBannerKenBurns');
const addBannerDisplayOrder = document.getElementById('addBannerDisplayOrder');
const addBannerIsActive = document.getElementById('addBannerIsActive');

// Edit Banner Modal elements
const editBannerModal = document.getElementById('adminEditBannerModal');
const editBannerForm = document.getElementById('adminEditBannerForm');
const editBannerCloseBtn = document.getElementById('editBannerCloseBtn');
const editBannerCancelBtn = document.getElementById('editBannerCancelBtn');
const editBannerSaveBtn = document.getElementById('editBannerSaveBtn');
const editBannerStatus = document.getElementById('editBannerStatus');
const editBannerId = document.getElementById('editBannerId');
const editBannerDesktopDropzone = document.getElementById('editBannerDesktopDropzone');
const editBannerDesktopFile = document.getElementById('editBannerDesktopFile');
const editBannerDesktopPrompt = document.getElementById('editBannerDesktopPrompt');
const editBannerDesktopPreviewWrapper = document.getElementById('editBannerDesktopPreviewWrapper');
const editBannerDesktopPreviewImg = document.getElementById('editBannerDesktopPreviewImg');
const editBannerDesktopRemoveBtn = document.getElementById('editBannerDesktopRemoveBtn');
const editBannerDesktopAdjustBtn = document.getElementById('editBannerDesktopAdjustBtn');
const editBannerDesktopProgress = document.getElementById('editBannerDesktopProgress');
const editBannerDesktopUrl = document.getElementById('editBannerDesktopUrl');
const editBannerTabletDropzone = document.getElementById('editBannerTabletDropzone');
const editBannerTabletFile = document.getElementById('editBannerTabletFile');
const editBannerTabletPrompt = document.getElementById('editBannerTabletPrompt');
const editBannerTabletPreviewWrapper = document.getElementById('editBannerTabletPreviewWrapper');
const editBannerTabletPreviewImg = document.getElementById('editBannerTabletPreviewImg');
const editBannerTabletRemoveBtn = document.getElementById('editBannerTabletRemoveBtn');
const editBannerTabletAdjustBtn = document.getElementById('editBannerTabletAdjustBtn');
const editBannerTabletProgress = document.getElementById('editBannerTabletProgress');
const editBannerTabletUrl = document.getElementById('editBannerTabletUrl');
const editBannerMobileDropzone = document.getElementById('editBannerMobileDropzone');
const editBannerMobileFile = document.getElementById('editBannerMobileFile');
const editBannerMobilePrompt = document.getElementById('editBannerMobilePrompt');
const editBannerMobilePreviewWrapper = document.getElementById('editBannerMobilePreviewWrapper');
const editBannerMobilePreviewImg = document.getElementById('editBannerMobilePreviewImg');
const editBannerMobileRemoveBtn = document.getElementById('editBannerMobileRemoveBtn');
const editBannerMobileAdjustBtn = document.getElementById('editBannerMobileAdjustBtn');
const editBannerMobileProgress = document.getElementById('editBannerMobileProgress');
const editBannerMobileUrl = document.getElementById('editBannerMobileUrl');
const editBannerBadgeText = document.getElementById('editBannerBadgeText');
const editBannerHeading = document.getElementById('editBannerHeading');
const editBannerSubheading = document.getElementById('editBannerSubheading');
const editBannerButtonText = document.getElementById('editBannerButtonText');
const editBannerButtonLink = document.getElementById('editBannerButtonLink');

// Edit Banner Animation & Customize Elements
const editBannerBadgeAnimType = document.getElementById('editBannerBadgeAnimType');
const editBannerBadgeAnimDelay = document.getElementById('editBannerBadgeAnimDelay');
const editBannerBadgeAnimDur = document.getElementById('editBannerBadgeAnimDur');
const editBannerHeadingAnimType = document.getElementById('editBannerHeadingAnimType');
const editBannerHeadingAnimDelay = document.getElementById('editBannerHeadingAnimDelay');
const editBannerHeadingAnimDur = document.getElementById('editBannerHeadingAnimDur');
const editBannerSubheadingAnimType = document.getElementById('editBannerSubheadingAnimType');
const editBannerSubheadingAnimDelay = document.getElementById('editBannerSubheadingAnimDelay');
const editBannerSubheadingAnimDur = document.getElementById('editBannerSubheadingAnimDur');
const editBannerButtonAnimType = document.getElementById('editBannerButtonAnimType');
const editBannerButtonAnimDelay = document.getElementById('editBannerButtonAnimDelay');
const editBannerButtonAnimDur = document.getElementById('editBannerButtonAnimDur');
const editBannerCustomizeTextBtn = document.getElementById('editBannerCustomizeTextBtn');
const editBannerPreviewAnimBtn = document.getElementById('editBannerPreviewAnimBtn');
const editBannerAnimPreviewStage = document.getElementById('editBannerAnimPreviewStage');
const editBannerStageBadgeWrap = document.getElementById('editBannerStageBadgeWrap');
const editBannerStageBadge = document.getElementById('editBannerStageBadge');
const editBannerStageHeading = document.getElementById('editBannerStageHeading');
const editBannerStageSubheading = document.getElementById('editBannerStageSubheading');
const editBannerStageCta = document.getElementById('editBannerStageCta');
const editBannerStageBtn = document.getElementById('editBannerStageBtn');

// Visual Banner Text Customizer Modal Elements
const adminTextCustomizeModal = document.getElementById('adminTextCustomizeModal');
const textCustomizeCloseBtn = document.getElementById('textCustomizeCloseBtn');
const textCustomizeCancelBtn = document.getElementById('textCustomizeCancelBtn');
const textCustomizeApplyBtn = document.getElementById('textCustomizeApplyBtn');
const textCustResetBtn = document.getElementById('textCustResetBtn');
const textCustSizeDec = document.getElementById('textCustSizeDec');
const textCustSizeValue = document.getElementById('textCustSizeValue');
const textCustSizeInc = document.getElementById('textCustSizeInc');
const textCustFontSelect = document.getElementById('textCustFontSelect');
const adminTextCustomizeCanvasContainer = document.getElementById('adminTextCustomizeCanvasContainer');
const adminTextCustomizeCanvas = document.getElementById('adminTextCustomizeCanvas');
const textCustStageBadgeWrap = document.getElementById('textCustStageBadgeWrap');
const textCustStageBadge = document.getElementById('textCustStageBadge');
const textCustStageHeading = document.getElementById('textCustStageHeading');
const textCustStageSubheading = document.getElementById('textCustStageSubheading');
const textCustStageCta = document.getElementById('textCustStageCta');
const textCustStageBtn = document.getElementById('textCustStageBtn');

// Visual Banner Text Customizer Color Elements
const textCustColorsWrapper = document.getElementById('textCustColorsWrapper');
const textCustColorPalette = document.getElementById('textCustColorPalette');
const textCustColorScopeGroup = document.getElementById('textCustColorScopeGroup');
const textCustScopeFull = document.getElementById('textCustScopeFull');
const textCustScopeWord = document.getElementById('textCustScopeWord');
const textCustScopeLetter = document.getElementById('textCustScopeLetter');
const textCustTokenBar = document.getElementById('textCustTokenBar');
const textCustTokenLabel = document.getElementById('textCustTokenLabel');
const textCustTokenChips = document.getElementById('textCustTokenChips');
const textCustClearElementColorsBtn = document.getElementById('textCustClearElementColorsBtn');

// Expandable Custom Color Picker elements
const textCustCustomPickerTrigger = document.getElementById('textCustCustomPickerTrigger');
const textCustColorPickerPopover = document.getElementById('textCustColorPickerPopover');
const textCustPopoverCloseBtn = document.getElementById('textCustPopoverCloseBtn');
const textCustExtendedPalette = document.getElementById('textCustExtendedPalette');
const textCustNativeColorInput = document.getElementById('textCustNativeColorInput');
const textCustCustomPreview = document.getElementById('textCustCustomPreview');
const textCustHexInput = document.getElementById('textCustHexInput');
const textCustApplyCustomColorBtn = document.getElementById('textCustApplyCustomColorBtn');

const editBannerAnimationType = document.getElementById('editBannerAnimationType');
const editBannerAutoplayInterval = document.getElementById('editBannerAutoplayInterval');
const editBannerAutoplay = document.getElementById('editBannerAutoplay');
const editBannerKenBurns = document.getElementById('editBannerKenBurns');
const editBannerDisplayOrder = document.getElementById('editBannerDisplayOrder');
const editBannerIsActive = document.getElementById('editBannerIsActive');

// Delete Banner Modal elements
const deleteBannerModal = document.getElementById('adminDeleteBannerModal');
const deleteBannerCloseBtn = document.getElementById('deleteBannerCloseBtn');
const deleteBannerCancelBtn = document.getElementById('deleteBannerCancelBtn');
const deleteBannerConfirmBtn = document.getElementById('deleteBannerConfirmBtn');
const deleteBannerStatus = document.getElementById('deleteBannerStatus');
const deleteBannerHeadingText = document.getElementById('deleteBannerHeadingText');
const deleteBannerSubheadingText = document.getElementById('deleteBannerSubheadingText');
const deleteBannerOrderText = document.getElementById('deleteBannerOrderText');

function createDemoSupabaseClient() {
  const mockData = window.ZaynXwearMockData || { products: [], categories: [], families: [], banners: [] };

  const initialCategories = (mockData.categories || []).map((cat, idx) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    description: `${cat.name} Collection`,
    is_active: true,
    sort_order: idx + 1,
    discount_type: 'none',
    discount_value: 0,
    discount_is_active: false,
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 30).toISOString()
  }));

  const initialFamilies = (mockData.families || []).map((fam, idx) => ({
    id: fam.id,
    name: fam.name,
    slug: fam.slug,
    category_id: fam.category_id,
    category_name: (initialCategories.find(c => c.id === fam.category_id) || {}).name || '',
    category_slug: (initialCategories.find(c => c.id === fam.category_id) || {}).slug || '',
    description: fam.description || `${fam.name} style`,
    display_image: fam.display_image || 'images/de490593b2c52fd6f19df8b228bb2bc3.jpg',
    is_active: true,
    sort_order: idx + 1,
    created_at: new Date(Date.now() - 86400000 * 20).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 20).toISOString(),
    category: initialCategories.find(c => c.id === fam.category_id) || null,
    products: []
  }));

  const initialProducts = (mockData.products || []).map(p => {
    const rawVariants = Array.isArray(p.variants) && p.variants.length > 0 ? p.variants : [
      { id: `${p.id}-var-1`, sku: `ZX-${(p.slug || p.id).toUpperCase().slice(0, 8)}-M`, title: 'M', color: 'Standard', size: 'M', price: p.price, availableStock: p.availableStock || 25 }
    ];

    const variants = rawVariants.map((v, vIdx) => ({
      id: v.id || `${p.id}-var-${vIdx + 1}`,
      product_id: p.id,
      sku: v.sku || `ZX-${(p.slug || p.id).toUpperCase().slice(0, 8)}-${vIdx + 1}`,
      title: v.title || v.size || 'Standard Fit',
      color: v.color || '',
      size: v.size || 'M',
      price_paise: Math.round((v.price || p.price) * 100),
      mrp_paise: Math.round((p.mrp || (p.price * 1.3)) * 100),
      sale_price_paise: Math.round((v.price || p.price) * 100),
      pricing_mode: 'custom',
      stock_quantity: v.availableStock !== undefined ? v.availableStock : (p.availableStock || 20),
      reserved_quantity: 0,
      is_active: true,
      sort_order: vIdx + 1,
      images: v.images || p.gallery || (p.image ? [p.image] : [])
    }));

    const totalStock = variants.reduce((sum, v) => sum + (v.stock_quantity || 0), 0);
    const cat = initialCategories.find(c => c.id === p.category || c.slug === p.category) || initialCategories[0];
    const fam = initialFamilies.find(f => f.id === p.family_id) || null;

    return {
      id: p.id,
      name: p.name,
      slug: p.slug || p.id,
      price_paise: Math.round(p.price * 100),
      mrp_paise: Math.round((p.mrp || (p.price * 1.3)) * 100),
      sale_price_paise: Math.round(p.price * 100),
      pricing_mode: 'custom',
      category_id: cat ? cat.id : 't-shirts',
      currency: 'INR',
      category: cat ? cat.name : 'T-Shirts',
      category_slug: cat ? cat.slug : 't-shirts',
      description: p.description || `${p.name} - premium streetwear designed in Nashik.`,
      images: p.gallery && p.gallery.length > 0 ? p.gallery : (p.image ? [p.image] : ['images/de490593b2c52fd6f19df8b228bb2bc3.jpg']),
      alt_text: p.name,
      is_active: true,
      stock_quantity: totalStock,
      reserved_quantity: 0,
      family_id: p.family_id || '',
      family_name: fam ? fam.name : '',
      variety_name: p.variety_name || '',
      product_mode: p.family_id ? 'family_parent' : 'standalone',
      product_variants: variants,
      variants: variants,
      category_obj: cat,
      family_obj: fam,
      created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 2).toISOString()
    };
  });

  initialFamilies.forEach(fam => {
    fam.products = initialProducts.filter(p => p.family_id === fam.id).map(p => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      is_active: p.is_active
    }));
  });

  const initialSizes = [
    { id: 'sz-1', name: 'S', sort_order: 1, is_active: true },
    { id: 'sz-2', name: 'M', sort_order: 2, is_active: true },
    { id: 'sz-3', name: 'L', sort_order: 3, is_active: true },
    { id: 'sz-4', name: 'XL', sort_order: 4, is_active: true },
    { id: 'sz-5', name: 'XXL', sort_order: 5, is_active: true }
  ];

  const initialColors = [
    { id: 'cl-1', name: 'White', hex_code: '#FFFFFF', sort_order: 1, is_active: true },
    { id: 'cl-2', name: 'Black', hex_code: '#000000', sort_order: 2, is_active: true },
    { id: 'cl-3', name: 'Navy Blue', hex_code: '#0A192F', sort_order: 3, is_active: true },
    { id: 'cl-4', name: 'Olive Green', hex_code: '#556B2F', sort_order: 4, is_active: true },
    { id: 'cl-5', name: 'Charcoal Grey', hex_code: '#36454F', sort_order: 5, is_active: true },
    { id: 'cl-6', name: 'Beige', hex_code: '#F5F5DC', sort_order: 6, is_active: true }
  ];

  const initialCoupons = [
    {
      id: 'cp-1',
      code: 'WELCOME10',
      description: '10% discount on first streetwear order',
      discount_type: 'percentage',
      discount_value: 10,
      min_order_paise: 50000,
      max_discount_paise: 50000,
      usage_limit: 500,
      usage_count: 42,
      is_active: true,
      starts_at: new Date(Date.now() - 86400000 * 30).toISOString(),
      expires_at: new Date(Date.now() + 86400000 * 60).toISOString(),
      created_at: new Date(Date.now() - 86400000 * 30).toISOString()
    },
    {
      id: 'cp-2',
      code: 'DEMO10',
      description: '10% demo discount across store',
      discount_type: 'percentage',
      discount_value: 10,
      min_order_paise: 49900,
      max_discount_paise: 30000,
      usage_limit: 1000,
      usage_count: 18,
      is_active: true,
      starts_at: new Date(Date.now() - 86400000 * 30).toISOString(),
      expires_at: new Date(Date.now() + 86400000 * 90).toISOString(),
      created_at: new Date(Date.now() - 86400000 * 30).toISOString()
    },
    {
      id: 'cp-3',
      code: 'STREET20',
      description: '20% flat discount on heavy orders',
      discount_type: 'percentage',
      discount_value: 20,
      min_order_paise: 99900,
      max_discount_paise: 60000,
      usage_limit: 200,
      usage_count: 35,
      is_active: true,
      starts_at: new Date(Date.now() - 86400000 * 10).toISOString(),
      expires_at: new Date(Date.now() + 86400000 * 45).toISOString(),
      created_at: new Date(Date.now() - 86400000 * 10).toISOString()
    }
  ];

  let savedLocalOrders = [];
  try {
    const ordersKey = 'ecommerce-demo-orders';
    const legacyOrdersKey = 'zaynxwear-demo-orders';
    let raw = localStorage.getItem(ordersKey);
    if (!raw) {
      raw = localStorage.getItem(legacyOrdersKey);
      if (raw) {
        localStorage.setItem(ordersKey, raw);
        localStorage.removeItem(legacyOrdersKey);
      }
    }
    savedLocalOrders = JSON.parse(raw || '[]');
  } catch (e) {}

  const baseDemoOrders = [
    {
      id: 'ord-demo-1',
      reference: 'ZX-849201',
      customer_full_name: 'Rahul Sharma',
      customer_mobile: '9876543210',
      customer_email: 'rahul.sharma@example.com',
      shipping_address: 'Flat 402, Green Acres, College Road',
      shipping_city: 'Nashik',
      shipping_state: 'Maharashtra',
      shipping_pincode: '422005',
      created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
      subtotal_paise: 79900,
      total_paise: 79900,
      currency: 'INR',
      payment_method: 'cod',
      payment_status: 'pending',
      order_status: 'shipped',
      courier_partner: 'Delhivery Surface',
      tracking_number: 'ZX-EXP-99281726',
      tracking_url: 'https://www.delhivery.com/track/package/ZX-EXP-99281726',
      customer: { full_name: 'Rahul Sharma', mobile: '9876543210', email: 'rahul.sharma@example.com' },
      order_items: [
        {
          id: 'item-demo-1',
          product_id: 'collar-t-shirt-full-sleeve',
          product_name: 'Collar T-Shirt Full Sleeve',
          variant_title: 'M / White',
          color: 'White',
          size: 'M',
          quantity: 1,
          unit_price_paise: 79900,
          line_total_paise: 79900
        }
      ],
      return_requests: [],
      order_refunds: []
    },
    {
      id: 'ord-demo-2',
      reference: 'ZX-102938',
      customer_full_name: 'Aman Verma',
      customer_mobile: '9823145678',
      customer_email: 'aman.verma@example.com',
      shipping_address: 'B-12, Koregaon Park Road',
      shipping_city: 'Pune',
      shipping_state: 'Maharashtra',
      shipping_pincode: '411001',
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      subtotal_paise: 99900,
      total_paise: 94905,
      currency: 'INR',
      payment_method: 'razorpay',
      payment_status: 'paid',
      order_status: 'delivered',
      courier_partner: 'BlueDart Express',
      tracking_number: 'BD-77189201',
      tracking_url: 'https://www.bluedart.com',
      customer: { full_name: 'Aman Verma', mobile: '9823145678', email: 'aman.verma@example.com' },
      order_items: [
        {
          id: 'item-demo-2',
          product_id: 'oversized-streetwear-tee',
          product_name: 'Oversized Streetwear Tee',
          variant_title: 'M / Black',
          color: 'Black',
          size: 'M',
          quantity: 1,
          unit_price_paise: 99900,
          line_total_paise: 99900
        }
      ],
      return_requests: [{ id: 'ret-demo-1', request_type: 'exchange', status: 'pending' }],
      order_refunds: []
    },
    {
      id: 'ord-demo-3',
      reference: 'ZX-772910',
      customer_full_name: 'Pooja Mehta',
      customer_mobile: '9988776655',
      customer_email: 'pooja.mehta@example.com',
      shipping_address: '14/C, Bandra West',
      shipping_city: 'Mumbai',
      shipping_state: 'Maharashtra',
      shipping_pincode: '400050',
      created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
      subtotal_paise: 129900,
      total_paise: 123405,
      currency: 'INR',
      payment_method: 'razorpay',
      payment_status: 'paid',
      order_status: 'shipped',
      courier_partner: 'Delhivery Surface',
      tracking_number: 'ZX-EXP-33829104',
      tracking_url: 'https://www.delhivery.com',
      customer: { full_name: 'Pooja Mehta', mobile: '9988776655', email: 'pooja.mehta@example.com' },
      order_items: [
        {
          id: 'item-demo-3',
          product_id: 'baggy-denim-jeans',
          product_name: 'Baggy Denim Jeans',
          variant_title: '32 / Blue',
          color: 'Blue',
          size: '32',
          quantity: 1,
          unit_price_paise: 129900,
          line_total_paise: 129900
        }
      ],
      return_requests: [],
      order_refunds: []
    }
  ];

  const normalizedSavedOrders = savedLocalOrders.map((o, idx) => ({
    id: o.orderId || o.order_id || `ord-placed-${idx + 1}`,
    reference: o.reference || o.order_reference || `ZX-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    customer_full_name: o.shipping_address?.fullName || o.customer_full_name || 'Demo Customer',
    customer_mobile: o.shipping_address?.mobile || o.customer_mobile || '9876543210',
    customer_email: o.shipping_address?.email || o.customer_email || 'customer@example.com',
    shipping_address: o.shipping_address?.address || o.shipping_address || 'Main Street',
    shipping_city: o.shipping_address?.city || o.shipping_city || 'Nashik',
    shipping_state: o.shipping_address?.state || o.shipping_state || 'Maharashtra',
    shipping_pincode: o.shipping_address?.pincode || o.shipping_pincode || '422001',
    created_at: o.created_at || new Date().toISOString(),
    subtotal_paise: o.subtotal_paise || (o.subtotal ? o.subtotal * 100 : 79900),
    total_paise: o.total_paise || (o.total ? o.total * 100 : 79900),
    currency: 'INR',
    payment_method: o.payment_method || 'cod',
    payment_status: o.payment_status || (o.payment_method === 'cod' ? 'pending' : 'paid'),
    order_status: o.order_status || 'confirmed',
    courier_partner: o.courier_partner || '',
    tracking_number: o.tracking_number || '',
    tracking_url: o.tracking_url || '',
    customer: { full_name: o.shipping_address?.fullName || 'Demo Customer', mobile: o.shipping_address?.mobile || '9876543210', email: o.shipping_address?.email || 'customer@example.com' },
    order_items: (o.items || []).map((it, i) => ({
      id: `item-placed-${idx}-${i}`,
      product_id: it.product_id || it.id,
      product_name: it.product_name || it.name,
      variant_title: it.variant_title || it.variantTitle || 'Standard Fit',
      color: it.color || '',
      size: it.size || '',
      quantity: it.quantity || 1,
      unit_price_paise: it.unit_price_paise || (it.price ? it.price * 100 : 79900),
      line_total_paise: it.line_total_paise || (it.price && it.quantity ? it.price * it.quantity * 100 : 79900)
    })),
    return_requests: [],
    order_refunds: []
  }));

  const initialOrders = [...normalizedSavedOrders, ...baseDemoOrders];

  const initialReturns = [
    {
      id: 'ret-demo-1',
      order_id: 'ord-demo-2',
      customer_id: 'cust-demo-2',
      request_type: 'exchange',
      reason: 'size_too_small',
      customer_notes: 'Need Size L instead of M, fabric is awesome though!',
      images: ['images/ca2e03bc34d1c75b624003e138376397.jpg'],
      status: 'pending',
      admin_notes: '',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date(Date.now() - 86400000).toISOString(),
      order: {
        id: 'ord-demo-2',
        reference: 'ZX-102938',
        customer_full_name: 'Aman Verma',
        customer_mobile: '9823145678'
      },
      items: [
        {
          id: 'ret-item-1',
          order_item_id: 'item-demo-2',
          quantity: 1,
          reason: 'size_too_small',
          order_item: {
            product_name: 'Oversized Streetwear Tee',
            variant_title: 'M / Black',
            color: 'Black',
            size: 'M',
            unit_price_paise: 99900
          }
        }
      ]
    }
  ];

  const initialBanners = [
    {
      id: 'banner-demo-1',
      desktop_image: 'images/ca2e03bc34d1c75b624003e138376397.jpg',
      mobile_image: 'images/ca2e03bc34d1c75b624003e138376397.jpg',
      tablet_image: 'images/ca2e03bc34d1c75b624003e138376397.jpg',
      badge_text: 'NEW ARRIVAL',
      heading: 'GEN Z STREETWEAR',
      subheading: 'Born in Nashik. Built for a generation that defines its own style.',
      button_text: 'Shop The Drop',
      button_link: 'index.html#shop',
      animation_type: 'fade',
      enable_ken_burns: true,
      text_animations: {},
      text_positions: {},
      display_order: 1,
      is_active: true,
      created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 10).toISOString()
    },
    {
      id: 'banner-demo-2',
      desktop_image: 'images/de490593b2c52fd6f19df8b228bb2bc3.jpg',
      mobile_image: 'images/de490593b2c52fd6f19df8b228bb2bc3.jpg',
      tablet_image: 'images/de490593b2c52fd6f19df8b228bb2bc3.jpg',
      badge_text: 'LIMITED DROP',
      heading: 'URBAN HEAVYWEIGHT TEES',
      subheading: '240 GSM French Terry Cotton. Clean structure, oversized silhouette.',
      button_text: 'Explore T-Shirts',
      button_link: 'index.html#shop',
      animation_type: 'slide-up',
      enable_ken_burns: false,
      text_animations: {},
      text_positions: {},
      display_order: 2,
      is_active: true,
      created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 5).toISOString()
    }
  ];

  const initialLogs = [
    {
      id: 'log-1',
      level: 'info',
      source: 'checkout',
      event: 'order_created',
      order_id: 'ord-demo-1',
      error_message: null,
      payload: { reference: 'ZX-849201', total: 799, payment: 'cod' },
      created_at: new Date(Date.now() - 3600000 * 4).toISOString()
    },
    {
      id: 'log-2',
      level: 'info',
      source: 'coupon',
      event: 'coupon_applied',
      order_id: 'ord-demo-2',
      error_message: null,
      payload: { code: 'WELCOME10', discount_paise: 9990 },
      created_at: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: 'log-3',
      level: 'info',
      source: 'inventory',
      event: 'stock_synchronized',
      order_id: null,
      error_message: null,
      payload: { synced_products: 18, mode: 'auto' },
      created_at: new Date(Date.now() - 86400000 * 3).toISOString()
    },
    {
      id: 'log-4',
      level: 'warn',
      source: 'payment',
      event: 'payment_retry',
      order_id: 'ord-demo-3',
      error_message: 'UPI app switch delayed by customer',
      payload: { retry_count: 1, method: 'razorpay_upi' },
      created_at: new Date(Date.now() - 86400000 * 4).toISOString()
    },
    {
      id: 'log-5',
      level: 'info',
      source: 'returns',
      event: 'return_requested',
      order_id: 'ord-demo-2',
      error_message: null,
      payload: { type: 'exchange', reason: 'size_too_small' },
      created_at: new Date(Date.now() - 86400000).toISOString()
    }
  ];

  const db = {
    orders: initialOrders,
    return_requests: initialReturns,
    products: initialProducts,
    product_families: initialFamilies,
    product_variants: initialProducts.flatMap(p => p.product_variants || []),
    categories: initialCategories,
    store_sizes: initialSizes,
    store_colors: initialColors,
    coupons: initialCoupons,
    coupon_usages: [],
    banners: initialBanners,
    app_logs: initialLogs,
    order_refunds: []
  };

  let demoPrepaidOffer = {
    is_enabled: true,
    offer_mode: 'single',
    discount_type: 'percentage',
    discount_value: 5,
    min_order_value_paise: 0,
    max_discount_paise: 50000,
    start_at: null,
    end_at: null,
    offer_text: 'Pay Online & Get 5% OFF',
    slabs: []
  };

  function from(table) {
    if (!db[table]) db[table] = [];
    const tableData = db[table];
    let action = 'select';
    let filters = [];
    let sortField = null;
    let sortAsc = true;
    let secondarySortField = null;
    let secondarySortAsc = true;
    let rangeFrom = null;
    let rangeTo = null;
    let isSingle = false;
    let updatePayload = null;

    const b = {
      select(cols, opts) {
        action = 'select';
        return b;
      },
      insert(payload) {
        action = 'insert';
        const items = Array.isArray(payload) ? payload : [payload];
        items.forEach(it => {
          if (!it.id) it.id = 'demo-' + Math.random().toString(36).slice(2, 9);
          if (!it.created_at) it.created_at = new Date().toISOString();
          if (!it.updated_at) it.updated_at = new Date().toISOString();
          tableData.unshift(it);
        });
        return b;
      },
      update(payload) {
        action = 'update';
        updatePayload = payload;
        return b;
      },
      delete() {
        action = 'delete';
        return b;
      },
      eq(field, val) {
        filters.push(it => String(it[field]) === String(val));
        return b;
      },
      neq(field, val) {
        filters.push(it => String(it[field]) !== String(val));
        return b;
      },
      in(field, vals) {
        filters.push(it => Array.isArray(vals) && vals.includes(it[field]));
        return b;
      },
      gte(field, val) {
        filters.push(it => it[field] >= val);
        return b;
      },
      lte(field, val) {
        filters.push(it => it[field] <= val);
        return b;
      },
      or(expr) {
        return b;
      },
      order(field, { ascending = true } = {}) {
        if (!sortField) {
          sortField = field;
          sortAsc = ascending;
        } else {
          secondarySortField = field;
          secondarySortAsc = ascending;
        }
        return b;
      },
      range(fromIdx, toIdx) {
        rangeFrom = fromIdx;
        rangeTo = toIdx;
        return b;
      },
      limit(n) {
        rangeFrom = 0;
        rangeTo = n - 1;
        return b;
      },
      single() {
        isSingle = true;
        return b;
      },
      maybeSingle() {
        isSingle = true;
        return b;
      },
      then(onFulfilled, onRejected) {
        let res;
        if (action === 'insert') {
          res = { data: tableData, error: null };
        } else if (action === 'update') {
          tableData.forEach(it => {
            if (filters.every(f => f(it))) {
              Object.assign(it, updatePayload);
              it.updated_at = new Date().toISOString();
            }
          });
          res = { data: null, error: null };
        } else if (action === 'delete') {
          db[table] = tableData.filter(it => !filters.every(f => f(it)));
          res = { data: null, error: null };
        } else {
          let list = tableData.filter(it => filters.every(f => f(it)));
          const count = list.length;
          if (sortField) {
            list.sort((a, b) => {
              const valA = a[sortField] ?? '';
              const valB = b[sortField] ?? '';
              if (valA < valB) return sortAsc ? -1 : 1;
              if (valA > valB) return sortAsc ? 1 : -1;
              if (secondarySortField) {
                const sA = a[secondarySortField] ?? '';
                const sB = b[secondarySortField] ?? '';
                if (sA < sB) return secondarySortAsc ? -1 : 1;
                if (sA > sB) return secondarySortAsc ? 1 : -1;
              }
              return 0;
            });
          }
          if (rangeFrom !== null && rangeTo !== null) {
            list = list.slice(rangeFrom, rangeTo + 1);
          }
          res = isSingle
            ? { data: list[0] || null, error: null, count }
            : { data: list, error: null, count };
        }
        return Promise.resolve(res).then(onFulfilled, onRejected);
      }
    };
    return b;
  }

  async function rpc(name, params = {}) {
    if (name === 'admin_update_return_request_status') {
      const req = db.return_requests.find(r => r.id === params.p_request_id);
      if (req) {
        req.status = params.p_status;
        req.admin_notes = params.p_admin_notes || req.admin_notes;
        req.updated_at = new Date().toISOString();
      }
      return { data: { success: true }, error: null };
    }
    if (name === 'admin_mark_cod_refund_paid') {
      const order = db.orders.find(o => o.id === params.p_order_id);
      if (order) {
        order.payment_status = 'refunded';
      }
      return { data: { success: true }, error: null };
    }
    if (name === 'admin_update_variant_stock') {
      for (const prod of db.products) {
        const v = (prod.product_variants || []).find(vr => vr.id === params.p_variant_id);
        if (v) {
          v.stock_quantity = Number(params.p_quantity);
          prod.stock_quantity = (prod.product_variants || []).reduce((s, vr) => s + (vr.stock_quantity || 0), 0);
          break;
        }
      }
      return { data: { success: true }, error: null };
    }
    if (name === 'admin_update_product_stock') {
      const prod = db.products.find(p => p.id === params.p_product_id);
      if (prod) {
        prod.stock_quantity = Number(params.p_quantity);
      }
      return { data: { success: true }, error: null };
    }
    if (name === 'sync_product_stock_from_variants') {
      const prod = db.products.find(p => p.id === params.p_product_id);
      if (prod && Array.isArray(prod.product_variants)) {
        prod.stock_quantity = prod.product_variants.reduce((s, vr) => s + (vr.stock_quantity || 0), 0);
      }
      return { data: { success: true }, error: null };
    }
    if (name === 'admin_delete_product') {
      db.products = db.products.filter(p => p.id !== params.p_product_id);
      return { data: { success: true }, error: null };
    }
    if (name === 'get_active_prepaid_offer') {
      return { data: [ demoPrepaidOffer ], error: null };
    }
    if (name === 'admin_update_prepaid_offer_settings') {
      Object.assign(demoPrepaidOffer, params);
      return { data: { success: true }, error: null };
    }
    if (name === 'admin_manage_prepaid_offer_slabs') {
      return { data: { success: true }, error: null };
    }
    return { data: { success: true }, error: null };
  }

  const auth = {
    async getUser() {
      let saved = null;
      try {
        const adminKey = 'ecommerce-admin-demo-session';
        const legacyAdminKey = 'zaynxwear-admin-demo-session';
        let raw = localStorage.getItem(adminKey) || localStorage.getItem(legacyAdminKey);
        saved = JSON.parse(raw || 'null');
      } catch (e) {}
      return { data: { user: saved }, error: null };
    },
    async getSession() {
      let saved = null;
      try {
        const adminKey = 'ecommerce-admin-demo-session';
        const legacyAdminKey = 'zaynxwear-admin-demo-session';
        let raw = localStorage.getItem(adminKey) || localStorage.getItem(legacyAdminKey);
        saved = JSON.parse(raw || 'null');
      } catch (e) {}
      return { data: { session: saved ? { user: saved, access_token: 'demo-admin-token' } : null }, error: null };
    },
    async signInWithPassword({ email, password }) {
      const demoUser = {
        id: 'demo-admin-001',
        email: email || 'admin@ecommercedemo.com',
        app_metadata: { role: 'admin' },
        user_metadata: { full_name: 'E-Commerce Demo Admin' }
      };
      try {
        localStorage.setItem('ecommerce-admin-demo-session', JSON.stringify(demoUser));
        localStorage.removeItem('zaynxwear-admin-demo-session');
      } catch (e) {}
      return { data: { user: demoUser, session: { access_token: 'demo-admin-token' } }, error: null };
    },
    async signOut() {
      try {
        localStorage.removeItem('ecommerce-admin-demo-session');
        localStorage.removeItem('zaynxwear-admin-demo-session');
      } catch (e) {}
      return { error: null };
    }
  };

  const storage = {
    from: (bucket) => ({
      async createSignedUrl(path, expiry) {
        return { data: { signedUrl: path }, error: null };
      },
      async upload(path, file) {
        return { data: { path: (typeof URL !== 'undefined' && URL.createObjectURL) ? URL.createObjectURL(file) : path }, error: null };
      },
      async remove(paths) {
        return { data: paths, error: null };
      },
      getPublicUrl(path) {
        return { data: { publicUrl: path } };
      }
    })
  };

  return { from, rpc, auth, storage };
}

const supabase = (config?.isDemoMode || !config?.supabaseUrl)
  ? createDemoSupabaseClient()
  : null;

let selectedOrderId = null;
let selectedReturnId = null;
let orders = [];
let returnRequests = [];
let inventory = [];
let products = [];
let productFamilies = [];
const collapsedProductGroups = new Set();
let categories = [];
let storeSizes = [];
let storeColors = [];
let coupons = [];
let banners = [];
let couponPendingDelete = null;
let couponDeleteMode = 'delete';
let bannerPendingDelete = null;
let currentTab = 'orders';

// In-memory file state for Banner modal uploads
const addBannerState = {
  desktopFile: null,
  desktopBlobUrl: '',
  currentDesktopUrl: '',
  mobileFile: null,
  mobileBlobUrl: '',
  currentMobileUrl: '',
  tabletFile: null,
  tabletBlobUrl: '',
  currentTabletUrl: '',
  textPositions: {
    badge: { x: 0, y: 0 },
    heading: { x: 0, y: 0 },
    subheading: { x: 0, y: 0 },
    button: { x: 0, y: 0 }
  }
};

const editBannerState = {
  desktopFile: null,
  desktopBlobUrl: '',
  currentDesktopUrl: '',
  mobileFile: null,
  mobileBlobUrl: '',
  currentMobileUrl: '',
  tabletFile: null,
  tabletBlobUrl: '',
  currentTabletUrl: '',
  textPositions: {
    badge: { x: 0, y: 0 },
    heading: { x: 0, y: 0 },
    subheading: { x: 0, y: 0 },
    button: { x: 0, y: 0 }
  }
};

const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
const formatMoney = (paise, currency = 'INR') => new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 2 }).format(Number(paise || 0) / 100);
const formatDate = value => new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
const isAdmin = user => user?.app_metadata?.role === 'admin';

function calculateDiscountPercent(mrp, salePrice) {
  const m = Number(mrp);
  const s = Number(salePrice);
  if (!Number.isFinite(m) || !Number.isFinite(s) || m <= 0) return 0;
  if (s >= m) return 0;
  return Math.round(((m - s) / m) * 100);
}

function renderDiscountBadge(mrp, salePrice, customClass = '') {
  const m = Number(mrp);
  const s = Number(salePrice);
  if (!Number.isFinite(m) || !Number.isFinite(s)) {
    return `<span class="admin-discount-badge is-zero ${customClass}">0% OFF</span>`;
  }
  if (s > m && m > 0) {
    return `<span class="admin-discount-badge is-invalid ${customClass}" title="Sale price cannot exceed MRP">Invalid</span>`;
  }
  if (m <= 0 || s === m || s > m) {
    return `<span class="admin-discount-badge is-zero ${customClass}">0% OFF</span>`;
  }
  const pct = calculateDiscountPercent(m, s);
  if (pct <= 0) {
    return `<span class="admin-discount-badge is-zero ${customClass}">0% OFF</span>`;
  }
  return `<span class="admin-discount-badge ${customClass}">${pct}% OFF</span>`;
}

function getCategoryDiscountRule(categoryNameOrId) {
  if (!categoryNameOrId || !categories || !categories.length) return null;
  const target = String(categoryNameOrId).trim().toLowerCase();
  return categories.find(c =>
    (c.id && c.id === categoryNameOrId) ||
    (c.name && c.name.toLowerCase() === target) ||
    (c.slug && c.slug.toLowerCase() === target)
  ) || null;
}

function updateProductPricingModeUI(modeSelect, mrpInput, salePriceInput, badgeEl, categorySelect, hintEl) {
  const mode = modeSelect ? modeSelect.value : 'custom';
  const mrp = Math.max(0, Number(mrpInput?.value) || 0);
  const categoryName = categorySelect?.value || '';
  const catRule = getCategoryDiscountRule(categoryName);

  if (mode === 'none') {
    if (salePriceInput) {
      salePriceInput.value = mrp;
      salePriceInput.readOnly = true;
      salePriceInput.style.backgroundColor = '#f1f5f9';
    }
    if (badgeEl) {
      badgeEl.innerHTML = '<span class="admin-discount-badge is-zero">0% OFF (Full MRP)</span>';
    }
    if (hintEl) {
      hintEl.textContent = 'Selling price is fixed to full MRP (no discounts).';
    }
  } else if (mode === 'category') {
    if (salePriceInput) {
      salePriceInput.readOnly = true;
      salePriceInput.style.backgroundColor = '#f0fdf4';
    }
    if (catRule && catRule.discount_is_active && catRule.discount_type && catRule.discount_type !== 'none' && Number(catRule.discount_value) > 0) {
      let effective = mrp;
      let discountText = '';
      if (catRule.discount_type === 'percentage') {
        const pct = Math.min(100, Math.max(0, Number(catRule.discount_value)));
        effective = Math.round(mrp * (100 - pct) / 100);
        discountText = `${pct}% OFF`;
      } else if (catRule.discount_type === 'fixed') {
        const fixedRupees = Math.round(Number(catRule.discount_value) / 100);
        effective = Math.max(0, mrp - fixedRupees);
        discountText = `₹${fixedRupees} OFF`;
      }
      if (salePriceInput) {
        salePriceInput.value = effective;
      }
      if (badgeEl) {
        badgeEl.innerHTML = `<span class="admin-discount-badge" style="background:#dcfce7;color:#15803d;border-color:#86efac;">${discountText} (Category Rule)</span>`;
      }
      if (hintEl) {
        hintEl.textContent = `Auto-calculated using "${catRule.name}" category discount rule (${discountText}).`;
      }
    } else {
      if (salePriceInput) {
        salePriceInput.value = mrp;
      }
      if (badgeEl) {
        badgeEl.innerHTML = '<span class="admin-discount-badge is-zero">Category rule inactive (Full MRP)</span>';
      }
      if (hintEl) {
        hintEl.textContent = 'Category currently has no active discount rule; pricing falls back safely to full MRP.';
      }
    }
  } else {
    // 'custom'
    if (salePriceInput) {
      salePriceInput.readOnly = false;
      salePriceInput.style.backgroundColor = '';
    }
    if (badgeEl) {
      badgeEl.innerHTML = renderDiscountBadge(mrpInput?.value, salePriceInput?.value);
    }
    if (hintEl) {
      hintEl.textContent = 'Custom fixed sale price overrides category discount rules.';
    }
  }
}

function setVisible(element, visible) { if (element) element.hidden = !visible; }
function setOverviewStatus(message = '', error = false) { if (overviewStatus) { overviewStatus.textContent = message; overviewStatus.classList.toggle('is-error', error); } }
function setStatus(message = '', error = false) { if (status) { status.textContent = message; status.classList.toggle('is-error', error); } }
function setInventoryStatus(message = '', error = false) { if (inventoryStatus) { inventoryStatus.textContent = message; inventoryStatus.classList.toggle('is-error', error); } }
function setProductsStatus(message = '', error = false) { if (productsStatus) { productsStatus.textContent = message; productsStatus.classList.toggle('is-error', error); } }
function setCategoriesStatus(message = '', error = false) { if (categoriesStatus) { categoriesStatus.textContent = message; categoriesStatus.classList.toggle('is-error', error); } }
function setSizesStatus(message = '', error = false) { if (sizesStatus) { sizesStatus.textContent = message; sizesStatus.classList.toggle('is-error', error); } }
function setColorsStatus(message = '', error = false) { if (colorsStatus) { colorsStatus.textContent = message; colorsStatus.classList.toggle('is-error', error); } }
function setCouponsStatus(message = '', error = false) { if (couponsStatus) { couponsStatus.textContent = message; couponsStatus.classList.toggle('is-error', error); } }
function setBannersStatus(message = '', error = false) { if (bannersStatus) { bannersStatus.textContent = message; bannersStatus.classList.toggle('is-error', error); } }

function getProductStockFlags(product) {
  const variants = Array.isArray(product.product_variants) && product.product_variants.length > 0
    ? product.product_variants.filter(v => v.is_active !== false)
    : [{ stock_quantity: product.stock_quantity, reserved_quantity: product.reserved_quantity }];

  let hasLow = false;
  let hasOut = false;
  let lowCount = 0;
  let outCount = 0;

  variants.forEach(v => {
    const avail = Math.max(0, (Number(v.stock_quantity) || 0) - (Number(v.reserved_quantity) || 0));
    if (avail <= 0) {
      hasOut = true;
      outCount++;
    } else if (avail <= 5) {
      hasLow = true;
      lowCount++;
    }
  });

  return { hasLow, hasOut, lowCount, outCount, totalVariants: variants.length };
}

function renderOverview() {
  // 1. Revenue & AOV calculation based on inspected business rules
  const revenueOrders = orders.filter(o =>
    o.order_status !== 'cancelled' &&
    (
      o.payment_status === 'paid' ||
      (o.payment_method === 'cod' && o.order_status === 'delivered')
    )
  );

  const totalRevenuePaise = revenueOrders.reduce(
    (sum, o) => sum + (o.total_paise || 0),
    0
  );
  const totalRevenueRupees = totalRevenuePaise / 100;

  const aovRupees = revenueOrders.length > 0
    ? totalRevenueRupees / revenueOrders.length
    : 0;

  // 2. Order status counts
  const totalOrdersCount = orders.length;
  const activeOrdersCount = orders.filter(o =>
    ['pending', 'confirmed', 'processing', 'shipped'].includes(o.order_status)
  ).length;
  const deliveredOrdersCount = orders.filter(o => o.order_status === 'delivered').length;
  const pendingOrdersCount = orders.filter(o => o.order_status === 'pending').length;
  const processingOrdersCount = orders.filter(o => o.order_status === 'processing').length;
  const shippedOrdersCount = orders.filter(o => o.order_status === 'shipped').length;
  const cancelledOrdersCount = orders.filter(o => o.order_status === 'cancelled').length;

  // 3. Low stock & out of stock calculations using shared inventory helper
  let lowStockCount = 0;
  let outOfStockCount = 0;

  inventory.forEach(product => {
    const flags = getProductStockFlags(product);
    lowStockCount += flags.lowCount;
    outOfStockCount += flags.outCount;
  });

  // Render to DOM elements
  if (kpiRevenueVal) kpiRevenueVal.textContent = `₹${Math.round(totalRevenueRupees).toLocaleString('en-IN')}`;
  if (kpiTotalOrdersVal) kpiTotalOrdersVal.textContent = String(totalOrdersCount);
  if (kpiActiveOrdersVal) kpiActiveOrdersVal.textContent = String(activeOrdersCount);
  if (kpiDeliveredOrdersVal) kpiDeliveredOrdersVal.textContent = String(deliveredOrdersCount);
  if (kpiLowStockVal) kpiLowStockVal.textContent = String(lowStockCount);
  if (kpiOutOfStockSub) kpiOutOfStockSub.textContent = `${outOfStockCount} out of stock variants`;
  if (kpiAovVal) kpiAovVal.textContent = `₹${Math.round(aovRupees).toLocaleString('en-IN')}`;

  if (countPendingOrders) countPendingOrders.textContent = String(pendingOrdersCount);
  if (countProcessingOrders) countProcessingOrders.textContent = String(processingOrdersCount);
  if (countShippedOrders) countShippedOrders.textContent = String(shippedOrdersCount);
  if (countCancelledOrders) countCancelledOrders.textContent = String(cancelledOrdersCount);
}

async function loadOverviewData(announce = true) {
  if (announce) setOverviewStatus('Loading overview…');
  try {
    const promises = [];
    if (!orders.length) promises.push(loadOrders());
    if (!inventory.length) promises.push(loadInventory(false));
    if (promises.length) await Promise.all(promises);
    renderOverview();
    if (announce) setOverviewStatus();
  } catch (err) {
    if (announce) setOverviewStatus('Unable to load overview data.', true);
  }
}

function switchTab(tabName) {
  currentTab = tabName;

  tabOverview?.classList.toggle('is-active', tabName === 'overview');
  tabOverview?.setAttribute('aria-selected', String(tabName === 'overview'));

  tabOrders?.classList.toggle('is-active', tabName === 'orders');
  tabOrders?.setAttribute('aria-selected', String(tabName === 'orders'));

  tabReturns?.classList.toggle('is-active', tabName === 'returns');
  tabReturns?.setAttribute('aria-selected', String(tabName === 'returns'));

  tabWhatsApp?.classList.toggle('is-active', tabName === 'whatsapp');
  tabWhatsApp?.setAttribute('aria-selected', String(tabName === 'whatsapp'));

  tabInventory?.classList.toggle('is-active', tabName === 'inventory');
  tabInventory?.setAttribute('aria-selected', String(tabName === 'inventory'));

  tabProducts?.classList.toggle('is-active', tabName === 'products');
  tabProducts?.setAttribute('aria-selected', String(tabName === 'products'));

  tabCategories?.classList.toggle('is-active', tabName === 'categories');
  tabCategories?.setAttribute('aria-selected', String(tabName === 'categories'));

  tabAttributes?.classList.toggle('is-active', tabName === 'attributes');
  tabAttributes?.setAttribute('aria-selected', String(tabName === 'attributes'));

  tabCoupons?.classList.toggle('is-active', tabName === 'coupons');
  tabCoupons?.setAttribute('aria-selected', String(tabName === 'coupons'));

  tabOffers?.classList.toggle('is-active', tabName === 'offers');
  tabOffers?.setAttribute('aria-selected', String(tabName === 'offers'));

  tabBanners?.classList.toggle('is-active', tabName === 'banners');
  tabBanners?.setAttribute('aria-selected', String(tabName === 'banners'));

  tabLogs?.classList.toggle('is-active', tabName === 'logs');
  tabLogs?.setAttribute('aria-selected', String(tabName === 'logs'));

  setVisible(overviewView, tabName === 'overview');
  setVisible(ordersView, tabName === 'orders');
  setVisible(returnsView, tabName === 'returns');
  setVisible(whatsappView, tabName === 'whatsapp');
  setVisible(inventoryView, tabName === 'inventory');
  setVisible(productsView, tabName === 'products');
  setVisible(categoriesView, tabName === 'categories');
  setVisible(attributesView, tabName === 'attributes');
  setVisible(couponsView, tabName === 'coupons');
  setVisible(offersView, tabName === 'offers');
  setVisible(bannersView, tabName === 'banners');
  setVisible(logsView, tabName === 'logs');

  if (tabName === 'offers') {
    loadPrepaidOfferSettings();
  }

  if (tabName === 'overview') {
    if (!orders.length || !inventory.length) loadOverviewData(true);
    else renderOverview();
  } else if (tabName === 'orders') {
    if (!orders.length) loadOrders();
    else renderOrders();
  } else if (tabName === 'returns') {
    if (!returnRequests.length) loadReturnRequests(true);
    else renderReturnRequests();
  } else if (tabName === 'whatsapp') {
    if (!orders.length || !returnRequests.length) {
      loadWhatsAppMessagesData(true);
    } else {
      renderWhatsAppMessages();
    }
  } else if (tabName === 'inventory') {
    if (!inventory.length) loadInventory(false);
    else renderInventory();
  } else if (tabName === 'products') {
    if (!products.length) loadProducts(false);
    else renderProducts();
  } else if (tabName === 'categories') {
    if (!categories.length) loadCategories(true);
    else renderCategories();
  } else if (tabName === 'attributes') {
    if (!storeSizes.length) loadSizes(false);
    else renderSizes();
    if (!storeColors.length) loadColors(false);
    else renderColors();
  } else if (tabName === 'coupons') {
    if (!coupons.length) loadCoupons(true);
    else renderCoupons();
  } else if (tabName === 'banners') {
    if (!banners.length) loadBanners(true);
    else renderBanners();
  } else if (tabName === 'logs') {
    loadLogs(true);
  }
}

function showLogin(message = '') {
  setVisible(login, true); setVisible(denied, false); setVisible(dashboard, false); setVisible(headerActions, false);
  loginStatus.textContent = message;
  const emailInput = document.getElementById('adminEmail');
  const passInput = document.getElementById('adminPassword');
  if (emailInput && !emailInput.value) emailInput.value = 'admin@ecommercedemo.com';
  if (passInput && !passInput.value) passInput.value = 'demo123456';
}

function showDenied() {
  setVisible(login, false); setVisible(denied, true); setVisible(dashboard, false); setVisible(headerActions, false);
}

function showDashboard(user) {
  setVisible(login, false); setVisible(denied, false); setVisible(dashboard, true); setVisible(headerActions, true);
  document.getElementById('adminUser').textContent = user.email || 'Administrator';
}

function statusBadge(value, type) {
  return `<span class="admin-badge admin-badge-${type} admin-badge-${escapeHtml(value)}">${escapeHtml(value)}</span>`;
}

function customerName(order) { return order.customer?.full_name || order.customer_full_name; }

function emptyState(title, message) {
  empty.innerHTML = `<strong>${escapeHtml(title)}</strong><span>${escapeHtml(message)}</span>`;
}

function filteredOrders() {
  const query = (orderSearch?.value || '').trim().toLowerCase();
  const statusFilter = orderStatusFilter?.value || 'all';
  const paymentFilter = orderPaymentFilter?.value || 'all';
  const dateFilter = orderDateFilter?.value || 'all';

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const last7Days = now.getTime() - 7 * 24 * 60 * 60 * 1000;
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  let customFrom = null;
  let customTo = null;
  if (dateFilter === 'custom') {
    if (orderDateFrom?.value) {
      customFrom = new Date(`${orderDateFrom.value}T00:00:00`).getTime();
    }
    if (orderDateTo?.value) {
      customTo = new Date(`${orderDateTo.value}T23:59:59.999`).getTime();
    }
  }

  return orders.filter(order => {
    // 1. Order Status Filter
    const matchesStatus = statusFilter === 'all' || order.order_status === statusFilter;
    if (!matchesStatus) return false;

    // 2. Payment Status Filter
    const matchesPayment = paymentFilter === 'all' || order.payment_status === paymentFilter;
    if (!matchesPayment) return false;

    // 3. Date Range Filter (using client local timestamps)
    const orderTime = new Date(order.created_at).getTime();
    if (!Number.isNaN(orderTime)) {
      if (dateFilter === 'today' && orderTime < startOfToday) return false;
      if (dateFilter === 'last7' && orderTime < last7Days) return false;
      if (dateFilter === 'thisMonth' && orderTime < startOfMonth) return false;
      if (dateFilter === 'custom') {
        if (customFrom && orderTime < customFrom) return false;
        if (customTo && orderTime > customTo) return false;
      }
    }

    // 4. Text Search Filter (reference, customer name, mobile, courier, tracking number)
    if (query) {
      const searchable = [
        order.reference,
        customerName(order),
        order.customer_mobile,
        order.customer?.mobile,
        order.courier_partner,
        order.tracking_number
      ].filter(Boolean).join(' ').toLowerCase();

      if (!searchable.includes(query)) return false;
    }

    return true;
  });
}

function renderOrders() {
  const visibleOrders = filteredOrders();
  empty.hidden = visibleOrders.length > 0;
  emptyState(
    orders.length === 0 ? 'No orders yet' : 'No matching orders',
    orders.length === 0 ? 'New checkout orders will appear here.' : 'Try another search or status filter.'
  );
  ordersList.innerHTML = visibleOrders.map(order => {
    let retBadgeHtml = '';
    if (Array.isArray(order.return_requests) && order.return_requests.length > 0) {
      const latestRet = order.return_requests[0];
      const typeLabel = latestRet.request_type === 'exchange' ? 'Exchange' : 'Return';
      retBadgeHtml = `<span class="admin-badge admin-badge-return admin-badge-${escapeHtml(latestRet.status)}" title="${typeLabel} ${latestRet.status.replace(/_/g, ' ')}" style="font-size:10px;padding:2px 6px;margin-left:4px;">${typeLabel}: ${escapeHtml(latestRet.status.replace(/_/g, ' '))}</span>`;
    }
    return `<tr><td><button class="admin-order-link" type="button" data-order-id="${escapeHtml(order.id)}"><strong>${escapeHtml(order.reference)}</strong><span>${escapeHtml(order.customer_mobile)}</span></button></td><td>${escapeHtml(customerName(order))}</td><td>${escapeHtml(formatDate(order.created_at))}</td><td>${escapeHtml(formatMoney(order.total_paise, order.currency))}</td><td>${statusBadge(order.payment_method, 'payment-method')} ${statusBadge(order.payment_status, 'payment')}</td><td>${statusBadge(order.order_status, 'order')}${retBadgeHtml}</td></tr>`;
  }).join('');
  ordersList.querySelectorAll('[data-order-id]').forEach(button => button.addEventListener('click', () => loadOrderDetails(button.dataset.orderId)));
}

async function loadOrders() {
  setStatus('Loading orders…');
  empty.hidden = true;
  ordersList.innerHTML = '';
  const { data, error } = await supabase
    .from('orders')
    .select('id, reference, customer_full_name, customer_mobile, customer_email, shipping_address, shipping_city, shipping_state, shipping_pincode, created_at, total_paise, currency, payment_method, payment_status, order_status, courier_partner, tracking_number, tracking_url, customer:customers!orders_customer_id_fkey(full_name, mobile, email), order_items(id, product_name, variant_title, color, size, quantity, unit_price_paise, line_total_paise), return_requests(id, request_type, status), order_refunds(*)')
    .order('created_at', { ascending: false });

  if (error) {
    setStatus('Unable to load orders. Please refresh and try again.', true);
    return;
  }
  setStatus();
  orders = data || [];
  renderOrders();
  if (currentTab === 'overview') renderOverview();
  if (currentTab === 'whatsapp') renderWhatsAppMessages();
  if (selectedOrderId && orders.some(order => order.id === selectedOrderId)) await loadOrderDetails(selectedOrderId, false);
}

async function loadOrderDetails(orderId, announce = true) {
  selectedOrderId = orderId;
  if (announce) detail.innerHTML = '<div class="admin-detail-placeholder">Loading order details…</div>';
  const { data: order, error } = await supabase
    .from('orders')
    .select('id, reference, customer_full_name, customer_mobile, customer_email, shipping_address, shipping_city, shipping_state, shipping_pincode, subtotal_paise, total_paise, currency, payment_method, payment_status, order_status, courier_partner, tracking_number, tracking_url, created_at, customer:customers!orders_customer_id_fkey(full_name, mobile, email), order_items(id, product_id, product_name, variant_title, color, size, unit_price_paise, quantity, line_total_paise), return_requests(*), order_refunds(*)')
    .eq('id', orderId)
    .single();

  if (error || !order) {
    if (error) {
      console.error('Failed to load order details:', {
        orderId,
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      window.ZaynXwearLogger?.error('admin_load_order_details_failed', {
        orderId,
        errorCode: error.code,
        errorMessage: error.message,
        errorDetails: error.details,
        errorHint: error.hint
      }, error);
    }
    detail.innerHTML = '<div class="admin-detail-placeholder is-error">Unable to load this order. Please try again.</div>';
    return;
  }
  renderOrderDetail(order);
}

function allowedOrderStatuses(currentStatus) {
  return orderStatusTransitions[currentStatus] || orderStatuses;
}

function selectOptions(values, selected, allowedValues = values) {
  return values.map(value => `<option value="${value}"${value === selected ? ' selected' : ''}${allowedValues.includes(value) ? '' : ' disabled'}>${value}</option>`).join('');
}

function renderOrderDetail(order) {
  const customer = order.customer || {};
  const items = order.order_items || [];
  const returns = order.return_requests || [];
  const refunds = order.order_refunds || [];

  const isShippedOrDelivered = ['shipped', 'delivered'].includes(order.order_status);
  const hasTracking = Boolean(order.courier_partner || order.tracking_number || order.tracking_url);

  let trackingDisplayHtml = '';
  if (hasTracking || isShippedOrDelivered) {
    let linkHtml = '';
    if (order.tracking_url) {
      const rawUrl = String(order.tracking_url).trim();
      const safeUrl = rawUrl.startsWith('http://') || rawUrl.startsWith('https://')
        ? rawUrl
        : `https://${rawUrl}`;
      linkHtml = `<a href="${escapeHtml(safeUrl)}" target="_blank" rel="noopener noreferrer" class="admin-tracking-link">🚚 Track Shipment ↗</a>`;
    }

    trackingDisplayHtml = `
      <section class="admin-detail-section">
        <h3>Shipment &amp; Tracking</h3>
        <dl>
          <dt>Courier</dt>
          <dd>${escapeHtml(order.courier_partner || 'Not specified')}</dd>
          <dt>Tracking #</dt>
          <dd>${order.tracking_number ? `<code>${escapeHtml(order.tracking_number)}</code>` : 'Not provided'}</dd>
          ${linkHtml ? `<dt>Live Link</dt><dd>${linkHtml}</dd>` : ''}
        </dl>
      </section>
    `;
  }

  // Returns section (Read-only summary with link to Returns & Exchanges section)
  let returnsDisplayHtml = '';
  if (returns.length > 0) {
    returnsDisplayHtml = `
      <section class="admin-detail-section" style="background:#fffbeb;padding:16px;border-radius:8px;border:1px solid #fde68a;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
          <h3 style="color:#92400e;margin:0;font-size:14px;">Return &amp; Exchange Requests (${returns.length})</h3>
        </div>
        ${returns.map(ret => `
          <div style="margin-bottom:12px;padding-bottom:12px;border-bottom:1px dashed #fde68a;">
            <p style="margin:0 0 4px;font-size:13px;">
              <strong>Type:</strong> ${escapeHtml(ret.request_type.toUpperCase())} &nbsp;|&nbsp;
              <strong>Status:</strong> <span class="admin-badge admin-badge-return admin-badge-${escapeHtml(ret.status)}">${escapeHtml(ret.status.replace(/_/g, ' '))}</span>
            </p>
            <p style="margin:0 0 4px;font-size:13px;"><strong>Reason:</strong> ${escapeHtml(ret.reason)}</p>
            ${ret.requested_replacement_size ? `<p style="margin:0 0 4px;font-size:13px;color:#1d4ed8;font-weight:600;"><strong>Replacement Size:</strong> ${escapeHtml(ret.requested_replacement_size)}</p>` : ''}
            ${ret.customer_notes ? `<p style="margin:0 0 8px;font-size:13px;color:#64748b;"><em>"${escapeHtml(ret.customer_notes)}"</em></p>` : ''}
            
            <div style="margin-top:8px;">
              <button type="button" class="btn btn-sm btn-outline admin-view-return-btn" data-return-id="${escapeHtml(ret.id)}">View in Returns &amp; Exchanges →</button>
            </div>
          </div>
        `).join('')}
      </section>
    `;
  }

  // Refunds section
  let refundsDisplayHtml = '';
  if (refunds.length > 0) {
    refundsDisplayHtml = `
      <section class="admin-detail-section" style="background:#f0fdf4;padding:16px;border-radius:8px;border:1px solid #bbf7d0;">
        <h3 style="color:#166534;margin-top:0;">Refund Records (${refunds.length})</h3>
        ${refunds.map(ref => `
          <div style="font-size:13px;margin-bottom:8px;">
            <p style="margin:0 0 4px;">
              <strong>Amount:</strong> ${escapeHtml(formatMoney(ref.amount_paise, order.currency))} &nbsp;|&nbsp;
              <strong>Status:</strong> <span class="admin-badge admin-badge-refund admin-badge-${escapeHtml(ref.refund_status)}">${escapeHtml(ref.refund_status.toUpperCase())}</span> &nbsp;|&nbsp;
              <strong>Method:</strong> ${escapeHtml(ref.payment_method)}
            </p>
            ${ref.razorpay_refund_id ? `<p style="margin:0 0 4px;"><strong>Razorpay Refund ID:</strong> <code>${escapeHtml(ref.razorpay_refund_id)}</code></p>` : ''}
            ${ref.failure_reason ? `<p style="margin:0;color:#dc2626;"><strong>Failure:</strong> ${escapeHtml(ref.failure_reason)}</p>` : ''}
          </div>
        `).join('')}
      </section>
    `;
  }

  detail.innerHTML = `
    <div class="admin-detail-head"><div><p class="eyebrow">ORDER DETAILS</p><h2>${escapeHtml(order.reference)}</h2><span>${escapeHtml(formatDate(order.created_at))}</span></div></div>
    <section class="admin-detail-section"><h3>Customer</h3><dl><dt>Name</dt><dd>${escapeHtml(customer.full_name || order.customer_full_name)}</dd><dt>Mobile</dt><dd>${escapeHtml(customer.mobile || order.customer_mobile)}</dd><dt>Email</dt><dd>${escapeHtml(customer.email || order.customer_email || 'Not provided')}</dd></dl></section>
    <section class="admin-detail-section"><h3>Shipping address</h3><p>${escapeHtml(order.shipping_address)}<br>${escapeHtml(order.shipping_city)}, ${escapeHtml(order.shipping_state)} — ${escapeHtml(order.shipping_pincode)}</p></section>
    <section class="admin-detail-section"><h3>Items</h3><div class="admin-items">${items.map(item => {
    const varDetails = [];
    if (item.color) varDetails.push(`Color: ${escapeHtml(item.color)}`);
    if (item.size) varDetails.push(`Size: ${escapeHtml(item.size)}`);
    if (!varDetails.length && item.variant_title && item.variant_title !== 'Standard Fit') {
      varDetails.push(escapeHtml(item.variant_title));
    }
    const varSub = varDetails.length ? `<span class="admin-item-variant" style="display:block;font-size:0.8rem;color:#64748b;">${varDetails.join(' • ')}</span>` : '';
    return `<div class="admin-item"><div><strong>${escapeHtml(item.product_name)}</strong>${varSub}<span>Quantity: ${item.quantity} · ${escapeHtml(formatMoney(item.unit_price_paise, order.currency))} each</span></div><strong>${escapeHtml(formatMoney(item.line_total_paise, order.currency))}</strong></div>`;
  }).join('')}</div><div class="admin-total-row"><span>Subtotal</span><strong>${escapeHtml(formatMoney(order.subtotal_paise, order.currency))}</strong></div><div class="admin-total-row admin-grand-total"><span>Total</span><strong>${escapeHtml(formatMoney(order.total_paise, order.currency))}</strong></div></section>
    ${trackingDisplayHtml}
    ${returnsDisplayHtml}
    ${refundsDisplayHtml}

    <section class="admin-detail-section" style="background:#f0fdf4;padding:14px;border-radius:8px;border:1px solid #bbf7d0;margin-top:14px;">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
        <div>
          <h3 style="color:#166534;margin:0 0 2px;font-size:13px;font-weight:700;">WhatsApp Notification</h3>
          <span style="font-size:12px;color:#15803d;">Send ready message to ${escapeHtml(order.customer_mobile || customer.mobile || 'customer')}</span>
        </div>
        <button type="button" class="btn btn-sm btn-whatsapp admin-order-wa-btn" data-order-id="${escapeHtml(order.id)}" style="background:#25D366;color:#fff;border:none;font-weight:600;display:inline-flex;align-items:center;gap:5px;cursor:pointer;">
          💬 Open in WhatsApp
        </button>
      </div>
    </section>

    <form class="admin-status-form" id="adminStatusForm" data-current-order-status="${escapeHtml(order.order_status)}">
      <h3>Update order</h3>
      <label for="orderStatus">Order status</label>
      <select id="orderStatus" name="orderStatus">${selectOptions(orderStatuses, order.order_status, allowedOrderStatuses(order.order_status))}</select>
      <label for="paymentStatus">Payment status</label>
      <select id="paymentStatus" name="paymentStatus">${selectOptions(paymentStatuses, order.payment_status)}</select>

      <div class="admin-tracking-box">
        <div class="admin-tracking-title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
          <span>Courier &amp; Tracking (Optional)</span>
        </div>
        <div>
          <label for="orderCourierPartner" style="font-size:11px;">Courier Partner</label>
          <input type="text" id="orderCourierPartner" name="courierPartner" placeholder="e.g. Bluedart, Delhivery, DTDC" value="${escapeHtml(order.courier_partner || '')}">
        </div>
        <div>
          <label for="orderTrackingNumber" style="font-size:11px;">Tracking / AWB Number</label>
          <input type="text" id="orderTrackingNumber" name="trackingNumber" placeholder="e.g. 1234567890" value="${escapeHtml(order.tracking_number || '')}">
        </div>
        <div>
          <label for="orderTrackingUrl" style="font-size:11px;">Tracking URL</label>
          <input type="url" id="orderTrackingUrl" name="trackingUrl" placeholder="https://track.courier.com/..." value="${escapeHtml(order.tracking_url || '')}">
        </div>
      </div>

      <p>Payment method: <strong>${escapeHtml(order.payment_method === 'cod' ? 'Cash on Delivery' : order.payment_method)}</strong></p>
      <button class="btn btn-primary" type="submit">Save status</button>
      <p class="admin-form-status" id="adminUpdateStatus" aria-live="polite"></p>
    </form>`;

  document.getElementById('adminStatusForm')?.addEventListener('submit', event => saveStatuses(event, order.id));

  detail.querySelectorAll('.admin-order-wa-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      openWhatsAppModalForOrder(btn.dataset.orderId);
    });
  });

  detail.querySelectorAll('.admin-view-return-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      viewReturnInReturnsTab(btn.dataset.returnId);
    });
  });
}

function viewReturnInReturnsTab(returnId) {
  selectedReturnId = returnId;
  switchTab('returns');
  loadReturnDetails(returnId);
}

function viewOrderInOrdersTab(orderId) {
  selectedOrderId = orderId;
  switchTab('orders');
  loadOrderDetails(orderId);
}

// -------------------------------------------------------------
// RETURNS & EXCHANGES MANAGEMENT FUNCTIONS
// -------------------------------------------------------------

function setReturnsStatus(message = '', isError = false) {
  if (!returnsStatus) return;
  returnsStatus.textContent = message;
  returnsStatus.classList.toggle('is-error', isError);
}

function emptyReturnsState(title, message) {
  if (!returnsEmpty) return;
  returnsEmpty.innerHTML = `<strong>${escapeHtml(title)}</strong><span>${escapeHtml(message)}</span>`;
}

function filteredReturnRequests() {
  const query = (returnsSearch?.value || '').trim().toLowerCase();
  const statusFilter = returnsStatusFilter?.value || 'all';
  const typeFilter = returnsTypeFilter?.value || 'all';

  return returnRequests.filter(req => {
    // 1. Status Filter
    if (statusFilter !== 'all' && req.status !== statusFilter) return false;

    // 2. Type Filter
    if (typeFilter !== 'all' && req.request_type !== typeFilter) return false;

    // 3. Search Query Filter (Request ID, Order Reference, Customer, Mobile, Product Name, Reason)
    if (query) {
      const orderRef = req.order?.reference || '';
      const custName = req.customer?.full_name || req.order?.customer_full_name || '';
      const custMobile = req.customer?.mobile || req.order?.customer_mobile || '';
      const prodName = req.order_item?.product_name || '';
      const reason = req.reason || '';
      const notes = req.customer_notes || '';
      const reqId = req.id || '';

      const searchable = [reqId, orderRef, custName, custMobile, prodName, reason, notes].join(' ').toLowerCase();
      if (!searchable.includes(query)) return false;
    }

    return true;
  });
}

function openReturnReasonModal(returnId) {
  const req = returnRequests.find(r => r.id === returnId);
  if (!req || !returnReasonModal) return;

  const order = req.order || {};
  const item = req.order_item || {};
  const customer = req.customer || {};

  if (modalReturnId) modalReturnId.textContent = '#' + req.id.slice(0, 8).toUpperCase();
  if (modalReturnOrderRef) modalReturnOrderRef.textContent = order.reference || 'N/A';
  if (modalReturnTypeBadge) {
    modalReturnTypeBadge.innerHTML = req.request_type === 'exchange'
      ? `<span class="admin-badge admin-badge-type-exchange">EXCHANGE</span>`
      : `<span class="admin-badge admin-badge-type-return">RETURN</span>`;
  }
  if (modalReturnStatusBadge) {
    modalReturnStatusBadge.innerHTML = `<span class="admin-badge admin-badge-return admin-badge-${escapeHtml(req.status)}">${escapeHtml(req.status.replace(/_/g, ' ').toUpperCase())}</span>`;
  }

  const custName = customer.full_name || order.customer_full_name || 'Customer';
  const custMobile = customer.mobile || order.customer_mobile || '';
  if (modalReturnCustomer) {
    modalReturnCustomer.textContent = custName + (custMobile ? ` (${custMobile})` : '');
  }

  const varParts = [];
  if (item.color) varParts.push(`Color: ${item.color}`);
  if (item.size) varParts.push(`Size: ${item.size}`);
  if (!varParts.length && item.variant_title && item.variant_title !== 'Standard Fit') {
    varParts.push(item.variant_title);
  }
  const varSuffix = varParts.length ? ` (${varParts.join(', ')})` : '';
  if (modalReturnProduct) {
    modalReturnProduct.textContent = (item.product_name || 'Product') + varSuffix;
  }

  if (modalReturnReplacementWrap && modalReturnReplacementSize) {
    if (req.request_type === 'exchange' && req.requested_replacement_size) {
      modalReturnReplacementWrap.hidden = false;
      modalReturnReplacementSize.textContent = req.requested_replacement_size;
    } else {
      modalReturnReplacementWrap.hidden = true;
      modalReturnReplacementSize.textContent = '';
    }
  }

  if (modalReturnReasonText) {
    modalReturnReasonText.textContent = req.reason || 'No detailed reason provided.';
  }

  if (modalReturnNotesWrap && modalReturnNotesText) {
    if (req.customer_notes && req.customer_notes.trim()) {
      modalReturnNotesWrap.hidden = false;
      modalReturnNotesText.textContent = req.customer_notes;
    } else {
      modalReturnNotesWrap.hidden = true;
      modalReturnNotesText.textContent = '';
    }
  }

  if (returnReasonViewDetailsBtn) {
    returnReasonViewDetailsBtn.dataset.returnId = req.id;
  }

  returnReasonModal.hidden = false;
  returnReasonModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
}

function closeReturnReasonModal() {
  if (!returnReasonModal) return;
  returnReasonModal.hidden = true;
  returnReasonModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}

function renderReturnRequests() {
  if (!returnsList) return;
  const visible = filteredReturnRequests();
  if (returnsEmpty) returnsEmpty.hidden = visible.length > 0;
  emptyReturnsState(
    returnRequests.length === 0 ? 'No returns or exchanges yet' : 'No matching requests',
    returnRequests.length === 0 ? 'Customer return and exchange requests will appear here.' : 'Try another search or status/type filter.'
  );

  returnsList.innerHTML = visible.map(req => {
    const custName = req.customer?.full_name || req.order?.customer_full_name || 'Customer';
    const custMobile = req.customer?.mobile || req.order?.customer_mobile || '';
    const orderRef = req.order?.reference || 'N/A';
    const prodName = req.order_item?.product_name || 'Item';
    const varParts = [];
    if (req.order_item?.color) varParts.push(req.order_item.color);
    if (req.order_item?.size) varParts.push(req.order_item.size);
    if (!varParts.length && req.order_item?.variant_title && req.order_item.variant_title !== 'Standard Fit') {
      varParts.push(req.order_item.variant_title);
    }
    const varText = varParts.join(' • ');

    const typeBadge = req.request_type === 'exchange'
      ? `<span class="admin-badge admin-badge-type-exchange">EXCHANGE</span>`
      : `<span class="admin-badge admin-badge-type-return">RETURN</span>`;

    const statusBadgeHtml = `<span class="admin-badge admin-badge-return admin-badge-${escapeHtml(req.status)}">${escapeHtml(req.status.replace(/_/g, ' '))}</span>`;

    const shortId = req.id.slice(0, 8).toUpperCase();
    const reasonRaw = req.reason || 'No reason specified';
    const reasonPreview = reasonRaw.length > 55 ? reasonRaw.slice(0, 52) + '…' : reasonRaw;

    return `
      <tr>
        <td>
          <button class="admin-return-link" type="button" data-return-id="${escapeHtml(req.id)}" title="View request details">
            <strong>#${escapeHtml(shortId)}</strong>
            <span>${escapeHtml(formatDate(req.created_at))}</span>
          </button>
        </td>
        <td>
          <span style="font-family:var(--font-mono);font-size:12px;font-weight:600;display:block;">${escapeHtml(orderRef)}</span>
          ${req.order?.payment_status ? `<span style="font-size:11px;color:#64748b;">${escapeHtml(req.order.payment_method?.toUpperCase())} · ${escapeHtml(req.order.payment_status)}</span>` : ''}
        </td>
        <td>
          <strong>${escapeHtml(custName)}</strong>
          ${custMobile ? `<span style="display:block;font-size:11px;color:#64748b;">${escapeHtml(custMobile)}</span>` : ''}
        </td>
        <td>
          <strong>${escapeHtml(prodName)}</strong>
          ${varText ? `<span style="display:block;font-size:11px;color:#64748b;">${escapeHtml(varText)}</span>` : ''}
        </td>
        <td style="text-align:center;">
          ${typeBadge}
        </td>
        <td>
          <button type="button" class="admin-reason-btn" data-return-id="${escapeHtml(req.id)}" title="Click to view full reason">
            <span class="admin-reason-preview">${escapeHtml(reasonPreview)}</span>
            <span class="admin-reason-hint">View full reason ↗</span>
          </button>
          ${req.requested_replacement_size ? `<span class="admin-replacement-tag">→ Size: ${escapeHtml(req.requested_replacement_size)}</span>` : ''}
        </td>
        <td style="white-space:nowrap;">
          ${statusBadgeHtml}
        </td>
      </tr>
    `;
  }).join('');

  returnsList.querySelectorAll('.admin-return-link').forEach(btn => {
    btn.addEventListener('click', () => loadReturnDetails(btn.dataset.returnId));
  });

  returnsList.querySelectorAll('.admin-reason-btn').forEach(btn => {
    btn.addEventListener('click', () => openReturnReasonModal(btn.dataset.returnId));
  });
}

async function loadReturnRequests(announce = true) {
  if (announce) setReturnsStatus('Loading returns & exchanges…');
  if (returnsEmpty) returnsEmpty.hidden = true;
  if (returnsList) returnsList.innerHTML = '';

  const { data, error } = await supabase
    .from('return_requests')
    .select(`
      id,
      order_id,
      order_item_id,
      customer_id,
      user_id,
      request_type,
      reason,
      customer_notes,
      requested_replacement_size,
      images,
      refund_method,
      payout_details,
      refund_amount_paise,
      status,
      admin_notes,
      admin_message,
      created_at,
      updated_at,
      order:orders(
        id, reference, customer_full_name, customer_mobile, customer_email,
        payment_method, payment_status, order_status, total_paise, currency,
        order_refunds(*)
      ),
      order_item:order_items(
        id, product_id, product_name, variant_title, color, size, unit_price_paise, quantity, line_total_paise
      ),
      customer:customers(
        full_name, mobile, email
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to load return requests:', error);
    setReturnsStatus('Unable to load returns & exchanges. Please refresh and try again.', true);
    return;
  }

  setReturnsStatus();
  returnRequests = data || [];
  renderReturnRequests();
  if (selectedReturnId && returnRequests.some(r => r.id === selectedReturnId)) {
    await loadReturnDetails(selectedReturnId, false);
  }
}

async function loadReturnDetails(returnId, announce = true) {
  selectedReturnId = returnId;
  if (!returnDetail) return;
  if (announce) returnDetail.innerHTML = '<div class="admin-detail-placeholder">Loading request details…</div>';

  const req = returnRequests.find(r => r.id === returnId);
  if (!req) {
    const { data, error } = await supabase
      .from('return_requests')
      .select(`
        id,
        order_id,
        order_item_id,
        customer_id,
        user_id,
        request_type,
        reason,
        customer_notes,
        requested_replacement_size,
        images,
        refund_method,
        payout_details,
        refund_amount_paise,
        status,
        admin_notes,
        admin_message,
        created_at,
        updated_at,
        order:orders(
          id, reference, customer_full_name, customer_mobile, customer_email,
          payment_method, payment_status, order_status, total_paise, currency,
          order_refunds(*)
        ),
        order_item:order_items(
          id, product_id, product_name, variant_title, color, size, unit_price_paise, quantity, line_total_paise
        ),
        customer:customers(
          full_name, mobile, email
        )
      `)
      .eq('id', returnId)
      .single();

    if (error || !data) {
      returnDetail.innerHTML = '<div class="admin-detail-placeholder is-error">Unable to load this return request. Please try again.</div>';
      return;
    }
    renderReturnDetail(data);
    return;
  }

  renderReturnDetail(req);
}

function renderReturnDetail(req) {
  if (!returnDetail) return;

  const order = req.order || {};
  const item = req.order_item || {};
  const customer = req.customer || {};
  const refunds = order.order_refunds || req.order_refunds || [];
  const activeRefund = refunds.find(r => r.return_request_id === req.id) || refunds[0] || null;

  const isExchange = req.request_type === 'exchange';
  const isReturn = req.request_type === 'return';
  const isCod = order.payment_method === 'cod';

  const typeBadge = isExchange
    ? `<span class="admin-badge admin-badge-type-exchange" style="font-size:12px;padding:4px 10px;">EXCHANGE REQUEST</span>`
    : `<span class="admin-badge admin-badge-type-return" style="font-size:12px;padding:4px 10px;">RETURN REQUEST</span>`;

  const statusBadgeHtml = `<span class="admin-badge admin-badge-return admin-badge-${escapeHtml(req.status)}" style="font-size:12px;padding:4px 10px;">${escapeHtml(req.status.replace(/_/g, ' ').toUpperCase())}</span>`;

  // Item variant details
  const varDetails = [];
  if (item.color) varDetails.push(`Color: ${escapeHtml(item.color)}`);
  if (item.size) varDetails.push(`Size: ${escapeHtml(item.size)}`);
  if (!varDetails.length && item.variant_title && item.variant_title !== 'Standard Fit') {
    varDetails.push(escapeHtml(item.variant_title));
  }
  const varSub = varDetails.length ? `<span style="display:block;font-size:0.8rem;color:#64748b;margin-top:2px;">${varDetails.join(' • ')}</span>` : '';

  // Calculate refund amount
  const calculatedRefundPaise = req.refund_amount_paise || item.line_total_paise || order.total_paise || 0;
  const payoutDetails = req.payout_details || {};
  const isRefundCompleted = activeRefund && activeRefund.refund_status === 'completed';

  // Payment & Refund Information section
  let paymentRefundHtml = '';
  if (isReturn) {
    paymentRefundHtml = `
      <section class="admin-detail-section" style="background:#f8fafc;padding:16px;border-radius:8px;border:1px solid #e2e8f0;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
          <h3 style="margin:0;font-size:14px;color:#0f172a;">Payment &amp; Refund Details</h3>
          ${isRefundCompleted 
            ? `<span class="admin-badge admin-badge-refund admin-badge-completed" style="font-size:11px;">REFUNDED</span>` 
            : (activeRefund?.refund_status === 'failed' 
              ? `<span class="admin-badge admin-badge-refund admin-badge-failed" style="font-size:11px;background:#fef2f2;color:#dc2626;border-color:#fca5a5;">REFUND FAILED</span>` 
              : `<span class="admin-badge admin-badge-refund admin-badge-pending" style="font-size:11px;">REFUND PENDING</span>`
            )}
        </div>
        <dl>
          <dt>Payment Method</dt>
          <dd><strong>${escapeHtml(isCod ? 'Cash on Delivery (COD)' : (order.payment_method === 'razorpay' ? 'Online (Razorpay)' : String(order.payment_method || 'COD').toUpperCase()))}</strong> (${escapeHtml(order.payment_status || 'pending')})</dd>
          ${(!isCod && order.payment_method === 'razorpay') ? `
            <dt>Razorpay Payment ID</dt>
            <dd><code>${escapeHtml(activeRefund?.razorpay_payment_id || order.order_refunds?.[0]?.razorpay_payment_id || 'N/A')}</code></dd>
          ` : ''}
          ${(activeRefund?.razorpay_refund_id) ? `
            <dt>Razorpay Refund ID</dt>
            <dd><code>${escapeHtml(activeRefund.razorpay_refund_id)}</code></dd>
          ` : ''}
          <dt>Refund Destination</dt>
          <dd>
            <strong>${escapeHtml(req.refund_method === 'upi' ? 'Instant UPI / VPA' : (req.refund_method === 'bank_transfer' ? 'Bank Account Transfer' : (order.payment_method === 'razorpay' ? 'Original Source (Razorpay)' : 'Manual Settlement')))}</strong>
          </dd>
          <dt>Refund Amount</dt>
          <dd style="font-size:15px;color:#166534;font-weight:700;">${escapeHtml(formatMoney(calculatedRefundPaise, order.currency || 'INR'))}</dd>
        </dl>

        ${(isCod && (payoutDetails.upi_id || payoutDetails.account_number)) ? `
          <div class="admin-payout-card" style="margin-top:12px;background:#ffffff;border:1px solid #cbd5e1;border-radius:6px;padding:12px;">
            <h4 style="margin:0 0 8px 0;font-size:12px;color:#475569;text-transform:uppercase;letter-spacing:0.5px;">Customer Payout Details</h4>
            ${payoutDetails.upi_id ? `
              <div class="admin-payout-row">
                <span class="admin-payout-label">UPI ID / VPA:</span>
                <span class="admin-payout-val">
                  <code>${escapeHtml(payoutDetails.upi_id)}</code>
                  <button type="button" class="admin-copy-chip admin-copy-btn" data-copy="${escapeHtml(payoutDetails.upi_id)}" title="Copy UPI ID">Copy</button>
                </span>
              </div>
            ` : ''}
            ${payoutDetails.account_holder_name ? `
              <div class="admin-payout-row">
                <span class="admin-payout-label">Account Holder:</span>
                <span class="admin-payout-val">${escapeHtml(payoutDetails.account_holder_name)}</span>
              </div>
            ` : ''}
            ${payoutDetails.account_number ? `
              <div class="admin-payout-row">
                <span class="admin-payout-label">Account Number:</span>
                <span class="admin-payout-val">
                  <code>${escapeHtml(payoutDetails.account_number)}</code>
                  <button type="button" class="admin-copy-chip admin-copy-btn" data-copy="${escapeHtml(payoutDetails.account_number)}" title="Copy Account Number">Copy</button>
                </span>
              </div>
            ` : ''}
            ${payoutDetails.ifsc_code ? `
              <div class="admin-payout-row">
                <span class="admin-payout-label">IFSC Code:</span>
                <span class="admin-payout-val">
                  <code>${escapeHtml(payoutDetails.ifsc_code)}</code>
                  <button type="button" class="admin-copy-chip admin-copy-btn" data-copy="${escapeHtml(payoutDetails.ifsc_code)}" title="Copy IFSC Code">Copy</button>
                </span>
              </div>
            ` : ''}
          </div>
        ` : ''}
      </section>
    `;
  }

  // Refunds section for linked database records
  let refundsHtml = '';
  if (refunds.length > 0) {
    refundsHtml = `
      <section class="admin-detail-section" style="background:#f0fdf4;padding:16px;border-radius:8px;border:1px solid #bbf7d0;">
        <h3 style="color:#166534;margin-top:0;">Linked Refund Records (${refunds.length})</h3>
        ${refunds.map(ref => `
          <div style="font-size:13px;margin-bottom:8px;padding-bottom:8px;border-bottom:1px dashed #bbf7d0;">
            <p style="margin:0 0 4px;">
              <strong>Amount:</strong> ${escapeHtml(formatMoney(ref.amount_paise, order.currency || 'INR'))} &nbsp;|&nbsp;
              <strong>Status:</strong> <span class="admin-badge admin-badge-refund admin-badge-${escapeHtml(ref.refund_status)}">${escapeHtml(ref.refund_status.toUpperCase())}</span> &nbsp;|&nbsp;
              <strong>Method:</strong> ${escapeHtml(ref.payment_method)}
            </p>
            ${ref.razorpay_refund_id ? `<p style="margin:0 0 4px;"><strong>Razorpay Refund ID:</strong> <code>${escapeHtml(ref.razorpay_refund_id)}</code></p>` : ''}
            ${ref.failure_reason ? `<p style="margin:0;color:#dc2626;"><strong>Failure:</strong> ${escapeHtml(ref.failure_reason)}</p>` : ''}
          </div>
        `).join('')}
      </section>
    `;
  }

  // Action buttons depending on status
  let actionsHtml = '';
  if (req.status === 'requested') {
    actionsHtml = `
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;">
        <button type="button" class="btn btn-primary admin-ret-status-btn" data-ret-id="${req.id}" data-action="approved">Approve Request</button>
        <button type="button" class="btn btn-danger-outline admin-ret-status-btn" data-ret-id="${req.id}" data-action="rejected">Reject Request</button>
      </div>
    `;
  } else if (req.status === 'approved') {
    actionsHtml = `
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;">
        <button type="button" class="btn btn-primary admin-ret-status-btn" data-ret-id="${req.id}" data-action="pickup_scheduled">Schedule Pickup</button>
        <button type="button" class="btn btn-danger-outline admin-ret-status-btn" data-ret-id="${req.id}" data-action="rejected">Reject Request</button>
      </div>
    `;
  } else if (req.status === 'pickup_scheduled') {
    actionsHtml = `
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;">
        <button type="button" class="btn btn-primary admin-ret-status-btn" data-ret-id="${req.id}" data-action="received">Mark Item Received</button>
      </div>
    `;
  } else if (req.status === 'received') {
    if (isReturn && isCod) {
      actionsHtml = `
        <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:6px;padding:12px;margin-top:12px;">
          <div style="font-size:13px;font-weight:600;color:#92400e;display:flex;align-items:center;gap:6px;margin-bottom:8px;">
            <span>📦</span> Item Verified in Warehouse. Refund is Pending.
          </div>
          <p style="font-size:12px;color:#78350f;margin:0 0 10px 0;line-height:1.4;">
            Please manually disburse <strong>${formatMoney(calculatedRefundPaise, order.currency || 'INR')}</strong> to the customer's UPI / Bank details above, then click below to record the payment.
          </p>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <button type="button" class="btn btn-primary admin-mark-cod-paid-btn" data-ret-id="${req.id}" style="background:#166534;border-color:#166534;">
              Mark Refund Paid (${formatMoney(calculatedRefundPaise, order.currency || 'INR')})
            </button>
          </div>
        </div>
      `;
    } else if (isExchange) {
      actionsHtml = `
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;">
          <button type="button" class="btn btn-primary admin-ret-status-btn" data-ret-id="${req.id}" data-action="completed">Dispatch Replacement &amp; Complete</button>
        </div>
      `;
    } else {
      const btnText = activeRefund?.refund_status === 'failed' ? 'Retry Razorpay Refund' : 'Complete Request';
      actionsHtml = `
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;">
          <button type="button" class="btn btn-primary admin-ret-status-btn" data-ret-id="${req.id}" data-action="completed">${escapeHtml(btnText)}</button>
        </div>
      `;
    }
  } else if (req.status === 'completed') {
    if (isReturn && !isCod && order.payment_method === 'razorpay' && activeRefund && activeRefund.refund_status !== 'completed') {
      const isFailed = activeRefund.refund_status === 'failed';
      actionsHtml = `
        <div style="margin-top:12px;padding:12px;background:${isFailed ? '#fef2f2' : '#fffbeb'};border-radius:6px;border:1px solid ${isFailed ? '#fecaca' : '#fde68a'};color:${isFailed ? '#991b1b' : '#b45309'};font-size:13px;">
          <div style="font-weight:700;display:flex;align-items:center;gap:6px;margin-bottom:4px;">
            <span>${isFailed ? '❌' : '⚠️'}</span> ${isFailed ? 'Request Completed, but Razorpay Refund FAILED' : 'Request Completed, but Razorpay Refund is still PENDING'}
          </div>
          ${isFailed ? `<p style="margin:4px 0 8px 0;font-size:12px;color:#7f1d1d;"><strong>Reason:</strong> ${escapeHtml(activeRefund.failure_reason || 'Unknown error')}</p>` : `<p style="margin:4px 0 8px 0;font-size:12px;color:#78350f;">The refund has not been processed on Razorpay yet.</p>`}
          <button type="button" class="btn btn-primary admin-process-refund-btn" data-ret-id="${req.id}" style="background:${isFailed ? '#dc2626' : '#d97706'};border-color:${isFailed ? '#dc2626' : '#d97706'};font-size:12px;padding:6px 12px;">
            ${isFailed ? 'Retry Razorpay Refund' : 'Process Razorpay Refund Now'}
          </button>
        </div>
      `;
    } else {
      actionsHtml = `
        <div style="margin-top:12px;padding:12px;background:#f0fdf4;border-radius:6px;border:1px solid #bbf7d0;color:#166534;font-size:13px;">
          <div style="font-weight:700;display:flex;align-items:center;gap:6px;margin-bottom:4px;">
            <span>✅</span> ${isReturn ? 'Request Completed &amp; Refund Settled' : 'Exchange Completed &amp; Replacement Dispatched'}
          </div>
          ${req.admin_message ? `<div style="margin-top:6px;padding-top:6px;border-top:1px solid #bbf7d0;color:#166534;font-weight:500;"><strong>Message to Customer:</strong> "${escapeHtml(req.admin_message)}"</div>` : ''}
        </div>
      `;
    }
  } else if (req.status === 'rejected') {
    actionsHtml = `
      <div style="margin-top:12px;padding:10px;background:#fef2f2;border-radius:6px;border:1px solid #fecaca;color:#991b1b;font-size:13px;">
        ❌ This request was rejected.
        ${req.admin_message ? `<div style="margin-top:6px;padding-top:6px;border-top:1px solid #fecaca;color:#991b1b;font-weight:500;"><strong>Message to Customer:</strong> "${escapeHtml(req.admin_message)}"</div>` : ''}
      </div>
    `;
  } else if (req.status === 'cancelled') {
    actionsHtml = `
      <div style="margin-top:12px;padding:10px;background:#f8fafc;border-radius:6px;border:1px solid #e2e8f0;color:#64748b;font-size:13px;">
        🚫 This request was cancelled by the customer.
      </div>
    `;
  }

  returnDetail.innerHTML = `
    <div class="admin-detail-head">
      <div>
        <p class="eyebrow">RETURN &amp; EXCHANGE REQUEST</p>
        <h2>#${escapeHtml(req.id.slice(0, 8).toUpperCase())}</h2>
        <span>Requested on ${escapeHtml(formatDate(req.created_at))}</span>
      </div>
      <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;">
        ${typeBadge}
        ${statusBadgeHtml}
      </div>
    </div>

    <!-- Connected Order Details -->
    <section class="admin-detail-section" style="background:#f8fafc;padding:16px;border-radius:8px;border:1px solid #e2e8f0;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
        <h3 style="margin:0;font-size:14px;color:#0f172a;">Connected Order</h3>
        ${req.order_id ? `<button type="button" class="btn btn-sm btn-outline admin-view-order-btn" data-order-id="${escapeHtml(req.order_id)}">View Order →</button>` : ''}
      </div>
      <dl>
        <dt>Order Reference</dt>
        <dd><strong>${escapeHtml(order.reference || 'N/A')}</strong></dd>
        <dt>Order Status</dt>
        <dd>${statusBadge(order.order_status || 'unknown', 'order')}</dd>
        <dt>Payment</dt>
        <dd>${statusBadge(order.payment_method || 'unknown', 'payment-method')} ${statusBadge(order.payment_status || 'unknown', 'payment')}</dd>
        <dt>Total Value</dt>
        <dd>${escapeHtml(formatMoney(order.total_paise, order.currency || 'INR'))}</dd>
      </dl>
    </section>

    <!-- Customer Information -->
    <section class="admin-detail-section">
      <h3>Customer Details</h3>
      <dl>
        <dt>Name</dt>
        <dd>${escapeHtml(customer.full_name || order.customer_full_name || 'N/A')}</dd>
        <dt>Mobile</dt>
        <dd>${escapeHtml(customer.mobile || order.customer_mobile || 'N/A')}</dd>
        <dt>Email</dt>
        <dd>${escapeHtml(customer.email || order.customer_email || 'Not provided')}</dd>
      </dl>
    </section>

    <!-- Item & Request Specifics -->
    <section class="admin-detail-section">
      <h3>Item &amp; Reason</h3>
      <div class="admin-items">
        <div class="admin-item" style="align-items:flex-start;">
          <div>
            <strong>${escapeHtml(item.product_name || 'Product')}</strong>
            ${varSub}
            <span>Quantity: ${item.quantity || 1} · ${escapeHtml(formatMoney(item.unit_price_paise, order.currency || 'INR'))}</span>
          </div>
          <strong>${escapeHtml(formatMoney(item.line_total_paise, order.currency || 'INR'))}</strong>
        </div>
      </div>

      <dl style="margin-top:14px;">
        <dt>Request Type</dt>
        <dd><strong>${escapeHtml(req.request_type?.toUpperCase())}</strong></dd>
        ${isExchange ? `
          <dt style="color:#1d4ed8;font-weight:700;">Replacement Size</dt>
          <dd style="color:#1d4ed8;font-weight:700;font-size:14px;">${escapeHtml(req.requested_replacement_size || 'Not specified')}</dd>
        ` : ''}
        <dt>Full Reason</dt>
        <dd style="white-space:pre-wrap;word-break:break-word;line-height:1.5;color:#0f172a;background:#f8fafc;padding:8px 12px;border-radius:6px;border:1px solid #e2e8f0;margin-top:4px;">${escapeHtml(req.reason)}</dd>
        ${req.customer_notes ? `
          <dt style="margin-top:8px;">Customer Notes</dt>
          <dd style="white-space:pre-wrap;word-break:break-word;line-height:1.5;color:#475569;font-style:italic;background:#fdfcfb;padding:8px 12px;border-radius:6px;border:1px solid #e7e5e4;margin-top:4px;">"${escapeHtml(req.customer_notes)}"</dd>
        ` : ''}
        ${req.admin_message ? `
          <dt style="margin-top:8px;color:#0f172a;font-weight:600;">Message to Customer</dt>
          <dd style="white-space:pre-wrap;word-break:break-word;line-height:1.5;color:#0f172a;background:#f0f9ff;padding:8px 12px;border-radius:6px;border:1px solid #bae6fd;margin-top:4px;">"${escapeHtml(req.admin_message)}"</dd>
        ` : ''}
      </dl>
    </section>

    ${paymentRefundHtml}
    ${refundsHtml}

    <!-- WhatsApp Notification -->
    <section class="admin-detail-section" style="background:#f0fdf4;padding:14px;border-radius:8px;border:1px solid #bbf7d0;">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
        <div>
          <h3 style="color:#166534;margin:0 0 2px;font-size:13px;font-weight:700;">WhatsApp Notification</h3>
          <span style="font-size:12px;color:#15803d;">Send ${isExchange ? 'Exchange' : 'Refund'} update to ${escapeHtml(customer.mobile || order.customer_mobile || 'customer')}</span>
        </div>
        <button type="button" class="btn btn-sm btn-whatsapp admin-return-wa-btn" data-return-id="${escapeHtml(req.id)}" style="background:#25D366;color:#fff;border:none;font-weight:600;display:inline-flex;align-items:center;gap:5px;cursor:pointer;">
          💬 Open in WhatsApp
        </button>
      </div>
    </section>

    <!-- Customer Photos -->
    <section class="admin-detail-section">
      <h3>Customer Photos</h3>
      ${Array.isArray(req.images) && req.images.length > 0 ? `
        <div class="admin-photos-grid" id="adminReturnPhotosGrid">
          ${req.images.map((img, idx) => `
            <div class="admin-photo-thumb-wrap" data-img-path="${escapeHtml(img)}" data-index="${idx}" tabindex="0" role="button" aria-label="View photo ${idx + 1} full size">
              <img src="${escapeHtml(img.startsWith('http') ? img : '')}" data-storage-path="${escapeHtml(img)}" class="admin-photo-thumb" alt="Customer Photo ${idx + 1}">
            </div>
          `).join('')}
        </div>
      ` : `
        <p class="admin-no-photos">No photos uploaded.</p>
      `}
    </section>

    <!-- Workflow Management & Admin Notes -->
    <section class="admin-detail-section" style="background:#fdfcfb;padding:16px;border-radius:8px;border:1px solid #e7e5e4;">
      <h3 style="margin-top:0;">Request Lifecycle Actions</h3>
      <p style="font-size:12px;color:#64748b;margin:0 0 8px;">Update the status of this request according to reverse logistics progress.</p>
      ${actionsHtml}

      <div style="margin-top:18px;border-top:1px solid #e7e5e4;padding-top:14px;">
        <label for="returnAdminNotes" style="font-size:12px;font-weight:600;display:block;margin-bottom:6px;">Admin Notes (Internal)</label>
        <textarea id="returnAdminNotes" rows="3" style="width:100%;box-sizing:border-box;padding:8px;font-family:inherit;font-size:13px;border-radius:6px;border:1px solid #cbd5e1;" placeholder="Add internal handling notes here...">${escapeHtml(req.admin_notes || '')}</textarea>
        <div style="display:flex;justify-content:flex-end;margin-top:6px;">
          <button type="button" class="btn btn-sm btn-outline admin-save-return-notes-btn" data-ret-id="${req.id}">Save Notes</button>
        </div>
        <p id="adminReturnNotesStatus" style="font-size:12px;margin:4px 0 0;color:#166534;" aria-live="polite"></p>
      </div>
    </section>
  `;

  // Asynchronously resolve signed URLs and attach lightbox handlers for customer photos
  const photoThumbWraps = returnDetail.querySelectorAll('.admin-photo-thumb-wrap');
  photoThumbWraps.forEach(async (wrap) => {
    const imgEl = wrap.querySelector('img');
    const storagePath = imgEl?.dataset.storagePath;
    if (storagePath) {
      try {
        let url = storagePath;
        if (!storagePath.startsWith('http') && !storagePath.startsWith('blob:')) {
          const { data, error } = await supabase.storage.from('return-evidence').createSignedUrl(storagePath, 3600);
          if (!error && (data?.signedUrl || data?.signedURL)) {
            url = data.signedUrl || data.signedURL;
          }
        }
        if (imgEl) {
          imgEl.src = url;
          imgEl.onerror = () => {
            imgEl.style.display = 'none';
            if (!wrap.querySelector('.admin-photo-error-fallback')) {
              const errSpan = document.createElement('span');
              errSpan.className = 'admin-photo-error-fallback';
              errSpan.style.cssText = 'font-size:10px;color:#ef4444;text-align:center;padding:4px;display:block;';
              errSpan.textContent = 'Preview unavailable';
              wrap.appendChild(errSpan);
            }
          };
        }
        wrap.dataset.fullUrl = url;
      } catch (e) {
        console.warn('Could not load signed URL for admin thumbnail:', e);
      }
    }

    wrap.addEventListener('click', () => {
      const fullUrl = wrap.dataset.fullUrl || wrap.querySelector('img')?.src || wrap.dataset.imgPath || wrap.querySelector('img')?.dataset.storagePath;
      if (fullUrl) {
        openAdminLightbox(fullUrl);
      }
    });

    wrap.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const fullUrl = wrap.dataset.fullUrl || wrap.querySelector('img')?.src || wrap.dataset.imgPath || wrap.querySelector('img')?.dataset.storagePath;
        if (fullUrl) openAdminLightbox(fullUrl);
      }
    });
  });

  // Attach event listener for "View Order →"
  returnDetail.querySelector('.admin-view-order-btn')?.addEventListener('click', () => {
    if (req.order_id) viewOrderInOrdersTab(req.order_id);
  });

  // Attach event listeners for copy buttons
  returnDetail.querySelectorAll('.admin-copy-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const textToCopy = btn.dataset.copy;
      if (!textToCopy) return;
      try {
        await navigator.clipboard.writeText(textToCopy);
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        btn.classList.add('is-copied');
        setTimeout(() => {
          btn.textContent = originalText;
          btn.classList.remove('is-copied');
        }, 1500);
      } catch (err) {
        console.warn('Clipboard write failed:', err);
      }
    });
  });

  // Attach event listeners for Mark COD Refund Paid button
  returnDetail.querySelectorAll('.admin-mark-cod-paid-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const retId = btn.dataset.retId;
      openCodRefundModal(retId, btn);
    });
  });

  // Attach event listener for WhatsApp notification button
  returnDetail.querySelectorAll('.admin-return-wa-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      openWhatsAppModalForReturn(btn.dataset.returnId);
    });
  });

  // Attach event listeners for status update buttons
  returnDetail.querySelectorAll('.admin-ret-status-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const retId = btn.dataset.retId;
      const action = btn.dataset.action;
      if (action === 'approved' || action === 'rejected') {
        openReturnDecisionModal(retId, action, btn);
      } else {
        await updateReturnStatus(retId, action, btn);
      }
    });
  });

  // Attach event listeners for manual refund processing/retry buttons
  returnDetail.querySelectorAll('.admin-process-refund-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const retId = btn.dataset.retId;
      await processOnlineRefund(retId, btn);
    });
  });

  // Attach event listener for admin notes save
  returnDetail.querySelector('.admin-save-return-notes-btn')?.addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    const retId = btn.dataset.retId;
    const notes = document.getElementById('returnAdminNotes')?.value.trim() || null;
    const statusP = document.getElementById('adminReturnNotesStatus');
    btn.disabled = true;
    btn.textContent = 'Saving…';
    const { error } = await supabase.from('return_requests').update({
      admin_notes: notes,
      updated_at: new Date().toISOString()
    }).eq('id', retId);

    btn.disabled = false;
    btn.textContent = 'Save Notes';
    if (error) {
      if (statusP) {
        statusP.style.color = '#dc2626';
        statusP.textContent = 'Failed to save notes: ' + error.message;
      }
    } else {
      if (statusP) {
        statusP.style.color = '#166534';
        statusP.textContent = 'Notes saved successfully.';
        setTimeout(() => { if (statusP) statusP.textContent = ''; }, 3000);
      }
      const existing = returnRequests.find(r => r.id === retId);
      if (existing) existing.admin_notes = notes;
    }
  });
}

function openCodRefundModal(returnId, triggerButton = null) {
  const modal = document.getElementById('adminCodRefundModal');
  const summaryBox = document.getElementById('adminCodRefundSummaryBox');
  const notesInput = document.getElementById('adminCodRefundNotes');
  const errorEl = document.getElementById('adminCodRefundError');
  const submitBtn = document.getElementById('adminCodRefundSubmitBtn');
  const cancelBtn = document.getElementById('adminCodRefundCancelBtn');
  const closeBtn = document.getElementById('adminCodRefundCloseBtn');
  const form = document.getElementById('adminCodRefundForm');

  if (!modal || !summaryBox || !submitBtn) return;

  const req = returnRequests.find(r => r.id === returnId);
  if (!req) return;

  const order = req.order || {};
  const item = req.order_item || {};
  const customer = req.customer || {};
  const payout = req.payout_details || {};
  const refundPaise = req.refund_amount_paise || item.line_total_paise || order.total_paise || 0;

  summaryBox.innerHTML = `
    <div style="display:grid;grid-template-columns:auto 1fr;gap:6px 12px;font-size:13px;">
      <span style="color:#64748b;">Order Ref:</span>
      <strong>${escapeHtml(order.reference || 'N/A')}</strong>

      <span style="color:#64748b;">Customer:</span>
      <span>${escapeHtml(customer.full_name || order.customer_full_name || 'N/A')} (${escapeHtml(customer.mobile || order.customer_mobile || '')})</span>

      <span style="color:#64748b;">Refund Amount:</span>
      <strong style="color:#166534;font-size:14px;">${escapeHtml(formatMoney(refundPaise, order.currency || 'INR'))}</strong>

      <span style="color:#64748b;">Method:</span>
      <strong>${escapeHtml(req.refund_method === 'upi' ? 'UPI' : 'Bank Transfer')}</strong>

      ${payout.upi_id ? `
        <span style="color:#64748b;">UPI ID:</span>
        <code>${escapeHtml(payout.upi_id)}</code>
      ` : ''}

      ${payout.account_number ? `
        <span style="color:#64748b;">A/C Number:</span>
        <code>${escapeHtml(payout.account_number)} (${escapeHtml(payout.account_holder_name || '')})</code>
      ` : ''}

      ${payout.ifsc_code ? `
        <span style="color:#64748b;">IFSC:</span>
        <code>${escapeHtml(payout.ifsc_code)}</code>
      ` : ''}
    </div>
  `;

  if (notesInput) notesInput.value = '';
  if (errorEl) {
    errorEl.textContent = '';
    errorEl.style.display = 'none';
  }

  submitBtn.disabled = false;
  submitBtn.textContent = `Confirm & Mark Paid (${formatMoney(refundPaise, order.currency || 'INR')})`;

  modal.hidden = false;
  modal.style.display = 'flex';

  const closeModal = () => {
    modal.hidden = true;
    modal.style.display = 'none';
    form.onsubmit = null;
    cancelBtn.onclick = null;
    closeBtn.onclick = null;
    if (triggerButton) triggerButton.focus();
  };

  cancelBtn.onclick = closeModal;
  closeBtn.onclick = closeModal;

  form.onsubmit = async (e) => {
    e.preventDefault();
    if (submitBtn.disabled) return;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing refund reconciliation…';
    if (errorEl) errorEl.style.display = 'none';

    try {
      const adminNotes = (notesInput?.value || '').trim() || null;
      const { data, error } = await supabase.rpc('admin_mark_cod_refund_paid', {
        p_return_id: returnId,
        p_admin_notes: adminNotes
      });

      if (error) throw error;

      closeModal();

      // Update in-memory state
      const targetReq = returnRequests.find(r => r.id === returnId);
      if (targetReq) {
        targetReq.status = 'completed';
        if (targetReq.order) {
          targetReq.order.payment_status = 'refunded';
          targetReq.order.order_status = 'completed';
        }
      }

      await loadReturnRequests(false);
      await loadReturnDetails(returnId, false);
      if (orders.length) await loadOrders();

      alert(`✅ COD Refund for return #${returnId.slice(0, 8).toUpperCase()} has been marked as PAID and reconciled successfully.`);

    } catch (err) {
      console.error('Error in admin_mark_cod_refund_paid:', err);
      if (errorEl) {
        errorEl.textContent = 'Failed to mark refund paid: ' + (err.message || err);
        errorEl.style.display = 'block';
      }
      submitBtn.disabled = false;
      submitBtn.textContent = `Confirm & Mark Paid (${formatMoney(refundPaise, order.currency || 'INR')})`;
    }
  };
}

if (typeof window !== 'undefined') {
  window.__renderReturnDetail = renderReturnDetail;
}

function openAdminLightbox(imgUrl) {
  let backdrop = document.getElementById('adminLightboxModal');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.id = 'adminLightboxModal';
    backdrop.className = 'admin-lightbox-backdrop';
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-modal', 'true');
    backdrop.setAttribute('aria-label', 'Customer Evidence Photo Lightbox');
    backdrop.innerHTML = `
      <div class="admin-lightbox-container">
        <button type="button" class="admin-lightbox-close" aria-label="Close photo preview" id="adminLightboxCloseBtn">✕</button>
        <img src="" class="admin-lightbox-img" alt="Enlarged Customer Evidence">
      </div>
    `;
    document.body.appendChild(backdrop);

    const closeLightbox = () => {
      backdrop.hidden = true;
      backdrop.style.display = 'none';
      const imgEl = backdrop.querySelector('.admin-lightbox-img');
      if (imgEl) imgEl.src = '';
    };

    const closeBtn = backdrop.querySelector('.admin-lightbox-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeLightbox();
      });
    }

    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop || e.target.classList.contains('admin-lightbox-backdrop')) {
        closeLightbox();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && (!backdrop.hidden || backdrop.style.display === 'flex')) {
        closeLightbox();
      }
    });
  }

  const imgEl = backdrop.querySelector('.admin-lightbox-img');
  if (imgEl) imgEl.src = imgUrl;
  backdrop.hidden = false;
  backdrop.style.display = 'flex';

  const closeBtn = backdrop.querySelector('.admin-lightbox-close');
  if (closeBtn) closeBtn.focus();
}

function openReturnDecisionModal(returnId, action, triggerButton = null) {
  const modal = document.getElementById('adminReturnDecisionModal');
  const titleEl = document.getElementById('adminReturnDecisionTitle');
  const eyebrowEl = document.getElementById('adminReturnDecisionEyebrow');
  const msgLabelEl = document.getElementById('adminReturnDecisionMessageLabel');
  const msgInput = document.getElementById('adminReturnDecisionMessage');
  const errorEl = document.getElementById('adminReturnDecisionError');
  const submitBtn = document.getElementById('adminReturnDecisionSubmitBtn');
  const cancelBtn = document.getElementById('adminReturnDecisionCancelBtn');
  const closeBtn = document.getElementById('adminReturnDecisionCloseBtn');
  const form = document.getElementById('adminReturnDecisionForm');

  if (!modal || !msgInput || !submitBtn) return;

  const isReject = action === 'rejected';

  // Setup modal texts according to action
  if (titleEl) titleEl.textContent = isReject ? 'Reject Return / Exchange' : 'Approve Return / Exchange';
  if (eyebrowEl) eyebrowEl.textContent = 'CUSTOMER COMMUNICATION';
  if (msgLabelEl) msgLabelEl.textContent = 'Message to Customer *';
  msgInput.placeholder = isReject
    ? 'Please explain why this return/exchange request is being rejected...'
    : 'Add instructions or a message for the customer...';
  
  if (submitBtn) {
    submitBtn.textContent = isReject ? 'Send & Reject' : 'Send & Approve';
    submitBtn.className = isReject ? 'btn btn-danger' : 'btn btn-primary';
    submitBtn.disabled = false;
  }

  msgInput.value = '';
  if (errorEl) {
    errorEl.textContent = '';
    errorEl.style.display = 'none';
  }

  const closeModal = () => {
    modal.hidden = true;
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
  };

  modal.hidden = false;
  modal.style.display = 'flex';
  modal.setAttribute('aria-hidden', 'false');
  msgInput.focus();

  if (cancelBtn) {
    cancelBtn.onclick = (e) => {
      e.preventDefault();
      closeModal();
    };
  }
  if (closeBtn) {
    closeBtn.onclick = (e) => {
      e.preventDefault();
      closeModal();
    };
  }
  modal.onclick = (e) => {
    if (e.target === modal) closeModal();
  };

  const handleKeydown = (e) => {
    if (e.key === 'Escape' && (!modal.hidden || modal.style.display === 'flex')) {
      closeModal();
      document.removeEventListener('keydown', handleKeydown);
    }
  };
  document.addEventListener('keydown', handleKeydown);

  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      const message = msgInput.value.trim();

      if (!message) {
        if (errorEl) {
          errorEl.textContent = 'Message to customer is required before proceeding.';
          errorEl.style.display = 'block';
        }
        msgInput.focus();
        return;
      }

      if (errorEl) {
        errorEl.textContent = '';
        errorEl.style.display = 'none';
      }

      // Prevent duplicate submissions
      if (submitBtn.disabled) return;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Processing…';

      try {
        const { data, error } = await supabase.rpc('admin_update_return_request_status', {
          p_return_id: returnId,
          p_status: action,
          p_admin_message: message
        });

        if (error) {
          if (errorEl) {
            errorEl.textContent = 'Failed to update request: ' + error.message;
            errorEl.style.display = 'block';
          }
          submitBtn.disabled = false;
          submitBtn.textContent = isReject ? 'Send & Reject' : 'Send & Approve';
          return;
        }

        // Successful atomic update
        closeModal();

        // Update in-memory state
        const targetReq = returnRequests.find(r => r.id === returnId);
        if (targetReq) {
          targetReq.status = action;
          targetReq.admin_message = message;
        }

        // Refresh Admin UI
        await loadReturnRequests(false);
        await loadReturnDetails(returnId, false);

        if (orders.length) await loadOrders();

      } catch (err) {
        console.error('Error updating return decision:', err);
        if (errorEl) {
          errorEl.textContent = 'An unexpected error occurred: ' + (err.message || err);
          errorEl.style.display = 'block';
        }
        submitBtn.disabled = false;
        submitBtn.textContent = isReject ? 'Send & Reject' : 'Send & Approve';
      }
    };
  }
}

async function processOnlineRefund(returnId, triggerButton = null) {
  if (triggerButton) {
    triggerButton.disabled = true;
    triggerButton.textContent = 'Processing refund…';
  }

  try {
    const req = returnRequests.find(r => r.id === returnId);
    if (!req) throw new Error('Return request not found.');

    const refunds = req.order?.order_refunds || [];
    const activeRefund = refunds.find(r => r.return_request_id === returnId) || refunds[0];
    
    const sessionData = await supabase.auth.getSession();
    const token = sessionData.data.session?.access_token;
    if (!token) throw new Error('Authentication required. Please sign in again.');

    const body = {};
    if (activeRefund?.id) {
      body.refund_id = activeRefund.id;
    } else {
      body.order_id = req.order_id;
    }

    const response = await fetch(`${config.supabaseUrl}/functions/v1/process-order-refund`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    const result = await response.json().catch(() => null);

    if (!response.ok || !result?.success) {
      const errorMsg = result?.error || 'Failed to process refund.';
      alert('Error processing Razorpay refund: ' + errorMsg);
      if (triggerButton) {
        triggerButton.disabled = false;
        triggerButton.textContent = activeRefund?.refund_status === 'failed' ? 'Retry Razorpay Refund' : 'Complete Request';
      }
      await loadReturnRequests(false);
      await loadReturnDetails(returnId, false);
      return;
    }

    alert(`✅ Razorpay Refund processed successfully! Refund ID: ${result.refund_id}`);

    // Update in-memory state
    req.status = 'completed';
    if (req.order) {
      req.order.payment_status = 'refunded';
    }

    // Refresh UI
    await loadReturnRequests(false);
    await loadReturnDetails(returnId, false);
    if (orders.length) await loadOrders();

  } catch (err) {
    console.error('Error in processOnlineRefund:', err);
    alert('An unexpected error occurred: ' + (err.message || err));
    if (triggerButton) {
      triggerButton.disabled = false;
      triggerButton.textContent = 'Complete Request';
    }
  }
}

async function updateReturnStatus(returnId, newStatus, triggerButton = null) {
  const req = returnRequests.find(r => r.id === returnId);
  const isReturn = req?.request_type === 'return';
  const isOnline = req?.order?.payment_method === 'razorpay';

  if (newStatus === 'completed' && isReturn && isOnline) {
    await processOnlineRefund(returnId, triggerButton);
    return;
  }

  if (triggerButton) {
    triggerButton.disabled = true;
    triggerButton.textContent = 'Updating…';
  }

  const { error } = await supabase.rpc('admin_update_return_request_status', {
    p_return_id: returnId,
    p_status: newStatus,
    p_admin_message: null
  });

  if (error) {
    alert('Failed to update return request: ' + error.message);
    if (triggerButton) {
      triggerButton.disabled = false;
      triggerButton.textContent = 'Retry';
    }
    return;
  }

  // Update in-memory state
  const targetReq = returnRequests.find(r => r.id === returnId);
  if (targetReq) targetReq.status = newStatus;

  // Refresh lists
  renderReturnRequests();
  await loadReturnDetails(returnId, false);

  // If orders are loaded, also refresh orders in background so order statuses/badges stay synced
  if (orders.length) await loadOrders();
}

async function saveStatuses(event, orderId) {
  event.preventDefault();
  const form = event.currentTarget;
  const button = form.querySelector('button');
  const updateStatus = document.getElementById('adminUpdateStatus');
  const orderStatus = form.elements.orderStatus.value;
  const paymentStatus = form.elements.paymentStatus.value;
  const courierPartner = form.elements.courierPartner?.value.trim() || null;
  const trackingNumber = form.elements.trackingNumber?.value.trim() || null;
  const trackingUrl = form.elements.trackingUrl?.value.trim() || null;

  const allowedStatuses = allowedOrderStatuses(form.dataset.currentOrderStatus);
  if (!orderStatuses.includes(orderStatus) || !allowedStatuses.includes(orderStatus) || !paymentStatuses.includes(paymentStatus)) return;
  button.disabled = true;
  updateStatus.textContent = 'Saving…';
  const { error } = await supabase.from('orders').update({
    order_status: orderStatus,
    payment_status: paymentStatus,
    courier_partner: courierPartner,
    tracking_number: trackingNumber,
    tracking_url: trackingUrl,
    updated_at: new Date().toISOString()
  }).eq('id', orderId);

  if (error) {
    updateStatus.textContent = error.message || 'Unable to save changes. Please try again.';
    updateStatus.classList.add('is-error');
  } else {
    updateStatus.textContent = 'Order statuses saved.';
    updateStatus.classList.remove('is-error');
    await loadOrders();
    // Also refresh inventory in case an order was cancelled and restored stock
    if (inventory.length) await loadInventory(false);
  }
  button.disabled = false;
}

// -------------------------------------------------------------
// WHATSAPP MESSAGES MANAGEMENT FUNCTIONS
// -------------------------------------------------------------

function setWhatsAppStatus(message = '', isError = false) {
  if (!whatsappStatus) return;
  whatsappStatus.textContent = message;
  whatsappStatus.classList.toggle('is-error', isError);
}

function formatItemsBullet(items, currency = 'INR') {
  if (!Array.isArray(items) || items.length === 0) return '• 1x E-Commerce Demo Item';
  return items.map(item => {
    const parts = [];
    if (item.color) parts.push(item.color);
    if (item.size) parts.push(`Size: ${item.size}`);
    if (!parts.length && item.variant_title && item.variant_title !== 'Standard Fit') {
      parts.push(item.variant_title);
    }
    const suffix = parts.length ? ` (${parts.join(', ')})` : '';
    return `• ${item.quantity || 1}x ${item.product_name || 'Product'}${suffix}`;
  }).join('\n');
}

function sanitizeWhatsAppNumber(rawNumber) {
  if (!rawNumber) return '';
  const digits = String(rawNumber).replace(/\D/g, '');
  if (digits.length === 10) return '91' + digits;
  if (digits.length === 12 && digits.startsWith('91')) return digits;
  if (digits.length > 10 && digits.startsWith('0')) {
    const stripped = digits.replace(/^0+/, '');
    if (stripped.length === 10) return '91' + stripped;
  }
  return digits;
}

function isValidWhatsAppNumber(number) {
  const sanitized = sanitizeWhatsAppNumber(number);
  return /^91[6-9]\d{9}$/.test(sanitized);
}

function generateWhatsAppMessage(type, data) {
  const order = data.order || (data.reference ? data : (data.returnRequest?.order || {}));
  const customer = order.customer || data.customer || (data.returnRequest?.customer || {});
  const custName = customer.full_name || order.customer_full_name || data.customer_full_name || 'Customer';
  const orderRef = order.reference || data.order_reference || 'N/A';
  const items = order.order_items || data.order_items || (data.returnRequest?.order_item ? [data.returnRequest.order_item] : []);
  const currency = order.currency || 'INR';

  switch (type) {
    case 'order_accepted': {
      const itemsList = formatItemsBullet(items, currency);
      const totalFormatted = formatMoney(order.total_paise || 0, currency);
      const payMethod = order.payment_method === 'cod' ? 'Cash on Delivery' : 'Prepaid (Online)';
      const addrParts = [order.shipping_address, order.shipping_city, order.shipping_state, order.shipping_pincode].filter(Boolean);
      const fullAddress = addrParts.length ? addrParts.join(', ') : 'Your shipping address';

      return `Hi ${custName} 👋\n\nThank you for shopping with E-Commerce Demo! Your order #${orderRef} has been accepted and is now being processed.\n\n📦 Order Details:\n${itemsList}\n\n💳 Total Amount: ${totalFormatted} (${payMethod})\n📍 Delivery Address: ${fullAddress}\n\nWe will notify you once your package is shipped with live tracking details.\n\n— Team E-Commerce Demo`;
    }

    case 'order_shipped': {
      const itemsList = formatItemsBullet(items, currency);
      const courier = order.courier_partner || 'Our courier partner';
      const trackingNo = order.tracking_number ? `🔖 Tracking / AWB: ${order.tracking_number}` : '';
      let trackingLink = '';
      if (order.tracking_url) {
        const rawUrl = String(order.tracking_url).trim();
        const safeUrl = rawUrl.startsWith('http://') || rawUrl.startsWith('https://') ? rawUrl : `https://${rawUrl}`;
        trackingLink = `🔗 Live Tracking: ${safeUrl}`;
      } else if (!order.tracking_number) {
        trackingLink = `🚚 Tracking details will be shared shortly.`;
      }

      const trackingBlock = [
        `🚚 Courier Partner: ${courier}`,
        trackingNo,
        trackingLink
      ].filter(Boolean).join('\n');

      return `Hi ${custName} 🚚\n\nGreat news! Your E-Commerce Demo order #${orderRef} has been shipped.\n\n📦 Items:\n${itemsList}\n\n${trackingBlock}\n\nYour package is on its way and will be delivered to your address soon!\n\n— Team E-Commerce Demo`;
    }

    case 'order_delivered': {
      const itemsList = formatItemsBullet(items, currency);
      return `Hi ${custName} 🎉\n\nYour E-Commerce Demo order #${orderRef} has been successfully delivered!\n\n📦 Items Delivered:\n${itemsList}\n\nWe hope you love your new styles! If you have any questions or feedback regarding your order, feel free to reach out to us.\n\nThank you for choosing E-Commerce Demo! ✨\n\n— Team E-Commerce Demo`;
    }

    case 'refund': {
      const req = data.returnRequest || data;
      const item = req.order_item || (items.length ? items[0] : {});
      const varParts = [];
      if (item.color) varParts.push(item.color);
      if (item.size) varParts.push(`Size: ${item.size}`);
      const varText = varParts.length ? ` (${varParts.join(', ')})` : '';
      const prodName = (item.product_name || 'Item') + varText;
      const refundPaise = req.refund_amount_paise || item.line_total_paise || order.total_paise || 0;
      const refundFormatted = formatMoney(refundPaise, currency);
      const refundMethod = req.refund_method === 'upi' ? 'UPI Transfer' : (req.refund_method === 'bank_transfer' ? 'Bank Account Transfer' : (order.payment_method === 'razorpay' ? 'Original Payment Method (Razorpay)' : 'Bank / UPI Transfer'));
      const statusText = req.status ? req.status.replace(/_/g, ' ') : 'initiated';

      return `Hi ${custName} ℹ️\n\nYour return & refund request for E-Commerce Demo order #${orderRef} is currently: ${statusText.toUpperCase()}.\n\n📦 Returned Item: ${prodName}\n💰 Refund Amount: ${refundFormatted}\n💳 Refund Method: ${refundMethod}\n\nOur team is processing your request according to our return policy. We will notify you as soon as the refund is completed.\n\n— Team E-Commerce Demo`;
    }

    case 'refund_complete': {
      const req = data.returnRequest || data;
      const refunds = order.order_refunds || req?.order?.order_refunds || [];
      const activeRefund = refunds.find(r => r.return_request_id === req?.id) || refunds[0] || {};
      const item = req?.order_item || (items.length ? items[0] : {});
      const refundPaise = req?.refund_amount_paise || activeRefund?.amount_paise || item?.line_total_paise || order.total_paise || 0;
      const refundFormatted = formatMoney(refundPaise, currency);
      const refundMethod = req?.refund_method === 'upi' ? 'UPI Transfer' : (req?.refund_method === 'bank_transfer' ? 'Bank Account Transfer' : (order.payment_method === 'razorpay' ? 'Original Payment Method (Razorpay)' : 'Bank / UPI Transfer'));

      let refLine = '';
      if (activeRefund.razorpay_refund_id) {
        refLine = `🔖 Refund Reference ID: ${activeRefund.razorpay_refund_id}\n`;
      }

      return `Hi ${custName} ✅\n\nYour refund for E-Commerce Demo order #${orderRef} has been successfully completed!\n\n💰 Refund Amount: ${refundFormatted}\n💳 Refund Method: ${refundMethod}\n${refLine}The amount has been transferred to your account. Please allow standard bank processing time for it to reflect in your statement.\n\nThank you for your patience and trust in E-Commerce Demo!\n\n— Team E-Commerce Demo`;
    }

    case 'exchange': {
      const req = data.returnRequest || data;
      const item = req.order_item || (items.length ? items[0] : {});
      const originalSize = item.size || 'Standard';
      const replacementSize = req.requested_replacement_size || 'Requested Replacement';
      const statusText = req.status ? req.status.replace(/_/g, ' ') : 'in progress';

      return `Hi ${custName} 🔄\n\nYour exchange request for E-Commerce Demo order #${orderRef} is currently: ${statusText.toUpperCase()}.\n\n📦 Original Item: ${item.product_name || 'Product'} (Size: ${originalSize})\n✨ Requested Replacement Size: ${replacementSize}\n\nOur team is processing your replacement. We will keep you updated on the reverse pickup and dispatch progress.\n\n— Team E-Commerce Demo`;
    }

    case 'exchange_complete': {
      const req = data.returnRequest || data;
      const item = req.order_item || (items.length ? items[0] : {});
      const replacementSize = req.requested_replacement_size || 'Replacement Size';

      return `Hi ${custName} 🎁\n\nYour exchange for E-Commerce Demo order #${orderRef} is now complete!\n\n📦 Original Item: ${item.product_name || 'Product'}\n✨ Replacement Size: ${replacementSize}\n\nYour replacement item has been processed and dispatched. We hope you enjoy the perfect fit!\n\nThank you for choosing E-Commerce Demo! ✨\n\n— Team E-Commerce Demo`;
    }

    default:
      return `Hi ${custName},\n\nUpdate regarding your E-Commerce Demo order #${orderRef}.\n\n— Team E-Commerce Demo`;
  }
}

function getWhatsAppTypeMeta(type) {
  switch (type) {
    case 'order_accepted':
      return { label: 'Order Accepted', badgeClass: 'admin-badge-wa-order_accepted' };
    case 'order_shipped':
      return { label: 'Order Shipped', badgeClass: 'admin-badge-wa-order_shipped' };
    case 'order_delivered':
      return { label: 'Order Delivered', badgeClass: 'admin-badge-wa-order_delivered' };
    case 'refund':
      return { label: 'Refund', badgeClass: 'admin-badge-wa-refund' };
    case 'refund_complete':
      return { label: 'Refund Complete', badgeClass: 'admin-badge-wa-refund_complete' };
    case 'exchange':
      return { label: 'Exchange', badgeClass: 'admin-badge-wa-exchange' };
    case 'exchange_complete':
      return { label: 'Exchange Complete', badgeClass: 'admin-badge-wa-exchange_complete' };
    default:
      return { label: type, badgeClass: 'admin-badge-wa' };
  }
}

function buildWhatsAppMessagesList() {
  const list = [];

  // 1. Scan Orders
  orders.forEach(order => {
    const custName = customerName(order) || 'Customer';
    const mobile = order.customer_mobile || order.customer?.mobile || '';

    // Order Accepted (confirmed or processing)
    if (['confirmed', 'processing'].includes(order.order_status)) {
      list.push({
        id: `ord_${order.id}_accepted`,
        orderId: order.id,
        returnId: null,
        orderRef: order.reference,
        type: 'order_accepted',
        status: order.order_status,
        customerName: custName,
        customerMobile: mobile,
        createdAt: order.created_at,
        order: order
      });
    }

    // Order Shipped
    if (order.order_status === 'shipped') {
      list.push({
        id: `ord_${order.id}_shipped`,
        orderId: order.id,
        returnId: null,
        orderRef: order.reference,
        type: 'order_shipped',
        status: order.order_status,
        customerName: custName,
        customerMobile: mobile,
        createdAt: order.created_at,
        order: order
      });
    }

    // Order Delivered
    if (order.order_status === 'delivered') {
      list.push({
        id: `ord_${order.id}_delivered`,
        orderId: order.id,
        returnId: null,
        orderRef: order.reference,
        type: 'order_delivered',
        status: order.order_status,
        customerName: custName,
        customerMobile: mobile,
        createdAt: order.created_at,
        order: order
      });
    }
  });

  // 2. Scan Return & Exchange Requests
  returnRequests.forEach(req => {
    const order = req.order || {};
    const custName = req.customer?.full_name || order.customer_full_name || 'Customer';
    const mobile = req.customer?.mobile || order.customer_mobile || '';
    const orderRef = order.reference || 'N/A';

    if (req.request_type === 'return') {
      if (['requested', 'approved', 'pickup_scheduled', 'received'].includes(req.status)) {
        list.push({
          id: `ret_${req.id}_in_progress`,
          orderId: req.order_id,
          returnId: req.id,
          orderRef: orderRef,
          type: 'refund',
          status: req.status,
          customerName: custName,
          customerMobile: mobile,
          createdAt: req.created_at,
          returnRequest: req,
          order: order
        });
      }

      if (req.status === 'completed' || (order.order_refunds && order.order_refunds.some(r => r.refund_status === 'completed'))) {
        list.push({
          id: `ret_${req.id}_complete`,
          orderId: req.order_id,
          returnId: req.id,
          orderRef: orderRef,
          type: 'refund_complete',
          status: 'completed',
          customerName: custName,
          customerMobile: mobile,
          createdAt: req.updated_at || req.created_at,
          returnRequest: req,
          order: order
        });
      }
    } else if (req.request_type === 'exchange') {
      if (['requested', 'approved', 'pickup_scheduled', 'received'].includes(req.status)) {
        list.push({
          id: `exc_${req.id}_in_progress`,
          orderId: req.order_id,
          returnId: req.id,
          orderRef: orderRef,
          type: 'exchange',
          status: req.status,
          customerName: custName,
          customerMobile: mobile,
          createdAt: req.created_at,
          returnRequest: req,
          order: order
        });
      }

      if (req.status === 'completed') {
        list.push({
          id: `exc_${req.id}_complete`,
          orderId: req.order_id,
          returnId: req.id,
          orderRef: orderRef,
          type: 'exchange_complete',
          status: 'completed',
          customerName: custName,
          customerMobile: mobile,
          createdAt: req.updated_at || req.created_at,
          returnRequest: req,
          order: order
        });
      }
    }
  });

  // Sort descending by creation date
  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return list;
}

function updateWhatsAppCounters(allMessages) {
  let countAll = allMessages.length;
  let countAccepted = 0;
  let countShipped = 0;
  let countDelivered = 0;
  let countRefund = 0;
  let countRefundComplete = 0;
  let countExchange = 0;
  let countExchangeComplete = 0;

  allMessages.forEach(m => {
    if (m.type === 'order_accepted') countAccepted++;
    else if (m.type === 'order_shipped') countShipped++;
    else if (m.type === 'order_delivered') countDelivered++;
    else if (m.type === 'refund') countRefund++;
    else if (m.type === 'refund_complete') countRefundComplete++;
    else if (m.type === 'exchange') countExchange++;
    else if (m.type === 'exchange_complete') countExchangeComplete++;
  });

  if (waCountAll) waCountAll.textContent = String(countAll);
  if (waCountAccepted) waCountAccepted.textContent = String(countAccepted);
  if (waCountShipped) waCountShipped.textContent = String(countShipped);
  if (waCountDelivered) waCountDelivered.textContent = String(countDelivered);
  if (waCountRefund) waCountRefund.textContent = String(countRefund);
  if (waCountRefundComplete) waCountRefundComplete.textContent = String(countRefundComplete);
  if (waCountExchange) waCountExchange.textContent = String(countExchange);
  if (waCountExchangeComplete) waCountExchangeComplete.textContent = String(countExchangeComplete);

  const pills = [
    { el: waFilterAll, type: 'all' },
    { el: waFilterAccepted, type: 'order_accepted' },
    { el: waFilterShipped, type: 'order_shipped' },
    { el: waFilterDelivered, type: 'order_delivered' },
    { el: waFilterRefund, type: 'refund' },
    { el: waFilterRefundComplete, type: 'refund_complete' },
    { el: waFilterExchange, type: 'exchange' },
    { el: waFilterExchangeComplete, type: 'exchange_complete' }
  ];

  pills.forEach(p => {
    if (p.el) {
      p.el.classList.toggle('is-active', currentWaTypeFilter === p.type);
    }
  });
}

function filteredWhatsAppMessages(allMessages) {
  const query = (whatsappSearch?.value || '').trim().toLowerCase();
  const typeFilter = currentWaTypeFilter;
  const dateFilter = whatsappDateFilter?.value || 'all';

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const last7Days = now.getTime() - 7 * 24 * 60 * 60 * 1000;
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  let customFrom = null;
  let customTo = null;
  if (dateFilter === 'custom') {
    if (whatsappDateFrom?.value) customFrom = new Date(`${whatsappDateFrom.value}T00:00:00`).getTime();
    if (whatsappDateTo?.value) customTo = new Date(`${whatsappDateTo.value}T23:59:59.999`).getTime();
  }

  return allMessages.filter(item => {
    // 1. Message Type Filter
    if (typeFilter !== 'all' && item.type !== typeFilter) return false;

    // 2. Date Filter
    const time = new Date(item.createdAt).getTime();
    if (!Number.isNaN(time)) {
      if (dateFilter === 'today' && time < startOfToday) return false;
      if (dateFilter === 'last7' && time < last7Days) return false;
      if (dateFilter === 'thisMonth' && time < startOfMonth) return false;
      if (dateFilter === 'custom') {
        if (customFrom && time < customFrom) return false;
        if (customTo && time > customTo) return false;
      }
    }

    // 3. Search Query
    if (query) {
      const searchable = [
        item.orderRef,
        item.customerName,
        item.customerMobile,
        item.type,
        item.status
      ].filter(Boolean).join(' ').toLowerCase();

      if (!searchable.includes(query)) return false;
    }

    return true;
  });
}

function renderWhatsAppMessages() {
  if (!whatsappList) return;
  const allMessages = buildWhatsAppMessagesList();
  updateWhatsAppCounters(allMessages);
  const visible = filteredWhatsAppMessages(allMessages);

  if (whatsappEmpty) whatsappEmpty.hidden = visible.length > 0;

  whatsappList.innerHTML = visible.map(item => {
    const meta = getWhatsAppTypeMeta(item.type);
    const defaultMsg = generateWhatsAppMessage(item.type, item);
    const shortPreview = defaultMsg.length > 80 ? defaultMsg.slice(0, 77) + '…' : defaultMsg;

    return `
      <tr>
        <td>
          <button class="admin-order-link" type="button" data-order-id="${escapeHtml(item.orderId || '')}" title="View Order">
            <strong>#${escapeHtml(item.orderRef)}</strong>
            <span>${escapeHtml(formatDate(item.createdAt))}</span>
          </button>
        </td>
        <td>
          <strong>${escapeHtml(item.customerName)}</strong>
          ${item.customerMobile ? `<code style="display:block;font-size:11px;color:#059669;margin-top:2px;">${escapeHtml(item.customerMobile)}</code>` : '<span style="color:#94a3b8;font-size:11px;">No phone</span>'}
        </td>
        <td>
          <span class="admin-badge-wa ${escapeHtml(meta.badgeClass)}">${escapeHtml(meta.label)}</span>
        </td>
        <td>
          <span class="admin-badge admin-badge-order admin-badge-${escapeHtml(item.status)}">${escapeHtml(item.status.replace(/_/g, ' ').toUpperCase())}</span>
        </td>
        <td class="admin-wa-preview-cell">
          <div class="admin-wa-preview-box" title="${escapeHtml(defaultMsg)}">${escapeHtml(shortPreview)}</div>
        </td>
        <td style="text-align: right;">
          <div class="admin-wa-actions">
            <button type="button" class="btn btn-sm btn-outline admin-wa-edit-btn" data-item-id="${escapeHtml(item.id)}" data-type="${escapeHtml(item.type)}" data-order-id="${escapeHtml(item.orderId || '')}" data-return-id="${escapeHtml(item.returnId || '')}" title="Edit message before sending">
              ✏️ Edit
            </button>
            <button type="button" class="btn btn-sm btn-whatsapp admin-wa-send-btn" data-item-id="${escapeHtml(item.id)}" data-type="${escapeHtml(item.type)}" data-order-id="${escapeHtml(item.orderId || '')}" data-return-id="${escapeHtml(item.returnId || '')}" data-mobile="${escapeHtml(item.customerMobile || '')}" title="Send on WhatsApp">
              💬 Send
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  // Attach order link listeners
  whatsappList.querySelectorAll('.admin-order-link').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.orderId) viewOrderInOrdersTab(btn.dataset.orderId);
    });
  });

  // Attach Edit button listeners
  whatsappList.querySelectorAll('.admin-wa-edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      openWhatsAppModal(btn.dataset.type, btn.dataset.orderId, btn.dataset.returnId);
    });
  });

  // Attach Send button listeners (opens modal so admin can review and press Send on WhatsApp)
  whatsappList.querySelectorAll('.admin-wa-send-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      openWhatsAppModal(btn.dataset.type, btn.dataset.orderId, btn.dataset.returnId);
    });
  });
}

async function loadWhatsAppMessagesData(announce = true) {
  if (announce) setWhatsAppStatus('Loading messages…');
  try {
    const promises = [];
    if (!orders.length) promises.push(loadOrders());
    if (!returnRequests.length) promises.push(loadReturnRequests(false));
    if (promises.length) await Promise.all(promises);
    renderWhatsAppMessages();
    if (announce) setWhatsAppStatus();
  } catch (err) {
    if (announce) setWhatsAppStatus('Unable to load WhatsApp data.', true);
  }
}

function openWhatsAppModal(type, orderId, returnId = null) {
  if (!adminWhatsAppModal) return;

  const order = orders.find(o => o.id === orderId) || {};
  const req = returnId ? returnRequests.find(r => r.id === returnId) : (order.return_requests?.[0] || null);

  const customer = order.customer || req?.customer || {};
  const custName = customer.full_name || order.customer_full_name || req?.customer?.full_name || 'Customer';
  const custMobile = order.customer_mobile || customer.mobile || req?.customer?.mobile || '';
  const orderRef = order.reference || req?.order?.reference || 'N/A';

  const meta = getWhatsAppTypeMeta(type);
  const defaultMsg = generateWhatsAppMessage(type, {
    order,
    returnRequest: req,
    reference: orderRef,
    customer_full_name: custName,
    customer_mobile: custMobile
  });

  currentWaModalData = {
    orderId,
    returnId,
    messageType: type,
    customerMobile: custMobile,
    defaultMessage: defaultMsg
  };

  if (waModalOrderRef) waModalOrderRef.textContent = '#' + orderRef;
  if (waModalTypeBadge) {
    waModalTypeBadge.innerHTML = `<span class="admin-badge-wa ${escapeHtml(meta.badgeClass)}">${escapeHtml(meta.label)}</span>`;
  }
  if (waModalCustomerName) waModalCustomerName.textContent = custName;
  if (waModalCustomerMobile) waModalCustomerMobile.textContent = custMobile ? `+91 ${custMobile.replace(/^(\+91|91)/, '')}` : 'Not Provided';

  if (waMessageTextarea) {
    waMessageTextarea.value = defaultMsg;
    updateWaCharCount();
  }

  adminWhatsAppModal.hidden = false;
  adminWhatsAppModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
}

function openWhatsAppModalForOrder(orderId) {
  const order = orders.find(o => o.id === orderId);
  if (!order) return;

  let defaultType = 'order_accepted';
  if (order.order_status === 'shipped') defaultType = 'order_shipped';
  else if (order.order_status === 'delivered') defaultType = 'order_delivered';

  openWhatsAppModal(defaultType, orderId, null);
}

function openWhatsAppModalForReturn(returnId) {
  const req = returnRequests.find(r => r.id === returnId);
  if (!req) return;

  let defaultType = req.request_type === 'exchange' ? 'exchange' : 'refund';
  if (req.status === 'completed') {
    defaultType = req.request_type === 'exchange' ? 'exchange_complete' : 'refund_complete';
  }

  openWhatsAppModal(defaultType, req.order_id, returnId);
}

function closeWhatsAppModal() {
  if (!adminWhatsAppModal) return;
  adminWhatsAppModal.hidden = true;
  adminWhatsAppModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}

function updateWaCharCount() {
  if (!waCharCount || !waMessageTextarea) return;
  const len = waMessageTextarea.value.length;
  const words = waMessageTextarea.value.trim() ? waMessageTextarea.value.trim().split(/\s+/).length : 0;
  waCharCount.textContent = `${len} characters (${words} words)`;
}

function sendOnWhatsApp(phoneNumber, messageText) {
  const sanitized = sanitizeWhatsAppNumber(phoneNumber);
  if (!isValidWhatsAppNumber(sanitized)) {
    alert(`Invalid or missing mobile number (${phoneNumber || 'Empty'}). Please ensure the customer has a valid 10-digit Indian mobile number.`);
    return;
  }
  const cleanText = (messageText || '').trim();
  if (!cleanText) {
    alert('Message content cannot be empty.');
    return;
  }
  const url = `https://wa.me/${sanitized}?text=${encodeURIComponent(cleanText)}`;
  window.open(url, '_blank');
}

// -------------------------------------------------------------
// INVENTORY MANAGEMENT FUNCTIONS
// -------------------------------------------------------------

function updateInventoryCounters() {
  let allCount = inventory.length;
  let lowProductCount = 0;
  let outProductCount = 0;

  inventory.forEach(product => {
    const flags = getProductStockFlags(product);
    if (flags.hasLow) lowProductCount++;
    if (flags.hasOut) outProductCount++;
  });

  if (invCountAll) invCountAll.textContent = String(allCount);
  if (invCountLow) invCountLow.textContent = String(lowProductCount);
  if (invCountOut) invCountOut.textContent = String(outProductCount);

  if (invFilterAll) {
    invFilterAll.classList.toggle('is-active', currentInventoryStockFilter === 'all');
    invFilterAll.setAttribute('aria-pressed', String(currentInventoryStockFilter === 'all'));
  }
  if (invFilterLow) {
    invFilterLow.classList.toggle('is-active', currentInventoryStockFilter === 'low');
    invFilterLow.setAttribute('aria-pressed', String(currentInventoryStockFilter === 'low'));
  }
  if (invFilterOut) {
    invFilterOut.classList.toggle('is-active', currentInventoryStockFilter === 'out');
    invFilterOut.setAttribute('aria-pressed', String(currentInventoryStockFilter === 'out'));
  }
}

function filteredInventory() {
  const query = (inventorySearch?.value || '').trim().toLowerCase();
  return inventory.filter(product => {
    // 1. Stock Status Filter
    if (currentInventoryStockFilter !== 'all') {
      const flags = getProductStockFlags(product);
      if (currentInventoryStockFilter === 'low' && !flags.hasLow) return false;
      if (currentInventoryStockFilter === 'out' && !flags.hasOut) return false;
    }

    // 2. Search Query Filter
    if (query) {
      const searchable = [product.id, product.name].join(' ').toLowerCase();
      if (!searchable.includes(query)) return false;
    }

    return true;
  });
}

function stockBadge(stock, reserved) {
  const available = stock - reserved;
  if (available <= 0) return `<span class="admin-badge admin-badge-payment-failed">Out of Stock</span>`;
  if (available <= 5) return `<span class="admin-badge admin-badge-order-confirmed">Low (${available})</span>`;
  return `<span class="admin-badge admin-badge-payment-paid">In Stock (${available})</span>`;
}

function renderInventory() {
  updateInventoryCounters();
  const visible = filteredInventory();
  if (inventoryEmpty) inventoryEmpty.hidden = visible.length > 0;
  if (!inventoryList) return;

  if (!visible.length) {
    inventoryList.innerHTML = '';
    return;
  }

  inventoryList.innerHTML = visible.map(product => {
    const variants = Array.isArray(product.product_variants) ? product.product_variants : [];
    const hasMultipleVariants = variants.length > 1;

    const totalStock = hasMultipleVariants
      ? variants.reduce((sum, v) => sum + (v.stock_quantity || 0), 0)
      : Number(product.stock_quantity ?? 0);
    const totalReserved = hasMultipleVariants
      ? variants.reduce((sum, v) => sum + (v.reserved_quantity || 0), 0)
      : Number(product.reserved_quantity ?? 0);
    const totalAvailable = Math.max(0, totalStock - totalReserved);

    let variantRowsHtml = '';
    if (hasMultipleVariants) {
      variantRowsHtml = variants.map(v => {
        const vStock = Number(v.stock_quantity || 0);
        const vReserved = Number(v.reserved_quantity || 0);
        const vAvail = Math.max(0, vStock - vReserved);
        const vDesc = [v.title || '', v.color ? `Color: ${v.color}` : '', v.size ? `Size: ${v.size}` : ''].filter(Boolean).join(' • ');

        return `
          <tr class="admin-variant-row" style="background:#f8fafc;border-left:3px solid #0f172a;">
            <td style="padding-left:24px;">
              <div style="font-size:13px;">
                <strong>${escapeHtml(vDesc || 'Variant')}</strong>
                ${v.sku ? `<span style="display:block;font-size:11px;color:#64748b;">SKU: ${escapeHtml(v.sku)}</span>` : ''}
              </div>
            </td>
            <td>${escapeHtml(formatMoney(v.price_paise, product.currency))}</td>
            <td>
              <input
                type="number"
                class="admin-stock-input"
                id="var_stock_${escapeHtml(v.id)}"
                data-variant-id="${escapeHtml(v.id)}"
                min="${vReserved}"
                value="${vStock}"
                style="width:70px;padding:4px;"
                aria-label="Stock for variant ${escapeHtml(vDesc)}"
              >
            </td>
            <td>
              <strong>${vReserved}</strong>
              ${vReserved > 0 ? '<span class="admin-stock-hint">in hold</span>' : ''}
            </td>
            <td>
              <strong>${vAvail}</strong>
            </td>
            <td>${stockBadge(vStock, vReserved)}</td>
            <td>
              <button
                class="btn btn-outline admin-btn-save-var-stock"
                type="button"
                data-save-variant-id="${escapeHtml(v.id)}"
                data-product-id="${escapeHtml(product.id)}"
                style="padding:4px 8px;font-size:12px;"
              >
                Save
              </button>
            </td>
          </tr>
        `;
      }).join('');
    }

    const mainRowAction = hasMultipleVariants
      ? `<span class="admin-badge admin-badge-order">${variants.length} Variants</span>`
      : `
        <button
          class="btn btn-outline admin-btn-save-stock"
          type="button"
          data-save-product-id="${escapeHtml(product.id)}"
        >
          Save Stock
        </button>
      `;

    const mainStockInput = hasMultipleVariants
      ? `<strong>${totalStock}</strong> <span style="font-size:11px;color:#64748b;">(sum of variants)</span>`
      : `
        <input
          type="number"
          class="admin-stock-input"
          id="stock_${escapeHtml(product.id)}"
          data-product-id="${escapeHtml(product.id)}"
          min="${totalReserved}"
          value="${totalStock}"
          aria-label="Stock for ${escapeHtml(product.name)}"
        >
      `;

    return `
      <tr class="admin-product-row">
        <td>
          <div class="admin-product-cell">
            <strong>${escapeHtml(product.name || 'Untitled product')}</strong>
            <span><code>${escapeHtml(product.id)}</code></span>
          </div>
        </td>
        <td>${escapeHtml(formatMoney(product.price_paise, product.currency))}</td>
        <td>
          ${mainStockInput}
        </td>
        <td>
          <strong>${totalReserved}</strong>
          ${totalReserved > 0 ? '<span class="admin-stock-hint">in hold</span>' : ''}
        </td>
        <td>
          <strong>${totalAvailable}</strong>
        </td>
        <td>${stockBadge(totalStock, totalReserved)}</td>
        <td>
          ${mainRowAction}
        </td>
      </tr>
      ${variantRowsHtml}
    `;
  }).join('');
}

async function loadInventory(announce = true) {
  if (!supabase) return;
  if (announce) setInventoryStatus('Loading inventory…');
  if (inventoryEmpty) inventoryEmpty.hidden = true;
  if (inventoryList) inventoryList.innerHTML = '';

  let { data, error } = await supabase
    .from('products')
    .select('id, name, price_paise, mrp_paise, sale_price_paise, currency, is_active, stock_quantity, reserved_quantity, product_variants(id, sku, title, color, size, price_paise, mrp_paise, sale_price_paise, stock_quantity, reserved_quantity, is_active, sort_order)')
    .order('name', { ascending: true });

  if (error && error.code === 'PGRST200') {
    // Fallback if product_variants is not yet migrated
    const fallback = await supabase
      .from('products')
      .select('id, name, price_paise, mrp_paise, sale_price_paise, currency, is_active, stock_quantity, reserved_quantity')
      .order('name', { ascending: true });
    data = fallback.data;
    error = fallback.error;
  }

  if (error) {
    setInventoryStatus('Unable to load inventory. Please try again.', true);
    return;
  }
  setInventoryStatus();
  inventory = data || [];
  renderInventory();
  if (currentTab === 'overview') renderOverview();
}

async function updateVariantStock(variantId, productId, newStock, button) {
  if (!supabase || !variantId) return;

  if (!Number.isInteger(newStock) || newStock < 0) {
    setInventoryStatus('Please enter a valid non-negative integer for variant stock.', true);
    return;
  }

  if (button) {
    button.disabled = true;
    button.textContent = 'Saving…';
  }
  setInventoryStatus('Updating variant stock…');

  try {
    const { data, error } = await supabase.rpc('admin_update_variant_stock', {
      p_variant_id: variantId,
      p_stock_quantity: newStock
    });

    if (error) {
      setInventoryStatus(error.message || 'Failed to update variant stock.', true);
      return;
    }

    setInventoryStatus(`Variant stock updated to ${newStock}.`);
    await loadInventory(false);
    if (products.length) await loadProducts(false);
  } catch (err) {
    setInventoryStatus(`Error updating variant stock: ${err.message}`, true);
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = 'Save';
    }
  }
}

async function updateProductStock(productId, newStock, button) {
  if (!supabase) return;
  const prod = inventory.find(p => p.id === productId);
  if (!prod) return;

  if (!Number.isInteger(newStock) || newStock < 0) {
    setInventoryStatus('Please enter a valid non-negative integer for stock.', true);
    return;
  }

  if (newStock < (prod.reserved_quantity || 0)) {
    setInventoryStatus(
      `Cannot set stock to ${newStock}: currently ${prod.reserved_quantity} units are reserved by active checkouts.`,
      true
    );
    return;
  }

  if (button) {
    button.disabled = true;
    button.textContent = 'Saving…';
  }
  setInventoryStatus(`Updating stock for ${prod.name}…`);

  try {
    const { data, error } = await supabase.rpc('admin_update_product_stock', {
      p_product_id: productId,
      p_stock_quantity: newStock
    });

    if (error) {
      setInventoryStatus(error.message || 'Failed to update stock.', true);
      return;
    }

    setInventoryStatus(`Stock for "${prod.name}" successfully updated to ${newStock}.`);
    if (data && data[0]) {
      prod.stock_quantity = data[0].new_stock;
      prod.reserved_quantity = data[0].reserved;
    } else {
      prod.stock_quantity = newStock;
    }
    renderInventory();
    if (products.length) {
      const p = products.find(item => item.id === productId);
      if (p) {
        p.stock_quantity = prod.stock_quantity;
        p.reserved_quantity = prod.reserved_quantity;
        renderProducts();
      }
    }
  } catch (err) {
    setInventoryStatus(`Error updating stock: ${err.message}`, true);
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = 'Save Stock';
    }
  }
}

function filteredProducts() {
  const query = (productsSearch?.value || '').trim().toLowerCase();

  return products.filter(product => {
    const searchable = [
      product.id,
      product.name,
      product.family_name,
      product.variety_name,
      product.category,
      product.category_slug
    ].join(' ').toLowerCase();

    return !query || searchable.includes(query);
  });
}

async function loadProducts(announce = true) {
  if (announce) setProductsStatus('Loading products…');

  if (productsEmpty) productsEmpty.hidden = true;
  if (productsList) productsList.innerHTML = '';

  // Load product families concurrently if not yet loaded
  loadProductFamilies().catch(e => console.warn('Product families load:', e));

  let { data, error } = await supabase
    .from('products')
    .select('id, name, price_paise, mrp_paise, sale_price_paise, pricing_mode, category_id, currency, category, category_slug, description, images, alt_text, is_active, stock_quantity, reserved_quantity, family_id, family_name, variety_name, product_mode, product_variants(id, sku, title, color, size, price_paise, mrp_paise, sale_price_paise, pricing_mode, stock_quantity, reserved_quantity, is_active, sort_order)')
    .order('name', { ascending: true });

  if (error && error.code === 'PGRST200') {
    // Fallback if product_variants is not yet migrated
    const fallback = await supabase
      .from('products')
      .select('id, name, price_paise, mrp_paise, sale_price_paise, currency, category, category_slug, description, images, alt_text, is_active, stock_quantity, reserved_quantity, family_id, family_name, variety_name, product_mode')
      .order('name', { ascending: true });
    data = fallback.data;
    error = fallback.error;
  }

  if (error) {
    setProductsStatus('Unable to load products. Please try again.', true);
    return;
  }

  setProductsStatus();
  products = data || [];
  renderProducts();
}

function renderProducts() {
  const visible = filteredProducts();

  if (productsEmpty) productsEmpty.hidden = visible.length > 0;
  if (!productsList) return;

  if (!visible.length) {
    productsList.innerHTML = '';
    return;
  }

  // Group products by family_id
  const groups = {};
  visible.forEach(product => {
    const groupId = product.family_id || 'unassigned';
    let groupName = 'Other Products';
    if (product.family_id) {
      const fam = productFamilies.find(f => f.id === product.family_id);
      groupName = fam ? fam.name : (product.family_name || 'Other Products');
    } else if (product.family_name) {
      groupName = product.family_name;
    }
    if (groupName === 'ALL BAGGY JEANS COLLECTION') {
      groupName = 'Baggy Jeans';
    }

    if (!groups[groupId]) {
      groups[groupId] = {
        id: groupId,
        name: groupName,
        products: []
      };
    }
    groups[groupId].products.push(product);
  });

  // Sort groups: sort_order asc, then name. 'unassigned' group at the end.
  const sortedGroups = Object.values(groups).sort((a, b) => {
    if (a.id === 'unassigned') return 1;
    if (b.id === 'unassigned') return -1;

    const famA = productFamilies.find(f => f.id === a.id);
    const famB = productFamilies.find(f => f.id === b.id);

    const sortA = famA ? (famA.sort_order ?? 0) : 9999;
    const sortB = famB ? (famB.sort_order ?? 0) : 9999;

    if (sortA !== sortB) {
      return sortA - sortB;
    }
    return a.name.localeCompare(b.name);
  });

  // Sort products within each group by sort_order, then name
  sortedGroups.forEach(g => {
    g.products.sort((a, b) => {
      const sortA = a.sort_order ?? 0;
      const sortB = b.sort_order ?? 0;
      if (sortA !== sortB) {
        return sortA - sortB;
      }
      return a.name.localeCompare(b.name);
    });
  });

  productsList.innerHTML = sortedGroups.map(group => {
    const isCollapsed = collapsedProductGroups.has(group.id);

    const productsHtml = group.products.map(product => {
      const salePrice = Number(product.sale_price_paise ?? product.price_paise ?? 0);
      const mrp = Number(product.mrp_paise ?? product.sale_price_paise ?? product.price_paise ?? 0);
      const variants = Array.isArray(product.product_variants) ? product.product_variants : [];
      const hasVariants = variants.length > 0;

      const stock = hasVariants
        ? variants.reduce((sum, v) => sum + (v.stock_quantity || 0), 0)
        : Number(product.stock_quantity || 0);
      const reserved = hasVariants
        ? variants.reduce((sum, v) => sum + (v.reserved_quantity || 0), 0)
        : Number(product.reserved_quantity || 0);
      const available = Math.max(0, stock - reserved);

      const status = product.is_active
        ? '<span class="admin-badge admin-badge-payment-paid">Active</span>'
        : '<span class="admin-badge admin-badge-payment-failed">Inactive</span>';

      const variantBadge = variants.length > 1
        ? `<span class="admin-badge admin-badge-order" style="margin-left:6px;font-size:10px;">${variants.length} Variants</span>`
        : '';

      const familyTag = product.family_name
        ? `<span class="admin-family-badge" title="Product Variety">${escapeHtml(product.family_name)}</span>`
        : '';
      const varietyTag = product.variety_name
        ? `<span class="admin-variety-badge" title="Variety / Design">${escapeHtml(product.variety_name)}</span>`
        : (product.product_mode === 'single' ? '<span class="admin-family-badge" style="opacity:0.75;font-weight:normal;" title="Single Standalone Product">Single Fit</span>' : '');

      let effectiveSalePrice = salePrice;
      if (product.pricing_mode === 'none') {
        effectiveSalePrice = mrp;
      } else if (product.pricing_mode === 'category') {
        const catRule = getCategoryDiscountRule(product.category_id || product.category || product.category_slug);
        if (catRule && catRule.discount_is_active && catRule.discount_type && catRule.discount_type !== 'none' && Number(catRule.discount_value) > 0) {
          if (catRule.discount_type === 'percentage') {
            const pct = Math.min(100, Math.max(0, Number(catRule.discount_value)));
            effectiveSalePrice = Math.round(mrp * (100 - pct) / 100);
          } else if (catRule.discount_type === 'fixed') {
            effectiveSalePrice = Math.max(0, mrp - Number(catRule.discount_value));
          }
        }
      }

      let priceDisplay = formatMoney(effectiveSalePrice, product.currency || 'INR');
      if (mrp > effectiveSalePrice && effectiveSalePrice > 0) {
        const discountPct = calculateDiscountPercent(mrp, effectiveSalePrice);
        const modeTag = product.pricing_mode === 'category' ? ' (Category)' : '';
        priceDisplay = `
          <div style="display:flex;flex-direction:column;gap:2px;">
            <div><strong>${formatMoney(effectiveSalePrice, product.currency || 'INR')}</strong></div>
            <div style="font-size:11px;color:#94a3b8;"><span style="text-decoration:line-through;">${formatMoney(mrp, product.currency || 'INR')}</span> ${discountPct > 0 ? `<span class="admin-discount-badge" style="padding:1px 5px;font-size:10px;margin-left:2px;">${discountPct}% OFF${modeTag}</span>` : ''}</div>
          </div>
        `;
      }

      return `
        <tr>
          <td>
            <div class="admin-product-cell">
              <strong>${escapeHtml(product.name || 'Untitled product')}${variantBadge}</strong>
              <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin:3px 0;">
                ${familyTag}
                ${varietyTag}
              </div>
              <span><code>${escapeHtml(product.id)}</code></span>
            </div>
          </td>
          <td>
            ${priceDisplay}
          </td>
          <td>
            ${escapeHtml(product.category || product.category_slug || '—')}
          </td>
          <td>
            ${available}
          </td>
          <td>
            ${status}
          </td>
          <td>
            <div class="admin-table-actions">
              <button
                class="btn btn-outline admin-product-edit"
                type="button"
                data-product-id="${escapeHtml(product.id)}"
              >
                Edit
              </button>
              <button
                class="btn btn-outline admin-product-toggle"
                type="button"
                data-product-id="${escapeHtml(product.id)}"
                data-current-active="${product.is_active !== false ? 'true' : 'false'}"
                title="${product.is_active !== false ? 'Deactivate product' : 'Activate product'}"
              >
                ${product.is_active !== false ? 'Deactivate' : 'Activate'}
              </button>
              <button
                class="btn btn-outline admin-product-delete"
                type="button"
                data-product-id="${escapeHtml(product.id)}"
                title="Permanently delete product"
              >
                Delete
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    return `
      <div class="admin-product-group ${isCollapsed ? 'is-collapsed' : ''}" data-group-id="${escapeHtml(group.id)}">
        <div class="admin-product-group-header">
          <h3>${escapeHtml(group.name)}</h3>
          <button type="button" class="btn btn-outline btn-sm toggle-group-btn" data-group-id="${escapeHtml(group.id)}">
            ${isCollapsed ? 'Show' : 'Hide'}
          </button>
        </div>
        <div class="admin-product-group-content" style="${isCollapsed ? 'display: none;' : ''}">
          <div class="admin-table-wrap">
            <table class="admin-orders-table admin-products-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Category</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${productsHtml}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// -------------------------------------------------------------
// -------------------------------------------------------------
// SUPABASE STORAGE PRODUCT IMAGE MANAGER
// -------------------------------------------------------------

const STORAGE_BUCKET = 'product-images';
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB limit
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

class ColorGalleryManager {
  constructor({
    colorName = null,
    colorHex = '#64748b',
    colorSlug = null,
    statusEl = null,
    onChange = null
  }) {
    this.id = Math.random().toString(36).substring(2, 9);
    this.colorName = colorName;
    this.colorHex = colorHex || '#64748b';
    this.colorSlug = colorSlug || (colorName ? colorName.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-') : 'general');
    this.statusEl = statusEl;
    this.onChange = onChange;
    this.images = []; // Array of { id, type: 'file' | 'url', file?, url?, previewUrl, storagePath? }
    this.cardEl = null;
    this.dropzoneEl = null;
    this.fileInputEl = null;
    this.previewGridEl = null;
    this.countBadgeEl = null;
    this.progressEl = null;
    this.progressBarEl = null;
    this.progressTextEl = null;
    this.manualTextareaEl = null;
  }

  renderCard() {
    if (!this.cardEl) {
      const card = document.createElement('div');
      card.className = 'admin-color-gallery-card';
      card.dataset.colorName = this.colorName || '__general__';

      const isGeneral = !this.colorName || this.colorName === '__general__';
      const displayName = isGeneral ? 'General Product Photos' : this.colorName;
      const swatchHtml = isGeneral
        ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:#64748b;flex-shrink:0;"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`
        : `<span class="admin-color-swatch" style="background-color: ${escapeHtml(this.colorHex)};"></span>`;

      card.innerHTML = `
        <div class="admin-color-gallery-head">
          <div class="admin-color-gallery-title">
            ${swatchHtml}
            <span>${escapeHtml(displayName)}</span>
          </div>
          <span class="admin-color-gallery-count">0 photos</span>
        </div>
        <div class="admin-color-gallery-body">
          <div class="admin-image-upload-area" role="button" tabindex="0" aria-label="Upload photos for ${escapeHtml(displayName)}">
            <input type="file" accept="image/jpeg,image/png,image/webp,image/jpg" multiple hidden>
            <div class="admin-upload-prompt">
              <svg class="admin-upload-icon" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
              </svg>
              <p><strong>Click to browse</strong> or drag &amp; drop photos</p>
              <span>JPG, PNG, WEBP (Max 5MB per photo)</span>
            </div>
          </div>
          <div class="admin-image-preview-grid"></div>
          <div class="admin-upload-progress" hidden>
            <div class="admin-progress-bar"></div>
            <span class="admin-progress-text">Uploading photos…</span>
          </div>
          <details class="admin-image-advanced" style="margin-top: 8px;">
            <summary style="font-size: 11px; cursor: pointer; color: #64748b;">Advanced: Direct image URLs</summary>
            <textarea rows="2" placeholder="https://... (one per line)" style="width: 100%; font-size: 11px; margin-top: 4px; padding: 4px 6px;"></textarea>
          </details>
        </div>
      `;

      this.cardEl = card;
      this.dropzoneEl = card.querySelector('.admin-image-upload-area');
      this.fileInputEl = card.querySelector('input[type="file"]');
      this.previewGridEl = card.querySelector('.admin-image-preview-grid');
      this.countBadgeEl = card.querySelector('.admin-color-gallery-count');
      this.progressEl = card.querySelector('.admin-upload-progress');
      this.progressBarEl = card.querySelector('.admin-progress-bar');
      this.progressTextEl = card.querySelector('.admin-progress-text');
      this.manualTextareaEl = card.querySelector('textarea');

      this.initEvents();
    }
    this.renderPreviews();
    return this.cardEl;
  }

  initEvents() {
    if (!this.dropzoneEl || !this.fileInputEl) return;

    this.dropzoneEl.addEventListener('click', () => this.fileInputEl.click());
    this.dropzoneEl.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.fileInputEl.click();
      }
    });

    this.fileInputEl.addEventListener('change', () => {
      if (this.fileInputEl.files?.length) {
        this.addFiles(this.fileInputEl.files);
        this.fileInputEl.value = '';
      }
    });

    ['dragenter', 'dragover'].forEach(eventName => {
      this.dropzoneEl.addEventListener(eventName, e => {
        e.preventDefault();
        e.stopPropagation();
        this.dropzoneEl.classList.add('is-dragover');
      });
    });

    ['dragleave', 'dragend', 'drop'].forEach(eventName => {
      this.dropzoneEl.addEventListener(eventName, e => {
        e.preventDefault();
        e.stopPropagation();
        this.dropzoneEl.classList.remove('is-dragover');
      });
    });

    this.dropzoneEl.addEventListener('drop', e => {
      if (e.dataTransfer?.files?.length) {
        this.addFiles(e.dataTransfer.files);
      }
    });

    if (this.previewGridEl) {
      this.previewGridEl.addEventListener('click', e => {
        const removeBtn = e.target.closest('.admin-preview-remove');
        if (removeBtn && removeBtn.dataset.index !== undefined) {
          this.removeImage(parseInt(removeBtn.dataset.index, 10));
          return;
        }
        const adjustBtn = e.target.closest('.admin-preview-adjust');
        if (adjustBtn && adjustBtn.dataset.index !== undefined) {
          const index = parseInt(adjustBtn.dataset.index, 10);
          this.openAdjustModal(index);
        }
      });
    }

    if (this.manualTextareaEl) {
      this.manualTextareaEl.addEventListener('blur', () => {
        this.syncFromManualTextarea();
      });
    }
  }

  openAdjustModal(index) {
    if (index < 0 || index >= this.images.length) return;
    const item = this.images[index];
    openImageAdjustModal({
      imageItem: item,
      colorName: this.colorName,
      onApply: (newFile, newPreviewUrl) => {
        if (item.previewUrl?.startsWith('blob:') && item.previewUrl !== newPreviewUrl) {
          URL.revokeObjectURL(item.previewUrl);
        }
        item.type = 'file';
        item.file = newFile;
        item.previewUrl = newPreviewUrl;
        item.url = undefined;
        item.storagePath = undefined;
        this.renderPreviews();
        this.syncToManualTextarea();
        if (this.onChange) this.onChange();
      }
    });
  }

  addFiles(fileList) {
    const errors = [];
    Array.from(fileList).forEach(file => {
      const isAllowedType = ALLOWED_IMAGE_TYPES.includes(file.type) ||
        /\.(jpg|jpeg|png|webp)$/i.test(file.name);

      if (!isAllowedType) {
        errors.push(`"${file.name}": Unsupported format. Allowed: JPG, PNG, WEBP.`);
        return;
      }

      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        errors.push(`"${file.name}": File size exceeds 5MB limit.`);
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      this.images.push({
        id: Math.random().toString(36).substring(2, 9),
        type: 'file',
        file,
        previewUrl
      });
    });

    if (errors.length && this.statusEl) {
      this.statusEl.textContent = errors.join(' ');
      this.statusEl.classList.add('is-error');
    } else if (this.statusEl && this.statusEl.classList.contains('is-error')) {
      this.statusEl.textContent = '';
      this.statusEl.classList.remove('is-error');
    }

    this.renderPreviews();
    this.syncToManualTextarea();
    if (this.onChange) this.onChange();
  }

  setImages(imagesList) {
    this.cleanupBlobUrls();
    this.images = [];
    let urls = [];
    if (Array.isArray(imagesList)) {
      urls = imagesList.filter(img => typeof img === 'string' && img.trim());
    } else if (typeof imagesList === 'string') {
      try {
        const parsed = JSON.parse(imagesList);
        if (Array.isArray(parsed)) urls = parsed.filter(img => typeof img === 'string' && img.trim());
        else if (imagesList.trim()) urls = [imagesList.trim()];
      } catch {
        if (imagesList.trim()) urls = [imagesList.trim()];
      }
    }

    urls.forEach(url => {
      this.images.push({
        id: Math.random().toString(36).substring(2, 9),
        type: 'url',
        url: url.trim(),
        previewUrl: url.trim()
      });
    });

    this.renderPreviews();
    this.syncToManualTextarea();
    if (this.onChange) this.onChange();
  }

  removeImage(index) {
    if (index >= 0 && index < this.images.length) {
      const removed = this.images.splice(index, 1)[0];
      if (removed.type === 'file' && removed.previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(removed.previewUrl);
      }
      this.renderPreviews();
      this.syncToManualTextarea();
      if (this.onChange) this.onChange();
    }
  }

  syncFromManualTextarea() {
    if (!this.manualTextareaEl) return;
    const manualUrls = this.manualTextareaEl.value
      .split(/[\n,]+/)
      .map(u => u.trim())
      .filter(u => u.length > 0);

    const fileItems = this.images.filter(img => img.type === 'file');
    const newUrlItems = manualUrls.map(url => ({
      id: Math.random().toString(36).substring(2, 9),
      type: 'url',
      url,
      previewUrl: url
    }));

    this.images = [...fileItems, ...newUrlItems];
    this.renderPreviews();
    if (this.onChange) this.onChange();
  }

  syncToManualTextarea() {
    if (!this.manualTextareaEl) return;
    const urls = this.images
      .filter(img => img.type === 'url')
      .map(img => img.url);
    this.manualTextareaEl.value = urls.join('\n');
  }

  renderPreviews() {
    if (this.countBadgeEl) {
      this.countBadgeEl.textContent = `${this.images.length} photo${this.images.length === 1 ? '' : 's'}`;
    }

    if (!this.previewGridEl) return;
    if (!this.images.length) {
      this.previewGridEl.innerHTML = '';
      return;
    }

    this.previewGridEl.innerHTML = this.images.map((img, idx) => `
      <div class="admin-preview-item" data-index="${idx}">
        <img src="${escapeHtml(img.previewUrl)}" alt="${escapeHtml(this.colorName || 'Product')} preview ${idx + 1}" loading="lazy" onerror="this.src='images/ca2e03bc34d1c75b624003e138376397.jpg'">
        ${idx === 0 ? '<span class="admin-preview-primary">Primary</span>' : ''}
        <button type="button" class="admin-preview-remove" data-index="${idx}" title="Remove photo" aria-label="Remove photo ${idx + 1}">&times;</button>
        <button type="button" class="admin-preview-adjust" data-index="${idx}" title="Adjust &amp; Crop photo" aria-label="Adjust photo ${idx + 1}">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          Adjust
        </button>
      </div>
    `).join('');
  }

  showProgress(text = 'Uploading photos…') {
    if (this.progressEl) this.progressEl.hidden = false;
    if (this.progressTextEl) this.progressTextEl.textContent = text;
  }

  hideProgress() {
    if (this.progressEl) this.progressEl.hidden = true;
  }

  async uploadPendingFiles(productSlug) {
    const newlyUploadedPaths = [];
    const pendingFiles = this.images.filter(img => img.type === 'file');

    if (pendingFiles.length > 0) {
      const colorLabel = this.colorName ? ` (${this.colorName})` : '';
      this.showProgress(`Uploading ${pendingFiles.length} photo(s)${colorLabel}…`);
    }

    for (let i = 0; i < this.images.length; i++) {
      const item = this.images[i];
      if (item.type === 'file' && item.file) {
        const file = item.file;
        const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const cleanExt = ['jpeg', 'png', 'webp', 'jpg'].includes(ext) ? ext : 'jpg';
        const randomPart = Math.random().toString(36).substring(2, 9);
        const fileName = `${Date.now()}-${randomPart}.${cleanExt}`;
        const folderPart = this.colorName ? `${this.colorSlug}` : 'general';
        const filePath = `products/${productSlug}/${folderPart}/${fileName}`;

        this.showProgress(`Uploading photo ${newlyUploadedPaths.length + 1} of ${pendingFiles.length}…`);

        const { data, error } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(filePath, file, {
            contentType: file.type || 'image/jpeg',
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          this.hideProgress();
          if (newlyUploadedPaths.length > 0) {
            await supabase.storage.from(STORAGE_BUCKET).remove(newlyUploadedPaths);
          }
          throw new Error(`Failed to upload photo for "${this.colorName || 'product'}": ${error.message}`);
        }

        newlyUploadedPaths.push(filePath);
        const { data: pubData } = supabase.storage
          .from(STORAGE_BUCKET)
          .getPublicUrl(filePath);

        const publicUrl = pubData.publicUrl;
        if (item.previewUrl?.startsWith('blob:')) {
          URL.revokeObjectURL(item.previewUrl);
        }

        this.images[i] = {
          id: item.id,
          type: 'url',
          url: publicUrl,
          previewUrl: publicUrl,
          storagePath: filePath
        };
      }
    }

    this.hideProgress();
    this.syncToManualTextarea();

    const finalUrls = this.images
      .map(img => img.url)
      .filter(u => typeof u === 'string' && u.trim().length > 0);

    return {
      finalUrls: finalUrls.length > 0 ? finalUrls : [],
      newlyUploadedPaths
    };
  }

  cleanupBlobUrls() {
    this.images.forEach(img => {
      if (img.type === 'file' && img.previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(img.previewUrl);
      }
    });
  }

  reset() {
    this.cleanupBlobUrls();
    this.images = [];
    if (this.fileInputEl) this.fileInputEl.value = '';
    if (this.manualTextareaEl) this.manualTextareaEl.value = '';
    this.hideProgress();
    this.renderPreviews();
  }
}

// -------------------------------------------------------------
// IMAGE ADJUSTMENT & CROP MODAL CONTROLLER
// -------------------------------------------------------------

const imageAdjustModal = document.getElementById('adminImageAdjustModal');
const imageAdjustCloseBtn = document.getElementById('imageAdjustCloseBtn');
const imageAdjustCancelBtn = document.getElementById('imageAdjustCancelBtn');
const imageAdjustApplyBtn = document.getElementById('imageAdjustApplyBtn');
const imageAdjustFrame = document.getElementById('imageAdjustFrame');
const imageAdjustCanvas = document.getElementById('imageAdjustCanvas');
const imageAdjustZoomSlider = document.getElementById('imageAdjustZoomSlider');
const imageAdjustZoomInBtn = document.getElementById('imageAdjustZoomInBtn');
const imageAdjustZoomOutBtn = document.getElementById('imageAdjustZoomOutBtn');
const imageAdjustZoomValue = document.getElementById('imageAdjustZoomValue');
const imageAdjustMoveUpBtn = document.getElementById('imageAdjustMoveUpBtn');
const imageAdjustMoveDownBtn = document.getElementById('imageAdjustMoveDownBtn');
const imageAdjustMoveLeftBtn = document.getElementById('imageAdjustMoveLeftBtn');
const imageAdjustMoveRightBtn = document.getElementById('imageAdjustMoveRightBtn');
const imageAdjustFitBtn = document.getElementById('imageAdjustFitBtn');
const imageAdjustResetBtn = document.getElementById('imageAdjustResetBtn');

let currentAdjustSession = null;

class ImageAdjustSession {
  constructor({ imageItem, colorName, aspectRatio = '1:1', modalTitle, onApply, enforceCoverBounds = false }) {
    this.imageItem = imageItem;
    this.colorName = colorName;
    this.aspectRatio = aspectRatio;
    this.modalTitle = modalTitle;
    this.onApply = onApply;
    this.enforceCoverBounds = enforceCoverBounds;

    this.canvas = imageAdjustCanvas;
    this.ctx = this.canvas?.getContext('2d');
    this.img = new Image();
    this.img.crossOrigin = 'anonymous';

    this.scale = 1;
    this.initialScale = 1;
    this.fitScale = 1;
    this.minScale = 0.1;
    this.maxScale = 4;
    this.offsetX = 0;
    this.offsetY = 0;

    this.isDragging = false;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.startOffsetX = 0;
    this.startOffsetY = 0;

    this.isLoaded = false;
    this.boundPointerMove = this.onPointerMove.bind(this);
    this.boundPointerUp = this.onPointerUp.bind(this);
    this.boundWheel = this.onWheel.bind(this);
    this.boundPointerDown = this.onPointerDown.bind(this);
  }

  async init() {
    if (!this.canvas || !this.ctx) return;

    // Update modal title
    const titleEl = document.getElementById('imageAdjustModalTitle');
    if (titleEl) {
      if (this.modalTitle) {
        titleEl.textContent = this.modalTitle;
      } else if (this.colorName) {
        titleEl.textContent = `Adjust & Crop Photo (${this.colorName})`;
      } else {
        titleEl.textContent = 'Adjust & Crop Photo';
      }
    }

    // Set Frame dataset & Canvas dimensions based on aspect ratio
    if (imageAdjustFrame) {
      imageAdjustFrame.dataset.aspect = this.aspectRatio;
    }

    if (this.aspectRatio === '3:4') {
      this.canvas.width = 600;
      this.canvas.height = 800;
      this.exportDimensions = { width: 1200, height: 1600 };
    } else if (this.aspectRatio === '8:3') {
      this.canvas.width = 960;
      this.canvas.height = 360;
      this.exportDimensions = { width: 1920, height: 720 };
    } else if (this.aspectRatio === '16:9') {
      this.canvas.width = 960;
      this.canvas.height = 540;
      this.exportDimensions = { width: 1920, height: 1080 };
    } else if (this.aspectRatio === '4:5') {
      this.canvas.width = 640;
      this.canvas.height = 800;
      this.exportDimensions = { width: 1080, height: 1350 };
    } else {
      // 1:1 default for products
      this.canvas.width = 600;
      this.canvas.height = 600;
      this.exportDimensions = { width: 1200, height: 1200 };
    }

    let hasInitialized = false;
    const onReady = () => {
      if (hasInitialized) return;
      hasInitialized = true;
      this.isLoaded = true;
      this.calculateInitialTransform();
      this.redraw();
      this.bindEvents();
    };

    this.img.onload = onReady;
    this.img.onerror = () => {
      console.error('[ImageAdjuster] Failed to load image source.');
    };

    const srcUrl = this.imageItem.previewUrl || this.imageItem.url;

    // If source is a remote URL without a local File, fetch blob to prevent CORS canvas tainting
    if (!this.imageItem.file && srcUrl && /^https?:\/\//i.test(srcUrl)) {
      try {
        const resp = await fetch(srcUrl, { mode: 'cors' });
        if (resp.ok) {
          const blob = await resp.blob();
          this.img.src = URL.createObjectURL(blob);
        } else {
          this.img.src = srcUrl;
        }
      } catch (e) {
        this.img.src = srcUrl;
      }
    } else {
      this.img.src = srcUrl;
    }

    if (this.img.complete && this.img.naturalWidth > 0) {
      onReady();
    }
  }

  calculateInitialTransform() {
    const nw = this.img.naturalWidth || this.canvas.width;
    const nh = this.img.naturalHeight || this.canvas.height;
    const cw = this.canvas.width;
    const ch = this.canvas.height;

    // Cover scale as default so image nicely fills the preview frame without distortion
    const coverScale = Math.max(cw / nw, ch / nh);
    this.fitScale = this.enforceCoverBounds ? coverScale : Math.min(cw / nw, ch / nh);
    this.initialScale = coverScale;
    this.scale = coverScale;

    this.minScale = this.enforceCoverBounds ? coverScale : Math.max(0.05, this.fitScale * 0.4);
    this.maxScale = Math.max(coverScale * 4, 4);

    this.offsetX = 0;
    this.offsetY = 0;

    this.updateZoomControls();
  }

  bindEvents() {
    if (!imageAdjustFrame) return;
    imageAdjustFrame.addEventListener('pointerdown', this.boundPointerDown);
    imageAdjustFrame.addEventListener('wheel', this.boundWheel, { passive: false });
  }

  unbindEvents() {
    if (imageAdjustFrame) {
      imageAdjustFrame.removeEventListener('pointerdown', this.boundPointerDown);
      imageAdjustFrame.removeEventListener('wheel', this.boundWheel);
      imageAdjustFrame.classList.remove('is-dragging');
    }
    window.removeEventListener('pointermove', this.boundPointerMove);
    window.removeEventListener('pointerup', this.boundPointerUp);
    window.removeEventListener('pointercancel', this.boundPointerUp);
  }

  onPointerDown(e) {
    if (!this.isLoaded) return;
    e.preventDefault();
    this.isDragging = true;
    this.dragStartX = e.clientX;
    this.dragStartY = e.clientY;
    this.startOffsetX = this.offsetX;
    this.startOffsetY = this.offsetY;

    if (imageAdjustFrame) imageAdjustFrame.classList.add('is-dragging');
    window.addEventListener('pointermove', this.boundPointerMove);
    window.addEventListener('pointerup', this.boundPointerUp);
    window.addEventListener('pointercancel', this.boundPointerUp);
  }

  onPointerMove(e) {
    if (!this.isDragging) return;
    const rect = imageAdjustFrame ? imageAdjustFrame.getBoundingClientRect() : { width: 320, height: 320 };
    const ratioX = this.canvas.width / (rect.width || 320);
    const ratioY = this.canvas.height / (rect.height || 320);

    const deltaX = (e.clientX - this.dragStartX) * ratioX;
    const deltaY = (e.clientY - this.dragStartY) * ratioY;

    this.offsetX = this.startOffsetX + deltaX;
    this.offsetY = this.startOffsetY + deltaY;
    this.redraw();
  }

  onPointerUp() {
    this.isDragging = false;
    if (imageAdjustFrame) imageAdjustFrame.classList.remove('is-dragging');
    window.removeEventListener('pointermove', this.boundPointerMove);
    window.removeEventListener('pointerup', this.boundPointerUp);
    window.removeEventListener('pointercancel', this.boundPointerUp);
  }

  onWheel(e) {
    if (!this.isLoaded) return;
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    this.setZoom(this.scale * zoomFactor);
  }

  setZoom(newScale) {
    this.scale = Math.min(this.maxScale, Math.max(this.minScale, newScale));
    this.updateZoomControls();
    this.redraw();
  }

  zoomBy(multiplier) {
    this.setZoom(this.scale * multiplier);
  }

  moveBy(dx, dy) {
    this.offsetX += dx;
    this.offsetY += dy;
    this.redraw();
  }

  fit() {
    this.scale = this.fitScale;
    this.offsetX = 0;
    this.offsetY = 0;
    this.updateZoomControls();
    this.redraw();
  }

  reset() {
    this.scale = this.initialScale;
    this.offsetX = 0;
    this.offsetY = 0;
    this.updateZoomControls();
    this.redraw();
  }

  updateZoomControls() {
    if (imageAdjustZoomSlider) {
      imageAdjustZoomSlider.min = String(this.minScale);
      imageAdjustZoomSlider.max = String(this.maxScale);
      imageAdjustZoomSlider.value = String(this.scale);
    }
    if (imageAdjustZoomValue) {
      const pct = Math.round((this.scale / this.initialScale) * 100);
      imageAdjustZoomValue.textContent = `${pct}%`;
    }
  }

  redraw() {
    if (!this.isLoaded || !this.ctx) return;
    const cw = this.canvas.width;
    const ch = this.canvas.height;
    const nw = this.img.naturalWidth;
    const nh = this.img.naturalHeight;

    if (this.enforceCoverBounds) {
      const maxOffsetX = Math.max(0, (nw * this.scale - cw) / 2);
      const maxOffsetY = Math.max(0, (nh * this.scale - ch) / 2);
      this.offsetX = Math.max(-maxOffsetX, Math.min(maxOffsetX, this.offsetX));
      this.offsetY = Math.max(-maxOffsetY, Math.min(maxOffsetY, this.offsetY));
    }

    this.ctx.clearRect(0, 0, cw, ch);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, cw, ch);

    this.ctx.save();
    this.ctx.translate(cw / 2 + this.offsetX, ch / 2 + this.offsetY);
    this.ctx.scale(this.scale, this.scale);
    this.ctx.drawImage(this.img, -nw / 2, -nh / 2);
    this.ctx.restore();
  }

  exportBlob() {
    return new Promise((resolve, reject) => {
      if (!this.isLoaded) return reject(new Error('Image not loaded.'));
      const exportCanvas = document.createElement('canvas');
      const expW = this.exportDimensions?.width || 1200;
      const expH = this.exportDimensions?.height || 1200;
      exportCanvas.width = expW;
      exportCanvas.height = expH;
      const expCtx = exportCanvas.getContext('2d');
      if (!expCtx) return reject(new Error('Failed to create export context.'));

      expCtx.fillStyle = '#ffffff';
      expCtx.fillRect(0, 0, expW, expH);

      const ratioX = expW / this.canvas.width;
      const ratioY = expH / this.canvas.height;
      expCtx.save();
      expCtx.translate(expW / 2 + this.offsetX * ratioX, expH / 2 + this.offsetY * ratioY);
      expCtx.scale(this.scale * ratioX, this.scale * ratioY);
      expCtx.drawImage(this.img, -this.img.naturalWidth / 2, -this.img.naturalHeight / 2);
      expCtx.restore();

      exportCanvas.toBlob(blob => {
        if (!blob) return reject(new Error('Canvas export to blob failed.'));
        resolve(blob);
      }, 'image/jpeg', 0.92);
    });
  }
}

function openImageAdjustModal({ imageItem, colorName, aspectRatio = '1:1', modalTitle, onApply, enforceCoverBounds = false }) {
  if (!imageItem || !imageAdjustModal) return;

  if (currentAdjustSession) {
    currentAdjustSession.unbindEvents();
    currentAdjustSession = null;
  }

  currentAdjustSession = new ImageAdjustSession({ imageItem, colorName, aspectRatio, modalTitle, onApply, enforceCoverBounds });
  imageAdjustModal.hidden = false;
  imageAdjustModal.setAttribute('aria-hidden', 'false');

  currentAdjustSession.init();
}

function closeImageAdjustModal() {
  if (currentAdjustSession) {
    currentAdjustSession.unbindEvents();
    currentAdjustSession = null;
  }
  if (imageAdjustModal) {
    imageAdjustModal.hidden = true;
    imageAdjustModal.setAttribute('aria-hidden', 'true');
  }
}

imageAdjustCloseBtn?.addEventListener('click', closeImageAdjustModal);
imageAdjustCancelBtn?.addEventListener('click', closeImageAdjustModal);
imageAdjustModal?.addEventListener('click', e => {
  if (e.target === imageAdjustModal) {
    closeImageAdjustModal();
  }
});

imageAdjustZoomSlider?.addEventListener('input', e => {
  if (currentAdjustSession) {
    currentAdjustSession.setZoom(Number(e.target.value));
  }
});

imageAdjustZoomInBtn?.addEventListener('click', () => {
  if (currentAdjustSession) currentAdjustSession.zoomBy(1.15);
});

imageAdjustZoomOutBtn?.addEventListener('click', () => {
  if (currentAdjustSession) currentAdjustSession.zoomBy(0.85);
});

imageAdjustMoveUpBtn?.addEventListener('click', () => {
  if (currentAdjustSession) currentAdjustSession.moveBy(0, -30);
});

imageAdjustMoveDownBtn?.addEventListener('click', () => {
  if (currentAdjustSession) currentAdjustSession.moveBy(0, 30);
});

imageAdjustMoveLeftBtn?.addEventListener('click', () => {
  if (currentAdjustSession) currentAdjustSession.moveBy(-30, 0);
});

imageAdjustMoveRightBtn?.addEventListener('click', () => {
  if (currentAdjustSession) currentAdjustSession.moveBy(30, 0);
});

imageAdjustFitBtn?.addEventListener('click', () => {
  if (currentAdjustSession) currentAdjustSession.fit();
});

imageAdjustResetBtn?.addEventListener('click', () => {
  if (currentAdjustSession) currentAdjustSession.reset();
});

imageAdjustApplyBtn?.addEventListener('click', async () => {
  if (!currentAdjustSession) return;
  try {
    if (imageAdjustApplyBtn) imageAdjustApplyBtn.disabled = true;
    const blob = await currentAdjustSession.exportBlob();
    const origFileName = currentAdjustSession.imageItem.file?.name || `adjusted-${Date.now()}.jpg`;
    const cleanFileName = origFileName.replace(/\.[^/.]+$/, '.jpg');
    const newFile = new File([blob], cleanFileName, { type: 'image/jpeg' });
    const newPreviewUrl = URL.createObjectURL(newFile);

    if (currentAdjustSession.onApply) {
      currentAdjustSession.onApply(newFile, newPreviewUrl);
    }
    closeImageAdjustModal();
  } catch (err) {
    console.error('[ImageAdjuster] Error applying adjustments:', err);
    alert('Unable to apply image adjustments. Please try again.');
  } finally {
    if (imageAdjustApplyBtn) imageAdjustApplyBtn.disabled = false;
  }
});

// -------------------------------------------------------------
// ATTRIBUTES & VARIANT MATRIX HELPER FUNCTIONS
// -------------------------------------------------------------

function getColorHex(colorName) {
  if (!colorName) return '#64748b';
  const match = storeColors.find(c => c.name.toLowerCase() === colorName.toLowerCase());
  return match?.hex_code || '#64748b';
}

function formatVariantTitle(color, size) {
  if (color && size) return `${color} / ${size}`;
  if (color) return color;
  if (size) return size;
  return 'Standard Fit';
}

function generateUniqueVariantSku(productSlug, color, size, usedSkusSet) {
  const cleanSlug = (productSlug || 'prod')
    .toLowerCase()
    .replace(/[^\w-]/g, '')
    .slice(0, 30);

  const parts = [cleanSlug];
  if (color) parts.push(color.toLowerCase().replace(/[^\w]/g, '').slice(0, 10));
  if (size) parts.push(size.toLowerCase().replace(/[^\w]/g, '').slice(0, 8));
  if (!color && !size) parts.push('std');

  const baseSku = parts.filter(Boolean).join('-');
  let candidate = baseSku;
  let counter = 1;

  while (usedSkusSet && usedSkusSet.has(candidate.toLowerCase())) {
    candidate = `${baseSku}-${counter}`;
    counter++;
  }
  return candidate;
}

function renderColorPills(containerEl, selectedSet, masterColors, legacyColors = [], onToggle = null) {
  if (!containerEl) return;
  const activeMaster = masterColors.filter(c => c.is_active !== false).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  const activeNames = new Set(activeMaster.map(c => c.name.toLowerCase()));

  const displayList = [...activeMaster];
  legacyColors.forEach(lc => {
    if (lc && !activeNames.has(lc.toLowerCase())) {
      displayList.push({
        id: 'legacy-' + lc,
        name: lc,
        hex_code: '#64748b',
        isLegacy: true
      });
    }
  });

  if (!displayList.length) {
    containerEl.innerHTML = '<span style="font-size:12px;color:#94a3b8;">No master colors configured. Use "+ Add Color" below.</span>';
    return;
  }

  containerEl.innerHTML = displayList.map(c => {
    const isSelected = selectedSet.has(c.name);
    const legacyLabel = c.isLegacy ? ' (Legacy)' : '';
    return `
      <button type="button" class="admin-attr-pill${isSelected ? ' is-selected' : ''}" data-attr-type="color" data-attr-name="${escapeHtml(c.name)}" aria-checked="${isSelected}" role="checkbox">
        <span class="admin-color-swatch" style="background-color: ${escapeHtml(c.hex_code || '#64748b')};"></span>
        <span>${escapeHtml(c.name)}${escapeHtml(legacyLabel)}</span>
        <span class="admin-attr-pill-check">${isSelected ? '✓' : '+'}</span>
      </button>
    `;
  }).join('');

  containerEl.querySelectorAll('.admin-attr-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.dataset.attrName;
      if (selectedSet.has(name)) {
        selectedSet.delete(name);
      } else {
        selectedSet.add(name);
      }
      const isSel = selectedSet.has(name);
      btn.classList.toggle('is-selected', isSel);
      btn.setAttribute('aria-checked', String(isSel));
      const checkEl = btn.querySelector('.admin-attr-pill-check');
      if (checkEl) checkEl.textContent = isSel ? '✓' : '+';
      if (onToggle) onToggle(name, isSel);
    });
  });
}

function renderSizePills(containerEl, selectedSet, masterSizes, legacySizes = [], onToggle = null) {
  if (!containerEl) return;

  const defaultStandard = ['S', 'M', 'L', 'XL', 'XXL'];
  const defaultWaist = ['26', '28', '30', '32', '34', '36'];

  const activeMaster = (masterSizes || [])
    .filter(s => s && s.is_active !== false)
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  const standardSizesMap = new Map();
  const waistSizesMap = new Map();
  const customSizesMap = new Map();

  defaultStandard.forEach((sz, idx) => {
    standardSizesMap.set(sz.toLowerCase(), { name: sz, code: sz, category_type: 'standard', sort_order: idx + 1 });
  });

  defaultWaist.forEach((sz, idx) => {
    waistSizesMap.set(sz.toLowerCase(), { name: sz, code: sz, category_type: 'waist', sort_order: idx + 10 });
  });

  activeMaster.forEach(s => {
    const sName = String(s.name || '').trim();
    const sLower = sName.toLowerCase();
    const isStd = s.category_type === 'standard' || defaultStandard.some(ds => ds.toLowerCase() === sLower);
    const isWst = s.category_type === 'waist' || defaultWaist.some(dw => dw.toLowerCase() === sLower) || /^\d+$/.test(sName);

    if (isStd) {
      standardSizesMap.set(sLower, { ...s, name: sName });
    } else if (isWst) {
      waistSizesMap.set(sLower, { ...s, name: sName });
    } else {
      customSizesMap.set(sLower, { ...s, name: sName });
    }
  });

  const userCatMap = containerEl._sizeCategories || new Map();
  const extraSizes = [...(legacySizes || []), ...(selectedSet ? Array.from(selectedSet) : [])];
  extraSizes.forEach(sz => {
    if (!sz) return;
    const sName = String(sz).trim();
    const sLower = sName.toLowerCase();
    if (!standardSizesMap.has(sLower) && !waistSizesMap.has(sLower) && !customSizesMap.has(sLower)) {
      const userCat = userCatMap.get(sLower);
      if (userCat === 'standard') {
        standardSizesMap.set(sLower, { name: sName, code: sName, category_type: 'standard', isCustom: true });
      } else if (userCat === 'waist' || /^\d+$/.test(sName)) {
        waistSizesMap.set(sLower, { name: sName, code: sName, category_type: 'waist', isCustom: true });
      } else {
        customSizesMap.set(sLower, { name: sName, code: sName, category_type: 'custom', isCustom: true });
      }
    }
  });

  const renderPill = (s) => {
    const isSelected = selectedSet && selectedSet.has(s.name);
    return `
      <button type="button" class="admin-attr-pill${isSelected ? ' is-selected' : ''}" data-attr-type="size" data-attr-name="${escapeHtml(s.name)}" aria-checked="${isSelected}" role="checkbox">
        <span>${escapeHtml(s.name)}</span>
        <span class="admin-attr-pill-check">${isSelected ? '✓' : '+'}</span>
      </button>
    `;
  };

  const standardList = Array.from(standardSizesMap.values()).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  const waistList = Array.from(waistSizesMap.values()).sort((a, b) => {
    const numA = Number(a.name);
    const numB = Number(b.name);
    if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
    return (a.sort_order || 0) - (b.sort_order || 0);
  });
  const customList = Array.from(customSizesMap.values());

  containerEl.innerHTML = `
    <div class="admin-size-categories-wrap">
      <div class="admin-size-group">
        <span class="admin-size-group-label">Standard:</span>
        <div class="admin-size-pills-row">
          ${standardList.map(renderPill).join('')}
        </div>
        <div class="admin-custom-attr-row admin-inline-size-add">
          <input type="text" class="admin-inline-size-input" data-size-category="standard" placeholder="e.g. XS, 3XL…" aria-label="Add custom Standard size">
          <button type="button" class="btn btn-outline admin-inline-size-btn" data-size-category="standard">+ Add Custom Size</button>
        </div>
      </div>
      <div class="admin-size-group">
        <span class="admin-size-group-label">Waist:</span>
        <div class="admin-size-pills-row">
          ${waistList.map(renderPill).join('')}
        </div>
        <div class="admin-custom-attr-row admin-inline-size-add">
          <input type="text" class="admin-inline-size-input" data-size-category="waist" placeholder="e.g. 38, 40…" aria-label="Add custom Waist size">
          <button type="button" class="btn btn-outline admin-inline-size-btn" data-size-category="waist">+ Add Custom Size</button>
        </div>
      </div>
      <div class="admin-size-group">
        <span class="admin-size-group-label">Custom / Other:</span>
        <div class="admin-size-pills-row">
          ${customList.map(renderPill).join('')}
        </div>
        <div class="admin-custom-attr-row admin-inline-size-add">
          <input type="text" class="admin-inline-size-input" data-size-category="custom" placeholder="e.g. Free Size…" aria-label="Add custom Other size">
          <button type="button" class="btn btn-outline admin-inline-size-btn" data-size-category="custom">+ Add Custom Size</button>
        </div>
      </div>
    </div>
  `;

  // Pill toggle click handlers
  containerEl.querySelectorAll('.admin-attr-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.dataset.attrName;
      if (selectedSet.has(name)) {
        selectedSet.delete(name);
      } else {
        selectedSet.add(name);
      }
      const isSel = selectedSet.has(name);
      btn.classList.toggle('is-selected', isSel);
      btn.setAttribute('aria-checked', String(isSel));
      const checkEl = btn.querySelector('.admin-attr-pill-check');
      if (checkEl) checkEl.textContent = isSel ? '✓' : '+';
      if (onToggle) onToggle(name, isSel);
    });
  });

  // Per-group "Add Custom Size" inline logic
  const handleInlineAdd = (inputEl) => {
    if (!inputEl) return;
    const category = inputEl.dataset.sizeCategory; // 'standard', 'waist', or 'custom'
    const rawVal = inputEl.value.trim();
    if (!rawVal) return;
    inputEl.value = '';
    selectedSet.add(rawVal);
    // Track the intended category for this size across re-renders
    if (!containerEl._sizeCategories) containerEl._sizeCategories = new Map();
    containerEl._sizeCategories.set(rawVal.toLowerCase(), category);
    if (onToggle) onToggle(rawVal, true);
    // Re-render so new size appears in the correct group
    renderSizePills(containerEl, selectedSet, masterSizes, legacySizes, onToggle);
  };

  containerEl.querySelectorAll('.admin-inline-size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.dataset.sizeCategory;
      const inputEl = containerEl.querySelector(`.admin-inline-size-input[data-size-category="${category}"]`);
      handleInlineAdd(inputEl);
    });
  });

  containerEl.querySelectorAll('.admin-inline-size-input').forEach(inputEl => {
    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleInlineAdd(inputEl);
      }
    });
  });
}

function syncColorGalleriesUI(containerEl, selectedColorsSet, galleriesMap, statusEl, onGalleryChange = null) {
  if (!containerEl) return;

  const selectedColors = Array.from(selectedColorsSet);

  if (selectedColors.length === 0) {
    let generalManager = galleriesMap.get('__general__');
    if (!generalManager) {
      generalManager = new ColorGalleryManager({
        colorName: null,
        colorHex: '#64748b',
        colorSlug: 'general',
        statusEl,
        onChange: onGalleryChange
      });
      galleriesMap.set('__general__', generalManager);
    }
    containerEl.innerHTML = '';
    containerEl.appendChild(generalManager.renderCard());
    return;
  }

  containerEl.innerHTML = '';
  selectedColors.forEach(colorName => {
    let manager = galleriesMap.get(colorName);
    if (!manager) {
      manager = new ColorGalleryManager({
        colorName,
        colorHex: getColorHex(colorName),
        statusEl,
        onChange: onGalleryChange
      });
      galleriesMap.set(colorName, manager);
    }
    containerEl.appendChild(manager.renderCard());
  });
}

function updateVariantSummary(summaryEl, selectedColorsSet, selectedSizesSet) {
  if (!summaryEl) return;
  const numColors = selectedColorsSet.size;
  const numSizes = selectedSizesSet.size;

  if (numColors === 0 && numSizes === 0) {
    summaryEl.textContent = '1 Standard Fit combination (Click "⚡ Generate Variants" to update).';
    return;
  }

  if (numColors > 0 && numSizes === 0) {
    summaryEl.textContent = `${numColors} Color variant${numColors === 1 ? '' : 's'} (Click "⚡ Generate Variants" to calculate).`;
    return;
  }

  if (numColors === 0 && numSizes > 0) {
    summaryEl.textContent = `${numSizes} Size variant${numSizes === 1 ? '' : 's'} (Click "⚡ Generate Variants" to calculate).`;
    return;
  }

  const total = numColors * numSizes;
  summaryEl.textContent = `${numColors} Color${numColors === 1 ? '' : 's'} × ${numSizes} Size${numSizes === 1 ? '' : 's'} = ${total} Variants (Click "⚡ Generate Variants" to calculate).`;
}

function generateVariantMatrix(selectedColorsSet, selectedSizesSet, defaultMrp = 0, defaultSalePrice = 0, productSlug, existingVariants = [], currentVariants = []) {
  const colors = Array.from(selectedColorsSet);
  const sizes = Array.from(selectedSizesSet);

  let combinations = [];
  if (colors.length && sizes.length) {
    colors.forEach(c => sizes.forEach(s => combinations.push({ color: c, size: s })));
  } else if (colors.length) {
    colors.forEach(c => combinations.push({ color: c, size: null }));
  } else if (sizes.length) {
    sizes.forEach(s => combinations.push({ color: null, size: s }));
  } else {
    combinations.push({ color: null, size: null });
  }

  const existingPool = [...existingVariants];
  const currentPool = [...currentVariants];
  const usedSkus = new Set(existingPool.map(v => v.sku?.toLowerCase()).filter(Boolean));

  const matchedExistingIds = new Set();
  const resultVariants = [];

  const defMrp = Number(defaultMrp) || Number(defaultSalePrice) || 0;
  const defSale = Number(defaultSalePrice) || Number(defaultMrp) || 0;

  combinations.forEach(comb => {
    const nColor = (comb.color || '').trim().toLowerCase();
    const nSize = (comb.size || '').trim().toLowerCase();

    // Look for match in existing DB pool first, then current pool
    const existingMatch = existingPool.find(v => {
      const vColor = (v.color || '').trim().toLowerCase();
      const vSize = (v.size || '').trim().toLowerCase();
      return vColor === nColor && vSize === nSize;
    });

    const currentMatch = currentPool.find(v => {
      const vColor = (v.color || '').trim().toLowerCase();
      const vSize = (v.size || '').trim().toLowerCase();
      return vColor === nColor && vSize === nSize;
    });

    const matched = existingMatch || currentMatch;

    if (matched) {
      if (matched.id) matchedExistingIds.add(matched.id);
      const vMrp = matched.mrp !== undefined ? Number(matched.mrp) : (matched.price !== undefined ? Number(matched.price) : defMrp);
      const vSale = matched.salePrice !== undefined ? Number(matched.salePrice) : (matched.price !== undefined ? Number(matched.price) : defSale);

      resultVariants.push({
        id: matched.id || null,
        sku: matched.sku || generateUniqueVariantSku(productSlug, comb.color, comb.size, usedSkus),
        title: matched.title || formatVariantTitle(comb.color, comb.size),
        color: comb.color,
        size: comb.size,
        pricingMode: matched.pricing_mode || matched.pricingMode || null,
        mrp: vMrp,
        salePrice: vSale,
        price: vSale,
        stock: matched.stock !== undefined ? Number(matched.stock) : 0,
        reserved: matched.reserved || 0,
        isActive: matched.isActive !== false,
        isNew: !matched.id,
        isExisting: Boolean(matched.id),
        isDeleted: false
      });
    } else {
      const newSku = generateUniqueVariantSku(productSlug, comb.color, comb.size, usedSkus);
      usedSkus.add(newSku.toLowerCase());
      resultVariants.push({
        id: null,
        sku: newSku,
        title: formatVariantTitle(comb.color, comb.size),
        color: comb.color,
        size: comb.size,
        pricingMode: null,
        mrp: defMrp,
        salePrice: defSale,
        price: defSale,
        stock: 0,
        reserved: 0,
        isActive: true,
        isNew: true,
        isExisting: false,
        isDeleted: false
      });
    }
  });

  // Preserve any existing DB variants that were not part of the newly generated combinations
  existingPool.forEach(ev => {
    if (ev.id && !matchedExistingIds.has(ev.id)) {
      const evMrp = ev.mrp !== undefined ? Number(ev.mrp) : Number(ev.price || 0);
      const evSale = ev.salePrice !== undefined ? Number(ev.salePrice) : Number(ev.price || 0);
      resultVariants.push({
        id: ev.id,
        sku: ev.sku,
        title: ev.title || formatVariantTitle(ev.color, ev.size),
        color: ev.color,
        size: ev.size,
        pricingMode: ev.pricing_mode || ev.pricingMode || null,
        mrp: evMrp,
        salePrice: evSale,
        price: evSale,
        stock: Number(ev.stock) || 0,
        reserved: Number(ev.reserved) || 0,
        isActive: ev.isActive !== false,
        isNew: false,
        isExisting: true,
        notInSelection: true,
        isDeleted: false
      });
    }
  });

  return resultVariants;
}

function renderVariantReviewTable(tbodyEl, variantsList, defaultMrp = 0, defaultSalePrice = 0) {
  if (!tbodyEl) return;
  const visibleVariants = variantsList.filter(v => !v.isDeleted);
  if (!visibleVariants.length) {
    tbodyEl.innerHTML = `<tr><td colspan="10" style="text-align:center;padding:16px;color:#64748b;">No variants generated yet. Select colors and sizes above, then click <strong>⚡ Generate Variants</strong>.</td></tr>`;
    return;
  }

  const fallbackMrp = Number(defaultMrp) || Number(defaultSalePrice) || 0;
  const fallbackSale = Number(defaultSalePrice) || Number(defaultMrp) || 0;

  tbodyEl.innerHTML = variantsList.map((v, index) => {
    if (v.isDeleted) return '';

    const colorBadge = v.color
      ? `<span class="admin-color-swatch-cell"><span class="admin-color-swatch" style="background-color:${escapeHtml(getColorHex(v.color))};width:16px;height:16px;"></span><strong>${escapeHtml(v.color)}</strong></span>`
      : '<span style="color:#94a3b8;font-style:italic;">None</span>';

    const sizeBadge = v.size
      ? `<span class="admin-attr-pill" style="padding:2px 8px;font-size:11px;pointer-events:none;">${escapeHtml(v.size)}</span>`
      : '<span style="color:#94a3b8;font-style:italic;">None</span>';

    const statusBadge = v.isExisting
      ? (v.notInSelection
        ? '<span class="admin-variant-status-badge" style="background:#fef3c7;color:#92400e;" title="Existing variant not in current selection (Preserved)">Preserved</span>'
        : '<span class="admin-variant-status-badge admin-variant-status-existing">Existing</span>')
      : '<span class="admin-variant-status-badge admin-variant-status-new">New</span>';

    const vMrp = Number(v.mrp ?? fallbackMrp);
    const vSale = Number(v.salePrice ?? v.price ?? fallbackSale);
    const discountBadgeHtml = renderDiscountBadge(vMrp, vSale, 'admin-var-discount-badge');

    return `
      <tr data-variant-index="${index}">
        <td>${colorBadge}</td>
        <td>${sizeBadge}</td>
        <td>
          <input type="text" class="var-input-title" value="${escapeHtml(v.title || '')}" placeholder="Variant title" style="padding:4px 6px;font-size:12px;" required>
          ${statusBadge}
        </td>
        <td>
          <input type="number" class="var-input-mrp" value="${vMrp}" min="0" step="1" style="padding:4px 6px;font-size:12px;width:100%;" required>
        </td>
        <td>
          <input type="number" class="var-input-sale-price" value="${vSale}" min="0" step="1" style="padding:4px 6px;font-size:12px;width:100%;" required>
        </td>
        <td class="admin-var-discount-cell var-discount-container">
          ${discountBadgeHtml}
        </td>
        <td>
          <input type="number" class="var-input-stock" value="${Number(v.stock ?? 0)}" min="0" step="1" style="padding:4px 6px;font-size:12px;width:100%;" required>
        </td>
        <td>
          <input type="text" class="var-input-sku" value="${escapeHtml(v.sku || '')}" placeholder="SKU" style="padding:4px 6px;font-size:11px;width:100%;" required>
        </td>
        <td style="text-align:center;">
          <input type="checkbox" class="var-input-active" ${v.isActive !== false ? 'checked' : ''}>
        </td>
        <td style="text-align:center;">
          <button type="button" class="btn btn-outline var-remove-btn" data-variant-index="${index}" style="padding:2px 6px;font-size:12px;color:#ef4444;border-color:#fca5a5;" title="Remove this variant">&times;</button>
        </td>
      </tr>
    `;
  }).join('');
}

function syncVariantsFromTable(tbodyEl, variantsList) {
  if (!tbodyEl) return;
  const rows = tbodyEl.querySelectorAll('tr[data-variant-index]');
  rows.forEach(row => {
    const index = parseInt(row.dataset.variantIndex, 10);
    if (!Number.isNaN(index) && variantsList[index]) {
      const titleInput = row.querySelector('.var-input-title');
      const mrpInput = row.querySelector('.var-input-mrp');
      const salePriceInput = row.querySelector('.var-input-sale-price');
      const stockInput = row.querySelector('.var-input-stock');
      const skuInput = row.querySelector('.var-input-sku');
      const activeInput = row.querySelector('.var-input-active');

      if (titleInput) variantsList[index].title = titleInput.value.trim();
      if (mrpInput) variantsList[index].mrp = Math.max(0, Number(mrpInput.value) || 0);
      if (salePriceInput) {
        const sp = Math.max(0, Number(salePriceInput.value) || 0);
        variantsList[index].salePrice = sp;
        variantsList[index].price = sp;
      }
      if (stockInput) variantsList[index].stock = Math.max(0, Number.parseInt(stockInput.value, 10) || 0);
      if (skuInput) variantsList[index].sku = skuInput.value.trim();
      if (activeInput) variantsList[index].isActive = Boolean(activeInput.checked);
    }
  });
}

function populateBulkPriceTargetDropdown(selectEl, variantsList = [], selectedColorsSet = new Set()) {
  if (!selectEl) return;
  const currentVal = selectEl.value;
  const colors = new Set();

  if (Array.isArray(variantsList)) {
    variantsList.forEach(v => {
      if (!v.isDeleted && v.color && String(v.color).trim()) {
        colors.add(String(v.color).trim());
      }
    });
  }

  if (selectedColorsSet && selectedColorsSet.size) {
    selectedColorsSet.forEach(c => {
      if (c && String(c).trim()) colors.add(String(c).trim());
    });
  }

  const sortedColors = Array.from(colors).sort((a, b) => a.localeCompare(b));

  selectEl.innerHTML = `
    <option value="__ALL__">All Colors</option>
    ${sortedColors.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('')}
  `;

  if (currentVal && (currentVal === '__ALL__' || colors.has(currentVal))) {
    selectEl.value = currentVal;
  } else {
    selectEl.value = '__ALL__';
  }
}

function applyBulkPricingToTable({ tbodyEl, variantsList, targetColor, mrp, salePrice, statusEl }) {
  if (!tbodyEl || !Array.isArray(variantsList)) return;

  const numMrp = Number(mrp);
  const numSale = Number(salePrice);

  if (!Number.isFinite(numMrp) || numMrp < 0) {
    if (statusEl) {
      statusEl.textContent = 'Please enter a valid non-negative MRP in Rupees (₹0 or greater).';
      statusEl.classList.add('is-error');
    }
    return;
  }

  if (!Number.isFinite(numSale) || numSale < 0) {
    if (statusEl) {
      statusEl.textContent = 'Please enter a valid non-negative Sale Price in Rupees (₹0 or greater).';
      statusEl.classList.add('is-error');
    }
    return;
  }

  if (numSale > numMrp) {
    if (statusEl) {
      statusEl.textContent = `Sale Price (₹${numSale}) cannot exceed MRP (₹${numMrp}).`;
      statusEl.classList.add('is-error');
    }
    return;
  }

  if (statusEl) {
    statusEl.textContent = '';
    statusEl.classList.remove('is-error');
  }

  const rows = tbodyEl.querySelectorAll('tr[data-variant-index]');
  let affectedCount = 0;

  rows.forEach(row => {
    const index = parseInt(row.dataset.variantIndex, 10);
    if (!Number.isNaN(index) && variantsList[index] && !variantsList[index].isDeleted) {
      const vColor = (variantsList[index].color || '').trim().toLowerCase();
      const isTarget = targetColor === '__ALL__' || (targetColor && vColor === targetColor.trim().toLowerCase());

      if (isTarget) {
        const mrpInput = row.querySelector('.var-input-mrp');
        const salePriceInput = row.querySelector('.var-input-sale-price');
        const discountCell = row.querySelector('.var-discount-container');

        if (mrpInput) mrpInput.value = numMrp;
        if (salePriceInput) salePriceInput.value = numSale;
        if (discountCell) {
          discountCell.innerHTML = renderDiscountBadge(numMrp, numSale, 'admin-var-discount-badge');
        }

        affectedCount++;
      }
    }
  });

  // Call the existing syncVariantsFromTable() to update in-memory variant objects
  syncVariantsFromTable(tbodyEl, variantsList);

  if (statusEl && affectedCount > 0) {
    const targetLabel = targetColor === '__ALL__' ? 'all variants' : `"${targetColor}" variants`;
    statusEl.textContent = `Applied ₹${numMrp} MRP / ₹${numSale} Sale Price to ${affectedCount} ${targetLabel}.`;
    statusEl.classList.remove('is-error');
  }
}

// -------------------------------------------------------------
// PRODUCT EDIT MODAL & MANAGEMENT FUNCTIONS
// -------------------------------------------------------------

const editProductModal = document.getElementById('adminEditProductModal');
const editProductForm = document.getElementById('adminEditProductForm');
const editCloseBtn = document.getElementById('adminEditCloseBtn');
const editCancelBtn = document.getElementById('adminEditCancelBtn');
const editSaveBtn = document.getElementById('adminEditSaveBtn');
const editStatus = document.getElementById('adminEditStatus');

const editProductId = document.getElementById('editProductId');
const editProductName = document.getElementById('editProductName');
const editProductFamily = document.getElementById('editProductFamily');
const editNewFamilyGroup = document.getElementById('editNewFamilyGroup');
const editNewFamilyName = document.getElementById('editNewFamilyName');
const editNewFamilyDesc = document.getElementById('editNewFamilyDesc');
const editProductModeSingle = document.getElementById('editProductModeSingle');
const editProductModeVariety = document.getElementById('editProductModeVariety');
const editVarietyNameGroup = document.getElementById('editVarietyNameGroup');
const editProductVarietyName = document.getElementById('editProductVarietyName');

const editProductPricingMode = document.getElementById('editProductPricingMode');
const editProductPricingModeHint = document.getElementById('editProductPricingModeHint');
const editProductMrp = document.getElementById('editProductMrp');
const editProductSalePrice = document.getElementById('editProductSalePrice');
const editProductDiscountBadge = document.getElementById('editProductDiscountBadge');
const editProductPrice = editProductSalePrice || document.getElementById('editProductPrice');
const editProductCategory = document.getElementById('editProductCategory');
const editProductDescription = document.getElementById('editProductDescription');
const editProductAlt = document.getElementById('editProductAlt');
const editProductIsActive = document.getElementById('editProductIsActive');
const editProductSortOrder = document.getElementById('editProductSortOrder');

const editProductColorsList = document.getElementById('editProductColorsList');
const editCustomColorInput = document.getElementById('editCustomColorInput');
const editCustomColorBtn = document.getElementById('editCustomColorBtn');
const editColorGalleriesContainer = document.getElementById('editColorGalleriesContainer');

const editProductSizesList = document.getElementById('editProductSizesList');
const editCustomSizeInput = document.getElementById('editCustomSizeInput');
const editCustomSizeBtn = document.getElementById('editCustomSizeBtn');

const editGenerateVariantsBtn = document.getElementById('editGenerateVariantsBtn');
const editVariantsSummaryText = document.getElementById('editVariantsSummaryText');
const editDefaultVariantNotice = document.getElementById('editDefaultVariantNotice');
const editVariantsList = document.getElementById('editVariantsList');

const editBulkPriceTarget = document.getElementById('editBulkPriceTarget');
const editBulkMrp = document.getElementById('editBulkMrp');
const editBulkSalePrice = document.getElementById('editBulkSalePrice');
const editBulkDiscountBadge = document.getElementById('editBulkDiscountBadge');
const editApplyBulkPriceBtn = document.getElementById('editApplyBulkPriceBtn');

let editModalSelectedColors = new Set();
let editModalColorGalleries = new Map(); // colorName -> ColorGalleryManager
let editModalSelectedSizes = new Set();
let editModalVariants = []; // array of variant drafts
let editModalExistingVariants = []; // original variants from DB
let editModalLegacyColors = [];
let editModalLegacySizes = [];

// =============================================================
// PRODUCT FAMILIES MANAGEMENT LOGIC
// =============================================================

function setFamiliesStatus(message = '', isError = false) {
  if (!familiesStatus) return;
  familiesStatus.textContent = message;
  familiesStatus.classList.toggle('is-error', isError);
}

function filteredFamilies() {
  const term = (familiesSearch?.value || '').trim().toLowerCase();
  if (!term) return [...productFamilies];
  return productFamilies.filter(f =>
    (f.name && f.name.toLowerCase().includes(term)) ||
    (f.slug && f.slug.toLowerCase().includes(term)) ||
    (f.category_name && f.category_name.toLowerCase().includes(term)) ||
    (f.description && f.description.toLowerCase().includes(term))
  );
}

function renderFamilies() {
  const visible = filteredFamilies();
  if (familiesEmpty) familiesEmpty.hidden = visible.length > 0;
  if (!familiesList) return;

  if (!visible.length) {
    familiesList.innerHTML = '';
    return;
  }

  familiesList.innerHTML = visible.map(fam => {
    const famProds = (products || []).filter(p => p.family_id === fam.id);
    const prodCount = famProds.length;
    const countBadge = prodCount > 0
      ? `<span class="admin-badge admin-badge-order">${prodCount} Design${prodCount === 1 ? '' : 's'}</span>`
      : '<span class="admin-badge" style="background:#f1f5f9;color:#64748b;">0 Designs</span>';

    const status = fam.is_active !== false
      ? '<span class="admin-badge admin-badge-payment-paid">Active</span>'
      : '<span class="admin-badge admin-badge-payment-failed">Inactive</span>';

    const dpSrc = fam.display_image || (famProds[0]?.images?.[0]) || 'images/ca2e03bc34d1c75b624003e138376397.jpg';
    const desc = fam.description ? escapeHtml(fam.description) : '<span style="color:#94a3b8;font-style:italic;">No description set</span>';
    const toggleLabel = fam.is_active !== false ? 'Deactivate' : 'Activate';
    const toggleClass = fam.is_active !== false ? 'btn-outline' : 'btn-primary';

    return `
      <tr>
        <td>
          <div class="admin-family-dp-table-thumb" style="width:48px;height:60px;border-radius:6px;overflow:hidden;background:#f1f5f9;border:1px solid #e2e8f0;">
            <img src="${escapeHtml(dpSrc)}" alt="${escapeHtml(fam.name)}" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block;">
          </div>
        </td>
        <td>
          <div class="admin-product-cell">
            <strong>${escapeHtml(fam.name || 'Untitled Variety')}</strong>
            <code>${escapeHtml(fam.slug || '—')}</code>
          </div>
        </td>
        <td>
          <span class="admin-badge" style="background:#eff6ff;color:#1d4ed8;font-weight:600;">${escapeHtml(fam.category_name || '—')}</span>
        </td>
        <td>
          <div class="admin-family-desc-cell" style="max-width:280px;font-size:12.5px;line-height:1.4;color:#475569;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">
            ${desc}
          </div>
        </td>
        <td>
          ${countBadge}
        </td>
        <td>
          ${status}
        </td>
        <td>
          <div class="admin-table-actions">
            <button
              class="btn btn-outline admin-family-edit"
              type="button"
              data-family-id="${escapeHtml(fam.id)}"
            >
              Edit
            </button>
            <button
              class="btn ${toggleClass} admin-family-toggle"
              type="button"
              data-family-id="${escapeHtml(fam.id)}"
              data-current-active="${fam.is_active !== false}"
            >
              ${toggleLabel}
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

async function loadProductFamilies(announce = false) {
  if (!supabase) return [];
  if (announce) setFamiliesStatus('Loading product varieties…');
  try {
    let { data, error } = await supabase
      .from('product_families')
      .select('id, name, slug, category_id, category_name, category_slug, description, display_image, is_active, sort_order')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (error && (error.code === '42703' || error.message?.includes('display_image'))) {
      const fallback = await supabase
        .from('product_families')
        .select('id, name, slug, category_id, category_name, category_slug, description, is_active, sort_order')
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true });
      data = fallback.data;
      error = fallback.error;
    }

    if (!error && Array.isArray(data)) {
      productFamilies = data;
    }
    if (announce) setFamiliesStatus();
  } catch (err) {
    console.warn('Unable to load product families:', err);
    if (announce) setFamiliesStatus('Unable to load product varieties.', true);
  }
  renderFamilies();
  return productFamilies;
}

async function uploadFamilyImageFile(file) {
  if (!file || !supabase) {
    console.error('[FamilyDP] uploadFamilyImageFile: missing file or supabase', { file, supabase: !!supabase });
    return null;
  }
  const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filePath = `families/${Date.now()}-${cleanName}`;
  const { data: uploadData, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, file, {
      contentType: file.type || 'image/jpeg',
      upsert: true
    });
  if (error) {
    console.error('[FamilyDP] Storage upload FAILED:', error);
    throw error;
  }
  const { data: { publicUrl } } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(filePath);
  return publicUrl;
}

function openAddFamilyModal() {
  if (!supabase) return;
  addFamilyForm?.reset();
  if (addFamilyStatus) {
    addFamilyStatus.textContent = '';
    addFamilyStatus.classList.remove('is-error');
  }

  // Populate category options in Add Family modal
  if (addFamilyCategory) {
    addFamilyCategory.innerHTML = '<option value="">Select Category…</option>';
    categories.filter(c => c.is_active !== false).forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat.id;
      opt.textContent = cat.name;
      opt.dataset.slug = cat.slug;
      opt.dataset.name = cat.name;
      addFamilyCategory.appendChild(opt);
    });
  }

  const maxOrder = productFamilies.reduce((max, f) => Math.max(max, Number(f.sort_order || 0)), 0);
  if (addFamilySortOrder) addFamilySortOrder.value = maxOrder + 1;
  if (addFamilyIsActive) addFamilyIsActive.checked = true;

  addFamilyDpState = {
    file: null,
    originalFile: null,
    url: '',
    previewUrl: 'images/ca2e03bc34d1c75b624003e138376397.jpg',
    hasAdjustment: false
  };

  if (addFamilyDpPreview) addFamilyDpPreview.src = addFamilyDpState.previewUrl;
  if (addFamilyDpFile) addFamilyDpFile.value = '';
  if (addFamilyDpUrl) addFamilyDpUrl.value = '';

  if (addFamilyModal) {
    addFamilyModal.hidden = false;
    addFamilyModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    addFamilyName?.focus();
  }
}

function closeAddFamilyModal() {
  if (addFamilyModal) {
    addFamilyModal.hidden = true;
    addFamilyModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
}

function openEditFamilyModal(familyId) {
  if (!supabase || !familyId) return;
  const fam = productFamilies.find(f => f.id === familyId);
  if (!fam) return;

  if (editFamilyStatus) {
    editFamilyStatus.textContent = '';
    editFamilyStatus.classList.remove('is-error');
  }

  if (editFamilyId) editFamilyId.value = fam.id;
  if (editFamilyName) editFamilyName.value = fam.name || '';
  if (editFamilySortOrder) editFamilySortOrder.value = Number(fam.sort_order || 0);
  if (editFamilyDescription) editFamilyDescription.value = fam.description || '';
  if (editFamilyIsActive) editFamilyIsActive.checked = fam.is_active !== false;

  // Populate Categories
  if (editFamilyCategory) {
    editFamilyCategory.innerHTML = '<option value="">Select Category…</option>';
    categories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat.id;
      opt.textContent = cat.name;
      opt.dataset.slug = cat.slug;
      opt.dataset.name = cat.name;
      editFamilyCategory.appendChild(opt);
    });
    if (fam.category_id) {
      editFamilyCategory.value = fam.category_id;
    }
  }

  // Populate DP
  const famProds = (products || []).filter(p => p.family_id === fam.id);
  const dpSrc = fam.display_image || (famProds[0]?.images?.[0]) || 'images/ca2e03bc34d1c75b624003e138376397.jpg';

  editFamilyDpState = {
    file: null,
    originalFile: null,
    url: fam.display_image || '',
    previewUrl: dpSrc,
    hasAdjustment: false
  };

  if (editFamilyDpPreview) editFamilyDpPreview.src = dpSrc;
  if (editFamilyDpUrl) editFamilyDpUrl.value = fam.display_image || '';
  if (editFamilyDpFile) editFamilyDpFile.value = '';

  // Render assigned products in this family
  if (editFamilyProductsList) {
    if (!famProds.length) {
      editFamilyProductsList.innerHTML = '<p style="font-size:12.5px;color:#64748b;margin:0;font-style:italic;">No products currently assigned to this variety.</p>';
    } else {
      editFamilyProductsList.innerHTML = famProds.map(p => `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:6px 10px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;font-size:13px;">
          <div style="display:flex;align-items:center;gap:8px;">
            <img src="${escapeHtml((p.images && p.images[0]) || 'images/ca2e03bc34d1c75b624003e138376397.jpg')}" alt="" style="width:28px;height:36px;object-fit:cover;border-radius:4px;">
            <div>
              <strong>${escapeHtml(p.name)}</strong>
              ${p.variety_name ? `<span style="font-size:11px;color:#c2410c;margin-left:4px;">(${escapeHtml(p.variety_name)})</span>` : ''}
            </div>
          </div>
          <button type="button" class="btn btn-outline edit-family-product-btn" style="font-size:11px;padding:3px 8px;" data-product-id="${escapeHtml(p.id)}">Edit Product</button>
        </div>
      `).join('');
    }
  }

  if (editFamilyModal) {
    editFamilyModal.hidden = false;
    editFamilyModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    editFamilyName?.focus();
  }
}

function closeEditFamilyModal() {
  if (editFamilyModal) {
    editFamilyModal.hidden = true;
    editFamilyModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
}

async function toggleFamilyActive(familyId, currentActive) {
  if (!supabase || !familyId) return;
  try {
    const nextActive = !currentActive;
    const { error } = await supabase
      .from('product_families')
      .update({ is_active: nextActive, updated_at: new Date().toISOString() })
      .eq('id', familyId);
    if (error) throw error;
    await loadProductFamilies(false);
  } catch (err) {
    console.error('Error toggling family active status:', err);
    alert('Unable to change variety status: ' + err.message);
  }
}

function populateFamilyDropdown(selectEl, selectedFamilyId = null, categoryName = null) {
  if (!selectEl) return;
  const currentVal = selectedFamilyId || selectEl.value;
  selectEl.innerHTML = '';

  const createOpt = document.createElement('option');
  createOpt.value = '__create_new__';
  createOpt.textContent = '+ Create New Variety...';
  selectEl.appendChild(createOpt);

  const activeFamilies = productFamilies.filter(f => f.is_active !== false);

  activeFamilies.forEach(f => {
    const opt = document.createElement('option');
    opt.value = f.id;
    opt.textContent = f.name + (f.category_name ? ` (${f.category_name})` : '');
    opt.dataset.categoryName = f.category_name || '';
    opt.dataset.categoryId = f.category_id || '';
    opt.dataset.slug = f.slug || '';
    selectEl.appendChild(opt);
  });

  if (currentVal && Array.from(selectEl.options).some(o => o.value === currentVal)) {
    selectEl.value = currentVal;
  } else if (selectedFamilyId) {
    selectEl.value = selectedFamilyId;
  }
}

function closeEditProductModal() {
  if (editProductModal) {
    editProductModal.hidden = true;
    editProductModal.setAttribute('aria-hidden', 'true');
  }
  document.body.style.overflow = '';
  editProductForm?.reset();
  if (editProductDiscountBadge) {
    editProductDiscountBadge.innerHTML = renderDiscountBadge(0, 0);
  }
  addModalColorGalleries.forEach(mgr => mgr.reset());
  editModalColorGalleries.forEach(mgr => mgr.reset());
  editModalColorGalleries.clear();
  editModalSelectedColors.clear();
  editModalSelectedSizes.clear();
  editModalVariants = [];
  editModalExistingVariants = [];
  editModalLegacyColors = [];
  editModalLegacySizes = [];
  if (editVariantsList) editVariantsList.innerHTML = '';
  if (editStatus) {
    editStatus.textContent = '';
    editStatus.classList.remove('is-error');
  }
}

async function openEditProduct(productId) {
  if (!productId || !supabase) return;

  if (editStatus) {
    editStatus.textContent = 'Loading product details…';
    editStatus.classList.remove('is-error');
  }
  if (editSaveBtn) editSaveBtn.disabled = true;

  if (editProductModal) {
    editProductModal.hidden = false;
    editProductModal.setAttribute('aria-hidden', 'false');
  }
  document.body.style.overflow = 'hidden';

  await loadProductFamilies();

  // Fetch product from Supabase including product_variants, family and variety fields
  let { data: product, error } = await supabase
    .from('products')
    .select('id, name, price_paise, mrp_paise, sale_price_paise, pricing_mode, currency, category, category_id, category_slug, description, images, alt_text, is_active, stock_quantity, reserved_quantity, family_id, family_name, variety_name, product_mode, sort_order, product_variants(id, sku, title, color, size, price_paise, mrp_paise, sale_price_paise, pricing_mode, stock_quantity, reserved_quantity, images, is_active, sort_order)')
    .eq('id', productId)
    .single();

  if (error && (error.code === '42703' || error.message?.includes('sort_order'))) {
    // Retry without sort_order on parent product
    const fallbackWithVariants = await supabase
      .from('products')
      .select('id, name, price_paise, mrp_paise, sale_price_paise, pricing_mode, currency, category, category_id, category_slug, description, images, alt_text, is_active, stock_quantity, reserved_quantity, family_id, family_name, variety_name, product_mode, product_variants(id, sku, title, color, size, price_paise, mrp_paise, sale_price_paise, pricing_mode, stock_quantity, reserved_quantity, images, is_active, sort_order)')
      .eq('id', productId)
      .single();
    product = fallbackWithVariants.data;
    error = fallbackWithVariants.error;
  }

  if (error && error.code === 'PGRST200') {
    const fallback = await supabase
      .from('products')
      .select('id, name, price_paise, mrp_paise, sale_price_paise, currency, category, category_id, category_slug, description, images, alt_text, is_active, stock_quantity, reserved_quantity, family_id, family_name, variety_name, product_mode')
      .eq('id', productId)
      .single();
    product = fallback.data;
    error = fallback.error;
  }

  if (error || !product) {
    if (editStatus) {
      editStatus.textContent = 'Unable to load product from database. Please try again.';
      editStatus.classList.add('is-error');
    }
    return;
  }

  if (editStatus) {
    editStatus.textContent = '';
    editStatus.classList.remove('is-error');
  }
  if (editSaveBtn) editSaveBtn.disabled = false;

  // Populate basic inputs
  if (editProductId) editProductId.value = product.id || '';
  if (editProductName) editProductName.value = product.name || '';

  // Populate Family & Mode
  populateFamilyDropdown(editProductFamily, product.family_id, product.category);
  if (editNewFamilyGroup) editNewFamilyGroup.hidden = editProductFamily?.value !== '__create_new__';
  if (editNewFamilyName) editNewFamilyName.value = '';

  const isVariety = product.product_mode === 'variety' || Boolean(product.variety_name);
  if (editProductModeVariety) editProductModeVariety.checked = isVariety;
  if (editProductModeSingle) editProductModeSingle.checked = !isVariety;
  if (editVarietyNameGroup) editVarietyNameGroup.hidden = !isVariety;
  if (editProductVarietyName) editProductVarietyName.value = product.variety_name || '';

  if (editProductPricingMode) editProductPricingMode.value = product.pricing_mode || 'custom';
  const salePricePaise = product.sale_price_paise ?? product.price_paise ?? 0;
  const mrpPaise = product.mrp_paise ?? salePricePaise;
  const productMrp = Math.round(Number(mrpPaise) / 100);
  const productSalePrice = Math.round(Number(salePricePaise) / 100);
  if (editProductMrp) editProductMrp.value = productMrp;
  if (editProductSalePrice) editProductSalePrice.value = productSalePrice;
  if (editProductDiscountBadge) {
    editProductDiscountBadge.innerHTML = renderDiscountBadge(productMrp, productSalePrice);
  }

  if (editProductCategory) {
    populateCategoryDropdowns();
    const existingCat = product.category || 'T-Shirts';
    const hasOption = Array.from(editProductCategory.options).some(opt => opt.value.toLowerCase() === existingCat.toLowerCase());
    if (!hasOption && existingCat.trim()) {
      const newOpt = document.createElement('option');
      newOpt.value = existingCat;
      newOpt.textContent = existingCat + ' (Custom/Inactive)';
      if (product.category_id) newOpt.dataset.catId = product.category_id;
      if (product.category_slug) newOpt.dataset.slug = product.category_slug;
      editProductCategory.appendChild(newOpt);
    }
    editProductCategory.value = existingCat;
  }

  updateProductPricingModeUI(editProductPricingMode, editProductMrp, editProductSalePrice, editProductDiscountBadge, editProductCategory, editProductPricingModeHint);

  if (editProductDescription) editProductDescription.value = product.description || '';
  if (editProductAlt) editProductAlt.value = product.alt_text || '';
  if (editProductIsActive) editProductIsActive.checked = Boolean(product.is_active !== false);
  if (editProductSortOrder) editProductSortOrder.value = product.sort_order ?? 0;

  // Process existing variants
  const rawVariants = Array.isArray(product.product_variants) ? product.product_variants : [];
  editModalExistingVariants = rawVariants
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    .map(v => {
      const vSalePricePaise = v.sale_price_paise ?? v.price_paise ?? salePricePaise;
      const vMrpPaise = v.mrp_paise ?? vSalePricePaise;
      const vMrp = Math.round(Number(vMrpPaise) / 100);
      const vSalePrice = Math.round(Number(vSalePricePaise) / 100);

      return {
        id: v.id,
        sku: v.sku || '',
        title: v.title || formatVariantTitle(v.color, v.size),
        color: v.color ? String(v.color).trim() : null,
        size: v.size ? String(v.size).trim() : null,
        mrp: vMrp,
        salePrice: vSalePrice,
        price: vSalePrice,
        stock: Number(v.stock_quantity || 0),
        reserved: Number(v.reserved_quantity || 0),
        images: Array.isArray(v.images) ? v.images : [],
        isActive: Boolean(v.is_active !== false),
        isNew: false,
        isExisting: true,
        isDeleted: false
      };
    });

  const existingColors = [...new Set(editModalExistingVariants.map(v => v.color).filter(Boolean))];
  const existingSizes = [...new Set(editModalExistingVariants.map(v => v.size).filter(Boolean))];
  editModalLegacyColors = [...existingColors];
  editModalLegacySizes = [...existingSizes];

  const hasDefaultVariant = editModalExistingVariants.some(v => (!v.color && !v.size) || v.title === 'Standard Fit');
  if (editDefaultVariantNotice) {
    editDefaultVariantNotice.hidden = !hasDefaultVariant;
  }

  editModalSelectedColors = new Set(existingColors);
  editModalSelectedSizes = new Set(existingSizes);
  editModalColorGalleries = new Map();

  // Extract color galleries from variants or fallback to product.images
  const colorImagesMap = new Map();
  editModalExistingVariants.forEach(v => {
    if (v.color && Array.isArray(v.images) && v.images.length) {
      if (!colorImagesMap.has(v.color)) {
        colorImagesMap.set(v.color, v.images);
      }
    }
  });

  if (existingColors.length > 0) {
    existingColors.forEach(colorName => {
      const manager = new ColorGalleryManager({
        colorName,
        colorHex: getColorHex(colorName),
        statusEl: editStatus
      });
      const imgs = colorImagesMap.get(colorName) || product.images || [];
      manager.setImages(imgs);
      editModalColorGalleries.set(colorName, manager);
    });
  } else {
    const generalManager = new ColorGalleryManager({
      colorName: null,
      colorHex: '#64748b',
      colorSlug: 'general',
      statusEl: editStatus
    });
    generalManager.setImages(product.images || []);
    editModalColorGalleries.set('__general__', generalManager);
  }

  // Render Pill selectors & galleries
  renderColorPills(editProductColorsList, editModalSelectedColors, storeColors, editModalLegacyColors, () => {
    syncColorGalleriesUI(editColorGalleriesContainer, editModalSelectedColors, editModalColorGalleries, editStatus);
    updateVariantSummary(editVariantsSummaryText, editModalSelectedColors, editModalSelectedSizes);
  });

  renderSizePills(editProductSizesList, editModalSelectedSizes, storeSizes, editModalLegacySizes, () => {
    updateVariantSummary(editVariantsSummaryText, editModalSelectedColors, editModalSelectedSizes);
  });

  syncColorGalleriesUI(editColorGalleriesContainer, editModalSelectedColors, editModalColorGalleries, editStatus);
  updateVariantSummary(editVariantsSummaryText, editModalSelectedColors, editModalSelectedSizes);

  // Initialize variant table
  if (editModalExistingVariants.length > 0) {
    editModalVariants = editModalExistingVariants.map(v => ({ ...v }));
  } else {
    editModalVariants = [{
      id: null,
      sku: `${product.id}-DEFAULT`,
      title: 'Standard Fit',
      color: null,
      size: null,
      mrp: productMrp,
      salePrice: productSalePrice,
      price: productSalePrice,
      stock: Number(product.stock_quantity || 0),
      reserved: Number(product.reserved_quantity || 0),
      isActive: true,
      isNew: true,
      isExisting: false,
      isDeleted: false
    }];
  }

  renderVariantReviewTable(editVariantsList, editModalVariants, productMrp, productSalePrice);
  populateBulkPriceTargetDropdown(editBulkPriceTarget, editModalVariants, editModalSelectedColors);
  if (editBulkMrp) editBulkMrp.value = '';
  if (editBulkSalePrice) editBulkSalePrice.value = '';
  if (editBulkDiscountBadge) editBulkDiscountBadge.innerHTML = renderDiscountBadge(0, 0);
  editProductName?.focus();
}

async function saveProductEdit(event) {
  event.preventDefault();
  if (!supabase) return;
  syncVariantsFromTable(editVariantsList, editModalVariants);

  const productId = editProductId?.value.trim();
  const name = editProductName?.value.trim();
  const sortOrder = Number(editProductSortOrder?.value || 0);
  const mrpRupees = Number(editProductMrp?.value);
  const salePriceRupees = Number(editProductSalePrice?.value);
  const category = editProductCategory?.value.trim();
  const description = editProductDescription?.value.trim() || '';
  const altText = editProductAlt?.value.trim() || '';
  const isActive = Boolean(editProductIsActive?.checked);

  if (!productId) {
    if (editStatus) {
      editStatus.textContent = 'Invalid product ID.';
      editStatus.classList.add('is-error');
    }
    return;
  }

  if (!name) {
    if (editStatus) {
      editStatus.textContent = 'Please enter a product name.';
      editStatus.classList.add('is-error');
    }
    editProductName?.focus();
    return;
  }

  if (!Number.isFinite(mrpRupees) || mrpRupees < 0) {
    if (editStatus) {
      editStatus.textContent = 'Please enter a valid non-negative MRP in Rupees (₹0 or greater).';
      editStatus.classList.add('is-error');
    }
    editProductMrp?.focus();
    return;
  }

  if (!Number.isFinite(salePriceRupees) || salePriceRupees < 0) {
    if (editStatus) {
      editStatus.textContent = 'Please enter a valid non-negative Sale Price in Rupees (₹0 or greater).';
      editStatus.classList.add('is-error');
    }
    editProductSalePrice?.focus();
    return;
  }

  if (salePriceRupees > mrpRupees) {
    if (editStatus) {
      editStatus.textContent = `Sale Price (₹${salePriceRupees}) cannot exceed MRP (₹${mrpRupees}).`;
      editStatus.classList.add('is-error');
    }
    editProductSalePrice?.focus();
    return;
  }

  if (!category) {
    if (editStatus) {
      editStatus.textContent = 'Please select a category.';
      editStatus.classList.add('is-error');
    }
    editProductCategory?.focus();
    return;
  }

  // Validate active variants
  const activeVariants = editModalVariants.filter(v => !v.isDeleted);
  if (!activeVariants.length) {
    if (editStatus) {
      editStatus.textContent = 'The product must have at least one variant.';
      editStatus.classList.add('is-error');
    }
    return;
  }

  for (let i = 0; i < activeVariants.length; i++) {
    const v = activeVariants[i];
    const vMrp = Number(v.mrp);
    const vSale = Number(v.salePrice ?? v.price);

    if (!Number.isFinite(vMrp) || vMrp < 0) {
      if (editStatus) {
        editStatus.textContent = `Variant "${v.title}" must have a valid non-negative MRP.`;
        editStatus.classList.add('is-error');
      }
      return;
    }
    if (!Number.isFinite(vSale) || vSale < 0) {
      if (editStatus) {
        editStatus.textContent = `Variant "${v.title}" must have a valid non-negative Sale Price.`;
        editStatus.classList.add('is-error');
      }
      return;
    }
    if (vSale > vMrp) {
      if (editStatus) {
        editStatus.textContent = `Variant "${v.title}" Sale Price (₹${vSale}) cannot exceed MRP (₹${vMrp}).`;
        editStatus.classList.add('is-error');
      }
      return;
    }
    if (!Number.isInteger(Number(v.stock)) || Number(v.stock) < 0) {
      if (editStatus) {
        editStatus.textContent = `Variant "${v.title}" stock must be a non-negative whole number.`;
        editStatus.classList.add('is-error');
      }
      return;
    }
    if (!v.sku || !v.sku.trim()) {
      if (editStatus) {
        editStatus.textContent = `Variant "${v.title}" requires a valid SKU.`;
        editStatus.classList.add('is-error');
      }
      return;
    }
  }

  // Check SKU uniqueness in matrix
  const skuSet = new Set();
  for (const v of activeVariants) {
    const cleanSku = v.sku.trim().toLowerCase();
    if (skuSet.has(cleanSku)) {
      if (editStatus) {
        editStatus.textContent = `Duplicate SKU "${v.sku}" detected across variants. All SKUs must be unique.`;
        editStatus.classList.add('is-error');
      }
      return;
    }
    skuSet.add(cleanSku);
  }

  const selectedOption = editProductCategory?.selectedOptions?.[0];
  const matchedCategory = categories.find(c => c.name.toLowerCase() === category.toLowerCase() || (selectedOption?.dataset?.catId && c.id === selectedOption.dataset.catId));
  const categoryId = matchedCategory?.id || selectedOption?.dataset?.catId || null;
  const categorySlug = matchedCategory?.slug || selectedOption?.dataset?.slug || category.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

  // Family & Variety Handling
  const selectedFamilyId = editProductFamily?.value;
  let familyId = null;
  let familyName = '';
  const isVarietyMode = Boolean(editProductModeVariety?.checked);
  const varietyName = isVarietyMode ? (editProductVarietyName?.value.trim() || null) : null;

  if (isVarietyMode && !varietyName) {
    if (editStatus) {
      editStatus.textContent = 'Please enter a Variety / Design Name for this product variety (e.g. Dragon Print).';
      editStatus.classList.add('is-error');
    }
    editProductVarietyName?.focus();
    return;
  }

  if (editSaveBtn) {
    editSaveBtn.disabled = true;
    editSaveBtn.textContent = 'Saving…';
  }
  if (editCancelBtn) editCancelBtn.disabled = true;
  if (editStatus) {
    editStatus.textContent = 'Uploading color photos & saving changes…';
    editStatus.classList.remove('is-error');
  }

  let allNewlyUploadedPaths = [];
  try {
    if (selectedFamilyId === '__create_new__') {
      const newFamName = editNewFamilyName?.value.trim() || name;
      if (!newFamName) {
        if (editStatus) {
          editStatus.textContent = 'Please enter a Variety Name.';
          editStatus.classList.add('is-error');
        }
        editNewFamilyName?.focus();
        if (editSaveBtn) editSaveBtn.disabled = false;
        if (editCancelBtn) editCancelBtn.disabled = false;
        return;
      }
      familyName = newFamName;
      const famSlug = generateProductSlug(familyName + '-family', productFamilies);
      const newFamDesc = (editNewFamilyDesc?.value || description || '').trim();
      const { data: newFam, error: famErr } = await supabase
        .from('product_families')
        .insert({
          name: familyName,
          slug: famSlug,
          category_id: categoryId,
          category_name: category,
          category_slug: categorySlug,
          description: newFamDesc,
          is_active: true
        })
        .select('id, name')
        .single();

      if (famErr) throw famErr;
      familyId = newFam.id;
      familyName = newFam.name;
      await loadProductFamilies();
    } else if (selectedFamilyId) {
      familyId = selectedFamilyId;
      const existingFam = productFamilies.find(f => f.id === selectedFamilyId);
      familyName = existingFam?.name || name;
    }

    const productMode = isVarietyMode ? 'variety' : 'single';

    // 1. Upload pending photos for all active color galleries
    const colorImageMap = {};
    const selectedColorsArray = Array.from(editModalSelectedColors);

    if (selectedColorsArray.length > 0) {
      for (const colorName of selectedColorsArray) {
        const mgr = editModalColorGalleries.get(colorName);
        if (mgr) {
          const res = await mgr.uploadPendingFiles(productId);
          colorImageMap[colorName] = res.finalUrls;
          allNewlyUploadedPaths.push(...res.newlyUploadedPaths);
        }
      }
    } else {
      const generalMgr = editModalColorGalleries.get('__general__');
      if (generalMgr) {
        const res = await generalMgr.uploadPendingFiles(productId);
        colorImageMap['__general__'] = res.finalUrls;
        allNewlyUploadedPaths.push(...res.newlyUploadedPaths);
      }
    }

    // Determine primary product images array for catalog card fallback
    let primaryProductImages = [];
    if (selectedColorsArray.length > 0) {
      const firstColor = selectedColorsArray[0];
      primaryProductImages = colorImageMap[firstColor] || [];
      if (!primaryProductImages.length) {
        // Collect first image of every color
        selectedColorsArray.forEach(cn => {
          if (colorImageMap[cn] && colorImageMap[cn][0]) primaryProductImages.push(colorImageMap[cn][0]);
        });
      }
    } else {
      primaryProductImages = colorImageMap['__general__'] || [];
    }

    if (!primaryProductImages.length) {
      primaryProductImages = ['images/ca2e03bc34d1c75b624003e138376397.jpg'];
    }

    // 2. Update parent product record
    const pricingMode = editProductPricingMode?.value || 'custom';
    const updatePayload = {
      name,
      family_id: familyId,
      family_name: familyName,
      variety_name: varietyName,
      product_mode: productMode,
      pricing_mode: pricingMode,
      price_paise: Math.round(salePriceRupees * 100),
      sale_price_paise: Math.round(salePriceRupees * 100),
      mrp_paise: Math.round(mrpRupees * 100),
      category,
      category_slug: categorySlug,
      description,
      images: primaryProductImages,
      alt_text: altText,
      is_active: isActive,
      sort_order: sortOrder,
      updated_at: new Date().toISOString()
    };
    if (categoryId) {
      updatePayload.category_id = categoryId;
    }

    let { error: prodError } = await supabase
      .from('products')
      .update(updatePayload)
      .eq('id', productId);

    if (prodError && (prodError.code === '42703' || prodError.message?.includes('sort_order'))) {
      console.warn('[Product Save] sort_order column not found in DB, saving without it.');
      delete updatePayload.sort_order;
      const fallbackRes = await supabase
        .from('products')
        .update(updatePayload)
        .eq('id', productId);
      prodError = fallbackRes.error;
    }

    if (prodError) throw prodError;

    // 3. Save/update/deactivate product variants
    for (let i = 0; i < editModalVariants.length; i++) {
      const v = editModalVariants[i];
      const vMrpPaise = Math.round(Number(v.mrp ?? mrpRupees) * 100);
      const vSalePricePaise = Math.round(Number(v.salePrice ?? v.price ?? salePriceRupees) * 100);
      const vStock = Math.max(0, Number.parseInt(v.stock, 10) || 0);
      const vColor = v.color ? String(v.color).trim() : null;
      const vSize = v.size ? String(v.size).trim() : null;
      const vTitle = String(v.title || '').trim() || formatVariantTitle(vColor, vSize);
      const vPricingMode = v.pricingMode || pricingMode;
      const vImages = (vColor && colorImageMap[vColor] && colorImageMap[vColor].length)
        ? colorImageMap[vColor]
        : (colorImageMap['__general__'] || primaryProductImages);

      if (v.isDeleted && v.id) {
        // Soft deactivate deleted variant
        await supabase
          .from('product_variants')
          .update({ is_active: false, updated_at: new Date().toISOString() })
          .eq('id', v.id);
      } else if (v.isNew && !v.isDeleted) {
        await supabase
          .from('product_variants')
          .insert({
            product_id: productId,
            sku: v.sku || generateUniqueVariantSku(productId, vColor, vSize),
            title: vTitle,
            color: vColor,
            size: vSize,
            pricing_mode: vPricingMode,
            price_paise: vSalePricePaise,
            sale_price_paise: vSalePricePaise,
            mrp_paise: vMrpPaise,
            stock_quantity: vStock,
            reserved_quantity: 0,
            images: vImages,
            is_active: Boolean(v.isActive !== false),
            sort_order: i + 1
          });
      } else if (v.id && !v.isDeleted) {
        await supabase
          .from('product_variants')
          .update({
            sku: v.sku,
            title: vTitle,
            color: vColor,
            size: vSize,
            pricing_mode: vPricingMode,
            price_paise: vSalePricePaise,
            sale_price_paise: vSalePricePaise,
            mrp_paise: vMrpPaise,
            stock_quantity: vStock,
            images: vImages,
            is_active: Boolean(v.isActive !== false),
            sort_order: i + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', v.id);
      }
    }

    // 4. Recalculate parent product total stock from variants
    await supabase.rpc('sync_product_stock_from_variants', { p_product_id: productId });

    // Refresh products & inventory lists automatically
    await loadProducts(false);
    if (inventory.length) await loadInventory(false);

    closeEditProductModal();
    setProductsStatus(`Product "${name}" and its variants were updated successfully.`);
  } catch (err) {
    console.error('Error saving product:', err);
    if (allNewlyUploadedPaths.length > 0) {
      try {
        await supabase.storage.from(STORAGE_BUCKET).remove(allNewlyUploadedPaths);
      } catch (cleanupErr) {
        console.warn('Storage cleanup warning:', cleanupErr);
      }
    }
    if (editStatus) {
      editStatus.textContent = err.message || 'Unable to save changes. Please try again.';
      editStatus.classList.add('is-error');
    }
  } finally {
    if (editSaveBtn) {
      editSaveBtn.disabled = false;
      editSaveBtn.textContent = 'Save Changes';
    }
    if (editCancelBtn) editCancelBtn.disabled = false;
  }
}

// -------------------------------------------------------------
// PRODUCT DELETE MODAL & MANAGEMENT FUNCTIONS
// -------------------------------------------------------------

async function toggleProductActive(productId, currentActive) {
  const product = products.find(p => p.id === productId);
  if (!product || !supabase) return;

  const nextState = !currentActive;
  const actionLabel = nextState ? 'activate' : 'deactivate';

  setProductsStatus(`${nextState ? 'Activating' : 'Deactivating'} product "${product.name || 'product'}"…`);

  try {
    const { error } = await supabase
      .from('products')
      .update({
        is_active: nextState,
        updated_at: new Date().toISOString()
      })
      .eq('id', productId);

    if (error) throw error;

    await loadProducts(false);
    if (inventory.length) await loadInventory(false);
    setProductsStatus(`Product "${product.name || 'Item'}" was ${nextState ? 'activated' : 'deactivated'} successfully.`);
  } catch (err) {
    console.error(`Error ${actionLabel}ing product:`, err);
    setProductsStatus(`Unable to ${actionLabel} product: ${err.message}`, true);
  }
}

const deleteProductModal = document.getElementById('adminDeleteProductModal');
const deleteCloseBtn = document.getElementById('adminDeleteCloseBtn');
const deleteCancelBtn = document.getElementById('adminDeleteCancelBtn');
const deleteConfirmBtn = document.getElementById('adminDeleteConfirmBtn');
const deleteStatus = document.getElementById('adminDeleteStatus');
const deleteProductName = document.getElementById('deleteProductName');
const deleteProductId = document.getElementById('deleteProductId');
const deleteProductPrice = document.getElementById('deleteProductPrice');

let productPendingDelete = null;

function openDeleteProductModal(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  productPendingDelete = product;
  if (deleteProductName) deleteProductName.textContent = product.name || 'Untitled product';
  if (deleteProductId) deleteProductId.innerHTML = `<code>${escapeHtml(product.id)}</code>`;
  if (deleteProductPrice) deleteProductPrice.textContent = formatMoney(product.price_paise, product.currency || 'INR');
  if (deleteStatus) {
    deleteStatus.textContent = '';
    deleteStatus.classList.remove('is-error');
  }
  if (deleteConfirmBtn) {
    deleteConfirmBtn.disabled = false;
    deleteConfirmBtn.textContent = 'Permanently Delete';
  }

  if (deleteProductModal) {
    deleteProductModal.hidden = false;
    deleteProductModal.setAttribute('aria-hidden', 'false');
  }
  document.body.style.overflow = 'hidden';
}

function closeDeleteProductModal() {
  if (deleteProductModal) {
    deleteProductModal.hidden = true;
    deleteProductModal.setAttribute('aria-hidden', 'true');
  }
  document.body.style.overflow = '';
  productPendingDelete = null;
  if (deleteStatus) {
    deleteStatus.textContent = '';
    deleteStatus.classList.remove('is-error');
  }
}

async function confirmDeleteProduct() {
  if (!productPendingDelete || !supabase) return;
  const productId = productPendingDelete.id;
  const productName = productPendingDelete.name;
  const productImages = productPendingDelete.images || [];

  if (deleteConfirmBtn) {
    deleteConfirmBtn.disabled = true;
    deleteConfirmBtn.textContent = 'Deleting…';
  }
  if (deleteCancelBtn) deleteCancelBtn.disabled = true;
  if (deleteStatus) {
    deleteStatus.textContent = 'Permanently deleting product from database…';
    deleteStatus.classList.remove('is-error');
  }

  try {
    // 1. Execute authoritative server-side deletion
    const { data, error } = await supabase.rpc('admin_delete_product', {
      p_product_id: productId
    });

    if (error) {
      throw error;
    }

    // 2. Clean up product storage images if applicable
    try {
      const storageUrls = Array.isArray(productImages) ? productImages : [];
      const storagePathsToDelete = [];

      storageUrls.forEach(url => {
        if (typeof url === 'string' && url.includes(`/product-images/products/${productId}/`)) {
          const parts = url.split('/product-images/');
          if (parts[1]) storagePathsToDelete.push(decodeURIComponent(parts[1]));
        }
      });

      if (storagePathsToDelete.length > 0) {
        await supabase.storage.from(STORAGE_BUCKET).remove(storagePathsToDelete);
      }
    } catch (storageErr) {
      console.warn('Storage cleanup warning:', storageErr);
    }

    await loadProducts(false);
    await loadProductFamilies().catch(() => {});
    if (inventory.length) await loadInventory(false);

    closeDeleteProductModal();
    setProductsStatus(`Product "${productName}" was permanently deleted successfully.`);
  } catch (err) {
    console.error('Error permanently deleting product:', err);
    if (deleteStatus) {
      deleteStatus.textContent = err.message || 'Unable to delete product. Please try again.';
      deleteStatus.classList.add('is-error');
    }
  } finally {
    if (deleteConfirmBtn) {
      deleteConfirmBtn.disabled = false;
      deleteConfirmBtn.textContent = 'Permanently Delete';
    }
    if (deleteCancelBtn) deleteCancelBtn.disabled = false;
  }
}

// -------------------------------------------------------------
// ADD PRODUCT MODAL & CREATION FUNCTIONS
// -------------------------------------------------------------

const CATEGORY_MAP = {
  'T-Shirts': { slug: 't-shirts', id: '059353d7-3224-4023-90bc-b7b5b2527e27' },
  'Jeans': { slug: 'jeans', id: 'b2410b1d-d835-4008-8827-24b65e7ca122' },
  'Pants': { slug: 'pants', id: '0d0b0fda-226c-4bae-bcb5-6e7dd06aed1c' },
  'Shirts': { slug: 'shirts', id: '117ad548-d38c-4f84-815b-27c85c433358' },
  'Accessories': { slug: 'caps', id: '2ab3e0bf-3d9d-4a71-afbe-c40608cd5ca5' }
};

const addProductModal = document.getElementById('adminAddProductModal');
const addProductForm = document.getElementById('adminAddProductForm');
const addCloseBtn = document.getElementById('adminAddCloseBtn');
const addCancelBtn = document.getElementById('adminAddCancelBtn');
const addSaveBtn = document.getElementById('adminAddSaveBtn');
const addStatus = document.getElementById('adminAddStatus');

const addProductName = document.getElementById('addProductName');
const addProductFamily = document.getElementById('addProductFamily');
const addNewFamilyGroup = document.getElementById('addNewFamilyGroup');
const addNewFamilyName = document.getElementById('addNewFamilyName');
const addNewFamilyDesc = document.getElementById('addNewFamilyDesc');
const addProductModeSingle = document.getElementById('addProductModeSingle');
const addProductModeVariety = document.getElementById('addProductModeVariety');
const addVarietyNameGroup = document.getElementById('addVarietyNameGroup');
const addProductVarietyName = document.getElementById('addProductVarietyName');

const addProductPricingMode = document.getElementById('addProductPricingMode');
const addProductPricingModeHint = document.getElementById('addProductPricingModeHint');
const addProductMrp = document.getElementById('addProductMrp');
const addProductSalePrice = document.getElementById('addProductSalePrice');
const addProductDiscountBadge = document.getElementById('addProductDiscountBadge');
const addProductPrice = addProductSalePrice || document.getElementById('addProductPrice');
const addProductCurrency = document.getElementById('addProductCurrency');
const addProductCategory = document.getElementById('addProductCategory');
const addProductCategorySlug = document.getElementById('addProductCategorySlug');
const addProductDescription = document.getElementById('addProductDescription');
const addProductAlt = document.getElementById('addProductAlt');
const addProductIsActive = document.getElementById('addProductIsActive');
const addProductSortOrder = document.getElementById('addProductSortOrder');

const addProductColorsList = document.getElementById('addProductColorsList');
const addCustomColorInput = document.getElementById('addCustomColorInput');
const addCustomColorBtn = document.getElementById('addCustomColorBtn');
const addColorGalleriesContainer = document.getElementById('addColorGalleriesContainer');

const addProductSizesList = document.getElementById('addProductSizesList');
const addCustomSizeInput = document.getElementById('addCustomSizeInput');
const addCustomSizeBtn = document.getElementById('addCustomSizeBtn');

const addGenerateVariantsBtn = document.getElementById('addGenerateVariantsBtn');
const addVariantsSummaryText = document.getElementById('addVariantsSummaryText');
const addVariantsTableWrap = document.getElementById('addVariantsTableWrap');
const addVariantsList = document.getElementById('addVariantsList');

const addBulkPriceTarget = document.getElementById('addBulkPriceTarget');
const addBulkMrp = document.getElementById('addBulkMrp');
const addBulkSalePrice = document.getElementById('addBulkSalePrice');
const addBulkDiscountBadge = document.getElementById('addBulkDiscountBadge');
const addApplyBulkPriceBtn = document.getElementById('addApplyBulkPriceBtn');

let addModalSelectedColors = new Set();
let addModalColorGalleries = new Map(); // colorName -> ColorGalleryManager
let addModalSelectedSizes = new Set();
let addModalVariants = []; // array of variant drafts

function generateProductSlug(name, existingProducts = []) {
  const baseSlug = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 50) || 'product';

  let slug = baseSlug;
  let counter = 1;
  const existingIds = new Set(existingProducts.map(p => p.id?.toLowerCase()));
  const existingSlugs = new Set(existingProducts.map(p => p.slug?.toLowerCase()));

  while (existingIds.has(slug) || existingSlugs.has(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  return slug;
}

async function openAddProductModal() {
  if (!supabase) return;
  addProductForm?.reset();
  addModalColorGalleries.forEach(mgr => mgr.reset());
  addModalColorGalleries.clear();
  addModalSelectedColors.clear();
  addModalSelectedSizes.clear();
  addModalVariants = [];

  populateCategoryDropdowns();
  await loadProductFamilies();

  if (addProductPricingMode) addProductPricingMode.value = 'custom';
  if (addProductMrp) addProductMrp.value = '';
  if (addProductSalePrice) addProductSalePrice.value = '';
  if (addProductDiscountBadge) {
    addProductDiscountBadge.innerHTML = renderDiscountBadge(0, 0);
  }
  if (addProductSortOrder) addProductSortOrder.value = '0';

  if (addProductCurrency) addProductCurrency.value = 'INR';
  const firstActiveCat = categories.find(c => c.is_active !== false) || categories[0];
  if (addProductCategory && firstActiveCat) {
    addProductCategory.value = firstActiveCat.name;
    if (addProductCategorySlug) addProductCategorySlug.value = firstActiveCat.slug;
  }

  // Populate Product Family & Mode
  populateFamilyDropdown(addProductFamily, null, firstActiveCat?.name);
  if (addNewFamilyGroup) addNewFamilyGroup.hidden = addProductFamily?.value !== '__create_new__';
  if (addNewFamilyName) addNewFamilyName.value = '';
  if (addProductModeSingle) addProductModeSingle.checked = true;
  if (addProductModeVariety) addProductModeVariety.checked = false;
  if (addVarietyNameGroup) addVarietyNameGroup.hidden = true;
  if (addProductVarietyName) addProductVarietyName.value = '';

  if (addProductIsActive) addProductIsActive.checked = true;
  if (addStatus) {
    addStatus.textContent = '';
    addStatus.classList.remove('is-error');
  }
  if (addSaveBtn) addSaveBtn.disabled = false;

  updateProductPricingModeUI(addProductPricingMode, addProductMrp, addProductSalePrice, addProductDiscountBadge, addProductCategory, addProductPricingModeHint);

  // Render Pill selectors & galleries
  renderColorPills(addProductColorsList, addModalSelectedColors, storeColors, [], () => {
    syncColorGalleriesUI(addColorGalleriesContainer, addModalSelectedColors, addModalColorGalleries, addStatus);
    updateVariantSummary(addVariantsSummaryText, addModalSelectedColors, addModalSelectedSizes);
  });

  renderSizePills(addProductSizesList, addModalSelectedSizes, storeSizes, [], () => {
    updateVariantSummary(addVariantsSummaryText, addModalSelectedColors, addModalSelectedSizes);
  });

  syncColorGalleriesUI(addColorGalleriesContainer, addModalSelectedColors, addModalColorGalleries, addStatus);
  updateVariantSummary(addVariantsSummaryText, addModalSelectedColors, addModalSelectedSizes);
  renderVariantReviewTable(addVariantsList, addModalVariants, 0, 0);
  populateBulkPriceTargetDropdown(addBulkPriceTarget, addModalVariants, addModalSelectedColors);
  if (addBulkMrp) addBulkMrp.value = '';
  if (addBulkSalePrice) addBulkSalePrice.value = '';
  if (addBulkDiscountBadge) addBulkDiscountBadge.innerHTML = renderDiscountBadge(0, 0);

  if (addProductModal) {
    addProductModal.hidden = false;
    addProductModal.setAttribute('aria-hidden', 'false');
  }
  document.body.style.overflow = 'hidden';
  addProductName?.focus();
}

function closeAddProductModal() {
  if (addProductModal) {
    addProductModal.hidden = true;
    addProductModal.setAttribute('aria-hidden', 'true');
  }
  document.body.style.overflow = '';
  addProductForm?.reset();
  if (addProductDiscountBadge) {
    addProductDiscountBadge.innerHTML = renderDiscountBadge(0, 0);
  }
  addModalColorGalleries.forEach(mgr => mgr.reset());
  addModalColorGalleries.clear();
  addModalSelectedColors.clear();
  addModalSelectedSizes.clear();
  addModalVariants = [];
  if (addVariantsList) addVariantsList.innerHTML = '';
  if (addStatus) {
    addStatus.textContent = '';
    addStatus.classList.remove('is-error');
  }
}

async function saveNewProduct(event) {
  event.preventDefault();
  if (!supabase) return;
  syncVariantsFromTable(addVariantsList, addModalVariants);

  const name = addProductName?.value.trim();
  const sortOrder = Number(addProductSortOrder?.value || 0);
  const mrpRupees = Number(addProductMrp?.value);
  const salePriceRupees = Number(addProductSalePrice?.value);
  const currency = (addProductCurrency?.value || 'INR').trim().toUpperCase();
  const category = addProductCategory?.value.trim();
  const selectedOption = addProductCategory?.selectedOptions?.[0];
  const matchedCategory = categories.find(c => c.name.toLowerCase() === category.toLowerCase() || (selectedOption?.dataset?.catId && c.id === selectedOption.dataset.catId));
  const categoryId = matchedCategory?.id || selectedOption?.dataset?.catId || null;
  const categorySlug = (addProductCategorySlug?.value.trim() || matchedCategory?.slug || selectedOption?.dataset?.slug || category.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')).toLowerCase();
  const description = addProductDescription?.value.trim() || '';
  const altText = addProductAlt?.value.trim() || name || 'E-Commerce Demo apparel';
  const isActive = Boolean(addProductIsActive?.checked);

  // Family & Variety Handling
  const selectedFamilyId = addProductFamily?.value;
  let familyId = null;
  let familyName = '';
  const isVarietyMode = Boolean(addProductModeVariety?.checked);
  const varietyName = isVarietyMode ? (addProductVarietyName?.value.trim() || null) : null;

  if (isVarietyMode && !varietyName) {
    if (addStatus) {
      addStatus.textContent = 'Please enter a Variety / Design Name for this product variety (e.g. Dragon Print).';
      addStatus.classList.add('is-error');
    }
    addProductVarietyName?.focus();
    return;
  }

  if (!name) {
    if (addStatus) {
      addStatus.textContent = 'Please enter a product name.';
      addStatus.classList.add('is-error');
    }
    addProductName?.focus();
    return;
  }

  if (!Number.isFinite(mrpRupees) || mrpRupees < 0) {
    if (addStatus) {
      addStatus.textContent = 'Please enter a valid non-negative MRP in Rupees (₹0 or greater).';
      addStatus.classList.add('is-error');
    }
    addProductMrp?.focus();
    return;
  }

  if (!Number.isFinite(salePriceRupees) || salePriceRupees < 0) {
    if (addStatus) {
      addStatus.textContent = 'Please enter a valid non-negative Sale Price in Rupees (₹0 or greater).';
      addStatus.classList.add('is-error');
    }
    addProductSalePrice?.focus();
    return;
  }

  if (salePriceRupees > mrpRupees) {
    if (addStatus) {
      addStatus.textContent = `Sale Price (₹${salePriceRupees}) cannot exceed MRP (₹${mrpRupees}).`;
      addStatus.classList.add('is-error');
    }
    addProductSalePrice?.focus();
    return;
  }

  if (!category) {
    if (addStatus) {
      addStatus.textContent = 'Please select a category.';
      addStatus.classList.add('is-error');
    }
    addProductCategory?.focus();
    return;
  }

  const slug = generateProductSlug(name, products);
  const productId = slug;

  // If variants matrix was not explicitly generated, generate standard fit or matrix now
  if (!addModalVariants.length) {
    addModalVariants = generateVariantMatrix(addModalSelectedColors, addModalSelectedSizes, mrpRupees, salePriceRupees, slug, [], []);
  }

  // Validate active variants
  const activeVariants = addModalVariants.filter(v => !v.isDeleted);
  if (!activeVariants.length) {
    if (addStatus) {
      addStatus.textContent = 'The product must have at least one variant.';
      addStatus.classList.add('is-error');
    }
    return;
  }

  for (let i = 0; i < activeVariants.length; i++) {
    const v = activeVariants[i];
    const vMrp = Number(v.mrp);
    const vSale = Number(v.salePrice ?? v.price);

    if (!Number.isFinite(vMrp) || vMrp < 0) {
      if (addStatus) {
        addStatus.textContent = `Variant "${v.title}" must have a valid non-negative MRP.`;
        addStatus.classList.add('is-error');
      }
      return;
    }
    if (!Number.isFinite(vSale) || vSale < 0) {
      if (addStatus) {
        addStatus.textContent = `Variant "${v.title}" must have a valid non-negative Sale Price.`;
        addStatus.classList.add('is-error');
      }
      return;
    }
    if (vSale > vMrp) {
      if (addStatus) {
        addStatus.textContent = `Variant "${v.title}" Sale Price (₹${vSale}) cannot exceed MRP (₹${vMrp}).`;
        addStatus.classList.add('is-error');
      }
      return;
    }
    if (!Number.isInteger(Number(v.stock)) || Number(v.stock) < 0) {
      if (addStatus) {
        addStatus.textContent = `Variant "${v.title}" stock must be a non-negative whole number.`;
        addStatus.classList.add('is-error');
      }
      return;
    }
    if (!v.sku || !v.sku.trim()) {
      if (addStatus) {
        addStatus.textContent = `Variant "${v.title}" requires a valid SKU.`;
        addStatus.classList.add('is-error');
      }
      return;
    }
  }

  // Check SKU uniqueness in matrix
  const skuSet = new Set();
  for (const v of activeVariants) {
    const cleanSku = v.sku.trim().toLowerCase();
    if (skuSet.has(cleanSku)) {
      if (addStatus) {
        addStatus.textContent = `Duplicate SKU "${v.sku}" detected across variants. All SKUs must be unique.`;
        addStatus.classList.add('is-error');
      }
      return;
    }
    skuSet.add(cleanSku);
  }

  if (addSaveBtn) {
    addSaveBtn.disabled = true;
    addSaveBtn.textContent = 'Adding Product…';
  }
  if (addCancelBtn) addCancelBtn.disabled = true;
  if (addStatus) {
    addStatus.textContent = 'Uploading color photos & creating product…';
    addStatus.classList.remove('is-error');
  }

  let allNewlyUploadedPaths = [];
  try {
    if (selectedFamilyId === '__create_new__' || !selectedFamilyId) {
      const newFamName = addNewFamilyName?.value.trim() || name;
      if (!newFamName) {
        if (addStatus) {
          addStatus.textContent = 'Please enter a Variety Name.';
          addStatus.classList.add('is-error');
        }
        addNewFamilyName?.focus();
        if (addSaveBtn) addSaveBtn.disabled = false;
        if (addCancelBtn) addCancelBtn.disabled = false;
        return;
      }
      familyName = newFamName;
      const famSlug = generateProductSlug(familyName + '-family', productFamilies);
      const newFamDesc = (addNewFamilyDesc?.value || description || '').trim();
      const { data: newFam, error: famErr } = await supabase
        .from('product_families')
        .insert({
          name: familyName,
          slug: famSlug,
          category_id: categoryId,
          category_name: category,
          category_slug: categorySlug,
          description: newFamDesc,
          is_active: true
        })
        .select('id, name')
        .single();

      if (famErr) throw famErr;
      familyId = newFam.id;
      familyName = newFam.name;
      await loadProductFamilies();
    } else {
      familyId = selectedFamilyId;
      const existingFam = productFamilies.find(f => f.id === selectedFamilyId);
      familyName = existingFam?.name || name;
    }

    const productMode = isVarietyMode ? 'variety' : 'single';

    // 1. Upload pending photos for all active color galleries
    const colorImageMap = {};
    const selectedColorsArray = Array.from(addModalSelectedColors);

    if (selectedColorsArray.length > 0) {
      for (const colorName of selectedColorsArray) {
        const mgr = addModalColorGalleries.get(colorName);
        if (mgr) {
          const res = await mgr.uploadPendingFiles(slug);
          colorImageMap[colorName] = res.finalUrls;
          allNewlyUploadedPaths.push(...res.newlyUploadedPaths);
        }
      }
    } else {
      const generalMgr = addModalColorGalleries.get('__general__');
      if (generalMgr) {
        const res = await generalMgr.uploadPendingFiles(slug);
        colorImageMap['__general__'] = res.finalUrls;
        allNewlyUploadedPaths.push(...res.newlyUploadedPaths);
      }
    }

    // Determine primary product images array for catalog card fallback
    let primaryProductImages = [];
    if (selectedColorsArray.length > 0) {
      const firstColor = selectedColorsArray[0];
      primaryProductImages = colorImageMap[firstColor] || [];
      if (!primaryProductImages.length) {
        selectedColorsArray.forEach(cn => {
          if (colorImageMap[cn] && colorImageMap[cn][0]) primaryProductImages.push(colorImageMap[cn][0]);
        });
      }
    } else {
      primaryProductImages = colorImageMap['__general__'] || [];
    }

    if (!primaryProductImages.length) {
      primaryProductImages = ['images/ca2e03bc34d1c75b624003e138376397.jpg'];
    }

    // 2. Insert into products table
    const pricingMode = addProductPricingMode?.value || 'custom';
    const productPayload = {
      id: productId,
      slug: slug,
      name: name,
      family_id: familyId,
      family_name: familyName,
      variety_name: varietyName,
      product_mode: productMode,
      pricing_mode: pricingMode,
      price_paise: Math.round(salePriceRupees * 100),
      sale_price_paise: Math.round(salePriceRupees * 100),
      mrp_paise: Math.round(mrpRupees * 100),
      currency: currency || 'INR',
      is_active: isActive,
      stock_quantity: 0,
      reserved_quantity: 0,
      category: category,
      category_slug: categorySlug,
      description: description,
      images: primaryProductImages,
      alt_text: altText,
      sort_order: sortOrder
    };
    if (categoryId) {
      productPayload.category_id = categoryId;
    }

    let { error: prodError } = await supabase
      .from('products')
      .insert(productPayload);

    if (prodError && (prodError.code === '42703' || prodError.message?.includes('sort_order'))) {
      console.warn('[Product Save] sort_order column not found in DB, saving new product without it.');
      delete productPayload.sort_order;
      const fallbackRes = await supabase
        .from('products')
        .insert(productPayload);
      prodError = fallbackRes.error;
    }

    if (prodError) throw prodError;

    // 3. Create all generated variants
    for (let i = 0; i < activeVariants.length; i++) {
      const v = activeVariants[i];
      const vMrpPaise = Math.round(Number(v.mrp ?? mrpRupees) * 100);
      const vSalePricePaise = Math.round(Number(v.salePrice ?? v.price ?? salePriceRupees) * 100);
      const vStock = Math.max(0, Number.parseInt(v.stock, 10) || 0);
      const vColor = v.color ? String(v.color).trim() : null;
      const vSize = v.size ? String(v.size).trim() : null;
      const vTitle = String(v.title || '').trim() || formatVariantTitle(vColor, vSize);
      const vPricingMode = v.pricingMode || pricingMode;
      const vImages = (vColor && colorImageMap[vColor] && colorImageMap[vColor].length)
        ? colorImageMap[vColor]
        : (colorImageMap['__general__'] || primaryProductImages);

      await supabase
        .from('product_variants')
        .insert({
          product_id: productId,
          sku: v.sku || generateUniqueVariantSku(productId, vColor, vSize),
          title: vTitle,
          color: vColor,
          size: vSize,
          pricing_mode: vPricingMode,
          price_paise: vSalePricePaise,
          sale_price_paise: vSalePricePaise,
          mrp_paise: vMrpPaise,
          stock_quantity: vStock,
          reserved_quantity: 0,
          images: vImages,
          is_active: Boolean(v.isActive !== false),
          sort_order: i + 1
        });
    }

    // 4. Sync parent stock
    await supabase.rpc('sync_product_stock_from_variants', { p_product_id: productId });

    // Refresh products list automatically from Supabase
    await loadProducts(false);
    if (inventory.length) await loadInventory(false);

    closeAddProductModal();
    setProductsStatus(`Product "${name}" added to catalog with ${activeVariants.length} variant(s) successfully.`);
  } catch (err) {
    console.error('Error adding new product:', err);
    if (allNewlyUploadedPaths.length > 0) {
      try {
        await supabase.storage.from(STORAGE_BUCKET).remove(allNewlyUploadedPaths);
      } catch (cleanupErr) {
        console.warn('Storage cleanup warning:', cleanupErr);
      }
    }
    if (addStatus) {
      addStatus.textContent = err.message || 'Unable to create product. Please check your inputs and try again.';
      addStatus.classList.add('is-error');
    }
  } finally {
    if (addSaveBtn) {
      addSaveBtn.disabled = false;
      addSaveBtn.textContent = 'Add Product';
    }
    if (addCancelBtn) addCancelBtn.disabled = false;
  }
}

// -------------------------------------------------------------
// PRODUCT FAMILY & VARIETY UI LISTENERS
// -------------------------------------------------------------

function setupFamilyModeListeners() {
  if (addProductFamily) {
    addProductFamily.addEventListener('change', () => {
      const isNew = addProductFamily.value === '__create_new__';
      if (addNewFamilyGroup) addNewFamilyGroup.hidden = !isNew;
      if (!isNew && addProductFamily.value) {
        const fam = productFamilies.find(f => f.id === addProductFamily.value);
        if (fam && addProductName && (!addProductName.value || addProductName.value === addNewFamilyName?.value)) {
          if (addProductModeSingle?.checked) {
            addProductName.value = fam.name;
          }
        }
      }
    });
  }

  if (addProductModeSingle) {
    addProductModeSingle.addEventListener('change', () => {
      if (addProductModeSingle.checked) {
        if (addVarietyNameGroup) addVarietyNameGroup.hidden = true;
        if (addProductVarietyName) addProductVarietyName.value = '';
      }
    });
  }

  if (addProductModeVariety) {
    addProductModeVariety.addEventListener('change', () => {
      if (addProductModeVariety.checked) {
        if (addVarietyNameGroup) addVarietyNameGroup.hidden = false;
        addProductVarietyName?.focus();
      }
    });
  }

  if (editProductFamily) {
    editProductFamily.addEventListener('change', () => {
      const isNew = editProductFamily.value === '__create_new__';
      if (editNewFamilyGroup) editNewFamilyGroup.hidden = !isNew;
    });
  }

  if (editProductModeSingle) {
    editProductModeSingle.addEventListener('change', () => {
      if (editProductModeSingle.checked) {
        if (editVarietyNameGroup) editVarietyNameGroup.hidden = true;
        if (editProductVarietyName) editProductVarietyName.value = '';
      }
    });
  }

  if (editProductModeVariety) {
    editProductModeVariety.addEventListener('change', () => {
      if (editProductModeVariety.checked) {
        if (editVarietyNameGroup) editVarietyNameGroup.hidden = false;
        editProductVarietyName?.focus();
      }
    });
  }
}

setupFamilyModeListeners();


// -------------------------------------------------------------
// CATEGORY MANAGEMENT LOGIC & CONTROLLERS
// -------------------------------------------------------------

const addCategoryModal = document.getElementById('adminAddCategoryModal');
const addCategoryForm = document.getElementById('adminAddCategoryForm');
const addCategoryCloseBtn = document.getElementById('adminAddCategoryCloseBtn');
const addCategoryCancelBtn = document.getElementById('adminAddCategoryCancelBtn');
const addCategorySaveBtn = document.getElementById('adminAddCategorySaveBtn');
const addCategoryStatus = document.getElementById('adminAddCategoryStatus');

const addCategoryName = document.getElementById('addCategoryName');
const addCategorySlug = document.getElementById('addCategorySlug');
const addCategorySortOrder = document.getElementById('addCategorySortOrder');
const addCategoryDescription = document.getElementById('addCategoryDescription');
const addCategoryDiscountType = document.getElementById('addCategoryDiscountType');
const addCategoryDiscountValue = document.getElementById('addCategoryDiscountValue');
const addCategoryDiscountValueGroup = document.getElementById('addCategoryDiscountValueGroup');
const addCategoryDiscountValueLabel = document.getElementById('addCategoryDiscountValueLabel');
const addCategoryDiscountValueHint = document.getElementById('addCategoryDiscountValueHint');
const addCategoryDiscountIsActive = document.getElementById('addCategoryDiscountIsActive');
const addCategoryDiscountActiveGroup = document.getElementById('addCategoryDiscountActiveGroup');
const addCategoryIsActive = document.getElementById('addCategoryIsActive');

const editCategoryModal = document.getElementById('adminEditCategoryModal');
const editCategoryForm = document.getElementById('adminEditCategoryForm');
const editCategoryCloseBtn = document.getElementById('adminEditCategoryCloseBtn');
const editCategoryCancelBtn = document.getElementById('adminEditCategoryCancelBtn');
const editCategorySaveBtn = document.getElementById('adminEditCategorySaveBtn');
const editCategoryStatus = document.getElementById('adminEditCategoryStatus');

const editCategoryId = document.getElementById('editCategoryId');
const editCategoryName = document.getElementById('editCategoryName');
const editCategorySlug = document.getElementById('editCategorySlug');
const editCategorySortOrder = document.getElementById('editCategorySortOrder');
const editCategoryDescription = document.getElementById('editCategoryDescription');
const editCategoryDiscountType = document.getElementById('editCategoryDiscountType');
const editCategoryDiscountValue = document.getElementById('editCategoryDiscountValue');
const editCategoryDiscountValueGroup = document.getElementById('editCategoryDiscountValueGroup');
const editCategoryDiscountValueLabel = document.getElementById('editCategoryDiscountValueLabel');
const editCategoryDiscountValueHint = document.getElementById('editCategoryDiscountValueHint');
const editCategoryDiscountIsActive = document.getElementById('editCategoryDiscountIsActive');
const editCategoryDiscountActiveGroup = document.getElementById('editCategoryDiscountActiveGroup');
const editCategoryIsActive = document.getElementById('editCategoryIsActive');

const deleteCategoryModal = document.getElementById('adminDeleteCategoryModal');
const deleteCategoryCloseBtn = document.getElementById('adminDeleteCategoryCloseBtn');
const deleteCategoryCancelBtn = document.getElementById('adminDeleteCategoryCancelBtn');
const deleteCategoryConfirmBtn = document.getElementById('adminDeleteCategoryConfirmBtn');
const deleteCategoryStatus = document.getElementById('adminDeleteCategoryStatus');
const deleteCategoryName = document.getElementById('deleteCategoryName');
const deleteCategorySlug = document.getElementById('deleteCategorySlug');
const deleteCategoryProductCount = document.getElementById('deleteCategoryProductCount');
const deleteCategoryWarning = document.getElementById('adminDeleteCategoryWarning');
const deleteCategoryModalEyebrow = document.getElementById('adminDeleteCategoryModalEyebrow');
const deleteCategoryModalTitle = document.getElementById('adminDeleteCategoryModalTitle');

let categoryPendingDelete = null;
let categoryDeleteMode = 'delete'; // 'delete' | 'deactivate'

function generateCategorySlug(name) {
  return String(name || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 50) || 'category';
}

function updateCategoryDiscountFields(typeSelect, valueInput, valueGroup, valueLabel, valueHint, activeCheckbox, activeGroup) {
  const type = typeSelect ? typeSelect.value : 'none';
  if (type === 'percentage') {
    if (valueGroup) valueGroup.style.display = '';
    if (activeGroup) activeGroup.style.display = '';
    if (valueLabel) valueLabel.textContent = 'Discount Percentage (0–100 %) *';
    if (valueHint) valueHint.textContent = 'Enter percentage discount (e.g. 10 for 10% OFF)';
    if (valueInput) {
      valueInput.disabled = false;
      valueInput.min = '0';
      valueInput.max = '100';
      valueInput.placeholder = 'e.g. 10';
    }
  } else if (type === 'fixed') {
    if (valueGroup) valueGroup.style.display = '';
    if (activeGroup) activeGroup.style.display = '';
    if (valueLabel) valueLabel.textContent = 'Discount Amount (₹ INR) *';
    if (valueHint) valueHint.textContent = 'Enter fixed rupee discount (e.g. 100 for ₹100 OFF)';
    if (valueInput) {
      valueInput.disabled = false;
      valueInput.min = '0';
      valueInput.removeAttribute('max');
      valueInput.placeholder = 'e.g. 100';
    }
  } else {
    if (valueGroup) valueGroup.style.display = 'none';
    if (activeGroup) activeGroup.style.display = 'none';
    if (valueInput) {
      valueInput.disabled = true;
      valueInput.value = '0';
    }
    if (activeCheckbox) {
      activeCheckbox.checked = false;
    }
  }
}

function populateCategoryDropdowns() {
  const selects = [editProductCategory, addProductCategory];
  const sorted = [...categories].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0) || a.name.localeCompare(b.name));

  selects.forEach(select => {
    if (!select) return;
    const currentVal = select.value;
    select.innerHTML = '<option value="">Select a category</option>';
    sorted.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat.name;
      opt.textContent = cat.name + (!cat.is_active ? ' (Inactive)' : '');
      opt.dataset.slug = cat.slug;
      opt.dataset.catId = cat.id;
      opt.dataset.isActive = String(cat.is_active !== false);
      select.appendChild(opt);
    });
    if (currentVal && Array.from(select.options).some(o => o.value === currentVal)) {
      select.value = currentVal;
    }
  });
}

function calculateProductCountForCategory(cat) {
  if (!cat || !products.length) return 0;
  return products.filter(p => {
    if (p.category_id && cat.id) return p.category_id === cat.id;
    if (p.category_slug && cat.slug) return p.category_slug.toLowerCase() === cat.slug.toLowerCase();
    if (p.category && cat.name) return p.category.toLowerCase() === cat.name.toLowerCase();
    return false;
  }).length;
}

function filteredCategories() {
  const query = (categoriesSearch?.value || '').trim().toLowerCase();
  return categories.filter(cat => {
    const searchable = [cat.name, cat.slug, cat.description || ''].join(' ').toLowerCase();
    return !query || searchable.includes(query);
  });
}

function renderCategories() {
  const visible = filteredCategories();

  if (categoriesEmpty) categoriesEmpty.hidden = visible.length > 0;
  if (!categoriesList) return;

  if (!visible.length) {
    categoriesList.innerHTML = '';
    return;
  }

  categoriesList.innerHTML = visible.map(cat => {
    const productCount = calculateProductCountForCategory(cat);
    const status = cat.is_active !== false
      ? '<span class="admin-badge admin-badge-payment-paid">Active</span>'
      : '<span class="admin-badge admin-badge-payment-failed">Inactive</span>';

    const countBadge = productCount > 0
      ? `<span class="admin-badge admin-badge-order">${productCount} Product${productCount === 1 ? '' : 's'}</span>`
      : '<span class="admin-badge" style="background:#f1f5f9;color:#64748b;">0 Products</span>';

    let discountDisplay = '<span style="color:#64748b;font-size:12px;">No Discount</span>';
    let discountStatus = '<span class="admin-badge admin-badge-payment-failed">Inactive</span>';

    if (cat.discount_type === 'percentage' && Number(cat.discount_value) > 0) {
      discountDisplay = `<strong style="color:#15803d;font-family:var(--font-mono);font-size:12px;">${cat.discount_value}% OFF</strong>`;
    } else if (cat.discount_type === 'fixed' && Number(cat.discount_value) > 0) {
      const rupees = Math.round(Number(cat.discount_value) / 100);
      discountDisplay = `<strong style="color:#15803d;font-family:var(--font-mono);font-size:12px;">₹${rupees} OFF</strong>`;
    }

    if (Boolean(cat.discount_is_active) && cat.discount_type !== 'none' && Number(cat.discount_value) > 0) {
      discountStatus = '<span class="admin-badge admin-badge-payment-paid">Active</span>';
    } else {
      discountStatus = '<span class="admin-badge admin-badge-payment-failed">Inactive</span>';
    }

    const toggleLabel = cat.is_active !== false ? 'Deactivate' : 'Activate';
    const toggleClass = cat.is_active !== false ? 'btn-outline' : 'btn-primary';

    return `
      <tr>
        <td>
          <div class="admin-product-cell">
            <strong>${escapeHtml(cat.name || 'Untitled category')}</strong>
            <span>${escapeHtml(cat.description || '')}</span>
          </div>
        </td>
        <td>
          <code>${escapeHtml(cat.slug || '—')}</code>
        </td>
        <td>
          <span class="admin-badge" style="font-weight:700;">#${Number(cat.sort_order || 0)}</span>
        </td>
        <td>
          ${countBadge}
        </td>
        <td>
          ${discountDisplay}
        </td>
        <td>
          ${discountStatus}
        </td>
        <td>
          ${status}
        </td>
        <td>
          <div class="admin-table-actions">
            <button
              class="btn btn-outline admin-category-edit"
              type="button"
              data-category-id="${escapeHtml(cat.id)}"
            >
              Edit
            </button>
            <button
              class="btn ${toggleClass} admin-category-toggle"
              type="button"
              data-category-id="${escapeHtml(cat.id)}"
              data-current-active="${cat.is_active !== false}"
            >
              ${toggleLabel}
            </button>
            <button
              class="btn btn-outline admin-category-delete"
              type="button"
              data-category-id="${escapeHtml(cat.id)}"
              title="Delete category"
            >
              Delete
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

async function loadCategories(announce = true) {
  if (announce) setCategoriesStatus('Loading categories…');
  if (categoriesEmpty) categoriesEmpty.hidden = true;
  if (categoriesList) categoriesList.innerHTML = '';

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    console.error('Error loading categories:', error);
    setCategoriesStatus('Unable to load categories. Please try again.', true);
    return;
  }

  setCategoriesStatus();
  categories = data || [];
  populateCategoryDropdowns();
  renderCategories();
}

function openAddCategoryModal() {
  if (!supabase) return;
  addCategoryForm?.reset();
  const maxOrder = categories.reduce((max, c) => Math.max(max, Number(c.sort_order || 0)), 0);
  if (addCategorySortOrder) addCategorySortOrder.value = maxOrder + 1;
  if (addCategoryIsActive) addCategoryIsActive.checked = true;
  if (addCategoryDiscountType) addCategoryDiscountType.value = 'none';
  if (addCategoryDiscountValue) addCategoryDiscountValue.value = '0';
  if (addCategoryDiscountIsActive) addCategoryDiscountIsActive.checked = false;
  updateCategoryDiscountFields(
    addCategoryDiscountType,
    addCategoryDiscountValue,
    addCategoryDiscountValueGroup,
    addCategoryDiscountValueLabel,
    addCategoryDiscountValueHint,
    addCategoryDiscountIsActive,
    addCategoryDiscountActiveGroup
  );

  if (addCategoryStatus) {
    addCategoryStatus.textContent = '';
    addCategoryStatus.classList.remove('is-error');
  }
  if (addCategorySaveBtn) addCategorySaveBtn.disabled = false;

  if (addCategoryModal) {
    addCategoryModal.hidden = false;
    addCategoryModal.setAttribute('aria-hidden', 'false');
  }
  document.body.style.overflow = 'hidden';
  addCategoryName?.focus();
}

function closeAddCategoryModal() {
  if (addCategoryModal) {
    addCategoryModal.hidden = true;
    addCategoryModal.setAttribute('aria-hidden', 'true');
  }
  document.body.style.overflow = '';
  addCategoryForm?.reset();
  if (addCategoryStatus) {
    addCategoryStatus.textContent = '';
    addCategoryStatus.classList.remove('is-error');
  }
}

async function saveNewCategory(event) {
  event.preventDefault();
  if (!supabase) return;

  const name = addCategoryName?.value.trim();
  let slug = (addCategorySlug?.value.trim() || generateCategorySlug(name)).toLowerCase();
  const sortOrder = Number.parseInt(addCategorySortOrder?.value, 10) || 0;
  const description = addCategoryDescription?.value.trim() || null;
  const isActive = Boolean(addCategoryIsActive?.checked);

  const discountType = addCategoryDiscountType?.value || 'none';
  let rawDiscountVal = Number(addCategoryDiscountValue?.value || 0);
  let discountIsActive = Boolean(addCategoryDiscountIsActive?.checked);

  if (!name) {
    if (addCategoryStatus) {
      addCategoryStatus.textContent = 'Please enter a category name.';
      addCategoryStatus.classList.add('is-error');
    }
    addCategoryName?.focus();
    return;
  }

  if (discountType === 'percentage') {
    if (Number.isNaN(rawDiscountVal) || rawDiscountVal < 0 || rawDiscountVal > 100) {
      if (addCategoryStatus) {
        addCategoryStatus.textContent = 'Category discount percentage must be between 0 and 100.';
        addCategoryStatus.classList.add('is-error');
      }
      addCategoryDiscountValue?.focus();
      return;
    }
    rawDiscountVal = Math.round(rawDiscountVal);
  } else if (discountType === 'fixed') {
    if (Number.isNaN(rawDiscountVal) || rawDiscountVal < 0) {
      if (addCategoryStatus) {
        addCategoryStatus.textContent = 'Category fixed discount amount must be 0 or greater.';
        addCategoryStatus.classList.add('is-error');
      }
      addCategoryDiscountValue?.focus();
      return;
    }
    rawDiscountVal = Math.round(rawDiscountVal * 100); // Store in paise
  } else {
    rawDiscountVal = 0;
    discountIsActive = false;
  }

  slug = slug.replace(/[^\w-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  if (!slug) {
    if (addCategoryStatus) {
      addCategoryStatus.textContent = 'Please enter a valid category slug (e.g. hoodies).';
      addCategoryStatus.classList.add('is-error');
    }
    addCategorySlug?.focus();
    return;
  }

  // Check if slug already exists locally
  if (categories.some(c => c.slug.toLowerCase() === slug)) {
    if (addCategoryStatus) {
      addCategoryStatus.textContent = `A category with the slug "${slug}" already exists. Please choose a different slug.`;
      addCategoryStatus.classList.add('is-error');
    }
    addCategorySlug?.focus();
    return;
  }

  if (addCategorySaveBtn) {
    addCategorySaveBtn.disabled = true;
    addCategorySaveBtn.textContent = 'Adding Category…';
  }
  if (addCategoryCancelBtn) addCategoryCancelBtn.disabled = true;
  if (addCategoryStatus) {
    addCategoryStatus.textContent = 'Saving new category…';
    addCategoryStatus.classList.remove('is-error');
  }

  try {
    const { error } = await supabase
      .from('categories')
      .insert({
        name,
        slug,
        sort_order: sortOrder,
        description,
        is_active: isActive,
        discount_type: discountType,
        discount_value: rawDiscountVal,
        discount_is_active: discountIsActive
      });

    if (error) throw error;

    await loadCategories(false);
    closeAddCategoryModal();
    setCategoriesStatus(`Category "${name}" created successfully.`);
  } catch (err) {
    console.error('Error creating category:', err);
    if (addCategoryStatus) {
      addCategoryStatus.textContent = err.message?.includes('duplicate key') || err.message?.includes('unique')
        ? `Slug "${slug}" is already in use. Please choose another slug.`
        : (err.message || 'Unable to create category.');
      addCategoryStatus.classList.add('is-error');
    }
  } finally {
    if (addCategorySaveBtn) {
      addCategorySaveBtn.disabled = false;
      addCategorySaveBtn.textContent = 'Add Category';
    }
    if (addCategoryCancelBtn) addCategoryCancelBtn.disabled = false;
  }
}

function openEditCategory(categoryId) {
  const cat = categories.find(c => c.id === categoryId);
  if (!cat || !supabase) return;

  if (editCategoryId) editCategoryId.value = cat.id;
  if (editCategoryName) editCategoryName.value = cat.name || '';
  if (editCategorySlug) editCategorySlug.value = cat.slug || '';
  if (editCategorySortOrder) editCategorySortOrder.value = Number(cat.sort_order || 0);
  if (editCategoryDescription) editCategoryDescription.value = cat.description || '';
  if (editCategoryIsActive) editCategoryIsActive.checked = Boolean(cat.is_active !== false);

  if (editCategoryDiscountType) editCategoryDiscountType.value = cat.discount_type || 'none';
  if (editCategoryDiscountValue) {
    if (cat.discount_type === 'fixed') {
      editCategoryDiscountValue.value = Math.round((Number(cat.discount_value) || 0) / 100);
    } else if (cat.discount_type === 'percentage') {
      editCategoryDiscountValue.value = Number(cat.discount_value) || 0;
    } else {
      editCategoryDiscountValue.value = 0;
    }
  }
  if (editCategoryDiscountIsActive) editCategoryDiscountIsActive.checked = Boolean(cat.discount_is_active);
  updateCategoryDiscountFields(
    editCategoryDiscountType,
    editCategoryDiscountValue,
    editCategoryDiscountValueGroup,
    editCategoryDiscountValueLabel,
    editCategoryDiscountValueHint,
    editCategoryDiscountIsActive,
    editCategoryDiscountActiveGroup
  );

  if (editCategoryStatus) {
    editCategoryStatus.textContent = '';
    editCategoryStatus.classList.remove('is-error');
  }
  if (editCategorySaveBtn) editCategorySaveBtn.disabled = false;

  if (editCategoryModal) {
    editCategoryModal.hidden = false;
    editCategoryModal.setAttribute('aria-hidden', 'false');
  }
  document.body.style.overflow = 'hidden';
  editCategoryName?.focus();
}

function closeEditCategoryModal() {
  if (editCategoryModal) {
    editCategoryModal.hidden = true;
    editCategoryModal.setAttribute('aria-hidden', 'true');
  }
  document.body.style.overflow = '';
  editCategoryForm?.reset();
  if (editCategoryStatus) {
    editCategoryStatus.textContent = '';
    editCategoryStatus.classList.remove('is-error');
  }
}

async function saveCategoryEdit(event) {
  event.preventDefault();
  if (!supabase) return;

  const categoryId = editCategoryId?.value.trim();
  const name = editCategoryName?.value.trim();
  let slug = (editCategorySlug?.value.trim() || generateCategorySlug(name)).toLowerCase();
  const sortOrder = Number.parseInt(editCategorySortOrder?.value, 10) || 0;
  const description = editCategoryDescription?.value.trim() || null;
  const isActive = Boolean(editCategoryIsActive?.checked);

  const discountType = editCategoryDiscountType?.value || 'none';
  let rawDiscountVal = Number(editCategoryDiscountValue?.value || 0);
  let discountIsActive = Boolean(editCategoryDiscountIsActive?.checked);

  if (!categoryId) return;

  if (!name) {
    if (editCategoryStatus) {
      editCategoryStatus.textContent = 'Please enter a category name.';
      editCategoryStatus.classList.add('is-error');
    }
    editCategoryName?.focus();
    return;
  }

  if (discountType === 'percentage') {
    if (Number.isNaN(rawDiscountVal) || rawDiscountVal < 0 || rawDiscountVal > 100) {
      if (editCategoryStatus) {
        editCategoryStatus.textContent = 'Category discount percentage must be between 0 and 100.';
        editCategoryStatus.classList.add('is-error');
      }
      editCategoryDiscountValue?.focus();
      return;
    }
    rawDiscountVal = Math.round(rawDiscountVal);
  } else if (discountType === 'fixed') {
    if (Number.isNaN(rawDiscountVal) || rawDiscountVal < 0) {
      if (editCategoryStatus) {
        editCategoryStatus.textContent = 'Category fixed discount amount must be 0 or greater.';
        editCategoryStatus.classList.add('is-error');
      }
      editCategoryDiscountValue?.focus();
      return;
    }
    rawDiscountVal = Math.round(rawDiscountVal * 100); // Store in paise
  } else {
    rawDiscountVal = 0;
    discountIsActive = false;
  }

  slug = slug.replace(/[^\w-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  if (!slug) {
    if (editCategoryStatus) {
      editCategoryStatus.textContent = 'Please enter a valid slug.';
      editCategoryStatus.classList.add('is-error');
    }
    editCategorySlug?.focus();
    return;
  }

  // Check unique slug across other categories
  if (categories.some(c => c.id !== categoryId && c.slug.toLowerCase() === slug)) {
    if (editCategoryStatus) {
      editCategoryStatus.textContent = `A category with the slug "${slug}" already exists.`;
      editCategoryStatus.classList.add('is-error');
    }
    editCategorySlug?.focus();
    return;
  }

  if (editCategorySaveBtn) {
    editCategorySaveBtn.disabled = true;
    editCategorySaveBtn.textContent = 'Saving…';
  }
  if (editCategoryCancelBtn) editCategoryCancelBtn.disabled = true;
  if (editCategoryStatus) {
    editCategoryStatus.textContent = 'Saving category changes…';
    editCategoryStatus.classList.remove('is-error');
  }

  try {
    const { error } = await supabase
      .from('categories')
      .update({
        name,
        slug,
        sort_order: sortOrder,
        description,
        is_active: isActive,
        discount_type: discountType,
        discount_value: rawDiscountVal,
        discount_is_active: discountIsActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', categoryId);

    if (error) throw error;

    // Reload categories and products (products table will have been auto-synced by database trigger)
    await loadCategories(false);
    await loadProducts(false);

    closeEditCategoryModal();
    setCategoriesStatus(`Category "${name}" updated successfully.`);
  } catch (err) {
    console.error('Error updating category:', err);
    if (editCategoryStatus) {
      editCategoryStatus.textContent = err.message || 'Unable to save category changes.';
      editCategoryStatus.classList.add('is-error');
    }
  } finally {
    if (editCategorySaveBtn) {
      editCategorySaveBtn.disabled = false;
      editCategorySaveBtn.textContent = 'Save Changes';
    }
    if (editCategoryCancelBtn) editCategoryCancelBtn.disabled = false;
  }
}

async function toggleCategoryActive(categoryId, currentActive) {
  const cat = categories.find(c => c.id === categoryId);
  if (!cat || !supabase) return;

  const nextState = !currentActive;
  const actionLabel = nextState ? 'activate' : 'deactivate';

  setCategoriesStatus(`${nextState ? 'Activating' : 'Deactivating'} category "${cat.name}"…`);

  try {
    const { error } = await supabase
      .from('categories')
      .update({
        is_active: nextState,
        updated_at: new Date().toISOString()
      })
      .eq('id', categoryId);

    if (error) throw error;

    await loadCategories(false);
    setCategoriesStatus(`Category "${cat.name}" was ${nextState ? 'activated' : 'deactivated'} successfully.`);
  } catch (err) {
    console.error(`Error ${actionLabel}ing category:`, err);
    setCategoriesStatus(`Unable to ${actionLabel} category: ${err.message}`, true);
  }
}

async function openDeleteCategoryModal(categoryId) {
  const cat = categories.find(c => c.id === categoryId);
  if (!cat) return;

  categoryPendingDelete = cat;

  // 1. Pre-calculate in-memory assigned products count
  let productCount = calculateProductCountForCategory(cat);

  if (deleteCategoryName) deleteCategoryName.textContent = cat.name || 'Untitled category';
  if (deleteCategorySlug) deleteCategorySlug.innerHTML = `<code>${escapeHtml(cat.slug)}</code>`;
  if (deleteCategoryProductCount) {
    deleteCategoryProductCount.textContent = `${productCount} product${productCount === 1 ? '' : 's'} assigned`;
  }

  if (deleteCategoryStatus) {
    deleteCategoryStatus.textContent = '';
    deleteCategoryStatus.classList.remove('is-error');
  }

  // 2. Set initial UI state based on product count
  function applyModalState(count) {
    if (count > 0) {
      // Deletion is strictly BLOCKED
      if (deleteCategoryModalEyebrow) deleteCategoryModalEyebrow.textContent = 'CANNOT DELETE CATEGORY';
      if (deleteCategoryModalTitle) deleteCategoryModalTitle.textContent = 'Delete Category';
      if (deleteCategoryWarning) {
        deleteCategoryWarning.textContent = 'This category cannot be deleted because products are assigned to it. Reassign the products first.';
        deleteCategoryWarning.className = 'admin-delete-warning is-blocked';
      }
      if (deleteCategoryProductCount) {
        deleteCategoryProductCount.textContent = `${count} product${count === 1 ? '' : 's'} assigned`;
      }
      if (deleteCategoryConfirmBtn) {
        deleteCategoryConfirmBtn.hidden = true;
        deleteCategoryConfirmBtn.disabled = true;
      }
      if (deleteCategoryCancelBtn) {
        deleteCategoryCancelBtn.textContent = 'Close';
        deleteCategoryCancelBtn.disabled = false;
      }
    } else {
      // Empty category: allow permanent deletion with explicit confirmation
      if (deleteCategoryModalEyebrow) deleteCategoryModalEyebrow.textContent = 'DANGER ZONE';
      if (deleteCategoryModalTitle) deleteCategoryModalTitle.textContent = 'Delete Category';
      if (deleteCategoryWarning) {
        deleteCategoryWarning.textContent = `Are you sure you want to permanently delete category "${cat.name}"? This action cannot be undone.`;
        deleteCategoryWarning.className = 'admin-delete-warning';
      }
      if (deleteCategoryProductCount) {
        deleteCategoryProductCount.textContent = '0 products assigned';
      }
      if (deleteCategoryConfirmBtn) {
        deleteCategoryConfirmBtn.hidden = false;
        deleteCategoryConfirmBtn.disabled = false;
        deleteCategoryConfirmBtn.className = 'btn btn-danger';
        deleteCategoryConfirmBtn.textContent = 'Delete Category';
      }
      if (deleteCategoryCancelBtn) {
        deleteCategoryCancelBtn.textContent = 'Cancel';
        deleteCategoryCancelBtn.disabled = false;
      }
    }
  }

  applyModalState(productCount);

  if (deleteCategoryModal) {
    deleteCategoryModal.hidden = false;
    deleteCategoryModal.setAttribute('aria-hidden', 'false');
  }
  document.body.style.overflow = 'hidden';

  // 3. Perform live database verification of assigned products count to ensure real-time consistency
  if (supabase) {
    try {
      const { count, error: countErr } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .or(`category_id.eq.${cat.id},category_slug.eq.${cat.slug},category.eq.${cat.name}`);

      if (!countErr && typeof count === 'number') {
        productCount = count;
        applyModalState(productCount);
      }
    } catch (err) {
      console.warn('Live category product count check failed, fallback to memory count:', err);
    }
  }
}

function closeDeleteCategoryModal() {
  if (deleteCategoryModal) {
    deleteCategoryModal.hidden = true;
    deleteCategoryModal.setAttribute('aria-hidden', 'true');
  }
  document.body.style.overflow = '';
  categoryPendingDelete = null;
  if (deleteCategoryStatus) {
    deleteCategoryStatus.textContent = '';
    deleteCategoryStatus.classList.remove('is-error');
  }
  if (deleteCategoryConfirmBtn) {
    deleteCategoryConfirmBtn.hidden = false;
    deleteCategoryConfirmBtn.disabled = false;
    deleteCategoryConfirmBtn.textContent = 'Delete Category';
  }
  if (deleteCategoryCancelBtn) {
    deleteCategoryCancelBtn.textContent = 'Cancel';
    deleteCategoryCancelBtn.disabled = false;
  }
  if (deleteCategoryWarning) {
    deleteCategoryWarning.className = 'admin-delete-warning';
  }
}

async function confirmDeleteCategory() {
  if (!categoryPendingDelete || !supabase) return;
  const categoryId = categoryPendingDelete.id;
  const categoryName = categoryPendingDelete.name;

  // Extra guard: If confirm button is hidden, deletion is blocked
  if (deleteCategoryConfirmBtn && deleteCategoryConfirmBtn.hidden) return;

  if (deleteCategoryConfirmBtn) {
    deleteCategoryConfirmBtn.disabled = true;
    deleteCategoryConfirmBtn.textContent = 'Deleting…';
  }
  if (deleteCategoryCancelBtn) deleteCategoryCancelBtn.disabled = true;
  if (deleteCategoryStatus) {
    deleteCategoryStatus.textContent = 'Deleting category from database…';
    deleteCategoryStatus.classList.remove('is-error');
  }

  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId);

    if (error) {
      if (error.code === '23503' || error.message?.includes('Cannot delete category') || error.message?.includes('assigned to')) {
        throw new Error('This category cannot be deleted because products are assigned to it. Reassign the products first.');
      }
      throw error;
    }

    // Refresh categories and dropdowns
    await loadCategories(false);
    closeDeleteCategoryModal();
    setCategoriesStatus(`Category "${categoryName}" was deleted successfully.`);
  } catch (err) {
    console.error('Error deleting category:', err);
    if (deleteCategoryStatus) {
      deleteCategoryStatus.textContent = err.message || 'Unable to delete category. Please try again.';
      deleteCategoryStatus.classList.add('is-error');
    }
  } finally {
    if (deleteCategoryConfirmBtn && !deleteCategoryConfirmBtn.hidden) {
      deleteCategoryConfirmBtn.disabled = false;
      deleteCategoryConfirmBtn.textContent = 'Delete Category';
    }
    if (deleteCategoryCancelBtn) deleteCategoryCancelBtn.disabled = false;
  }
}

// -------------------------------------------------------------
// MASTER ATTRIBUTES MANAGEMENT LOGIC & CONTROLLERS (SIZES & COLORS)
// -------------------------------------------------------------

// --- SIZE MANAGEMENT ELEMENTS ---
const addSizeModal = document.getElementById('adminAddSizeModal');
const addSizeForm = document.getElementById('adminAddSizeForm');
const addSizeCloseBtn = document.getElementById('adminAddSizeCloseBtn');
const addSizeCancelBtn = document.getElementById('addSizeCancelBtn');
const addSizeSaveBtn = document.getElementById('addSizeSaveBtn');
const addSizeStatus = document.getElementById('addSizeStatus');

const addSizeName = document.getElementById('addSizeName');
const addSizeCode = document.getElementById('addSizeCode');
const addSizeCategoryType = document.getElementById('addSizeCategoryType');
const addSizeSortOrder = document.getElementById('addSizeSortOrder');
const addSizeIsActive = document.getElementById('addSizeIsActive');

const editSizeModal = document.getElementById('adminEditSizeModal');
const editSizeForm = document.getElementById('adminEditSizeForm');
const editSizeCloseBtn = document.getElementById('editSizeCloseBtn');
const editSizeCancelBtn = document.getElementById('editSizeCancelBtn');
const editSizeSaveBtn = document.getElementById('editSizeSaveBtn');
const editSizeStatus = document.getElementById('editSizeStatus');

const editSizeId = document.getElementById('editSizeId');
const editSizeName = document.getElementById('editSizeName');
const editSizeCode = document.getElementById('editSizeCode');
const editSizeCategoryType = document.getElementById('editSizeCategoryType');
const editSizeSortOrder = document.getElementById('editSizeSortOrder');
const editSizeIsActive = document.getElementById('editSizeIsActive');

// --- COLOR MANAGEMENT ELEMENTS ---
const addColorModal = document.getElementById('adminAddColorModal');
const addColorForm = document.getElementById('adminAddColorForm');
const addColorCloseBtn = document.getElementById('addColorCloseBtn');
const addColorCancelBtn = document.getElementById('addColorCancelBtn');
const addColorSaveBtn = document.getElementById('addColorSaveBtn');
const addColorStatus = document.getElementById('addColorStatus');

const addColorName = document.getElementById('addColorName');
const addColorHex = document.getElementById('addColorHex');
const addColorPicker = document.getElementById('addColorPicker');
const addColorPreview = document.getElementById('addColorPreview');
const addColorSortOrder = document.getElementById('addColorSortOrder');
const addColorIsActive = document.getElementById('addColorIsActive');

const editColorModal = document.getElementById('adminEditColorModal');
const editColorForm = document.getElementById('adminEditColorForm');
const editColorCloseBtn = document.getElementById('editColorCloseBtn');
const editColorCancelBtn = document.getElementById('editColorCancelBtn');
const editColorSaveBtn = document.getElementById('editColorSaveBtn');
const editColorStatus = document.getElementById('editColorStatus');

const editColorId = document.getElementById('editColorId');
const editColorName = document.getElementById('editColorName');
const editColorHex = document.getElementById('editColorHex');
const editColorPicker = document.getElementById('editColorPicker');
const editColorPreview = document.getElementById('editColorPreview');
const editColorSortOrder = document.getElementById('editColorSortOrder');
const editColorIsActive = document.getElementById('editColorIsActive');

// --- DELETE ATTRIBUTE MODAL ELEMENTS ---
const deleteAttributeModal = document.getElementById('adminDeleteAttributeModal');
const deleteAttributeCloseBtn = document.getElementById('deleteAttributeCloseBtn');
const deleteAttributeCancelBtn = document.getElementById('deleteAttributeCancelBtn');
const deleteAttributeConfirmBtn = document.getElementById('deleteAttributeConfirmBtn');
const deleteAttributeStatus = document.getElementById('deleteAttributeStatus');
const deleteAttributeName = document.getElementById('deleteAttributeName');
const deleteAttributeSubtext = document.getElementById('deleteAttributeSubtext');
const deleteAttributeUsageNotice = document.getElementById('deleteAttributeUsageNotice');
const deleteAttributeWarning = document.getElementById('deleteAttributeWarning');
const deleteAttributeModalEyebrow = document.getElementById('deleteAttributeModalEyebrow');
const deleteAttributeModalTitle = document.getElementById('deleteAttributeModalTitle');

let attributePendingDelete = null; // { type: 'size' | 'color', item: object }

// Helper: Auto-suggest code from size name
function generateSizeCode(name) {
  const clean = String(name || '').trim().toUpperCase();
  if (clean === 'SMALL') return 'S';
  if (clean === 'MEDIUM') return 'M';
  if (clean === 'LARGE') return 'L';
  if (clean === 'EXTRA LARGE' || clean === 'XLARGE') return 'XL';
  if (clean === 'EXTRA EXTRA LARGE' || clean === '2XL') return 'XXL';
  if (clean === 'FREE SIZE' || clean === 'FREE') return 'FREE';
  return clean.replace(/[^A-Z0-9-]/g, '').slice(0, 10) || 'SIZE';
}

// Helper: Validate Hex color
function isValidHex(hex) {
  if (!hex) return true; // nullable/optional
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex.trim());
}

// Helper: Normalize Hex color
function normalizeHex(hex, defaultColor = '#000000') {
  if (!hex) return defaultColor;
  let val = hex.trim();
  if (!val.startsWith('#')) val = '#' + val;
  return isValidHex(val) ? val : defaultColor;
}

// --- SIZES CONTROLLER ---
function filteredSizes() {
  const query = (sizesSearch?.value || '').trim().toLowerCase();
  return storeSizes.filter(size => {
    const searchable = [size.name, size.code, size.category_type || ''].join(' ').toLowerCase();
    return !query || searchable.includes(query);
  });
}

function renderSizes() {
  const visible = filteredSizes();

  if (sizesEmpty) sizesEmpty.hidden = visible.length > 0;
  if (!sizesList) return;

  if (!visible.length) {
    sizesList.innerHTML = '';
    return;
  }

  sizesList.innerHTML = visible.map(size => {
    const status = size.is_active !== false
      ? '<span class="admin-badge admin-badge-payment-paid">Active</span>'
      : '<span class="admin-badge admin-badge-payment-failed">Inactive</span>';

    const toggleLabel = size.is_active !== false ? 'Deactivate' : 'Activate';
    const toggleClass = size.is_active !== false ? 'btn-outline' : 'btn-primary';

    return `
      <tr>
        <td>
          <div class="admin-product-cell">
            <strong>${escapeHtml(size.name || 'Untitled size')}</strong>
          </div>
        </td>
        <td>
          <code>${escapeHtml(size.code || '—')}</code>
        </td>
        <td>
          <span class="admin-badge">${escapeHtml(size.category_type || 'apparel')}</span>
        </td>
        <td>
          <span class="admin-badge" style="font-weight:700;">#${Number(size.sort_order || 0)}</span>
        </td>
        <td>
          ${status}
        </td>
        <td>
          <div class="admin-table-actions">
            <button
              class="btn btn-outline admin-size-edit"
              type="button"
              data-size-id="${escapeHtml(size.id)}"
            >
              Edit
            </button>
            <button
              class="btn ${toggleClass} admin-size-toggle"
              type="button"
              data-size-id="${escapeHtml(size.id)}"
              data-current-active="${size.is_active !== false}"
            >
              ${toggleLabel}
            </button>
            <button
              class="btn btn-outline admin-size-delete"
              type="button"
              data-size-id="${escapeHtml(size.id)}"
              title="Delete size"
            >
              Delete
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

async function loadSizes(announce = true) {
  if (announce) setSizesStatus('Loading sizes…');
  if (sizesEmpty) sizesEmpty.hidden = true;
  if (sizesList) sizesList.innerHTML = '';

  const { data, error } = await supabase
    .from('store_sizes')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    console.error('Error loading sizes:', error);
    setSizesStatus('Unable to load sizes. Please try again.', true);
    return;
  }

  setSizesStatus();
  storeSizes = data || [];
  renderSizes();
}

function openAddSizeModal() {
  if (!supabase) return;
  addSizeForm?.reset();
  const maxOrder = storeSizes.reduce((max, s) => Math.max(max, Number(s.sort_order || 0)), 0);
  if (addSizeSortOrder) addSizeSortOrder.value = maxOrder + 1;
  if (addSizeCategoryType) addSizeCategoryType.value = 'apparel';
  if (addSizeIsActive) addSizeIsActive.checked = true;
  if (addSizeStatus) {
    addSizeStatus.textContent = '';
    addSizeStatus.classList.remove('is-error');
  }
  if (addSizeSaveBtn) addSizeSaveBtn.disabled = false;

  if (addSizeModal) {
    addSizeModal.hidden = false;
    addSizeModal.setAttribute('aria-hidden', 'false');
  }
  document.body.style.overflow = 'hidden';
  addSizeName?.focus();
}

function closeAddSizeModal() {
  if (addSizeModal) {
    addSizeModal.hidden = true;
    addSizeModal.setAttribute('aria-hidden', 'true');
  }
  document.body.style.overflow = '';
  addSizeForm?.reset();
  if (addSizeStatus) {
    addSizeStatus.textContent = '';
    addSizeStatus.classList.remove('is-error');
  }
}

async function saveNewSize(event) {
  event.preventDefault();
  if (!supabase) return;

  const name = addSizeName?.value.trim();
  const code = (addSizeCode?.value.trim() || generateSizeCode(name)).toUpperCase();
  const categoryType = addSizeCategoryType?.value || 'apparel';
  const sortOrder = Number.parseInt(addSizeSortOrder?.value, 10) || 0;
  const isActive = Boolean(addSizeIsActive?.checked);

  if (!name) {
    if (addSizeStatus) {
      addSizeStatus.textContent = 'Please enter a size name.';
      addSizeStatus.classList.add('is-error');
    }
    addSizeName?.focus();
    return;
  }

  if (!code) {
    if (addSizeStatus) {
      addSizeStatus.textContent = 'Please enter a unique size code (e.g. M).';
      addSizeStatus.classList.add('is-error');
    }
    addSizeCode?.focus();
    return;
  }

  if (storeSizes.some(s => s.code.toUpperCase() === code)) {
    if (addSizeStatus) {
      addSizeStatus.textContent = `A size with code "${code}" already exists. Please choose a different code.`;
      addSizeStatus.classList.add('is-error');
    }
    addSizeCode?.focus();
    return;
  }

  if (addSizeSaveBtn) {
    addSizeSaveBtn.disabled = true;
    addSizeSaveBtn.textContent = 'Adding Size…';
  }
  if (addSizeCancelBtn) addSizeCancelBtn.disabled = true;
  if (addSizeStatus) {
    addSizeStatus.textContent = 'Saving new size…';
    addSizeStatus.classList.remove('is-error');
  }

  try {
    const { error } = await supabase
      .from('store_sizes')
      .insert({
        name,
        code,
        category_type: categoryType,
        sort_order: sortOrder,
        is_active: isActive
      });

    if (error) throw error;

    await loadSizes(false);
    closeAddSizeModal();
    setSizesStatus(`Size "${name}" (${code}) added successfully.`);
  } catch (err) {
    console.error('Error adding size:', err);
    if (addSizeStatus) {
      addSizeStatus.textContent = err.message || 'Unable to add size.';
      addSizeStatus.classList.add('is-error');
    }
  } finally {
    if (addSizeSaveBtn) {
      addSizeSaveBtn.disabled = false;
      addSizeSaveBtn.textContent = 'Add Size';
    }
    if (addSizeCancelBtn) addSizeCancelBtn.disabled = false;
  }
}

function openEditSize(sizeId) {
  const size = storeSizes.find(s => s.id === sizeId);
  if (!size) return;

  if (editSizeId) editSizeId.value = size.id;
  if (editSizeName) editSizeName.value = size.name || '';
  if (editSizeCode) editSizeCode.value = size.code || '';
  if (editSizeCategoryType) editSizeCategoryType.value = size.category_type || 'apparel';
  if (editSizeSortOrder) editSizeSortOrder.value = size.sort_order ?? 0;
  if (editSizeIsActive) editSizeIsActive.checked = size.is_active !== false;

  if (editSizeStatus) {
    editSizeStatus.textContent = '';
    editSizeStatus.classList.remove('is-error');
  }
  if (editSizeSaveBtn) editSizeSaveBtn.disabled = false;

  if (editSizeModal) {
    editSizeModal.hidden = false;
    editSizeModal.setAttribute('aria-hidden', 'false');
  }
  document.body.style.overflow = 'hidden';
  editSizeName?.focus();
}

function closeEditSizeModal() {
  if (editSizeModal) {
    editSizeModal.hidden = true;
    editSizeModal.setAttribute('aria-hidden', 'true');
  }
  document.body.style.overflow = '';
  editSizeForm?.reset();
  if (editSizeStatus) {
    editSizeStatus.textContent = '';
    editSizeStatus.classList.remove('is-error');
  }
}

async function saveSizeEdit(event) {
  event.preventDefault();
  if (!supabase) return;

  const sizeId = editSizeId?.value;
  const name = editSizeName?.value.trim();
  const code = editSizeCode?.value.trim().toUpperCase();
  const categoryType = editSizeCategoryType?.value || 'apparel';
  const sortOrder = Number.parseInt(editSizeSortOrder?.value, 10) || 0;
  const isActive = Boolean(editSizeIsActive?.checked);

  if (!sizeId || !name) {
    if (editSizeStatus) {
      editSizeStatus.textContent = 'Please enter a size name.';
      editSizeStatus.classList.add('is-error');
    }
    editSizeName?.focus();
    return;
  }

  if (!code) {
    if (editSizeStatus) {
      editSizeStatus.textContent = 'Please enter a size code.';
      editSizeStatus.classList.add('is-error');
    }
    editSizeCode?.focus();
    return;
  }

  if (storeSizes.some(s => s.id !== sizeId && s.code.toUpperCase() === code)) {
    if (editSizeStatus) {
      editSizeStatus.textContent = `A size with code "${code}" already exists.`;
      editSizeStatus.classList.add('is-error');
    }
    editSizeCode?.focus();
    return;
  }

  if (editSizeSaveBtn) {
    editSizeSaveBtn.disabled = true;
    editSizeSaveBtn.textContent = 'Saving…';
  }
  if (editSizeCancelBtn) editSizeCancelBtn.disabled = true;
  if (editSizeStatus) {
    editSizeStatus.textContent = 'Saving size changes…';
    editSizeStatus.classList.remove('is-error');
  }

  try {
    const { error } = await supabase
      .from('store_sizes')
      .update({
        name,
        code,
        category_type: categoryType,
        sort_order: sortOrder,
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', sizeId);

    if (error) throw error;

    await loadSizes(false);
    closeEditSizeModal();
    setSizesStatus(`Size "${name}" updated successfully.`);
  } catch (err) {
    console.error('Error updating size:', err);
    if (editSizeStatus) {
      editSizeStatus.textContent = err.message || 'Unable to save size changes.';
      editSizeStatus.classList.add('is-error');
    }
  } finally {
    if (editSizeSaveBtn) {
      editSizeSaveBtn.disabled = false;
      editSizeSaveBtn.textContent = 'Save Changes';
    }
    if (editSizeCancelBtn) editSizeCancelBtn.disabled = false;
  }
}

async function toggleSizeActive(sizeId, currentActive) {
  const size = storeSizes.find(s => s.id === sizeId);
  if (!size || !supabase) return;

  const nextState = !currentActive;
  const actionLabel = nextState ? 'activate' : 'deactivate';

  setSizesStatus(`${nextState ? 'Activating' : 'Deactivating'} size "${size.name}"…`);

  try {
    const { error } = await supabase
      .from('store_sizes')
      .update({
        is_active: nextState,
        updated_at: new Date().toISOString()
      })
      .eq('id', sizeId);

    if (error) throw error;

    await loadSizes(false);
    setSizesStatus(`Size "${size.name}" was ${nextState ? 'activated' : 'deactivated'} successfully.`);
  } catch (err) {
    console.error(`Error ${actionLabel}ing size:`, err);
    setSizesStatus(`Unable to ${actionLabel} size: ${err.message}`, true);
  }
}

// --- COLORS CONTROLLER ---
function syncColorPickerAndHex(hexInput, pickerInput, previewEl) {
  if (!hexInput || !pickerInput) return;
  const normalized = normalizeHex(hexInput.value);
  pickerInput.value = normalized;
  if (previewEl) previewEl.style.backgroundColor = normalized;
}

function filteredColors() {
  const query = (colorsSearch?.value || '').trim().toLowerCase();
  return storeColors.filter(color => {
    const searchable = [color.name, color.hex_code || ''].join(' ').toLowerCase();
    return !query || searchable.includes(query);
  });
}

function renderColors() {
  const visible = filteredColors();

  if (colorsEmpty) colorsEmpty.hidden = visible.length > 0;
  if (!colorsList) return;

  if (!visible.length) {
    colorsList.innerHTML = '';
    return;
  }

  colorsList.innerHTML = visible.map(color => {
    const status = color.is_active !== false
      ? '<span class="admin-badge admin-badge-payment-paid">Active</span>'
      : '<span class="admin-badge admin-badge-payment-failed">Inactive</span>';

    const toggleLabel = color.is_active !== false ? 'Deactivate' : 'Activate';
    const toggleClass = color.is_active !== false ? 'btn-outline' : 'btn-primary';
    const hex = color.hex_code || '#cccccc';

    return `
      <tr>
        <td>
          <div class="admin-product-cell">
            <strong>${escapeHtml(color.name || 'Untitled color')}</strong>
          </div>
        </td>
        <td>
          <div class="admin-color-swatch-cell">
            <span class="admin-color-swatch" style="background-color: ${escapeHtml(hex)};"></span>
          </div>
        </td>
        <td>
          <code>${escapeHtml(color.hex_code || '—')}</code>
        </td>
        <td>
          <span class="admin-badge" style="font-weight:700;">#${Number(color.sort_order || 0)}</span>
        </td>
        <td>
          ${status}
        </td>
        <td>
          <div class="admin-table-actions">
            <button
              class="btn btn-outline admin-color-edit"
              type="button"
              data-color-id="${escapeHtml(color.id)}"
            >
              Edit
            </button>
            <button
              class="btn ${toggleClass} admin-color-toggle"
              type="button"
              data-color-id="${escapeHtml(color.id)}"
              data-current-active="${color.is_active !== false}"
            >
              ${toggleLabel}
            </button>
            <button
              class="btn btn-outline admin-color-delete"
              type="button"
              data-color-id="${escapeHtml(color.id)}"
              title="Delete color"
            >
              Delete
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

async function loadColors(announce = true) {
  if (announce) setColorsStatus('Loading colors…');
  if (colorsEmpty) colorsEmpty.hidden = true;
  if (colorsList) colorsList.innerHTML = '';

  const { data, error } = await supabase
    .from('store_colors')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    console.error('Error loading colors:', error);
    setColorsStatus('Unable to load colors. Please try again.', true);
    return;
  }

  setColorsStatus();
  storeColors = data || [];
  renderColors();
}

function openAddColorModal() {
  if (!supabase) return;
  addColorForm?.reset();
  const maxOrder = storeColors.reduce((max, c) => Math.max(max, Number(c.sort_order || 0)), 0);
  if (addColorSortOrder) addColorSortOrder.value = maxOrder + 1;
  if (addColorHex) addColorHex.value = '#000000';
  if (addColorPicker) addColorPicker.value = '#000000';
  if (addColorPreview) addColorPreview.style.backgroundColor = '#000000';
  if (addColorIsActive) addColorIsActive.checked = true;
  if (addColorStatus) {
    addColorStatus.textContent = '';
    addColorStatus.classList.remove('is-error');
  }
  if (addColorSaveBtn) addColorSaveBtn.disabled = false;

  if (addColorModal) {
    addColorModal.hidden = false;
    addColorModal.setAttribute('aria-hidden', 'false');
  }
  document.body.style.overflow = 'hidden';
  addColorName?.focus();
}

function closeAddColorModal() {
  if (addColorModal) {
    addColorModal.hidden = true;
    addColorModal.setAttribute('aria-hidden', 'true');
  }
  document.body.style.overflow = '';
  addColorForm?.reset();
  if (addColorStatus) {
    addColorStatus.textContent = '';
    addColorStatus.classList.remove('is-error');
  }
}

async function saveNewColor(event) {
  event.preventDefault();
  if (!supabase) return;

  const name = addColorName?.value.trim();
  let hexCode = addColorHex?.value.trim() || null;
  const sortOrder = Number.parseInt(addColorSortOrder?.value, 10) || 0;
  const isActive = Boolean(addColorIsActive?.checked);

  if (!name) {
    if (addColorStatus) {
      addColorStatus.textContent = 'Please enter a color name.';
      addColorStatus.classList.add('is-error');
    }
    addColorName?.focus();
    return;
  }

  if (hexCode && !hexCode.startsWith('#')) {
    hexCode = '#' + hexCode;
  }

  if (hexCode && !isValidHex(hexCode)) {
    if (addColorStatus) {
      addColorStatus.textContent = 'Please enter a valid hex color code (e.g. #000000 or #FFFFFF).';
      addColorStatus.classList.add('is-error');
    }
    addColorHex?.focus();
    return;
  }

  if (storeColors.some(c => c.name.toLowerCase() === name.toLowerCase())) {
    if (addColorStatus) {
      addColorStatus.textContent = `A color named "${name}" already exists. Please choose a different name.`;
      addColorStatus.classList.add('is-error');
    }
    addColorName?.focus();
    return;
  }

  if (addColorSaveBtn) {
    addColorSaveBtn.disabled = true;
    addColorSaveBtn.textContent = 'Adding Color…';
  }
  if (addColorCancelBtn) addColorCancelBtn.disabled = true;
  if (addColorStatus) {
    addColorStatus.textContent = 'Saving new color…';
    addColorStatus.classList.remove('is-error');
  }

  try {
    const { error } = await supabase
      .from('store_colors')
      .insert({
        name,
        hex_code: hexCode ? hexCode.toUpperCase() : null,
        sort_order: sortOrder,
        is_active: isActive
      });

    if (error) throw error;

    await loadColors(false);
    closeAddColorModal();
    setColorsStatus(`Color "${name}" added successfully.`);
  } catch (err) {
    console.error('Error adding color:', err);
    if (addColorStatus) {
      addColorStatus.textContent = err.message || 'Unable to add color.';
      addColorStatus.classList.add('is-error');
    }
  } finally {
    if (addColorSaveBtn) {
      addColorSaveBtn.disabled = false;
      addColorSaveBtn.textContent = 'Add Color';
    }
    if (addColorCancelBtn) addColorCancelBtn.disabled = false;
  }
}

function openEditColor(colorId) {
  const color = storeColors.find(c => c.id === colorId);
  if (!color) return;

  const hex = color.hex_code || '#000000';

  if (editColorId) editColorId.value = color.id;
  if (editColorName) editColorName.value = color.name || '';
  if (editColorHex) editColorHex.value = color.hex_code || '';
  if (editColorPicker) editColorPicker.value = normalizeHex(hex);
  if (editColorPreview) editColorPreview.style.backgroundColor = normalizeHex(hex);
  if (editColorSortOrder) editColorSortOrder.value = color.sort_order ?? 0;
  if (editColorIsActive) editColorIsActive.checked = color.is_active !== false;

  if (editColorStatus) {
    editColorStatus.textContent = '';
    editColorStatus.classList.remove('is-error');
  }
  if (editColorSaveBtn) editColorSaveBtn.disabled = false;

  if (editColorModal) {
    editColorModal.hidden = false;
    editColorModal.setAttribute('aria-hidden', 'false');
  }
  document.body.style.overflow = 'hidden';
  editColorName?.focus();
}

function closeEditColorModal() {
  if (editColorModal) {
    editColorModal.hidden = true;
    editColorModal.setAttribute('aria-hidden', 'true');
  }
  document.body.style.overflow = '';
  editColorForm?.reset();
  if (editColorStatus) {
    editColorStatus.textContent = '';
    editColorStatus.classList.remove('is-error');
  }
}

async function saveColorEdit(event) {
  event.preventDefault();
  if (!supabase) return;

  const colorId = editColorId?.value;
  const name = editColorName?.value.trim();
  let hexCode = editColorHex?.value.trim() || null;
  const sortOrder = Number.parseInt(editColorSortOrder?.value, 10) || 0;
  const isActive = Boolean(editColorIsActive?.checked);

  if (!colorId || !name) {
    if (editColorStatus) {
      editColorStatus.textContent = 'Please enter a color name.';
      editColorStatus.classList.add('is-error');
    }
    editColorName?.focus();
    return;
  }

  if (hexCode && !hexCode.startsWith('#')) {
    hexCode = '#' + hexCode;
  }

  if (hexCode && !isValidHex(hexCode)) {
    if (editColorStatus) {
      editColorStatus.textContent = 'Please enter a valid hex color code (e.g. #1E3A8A).';
      editColorStatus.classList.add('is-error');
    }
    editColorHex?.focus();
    return;
  }

  if (storeColors.some(c => c.id !== colorId && c.name.toLowerCase() === name.toLowerCase())) {
    if (editColorStatus) {
      editColorStatus.textContent = `A color named "${name}" already exists.`;
      editColorStatus.classList.add('is-error');
    }
    editColorName?.focus();
    return;
  }

  if (editColorSaveBtn) {
    editColorSaveBtn.disabled = true;
    editColorSaveBtn.textContent = 'Saving…';
  }
  if (editColorCancelBtn) editColorCancelBtn.disabled = true;
  if (editColorStatus) {
    editColorStatus.textContent = 'Saving color changes…';
    editColorStatus.classList.remove('is-error');
  }

  try {
    const { error } = await supabase
      .from('store_colors')
      .update({
        name,
        hex_code: hexCode ? hexCode.toUpperCase() : null,
        sort_order: sortOrder,
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', colorId);

    if (error) throw error;

    await loadColors(false);
    closeEditColorModal();
    setColorsStatus(`Color "${name}" updated successfully.`);
  } catch (err) {
    console.error('Error updating color:', err);
    if (editColorStatus) {
      editColorStatus.textContent = err.message || 'Unable to save color changes.';
      editColorStatus.classList.add('is-error');
    }
  } finally {
    if (editColorSaveBtn) {
      editColorSaveBtn.disabled = false;
      editColorSaveBtn.textContent = 'Save Changes';
    }
    if (editColorCancelBtn) editColorCancelBtn.disabled = false;
  }
}

async function toggleColorActive(colorId, currentActive) {
  const color = storeColors.find(c => c.id === colorId);
  if (!color || !supabase) return;

  const nextState = !currentActive;
  const actionLabel = nextState ? 'activate' : 'deactivate';

  setColorsStatus(`${nextState ? 'Activating' : 'Deactivating'} color "${color.name}"…`);

  try {
    const { error } = await supabase
      .from('store_colors')
      .update({
        is_active: nextState,
        updated_at: new Date().toISOString()
      })
      .eq('id', colorId);

    if (error) throw error;

    await loadColors(false);
    setColorsStatus(`Color "${color.name}" was ${nextState ? 'activated' : 'deactivated'} successfully.`);
  } catch (err) {
    console.error(`Error ${actionLabel}ing color:`, err);
    setColorsStatus(`Unable to ${actionLabel} color: ${err.message}`, true);
  }
}

// --- DELETE ATTRIBUTE (SIZE OR COLOR) CONTROLLER ---
function checkAttributeInVariants(type, item) {
  if (!item || !inventory.length) return false;
  const targetName = String(item.name || '').trim().toLowerCase();
  const targetCode = String(item.code || '').trim().toLowerCase();

  return inventory.some(itemRecord => {
    if (type === 'size') {
      const vSize = String(itemRecord.size || '').trim().toLowerCase();
      return vSize && (vSize === targetName || vSize === targetCode);
    }
    if (type === 'color') {
      const vColor = String(itemRecord.color || '').trim().toLowerCase();
      return vColor && vColor === targetName;
    }
    return false;
  });
}

function openDeleteAttributeModal(type, id) {
  const list = type === 'size' ? storeSizes : storeColors;
  const item = list.find(x => x.id === id);
  if (!item) return;

  attributePendingDelete = { type, item };
  const inUse = checkAttributeInVariants(type, item);

  if (deleteAttributeModalEyebrow) deleteAttributeModalEyebrow.textContent = 'DANGER ZONE';
  if (deleteAttributeModalTitle) {
    deleteAttributeModalTitle.textContent = type === 'size' ? 'Delete Size Attribute' : 'Delete Color Attribute';
  }
  if (deleteAttributeWarning) {
    deleteAttributeWarning.textContent = 'This removes the master option from future product configuration. Existing product variants are not changed.';
  }
  if (deleteAttributeName) deleteAttributeName.textContent = item.name || 'Untitled';
  if (deleteAttributeSubtext) {
    deleteAttributeSubtext.innerHTML = type === 'size'
      ? `<code>Code: ${escapeHtml(item.code || '—')}</code>`
      : `<code>Hex: ${escapeHtml(item.hex_code || '—')}</code>`;
  }
  if (deleteAttributeUsageNotice) {
    if (inUse) {
      deleteAttributeUsageNotice.textContent = '⚠️ This value is currently used by existing product variants. Deactivation is recommended instead of deletion.';
    } else {
      deleteAttributeUsageNotice.textContent = '';
    }
  }

  if (deleteAttributeStatus) {
    deleteAttributeStatus.textContent = '';
    deleteAttributeStatus.classList.remove('is-error');
  }
  if (deleteAttributeConfirmBtn) deleteAttributeConfirmBtn.disabled = false;

  if (deleteAttributeModal) {
    deleteAttributeModal.hidden = false;
    deleteAttributeModal.setAttribute('aria-hidden', 'false');
  }
  document.body.style.overflow = 'hidden';
}

function closeDeleteAttributeModal() {
  if (deleteAttributeModal) {
    deleteAttributeModal.hidden = true;
    deleteAttributeModal.setAttribute('aria-hidden', 'true');
  }
  document.body.style.overflow = '';
  attributePendingDelete = null;
  if (deleteAttributeStatus) {
    deleteAttributeStatus.textContent = '';
    deleteAttributeStatus.classList.remove('is-error');
  }
}

async function confirmDeleteAttribute() {
  if (!attributePendingDelete || !supabase) return;
  const { type, item } = attributePendingDelete;
  const table = type === 'size' ? 'store_sizes' : 'store_colors';

  if (deleteAttributeConfirmBtn) {
    deleteAttributeConfirmBtn.disabled = true;
    deleteAttributeConfirmBtn.textContent = 'Deleting…';
  }
  if (deleteAttributeCancelBtn) deleteAttributeCancelBtn.disabled = true;
  if (deleteAttributeStatus) {
    deleteAttributeStatus.textContent = 'Deleting attribute…';
    deleteAttributeStatus.classList.remove('is-error');
  }

  try {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', item.id);

    if (error) throw error;

    if (type === 'size') {
      await loadSizes(false);
      setSizesStatus(`Size "${item.name}" was deleted successfully.`);
    } else {
      await loadColors(false);
      setColorsStatus(`Color "${item.name}" was deleted successfully.`);
    }

    closeDeleteAttributeModal();
  } catch (err) {
    console.error('Error deleting attribute:', err);
    if (deleteAttributeStatus) {
      deleteAttributeStatus.textContent = err.message || 'Unable to delete attribute. Please try again.';
      deleteAttributeStatus.classList.add('is-error');
    }
  } finally {
    if (deleteAttributeConfirmBtn) {
      deleteAttributeConfirmBtn.disabled = false;
      deleteAttributeConfirmBtn.textContent = 'Delete';
    }
    if (deleteAttributeCancelBtn) deleteAttributeCancelBtn.disabled = false;
  }
}

// =============================================================
// COUPON MANAGEMENT FUNCTIONS
// =============================================================

function calculateCouponStatus(coupon) {
  const now = new Date();
  if (!coupon.is_active) {
    return { status: 'inactive', label: 'Inactive', badgeClass: 'admin-badge-payment admin-badge-failed' };
  }
  if (coupon.end_at && new Date(coupon.end_at) < now) {
    return { status: 'expired', label: 'Expired', badgeClass: 'admin-badge-order admin-badge-cancelled' };
  }
  if (coupon.start_at && new Date(coupon.start_at) > now) {
    return { status: 'scheduled', label: 'Scheduled', badgeClass: 'admin-badge-order admin-badge-processing' };
  }
  return { status: 'active', label: 'Active', badgeClass: 'admin-badge-order admin-badge-delivered' };
}

function formatCouponDiscount(coupon) {
  if (coupon.discount_type === 'percentage') {
    const pct = Number(coupon.discount_value) || 0;
    return `<strong>${pct}% OFF</strong>`;
  }
  const rupees = Math.round((Number(coupon.discount_value) || 0) / 100);
  return `<strong>₹${rupees} OFF</strong>`;
}

function formatCouponValidity(startAt, endAt) {
  if (!startAt && !endAt) return '<span style="color:#64748b;">Always valid</span>';
  const formatDT = dt => {
    const d = new Date(dt);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };
  if (startAt && endAt) {
    return `<span>${formatDT(startAt)} → ${formatDT(endAt)}</span>`;
  }
  if (startAt) {
    return `<span>Starts ${formatDT(startAt)}</span>`;
  }
  return `<span>Expires ${formatDT(endAt)}</span>`;
}

function formatCouponUsage(coupon) {
  const count = Number(coupon.usage_count) || 0;
  const limit = coupon.usage_limit;
  if (limit === null || limit === undefined) {
    return `${count} / <span style="color:#64748b;">Unlimited</span>`;
  }
  const isReached = count >= limit;
  return `${count} / ${limit}${isReached ? ' <span class="admin-badge admin-badge-payment admin-badge-failed" style="margin-left:4px;">Limit Reached</span>' : ''}`;
}

function updateCouponDiscountUI(typeSelect, valGroup, valLabel, valHint, maxGroup) {
  const type = typeSelect ? typeSelect.value : 'percentage';
  if (type === 'percentage') {
    if (valLabel) valLabel.textContent = 'Discount Percentage (%) *';
    if (valHint) valHint.textContent = 'Enter a percentage between 0 and 100';
    if (maxGroup) maxGroup.style.display = '';
  } else {
    if (valLabel) valLabel.textContent = 'Discount Amount (₹) *';
    if (valHint) valHint.textContent = 'Enter non-negative rupee amount';
    if (maxGroup) maxGroup.style.display = 'none';
  }
}

async function loadCoupons(announce = true) {
  if (announce) setCouponsStatus('Loading coupons…');
  if (couponsEmpty) couponsEmpty.hidden = true;
  if (couponsList) couponsList.innerHTML = '';

  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error loading coupons:', error);
    setCouponsStatus('Unable to load coupons. Please try again.', true);
    return;
  }

  setCouponsStatus();
  coupons = data || [];
  renderCoupons();
}

function filteredCoupons() {
  const query = (couponsSearch?.value || '').trim().toLowerCase();
  const statusFilter = couponsStatusFilter?.value || 'all';

  return coupons.filter(coupon => {
    const statusObj = calculateCouponStatus(coupon);
    const matchesStatus = statusFilter === 'all' || statusObj.status === statusFilter;
    const searchable = [coupon.code, coupon.description].filter(Boolean).join(' ').toLowerCase();
    const matchesQuery = !query || searchable.includes(query);
    return matchesStatus && matchesQuery;
  });
}

function renderCoupons() {
  const visible = filteredCoupons();
  if (couponsEmpty) couponsEmpty.hidden = visible.length > 0;
  if (!couponsList) return;

  if (!visible.length) {
    couponsList.innerHTML = '';
    return;
  }

  couponsList.innerHTML = visible.map(coupon => {
    const statusObj = calculateCouponStatus(coupon);
    const minOrderText = coupon.minimum_order_paise > 0
      ? `Min ₹${Math.round(coupon.minimum_order_paise / 100)}`
      : '<span style="color:#64748b;">No minimum</span>';

    const maxDiscountText = (coupon.discount_type === 'percentage' && coupon.maximum_discount_paise)
      ? `Max ₹${Math.round(coupon.maximum_discount_paise / 100)}`
      : '<span style="color:#64748b;">No cap</span>';

    return `
      <tr>
        <td>
          <span style="font-family:monospace;font-weight:700;font-size:14px;letter-spacing:0.05em;color:var(--navy,#0f172a);background:var(--cream,#f8fafc);padding:4px 8px;border-radius:4px;border:1px solid var(--line,#cbd5e1);">
            ${escapeHtml(coupon.code)}
          </span>
        </td>
        <td>
          <span style="font-size:13px;color:var(--navy,#0f172a);">${escapeHtml(coupon.description || '—')}</span>
        </td>
        <td>${formatCouponDiscount(coupon)}</td>
        <td>${minOrderText}</td>
        <td>${maxDiscountText}</td>
        <td style="font-size:12px;">${formatCouponValidity(coupon.start_at, coupon.end_at)}</td>
        <td>${formatCouponUsage(coupon)}</td>
        <td>
          <span class="admin-badge ${statusObj.badgeClass}">${statusObj.label}</span>
        </td>
        <td>
          <div class="admin-actions-cell" style="display:flex;gap:6px;flex-wrap:wrap;">
            <button class="btn btn-outline admin-coupon-edit" type="button" data-coupon-id="${escapeHtml(coupon.id)}" style="padding:4px 8px;font-size:12px;">Edit</button>
            <button class="btn btn-outline admin-coupon-toggle" type="button" data-coupon-id="${escapeHtml(coupon.id)}" data-current-active="${coupon.is_active}" style="padding:4px 8px;font-size:12px;">
              ${coupon.is_active ? 'Deactivate' : 'Activate'}
            </button>
            <button class="btn btn-outline admin-coupon-delete" type="button" data-coupon-id="${escapeHtml(coupon.id)}" style="padding:4px 8px;font-size:12px;color:#ef4444;border-color:#fca5a5;">Delete</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function openAddCouponModal() {
  if (!supabase) return;
  addCouponForm?.reset();
  if (addCouponDiscountType) addCouponDiscountType.value = 'percentage';
  if (addCouponDiscountValue) addCouponDiscountValue.value = '0';
  if (addCouponMinimumOrder) addCouponMinimumOrder.value = '0';
  if (addCouponMaxDiscount) addCouponMaxDiscount.value = '';
  if (addCouponStartAt) addCouponStartAt.value = '';
  if (addCouponEndAt) addCouponEndAt.value = '';
  if (addCouponUsageLimit) addCouponUsageLimit.value = '';
  if (addCouponIsActive) addCouponIsActive.checked = true;

  updateCouponDiscountUI(addCouponDiscountType, addCouponDiscountValueGroup, addCouponDiscountValueLabel, addCouponDiscountValueHint, addCouponMaxDiscountGroup);

  if (addCouponStatus) {
    addCouponStatus.textContent = '';
    addCouponStatus.classList.remove('is-error');
  }
  if (addCouponSaveBtn) addCouponSaveBtn.disabled = false;

  if (addCouponModal) {
    addCouponModal.hidden = false;
    addCouponModal.setAttribute('aria-hidden', 'false');
  }
  document.body.style.overflow = 'hidden';
  addCouponCode?.focus();
}

function closeAddCouponModal() {
  if (addCouponModal) {
    addCouponModal.hidden = true;
    addCouponModal.setAttribute('aria-hidden', 'true');
  }
  document.body.style.overflow = '';
  addCouponForm?.reset();
  if (addCouponStatus) {
    addCouponStatus.textContent = '';
    addCouponStatus.classList.remove('is-error');
  }
}

async function saveNewCoupon(event) {
  event.preventDefault();
  if (!supabase) return;

  const rawCode = addCouponCode?.value || '';
  const code = rawCode.trim().toUpperCase();
  const description = addCouponDescription?.value.trim() || null;
  const discountType = addCouponDiscountType?.value || 'percentage';
  const rawDiscountVal = Number(addCouponDiscountValue?.value);
  const minOrderRupees = Number(addCouponMinimumOrder?.value || 0);
  const rawMaxDiscount = addCouponMaxDiscount?.value.trim();
  const startAtVal = addCouponStartAt?.value ? new Date(addCouponStartAt.value).toISOString() : null;
  const endAtVal = addCouponEndAt?.value ? new Date(addCouponEndAt.value).toISOString() : null;
  const rawUsageLimit = addCouponUsageLimit?.value.trim();
  const isActive = Boolean(addCouponIsActive?.checked);

  // Validation
  if (!code) {
    if (addCouponStatus) {
      addCouponStatus.textContent = 'Please enter a coupon code.';
      addCouponStatus.classList.add('is-error');
    }
    addCouponCode?.focus();
    return;
  }

  // Check unique code
  if (coupons.some(c => c.code.toUpperCase() === code)) {
    if (addCouponStatus) {
      addCouponStatus.textContent = `A coupon with code "${code}" already exists. Please choose a different code.`;
      addCouponStatus.classList.add('is-error');
    }
    addCouponCode?.focus();
    return;
  }

  if (discountType === 'percentage') {
    if (!Number.isFinite(rawDiscountVal) || rawDiscountVal < 0 || rawDiscountVal > 100) {
      if (addCouponStatus) {
        addCouponStatus.textContent = 'Percentage discount must be between 0 and 100.';
        addCouponStatus.classList.add('is-error');
      }
      addCouponDiscountValue?.focus();
      return;
    }
  } else if (discountType === 'fixed') {
    if (!Number.isFinite(rawDiscountVal) || rawDiscountVal < 0) {
      if (addCouponStatus) {
        addCouponStatus.textContent = 'Fixed discount amount must be 0 or greater.';
        addCouponStatus.classList.add('is-error');
      }
      addCouponDiscountValue?.focus();
      return;
    }
  }

  if (!Number.isFinite(minOrderRupees) || minOrderRupees < 0) {
    if (addCouponStatus) {
      addCouponStatus.textContent = 'Minimum order amount must be 0 or greater.';
      addCouponStatus.classList.add('is-error');
    }
    addCouponMinimumOrder?.focus();
    return;
  }

  let maxDiscountPaise = null;
  if (discountType === 'percentage' && rawMaxDiscount !== '') {
    const maxVal = Number(rawMaxDiscount);
    if (!Number.isFinite(maxVal) || maxVal < 0) {
      if (addCouponStatus) {
        addCouponStatus.textContent = 'Maximum discount cap must be 0 or greater.';
        addCouponStatus.classList.add('is-error');
      }
      addCouponMaxDiscount?.focus();
      return;
    }
    maxDiscountPaise = Math.round(maxVal * 100);
  }

  if (startAtVal && endAtVal) {
    if (new Date(endAtVal) <= new Date(startAtVal)) {
      if (addCouponStatus) {
        addCouponStatus.textContent = 'Expiry date must be strictly later than the start date.';
        addCouponStatus.classList.add('is-error');
      }
      addCouponEndAt?.focus();
      return;
    }
  }

  let usageLimit = null;
  if (rawUsageLimit !== '') {
    const limitNum = Number.parseInt(rawUsageLimit, 10);
    if (Number.isNaN(limitNum) || limitNum < 0) {
      if (addCouponStatus) {
        addCouponStatus.textContent = 'Usage limit must be a positive integer (or blank for unlimited).';
        addCouponStatus.classList.add('is-error');
      }
      addCouponUsageLimit?.focus();
      return;
    }
    usageLimit = limitNum;
  }

  const discountValuePaiseOrPct = discountType === 'percentage'
    ? Math.round(rawDiscountVal)
    : Math.round(rawDiscountVal * 100);

  const minOrderPaise = Math.round(minOrderRupees * 100);

  if (addCouponSaveBtn) {
    addCouponSaveBtn.disabled = true;
    addCouponSaveBtn.textContent = 'Creating Coupon…';
  }
  if (addCouponCancelBtn) addCouponCancelBtn.disabled = true;
  if (addCouponStatus) {
    addCouponStatus.textContent = 'Saving new coupon…';
    addCouponStatus.classList.remove('is-error');
  }

  try {
    const { error } = await supabase
      .from('coupons')
      .insert({
        code,
        description,
        discount_type: discountType,
        discount_value: discountValuePaiseOrPct,
        minimum_order_paise: minOrderPaise,
        maximum_discount_paise: maxDiscountPaise,
        start_at: startAtVal,
        end_at: endAtVal,
        usage_limit: usageLimit,
        usage_count: 0,
        is_active: isActive
      });

    if (error) throw error;

    await loadCoupons(false);
    closeAddCouponModal();
    setCouponsStatus(`Coupon "${code}" created successfully.`);
  } catch (err) {
    console.error('Error creating coupon:', err);
    if (addCouponStatus) {
      addCouponStatus.textContent = err.message?.includes('duplicate key') || err.message?.includes('unique')
        ? `Coupon code "${code}" is already in use.`
        : (err.message || 'Unable to create coupon.');
      addCouponStatus.classList.add('is-error');
    }
  } finally {
    if (addCouponSaveBtn) {
      addCouponSaveBtn.disabled = false;
      addCouponSaveBtn.textContent = 'Create Coupon';
    }
    if (addCouponCancelBtn) addCouponCancelBtn.disabled = false;
  }
}

function openEditCoupon(couponId) {
  const coupon = coupons.find(c => c.id === couponId);
  if (!coupon || !supabase) return;

  if (editCouponId) editCouponId.value = coupon.id;
  if (editCouponCode) editCouponCode.value = coupon.code;
  if (editCouponDescription) editCouponDescription.value = coupon.description || '';
  if (editCouponDiscountType) editCouponDiscountType.value = coupon.discount_type;

  if (editCouponDiscountValue) {
    if (coupon.discount_type === 'percentage') {
      editCouponDiscountValue.value = Number(coupon.discount_value) || 0;
    } else {
      editCouponDiscountValue.value = Math.round((Number(coupon.discount_value) || 0) / 100);
    }
  }

  if (editCouponMinimumOrder) {
    editCouponMinimumOrder.value = Math.round((Number(coupon.minimum_order_paise) || 0) / 100);
  }

  if (editCouponMaxDiscount) {
    editCouponMaxDiscount.value = coupon.maximum_discount_paise
      ? Math.round(Number(coupon.maximum_discount_paise) / 100)
      : '';
  }

  const toLocalDT = iso => {
    if (!iso) return '';
    const d = new Date(iso);
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().slice(0, 16);
  };

  if (editCouponStartAt) editCouponStartAt.value = toLocalDT(coupon.start_at);
  if (editCouponEndAt) editCouponEndAt.value = toLocalDT(coupon.end_at);
  if (editCouponUsageLimit) editCouponUsageLimit.value = coupon.usage_limit !== null ? coupon.usage_limit : '';
  if (editCouponUsageCount) editCouponUsageCount.value = `${coupon.usage_count} redemptions`;
  if (editCouponIsActive) editCouponIsActive.checked = Boolean(coupon.is_active);

  updateCouponDiscountUI(editCouponDiscountType, editCouponDiscountValueGroup, editCouponDiscountValueLabel, editCouponDiscountValueHint, editCouponMaxDiscountGroup);

  if (editCouponStatus) {
    editCouponStatus.textContent = '';
    editCouponStatus.classList.remove('is-error');
  }
  if (editCouponSaveBtn) editCouponSaveBtn.disabled = false;

  if (editCouponModal) {
    editCouponModal.hidden = false;
    editCouponModal.setAttribute('aria-hidden', 'false');
  }
  document.body.style.overflow = 'hidden';
  editCouponCode?.focus();
}

function closeEditCouponModal() {
  if (editCouponModal) {
    editCouponModal.hidden = true;
    editCouponModal.setAttribute('aria-hidden', 'true');
  }
  document.body.style.overflow = '';
  editCouponForm?.reset();
  if (editCouponStatus) {
    editCouponStatus.textContent = '';
    editCouponStatus.classList.remove('is-error');
  }
}

async function saveCouponEdit(event) {
  event.preventDefault();
  if (!supabase) return;

  const couponId = editCouponId?.value.trim();
  const rawCode = editCouponCode?.value || '';
  const code = rawCode.trim().toUpperCase();
  const description = editCouponDescription?.value.trim() || null;
  const discountType = editCouponDiscountType?.value || 'percentage';
  const rawDiscountVal = Number(editCouponDiscountValue?.value);
  const minOrderRupees = Number(editCouponMinimumOrder?.value || 0);
  const rawMaxDiscount = editCouponMaxDiscount?.value.trim();
  const startAtVal = editCouponStartAt?.value ? new Date(editCouponStartAt.value).toISOString() : null;
  const endAtVal = editCouponEndAt?.value ? new Date(editCouponEndAt.value).toISOString() : null;
  const rawUsageLimit = editCouponUsageLimit?.value.trim();
  const isActive = Boolean(editCouponIsActive?.checked);

  if (!couponId) return;

  if (!code) {
    if (editCouponStatus) {
      editCouponStatus.textContent = 'Please enter a coupon code.';
      editCouponStatus.classList.add('is-error');
    }
    editCouponCode?.focus();
    return;
  }

  // Check unique code against other coupons
  if (coupons.some(c => c.id !== couponId && c.code.toUpperCase() === code)) {
    if (editCouponStatus) {
      editCouponStatus.textContent = `A coupon with code "${code}" already exists.`;
      editCouponStatus.classList.add('is-error');
    }
    editCouponCode?.focus();
    return;
  }

  if (discountType === 'percentage') {
    if (!Number.isFinite(rawDiscountVal) || rawDiscountVal < 0 || rawDiscountVal > 100) {
      if (editCouponStatus) {
        editCouponStatus.textContent = 'Percentage discount must be between 0 and 100.';
        editCouponStatus.classList.add('is-error');
      }
      editCouponDiscountValue?.focus();
      return;
    }
  } else if (discountType === 'fixed') {
    if (!Number.isFinite(rawDiscountVal) || rawDiscountVal < 0) {
      if (editCouponStatus) {
        editCouponStatus.textContent = 'Fixed discount amount must be 0 or greater.';
        editCouponStatus.classList.add('is-error');
      }
      editCouponDiscountValue?.focus();
      return;
    }
  }

  if (!Number.isFinite(minOrderRupees) || minOrderRupees < 0) {
    if (editCouponStatus) {
      editCouponStatus.textContent = 'Minimum order amount must be 0 or greater.';
      editCouponStatus.classList.add('is-error');
    }
    editCouponMinimumOrder?.focus();
    return;
  }

  let maxDiscountPaise = null;
  if (discountType === 'percentage' && rawMaxDiscount !== '') {
    const maxVal = Number(rawMaxDiscount);
    if (!Number.isFinite(maxVal) || maxVal < 0) {
      if (editCouponStatus) {
        editCouponStatus.textContent = 'Maximum discount cap must be 0 or greater.';
        editCouponStatus.classList.add('is-error');
      }
      editCouponMaxDiscount?.focus();
      return;
    }
    maxDiscountPaise = Math.round(maxVal * 100);
  }

  if (startAtVal && endAtVal) {
    if (new Date(endAtVal) <= new Date(startAtVal)) {
      if (editCouponStatus) {
        editCouponStatus.textContent = 'Expiry date must be strictly later than the start date.';
        editCouponStatus.classList.add('is-error');
      }
      editCouponEndAt?.focus();
      return;
    }
  }

  let usageLimit = null;
  if (rawUsageLimit !== '') {
    const limitNum = Number.parseInt(rawUsageLimit, 10);
    if (Number.isNaN(limitNum) || limitNum < 0) {
      if (editCouponStatus) {
        editCouponStatus.textContent = 'Usage limit must be a non-negative integer (or blank for unlimited).';
        editCouponStatus.classList.add('is-error');
      }
      editCouponUsageLimit?.focus();
      return;
    }
    usageLimit = limitNum;
  }

  const discountValuePaiseOrPct = discountType === 'percentage'
    ? Math.round(rawDiscountVal)
    : Math.round(rawDiscountVal * 100);

  const minOrderPaise = Math.round(minOrderRupees * 100);

  if (editCouponSaveBtn) {
    editCouponSaveBtn.disabled = true;
    editCouponSaveBtn.textContent = 'Saving…';
  }
  if (editCouponCancelBtn) editCouponCancelBtn.disabled = true;
  if (editCouponStatus) {
    editCouponStatus.textContent = 'Saving coupon changes…';
    editCouponStatus.classList.remove('is-error');
  }

  try {
    const { error } = await supabase
      .from('coupons')
      .update({
        code,
        description,
        discount_type: discountType,
        discount_value: discountValuePaiseOrPct,
        minimum_order_paise: minOrderPaise,
        maximum_discount_paise: maxDiscountPaise,
        start_at: startAtVal,
        end_at: endAtVal,
        usage_limit: usageLimit,
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', couponId);

    if (error) throw error;

    await loadCoupons(false);
    closeEditCouponModal();
    setCouponsStatus(`Coupon "${code}" updated successfully.`);
  } catch (err) {
    console.error('Error updating coupon:', err);
    if (editCouponStatus) {
      editCouponStatus.textContent = err.message || 'Unable to save coupon changes.';
      editCouponStatus.classList.add('is-error');
    }
  } finally {
    if (editCouponSaveBtn) {
      editCouponSaveBtn.disabled = false;
      editCouponSaveBtn.textContent = 'Save Changes';
    }
    if (editCouponCancelBtn) editCouponCancelBtn.disabled = false;
  }
}

async function toggleCouponActive(couponId, currentActive) {
  const coupon = coupons.find(c => c.id === couponId);
  if (!coupon || !supabase) return;

  const nextState = !currentActive;
  const actionLabel = nextState ? 'activate' : 'deactivate';

  setCouponsStatus(`${nextState ? 'Activating' : 'Deactivating'} coupon "${coupon.code}"…`);

  try {
    const { error } = await supabase
      .from('coupons')
      .update({
        is_active: nextState,
        updated_at: new Date().toISOString()
      })
      .eq('id', couponId);

    if (error) throw error;

    await loadCoupons(false);
    setCouponsStatus(`Coupon "${coupon.code}" was ${nextState ? 'activated' : 'deactivated'} successfully.`);
  } catch (err) {
    console.error(`Error ${actionLabel}ing coupon:`, err);
    setCouponsStatus(`Unable to ${actionLabel} coupon: ${err.message}`, true);
  }
}

async function openDeleteCouponModal(couponId) {
  const coupon = coupons.find(c => c.id === couponId);
  if (!coupon || !supabase) return;

  couponPendingDelete = coupon;

  if (deleteCouponCode) deleteCouponCode.textContent = coupon.code;
  if (deleteCouponDiscountSubtext) {
    deleteCouponDiscountSubtext.innerHTML = `${formatCouponDiscount(coupon)} • Min ₹${Math.round(coupon.minimum_order_paise / 100)}`;
  }

  if (deleteCouponStatus) {
    deleteCouponStatus.textContent = 'Checking usage history…';
    deleteCouponStatus.classList.remove('is-error');
  }

  // Check coupon_usages table for existing order usages
  let usageCount = Number(coupon.usage_count) || 0;
  try {
    const { count, error } = await supabase
      .from('coupon_usages')
      .select('id', { count: 'exact', head: true })
      .eq('coupon_id', couponId);

    if (!error && typeof count === 'number') {
      usageCount = count;
    }
  } catch (e) {
    console.warn('Could not query coupon_usages:', e);
  }

  if (deleteCouponStatus) deleteCouponStatus.textContent = '';

  if (usageCount > 0) {
    couponDeleteMode = 'deactivate';
    if (deleteCouponModalEyebrow) deleteCouponModalEyebrow.textContent = 'IN-USE COUPON GUARD';
    if (deleteCouponModalTitle) deleteCouponModalTitle.textContent = 'Deactivate Coupon';
    if (deleteCouponWarning) {
      deleteCouponWarning.textContent = `This coupon has been redeemed in ${usageCount} order(s). To preserve historical accounting data and order audit logs, coupons with usage history cannot be deleted. You can deactivate it instead to prevent future redemptions.`;
    }
    if (deleteCouponUsageNotice) {
      deleteCouponUsageNotice.textContent = `⚠️ Historical Redemptions: ${usageCount} order(s)`;
    }
    if (deleteCouponConfirmBtn) {
      deleteCouponConfirmBtn.className = 'btn btn-primary';
      deleteCouponConfirmBtn.textContent = 'Deactivate Coupon';
      deleteCouponConfirmBtn.disabled = false;
    }
  } else {
    couponDeleteMode = 'delete';
    if (deleteCouponModalEyebrow) deleteCouponModalEyebrow.textContent = 'DANGER ZONE';
    if (deleteCouponModalTitle) deleteCouponModalTitle.textContent = 'Delete Coupon';
    if (deleteCouponWarning) {
      deleteCouponWarning.textContent = `Are you sure you want to permanently delete coupon "${coupon.code}"? This action cannot be undone.`;
    }
    if (deleteCouponUsageNotice) {
      deleteCouponUsageNotice.textContent = 'No usage records found. Safe to delete.';
    }
    if (deleteCouponConfirmBtn) {
      deleteCouponConfirmBtn.className = 'btn btn-danger';
      deleteCouponConfirmBtn.textContent = 'Delete Coupon';
      deleteCouponConfirmBtn.disabled = false;
    }
  }

  if (deleteCouponModal) {
    deleteCouponModal.hidden = false;
    deleteCouponModal.setAttribute('aria-hidden', 'false');
  }
  document.body.style.overflow = 'hidden';
}

function closeDeleteCouponModal() {
  if (deleteCouponModal) {
    deleteCouponModal.hidden = true;
    deleteCouponModal.setAttribute('aria-hidden', 'true');
  }
  document.body.style.overflow = '';
  couponPendingDelete = null;
  if (deleteCouponStatus) {
    deleteCouponStatus.textContent = '';
    deleteCouponStatus.classList.remove('is-error');
  }
}

async function confirmDeleteCoupon() {
  if (!couponPendingDelete || !supabase) return;
  const coupon = couponPendingDelete;

  if (couponDeleteMode === 'deactivate') {
    closeDeleteCouponModal();
    await toggleCouponActive(coupon.id, true);
    return;
  }

  if (deleteCouponConfirmBtn) {
    deleteCouponConfirmBtn.disabled = true;
    deleteCouponConfirmBtn.textContent = 'Deleting…';
  }
  if (deleteCouponCancelBtn) deleteCouponCancelBtn.disabled = true;
  if (deleteCouponStatus) {
    deleteCouponStatus.textContent = 'Deleting coupon…';
    deleteCouponStatus.classList.remove('is-error');
  }

  try {
    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('id', coupon.id);

    if (error) throw error;

    await loadCoupons(false);
    closeDeleteCouponModal();
    setCouponsStatus(`Coupon "${coupon.code}" was deleted successfully.`);
  } catch (err) {
    console.error('Error deleting coupon:', err);
    if (deleteCouponStatus) {
      deleteCouponStatus.textContent = err.message || 'Unable to delete coupon.';
      deleteCouponStatus.classList.add('is-error');
    }
  } finally {
    if (deleteCouponConfirmBtn) {
      deleteCouponConfirmBtn.disabled = false;
      deleteCouponConfirmBtn.textContent = 'Delete Coupon';
    }
    if (deleteCouponCancelBtn) deleteCouponCancelBtn.disabled = false;
  }
}

// -------------------------------------------------------------
// BANNER MANAGEMENT CONTROLLER
// -------------------------------------------------------------

const BANNER_STORAGE_BUCKET = 'product-images';
const BANNER_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const BANNER_MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB limit

function validateBannerFile(file) {
  if (!file) return { valid: false, error: 'No file provided' };
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  const isAllowed = BANNER_ALLOWED_TYPES.includes(file.type) || ['jpg', 'jpeg', 'png', 'webp'].includes(ext);
  if (!isAllowed) {
    return { valid: false, error: `"${file.name}": Unsupported format. Allowed: JPG, PNG, WEBP.` };
  }
  if (file.size > BANNER_MAX_SIZE_BYTES) {
    return { valid: false, error: `"${file.name}": File size exceeds 5MB limit.` };
  }
  return { valid: true };
}

async function uploadBannerImageFile(file, subfolder = 'desktop') {
  if (!supabase || !file) return null;
  const ext = file.name.split('.').pop()?.toLowerCase() || 'webp';
  const cleanExt = ['jpeg', 'png', 'webp', 'jpg'].includes(ext) ? ext : 'jpg';
  const randomPart = Math.random().toString(36).substring(2, 9);
  const fileName = `${Date.now()}-${randomPart}.${cleanExt}`;
  const filePath = `banners/${subfolder}/${fileName}`;

  const { data, error } = await supabase.storage
    .from(BANNER_STORAGE_BUCKET)
    .upload(filePath, file, {
      contentType: file.type || 'image/jpeg',
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    throw new Error(`Failed to upload ${subfolder} banner photo: ${error.message}`);
  }

  const { data: pubData } = supabase.storage
    .from(BANNER_STORAGE_BUCKET)
    .getPublicUrl(filePath);

  return pubData.publicUrl;
}

function filteredBanners() {
  const query = (bannersSearch?.value || '').trim().toLowerCase();
  const statusFilter = bannersStatusFilter?.value || 'all';

  return banners.filter(banner => {
    // 1. Status Filter
    if (statusFilter === 'active' && !banner.is_active) return false;
    if (statusFilter === 'inactive' && banner.is_active) return false;

    // 2. Text Search Filter (heading, subheading, button_text)
    if (query) {
      const searchable = [
        banner.heading,
        banner.subheading,
        banner.button_text,
        banner.button_link
      ].filter(Boolean).join(' ').toLowerCase();

      if (!searchable.includes(query)) return false;
    }

    return true;
  });
}

function renderBanners() {
  const visibleBanners = filteredBanners();
  if (bannersEmpty) bannersEmpty.hidden = visibleBanners.length > 0;
  if (!bannersList) return;

  bannersList.innerHTML = visibleBanners.map(banner => {
    const desktopImg = banner.desktop_image || 'images/de490593b2c52fd6f19df8b228bb2bc3.jpg';
    const hasMobileImg = Boolean(banner.mobile_image && banner.mobile_image.trim() && banner.mobile_image !== banner.desktop_image);
    const animationType = banner.animation_type || 'slide';
    const autoplayIntervalSec = Math.round((Number(banner.autoplay_interval) || 5000) / 1000);
    const autoplayBadge = banner.autoplay
      ? `<span class="admin-badge admin-badge-active" style="font-size: 10px; margin-top: 3px; display: inline-block;">${autoplayIntervalSec}s Auto</span>`
      : `<span class="admin-badge admin-badge-inactive" style="font-size: 10px; margin-top: 3px; display: inline-block;">Manual</span>`;

    const statusBadgeHtml = banner.is_active
      ? `<span class="admin-badge admin-badge-active">Active</span>`
      : `<span class="admin-badge admin-badge-inactive">Inactive</span>`;

    const kenBurnsBadge = banner.enable_ken_burns
      ? `<span class="admin-badge" style="font-size: 10px; margin-top: 3px; display: inline-block; background: #e0f2fe; color: #0369a1; border-color: #bae6fd;">Ken Burns Zoom</span>`
      : '';

    const badgeLabelHtml = banner.badge_text
      ? `<span class="admin-banner-pill-tag" style="display: inline-block; font-size: 10px; font-weight: 700; color: #ff4103; background: rgba(255,65,3,0.1); border: 1px solid rgba(255,65,3,0.25); border-radius: 4px; padding: 2px 6px; margin-bottom: 4px;">🏷️ ${escapeHtml(banner.badge_text)}</span>`
      : '';

    return `
      <tr data-banner-row-id="${escapeHtml(banner.id)}">
        <td>
          <div class="admin-banner-table-preview">
            <img src="${escapeHtml(desktopImg)}" alt="${escapeHtml(banner.heading || 'Banner')}" loading="lazy" onerror="this.src='images/de490593b2c52fd6f19df8b228bb2bc3.jpg'">
            ${hasMobileImg ? '<span class="admin-banner-mobile-tag" title="Custom mobile image configured">📱 Mobile</span>' : ''}
          </div>
        </td>
        <td>
          ${badgeLabelHtml}
          <strong style="display: block; font-size: 13.5px; color: #0f172a; margin-bottom: 2px;">${escapeHtml(banner.heading || 'Untitled Banner')}</strong>
          <span style="display: block; font-size: 12px; color: #64748b; line-height: 1.35; max-width: 320px;">${escapeHtml(banner.subheading || '—')}</span>
        </td>
        <td>
          <span class="admin-badge admin-badge-payment-method">${escapeHtml(banner.button_text || 'Shop Now')}</span>
          <code style="display: block; font-size: 11px; color: #64748b; margin-top: 3px;">${escapeHtml(banner.button_link || '#shop')}</code>
        </td>
        <td>
          <span class="admin-badge ${animationType === 'fade' ? 'admin-badge-paid' : 'admin-badge-confirmed'}" style="text-transform: uppercase; font-size: 11px;">${escapeHtml(animationType)} Carousel</span>
          ${autoplayBadge}
          ${kenBurnsBadge}
        </td>
        <td>
          <span class="admin-order-badge">#${escapeHtml(banner.display_order ?? 0)}</span>
        </td>
        <td>
          <button type="button" class="admin-status-toggle-btn admin-banner-toggle" data-banner-id="${escapeHtml(banner.id)}" data-current-active="${Boolean(banner.is_active)}" title="Click to ${banner.is_active ? 'deactivate' : 'activate'} banner">
            ${statusBadgeHtml}
          </button>
        </td>
        <td>
          <span style="font-size: 12px; color: #64748b; white-space: nowrap;">${escapeHtml(formatDate(banner.created_at))}</span>
        </td>
        <td>
          <div class="admin-table-actions">
            <button class="btn btn-outline admin-table-btn admin-banner-edit" data-banner-id="${escapeHtml(banner.id)}" type="button" title="Edit banner">
              Edit
            </button>
            <button class="btn btn-danger admin-table-btn admin-banner-delete" data-banner-id="${escapeHtml(banner.id)}" type="button" title="Delete banner">
              Delete
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

async function loadBanners(announce = true) {
  if (announce) setBannersStatus('Loading banners…');
  if (bannersEmpty) bannersEmpty.hidden = true;

  if (!supabase) {
    if (announce) setBannersStatus('Admin configuration missing.', true);
    return;
  }

  try {
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) throw error;

    banners = data || [];
    renderBanners();
    if (announce) setBannersStatus();
  } catch (err) {
    console.error('Error loading banners:', err);
    if (announce) setBannersStatus('Unable to load banners. Please refresh and try again.', true);
  }
}


/**
 * Render colored text HTML string from raw text and element color configuration
 * @param {string} text
 * @param {any} colorsConfig
 * @returns {string}
 */
function renderColoredTextHtml(text, colorsConfig) {
  if (!text) return '';
  const colors = (colorsConfig && typeof colorsConfig === 'object') ? colorsConfig : null;
  const hasFull = Boolean(colors?.full);
  const hasWords = Boolean(colors?.words && Object.keys(colors.words).length > 0);
  const hasLetters = Boolean(colors?.letters && Object.keys(colors.letters).length > 0);

  // Fast-path: No custom colors
  if (!colors || (!hasFull && !hasWords && !hasLetters)) {
    return escapeHtml(text);
  }

  // Fast-path: Only full element color applied
  if (hasFull && !hasWords && !hasLetters) {
    return `<span style="color: ${escapeHtml(colors.full)};">${escapeHtml(text)}</span>`;
  }

  // Map character index to word index
  const charWordMap = new Array(text.length);
  let currentWordIdx = 0;
  let inWord = false;

  for (let i = 0; i < text.length; i++) {
    const isWhitespace = /\s/.test(text[i]);
    if (!isWhitespace) {
      if (!inWord && i > 0 && /\s/.test(text[i - 1])) {
        currentWordIdx++;
      }
      inWord = true;
      charWordMap[i] = currentWordIdx;
    } else {
      inWord = false;
      charWordMap[i] = -1;
    }
  }

  // Resolve color per character
  const charColors = new Array(text.length);
  for (let i = 0; i < text.length; i++) {
    const letterColor = colors.letters?.[i] || colors.letters?.[String(i)];
    if (letterColor) {
      charColors[i] = letterColor;
      continue;
    }
    const wordIdx = charWordMap[i];
    if (wordIdx >= 0) {
      const wordColor = colors.words?.[wordIdx] || colors.words?.[String(wordIdx)];
      if (wordColor) {
        charColors[i] = wordColor;
        continue;
      }
    }
    if (colors.full) {
      charColors[i] = colors.full;
      continue;
    }
    charColors[i] = '';
  }

  // Group adjacent characters with identical colors into spans
  let html = '';
  let currColor = null;
  let currRun = '';

  for (let i = 0; i < text.length; i++) {
    const cColor = charColors[i];
    if (currColor === null) {
      currColor = cColor;
      currRun = text[i];
    } else if (currColor === cColor) {
      currRun += text[i];
    } else {
      if (currColor) {
        html += `<span style="color: ${escapeHtml(currColor)};">${escapeHtml(currRun)}</span>`;
      } else {
        html += escapeHtml(currRun);
      }
      currColor = cColor;
      currRun = text[i];
    }
  }

  if (currRun) {
    if (currColor) {
      html += `<span style="color: ${escapeHtml(currColor)};">${escapeHtml(currRun)}</span>`;
    } else {
      html += escapeHtml(currRun);
    }
  }

  return html;
}

/**
 * Render multiline text with letter, word, and full-text color formatting
 * preserving character indexes across newlines.
 * @param {string} text
 * @param {any} colorsConfig
 * @returns {string[]}
 */
function renderColoredTextLinesHtml(text, colorsConfig) {
  if (!text) return [];
  const colors = (colorsConfig && typeof colorsConfig === 'object') ? colorsConfig : null;
  const hasFull = Boolean(colors?.full);
  const hasWords = Boolean(colors?.words && Object.keys(colors.words).length > 0);
  const hasLetters = Boolean(colors?.letters && Object.keys(colors.letters).length > 0);

  const linesText = text.split('\n');

  if (!colors || (!hasFull && !hasWords && !hasLetters)) {
    return linesText.map(line => escapeHtml(line));
  }

  if (hasFull && !hasWords && !hasLetters) {
    return linesText.map(line => `<span style="color: ${escapeHtml(colors.full)};">${escapeHtml(line)}</span>`);
  }

  const charWordMap = new Array(text.length);
  let currentWordIdx = 0;
  let inWord = false;

  for (let i = 0; i < text.length; i++) {
    const isWhitespace = /\s/.test(text[i]);
    if (!isWhitespace) {
      if (!inWord && i > 0 && /\s/.test(text[i - 1])) {
        currentWordIdx++;
      }
      inWord = true;
      charWordMap[i] = currentWordIdx;
    } else {
      inWord = false;
      charWordMap[i] = -1;
    }
  }

  const charColors = new Array(text.length);
  for (let i = 0; i < text.length; i++) {
    const letterColor = colors.letters?.[i] || colors.letters?.[String(i)];
    if (letterColor) {
      charColors[i] = letterColor;
      continue;
    }
    const wordIdx = charWordMap[i];
    if (wordIdx >= 0) {
      const wordColor = colors.words?.[wordIdx] || colors.words?.[String(wordIdx)];
      if (wordColor) {
        charColors[i] = wordColor;
        continue;
      }
    }
    if (colors.full) {
      charColors[i] = colors.full;
      continue;
    }
    charColors[i] = '';
  }

  const results = [];
  let charIdx = 0;
  for (let l = 0; l < linesText.length; l++) {
    const lineText = linesText[l];
    let lineHtml = '';
    let currColor = null;
    let currRun = '';

    for (let i = 0; i < lineText.length; i++) {
      const cColor = charColors[charIdx + i];
      if (currColor === null) {
        currColor = cColor;
        currRun = lineText[i];
      } else if (currColor === cColor) {
        currRun += lineText[i];
      } else {
        if (currColor) {
          lineHtml += `<span style="color: ${escapeHtml(currColor)};">${escapeHtml(currRun)}</span>`;
        } else {
          lineHtml += escapeHtml(currRun);
        }
        currColor = cColor;
        currRun = lineText[i];
      }
    }

    if (currRun) {
      if (currColor) {
        lineHtml += `<span style="color: ${escapeHtml(currColor)};">${escapeHtml(currRun)}</span>`;
      } else {
        lineHtml += escapeHtml(currRun);
      }
    }

    results.push(lineHtml);
    charIdx += lineText.length + 1; // +1 for newline character
  }

  return results;
}

/**
 * Get animation form configuration from either 'add' or 'edit' modal
 * @param {'add'|'edit'} prefix
 */
function getBannerAnimFormData(prefix) {
  const isAdd = prefix === 'add';
  const state = isAdd ? addBannerState : editBannerState;
  const pos = state.textPositions || {
    badge: { x: 0, y: 0, size_desktop: 'medium', size_tablet: 'medium', size_mobile: 'medium', colors: { full: '', words: {}, letters: {} } },
    heading: { x: 0, y: 0, size_desktop: 'medium', size_tablet: 'medium', size_mobile: 'medium', font_family: '', colors: { full: '', words: {}, letters: {} } },
    subheading: { x: 0, y: 0, size_desktop: 'medium', size_tablet: 'medium', size_mobile: 'medium', font_family: '', colors: { full: '', words: {}, letters: {} } },
    button: { x: 0, y: 0, size_desktop: 'medium', size_tablet: 'medium', size_mobile: 'medium', colors: { full: '', words: {}, letters: {} } }
  };

  const badgeTypeEl = isAdd ? addBannerBadgeAnimType : editBannerBadgeAnimType;
  const badgeDelayEl = isAdd ? addBannerBadgeAnimDelay : editBannerBadgeAnimDelay;
  const badgeDurEl = isAdd ? addBannerBadgeAnimDur : editBannerBadgeAnimDur;

  const headingTypeEl = isAdd ? addBannerHeadingAnimType : editBannerHeadingAnimType;
  const headingDelayEl = isAdd ? addBannerHeadingAnimDelay : editBannerHeadingAnimDelay;
  const headingDurEl = isAdd ? addBannerHeadingAnimDur : editBannerHeadingAnimDur;

  const subTypeEl = isAdd ? addBannerSubheadingAnimType : editBannerSubheadingAnimType;
  const subDelayEl = isAdd ? addBannerSubheadingAnimDelay : editBannerSubheadingAnimDelay;
  const subDurEl = isAdd ? addBannerSubheadingAnimDur : editBannerSubheadingAnimDur;

  const btnTypeEl = isAdd ? addBannerButtonAnimType : editBannerButtonAnimType;
  const btnDelayEl = isAdd ? addBannerButtonAnimDelay : editBannerButtonAnimDelay;
  const btnDurEl = isAdd ? addBannerButtonAnimDur : editBannerButtonAnimDur;

  return {
    badge: {
      type: badgeTypeEl?.value || 'slide_right',
      delay: Math.max(0, parseFloat(badgeDelayEl?.value) || 0.1),
      duration: Math.max(0.05, parseFloat(badgeDurEl?.value) || 0.5),
      x: Number(pos.badge?.x || 0),
      y: Number(pos.badge?.y || 0),
      size_desktop: pos.badge?.size_desktop || 'medium',
      size_tablet: pos.badge?.size_tablet || 'medium',
      size_mobile: pos.badge?.size_mobile || 'medium',
      font_family: String(pos.badge?.font_family || '').trim(),
      colors: pos.badge?.colors || { full: '', words: {}, letters: {} }
    },
    heading: {
      type: headingTypeEl?.value || 'slide_left',
      delay: Math.max(0, parseFloat(headingDelayEl?.value) || 0.2),
      duration: Math.max(0.05, parseFloat(headingDurEl?.value) || 0.7),
      x: Number(pos.heading?.x || 0),
      y: Number(pos.heading?.y || 0),
      size_desktop: pos.heading?.size_desktop || 'medium',
      size_tablet: pos.heading?.size_tablet || 'medium',
      size_mobile: pos.heading?.size_mobile || 'medium',
      font_family: String(pos.heading?.font_family || '').trim(),
      colors: pos.heading?.colors || { full: '', words: {}, letters: {} },
      lines: Array.isArray(pos.heading?.lines) ? pos.heading.lines : null
    },
    subheading: {
      type: subTypeEl?.value || 'slide_up',
      delay: Math.max(0, parseFloat(subDelayEl?.value) || 0.45),
      duration: Math.max(0.05, parseFloat(subDurEl?.value) || 0.6),
      x: Number(pos.subheading?.x || 0),
      y: Number(pos.subheading?.y || 0),
      size_desktop: pos.subheading?.size_desktop || 'medium',
      size_tablet: pos.subheading?.size_tablet || 'medium',
      size_mobile: pos.subheading?.size_mobile || 'medium',
      font_family: String(pos.subheading?.font_family || '').trim(),
      colors: pos.subheading?.colors || { full: '', words: {}, letters: {} },
      lines: Array.isArray(pos.subheading?.lines) ? pos.subheading.lines : null
    },
    button: {
      type: btnTypeEl?.value || 'slide_up',
      delay: Math.max(0, parseFloat(btnDelayEl?.value) || 0.7),
      duration: Math.max(0.05, parseFloat(btnDurEl?.value) || 0.6),
      x: Number(pos.button?.x || 0),
      y: Number(pos.button?.y || 0),
      size_desktop: pos.button?.size_desktop || 'medium',
      size_tablet: pos.button?.size_tablet || 'medium',
      size_mobile: pos.button?.size_mobile || 'medium',
      font_family: String(pos.button?.font_family || '').trim(),
      colors: pos.button?.colors || { full: '', words: {}, letters: {} }
    }
  };
}

/**
 * Populate animation form inputs with configuration or recommended defaults
 * @param {'add'|'edit'} prefix
 * @param {Record<string, any>} [animConfig]
 * @param {Record<string, any>} [positionsConfig]
 */
function setBannerAnimFormData(prefix, animConfig = {}, positionsConfig = null) {
  const isAdd = prefix === 'add';
  const cfg = animConfig || {};
  const state = isAdd ? addBannerState : editBannerState;

  const badge = cfg.badge || {};
  const heading = cfg.heading || {};
  const sub = cfg.subheading || {};
  const btn = cfg.button || {};

  const badgeTypeEl = isAdd ? addBannerBadgeAnimType : editBannerBadgeAnimType;
  const badgeDelayEl = isAdd ? addBannerBadgeAnimDelay : editBannerBadgeAnimDelay;
  const badgeDurEl = isAdd ? addBannerBadgeAnimDur : editBannerBadgeAnimDur;

  const headingTypeEl = isAdd ? addBannerHeadingAnimType : editBannerHeadingAnimType;
  const headingDelayEl = isAdd ? addBannerHeadingAnimDelay : editBannerHeadingAnimDelay;
  const headingDurEl = isAdd ? addBannerHeadingAnimDur : editBannerHeadingAnimDur;

  const subTypeEl = isAdd ? addBannerSubheadingAnimType : editBannerSubheadingAnimType;
  const subDelayEl = isAdd ? addBannerSubheadingAnimDelay : editBannerSubheadingAnimDelay;
  const subDurEl = isAdd ? addBannerSubheadingAnimDur : editBannerSubheadingAnimDur;

  const btnTypeEl = isAdd ? addBannerButtonAnimType : editBannerButtonAnimType;
  const btnDelayEl = isAdd ? addBannerButtonAnimDelay : editBannerButtonAnimDelay;
  const btnDurEl = isAdd ? addBannerButtonAnimDur : editBannerButtonAnimDur;

  if (badgeTypeEl) badgeTypeEl.value = (badge.type || 'slide_right').toLowerCase().replace(/-/g, '_');
  if (badgeDelayEl) badgeDelayEl.value = typeof badge.delay === 'number' ? badge.delay : (parseFloat(badge.delay) || 0.1);
  if (badgeDurEl) badgeDurEl.value = typeof badge.duration === 'number' ? badge.duration : (parseFloat(badge.duration) || 0.5);

  if (headingTypeEl) headingTypeEl.value = (heading.type || 'slide_left').toLowerCase().replace(/-/g, '_');
  if (headingDelayEl) headingDelayEl.value = typeof heading.delay === 'number' ? heading.delay : (parseFloat(heading.delay) || 0.2);
  if (headingDurEl) headingDurEl.value = typeof heading.duration === 'number' ? heading.duration : (parseFloat(heading.duration) || 0.7);

  if (subTypeEl) subTypeEl.value = (sub.type || 'slide_up').toLowerCase().replace(/-/g, '_');
  if (subDelayEl) subDelayEl.value = typeof sub.delay === 'number' ? sub.delay : (parseFloat(sub.delay) || 0.45);
  if (subDurEl) subDurEl.value = typeof sub.duration === 'number' ? sub.duration : (parseFloat(sub.duration) || 0.6);

  if (btnTypeEl) btnTypeEl.value = (btn.type || 'slide_up').toLowerCase().replace(/-/g, '_');
  if (btnDelayEl) btnDelayEl.value = typeof btn.delay === 'number' ? btn.delay : (parseFloat(btn.delay) || 0.7);
  if (btnDurEl) btnDurEl.value = typeof btn.duration === 'number' ? btn.duration : (parseFloat(btn.duration) || 0.6);

  // Sync positions & colors into internal state
  const pos = positionsConfig || {};
  state.textPositions = {
    badge: {
      x: Number(pos.badge?.x ?? badge.x ?? 0),
      y: Number(pos.badge?.y ?? badge.y ?? 0),
      size_desktop: pos.badge?.size_desktop ?? badge.size_desktop ?? 'medium',
      size_tablet: pos.badge?.size_tablet ?? badge.size_tablet ?? 'medium',
      size_mobile: pos.badge?.size_mobile ?? badge.size_mobile ?? 'medium',
      font_family: String(pos.badge?.font_family ?? badge.font_family ?? '').trim(),
      colors: pos.badge?.colors || badge.colors || { full: '', words: {}, letters: {} }
    },
    heading: {
      x: Number(pos.heading?.x ?? heading.x ?? 0),
      y: Number(pos.heading?.y ?? heading.y ?? 0),
      size_desktop: pos.heading?.size_desktop ?? heading.size_desktop ?? 'medium',
      size_tablet: pos.heading?.size_tablet ?? heading.size_tablet ?? 'medium',
      size_mobile: pos.heading?.size_mobile ?? heading.size_mobile ?? 'medium',
      font_family: String(pos.heading?.font_family ?? heading.font_family ?? '').trim(),
      colors: pos.heading?.colors || heading.colors || { full: '', words: {}, letters: {} },
      lines: pos.heading?.lines || heading.lines || null
    },
    subheading: {
      x: Number(pos.subheading?.x ?? sub.x ?? 0),
      y: Number(pos.subheading?.y ?? sub.y ?? 0),
      size_desktop: pos.subheading?.size_desktop ?? sub.size_desktop ?? 'medium',
      size_tablet: pos.subheading?.size_tablet ?? sub.size_tablet ?? 'medium',
      size_mobile: pos.subheading?.size_mobile ?? sub.size_mobile ?? 'medium',
      font_family: String(pos.subheading?.font_family ?? sub.font_family ?? '').trim(),
      colors: pos.subheading?.colors || sub.colors || { full: '', words: {}, letters: {} },
      lines: pos.subheading?.lines || sub.lines || null
    },
    button: {
      x: Number(pos.button?.x ?? btn.x ?? 0),
      y: Number(pos.button?.y ?? btn.y ?? 0),
      size_desktop: pos.button?.size_desktop ?? btn.size_desktop ?? 'medium',
      size_tablet: pos.button?.size_tablet ?? btn.size_tablet ?? 'medium',
      size_mobile: pos.button?.size_mobile ?? btn.size_mobile ?? 'medium',
      font_family: String(pos.button?.font_family ?? btn.font_family ?? '').trim(),
      colors: pos.button?.colors || btn.colors || { full: '', words: {}, letters: {} }
    }
  };
}

// -------------------------------------------------------------
// VISUAL BANNER TEXT CUSTOMIZATION CONTROLLER
// -------------------------------------------------------------

const BANNER_FONTS = {
  '': { name: 'Default (Brand Font)', stack: '' },
  'Rajdhani': { name: 'Rajdhani', stack: "'Rajdhani', sans-serif" },
  'Comfortaa': { name: 'Comfortaa', stack: "'Comfortaa', cursive, sans-serif" },
  'Bungee': { name: 'Bungee', stack: "'Bungee', cursive, sans-serif" },
  'Orbitron': { name: 'Orbitron', stack: "'Orbitron', sans-serif" },
  'Lora': { name: 'Lora', stack: "'Lora', serif" },
  'Barlow Condensed': { name: 'Barlow Condensed', stack: "'Barlow Condensed', sans-serif" },
  'Electrolize': { name: 'Electrolize', stack: "'Electrolize', sans-serif" },
  'Montserrat Subrayada': { name: 'Montserrat Subrayada', stack: "'Montserrat Subrayada', sans-serif" },
  'Spectral': { name: 'Spectral', stack: "'Spectral', serif" },
  'Yanone Kaffeesatz': { name: 'Yanone Kaffeesatz', stack: "'Yanone Kaffeesatz', sans-serif" },
  'Red Hat Mono': { name: 'Red Hat Mono', stack: "'Red Hat Mono', monospace" },
  'Bebas Neue': { name: 'Bebas Neue', stack: "'Bebas Neue', sans-serif" },
  'Oswald': { name: 'Oswald', stack: "'Oswald', sans-serif" },
  'Anton': { name: 'Anton', stack: "'Anton', sans-serif" },
  'Archivo Black': { name: 'Archivo Black', stack: "'Archivo Black', sans-serif" },
  'Space Grotesk': { name: 'Space Grotesk', stack: "'Space Grotesk', sans-serif" },
  'DM Sans': { name: 'DM Sans', stack: "'DM Sans', sans-serif" },
  'Playfair Display': { name: 'Playfair Display', stack: "'Playfair Display', serif" },
  'Cursive': { name: 'Cursive', stack: "'Pacifico', cursive, sans-serif" },
  'Permanent Marker': { name: 'Permanent Marker', stack: "'Permanent Marker', cursive, sans-serif" }
};

let currentCustModalMode = 'add';
let currentCustView = 'desktop';

const TEXT_SIZES = ['xxsmall', 'xsmall', 'small', 'medium', 'large', 'xlarge', 'xxlarge'];
const TEXT_SIZE_LABELS = {
  xxsmall: 'XX-Small',
  xsmall: 'X-Small',
  small: 'Small',
  medium: 'Normal',
  large: 'Large',
  xlarge: 'X-Large',
  xxlarge: 'XX-Large'
};
const TEXT_SIZE_SCALES = {
  xxsmall: 0.6,
  xsmall: 0.7,
  small: 0.8,
  medium: 1.0,
  large: 1.2,
  xlarge: 1.4,
  xxlarge: 1.6
};

let tempCustPositions = {
  badge: { x: 0, y: 0, size_desktop: 'medium', size_tablet: 'medium', size_mobile: 'medium', font_family: '', colors: { full: '', words: {}, letters: {} } },
  heading: { x: 0, y: 0, size_desktop: 'medium', size_tablet: 'medium', size_mobile: 'medium', font_family: '', colors: { full: '', words: {}, letters: {} } },
  subheading: { x: 0, y: 0, size_desktop: 'medium', size_tablet: 'medium', size_mobile: 'medium', font_family: '', colors: { full: '', words: {}, letters: {} } },
  button: { x: 0, y: 0, size_desktop: 'medium', size_tablet: 'medium', size_mobile: 'medium', font_family: '', colors: { full: '', words: {}, letters: {} } }
};
let selectedCustElement = 'badge';
let isDraggingCustElement = false;
let dragStartX = 0;
let dragStartY = 0;
let elemStartPosX = 0;
let elemStartPosY = 0;

let selectedCustColorScope = 'full'; // 'full' | 'word' | 'letter'
let selectedCustTokenIndices = new Set(); // Indices of active selected token chips
let selectedCustLineIndex = null;


function getCustElementRawText(elementKey) {
  const isAdd = currentCustModalMode === 'add';
  const badgeInput = isAdd ? addBannerBadgeText : editBannerBadgeText;
  const headingInput = isAdd ? addBannerHeading : editBannerHeading;
  const subInput = isAdd ? addBannerSubheading : editBannerSubheading;
  const btnInput = isAdd ? addBannerButtonText : editBannerButtonText;

  switch (elementKey) {
    case 'badge':
      return badgeInput?.value?.trim() || (isAdd ? '' : (editBannerState.badge_text || '')) || "NASHIK-BORN • SS'26 DROP";
    case 'heading':
      return headingInput?.value?.trim() || (isAdd ? '' : (editBannerState.heading || '')) || "WEAR THE STREET. OWN THE FIT.";
    case 'subheading':
      return subInput?.value?.trim() || (isAdd ? '' : (editBannerState.subheading || '')) || "Streetwear cut for people who move — oversized tees, boxy shirts, straight denim.";
    case 'button':
      return btnInput?.value?.trim() || (isAdd ? '' : (editBannerState.button_text || '')) || "Shop The Drop";
    default:
      return '';
  }
}

function refreshCustCanvasPositions() {
  const badgeText = getCustElementRawText('badge');
  const headingText = getCustElementRawText('heading');
  const subText = getCustElementRawText('subheading');
  const btnText = getCustElementRawText('button');

  if (textCustStageBadgeWrap && textCustStageBadge) {
    textCustStageBadgeWrap.style.setProperty('--pos-x', `${tempCustPositions.badge.x}px`);
    textCustStageBadgeWrap.style.setProperty('--pos-x-val', `${tempCustPositions.badge.x}`);
    textCustStageBadgeWrap.style.setProperty('--pos-y', `${tempCustPositions.badge.y}px`);
    textCustStageBadgeWrap.style.setProperty('--pos-y-val', `${tempCustPositions.badge.y}`);
    textCustStageBadgeWrap.style.setProperty('--scale-desktop', TEXT_SIZE_SCALES[tempCustPositions.badge.size_desktop || 'medium']);
    textCustStageBadgeWrap.style.setProperty('--scale-tablet', TEXT_SIZE_SCALES[tempCustPositions.badge.size_tablet || 'medium']);
    textCustStageBadgeWrap.style.setProperty('--scale-mobile', TEXT_SIZE_SCALES[tempCustPositions.badge.size_mobile || 'medium']);

    const badgeFont = BANNER_FONTS[tempCustPositions.badge.font_family]?.stack || '';
    if (badgeFont) {
      textCustStageBadgeWrap.style.setProperty('--element-font', badgeFont);
      textCustStageBadge.style.setProperty('--element-font', badgeFont);
      textCustStageBadge.style.fontFamily = badgeFont;
    } else {
      textCustStageBadgeWrap.style.removeProperty('--element-font');
      textCustStageBadge.style.removeProperty('--element-font');
      textCustStageBadge.style.fontFamily = '';
    }
    textCustStageBadge.innerHTML = renderColoredTextHtml(badgeText, tempCustPositions.badge.colors);
  }
  if (textCustStageHeading) {
    textCustStageHeading.style.setProperty('--scale-desktop', TEXT_SIZE_SCALES[tempCustPositions.heading.size_desktop || 'medium']);
    textCustStageHeading.style.setProperty('--scale-tablet', TEXT_SIZE_SCALES[tempCustPositions.heading.size_tablet || 'medium']);
    textCustStageHeading.style.setProperty('--scale-mobile', TEXT_SIZE_SCALES[tempCustPositions.heading.size_mobile || 'medium']);

    const headingFont = BANNER_FONTS[tempCustPositions.heading.font_family]?.stack || '';
    if (headingFont) {
      textCustStageHeading.style.setProperty('--element-font', headingFont);
      textCustStageHeading.style.fontFamily = headingFont;
    } else {
      textCustStageHeading.style.removeProperty('--element-font');
      textCustStageHeading.style.fontFamily = '';
    }

    const headingTextLines = headingText.split('\n');
    if (headingTextLines.length > 1) {
      textCustStageHeading.style.setProperty('--pos-x', '0px');
      textCustStageHeading.style.setProperty('--pos-x-val', '0');
      textCustStageHeading.style.setProperty('--pos-y', '0px');
      textCustStageHeading.style.setProperty('--pos-y-val', '0');

      if (!tempCustPositions.heading.lines) {
        tempCustPositions.heading.lines = [];
      }
      const coloredLines = renderColoredTextLinesHtml(headingText, tempCustPositions.heading.colors);
      let headingHtml = '';
      for (let i = 0; i < headingTextLines.length; i++) {
        if (!tempCustPositions.heading.lines[i]) {
          tempCustPositions.heading.lines[i] = {
            x: i === 0 ? (tempCustPositions.heading.x || 0) : 0,
            y: i === 0 ? (tempCustPositions.heading.y || 0) : 0
          };
        }
        const lineX = tempCustPositions.heading.lines[i].x || 0;
        const lineY = tempCustPositions.heading.lines[i].y || 0;
        const isSelectedLine = (selectedCustElement === 'heading' && selectedCustLineIndex === i);
        const isDraggingLine = Boolean(isDraggingCustElement && isSelectedLine);
        headingHtml += `<span class="banner-line-el${isSelectedLine ? ' is-selected-line' : ''}${isDraggingLine ? ' is-dragging' : ''}" data-line-index="${i}" style="position: relative; --pos-x: ${lineX}px; --pos-x-val: ${lineX}; --pos-y: ${lineY}px; --pos-y-val: ${lineY}; cursor: move; white-space: nowrap;">${coloredLines[i]}</span>`;
      }
      textCustStageHeading.innerHTML = headingHtml;
    } else {
      textCustStageHeading.style.setProperty('--pos-x', `${tempCustPositions.heading.x}px`);
      textCustStageHeading.style.setProperty('--pos-x-val', `${tempCustPositions.heading.x}`);
      textCustStageHeading.style.setProperty('--pos-y', `${tempCustPositions.heading.y}px`);
      textCustStageHeading.style.setProperty('--pos-y-val', `${tempCustPositions.heading.y}`);
      textCustStageHeading.innerHTML = renderColoredTextHtml(headingText, tempCustPositions.heading.colors);
    }
  }
  if (textCustStageSubheading) {
    textCustStageSubheading.style.setProperty('--scale-desktop', TEXT_SIZE_SCALES[tempCustPositions.subheading.size_desktop || 'medium']);
    textCustStageSubheading.style.setProperty('--scale-tablet', TEXT_SIZE_SCALES[tempCustPositions.subheading.size_tablet || 'medium']);
    textCustStageSubheading.style.setProperty('--scale-mobile', TEXT_SIZE_SCALES[tempCustPositions.subheading.size_mobile || 'medium']);

    const subFont = BANNER_FONTS[tempCustPositions.subheading.font_family]?.stack || '';
    if (subFont) {
      textCustStageSubheading.style.setProperty('--element-font', subFont);
      textCustStageSubheading.style.fontFamily = subFont;
    } else {
      textCustStageSubheading.style.removeProperty('--element-font');
      textCustStageSubheading.style.fontFamily = '';
    }

    const subTextLines = subText.split('\n');
    if (subTextLines.length > 1) {
      textCustStageSubheading.style.setProperty('--pos-x', '0px');
      textCustStageSubheading.style.setProperty('--pos-x-val', '0');
      textCustStageSubheading.style.setProperty('--pos-y', '0px');
      textCustStageSubheading.style.setProperty('--pos-y-val', '0');

      if (!tempCustPositions.subheading.lines) {
        tempCustPositions.subheading.lines = [];
      }
      const coloredLines = renderColoredTextLinesHtml(subText, tempCustPositions.subheading.colors);
      let subHtml = '';
      for (let i = 0; i < subTextLines.length; i++) {
        if (!tempCustPositions.subheading.lines[i]) {
          tempCustPositions.subheading.lines[i] = {
            x: i === 0 ? (tempCustPositions.subheading.x || 0) : 0,
            y: i === 0 ? (tempCustPositions.subheading.y || 0) : 0
          };
        }
        const lineX = tempCustPositions.subheading.lines[i].x || 0;
        const lineY = tempCustPositions.subheading.lines[i].y || 0;
        const isSelectedLine = (selectedCustElement === 'subheading' && selectedCustLineIndex === i);
        const isDraggingLine = Boolean(isDraggingCustElement && isSelectedLine);
        subHtml += `<span class="banner-line-el${isSelectedLine ? ' is-selected-line' : ''}${isDraggingLine ? ' is-dragging' : ''}" data-line-index="${i}" style="position: relative; --pos-x: ${lineX}px; --pos-x-val: ${lineX}; --pos-y: ${lineY}px; --pos-y-val: ${lineY}; cursor: move; white-space: nowrap;">${coloredLines[i]}</span>`;
      }
      textCustStageSubheading.innerHTML = subHtml;
    } else {
      textCustStageSubheading.style.setProperty('--pos-x', `${tempCustPositions.subheading.x}px`);
      textCustStageSubheading.style.setProperty('--pos-x-val', `${tempCustPositions.subheading.x}`);
      textCustStageSubheading.style.setProperty('--pos-y', `${tempCustPositions.subheading.y}px`);
      textCustStageSubheading.style.setProperty('--pos-y-val', `${tempCustPositions.subheading.y}`);
      textCustStageSubheading.innerHTML = renderColoredTextHtml(subText, tempCustPositions.subheading.colors);
    }
  }
  if (textCustStageCta && textCustStageBtn) {
    textCustStageCta.style.setProperty('--pos-x', `${tempCustPositions.button.x}px`);
    textCustStageCta.style.setProperty('--pos-x-val', `${tempCustPositions.button.x}`);
    textCustStageCta.style.setProperty('--pos-y', `${tempCustPositions.button.y}px`);
    textCustStageCta.style.setProperty('--pos-y-val', `${tempCustPositions.button.y}`);
    textCustStageCta.style.setProperty('--scale-desktop', TEXT_SIZE_SCALES[tempCustPositions.button.size_desktop || 'medium']);
    textCustStageCta.style.setProperty('--scale-tablet', TEXT_SIZE_SCALES[tempCustPositions.button.size_tablet || 'medium']);
    textCustStageCta.style.setProperty('--scale-mobile', TEXT_SIZE_SCALES[tempCustPositions.button.size_mobile || 'medium']);

    const btnFont = BANNER_FONTS[tempCustPositions.button.font_family]?.stack || '';
    if (btnFont) {
      textCustStageCta.style.setProperty('--element-font', btnFont);
      textCustStageBtn.style.setProperty('--element-font', btnFont);
      textCustStageBtn.style.fontFamily = btnFont;
    } else {
      textCustStageCta.style.removeProperty('--element-font');
      textCustStageBtn.style.removeProperty('--element-font');
      textCustStageBtn.style.fontFamily = '';
    }
    textCustStageBtn.innerHTML = renderColoredTextHtml(btnText, tempCustPositions.button.colors);
  }
}

function refreshCustFontUi() {
  if (!textCustFontSelect) return;
  const elementKey = selectedCustElement;
  const fontVal = tempCustPositions[elementKey]?.font_family || '';
  textCustFontSelect.value = fontVal;
}

function refreshCustSizeUi() {
  if (!textCustSizeValue) return;
  const elementKey = selectedCustElement;
  const viewKey = currentCustView;
  const sizeKey = tempCustPositions[elementKey]?.[`size_${viewKey}`] || 'medium';
  textCustSizeValue.textContent = TEXT_SIZE_LABELS[sizeKey] || 'Normal';
}

function adjustSelectedCustElementSize(delta) {
  const elementKey = selectedCustElement;
  const viewKey = currentCustView;
  const sizeProp = `size_${viewKey}`;
  const currentSize = tempCustPositions[elementKey]?.[sizeProp] || 'medium';
  let currentIndex = TEXT_SIZES.indexOf(currentSize);
  if (currentIndex === -1) currentIndex = TEXT_SIZES.indexOf('medium'); // fallback to Normal/medium

  const newIndex = currentIndex + delta;
  if (newIndex >= 0 && newIndex < TEXT_SIZES.length) {
    const newSize = TEXT_SIZES[newIndex];
    if (tempCustPositions[elementKey]) {
      tempCustPositions[elementKey][sizeProp] = newSize;
      refreshCustCanvasPositions();
      refreshCustSizeUi();
    }
  }
}

function highlightActiveColorSwatch(color) {
  let matchedSwatch = false;
  document.querySelectorAll('#textCustColorPalette .admin-color-swatch:not(.is-custom-picker), #textCustExtendedPalette .admin-color-swatch').forEach(sw => {
    const swColor = sw.dataset.color || '';
    const isActive = color ? swColor.toLowerCase() === color.toLowerCase() : swColor === '';
    sw.classList.toggle('is-active', isActive);
    if (isActive && swColor) matchedSwatch = true;
  });

  // If custom color is active and not matched in standard swatches, highlight custom picker trigger
  if (textCustCustomPickerTrigger) {
    const isCustomActive = Boolean(color && !matchedSwatch);
    textCustCustomPickerTrigger.classList.toggle('is-active', isCustomActive);
  }

  // Sync custom input fields
  if (color) {
    const cleanHex = color.startsWith('#') ? color.toUpperCase() : `#${color.toUpperCase()}`;
    if (textCustHexInput && document.activeElement !== textCustHexInput) {
      textCustHexInput.value = cleanHex;
    }
    if (textCustCustomPreview) {
      textCustCustomPreview.style.background = cleanHex;
    }
    if (textCustNativeColorInput && /^#[0-9A-F]{6}$/i.test(cleanHex)) {
      textCustNativeColorInput.value = cleanHex;
    }
  }
}

function renderCustTokens() {
  if (!textCustTokenBar || !textCustTokenChips || !textCustTokenLabel) return;

  if (selectedCustColorScope === 'full') {
    textCustTokenBar.hidden = true;
    selectedCustTokenIndices.clear();
    const curElemColors = tempCustPositions[selectedCustElement]?.colors || {};
    highlightActiveColorSwatch(curElemColors.full || '');
    return;
  }

  textCustTokenBar.hidden = false;
  const text = getCustElementRawText(selectedCustElement);
  const curColors = tempCustPositions[selectedCustElement]?.colors || { full: '', words: {}, letters: {} };

  if (selectedCustColorScope === 'word') {
    textCustTokenLabel.textContent = `Select Word(s) in "${selectedCustElement.toUpperCase()}":`;

    // Extract words with non-whitespace regex while preserving indices
    const wordMatches = [];
    const regex = /\S+/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
      wordMatches.push({ word: match[0], index: wordMatches.length });
    }

    textCustTokenChips.innerHTML = wordMatches.map(({ word, index }) => {
      const wordColor = curColors.words?.[index] || curColors.words?.[String(index)] || '';
      const isSelected = selectedCustTokenIndices.has(index);
      const dotHtml = wordColor ? `<span class="admin-token-color-dot" style="background:${wordColor};"></span>` : '';
      return `<button type="button" class="admin-token-chip ${isSelected ? 'is-active' : ''} ${wordColor ? 'has-color' : ''}" data-token-type="word" data-index="${index}" title="Word #${index + 1}: ${escapeHtml(word)}">${dotHtml}${escapeHtml(word)}</button>`;
    }).join('');

    if (selectedCustTokenIndices.size === 1) {
      const singleIdx = Array.from(selectedCustTokenIndices)[0];
      const singleColor = curColors.words?.[singleIdx] || curColors.words?.[String(singleIdx)] || '';
      highlightActiveColorSwatch(singleColor);
    } else {
      highlightActiveColorSwatch(null);
    }
  } else if (selectedCustColorScope === 'letter') {
    textCustTokenLabel.textContent = `Select Letter(s) in "${selectedCustElement.toUpperCase()}":`;

    textCustTokenChips.innerHTML = Array.from(text).map((char, index) => {
      if (char === ' ') {
        return `<span style="display:inline-block; width:8px;" title="Space"></span>`;
      }
      const letterColor = curColors.letters?.[index] || curColors.letters?.[String(index)] || '';
      const isSelected = selectedCustTokenIndices.has(index);
      const dotHtml = letterColor ? `<span class="admin-token-color-dot" style="background:${letterColor};"></span>` : '';
      return `<button type="button" class="admin-token-chip ${isSelected ? 'is-active' : ''} ${letterColor ? 'has-color' : ''}" data-token-type="letter" data-index="${index}" title="Letter #${index + 1}: ${escapeHtml(char)}">${dotHtml}${escapeHtml(char)}</button>`;
    }).join('');

    if (selectedCustTokenIndices.size === 1) {
      const singleIdx = Array.from(selectedCustTokenIndices)[0];
      const singleColor = curColors.letters?.[singleIdx] || curColors.letters?.[String(singleIdx)] || '';
      highlightActiveColorSwatch(singleColor);
    } else {
      highlightActiveColorSwatch(null);
    }
  }
}

function setCustColorScope(scope) {
  selectedCustColorScope = scope;
  selectedCustTokenIndices.clear();

  document.querySelectorAll('#textCustColorScopeGroup .admin-text-pill-btn').forEach(btn => {
    btn.classList.toggle('is-active', btn.dataset.scope === scope);
  });

  renderCustTokens();
}

function applyColorToSelection(color) {
  if (!tempCustPositions[selectedCustElement]) return;
  if (!tempCustPositions[selectedCustElement].colors) {
    tempCustPositions[selectedCustElement].colors = { full: '', words: {}, letters: {} };
  }

  const colors = tempCustPositions[selectedCustElement].colors;
  if (!colors.words) colors.words = {};
  if (!colors.letters) colors.letters = {};

  if (selectedCustColorScope === 'full') {
    colors.full = color || '';
    if (!color) {
      colors.words = {};
      colors.letters = {};
    }
  } else if (selectedCustColorScope === 'word') {
    const text = getCustElementRawText(selectedCustElement);
    const wordsCount = (text.match(/\S+/g) || []).length;

    if (selectedCustTokenIndices.size === 0) {
      // If no token chip specifically highlighted, apply color to all words
      for (let w = 0; w < wordsCount; w++) {
        if (color) {
          colors.words[w] = color;
        } else {
          delete colors.words[w];
          delete colors.words[String(w)];
        }
      }
    } else {
      selectedCustTokenIndices.forEach(idx => {
        if (color) {
          colors.words[idx] = color;
        } else {
          delete colors.words[idx];
          delete colors.words[String(idx)];
        }
      });
    }
  } else if (selectedCustColorScope === 'letter') {
    const text = getCustElementRawText(selectedCustElement);

    if (selectedCustTokenIndices.size === 0) {
      // If no letter selected, apply color to all letters
      for (let i = 0; i < text.length; i++) {
        if (color) {
          colors.letters[i] = color;
        } else {
          delete colors.letters[i];
          delete colors.letters[String(i)];
        }
      }
    } else {
      selectedCustTokenIndices.forEach(idx => {
        if (color) {
          colors.letters[idx] = color;
        } else {
          delete colors.letters[idx];
          delete colors.letters[String(idx)];
        }
      });
    }
  }

  highlightActiveColorSwatch(color);
  refreshCustCanvasPositions();
  renderCustTokens();
}

function clearCurrentElementColors() {
  if (tempCustPositions[selectedCustElement]) {
    tempCustPositions[selectedCustElement].colors = { full: '', words: {}, letters: {} };
  }
  selectedCustTokenIndices.clear();
  highlightActiveColorSwatch('');
  refreshCustCanvasPositions();
  renderCustTokens();
}

function selectCustElement(elementKey, lineIndex = null) {
  selectedCustElement = elementKey;

  const text = getCustElementRawText(elementKey);
  const linesText = text.split('\n');
  if (linesText.length > 1) {
    if (lineIndex !== null && !isNaN(lineIndex) && lineIndex >= 0 && lineIndex < linesText.length) {
      selectedCustLineIndex = lineIndex;
    } else if (selectedCustLineIndex === null || selectedCustLineIndex >= linesText.length) {
      selectedCustLineIndex = 0;
    }
  } else {
    selectedCustLineIndex = null;
  }

  document.querySelectorAll('.admin-text-customize-selectors .admin-text-pill-btn[data-element]').forEach(btn => {
    btn.classList.toggle('is-active', btn.dataset.element === elementKey);
  });

  const stageElements = [
    { key: 'badge', el: textCustStageBadgeWrap },
    { key: 'heading', el: textCustStageHeading },
    { key: 'subheading', el: textCustStageSubheading },
    { key: 'button', el: textCustStageCta }
  ];

  stageElements.forEach(({ key, el }) => {
    if (el) {
      const isThisElement = (key === elementKey);
      const isMultiline = (key === 'heading' || key === 'subheading') && (getCustElementRawText(key).split('\n').length > 1);
      el.classList.toggle('is-selected', isThisElement && !isMultiline);
    }
  });

  selectedCustTokenIndices.clear();
  refreshCustSizeUi();
  refreshCustFontUi();
  renderCustTokens();
  refreshCustCanvasPositions();
}

function setCustCanvasView(viewKey) {
  currentCustView = viewKey;

  document.querySelectorAll('.admin-text-customize-views .admin-text-pill-btn[data-view]').forEach(btn => {
    btn.classList.toggle('is-active', btn.dataset.view === viewKey);
  });

  if (adminTextCustomizeCanvasContainer) {
    adminTextCustomizeCanvasContainer.dataset.aspect = viewKey;
  }

  refreshCustSizeUi();

  const isAdd = currentCustModalMode === 'add';
  const state = isAdd ? addBannerState : editBannerState;
  const desktopUrlInput = (isAdd ? addBannerDesktopUrl : editBannerDesktopUrl)?.value.trim();
  const mobileUrlInput = (isAdd ? addBannerMobileUrl : editBannerMobileUrl)?.value.trim();
  const tabletUrlInput = (isAdd ? addBannerTabletUrl : editBannerTabletUrl)?.value.trim();

  let bgUrl = '';
  if (viewKey === 'mobile') {
    bgUrl = state.mobileBlobUrl || state.currentMobileUrl || mobileUrlInput || state.desktopBlobUrl || state.currentDesktopUrl || desktopUrlInput;
  } else if (viewKey === 'tablet') {
    bgUrl = state.tabletBlobUrl || state.currentTabletUrl || tabletUrlInput || state.desktopBlobUrl || state.currentDesktopUrl || desktopUrlInput;
  } else {
    bgUrl = state.desktopBlobUrl || state.currentDesktopUrl || desktopUrlInput;
  }
  if (!bgUrl) bgUrl = 'images/de490593b2c52fd6f19df8b228bb2bc3.jpg';

  if (adminTextCustomizeCanvas) {
    adminTextCustomizeCanvas.style.backgroundImage = `url("${bgUrl}")`;
  }
}

function openTextCustomizeModal(mode = 'add') {
  currentCustModalMode = mode;
  const isAdd = mode === 'add';
  const state = isAdd ? addBannerState : editBannerState;

  const curPos = state.textPositions || {};
  tempCustPositions = {
    badge: {
      x: Number(curPos.badge?.x || 0),
      y: Number(curPos.badge?.y || 0),
      size_desktop: curPos.badge?.size_desktop || 'medium',
      size_tablet: curPos.badge?.size_tablet || 'medium',
      size_mobile: curPos.badge?.size_mobile || 'medium',
      font_family: String(curPos.badge?.font_family || '').trim(),
      colors: JSON.parse(JSON.stringify(curPos.badge?.colors || { full: '', words: {}, letters: {} }))
    },
    heading: {
      x: Number(curPos.heading?.x || 0),
      y: Number(curPos.heading?.y || 0),
      size_desktop: curPos.heading?.size_desktop || 'medium',
      size_tablet: curPos.heading?.size_tablet || 'medium',
      size_mobile: curPos.heading?.size_mobile || 'medium',
      font_family: String(curPos.heading?.font_family || '').trim(),
      colors: JSON.parse(JSON.stringify(curPos.heading?.colors || { full: '', words: {}, letters: {} })),
      lines: curPos.heading?.lines ? JSON.parse(JSON.stringify(curPos.heading.lines)) : null
    },
    subheading: {
      x: Number(curPos.subheading?.x || 0),
      y: Number(curPos.subheading?.y || 0),
      size_desktop: curPos.subheading?.size_desktop || 'medium',
      size_tablet: curPos.subheading?.size_tablet || 'medium',
      size_mobile: curPos.subheading?.size_mobile || 'medium',
      font_family: String(curPos.subheading?.font_family || '').trim(),
      colors: JSON.parse(JSON.stringify(curPos.subheading?.colors || { full: '', words: {}, letters: {} })),
      lines: curPos.subheading?.lines ? JSON.parse(JSON.stringify(curPos.subheading.lines)) : null
    },
    button: {
      x: Number(curPos.button?.x || 0),
      y: Number(curPos.button?.y || 0),
      size_desktop: curPos.button?.size_desktop || 'medium',
      size_tablet: curPos.button?.size_tablet || 'medium',
      size_mobile: curPos.button?.size_mobile || 'medium',
      font_family: String(curPos.button?.font_family || '').trim(),
      colors: JSON.parse(JSON.stringify(curPos.button?.colors || { full: '', words: {}, letters: {} }))
    }
  };

  const badgeText = getCustElementRawText('badge');
  if (textCustStageBadgeWrap) textCustStageBadgeWrap.style.display = badgeText ? '' : 'none';

  setCustCanvasView('desktop');
  setCustColorScope('full');
  selectedCustLineIndex = null;
  selectCustElement('badge');
  refreshCustCanvasPositions();

  if (adminTextCustomizeModal) {
    adminTextCustomizeModal.hidden = false;
    adminTextCustomizeModal.setAttribute('aria-hidden', 'false');
  }
}

function closeTextCustomizeModal() {
  if (textCustColorPickerPopover) {
    textCustColorPickerPopover.hidden = true;
    textCustCustomPickerTrigger?.setAttribute('aria-expanded', 'false');
  }
  if (adminTextCustomizeModal) {
    adminTextCustomizeModal.hidden = true;
    adminTextCustomizeModal.setAttribute('aria-hidden', 'true');
  }
}

function applyAndSaveCustPositions() {
  const state = currentCustModalMode === 'add' ? addBannerState : editBannerState;
  const headingText = getCustElementRawText('heading');
  const headingLinesCount = headingText.split('\n').length;
  const subText = getCustElementRawText('subheading');
  const subLinesCount = subText.split('\n').length;

  state.textPositions = {
    badge: {
      x: tempCustPositions.badge.x,
      y: tempCustPositions.badge.y,
      size_desktop: tempCustPositions.badge.size_desktop,
      size_tablet: tempCustPositions.badge.size_tablet,
      size_mobile: tempCustPositions.badge.size_mobile,
      font_family: tempCustPositions.badge.font_family || '',
      colors: JSON.parse(JSON.stringify(tempCustPositions.badge.colors || { full: '', words: {}, letters: {} }))
    },
    heading: {
      x: tempCustPositions.heading.x,
      y: tempCustPositions.heading.y,
      size_desktop: tempCustPositions.heading.size_desktop,
      size_tablet: tempCustPositions.heading.size_tablet,
      size_mobile: tempCustPositions.heading.size_mobile,
      font_family: tempCustPositions.heading.font_family || '',
      colors: JSON.parse(JSON.stringify(tempCustPositions.heading.colors || { full: '', words: {}, letters: {} })),
      lines: (tempCustPositions.heading.lines && headingLinesCount > 1)
        ? JSON.parse(JSON.stringify(tempCustPositions.heading.lines.slice(0, headingLinesCount)))
        : null
    },
    subheading: {
      x: tempCustPositions.subheading.x,
      y: tempCustPositions.subheading.y,
      size_desktop: tempCustPositions.subheading.size_desktop,
      size_tablet: tempCustPositions.subheading.size_tablet,
      size_mobile: tempCustPositions.subheading.size_mobile,
      font_family: tempCustPositions.subheading.font_family || '',
      colors: JSON.parse(JSON.stringify(tempCustPositions.subheading.colors || { full: '', words: {}, letters: {} })),
      lines: (tempCustPositions.subheading.lines && subLinesCount > 1)
        ? JSON.parse(JSON.stringify(tempCustPositions.subheading.lines.slice(0, subLinesCount)))
        : null
    },
    button: {
      x: tempCustPositions.button.x,
      y: tempCustPositions.button.y,
      size_desktop: tempCustPositions.button.size_desktop,
      size_tablet: tempCustPositions.button.size_tablet,
      size_mobile: tempCustPositions.button.size_mobile,
      font_family: tempCustPositions.button.font_family || '',
      colors: JSON.parse(JSON.stringify(tempCustPositions.button.colors || { full: '', words: {}, letters: {} }))
    }
  };

  closeTextCustomizeModal();
  triggerLiveAnimPreview(currentCustModalMode, false);
}

function initTextCustomizeDragEvents() {
  const canvas = adminTextCustomizeCanvas;
  if (!canvas) return;

  const resolveCustHitTarget = (target) => {
    if (!target) return null;
    const lineEl = target.closest('.banner-line-el');
    if (lineEl) {
      let lineIndex = parseInt(lineEl.dataset.lineIndex, 10);
      if (isNaN(lineIndex)) lineIndex = 0;
      if (textCustStageHeading && textCustStageHeading.contains(lineEl)) {
        return { key: 'heading', lineIndex, targetEl: lineEl };
      }
      if (textCustStageSubheading && textCustStageSubheading.contains(lineEl)) {
        return { key: 'subheading', lineIndex, targetEl: lineEl };
      }
    }

    const badgeHit = target.closest('#textCustStageBadgeWrap, .hero-banner-badge');
    if (badgeHit && textCustStageBadgeWrap) {
      return { key: 'badge', lineIndex: null, targetEl: textCustStageBadgeWrap };
    }

    const ctaHit = target.closest('#textCustStageCta, .hero-banner-btn');
    if (ctaHit && textCustStageCta) {
      return { key: 'button', lineIndex: null, targetEl: textCustStageCta };
    }

    const headingHit = target.closest('#textCustStageHeading');
    if (headingHit && headingHit.querySelectorAll('.banner-line-el').length <= 1) {
      return { key: 'heading', lineIndex: null, targetEl: textCustStageHeading };
    }

    const subHit = target.closest('#textCustStageSubheading');
    if (subHit && subHit.querySelectorAll('.banner-line-el').length <= 1) {
      return { key: 'subheading', lineIndex: null, targetEl: textCustStageSubheading };
    }

    return null;
  };

  const handleDragStart = (e, clientX, clientY, pointerId = null) => {
    const hit = resolveCustHitTarget(e.target);
    if (!hit) {
      isDraggingCustElement = false;
      return;
    }

    const { key, lineIndex, targetEl } = hit;
    selectCustElement(key, lineIndex);

    isDraggingCustElement = true;
    dragStartX = clientX;
    dragStartY = clientY;

    if (lineIndex !== null) {
      if (!Array.isArray(tempCustPositions[key]?.lines)) {
        tempCustPositions[key].lines = [];
      }
      const totalLines = getCustElementRawText(key).split('\n').length;
      for (let i = 0; i < totalLines; i++) {
        if (!tempCustPositions[key].lines[i]) {
          tempCustPositions[key].lines[i] = {
            x: i === 0 ? (tempCustPositions[key].x || 0) : 0,
            y: i === 0 ? (tempCustPositions[key].y || 0) : 0
          };
        }
      }
      elemStartPosX = tempCustPositions[key].lines[lineIndex]?.x || 0;
      elemStartPosY = tempCustPositions[key].lines[lineIndex]?.y || 0;
    } else {
      elemStartPosX = tempCustPositions[key]?.x || 0;
      elemStartPosY = tempCustPositions[key]?.y || 0;
    }

    if (targetEl) {
      targetEl.classList.add('is-dragging');
      if (pointerId !== null && typeof targetEl.setPointerCapture === 'function') {
        try { targetEl.setPointerCapture(pointerId); } catch (_) {}
      }
    }

    refreshCustCanvasPositions();
  };

  canvas.addEventListener('pointerdown', e => {
    if (e.button !== undefined && e.button !== 0) return;
    const hit = resolveCustHitTarget(e.target);
    if (hit) {
      e.preventDefault();
      e.stopPropagation();
      handleDragStart(e, e.clientX, e.clientY, e.pointerId);
    }
  });

  canvas.addEventListener('mousedown', e => {
    if (e.button !== undefined && e.button !== 0) return;
    const hit = resolveCustHitTarget(e.target);
    if (hit) {
      e.preventDefault();
      e.stopPropagation();
      handleDragStart(e, e.clientX, e.clientY);
    }
  });

  canvas.addEventListener('touchstart', e => {
    if (e.touches.length === 1) {
      const hit = resolveCustHitTarget(e.touches[0].target);
      if (hit) {
        e.stopPropagation();
        handleDragStart(e, e.touches[0].clientX, e.touches[0].clientY);
      }
    }
  }, { passive: false });

  const handlePointerMove = (clientX, clientY) => {
    if (!isDraggingCustElement || !selectedCustElement) return;

    const deltaX = clientX - dragStartX;
    const deltaY = clientY - dragStartY;

    const canvasRect = canvas.getBoundingClientRect();
    const maxBoundX = Math.round((canvasRect.width || 800) * 0.45);
    const maxBoundY = Math.round((canvasRect.height || 300) * 0.45);

    const newX = Math.max(-maxBoundX, Math.min(maxBoundX, elemStartPosX + deltaX));
    const newY = Math.max(-maxBoundY, Math.min(maxBoundY, elemStartPosY + deltaY));

    if (tempCustPositions[selectedCustElement]) {
      if (selectedCustLineIndex !== null) {
        if (!Array.isArray(tempCustPositions[selectedCustElement].lines)) {
          tempCustPositions[selectedCustElement].lines = [];
        }
        if (!tempCustPositions[selectedCustElement].lines[selectedCustLineIndex]) {
          tempCustPositions[selectedCustElement].lines[selectedCustLineIndex] = {
            x: selectedCustLineIndex === 0 ? (tempCustPositions[selectedCustElement].x || 0) : 0,
            y: selectedCustLineIndex === 0 ? (tempCustPositions[selectedCustElement].y || 0) : 0
          };
        }
        tempCustPositions[selectedCustElement].lines[selectedCustLineIndex].x = Math.round(newX);
        tempCustPositions[selectedCustElement].lines[selectedCustLineIndex].y = Math.round(newY);
        if (selectedCustLineIndex === 0) {
          tempCustPositions[selectedCustElement].x = Math.round(newX);
          tempCustPositions[selectedCustElement].y = Math.round(newY);
        }
      } else {
        tempCustPositions[selectedCustElement].x = Math.round(newX);
        tempCustPositions[selectedCustElement].y = Math.round(newY);
      }
      refreshCustCanvasPositions();
    }
  };

  window.addEventListener('pointermove', e => {
    if (isDraggingCustElement) {
      handlePointerMove(e.clientX, e.clientY);
    }
  });

  window.addEventListener('mousemove', e => {
    if (isDraggingCustElement) {
      handlePointerMove(e.clientX, e.clientY);
    }
  });

  window.addEventListener('touchmove', e => {
    if (isDraggingCustElement && e.touches.length === 1) {
      handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: false });

  const handlePointerUp = () => {
    if (isDraggingCustElement) {
      isDraggingCustElement = false;
      stageElements.forEach(({ el }) => el?.classList.remove('is-dragging'));
      document.querySelectorAll('.admin-text-customize-canvas .banner-line-el').forEach(line => {
        line.classList.remove('is-dragging');
      });
    }
  };

  window.addEventListener('pointerup', handlePointerUp);
  window.addEventListener('pointercancel', handlePointerUp);
  window.addEventListener('mouseup', handlePointerUp);
  window.addEventListener('touchend', handlePointerUp);
  window.addEventListener('touchcancel', handlePointerUp);
}

function initTextColorCustomizeEvents() {
  // Quick Rainbow Color Swatches Clicks (in main palette)
  document.querySelectorAll('#textCustColorPalette .admin-color-swatch:not(.is-custom-picker)').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      const color = btn.dataset.color || '';
      applyColorToSelection(color);
    });
  });

  // Extended Palette Swatches Clicks (in popover)
  document.querySelectorAll('#textCustExtendedPalette .admin-color-swatch').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      const color = btn.dataset.color || '';
      applyColorToSelection(color);
    });
  });

  // Toggle Custom Picker Popover
  textCustCustomPickerTrigger?.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();
    if (!textCustColorPickerPopover) return;
    const isHidden = textCustColorPickerPopover.hidden;
    textCustColorPickerPopover.hidden = !isHidden;
    textCustCustomPickerTrigger.setAttribute('aria-expanded', String(!isHidden));
  });

  // Close Custom Picker Popover Button
  textCustPopoverCloseBtn?.addEventListener('click', e => {
    e.preventDefault();
    if (textCustColorPickerPopover) {
      textCustColorPickerPopover.hidden = true;
      textCustCustomPickerTrigger?.setAttribute('aria-expanded', 'false');
    }
  });

  // Native Color Input Picker Change
  textCustNativeColorInput?.addEventListener('input', e => {
    const val = (e.target.value || '#38BDF8').toUpperCase();
    if (textCustCustomPreview) textCustCustomPreview.style.background = val;
    if (textCustHexInput) textCustHexInput.value = val;
    applyColorToSelection(val);
  });

  // Custom Hex Input Typing & Live Preview
  textCustHexInput?.addEventListener('input', e => {
    let val = e.target.value.trim();
    if (val && !val.startsWith('#')) val = `#${val}`;
    if (textCustCustomPreview) textCustCustomPreview.style.background = val;
    if (textCustNativeColorInput && /^#[0-9A-F]{6}$/i.test(val)) {
      textCustNativeColorInput.value = val;
    }
  });

  const applyCustomHex = () => {
    let val = (textCustHexInput?.value || '').trim();
    if (!val) return;
    if (!val.startsWith('#')) val = `#${val}`;
    applyColorToSelection(val);
  };

  textCustApplyCustomColorBtn?.addEventListener('click', e => {
    e.preventDefault();
    applyCustomHex();
  });

  textCustHexInput?.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      applyCustomHex();
    }
  });

  // Close popover when clicking outside of textCustColorsWrapper
  document.addEventListener('click', e => {
    if (textCustColorPickerPopover && !textCustColorPickerPopover.hidden) {
      if (!textCustColorsWrapper?.contains(e.target)) {
        textCustColorPickerPopover.hidden = true;
        textCustCustomPickerTrigger?.setAttribute('aria-expanded', 'false');
      }
    }
  });

  // Close popover on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && textCustColorPickerPopover && !textCustColorPickerPopover.hidden) {
      textCustColorPickerPopover.hidden = true;
      textCustCustomPickerTrigger?.setAttribute('aria-expanded', 'false');
    }
  });

  // Scope Toggle Pills (Full Text / Word / Letter)
  textCustScopeFull?.addEventListener('click', () => setCustColorScope('full'));
  textCustScopeWord?.addEventListener('click', () => setCustColorScope('word'));
  textCustScopeLetter?.addEventListener('click', () => setCustColorScope('letter'));

  // Reset Element Colors Button
  textCustClearElementColorsBtn?.addEventListener('click', () => clearCurrentElementColors());

  // Token Chips Interactive Click Selection
  textCustTokenChips?.addEventListener('click', e => {
    const chip = e.target.closest('.admin-token-chip');
    if (!chip) return;
    e.preventDefault();

    const idx = parseInt(chip.dataset.index, 10);
    if (isNaN(idx)) return;

    if (selectedCustTokenIndices.has(idx)) {
      selectedCustTokenIndices.delete(idx);
    } else {
      selectedCustTokenIndices.add(idx);
    }

    renderCustTokens();
  });
}

let previewAnimTimers = { add: null, edit: null };

/**
 * Trigger live motion replay inside the modal preview viewport
 * @param {'add'|'edit'} prefix
 * @param {boolean} [forceReplay=true]
 */
function triggerLiveAnimPreview(prefix, forceReplay = true) {
  const isAdd = prefix === 'add';
  const stage = isAdd ? addBannerAnimPreviewStage : editBannerAnimPreviewStage;
  const badgeWrap = isAdd ? addBannerStageBadgeWrap : editBannerStageBadgeWrap;
  const badgeEl = isAdd ? addBannerStageBadge : editBannerStageBadge;
  const headingEl = isAdd ? addBannerStageHeading : editBannerStageHeading;
  const subEl = isAdd ? addBannerStageSubheading : editBannerStageSubheading;
  const ctaEl = isAdd ? addBannerStageCta : editBannerStageCta;
  const btnEl = isAdd ? addBannerStageBtn : editBannerStageBtn;
  const bgEl = isAdd ? document.getElementById('addBannerAnimPreviewBg') : document.getElementById('editBannerAnimPreviewBg');
  const previewBtn = isAdd ? addBannerPreviewAnimBtn : editBannerPreviewAnimBtn;

  const badgeInput = isAdd ? addBannerBadgeText : editBannerBadgeText;
  const headingInput = isAdd ? addBannerHeading : editBannerHeading;
  const subInput = isAdd ? addBannerSubheading : editBannerSubheading;
  const btnInput = isAdd ? addBannerButtonText : editBannerButtonText;
  const kenBurnsInput = isAdd ? addBannerKenBurns : editBannerKenBurns;

  if (!stage) return;

  if (previewAnimTimers[prefix]) {
    clearTimeout(previewAnimTimers[prefix]);
    previewAnimTimers[prefix] = null;
  }

  const anim = getBannerAnimFormData(prefix);

  // Text content & font color sync
  const badgeText = (badgeInput?.value || '').trim();
  const headingText = (headingInput?.value || '').trim() || 'WEAR THE STREET. OWN THE FIT.';
  const subText = (subInput?.value || '').trim() || 'Streetwear cut for people who move — oversized tees, boxy shirts, straight denim.';
  const btnText = (btnInput?.value || '').trim() || 'Shop The Drop';

  if (badgeEl) {
    badgeEl.innerHTML = renderColoredTextHtml(badgeText || "NASHIK-BORN • SS'26 DROP", anim.badge.colors);
  }
  if (badgeWrap) {
    badgeWrap.style.display = (badgeText || isAdd) ? '' : 'none';
  }
  if (headingEl) {
    const headingTextLines = headingText.split('\n');
    if (headingTextLines.length > 1) {
      const coloredLines = renderColoredTextLinesHtml(headingText, anim.heading.colors);
      let headingHtml = '';
      for (let i = 0; i < headingTextLines.length; i++) {
        const lineX = anim.heading.lines?.[i]?.x ?? (i === 0 ? anim.heading.x : 0);
        const lineY = anim.heading.lines?.[i]?.y ?? (i === 0 ? anim.heading.y : 0);
        headingHtml += `<span class="banner-line-el" style="display: block; position: relative; --pos-x: ${lineX}px; --pos-x-val: ${lineX}; --pos-y: ${lineY}px; --pos-y-val: ${lineY};">${coloredLines[i]}</span>`;
      }
      headingEl.innerHTML = headingHtml;
    } else {
      headingEl.innerHTML = renderColoredTextHtml(headingText, anim.heading.colors);
    }
  }
  if (subEl) {
    const subTextLines = subText.split('\n');
    if (subTextLines.length > 1) {
      const coloredLines = renderColoredTextLinesHtml(subText, anim.subheading.colors);
      let subHtml = '';
      for (let i = 0; i < subTextLines.length; i++) {
        const lineX = anim.subheading.lines?.[i]?.x ?? (i === 0 ? anim.subheading.x : 0);
        const lineY = anim.subheading.lines?.[i]?.y ?? (i === 0 ? anim.subheading.y : 0);
        subHtml += `<span class="banner-line-el" style="display: block; position: relative; --pos-x: ${lineX}px; --pos-x-val: ${lineX}; --pos-y: ${lineY}px; --pos-y-val: ${lineY};">${coloredLines[i]}</span>`;
      }
      subEl.innerHTML = subHtml;
    } else {
      subEl.innerHTML = renderColoredTextHtml(subText, anim.subheading.colors);
    }
  }
  if (btnEl) btnEl.innerHTML = renderColoredTextHtml(btnText, anim.button.colors);

  // Background preview image sync
  const state = isAdd ? addBannerState : editBannerState;
  const currentImg = state.desktopBlobUrl || state.currentDesktopUrl || 'images/de490593b2c52fd6f19df8b228bb2bc3.jpg';
  if (bgEl) {
    bgEl.style.backgroundImage = `url("${currentImg}")`;
  }

  if (kenBurnsInput?.checked) {
    stage.dataset.kenBurns = 'true';
  } else {
    delete stage.dataset.kenBurns;
  }

  const animElements = [badgeWrap, headingEl, subEl, ctaEl].filter(Boolean);

  if (badgeWrap) {
    badgeWrap.dataset.anim = anim.badge.type;
    badgeWrap.style.setProperty('--pos-x', `${anim.badge.x}px`);
    badgeWrap.style.setProperty('--pos-x-val', `${anim.badge.x}`);
    badgeWrap.style.setProperty('--pos-y', `${anim.badge.y}px`);
    badgeWrap.style.setProperty('--pos-y-val', `${anim.badge.y}`);
    badgeWrap.style.setProperty('--scale-desktop', TEXT_SIZE_SCALES[anim.badge.size_desktop || 'medium']);
    badgeWrap.style.setProperty('--scale-tablet', TEXT_SIZE_SCALES[anim.badge.size_tablet || 'medium']);
    badgeWrap.style.setProperty('--scale-mobile', TEXT_SIZE_SCALES[anim.badge.size_mobile || 'medium']);
    
    const badgeFont = BANNER_FONTS[anim.badge.font_family]?.stack || '';
    if (badgeFont) {
      badgeWrap.style.setProperty('--element-font', badgeFont);
      if (badgeEl) {
        badgeEl.style.setProperty('--element-font', badgeFont);
        badgeEl.style.fontFamily = badgeFont;
      }
    } else {
      badgeWrap.style.removeProperty('--element-font');
      if (badgeEl) {
        badgeEl.style.removeProperty('--element-font');
        badgeEl.style.fontFamily = '';
      }
    }
    badgeWrap.style.setProperty('--anim-delay', `${anim.badge.delay}s`);
    badgeWrap.style.setProperty('--anim-dur', `${anim.badge.duration}s`);
  }
  if (headingEl) {
    headingEl.dataset.anim = anim.heading.type;
    const headingTextLines = headingText.split('\n');
    if (headingTextLines.length > 1) {
      headingEl.style.setProperty('--pos-x', '0px');
      headingEl.style.setProperty('--pos-x-val', '0');
      headingEl.style.setProperty('--pos-y', '0px');
      headingEl.style.setProperty('--pos-y-val', '0');
    } else {
      headingEl.style.setProperty('--pos-x', `${anim.heading.x}px`);
      headingEl.style.setProperty('--pos-x-val', `${anim.heading.x}`);
      headingEl.style.setProperty('--pos-y', `${anim.heading.y}px`);
      headingEl.style.setProperty('--pos-y-val', `${anim.heading.y}`);
    }
    headingEl.style.setProperty('--scale-desktop', TEXT_SIZE_SCALES[anim.heading.size_desktop || 'medium']);
    headingEl.style.setProperty('--scale-tablet', TEXT_SIZE_SCALES[anim.heading.size_tablet || 'medium']);
    headingEl.style.setProperty('--scale-mobile', TEXT_SIZE_SCALES[anim.heading.size_mobile || 'medium']);
    
    const headingFont = BANNER_FONTS[anim.heading.font_family]?.stack || '';
    if (headingFont) {
      headingEl.style.setProperty('--element-font', headingFont);
      headingEl.style.fontFamily = headingFont;
    } else {
      headingEl.style.removeProperty('--element-font');
      headingEl.style.fontFamily = '';
    }
    headingEl.style.setProperty('--anim-delay', `${anim.heading.delay}s`);
    headingEl.style.setProperty('--anim-dur', `${anim.heading.duration}s`);
  }
  if (subEl) {
    subEl.dataset.anim = anim.subheading.type;
    const subTextLines = subText.split('\n');
    if (subTextLines.length > 1) {
      subEl.style.setProperty('--pos-x', '0px');
      subEl.style.setProperty('--pos-x-val', '0');
      subEl.style.setProperty('--pos-y', '0px');
      subEl.style.setProperty('--pos-y-val', '0');
    } else {
      subEl.style.setProperty('--pos-x', `${anim.subheading.x}px`);
      subEl.style.setProperty('--pos-x-val', `${anim.subheading.x}`);
      subEl.style.setProperty('--pos-y', `${anim.subheading.y}px`);
      subEl.style.setProperty('--pos-y-val', `${anim.subheading.y}`);
    }
    subEl.style.setProperty('--scale-desktop', TEXT_SIZE_SCALES[anim.subheading.size_desktop || 'medium']);
    subEl.style.setProperty('--scale-tablet', TEXT_SIZE_SCALES[anim.subheading.size_tablet || 'medium']);
    subEl.style.setProperty('--scale-mobile', TEXT_SIZE_SCALES[anim.subheading.size_mobile || 'medium']);
    
    const subFont = BANNER_FONTS[anim.subheading.font_family]?.stack || '';
    if (subFont) {
      subEl.style.setProperty('--element-font', subFont);
      subEl.style.fontFamily = subFont;
    } else {
      subEl.style.removeProperty('--element-font');
      subEl.style.fontFamily = '';
    }
    subEl.style.setProperty('--anim-delay', `${anim.subheading.delay}s`);
    subEl.style.setProperty('--anim-dur', `${anim.subheading.duration}s`);
  }
  if (ctaEl) {
    ctaEl.dataset.anim = anim.button.type;
    ctaEl.style.setProperty('--pos-x', `${anim.button.x}px`);
    ctaEl.style.setProperty('--pos-x-val', `${anim.button.x}`);
    ctaEl.style.setProperty('--pos-y', `${anim.button.y}px`);
    ctaEl.style.setProperty('--pos-y-val', `${anim.button.y}`);
    ctaEl.style.setProperty('--scale-desktop', TEXT_SIZE_SCALES[anim.button.size_desktop || 'medium']);
    ctaEl.style.setProperty('--scale-tablet', TEXT_SIZE_SCALES[anim.button.size_tablet || 'medium']);
    ctaEl.style.setProperty('--scale-mobile', TEXT_SIZE_SCALES[anim.button.size_mobile || 'medium']);

    const btnFont = BANNER_FONTS[anim.button.font_family]?.stack || '';
    if (btnFont) {
      ctaEl.style.setProperty('--element-font', btnFont);
      if (btnEl) {
        btnEl.style.setProperty('--element-font', btnFont);
        btnEl.style.fontFamily = btnFont;
      }
    } else {
      ctaEl.style.removeProperty('--element-font');
      if (btnEl) {
        btnEl.style.removeProperty('--element-font');
        btnEl.style.fontFamily = '';
      }
    }
    ctaEl.style.setProperty('--anim-delay', `${anim.button.delay}s`);
    ctaEl.style.setProperty('--anim-dur', `${anim.button.duration}s`);
  }

  if (!forceReplay) return;

  // --- FULL CHOREOGRAPHED RESET & REPLAY ---
  if (previewBtn) {
    previewBtn.classList.add('is-replaying');
  }

  // 1. Reset stage and child elements to hidden/suppressed state
  stage.classList.remove('is-active');
  stage.classList.add('is-resetting');

  if (bgEl) {
    bgEl.style.animation = 'none';
  }

  animElements.forEach(el => {
    el.style.animation = 'none';
    el.style.opacity = '0';
    void el.offsetWidth;
  });

  // Force synchronous reflow
  void stage.offsetWidth;

  // 2. Schedule re-activation on next frame
  previewAnimTimers[prefix] = setTimeout(() => {
    animElements.forEach(el => {
      el.style.animation = '';
      el.style.opacity = '';
    });
    if (bgEl) {
      bgEl.style.animation = '';
    }

    stage.classList.remove('is-resetting');
    stage.classList.add('is-active');

    setTimeout(() => {
      if (previewBtn) previewBtn.classList.remove('is-replaying');
    }, 400);
  }, 30);
}

function resetAddBannerModalState() {
  if (addBannerState.desktopBlobUrl) URL.revokeObjectURL(addBannerState.desktopBlobUrl);
  if (addBannerState.mobileBlobUrl) URL.revokeObjectURL(addBannerState.mobileBlobUrl);
  if (addBannerState.tabletBlobUrl) URL.revokeObjectURL(addBannerState.tabletBlobUrl);
  addBannerState.desktopFile = null;
  addBannerState.desktopBlobUrl = '';
  addBannerState.currentDesktopUrl = '';
  addBannerState.mobileFile = null;
  addBannerState.mobileBlobUrl = '';
  addBannerState.currentMobileUrl = '';
  addBannerState.tabletFile = null;
  addBannerState.tabletBlobUrl = '';
  addBannerState.currentTabletUrl = '';
  addBannerState.textPositions = {
    badge: { x: 0, y: 0, size_desktop: 'medium', size_tablet: 'medium', size_mobile: 'medium', font_family: '', colors: { full: '', words: {}, letters: {} } },
    heading: { x: 0, y: 0, size_desktop: 'medium', size_tablet: 'medium', size_mobile: 'medium', font_family: '', colors: { full: '', words: {}, letters: {} } },
    subheading: { x: 0, y: 0, size_desktop: 'medium', size_tablet: 'medium', size_mobile: 'medium', font_family: '', colors: { full: '', words: {}, letters: {} } },
    button: { x: 0, y: 0, size_desktop: 'medium', size_tablet: 'medium', size_mobile: 'medium', font_family: '', colors: { full: '', words: {}, letters: {} } }
  };

  if (addBannerForm) addBannerForm.reset();
  if (addBannerDesktopFile) addBannerDesktopFile.value = '';
  if (addBannerMobileFile) addBannerMobileFile.value = '';
  if (addBannerTabletFile) addBannerTabletFile.value = '';
  if (addBannerDesktopPrompt) addBannerDesktopPrompt.hidden = false;
  if (addBannerDesktopPreviewWrapper) addBannerDesktopPreviewWrapper.hidden = true;
  if (addBannerMobilePrompt) addBannerMobilePrompt.hidden = false;
  if (addBannerMobilePreviewWrapper) addBannerMobilePreviewWrapper.hidden = true;
  if (addBannerTabletPrompt) addBannerTabletPrompt.hidden = false;
  if (addBannerTabletPreviewWrapper) addBannerTabletPreviewWrapper.hidden = true;
  if (addBannerDesktopUrl) addBannerDesktopUrl.value = '';
  if (addBannerMobileUrl) addBannerMobileUrl.value = '';
  if (addBannerTabletUrl) addBannerTabletUrl.value = '';
  if (addBannerDesktopProgress) addBannerDesktopProgress.hidden = true;
  if (addBannerMobileProgress) addBannerMobileProgress.hidden = true;
  if (addBannerTabletProgress) addBannerTabletProgress.hidden = true;

  if (addBannerBadgeText) addBannerBadgeText.value = '';
  if (addBannerKenBurns) addBannerKenBurns.checked = false;
  setBannerAnimFormData('add');

  if (addBannerStatus) {
    addBannerStatus.textContent = '';
    addBannerStatus.classList.remove('is-error');
  }
}

function openAddBannerModal() {
  resetAddBannerModalState();
  if (addBannerDisplayOrder) {
    const maxOrder = banners.reduce((max, b) => Math.max(max, Number(b.display_order) || 0), 0);
    addBannerDisplayOrder.value = maxOrder + 1;
  }
  if (addBannerButtonText) addBannerButtonText.value = 'Shop The Drop';
  if (addBannerButtonLink) addBannerButtonLink.value = '#featured';
  if (addBannerAutoplay) addBannerAutoplay.checked = true;
  if (addBannerKenBurns) addBannerKenBurns.checked = false;
  if (addBannerIsActive) addBannerIsActive.checked = true;

  setBannerAnimFormData('add');

  if (addBannerModal) {
    addBannerModal.hidden = false;
    addBannerModal.setAttribute('aria-hidden', 'false');
  }
  document.body.style.overflow = 'hidden';
  addBannerHeading?.focus();
  setTimeout(() => triggerLiveAnimPreview('add'), 50);
}

function closeAddBannerModal() {
  if (addBannerModal) {
    addBannerModal.hidden = true;
    addBannerModal.setAttribute('aria-hidden', 'true');
  }
  document.body.style.overflow = '';
  resetAddBannerModalState();
}

function resetEditBannerModalState() {
  if (editBannerState.desktopBlobUrl) URL.revokeObjectURL(editBannerState.desktopBlobUrl);
  if (editBannerState.mobileBlobUrl) URL.revokeObjectURL(editBannerState.mobileBlobUrl);
  if (editBannerState.tabletBlobUrl) URL.revokeObjectURL(editBannerState.tabletBlobUrl);
  editBannerState.desktopFile = null;
  editBannerState.desktopBlobUrl = '';
  editBannerState.currentDesktopUrl = '';
  editBannerState.mobileFile = null;
  editBannerState.mobileBlobUrl = '';
  editBannerState.currentMobileUrl = '';
  editBannerState.tabletFile = null;
  editBannerState.tabletBlobUrl = '';
  editBannerState.currentTabletUrl = '';
  editBannerState.textPositions = {
    badge: { x: 0, y: 0, size_desktop: 'medium', size_tablet: 'medium', size_mobile: 'medium', font_family: '', colors: { full: '', words: {}, letters: {} } },
    heading: { x: 0, y: 0, size_desktop: 'medium', size_tablet: 'medium', size_mobile: 'medium', font_family: '', colors: { full: '', words: {}, letters: {} } },
    subheading: { x: 0, y: 0, size_desktop: 'medium', size_tablet: 'medium', size_mobile: 'medium', font_family: '', colors: { full: '', words: {}, letters: {} } },
    button: { x: 0, y: 0, size_desktop: 'medium', size_tablet: 'medium', size_mobile: 'medium', font_family: '', colors: { full: '', words: {}, letters: {} } }
  };

  if (editBannerForm) editBannerForm.reset();
  if (editBannerDesktopFile) editBannerDesktopFile.value = '';
  if (editBannerMobileFile) editBannerMobileFile.value = '';
  if (editBannerTabletFile) editBannerTabletFile.value = '';
  if (editBannerDesktopProgress) editBannerDesktopProgress.hidden = true;
  if (editBannerMobileProgress) editBannerMobileProgress.hidden = true;
  if (editBannerTabletProgress) editBannerTabletProgress.hidden = true;

  if (editBannerStatus) {
    editBannerStatus.textContent = '';
    editBannerStatus.classList.remove('is-error');
  }
}

function openEditBanner(bannerId) {
  const banner = banners.find(b => b.id === bannerId);
  if (!banner) return;

  resetEditBannerModalState();

  if (editBannerId) editBannerId.value = banner.id;
  if (editBannerBadgeText) editBannerBadgeText.value = banner.badge_text || '';
  if (editBannerHeading) editBannerHeading.value = banner.heading || '';
  if (editBannerSubheading) editBannerSubheading.value = banner.subheading || '';
  if (editBannerButtonText) editBannerButtonText.value = banner.button_text || 'Shop Now';
  if (editBannerButtonLink) editBannerButtonLink.value = banner.button_link || '#shop';
  if (editBannerAnimationType) editBannerAnimationType.value = banner.animation_type || 'slide';
  if (editBannerAutoplayInterval) editBannerAutoplayInterval.value = String(banner.autoplay_interval || 5000);
  if (editBannerAutoplay) editBannerAutoplay.checked = Boolean(banner.autoplay !== false);
  if (editBannerKenBurns) editBannerKenBurns.checked = Boolean(banner.enable_ken_burns);
  if (editBannerDisplayOrder) editBannerDisplayOrder.value = banner.display_order ?? 0;
  if (editBannerIsActive) editBannerIsActive.checked = Boolean(banner.is_active);

  // Set animation fields and custom text positions
  const savedPositions = (banner.text_positions && typeof banner.text_positions === 'object')
    ? banner.text_positions
    : null;
  setBannerAnimFormData('edit', banner.text_animations, savedPositions);

  // Set current desktop image
  editBannerState.currentDesktopUrl = banner.desktop_image || '';
  if (banner.desktop_image) {
    if (editBannerDesktopPrompt) editBannerDesktopPrompt.hidden = true;
    if (editBannerDesktopPreviewWrapper) editBannerDesktopPreviewWrapper.hidden = false;
    if (editBannerDesktopPreviewImg) editBannerDesktopPreviewImg.src = banner.desktop_image;
    if (editBannerDesktopUrl) editBannerDesktopUrl.value = banner.desktop_image;
  } else {
    if (editBannerDesktopPrompt) editBannerDesktopPrompt.hidden = false;
    if (editBannerDesktopPreviewWrapper) editBannerDesktopPreviewWrapper.hidden = true;
  }

  // Set current mobile image
  editBannerState.currentMobileUrl = banner.mobile_image || '';
  if (banner.mobile_image) {
    if (editBannerMobilePrompt) editBannerMobilePrompt.hidden = true;
    if (editBannerMobilePreviewWrapper) editBannerMobilePreviewWrapper.hidden = false;
    if (editBannerMobilePreviewImg) editBannerMobilePreviewImg.src = banner.mobile_image;
    if (editBannerMobileUrl) editBannerMobileUrl.value = banner.mobile_image;
  } else {
    if (editBannerMobilePrompt) editBannerMobilePrompt.hidden = false;
    if (editBannerMobilePreviewWrapper) editBannerMobilePreviewWrapper.hidden = true;
  }

  // Set current tablet image. Old banners leave this blank and fall back to desktop.
  editBannerState.currentTabletUrl = banner.tablet_image || '';
  if (banner.tablet_image) {
    if (editBannerTabletPrompt) editBannerTabletPrompt.hidden = true;
    if (editBannerTabletPreviewWrapper) editBannerTabletPreviewWrapper.hidden = false;
    if (editBannerTabletPreviewImg) editBannerTabletPreviewImg.src = banner.tablet_image;
    if (editBannerTabletUrl) editBannerTabletUrl.value = banner.tablet_image;
  } else {
    if (editBannerTabletPrompt) editBannerTabletPrompt.hidden = false;
    if (editBannerTabletPreviewWrapper) editBannerTabletPreviewWrapper.hidden = true;
  }

  if (editBannerModal) {
    editBannerModal.hidden = false;
    editBannerModal.setAttribute('aria-hidden', 'false');
  }
  document.body.style.overflow = 'hidden';
  editBannerHeading?.focus();
  setTimeout(() => triggerLiveAnimPreview('edit'), 50);
}

function closeEditBannerModal() {
  if (editBannerModal) {
    editBannerModal.hidden = true;
    editBannerModal.setAttribute('aria-hidden', 'true');
  }
  document.body.style.overflow = '';
  resetEditBannerModalState();
}

async function saveNewBanner(event) {
  event.preventDefault();
  if (!supabase) return;

  const badgeText = addBannerBadgeText?.value.trim() || '';
  const heading = addBannerHeading?.value.trim() || '';
  const subheading = addBannerSubheading?.value.trim() || '';
  const buttonText = addBannerButtonText?.value.trim() || 'Shop The Drop';
  const buttonLink = addBannerButtonLink?.value.trim() || '#featured';
  const animationType = addBannerAnimationType?.value || 'slide';
  const autoplayInterval = Number(addBannerAutoplayInterval?.value) || 5000;
  const autoplay = Boolean(addBannerAutoplay?.checked);
  const enableKenBurns = Boolean(addBannerKenBurns?.checked);
  const displayOrder = Number(addBannerDisplayOrder?.value) || 0;
  const isActive = Boolean(addBannerIsActive?.checked);
  const textAnimations = getBannerAnimFormData('add');
  const textPositions = addBannerState.textPositions || {
    badge: { x: 0, y: 0 },
    heading: { x: 0, y: 0 },
    subheading: { x: 0, y: 0 },
    button: { x: 0, y: 0 }
  };

  const desktopUrlInput = addBannerState.currentDesktopUrl || addBannerDesktopUrl?.value.trim() || '';
  const mobileUrlInput = addBannerState.currentMobileUrl || addBannerMobileUrl?.value.trim() || '';
  const tabletUrlInput = addBannerState.currentTabletUrl || addBannerTabletUrl?.value.trim() || '';

  // Validation
  const hasDesktopImage = Boolean(addBannerState.desktopFile || desktopUrlInput);
  if (!hasDesktopImage) {
    if (addBannerStatus) {
      addBannerStatus.textContent = 'Desktop banner image cannot be empty.';
      addBannerStatus.classList.add('is-error');
    }
    return;
  }

  if (!heading) {
    if (addBannerStatus) {
      addBannerStatus.textContent = 'Please enter a heading title for the banner.';
      addBannerStatus.classList.add('is-error');
    }
    addBannerHeading?.focus();
    return;
  }

  if (!buttonText) {
    if (addBannerStatus) {
      addBannerStatus.textContent = 'Please enter CTA button text.';
      addBannerStatus.classList.add('is-error');
    }
    addBannerButtonText?.focus();
    return;
  }

  if (!buttonLink) {
    if (addBannerStatus) {
      addBannerStatus.textContent = 'Please enter a CTA button destination link.';
      addBannerStatus.classList.add('is-error');
    }
    addBannerButtonLink?.focus();
    return;
  }

  if (addBannerSaveBtn) {
    addBannerSaveBtn.disabled = true;
    addBannerSaveBtn.textContent = 'Uploading & Saving…';
  }
  if (addBannerCancelBtn) addBannerCancelBtn.disabled = true;
  if (addBannerStatus) {
    addBannerStatus.textContent = 'Uploading banner imagery…';
    addBannerStatus.classList.remove('is-error');
  }

  try {
    let finalDesktopUrl = desktopUrlInput;
    if (addBannerState.desktopFile) {
      if (addBannerDesktopProgress) addBannerDesktopProgress.hidden = false;
      finalDesktopUrl = await uploadBannerImageFile(addBannerState.desktopFile, 'desktop');
      if (addBannerDesktopProgress) addBannerDesktopProgress.hidden = true;
    }

    let finalMobileUrl = addBannerState.mobileFile ? '' : (mobileUrlInput || finalDesktopUrl);
    if (addBannerState.mobileFile) {
      if (addBannerMobileProgress) addBannerMobileProgress.hidden = false;
      finalMobileUrl = await uploadBannerImageFile(addBannerState.mobileFile, 'mobile');
      if (addBannerMobileProgress) addBannerMobileProgress.hidden = true;
    }
    if (!finalMobileUrl) {
      finalMobileUrl = finalDesktopUrl;
    }

    let finalTabletUrl = addBannerState.tabletFile ? '' : tabletUrlInput;
    if (addBannerState.tabletFile) {
      if (addBannerTabletProgress) addBannerTabletProgress.hidden = false;
      finalTabletUrl = await uploadBannerImageFile(addBannerState.tabletFile, 'tablet');
      if (addBannerTabletProgress) addBannerTabletProgress.hidden = true;
    }

    if (addBannerStatus) addBannerStatus.textContent = 'Saving banner to database…';

    const { data, error } = await supabase
      .from('banners')
      .insert([{
        desktop_image: finalDesktopUrl,
        mobile_image: finalMobileUrl,
        tablet_image: finalTabletUrl || null,
        badge_text: badgeText,
        heading,
        subheading,
        button_text: buttonText,
        button_link: buttonLink,
        animation_type: animationType,
        autoplay,
        autoplay_interval: autoplayInterval,
        enable_ken_burns: enableKenBurns,
        text_animations: textAnimations,
        text_positions: textPositions,
        display_order: displayOrder,
        is_active: isActive
      }])
      .select()
      .single();

    if (error) throw error;

    await loadBanners(false);
    closeAddBannerModal();
    setBannersStatus(`Banner "${heading}" created successfully.`);
  } catch (err) {
    console.error('Error creating banner:', err);
    if (addBannerStatus) {
      addBannerStatus.textContent = err.message || 'Failed to create banner.';
      addBannerStatus.classList.add('is-error');
    }
  } finally {
    if (addBannerSaveBtn) {
      addBannerSaveBtn.disabled = false;
      addBannerSaveBtn.textContent = 'Create Banner';
    }
    if (addBannerCancelBtn) addBannerCancelBtn.disabled = false;
    if (addBannerDesktopProgress) addBannerDesktopProgress.hidden = true;
    if (addBannerMobileProgress) addBannerMobileProgress.hidden = true;
    if (addBannerTabletProgress) addBannerTabletProgress.hidden = true;
  }
}

async function saveBannerEdit(event) {
  event.preventDefault();
  if (!supabase) return;

  const bannerId = editBannerId?.value.trim();
  if (!bannerId) return;

  const badgeText = editBannerBadgeText?.value.trim() || '';
  const heading = editBannerHeading?.value.trim() || '';
  const subheading = editBannerSubheading?.value.trim() || '';
  const buttonText = editBannerButtonText?.value.trim() || 'Shop Now';
  const buttonLink = editBannerButtonLink?.value.trim() || '#shop';
  const animationType = editBannerAnimationType?.value || 'slide';
  const autoplayInterval = Number(editBannerAutoplayInterval?.value) || 5000;
  const autoplay = Boolean(editBannerAutoplay?.checked);
  const enableKenBurns = Boolean(editBannerKenBurns?.checked);
  const displayOrder = Number(editBannerDisplayOrder?.value) || 0;
  const isActive = Boolean(editBannerIsActive?.checked);
  const textAnimations = getBannerAnimFormData('edit');
  const textPositions = editBannerState.textPositions || {
    badge: { x: 0, y: 0 },
    heading: { x: 0, y: 0 },
    subheading: { x: 0, y: 0 },
    button: { x: 0, y: 0 }
  };

  const desktopUrlInput = editBannerState.currentDesktopUrl || editBannerDesktopUrl?.value.trim() || '';
  const mobileUrlInput = editBannerState.currentMobileUrl || editBannerMobileUrl?.value.trim() || '';
  const tabletUrlInput = editBannerState.currentTabletUrl || editBannerTabletUrl?.value.trim() || '';

  const hasDesktopImage = Boolean(editBannerState.desktopFile || desktopUrlInput);

  if (!hasDesktopImage) {
    if (editBannerStatus) {
      editBannerStatus.textContent = 'Desktop banner image cannot be empty.';
      editBannerStatus.classList.add('is-error');
    }
    return;
  }

  if (!heading) {
    if (editBannerStatus) {
      editBannerStatus.textContent = 'Please enter a heading title.';
      editBannerStatus.classList.add('is-error');
    }
    editBannerHeading?.focus();
    return;
  }

  if (!buttonText) {
    if (editBannerStatus) {
      editBannerStatus.textContent = 'Please enter button text.';
      editBannerStatus.classList.add('is-error');
    }
    editBannerButtonText?.focus();
    return;
  }

  if (!buttonLink) {
    if (editBannerStatus) {
      editBannerStatus.textContent = 'Please enter a button link target.';
      editBannerStatus.classList.add('is-error');
    }
    editBannerButtonLink?.focus();
    return;
  }

  if (editBannerSaveBtn) {
    editBannerSaveBtn.disabled = true;
    editBannerSaveBtn.textContent = 'Saving…';
  }
  if (editBannerCancelBtn) editBannerCancelBtn.disabled = true;
  if (editBannerStatus) {
    editBannerStatus.textContent = 'Saving changes…';
    editBannerStatus.classList.remove('is-error');
  }

  try {
    let finalDesktopUrl = desktopUrlInput;
    if (editBannerState.desktopFile) {
      if (editBannerDesktopProgress) editBannerDesktopProgress.hidden = false;
      finalDesktopUrl = await uploadBannerImageFile(editBannerState.desktopFile, 'desktop');
      if (editBannerDesktopProgress) editBannerDesktopProgress.hidden = true;
    }

    let finalMobileUrl = editBannerState.mobileFile ? '' : (mobileUrlInput || finalDesktopUrl);
    if (editBannerState.mobileFile) {
      if (editBannerMobileProgress) editBannerMobileProgress.hidden = false;
      finalMobileUrl = await uploadBannerImageFile(editBannerState.mobileFile, 'mobile');
      if (editBannerMobileProgress) editBannerMobileProgress.hidden = true;
    }
    if (!finalMobileUrl) {
      finalMobileUrl = finalDesktopUrl;
    }

    let finalTabletUrl = editBannerState.tabletFile ? '' : tabletUrlInput;
    if (editBannerState.tabletFile) {
      if (editBannerTabletProgress) editBannerTabletProgress.hidden = false;
      finalTabletUrl = await uploadBannerImageFile(editBannerState.tabletFile, 'tablet');
      if (editBannerTabletProgress) editBannerTabletProgress.hidden = true;
    }

    const { error } = await supabase
      .from('banners')
      .update({
        desktop_image: finalDesktopUrl,
        mobile_image: finalMobileUrl,
        tablet_image: finalTabletUrl || null,
        badge_text: badgeText,
        heading,
        subheading,
        button_text: buttonText,
        button_link: buttonLink,
        animation_type: animationType,
        autoplay,
        autoplay_interval: autoplayInterval,
        enable_ken_burns: enableKenBurns,
        text_animations: textAnimations,
        text_positions: textPositions,
        display_order: displayOrder,
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', bannerId);

    if (error) throw error;

    await loadBanners(false);
    closeEditBannerModal();
    setBannersStatus(`Banner "${heading}" updated successfully.`);
  } catch (err) {
    console.error('Error updating banner:', err);
    if (editBannerStatus) {
      editBannerStatus.textContent = err.message || 'Unable to update banner.';
      editBannerStatus.classList.add('is-error');
    }
  } finally {
    if (editBannerSaveBtn) {
      editBannerSaveBtn.disabled = false;
      editBannerSaveBtn.textContent = 'Save Changes';
    }
    if (editBannerCancelBtn) editBannerCancelBtn.disabled = false;
    if (editBannerDesktopProgress) editBannerDesktopProgress.hidden = true;
    if (editBannerMobileProgress) editBannerMobileProgress.hidden = true;
    if (editBannerTabletProgress) editBannerTabletProgress.hidden = true;
  }
}

async function toggleBannerActive(bannerId, currentActive) {
  const banner = banners.find(b => b.id === bannerId);
  if (!banner || !supabase) return;

  const nextState = !currentActive;
  const actionLabel = nextState ? 'activate' : 'deactivate';

  setBannersStatus(`${nextState ? 'Activating' : 'Deactivating'} banner…`);

  try {
    const { error } = await supabase
      .from('banners')
      .update({
        is_active: nextState,
        updated_at: new Date().toISOString()
      })
      .eq('id', bannerId);

    if (error) throw error;

    await loadBanners(false);
    setBannersStatus(`Banner "${banner.heading || 'Item'}" was ${nextState ? 'activated' : 'deactivated'} successfully.`);
  } catch (err) {
    console.error(`Error toggling banner:`, err);
    setBannersStatus(`Unable to ${actionLabel} banner: ${err.message}`, true);
  }
}

function openDeleteBannerModal(bannerId) {
  const banner = banners.find(b => b.id === bannerId);
  if (!banner || !supabase) return;

  bannerPendingDelete = banner;

  if (deleteBannerHeadingText) deleteBannerHeadingText.textContent = banner.heading || 'Untitled Banner';
  if (deleteBannerSubheadingText) deleteBannerSubheadingText.textContent = banner.subheading || 'No subtitle';
  if (deleteBannerOrderText) deleteBannerOrderText.textContent = `Display Order #${banner.display_order ?? 0} • ${banner.is_active ? 'Active' : 'Inactive'}`;

  if (deleteBannerStatus) {
    deleteBannerStatus.textContent = '';
    deleteBannerStatus.classList.remove('is-error');
  }

  if (deleteBannerModal) {
    deleteBannerModal.hidden = false;
    deleteBannerModal.setAttribute('aria-hidden', 'false');
  }
  document.body.style.overflow = 'hidden';
}

function closeDeleteBannerModal() {
  if (deleteBannerModal) {
    deleteBannerModal.hidden = true;
    deleteBannerModal.setAttribute('aria-hidden', 'true');
  }
  document.body.style.overflow = '';
  bannerPendingDelete = null;
  if (deleteBannerStatus) {
    deleteBannerStatus.textContent = '';
    deleteBannerStatus.classList.remove('is-error');
  }
}

async function confirmDeleteBanner() {
  if (!bannerPendingDelete || !supabase) return;
  const banner = bannerPendingDelete;

  if (deleteBannerConfirmBtn) {
    deleteBannerConfirmBtn.disabled = true;
    deleteBannerConfirmBtn.textContent = 'Deleting…';
  }
  if (deleteBannerCancelBtn) deleteBannerCancelBtn.disabled = true;
  if (deleteBannerStatus) {
    deleteBannerStatus.textContent = 'Deleting banner…';
    deleteBannerStatus.classList.remove('is-error');
  }

  try {
    const { error } = await supabase
      .from('banners')
      .delete()
      .eq('id', banner.id);

    if (error) throw error;

    await loadBanners(false);
    closeDeleteBannerModal();
    setBannersStatus(`Banner "${banner.heading || 'Item'}" was deleted successfully.`);
  } catch (err) {
    console.error('Error deleting banner:', err);
    if (deleteBannerStatus) {
      deleteBannerStatus.textContent = err.message || 'Unable to delete banner.';
      deleteBannerStatus.classList.add('is-error');
    }
  } finally {
    if (deleteBannerConfirmBtn) {
      deleteBannerConfirmBtn.disabled = false;
      deleteBannerConfirmBtn.textContent = 'Delete Banner';
    }
    if (deleteBannerCancelBtn) deleteBannerCancelBtn.disabled = false;
  }
}

// Helper to bind dropzone file uploads
function setupBannerDropzone({
  dropzoneEl,
  fileInputEl,
  promptEl,
  previewWrapperEl,
  previewImgEl,
  removeBtnEl,
  adjustBtnEl,
  stateHolder,
  fileKey,
  blobKey,
  urlInputEl,
  aspectRatio = '16:9',
  bannerType = 'desktop'
}) {
  if (!dropzoneEl || !fileInputEl) return;
  const currentUrlKey = bannerType === 'desktop'
    ? 'currentDesktopUrl'
    : bannerType === 'tablet'
      ? 'currentTabletUrl'
      : 'currentMobileUrl';

  dropzoneEl.addEventListener('click', e => {
    if (
      e.target === removeBtnEl ||
      e.target.closest('.admin-banner-remove-preview') ||
      e.target === adjustBtnEl ||
      e.target.closest('.admin-banner-adjust-btn')
    ) return;
    fileInputEl.click();
  });

  dropzoneEl.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      if (
        document.activeElement === removeBtnEl ||
        document.activeElement === adjustBtnEl
      ) return;
      e.preventDefault();
      fileInputEl.click();
    }
  });

  const handleFileSelection = file => {
    const validation = validateBannerFile(file);
    if (!validation.valid) {
      alert(validation.error);
      if (fileInputEl) fileInputEl.value = '';
      return;
    }
    if (stateHolder[blobKey]) URL.revokeObjectURL(stateHolder[blobKey]);
    stateHolder[fileKey] = file;
    stateHolder[blobKey] = URL.createObjectURL(file);
    stateHolder[currentUrlKey] = '';

    if (promptEl) promptEl.hidden = true;
    if (previewWrapperEl) previewWrapperEl.hidden = false;
    if (previewImgEl) previewImgEl.src = stateHolder[blobKey];
    if (urlInputEl) urlInputEl.value = '';
  };

  fileInputEl.addEventListener('change', () => {
    if (fileInputEl.files?.length) {
      handleFileSelection(fileInputEl.files[0]);
    }
  });

  ['dragenter', 'dragover'].forEach(eventName => {
    dropzoneEl.addEventListener(eventName, e => {
      e.preventDefault();
      e.stopPropagation();
      dropzoneEl.classList.add('is-dragover');
    });
  });

  ['dragleave', 'dragend', 'drop'].forEach(eventName => {
    dropzoneEl.addEventListener(eventName, e => {
      e.preventDefault();
      e.stopPropagation();
      dropzoneEl.classList.remove('is-dragover');
    });
  });

  dropzoneEl.addEventListener('drop', e => {
    if (e.dataTransfer?.files?.length) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  });

  removeBtnEl?.addEventListener('click', e => {
    e.stopPropagation();
    if (stateHolder[blobKey]) URL.revokeObjectURL(stateHolder[blobKey]);
    stateHolder[fileKey] = null;
    stateHolder[blobKey] = '';
    stateHolder[currentUrlKey] = '';
    if (fileInputEl) fileInputEl.value = '';
    if (urlInputEl) urlInputEl.value = '';
    if (promptEl) promptEl.hidden = false;
    if (previewWrapperEl) previewWrapperEl.hidden = true;
    if (previewImgEl) previewImgEl.src = '';
  });

  adjustBtnEl?.addEventListener('click', e => {
    e.stopPropagation();

    // Determine current image item
    let imageItem = null;
    if (stateHolder[fileKey]) {
      imageItem = {
        type: 'file',
        file: stateHolder[fileKey],
        previewUrl: stateHolder[blobKey] || previewImgEl?.src
      };
    } else {
      const currentUrl = stateHolder[currentUrlKey]
        || urlInputEl?.value.trim()
        || previewImgEl?.src;

      if (!currentUrl) return;

      imageItem = {
        type: 'url',
        url: currentUrl,
        previewUrl: currentUrl
      };
    }

    const modalTitle = bannerType === 'desktop'
      ? 'Adjust Desktop Banner (8:3)'
      : bannerType === 'tablet'
        ? 'Adjust Tablet Banner (4:3)'
        : 'Adjust Phone Banner (4:5)';

    openImageAdjustModal({
      imageItem,
      aspectRatio,
      modalTitle,
      enforceCoverBounds: bannerType === 'desktop',
      onApply: (newFile, newPreviewUrl) => {
        if (stateHolder[blobKey]?.startsWith('blob:') && stateHolder[blobKey] !== newPreviewUrl) {
          URL.revokeObjectURL(stateHolder[blobKey]);
        }
        stateHolder[fileKey] = newFile;
        stateHolder[blobKey] = newPreviewUrl;
        stateHolder[currentUrlKey] = '';
        if (previewImgEl) previewImgEl.src = newPreviewUrl;
        if (previewWrapperEl) previewWrapperEl.hidden = false;
        if (promptEl) promptEl.hidden = true;
        if (urlInputEl) urlInputEl.value = '';
      }
    });
  });

  urlInputEl?.addEventListener('input', () => {
    const val = urlInputEl.value.trim();
    if (val) {
      if (stateHolder[blobKey]) URL.revokeObjectURL(stateHolder[blobKey]);
      stateHolder[fileKey] = null;
      stateHolder[blobKey] = '';
      stateHolder[currentUrlKey] = val;
      if (fileInputEl) fileInputEl.value = '';
      if (promptEl) promptEl.hidden = true;
      if (previewWrapperEl) previewWrapperEl.hidden = false;
      if (previewImgEl) previewImgEl.src = val;
    }
  });
}

// --- PREPAID OFFER SETTINGS LOGIC ---
function toggleOfferModeUI() {
  const mode = prepaidOfferMode?.value || 'single';
  if (singleOfferSection) singleOfferSection.style.display = (mode === 'single') ? 'flex' : 'none';
  if (prepaidSlabsSection) prepaidSlabsSection.style.display = (mode === 'tiered') ? 'block' : 'none';
}

async function loadPrepaidOfferSettings(showStatus = false) {
  if (!supabase) return;
  if (offersStatus && showStatus) {
    offersStatus.textContent = 'Loading settings…';
    offersStatus.classList.remove('is-error');
  }

  try {
    const { data, error } = await supabase.rpc('get_active_prepaid_offer');
    if (error) throw error;
    const settings = data?.[0] || {};

    if (prepaidEnableSelect) prepaidEnableSelect.value = String(settings.is_enabled ?? true);
    if (prepaidOfferMode) prepaidOfferMode.value = settings.offer_mode || 'single';
    if (prepaidDiscountType) prepaidDiscountType.value = settings.discount_type || 'percentage';
    if (prepaidDiscountValue) prepaidDiscountValue.value = settings.discount_value !== undefined ? settings.discount_value : 5;
    if (prepaidMinOrderValue) prepaidMinOrderValue.value = settings.min_order_value_paise ? (settings.min_order_value_paise / 100) : '';
    if (prepaidMaxDiscount) prepaidMaxDiscount.value = settings.max_discount_paise ? (settings.max_discount_paise / 100) : '';
    if (prepaidStartDate) prepaidStartDate.value = settings.start_at ? new Date(settings.start_at).toISOString().slice(0, 16) : '';
    if (prepaidEndDate) prepaidEndDate.value = settings.end_at ? new Date(settings.end_at).toISOString().slice(0, 16) : '';
    if (prepaidOfferText) prepaidOfferText.value = settings.offer_text || 'Pay Online & Get 5% OFF';

    toggleOfferModeUI();

    currentSlabsList = Array.isArray(settings.slabs) ? settings.slabs : [];
    renderPrepaidSlabsList(currentSlabsList);

    if (offersStatus && showStatus) {
      offersStatus.textContent = 'Settings loaded successfully.';
      setTimeout(() => { if (offersStatus.textContent === 'Settings loaded successfully.') offersStatus.textContent = ''; }, 3000);
    }
  } catch (err) {
    console.error('Failed to load prepaid offer settings:', err);
    if (offersStatus) {
      offersStatus.textContent = 'Failed to load offer settings: ' + (err.message || err);
      offersStatus.classList.add('is-error');
    }
  }
}

function renderPrepaidSlabsList(slabs) {
  if (!prepaidSlabsList) return;

  if (!slabs || slabs.length === 0) {
    prepaidSlabsList.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; padding: 20px; color: #888;">
          No slabs configured yet. Click <strong>+ Add New Slab</strong> to create one.
        </td>
      </tr>
    `;
    return;
  }

  prepaidSlabsList.innerHTML = slabs.map(s => {
    const minValRupees = (s.min_order_value_paise / 100).toLocaleString('en-IN');
    const discLabel = s.discount_type === 'percentage' ? `${s.discount_value}%` : `₹${s.discount_value}`;
    const statusBadge = s.is_enabled
      ? `<span style="background: #d1fae5; color: #065f46; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 600;">Enabled</span>`
      : `<span style="background: #fee2e2; color: #991b1b; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 600;">Disabled</span>`;

    return `
      <tr data-id="${s.id}">
        <td><strong>₹${minValRupees}+</strong></td>
        <td>${s.discount_type === 'percentage' ? 'Percentage (%)' : 'Fixed Amount (₹)'}</td>
        <td><strong style="color: #059669;">${discLabel} OFF</strong></td>
        <td>${statusBadge}</td>
        <td style="text-align: right;">
          <button type="button" class="btn btn-outline edit-slab-btn" data-id="${s.id}" data-min-paise="${s.min_order_value_paise}" data-discount-type="${s.discount_type}" data-discount-value="${s.discount_value}" data-enabled="${s.is_enabled}" style="padding: 4px 10px; font-size: 12px; margin-right: 6px;">Edit</button>
          <button type="button" class="btn btn-outline toggle-slab-btn" data-id="${s.id}" data-enabled="${s.is_enabled}" style="padding: 4px 10px; font-size: 12px; margin-right: 6px;">${s.is_enabled ? 'Disable' : 'Enable'}</button>
          <button type="button" class="btn btn-outline delete-slab-btn" data-id="${s.id}" style="padding: 4px 10px; font-size: 12px; color: #dc2626; border-color: #fca5a5;">Delete</button>
        </td>
      </tr>
    `;
  }).join('');
}

async function handleSavePrepaidOffer(event) {
  event.preventDefault();
  if (!supabase) return;

  const isEnabled = prepaidEnableSelect?.value === 'true';
  const offerMode = prepaidOfferMode?.value || 'single';
  const discountType = prepaidDiscountType?.value || 'percentage';
  const discountValue = parseFloat(prepaidDiscountValue?.value || '0');
  const minOrderValue = prepaidMinOrderValue?.value ? parseFloat(prepaidMinOrderValue.value) : null;
  const maxDiscount = prepaidMaxDiscount?.value ? parseFloat(prepaidMaxDiscount.value) : null;
  const startDate = prepaidStartDate?.value ? new Date(prepaidStartDate.value).toISOString() : null;
  const endDate = prepaidEndDate?.value ? new Date(prepaidEndDate.value).toISOString() : null;
  const offerText = (prepaidOfferText?.value || '').trim();

  // Input Validation for Single Mode
  if (offerMode === 'single') {
    if (isNaN(discountValue) || discountValue < 0) {
      if (offersStatus) {
        offersStatus.textContent = 'Discount value must be a non-negative number.';
        offersStatus.classList.add('is-error');
      }
      return;
    }
    if (discountType === 'percentage' && discountValue > 100) {
      if (offersStatus) {
        offersStatus.textContent = 'Percentage discount cannot exceed 100%.';
        offersStatus.classList.add('is-error');
      }
      return;
    }
  }

  if (!offerText) {
    if (offersStatus) {
      offersStatus.textContent = 'Offer text is required.';
      offersStatus.classList.add('is-error');
    }
    return;
  }
  if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
    if (offersStatus) {
      offersStatus.textContent = 'Offer end date must be after start date.';
      offersStatus.classList.add('is-error');
    }
    return;
  }

  const saveBtn = document.getElementById('savePrepaidOfferBtn');
  if (saveBtn) saveBtn.disabled = true;
  if (offersStatus) {
    offersStatus.textContent = 'Saving changes…';
    offersStatus.classList.remove('is-error');
  }

  try {
    const { data, error } = await supabase.rpc('admin_update_prepaid_offer_settings', {
      p_is_enabled: isEnabled,
      p_offer_mode: offerMode,
      p_discount_type: discountType,
      p_discount_value: discountValue,
      p_min_order_value_paise: minOrderValue !== null ? Math.round(minOrderValue * 100) : null,
      p_max_discount_paise: maxDiscount !== null ? Math.round(maxDiscount * 100) : null,
      p_start_at: startDate,
      p_end_at: endDate,
      p_offer_text: offerText
    });

    if (error) throw error;

    if (offersStatus) {
      offersStatus.textContent = '✔ Changes saved successfully!';
      offersStatus.classList.remove('is-error');
      setTimeout(() => { if (offersStatus.textContent === '✔ Changes saved successfully!') offersStatus.textContent = ''; }, 4000);
    }
  } catch (err) {
    console.error('Failed to save prepaid offer settings:', err);
    if (offersStatus) {
      offersStatus.textContent = 'Failed to save changes: ' + (err.message || err);
      offersStatus.classList.add('is-error');
    }
  } finally {
    if (saveBtn) saveBtn.disabled = false;
  }
}

// Modal & Slab Handlers
let isSlabModalHistoryPushed = false;

function openSlabModal(slab = null) {
  if (!slabModal) return;
  if (slabModalStatus) {
    slabModalStatus.textContent = '';
    slabModalStatus.classList.remove('is-error');
  }
  if (slab) {
    if (slabModalTitle) slabModalTitle.textContent = 'Edit Prepaid Discount Slab';
    if (slabEditId) slabEditId.value = slab.id;
    if (slabMinOrderValue) slabMinOrderValue.value = (slab.min_order_value_paise / 100);
    if (slabDiscountType) slabDiscountType.value = slab.discount_type;
    if (slabDiscountValue) slabDiscountValue.value = slab.discount_value;
    if (slabIsEnabled) slabIsEnabled.value = String(slab.is_enabled);
  } else {
    if (slabModalTitle) slabModalTitle.textContent = 'Add Prepaid Discount Slab';
    if (slabEditId) slabEditId.value = '';
    if (slabMinOrderValue) slabMinOrderValue.value = '';
    if (slabDiscountType) slabDiscountType.value = 'fixed';
    if (slabDiscountValue) slabDiscountValue.value = '';
    if (slabIsEnabled) slabIsEnabled.value = 'true';
  }
  slabModal.hidden = false;
  slabModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  if (!isSlabModalHistoryPushed) {
    try {
      history.pushState({ slabModalOpen: true }, '');
      isSlabModalHistoryPushed = true;
    } catch (e) {}
  }
}

function closeSlabModal(popHistory = true) {
  if (!slabModal) return;
  slabModal.hidden = true;
  slabModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  if (slabModalForm) slabModalForm.reset();
  if (slabEditId) slabEditId.value = '';
  if (slabModalStatus) {
    slabModalStatus.textContent = '';
    slabModalStatus.classList.remove('is-error');
  }

  if (isSlabModalHistoryPushed) {
    isSlabModalHistoryPushed = false;
    if (popHistory && history.state?.slabModalOpen) {
      try { history.back(); } catch (e) {}
    }
  }
}

// Modal Backdrop Click & History PopState Listeners
slabModal?.addEventListener('click', (e) => {
  if (e.target === slabModal) {
    closeSlabModal(true);
  }
});

window.addEventListener('popstate', (e) => {
  if (slabModal && !slabModal.hidden) {
    closeSlabModal(false);
  }
});

async function handleSaveSlabModal(event) {
  event.preventDefault();
  if (!supabase) return;

  const id = slabEditId?.value || null;
  const rawMinVal = (slabMinOrderValue?.value || '').trim();
  const discType = slabDiscountType?.value || 'fixed';
  const rawDiscVal = (slabDiscountValue?.value || '').trim();
  const isEnabled = slabIsEnabled?.value === 'true';

  if (rawMinVal === '') {
    if (slabModalStatus) {
      slabModalStatus.textContent = 'Please enter Min Order Value (₹).';
      slabModalStatus.classList.add('is-error');
    }
    slabMinOrderValue?.focus();
    return;
  }

  const minVal = parseFloat(rawMinVal);
  if (isNaN(minVal) || minVal < 0) {
    if (slabModalStatus) {
      slabModalStatus.textContent = 'Min Order Value must be a non-negative number.';
      slabModalStatus.classList.add('is-error');
    }
    slabMinOrderValue?.focus();
    return;
  }

  if (rawDiscVal === '') {
    if (slabModalStatus) {
      slabModalStatus.textContent = 'Please enter Discount Value.';
      slabModalStatus.classList.add('is-error');
    }
    slabDiscountValue?.focus();
    return;
  }

  const discVal = parseFloat(rawDiscVal);
  if (isNaN(discVal) || discVal <= 0) {
    if (slabModalStatus) {
      slabModalStatus.textContent = 'Discount Value must be greater than 0.';
      slabModalStatus.classList.add('is-error');
    }
    slabDiscountValue?.focus();
    return;
  }

  if (discType === 'percentage' && discVal > 100) {
    if (slabModalStatus) {
      slabModalStatus.textContent = 'Percentage discount cannot exceed 100%.';
      slabModalStatus.classList.add('is-error');
    }
    slabDiscountValue?.focus();
    return;
  }

  const action = id ? 'update' : 'add';
  const saveBtn = document.getElementById('saveSlabModalBtn');
  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';
  }
  if (slabModalStatus) {
    slabModalStatus.textContent = 'Saving slab...';
    slabModalStatus.classList.remove('is-error');
  }

  try {
    const { data, error } = await supabase.rpc('admin_manage_prepaid_offer_slabs', {
      p_action: action,
      p_id: id,
      p_min_order_value_paise: Math.round(minVal * 100),
      p_discount_type: discType,
      p_discount_value: discVal,
      p_is_enabled: isEnabled
    });

    if (error) throw error;
    closeSlabModal(true);
    await loadPrepaidOfferSettings(true);
  } catch (err) {
    console.error('Failed to save slab:', err);
    if (slabModalStatus) {
      slabModalStatus.textContent = 'Error: ' + (err.message || err);
      slabModalStatus.classList.add('is-error');
    }
  } finally {
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save Slab';
    }
  }
}

// -------------------------------------------------------------
// EVENT LISTENERS INITIALIZATION
// -------------------------------------------------------------

// --- TAB NAVIGATION LISTENERS ---
tabOverview?.addEventListener('click', () => switchTab('overview'));
tabOrders?.addEventListener('click', () => switchTab('orders'));
tabReturns?.addEventListener('click', () => switchTab('returns'));
tabInventory?.addEventListener('click', () => switchTab('inventory'));
tabProducts?.addEventListener('click', () => switchTab('products'));
tabCategories?.addEventListener('click', () => switchTab('categories'));
tabAttributes?.addEventListener('click', () => switchTab('attributes'));
tabCoupons?.addEventListener('click', () => switchTab('coupons'));
tabOffers?.addEventListener('click', () => switchTab('offers'));
tabBanners?.addEventListener('click', () => switchTab('banners'));
tabLogs?.addEventListener('click', () => switchTab('logs'));

offersRefresh?.addEventListener('click', () => loadPrepaidOfferSettings(true));
offersForm?.addEventListener('submit', handleSavePrepaidOffer);
prepaidOfferMode?.addEventListener('change', toggleOfferModeUI);

addSlabBtn?.addEventListener('click', () => openSlabModal(null));
closeSlabModalBtn?.addEventListener('click', () => closeSlabModal(true));
closeSlabModalCloseBtn?.addEventListener('click', () => closeSlabModal(true));
slabModalForm?.addEventListener('submit', handleSaveSlabModal);

prepaidSlabsList?.addEventListener('click', async (e) => {
  const editBtn = e.target.closest('.edit-slab-btn');
  const toggleBtn = e.target.closest('.toggle-slab-btn');
  const deleteBtn = e.target.closest('.delete-slab-btn');

  if (editBtn) {
    const id = editBtn.dataset.id || editBtn.getAttribute('data-id');
    let slab = currentSlabsList.find(s => String(s.id) === String(id));
    if (!slab && editBtn.getAttribute('data-min-paise') !== null) {
      slab = {
        id: id,
        min_order_value_paise: parseFloat(editBtn.getAttribute('data-min-paise') || '0'),
        discount_type: editBtn.getAttribute('data-discount-type') || 'fixed',
        discount_value: parseFloat(editBtn.getAttribute('data-discount-value') || '0'),
        is_enabled: editBtn.getAttribute('data-enabled') === 'true'
      };
    }
    if (slab) openSlabModal(slab);
  } else if (toggleBtn) {
    const id = toggleBtn.dataset.id;
    const currentEnabled = toggleBtn.dataset.enabled === 'true';
    try {
      const { error } = await supabase.rpc('admin_manage_prepaid_offer_slabs', {
        p_action: 'toggle',
        p_id: id,
        p_is_enabled: !currentEnabled
      });
      if (error) throw error;
      await loadPrepaidOfferSettings(true);
    } catch (err) {
      alert('Error toggling slab: ' + (err.message || err));
    }
  } else if (deleteBtn) {
    const id = deleteBtn.dataset.id;
    if (confirm('Are you sure you want to delete this slab?')) {
      try {
        const { error } = await supabase.rpc('admin_manage_prepaid_offer_slabs', {
          p_action: 'delete',
          p_id: id
        });
        if (error) throw error;
        await loadPrepaidOfferSettings(true);
      } catch (err) {
        alert('Error deleting slab: ' + (err.message || err));
      }
    }
  }
});

// --- OVERVIEW TAB LISTENERS & SHORTCUTS ---
overviewRefreshButton?.addEventListener('click', () => loadOverviewData(true));

kpiTotalOrdersCard?.addEventListener('click', () => {
  switchTab('orders');
  if (orderStatusFilter) {
    orderStatusFilter.value = 'all';
    renderOrders();
  }
});

kpiActiveOrdersCard?.addEventListener('click', () => {
  switchTab('orders');
});

kpiDeliveredOrdersCard?.addEventListener('click', () => {
  switchTab('orders');
  if (orderStatusFilter) {
    orderStatusFilter.value = 'delivered';
    renderOrders();
  }
});

kpiLowStockCard?.addEventListener('click', () => {
  currentInventoryStockFilter = 'low';
  switchTab('inventory');
  renderInventory();
});

chipPendingOrders?.addEventListener('click', () => {
  switchTab('orders');
  if (orderStatusFilter) {
    orderStatusFilter.value = 'pending';
    renderOrders();
  }
});

chipProcessingOrders?.addEventListener('click', () => {
  switchTab('orders');
  if (orderStatusFilter) {
    orderStatusFilter.value = 'processing';
    renderOrders();
  }
});

chipShippedOrders?.addEventListener('click', () => {
  switchTab('orders');
  if (orderStatusFilter) {
    orderStatusFilter.value = 'shipped';
    renderOrders();
  }
});

chipCancelledOrders?.addEventListener('click', () => {
  switchTab('orders');
  if (orderStatusFilter) {
    orderStatusFilter.value = 'cancelled';
    renderOrders();
  }
});

// --- ORDERS TAB LISTENERS ---
refreshButton?.addEventListener('click', loadOrders);
orderSearch?.addEventListener('input', renderOrders);
orderStatusFilter?.addEventListener('change', renderOrders);
orderPaymentFilter?.addEventListener('change', renderOrders);
orderDateFilter?.addEventListener('change', () => {
  setVisible(orderCustomDateRange, orderDateFilter.value === 'custom');
  renderOrders();
});
orderDateFrom?.addEventListener('change', renderOrders);
orderDateTo?.addEventListener('change', renderOrders);

// --- RETURNS & EXCHANGES TAB LISTENERS ---
returnsRefreshButton?.addEventListener('click', () => loadReturnRequests(true));
returnsSearch?.addEventListener('input', renderReturnRequests);
returnsStatusFilter?.addEventListener('change', renderReturnRequests);
returnsTypeFilter?.addEventListener('change', renderReturnRequests);
returnReasonCloseBtn?.addEventListener('click', closeReturnReasonModal);
returnReasonCloseFooterBtn?.addEventListener('click', closeReturnReasonModal);
returnReasonModal?.addEventListener('click', (e) => {
  if (e.target === returnReasonModal) closeReturnReasonModal();
});
returnReasonViewDetailsBtn?.addEventListener('click', () => {
  const retId = returnReasonViewDetailsBtn.dataset.returnId;
  closeReturnReasonModal();
  if (retId) loadReturnDetails(retId);
});

// --- INVENTORY TAB LISTENERS ---
inventoryRefreshButton?.addEventListener('click', () => loadInventory(true));
inventorySearch?.addEventListener('input', renderInventory);

invFilterAll?.addEventListener('click', () => {
  currentInventoryStockFilter = 'all';
  renderInventory();
});

invFilterLow?.addEventListener('click', () => {
  currentInventoryStockFilter = 'low';
  renderInventory();
});

invFilterOut?.addEventListener('click', () => {
  currentInventoryStockFilter = 'out';
  renderInventory();
});

inventoryList?.addEventListener('click', event => {
  const saveProdBtn = event.target.closest('[data-save-product-id]');
  if (saveProdBtn && saveProdBtn.dataset.saveProductId) {
    const productId = saveProdBtn.dataset.saveProductId;
    const input = document.getElementById(`stock_${productId}`);
    const newStock = Number(input?.value);
    updateProductStock(productId, newStock, saveProdBtn);
    return;
  }

  const saveVarBtn = event.target.closest('[data-save-variant-id]');
  if (saveVarBtn && saveVarBtn.dataset.saveVariantId) {
    const variantId = saveVarBtn.dataset.saveVariantId;
    const productId = saveVarBtn.dataset.productId;
    const input = document.getElementById(`var_stock_${variantId}`);
    const newStock = Number(input?.value);
    updateVariantStock(variantId, productId, newStock, saveVarBtn);
  }
});

inventoryList?.addEventListener('keydown', event => {
  if (event.key === 'Enter') {
    if (event.target.dataset.variantId) {
      event.preventDefault();
      const variantId = event.target.dataset.variantId;
      const newStock = Number(event.target.value);
      const saveBtn = inventoryList.querySelector(`[data-save-variant-id="${variantId}"]`);
      if (variantId) updateVariantStock(variantId, null, newStock, saveBtn);
    } else if (event.target.dataset.productId) {
      event.preventDefault();
      const productId = event.target.dataset.productId;
      const newStock = Number(event.target.value);
      const saveBtn = inventoryList.querySelector(`[data-save-product-id="${productId}"]`);
      if (productId) updateProductStock(productId, newStock, saveBtn);
    }
  }
});

// --- PRODUCTS TAB LISTENERS ---
productsRefreshButton?.addEventListener('click', () => loadProducts(true));
productsSearch?.addEventListener('input', renderProducts);

// Products table event delegation for Edit, Toggle, and Delete buttons
productsList?.addEventListener('click', event => {
  const groupToggleBtn = event.target.closest('.toggle-group-btn');
  if (groupToggleBtn && groupToggleBtn.dataset.groupId) {
    const gId = groupToggleBtn.dataset.groupId;
    if (collapsedProductGroups.has(gId)) {
      collapsedProductGroups.delete(gId);
    } else {
      collapsedProductGroups.add(gId);
    }
    renderProducts();
    return;
  }

  const editBtn = event.target.closest('.admin-product-edit');
  if (editBtn && editBtn.dataset.productId) {
    openEditProduct(editBtn.dataset.productId);
    return;
  }

  const toggleBtn = event.target.closest('.admin-product-toggle');
  if (toggleBtn && toggleBtn.dataset.productId) {
    const isCurrentlyActive = toggleBtn.dataset.currentActive === 'true';
    toggleProductActive(toggleBtn.dataset.productId, isCurrentlyActive);
    return;
  }

  const deleteBtn = event.target.closest('.admin-product-delete');
  if (deleteBtn && deleteBtn.dataset.productId) {
    openDeleteProductModal(deleteBtn.dataset.productId);
  }
});

// --- CATEGORIES TAB LISTENERS ---
categoriesRefreshButton?.addEventListener('click', () => loadCategories(true));
categoriesSearch?.addEventListener('input', renderCategories);
addCategoryButton?.addEventListener('click', openAddCategoryModal);

// Categories table event delegation for Edit, Toggle, and Delete buttons
categoriesList?.addEventListener('click', event => {
  const editBtn = event.target.closest('.admin-category-edit');
  if (editBtn && editBtn.dataset.categoryId) {
    openEditCategory(editBtn.dataset.categoryId);
    return;
  }

  const toggleBtn = event.target.closest('.admin-category-toggle');
  if (toggleBtn && toggleBtn.dataset.categoryId) {
    const isCurrentlyActive = toggleBtn.dataset.currentActive === 'true';
    toggleCategoryActive(toggleBtn.dataset.categoryId, isCurrentlyActive);
    return;
  }

  const deleteBtn = event.target.closest('.admin-category-delete');
  if (deleteBtn && deleteBtn.dataset.categoryId) {
    openDeleteCategoryModal(deleteBtn.dataset.categoryId);
  }
});

// --- PRODUCT FAMILIES TAB LISTENERS ---
familiesRefreshButton?.addEventListener('click', () => loadProductFamilies(true));
familiesSearch?.addEventListener('input', renderFamilies);
addFamilyButton?.addEventListener('click', openAddFamilyModal);

familiesList?.addEventListener('click', event => {
  const editBtn = event.target.closest('.admin-family-edit');
  if (editBtn && editBtn.dataset.familyId) {
    openEditFamilyModal(editBtn.dataset.familyId);
    return;
  }

  const toggleBtn = event.target.closest('.admin-family-toggle');
  if (toggleBtn && toggleBtn.dataset.familyId) {
    const isCurrentlyActive = toggleBtn.dataset.currentActive === 'true';
    toggleFamilyActive(toggleBtn.dataset.familyId, isCurrentlyActive);
  }
});

// Auto-generate slug as category name is typed in Add Category modal
addCategoryName?.addEventListener('input', () => {
  if (addCategorySlug) {
    addCategorySlug.value = generateCategorySlug(addCategoryName.value);
  }
});

// --- ATTRIBUTES TAB (SIZES & COLORS) LISTENERS ---
sizesRefreshButton?.addEventListener('click', () => loadSizes(true));
sizesSearch?.addEventListener('input', renderSizes);
addSizeButton?.addEventListener('click', openAddSizeModal);

// Sizes table event delegation for Edit, Toggle, and Delete buttons
sizesList?.addEventListener('click', event => {
  const editBtn = event.target.closest('.admin-size-edit');
  if (editBtn && editBtn.dataset.sizeId) {
    openEditSize(editBtn.dataset.sizeId);
    return;
  }

  const toggleBtn = event.target.closest('.admin-size-toggle');
  if (toggleBtn && toggleBtn.dataset.sizeId) {
    const isCurrentlyActive = toggleBtn.dataset.currentActive === 'true';
    toggleSizeActive(toggleBtn.dataset.sizeId, isCurrentlyActive);
    return;
  }

  const deleteBtn = event.target.closest('.admin-size-delete');
  if (deleteBtn && deleteBtn.dataset.sizeId) {
    openDeleteAttributeModal('size', deleteBtn.dataset.sizeId);
  }
});

// Auto-suggest size code as name is typed in Add Size modal
addSizeName?.addEventListener('input', () => {
  if (addSizeCode && !addSizeCode.dataset.manuallyEdited) {
    addSizeCode.value = generateSizeCode(addSizeName.value);
  }
});

addSizeCode?.addEventListener('input', () => {
  if (addSizeCode) addSizeCode.dataset.manuallyEdited = 'true';
});

colorsRefreshButton?.addEventListener('click', () => loadColors(true));
colorsSearch?.addEventListener('input', renderColors);
addColorButton?.addEventListener('click', openAddColorModal);

// Colors table event delegation for Edit, Toggle, and Delete buttons
colorsList?.addEventListener('click', event => {
  const editBtn = event.target.closest('.admin-color-edit');
  if (editBtn && editBtn.dataset.colorId) {
    openEditColor(editBtn.dataset.colorId);
    return;
  }

  const toggleBtn = event.target.closest('.admin-color-toggle');
  if (toggleBtn && toggleBtn.dataset.colorId) {
    const isCurrentlyActive = toggleBtn.dataset.currentActive === 'true';
    toggleColorActive(toggleBtn.dataset.colorId, isCurrentlyActive);
    return;
  }

  const deleteBtn = event.target.closest('.admin-color-delete');
  if (deleteBtn && deleteBtn.dataset.colorId) {
    openDeleteAttributeModal('color', deleteBtn.dataset.colorId);
  }
});

// Color picker and Hex sync in Add Color modal
addColorHex?.addEventListener('input', () => {
  syncColorPickerAndHex(addColorHex, addColorPicker, addColorPreview);
});

addColorPicker?.addEventListener('input', () => {
  if (addColorHex && addColorPicker) {
    addColorHex.value = addColorPicker.value.toUpperCase();
    if (addColorPreview) addColorPreview.style.backgroundColor = addColorPicker.value;
  }
});

// Color picker and Hex sync in Edit Color modal
editColorHex?.addEventListener('input', () => {
  syncColorPickerAndHex(editColorHex, editColorPicker, editColorPreview);
});

editColorPicker?.addEventListener('input', () => {
  if (editColorHex && editColorPicker) {
    editColorHex.value = editColorPicker.value.toUpperCase();
    if (editColorPreview) editColorPreview.style.backgroundColor = editColorPicker.value;
  }
});

// --- EDIT PRODUCT MODAL LISTENERS ---
editProductForm?.addEventListener('submit', saveProductEdit);
editCloseBtn?.addEventListener('click', closeEditProductModal);
editCancelBtn?.addEventListener('click', closeEditProductModal);
editProductModal?.addEventListener('click', event => {
  if (event.target === editProductModal) {
    closeEditProductModal();
  }
});

editProductPricingMode?.addEventListener('change', () => {
  updateProductPricingModeUI(editProductPricingMode, editProductMrp, editProductSalePrice, editProductDiscountBadge, editProductCategory, editProductPricingModeHint);
});

editProductMrp?.addEventListener('input', () => {
  updateProductPricingModeUI(editProductPricingMode, editProductMrp, editProductSalePrice, editProductDiscountBadge, editProductCategory, editProductPricingModeHint);
});

editProductSalePrice?.addEventListener('input', () => {
  if (editProductPricingMode?.value === 'custom') {
    if (editProductDiscountBadge) {
      editProductDiscountBadge.innerHTML = renderDiscountBadge(editProductMrp?.value, editProductSalePrice.value);
    }
  }
});

editProductCategory?.addEventListener('change', () => {
  updateProductPricingModeUI(editProductPricingMode, editProductMrp, editProductSalePrice, editProductDiscountBadge, editProductCategory, editProductPricingModeHint);
});

editCustomColorBtn?.addEventListener('click', () => {
  const customColor = editCustomColorInput?.value.trim();
  if (customColor) {
    editModalSelectedColors.add(customColor);
    if (!editModalLegacyColors.includes(customColor)) editModalLegacyColors.push(customColor);
    renderColorPills(editProductColorsList, editModalSelectedColors, storeColors, editModalLegacyColors, () => {
      syncColorGalleriesUI(editColorGalleriesContainer, editModalSelectedColors, editModalColorGalleries, editStatus);
      updateVariantSummary(editVariantsSummaryText, editModalSelectedColors, editModalSelectedSizes);
    });
    syncColorGalleriesUI(editColorGalleriesContainer, editModalSelectedColors, editModalColorGalleries, editStatus);
    updateVariantSummary(editVariantsSummaryText, editModalSelectedColors, editModalSelectedSizes);
    if (editCustomColorInput) editCustomColorInput.value = '';
  }
});

const handleAddEditCustomSize = () => {
  const customSize = editCustomSizeInput?.value.trim();
  if (customSize) {
    editModalSelectedSizes.add(customSize);
    if (!editModalLegacySizes.includes(customSize)) editModalLegacySizes.push(customSize);
    renderSizePills(editProductSizesList, editModalSelectedSizes, storeSizes, editModalLegacySizes, () => {
      updateVariantSummary(editVariantsSummaryText, editModalSelectedColors, editModalSelectedSizes);
    });
    updateVariantSummary(editVariantsSummaryText, editModalSelectedColors, editModalSelectedSizes);
    if (editCustomSizeInput) editCustomSizeInput.value = '';
  }
};

editCustomSizeBtn?.addEventListener('click', handleAddEditCustomSize);
editCustomSizeInput?.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    handleAddEditCustomSize();
  }
});

editGenerateVariantsBtn?.addEventListener('click', () => {
  syncVariantsFromTable(editVariantsList, editModalVariants);
  const defaultMrp = Number(editProductMrp?.value) || 0;
  const defaultSalePrice = Number(editProductSalePrice?.value) || 0;
  const productId = editProductId?.value.trim() || 'product';
  editModalVariants = generateVariantMatrix(editModalSelectedColors, editModalSelectedSizes, defaultMrp, defaultSalePrice, productId, editModalExistingVariants, editModalVariants);
  renderVariantReviewTable(editVariantsList, editModalVariants, defaultMrp, defaultSalePrice);
  populateBulkPriceTargetDropdown(editBulkPriceTarget, editModalVariants, editModalSelectedColors);
});

editBulkMrp?.addEventListener('input', () => {
  if (editBulkDiscountBadge) {
    editBulkDiscountBadge.innerHTML = renderDiscountBadge(editBulkMrp.value, editBulkSalePrice?.value || 0);
  }
});

editBulkSalePrice?.addEventListener('input', () => {
  if (editBulkDiscountBadge) {
    editBulkDiscountBadge.innerHTML = renderDiscountBadge(editBulkMrp?.value || 0, editBulkSalePrice.value);
  }
});

editApplyBulkPriceBtn?.addEventListener('click', () => {
  applyBulkPricingToTable({
    tbodyEl: editVariantsList,
    variantsList: editModalVariants,
    targetColor: editBulkPriceTarget?.value || '__ALL__',
    mrp: editBulkMrp?.value,
    salePrice: editBulkSalePrice?.value,
    statusEl: editStatus
  });
});

editVariantsList?.addEventListener('input', event => {
  if (event.target.classList.contains('var-input-mrp') || event.target.classList.contains('var-input-sale-price')) {
    const row = event.target.closest('tr[data-variant-index]');
    if (row) {
      const mrpInput = row.querySelector('.var-input-mrp');
      const salePriceInput = row.querySelector('.var-input-sale-price');
      const discountCell = row.querySelector('.var-discount-container');
      const mrp = Number(mrpInput?.value);
      const sale = Number(salePriceInput?.value);
      if (discountCell) {
        discountCell.innerHTML = renderDiscountBadge(mrp, sale, 'admin-var-discount-badge');
      }
      const index = parseInt(row.dataset.variantIndex, 10);
      if (!Number.isNaN(index) && editModalVariants[index]) {
        editModalVariants[index].mrp = mrp;
        editModalVariants[index].salePrice = sale;
        editModalVariants[index].price = sale;
      }
    }
  }
});

editVariantsList?.addEventListener('click', event => {
  const removeBtn = event.target.closest('.var-remove-btn');
  if (removeBtn && removeBtn.dataset.variantIndex !== undefined) {
    const index = parseInt(removeBtn.dataset.variantIndex, 10);
    if (!Number.isNaN(index) && editModalVariants[index]) {
      syncVariantsFromTable(editVariantsList, editModalVariants);
      if (editModalVariants[index].isNew) {
        editModalVariants.splice(index, 1);
      } else {
        editModalVariants[index].isDeleted = true;
      }
      const defaultMrp = Number(editProductMrp?.value) || 0;
      const defaultSalePrice = Number(editProductSalePrice?.value) || 0;
      renderVariantReviewTable(editVariantsList, editModalVariants, defaultMrp, defaultSalePrice);
      populateBulkPriceTargetDropdown(editBulkPriceTarget, editModalVariants, editModalSelectedColors);
    }
  }
});

// --- ADD PRODUCT MODAL LISTENERS ---
addProductButton?.addEventListener('click', openAddProductModal);
addProductForm?.addEventListener('submit', saveNewProduct);
addCloseBtn?.addEventListener('click', closeAddProductModal);
addCancelBtn?.addEventListener('click', closeAddProductModal);
addProductModal?.addEventListener('click', event => {
  if (event.target === addProductModal) {
    closeAddProductModal();
  }
});

addProductPricingMode?.addEventListener('change', () => {
  updateProductPricingModeUI(addProductPricingMode, addProductMrp, addProductSalePrice, addProductDiscountBadge, addProductCategory, addProductPricingModeHint);
});

addProductMrp?.addEventListener('input', () => {
  updateProductPricingModeUI(addProductPricingMode, addProductMrp, addProductSalePrice, addProductDiscountBadge, addProductCategory, addProductPricingModeHint);
});

addProductSalePrice?.addEventListener('input', () => {
  if (addProductPricingMode?.value === 'custom') {
    if (addProductDiscountBadge) {
      addProductDiscountBadge.innerHTML = renderDiscountBadge(addProductMrp?.value, addProductSalePrice.value);
    }
  }
});

addCustomColorBtn?.addEventListener('click', () => {
  const customColor = addCustomColorInput?.value.trim();
  if (customColor) {
    addModalSelectedColors.add(customColor);
    renderColorPills(addProductColorsList, addModalSelectedColors, storeColors, [], () => {
      syncColorGalleriesUI(addColorGalleriesContainer, addModalSelectedColors, addModalColorGalleries, addStatus);
      updateVariantSummary(addVariantsSummaryText, addModalSelectedColors, addModalSelectedSizes);
    });
    syncColorGalleriesUI(addColorGalleriesContainer, addModalSelectedColors, addModalColorGalleries, addStatus);
    updateVariantSummary(addVariantsSummaryText, addModalSelectedColors, addModalSelectedSizes);
    if (addCustomColorInput) addCustomColorInput.value = '';
  }
});

const handleAddModalCustomSize = () => {
  const customSize = addCustomSizeInput?.value.trim();
  if (customSize) {
    addModalSelectedSizes.add(customSize);
    renderSizePills(addProductSizesList, addModalSelectedSizes, storeSizes, [], () => {
      updateVariantSummary(addVariantsSummaryText, addModalSelectedColors, addModalSelectedSizes);
    });
    updateVariantSummary(addVariantsSummaryText, addModalSelectedColors, addModalSelectedSizes);
    if (addCustomSizeInput) addCustomSizeInput.value = '';
  }
};

addCustomSizeBtn?.addEventListener('click', handleAddModalCustomSize);
addCustomSizeInput?.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    handleAddModalCustomSize();
  }
});

addGenerateVariantsBtn?.addEventListener('click', () => {
  syncVariantsFromTable(addVariantsList, addModalVariants);
  const defaultMrp = Number(addProductMrp?.value) || 0;
  const defaultSalePrice = Number(addProductSalePrice?.value) || 0;
  const name = addProductName?.value.trim() || 'product';
  const slug = generateProductSlug(name, products);
  addModalVariants = generateVariantMatrix(addModalSelectedColors, addModalSelectedSizes, defaultMrp, defaultSalePrice, slug, [], addModalVariants);
  renderVariantReviewTable(addVariantsList, addModalVariants, defaultMrp, defaultSalePrice);
  populateBulkPriceTargetDropdown(addBulkPriceTarget, addModalVariants, addModalSelectedColors);
});

addBulkMrp?.addEventListener('input', () => {
  if (addBulkDiscountBadge) {
    addBulkDiscountBadge.innerHTML = renderDiscountBadge(addBulkMrp.value, addBulkSalePrice?.value || 0);
  }
});

addBulkSalePrice?.addEventListener('input', () => {
  if (addBulkDiscountBadge) {
    addBulkDiscountBadge.innerHTML = renderDiscountBadge(addBulkMrp?.value || 0, addBulkSalePrice.value);
  }
});

addApplyBulkPriceBtn?.addEventListener('click', () => {
  applyBulkPricingToTable({
    tbodyEl: addVariantsList,
    variantsList: addModalVariants,
    targetColor: addBulkPriceTarget?.value || '__ALL__',
    mrp: addBulkMrp?.value,
    salePrice: addBulkSalePrice?.value,
    statusEl: addStatus
  });
});

addVariantsList?.addEventListener('input', event => {
  if (event.target.classList.contains('var-input-mrp') || event.target.classList.contains('var-input-sale-price')) {
    const row = event.target.closest('tr[data-variant-index]');
    if (row) {
      const mrpInput = row.querySelector('.var-input-mrp');
      const salePriceInput = row.querySelector('.var-input-sale-price');
      const discountCell = row.querySelector('.var-discount-container');
      const mrp = Number(mrpInput?.value);
      const sale = Number(salePriceInput?.value);
      if (discountCell) {
        discountCell.innerHTML = renderDiscountBadge(mrp, sale, 'admin-var-discount-badge');
      }
      const index = parseInt(row.dataset.variantIndex, 10);
      if (!Number.isNaN(index) && addModalVariants[index]) {
        addModalVariants[index].mrp = mrp;
        addModalVariants[index].salePrice = sale;
        addModalVariants[index].price = sale;
      }
    }
  }
});

addVariantsList?.addEventListener('click', event => {
  const removeBtn = event.target.closest('.var-remove-btn');
  if (removeBtn && removeBtn.dataset.variantIndex !== undefined) {
    const index = parseInt(removeBtn.dataset.variantIndex, 10);
    if (!Number.isNaN(index) && addModalVariants[index]) {
      syncVariantsFromTable(addVariantsList, addModalVariants);
      addModalVariants.splice(index, 1);
      const defaultMrp = Number(addProductMrp?.value) || 0;
      const defaultSalePrice = Number(addProductSalePrice?.value) || 0;
      renderVariantReviewTable(addVariantsList, addModalVariants, defaultMrp, defaultSalePrice);
      populateBulkPriceTargetDropdown(addBulkPriceTarget, addModalVariants, addModalSelectedColors);
    }
  }
});

addProductCategory?.addEventListener('change', () => {
  const selectedName = addProductCategory.value;
  const matchedCategory = categories.find(c => c.name === selectedName);
  if (addProductCategorySlug) {
    addProductCategorySlug.value = matchedCategory ? matchedCategory.slug : '';
  }
  updateProductPricingModeUI(addProductPricingMode, addProductMrp, addProductSalePrice, addProductDiscountBadge, addProductCategory, addProductPricingModeHint);
});

// --- DELETE PRODUCT MODAL LISTENERS ---
deleteConfirmBtn?.addEventListener('click', confirmDeleteProduct);
deleteCloseBtn?.addEventListener('click', closeDeleteProductModal);
deleteCancelBtn?.addEventListener('click', closeDeleteProductModal);
deleteProductModal?.addEventListener('click', event => {
  if (event.target === deleteProductModal) {
    closeDeleteProductModal();
  }
});

// --- ADD CATEGORY MODAL LISTENERS ---
addCategoryForm?.addEventListener('submit', saveNewCategory);
addCategoryCloseBtn?.addEventListener('click', closeAddCategoryModal);
addCategoryCancelBtn?.addEventListener('click', closeAddCategoryModal);
addCategoryModal?.addEventListener('click', event => {
  if (event.target === addCategoryModal) {
    closeAddCategoryModal();
  }
});
addCategoryDiscountType?.addEventListener('change', () => {
  updateCategoryDiscountFields(
    addCategoryDiscountType,
    addCategoryDiscountValue,
    addCategoryDiscountValueGroup,
    addCategoryDiscountValueLabel,
    addCategoryDiscountValueHint,
    addCategoryDiscountIsActive,
    addCategoryDiscountActiveGroup
  );
});

// --- EDIT CATEGORY MODAL LISTENERS ---
editCategoryForm?.addEventListener('submit', saveCategoryEdit);
editCategoryCloseBtn?.addEventListener('click', closeEditCategoryModal);
editCategoryCancelBtn?.addEventListener('click', closeEditCategoryModal);
editCategoryModal?.addEventListener('click', event => {
  if (event.target === editCategoryModal) {
    closeEditCategoryModal();
  }
});
editCategoryDiscountType?.addEventListener('change', () => {
  updateCategoryDiscountFields(
    editCategoryDiscountType,
    editCategoryDiscountValue,
    editCategoryDiscountValueGroup,
    editCategoryDiscountValueLabel,
    editCategoryDiscountValueHint,
    editCategoryDiscountIsActive,
    editCategoryDiscountActiveGroup
  );
});

// --- DELETE CATEGORY MODAL LISTENERS ---
deleteCategoryConfirmBtn?.addEventListener('click', confirmDeleteCategory);
deleteCategoryCloseBtn?.addEventListener('click', closeDeleteCategoryModal);
deleteCategoryCancelBtn?.addEventListener('click', closeDeleteCategoryModal);
deleteCategoryModal?.addEventListener('click', event => {
  if (event.target === deleteCategoryModal) {
    closeDeleteCategoryModal();
  }
});

// --- ADD FAMILY FORM & MODAL LISTENERS ---
async function saveNewFamily(event) {
  event.preventDefault();
  if (!supabase) return;

  const name = (addFamilyName?.value || '').trim();
  const categoryId = addFamilyCategory?.value || null;
  const description = (addFamilyDescription?.value || '').trim();
  const sortOrder = Number(addFamilySortOrder?.value || 0);
  const isActive = addFamilyIsActive?.checked !== false;

  if (!name) {
    if (addFamilyStatus) {
      addFamilyStatus.textContent = 'Please enter a variety name.';
      addFamilyStatus.classList.add('is-error');
    }
    addFamilyName?.focus();
    return;
  }

  if (!categoryId) {
    if (addFamilyStatus) {
      addFamilyStatus.textContent = 'Please select a category for this variety.';
      addFamilyStatus.classList.add('is-error');
    }
    addFamilyCategory?.focus();
    return;
  }

  const selectedCat = categories.find(c => c.id === categoryId);
  const categoryName = selectedCat?.name || '';
  const categorySlug = selectedCat?.slug || '';
  const slug = generateProductSlug(name + '-family', productFamilies);

  if (addFamilySaveBtn) addFamilySaveBtn.disabled = true;
  if (addFamilyCancelBtn) addFamilyCancelBtn.disabled = true;
  if (addFamilyStatus) {
    addFamilyStatus.textContent = 'Creating product variety…';
    addFamilyStatus.classList.remove('is-error');
  }

  try {
    let displayImageUrl = (addFamilyDpUrl?.value || '').trim();
    if (addFamilyDpState.file) {
      if (addFamilyStatus) addFamilyStatus.textContent = 'Uploading variety display image…';
      displayImageUrl = await uploadFamilyImageFile(addFamilyDpState.file);
    }

    const payload = {
      name,
      slug,
      category_id: categoryId,
      category_name: categoryName,
      category_slug: categorySlug,
      description,
      is_active: isActive,
      sort_order: sortOrder
    };

    if (displayImageUrl) {
      payload.display_image = displayImageUrl;
    }

    let insertRes = await supabase.from('product_families').insert(payload);
    if (insertRes.error && (insertRes.error.code === '42703' || insertRes.error.message?.includes('display_image'))) {
      delete payload.display_image;
      insertRes = await supabase.from('product_families').insert(payload);
    }

    if (insertRes.error) throw insertRes.error;

    closeAddFamilyModal();
    await loadProductFamilies(false);
  } catch (err) {
    console.error('Error saving new product family:', err);
    if (addFamilyStatus) {
      addFamilyStatus.textContent = 'Error creating variety: ' + (err.message || 'Please try again.');
      addFamilyStatus.classList.add('is-error');
    }
  } finally {
    if (addFamilySaveBtn) addFamilySaveBtn.disabled = false;
    if (addFamilyCancelBtn) addFamilyCancelBtn.disabled = false;
  }
}

async function saveFamilyEdit(event) {
  event.preventDefault();
  if (!supabase) return;

  const id = editFamilyId?.value;
  const name = (editFamilyName?.value || '').trim();
  const categoryId = editFamilyCategory?.value || null;
  const description = (editFamilyDescription?.value || '').trim();
  const sortOrder = Number(editFamilySortOrder?.value || 0);
  const isActive = editFamilyIsActive?.checked !== false;

  if (!id) return;
  if (!name) {
    if (editFamilyStatus) {
      editFamilyStatus.textContent = 'Please enter a variety name.';
      editFamilyStatus.classList.add('is-error');
    }
    editFamilyName?.focus();
    return;
  }

  const selectedCat = categories.find(c => c.id === categoryId);
  const categoryName = selectedCat?.name || '';
  const categorySlug = selectedCat?.slug || '';

  if (editFamilySaveBtn) editFamilySaveBtn.disabled = true;
  if (editFamilyCancelBtn) editFamilyCancelBtn.disabled = true;
  if (editFamilyStatus) {
    editFamilyStatus.textContent = 'Saving variety changes…';
    editFamilyStatus.classList.remove('is-error');
  }

  try {
    // Determine the final display image URL to save
    let displayImageUrl = null;

    if (editFamilyDpState.file) {
      // User selected a new file (either direct upload or via adjuster) — upload it
      if (editFamilyStatus) editFamilyStatus.textContent = 'Uploading variety display image…';
      const uploaded = await uploadFamilyImageFile(editFamilyDpState.file);
      if (!uploaded) throw new Error('Image upload failed — no URL returned from storage.');
      displayImageUrl = uploaded;
    } else if (editFamilyDpState.url) {
      // No new file, but state has a URL (existing or pasted URL)
      displayImageUrl = editFamilyDpState.url;
    } else {
      // Fallback: read from the URL text field
      const fieldVal = (editFamilyDpUrl?.value || '').trim();
      if (fieldVal) displayImageUrl = fieldVal;
    }

    const payload = {
      name,
      category_id: categoryId,
      category_name: categoryName,
      category_slug: categorySlug,
      description,
      is_active: isActive,
      sort_order: sortOrder,
      updated_at: new Date().toISOString()
    };

    // Always include display_image in payload if we have one;
    // if null, only omit it so the DB retains existing value (no change)
    if (displayImageUrl !== null) {
      payload.display_image = displayImageUrl;
    }

    let updateRes = await supabase.from('product_families').update(payload).eq('id', id);
    if (updateRes.error && (updateRes.error.code === '42703' || updateRes.error.message?.includes('display_image'))) {
      // display_image column not yet in DB — save other fields and warn
      console.warn('[Family Save] display_image column not found in DB, saving without it.');
      delete payload.display_image;
      updateRes = await supabase.from('product_families').update(payload).eq('id', id);
    }

    if (updateRes.error) throw updateRes.error;

    closeEditFamilyModal();
    await loadProductFamilies(false);
  } catch (err) {
    console.error('[FamilyDP] saveFamilyEdit ERROR:', err);
    if (editFamilyStatus) {
      editFamilyStatus.textContent = 'Error updating variety: ' + (err.message || 'Please try again.');
      editFamilyStatus.classList.add('is-error');
    }
  } finally {
    if (editFamilySaveBtn) editFamilySaveBtn.disabled = false;
    if (editFamilyCancelBtn) editFamilyCancelBtn.disabled = false;
  }
}

function openAddFamilyAdjust() {
  const srcUrl = addFamilyDpState.previewUrl || addFamilyDpUrl?.value?.trim();
  if (!srcUrl) {
    alert('Please select or enter an image first before adjusting.');
    return;
  }

  openImageAdjustModal({
    imageItem: {
      id: 'add-family-dp',
      previewUrl: addFamilyDpState.previewUrl,
      url: addFamilyDpState.url || addFamilyDpState.previewUrl,
      file: addFamilyDpState.originalFile || addFamilyDpState.file
    },
    aspectRatio: '3:4',
    modalTitle: 'Adjust & Crop Variety Display Image',
    onApply: (newFile, newPreviewUrl) => {
      if (addFamilyDpState.previewUrl?.startsWith('blob:') && addFamilyDpState.previewUrl !== addFamilyDpState.originalFile) {
        URL.revokeObjectURL(addFamilyDpState.previewUrl);
      }
      addFamilyDpState.file = newFile;
      addFamilyDpState.previewUrl = newPreviewUrl;
      addFamilyDpState.hasAdjustment = true;
      if (addFamilyDpPreview) addFamilyDpPreview.src = newPreviewUrl;
    }
  });
}

function openEditFamilyAdjust() {
  const srcUrl = editFamilyDpState.previewUrl || editFamilyDpUrl?.value?.trim();
  if (!srcUrl) {
    alert('Please select or enter an image first before adjusting.');
    return;
  }

  openImageAdjustModal({
    imageItem: {
      id: 'edit-family-dp',
      previewUrl: editFamilyDpState.previewUrl,
      url: editFamilyDpState.url || editFamilyDpState.previewUrl,
      file: editFamilyDpState.originalFile || editFamilyDpState.file
    },
    aspectRatio: '3:4',
    modalTitle: 'Adjust & Crop Variety Display Image',
    onApply: (newFile, newPreviewUrl) => {
      if (editFamilyDpState.previewUrl?.startsWith('blob:') && editFamilyDpState.previewUrl !== editFamilyDpState.originalFile) {
        URL.revokeObjectURL(editFamilyDpState.previewUrl);
      }
      editFamilyDpState.file = newFile;
      editFamilyDpState.previewUrl = newPreviewUrl;
      editFamilyDpState.hasAdjustment = true;
      if (editFamilyDpPreview) editFamilyDpPreview.src = newPreviewUrl;
    }
  });
}

addFamilyForm?.addEventListener('submit', saveNewFamily);
addFamilyCloseBtn?.addEventListener('click', closeAddFamilyModal);
addFamilyCancelBtn?.addEventListener('click', closeAddFamilyModal);
addFamilyModal?.addEventListener('click', event => {
  if (event.target === addFamilyModal) closeAddFamilyModal();
});

addFamilyAdjustBtn?.addEventListener('click', openAddFamilyAdjust);

addFamilyDpFile?.addEventListener('change', () => {
  const file = addFamilyDpFile.files?.[0];
  if (file) {
    if (addFamilyDpState.previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(addFamilyDpState.previewUrl);
    }
    const previewUrl = URL.createObjectURL(file);
    addFamilyDpState = {
      file: file,
      originalFile: file,
      url: '',
      previewUrl: previewUrl,
      hasAdjustment: false
    };
    if (addFamilyDpPreview) addFamilyDpPreview.src = previewUrl;
    if (addFamilyDpUrl) addFamilyDpUrl.value = '';
  }
});

addFamilyDpUrl?.addEventListener('input', () => {
  const url = addFamilyDpUrl.value.trim();
  if (url) {
    if (addFamilyDpState.previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(addFamilyDpState.previewUrl);
    }
    addFamilyDpState = {
      file: null,
      originalFile: null,
      url: url,
      previewUrl: url,
      hasAdjustment: false
    };
    if (addFamilyDpPreview) addFamilyDpPreview.src = url;
    if (addFamilyDpFile) addFamilyDpFile.value = '';
  }
});

editFamilyForm?.addEventListener('submit', saveFamilyEdit);
editFamilyCloseBtn?.addEventListener('click', closeEditFamilyModal);
editFamilyCancelBtn?.addEventListener('click', closeEditFamilyModal);
editFamilyModal?.addEventListener('click', event => {
  if (event.target === editFamilyModal) closeEditFamilyModal();
});

editFamilyAdjustBtn?.addEventListener('click', openEditFamilyAdjust);

// Event delegation: Edit Product button inside assigned-products list
// Uses data-product-id attribute instead of inline onclick to work correctly
// when admin.js is loaded as type="module" (module-scope functions are not global).
editFamilyProductsList?.addEventListener('click', event => {
  const btn = event.target.closest('.edit-family-product-btn');
  if (btn && btn.dataset.productId) {
    const productId = btn.dataset.productId;
    closeEditFamilyModal();
    // Small delay to ensure family modal is fully hidden before product modal opens
    setTimeout(() => {
      openEditProduct(productId);
    }, 60);
  }
});

editFamilyDpFile?.addEventListener('change', () => {
  const file = editFamilyDpFile.files?.[0];
  if (file) {
    if (editFamilyDpState.previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(editFamilyDpState.previewUrl);
    }
    const previewUrl = URL.createObjectURL(file);
    editFamilyDpState = {
      file: file,
      originalFile: file,
      url: '',
      previewUrl: previewUrl,
      hasAdjustment: false
    };
    if (editFamilyDpPreview) editFamilyDpPreview.src = previewUrl;
    if (editFamilyDpUrl) editFamilyDpUrl.value = '';
  }
});

editFamilyDpUrl?.addEventListener('input', () => {
  const url = editFamilyDpUrl.value.trim();
  if (url) {
    if (editFamilyDpState.previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(editFamilyDpState.previewUrl);
    }
    editFamilyDpState = {
      file: null,
      originalFile: null,
      url: url,
      previewUrl: url,
      hasAdjustment: false
    };
    if (editFamilyDpPreview) editFamilyDpPreview.src = url;
    if (editFamilyDpFile) editFamilyDpFile.value = '';
  }
});

// --- ADD SIZE MODAL LISTENERS ---
addSizeForm?.addEventListener('submit', saveNewSize);
addSizeCloseBtn?.addEventListener('click', closeAddSizeModal);
addSizeCancelBtn?.addEventListener('click', closeAddSizeModal);
addSizeModal?.addEventListener('click', event => {
  if (event.target === addSizeModal) {
    closeAddSizeModal();
  }
});

// --- EDIT SIZE MODAL LISTENERS ---
editSizeForm?.addEventListener('submit', saveSizeEdit);
editSizeCloseBtn?.addEventListener('click', closeEditSizeModal);
editSizeCancelBtn?.addEventListener('click', closeEditSizeModal);
editSizeModal?.addEventListener('click', event => {
  if (event.target === editSizeModal) {
    closeEditSizeModal();
  }
});

// --- ADD COLOR MODAL LISTENERS ---
addColorForm?.addEventListener('submit', saveNewColor);
addColorCloseBtn?.addEventListener('click', closeAddColorModal);
addColorCancelBtn?.addEventListener('click', closeAddColorModal);
addColorModal?.addEventListener('click', event => {
  if (event.target === addColorModal) {
    closeAddColorModal();
  }
});

// --- EDIT COLOR MODAL LISTENERS ---
editColorForm?.addEventListener('submit', saveColorEdit);
editColorCloseBtn?.addEventListener('click', closeEditColorModal);
editColorCancelBtn?.addEventListener('click', closeEditColorModal);
editColorModal?.addEventListener('click', event => {
  if (event.target === editColorModal) {
    closeEditColorModal();
  }
});

// --- DELETE ATTRIBUTE MODAL LISTENERS ---
deleteAttributeConfirmBtn?.addEventListener('click', confirmDeleteAttribute);
deleteAttributeCloseBtn?.addEventListener('click', closeDeleteAttributeModal);
deleteAttributeCancelBtn?.addEventListener('click', closeDeleteAttributeModal);
deleteAttributeModal?.addEventListener('click', event => {
  if (event.target === deleteAttributeModal) {
    closeDeleteAttributeModal();
  }
});

// --- COUPONS TAB LISTENERS ---
couponsRefreshButton?.addEventListener('click', () => loadCoupons(true));
couponsSearch?.addEventListener('input', renderCoupons);
couponsStatusFilter?.addEventListener('change', renderCoupons);
addCouponButton?.addEventListener('click', openAddCouponModal);

// Coupons table delegation for Edit, Toggle, and Delete
couponsList?.addEventListener('click', event => {
  const editBtn = event.target.closest('.admin-coupon-edit');
  if (editBtn && editBtn.dataset.couponId) {
    openEditCoupon(editBtn.dataset.couponId);
    return;
  }

  const toggleBtn = event.target.closest('.admin-coupon-toggle');
  if (toggleBtn && toggleBtn.dataset.couponId) {
    const isCurrentlyActive = toggleBtn.dataset.currentActive === 'true';
    toggleCouponActive(toggleBtn.dataset.couponId, isCurrentlyActive);
    return;
  }

  const deleteBtn = event.target.closest('.admin-coupon-delete');
  if (deleteBtn && deleteBtn.dataset.couponId) {
    openDeleteCouponModal(deleteBtn.dataset.couponId);
  }
});

// Auto-uppercase coupon code as typed
addCouponCode?.addEventListener('input', () => {
  if (addCouponCode) addCouponCode.value = addCouponCode.value.toUpperCase();
});
editCouponCode?.addEventListener('input', () => {
  if (editCouponCode) editCouponCode.value = editCouponCode.value.toUpperCase();
});

// Discount type switch in Add & Edit Coupon modals
addCouponDiscountType?.addEventListener('change', () => {
  updateCouponDiscountUI(addCouponDiscountType, addCouponDiscountValueGroup, addCouponDiscountValueLabel, addCouponDiscountValueHint, addCouponMaxDiscountGroup);
});
editCouponDiscountType?.addEventListener('change', () => {
  updateCouponDiscountUI(editCouponDiscountType, editCouponDiscountValueGroup, editCouponDiscountValueLabel, editCouponDiscountValueHint, editCouponMaxDiscountGroup);
});

// --- ADD COUPON MODAL LISTENERS ---
addCouponForm?.addEventListener('submit', saveNewCoupon);
addCouponCloseBtn?.addEventListener('click', closeAddCouponModal);
addCouponCancelBtn?.addEventListener('click', closeAddCouponModal);
addCouponModal?.addEventListener('click', event => {
  if (event.target === addCouponModal) {
    closeAddCouponModal();
  }
});

// --- EDIT COUPON MODAL LISTENERS ---
editCouponForm?.addEventListener('submit', saveCouponEdit);
editCouponCloseBtn?.addEventListener('click', closeEditCouponModal);
editCouponCancelBtn?.addEventListener('click', closeEditCouponModal);
editCouponModal?.addEventListener('click', event => {
  if (event.target === editCouponModal) {
    closeEditCouponModal();
  }
});

// --- DELETE COUPON MODAL LISTENERS ---
deleteCouponConfirmBtn?.addEventListener('click', confirmDeleteCoupon);
deleteCouponCloseBtn?.addEventListener('click', closeDeleteCouponModal);
deleteCouponCancelBtn?.addEventListener('click', closeDeleteCouponModal);
deleteCouponModal?.addEventListener('click', event => {
  if (event.target === deleteCouponModal) {
    closeDeleteCouponModal();
  }
});

// --- BANNERS TAB LISTENERS ---
bannersRefreshButton?.addEventListener('click', () => loadBanners(true));
bannersSearch?.addEventListener('input', renderBanners);
bannersStatusFilter?.addEventListener('change', renderBanners);
addBannerButton?.addEventListener('click', openAddBannerModal);

// Banners table event delegation for Edit, Toggle, and Delete
bannersList?.addEventListener('click', event => {
  const editBtn = event.target.closest('.admin-banner-edit');
  if (editBtn && editBtn.dataset.bannerId) {
    openEditBanner(editBtn.dataset.bannerId);
    return;
  }

  const toggleBtn = event.target.closest('.admin-banner-toggle');
  if (toggleBtn && toggleBtn.dataset.bannerId) {
    const isCurrentlyActive = toggleBtn.dataset.currentActive === 'true';
    toggleBannerActive(toggleBtn.dataset.bannerId, isCurrentlyActive);
    return;
  }

  const deleteBtn = event.target.closest('.admin-banner-delete');
  if (deleteBtn && deleteBtn.dataset.bannerId) {
    openDeleteBannerModal(deleteBtn.dataset.bannerId);
  }
});

// --- BANNER DROPZONES INITIALIZATION ---
setupBannerDropzone({
  dropzoneEl: addBannerDesktopDropzone,
  fileInputEl: addBannerDesktopFile,
  promptEl: addBannerDesktopPrompt,
  previewWrapperEl: addBannerDesktopPreviewWrapper,
  previewImgEl: addBannerDesktopPreviewImg,
  removeBtnEl: addBannerDesktopRemoveBtn,
  adjustBtnEl: addBannerDesktopAdjustBtn,
  stateHolder: addBannerState,
  fileKey: 'desktopFile',
  blobKey: 'desktopBlobUrl',
  urlInputEl: addBannerDesktopUrl,
  aspectRatio: '8:3',
  bannerType: 'desktop'
});

setupBannerDropzone({
  dropzoneEl: addBannerMobileDropzone,
  fileInputEl: addBannerMobileFile,
  promptEl: addBannerMobilePrompt,
  previewWrapperEl: addBannerMobilePreviewWrapper,
  previewImgEl: addBannerMobilePreviewImg,
  removeBtnEl: addBannerMobileRemoveBtn,
  adjustBtnEl: addBannerMobileAdjustBtn,
  stateHolder: addBannerState,
  fileKey: 'mobileFile',
  blobKey: 'mobileBlobUrl',
  urlInputEl: addBannerMobileUrl,
  aspectRatio: '4:5',
  bannerType: 'mobile'
});

setupBannerDropzone({
  dropzoneEl: addBannerTabletDropzone,
  fileInputEl: addBannerTabletFile,
  promptEl: addBannerTabletPrompt,
  previewWrapperEl: addBannerTabletPreviewWrapper,
  previewImgEl: addBannerTabletPreviewImg,
  removeBtnEl: addBannerTabletRemoveBtn,
  adjustBtnEl: addBannerTabletAdjustBtn,
  stateHolder: addBannerState,
  fileKey: 'tabletFile',
  blobKey: 'tabletBlobUrl',
  urlInputEl: addBannerTabletUrl,
  aspectRatio: '4:3',
  bannerType: 'tablet'
});

setupBannerDropzone({
  dropzoneEl: editBannerDesktopDropzone,
  fileInputEl: editBannerDesktopFile,
  promptEl: editBannerDesktopPrompt,
  previewWrapperEl: editBannerDesktopPreviewWrapper,
  previewImgEl: editBannerDesktopPreviewImg,
  removeBtnEl: editBannerDesktopRemoveBtn,
  adjustBtnEl: editBannerDesktopAdjustBtn,
  stateHolder: editBannerState,
  fileKey: 'desktopFile',
  blobKey: 'desktopBlobUrl',
  urlInputEl: editBannerDesktopUrl,
  aspectRatio: '8:3',
  bannerType: 'desktop'
});

setupBannerDropzone({
  dropzoneEl: editBannerMobileDropzone,
  fileInputEl: editBannerMobileFile,
  promptEl: editBannerMobilePrompt,
  previewWrapperEl: editBannerMobilePreviewWrapper,
  previewImgEl: editBannerMobilePreviewImg,
  removeBtnEl: editBannerMobileRemoveBtn,
  adjustBtnEl: editBannerMobileAdjustBtn,
  stateHolder: editBannerState,
  fileKey: 'mobileFile',
  blobKey: 'mobileBlobUrl',
  urlInputEl: editBannerMobileUrl,
  aspectRatio: '4:5',
  bannerType: 'mobile'
});

setupBannerDropzone({
  dropzoneEl: editBannerTabletDropzone,
  fileInputEl: editBannerTabletFile,
  promptEl: editBannerTabletPrompt,
  previewWrapperEl: editBannerTabletPreviewWrapper,
  previewImgEl: editBannerTabletPreviewImg,
  removeBtnEl: editBannerTabletRemoveBtn,
  adjustBtnEl: editBannerTabletAdjustBtn,
  stateHolder: editBannerState,
  fileKey: 'tabletFile',
  blobKey: 'tabletBlobUrl',
  urlInputEl: editBannerTabletUrl,
  aspectRatio: '4:3',
  bannerType: 'tablet'
});

// --- ADD BANNER MODAL LISTENERS ---
addBannerForm?.addEventListener('submit', saveNewBanner);
addBannerCloseBtn?.addEventListener('click', closeAddBannerModal);
addBannerCancelBtn?.addEventListener('click', closeAddBannerModal);
addBannerModal?.addEventListener('click', event => {
  if (event.target === addBannerModal) {
    closeAddBannerModal();
  }
});
addBannerPreviewAnimBtn?.addEventListener('click', () => triggerLiveAnimPreview('add', true));

// Text content inputs: soft live update
[addBannerBadgeText, addBannerHeading, addBannerSubheading, addBannerButtonText].forEach(el => {
  el?.addEventListener('input', () => triggerLiveAnimPreview('add', false));
});

// Motion & position settings inputs: trigger immediate preview replay on change or input
[
  addBannerBadgeAnimType, addBannerBadgeAnimDelay, addBannerBadgeAnimDur,
  addBannerHeadingAnimType, addBannerHeadingAnimDelay, addBannerHeadingAnimDur,
  addBannerSubheadingAnimType, addBannerSubheadingAnimDelay, addBannerSubheadingAnimDur,
  addBannerButtonAnimType, addBannerButtonAnimDelay, addBannerButtonAnimDur,
  addBannerKenBurns
].forEach(el => {
  el?.addEventListener('change', () => triggerLiveAnimPreview('add', true));
  el?.addEventListener('input', () => triggerLiveAnimPreview('add', true));
});

addBannerCustomizeTextBtn?.addEventListener('click', () => openTextCustomizeModal('add'));

const addBannerAnimDetails = document.getElementById('addBannerAnimDetails');
addBannerAnimDetails?.addEventListener('toggle', () => {
  if (addBannerAnimDetails.open) triggerLiveAnimPreview('add', true);
});

// --- EDIT BANNER MODAL LISTENERS ---
editBannerForm?.addEventListener('submit', saveBannerEdit);
editBannerCloseBtn?.addEventListener('click', closeEditBannerModal);
editBannerCancelBtn?.addEventListener('click', closeEditBannerModal);
editBannerModal?.addEventListener('click', event => {
  if (event.target === editBannerModal) {
    closeEditBannerModal();
  }
});
editBannerPreviewAnimBtn?.addEventListener('click', () => triggerLiveAnimPreview('edit', true));

// Text content inputs: soft live update
[editBannerBadgeText, editBannerHeading, editBannerSubheading, editBannerButtonText].forEach(el => {
  el?.addEventListener('input', () => triggerLiveAnimPreview('edit', false));
});

// Motion & position settings inputs: trigger immediate preview replay on change or input
[
  editBannerBadgeAnimType, editBannerBadgeAnimDelay, editBannerBadgeAnimDur,
  editBannerHeadingAnimType, editBannerHeadingAnimDelay, editBannerHeadingAnimDur,
  editBannerSubheadingAnimType, editBannerSubheadingAnimDelay, editBannerSubheadingAnimDur,
  editBannerButtonAnimType, editBannerButtonAnimDelay, editBannerButtonAnimDur,
  editBannerKenBurns
].forEach(el => {
  el?.addEventListener('change', () => triggerLiveAnimPreview('edit', true));
  el?.addEventListener('input', () => triggerLiveAnimPreview('edit', true));
});

editBannerCustomizeTextBtn?.addEventListener('click', () => openTextCustomizeModal('edit'));

const editBannerAnimDetails = document.getElementById('editBannerAnimDetails');
editBannerAnimDetails?.addEventListener('toggle', () => {
  if (editBannerAnimDetails.open) triggerLiveAnimPreview('edit', true);
});

// --- VISUAL TEXT CUSTOMIZER MODAL LISTENERS ---
textCustomizeCloseBtn?.addEventListener('click', closeTextCustomizeModal);
textCustomizeCancelBtn?.addEventListener('click', closeTextCustomizeModal);
textCustomizeApplyBtn?.addEventListener('click', applyAndSaveCustPositions);
adminTextCustomizeModal?.addEventListener('click', event => {
  if (event.target === adminTextCustomizeModal) {
    closeTextCustomizeModal();
  }
});
textCustResetBtn?.addEventListener('click', () => {
  tempCustPositions = {
    badge: { x: 0, y: 0, size_desktop: 'medium', size_tablet: 'medium', size_mobile: 'medium', font_family: '', colors: { full: '', words: {}, letters: {} } },
    heading: { x: 0, y: 0, size_desktop: 'medium', size_tablet: 'medium', size_mobile: 'medium', font_family: '', colors: { full: '', words: {}, letters: {} }, lines: null },
    subheading: { x: 0, y: 0, size_desktop: 'medium', size_tablet: 'medium', size_mobile: 'medium', font_family: '', colors: { full: '', words: {}, letters: {} }, lines: null },
    button: { x: 0, y: 0, size_desktop: 'medium', size_tablet: 'medium', size_mobile: 'medium', font_family: '', colors: { full: '', words: {}, letters: {} } }
  };
  refreshCustCanvasPositions();
  refreshCustSizeUi();
  refreshCustFontUi();
  selectCustElement(selectedCustElement);
  renderCustTokens();
});

textCustFontSelect?.addEventListener('change', () => {
  const selectedFont = textCustFontSelect.value || '';
  if (tempCustPositions[selectedCustElement]) {
    tempCustPositions[selectedCustElement].font_family = selectedFont;
    refreshCustCanvasPositions();
  }
});

document.querySelectorAll('.admin-text-customize-selectors .admin-text-pill-btn[data-element]').forEach(btn => {
  btn.addEventListener('click', () => selectCustElement(btn.dataset.element));
});

document.querySelectorAll('.admin-text-customize-views .admin-text-pill-btn[data-view]').forEach(btn => {
  btn.addEventListener('click', () => setCustCanvasView(btn.dataset.view));
});

initTextCustomizeDragEvents();
initTextColorCustomizeEvents();

// Global click delegation as a failsafe for banner preview and customizer buttons
document.addEventListener('click', event => {
  const custBtn = event.target?.closest?.('#addBannerCustomizeTextBtn, #editBannerCustomizeTextBtn');
  if (custBtn) {
    event.preventDefault();
    const mode = custBtn.id === 'addBannerCustomizeTextBtn' ? 'add' : 'edit';
    openTextCustomizeModal(mode);
    return;
  }

  const prevBtn = event.target?.closest?.('#addBannerPreviewAnimBtn, #editBannerPreviewAnimBtn');
  if (prevBtn) {
    event.preventDefault();
    const mode = prevBtn.id === 'addBannerPreviewAnimBtn' ? 'add' : 'edit';
    triggerLiveAnimPreview(mode, true);
    return;
  }

  const elemBtn = event.target?.closest?.('.admin-text-customize-selectors .admin-text-pill-btn[data-element]');
  if (elemBtn) {
    event.preventDefault();
    selectCustElement(elemBtn.dataset.element);
    return;
  }

  const viewBtn = event.target?.closest?.('.admin-text-customize-views .admin-text-pill-btn[data-view]');
  if (viewBtn) {
    event.preventDefault();
    setCustCanvasView(viewBtn.dataset.view);
    return;
  }

  const resetBtn = event.target?.closest?.('#textCustResetBtn');
  if (resetBtn) {
    event.preventDefault();
    tempCustPositions = {
      badge: { x: 0, y: 0, size_desktop: 'medium', size_tablet: 'medium', size_mobile: 'medium', font_family: '', colors: { full: '', words: {}, letters: {} } },
      heading: { x: 0, y: 0, size_desktop: 'medium', size_tablet: 'medium', size_mobile: 'medium', font_family: '', colors: { full: '', words: {}, letters: {} }, lines: null },
      subheading: { x: 0, y: 0, size_desktop: 'medium', size_tablet: 'medium', size_mobile: 'medium', font_family: '', colors: { full: '', words: {}, letters: {} }, lines: null },
      button: { x: 0, y: 0, size_desktop: 'medium', size_tablet: 'medium', size_mobile: 'medium', font_family: '', colors: { full: '', words: {}, letters: {} } }
    };
    refreshCustCanvasPositions();
    refreshCustSizeUi();
    refreshCustFontUi();
    selectCustElement(selectedCustElement);
    renderCustTokens();
    return;
  }

  const decBtn = event.target?.closest?.('#textCustSizeDec');
  if (decBtn) {
    event.preventDefault();
    adjustSelectedCustElementSize(-1);
    return;
  }

  const incBtn = event.target?.closest?.('#textCustSizeInc');
  if (incBtn) {
    event.preventDefault();
    adjustSelectedCustElementSize(1);
    return;
  }
});

// --- DELETE BANNER MODAL LISTENERS ---
deleteBannerConfirmBtn?.addEventListener('click', confirmDeleteBanner);
deleteBannerCloseBtn?.addEventListener('click', closeDeleteBannerModal);
deleteBannerCancelBtn?.addEventListener('click', closeDeleteBannerModal);
deleteBannerModal?.addEventListener('click', event => {
  if (event.target === deleteBannerModal) {
    closeDeleteBannerModal();
  }
});

// ============================================================================
// SYSTEM LOGS & AUDIT TRAIL LOGIC
// ============================================================================

const LOG_EVENT_CATEGORIES = {
  orders: ['order_created', 'cod_order_created', 'order_creation_started', 'order_creation_failed', 'create_order'],
  payments: ['payment_initiated', 'payment_success', 'payment_failed', 'payment_cancelled', 'payment_verification_failed', 'razorpay_signature_mismatch', 'razorpay_payment_verified_and_finalized', 'finalize_razorpay_payment_failed'],
  coupons: ['coupon_applied', 'coupon_rejected', 'coupon_removed', 'coupon_error', 'coupon_created', 'coupon_updated', 'coupon_deleted'],
  cart: ['cart_item_added', 'cart_quantity_updated', 'cart_item_removed', 'cart_error'],
  stock: ['stock_check_failed', 'stock_updated'],
  products: ['catalog_loaded', 'catalog_load_failed', 'category_fetch_failed', 'product_created', 'product_updated', 'product_deleted'],
  banners: ['banners_loaded', 'banners_fetch_failed', 'banners_init_failed', 'banner_created', 'banner_updated', 'banner_deleted', 'banner_diagnostic_report'],
  admin: ['admin_login_success', 'admin_login_failed', 'admin_access_denied', 'admin_logout', 'admin_session_restored'],
  tracking: ['order_tracking_lookup', 'order_tracking_failed', 'order_tracking_error'],
  system_errors: ['frontend_unhandled_error', 'frontend_unhandled_promise_rejection']
};

let appLogs = [];
let totalLogsCount = 0;
let currentLogsPage = 1;
const LOGS_PAGE_SIZE = 50;
let activeLogDetail = null;

function setLogsStatus(message = '', isError = false) {
  if (!logsStatus) return;
  logsStatus.textContent = message;
  logsStatus.classList.toggle('is-error', isError);
}

function formatLogTimestamp(isoString) {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }).format(d);
  } catch {
    return isoString;
  }
}

function renderLogLevelBadge(level) {
  const lvl = String(level || 'INFO').toUpperCase();
  if (lvl === 'INFO') return '<span class="admin-log-badge is-info">✓ INFO</span>';
  if (lvl === 'WARN') return '<span class="admin-log-badge is-warn">! WARN</span>';
  if (lvl === 'ERROR') return '<span class="admin-log-badge is-error">✕ ERROR</span>';
  return `<span class="admin-log-badge is-debug">• ${escapeHtml(lvl)}</span>`;
}

function getDateRangeBounds(rangeType, customFrom, customTo) {
  const now = new Date();
  if (rangeType === 'today') {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    return { start: start.toISOString(), end: end.toISOString() };
  }
  if (rangeType === 'yesterday') {
    const y = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0, 0);
    const yEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999);
    return { start: y.toISOString(), end: yEnd.toISOString() };
  }
  if (rangeType === 'last7') {
    const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return { start: start.toISOString(), end: now.toISOString() };
  }
  if (rangeType === 'last30') {
    const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    return { start: start.toISOString(), end: now.toISOString() };
  }
  if (rangeType === 'custom' && (customFrom || customTo)) {
    const start = customFrom ? new Date(`${customFrom}T00:00:00.000Z`).toISOString() : null;
    const end = customTo ? new Date(`${customTo}T23:59:59.999Z`).toISOString() : null;
    return { start, end };
  }
  return { start: null, end: null };
}

function updateLogsActiveFiltersUI() {
  if (!logsActiveFiltersBar || !logsActiveFiltersList) return;

  const activeFilters = [];
  const searchVal = (logsSearch?.value || '').trim();
  const levelVal = logsLevelFilter?.value || 'all';
  const eventVal = logsEventFilter?.value || 'all';
  const dateVal = logsDateFilter?.value || 'all';

  if (searchVal) {
    activeFilters.push({ key: 'search', label: `Search: "${searchVal}"` });
  }

  if (levelVal !== 'all') {
    const levelLabels = { INFO: 'Info / Success', WARN: 'Warning', ERROR: 'Error' };
    activeFilters.push({ key: 'level', label: `Level: ${levelLabels[levelVal] || levelVal}` });
  }

  if (eventVal !== 'all') {
    const eventLabels = {
      orders: 'Orders',
      payments: 'Payments',
      coupons: 'Coupons',
      cart: 'Cart',
      stock: 'Stock',
      products: 'Products',
      banners: 'Banners',
      admin: 'Admin',
      tracking: 'Order Tracking',
      system_errors: 'System Errors'
    };
    activeFilters.push({ key: 'event', label: `Event: ${eventLabels[eventVal] || eventVal}` });
  }

  if (dateVal !== 'all') {
    const dateLabels = {
      today: 'Today',
      yesterday: 'Yesterday',
      last7: 'Last 7 Days',
      last30: 'Last 30 Days',
      custom: 'Custom Range'
    };
    activeFilters.push({ key: 'date', label: `Date: ${dateLabels[dateVal] || dateVal}` });
  }

  // Update quick filter buttons active state
  [logQuickAll, logQuickInfo, logQuickWarn, logQuickError].forEach(btn => {
    if (!btn) return;
    const targetLvl = btn.dataset.logLevel;
    btn.classList.toggle('is-active', targetLvl === levelVal);
  });

  if (activeFilters.length === 0) {
    logsActiveFiltersBar.hidden = true;
    logsActiveFiltersList.innerHTML = '';
    return;
  }

  logsActiveFiltersBar.hidden = false;
  logsActiveFiltersList.innerHTML = activeFilters.map(f => `
    <span class="admin-active-filter-tag">
      <span>${escapeHtml(f.label)}</span>
      <button type="button" class="tag-remove" data-filter-key="${f.key}" aria-label="Remove filter ${escapeHtml(f.label)}">&times;</button>
    </span>
  `).join('') + '<button type="button" class="admin-active-clear-all" id="logsClearAllTagsBtn">Clear all</button>';
}

function renderLogs() {
  if (!logsList) return;

  updateLogsActiveFiltersUI();

  if (!appLogs || appLogs.length === 0) {
    logsList.innerHTML = '';
    setVisible(logsEmpty, true);
    if (logsTable) logsTable.hidden = true;
    if (logsPagination) logsPagination.hidden = true;
    return;
  }

  setVisible(logsEmpty, false);
  if (logsTable) logsTable.hidden = false;
  if (logsPagination) logsPagination.hidden = false;

  logsList.innerHTML = appLogs.map(log => {
    let summary = '';
    if (log.error_message) {
      summary = `<span style="color: #b91c1c;">${escapeHtml(log.error_message)}</span>`;
    } else if (log.metadata && typeof log.metadata === 'object' && Object.keys(log.metadata).length > 0) {
      const keys = Object.keys(log.metadata).slice(0, 3);
      const parts = keys.map(k => `${k}: ${log.metadata[k]}`);
      summary = escapeHtml(parts.join(' | '));
    } else {
      summary = '—';
    }

    const orderRef = log.order_id ? `#${escapeHtml(String(log.order_id).slice(0, 8))}` : (log.metadata?.orderReference || log.metadata?.order_reference || '—');

    return `
      <tr>
        <td>
          <span class="admin-log-timestamp">${formatLogTimestamp(log.created_at)}</span>
        </td>
        <td>
          ${renderLogLevelBadge(log.level)}
        </td>
        <td>
          <strong style="color: var(--navy); font-size: 13px;">${escapeHtml(log.event)}</strong>
        </td>
        <td>
          <span class="admin-log-source-tag">${escapeHtml(log.source || 'frontend')}</span>
        </td>
        <td>
          <span style="font-family: var(--font-mono); font-size: 12px; font-weight: 600;">${escapeHtml(String(orderRef))}</span>
        </td>
        <td>
          <span class="admin-log-summary-text" title="${escapeHtml(log.error_message || JSON.stringify(log.metadata || {}))}">${summary}</span>
        </td>
        <td>
          <button type="button" class="btn btn-outline btn-sm admin-log-view-btn" data-log-id="${log.id}">View Details</button>
        </td>
      </tr>
    `;
  }).join('');

  // Update pagination info
  const totalPages = Math.max(1, Math.ceil(totalLogsCount / LOGS_PAGE_SIZE));
  const startIdx = (currentLogsPage - 1) * LOGS_PAGE_SIZE + 1;
  const endIdx = Math.min(totalLogsCount, currentLogsPage * LOGS_PAGE_SIZE);

  if (logsPageInfo) {
    logsPageInfo.textContent = totalLogsCount > 0
      ? `Showing ${startIdx}–${endIdx} of ${totalLogsCount} logs`
      : 'Showing 0 logs';
  }

  if (logsCurrentPage) {
    logsCurrentPage.textContent = `Page ${currentLogsPage} of ${totalPages}`;
  }

  if (logsPrevPage) {
    logsPrevPage.disabled = currentLogsPage <= 1;
  }

  if (logsNextPage) {
    logsNextPage.disabled = currentLogsPage >= totalPages;
  }
}

async function loadLogs(resetPage = false) {
  if (!supabase) return;
  if (resetPage) currentLogsPage = 1;
  setLogsStatus('Loading logs…');

  try {
    let query = supabase.from('app_logs').select('*', { count: 'exact' });

    // 1. Log Level filter
    const level = logsLevelFilter?.value || 'all';
    if (level !== 'all') {
      query = query.eq('level', level);
    }

    // 2. Event Type category filter
    const eventCategory = logsEventFilter?.value || 'all';
    if (eventCategory !== 'all' && LOG_EVENT_CATEGORIES[eventCategory]) {
      query = query.in('event', LOG_EVENT_CATEGORIES[eventCategory]);
    }

    // 3. Date Range filter
    const dateRangeType = logsDateFilter?.value || 'all';
    const { start, end } = getDateRangeBounds(dateRangeType, logsDateFrom?.value, logsDateTo?.value);
    if (start) query = query.gte('created_at', start);
    if (end) query = query.lte('created_at', end);

    // 4. Search Filter
    const term = (logsSearch?.value || '').trim();
    if (term) {
      const cleanTerm = term.replace(/[%_,()]/g, ' ').trim();
      if (cleanTerm) {
        query = query.or(`event.ilike.%${cleanTerm}%,source.ilike.%${cleanTerm}%,error_message.ilike.%${cleanTerm}%`);
      }
    }

    // 5. Order & Pagination
    const from = (currentLogsPage - 1) * LOGS_PAGE_SIZE;
    const to = from + LOGS_PAGE_SIZE - 1;

    query = query.order('created_at', { ascending: false }).range(from, to);

    const { data, count, error } = await query;

    if (error) {
      console.warn('Unable to query app_logs from Supabase:', error);
      appLogs = [];
      totalLogsCount = 0;
      setLogsStatus('Unable to load logs. Please refresh and try again.', true);
      renderLogs();
      return;
    }

    appLogs = data || [];
    totalLogsCount = count || 0;
    setLogsStatus();
    renderLogs();
  } catch (err) {
    console.warn('Logs query error:', err);
    appLogs = [];
    totalLogsCount = 0;
    setLogsStatus('Unable to load logs. Please refresh and try again.', true);
    renderLogs();
  }
}

function resetLogFilters() {
  if (logsSearch) logsSearch.value = '';
  if (logsLevelFilter) logsLevelFilter.value = 'all';
  if (logsEventFilter) logsEventFilter.value = 'all';
  if (logsDateFilter) logsDateFilter.value = 'all';
  if (logsDateFrom) logsDateFrom.value = '';
  if (logsDateTo) logsDateTo.value = '';
  if (logsCustomDateRange) logsCustomDateRange.hidden = true;
  loadLogs(true);
}

function openLogDetailModal(logId) {
  const log = appLogs.find(l => l.id === logId);
  if (!log) return;
  activeLogDetail = log;

  if (logDetailId) logDetailId.textContent = log.id;
  if (logDetailTimestamp) logDetailTimestamp.textContent = formatLogTimestamp(log.created_at);
  if (logDetailLevelBadge) logDetailLevelBadge.innerHTML = renderLogLevelBadge(log.level);
  if (logDetailSource) logDetailSource.textContent = log.source || 'frontend';
  if (logDetailEvent) logDetailEvent.textContent = log.event;
  if (logDetailOrderId) logDetailOrderId.textContent = log.order_id || log.metadata?.orderReference || log.metadata?.order_id || '—';

  if (logDetailErrorBox && logDetailErrorMessage) {
    if (log.error_message) {
      logDetailErrorBox.hidden = false;
      logDetailErrorMessage.textContent = log.error_message;
    } else {
      logDetailErrorBox.hidden = true;
      logDetailErrorMessage.textContent = '';
    }
  }

  if (logDetailJsonCode) {
    try {
      logDetailJsonCode.textContent = JSON.stringify(log.metadata || {}, null, 2);
    } catch {
      logDetailJsonCode.textContent = String(log.metadata || '{}');
    }
  }

  if (logDetailModal) {
    logDetailModal.hidden = false;
    logDetailModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
}

function closeLogDetailModal() {
  if (logDetailModal) {
    logDetailModal.hidden = true;
    logDetailModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  activeLogDetail = null;
}

// --- LOGS TAB LISTENERS ---
let searchLogsTimer;
logsRefreshButton?.addEventListener('click', () => loadLogs(false));
logsSearch?.addEventListener('input', () => {
  clearTimeout(searchLogsTimer);
  searchLogsTimer = setTimeout(() => loadLogs(true), 300);
});
logsLevelFilter?.addEventListener('change', () => loadLogs(true));
logsEventFilter?.addEventListener('change', () => loadLogs(true));
logsDateFilter?.addEventListener('change', () => {
  setVisible(logsCustomDateRange, logsDateFilter.value === 'custom');
  loadLogs(true);
});
logsDateFrom?.addEventListener('change', () => loadLogs(true));
logsDateTo?.addEventListener('change', () => loadLogs(true));
logsClearFilters?.addEventListener('click', resetLogFilters);
logsEmptyClearBtn?.addEventListener('click', resetLogFilters);

// Quick Filter buttons
[logQuickAll, logQuickInfo, logQuickWarn, logQuickError].forEach(btn => {
  btn?.addEventListener('click', () => {
    const lvl = btn.dataset.logLevel || 'all';
    if (logsLevelFilter) logsLevelFilter.value = lvl;
    loadLogs(true);
  });
});

// Active filter tags removal delegation
logsActiveFiltersList?.addEventListener('click', event => {
  const removeBtn = event.target.closest('.tag-remove');
  if (removeBtn && removeBtn.dataset.filterKey) {
    const key = removeBtn.dataset.filterKey;
    if (key === 'search' && logsSearch) logsSearch.value = '';
    if (key === 'level' && logsLevelFilter) logsLevelFilter.value = 'all';
    if (key === 'event' && logsEventFilter) logsEventFilter.value = 'all';
    if (key === 'date') {
      if (logsDateFilter) logsDateFilter.value = 'all';
      if (logsDateFrom) logsDateFrom.value = '';
      if (logsDateTo) logsDateTo.value = '';
      if (logsCustomDateRange) logsCustomDateRange.hidden = true;
    }
    loadLogs(true);
    return;
  }

  if (event.target.id === 'logsClearAllTagsBtn') {
    resetLogFilters();
  }
});

// Table action delegation for View Details
logsList?.addEventListener('click', event => {
  const viewBtn = event.target.closest('.admin-log-view-btn');
  if (viewBtn && viewBtn.dataset.logId) {
    openLogDetailModal(viewBtn.dataset.logId);
  }
});

// Pagination
logsPrevPage?.addEventListener('click', () => {
  if (currentLogsPage > 1) {
    currentLogsPage--;
    loadLogs(false);
  }
});

logsNextPage?.addEventListener('click', () => {
  const totalPages = Math.max(1, Math.ceil(totalLogsCount / LOGS_PAGE_SIZE));
  if (currentLogsPage < totalPages) {
    currentLogsPage++;
    loadLogs(false);
  }
});

// Detail Modal listeners
logDetailCloseBtn?.addEventListener('click', closeLogDetailModal);
logDetailCloseFooterBtn?.addEventListener('click', closeLogDetailModal);
logDetailModal?.addEventListener('click', event => {
  if (event.target === logDetailModal) closeLogDetailModal();
});

logDetailCopyJsonBtn?.addEventListener('click', () => {
  if (logDetailJsonCode && logDetailJsonCode.textContent) {
    navigator.clipboard?.writeText(logDetailJsonCode.textContent).then(() => {
      if (logDetailCopyJsonBtn) {
        logDetailCopyJsonBtn.textContent = 'Copied!';
        setTimeout(() => {
          if (logDetailCopyJsonBtn) logDetailCopyJsonBtn.textContent = 'Copy JSON';
        }, 1500);
      }
    });
  }
});

// --- AUTHENTICATION LISTENERS & FUNCTIONS ---
async function signOut() {
  if (supabase) await supabase.auth.signOut();
  window.ZaynXwearLogger?.info('admin_logout');
  selectedOrderId = null;
  orders = [];
  inventory = [];
  products = [];
  categories = [];
  storeSizes = [];
  storeColors = [];
  coupons = [];
  banners = [];
  appLogs = [];
  showLogin();
}

loginForm?.addEventListener('submit', async event => {
  event.preventDefault();
  if (!supabase) return;
  const values = Object.fromEntries(new FormData(loginForm));
  if (!values.email || !values.password) {
    loginStatus.textContent = 'Enter your email and password.';
    return;
  }
  const button = loginForm.querySelector('button');
  button.disabled = true;
  loginStatus.textContent = 'Signing in…';
  const { data, error } = await supabase.auth.signInWithPassword({
    email: String(values.email),
    password: String(values.password)
  });
  button.disabled = false;
  if (error || !data.user) {
    window.ZaynXwearLogger?.warn('admin_login_failed', { email: String(values.email) }, error);
    loginStatus.textContent = 'Unable to sign in. Check your email and password.';
    return;
  }
  if (!isAdmin(data.user)) {
    window.ZaynXwearLogger?.warn('admin_access_denied', { userId: data.user.id });
    await supabase.auth.signOut();
    showDenied();
    return;
  }
  window.ZaynXwearLogger?.info('admin_login_success', { userId: data.user.id });
  loginForm.reset();
  showDashboard(data.user);
  switchTab(currentTab || 'overview');
  await loadOrders();
  await loadReturnRequests(false);
  await loadProducts(false);
  await loadInventory(false);
  await loadCategories(false);
  await loadSizes(false);
  await loadColors(false);
  await loadCoupons(false);
  await loadBanners(false);
});

document.getElementById('adminLogout')?.addEventListener('click', signOut);
document.getElementById('adminDeniedLogout')?.addEventListener('click', signOut);

// --- GLOBAL KEYDOWN LISTENER ---
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    if (addProductModal && !addProductModal.hidden) {
      closeAddProductModal();
    } else if (editProductModal && !editProductModal.hidden) {
      closeEditProductModal();
    } else if (imageAdjustModal && !imageAdjustModal.hidden) {
      closeAdjustModal();
    } else if (deleteProductModal && !deleteProductModal.hidden) {
      closeDeleteProductModal();
    } else if (addCategoryModal && !addCategoryModal.hidden) {
      closeAddCategoryModal();
    } else if (editCategoryModal && !editCategoryModal.hidden) {
      closeEditCategoryModal();
    } else if (deleteCategoryModal && !deleteCategoryModal.hidden) {
      closeDeleteCategoryModal();
    } else if (addSizeModal && !addSizeModal.hidden) {
      closeAddSizeModal();
    } else if (editSizeModal && !editSizeModal.hidden) {
      closeEditSizeModal();
    } else if (addColorModal && !addColorModal.hidden) {
      closeAddColorModal();
    } else if (editColorModal && !editColorModal.hidden) {
      closeEditColorModal();
    } else if (deleteAttributeModal && !deleteAttributeModal.hidden) {
      closeDeleteAttributeModal();
    } else if (addCouponModal && !addCouponModal.hidden) {
      closeAddCouponModal();
    } else if (editCouponModal && !editCouponModal.hidden) {
      closeEditCouponModal();
    } else if (deleteCouponModal && !deleteCouponModal.hidden) {
      closeDeleteCouponModal();
    } else if (adminTextCustomizeModal && !adminTextCustomizeModal.hidden) {
      closeTextCustomizeModal();
    } else if (addBannerModal && !addBannerModal.hidden) {
      closeAddBannerModal();
    } else if (editBannerModal && !editBannerModal.hidden) {
      closeEditBannerModal();
    } else if (deleteBannerModal && !deleteBannerModal.hidden) {
      closeDeleteBannerModal();
    } else if (logDetailModal && !logDetailModal.hidden) {
      closeLogDetailModal();
    } else if (returnReasonModal && !returnReasonModal.hidden) {
      closeReturnReasonModal();
    } else if (slabModal && !slabModal.hidden) {
      closeSlabModal(true);
    } else if (adminWhatsAppModal && !adminWhatsAppModal.hidden) {
      closeWhatsAppModal();
    }
  }
});

// --- WHATSAPP MESSAGES LISTENERS ---
tabWhatsApp?.addEventListener('click', () => switchTab('whatsapp'));
whatsappRefresh?.addEventListener('click', () => loadWhatsAppMessagesData(true));
whatsappSearch?.addEventListener('input', () => renderWhatsAppMessages());

whatsappTypeFilter?.addEventListener('change', () => {
  currentWaTypeFilter = whatsappTypeFilter.value;
  renderWhatsAppMessages();
});

whatsappDateFilter?.addEventListener('change', () => {
  const isCustom = whatsappDateFilter.value === 'custom';
  if (whatsappCustomDateRange) {
    whatsappCustomDateRange.hidden = !isCustom;
  }
  renderWhatsAppMessages();
});

whatsappDateFrom?.addEventListener('change', () => renderWhatsAppMessages());
whatsappDateTo?.addEventListener('change', () => renderWhatsAppMessages());

// Filter pills
[
  { el: waFilterAll, type: 'all' },
  { el: waFilterAccepted, type: 'order_accepted' },
  { el: waFilterShipped, type: 'order_shipped' },
  { el: waFilterDelivered, type: 'order_delivered' },
  { el: waFilterRefund, type: 'refund' },
  { el: waFilterRefundComplete, type: 'refund_complete' },
  { el: waFilterExchange, type: 'exchange' },
  { el: waFilterExchangeComplete, type: 'exchange_complete' }
].forEach(p => {
  p.el?.addEventListener('click', () => {
    currentWaTypeFilter = p.type;
    if (whatsappTypeFilter) whatsappTypeFilter.value = p.type;
    renderWhatsAppMessages();
  });
});

// Modal listeners
adminWhatsAppModalClose?.addEventListener('click', closeWhatsAppModal);
waModalCancelBtn?.addEventListener('click', closeWhatsAppModal);
adminWhatsAppModal?.addEventListener('click', event => {
  if (event.target === adminWhatsAppModal) {
    closeWhatsAppModal();
  }
});

waMessageTextarea?.addEventListener('input', updateWaCharCount);

waResetTemplateBtn?.addEventListener('click', () => {
  if (waMessageTextarea && currentWaModalData.defaultMessage) {
    waMessageTextarea.value = currentWaModalData.defaultMessage;
    updateWaCharCount();
  }
});

waModalSendBtn?.addEventListener('click', () => {
  if (!waMessageTextarea) return;
  const msg = waMessageTextarea.value;
  sendOnWhatsApp(currentWaModalData.customerMobile, msg);
});

// --- INITIALIZE DASHBOARD ---
async function initialise() {
  if (!supabase) {
    showLogin('Admin configuration is incomplete. Add the Supabase anon key in admin-config.js.');
    return;
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return showLogin();

  if (!isAdmin(user)) {
    return showDenied();
  }

  showDashboard(user);
  switchTab(currentTab || 'overview');
  await loadOrders();
  await loadReturnRequests(false);
  await loadProductFamilies();
  await loadProducts(false);
  await loadInventory(false);
  await loadCategories(false);
  await loadSizes(false);
  await loadColors(false);
  await loadCoupons(false);
  await loadBanners(false);
}

initialise();
