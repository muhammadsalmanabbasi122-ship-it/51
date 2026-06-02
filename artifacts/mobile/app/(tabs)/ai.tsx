import { Feather } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/contexts/AuthContext";
import type { Message } from "@/lib/chatHistory";
import { getSessions, saveSession, deleteSession } from "@/lib/chatHistory";
import type { AIChatSession } from "@/lib/chatHistory";


function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return `${Math.floor(days / 7)}w`;
}

export default function AIScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [streamedText, setStreamedText] = useState("");
  const typeRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [sessions, setSessions] = useState<AIChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const flatListRef = useRef<ScrollView>(null);
  const styles = makeStyles(colors);

  useEffect(() => {
    getSessions().then(setSessions);
    return () => { if (typeRef.current) clearInterval(typeRef.current); };
  }, []);

  useEffect(() => {
    if (!currentSessionId || messages.length === 0) return;
    const timer = setTimeout(() => {
      const title = messages.find((m) => m.role === "user")?.text.slice(0, 50) || "New Chat";
      const session: AIChatSession = {
        id: currentSessionId,
        title,
        messages,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      saveSession(session).then(() => getSessions().then(setSessions));
    }, 500);
    return () => clearTimeout(timer);
  }, [messages, currentSessionId]);

  const startNewChat = useCallback(() => {
    setCurrentSessionId(null);
    setMessages([]);
    setInput("");
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const loadSession = useCallback((session: AIChatSession) => {
    setCurrentSessionId(session.id);
    setMessages(session.messages);
    setInput("");
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const deleteChat = useCallback(async (id: string) => {
    await deleteSession(id);
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (currentSessionId === id) {
      setCurrentSessionId(null);
      setMessages([]);
    }
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [currentSessionId]);

  const startTyping = useCallback((html: string, msgId: string) => {
    setStreamingId(msgId);
    setStreamedText("");
    let idx = 0;
    const charsPerTick = 5;
    typeRef.current = setInterval(() => {
      idx += charsPerTick;
      if (idx >= html.length) {
        setStreamedText(html);
        setStreamingId(null);
        if (typeRef.current) clearInterval(typeRef.current);
      } else {
        setStreamedText(html.slice(0, idx));
      }
    }, 30);
  }, []);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || streamingId) return;

    const sessionId = currentSessionId || Date.now().toString();
    if (!currentSessionId) setCurrentSessionId(sessionId);

    const userMsg: Message = { id: Date.now().toString(), role: "user", text: trimmed, timestamp: new Date() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const assistId = (Date.now() + 1).toString();
    const placeholder: Message = {
      id: assistId, role: "assistant", text: "", timestamp: new Date(),
    };
    setMessages((prev) => [...prev, placeholder]);
    setGeneratingId(assistId);

    try {
      const domain = process.env.EXPO_PUBLIC_DOMAIN;
      const baseUrl = domain ? `https://${domain}` : "";
      const res = await fetch(`${baseUrl}/api/ai/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: trimmed, username: user?.username }),
      });
      const data = (await res.json()) as { html: string; title: string };
      const fullHtml = data.html;
      const finalMsg: Message = {
        id: assistId, role: "assistant", text: "",
        html: fullHtml, timestamp: new Date(),
      };
      setGeneratingId(null);
      setMessages((prev) => prev.map((m) => (m.id === assistId ? finalMsg : m)));
      startTyping(fullHtml, assistId);
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      setGeneratingId(null);
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== assistId),
        { id: assistId, role: "assistant", text: "Something went wrong. Please try again.", timestamp: new Date() },
      ]);
    }
  };

  const copyHtml = async (html: string, id: string) => {
    await Clipboard.setStringAsync(html);
    setCopiedId(id);
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === "user";
    const isStreaming = streamingId === item.id && !isUser;
    const isGeneratingThis = generatingId === item.id && !isUser;
    const displayHtml = isStreaming ? streamedText : item.html;
    if (!isUser) {
      return (
        <Animated.View entering={FadeInDown.duration(300)} style={styles.msgRowAssistant}>
          <View style={styles.bubbleFull}>
            {isGeneratingThis ? (
              <View style={[styles.codeBoxFull, styles.generatingBox]}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.generatingText}>Generating HTML...</Text>
              </View>
            ) : displayHtml ? (
              <View style={styles.codeBoxFull}>
                <ScrollView
                  showsVerticalScrollIndicator
                  style={styles.codeScrollV}
                >
                  <Text style={styles.codeText}>{displayHtml}</Text>
                </ScrollView>
                {isStreaming && <View style={styles.cursor} />}
                {!isStreaming && (
                  <Pressable
                    style={({ pressed }) => [styles.copyBtnFull, pressed && { opacity: 0.75 }]}
                    onPress={() => copyHtml(item.html!, item.id)}
                  >
                    <Feather
                      name={copiedId === item.id ? "check" : "copy"}
                      size={14}
                      color={copiedId === item.id ? colors.success : colors.primary}
                    />
                    <Text style={[styles.copyBtnText, copiedId === item.id && { color: colors.success }]}>
                      {copiedId === item.id ? "Copied!" : "Copy HTML"}
                    </Text>
                  </Pressable>
                )}
              </View>
            ) : (
              <View style={styles.codeBoxFull}>
                <View style={styles.cursor} />
              </View>
            )}
          </View>
        </Animated.View>
      );
    }
    return (
      <Animated.View entering={FadeInDown.duration(300)} style={[styles.msgRow, styles.msgRowUser]}>
        <View style={[styles.bubble, styles.bubbleUser]}>
          <Text style={[styles.bubbleText, styles.bubbleTextUser]}>{item.text}</Text>
        </View>
        <View style={styles.userAvatar}>
          <Text style={styles.userAvatarText}>
            {user?.username?.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) ?? "U"}
          </Text>
        </View>
      </Animated.View>
    );
  };

  const renderHistoryItem = ({ item }: { item: AIChatSession }) => (
    <Pressable
      style={({ pressed }) => [styles.historyItem, pressed && { opacity: 0.7 }]}
      onPress={() => loadSession(item)}
    >
      <View style={styles.historyItemLeft}>
        <View style={styles.historyIcon}>
          <Feather name="message-square" size={14} color={colors.primary} />
        </View>
        <View style={styles.historyInfo}>
          <Text style={styles.historyTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.historyMeta}>{timeAgo(item.updatedAt)} · {item.messages.length} messages</Text>
        </View>
      </View>
      <Pressable
        hitSlop={8}
        onPress={() => deleteChat(item.id)}
        style={({ pressed }) => [styles.historyDelete, pressed && { opacity: 0.5 }]}
      >
        <Feather name="trash-2" size={14} color={colors.mutedForeground} />
      </Pressable>
    </Pressable>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { paddingTop: Platform.OS === "web" ? insets.top + 67 : insets.top + 16 }]}>
        <View style={styles.headerIconWrap}>
          <Feather name="cpu" size={18} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>AI Generator</Text>
          <Text style={styles.headerSub}>Describe any web page</Text>
        </View>
        <Pressable
          style={({ pressed }) => [styles.newChatBtn, pressed && { opacity: 0.7 }]}
          onPress={startNewChat}
        >
          <Feather name="plus" size={18} color={colors.primary} />
        </Pressable>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}>
        {messages.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Feather name="code" size={30} color={colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>Start with a prompt</Text>
            <Text style={styles.emptySub}>Describe any website and get HTML instantly</Text>
            <View style={styles.exampleLines}>
              <Text style={styles.exampleLine}>"A landing page for a bakery"</Text>
              <Text style={styles.exampleLine}>"Portfolio for a web developer"</Text>
            </View>
            {sessions.length > 0 && (
              <View style={styles.historySection}>
                <View style={styles.historyHeader}>
                  <Feather name="clock" size={14} color={colors.mutedForeground} />
                  <Text style={styles.historyHeaderText}>Recent chats</Text>
                </View>
                <FlatList
                  data={sessions}
                  keyExtractor={(s) => s.id}
                  renderItem={renderHistoryItem}
                  scrollEnabled={false}
                  showsVerticalScrollIndicator={false}
                />
              </View>
            )}
          </View>
        ) : (
          <ScrollView
            ref={flatListRef}
            contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + 110 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          >
            {messages.map((m, i) => (
              <View key={m.id} style={i === messages.length - 1 && m.role === "assistant" ? { flex: 1 } : undefined}>
                {renderMessage({ item: m })}
              </View>
            ))}
          </ScrollView>
        )}

        <View style={[styles.inputContainer, { paddingBottom: Platform.OS === "web" ? 84 : insets.bottom + 8 }]}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              placeholder="Describe any web page..."
              placeholderTextColor={colors.mutedForeground}
              value={input}
              onChangeText={setInput}
              multiline
              maxLength={500}
              returnKeyType="send"
              onSubmitEditing={() => sendMessage(input)}
            />
            <Pressable
              style={({ pressed }) => [
                styles.sendBtn,
                (!input.trim() || streamingId) && styles.sendBtnDisabled,
                pressed && input.trim() && !streamingId && { opacity: 0.8 },
              ]}
              onPress={() => sendMessage(input)}
              disabled={!input.trim() || !!streamingId}
            >
              <View style={[styles.sendBtnInner, input.trim() && !streamingId ? styles.sendBtnActive : styles.sendBtnInactive]}>
                <Feather name="send" size={18} color={input.trim() && !streamingId ? "white" : colors.mutedForeground} />
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
      flexDirection: "row", alignItems: "center", gap: 12,
      paddingHorizontal: 20, paddingBottom: 14,
      borderBottomWidth: 1, borderBottomColor: colors.border,
      backgroundColor: colors.background,
    },
    headerIconWrap: {
      width: 40, height: 40, borderRadius: 12,
      backgroundColor: colors.primary + "20",
      alignItems: "center", justifyContent: "center",
      borderWidth: 1, borderColor: colors.primary + "35",
    },
    headerTitle: { fontSize: 17, fontWeight: "700" as const, color: colors.foreground },
    headerSub: { fontSize: 12, color: colors.mutedForeground, marginTop: 1 },
    newChatBtn: {
      width: 36, height: 36, borderRadius: 10,
      backgroundColor: colors.primary + "15",
      alignItems: "center", justifyContent: "center",
      borderWidth: 1, borderColor: colors.primary + "25",
    },
    emptyState: { flex: 1, paddingHorizontal: 24, paddingBottom: 80 },
    emptyIcon: {
      width: 72, height: 72, borderRadius: 20,
      backgroundColor: colors.primary + "18",
      borderWidth: 1, borderColor: colors.primary + "30",
      alignItems: "center", justifyContent: "center", marginBottom: 16,
      alignSelf: "center", marginTop: 40,
    },
    emptyTitle: { fontSize: 20, fontWeight: "700" as const, color: colors.foreground, marginBottom: 8, textAlign: "center" },
    emptySub: { fontSize: 14, color: colors.mutedForeground, textAlign: "center", marginBottom: 28, lineHeight: 20 },
    exampleLines: { alignItems: "center", marginBottom: 24 },
    exampleLine: { fontSize: 13, color: colors.mutedForeground, fontStyle: "italic", marginBottom: 4 },
    historySection: { marginTop: 8 },
    historyHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 },
    historyHeaderText: { fontSize: 13, fontWeight: "600" as const, color: colors.mutedForeground },
    historyItem: {
      flexDirection: "row", alignItems: "center", justifyContent: "space-between",
      backgroundColor: colors.card, borderRadius: 12, padding: 14, marginBottom: 8,
      borderWidth: 1, borderColor: colors.border,
    },
    historyItemLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
    historyIcon: {
      width: 32, height: 32, borderRadius: 8,
      backgroundColor: colors.primary + "15",
      alignItems: "center", justifyContent: "center",
    },
    historyInfo: { flex: 1 },
    historyTitle: { fontSize: 14, fontWeight: "600" as const, color: colors.foreground, marginBottom: 2 },
    historyMeta: { fontSize: 11, color: colors.mutedForeground },
    historyDelete: { padding: 4, marginLeft: 8 },
    msgRow: { flexDirection: "row", alignItems: "flex-end", gap: 8, marginBottom: 12 },
    msgRowUser: { justifyContent: "flex-end" },
    msgRowAssistant: { flex: 1, marginBottom: 12 },
    bubbleFull: { flex: 1, borderRadius: 16, overflow: "hidden" },
    botAvatar: {
      width: 30, height: 30, borderRadius: 10,
      backgroundColor: colors.primary + "20", borderWidth: 1, borderColor: colors.primary + "30",
      alignItems: "center", justifyContent: "center", flexShrink: 0,
    },
    userAvatar: {
      width: 30, height: 30, borderRadius: 10,
      backgroundColor: colors.primary,
      alignItems: "center", justifyContent: "center", flexShrink: 0,
    },
    userAvatarText: { color: "white", fontSize: 11, fontWeight: "700" as const },
    bubble: { borderRadius: 16, padding: 14 },
    bubbleUser: { backgroundColor: colors.primary, borderBottomRightRadius: 4, maxWidth: "75%" },
    bubbleText: { fontSize: 14, color: colors.foreground, lineHeight: 20 },
    bubbleTextUser: { color: "white" },
    codeBoxFull: {
      flex: 1, backgroundColor: colors.background, padding: 12,
      borderWidth: 1, borderColor: colors.border, borderRadius: 16,
    },
    codeScrollV: { flex: 1 },
    codeText: {
      fontFamily: Platform.OS === "ios" ? "Menlo" : Platform.OS === "android" ? "monospace" : "Courier New",
      fontSize: 12, color: colors.foreground, lineHeight: 18,
    },
    generatingBox: {
      flexDirection: "row", alignItems: "center", gap: 10, minHeight: 48,
    },
    generatingText: {
      color: colors.primary, fontSize: 13, fontFamily: "Inter_400Regular", opacity: 0.85,
    },
    cursor: {
      width: 8, height: 16, backgroundColor: colors.primary, borderRadius: 2,
      marginTop: 6,
    },
    copyBtnFull: {
      flexDirection: "row", alignItems: "center", gap: 6, marginTop: 12,
      backgroundColor: colors.primary + "18", borderRadius: 10,
      paddingHorizontal: 14, paddingVertical: 10, alignSelf: "flex-start",
      borderWidth: 1, borderColor: colors.primary + "30",
    },
    copyBtnText: { fontSize: 13, color: colors.primary, fontFamily: "Inter_600SemiBold" },
    inputContainer: {
      backgroundColor: colors.background,
      borderTopWidth: 1, borderTopColor: colors.border,
      paddingTop: 12, paddingHorizontal: 16,
    },
    inputRow: { flexDirection: "row", alignItems: "flex-end", gap: 10 },
    textInput: {
      flex: 1, backgroundColor: colors.card, borderRadius: 20,
      paddingHorizontal: 16, paddingVertical: 12,
      fontSize: 15, color: colors.foreground,
      borderWidth: 1.5, borderColor: colors.border,
      maxHeight: 100, fontFamily: "Inter_400Regular",
    },
    sendBtn: { borderRadius: 22, overflow: "hidden" },
    sendBtnDisabled: { opacity: 0.45 },
    sendBtnInner: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
    sendBtnActive: { backgroundColor: colors.primary },
    sendBtnInactive: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  });
}
