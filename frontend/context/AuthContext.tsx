import {User, onAuthStateChanged} from "firebase/auth";
import React, {createContext, useContext, useEffect, useState} from "react";
import {auth} from "../firebaseConfig"; // Vamos criar este arquivo a seguir

const AuthContext = createContext<{user: User | null}>({
	user: null,
});

export const useAuth = () => {
	return useContext(AuthContext);
};

export const AuthProvider = ({children}: {children: React.ReactNode}) => {
	const [user, setUser] = useState<User | null>(null);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			setUser(user);
		});

		return () => unsubscribe();
	}, []);

	return <AuthContext.Provider value={{user}}>{children}</AuthContext.Provider>;
};
