import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    if (!email.trim()) { setError("Enter your email address"); return; }
    if (password.length < 4) { setError("Password must be at least 4 characters"); return; }
    setLoading(true);
    const ok = await login(email, password);
    setLoading(false);
    if (ok) {
      router.replace("/(tabs)");
    } else {
      setError("Invalid email or password");
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 32 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoSection}>
          <View style={styles.iconOuter}>
            <LinearGradient
              colors={["#0066ff", "#00c2ff"]}
              style={styles.iconGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <MaterialCommunityIcons name="shield-check" size={42} color="#fff" />
            </LinearGradient>
          </View>
          <Text style={[styles.appName, { color: colors.foreground }]}>SecureHome</Text>
          <Text style={[styles.tagline, { color: colors.mutedForeground }]}>
            Smart network protection for your home
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Sign in</Text>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Email</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.muted, borderColor: error && !email ? colors.destructive : colors.border }]}>
              <Feather name="mail" size={17} color={colors.mutedForeground} />
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                placeholder="you@example.com"
                placeholderTextColor={colors.mutedForeground}
                value={email}
                onChangeText={t => { setEmail(t); setError(""); }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Password</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.muted, borderColor: error && email && password.length < 4 ? colors.destructive : colors.border }]}>
              <Feather name="lock" size={17} color={colors.mutedForeground} />
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                placeholder="••••••••"
                placeholderTextColor={colors.mutedForeground}
                value={password}
                onChangeText={t => { setPassword(t); setError(""); }}
                secureTextEntry={!showPassword}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity onPress={() => setShowPassword(s => !s)} hitSlop={8}>
                <Feather name={showPassword ? "eye-off" : "eye"} size={17} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
          </View>

          {!!error && (
            <View style={[styles.errorBox, { backgroundColor: `${colors.destructive}15` }]}>
              <Feather name="alert-circle" size={14} color={colors.destructive} />
              <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.loginBtn, { opacity: loading ? 0.8 : 1 }]}
            onPress={handleLogin}
            activeOpacity={0.85}
            disabled={loading}
          >
            <LinearGradient
              colors={["#0066ff", "#00c2ff"]}
              style={styles.loginGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.loginBtnText}>Sign in</Text>
              }
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.forgotBtn} activeOpacity={0.7}>
            <Text style={[styles.forgotText, { color: colors.primary }]}>Forgot password?</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Feather name="lock" size={13} color={colors.mutedForeground} />
          <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
            Secured with end-to-end encryption
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 24, justifyContent: "center" },
  logoSection: { alignItems: "center", marginBottom: 36 },
  iconOuter: { width: 88, height: 88, borderRadius: 24, overflow: "hidden", marginBottom: 16 },
  iconGradient: { flex: 1, alignItems: "center", justifyContent: "center" },
  appName: { fontSize: 28, fontFamily: "Inter_700Bold", marginBottom: 6 },
  tagline: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
  card: {
    borderRadius: 20, borderWidth: 1,
    padding: 24, gap: 16,
  },
  cardTitle: { fontSize: 20, fontFamily: "Inter_700Bold", marginBottom: 4 },
  field: { gap: 6 },
  label: { fontSize: 13, fontFamily: "Inter_500Medium" },
  inputWrapper: {
    flexDirection: "row", alignItems: "center",
    borderWidth: 1, borderRadius: 12,
    paddingHorizontal: 14, gap: 10, height: 50,
  },
  input: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  errorBox: {
    flexDirection: "row", alignItems: "center",
    gap: 7, padding: 10, borderRadius: 10,
  },
  errorText: { fontSize: 13, fontFamily: "Inter_500Medium", flex: 1 },
  loginBtn: { borderRadius: 14, overflow: "hidden", marginTop: 4 },
  loginGradient: { height: 52, alignItems: "center", justifyContent: "center" },
  loginBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },
  forgotBtn: { alignItems: "center" },
  forgotText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  footer: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 6, marginTop: 32,
  },
  footerText: { fontSize: 12, fontFamily: "Inter_400Regular" },
});
