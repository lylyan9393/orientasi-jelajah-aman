//src/context/ThemeContext.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";
import { useColorScheme } from "react-native";

export type ModeTema = "terang" | "gelap" | "sistem";

type ThemeContextType = {
    modeTema: ModeTema;
    temaGelap: boolean;
    ubahTema: (mode: ModeTema) => Promise<void>;
    temaSiap: boolean;
};

const KUNCI_TEMA = "@jelajah_aman:tema";

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const skemaSistem = useColorScheme();
    const [modeTema, setModeTema] = useState<ModeTema>("sistem");
    const [temaSiap, setTemaSiap] = useState(false);

    useEffect(() => {
        async function muatTema() {
            try {
                const tersimpan = await AsyncStorage.getItem(KUNCI_TEMA);

                if (
                    tersimpan === "terang" ||
                    tersimpan === "gelap" ||
                    tersimpan === "sistem"
                ) {
                    setModeTema(tersimpan);
                }
            } catch (error) {
                console.error("Gagal memuat pengaturan tema:", error);
            } finally {
                setTemaSiap(true);
            }
        }

        void muatTema();
    }, []);

    async function ubahTema(mode: ModeTema) {
        setModeTema(mode);
        try {
            await AsyncStorage.setItem(KUNCI_TEMA, mode);
        } catch (error) {
            console.error("Gagal menyimpan pengaturan tema:", error);
        }
    }

    const temaGelap =
        modeTema === "gelap" ||
        (modeTema === "sistem" && skemaSistem === "dark");
    return (
        <ThemeContext.Provider
            value={{ modeTema, temaGelap, ubahTema, temaSiap }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

export function useTema() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTema harus digunakan di dalam ThemeProvider.");
    }
    return context;
}
