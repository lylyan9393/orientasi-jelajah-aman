import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { typeScale, spacing } from "../../../constants/styles";

export default function TabTentang() {
    return (
        <SafeAreaView
            style={{
                flex: 1,
                padding: spacing.sedang,
            }}>
            <Text
                accessibilityLabel="Nama aplikasi Jelajah Aman"
                style={{
                    fontSize: typeScale.judul,
                    fontWeight: "bold",
                }}>
                Jelajah Aman
            </Text>

            <Text
                style={{
                    fontSize: typeScale.isi,
                    marginTop: spacing.kecil,
                }}>
                Versi 1.0.0
            </Text>

            <Text
                style={{
                    fontSize: typeScale.isi,
                    marginTop: spacing.sedang,
                }}>
                Dibuat oleh Lintang Tsaniatu Azzahro
            </Text>
        </SafeAreaView>
    );
}