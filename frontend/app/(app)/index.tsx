import {signOut} from "firebase/auth";
import React, {useState, useEffect} from "react";
import {useRouter} from "expo-router";
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
import api from "../../src/services/api"; // Importando nosso cliente de API

// Definindo um tipo para nossas Notas Fiscais para usar com TypeScript
type NotaFiscal = {
	id: string;
	numero_nf: string;
	valor_total: number;
	emitente_nome: string;
};

type UserProfile = {
	id: string;
	uid: string;
	email: string;
	fullName: string;
	role: "user" | "admin";
	// ... outros campos
};

export default function DashboardScreen() {
	const user = auth.currentUser;
	const [notas, setNotas] = useState<NotaFiscal[]>([]);
	const [loading, setLoading] = useState(true);

	const fetchNotas = async () => {
		if (!user) return;
		setLoading(true);
		try {
			// Pega o token de autenticação do usuário logado
			const token = await user.getIdToken();

			// Faz a chamada para a API, enviando o token no cabeçalho
			const response = await api.get("/notas", {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			// Atualiza o estado com as notas recebidas do backend
			setNotas(response.data);
		} catch (error) {
			console.error("Erro ao buscar notas:", error);
			Alert.alert("Erro", "Não foi possível buscar as notas fiscais.");
		} finally {
			setLoading(false);
		}
	};

	// useEffect para chamar a função fetchNotas assim que a tela for montada
	useEffect(() => {
		fetchNotas();
	}, [user]); // Roda a função sempre que o objeto 'user' mudar

	const handleLogout = () => {
		signOut(auth);
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Dashboard de Notas</Text>
			<Text style={styles.emailText}>
				{user ? user.email : "Carregando..."}
			</Text>

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
	logoutButton: {paddingTop: 20},
	emptyText: {textAlign: "center", marginTop: 50, color: "gray"},
	notaItem: {
		backgroundColor: "white",
		padding: 15,
		borderRadius: 8,
		marginBottom: 10,
		elevation: 2, // Sombra para Android
		shadowColor: "#000", // Sombra para iOS
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
