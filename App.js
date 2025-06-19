import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import RegistrationScreen from './Components/Auth/RegisterScreen';
import AuthStack from './Components/Navigation/AuthStack';

export default function App() {
  return (
    // <View style={styles.container}>
     <AuthStack/>
    // </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
