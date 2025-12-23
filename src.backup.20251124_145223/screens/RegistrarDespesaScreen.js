import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Modal, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import api from '../services/api';

// const categorias = [
//   'MATÉRIA PRIMA E INSUMOS',
//   'TRANSPORTE E LOGÍSTICA',
//   'IMPOSTOS E TAXAS',
//   'DÍVIDAS E EMPRÉSTIMOS',
//   'EQUIPAMENTOS E MANUTENÇÃO',
//   'OUTRAS DESPESAS',
// ];

export default function RegistrarDespesaScreen() {
  const navigation = useNavigation();
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('');
  const [valor, setValor] = useState('');
  const [showCategoria, setShowCategoria] = useState(false);
  const [saving, setSaving] = useState(false);

  // Estados para dados que virão do backend
  const [categorias, setCategorias] = useState([]);
  const [loadingCategorias, setLoadingCategorias] = useState(true);

  // Efeito para carregar as categorias ao montar o componente
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        setLoadingCategorias(true);
        // Simule uma chamada de API para buscar categorias de despesa
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simula delay de rede

        // Dados de exemplo (substituir pela resposta real do backend)
        const categoriasData = [
          'MATÉRIA-PRIMA',
          'TRANSPORTE',
          'IMPOSTOS',
          'DÍVIDAS',
          'MANUTENÇÃO',
          'OUTRAS DESPESAS',
        ];

        setCategorias(categoriasData);

      } catch (error) {
        console.error('Erro ao buscar categorias de despesa:', error);
        // Tratar erro
      } finally {
        setLoadingCategorias(false);
      }
    };

    fetchCategorias();
  }, []); // O array vazio garante que o efeito roda apenas uma vez ao montar

  const teclas = [
    ['7', '8', '9', '+'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '*'],
    ['0', '.', '=', '/'],
  ];

  function handleTecla(tecla) {
    if (tecla === '=') return;
    setValor((prev) => prev + tecla);
  }

  function limparValor() {
    setValor('');
  }

  // Função para salvar a despesa
  const handleSaveDespesa = async () => {
    if (!valor) {
      Alert.alert('Erro', 'Por favor, insira um valor para a despesa.');
      return;
    }

    // Converte o valor para número (float)
    const valorNumerico = parseFloat(valor.replace(',', '.')); // Trata vírgula como separador decimal
    if (isNaN(valorNumerico)) {
         Alert.alert('Erro', 'Valor inválido.');
         return;
    }

    try {
      setSaving(true);
      // Envia os dados da despesa para o backend
      // A rota no backend espera valor, data, descricao e categoria
      const response = await api.post('/despesas', { // Rota /despesas no backend
        valor: valorNumerico,
        data: new Date(), // Envia a data atual
        descricao: descricao,
        categoria: categoria,
      });

      console.log('Despesa salva com sucesso:', response.data);
      Alert.alert('Sucesso', 'Despesa registrada com sucesso!');

      // Limpar campos após salvar
      setDescricao('');
      setCategoria('');
      setValor('');

      // Opcional: navegar de volta ou para outra tela
      // navigation.goBack();

    } catch (error) {
      console.error('Erro ao salvar despesa:', error);
      // Exibe a mensagem de erro específica do backend, se disponível
      const errorMessage = error.response?.data?.message || 'Falha ao registrar despesa. Tente novamente.';
      Alert.alert('Erro', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.bg}>
      <View style={styles.headerAzul}>
        <Text style={styles.headerAzulText}>Registrar Despesa</Text>
      </View>
      <View style={styles.modalPreto}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Nova despesa</Text>
          <TouchableOpacity onPress={handleSaveDespesa} disabled={saving}>
            {saving ? (
               <ActivityIndicator size="small" color="#1ed760" />
            ) : (
               <Ionicons name="checkmark" size={26} color="#1ed760" />
            )}
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.input}
          placeholder="Descrição"
          placeholderTextColor="#b0b0b0"
          value={descricao}
          onChangeText={setDescricao}
        />
        {/* Dropdown de categoria */}
        <TouchableOpacity style={styles.input} onPress={() => setShowCategoria(true)} disabled={loadingCategorias}> {/* Desabilita enquanto carrega */}
           {loadingCategorias ? (
            <ActivityIndicator size="small" color="#b0b0b0" />
          ) : (
             <Text style={{ color: categoria ? '#fff' : '#b0b0b0' }}>{categoria || 'Categoria'}</Text>
          )}
          <Ionicons name="chevron-down" size={18} color="#b0b0b0" style={{ position: 'absolute', right: 10, top: 12 }} />
        </TouchableOpacity>
        <Modal visible={showCategoria} transparent animationType="fade">
          <TouchableOpacity style={styles.categoriaOverlay} onPress={() => setShowCategoria(false)} />
          <View style={styles.categoriaModal}>
            {loadingCategorias ? (
              <ActivityIndicator size="large" color="#1ed760" style={{ marginTop: 20 }} />
            ) : categorias.length > 0 ? (
              categorias.map((cat) => (
                <TouchableOpacity key={cat} style={styles.categoriaItem} onPress={() => { setCategoria(cat); setShowCategoria(false); }}>
                  <Text style={{ color: '#fff', fontSize: 15 }}>{cat}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.noDataText}>Nenhuma categoria encontrada.</Text>
            )}
          </View>
        </Modal>
        <View style={styles.inputValorContainer}>
          <Text style={{ color: '#b0b0b0', marginLeft: 8 }}>R$</Text>
          <TextInput
            style={styles.inputValor}
            placeholder="0.0"
            placeholderTextColor="#b0b0b0"
            value={valor}
            onChangeText={setValor}
            keyboardType="numeric"
          />
          {valor.length > 0 && (
            <TouchableOpacity onPress={limparValor} style={{ marginRight: 8 }}>
              <Ionicons name="close-circle" size={20} color="#b0b0b0" />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.tecladoContainer}>
          {teclas.map((linha, i) => (
            <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
              {linha.map((tecla) => (
                <TouchableOpacity
                  key={tecla}
                  style={styles.tecla}
                  onPress={() => handleTecla(tecla)}
                >
                  <Text style={styles.teclaText}>{tecla}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
  },
  headerAzul: {
    backgroundColor: '#225b5b',
    width: '100%',
    height: 90,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  headerAzulText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: 28,
  },
  modalPreto: {
    backgroundColor: '#111',
    flex: 1,
    width: '100%',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    marginTop: 0,
    paddingHorizontal: 0,
    paddingTop: 18,
    paddingBottom: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
    paddingHorizontal: 18,
  },
  modalTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  input: {
    backgroundColor: '#222',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 14,
    color: '#fff',
    fontSize: 15,
    marginBottom: 12,
    position: 'relative',
    marginHorizontal: 18,
        borderRadius: 16,
            paddingHorizontal: 18,

  },
  inputValorContainer: {
    backgroundColor: '#222',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
    position: 'relative',
    alignSelf: 'center',
    marginHorizontal: 18,
  },
  inputValor: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
    paddingHorizontal: 10,
  },
  tecladoContainer: {
    marginTop: 30,
    marginBottom: 8,
    flex: 1,
    justifyContent: 'center',
  },
  tecla: {
    backgroundColor: '#222',
    borderRadius: 8,
    width: 65,
    height: 65,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 12,
  },
  teclaText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  categoriaOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 1,
  },
  categoriaModal: {
    position: 'absolute',
    top: 100,
    left: '5%',
    width: '90%',
    backgroundColor: '#111',
    borderRadius: 16,
    padding: 16,
    zIndex: 2,
  },
  categoriaItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  noDataText: { // Adicionado estilo para mensagem sem dados
    color: '#ccc',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
}); 