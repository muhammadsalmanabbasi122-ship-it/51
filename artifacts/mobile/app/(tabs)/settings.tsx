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

  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [inputKey, setInputKey] = useState("");
  const [editing, setEditing] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getApiKey().then((k) => {
      setSavedKey(k);
      setLoading(false);
    });
  }, []);

  const maskedKey = savedKey
    ? savedKey.slice(0, 8) + "•".repeat(Math.max(0, savedKey.length - 12)) + savedKey.slice(-4)
    : null;

  const handleSave = async () => {
    if (!inputKey.trim()) return;
    setSaving(true);
    await saveApiKey(inputKey.trim());
    setSavedKey(inputKey.trim());
    setEditing(false);
    setInputKey("");
    setShowKey(false);
    setSaving(false);
    setSaved(true);
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleEdit = () => {
    setInputKey(savedKey ?? "");
    setEditing(true);
    setShowKey(false);
  };

  const handleRemove = async () => {
    await clearApiKey();
    setSavedKey(null);
    setInputKey("");
    setEditing(false);
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleCancel = () => {
    setEditing(false);
    setInputKey("");
    setShowKey(false);
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Animated.View entering={FadeInDown.duration(350)}>

          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Feather name="settings" size={22} color={colors.primary} />
            </View>
            <Text style={styles.title}>Settings</Text>
            <Text style={styles.subtitle}>Configure your AI settings</Text>
          </View>

          {/* API Key Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Feather name="key" size={16} color={colors.primary} />
              <Text style={styles.cardTitle}>OpenRouter API Key</Text>
              {saved && (
                <View style={styles.savedPill}>
                  <Feather name="check" size={11} color={colors.success} />
                  <Text style={styles.savedPillText}>Saved</Text>
                </View>
              )}
            </View>
            <Text style={styles.cardDesc}>
              Your key is stored only on this device and never shared.
            </Text>

            {/* ── Key saved & not editing ── */}
            {savedKey && !editing && (
              <>
                <View style={styles.keyRow}>
                  <Feather name="check-circle" size={15} color={colors.success} />
                  <Text style={styles.maskedKey} numberOfLines={1}>{maskedKey}</Text>
                </View>

                <View style={styles.actionRow}>
                  <Pressable
                    style={({ pressed }) => [styles.actionBtn, styles.editBtn, pressed && { opacity: 0.75 }]}
                    onPress={handleEdit}
                  >
                    <Feather name="edit-2" size={14} color={colors.primary} />
                    <Text style={[styles.actionBtnText, { color: colors.primary }]}>Edit</Text>
                  </Pressable>

                  <Pressable
                    style={({ pressed }) => [styles.actionBtn, styles.removeBtn, pressed && { opacity: 0.75 }]}
                    onPress={handleRemove}
                  >
                    <Feather name="trash-2" size={14} color={colors.destructive ?? "#ef4444"} />
                    <Text style={[styles.actionBtnText, { color: colors.destructive ?? "#ef4444" }]}>Remove</Text>
                  </Pressable>
                </View>
              </>
            )}

            {/* ── No key saved OR editing ── */}
            {(!savedKey || editing) && (
              <>
                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.input}
                    placeholder="sk-or-v1-..."
                    placeholderTextColor={colors.mutedForeground}
                    value={inputKey}
                    onChangeText={setInputKey}
                    secureTextEntry={!showKey}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="off"
                    autoFocus={editing}
                  />
                  <Pressable onPress={() => setShowKey((v) => !v)} style={styles.eyeBtn}>
                    <Feather name={showKey ? "eye-off" : "eye"} size={18} color={colors.mutedForeground} />
                  </Pressable>
                </View>

                <View style={styles.actionRow}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.saveBtn,
                      (!inputKey.trim() || saving) && styles.saveBtnDisabled,
                      pressed && inputKey.trim() && !saving && { opacity: 0.8 },
                    ]}
                    onPress={handleSave}
                    disabled={!inputKey.trim() || saving}
                  >
                    {saving ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <>
                        <Feather name={editing ? "check" : "plus"} size={15} color="white" />
                        <Text style={styles.saveBtnText}>{editing ? "Update Key" : "Add Key"}</Text>
                      </>
                    )}
                  </Pressable>

                  {editing && (
                    <Pressable
                      style={({ pressed }) => [styles.actionBtn, styles.cancelBtn, pressed && { opacity: 0.75 }]}
                      onPress={handleCancel}
                    >
                      <Feather name="x" size={14} color={colors.mutedForeground} />
                      <Text style={[styles.actionBtnText, { color: colors.mutedForeground }]}>Cancel</Text>
                    </Pressable>
                  )}
                </View>
              </>
            )}
          </View>

          {/* Where to get a key */}
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

          {/* AI Model */}
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
  const destructive = (colors as Record<string, string>).destructive ?? "#ef4444";
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
    cardTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: colors.foreground, flex: 1 },
    cardDesc: { fontSize: 13, color: colors.mutedForeground, fontFamily: "Inter_400Regular", lineHeight: 20, marginBottom: 14 },
    savedPill: {
      flexDirection: "row", alignItems: "center", gap: 4,
      backgroundColor: colors.success + "18", borderRadius: 20,
      paddingHorizontal: 8, paddingVertical: 3,
      borderWidth: 1, borderColor: colors.success + "35",
    },
    savedPillText: { fontSize: 11, color: colors.success, fontFamily: "Inter_600SemiBold" },
    keyRow: {
      flexDirection: "row", alignItems: "center", gap: 10,
      backgroundColor: colors.background, borderRadius: 12,
      paddingHorizontal: 14, paddingVertical: 12,
      borderWidth: 1, borderColor: colors.border, marginBottom: 12,
    },
    maskedKey: {
      flex: 1, fontSize: 13, color: colors.foreground,
      fontFamily: Platform.OS === "android" ? "monospace" : "Courier New",
    },
    actionRow: { flexDirection: "row", gap: 10 },
    actionBtn: {
      flexDirection: "row", alignItems: "center", gap: 6,
      borderRadius: 12, paddingVertical: 11, paddingHorizontal: 16,
      borderWidth: 1, flex: 1, justifyContent: "center",
    },
    editBtn: {
      backgroundColor: colors.primary + "12",
      borderColor: colors.primary + "35",
    },
    removeBtn: {
      backgroundColor: destructive + "12",
      borderColor: destructive + "35",
    },
    cancelBtn: {
      backgroundColor: colors.card,
      borderColor: colors.border,
      flex: 0, paddingHorizontal: 16,
    },
    actionBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
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
      flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
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
