import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function RegisterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { register } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setError("");
    if (!username.trim() || !email.trim() || !password) { setError("Please fill in all fields"); return; }
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLoading(true);
    const result = await register(email.trim(), password, username.trim());
    setLoading(false);
    if (!result.success) {
      setError(result.error || "Registration failed");
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const styles = makeStyles(colors);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAwareScrollViewCompat
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 32 },
        ]}
        bottomOffset={24}
      >
        <Animated.View entering={FadeInUp.delay(80).springify()} style={styles.headerArea}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={colors.foreground} />
          </Pressable>
          <View style={styles.iconBadge}>
            <Feather name="user-plus" size={28} color={colors.primary} />
          </View>
          <Text style={styles.appName}>Create Account</Text>
          <Text style={styles.tagline}>Join the HTML Creator community</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(180).springify()} style={styles.card}>
          {!!error && (
            <View style={styles.errorBox}>
              <Feather name="alert-circle" size={15} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputWrap}>
              <Feather name="user" size={17} color={colors.mutedForeground} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Ali Khan"
                placeholderTextColor={colors.mutedForeground}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="words"
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrap}>
              <Feather name="mail" size={17} color={colors.mutedForeground} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor={colors.mutedForeground}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrap}>
              <Feather name="lock" size={17} color={colors.mutedForeground} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Min. 6 characters"
                placeholderTextColor={colors.mutedForeground}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <Pressable onPress={() => setShowPassword((v) => !v)} style={styles.eyeBtn}>
                <Feather name={showPassword ? "eye-off" : "eye"} size={17} color={colors.mutedForeground} />
              </Pressable>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [styles.regBtn, pressed && { opacity: 0.85 }]}
            onPress={handleRegister}
            disabled={loading}
          >
            <View style={styles.regBtnInner}>
              {loading ? <ActivityIndicator color="white" /> : <Text style={styles.regBtnText}>Create Account</Text>}
            </View>
          </Pressable>

          <Pressable style={styles.loginLink} onPress={() => router.back()}>
            <Text style={styles.loginLinkText}>
              Already have an account?{" "}
              <Text style={{ color: colors.primary, fontWeight: "700" }}>Sign in</Text>
            </Text>
          </Pressable>
        </Animated.View>
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

function makeStyles(colors: ReturnType<typeof import("@/hooks/useColors").useColors>) {
  return StyleSheet.create({
    container: { paddingHorizontal: 22, alignItems: "center" },
    headerArea: { alignItems: "center", marginBottom: 28, width: "100%" },
    backBtn: { alignSelf: "flex-start", padding: 8, marginBottom: 12 },
    iconBadge: {
      width: 72, height: 72, borderRadius: 22,
      backgroundColor: colors.primary + "18",
      borderWidth: 1.5, borderColor: colors.primary + "35",
      alignItems: "center", justifyContent: "center", marginBottom: 16,
    },
    appName: { fontSize: 24, fontWeight: "800" as const, color: colors.foreground, letterSpacing: -0.5 },
    tagline: { fontSize: 14, color: colors.mutedForeground, marginTop: 4, fontFamily: "Inter_400Regular" },
    card: {
      width: "100%", backgroundColor: colors.card,
      borderRadius: colors.radius, padding: 26,
      borderWidth: 1, borderColor: colors.border,
    },
    errorBox: {
      flexDirection: "row", alignItems: "center", gap: 8,
      backgroundColor: "#EF444415", borderRadius: 10,
      padding: 12, marginBottom: 16,
      borderWidth: 1, borderColor: "#EF444430",
    },
    errorText: { color: "#EF4444", fontSize: 13, flex: 1 },
    fieldGroup: { marginBottom: 16 },
    label: { fontSize: 13, fontWeight: "600" as const, color: colors.foreground, marginBottom: 8 },
    inputWrap: {
      flexDirection: "row", alignItems: "center",
      backgroundColor: colors.input, borderRadius: 12,
      borderWidth: 1.5, borderColor: colors.border,
      paddingHorizontal: 14,
    },
    inputIcon: { marginRight: 10 },
    input: { flex: 1, height: 48, fontSize: 15, color: colors.foreground, fontFamily: "Inter_400Regular" },
    eyeBtn: { padding: 6 },
    regBtn: { marginTop: 8, borderRadius: 12, overflow: "hidden" },
    regBtnInner: {
      height: 52, backgroundColor: colors.primary,
      alignItems: "center", justifyContent: "center", borderRadius: 12,
    },
    regBtnText: { color: "white", fontSize: 16, fontWeight: "700" as const, letterSpacing: 0.2 },
    loginLink: { marginTop: 20, alignItems: "center" },
    loginLinkText: { fontSize: 14, color: colors.mutedForeground },
  });
}
