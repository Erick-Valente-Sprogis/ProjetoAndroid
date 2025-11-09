// frontend/app/(app)/index.tsx - Dashboard com Modal de Opções

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import {
	Alert,
	StyleSheet,
	Text,
	View,
	FlatList,
	ActivityIndicator,
	Modal,
	TextInput,
	TouchableOpacity,
	RefreshControl,
	StatusBar,
	Platform,
	ScrollView,
} from "react-native";
import api from "../../src/services/api";
import { Ionicons } from "@expo/vector-icons";
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as ImagePicker from 'expo-image-picker';

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
	const { user, profile } = useAuth();
	const [notas, setNotas] = useState<NotaFiscal[]>([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);

	// Modal de opções
	const [optionsModalVisible, setOptionsModalVisible] = useState(false);

	// Modal de adicionar
	const [addModalVisible, setAddModalVisible] = useState(false);
	const [isUploading, setIsUploading] = useState(false);

	// Scanner
	const [scannerVisible, setScannerVisible] = useState(false);
	const [hasPermission, setHasPermission] = useState<boolean | null>(null);
	const [scanned, setScanned] = useState(false);

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
	const valorTotalGeral = notas.reduce((acc, nota) => acc + nota.valor_total, 0);

	const currentMonth = new Date().getMonth();
	const currentYear = new Date().getFullYear();
	const notasEsteMes = notas.filter(nota => {
		const notaDate = new Date(nota.data_emissao);
		return notaDate.getMonth() === currentMonth && notaDate.getFullYear() === currentYear;
	});
	const valorEsteMes = notasEsteMes.reduce((acc, nota) => acc + nota.valor_total, 0);

	useEffect(() => {
		(async () => {
			const { status } = await BarCodeScanner.requestPermissionsAsync();
			setHasPermission(status === 'granted');
		})();
	}, []);

	const fetchNotas = useCallback(async () => {
		if (!user) return;
		setLoading(true);
		try {
			const token = await user.getIdToken();
			const response = await api.get("/notas", {
				headers: { Authorization: `Bearer ${token}` },
			});
			const sortedNotas = response.data.sort((a: NotaFiscal, b: NotaFiscal) => 
				new Date(b.data_emissao).getTime() - new Date(a.data_emissao).getTime()
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

	const handleBarCodeScanned = ({ data }: { type: string; data: string }) => {
		setScanned(true);
		setScannerVisible(false);
		
		const chaveMatch = data.match(/\d{44}/);
		if (chaveMatch) {
			setChaveAcesso(chaveMatch[0]);
			Alert.alert(
				"✓ QR Code Lido",
				"Chave de acesso extraída com sucesso!",
				[{ text: "Continuar", onPress: () => setAddModalVisible(true) }]
			);
		} else {
			Alert.alert(
				"Atenção",
				"Não foi possível extrair a chave. Digite manualmente.",
				[{ text: "OK", onPress: () => setAddModalVisible(true) }]
			);
		}
	};

	const openScanner = () => {
		setOptionsModalVisible(false);
		if (hasPermission === null) {
			Alert.alert("Aguarde", "Verificando permissões...");
			return;
		}
		if (hasPermission === false) {
			Alert.alert(
				"Permissão Negada",
				"Habilite o acesso à câmera nas configurações do dispositivo."
			);
			return;
		}
		setScanned(false);
		setScannerVisible(true);
	};

	const takePhoto = async () => {
		setOptionsModalVisible(false);
		const { status } = await ImagePicker.requestCameraPermissionsAsync();
		
		if (status !== 'granted') {
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
		const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
		
		if (status !== 'granted') {
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
		if (!chaveAcesso || chaveAcesso.length !== 44) {
			Alert.alert("❌ Erro", "A chave de acesso deve ter exatamente 44 dígitos.");
			return false;
		}
		if (!numeroNf) {
			Alert.alert("❌ Erro", "Informe o número da Nota Fiscal.");
			return false;
		}
		if (!dataEmissao || !/^\d{4}-\d{2}-\d{2}$/.test(dataEmissao)) {
			Alert.alert("❌ Erro", "Data inválida. Use o formato AAAA-MM-DD\nExemplo: 2025-11-09");
			return false;
		}
		if (!valorTotal || isNaN(Number(valorTotal)) || Number(valorTotal) <= 0) {
			Alert.alert("❌ Erro", "Informe um valor total válido.");
			return false;
		}
		if (!emitenteNome) {
			Alert.alert("❌ Erro", "Informe o nome do emitente.");
			return false;
		}
		return true;
	};

	const handleAddNota = async () => {
		if (!validateForm() || !user) return;

		setIsUploading(true);

		const formData = new FormData();
		formData.append("chave_acesso", chaveAcesso);
		formData.append("numero_nf", numeroNf);
		formData.append("data_emissao", dataEmissao);
		formData.append("valor_total", valorTotal);
		formData.append("emitente_nome", emitenteNome);

		if (notaFoto) {
			const filename = notaFoto.split('/').pop() || 'nota.jpg';
			formData.append("foto", {
				uri: notaFoto,
				name: filename,
				type: 'image/jpeg',
			} as any);
		}

		try {
			const token = await user.getIdToken();
			const apiUrl = `${api.defaults.baseURL}/notas`;

			const response = await fetch(apiUrl, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
				},
				body: formData,
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || `Erro: ${response.status}`);
			}

			Alert.alert("✅ Sucesso!", "Nota fiscal adicionada com sucesso!");
			setAddModalVisible(false);
			resetForm();
			fetchNotas();
		} catch (error: any) {
			console.error("Erro ao adicionar nota:", error.message);
			Alert.alert("❌ Erro", `Não foi possível adicionar a nota:\n${error.message}`);
		} finally {
			setIsUploading(false);
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

	const openDetails = (nota: NotaFiscal) => {
		setSelectedNota(nota);
		setDetailsVisible(true);
	};

	const renderNotaItem = ({ item }: { item: NotaFiscal }) => (
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
					<Text style={styles.notaEmitente} numberOfLines={1}>{item.emitente_nome}</Text>
					<Text style={styles.notaDate}>
						{new Date(item.data_emissao).toLocaleDateString('pt-BR')}
					</Text>
				</View>
			</View>
			<View style={styles.notaCardRight}>
				<Text style={styles.notaValue}>R$ {item.valor_total.toFixed(2)}</Text>
				<Ionicons name="chevron-forward" size={18} color="#B0B0B0" />
			</View>
		</TouchableOpacity>
	);

	if (scannerVisible) {
		return (
			<View style={styles.scannerContainer}>
				<StatusBar barStyle="light-content" backgroundColor="#000" />
				<BarCodeScanner
					onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
					style={StyleSheet.absoluteFillObject}
				/>
				<View style={styles.scannerOverlay}>
					<View style={styles.scannerHeader}>
						<Text style={styles.scannerTitle}>Escaneie o QR Code</Text>
						<Text style={styles.scannerSubtitle}>
							Posicione o QR Code da nota fiscal dentro do quadrado
						</Text>
					</View>
					<View style={styles.scannerFrame}>
						<View style={[styles.corner, styles.cornerTL]} />
						<View style={[styles.corner, styles.cornerTR]} />
						<View style={[styles.corner, styles.cornerBL]} />
						<View style={[styles.corner, styles.cornerBR]} />
					</View>
					<TouchableOpacity
						style={styles.scannerCloseButton}
						onPress={() => setScannerVisible(false)}
					>
						<Text style={styles.scannerCloseText}>FECHAR</Text>
					</TouchableOpacity>
				</View>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<StatusBar barStyle="light-content" backgroundColor="#1E4369" />
			
			<View style={styles.appBar}>
				<Text style={styles.appBarTitle}>Notas Fiscais</Text>
				<Text style={styles.appBarSubtitle}>
					{profile?.fullName || user?.email?.split('@')[0]}
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
							<Ionicons name="document-text-outline" size={64} color="#BDBDBD" />
							<Text style={styles.emptyText}>Nenhuma nota cadastrada</Text>
							<Text style={styles.emptySubtext}>Toque no botão + para adicionar</Text>
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

						<TouchableOpacity style={styles.optionButton} onPress={openScanner}>
							<View style={styles.optionIconCircle}>
								<Ionicons name="qr-code-outline" size={28} color="#1E4369" />
							</View>
							<View style={styles.optionTextContainer}>
								<Text style={styles.optionTitle}>Escanear QR Code</Text>
								<Text style={styles.optionSubtitle}>Extrair chave automaticamente</Text>
							</View>
							<Ionicons name="chevron-forward" size={20} color="#B0B0B0" />
						</TouchableOpacity>

						<TouchableOpacity style={styles.optionButton} onPress={takePhoto}>
							<View style={styles.optionIconCircle}>
								<Ionicons name="camera-outline" size={28} color="#1E4369" />
							</View>
							<View style={styles.optionTextContainer}>
								<Text style={styles.optionTitle}>Tirar Foto</Text>
								<Text style={styles.optionSubtitle}>Usar câmera do dispositivo</Text>
							</View>
							<Ionicons name="chevron-forward" size={20} color="#B0B0B0" />
						</TouchableOpacity>

						<TouchableOpacity style={styles.optionButton} onPress={pickImageFromGallery}>
							<View style={styles.optionIconCircle}>
								<Ionicons name="image-outline" size={28} color="#1E4369" />
							</View>
							<View style={styles.optionTextContainer}>
								<Text style={styles.optionTitle}>Escolher da Galeria</Text>
								<Text style={styles.optionSubtitle}>Selecionar foto existente</Text>
							</View>
							<Ionicons name="chevron-forward" size={20} color="#B0B0B0" />
						</TouchableOpacity>

						<TouchableOpacity style={styles.optionButton} onPress={openManualForm}>
							<View style={styles.optionIconCircle}>
								<Ionicons name="create-outline" size={28} color="#1E4369" />
							</View>
							<View style={styles.optionTextContainer}>
								<Text style={styles.optionTitle}>Preencher Manualmente</Text>
								<Text style={styles.optionSubtitle}>Digitar todos os dados</Text>
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
							{notaFoto && (
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
									<Text style={styles.attachButtonText}>Anexar Foto (Opcional)</Text>
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
									style={[styles.saveButton, isUploading && styles.saveButtonDisabled]}
									onPress={handleAddNota}
									disabled={isUploading}
								>
									{isUploading ? (
										<ActivityIndicator color="#FFF" size="small" />
									) : (
										<>
											<Ionicons name="checkmark-circle" size={18} color="#FFF" />
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
										<Text style={styles.detailValue}>{selectedNota.numero_nf}</Text>
									</View>
									<View style={styles.divider} />
									<View style={styles.detailRow}>
										<Text style={styles.detailLabel}>Emitente</Text>
										<Text style={styles.detailValue}>{selectedNota.emitente_nome}</Text>
									</View>
									<View style={styles.divider} />
									<View style={styles.detailRow}>
										<Text style={styles.detailLabel}>Data</Text>
										<Text style={styles.detailValue}>
											{new Date(selectedNota.data_emissao).toLocaleDateString('pt-BR', {
												day: '2-digit',
												month: 'long',
												year: 'numeric'
											})}
										</Text>
									</View>
									<View style={styles.divider} />
									<View style={styles.detailRow}>
										<Text style={styles.detailLabel}>Valor</Text>
										<Text style={[styles.detailValue, styles.detailValueHighlight]}>
											R$ {selectedNota.valor_total.toFixed(2)}
										</Text>
									</View>
								</View>

								<View style={styles.chaveCard}>
									<Text style={styles.chaveLabel}>Chave de Acesso</Text>
									<Text style={styles.chaveValue}>{selectedNota.chave_acesso}</Text>
								</View>
							</ScrollView>
						)}
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
		paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 44,
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
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
	},
	scannerContainer: {
		flex: 1,
		backgroundColor: "#000",
	},
	scannerOverlay: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.6)",
		justifyContent: "space-between",
		padding: 40,
	},
	scannerHeader: {
		alignItems: "center",
	},
	scannerTitle: {
		fontSize: 24,
		fontWeight: "bold",
		color: "#FFF",
		marginBottom: 12,
	},
	scannerSubtitle: {
		fontSize: 15,
		color: "rgba(255, 255, 255, 0.9)",
		textAlign: "center",
		lineHeight: 22,
	},
	scannerFrame: {
		width: 260,
		height: 260,
		alignSelf: "center",
		position: "relative",
	},
	corner: {
		position: "absolute",
		width: 40,
		height: 40,
		borderColor: "#FFF",
	},
	cornerTL: {
		top: 0,
		left: 0,
		borderTopWidth: 4,
		borderLeftWidth: 4,
	},
	cornerTR: {
		top: 0,
		right: 0,
		borderTopWidth: 4,
		borderRightWidth: 4,
	},
	cornerBL: {
		bottom: 0,
		left: 0,
		borderBottomWidth: 4,
		borderLeftWidth: 4,
	},
	cornerBR: {
		bottom: 0,
		right: 0,
		borderBottomWidth: 4,
		borderRightWidth: 4,
	},
	scannerCloseButton: {
		backgroundColor: "#F44336",
		paddingVertical: 14,
		borderRadius: 8,
		alignItems: "center",
	},
	scannerCloseText: {
		color: "#FFF",
		fontSize: 16,
		fontWeight: "600",
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
		fontFamily: Platform.OS === 'android' ? 'monospace' : 'Courier',
	},
});