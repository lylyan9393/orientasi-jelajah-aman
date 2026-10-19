
import fs from "node:fs/promises";

const fileWilayah = new URL("../src/data/all-regency.json", import.meta.url);
const fileOutput = new URL("../src/data/cuacaOffline.json", import.meta.url);

const BASE_CUACA = "https://api.open-meteo.com/v1/forecast";
const BASE_UDARA = "https://air-quality-api.open-meteo.com/v1/air-quality";

const jeda = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function ambilJSON(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}

async function utama() {
  const wilayah = JSON.parse(await fs.readFile(fileWilayah, "utf8"));

  const kota = wilayah.filter(
    (item) =>
      item.level === 2 &&
      item.geo?.lat != null &&
      item.geo?.lon != null
  );

  let hasil = {};

  // Melanjutkan data yang sudah berhasil tersimpan jika script dijalankan ulang.
  try {
    hasil = JSON.parse(await fs.readFile(fileOutput, "utf8"));
  } catch {
    hasil = {};
  }

  console.log(`Total wilayah yang diperiksa: ${kota.length}`);

  for (let i = 0; i < kota.length; i++) {
    const item = kota[i];

    if (hasil[item.id]?.cuaca && hasil[item.id]?.kualitasUdara) {
      console.log(`[${i + 1}/${kota.length}] Lewati ${item.name.local}`);
      continue;
    }

    const lat = Number(item.geo.lat);
    const lon = Number(item.geo.lon);

    try {
      const cuacaURL =
        `${BASE_CUACA}?latitude=${lat}&longitude=${lon}` +
        "&current=temperature_2m,weather_code,wind_speed_10m" +
        "&daily=temperature_2m_max,temperature_2m_min,weather_code" +
        "&forecast_days=7&timezone=auto";

      const udaraURL =
        `${BASE_UDARA}?latitude=${lat}&longitude=${lon}` +
        "&current=european_aqi,pm2_5,pm10&timezone=auto";

      const [cuacaData, udaraData] = await Promise.all([
        ambilJSON(cuacaURL),
        ambilJSON(udaraURL),
      ]);

      if (!cuacaData.current || !cuacaData.daily || !udaraData.current) {
        throw new Error("Respons API belum lengkap");
      }

      hasil[item.id] = {
        cuaca: {
          saatIni: {
            suhu: cuacaData.current.temperature_2m,
            kodeCuaca: cuacaData.current.weather_code,
            kecepatanAngin: cuacaData.current.wind_speed_10m,
            waktu: cuacaData.current.time,
          },
          harian: {
            tanggal: cuacaData.daily.time,
            suhuMaksimal: cuacaData.daily.temperature_2m_max,
            suhuMinimal: cuacaData.daily.temperature_2m_min,
            kodeCuaca: cuacaData.daily.weather_code,
          },
        },
        kualitasUdara: {
          indeksAQI: udaraData.current.european_aqi,
          pm25: udaraData.current.pm2_5,
          pm10: udaraData.current.pm10,
        },
        diambilPada: new Date().toISOString(),
      };

      // Simpan setiap kota agar hasil yang sudah berhasil tidak hilang.
      await fs.writeFile(fileOutput, JSON.stringify(hasil, null, 2));

      console.log(`[${i + 1}/${kota.length}] Berhasil: ${item.name.local}`);
    } catch (error) {
      console.error(
        `[${i + 1}/${kota.length}] Gagal: ${item.name.local} - ${error.message}`
      );
    }

    // Mengurangi laju permintaan ke API.
    await jeda(1200);
  }

  console.log("Selesai memproses seluruh wilayah.");
  console.log(`Data tersimpan di: ${fileOutput.pathname}`);
}

utama().catch((error) => {
  console.error("Script gagal:", error);
  process.exitCode = 1;
});
