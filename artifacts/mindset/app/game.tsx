import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import LevelIntro from "@/components/LevelIntro";
import MemoryMatch from "@/components/games/MemoryMatch";
import PatternGame from "@/components/games/PatternGame";
import QuizGame from "@/components/games/QuizGame";
import ReflectionGame from "@/components/games/ReflectionGame";
import SequenceGame from "@/components/games/SequenceGame";
import { useGame } from "@/context/GameContext";
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  LEVELS,
  MemoryLevel,
  PatternLevel,
  QuizLevel,
  ReflectionLevel,
  SequenceLevel,
} from "@/data/levels";
import { useColors } from "@/hooks/useColors";

export default function GameScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ levelId?: string }>();
  const { currentLevelId, completeLevel } = useGame();

  const targetId = params.levelId ? parseInt(params.levelId, 10) : currentLevelId;
  const level = LEVELS.find((l) => l.id === targetId) ?? LEVELS[0];

  const [phase, setPhase] = useState<"intro" | "game" | "complete">("intro");

  const handleComplete = async () => {
    await completeLevel(level.id);
    setPhase("complete");
  };

  const catColor = CATEGORY_COLORS[level.category];
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;
  const nextLevel = LEVELS.find((l) => l.id === level.id + 1);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Game content */}
      {phase === "game" && (
        <>
          {/* Top bar */}
          <View style={[styles.topBar, { paddingTop: topPad + 10 }]}>
            <Pressable
              onPress={() => router.back()}
              hitSlop={12}
              style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
            >
              <Ionicons name="chevron-back" size={22} color={colors.mutedForeground} />
            </Pressable>
            <View style={styles.topCenter}>
              <View style={[styles.catPill, { backgroundColor: catColor + "20" }]}>
                <Text style={[styles.catText, { color: catColor }]}>
                  {CATEGORY_LABELS[level.category]}
                </Text>
              </View>
            </View>
            <View style={[styles.lvlBadge, { borderColor: catColor + "44" }]}>
              <Text style={[styles.lvlText, { color: catColor }]}>{level.id}</Text>
            </View>
          </View>

          {/* Accent line */}
          <View style={[styles.accentLine, { backgroundColor: catColor }]} />

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={[styles.scrollContent, { paddingBottom: botPad + 40 }]}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.content}>
              <View style={styles.titleBlock}>
                <Text style={[styles.levelNum, { color: colors.mutedForeground }]}>
                  Niveau {level.id}
                </Text>
                <Text style={[styles.levelTitle, { color: colors.foreground }]}>
                  {level.title}
                </Text>
              </View>

              {level.type === "sequence" && (
                <SequenceGame level={level as SequenceLevel} onComplete={handleComplete} />
              )}
              {level.type === "quiz" && (
                <QuizGame level={level as QuizLevel} catColor={catColor} onComplete={handleComplete} />
              )}
              {level.type === "memory" && (
                <MemoryMatch level={level as MemoryLevel} catColor={catColor} onComplete={handleComplete} />
              )}
              {level.type === "reflection" && (
                <ReflectionGame level={level as ReflectionLevel} catColor={catColor} onComplete={handleComplete} />
              )}
              {level.type === "pattern" && (
                <PatternGame level={level as PatternLevel} catColor={catColor} onComplete={handleComplete} />
              )}
            </View>
          </ScrollView>
        </>
      )}

      {/* Complete screen */}
      {phase === "complete" && (
        <>
          <View style={[styles.topBar, { paddingTop: topPad + 10 }]}>
            <Pressable onPress={() => router.back()} hitSlop={12} style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}>
              <Ionicons name="chevron-back" size={22} color={colors.mutedForeground} />
            </Pressable>
            <View style={{ flex: 1 }} />
          </View>

          <ScrollView
            contentContainerStyle={[styles.completeContent, { paddingBottom: botPad + 40 }]}
            showsVerticalScrollIndicator={false}
          >
            <View style={[styles.completeIcon, { backgroundColor: catColor + "20", borderColor: catColor + "44" }]}>
              <Ionicons name="checkmark" size={40} color={catColor} />
            </View>
            <Text style={[styles.completeTitle, { color: colors.foreground }]}>
              Niveau terminé !
            </Text>
            <Text style={[styles.completeSub, { color: colors.mutedForeground }]}>+100 points</Text>

            {nextLevel ? (
              <>
                <View style={[styles.nextPreview, { backgroundColor: colors.card, borderColor: CATEGORY_COLORS[nextLevel.category] + "55" }]}>
                  <Text style={[styles.nextLabel, { color: colors.mutedForeground }]}>Prochain niveau</Text>
                  <Text style={[styles.nextTitle, { color: colors.foreground }]}>{nextLevel.title}</Text>
                  <Text style={[styles.nextCat, { color: CATEGORY_COLORS[nextLevel.category] }]}>
                    {CATEGORY_LABELS[nextLevel.category]} · {nextLevel.type}
                  </Text>
                </View>
                <Pressable
                  onPress={() => router.replace({ pathname: "/game", params: { levelId: String(nextLevel.id) } })}
                  style={({ pressed }) => [styles.nextBtn, { backgroundColor: CATEGORY_COLORS[nextLevel.category], opacity: pressed ? 0.85 : 1 }]}
                >
                  <Text style={styles.nextBtnText}>Niveau suivant →</Text>
                </Pressable>
              </>
            ) : (
              <Text style={[styles.completeSub, { color: colors.mutedForeground }]}>
                Tu as terminé tous les niveaux ! 🎉
              </Text>
            )}

            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [styles.homeBtn, { borderColor: colors.border, opacity: pressed ? 0.7 : 1 }]}
            >
              <Text style={[styles.homeBtnText, { color: colors.mutedForeground }]}>← Accueil</Text>
            </Pressable>
          </ScrollView>
        </>
      )}

      {/* Intro overlay — rendered on top */}
      {phase === "intro" && (
        <>
          {/* Minimal back button under intro */}
          <View style={[styles.introBack, { paddingTop: topPad + 10 }]}>
            <Pressable onPress={() => router.back()} hitSlop={12} style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}>
              <Ionicons name="chevron-back" size={22} color={colors.mutedForeground} />
            </Pressable>
          </View>
          <LevelIntro level={level} onStart={() => setPhase("game")} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    justifyContent: "space-between",
  },
  topCenter: { flex: 1, alignItems: "center" },
  catPill: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 5 },
  catText: { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 2 },
  lvlBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  lvlText: { fontSize: 14, fontFamily: "Inter_700Bold" },
  accentLine: { height: 2, marginHorizontal: 16, borderRadius: 1, marginBottom: 4 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16 },
  content: { gap: 28 },
  titleBlock: { gap: 4 },
  levelNum: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  levelTitle: { fontSize: 26, fontFamily: "Inter_700Bold", lineHeight: 34 },

  completeContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 18,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  completeIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  completeTitle: { fontSize: 26, fontFamily: "Inter_700Bold" },
  completeSub: { fontSize: 14, fontFamily: "Inter_400Regular" },
  nextPreview: {
    width: "100%",
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 18,
    gap: 4,
  },
  nextLabel: { fontSize: 11, fontFamily: "Inter_400Regular", letterSpacing: 1 },
  nextTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  nextCat: { fontSize: 12, fontFamily: "Inter_500Medium", textTransform: "capitalize" },
  nextBtn: { width: "100%", borderRadius: 14, padding: 16, alignItems: "center" },
  nextBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
  homeBtn: { width: "100%", borderRadius: 14, padding: 14, alignItems: "center", borderWidth: 1 },
  homeBtnText: { fontSize: 15, fontFamily: "Inter_500Medium" },

  introBack: {
    position: "absolute",
    top: 0,
    left: 16,
    zIndex: 11,
  },
});
