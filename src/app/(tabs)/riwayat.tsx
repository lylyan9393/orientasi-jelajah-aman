// src/app/(tabs)/riwayat.tsx
import { useState, useCallback } from "react";
import { View, Text, Button, Alert, Platform } from "react-native";
import { useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { ambilSemuaFavorit, hapusFavorit } from "../../services/favoritStorage";
import { KotaFavorit } from "../../../types/favorit";

export default function TabRiwayat() {
  const [daftarFavorit, setDaftarFavorit] = useState<KotaFavorit[]>([]);

  useFocusEffect(
    useCallback(() => {
      ambilSemuaFavorit().then(setDaftarFavorit);
    }, []),
  );

  function hapus(id: number, nama: string) {
    if (Platform.OS === "web") {
      const yakin = window.confirm(`Yakin hapus ${nama}?`);
  
      if (!yakin) return;
  
      hapusFavorit(id)
        .then(() => {
          setDaftarFavorit((prev) =>
            prev.filter((k) => k.id !== id),
          );
        })
        .catch((error) => {
          console.error("Gagal menghapus favorit:", error);
          window.alert("Gagal menghapus kota favorit.");
        });
  
      return;
    }
  
    Alert.alert("Konfirmasi", `Yakin hapus ${nama}?`, [
      {
        text: "Batal",
        style: "cancel",
      },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          try {
            await hapusFavorit(id);
            setDaftarFavorit((prev) =>
              prev.filter((k) => k.id !== id),
            );
          } catch (error) {
            console.error("Gagal menghapus favorit:", error);
            Alert.alert("Gagal", "Kota favorit tidak berhasil dihapus.");
          }
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: "bold" }}>Kota Favorit</Text>
      <Text>Tersimpan {daftarFavorit.length} kota</Text>

      {daftarFavorit.length === 0 && <Text>Belum ada kota favorit</Text>}

      {daftarFavorit.map((kota) => (
        <View
          key={kota.id}
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text>{kota.nama}</Text>
          <Button
            title="Hapus"
            onPress={() => {
              console.log("Tombol diklik:", kota.nama);
              hapus(kota.id, kota.nama);
            }}
          />
        </View>
      ))}
    </SafeAreaView>
  );
}
