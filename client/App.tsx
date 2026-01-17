import React, { useEffect, useState, useCallback } from "react";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import * as Font from "expo-font";
import { Nunito_400Regular, Nunito_700Bold } from "@expo-google-fonts/nunito";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";

import RootStackNavigator from "@/navigation/RootStackNavigator";
import OnboardingScreen from "@/screens/OnboardingScreen";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { isOnboardingComplete } from "@/lib/storage";
import { Colors } from "@/constants/theme";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    async function prepare() {
      try {
        await Font.loadAsync({
          Nunito_400Regular,
          Nunito_700Bold,
        });
        
        const onboardingDone = await isOnboardingComplete();
        setShowOnboarding(!onboardingDone);
      } catch (e) {
        console.warn("App preparation error:", e);
        setShowOnboarding(true);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      try {
        await SplashScreen.hideAsync();
      } catch (e) {
        console.warn("Splash hide error:", e);
      }
    }
  }, [appIsReady]);

  const handleOnboardingComplete = useCallback(() => {
    setShowOnboarding(false);
  }, []);

  if (!appIsReady || showOnboarding === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <GestureHandlerRootView style={styles.root} onLayout={onLayoutRootView}>
            <KeyboardProvider>
              {showOnboarding ? (
                <OnboardingScreen onComplete={handleOnboardingComplete} />
              ) : (
                <NavigationContainer>
                  <RootStackNavigator />
                </NavigationContainer>
              )}
              <StatusBar style="auto" />
            </KeyboardProvider>
          </GestureHandlerRootView>
        </SafeAreaProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.backgroundRoot,
  },
});
