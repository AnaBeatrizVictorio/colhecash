import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function CalculadoraPrecoScreen() {
  const navigation = useNavigation();
  
  const [custoProduto, setCustoProduto] = useState("");
  const [margemLucro, setMargemLucro] = useState("");
  const [impostos, setImpostos] = useState("");
  const [precoVenda, setPrecoVenda] = useState(null);
  const [lucroLiquido, setLucroLiquido] = useState(null);

  const calcularPreco = () => {
    const custo = parseFloat(custoProduto.replace(",", "."));
    const margem = parseFloat(margemLucro.replace(",", "."));
    const imposto = parseFloat(impostos.replace(",", "."));

    if (isNaN(custo) || isNaN(margem)) {
      Alert.alert("Erro", "Preencha o custo e a margem de lucro!");
      return;
    }

    const impostoPercentual = isNaN(imposto) ? 0 : imposto;
    
    // Fórmula: Preço = Custo / (1 - (Margem/100 + Imposto/100))
    const precoCalculado = custo / (1 - (margem / 100 + impostoPercentual / 100));
    const lucroCalculado = precoCalculado - custo - (precoCalculado * impostoPercentual / 100);

    setPrecoVenda(precoCalculado.toFixed(2));
    setLucroLiquido(lucroCalculado.toFixed(2));
  };

  const limparCampos = () => {
    setCustoProduto("");
    setMargemLucro("");
    setImpostos("");
    setPrecoVenda(null);
    setLucroLiquido(null);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Calculadora de Preço</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Card de Input */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📊 Calcule o Preço Ideal</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Custo do Produto (R$)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 50.00"
              placeholderTextColor="#888"
              keyboardType="numeric"
              value={custoProduto}
              onChangeText={setCustoProduto}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Margem de Lucro (%)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 30"
              placeholderTextColor="#888"
              keyboardType="numeric"
              value={margemLucro}
              onChangeText={setMargemLucro}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Impostos (%) - Opcional</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 15"
              placeholderTextColor="#888"
              keyboardType="numeric"
              value={impostos}
              onChangeText={setImpostos}
            />
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.buttonCalcular]}
              onPress={calcularPreco}
            >
              <Ionicons name="calculator" size={20} color="#111" />
              <Text style={styles.buttonText}>Calcular</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonLimpar]}
              onPress={limparCampos}
            >
              <Ionicons name="refresh" size={20} color="#fff" />
              <Text style={[styles.buttonText, { color: "#fff" }]}>Limpar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Resultado */}
        {precoVenda !== null && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>💰 Resultado</Text>
            
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Preço de Venda:</Text>
              <Text style={styles.resultValue}>R$ {precoVenda}</Text>
            </View>

            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Lucro Líquido:</Text>
              <Text style={[styles.resultValue, { color: "#1ed760" }]}>
                R$ {lucroLiquido}
              </Text>
            </View>
          </View>
        )}

        {/* Dicas */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Dicas</Text>
          <Text style={styles.tipText}>
            • A margem de lucro deve cobrir despesas operacionais
          </Text>
          <Text style={styles.tipText}>
            • Considere impostos específicos do seu setor
          </Text>
          <Text style={styles.tipText}>
            • Compare com preços de mercado antes de definir
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#225b5b",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50,
    backgroundColor: "#000",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  content: {
    padding: 20,
  },
  card: {
    backgroundColor: "#111",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  cardTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    color: "#ddd",
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#222",
    borderRadius: 8,
    padding: 12,
    color: "#fff",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#333",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    flex: 0.48,
  },
  buttonCalcular: {
    backgroundColor: "#1ed760",
  },
  buttonLimpar: {
    backgroundColor: "#e74c3c",
  },
  buttonText: {
    color: "#111",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  resultCard: {
    backgroundColor: "#111",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  resultTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  resultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  resultLabel: {
    color: "#ddd",
    fontSize: 16,
  },
  resultValue: {
    color: "#ffb300",
    fontSize: 20,
    fontWeight: "bold",
  },
  tipsCard: {
    backgroundColor: "#111",
    borderRadius: 16,
    padding: 20,
  },
  tipsTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  tipText: {
    color: "#aaa",
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
});