import AsyncStorage from "@react-native-async-storage/async-storage";
import { HasilGeocoding } from "../../types/geocoding";

const KUNCI_RIWAYAT = "@jelajah_aman:riwayat_pencarian";
const MAKSIMAL_RIWAYAT = 10;

export async function ambilRiwayatPencarian(): Promise<HasilGeocoding[]> {
  try {
    const data = await AsyncStorage.getItem(KUNCI_RIWAYAT);

    if (!data) {
      return [];
    }

    return JSON.parse(data) as HasilGeocoding[];
  } catch (error) {
    console.error("Gagal mengambil riwayat pencarian:", error);
    return [];
  }
}

export async function simpanRiwayatPencarian(
  kota: HasilGeocoding,
): Promise<void> {
  if (kota.id === -1) {
    return;
  }

  const riwayat = await ambilRiwayatPencarian();

  const riwayatTanpaDuplikat = riwayat.filter(
    (item) =>
      item.id !== kota.id ||
      item.latitude !== kota.latitude ||
      item.longitude !== kota.longitude,
  );

  const riwayatBaru = [kota, ...riwayatTanpaDuplikat].slice(
    0,
    MAKSIMAL_RIWAYAT,
  );

  await AsyncStorage.setItem(KUNCI_RIWAYAT, JSON.stringify(riwayatBaru));
}

export async function hapusRiwayatPencarian(
  kota: HasilGeocoding,
): Promise<void> {
  const riwayat = await ambilRiwayatPencarian();

  const riwayatBaru = riwayat.filter(
    (item) =>
      !(
        item.id === kota.id &&
        item.latitude === kota.latitude &&
        item.longitude === kota.longitude
      ),
  );

  await AsyncStorage.setItem(KUNCI_RIWAYAT, JSON.stringify(riwayatBaru));
}
