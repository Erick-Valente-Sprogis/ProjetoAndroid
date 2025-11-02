// app/(auth)/register.tsx
// app/(auth)/register.tsx

import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
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
import axios from "axios";

export default function RegisterScreen() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [fullName, setFullName] = useState("");
	const [phone, setPhone] = useState("");
	const [isPasswordVisible, setIsPasswordVisible] = useState(false);

	const [emailError, setEmailError] = useState("");
	const [passwordError, setPasswordError] = useState("");
	const [fullNameError, setFullNameError] = useState("");

	const router = useRouter();

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

	const handleRegister = async () => {
		if (!validateFields()) return;
		try {
			await axios.post("http://localhost:3000/auth/register", {
				email,
				password,
				fullName,
				phone,
			});
			Alert.alert("Conta Criada!", "Faça login para continuar.");
			router.replace("/(auth)/login");
		} catch (error: any) {
			const errorMessage =
				error.response?.data?.message ||
				"Ocorreu um erro ao tentar criar a conta.";
			Alert.alert("Erro no Cadastro", errorMessage);
		}
	};

	return (
		<View style={styles.container}>
			<View style={styles.card}>
				<ScrollView contentContainerStyle={styles.form}>
					<Text style={styles.title}>Crie sua Conta</Text>

					<TextInput
						style={styles.input}
						placeholder="Nome Completo"
						value={fullName}
						onChangeText={setFullName}
					/>
					{fullNameError ? (
						<Text style={styles.errorText}>{fullNameError}</Text>
					) : null}

					<TextInput
						style={styles.input}
						placeholder="Email"
						value={email}
						onChangeText={setEmail}
						autoCapitalize="none"
						keyboardType="email-address"
					/>
					{emailError ? (
						<Text style={styles.errorText}>{emailError}</Text>
					) : null}

					<TextInput
						style={styles.input}
						placeholder="Telefone / WhatsApp (Opcional)"
						value={phone}
						onChangeText={setPhone}
						keyboardType="phone-pad"
					/>

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

					<TouchableOpacity style={styles.button} onPress={handleRegister}>
						<Text style={styles.buttonText}>CADASTRAR</Text>
					</TouchableOpacity>

					<Link href="/(auth)/login" asChild>
						<TouchableOpacity style={styles.linkButton}>
							<Text style={styles.linkText}>
								Já tem uma conta?{" "}
								<Text style={styles.linkHighlight}>Faça login</Text>
							</Text>
						</TouchableOpacity>
					</Link>
				</ScrollView>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff", // fundo preto
		justifyContent: "center",
		alignItems: "center",
	},
	card: {
		width: "90%",
		maxWidth: 400,
		backgroundColor: "#fff",
		borderRadius: 20,
		padding: 24,
		elevation: 8,
		shadowColor: "#000",
		shadowOpacity: 0.3,
		shadowOffset: { width: 0, height: 4 },
		shadowRadius: 8,
	},
	form: {
		alignItems: "stretch",
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		textAlign: "center",
		color: "#1E4369",
		marginBottom: 24,
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
	inputField: { flex: 1, height: 50 },
	icon: { padding: 5 },
	errorText: {
		color: "red",
		marginTop: 4,
		marginLeft: 5,
		fontSize: 12,
	},
	button: {
		backgroundColor: "#1E4369",
		padding: 15,
		borderRadius: 8,
		alignItems: "center",
		marginTop: 24,
	},
	buttonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "bold",
	},
	linkButton: { marginTop: 18 },
	linkText: { textAlign: "center", color: "#555", fontSize: 14 },
	linkHighlight: { color: "#1E4369", fontWeight: "bold" },
});
