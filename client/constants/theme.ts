import { Platform } from "react-native";

// Diabetes Care App Design System
// Soft/pastel with organic warmth - "supportive friend" aesthetic

export const Colors = {
  light: {
    // Core palette
    primary: "#7EC8A3", // Soft sage green - calming, health-positive
    accent: "#FFB347", // Warm peach - encouraging, gentle
    
    // Backgrounds
    backgroundRoot: "#FAFBF8", // Warm off-white
    backgroundDefault: "#FFFFFF", // Pure white for cards
    backgroundSecondary: "#F0F4F1", // Very light sage tint
    backgroundTertiary: "#E8EDE9", // Slightly deeper sage
    
    // Text
    text: "#2D3E3C", // Soft charcoal
    textSecondary: "#7A8C89", // Muted grey-green
    buttonText: "#FFFFFF",
    
    // Semantic
    success: "#7EC8A3", // Same as primary
    warning: "#FFB347", // Same as accent
    error: "#E57373", // Soft red
    
    // UI
    link: "#7EC8A3",
    tabIconDefault: "#7A8C89",
    tabIconSelected: "#7EC8A3",
    
    // Task states
    taskComplete: "#7EC8A3",
    taskPending: "#E8EDE9",
    taskMissed: "#FFB347",
    
    // Card shadows
    shadowColor: "#2D3E3C",
  },
  dark: {
    // Core palette
    primary: "#8FD4B3", // Lighter sage for dark mode
    accent: "#FFBE5C", // Lighter peach for dark mode
    
    // Backgrounds
    backgroundRoot: "#1A1F1E", // Dark sage-tinted
    backgroundDefault: "#242928", // Card background
    backgroundSecondary: "#2E3432", // Elevated surfaces
    backgroundTertiary: "#383F3D", // Most elevated
    
    // Text
    text: "#E8EDE9", // Light sage-tinted
    textSecondary: "#9BA8A5", // Muted light sage
    buttonText: "#1A1F1E",
    
    // Semantic
    success: "#8FD4B3",
    warning: "#FFBE5C",
    error: "#EF9A9A",
    
    // UI
    link: "#8FD4B3",
    tabIconDefault: "#9BA8A5",
    tabIconSelected: "#8FD4B3",
    
    // Task states
    taskComplete: "#8FD4B3",
    taskPending: "#383F3D",
    taskMissed: "#FFBE5C",
    
    // Card shadows
    shadowColor: "#000000",
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  "6xl": 56,
  inputHeight: 48,
  buttonHeight: 52,
  checkboxSize: 40,
  fabSize: 56,
  companionSize: 80,
  avatarSize: 100,
  progressRingSize: 120,
  rewardItemSize: 80,
};

export const BorderRadius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  "2xl": 32,
  "3xl": 40,
  full: 9999,
};

export const Shadows = {
  card: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  fab: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  button: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
};

export const Typography = {
  display: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: "700" as const,
    fontFamily: "Nunito_700Bold",
  },
  h1: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: "700" as const,
    fontFamily: "Nunito_700Bold",
  },
  h2: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "700" as const,
    fontFamily: "Nunito_700Bold",
  },
  h3: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "600" as const,
    fontFamily: "Nunito_700Bold",
  },
  h4: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600" as const,
    fontFamily: "Nunito_700Bold",
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400" as const,
    fontFamily: "Nunito_400Regular",
  },
  small: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400" as const,
    fontFamily: "Nunito_400Regular",
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "400" as const,
    fontFamily: "Nunito_400Regular",
  },
  link: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400" as const,
    fontFamily: "Nunito_400Regular",
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "Nunito_400Regular",
    bold: "Nunito_700Bold",
  },
  android: {
    sans: "Nunito_400Regular",
    bold: "Nunito_700Bold",
  },
  default: {
    sans: "Nunito_400Regular",
    bold: "Nunito_700Bold",
  },
  web: {
    sans: "Nunito_400Regular, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    bold: "Nunito_700Bold, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  },
});

// Habit icons mapping
export const HabitIcons = {
  medicine: "heart",
  water: "droplet",
  meal: "coffee",
  sugar: "activity",
  exercise: "zap",
  sleep: "moon",
  custom: "star",
} as const;

// Default habits for new users
export const DefaultHabits = [
  {
    id: "medicine",
    name: "Take Medicine",
    icon: "heart",
    time: "08:00",
    enabled: true,
  },
  {
    id: "water",
    name: "Drink Water",
    icon: "droplet",
    time: "09:00",
    enabled: true,
  },
  {
    id: "meal",
    name: "Healthy Meal",
    icon: "coffee",
    time: "12:00",
    enabled: true,
  },
  {
    id: "sugar",
    name: "Check Sugar Level",
    icon: "activity",
    time: "14:00",
    enabled: true,
  },
  {
    id: "exercise",
    name: "Light Exercise",
    icon: "zap",
    time: "17:00",
    enabled: true,
  },
];
