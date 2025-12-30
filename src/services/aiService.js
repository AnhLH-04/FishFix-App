// Mock AI Service - Phân tích hình ảnh sự cố
// Trong production, thay thế bằng Google Vision API hoặc custom AI model

/**
 * Phân tích hình ảnh sự cố và trả về chẩn đoán
 * @param {string} imageUri - URI của hình ảnh
 * @returns {Promise<Object>} - Kết quả phân tích
 */
export const analyzeImage = async (imageUri) => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mock AI analysis result
    // Trong thực tế, sẽ gửi ảnh đến Google Vision API hoặc custom model
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

    // Randomly select a mock result to simulate AI analysis
    const randomIndex = Math.floor(Math.random() * mockResults.length);
    return mockResults[randomIndex];
};

/**
 * Tích hợp Google Vision API (Production)
 * Uncomment và configure khi deploy production
 */
/*
import axios from 'axios';

const GOOGLE_VISION_API_KEY = 'YOUR_API_KEY_HERE';
const GOOGLE_VISION_API_URL = `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`;

export const analyzeImageWithGoogleVision = async (imageUri) => {
  try {
    // Convert image to base64
    const base64Image = await convertImageToBase64(imageUri);

    // Prepare request
    const requestData = {
      requests: [
        {
          image: {
            content: base64Image,
          },
          features: [
            { type: 'LABEL_DETECTION', maxResults: 10 },
            { type: 'OBJECT_LOCALIZATION', maxResults: 10 },
            { type: 'IMAGE_PROPERTIES' },
            { type: 'TEXT_DETECTION' },
          ],
        },
      ],
    };

    // Call Google Vision API
    const response = await axios.post(GOOGLE_VISION_API_URL, requestData);
    
    // Process results
    const labels = response.data.responses[0].labelAnnotations || [];
    const objects = response.data.responses[0].localizedObjectAnnotations || [];
    
    // Map labels to appliance categories
    const diagnosis = processVisionResults(labels, objects);
    
    return diagnosis;
  } catch (error) {
    console.error('Google Vision API Error:', error);
    throw error;
  }
};

const processVisionResults = (labels, objects) => {
  // Logic to analyze labels and objects
  // Map to appliance categories and problems
  // Return structured diagnosis
  
  // This is where you implement your business logic
  // to interpret Google Vision results
};

const convertImageToBase64 = async (imageUri) => {
  // Implementation to convert image to base64
  // Can use FileSystem from expo-file-system
};
*/

/**
 * Chatbot AI - Hỗ trợ tư vấn nhanh
 * @param {string} question - Câu hỏi của người dùng
 * @returns {Promise<string>} - Câu trả lời
 */
export const chatbotAI = async (question) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const responses = {
        'máy giặt': 'Máy giặt của bạn gặp vấn đề gì? Có rò nước, không vắt, hay không quay?',
        'điều hòa': 'Điều hòa không lạnh hay gặp vấn đề khác? Tôi có thể giúp chẩn đoán.',
        'tủ lạnh': 'Tủ lạnh không lạnh hay kêu ồn? Cho tôi biết chi tiết hơn nhé.',
        'giá': 'Giá dịch vụ từ 100,000đ - 500,000đ tùy vào loại sửa chữa. Bạn cần sửa gì?',
        'bảo hành': 'Tất cả dịch vụ đều có bảo hành 15-60 ngày tùy gói. Gói Premium có bảo hành 60 ngày.',
        default: 'Tôi có thể giúp bạn với các vấn đề về máy giặt, điều hòa, tủ lạnh, điện nước... Bạn cần hỗ trợ gì?',
    };

    const lowerQuestion = question.toLowerCase();

    for (const [key, value] of Object.entries(responses)) {
        if (lowerQuestion.includes(key)) {
            return value;
        }
    }

    return responses.default;
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
    // Trong thực tế, sử dụng ML model để rank thợ
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

export default {
    analyzeImage,
    chatbotAI,
    suggestTechnicians,
};
