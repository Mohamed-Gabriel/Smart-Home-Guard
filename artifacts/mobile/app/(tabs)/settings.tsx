import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useSecurity } from "@/context/SecurityContext";
import { useColors } from "@/hooks/useColors";

function SettingRow({
  icon,
  label,
  description,
  value,
  onToggle,
  iconColor,
}: {
  icon: string;
  label: string;
  description: string;
  value: boolean;
  onToggle: () => void;
  iconColor?: string;
}) {
  const colors = useColors();
  const ic = iconColor ?? colors.primary;
  return (
    <View style={[styles.row, { borderBottomColor: colors.border }]}>
      <View style={[styles.iconWrap, { backgroundColor: `${ic}15` }]}>
        <Feather name={icon as any} size={18} color={ic} />
      </View>
      <View style={styles.rowContent}>
        <Text style={[styles.rowLabel, { color: colors.foreground }]}>{label}</Text>
        <Text style={[styles.rowDesc, { color: colors.mutedForeground }]}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: `${colors.mutedForeground}30`, true: `${ic}40` }}
        thumbColor={value ? ic : colors.mutedForeground}
        ios_backgroundColor={`${colors.mutedForeground}30`}
      />
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  const colors = useColors();
  return (
    <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
      <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: colors.foreground }]}>{value}</Text>
    </View>
  );
}

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { settings, updateSettings } = useSecurity();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: Platform.OS === "web" ? 100 : 120 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerSection}>
        <Text style={[styles.title, { color: colors.foreground }]}>Settings</Text>
      </View>

      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>PROTECTION</Text>
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SettingRow
          icon="eye"
          label="Intrusion Detection (IDS)"
          description="Monitor traffic for suspicious patterns"
          value={settings.idsEnabled}
          onToggle={() => updateSettings({ idsEnabled: !settings.idsEnabled })}
        />
        <SettingRow
          icon="shield"
          label="Intrusion Prevention (IPS)"
          description="Automatically block detected attacks"
          value={settings.ipsEnabled}
          onToggle={() => updateSettings({ ipsEnabled: !settings.ipsEnabled })}
        />
        <SettingRow
          icon="zap"
          label="Auto-Block Threats"
          description="Block malicious IPs without confirmation"
          value={settings.autoBlock}
          onToggle={() => updateSettings({ autoBlock: !settings.autoBlock })}
          iconColor={colors.warning}
        />
        <SettingRow
          icon="search"
          label="Deep Packet Inspection"
          description="Analyze packet payloads (higher CPU usage)"
          value={settings.deepInspection}
          onToggle={() => updateSettings({ deepInspection: !settings.deepInspection })}
          iconColor={colors.accent}
        />
      </View>

      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>ALERTS</Text>
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SettingRow
          icon="bell"
          label="Push Notifications"
          description="Receive alerts for critical threats"
          value={settings.notifications}
          onToggle={() => updateSettings({ notifications: !settings.notifications })}
          iconColor={colors.accent}
        />
      </View>

      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>DEVICE INFO</Text>
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <InfoRow label="Device Name" value={settings.deviceName} />
        <InfoRow label="WAN Interface" value="eth0 (ISP Router)" />
        <InfoRow label="LAN Interface" value="eth1 (192.168.1.0/24)" />
        <InfoRow label="Firmware" value="pfSense 2.7.2" />
        <InfoRow label="IDS Engine" value="Suricata 7.0" />
        <InfoRow label="Rules Updated" value="Today, 03:00 AM" />
        <InfoRow label="Uptime" value="12 days, 4 hrs" />
      </View>

      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>NETWORK</Text>
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <InfoRow label="External IP" value="203.0.113.1" />
        <InfoRow label="Gateway IP" value="192.168.1.1" />
        <InfoRow label="DNS Servers" value="1.1.1.1, 8.8.8.8" />
        <InfoRow label="DHCP Leases" value="6 active" />
      </View>

      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>ABOUT</Text>
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <InfoRow label="App Version" value="1.0.0" />
        <InfoRow label="Build" value="2025.05" />
        <InfoRow label="Security Rules" value="45,823 active rules" />
        <InfoRow label="Threat Database" value="CVE 2025-05-01" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerSection: { paddingHorizontal: 20, paddingBottom: 16 },
  title: { fontSize: 26, fontFamily: "Inter_700Bold" },
  sectionLabel: {
    fontSize: 12, fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.8, paddingHorizontal: 20, paddingBottom: 6, paddingTop: 4,
  },
  section: { marginHorizontal: 16, marginBottom: 20, borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  row: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 14, paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth, gap: 12,
  },
  iconWrap: { width: 36, height: 36, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  rowContent: { flex: 1 },
  rowLabel: { fontSize: 15, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  rowDesc: { fontSize: 12, fontFamily: "Inter_400Regular" },
  infoRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 14, paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  infoLabel: { fontSize: 14, fontFamily: "Inter_400Regular" },
  infoValue: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
