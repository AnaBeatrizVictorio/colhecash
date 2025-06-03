import "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import CadastroScreen from "./src/screens/CadastroScreen";
import LoginScreen from "./src/screens/LoginScreen";
import InicioScreen from "./src/screens/InicioScreen";
import HomeScreen from "./src/screens/HomeScreen";
import ConfiguracoesScreen from "./src/screens/ConfiguracoesScreen";
import RegistrarVendaScreen from "./src/screens/RegistrarVendaScreen";
import RegistrarDespesaScreen from "./src/screens/RegistrarDespesaScreen";
import DicasFinanceirasScreen from "./src/screens/DicasFinanceirasScreen";
import MinhaContaScreen from "./src/screens/MinhaContaScreen";
import ControleDeGastosScreen from "./src/screens/ControleDeGastosScreen";
import RelatoriosScreen from "./src/screens/RelatoriosScreen";
import AlertasENotificacoesScreen from "./src/screens/AlertasENotificacoes";
import ResumoFinanceiroScreen from "./src/screens/ResumoFinanceiroScreen";

const Stack = createStackNavigator(); 

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
        initialRouteName="Inicio"
      >
        <Stack.Screen name="Inicio" component={InicioScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Cadastro" component={CadastroScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Configuracoes" component={ConfiguracoesScreen} />
        <Stack.Screen name="RegistrarVenda" component={RegistrarVendaScreen} />
        <Stack.Screen name="RegistrarDespesa" component={RegistrarDespesaScreen} />
        <Stack.Screen name="DicasFinanceiras" component={DicasFinanceirasScreen} />
        <Stack.Screen name="MinhaConta" component={MinhaContaScreen} />
        <Stack.Screen name="ControleDeGastos" component={ControleDeGastosScreen} />
        <Stack.Screen name="Relatorios" component={RelatoriosScreen} />
        <Stack.Screen name="AlertasENotificacoes" component={AlertasENotificacoesScreen} />
      
        <Stack.Screen name="ResumoFinanceiro" component={ResumoFinanceiroScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
