import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TextInput, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { getUser, updateProfile } from '../services/auth';

const { width } = Dimensions.get('window');

export default function MinhaContaScreen() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [fotoPerfil, setFotoPerfil] = useState('');
  const [identificacao, setIdentificacao] = useState('');
  const [senha, setSenha] = useState('');
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoadingData(true);
      const userData = await getUser();
      
      if (userData) {
        setNome(userData.nome || '');
        setEmail(userData.email || '');
        setTelefone(userData.telefone || '');
        setFotoPerfil(userData.fotoPerfil || '');
        setIdentificacao(userData.identificacao || '');
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao carregar dados do usuário');
    } finally {
      setLoadingData(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoadingData(true);
      
      const updateData = {
        nome,
        telefone,
        fotoPerfil,
        identificacao,
      };

      if (senha) {
        updateData.senha = senha;
      }

      await updateProfile(updateData);
      setSenha('');
      Alert.alert('Sucesso', 'Dados atualizados com sucesso!');
    } catch (error) {
      Alert.alert('Erro', error.message || 'Erro ao salvar dados');
    } finally {
      setLoadingData(false);
    }
  };

  return (
    <View style={styles.bg}>
      <View style={styles.card}>
        <FontAwesome name="user-circle" size={60} color="#218080" style={{ alignSelf: 'center', marginBottom: 10 }} />
        <Text style={styles.titulo}>MINHA CONTA</Text>

        {loadingData ? (
          <ActivityIndicator size="large" color="#218080" style={{ marginTop: 50 }} />
        ) : (
          <View style={styles.infoContainer}>
            <Text style={styles.label}>NOME COMPLETO:</Text>
            <TextInput
              style={styles.input}
              value={nome}
              onChangeText={setNome}
              placeholder="Digite seu nome"
              placeholderTextColor="#888"
            />
            <Text style={styles.label}>E-MAIL:</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Digite seu e-mail"
              placeholderTextColor="#888"
              keyboardType="email-address"
              editable={false}
            />
            <Text style={styles.label}>TELEFONE:</Text>
            <TextInput
              style={styles.input}
              value={telefone}
              onChangeText={setTelefone}
              placeholder="Digite seu telefone"
              placeholderTextColor="#888"
              keyboardType="phone-pad"
            />
            <Text style={styles.label}>FOTO DE PERFIL:</Text>
            <TextInput
              style={styles.input}
              value={fotoPerfil}
              onChangeText={setFotoPerfil}
              placeholder="URL da foto de perfil"
              placeholderTextColor="#888"
            />
            <Text style={styles.label}>IDENTIFICAÇÃO DO NEGÓCIO:</Text>
            <TextInput
              style={styles.input}
              value={identificacao}
              onChangeText={setIdentificacao}
              placeholder="Digite a identificação"
              placeholderTextColor="#888"
            />
            <Text style={styles.label}>ALTERAR SENHA</Text>
            <TextInput
              style={styles.input}
              value={senha}
              onChangeText={setSenha}
              placeholder="Digite a nova senha"
              placeholderTextColor="#888"
              secureTextEntry
            />
          </View>
        )}

        <View style={{ width: '100%', alignItems: 'center', marginTop: 18 }}>
          {!loadingData && (
            <TouchableOpacity style={styles.btnSalvar} onPress={handleSave}>
              <Text style={styles.btnSalvarText}>Salvar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#000',
    borderRadius: 16,
    padding: 24,
    width: width * 0.93,
    marginTop: 32,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  titulo: {
    color: '#218080',
    fontWeight: 'bold',
    fontSize: 18,
    alignSelf: 'center',
    marginBottom: 18,
  },
  infoContainer: {
    alignSelf: 'stretch',
    marginTop: 8,
  },
  label: {
    color: '#fff',
    fontSize: 15,
    marginBottom: 6,
    fontWeight: 'bold',
    marginTop: 12,
  },
  input: {
    backgroundColor: '#181818',
    color: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 8,
    marginTop: 2,
    borderWidth: 1,
    borderColor: '#222',
  },
  btnSalvar: {
    backgroundColor: '#218080',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 40,
    marginTop: 10,
  },
  btnSalvarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
}); 