import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

const QUICK_CARDS = [
  {
    icon: "cpu" as const,
    label: "AI Generator",
    desc: "Generate HTML with AI",
    route: "/(tabs)/ai" as const,
    gradient: ["#6D28D9", "#4C1D95"] as [string, string],
  },
  {
    icon: "upload-cloud" as const,
    label: "Upload HTML",
    desc: "Upload & preview code",
    route: "/(tabs)/upload" as const,
    gradient: ["#0EA5E9", "#0369A1"] as [string, string],
  },
  {
    icon: "message-circle" as const,
    label: "Community",
    desc: "Chat with creators",
    route: "/(tabs)/community" as const,
    gradient: ["#10B981", "#047857"] as [string, string],
  },
  {
    icon: "user" as const,
    label: "My Profile",
    desc: "View your uploads",
    route: "/(tabs)/profile" as const,
    gradient: ["#F59E0B", "#B45309"] as [string, string],
  },
];

const TIPS = [
  "Try: 'make a landing page for a bakery'",
  "Try: 'create a portfolio for a developer'",
  "Try: 'build an e-commerce store page'",
  "Try: 'design a fitness studio website'",
];

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const firstName = user?.username?.split(" ")[0] ?? "there";
  const styles = makeStyles(colors);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: Platform.OS === "web" ? insets.top + 67 : insets.top + 16,
          paddingBottom: insets.bottom + 100,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.delay(50).springify()} style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>Hello, {firstName} 👋</Text>
            <View style={styles.statusRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineLabel}>Online</Text>
            </View>
          </View>
          <Pressable
            onPress={() => router.push("/(tabs)/profile")}
            style={({ pressed }) => [styles.avatarBtn, pressed && { opacity: 0.75 }]}
          >
            <LinearGradient colors={[colors.primary, colors.accent]} style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.username
                  ?.split(" ")
                  .map((w) => w[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2) ?? "?"}
              </Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(100).springify()}>
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientEnd]}
            style={styles.heroBanner}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.heroBadge}>
              <Feather name="zap" size={12} color="#F59E0B" />
              <Text style={styles.heroBadgeText}>AI Powered</Text>
            </View>
            <Text style={styles.heroTitle}>Create HTML{"\n"}in seconds</Text>
            <Text style={styles.heroSub}>Describe your idea, get production-ready HTML instantly</Text>
            <Pressable
              style={({ pressed }) => [styles.heroBtn, pressed && { opacity: 0.85 }]}
              onPress={() => {
                if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push("/(tabs)/ai");
              }}
            >
              <Text style={styles.heroBtnText}>Try AI Generator</Text>
              <Feather name="arrow-right" size={16} color={colors.primary} />
            </Pressable>
          </LinearGradient>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(150).springify()}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <View style={styles.cardsGrid}>
            {QUICK_CARDS.map((card, i) => (
              <Animated.View key={card.label} entering={FadeInDown.delay(180 + i * 60).springify()}>
                <Pressable
                  style={({ pressed }) => [styles.card, pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] }]}
                  onPress={() => {
                    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push(card.route);
                  }}
                >
                  <LinearGradient colors={card.gradient} style={styles.cardIconBg}>
                    <Feather name={card.icon} size={22} color="white" />
                  </LinearGradient>
                  <Text style={styles.cardLabel}>{card.label}</Text>
                  <Text style={styles.cardDesc}>{card.desc}</Text>
                </Pressable>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).springify()}>
          <Text style={styles.sectionTitle}>Get Started</Text>
          <View style={styles.tipsCard}>
            {TIPS.map((tip, i) => (
              <Pressable
                key={i}
                style={({ pressed }) => [styles.tipRow, pressed && { opacity: 0.7 }]}
                onPress={() => {
                  if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push("/(tabs)/ai");
                }}
              >
                <View style={styles.tipBullet}>
                  <Feather name="chevron-right" size={14} color={colors.primary} />
                </View>
                <Text style={styles.tipText}>{tip}</Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

function makeStyles(colors: ReturnType<typeof import("@/hooks/useColors").useColors>) {
  return StyleSheet.create({
    headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
    greeting: { fontSize: 22, fontWeight: "800" as const, color: colors.foreground, letterSpacing: -0.5 },
    statusRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
    onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#10B981" },
    onlineLabel: { fontSize: 13, color: "#10B981", fontFamily: "Inter_500Medium" },
    avatarBtn: {},
    avatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
    avatarText: { color: "white", fontSize: 16, fontWeight: "700" as const },
    heroBanner: {
      borderRadius: colors.radius, padding: 24, marginBottom: 28,
    },
    heroBadge: {
      flexDirection: "row", alignItems: "center", gap: 4,
      backgroundColor: "rgba(255,255,255,0.15)", paddingHorizontal: 10, paddingVertical: 4,
      borderRadius: 20, alignSelf: "flex-start", marginBottom: 12,
    },
    heroBadgeText: { fontSize: 11, color: "#FDE68A", fontFamily: "Inter_600SemiBold" },
    heroTitle: { fontSize: 28, fontWeight: "800" as const, color: "white", letterSpacing: -0.5, marginBottom: 8 },
    heroSub: { fontSize: 14, color: "rgba(255,255,255,0.75)", marginBottom: 20, lineHeight: 20 },
    heroBtn: {
      flexDirection: "row", alignItems: "center", gap: 8,
      backgroundColor: "white", paddingHorizontal: 20, paddingVertical: 12,
      borderRadius: 50, alignSelf: "flex-start",
    },
    heroBtnText: { color: colors.primary, fontWeight: "700" as const, fontSize: 14 },
    sectionTitle: { fontSize: 17, fontWeight: "700" as const, color: colors.foreground, marginBottom: 14, letterSpacing: -0.3 },
    cardsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 28 },
    card: {
      width: "47%", backgroundColor: colors.card,
      borderRadius: colors.radius, padding: 18,
      borderWidth: 1, borderColor: colors.border,
      shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
    },
    cardIconBg: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center", marginBottom: 12 },
    cardLabel: { fontSize: 14, fontWeight: "700" as const, color: colors.foreground, marginBottom: 4 },
    cardDesc: { fontSize: 12, color: colors.mutedForeground, lineHeight: 16 },
    tipsCard: {
      backgroundColor: colors.card, borderRadius: colors.radius, padding: 4,
      borderWidth: 1, borderColor: colors.border,
    },
    tipRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, gap: 10 },
    tipBullet: {
      width: 24, height: 24, borderRadius: 8, backgroundColor: colors.secondary,
      alignItems: "center", justifyContent: "center",
    },
    tipText: { fontSize: 13, color: colors.mutedForeground, flex: 1, fontFamily: "Inter_400Regular" },
  });
}
