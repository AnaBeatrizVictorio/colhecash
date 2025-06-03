import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

export const signUp = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    const { token, user } = response.data;
    
    await AsyncStorage.setItem('@ColheCash:token', token);
    await AsyncStorage.setItem('@ColheCash:user', JSON.stringify(user));
    
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erro ao realizar cadastro' };
  }
};

export const signIn = async (email, senha) => {
  try {
    const response = await api.post('/auth/login', { email, senha });
    const { token, user } = response.data;
    
    await AsyncStorage.setItem('@ColheCash:token', token);
    await AsyncStorage.setItem('@ColheCash:user', JSON.stringify(user));
    
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erro ao realizar login' };
  }
};

export const signOut = async () => {
  await AsyncStorage.removeItem('@ColheCash:token');
  await AsyncStorage.removeItem('@ColheCash:user');
};

export const getUser = async () => {
  try {
    const userStr = await AsyncStorage.getItem('@ColheCash:user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    return null;
  }
};

export const getToken = async () => {
  try {
    return await AsyncStorage.getItem('@ColheCash:token');
  } catch (error) {
    return null;
  }
};

export const updateProfile = async (userData) => {
  try {
    const response = await api.put('/auth/profile', userData);
    const { user } = response.data;
    
    await AsyncStorage.setItem('@ColheCash:user', JSON.stringify(user));
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erro ao atualizar perfil' };
  }
};

export const getProfile = async () => {
  try {
    const response = await api.get('/auth/profile');
    const { user } = response.data;
    
    await AsyncStorage.setItem('@ColheCash:user', JSON.stringify(user));
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erro ao buscar perfil' };
  }
}; 