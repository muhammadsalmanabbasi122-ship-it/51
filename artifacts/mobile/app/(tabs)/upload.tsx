import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const UPLOAD_URL = "https://web.chandtricker.qzz.io";

export default function UploadScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const styles = makeStyles(colors);

  if (Platform.OS === "web") {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 67 }]}>
        <View style={styles.header}>
          <Feather name="upload-cloud" size={20} color={colors.primary} />
          <Text style={styles.headerTitle}>Upload HTML</Text>
        </View>
        <View style={styles.webFallback}>
          <Feather name="globe" size={40} color={colors.mutedForeground} />
          <Text style={styles.webFallbackTitle}>Upload Portal</Text>
          <Text style={styles.webFallbackText}>
            Open this app on your phone to access the upload portal.
          </Text>
        </View>
      </View>
    );
  }

  const WebView = require("react-native-webview").WebView;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={[
          styles.header,
          { paddingTop: Platform.OS === "ios" ? insets.top + 8 : insets.top + 16 },
        ]}
      >
        <Feather name="upload-cloud" size={20} color={colors.primary} />
        <Text style={styles.headerTitle}>Upload HTML</Text>
      </View>
      <View style={{ flex: 1 }}>
        {loading && !error && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading upload portal...</Text>
          </View>
        )}
        {error && (
          <View style={styles.errorView}>
            <Feather name="wifi-off" size={44} color={colors.mutedForeground} />
            <Text style={styles.errorTitle}>Could not load page</Text>
            <Text style={styles.errorSub}>Check your internet connection and try again.</Text>
          </View>
        )}
        <WebView
          source={{ uri: UPLOAD_URL }}
          style={{ flex: 1, opacity: loading || error ? 0 : 1 }}
          onLoadEnd={() => setLoading(false)}
          onError={() => { setLoading(false); setError(true); }}
          javaScriptEnabled
          domStorageEnabled
        />
      </View>
    </View>
  );
}

function makeStyles(colors: ReturnType<typeof import("@/hooks/useColors").useColors>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: "row", alignItems: "center", gap: 10,
      paddingHorizontal: 20, paddingBottom: 14,
      borderBottomWidth: 1, borderBottomColor: colors.border,
      backgroundColor: colors.background,
    },
    headerTitle: { fontSize: 17, fontWeight: "700" as const, color: colors.foreground },
    loadingOverlay: {
      position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
      alignItems: "center", justifyContent: "center",
      backgroundColor: colors.background, zIndex: 10, gap: 12,
    },
    loadingText: { fontSize: 14, color: colors.mutedForeground },
    errorView: {
      position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
      alignItems: "center", justifyContent: "center",
      backgroundColor: colors.background, zIndex: 10, gap: 12, padding: 40,
    },
    errorTitle: { fontSize: 18, fontWeight: "700" as const, color: colors.foreground },
    errorSub: { fontSize: 14, color: colors.mutedForeground, textAlign: "center" },
    webFallback: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 40 },
    webFallbackTitle: { fontSize: 18, fontWeight: "700" as const, color: colors.foreground },
    webFallbackText: { fontSize: 14, color: colors.mutedForeground, textAlign: "center" },
  });
}
