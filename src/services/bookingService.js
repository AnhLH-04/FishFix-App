import apiClient from './apiClient';

/**
 * Booking Service - Quản lý đặt lịch
 */

/**
 * Tạo booking mới
 * @param {Object} bookingData
 * @returns {Promise<string>} bookingId
 */
export const createBooking = async (bookingData) => {
    try {
        const response = await apiClient.post('/api/bookings', bookingData);
        return response.data; // Trả về bookingId
    } catch (error) {
        console.error('Create booking error:', error);
        throw error;
    }
};

/**
 * Tạo payment cho booking
 * @param {string} bookingId
 * @param {Object} paymentData
 * @param {number} paymentData.amount - Số tiền thanh toán
 * @param {string} paymentData.paymentType - deposit | final | refund
 * @param {string} paymentData.paymentMethod - vnpay | momo | zalopay | cash | bank_transfer
 * @returns {Promise<Object>} { paymentId }
 */
export const createPayment = async (bookingId, paymentData) => {
    try {
        console.log('💳 Creating payment for booking:', bookingId, paymentData);
        const response = await apiClient.post(
            `/api/bookings/${bookingId}/payments`,
            paymentData
        );
        console.log('✅ Payment created successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Create payment error:', error);
        console.error('❌ Error response:', error.response?.data);
        throw error;
    }
};

/**
 * Lấy danh sách payments của booking
 * @param {string} bookingId
 * @returns {Promise<Array>}
 */
export const getPaymentsByBooking = async (bookingId) => {
    try {
        const response = await apiClient.get(`/api/bookings/${bookingId}/payments`);
        return response.data;
    } catch (error) {
        console.error('Get payments error:', error);
        throw error;
    }
};

/**
 * Tạo review cho booking
 * @param {string} bookingId
 * @param {Object} reviewData
 * @returns {Promise<Object>} { reviewId }
 */
export const createReview = async (bookingId, reviewData) => {
    try {
        const response = await apiClient.post(
            `/api/bookings/${bookingId}/reviews`,
            reviewData
        );
        return response.data;
    } catch (error) {
        console.error('Create review error:', error);
        throw error;
    }
};

/**
 * Tạo inspection report
 * @param {string} bookingId
 * @param {Object} inspectionData
 * @returns {Promise<Object>} { inspectionId }
 */
export const createInspection = async (bookingId, inspectionData) => {
    try {
        const response = await apiClient.post(
            `/api/bookings/${bookingId}/inspections`,
            inspectionData
        );
        return response.data;
    } catch (error) {
        console.error('Create inspection error:', error);
        throw error;
    }
};

/**
 * Lấy inspection report
 * @param {string} bookingId
 * @returns {Promise<Object>}
 */
export const getInspectionByBooking = async (bookingId) => {
    try {
        const response = await apiClient.get(`/api/bookings/${bookingId}/inspections`);
        return response.data;
    } catch (error) {
        console.error('Get inspection error:', error);
        throw error;
    }
};

/**
 * Cập nhật trạng thái booking (cho tracking)
 * @param {string} bookingId
 * @param {Object} statusData - { status, actorId?, reason?, notes?, images? }
 * Valid status: confirmed | on_the_way | arrived | in_progress | completed | cancelled
 * @returns {Promise<void>} Response 204 No Content
 */
export const updateBookingStatus = async (bookingId, statusData) => {
    try {
        // Không gửi bookingId trong body (đã có trong URL)
        // Chỉ gửi fields có giá trị
        const body = {
            status: statusData.status,
        };
        
        // Add optional fields nếu có
        if (statusData.actorId) {
            body.actorId = statusData.actorId;
        }
        if (statusData.reason) {
            body.reason = statusData.reason;
        }
        if (statusData.notes) {
            body.notes = statusData.notes;
        }
        if (statusData.images) {
            body.images = statusData.images;
        }
        
        // Response 204 No Content - không có body
        await apiClient.patch(
            `/api/bookings/${bookingId}/status`,
            body
        );
        
        // Success - không cần return gì vì 204 No Content
        return;
    } catch (error) {
        console.error('Update booking status error:', error);
        throw error;
    }
};

/**
 * Lấy chi tiết booking
 * @param {string} bookingId
 * @returns {Promise<Object>}
 */
export const getBookingById = async (bookingId) => {
    try {
        const response = await apiClient.get(`/api/bookings/${bookingId}`);
        return response.data;
    } catch (error) {
        console.error('Get booking error:', error);
        throw error;
    }
};

/**
 * Lấy booking bằng bidId
 * @param {string} bidId
 * @returns {Promise<Object>}
 */
export const getBookingByBidId = async (bidId) => {
    try {
        const response = await apiClient.get(`/api/bookings/by-bid/${bidId}`);
        return response.data;
    } catch (error) {
        console.error('❌ Get booking by bidId error:', error);
        throw error;
    }
};

/**
 * Lấy danh sách bookings theo customerId hoặc workerId
 * @param {Object} params - { customerId?, workerId? }
 * @returns {Promise<Array>} Array of bookings
 */
export const getBookings = async (params) => {
    try {
        const response = await apiClient.get('/api/bookings', { params });
        return response.data;
    } catch (error) {
        console.error('❌ Get bookings error:', error);
        throw error;
    }
};

export default {
    createBooking,
    createPayment,
    getPaymentsByBooking,
    createReview,
    createInspection,
    getInspectionByBooking,
    updateBookingStatus,
    getBookingById,
    getBookingByBidId,
    getBookings,
};
