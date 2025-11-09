// Em: frontend/context/AuthContext.tsx

import { User, onAuthStateChanged } from "firebase/auth";
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebaseConfig";
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
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const [user, setUser] = useState<User | null>(null);
	const [profile, setProfile] = useState<UserProfile | null>(null);
	const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
	console.log("🟡 AuthContext: Iniciando monitoramento");
	
	const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
		console.log("====================================");
		console.log("🟡🟡🟡 onAuthStateChanged DISPARADO!");
		console.log("🟡 firebaseUser:", firebaseUser ? firebaseUser.email : "null");
		console.log("====================================");
		
		setIsLoading(true);
		
		if (firebaseUser) {
			console.log("✅ Setando user no state...");
			setUser(firebaseUser);

			try {
				console.log("🟡 Buscando perfil no backend...");
				const token = await firebaseUser.getIdToken();
				const response = await api.get("/auth/me", {
					headers: { Authorization: `Bearer ${token}` },
				});
				console.log("✅ Perfil carregado do backend!");
				setProfile(response.data);
			} catch (error) {
				console.log("⚠️ Backend falhou - criando perfil temporário");
				setProfile({
					id: firebaseUser.uid,
					uid: firebaseUser.uid,
					email: firebaseUser.email || "",
					fullName: firebaseUser.displayName || firebaseUser.email || "Usuário",
					role: "user",
				});
			}
		} else {
			console.log("🚪 Deslogado");
			setUser(null);
			setProfile(null);
		}
		
		console.log("✅✅✅ setIsLoading(false)");
		setIsLoading(false);
	});

	return () => unsubscribe();
}, []);

	const value = { user, profile, isLoading };

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
