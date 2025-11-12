import { initializeApp } from "firebase/app";
import { 
	getAuth, 
	initializeAuth, 
	getReactNativePersistence,
	browserLocalPersistence,
	setPersistence
} from "firebase/auth";
import { getStorage } from "firebase/storage";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const firebaseConfig = {
	apiKey: "AIzaSyBW0_8mHX8fmaVoInpCTHp5LyxP9QO1DZM",
	authDomain: "primeiro-fb4fb.firebaseapp.com",
	projectId: "primeiro-fb4fb",
	storageBucket: "primeiro-fb4fb.appspot.com",
	messagingSenderId: "24633684916",
	appId: "1:24633684916:web:f6d58787b5048066ab38e1",
	measurementId: "G-RXJPL1M8MP",
};

const app = initializeApp(firebaseConfig);

// Configuração diferente para web e mobile
let auth;

if (Platform.OS === 'web') {
	// Para WEB: usa getAuth + setPersistence
	console.log("?? Detectado ambiente WEB - usando browserLocalPersistence");
	auth = getAuth(app);
	setPersistence(auth, browserLocalPersistence).catch((error) => {
		console.error("Erro ao configurar persistência web:", error);
	});
} else {
	// Para MOBILE: usa initializeAuth + AsyncStorage
	console.log("?? Detectado ambiente MOBILE - usando AsyncStorage");
	auth = initializeAuth(app, {
		persistence: getReactNativePersistence(AsyncStorage)
	});
}

const storage = getStorage(app);

export { auth, storage };
export default app;