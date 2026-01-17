import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { getUserProfile, setUserProfile, type UserProfile } from "@/lib/storage";

type DiabetesType = "type1" | "type2" | "prediabetes" | "gestational";

const diabetesTypes: { value: DiabetesType; label: string }[] = [
  { value: "type1", label: "Type 1" },
  { value: "type2", label: "Type 2" },
  { value: "prediabetes", label: "Prediabetes" },
  { value: "gestational", label: "Gestational" },
];

export default function EditProfileScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const navigation = useNavigation();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [diabetesType, setDiabetesType] = useState<DiabetesType | undefined>();
  const [diagnosisYear, setDiagnosisYear] = useState("");
  const [medications, setMedications] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [doctorName, setDoctorName] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const profile = await getUserProfile();
      if (profile) {
        setName(profile.name || "");
        setDiabetesType(profile.diabetesType);
        setDiagnosisYear(profile.diagnosisDate?.split("-")[0] || "");
        setMedications(profile.medications?.join(", ") || "");
        setEmergencyContact(profile.emergencyContact || "");
        setDoctorName(profile.doctorName || "");
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Missing Name", "Please enter your name.");
      return;
    }

    setSaving(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const existingProfile = await getUserProfile();
      const medicationsList = medications
        .split(",")
        .map((m) => m.trim())
        .filter((m) => m.length > 0);

      const updatedProfile: UserProfile = {
        ...existingProfile,
        name: name.trim(),
        notificationsEnabled: existingProfile?.notificationsEnabled ?? true,
        createdAt: existingProfile?.createdAt || new Date().toISOString(),
        diabetesType,
        diagnosisDate: diagnosisYear ? `${diagnosisYear}-01-01` : undefined,
        medications: medicationsList.length > 0 ? medicationsList : undefined,
        emergencyContact: emergencyContact.trim() || undefined,
        doctorName: doctorName.trim() || undefined,
      };

      await setUserProfile(updatedProfile);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ThemedView style={[styles.container, { paddingTop: headerHeight + Spacing.xl }]}>
        <View style={styles.loadingContainer} />
      </ThemedView>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.contentContainer,
        {
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: insets.bottom + Spacing.xl,
        },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.section}>
        <ThemedText type="h4" style={[styles.label, { color: theme.text }]}>
          Your Name
        </ThemedText>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.backgroundDefault,
              color: theme.text,
              borderColor: theme.taskPending,
            },
          ]}
          value={name}
          onChangeText={setName}
          placeholder="Enter your name"
          placeholderTextColor={theme.textSecondary}
          autoCapitalize="words"
        />
      </View>

      <View style={styles.section}>
        <ThemedText type="h4" style={[styles.label, { color: theme.text }]}>
          Diabetes Type
        </ThemedText>
        <View style={styles.typeGrid}>
          {diabetesTypes.map((type) => (
            <Pressable
              key={type.value}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setDiabetesType(type.value);
              }}
              style={[
                styles.typeButton,
                {
                  backgroundColor:
                    diabetesType === type.value
                      ? theme.primary
                      : theme.backgroundDefault,
                  borderColor:
                    diabetesType === type.value ? theme.primary : theme.taskPending,
                },
              ]}
            >
              <ThemedText
                type="small"
                style={{
                  color:
                    diabetesType === type.value
                      ? theme.backgroundDefault
                      : theme.text,
                  fontFamily: "Nunito_700Bold",
                }}
              >
                {type.label}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="h4" style={[styles.label, { color: theme.text }]}>
          Year of Diagnosis
        </ThemedText>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.backgroundDefault,
              color: theme.text,
              borderColor: theme.taskPending,
            },
          ]}
          value={diagnosisYear}
          onChangeText={setDiagnosisYear}
          placeholder="e.g., 2020"
          placeholderTextColor={theme.textSecondary}
          keyboardType="numeric"
          maxLength={4}
        />
      </View>

      <View style={styles.section}>
        <ThemedText type="h4" style={[styles.label, { color: theme.text }]}>
          Current Medications
        </ThemedText>
        <TextInput
          style={[
            styles.input,
            styles.textArea,
            {
              backgroundColor: theme.backgroundDefault,
              color: theme.text,
              borderColor: theme.taskPending,
            },
          ]}
          value={medications}
          onChangeText={setMedications}
          placeholder="e.g., Metformin, Insulin"
          placeholderTextColor={theme.textSecondary}
          multiline
        />
        <ThemedText type="small" style={[styles.hint, { color: theme.textSecondary }]}>
          Separate multiple medications with commas
        </ThemedText>
      </View>

      <View style={styles.section}>
        <ThemedText type="h4" style={[styles.label, { color: theme.text }]}>
          Doctor's Name
        </ThemedText>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.backgroundDefault,
              color: theme.text,
              borderColor: theme.taskPending,
            },
          ]}
          value={doctorName}
          onChangeText={setDoctorName}
          placeholder="e.g., Dr. Sharma"
          placeholderTextColor={theme.textSecondary}
          autoCapitalize="words"
        />
      </View>

      <View style={styles.section}>
        <ThemedText type="h4" style={[styles.label, { color: theme.text }]}>
          Emergency Contact
        </ThemedText>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.backgroundDefault,
              color: theme.text,
              borderColor: theme.taskPending,
            },
          ]}
          value={emergencyContact}
          onChangeText={setEmergencyContact}
          placeholder="e.g., +91 98765 43210"
          placeholderTextColor={theme.textSecondary}
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button onPress={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: Spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  section: {
    marginBottom: Spacing.xl,
  },
  label: {
    fontFamily: "Nunito_700Bold",
    marginBottom: Spacing.md,
  },
  input: {
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
    fontFamily: "Nunito_400Regular",
  },
  textArea: {
    height: 80,
    paddingTop: Spacing.md,
    textAlignVertical: "top",
  },
  hint: {
    marginTop: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  typeButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
  },
  buttonContainer: {
    marginTop: Spacing.xl,
  },
});
