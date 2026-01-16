import React, { useState, useCallback, useEffect } from "react";
import { View, FlatList, StyleSheet, RefreshControl, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { StreakCounter } from "@/components/StreakCounter";
import { RewardItem } from "@/components/RewardItem";
import { EmptyState } from "@/components/EmptyState";
import { ShareAchievementModal } from "@/components/ShareAchievementModal";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { getRewards, getStreaks, getPoints, type Reward, type StreakData, type PointsData } from "@/lib/storage";

// Locked rewards configuration
const LOCKED_REWARDS = [
  { type: "flower-1" as const, requirement: "7-day streak", id: "locked-1" },
  { type: "flower-2" as const, requirement: "30-day streak", id: "locked-2" },
  { type: "gem" as const, requirement: "7 perfect days", id: "locked-3" },
];

export default function RewardsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();

  const [rewards, setRewards] = useState<Reward[]>([]);
  const [streaks, setStreaks] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastCompletedDate: null,
    totalCompletedDays: 0,
  });
  const [points, setPoints] = useState<PointsData | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [userRewards, userStreaks, userPoints] = await Promise.all([
        getRewards(),
        getStreaks(),
        getPoints(),
      ]);
      setRewards(userRewards);
      setStreaks(userStreaks);
      setPoints(userPoints);
    } catch (error) {
      console.error("Error loading rewards:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  // Get remaining locked rewards (ones not yet unlocked)
  const lockedRewards = LOCKED_REWARDS.filter(
    (locked) => !rewards.find((r) => r.requirement === locked.requirement)
  );

  // Combine unlocked and locked rewards for display
  const allRewardsForDisplay = [
    ...rewards.map((r) => ({ ...r, locked: false })),
    ...lockedRewards.map((r) => ({ ...r, locked: true, name: r.requirement })),
  ];

  const handleSharePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowShareModal(true);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Streak Counter */}
      <StreakCounter streaks={streaks} />

      {/* Share Button */}
      <Pressable
        style={[styles.shareButton, { backgroundColor: theme.secondary }]}
        onPress={handleSharePress}
      >
        <Feather name="share-2" size={18} color="#fff" />
        <ThemedText type="h4" style={styles.shareButtonText}>
          Share Your Progress
        </ThemedText>
      </Pressable>

      {/* Section Header */}
      {allRewardsForDisplay.length > 0 ? (
        <View style={styles.sectionHeader}>
          <ThemedText type="h3" style={{ color: theme.text }}>
            Your Garden
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {rewards.length} unlocked
          </ThemedText>
        </View>
      ) : null}
    </View>
  );

  const renderEmpty = () => (
    <EmptyState
      type="rewards"
      title="Start your garden"
      message="Complete your daily habits to grow your collection of care gems and flowers!"
    />
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.backgroundRoot }]}>
        <View style={styles.loadingContent} />
      </View>
    );
  }

  return (
    <>
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <FlatList
          style={styles.list}
          contentContainerStyle={[
            styles.contentContainer,
            {
              paddingTop: headerHeight + Spacing.xl,
              paddingBottom: tabBarHeight + Spacing.xl,
            },
            allRewardsForDisplay.length === 0 && styles.emptyContainer,
          ]}
          scrollIndicatorInsets={{ bottom: insets.bottom }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.primary}
            />
          }
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          data={allRewardsForDisplay}
          keyExtractor={(item) => item.id}
          numColumns={3}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) =>
            item.locked ? (
              <RewardItem
                locked
                lockedType={item.type}
                lockedRequirement={item.name}
              />
            ) : (
              <RewardItem reward={item as Reward} />
            )
          }
        />
      </View>

      <ShareAchievementModal
        visible={showShareModal}
        streakCount={streaks.currentStreak}
        totalPoints={points?.totalPoints || 0}
        rewardsCount={rewards.length}
        onClose={() => setShowShareModal(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: Spacing.lg,
  },
  emptyContainer: {
    flexGrow: 1,
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
  header: {
    gap: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  row: {
    justifyContent: "flex-start",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  shareButtonText: {
    color: "#fff",
    fontFamily: "Nunito_700Bold",
  },
});
