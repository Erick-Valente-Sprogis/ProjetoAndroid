// Em: frontend/app/(app)/index.tsx

import {signOut} from "firebase/auth";
import React, {useState, useEffect, useCallback} from "react"; // Importa o useCallback
import {useAuth} from "../../context/AuthContext"; // Importa o useAuth
import {
	Alert,
	Button,
	StyleSheet,
	Text,
	View,
	FlatList,
	ActivityIndicator,
} from "react-native";
import {auth} from "../../firebaseConfig";
import api from "../../src/services/api";

type NotaFiscal = {
	id: string;
	numero_nf: string;
	valor_total: number;
	emitente_nome: string;
};

// O tipo UserProfile não é mais necessário aqui, já vem do useAuth

export default function DashboardScreen() {
	// 1. Pega o user e o profile do Context!
	const {user, profile} = useAuth();

	const [notas, setNotas] = useState<NotaFiscal[]>([]);
	const [loading, setLoading] = useState(true);

	// 2. 'fetchNotas' agora usa 'useCallback'
	const fetchNotas = useCallback(async () => {
		if (!user) return; // 'user' agora vem do useAuth
		setLoading(true);
		try {
			const token = await user.getIdToken();
			const response = await api.get("/notas", {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			setNotas(response.data);
		} catch (error) {
			console.error("Erro ao buscar notas:", error);
			Alert.alert("Erro", "Não foi possível buscar as notas fiscais.");
		} finally {
			setLoading(false);
		}
	}, [user]); // 'user' é a dependência

	// 3. 'useEffect' agora está 100% correto
	useEffect(() => {
		if (user) {
			fetchNotas();
		}
	}, [user, fetchNotas]);

	const handleLogout = () => {
		signOut(auth);
	};

	// 4. Função (placeholder) para o Admin
	const handleScanPress = () => {
		Alert.alert("Admin", "TODO: Implementar scanner e upload!");
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Dashboard de Notas</Text>

			{/* 5. Mostra o nome do perfil ou o e-mail */}
			<Text style={styles.emailText}>
				Olá, {profile ? profile.fullName : user?.email}
			</Text>

			{/* 6. AQUI! O botão de Admin que só aparece se o 'role' for 'admin' */}
			{profile?.role === "admin" && (
				<View style={styles.adminButton}>
					<Button title="Escanear Nova NF" onPress={handleScanPress} />
				</View>
			)}

			{loading ? (
				<ActivityIndicator size="large" color="#007BFF" />
			) : (
				<FlatList
					data={notas}
					keyExtractor={(item) => item.id}
					renderItem={({item}) => (
						<View style={styles.notaItem}>
							<Text style={styles.notaNumero}>{item.numero_nf}</Text>
							<Text>{item.emitente_nome}</Text>
							<Text style={styles.notaValor}>
								R$ {item.valor_total.toFixed(2)}
							</Text>
						</View>
					)}
					ListEmptyComponent={
						<Text style={styles.emptyText}>
							Nenhuma nota fiscal encontrada.
						</Text>
					}
				/>
			)}

			<View style={styles.logoutButton}>
				<Button title="Sair (Logout)" color="#d9534f" onPress={handleLogout} />
			</View>
		</View>
	);
}

// 7. Adiciona o 'adminButton' aos estilos
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
		marginBottom: 20,
	},
	adminButton: {
		// Estilo para o botão de admin
		marginBottom: 20,
		marginHorizontal: 40,
	},
	logoutButton: {paddingTop: 20},
	emptyText: {textAlign: "center", marginTop: 50, color: "gray"},
	notaItem: {
		backgroundColor: "white",
		padding: 15,
		borderRadius: 8,
		marginBottom: 10,
		elevation: 2,
		shadowColor: "#000",
		shadowOffset: {width: 0, height: 1},
		shadowOpacity: 0.22,
		shadowRadius: 2.22,
	},
	notaNumero: {
		fontSize: 18,
		fontWeight: "bold",
	},
	notaValor: {
		fontSize: 16,
		fontWeight: "bold",
		color: "#28a745",
		marginTop: 5,
		textAlign: "right",
	},
});
