// Cole este código completo em: frontend/app/(app)/index.tsx

import {signOut} from "firebase/auth";
import React, {useState, useEffect} from "react";
import {Alert, Button, StyleSheet, Switch, Text, View} from "react-native";
import {setStringAsync} from "expo-clipboard";
import {auth} from "../../firebaseConfig";

export default function ProfileScreen() {
	const [isMfaEnabled, setIsMfaEnabled] = useState(false);
	// --- NOVO ESTADO PARA A NOTIFICAÇÃO ---
	const [notification, setNotification] = useState("");
	const user = auth.currentUser;

	// Efeito para limpar a notificação após alguns segundos
	useEffect(() => {
		if (notification) {
			const timer = setTimeout(() => {
				setNotification("");
			}, 3000); // A notificação some após 3 segundos
			return () => clearTimeout(timer);
		}
	}, [notification]);

	const handleLogout = () => {
		signOut(auth);
	};
	const handleToggleMfa = () => {
		/* ... sua função MFA ... */
	};

	const showToken = async () => {
		const user = auth.currentUser;
		if (user) {
			try {
				const token = await user.getIdToken(true);
				await setStringAsync(token);

				// --- EM VEZ DE ALERT, USAMOS O NOSSO ESTADO DE NOTIFICAÇÃO ---
				setNotification("Token copiado para a área de transferência!");
			} catch (error) {
				console.error("Erro ao obter ou copiar token:", error);
				setNotification("Erro ao copiar o token.");
			}
		}
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Meu Perfil</Text>
			{/* ... resto do seu JSX de perfil ... */}
			<Text style={styles.emailText}>
				{user ? user.email : "Carregando..."}
			</Text>

			<View style={styles.section}>
				<Text style={styles.sectionTitle}>Configurações de Conta</Text>

				<View style={styles.settingRow}>
					<Text>Autenticação de Dois Fatores (MFA)</Text>
					<Switch
						trackColor={{false: "#767577", true: "#81b0ff"}}
						thumbColor={isMfaEnabled ? "#007BFF" : "#f4f3f4"}
						onValueChange={handleToggleMfa}
						value={isMfaEnabled}
					/>
				</View>

				<Button title="Mostrar Token" onPress={showToken} />
				<Button
					title="Editar Perfil"
					onPress={() => Alert.alert("A Fazer", "Tela de edição de perfil.")}
				/>
			</View>

			<View style={styles.logoutButton}>
				<Button title="Sair (Logout)" color="#d9534f" onPress={handleLogout} />
			</View>

			{/* --- NOSSO COMPONENTE DE NOTIFICAÇÃO --- */}
			{notification ? (
				<View style={styles.notificationContainer}>
					<Text style={styles.notificationText}>{notification}</Text>
				</View>
			) : null}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {flex: 1, padding: 20, backgroundColor: "#f5f5f5"},
	title: {
		fontSize: 28,
		fontWeight: "bold",
		textAlign: "center",
		marginBottom: 10,
	},
	emailText: {
		fontSize: 16,
		textAlign: "center",
		color: "gray",
		marginBottom: 30,
	},
	section: {marginBottom: 30},
	sectionTitle: {
		fontSize: 20,
		fontWeight: "bold",
		marginBottom: 15,
		borderBottomWidth: 1,
		borderBottomColor: "#ddd",
		paddingBottom: 5,
	},
	settingRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: 15,
	},
	logoutButton: {marginTop: "auto", paddingBottom: 20},

	// --- NOVOS ESTILOS PARA A NOTIFICAÇÃO ---
	notificationContainer: {
		position: "absolute",
		bottom: 50,
		left: 20,
		right: 20,
		backgroundColor: "#333",
		borderRadius: 8,
		padding: 15,
		alignItems: "center",
	},
	notificationText: {
		color: "white",
		fontSize: 16,
	},
});
