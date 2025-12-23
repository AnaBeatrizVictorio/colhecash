import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function ConfiguracoesScreen() {
  const navigation = useNavigation();
  // const [toquesAtivo, setToquesAtivo] = useState(false); // Estado local original

  // Estados para dados que virão do backend
  const [toquesAtivo, setToquesAtivo] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(true);

  // Efeito para carregar a configuração ao montar o componente
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoadingConfig(true);
        // Simule uma chamada de API para buscar a configuração de toques
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simula delay de rede

        // Dado de exemplo (substituir pela resposta real do backend)
        const configData = { toquesAtivo: true }; // Exemplo: toques ativos por padrão no backend

        setToquesAtivo(configData.toquesAtivo);

      } catch (error) {
        console.error('Erro ao buscar configuração de toques:', error);
        // Tratar erro
      } finally {
        setLoadingConfig(false);
      }
    };

    fetchConfig();
  }, []); // O array vazio garante que o efeito roda apenas uma vez ao montar

  // Função para lidar com a mudança do Switch e (futuramente) salvar no backend
  const handleToquesChange = async (newValue) => {
    setToquesAtivo(newValue); // Atualiza o estado local imediatamente
    
    // Aqui você faria a chamada ao backend para salvar a configuração
    // try {
    //   await api.saveToquesConfig(newValue);
    //   console.log('Configuração salva com sucesso!');
    // } catch (error) {
    //   console.error('Erro ao salvar configuração:', error);
    //   // Tratar erro (talvez reverter o estado local ou mostrar mensagem)
    // }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionsButton}>
          <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      <View style={styles.header}>
        <Ionicons name="settings-outline" size={22} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.headerTitle}>CONFIGURAÇÕES</Text>
      </View>
      <View style={styles.divider} />

      {loadingConfig ? (
         <ActivityIndicator size="large" color="#1ed760" style={{ marginTop: 30 }} />
      ) : (
        <TouchableOpacity style={styles.btnConfig} activeOpacity={0.7} onPress={() => handleToquesChange(!toquesAtivo)}> {/* Adicionado onPress para o container */}
          <Text style={styles.btnText}>TOQUES E ALERTAS</Text>
          <Switch
            value={toquesAtivo}
            onValueChange={handleToquesChange} // Usa a nova função
            thumbColor={toquesAtivo ? '#1ed760' : '#fff'}
            trackColor={{ false: '#444', true: '#1ed760' }}
          />
        </TouchableOpacity>
      )}

      {/* Outras opções estáticas */}
      <TouchableOpacity style={styles.btnConfig} activeOpacity={0.7}>
        <Text style={styles.btnText}>POLÍTICA E PRIVACIDADE</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.btnConfig} activeOpacity={0.7}>
        <Text style={styles.btnText}>SOBRE O APLICATIVO</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.btnConfig} activeOpacity={0.7}>
        <Text style={styles.btnText}>FEEDBACK E SUGESTÕES</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: 0,
    paddingHorizontal: 0,
  },
  topBar: {
    backgroundColor: '#225b5b',
    height:130,
    width: '100%',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingTop: 18,
    paddingHorizontal: 18,
  },
  closeButton: {
    zIndex: 10,
    padding: 4,
  },
  optionsButton: {
    zIndex: 10,
    padding: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 20,
    marginTop: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    marginTop: 18,
  },
  headerTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 1,
  },
  divider: {
    height: 3,
    backgroundColor: '#1ed760',
    width: '100%',
    marginBottom: 30,
    borderRadius: 2,
  },
  btnConfig: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#111',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 18,
    marginHorizontal: 18,
  },
  btnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  noDataText: { // Adicionado estilo para mensagem sem dados, se aplicável
    color: '#ccc',
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
}); 