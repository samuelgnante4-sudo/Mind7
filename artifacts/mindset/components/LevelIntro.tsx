import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useRef, useState } from "react";
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
import { CATEGORY_COLORS, CATEGORY_LABELS, Level } from "@/data/levels";
import { useColors } from "@/hooks/useColors";

const TYPE_LABELS: Record<string, string> = {
  reflection: "Dilemme moral",
  quiz: "Question",
  memory: "Mémoire",
  sequence: "Séquence",
  pattern: "Logique",
};

const TYPE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  reflection: "eye-outline",
  quiz: "help-circle-outline",
  memory: "copy-outline",
  sequence: "grid-outline",
  pattern: "analytics-outline",
};

function getIntroLines(level: Level): string[] {
  switch (level.type) {
    case "reflection":
      return [
        "Un dilemme t'attend...",
        "Il n'y a pas de bonne réponse.",
        "Seulement la tienne.",
      ];
    case "quiz":
      if (level.category === "corps")
        return ["Ton corps te réserve", "des secrets étonnants.", "Prêt à découvrir ?"];
      if (level.category === "histoire")
        return ["L'Histoire ne ment jamais.", "Mais elle surprend toujours."];
      if (level.category === "science")
        return ["La science est formelle.", "Sauras-tu répondre ?"];
      if (level.category === "nature")
        return ["La nature est fascinante.", "Elle te met au défi."];
      return ["Une question t'attend.", "Montre ce que tu sais."];
    case "sequence":
      return [
        "Observe attentivement.",
        "Mémorise chaque lumière.",
        "Puis reproduis.",
      ];
    case "memory":
      return [
        "Les paires sont cachées.",
        "Ta mémoire est ton arme.",
        "Trouve-les toutes.",
      ];
    case "pattern":
      return [
        "Une suite logique...",
        "Cherche le schéma caché.",
        "Quelle est la prochaine ?",
      ];
    default:
      return ["Prêt pour le prochain défi ?"];
  }
}

interface Props {
  level: Level;
  onStart: () => void;
}

const AUTO_ADVANCE_MS = 4200;

export default function LevelIntro({ level, onStart }: Props) {
  const colors = useColors();
  const { primaryColor } = useTheme();
  const catColor = CATEGORY_COLORS[level.category];
  const introLines = getIntroLines(level);

  // Animation values
  const bgOpacity = useRef(new Animated.Value(0)).current;
  const characterY = useRef(new Animated.Value(60)).current;
  const characterOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.85)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const bubbleOpacity = useRef(new Animated.Value(0)).current;
  const skipOpacity = useRef(new Animated.Value(0)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;

  const [mascotState, setMascotState] = useState<MascotState>("idle");
  const [lineIndex, setLineIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [done, setDone] = useState(false);

  const lines = introLines;
  const currentLine = lines[lineIndex] ?? "";

  // Typewriter effect
  useEffect(() => {
    setDisplayedText("");
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayedText(currentLine.slice(0, i));
      if (i >= currentLine.length) clearInterval(interval);
    }, 40);
    return () => clearInterval(interval);
  }, [lineIndex, currentLine]);

  // Advance lines
  useEffect(() => {
    if (displayedText.length < currentLine.length) return;
    const delay = lineIndex < lines.length - 1 ? 900 : 99999;
    const t = setTimeout(() => {
      if (lineIndex < lines.length - 1) {
        setLineIndex((i) => i + 1);
      }
    }, delay);
    return () => clearTimeout(t);
  }, [displayedText, currentLine, lineIndex, lines.length]);

  // Entry animation sequence
  useEffect(() => {
    Animated.sequence([
      Animated.timing(bgOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.parallel([
        Animated.spring(characterY, { toValue: 0, friction: 6, tension: 80, useNativeDriver: true }),
        Animated.timing(characterOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.spring(cardScale, { toValue: 1, friction: 6, tension: 100, useNativeDriver: true }),
        Animated.timing(cardOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]),
      Animated.timing(bubbleOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.timing(skipOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start(() => {
      setMascotState("explaining");
    });

    // Progress bar
    Animated.timing(progressWidth, {
      toValue: 1,
      duration: AUTO_ADVANCE_MS,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) handleStart();
    });
  }, []);

  const handleStart = useCallback(() => {
    if (done) return;
    setDone(true);
    setMascotState("celebrating");
    Animated.parallel([
      Animated.timing(bgOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.timing(cardOpacity, { toValue: 0, duration: 250, useNativeDriver: true }),
      Animated.timing(characterOpacity, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start(onStart);
  }, [done, onStart]);

  return (
    <Animated.View style={[styles.overlay, { opacity: bgOpacity, backgroundColor: colors.background }]}>
      {/* Top accent bar */}
      <View style={[styles.topAccent, { backgroundColor: catColor + "22" }]}>
        <View style={[styles.progressTrack, { backgroundColor: colors.secondary }]}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                backgroundColor: catColor,
                width: progressWidth.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0%", "100%"],
                }),
              },
            ]}
          />
        </View>
      </View>

      {/* Level meta */}
      <Animated.View style={[styles.metaRow, { opacity: cardOpacity, transform: [{ scale: cardScale }] }]}>
        <View style={[styles.typePill, { backgroundColor: catColor + "20" }]}>
          <Ionicons name={TYPE_ICONS[level.type]} size={13} color={catColor} />
          <Text style={[styles.typePillText, { color: catColor }]}>
            {TYPE_LABELS[level.type]}
          </Text>
        </View>
        <View style={[styles.catPill, { backgroundColor: colors.secondary }]}>
          <Text style={[styles.catPillText, { color: colors.mutedForeground }]}>
            {CATEGORY_LABELS[level.category]}
          </Text>
        </View>
      </Animated.View>

      {/* Title */}
      <Animated.Text
        style={[styles.levelTitle, { color: colors.foreground, opacity: cardOpacity }]}
        numberOfLines={2}
      >
        {level.title}
      </Animated.Text>

      {/* Character + speech bubble */}
      <View style={styles.characterSection}>
        <Animated.View
          style={[
            styles.characterWrap,
            {
              opacity: characterOpacity,
              transform: [{ translateY: characterY }],
            },
          ]}
        >
          <MascotCharacter state={mascotState} color={primaryColor} size={1.3} />
        </Animated.View>

        <Animated.View
          style={[
            styles.bubble,
            {
              backgroundColor: colors.card,
              borderColor: primaryColor + "66",
              opacity: bubbleOpacity,
            },
          ]}
        >
          {/* Arrow pointing to character */}
          <View style={[styles.bubbleArrow, { borderRightColor: colors.card }]} />

          <Text style={[styles.bubbleLine, { color: colors.foreground }]}>
            {displayedText}
            {displayedText.length < currentLine.length && (
              <Text style={{ color: primaryColor }}>|</Text>
            )}
          </Text>

          {/* Dots for remaining lines */}
          {lines.length > 1 && (
            <View style={styles.lineDots}>
              {lines.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.lineDot,
                    { backgroundColor: i <= lineIndex ? primaryColor : colors.secondary },
                  ]}
                />
              ))}
            </View>
          )}
        </Animated.View>
      </View>

      {/* Buttons */}
      <Animated.View style={[styles.btnRow, { opacity: skipOpacity }]}>
        <Pressable
          onPress={handleStart}
          style={({ pressed }) => [
            styles.startBtn,
            { backgroundColor: catColor, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Text style={styles.startBtnText}>Commencer</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </Pressable>

        <Pressable
          onPress={handleStart}
          style={({ pressed }) => [
            styles.skipBtn,
            {
              borderColor: colors.border,
              opacity: pressed ? 0.6 : 1,
            },
          ]}
        >
          <Text style={[styles.skipText, { color: colors.mutedForeground }]}>
            Passer
          </Text>
        </Pressable>
      </Animated.View>

      {/* Level number */}
      <Animated.Text
        style={[styles.levelNum, { color: colors.mutedForeground, opacity: cardOpacity }]}
      >
        Niveau {level.id} / 30
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    gap: 20,
  },
  topAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingTop: Platform.OS === "web" ? 67 : 50,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
  },
  metaRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  typePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  typePillText: { fontSize: 12, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  catPill: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  catPillText: { fontSize: 11, fontFamily: "Inter_500Medium", letterSpacing: 1 },
  levelTitle: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
    lineHeight: 36,
    maxWidth: 300,
  },
  characterSection: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    width: "100%",
  },
  characterWrap: {
    alignItems: "center",
  },
  bubble: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1.5,
    borderBottomLeftRadius: 4,
    padding: 16,
    gap: 12,
    position: "relative",
    minHeight: 80,
    justifyContent: "center",
  },
  bubbleArrow: {
    position: "absolute",
    left: -8,
    bottom: 16,
    width: 0,
    height: 0,
    borderTopWidth: 7,
    borderBottomWidth: 7,
    borderRightWidth: 8,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
  },
  bubbleLine: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    lineHeight: 24,
  },
  lineDots: {
    flexDirection: "row",
    gap: 5,
  },
  lineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  btnRow: {
    width: "100%",
    gap: 10,
    alignItems: "center",
    marginTop: 8,
  },
  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: "100%",
    justifyContent: "center",
  },
  startBtnText: {
    color: "#fff",
    fontSize: 17,
    fontFamily: "Inter_700Bold",
  },
  skipBtn: {
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
  },
  skipText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  levelNum: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    letterSpacing: 1,
    position: "absolute",
    bottom: Platform.OS === "web" ? 50 : 40,
  },
});
