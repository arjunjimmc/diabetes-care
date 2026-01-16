import React, { useState, useCallback, useEffect, useRef } from "react";
import { View, FlatList, StyleSheet, RefreshControl, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Companion } from "@/components/Companion";
import { ProgressRing } from "@/components/ProgressRing";
import { TaskCard } from "@/components/TaskCard";
import { RecoveryCard } from "@/components/RecoveryCard";
import { RecoveryPromptCard } from "@/components/RecoveryPromptCard";
import { ReminderModal } from "@/components/ReminderModal";
import { PointsDisplay } from "@/components/PointsDisplay";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import {
  getHabits,
  getCompletedTasksForDate,
  completeTask,
  uncompleteTask,
  getMissedTasksYesterday,
  getUserProfile,
  getGreeting,
  getTodayDateString,
  getPoints,
  addPoints,
  deductPoints,
  recoverPoints,
  getSnoozedTasks,
  snoozeTask,
  clearSnooze,
  type Habit,
  type UserProfile,
  type PointsData,
  type SnoozedTask,
} from "@/lib/storage";

type CompanionMood = "happy" | "encouraging" | "supportive";

interface TaskItem extends Habit {
  isCompleted: boolean;
  isSnoozed: boolean;
  isExpired: boolean;
}

interface SelectedTask {
  id: string;
  name: string;
  icon: string;
  isSnoozed: boolean;
  isExpired: boolean;
}

export default function TodayScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [points, setPoints] = useState<PointsData | null>(null);
  const [missedCount, setMissedCount] = useState(0);
  const [showRecovery, setShowRecovery] = useState(false);
  const [showRecoveryPrompt, setShowRecoveryPrompt] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<SelectedTask | null>(null);
  
  const snoozeCheckInterval = useRef<NodeJS.Timeout | null>(null);
  const todayDate = getTodayDateString();

  const loadData = useCallback(async () => {
    try {
      const [userProfile, habits, completedTasks, missedTasks, pointsData, snoozedTasks] =
        await Promise.all([
          getUserProfile(),
          getHabits(),
          getCompletedTasksForDate(todayDate),
          getMissedTasksYesterday(),
          getPoints(),
          getSnoozedTasks(),
        ]);

      setProfile(userProfile);
      setPoints(pointsData);

      const enabledHabits = habits.filter((h) => h.enabled);
      const now = Date.now();
      
      const taskItems: TaskItem[] = enabledHabits.map((habit) => {
        const snoozeInfo = snoozedTasks.find((s) => s.habitId === habit.id);
        return {
          ...habit,
          isCompleted: completedTasks.some((t) => t.habitId === habit.id),
          isSnoozed: !!snoozeInfo,
          isExpired: snoozeInfo ? now >= snoozeInfo.snoozeUntil : false,
        };
      });

      setTasks(taskItems);
      setMissedCount(missedTasks.length);
      setShowRecovery(missedTasks.length > 0);
      setShowRecoveryPrompt(pointsData.pendingRecovery > 0);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }, [todayDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Check for expired snoozes every 10 seconds
  useEffect(() => {
    snoozeCheckInterval.current = setInterval(() => {
      setTasks((prev) =>
        prev.map((task) => {
          if (task.isSnoozed && !task.isExpired && !task.isCompleted) {
            // Re-check expiration
            getSnoozedTasks().then((snoozed) => {
              const snoozeInfo = snoozed.find((s) => s.habitId === task.id);
              if (snoozeInfo && Date.now() >= snoozeInfo.snoozeUntil) {
                setTasks((current) =>
                  current.map((t) =>
                    t.id === task.id ? { ...t, isExpired: true } : t
                  )
                );
              }
            });
          }
          return task;
        })
      );
    }, 10000);

    return () => {
      if (snoozeCheckInterval.current) {
        clearInterval(snoozeCheckInterval.current);
      }
    };
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const handleTaskPress = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task || task.isCompleted) {
      // Toggle off if already completed
      if (task?.isCompleted) {
        handleUncompleteTask(id);
      }
      return;
    }

    setSelectedTask({
      id: task.id,
      name: task.name,
      icon: task.icon,
      isSnoozed: task.isSnoozed,
      isExpired: task.isExpired,
    });
    setModalVisible(true);
  };

  const handleUncompleteTask = async (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isCompleted: false } : t))
    );
    await uncompleteTask(id, todayDate);
  };

  const handleDoNow = async () => {
    if (!selectedTask) return;
    
    // Complete the task and award points when user confirms they will do it now
    setTasks((prev) =>
      prev.map((t) =>
        t.id === selectedTask.id
          ? { ...t, isCompleted: true, isSnoozed: false, isExpired: false }
          : t
      )
    );

    await completeTask(selectedTask.id, todayDate);
    await clearSnooze(selectedTask.id);
    
    // Award points for completing task
    const newPoints = await addPoints(10);
    setPoints(newPoints);

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setModalVisible(false);
    setSelectedTask(null);
  };

  const handleSnooze = async () => {
    if (!selectedTask) return;

    await snoozeTask(selectedTask.id, 5); // 5 minutes
    
    setTasks((prev) =>
      prev.map((t) =>
        t.id === selectedTask.id
          ? { ...t, isSnoozed: true, isExpired: false }
          : t
      )
    );

    setModalVisible(false);
    setSelectedTask(null);
  };

  const handleCompleted = async () => {
    if (!selectedTask) return;

    // Mark task complete
    setTasks((prev) =>
      prev.map((t) =>
        t.id === selectedTask.id
          ? { ...t, isCompleted: true, isSnoozed: false, isExpired: false }
          : t
      )
    );

    await completeTask(selectedTask.id, todayDate);
    await clearSnooze(selectedTask.id);
    
    // Award points
    const newPoints = await addPoints(10);
    setPoints(newPoints);

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setModalVisible(false);
    setSelectedTask(null);
  };

  const handleSkip = async () => {
    if (!selectedTask) return;

    await clearSnooze(selectedTask.id);
    
    setTasks((prev) =>
      prev.map((t) =>
        t.id === selectedTask.id
          ? { ...t, isSnoozed: false, isExpired: false }
          : t
      )
    );

    // Deduct points
    const newPoints = await deductPoints(5);
    setPoints(newPoints);
    setShowRecoveryPrompt(true);

    setModalVisible(false);
    setSelectedTask(null);
  };

  const handleRecoverPoints = async () => {
    const newPoints = await recoverPoints();
    setPoints(newPoints);
    setShowRecoveryPrompt(false);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleSkipRecovery = () => {
    setShowRecovery(false);
  };

  const handleMakeUpRecovery = () => {
    setShowRecovery(false);
  };

  const completedCount = tasks.filter((t) => t.isCompleted).length;
  const totalCount = tasks.length;
  const progress = totalCount > 0 ? completedCount / totalCount : 0;

  const getCompanionMood = (): CompanionMood => {
    if (progress >= 0.8) return "happy";
    if (progress >= 0.2) return "encouraging";
    return "supportive";
  };

  const getCompanionMessage = (): string => {
    const name = profile?.name || "Friend";
    if (progress >= 1) {
      return `Amazing work, ${name}! You've completed all your tasks today!`;
    }
    if (progress >= 0.8) {
      return `You're doing wonderfully, ${name}! Almost there!`;
    }
    if (progress >= 0.5) {
      return `Great progress, ${name}! Keep it up!`;
    }
    if (progress > 0) {
      return `Every small step counts, ${name}. You've got this!`;
    }
    return `${getGreeting()}, ${name}! Ready for a healthy day?`;
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Companion mood={getCompanionMood()} message={getCompanionMessage()} />

      {points ? (
        <PointsDisplay
          totalPoints={points.totalPoints}
          earnedToday={points.earnedToday}
          lostToday={points.lostToday}
          pendingRecovery={points.pendingRecovery}
        />
      ) : null}

      {showRecoveryPrompt && points && points.pendingRecovery > 0 ? (
        <RecoveryPromptCard
          pendingPoints={points.pendingRecovery}
          onRecover={handleRecoverPoints}
          onDismiss={() => setShowRecoveryPrompt(false)}
        />
      ) : null}

      {totalCount > 0 ? (
        <View style={styles.progressContainer}>
          <ProgressRing
            progress={progress}
            completedCount={completedCount}
            totalCount={totalCount}
          />
        </View>
      ) : null}

      {showRecovery ? (
        <RecoveryCard
          missedCount={missedCount}
          onSkipWithGrace={handleSkipRecovery}
          onMakeUp={handleMakeUpRecovery}
        />
      ) : null}

      {totalCount > 0 ? (
        <View style={styles.sectionHeader}>
          <ThemedText type="h3" style={{ color: theme.text }}>
            Today's Tasks
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {completedCount} of {totalCount} completed
          </ThemedText>
        </View>
      ) : null}
    </View>
  );

  const renderEmpty = () => (
    <EmptyState
      type="tasks"
      title="No tasks for today"
      message="Add some habits in the Habits tab to start tracking your daily care routine."
    />
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.backgroundRoot }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <>
      <FlatList
        style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
        contentContainerStyle={[
          styles.contentContainer,
          {
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: tabBarHeight + Spacing.xl,
          },
        ]}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
        data={tasks}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        renderItem={({ item }) => (
          <TaskCard
            id={item.id}
            name={item.name}
            icon={item.icon}
            time={item.time}
            isCompleted={item.isCompleted}
            isSnoozed={item.isSnoozed}
            isExpired={item.isExpired}
            onPress={handleTaskPress}
          />
        )}
      />

      {selectedTask ? (
        <ReminderModal
          visible={modalVisible}
          taskName={selectedTask.name}
          taskIcon={selectedTask.icon}
          isSnoozed={selectedTask.isSnoozed}
          isExpired={selectedTask.isExpired}
          onDoNow={handleDoNow}
          onSnooze={handleSnooze}
          onCompleted={handleCompleted}
          onSkip={handleSkip}
          onClose={() => {
            setModalVisible(false);
            setSelectedTask(null);
          }}
        />
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: Spacing.lg,
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    gap: Spacing.lg,
    marginBottom: Spacing.md,
  },
  progressContainer: {
    alignItems: "center",
    paddingVertical: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.sm,
  },
});
