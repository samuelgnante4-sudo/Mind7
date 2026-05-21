import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useGame } from "@/context/GameContext";
import { useColors } from "@/hooks/useColors";

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { level, bestLevel, totalGamesPlayed } = useGame();

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const topPadding =
    Platform.OS === "web" ? 67 : insets.top;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: topPadding + 20,
          paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 20,
        },
      ]}
    >
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.brandName, { color: colors.primary }]}>
            MINDSET
          </Text>
          <Text style={[styles.tagline, { color: colors.mutedForeground }]}>
            Memory Training
          </Text>
        </View>

        {/* Grid preview */}
        <Animated.View
          style={[styles.gridPreview, { transform: [{ scale: pulseAnim }] }]}
        >
          {[0, 1, 2, 3].map((i) => (
            <View
              key={i}
              style={[
                styles.previewButton,
                {
                  backgroundColor: colors.secondary,
                  borderColor: colors.border,
                  shadowColor: colors.primary,
                },
              ]}
            />
          ))}
        </Animated.View>

        {/* Stats row */}
        <View
          style={[
            styles.statsRow,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>
              {bestLevel}
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
              Meilleur
            </Text>
          </View>
          <View
            style={[styles.statDivider, { backgroundColor: colors.border }]}
          />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>
              {level}
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
              Niveau
            </Text>
          </View>
          <View
            style={[styles.statDivider, { backgroundColor: colors.border }]}
          />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>
              {totalGamesPlayed}
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
              Parties
            </Text>
          </View>
        </View>

        {/* Play button */}
        <Pressable
          onPress={() => router.push("/game")}
          style={({ pressed }) => [
            styles.playButton,
            {
              backgroundColor: colors.primary,
              opacity: pressed ? 0.85 : 1,
              transform: [{ scale: pressed ? 0.97 : 1 }],
            },
          ]}
        >
          <Ionicons name="play" size={24} color={colors.primaryForeground} />
          <Text
            style={[styles.playButtonText, { color: colors.primaryForeground }]}
          >
            Jouer — Niveau {level}
          </Text>
        </Pressable>

        {/* How to play */}
        <View
          style={[
            styles.howToPlay,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text
            style={[styles.howToPlayTitle, { color: colors.foreground }]}
          >
            Comment jouer
          </Text>
          {[
            { icon: "eye-outline" as const, text: "Observe la séquence lumineuse" },
            { icon: "hand-left-outline" as const, text: "Reproduis-la dans le bon ordre" },
            { icon: "trending-up-outline" as const, text: "200 niveaux de difficulté" },
          ].map(({ icon, text }, idx) => (
            <View key={idx} style={styles.howToPlayRow}>
              <Ionicons
                name={icon}
                size={18}
                color={colors.primary}
                style={styles.howToPlayIcon}
              />
              <Text
                style={[styles.howToPlayText, { color: colors.mutedForeground }]}
              >
                {text}
              </Text>
            </View>
          ))}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    gap: 28,
  },
  header: {
    alignItems: "center",
    gap: 6,
  },
  brandName: {
    fontSize: 42,
    fontFamily: "Inter_700Bold",
    letterSpacing: 8,
  },
  tagline: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    letterSpacing: 4,
    textTransform: "uppercase",
  },
  gridPreview: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: 160,
    height: 160,
    gap: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  previewButton: {
    width: 68,
    height: 68,
    borderRadius: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    width: "100%",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
  },
  statLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  statDivider: {
    width: 1,
    height: 36,
    marginHorizontal: 8,
  },
  playButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 40,
    width: "100%",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  playButtonText: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
  },
  howToPlay: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    width: "100%",
    gap: 12,
  },
  howToPlayTitle: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 4,
  },
  howToPlayRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  howToPlayIcon: {
    width: 22,
  },
  howToPlayText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    flex: 1,
  },
});
