import apiClient from './apiClient';

/**
 * Service for handling reviews
 */
const reviewService = {
  /**
   * Create a review for a completed booking
   * @param {string} bookingId - The booking ID
   * @param {Object} reviewData - Review data
   * @returns {Promise} API response
   */
  createReview: async (bookingId, reviewData) => {
    try {
      console.log('📤 Creating review for booking:', bookingId);
      console.log('📤 Review data:', JSON.stringify(reviewData, null, 2));
      
      const response = await apiClient.post(`/api/bookings/${bookingId}/reviews`, {
        reviewerId: reviewData.reviewerId,
        revieweeId: reviewData.revieweeId,
        rating: reviewData.rating,
        comment: reviewData.comment,
        punctualityRating: reviewData.punctualityRating || reviewData.rating,
        qualityRating: reviewData.qualityRating || reviewData.rating,
        friendlinessRating: reviewData.friendlinessRating || reviewData.rating,
      });
      
      console.log('✅ Review created response:', response.data);
      console.log('✅ Review created status:', response.status);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error creating review:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      throw error;
    }
  },

  /**
   * Get reviews for a booking
   * @param {string} bookingId - The booking ID
   * @returns {Promise} API response with review
   */
  getBookingReviews: async (bookingId) => {
    try {
      const response = await apiClient.get(`/api/bookings/${bookingId}/reviews`);
      return response.data;
    } catch (error) {
      console.error('Error fetching booking reviews:', error);
      throw error;
    }
  },

  /**
   * Get a specific review by ID
   * @param {string} reviewId - The review ID
   * @returns {Promise} API response with review
   */
  getReviewById: async (reviewId) => {
    try {
      const response = await apiClient.get(`/api/reviews/${reviewId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching review:', error);
      throw error;
    }
  },

  /**
   * Get reviews by reviewer
   * @param {string} reviewerId - The reviewer ID
   * @returns {Promise} API response with reviews array
   */
  getReviewsByReviewer: async (reviewerId) => {
    try {
      const response = await apiClient.get(`/api/reviews/by-reviewer/${reviewerId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching reviews by reviewer:', error);
      throw error;
    }
  },

  /**
   * Get all reviews for a worker
   * @param {string} workerId - The worker ID
   * @returns {Promise} API response with reviews
   */
  getWorkerReviews: async (workerId) => {
    try {
      const response = await apiClient.get(`/api/workers/${workerId}/reviews`);
      return response.data;
    } catch (error) {
      console.error('Error fetching worker reviews:', error);
      throw error;
    }
  },

  /**
   * Get worker rating summary
   * @param {string} workerId - The worker ID
   * @returns {Promise} API response with rating summary
   */
  getWorkerRatingSummary: async (workerId) => {
    try {
      const response = await apiClient.get(`/api/workers/${workerId}/rating-summary`);
      return response.data;
    } catch (error) {
      console.error('Error fetching worker rating summary:', error);
      throw error;
    }
  },

  /**
   * Respond to a review
   * @param {string} reviewId - The review ID
   * @param {string} response - The response text
   * @returns {Promise} API response
   */
  respondToReview: async (reviewId, response) => {
    try {
      const result = await apiClient.put(`/api/reviews/${reviewId}/respond`, {
        response,
      });
      return result.data;
    } catch (error) {
      console.error('Error responding to review:', error);
      throw error;
    }
  },

  /**
   * Create an inspection for a booking
   * @param {string} bookingId - The booking ID
   * @param {Object} inspectionData - Inspection data
   * @returns {Promise} API response
   */
  createInspection: async (bookingId, inspectionData) => {
    try {
      const response = await apiClient.post(`/api/bookings/${bookingId}/inspections`, inspectionData);
      return response.data;
    } catch (error) {
      console.error('Error creating inspection:', error);
      throw error;
    }
  },

  /**
   * Get inspections for a booking
   * @param {string} bookingId - The booking ID
   * @returns {Promise} API response with inspections
   */
  getBookingInspections: async (bookingId) => {
    try {
      const response = await apiClient.get(`/api/bookings/${bookingId}/inspections`);
      return response.data;
    } catch (error) {
      console.error('Error fetching inspections:', error);
      throw error;
    }
  },

  /**
   * Create a proposal for an inspection
   * @param {string} inspectionId - The inspection ID
   * @param {Object} proposalData - Proposal data
   * @returns {Promise} API response
   */
  createProposal: async (inspectionId, proposalData) => {
    try {
      const response = await apiClient.post(`/api/inspections/${inspectionId}/proposals`, proposalData);
      return response.data;
    } catch (error) {
      console.error('Error creating proposal:', error);
      throw error;
    }
  },

  /**
   * Get proposals for an inspection
   * @param {string} inspectionId - The inspection ID
   * @returns {Promise} API response with proposals
   */
  getInspectionProposals: async (inspectionId) => {
    try {
      const response = await apiClient.get(`/api/inspections/${inspectionId}/proposals`);
      return response.data;
    } catch (error) {
      console.error('Error fetching proposals:', error);
      throw error;
    }
  },

  /**
   * Approve a proposal
   * @param {string} proposalId - The proposal ID
   * @param {string} approvedBy - User ID who approved
   * @returns {Promise} API response
   */
  approveProposal: async (proposalId, approvedBy) => {
    try {
      const response = await apiClient.put(`/api/proposals/${proposalId}/approve`, {
        approvedBy,
      });
      return response.data;
    } catch (error) {
      console.error('Error approving proposal:', error);
      throw error;
    }
  },

  /**
   * Reject a proposal
   * @param {string} proposalId - The proposal ID
   * @param {string} reason - Rejection reason
   * @returns {Promise} API response
   */
  rejectProposal: async (proposalId, reason) => {
    try {
      const response = await apiClient.put(`/api/proposals/${proposalId}/reject`, {
        reason,
      });
      return response.data;
    } catch (error) {
      console.error('Error rejecting proposal:', error);
      throw error;
    }
  },
};

export default reviewService;
