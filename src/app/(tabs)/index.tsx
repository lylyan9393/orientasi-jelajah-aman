// src/app/(tabs)/index.tsx
import { useTema } from "../../context/ThemeContext";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  mintaIzinLokasi,
  ambilKoordinatSaatIni,
} from "../../services/locationService";
import {
  View,
  Text,
  ActivityIndicator,
  Button,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import NetInfo from "@react-native-community/netinfo";

import SearchBox from "../../../components/SearchBox";
import WeatherCard from "../../components/WeatherCard";
import AtribusiCuaca from "../../components/AtribusiCuaca";
import { useDebounce } from "../../hooks/use-debounce";
import { cariKota } from "../../services/geocodingService";
import { ambilCuaca } from "../../services/weatherService";
import { ambilKualitasUdara } from "../../services/airQualityService";
import { ambilSemuaFavorit } from "../../services/favoritStorage";
import { KotaFavorit } from "../../../types/favorit";
import { konversiTingkatAQI } from "../../services/weatherAdapter";
import { labelKodeCuaca } from "../../constants/weatherCodes";
import { HasilGeocoding } from "../../../types/geocoding";
import { DataCuacaLengkap, DataKualitasUdara } from "../../../types/weather";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { simpanRiwayatPencarian } from "../../services/riwayatPencarianStorage";

export default function HalamanUtama() {
  const { temaGelap } = useTema();
  const warna = {
    latar: temaGelap ? "#071426" : "#F5F7FB",
    kartu: temaGelap ? "#12304F" : "#FFFFFF",
    teks: temaGelap ? "#F8FAFC" : "#172033",
    sekunder: temaGelap ? "#C0CDDD" : "#667085",
    garis: temaGelap ? "#3B526D" : "#D8E0EA",
    tombol: temaGelap ? "#7DAAFF" : "#123D8C",
  };
  const [teksCari, setTeksCari] = useState("");
  const [hasilPencarian, setHasilPencarian] = useState<HasilGeocoding[]>([]);
  const [kotaTerpilih, setKotaTerpilih] = useState<HasilGeocoding | null>(null);
  const [cuaca, setCuaca] = useState<DataCuacaLengkap | null>(null);
  const [kualitasUdara, setKualitasUdara] = useState<DataKualitasUdara | null>(
    null,
  );

  const [daftarFavorit, setDaftarFavorit] = useState<KotaFavorit[]>([]);

  const [sedangMemuat, setSedangMemuat] = useState(false);
  const [pesanError, setPesanError] = useState<string | null>(null);

  const [pesanLokasi, setPesanLokasi] = useState<string | null>(null);

  const teksTertunda = useDebounce(teksCari, 500);
  const requestIdRef = useRef(0); // pencegah race condition

  const params = useLocalSearchParams<{
    kotaId?: string;
    namaKota?: string;
    lat?: string;
    lon?: string;
    country?: string;
  }>();
  const riwayatDiproses = useRef<string | null>(null);

  useEffect(() => {
    if (teksTertunda.trim().length === 0) {
      setHasilPencarian([]);
      return;
    }
    cariKota(teksTertunda)
      .then(setHasilPencarian)
      .catch(() => setHasilPencarian([]));
  }, [teksTertunda]);

  useFocusEffect(
    useCallback(() => {
      ambilSemuaFavorit().then(setDaftarFavorit);
    }, []),
  );

  async function pilihKota(kota: HasilGeocoding) {
    setKotaTerpilih(kota);
    const idSaatIni = ++requestIdRef.current;

    setSedangMemuat(true);
    setPesanError(null);
    setCuaca(null);
    setKualitasUdara(null);

    const [hasilCuaca, hasilUdara] = await Promise.allSettled([
      ambilCuaca(kota.latitude, kota.longitude, kota.id),
      ambilKualitasUdara(kota.latitude, kota.longitude, kota.id),
    ]);

    if (idSaatIni !== requestIdRef.current) return;

    if (hasilCuaca.status === "fulfilled") {
      setCuaca(hasilCuaca.value);
    }

    if (hasilUdara.status === "fulfilled") {
      setKualitasUdara(hasilUdara.value);
    }

    if (hasilCuaca.status === "rejected" && hasilUdara.status === "rejected") {
      setPesanError(
        "Data cuaca dan kualitas udara belum tersedia untuk kota ini.",
      );
    } else if (hasilCuaca.status === "rejected") {
      setPesanError("Data cuaca belum tersedia untuk kota ini.");
    }

    setSedangMemuat(false);
  }

  useEffect(() => {
    const { kotaId, namaKota, lat, lon, country } = params;
    if (!kotaId || !namaKota || !lat || !lon) {
      return;
    }

    const kunci = `${kotaId}-${lat}-${lon}`;
    if (riwayatDiproses.current === kunci) {
      return;
    }

    const id = Number(kotaId);
    const latitude = Number(lat);
    const longitude = Number(lon);

    if (
      !Number.isFinite(id) ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      return;
    }

    riwayatDiproses.current = kunci;

    void pilihKota({
      id,
      name: namaKota,
      latitude,
      longitude,
      country: country ?? "",
    });
  }, [params.kotaId, params.namaKota, params.lat, params.lon, params.country]);

  async function pilihHasilPencarian(kota: HasilGeocoding) {
    try {
      await simpanRiwayatPencarian(kota);
    } catch (error) {
      console.error("Gagal menyimpan riwayat pencarian:", error);
    }
    await pilihKota(kota);
  }

  const koneksiSebelumnya = useRef<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online =
        state.isConnected === true && state.isInternetReachable !== false;

      if (online && koneksiSebelumnya.current === false) {
        const kota = kotaTerpilih;

        if (kota) {
          void pilihKota(kota);
        }
      }

      koneksiSebelumnya.current = online;
    });

    return unsubscribe;
  }, [kotaTerpilih]);

  async function gunakanLokasiSaatIni() {
    const status = await mintaIzinLokasi();

    if (status === "denied") {
      setPesanLokasi(
        "Izin lokasi ditolak. Silakan cari kota secara manual di atas.",
      );
      return;
    }
    if (status === "unavailable") {
      setPesanLokasi(
        "Layanan lokasi tidak aktif di perangkat ini. Silakan cari kota secaramanual.",
      );
      return;
    }

    setPesanLokasi(null);
    const koordinat = await ambilKoordinatSaatIni();
    pilihKota({
      id: -1,
      name: "Lokasi Saat Ini",
      latitude: koordinat.latitude,
      longitude: koordinat.longitude,
      country: "",
    });
  }

  const sudahFavorit =
    kotaTerpilih !== null &&
    daftarFavorit.some((kota) => kota.id === kotaTerpilih.id);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        padding: 16,
        backgroundColor: warna.latar,
      }}
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ gap: 12 }}>
          <SearchBox onCari={setTeksCari} />

          <Button
            title="Gunakan Lokasi Saat Ini"
            onPress={gunakanLokasiSaatIni}
            color={warna.tombol}
          />

          {pesanLokasi && (
            <Text style={{ color: warna.sekunder }}>{pesanLokasi}</Text>
          )}

          {hasilPencarian.map((kota) => (
            <TouchableOpacity
              key={`${kota.id}-${kota.latitude}-${kota.longitude}`}
              onPress={() => pilihHasilPencarian(kota)}
              style={{
                padding: 12,
                backgroundColor: warna.kartu,
                borderWidth: 1,
                borderColor: warna.garis,
                borderRadius: 10,
              }}
            >
              <Text style={{ color: warna.teks }}>{kota.name}</Text>
            </TouchableOpacity>
          ))}

          {sedangMemuat && <ActivityIndicator color={warna.tombol} />}

          {pesanError && (
            <View
              style={{
                padding: 12,
                borderWidth: 1,
                borderColor: warna.garis,
                borderRadius: 10,
                gap: 8,
              }}
            >
              <Text style={{ color: warna.teks }}>{pesanError}</Text>
              <Button
                title="Coba Lagi"
                color={warna.tombol}
                onPress={() => kotaTerpilih && pilihKota(kotaTerpilih)}
              />
            </View>
          )}

          {cuaca && kotaTerpilih && !sedangMemuat && (
            <>
              <WeatherCard
                kota={kotaTerpilih.name}
                suhu={cuaca.saatIni.suhu}
                tingkatAQI={
                  kualitasUdara
                    ? konversiTingkatAQI(kualitasUdara.indeksAQI)
                    : "SEDANG"
                }
                indeksAQI={kualitasUdara?.indeksAQI}
              />

              {!sudahFavorit && (
                <Button
                  title="Tambahkan ke Favorit"
                  color={warna.tombol}
                  onPress={() =>
                    router.push({
                      pathname: "/tambah-favorit",
                      params: {
                        id: String(kotaTerpilih.id),
                        nama: kotaTerpilih.name,
                        lat: String(kotaTerpilih.latitude),
                        lon: String(kotaTerpilih.longitude),
                      },
                    })
                  }
                />
              )}

              <View
                style={{
                  padding: 14,
                  backgroundColor: warna.kartu,
                  borderColor: warna.garis,
                  borderWidth: 1,
                  borderRadius: 12,
                  gap: 10,
                }}
              >
                <Text
                  style={{
                    color: warna.teks,
                    fontSize: 16,
                    fontWeight: "600",
                  }}
                >
                  Suhu hari ini: {cuaca.harian.suhuMinimal[0]}°C -{" "}
                  {cuaca.harian.suhuMaksimal[0]}°C
                </Text>

                <View
                  style={{
                    height: 1,
                    backgroundColor: warna.garis,
                  }}
                />

                <Text style={{ color: warna.sekunder, fontSize: 13 }}>
                  Kondisi: {labelKodeCuaca(cuaca.saatIni.kodeCuaca)} • Angin{" "}
                  {cuaca.saatIni.kecepatanAngin} km/j
                </Text>

                {kualitasUdara && (
                  <Text style={{ color: warna.sekunder, fontSize: 13 }}>
                    PM2.5: {kualitasUdara.pm25} µg/m³ • PM10:{" "}
                    {kualitasUdara.pm10} µg/m³
                  </Text>
                )}
              </View>

              <AtribusiCuaca />
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
