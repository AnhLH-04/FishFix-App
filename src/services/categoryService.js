import apiClient from './apiClient';

/**
 * Category Service - Quản lý danh mục dịch vụ
 */

/**
 * Lấy tất cả categories
 * @param {boolean} activeOnly - Chỉ lấy categories đang hoạt động
 * @returns {Promise<Array>}
 */
export const getAllCategories = async (activeOnly = true) => {
    try {
        const response = await apiClient.get('/api/categories', {
            params: { activeOnly }
        });
        return response.data;
    } catch (error) {
        console.error('Get categories error:', error);
        throw error;
    }
};

/**
 * Lấy categories theo parentId (sub-categories)
 * @param {string} parentId - ID của category cha
 * @returns {Promise<Array>}
 */
export const getCategoriesByParent = async (parentId) => {
    try {
        const allCategories = await getAllCategories();
        return allCategories.filter(cat => cat.parentId === parentId);
    } catch (error) {
        console.error('Get sub-categories error:', error);
        throw error;
    }
};

/**
 * Lấy root categories (categories không có parent)
 * @returns {Promise<Array>}
 */
export const getRootCategories = async () => {
    try {
        const allCategories = await getAllCategories();
        return allCategories.filter(cat => cat.parentId === null);
    } catch (error) {
        console.error('Get root categories error:', error);
        throw error;
    }
};

export default {
    getAllCategories,
    getCategoriesByParent,
    getRootCategories,
};
