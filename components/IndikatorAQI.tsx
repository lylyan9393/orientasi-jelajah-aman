import { Text, View } from "react-native";
import { LaporanUdara } from "../types/laporanUdara";

interface IndikatorAQIProps {
  data: LaporanUdara;
}

export default function IndikatorAQI({ data }: IndikatorAQIProps) {
  const warna =
    data.tingkat === "BAIK"
      ? "green"
      : data.tingkat === "SEDANG"
      ? "orange"
      : data.tingkat === "TIDAK_SEHAT"
      ? "red"
      : "purple";

  return (
    <View>
      <Text>Kota: {data.kota}</Text>
      <Text>Indeks AQI: {data.indeksAQI}</Text>
      <Text style={{ color: warna }}>
        Kualitas Udara: {data.tingkat}
      </Text>

      {data.diperbaruiPada && (
        <Text>Diperbarui pada: {data.diperbaruiPada}</Text>
      )}
    </View>
  );
}