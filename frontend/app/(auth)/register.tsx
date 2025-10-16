import {Ionicons} from "@expo/vector-icons";
import {Link, useRouter} from "expo-router";
import React, {useState} from "react";
import {
	Alert,
	Pressable,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
	ScrollView,
} from "react-native";
import axios from "axios"; // Importamos o Axios

export default function RegisterScreen() {
	// Adicionamos estados для os novos campos
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [fullName, setFullName] = useState("");
	const [phone, setPhone] = useState("");
	const router = useRouter();

	const [isPasswordVisible, setIsPasswordVisible] = useState(false);
	const [emailError, setEmailError] = useState("");
	const [passwordError, setPasswordError] = useState("");
	const [fullNameError, setFullNameError] = useState("");

	// Atualizamos a validação para incluir o nome completo
	const validateFields = () => {
		let isValid = true;
		setEmailError("");
		setPasswordError("");
		setFullNameError("");

		if (!fullName) {
			setFullNameError("O campo Nome Completo é obrigatório.");
			isValid = false;
		}

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
		} else if (password.length < 6) {
			setPasswordError("A senha deve ter pelo menos 6 caracteres.");
			isValid = false;
		}

		return isValid;
	};

	// --- A NOVA LÓGICA DE CADASTRO ---
	const handleRegister = async () => {
		if (!validateFields()) return;

		try {
			// Chamamos a NOSSA API no backend, em vez do Firebase diretamente
			await axios.post("http://localhost:3000/auth/register", {
				email,
				password,
				fullName,
				phone,
			});

			Alert.alert(
				"Conta Criada!",
				"Sua conta foi criada com sucesso. Por favor, faça o login."
			);
			router.replace("/(auth)/login");
		} catch (error: any) {
			// Exibe a mensagem de erro que vem do NOSSO backend
			const errorMessage =
				error.response?.data?.message ||
				"Ocorreu um erro ao tentar criar a conta.";
			Alert.alert("Erro no Cadastro", errorMessage);
		}
	};

	return (
		<ScrollView contentContainerStyle={styles.container}>
			<Text style={styles.title}>Crie sua Conta</Text>

			{/* Campo Nome Completo */}
			<TextInput
				style={styles.input}
				placeholder="Nome Completo"
				value={fullName}
				onChangeText={setFullName}
			/>
			{fullNameError ? (
				<Text style={styles.errorText}>{fullNameError}</Text>
			) : null}

			{/* Campo E-mail */}
			<TextInput
				style={styles.input}
				placeholder="Email"
				value={email}
				onChangeText={setEmail}
				autoCapitalize="none"
				keyboardType="email-address"
			/>
			{emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

			{/* Campo Telefone (Opcional) */}
			<TextInput
				style={styles.input}
				placeholder="Telefone / WhatsApp (Opcional)"
				value={phone}
				onChangeText={setPhone}
				keyboardType="phone-pad"
			/>

			{/* Campo Senha */}
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

			<TouchableOpacity style={styles.button} onPress={handleRegister}>
				<Text style={styles.buttonText}>CADASTRAR</Text>
			</TouchableOpacity>

			<Link href="/(auth)/login" asChild>
				<TouchableOpacity style={styles.linkButton}>
					<Text style={styles.linkText}>Já tem uma conta? Faça login</Text>
				</TouchableOpacity>
			</Link>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {flexGrow: 1, justifyContent: "center", padding: 16},
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
	linkButton: {marginTop: 20, paddingBottom: 20},
	linkText: {color: "#007BFF", textAlign: "center"},
});
