import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { signIn } from '../services/auth';

export default function LoginScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [lembrar, setLembrar] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // Validações
    if (!email || !senha) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    if (senha.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
      return;
    }

    try {
      setLoading(true);
      await signIn(email, senha);
      
      // Navega para a Home após o login bem-sucedido
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (error) {
      Alert.alert('Erro', error.message || 'Email ou senha inválidos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <View style={styles.header}>
        <TouchableOpacity
          style={{ position: 'absolute', top: 20, left: 20 }}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={{ marginTop: 60, marginLeft: 20 }}>
          <Text style={styles.headerTitle}>BEM VINDO{"\n"}DE VOLTA !</Text>
        </View>
      </View>

      <View style={styles.formArea}>
        <TextInput
          placeholder="E-mail"
          style={styles.TextInput}
          placeholderTextColor="#d9d9d9"
          onChangeText={setEmail}
          value={email}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <View style={styles.inputSenhaContainer}>
          <TextInput
            secureTextEntry={!mostrarSenha}
            placeholder="Senha"
            style={[styles.TextInput, { paddingRight: 40 }]}
            placeholderTextColor="#d9d9d9"
            onChangeText={setSenha}
            value={senha}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setMostrarSenha(!mostrarSenha)}
          >
            <Ionicons
              name={mostrarSenha ? "eye-off-outline" : "eye-outline"}
              size={22}
              color="#b0b0b0"
            />
          </TouchableOpacity>
        </View>
        <View style={styles.checkboxContainer}>
          <TouchableOpacity
            style={[styles.checkbox, lembrar && styles.checkboxChecked]}
            onPress={() => setLembrar(!lembrar)}
          >
            {lembrar && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>
          <Text style={styles.label}>Lembrar de mim</Text>
        </View>
        <TouchableOpacity style={styles.btnLogin} onPress={handleLogin} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnLoginText}>ENTRAR</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.esqueceuSenha}
          onPress={() => alert('Funcionalidade de recuperação de senha')}
        >
          <Text style={styles.esqueceuSenhaText}>Esqueceu a senha?</Text>
        </TouchableOpacity>
        <View style={styles.cadastroRedirect}>
          <Text style={styles.cadastroText}>Não possui uma conta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Cadastro')}>
            <Text style={styles.cadastroLink}>Cadastrar-se</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#225b5b",
    padding: 0,
    justifyContent: "flex-start",
  },
  header: {
    width: "100%",
    height: 200,
    backgroundColor: "#000",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 0,
    justifyContent: "flex-start",
    position: "relative",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
    top: 30,
    left: 10,
  },
  formArea: {
    flex: 1,
    marginTop: 30,
    paddingHorizontal: 30,
  },
  TextInput: {
    width: "100%",
    height: 40,
    borderRadius: 20,
    paddingLeft: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#d9d9d9",
    fontSize: 14,
    backgroundColor: "transparent",
    color: "#fff",
    top: 60,
  },
  inputSenhaContainer: {
    width: '100%',
    position: 'relative',
    justifyContent: 'center',
  },
  eyeIcon: {
    position: 'absolute',
    right: 10,
    top: 67,
    zIndex: 2,
    padding: 2,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
    bottom: 30,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#b0b0b0",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    backgroundColor: "#fff",
    top: 100,
  },
  checkboxChecked: {
    backgroundColor: "#b0b0b0",
  },
  checkmark: {
    color: "#000",
    fontSize: 14,
    fontWeight: "bold",
  },
  label: {
    color: "#fff",
    fontSize: 14,
    top: 100,
  },
  btnLogin: {
    width: "100%",
    height: 40,
    backgroundColor: "#D9D9D9",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    top: 90,
  },
  btnLoginText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
  },
  esqueceuSenha: {
    alignSelf: "flex-end",
    marginTop: 18,
    top: 100,
  },
  esqueceuSenhaText: {
    color: "#fff",
    fontSize: 14,
    textDecorationLine: "underline",
  },
  cadastroRedirect: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
  },
  cadastroText: {
    color: "#fff",
    fontSize: 14,
    top: 250,
  },
  cadastroLink: {
    color: "#D9D9D9",
    fontSize: 14,
    fontWeight: "bold",
    textDecorationLine: "underline",
    marginLeft: 4,
    top: 250,
  },
}); 