// app/(app)/admin.tsx - Tela de Admin (Temporária)

import React from "react";
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function AdminScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E4369" />
      
      <View style={styles.appBar}>
        <Text style={styles.appBarTitle}>Área do Admin</Text>
      </View>

      <View style={styles.content}>
        <Ionicons name="construct-outline" size={64} color="#BDBDBD" />
        <Text style={styles.title}>Em Construção</Text>
        <Text style={styles.subtitle}>
          A área administrativa estará disponível em breve
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  appBar: {
    backgroundColor: "#1E4369",
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 44,
    paddingHorizontal: 16,
    paddingBottom: 16,
    elevation: 4,
  },
  appBarTitle: {
    fontSize: 20,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});