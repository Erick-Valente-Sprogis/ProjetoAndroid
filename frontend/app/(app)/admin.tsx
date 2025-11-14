// frontend/app/(app)/admin.tsx

import React, {useState, useEffect, useCallback} from "react";
import {
	View,
	Text,
	StyleSheet,
	FlatList,
	TouchableOpacity,
	StatusBar,
	Platform,
	ActivityIndicator,
	RefreshControl,
	Modal,
	TextInput,
	Alert,
	Image,
} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {useAuth} from "../../context/AuthContext";
import api from "../../src/services/api";

type User = {
	id: string;
	uid: string;
	email: string;
	fullName: string;
	phone?: string;
	photoURL?: string;
	role: "user" | "admin";
	isBlocked: boolean;
	createdAt: string;
};

export default function AdminScreen() {
	const {user, profile} = useAuth();
	const [users, setUsers] = useState<User[]>([]);
	const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");

	// Modal de detalhes
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [detailsModalVisible, setDetailsModalVisible] = useState(false);

	// Modal de trocar senha
	const [passwordModalVisible, setPasswordModalVisible] = useState(false);
	const [newPassword, setNewPassword] = useState("");
	const [isChangingPassword, setIsChangingPassword] = useState(false);

	// Estatísticas
	const totalUsers = users.length;
	const totalAdmins = users.filter((u) => u.role === "admin").length;
	const totalBlocked = users.filter((u) => u.isBlocked).length;

	const fetchUsers = useCallback(async () => {
		if (!user) return;
		setLoading(true);
		try {
			const token = await user.getIdToken();
			const response = await api.get("/admin/users", {
				headers: {Authorization: `Bearer ${token}`},
			});
			setUsers(response.data);
			setFilteredUsers(response.data);
		} catch (error: any) {
			console.error("Erro ao buscar usuários:", error);
			if (Platform.OS === "web") {
				window.alert("Erro ao carregar usuários.");
			} else {
				Alert.alert("Erro", "Não foi possível carregar os usuários.");
			}
		} finally {
			setLoading(false);
		}
	}, [user]);

	const onRefresh = useCallback(async () => {
		setRefreshing(true);
		await fetchUsers();
		setRefreshing(false);
	}, [fetchUsers]);

	useEffect(() => {
		if (user && profile?.role === "admin") {
			fetchUsers();
		}
	}, [user, profile, fetchUsers]);

	useEffect(() => {
		if (searchQuery.trim() === "") {
			setFilteredUsers(users);
		} else {
			const filtered = users.filter(
				(u) =>
					u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
					u.email.toLowerCase().includes(searchQuery.toLowerCase())
			);
			setFilteredUsers(filtered);
		}
	}, [searchQuery, users]);

	const openDetails = (userItem: User) => {
		setSelectedUser(userItem);
		setDetailsModalVisible(true);
	};

	const openPasswordModal = () => {
		setDetailsModalVisible(false);
		setNewPassword("");
		setPasswordModalVisible(true);
	};

	const handleChangePassword = async () => {
		if (!selectedUser || !user) return;

		if (!newPassword || newPassword.length < 6) {
			if (Platform.OS === "web") {
				window.alert("A senha deve ter no mínimo 6 caracteres.");
			} else {
				Alert.alert("Erro", "A senha deve ter no mínimo 6 caracteres.");
			}
			return;
		}

		setIsChangingPassword(true);

		try {
			const token = await user.getIdToken();
			await api.put(
				`/admin/users/${selectedUser.id}/password`,
				{newPassword},
				{headers: {Authorization: `Bearer ${token}`}}
			);

			if (Platform.OS === "web") {
				window.alert("✅ Senha alterada com sucesso!");
			} else {
				Alert.alert("✅ Sucesso!", "Senha alterada com sucesso!");
			}

			setPasswordModalVisible(false);
			setNewPassword("");
		} catch (error: any) {
			console.error("Erro ao alterar senha:", error);
			if (Platform.OS === "web") {
				window.alert(`Erro: ${error.response?.data?.message || error.message}`);
			} else {
				Alert.alert(
					"Erro",
					error.response?.data?.message || "Não foi possível alterar a senha."
				);
			}
		} finally {
			setIsChangingPassword(false);
		}
	};

	const handleBlockUser = async () => {
		if (!selectedUser || !user) return;

		const confirmAction =
			Platform.OS === "web"
				? window.confirm(
						`Tem certeza que deseja bloquear ${selectedUser.fullName}?`
				  )
				: false;

		if (Platform.OS !== "web") {
			Alert.alert(
				"Confirmar Bloqueio",
				`Tem certeza que deseja bloquear ${selectedUser.fullName}?`,
				[
					{text: "Cancelar", style: "cancel"},
					{
						text: "Bloquear",
						style: "destructive",
						onPress: async () => await executeBlock(),
					},
				]
			);
			return;
		}

		if (!confirmAction) return;
		await executeBlock();

		async function executeBlock() {
			setDetailsModalVisible(false);

			try {
				const token = await user.getIdToken();
				await api.put(
					`/admin/users/${selectedUser.id}/block`,
					{},
					{headers: {Authorization: `Bearer ${token}`}}
				);

				if (Platform.OS === "web") {
					window.alert("✅ Usuário bloqueado com sucesso!");
				} else {
					Alert.alert("✅ Sucesso!", "Usuário bloqueado com sucesso!");
				}

				fetchUsers();
			} catch (error: any) {
				console.error("Erro ao bloquear usuário:", error);
				if (Platform.OS === "web") {
					window.alert(
						`Erro: ${error.response?.data?.message || error.message}`
					);
				} else {
					Alert.alert(
						"Erro",
						error.response?.data?.message ||
							"Não foi possível bloquear o usuário."
					);
				}
			}
		}
	};

	const handleUnblockUser = async () => {
		if (!selectedUser || !user) return;

		setDetailsModalVisible(false);

		try {
			const token = await user.getIdToken();
			await api.put(
				`/admin/users/${selectedUser.id}/unblock`,
				{},
				{headers: {Authorization: `Bearer ${token}`}}
			);

			if (Platform.OS === "web") {
				window.alert("✅ Usuário desbloqueado com sucesso!");
			} else {
				Alert.alert("✅ Sucesso!", "Usuário desbloqueado com sucesso!");
			}

			fetchUsers();
		} catch (error: any) {
			console.error("Erro ao desbloquear usuário:", error);
			if (Platform.OS === "web") {
				window.alert(`Erro: ${error.response?.data?.message || error.message}`);
			} else {
				Alert.alert(
					"Erro",
					error.response?.data?.message ||
						"Não foi possível desbloquear o usuário."
				);
			}
		}
	};

	const renderUserItem = ({item}: {item: User}) => {
		const photoUrl = item.photoURL
			? `http://localhost:3000/uploads/${item.photoURL}`
			: null;

		return (
			<TouchableOpacity
				style={styles.userCard}
				onPress={() => openDetails(item)}
				activeOpacity={0.7}
			>
				<View style={styles.userCardLeft}>
					{photoUrl ? (
						<Image source={{uri: photoUrl}} style={styles.userAvatar} />
					) : (
						<View style={styles.userAvatar}>
							<Text style={styles.userAvatarText}>
								{item.fullName.charAt(0).toUpperCase()}
							</Text>
						</View>
					)}
					<View style={styles.userInfo}>
						<View style={styles.userHeader}>
							<Text style={styles.userName}>{item.fullName}</Text>
							{item.role === "admin" && (
								<View style={styles.adminBadge}>
									<Ionicons name="shield-checkmark" size={12} color="#FF9800" />
								</View>
							)}
							{item.isBlocked && (
								<View style={styles.blockedBadge}>
									<Ionicons name="ban" size={12} color="#F44336" />
								</View>
							)}
						</View>
						<Text style={styles.userEmail}>{item.email}</Text>
						{item.phone && <Text style={styles.userPhone}>{item.phone}</Text>}
					</View>
				</View>
				<Ionicons name="chevron-forward" size={20} color="#B0B0B0" />
			</TouchableOpacity>
		);
	};

	if (profile?.role !== "admin") {
		return (
			<View style={styles.container}>
				<StatusBar barStyle="light-content" backgroundColor="#1E4369" />
				<View style={styles.appBar}>
					<Text style={styles.appBarTitle}>Administração</Text>
				</View>
				<View style={styles.accessDenied}>
					<Ionicons name="shield-outline" size={64} color="#B0B0B0" />
					<Text style={styles.accessDeniedText}>Acesso Negado</Text>
					<Text style={styles.accessDeniedSubtext}>
						Esta área é restrita a administradores.
					</Text>
				</View>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<StatusBar barStyle="light-content" backgroundColor="#1E4369" />

			<View style={styles.appBar}>
				<Text style={styles.appBarTitle}>Administração</Text>
				<Text style={styles.appBarSubtitle}>Gerenciar Usuários</Text>
			</View>

			{/* Estatísticas */}
			<View style={styles.statsRow}>
				<View style={styles.statCard}>
					<Ionicons name="people" size={24} color="#1E4369" />
					<Text style={styles.statValue}>{totalUsers}</Text>
					<Text style={styles.statLabel}>Usuários</Text>
				</View>
				<View style={styles.statCard}>
					<Ionicons name="shield-checkmark" size={24} color="#FF9800" />
					<Text style={styles.statValue}>{totalAdmins}</Text>
					<Text style={styles.statLabel}>Admins</Text>
				</View>
				<View style={styles.statCard}>
					<Ionicons name="ban" size={24} color="#F44336" />
					<Text style={styles.statValue}>{totalBlocked}</Text>
					<Text style={styles.statLabel}>Bloqueados</Text>
				</View>
			</View>

			{/* Barra de Busca */}
			<View style={styles.searchBar}>
				<Ionicons
					name="search"
					size={20}
					color="#757575"
					style={styles.searchIcon}
				/>
				<TextInput
					style={styles.searchInput}
					placeholder="Buscar por nome ou e-mail..."
					value={searchQuery}
					onChangeText={setSearchQuery}
					placeholderTextColor="#999"
				/>
				{searchQuery.length > 0 && (
					<TouchableOpacity onPress={() => setSearchQuery("")}>
						<Ionicons name="close-circle" size={20} color="#757575" />
					</TouchableOpacity>
				)}
			</View>

			{/* Lista de Usuários */}
			{loading ? (
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color="#1E4369" />
					<Text style={styles.loadingText}>Carregando usuários...</Text>
				</View>
			) : (
				<FlatList
					data={filteredUsers}
					keyExtractor={(item) => item.id}
					renderItem={renderUserItem}
					refreshControl={
						<RefreshControl
							refreshing={refreshing}
							onRefresh={onRefresh}
							colors={["#1E4369"]}
						/>
					}
					ListEmptyComponent={
						<View style={styles.emptyState}>
							<Ionicons name="people-outline" size={64} color="#BDBDBD" />
							<Text style={styles.emptyText}>
								{searchQuery
									? "Nenhum usuário encontrado"
									: "Nenhum usuário cadastrado"}
							</Text>
						</View>
					}
					contentContainerStyle={styles.listContent}
				/>
			)}

			{/* Modal de Detalhes */}
			<Modal
				animationType="slide"
				transparent={true}
				visible={detailsModalVisible}
				onRequestClose={() => setDetailsModalVisible(false)}
			>
				<View style={styles.modalBackdrop}>
					<View style={styles.detailsModal}>
						<View style={styles.modalHeader}>
							<Text style={styles.modalTitle}>Detalhes do Usuário</Text>
							<TouchableOpacity onPress={() => setDetailsModalVisible(false)}>
								<Ionicons name="close" size={24} color="#757575" />
							</TouchableOpacity>
						</View>

						{selectedUser && (
							<View style={styles.modalContent}>
								{/* Foto */}
								<View style={styles.userPhotoSection}>
									{selectedUser.photoURL ? (
										<Image
											source={{
												uri: `http://localhost:3000/uploads/${selectedUser.photoURL}`,
											}}
											style={styles.userPhotoLarge}
										/>
									) : (
										<View style={styles.userPhotoLarge}>
											<Text style={styles.userPhotoLargeText}>
												{selectedUser.fullName.charAt(0).toUpperCase()}
											</Text>
										</View>
									)}
								</View>

								{/* Info */}
								<View style={styles.detailCard}>
									<View style={styles.detailRow}>
										<Text style={styles.detailLabel}>Nome</Text>
										<Text style={styles.detailValue}>
											{selectedUser.fullName}
										</Text>
									</View>
									<View style={styles.divider} />
									<View style={styles.detailRow}>
										<Text style={styles.detailLabel}>E-mail</Text>
										<Text style={styles.detailValue}>{selectedUser.email}</Text>
									</View>
									<View style={styles.divider} />
									<View style={styles.detailRow}>
										<Text style={styles.detailLabel}>Telefone</Text>
										<Text style={styles.detailValue}>
											{selectedUser.phone || "Não informado"}
										</Text>
									</View>
									<View style={styles.divider} />
									<View style={styles.detailRow}>
										<Text style={styles.detailLabel}>Tipo</Text>
										<Text style={styles.detailValue}>
											{selectedUser.role === "admin"
												? "Administrador"
												: "Usuário"}
										</Text>
									</View>
									<View style={styles.divider} />
									<View style={styles.detailRow}>
										<Text style={styles.detailLabel}>Status</Text>
										<Text
											style={[
												styles.detailValue,
												selectedUser.isBlocked && styles.detailValueDanger,
											]}
										>
											{selectedUser.isBlocked ? "Bloqueado" : "Ativo"}
										</Text>
									</View>
								</View>

								{/* Ações */}
								<TouchableOpacity
									style={styles.actionButton}
									onPress={openPasswordModal}
								>
									<Ionicons name="key-outline" size={20} color="#1E4369" />
									<Text style={styles.actionButtonText}>Trocar Senha</Text>
								</TouchableOpacity>

								{selectedUser.isBlocked ? (
									<TouchableOpacity
										style={styles.unblockButton}
										onPress={handleUnblockUser}
									>
										<Ionicons
											name="checkmark-circle-outline"
											size={20}
											color="#4CAF50"
										/>
										<Text style={styles.unblockButtonText}>
											Desbloquear Usuário
										</Text>
									</TouchableOpacity>
								) : (
									selectedUser.role !== "admin" && (
										<TouchableOpacity
											style={styles.blockButton}
											onPress={handleBlockUser}
										>
											<Ionicons name="ban" size={20} color="#F44336" />
											<Text style={styles.blockButtonText}>
												Bloquear Usuário
											</Text>
										</TouchableOpacity>
									)
								)}
							</View>
						)}
					</View>
				</View>
			</Modal>

			{/* Modal de Trocar Senha */}
			<Modal
				animationType="slide"
				transparent={true}
				visible={passwordModalVisible}
				onRequestClose={() => setPasswordModalVisible(false)}
			>
				<View style={styles.modalBackdrop}>
					<View style={styles.passwordModal}>
						<View style={styles.modalHeader}>
							<Text style={styles.modalTitle}>Trocar Senha</Text>
							<TouchableOpacity onPress={() => setPasswordModalVisible(false)}>
								<Ionicons name="close" size={24} color="#757575" />
							</TouchableOpacity>
						</View>

						<View style={styles.modalContent}>
							<Text style={styles.passwordWarning}>
								⚠️ A nova senha será definida para:{" "}
								<Text style={styles.passwordWarningBold}>
									{selectedUser?.fullName}
								</Text>
							</Text>

							<View style={styles.inputWrapper}>
								<Text style={styles.inputLabel}>Nova Senha (mín. 6 chars)</Text>
								<TextInput
									style={styles.input}
									placeholder="Digite a nova senha"
									value={newPassword}
									onChangeText={setNewPassword}
									secureTextEntry
									editable={!isChangingPassword}
									placeholderTextColor="#999"
								/>
							</View>

							<View style={styles.modalActions}>
								<TouchableOpacity
									style={styles.cancelButton}
									onPress={() => setPasswordModalVisible(false)}
									disabled={isChangingPassword}
								>
									<Text style={styles.cancelButtonText}>CANCELAR</Text>
								</TouchableOpacity>
								<TouchableOpacity
									style={[
										styles.saveButton,
										isChangingPassword && styles.saveButtonDisabled,
									]}
									onPress={handleChangePassword}
									disabled={isChangingPassword}
								>
									{isChangingPassword ? (
										<ActivityIndicator color="#FFF" size="small" />
									) : (
										<>
											<Ionicons
												name="checkmark-circle"
												size={18}
												color="#FFF"
											/>
											<Text style={styles.saveButtonText}>ALTERAR</Text>
										</>
									)}
								</TouchableOpacity>
							</View>
						</View>
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
	statCard: {
		flex: 1,
		backgroundColor: "#FFFFFF",
		borderRadius: 12,
		padding: 16,
		alignItems: "center",
		elevation: 2,
	},
	statValue: {
		fontSize: 24,
		fontWeight: "bold",
		color: "#212121",
		marginTop: 8,
	},
	statLabel: {
		fontSize: 12,
		color: "#757575",
		marginTop: 4,
	},
	searchBar: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#FFFFFF",
		marginHorizontal: 12,
		marginBottom: 12,
		paddingHorizontal: 16,
		borderRadius: 12,
		elevation: 2,
	},
	searchIcon: {
		marginRight: 8,
	},
	searchInput: {
		flex: 1,
		paddingVertical: 12,
		fontSize: 16,
		color: "#212121",
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
	userCard: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		backgroundColor: "#FFFFFF",
		borderRadius: 12,
		padding: 16,
		marginBottom: 8,
		elevation: 2,
	},
	userCardLeft: {
		flexDirection: "row",
		alignItems: "center",
		flex: 1,
	},
	userAvatar: {
		width: 48,
		height: 48,
		borderRadius: 24,
		backgroundColor: "#1E4369",
		justifyContent: "center",
		alignItems: "center",
		marginRight: 12,
	},
	userAvatarText: {
		fontSize: 20,
		fontWeight: "bold",
		color: "#FFFFFF",
	},
	userInfo: {
		flex: 1,
	},
	userHeader: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 4,
		gap: 8,
	},
	userName: {
		fontSize: 16,
		fontWeight: "600",
		color: "#212121",
	},
	adminBadge: {
		width: 20,
		height: 20,
		borderRadius: 10,
		backgroundColor: "#FFF3E0",
		justifyContent: "center",
		alignItems: "center",
	},
	blockedBadge: {
		width: 20,
		height: 20,
		borderRadius: 10,
		backgroundColor: "#FFEBEE",
		justifyContent: "center",
		alignItems: "center",
	},
	userEmail: {
		fontSize: 14,
		color: "#757575",
		marginBottom: 2,
	},
	userPhone: {
		fontSize: 12,
		color: "#9E9E9E",
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
	accessDenied: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 24,
	},
	accessDeniedText: {
		fontSize: 20,
		fontWeight: "600",
		color: "#757575",
		marginTop: 16,
	},
	accessDeniedSubtext: {
		fontSize: 14,
		color: "#9E9E9E",
		marginTop: 8,
		textAlign: "center",
	},
	modalBackdrop: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		justifyContent: "flex-end",
	},
	detailsModal: {
		backgroundColor: "#FFFFFF",
		borderTopLeftRadius: 16,
		borderTopRightRadius: 16,
		maxHeight: "80%",
	},
	passwordModal: {
		backgroundColor: "#FFFFFF",
		borderTopLeftRadius: 16,
		borderTopRightRadius: 16,
		maxHeight: "60%",
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
	userPhotoSection: {
		alignItems: "center",
		marginBottom: 24,
	},
	userPhotoLarge: {
		width: 100,
		height: 100,
		borderRadius: 50,
		backgroundColor: "#1E4369",
		justifyContent: "center",
		alignItems: "center",
	},
	userPhotoLargeText: {
		fontSize: 40,
		fontWeight: "bold",
		color: "#FFFFFF",
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
	detailValueDanger: {
		color: "#F44336",
	},
	divider: {
		height: 1,
		backgroundColor: "#E0E0E0",
	},
	actionButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#E3F2FD",
		padding: 16,
		borderRadius: 8,
		gap: 8,
		borderWidth: 1,
		borderColor: "#1E4369",
		marginBottom: 12,
	},
	actionButtonText: {
		fontSize: 16,
		fontWeight: "600",
		color: "#1E4369",
	},
	blockButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#FFEBEE",
		padding: 16,
		borderRadius: 8,
		gap: 8,
		borderWidth: 1,
		borderColor: "#F44336",
	},
	blockButtonText: {
		fontSize: 16,
		fontWeight: "600",
		color: "#F44336",
	},
	unblockButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#E8F5E9",
		padding: 16,
		borderRadius: 8,
		gap: 8,
		borderWidth: 1,
		borderColor: "#4CAF50",
	},
	unblockButtonText: {
		fontSize: 16,
		fontWeight: "600",
		color: "#4CAF50",
	},
	passwordWarning: {
		fontSize: 14,
		color: "#757575",
		backgroundColor: "#FFF3E0",
		padding: 12,
		borderRadius: 8,
		marginBottom: 16,
	},
	passwordWarningBold: {
		fontWeight: "600",
		color: "#FF9800",
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
	modalActions: {
		flexDirection: "row",
		gap: 12,
		marginTop: 8,
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
});
