import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/contexts/AuthContext";

interface ChatMsg {
  id: string;
  username: string;
  text: string;
  timestamp: string;
  initials: string;
}

interface OnlineUser {
  username: string;
  initials: string;
  lastSeen: string;
}

const AVATAR_COLORS = ["#6D28D9", "#0EA5E9", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#3B82F6"];

function avatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  if (diff < 60000) return "now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
  return `${Math.floor(diff / 86400000)}d`;
}

export default function CommunityScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const styles = makeStyles(colors);

  const BASE_URL = process.env.EXPO_PUBLIC_DOMAIN ? `https://${process.env.EXPO_PUBLIC_DOMAIN}` : "";

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/chat/messages`);
      const data = (await res.json()) as ChatMsg[];
      setMessages(data);
    } catch {}
  }, [BASE_URL]);

  const fetchOnline = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/chat/online`);
      const data = (await res.json()) as OnlineUser[];
      setOnlineUsers(data);
    } catch {}
  }, [BASE_URL]);

  useEffect(() => {
    fetchMessages();
    fetchOnline();
    const interval = setInterval(() => { fetchMessages(); fetchOnline(); }, 3000);
    return () => clearInterval(interval);
  }, [fetchMessages, fetchOnline]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || sending || !user) return;
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSending(true);
    setInput("");
    try {
      await fetch(`${BASE_URL}/api/chat/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user.username, text }),
      });
      await fetchMessages();
      await fetchOnline();
    } catch {}
    setSending(false);
  };

  const renderMsg = ({ item }: { item: ChatMsg }) => {
    const isMe = item.username === user?.username;
    const color = avatarColor(item.username);
    return (
      <View style={[styles.msgRow, isMe && styles.msgRowMe]}>
        {!isMe && (
          <View style={[styles.avatar, { backgroundColor: color + "22", borderColor: color + "44", borderWidth: 1 }]}>
            <Text style={[styles.avatarText, { color }]}>{item.initials}</Text>
          </View>
        )}
        <View style={[styles.bubble, isMe && styles.bubbleMe]}>
          {!isMe && <Text style={[styles.msgUsername, { color }]}>{item.username}</Text>}
          <Text style={[styles.msgText, isMe && styles.msgTextMe]}>{item.text}</Text>
          <Text style={[styles.time, isMe && styles.timeMe]}>{timeAgo(item.timestamp)}</Text>
        </View>
        {isMe && (
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={[styles.avatarText, { color: "white" }]}>{item.initials}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { paddingTop: Platform.OS === "web" ? insets.top + 67 : insets.top + 16 }]}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIconWrap}>
            <Feather name="message-circle" size={18} color="#34D399" />
          </View>
          <Text style={styles.headerTitle}>Community</Text>
        </View>
        <View style={styles.onlineBadge}>
          <View style={styles.onlineDot} />
          <Text style={styles.onlineCount}>{onlineUsers.length} online</Text>
        </View>
      </View>

      {onlineUsers.length > 0 && (
        <View style={styles.onlineBar}>
          <FlatList
            horizontal
            data={onlineUsers}
            keyExtractor={(u) => u.username}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
            renderItem={({ item }) => {
              const c = avatarColor(item.username);
              return (
                <View style={styles.onlineUser}>
                  <View style={[styles.onlineAvatar, { backgroundColor: c + "22", borderColor: c + "44", borderWidth: 1 }]}>
                    <Text style={[styles.onlineAvatarText, { color: c }]}>{item.initials}</Text>
                  </View>
                  <Text style={styles.onlineUsername} numberOfLines={1}>{item.username.split(" ")[0]}</Text>
                </View>
              );
            }}
          />
        </View>
      )}

      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" keyboardVerticalOffset={0}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(m) => m.id}
          renderItem={renderMsg}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, paddingBottom: insets.bottom + 110 }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.emptyText}>Loading messages...</Text>
            </View>
          }
        />

        <View style={[styles.inputContainer, { paddingBottom: Platform.OS === "web" ? 84 : insets.bottom + 8 }]}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              placeholder="Say something..."
              placeholderTextColor={colors.mutedForeground}
              value={input}
              onChangeText={setInput}
              returnKeyType="send"
              onSubmitEditing={sendMessage}
              maxLength={500}
            />
            <Pressable
              style={({ pressed }) => [
                styles.sendBtn,
                (!input.trim() || sending) && styles.sendBtnDisabled,
                pressed && input.trim() && { opacity: 0.8 },
              ]}
              onPress={sendMessage}
              disabled={!input.trim() || sending}
            >
              <View style={[styles.sendBtnInner, input.trim() && !sending ? styles.sendBtnActive : styles.sendBtnInactive]}>
                {sending ? (
                  <ActivityIndicator size="small" color={colors.mutedForeground} />
                ) : (
                  <Feather name="send" size={18} color={input.trim() ? "white" : colors.mutedForeground} />
                )}
              </View>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function makeStyles(colors: ReturnType<typeof import("@/hooks/useColors").useColors>) {
  return StyleSheet.create({
    header: {
      flexDirection: "row", alignItems: "center", justifyContent: "space-between",
      paddingHorizontal: 20, paddingBottom: 14,
      borderBottomWidth: 1, borderBottomColor: colors.border,
      backgroundColor: colors.background,
    },
    headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
    headerIconWrap: {
      width: 36, height: 36, borderRadius: 10,
      backgroundColor: "#065F4622",
      borderWidth: 1, borderColor: "#34D39930",
      alignItems: "center", justifyContent: "center",
    },
    headerTitle: { fontSize: 17, fontWeight: "700" as const, color: colors.foreground },
    onlineBadge: {
      flexDirection: "row", alignItems: "center", gap: 6,
      backgroundColor: "rgba(34,197,94,0.1)", borderWidth: 1, borderColor: "rgba(34,197,94,0.2)",
      paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
    },
    onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.success },
    onlineCount: { fontSize: 12, color: colors.success, fontFamily: "Inter_600SemiBold" },
    onlineBar: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
    onlineUser: { alignItems: "center", gap: 4, width: 52 },
    onlineAvatar: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
    onlineAvatarText: { fontSize: 12, fontWeight: "700" as const },
    onlineUsername: { fontSize: 10, color: colors.mutedForeground, textAlign: "center" },
    msgRow: { flexDirection: "row", alignItems: "flex-end", gap: 8, marginBottom: 12 },
    msgRowMe: { justifyContent: "flex-end" },
    avatar: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center", flexShrink: 0 },
    avatarText: { fontSize: 11, fontWeight: "700" as const },
    bubble: {
      maxWidth: "75%", backgroundColor: colors.card,
      borderRadius: 16, borderBottomLeftRadius: 4, padding: 12,
      borderWidth: 1, borderColor: colors.border,
    },
    bubbleMe: {
      backgroundColor: colors.primary, borderBottomLeftRadius: 16,
      borderBottomRightRadius: 4, borderWidth: 0,
    },
    msgUsername: { fontSize: 12, fontFamily: "Inter_600SemiBold", marginBottom: 4 },
    msgText: { fontSize: 14, color: colors.foreground, lineHeight: 20 },
    msgTextMe: { color: "white" },
    time: { fontSize: 10, color: colors.mutedForeground, marginTop: 4, alignSelf: "flex-end" },
    timeMe: { color: "rgba(255,255,255,0.55)" },
    empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 60, gap: 12 },
    emptyText: { fontSize: 14, color: colors.mutedForeground },
    inputContainer: {
      backgroundColor: colors.background,
      borderTopWidth: 1, borderTopColor: colors.border,
      paddingTop: 12, paddingHorizontal: 16,
    },
    inputRow: { flexDirection: "row", alignItems: "center", gap: 10 },
    textInput: {
      flex: 1, backgroundColor: colors.card, borderRadius: 24,
      paddingHorizontal: 16, paddingVertical: 12,
      fontSize: 15, color: colors.foreground,
      borderWidth: 1.5, borderColor: colors.border,
      fontFamily: "Inter_400Regular",
    },
    sendBtn: { borderRadius: 22, overflow: "hidden" },
    sendBtnDisabled: { opacity: 0.45 },
    sendBtnInner: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
    sendBtnActive: { backgroundColor: colors.primary },
    sendBtnInactive: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  });
}
