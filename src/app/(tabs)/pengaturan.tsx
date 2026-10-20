// app/(tabs)/pengaturan.tsx
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, TouchableOpacity } from "react-native";
import { useTema, type ModeTema } from "../../context/ThemeContext";

const pilihanTema: {
    label: string;
    deskripsi: string;
    nilai: ModeTema;
    ikon: string;
}[] = [
    {
        label: "Terang",
        deskripsi: "Gunakan tampilan terang",
        nilai: "terang",
        ikon: "☀️",
    },
    {
        label: "Gelap",
        deskripsi: "Gunakan tampilan gelap",
        nilai: "gelap",
        ikon: "🌙",
    },
    {
        label: "Ikuti Sistem",
        deskripsi: "Sesuaikan dengan perangkat",
        nilai: "sistem",
        ikon: "⚙️",
    },
];

export default function TabPengaturan() {
    const { modeTema, temaGelap, ubahTema } = useTema();

    const warna = {
        latar: temaGelap ? "#071426" : "#F5F7FB",
        kartu: temaGelap ? "#12304F" : "#FFFFFF",
        teks: temaGelap ? "#FFFFFF" : "#172033",
        sekunder: temaGelap ? "#B8C7DA" : "#667085",
        aksen: "#2563EB",
        batas: temaGelap ? "#34506E" : "#E2E8F0",
    };

    return (
        <SafeAreaView
            style={{
                flex: 1,
                padding: 20,
                backgroundColor: warna.latar,
            }}
        >
            <Text
                style={{
                    fontSize: 26,
                    fontWeight: "bold",
                    color: warna.teks,
                }}
            >
                Pengaturan
            </Text>

            <Text
                style={{
                    fontSize: 14,
                    color: warna.sekunder,
                    marginTop: 6,
                    marginBottom: 24,
                }}
            >
                Sesuaikan tampilan aplikasi Jelajah Aman.
            </Text>

            <Text
                style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    color: warna.teks,
                    marginBottom: 12,
                }}
            >
                Tampilan Tema
            </Text>

            <View style={{ gap: 12 }}>
                {pilihanTema.map((pilihan) => {
                    const aktif = modeTema === pilihan.nilai;

                    return (
                        <TouchableOpacity
                            key={pilihan.nilai}
                            onPress={() => void ubahTema(pilihan.nilai)}
                            accessibilityRole="button"
                            accessibilityState={{ selected: aktif }}
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                padding: 16,
                                borderRadius: 14,
                                borderWidth: 1.5,
                                borderColor: aktif
                                    ? warna.aksen
                                    : warna.batas,
                                backgroundColor: warna.kartu,
                            }}
                        >
                            <Text style={{ fontSize: 26, marginRight: 14 }}>
                                {pilihan.ikon}
                            </Text>

                            <View style={{ flex: 1 }}>
                                <Text
                                    style={{
                                        fontSize: 16,
                                        fontWeight: "600",
                                        color: warna.teks,
                                    }}
                                >
                                    {pilihan.label}
                                </Text>

                                <Text
                                    style={{
                                        fontSize: 13,
                                        color: warna.sekunder,
                                        marginTop: 4,
                                    }}
                                >
                                    {pilihan.deskripsi}
                                </Text>
                            </View>

                            <Text
                                style={{
                                    fontSize: 18,
                                    color: aktif ? warna.aksen : warna.sekunder,
                                }}
                            >
                                {aktif ? "✓" : ""}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            <View
                style={{
                    marginTop: 28,
                    padding: 16,
                    borderRadius: 14,
                    backgroundColor: warna.kartu,
                }}
            >
                <Text
                    style={{
                        fontSize: 18,
                        fontWeight: "bold",
                        color: warna.teks,
                    }}
                >
                    Jelajah Aman
                </Text>

                <Text style={{ color: warna.sekunder, marginTop: 6 }}>
                    Versi 1.0.0
                </Text>
            </View>
        </SafeAreaView>
    );
}
