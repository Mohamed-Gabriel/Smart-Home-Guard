import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export type DeviceType = "phone" | "laptop" | "tv" | "tablet" | "router" | "camera" | "unknown";

export interface Device {
  id: string;
  name: string;
  ip: string;
  mac: string;
  type: DeviceType;
  manufacturer: string;
  blocked: boolean;
  firstSeen: string;
  lastSeen: string;
  bytesIn: number;
  bytesOut: number;
}

export type ThreatSeverity = "critical" | "high" | "medium" | "low";
export type ThreatStatus = "active" | "blocked" | "resolved";

export interface Threat {
  id: string;
  type: string;
  description: string;
  sourceIp: string;
  targetIp: string;
  severity: ThreatSeverity;
  status: ThreatStatus;
  timestamp: string;
  deviceId?: string;
}

interface SecuritySettings {
  idsEnabled: boolean;
  ipsEnabled: boolean;
  autoBlock: boolean;
  deepInspection: boolean;
  notifications: boolean;
  deviceName: string;
}

interface SecurityContextType {
  devices: Device[];
  threats: Threat[];
  settings: SecuritySettings;
  protectionActive: boolean;
  threatsBlockedToday: number;
  toggleDevice: (id: string) => void;
  dismissThreat: (id: string) => void;
  blockThreatSource: (id: string) => void;
  updateSettings: (s: Partial<SecuritySettings>) => void;
  toggleProtection: () => void;
}

const SecurityContext = createContext<SecurityContextType | null>(null);

const MOCK_DEVICES: Device[] = [
  { id: "1", name: "iPhone 15 Pro", ip: "192.168.1.101", mac: "A1:B2:C3:D4:E5:F6", type: "phone", manufacturer: "Apple", blocked: false, firstSeen: "2024-01-10T08:00:00Z", lastSeen: new Date().toISOString(), bytesIn: 1240000000, bytesOut: 320000000 },
  { id: "2", name: "MacBook Pro", ip: "192.168.1.102", mac: "B2:C3:D4:E5:F6:A1", type: "laptop", manufacturer: "Apple", blocked: false, firstSeen: "2024-01-10T08:00:00Z", lastSeen: new Date().toISOString(), bytesIn: 45000000000, bytesOut: 8000000000 },
  { id: "3", name: "Samsung Smart TV", ip: "192.168.1.110", mac: "C3:D4:E5:F6:A1:B2", type: "tv", manufacturer: "Samsung", blocked: false, firstSeen: "2024-01-12T12:00:00Z", lastSeen: new Date().toISOString(), bytesIn: 20000000000, bytesOut: 500000000 },
  { id: "4", name: "iPad Air", ip: "192.168.1.103", mac: "D4:E5:F6:A1:B2:C3", type: "tablet", manufacturer: "Apple", blocked: false, firstSeen: "2024-02-01T09:00:00Z", lastSeen: new Date().toISOString(), bytesIn: 3500000000, bytesOut: 800000000 },
  { id: "5", name: "Ring Doorbell", ip: "192.168.1.120", mac: "E5:F6:A1:B2:C3:D4", type: "camera", manufacturer: "Ring", blocked: false, firstSeen: "2024-01-15T10:00:00Z", lastSeen: new Date().toISOString(), bytesIn: 100000000, bytesOut: 2000000000 },
  { id: "6", name: "Unknown Device", ip: "192.168.1.199", mac: "F6:A1:B2:C3:D4:E5", type: "unknown", manufacturer: "Unknown", blocked: true, firstSeen: "2025-05-04T22:00:00Z", lastSeen: new Date().toISOString(), bytesIn: 50000000, bytesOut: 10000000 },
];

const MOCK_THREATS: Threat[] = [
  { id: "t1", type: "Port Scan", description: "Systematic scan of 1024 ports detected from external IP", sourceIp: "203.0.113.45", targetIp: "192.168.1.1", severity: "high", status: "blocked", timestamp: new Date(Date.now() - 15 * 60000).toISOString() },
  { id: "t2", type: "Brute Force", description: "SSH brute force attack — 847 failed login attempts", sourceIp: "198.51.100.22", targetIp: "192.168.1.102", severity: "critical", status: "blocked", timestamp: new Date(Date.now() - 45 * 60000).toISOString(), deviceId: "2" },
  { id: "t3", type: "Malware Traffic", description: "C2 communication pattern detected — Mirai botnet signature", sourceIp: "192.168.1.199", targetIp: "185.234.219.5", severity: "critical", status: "active", timestamp: new Date(Date.now() - 2 * 60000).toISOString(), deviceId: "6" },
  { id: "t4", type: "DNS Spoofing", description: "Suspicious DNS response from unexpected resolver", sourceIp: "192.168.1.1", targetIp: "8.8.8.8", severity: "medium", status: "resolved", timestamp: new Date(Date.now() - 3 * 3600000).toISOString() },
  { id: "t5", type: "ARP Poisoning", description: "ARP spoofing attempt detected on local segment", sourceIp: "192.168.1.199", targetIp: "192.168.1.102", severity: "high", status: "blocked", timestamp: new Date(Date.now() - 6 * 3600000).toISOString(), deviceId: "6" },
  { id: "t6", type: "Data Exfiltration", description: "Unusual outbound data transfer — 2.1GB in 10 minutes", sourceIp: "192.168.1.120", targetIp: "104.18.45.66", severity: "medium", status: "resolved", timestamp: new Date(Date.now() - 12 * 3600000).toISOString(), deviceId: "5" },
];

const DEFAULT_SETTINGS: SecuritySettings = {
  idsEnabled: true,
  ipsEnabled: true,
  autoBlock: true,
  deepInspection: false,
  notifications: true,
  deviceName: "Home Security Gateway",
};

export function SecurityProvider({ children }: { children: React.ReactNode }) {
  const [devices, setDevices] = useState<Device[]>(MOCK_DEVICES);
  const [threats, setThreats] = useState<Threat[]>(MOCK_THREATS);
  const [settings, setSettings] = useState<SecuritySettings>(DEFAULT_SETTINGS);
  const [protectionActive, setProtectionActive] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem("@security_devices");
        if (stored) setDevices(JSON.parse(stored));
        const storedThreats = await AsyncStorage.getItem("@security_threats");
        if (storedThreats) setThreats(JSON.parse(storedThreats));
        const storedSettings = await AsyncStorage.getItem("@security_settings");
        if (storedSettings) setSettings(JSON.parse(storedSettings));
      } catch {}
    };
    load();
  }, []);

  const toggleDevice = useCallback((id: string) => {
    setDevices(prev => {
      const next = prev.map(d => d.id === id ? { ...d, blocked: !d.blocked } : d);
      AsyncStorage.setItem("@security_devices", JSON.stringify(next));
      return next;
    });
  }, []);

  const dismissThreat = useCallback((id: string) => {
    setThreats(prev => {
      const next = prev.map(t => t.id === id ? { ...t, status: "resolved" as ThreatStatus } : t);
      AsyncStorage.setItem("@security_threats", JSON.stringify(next));
      return next;
    });
  }, []);

  const blockThreatSource = useCallback((id: string) => {
    setThreats(prev => {
      const next = prev.map(t => t.id === id ? { ...t, status: "blocked" as ThreatStatus } : t);
      AsyncStorage.setItem("@security_threats", JSON.stringify(next));
      return next;
    });
  }, []);

  const updateSettings = useCallback((s: Partial<SecuritySettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...s };
      AsyncStorage.setItem("@security_settings", JSON.stringify(next));
      return next;
    });
  }, []);

  const toggleProtection = useCallback(() => {
    setProtectionActive(p => !p);
  }, []);

  const threatsBlockedToday = threats.filter(t => {
    const d = new Date(t.timestamp);
    const now = new Date();
    return d.toDateString() === now.toDateString() && t.status === "blocked";
  }).length;

  return (
    <SecurityContext.Provider value={{
      devices, threats, settings, protectionActive,
      threatsBlockedToday, toggleDevice, dismissThreat,
      blockThreatSource, updateSettings, toggleProtection,
    }}>
      {children}
    </SecurityContext.Provider>
  );
}

export function useSecurity() {
  const ctx = useContext(SecurityContext);
  if (!ctx) throw new Error("useSecurity must be used within SecurityProvider");
  return ctx;
}
