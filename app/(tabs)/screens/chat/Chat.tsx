import { Ionicons, MaterialIcons } from '@expo/vector-icons';
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

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const ChatScreen = () => {
  const navigation = useNavigation();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Chào bạn! Tôi là chatbot của PlantShop, tôi có thể giúp gì cho bạn về cây cối và cây trồng',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false); // ✅ Trạng thái bot đang trả lời
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
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true); // ✅ Bắt đầu trả lời

    try {
      const response = await fetch('http://10.0.2.2:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3',
          prompt: `Bạn là chatbot của hệ thống APP CakeShop. Trả lời ngắn gọn, thân thiện, liên quan đến bánh ngọt bằng tiếng Việt. Người dùng hỏi: "${userMsg.text}"`,
          stream: false
        })
      });

      const data = await response.json();
      const reply = data.response || 'Xin lỗi, tôi chưa hiểu ý bạn.';

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: reply,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error("❌ Lỗi gọi Ollama:", err);
      setMessages(prev => [...prev, {
        id: (Date.now() + 2).toString(),
        text: 'Xin lỗi, hệ thống gặp sự cố.',
        isUser: false,
        timestamp: new Date(),
      }]);
    } finally {
      setIsTyping(false); // ✅ Đã trả lời xong
    }
  };


  const sendQuickMessage = (text: string) => {
  const userMsg: Message = {
    id: Date.now().toString(),
    text,
    isUser: true,
    timestamp: new Date(),
  };

  setMessages(prev => [...prev, userMsg]);

  let botReply = '';
  switch (text) {
    case 'Hướng dẫn đặt bánh':
      botReply = `Để đặt bánh:\nBước 1: Vào màn hình Home\nBước 2: Chọn sản phẩm\nBước 3: Thêm vào giỏ hàng\nBước 4: Vào giỏ hàng và thanh toán\nBước 5: Điền thông tin & xác nhận`;
      break;
    case 'Hướng dẫn thay đổi thông tin tài khoản':
      botReply = `Bước 1: Vào Profile\nBước 2: Hồ sơ của bạn\nBước 3: Chỉnh sửa thông tin`;
      break;
    case 'Hướng dẫn thay đổi địa chỉ giao hàng':
      botReply = `Vào Profile → Danh sách địa chỉ → Thêm/Sửa địa chỉ → Ấn dấu +`;
      break;
    case 'Bảng xếp hạng các loại bánh bán chạy':
      botReply = `Top Cake:\n1. Bánh kem socola\n2. Tiramisu\n3. Cupcake`;
      break;
    case 'Hướng dẫn theo dõi đơn hàng':
      botReply = `Vào Profile → Đơn hàng của bạn → Xem trạng thái đơn`;
      break;
    case 'Hướng dẫn thay đổi phương thức thanh toán':
      botReply = `Profile → Phương thức thanh toán → Thay đổi theo ý bạn`;
      break;
    default:
      botReply = 'Xin lỗi, tôi chưa hiểu yêu cầu của bạn.';
  }

  const botMsg: Message = {
    id: (Date.now() + 1).toString(),
    text: botReply,
    isUser: false,
    timestamp: new Date(),
  };

  setMessages(prev => [...prev, botMsg]);
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
      {!message.isUser && (
        <View style={styles.botAvatar}>
          <Ionicons name="leaf" size={20} color="#2E7D32" />
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
          {message.id === loadingMessageId ? `${message.text}${loadingDots}` : message.text}
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
  const QuickActions = () => (
  <View style={styles.quickActions}>
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {[
        'Hướng dẫn đặt bánh',
        'Hướng dẫn thay đổi thông tin tài khoản',
        'Hướng dẫn thay đổi địa chỉ giao hàng',
        'Hướng dẫn theo dõi đơn hàng',
        'Hướng dẫn thay đổi phương thức thanh toán',
        'Bảng xếp hạng các loại bánh bán chạy'
      ].map((text, idx) => (
        <TouchableOpacity key={idx} style={styles.quickButton} onPress={() => sendQuickMessage(text)}>
          <Ionicons name="help-circle-outline" size={16} color="#FF6B6B" />
          <Text style={styles.quickButtonText}>{text}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
);


  return (
    
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1B5E20" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.headerAvatar}>
            <Ionicons name="leaf" size={24} color="#2E7D32" />
          </View>
          <View>
            <Text style={styles.headerTitle}>PlantShop Bot</Text>
            <Text style={styles.headerSubtitle}>Trợ lý chăm sóc cây xanh</Text>
          </View>
        </View>
      </View>

      {/* Messages */}
      <ScrollView ref={scrollViewRef} style={styles.messagesContainer} showsVerticalScrollIndicator={false}>
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        
        {isTyping && (
          <View style={styles.typingIndicator}>
            <MaterialIcons name="cake" size={18} color="#FF6B6B" />
            <Text style={styles.typingText}>Đang trả lời...</Text>
          </View>
        )}
      </ScrollView>
        <QuickActions />
      {/* Input */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Hỏi tôi về cây cối..."
            placeholderTextColor="#81C784"
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
          <Ionicons name="send" size={18} color={inputText.trim() ? "#fff" : "#A5D6A7"} />
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
  typingIndicator: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: 8,
  paddingLeft: 8,
},
typingText: {
  fontSize: 13,
  color: '#888',
  marginLeft: 6,
  fontStyle: 'italic',
},

  // Styles cho giao diện
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#C8E6C9',
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
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
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
marginRight: 12,
    borderWidth: 2,
    borderColor: '#A5D6A7',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1B5E20',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 1,
    fontStyle: 'italic',
  },
  moreButton: {
    padding: 8,
  },

  // Message styles với theme tự nhiên
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  messageBubble: {
    flexDirection: 'row',
    marginVertical: 6,
    alignItems: 'flex-end',
  },
  userMessage: {
    flexDirection: 'row-reverse',
  },
  botMessage: {
    flexDirection: 'row',
  },
  botAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 4,
    borderWidth: 2,
    borderColor: '#C8E6C9',
  },
  messageContent: {
    maxWidth: '78%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  userMessageContent: {
    backgroundColor: '#4CAF50', // Xanh lá đậm cho tin nhắn user
    borderBottomRightRadius: 6,
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  botMessageContent: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: '#E8F5E8',
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  botMessageText: {
    color: '#1B5E20',
  },
  timestamp: {
    fontSize: 11,
    marginTop: 6,
  },
  userTimestamp: {
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'right',
  },
  botTimestamp: {
    color: '#81C784',
  },

  // Quick actions với theme cây xanh
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#C8E6C9',
  },
  quickButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F8E9',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 25,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#C8E6C9',
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  quickButtonText: {
    fontSize: 12,
    color: '#2E7D32',
    marginLeft: 6,
    fontWeight: '600',
  },

  // Input styles với theme xanh tự nhiên
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#C8E6C9',
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
backgroundColor: '#F1F8E9',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    minHeight: 44,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#1B5E20',
    maxHeight: 100,
    paddingVertical: 4,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  sendButtonActive: {
    backgroundColor: '#4CAF50',
  },
  sendButtonInactive: {
    backgroundColor: '#E8F5E8',
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
});