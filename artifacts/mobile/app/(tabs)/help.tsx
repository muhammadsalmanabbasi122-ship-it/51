import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const CONTACTS = [
  {
    icon: "phone" as const,
    label: "WhatsApp",
    value: "+92 322 7334538",
    url: "https://wa.me/923227334538",
    color: "#25D366",
  },
  {
    icon: "instagram" as const,
    label: "Instagram",
    value: "@zain_bin_rauf",
    url: "https://www.instagram.com/zain_bin_rauf?igsh=MTk2NjltczV0a2l2MQ==",
    color: "#E4405F",
  },
  {
    icon: "facebook" as const,
    label: "Facebook",
    value: "Zain Bin Rauf",
    url: "https://www.facebook.com/share/1AivcQPN7k/",
    color: "#1877F2",
  },
];

export default function HelpScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const styles = makeStyles(colors);

  const openLink = async (url: string) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { paddingTop: Platform.OS === "web" ? insets.top + 67 : insets.top + 16 }]}>
        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </Pressable>
        <Text style={styles.headerTitle}>Help & Support</Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingBottom: insets.bottom + 110,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(50).springify()} style={styles.card}>
          <View style={styles.cardIcon}>
            <Feather name="headphones" size={28} color={colors.primary} />
          </View>
          <Text style={styles.cardTitle}>Get in Touch</Text>
          <Text style={styles.cardSub}>
            Reach out to us anytime. We're here to help!
          </Text>
        </Animated.View>

        <View style={styles.contactsList}>
          {CONTACTS.map((contact, i) => (
            <Animated.View
              key={contact.label}
              entering={FadeInDown.delay(100 + i * 80).springify()}
            >
              <Pressable
                style={({ pressed }) => [styles.contactRow, pressed && { opacity: 0.7 }]}
                onPress={() => openLink(contact.url)}
              >
                <View style={[styles.contactIcon, { backgroundColor: contact.color + "20" }]}>
                  <Feather name={contact.icon} size={20} color={contact.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.contactLabel}>{contact.label}</Text>
                  <Text style={styles.contactValue}>{contact.value}</Text>
                </View>
                <Feather name="external-link" size={16} color={colors.mutedForeground} />
              </Pressable>
            </Animated.View>
          ))}
        </View>

        <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.footerCard}>
          <View style={[styles.footerIcon, { backgroundColor: colors.warning + "18" }]}>
            <Feather name="clock" size={20} color={colors.warning} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.footerTitle}>Response Time</Text>
            <Text style={styles.footerText}>
              We typically respond within 24 hours on all platforms.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
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
    backBtn: {
      width: 36, height: 36, borderRadius: 10,
      backgroundColor: colors.card, alignItems: "center", justifyContent: "center",
      borderWidth: 1, borderColor: colors.border,
    },
    headerTitle: { fontSize: 17, fontWeight: "700" as const, color: colors.foreground },
    card: {
      backgroundColor: colors.card, borderRadius: colors.radius,
      padding: 28, alignItems: "center", marginBottom: 20,
      borderWidth: 1, borderColor: colors.border,
    },
    cardIcon: {
      width: 64, height: 64, borderRadius: 20,
      backgroundColor: colors.primary + "18",
      borderWidth: 1, borderColor: colors.primary + "30",
      alignItems: "center", justifyContent: "center", marginBottom: 14,
    },
    cardTitle: { fontSize: 20, fontWeight: "700" as const, color: colors.foreground, marginBottom: 6 },
    cardSub: { fontSize: 14, color: colors.mutedForeground, textAlign: "center", lineHeight: 20 },
    contactsList: { gap: 10, marginBottom: 20 },
    contactRow: {
      flexDirection: "row", alignItems: "center", gap: 14,
      backgroundColor: colors.card, borderRadius: 14, padding: 16,
      borderWidth: 1, borderColor: colors.border,
    },
    contactIcon: {
      width: 44, height: 44, borderRadius: 12,
      alignItems: "center", justifyContent: "center",
    },
    contactLabel: { fontSize: 15, fontWeight: "600" as const, color: colors.foreground, marginBottom: 2 },
    contactValue: { fontSize: 13, color: colors.mutedForeground },
    footerCard: {
      flexDirection: "row", alignItems: "center", gap: 14,
      backgroundColor: colors.card, borderRadius: 14, padding: 16,
      borderWidth: 1, borderColor: colors.border,
    },
    footerIcon: {
      width: 44, height: 44, borderRadius: 12,
      alignItems: "center", justifyContent: "center",
    },
    footerTitle: { fontSize: 15, fontWeight: "600" as const, color: colors.foreground, marginBottom: 2 },
    footerText: { fontSize: 13, color: colors.mutedForeground, lineHeight: 18 },
  });
}
