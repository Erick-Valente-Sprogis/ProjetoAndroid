// frontend/app/(app)/_layout.tsx - Layout Android com Bottom Navigation

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

// Importar as telas
import DashboardScreen from './index';
import NotasScreen from './notas';
import PerfilScreen from './perfil';
import AdminScreen from './admin';

const Tab = createBottomTabNavigator();

export default function AppLayout() {
	const { profile } = useAuth();
	const isAdmin = profile?.role === 'admin';

	return (
		<Tab.Navigator
			screenOptions={({ route }) => ({
				headerShown: false,
				tabBarIcon: ({ focused, color, size }) => {
					let iconName: any;

					if (route.name === 'dashboard') {
						iconName = focused ? 'home' : 'home-outline';
					} else if (route.name === 'notas') {
						iconName = focused ? 'documents' : 'documents-outline';
					} else if (route.name === 'perfil') {
						iconName = focused ? 'person' : 'person-outline';
					} else if (route.name === 'admin') {
						iconName = focused ? 'shield' : 'shield-outline';
					}

					return <Ionicons name={iconName} size={size} color={color} />;
				},
				tabBarActiveTintColor: '#1E4369',
				tabBarInactiveTintColor: '#8E8E93',
				tabBarStyle: {
					height: 60,
					paddingBottom: 8,
					paddingTop: 8,
					borderTopWidth: 1,
					borderTopColor: '#E5E5EA',
					backgroundColor: '#FFFFFF',
					elevation: 8,
					shadowColor: '#000',
					shadowOffset: { width: 0, height: -2 },
					shadowOpacity: 0.1,
					shadowRadius: 8,
				},
				tabBarLabelStyle: {
					fontSize: 12,
					fontWeight: '600',
				},
			})}
		>
			<Tab.Screen 
				name="dashboard" 
				component={DashboardScreen}
				options={{
					tabBarLabel: 'Início',
				}}
			/>
			<Tab.Screen 
				name="notas" 
				component={NotasScreen}
				options={{
					tabBarLabel: 'Notas',
				}}
			/>
			{isAdmin && (
				<Tab.Screen 
					name="admin" 
					component={AdminScreen}
					options={{
						tabBarLabel: 'Admin',
					}}
				/>
			)}
			<Tab.Screen 
				name="perfil" 
				component={PerfilScreen}
				options={{
					tabBarLabel: 'Perfil',
				}}
			/>
		</Tab.Navigator>
	);
}
