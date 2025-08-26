import axios from "axios";
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import Svg, { Circle, Path } from 'react-native-svg';
import { io } from "socket.io-client";
import { BASE_URL } from "../../services/api";
import { getUserData } from "../utils/storage";

const socket = io('http://14.225.198.220:5555');
const { width } = Dimensions.get('window');

// Custom Icons Components
const BackIcon = ({ color = "#007AFF", size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M15 18L9 12L15 6"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const SendIcon = ({ color = "#007AFF", size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M22 2L11 13"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M22 2L15 22L11 13L2 9L22 2Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={color}
      fillOpacity="0.1"
    />
  </Svg>
);

const AttachIcon = ({ color = "#8E8E93", size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21.44 11.05L12.25 20.24C11.12 21.37 9.53 22 7.87 22C6.21 22 4.62 21.37 3.49 20.24C2.36 19.11 1.73 17.52 1.73 15.86C1.73 14.2 2.36 12.61 3.49 11.48L12.68 2.29C13.48 1.49 14.57 1.05 15.7 1.05C16.83 1.05 17.92 1.49 18.72 2.29C19.52 3.09 19.96 4.18 19.96 5.31C19.96 6.44 19.52 7.53 18.72 8.33L9.53 17.52C9.13 17.92 8.59 18.14 8.02 18.14C7.45 18.14 6.91 17.92 6.51 17.52C6.11 17.12 5.89 16.58 5.89 16.01C5.89 15.44 6.11 14.9 6.51 14.5L15.19 5.82"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const MoreIcon = ({ color = "#8E8E93", size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="1" fill={color} />
    <Circle cx="12" cy="5" r="1" fill={color} />
    <Circle cx="12" cy="19" r="1" fill={color} />
  </Svg>
);

const MicIcon = ({ color = "#8E8E93", size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 1C10.34 1 9 2.34 9 4V12C9 13.66 10.34 15 12 15S15 13.66 15 12V4C15 2.34 13.66 1 12 1Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M19 10V12C19 16.42 15.42 20 11 20H13C17.42 20 21 16.42 21 12V10"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 20V23"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M8 23H16"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ChatScreen = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const navigation = useNavigation();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const typingAnim = useRef(new Animated.Value(0)).current;

  const ADMIN_ID = "685e2fea79bd687050637953";

  // Pulse animation for online indicator
  useEffect(() => {
    if (isOnline) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isOnline]);

  // Typing indicator animation
  useEffect(() => {
    if (isTyping) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(typingAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(typingAnim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      typingAnim.setValue(0);
    }
  }, [isTyping]);

  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
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
      
      // Simulate typing indicator
      if (msg.senderId !== userId) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 1000);
      }
    });

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
      message: "",
    };

    try {
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
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Gửi ảnh',
      'Chọn cách bạn muốn gửi ảnh',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Thư viện', onPress: () => pickImage() },
        { text: 'Chụp ảnh', onPress: () => takePhoto() },
      ]
    );
  };

  const renderMessage = ({ item, index }: { item: any; index: number }) => {
    const sender = item.senderId?._id || item.senderId;
    const isMyMessage = sender === userId;

    const time = item.timestamp || item.createdAt || new Date();
    const formattedTime = time
      ? new Date(time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      : '';

    // Show time separator for first message or messages with significant time gap
    const showTime = index === 0 || 
      (messages[index - 1] && 
       new Date(time).getTime() - new Date(messages[index - 1].timestamp || messages[index - 1].createdAt).getTime() > 300000); // 5 minutes

    return (
      <View>
        {showTime && (
          <View style={styles.timeSeparator}>
            <Text style={styles.timeSeparatorText}>
              {new Date(time).toLocaleDateString('vi-VN', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </View>
        )}
        
        <Animated.View
          style={[
            styles.messageContainer,
            isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer,
          ]}
        >
          <Pressable
            style={[
              styles.messageBubble,
              isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble,
            ]}
            onLongPress={() => {
              // Add haptic feedback or context menu here
            }}
          >
            {item.imageUrl ? (
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.messageImage}
                  resizeMode="cover"
                />
                <View style={styles.imageOverlay}>
                  <Text style={styles.imageTime}>{formattedTime}</Text>
                </View>
              </View>
            ) : (
              <>
                <Text
                  style={[
                    styles.messageText,
                    isMyMessage ? styles.myMessageText : styles.otherMessageText,
                  ]}
                >
                  {item.message}
                </Text>
                <Text
                  style={[
                    styles.timestamp,
                    isMyMessage ? styles.myTimestamp : styles.otherTimestamp,
                  ]}
                >
                  {formattedTime}
                </Text>
              </>
            )}
          </Pressable>
        </Animated.View>
      </View>
    );
  };

  const renderTypingIndicator = () => {
    if (!isTyping) return null;

    return (
      <View style={[styles.messageContainer, styles.otherMessageContainer]}>
        <View style={[styles.messageBubble, styles.otherMessageBubble, styles.typingBubble]}>
          <Animated.View style={[styles.typingDots, { opacity: typingAnim }]}>
            <View style={styles.dot} />
            <View style={[styles.dot, { marginLeft: 4 }]} />
            <View style={[styles.dot, { marginLeft: 4 }]} />
          </Animated.View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Modern Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <BackIcon color="#007AFF" size={24} />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>🧁</Text>
              </View>
              <Animated.View 
                style={[
                  styles.onlineIndicator, 
                  { 
                    backgroundColor: isOnline ? '#34C759' : '#8E8E93',
                    transform: [{ scale: pulseAnim }]
                  }
                ]} 
              />
            </View>
            
            <View style={styles.shopInfo}>
              <Text style={styles.headerTitle}>Cake Shop</Text>
              <Text style={styles.statusText}>
                {isOnline ? 'Đang hoạt động' : 'Offline'} • Phản hồi nhanh
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.moreButton} activeOpacity={0.7}>
            <MoreIcon color="#007AFF" size={20} />
          </TouchableOpacity>
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
          ListFooterComponent={renderTypingIndicator}
        />

        {/* Modern Input Container */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TouchableOpacity
              style={styles.attachButton}
              onPress={showImageOptions}
              activeOpacity={0.7}
            >
              <AttachIcon color="#8E8E93" size={20} />
            </TouchableOpacity>
            
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Aa"
              placeholderTextColor="#8E8E93"
              style={styles.textInput}
              multiline
              maxLength={500}
              returnKeyType="send"
              blurOnSubmit={false}
            />
            
            <TouchableOpacity
              style={[
                styles.sendButton,
                message.trim() ? styles.sendButtonActive : styles.sendButtonInactive
              ]}
              onPress={sendMessage}
              disabled={!message.trim()}
              activeOpacity={0.8}
            >
              {message.trim() ? (
                <SendIcon color="#FFFFFF" size={20} />
              ) : (
                <MicIcon color="#8E8E93" size={20} />
              )}
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
    backgroundColor: '#F2F2F7',
  },
  
  // Modern Header
  header: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5EA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  
  backIcon: {
    color: '#007AFF',
    fontSize: 18,
    fontWeight: '600',
  },
  
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#195eddff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ec0505ff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  
  avatarText: {
    fontSize: 20,
  },
  
  onlineIndicator: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  
  shopInfo: {
    flex: 1,
  },
  
  headerTitle: {
    color: '#1C1C1E',
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 2,
  },
  
  statusText: {
    color: '#8E8E93',
    fontSize: 13,
    fontWeight: '400',
  },
  
  moreButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  moreIcon: {
    color: '#8E8E93',
    fontSize: 20,
    fontWeight: '600',
  },
  
  // Messages
  messagesList: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  
  messagesContainer: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },

  timeSeparator: {
    alignItems: 'center',
    marginVertical: 16,
  },

  timeSeparatorText: {
    color: '#8E8E93',
    fontSize: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  
  messageContainer: {
    marginVertical: 2,
    marginBottom: 8,
  },
  
  myMessageContainer: {
    alignItems: 'flex-end',
  },
  
  otherMessageContainer: {
    alignItems: 'flex-start',
  },
  
  messageBubble: {
    maxWidth: width * 0.75,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  
  myMessageBubble: {
    backgroundColor: '#503419ff',
    borderBottomRightRadius: 6,
  },
  
  otherMessageBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 6,
  },

  typingBubble: {
    paddingVertical: 12,
  },

  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8E8E93',
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
    color: '#1C1C1E',
  },

  imageContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },

  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
  },

  imageOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },

  imageTime: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '500',
  },
  
  timestamp: {
    fontSize: 11,
    fontWeight: '400',
    marginTop: 2,
  },
  
  myTimestamp: {
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'right',
  },
  
  otherTimestamp: {
    color: '#8E8E93',
    textAlign: 'left',
  },
  
  // Modern Input
  inputContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    borderTopWidth: 0.5,
    borderTopColor: '#E5E5EA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F2F2F7',
    borderRadius: 24,
    paddingHorizontal: 4,
    paddingVertical: 4,
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  
  attachButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  
  attachIcon: {
    fontSize: 18,
    transform: [{ rotate: '45deg' }],
  },
  
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1C1C1E',
    maxHeight: 100,
    paddingVertical: 10,
    paddingHorizontal: 4,
    textAlignVertical: 'center',
  },
  
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },

  sendButtonActive: {
    backgroundColor: '#503419ff',
    shadowColor: '#503419ff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },

  sendButtonInactive: {
    backgroundColor: 'transparent',
  },
  
  sendIcon: {
    fontSize: 18,
  },
});

export default ChatScreen;