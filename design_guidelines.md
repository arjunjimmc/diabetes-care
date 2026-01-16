# Diabetes Care Reminder App - Design Guidelines

## 1. Brand Identity

**Purpose**: A compassionate health companion that gently guides diabetic patients through daily care routines without guilt or pressure.

**Aesthetic Direction**: Soft/pastel with organic warmth. Think "supportive friend" not "clinical tracker." Rounded, gentle, breathing room. The app should feel like a warm hug, not a strict teacher.

**Memorable Element**: A persistent companion character (illustrated avatar) that celebrates wins, encourages recovery, and never judges—appearing throughout the app as emotional support.

## 2. Navigation Architecture

**Root Navigation**: Tab Navigation (4 tabs + floating action)
- **Today** (Home) - Daily task list and progress
- **Habits** - Routine management
- **Rewards** - Achievement garden/collection
- **Profile** - Settings and streaks

**Floating Action Button**: "Log Now" - Quick entry for completed tasks (positioned center-bottom, above tab bar)

**No Authentication Required** (local-only app). Profile screen includes customizable avatar, display name, and preferences.

## 3. Screen-by-Screen Specifications

### Today Screen (Home Tab)
- **Purpose**: View and complete daily health tasks
- **Header**: Transparent, left: date picker icon, right: notification settings, title: "Good Morning, [Name]"
- **Layout**: Scrollable with sections
  - Top: Companion character with encouraging message based on today's progress
  - Daily Progress Ring (circular, shows % of tasks completed)
  - Task Cards (medicine, water, meals, sugar check, exercise) - each with checkbox, time, and gentle reminder text
  - "Missed Yesterday?" recovery card (only shows if tasks were skipped)
- **Safe Area**: Top: headerHeight + Spacing.xl, Bottom: tabBarHeight + Spacing.xl + FAB height
- **Empty State**: New user welcome with setup prompt

### Habits Screen
- **Purpose**: Manage and customize care routines
- **Header**: Transparent, title: "My Habits", right: edit mode toggle
- **Layout**: Scrollable list
  - Habit cards with icon, name, time, frequency, enable/disable toggle
  - Add habit button (full-width, dashed border)
- **Safe Area**: Top: headerHeight + Spacing.xl, Bottom: tabBarHeight + Spacing.xl

### Rewards Screen
- **Purpose**: View achievements and collected "care gems"
- **Header**: Transparent, title: "Your Garden"
- **Layout**: Scrollable grid
  - Top: Total streak counter with animated plant growth visual
  - Grid of unlocked reward illustrations (flowers, gems, badges)
  - Locked rewards (greyed out with unlock requirements)
- **Safe Area**: Top: headerHeight + Spacing.xl, Bottom: tabBarHeight + Spacing.xl
- **Empty State**: Seedling illustration with "Start your journey"

### Profile Screen
- **Purpose**: User preferences and app settings
- **Header**: Transparent, title: "Profile"
- **Layout**: Scrollable form sections
  - Avatar selection (circular, large, tappable)
  - Display name field
  - Theme toggle (light/dark)
  - Notification preferences
  - Data management (export, reset)
- **Safe Area**: Top: headerHeight + Spacing.xl, Bottom: tabBarHeight + Spacing.xl

### Modals
- **Add/Edit Habit Modal**: Stack navigation, header with cancel/save, scrollable form
- **Recovery Encouragement Modal**: Appears after missed tasks, gentle language, "Skip with grace" or "Make up now" options

## 4. Color Palette

**Primary**: #7EC8A3 (Soft sage green - calming, health-positive)
**Accent**: #FFB347 (Warm peach - encouraging, gentle)
**Background**: #FAFBF8 (Warm off-white)
**Surface**: #FFFFFF (Pure white for cards)
**Text Primary**: #2D3E3C (Soft charcoal, not pure black)
**Text Secondary**: #7A8C89 (Muted grey-green)
**Success**: #7EC8A3 (same as primary - completion)
**Warning**: #FFB347 (same as accent - gentle nudge)
**Surface Tint**: #F0F4F1 (Very light sage)

## 5. Typography

**Font Family**: Nunito (Google Font - friendly, rounded, highly legible)
**Type Scale**:
- **Display**: 32px, Bold - Welcome messages
- **Title Large**: 24px, Bold - Screen headers
- **Title**: 18px, SemiBold - Card headers
- **Body**: 16px, Regular - Task descriptions
- **Caption**: 14px, Regular - Timestamps, hints

## 6. Visual Design

**Cards**: Rounded (borderRadius: 16), subtle shadow (offset: 0/2, opacity: 0.06, radius: 8), white background
**Task Checkboxes**: Large circular (40px), primary color when checked, animated scale on press
**FAB**: 56px circle, primary color, "+" icon, shadow (offset: 0/4, opacity: 0.10, radius: 6)
**Companion Character**: Illustrated avatar in top card, changes expression based on progress (happy, encouraging, celebrating)
**Icons**: Feather icon set from @expo/vector-icons, 24px default size

## 7. Assets to Generate

1. **icon.png** - App icon: Gentle companion character (plant-like, rounded) with soft green background
2. **splash-icon.png** - Same as icon, centered on warm off-white background
3. **companion-happy.png** - Companion celebrating (USED: Today screen when >80% tasks done)
4. **companion-encouraging.png** - Companion with gentle smile (USED: Today screen when 20-80% done)
5. **companion-supportive.png** - Companion with open arms (USED: Recovery modal, missed tasks)
6. **empty-habits.png** - Single seedling in pot (USED: Habits screen empty state)
7. **empty-rewards.png** - Small sprout breaking through soil (USED: Rewards screen empty state)
8. **avatar-preset.png** - Default user avatar: soft circular portrait with plant motif
9. **reward-flower-1.png** - Unlockable flower illustration (USED: Rewards grid, 7-day streak)
10. **reward-flower-2.png** - Different flower (USED: Rewards grid, 30-day streak)
11. **reward-gem.png** - Care gem illustration (USED: Rewards grid, perfect week)

**Style**: Soft, watercolor-like illustrations with rounded shapes, sage green and peach accent colors, hand-drawn feel, calming and organic.