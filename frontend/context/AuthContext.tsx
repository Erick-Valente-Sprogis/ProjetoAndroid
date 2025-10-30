// Em: frontend/context/AuthContext.tsx

import {User, onAuthStateChanged} from "firebase/auth";
import React, {createContext, useContext, useEffect, useState} from "react";
import {auth} from "../firebaseConfig";
import api from "../src/services/api"; // Certifique-se que o caminho está correto

// 1. Tipo do perfil do seu backend (Prisma)
type UserProfile = {
	id: string;
	uid: string;
	email: string;
	fullName: string;
	role: "user" | "admin";
	phone?: string;
	photoUrl?: string;
};

// 2. Tipo do que o Context vai fornecer
type AuthContextType = {
	user: User | null; // Usuário do Firebase
	profile: UserProfile | null; // Perfil do Backend
	isLoading: boolean; // Flag de carregamento
};

// 3. Criação do Context
const AuthContext = createContext<AuthContextType>({
	user: null,
	profile: null,
	isLoading: true,
});

// 4. Hook para consumir o Context
export const useAuth = () => {
	return useContext(AuthContext);
};

// 5. O Provedor
export const AuthProvider = ({children}: {children: React.ReactNode}) => {
	const [user, setUser] = useState<User | null>(null);
	const [profile, setProfile] = useState<UserProfile | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		// Escuta mudanças no login do Firebase
		const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
			try {
				if (firebaseUser) {
					// Usuário está logado
					setUser(firebaseUser);

					// Busca o perfil no nosso backend
					const token = await firebaseUser.getIdToken();
					const response = await api.get("/auth/me", {
						headers: {Authorization: `Bearer ${token}`},
					});
					setProfile(response.data);
				} else {
					// Usuário está deslogado
					setUser(null);
					setProfile(null);
				}
			} catch (error) {
				// Se der erro (ex: backend desligado),
				// garante que o usuário seja deslogado
				console.error("Erro no AuthContext:", error);
				setUser(null);
				setProfile(null);
			} finally {
				// ESSENCIAL: Garante que o app saia da tela de splash
				setIsLoading(false);
			}
		});

		return () => unsubscribe();
	}, []);

	const value = {user, profile, isLoading};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
