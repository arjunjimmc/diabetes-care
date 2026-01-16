import React, { useState, useCallback, useEffect } from "react";
import { View, StyleSheet, Image, Pressable, Switch, Alert, Linking } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import {
  getUserProfile,
  setUserProfile,
  getStreaks,
  resetAllData,
  type UserProfile,
  type StreakData,
} from "@/lib/storage";

const defaultAvatar = require("../../assets/images/avatar-default.png");

interface SettingRowProps {
  icon: string;
  title: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
  onPress?: () => void;
  destructive?: boolean;
}

function SettingRow({
  icon,
  title,
  subtitle,
  rightElement,
  onPress,
  destructive,
}: SettingRowProps) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.settingRow,
        pressed && onPress && { opacity: 0.7 },
      ]}
      disabled={!onPress}
    >
      <View
        style={[
          styles.settingIcon,
          { backgroundColor: destructive ? theme.error + "20" : theme.backgroundSecondary },
        ]}
      >
        <Feather
          name={icon as any}
          size={18}
          color={destructive ? theme.error : theme.primary}
        />
      </View>
      <View style={styles.settingContent}>
        <ThemedText
          type="body"
          style={{ color: destructive ? theme.error : theme.text }}
        >
          {title}
        </ThemedText>
        {subtitle ? (
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
      {rightElement}
      {onPress && !rightElement ? (
        <Feather name="chevron-right" size={20} color={theme.textSecondary} />
      ) : null}
    </Pressable>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme, isDark } = useTheme();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [streaks, setStreaks] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [userProfile, userStreaks] = await Promise.all([
        getUserProfile(),
        getStreaks(),
      ]);
      setProfile(userProfile);
      setStreaks(userStreaks);
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggleNotifications = async (value: boolean) => {
    if (!profile) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const updatedProfile = { ...profile, notificationsEnabled: value };
    setProfile(updatedProfile);
    await setUserProfile(updatedProfile);
  };

  const handleResetData = () => {
    Alert.alert(
      "Reset All Data",
      "This will erase all your progress, habits, and rewards. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            await resetAllData();
            await loadData();
          },
        },
      ]
    );
  };

  if (loading || !profile) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.backgroundRoot }]}>
        <View style={styles.loadingContent} />
      </View>
    );
  }

  return (
    <KeyboardAwareScrollViewCompat
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.contentContainer,
        {
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: tabBarHeight + Spacing.xl,
        },
      ]}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
    >
      {/* Avatar Section */}
      <View style={styles.avatarSection}>
        <Pressable style={styles.avatarContainer}>
          <Image source={defaultAvatar} style={styles.avatar} resizeMode="cover" />
          <View style={[styles.editBadge, { backgroundColor: theme.primary }]}>
            <Feather name="camera" size={14} color={theme.backgroundDefault} />
          </View>
        </Pressable>
        <ThemedText type="h2" style={[styles.name, { color: theme.text }]}>
          {profile.name}
        </ThemedText>
        <ThemedText type="body" style={{ color: theme.textSecondary }}>
          Taking care of yourself every day
        </ThemedText>
      </View>

      {/* Stats Card */}
      <View
        style={[
          styles.statsCard,
          {
            backgroundColor: theme.backgroundDefault,
            shadowColor: theme.shadowColor,
            ...Shadows.card,
          },
        ]}
      >
        <View style={styles.stat}>
          <ThemedText type="h2" style={{ color: theme.primary }}>
            {streaks?.currentStreak || 0}
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Current Streak
          </ThemedText>
        </View>
        <View style={[styles.statDivider, { backgroundColor: theme.taskPending }]} />
        <View style={styles.stat}>
          <ThemedText type="h2" style={{ color: theme.primary }}>
            {streaks?.longestStreak || 0}
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Best Streak
          </ThemedText>
        </View>
        <View style={[styles.statDivider, { backgroundColor: theme.taskPending }]} />
        <View style={styles.stat}>
          <ThemedText type="h2" style={{ color: theme.primary }}>
            {streaks?.totalCompletedDays || 0}
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Total Days
          </ThemedText>
        </View>
      </View>

      {/* Settings Section */}
      <View style={styles.section}>
        <ThemedText type="h4" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          Preferences
        </ThemedText>
        <View
          style={[
            styles.settingsCard,
            {
              backgroundColor: theme.backgroundDefault,
              shadowColor: theme.shadowColor,
              ...Shadows.card,
            },
          ]}
        >
          <SettingRow
            icon="bell"
            title="Notifications"
            subtitle="Daily reminders for your habits"
            rightElement={
              <Switch
                value={profile.notificationsEnabled}
                onValueChange={handleToggleNotifications}
                trackColor={{ false: theme.taskPending, true: theme.primary }}
                thumbColor={theme.backgroundDefault}
                ios_backgroundColor={theme.taskPending}
              />
            }
          />
          <View style={[styles.divider, { backgroundColor: theme.backgroundSecondary }]} />
          <SettingRow
            icon={isDark ? "moon" : "sun"}
            title="Appearance"
            subtitle={isDark ? "Dark mode" : "Light mode"}
          />
        </View>
      </View>

      {/* Data Section */}
      <View style={styles.section}>
        <ThemedText type="h4" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          Data
        </ThemedText>
        <View
          style={[
            styles.settingsCard,
            {
              backgroundColor: theme.backgroundDefault,
              shadowColor: theme.shadowColor,
              ...Shadows.card,
            },
          ]}
        >
          <SettingRow
            icon="download"
            title="Export Data"
            subtitle="Download your progress"
            onPress={() => {}}
          />
          <View style={[styles.divider, { backgroundColor: theme.backgroundSecondary }]} />
          <SettingRow
            icon="trash-2"
            title="Reset All Data"
            subtitle="Start fresh"
            onPress={handleResetData}
            destructive
          />
        </View>
      </View>

      {/* App Info */}
      <View style={[styles.footer, { backgroundColor: theme.primary }]}>
        <ThemedText type="small" style={{ color: "#fff", textAlign: "center", opacity: 0.9 }}>
          Diabetes Care v1.0.0
        </ThemedText>
        <View style={styles.brandingContainer}>
          <ThemedText type="body" style={[styles.brandingText, { color: "#fff" }]}>
            Made for your good health
          </ThemedText>
          <Pressable 
            onPress={() => Linking.openURL("https://www.digitalsamvaad.in")}
            style={({ pressed }) => [pressed && { opacity: 0.7 }]}
          >
            <ThemedText type="h3" style={styles.brandingCompany}>
              by Digital Samvaad
            </ThemedText>
          </Pressable>
        </View>
      </View>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: Spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContent: {
    width: 40,
    height: 40,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  avatarContainer: {
    position: "relative",
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: Spacing.avatarSize,
    height: Spacing.avatarSize,
    borderRadius: BorderRadius.full,
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    fontFamily: "Nunito_700Bold",
    marginBottom: Spacing.xs,
  },
  statsCard: {
    flexDirection: "row",
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing["2xl"],
  },
  stat: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    height: "100%",
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontFamily: "Nunito_700Bold",
    marginBottom: Spacing.md,
    marginLeft: Spacing.xs,
    textTransform: "uppercase",
    fontSize: 12,
    letterSpacing: 1,
  },
  settingsCard: {
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  settingContent: {
    flex: 1,
  },
  divider: {
    height: 1,
    marginHorizontal: Spacing.lg,
  },
  footer: {
    marginTop: Spacing.xl,
    gap: Spacing.xs,
    alignItems: "center",
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginHorizontal: -Spacing.lg,
    marginBottom: Spacing.lg,
  },
  brandingContainer: {
    alignItems: "center",
    marginTop: Spacing.sm,
    gap: 4,
  },
  brandingText: {
    fontFamily: "Nunito_400Regular",
    fontSize: 14,
    color: "#fff",
  },
  brandingCompany: {
    fontFamily: "Nunito_700Bold",
    fontSize: 18,
    color: "#fff",
    textDecorationLine: "underline",
  },
});
