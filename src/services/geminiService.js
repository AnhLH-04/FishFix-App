/**
 * Gemini AI Service - Google AI Studio Integration
 * Sử dụng Gemini API để phân tích hình ảnh và chatbot
 */

import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import { GEMINI_API_KEY, GEMINI_API_URL } from '../config/constants';

// Gemini model configuration
const GEMINI_VISION_MODEL = 'gemma-3-27b-it';
const GEMINI_CHAT_MODEL = 'gemma-3-27b-it';

/**
 * Convert image URI to base64
 * @param {string} imageUri - Local image URI
 * @returns {Promise<string>} - Base64 encoded image
 */
const convertImageToBase64 = async (imageUri) => {
    try {
        const base64 = await FileSystem.readAsStringAsync(imageUri, {
            encoding: FileSystem.EncodingType.Base64,
        });
        return base64;
    } catch (error) {
        console.error('Error converting image to base64:', error);
        throw error;
    }
};

/**
 * Phân tích hình ảnh sự cố với Gemini Vision
 * @param {string} imageUri - URI của hình ảnh
 * @returns {Promise<Object>} - Kết quả phân tích
 */
export const analyzeImageWithGemini = async (imageUri) => {
    try {
        console.log('🤖 Đang gửi hình ảnh đến Gemini AI...');

        // Convert image to base64
        const base64Image = await convertImageToBase64(imageUri);

        // Determine mime type (assume jpeg for camera photos)
        const mimeType = imageUri.toLowerCase().includes('.png') ? 'image/png' : 'image/jpeg';

        // Prepare the prompt for appliance diagnosis
        const prompt = `Bạn là chuyên gia sửa chữa thiết bị gia dụng. Hãy phân tích hình ảnh này và xác định:

1. **Loại thiết bị** (Máy Giặt, Điều Hòa, Tủ Lạnh, Điện Nước, Bếp Gas, hoặc Khác)
2. **Vấn đề/sự cố** bạn nhìn thấy trong hình
3. **Mức độ nghiêm trọng** (Thấp, Trung Bình, hoặc Cao)
4. **Giải pháp đề xuất** để khắc phục
5. **Chi phí ước tính** (VNĐ)

Trả lời theo format JSON sau (chỉ trả về JSON, không có text khác):
{
    "category": "Loại thiết bị",
    "problem": "Mô tả vấn đề",
    "severity": "Mức độ",
    "solution": "Giải pháp chi tiết",
    "estimatedCost": "Khoảng giá VNĐ"
}

Nếu không thể xác định thiết bị hoặc sự cố, hãy trả về:
{
    "category": "Không xác định",
    "problem": "Không thể phân tích hình ảnh này",
    "severity": "Không xác định",
    "solution": "Vui lòng chụp lại hình ảnh rõ hơn hoặc liên hệ thợ để kiểm tra trực tiếp",
    "estimatedCost": "Liên hệ để báo giá"
}`;

        // Call Gemini API
        const response = await axios.post(
            `${GEMINI_API_URL}/models/${GEMINI_VISION_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
            {
                contents: [
                    {
                        parts: [
                            { text: prompt },
                            {
                                inline_data: {
                                    mime_type: mimeType,
                                    data: base64Image
                                }
                            }
                        ]
                    }
                ],
                generationConfig: {
                    temperature: 0.4,
                    topK: 32,
                    topP: 1,
                    maxOutputTokens: 1024,
                }
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 30000, // 30 seconds timeout
            }
        );

        // Extract response text
        const responseText = response.data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!responseText) {
            throw new Error('Empty response from Gemini');
        }

        console.log('✅ Gemini response received:', responseText);

        // Parse JSON from response (handle markdown code blocks)
        let jsonString = responseText;

        // Remove markdown code blocks if present
        if (responseText.includes('```json')) {
            jsonString = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        } else if (responseText.includes('```')) {
            jsonString = responseText.replace(/```\n?/g, '');
        }

        const diagnosis = JSON.parse(jsonString.trim());

        // Add recommended technicians (mock data for now)
        diagnosis.recommendedTechnicians = [
            {
                name: 'Nguyễn Văn A',
                rating: 4.9,
                jobs: 450,
                specialty: 'Chuyên ' + diagnosis.category,
                price: '150,000đ',
            },
            {
                name: 'Trần Thị B',
                rating: 4.8,
                jobs: 320,
                specialty: 'Đa năng - Sửa chữa tổng hợp',
                price: '180,000đ',
            },
        ];

        return diagnosis;

    } catch (error) {
        console.error('❌ Gemini Vision API Error:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Chatbot với Gemini AI
 * @param {string} message - Tin nhắn của người dùng
 * @param {Array} conversationHistory - Lịch sử hội thoại (optional)
 * @returns {Promise<string>} - Phản hồi từ AI
 */
export const chatWithGemini = async (message, conversationHistory = []) => {
    try {
        console.log('💬 Đang gửi tin nhắn đến Gemini AI...');

        // Build conversation context
        const systemPrompt = `Bạn là trợ lý AI của FishFix - ứng dụng sửa chữa thiết bị gia dụng. 
Nhiệm vụ của bạn:
- Tư vấn về các vấn đề máy giặt, điều hòa, tủ lạnh, điện nước, bếp gas
- Hướng dẫn cách khắc phục sự cố đơn giản
- Giúp người dùng hiểu về dịch vụ và giá cả
- Trả lời thân thiện, ngắn gọn bằng tiếng Việt

Thông tin dịch vụ FishFix:
- Giá dịch vụ: từ 100,000đ - 500,000đ tùy loại sửa chữa
- Bảo hành: 15-60 ngày tùy gói dịch vụ
- Gói Premium có bảo hành 60 ngày
- Thợ được đánh giá và xác minh`;

        // Build messages array
        const contents = [];

        // Add conversation history
        conversationHistory.forEach(msg => {
            contents.push({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }]
            });
        });

        // Add current message
        contents.push({
            role: 'user',
            parts: [{ text: message }]
        });

        // Call Gemini API
        const response = await axios.post(
            `${GEMINI_API_URL}/models/${GEMINI_CHAT_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
            {
                systemInstruction: {
                    parts: [{ text: systemPrompt }]
                },
                contents: contents,
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 512,
                }
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 15000, // 15 seconds timeout
            }
        );

        // Extract response text
        const responseText = response.data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!responseText) {
            throw new Error('Empty response from Gemini');
        }

        console.log('✅ Gemini chat response:', responseText);
        return responseText;

    } catch (error) {
        console.error('❌ Gemini Chat API Error:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Phân tích sự cố bằng mô tả text với Gemini AI
 * @param {string} description - Mô tả sự cố từ người dùng
 * @returns {Promise<Object>} - Kết quả phân tích
 */
export const analyzeTextWithGemini = async (description) => {
    try {
        console.log('📝 Đang phân tích mô tả sự cố với Gemini AI...');

        const prompt = `Bạn là chuyên gia sửa chữa thiết bị gia dụng. Dựa trên mô tả sự cố sau đây, hãy phân tích và xác định:

MÔ TẢ SỰ CỐ: "${description}"

Hãy trả về kết quả theo format JSON sau (chỉ trả về JSON, không có text khác):
{
    "category": "Loại thiết bị (Máy Giặt, Điều Hòa, Tủ Lạnh, Điện Nước, Bếp Gas, hoặc Khác)",
    "problem": "Mô tả ngắn gọn vấn đề cụ thể",
    "severity": "Mức độ (Thấp, Trung Bình, hoặc Cao)",
    "solution": "Giải pháp chi tiết để khắc phục",
    "estimatedCost": "Khoảng giá ước tính bằng VNĐ"
}

Nếu mô tả không rõ ràng hoặc không liên quan đến thiết bị gia dụng, hãy trả về:
{
    "category": "Không xác định",
    "problem": "Không thể xác định sự cố từ mô tả",
    "severity": "Không xác định",
    "solution": "Vui lòng mô tả chi tiết hơn về thiết bị và triệu chứng sự cố, hoặc chụp ảnh để AI phân tích chính xác hơn",
    "estimatedCost": "Liên hệ để báo giá"
}`;

        // Call Gemini API
        const response = await axios.post(
            `${GEMINI_API_URL}/models/${GEMINI_CHAT_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
            {
                contents: [
                    {
                        parts: [{ text: prompt }]
                    }
                ],
                generationConfig: {
                    temperature: 0.3,
                    topK: 32,
                    topP: 1,
                    maxOutputTokens: 1024,
                }
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 20000,
            }
        );

        // Extract response text
        const responseText = response.data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!responseText) {
            throw new Error('Empty response from Gemini');
        }

        console.log('✅ Gemini text analysis response:', responseText);

        // Parse JSON from response
        let jsonString = responseText;
        if (responseText.includes('```json')) {
            jsonString = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        } else if (responseText.includes('```')) {
            jsonString = responseText.replace(/```\n?/g, '');
        }

        const diagnosis = JSON.parse(jsonString.trim());

        // Add recommended technicians
        diagnosis.recommendedTechnicians = [
            {
                name: 'Nguyễn Văn A',
                rating: 4.9,
                jobs: 450,
                specialty: 'Chuyên ' + diagnosis.category,
                price: '150,000đ',
            },
            {
                name: 'Trần Thị B',
                rating: 4.8,
                jobs: 320,
                specialty: 'Đa năng - Sửa chữa tổng hợp',
                price: '180,000đ',
            },
        ];

        return diagnosis;

    } catch (error) {
        console.error('❌ Gemini Text Analysis Error:', error.response?.data || error.message);
        throw error;
    }
};

export default {
    analyzeImageWithGemini,
    chatWithGemini,
    analyzeTextWithGemini,
};
