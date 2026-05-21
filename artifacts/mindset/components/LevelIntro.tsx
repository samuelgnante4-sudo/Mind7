import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
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

function getIntroLines(level: Level): string[] {
  const t = level as any;
  if (t.speechText) return [t.speechText];
  return ["Réfléchis bien.", "Il n'y a pas de bonne réponse. Seulement la tienne."];
}

interface Props {
  level: Level;
  onStart: () => void;
}

const AUTO_ADVANCE_MS = 5500;

export default function LevelIntro({ level, onStart }: Props) {
  const colors = useColors();
  const { primaryColor } = useTheme();
  const catColor = CATEGORY_COLORS[level.category];
  const introLines = getIntroLines(level);

  const bgOpacity = useRef(new Animated.Value(0)).current;
  const characterY = useRef(new Animated.Value(80)).current;
  const characterScale = useRef(new Animated.Value(0.5)).current;
  const characterOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.88)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const bubbleOpacity = useRef(new Animated.Value(0)).current;
  const bubbleScale = useRef(new Animated.Value(0.92)).current;
  const skipOpacity = useRef(new Animated.Value(0)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;

  const [mascotState, setMascotState] = useState<MascotState>("idle");
  const [displayedText, setDisplayedText] = useState("");
  const [done, setDone] = useState(false);
  const speechRef = useRef(false);

  const fullText = introLines.join(" ");

  // Typewriter
  useEffect(() => {
    setDisplayedText("");
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayedText(fullText.slice(0, i));
      if (i >= fullText.length) clearInterval(interval);
    }, 38);
    return () => clearInterval(interval);
  }, [fullText]);

  // Text-to-speech — dove reads the text aloud
  const speakText = useCallback(() => {
    if (speechRef.current) return;
    speechRef.current = true;
    Speech.stop();
    Speech.speak(fullText, {
      language: "fr-FR",
      pitch: 1.05,
      rate: 0.88,
    });
  }, [fullText]);

  // Entry animation
  useEffect(() => {
    Animated.sequence([
      Animated.timing(bgOpacity, { toValue: 1, duration: 280, useNativeDriver: true }),
      Animated.parallel([
        Animated.spring(characterY, { toValue: 0, friction: 6, tension: 70, useNativeDriver: true }),
        Animated.spring(characterScale, { toValue: 1, friction: 6, tension: 70, useNativeDriver: true }),
        Animated.timing(characterOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.spring(cardScale, { toValue: 1, friction: 7, tension: 100, useNativeDriver: true }),
        Animated.timing(cardOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.spring(bubbleScale, { toValue: 1, friction: 6, tension: 100, useNativeDriver: true }),
        Animated.timing(bubbleOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]),
      Animated.timing(skipOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
    ]).start(() => {
      setMascotState("explaining");
      speakText();
    });

    // Progress bar for auto-advance
    Animated.timing(progressWidth, {
      toValue: 1,
      duration: AUTO_ADVANCE_MS,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) handleStart();
    });

    return () => {
      Speech.stop();
    };
  }, []);

  const handleStart = useCallback(() => {
    if (done) return;
    setDone(true);
    Speech.stop();
    setMascotState("celebrating");
    Animated.parallel([
      Animated.timing(bgOpacity, { toValue: 0, duration: 280, useNativeDriver: true }),
      Animated.timing(cardOpacity, { toValue: 0, duration: 220, useNativeDriver: true }),
      Animated.timing(characterOpacity, { toValue: 0, duration: 220, useNativeDriver: true }),
      Animated.timing(bubbleOpacity, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start(onStart);
  }, [done, onStart]);

  const known = (level as any).psychology?.known;

  return (
    <Animated.View
      style={[styles.overlay, { opacity: bgOpacity, backgroundColor: colors.background }]}
      pointerEvents="box-none"
    >
      {/* Progress bar at top */}
      <View style={[styles.topBar, { backgroundColor: catColor + "15" }]}>
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

      {/* Pills row */}
      <Animated.View
        style={[styles.pillRow, { opacity: cardOpacity, transform: [{ scale: cardScale }] }]}
      >
        <View style={[styles.pill, { backgroundColor: catColor + "22" }]}>
          <Ionicons name="eye-outline" size={12} color={catColor} />
          <Text style={[styles.pillText, { color: catColor }]}>Réflexion</Text>
        </View>
        <View style={[styles.pill, { backgroundColor: colors.secondary }]}>
          <Text style={[styles.pillText, { color: colors.mutedForeground }]}>
            {CATEGORY_LABELS[level.category]}
          </Text>
        </View>
        {known && (
          <View
            style={[
              styles.pill,
              { backgroundColor: known === "célèbre" ? "#38a16922" : "#e05c7a22" },
            ]}
          >
            <Text
              style={[
                styles.pillText,
                { color: known === "célèbre" ? "#38a169" : "#e05c7a" },
              ]}
            >
              {known === "célèbre" ? "★ Classique" : "◆ Méconnu"}
            </Text>
          </View>
        )}
      </Animated.View>

      {/* Level title */}
      <Animated.Text
        style={[styles.title, { color: colors.foreground, opacity: cardOpacity }]}
        numberOfLines={2}
      >
        {level.title}
      </Animated.Text>

      {/* Dove + speech bubble */}
      <View style={styles.characterRow}>
        <Animated.View
          style={{
            opacity: characterOpacity,
            transform: [{ translateY: characterY }, { scale: characterScale }],
          }}
        >
          <MascotCharacter state={mascotState} color={primaryColor} size={1.2} />
        </Animated.View>

        <Animated.View
          style={[
            styles.bubble,
            {
              backgroundColor: colors.card,
              borderColor: primaryColor + "77",
              opacity: bubbleOpacity,
              transform: [{ scale: bubbleScale }],
            },
          ]}
        >
          <View style={[styles.bubbleArrow, { borderRightColor: colors.card }]} />

          <Text style={[styles.bubbleText, { color: colors.foreground }]}>
            {displayedText}
            {displayedText.length < fullText.length && (
              <Text style={{ color: primaryColor, fontFamily: "Inter_700Bold" }}>|</Text>
            )}
          </Text>

          {/* Speaker icon — taps to replay voice */}
          <Pressable
            onPress={() => {
              Speech.stop();
              speechRef.current = false;
              speakText();
            }}
            hitSlop={10}
            style={({ pressed }) => [
              styles.speakerBtn,
              { backgroundColor: primaryColor + "22", opacity: pressed ? 0.6 : 1 },
            ]}
          >
            <Ionicons name="volume-high-outline" size={15} color={primaryColor} />
          </Pressable>
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
            { borderColor: colors.border, opacity: pressed ? 0.6 : 1 },
          ]}
        >
          <Text style={[styles.skipText, { color: colors.mutedForeground }]}>Passer →</Text>
        </Pressable>
      </Animated.View>

      {/* Level counter */}
      <Animated.Text
        style={[styles.levelCounter, { color: colors.mutedForeground, opacity: cardOpacity }]}
      >
        Niveau {level.id} sur 30
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
    paddingHorizontal: 26,
    gap: 18,
  },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingTop: Platform.OS === "web" ? 70 : 54,
    paddingHorizontal: 20,
    paddingBottom: 14,
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
  pillRow: {
    flexDirection: "row",
    gap: 7,
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 5,
  },
  pillText: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 27,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
    lineHeight: 35,
    maxWidth: 310,
  },
  characterRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    width: "100%",
  },
  bubble: {
    flex: 1,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    borderWidth: 1.5,
    padding: 16,
    gap: 10,
    minHeight: 90,
    justifyContent: "center",
  },
  bubbleArrow: {
    position: "absolute",
    left: -8,
    bottom: 18,
    width: 0,
    height: 0,
    borderTopWidth: 7,
    borderBottomWidth: 7,
    borderRightWidth: 9,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
  },
  bubbleText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    lineHeight: 23,
  },
  speakerBtn: {
    alignSelf: "flex-start",
    borderRadius: 8,
    padding: 5,
  },
  btnRow: {
    width: "100%",
    gap: 9,
    alignItems: "center",
    marginTop: 4,
  },
  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 16,
    paddingVertical: 15,
    paddingHorizontal: 28,
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
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderWidth: 1,
  },
  skipText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  levelCounter: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    letterSpacing: 1,
    position: "absolute",
    bottom: Platform.OS === "web" ? 50 : 38,
  },
});
