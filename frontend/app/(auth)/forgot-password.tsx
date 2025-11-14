// frontend/app/(auth)/forgot-password.tsx

import React, {useState} from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	StatusBar,
	Platform,
	ActivityIndicator,
	Alert,
	KeyboardAvoidingView,
	ScrollView,
} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {useRouter} from "expo-router";
import {sendPasswordResetEmail} from "firebase/auth";
import {auth} from "../../firebaseConfig";

export default function ForgotPasswordScreen() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const validateEmail = (email: string) => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	};

	const handleResetPassword = async () => {
		console.log("🔐 handleResetPassword chamado!");

		// Validações
		if (!email.trim()) {
			if (Platform.OS === "web") {
				window.alert("Por favor, informe seu e-mail.");
			} else {
				Alert.alert("❌ Erro", "Por favor, informe seu e-mail.");
			}
			return;
		}

		if (!validateEmail(email)) {
			if (Platform.OS === "web") {
				window.alert("Por favor, informe um e-mail válido.");
			} else {
				Alert.alert("❌ Erro", "Por favor, informe um e-mail válido.");
			}
			return;
		}

		setIsLoading(true);

		try {
			console.log("📧 Enviando e-mail de recuperação para:", email);
			await sendPasswordResetEmail(auth, email);
			console.log("✅ E-mail enviado com sucesso!");

			if (Platform.OS === "web") {
				window.alert(
					"✅ E-mail enviado!\n\nVerifique sua caixa de entrada e siga as instruções para redefinir sua senha."
				);
			} else {
				Alert.alert(
					"✅ E-mail Enviado!",
					"Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.",
					[
						{
							text: "OK",
							onPress: () => router.back(),
						},
					]
				);
			}

			// No web, volta para o login
			if (Platform.OS === "web") {
				router.back();
			}
		} catch (error: any) {
			console.error("❌ Erro ao enviar e-mail:", error);

			let errorMessage = "Não foi possível enviar o e-mail de recuperação.";

			if (error.code === "auth/user-not-found") {
				errorMessage = "Não existe uma conta com este e-mail.";
			} else if (error.code === "auth/invalid-email") {
				errorMessage = "E-mail inválido.";
			} else if (error.code === "auth/too-many-requests") {
				errorMessage = "Muitas tentativas. Tente novamente em alguns minutos.";
			}

			if (Platform.OS === "web") {
				window.alert(`❌ Erro: ${errorMessage}`);
			} else {
				Alert.alert("❌ Erro", errorMessage);
			}
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<KeyboardAvoidingView
			style={styles.container}
			behavior={Platform.OS === "ios" ? "padding" : undefined}
		>
			<StatusBar barStyle="light-content" backgroundColor="#1E4369" />

			<ScrollView
				contentContainerStyle={styles.scrollContent}
				keyboardShouldPersistTaps="handled"
			>
				{/* Header */}
				<View style={styles.header}>
					<TouchableOpacity
						style={styles.backButton}
						onPress={() => router.back()}
					>
						<Ionicons name="arrow-back" size={24} color="#FFFFFF" />
					</TouchableOpacity>
					<Text style={styles.headerTitle}>Recuperar Senha</Text>
				</View>

				{/* Card */}
				<View style={styles.card}>
					{/* Ícone */}
					<View style={styles.iconContainer}>
						<Ionicons name="key-outline" size={64} color="#1E4369" />
					</View>

					{/* Título */}
					<Text style={styles.title}>Esqueceu sua senha?</Text>
					<Text style={styles.subtitle}>
						Informe seu e-mail e enviaremos instruções para redefinir sua senha.
					</Text>

					{/* Input de E-mail */}
					<View style={styles.inputWrapper}>
						<View style={styles.inputIcon}>
							<Ionicons name="mail-outline" size={20} color="#757575" />
						</View>
						<TextInput
							style={styles.input}
							placeholder="Seu e-mail"
							value={email}
							onChangeText={setEmail}
							keyboardType="email-address"
							autoCapitalize="none"
							autoCorrect={false}
							editable={!isLoading}
							placeholderTextColor="#999"
						/>
					</View>

					{/* Botão Enviar */}
					<TouchableOpacity
						style={[styles.sendButton, isLoading && styles.sendButtonDisabled]}
						onPress={handleResetPassword}
						disabled={isLoading}
						activeOpacity={0.8}
					>
						{isLoading ? (
							<ActivityIndicator color="#FFFFFF" size="small" />
						) : (
							<>
								<Ionicons name="send" size={20} color="#FFFFFF" />
								<Text style={styles.sendButtonText}>Enviar E-mail</Text>
							</>
						)}
					</TouchableOpacity>

					{/* Botão Voltar */}
					<TouchableOpacity
						style={styles.backToLoginButton}
						onPress={() => router.back()}
						disabled={isLoading}
					>
						<Ionicons name="arrow-back" size={18} color="#1E4369" />
						<Text style={styles.backToLoginText}>Voltar para o Login</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#1E4369",
	},
	scrollContent: {
		flexGrow: 1,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		paddingTop: Platform.OS === "android" ? StatusBar.currentHeight || 0 : 44,
		paddingHorizontal: 16,
		paddingBottom: 16,
	},
	backButton: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: "rgba(255, 255, 255, 0.1)",
		justifyContent: "center",
		alignItems: "center",
		marginRight: 16,
	},
	headerTitle: {
		fontSize: 20,
		fontWeight: "600",
		color: "#FFFFFF",
	},
	card: {
		flex: 1,
		backgroundColor: "#FFFFFF",
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24,
		padding: 24,
		marginTop: 20,
	},
	iconContainer: {
		width: 100,
		height: 100,
		borderRadius: 50,
		backgroundColor: "#E3F2FD",
		justifyContent: "center",
		alignItems: "center",
		alignSelf: "center",
		marginBottom: 24,
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		color: "#212121",
		textAlign: "center",
		marginBottom: 12,
	},
	subtitle: {
		fontSize: 14,
		color: "#757575",
		textAlign: "center",
		lineHeight: 20,
		marginBottom: 32,
		paddingHorizontal: 16,
	},
	inputWrapper: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#F5F5F5",
		borderRadius: 12,
		paddingHorizontal: 16,
		marginBottom: 24,
		borderWidth: 1,
		borderColor: "#E0E0E0",
	},
	inputIcon: {
		marginRight: 12,
	},
	input: {
		flex: 1,
		paddingVertical: 16,
		fontSize: 16,
		color: "#212121",
	},
	sendButton: {
		flexDirection: "row",
		backgroundColor: "#4CAF50",
		paddingVertical: 16,
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
		elevation: 2,
		shadowColor: "#000",
		shadowOffset: {width: 0, height: 2},
		shadowOpacity: 0.1,
		shadowRadius: 4,
		marginBottom: 16,
	},
	sendButtonDisabled: {
		backgroundColor: "#B0B0B0",
	},
	sendButtonText: {
		fontSize: 16,
		fontWeight: "600",
		color: "#FFFFFF",
	},
	backToLoginButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 12,
		gap: 8,
	},
	backToLoginText: {
		fontSize: 14,
		fontWeight: "600",
		color: "#1E4369",
	},
});
