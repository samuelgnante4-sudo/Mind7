import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

export type MascotState =
  | "idle"
  | "thinking"
  | "celebrating"
  | "explaining"
  | "surprised";

interface Props {
  state?: MascotState;
  color: string;
  size?: number;
}

// Professor Dove mascot — pure React Native Views
export default function MascotCharacter({ state = "idle", color, size = 1 }: Props) {
  const bounceY = useRef(new Animated.Value(0)).current;
  const wingLRot = useRef(new Animated.Value(0)).current;
  const wingRRot = useRef(new Animated.Value(0)).current;
  const headTilt = useRef(new Animated.Value(0)).current;
  const bodySquish = useRef(new Animated.Value(1)).current;
  const entryScale = useRef(new Animated.Value(0)).current;
  const eyeScaleL = useRef(new Animated.Value(1)).current;
  const eyeScaleR = useRef(new Animated.Value(1)).current;

  // Entry pop
  useEffect(() => {
    Animated.spring(entryScale, { toValue: 1, friction: 5, tension: 90, useNativeDriver: true }).start();
  }, []);

  // Blink loop
  useEffect(() => {
    const blink = () => {
      const seq = Animated.sequence([
        Animated.timing(eyeScaleL, { toValue: 0.08, duration: 70, useNativeDriver: true }),
        Animated.timing(eyeScaleL, { toValue: 1, duration: 80, useNativeDriver: true }),
      ]);
      const seq2 = Animated.sequence([
        Animated.timing(eyeScaleR, { toValue: 0.08, duration: 70, useNativeDriver: true }),
        Animated.timing(eyeScaleR, { toValue: 1, duration: 80, useNativeDriver: true }),
      ]);
      Animated.parallel([seq, seq2]).start();
    };
    const id = setInterval(blink, 2800 + Math.random() * 1800);
    return () => clearInterval(id);
  }, []);

  // State animations
  useEffect(() => {
    bounceY.stopAnimation();
    wingLRot.stopAnimation();
    wingRRot.stopAnimation();
    headTilt.stopAnimation();
    bodySquish.stopAnimation();

    if (state === "idle") {
      Animated.loop(Animated.sequence([
        Animated.timing(bounceY, { toValue: -7, duration: 1000, useNativeDriver: true }),
        Animated.timing(bounceY, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ])).start();
      Animated.timing(wingLRot, { toValue: -15, duration: 400, useNativeDriver: true }).start();
      Animated.timing(wingRRot, { toValue: 15, duration: 400, useNativeDriver: true }).start();
      Animated.timing(headTilt, { toValue: 0, duration: 300, useNativeDriver: true }).start();
    }

    if (state === "thinking") {
      Animated.loop(Animated.sequence([
        Animated.timing(bounceY, { toValue: -3, duration: 1400, useNativeDriver: true }),
        Animated.timing(bounceY, { toValue: 0, duration: 1400, useNativeDriver: true }),
      ])).start();
      Animated.timing(wingLRot, { toValue: -55, duration: 500, useNativeDriver: true }).start();
      Animated.timing(wingRRot, { toValue: 10, duration: 500, useNativeDriver: true }).start();
      Animated.timing(headTilt, { toValue: -12, duration: 400, useNativeDriver: true }).start();
    }

    if (state === "explaining") {
      Animated.loop(Animated.sequence([
        Animated.timing(bounceY, { toValue: -5, duration: 800, useNativeDriver: true }),
        Animated.timing(bounceY, { toValue: 0, duration: 800, useNativeDriver: true }),
      ])).start();
      Animated.timing(wingLRot, { toValue: -8, duration: 400, useNativeDriver: true }).start();
      Animated.timing(wingRRot, { toValue: 75, duration: 400, useNativeDriver: true }).start();
      Animated.timing(headTilt, { toValue: 6, duration: 300, useNativeDriver: true }).start();
    }

    if (state === "celebrating") {
      Animated.loop(Animated.sequence([
        Animated.timing(bounceY, { toValue: -16, duration: 320, useNativeDriver: true }),
        Animated.timing(bodySquish, { toValue: 0.86, duration: 80, useNativeDriver: true }),
        Animated.timing(bounceY, { toValue: 0, duration: 260, useNativeDriver: true }),
        Animated.timing(bodySquish, { toValue: 1, duration: 100, useNativeDriver: true }),
      ])).start();
      Animated.loop(Animated.sequence([
        Animated.timing(wingLRot, { toValue: -110, duration: 280, useNativeDriver: true }),
        Animated.timing(wingLRot, { toValue: -70, duration: 280, useNativeDriver: true }),
      ])).start();
      Animated.loop(Animated.sequence([
        Animated.timing(wingRRot, { toValue: 110, duration: 280, useNativeDriver: true }),
        Animated.timing(wingRRot, { toValue: 70, duration: 280, useNativeDriver: true }),
      ])).start();
    }

    if (state === "surprised") {
      Animated.sequence([
        Animated.timing(bounceY, { toValue: -20, duration: 180, useNativeDriver: true }),
        Animated.timing(bounceY, { toValue: 0, duration: 280, useNativeDriver: true }),
        Animated.loop(Animated.sequence([
          Animated.timing(bounceY, { toValue: -6, duration: 900, useNativeDriver: true }),
          Animated.timing(bounceY, { toValue: 0, duration: 900, useNativeDriver: true }),
        ])),
      ]).start();
      Animated.timing(wingLRot, { toValue: -100, duration: 250, useNativeDriver: true }).start();
      Animated.timing(wingRRot, { toValue: 100, duration: 250, useNativeDriver: true }).start();
    }
  }, [state]);

  const S = size;

  // Sizes
  const HEAD_R = 26 * S;         // head radius
  const BODY_W = 38 * S;
  const BODY_H = 50 * S;
  const WING_W = 32 * S;
  const WING_H = 18 * S;
  const BEAK_SIZE = 9 * S;
  const EYE_R = 5 * S;
  const PUPIL_R = 3 * S;
  const CAP_W = 58 * S;
  const CAP_H = 12 * S;
  const CAP_TOP_W = 36 * S;
  const CAP_TOP_H = 16 * S;

  // Dove white colour
  const DOVE_WHITE = "#f0ede8";
  const DOVE_GREY = "#d6d0c8";

  const wingLInterp = wingLRot.interpolate({ inputRange: [-180, 180], outputRange: ["-180deg", "180deg"] });
  const wingRInterp = wingRRot.interpolate({ inputRange: [-180, 180], outputRange: ["-180deg", "180deg"] });
  const headInterp = headTilt.interpolate({ inputRange: [-30, 30], outputRange: ["-30deg", "30deg"] });

  return (
    <Animated.View style={[styles.root, { transform: [{ scale: entryScale }] }]}>
      <Animated.View
        style={{
          alignItems: "center",
          transform: [{ translateY: bounceY }, { scaleY: bodySquish }],
        }}
      >
        {/* ── GRADUATION CAP ── */}
        <View style={[styles.capGroup, { width: CAP_W }]}>
          {/* Top of cap */}
          <View
            style={{
              width: CAP_TOP_W,
              height: CAP_TOP_H,
              backgroundColor: "#1a1a2e",
              borderRadius: 4 * S,
              alignSelf: "center",
            }}
          />
          {/* Brim */}
          <View
            style={{
              width: CAP_W,
              height: CAP_H,
              backgroundColor: "#1a1a2e",
              borderRadius: 3 * S,
              marginTop: -2 * S,
            }}
          />
          {/* Tassel cord */}
          <View
            style={{
              position: "absolute",
              right: 6 * S,
              top: 0,
              width: 2 * S,
              height: CAP_TOP_H + 8 * S,
              backgroundColor: color,
            }}
          />
          {/* Tassel ball */}
          <View
            style={{
              position: "absolute",
              right: 3 * S,
              top: CAP_TOP_H + 6 * S,
              width: 8 * S,
              height: 8 * S,
              borderRadius: 4 * S,
              backgroundColor: color,
            }}
          />
        </View>

        {/* ── HEAD ── */}
        <Animated.View
          style={{
            width: HEAD_R * 2,
            height: HEAD_R * 2,
            borderRadius: HEAD_R,
            backgroundColor: DOVE_WHITE,
            marginTop: -3 * S,
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.2,
            shadowRadius: 5,
            transform: [{ rotate: headInterp }],
          }}
        >
          {/* ── Glasses frame ── */}
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: -2 * S, position: "absolute", top: HEAD_R * 0.28 }}>
            {/* Left lens */}
            <View style={{ width: 13 * S, height: 10 * S, borderRadius: 5 * S, borderWidth: 1.5 * S, borderColor: "#8a8a9a", backgroundColor: "rgba(150,180,255,0.08)" }}>
              <Animated.View style={{ width: PUPIL_R * 2, height: PUPIL_R * 2, borderRadius: PUPIL_R, backgroundColor: "#1a1a2e", position: "absolute", top: "50%", left: "50%", marginTop: -PUPIL_R, marginLeft: -PUPIL_R, transform: [{ scaleY: eyeScaleL }] }} />
            </View>
            {/* Bridge */}
            <View style={{ width: 5 * S, height: 1.5 * S, backgroundColor: "#8a8a9a" }} />
            {/* Right lens */}
            <View style={{ width: 13 * S, height: 10 * S, borderRadius: 5 * S, borderWidth: 1.5 * S, borderColor: "#8a8a9a", backgroundColor: "rgba(150,180,255,0.08)" }}>
              <Animated.View style={{ width: PUPIL_R * 2, height: PUPIL_R * 2, borderRadius: PUPIL_R, backgroundColor: "#1a1a2e", position: "absolute", top: "50%", left: "50%", marginTop: -PUPIL_R, marginLeft: -PUPIL_R, transform: [{ scaleY: eyeScaleR }] }} />
            </View>
          </View>

          {/* ── Beak (right side) ── */}
          <View
            style={{
              position: "absolute",
              right: -BEAK_SIZE * 0.7,
              top: HEAD_R - BEAK_SIZE * 0.5,
              width: 0,
              height: 0,
              borderTopWidth: BEAK_SIZE * 0.6,
              borderBottomWidth: BEAK_SIZE * 0.6,
              borderLeftWidth: BEAK_SIZE,
              borderTopColor: "transparent",
              borderBottomColor: "transparent",
              borderLeftColor: "#f6ad55",
            }}
          />

          {/* ── Forehead stripe (dove marking) ── */}
          <View style={{ position: "absolute", top: 5 * S, width: 18 * S, height: 3 * S, borderRadius: 2 * S, backgroundColor: DOVE_GREY }} />
        </Animated.View>

        {/* ── BODY + WINGS ── */}
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: -4 * S }}>
          {/* Left wing */}
          <Animated.View
            style={{
              width: WING_W,
              height: WING_H,
              backgroundColor: DOVE_WHITE,
              borderRadius: WING_H,
              borderBottomLeftRadius: WING_H * 2,
              borderTopLeftRadius: WING_H * 2,
              marginRight: -6 * S,
              shadowColor: "#000",
              shadowOffset: { width: -2, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 3,
              transform: [{ rotate: wingLInterp }],
              borderWidth: 1,
              borderColor: DOVE_GREY,
            }}
          />

          {/* Body */}
          <View
            style={{
              width: BODY_W,
              height: BODY_H,
              backgroundColor: DOVE_WHITE,
              borderRadius: BODY_W / 2,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 6,
              borderWidth: 1,
              borderColor: DOVE_GREY,
            }}
          >
            {/* Chest marking */}
            <View style={{ width: 16 * S, height: 20 * S, borderRadius: 10 * S, backgroundColor: DOVE_GREY + "88" }} />
          </View>

          {/* Right wing */}
          <Animated.View
            style={{
              width: WING_W,
              height: WING_H,
              backgroundColor: DOVE_WHITE,
              borderRadius: WING_H,
              borderBottomRightRadius: WING_H * 2,
              borderTopRightRadius: WING_H * 2,
              marginLeft: -6 * S,
              shadowColor: "#000",
              shadowOffset: { width: 2, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 3,
              transform: [{ rotate: wingRInterp }],
              borderWidth: 1,
              borderColor: DOVE_GREY,
            }}
          />
        </View>

        {/* ── TAIL ── */}
        <View
          style={{
            width: 22 * S,
            height: 14 * S,
            backgroundColor: DOVE_GREY,
            borderBottomLeftRadius: 10 * S,
            borderBottomRightRadius: 10 * S,
            marginTop: -3 * S,
          }}
        />

        {/* ── FEET (two small orange lines) ── */}
        <View style={{ flexDirection: "row", gap: 10 * S, marginTop: 2 * S }}>
          {[0, 1].map((i) => (
            <View key={i} style={{ alignItems: "center" }}>
              <View style={{ width: 2.5 * S, height: 10 * S, backgroundColor: "#f6ad55", borderRadius: 1.5 * S }} />
              <View style={{ flexDirection: "row", gap: 3 * S }}>
                {[0, 1, 2].map((j) => (
                  <View key={j} style={{ width: 2 * S, height: 5 * S, backgroundColor: "#f6ad55", borderRadius: 1 * S }} />
                ))}
              </View>
            </View>
          ))}
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: "center",
    justifyContent: "center",
  },
  capGroup: {
    alignItems: "center",
    position: "relative",
  },
});
