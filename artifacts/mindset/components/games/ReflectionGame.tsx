import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Speech from "expo-speech";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import ConceptAnimation from "@/components/ConceptAnimation";
import MascotCharacter, { MascotState } from "@/components/MascotCharacter";
import { useTheme } from "@/context/ThemeContext";
import { LEVEL_ANIM } from "@/data/animations";
import { ReflectionLevel } from "@/data/levels";
import { useColors } from "@/hooks/useColors";

interface Props {
  level: ReflectionLevel;
  catColor: string;
  onComplete: (chosenIndex: number) => void; // passes chosen option index (-1 = timeout)
}

const TIMER_SECONDS = 20;
const POST_READ_BUFFER_MS = 2500;
const SPEECH_RATE = 0.72;
const SPEECH_PITCH = 0.92;

type RevealPhase = "none" | "insight" | "stats" | "psychology" | "done";

export default function ReflectionGame({ level, catColor, onComplete }: Props) {
  const colors = useColors();
  const { primaryColor } = useTheme();

  const [chosen, setChosen] = useState<number | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const [timeLeft, setTimeLeft] = useState(-1);
  const [timerActive, setTimerActive] = useState(false);
  const [revealPhase, setRevealPhase] = useState<RevealPhase>("none");
  const [mascotState, setMascotState] = useState<MascotState>("idle");

  const insightOpacity = useRef(new Animated.Value(0)).current;
  const insightY = useRef(new Animated.Value(22)).current;
  const statsOpacity = useRef(new Animated.Value(0)).current;
  const statsY = useRef(new Animated.Value(22)).current;
  const psychOpacity = useRef(new Animated.Value(0)).current;
  const psychY = useRef(new Animated.Value(22)).current;
  const btnOpacity = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const triggerRevealRef = useRef<(idx: number) => void>();

  const fadeIn = (opacity: Animated.Value, y: Animated.Value, delay = 0) =>
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 500, delay, useNativeDriver: true }),
      Animated.timing(y, { toValue: 0, duration: 500, delay, useNativeDriver: true }),
    ]);

  useEffect(() => {
    return () => { Speech.stop(); };
  }, []);

  // Read scenario on mount
  useEffect(() => {
    const delay = setTimeout(() => {
      Speech.speak(level.scenario, {
        language: "fr-FR",
        pitch: SPEECH_PITCH,
        rate: SPEECH_RATE,
        onDone: () => {
          if (level.hasTimer) {
            setTimeout(() => {
              setTimeLeft(TIMER_SECONDS);
              setTimerActive(true);
            }, POST_READ_BUFFER_MS);
          }
        },
        onStopped: () => {
          if (level.hasTimer) {
            setTimeout(() => {
              setTimeLeft(TIMER_SECONDS);
              setTimerActive(true);
            }, POST_READ_BUFFER_MS);
          }
        },
        onError: () => {
          if (level.hasTimer) {
            setTimeout(() => {
              setTimeLeft(TIMER_SECONDS);
              setTimerActive(true);
            }, POST_READ_BUFFER_MS);
          }
        },
      });
    }, 500);
    return () => clearTimeout(delay);
  }, []);

  // Timer countdown
  useEffect(() => {
    if (!timerActive || !level.hasTimer || chosen !== null || timedOut) return;
    if (timeLeft <= 0) {
      setTimedOut(true);
      triggerRevealRef.current?.(-1);
      return;
    }
    if (timeLeft <= 5) {
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.07, duration: 140, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 140, useNativeDriver: true }),
      ]).start();
      if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, timerActive, chosen, timedOut, level.hasTimer]);

  const triggerReveal = (idx: number) => {
    setMascotState("thinking");
    setRevealPhase("insight");
    fadeIn(insightOpacity, insightY).start();

    setTimeout(() => {
      Speech.stop();
      Speech.speak(level.insight, {
        language: "fr-FR",
        pitch: SPEECH_PITCH,
        rate: SPEECH_RATE,
      });
    }, 600);

    setTimeout(() => {
      setMascotState("explaining");
      setRevealPhase("stats");
      fadeIn(statsOpacity, statsY).start();
    }, 1200);

    setTimeout(() => {
      setMascotState("celebrating");
      setRevealPhase("psychology");
      Animated.parallel([
        fadeIn(psychOpacity, psychY),
        Animated.timing(btnOpacity, { toValue: 1, duration: 400, delay: 600, useNativeDriver: true }),
      ]).start();
    }, 2400);

    setTimeout(() => setRevealPhase("done"), 3200);
  };

  triggerRevealRef.current = triggerReveal;

  const handleSelect = (idx: number) => {
    if (chosen !== null || timedOut) return;
    setChosen(idx);
    Speech.stop();
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    triggerReveal(idx);
  };

  const replayConcept = () => {
    Speech.stop();
    Speech.speak(level.psychology.concept + ". " + level.psychology.explanation, {
      language: "fr-FR",
      pitch: SPEECH_PITCH,
      rate: SPEECH_RATE,
    });
  };

  const isRevealed = chosen !== null || timedOut;
  const timerPct = level.hasTimer && timeLeft >= 0 ? timeLeft / TIMER_SECONDS : 1;
  const timerColor = timeLeft > 10 ? "#68d391" : timeLeft > 5 ? "#f6ad55" : "#fc8181";
  const stats = level.psychology.stats;

  return (
    <View style={styles.container}>
      {/* Reading indicator */}
      {level.hasTimer && !timerActive && !isRevealed && (
        <View style={[styles.readingHint, { backgroundColor: catColor + "15" }]}>
          <Text style={[styles.readingHintText, { color: catColor }]}>
            🔊 La colombe lit la question… Le chrono démarrera ensuite.
          </Text>
        </View>
      )}

      {/* Timer */}
      {level.hasTimer && timerActive && !isRevealed && (
        <Animated.View style={[styles.timerWrap, { transform: [{ scale: pulseAnim }] }]}>
          <View style={[styles.timerTrack, { backgroundColor: colors.secondary }]}>
            <View style={[styles.timerFill, { backgroundColor: timerColor, width: `${timerPct * 100}%` }]} />
          </View>
          <Text style={[styles.timerText, { color: timerColor }]}>
            {timeLeft > 0 ? `${timeLeft}s — Fais confiance à ton instinct` : "Temps écoulé"}
          </Text>
        </Animated.View>
      )}

      {/* Scenario */}
      <Text style={[styles.scenario, { color: colors.foreground }]}>{level.scenario}</Text>

      {/* Options */}
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
                  opacity: faded ? 0.3 : pressed ? 0.75 : 1,
                  transform: [{ scale: isChosen ? 1.01 : 1 }],
                },
              ]}
            >
              <View style={[styles.optionDot, { backgroundColor: isChosen ? catColor : colors.border }]} />
              <Text style={[styles.optionText, { color: isChosen ? colors.foreground : colors.secondaryForeground }]}>
                {opt}
              </Text>
              {isChosen && <Text style={[styles.checkmark, { color: catColor }]}>✓</Text>}
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
          <Animated.View style={[styles.mascotRow, { opacity: insightOpacity, transform: [{ translateY: insightY }] }]}>
            <MascotCharacter state={mascotState} color={primaryColor} size={0.85} />
            <View style={[styles.speechBubble, { backgroundColor: colors.card, borderColor: catColor + "66" }]}>
              <View style={[styles.bubbleArrow, { borderRightColor: colors.card }]} />
              <Text style={[styles.insightText, { color: colors.secondaryForeground }]}>
                {level.insight}
              </Text>
            </View>
          </Animated.View>

          {stats && (
            <Animated.View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border, opacity: statsOpacity, transform: [{ translateY: statsY }] }]}>
              <Text style={[styles.statsTitle, { color: colors.mutedForeground }]}>CE QUE LES AUTRES CHOISISSENT</Text>
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

          <Animated.View style={[styles.psychCard, { backgroundColor: catColor + "0e", borderColor: catColor + "55", opacity: psychOpacity, transform: [{ translateY: psychY }] }]}>
            <View style={styles.psychHeader}>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={[styles.psychLabel, { color: catColor + "aa" }]}>CONCEPT PSYCHOLOGIQUE</Text>
                <Text style={[styles.psychConcept, { color: catColor }]}>{level.psychology.concept}</Text>
              </View>
              <Pressable onPress={replayConcept} hitSlop={10} style={({ pressed }) => [styles.speakerBtn, { backgroundColor: catColor + "22", opacity: pressed ? 0.6 : 1 }]}>
                <Ionicons name="volume-high-outline" size={16} color={catColor} />
              </Pressable>
            </View>
            <View style={[styles.knownBadge, { backgroundColor: level.psychology.known === "célèbre" ? "#38a16922" : "#e05c7a22" }]}>
              <Text style={[styles.knownText, { color: level.psychology.known === "célèbre" ? "#38a169" : "#e05c7a" }]}>
                {level.psychology.known === "célèbre" ? "★ Dilemme classique" : "◆ Concept méconnu"}
              </Text>
            </View>
            {/* Concept animation */}
            {LEVEL_ANIM[level.id] && (
              <View style={[styles.animWrap, { backgroundColor: catColor + "08", borderColor: catColor + "22" }]}>
                <ConceptAnimation type={LEVEL_ANIM[level.id]} color={catColor} />
              </View>
            )}
            <Text style={[styles.psychExplain, { color: colors.mutedForeground }]}>{level.psychology.explanation}</Text>
          </Animated.View>

          <Animated.View style={{ opacity: btnOpacity }}>
            <Pressable
              onPress={() => onComplete(chosen ?? -1)}
              style={({ pressed }) => [styles.continueBtn, { backgroundColor: catColor, opacity: pressed ? 0.8 : 1 }]}
            >
              <Text style={styles.continueBtnText}>Dilemme suivant →</Text>
            </Pressable>
          </Animated.View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 20, width: "100%" },
  readingHint: { borderRadius: 10, padding: 10 },
  readingHintText: { fontSize: 12, fontFamily: "Inter_500Medium", textAlign: "center" },
  timerWrap: { gap: 6 },
  timerTrack: { height: 4, borderRadius: 2, overflow: "hidden" },
  timerFill: { height: 4, borderRadius: 2 },
  timerText: { fontSize: 12, fontFamily: "Inter_500Medium", textAlign: "center", letterSpacing: 0.5 },
  scenario: { fontSize: 20, fontFamily: "Inter_600SemiBold", lineHeight: 31, textAlign: "center", paddingHorizontal: 4 },
  options: { gap: 10 },
  option: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, borderWidth: 1.5, paddingHorizontal: 16, paddingVertical: 15 },
  optionDot: { width: 9, height: 9, borderRadius: 5 },
  optionText: { fontSize: 15, fontFamily: "Inter_500Medium", flex: 1 },
  checkmark: { fontSize: 16, fontFamily: "Inter_700Bold" },
  timedOut: { borderRadius: 12, borderWidth: 1, padding: 14 },
  timedOutText: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20, textAlign: "center" },
  reveal: { gap: 16 },
  mascotRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  speechBubble: { flex: 1, borderRadius: 16, borderWidth: 1.5, padding: 14, borderBottomLeftRadius: 4, position: "relative" },
  bubbleArrow: { position: "absolute", left: -8, bottom: 16, width: 0, height: 0, borderTopWidth: 6, borderBottomWidth: 6, borderRightWidth: 8, borderTopColor: "transparent", borderBottomColor: "transparent" },
  insightText: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 22 },
  statsCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 12 },
  statsTitle: { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 2 },
  statRow: { gap: 4 },
  statLabel: { fontSize: 12, fontFamily: "Inter_500Medium" },
  statBarRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  statTrack: { flex: 1, height: 6, borderRadius: 3, overflow: "hidden" },
  statFill: { height: 6, borderRadius: 3 },
  statPct: { fontSize: 13, fontFamily: "Inter_700Bold", width: 36, textAlign: "right" },
  psychCard: { borderRadius: 16, borderWidth: 1, padding: 18, gap: 10 },
  psychHeader: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  psychLabel: { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 2 },
  psychConcept: { fontSize: 19, fontFamily: "Inter_700Bold", lineHeight: 26 },
  knownBadge: { alignSelf: "flex-start", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  knownText: { fontSize: 11, fontFamily: "Inter_700Bold" },
  psychExplain: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 21 },
  speakerBtn: { borderRadius: 10, padding: 8 },
  animWrap: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  continueBtn: { borderRadius: 14, padding: 16, alignItems: "center" },
  continueBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
});
