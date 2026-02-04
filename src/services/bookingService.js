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
 * @returns {Promise<Object>} { paymentId }
 */
export const createPayment = async (bookingId, paymentData) => {
    try {
        const response = await apiClient.post(
            `/api/bookings/${bookingId}/payments`,
            paymentData
        );
        return response.data;
    } catch (error) {
        console.error('Create payment error:', error);
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

export default {
    createBooking,
    createPayment,
    getPaymentsByBooking,
    createReview,
    createInspection,
    getInspectionByBooking,
};
