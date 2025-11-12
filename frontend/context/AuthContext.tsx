// frontend/context/AuthContext.tsx

import {User, onAuthStateChanged} from "firebase/auth";
import React, {createContext, useContext, useEffect, useState} from "react";
import {auth} from "../firebaseConfig";
import api from "../src/services/api";

// 1. Tipo do perfil do seu backend (Prisma)
type UserProfile = {
	id: string;
	uid: string;
	email: string;
	fullName: string;
	role: "user" | "admin";
	phone?: string;
	photoUrl?: string;
	isBlocked?: boolean;
};

// 2. Tipo do que o Context vai fornecer
type AuthContextType = {
	user: User | null;
	profile: UserProfile | null;
	isLoading: boolean;
	refreshProfile: () => Promise<void>;
};

// 3. Criação do Context
const AuthContext = createContext<AuthContextType>({
	user: null,
	profile: null,
	isLoading: true,
	refreshProfile: async () => {},
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

	// Função para buscar perfil do backend
	const fetchProfile = async (firebaseUser: User) => {
		try {
			console.log("🟡 Buscando perfil no backend...");
			const token = await firebaseUser.getIdToken();
			const response = await api.get("/auth/me", {
				headers: {Authorization: `Bearer ${token}`},
			});
			console.log("✅ Perfil carregado do backend!");
			setProfile(response.data);
		} catch (error) {
			console.log("⚠️ Backend falhou - criando perfil temporário");
			setProfile({
				id: firebaseUser.uid,
				uid: firebaseUser.uid,
				email: firebaseUser.email || "",
				fullName:
					firebaseUser.displayName ||
					firebaseUser.email?.split("@")[0] ||
					"Usuário",
				role: "user",
			});
		}
	};

	// Função pública para recarregar o perfil
	const refreshProfile = async () => {
		if (user) {
			await fetchProfile(user);
		}
	};

	useEffect(() => {
		console.log("🟡 AuthContext: Iniciando monitoramento");

		const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
			console.log("====================================");
			console.log("🟡🟡🟡 onAuthStateChanged DISPARADO!");
			console.log(
				"🟡 firebaseUser:",
				firebaseUser ? firebaseUser.email : "null"
			);
			console.log("====================================");

			setIsLoading(true);

			if (firebaseUser) {
				console.log("✅ Usuário autenticado - setando state...");
				setUser(firebaseUser);
				await fetchProfile(firebaseUser);
			} else {
				console.log("🚪 Usuário deslogado - limpando state...");
				setUser(null);
				setProfile(null);
			}

			console.log("✅✅✅ setIsLoading(false)");
			setIsLoading(false);
		});

		return () => {
			console.log("🔴 AuthContext: Desmontando listener");
			unsubscribe();
		};
	}, []);

	const value = {user, profile, isLoading, refreshProfile};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
