import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HabitsScreen from "@/screens/HabitsScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type HabitsStackParamList = {
  Habits: undefined;
};

const Stack = createNativeStackNavigator<HabitsStackParamList>();

export default function HabitsStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Habits"
        component={HabitsScreen}
        options={{
          headerTitle: "My Habits",
        }}
      />
    </Stack.Navigator>
  );
}
