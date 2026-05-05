import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { type Device, type DeviceType, useSecurity } from "@/context/SecurityContext";
import { useColors } from "@/hooks/useColors";

function formatBytes(bytes: number): string {
  if (bytes >= 1e9) return (bytes / 1e9).toFixed(1) + " GB";
  if (bytes >= 1e6) return (bytes / 1e6).toFixed(1) + " MB";
  return (bytes / 1e3).toFixed(1) + " KB";
}

function deviceIcon(type: DeviceType): { name: string; lib: "feather" | "mdi" } {
  switch (type) {
    case "phone": return { name: "smartphone", lib: "feather" };
    case "laptop": return { name: "laptop", lib: "mdi" };
    case "tv": return { name: "television", lib: "mdi" };
    case "tablet": return { name: "tablet", lib: "mdi" };
    case "router": return { name: "router-wireless", lib: "mdi" };
    case "camera": return { name: "camera", lib: "feather" };
    default: return { name: "help-circle", lib: "feather" };
  }
}

function DeviceIcon({ type, color, size = 22 }: { type: DeviceType; color: string; size?: number }) {
  const icon = deviceIcon(type);
  if (icon.lib === "mdi") {
    return <MaterialCommunityIcons name={icon.name as any} size={size} color={color} />;
  }
  return <Feather name={icon.name as any} size={size} color={color} />;
}

function DeviceCard({ device }: { device: Device }) {
  const colors = useColors();
  const { toggleDevice } = useSecurity();

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleDevice(device.id);
  };

  const iconColor = device.blocked ? colors.mutedForeground : colors.primary;
  const lastSeen = new Date(device.lastSeen);
  const minutesAgo = Math.floor((Date.now() - lastSeen.getTime()) / 60000);
  const lastSeenText = minutesAgo < 1 ? "Active now" : minutesAgo < 60 ? `${minutesAgo}m ago` : `${Math.floor(minutesAgo / 60)}h ago`;

  return (
    <View style={[
      styles.card,
      {
        backgroundColor: colors.card,
        borderColor: device.blocked ? `${colors.destructive}30` : colors.border,
        opacity: device.blocked ? 0.75 : 1,
      }
    ]}>
      <View style={[styles.iconWrapper, { backgroundColor: device.blocked ? `${colors.destructive}15` : `${colors.primary}15` }]}>
        <DeviceIcon type={device.type} color={iconColor} size={22} />
      </View>

      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={[styles.deviceName, { color: colors.foreground }]} numberOfLines={1}>{device.name}</Text>
          {device.blocked && (
            <View style={[styles.blockedBadge, { backgroundColor: `${colors.destructive}20` }]}>
              <Text style={[styles.blockedText, { color: colors.destructive }]}>BLOCKED</Text>
            </View>
          )}
        </View>
        <Text style={[styles.manufacturer, { color: colors.mutedForeground }]}>{device.manufacturer}</Text>
        <View style={styles.metaRow}>
          <Text style={[styles.meta, { color: colors.mutedForeground }]}>{device.ip}</Text>
          <Text style={[styles.metaDot, { color: colors.mutedForeground }]}>•</Text>
          <Text style={[styles.meta, { color: colors.mutedForeground }]}>{lastSeenText}</Text>
        </View>
        <View style={styles.trafficRow}>
          <Feather name="arrow-down" size={11} color={colors.primary} />
          <Text style={[styles.trafficText, { color: colors.mutedForeground }]}>{formatBytes(device.bytesIn)}</Text>
          <Feather name="arrow-up" size={11} color={colors.accent} />
          <Text style={[styles.trafficText, { color: colors.mutedForeground }]}>{formatBytes(device.bytesOut)}</Text>
        </View>
      </View>

      <Switch
        value={!device.blocked}
        onValueChange={handleToggle}
        trackColor={{ false: `${colors.destructive}40`, true: `${colors.primary}40` }}
        thumbColor={device.blocked ? colors.destructive : colors.primary}
        ios_backgroundColor={`${colors.destructive}40`}
      />
    </View>
  );
}

export default function DevicesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { devices } = useSecurity();
  const [filter, setFilter] = useState<"all" | "allowed" | "blocked">("all");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const filtered = devices.filter(d =>
    filter === "all" ? true : filter === "blocked" ? d.blocked : !d.blocked
  );

  const filters: { key: typeof filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "allowed", label: "Allowed" },
    { key: "blocked", label: "Blocked" },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 16 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Connected Devices</Text>
        <Text style={[styles.count, { color: colors.mutedForeground }]}>{devices.length} total</Text>
      </View>

      <View style={styles.filterRow}>
        {filters.map(f => (
          <TouchableOpacity
            key={f.key}
            onPress={() => setFilter(f.key)}
            style={[
              styles.filterBtn,
              {
                backgroundColor: filter === f.key ? colors.primary : colors.muted,
                borderColor: filter === f.key ? colors.primary : colors.border,
              }
            ]}
            activeOpacity={0.75}
          >
            <Text style={[styles.filterText, { color: filter === f.key ? colors.primaryForeground : colors.mutedForeground }]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <DeviceCard device={item} />}
        contentContainerStyle={[styles.list, { paddingBottom: Platform.OS === "web" ? 100 : 120 }]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!!filtered.length}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="wifi-off" size={40} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No devices found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 14, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" },
  title: { fontSize: 26, fontFamily: "Inter_700Bold" },
  count: { fontSize: 14, fontFamily: "Inter_400Regular", marginBottom: 4 },
  filterRow: { flexDirection: "row", paddingHorizontal: 16, gap: 8, marginBottom: 12 },
  filterBtn: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  filterText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  list: { paddingHorizontal: 16, gap: 10 },
  card: {
    flexDirection: "row", alignItems: "center", gap: 12,
    padding: 14, borderRadius: 14, borderWidth: 1,
  },
  iconWrapper: { width: 44, height: 44, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  cardContent: { flex: 1 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 2 },
  deviceName: { fontSize: 15, fontFamily: "Inter_600SemiBold", flex: 1 },
  blockedBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  blockedText: { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  manufacturer: { fontSize: 12, fontFamily: "Inter_400Regular", marginBottom: 3 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 3 },
  meta: { fontSize: 11, fontFamily: "Inter_400Regular" },
  metaDot: { fontSize: 11 },
  trafficRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  trafficText: { fontSize: 11, fontFamily: "Inter_400Regular", marginRight: 6 },
  empty: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 16, fontFamily: "Inter_500Medium" },
});
