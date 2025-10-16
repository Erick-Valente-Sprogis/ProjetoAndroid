// primeiro/app/_layout.tsx
import {Stack, useRouter, useSegments} from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import {useCallback, useEffect, useState} from "react";
import {View} from "react-native";
import {AuthProvider, useAuth} from "../context/AuthContext";

// Mantém a tela de splash visível enquanto fazemos as checagens
SplashScreen.preventAutoHideAsync();

const InitialLayout = () => {
	const {user} = useAuth();
	const segments = useSegments();
	const router = useRouter();
	const [appReady, setAppReady] = useState(false);

	useEffect(() => {
		const inAuthGroup = segments[0] === "(auth)";

		if (user === null || user) {
			// Se o status do usuário (logado ou não) já foi determinado,
			// podemos considerar o app pronto para a lógica de navegação.
			setAppReady(true);
		}

		if (!appReady) return;

		if (user && inAuthGroup) {
			router.replace("/(app)");
		} else if (!user && !inAuthGroup) {
			router.replace("/(auth)/login");
		}
	}, [user, segments, appReady, router]);

	// Esta função esconde a tela de splash APENAS quando o layout raiz for renderizado
	const onLayoutRootView = useCallback(async () => {
		if (appReady) {
			await SplashScreen.hideAsync();
		}
	}, [appReady]);

	if (!appReady) {
		return null; // ou um componente de loading <ActivityIndicator />
	}

	return (
		<View style={{flex: 1}} onLayout={onLayoutRootView}>
			<Stack screenOptions={{headerShown: false}} />
		</View>
	);
};

export default function RootLayout() {
	return (
		<AuthProvider>
			<InitialLayout />
		</AuthProvider>
	);
}
