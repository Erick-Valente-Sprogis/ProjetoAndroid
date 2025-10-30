// Em: frontend/app/(app)/index.tsx

import {signOut} from "firebase/auth";
import React, {useState, useEffect, useCallback} from "react";
import {useAuth} from "../../context/AuthContext";
import {
	Alert,
	Button,
	StyleSheet,
	Text,
	View,
	FlatList,
	ActivityIndicator,
	Modal, // 1. Importe o Modal
	TextInput, // 2. Importe o TextInput
} from "react-native";
import {auth} from "../../firebaseConfig";
import api from "../../src/services/api";
import * as DocumentPicker from "expo-document-picker"; // 3. Importe o Document Picker

// ... (seu tipo NotaFiscal está ótimo) ...
type NotaFiscal = {
	id: string;
	numero_nf: string;
	valor_total: number;
	emitente_nome: string;
};

export default function DashboardScreen() {
	const {user, profile} = useAuth();
	const [notas, setNotas] = useState<NotaFiscal[]>([]);
	const [loading, setLoading] = useState(true);

	// --- ESTADOS PARA O NOVO MODAL DE UPLOAD ---
	const [modalVisible, setModalVisible] = useState(false);
	const [isUploading, setIsUploading] = useState(false);

	// Estados para o formulário
	const [chaveAcesso, setChaveAcesso] = useState("");
	const [numeroNf, setNumeroNf] = useState("");
	const [dataEmissao, setDataEmissao] = useState(""); // Formato: AAAA-MM-DD
	const [valorTotal, setValorTotal] = useState("");
	const [pickedDocument, setPickedDocument] =
		useState<DocumentPicker.DocumentPickerAsset | null>(null);
	// ------------------------------------------

	const fetchNotas = useCallback(async () => {
		// ... (sua função fetchNotas está perfeita, sem mudanças) ...
		if (!user) return;
		setLoading(true);
		try {
			const token = await user.getIdToken();
			const response = await api.get("/notas", {
				headers: {Authorization: `Bearer ${token}`},
			});
			setNotas(response.data);
		} catch (error) {
			console.error("Erro ao buscar notas:", error);
			Alert.alert("Erro", "Não foi possível buscar as notas fiscais.");
		} finally {
			setLoading(false);
		}
	}, [user]);

	useEffect(() => {
		if (user) {
			fetchNotas();
		}
	}, [user, fetchNotas]);

	const handleLogout = () => {
		signOut(auth);
	};

	// --- NOVAS FUNÇÕES PARA O UPLOAD ---

	// 1. Abre o seletor de arquivos PDF
	const handlePickDocument = async () => {
		try {
			const result = await DocumentPicker.getDocumentAsync({
				type: "application/pdf",
				copyToCacheDirectory: true, // 1. GARANTA QUE ESTA LINHA ESTÁ 'true' E SALVA
			});

			if (result.assets && result.assets.length > 0) {
				const asset = result.assets[0]; // Pega o arquivo

				// 2. ADICIONE ESTA LINHA DE DIAGNÓSTICO:
				console.log(">>>> URI DO ARQUIVO SELECIONADO:", asset.uri);

				setPickedDocument(asset);
				Alert.alert("Sucesso", `Arquivo selecionado: ${asset.name}`);
			} else {
				console.log("Usuário cancelou a seleção.");
			}
		} catch (error) {
			console.error("Erro ao selecionar documento:", error);
			Alert.alert("Erro", "Não foi possível selecionar o arquivo.");
		}
	};

	// 2. Envia o formulário completo para o backend
	const handleUploadNota = async () => {
		if (
			!pickedDocument ||
			!chaveAcesso ||
			!numeroNf ||
			!dataEmissao ||
			!valorTotal ||
			!user
		) {
			Alert.alert(
				"Erro",
				"Por favor, preencha todos os campos e selecione um PDF."
			);
			return;
		}

		setIsUploading(true);

		// 1. O FormData é montado da mesma forma
		const formData = new FormData();
		formData.append("chave_acesso", chaveAcesso);
		formData.append("numero_nf", numeroNf);
		formData.append("data_emissao", dataEmissao);
		formData.append("valor_total", valorTotal);
		formData.append("pdf", {
			uri: pickedDocument.uri,
			name: pickedDocument.name,
			type: pickedDocument.mimeType || "application/pdf",
		} as any);

		try {
			// 2. Pegamos o token e a URL da API
			const token = await user.getIdToken();
			const apiUrl = `${api.defaults.baseURL}/notas`; // Pega a URL do seu 'api.ts' (ex: http://192.168.1.7:3000/notas)

			// 3. AQUI ESTÁ A MUDANÇA: Usando 'fetch'
			const response = await fetch(apiUrl, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
					// NÃO definimos o 'Content-Type' aqui. O fetch faz isso sozinho.
				},
				body: formData, // O fetch entende o FormData nativamente
			});

			// 4. Tratamento da resposta do 'fetch'
			if (!response.ok) {
				// Se a resposta não for 2xx (ex: 400, 404, 500)
				const errorData = await response.json(); // Tenta ler a mensagem de erro do backend
				throw new Error(
					errorData.message || `Erro no servidor: ${response.status}`
				);
			}

			// Se a resposta for OK (201, etc.)
			const responseData = await response.json();
			// console.log("Resposta do upload:", responseData); // Opcional

			Alert.alert("Sucesso!", "Nota fiscal enviada!");
			setModalVisible(false);
			resetForm();
			fetchNotas(); // Atualiza a lista!
		} catch (error: any) {
			console.error("Erro no upload:", error.message);
			Alert.alert(
				"Erro no Upload",
				`Não foi possível enviar a nota. Detalhe: ${error.message}`
			);
		} finally {
			setIsUploading(false);
		}
	};

	// 6. Reseta o formulário após o envio
	const resetForm = () => {
		setChaveAcesso("");
		setNumeroNf("");
		setDataEmissao("");
		setValorTotal("");
		setPickedDocument(null);
	};

	// ------------------------------------

	return (
		<View style={styles.container}>
			{/* --- MODAL DE UPLOAD --- */}
			<Modal
				animationType="slide"
				transparent={true}
				visible={modalVisible}
				onRequestClose={() => setModalVisible(false)}
			>
				<View style={styles.modalOverlay}>
					<View style={styles.modalContainer}>
						<Text style={styles.modalTitle}>Adicionar Nova Nota Fiscal</Text>

						<TextInput
							style={styles.input}
							placeholder="Chave de Acesso (44 dígitos)"
							value={chaveAcesso}
							onChangeText={setChaveAcesso}
							keyboardType="numeric"
						/>
						<TextInput
							style={styles.input}
							placeholder="Número da NF"
							value={numeroNf}
							onChangeText={setNumeroNf}
							keyboardType="numeric"
						/>
						<TextInput
							style={styles.input}
							placeholder="Data de Emissão (AAAA-MM-DD)"
							value={dataEmissao}
							onChangeText={setDataEmissao}
						/>
						<TextInput
							style={styles.input}
							placeholder="Valor Total (ex: 123.45)"
							value={valorTotal}
							onChangeText={setValorTotal}
							keyboardType="numeric"
						/>

						<View style={styles.modalButtonContainer}>
							<Button
								title={pickedDocument ? "PDF Selecionado!" : "Selecionar PDF"}
								onPress={handlePickDocument}
							/>
						</View>

						<View style={styles.modalButtonContainer}>
							<Button
								title="Cancelar"
								color="#d9534f"
								onPress={() => setModalVisible(false)}
							/>
							<Button
								title={isUploading ? "Enviando..." : "Enviar"}
								onPress={handleUploadNota}
								disabled={isUploading}
							/>
						</View>
					</View>
				</View>
			</Modal>
			{/* --- FIM DO MODAL --- */}

			<Text style={styles.title}>Dashboard de Notas</Text>

			<Text style={styles.emailText}>
				Olá, {profile ? profile.fullName : user?.email}
			</Text>

			{/* O botão de Admin agora abre o Modal! */}
			{profile?.role === "admin" && (
				<View style={styles.adminButton}>
					<Button
						title="Adicionar Nova NF"
						onPress={() => setModalVisible(true)}
					/>
				</View>
			)}

			{loading ? (
				<ActivityIndicator size="large" color="#007BFF" />
			) : (
				<FlatList
					// ... (seu FlatList está perfeito, sem mudanças) ...
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

// --- NOVOS ESTILOS PARA O MODAL ---
const styles = StyleSheet.create({
	container: {flex: 1, padding: 20, backgroundColor: "#f5f5ff"},
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
	// Estilos do Modal
	modalOverlay: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(0, 0, 0, 0.5)",
	},
	modalContainer: {
		width: "90%",
		backgroundColor: "white",
		borderRadius: 10,
		padding: 20,
		alignItems: "stretch", // Alinha os campos
	},
	modalTitle: {
		fontSize: 22,
		fontWeight: "bold",
		marginBottom: 20,
		textAlign: "center",
	},
	input: {
		height: 50,
		borderColor: "#ccc",
		borderWidth: 1,
		borderRadius: 8,
		paddingHorizontal: 10,
		backgroundColor: "#fff",
		marginBottom: 15,
	},
	modalButtonContainer: {
		flexDirection: "row",
		justifyContent: "space-around",
		marginTop: 20,
	},
});
