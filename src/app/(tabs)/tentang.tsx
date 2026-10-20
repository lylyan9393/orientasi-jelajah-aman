//src/app/(tabs)/tentang.tsx
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { typeScale, spacing } from "../../../constants/styles";
import { useTema } from "../../context/ThemeContext";

export default function TabTentang() {
  const { temaGelap } = useTema();

  const warna = {
    latar: temaGelap ? "#071426" : "#F5F7FB",
    kartu: temaGelap ? "#10243B" : "#FFFFFF",
    teks: temaGelap ? "#F1F5F9" : "#172033",
    sekunder: temaGelap ? "#B8C7DA" : "#667085",
    garis: temaGelap ? "#344B65" : "#D5DEE9",
    aksen: temaGelap ? "#7DAAFF" : "#123D8C",
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        padding: spacing.sedang,
        backgroundColor: warna.latar,
      }}
    >
      <View
        style={{
          padding: spacing.sedang,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: warna.garis,
          backgroundColor: warna.kartu,
        }}
      >
        <Text
          accessibilityLabel="Nama aplikasi Jelajah Aman"
          style={{
            fontSize: typeScale.judul,
            fontWeight: "bold",
            color: warna.teks,
          }}
        >
          Jelajah Aman
        </Text>

        <Text
          style={{
            fontSize: typeScale.isi,
            marginTop: spacing.kecil,
            color: warna.aksen,
          }}
        >
          Versi 1.0.0
        </Text>

        <View
          style={{
            height: 1,
            backgroundColor: warna.garis,
            marginVertical: spacing.sedang,
          }}
        />

        <Text
          style={{
            fontSize: typeScale.isi,
            color: warna.sekunder,
          }}
        >
          Dibuat oleh Lintang Tsaniatu Azzahro
        </Text>
      </View>
    </SafeAreaView>
  );
}