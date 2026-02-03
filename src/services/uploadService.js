import axios from 'axios';
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from '@env';

/**
 * Upload ảnh lên Cloudinary và trả về URL
 * @param {string} uri - URI của ảnh từ ImagePicker
 * @returns {Promise<string>} - URL của ảnh đã upload
 */
export const uploadImageToCloudinary = async (uri) => {
    try {
        // Tạo FormData
        const formData = new FormData();
        
        // Lấy tên file và type từ URI
        const filename = uri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        
        formData.append('file', {
            uri,
            name: filename,
            type,
        });
        
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        
        // Upload lên Cloudinary
        const response = await axios.post(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        
        // Trả về secure_url
        return response.data.secure_url;
    } catch (error) {
        console.error('Upload image error:', error.response?.data || error.message);
        throw new Error('Không thể upload ảnh. Vui lòng thử lại.');
    }
};

/**
 * Upload nhiều ảnh lên Cloudinary
 * @param {string[]} uris - Mảng các URI của ảnh
 * @returns {Promise<string[]>} - Mảng các URL của ảnh đã upload
 */
export const uploadMultipleImages = async (uris) => {
    try {
        const uploadPromises = uris.map(uri => uploadImageToCloudinary(uri));
        const urls = await Promise.all(uploadPromises);
        return urls;
    } catch (error) {
        console.error('Upload multiple images error:', error);
        throw error;
    }
};

export default {
    uploadImageToCloudinary,
    uploadMultipleImages,
};
