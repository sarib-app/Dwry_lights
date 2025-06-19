import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import RegistrationScreen from '../Auth/RegisterScreen';
import LoginScreen from '../Auth/LoginScreen';

const Stack = createStackNavigator();

const AuthStack = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Signup" component={RegistrationScreen} options={{ headerShown: false }} />
   

      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AuthStack;