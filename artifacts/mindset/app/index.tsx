import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import MascotCharacter from "@/components/MascotCharacter";
import { PSYCH_PROFILES, useGame } from "@/context/GameContext";
import { useTheme } from "@/context/ThemeContext";
import { CATEGORY_COLORS, CATEGORY_LABELS, CHAPTERS, LEVELS } from "@/data/levels";
import { useColors } from "@/hooks/useColors";

// Spectrum bar — 7 dots representing the 7 tiers
function ProfileSpectrum({ position, accent }: { position: number; accent: string }) {
  const colors = useColors();
  return (
    <View style={spectrum.wrap}>
      <Text style={spectrum.endLabel}>🕳️</Text>
      <View style={spectrum.track}>
        {PSYCH_PROFILES.map((p, i) => {
          const dotPos = i / (PSYCH_PROFILES.length - 1);
          const isActive = Math.abs(dotPos - position) < 0.09;
          return (
            <View
              key={p.id}
              style={[
                spectrum.dot,
                {
                  backgroundColor: isActive ? accent : colors.secondary,
                  width: isActive ? 14 : 8,
                  height: isActive ? 14 : 8,
                  borderRadius: isActive ? 7 : 4,
                  borderWidth: isActive ? 2 : 0,
                  borderColor: isActive ? accent + "55" : "transparent",
                },
              ]}
            />
          );
        })}
      </View>
      <Text style={spectrum.endLabel}>🕊️</Text>
    </View>
  );
}

const spectrum = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "center", gap: 8 },
  track: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  dot: {},
  endLabel: { fontSize: 16 },
});

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { primaryColor } = useTheme();
  const { currentLevelId, completedLevels, profile, profileScore, profilePosition, isLevelCompleted, isLevelUnlocked } = useGame();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 900, useNativeDriver: true }).start();
  }, []);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const completionPct = Math.round((completedLevels.length / LEVELS.length) * 100);
  const currentLevel = LEVELS.find((l) => l.id === currentLevelId);
  const currentChapter = CHAPTERS.find((c) => c.levels.includes(currentLevelId));
  const answeredCount = completedLevels.length;

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topPad + 20, paddingBottom: botPad + 24 }]}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View style={[styles.inner, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <Text style={[styles.brand, { color: colors.foreground }]}>
              MIND<Text style={{ color: primaryColor }}>7</Text>
            </Text>
            <Text style={[styles.tagline, { color: colors.mutedForeground }]}>7 façons de penser</Text>
          </View>
          <Pressable
            onPress={() => router.push("/customize")}
            style={({ pressed }) => [
              styles.customizeBtn,
              { backgroundColor: colors.card, borderColor: primaryColor + "55", opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <View style={[styles.colorDot, { backgroundColor: primaryColor }]} />
          </Pressable>
        </View>

        {/* ── PSYCHOLOGICAL PROFILE CARD ── */}
        {answeredCount === 0 ? (
          // Not started yet
          <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.profileTopRow}>
              <Text style={styles.profileEmoji}>🔮</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.profileUnknownLabel, { color: colors.mutedForeground }]}>TON PROFIL PSYCHOLOGIQUE</Text>
                <Text style={[styles.profileName, { color: colors.foreground }]}>Inconnu</Text>
              </View>
            </View>
            <Text style={[styles.profileTagline, { color: colors.mutedForeground }]}>
              Réponds à au moins 1 dilemme pour découvrir ton profil.
            </Text>
            <View style={[styles.profileProgress, { backgroundColor: colors.secondary }]}>
              <Text style={[styles.profileProgressText, { color: colors.mutedForeground }]}>
                0 / 30 dilemmes répondus
              </Text>
            </View>
          </View>
        ) : profile ? (
          // Profile known
          <View
            style={[
              styles.profileCard,
              { backgroundColor: profile.bg, borderColor: profile.accent + "44" },
            ]}
          >
            <View style={styles.profileTopRow}>
              <Text style={styles.profileEmoji}>{profile.emoji}</Text>
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={[styles.profileUnknownLabel, { color: profile.accent + "aa" }]}>
                  TON PROFIL · {answeredCount} DILEMME{answeredCount > 1 ? "S" : ""}
                </Text>
                <Text style={[styles.profileName, { color: profile.accent }]}>
                  {profile.label}
                </Text>
              </View>
              <View style={[styles.percentileBadge, { backgroundColor: profile.accent + "20", borderColor: profile.accent + "44" }]}>
                <Text style={[styles.percentileText, { color: profile.accent }]}>
                  {profile.percentile}
                </Text>
                <Text style={[styles.percentileSub, { color: profile.accent + "88" }]}>
                  pop.
                </Text>
              </View>
            </View>

            <Text style={[styles.profileTagline, { color: profile.accent }]}>
              "{profile.tagline}"
            </Text>

            <Text style={[styles.profileDesc, { color: profile.accent + "cc" }]}>
              {profile.description}
            </Text>

            {/* Spectrum */}
            <View style={[styles.spectrumSection, { borderTopColor: profile.accent + "22" }]}>
              <Text style={[styles.spectrumLabel, { color: profile.accent + "77" }]}>
                SPECTRE PSYCHOLOGIQUE
              </Text>
              <ProfileSpectrum position={profilePosition} accent={profile.accent} />
              <View style={styles.spectrumLegend}>
                <Text style={[styles.spectrumLegendText, { color: profile.accent + "66" }]}>Psychopathe</Text>
                <Text style={[styles.spectrumLegendText, { color: profile.accent + "66" }]}>Altruiste pur</Text>
              </View>
            </View>

            {/* Progress toward next tier */}
            {answeredCount < 30 && (
              <Text style={[styles.profileContinue, { color: profile.accent + "77" }]}>
                {30 - answeredCount} dilemme{30 - answeredCount > 1 ? "s" : ""} restant{30 - answeredCount > 1 ? "s" : ""} pour affiner ton profil →
              </Text>
            )}
          </View>
        ) : null}

        {/* Current level banner */}
        {currentLevel && (
          <Pressable
            onPress={() => router.push("/game")}
            style={({ pressed }) => [
              styles.currentBanner,
              {
                backgroundColor: colors.card,
                borderColor: CATEGORY_COLORS[currentLevel.category],
                opacity: pressed ? 0.92 : 1,
                transform: [{ scale: pressed ? 0.985 : 1 }],
              },
            ]}
          >
            <View style={styles.bannerTop}>
              <View style={styles.bannerLeft}>
                <View style={[styles.catTag, { backgroundColor: CATEGORY_COLORS[currentLevel.category] + "20" }]}>
                  <Text style={[styles.catTagText, { color: CATEGORY_COLORS[currentLevel.category] }]}>
                    {CATEGORY_LABELS[currentLevel.category]}
                  </Text>
                </View>
                <Text style={[styles.bannerChapter, { color: colors.mutedForeground }]}>
                  {currentChapter ? `Chapitre ${currentChapter.id} — ${currentChapter.title}` : ""}
                </Text>
                <Text style={[styles.bannerTitle, { color: colors.foreground }]}>
                  Niveau {currentLevelId} — {currentLevel.title}
                </Text>
              </View>
              <View style={styles.mascotWrap}>
                <MascotCharacter state="idle" color={primaryColor} size={0.75} />
              </View>
            </View>

            <View style={[styles.progressTrack, { backgroundColor: colors.secondary }]}>
              <View style={[styles.progressFill, { backgroundColor: CATEGORY_COLORS[currentLevel.category], width: `${completionPct}%` }]} />
            </View>
            <Text style={[styles.progressLabel, { color: colors.mutedForeground }]}>
              {completedLevels.length} / {LEVELS.length} niveaux · {completionPct}%
            </Text>

            <View style={styles.playRow}>
              <View style={[styles.playBtn, { backgroundColor: CATEGORY_COLORS[currentLevel.category] }]}>
                <Ionicons name="play" size={16} color="#fff" />
                <Text style={styles.playBtnText}>Jouer</Text>
              </View>
            </View>
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
                <Text style={[styles.chapterProg, { color: colors.mutedForeground }]}>{chapterDone}/{chapter.levels.length}</Text>
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
                          backgroundColor: isCurrent ? catColor + "10" : "transparent",
                          borderColor: isCurrent ? catColor + "44" : "transparent",
                          opacity: !unlocked ? 0.38 : pressed ? 0.72 : 1,
                        },
                      ]}
                    >
                      <View style={[styles.levelIcon, { backgroundColor: done ? catColor + "20" : colors.secondary, borderColor: done ? catColor : colors.border }]}>
                        <Ionicons
                          name={done ? "checkmark" : unlocked ? "eye-outline" : "lock-closed-outline"}
                          size={13}
                          color={done ? catColor : colors.mutedForeground}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.levelTitle, { color: unlocked ? colors.foreground : colors.mutedForeground }]}>
                          {lvl.title}
                        </Text>
                        <Text style={[styles.levelMeta, { color: colors.mutedForeground }]}>
                          {CATEGORY_LABELS[lvl.category]} · {lvl.psychology.known === "célèbre" ? "★ Classique" : "◆ Méconnu"}
                        </Text>
                      </View>
                      {isCurrent && <View style={[styles.currentDot, { backgroundColor: catColor }]} />}
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
  inner: { gap: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  brandRow: { gap: 2 },
  brand: { fontSize: 36, fontFamily: "Inter_700Bold", letterSpacing: 4 },
  tagline: { fontSize: 11, fontFamily: "Inter_400Regular", letterSpacing: 3, textTransform: "uppercase" },
  customizeBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, alignItems: "center", justifyContent: "center", marginTop: 4 },
  colorDot: { width: 16, height: 16, borderRadius: 8 },

  // Profile card
  profileCard: { borderRadius: 20, borderWidth: 1.5, padding: 20, gap: 14 },
  profileTopRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  profileEmoji: { fontSize: 40 },
  profileUnknownLabel: { fontSize: 9, fontFamily: "Inter_700Bold", letterSpacing: 2 },
  profileName: { fontSize: 22, fontFamily: "Inter_700Bold", lineHeight: 28 },
  percentileBadge: { borderRadius: 12, borderWidth: 1, padding: 8, alignItems: "center", minWidth: 52 },
  percentileText: { fontSize: 18, fontFamily: "Inter_700Bold" },
  percentileSub: { fontSize: 9, fontFamily: "Inter_400Regular", letterSpacing: 1 },
  profileTagline: { fontSize: 14, fontFamily: "Inter_600SemiBold", fontStyle: "italic", lineHeight: 21 },
  profileDesc: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20 },
  spectrumSection: { borderTopWidth: 1, paddingTop: 14, gap: 8 },
  spectrumLabel: { fontSize: 9, fontFamily: "Inter_700Bold", letterSpacing: 2 },
  spectrumLegend: { flexDirection: "row", justifyContent: "space-between" },
  spectrumLegendText: { fontSize: 10, fontFamily: "Inter_400Regular" },
  profileContinue: { fontSize: 11, fontFamily: "Inter_500Medium", textAlign: "right" },
  profileProgress: { borderRadius: 10, padding: 10, alignItems: "center" },
  profileProgressText: { fontSize: 12, fontFamily: "Inter_500Medium" },

  // Current level banner
  currentBanner: { borderRadius: 20, borderWidth: 1.5, padding: 18, gap: 12 },
  bannerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  bannerLeft: { flex: 1, gap: 4 },
  catTag: { alignSelf: "flex-start", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 2 },
  catTagText: { fontSize: 9, fontFamily: "Inter_700Bold", letterSpacing: 2 },
  bannerChapter: { fontSize: 11, fontFamily: "Inter_400Regular", letterSpacing: 0.5 },
  bannerTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  mascotWrap: { alignItems: "center", justifyContent: "center", width: 70 },
  progressTrack: { height: 3, borderRadius: 2, overflow: "hidden" },
  progressFill: { height: 3, borderRadius: 2 },
  progressLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  playRow: { alignItems: "flex-start" },
  playBtn: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 12, paddingHorizontal: 18, paddingVertical: 10 },
  playBtnText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },

  // Chapters
  chapter: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  chapterHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, paddingBottom: 10 },
  chapterNum: { fontSize: 9, fontFamily: "Inter_700Bold", letterSpacing: 2 },
  chapterTitle: { fontSize: 16, fontFamily: "Inter_700Bold", marginTop: 2 },
  chapterProg: { fontSize: 13, fontFamily: "Inter_500Medium" },
  levelList: { gap: 2, paddingHorizontal: 10, paddingBottom: 10 },
  levelRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, borderWidth: 1 },
  levelIcon: { width: 28, height: 28, borderRadius: 8, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  levelTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  levelMeta: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 1 },
  currentDot: { width: 7, height: 7, borderRadius: 4 },
});
