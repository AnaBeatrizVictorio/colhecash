import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { signUp } from '../services/auth';
import { useNavigation } from '@react-navigation/native';

export default function CadastroScreen() {
  const navigation = useNavigation();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmeasenha, setConfirmeaSenha] = useState("");
  const [aceitoTermos, setAceitoTermos] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!nome.trim()) {
      newErrors.nome = "Nome é obrigatório";
    }

    if (!email.trim()) {
      newErrors.email = "E-mail é obrigatório";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "E-mail inválido";
    }

    if (!telefone.trim()) {
      newErrors.telefone = "Telefone é obrigatório";
    } else if (!/^\d{10,11}$/.test(telefone.replace(/\D/g, ''))) {
      newErrors.telefone = "Telefone inválido";
    }

    if (!senha) {
      newErrors.senha = "Senha é obrigatória";
    } else if (senha.length < 6) {
      newErrors.senha = "Senha deve ter pelo menos 6 caracteres";
    }

    if (!confirmeasenha) {
      newErrors.confirmeasenha = "Confirme sua senha";
    } else if (senha !== confirmeasenha) {
      newErrors.confirmeasenha = "As senhas não coincidem";
    }

    if (!aceitoTermos) {
      newErrors.termos = "Você precisa aceitar os termos de uso";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCadastro = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      // Prepara os dados do usuário
      const userData = {
        nome,
        email,
        telefone: telefone.replace(/\D/g, ''), // Remove caracteres não numéricos
        senha,
      };

      // Chama o serviço de cadastro
      await signUp(userData);

      // Navega para a Home após o cadastro bem-sucedido
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (error) {
      Alert.alert(
        "Erro",
        error.message || "Não foi possível criar sua conta. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatarTelefone = (text) => {
    const cleaned = text.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return text;
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <StatusBar hidden />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>CADASTRE-SE</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nome</Text>
            <TextInput
              placeholder="Seu nome completo"
              style={[styles.input, errors.nome && styles.inputError]}
              placeholderTextColor="#d9d9d9"
              value={nome}
              onChangeText={setNome}
            />
            {errors.nome && <Text style={styles.errorText}>{errors.nome}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>E-mail</Text>
            <TextInput
              placeholder="seu@email.com"
              style={[styles.input, errors.email && styles.inputError]}
              placeholderTextColor="#d9d9d9"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Telefone</Text>
            <TextInput
              placeholder="(00) 00000-0000"
              style={[styles.input, errors.telefone && styles.inputError]}
              placeholderTextColor="#d9d9d9"
              value={telefone}
              onChangeText={(text) => setTelefone(formatarTelefone(text))}
              keyboardType="phone-pad"
            />
            {errors.telefone && <Text style={styles.errorText}>{errors.telefone}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Senha</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                secureTextEntry={!showPassword}
                placeholder="Sua senha"
                style={[styles.input, styles.passwordInput, errors.senha && styles.inputError]}
                placeholderTextColor="#d9d9d9"
                value={senha}
                onChangeText={setSenha}
              />
              <TouchableOpacity 
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text>
                  <Ionicons 
                    name={showPassword ? "eye-off" : "eye"} 
                    size={24} 
                    color="#d9d9d9" 
                  />
                </Text>
              </TouchableOpacity>
            </View>
            {errors.senha && <Text style={styles.errorText}>{errors.senha}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirme a Senha</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                secureTextEntry={!showConfirmPassword}
                placeholder="Confirme sua senha"
                style={[styles.input, styles.passwordInput, errors.confirmeasenha && styles.inputError]}
                placeholderTextColor="#d9d9d9"
                value={confirmeasenha}
                onChangeText={setConfirmeaSenha}
              />
              <TouchableOpacity 
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Text>
                  <Ionicons 
                    name={showConfirmPassword ? "eye-off" : "eye"} 
                    size={24} 
                    color="#d9d9d9" 
                  />
                </Text>
              </TouchableOpacity>
            </View>
            {errors.confirmeasenha && <Text style={styles.errorText}>{errors.confirmeasenha}</Text>}
          </View>

          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={[styles.checkbox, aceitoTermos && styles.checkboxChecked]}
              onPress={() => setAceitoTermos(!aceitoTermos)}
            >
              {aceitoTermos && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
            <Text style={styles.checkboxLabel}>
              Li e concordo com os <Text style={styles.link}>Termos de Uso</Text>
            </Text>
          </View>
          {errors.termos && <Text style={styles.errorText}>{errors.termos}</Text>}

          <TouchableOpacity 
            style={[styles.btnCadastro, loading && styles.btnCadastroDisabled]} 
            onPress={handleCadastro}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.btnCadastroText}>CADASTRAR-SE</Text>
            )}
          </TouchableOpacity>

          <View style={styles.loginRedirect}>
            <Text style={styles.loginText}>Já possui uma conta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Entrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1C5052",
  },
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    width: "100%",
    height: 200,
    backgroundColor: "#000",
    borderBottomLeftRadius: 50,
    paddingHorizontal: 20,
    justifyContent: "flex-end",
    paddingBottom: 30,
  },
  backButton: {
    position: 'absolute',
    bottom: 30,
    left: 20,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginLeft: 40,
  },
  formContainer: {
    flex: 1,
    padding: 20,
    marginTop: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 5,
    marginLeft: 5,
  },
  input: {
    width: "100%",
    height: 50,
    borderRadius: 25,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  inputError: {
    borderWidth: 1,
    borderColor: "#e74c3c",
  },
  errorText: {
    color: "#e74c3c",
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    paddingRight: 50,
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 15,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: "#d9d9d9",
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    backgroundColor: "#fff",
  },
  checkboxChecked: {
    backgroundColor: "#d9d9d9",
  },
  checkmark: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
  checkboxLabel: {
    color: "#fff",
    fontSize: 14,
  },
  link: {
    textDecorationLine: "underline",
    color: "#D9D9D9",
  },
  btnCadastro: {
    width: "100%",
    height: 50,
    backgroundColor: "#D9D9D9",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  btnCadastroDisabled: {
    opacity: 0.7,
  },
  btnCadastroText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
  },
  loginRedirect: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  loginText: {
    color: "#fff",
    fontSize: 14,
  },
  loginLink: {
    color: "#D9D9D9",
    fontSize: 14,
    fontWeight: "bold",
    textDecorationLine: "underline",
    marginLeft: 5,
  },
}); 