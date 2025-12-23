import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { ActivityIndicator, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import InicioScreen from "../screens/InicioScreen";
import LoginScreen from "../screens/LoginScreen";
import CadastroScreen from "../screens/CadastroScreen";
import HomeScreen from "../screens/HomeScreen";
import ResumoFinanceiroScreen from "../screens/ResumoFinanceiroScreen";
import RegistrarVendaScreen from "../screens/RegistrarVendaScreen";
import RegistrarDespesaScreen from "../screens/RegistrarDespesaScreen";
import ControleDeGastosScreen from "../screens/ControleDeGastosScreen";
import RelatoriosScreen from "../screens/RelatoriosScreen";
import DicasFinanceirasScreen from "../screens/DicasFinanceirasScreen";
import AlertasENotificacoesScreen from "../screens/AlertasENotificacoes";
import ConfiguracoesScreen from "../screens/ConfiguracoesScreen";
import MinhaContaScreen from "../screens/MinhaContaScreen";
import AssistenteIAScreen from "../screens/AssistenteIAScreen";
import PerfilScreen from "../screens/PerfilScreen";
import CalculadoraPrecoScreen from "../screens/CalculadoraPrecoScreen";
import GraficosScreen from "../screens/GraficosScreen";

const Stack = createStackNavigator();

export default function AppNavigator() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem("@ColheCash:token");
      console.log(
        "🔍 Verificando autenticação:",
        token ? "Token encontrado" : "Sem token"
      );
      setIsAuthenticated(!!token);
    } catch (error) {
      console.error("❌ Erro ao verificar autenticação:", error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#000",
        }}
      >
        <ActivityIndicator size="large" color="#00ff00" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={isAuthenticated ? "Home" : "Inicio"}
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: "#000" },
        }}
      >
        {/* Telas públicas (sem autenticação) */}
        <Stack.Screen name="Inicio" component={InicioScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Cadastro" component={CadastroScreen} />

        {/* Telas privadas (com autenticação) */}
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen
          name="ResumoFinanceiro"
          component={ResumoFinanceiroScreen}
        />
        <Stack.Screen name="RegistrarVenda" component={RegistrarVendaScreen} />
        <Stack.Screen
          name="RegistrarDespesa"
          component={RegistrarDespesaScreen}
        />
        <Stack.Screen
          name="ControleDeGastos"
          component={ControleDeGastosScreen}
        />
        <Stack.Screen name="Relatorios" component={RelatoriosScreen} />
        <Stack.Screen
          name="DicasFinanceiras"
          component={DicasFinanceirasScreen}
        />
        <Stack.Screen
          name="AlertasENotificacoes"
          component={AlertasENotificacoesScreen}
        />
        <Stack.Screen name="Configuracoes" component={ConfiguracoesScreen} />
        <Stack.Screen name="MinhaConta" component={MinhaContaScreen} />
        <Stack.Screen name="AssistenteIA" component={AssistenteIAScreen} />
        <Stack.Screen
          name="Perfil"
          component={PerfilScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CalculadoraPreco"
          component={CalculadoraPrecoScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Graficos"
          component={GraficosScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
