import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { SequenceLevel } from "@/data/levels";
import { useColors } from "@/hooks/useColors";

const BTN_COLORS_4 = ["#4fd1c5", "#63b3ed", "#f6ad55", "#fc8181"];
const BTN_COLORS_6 = ["#4fd1c5", "#63b3ed", "#f6ad55", "#fc8181", "#9f7aea", "#68d391"];

type Phase = "observe" | "reproduce" | "success" | "fail";

interface Props {
  level: SequenceLevel;
  onComplete: () => void;
}

export default function SequenceGame({ level, onComplete }: Props) {
  const colors = useColors();
  const btnColors = level.buttons === 6 ? BTN_COLORS_6 : BTN_COLORS_4;

  const [phase, setPhase] = useState<Phase>("observe");
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerInput, setPlayerInput] = useState<number[]>([]);
  const [activeBtn, setActiveBtn] = useState<number | null>(null);
  const [message, setMessage] = useState("Observe la séquence...");
  const [attempts, setAttempts] = useState(0);

  const glowAnims = useRef(
    Array.from({ length: level.buttons }, () => new Animated.Value(0))
  ).current;
  const scaleAnims = useRef(
    Array.from({ length: level.buttons }, () => new Animated.Value(1))
  ).current;

  const flash = useCallback(
    (idx: number, ms = 350) =>
      new Promise<void>((resolve) => {
        setActiveBtn(idx);
        Animated.parallel([
          Animated.sequence([
            Animated.timing(glowAnims[idx], { toValue: 1, duration: ms * 0.4, useNativeDriver: false }),
            Animated.timing(glowAnims[idx], { toValue: 0, duration: ms * 0.6, useNativeDriver: false }),
          ]),
          Animated.sequence([
            Animated.timing(scaleAnims[idx], { toValue: 1.13, duration: ms * 0.4, useNativeDriver: true }),
            Animated.timing(scaleAnims[idx], { toValue: 1, duration: ms * 0.6, useNativeDriver: true }),
          ]),
        ]).start(() => { setActiveBtn(null); resolve(); });
      }),
    [glowAnims, scaleAnims]
  );

  const playSequence = useCallback(
    async (seq: number[]) => {
      setPhase("observe");
      setMessage("Observe la séquence...");
      await new Promise((r) => setTimeout(r, 600));
      for (const idx of seq) {
        await flash(idx, 380);
        await new Promise((r) => setTimeout(r, 160));
      }
      setPhase("reproduce");
      setMessage("À toi ! Reproduis la séquence");
    },
    [flash]
  );

  useEffect(() => {
    const seq: number[] = Array.from({ length: level.length }, () =>
      Math.floor(Math.random() * level.buttons)
    );
    setSequence(seq);
    playSequence(seq);
  }, []);

  const handlePress = useCallback(
    async (idx: number) => {
      if (phase !== "reproduce") return;
      if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      await flash(idx, 200);
      const next = [...playerInput, idx];
      setPlayerInput(next);
      const pos = next.length - 1;

      if (next[pos] !== sequence[pos]) {
        setPhase("fail");
        if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setMessage("Raté... Recommence !");
        setAttempts((a) => a + 1);
        setTimeout(() => {
          setPlayerInput([]);
          playSequence(sequence);
        }, 1000);
        return;
      }

      if (next.length === sequence.length) {
        setPhase("success");
        if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setMessage("Parfait !");
        setTimeout(onComplete, 900);
      }
    },
    [phase, playerInput, sequence, flash, playSequence, onComplete]
  );

  const cols = level.buttons === 6 ? 3 : 2;
  const btnSize = level.buttons === 6 ? 90 : 120;
  const gap = 14;

  return (
    <View style={styles.container}>
      <Text style={[styles.message, { color: phase === "fail" ? colors.destructive : phase === "success" ? "#68d391" : colors.foreground }]}>
        {message}
      </Text>
      {attempts > 0 && (
        <Text style={[styles.attempts, { color: colors.mutedForeground }]}>
          Tentative {attempts + 1}
        </Text>
      )}

      <View style={[styles.grid, { gap, flexWrap: "wrap", width: cols * btnSize + (cols - 1) * gap }]}>
        {Array.from({ length: level.buttons }, (_, idx) => (
          <Animated.View key={idx} style={{ transform: [{ scale: scaleAnims[idx] }] }}>
            <Pressable
              onPress={() => handlePress(idx)}
              disabled={phase !== "reproduce"}
              style={({ pressed }) => [
                styles.btn,
                {
                  width: btnSize,
                  height: btnSize,
                  backgroundColor: activeBtn === idx ? btnColors[idx] : colors.secondary,
                  borderColor: activeBtn === idx ? btnColors[idx] : colors.border,
                  opacity: phase !== "reproduce" && activeBtn !== idx ? 0.65 : pressed ? 0.8 : 1,
                },
              ]}
            >
              <Animated.View
                style={[
                  StyleSheet.absoluteFill,
                  {
                    backgroundColor: btnColors[idx],
                    borderRadius: 18,
                    opacity: glowAnims[idx].interpolate({ inputRange: [0, 1], outputRange: [0, 0.28] }),
                  },
                ]}
              />
            </Pressable>
          </Animated.View>
        ))}
      </View>

      {/* dots */}
      <View style={styles.dotsRow}>
        {sequence.map((s, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: i < playerInput.length ? btnColors[s] : colors.secondary,
                borderColor: i < playerInput.length ? btnColors[s] : colors.border,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", gap: 28 },
  message: { fontSize: 22, fontFamily: "Inter_600SemiBold", textAlign: "center", paddingHorizontal: 16 },
  attempts: { fontSize: 13, fontFamily: "Inter_400Regular" },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center" },
  btn: { borderRadius: 18, borderWidth: 1.5, overflow: "hidden", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 10, elevation: 5 },
  dotsRow: { flexDirection: "row", gap: 7, flexWrap: "wrap", justifyContent: "center", maxWidth: 300 },
  dot: { width: 10, height: 10, borderRadius: 5, borderWidth: 1 },
});
