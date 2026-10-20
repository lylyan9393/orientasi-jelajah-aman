//components/SearchBox.tsx

import { useState } from "react";
import { View, TextInput } from "react-native";
import { useTema } from "../src/context/ThemeContext";

interface SearchBoxProps {
  onCari: (teks: string) => void;
}

export default function SearchBox({ onCari }: SearchBoxProps) {
  const [teks, setTeks] = useState("");
  const { temaGelap } = useTema();

  const warna = {
    latar: temaGelap ? "#0B1B30" : "#FFFFFF",
    teks: temaGelap ? "#F1F5F9" : "#172033",
    placeholder: temaGelap ? "#A7B5C8" : "#7A8699",
    garis: temaGelap ? "#49617D" : "#CBD5E1",
  };

  function handleChange(nilaiBaru: string) {
    setTeks(nilaiBaru);
    onCari(nilaiBaru);
  }

  return (
    <View>
      <TextInput
        placeholder="Cari nama kota..."
        placeholderTextColor={warna.placeholder}
        value={teks}
        onChangeText={handleChange}
        accessibilityLabel="Cari cuaca untuk kota yang dimasukkan"
        selectionColor={temaGelap ? "#7DAAFF" : "#123D8C"}
        style={{
          borderWidth: 1,
          borderColor: warna.garis,
          backgroundColor: warna.latar,
          color: warna.teks,
          padding: 12,
          borderRadius: 8,
        }}
      />
    </View>
  );
}
