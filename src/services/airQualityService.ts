import AsyncStorage from "@react-native-async-storage/async-storage";
import { DataKualitasUdara } from "../../types/weather";
import dataOffline from "../data/cuacaOffline.json";

type DataOfflineKota = {
  kualitasUdara: DataKualitasUdara;
};

const daftarOffline = dataOffline as Record<string, DataOfflineKota>;

const BASE_URL = "https://air-quality-api.open-meteo.com/v1/air-quality";

export async function ambilKualitasUdara(
  latitude: number,
  longitude: number,
  idKota?: number,
): Promise<DataKualitasUdara> {
  const kunciCache =
    `@jelajah_aman:cache_udara:${latitude.toFixed(4)}:${longitude.toFixed(4)}`;

  try {
    const url =
      `${BASE_URL}?latitude=${latitude}&longitude=${longitude}` +
      "&current=european_aqi,pm2_5,pm10";

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Gagal memuat kualitas udara.");
    }

    const data = await response.json();

    const hasil: DataKualitasUdara = {
      indeksAQI: data.current.european_aqi,
      pm25: data.current.pm2_5,
      pm10: data.current.pm10,
    };

    await AsyncStorage.setItem(kunciCache, JSON.stringify(hasil));
    return hasil;
  } catch {
    const cache = await AsyncStorage.getItem(kunciCache);

    if (cache) {
      return JSON.parse(cache) as DataKualitasUdara;
    }

    if (idKota != null) {
      const dataKota = daftarOffline[String(idKota)];
      if (dataKota?.kualitasUdara) return dataKota.kualitasUdara;
    }

    throw new Error("Data kualitas udara offline belum tersedia untuk kota ini.");
  }
}
