import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Linking from "expo-linking";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { getApiKey, saveApiKey, clearApiKey } from "@/lib/apiKey";

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const styles = makeStyles(colors, insets);

  const [key, setKey] = useState("");
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getApiKey().then((k) => {
      setSavedKey(k);
      if (k) setKey(k);
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    if (!key.trim()) return;
    setSaving(true);
    await saveApiKey(key.trim());
    setSavedKey(key.trim());
    setSaving(false);
    setSaved(true);
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleClear = async () => {
    await clearApiKey();
    setSavedKey(null);
    setKey("");
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const maskedKey = savedKey
    ? savedKey.slice(0, 8) + "•".repeat(Math.max(0, savedKey.length - 12)) + savedKey.slice(-4)
    : null;

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={FadeInDown.duration(350)}>
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Feather name="settings" size={22} color={colors.primary} />
            </View>
            <Text style={styles.title}>Settings</Text>
            <Text style={styles.subtitle}>Configure your AI settings</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Feather name="key" size={16} color={colors.primary} />
              <Text style={styles.cardTitle}>OpenRouter API Key</Text>
            </View>
            <Text style={styles.cardDesc}>
              Enter your OpenRouter API key to enable AI generation. Your key is stored only on this device.
            </Text>

            {savedKey && (
              <View style={styles.savedBadge}>
                <Feather name="check-circle" size={14} color={colors.success} />
                <Text style={styles.savedBadgeText}>Key saved: {maskedKey}</Text>
                <Pressable onPress={handleClear} style={styles.clearBtn}>
                  <Feather name="x" size={14} color={colors.mutedForeground} />
                </Pressable>
              </View>
            )}

            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="sk-or-v1-..."
                placeholderTextColor={colors.mutedForeground}
                value={key}
                onChangeText={setKey}
                secureTextEntry={!showKey}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="off"
              />
              <Pressable
                onPress={() => setShowKey((v) => !v)}
                style={styles.eyeBtn}
              >
                <Feather
                  name={showKey ? "eye-off" : "eye"}
                  size={18}
                  color={colors.mutedForeground}
                />
              </Pressable>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.saveBtn,
                (!key.trim() || saving) && styles.saveBtnDisabled,
                pressed && key.trim() && !saving && { opacity: 0.8 },
              ]}
              onPress={handleSave}
              disabled={!key.trim() || saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="white" />
              ) : saved ? (
                <>
                  <Feather name="check" size={16} color="white" />
                  <Text style={styles.saveBtnText}>Saved!</Text>
                </>
              ) : (
                <>
                  <Feather name="save" size={16} color="white" />
                  <Text style={styles.saveBtnText}>Save Key</Text>
                </>
              )}
            </Pressable>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Feather name="help-circle" size={16} color={colors.primary} />
              <Text style={styles.cardTitle}>Where to Get an API Key?</Text>
            </View>
            <Text style={styles.cardDesc}>
              Create a free API key at openrouter.ai — sign up, then go to the Keys section to generate a new key.
            </Text>
            <Pressable
              style={({ pressed }) => [styles.linkBtn, pressed && { opacity: 0.7 }]}
              onPress={() => Linking.openURL("https://openrouter.ai/keys")}
            >
              <Feather name="external-link" size={14} color={colors.primary} />
              <Text style={styles.linkBtnText}>Open openrouter.ai/keys</Text>
            </Pressable>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Feather name="cpu" size={16} color={colors.primary} />
              <Text style={styles.cardTitle}>AI Model</Text>
            </View>
            <View style={styles.modelBadge}>
              <Text style={styles.modelName}>moonshotai/kimi-k2</Text>
              <View style={styles.modelActiveDot} />
              <Text style={styles.modelStatus}>Active</Text>
            </View>
            <Text style={styles.cardDesc}>
              Kimi K2 is a powerful model that generates beautiful, production-ready HTML/CSS pages.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function makeStyles(colors: ReturnType<typeof import("@/hooks/useColors").useColors>, insets: { top: number; bottom: number }) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: 16, paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 },
    header: { alignItems: "center", marginBottom: 24, paddingTop: 8 },
    headerIcon: {
      width: 56, height: 56, borderRadius: 18,
      backgroundColor: colors.primary + "18",
      alignItems: "center", justifyContent: "center",
      marginBottom: 12, borderWidth: 1, borderColor: colors.primary + "30",
    },
    title: { fontSize: 24, fontFamily: "Inter_700Bold", color: colors.foreground, marginBottom: 4 },
    subtitle: { fontSize: 14, color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
    card: {
      backgroundColor: colors.card, borderRadius: 20,
      padding: 18, marginBottom: 14,
      borderWidth: 1, borderColor: colors.border,
    },
    cardHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
    cardTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: colors.foreground },
    cardDesc: { fontSize: 13, color: colors.mutedForeground, fontFamily: "Inter_400Regular", lineHeight: 20, marginBottom: 14 },
    savedBadge: {
      flexDirection: "row", alignItems: "center", gap: 6,
      backgroundColor: colors.success + "15", borderRadius: 10,
      paddingHorizontal: 12, paddingVertical: 8, marginBottom: 12,
      borderWidth: 1, borderColor: colors.success + "30",
    },
    savedBadgeText: { flex: 1, fontSize: 12, color: colors.success, fontFamily: "Inter_500Medium" },
    clearBtn: { padding: 2 },
    inputRow: {
      flexDirection: "row", alignItems: "center",
      backgroundColor: colors.background, borderRadius: 12,
      borderWidth: 1.5, borderColor: colors.border, marginBottom: 12,
      overflow: "hidden",
    },
    input: {
      flex: 1, paddingHorizontal: 14, paddingVertical: 12,
      fontSize: 14, color: colors.foreground, fontFamily: "Inter_400Regular",
    },
    eyeBtn: { padding: 12 },
    saveBtn: {
      flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
      backgroundColor: colors.primary, borderRadius: 12,
      paddingVertical: 13, paddingHorizontal: 20,
    },
    saveBtnDisabled: { opacity: 0.45 },
    saveBtnText: { color: "white", fontSize: 15, fontFamily: "Inter_600SemiBold" },
    linkBtn: {
      flexDirection: "row", alignItems: "center", gap: 6,
      backgroundColor: colors.primary + "15", borderRadius: 10,
      paddingHorizontal: 14, paddingVertical: 10, alignSelf: "flex-start",
      borderWidth: 1, borderColor: colors.primary + "30",
    },
    linkBtnText: { fontSize: 13, color: colors.primary, fontFamily: "Inter_500Medium" },
    modelBadge: {
      flexDirection: "row", alignItems: "center", gap: 8,
      backgroundColor: colors.background, borderRadius: 10,
      paddingHorizontal: 12, paddingVertical: 10, marginBottom: 10,
      borderWidth: 1, borderColor: colors.border,
    },
    modelName: { flex: 1, fontSize: 13, color: colors.foreground, fontFamily: "Inter_500Medium" },
    modelActiveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.success },
    modelStatus: { fontSize: 12, color: colors.success, fontFamily: "Inter_500Medium" },
  });
}
