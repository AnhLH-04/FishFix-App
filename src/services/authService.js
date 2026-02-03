import apiClient from './apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Auth Service
 * Xử lý các API liên quan đến authentication
 */

const TOKEN_KEY = 'auth_token';

const authService = {
    /**
     * Đăng ký tài khoản mới
     * @param {Object} userData - Thông tin đăng ký
     * @param {string} userData.email - Email
     * @param {string} userData.phone - Số điện thoại
     * @param {string} userData.password - Mật khẩu
     * @param {string} userData.fullName - Tên đầy đủ
     * @param {string} userData.role - Vai trò: 'customer' hoặc 'worker'
     * @returns {Promise<{userId: string}>}
     */
    register: async (userData) => {
        try {
            const response = await apiClient.post('/api/identity/register', {
                email: userData.email,
                phone: userData.phone,
                password: userData.password,
                fullName: userData.fullName,
                role: userData.role === 'technician' ? 'worker' : userData.role, // Map technician -> worker
            });
            // Response: { userId: "..." }
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Đăng nhập
     * @param {string} identifier - Số điện thoại hoặc email
     * @param {string} password - Mật khẩu
     * @returns {Promise<{accessToken: string}>}
     */
    login: async (identifier, password) => {
        try {
            const response = await apiClient.post('/api/identity/login', {
                identifier: identifier,
                password: password,
            });
            // Response: { accessToken: "<jwt>" }
            const { accessToken } = response.data;
            
            // Lưu token vào AsyncStorage
            if (accessToken) {
                await AsyncStorage.setItem(TOKEN_KEY, accessToken);
            }
            
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Đăng xuất
     */
    logout: async () => {
        try {
            await AsyncStorage.removeItem(TOKEN_KEY);
            return { success: true };
        } catch (error) {
            throw error;
        }
    },

    /**
     * Lấy thông tin user hiện tại
     * @returns {Promise<{userId: string, email: string, fullName: string, phone: string, roleId: number}>}
     */
    getCurrentUser: async () => {
        try {
            const token = await AsyncStorage.getItem(TOKEN_KEY);
            if (!token) {
                throw { message: 'Chưa đăng nhập', status: 401 };
            }
            
            // Không cần truyền token thủ công, interceptor sẽ tự động thêm
            const response = await apiClient.get('/api/identity/me');
            // Response: { userId, email, fullName, phone, roleId }
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Cập nhật profile
     * @param {Object} profileData
     * @param {string} profileData.fullName
     * @param {string} profileData.phone
     */
    updateProfile: async (profileData) => {
        try {
            const token = await AsyncStorage.getItem(TOKEN_KEY);
            if (!token) {
                throw { message: 'Chưa đăng nhập', status: 401 };
            }
            
            // Không cần truyền token thủ công, interceptor sẽ tự động thêm
            await apiClient.put('/api/identity/me', profileData);
            return { success: true };
        } catch (error) {
            throw error;
        }
    },

    /**
     * Lấy token từ storage
     */
    getToken: async () => {
        return await AsyncStorage.getItem(TOKEN_KEY);
    },

    /**
     * Kiểm tra user đã đăng nhập chưa
     */
    isAuthenticated: async () => {
        const token = await AsyncStorage.getItem(TOKEN_KEY);
        return !!token;
    },

    /**
     * Quên mật khẩu - Gửi link đặt lại mật khẩu
     * @param {string} email - Email của user
     * @returns {Promise<{message: string}>}
     */
    forgotPassword: async (email) => {
        try {
            const response = await apiClient.post('/api/identity/forgot-password', {
                email: email,
            });
            // Response: { message: "Password reset link sent successfully" }
            return response.data;
        } catch (error) {
            throw error;
        }
    },
};

export default authService;
