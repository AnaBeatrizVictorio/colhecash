import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function DicasFinanceirasScreen() {
  const navigation = useNavigation();

  // Estados para dados que virão do backend
  const [dicas, setDicas] = useState([]);
  const [loadingDicas, setLoadingDicas] = useState(true);

  // Efeito para carregar as dicas ao montar o componente
  useEffect(() => {
    const fetchDicas = async () => {
      try {
        setLoadingDicas(true);
        // Simule uma chamada de API para buscar dicas financeiras
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simula delay de rede

        // Dados de exemplo (substituir pela resposta real do backend)
        const dicasData = [
          { id: '1', texto: 'Evite comprar em excesso !' },
          { id: '2', texto: 'Revise seus preços com base no custo atualizado de produção.' },
          { id: '3', texto: 'Ofereça promoções estratégicas.' },
          { id: '4', texto: 'Mantenha um registro detalhado de todas as suas transações.' },
          { id: '5', texto: 'Separe suas finanças pessoais das finanças do negócio.' },
        ];

        setDicas(dicasData);

      } catch (error) {
        console.error('Erro ao buscar dicas financeiras:', error);
        // Tratar erro
      } finally {
        setLoadingDicas(false);
      }
    };

    fetchDicas();
  }, []); // O array vazio garante que o efeito roda apenas uma vez ao montar

  return (
    <View style={styles.bg}>
      <View style={styles.headerTop}>
        <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTopText}>Dicas Financeiras</Text>
      </View>
      
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-start', alignItems: 'center', paddingBottom: 24 }}>
        <View style={styles.dicasContainer}>
          {loadingDicas ? (
            <ActivityIndicator size="large" color="#FFC700" style={{ marginTop: 50 }} />
          ) : dicas.length > 0 ? (
            dicas.map((dica) => (
              <View key={dica.id} style={styles.card}>
                <MaterialCommunityIcons name="lightbulb-on-outline" size={24} color="#FFC700" style={styles.icon} />
                <Text style={styles.cardText}>{dica.texto}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noDataText}>Nenhuma dica financeira encontrada.</Text>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.feedbackText}>FeedBack</Text>
        <Ionicons name="thumbs-up-outline" size={20} color="#fff" style={{ marginHorizontal: 6 }} />
        <Ionicons name="thumbs-down-outline" size={20} color="#fff" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: '#225b5b',
    paddingTop: 0,
    justifyContent: 'flex-start',
  },
  headerTop: {
    backgroundColor: '#000',
    height: 150,
    width: '100%',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 0,
    paddingLeft: 0,
    position: 'relative',
  },
  closeButton: {
    zIndex: 10,
    position: 'absolute',
    left: 12,
    top: 18,
    padding: 4,
  },
  headerTopText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
    marginTop: 32,
    textAlign: 'center',
  },
  dicasContainer: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 24,
    width: '100%',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#184d4d',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 18,
    width: '90%',
    minHeight: 56,
  },
  icon: {
    marginRight: 12,
  },
  cardText: {
    color: '#fff',
    fontSize: 15,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginLeft: 18,
    marginBottom: 35,
  },
  feedbackText: {
    color: '#fff',
    marginRight: 8,
  },
  noDataText: {
    color: '#ccc',
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
}); 