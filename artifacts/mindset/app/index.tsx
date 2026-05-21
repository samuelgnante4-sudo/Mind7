import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useGame } from "@/context/GameContext";
import { CATEGORY_COLORS, CATEGORY_LABELS, CHAPTERS, LEVELS } from "@/data/levels";
import { useColors } from "@/hooks/useColors";

const TYPE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  sequence: "grid-outline",
  quiz: "help-circle-outline",
  memory: "copy-outline",
  reflection: "eye-outline",
  pattern: "analytics-outline",
};

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { currentLevelId, completedLevels, totalScore, isLevelCompleted, isLevelUnlocked } = useGame();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 900, useNativeDriver: true }).start();
  }, []);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const completionPct = Math.round((completedLevels.length / LEVELS.length) * 100);
  const currentLevel = LEVELS.find((l) => l.id === currentLevelId);
  const currentChapter = CHAPTERS.find((c) => c.levels.includes(currentLevelId));

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topPad + 24, paddingBottom: botPad + 24 }]}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View style={[styles.inner, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.brand, { color: colors.foreground }]}>MIND<Text style={{ color: colors.primary }}>7</Text></Text>
            <Text style={[styles.tagline, { color: colors.mutedForeground }]}>7 façons de penser</Text>
          </View>
          <View style={[styles.scoreBadge, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.scoreValue, { color: colors.primary }]}>{totalScore}</Text>
            <Text style={[styles.scoreLabel, { color: colors.mutedForeground }]}>pts</Text>
          </View>
        </View>

        {/* Current level banner */}
        {currentLevel && (
          <Pressable
            onPress={() => router.push("/game")}
            style={({ pressed }) => [
              styles.currentBanner,
              {
                backgroundColor: colors.card,
                borderColor: CATEGORY_COLORS[currentLevel.category],
                opacity: pressed ? 0.9 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
            ]}
          >
            <View style={[styles.catTag, { backgroundColor: CATEGORY_COLORS[currentLevel.category] + "22" }]}>
              <Text style={[styles.catTagText, { color: CATEGORY_COLORS[currentLevel.category] }]}>
                {CATEGORY_LABELS[currentLevel.category]}
              </Text>
            </View>
            <View style={styles.bannerBody}>
              <View>
                <Text style={[styles.bannerChapter, { color: colors.mutedForeground }]}>
                  {currentChapter ? `Chapitre ${currentChapter.id} — ${currentChapter.title}` : ""}
                </Text>
                <Text style={[styles.bannerTitle, { color: colors.foreground }]}>
                  Niveau {currentLevelId} — {currentLevel.title}
                </Text>
              </View>
              <View style={[styles.playPill, { backgroundColor: CATEGORY_COLORS[currentLevel.category] }]}>
                <Ionicons name="play" size={16} color="#fff" />
              </View>
            </View>

            <View style={[styles.progressTrack, { backgroundColor: colors.secondary }]}>
              <View
                style={[
                  styles.progressFill,
                  { backgroundColor: CATEGORY_COLORS[currentLevel.category], width: `${completionPct}%` },
                ]}
              />
            </View>
            <Text style={[styles.progressLabel, { color: colors.mutedForeground }]}>
              {completedLevels.length} / {LEVELS.length} niveaux — {completionPct}%
            </Text>
          </Pressable>
        )}

        {/* Chapters */}
        {CHAPTERS.map((chapter) => {
          const chapterDone = chapter.levels.filter((id) => isLevelCompleted(id)).length;
          const isUnlocked = isLevelUnlocked(chapter.levels[0]);

          return (
            <View key={chapter.id} style={[styles.chapter, { borderColor: colors.border, backgroundColor: colors.card }]}>
              <View style={styles.chapterHeader}>
                <View>
                  <Text style={[styles.chapterNum, { color: colors.mutedForeground }]}>CHAPITRE {chapter.id}</Text>
                  <Text style={[styles.chapterTitle, { color: isUnlocked ? colors.foreground : colors.mutedForeground }]}>
                    {chapter.title}
                  </Text>
                </View>
                <Text style={[styles.chapterProgress, { color: colors.mutedForeground }]}>
                  {chapterDone}/{chapter.levels.length}
                </Text>
              </View>

              <View style={styles.levelList}>
                {chapter.levels.map((levelId) => {
                  const lvl = LEVELS.find((l) => l.id === levelId);
                  if (!lvl) return null;
                  const done = isLevelCompleted(levelId);
                  const unlocked = isLevelUnlocked(levelId);
                  const isCurrent = levelId === currentLevelId;
                  const catColor = CATEGORY_COLORS[lvl.category];

                  return (
                    <Pressable
                      key={levelId}
                      onPress={() => unlocked && router.push({ pathname: "/game", params: { levelId: String(levelId) } })}
                      disabled={!unlocked}
                      style={({ pressed }) => [
                        styles.levelRow,
                        {
                          backgroundColor: isCurrent ? catColor + "12" : "transparent",
                          borderColor: isCurrent ? catColor + "55" : "transparent",
                          opacity: !unlocked ? 0.4 : pressed ? 0.75 : 1,
                        },
                      ]}
                    >
                      <View style={[styles.levelIcon, { backgroundColor: done ? catColor + "22" : colors.secondary, borderColor: done ? catColor : colors.border }]}>
                        <Ionicons
                          name={done ? "checkmark" : unlocked ? TYPE_ICONS[lvl.type] : "lock-closed-outline"}
                          size={14}
                          color={done ? catColor : colors.mutedForeground}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.levelTitle, { color: unlocked ? colors.foreground : colors.mutedForeground }]}>
                          {lvl.title}
                        </Text>
                        <Text style={[styles.levelMeta, { color: colors.mutedForeground }]}>
                          {CATEGORY_LABELS[lvl.category]} · {lvl.type.charAt(0).toUpperCase() + lvl.type.slice(1)}
                        </Text>
                      </View>
                      {isCurrent && (
                        <View style={[styles.currentDot, { backgroundColor: catColor }]} />
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </View>
          );
        })}
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20 },
  inner: { gap: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  brand: { fontSize: 38, fontFamily: "Inter_700Bold", letterSpacing: 4 },
  tagline: { fontSize: 12, fontFamily: "Inter_400Regular", letterSpacing: 3, textTransform: "uppercase", marginTop: 2 },
  scoreBadge: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 8, alignItems: "center" },
  scoreValue: { fontSize: 20, fontFamily: "Inter_700Bold" },
  scoreLabel: { fontSize: 10, fontFamily: "Inter_400Regular", textTransform: "uppercase", letterSpacing: 1 },
  currentBanner: { borderRadius: 20, borderWidth: 1.5, padding: 18, gap: 12 },
  catTag: { alignSelf: "flex-start", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  catTagText: { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 2 },
  bannerBody: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  bannerChapter: { fontSize: 11, fontFamily: "Inter_400Regular", letterSpacing: 1, marginBottom: 4 },
  bannerTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  playPill: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  progressTrack: { height: 3, borderRadius: 2, overflow: "hidden" },
  progressFill: { height: 3, borderRadius: 2 },
  progressLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  chapter: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  chapterHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, paddingBottom: 12 },
  chapterNum: { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 2 },
  chapterTitle: { fontSize: 17, fontFamily: "Inter_700Bold", marginTop: 2 },
  chapterProgress: { fontSize: 13, fontFamily: "Inter_500Medium" },
  levelList: { gap: 0 },
  levelRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 0, borderWidth: 1, marginHorizontal: 8, marginBottom: 4, borderRadius: 10 },
  levelIcon: { width: 30, height: 30, borderRadius: 8, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  levelTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  levelMeta: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  currentDot: { width: 8, height: 8, borderRadius: 4 },
});
