import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { getHabits, type Habit } from "./storage";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return false;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("reminders", {
      name: "Health Reminders",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#7EC8A3",
      sound: "default",
      enableVibrate: true,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });
  }

  return true;
}

export async function scheduleHabitNotification(habit: Habit): Promise<string | null> {
  try {
    const [hours, minutes] = habit.time.split(":").map(Number);

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Time for your health task!",
        body: habit.name,
        data: { habitId: habit.id, type: "habit_reminder" },
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: hours,
        minute: minutes,
      },
    });

    return identifier;
  } catch (error) {
    console.error("Error scheduling notification:", error);
    return null;
  }
}

export async function cancelHabitNotification(habitId: string): Promise<void> {
  const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
  
  for (const notification of scheduledNotifications) {
    if (notification.content.data?.habitId === habitId) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  }
}

export async function rescheduleAllHabitNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  
  const habits = await getHabits();
  const enabledHabits = habits.filter((h) => h.enabled);
  
  for (const habit of enabledHabits) {
    await scheduleHabitNotification(habit);
  }
}

export async function sendImmediateTestNotification(): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Diabetes Care Reminder",
      body: "This is a test notification. Your reminders are working!",
      data: { type: "test" },
      sound: true,
    },
    trigger: null,
  });
}

export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
): Notifications.EventSubscription {
  return Notifications.addNotificationReceivedListener(callback);
}

export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void
): Notifications.EventSubscription {
  return Notifications.addNotificationResponseReceivedListener(callback);
}
