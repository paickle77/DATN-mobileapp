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
  type?: 'text' | 'location' | 'recommendation';
}

const ChatScreen = () => {
  const navigation = useNavigation();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Chào bạn! Tôi có thể giúp bạn tìm các tiệm bánh ngọt ngon gần đây. Bạn đang tìm loại bánh gì?',
      isUser: false,
      timestamp: new Date(),
      type: 'text',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  const sendMessage = () => {
    if (inputText.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: inputText,
        isUser: true,
        timestamp: new Date(),
        type: 'text',
      };

      setMessages(prev => [...prev, newMessage]);
      setInputText('');

      // Mô phỏng phản hồi từ bot
      setTimeout(() => {
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: 'Tôi đang tìm kiếm các tiệm bánh phù hợp với yêu cầu của bạn...',
          isUser: false,
          timestamp: new Date(),
          type: 'text',
        };
        setMessages(prev => [...prev, botResponse]);
      }, 1000);
    }
  };

  const sendQuickMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: new Date(),
      type: 'text',
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  useEffect(() => {
    // Tự động cuộn xuống tin nhắn mới nhất
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const QuickActions = () => (
    <View style={styles.quickActions}>
      <TouchableOpacity 
        style={styles.quickButton}
        onPress={() => sendQuickMessage('Tìm tiệm bánh gần tôi')}
      >
        <Ionicons name="location" size={16} color="#FF6B6B" />
        <Text style={styles.quickButtonText}>Gần tôi</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.quickButton}
        onPress={() => sendQuickMessage('Bánh sinh nhật')}
      >
        <Ionicons name="gift" size={16} color="#FF6B6B" />
        <Text style={styles.quickButtonText}>Sinh nhật</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.quickButton}
        onPress={() => sendQuickMessage('Bánh cupcake')}
      >
        <MaterialIcons name="cake" size={16} color="#FF6B6B" />
        <Text style={styles.quickButtonText}>Cupcake</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.quickButton}
        onPress={() => sendQuickMessage('Tiệm bánh đánh giá cao')}
      >
        <Ionicons name="star" size={16} color="#FF6B6B" />
        <Text style={styles.quickButtonText}>Top rated</Text>
      </TouchableOpacity>
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

 return (
  <KeyboardAvoidingView 
    style={styles.container}
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  >
    {/* Xử lý thông báo */}
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.navigate('Home')}
      >
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

    {/* Danh sách tin nhắn */}
    <ScrollView 
      ref={scrollViewRef}
      style={styles.messagesContainer}
      showsVerticalScrollIndicator={false}
    >
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
    </ScrollView>

    {/* Các hành động nhanh */}
    <QuickActions />

    {/* Ô nhập tin nhắn */}
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
        
        <TouchableOpacity style={styles.attachButton}>
          <Ionicons name="camera" size={20} color="#666" />
        </TouchableOpacity>
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
          size={18} 
          color={inputText.trim() ? "#fff" : "#999"} 
        />
      </TouchableOpacity>
    </View>
  </KeyboardAvoidingView>
);

};

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

export default ChatScreen;