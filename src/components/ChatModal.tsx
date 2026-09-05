import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors, BorderRadius, Shadows, Spacing } from '../constants/theme';
import { ChatMessage } from '../types';

interface ChatModalProps {
  visible: boolean;
  recipientType: 'CUSTOMER' | 'VENDOR';
  recipientName: string;
  orderNumber: string;
  messages: ChatMessage[];
  onClose: () => void;
  onSendMessage: (text: string, recipient: 'CUSTOMER' | 'VENDOR') => void;
}

const QUICK_REPLIES = {
  CUSTOMER: [
    'I have arrived outside your location.',
    'Waiting at the main gate.',
    'On my way! 3 minutes away.',
    'Please come down with exact cash.',
  ],
  VENDOR: [
    'I have reached the restaurant counter.',
    'Is Order ready for pickup?',
    'Please hand over the drink carrier.',
    'Checking all items in package.',
  ],
};

export const ChatModal: React.FC<ChatModalProps> = ({
  visible,
  recipientType,
  recipientName,
  orderNumber,
  messages,
  onClose,
  onSendMessage,
}) => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const theme = Colors[isDark ? 'dark' : 'light'];

  const [inputMessage, setInputMessage] = useState('');

  const quickOptions = QUICK_REPLIES[recipientType];

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;
    onSendMessage(text, recipientType);
    setInputMessage('');
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View
          style={[
            styles.container,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
              ...Shadows.lg,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View
                style={[
                  styles.avatarCircle,
                  {
                    backgroundColor:
                      recipientType === 'CUSTOMER' ? theme.secondary : theme.primary,
                  },
                ]}
              >
                <Ionicons
                  name={recipientType === 'CUSTOMER' ? 'person' : 'restaurant'}
                  size={16}
                  color="#FFFFFF"
                />
              </View>
              <View>
                <Text style={[styles.headerTitle, { color: theme.text }]}>
                  {recipientName} ({recipientType === 'CUSTOMER' ? 'Customer' : 'Shop'})
                </Text>
                <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
                  Order #{orderNumber}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: theme.backgroundElement }]}
              onPress={onClose}
            >
              <Ionicons name="close" size={20} color={theme.text} />
            </TouchableOpacity>
          </View>

          {/* Chat Messages */}
          <ScrollView
            contentContainerStyle={styles.messagesContainer}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((msg) => {
              const isMe = msg.senderType === 'RIDER';
              return (
                <View
                  key={msg.id}
                  style={[
                    styles.messageRow,
                    isMe ? styles.myMessageRow : styles.theirMessageRow,
                  ]}
                >
                  <View
                    style={[
                      styles.messageBubble,
                      isMe
                        ? [styles.myBubble, { backgroundColor: theme.primary }]
                        : [
                            styles.theirBubble,
                            {
                              backgroundColor: isDark ? '#1F293D' : '#F1F5F9',
                              borderColor: theme.border,
                            },
                          ],
                    ]}
                  >
                    {!isMe && (
                      <Text
                        style={[
                          styles.senderLabel,
                          {
                            color:
                              msg.senderType === 'CUSTOMER'
                                ? theme.secondary
                                : theme.primary,
                          },
                        ]}
                      >
                        {msg.senderName}
                      </Text>
                    )}
                    <Text
                      style={[
                        styles.messageText,
                        { color: isMe ? '#FFFFFF' : theme.text },
                      ]}
                    >
                      {msg.message}
                    </Text>
                    <Text
                      style={[
                        styles.timestampText,
                        {
                          color: isMe ? 'rgba(255,255,255,0.7)' : theme.textMuted,
                        },
                      ]}
                    >
                      {msg.timestamp}
                    </Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {/* Quick Replies Chips */}
          <View style={styles.quickRepliesWrapper}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickRepliesScroll}
            >
              {quickOptions.map((reply, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.quickReplyChip,
                    { backgroundColor: theme.backgroundElement, borderColor: theme.border },
                  ]}
                  onPress={() => handleSend(reply)}
                >
                  <Text style={[styles.quickReplyText, { color: theme.text }]}>
                    {reply}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Input Bar */}
          <View
            style={[
              styles.inputBar,
              { borderTopColor: theme.border, backgroundColor: theme.card },
            ]}
          >
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: theme.backgroundElement,
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
              placeholder={`Message ${recipientType.toLowerCase()}...`}
              placeholderTextColor={theme.textMuted}
              value={inputMessage}
              onChangeText={setInputMessage}
              onSubmitEditing={() => handleSend()}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                {
                  backgroundColor: inputMessage.trim()
                    ? theme.primary
                    : theme.backgroundElement,
                },
              ]}
              disabled={!inputMessage.trim()}
              onPress={() => handleSend()}
            >
              <Ionicons
                name="send"
                size={18}
                color={inputMessage.trim() ? '#FFFFFF' : theme.textMuted}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    borderTopWidth: 1,
    height: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.three,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '600',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesContainer: {
    padding: Spacing.three,
    gap: 10,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  myMessageRow: {
    justifyContent: 'flex-end',
  },
  theirMessageRow: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: BorderRadius.lg,
  },
  myBubble: {
    borderBottomRightRadius: 2,
  },
  theirBubble: {
    borderBottomLeftRadius: 2,
    borderWidth: 1,
  },
  senderLabel: {
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '500',
  },
  timestampText: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  quickRepliesWrapper: {
    paddingVertical: 6,
  },
  quickRepliesScroll: {
    paddingHorizontal: Spacing.three,
    gap: 8,
  },
  quickReplyChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  quickReplyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderTopWidth: 1,
    gap: 8,
  },
  textInput: {
    flex: 1,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
