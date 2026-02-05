import apiClient from './apiClient';

/**
 * Job Service - Quản lý công việc
 */

/**
 * Tạo job mới
 * @param {Object} jobData - Thông tin job
 * @returns {Promise<Object>} { jobId }
 */
export const createJob = async (jobData) => {
    try {
        const response = await apiClient.post('/api/jobs', jobData);
        return response.data;
    } catch (error) {
        console.error('Create job error:', error);
        throw error;
    }
};

/**
 * Lấy chi tiết job
 * @param {string} jobId
 * @returns {Promise<Object>}
 */
export const getJobById = async (jobId) => {
    try {
        const response = await apiClient.get(`/api/jobs/${jobId}`);
        return response.data;
    } catch (error) {
        console.error('Get job error:', error);
        throw error;
    }
};

/**
 * Lấy danh sách jobs của customer
 * @param {string} customerId
 * @returns {Promise<Array>}
 */
export const getJobsByCustomer = async (customerId) => {
    try {
        const response = await apiClient.get('/api/jobs', {
            params: { customerId }
        });
        return response.data;
    } catch (error) {
        console.error('Get customer jobs error:', error);
        throw error;
    }
};

/**
 * Lấy danh sách bids cho job
 * @param {string} jobId
 * @returns {Promise<Array>}
 */
export const getBidsForJob = async (jobId) => {
    try {
        const response = await apiClient.get(`/api/jobs/${jobId}/bids`);
        return response.data;
    } catch (error) {
        console.error('Get bids error:', error);
        throw error;
    }
};

/**
 * Chấp nhận bid
 * @param {string} bidId
 * @returns {Promise<void>}
 */
export const acceptBid = async (bidId) => {
    try {
        await apiClient.put(`/api/bids/${bidId}/accept`);
    } catch (error) {
        console.error('Accept bid error:', error);
        throw error;
    }
};

/**
 * Lấy danh sách jobs available (cho technician)
 * @param {Object} params - Query parameters
 * @param {number} params.categoryId - Lọc theo category (optional)
 * @param {string} params.city - Lọc theo thành phố (optional)
 * @param {string} params.district - Lọc theo quận (optional)
 * @returns {Promise<Array>} Danh sách jobs available
 */
export const getAvailableJobs = async (params = {}) => {
    try {
        const response = await apiClient.get('/api/jobs/available', { params });
        return response.data;
    } catch (error) {
        console.error('Get available jobs error:', error);
        throw error;
    }
};

export default {
    createJob,
    getJobById,
    getJobsByCustomer,
    getBidsForJob,
    acceptBid,
    getAvailableJobs,
};
