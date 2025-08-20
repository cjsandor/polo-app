/**
 * Profile Screen
 * User profile and settings
 */

import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// Contexts & Hooks
import { useAuthContext } from "../../../../src/contexts/AuthContext";

// Constants
import { COLORS } from "../../../../src/config/constants";

interface ProfileOption {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  iconColor?: string;
  onPress: () => void;
  showArrow?: boolean;
}

export default function ProfileScreen() {
  const { user, profile, signOut } = useAuthContext();
  const router = useRouter();

  const handleSignOut = useCallback(() => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  }, [signOut]);

  const profileOptions: ProfileOption[] = [
    {
      id: "edit-profile",
      title: "Edit Profile",
      subtitle: "Update your information",
      icon: "person-outline",
      onPress: () => router.push("/profile/edit"),
      showArrow: true,
    },
    {
      id: "followed-teams",
      title: "Followed Teams",
      subtitle: "Teams you're following",
      icon: "heart-outline",
      onPress: () => router.push("/profile/followed-teams"),
      showArrow: true,
    },
    {
      id: "notifications",
      title: "Notifications",
      subtitle: "Manage notification preferences",
      icon: "notifications-outline",
      onPress: () => router.push("/profile/notifications"),
      showArrow: true,
    },
    {
      id: "settings",
      title: "Settings",
      subtitle: "App settings and preferences",
      icon: "settings-outline",
      onPress: () => router.push("/profile/settings"),
      showArrow: true,
    },
  ];

  const renderProfileHeader = () => (
    <View style={styles.profileHeader}>
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={40} color={COLORS.PRIMARY} />
        </View>
      </View>

      {/* User Info */}
      <View style={styles.userInfo}>
        <Text style={styles.userName}>
          {profile?.full_name || user?.email || "User"}
        </Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        {profile?.role && (
          <View
            style={[
              styles.roleBadge,
              profile.role === "admin" && styles.adminBadge,
            ]}
          >
            <Text
              style={[
                styles.roleText,
                profile.role === "admin" && styles.adminText,
              ]}
            >
              {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderProfileOption = (option: ProfileOption) => (
    <TouchableOpacity
      key={option.id}
      style={styles.optionRow}
      onPress={option.onPress}
    >
      <View style={styles.optionLeft}>
        <View style={styles.optionIcon}>
          <Ionicons
            name={option.icon as any}
            size={24}
            color={option.iconColor || COLORS.PRIMARY}
          />
        </View>
        <View style={styles.optionText}>
          <Text style={styles.optionTitle}>{option.title}</Text>
          {option.subtitle && (
            <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
          )}
        </View>
      </View>
      {option.showArrow && (
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      )}
    </TouchableOpacity>
  );

  const renderStatsSection = () => (
    <View style={styles.statsSection}>
      <Text style={styles.sectionTitle}>Your Activity</Text>
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Matches Watched</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Teams Followed</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Favorite Players</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderProfileHeader()}
        {renderStatsSection()}

        {/* Profile Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>
          <View style={styles.optionsContainer}>
            {profileOptions.map(renderProfileOption)}
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.optionsContainer}>
            <TouchableOpacity style={styles.optionRow}>
              <View style={styles.optionLeft}>
                <View style={styles.optionIcon}>
                  <Ionicons
                    name="help-circle-outline"
                    size={24}
                    color={COLORS.INFO}
                  />
                </View>
                <View style={styles.optionText}>
                  <Text style={styles.optionTitle}>Help & FAQ</Text>
                  <Text style={styles.optionSubtitle}>
                    Get help and support
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionRow}>
              <View style={styles.optionLeft}>
                <View style={styles.optionIcon}>
                  <Ionicons name="mail-outline" size={24} color={COLORS.INFO} />
                </View>
                <View style={styles.optionText}>
                  <Text style={styles.optionTitle}>Contact Us</Text>
                  <Text style={styles.optionSubtitle}>Send us feedback</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Sign Out */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
          >
            <Ionicons name="log-out-outline" size={24} color={COLORS.ERROR} />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>Polo Match Tracker</Text>
          <Text style={styles.appInfoText}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  content: {
    flex: 1,
  },
  profileHeader: {
    backgroundColor: "#fff",
    padding: 24,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.PRIMARY,
  },
  userInfo: {
    alignItems: "center",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: "#666",
    marginBottom: 12,
  },
  roleBadge: {
    backgroundColor: "#e0e0e0",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  adminBadge: {
    backgroundColor: COLORS.PRIMARY,
  },
  roleText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
  },
  adminText: {
    color: "#fff",
  },
  statsSection: {
    backgroundColor: "#fff",
    marginTop: 12,
    padding: 20,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 12,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.PRIMARY,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  section: {
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  optionsContainer: {
    backgroundColor: "#fff",
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e0e0e0",
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    paddingVertical: 16,
    marginHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.ERROR,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.ERROR,
    marginLeft: 8,
  },
  appInfo: {
    alignItems: "center",
    paddingVertical: 24,
  },
  appInfoText: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
  },
});
