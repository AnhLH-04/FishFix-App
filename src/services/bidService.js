import apiClient from './apiClient';

/**
 * Bid Service
 * Handles bid creation and management for job applications
 */

/**
 * Create a bid for a job
 * @param {string} jobId - Job ID
 * @param {Object} bidData - Bid information
 * @param {string} bidData.workerId - Worker ID
 * @param {number} bidData.amount - Bid amount in VND
 * @param {string} bidData.message - Message to customer (optional)
 * @param {number} bidData.estimatedHours - Estimated completion time in hours (optional)
 * @param {string} bidData.estimatedCompletion - Estimated completion datetime ISO string (optional)
 * @returns {Promise<string>} Created bid ID
 */
export const createBid = async (jobId, bidData) => {
  try {
    console.log('📝 Creating bid for job:', jobId, bidData);
    
    const response = await apiClient.post(`/api/jobs/${jobId}/bids`, bidData);
    
    console.log('✅ Bid created successfully:', response.data);
    return response.data.bidId;
  } catch (error) {
    console.error('❌ Error creating bid:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get all bids for a job
 * @param {string} jobId - Job ID
 * @returns {Promise<Array>} List of bids
 */
export const getBidsForJob = async (jobId) => {
  try {
    console.log('📋 Fetching bids for job:', jobId);
    
    const response = await apiClient.get(`/api/jobs/${jobId}/bids`);
    
    console.log(`✅ Found ${response.data.length} bids`);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching bids:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Accept a bid (customer action)
 * @param {string} bidId - Bid ID to accept
 * @returns {Promise<void>}
 */
export const acceptBid = async (bidId) => {
  try {
    console.log('✅ Accepting bid:', bidId);
    
    await apiClient.put(`/api/bids/${bidId}/accept`);
    
    console.log('✅ Bid accepted successfully');
  } catch (error) {
    console.error('❌ Error accepting bid:', error.response?.data || error.message);
    throw error;
  }
};

export default {
  createBid,
  getBidsForJob,
  acceptBid,
};
