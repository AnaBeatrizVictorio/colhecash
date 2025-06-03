import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Dimensions, TextInput, ActivityIndicator, Modal } from "react-native";
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import api from '../services/api'; // Importa a instância da API

const { width } = Dimensions.get('window');

export default function ResumoFinanceiroScreen({ route }) {
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState('');
  const filter = route.params?.filter;

  // Estados para dados que virão do backend
  const [transactions, setTransactions] = useState([]);
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
        let fetchedTransactions = [];

        if (filter === 'receitas') {
          // Buscar vendas
          const responseVendas = await api.get('/vendas');
          console.log('Vendas recebidas:', responseVendas.data);
          
          if (!responseVendas.data || !Array.isArray(responseVendas.data)) {
            console.error('Dados de vendas inválidos:', responseVendas.data);
            setTransactions([]);
            return;
          }
          
          // Filtrar vendas do mês/ano selecionado
          const vendasDoMes = responseVendas.data.filter(venda => {
            if (!venda.data) {
              console.error('Venda sem data:', venda);
              return false;
            }
            const dataVenda = new Date(venda.data);
            console.log('Data da venda:', dataVenda, 'Mês selecionado:', selectedMonth - 1, 'Ano selecionado:', selectedYear);
            return dataVenda.getMonth() === selectedMonth - 1 && dataVenda.getFullYear() === selectedYear;
          });
          console.log('Vendas do mês:', vendasDoMes);

          // Formatar os dados de vendas para o formato esperado pela tela
          fetchedTransactions = vendasDoMes.map(venda => ({
            date: new Date(venda.data).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit' }),
            items: [{
              description: venda.descricao || `Venda R$ ${venda.valor.toFixed(2).replace('.', ',')}`,
              type: 'receita',
              value: venda.valor,
              category: venda.categoria || 'Sem Categoria',
              method: venda.formaPagamento || 'Registrado',
              date: venda.data
            }]
          }));

        } else if (filter === 'despesas') {
          // Buscar despesas
          const responseDespesas = await api.get('/despesas');
          console.log('Despesas recebidas:', responseDespesas.data);
          
          if (!responseDespesas.data || !Array.isArray(responseDespesas.data)) {
            console.error('Dados de despesas inválidos:', responseDespesas.data);
            setTransactions([]);
            return;
          }
          
          // Filtrar despesas do mês/ano selecionado
          const despesasDoMes = responseDespesas.data.filter(despesa => {
            if (!despesa.data) {
              console.error('Despesa sem data:', despesa);
              return false;
            }
            const dataDespesa = new Date(despesa.data);
            console.log('Data da despesa:', dataDespesa, 'Mês selecionado:', selectedMonth - 1, 'Ano selecionado:', selectedYear);
            return dataDespesa.getMonth() === selectedMonth - 1 && dataDespesa.getFullYear() === selectedYear;
          });
          console.log('Despesas do mês:', despesasDoMes);

          // Formatar os dados de despesas para o formato esperado pela tela
          fetchedTransactions = despesasDoMes.map(despesa => ({
            date: new Date(despesa.data).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit' }),
            items: [{
              description: despesa.descricao || `Despesa R$ ${despesa.valor.toFixed(2).replace('.', ',')}`,
              type: 'despesa',
              value: despesa.valor,
              category: despesa.categoria || 'Sem Categoria',
              method: despesa.formaPagamento || 'Registrado',
              date: despesa.data
            }]
          }));
        } else {
          // Se não houver filtro, buscar tanto vendas quanto despesas
          const [responseVendas, responseDespesas] = await Promise.all([
            api.get('/vendas'),
            api.get('/despesas')
          ]);

          // Processar vendas
          const vendasDoMes = responseVendas.data.filter(venda => {
            if (!venda.data) return false;
            const dataVenda = new Date(venda.data);
            return dataVenda.getMonth() === selectedMonth - 1 && dataVenda.getFullYear() === selectedYear;
          });

          // Processar despesas
          const despesasDoMes = responseDespesas.data.filter(despesa => {
            if (!despesa.data) return false;
            const dataDespesa = new Date(despesa.data);
            return dataDespesa.getMonth() === selectedMonth - 1 && dataDespesa.getFullYear() === selectedYear;
          });

          // Combinar e formatar todas as transações
          const todasTransacoes = [
            ...vendasDoMes.map(venda => ({
              date: new Date(venda.data).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit' }),
              items: [{
                description: venda.descricao || `Venda R$ ${venda.valor.toFixed(2).replace('.', ',')}`,
                type: 'receita',
                value: venda.valor,
                category: venda.categoria || 'Sem Categoria',
                method: venda.formaPagamento || 'Registrado',
                date: venda.data
              }]
            })),
            ...despesasDoMes.map(despesa => ({
              date: new Date(despesa.data).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit' }),
              items: [{
                description: despesa.descricao || `Despesa R$ ${despesa.valor.toFixed(2).replace('.', ',')}`,
                type: 'despesa',
                value: despesa.valor,
                category: despesa.categoria || 'Sem Categoria',
                method: despesa.formaPagamento || 'Registrado',
                date: despesa.data
              }]
            }))
          ];

          fetchedTransactions = todasTransacoes;
        }

        // Agrupar transações por data
        const transacoesAgrupadas = fetchedTransactions.reduce((acc, curr) => {
          const existingDay = acc.find(item => item.date === curr.date);
          if (existingDay) {
            existingDay.items.push(...curr.items);
          } else {
            acc.push(curr);
          }
          return acc;
        }, []);

        // Ordenar por data (mais recente primeiro)
        transacoesAgrupadas.sort((a, b) => new Date(b.items[0].date) - new Date(a.items[0].date));
        console.log('Transações agrupadas:', transacoesAgrupadas);

        // Atualiza o estado com os dados buscados e formatados
        setTransactions(transacoesAgrupadas);

      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        if (error.response) {
          console.error('Detalhes do erro:', error.response.data);
          console.error('Status do erro:', error.response.status);
        }
        setTransactions([]);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [selectedMonth, selectedYear, filter]);

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
          <View>
            <Ionicons name="close" size={24} color="#fff" />
          </View>
        </TouchableOpacity>
        
        {/* Navegação de Mês/Ano */}
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={goToPreviousMonth}>
            <View>
              <Ionicons name="chevron-back" size={24} color="#fff" style={{ marginRight: 20 }} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setDatePickerVisible(true)}>
            <View>
              <Text style={styles.monthYearText}>
                {meses[selectedMonth - 1]} {selectedYear}
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={goToNextMonth}>
            <View>
              <Ionicons name="chevron-forward" size={24} color="#fff" style={{ marginLeft: 20 }} />
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity>
          <View>
            <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Despesas / Receitas */}
      <View style={styles.financialSummaryHeader}>
         <View style={styles.financialSummaryItem}>
            <View>
              <Ionicons name="arrow-down-circle" size={20} color="#e74c3c" style={{ marginRight: 5 }} />
            </View>
            <Text style={styles.financialSummaryText}>Despesas</Text>
         </View>
         <View style={styles.verticalDivider} />
         <View style={styles.financialSummaryItem}>
            <View>
              <Ionicons name="arrow-up-circle" size={20} color="#1ed760" style={{ marginRight: 5 }} />
            </View>
            <Text style={styles.financialSummaryText}>Receitas</Text>
         </View>
      </View>

      <ScrollView style={styles.scrollViewContent}>
        <View style={styles.contentContainer}>
          <Text style={styles.screenTitle}>
            {filter === 'receitas' ? 'Resumo de Receitas' : 
             filter === 'despesas' ? 'Resumo de Despesas' : 
             'Resumo Financeiro'}
          </Text>

          {/* Search Bar */}
          <View style={styles.searchBarContainer}>
            <View>
              <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
            </View>
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar"
              placeholderTextColor="#888"
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>

          {/* Transaction List */}
          {loadingData ? (
            <ActivityIndicator size="large" color="#1ed760" style={{ marginTop: 50 }} />
          ) : transactions.length > 0 ? (
            transactions.map((dayData, index) => (
              <View key={index}>
                <Text style={styles.dateHeader}>{dayData.date}</Text>
                {dayData.items.map((item, itemIndex) => (
                  <TouchableOpacity 
                    key={itemIndex} 
                    style={styles.transactionItem}
                  >
                    <View style={styles.transactionIconContainer}>
                       <View>
                         <Ionicons 
                            name={item.type === 'receita' ? 'briefcase-outline' : 'arrow-down-circle-outline'}
                            size={20} 
                            color="#fff" 
                         />
                       </View>
                    </View>
                    <View style={styles.transactionDetails}>
                      <Text style={styles.transactionDescription}>{item.description}</Text>
                      {item.category && <Text style={styles.transactionMethod}>{item.category}</Text>}
                      <Text style={styles.transactionMethod}>{new Date(item.date).toLocaleDateString('pt-BR')}</Text>
                    </View>
                    <Text style={[styles.transactionValue, { color: item.type === 'receita' ? '#1ed760' : '#e74c3c' }]}>
                      R$ {item.value.toFixed(2).replace('.', ',')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>
                {filter === 'receitas' ? 
                  'Nenhuma receita encontrada para ' + meses[selectedMonth - 1] + '/' + selectedYear :
                  filter === 'despesas' ?
                  'Nenhuma despesa encontrada para ' + meses[selectedMonth - 1] + '/' + selectedYear :
                  'Nenhuma transação encontrada para ' + meses[selectedMonth - 1] + '/' + selectedYear}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modal de seleção de mês e ano */}
      <Modal
        visible={datePickerVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setDatePickerVisible(false)}
      >
        <View style={styles.menuOverlay}>
          <TouchableOpacity 
            style={{ flex: 1 }} 
            activeOpacity={1} 
            onPress={() => setDatePickerVisible(false)} 
          />
        </View>
        <View style={styles.datePickerModal}>
          <Text style={styles.datePickerTitle}>Selecionar Mês e Ano</Text>
          <Picker
            selectedValue={selectedMonth}
            style={styles.pickerStyle}
            onValueChange={(itemValue) => setSelectedMonth(itemValue)}
          >
            {meses.map((mes, idx) => (
              <Picker.Item 
                key={mes} 
                label={mes} 
                value={idx + 1}
                color="#fff"
              />
            ))}
          </Picker>
          <Picker
            selectedValue={selectedYear}
            style={styles.pickerStyle}
            onValueChange={(itemValue) => setSelectedYear(itemValue)}
          >
            {Array.from({ length: 2100 - 2000 + 1 }, (_, i) => 2000 + i).map((ano) => (
              <Picker.Item 
                key={ano} 
                label={ano.toString()} 
                value={ano}
                color="#fff"
              />
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
  financialSummaryHeader: {
    backgroundColor: '#000',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  financialSummaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
  },
   financialSummaryText: {
    color: '#fff',
    fontSize: 14,
   },
  verticalDivider: {
    width: 1,
    backgroundColor: '#444',
    height: '80%',
    marginHorizontal: 12,
  },
  scrollViewContent: {
    flex: 1,
    width: '100%',
  },
  contentContainer: {
    paddingHorizontal: 18,
    paddingTop: 20,
  },
  screenTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 18,
    textAlign: 'center',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    borderRadius: 25,
    paddingHorizontal: 15,
    marginBottom: 20,
    height: 40,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
  dateHeader: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f4d4d',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 8,
  },
  transactionIconContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  transactionMethod: {
    color: '#ccc',
    fontSize: 12,
  },
  transactionValue: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
    paddingHorizontal: 20,
  },
  noDataText: {
    color: '#ccc',
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
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