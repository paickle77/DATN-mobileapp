import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useNavigation } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const genAI = new GoogleGenerativeAI("AIzaSyAauakKip4CAEdknvzI6R2jZboBKMX_JUg");

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  type?: 'text' | 'location' | 'recommendation';
}

const ChatScreen = () => {
  const navigation = useNavigation();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Chào bạn! Tôi là chatbot của CakeShop, tôi có thể giúp gì cho bạn',
      isUser: false,
      timestamp: new Date(),
      type: 'text',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  const [loadingMessageId, setLoadingMessageId] = useState<string | null>(null);
  const [loadingDots, setLoadingDots] = useState('');

  useEffect(() => {
    if (loadingMessageId) {
      const interval = setInterval(() => {
        setLoadingDots(prev => (prev === '...' ? '' : prev + '.'));
      }, 500);
      return () => clearInterval(interval);
    } else {
      setLoadingDots('');
    }
  }, [loadingMessageId]);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
      type: 'text',
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    // Hiển thị tin nhắn loading
    const loadingId = (Date.now() + 1).toString();
    const loadingMsg: Message = {
      id: loadingId,
      text: 'Đang xử lý',
      isUser: false,
      timestamp: new Date(),
      type: 'text',
    };
    setMessages(prev => [...prev, loadingMsg]);
    setLoadingMessageId(loadingId);

    try {
       console.log("🚀 Bắt đầu gọi API Ollama...");
      const response = await fetch('http://10.0.2.2:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3',
          prompt: `Bạn là chatbot của hệ thống APP CakeShop. 
Trả lời ngắn gọn, thân thiện, chỉ gợi ý về vấn đề liên quan đến bánh , bánh ngọt và đặc biệt phải sử dụng tiếng Việt.
Người dùng hỏi: "${userMsg.text}"`,
          stream: false
        })
      });

     console.log("📥 Đã nhận phản hồi HTTP, đang parse JSON...");
    const data = await response.json();
    console.log("✅ JSON trả về từ Ollama:", data);
      const reply = data.response || 'Xin lỗi, tôi chưa hiểu ý bạn.';

      setMessages(prev => prev.map(msg =>
        msg.id === loadingId ? { ...msg, text: reply, timestamp: new Date() } : msg
      ));
      setLoadingMessageId(null);

    } catch (err) {
      console.error("❌ Lỗi gọi Ollama:", err);
      setMessages(prev => prev.map(msg =>
        msg.id === loadingId ? {
          ...msg,
          text: '❌ Xin lỗi, hệ thống gặp sự cố.',
          timestamp: new Date()
        } : msg
      ));
      setLoadingMessageId(null);
    }
  };




  const sendQuickMessage = (text: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      text: text,
      isUser: true,
      timestamp: new Date(),
      type: 'text',
    };

    setMessages(prev => [...prev, userMsg]);

    // Tùy theo text, trả về câu trả lời cứng
    let botReply = '';
    switch (text) {
      case 'Hướng dẫn đặt bánh':
        botReply = `Để đặt bánh:  
 Bước 1: Bạn chọn vào màn hình home trên thanh Tabbar sẽ là icon đầu tiên
 Bước 2: Tìm kiếm và chọn sản phẩm bạn muốn mua
 Bước 3: Thêm sản phẩm đấy vào giỏ hàng
 Bước 4: Ở thanh Tabbar chọn mục giỏ hàng, icon thứ 2
 Bước 5: Ở trang giỏ hàng bạn nhấn thanh toán
 Bước 6: Sau khi nhấn thanh toán sẽ chuyển qua màn thanh toán, việc của bạn là điền đủ thông tin rồi ấn thanh toán`;
        break;
      case 'Hướng dẫn thay đổi thông tin tài khoản':
        botReply = `Hướng dẫn thay đổi thông tin tài khoản :
Bước 1: Bạn chọn vào màn hình Profile trên thanh Tabbar sẽ là icon cuối cùng
Bước 2: Bạn chọn vào mục Hồ sơ của bạn
Bước 3: Sửa đổi thông tin mà bạn muốn
    `;
        break;
      case 'Hướng dẫn thay đổi địa chỉ giao hàng':
        botReply = `Hướng dẫn thay đổi hoặc thêm địa chỉ giao hàng :
Bước 1: Bạn chọn vào màn hình Profile trên thanh Tabbar sẽ là icon cuối cùng
Bước 2: Bạn chọn vào mục danh sách địa chỉ
Bước 3: Ở đây sẽ hiện địa chỉ mà bạn đã sửa và xóa địa chỉ cũ, nếu muốn thêm địa chỉ ấn vào dấu + ở trên cùng bên tay phải

      `;
        break;
      case 'Bảng xếp hạng các loại bánh bán chạy':
        botReply = `Top Cake:
1. Bánh kem socola, 
2. Bánh tiramisu,
3. Bánh cupcake.`;
        break;
      case 'Hướng dẫn theo dõi đơn hàng':
        botReply = `Hướng dẫn theo dõi đơn hàng:
Bước 1: Bạn chọn vào màn hình Profile trên thanh Tabbar sẽ là icon cuối cùng
Bước 2: Bạn chọn vào mục đơn hàng của bạn
Bước 3: Ở màn hình này bạn có thể theo dõi đơn hàng của bạn rồi`;
        break;
      case 'Hướng dẫn thay đổi phương thức thanh toán':
        botReply = `Hướng dẫn thay đổi phương thức thanh toán:
Bước 1: Bạn chọn vào màn hình Profile trên thanh Tabbar sẽ là icon cuối cùng
Bước 2: Bạn chọn vào mục phương thức thanh toán
Bước 3: Ở màn hình này bạn có thể thay đổi phương thức thanh toán của mình rồi`;
        break;
      default:
        botReply = 'Xin lỗi, tôi chưa hiểu yêu cầu của bạn.';
    }

    const botMsg: Message = {
      id: (Date.now() + 1).toString(),
      text: botReply,
      isUser: false,
      timestamp: new Date(),
      type: 'text',
    };

    setMessages(prev => [...prev, botMsg]);
  };


  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const QuickActions = () => (
    <View style={styles.quickActions}>
      <ScrollView
        horizontal={true}>
        <TouchableOpacity style={styles.quickButton} onPress={() => sendQuickMessage('Hướng dẫn đặt bánh')}>
          <Ionicons name="cart" size={16} color="#FF6B6B" />
          <Text style={styles.quickButtonText}>Hướng dẫn đặt bánh</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickButton} onPress={() => sendQuickMessage('Hướng dẫn thay đổi thông tin tài khoản')}>
          <Ionicons name="person" size={16} color="#FF6B6B" />
          <Text style={styles.quickButtonText}>Hướng dẫn thay đổi thông tin tài khoản</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickButton} onPress={() => sendQuickMessage('Hướng dẫn thay đổi hoặc thêm địa chỉ giao hàng')}>
          <Ionicons name="location" size={16} color="#FF6B6B" />
          <Text style={styles.quickButtonText}>Hướng dẫn thay đổi hoặc thêm địa chỉ giao hàng</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickButton} onPress={() => sendQuickMessage('Hướng dẫn theo dõi đơn hàng')}>
          <Ionicons name="eye" size={16} color="#FF6B6B" />
          <Text style={styles.quickButtonText}>Hướng dẫn theo dõi đơn hàng</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickButton} onPress={() => sendQuickMessage('Hướng dẫn thay đổi phương thức thanh toán')}>
          <Ionicons name="card" size={16} color="#FF6B6B" />
          <Text style={styles.quickButtonText}>Hướng dẫn thay đổi phương thức thanh toán</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickButton} onPress={() => sendQuickMessage('Bảng xếp hạng các loại bánh bán chạy')}>
          <Ionicons name="star" size={16} color="#FF6B6B" />
          <Text style={styles.quickButtonText}>Top Cake</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  const MessageBubble = ({ message }: { message: Message }) => (
    <View style={[
      styles.messageBubble,
      message.isUser ? styles.userMessage : styles.botMessage
    ]}>
      {!message.isUser && (
        <View style={styles.botAvatar}>
          <MaterialIcons name="cake" size={20} color="#FF6B6B" />
        </View>
      )}
      <View style={[
        styles.messageContent,
        message.isUser ? styles.userMessageContent : styles.botMessageContent
      ]}>
        <Text style={[
          styles.messageText,
          message.isUser ? styles.userMessageText : styles.botMessageText
        ]}>
          <Text style={[
            styles.messageText,
            message.isUser ? styles.userMessageText : styles.botMessageText
          ]}>
            {message.id === loadingMessageId ? `${message.text}${loadingDots}` : message.text}
          </Text>
        </Text>
        <Text style={[
          styles.timestamp,
          message.isUser ? styles.userTimestamp : styles.botTimestamp
        ]}>
          {formatTime(message.timestamp)}
        </Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.headerAvatar}>
            <MaterialIcons name="cake" size={24} color="#FF6B6B" />
          </View>
          <View>
            <Text style={styles.headerTitle}>CakeShop Bot</Text>
            <Text style={styles.headerSubtitle}>Trợ lý tìm bánh ngọt</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-vertical" size={20} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView ref={scrollViewRef} style={styles.messagesContainer} showsVerticalScrollIndicator={false}>
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
      </ScrollView>

      <QuickActions />

      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Nhập tin nhắn..."
            placeholderTextColor="#999"
            multiline
            maxLength={500}
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
          <Ionicons name="send" size={18} color={inputText.trim() ? "#fff" : "#999"} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatScreen;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },

  // Styles cho giao diện
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  backButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff2f2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#FFE5E5',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 1,
  },
  moreButton: {
    padding: 8,
  },

  // Styles cho tin nhắn
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
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
  botAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff2f2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 4,
  },
  messageContent: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  userMessageContent: {
    backgroundColor: '#FF6B6B',
    borderBottomRightRadius: 8,
  },
  botMessageContent: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#fff',
  },
  botMessageText: {
    color: '#333',
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
  },
  userTimestamp: {
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'right',
  },
  botTimestamp: {
    color: '#999',
  },

  // Styles cho hành động nhanh
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  quickButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff2f2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#FFE5E5',
  },
  quickButtonText: {
    fontSize: 12,
    color: '#FF6B6B',
    marginLeft: 4,
    fontWeight: '500',
  },

  // Styles cho ô nhập liệu
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f8f9fa',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    minHeight: 40,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    maxHeight: 100,
    paddingVertical: 4,
  },
  attachButton: {
    padding: 4,
    marginLeft: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: '#FF6B6B',
  },
  sendButtonInactive: {
    backgroundColor: '#f0f0f0',
  },
});