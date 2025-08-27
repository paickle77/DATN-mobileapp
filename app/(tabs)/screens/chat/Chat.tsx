import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AIService } from '../../services/aiService';
import { saveUserData } from '../utils/storage';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  type?: 'text' | 'product' | 'product_list';
  productData?: any; // Thông tin sản phẩm nếu type là 'product'
  suggestedProducts?: any[]; // Danh sách sản phẩm gợi ý nếu type là 'product_list'
}

const ChatScreen = () => {
  const navigation = useNavigation();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '🎂 Chào mừng bạn đến với CakeShop! Tôi là trợ lý AI chuyên tư vấn bánh ngọt. Hãy cho tôi biết bạn đang tìm loại bánh nào nhé! 🍰✨',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false); // ✅ Trạng thái bot đang trả lời
  const scrollViewRef = useRef<ScrollView>(null);
  const [loadingMessageId, setLoadingMessageId] = useState<string | null>(null);
  const [loadingDots, setLoadingDots] = useState('');
  const [quickSuggestions, setQuickSuggestions] = useState<any[]>([]);

  // Function để navigate tới Detail screen
  const navigateToProductDetail = async (productId: string) => {
    try {
      await saveUserData({ key: 'productID', value: productId });
      navigation.navigate('Detail' as never);
    } catch (error) {
      console.error('Error navigating to product detail:', error);
    }
  };

  useEffect(() => {
    if (loadingMessageId) {
      const interval = setInterval(() => {
        setLoadingDots(prev => {
          if (prev === '...') return '';
          return prev + '.';
        });
      }, 500);
      return () => clearInterval(interval);
    } else {
      setLoadingDots('');
    }
  }, [loadingMessageId]);

  // Load quick suggestions khi component mount
  useEffect(() => {
    const loadQuickSuggestions = async () => {
      try {
        const suggestions = await AIService.getQuickSuggestions();
        console.log('📋 Quick suggestions loaded:', suggestions); // Debug log
        setQuickSuggestions(suggestions);
      } catch (error) {
        console.error('Error loading quick suggestions:', error);
        // Fallback suggestions
        setQuickSuggestions([
          { text: "Tôi cần bánh sinh nhật", type: "birthday_cake" },
          { text: "Có bánh ngọt gì mới không?", type: "new_products" },
          { text: "Giá cả như thế nào?", type: "pricing" },
          { text: "Làm sao để đặt hàng?", type: "order_guide" }
        ]);
      }
    };

    loadQuickSuggestions();
  }, []);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    const currentInput = inputText.trim();
    setInputText('');

    // Show loading message
    const loadingId = (Date.now() + 1).toString();
    const loadingMsg: Message = {
      id: loadingId,
      text: 'Đang xử lý',
      isUser: false,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, loadingMsg]);
    setLoadingMessageId(loadingId);

    try {
      // Gọi API từ backend thay vì trực tiếp từ frontend
      const result = await AIService.chat(currentInput, messages);

      // Remove loading message and add bot response
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.id !== loadingId);
        const botMsg: Message = {
          id: (Date.now() + 2).toString(),
          text: result.message,
          isUser: false,
          timestamp: new Date(),
          type: 'text'
        };
        
        let newMessages = [...filtered, botMsg];
        
        // Nếu có suggested products, thêm vào tin nhắn dưới dạng list ngang
        if (result.suggestedProducts && result.suggestedProducts.length > 0) {
          const productListMsg: Message = {
            id: (Date.now() + 3).toString(),
            text: '', // Không cần text
            isUser: false,
            timestamp: new Date(),
            type: 'product_list',
            suggestedProducts: result.suggestedProducts
          };
          newMessages.push(productListMsg);
        }
        
        return newMessages;
      });

    } catch (error) {
      console.error('Chat error:', error);
      
      // Remove loading message and show error
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.id !== loadingId);
        const errorMsg: Message = {
          id: (Date.now() + 2).toString(),
          text: 'Xin lỗi, tôi không thể trả lời lúc này. Vui lòng thử lại sau! 😊',
          isUser: false,
          timestamp: new Date()
        };
        return [...filtered, errorMsg];
      });
    } finally {
      setLoadingMessageId(null);
    }
  };

  const sendQuickMessage = async (text: string, suggestion?: any) => {
    console.log('🚀 sendQuickMessage called with:', { text, suggestion }); // Debug log
    
    const userMsg: Message = {
      id: Date.now().toString(),
      text: text,
      isUser: true,
      timestamp: new Date(),
      type: 'text',
    };

    setMessages(prev => [...prev, userMsg]);

    // Show loading message
    const loadingId = (Date.now() + 1).toString();
    const loadingMsg: Message = {
      id: loadingId,
      text: 'Đang xử lý',
      isUser: false,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, loadingMsg]);
    setLoadingMessageId(loadingId);

    try {
      // Nếu là sản phẩm (có product_id), navigate trực tiếp tới Detail
      if (suggestion && suggestion.product_id && suggestion.type === 'product_inquiry') {
        // Remove loading message
        setMessages(prev => prev.filter(msg => msg.id !== loadingId));
        setLoadingMessageId(null);
        
        // Navigate tới Detail screen
        await navigateToProductDetail(suggestion.product_id);
        return;
      } else {
        // Gọi API từ backend cho quick messages thông thường
        const result = await AIService.chat(text, messages);

        // Remove loading message and add bot response
        setMessages(prev => {
          const filtered = prev.filter(msg => msg.id !== loadingId);
          const botMsg: Message = {
            id: (Date.now() + 2).toString(),
            text: result.message,
            isUser: false,
            timestamp: new Date(),
            type: 'text'
          };
          return [...filtered, botMsg];
        });
      }

    } catch (error) {
      console.error('Quick message error:', error);
      
      // Fallback responses for quick messages
      let fallbackReply = '';
      switch (text) {
        case 'Hướng dẫn đặt bánh':
          fallbackReply = `Để đặt bánh:  
 Bước 1: Bạn chọn vào màn hình home trên thanh Tabbar sẽ là icon đầu tiên
 Bước 2: Tìm kiếm và chọn sản phẩm bạn muốn mua
 Bước 3: Thêm sản phẩm đấy vào giỏ hàng
 Bước 4: Ở thanh Tabbar chọn mục giỏ hàng, icon thứ 2
 Bước 5: Ở trang giỏ hàng bạn nhấn thanh toán
 Bước 6: Sau khi nhấn thanh toán sẽ chuyển qua màn thanh toán, việc của bạn là điền đủ thông tin rồi ấn thanh toán`;
          break;
        case 'Hướng dẫn thay đổi thông tin tài khoản':
          fallbackReply = `Hướng dẫn thay đổi thông tin tài khoản :
Bước 1: Bạn chọn vào màn hình Profile trên thanh Tabbar sẽ là icon cuối cùng
Bước 2: Bạn chọn vào mục Hồ sơ của bạn
Bước 3: Sửa đổi thông tin mà bạn muốn`;
          break;
        default:
          fallbackReply = 'Xin lỗi, tôi chưa hiểu yêu cầu của bạn. Vui lòng thử lại sau! 😊';
      }
      
      // Remove loading message and show fallback
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.id !== loadingId);
        const errorMsg: Message = {
          id: (Date.now() + 2).toString(),
          text: fallbackReply,
          isUser: false,
          timestamp: new Date(),
          type: 'text'
        };
        return [...filtered, errorMsg];
      });
    } finally {
      setLoadingMessageId(null);
    }
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages, isTyping]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const MessageBubble = ({ message }: { message: Message }) => (
    <View style={[
      styles.messageBubble,
      message.isUser ? styles.userMessage : styles.botMessage
    ]}>
      {!message.isUser && message.type !== 'product_list' && (
        <View style={styles.botAvatar}>
          <MaterialIcons name="cake" size={20} color="#8B4513" />
        </View>
      )}
      
      {/* Hiển thị product list nằm ngang */}
      {message.type === 'product_list' && message.suggestedProducts && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.productListContainer}
          contentContainerStyle={styles.productListContent}
        >
          {message.suggestedProducts.map((product, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.productCardHorizontal}
              onPress={() => navigateToProductDetail(product.id)}
            >
              <Image 
                source={{ uri: product.image_url || 'https://via.placeholder.com/120' }} 
                style={styles.productImageHorizontal}
                resizeMode="cover"
              />
              <View style={styles.productInfoHorizontal}>
                <Text style={styles.productNameHorizontal} numberOfLines={2}>
                  {product.name}
                </Text>
                <View style={styles.productPriceContainerHorizontal}>
                  {product.discount_price > 0 ? (
                    <>
                      <Text style={styles.productDiscountPriceHorizontal}>
                        {product.discount_price.toLocaleString('vi-VN')}đ
                      </Text>
                      <Text style={styles.productOriginalPriceHorizontal}>
                        {product.price.toLocaleString('vi-VN')}đ
                      </Text>
                    </>
                  ) : (
                    <Text style={styles.productPriceHorizontal}>
                      {product.price.toLocaleString('vi-VN')}đ
                    </Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Hiển thị message content bình thường */}
      {message.type !== 'product_list' && (
        <View style={[
          styles.messageContent,
          message.isUser ? styles.userMessageContent : styles.botMessageContent,
          message.type === 'product' && styles.productMessageContent
        ]}>
          {/* Hiển thị text message */}
          {message.text && (
            <Text style={[
              styles.messageText,
              message.isUser ? styles.userMessageText : styles.botMessageText
            ]}>
              {message.id === loadingMessageId ? `${message.text}${loadingDots}` : message.text}
            </Text>
          )}

          {/* Hiển thị thông tin sản phẩm nếu type là 'product' */}
          {message.type === 'product' && message.productData && (
            <TouchableOpacity 
              style={styles.productCard}
              onPress={() => navigateToProductDetail(message.productData.id)}
            >
              <Image 
                source={{ uri: message.productData.image_url || 'https://via.placeholder.com/150' }} 
                style={styles.productImage}
                resizeMode="cover"
              />
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{message.productData.name}</Text>
                <Text style={styles.productDescription} numberOfLines={2}>
                  {message.productData.description || 'Không có mô tả'}
                </Text>
                
                <View style={styles.productPriceContainer}>
                  {message.productData.discount_price > 0 ? (
                    <>
                      <Text style={styles.productDiscountPrice}>
                        {message.productData.discount_price.toLocaleString('vi-VN')}đ
                      </Text>
                      <Text style={styles.productOriginalPrice}>
                        {message.productData.price.toLocaleString('vi-VN')}đ
                      </Text>
                    </>
                  ) : (
                    <Text style={styles.productPrice}>
                      {message.productData.price.toLocaleString('vi-VN')}đ
                    </Text>
                  )}
                </View>

                <View style={styles.productMeta}>
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={14} color="#FFD700" />
                    <Text style={styles.ratingText}>{message.productData.rating}/5</Text>
                  </View>
                  <Text style={styles.stockText}>
                    Còn lại: {message.productData.stock}
                  </Text>
                </View>

                {message.productData.category && (
                  <Text style={styles.categoryText}>
                    Danh mục: {message.productData.category.name}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          )}

          <Text style={[
            styles.timestamp,
            message.isUser ? styles.userTimestamp : styles.botTimestamp
          ]}>
            {formatTime(message.timestamp)}
          </Text>
        </View>
      )}
    </View>
  );

  const QuickActions = () => (
    <View style={styles.quickActions}>
      <Text style={styles.quickActionsTitle}>
        💡 Gợi ý nhanh:
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {quickSuggestions.map((suggestion, idx) => (
          <TouchableOpacity 
            key={idx} 
            style={styles.quickButton} 
            onPress={() => sendQuickMessage(suggestion.text, suggestion)}
          >
            <Ionicons 
              name={suggestion.type === 'product_inquiry' ? "storefront" : 
                   suggestion.type === 'birthday_cake' ? "gift" :
                   suggestion.type === 'new_products' ? "sparkles" :
                   suggestion.type === 'pricing' ? "pricetag" : "help-circle"} 
              size={16} 
              color="#D2691E" 
            />
            <Text style={styles.quickButtonText}>{suggestion.text}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.headerAvatar}>
            <MaterialIcons name="cake" size={28} color="#8B4513" />
          </View>
          <View>
            <Text style={styles.headerTitle}>🧁 CakeShop</Text>
            <Text style={styles.headerSubtitle}>✨ Tư vấn bánh ngọt 24/7</Text>
          </View>
        </View>
        <View style={styles.statusIndicator} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
          {/* Messages */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}

            {isTyping && (
              <View style={styles.typingIndicator}>
                <View style={styles.botAvatar}>
                  <MaterialIcons name="cake" size={20} color="#8B4513" />
                </View>
                <View style={styles.typingBubble}>
                  <Text style={styles.typingText}>🤖 Đang suy nghĩ...</Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Quick Actions */}
          <QuickActions />
          
          {/* Input Container */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                value={inputText}
                onChangeText={setInputText}
                placeholder="💬 Hỏi tôi về bánh ngọt..."
                placeholderTextColor="#999"
                multiline={true}
                maxLength={500}
                textAlignVertical="center"
              />
            </View>
            <TouchableOpacity
              style={[
                styles.sendButton,
                inputText.trim() ? styles.sendButtonActive : styles.sendButtonInactive
              ]}
              onPress={sendMessage}
              disabled={!inputText.trim()}
            >
              <Ionicons 
                name="send" 
                size={20} 
                color={inputText.trim() ? "#fff" : "#999"} 
              />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF0E6',
  },

  keyboardAvoidingView: {
    flex: 1,
  },

  // Header - Enhanced cake shop theme
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 0 : 10,
    paddingBottom: 16,
    backgroundColor: '#8B4513',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#8B4513',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  
  headerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
    fontWeight: '500',
  },

  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00FF7F',
    marginRight: 8,
  },

  // Messages container
  messagesContainer: {
    flex: 1,
    backgroundColor: '#FAF0E6',
  },
  
  messagesContent: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 20,
    flexGrow: 1,
  },

  messageBubble: {
    flexDirection: 'row',
    marginVertical: 4,
    alignItems: 'flex-end',
  },
  
  userMessage: {
    flexDirection: 'row-reverse',
  },
  
  botMessage: {
    flexDirection: 'row',
  },
  
  // Enhanced bot avatar
  botAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 2,
    shadowColor: '#8B4513',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1.5,
    borderColor: '#DEB887',
  },

  // Enhanced message bubbles
  messageContent: {
    maxWidth: '85%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginHorizontal: 2,
  },
  
  userMessageContent: {
    backgroundColor: '#8B4513',
    borderBottomRightRadius: 4,
    shadowColor: '#8B4513',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  
  botMessageContent: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 0.5,
    borderColor: '#E8E8E8',
  },
  
  // Enhanced message text
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '400',
  },
  
  userMessageText: {
    color: '#fff',
    fontWeight: '500',
  },
  
  botMessageText: {
    color: '#333',
    fontWeight: '400',
  },
  
  // Better timestamps
  timestamp: {
    fontSize: 10,
    marginTop: 6,
    fontWeight: '500',
  },
  
  userTimestamp: {
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'right',
  },
  
  botTimestamp: {
    color: '#999',
  },

  // Typing indicator
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginLeft: 8,
    marginBottom: 8,
  },
  
  typingBubble: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomLeftRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  typingText: {
    color: '#8B4513',
    fontSize: 13,
    fontStyle: 'italic',
  },

  // Enhanced quick actions
  quickActions: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 4,
  },
  
  quickActionsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8B4513',
    marginBottom: 8,
    marginLeft: 2,
  },
  
  quickButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5E6D3',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#D2B48C',
    shadowColor: '#8B4513',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  
  quickButtonText: {
    fontSize: 12,
    color: '#D2691E',
    marginLeft: 5,
    fontWeight: '600',
  },

  // Enhanced input area - FIX CHO VẤN ĐỀ NHẬP LIỆU
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    minHeight: Platform.OS === 'ios' ? 86 : 72,
  },
  
  inputWrapper: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 18,
    paddingVertical: 12,
    marginRight: 12,
    minHeight: 48,
    maxHeight: 120,
    borderWidth: 2,
    borderColor: '#8B4513',
    shadowColor: '#8B4513',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    justifyContent: 'center',
  },
  
  textInput: {
    fontSize: 16,
    color: '#333',
    fontWeight: '400',
    minHeight: 24,
    maxHeight: 96,
    textAlignVertical: 'center',
    lineHeight: 20,
    paddingTop: 0,
    paddingBottom: 0,
    margin: 0,
  },
  
  // Enhanced send button
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8B4513',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  
  sendButtonActive: {
    backgroundColor: '#8B4513',
  },
  
  sendButtonInactive: {
    backgroundColor: '#F0F0F0',
  },

  // Enhanced product message styles
  productMessageContent: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F5F5F5',
    minWidth: '85%',
    maxWidth: '85%',
  },

  // Enhanced product card styles
  productCard: {
    marginTop: 12,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F5E6D3',
    borderWidth: 1,
    borderColor: '#DEB887',
    shadowColor: '#8B4513',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  
  productImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#F5F5F5',
  },
  
  productInfo: {
    padding: 16,
  },
  
  productName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#8B4513',
    marginBottom: 6,
  },
  
  productDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
    lineHeight: 18,
  },
  
  productPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  productPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#8B4513',
  },
  
  productDiscountPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#8B4513',
    marginRight: 10,
  },
  
  productOriginalPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
    fontWeight: '500',
  },
  
  productMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8DC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  
  ratingText: {
    fontSize: 12,
    color: '#D2691E',
    marginLeft: 4,
    fontWeight: '600',
  },
  
  stockText: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontWeight: '500',
  },
  
  categoryText: {
    fontSize: 12,
    color: '#8B4513',
    fontStyle: 'italic',
    backgroundColor: '#F5E6D3',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    fontWeight: '500',
  },

  // Enhanced horizontal Product List Styles
  productListContainer: {
    marginVertical: 8,
    marginLeft: 40,
  },
  
  productListContent: {
    paddingHorizontal: 12,
  },
  
  productCardHorizontal: {
    width: 160,
    marginRight: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#8B4513',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#DEB887',
  },
  
  productImageHorizontal: {
    width: '100%',
    height: 90,
    backgroundColor: '#F5F5F5',
  },
  
  productInfoHorizontal: {
    padding: 12,
  },
  
  productNameHorizontal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8B4513',
    marginBottom: 6,
    height: 36,
    lineHeight: 18,
  },
  
  productPriceContainerHorizontal: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  
  productPriceHorizontal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#8B4513',
  },
  
  productDiscountPriceHorizontal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#8B4513',
  },
  
  productOriginalPriceHorizontal: {
    fontSize: 11,
    color: '#999',
    textDecorationLine: 'line-through',
    marginTop: 2,
    fontWeight: '500',
  },
  
  productMetaHorizontal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  
  ratingTextHorizontal: {
    fontSize: 10,
    color: '#D2691E',
    marginLeft: 3,
    fontWeight: '600',
  },
});