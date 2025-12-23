import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { LineChart, PieChart } from "react-native-chart-kit";
import { Picker } from "@react-native-picker/picker";
import api from "../services/api";

const { width } = Dimensions.get("window");

export default function GraficosScreen() {
  const navigation = useNavigation();
  
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [vendas, setVendas] = useState([]);
  const [despesas, setDespesas] = useState([]);
  const [filtroGrafico, setFiltroGrafico] = useState("mes"); // mes, trimestre, ano

  const meses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [selectedMonth, selectedYear, filtroGrafico])
  );

  const fetchData = async () => {
    try {
      setLoading(true);
      const responseVendas = await api.get("/vendas");
      const responseDespesas = await api.get("/despesas");

      let vendasFiltradas = responseVendas.data;
      let despesasFiltradas = responseDespesas.data;

      if (filtroGrafico === "mes") {
        vendasFiltradas = vendasFiltradas.filter((v) => {
          const data = new Date(v.data);
          return data.getMonth() === selectedMonth - 1 && data.getFullYear() === selectedYear;
        });
        despesasFiltradas = despesasFiltradas.filter((d) => {
          const data = new Date(d.data);
          return data.getMonth() === selectedMonth - 1 && data.getFullYear() === selectedYear;
        });
      } else if (filtroGrafico === "ano") {
        vendasFiltradas = vendasFiltradas.filter((v) => new Date(v.data).getFullYear() === selectedYear);
        despesasFiltradas = despesasFiltradas.filter((d) => new Date(d.data).getFullYear() === selectedYear);
      }

      setVendas(vendasFiltradas);
      setDespesas(despesasFiltradas);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  // Preparar dados para o gráfico de PIZZA (Despesas por categoria)
  const prepararDadosPizza = () => {
    const categorias = {};
    despesas.forEach((despesa) => {
      const cat = despesa.categoria || "Outros";
      categorias[cat] = (categorias[cat] || 0) + despesa.valor;
    });

    const cores = ["#e74c3c", "#f39c12", "#9b59b6", "#3498db", "#1abc9c", "#34495e"];
    let index = 0;

    return Object.keys(categorias).map((cat) => ({
      name: cat,
      population: categorias[cat],
      color: cores[index++ % cores.length],
      legendFontColor: "#fff",
      legendFontSize: 12,
    }));
  };

  // Preparar dados para o gráfico de LINHA (Lucro ao longo do tempo)
  const prepararDadosLinha = () => {
    if (filtroGrafico === "mes") {
      // Lucro diário no mês
      const diasNoMes = new Date(selectedYear, selectedMonth, 0).getDate();
      const lucrosPorDia = Array(diasNoMes).fill(0);

      vendas.forEach((v) => {
        const dia = new Date(v.data).getDate() - 1;
        lucrosPorDia[dia] += v.valor;
      });

      despesas.forEach((d) => {
        const dia = new Date(d.data).getDate() - 1;
        lucrosPorDia[dia] -= d.valor;
      });

      return {
        labels: lucrosPorDia.map((_, i) => `${i + 1}`).filter((_, i) => i % 5 === 0), // Mostrar labels a cada 5 dias
        datasets: [{
          data: lucrosPorDia.length > 0 ? lucrosPorDia : [0],
          color: (opacity = 1) => `rgba(30, 215, 96, ${opacity})`,
          strokeWidth: 2,
        }],
      };
    } else if (filtroGrafico === "ano") {
      // Lucro mensal no ano
      const lucrosPorMes = Array(12).fill(0);

      vendas.forEach((v) => {
        const mes = new Date(v.data).getMonth();
        lucrosPorMes[mes] += v.valor;
      });

      despesas.forEach((d) => {
        const mes = new Date(d.data).getMonth();
        lucrosPorMes[mes] -= d.valor;
      });

      return {
        labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"],
        datasets: [{
          data: lucrosPorMes.some(v => v !== 0) ? lucrosPorMes : [0],
          color: (opacity = 1) => `rgba(30, 215, 96, ${opacity})`,
          strokeWidth: 2,
        }],
      };
    }

    return { labels: [""], datasets: [{ data: [0] }] };
  };

  const dadosPizza = prepararDadosPizza();
  const dadosLinha = prepararDadosLinha();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gráficos Interativos</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Filtros */}
        <View style={styles.filtrosCard}>
          <Text style={styles.filtroLabel}>Período:</Text>
          <View style={styles.filtroButtons}>
            <TouchableOpacity
              style={[styles.filtroButton, filtroGrafico === "mes" && styles.filtroButtonActive]}
              onPress={() => setFiltroGrafico("mes")}
            >
              <Text style={styles.filtroButtonText}>Mês</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filtroButton, filtroGrafico === "ano" && styles.filtroButtonActive]}
              onPress={() => setFiltroGrafico("ano")}
            >
              <Text style={styles.filtroButtonText}>Ano</Text>
            </TouchableOpacity>
          </View>

          {filtroGrafico === "mes" && (
            <Picker
              selectedValue={selectedMonth}
              style={styles.picker}
              onValueChange={(itemValue) => setSelectedMonth(itemValue)}
            >
              {meses.map((mes, idx) => (
                <Picker.Item key={mes} label={mes} value={idx + 1} />
              ))}
            </Picker>
          )}

          <Picker
            selectedValue={selectedYear}
            style={styles.picker}
            onValueChange={(itemValue) => setSelectedYear(itemValue)}
          >
            {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map((ano) => (
              <Picker.Item key={ano} label={ano.toString()} value={ano} />
            ))}
          </Picker>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#1ed760" style={{ marginTop: 50 }} />
        ) : (
          <>
            {/* Gráfico de Linha - Lucro */}
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>📈 Evolução do Lucro</Text>
              <Text style={styles.chartSubtitle}>
                {filtroGrafico === "mes" 
                  ? `${meses[selectedMonth - 1]} ${selectedYear}` 
                  : `Ano ${selectedYear}`}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <LineChart
                  data={dadosLinha}
                  width={filtroGrafico === "mes" ? width * 2 : width - 40}
                  height={220}
                  chartConfig={{
                    backgroundColor: "#111",
                    backgroundGradientFrom: "#1a1a1a",
                    backgroundGradientTo: "#111",
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(30, 215, 96, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                    style: { borderRadius: 16 },
                    propsForDots: {
                      r: "4",
                      strokeWidth: "2",
                      stroke: "#1ed760",
                    },
                  }}
                  bezier
                  style={styles.chart}
                />
              </ScrollView>
            </View>

            {/* Gráfico de Pizza - Despesas */}
            {dadosPizza.length > 0 ? (
              <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>🍕 Despesas por Categoria</Text>
                <Text style={styles.chartSubtitle}>
                  {filtroGrafico === "mes" 
                    ? `${meses[selectedMonth - 1]} ${selectedYear}` 
                    : `Ano ${selectedYear}`}
                </Text>
                <PieChart
                  data={dadosPizza}
                  width={width - 40}
                  height={220}
                  chartConfig={{
                    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  }}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  absolute
                />
              </View>
            ) : (
              <View style={styles.chartCard}>
                <Text style={styles.emptyText}>📊 Nenhuma despesa registrada neste período</Text>
              </View>
            )}

            {/* Resumo */}
            <View style={styles.resumoCard}>
              <Text style={styles.resumoTitle}>💰 Resumo do Período</Text>
              <View style={styles.resumoRow}>
                <Text style={styles.resumoLabel}>Total de Receitas:</Text>
                <Text style={styles.resumoValueReceita}>
                  R$ {vendas.reduce((sum, v) => sum + v.valor, 0).toFixed(2).replace(".", ",")}
                </Text>
              </View>
              <View style={styles.resumoRow}>
                <Text style={styles.resumoLabel}>Total de Despesas:</Text>
                <Text style={styles.resumoValueDespesa}>
                  R$ {despesas.reduce((sum, d) => sum + d.valor, 0).toFixed(2).replace(".", ",")}
                </Text>
              </View>
              <View style={styles.resumoRow}>
                <Text style={styles.resumoLabel}>Lucro Líquido:</Text>
                <Text style={styles.resumoValueLucro}>
                  R$ {(vendas.reduce((sum, v) => sum + v.valor, 0) - despesas.reduce((sum, d) => sum + d.valor, 0))
                    .toFixed(2).replace(".", ",")}
                </Text>
              </View>
            </View>
          </>
        )}
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
  filtrosCard: {
    backgroundColor: "#111",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  filtroLabel: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  filtroButtons: {
    flexDirection: "row",
    marginBottom: 15,
  },
  filtroButton: {
    flex: 1,
    padding: 10,
    backgroundColor: "#222",
    borderRadius: 8,
    marginRight: 10,
    alignItems: "center",
  },
  filtroButtonActive: {
    backgroundColor: "#1ed760",
  },
  filtroButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  picker: {
    backgroundColor: "#222",
    color: "#fff",
    marginBottom: 10,
    borderRadius: 8,
  },
  chartCard: {
    backgroundColor: "#111",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  chartTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  chartSubtitle: {
    color: "#aaa",
    fontSize: 14,
    marginBottom: 15,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  emptyText: {
    color: "#aaa",
    fontSize: 14,
    textAlign: "center",
    marginVertical: 20,
  },
  resumoCard: {
    backgroundColor: "#111",
    borderRadius: 16,
    padding: 20,
  },
  resumoTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  resumoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  resumoLabel: {
    color: "#ddd",
    fontSize: 15,
  },
  resumoValueReceita: {
    color: "#1ed760",
    fontSize: 16,
    fontWeight: "bold",
  },
  resumoValueDespesa: {
    color: "#e74c3c",
    fontSize: 16,
    fontWeight: "bold",
  },
  resumoValueLucro: {
    color: "#ffb300",
    fontSize: 16,
    fontWeight: "bold",
  },
});