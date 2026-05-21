import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { MemoryLevel } from "@/data/levels";
import { useColors } from "@/hooks/useColors";

interface Card {
  id: number;
  pairId: number;
  text: string;
  side: "a" | "b";
  flipped: boolean;
  matched: boolean;
}

interface Props {
  level: MemoryLevel;
  catColor: string;
  onComplete: () => void;
}

export default function MemoryMatch({ level, catColor, onComplete }: Props) {
  const colors = useColors();

  const buildCards = (): Card[] => {
    const cards: Card[] = [];
    level.pairs.forEach(([a, b], i) => {
      cards.push({ id: i * 2, pairId: i, text: a, side: "a", flipped: false, matched: false });
      cards.push({ id: i * 2 + 1, pairId: i, text: b, side: "b", flipped: false, matched: false });
    });
    // shuffle
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    return cards;
  };

  const [cards, setCards] = useState<Card[]>(buildCards);
  const [selected, setSelected] = useState<number[]>([]);
  const [locked, setLocked] = useState(false);
  const [moves, setMoves] = useState(0);
  const [matchedCount, setMatchedCount] = useState(0);

  const flipAnims = useRef<Animated.Value[]>([]);
  if (flipAnims.current.length === 0) {
    flipAnims.current = cards.map(() => new Animated.Value(0));
  }

  const flipCard = useCallback((cardIndex: number, toValue: number) =>
    new Promise<void>((resolve) => {
      Animated.timing(flipAnims.current[cardIndex], {
        toValue,
        duration: 220,
        useNativeDriver: true,
      }).start(() => resolve());
    }), []);

  const handlePress = useCallback(
    async (cardIdx: number) => {
      if (locked) return;
      const card = cards[cardIdx];
      if (card.flipped || card.matched) return;
      if (selected.includes(cardIdx)) return;

      if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      await flipCard(cardIdx, 1);
      setCards((prev) => {
        const next = [...prev];
        next[cardIdx] = { ...next[cardIdx], flipped: true };
        return next;
      });

      const newSelected = [...selected, cardIdx];
      setSelected(newSelected);

      if (newSelected.length === 2) {
        setLocked(true);
        setMoves((m) => m + 1);
        const [a, b] = newSelected;
        const cardA = cards[a];
        const cardB = cards[b];

        if (cardA.pairId === cardB.pairId) {
          if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setCards((prev) => {
            const next = [...prev];
            next[a] = { ...next[a], matched: true };
            next[b] = { ...next[b], matched: true };
            return next;
          });
          const newCount = matchedCount + 1;
          setMatchedCount(newCount);
          if (newCount === level.pairs.length) {
            setTimeout(onComplete, 700);
          }
          setSelected([]);
          setLocked(false);
        } else {
          if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          setTimeout(async () => {
            await Promise.all([flipCard(a, 0), flipCard(b, 0)]);
            setCards((prev) => {
              const next = [...prev];
              next[a] = { ...next[a], flipped: false };
              next[b] = { ...next[b], flipped: false };
              return next;
            });
            setSelected([]);
            setLocked(false);
          }, 900);
        }
      }
    },
    [locked, cards, selected, matchedCount, flipCard, level.pairs.length, onComplete]
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.progress, { color: colors.mutedForeground }]}>
          {matchedCount} / {level.pairs.length} paires trouvées
        </Text>
        <Text style={[styles.moves, { color: colors.mutedForeground }]}>
          {moves} coup{moves !== 1 ? "s" : ""}
        </Text>
      </View>

      <View style={styles.grid}>
        {cards.map((card, idx) => {
          const anim = flipAnims.current[idx];
          const frontInterpolate = anim?.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: ["0deg", "90deg", "0deg"],
          });

          return (
            <Pressable
              key={card.id}
              onPress={() => handlePress(idx)}
              style={({ pressed }) => [
                styles.card,
                {
                  backgroundColor: card.matched
                    ? catColor + "22"
                    : card.flipped
                    ? colors.accent
                    : colors.secondary,
                  borderColor: card.matched ? catColor : card.flipped ? catColor + "88" : colors.border,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <Animated.View style={{ transform: [{ rotateY: frontInterpolate ?? "0deg" }] }}>
                {card.flipped || card.matched ? (
                  <Text
                    style={[
                      styles.cardText,
                      { color: card.matched ? catColor : colors.foreground },
                    ]}
                    numberOfLines={3}
                  >
                    {card.text}
                  </Text>
                ) : (
                  <Text style={[styles.cardHidden, { color: colors.mutedForeground }]}>?</Text>
                )}
              </Animated.View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 20, width: "100%", alignItems: "center" },
  header: { flexDirection: "row", justifyContent: "space-between", width: "100%", paddingHorizontal: 4 },
  progress: { fontSize: 13, fontFamily: "Inter_500Medium" },
  moves: { fontSize: 13, fontFamily: "Inter_400Regular" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12, justifyContent: "center" },
  card: {
    width: 140,
    height: 80,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  cardText: { fontSize: 13, fontFamily: "Inter_600SemiBold", textAlign: "center", lineHeight: 18 },
  cardHidden: { fontSize: 24, fontFamily: "Inter_700Bold" },
});
