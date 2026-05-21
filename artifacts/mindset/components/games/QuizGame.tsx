import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { Animated, Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { QuizLevel } from "@/data/levels";
import { useColors } from "@/hooks/useColors";

interface Props {
  level: QuizLevel;
  catColor: string;
  onComplete: () => void;
}

type State = "idle" | "correct" | "wrong";

export default function QuizGame({ level, catColor, onComplete }: Props) {
  const colors = useColors();
  const [selected, setSelected] = useState<number | null>(null);
  const [state, setState] = useState<State>("idle");

  const handleSelect = (idx: number) => {
    if (state !== "idle") return;
    setSelected(idx);
    if (Platform.OS !== "web") {
      if (idx === level.correct) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
    setState(idx === level.correct ? "correct" : "wrong");
  };

  const getBtnStyle = (idx: number) => {
    if (selected === null) return { borderColor: colors.border, backgroundColor: colors.secondary };
    if (idx === level.correct) return { borderColor: "#68d391", backgroundColor: "rgba(104,211,145,0.12)" };
    if (idx === selected && idx !== level.correct) return { borderColor: colors.destructive, backgroundColor: "rgba(252,129,129,0.12)" };
    return { borderColor: colors.border, backgroundColor: colors.secondary, opacity: 0.5 };
  };

  const letters = ["A", "B", "C", "D"];

  return (
    <View style={styles.container}>
      <Text style={[styles.question, { color: colors.foreground }]}>{level.question}</Text>

      <View style={styles.options}>
        {level.options.map((opt, idx) => (
          <Pressable
            key={idx}
            onPress={() => handleSelect(idx)}
            disabled={state !== "idle"}
            style={({ pressed }) => [
              styles.option,
              getBtnStyle(idx),
              { opacity: state !== "idle" ? (getBtnStyle(idx).opacity ?? 1) : pressed ? 0.75 : 1 },
            ]}
          >
            <View style={[styles.letterBadge, { backgroundColor: catColor + "22", borderColor: catColor + "44" }]}>
              <Text style={[styles.letter, { color: catColor }]}>{letters[idx]}</Text>
            </View>
            <Text style={[styles.optionText, { color: colors.foreground }]}>{opt}</Text>
          </Pressable>
        ))}
      </View>

      {state !== "idle" && (
        <View style={[styles.factBox, { backgroundColor: colors.card, borderColor: state === "correct" ? "#68d391" + "44" : colors.border }]}>
          <Text style={[styles.factLabel, { color: state === "correct" ? "#68d391" : colors.destructive }]}>
            {state === "correct" ? "Correct !" : "Pas tout à fait..."}
          </Text>
          <Text style={[styles.factText, { color: colors.mutedForeground }]}>{level.fact}</Text>
          <Pressable
            onPress={onComplete}
            style={({ pressed }) => [styles.continueBtn, { backgroundColor: catColor, opacity: pressed ? 0.8 : 1 }]}
          >
            <Text style={[styles.continueBtnText, { color: "#fff" }]}>Continuer →</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 24, width: "100%" },
  question: { fontSize: 22, fontFamily: "Inter_600SemiBold", lineHeight: 32, textAlign: "center", paddingHorizontal: 8 },
  options: { gap: 12 },
  option: { flexDirection: "row", alignItems: "center", gap: 14, borderRadius: 14, borderWidth: 1.5, padding: 16 },
  letterBadge: { width: 32, height: 32, borderRadius: 8, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  letter: { fontSize: 14, fontFamily: "Inter_700Bold" },
  optionText: { fontSize: 16, fontFamily: "Inter_500Medium", flex: 1 },
  factBox: { borderRadius: 16, borderWidth: 1, padding: 20, gap: 10 },
  factLabel: { fontSize: 16, fontFamily: "Inter_700Bold" },
  factText: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 22 },
  continueBtn: { borderRadius: 12, padding: 14, alignItems: "center", marginTop: 6 },
  continueBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
