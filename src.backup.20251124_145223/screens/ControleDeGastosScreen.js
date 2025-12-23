import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator, Modal } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { PieChart } from "react-native-gifted-charts";
import { Picker } from '@react-native-picker/picker';
import api from '../services/api';

const { width } = Dimensions.get('window');

export default function ControleDeGastosScreen({ navigation }) {
  // Placeholder data - replace with actual data later
  // const faturamento = 'R$ 2.500,00';
  // const despesasValor = 1000; // Usar valor numérico para o gráfico
  // const lucroLiquidoValor = 1500; // Usar valor numérico para o gráfico
  // const despesas = 'R$ 1.000,00';
  // const lucroLiquido = 'R$ 1.500,00';
  // const totalProgressBarWidth = (despesasValor / (despesasValor + lucroLiquidoValor)) * 100; // Calculate percentage based on example
  // const pieData = [
  //   { value: lucroLiquidoValor, color: '#1ed760', text: '60%', percentage: '60%' }, // Lucro Líquido
  //   { value: despesasValor, color: '#e74c3c', text: '40%', percentage: '40%' }, // Despesas
  // ];

  // Estados para dados que virão do backend
  const [faturamento, setFaturamento] = useState('R$ 0,00');
  const [despesasValor, setDespesasValor] = useState(0);
  const [lucroLiquidoValor, setLucroLiquidoValor] = useState(0);
  const [despesas, setDespesas] = useState('R$ 0,00');
  const [lucroLiquido, setLucroLiquido] = useState('R$ 0,00');
  const [pieData, setPieData] = useState([]);
  const [selectedMonthYear, setSelectedMonthYear] = useState('Carregando...');
  const [loadingData, setLoadingData] = useState(true);

  // Estados para seleção de data
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // Mês atual (1-indexed)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Ano atual

  const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  // Efeito para carregar dados ao montar o componente e ao mudar a data selecionada
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        
        // Buscar vendas
        const responseVendas = await api.get('/vendas');
        
        // Buscar despesas
        const responseDespesas = await api.get('/despesas');
        
        // Filtrar vendas do mês/ano selecionado
        const vendasDoMes = responseVendas.data.filter(venda => {
          const dataVenda = new Date(venda.data);
          return dataVenda.getMonth() === selectedMonth - 1 && dataVenda.getFullYear() === selectedYear;
        });
        
        // Filtrar despesas do mês/ano selecionado
        const despesasDoMes = responseDespesas.data.filter(despesa => {
          const dataDespesa = new Date(despesa.data);
          return dataDespesa.getMonth() === selectedMonth - 1 && dataDespesa.getFullYear() === selectedYear;
        });
        
        // Calcular totais do mês
        const totalVendasMes = vendasDoMes.reduce((sum, venda) => sum + venda.valor, 0);
        const totalDespesasMes = despesasDoMes.reduce((sum, despesa) => sum + despesa.valor, 0);
        const lucroMes = totalVendasMes - totalDespesasMes;
        
        // Atualizar estados
        setFaturamento(`R$ ${totalVendasMes.toFixed(2).replace('.', ',')}`);
        setDespesasValor(totalDespesasMes);
        setLucroLiquidoValor(lucroMes);
        setDespesas(`R$ ${totalDespesasMes.toFixed(2).replace('.', ',')}`);
        setLucroLiquido(`R$ ${lucroMes.toFixed(2).replace('.', ',')}`);
        
        // Calcular dados do gráfico de pizza
        // A porcentagem deve ser calculada em relação ao total de vendas
        const despesasPercent = totalVendasMes > 0 ? (totalDespesasMes / totalVendasMes) * 100 : 0;
        const lucroPercent = totalVendasMes > 0 ? (lucroMes / totalVendasMes) * 100 : 0;

        // Garantir que as porcentagens não ultrapassem 100%
        const despesasPercentFinal = Math.min(despesasPercent, 100);
        const lucroPercentFinal = Math.min(lucroPercent, 100);

        setPieData([
          { 
            value: lucroMes, 
            color: '#1ed760', 
            text: `${lucroPercentFinal.toFixed(0)}%`, 
            percentage: `${lucroPercentFinal.toFixed(0)}%` 
          },
          { 
            value: totalDespesasMes, 
            color: '#e74c3c', 
            text: `${despesasPercentFinal.toFixed(0)}%`, 
            percentage: `${despesasPercentFinal.toFixed(0)}%` 
          },
        ]);

      } catch (error) {
        console.error('Erro ao buscar dados de controle de gastos:', error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [selectedMonth, selectedYear]);

  // Cálculo da largura da barra de progresso (agora dinâmico)
  const totalProgressBarWidth = (despesasValor + lucroLiquidoValor) > 0 
    ? (despesasValor / (despesasValor + lucroLiquidoValor)) * 100 
    : 0;

  // Funções para navegar entre meses
  const goToPreviousMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerTop}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
        
        {/* Navegação de Mês/Ano */}
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={goToPreviousMonth}>
            <Ionicons name="chevron-back" size={24} color="#fff" style={{ marginRight: 20 }} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setDatePickerVisible(true)}> {/* Abre o modal do seletor */}
            <Text style={styles.monthYearText}>
              {meses[selectedMonth - 1]} {selectedYear}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={goToNextMonth}>
            <Ionicons name="chevron-forward" size={24} color="#fff" style={{ marginLeft: 20 }} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity>
          <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      
      {/* Despesas / Lucro Líquido */}
      <View style={styles.headerBottom}>
        <View style={styles.headerItem}>
          <MaterialIcons name="trending-down" size={20} color="#e74c3c" style={{ marginRight: 5 }} />
          <Text style={styles.headerItemText}>Despesas</Text>
        </View>
        <View style={styles.verticalDivider} />
        <View style={styles.headerItem}>
          <MaterialIcons name="trending-up" size={20} color="#1ed760" style={{ marginRight: 5 }} />
          <Text style={styles.headerItemText}>Lucro Líquido</Text>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.contentContainer}>
        <Text style={styles.sectionTitle}>Controle de Gastos</Text>

        {loadingData ? (
          <ActivityIndicator size="large" color="#1ed760" style={{ marginTop: 50 }} />
        ) : (
          <>
            {/* Financial Summary */}
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{faturamento}</Text>{/* Usando estado */}
                <Text style={styles.summaryLabel}>Faturamento</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{despesas}</Text>{/* Usando estado */}
                <Text style={styles.summaryLabel}>Despesas</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{lucroLiquido}</Text>{/* Usando estado */}
                <Text style={styles.summaryLabel}>Lucro Líquido</Text>
              </View>
            </View>

            {/* Total Progress */}
            <Text style={styles.totalTitle}>Total</Text>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${totalProgressBarWidth}%` }]} />{/* Usando cálculo dinâmico */}
            </View>
            <View style={styles.progressLabels}>
              {/* Usando estados no texto */}
              <Text style={styles.progressTextLeft}>{`R$ ${despesasValor}.00 de R$ ${despesasValor + lucroLiquidoValor}.00`}</Text>
              <Text style={styles.progressTextRight}>{`Restam R$ ${lucroLiquidoValor}.00`}</Text>
            </View>

            {/* Chart */}
            <View style={styles.chartContainer}>
              <View style={styles.chartCenterView} />
               {/* O PieChart será renderizado sobre chartContainer, com o buraco na cor de fundo dele */}
              <PieChart
                donut
                data={pieData}
                innerRadius={80} // Ajuste o raio interno para o tamanho do anel
                radius={100} // Ajuste o raio externo conforme necessário
                sectionsSpace={0}
              />
              {/* Rótulos de porcentagem posicionados absolutamente (agora baseados em pieData do estado) */}
              {pieData.length > 0 && (
                <>
                 <Text style={[styles.percentageLabel, styles.percentageLabelGreen]}>{pieData[0].percentage}</Text>
                 <Text style={[styles.percentageLabel, styles.percentageLabelRed]}>{pieData[1].percentage}</Text>
                </>
              )}
            </View>

            {/* Legend */}
            <View style={styles.legendContainer}>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, styles.legendColorGreen]} />
                <Text style={styles.legendText}>Lucro Líquido</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, styles.legendColorRed]} />
                <Text style={styles.legendText}>Despesas</Text>
              </View>
            </View>
          </>
        )}

      </View>

      {/* Modal de seleção de mês e ano */}
      <Modal
        visible={datePickerVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setDatePickerVisible(false)}
      >
        <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPress={() => setDatePickerVisible(false)} />
        <View style={styles.datePickerModal}>
          <Text style={styles.datePickerTitle}>Selecionar Mês e Ano</Text>
          <Picker
            selectedValue={selectedMonth}
            style={styles.pickerStyle}
            onValueChange={(itemValue) => setSelectedMonth(itemValue)}
          >
            {meses.map((mes, idx) => (
              <Picker.Item key={mes} label={mes} value={idx + 1} />
            ))}
          </Picker>
          <Picker
            selectedValue={selectedYear}
            style={styles.pickerStyle}
            onValueChange={(itemValue) => setSelectedYear(itemValue)}
          >
            {Array.from({ length: 2100 - 2000 + 1 }, (_, i) => 2000 + i).map((ano) => (
              <Picker.Item key={ano} label={ano.toString()} value={ano} />
            ))}
          </Picker>
          <TouchableOpacity onPress={() => setDatePickerVisible(false)} style={styles.datePickerButton}>
            <Text style={styles.datePickerButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#225b5b',
    paddingTop: 0,
  },
  headerTop: {
    backgroundColor: '#000',
    height: 100,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 28,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  monthYearText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
  headerBottom: {
    backgroundColor: '#000',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  headerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  headerItemText: {
    color: '#fff',
    fontSize: 14,
  },
  verticalDivider: {
    width: 3,
    backgroundColor: '#444',
    height: '80%',
    marginHorizontal: 12,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 20,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 18,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  summaryLabel: {
    color: '#ccc',
    fontSize: 12,
  },
  summaryDivider: {
    width: 3,
    backgroundColor: '#444',
    height: '100%',
  },
  totalTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: '#333',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#ffb300',
    borderRadius: 5,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  progressTextLeft: {
    color: '#ccc',
    fontSize: 12,
  },
  progressTextRight: {
    color: '#ccc',
    fontSize: 12,
    textAlign: 'right',
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center', // Centralizar conteúdo
    marginBottom: 30,
    backgroundColor: '#fff', // Cor do anel interno
    width: 200, // Largura total do container para o gráfico
    height: 200, // Altura total do container para o gráfico
    borderRadius: 100, // Para o container ser redondo e ajudar no posicionamento
    position: 'relative', // Para posicionar as Views filhas absolutamente
    left: 80,
  },
  chartCenterView: {
    position: 'absolute',
    width: 150, // Tamanho do centro escuro
    height: 150,
    borderRadius: 80,
    backgroundColor: '#1f4d4d', // Cor do centro escuro
    zIndex: 1, // Garante que o centro escuro fique visível
  },
  percentageLabel: {
    position: 'absolute',
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    zIndex: 2, // Acima do gráfico
  },
  percentageLabelGreen: {
    // Posicionamento ajustado para 60% (mais próximo da imagem)
    top: 80,
    left:220,
  },
  percentageLabelRed: {
    position: 'absolute',
    left: 60, // Posição ajustada para a porcentagem de Despesas
    top: 90, // Posição ajustada
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 5,
  },
  legendColorGreen: {
    backgroundColor: '#1ed760',
  },
  legendColorRed: {
    backgroundColor: '#e74c3c',
  },
  legendText: {
    color: '#fff',
    fontSize: 14,
  },
  noDataText: { // Adicionado estilo para mensagem sem dados, se aplicável
    color: '#ccc',
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 1,
  },
  datePickerModal: {
    position: 'absolute',
    top: '25%',
    left: '10%',
    width: '80%',
    backgroundColor: '#222',
    borderRadius: 16,
    padding: 20,
    zIndex: 10,
    alignItems: 'center',
  },
  datePickerTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10,
  },
  pickerStyle: {
    color: '#fff',
    backgroundColor: '#333',
    width: '100%',
    marginBottom: 10,
  },
  datePickerButton: {
    backgroundColor: '#1ed760',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
  },
  datePickerButtonText: {
    color: '#111',
    fontWeight: 'bold',
  },
}); 