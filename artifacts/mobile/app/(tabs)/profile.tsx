import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", year: "numeric" });
  } catch {
    return "—";
  }
}

function formatFileDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return "—";
  }
}

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const styles = makeStyles(colors);

  if (!user) return null;

  const initials = user.username
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = () => {
    if (Platform.OS !== "web") {
      Alert.alert("Logout", "Are you sure you want to logout?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            await logout();
          },
        },
      ]);
    } else {
      logout();
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: Platform.OS === "web" ? insets.top + 67 : insets.top + 16,
          paddingBottom: insets.bottom + 100,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(50).springify()} style={styles.profileCard}>
          <LinearGradient colors={[colors.gradientStart, colors.gradientEnd, colors.gradientAccent]} style={styles.avatarBg}>
            <Text style={styles.avatarText}>{initials}</Text>
          </LinearGradient>
          <Text style={styles.username}>{user.username}</Text>
          <Text style={styles.email}>{user.email}</Text>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{user.uploads.length}</Text>
              <Text style={styles.statLabel}>Uploads</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>Free</Text>
              <Text style={styles.statLabel}>Plan</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{formatDate(user.joinDate)}</Text>
              <Text style={styles.statLabel}>Joined</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(150).springify()}>
          <Text style={styles.sectionTitle}>Recent Uploads</Text>
          {user.uploads.length === 0 ? (
            <View style={styles.emptyUploads}>
              <Feather name="file-text" size={32} color={colors.mutedForeground} />
              <Text style={styles.emptyTitle}>No uploads yet</Text>
              <Text style={styles.emptyText}>Generate some HTML and your uploads will appear here.</Text>
            </View>
          ) : (
            <View style={styles.uploadsList}>
              {user.uploads.map((u, i) => (
                <Animated.View key={u.id} entering={FadeInDown.delay(170 + i * 40).springify()}>
                  <View style={styles.uploadRow}>
                    <View style={styles.fileIcon}>
                      <Feather name="file-text" size={16} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.fileName} numberOfLines={1}>{u.filename}</Text>
                      <Text style={styles.fileMeta}>{u.size} · {formatFileDate(u.date)}</Text>
                    </View>
                  </View>
                </Animated.View>
              ))}
            </View>
          )}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.menuCard}>
            <Pressable style={styles.menuRow}>
              <Feather name="settings" size={18} color={colors.primary} />
              <Text style={styles.menuLabel}>Settings</Text>
              <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
            </Pressable>
            <View style={styles.menuDivider} />
            <Pressable style={styles.menuRow}>
              <Feather name="help-circle" size={18} color={colors.accent} />
              <Text style={styles.menuLabel}>Help & Support</Text>
              <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
            </Pressable>
            <View style={styles.menuDivider} />
            <Pressable
              style={({ pressed }) => [styles.menuRow, pressed && { opacity: 0.7 }]}
              onPress={handleLogout}
            >
              <Feather name="log-out" size={18} color={colors.destructive} />
              <Text style={[styles.menuLabel, { color: colors.destructive }]}>Logout</Text>
              <Feather name="chevron-right" size={16} color={colors.destructive} />
            </Pressable>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

function makeStyles(colors: ReturnType<typeof import("@/hooks/useColors").useColors>) {
  return StyleSheet.create({
    profileCard: {
      backgroundColor: colors.card, borderRadius: colors.radius,
      padding: 28, alignItems: "center", marginBottom: 28,
      borderWidth: 1, borderColor: colors.border,
      shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
    },
    avatarBg: { width: 80, height: 80, borderRadius: 24, alignItems: "center", justifyContent: "center", marginBottom: 14 },
    avatarText: { color: "white", fontSize: 28, fontWeight: "800" as const },
    username: { fontSize: 20, fontWeight: "700" as const, color: colors.foreground, marginBottom: 4 },
    email: { fontSize: 14, color: colors.mutedForeground, marginBottom: 20 },
    statsRow: { flexDirection: "row", alignItems: "center", width: "100%" },
    stat: { flex: 1, alignItems: "center" },
    statValue: { fontSize: 16, fontWeight: "700" as const, color: colors.primary },
    statLabel: { fontSize: 12, color: colors.mutedForeground, marginTop: 2 },
    statDivider: { width: 1, height: 32, backgroundColor: colors.border },
    sectionTitle: { fontSize: 17, fontWeight: "700" as const, color: colors.foreground, marginBottom: 14, letterSpacing: -0.3 },
    emptyUploads: {
      backgroundColor: colors.card, borderRadius: colors.radius, padding: 32,
      alignItems: "center", gap: 8, borderWidth: 1, borderColor: colors.border,
      marginBottom: 28,
    },
    emptyTitle: { fontSize: 16, fontWeight: "600" as const, color: colors.foreground },
    emptyText: { fontSize: 13, color: colors.mutedForeground, textAlign: "center", lineHeight: 18 },
    uploadsList: {
      backgroundColor: colors.card, borderRadius: colors.radius,
      borderWidth: 1, borderColor: colors.border, overflow: "hidden", marginBottom: 28,
    },
    uploadRow: {
      flexDirection: "row", alignItems: "center", gap: 12,
      paddingHorizontal: 16, paddingVertical: 14,
      borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    fileIcon: {
      width: 36, height: 36, borderRadius: 10,
      backgroundColor: colors.secondary, alignItems: "center", justifyContent: "center",
    },
    fileName: { fontSize: 14, fontWeight: "600" as const, color: colors.foreground },
    fileMeta: { fontSize: 12, color: colors.mutedForeground, marginTop: 2 },
    menuCard: {
      backgroundColor: colors.card, borderRadius: colors.radius,
      borderWidth: 1, borderColor: colors.border, overflow: "hidden", marginBottom: 28,
    },
    menuRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 16 },
    menuLabel: { flex: 1, fontSize: 15, color: colors.foreground, fontFamily: "Inter_500Medium" },
    menuDivider: { height: 1, backgroundColor: colors.border, marginLeft: 46 },
  });
}
