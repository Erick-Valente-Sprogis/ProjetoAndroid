// frontend/app/(app)/index.tsx - Dashboard com Modal de Opções

import {Ionicons} from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, {useCallback, useEffect, useState} from "react";
import {
	ActivityIndicator,
	Alert,
	FlatList,
	Modal,
	Platform,
	RefreshControl,
	ScrollView,
	StatusBar,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import {useAuth} from "../../context/AuthContext";
import api from "../../src/services/api";

type NotaFiscal = {
	id: string;
	numero_nf: string;
	valor_total: number;
	emitente_nome: string;
	data_emissao: string;
	chave_acesso: string;
	foto_url?: string;
};

export default function DashboardScreen() {
	const {user, profile} = useAuth();
	const [notas, setNotas] = useState<NotaFiscal[]>([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);

	// Modal de opções
	const [optionsModalVisible, setOptionsModalVisible] = useState(false);

	// Modal de adicionar
	const [addModalVisible, setAddModalVisible] = useState(false);
	const [isUploading, setIsUploading] = useState(false);

	// Modal de edição
	const [editModalVisible, setEditModalVisible] = useState(false);
	const [editingNota, setEditingNota] = useState<NotaFiscal | null>(null);
	const [isEditing, setIsEditing] = useState(false);

	// Formulário
	const [chaveAcesso, setChaveAcesso] = useState("");
	const [numeroNf, setNumeroNf] = useState("");
	const [dataEmissao, setDataEmissao] = useState("");
	const [valorTotal, setValorTotal] = useState("");
	const [emitenteNome, setEmitenteNome] = useState("");
	const [notaFoto, setNotaFoto] = useState<string | null>(null);

	// Modal de detalhes
	const [selectedNota, setSelectedNota] = useState<NotaFiscal | null>(null);
	const [detailsVisible, setDetailsVisible] = useState(false);

	// Estatísticas
	const totalNotas = notas.length;
	const valorTotalGeral = notas.reduce(
		(acc, nota) => acc + nota.valor_total,
		0
	);

	const currentMonth = new Date().getMonth();
	const currentYear = new Date().getFullYear();
	const notasEsteMes = notas.filter((nota) => {
		const notaDate = new Date(nota.data_emissao);
		return (
			notaDate.getMonth() === currentMonth &&
			notaDate.getFullYear() === currentYear
		);
	});
	const valorEsteMes = notasEsteMes.reduce(
		(acc, nota) => acc + nota.valor_total,
		0
	);

	const fetchNotas = useCallback(async () => {
		if (!user) return;
		setLoading(true);
		try {
			const token = await user.getIdToken();
			const response = await api.get("/notas", {
				headers: {Authorization: `Bearer ${token}`},
			});
			const sortedNotas = response.data.sort(
				(a: NotaFiscal, b: NotaFiscal) =>
					new Date(b.data_emissao).getTime() -
					new Date(a.data_emissao).getTime()
			);
			setNotas(sortedNotas);
		} catch (error) {
			console.error("Erro ao buscar notas:", error);
		} finally {
			setLoading(false);
		}
	}, [user]);

	const onRefresh = useCallback(async () => {
		setRefreshing(true);
		await fetchNotas();
		setRefreshing(false);
	}, [fetchNotas]);

	useEffect(() => {
		if (user) {
			fetchNotas();
		}
	}, [user, fetchNotas]);

	const takePhoto = async () => {
		setOptionsModalVisible(false);
		const {status} = await ImagePicker.requestCameraPermissionsAsync();

		if (status !== "granted") {
			Alert.alert(
				"Permissão Negada",
				"Habilite o acesso à câmera nas configurações."
			);
			return;
		}

		const result = await ImagePicker.launchCameraAsync({
			allowsEditing: true,
			aspect: [4, 3],
			quality: 0.8,
		});

		if (!result.canceled && result.assets[0]) {
			setNotaFoto(result.assets[0].uri);
			Alert.alert("✓ Foto Capturada", "Foto anexada com sucesso!");
			setTimeout(() => setAddModalVisible(true), 500);
		}
	};

	const pickImageFromGallery = async () => {
		setOptionsModalVisible(false);
		const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync();

		if (status !== "granted") {
			Alert.alert(
				"Permissão Negada",
				"Habilite o acesso à galeria nas configurações."
			);
			return;
		}

		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			aspect: [4, 3],
			quality: 0.8,
		});

		if (!result.canceled && result.assets[0]) {
			setNotaFoto(result.assets[0].uri);
			Alert.alert("✓ Imagem Selecionada", "Foto anexada com sucesso!");
			setTimeout(() => setAddModalVisible(true), 500);
		}
	};

	const openManualForm = () => {
		setOptionsModalVisible(false);
		setAddModalVisible(true);
	};

	const showAddOptions = () => {
		setOptionsModalVisible(true);
	};

	const validateForm = () => {
		console.log("🔍 Iniciando validação...");
		console.log("🔍 chaveAcesso:", chaveAcesso, "length:", chaveAcesso.length);
		console.log("🔍 numeroNf:", numeroNf);
		console.log("🔍 dataEmissao:", dataEmissao);
		console.log("🔍 valorTotal:", valorTotal);
		console.log("🔍 emitenteNome:", emitenteNome);

		if (!chaveAcesso || chaveAcesso.length !== 44) {
			console.log("❌ FALHOU: chaveAcesso");
			if (Platform.OS === "web") {
				window.alert("A chave de acesso deve ter exatamente 44 dígitos.");
			} else {
				Alert.alert(
					"❌ Erro",
					"A chave de acesso deve ter exatamente 44 dígitos."
				);
			}
			return false;
		}
		if (!numeroNf) {
			console.log("❌ FALHOU: numeroNf");
			if (Platform.OS === "web") {
				window.alert("Informe o número da Nota Fiscal.");
			} else {
				Alert.alert("❌ Erro", "Informe o número da Nota Fiscal.");
			}
			return false;
		}
		if (!dataEmissao || !/^\d{4}-\d{2}-\d{2}$/.test(dataEmissao)) {
			console.log("❌ FALHOU: dataEmissao");
			if (Platform.OS === "web") {
				window.alert(
					"Data inválida. Use o formato AAAA-MM-DD\nExemplo: 2025-11-09"
				);
			} else {
				Alert.alert(
					"❌ Erro",
					"Data inválida. Use o formato AAAA-MM-DD\nExemplo: 2025-11-09"
				);
			}
			return false;
		}

		const valorNumerico = Number(valorTotal.replace(",", "."));

		if (!valorTotal || isNaN(valorNumerico) || valorNumerico <= 0) {
			console.log("❌ FALHOU: valorTotal");
			if (Platform.OS === "web") {
				window.alert("Informe um valor total válido.");
			} else {
				Alert.alert("❌ Erro", "Informe um valor total válido.");
			}
			return false;
		}
		if (!emitenteNome) {
			console.log("❌ FALHOU: emitenteNome");
			if (Platform.OS === "web") {
				window.alert("Informe o nome do emitente.");
			} else {
				Alert.alert("❌ Erro", "Informe o nome do emitente.");
			}
			return false;
		}

		console.log("✅ Validação OK!");
		return true;
	};

	const handleAddNota = async () => {
		console.log("🟡 1. handleAddNota CHAMADO!");

		if (!validateForm() || !user) {
			console.log("❌ Validação falhou ou user null");
			return;
		}

		console.log("🟡 2. Validação OK, iniciando upload...");
		setIsUploading(true);

		const valorFormatado = valorTotal.replace(",", ".");

		const formData = new FormData();
		formData.append("chave_acesso", chaveAcesso);
		formData.append("numero_nf", numeroNf);
		formData.append("data_emissao", dataEmissao);
		formData.append("valor_total", valorFormatado);
		formData.append("emitente_nome", emitenteNome);

		if (notaFoto) {
			console.log("🟡 3. Anexando foto...");
			const filename = notaFoto.split("/").pop() || "nota.jpg";
			formData.append("foto", {
				uri: notaFoto,
				name: filename,
				type: "image/jpeg",
			} as any);
		}

		try {
			console.log("🟡 4. Buscando token...");
			const token = await user.getIdToken();
			console.log("🟡 5. Token obtido, fazendo POST...");

			const apiUrl = `${api.defaults.baseURL}/notas`;
			console.log("🟡 6. URL:", apiUrl);

			const response = await fetch(apiUrl, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
				},
				body: formData,
			});

			console.log("🟡 7. Response status:", response.status);

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || `Erro: ${response.status}`);
			}

			console.log("✅ 8. Nota criada com sucesso!");

			if (Platform.OS === "web") {
				window.alert("✅ Nota fiscal adicionada com sucesso!");
			} else {
				Alert.alert("✅ Sucesso!", "Nota fiscal adicionada com sucesso!");
			}

			setAddModalVisible(false);
			resetForm();
			fetchNotas();
		} catch (error: any) {
			console.error("❌ Erro ao adicionar nota:", error.message);

			if (Platform.OS === "web") {
				window.alert(`Erro: ${error.message}`);
			} else {
				Alert.alert(
					"❌ Erro",
					`Não foi possível adicionar a nota:\n${error.message}`
				);
			}
		} finally {
			setIsUploading(false);
			console.log("🟡 9. Finalizou handleAddNota");
		}
	};

	const handleEditNota = async () => {
		console.log("🟡 1. handleEditNota CHAMADO!");

		if (!validateForm() || !user || !editingNota) {
			console.log("❌ Validação falhou ou dados faltando");
			return;
		}

		console.log("🟡 2. Validação OK, iniciando atualização...");
		setIsEditing(true);

		const valorFormatado = valorTotal.replace(",", ".");

		const formData = new FormData();
		formData.append("chave_acesso", chaveAcesso);
		formData.append("numero_nf", numeroNf);
		formData.append("data_emissao", dataEmissao);
		formData.append("valor_total", valorFormatado);
		formData.append("emitente_nome", emitenteNome);

		if (notaFoto && notaFoto.startsWith("file://")) {
			console.log("🟡 3. Anexando nova foto...");
			const filename = notaFoto.split("/").pop() || "nota.jpg";
			formData.append("foto", {
				uri: notaFoto,
				name: filename,
				type: "image/jpeg",
			} as any);
		}

		try {
			console.log("🟡 4. Buscando token...");
			const token = await user.getIdToken();
			console.log("🟡 5. Token obtido, fazendo PUT...");

			const apiUrl = `${api.defaults.baseURL}/notas/${editingNota.id}`;
			console.log("🟡 6. URL:", apiUrl);

			const response = await fetch(apiUrl, {
				method: "PUT",
				headers: {
					Authorization: `Bearer ${token}`,
				},
				body: formData,
			});

			console.log("🟡 7. Response status:", response.status);

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || `Erro: ${response.status}`);
			}

			console.log("✅ 8. Nota atualizada com sucesso!");

			if (Platform.OS === "web") {
				window.alert("✅ Nota fiscal atualizada com sucesso!");
			} else {
				Alert.alert("✅ Sucesso!", "Nota fiscal atualizada com sucesso!");
			}

			setEditModalVisible(false);
			setEditingNota(null);
			resetForm();
			fetchNotas();
		} catch (error: any) {
			console.error("❌ Erro ao atualizar nota:", error.message);

			if (Platform.OS === "web") {
				window.alert(`Erro: ${error.message}`);
			} else {
				Alert.alert(
					"❌ Erro",
					`Não foi possível atualizar a nota:\n${error.message}`
				);
			}
		} finally {
			setIsEditing(false);
			console.log("🟡 9. Finalizou handleEditNota");
		}
	};

	const handleDeleteNota = async (nota: NotaFiscal) => {
		if (!user) return;

		const confirmacao =
			Platform.OS === "web"
				? window.confirm(
						`Tem certeza que deseja deletar a nota NF ${nota.numero_nf}?\n\nEsta ação não pode ser desfeita!`
				  )
				: false;

		if (Platform.OS !== "web") {
			Alert.alert(
				"Confirmar Exclusão",
				`Tem certeza que deseja deletar a nota NF ${nota.numero_nf}?\n\nEsta ação não pode ser desfeita!`,
				[
					{
						text: "Cancelar",
						style: "cancel",
					},
					{
						text: "Deletar",
						style: "destructive",
						onPress: async () => {
							await executarDelete();
						},
					},
				]
			);
			return;
		}

		if (!confirmacao) {
			console.log("❌ Usuário cancelou a exclusão");
			return;
		}

		await executarDelete();

		async function executarDelete() {
			console.log("🗑️ 1. Iniciando deleção da nota:", nota.id);
			setDetailsVisible(false);

			try {
				console.log("🗑️ 2. Buscando token...");
				const token = await user.getIdToken();

				console.log("🗑️ 3. Fazendo DELETE...");
				await api.delete(`/notas/${nota.id}`, {
					headers: {Authorization: `Bearer ${token}`},
				});

				console.log("✅ 4. Nota deletada com sucesso!");

				if (Platform.OS === "web") {
					window.alert("✅ Nota fiscal deletada com sucesso!");
				} else {
					Alert.alert("✅ Sucesso!", "Nota fiscal deletada com sucesso!");
				}

				fetchNotas();
			} catch (error: any) {
				console.error("❌ Erro ao deletar nota:", error.message);

				if (Platform.OS === "web") {
					window.alert(`Erro ao deletar nota: ${error.message}`);
				} else {
					Alert.alert(
						"❌ Erro",
						`Não foi possível deletar a nota:\n${error.message}`
					);
				}
			}
		}
	};

	const resetForm = () => {
		setChaveAcesso("");
		setNumeroNf("");
		setDataEmissao("");
		setValorTotal("");
		setEmitenteNome("");
		setNotaFoto(null);
	};

	const openEditModal = (nota: NotaFiscal) => {
		setEditingNota(nota);
		setChaveAcesso(nota.chave_acesso);
		setNumeroNf(nota.numero_nf);
		setEmitenteNome(nota.emitente_nome);

		const date = new Date(nota.data_emissao);
		const formattedDate = date.toISOString().split("T")[0];
		setDataEmissao(formattedDate);

		setValorTotal(nota.valor_total.toString().replace(".", ","));

		if (nota.foto_url) {
			setNotaFoto(
				`${api.defaults.baseURL.replace("/api", "")}/uploads/${nota.foto_url}`
			);
		} else {
			setNotaFoto(null);
		}

		setDetailsVisible(false);
		setEditModalVisible(true);
	};

	const openDetails = (nota: NotaFiscal) => {
		setSelectedNota(nota);
		setDetailsVisible(true);
	};

	const renderNotaItem = ({item}: {item: NotaFiscal}) => (
		<TouchableOpacity
			style={styles.notaCard}
			activeOpacity={0.7}
			onPress={() => openDetails(item)}
		>
			<View style={styles.notaCardLeft}>
				<View style={styles.notaIcon}>
					<Ionicons name="receipt-outline" size={24} color="#1E4369" />
				</View>
				<View style={styles.notaInfo}>
					<View style={styles.notaHeader}>
						<Text style={styles.notaNumber}>NF {item.numero_nf}</Text>
						{item.foto_url && (
							<View style={styles.photoTag}>
								<Ionicons name="image" size={12} color="#4CAF50" />
							</View>
						)}
					</View>
					<Text style={styles.notaEmitente} numberOfLines={1}>
						{item.emitente_nome}
					</Text>
					<Text style={styles.notaDate}>
						{new Date(item.data_emissao).toLocaleDateString("pt-BR")}
					</Text>
				</View>
			</View>
			<View style={styles.notaCardRight}>
				<Text style={styles.notaValue}>R$ {item.valor_total.toFixed(2)}</Text>
				<Ionicons name="chevron-forward" size={18} color="#B0B0B0" />
			</View>
		</TouchableOpacity>
	);

	return (
		<View style={styles.container}>
			<StatusBar barStyle="light-content" backgroundColor="#1E4369" />

			<View style={styles.appBar}>
				<Text style={styles.appBarTitle}>Notas Fiscais</Text>
				<Text style={styles.appBarSubtitle}>
					{profile?.fullName || user?.email?.split("@")[0]}
				</Text>
			</View>

			<View style={styles.statsRow}>
				<View style={styles.statCardPrimary}>
					<Ionicons name="document-text" size={28} color="#1E4369" />
					<Text style={styles.statValue}>{totalNotas}</Text>
					<Text style={styles.statLabel}>Notas</Text>
				</View>
				<View style={styles.statCardSuccess}>
					<Ionicons name="cash" size={28} color="#4CAF50" />
					<Text style={styles.statValue}>R$ {valorTotalGeral.toFixed(2)}</Text>
					<Text style={styles.statLabel}>Total</Text>
				</View>
				<View style={styles.statCardWarning}>
					<Ionicons name="calendar" size={28} color="#FF9800" />
					<Text style={styles.statValue}>R$ {valorEsteMes.toFixed(2)}</Text>
					<Text style={styles.statLabel}>Este Mês</Text>
				</View>
			</View>

			{loading ? (
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color="#1E4369" />
					<Text style={styles.loadingText}>Carregando...</Text>
				</View>
			) : (
				<FlatList
					data={notas}
					keyExtractor={(item) => item.id}
					renderItem={renderNotaItem}
					refreshControl={
						<RefreshControl
							refreshing={refreshing}
							onRefresh={onRefresh}
							colors={["#1E4369"]}
						/>
					}
					ListEmptyComponent={
						<View style={styles.emptyState}>
							<Ionicons
								name="document-text-outline"
								size={64}
								color="#BDBDBD"
							/>
							<Text style={styles.emptyText}>Nenhuma nota cadastrada</Text>
							<Text style={styles.emptySubtext}>
								Toque no botão + para adicionar
							</Text>
						</View>
					}
					contentContainerStyle={styles.listContent}
				/>
			)}

			<TouchableOpacity
				style={styles.fab}
				onPress={showAddOptions}
				activeOpacity={0.8}
			>
				<Ionicons name="add" size={28} color="#FFFFFF" />
			</TouchableOpacity>

			{/* Modal de Opções */}
			<Modal
				animationType="slide"
				transparent={true}
				visible={optionsModalVisible}
				onRequestClose={() => setOptionsModalVisible(false)}
			>
				<View style={styles.modalBackdrop}>
					<View style={styles.optionsModal}>
						<View style={styles.optionsHeader}>
							<Text style={styles.optionsTitle}>Adicionar Nota Fiscal</Text>
							<TouchableOpacity onPress={() => setOptionsModalVisible(false)}>
								<Ionicons name="close" size={24} color="#757575" />
							</TouchableOpacity>
						</View>

						<TouchableOpacity style={styles.optionButton} onPress={takePhoto}>
							<View style={styles.optionIconCircle}>
								<Ionicons name="camera-outline" size={28} color="#1E4369" />
							</View>
							<View style={styles.optionTextContainer}>
								<Text style={styles.optionTitle}>Tirar Foto</Text>
								<Text style={styles.optionSubtitle}>
									Usar câmera do dispositivo
								</Text>
							</View>
							<Ionicons name="chevron-forward" size={20} color="#B0B0B0" />
						</TouchableOpacity>

						<TouchableOpacity
							style={styles.optionButton}
							onPress={pickImageFromGallery}
						>
							<View style={styles.optionIconCircle}>
								<Ionicons name="image-outline" size={28} color="#1E4369" />
							</View>
							<View style={styles.optionTextContainer}>
								<Text style={styles.optionTitle}>Escolher da Galeria</Text>
								<Text style={styles.optionSubtitle}>
									Selecionar foto existente
								</Text>
							</View>
							<Ionicons name="chevron-forward" size={20} color="#B0B0B0" />
						</TouchableOpacity>

						<TouchableOpacity
							style={styles.optionButton}
							onPress={openManualForm}
						>
							<View style={styles.optionIconCircle}>
								<Ionicons name="create-outline" size={28} color="#1E4369" />
							</View>
							<View style={styles.optionTextContainer}>
								<Text style={styles.optionTitle}>Preencher Manualmente</Text>
								<Text style={styles.optionSubtitle}>
									Digitar todos os dados
								</Text>
							</View>
							<Ionicons name="chevron-forward" size={20} color="#B0B0B0" />
						</TouchableOpacity>

						<TouchableOpacity
							style={styles.cancelOptionButton}
							onPress={() => setOptionsModalVisible(false)}
						>
							<Text style={styles.cancelOptionText}>CANCELAR</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>

			{/* Modal Adicionar */}
			<Modal
				animationType="slide"
				transparent={true}
				visible={addModalVisible}
				onRequestClose={() => setAddModalVisible(false)}
			>
				<View style={styles.modalBackdrop}>
					<View style={styles.modalContainer}>
						<View style={styles.modalHeader}>
							<Text style={styles.modalTitle}>Nova Nota Fiscal</Text>
							<TouchableOpacity onPress={() => setAddModalVisible(false)}>
								<Ionicons name="close" size={24} color="#757575" />
							</TouchableOpacity>
						</View>

						<ScrollView style={styles.modalContent}>
							{notaFoto && !editModalVisible && (
								<View style={styles.photoChip}>
									<Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
									<Text style={styles.photoChipText}>Foto anexada ✓</Text>
									<TouchableOpacity onPress={() => setNotaFoto(null)}>
										<Ionicons name="close-circle" size={20} color="#F44336" />
									</TouchableOpacity>
								</View>
							)}

							<View style={styles.inputWrapper}>
								<Text style={styles.inputLabel}>Chave de Acesso *</Text>
								<TextInput
									style={styles.input}
									placeholder="44 dígitos"
									value={chaveAcesso}
									onChangeText={setChaveAcesso}
									keyboardType="numeric"
									maxLength={44}
									placeholderTextColor="#999"
								/>
								<Text style={styles.inputHint}>{chaveAcesso.length}/44</Text>
							</View>

							<View style={styles.inputWrapper}>
								<Text style={styles.inputLabel}>Número da NF *</Text>
								<TextInput
									style={styles.input}
									placeholder="Ex: 123456"
									value={numeroNf}
									onChangeText={setNumeroNf}
									keyboardType="numeric"
									placeholderTextColor="#999"
								/>
							</View>

							<View style={styles.inputWrapper}>
								<Text style={styles.inputLabel}>Emitente *</Text>
								<TextInput
									style={styles.input}
									placeholder="Nome da empresa"
									value={emitenteNome}
									onChangeText={setEmitenteNome}
									placeholderTextColor="#999"
								/>
							</View>

							<View style={styles.inputWrapper}>
								<Text style={styles.inputLabel}>Data de Emissão *</Text>
								<TextInput
									style={styles.input}
									placeholder="AAAA-MM-DD (ex: 2025-11-09)"
									value={dataEmissao}
									onChangeText={setDataEmissao}
									placeholderTextColor="#999"
								/>
							</View>

							<View style={styles.inputWrapper}>
								<Text style={styles.inputLabel}>Valor Total *</Text>
								<TextInput
									style={styles.input}
									placeholder="Ex: 1250.50"
									value={valorTotal}
									onChangeText={setValorTotal}
									keyboardType="decimal-pad"
									placeholderTextColor="#999"
								/>
							</View>

							{!notaFoto && (
								<TouchableOpacity
									style={styles.attachButton}
									onPress={pickImageFromGallery}
								>
									<Ionicons name="image-outline" size={20} color="#1E4369" />
									<Text style={styles.attachButtonText}>
										Anexar Foto (Opcional)
									</Text>
								</TouchableOpacity>
							)}

							<View style={styles.modalActions}>
								<TouchableOpacity
									style={styles.cancelButton}
									onPress={() => {
										setAddModalVisible(false);
										resetForm();
									}}
								>
									<Text style={styles.cancelButtonText}>CANCELAR</Text>
								</TouchableOpacity>
								<TouchableOpacity
									style={[
										styles.saveButton,
										isUploading && styles.saveButtonDisabled,
									]}
									onPress={handleAddNota}
									disabled={isUploading}
								>
									{isUploading ? (
										<ActivityIndicator color="#FFF" size="small" />
									) : (
										<>
											<Ionicons
												name="checkmark-circle"
												size={18}
												color="#FFF"
											/>
											<Text style={styles.saveButtonText}>SALVAR</Text>
										</>
									)}
								</TouchableOpacity>
							</View>
						</ScrollView>
					</View>
				</View>
			</Modal>

			{/* Modal Detalhes */}
			<Modal
				animationType="slide"
				transparent={true}
				visible={detailsVisible}
				onRequestClose={() => setDetailsVisible(false)}
			>
				<View style={styles.modalBackdrop}>
					<View style={styles.detailsModal}>
						<View style={styles.modalHeader}>
							<Text style={styles.modalTitle}>Detalhes da Nota</Text>
							<TouchableOpacity onPress={() => setDetailsVisible(false)}>
								<Ionicons name="close" size={24} color="#757575" />
							</TouchableOpacity>
						</View>

						{selectedNota && (
							<ScrollView style={styles.modalContent}>
								<View style={styles.detailCard}>
									<View style={styles.detailRow}>
										<Text style={styles.detailLabel}>Número</Text>
										<Text style={styles.detailValue}>
											{selectedNota.numero_nf}
										</Text>
									</View>
									<View style={styles.divider} />
									<View style={styles.detailRow}>
										<Text style={styles.detailLabel}>Emitente</Text>
										<Text style={styles.detailValue}>
											{selectedNota.emitente_nome}
										</Text>
									</View>
									<View style={styles.divider} />
									<View style={styles.detailRow}>
										<Text style={styles.detailLabel}>Data</Text>
										<Text style={styles.detailValue}>
											{new Date(selectedNota.data_emissao).toLocaleDateString(
												"pt-BR",
												{
													day: "2-digit",
													month: "long",
													year: "numeric",
												}
											)}
										</Text>
									</View>
									<View style={styles.divider} />
									<View style={styles.detailRow}>
										<Text style={styles.detailLabel}>Valor</Text>
										<Text
											style={[styles.detailValue, styles.detailValueHighlight]}
										>
											R$ {selectedNota.valor_total.toFixed(2)}
										</Text>
									</View>
								</View>

								<View style={styles.chaveCard}>
									<Text style={styles.chaveLabel}>Chave de Acesso</Text>
									<Text style={styles.chaveValue}>
										{selectedNota.chave_acesso}
									</Text>
								</View>

								<TouchableOpacity
									style={styles.editButton}
									onPress={() => selectedNota && openEditModal(selectedNota)}
									activeOpacity={0.7}
								>
									<Ionicons name="create-outline" size={20} color="#1E4369" />
									<Text style={styles.editButtonText}>Editar Nota</Text>
								</TouchableOpacity>

								<TouchableOpacity
									style={styles.deleteButton}
									onPress={() => selectedNota && handleDeleteNota(selectedNota)}
									activeOpacity={0.7}
								>
									<Ionicons name="trash-outline" size={20} color="#F44336" />
									<Text style={styles.deleteButtonText}>Deletar Nota</Text>
								</TouchableOpacity>
							</ScrollView>
						)}
					</View>
				</View>
			</Modal>

			{/* Modal de Edição */}
			<Modal
				animationType="slide"
				transparent={true}
				visible={editModalVisible}
				onRequestClose={() => {
					setEditModalVisible(false);
					setEditingNota(null);
					resetForm();
				}}
			>
				<View style={styles.modalBackdrop}>
					<View style={styles.modalContainer}>
						<View style={styles.modalHeader}>
							<Text style={styles.modalTitle}>Editar Nota Fiscal</Text>
							<TouchableOpacity
								onPress={() => {
									setEditModalVisible(false);
									setEditingNota(null);
									resetForm();
								}}
							>
								<Ionicons name="close" size={24} color="#757575" />
							</TouchableOpacity>
						</View>

						<ScrollView style={styles.modalContent}>
							{notaFoto && (
								<View style={styles.photoChip}>
									<Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
									<Text style={styles.photoChipText}>
										{notaFoto.startsWith("http")
											? "Foto atual"
											: "Nova foto anexada"}{" "}
										✓
									</Text>
									<TouchableOpacity onPress={() => setNotaFoto(null)}>
										<Ionicons name="close-circle" size={20} color="#F44336" />
									</TouchableOpacity>
								</View>
							)}

							<View style={styles.inputWrapper}>
								<Text style={styles.inputLabel}>Chave de Acesso *</Text>
								<TextInput
									style={styles.input}
									placeholder="44 dígitos"
									value={chaveAcesso}
									onChangeText={setChaveAcesso}
									keyboardType="numeric"
									maxLength={44}
									placeholderTextColor="#999"
								/>
								<Text style={styles.inputHint}>{chaveAcesso.length}/44</Text>
							</View>

							<View style={styles.inputWrapper}>
								<Text style={styles.inputLabel}>Número da NF *</Text>
								<TextInput
									style={styles.input}
									placeholder="Ex: 123456"
									value={numeroNf}
									onChangeText={setNumeroNf}
									keyboardType="numeric"
									placeholderTextColor="#999"
								/>
							</View>

							<View style={styles.inputWrapper}>
								<Text style={styles.inputLabel}>Emitente *</Text>
								<TextInput
									style={styles.input}
									placeholder="Nome da empresa"
									value={emitenteNome}
									onChangeText={setEmitenteNome}
									placeholderTextColor="#999"
								/>
							</View>

							<View style={styles.inputWrapper}>
								<Text style={styles.inputLabel}>Data de Emissão *</Text>
								<TextInput
									style={styles.input}
									placeholder="AAAA-MM-DD (ex: 2025-11-09)"
									value={dataEmissao}
									onChangeText={setDataEmissao}
									placeholderTextColor="#999"
								/>
							</View>

							<View style={styles.inputWrapper}>
								<Text style={styles.inputLabel}>Valor Total *</Text>
								<TextInput
									style={styles.input}
									placeholder="Ex: 1250.50 ou 1250,50"
									value={valorTotal}
									onChangeText={setValorTotal}
									keyboardType="decimal-pad"
									placeholderTextColor="#999"
								/>
							</View>

							<TouchableOpacity
								style={styles.attachButton}
								onPress={pickImageFromGallery}
							>
								<Ionicons name="image-outline" size={20} color="#1E4369" />
								<Text style={styles.attachButtonText}>
									{notaFoto ? "Trocar Foto" : "Anexar Foto (Opcional)"}
								</Text>
							</TouchableOpacity>

							<View style={styles.modalActions}>
								<TouchableOpacity
									style={styles.cancelButton}
									onPress={() => {
										setEditModalVisible(false);
										setEditingNota(null);
										resetForm();
									}}
								>
									<Text style={styles.cancelButtonText}>CANCELAR</Text>
								</TouchableOpacity>
								<TouchableOpacity
									style={[
										styles.saveButton,
										isEditing && styles.saveButtonDisabled,
									]}
									onPress={handleEditNota}
									disabled={isEditing}
								>
									{isEditing ? (
										<ActivityIndicator color="#FFF" size="small" />
									) : (
										<>
											<Ionicons
												name="checkmark-circle"
												size={18}
												color="#FFF"
											/>
											<Text style={styles.saveButtonText}>ATUALIZAR</Text>
										</>
									)}
								</TouchableOpacity>
							</View>
						</ScrollView>
					</View>
				</View>
			</Modal>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#F5F5F5",
	},
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
		marginBottom: 2,
	},
	appBarSubtitle: {
		fontSize: 14,
		color: "rgba(255, 255, 255, 0.7)",
	},
	statsRow: {
		flexDirection: "row",
		padding: 12,
		gap: 8,
	},
	statCardPrimary: {
		flex: 1,
		backgroundColor: "#FFFFFF",
		borderRadius: 12,
		padding: 16,
		alignItems: "center",
		elevation: 2,
		borderLeftWidth: 4,
		borderLeftColor: "#1E4369",
	},
	statCardSuccess: {
		flex: 1,
		backgroundColor: "#FFFFFF",
		borderRadius: 12,
		padding: 16,
		alignItems: "center",
		elevation: 2,
		borderLeftWidth: 4,
		borderLeftColor: "#4CAF50",
	},
	statCardWarning: {
		flex: 1,
		backgroundColor: "#FFFFFF",
		borderRadius: 12,
		padding: 16,
		alignItems: "center",
		elevation: 2,
		borderLeftWidth: 4,
		borderLeftColor: "#FF9800",
	},
	statValue: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#212121",
		marginTop: 8,
	},
	statLabel: {
		fontSize: 12,
		color: "#757575",
		marginTop: 4,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	loadingText: {
		marginTop: 12,
		fontSize: 14,
		color: "#757575",
	},
	listContent: {
		padding: 12,
		paddingBottom: 80,
	},
	notaCard: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		backgroundColor: "#FFFFFF",
		borderRadius: 12,
		padding: 16,
		marginBottom: 8,
		elevation: 2,
	},
	notaCardLeft: {
		flexDirection: "row",
		alignItems: "center",
		flex: 1,
	},
	notaIcon: {
		width: 48,
		height: 48,
		borderRadius: 24,
		backgroundColor: "#E3F2FD",
		justifyContent: "center",
		alignItems: "center",
		marginRight: 12,
	},
	notaInfo: {
		flex: 1,
	},
	notaHeader: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 4,
		gap: 8,
	},
	notaNumber: {
		fontSize: 16,
		fontWeight: "600",
		color: "#212121",
	},
	photoTag: {
		width: 20,
		height: 20,
		borderRadius: 10,
		backgroundColor: "#E8F5E9",
		justifyContent: "center",
		alignItems: "center",
	},
	notaEmitente: {
		fontSize: 14,
		color: "#757575",
		marginBottom: 2,
	},
	notaDate: {
		fontSize: 12,
		color: "#9E9E9E",
	},
	notaCardRight: {
		alignItems: "flex-end",
		flexDirection: "row",
		gap: 8,
	},
	notaValue: {
		fontSize: 16,
		fontWeight: "bold",
		color: "#4CAF50",
	},
	emptyState: {
		alignItems: "center",
		paddingVertical: 60,
	},
	emptyText: {
		fontSize: 16,
		fontWeight: "500",
		color: "#757575",
		marginTop: 16,
	},
	emptySubtext: {
		fontSize: 14,
		color: "#9E9E9E",
		marginTop: 8,
	},
	fab: {
		position: "absolute",
		right: 16,
		bottom: 16,
		width: 56,
		height: 56,
		borderRadius: 28,
		backgroundColor: "#4CAF50",
		justifyContent: "center",
		alignItems: "center",
		elevation: 6,
		shadowColor: "#000",
		shadowOffset: {width: 0, height: 4},
		shadowOpacity: 0.3,
		shadowRadius: 8,
	},
	modalBackdrop: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		justifyContent: "flex-end",
	},
	optionsModal: {
		backgroundColor: "#FFFFFF",
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		paddingBottom: 20,
	},
	optionsHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: 20,
		borderBottomWidth: 1,
		borderBottomColor: "#E0E0E0",
	},
	optionsTitle: {
		fontSize: 20,
		fontWeight: "600",
		color: "#212121",
	},
	optionButton: {
		flexDirection: "row",
		alignItems: "center",
		padding: 16,
		marginHorizontal: 16,
		marginTop: 8,
		backgroundColor: "#F9F9F9",
		borderRadius: 12,
	},
	optionIconCircle: {
		width: 50,
		height: 50,
		borderRadius: 25,
		backgroundColor: "#E3F2FD",
		justifyContent: "center",
		alignItems: "center",
		marginRight: 16,
	},
	optionTextContainer: {
		flex: 1,
	},
	optionTitle: {
		fontSize: 16,
		fontWeight: "600",
		color: "#212121",
		marginBottom: 4,
	},
	optionSubtitle: {
		fontSize: 13,
		color: "#757575",
	},
	cancelOptionButton: {
		margin: 16,
		marginTop: 12,
		padding: 16,
		backgroundColor: "#F5F5F5",
		borderRadius: 8,
		alignItems: "center",
	},
	cancelOptionText: {
		fontSize: 14,
		fontWeight: "600",
		color: "#757575",
	},
	modalContainer: {
		backgroundColor: "#FFFFFF",
		borderTopLeftRadius: 16,
		borderTopRightRadius: 16,
		maxHeight: "90%",
	},
	modalHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: 16,
		borderBottomWidth: 1,
		borderBottomColor: "#E0E0E0",
	},
	modalTitle: {
		fontSize: 18,
		fontWeight: "600",
		color: "#212121",
	},
	modalContent: {
		padding: 16,
	},
	photoChip: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#E8F5E9",
		padding: 12,
		borderRadius: 8,
		marginBottom: 16,
		gap: 8,
	},
	photoChipText: {
		flex: 1,
		fontSize: 14,
		color: "#4CAF50",
		fontWeight: "500",
	},
	inputWrapper: {
		marginBottom: 16,
	},
	inputLabel: {
		fontSize: 12,
		fontWeight: "600",
		color: "#757575",
		marginBottom: 8,
		textTransform: "uppercase",
	},
	input: {
		backgroundColor: "#F5F5F5",
		borderWidth: 1,
		borderColor: "#E0E0E0",
		borderRadius: 8,
		paddingHorizontal: 16,
		paddingVertical: 12,
		fontSize: 16,
		color: "#212121",
	},
	inputHint: {
		fontSize: 12,
		color: "#9E9E9E",
		marginTop: 4,
		textAlign: "right",
	},
	attachButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#E3F2FD",
		padding: 14,
		borderRadius: 8,
		marginBottom: 16,
		gap: 8,
		borderWidth: 1,
		borderColor: "#1E4369",
		borderStyle: "dashed",
	},
	attachButtonText: {
		fontSize: 14,
		fontWeight: "600",
		color: "#1E4369",
	},
	modalActions: {
		flexDirection: "row",
		gap: 12,
		marginTop: 8,
		marginBottom: 16,
	},
	cancelButton: {
		flex: 1,
		backgroundColor: "#F5F5F5",
		paddingVertical: 14,
		borderRadius: 8,
		alignItems: "center",
	},
	cancelButtonText: {
		fontSize: 14,
		fontWeight: "600",
		color: "#757575",
	},
	saveButton: {
		flex: 1,
		flexDirection: "row",
		backgroundColor: "#4CAF50",
		paddingVertical: 14,
		borderRadius: 8,
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
	},
	saveButtonDisabled: {
		backgroundColor: "#B0B0B0",
	},
	saveButtonText: {
		fontSize: 14,
		fontWeight: "600",
		color: "#FFFFFF",
	},
	detailsModal: {
		backgroundColor: "#FFFFFF",
		borderTopLeftRadius: 16,
		borderTopRightRadius: 16,
		maxHeight: "70%",
	},
	detailCard: {
		backgroundColor: "#F5F5F5",
		borderRadius: 12,
		padding: 16,
		marginBottom: 16,
	},
	detailRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		paddingVertical: 12,
	},
	detailLabel: {
		fontSize: 14,
		color: "#757575",
		fontWeight: "500",
	},
	detailValue: {
		fontSize: 14,
		color: "#212121",
		fontWeight: "600",
		textAlign: "right",
		flex: 1,
		marginLeft: 16,
	},
	detailValueHighlight: {
		fontSize: 18,
		color: "#4CAF50",
	},
	divider: {
		height: 1,
		backgroundColor: "#E0E0E0",
	},
	chaveCard: {
		backgroundColor: "#FFF",
		borderRadius: 12,
		padding: 16,
		borderWidth: 1,
		borderColor: "#E0E0E0",
		marginBottom: 16,
	},
	chaveLabel: {
		fontSize: 12,
		fontWeight: "600",
		color: "#757575",
		marginBottom: 8,
		textTransform: "uppercase",
	},
	chaveValue: {
		fontSize: 12,
		color: "#212121",
		fontFamily: Platform.OS === "android" ? "monospace" : "Courier",
	},
	editButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#E3F2FD",
		padding: 16,
		borderRadius: 8,
		gap: 8,
		borderWidth: 1,
		borderColor: "#1E4369",
	},
	editButtonText: {
		fontSize: 16,
		fontWeight: "600",
		color: "#1E4369",
	},
	deleteButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#FFEBEE",
		padding: 16,
		borderRadius: 8,
		marginTop: 12,
		gap: 8,
		borderWidth: 1,
		borderColor: "#F44336",
	},
	deleteButtonText: {
		fontSize: 16,
		fontWeight: "600",
		color: "#F44336",
	},
});
