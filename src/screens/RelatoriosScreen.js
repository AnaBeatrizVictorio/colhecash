import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import api from '../services/api';

const { width } = Dimensions.get('window');

export default function RelatoriosScreen({ navigation }) {
  // Estados para dados que virão do backend
  const [mediaDiaria, setMediaDiaria] = useState('R$ 0,00');
  const [mediaMensal, setMediaMensal] = useState('R$ 0,00');
  const [dadosGrafico, setDadosGrafico] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [vendas, setVendas] = useState([]);
  const [despesas, setDespesas] = useState([]);
  const [metaFaturamento, setMetaFaturamento] = useState(0);

  // Estados para seleção de data
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  // Função para calcular as médias
  const calcularMedias = (vendas, despesas) => {
    // Filtrar vendas do mês selecionado
    const vendasDoMes = vendas.filter(venda => {
      const dataVenda = new Date(venda.data);
      return dataVenda.getMonth() === selectedMonth - 1 && dataVenda.getFullYear() === selectedYear;
    });

    // Filtrar despesas do mês selecionado
    const despesasDoMes = despesas.filter(despesa => {
      const dataDespesa = new Date(despesa.data);
      return dataDespesa.getMonth() === selectedMonth - 1 && dataDespesa.getFullYear() === selectedYear;
    });
    
    // Calcular total de vendas do mês
    const totalVendasMes = vendasDoMes.reduce((sum, venda) => sum + venda.valor, 0);
    
    // Calcular total de despesas do mês
    const totalDespesasMes = despesasDoMes.reduce((sum, despesa) => sum + despesa.valor, 0);
    
    // Calcular média diária (total de vendas do mês / número de dias no mês)
    const diasNoMes = new Date(selectedYear, selectedMonth, 0).getDate();
    const mediaDiariaValor = totalVendasMes / diasNoMes;
    
    // Calcular lucro total do mês
    const lucroTotal = totalVendasMes - totalDespesasMes;
    
    // Formatar valores
    setMediaDiaria(`R$ ${mediaDiariaValor.toFixed(2).replace('.', ',')}`);
    setMediaMensal(`R$ ${lucroTotal.toFixed(2).replace('.', ',')}`);
  };

  // Função para determinar o tipo baseado na média mensal
  const determinarTipo = (valor, mediaMensal) => {
    const diferenca = Math.abs(valor - mediaMensal);
    const percentualDiferenca = (diferenca / mediaMensal) * 100;

    if (percentualDiferenca <= 10) return 'Médio'; // Até 10% de diferença
    return valor > mediaMensal ? 'Alto' : 'Baixo';
  };

  // Efeito para carregar dados
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        
        // Buscar vendas
        const responseVendas = await api.get('/vendas');
        setVendas(responseVendas.data);
        
        // Buscar despesas
        const responseDespesas = await api.get('/despesas');
        setDespesas(responseDespesas.data);

        // Buscar meta de faturamento
        const responseConfiguracoes = await api.get('/configuracoes');
        const metaSalva = responseConfiguracoes.data.metaFaturamento || 0;
        setMetaFaturamento(metaSalva);
        
        // Calcular médias
        calcularMedias(responseVendas.data, responseDespesas.data);
        
        // Preparar dados para o gráfico
        const vendasPorMes = meses.map((_, index) => {
          const vendasMes = responseVendas.data.filter(venda => {
            const dataVenda = new Date(venda.data);
            return dataVenda.getMonth() === index && dataVenda.getFullYear() === selectedYear;
          });
          return vendasMes.reduce((sum, venda) => sum + venda.valor, 0);
        });

        // Calcular média mensal de vendas (apenas meses com vendas)
        const mesesComVendas = vendasPorMes.filter(valor => valor > 0);
        const mediaMensalVendas = mesesComVendas.length > 0 
          ? mesesComVendas.reduce((sum, valor) => sum + valor, 0) / mesesComVendas.length 
          : 0;

        const dadosGraficoAtual = meses.map((mes, index) => {
          const vendasMes = responseVendas.data.filter(venda => {
            const dataVenda = new Date(venda.data);
            return dataVenda.getMonth() === index && dataVenda.getFullYear() === selectedYear;
          });
          const despesasMes = responseDespesas.data.filter(despesa => {
            const dataDespesa = new Date(despesa.data);
            return dataDespesa.getMonth() === index && dataDespesa.getFullYear() === selectedYear;
          });
          
          const totalVendasMes = vendasMes.reduce((sum, venda) => sum + venda.valor, 0);
          const totalDespesasMes = despesasMes.reduce((sum, despesa) => sum + despesa.valor, 0);
          const lucroMes = totalVendasMes - totalDespesasMes;
          
          return {
            mes: mes.charAt(0),
            valor: lucroMes,
            tipo: totalVendasMes > 0 ? determinarTipo(totalVendasMes, mediaMensalVendas) : 'Baixo'
          };
        });
        
        setDadosGrafico(dadosGraficoAtual);
        
      } catch (error) {
        console.error('Erro ao buscar dados do relatório:', error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [selectedMonth, selectedYear]);

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
      
      {/* Main Content */}
      <View style={styles.contentContainer}>
        {/* Médias Diária e Mensal */}
        <View style={styles.averagesContainer}>
          <View style={styles.averageBox}>
            <Text style={styles.averageLabel}>Média Diária</Text>
            <Text style={styles.averageValue}>
              {loadingData ? 'Carregando...' : 
                vendas.filter(v => {
                  const data = new Date(v.data);
                  return data.getMonth() === selectedMonth - 1 && data.getFullYear() === selectedYear;
                }).length > 0 ? mediaDiaria : 'Sem dados'}
            </Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.averageBox}>
            <Text style={styles.averageLabel}>Média Mensal</Text>
            <Text style={styles.averageValue}>
              {loadingData ? 'Carregando...' : 
                vendas.filter(v => {
                  const data = new Date(v.data);
                  return data.getMonth() === selectedMonth - 1 && data.getFullYear() === selectedYear;
                }).length > 0 ? mediaMensal : 'Sem dados'}
            </Text>
          </View>
        </View>

        {/* Gráfico */}
        <View style={styles.chartContainer}>
          {/* Eixos e Rótulos do Gráfico */}
          <View style={styles.yAxis}>
            <Text style={styles.yAxisLabel}>8k</Text>
            <Text style={styles.yAxisLabel}>6k</Text>
            <Text style={styles.yAxisLabel}>4k</Text>
            <Text style={styles.yAxisLabel}>2k</Text>
            <Text style={styles.yAxisLabel}>0k</Text>
          </View>
          <View style={styles.chartArea}>
            {/* Linhas de Referência */}
            <View style={[styles.referenceLineBase, styles.referenceLineTop]} />
            <View style={[styles.referenceLineBase, styles.referenceLine75]} />
            <View style={[styles.referenceLineBase, styles.referenceLine50]} />
            <View style={[styles.referenceLineBase, styles.referenceLine25]} />
            <View style={[styles.referenceLineBase, styles.referenceLineBottom]} />

            {/* Barras do Gráfico (representação estática, agora baseada em estado) */}
            <View style={styles.barsContainer}>
              {loadingData ? (
                <Text style={styles.chartPlaceholder}>Carregando Gráfico...</Text>
              ) : (
                dadosGrafico.map((item, index) => (
                  <View
                    key={index}
                    style={[
                      styles.bar,
                      { 
                        height: `${(item.valor / 8000) * 100}%`, // Cálculo de altura baseado no valor (max 8k)
                        backgroundColor: 
                          item.tipo === 'Baixo' ? '#e74c3c' :
                          item.tipo === 'Médio' ? '#ffb300' :
                          '#1ed760', // Alto
                      }
                    ]}
                  />
                ))
              )}
            </View>
          </View>

          {/* Rótulos do Eixo X (Meses) */}
          <View style={styles.xAxisLabels}>
            {loadingData ? (
               Array.from({ length: 12 }).map((_, index) => <Text key={index} style={styles.xAxisLabel}>-</Text>)
            ) : (
              dadosGrafico.map((item, index) => <Text key={index} style={styles.xAxisLabel}>{item.mes}</Text>)
            )}
          </View>

           {/* Rótulos do Eixo Y Secundário */}
           <View style={styles.yAxisSecondary}>
            <Text style={styles.yAxisSecondaryLabel}>200</Text>
            <Text style={styles.yAxisSecondaryLabel}>150</Text>
            <Text style={styles.yAxisSecondaryLabel}>100</Text>
            <Text style={styles.yAxisSecondaryLabel}>50</Text>
            <Text style={styles.yAxisSecondaryLabel}>0</Text>
          </View>

        </View>

        {/* Legenda do Gráfico */}
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#e74c3c' }]} />
            <Text style={styles.legendText}>Baixo</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#ffb300' }]} />
            <Text style={styles.legendText}>Médio</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#1ed760' }]} />
            <Text style={styles.legendText}>Alto</Text>
          </View>
        </View>

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
    backgroundColor: '#225b5b', // Cor de fundo principal similar à outra tela
    paddingTop: 0,
  },
  headerTop: {
    backgroundColor: '#000',
    height: 150,
    width: '100%',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 14,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    top:20,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 20,
    alignItems: 'center',
  },
  averagesContainer: {
    backgroundColor: '#111',
    borderRadius: 16,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    marginBottom: 20,
  },
  averageBox: {
    alignItems: 'center',
  },
  averageLabel: {
    color: '#d9d9d9',
    fontSize: 14,
    marginBottom: 4,
  },
  averageValue: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    width: 1,
    backgroundColor: '#333',
  },
  chartContainer: {
    backgroundColor: '#111',
    borderRadius: 16,
    width: '100%',
    height: 320,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 27,
    marginTop: 17,
    borderWidth: 1,
    borderColor: '#fff',
  },
  yAxis: {
    justifyContent: 'space-between',
    height: '85%',
    paddingBottom: 5,
    marginRight: 5,
  },
  yAxisLabel: {
    color: '#d9d9d9',
    fontSize: 11,
  },
  chartArea: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
    position: 'relative',
  },
  referenceLineBase: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#fff',
  },
  referenceLineTop: {
    top: 0,
  },
  referenceLine75: {
    top: '25%',
  },
  referenceLine50: {
    top: '50%',
  },
  referenceLine25: {
    top: '75%',
  },
  referenceLineBottom: {
    bottom: 15,
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: '85%',
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    paddingHorizontal: 10,
  },
  bar: {
    width: 15,
    borderRadius: 4,
  },
  xAxisLabels: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 5,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 10,
  },
  xAxisLabel: {
    color: '#d9d9d9',
    fontSize: 11,
  },
  yAxisSecondary: {
    justifyContent: 'space-between',
    height: '85%',
    paddingBottom: 5,
    marginLeft: 5,
    alignItems: 'flex-end',
  },
  yAxisSecondaryLabel: {
    color: '#d9d9d9',
    fontSize: 11,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
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
  legendText: {
    color: '#fff',
    fontSize: 13,
  },
  chartPlaceholder: {
    color: '#d9d9d9',
    fontSize: 14,
    fontWeight: 'bold',
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
  metaContainer: {
    backgroundColor: '#111',
    borderRadius: 16,
    width: '100%',
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  metaLabel: {
    color: '#d9d9d9',
    fontSize: 14,
    marginBottom: 4,
  },
  metaValue: {
    color: '#ffb300',
    fontSize: 24,
    fontWeight: 'bold',
  },
}); 