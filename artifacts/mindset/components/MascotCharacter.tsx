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

export default function MascotCharacter({ state = "idle", color, size = 1 }: Props) {
  const S = size;

  const entryScale  = useRef(new Animated.Value(0)).current;
  const bounceY     = useRef(new Animated.Value(0)).current;
  const headTilt    = useRef(new Animated.Value(0)).current;
  const wingLRot    = useRef(new Animated.Value(0)).current;
  const wingRRot    = useRef(new Animated.Value(0)).current;
  const bodySquish  = useRef(new Animated.Value(1)).current;
  const eyeScaleY   = useRef(new Animated.Value(1)).current;
  const beakOpen    = useRef(new Animated.Value(0)).current;
  const blushOpacity= useRef(new Animated.Value(0)).current;
  const eyeScale    = useRef(new Animated.Value(1)).current;

  // Pop-in
  useEffect(() => {
    Animated.spring(entryScale, { toValue: 1, friction: 4, tension: 100, useNativeDriver: true }).start();
  }, []);

  // Blink loop
  useEffect(() => {
    let mounted = true;
    const doBlink = () => {
      if (!mounted) return;
      Animated.sequence([
        Animated.timing(eyeScaleY, { toValue: 0.06, duration: 65, useNativeDriver: true }),
        Animated.timing(eyeScaleY, { toValue: 1,    duration: 80, useNativeDriver: true }),
      ]).start(() => {
        if (mounted) setTimeout(doBlink, 2200 + Math.random() * 2000);
      });
    };
    const id = setTimeout(doBlink, 1000 + Math.random() * 800);
    return () => { mounted = false; clearTimeout(id); };
  }, []);

  // State animations
  useEffect(() => {
    [bounceY, headTilt, wingLRot, wingRRot, bodySquish, beakOpen, blushOpacity, eyeScale]
      .forEach((v) => v.stopAnimation());

    if (state === "idle") {
      Animated.loop(Animated.sequence([
        Animated.timing(bounceY, { toValue: -8, duration: 1100, useNativeDriver: true }),
        Animated.timing(bounceY, { toValue: 0,  duration: 1100, useNativeDriver: true }),
      ])).start();
      Animated.timing(wingLRot,    { toValue: -12, duration: 400, useNativeDriver: true }).start();
      Animated.timing(wingRRot,    { toValue: 12,  duration: 400, useNativeDriver: true }).start();
      Animated.timing(headTilt,    { toValue: 0,   duration: 300, useNativeDriver: true }).start();
      Animated.timing(beakOpen,    { toValue: 0,   duration: 200, useNativeDriver: true }).start();
      Animated.timing(blushOpacity,{ toValue: 0,   duration: 300, useNativeDriver: true }).start();
    }

    if (state === "thinking") {
      Animated.loop(Animated.sequence([
        Animated.timing(bounceY, { toValue: -3, duration: 1500, useNativeDriver: true }),
        Animated.timing(bounceY, { toValue: 0,  duration: 1500, useNativeDriver: true }),
      ])).start();
      Animated.timing(headTilt,    { toValue: -14, duration: 400, useNativeDriver: true }).start();
      Animated.timing(wingLRot,    { toValue: -50, duration: 500, useNativeDriver: true }).start();
      Animated.timing(wingRRot,    { toValue: 8,   duration: 500, useNativeDriver: true }).start();
      Animated.timing(beakOpen,    { toValue: 0,   duration: 200, useNativeDriver: true }).start();
      Animated.timing(blushOpacity,{ toValue: 0.5, duration: 400, useNativeDriver: true }).start();
    }

    if (state === "explaining") {
      Animated.loop(Animated.sequence([
        Animated.timing(bounceY, { toValue: -5, duration: 900, useNativeDriver: true }),
        Animated.timing(bounceY, { toValue: 0,  duration: 900, useNativeDriver: true }),
      ])).start();
      Animated.timing(headTilt,    { toValue: 7,   duration: 300, useNativeDriver: true }).start();
      Animated.timing(wingLRot,    { toValue: -8,  duration: 400, useNativeDriver: true }).start();
      Animated.timing(wingRRot,    { toValue: 72,  duration: 400, useNativeDriver: true }).start();
      // Talking beak: open/close loop
      Animated.loop(Animated.sequence([
        Animated.timing(beakOpen, { toValue: 1,   duration: 170, useNativeDriver: true }),
        Animated.timing(beakOpen, { toValue: 0.2, duration: 130, useNativeDriver: true }),
        Animated.timing(beakOpen, { toValue: 1,   duration: 150, useNativeDriver: true }),
        Animated.timing(beakOpen, { toValue: 0,   duration: 200, useNativeDriver: true }),
        Animated.timing(beakOpen, { toValue: 0,   duration: 260, useNativeDriver: true }),
      ])).start();
      Animated.timing(blushOpacity,{ toValue: 0.6, duration: 400, useNativeDriver: true }).start();
    }

    if (state === "celebrating") {
      Animated.loop(Animated.sequence([
        Animated.timing(bounceY,    { toValue: -20, duration: 280, useNativeDriver: true }),
        Animated.timing(bodySquish, { toValue: 0.84,duration: 80,  useNativeDriver: true }),
        Animated.timing(bounceY,    { toValue: 0,   duration: 240, useNativeDriver: true }),
        Animated.timing(bodySquish, { toValue: 1,   duration: 90,  useNativeDriver: true }),
        Animated.timing(bounceY,    { toValue: 0,   duration: 80,  useNativeDriver: true }),
      ])).start();
      Animated.loop(Animated.sequence([
        Animated.timing(wingLRot, { toValue: -115, duration: 260, useNativeDriver: true }),
        Animated.timing(wingLRot, { toValue: -65,  duration: 260, useNativeDriver: true }),
      ])).start();
      Animated.loop(Animated.sequence([
        Animated.timing(wingRRot, { toValue: 115, duration: 260, useNativeDriver: true }),
        Animated.timing(wingRRot, { toValue: 65,  duration: 260, useNativeDriver: true }),
      ])).start();
      Animated.loop(Animated.sequence([
        Animated.timing(beakOpen, { toValue: 1, duration: 120, useNativeDriver: true }),
        Animated.timing(beakOpen, { toValue: 0, duration: 120, useNativeDriver: true }),
        Animated.timing(beakOpen, { toValue: 0, duration: 180, useNativeDriver: true }),
      ])).start();
      Animated.timing(blushOpacity,{ toValue: 0.9, duration: 300, useNativeDriver: true }).start();
      Animated.timing(eyeScale,    { toValue: 1.2, duration: 300, useNativeDriver: true }).start();
    }

    if (state === "surprised") {
      Animated.sequence([
        Animated.timing(bounceY, { toValue: -22, duration: 160, useNativeDriver: true }),
        Animated.timing(bounceY, { toValue: 0,   duration: 260, useNativeDriver: true }),
        Animated.loop(Animated.sequence([
          Animated.timing(bounceY, { toValue: -5, duration: 900, useNativeDriver: true }),
          Animated.timing(bounceY, { toValue: 0,  duration: 900, useNativeDriver: true }),
        ])),
      ]).start();
      Animated.timing(wingLRot,    { toValue: -105, duration: 220, useNativeDriver: true }).start();
      Animated.timing(wingRRot,    { toValue: 105,  duration: 220, useNativeDriver: true }).start();
      Animated.timing(beakOpen,    { toValue: 1,    duration: 180, useNativeDriver: true }).start();
      Animated.timing(blushOpacity,{ toValue: 0.7,  duration: 300, useNativeDriver: true }).start();
      Animated.timing(eyeScale,    { toValue: 1.3,  duration: 200, useNativeDriver: true }).start();
    }
  }, [state]);

  // ── Sizes ──
  const HEAD   = 58 * S;
  const BODY_W = 48 * S;
  const BODY_H = 54 * S;
  const WING_W = 36 * S;
  const WING_H = 22 * S;
  const EYE_R  = 12 * S;
  const IRIS_R = 8  * S;
  const PUPIL_R= 5  * S;
  const CAP_W  = 62 * S;
  const CAP_TOP= 40 * S;
  const CAP_H  = 11 * S;
  const CAP_TALL= 15 * S;

  const WHITE    = "#f5f2ee";
  const GREY     = "#d8d2c9";
  const OUTLINE  = "#c0b9ae";
  const BEAK_COL = "#ff8c2a";

  const headInterp  = headTilt.interpolate({ inputRange: [-30, 30], outputRange: ["-30deg", "30deg"] });
  const wingLInterp = wingLRot.interpolate({ inputRange: [-180, 180], outputRange: ["-180deg", "180deg"] });
  const wingRInterp = wingRRot.interpolate({ inputRange: [-180, 180], outputRange: ["-180deg", "180deg"] });
  // Lower jaw drops when beak opens
  const lowerBeakTransY = beakOpen.interpolate({ inputRange: [0, 1], outputRange: [0, BEAK_H(S) * 0.9] });

  return (
    <Animated.View style={[s.root, { transform: [{ scale: entryScale }] }]}>
      <Animated.View style={{ alignItems: "center", transform: [{ translateY: bounceY }, { scaleY: bodySquish }] }}>

        {/* CAP */}
        <View style={{ width: CAP_W, alignItems: "center", position: "relative", zIndex: 3 }}>
          <View style={{ width: CAP_TOP, height: CAP_TALL, backgroundColor: "#12122a", borderRadius: 5 * S }} />
          <View style={{ width: CAP_W, height: CAP_H, backgroundColor: "#12122a", borderRadius: 3 * S, marginTop: 0 }} />
          <View style={{ position: "absolute", right: 10 * S, top: 0, width: 2 * S, height: CAP_TALL + 10 * S, backgroundColor: color }} />
          <View style={{ position: "absolute", right: 6 * S, top: CAP_TALL + 8 * S, width: 9 * S, height: 9 * S, borderRadius: 5 * S, backgroundColor: color }} />
        </View>

        {/* HEAD */}
        <Animated.View style={{
          width: HEAD, height: HEAD, borderRadius: HEAD / 2,
          backgroundColor: WHITE,
          borderWidth: 2, borderColor: OUTLINE,
          marginTop: -4 * S,
          alignItems: "center",
          zIndex: 2,
          transform: [{ rotate: headInterp }],
        }}>

          {/* Feather tuft */}
          <View style={{ position: "absolute", top: -4 * S, width: 11 * S, height: 11 * S, borderRadius: 6 * S, backgroundColor: GREY, borderWidth: 1.5, borderColor: OUTLINE }} />

          {/* EYES */}
          <Animated.View style={{ flexDirection: "row", gap: 5 * S, position: "absolute", top: HEAD * 0.17, transform: [{ scale: eyeScale }, { scaleY: eyeScaleY }] }}>
            {[0, 1].map((i) => (
              <View key={i} style={{ width: EYE_R * 2, height: EYE_R * 2, borderRadius: EYE_R, backgroundColor: "#fff", borderWidth: 2.5, borderColor: "#222", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                {/* Iris */}
                <View style={{ width: IRIS_R * 2, height: IRIS_R * 2, borderRadius: IRIS_R, backgroundColor: "#2e6ecf", alignItems: "center", justifyContent: "center" }}>
                  {/* Pupil */}
                  <View style={{ width: PUPIL_R * 2, height: PUPIL_R * 2, borderRadius: PUPIL_R, backgroundColor: "#111" }} />
                </View>
                {/* Highlight */}
                <View style={{ position: "absolute", top: 3 * S, right: 3 * S, width: 4 * S, height: 4 * S, borderRadius: 2 * S, backgroundColor: "#fff" }} />
              </View>
            ))}
          </Animated.View>

          {/* CHEEK BLUSH */}
          <Animated.View style={{ position: "absolute", bottom: HEAD * 0.25, left: 5 * S, width: 13 * S, height: 7 * S, borderRadius: 6 * S, backgroundColor: "#ff99bb", opacity: blushOpacity }} />
          <Animated.View style={{ position: "absolute", bottom: HEAD * 0.25, right: 5 * S, width: 13 * S, height: 7 * S, borderRadius: 6 * S, backgroundColor: "#ff99bb", opacity: blushOpacity }} />

          {/* BEAK — upper jaw (fixed) */}
          <View style={{
            position: "absolute",
            bottom: HEAD * 0.16,
            left: HEAD / 2 - BEAK_W(S) / 2,
            width: BEAK_W(S),
            height: BEAK_H(S),
            backgroundColor: BEAK_COL,
            borderRadius: 4 * S,
            borderBottomLeftRadius: 2 * S,
            borderBottomRightRadius: 2 * S,
            borderWidth: 1.5,
            borderColor: "#cc6600",
            zIndex: 5,
          }} />

          {/* BEAK — lower jaw (animated) */}
          <Animated.View style={{
            position: "absolute",
            bottom: HEAD * 0.16,
            left: HEAD / 2 - (BEAK_W(S) * 0.75) / 2,
            width: BEAK_W(S) * 0.75,
            height: BEAK_H(S) * 0.65,
            backgroundColor: "#e87820",
            borderRadius: 2 * S,
            borderBottomLeftRadius: 4 * S,
            borderBottomRightRadius: 4 * S,
            borderWidth: 1.5,
            borderColor: "#cc6600",
            zIndex: 4,
            transform: [{ translateY: lowerBeakTransY }],
          }} />

          {/* Glasses */}
          <View style={{ flexDirection: "row", alignItems: "center", position: "absolute", top: HEAD * 0.44, gap: 0 }}>
            <View style={{ width: 14 * S, height: 11 * S, borderRadius: 6 * S, borderWidth: 1.5, borderColor: "#9999aa88" }} />
            <View style={{ width: 5 * S, height: 1.5 * S, backgroundColor: "#9999aa88" }} />
            <View style={{ width: 14 * S, height: 11 * S, borderRadius: 6 * S, borderWidth: 1.5, borderColor: "#9999aa88" }} />
          </View>

        </Animated.View>

        {/* BODY + WINGS */}
        <View style={{ flexDirection: "row", alignItems: "flex-start", marginTop: -6 * S, zIndex: 1 }}>

          {/* LEFT WING */}
          <Animated.View style={{
            width: WING_W, height: WING_H,
            backgroundColor: WHITE,
            borderWidth: 1.5, borderColor: OUTLINE,
            borderRadius: WING_H,
            borderBottomLeftRadius: WING_H * 2.5,
            borderTopLeftRadius: WING_H * 2.5,
            marginRight: -8 * S,
            marginTop: 8 * S,
            transform: [{ rotate: wingLInterp }],
          }}>
            {[0.3, 0.6, 0.8].map((t, i) => (
              <View key={i} style={{ position: "absolute", bottom: 2 * S, left: WING_W * t - 1, width: 1.5 * S, height: WING_H * 0.5, backgroundColor: GREY, borderRadius: 1 }} />
            ))}
          </Animated.View>

          {/* BODY */}
          <View style={{
            width: BODY_W, height: BODY_H,
            backgroundColor: WHITE,
            borderRadius: BODY_W * 0.52,
            borderTopLeftRadius: BODY_W * 0.55,
            borderTopRightRadius: BODY_W * 0.55,
            borderWidth: 2, borderColor: OUTLINE,
            alignItems: "center",
            justifyContent: "center",
          }}>
            <View style={{ width: BODY_W * 0.46, height: BODY_H * 0.4, borderRadius: BODY_W * 0.24, backgroundColor: GREY + "77" }} />
          </View>

          {/* RIGHT WING */}
          <Animated.View style={{
            width: WING_W, height: WING_H,
            backgroundColor: WHITE,
            borderWidth: 1.5, borderColor: OUTLINE,
            borderRadius: WING_H,
            borderBottomRightRadius: WING_H * 2.5,
            borderTopRightRadius: WING_H * 2.5,
            marginLeft: -8 * S,
            marginTop: 8 * S,
            transform: [{ rotate: wingRInterp }],
          }}>
            {[0.2, 0.45, 0.7].map((t, i) => (
              <View key={i} style={{ position: "absolute", bottom: 2 * S, right: WING_W * (1 - t) - 1, width: 1.5 * S, height: WING_H * 0.5, backgroundColor: GREY, borderRadius: 1 }} />
            ))}
          </Animated.View>
        </View>

        {/* TAIL */}
        <View style={{ width: 24 * S, height: 14 * S, backgroundColor: GREY, borderBottomLeftRadius: 12 * S, borderBottomRightRadius: 12 * S, marginTop: -4 * S, borderWidth: 1.5, borderColor: OUTLINE }} />

        {/* FEET */}
        <View style={{ flexDirection: "row", gap: 12 * S, marginTop: 2 * S }}>
          {[0, 1].map((i) => (
            <View key={i} style={{ alignItems: "center" }}>
              <View style={{ width: 3 * S, height: 10 * S, backgroundColor: "#f6ad55", borderRadius: 2 * S }} />
              <View style={{ flexDirection: "row", gap: 2 * S }}>
                {[-1, 0, 1].map((j) => (
                  <View key={j} style={{ width: 2 * S, height: 6 * S, backgroundColor: "#f6ad55", borderRadius: 2 * S }} />
                ))}
              </View>
            </View>
          ))}
        </View>

      </Animated.View>
    </Animated.View>
  );
}

// Helpers to avoid calling size in inline JSX (keeps TS happy)
function BEAK_W(S: number) { return 18 * S; }
function BEAK_H(S: number) { return 9  * S; }

const s = StyleSheet.create({
  root: { alignItems: "center", justifyContent: "center" },
});
