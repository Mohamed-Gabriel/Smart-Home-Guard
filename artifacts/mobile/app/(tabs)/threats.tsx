import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { type Threat, type ThreatSeverity, useSecurity } from "@/context/SecurityContext";
import { useColors } from "@/hooks/useColors";

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function severityColor(sev: ThreatSeverity, colors: ReturnType<typeof useColors>): string {
  switch (sev) {
    case "critical": return colors.destructive;
    case "high": return colors.warning;
    case "medium": return "#f59e0b";
    default: return colors.mutedForeground;
  }
}

function ThreatCard({ threat }: { threat: Threat }) {
  const colors = useColors();
  const { dismissThreat, blockThreatSource } = useSecurity();
  const [expanded, setExpanded] = useState(false);

  const sevColor = severityColor(threat.severity, colors);
  const isActive = threat.status === "active";

  return (
    <TouchableOpacity
      onPress={() => setExpanded(e => !e)}
      activeOpacity={0.85}
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: isActive ? `${sevColor}50` : colors.border,
          borderLeftColor: sevColor,
          borderLeftWidth: 3,
        }
      ]}
    >
      <View style={styles.cardTop}>
        <View style={styles.cardLeft}>
          <View style={styles.typeRow}>
            <Text style={[styles.severity, { color: sevColor }]}>{threat.severity.toUpperCase()}</Text>
            <Text style={[styles.typeDot, { color: colors.mutedForeground }]}>·</Text>
            <Text style={[styles.threatType, { color: colors.foreground }]}>{threat.type}</Text>
          </View>
          <Text style={[styles.time, { color: colors.mutedForeground }]}>{timeAgo(threat.timestamp)}</Text>
        </View>
        <View style={[
          styles.statusBadge,
          {
            backgroundColor: isActive
              ? `${colors.destructive}20`
              : threat.status === "blocked"
              ? `${colors.primary}15`
              : `${colors.success}15`,
          }
        ]}>
          <Text style={[styles.statusText, {
            color: isActive ? colors.destructive : threat.status === "blocked" ? colors.primary : colors.success,
          }]}>
            {threat.status}
          </Text>
        </View>
      </View>

      <Text style={[styles.description, { color: colors.mutedForeground }]} numberOfLines={expanded ? undefined : 2}>
        {threat.description}
      </Text>

      <View style={styles.ipRow}>
        <Feather name="arrow-right" size={12} color={colors.mutedForeground} />
        <Text style={[styles.ip, { color: colors.mutedForeground }]}>{threat.sourceIp}</Text>
        <Feather name="arrow-right" size={12} color={colors.mutedForeground} />
        <Text style={[styles.ip, { color: colors.mutedForeground }]}>{threat.targetIp}</Text>
      </View>

      {expanded && isActive && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: `${colors.destructive}15`, borderColor: `${colors.destructive}30` }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              blockThreatSource(threat.id);
            }}
            activeOpacity={0.75}
          >
            <Feather name="shield-off" size={14} color={colors.destructive} />
            <Text style={[styles.actionText, { color: colors.destructive }]}>Block Source</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.muted, borderColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              dismissThreat(threat.id);
            }}
            activeOpacity={0.75}
          >
            <Feather name="check" size={14} color={colors.mutedForeground} />
            <Text style={[styles.actionText, { color: colors.mutedForeground }]}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}

type FilterType = "all" | "active" | "blocked" | "resolved";

export default function ThreatsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { threats } = useSecurity();
  const [filter, setFilter] = useState<FilterType>("all");
  const [severityFilter, setSeverityFilter] = useState<ThreatSeverity | "all">("all");

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  let filtered = threats.filter(t => filter === "all" ? true : t.status === filter);
  if (severityFilter !== "all") filtered = filtered.filter(t => t.severity === severityFilter);

  const activeCount = threats.filter(t => t.status === "active").length;

  const statusFilters: { key: FilterType; label: string }[] = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "blocked", label: "Blocked" },
    { key: "resolved", label: "Resolved" },
  ];

  const sevFilters: { key: ThreatSeverity | "all"; label: string }[] = [
    { key: "all", label: "Any" },
    { key: "critical", label: "Critical" },
    { key: "high", label: "High" },
    { key: "medium", label: "Medium" },
    { key: "low", label: "Low" },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 16 }]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.title, { color: colors.foreground }]}>Threat Alerts</Text>
          {activeCount > 0 && (
            <View style={[styles.activeCount, { backgroundColor: colors.destructive }]}>
              <Text style={styles.activeCountText}>{activeCount}</Text>
            </View>
          )}
        </View>
        <Text style={[styles.total, { color: colors.mutedForeground }]}>{threats.length} total</Text>
      </View>

      <View style={styles.filterSection}>
        <FlatList
          data={statusFilters}
          horizontal
          keyExtractor={i => i.key}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
          renderItem={({ item: f }) => (
            <TouchableOpacity
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
          )}
        />
        <FlatList
          data={sevFilters}
          horizontal
          keyExtractor={i => i.key}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
          renderItem={({ item: f }) => {
            const sc = f.key !== "all" ? severityColor(f.key as ThreatSeverity, colors) : colors.mutedForeground;
            const isActive = severityFilter === f.key;
            return (
              <TouchableOpacity
                onPress={() => setSeverityFilter(f.key)}
                style={[styles.filterBtn, {
                  backgroundColor: isActive ? `${sc}25` : colors.muted,
                  borderColor: isActive ? sc : colors.border,
                }]}
                activeOpacity={0.75}
              >
                <Text style={[styles.filterText, { color: isActive ? sc : colors.mutedForeground }]}>{f.label}</Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <ThreatCard threat={item} />}
        contentContainerStyle={[styles.list, { paddingBottom: Platform.OS === "web" ? 100 : 120 }]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!!filtered.length}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="shield" size={40} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No threats found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20, paddingBottom: 12,
    flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between",
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { fontSize: 26, fontFamily: "Inter_700Bold" },
  activeCount: {
    width: 22, height: 22, borderRadius: 11,
    alignItems: "center", justifyContent: "center",
  },
  activeCountText: { color: "#fff", fontSize: 12, fontFamily: "Inter_700Bold" },
  total: { fontSize: 14, fontFamily: "Inter_400Regular", marginBottom: 4 },
  filterSection: { gap: 6, marginBottom: 8 },
  filterRow: { paddingHorizontal: 16, gap: 8 },
  filterBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 18, borderWidth: 1 },
  filterText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  list: { paddingHorizontal: 16, gap: 10 },
  card: {
    borderRadius: 14, borderWidth: 1,
    padding: 14, gap: 8,
  },
  cardTop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  cardLeft: { gap: 2 },
  typeRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  severity: { fontSize: 11, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  typeDot: { fontSize: 14 },
  threatType: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  time: { fontSize: 12, fontFamily: "Inter_400Regular" },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusText: { fontSize: 11, fontFamily: "Inter_600SemiBold", textTransform: "capitalize" },
  description: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  ipRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  ip: { fontSize: 11, fontFamily: "Inter_400Regular" },
  actions: { flexDirection: "row", gap: 10, marginTop: 4 },
  actionBtn: {
    flex: 1, flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 6, padding: 9,
    borderRadius: 9, borderWidth: 1,
  },
  actionText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  empty: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 16, fontFamily: "Inter_500Medium" },
});
