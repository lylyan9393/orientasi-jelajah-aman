// app/detail/[kota].tsx
import { Pressable, View, Text } from "react-native";
import { Link, useLocalSearchParams } from "expo-router";
import WeatherCard from "../../../components/WeatherCard";
import { Button } from "expo-router/build/react-navigation";

export default function HalamanDetail() {
    const { kota } = useLocalSearchParams<{ kota: string }>();

    return (
        <View style={{ padding: 16 }}>
            <WeatherCard kota={kota} suhu={29} tingkatAQI="BAIK" />
            <Link href={{ pathname: "/tambah-favorit", params: { kota }, }} asChild>
                <Pressable style={{
                        marginTop: 16,
                        padding: 12,
                        backgroundColor: "#007AFF",
                        borderRadius: 8,
                    }}>
                    <Text
                        style={{
                            color: "white",
                            textAlign: "center",
                            fontWeight: "bold",
                        }}>
                        Tambahkan ke Favorit
                    </Text>
                </Pressable>
            </Link>
        </View>
    );
}