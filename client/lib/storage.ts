import AsyncStorage from "@react-native-async-storage/async-storage";

// Storage keys
const KEYS = {
  USER_PROFILE: "@diabetes_care/user_profile",
  HABITS: "@diabetes_care/habits",
  TASKS: "@diabetes_care/tasks",
  COMPLETED_TASKS: "@diabetes_care/completed_tasks",
  STREAKS: "@diabetes_care/streaks",
  REWARDS: "@diabetes_care/rewards",
  POINTS: "@diabetes_care/points",
  SNOOZED_TASKS: "@diabetes_care/snoozed_tasks",
  ONBOARDING_COMPLETE: "@diabetes_care/onboarding_complete",
  BLOOD_SUGAR_LOGS: "@diabetes_care/blood_sugar_logs",
  NOTIFICATION_SETTINGS: "@diabetes_care/notification_settings",
};

// Types
export interface UserProfile {
  name: string;
  avatarUri?: string;
  notificationsEnabled: boolean;
  createdAt: string;
  diabetesType?: "type1" | "type2" | "prediabetes" | "gestational";
  diagnosisDate?: string;
  medications?: string[];
  emergencyContact?: string;
  doctorName?: string;
  targetBloodSugar?: { min: number; max: number };
}

export interface BloodSugarLog {
  id: string;
  value: number;
  unit: "mg/dL" | "mmol/L";
  mealContext: "fasting" | "before_meal" | "after_meal" | "bedtime";
  notes?: string;
  loggedAt: string;
  date: string;
}

export interface NotificationSettings {
  enabled: boolean;
  soundName: string;
  vibrate: boolean;
}

export interface Habit {
  id: string;
  name: string;
  icon: string;
  time: string;
  enabled: boolean;
  frequency: "daily" | "weekly";
}

export interface CompletedTask {
  habitId: string;
  completedAt: string;
  date: string; // YYYY-MM-DD
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null;
  totalCompletedDays: number;
}

export interface Reward {
  id: string;
  type: "flower-1" | "flower-2" | "gem";
  name: string;
  unlockedAt: string;
  requirement: string;
}

export interface PointsData {
  totalPoints: number;
  earnedToday: number;
  lostToday: number;
  pendingRecovery: number;
  lastUpdatedDate: string;
}

export interface SnoozedTask {
  habitId: string;
  snoozeUntil: number; // timestamp
  date: string;
}

// Default values
const defaultProfile: UserProfile = {
  name: "Friend",
  notificationsEnabled: true,
  createdAt: new Date().toISOString(),
};

const defaultHabits: Habit[] = [
  { id: "medicine", name: "Take Medicine", icon: "heart", time: "08:00", enabled: true, frequency: "daily" },
  { id: "water", name: "Drink Water", icon: "droplet", time: "09:00", enabled: true, frequency: "daily" },
  { id: "meal", name: "Healthy Meal", icon: "coffee", time: "12:00", enabled: true, frequency: "daily" },
  { id: "sugar", name: "Check Sugar Level", icon: "activity", time: "14:00", enabled: true, frequency: "daily" },
  { id: "exercise", name: "Light Exercise", icon: "zap", time: "17:00", enabled: true, frequency: "daily" },
];

const defaultStreaks: StreakData = {
  currentStreak: 0,
  longestStreak: 0,
  lastCompletedDate: null,
  totalCompletedDays: 0,
};

const defaultPoints: PointsData = {
  totalPoints: 0,
  earnedToday: 0,
  lostToday: 0,
  pendingRecovery: 0,
  lastUpdatedDate: new Date().toISOString().split("T")[0],
};

// Storage functions
export async function getUserProfile(): Promise<UserProfile> {
  try {
    const data = await AsyncStorage.getItem(KEYS.USER_PROFILE);
    return data ? JSON.parse(data) : defaultProfile;
  } catch {
    return defaultProfile;
  }
}

export async function setUserProfile(profile: UserProfile): Promise<void> {
  await AsyncStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(profile));
}

export async function getHabits(): Promise<Habit[]> {
  try {
    const data = await AsyncStorage.getItem(KEYS.HABITS);
    return data ? JSON.parse(data) : defaultHabits;
  } catch {
    return defaultHabits;
  }
}

export async function setHabits(habits: Habit[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.HABITS, JSON.stringify(habits));
}

export async function addHabit(habit: Habit): Promise<void> {
  const habits = await getHabits();
  habits.push(habit);
  await setHabits(habits);
}

export async function updateHabit(habitId: string, updates: Partial<Habit>): Promise<void> {
  const habits = await getHabits();
  const index = habits.findIndex((h) => h.id === habitId);
  if (index !== -1) {
    habits[index] = { ...habits[index], ...updates };
    await setHabits(habits);
  }
}

export async function deleteHabit(habitId: string): Promise<void> {
  const habits = await getHabits();
  const filtered = habits.filter((h) => h.id !== habitId);
  await setHabits(filtered);
}

export async function getCompletedTasksForDate(date: string): Promise<CompletedTask[]> {
  try {
    const data = await AsyncStorage.getItem(KEYS.COMPLETED_TASKS);
    const allTasks: CompletedTask[] = data ? JSON.parse(data) : [];
    return allTasks.filter((t) => t.date === date);
  } catch {
    return [];
  }
}

export async function getAllCompletedTasks(): Promise<CompletedTask[]> {
  try {
    const data = await AsyncStorage.getItem(KEYS.COMPLETED_TASKS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function completeTask(habitId: string, date: string): Promise<void> {
  const allTasks = await getAllCompletedTasks();
  const newTask: CompletedTask = {
    habitId,
    completedAt: new Date().toISOString(),
    date,
  };
  allTasks.push(newTask);
  await AsyncStorage.setItem(KEYS.COMPLETED_TASKS, JSON.stringify(allTasks));
  
  // Update streaks
  await updateStreaks(date);
}

export async function uncompleteTask(habitId: string, date: string): Promise<void> {
  const allTasks = await getAllCompletedTasks();
  const filtered = allTasks.filter((t) => !(t.habitId === habitId && t.date === date));
  await AsyncStorage.setItem(KEYS.COMPLETED_TASKS, JSON.stringify(filtered));
}

export async function getStreaks(): Promise<StreakData> {
  try {
    const data = await AsyncStorage.getItem(KEYS.STREAKS);
    return data ? JSON.parse(data) : defaultStreaks;
  } catch {
    return defaultStreaks;
  }
}

export async function updateStreaks(date: string): Promise<void> {
  const streaks = await getStreaks();
  const habits = await getHabits();
  const enabledHabits = habits.filter((h) => h.enabled);
  const completedToday = await getCompletedTasksForDate(date);
  
  // Check if all enabled tasks are completed for today
  const allCompleted = enabledHabits.every((habit) =>
    completedToday.some((task) => task.habitId === habit.id)
  );
  
  if (allCompleted && enabledHabits.length > 0) {
    const yesterday = new Date(date);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];
    
    if (streaks.lastCompletedDate === yesterdayStr) {
      // Continuing streak
      streaks.currentStreak += 1;
    } else if (streaks.lastCompletedDate !== date) {
      // Starting new streak or first completion
      streaks.currentStreak = 1;
    }
    
    streaks.lastCompletedDate = date;
    streaks.longestStreak = Math.max(streaks.longestStreak, streaks.currentStreak);
    streaks.totalCompletedDays += 1;
    
    await AsyncStorage.setItem(KEYS.STREAKS, JSON.stringify(streaks));
    
    // Check for new rewards
    await checkAndUnlockRewards(streaks);
  }
}

export async function getRewards(): Promise<Reward[]> {
  try {
    const data = await AsyncStorage.getItem(KEYS.REWARDS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function checkAndUnlockRewards(streaks: StreakData): Promise<void> {
  const rewards = await getRewards();
  const newRewards: Reward[] = [...rewards];
  
  // 7-day streak reward
  if (streaks.currentStreak >= 7 && !rewards.find((r) => r.id === "streak-7")) {
    newRewards.push({
      id: "streak-7",
      type: "flower-1",
      name: "Week Warrior",
      unlockedAt: new Date().toISOString(),
      requirement: "7-day streak",
    });
  }
  
  // 30-day streak reward
  if (streaks.currentStreak >= 30 && !rewards.find((r) => r.id === "streak-30")) {
    newRewards.push({
      id: "streak-30",
      type: "flower-2",
      name: "Monthly Champion",
      unlockedAt: new Date().toISOString(),
      requirement: "30-day streak",
    });
  }
  
  // Perfect week (7 total completed days)
  if (streaks.totalCompletedDays >= 7 && !rewards.find((r) => r.id === "total-7")) {
    newRewards.push({
      id: "total-7",
      type: "gem",
      name: "Care Gem",
      unlockedAt: new Date().toISOString(),
      requirement: "7 perfect days",
    });
  }
  
  if (newRewards.length > rewards.length) {
    await AsyncStorage.setItem(KEYS.REWARDS, JSON.stringify(newRewards));
  }
}

export async function getMissedTasksYesterday(): Promise<string[]> {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];
  
  const habits = await getHabits();
  const enabledHabits = habits.filter((h) => h.enabled);
  const completedYesterday = await getCompletedTasksForDate(yesterdayStr);
  
  const missed = enabledHabits
    .filter((habit) => !completedYesterday.some((task) => task.habitId === habit.id))
    .map((h) => h.id);
  
  return missed;
}

export function getTodayDateString(): string {
  return new Date().toISOString().split("T")[0];
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

// Points functions
export async function getPoints(): Promise<PointsData> {
  try {
    const data = await AsyncStorage.getItem(KEYS.POINTS);
    const points: PointsData = data ? JSON.parse(data) : defaultPoints;
    
    // Reset daily counters if it's a new day
    const today = getTodayDateString();
    if (points.lastUpdatedDate !== today) {
      points.earnedToday = 0;
      points.lostToday = 0;
      points.lastUpdatedDate = today;
      await AsyncStorage.setItem(KEYS.POINTS, JSON.stringify(points));
    }
    
    return points;
  } catch {
    return defaultPoints;
  }
}

export async function addPoints(amount: number): Promise<PointsData> {
  const points = await getPoints();
  points.totalPoints += amount;
  points.earnedToday += amount;
  points.lastUpdatedDate = getTodayDateString();
  await AsyncStorage.setItem(KEYS.POINTS, JSON.stringify(points));
  return points;
}

export async function deductPoints(amount: number): Promise<PointsData> {
  const points = await getPoints();
  points.totalPoints = Math.max(0, points.totalPoints - amount);
  points.lostToday += amount;
  points.pendingRecovery += amount;
  points.lastUpdatedDate = getTodayDateString();
  await AsyncStorage.setItem(KEYS.POINTS, JSON.stringify(points));
  return points;
}

export async function recoverPoints(): Promise<PointsData> {
  const points = await getPoints();
  if (points.pendingRecovery > 0) {
    points.totalPoints += points.pendingRecovery;
    points.earnedToday += points.pendingRecovery;
    points.pendingRecovery = 0;
    await AsyncStorage.setItem(KEYS.POINTS, JSON.stringify(points));
  }
  return points;
}

// Snoozed tasks functions
export async function getSnoozedTasks(): Promise<SnoozedTask[]> {
  try {
    const data = await AsyncStorage.getItem(KEYS.SNOOZED_TASKS);
    const tasks: SnoozedTask[] = data ? JSON.parse(data) : [];
    // Clean up expired snoozes from previous days
    const today = getTodayDateString();
    return tasks.filter((t) => t.date === today);
  } catch {
    return [];
  }
}

export async function snoozeTask(habitId: string, minutes: number): Promise<void> {
  const tasks = await getSnoozedTasks();
  const snoozeUntil = Date.now() + minutes * 60 * 1000;
  const existingIndex = tasks.findIndex((t) => t.habitId === habitId);
  
  if (existingIndex !== -1) {
    tasks[existingIndex].snoozeUntil = snoozeUntil;
  } else {
    tasks.push({
      habitId,
      snoozeUntil,
      date: getTodayDateString(),
    });
  }
  
  await AsyncStorage.setItem(KEYS.SNOOZED_TASKS, JSON.stringify(tasks));
}

export async function clearSnooze(habitId: string): Promise<void> {
  const tasks = await getSnoozedTasks();
  const filtered = tasks.filter((t) => t.habitId !== habitId);
  await AsyncStorage.setItem(KEYS.SNOOZED_TASKS, JSON.stringify(filtered));
}

export async function isTaskSnoozed(habitId: string): Promise<{ snoozed: boolean; expired: boolean }> {
  const tasks = await getSnoozedTasks();
  const task = tasks.find((t) => t.habitId === habitId);
  
  if (!task) return { snoozed: false, expired: false };
  
  const now = Date.now();
  if (now >= task.snoozeUntil) {
    return { snoozed: true, expired: true };
  }
  
  return { snoozed: true, expired: false };
}

// Reset all data (for testing/profile reset)
export async function resetAllData(): Promise<void> {
  await AsyncStorage.multiRemove([
    KEYS.USER_PROFILE,
    KEYS.HABITS,
    KEYS.COMPLETED_TASKS,
    KEYS.STREAKS,
    KEYS.REWARDS,
    KEYS.POINTS,
    KEYS.SNOOZED_TASKS,
    KEYS.ONBOARDING_COMPLETE,
    KEYS.BLOOD_SUGAR_LOGS,
    KEYS.NOTIFICATION_SETTINGS,
  ]);
}

// Onboarding functions
export async function isOnboardingComplete(): Promise<boolean> {
  try {
    const data = await AsyncStorage.getItem(KEYS.ONBOARDING_COMPLETE);
    return data === "true";
  } catch {
    return false;
  }
}

export async function setOnboardingComplete(): Promise<void> {
  await AsyncStorage.setItem(KEYS.ONBOARDING_COMPLETE, "true");
}

// Blood sugar logging functions
export async function getBloodSugarLogs(): Promise<BloodSugarLog[]> {
  try {
    const data = await AsyncStorage.getItem(KEYS.BLOOD_SUGAR_LOGS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function addBloodSugarLog(log: BloodSugarLog): Promise<void> {
  const logs = await getBloodSugarLogs();
  logs.push(log);
  await AsyncStorage.setItem(KEYS.BLOOD_SUGAR_LOGS, JSON.stringify(logs));
}

export async function getBloodSugarLogsForDate(date: string): Promise<BloodSugarLog[]> {
  const logs = await getBloodSugarLogs();
  return logs.filter((log) => log.date === date);
}

export async function getRecentBloodSugarLogs(days: number = 7): Promise<BloodSugarLog[]> {
  const logs = await getBloodSugarLogs();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  const cutoffStr = cutoffDate.toISOString().split("T")[0];
  return logs.filter((log) => log.date >= cutoffStr).sort((a, b) => 
    new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime()
  );
}

// Notification settings functions
const defaultNotificationSettings: NotificationSettings = {
  enabled: true,
  soundName: "default",
  vibrate: true,
};

export async function getNotificationSettings(): Promise<NotificationSettings> {
  try {
    const data = await AsyncStorage.getItem(KEYS.NOTIFICATION_SETTINGS);
    return data ? JSON.parse(data) : defaultNotificationSettings;
  } catch {
    return defaultNotificationSettings;
  }
}

export async function setNotificationSettings(settings: NotificationSettings): Promise<void> {
  await AsyncStorage.setItem(KEYS.NOTIFICATION_SETTINGS, JSON.stringify(settings));
}

// Generate unique ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
