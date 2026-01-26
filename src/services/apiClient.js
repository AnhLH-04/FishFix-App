import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base URL của backend
const API_BASE_URL = 'https://fishfix-backend.onrender.com';

// Tạo axios instance
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000, // 30 seconds
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor để thêm token vào header
apiClient.interceptors.request.use(
    async (config) => {
        // Tự động thêm token vào header nếu có
        const token = await AsyncStorage.getItem('auth_token');
        if (token && !config.headers.Authorization) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor để xử lý lỗi chung
apiClient.interceptors.response.use(
    (response) => {
        // Log response để debug (có thể tắt trong production)
        console.log(`✅ API Success: ${response.config.method.toUpperCase()} ${response.config.url}`);
        return response;
    },
    async (error) => {
        // Log error để debug
        if (error.response) {
            console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url} - Status: ${error.response.status}`);
        }
        
        if (error.response) {
            // Server trả về lỗi
            const status = error.response.status;
            const errorData = error.response.data;
            
            // Xử lý 401 - Token hết hạn hoặc không hợp lệ
            if (status === 401) {
                await AsyncStorage.removeItem('auth_token');
                return Promise.reject({ 
                    message: 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.',
                    status: 401
                });
            }
            
            // Xử lý 400 - Validation error
            if (status === 400) {
                return Promise.reject({ 
                    message: errorData?.message || errorData?.error || 'Dữ liệu không hợp lệ',
                    status: 400,
                    errors: errorData?.errors || null
                });
            }
            
            // Xử lý 404
            if (status === 404) {
                return Promise.reject({ 
                    message: errorData?.message || 'Không tìm thấy dữ liệu',
                    status: 404
                });
            }
            
            // Xử lý 500
            if (status === 500) {
                return Promise.reject({ 
                    message: 'Lỗi server. Vui lòng thử lại sau.',
                    status: 500
                });
            }
            
            // Các lỗi khác
            console.error('API Error Response:', errorData);
            return Promise.reject({
                message: errorData?.message || errorData?.error || 'Đã có lỗi xảy ra',
                status: status,
                data: errorData
            });
        } else if (error.request) {
            // Request được gửi nhưng không nhận được response
            console.error('API No Response:', error.request);
            return Promise.reject({ 
                message: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.',
                status: 0
            });
        } else {
            // Lỗi khác (setup, timeout, etc.)
            console.error('API Error:', error.message);
            return Promise.reject({ 
                message: error.message || 'Đã có lỗi xảy ra',
                status: -1
            });
        }
    }
);

export default apiClient;
export { API_BASE_URL };
