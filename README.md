# Diabetes Care Reminder App

A compassionate health companion mobile application designed to help diabetic patients follow daily health routines through gentle reminders, rewards, and recovery systems.

## Features

### Daily Health Tracking
- **Medicine Reminders** - Never miss your medication
- **Water Intake** - Stay hydrated throughout the day
- **Meal Tracking** - Log your breakfast, lunch, and dinner
- **Sugar Checks** - Track your blood sugar monitoring
- **Exercise** - Stay active with daily movement reminders

### Smart Reminder System
- Tap any task to confirm you're doing it now (+10 points)
- "Remind me in 5 minutes" snooze option
- After snooze expires, asks "Have you done this?"
- Red blinking indicator for overdue tasks

### Gamified Rewards
- **Points System** - Earn +10 points for completing tasks
- **Streaks** - Build daily streaks for consistency
- **Collectible Rewards** - Unlock flowers and gems as you progress
- **Recovery Feature** - "I promise" button to recover lost points

### Social Sharing
- Share your achievements on WhatsApp
- Share to Facebook
- Native share to any app

### Supportive Experience
- Friendly companion character with encouraging messages
- Soft, calming pastel design (sage green & warm peach)
- No guilt or judgment - supports recovery from missed tasks
- Celebrates every win, big or small

## Screenshots

The app features a warm, supportive design with:
- Today tab - View and complete daily tasks
- Habits tab - Manage your health routines
- Rewards tab - See your achievements and share progress
- Profile tab - Settings and personalization

## Tech Stack

- **Frontend**: React Native with Expo SDK 54
- **Navigation**: React Navigation v7
- **State Management**: TanStack Query + AsyncStorage
- **Animations**: React Native Reanimated 4
- **Typography**: Nunito (Google Fonts)
- **Backend**: Express.js (prepared for future cloud sync)

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo Go app on your phone (for testing)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/diabetes-care-app.git
cd diabetes-care-app
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run expo:dev
```

4. Scan the QR code with Expo Go (Android) or Camera app (iOS)

### Running on Web
```bash
npm run expo:dev
# Then press 'w' to open in browser
```

## Project Structure

```
├── client/
│   ├── components/     # Reusable UI components
│   ├── screens/        # App screens (Today, Habits, Rewards, Profile)
│   ├── navigation/     # Navigation configuration
│   ├── lib/           # Utilities and storage helpers
│   ├── hooks/         # Custom React hooks
│   └── constants/     # Theme and design tokens
├── server/            # Express.js backend
├── shared/            # Shared types and schemas
└── assets/            # Images and icons
```

## Building for Production

### Android APK
```bash
npx eas build --platform android --profile preview
```

### iOS
```bash
npx eas build --platform ios
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Credits

Made for your good health by **[Digital Samvaad](https://www.digitalsamvaad.in)**

---

Built with React Native and Expo
