import apiClient from './apiClient';

/**
 * Worker/Dispatch Service
 * Xử lý các API liên quan đến worker profile
 */

const workerService = {
    /**
     * Tạo worker profile
     * @param {Object} profileData
     * @param {string} profileData.userId
     * @param {string} profileData.bio
     * @param {number} profileData.workingRadiusKm
     * @returns {Promise<{workerId: string}>}
     */
    createWorkerProfile: async (profileData) => {
        try {
            const response = await apiClient.post('/api/dispatch/workers', {
                userId: profileData.userId,
                bio: profileData.bio,
                workingRadiusKm: profileData.workingRadiusKm,
            });
            // Response: { workerId: "..." }
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Cập nhật worker profile
     * @param {string} workerId
     * @param {Object} profileData
     * @param {string} profileData.bio
     * @param {string} profileData.availabilityStatus - 'available', 'busy', 'offline'
     * @param {number} profileData.workingRadiusKm
     */
    updateWorkerProfile: async (workerId, profileData) => {
        try {
            await apiClient.put(`/api/dispatch/workers/${workerId}`, {
                bio: profileData.bio,
                availabilityStatus: profileData.availabilityStatus,
                workingRadiusKm: profileData.workingRadiusKm,
            });
            return { success: true };
        } catch (error) {
            throw error;
        }
    },

    /**
     * Thêm skill cho worker
     * @param {string} workerId
     * @param {Object} skillData
     * @param {number} skillData.categoryId
     * @param {number} skillData.yearsOfExperience
     * @param {boolean} skillData.isPrimarySkill
     * @returns {Promise<{skillId: string}>}
     */
    addWorkerSkill: async (workerId, skillData) => {
        try {
            const response = await apiClient.post(`/api/dispatch/workers/${workerId}/skills`, {
                categoryId: skillData.categoryId,
                yearsOfExperience: skillData.yearsOfExperience,
                isPrimarySkill: skillData.isPrimarySkill,
            });
            // Response: { skillId: "..." }
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Lấy worker profile
     * @param {string} workerId
     * @returns {Promise<Object>} Worker profile with skills
     */
    getWorkerProfile: async (workerId) => {
        try {
            const response = await apiClient.get(`/api/dispatch/workers/${workerId}`);
            // Response: { workerId, userId, bio, availabilityStatus, workingRadiusKm, skills: [...] }
            return response.data;
        } catch (error) {
            throw error;
        }
    },
};

export default workerService;
