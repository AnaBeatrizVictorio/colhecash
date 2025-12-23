import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";

const API_URL = "http://192.168.0.102:3000/api";

export default function AssistenteIAScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [analise, setAnalise] = useState(null);
  const [chatMode, setChatMode] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [conversas, setConversas] = useState([]);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    carregarAnalise();
  }, []);

  const carregarAnalise = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/ia/analisar-mes`);
      setAnalise(response.data);
    } catch (error) {
      console.error("Erro ao carregar análise:", error);
      setAnalise({
        resumo: "Erro ao carregar análise. Verifique sua conexão.",
        dicas: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const enviarMensagem = async () => {
    if (!mensagem.trim()) return;

    const novaMensagem = {
      tipo: "usuario",
      texto: mensagem,
    };

    setConversas([...conversas, novaMensagem]);
    setMensagem("");
    setEnviando(true);

    try {
      const response = await axios.post(`${API_URL}/ia/chat`, {
        mensagem: mensagem,
      });

      const respostaIA = {
        tipo: "ia",
        texto: response.data.resposta,
      };

      setConversas((prev) => [...prev, respostaIA]);
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      const erroMsg = {
        tipo: "ia",
        texto:
          "Desculpe, não consegui processar sua mensagem. Tente novamente.",
      };
      setConversas((prev) => [...prev, erroMsg]);
    } finally {
      setEnviando(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFD700" />
        <Text style={styles.loadingText}>Analisando seus dados...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Assistente IA 🤖</Text>
        <TouchableOpacity onPress={() => setChatMode(!chatMode)}>
          <Ionicons
            name={chatMode ? "analytics" : "chatbubbles"}
            size={24}
            color="#FFD700"
          />
        </TouchableOpacity>
      </View>

      {!chatMode ? (
        // Modo Análise
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
        >
          <View style={styles.analiseCard}>
            <Text style={styles.analiseTitle}>📊 Análise do Mês</Text>
            <Text style={styles.analiseTexto}>{analise?.resumo}</Text>
          </View>

          {analise?.dicas && analise.dicas.length > 0 && (
            <View style={styles.dicasCard}>
              <Text style={styles.dicasTitle}>💡 Dicas Personalizadas</Text>
              {analise.dicas.map((dica, index) => (
                <View key={index} style={styles.dicaItem}>
                  <Text style={styles.dicaBullet}>•</Text>
                  <Text style={styles.dicaTexto}>{dica}</Text>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity
            style={styles.chatButton}
            onPress={() => setChatMode(true)}
          >
            <Ionicons name="chatbubbles" size={20} color="#000" />
            <Text style={styles.chatButtonText}>Fazer uma pergunta</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        // Modo Chat
        <View style={styles.chatContainer}>
          <ScrollView
            style={styles.chatMessages}
            contentContainerStyle={styles.chatMessagesContent}
          >
            {conversas.map((conv, index) => (
              <View
                key={index}
                style={[
                  styles.mensagem,
                  conv.tipo === "usuario"
                    ? styles.mensagemUsuario
                    : styles.mensagemIA,
                ]}
              >
                <Text
                  style={[
                    styles.mensagemTexto,
                    conv.tipo === "usuario"
                      ? styles.mensagemTextoUsuario
                      : styles.mensagemTextoIA,
                  ]}
                >
                  {conv.texto}
                </Text>
              </View>
            ))}
            {enviando && (
              <View style={styles.mensagemIA}>
                <ActivityIndicator size="small" color="#FFD700" />
              </View>
            )}
          </ScrollView>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Digite sua pergunta..."
              placeholderTextColor="#888"
              value={mensagem}
              onChangeText={setMensagem}
              multiline
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={enviarMensagem}
              disabled={enviando || !mensagem.trim()}
            >
              <Ionicons name="send" size={20} color="#000" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    marginTop: 10,
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: "#111",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  analiseCard: {
    backgroundColor: "#111",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#FFD700",
  },
  analiseTitle: {
    color: "#FFD700",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  analiseTexto: {
    color: "#fff",
    fontSize: 15,
    lineHeight: 24,
  },
  dicasCard: {
    backgroundColor: "#111",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  dicasTitle: {
    color: "#FFD700",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  dicaItem: {
    flexDirection: "row",
    marginBottom: 12,
  },
  dicaBullet: {
    color: "#FFD700",
    fontSize: 20,
    marginRight: 10,
  },
  dicaTexto: {
    color: "#fff",
    fontSize: 15,
    flex: 1,
    lineHeight: 22,
  },
  chatButton: {
    backgroundColor: "#FFD700",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 12,
    gap: 10,
  },
  chatButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
  chatContainer: {
    flex: 1,
  },
  chatMessages: {
    flex: 1,
  },
  chatMessagesContent: {
    padding: 20,
  },
  mensagem: {
    maxWidth: "80%",
    marginBottom: 15,
    padding: 12,
    borderRadius: 12,
  },
  mensagemUsuario: {
    alignSelf: "flex-end",
    backgroundColor: "#FFD700",
  },
  mensagemIA: {
    alignSelf: "flex-start",
    backgroundColor: "#222",
  },
  mensagemTexto: {
    fontSize: 15,
    lineHeight: 20,
  },
  mensagemTextoUsuario: {
    color: "#000",
  },
  mensagemTextoIA: {
    color: "#fff",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 15,
    backgroundColor: "#111",
    alignItems: "center",
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: "#222",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    color: "#fff",
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: "#FFD700",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});
