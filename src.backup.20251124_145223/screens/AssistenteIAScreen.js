import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";

export default function AssistenteIAScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [analise, setAnalise] = useState("");
  const [pergunta, setPergunta] = useState("");
  const [resposta, setResposta] = useState("");
  const [chatMode, setChatMode] = useState(false);

  const mesAtual = new Date().getMonth() + 1;
  const anoAtual = new Date().getFullYear();

  useEffect(() => {
    gerarAnalise();
  }, []);

  const gerarAnalise = async () => {
    try {
      setLoading(true);
      console.log("🤖 Iniciando análise da IA...");

      const response = await api.post("/ia/analisar-mes", {
        mes: mesAtual,
        ano: anoAtual,
      });

      console.log("✅ Resposta da IA:", response.data);

      if (response.data.analise) {
        setAnalise(response.data.analise);
      } else {
        setAnalise("Nenhuma análise disponível no momento.");
      }
    } catch (error) {
      console.error("❌ Erro ao gerar análise:", error);
      Alert.alert("Erro", "Não foi possível gerar a análise inteligente");
      setAnalise("Erro ao carregar análise. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const fazerPergunta = async () => {
    if (!pergunta.trim()) {
      Alert.alert("Atenção", "Digite uma pergunta primeiro");
      return;
    }

    try {
      setLoading(true);
      console.log("💬 Enviando pergunta para IA...");

      const response = await api.post("/ia/chat", { mensagem: pergunta });

      console.log("✅ Resposta do chat:", response.data);

      if (response.data.resposta) {
        setResposta(response.data.resposta);
        setPergunta("");
      }
    } catch (error) {
      console.error("❌ Erro ao fazer pergunta:", error);
      Alert.alert("Erro", "Não foi possível processar sua pergunta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🤖 Assistente IA</Text>
        <TouchableOpacity onPress={() => setChatMode(!chatMode)}>
          <Ionicons
            name={chatMode ? "analytics" : "chatbubbles"}
            size={24}
            color="#fff"
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {!chatMode ? (
          <View style={styles.analiseContainer}>
            <View style={styles.titleContainer}>
              <Ionicons name="bulb" size={24} color="#FFD700" />
              <Text style={styles.sectionTitle}>Análise Inteligente</Text>
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#00ff00" />
                <Text style={styles.loadingText}>
                  Analisando suas finanças...
                </Text>
              </View>
            ) : (
              <>
                {analise ? (
                  <View style={styles.analiseBox}>
                    <Text style={styles.analiseText}>{analise}</Text>
                  </View>
                ) : (
                  <Text style={styles.emptyText}>
                    Nenhuma análise disponível ainda.
                  </Text>
                )}

                <TouchableOpacity
                  style={styles.refreshButton}
                  onPress={gerarAnalise}
                >
                  <Ionicons name="refresh" size={20} color="#fff" />
                  <Text style={styles.refreshButtonText}>
                    Atualizar Análise
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        ) : (
          <View style={styles.chatContainer}>
            <View style={styles.titleContainer}>
              <Ionicons name="chatbubbles" size={24} color="#00ff00" />
              <Text style={styles.sectionTitle}>Converse com a IA</Text>
            </View>

            <Text style={styles.subtitle}>
              Faça perguntas sobre suas finanças
            </Text>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Ex: Como posso reduzir minhas despesas?"
                placeholderTextColor="#999"
                value={pergunta}
                onChangeText={setPergunta}
                multiline
              />
            </View>

            <TouchableOpacity
              style={[styles.askButton, loading && styles.buttonDisabled]}
              onPress={fazerPergunta}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="send" size={20} color="#fff" />
                  <Text style={styles.askButtonText}>Perguntar</Text>
                </>
              )}
            </TouchableOpacity>

            {resposta && (
              <View style={styles.respostaBox}>
                <View style={styles.respostaHeader}>
                  <Ionicons
                    name="chatbubble-ellipses"
                    size={20}
                    color="#00ff00"
                  />
                  <Text style={styles.respostaTitle}>Resposta da IA</Text>
                </View>
                <Text style={styles.respostaText}>{resposta}</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a",
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
    padding: 20,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 10,
  },
  subtitle: {
    fontSize: 14,
    color: "#999",
    marginBottom: 20,
  },
  analiseContainer: {
    marginBottom: 20,
  },
  loadingContainer: {
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    color: "#999",
    marginTop: 10,
  },
  analiseBox: {
    backgroundColor: "#2d2d2d",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#00ff00",
  },
  analiseText: {
    color: "#fff",
    fontSize: 15,
    lineHeight: 24,
  },
  emptyText: {
    color: "#999",
    textAlign: "center",
    padding: 40,
  },
  refreshButton: {
    backgroundColor: "#00ff00",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 8,
    gap: 10,
  },
  refreshButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
  chatContainer: {
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  input: {
    backgroundColor: "#2d2d2d",
    color: "#fff",
    padding: 15,
    borderRadius: 8,
    fontSize: 15,
    minHeight: 100,
    textAlignVertical: "top",
  },
  askButton: {
    backgroundColor: "#00ff00",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 8,
    gap: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  askButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
  respostaBox: {
    backgroundColor: "#2d2d2d",
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#00ff00",
  },
  respostaHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  respostaTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#00ff00",
    marginLeft: 8,
  },
  respostaText: {
    color: "#fff",
    fontSize: 15,
    lineHeight: 24,
  },
});
