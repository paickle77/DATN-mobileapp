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
      text: 'Chào bạn! Tôi là chatbot của CakeShop, tôi có thể giúp gì cho bạn',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false); // ✅ Trạng thái bot đang trả lời
  const scrollViewRef = useRef<ScrollView>(null);

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
          prompt: `Bạn là chatbot của hệ thống APP CakeShop. Trả lời ngắn gọn, thân thiện, liên quan đến bánh ngọt, sử dụng 1 loại ngôn ngữ: tiếng Việt. Người dùng hỏi: "${userMsg.text}"`,
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
          {message.text}
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
