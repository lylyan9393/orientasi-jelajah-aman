// src/components/WeatherCard.tsx
import { View, Text } from "react-native";
import { WeatherCardProps, TingkatAQI } from "../../types/cuaca";
import { typeScale, spacing } from "../../constants/styles";
import { useTema } from "../context/ThemeContext";

const warnaPerTingkat: Record<TingkatAQI, string> = {
  BAIK: "#16A34A",
  SEDANG: "#CA8A04",
  TIDAK_SEHAT: "#EA580C",
  BERBAHAYA: "#F43F5E",
};

export default function WeatherCard({
  kota,
  suhu,
  tingkatAQI,
  indeksAQI,
}: WeatherCardProps) {
  const { temaGelap } = useTema();

  const warna = {
    latar: temaGelap ? "#10243B" : "#FFFFFF",
    teks: temaGelap ? "#F1F5F9" : "#172033",
    garis: temaGelap ? "#344B65" : "#D5DEE9",
    bayangan: temaGelap ? "#000000" : "#64748B",
  };

  const teksAQI =
    indeksAQI !== undefined
      ? `AQI: ${indeksAQI} (${tingkatAQI})`
      : `AQI: ${tingkatAQI}`;

  const labelAksesibilitas =
    indeksAQI !== undefined
      ? `Cuaca ${kota}, suhu ${suhu} derajat, indeks kualitas udara ${indeksAQI}, kategori ${tingkatAQI}`
      : `Cuaca ${kota}, suhu ${suhu} derajat, kualitas udara ${tingkatAQI}`;

  return (
    <View
      accessible
      accessibilityLabel={labelAksesibilitas}
      style={{
        padding: spacing.sedang,
        borderRadius: 12,
        backgroundColor: warna.latar,
        borderWidth: 1,
        borderColor: warna.garis,
        gap: 6,
        ...(temaGelap
          ? {}
          : {
              shadowColor: warna.bayangan,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 5,
              elevation: 2,
            }),
      }}
    >
      <Text
        style={{
          fontWeight: "bold",
          fontSize: typeScale.judul,
          color: warna.teks,
        }}
      >
        {kota}
      </Text>

      <Text
        style={{
          fontSize: 32,
          color: warna.teks,
        }}
      >
        {suhu}°C
      </Text>

      <Text
        style={{
          color: warnaPerTingkat[tingkatAQI],
          fontSize: typeScale.isi,
          fontWeight: "500",
        }}
      >
        {teksAQI}
      </Text>
    </View>
  );
}
