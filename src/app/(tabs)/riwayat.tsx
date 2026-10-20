import { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTema } from "../../context/ThemeContext";
import {
  ambilRiwayatPencarian,
  hapusRiwayatPencarian,
} from "../../services/riwayatPencarianStorage";
import { hapusCacheKota } from "../../services/cacheStorage";
import { HasilGeocoding } from "../../../types/geocoding";

export default function TabRiwayat() {
  const [daftarRiwayat, setDaftarRiwayat] = useState<HasilGeocoding[]>([]);
  const { temaGelap } = useTema();

  const warna = {
    latar: temaGelap ? "#071426" : "#F5F7FB",
    kartu: temaGelap ? "#10243B" : "#FFFFFF",
    teks: temaGelap ? "#F1F5F9" : "#172033",
    sekunder: temaGelap ? "#B8C7DA" : "#667085",
    garis: temaGelap ? "#344B65" : "#D5DEE9",
    tombolCache: temaGelap ? "#315A91" : "#123D8C",
    tombolHapus: "#8a221bda",
  };

  const muatRiwayat = useCallback(() => {
    ambilRiwayatPencarian().then(setDaftarRiwayat);
  }, []);

  useFocusEffect(
    useCallback(() => {
      muatRiwayat();
    }, [muatRiwayat]),
  );

  function bukaRiwayat(kota: HasilGeocoding) {
    router.push({
      pathname: "/",
      params: {
        kotaId: String(kota.id),
        namaKota: kota.name,
        lat: String(kota.latitude),
        lon: String(kota.longitude),
        country: kota.country ?? "",
      },
    });
  }

  function konfirmasiHapusCache(kota: HasilGeocoding) {
    const hapus = async () => {
      try {
        await hapusCacheKota(kota.latitude, kota.longitude);

        const pesan = `Cache cuaca dan kualitas udara ${kota.name} berhasil dihapus.`;

        if (Platform.OS === "web") {
          window.alert(pesan);
        } else {
          Alert.alert("Berhasil", pesan);
        }
      } catch (error) {
        console.error("Gagal menghapus cache:", error);

        if (Platform.OS === "web") {
          window.alert("Cache gagal dihapus.");
        } else {
          Alert.alert("Gagal", "Cache tidak berhasil dihapus.");
        }
      }
    };

    if (Platform.OS === "web") {
      if (
        window.confirm(
          `Hapus cache cuaca dan kualitas udara untuk ${kota.name}?`,
        )
      ) {
        void hapus();
      }
      return;
    }

    Alert.alert(
      "Konfirmasi Hapus Cache",
      `Hapus cache cuaca dan kualitas udara untuk ${kota.name}?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: () => void hapus(),
        },
      ],
    );
  }

  function konfirmasiHapusRiwayat(kota: HasilGeocoding) {
    const hapus = async () => {
      try {
        await hapusRiwayatPencarian(kota);
        await muatRiwayat();
      } catch (error) {
        console.error("Gagal menghapus riwayat:", error);

        if (Platform.OS === "web") {
          window.alert("Riwayat gagal dihapus.");
        } else {
          Alert.alert("Gagal", "Riwayat tidak berhasil dihapus.");
        }
      }
    };

    if (Platform.OS === "web") {
      if (
        window.confirm(
          `Hapus ${kota.name} dari riwayat pencarian? Cache dan favorit tidak akan dihapus.`,
        )
      ) {
        void hapus();
      }
      return;
    }

    Alert.alert(
      "Hapus Riwayat",
      `Hapus ${kota.name} dari riwayat pencarian? Cache dan favorit tidak akan dihapus.`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: () => void hapus(),
        },
      ],
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: warna.latar }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        <Text
          style={{
            fontSize: 22,
            fontWeight: "bold",
            color: warna.teks,
            marginBottom: 8,
          }}
        >
          Riwayat Pencarian
        </Text>

        <Text style={{ color: warna.sekunder, marginBottom: 16 }}>
          {daftarRiwayat.length} dari 10 pencarian terakhir
        </Text>

        {daftarRiwayat.length === 0 && (
          <View
            style={{
              padding: 16,
              borderWidth: 1,
              borderColor: warna.garis,
              borderRadius: 10,
              backgroundColor: warna.kartu,
            }}
          >
            <Text style={{ color: warna.teks }}>
              Belum ada riwayat pencarian. Coba cari kota dari Beranda.
            </Text>
          </View>
        )}

        <View style={{ gap: 12 }}>
          {daftarRiwayat.map((kota, index) => (
            <View
              key={`${kota.id}-${kota.latitude}-${kota.longitude}`}
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 14,
                borderWidth: 1,
                borderColor: warna.garis,
                borderRadius: 12,
                backgroundColor: warna.kartu,
                gap: 10,
              }}
            >
              <TouchableOpacity
                onPress={() => bukaRiwayat(kota)}
                accessibilityRole="button"
                accessibilityLabel={`Buka cuaca ${kota.name}`}
                style={{ flex: 1, minWidth: 0 }}
              >
                <Text
                  style={{
                    fontWeight: "bold",
                    fontSize: 16,
                    color: warna.teks,
                  }}
                >
                  {index + 1}. {kota.name}
                </Text>

                <Text
                  style={{
                    color: warna.sekunder,
                    fontSize: 12,
                    marginTop: 5,
                  }}
                >
                  Ketuk untuk melihat cuaca kembali
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => konfirmasiHapusCache(kota)}
                accessibilityRole="button"
                accessibilityLabel={`Hapus cache ${kota.name}`}
                style={{
                  backgroundColor: warna.tombolCache,
                  paddingHorizontal: 10,
                  height: 38,
                  borderRadius: 8,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontWeight: "600",
                    fontSize: 12,
                  }}
                >
                  Hapus Cache
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => konfirmasiHapusRiwayat(kota)}
                accessibilityRole="button"
                accessibilityLabel={`Hapus riwayat ${kota.name}`}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 8,
                  backgroundColor: warna.tombolHapus,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="trash-outline" size={19} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
