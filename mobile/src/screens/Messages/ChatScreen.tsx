import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, typography, spacing, borders } from '../../theme';
import { ScreenHeader } from '../../components';
import { api } from '../../services/api';
import { CURRENT_USER } from '../../services/seed';
import { Conversation, Message } from '../../types';
import { StackScreenProps } from '../../navigation/types';

export const ChatScreen: React.FC<StackScreenProps<'Chat'>> = ({ navigation, route }) => {
  const { conversationId } = route.params;
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList<Message>>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { conversation: c, messages: msgs } = await api.getConversation(conversationId, CURRENT_USER.id);
      setConversation(c);
      setMessages(msgs);
    } catch {
      setConversation(null);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    load();
  }, [load]);

  const otherName = conversation
    ? conversation.memberIds.find((id) => id !== CURRENT_USER.id)
    : undefined;

  const send = async () => {
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    setDraft('');
    try {
      const msg = await api.sendMessage(conversationId, text, CURRENT_USER.id);
      setMessages((prev) => [...prev, msg]);
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Chat" onBack={() => navigation.goBack()} />
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary.main} />
        </View>
      </View>
    );
  }

  if (!conversation) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Chat" onBack={() => navigation.goBack()} />
        <View style={styles.center}>
          <Text style={styles.emptyText}>Conversation not found.</Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      <ScreenHeader
        title={otherName ? conversation.memberNames[otherName] : 'Chat'}
        subtitle={`${conversation.itemTitle} rental`}
        onBack={() => navigation.goBack()}
      />

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => {
          const mine = item.senderId === CURRENT_USER.id;
          return (
            <View style={[styles.bubbleRow, mine ? styles.bubbleRowMine : styles.bubbleRowTheirs]}>
              <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
                <Text style={[styles.bubbleText, mine && styles.bubbleTextMine]}>{item.text}</Text>
                <Text style={[styles.bubbleTime, mine && styles.bubbleTimeMine]}>
                  {new Date(item.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Feather name="send" size={26} color={colors.neutral.textMuted} />
            <Text style={styles.emptyText}>
              Chat with the {otherName && conversation.memberNames[otherName]} about pickup, timing
              and the condition of the item.
            </Text>
          </View>
        }
      />

      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          value={draft}
          onChangeText={setDraft}
          placeholder="Message…"
          placeholderTextColor={colors.neutral.textMuted}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, !draft.trim() && styles.sendButtonDisabled]}
          onPress={send}
          disabled={!draft.trim() || sending}
        >
          <Feather name="send" size={18} color={colors.primary.contrast} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.neutral.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyWrap: {
    alignItems: 'center',
    gap: spacing[3],
    paddingTop: spacing[12],
    paddingHorizontal: spacing[8],
  },
  emptyText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.body,
    color: colors.neutral.textSecondary,
    textAlign: 'center',
    lineHeight: typography.sizes.body * typography.lineHeights.normal,
  },
  list: { flex: 1 },
  listContent: { padding: spacing[4], gap: spacing[2], paddingBottom: spacing[8] },
  bubbleRow: { flexDirection: 'row', marginBottom: 2 },
  bubbleRowMine: { justifyContent: 'flex-end' },
  bubbleRowTheirs: { justifyContent: 'flex-start' },
  bubble: {
    maxWidth: '78%',
    borderRadius: borders.radius.lg,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  bubbleMine: { backgroundColor: colors.primary.main, borderBottomRightRadius: 4 },
  bubbleTheirs: {
    backgroundColor: colors.neutral.surface,
    borderWidth: borders.width.thin,
    borderColor: colors.neutral.border,
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.body,
    color: colors.neutral.textPrimary,
  },
  bubbleTextMine: { color: colors.primary.contrast },
  bubbleTime: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.caption,
    color: colors.neutral.textMuted,
    marginTop: 2,
    alignSelf: 'flex-end',
  },
  bubbleTimeMine: { color: colors.primary.contrast, opacity: 0.85 },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing[3],
    padding: spacing[3],
    paddingBottom: spacing[5],
    backgroundColor: colors.neutral.surface,
    borderTopWidth: borders.width.thin,
    borderTopColor: colors.neutral.border,
  },
  input: {
    flex: 1,
    maxHeight: 110,
    backgroundColor: colors.neutral.background,
    borderWidth: borders.width.thin,
    borderColor: colors.neutral.border,
    borderRadius: borders.radius.md,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.body,
    color: colors.neutral.textPrimary,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: { opacity: 0.4 },
});