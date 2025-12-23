import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";

export default function PerfilScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    carregarPerfil();
  }, []);

  const carregarPerfil = async () => {
    try {
      setLoading(true);
      const response = await api.get("/auth/me");
      setUsuario(response.data.usuario);
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
      setUsuario({ nome: "Usuário", email: "usuario@colhecash.com" });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Sair da conta", "Deseja realmente sair?", [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          try {
            await AsyncStorage.removeItem("@ColheCash:token");
            await AsyncStorage.removeItem("@ColheCash:userId");
            navigation.reset({
              index: 0,
              routes: [{ name: "Login" }],
            });
          } catch (error) {
            console.error("Erro ao fazer logout:", error);
          }
        },
      },
    ]);
  };

  const handleRevalidarToken = async () => {
    Alert.alert(
      "Renovar Sessão",
      "Isso irá renovar seu token de autenticação. Deseja continuar?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Renovar",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem("@ColheCash:token");

              Alert.alert(
                "Sessão expirada",
                "Por favor, faça login novamente para renovar sua sessão.",
                [
                  {
                    text: "OK",
                    onPress: () => {
                      navigation.reset({
                        index: 0,
                        routes: [{ name: "Login" }],
                      });
                    },
                  },
                ]
              );
            } catch (error) {
              console.error("Erro ao revalidar token:", error);
              Alert.alert("Erro", "Não foi possível renovar a sessão");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#00ff00" />
        <Text style={styles.loadingText}>Carregando perfil...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Minha Conta</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Card do Usuário */}
        <View style={styles.userCard}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person-circle" size={80} color="#00ff00" />
          </View>
          <Text style={styles.userName}>{usuario?.nome || "Usuário"}</Text>
          <Text style={styles.userEmail}>
            {usuario?.email || "email@exemplo.com"}
          </Text>
          <View style={styles.badgeContainer}>
            <Ionicons name="leaf" size={16} color="#FFD700" />
            <Text style={styles.badgeText}>Produtor ColheCash</Text>
          </View>
        </View>

        {/* Seção: Conta */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔐 Segurança</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleRevalidarToken}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="refresh-circle" size={24} color="#00ff00" />
              <View style={styles.menuItemText}>
                <Text style={styles.menuItemTitle}>Renovar Sessão</Text>
                <Text style={styles.menuItemSubtitle}>
                  Revalide seu login para segurança
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="key" size={24} color="#FFD700" />
              <View style={styles.menuItemText}>
                <Text style={styles.menuItemTitle}>Alterar Senha</Text>
                <Text style={styles.menuItemSubtitle}>
                  Mantenha sua conta segura
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Seção: Dados */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Meus Dados</Text>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="document-text" size={24} color="#4CAF50" />
              <View style={styles.menuItemText}>
                <Text style={styles.menuItemTitle}>Exportar Relatórios</Text>
                <Text style={styles.menuItemSubtitle}>
                  Baixe seus dados financeiros
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="cloud-upload" size={24} color="#2196F3" />
              <View style={styles.menuItemText}>
                <Text style={styles.menuItemTitle}>Backup</Text>
                <Text style={styles.menuItemSubtitle}>
                  Sincronize seus dados
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Seção: Sobre */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ Sobre</Text>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="help-circle" size={24} color="#9C27B0" />
              <View style={styles.menuItemText}>
                <Text style={styles.menuItemTitle}>Central de Ajuda</Text>
                <Text style={styles.menuItemSubtitle}>Tire suas dúvidas</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="information-circle" size={24} color="#607D8B" />
              <View style={styles.menuItemText}>
                <Text style={styles.menuItemTitle}>Sobre o ColheCash</Text>
                <Text style={styles.menuItemSubtitle}>Versão 1.0.0</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Botão Sair */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out" size={24} color="#fff" />
          <Text style={styles.logoutButtonText}>Sair da Conta</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a",
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#999",
    marginTop: 10,
  },
  header: {
    backgroundColor: "#2d2d2d",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  content: {
    flex: 1,
  },
  userCard: {
    backgroundColor: "#2d2d2d",
    margin: 20,
    padding: 30,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#00ff00",
  },
  avatarContainer: {
    marginBottom: 15,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: "#999",
    marginBottom: 15,
  },
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#00ff0020",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 5,
  },
  badgeText: {
    color: "#00ff00",
    fontSize: 12,
    fontWeight: "bold",
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 15,
  },
  menuItem: {
    backgroundColor: "#2d2d2d",
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 15,
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 3,
  },
  menuItemSubtitle: {
    fontSize: 12,
    color: "#999",
  },
  logoutButton: {
    backgroundColor: "#ff3b30",
    marginHorizontal: 20,
    padding: 18,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    marginTop: 10,
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
