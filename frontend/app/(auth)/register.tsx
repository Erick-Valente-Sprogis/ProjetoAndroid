// Cole este código em: primeiro/app/(auth)/register.tsx
import {Ionicons} from "@expo/vector-icons";
import {Link, useRouter} from "expo-router";
import {createUserWithEmailAndPassword, signOut} from "firebase/auth";
import React, {useState} from "react";
import {
	Alert,
	Pressable,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import {auth} from "../../firebaseConfig";

export default function RegisterScreen() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const router = useRouter();

	const [isPasswordVisible, setIsPasswordVisible] = useState(false);
	const [emailError, setEmailError] = useState("");
	const [passwordError, setPasswordError] = useState("");

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
		} else if (password.length < 6) {
			setPasswordError("A senha deve ter pelo menos 6 caracteres.");
			isValid = false;
		}

		return isValid;
	};

	const handleRegister = async () => {
		if (!validateFields()) return;

		try {
			await createUserWithEmailAndPassword(auth, email, password);
			await signOut(auth);
			Alert.alert(
				"Conta Criada!",
				"Sua conta foi criada com sucesso. Por favor, faça o login."
			);
			router.replace("/(auth)/login");
		} catch (error: any) {
			if (error.code === "auth/email-already-in-use") {
				setEmailError("Este endereço de e-mail já está em uso.");
			} else {
				Alert.alert("Erro no Cadastro", "Ocorreu um erro inesperado.");
			}
		}
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Crie sua Conta</Text>

			<TextInput
				style={styles.input}
				placeholder="Email"
				value={email}
				onChangeText={setEmail}
				autoCapitalize="none"
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
		</View>
	);
}

const styles = StyleSheet.create({
	container: {flex: 1, justifyContent: "center", padding: 16},
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
});
