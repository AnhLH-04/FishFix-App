import apiClient from './apiClient';

/**
 * Service for handling payments
 */
const paymentService = {
  /**
   * Create VNPAY payment for a booking
   * @param {string} bookingId - The booking ID
   * @param {Object} options - Payment options
   * @returns {Promise} API response with checkoutUrl
   */
  createVNPAYPayment: async (bookingId, options = {}) => {
    try {
      console.log('💳 Creating VNPAY payment for booking:', bookingId);
      
      const requestBody = {
        method: 'VNPAY',
        returnUrl: options.returnUrl || 'https://api.fishfix.vn/api/payments/vnpay/return',
        clientContext: {
          appScheme: 'fishfix',
          returnPath: 'payment-result',
          ...options.clientContext
        }
      };
      
      console.log('📤 Request body:', JSON.stringify(requestBody, null, 2));
      
      const response = await apiClient.post(`/api/bookings/${bookingId}/payments`, requestBody);
      
      console.log('✅ VNPAY payment created:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating VNPAY payment:', error);
      console.error('❌ Error details:', {
        message: error.message,
        status: error.status,
        response: error.response?.data,
        stack: error.stack
      });
      throw error;
    }
  },

  /**
   * Create SePay QR payment
   * @param {string} bookingId - The booking ID
   * @param {number} amount - Payment amount
   * @param {string} description - Optional description
   * @returns {Promise} API response with QR code
   */
  createSepayPayment: async (bookingId, amount, description = '') => {
    try {
      console.log('🏦 Creating SePay payment for booking:', bookingId);
      
      const requestBody = {
        bookingId,
        amount,
        orderCode: null,
        description: description || `Thanh toán booking ${bookingId.substring(0, 8)}`
      };
      
      console.log('📤 SePay Request body:', JSON.stringify(requestBody, null, 2));
      
      const response = await apiClient.post('/api/payments/sepay/create', requestBody);
      
      console.log('✅ SePay payment created:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating SePay payment:', error);
      console.error('❌ SePay Error details:', {
        message: error.message,
        status: error.status,
        response: error.response?.data,
        detail: error.detail
      });
      throw error;
    }
  },

  /**
   * Get payment status by paymentId
   * @param {string} paymentId - The payment ID
   * @returns {Promise} Payment status
   */
  getPaymentStatus: async (paymentId) => {
    try {
      const response = await apiClient.get(`/api/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error getting payment status:', error);
      throw error;
    }
  },

  /**
   * Get order status by orderCode (for SePay polling)
   * @param {string} orderCode - The order code
   * @returns {Promise} Order status
   */
  getOrderStatus: async (orderCode) => {
    try {
      const response = await apiClient.get(`/api/orders/${orderCode}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error getting order status:', error);
      throw error;
    }
  },

  /**
   * Get latest payment for a booking
   * @param {string} bookingId - The booking ID
   * @returns {Promise} Latest payment
   */
  getLatestPayment: async (bookingId) => {
    try {
      const response = await apiClient.get(`/api/bookings/${bookingId}/payments/latest`);
      return response.data;
    } catch (error) {
      console.error('❌ Error getting latest payment:', error);
      throw error;
    }
  },

  /**
   * Get all payments for a booking
   * @param {string} bookingId - The booking ID
   * @returns {Promise} List of payments
   */
  getBookingPayments: async (bookingId) => {
    try {
      const response = await apiClient.get(`/api/bookings/${bookingId}/payments`);
      return response.data;
    } catch (error) {
      console.error('❌ Error getting booking payments:', error);
      throw error;
    }
  },

  /**
   * Poll payment status until terminal state
   * @param {string} paymentId - The payment ID
   * @param {Function} onUpdate - Callback for status updates
   * @param {number} maxAttempts - Maximum polling attempts
   * @returns {Promise} Final payment status
   */
  pollPaymentStatus: async (paymentId, onUpdate, maxAttempts = 60) => {
    const POLL_INTERVAL = 2500; // 2.5 seconds
    const TERMINAL_STATUSES = ['SUCCEEDED', 'FAILED', 'CANCELLED', 'EXPIRED'];
    
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      try {
        const status = await paymentService.getPaymentStatus(paymentId);
        
        if (onUpdate) {
          onUpdate(status);
        }
        
        if (TERMINAL_STATUSES.includes(status.status)) {
          console.log('✅ Payment reached terminal status:', status.status);
          return status;
        }
        
        attempts++;
        await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
      } catch (error) {
        console.error('Error polling payment status:', error);
        attempts++;
        await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
      }
    }
    
    throw new Error('Payment polling timeout');
  },

  /**
   * Poll order status until paid (for SePay)
   * @param {string} orderCode - The order code
   * @param {Function} onUpdate - Callback for status updates
   * @param {number} maxAttempts - Maximum polling attempts
   * @returns {Promise} Final order status
   */
  pollOrderStatus: async (orderCode, onUpdate, maxAttempts = 60) => {
    const POLL_INTERVAL = 2500; // 2.5 seconds
    const TERMINAL_STATUSES = ['PAID', 'EXPIRED'];
    
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      try {
        const status = await paymentService.getOrderStatus(orderCode);
        
        if (onUpdate) {
          onUpdate(status);
        }
        
        if (TERMINAL_STATUSES.includes(status.status)) {
          console.log('✅ Order reached terminal status:', status.status);
          return status;
        }
        
        attempts++;
        await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
      } catch (error) {
        console.error('Error polling order status:', error);
        attempts++;
        await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
      }
    }
    
    throw new Error('Order polling timeout');
  }
};

export default paymentService;
