import {initializeApp} from "firebase/app";
import {getAuth} from "firebase/auth";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: "AIzaSyBW0_8mHX8fmaVoInpCTHp5LyxP9QO1DZM",
	authDomain: "primeiro-fb4fb.firebaseapp.com",
	projectId: "primeiro-fb4fb",
	storageBucket: "primeiro-fb4fb.firebasestorage.app",
	messagingSenderId: "24633684916",
	appId: "1:24633684916:web:f6d58787b5048066ab38e1",
	measurementId: "G-RXJPL1M8MP",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
