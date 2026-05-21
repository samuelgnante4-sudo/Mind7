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
  const bounceY = useRef(new Animated.Value(0)).current;
  const bodySquish = useRef(new Animated.Value(1)).current;
  const leftArmRot = useRef(new Animated.Value(0)).current;
  const rightArmRot = useRef(new Animated.Value(0)).current;
  const eyeScaleL = useRef(new Animated.Value(1)).current;
  const eyeScaleR = useRef(new Animated.Value(1)).current;
  const headTilt = useRef(new Animated.Value(0)).current;
  const characterScale = useRef(new Animated.Value(0)).current;

  // Entry animation
  useEffect(() => {
    Animated.spring(characterScale, {
      toValue: 1,
      friction: 5,
      tension: 80,
      useNativeDriver: true,
    }).start();
  }, []);

  // Blink loop
  useEffect(() => {
    const blink = () => {
      Animated.sequence([
        Animated.timing(eyeScaleL, { toValue: 0.1, duration: 80, useNativeDriver: true }),
        Animated.timing(eyeScaleL, { toValue: 1, duration: 80, useNativeDriver: true }),
      ]).start();
      Animated.sequence([
        Animated.timing(eyeScaleR, { toValue: 0.1, duration: 80, useNativeDriver: true }),
        Animated.timing(eyeScaleR, { toValue: 1, duration: 80, useNativeDriver: true }),
      ]).start();
    };
    const blinkInterval = setInterval(blink, 3000 + Math.random() * 2000);
    return () => clearInterval(blinkInterval);
  }, []);

  // State-based animations
  useEffect(() => {
    bounceY.stopAnimation();
    bodySquish.stopAnimation();
    leftArmRot.stopAnimation();
    rightArmRot.stopAnimation();
    headTilt.stopAnimation();

    if (state === "idle") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceY, { toValue: -6, duration: 900, useNativeDriver: true }),
          Animated.timing(bounceY, { toValue: 0, duration: 900, useNativeDriver: true }),
        ])
      ).start();
      Animated.timing(leftArmRot, { toValue: -20, duration: 400, useNativeDriver: true }).start();
      Animated.timing(rightArmRot, { toValue: 20, duration: 400, useNativeDriver: true }).start();
      Animated.timing(headTilt, { toValue: 0, duration: 300, useNativeDriver: true }).start();
    }

    if (state === "thinking") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceY, { toValue: -3, duration: 1200, useNativeDriver: true }),
          Animated.timing(bounceY, { toValue: 0, duration: 1200, useNativeDriver: true }),
        ])
      ).start();
      Animated.timing(leftArmRot, { toValue: -60, duration: 500, useNativeDriver: true }).start();
      Animated.timing(rightArmRot, { toValue: 10, duration: 500, useNativeDriver: true }).start();
      Animated.timing(headTilt, { toValue: -10, duration: 400, useNativeDriver: true }).start();
    }

    if (state === "celebrating") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceY, { toValue: -14, duration: 350, useNativeDriver: true }),
          Animated.timing(bodySquish, { toValue: 0.88, duration: 100, useNativeDriver: true }),
          Animated.timing(bounceY, { toValue: 0, duration: 250, useNativeDriver: true }),
          Animated.timing(bodySquish, { toValue: 1, duration: 100, useNativeDriver: true }),
        ])
      ).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(leftArmRot, { toValue: -120, duration: 300, useNativeDriver: true }),
          Animated.timing(leftArmRot, { toValue: -80, duration: 300, useNativeDriver: true }),
        ])
      ).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(rightArmRot, { toValue: 120, duration: 300, useNativeDriver: true }),
          Animated.timing(rightArmRot, { toValue: 80, duration: 300, useNativeDriver: true }),
        ])
      ).start();
      Animated.timing(headTilt, { toValue: 0, duration: 200, useNativeDriver: true }).start();
    }

    if (state === "explaining") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceY, { toValue: -5, duration: 700, useNativeDriver: true }),
          Animated.timing(bounceY, { toValue: 0, duration: 700, useNativeDriver: true }),
        ])
      ).start();
      Animated.timing(leftArmRot, { toValue: -10, duration: 400, useNativeDriver: true }).start();
      Animated.timing(rightArmRot, { toValue: 80, duration: 400, useNativeDriver: true }).start();
      Animated.timing(headTilt, { toValue: 5, duration: 300, useNativeDriver: true }).start();
    }

    if (state === "surprised") {
      Animated.sequence([
        Animated.timing(bounceY, { toValue: -18, duration: 200, useNativeDriver: true }),
        Animated.timing(bounceY, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(bounceY, { toValue: -6, duration: 800, useNativeDriver: true }),
            Animated.timing(bounceY, { toValue: 0, duration: 800, useNativeDriver: true }),
          ])
        ),
      ]).start();
      Animated.timing(leftArmRot, { toValue: -110, duration: 300, useNativeDriver: true }).start();
      Animated.timing(rightArmRot, { toValue: 110, duration: 300, useNativeDriver: true }).start();
      Animated.timing(headTilt, { toValue: 0, duration: 200, useNativeDriver: true }).start();
    }
  }, [state]);

  const S = size;
  const HEAD = 56 * S;
  const BODY_W = 40 * S;
  const BODY_H = 44 * S;
  const ARM_W = 8 * S;
  const ARM_H = 28 * S;
  const EYE = 9 * S;
  const PUPIL = 5 * S;

  // Mouth shape based on state
  const mouthHappy = { width: 22 * S, height: 11 * S, borderBottomLeftRadius: 11 * S, borderBottomRightRadius: 11 * S };
  const mouthSurprised = { width: 14 * S, height: 14 * S, borderRadius: 7 * S };
  const mouthThinking = { width: 16 * S, height: 5 * S, borderRadius: 3 * S };

  const mouthStyle =
    state === "surprised"
      ? mouthSurprised
      : state === "thinking"
      ? mouthThinking
      : mouthHappy;

  const eyeExpression =
    state === "celebrating" || state === "explaining"
      ? { borderRadius: PUPIL / 2, width: PUPIL, height: PUPIL * 0.6 }
      : { borderRadius: PUPIL / 2, width: PUPIL, height: PUPIL };

  return (
    <Animated.View
      style={[
        styles.root,
        {
          transform: [{ scale: characterScale }],
          width: 90 * S,
          height: 130 * S,
        },
      ]}
    >
      {/* Left arm */}
      <Animated.View
        style={[
          styles.arm,
          {
            width: ARM_W,
            height: ARM_H,
            borderRadius: ARM_W / 2,
            backgroundColor: color,
            left: 6 * S,
            top: HEAD * 0.55,
            transformOrigin: "top",
            transform: [
              { rotate: leftArmRot.interpolate({ inputRange: [-180, 180], outputRange: ["-180deg", "180deg"] }) },
            ],
          },
        ]}
      />

      {/* Right arm */}
      <Animated.View
        style={[
          styles.arm,
          {
            width: ARM_W,
            height: ARM_H,
            borderRadius: ARM_W / 2,
            backgroundColor: color,
            right: 6 * S,
            top: HEAD * 0.55,
            transformOrigin: "top",
            transform: [
              { rotate: rightArmRot.interpolate({ inputRange: [-180, 180], outputRange: ["-180deg", "180deg"] }) },
            ],
          },
        ]}
      />

      {/* Character group (head + body) */}
      <Animated.View
        style={[
          styles.characterGroup,
          {
            transform: [
              { translateY: bounceY },
              { scaleY: bodySquish },
              {
                rotate: headTilt.interpolate({
                  inputRange: [-30, 30],
                  outputRange: ["-30deg", "30deg"],
                }),
              },
            ],
          },
        ]}
      >
        {/* Head */}
        <View
          style={[
            styles.head,
            {
              width: HEAD,
              height: HEAD,
              borderRadius: HEAD / 2,
              backgroundColor: color,
            },
          ]}
        >
          {/* Eyes */}
          <View style={[styles.eyesRow, { gap: 12 * S }]}>
            <Animated.View style={[styles.eyeOuter, { width: EYE, height: EYE, borderRadius: EYE / 2 }]}>
              <Animated.View
                style={[
                  styles.pupil,
                  eyeExpression,
                  {
                    backgroundColor: "#1a1a2e",
                    transform: [{ scaleY: eyeScaleL }],
                  },
                ]}
              />
            </Animated.View>
            <Animated.View style={[styles.eyeOuter, { width: EYE, height: EYE, borderRadius: EYE / 2 }]}>
              <Animated.View
                style={[
                  styles.pupil,
                  eyeExpression,
                  {
                    backgroundColor: "#1a1a2e",
                    transform: [{ scaleY: eyeScaleR }],
                  },
                ]}
              />
            </Animated.View>
          </View>

          {/* Mouth */}
          <View
            style={[
              styles.mouth,
              mouthStyle,
              {
                borderColor: "rgba(0,0,0,0.3)",
                borderWidth: 2 * S,
                backgroundColor: "transparent",
                borderTopWidth: 0,
              },
            ]}
          />
        </View>

        {/* Body */}
        <View
          style={[
            styles.body,
            {
              width: BODY_W,
              height: BODY_H,
              borderRadius: BODY_W / 2,
              backgroundColor: color,
              opacity: 0.75,
            },
          ]}
        />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  arm: {
    position: "absolute",
  },
  characterGroup: {
    alignItems: "center",
    gap: 0,
  },
  head: {
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    gap: 0,
  },
  eyesRow: {
    flexDirection: "row",
    marginBottom: 5,
  },
  eyeOuter: {
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  pupil: {},
  mouth: {
    marginTop: 2,
  },
  body: {
    marginTop: -4,
  },
});
