
import { GeocodingResponse, HasilGeocoding } from "../../types/geocoding";

const BASE_URL = "https://geocoding-api.open-meteo.com/v1/search";

// Data kabupaten/kota lokal agar pencarian tetap bisa dilakukan offline.
type DataWilayah = {
  id: string;
  level: number;
  name: {
    local: string;
    en: string;
  };
  parent?: {
    name: {
      local: string;
    };
  };
  geo?: {
    lat: string;
    lon: string;
  };
};

import daftarWilayah from "../data/all-regency.json";

const daftarKota = daftarWilayah as DataWilayah[];

function cariKotaOffline(nama: string): HasilGeocoding[] {
  const kataKunci = nama.trim().toLocaleLowerCase("id-ID");

  if (!kataKunci) return [];

  return daftarKota
    .filter((wilayah) => {
      const namaLokal = wilayah.name.local.toLocaleLowerCase("id-ID");
      const namaInggris = wilayah.name.en.toLocaleLowerCase("id-ID");
      const namaProvinsi =
        wilayah.parent?.name.local.toLocaleLowerCase("id-ID") ?? "";

      return (
        namaLokal.includes(kataKunci) ||
        namaInggris.includes(kataKunci) ||
        namaProvinsi.includes(kataKunci)
      );
    })
    .filter(
      (wilayah) =>
        wilayah.geo?.lat != null && wilayah.geo?.lon != null,
    )
    .slice(0, 5)
    .map((wilayah) => ({
      id: Number(wilayah.id),
      name: wilayah.name.local,
      latitude: Number(wilayah.geo!.lat),
      longitude: Number(wilayah.geo!.lon),
      country: "Indonesia",
    }));
}

export async function cariKota(nama: string): Promise<HasilGeocoding[]> {
  const kataKunci = nama.trim();

  if (!kataKunci) return [];

  try {
    const url =
      `${BASE_URL}?name=${encodeURIComponent(kataKunci)}` +
      "&count=5&language=id&format=json";

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Pencarian kota online gagal.");
    }

    const data: GeocodingResponse = await response.json();

    if (data.results && data.results.length > 0) {
      return data.results;
    }
  } catch {
    // Jika internet tidak tersedia, lanjutkan ke data lokal.
  }

  return cariKotaOffline(kataKunci);
}
