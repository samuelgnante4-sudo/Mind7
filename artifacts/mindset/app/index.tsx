import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import MascotCharacter from "@/components/MascotCharacter";
import { PSYCH_PROFILES, useGame } from "@/context/GameContext";
import { useTheme } from "@/context/ThemeContext";
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  CHAPTERS,
  LEVELS,
} from "@/data/levels";
import { GENERAL_QUOTES, LEVEL_QUOTES } from "@/data/quotes";
import { useColors } from "@/hooks/useColors";

// ── Spectrum bar ─────────────────────────────────────────────────────────────
function ProfileSpectrum({ position, accent }: { position: number; accent: string }) {
  const colors = useColors();
  return (
    <View style={sp.wrap}>
      <Text style={sp.endLabel}>🕳️</Text>
      <View style={sp.track}>
        {PSYCH_PROFILES.map((p, i) => {
          const dotPos = i / (PSYCH_PROFILES.length - 1);
          const isActive = Math.abs(dotPos - position) < 0.09;
          return (
            <View
              key={p.id}
              style={{
                width: isActive ? 14 : 8,
                height: isActive ? 14 : 8,
                borderRadius: isActive ? 7 : 4,
                backgroundColor: isActive ? accent : colors.secondary,
                borderWidth: isActive ? 2 : 0,
                borderColor: isActive ? accent + "55" : "transparent",
              }}
            />
          );
        })}
      </View>
      <Text style={sp.endLabel}>🕊️</Text>
    </View>
  );
}
const sp = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "center", gap: 8 },
  track: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  endLabel: { fontSize: 16 },
});

// ── Quote card ────────────────────────────────────────────────────────────────
function QuoteCard({ levelId }: { levelId: number }) {
  const colors = useColors();
  const quote = LEVEL_QUOTES[levelId] ?? GENERAL_QUOTES[levelId % GENERAL_QUOTES.length];
  const level = LEVELS.find((l) => l.id === levelId);
  const accent = level ? CATEGORY_COLORS[level.category] : colors.mutedForeground;

  return (
    <View style={[qc.card, { backgroundColor: colors.card, borderColor: accent + "33" }]}>
      <View style={[qc.accentBar, { backgroundColor: accent }]} />
      <View style={qc.inner}>
        <Text style={[qc.openQuote, { color: accent }]}>"</Text>
        <Text style={[qc.text, { color: colors.secondaryForeground }]}>{quote.text}</Text>
        <Text style={[qc.attr, { color: colors.mutedForeground }]}>
          — {quote.author}, {quote.year}
        </Text>
      </View>
    </View>
  );
}
const qc = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    overflow: "hidden",
  },
  accentBar: { width: 3 },
  inner: { flex: 1, padding: 16, gap: 6 },
  openQuote: { fontSize: 32, fontFamily: "Inter_700Bold", lineHeight: 28, marginBottom: -4 },
  text: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 22, fontStyle: "italic" },
  attr: { fontSize: 12, fontFamily: "Inter_500Medium" },
});

// ── Chapter badges ────────────────────────────────────────────────────────────
const CHAPTER_META = [
  { id: 1, emoji: "⚖️", color: "#9f7aea" },
  { id: 2, emoji: "🧠", color: "#63b3ed" },
  { id: 3, emoji: "👥", color: "#4fd1c5" },
  { id: 4, emoji: "💡", color: "#f6ad55" },
  { id: 5, emoji: "🪞", color: "#e05c7a" },
  { id: 6, emoji: "🌌", color: "#68d391" },
];

function ChapterBadges({
  isCompleted,
  isStarted,
}: {
  isCompleted: (chapterId: number) => boolean;
  isStarted: (chapterId: number) => boolean;
}) {
  const colors = useColors();
  return (
    <View style={cb.row}>
      {CHAPTER_META.map((ch) => {
        const done = isCompleted(ch.id);
        const started = isStarted(ch.id);
        const chapter = CHAPTERS.find((c) => c.id === ch.id)!;
        return (
          <View key={ch.id} style={cb.badgeWrap}>
            <View
              style={[
                cb.badge,
                done
                  ? { backgroundColor: ch.color + "22", borderColor: ch.color, borderWidth: 2 }
                  : started
                  ? { backgroundColor: colors.card, borderColor: ch.color + "55", borderWidth: 1.5 }
                  : { backgroundColor: colors.secondary, borderColor: colors.border, borderWidth: 1 },
              ]}
            >
              {/* Glow ring for completed */}
              {done && (
                <View style={[cb.glowRing, { borderColor: ch.color + "44" }]} />
              )}
              <Text style={[cb.emoji, { opacity: done ? 1 : started ? 0.7 : 0.35 }]}>
                {done ? ch.emoji : started ? ch.emoji : "🔒"}
              </Text>
              {done && (
                <View style={[cb.checkMark, { backgroundColor: ch.color }]}>
                  <Ionicons name="checkmark" size={8} color="#fff" />
                </View>
              )}
            </View>
            <Text
              style={[
                cb.badgeLabel,
                { color: done ? ch.color : started ? colors.secondaryForeground : colors.mutedForeground },
              ]}
              numberOfLines={2}
            >
              {chapter.title.replace("L'", "L'\u200B")}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
const cb = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 6,
  },
  badgeWrap: { alignItems: "center", gap: 6, flex: 1 },
  badge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  glowRing: {
    position: "absolute",
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
  },
  emoji: { fontSize: 22 },
  checkMark: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeLabel: {
    fontSize: 9,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
    lineHeight: 13,
  },
});

// ── Home screen ───────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { primaryColor } = useTheme();
  const {
    currentLevelId,
    completedLevels,
    profile,
    profilePosition,
    isLevelCompleted,
    isLevelUnlocked,
  } = useGame();

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

  // Chapter helper functions
  const isChapterCompleted = (chapterId: number) => {
    const ch = CHAPTERS.find((c) => c.id === chapterId);
    if (!ch) return false;
    return ch.levels.every((id) => isLevelCompleted(id));
  };
  const isChapterStarted = (chapterId: number) => {
    const ch = CHAPTERS.find((c) => c.id === chapterId);
    if (!ch) return false;
    return ch.levels.some((id) => isLevelCompleted(id));
  };

  return (
    <ScrollView
      style={[s.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={[s.content, { paddingTop: topPad + 20, paddingBottom: botPad + 24 }]}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View style={[s.inner, { opacity: fadeAnim }]}>

        {/* ── HEADER ── */}
        <View style={s.header}>
          <View style={s.brandRow}>
            <Text style={[s.brand, { color: colors.foreground }]}>
              MIND<Text style={{ color: primaryColor }}>7</Text>
            </Text>
            <Text style={[s.tagline, { color: colors.mutedForeground }]}>7 façons de penser</Text>
          </View>
          <Pressable
            onPress={() => router.push("/customize")}
            style={({ pressed }) => [
              s.customizeBtn,
              { backgroundColor: colors.card, borderColor: primaryColor + "55", opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <View style={[s.colorDot, { backgroundColor: primaryColor }]} />
          </Pressable>
        </View>

        {/* ── PSYCHOLOGICAL PROFILE CARD ── */}
        {answeredCount === 0 ? (
          <View style={[s.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={s.profileTopRow}>
              <Text style={s.profileEmoji}>🔮</Text>
              <View style={{ flex: 1 }}>
                <Text style={[s.profileUnknownLabel, { color: colors.mutedForeground }]}>
                  TON PROFIL PSYCHOLOGIQUE
                </Text>
                <Text style={[s.profileName, { color: colors.foreground }]}>Inconnu</Text>
              </View>
            </View>
            <Text style={[s.profileTagline, { color: colors.mutedForeground }]}>
              Réponds à au moins 1 dilemme pour découvrir ton profil.
            </Text>
            <View style={[s.profileProgress, { backgroundColor: colors.secondary }]}>
              <Text style={[s.profileProgressText, { color: colors.mutedForeground }]}>
                0 / 30 dilemmes répondus
              </Text>
            </View>
          </View>
        ) : profile ? (
          <View
            style={[s.profileCard, { backgroundColor: profile.bg, borderColor: profile.accent + "44" }]}
          >
            <View style={s.profileTopRow}>
              <Text style={s.profileEmoji}>{profile.emoji}</Text>
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={[s.profileUnknownLabel, { color: profile.accent + "aa" }]}>
                  TON PROFIL · {answeredCount} DILEMME{answeredCount > 1 ? "S" : ""}
                </Text>
                <Text style={[s.profileName, { color: profile.accent }]}>{profile.label}</Text>
              </View>
              <View
                style={[
                  s.percentileBadge,
                  { backgroundColor: profile.accent + "20", borderColor: profile.accent + "44" },
                ]}
              >
                <Text style={[s.percentileText, { color: profile.accent }]}>{profile.percentile}</Text>
                <Text style={[s.percentileSub, { color: profile.accent + "88" }]}>pop.</Text>
              </View>
            </View>

            <Text style={[s.profileTagline, { color: profile.accent }]}>
              "{profile.tagline}"
            </Text>

            <Text style={[s.profileDesc, { color: profile.accent + "cc" }]}>
              {profile.description}
            </Text>

            <View style={[s.spectrumSection, { borderTopColor: profile.accent + "22" }]}>
              <Text style={[s.spectrumLabel, { color: profile.accent + "77" }]}>
                SPECTRE PSYCHOLOGIQUE
              </Text>
              <ProfileSpectrum position={profilePosition} accent={profile.accent} />
              <View style={s.spectrumLegend}>
                <Text style={[s.spectrumLegendText, { color: profile.accent + "66" }]}>Psychopathe</Text>
                <Text style={[s.spectrumLegendText, { color: profile.accent + "66" }]}>Altruiste pur</Text>
              </View>
            </View>

            {answeredCount < 30 && (
              <Text style={[s.profileContinue, { color: profile.accent + "77" }]}>
                {30 - answeredCount} dilemme{30 - answeredCount > 1 ? "s" : ""} restant
                {30 - answeredCount > 1 ? "s" : ""} pour affiner ton profil →
              </Text>
            )}
          </View>
        ) : null}

        {/* ── QUOTE CARD (next level's philosopher) ── */}
        {currentLevel && <QuoteCard levelId={currentLevelId} />}

        {/* ── CURRENT LEVEL BANNER ── */}
        {currentLevel && (
          <Pressable
            onPress={() => router.push("/game")}
            style={({ pressed }) => [
              s.currentBanner,
              {
                backgroundColor: colors.card,
                borderColor: CATEGORY_COLORS[currentLevel.category],
                opacity: pressed ? 0.92 : 1,
                transform: [{ scale: pressed ? 0.985 : 1 }],
              },
            ]}
          >
            <View style={s.bannerTop}>
              <View style={s.bannerLeft}>
                <View
                  style={[
                    s.catTag,
                    { backgroundColor: CATEGORY_COLORS[currentLevel.category] + "20" },
                  ]}
                >
                  <Text
                    style={[s.catTagText, { color: CATEGORY_COLORS[currentLevel.category] }]}
                  >
                    {CATEGORY_LABELS[currentLevel.category]}
                  </Text>
                </View>
                <Text style={[s.bannerChapter, { color: colors.mutedForeground }]}>
                  {currentChapter
                    ? `Chapitre ${currentChapter.id} — ${currentChapter.title}`
                    : ""}
                </Text>
                <Text style={[s.bannerTitle, { color: colors.foreground }]}>
                  Niveau {currentLevelId} — {currentLevel.title}
                </Text>
              </View>
              <View style={s.mascotWrap}>
                <MascotCharacter state="idle" color={primaryColor} size={0.75} />
              </View>
            </View>

            <View style={[s.progressTrack, { backgroundColor: colors.secondary }]}>
              <View
                style={[
                  s.progressFill,
                  {
                    backgroundColor: CATEGORY_COLORS[currentLevel.category],
                    width: `${completionPct}%`,
                  },
                ]}
              />
            </View>
            <Text style={[s.progressLabel, { color: colors.mutedForeground }]}>
              {completedLevels.length} / {LEVELS.length} niveaux · {completionPct}%
            </Text>

            <View style={s.playRow}>
              <View
                style={[s.playBtn, { backgroundColor: CATEGORY_COLORS[currentLevel.category] }]}
              >
                <Ionicons name="play" size={16} color="#fff" />
                <Text style={s.playBtnText}>Jouer</Text>
              </View>
            </View>
          </Pressable>
        )}

        {/* ── CHAPTER BADGES ── */}
        <View style={[s.badgesCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[s.badgesTitle, { color: colors.mutedForeground }]}>
            CHAPITRES COMPLÉTÉS
          </Text>
          <ChapterBadges
            isCompleted={isChapterCompleted}
            isStarted={isChapterStarted}
          />
        </View>

        {/* ── CHAPTER LIST ── */}
        {CHAPTERS.map((chapter) => {
          const chapterDone = chapter.levels.filter((id) => isLevelCompleted(id)).length;
          const chapterMeta = CHAPTER_META.find((c) => c.id === chapter.id);
          const isCompleted = isChapterCompleted(chapter.id);
          const isUnlocked = isLevelUnlocked(chapter.levels[0]);

          return (
            <View
              key={chapter.id}
              style={[
                s.chapter,
                {
                  borderColor: isCompleted
                    ? (chapterMeta?.color ?? colors.border) + "55"
                    : colors.border,
                  backgroundColor: colors.card,
                },
              ]}
            >
              <View style={s.chapterHeader}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <Text style={{ fontSize: 20, opacity: isUnlocked ? 1 : 0.4 }}>
                    {chapterMeta?.emoji}
                  </Text>
                  <View>
                    <Text style={[s.chapterNum, { color: colors.mutedForeground }]}>
                      CHAPITRE {chapter.id}
                    </Text>
                    <Text
                      style={[
                        s.chapterTitle,
                        { color: isUnlocked ? colors.foreground : colors.mutedForeground },
                      ]}
                    >
                      {chapter.title}
                    </Text>
                  </View>
                </View>
                <View style={{ alignItems: "flex-end", gap: 4 }}>
                  <Text style={[s.chapterProg, { color: colors.mutedForeground }]}>
                    {chapterDone}/{chapter.levels.length}
                  </Text>
                  {isCompleted && (
                    <View
                      style={[
                        s.completedPill,
                        { backgroundColor: (chapterMeta?.color ?? colors.border) + "22" },
                      ]}
                    >
                      <Text
                        style={[
                          s.completedPillText,
                          { color: chapterMeta?.color ?? colors.foreground },
                        ]}
                      >
                        ✓ Terminé
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              <View style={s.levelList}>
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
                      onPress={() =>
                        unlocked &&
                        router.push({ pathname: "/game", params: { levelId: String(levelId) } })
                      }
                      disabled={!unlocked}
                      style={({ pressed }) => [
                        s.levelRow,
                        {
                          backgroundColor: isCurrent ? catColor + "10" : "transparent",
                          borderColor: isCurrent ? catColor + "44" : "transparent",
                          opacity: !unlocked ? 0.38 : pressed ? 0.72 : 1,
                        },
                      ]}
                    >
                      <View
                        style={[
                          s.levelIcon,
                          {
                            backgroundColor: done ? catColor + "20" : colors.secondary,
                            borderColor: done ? catColor : colors.border,
                          },
                        ]}
                      >
                        <Ionicons
                          name={
                            done
                              ? "checkmark"
                              : unlocked
                              ? "eye-outline"
                              : "lock-closed-outline"
                          }
                          size={13}
                          color={done ? catColor : colors.mutedForeground}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            s.levelTitle,
                            { color: unlocked ? colors.foreground : colors.mutedForeground },
                          ]}
                        >
                          {lvl.title}
                        </Text>
                        <Text style={[s.levelMeta, { color: colors.mutedForeground }]}>
                          {CATEGORY_LABELS[lvl.category]} ·{" "}
                          {lvl.psychology.known === "célèbre" ? "★ Classique" : "◆ Méconnu"}
                        </Text>
                      </View>
                      {isCurrent && (
                        <View style={[s.currentDot, { backgroundColor: catColor }]} />
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

const s = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20 },
  inner: { gap: 16 },

  // Header
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

  // Badges
  badgesCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 14 },
  badgesTitle: { fontSize: 9, fontFamily: "Inter_700Bold", letterSpacing: 2 },

  // Chapters
  chapter: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  chapterHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, paddingBottom: 10 },
  chapterNum: { fontSize: 9, fontFamily: "Inter_700Bold", letterSpacing: 2 },
  chapterTitle: { fontSize: 16, fontFamily: "Inter_700Bold", marginTop: 2 },
  chapterProg: { fontSize: 13, fontFamily: "Inter_500Medium" },
  completedPill: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  completedPillText: { fontSize: 10, fontFamily: "Inter_700Bold" },
  levelList: { gap: 2, paddingHorizontal: 10, paddingBottom: 10 },
  levelRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, borderWidth: 1 },
  levelIcon: { width: 28, height: 28, borderRadius: 8, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  levelTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  levelMeta: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 1 },
  currentDot: { width: 7, height: 7, borderRadius: 4 },
});
