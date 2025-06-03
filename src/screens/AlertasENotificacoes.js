import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Dimensions, Modal, ActivityIndicator } from "react-native";
import { Ionicons, MaterialIcons, FontAwesome5, FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.93;

export default function AlertasENotificacoes() {
  const navigation = useNavigation();
  const [menuVisible, setMenuVisible] = useState(false);

  // Estados para dados que virão do backend
  const [notificacoes, setNotificacoes] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Efeito para carregar dados ao montar o componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        // Simule uma chamada de API para buscar notificações
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simula delay de rede

        // Dados de exemplo (substituir pela resposta real do backend)
        const data = [
          {
            id: '1',
            appName: 'APP NAME',
            descricao: 'Parabéns! Você atingiu 80% da sua meta de vendas semanal.',
            data: '1h ago',
          },
          {
            id: '2',
            appName: 'APP NAME',
            descricao: 'Atenção! Suas vendas caíram 30% em relação à semana passada.',
            data: '2h ago',
          },
          {
            id: '3',
            appName: 'APP NAME',
            descricao: 'Meta de lucro mensal alcançado! Continue assim para superar seu objetivo.',
            data: '1d ago',
          },
          {
            id: '4',
            appName: 'APP NAME',
            descricao: 'Lembrete: Registrar despesas da semana passada.',
            data: '2d ago',
          },
        ];

        setNotificacoes(data);

      } catch (error) {
        console.error('Erro ao buscar notificações:', error);
        // Tratar erro
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, []); // O array vazio garante que o efeito roda apenas uma vez ao montar

  return (
    <>
      <ScrollView style={styles.bg} contentContainerStyle={{ alignItems: 'center', paddingBottom: 30 }}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="close" size={24} color="#fff" style={{ marginRight: 10 }} />
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'center' }}>
              <Text style={styles.headerTitle}>
                Alertas e Notificações
              </Text>
            </View>
            <TouchableOpacity>
              <Ionicons name="ellipsis-vertical" size={24} color="#fff" style={{ marginLeft: 10 }} />
            </TouchableOpacity>
          </View>

          {/* Lista de Notificações */}
          <View style={styles.notificacoesContainer}>
            {loadingData ? (
              <ActivityIndicator size="large" color="#1ed760" style={{ marginTop: 50 }} />
            ) : notificacoes.length > 0 ? (
              notificacoes.map((notificacao) => (
                <TouchableOpacity key={notificacao.id} style={styles.notificacaoCard}>
                  <View style={styles.notificacaoHeader}>
                    <View style={styles.appIconPlaceholder} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.appName}>{notificacao.appName}</Text>
                      <Text style={styles.notificacaoDescricao}>
                        {notificacao.descricao}
                      </Text>
                    </View>
                    <Text style={styles.notificacaoData}>{notificacao.data}</Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.noDataText}>Nenhuma notificação encontrada.</Text>
            )}
          </View>

          {/* Botão Ver Mais Notificações */}
          {!loadingData && notificacoes.length > 0 && (
            <TouchableOpacity style={styles.verMaisButton}>
              <Text style={styles.verMaisButtonText}>VER MAIS NOTIFICAÇÕES</Text>
            </TouchableOpacity>
          )}
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
            <FontAwesome name="user-circle" size={48} color="#fff" style={{ marginBottom: 4 }} />
            <Text style={styles.menuUser}>Nome do Usuário</Text>
            <TouchableOpacity onPress={() => { setMenuVisible(false); navigation.navigate('MinhaConta'); }}>
              <Text style={styles.menuConta}>Minha Conta</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.menuDivider} />
          <View style={styles.menuList}>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); navigation.navigate('Home'); }}>
              <Ionicons name="document-text-outline" size={20} color="#fff" style={styles.menuIcon} />
              <Text style={styles.menuText}>RESUMO FINANCEIRO</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); navigation.navigate('RegistrarVenda'); }}>
              <Ionicons name="calendar-outline" size={20} color="#fff" style={styles.menuIcon} />
              <Text style={styles.menuText}>REGISTRAR VENDA</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); navigation.navigate('RegistrarDespesa'); }}>
              <Ionicons name="remove-circle-outline" size={20} color="#e74c3c" style={styles.menuIcon} />
              <Text style={styles.menuText}>REGISTRAR DESPESA</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); navigation.navigate('ControleDeGastos'); }}>
              <FontAwesome5 name="dollar-sign" size={18} color="#fff" style={styles.menuIcon} />
              <Text style={styles.menuText}>CONTROLE DE GASTOS</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); navigation.navigate('Relatorios'); }}>
              <Ionicons name="bar-chart-outline" size={20} color="#fff" style={styles.menuIcon} />
              <Text style={styles.menuText}>RELATÓRIOS</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); navigation.navigate('DicasFinanceiras'); }}>
              <Ionicons name="bulb-outline" size={20} color="#fff" style={styles.menuIcon} />
              <Text style={styles.menuText}>DICAS FINANCEIRAS</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); navigation.navigate('AlertasENotificacoes'); }}>
              <Ionicons name="notifications-outline" size={20} color="#fff" style={styles.menuIcon} />
              <Text style={styles.menuText}>ALERTAS E NOTIFICAÇÕES</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.menuDivider} />
          <Text style={styles.menuOutrasOpcoes}>Outras Opções</Text>
          <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); navigation.navigate('Configuracoes'); }}>
            <Ionicons name="settings-outline" size={20} color="#fff" style={styles.menuIcon} />
            <Text style={styles.menuText}>CONFIGURAÇÕES</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); navigation.navigate('Sair'); }}>
            <Ionicons name="log-out-outline" size={20} color="#fff" style={styles.menuIcon} />
            <Text style={styles.menuText}>SAIR</Text>
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
    paddingHorizontal: 15,
    paddingVertical: 70,
    marginBottom: 0,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    top: 25,
  },
  notificacoesContainer: {
    width: '95%',
    marginTop:80,
  },
  notificacaoCard: {
    backgroundColor: '#1f4d4d',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  notificacaoHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  appIconPlaceholder: {
    width: 30,
    height: 30,
    backgroundColor: '#ccc',
    borderRadius: 6,
    marginRight: 12,
    marginTop: 2,
  },
  appName: {
    color: '#ccc',
    fontSize: 12,
    marginBottom: 4,
  },
  notificacaoTitulo: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
    flex: 1,
  },
  notificacaoData: {
    color: '#ccc',
    fontSize: 12,
  },
  notificacaoDescricao: {
    color: '#d9d9d9',
    fontSize: 14,
  },
  verMaisButton: {
    backgroundColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 20,
    width: '95%',
  },
  verMaisButtonText: {
    color: '#111',
    fontWeight: 'bold',
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
  noDataText: {
    color: '#ccc',
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
}); 