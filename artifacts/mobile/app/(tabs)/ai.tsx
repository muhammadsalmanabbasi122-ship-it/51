import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import React, { useRef, useState } from "react";
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
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/contexts/AuthContext";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  html?: string;
  timestamp: Date;
}

const SUGGESTIONS = [
  "A landing page for a bakery",
  "Portfolio for a web developer",
  "E-commerce shop page",
  "Gym fitness studio site",
  "Restaurant menu page",
  "Travel hotel booking page",
];

export default function AIScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const styles = makeStyles(colors);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const domain = process.env.EXPO_PUBLIC_DOMAIN;
      const baseUrl = domain ? `https://${domain}` : "";
      const res = await fetch(`${baseUrl}/api/ai/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: trimmed, username: user?.username }),
      });
      const data = (await res.json()) as { html: string; title: string };
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: `Here's your **${data.title}** HTML! Tap the copy button to use it.`,
        html: data.html,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      const errMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: "Sorry, something went wrong. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
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
    return (
      <Animated.View entering={FadeInDown.duration(300)} style={[styles.msgRow, isUser && styles.msgRowUser]}>
        {!isUser && (
          <LinearGradient colors={[colors.primary, colors.accent]} style={styles.botAvatar}>
            <Feather name="cpu" size={14} color="white" />
          </LinearGradient>
        )}
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleBot]}>
          <Text style={[styles.bubbleText, isUser && styles.bubbleTextUser]}>{item.text}</Text>
          {item.html && (
            <Pressable
              style={({ pressed }) => [styles.copyBtn, pressed && { opacity: 0.75 }]}
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
        {isUser && (
          <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>
              {user?.username?.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) ?? "U"}
            </Text>
          </LinearGradient>
        )}
      </Animated.View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={[
          styles.header,
          { paddingTop: Platform.OS === "web" ? insets.top + 67 : insets.top + 16 },
        ]}
      >
        <LinearGradient colors={[colors.primary, colors.accent]} style={styles.headerIcon}>
          <Feather name="cpu" size={18} color="white" />
        </LinearGradient>
        <View>
          <Text style={styles.headerTitle}>AI Generator</Text>
          <Text style={styles.headerSub}>Describe any web page</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
        keyboardVerticalOffset={0}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyState}>
            <LinearGradient colors={[colors.primary, colors.accent]} style={styles.emptyIcon}>
              <Feather name="code" size={32} color="white" />
            </LinearGradient>
            <Text style={styles.emptyTitle}>Start with a prompt</Text>
            <Text style={styles.emptySub}>Describe any website and get HTML instantly</Text>
            <View style={styles.suggestionsGrid}>
              {SUGGESTIONS.map((s) => (
                <Pressable
                  key={s}
                  style={({ pressed }) => [styles.suggestion, pressed && { opacity: 0.75 }]}
                  onPress={() => sendMessage(s)}
                >
                  <Text style={styles.suggestionText}>{s}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(m) => m.id}
            renderItem={renderMessage}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingVertical: 16,
              paddingBottom: insets.bottom + 110,
            }}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            ListFooterComponent={
              loading ? (
                <View style={styles.typingRow}>
                  <LinearGradient colors={[colors.primary, colors.accent]} style={styles.botAvatar}>
                    <Feather name="cpu" size={14} color="white" />
                  </LinearGradient>
                  <View style={styles.typingBubble}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={styles.typingText}>Generating HTML...</Text>
                  </View>
                </View>
              ) : null
            }
          />
        )}

        <View
          style={[
            styles.inputContainer,
            { paddingBottom: Platform.OS === "ios" ? 0 : insets.bottom + 8 },
          ]}
        >
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
                (!input.trim() || loading) && styles.sendBtnDisabled,
                pressed && input.trim() && !loading && { opacity: 0.8 },
              ]}
              onPress={() => sendMessage(input)}
              disabled={!input.trim() || loading}
            >
              <LinearGradient
                colors={
                  input.trim() && !loading
                    ? [colors.primary, colors.accent]
                    : [colors.muted, colors.muted]
                }
                style={styles.sendBtnGradient}
              >
                <Feather
                  name="send"
                  size={18}
                  color={input.trim() && !loading ? "white" : colors.mutedForeground}
                />
              </LinearGradient>
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
    headerIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
    headerTitle: { fontSize: 17, fontWeight: "700" as const, color: colors.foreground },
    headerSub: { fontSize: 12, color: colors.mutedForeground, marginTop: 1 },
    emptyState: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24, paddingBottom: 80 },
    emptyIcon: { width: 72, height: 72, borderRadius: 20, alignItems: "center", justifyContent: "center", marginBottom: 16 },
    emptyTitle: { fontSize: 20, fontWeight: "700" as const, color: colors.foreground, marginBottom: 8 },
    emptySub: { fontSize: 14, color: colors.mutedForeground, textAlign: "center", marginBottom: 28, lineHeight: 20 },
    suggestionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "center" },
    suggestion: {
      backgroundColor: colors.card, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10,
      borderWidth: 1, borderColor: colors.border,
    },
    suggestionText: { fontSize: 13, color: colors.mutedForeground },
    msgRow: { flexDirection: "row", alignItems: "flex-end", gap: 8, marginBottom: 12 },
    msgRowUser: { justifyContent: "flex-end" },
    botAvatar: { width: 30, height: 30, borderRadius: 10, alignItems: "center", justifyContent: "center", flexShrink: 0 },
    userAvatar: { width: 30, height: 30, borderRadius: 10, alignItems: "center", justifyContent: "center", flexShrink: 0 },
    userAvatarText: { color: "white", fontSize: 11, fontWeight: "700" as const },
    bubble: { maxWidth: "75%", borderRadius: 16, padding: 14 },
    bubbleUser: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
    bubbleBot: { backgroundColor: colors.card, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: colors.border },
    bubbleText: { fontSize: 14, color: colors.foreground, lineHeight: 20 },
    bubbleTextUser: { color: "white" },
    copyBtn: {
      flexDirection: "row", alignItems: "center", gap: 6,
      marginTop: 10, backgroundColor: colors.secondary,
      borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
      alignSelf: "flex-start",
    },
    copyBtnText: { fontSize: 13, color: colors.primary, fontFamily: "Inter_600SemiBold" },
    typingRow: { flexDirection: "row", alignItems: "flex-end", gap: 8, marginBottom: 12 },
    typingBubble: {
      flexDirection: "row", alignItems: "center", gap: 10,
      backgroundColor: colors.card, borderRadius: 16, padding: 14,
      borderWidth: 1, borderColor: colors.border,
    },
    typingText: { fontSize: 13, color: colors.mutedForeground },
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
    sendBtn: { borderRadius: 20, overflow: "hidden" },
    sendBtnDisabled: { opacity: 0.5 },
    sendBtnGradient: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  });
}
