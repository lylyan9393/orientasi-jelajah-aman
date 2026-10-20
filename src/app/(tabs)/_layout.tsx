
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTema } from "../../context/ThemeContext";

export default function TabLayout() {
  const { temaGelap } = useTema();

  const warna = {
    latar: temaGelap ? "#071426" : "#FFFFFF",
    teks: temaGelap ? "#FFFFFF" : "#172033",
    aktif: temaGelap ? "#7DAAFF" : "#123D8C",
    tidakAktif: temaGelap ? "#A0AEC0" : "#888888",
    batas: temaGelap ? "#263B53" : "#E2E8F0",
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: warna.latar,
        },
        headerTintColor: warna.teks,
        headerTitleStyle: {
          fontWeight: "bold",
        },
        sceneStyle: {
          backgroundColor: warna.latar,
        },
        tabBarStyle: {
          backgroundColor: warna.latar,
          borderTopColor: warna.batas,
        },
        tabBarActiveTintColor: warna.aktif,
        tabBarInactiveTintColor: warna.tidakAktif,
        tabBarLabelStyle: {
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Beranda",
          tabBarLabel: "Beranda",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="riwayat"
        options={{
          title: "Riwayat",
          tabBarLabel: "Riwayat",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="favorit"
        options={{
          title: "Favorit",
          tabBarLabel: "Favorit",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="pengaturan"
        options={{
          title: "Pengaturan",
          tabBarLabel: "Pengaturan",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="tentang"
        options={{
          title: "Tentang",
          tabBarLabel: "Tentang",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="information-circle" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}