//src/app/tambah-favorit.tsx
import { View, Text, Button } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { tambahFavorit } from "../services/favoritStorage";
import { useTema } from "../context/ThemeContext";

export default function ModalTambahFavorit() {
  const { id, nama, lat, lon } = useLocalSearchParams<{
    id: string;
    nama: string;
    lat: string;
    lon: string;
  }>();

  const { temaGelap } = useTema();

  const warna = {
    latar: temaGelap ? "#071426" : "#F5F7FB",
    kartu: temaGelap ? "#10243B" : "#FFFFFF",
    teks: temaGelap ? "#F1F5F9" : "#172033",
    sekunder: temaGelap ? "#B8C7DA" : "#667085",
    garis: temaGelap ? "#344B65" : "#D5DEE9",
    tombol: temaGelap ? "#7DAAFF" : "#123D8C",
  };

  async function simpan() {
    await tambahFavorit({
      id: Number(id),
      nama,
      latitude: Number(lat),
      longitude: Number(lon),
    });

    router.back();
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: warna.latar,
      }}
    >
      <View
        style={{
          margin: 16,
          padding: 20,
          gap: 20,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: warna.garis,
          backgroundColor: warna.kartu,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: "600",
            color: warna.teks,
          }}
        >
          Tambahkan {nama} ke daftar favorit?
        </Text>

        <Text
          style={{
            fontSize: 14,
            color: warna.sekunder,
          }}
        >
          Kota ini akan disimpan agar kamu bisa menemukannya kembali di halaman
          Favorit.
        </Text>

        <View style={{ borderRadius: 8, overflow: "hidden" }}>
          <Button title="SIMPAN" onPress={simpan} color={warna.tombol} />
        </View>
      </View>
    </SafeAreaView>
  );
}
