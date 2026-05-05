import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useSecurity } from "@/context/SecurityContext";
import { useColors } from "@/hooks/useColors";

const { width } = Dimensions.get("window");

function formatBytes(bytes: number): string {
  if (bytes >= 1e9) return (bytes / 1e9).toFixed(1) + " GB";
  if (bytes >= 1e6) return (bytes / 1e6).toFixed(1) + " MB";
  return (bytes / 1e3).toFixed(1) + " KB";
}

function ShieldAnimation({ active }: { active: boolean }) {
  const colors = useColors();
  const pulse = useRef(new Animated.Value(1)).current;
  const ring1 = useRef(new Animated.Value(0)).current;
  const ring2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!active) return;
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.06, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(ring1, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(ring1, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.delay(700),
        Animated.timing(ring2, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(ring2, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    ).start();
  }, [active]);

  const ringStyle = (anim: Animated.Value) => ({
    position: "absolute" as const,
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1.5,
    borderColor: active ? colors.primary : colors.destructive,
    opacity: anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.7, 0.3, 0] }),
    transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.5] }) }],
  });

  return (
    <View style={styles.shieldContainer}>
      <Animated.View style={ringStyle(ring1)} />
      <Animated.View style={ringStyle(ring2)} />
      <Animated.View style={[styles.shieldInner, { transform: [{ scale: pulse }] }]}>
        <LinearGradient
          colors={active ? ["#0066ff", "#00c2ff"] : ["#ff1744", "#ff6b6b"]}
          style={styles.shieldGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <MaterialCommunityIcons name="shield-check" size={64} color="#fff" />
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { devices, threats, protectionActive, threatsBlockedToday, toggleProtection } = useSecurity();

  const connectedDevices = devices.filter(d => !d.blocked).length;
  const blockedDevices = devices.filter(d => d.blocked).length;
  const activeThreats = threats.filter(t => t.status === "active").length;
  const totalTrafficIn = devices.reduce((sum, d) => sum + d.bytesIn, 0);
  const totalTrafficOut = devices.reduce((sum, d) => sum + d.bytesOut, 0);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const statCards = [
    { label: "Devices", value: connectedDevices.toString(), icon: "smartphone" as const, color: colors.primary },
    { label: "Blocked", value: blockedDevices.toString(), icon: "slash" as const, color: colors.destructive },
    { label: "Threats", value: threatsBlockedToday.toString(), icon: "shield-off" as const, color: colors.warning },
    { label: "Active", value: activeThreats.toString(), icon: "alert-triangle" as const, color: activeThreats > 0 ? colors.destructive : colors.success },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: Platform.OS === "web" ? 100 : 120 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>Network Status</Text>
          <Text style={[styles.deviceName, { color: colors.foreground }]}>Home Security Gateway</Text>
        </View>
        <View style={[styles.statusDot, { backgroundColor: protectionActive ? colors.success : colors.destructive }]} />
      </View>

      <View style={styles.shieldSection}>
        <ShieldAnimation active={protectionActive} />
        <Text style={[styles.shieldLabel, { color: protectionActive ? colors.primary : colors.destructive }]}>
          {protectionActive ? "PROTECTED" : "UNPROTECTED"}
        </Text>
        <Text style={[styles.shieldSub, { color: colors.mutedForeground }]}>
          {protectionActive ? "All systems operational" : "Protection is disabled"}
        </Text>
        <TouchableOpacity
          onPress={toggleProtection}
          style={[styles.toggleBtn, { backgroundColor: protectionActive ? colors.muted : colors.primary }]}
          activeOpacity={0.75}
        >
          <Text style={[styles.toggleBtnText, { color: protectionActive ? colors.mutedForeground : colors.primaryForeground }]}>
            {protectionActive ? "Disable Protection" : "Enable Protection"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        {statCards.map(card => (
          <View key={card.label} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name={card.icon} size={20} color={card.color} />
            <Text style={[styles.statValue, { color: colors.foreground }]}>{card.value}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{card.label}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Network Traffic</Text>
        <View style={styles.trafficRow}>
          <View style={styles.trafficItem}>
            <Feather name="arrow-down-circle" size={20} color={colors.primary} />
            <View style={styles.trafficText}>
              <Text style={[styles.trafficValue, { color: colors.foreground }]}>{formatBytes(totalTrafficIn)}</Text>
              <Text style={[styles.trafficLabel, { color: colors.mutedForeground }]}>Download</Text>
            </View>
          </View>
          <View style={[styles.trafficDivider, { backgroundColor: colors.border }]} />
          <View style={styles.trafficItem}>
            <Feather name="arrow-up-circle" size={20} color={colors.accent} />
            <View style={styles.trafficText}>
              <Text style={[styles.trafficValue, { color: colors.foreground }]}>{formatBytes(totalTrafficOut)}</Text>
              <Text style={[styles.trafficLabel, { color: colors.mutedForeground }]}>Upload</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent Threats</Text>
        {threats.slice(0, 3).map(threat => {
          const severityColor = threat.severity === "critical" ? colors.destructive
            : threat.severity === "high" ? colors.warning
            : threat.severity === "medium" ? "#f59e0b"
            : colors.mutedForeground;
          return (
            <View key={threat.id} style={[styles.threatRow, { borderBottomColor: colors.border }]}>
              <View style={[styles.severityDot, { backgroundColor: severityColor }]} />
              <View style={styles.threatInfo}>
                <Text style={[styles.threatType, { color: colors.foreground }]}>{threat.type}</Text>
                <Text style={[styles.threatSource, { color: colors.mutedForeground }]} numberOfLines={1}>{threat.sourceIp}</Text>
              </View>
              <View style={[styles.threatBadge, {
                backgroundColor: threat.status === "blocked" ? colors.muted
                  : threat.status === "active" ? `${colors.destructive}20`
                  : `${colors.success}20`,
              }]}>
                <Text style={[styles.threatBadgeText, {
                  color: threat.status === "blocked" ? colors.mutedForeground
                    : threat.status === "active" ? colors.destructive
                    : colors.success,
                }]}>
                  {threat.status}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  greeting: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 2 },
  deviceName: { fontSize: 20, fontFamily: "Inter_700Bold" },
  statusDot: { width: 12, height: 12, borderRadius: 6 },
  shieldSection: { alignItems: "center", marginBottom: 32, paddingHorizontal: 20 },
  shieldContainer: { width: 160, height: 160, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  shieldInner: { width: 120, height: 120, borderRadius: 60, overflow: "hidden" },
  shieldGradient: { flex: 1, alignItems: "center", justifyContent: "center" },
  shieldLabel: { fontSize: 18, fontFamily: "Inter_700Bold", letterSpacing: 3, marginBottom: 6 },
  shieldSub: { fontSize: 14, fontFamily: "Inter_400Regular", marginBottom: 16 },
  toggleBtn: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20 },
  toggleBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  statsRow: { flexDirection: "row", paddingHorizontal: 16, gap: 10, marginBottom: 16 },
  statCard: {
    flex: 1, alignItems: "center", paddingVertical: 14, borderRadius: 12,
    borderWidth: 1, gap: 4,
  },
  statValue: { fontSize: 22, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Inter_500Medium" },
  section: {
    marginHorizontal: 16, marginBottom: 16, borderRadius: 14,
    borderWidth: 1, padding: 16,
  },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", marginBottom: 14 },
  trafficRow: { flexDirection: "row", alignItems: "center" },
  trafficItem: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12 },
  trafficText: {},
  trafficValue: { fontSize: 18, fontFamily: "Inter_700Bold" },
  trafficLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  trafficDivider: { width: 1, height: 40, marginHorizontal: 12 },
  threatRow: {
    flexDirection: "row", alignItems: "center", paddingVertical: 10,
    borderBottomWidth: 1, gap: 10,
  },
  severityDot: { width: 8, height: 8, borderRadius: 4 },
  threatInfo: { flex: 1 },
  threatType: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  threatSource: { fontSize: 12, fontFamily: "Inter_400Regular" },
  threatBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  threatBadgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold", textTransform: "capitalize" },
});
