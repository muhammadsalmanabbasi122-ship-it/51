import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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
    if (!email.trim() || !password) {
      setError("Please fill in all fields");
      return;
    }
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
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientEnd, "#1E1B4B"]}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <KeyboardAwareScrollViewCompat
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 },
        ]}
        bottomOffset={24}
      >
        <Animated.View entering={FadeInUp.delay(100).springify()} style={styles.header}>
          <View style={styles.iconBadge}>
            <Feather name="code" size={32} color="white" />
          </View>
          <Text style={styles.appName}>HTML Creator</Text>
          <Text style={styles.tagline}>Build stunning web pages with AI</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.card}>
          <Text style={styles.cardTitle}>Welcome back</Text>
          <Text style={styles.cardSub}>Sign in to your account</Text>

          {!!error && (
            <View style={styles.errorBox}>
              <Feather name="alert-circle" size={16} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrap}>
              <Feather name="mail" size={18} color={colors.mutedForeground} style={styles.inputIcon} />
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
              <Feather name="lock" size={18} color={colors.mutedForeground} style={styles.inputIcon} />
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
                <Feather name={showPassword ? "eye-off" : "eye"} size={18} color={colors.mutedForeground} />
              </Pressable>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [styles.loginBtn, pressed && { opacity: 0.85 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            <LinearGradient
              colors={[colors.primary, colors.accent]}
              style={styles.loginBtnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.loginBtnText}>Sign In</Text>
              )}
            </LinearGradient>
          </Pressable>

          <Pressable
            style={styles.registerLink}
            onPress={() => router.push("/(auth)/register")}
          >
            <Text style={styles.registerLinkText}>
              Don't have an account?{" "}
              <Text style={{ color: colors.primary, fontWeight: "700" }}>Create one</Text>
            </Text>
          </Pressable>
        </Animated.View>
      </KeyboardAwareScrollViewCompat>
    </LinearGradient>
  );
}

function makeStyles(colors: ReturnType<typeof import("@/hooks/useColors").useColors>) {
  return StyleSheet.create({
    container: { paddingHorizontal: 24, alignItems: "center" },
    header: { alignItems: "center", marginBottom: 32 },
    iconBadge: {
      width: 72, height: 72, borderRadius: 20,
      backgroundColor: "rgba(255,255,255,0.15)",
      alignItems: "center", justifyContent: "center",
      marginBottom: 16,
      borderWidth: 1, borderColor: "rgba(255,255,255,0.2)",
    },
    appName: { fontSize: 28, fontWeight: "800" as const, color: "white", letterSpacing: -0.5 },
    tagline: { fontSize: 15, color: "rgba(255,255,255,0.7)", marginTop: 6 },
    card: {
      width: "100%", backgroundColor: colors.card,
      borderRadius: colors.radius, padding: 28,
      shadowColor: "#000", shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15, shadowRadius: 24, elevation: 8,
    },
    cardTitle: { fontSize: 22, fontWeight: "700" as const, color: colors.foreground, marginBottom: 4 },
    cardSub: { fontSize: 14, color: colors.mutedForeground, marginBottom: 24 },
    errorBox: {
      flexDirection: "row", alignItems: "center", gap: 8,
      backgroundColor: "#FEF2F2", borderRadius: 10,
      padding: 12, marginBottom: 16,
      borderWidth: 1, borderColor: "#FECACA",
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
    input: {
      flex: 1, height: 48, fontSize: 15,
      color: colors.foreground,
      fontFamily: "Inter_400Regular",
    },
    eyeBtn: { padding: 6 },
    loginBtn: { marginTop: 8, borderRadius: 12, overflow: "hidden" },
    loginBtnGradient: { height: 52, alignItems: "center", justifyContent: "center" },
    loginBtnText: { color: "white", fontSize: 16, fontWeight: "700" as const, letterSpacing: 0.3 },
    registerLink: { marginTop: 20, alignItems: "center" },
    registerLinkText: { fontSize: 14, color: colors.mutedForeground },
  });
}
