import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import api from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("teste@email.com");
  const [senha, setSenha] = useState("123456");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // 🆘 BOTÃO DE EMERGÊNCIA - ENTRAR SEM LOGIN
  const handleEmergencyLogin = async () => {
    try {
      console.log("🆘 [EMERGÊNCIA] Entrando sem autenticação...");

      // Token fake para testes
      const fakeToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MX0.fake";

      await AsyncStorage.setItem("userToken", fakeToken);
      await AsyncStorage.setItem("userId", "1");
      await AsyncStorage.setItem("userName", "Usuário Teste");

      Alert.alert("✅ Modo Emergência", "Entrando no app...");
      navigation.replace("Home");
    } catch (error) {
      console.error("❌ Erro no login de emergência:", error);
      Alert.alert("❌ Erro", "Não foi possível entrar");
    }
  };

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert("⚠️ Atenção", "Preencha todos os campos");
      return;
    }

    setLoading(true);
    try {
      console.log("🔐 Tentando login com:", email);

      const response = await api.post("/api/auth/login", {
        email: email.trim().toLowerCase(),
        senha: senha,
      });

      console.log("✅ Login bem-sucedido:", response.data);

      await AsyncStorage.setItem("userToken", response.data.token);
      await AsyncStorage.setItem("userId", response.data.usuario.id.toString());
      await AsyncStorage.setItem("userName", response.data.usuario.nome);

      Alert.alert("✅ Sucesso", "Login realizado com sucesso!");
      navigation.replace("Home");
    } catch (error) {
      console.error("❌ Erro no login:", error.response?.data || error);

      const errorMessage = error.response?.data?.message || "Erro ao fazer login";

      Alert.alert(
        "❌ Erro no Login",
        errorMessage + "\n\nDeseja usar o modo emergência?",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Modo Emergência", onPress: handleEmergencyLogin },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.header}>
        <Text style={styles.title}>ColheCash</Text>
        <Text style={styles.subtitle}>Gestão Financeira para Agricultores</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Ionicons
            name="mail-outline"
            size={20}
            color="#888"
            style={styles.icon}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color="#888"
            style={styles.icon}
          />
          <TextInput
            style={styles.input}
            placeholder="Senha"
            placeholderTextColor="#888"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? "eye-outline" : "eye-off-outline"}
              size={20}
              color="#888"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#111" />
          ) : (
            <Text style={styles.loginButtonText}>ENTRAR</Text>
          )}
        </TouchableOpacity>

        {/* 🆘 BOTÃO DE EMERGÊNCIA */}
        <TouchableOpacity
          style={styles.emergencyButton}
          onPress={handleEmergencyLogin}
        >
          <Text style={styles.emergencyButtonText}>
            🆘 ENTRAR SEM LOGIN (TESTE)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.forgotPassword}>
          <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
        </TouchableOpacity>

        <View style={styles.credentialsHint}>
          <Text style={styles.hintText}>💡 Credenciais de teste:</Text>
          <Text style={styles.hintText}>Email: teste@email.com</Text>
          <Text style={styles.hintText}>Senha: 123456</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Versão 1.0.0</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
    justifyContent: "space-between",
  },
  header: {
    marginTop: 80,
    alignItems: "center",
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#1ed760",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#888",
  },
  form: {
    paddingHorizontal: 30,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#333",
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    paddingVertical: 12,
  },
  loginButton: {
    backgroundColor: "#1ed760",
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 10,
  },
  loginButtonText: {
    color: "#111",
    fontSize: 16,
    fontWeight: "bold",
  },
  emergencyButton: {
    backgroundColor: "#ff4444",
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 15,
  },
  emergencyButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  forgotPassword: {
    alignItems: "center",
    marginTop: 20,
  },
  forgotPasswordText: {
    color: "#888",
    fontSize: 14,
  },
  credentialsHint: {
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    padding: 15,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#333",
  },
  hintText: {
    color: "#888",
    fontSize: 12,
    marginBottom: 4,
  },
  footer: {
    alignItems: "center",
    marginBottom: 30,
  },
  footerText: {
    color: "#555",
    fontSize: 12,
  },
});
