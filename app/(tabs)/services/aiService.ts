import { BASE_URL } from './api';
// Thay đổi IP theo địa chỉ máy backend của bạn

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatResponse {
  success: boolean;
  data: {
    message: string;
    timestamp: string;
    is_fallback?: boolean;
    suggested_products?: ProductInfo[];
  };
}

interface QuickSuggestion {
  text: string;
  type: string;
  product_id?: string;
}

interface SuggestionsResponse {
  success: boolean;
  data: QuickSuggestion[];
}

interface ProductInfo {
  id: string;
  name: string;
  description: string;
  price: number;
  discount_price: number;
  actual_price: number;
  image_url: string;
  rating: number;
  stock: number;
  category: any;
  branch: any;
  ingredients: any[];
}

interface ProductInfoResponse {
  success: boolean;
  data: ProductInfo;
}

export class AIService {
  // Gửi tin nhắn chat đến AI
  static async chat(message: string, conversationHistory?: Message[]): Promise<{message: string, suggestedProducts?: ProductInfo[]}> {
    try {
      const response = await fetch(`${BASE_URL}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          conversation_history: conversationHistory
        })
      });

      const data: ChatResponse = await response.json();
      
      if (data.success) {
        return {
          message: data.data.message,
          suggestedProducts: data.data.suggested_products || []
        };
      } else {
        throw new Error('Lỗi khi gọi API chat');
      }
    } catch (error) {
      console.error('AI Chat Service Error:', error);
      return {
        message: 'Xin lỗi, tôi không thể trả lời câu hỏi này lúc này. Vui lòng thử lại sau! 😊',
        suggestedProducts: []
      };
    }
  }

  // Lấy các gợi ý nhanh
  static async getQuickSuggestions(): Promise<QuickSuggestion[]> {
    try {
      console.log('🌐 Calling suggestions API:', `${BASE_URL}/ai/suggestions`); // Debug log
      
      const response = await fetch(`${BASE_URL}/ai/suggestions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data: SuggestionsResponse = await response.json();
      console.log('🌐 Suggestions API response:', data); // Debug log
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error('Lỗi khi lấy gợi ý');
      }
    } catch (error) {
      console.error('Get Suggestions Error:', error);
      return [
        { text: "Tôi cần bánh sinh nhật", type: "birthday_cake" },
        { text: "Có bánh ngọt gì mới không?", type: "new_products" },
        { text: "Giá cả như thế nào?", type: "pricing" },
        { text: "Làm sao để đặt hàng?", type: "order_guide" }
      ];
    }
  }

  // Lấy thông tin sản phẩm
  static async getProductInfo(productId: string): Promise<ProductInfo | null> {
    try {
      console.log('🌐 Calling product info API:', `${BASE_URL}/ai/product/${productId}`); // Debug log
      
      const response = await fetch(`${BASE_URL}/ai/product/${productId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data: ProductInfoResponse = await response.json();
      console.log('🌐 Product info API response:', data); // Debug log
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error('Không tìm thấy sản phẩm');
      }
    } catch (error) {
      console.error('Get Product Info Error:', error);
      return null;
    }
  }
}
