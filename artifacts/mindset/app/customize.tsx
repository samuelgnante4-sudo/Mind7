import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import MascotCharacter, { MascotState } from "@/components/MascotCharacter";
import { THEME_COLORS, useTheme } from "@/context/ThemeContext";
import { useColors } from "@/hooks/useColors";

export default function CustomizeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { primaryColor, setPrimaryColor } = useTheme();
  const [preview, setPreview] = useState(primaryColor);
  const [mascotState, setMascotState] = useState<MascotState>("idle");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handleSelect = async (color: string) => {
    setPreview(color);
    setMascotState("celebrating");
    await setPrimaryColor(color);
    setTimeout(() => setMascotState("idle"), 1500);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: topPad + 12 }]}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
        >
          <Ionicons name="chevron-back" size={22} color={colors.mutedForeground} />
        </Pressable>
        <Text style={[styles.topTitle, { color: colors.foreground }]}>
          Personnalisation
        </Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: botPad + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Character preview */}
        <View style={[styles.previewBox, { backgroundColor: colors.card, borderColor: preview + "44" }]}>
          <MascotCharacter state={mascotState} color={preview} size={1.2} />
          <View style={styles.previewText}>
            <Text style={[styles.previewTitle, { color: colors.foreground }]}>
              Ton personnage
            </Text>
            <Text style={[styles.previewSub, { color: colors.mutedForeground }]}>
              Il apparaîtra dans chaque explication psychologique
            </Text>
          </View>
        </View>

        {/* Color grid */}
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
          CHOISIS TA COULEUR
        </Text>

        <View style={styles.colorGrid}>
          {THEME_COLORS.map((c) => {
            const isSelected = preview === c.value;
            return (
              <Pressable
                key={c.value}
                onPress={() => handleSelect(c.value)}
                style={({ pressed }) => [
                  styles.colorCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: isSelected ? c.value : colors.border,
                    borderWidth: isSelected ? 2 : 1,
                    opacity: pressed ? 0.8 : 1,
                    transform: [{ scale: isSelected ? 1.04 : 1 }],
                  },
                ]}
              >
                <View style={[styles.colorDot, { backgroundColor: c.value }]}>
                  {isSelected && (
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  )}
                </View>
                <Text style={[styles.colorName, { color: isSelected ? c.value : colors.mutedForeground }]}>
                  {c.name}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Confirm */}
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.confirmBtn,
            { backgroundColor: preview, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Text style={styles.confirmText}>Appliquer →</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  topTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold" },
  content: { paddingHorizontal: 20, gap: 20, paddingTop: 16 },

  previewBox: {
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  previewText: { flex: 1, gap: 6 },
  previewTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  previewSub: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20 },

  sectionTitle: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    letterSpacing: 2,
    marginTop: 4,
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  colorCard: {
    width: "47%",
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  colorDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  colorName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },

  confirmBtn: {
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    marginTop: 8,
  },
  confirmText: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },
});
