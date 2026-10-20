import { Stack } from "expo-router";
import { ThemeProvider, useTema } from "../context/ThemeContext";

function LayoutNavigasi() {
  const { temaGelap } = useTema();

  const warna = {
    latar: temaGelap ? "#071426" : "#FFFFFF",
    teks: temaGelap ? "#F1F5F9" : "#172033",
    batas: temaGelap ? "#263B53" : "#E2E8F0",
  };

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: warna.latar,
        },
        headerTintColor: warna.teks,
        headerTitleStyle: {
          fontWeight: "bold",
        },
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: warna.latar,
        },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="detail/[kota]" options={{ title: "Detail Cuaca" }} />
      <Stack.Screen
        name="tambah-favorit"
        options={{ title: "Tambah Favorit" }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <LayoutNavigasi />
    </ThemeProvider>
  );
}
