import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainTabNavigator from "@/navigation/MainTabNavigator";
import AddHabitScreen from "@/screens/AddHabitScreen";
import EditHabitScreen from "@/screens/EditHabitScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import type { Habit } from "@/lib/storage";

export type RootStackParamList = {
  Main: undefined;
  AddHabit: undefined;
  EditHabit: { habit: Habit };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Main"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddHabit"
        component={AddHabitScreen}
        options={{
          presentation: "modal",
          headerTitle: "Add Habit",
        }}
      />
      <Stack.Screen
        name="EditHabit"
        component={EditHabitScreen}
        options={{
          presentation: "modal",
          headerTitle: "Edit Habit",
        }}
      />
    </Stack.Navigator>
  );
}
