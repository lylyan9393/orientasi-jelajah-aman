// src/app/(tabs)/index.tsx
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
import { router, useFocusEffect } from "expo-router";

export default function HalamanUtama() {
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
    <SafeAreaView style={{ flex: 1, padding: 16, gap: 16 }}>
      <ScrollView>
        <SearchBox onCari={setTeksCari} />

        <Button
          title="Gunakan Lokasi Saat Ini"
          onPress={gunakanLokasiSaatIni}
        />
        {pesanLokasi && <Text>{pesanLokasi}</Text>}

        {hasilPencarian.map((kota) => (
          <TouchableOpacity key={kota.id} onPress={() => pilihKota(kota)}>
            <Text>{kota.name}</Text>
          </TouchableOpacity>
        ))}

        {sedangMemuat && <ActivityIndicator />}

        {pesanError && (
          <View>
            <Text>{pesanError}</Text>
            <Button
              title="Coba Lagi"
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

            <Text>
              Suhu hari ini: {cuaca.harian.suhuMinimal[0]}°C -{" "}
              {cuaca.harian.suhuMaksimal[0]}°C
            </Text>

            <Text style={{ fontSize: 12, color: "#888" }}>
              Kondisi: {labelKodeCuaca(cuaca.saatIni.kodeCuaca)} • Angin{" "}
              {cuaca.saatIni.kecepatanAngin} km/j
            </Text>

            {kualitasUdara && (
              <Text style={{ fontSize: 12, color: "#888" }}>
                PM2.5: {kualitasUdara.pm25} µg/m³ • PM10: {kualitasUdara.pm10}{" "}
                µg/m³
              </Text>
            )}

            <AtribusiCuaca />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
