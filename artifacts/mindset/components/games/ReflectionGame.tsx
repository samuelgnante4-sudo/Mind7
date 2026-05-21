import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import MascotCharacter, { MascotState } from "@/components/MascotCharacter";
import { useTheme } from "@/context/ThemeContext";
import { ReflectionLevel } from "@/data/levels";
import { useColors } from "@/hooks/useColors";

interface Props {
  level: ReflectionLevel;
  catColor: string;
  onComplete: () => void;
}

const TIMER_SECONDS = 15;

type RevealPhase = "none" | "insight" | "stats" | "psychology" | "done";

export default function ReflectionGame({ level, catColor, onComplete }: Props) {
  const colors = useColors();
  const { primaryColor } = useTheme();

  const [chosen, setChosen] = useState<number | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const [timeLeft, setTimeLeft] = useState(level.hasTimer ? TIMER_SECONDS : -1);
  const [revealPhase, setRevealPhase] = useState<RevealPhase>("none");
  const [mascotState, setMascotState] = useState<MascotState>("idle");

  // Animated values per phase
  const insightOpacity = useRef(new Animated.Value(0)).current;
  const insightY = useRef(new Animated.Value(20)).current;
  const statsOpacity = useRef(new Animated.Value(0)).current;
  const statsY = useRef(new Animated.Value(20)).current;
  const psychOpacity = useRef(new Animated.Value(0)).current;
  const psychY = useRef(new Animated.Value(20)).current;
  const btnOpacity = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const fadeIn = (opacity: Animated.Value, y: Animated.Value, delay = 0) => {
    return Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 500, delay, useNativeDriver: true }),
      Animated.timing(y, { toValue: 0, duration: 500, delay, useNativeDriver: true }),
    ]);
  };

  // Timer
  useEffect(() => {
    if (!level.hasTimer || chosen !== null) return;
    if (timeLeft <= 0) {
      setTimedOut(true);
      triggerReveal();
      return;
    }
    if (timeLeft <= 5) {
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.06, duration: 150, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();
      if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, chosen, level.hasTimer]);

  const triggerReveal = () => {
    setMascotState("thinking");
    setRevealPhase("insight");

    // Phase 1: insight
    fadeIn(insightOpacity, insightY).start();

    // Phase 2: stats after 800ms
    setTimeout(() => {
      setMascotState("explaining");
      setRevealPhase("stats");
      fadeIn(statsOpacity, statsY).start();
    }, 900);

    // Phase 3: psychology after 1800ms
    setTimeout(() => {
      setMascotState("celebrating");
      setRevealPhase("psychology");
      Animated.parallel([
        fadeIn(psychOpacity, psychY),
        Animated.timing(btnOpacity, { toValue: 1, duration: 400, delay: 600, useNativeDriver: true }),
      ]).start();
    }, 1900);

    setTimeout(() => setRevealPhase("done"), 2500);
  };

  const handleSelect = (idx: number) => {
    if (chosen !== null || timedOut) return;
    setChosen(idx);
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    triggerReveal();
  };

  const isRevealed = chosen !== null || timedOut;
  const timerPct = level.hasTimer ? timeLeft / TIMER_SECONDS : 1;
  const timerColor = timeLeft > 8 ? "#68d391" : timeLeft > 4 ? "#f6ad55" : "#fc8181";
  const stats = level.psychology.stats;

  return (
    <View style={styles.container}>
      {/* Timer bar */}
      {level.hasTimer && !isRevealed && (
        <Animated.View style={[styles.timerWrap, { transform: [{ scale: pulseAnim }] }]}>
          <View style={[styles.timerTrack, { backgroundColor: colors.secondary }]}>
            <View style={[styles.timerFill, { backgroundColor: timerColor, width: `${timerPct * 100}%` }]} />
          </View>
          <Text style={[styles.timerText, { color: timerColor }]}>
            {timeLeft}s — Fais confiance à ton instinct
          </Text>
        </Animated.View>
      )}

      {/* Question */}
      <Text style={[styles.scenario, { color: colors.foreground }]}>{level.scenario}</Text>

      {/* Choices */}
      <View style={styles.options}>
        {level.options.map((opt, idx) => {
          const isChosen = chosen === idx;
          const faded = isRevealed && !isChosen;
          return (
            <Pressable
              key={idx}
              onPress={() => handleSelect(idx)}
              disabled={isRevealed}
              style={({ pressed }) => [
                styles.option,
                {
                  borderColor: isChosen ? catColor : faded ? colors.border + "33" : colors.border,
                  backgroundColor: isChosen ? catColor + "18" : faded ? colors.secondary + "44" : colors.secondary,
                  opacity: faded ? 0.35 : pressed ? 0.75 : 1,
                  transform: [{ scale: isChosen ? 1.01 : 1 }],
                },
              ]}
            >
              <View style={[styles.optionDot, { backgroundColor: isChosen ? catColor : colors.border }]} />
              <Text style={[styles.optionText, { color: isChosen ? colors.foreground : colors.secondaryForeground }]}>
                {opt}
              </Text>
              {isChosen && (
                <Text style={[styles.checkmark, { color: catColor }]}>✓</Text>
              )}
            </Pressable>
          );
        })}
        {timedOut && (
          <View style={[styles.timedOut, { backgroundColor: colors.destructive + "15", borderColor: colors.destructive + "44" }]}>
            <Text style={[styles.timedOutText, { color: colors.destructive }]}>
              Temps écoulé — refuser de choisir est aussi une réponse.
            </Text>
          </View>
        )}
      </View>

      {/* REVEAL */}
      {isRevealed && (
        <View style={styles.reveal}>
          {/* Mascot + insight row */}
          <Animated.View style={[styles.mascotRow, { opacity: insightOpacity, transform: [{ translateY: insightY }] }]}>
            <MascotCharacter state={mascotState} color={primaryColor} size={0.9} />
            <View style={[styles.speechBubble, { backgroundColor: colors.card, borderColor: catColor + "55" }]}>
              <View style={[styles.bubbleArrow, { borderRightColor: colors.card }]} />
              <Text style={[styles.insightText, { color: colors.secondaryForeground }]}>
                {level.insight}
              </Text>
            </View>
          </Animated.View>

          {/* Stats */}
          {stats && (
            <Animated.View
              style={[
                styles.statsCard,
                { backgroundColor: colors.card, borderColor: colors.border, opacity: statsOpacity, transform: [{ translateY: statsY }] },
              ]}
            >
              <Text style={[styles.statsTitle, { color: colors.mutedForeground }]}>
                CE QUE LES AUTRES CHOISISSENT
              </Text>
              {stats.map((s, i) => (
                <View key={i} style={styles.statRow}>
                  <Text style={[styles.statLabel, { color: colors.secondaryForeground }]} numberOfLines={1}>{s.label}</Text>
                  <View style={styles.statBarRow}>
                    <View style={[styles.statTrack, { backgroundColor: colors.secondary }]}>
                      <View style={[styles.statFill, { backgroundColor: catColor, width: `${s.pct}%` }]} />
                    </View>
                    <Text style={[styles.statPct, { color: catColor }]}>{s.pct}%</Text>
                  </View>
                </View>
              ))}
            </Animated.View>
          )}

          {/* Psychology card */}
          <Animated.View
            style={[
              styles.psychCard,
              { backgroundColor: catColor + "0e", borderColor: catColor + "55", opacity: psychOpacity, transform: [{ translateY: psychY }] },
            ]}
          >
            <Text style={[styles.psychLabel, { color: catColor + "aa" }]}>CONCEPT PSYCHOLOGIQUE</Text>
            <Text style={[styles.psychConcept, { color: catColor }]}>{level.psychology.concept}</Text>
            <Text style={[styles.psychExplain, { color: colors.mutedForeground }]}>{level.psychology.explanation}</Text>
          </Animated.View>

          {/* Continue button */}
          <Animated.View style={{ opacity: btnOpacity }}>
            <Pressable
              onPress={onComplete}
              style={({ pressed }) => [styles.continueBtn, { backgroundColor: catColor, opacity: pressed ? 0.8 : 1 }]}
            >
              <Text style={styles.continueBtnText}>Niveau suivant →</Text>
            </Pressable>
          </Animated.View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 20, width: "100%" },
  timerWrap: { gap: 6 },
  timerTrack: { height: 4, borderRadius: 2, overflow: "hidden" },
  timerFill: { height: 4, borderRadius: 2 },
  timerText: { fontSize: 12, fontFamily: "Inter_500Medium", textAlign: "center", letterSpacing: 0.5 },
  scenario: { fontSize: 20, fontFamily: "Inter_600SemiBold", lineHeight: 30, textAlign: "center", paddingHorizontal: 4 },
  options: { gap: 10 },
  option: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, borderWidth: 1.5, paddingHorizontal: 16, paddingVertical: 15 },
  optionDot: { width: 9, height: 9, borderRadius: 5 },
  optionText: { fontSize: 15, fontFamily: "Inter_500Medium", flex: 1 },
  checkmark: { fontSize: 16, fontFamily: "Inter_700Bold" },
  timedOut: { borderRadius: 12, borderWidth: 1, padding: 14 },
  timedOutText: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20, textAlign: "center" },

  reveal: { gap: 16 },

  mascotRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  speechBubble: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 14,
    borderBottomLeftRadius: 4,
    position: "relative",
  },
  bubbleArrow: {
    position: "absolute",
    left: -8,
    bottom: 16,
    width: 0,
    height: 0,
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderRightWidth: 8,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
  },
  insightText: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 22 },

  statsCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 12 },
  statsTitle: { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 2 },
  statRow: { gap: 4 },
  statLabel: { fontSize: 12, fontFamily: "Inter_500Medium" },
  statBarRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  statTrack: { flex: 1, height: 6, borderRadius: 3, overflow: "hidden" },
  statFill: { height: 6, borderRadius: 3 },
  statPct: { fontSize: 13, fontFamily: "Inter_700Bold", width: 36, textAlign: "right" },

  psychCard: { borderRadius: 16, borderWidth: 1, padding: 18, gap: 8 },
  psychLabel: { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 2 },
  psychConcept: { fontSize: 20, fontFamily: "Inter_700Bold", lineHeight: 26 },
  psychExplain: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 21 },

  continueBtn: { borderRadius: 14, padding: 16, alignItems: "center" },
  continueBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
});
