// Em: frontend/app/(app)/perfil.tsx

import React, {useState} from "react"; // Remova 'useRouter' por enquanto
import {useAuth} from "../../context/AuthContext";
import {signOut} from "firebase/auth";
import {
	StyleSheet,
	Text,
	View,
	Alert,
	ScrollView,
	StatusBar,
	Platform,
	Pressable,
	ActivityIndicator,
} from "react-native";
import {auth} from "../../firebaseConfig";
import {Ionicons} from "@expo/vector-icons";
// Não precisamos do 'useRouter' para este teste

export default function PerfilScreen() {
	const {user, profile} = useAuth();
	// 'isLoggingOut' não é necessário para o teste
	// const [isLoggingOut, setIsLoggingOut] = useState(false);

	// MANTENHA A VERSÃO DE TESTE SIMPLES DO 'handleLogout'
	const handleLogout = () => {
		Alert.alert(
			"TESTE DE CLIQUE",
			"O botão 'Sair da Conta' FOI CLICADO e a função 'handleLogout' foi chamada."
		);
	};

	// 'isLoggingOut' não é necessário para o teste
	// if (isLoggingOut) { ... }

	return (
		<View style={styles.container}>
			<StatusBar barStyle="light-content" backgroundColor="#1E4369" />

			<View style={styles.appBar}>
				<Text style={styles.appBarTitle}>Perfil</Text>
			</View>

			{/* AQUI ESTÁ A CORREÇÃO! */}
			<ScrollView keyboardShouldPersistTaps="handled">
				{/* Header do Perfil */}
				<View style={styles.profileHeader}>
					{/* ... (conteúdo do header) ... */}
					<View style={styles.avatar}>
						<Text style={styles.avatarText}>
							{profile?.fullName?.charAt(0).toUpperCase() ||
								user?.email?.charAt(0).toUpperCase() ||
								"U"}
						</Text>
					</View>
					<Text style={styles.userName}>
						{profile?.fullName || user?.email?.split("@")[0] || "Usuário"}
					</Text>
					<Text style={styles.userEmail}>{user?.email}</Text>
					{profile?.role === "admin" && (
						<View style={styles.adminBadge}>
							<Ionicons name="shield-checkmark" size={16} color="#FF9800" />
							<Text style={styles.adminBadgeText}>Administrador</Text>
						</View>
					)}
				</View>

				{/* Informações da Conta */}
				<View style={styles.section}>
					{/* ... (conteúdo de Informações) ... */}
					<Text style={styles.sectionTitle}>INFORMAÇÕES DA CONTA</Text>
					<View style={styles.infoCard}>{/* ...infoRows... */}</View>
				</View>

				{/* Ações */}
				<View style={styles.section}>
					{/* ... (conteúdo de Ações) ... */}
					<Text style={styles.sectionTitle}>AÇÕES</Text>
					<Pressable
						style={styles.actionButton}
						android_ripple={{color: "rgba(30, 67, 105, 0.1)"}}
					>
						{/* ... */}
					</Pressable>
					{/* ...outros botões de ação... */}
				</View>

				{/* Sobre */}
				<View style={styles.section}>
					{/* ... (conteúdo de Sobre) ... */}
					<Text style={styles.sectionTitle}>SOBRE</Text>
					<Pressable
						style={styles.actionButton}
						android_ripple={{color: "rgba(30, 67, 105, 0.1)"}}
					>
						{/* ... */}
					</Pressable>
					{/* ...outros botões de sobre... */}
				</View>

				{/* O BOTÃO DE LOGOUT VOLTOU PARA DENTRO DO SCROLLVIEW */}
				<Pressable
					style={styles.logoutButton}
					onPress={handleLogout}
					android_ripple={{color: "rgba(244, 67, 54, 0.2)"}}
				>
					<Ionicons name="log-out-outline" size={24} color="#F44336" />
					<Text style={styles.logoutButtonText}>Sair da Conta</Text>
				</Pressable>

				<Text style={styles.versionText}>Versão 1.0.0</Text>
			</ScrollView>
			{/* O ScrollView fecha aqui, com o botão dentro dele */}
		</View>
	);
}

// OS ESTILOS ORIGINAIS (COM O 'logoutButtonText' QUE EU ESQUECI ANTES)
const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#F5F5F5",
	},
	// ... (todos os seus outros estilos, .appBar, .profileHeader, .avatar, etc.) ...
	// ... (infoCard, actionButton, etc.) ...

	// O estilo do botão de logout (como estava antes)
	logoutButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#FFFFFF",
		marginHorizontal: 16,
		marginTop: 16, // A margem superior é importante
		padding: 16,
		borderRadius: 8,
		elevation: 2,
		gap: 12,
	},

	// O estilo que eu tinha esquecido de adicionar
	logoutButtonText: {
		fontSize: 16,
		fontWeight: "600",
		color: "#F44336",
	},

	versionText: {
		textAlign: "center",
		fontSize: 12,
		color: "#9E9E9E",
		paddingVertical: 24,
	},

	// Estilos de loading (deixe-os aqui para quando formos reativar)
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#F5F5F5",
	},
	loadingText: {
		marginTop: 16,
		fontSize: 16,
		color: "#757575",
	},
	// ... (o resto dos seus estilos, .appBar, .profileHeader, .avatar, etc.) ...
	// ... (só colei aqui os que são relevantes para o bug) ...
	appBar: {
		backgroundColor: "#1E4369",
		paddingTop: Platform.OS === "android" ? StatusBar.currentHeight || 0 : 44,
		paddingHorizontal: 16,
		paddingBottom: 16,
		elevation: 4,
	},
	appBarTitle: {
		fontSize: 20,
		fontWeight: "500",
		color: "#FFFFFF",
	},
	profileHeader: {
		backgroundColor: "#FFFFFF",
		alignItems: "center",
		paddingVertical: 32,
		marginBottom: 16,
		elevation: 2,
	},
	avatar: {
		width: 80,
		height: 80,
		borderRadius: 40,
		backgroundColor: "#1E4369",
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 16,
	},
	avatarText: {
		fontSize: 32,
		fontWeight: "bold",
		color: "#FFFFFF",
	},
	userName: {
		fontSize: 20,
		fontWeight: "600",
		color: "#212121",
		marginBottom: 4,
	},
	userEmail: {
		fontSize: 14,
		color: "#757575",
		marginBottom: 12,
	},
	adminBadge: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#FFF3E0",
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 16,
		gap: 6,
	},
	adminBadgeText: {
		fontSize: 12,
		fontWeight: "600",
		color: "#FF9800",
	},
	section: {
		marginBottom: 16,
	},
	sectionTitle: {
		fontSize: 12,
		fontWeight: "600",
		color: "#757575",
		paddingHorizontal: 16,
		paddingVertical: 12,
	},
	infoCard: {
		backgroundColor: "#FFFFFF",
		elevation: 2,
	},
	infoRow: {
		flexDirection: "row",
		alignItems: "center",
		padding: 16,
	},
	infoIcon: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: "#E3F2FD",
		justifyContent: "center",
		alignItems: "center",
		marginRight: 16,
	},
	infoContent: {
		flex: 1,
	},
	infoLabel: {
		fontSize: 12,
		color: "#757575",
		marginBottom: 4,
	},
	infoValue: {
		fontSize: 16,
		color: "#212121",
		fontWeight: "500",
	},
	divider: {
		height: 1,
		backgroundColor: "#E0E0E0",
		marginLeft: 72,
	},
	actionButton: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#FFFFFF",
		padding: 16,
		borderBottomWidth: 1,
		borderBottomColor: "#E0E0E0",
	},
	actionButtonText: {
		flex: 1,
		fontSize: 16,
		color: "#212121",
		marginLeft: 16,
	},
});
