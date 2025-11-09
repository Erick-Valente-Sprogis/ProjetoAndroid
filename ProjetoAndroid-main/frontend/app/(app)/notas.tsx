// app/(app)/notas.tsx

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import {
	StyleSheet,
	Text,
	View,
	FlatList,
	ActivityIndicator,
	TouchableOpacity,
	TextInput,
	Modal,
	ScrollView,
	StatusBar,
	Platform,
} from "react-native";
import api from "../../src/services/api";
import { Ionicons } from "@expo/vector-icons";

type NotaFiscal = {
	id: string;
	numero_nf: string;
	valor_total: number;
	emitente_nome: string;
	data_emissao: string;
	chave_acesso: string;
};

export default function NotasScreen() {
	const { user } = useAuth();
	const [notas, setNotas] = useState<NotaFiscal[]>([]);
	const [filteredNotas, setFilteredNotas] = useState<NotaFiscal[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedNota, setSelectedNota] = useState<NotaFiscal | null>(null);
	const [detailsVisible, setDetailsVisible] = useState(false);

	const fetchNotas = useCallback(async () => {
		if (!user) return;
		setLoading(true);
		try {
			const token = await user.getIdToken();
			const response = await api.get("/notas", {
				headers: { Authorization: `Bearer ${token}` },
			});
			const sorted = response.data.sort((a: NotaFiscal, b: NotaFiscal) => 
				new Date(b.data_emissao).getTime() - new Date(a.data_emissao).getTime()
			);
			setNotas(sorted);
			setFilteredNotas(sorted);
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	}, [user]);

	useEffect(() => {
		if (user) {
			fetchNotas();
		}
	}, [user, fetchNotas]);

	useEffect(() => {
		if (searchQuery) {
			const filtered = notas.filter(nota =>
				nota.numero_nf.toLowerCase().includes(searchQuery.toLowerCase()) ||
				nota.emitente_nome.toLowerCase().includes(searchQuery.toLowerCase())
			);
			setFilteredNotas(filtered);
		} else {
			setFilteredNotas(notas);
		}
	}, [searchQuery, notas]);

	const openDetails = (nota: NotaFiscal) => {
		setSelectedNota(nota);
		setDetailsVisible(true);
	};

	const renderItem = ({ item }: { item: NotaFiscal }) => (
		<TouchableOpacity 
			style={styles.card}
			onPress={() => openDetails(item)}
			activeOpacity={0.7}
		>
			<View style={styles.cardContent}>
				<View style={styles.cardLeft}>
					<View style={styles.iconCircle}>
						<Ionicons name="document-text" size={24} color="#1E4369" />
					</View>
					<View style={styles.cardInfo}>
						<Text style={styles.cardTitle}>NF {item.numero_nf}</Text>
						<Text style={styles.cardSubtitle} numberOfLines={1}>
							{item.emitente_nome}
						</Text>
						<Text style={styles.cardDate}>
							{new Date(item.data_emissao).toLocaleDateString('pt-BR')}
						</Text>
					</View>
				</View>
				<View style={styles.cardRight}>
					<Text style={styles.cardValue}>R$ {item.valor_total.toFixed(2)}</Text>
					<Ionicons name="chevron-forward" size={20} color="#B0B0B0" />
				</View>
			</View>
		</TouchableOpacity>
	);

	return (
		<View style={styles.container}>
			<StatusBar barStyle="light-content" backgroundColor="#1E4369" />
			
			<View style={styles.appBar}>
				<Text style={styles.appBarTitle}>Todas as Notas</Text>
			</View>

			<View style={styles.searchBar}>
				<Ionicons name="search" size={20} color="#757575" />
				<TextInput
					style={styles.searchInput}
					placeholder="Buscar por número ou emitente"
					value={searchQuery}
					onChangeText={setSearchQuery}
					placeholderTextColor="#9E9E9E"
				/>
				{searchQuery ? (
					<TouchableOpacity onPress={() => setSearchQuery("")}>
						<Ionicons name="close-circle" size={20} color="#757575" />
					</TouchableOpacity>
				) : null}
			</View>

			<View style={styles.resultCount}>
				<Text style={styles.resultText}>
					{filteredNotas.length} {filteredNotas.length === 1 ? 'nota' : 'notas'}
				</Text>
			</View>

			{loading ? (
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color="#1E4369" />
				</View>
			) : (
				<FlatList
					data={filteredNotas}
					keyExtractor={(item) => item.id}
					renderItem={renderItem}
					contentContainerStyle={styles.listContent}
					ListEmptyComponent={
						<View style={styles.emptyState}>
							<Ionicons name="search-outline" size={64} color="#BDBDBD" />
							<Text style={styles.emptyText}>Nenhuma nota encontrada</Text>
						</View>
					}
				/>
			)}

			<Modal
				animationType="slide"
				transparent={true}
				visible={detailsVisible}
				onRequestClose={() => setDetailsVisible(false)}
			>
				<View style={styles.modalBackdrop}>
					<View style={styles.modalContainer}>
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
	},
	searchBar: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#FFFFFF",
		margin: 12,
		paddingHorizontal: 16,
		borderRadius: 8,
		elevation: 2,
	},
	searchInput: {
		flex: 1,
		paddingVertical: 12,
		paddingHorizontal: 12,
		fontSize: 16,
		color: "#212121",
	},
	resultCount: {
		paddingHorizontal: 16,
		paddingBottom: 8,
	},
	resultText: {
		fontSize: 14,
		color: "#757575",
		fontWeight: "500",
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	listContent: {
		padding: 12,
	},
	card: {
		backgroundColor: "#FFFFFF",
		borderRadius: 12,
		marginBottom: 8,
		elevation: 2,
		overflow: "hidden",
	},
	cardContent: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: 16,
	},
	cardLeft: {
		flexDirection: "row",
		alignItems: "center",
		flex: 1,
	},
	iconCircle: {
		width: 48,
		height: 48,
		borderRadius: 24,
		backgroundColor: "#E3F2FD",
		justifyContent: "center",
		alignItems: "center",
		marginRight: 12,
	},
	cardInfo: {
		flex: 1,
	},
	cardTitle: {
		fontSize: 16,
		fontWeight: "600",
		color: "#212121",
		marginBottom: 4,
	},
	cardSubtitle: {
		fontSize: 14,
		color: "#757575",
		marginBottom: 2,
	},
	cardDate: {
		fontSize: 12,
		color: "#9E9E9E",
	},
	cardRight: {
		alignItems: "flex-end",
		flexDirection: "row",
		gap: 8,
	},
	cardValue: {
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
		color: "#757575",
		marginTop: 16,
	},
	modalBackdrop: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		justifyContent: "flex-end",
	},
	modalContainer: {
		backgroundColor: "#FFFFFF",
		borderTopLeftRadius: 16,
		borderTopRightRadius: 16,
		maxHeight: "70%",
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