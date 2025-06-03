import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Dimensions, Modal, TextInput, ActivityIndicator } from "react-native";
import { Ionicons, MaterialIcons, FontAwesome5, FontAwesome } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import api from '../services/api'; // Importa a instância da API

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.93;

export default function HomeScreen() {
  const navigation = useNavigation();
  const [menuVisible, setMenuVisible] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(1); // 1 = Janeiro
  const [selectedYear, setSelectedYear] = useState(2025);
  const [fabOptionsVisible, setFabOptionsVisible] = useState(false); // Novo estado para o modal do FAB

  // Estados para dados que virão do backend
  const [lucroTotal, setLucroTotal] = useState('R$ 0,00');
  const [metaFaturamento, setMetaFaturamento] = useState('R$ 0,00');
  const [metaFaturamentoInput, setMetaFaturamentoInput] = useState('');
  const [savingMeta, setSavingMeta] = useState(false);
  const [isMetaInputVisible, setIsMetaInputVisible] = useState(false); // Estado para controlar a visibilidade do input da meta
  const [planejamentoMeta, setPlanejamentoMeta] = useState(0); // Porcentagem
  const [planejamentoDespesa, setPlanejamentoDespesa] = useState(0); // Porcentagem
  const [planejamentoReceita, setPlanejamentoReceita] = useState(0); // Porcentagem
  const [loadingData, setLoadingData] = useState(true); // Estado de carregamento
  const [vendas, setVendas] = useState([]); // Estado para armazenar as vendas
  const [despesas, setDespesas] = useState([]); // Estado para armazenar as despesas
  const [planejamentoTexto, setPlanejamentoTexto] = useState({
    meta: 'R$ 0,00 de R$ 0,00',
    despesas: 'R$ 0,00 (0% do faturamento)',
    lucro: 'R$ 0,00 (0% do faturamento)'
  });

  const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  // Função fetchData movida para fora do useFocusEffect
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
      
      // Atualizar estados com dados filtrados
      setVendas(vendasDoMes);
      setDespesas(despesasDoMes);

      // Calcular valores totais
      const totalVendas = vendasDoMes.reduce((sum, venda) => sum + venda.valor, 0);
      const totalDespesas = despesasDoMes.reduce((sum, despesa) => sum + despesa.valor, 0);
      const lucro = totalVendas - totalDespesas;

      // Buscar meta de faturamento
      const responseConfiguracoes = await api.get('/configuracoes');
      const metaSalva = responseConfiguracoes.data.metaFaturamento || 0;

      // Calcular porcentagens para o planejamento
      // Faturamento Total: porcentagem do que já foi faturado em relação à meta
      const porcentagemMeta = metaSalva > 0 ? Math.round((totalVendas / metaSalva) * 100) : 0;
      
      // Despesas: porcentagem do total de despesas em relação ao total de vendas
      const porcentagemDespesa = totalVendas > 0 ? Math.round((totalDespesas / totalVendas) * 100) : 0;
      
      // Lucro: porcentagem do lucro em relação ao total de vendas
      const porcentagemLucro = totalVendas > 0 ? Math.round((lucro / totalVendas) * 100) : 0;

      // Limitar as porcentagens a 100%
      setPlanejamentoMeta(Math.min(porcentagemMeta, 100));
      setPlanejamentoDespesa(Math.min(porcentagemDespesa, 100));
      setPlanejamentoReceita(Math.min(porcentagemLucro, 100));

      // Atualizar o texto do planejamento para mostrar os valores reais
      setPlanejamentoTexto({
        meta: `R$ ${totalVendas.toFixed(2).replace('.', ',')} de R$ ${metaSalva.toFixed(2).replace('.', ',')} (${Math.min(porcentagemMeta, 100)}% da meta)`,
        despesas: `R$ ${totalDespesas.toFixed(2).replace('.', ',')} (${Math.min(porcentagemDespesa, 100)}% do faturamento)`,
        lucro: `R$ ${lucro.toFixed(2).replace('.', ',')} (${Math.min(porcentagemLucro, 100)}% do faturamento)`
      });

      // Atualizar estados com os valores totais
      setLucroTotal(`R$ ${lucro.toFixed(2).replace('.', ',')}`);
      setMetaFaturamento(`R$ ${metaSalva.toFixed(2).replace('.', ',')}`);

    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoadingData(false);
    }
  };

  // Efeito para carregar dados ao focar na tela e quando o mês/ano mudar
  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [selectedMonth, selectedYear])
  );

  // Função para lidar com o salvamento da meta de faturamento
  const handleSaveMetaFaturamento = async () => {
    setSavingMeta(true);
    try {
      // --- CHAMAR API DO BACKEND PARA SALVAR A META DE FATURAMENTO ---
      const metaParaSalvar = parseFloat(metaFaturamentoInput.replace(',', '.')); // Converte para número
      if (isNaN(metaParaSalvar)) {
        alert('Por favor, insira um valor numérico válido para a meta.');
        setSavingMeta(false);
        return;
      }
      await api.put('/configuracoes', { metaFaturamento: metaParaSalvar }); // Chama o endpoint PUT
      console.log('Tentando salvar meta:', metaFaturamentoInput);
      const metaSalva = parseFloat(metaFaturamentoInput).toFixed(2).replace('.', ',');
      setMetaFaturamento(`R$ ${metaSalva}`); // Atualiza a exibição na tela
      alert('Meta de faturamento salva com sucesso!'); // Feedback ao usuário
      setIsMetaInputVisible(false); // Oculta a barra após salvar com sucesso
      fetchData(); // Recarrega os dados, incluindo a meta recém-salva e recalcula o planejamento
    } catch (error) {
      console.error('Erro ao salvar meta de faturamento:', error);
      alert('Erro ao salvar meta de faturamento.'); // Feedback ao usuário
    } finally {
      setSavingMeta(false);
    }
  };

  return (
    <>
      <ScrollView style={styles.bg} contentContainerStyle={{ alignItems: 'center', paddingBottom: 30 }}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => setMenuVisible(true)}>
              <Text>
                <Ionicons name="menu" size={24} color="#fff" style={{ marginRight: 10 }} />
              </Text>
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'center' }}>
              <TouchableOpacity onPress={() => {
                if (selectedMonth === 1) {
                  if (selectedYear > 2000) {
                    setSelectedMonth(12);
                    setSelectedYear(selectedYear - 1);
                  }
                } else {
                  setSelectedMonth(selectedMonth - 1);
                }
              }}>
                <Text>
                  <Ionicons name="chevron-back" size={24} color="#fff" style={{ marginRight: 20 }} />
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setDatePickerVisible(true)}>
                <Text style={styles.headerTitle}>
                  {meses[selectedMonth - 1]} {selectedYear}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {
                if (selectedMonth === 12) {
                  if (selectedYear < 2100) {
                    setSelectedMonth(1);
                    setSelectedYear(selectedYear + 1);
                  }
                } else {
                  setSelectedMonth(selectedMonth + 1);
                }
              }}>
                <Text>
                  <Ionicons name="chevron-forward" size={24} color="#fff" style={{ marginLeft: 25 }} />
                </Text>
              </TouchableOpacity>
            </View>
            <Text>
              <Ionicons name="notifications-outline" size={20} color="#fff" style={{ marginLeft: 10 }} />
            </Text>
            <Text>
              <Ionicons name="settings" size={20} color="#fff" style={{ marginLeft: 10 }} />
            </Text>
          </View>
          {/* Saldos */}
          <View style={styles.saldosRow}>
            <View style={styles.saldoCol}>
              <Text style={styles.saldoValorVerde}>{loadingData ? 'Carregando...' : lucroTotal}</Text>
              <Text style={styles.saldoLabel}>Lucro Total</Text>
            </View>
            {/* Meta de faturamento clicável */}
            <TouchableOpacity style={styles.saldoCol} onPress={() => setIsMetaInputVisible(!isMetaInputVisible)}>
              <Text style={styles.saldoValorAmarelo}>{loadingData ? 'Carregando...' : metaFaturamento}</Text>
              <Text style={styles.saldoLabel}>Meta de faturamento</Text>
            </TouchableOpacity>
          </View>
          {/* Input para Meta de Faturamento Personalizada (renderizado condicionalmente) */}
          {isMetaInputVisible && (
            <View style={styles.metaInputContainer}>
              <TextInput
                style={styles.metaInput}
                keyboardType="numeric"
                value={metaFaturamentoInput}
                onChangeText={setMetaFaturamentoInput}
                placeholder="Definir meta (R$)"
                placeholderTextColor="#888"
              />
              <TouchableOpacity
                style={styles.saveMetaButton}
                onPress={handleSaveMetaFaturamento}
                disabled={savingMeta}
              >
                {savingMeta ? (
                  <ActivityIndicator size="small" color="#111" />
                ) : (
                  <Text style={styles.saveMetaButtonText}>Salvar Meta</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
          {/* Cards Despesas e Receitas */}
          <View style={styles.cardsRow}>
            <TouchableOpacity style={styles.cardSmall} onPress={() => navigation.navigate('ResumoFinanceiro', { filter: 'despesas' })}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleContainer}>
                  <MaterialIcons name="trending-down" size={20} color="#e74c3c" style={{ marginRight: 5 }} />
                  <Text style={styles.cardTitleDespesa}>Despesas</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#fff" />
              </View>
              <View style={styles.cardContent}>
                {loadingData ? (
                  <Text style={styles.cardItemDespesa}>Carregando...</Text>
                ) : despesas.length > 0 ? (
                  <View>
                    <Text style={styles.valorDespesa}>
                      R$ {despesas.reduce((sum, despesa) => sum + despesa.valor, 0).toFixed(2).replace('.', ',')}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.cardItemDespesa}>Nenhuma despesa registrada.</Text>
                )}
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cardSmall} onPress={() => navigation.navigate('ResumoFinanceiro', { filter: 'receitas' })}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleContainer}>
                  <MaterialIcons name="trending-up" size={20} color="#1ed760" style={{ marginRight: 5 }} />
                  <Text style={styles.cardTitleReceita}>Receitas</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#fff" />
              </View>
              <View style={styles.cardContent}>
                {loadingData ? (
                  <Text style={styles.cardItemReceita}>Carregando...</Text>
                ) : vendas.length > 0 ? (
                  <View>
                    <Text style={styles.valorReceita}>
                      R$ {vendas.reduce((sum, venda) => sum + venda.valor, 0).toFixed(2).replace('.', ',')}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.cardItemReceita}>Nenhuma venda registrada.</Text>
                )}
              </View>
            </TouchableOpacity>
          </View>
          {/* Planejamento */}
          <View style={styles.spaceBetweenCards} />
          <TouchableOpacity style={styles.planejamentoCard} onPress={() => navigation.navigate('Configuracoes')}>
            <Text style={styles.planejamentoTitulo}>Planejamento</Text>
            <View style={styles.planejamentoLinha}>
              <Text style={styles.planejamentoLabel}>FATURAMENTO TOTAL</Text>
              <View style={styles.barraFundo}>
                <View style={[styles.barraMeta, { width: loadingData ? '0%' : `${Math.min(planejamentoMeta, 100)}%` }]} />
              </View>
              <Text style={styles.porcentagem}>{loadingData ? '--%' : `${Math.min(planejamentoMeta, 100)}%`}</Text>
            </View>
            <View style={styles.planejamentoLinha}>
              <Text style={styles.planejamentoLabel}>DESPESAS</Text>
              <View style={styles.barraFundo}>
                <View style={[styles.barraDespesa, { width: loadingData ? '0%' : `${Math.min(planejamentoDespesa, 100)}%` }]} />
              </View>
              <Text style={styles.porcentagem}>{loadingData ? '--%' : `${Math.min(planejamentoDespesa, 100)}%`}</Text>
            </View>
            <View style={styles.planejamentoLinha}>
              <Text style={styles.planejamentoLabel}>LUCRO</Text>
              <View style={styles.barraFundo}>
                <View style={[styles.barraReceita, { width: loadingData ? '0%' : `${Math.min(planejamentoReceita, 100)}%` }]} />
              </View>
              <Text style={styles.porcentagem}>{loadingData ? '--%' : `${Math.min(planejamentoReceita, 100)}%`}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
      {/* Menu Lateral */}
      <Modal
        visible={menuVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPress={() => setMenuVisible(false)} />
        <View style={styles.menuContainer}>
          <View style={styles.menuHeader}>
            <Text>
              <FontAwesome name="user-circle" size={48} color="#fff" style={{ marginBottom: 4 }} />
            </Text>
            <Text style={styles.menuUser}>Nome do Usuário</Text>
            <TouchableOpacity onPress={() => { setMenuVisible(false); navigation.navigate('MinhaConta'); }}>
              <Text style={styles.menuConta}>Minha Conta</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.menuDivider} />
          <View style={styles.menuList}>
            {/* 1. RESUMO FINANCEIRO */}
            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); navigation.navigate('ResumoFinanceiro'); }}>
              <Text>
                <Ionicons name="document-text-outline" size={20} color="#fff" style={styles.menuIcon} />
              </Text>
              <Text style={styles.menuText}>RESUMO FINANCEIRO</Text>
            </TouchableOpacity>
            {/* 2. REGISTRAR VENDA */}
            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); navigation.navigate('RegistrarVenda'); }}>
              <Text>
                <Ionicons name="calendar-outline" size={20} color="#fff" style={styles.menuIcon} />
              </Text>
              <Text style={styles.menuText}>RESGISTRAR VENDA</Text>
            </TouchableOpacity>
            {/* 3. REGISTRAR DESPESA */}
            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); navigation.navigate('RegistrarDespesa'); }}>
              <Text>
                <Ionicons name="remove-circle-outline" size={20} color="#e74c3c" style={styles.menuIcon} />
              </Text>
              <Text style={styles.menuText}>REGISTRAR DESPESA</Text>
            </TouchableOpacity>
            {/* 4. CONTROLE DE GASTOS */}
            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); navigation.navigate('ControleDeGastos'); }}>
              <Text>
                <FontAwesome5 name="dollar-sign" size={18} color="#fff" style={styles.menuIcon} />
              </Text>
              <Text style={styles.menuText}>CONTROLE DE GASTOS</Text>
            </TouchableOpacity>
            {/* 5. RELATÓRIOS */}
            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); navigation.navigate('Relatorios'); }}>
              <Text>
                <Ionicons name="bar-chart-outline" size={20} color="#fff" style={styles.menuIcon} />
              </Text>
              <Text style={styles.menuText}>RELATÓRIOS</Text>
            </TouchableOpacity>
            {/* 6. DICAS FINANCEIRAS */}
            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); navigation.navigate('DicasFinanceiras'); }}>
              <Text>
                <Ionicons name="bulb-outline" size={20} color="#fff" style={styles.menuIcon} />
              </Text>
              <Text style={styles.menuText}>DICAS FINANCEIRAS</Text>
            </TouchableOpacity>
            {/* 7. ALERTAS E NOTIFICAÇÕES */}
            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); navigation.navigate('AlertasENotificacoes'); }}>
              <Text>
                <Ionicons name="notifications-outline" size={20} color="#fff" style={styles.menuIcon} />
              </Text>
              <Text style={styles.menuText}>ALERTAS E NOTIFICAÇÕES</Text>
            </TouchableOpacity>
          </View>
          {/* Divisor */}
          <View style={styles.menuDivider} />
          <Text style={styles.menuOutrasOpcoes}>Outras Opções</Text>
          {/* 8. CONFIGURAÇÕES */}
          <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); navigation.navigate('Configuracoes'); }}>
            <Text>
              <Ionicons name="settings-outline" size={20} color="#fff" style={styles.menuIcon} />
            </Text>
            <Text style={styles.menuText}>CONFIGURAÇÕES</Text>
          </TouchableOpacity>
          {/* 9. SAIR */}
          <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); navigation.navigate('Inicio'); }}>
            <Text>
              <Ionicons name="log-out-outline" size={20} color="#fff" style={styles.menuIcon} />
            </Text>
            <Text style={styles.menuText}>SAIR</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      {/* Modal de seleção de mês e ano */}
      <Modal
        visible={datePickerVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setDatePickerVisible(false)}
      >
        <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPress={() => setDatePickerVisible(false)} />
        <View style={{ position: 'absolute', top: '30%', left: '10%', width: '80%', backgroundColor: '#222', borderRadius: 16, padding: 20, zIndex: 10 }}>
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16, marginBottom: 10 }}>Selecionar Mês e Ano</Text>
          <Picker
            selectedValue={selectedMonth}
            style={{ color: '#fff', backgroundColor: '#333', marginBottom: 10 }}
            onValueChange={(itemValue) => setSelectedMonth(itemValue)}
          >
            {meses.map((mes, idx) => (
              <Picker.Item key={mes} label={mes} value={idx + 1} />
            ))}
          </Picker>
          <Picker
            selectedValue={selectedYear}
            style={{ color: '#fff', backgroundColor: '#333', marginBottom: 10 }}
            onValueChange={(itemValue) => setSelectedYear(itemValue)}
          >
            {Array.from({ length: 2100 - 2000 + 1 }, (_, i) => 2000 + i).map((ano) => (
              <Picker.Item key={ano} label={ano.toString()} value={ano} />
            ))}
          </Picker>
          <TouchableOpacity onPress={() => setDatePickerVisible(false)} style={{ backgroundColor: '#1ed760', borderRadius: 8, padding: 10, alignItems: 'center' }}>
            <Text style={{ color: '#111', fontWeight: 'bold' }}>OK</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Botão de Ação Flutuante (FAB) para Adicionar Transação */}
      <TouchableOpacity style={styles.fab} onPress={() => setFabOptionsVisible(true)}>
        <Text>
          <Ionicons name="add" size={30} color="#111" />
        </Text>
      </TouchableOpacity>

      {/* Modal de Opções do FAB */}
      <Modal
        visible={fabOptionsVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setFabOptionsVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setFabOptionsVisible(false)}
        />
        <View style={styles.fabOptionsContainer}>
          <TouchableOpacity
            style={styles.fabOptionButton}
            onPress={() => { setFabOptionsVisible(false); navigation.navigate('RegistrarVenda'); }}
          >
            <Text style={styles.fabOptionText}>Registrar Venda</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.fabOptionButton}
            onPress={() => { setFabOptionsVisible(false); navigation.navigate('RegistrarDespesa'); }}
          >
            <Text style={styles.fabOptionText}>Registrar Despesa</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: '#225b5b',
  },
  container: {
    width: '100%',
    alignItems: 'center',
  },
  headerTop: {
    backgroundColor: '#000',
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 0,
    paddingVertical: 12,
    marginBottom: 0,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginBottom: 40,
    paddingTop: 40,
    left:5,
    
  },
  saldosRow: {
    backgroundColor: '#000',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingHorizontal: 18,
    paddingVertical: 18,
    marginBottom: 18,
    bottom: 30,
  },
  saldoCol: {
    alignItems: 'center',
    flex: 1,
  },
  saldoValorVerde: {
    color: '#1ed760',
    fontSize: 24,
    fontWeight: 'bold',
  },
  saldoValorAmarelo: {
    color: '#ffb300',
    fontSize: 24,
    fontWeight: 'bold',
  },
  saldoLabel: {
    color: '#d9d9d9',
    fontSize: 14,
    marginTop: 4,
  },
  cardsRow: {
    flexDirection: 'row',
    width: '95%',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardSmall: {
    backgroundColor: '#111',
    borderRadius: 18,
    width: '48%',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 10,
    overflow: 'hidden',
    height: 120, // Altura fixa para garantir consistência
  },
  cardTitleDespesa: {
    color: '#e74c3c',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cardTitleReceita: {
    color: '#1ed760',
    fontWeight: 'bold',
    fontSize: 16,
  },
  valorDespesa: {
    color: '#e74c3c',
    fontWeight: 'bold',
    fontSize: 24,
    textAlign: 'center',
  },
  valorReceita: {
    color: '#1ed760',
    fontWeight: 'bold',
    fontSize: 24,
    textAlign: 'center',
  },
  cardItemDespesa: {
    color: '#e57373',
    fontSize: 13,
  },
  cardItemReceita: {
    color: '#1ed760',
    fontSize: 13,
  },
  planejamentoCard: {
    backgroundColor: '#111',
    width: '100%',
    padding: 20,
    marginTop: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    borderRadius: 16,
    position: 'relative',
    zIndex: 1,
  },
  planejamentoTitulo: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10,
  },
  planejamentoLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  planejamentoLabel: {
    color: '#fff',
    fontSize: 14,
    width: 130,
    marginRight: 10,
  },
  barraFundo: {
    flex: 1,
    height: 12,
    backgroundColor: '#222',
    borderRadius: 6,
    marginHorizontal: 0,
    overflow: 'hidden',
  },
  barraMeta: {
    height: '100%',
    backgroundColor: '#ffb300',
    borderRadius: 6,
  },
  barraDespesa: {
    height: '100%',
    backgroundColor: '#e74c3c',
    borderRadius: 6,
  },
  barraReceita: {
    height: '100%',
    backgroundColor: '#1ed760',
    borderRadius: 6,
  },
  porcentagem: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    width: 50,
    textAlign: 'right',
    marginLeft: 10,
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
  menuContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '80%',
    height: '100%',
    backgroundColor: '#111',
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    zIndex: 2,
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  menuHeader: {
    alignItems: 'center',
    marginBottom: 10,
  },
  menuUser: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: 4,
  },
  menuConta: {
    color: '#3b8c8c',
    fontSize: 13,
    marginBottom: 8,
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#225b5b',
    marginVertical: 10,
    width: '100%',
  },
  menuList: {
    marginBottom: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  menuIcon: {
    marginRight: 12,
  },
  menuText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
  menuOutrasOpcoes: {
    color: '#3b8c8c',
    fontSize: 14,
    marginTop: 10,
    marginBottom: 2,
    fontWeight: 'bold',
  },
  fab: { // Estilo para o Botão de Ação Flutuante
    position: 'absolute',
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    right: 20,
    bottom: 20,
    backgroundColor: '#1ed760', // Cor verde
    borderRadius: 30,
    elevation: 8, // Sombra para Android
    shadowColor: '#000', // Sombra para iOS
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  modalOverlay: { // Estilo para a área escura fora do modal
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1,
  },
  fabOptionsContainer: { // Estilo para o contêiner das opções do FAB
    position: 'absolute',
    bottom: 90, // Posiciona acima do FAB
    right: 20,
    backgroundColor: '#111',
    borderRadius: 8,
    paddingVertical: 5,
    zIndex: 2,
  },
  fabOptionButton: { // Estilo para os botões de opção dentro do modal
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  fabOptionText: { // Estilo para o texto das opções
    color: '#fff',
    fontSize: 16,
  },
  metaInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '95%',
    backgroundColor: '#111',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 20,
    marginTop: -10, // Ajuste para posicionar melhor abaixo do saldo
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  metaInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 5,
    marginRight: 10,
  },
  saveMetaButton: {
    backgroundColor: '#1ed760',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveMetaButtonText: {
    color: '#111',
    fontWeight: 'bold',
    fontSize: 14,
  },
  transactionListContainer: {
    marginBottom: 10,
    overflow: 'hidden',
  },
  spaceBetweenCards: {
    height: 10,
  },
  planejamentoDetalhe: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 10,
  },
}); 