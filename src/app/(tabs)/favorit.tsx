import { useState, useCallback } from "react";
import { View, Text, Button, Alert, Platform, ScrollView } from "react-native";
import { useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTema } from "../../context/ThemeContext";
import { ambilSemuaFavorit, hapusFavorit } from "../../services/favoritStorage";
import { KotaFavorit } from "../../../types/favorit";

export default function TabFavorit() {
  const [daftarFavorit, setDaftarFavorit] = useState<KotaFavorit[]>([]);
  const { temaGelap } = useTema();

  const warna = {
    latar: temaGelap ? "#071426" : "#F5F7FB",
    kartu: temaGelap ? "#10243B" : "#FFFFFF",
    teks: temaGelap ? "#F1F5F9" : "#172033",
    sekunder: temaGelap ? "#B8C7DA" : "#667085",
    garis: temaGelap ? "#344B65" : "#D5DEE9",
    tombol: temaGelap ? "#7DAAFF" : "#123D8C",
  };

  const muatFavorit = useCallback(() => {
    ambilSemuaFavorit()
      .then(setDaftarFavorit)
      .catch((error) => {
        console.error("Gagal mengambil kota favorit:", error);
      });
  }, []);

  useFocusEffect(muatFavorit);

  function hapus(id: number, nama: string) {
    if (Platform.OS === "web") {
      const yakin = window.confirm(`Yakin hapus ${nama} dari favorit?`);

      if (!yakin) return;

      hapusFavorit(id)
        .then(() => {
          setDaftarFavorit((prev) => prev.filter((k) => k.id !== id));
        })
        .catch((error) => {
          console.error("Gagal menghapus favorit:", error);
          window.alert("Gagal menghapus kota favorit.");
        });

      return;
    }

    Alert.alert("Konfirmasi", `Yakin hapus ${nama} dari favorit?`, [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          try {
            await hapusFavorit(id);
            setDaftarFavorit((prev) => prev.filter((k) => k.id !== id));
          } catch (error) {
            console.error("Gagal menghapus favorit:", error);
            Alert.alert("Gagal", "Kota favorit tidak berhasil dihapus.");
          }
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: warna.latar }}>
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 24, gap: 12 }}
      >
        <Text
          style={{
            fontSize: 22,
            fontWeight: "bold",
            color: warna.teks,
          }}
        >
          Kota Favorit
        </Text>

        <Text style={{ color: warna.sekunder }}>
          Tersimpan {daftarFavorit.length} kota
        </Text>

        {daftarFavorit.length === 0 && (
          <View
            style={{
              padding: 16,
              backgroundColor: warna.kartu,
              borderWidth: 1,
              borderColor: warna.garis,
              borderRadius: 12,
            }}
          >
            <Text style={{ color: warna.teks }}>Belum ada kota favorit.</Text>
          </View>
        )}

        {daftarFavorit.map((kota) => (
          <View
            key={kota.id}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              padding: 14,
              backgroundColor: warna.kartu,
              borderWidth: 1,
              borderColor: warna.garis,
              borderRadius: 12,
            }}
          >
            <Text
              style={{
                flex: 1,
                fontSize: 16,
                fontWeight: "600",
                color: warna.teks,
              }}
            >
              {kota.nama}
            </Text>

            <View style={{ minWidth: 90 }}>
              <Button
                title="Hapus"
                color={warna.tombol}
                onPress={() => hapus(kota.id, kota.nama)}
              />
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
