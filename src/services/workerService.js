import apiClient from './apiClient';

/**
 * Worker/Dispatch Service
 * Xử lý các API liên quan đến worker profile
 */

const workerService = {
    /**
     * Lấy worker profile theo workerId
     * @param {string} workerId
     * @returns {Promise<{workerId: string, ...}>}
     */
    getWorkerById: async (workerId) => {
        try {
            const response = await apiClient.get(`/api/dispatch/workers/${workerId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Lấy worker profile theo userId
     * @param {string} userId
     * @returns {Promise<{workerId: string, ...}>}
     */
    getWorkerByUserId: async (userId) => {
        try {
            const response = await apiClient.get(`/api/dispatch/workers/by-user/${userId}`);
            return response.data;
        } catch (error) {
            // Nếu 404 tức là chưa có worker profile
            if (error.response?.status === 404) {
                return null;
            }
            throw error;
        }
    },

    /**
     * Tạo worker profile
     * @param {Object} profileData
     * @param {string} profileData.userId
     * @param {string} profileData.bio
     * @param {number} profileData.workingRadiusKm
     * @param {number} profileData.hourlyRate
     * @param {string} profileData.idCardNumber
     * @param {string} profileData.idCardFrontUrl
     * @param {string} profileData.idCardBackUrl
     * @param {string} profileData.bankAccountName
     * @param {string} profileData.bankAccountNumber
     * @param {string} profileData.bankName
     * @returns {Promise<{workerId: string}>}
     */
    createWorkerProfile: async (profileData) => {
        try {
            const response = await apiClient.post('/api/dispatch/workers', {
                userId: profileData.userId,
                bio: profileData.bio || '',
                workingRadiusKm: profileData.workingRadiusKm || 0,
                hourlyRate: profileData.hourlyRate || 0,
                idCardNumber: profileData.idCardNumber || '',
                idCardFrontUrl: profileData.idCardFrontUrl || '',
                idCardBackUrl: profileData.idCardBackUrl || '',
                bankAccountName: profileData.bankAccountName || '',
                bankAccountNumber: profileData.bankAccountNumber || '',
                bankName: profileData.bankName || '',
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
     * @param {number} profileData.hourlyRate
     * @param {string} profileData.idCardNumber
     * @param {string} profileData.idCardFrontUrl
     * @param {string} profileData.idCardBackUrl
     * @param {string} profileData.bankAccountName
     * @param {string} profileData.bankAccountNumber
     * @param {string} profileData.bankName
     */
    updateWorkerProfile: async (workerId, profileData) => {
        try {
            await apiClient.put(`/api/dispatch/workers/${workerId}`, profileData);
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

    /**
     * Thêm chứng chỉ cho worker
     * @param {string} workerId
     * @param {Object} certData
     * @param {string} certData.certName - Tên chứng chỉ
     * @param {string} certData.certNumber - Số chứng chỉ
     * @param {string} certData.issuedBy - Tổ chức cấp
     * @param {string} certData.issuedDate - Ngày cấp (YYYY-MM-DD)
     * @param {string} certData.expiryDate - Ngày hết hạn (YYYY-MM-DD)
     * @param {string} certData.documentUrl - Link file chứng chỉ
     * @returns {Promise<{certId: string}>}
     */
    addWorkerCertification: async (workerId, certData) => {
        try {
            const response = await apiClient.post(`/api/dispatch/workers/${workerId}/certifications`, {
                certName: certData.certName,
                certNumber: certData.certNumber,
                issuedBy: certData.issuedBy,
                issuedDate: certData.issuedDate,
                expiryDate: certData.expiryDate,
                documentUrl: certData.documentUrl,
            });
            // Response: { certId: "..." }
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Lấy danh sách chứng chỉ của worker
     * @param {string} workerId
     * @returns {Promise<Array>} Danh sách chứng chỉ
     */
    getWorkerCertifications: async (workerId) => {
        try {
            const response = await apiClient.get(`/api/dispatch/workers/${workerId}/certifications`);
            // Response: [{ certId, certName, certNumber, issuedBy, issuedDate, expiryDate, documentUrl, status }]
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Cập nhật chứng chỉ
     * @param {string} certId
     * @param {Object} certData
     * @returns {Promise<{success: boolean}>}
     */
    updateCertification: async (certId, certData) => {
        try {
            await apiClient.put(`/api/dispatch/certifications/${certId}`, certData);
            return { success: true };
        } catch (error) {
            throw error;
        }
    },

    /**
     * Xóa chứng chỉ
     * @param {string} certId
     * @returns {Promise<{success: boolean}>}
     */
    deleteCertification: async (certId) => {
        try {
            await apiClient.delete(`/api/dispatch/certifications/${certId}`);
            return { success: true };
        } catch (error) {
            throw error;
        }
    },

    /**
     * Xác minh chứng chỉ (dành cho admin)
     * @param {string} certId
     * @returns {Promise<{success: boolean}>}
     */
    verifyCertification: async (certId) => {
        try {
            await apiClient.post(`/api/dispatch/certifications/${certId}/verify`);
            return { success: true };
        } catch (error) {
            throw error;
        }
    },

    /**
     * Tìm thợ gần customer location theo category
     * @param {Object} params
     * @param {number} params.categoryId - ID của category cần tìm
     * @param {number} params.latitude - Vị trí khách hàng (latitude)
     * @param {number} params.longitude - Vị trí khách hàng (longitude)
     * @param {number} params.radiusKm - Bán kính tìm kiếm (km), default 10km
     * @returns {Promise<Array>} Danh sách thợ gần nhất với distance
     */
    getNearbyWorkers: async ({ categoryId, latitude, longitude, radiusKm = 10 }) => {
        try {
            const response = await apiClient.get('/api/dispatch/workers/nearby', {
                params: {
                    categoryId,
                    latitude,
                    longitude,
                    radiusKm,
                },
            });
            // Response: [{ workerId, userId, fullName, phone, bio, avatarUrl, rating, completedJobs, 
            //              latitude, longitude, distance, skills: [...] }]
            return response.data;
        } catch (error) {
            throw error;
        }
    },
};

export default workerService;
