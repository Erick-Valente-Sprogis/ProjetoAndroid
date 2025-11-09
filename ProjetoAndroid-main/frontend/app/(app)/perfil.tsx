// frontend/app/(app)/perfil.tsx - Perfil Android

import React from "react";
import { useAuth } from "../../context/AuthContext";
import { signOut } from "firebase/auth";
import {
	StyleSheet,
	Text,
	View,
	TouchableOpacity,
	Alert,
	ScrollView,
	StatusBar,
	Platform,
} from "react-native";
import { auth } from "../../firebaseConfig";
import { Ionicons } from "@expo/vector-icons";

export default function PerfilScreen() {
	const { user, profile } = useAuth();

	const handleLogout = () => {
		Alert.alert(
			"Sair",
			"Tem certeza que deseja sair da sua conta?",
			[
				{ text: "Cancelar", style: "cancel" },
				{
					text: "Sair",
					style: "destructive",
					onPress: () => signOut(auth),
				},
			]
		);
	};

	return (
		<View style={styles.container}>
			<StatusBar barStyle="light-content" backgroundColor="#1E4369" />
			
			<View style={styles.appBar}>
				<Text style={styles.appBarTitle}>Perfil</Text>
			</View>

			<ScrollView>
				{/* Header do Perfil */}
				<View style={styles.profileHeader}>
					<View style={styles.avatar}>
						<Text style={styles.avatarText}>
							{profile?.fullName?.charAt(0) || user?.email?.charAt(0) || 'U'}
						</Text>
					</View>
					<Text style={styles.userName}>
						{profile?.fullName || user?.email?.split('@')[0] || 'Usuário'}
					</Text>
					<Text style={styles.userEmail}>{user?.email}</Text>
					{profile?.role === 'admin' && (
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
								<Ionicons name="person-outline" size={24} color="#1E4369" />
							</View>
							<View style={styles.infoContent}>
								<Text style={styles.infoLabel}>Nome Completo</Text>
								<Text style={styles.infoValue}>
									{profile?.fullName || 'Não informado'}
								</Text>
							</View>
						</View>

						<View style={styles.divider} />

						<View style={styles.infoRow}>
							<View style={styles.infoIcon}>
								<Ionicons name="mail-outline" size={24} color="#1E4369" />
							</View>
							<View style={styles.infoContent}>
								<Text style={styles.infoLabel}>E-mail</Text>
								<Text style={styles.infoValue}>{user?.email}</Text>
							</View>
						</View>

						{profile?.phone && (
							<>
								<View style={styles.divider} />
								<View style={styles.infoRow}>
									<View style={styles.infoIcon}>
										<Ionicons name="call-outline" size={24} color="#1E4369" />
									</View>
									<View style={styles.infoContent}>
										<Text style={styles.infoLabel}>Telefone</Text>
										<Text style={styles.infoValue}>{profile.phone}</Text>
									</View>
								</View>
							</>
						)}

						<View style={styles.divider} />

						<View style={styles.infoRow}>
							<View style={styles.infoIcon}>
								<Ionicons name="key-outline" size={24} color="#1E4369" />
							</View>
							<View style={styles.infoContent}>
								<Text style={styles.infoLabel}>ID do Usuário</Text>
								<Text style={styles.infoValue} numberOfLines={1}>
									{user?.uid}
								</Text>
							</View>
						</View>
					</View>
				</View>

				{/* Ações */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>AÇÕES</Text>
					
					<TouchableOpacity 
						style={styles.actionButton}
						android_ripple={{ color: 'rgba(30, 67, 105, 0.1)' }}
					>
						<Ionicons name="create-outline" size={24} color="#1E4369" />
						<Text style={styles.actionButtonText}>Editar Perfil</Text>
						<Ionicons name="chevron-forward" size={20} color="#B0B0B0" />
					</TouchableOpacity>

					<TouchableOpacity 
						style={styles.actionButton}
						android_ripple={{ color: 'rgba(30, 67, 105, 0.1)' }}
					>
						<Ionicons name="lock-closed-outline" size={24} color="#1E4369" />
						<Text style={styles.actionButtonText}>Alterar Senha</Text>
						<Ionicons name="chevron-forward" size={20} color="#B0B0B0" />
					</TouchableOpacity>

					<TouchableOpacity 
						style={styles.actionButton}
						android_ripple={{ color: 'rgba(30, 67, 105, 0.1)' }}
					>
						<Ionicons name="notifications-outline" size={24} color="#1E4369" />
						<Text style={styles.actionButtonText}>Notificações</Text>
						<Ionicons name="chevron-forward" size={20} color="#B0B0B0" />
					</TouchableOpacity>
				</View>

				{/* Sobre */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>SOBRE</Text>
					
					<TouchableOpacity 
						style={styles.actionButton}
						android_ripple={{ color: 'rgba(30, 67, 105, 0.1)' }}
					>
						<Ionicons name="help-circle-outline" size={24} color="#1E4369" />
						<Text style={styles.actionButtonText}>Ajuda</Text>
						<Ionicons name="chevron-forward" size={20} color="#B0B0B0" />
					</TouchableOpacity>

					<TouchableOpacity 
						style={styles.actionButton}
						android_ripple={{ color: 'rgba(30, 67, 105, 0.1)' }}
					>
						<Ionicons name="document-text-outline" size={24} color="#1E4369" />
						<Text style={styles.actionButtonText}>Termos de Uso</Text>
						<Ionicons name="chevron-forward" size={20} color="#B0B0B0" />
					</TouchableOpacity>

					<TouchableOpacity 
						style={styles.actionButton}
						android_ripple={{ color: 'rgba(30, 67, 105, 0.1)' }}
					>
						<Ionicons name="shield-outline" size={24} color="#1E4369" />
						<Text style={styles.actionButtonText}>Privacidade</Text>
						<Ionicons name="chevron-forward" size={20} color="#B0B0B0" />
					</TouchableOpacity>
				</View>

				{/* Botão Sair */}
				<TouchableOpacity 
					style={styles.logoutButton}
					onPress={handleLogout}
					android_ripple={{ color: 'rgba(244, 67, 54, 0.2)' }}
				>
					<Ionicons name="log-out-outline" size={24} color="#F44336" />
					<Text style={styles.logoutButtonText}>Sair da Conta</Text>
				</TouchableOpacity>

				<Text style={styles.versionText}>Versão 1.0.0</Text>
			</ScrollView>
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
		textTransform: "uppercase",
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
});
