import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import {
  setUserProfile,
  setOnboardingComplete,
  type UserProfile,
} from "@/lib/storage";

interface OnboardingScreenProps {
  onComplete: () => void;
}

type DiabetesType = "type1" | "type2" | "prediabetes" | "gestational";

const diabetesTypes: { value: DiabetesType; label: string; description: string }[] = [
  { value: "type1", label: "Type 1", description: "Insulin-dependent diabetes" },
  { value: "type2", label: "Type 2", description: "Most common type" },
  { value: "prediabetes", label: "Prediabetes", description: "Higher than normal blood sugar" },
  { value: "gestational", label: "Gestational", description: "During pregnancy" },
];

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [diabetesType, setDiabetesType] = useState<DiabetesType | null>(null);
  const [diagnosisYear, setDiagnosisYear] = useState("");
  const [medications, setMedications] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [loading, setLoading] = useState(false);

  const canProceed = () => {
    if (step === 1) return name.trim().length >= 2;
    if (step === 2) return diabetesType !== null;
    if (step === 3) return true;
    return true;
  };

  const handleNext = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (step < 4) {
      setStep(step + 1);
    } else {
      await handleComplete();
    }
  };

  const handleBack = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const medicationsList = medications
        .split(",")
        .map((m) => m.trim())
        .filter((m) => m.length > 0);

      const profile: UserProfile = {
        name: name.trim(),
        notificationsEnabled: true,
        createdAt: new Date().toISOString(),
        diabetesType: diabetesType || undefined,
        diagnosisDate: diagnosisYear ? `${diagnosisYear}-01-01` : undefined,
        medications: medicationsList.length > 0 ? medicationsList : undefined,
        emergencyContact: emergencyContact.trim() || undefined,
      };

      await setUserProfile(profile);
      await setOnboardingComplete();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onComplete();
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <View style={[styles.iconCircle, { backgroundColor: theme.primary + "20" }]}>
        <Feather name="user" size={40} color={theme.primary} />
      </View>
      
      <ThemedText type="h2" style={[styles.stepTitle, { color: theme.text }]}>
        Welcome to Diabetes Care
      </ThemedText>
      
      <ThemedText type="body" style={[styles.stepDescription, { color: theme.textSecondary }]}>
        Let's start by getting to know you. What should we call you?
      </ThemedText>

      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.backgroundSecondary,
            color: theme.text,
            borderColor: name.length > 0 ? theme.primary : theme.backgroundSecondary,
          },
        ]}
        placeholder="Enter your name"
        placeholderTextColor={theme.textSecondary}
        value={name}
        onChangeText={setName}
        autoFocus
        autoCapitalize="words"
      />
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <View style={[styles.iconCircle, { backgroundColor: theme.secondary + "20" }]}>
        <Feather name="heart" size={40} color={theme.secondary} />
      </View>
      
      <ThemedText type="h2" style={[styles.stepTitle, { color: theme.text }]}>
        Your Diabetes Type
      </ThemedText>
      
      <ThemedText type="body" style={[styles.stepDescription, { color: theme.textSecondary }]}>
        This helps us personalize your care reminders.
      </ThemedText>

      <View style={styles.optionsGrid}>
        {diabetesTypes.map((type) => (
          <Pressable
            key={type.value}
            style={[
              styles.optionCard,
              {
                backgroundColor: theme.backgroundSecondary,
                borderColor: diabetesType === type.value ? theme.primary : theme.backgroundSecondary,
                borderWidth: 2,
              },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setDiabetesType(type.value);
            }}
          >
            {diabetesType === type.value ? (
              <View style={[styles.checkCircle, { backgroundColor: theme.primary }]}>
                <Feather name="check" size={14} color="#fff" />
              </View>
            ) : null}
            <ThemedText type="h4" style={{ color: theme.text }}>
              {type.label}
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: "center" }}>
              {type.description}
            </ThemedText>
          </Pressable>
        ))}
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <View style={[styles.iconCircle, { backgroundColor: theme.primary + "20" }]}>
        <Feather name="calendar" size={40} color={theme.primary} />
      </View>
      
      <ThemedText type="h2" style={[styles.stepTitle, { color: theme.text }]}>
        A Little More About You
      </ThemedText>
      
      <ThemedText type="body" style={[styles.stepDescription, { color: theme.textSecondary }]}>
        Optional information to better help you.
      </ThemedText>

      <View style={styles.inputGroup}>
        <ThemedText type="small" style={[styles.inputLabel, { color: theme.textSecondary }]}>
          Year of Diagnosis (optional)
        </ThemedText>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.backgroundSecondary,
              color: theme.text,
              borderColor: theme.backgroundSecondary,
            },
          ]}
          placeholder="e.g., 2020"
          placeholderTextColor={theme.textSecondary}
          value={diagnosisYear}
          onChangeText={setDiagnosisYear}
          keyboardType="numeric"
          maxLength={4}
        />
      </View>

      <View style={styles.inputGroup}>
        <ThemedText type="small" style={[styles.inputLabel, { color: theme.textSecondary }]}>
          Current Medications (optional)
        </ThemedText>
        <TextInput
          style={[
            styles.input,
            styles.textArea,
            {
              backgroundColor: theme.backgroundSecondary,
              color: theme.text,
              borderColor: theme.backgroundSecondary,
            },
          ]}
          placeholder="e.g., Metformin, Insulin"
          placeholderTextColor={theme.textSecondary}
          value={medications}
          onChangeText={setMedications}
          multiline
        />
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <View style={[styles.iconCircle, { backgroundColor: theme.secondary + "20" }]}>
        <Feather name="phone" size={40} color={theme.secondary} />
      </View>
      
      <ThemedText type="h2" style={[styles.stepTitle, { color: theme.text }]}>
        Emergency Contact
      </ThemedText>
      
      <ThemedText type="body" style={[styles.stepDescription, { color: theme.textSecondary }]}>
        Add someone who can be reached in case of emergency.
      </ThemedText>

      <View style={styles.inputGroup}>
        <ThemedText type="small" style={[styles.inputLabel, { color: theme.textSecondary }]}>
          Phone Number (optional)
        </ThemedText>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.backgroundSecondary,
              color: theme.text,
              borderColor: theme.backgroundSecondary,
            },
          ]}
          placeholder="e.g., +91 98765 43210"
          placeholderTextColor={theme.textSecondary}
          value={emergencyContact}
          onChangeText={setEmergencyContact}
          keyboardType="phone-pad"
        />
      </View>

      <View style={[styles.readyCard, { backgroundColor: theme.primary + "10" }]}>
        <Feather name="check-circle" size={24} color={theme.primary} />
        <ThemedText type="body" style={{ color: theme.text, flex: 1 }}>
          You're all set! Tap "Get Started" to begin your health journey.
        </ThemedText>
      </View>
    </View>
  );

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.progressContainer}>
            {[1, 2, 3, 4].map((s) => (
              <View
                key={s}
                style={[
                  styles.progressDot,
                  {
                    backgroundColor: s <= step ? theme.primary : theme.backgroundSecondary,
                  },
                ]}
              />
            ))}
          </View>

          {step === 1 ? renderStep1() : null}
          {step === 2 ? renderStep2() : null}
          {step === 3 ? renderStep3() : null}
          {step === 4 ? renderStep4() : null}
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.lg }]}>
          <View style={styles.buttonRow}>
            {step > 1 ? (
              <Pressable
                style={[styles.backButton, { borderColor: theme.textSecondary }]}
                onPress={handleBack}
              >
                <Feather name="arrow-left" size={20} color={theme.textSecondary} />
              </Pressable>
            ) : null}

            <Pressable
              style={[
                styles.nextButton,
                {
                  backgroundColor: canProceed() ? theme.primary : theme.backgroundSecondary,
                  flex: step > 1 ? 1 : undefined,
                },
              ]}
              onPress={handleNext}
              disabled={!canProceed() || loading}
            >
              <ThemedText
                type="h4"
                style={{
                  color: canProceed() ? "#fff" : theme.textSecondary,
                }}
              >
                {step === 4 ? "Get Started" : "Continue"}
              </ThemedText>
              <Feather
                name={step === 4 ? "check" : "arrow-right"}
                size={20}
                color={canProceed() ? "#fff" : theme.textSecondary}
              />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.xl,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  stepContent: {
    flex: 1,
    alignItems: "center",
    paddingTop: Spacing.xl,
    gap: Spacing.md,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  stepTitle: {
    fontFamily: "Nunito_700Bold",
    textAlign: "center",
  },
  stepDescription: {
    fontFamily: "Nunito_400Regular",
    textAlign: "center",
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  input: {
    width: "100%",
    height: 56,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
    fontFamily: "Nunito_400Regular",
    borderWidth: 2,
  },
  textArea: {
    height: 80,
    paddingTop: Spacing.md,
    textAlignVertical: "top",
  },
  inputGroup: {
    width: "100%",
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontFamily: "Nunito_400Regular",
    marginLeft: Spacing.xs,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    width: "100%",
    justifyContent: "center",
  },
  optionCard: {
    width: "46%",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    gap: Spacing.xs,
    position: "relative",
  },
  checkCircle: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  readyCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    width: "100%",
    marginTop: Spacing.lg,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  buttonRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  backButton: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  nextButton: {
    height: 56,
    borderRadius: BorderRadius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    minWidth: 160,
  },
});
