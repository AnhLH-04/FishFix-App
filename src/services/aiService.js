// AI Service - Phân tích hình ảnh sự cố
// Sử dụng Google AI Studio (Gemini) với fallback về mock data

import { analyzeImageWithGemini, chatWithGemini, analyzeTextWithGemini } from './geminiService';

/**
 * Mock data - Sử dụng khi Gemini API không khả dụng
 */
const mockResults = [
    {
        category: 'Máy Giặt',
        problem: 'Rò rỉ nước từ cửa máy giặt',
        severity: 'Trung Bình',
        solution:
            'Kiểm tra gioăng cao su cửa máy có bị rách hoặc bẩn. Vệ sinh hoặc thay thế gioăng mới. Đảm bảo không nhét quá nhiều quần áo vào máy.',
        estimatedCost: '150,000đ - 300,000đ',
        recommendedTechnicians: [
            {
                name: 'Nguyễn Văn A',
                rating: 4.9,
                jobs: 450,
                specialty: 'Chuyên sửa máy giặt',
                price: '150,000đ',
            },
            {
                name: 'Trần Thị B',
                rating: 4.8,
                jobs: 320,
                specialty: 'Điện nước, máy giặt',
                price: '180,000đ',
            },
        ],
    },
    {
        category: 'Điều Hòa',
        problem: 'Điều hòa không lạnh, chạy liên tục',
        severity: 'Cao',
        solution:
            'Có thể do thiếu gas, rò rỉ gas, hoặc cục nóng bị bẩn. Cần vệ sinh cục nóng và kiểm tra áp suất gas. Có thể cần nạp gas.',
        estimatedCost: '200,000đ - 500,000đ',
        recommendedTechnicians: [
            {
                name: 'Phạm Văn D',
                rating: 5.0,
                jobs: 180,
                specialty: 'Chuyên điều hòa, tủ lạnh',
                price: '250,000đ',
            },
            {
                name: 'Lê Văn C',
                rating: 4.7,
                jobs: 280,
                specialty: 'Đa năng - Sửa chữa tổng hợp',
                price: '200,000đ',
            },
        ],
    },
    {
        category: 'Tủ Lạnh',
        problem: 'Tủ lạnh kêu ồn, không đông lạnh',
        severity: 'Cao',
        solution:
            'Block máy nén có thể bị hỏng hoặc thiếu gas. Cần kiểm tra máy nén và hệ thống gas. Có thể cần thay máy nén mới.',
        estimatedCost: '300,000đ - 800,000đ',
        recommendedTechnicians: [
            {
                name: 'Phạm Văn D',
                rating: 5.0,
                jobs: 180,
                specialty: 'Chuyên điều hòa, tủ lạnh',
                price: '300,000đ',
            },
            {
                name: 'Nguyễn Văn A',
                rating: 4.9,
                jobs: 450,
                specialty: 'Chuyên sửa máy giặt, điều hòa, tủ lạnh',
                price: '350,000đ',
            },
        ],
    },
    {
        category: 'Điện Nước',
        problem: 'Ổ cắm điện bị cháy, không hoạt động',
        severity: 'Cao',
        solution:
            'Ngắt điện ngay lập tức! Ổ cắm có thể bị quá tải hoặc chập điện. Cần thay ổ cắm mới và kiểm tra toàn bộ hệ thống điện.',
        estimatedCost: '100,000đ - 250,000đ',
        recommendedTechnicians: [
            {
                name: 'Trần Thị B',
                rating: 4.8,
                jobs: 320,
                specialty: 'Điện nước, ống nước',
                price: '120,000đ',
            },
            {
                name: 'Lê Văn C',
                rating: 4.7,
                jobs: 280,
                specialty: 'Đa năng - Sửa chữa tổng hợp',
                price: '100,000đ',
            },
        ],
    },
    {
        category: 'Bếp Gas',
        problem: 'Bếp gas không lên lửa, có mùi gas',
        severity: 'Cao',
        solution:
            'Kiểm tra van gas và đường dẫn gas có rò rỉ không. Đầu đốt có thể bị tắc. Vệ sinh đầu đốt và kiểm tra toàn bộ hệ thống gas.',
        estimatedCost: '80,000đ - 200,000đ',
        recommendedTechnicians: [
            {
                name: 'Lê Văn C',
                rating: 4.7,
                jobs: 280,
                specialty: 'Đa năng - Sửa chữa tổng hợp',
                price: '100,000đ',
            },
            {
                name: 'Nguyễn Văn A',
                rating: 4.9,
                jobs: 450,
                specialty: 'Chuyên sửa đồ gia dụng',
                price: '120,000đ',
            },
        ],
    },
];

/**
 * Mock chatbot responses - Sử dụng khi Gemini API không khả dụng
 */
const mockChatResponses = {
    'máy giặt': 'Máy giặt của bạn gặp vấn đề gì? Có rò nước, không vắt, hay không quay?',
    'điều hòa': 'Điều hòa không lạnh hay gặp vấn đề khác? Tôi có thể giúp chẩn đoán.',
    'tủ lạnh': 'Tủ lạnh không lạnh hay kêu ồn? Cho tôi biết chi tiết hơn nhé.',
    'giá': 'Giá dịch vụ từ 100,000đ - 500,000đ tùy vào loại sửa chữa. Bạn cần sửa gì?',
    'bảo hành': 'Tất cả dịch vụ đều có bảo hành 15-60 ngày tùy gói. Gói Premium có bảo hành 60 ngày.',
    default: 'Tôi có thể giúp bạn với các vấn đề về máy giặt, điều hòa, tủ lạnh, điện nước... Bạn cần hỗ trợ gì?',
};

/**
 * Phân tích hình ảnh sự cố và trả về chẩn đoán
 * Sử dụng Gemini AI, fallback về mock data nếu lỗi
 * @param {string} imageUri - URI của hình ảnh
 * @returns {Promise<Object>} - Kết quả phân tích
 */
export const analyzeImage = async (imageUri) => {
    try {
        console.log('🔍 Bắt đầu phân tích hình ảnh với Gemini AI...');

        // Try Gemini AI first
        const result = await analyzeImageWithGemini(imageUri);
        console.log('✅ Phân tích thành công với Gemini AI');
        return result;

    } catch (error) {
        console.warn('⚠️ Gemini API không khả dụng, sử dụng mock data:', error.message);

        // Fallback to mock data
        await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate delay
        const randomIndex = Math.floor(Math.random() * mockResults.length);
        return mockResults[randomIndex];
    }
};

/**
 * Chatbot AI - Hỗ trợ tư vấn nhanh
 * Sử dụng Gemini AI, fallback về mock responses nếu lỗi
 * @param {string} question - Câu hỏi của người dùng
 * @param {Array} conversationHistory - Lịch sử hội thoại (optional)
 * @returns {Promise<string>} - Câu trả lời
 */
export const chatbotAI = async (question, conversationHistory = []) => {
    try {
        console.log('💬 Gửi câu hỏi đến Gemini AI...');

        // Try Gemini AI first
        const response = await chatWithGemini(question, conversationHistory);
        console.log('✅ Nhận phản hồi từ Gemini AI');
        return response;

    } catch (error) {
        console.warn('⚠️ Gemini Chat không khả dụng, sử dụng mock response:', error.message);

        // Fallback to mock responses
        await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate delay

        const lowerQuestion = question.toLowerCase();
        for (const [key, value] of Object.entries(mockChatResponses)) {
            if (key !== 'default' && lowerQuestion.includes(key)) {
                return value;
            }
        }
        return mockChatResponses.default;
    }
};

/**
 * Gợi ý thợ phù hợp dựa trên AI
 * @param {Object} params - Tham số tìm kiếm
 * @returns {Promise<Array>} - Danh sách thợ được gợi ý
 */
export const suggestTechnicians = async (params) => {
    const { category, location, budget, urgency } = params;

    await new Promise((resolve) => setTimeout(resolve, 800));

    // Mock AI recommendation logic
    // TODO: Tích hợp Gemini để gợi ý thợ dựa trên context
    const technicians = [
        {
            id: 1,
            name: 'Nguyễn Văn A',
            rating: 4.9,
            matchScore: 95,
            reason: 'Chuyên gia về ' + category + ', gần bạn nhất, giá phù hợp',
        },
        {
            id: 2,
            name: 'Trần Thị B',
            rating: 4.8,
            matchScore: 88,
            reason: 'Kinh nghiệm lâu năm, phản hồi nhanh',
        },
        {
            id: 3,
            name: 'Phạm Văn D',
            rating: 5.0,
            matchScore: 92,
            reason: 'Đánh giá cao nhất, chuyên môn xuất sắc',
        },
    ];

    return technicians.sort((a, b) => b.matchScore - a.matchScore);
};

/**
 * Phân tích sự cố dựa trên mô tả text
 * Sử dụng Gemini AI, fallback về mock responses nếu lỗi
 * @param {string} description - Mô tả sự cố từ người dùng
 * @returns {Promise<Object>} - Kết quả phân tích
 */
export const analyzeText = async (description) => {
    try {
        console.log('📝 Bắt đầu phân tích mô tả sự cố với Gemini AI...');

        // Try Gemini AI first
        const result = await analyzeTextWithGemini(description);
        console.log('✅ Phân tích text thành công với Gemini AI');
        return result;

    } catch (error) {
        console.warn('⚠️ Gemini Text API không khả dụng, sử dụng mock data:', error.message);

        // Fallback to mock data based on keywords
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const lowerDesc = description.toLowerCase();
        let mockResult = mockResults[0]; // Default

        // Simple keyword matching for fallback
        if (lowerDesc.includes('điều hòa') || lowerDesc.includes('máy lạnh')) {
            mockResult = mockResults.find(r => r.category === 'Điều Hòa') || mockResults[1];
        } else if (lowerDesc.includes('tủ lạnh')) {
            mockResult = mockResults.find(r => r.category === 'Tủ Lạnh') || mockResults[2];
        } else if (lowerDesc.includes('điện') || lowerDesc.includes('ổ cắm')) {
            mockResult = mockResults.find(r => r.category === 'Điện Nước') || mockResults[3];
        } else if (lowerDesc.includes('bếp') || lowerDesc.includes('gas')) {
            mockResult = mockResults.find(r => r.category === 'Bếp Gas') || mockResults[4];
        } else if (lowerDesc.includes('máy giặt') || lowerDesc.includes('giặt')) {
            mockResult = mockResults.find(r => r.category === 'Máy Giặt') || mockResults[0];
        }

        return mockResult;
    }
};

export default {
    analyzeImage,
    analyzeText,
    chatbotAI,
    suggestTechnicians,
};
