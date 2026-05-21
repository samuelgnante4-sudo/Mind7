import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useGame } from "@/context/GameContext";
import { useColors } from "@/hooks/useColors";

type Phase = "observe" | "reproduce" | "success" | "fail" | "ready";

const MAX_LEVEL = 200;

function getSequenceLength(level: number): number {
  if (level <= 20) return level + 2;
  if (level <= 100) return 22 + Math.floor((level - 20) * 0.6);
  return 70 + Math.floor((level - 100) * 0.5);
}

function getIntervalMs(level: number): number {
  if (level <= 20) return 700;
  if (level <= 100) return Math.max(450, 700 - (level - 20) * 3);
  return Math.max(320, 450 - (level - 100) * 1.5);
}

const BUTTON_COLORS = ["#4fd1c5", "#63b3ed", "#f6ad55", "#fc8181"];
const GLOW_COLORS = ["#4fd1c5", "#63b3ed", "#f6ad55", "#fc8181"];

export default function GameScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { level, saveProgress, incrementGamesPlayed } = useGame();

  const [phase, setPhase] = useState<Phase>("ready");
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerInput, setPlayerInput] = useState<number[]>([]);
  const [activeButton, setActiveButton] = useState<number | null>(null);
  const [currentLevel, setCurrentLevel] = useState(level);
  const [message, setMessage] = useState("Prêt ?");
  const [combo, setCombo] = useState(0);

  const glowAnims = useRef([0, 1, 2, 3].map(() => new Animated.Value(0))).current;
  const scaleAnims = useRef([0, 1, 2, 3].map(() => new Animated.Value(1))).current;
  const messageAnim = useRef(new Animated.Value(1)).current;

  const flashMessage = useCallback((msg: string) => {
    setMessage(msg);
    messageAnim.setValue(0);
    Animated.timing(messageAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const flashButton = useCallback(
    (idx: number, duration = 400) => {
      return new Promise<void>((resolve) => {
        setActiveButton(idx);
        Animated.parallel([
          Animated.sequence([
            Animated.timing(glowAnims[idx], {
              toValue: 1,
              duration: duration * 0.4,
              useNativeDriver: false,
            }),
            Animated.timing(glowAnims[idx], {
              toValue: 0,
              duration: duration * 0.6,
              useNativeDriver: false,
            }),
          ]),
          Animated.sequence([
            Animated.timing(scaleAnims[idx], {
              toValue: 1.12,
              duration: duration * 0.4,
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnims[idx], {
              toValue: 1,
              duration: duration * 0.6,
              useNativeDriver: true,
            }),
          ]),
        ]).start(() => {
          setActiveButton(null);
          resolve();
        });
      });
    },
    [glowAnims, scaleAnims]
  );

  const buildSequence = useCallback((lvl: number): number[] => {
    const len = getSequenceLength(lvl);
    return Array.from({ length: len }, () => Math.floor(Math.random() * 4));
  }, []);

  const playSequence = useCallback(
    async (seq: number[], lvl: number) => {
      setPhase("observe");
      flashMessage("Observe...");
      const interval = getIntervalMs(lvl);
      await new Promise((r) => setTimeout(r, 500));
      for (const idx of seq) {
        await flashButton(idx, interval * 0.7);
        await new Promise((r) => setTimeout(r, interval * 0.3));
      }
      setPhase("reproduce");
      flashMessage("Reproduis !");
    },
    [flashButton, flashMessage]
  );

  const startLevel = useCallback(
    async (lvl: number) => {
      setPlayerInput([]);
      const seq = buildSequence(lvl);
      setSequence(seq);
      await playSequence(seq, lvl);
    },
    [buildSequence, playSequence]
  );

  useEffect(() => {
    const timer = setTimeout(() => startLevel(currentLevel), 600);
    return () => clearTimeout(timer);
  }, []);

  const handlePress = useCallback(
    async (idx: number) => {
      if (phase !== "reproduce") return;

      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      await flashButton(idx, 250);

      const newInput = [...playerInput, idx];
      setPlayerInput(newInput);

      const pos = newInput.length - 1;

      if (newInput[pos] !== sequence[pos]) {
        // Wrong
        setPhase("fail");
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
        flashMessage("Erreur !");
        setCombo(0);
        await incrementGamesPlayed();
        setTimeout(async () => {
          setPlayerInput([]);
          await startLevel(currentLevel);
        }, 1200);
        return;
      }

      if (newInput.length === sequence.length) {
        // Level complete
        setPhase("success");
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        const nextLevel = Math.min(currentLevel + 1, MAX_LEVEL);
        setCombo((c) => c + 1);
        if (nextLevel === MAX_LEVEL) {
          flashMessage("Félicitations !");
        } else {
          flashMessage(`Niveau ${nextLevel} !`);
        }
        setCurrentLevel(nextLevel);
        await saveProgress(nextLevel);
        setTimeout(async () => {
          setPlayerInput([]);
          await startLevel(nextLevel);
        }, 1000);
      }
    },
    [
      phase,
      playerInput,
      sequence,
      currentLevel,
      flashButton,
      flashMessage,
      startLevel,
      saveProgress,
      incrementGamesPlayed,
    ]
  );

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  const progressPct = Math.min((currentLevel - 1) / (MAX_LEVEL - 1), 1);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: topPadding + 16,
          paddingBottom: bottomPadding + 16,
        },
      ]}
    >
      {/* Top bar */}
      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1 }]}
        >
          <Text style={[styles.backText, { color: colors.mutedForeground }]}>
            ←
          </Text>
        </Pressable>
        <View style={styles.levelBadge}>
          <Text style={[styles.levelText, { color: colors.primary }]}>
            Niveau {currentLevel}
          </Text>
        </View>
        {combo > 1 ? (
          <View style={[styles.comboBadge, { backgroundColor: colors.primary }]}>
            <Text style={[styles.comboText, { color: colors.primaryForeground }]}>
              ×{combo}
            </Text>
          </View>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      {/* Progress bar */}
      <View
        style={[styles.progressTrack, { backgroundColor: colors.secondary }]}
      >
        <View
          style={[
            styles.progressFill,
            {
              backgroundColor: colors.primary,
              width: `${progressPct * 100}%`,
            },
          ]}
        />
      </View>

      {/* Message */}
      <Animated.View style={[styles.messageWrap, { opacity: messageAnim }]}>
        <Text
          style={[
            styles.message,
            {
              color:
                phase === "fail"
                  ? colors.destructive
                  : phase === "success"
                  ? colors.primary
                  : colors.foreground,
            },
          ]}
        >
          {message}
        </Text>
        <Text style={[styles.subMessage, { color: colors.mutedForeground }]}>
          {phase === "observe"
            ? `Séquence de ${sequence.length} boutons`
            : phase === "reproduce"
            ? `${playerInput.length} / ${sequence.length}`
            : ""}
        </Text>
      </Animated.View>

      {/* Game grid */}
      <View style={styles.grid}>
        {[0, 1, 2, 3].map((idx) => {
          const isActive = activeButton === idx;
          const btnColor = BUTTON_COLORS[idx];
          const glowColor = GLOW_COLORS[idx];

          return (
            <Animated.View
              key={idx}
              style={[
                styles.buttonWrap,
                { transform: [{ scale: scaleAnims[idx] }] },
              ]}
            >
              <Pressable
                onPress={() => handlePress(idx)}
                disabled={phase !== "reproduce"}
                style={({ pressed }) => [
                  styles.gameButton,
                  {
                    backgroundColor: isActive
                      ? btnColor
                      : colors.secondary,
                    borderColor: isActive ? btnColor : colors.border,
                    opacity:
                      phase !== "reproduce" && !isActive ? 0.7 : pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Animated.View
                  style={[
                    styles.glowOverlay,
                    {
                      backgroundColor: glowColor,
                      opacity: glowAnims[idx].interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 0.25],
                      }),
                    },
                  ]}
                />
              </Pressable>
            </Animated.View>
          );
        })}
      </View>

      {/* Sequence dots */}
      <View style={styles.dotsRow}>
        {sequence.slice(0, Math.min(sequence.length, 20)).map((s, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor:
                  i < playerInput.length
                    ? BUTTON_COLORS[s]
                    : colors.secondary,
                borderColor:
                  i < playerInput.length ? BUTTON_COLORS[s] : colors.border,
              },
            ]}
          />
        ))}
        {sequence.length > 20 && (
          <Text style={[styles.dotMore, { color: colors.mutedForeground }]}>
            +{sequence.length - 20}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    gap: 16,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  backBtn: {
    width: 40,
    alignItems: "flex-start",
  },
  backText: {
    fontSize: 24,
    fontFamily: "Inter_400Regular",
  },
  levelBadge: {
    alignItems: "center",
  },
  levelText: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1,
  },
  comboBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    minWidth: 40,
    alignItems: "center",
  },
  comboText: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
  progressTrack: {
    width: "100%",
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
  },
  messageWrap: {
    alignItems: "center",
    gap: 4,
    minHeight: 56,
    justifyContent: "center",
  },
  message: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1,
  },
  subMessage: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    letterSpacing: 1,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    justifyContent: "center",
    width: 300,
    height: 300,
    alignContent: "center",
  },
  buttonWrap: {
    width: 130,
    height: 130,
  },
  gameButton: {
    flex: 1,
    borderRadius: 24,
    borderWidth: 1.5,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 6,
  },
  glowOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  dotsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    justifyContent: "center",
    paddingHorizontal: 16,
    maxWidth: "100%",
    minHeight: 20,
    alignItems: "center",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
  },
  dotMore: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
});
