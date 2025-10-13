// Cole este código completo em: primeiro/app/(auth)/login.tsx

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
} from "react-native";
import {auth} from "../../firebaseConfig";

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
		// A validação inicial continua a mesma
		if (!validateFields()) return;

		try {
			await signInWithEmailAndPassword(auth, email, password);
			router.replace("/(app)");
		} catch (error: any) {
			// O bloco switch agora tem um comportamento diferente para senha incorreta
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
					// EM VEZ DE UM ALERTA, AGORA DEFINIMOS O ERRO NOS ESTADOS
					// Isso fará o texto vermelho aparecer abaixo dos campos de input.
					setEmailError("E-mail ou senha incorretos.");
					setPasswordError(" "); // Usamos um espaço para acionar a cor vermelha sem repetir a mensagem.
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

			<Text style={styles.title}>Bem-vindo!</Text>

			<TextInput
				style={styles.input}
				placeholder="Email"
				value={email}
				onChangeText={setEmail}
				autoCapitalize="none"
				keyboardType="email-address"
			/>
			{emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

			{/* ===== CAMPO DE SENHA QUE ESTAVA FALTANDO ===== */}
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
						size={24}
						color="gray"
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
				<Text style={styles.linkText}>Esqueci minha senha</Text>
			</TouchableOpacity>

			<TouchableOpacity style={styles.button} onPress={handleLogin}>
				<Text style={styles.buttonText}>LOGIN</Text>
			</TouchableOpacity>

			{/* ===== LINK DE CADASTRO QUE ESTAVA FALTANDO ===== */}
			<Link href="/(auth)/register" asChild>
				<TouchableOpacity style={styles.linkButton}>
					<Text style={styles.linkText}>Não tem uma conta? Cadastre-se</Text>
				</TouchableOpacity>
			</Link>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		padding: 16,
		backgroundColor: "#f5f5f5",
	},
	title: {
		fontSize: 28,
		textAlign: "center",
		marginBottom: 24,
		fontWeight: "bold",
	},
	input: {
		height: 50,
		borderColor: "#ccc",
		borderWidth: 1,
		borderRadius: 8,
		paddingHorizontal: 10,
		backgroundColor: "#fff",
		marginTop: 12,
	},
	inputContainer: {
		flexDirection: "row",
		alignItems: "center",
		borderColor: "#ccc",
		borderWidth: 1,
		borderRadius: 8,
		backgroundColor: "#fff",
		paddingHorizontal: 10,
		marginTop: 12,
	},
	inputField: {flex: 1, height: 50},
	icon: {padding: 5},
	errorText: {color: "red", marginTop: 4, marginLeft: 5, fontSize: 12},
	button: {
		backgroundColor: "#007BFF",
		padding: 15,
		borderRadius: 8,
		alignItems: "center",
		marginTop: 20,
	},
	buttonText: {color: "#fff", fontSize: 16, fontWeight: "bold"},
	linkButton: {marginTop: 20},
	linkText: {color: "#007BFF", textAlign: "center"},
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
		alignItems: "center",
	},
	modalTitle: {fontSize: 22, fontWeight: "bold", marginBottom: 20},
	modalInput: {
		width: "100%",
		height: 50,
		borderColor: "#ccc",
		borderWidth: 1,
		borderRadius: 8,
		paddingHorizontal: 10,
		marginBottom: 20,
	},
	modalButtonContainer: {
		flexDirection: "row",
		width: "100%",
		justifyContent: "space-between",
	},
	modalButton: {flex: 1, padding: 15, borderRadius: 8, alignItems: "center"},
	cancelButton: {backgroundColor: "#f0f0f0", marginRight: 10},
	cancelButtonText: {color: "#333", fontWeight: "bold"},
	sendButton: {backgroundColor: "#007BFF", marginLeft: 10},
	sendButtonText: {color: "white", fontWeight: "bold"},
});
