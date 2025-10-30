// Em: frontend/app/_layout.tsx

import {Stack, useRouter, useSegments} from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import {useCallback, useEffect} from "react";
import {View} from "react-native";
import {AuthProvider, useAuth} from "../context/AuthContext";

SplashScreen.preventAutoHideAsync();

const InitialLayout = () => {
	// 1. Pega 'user' e 'isLoading' do nosso novo Context
	const {user, isLoading} = useAuth();
	const segments = useSegments();
	const router = useRouter();

	useEffect(() => {
		// 2. Se estiver carregando, não faz nada
		if (isLoading) return;

		const inAuthGroup = segments[0] === "(auth)";

		// 3. Lógica de redirecionamento
		if (user && inAuthGroup) {
			router.replace("/(app)");
		} else if (!user && !inAuthGroup) {
			router.replace("/(auth)/login");
		}
	}, [user, isLoading, segments, router]); // Agora depende do 'isLoading'

	// 4. Esconde o splash apenas quando o 'isLoading' for false
	const onLayoutRootView = useCallback(async () => {
		if (!isLoading) {
			await SplashScreen.hideAsync();
		}
	}, [isLoading]);

	// 5. Se estiver carregando, retorna null (mostra o splash)
	if (isLoading) {
		return null;
	}

	// 6. Carregamento concluído, mostra o app
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
