import * as Haptics from "expo-haptics";
import React, { useRef, useState } from "react";
import { Animated, Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { PatternLevel } from "@/data/levels";
import { useColors } from "@/hooks/useColors";

interface Props {
  level: PatternLevel;
  catColor: string;
  onComplete: () => void;
}

type State = "idle" | "correct" | "wrong";

export default function PatternGame({ level, catColor, onComplete }: Props) {
  const colors = useColors();
  const [selected, setSelected] = useState<number | null>(null);
  const [state, setState] = useState<State>("idle");
  const feedbackOpacity = useRef(new Animated.Value(0)).current;

  const handleSelect = (idx: number) => {
    if (state !== "idle") return;
    setSelected(idx);
    const isCorrect = idx === level.correct;

    if (Platform.OS !== "web") {
      if (isCorrect) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      else Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    setState(isCorrect ? "correct" : "wrong");
    Animated.timing(feedbackOpacity, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  };

  const letters = ["A", "B", "C", "D"];

  return (
    <View style={styles.container}>
      {/* Sequence display */}
      <View style={[styles.sequenceBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.sequenceRow}>
          {level.sequence.map((item, i) => {
            const isBlank = item === "?";
            return (
              <View
                key={i}
                style={[
                  styles.seqItem,
                  {
                    backgroundColor: isBlank ? catColor + "22" : colors.secondary,
                    borderColor: isBlank ? catColor : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.seqText,
                    { color: isBlank ? catColor : colors.foreground },
                  ]}
                >
                  {item}
                </Text>
              </View>
            );
          })}
        </View>
        <Text style={[styles.prompt, { color: colors.mutedForeground }]}>Que vient ensuite ?</Text>
      </View>

      {/* Options */}
      <View style={styles.optionsGrid}>
        {level.options.map((opt, idx) => {
          let borderColor = colors.border;
          let bgColor = colors.secondary;

          if (selected !== null) {
            if (idx === level.correct) {
              borderColor = "#68d391";
              bgColor = "rgba(104,211,145,0.12)";
            } else if (idx === selected && idx !== level.correct) {
              borderColor = colors.destructive;
              bgColor = "rgba(252,129,129,0.12)";
            }
          }

          return (
            <Pressable
              key={idx}
              onPress={() => handleSelect(idx)}
              disabled={state !== "idle"}
              style={({ pressed }) => [
                styles.option,
                { borderColor, backgroundColor: bgColor, opacity: state !== "idle" && idx !== level.correct && idx !== selected ? 0.45 : pressed ? 0.8 : 1 },
              ]}
            >
              <Text style={[styles.letterTag, { color: catColor }]}>{letters[idx]}</Text>
              <Text style={[styles.optionText, { color: colors.foreground }]}>{opt}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Explanation */}
      {state !== "idle" && (
        <Animated.View style={[styles.explainBox, { backgroundColor: colors.card, borderColor: state === "correct" ? "#68d391" + "44" : colors.border, opacity: feedbackOpacity }]}>
          <Text style={[styles.explainLabel, { color: state === "correct" ? "#68d391" : colors.destructive }]}>
            {state === "correct" ? "Exact !" : `La réponse était : ${level.options[level.correct]}`}
          </Text>
          <Text style={[styles.explainText, { color: colors.mutedForeground }]}>{level.explanation}</Text>
          <Pressable
            onPress={onComplete}
            style={({ pressed }) => [styles.btn, { backgroundColor: catColor, opacity: pressed ? 0.8 : 1 }]}
          >
            <Text style={styles.btnText}>Continuer →</Text>
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 24, width: "100%" },
  sequenceBox: { borderRadius: 16, borderWidth: 1, padding: 20, gap: 14, alignItems: "center" },
  sequenceRow: { flexDirection: "row", gap: 10, flexWrap: "wrap", justifyContent: "center" },
  seqItem: { minWidth: 48, height: 48, borderRadius: 10, borderWidth: 1.5, alignItems: "center", justifyContent: "center", paddingHorizontal: 8 },
  seqText: { fontSize: 18, fontFamily: "Inter_700Bold" },
  prompt: { fontSize: 13, fontFamily: "Inter_400Regular", letterSpacing: 1 },
  optionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  option: { flex: 1, minWidth: "45%", flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 14, borderWidth: 1.5, padding: 16 },
  letterTag: { fontSize: 13, fontFamily: "Inter_700Bold" },
  optionText: { fontSize: 18, fontFamily: "Inter_700Bold" },
  explainBox: { borderRadius: 16, borderWidth: 1, padding: 20, gap: 10 },
  explainLabel: { fontSize: 15, fontFamily: "Inter_700Bold" },
  explainText: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 22 },
  btn: { borderRadius: 12, padding: 14, alignItems: "center", marginTop: 4 },
  btnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
