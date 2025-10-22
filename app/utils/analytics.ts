/**
 * Client-Side Analytics Tracking
 * 
 * Provides GA4 event tracking with action attribution support.
 * Part of Growth Engine architecture - Action ROI tracking.
 * 
 * Features:
 * - gtag wrapper for GA4 events
 * - Action key attribution (hd_action_key custom dimension)
 * - Session storage for action persistence
 * - Debug mode for development
 * 
 * ENG-033: GA4 Event Emission with Action Key
 */

/**
 * GA4 event types supported
 */
export type GA4EventName = 
  | 'page_view' 
  | 'add_to_cart' 
  | 'begin_checkout' 
  | 'purchase';

/**
 * Event parameters (GA4 standard + custom dimensions)
 */
export interface EventParams {
  // Standard GA4 parameters
  page_path?: string;
  page_title?: string;
  page_location?: string;
  
  // E-commerce parameters
  currency?: string;
  value?: number;
  transaction_id?: string;
  items?: Array<{
    item_id?: string;
    item_name?: string;
    item_category?: string;
    price?: number;
    quantity?: number;
  }>;
  
  // Custom dimensions
  hd_action_key?: string;
  
  // Additional custom parameters
  [key: string]: any;
}

/**
 * Check if gtag is available (client-side only)
 */
function isGtagAvailable(): boolean {
  return typeof window !== 'undefined' && typeof (window as any).gtag === 'function';
}

/**
 * Get current action key from session storage
 * 
 * Action keys are stored when user clicks an attributed action link
 * and cleared after 24 hours or successful purchase.
 */
export function getCurrentActionKey(): string | null {
  if (typeof window === 'undefined') return null;
  
  try {
    return sessionStorage.getItem('hd_current_action');
  } catch {
    return null;
  }
}

/**
 * Set action key in session storage
 * 
 * Called when user clicks an action link (ENG-032)
 * Persists until:
 * - 24 hours elapse
 * - Purchase event occurs
 * - Session ends
 */
export function setActionKey(actionKey: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    sessionStorage.setItem('hd_current_action', actionKey);
    sessionStorage.setItem('hd_action_timestamp', Date.now().toString());
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[GA4] Action key set:', actionKey);
    }
  } catch (error) {
    console.error('[GA4] Failed to set action key:', error);
  }
}

/**
 * Clear action key from session storage
 * 
 * Called after:
 * - Purchase event (attribution complete)
 * - 24-hour expiration
 */
export function clearActionKey(): void {
  if (typeof window === 'undefined') return;
  
  try {
    const actionKey = sessionStorage.getItem('hd_current_action');
    sessionStorage.removeItem('hd_current_action');
    sessionStorage.removeItem('hd_action_timestamp');
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[GA4] Action key cleared:', actionKey);
    }
  } catch (error) {
    console.error('[GA4] Failed to clear action key:', error);
  }
}

/**
 * Check if action key has expired (>24 hours)
 */
export function isActionKeyExpired(): boolean {
  if (typeof window === 'undefined') return true;
  
  try {
    const timestamp = sessionStorage.getItem('hd_action_timestamp');
    if (!timestamp) return true;
    
    const age = Date.now() - parseInt(timestamp, 10);
    const twentyFourHours = 24 * 60 * 60 * 1000;
    
    return age > twentyFourHours;
  } catch {
    return true;
  }
}

/**
 * Track GA4 event with automatic action key attribution
 * 
 * ENG-033: Core tracking function for Growth Engine action attribution
 * 
 * @param eventName - GA4 event name (page_view, add_to_cart, begin_checkout, purchase)
 * @param params - Event parameters (optional)
 * 
 * @example
 * // Page view with action attribution
 * trackEvent('page_view', { page_path: '/products/powder-board' });
 * 
 * @example
 * // Purchase event (clears action key)
 * trackEvent('purchase', { 
 *   transaction_id: 'ORDER_123',
 *   value: 299.99,
 *   currency: 'USD'
 * });
 */
export function trackEvent(
  eventName: GA4EventName,
  params?: EventParams
): void {
  // Client-side only
  if (!isGtagAvailable()) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[GA4] gtag not available (server-side or not loaded)');
    }
    return;
  }
  
  // Get current action key from session storage
  const actionKey = getCurrentActionKey();
  
  // Check if action key has expired
  if (actionKey && isActionKeyExpired()) {
    clearActionKey();
  }
  
  // Build event parameters
  const eventParams: EventParams = {
    ...params,
  };
  
  // Add action key if present (Growth Engine attribution)
  if (actionKey && !isActionKeyExpired()) {
    eventParams.hd_action_key = actionKey;
  }
  
  // Emit GA4 event
  try {
    (window as any).gtag('event', eventName, eventParams);
    
    // Debug mode (development only)
    if (process.env.NODE_ENV === 'development') {
      console.log('[GA4] Event:', eventName, {
        ...eventParams,
        action_attribution: actionKey ? 'YES' : 'NO',
      });
    }
  } catch (error) {
    console.error('[GA4] Event tracking error:', error);
  }
  
  // Clear action key after purchase (attribution complete)
  if (eventName === 'purchase' && actionKey) {
    clearActionKey();
  }
}

/**
 * Track page view
 * 
 * Automatically includes action key if present
 * 
 * @param path - Page path (e.g., '/products/powder-board')
 * @param title - Page title (optional)
 */
export function trackPageView(path?: string, title?: string): void {
  trackEvent('page_view', {
    page_path: path || (typeof window !== 'undefined' ? window.location.pathname : undefined),
    page_title: title || (typeof document !== 'undefined' ? document.title : undefined),
    page_location: typeof window !== 'undefined' ? window.location.href : undefined,
  });
}

/**
 * Track add to cart event
 * 
 * @param item - Product/item information
 */
export function trackAddToCart(item: {
  item_id: string;
  item_name: string;
  item_category?: string;
  price: number;
  quantity?: number;
}): void {
  trackEvent('add_to_cart', {
    currency: 'USD',
    value: item.price * (item.quantity || 1),
    items: [{
      item_id: item.item_id,
      item_name: item.item_name,
      item_category: item.item_category,
      price: item.price,
      quantity: item.quantity || 1,
    }],
  });
}

/**
 * Track begin checkout event
 * 
 * @param value - Total cart value
 * @param items - Cart items (optional)
 */
export function trackBeginCheckout(value: number, items?: EventParams['items']): void {
  trackEvent('begin_checkout', {
    currency: 'USD',
    value,
    items,
  });
}

/**
 * Track purchase event
 * 
 * Automatically clears action key after tracking (attribution complete)
 * 
 * @param transaction - Purchase transaction details
 */
export function trackPurchase(transaction: {
  transaction_id: string;
  value: number;
  currency?: string;
  tax?: number;
  shipping?: number;
  items?: EventParams['items'];
}): void {
  trackEvent('purchase', {
    transaction_id: transaction.transaction_id,
    value: transaction.value,
    currency: transaction.currency || 'USD',
    tax: transaction.tax,
    shipping: transaction.shipping,
    items: transaction.items,
  });
  
  // Action key automatically cleared by trackEvent() after purchase
}

/**
 * Initialize action key tracking from URL parameter
 * 
 * Called on page load to check for hd_action parameter
 * ENG-032: Action link click handler integration point
 * 
 * @example
 * // In app root or layout component
 * useEffect(() => {
 *   initActionKeyFromUrl();
 * }, []);
 */
export function initActionKeyFromUrl(): void {
  if (typeof window === 'undefined') return;
  
  try {
    const url = new URL(window.location.href);
    const actionParam = url.searchParams.get('hd_action');
    
    if (actionParam) {
      setActionKey(actionParam);
      
      // Remove parameter from URL (clean URL bar)
      url.searchParams.delete('hd_action');
      window.history.replaceState({}, '', url.toString());
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[GA4] Action key initialized from URL:', actionParam);
      }
    }
  } catch (error) {
    console.error('[GA4] Failed to initialize action key from URL:', error);
  }
}

