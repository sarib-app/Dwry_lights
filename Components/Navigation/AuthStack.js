import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import RegistrationScreen from '../Auth/RegisterScreen';
import LoginScreen from '../Auth/LoginScreen';
import MainBottomTabs from './BottomNavigation';
import LanguageSelectionScreen from '../LanguageSelector/LanguageSelector';
import ItemManagementScreen from '../Items/ItemManagmentScreen';
import EditItemScreen from '../Items/EditItemScreen';
import AddItemScreen from '../Items/AddItemScreen';
import AddInventoryScreen from '../Inventory/AddInventoryScreen';
import InventoryManagementScreen from '../Inventory/InventoryManagment';
import EditInventoryScreen from '../Inventory/InventroyScreen';
import CustomerManagementScreen from '../CustomerManagment/CustomerManagment';
import AddCustomerScreen from '../CustomerManagment/AddCustomer';
import EditCustomerScreen from '../CustomerManagment/EditCustomer';

const Stack = createStackNavigator();

const AuthStack = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="LanguageSelectionScreen">
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Signup" component={RegistrationScreen} options={{ headerShown: false }} />
        <Stack.Screen name="MainBottomTabs" component={MainBottomTabs} options={{ headerShown: false }} />
        <Stack.Screen name="LanguageSelectionScreen" component={LanguageSelectionScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ItemManagementScreen" component={ItemManagementScreen} options={{ headerShown: false }} />
        <Stack.Screen name="EditItem" component={EditItemScreen} options={{ headerShown: false }} />

        <Stack.Screen name="AddItem" component={AddItemScreen} options={{ headerShown: false }} />
        <Stack.Screen name="AddInventory" component={AddInventoryScreen} options={{ headerShown: false }} />
        <Stack.Screen name="InventoryManagement" component={InventoryManagementScreen} options={{ headerShown: false }} />
        <Stack.Screen name="EditInventory" component={EditInventoryScreen} options={{ headerShown: false }} />


       <Stack.Screen name="CustomerManagement" component={CustomerManagementScreen} options={{ headerShown: false }} />
       <Stack.Screen name="AddCustomer" component={AddCustomerScreen} options={{ headerShown: false }}  /> 
       <Stack.Screen name="EditCustomer" component={EditCustomerScreen} options={{ headerShown: false }} />



   

      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AuthStack;