import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TodayScreen from "@/screens/TodayScreen";
import BloodSugarScreen from "@/screens/BloodSugarScreen";
import { HeaderTitle } from "@/components/HeaderTitle";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type TodayStackParamList = {
  Today: undefined;
  BloodSugar: undefined;
};

const Stack = createNativeStackNavigator<TodayStackParamList>();

export default function TodayStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Today"
        component={TodayScreen}
        options={{
          headerTitle: () => <HeaderTitle title="Diabetes Care" />,
        }}
      />
      <Stack.Screen
        name="BloodSugar"
        component={BloodSugarScreen}
        options={{
          headerTitle: "Blood Sugar Log",
        }}
      />
    </Stack.Navigator>
  );
}
