import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
  Alert,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Svg, { Path, Circle, Line, Text as SvgText } from "react-native-svg";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import {
  getRecentBloodSugarLogs,
  addBloodSugarLog,
  generateId,
  type BloodSugarLog,
} from "@/lib/storage";

const SCREEN_WIDTH = Dimensions.get("window").width;
const GRAPH_WIDTH = SCREEN_WIDTH - Spacing.lg * 2 - Spacing.lg * 2;
const GRAPH_HEIGHT = 180;

type MealContext = "fasting" | "before_meal" | "after_meal" | "bedtime";

const MEAL_CONTEXTS: { value: MealContext; label: string; icon: string }[] = [
  { value: "fasting", label: "Fasting", icon: "sunrise" },
  { value: "before_meal", label: "Before Meal", icon: "coffee" },
  { value: "after_meal", label: "After Meal", icon: "check-circle" },
  { value: "bedtime", label: "Bedtime", icon: "moon" },
];

export default function BloodSugarScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const navigation = useNavigation();

  const [logs, setLogs] = useState<BloodSugarLog[]>([]);
  const [value, setValue] = useState("");
  const [mealContext, setMealContext] = useState<MealContext>("fasting");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const loadLogs = useCallback(async () => {
    try {
      const recentLogs = await getRecentBloodSugarLogs(7);
      setLogs(recentLogs);
    } catch (error) {
      console.error("Error loading logs:", error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadLogs();
    }, [loadLogs])
  );

  const handleSave = async () => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) {
      Alert.alert("Invalid Value", "Please enter a valid blood sugar reading.");
      return;
    }

    setSaving(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const now = new Date();
      const log: BloodSugarLog = {
        id: generateId(),
        value: numValue,
        unit: "mg/dL",
        mealContext,
        notes: notes.trim() || undefined,
        loggedAt: now.toISOString(),
        date: now.toISOString().split("T")[0],
      };

      await addBloodSugarLog(log);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setValue("");
      setNotes("");
      setMealContext("fasting");
      setShowAddForm(false);
      await loadLogs();
    } catch (error) {
      Alert.alert("Error", "Failed to save reading. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (val: number): string => {
    if (val < 70) return theme.error;
    if (val > 180) return theme.error;
    if (val > 140) return "#FFB347";
    return theme.primary;
  };

  const getStatusText = (val: number): string => {
    if (val < 70) return "Low";
    if (val > 180) return "High";
    if (val > 140) return "Elevated";
    return "Normal";
  };

  const renderGraph = () => {
    if (logs.length === 0) {
      return (
        <View style={[styles.emptyGraph, { backgroundColor: theme.backgroundSecondary }]}>
          <Feather name="activity" size={32} color={theme.textSecondary} />
          <ThemedText type="body" style={{ color: theme.textSecondary, textAlign: "center" }}>
            Log your blood sugar to see trends
          </ThemedText>
        </View>
      );
    }

    const sortedLogs = [...logs].sort((a, b) => 
      new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime()
    ).slice(-7);

    const values = sortedLogs.map((l) => l.value);
    const minVal = Math.min(...values, 70);
    const maxVal = Math.max(...values, 180);
    const range = maxVal - minVal || 1;

    const padding = { top: 20, bottom: 30, left: 40, right: 20 };
    const graphInnerWidth = GRAPH_WIDTH - padding.left - padding.right;
    const graphInnerHeight = GRAPH_HEIGHT - padding.top - padding.bottom;

    const points = sortedLogs.map((log, i) => {
      const x = padding.left + (i / Math.max(sortedLogs.length - 1, 1)) * graphInnerWidth;
      const y = padding.top + ((maxVal - log.value) / range) * graphInnerHeight;
      return { x, y, value: log.value };
    });

    const pathData = points.length > 0
      ? `M ${points.map((p) => `${p.x} ${p.y}`).join(" L ")}`
      : "";

    return (
      <View style={[styles.graphCard, { backgroundColor: theme.backgroundDefault, ...Shadows.card }]}>
        <ThemedText type="h4" style={{ color: theme.text, marginBottom: Spacing.md }}>
          Last 7 Days
        </ThemedText>
        <Svg width={GRAPH_WIDTH} height={GRAPH_HEIGHT}>
          <Line x1={padding.left} y1={padding.top} x2={padding.left} y2={GRAPH_HEIGHT - padding.bottom} stroke={theme.taskPending} strokeWidth={1} />
          <Line x1={padding.left} y1={GRAPH_HEIGHT - padding.bottom} x2={GRAPH_WIDTH - padding.right} y2={GRAPH_HEIGHT - padding.bottom} stroke={theme.taskPending} strokeWidth={1} />
          
          {[minVal, (minVal + maxVal) / 2, maxVal].map((val, i) => {
            const y = padding.top + ((maxVal - val) / range) * graphInnerHeight;
            return (
              <React.Fragment key={i}>
                <Line x1={padding.left - 5} y1={y} x2={padding.left} y2={y} stroke={theme.taskPending} strokeWidth={1} />
                <SvgText x={padding.left - 8} y={y + 4} fontSize={10} fill={theme.textSecondary} textAnchor="end">
                  {Math.round(val)}
                </SvgText>
              </React.Fragment>
            );
          })}

          <Line
            x1={padding.left}
            y1={padding.top + ((maxVal - 100) / range) * graphInnerHeight}
            x2={GRAPH_WIDTH - padding.right}
            y2={padding.top + ((maxVal - 100) / range) * graphInnerHeight}
            stroke={theme.primary}
            strokeWidth={1}
            strokeDasharray="4 4"
          />

          <Path d={pathData} fill="none" stroke={theme.primary} strokeWidth={2} />
          
          {points.map((p, i) => (
            <Circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={6}
              fill={getStatusColor(p.value)}
              stroke={theme.backgroundDefault}
              strokeWidth={2}
            />
          ))}
        </Svg>
      </View>
    );
  };

  const renderRecentLogs = () => {
    if (logs.length === 0) return null;

    return (
      <View style={styles.section}>
        <ThemedText type="h4" style={[styles.sectionTitle, { color: theme.text }]}>
          Recent Readings
        </ThemedText>
        {logs.slice(0, 5).map((log) => {
          const date = new Date(log.loggedAt);
          const timeStr = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          const dateStr = date.toLocaleDateString([], { month: "short", day: "numeric" });

          return (
            <View
              key={log.id}
              style={[styles.logCard, { backgroundColor: theme.backgroundDefault, ...Shadows.card }]}
            >
              <View style={styles.logMain}>
                <View style={[styles.logValue, { backgroundColor: getStatusColor(log.value) + "20" }]}>
                  <ThemedText type="h2" style={{ color: getStatusColor(log.value) }}>
                    {log.value}
                  </ThemedText>
                  <ThemedText type="small" style={{ color: getStatusColor(log.value) }}>
                    mg/dL
                  </ThemedText>
                </View>
                <View style={styles.logDetails}>
                  <ThemedText type="body" style={{ color: theme.text, fontFamily: "Nunito_700Bold" }}>
                    {getStatusText(log.value)}
                  </ThemedText>
                  <ThemedText type="small" style={{ color: theme.textSecondary }}>
                    {MEAL_CONTEXTS.find((c) => c.value === log.mealContext)?.label || log.mealContext}
                  </ThemedText>
                  <ThemedText type="small" style={{ color: theme.textSecondary }}>
                    {dateStr} at {timeStr}
                  </ThemedText>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

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
      {showAddForm ? (
        <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault, ...Shadows.card }]}>
          <View style={styles.formHeader}>
            <ThemedText type="h3" style={{ color: theme.text }}>
              Log Blood Sugar
            </ThemedText>
            <Pressable onPress={() => setShowAddForm(false)}>
              <Feather name="x" size={24} color={theme.textSecondary} />
            </Pressable>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.valueInputContainer}>
              <TextInput
                style={[
                  styles.valueInput,
                  {
                    backgroundColor: theme.backgroundSecondary,
                    color: theme.text,
                    borderColor: theme.primary,
                  },
                ]}
                value={value}
                onChangeText={setValue}
                placeholder="120"
                placeholderTextColor={theme.textSecondary}
                keyboardType="numeric"
                autoFocus
              />
              <ThemedText type="body" style={{ color: theme.textSecondary }}>
                mg/dL
              </ThemedText>
            </View>
          </View>

          <ThemedText type="small" style={[styles.label, { color: theme.textSecondary }]}>
            When did you take this reading?
          </ThemedText>
          <View style={styles.contextGrid}>
            {MEAL_CONTEXTS.map((ctx) => (
              <Pressable
                key={ctx.value}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setMealContext(ctx.value);
                }}
                style={[
                  styles.contextButton,
                  {
                    backgroundColor:
                      mealContext === ctx.value ? theme.primary : theme.backgroundSecondary,
                    borderColor: mealContext === ctx.value ? theme.primary : "transparent",
                  },
                ]}
              >
                <Feather
                  name={ctx.icon as any}
                  size={18}
                  color={mealContext === ctx.value ? "#fff" : theme.textSecondary}
                />
                <ThemedText
                  type="small"
                  style={{
                    color: mealContext === ctx.value ? "#fff" : theme.text,
                    fontFamily: "Nunito_700Bold",
                  }}
                >
                  {ctx.label}
                </ThemedText>
              </Pressable>
            ))}
          </View>

          <TextInput
            style={[
              styles.notesInput,
              {
                backgroundColor: theme.backgroundSecondary,
                color: theme.text,
              },
            ]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Add notes (optional)"
            placeholderTextColor={theme.textSecondary}
            multiline
          />

          <Button onPress={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Reading"}
          </Button>
        </View>
      ) : (
        <Pressable
          style={[styles.addButton, { backgroundColor: theme.primary }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowAddForm(true);
          }}
        >
          <Feather name="plus" size={20} color="#fff" />
          <ThemedText type="body" style={{ color: "#fff", fontFamily: "Nunito_700Bold" }}>
            Log Blood Sugar
          </ThemedText>
        </Pressable>
      )}

      {renderGraph()}
      {renderRecentLogs()}
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
  section: {
    marginTop: Spacing.xl,
  },
  sectionTitle: {
    fontFamily: "Nunito_700Bold",
    marginBottom: Spacing.md,
  },
  formCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
  },
  formHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  inputRow: {
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  valueInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  valueInput: {
    width: 120,
    height: 64,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    textAlign: "center",
    fontSize: 28,
    fontFamily: "Nunito_700Bold",
  },
  label: {
    marginBottom: Spacing.sm,
  },
  contextGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  contextButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  notesInput: {
    height: 60,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    fontSize: 14,
    fontFamily: "Nunito_400Regular",
    marginBottom: Spacing.lg,
    textAlignVertical: "top",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    height: 56,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
  },
  graphCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  emptyGraph: {
    height: GRAPH_HEIGHT,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
    padding: Spacing.xl,
  },
  logCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  logMain: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  logValue: {
    alignItems: "center",
    justifyContent: "center",
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
  },
  logDetails: {
    flex: 1,
    gap: 2,
  },
});
