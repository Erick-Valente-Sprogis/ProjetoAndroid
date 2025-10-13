import {signOut} from "firebase/auth";
import React, {useState} from "react";
import {Alert, Button, StyleSheet, Switch, Text, View} from "react-native";
import {auth} from "../../firebaseConfig"; // Verifique se o caminho está correto

export default function ProfileScreen() {
	const [isMfaEnabled, setIsMfaEnabled] = useState(false);
	const user = auth.currentUser;

	const handleLogout = () => {
		signOut(auth);
		// O observer no _layout.tsx cuidará do redirecionamento para o login
	};

	const handleToggleMfa = () => {
		// Lógica futura para habilitar/desabilitar MFA
		const futureState = !isMfaEnabled;
		setIsMfaEnabled(futureState);
		if (futureState) {
			Alert.alert(
				"MFA Ativado",
				"Em uma versão futura, aqui você iniciaria o fluxo de cadastro de telefone."
			);
		} else {
			Alert.alert(
				"MFA Desativado",
				"Em uma versão futura, aqui você removeria o segundo fator."
			);
		}
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Meu Perfil</Text>
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

				<Button
					title="Editar Perfil"
					onPress={() => Alert.alert("A Fazer", "Tela de edição de perfil.")}
				/>
			</View>

			<View style={styles.logoutButton}>
				<Button title="Sair (Logout)" color="#d9534f" onPress={handleLogout} />
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		backgroundColor: "#f5f5f5",
	},
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
	section: {
		marginBottom: 30,
	},
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
	logoutButton: {
		marginTop: "auto", // Empurra o botão para o final da tela
		paddingBottom: 20,
	},
});
