import React from "react";
import { View, StyleSheet, Modal, Pressable, Share, Platform, Linking } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { BlurView } from "expo-blur";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface ShareAchievementModalProps {
  visible: boolean;
  streakCount: number;
  totalPoints: number;
  rewardsCount: number;
  onClose: () => void;
}

export function ShareAchievementModal({
  visible,
  streakCount,
  totalPoints,
  rewardsCount,
  onClose,
}: ShareAchievementModalProps) {
  const { theme } = useTheme();

  const shareMessage = `I'm taking care of my health with Diabetes Care!\n\nMy Progress:\nCurrent Streak: ${streakCount} days\nTotal Points: ${totalPoints}\nRewards Earned: ${rewardsCount}\n\nMade for your good health by Digital Samvaad`;

  const handleNativeShare = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await Share.share({
        message: shareMessage,
        title: "My Diabetes Care Progress",
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
    onClose();
  };

  const handleWhatsAppShare = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const encodedMessage = encodeURIComponent(shareMessage);
    const whatsappUrl = `whatsapp://send?text=${encodedMessage}`;
    
    try {
      const supported = await Linking.canOpenURL(whatsappUrl);
      if (supported) {
        await Linking.openURL(whatsappUrl);
      } else {
        // Fallback to web WhatsApp
        await Linking.openURL(`https://wa.me/?text=${encodedMessage}`);
      }
    } catch (error) {
      console.error("Error opening WhatsApp:", error);
    }
    onClose();
  };

  const handleFacebookShare = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const encodedMessage = encodeURIComponent(shareMessage);
    
    try {
      // Open Facebook with share intent
      const facebookUrl = `fb://composer?text=${encodedMessage}`;
      const supported = await Linking.canOpenURL(facebookUrl);
      
      if (supported) {
        await Linking.openURL(facebookUrl);
      } else {
        // Use native share as fallback for Facebook
        await Share.share({
          message: shareMessage,
          title: "Share to Facebook",
        });
      }
    } catch (error) {
      console.error("Error opening Facebook:", error);
    }
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <BlurView intensity={20} tint="dark" style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.backgroundDefault }]}>
          <View style={[styles.iconContainer, { backgroundColor: theme.secondary + "20" }]}>
            <Feather name="share-2" size={32} color={theme.secondary} />
          </View>

          <ThemedText type="h3" style={[styles.title, { color: theme.text }]}>
            Share Your Progress
          </ThemedText>
          
          <ThemedText type="body" style={[styles.subtitle, { color: theme.textSecondary }]}>
            Celebrate your achievements with friends and family!
          </ThemedText>

          {/* Preview Card */}
          <View style={[styles.previewCard, { backgroundColor: theme.backgroundSecondary }]}>
            <View style={styles.previewRow}>
              <Feather name="zap" size={16} color={theme.primary} />
              <ThemedText type="body" style={{ color: theme.text }}>
                {streakCount} day streak
              </ThemedText>
            </View>
            <View style={styles.previewRow}>
              <Feather name="star" size={16} color={theme.secondary} />
              <ThemedText type="body" style={{ color: theme.text }}>
                {totalPoints} points earned
              </ThemedText>
            </View>
            <View style={styles.previewRow}>
              <Feather name="award" size={16} color={theme.primary} />
              <ThemedText type="body" style={{ color: theme.text }}>
                {rewardsCount} rewards collected
              </ThemedText>
            </View>
          </View>

          {/* Share Buttons */}
          <View style={styles.shareButtons}>
            <Pressable
              style={[styles.shareButton, { backgroundColor: "#25D366" }]}
              onPress={handleWhatsAppShare}
            >
              <Feather name="message-circle" size={24} color="#fff" />
              <ThemedText type="h4" style={styles.shareButtonText}>
                WhatsApp
              </ThemedText>
            </Pressable>

            <Pressable
              style={[styles.shareButton, { backgroundColor: "#1877F2" }]}
              onPress={handleFacebookShare}
            >
              <Feather name="facebook" size={24} color="#fff" />
              <ThemedText type="h4" style={styles.shareButtonText}>
                Facebook
              </ThemedText>
            </Pressable>
          </View>

          <Pressable
            style={[styles.otherButton, { borderColor: theme.primary }]}
            onPress={handleNativeShare}
          >
            <Feather name="share" size={18} color={theme.primary} />
            <ThemedText type="body" style={{ color: theme.primary }}>
              More Options
            </ThemedText>
          </Pressable>

          <Pressable style={styles.closeButton} onPress={onClose}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Maybe Later
            </ThemedText>
          </Pressable>

          {/* Branding */}
          <View style={[styles.branding, { backgroundColor: theme.primary }]}>
            <ThemedText type="body" style={styles.brandingText}>
              Made for your good health
            </ThemedText>
            <Pressable 
              onPress={() => Linking.openURL("https://www.digitalsamvaad.in")}
              style={({ pressed }) => [pressed && { opacity: 0.7 }]}
            >
              <ThemedText type="h4" style={styles.brandingCompany}>
                by Digital Samvaad
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  container: {
    width: "100%",
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: "center",
    gap: Spacing.sm,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  title: {
    fontFamily: "Nunito_700Bold",
    textAlign: "center",
  },
  subtitle: {
    fontFamily: "Nunito_400Regular",
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  previewCard: {
    width: "100%",
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  shareButtons: {
    flexDirection: "row",
    gap: Spacing.md,
    width: "100%",
  },
  shareButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  shareButtonText: {
    color: "#fff",
    fontFamily: "Nunito_700Bold",
  },
  otherButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    width: "100%",
  },
  closeButton: {
    marginTop: Spacing.sm,
    padding: Spacing.sm,
  },
  branding: {
    marginTop: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    width: "100%",
    gap: 2,
  },
  brandingText: {
    color: "#fff",
    fontFamily: "Nunito_400Regular",
    fontSize: 13,
  },
  brandingCompany: {
    color: "#fff",
    fontFamily: "Nunito_700Bold",
    fontSize: 15,
    textDecorationLine: "underline",
  },
});
