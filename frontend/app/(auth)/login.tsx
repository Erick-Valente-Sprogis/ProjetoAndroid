// frontend/app/(auth)/login.tsx

import {Ionicons} from "@expo/vector-icons";
import {Link, useRouter} from "expo-router";
import {
	sendPasswordResetEmail,
	signInWithEmailAndPassword,
} from "firebase/auth";
import React, {useState} from "react";
import {
	Alert,
	Modal,
	Pressable,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
	Image,
	ActivityIndicator,
	KeyboardAvoidingView,
	Platform,
} from "react-native";
import {auth} from "../../firebaseConfig";

export default function LoginScreen() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const router = useRouter();

	const [isPasswordVisible, setIsPasswordVisible] = useState(false);
	const [emailError, setEmailError] = useState("");
	const [passwordError, setPasswordError] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	// Modal de recuperação de senha
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [resetEmail, setResetEmail] = useState("");
	const [isSendingReset, setIsSendingReset] = useState(false);

	const validateFields = () => {
		let isValid = true;
		setEmailError("");
		setPasswordError("");
		if (!email) {
			setEmailError("O campo E-mail é obrigatório.");
			isValid = false;
		} else if (!/\S+@\S+\.\S+/.test(email)) {
			setEmailError("Por favor, insira um e-mail válido.");
			isValid = false;
		}
		if (!password) {
			setPasswordError("O campo Senha é obrigatório.");
			isValid = false;
		}
		return isValid;
	};

	const handleLogin = async () => {
		if (!validateFields()) return;

		console.log("====================================");
		console.log("🔵 1. Iniciando login...");
		console.log("🔵    Email:", email);

		setIsLoading(true);

		try {
			console.log("🔵 2. Chamando Firebase signInWithEmailAndPassword...");
			const userCredential = await signInWithEmailAndPassword(
				auth,
				email,
				password
			);

			console.log("🔵 3. Login bem-sucedido!");
			console.log("🔵    User UID:", userCredential.user.uid);
			console.log("🔵    User Email:", userCredential.user.email);

			console.log("🔵 4. Tentando navegar para /(app)...");
			router.replace("/(app)");

			console.log("🔵 5. Comando router.replace executado!");
			console.log("====================================");
		} catch (error: any) {
			console.log("====================================");
			console.log("🔴 ERRO no login!");
			console.log("🔴 Código:", error.code);
			console.log("🔴 Mensagem:", error.message);
			console.log("====================================");

			switch (error.code) {
				case "auth/user-not-found":
					Alert.alert(
						"Usuário não encontrado",
						"Parece que você ainda não tem uma conta. Vamos criar uma!",
						[
							{text: "Agora não", style: "cancel"},
							{
								text: "Cadastro",
								onPress: () => router.push("/(auth)/register"),
							},
						]
					);
					break;

				case "auth/invalid-credential":
				case "auth/wrong-password":
					setEmailError("E-mail ou senha incorretos.");
					setPasswordError(" ");
					break;

				case "auth/too-many-requests":
					Alert.alert(
						"Acesso Bloqueado Temporariamente",
						"Muitas tentativas falhas. Por favor, redefina sua senha ou aguarde."
					);
					break;

				default:
					Alert.alert("Erro ao fazer login", "Ocorreu um problema inesperado.");
					break;
			}
		} finally {
			setIsLoading(false);
		}
	};

	const handleOpenResetModal = () => {
		setResetEmail(email); // Pré-preenche com o e-mail do login
		setIsModalVisible(true);
	};

	const handleSendResetEmail = async () => {
		console.log("🔐 handleSendResetEmail chamado!");

		if (!resetEmail || !/\S+@\S+\.\S+/.test(resetEmail)) {
			Alert.alert("E-mail Inválido", "Por favor, insira um e-mail válido.");
			return;
		}

		setIsSendingReset(true);

		try {
			console.log("📧 Enviando e-mail de recuperação para:", resetEmail);
			await sendPasswordResetEmail(auth, resetEmail);
			console.log("✅ E-mail enviado com sucesso!");

			setIsModalVisible(false);
			setResetEmail("");

			Alert.alert(
				"✅ E-mail Enviado!",
				`Um link para redefinir sua senha foi enviado para ${resetEmail}.\n\nVerifique sua caixa de entrada e siga as instruções.`
			);
		} catch (error: any) {
			console.error("❌ Erro ao enviar e-mail:", error);

			let errorMessage =
				"Não foi possível enviar o e-mail. Verifique se o e-mail está correto.";

			if (error.code === "auth/user-not-found") {
				errorMessage = "Não existe uma conta com este e-mail.";
			} else if (error.code === "auth/invalid-email") {
				errorMessage = "E-mail inválido.";
			} else if (error.code === "auth/too-many-requests") {
				errorMessage = "Muitas tentativas. Tente novamente em alguns minutos.";
			}

			Alert.alert("❌ Erro", errorMessage);
		} finally {
			setIsSendingReset(false);
		}
	};

	return (
		<View style={styles.container}>
			{/* Modal de Redefinir Senha - MELHORADO */}
			<Modal
				animationType="slide"
				transparent={true}
				visible={isModalVisible}
				onRequestClose={() => !isSendingReset && setIsModalVisible(false)}
			>
				<KeyboardAvoidingView
					behavior={Platform.OS === "ios" ? "padding" : undefined}
					style={styles.modalOverlay}
				>
					<View style={styles.modalContainer}>
						{/* Ícone */}
						<View style={styles.modalIconContainer}>
							<Ionicons name="key-outline" size={48} color="#1E4369" />
						</View>

						{/* Título */}
						<Text style={styles.modalTitle}>Recuperar Senha</Text>
						<Text style={styles.modalSubtitle}>
							Informe seu e-mail e enviaremos instruções para redefinir sua
							senha.
						</Text>

						{/* Input */}
						<View style={styles.modalInputWrapper}>
							<Ionicons
								name="mail-outline"
								size={20}
								color="#757575"
								style={styles.modalInputIcon}
							/>
							<TextInput
								style={styles.modalInput}
								placeholder="Digite seu e-mail"
								value={resetEmail}
								onChangeText={setResetEmail}
								keyboardType="email-address"
								autoCapitalize="none"
								autoCorrect={false}
								editable={!isSendingReset}
								placeholderTextColor="#999"
							/>
						</View>

						{/* Botões */}
						<View style={styles.modalButtonContainer}>
							<TouchableOpacity
								style={[styles.modalButton, styles.cancelButton]}
								onPress={() => setIsModalVisible(false)}
								disabled={isSendingReset}
							>
								<Text style={styles.cancelButtonText}>Cancelar</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={[
									styles.modalButton,
									styles.sendButton,
									isSendingReset && styles.sendButtonDisabled,
								]}
								onPress={handleSendResetEmail}
								disabled={isSendingReset}
							>
								{isSendingReset ? (
									<ActivityIndicator color="#FFFFFF" size="small" />
								) : (
									<>
										<Ionicons name="send" size={18} color="#FFFFFF" />
										<Text style={styles.sendButtonText}>Enviar</Text>
									</>
								)}
							</TouchableOpacity>
						</View>
					</View>
				</KeyboardAvoidingView>
			</Modal>

			<View style={styles.card}>
				{/* Lado Esquerdo */}
				<View style={styles.leftPane}>
					<Image
						source={require("../../assets/images/1000522252.png")}
						style={styles.leftImage}
						resizeMode="contain"
					/>
					<Text style={styles.brandMessage}>
						Organize suas notas fiscais com facilidade e segurança.
					</Text>
				</View>

				{/* Lado Direito - Formulário */}
				<View style={styles.rightPane}>
					<Text style={styles.formTitle}>Acesse sua conta</Text>

					<TextInput
						style={styles.input}
						placeholder="E-mail"
						value={email}
						onChangeText={setEmail}
						autoCapitalize="none"
						keyboardType="email-address"
						editable={!isLoading}
					/>
					{emailError ? (
						<Text style={styles.errorText}>{emailError}</Text>
					) : null}

					<View style={styles.inputContainer}>
						<TextInput
							style={styles.inputField}
							placeholder="Senha"
							value={password}
							onChangeText={setPassword}
							secureTextEntry={!isPasswordVisible}
							editable={!isLoading}
						/>
						<Pressable
							onPress={() => setIsPasswordVisible(!isPasswordVisible)}
							style={styles.icon}
							disabled={isLoading}
						>
							<Ionicons
								name={isPasswordVisible ? "eye-off" : "eye"}
								size={22}
								color="#888"
							/>
						</Pressable>
					</View>
					{passwordError ? (
						<Text style={styles.errorText}>{passwordError}</Text>
					) : null}

					<TouchableOpacity
						style={styles.linkButton}
						onPress={handleOpenResetModal}
						disabled={isLoading}
					>
						<Text style={styles.linkText}>Esqueceu sua senha?</Text>
					</TouchableOpacity>

					<TouchableOpacity
						style={[styles.button, isLoading && styles.buttonDisabled]}
						onPress={handleLogin}
						disabled={isLoading}
					>
						{isLoading ? (
							<ActivityIndicator color="#FFFFFF" size="small" />
						) : (
							<Text style={styles.buttonText}>ENTRAR</Text>
						)}
					</TouchableOpacity>

					<Link href="/(auth)/register" asChild>
						<TouchableOpacity
							style={styles.registerButton}
							disabled={isLoading}
						>
							<Text style={styles.registerText}>
								Não tem uma conta?{" "}
								<Text style={styles.registerHighlight}>Cadastre-se agora</Text>
							</Text>
						</TouchableOpacity>
					</Link>
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f0f0f0",
		justifyContent: "center",
		alignItems: "center",
		padding: 16,
	},
	card: {
		width: "90%",
		height: "80%",
		flexDirection: "row",
		borderRadius: 20,
		overflow: "hidden",
		elevation: 6,
		backgroundColor: "#fff",
	},
	leftPane: {
		flex: 1,
		backgroundColor: "#1E4369",
		padding: 20,
		justifyContent: "center",
		alignItems: "center",
	},
	leftImage: {
		width: 150,
		height: 150,
		marginBottom: 20,
	},
	brandMessage: {
		color: "#fff",
		fontSize: 18,
		textAlign: "center",
	},
	rightPane: {
		flex: 1,
		backgroundColor: "#fff",
		padding: 24,
		justifyContent: "center",
	},
	formTitle: {
		fontSize: 24,
		fontWeight: "bold",
		color: "#1E1E1E",
		marginBottom: 20,
		textAlign: "center",
	},
	input: {
		height: 50,
		borderColor: "#ddd",
		borderWidth: 1,
		borderRadius: 12,
		paddingHorizontal: 12,
		backgroundColor: "#fff",
		marginTop: 12,
		elevation: 1,
	},
	inputContainer: {
		flexDirection: "row",
		alignItems: "center",
		borderColor: "#ddd",
		borderWidth: 1,
		borderRadius: 12,
		backgroundColor: "#fff",
		paddingHorizontal: 12,
		marginTop: 12,
		height: 50,
		elevation: 1,
	},
	inputField: {flex: 1},
	icon: {padding: 5},
	errorText: {color: "red", marginTop: 4, fontSize: 12},
	button: {
		backgroundColor: "#1E4369",
		padding: 16,
		borderRadius: 50,
		alignItems: "center",
		marginTop: 20,
	},
	buttonDisabled: {
		backgroundColor: "#B0B0B0",
	},
	buttonText: {color: "#fff", fontSize: 16, fontWeight: "bold"},
	linkButton: {marginTop: 12},
	linkText: {color: "#1E4369", textAlign: "center", fontSize: 14},
	registerButton: {marginTop: 20},
	registerText: {color: "#555", textAlign: "center"},
	registerHighlight: {color: "#1E4369", fontWeight: "bold"},

	// ✅ ESTILOS DO MODAL MELHORADOS
	modalOverlay: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(0,0,0,0.5)",
	},
	modalContainer: {
		width: "90%",
		maxWidth: 400,
		backgroundColor: "#fff",
		borderRadius: 20,
		padding: 24,
		alignItems: "center",
		elevation: 8,
	},
	modalIconContainer: {
		width: 80,
		height: 80,
		borderRadius: 40,
		backgroundColor: "#E3F2FD",
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 16,
	},
	modalTitle: {
		fontSize: 22,
		fontWeight: "bold",
		color: "#212121",
		marginBottom: 8,
	},
	modalSubtitle: {
		fontSize: 14,
		color: "#757575",
		textAlign: "center",
		marginBottom: 24,
		lineHeight: 20,
	},
	modalInputWrapper: {
		flexDirection: "row",
		alignItems: "center",
		width: "100%",
		backgroundColor: "#F5F5F5",
		borderRadius: 12,
		paddingHorizontal: 16,
		marginBottom: 20,
		borderWidth: 1,
		borderColor: "#E0E0E0",
	},
	modalInputIcon: {
		marginRight: 12,
	},
	modalInput: {
		flex: 1,
		height: 50,
		fontSize: 16,
		color: "#212121",
	},
	modalButtonContainer: {
		flexDirection: "row",
		width: "100%",
		gap: 12,
	},
	modalButton: {
		flex: 1,
		flexDirection: "row",
		padding: 14,
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
	},
	cancelButton: {
		backgroundColor: "#F5F5F5",
		borderWidth: 1,
		borderColor: "#E0E0E0",
	},
	cancelButtonText: {
		color: "#757575",
		fontWeight: "600",
		fontSize: 15,
	},
	sendButton: {
		backgroundColor: "#4CAF50",
		elevation: 2,
	},
	sendButtonDisabled: {
		backgroundColor: "#B0B0B0",
	},
	sendButtonText: {
		color: "#fff",
		fontWeight: "600",
		fontSize: 15,
	},
});
