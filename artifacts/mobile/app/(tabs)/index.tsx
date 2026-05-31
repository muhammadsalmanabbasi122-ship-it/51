import { Feather } from "@expo/vector-icons";
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

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning,";
  if (h < 17) return "Good afternoon,";
  return "Good evening,";
}

const QUICK_ROWS = [
  {
    icon: "cpu" as const,
    label: "AI Generator",
    desc: "Generate HTML with Kimi AI",
    route: "/(tabs)/ai" as const,
    iconBg: ["#6D28D9", "#4C1D95"] as [string, string],
    iconColor: "#A78BFA",
  },
  {
    icon: "upload-cloud" as const,
    label: "Upload HTML",
    desc: "Host and share your files",
    route: "/(tabs)/upload" as const,
    iconBg: ["#0E7490", "#0369A1"] as [string, string],
    iconColor: "#38BDF8",
  },
  {
    icon: "message-circle" as const,
    label: "Community",
    desc: "Chat with other builders",
    route: "/(tabs)/community" as const,
    iconBg: ["#065F46", "#047857"] as [string, string],
    iconColor: "#34D399",
  },
  {
    icon: "user" as const,
    label: "Profile",
    desc: "Your account and history",
    route: "/(tabs)/profile" as const,
    iconBg: ["#92400E", "#B45309"] as [string, string],
    iconColor: "#FCD34D",
  },
];

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const username = user?.username ?? "there";
  const styles = makeStyles(colors);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: Platform.OS === "web" ? insets.top + 67 : insets.top + 20,
          paddingBottom: insets.bottom + 110,
          paddingHorizontal: 18,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header greeting card */}
        <Animated.View entering={FadeInUp.delay(50).springify()} style={styles.greetCard}>
          <View style={styles.greetTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.greetLabel}>{getGreeting()}</Text>
              <Text style={styles.greetName}>{username}</Text>
            </View>
            <View style={styles.onlinePill}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>Online</Text>
            </View>
          </View>

          <View style={styles.tagRow}>
            <View style={styles.tag}>
              <Feather name="code" size={11} color={colors.primary} />
              <Text style={styles.tagText}>HTML Creator</Text>
            </View>
            <View style={styles.tag}>
              <Feather name="zap" size={11} color={colors.primary} />
              <Text style={styles.tagText}>Kimi AI</Text>
            </View>
          </View>

          <Text style={styles.greetDesc}>
            Generate, upload, and share HTML code powered by AI.
          </Text>
        </Animated.View>

        {/* Quick Access */}
        <Animated.View entering={FadeInDown.delay(120).springify()}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <View style={styles.listCard}>
            {QUICK_ROWS.map((row, i) => (
              <Animated.View key={row.label} entering={FadeInDown.delay(140 + i * 55).springify()}>
                <Pressable
                  style={({ pressed }) => [
                    styles.listRow,
                    i < QUICK_ROWS.length - 1 && styles.listRowBorder,
                    pressed && { opacity: 0.75 },
                  ]}
                  onPress={() => {
                    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push(row.route);
                  }}
                >
                  <View style={[styles.rowIconWrap, { backgroundColor: row.iconBg[1] + "33" }]}>
                    <Feather name={row.icon} size={20} color={row.iconColor} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowLabel}>{row.label}</Text>
                    <Text style={styles.rowDesc}>{row.desc}</Text>
                  </View>
                  <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
                </Pressable>
              </Animated.View>
            ))}
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

function makeStyles(colors: ReturnType<typeof import("@/hooks/useColors").useColors>) {
  return StyleSheet.create({
    greetCard: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      padding: 20,
      marginBottom: 28,
      borderWidth: 1,
      borderColor: colors.border,
    },
    greetTop: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 14,
    },
    greetLabel: {
      fontSize: 14,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
    },
    greetName: {
      fontSize: 26,
      fontWeight: "800" as const,
      color: colors.foreground,
      letterSpacing: -0.5,
      marginTop: 2,
    },
    onlinePill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      backgroundColor: "rgba(34,197,94,0.12)",
      borderWidth: 1,
      borderColor: "rgba(34,197,94,0.25)",
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 20,
      marginTop: 4,
    },
    onlineDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.success,
    },
    onlineText: {
      fontSize: 12,
      color: colors.success,
      fontFamily: "Inter_600SemiBold",
    },
    tagRow: {
      flexDirection: "row",
      gap: 8,
      marginBottom: 14,
    },
    tag: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      borderWidth: 1,
      borderColor: colors.primary + "55",
      backgroundColor: colors.primary + "18",
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 20,
    },
    tagText: {
      fontSize: 12,
      color: colors.primary,
      fontFamily: "Inter_600SemiBold",
    },
    greetDesc: {
      fontSize: 14,
      color: colors.mutedForeground,
      lineHeight: 21,
      fontFamily: "Inter_400Regular",
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "700" as const,
      color: colors.foreground,
      marginBottom: 14,
      letterSpacing: -0.3,
    },
    listCard: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    },
    listRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      paddingHorizontal: 16,
      paddingVertical: 17,
    },
    listRowBorder: {
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    rowIconWrap: {
      width: 46,
      height: 46,
      borderRadius: 13,
      alignItems: "center",
      justifyContent: "center",
    },
    rowLabel: {
      fontSize: 15,
      fontWeight: "700" as const,
      color: colors.foreground,
      marginBottom: 3,
    },
    rowDesc: {
      fontSize: 13,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
    },
  });
}
