# Diabetes Care Reminder App

## Overview

A compassionate health companion mobile application designed to help diabetic patients follow daily health routines through gentle reminders, rewards, and recovery systems. The app emphasizes a supportive, guilt-free experience with a soft pastel aesthetic and an encouraging companion character that celebrates wins without judgment.

**Core Features:**
- Daily task tracking for medicine, water, meals, sugar checks, and exercise
- Habit management with customizable reminders
- Gamified reward system with streaks, points, and collectible items
- Recovery system for missed tasks without penalty or guilt
- Local-first data storage (no authentication required)
- Advanced reminder system with snooze options (5 min delay with red blinking indicator)
- Point-based rewards (+10 for completion) and penalties (-5 for skipping)
- Point recovery mechanism with "I promise" feature
- Social sharing for achievements (WhatsApp, Facebook)
- Branding: "Made for your good health by Digital Samvaad"

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework:** React Native with Expo SDK 54
- Uses Expo managed workflow with new architecture enabled
- React 19.1.0 with React Compiler experiment enabled

**Navigation:** React Navigation v7
- Bottom tab navigator with 4 main tabs: Today, Habits, Rewards, Profile
- Native stack navigators for each tab with modal presentations
- Floating Action Button overlay for quick task logging

**State Management:**
- TanStack Query for server state and caching
- Local component state with useState/useCallback hooks
- AsyncStorage for persistent local data

**Styling Approach:**
- Custom theming system with light/dark mode support
- Soft pastel color palette with organic warmth
- Reanimated 4 for fluid animations and micro-interactions
- Expo Haptics for tactile feedback

**Key Design Patterns:**
- Compound component architecture (ThemedText, ThemedView)
- Custom hooks for theme access (useTheme, useScreenOptions)
- Error boundaries with fallback UI
- Keyboard-aware scroll views with platform-specific handling

### Backend Architecture

**Server:** Express.js with TypeScript
- Runs on port 5000
- CORS configured for Replit domains and localhost development
- Static file serving for production web builds

**API Design:**
- RESTful endpoints prefixed with `/api`
- Currently minimal server usage - app is primarily local-first
- Prepared for future PostgreSQL integration

**Build System:**
- tsx for development server
- esbuild for production server bundling
- Expo for mobile and web client builds

### Data Storage Solutions

**Primary Storage:** AsyncStorage (local device storage)
- User profiles, habits, completed tasks, streaks, rewards, points
- No cloud sync currently - all data persists locally

**Database Schema (Prepared):** PostgreSQL with Drizzle ORM
- Users table defined with UUID primary keys
- Schema ready for future cloud sync features
- Drizzle-zod for validation schema generation

### Path Aliases

- `@/*` maps to `./client/*`
- `@shared/*` maps to `./shared/*`

## External Dependencies

### Third-Party Services
- None currently - app operates fully offline

### Key Libraries
- **expo-haptics:** Tactile feedback for interactions
- **expo-blur:** iOS-style blur effects for navigation
- **react-native-reanimated:** Smooth animations and gestures
- **react-native-svg:** Progress ring and visual elements
- **@expo-google-fonts/nunito:** Custom typography

### Database
- PostgreSQL via Drizzle ORM (schema prepared, not actively used)
- AsyncStorage for current local-only implementation

### Development Tools
- ESLint with Expo config and Prettier integration
- TypeScript with strict mode
- Drizzle Kit for database migrations