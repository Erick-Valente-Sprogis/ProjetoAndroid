// primeiro/app/(auth)/login.tsx

import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import {
	sendPasswordResetEmail,
	signInWithEmailAndPassword,
} from "firebase/auth";
import React, { useState } from "react";
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
} from "react-native";
import { auth } from "../../firebaseConfig";

export default function LoginScreen() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const router = useRouter();

	const [isPasswordVisible, setIsPasswordVisible] = useState(false);
	const [emailError, setEmailError] = useState("");
	const [passwordError, setPasswordError] = useState("");

	const [isModalVisible, setIsModalVisible] = useState(false);
	const [resetEmail, setResetEmail] = useState("");

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

		try {
			await signInWithEmailAndPassword(auth, email, password);
			router.replace("/(app)");
		} catch (error: any) {
			switch (error.code) {
				case "auth/user-not-found":
					Alert.alert(
						"Usuário não encontrado",
						"Parece que você ainda não tem uma conta. Vamos criar uma!",
						[
							{ text: "Agora não", style: "cancel" },
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
		}
	};

	const handleSendResetEmail = () => {
		if (!resetEmail || !/\S+@\S+\.\S+/.test(resetEmail)) {
			Alert.alert("E-mail Inválido", "Por favor, insira um e-mail válido.");
			return;
		}
		sendPasswordResetEmail(auth, resetEmail)
			.then(() => {
				setIsModalVisible(false);
				setResetEmail("");
				Alert.alert(
					"Verifique seu E-mail",
					`Um link para redefinir sua senha foi enviado para ${resetEmail}.`
				);
			})
			.catch(() => {
				Alert.alert(
					"Erro",
					"Não foi possível enviar o e-mail. Verifique se o e-mail está correto."
				);
			});
	};

	return (
		<View style={styles.container}>
			{/* Modal de Redefinir Senha */}
			<Modal
				animationType="slide"
				transparent={true}
				visible={isModalVisible}
				onRequestClose={() => setIsModalVisible(false)}
			>
				<View style={styles.modalOverlay}>
					<View style={styles.modalContainer}>
						<Text style={styles.modalTitle}>Redefinir Senha</Text>
						<TextInput
							style={styles.modalInput}
							placeholder="Digite seu e-mail"
							value={resetEmail}
							onChangeText={setResetEmail}
							keyboardType="email-address"
						/>
						<View style={styles.modalButtonContainer}>
							<TouchableOpacity
								style={[styles.modalButton, styles.cancelButton]}
								onPress={() => setIsModalVisible(false)}
							>
								<Text style={styles.cancelButtonText}>Cancelar</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={[styles.modalButton, styles.sendButton]}
								onPress={handleSendResetEmail}
							>
								<Text style={styles.sendButtonText}>Enviar</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
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
					/>
					{emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

					<View style={styles.inputContainer}>
						<TextInput
							style={styles.inputField}
							placeholder="Senha"
							value={password}
							onChangeText={setPassword}
							secureTextEntry={!isPasswordVisible}
						/>
						<Pressable
							onPress={() => setIsPasswordVisible(!isPasswordVisible)}
							style={styles.icon}
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
						onPress={() => setIsModalVisible(true)}
					>
						<Text style={styles.linkText}>Esqueceu sua senha?</Text>
					</TouchableOpacity>

					<TouchableOpacity style={styles.button} onPress={handleLogin}>
						<Text style={styles.buttonText}>ENTRAR</Text>
					</TouchableOpacity>

					<Link href="/(auth)/register" asChild>
						<TouchableOpacity style={styles.registerButton}>
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
	inputField: { flex: 1 },
	icon: { padding: 5 },
	errorText: { color: "red", marginTop: 4, fontSize: 12 },
	button: {
		backgroundColor: "#1E4369",
		padding: 16,
		borderRadius: 50,
		alignItems: "center",
		marginTop: 20,
	},
	buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
	linkButton: { marginTop: 12 },
	linkText: { color: "#1E4369", textAlign: "center", fontSize: 14 },
	registerButton: { marginTop: 20 },
	registerText: { color: "#555", textAlign: "center" },
	registerHighlight: { color: "#1E4369", fontWeight: "bold" },
	modalOverlay: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(0,0,0,0.5)",
	},
	modalContainer: {
		width: "85%",
		backgroundColor: "#fff",
		borderRadius: 16,
		padding: 20,
		alignItems: "center",
	},
	modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 15 },
	modalInput: {
		width: "100%",
		height: 45,
		borderColor: "#ccc",
		borderWidth: 1,
		borderRadius: 10,
		paddingHorizontal: 10,
		marginBottom: 15,
	},
	modalButtonContainer: {
		flexDirection: "row",
		width: "100%",
		justifyContent: "space-between",
	},
	modalButton: {
		flex: 1,
		padding: 12,
		borderRadius: 50,
		alignItems: "center",
	},
	cancelButton: { backgroundColor: "#f0f0f0", marginRight: 10 },
	cancelButtonText: { color: "#333", fontWeight: "bold" },
	sendButton: { backgroundColor: "#1E4369", marginLeft: 10 },
	sendButtonText: { color: "#fff", fontWeight: "bold" },
});
