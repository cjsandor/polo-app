import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { auth, db } from "../../src/services/supabase";
import { useAuthContext } from "../../src/contexts/AuthContext";

export default function SignInScreen() {
  const router = useRouter();
  const { loading: authLoading, isAuthenticated } = useAuthContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect to Home if already signed in
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace("/(app)/(tabs)/matches");
    }
  }, [authLoading, isAuthenticated, router]);

  const handleSignIn = async () => {
    try {
      setLoading(true);
      const { error } = await auth.signIn(email.trim(), password);
      if (error) throw error;
      router.replace("/(app)/(tabs)/matches");
    } catch (e: any) {
      Alert.alert("Sign in failed", e?.message || "Please try again");
    } finally {
      setLoading(false);
    }
  };

  const createTest = async (
    targetEmail: string,
    targetPassword: string,
    role: "admin" | "viewer",
  ) => {
    setLoading(true);
    try {
      const { error: signInError } = await auth.signIn(
        targetEmail,
        targetPassword,
      );
      if (signInError) {
        if (signInError.message?.includes("Invalid login credentials")) {
          const { error: signUpError } = await auth.signUp(
            targetEmail,
            targetPassword,
            { role },
          );
          if (signUpError) {
            Alert.alert("Error", signUpError.message || "Could not sign up");
            return;
          }
        } else {
          Alert.alert("Error", signInError.message || "Sign in failed");
          return;
        }
      }

      const { user, error: userError } = await auth.getUser();
      if (userError || !user) {
        Alert.alert(
          "Error",
          userError?.message || "Could not retrieve authenticated user",
        );
        return;
      }

      const { error: profileError } = await db.profiles.upsert({
        id: user.id,
        role,
      });
      if (profileError) {
        Alert.alert(
          "Error",
          profileError.message || "Could not update profile role",
        );
        return;
      }

      Alert.alert("Success", `Signed in as ${targetEmail}`);
      router.replace("/(app)/(tabs)/matches");
    } catch (e: any) {
      Alert.alert(
        "Error",
        e?.message ||
          "Could not create test account. If email confirmations are required, check your inbox.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign In</Text>

      <View style={styles.field}>
        <Ionicons name="mail-outline" size={18} color="#666" />
        <TextInput
          style={styles.input}
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      <View style={styles.field}>
        <Ionicons name="lock-closed-outline" size={18} color="#666" />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.7 }]}
        onPress={handleSignIn}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Please wait..." : "Sign In"}
        </Text>
      </TouchableOpacity>

      <View style={styles.hr} />

      <Text style={styles.subhead}>Quick setup (dev only)</Text>
      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() =>
          createTest("test.user@example.com", "Test1234!", "viewer")
        }
        disabled={loading}
      >
        <Text style={styles.secondaryText}>Create Test User</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() =>
          createTest("test.admin@example.com", "Test1234!", "admin")
        }
        disabled={loading}
      >
        <Text style={styles.secondaryText}>Create Test Admin</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    alignItems: "stretch",
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#212121",
    textAlign: "center",
    marginBottom: 20,
  },
  field: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f7f7f7",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    marginLeft: 8,
    color: "#333",
  },
  button: {
    backgroundColor: "#1565c0",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
  },
  hr: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 20,
  },
  subhead: {
    textAlign: "center",
    color: "#616161",
    marginBottom: 10,
  },
  secondaryButton: {
    backgroundColor: "#f5f5f5",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  secondaryText: {
    color: "#1565c0",
    fontWeight: "700",
  },
});
