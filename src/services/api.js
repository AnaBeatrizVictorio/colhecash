import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Determina a URL base baseado na plataforma
const getBaseURL = () => {
  if (Platform.OS === 'android') {
    // Para emuladores Android, 10.0.2.2 geralmente funciona para acessar o localhost da máquina host.
    return 'http://10.0.2.2:3001/api';
  } else if (Platform.OS === 'ios') {
    // Para simuladores iOS ou dispositivos físicos, use o IP da sua máquina na rede local.
    // SUBSTITUA 'SEU_ENDERECO_IP' PELO ENDEREÇO IPv4 DO SEU COMPUTADOR.
    return 'http://192.168.0.102:3001/api'; // iOS Simulator
  } else {
    // Para dispositivos físicos em outras plataformas ou emuladores que não usem 10.0.2.2.
    // SUBSTITUA 'SEU_ENDERECO_IP' PELO ENDEREÇO IPv4 DO SEU COMPUTADOR.
    return 'http://SEU_ENDERECO_IP:3001/api'; // Dispositivo físico genérico
  }
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar o token em todas as requisições
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('@ColheCash:token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api; 