import { Redirect } from "expo-router";
import { useAuth } from "@/context/AuthContext";

export default function Index() {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? <Redirect href="/(tabs)" /> : <Redirect href="/login" />;
}
