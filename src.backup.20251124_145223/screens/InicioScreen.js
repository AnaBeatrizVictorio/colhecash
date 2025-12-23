import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

export default function InicioScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.logoArea}>
          <MaterialCommunityIcons name="leaf" size={48} color="#1ed760" style={{ marginRight: 10 }} />
          <View style={styles.logoColhe}>
            <Text style={styles.colheText}>Colhe</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <FontAwesome5 name="dollar-sign" size={32} color="#1ed760" style={{ marginRight: 4 }} />
              <Text style={styles.cashText}>cash</Text>
            </View>
            <Text style={styles.slogan}>Organize suas finanças na feira e no campo</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.btnComece} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.btnComeceText}>COMECE JÁ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#000',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0,
    overflow: 'hidden',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  logoArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 60,
    marginTop: -40,
  },
  logoColhe: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  colheText: {
    color: '#1ed760',
    fontSize: 44,
    fontWeight: 'bold',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  cashText: {
    color: '#3b8c8c',
    fontSize: 38,
    fontWeight: 'bold',
    letterSpacing: 2,
    textTransform: 'lowercase',
  },
  slogan: {
    color: '#d9d9d9',
    fontSize: 16,
    marginTop: 18,
    textAlign: 'center',
    fontStyle: 'italic',
    maxWidth: 260,
  },
  btnComece: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 30,
    paddingVertical: 10,
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    elevation: 2,
  },
  btnComeceText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
}); 