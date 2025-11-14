// frontend/app/(app)/perfil.tsx

import React, {useState} from "react";
import {useAuth} from "../../context/AuthContext";
import {signOut} from "firebase/auth";
import {useRouter} from "expo-router";
import * as ImagePicker from "expo-image-picker";
import {
	StyleSheet,
	Text,
	View,
	Alert,
	ScrollView,
	StatusBar,
	Platform,
	TouchableOpacity,
	ActivityIndicator,
	Modal,
	TextInput,
	Image,
} from "react-native";
import {auth} from "../../firebaseConfig";
import {Ionicons} from "@expo/vector-icons";
import api from "../../src/services/api";

export default function PerfilScreen() {
	const {user, profile, refreshProfile} = useAuth();
	const router = useRouter();
	const [isLoggingOut, setIsLoggingOut] = useState(false);

	// Modal de edição
	const [editModalVisible, setEditModalVisible] = useState(false);
	const [editPhone, setEditPhone] = useState(profile?.phone || "");
	const [editPhoto, setEditPhoto] = useState<string | null>(null);
	const [isSaving, setIsSaving] = useState(false);

	const handleLogout = async () => {
		if (Platform.OS === "web") {
			const confirmar = window.confirm("Tem certeza que deseja sair?");
			if (!confirmar) return;
		} else {
			Alert.alert("Confirmar Saída", "Tem certeza que deseja sair?", [
				{text: "Cancelar", style: "cancel"},
				{
					text: "Sair",
					style: "destructive",
					onPress: () => executarLogout(),
				},
			]);
			return;
		}

		executarLogout();

		async function executarLogout() {
			setIsLoggingOut(true);
			try {
				await signOut(auth);
				console.log("✅ Logout realizado!");
				router.replace("/(auth)/login");
			} catch (error) {
				console.error("❌ Erro:", error);
				if (Platform.OS === "web") {
					window.alert("Não foi possível sair.");
				}
			} finally {
				setIsLoggingOut(false);
			}
		}
	};

	const openEditModal = () => {
		setEditPhone(profile?.phone || "");
		setEditPhoto(null);
		setEditModalVisible(true);
	};

	const pickImageFromGallery = async () => {
		const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync();

		if (status !== "granted") {
			if (Platform.OS === "web") {
				window.alert("Permissão negada para acessar a galeria.");
			} else {
				Alert.alert(
					"Permissão Negada",
					"Habilite o acesso à galeria nas configurações."
				);
			}
			return;
		}

		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			aspect: [1, 1],
			quality: 0.8,
		});

		if (!result.canceled && result.assets[0]) {
			setEditPhoto(result.assets[0].uri);
		}
	};

	const takePhoto = async () => {
		const {status} = await ImagePicker.requestCameraPermissionsAsync();

		if (status !== "granted") {
			if (Platform.OS === "web") {
				window.alert("Permissão negada para acessar a câmera.");
			} else {
				Alert.alert(
					"Permissão Negada",
					"Habilite o acesso à câmera nas configurações."
				);
			}
			return;
		}

		const result = await ImagePicker.launchCameraAsync({
			allowsEditing: true,
			aspect: [1, 1],
			quality: 0.8,
		});

		if (!result.canceled && result.assets[0]) {
			setEditPhoto(result.assets[0].uri);
		}
	};

	const handleSaveProfile = async () => {
		if (!user) return;

		setIsSaving(true);

		try {
			const token = await user.getIdToken();

			// 1. Atualiza o telefone (se foi modificado)
			if (editPhone !== profile?.phone) {
				console.log("📞 Atualizando telefone:", editPhone);
				await api.put(
					"/auth/profile",
					{phone: editPhone},
					{headers: {Authorization: `Bearer ${token}`}}
				);
				console.log("✅ Telefone atualizado!");
			}

			// 2. Faz upload da foto (se uma nova foto foi selecionada)
			console.log("📸 editPhoto:", editPhoto);
			if (
				editPhoto &&
				(editPhoto.startsWith("file://") || editPhoto.startsWith("data:image"))
			) {
				console.log("📤 Iniciando upload da foto...");

				const formData = new FormData();

				// Se for base64 (web), converte para blob
				if (editPhoto.startsWith("data:image")) {
					console.log("🌐 Detectado base64 (web), convertendo para blob...");

					const response = await fetch(editPhoto);
					const blob = await response.blob();

					formData.append("photo", blob, "profile.jpg");
				} else {
					// Se for file:// (mobile), usa o formato normal
					console.log("📱 Detectado file:// (mobile)");
					const filename = editPhoto.split("/").pop() || "profile.jpg";
					formData.append("photo", {
						uri: editPhoto,
						name: filename,
						type: "image/jpeg",
					} as any);
				}

				const apiUrl = `${api.defaults.baseURL}/auth/profile/photo`;
				console.log("📤 URL do upload:", apiUrl);

				const uploadResponse = await fetch(apiUrl, {
					method: "POST",
					headers: {
						Authorization: `Bearer ${token}`,
					},
					body: formData,
				});

				console.log("📤 Response status:", uploadResponse.status);

				if (!uploadResponse.ok) {
					const errorData = await uploadResponse.json();
					throw new Error(
						errorData.message || `Erro: ${uploadResponse.status}`
					);
				}

				const uploadResult = await uploadResponse.json();
				console.log("📦 Resultado do upload:", uploadResult);
				console.log("✅ Foto enviada com sucesso!");
			} else {
				console.log("⚠️ Nenhuma nova foto selecionada");
			}

			// 3. Fecha o modal ANTES de atualizar (evita problemas de state)
			setEditModalVisible(false);
			setIsSaving(false);

			// 4. Atualiza o perfil no contexto (vai forçar re-render)
			console.log("🔄 Atualizando perfil no contexto...");
			await refreshProfile();
			console.log("✅ Perfil atualizado no contexto!");

			// 5. Pequeno delay para garantir que o estado atualizou
			await new Promise((resolve) => setTimeout(resolve, 200));

			// 6. Mostra mensagem de sucesso
			if (Platform.OS === "web") {
				window.alert("✅ Perfil atualizado com sucesso!");
			} else {
				Alert.alert("✅ Sucesso!", "Perfil atualizado com sucesso!");
			}
		} catch (error: any) {
			console.error("❌ Erro ao atualizar perfil:", error);
			setEditModalVisible(false);
			setIsSaving(false);

			if (Platform.OS === "web") {
				window.alert(`Erro: ${error.message}`);
			} else {
				Alert.alert("❌ Erro", `Não foi possível atualizar o perfil.`);
			}
		}
	};

	if (isLoggingOut) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size="large" color="#1E4369" />
				<Text style={styles.loadingText}>Saindo...</Text>
			</View>
		);
	}

	const photoUrl = profile?.photoURL
		? `${api.defaults.baseURL.replace("/api", "")}/uploads/${profile.photoURL}`
		: null;

	console.log("🖼️ RENDER - profile:", profile);
	console.log("🖼️ RENDER - profile.photoURL:", profile?.photoURL);
	console.log("🖼️ RENDER - photoUrl montado:", photoUrl);

	return (
		<View style={styles.container}>
			<StatusBar barStyle="light-content" backgroundColor="#1E4369" />

			<View style={styles.appBar}>
				<Text style={styles.appBarTitle}>Perfil</Text>
			</View>

			<ScrollView>
				{/* Header do Perfil */}
				<View style={styles.profileHeader}>
					{photoUrl ? (
						<Image source={{uri: photoUrl}} style={styles.avatarImage} />
					) : (
						<View style={styles.avatar}>
							<Text style={styles.avatarText}>
								{profile?.fullName?.charAt(0).toUpperCase() ||
									user?.email?.charAt(0).toUpperCase() ||
									"U"}
							</Text>
						</View>
					)}
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
					<Text style={styles.sectionTitle}>INFORMAÇÕES DA CONTA</Text>
					<View style={styles.infoCard}>
						<View style={styles.infoRow}>
							<View style={styles.infoIcon}>
								<Ionicons name="mail" size={20} color="#1E4369" />
							</View>
							<View style={styles.infoContent}>
								<Text style={styles.infoLabel}>E-mail</Text>
								<Text style={styles.infoValue}>{user?.email}</Text>
							</View>
						</View>
						<View style={styles.divider} />
						<View style={styles.infoRow}>
							<View style={styles.infoIcon}>
								<Ionicons name="person" size={20} color="#1E4369" />
							</View>
							<View style={styles.infoContent}>
								<Text style={styles.infoLabel}>Nome</Text>
								<Text style={styles.infoValue}>
									{profile?.fullName || "Não informado"}
								</Text>
							</View>
						</View>
						<View style={styles.divider} />
						<View style={styles.infoRow}>
							<View style={styles.infoIcon}>
								<Ionicons name="call" size={20} color="#1E4369" />
							</View>
							<View style={styles.infoContent}>
								<Text style={styles.infoLabel}>Telefone</Text>
								<Text style={styles.infoValue}>
									{profile?.phone || "Não informado"}
								</Text>
							</View>
						</View>
						<View style={styles.divider} />
						<View style={styles.infoRow}>
							<View style={styles.infoIcon}>
								<Ionicons name="shield" size={20} color="#1E4369" />
							</View>
							<View style={styles.infoContent}>
								<Text style={styles.infoLabel}>Tipo de Conta</Text>
								<Text style={styles.infoValue}>
									{profile?.role === "admin" ? "Administrador" : "Usuário"}
								</Text>
							</View>
						</View>
					</View>
				</View>

				{/* Botão Editar Perfil */}
				<View style={styles.section}>
					<TouchableOpacity
						style={styles.editProfileButton}
						onPress={openEditModal}
						activeOpacity={0.7}
					>
						<Ionicons name="create-outline" size={24} color="#1E4369" />
						<Text style={styles.editProfileButtonText}>Editar Perfil</Text>
						<Ionicons name="chevron-forward" size={20} color="#B0B0B0" />
					</TouchableOpacity>
				</View>

				{/* Botão de Logout */}
				<TouchableOpacity
					style={styles.logoutButton}
					onPress={handleLogout}
					activeOpacity={0.7}
				>
					<Ionicons name="log-out-outline" size={24} color="#F44336" />
					<Text style={styles.logoutButtonText}>Sair</Text>
				</TouchableOpacity>

				<Text style={styles.versionText}>Versão 1.0.0</Text>
			</ScrollView>

			{/* Modal de Edição */}
			<Modal
				animationType="slide"
				transparent={true}
				visible={editModalVisible}
				onRequestClose={() => setEditModalVisible(false)}
			>
				<View style={styles.modalBackdrop}>
					<View style={styles.modalContainer}>
						<View style={styles.modalHeader}>
							<Text style={styles.modalTitle}>Editar Perfil</Text>
							<TouchableOpacity onPress={() => setEditModalVisible(false)}>
								<Ionicons name="close" size={24} color="#757575" />
							</TouchableOpacity>
						</View>

						<ScrollView style={styles.modalContent}>
							{/* Foto de Perfil */}
							<View style={styles.photoSection}>
								<Text style={styles.inputLabel}>Foto de Perfil</Text>
								<View style={styles.photoPreview}>
									{editPhoto ? (
										<Image
											source={{uri: editPhoto}}
											style={styles.photoImage}
										/>
									) : photoUrl ? (
										<Image source={{uri: photoUrl}} style={styles.photoImage} />
									) : (
										<View style={styles.photoPlaceholder}>
											<Text style={styles.photoPlaceholderText}>
												{profile?.fullName?.charAt(0).toUpperCase() || "U"}
											</Text>
										</View>
									)}
								</View>
								<View style={styles.photoButtons}>
									<TouchableOpacity
										style={styles.photoButton}
										onPress={takePhoto}
									>
										<Ionicons name="camera" size={20} color="#1E4369" />
										<Text style={styles.photoButtonText}>Câmera</Text>
									</TouchableOpacity>
									<TouchableOpacity
										style={styles.photoButton}
										onPress={pickImageFromGallery}
									>
										<Ionicons name="image" size={20} color="#1E4369" />
										<Text style={styles.photoButtonText}>Galeria</Text>
									</TouchableOpacity>
								</View>
							</View>

							{/* Email (somente leitura) */}
							<View style={styles.inputWrapper}>
								<Text style={styles.inputLabel}>E-mail (não editável)</Text>
								<TextInput
									style={[styles.input, styles.inputDisabled]}
									value={user?.email}
									editable={false}
								/>
							</View>

							{/* Nome (somente leitura) */}
							<View style={styles.inputWrapper}>
								<Text style={styles.inputLabel}>Nome (não editável)</Text>
								<TextInput
									style={[styles.input, styles.inputDisabled]}
									value={profile?.fullName}
									editable={false}
								/>
							</View>

							{/* Telefone (editável) */}
							<View style={styles.inputWrapper}>
								<Text style={styles.inputLabel}>Telefone</Text>
								<TextInput
									style={styles.input}
									placeholder="(00) 00000-0000"
									value={editPhone}
									onChangeText={setEditPhone}
									keyboardType="phone-pad"
									placeholderTextColor="#999"
								/>
							</View>

							<View style={styles.modalActions}>
								<TouchableOpacity
									style={styles.cancelButton}
									onPress={() => setEditModalVisible(false)}
								>
									<Text style={styles.cancelButtonText}>CANCELAR</Text>
								</TouchableOpacity>
								<TouchableOpacity
									style={[
										styles.saveButton,
										isSaving && styles.saveButtonDisabled,
									]}
									onPress={handleSaveProfile}
									disabled={isSaving}
								>
									{isSaving ? (
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
	avatarImage: {
		width: 80,
		height: 80,
		borderRadius: 40,
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
	editProfileButton: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#FFFFFF",
		paddingVertical: 16,
		paddingHorizontal: 16,
		elevation: 2,
	},
	editProfileButtonText: {
		flex: 1,
		fontSize: 16,
		fontWeight: "600",
		color: "#1E4369",
		marginLeft: 16,
	},
	logoutButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#FFFFFF",
		marginHorizontal: 16,
		marginTop: 16,
		padding: 16,
		borderRadius: 8,
		elevation: 2,
		gap: 12,
	},
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
	modalBackdrop: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		justifyContent: "flex-end",
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
	photoSection: {
		alignItems: "center",
		marginBottom: 24,
	},
	photoPreview: {
		marginVertical: 16,
	},
	photoImage: {
		width: 120,
		height: 120,
		borderRadius: 60,
	},
	photoPlaceholder: {
		width: 120,
		height: 120,
		borderRadius: 60,
		backgroundColor: "#1E4369",
		justifyContent: "center",
		alignItems: "center",
	},
	photoPlaceholderText: {
		fontSize: 48,
		fontWeight: "bold",
		color: "#FFFFFF",
	},
	photoButtons: {
		flexDirection: "row",
		gap: 12,
	},
	photoButton: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#E3F2FD",
		paddingHorizontal: 20,
		paddingVertical: 12,
		borderRadius: 8,
		gap: 8,
	},
	photoButtonText: {
		fontSize: 14,
		fontWeight: "600",
		color: "#1E4369",
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
	inputDisabled: {
		backgroundColor: "#E0E0E0",
		color: "#757575",
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
});
