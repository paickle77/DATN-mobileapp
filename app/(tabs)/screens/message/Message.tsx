import axios from "axios";
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { io } from "socket.io-client";
import { BASE_URL, BASE_URL1 } from "../../services/api";
import { getUserData } from "../utils/storage";

const socket = io(`${BASE_URL1}`);

const ChatScreen = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const flatListRef = useRef<FlatList>(null);
  const navigation = useNavigation();

  const ADMIN_ID = "685e2fea79bd687050637953";

  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  useEffect(() => {
    (async () => {
      const user = await getUserData("accountId");
      if (user) { 
        setUserId(user);
        socket.emit("join", user);

        const res = await axios.get(`${BASE_URL}/messages/${user}`);
        setMessages(res.data);
      }
    })();

    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => {
        // Kiểm tra xem tin nhắn đã tồn tại chưa (dựa vào _id hoặc timestamp)
        const isDuplicate = prev.some(existingMsg => 
          existingMsg._id === msg._id || 
          (existingMsg.senderId === msg.senderId && 
           existingMsg.receiverId === msg.receiverId && 
           existingMsg.message === msg.message && 
           existingMsg.imageUrl === msg.imageUrl &&
           Math.abs(new Date(existingMsg.timestamp || existingMsg.createdAt).getTime() - 
                   new Date(msg.timestamp || msg.createdAt).getTime()) < 1000)
        );
        
        if (isDuplicate) {
          return prev;
        }
        
        return [...prev, msg];
      });
    });

    // Simulate online status
    socket.on("connect", () => setIsOnline(true));
    socket.on("disconnect", () => setIsOnline(false));

    return () => {
      socket.off("receiveMessage");
    };
  }, []);

  const sendMessage = async () => {
    if (!message.trim() || !userId) return;

    const msg = {
      senderId: userId,
      receiverId: ADMIN_ID,
      message,
    };

    try {
      // Chỉ emit socket, không thêm vào state ngay
      // Socket service sẽ lưu DB và emit lại cho cả sender và receiver
      socket.emit("sendMessage", msg);
      setMessage("");
    } catch (err) {
      console.error("❌ Lỗi khi gửi tin nhắn:", err);
    }
  };

  const sendImage = async (base64String: string) => {
    if (!userId) return;

    const imageMsg = {
      senderId: userId,
      receiverId: ADMIN_ID,
      imageUrl: base64String,
      message: "", // Có thể để trống hoặc "Ảnh"
    };

    try {
      // Chỉ emit socket, không thêm vào state ngay
      // Socket service sẽ lưu DB và emit lại cho cả sender và receiver
      socket.emit("sendMessage", imageMsg);
    } catch (err) {
      console.error("❌ Lỗi khi gửi ảnh:", err);
    }
  };


  const pickImage = async () => {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
            if (permissionResult.granted === false) {
                Alert.alert('Cần quyền truy cập', 'Ứng dụng cần quyền truy cập thư viện ảnh để thay đổi ảnh đại diện.');
                return;
            }
    
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
                base64: true, 
            });
    
            if (!result.canceled) {
                const base64String = `data:image/jpeg;base64,${result.assets[0].base64}`;
                await sendImage(base64String);
            }
        };
    
        // Hàm chụp ảnh
        const takePhoto = async () => {
            const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
            if (permissionResult.granted === false) {
                Alert.alert('Cần quyền truy cập', 'Ứng dụng cần quyền truy cập camera để chụp ảnh.');
                return;
            }
    
            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
                base64: true, 
            });
    
            if (!result.canceled) {
                const base64String = `data:image/jpeg;base64,${result.assets[0].base64}`;
                await sendImage(base64String);
                console.log('🟢 Chụp ảnh thành công:', result.assets[0].uri);
            }
        };
    
        // Hiển thị tùy chọn thay đổi ảnh
        const showImageOptions = () => {
                Alert.alert(
                    'Thay đổi ảnh đại diện',
                'Chọn cách bạn muốn thay đổi ảnh đại diện',
                    [
                        { text: 'Hủy', style: 'cancel' },
                        { text: 'Chọn từ thư viện', onPress: () => pickImage() },
                        { text: 'Chụp ảnh mới', onPress: () => takePhoto() },
                    ]
                );
            };

  const renderMessage = ({ item }: { item: any }) => {
    const sender = item.senderId?._id || item.senderId;
    const isMyMessage = sender === userId;

    const time = item.timestamp || item.createdAt || new Date();
    const formattedTime = time
      ? new Date(time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      : '';

    return (
      <View
        style={[
          styles.messageContainer,
          isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble,
          ]}
        >
          {/* Nếu có ảnh thì hiện ảnh, ngược lại hiện text */}
          {item.imageUrl ? (
            <Image
              source={{ uri: item.imageUrl }}
              style={{ width: 180, height: 180, borderRadius: 10, marginBottom: 4 }}
              resizeMode="cover"
            />
          ) : (
            <Text
              style={[
                styles.messageText,
                isMyMessage ? styles.myMessageText : styles.otherMessageText,
              ]}
            >
              {item.message}
            </Text>
          )}

          <Text
            style={[
              styles.timestamp,
              isMyMessage ? styles.myTimestamp : styles.otherTimestamp,
            ]}
          >
            {formattedTime}
          </Text>
        </View>
      </View>
    );
  };


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#634838" />
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Enhanced Header */}
        <View style={styles.headerContainer}>
          {/* Main Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <View style={styles.backIconContainer}>
                <Text style={styles.backButtonText}>←</Text>
              </View>
            </TouchableOpacity>
            
            <View style={styles.headerCenter}>
              {/* Shop Avatar */}
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>C</Text>
                </View>
                <View style={[styles.onlineIndicator, { backgroundColor: isOnline ? '#4CAF50' : '#9E9E9E' }]} />
              </View>
              
              {/* Shop Info */}
              <View style={styles.shopInfo}>
                <Text style={styles.headerTitle}>Cake Shop</Text>
                <Text style={styles.statusText}>
                  {isOnline ? 'Đang hoạt động' : 'Offline'}
                </Text>
              </View>
            </View>

            
          </View>
          
          {/* Gradient Overlay */}
          <View style={styles.gradientOverlay} />
        </View>

        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(_, index) => index.toString()}
          renderItem={renderMessage}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
        />

        {/* Input Container */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Nhập tin nhắn..."
              placeholderTextColor="#A0A0A0"
              style={styles.textInput}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={styles.imageButton}
              onPress={showImageOptions}
            >
              <Text style={styles.imageButtonText}>📷</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.sendButton,
                !message.trim() && styles.sendButtonDisabled
              ]}
              onPress={sendMessage}
              disabled={!message.trim()}
            >
              <Text style={styles.sendButtonText}>Gửi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F6F4',
  },
  
  // Enhanced Header Styles
  headerContainer: {
    position: 'relative',
    backgroundColor: '#634838',
  },
  
  header: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  
  backButton: {
    padding: 4,
  },
  
  backIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 5,
  },
  
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 30,
  },
  
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#8D6E63',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#634838',
  },
  
  shopInfo: {
    flex: 1,
  },
  
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  
  statusText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontWeight: '400',
  },
  
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  
  actionIcon: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  
  // Rest of the styles remain the same
  messagesList: {
    flex: 1,
  },
  
  messagesContainer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  
  messageContainer: {
    marginVertical: 4,
    marginBottom: 12,
  },
  
  myMessageContainer: {
    alignItems: 'flex-end',
  },
  
  otherMessageContainer: {
    alignItems: 'flex-start',
  },
  
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  
  myMessageBubble: {
    backgroundColor: '#634838',
    borderBottomRightRadius: 4,
  },
  
  otherMessageBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E8E5E2',
  },
  
  messageText: {
    fontSize: 16,
    lineHeight: 20,
    marginBottom: 4,
  },
  
  myMessageText: {
    color: '#FFFFFF',
  },
  
  otherMessageText: {
    color: '#2C2C2C',
  },
  
  timestamp: {
    fontSize: 11,
    fontWeight: '400',
  },
  
  myTimestamp: {
    color: '#E8E5E2',
    textAlign: 'right',
  },
  
  otherTimestamp: {
    color: '#999999',
    textAlign: 'left',
  },
  
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E8E5E2',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F8F6F4',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E8E5E2',
    paddingLeft: 16,
    paddingRight: 4,
    paddingVertical: 4,
  },
  
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#2C2C2C',
    maxHeight: 100,
    paddingVertical: 12,
    paddingRight: 8,
  },

  imageButton: {
    backgroundColor: '#E8E5E2',
    borderRadius: 20,
    padding: 10,
    marginRight: 4,
  },

  imageButtonText: {
    fontSize: 18,
    marginBottom: 5,
  },

  
  sendButton: {
    backgroundColor: '#634838',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginLeft: 8,
  },
  
  sendButtonDisabled: {
    backgroundColor: '#B8A599',
    opacity: 0.6,
  },
  
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ChatScreen;