import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

import { AnimType } from "@/data/animations";

const H = 120;

interface Props {
  type: AnimType;
  color: string;
}

// ── Balance ───────────────────────────────────────────────────────────────────
function BalanceAnim({ color }: { color: string }) {
  const tilt = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(tilt, { toValue: 14,  duration: 1300, useNativeDriver: true }),
        Animated.delay(180),
        Animated.timing(tilt, { toValue: -14, duration: 1300, useNativeDriver: true }),
        Animated.delay(180),
      ])
    ).start();
    return () => tilt.stopAnimation();
  }, []);

  const rot = tilt.interpolate({ inputRange: [-14, 14], outputRange: ["-14deg", "14deg"] });

  return (
    <View style={[s.wrap, { height: H }]}>
      {/* Stand */}
      <View style={[s.balancePost, { backgroundColor: color + "55" }]} />
      <Animated.View style={{ transform: [{ rotate: rot }], alignItems: "center", marginTop: -8 }}>
        <View style={[s.balanceBar, { backgroundColor: color }]} />
        <View style={{ flexDirection: "row", width: 120, justifyContent: "space-between" }}>
          <View style={{ alignItems: "center" }}>
            <View style={[s.balanceChain, { backgroundColor: color + "55" }]} />
            <View style={[s.balancePan, { borderColor: color, backgroundColor: color + "18" }]}>
              <Text style={{ color, fontSize: 12, fontWeight: "700" }}>1</Text>
            </View>
          </View>
          <View style={{ alignItems: "center" }}>
            <View style={[s.balanceChain, { backgroundColor: color + "55" }]} />
            <View style={[s.balancePan, { borderColor: color, backgroundColor: color }]}>
              <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}>5</Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

// ── Ripple ────────────────────────────────────────────────────────────────────
function RippleAnim({ color }: { color: string }) {
  const r0 = useRef(new Animated.Value(0)).current;
  const r1 = useRef(new Animated.Value(0)).current;
  const r2 = useRef(new Animated.Value(0)).current;

  const animate = (val: Animated.Value, delay: number) =>
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(val, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(val, { toValue: 0, duration: 0,    useNativeDriver: true }),
      ])
    );

  useEffect(() => {
    animate(r0, 0).start();
    animate(r1, 500).start();
    animate(r2, 1000).start();
    return () => { r0.stopAnimation(); r1.stopAnimation(); r2.stopAnimation(); };
  }, []);

  const ring = (val: Animated.Value) => ({
    scale:   val.interpolate({ inputRange: [0, 1], outputRange: [0.1, 1] }),
    opacity: val.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, 0.6, 0] }),
  });

  const r = [r0, r1, r2].map(ring);

  return (
    <View style={[s.wrap, { height: H }]}>
      {r.map((ring, i) => (
        <Animated.View
          key={i}
          style={[s.rippleRing, { borderColor: color, transform: [{ scale: ring.scale }], opacity: ring.opacity }]}
        />
      ))}
      <View style={[s.rippleCenter, { backgroundColor: color }]} />
      {/* 4 small satellites */}
      {[0, 90, 180, 270].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <View
            key={i}
            style={[
              s.rippleSat,
              {
                backgroundColor: color + "66",
                transform: [{ translateX: Math.cos(rad) * 28 }, { translateY: Math.sin(rad) * 28 }],
              },
            ]}
          />
        );
      })}
    </View>
  );
}

// ── Brain ─────────────────────────────────────────────────────────────────────
const ANGLES = [0, 51, 103, 154, 206, 257, 309];
const RADIUS = 36;

function BrainAnim({ color }: { color: string }) {
  const p0 = useRef(new Animated.Value(0)).current;
  const p1 = useRef(new Animated.Value(0)).current;
  const p2 = useRef(new Animated.Value(0)).current;
  const p3 = useRef(new Animated.Value(0)).current;
  const p4 = useRef(new Animated.Value(0)).current;
  const p5 = useRef(new Animated.Value(0)).current;
  const p6 = useRef(new Animated.Value(0)).current;
  const coreScale = useRef(new Animated.Value(1)).current;
  const pulses = [p0, p1, p2, p3, p4, p5, p6];

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(coreScale, { toValue: 1.2, duration: 700, useNativeDriver: true }),
        Animated.timing(coreScale, { toValue: 1,   duration: 700, useNativeDriver: true }),
      ])
    ).start();

    pulses.forEach((p, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 160),
          Animated.timing(p, { toValue: 1, duration: 450, useNativeDriver: true }),
          Animated.timing(p, { toValue: 0.2, duration: 350, useNativeDriver: true }),
          Animated.delay(ANGLES.length * 160),
        ])
      ).start();
    });

    return () => {
      coreScale.stopAnimation();
      pulses.forEach((p) => p.stopAnimation());
    };
  }, []);

  return (
    <View style={[s.wrap, { height: H }]}>
      {ANGLES.map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const x = Math.cos(rad) * RADIUS;
        const y = Math.sin(rad) * RADIUS;
        return (
          <Animated.View
            key={i}
            style={[
              s.neuron,
              {
                backgroundColor: color,
                transform: [{ translateX: x }, { translateY: y }, { scale: pulses[i].interpolate({ inputRange: [0.2, 1], outputRange: [0.7, 1.3] }) }],
                opacity: pulses[i],
              },
            ]}
          />
        );
      })}
      <Animated.View style={[s.brainCore, { borderColor: color, transform: [{ scale: coreScale }] }]}>
        <View style={[s.brainInner, { backgroundColor: color }]} />
      </Animated.View>
    </View>
  );
}

// ── Paths ─────────────────────────────────────────────────────────────────────
function PathsAnim({ color }: { color: string }) {
  const dotY = useRef(new Animated.Value(0)).current;
  const dotX = useRef(new Animated.Value(0)).current;
  const phase = useRef(0);

  useEffect(() => {
    const run = () => {
      const goRight = phase.current % 2 === 0;
      phase.current += 1;
      Animated.sequence([
        // reset
        Animated.parallel([
          Animated.timing(dotY, { toValue: 0,  duration: 0, useNativeDriver: true }),
          Animated.timing(dotX, { toValue: 0,  duration: 0, useNativeDriver: true }),
        ]),
        // rise up stem
        Animated.timing(dotY, { toValue: -34, duration: 600, useNativeDriver: true }),
        // fork
        Animated.parallel([
          Animated.timing(dotY, { toValue: -62, duration: 600, useNativeDriver: true }),
          Animated.timing(dotX, { toValue: goRight ? 28 : -28, duration: 600, useNativeDriver: true }),
        ]),
        Animated.delay(400),
      ]).start(run);
    };
    run();
    return () => { dotY.stopAnimation(); dotX.stopAnimation(); };
  }, []);

  return (
    <View style={[s.wrap, { height: H }]}>
      {/* Stem */}
      <View style={[s.pathStem, { backgroundColor: color + "44" }]} />
      {/* Left branch */}
      <View style={[s.pathLeft, { backgroundColor: color + "44" }]} />
      {/* Right branch */}
      <View style={[s.pathRight, { backgroundColor: color + "44" }]} />
      {/* Moving dot */}
      <Animated.View
        style={[
          s.pathDot,
          { backgroundColor: color, transform: [{ translateX: dotX }, { translateY: dotY }] },
        ]}
      />
    </View>
  );
}

// ── Cosmos ────────────────────────────────────────────────────────────────────
const STARS = [
  { x: -50, y: -28 }, { x: -28, y: 14 }, { x: 2, y: -38 }, { x: 30, y: -16 },
  { x: 50, y: 12 },  { x: -14, y: 34 }, { x: 42, y: 36 }, { x: -42, y: -8 },
];

function CosmosAnim({ color }: { color: string }) {
  const s0 = useRef(new Animated.Value(1)).current;
  const s1 = useRef(new Animated.Value(0.5)).current;
  const s2 = useRef(new Animated.Value(0.8)).current;
  const s3 = useRef(new Animated.Value(0.3)).current;
  const s4 = useRef(new Animated.Value(0.9)).current;
  const s5 = useRef(new Animated.Value(0.4)).current;
  const s6 = useRef(new Animated.Value(0.7)).current;
  const s7 = useRef(new Animated.Value(0.6)).current;
  const stars = [s0, s1, s2, s3, s4, s5, s6, s7];
  const orbit = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(orbit, { toValue: 1, duration: 5000, useNativeDriver: true })
    ).start();

    stars.forEach((st, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 270),
          Animated.timing(st, { toValue: 1,   duration: 700, useNativeDriver: true }),
          Animated.timing(st, { toValue: 0.2, duration: 700, useNativeDriver: true }),
        ])
      ).start();
    });

    return () => {
      orbit.stopAnimation();
      stars.forEach((st) => st.stopAnimation());
    };
  }, []);

  const orbitDeg = orbit.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  return (
    <View style={[s.wrap, { height: H }]}>
      {STARS.map(({ x, y }, i) => {
        const sz = [5, 3, 4, 3, 5, 3, 4, 3][i];
        return (
          <Animated.View
            key={i}
            style={{
              position: "absolute",
              width: sz, height: sz, borderRadius: sz / 2,
              backgroundColor: color,
              transform: [{ translateX: x }, { translateY: y }],
              opacity: stars[i],
            }}
          />
        );
      })}
      {/* Orbit ring */}
      <Animated.View style={[s.orbitRing, { borderColor: color + "33", transform: [{ rotate: orbitDeg }] }]}>
        <View style={[s.orbitDot, { backgroundColor: color }]} />
      </Animated.View>
      {/* Center */}
      <View style={[s.cosmosCore, { backgroundColor: color }]} />
    </View>
  );
}

// ── Export ────────────────────────────────────────────────────────────────────
export default function ConceptAnimation({ type, color }: Props) {
  switch (type) {
    case "balance": return <BalanceAnim color={color} />;
    case "ripple":  return <RippleAnim  color={color} />;
    case "brain":   return <BrainAnim   color={color} />;
    case "paths":   return <PathsAnim   color={color} />;
    case "cosmos":  return <CosmosAnim  color={color} />;
  }
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center" },

  // Balance
  balancePost:  { width: 3, height: 26, borderRadius: 2 },
  balanceBar:   { width: 124, height: 3, borderRadius: 2 },
  balanceChain: { width: 2, height: 22 },
  balancePan:   { width: 36, height: 36, borderRadius: 18, borderWidth: 2, alignItems: "center", justifyContent: "center" },

  // Ripple
  rippleRing:   { position: "absolute", width: 94, height: 94, borderRadius: 47, borderWidth: 2 },
  rippleCenter: { width: 14, height: 14, borderRadius: 7 },
  rippleSat:    { position: "absolute", width: 6, height: 6, borderRadius: 3 },

  // Brain
  neuron:    { position: "absolute", width: 8, height: 8, borderRadius: 4 },
  brainCore: { position: "absolute", width: 28, height: 28, borderRadius: 14, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  brainInner:{ width: 12, height: 12, borderRadius: 6 },

  // Paths
  pathStem:  { position: "absolute", width: 2.5, height: 36, borderRadius: 2, top: "50%", left: "50%" },
  pathLeft:  { position: "absolute", width: 2, height: 32, borderRadius: 2, top: "20%", left: "50%", transform: [{ rotate: "-40deg" }, { translateX: -18 }, { translateY: -4 }] },
  pathRight: { position: "absolute", width: 2, height: 32, borderRadius: 2, top: "20%", left: "50%", transform: [{ rotate: "40deg" },  { translateX: 18 },  { translateY: -4 }] },
  pathDot:   { position: "absolute", width: 13, height: 13, borderRadius: 6.5, top: "62%" },

  // Cosmos
  orbitRing: { position: "absolute", width: 70, height: 70, borderRadius: 35, borderWidth: 1.5, alignItems: "center", justifyContent: "flex-start" },
  orbitDot:  { width: 9, height: 9, borderRadius: 4.5, marginTop: -4.5 },
  cosmosCore:{ position: "absolute", width: 16, height: 16, borderRadius: 8 },
});
