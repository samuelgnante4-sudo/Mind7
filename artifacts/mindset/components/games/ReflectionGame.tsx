import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { ReflectionLevel } from "@/data/levels";
import { useColors } from "@/hooks/useColors";

interface Props {
  level: ReflectionLevel;
  catColor: string;
  onComplete: () => void;
}

const TIMER_SECONDS = 15;

export default function ReflectionGame({ level, catColor, onComplete }: Props) {
  const colors = useColors();
  const [chosen, setChosen] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(level.hasTimer ? TIMER_SECONDS : -1);
  const [timedOut, setTimedOut] = useState(false);

  const revealOpacity = useRef(new Animated.Value(0)).current;
  const revealTranslate = useRef(new Animated.Value(30)).current;
  const timerAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Countdown timer
  useEffect(() => {
    if (!level.hasTimer || chosen !== null) return;
    if (timeLeft <= 0) {
      setTimedOut(true);
      revealAnswer(-1);
      return;
    }

    // Pulse when < 5s
    if (timeLeft <= 5) {
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
      if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, chosen, level.hasTimer]);

  const revealAnswer = (idx: number) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    Animated.parallel([
      Animated.timing(revealOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(revealTranslate, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  };

  const handleSelect = (idx: number) => {
    if (chosen !== null || timedOut) return;
    setChosen(idx);
    revealAnswer(idx);
  };

  const timerPct = level.hasTimer ? timeLeft / TIMER_SECONDS : 1;
  const timerColor =
    timeLeft > 8 ? "#68d391" : timeLeft > 4 ? "#f6ad55" : "#fc8181";

  const isRevealed = chosen !== null || timedOut;
  const stats = level.psychology.stats;

  return (
    <View style={styles.container}>
      {/* Timer */}
      {level.hasTimer && !isRevealed && (
        <Animated.View style={[styles.timerWrap, { transform: [{ scale: pulseAnim }] }]}>
          <View style={[styles.timerTrack, { backgroundColor: colors.secondary }]}>
            <View
              style={[
                styles.timerFill,
                { backgroundColor: timerColor, width: `${timerPct * 100}%` },
              ]}
            />
          </View>
          <Text style={[styles.timerText, { color: timerColor }]}>
            {timeLeft}s — Fais confiance à ton instinct
          </Text>
        </Animated.View>
      )}

      {/* Question */}
      <Text style={[styles.scenario, { color: colors.foreground }]}>
        {level.scenario}
      </Text>

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
                  borderColor: isChosen
                    ? catColor
                    : faded
                    ? colors.border + "33"
                    : colors.border,
                  backgroundColor: isChosen
                    ? catColor + "18"
                    : faded
                    ? colors.secondary + "55"
                    : colors.secondary,
                  opacity: faded ? 0.4 : pressed ? 0.75 : 1,
                  transform: [{ scale: isChosen ? 1.02 : 1 }],
                },
              ]}
            >
              <View
                style={[
                  styles.optionDot,
                  { backgroundColor: isChosen ? catColor : colors.border },
                ]}
              />
              <Text
                style={[
                  styles.optionText,
                  { color: isChosen ? colors.foreground : colors.secondaryForeground },
                ]}
              >
                {opt}
              </Text>
            </Pressable>
          );
        })}

        {timedOut && (
          <View style={[styles.timedOutBadge, { backgroundColor: colors.destructive + "22", borderColor: colors.destructive + "55" }]}>
            <Text style={[styles.timedOutText, { color: colors.destructive }]}>
              Temps écoulé — ton instinct a refusé de répondre. C'est une réponse aussi.
            </Text>
          </View>
        )}
      </View>

      {/* REVEAL */}
      {isRevealed && (
        <Animated.View
          style={[
            styles.reveal,
            {
              opacity: revealOpacity,
              transform: [{ translateY: revealTranslate }],
            },
          ]}
        >
          {/* Insight */}
          <View style={[styles.insightCard, { backgroundColor: colors.card, borderColor: catColor + "33" }]}>
            <View style={[styles.accentBar, { backgroundColor: catColor }]} />
            <View style={{ flex: 1, gap: 10 }}>
              <Text style={[styles.insightText, { color: colors.mutedForeground }]}>
                {level.insight}
              </Text>
            </View>
          </View>

          {/* Stats */}
          {stats && (
            <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.statsTitle, { color: colors.mutedForeground }]}>
                CE QUE LES AUTRES CHOISISSENT
              </Text>
              {stats.map((s, i) => (
                <View key={i} style={styles.statRow}>
                  <Text style={[styles.statLabel, { color: colors.secondaryForeground }]} numberOfLines={1}>
                    {s.label}
                  </Text>
                  <View style={styles.statBarWrap}>
                    <View style={[styles.statBarTrack, { backgroundColor: colors.secondary }]}>
                      <View
                        style={[
                          styles.statBarFill,
                          { backgroundColor: catColor, width: `${s.pct}%` },
                        ]}
                      />
                    </View>
                    <Text style={[styles.statPct, { color: catColor }]}>{s.pct}%</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Psychology reveal */}
          <View style={[styles.psychCard, { backgroundColor: catColor + "10", borderColor: catColor + "44" }]}>
            <Text style={[styles.psychLabel, { color: colors.mutedForeground }]}>
              CONCEPT PSYCHOLOGIQUE
            </Text>
            <Text style={[styles.psychConcept, { color: catColor }]}>
              {level.psychology.concept}
            </Text>
            <Text style={[styles.psychExplanation, { color: colors.mutedForeground }]}>
              {level.psychology.explanation}
            </Text>
          </View>

          {/* Continue */}
          <Pressable
            onPress={onComplete}
            style={({ pressed }) => [
              styles.continueBtn,
              { backgroundColor: catColor, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Text style={styles.continueBtnText}>Niveau suivant →</Text>
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 22, width: "100%" },

  timerWrap: { gap: 8 },
  timerTrack: { height: 4, borderRadius: 2, overflow: "hidden", width: "100%" },
  timerFill: { height: 4, borderRadius: 2 },
  timerText: { fontSize: 12, fontFamily: "Inter_500Medium", textAlign: "center", letterSpacing: 1 },

  scenario: {
    fontSize: 21,
    fontFamily: "Inter_600SemiBold",
    lineHeight: 32,
    textAlign: "center",
    paddingHorizontal: 4,
  },

  options: { gap: 11 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 18,
  },
  optionDot: { width: 10, height: 10, borderRadius: 5 },
  optionText: { fontSize: 15, fontFamily: "Inter_500Medium", flex: 1 },

  timedOutBadge: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  timedOutText: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20, textAlign: "center" },

  reveal: { gap: 16 },

  insightCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    flexDirection: "row",
    gap: 14,
  },
  accentBar: { width: 3, borderRadius: 2 },
  insightText: { fontSize: 15, fontFamily: "Inter_400Regular", lineHeight: 24 },

  statsCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    gap: 12,
  },
  statsTitle: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    letterSpacing: 2,
    marginBottom: 2,
  },
  statRow: { gap: 6 },
  statLabel: { fontSize: 12, fontFamily: "Inter_500Medium" },
  statBarWrap: { flexDirection: "row", alignItems: "center", gap: 10 },
  statBarTrack: { flex: 1, height: 6, borderRadius: 3, overflow: "hidden" },
  statBarFill: { height: 6, borderRadius: 3 },
  statPct: { fontSize: 13, fontFamily: "Inter_700Bold", width: 36, textAlign: "right" },

  psychCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    gap: 10,
  },
  psychLabel: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    letterSpacing: 2,
  },
  psychConcept: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    lineHeight: 28,
  },
  psychExplanation: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 23,
  },

  continueBtn: {
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
  },
  continueBtnText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
});
