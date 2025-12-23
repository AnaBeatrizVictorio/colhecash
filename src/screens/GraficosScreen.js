import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native";
import { LineChart, BarChart, PieChart } from "react-native-chart-kit";
import { useFocusEffect } from "@react-navigation/native";
import api from "../services/api";

const screenWidth = Dimensions.get("window").width;

export default function GraficosScreen() {
  const [vendas, setVendas] = useState([]);
  const [despesas, setDespesas] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [])
  );

  const fetchData = async () => {
    try {
      const [vendasRes, despesasRes] = await Promise.all([
        api.get("/api/vendas"),
        api.get("/api/despesas"),
      ]);

      setVendas(vendasRes.data);
      setDespesas(despesasRes.data);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    }
  };

  const processarDadosMensais = () => {
    const meses = {};
    const mesesNomes = [
      "Jan",
      "Fev",
      "Mar",
      "Abr",
      "Mai",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Out",
      "Nov",
      "Dez",
    ];

    const hoje = new Date();
    for (let i = 5; i >= 0; i--) {
      const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      const chave = `${data.getFullYear()}-${String(
        data.getMonth() + 1
      ).padStart(2, "0")}`;
      meses[chave] = {
        vendas: 0,
        despesas: 0,
        mes: mesesNomes[data.getMonth()],
      };
    }

    vendas.forEach((venda) => {
      const data = new Date(venda.data);
      const chave = `${data.getFullYear()}-${String(
        data.getMonth() + 1
      ).padStart(2, "0")}`;
      if (meses[chave]) {
        meses[chave].vendas += parseFloat(venda.valor);
      }
    });

    despesas.forEach((despesa) => {
      const data = new Date(despesa.data);
      const chave = `${data.getFullYear()}-${String(
        data.getMonth() + 1
      ).padStart(2, "0")}`;
      if (meses[chave]) {
        meses[chave].despesas += parseFloat(despesa.valor);
      }
    });

    return Object.values(meses);
  };

  const gerarDadosLinha = () => {
    const dadosMensais = processarDadosMensais();
    return {
      labels: dadosMensais.map((m) => m.mes),
      datasets: [
        {
          data: dadosMensais.map((m) => m.vendas),
          color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
          strokeWidth: 2,
        },
        {
          data: dadosMensais.map((m) => m.despesas),
          color: (opacity = 1) => `rgba(244, 67, 54, ${opacity})`,
          strokeWidth: 2,
        },
      ],
      legend: ["Receitas", "Despesas"],
    };
  };

  const gerarDadosBarras = () => {
    const dadosMensais = processarDadosMensais();
    return {
      labels: dadosMensais.map((m) => m.mes),
      datasets: [
        {
          data: dadosMensais.map((m) => m.vendas - m.despesas),
        },
      ],
    };
  };

  const gerarDadosPizza = () => {
    const totalVendas = vendas.reduce((acc, v) => acc + parseFloat(v.valor), 0);
    const totalDespesas = despesas.reduce(
      (acc, d) => acc + parseFloat(d.valor),
      0
    );

    return [
      {
        name: "Receitas",
        value: totalVendas,
        color: "#4CAF50",
        legendFontColor: "#000",
        legendFontSize: 15,
      },
      {
        name: "Despesas",
        value: totalDespesas,
        color: "#F44336",
        legendFontColor: "#000",
        legendFontSize: 15,
      },
    ];
  };

  const chartConfig = {
    backgroundColor: "#fff",
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Gráficos</Text>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>
          Receitas vs Despesas (Últimos 6 meses)
        </Text>
        <LineChart
          data={gerarDadosLinha()}
          width={screenWidth - 40}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Lucro Mensal</Text>
        <BarChart
          data={gerarDadosBarras()}
          width={screenWidth - 40}
          height={220}
          chartConfig={chartConfig}
          style={styles.chart}
        />
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Distribuição Total</Text>
        <PieChart
          data={gerarDadosPizza()}
          width={screenWidth - 40}
          height={220}
          chartConfig={chartConfig}
          accessor="value"
          backgroundColor="transparent"
          paddingLeft="15"
          style={styles.chart}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    marginTop: 40,
  },
  chartContainer: {
    marginBottom: 30,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});
