// Em: frontend/app/(app)/_layout.tsx

import React from "react";
import {Tabs} from "expo-router"; // 1. Importe o <Tabs> do Expo Router
import {Ionicons} from "@expo/vector-icons";
import {useAuth} from "../../context/AuthContext";

export default function AppLayout() {
	const {profile} = useAuth();
	const isAdmin = profile?.role === "admin";

	return (
		// 2. Use o <Tabs> em vez do <Tab.Navigator>
		<Tabs
			screenOptions={({route}) => ({
				headerShown: false,
				tabBarIcon: ({focused, color, size}) => {
					let iconName: any; // O 'any' é mantido para consistência com o seu código

					if (route.name === "index") {
						// 'dashboard' vira 'index'
						iconName = focused ? "home" : "home-outline";
					} else if (route.name === "notas") {
						iconName = focused ? "documents" : "documents-outline";
					} else if (route.name === "perfil") {
						iconName = focused ? "person" : "person-outline";
					} else if (route.name === "admin") {
						iconName = focused ? "shield" : "shield-outline";
					}

					return <Ionicons name={iconName} size={size} color={color} />;
				},
				// 3. Estilos são aplicados aqui
				tabBarActiveTintColor: "#1E4369",
				tabBarInactiveTintColor: "#8E8E93",
				tabBarStyle: {
					height: 60,
					paddingBottom: 8,
					paddingTop: 8,
					borderTopWidth: 1,
					borderTopColor: "#E5E5EA",
					backgroundColor: "#FFFFFF",
					elevation: 8,
					shadowColor: "#000",
					shadowOffset: {width: 0, height: -2},
					shadowOpacity: 0.1,
					shadowRadius: 8,
				},
				tabBarLabelStyle: {
					fontSize: 12,
					fontWeight: "600",
				},
			})}
		>
			{/* 4. Os <Tab.Screen> viram <Tabs.Screen> */}
			<Tabs.Screen
				name="index" // O arquivo 'index.tsx' é a tela principal
				options={{
					tabBarLabel: "Início",
				}}
			/>
			<Tabs.Screen
				name="notas" // O arquivo 'notas.tsx'
				options={{
					tabBarLabel: "Notas",
				}}
			/>

			{/* 5. A tela de Admin é escondida se o 'href' for 'null' */}
			<Tabs.Screen
				name="admin" // O arquivo 'admin.tsx'
				options={{
					tabBarLabel: "Admin",
					href: isAdmin ? "/admin" : null, // Esconde a aba se não for admin
				}}
			/>

			<Tabs.Screen
				name="perfil" // O arquivo 'perfil.tsx'
				options={{
					tabBarLabel: "Perfil",
				}}
			/>
		</Tabs>
	);
}
