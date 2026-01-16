import React, { useState, useCallback, useEffect } from "react";
import { View, FlatList, StyleSheet, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { HabitCard } from "@/components/HabitCard";
import { AddHabitButton } from "@/components/AddHabitButton";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import { getHabits, updateHabit, type Habit } from "@/lib/storage";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function HabitsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const [habits, setHabits] = useState<Habit[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const allHabits = await getHabits();
      setHabits(allHabits);
    } catch (error) {
      console.error("Error loading habits:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reload when screen comes back into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadData();
    });
    return unsubscribe;
  }, [navigation, loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const handleToggleEnabled = async (id: string, enabled: boolean) => {
    // Optimistic update
    setHabits((prev) =>
      prev.map((h) => (h.id === id ? { ...h, enabled } : h))
    );

    try {
      await updateHabit(id, { enabled });
    } catch (error) {
      // Revert on error
      setHabits((prev) =>
        prev.map((h) => (h.id === id ? { ...h, enabled: !enabled } : h))
      );
    }
  };

  const handleHabitPress = (habit: Habit) => {
    navigation.navigate("EditHabit", { habit });
  };

  const handleAddHabit = () => {
    navigation.navigate("AddHabit");
  };

  const renderFooter = () => (
    <View style={styles.footer}>
      <AddHabitButton onPress={handleAddHabit} />
    </View>
  );

  const renderEmpty = () => (
    <EmptyState
      type="habits"
      title="Start your journey"
      message="Create your first habit to begin tracking your daily health routine."
      action={
        <Button onPress={handleAddHabit}>Add your first habit</Button>
      }
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
    <FlatList
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.contentContainer,
        {
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: tabBarHeight + Spacing.xl,
        },
        habits.length === 0 && styles.emptyContainer,
      ]}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.primary}
        />
      }
      data={habits}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={renderEmpty}
      ListFooterComponent={habits.length > 0 ? renderFooter : null}
      renderItem={({ item }) => (
        <HabitCard
          habit={item}
          onToggleEnabled={handleToggleEnabled}
          onPress={handleHabitPress}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
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
  footer: {
    marginTop: Spacing.lg,
  },
});
