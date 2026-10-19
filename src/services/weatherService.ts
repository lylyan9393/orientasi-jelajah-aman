
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DataCuacaLengkap } from "../../types/weather";
import dataOffline from "../data/cuacaOffline.json";

type DataOfflineKota = {
  cuaca: DataCuacaLengkap;
};

const daftarCuaca = dataOffline as Record<string, DataOfflineKota>;

const BASE_URL = "https://api.open-meteo.com/v1/forecast";
const BATAS_WAKTU_MS = 3000;
const KUNCI_CACHE = "@jelajah_aman:cache_cuaca";

function buatKunciCache(latitude: number, longitude: number) {
  return `${KUNCI_CACHE}:${latitude.toFixed(4)}:${longitude.toFixed(4)}`;
}

export async function ambilCuaca(
  latitude: number,
  longitude: number,
  idKota?: number,
): Promise<DataCuacaLengkap> {
  const kunciCache = buatKunciCache(latitude, longitude);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), BATAS_WAKTU_MS);

  try {
    const url =
      `${BASE_URL}?latitude=${latitude}&longitude=${longitude}` +
      "&current=temperature_2m,weather_code,wind_speed_10m" +
      "&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto";

    const response = await fetch(url, { signal: controller.signal });

    if (!response.ok) {
      throw new Error("Gagal memuat cuaca dari internet.");
    }

    const data = await response.json();

    const hasil: DataCuacaLengkap = {
      saatIni: {
        suhu: data.current.temperature_2m,
        kodeCuaca: data.current.weather_code,
        kecepatanAngin: data.current.wind_speed_10m,
        waktu: data.current.time,
      },
      harian: {
        tanggal: data.daily.time,
        suhuMaksimal: data.daily.temperature_2m_max,
        suhuMinimal: data.daily.temperature_2m_min,
        kodeCuaca: data.daily.weather_code,
      },
    };

    await AsyncStorage.setItem(kunciCache, JSON.stringify(hasil));
    return hasil;
  } catch {
    const cache = await AsyncStorage.getItem(kunciCache);
    if (cache) return JSON.parse(cache) as DataCuacaLengkap;

    if (idKota != null) {
      const dataKota = daftarCuaca[String(idKota)];
      if (dataKota?.cuaca) return dataKota.cuaca;
    }

    throw new Error("Data cuaca offline belum tersedia untuk kota ini.");
  } finally {
    clearTimeout(timer);
  }
}
