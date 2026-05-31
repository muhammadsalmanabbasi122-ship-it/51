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

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    if (!email.trim() || !password) { setError("Please fill in all fields"); return; }
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLoading(true);
    const result = await login(email.trim(), password);
    setLoading(false);
    if (!result.success) {
      setError(result.error || "Login failed");
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const styles = makeStyles(colors);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAwareScrollViewCompat
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 32 },
        ]}
        bottomOffset={24}
      >
        {/* Logo */}
        <Animated.View entering={FadeInUp.delay(80).springify()} style={styles.logoArea}>
          <View style={styles.iconBadge}>
            <Feather name="code" size={30} color={colors.primary} />
          </View>
          <Text style={styles.appName}>HTML Creator</Text>
          <Text style={styles.tagline}>Build stunning web pages with AI</Text>
        </Animated.View>

        {/* Card */}
        <Animated.View entering={FadeInDown.delay(180).springify()} style={styles.card}>
          <Text style={styles.cardTitle}>Welcome back</Text>
          <Text style={styles.cardSub}>Sign in to your account</Text>

          {!!error && (
            <View style={styles.errorBox}>
              <Feather name="alert-circle" size={15} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

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
                autoComplete="email"
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrap}>
              <Feather name="lock" size={17} color={colors.mutedForeground} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="••••••••"
                placeholderTextColor={colors.mutedForeground}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="password"
              />
              <Pressable onPress={() => setShowPassword((v) => !v)} style={styles.eyeBtn}>
                <Feather name={showPassword ? "eye-off" : "eye"} size={17} color={colors.mutedForeground} />
              </Pressable>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [styles.loginBtn, pressed && { opacity: 0.85 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            <View style={styles.loginBtnInner}>
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.loginBtnText}>Sign In</Text>
              )}
            </View>
          </Pressable>

          <Pressable style={styles.registerLink} onPress={() => router.push("/(auth)/register")}>
            <Text style={styles.registerLinkText}>
              Don't have an account?{" "}
              <Text style={{ color: colors.primary, fontWeight: "700" }}>Create one</Text>
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
    logoArea: { alignItems: "center", marginBottom: 36 },
    iconBadge: {
      width: 76, height: 76, borderRadius: 22,
      backgroundColor: colors.primary + "18",
      borderWidth: 1.5, borderColor: colors.primary + "35",
      alignItems: "center", justifyContent: "center", marginBottom: 18,
    },
    appName: { fontSize: 28, fontWeight: "800" as const, color: colors.foreground, letterSpacing: -0.5 },
    tagline: { fontSize: 14, color: colors.mutedForeground, marginTop: 6, fontFamily: "Inter_400Regular" },
    card: {
      width: "100%", backgroundColor: colors.card,
      borderRadius: colors.radius, padding: 26,
      borderWidth: 1, borderColor: colors.border,
    },
    cardTitle: { fontSize: 22, fontWeight: "700" as const, color: colors.foreground, marginBottom: 4 },
    cardSub: { fontSize: 14, color: colors.mutedForeground, marginBottom: 22, fontFamily: "Inter_400Regular" },
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
    loginBtn: { marginTop: 8, borderRadius: 12, overflow: "hidden" },
    loginBtnInner: {
      height: 52, backgroundColor: colors.primary,
      alignItems: "center", justifyContent: "center", borderRadius: 12,
    },
    loginBtnText: { color: "white", fontSize: 16, fontWeight: "700" as const, letterSpacing: 0.2 },
    registerLink: { marginTop: 20, alignItems: "center" },
    registerLinkText: { fontSize: 14, color: colors.mutedForeground },
  });
}
