// frontend/app/(app)/_layout.tsx

import React from "react";
import {Tabs} from "expo-router";
import {Ionicons} from "@expo/vector-icons";
import {useAuth} from "../../context/AuthContext";

export default function AppLayout() {
	const {profile} = useAuth();
	const isAdmin = profile?.role === "admin";

	return (
		<Tabs
			screenOptions={({route}) => ({
				headerShown: false,
				tabBarIcon: ({focused, color, size}) => {
					let iconName: any;

					if (route.name === "index") {
						iconName = focused ? "document-text" : "document-text-outline";
					} else if (route.name === "perfil") {
						iconName = focused ? "person" : "person-outline";
					} else if (route.name === "admin") {
						iconName = focused
							? "shield-checkmark"
							: "shield-checkmark-outline";
					}

					return <Ionicons name={iconName} size={size} color={color} />;
				},
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
			{/* Tela Principal - Dashboard de Notas Fiscais */}
			<Tabs.Screen
				name="index"
				options={{
					tabBarLabel: "Notas",
				}}
			/>

			{/* Tela de Admin - Só aparece para administradores */}
			<Tabs.Screen
				name="admin"
				options={{
					tabBarLabel: "Admin",
					href: isAdmin ? "/admin" : null,
				}}
			/>

			{/* Tela de Perfil */}
			<Tabs.Screen
				name="perfil"
				options={{
					tabBarLabel: "Perfil",
				}}
			/>
		</Tabs>
	);
}
