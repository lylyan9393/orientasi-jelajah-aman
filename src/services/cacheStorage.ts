//src/services/cacheStorage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

export async function hapusCacheKota(
  latitude: number,
  longitude: number,
): Promise<void> {
  const koordinat = `${latitude.toFixed(4)}:${longitude.toFixed(4)}`;

  const kunciCuaca = `@jelajah_aman:cache_cuaca:${koordinat}`;
  const kunciUdara = `@jelajah_aman:cache_udara:${koordinat}`;

  await AsyncStorage.multiRemove([kunciCuaca, kunciUdara]);
}
