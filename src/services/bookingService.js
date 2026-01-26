import apiClient from './apiClient';

/**
 * Booking Service
 * Xử lý các API liên quan đến đặt lịch
 */

const bookingService = {
    /**
     * Tạo booking mới (Mock)
     * @param {Object} bookingData
     * @param {string} bookingData.customerName
     * @param {string} bookingData.description
     * @returns {Promise<string>} - Booking ID
     */
    createBooking: async (bookingData) => {
        try {
            const response = await apiClient.post('/api/bookings', {
                customerName: bookingData.customerName,
                description: bookingData.description,
            });
            // Response trả về booking ID dạng string
            return response.data;
        } catch (error) {
            throw error;
        }
    },
};

export default bookingService;
