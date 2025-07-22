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
import SupplierManagementScreen from '../SupplierManagment/SupplierManagmentScreen';
import AddSupplierScreen from '../SupplierManagment/AddSupplierScreen';
import EditSupplierScreen from '../SupplierManagment/EditSupplierScreen';
import SalesInvoiceListScreen from '../SalesInvoiceManagment/SalesInvoiceScreen';
import AddSalesInvoiceScreen from '../SalesInvoiceManagment/CreateSalesInvoiceScreen';
import EditSalesInvoiceScreen from '../SalesInvoiceManagment/EditSalesInvoice';
import InvoiceDetailsScreen from '../SalesInvoiceManagment/InvoiceDetailScreen';
import ExpenseListScreen from '../ExpenseManagment/ExpenseScreen';
import AddExpenseScreen from '../ExpenseManagment/AddExpenseScreen';
import EditExpenseScreen from '../ExpenseManagment/EditExpenseScreen';
import ExpenseDetailsScreen from '../ExpenseManagment/ExpenseDetailScreen';
import PurchaseOrderListScreen from '../PurchaseOrder/PurchaseOrderList';
import AddPurchaseOrderScreen from '../PurchaseOrder/AddPurchaseOrderScreen';
import PurchaseOrderDetailsScreen from '../PurchaseOrder/PurchaseOrderDetailsScreen';
import EditPurchaseOrderScreen from '../PurchaseOrder/EditPurchaseOrder';
import PaymentEntryListScreen from '../PaymentEntry/PaymentEntry';
import AddPaymentEntryScreen from '../PaymentEntry/AddPaymentEntry';
import PaymentEntryDetailsScreen from '../PaymentEntry/PaymentEntryDetail';
import EditPaymentEntryScreen from '../PaymentEntry/EditPaymentEntry';
import BankListScreen from '../BankListScreen/BankListScreen';
import SalesReportScreen from '../Reports/SalesReport';
import SalesReportFiltersScreen from '../Reports/SalesFilterModal';
import CustomerSelectorScreen from '../ModalList/CustomerList';
import StaffSelectorScreen from '../ModalList/StaffListScreen';
import CustomerReportScreen from '../Reports/CustomerReport';
// import InventoryReportFiltersScreen from '../Reports/InventoryReport';
import InventoryReportScreen from '../Reports/InventoryReport';
import InventoryReportFiltersScreen from '../Reports/InventoryFilter';
import FinancialSummaryScreen from '../Reports/FinancialReport';
import FinancialSummaryFiltersScreen from '../Reports/FinancialFilter';

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

<Stack.Screen name="SupplierManagement" component={SupplierManagementScreen} options={{ headerShown: false }} />
<Stack.Screen name="AddSupplier" component={AddSupplierScreen} options={{ headerShown: false }} />
<Stack.Screen name="EditSupplier" component={EditSupplierScreen} options={{ headerShown: false }} />

<Stack.Screen name="SalesInvoiceList" component={SalesInvoiceListScreen} options={{ headerShown: false }} />
<Stack.Screen name="AddSalesInvoice" component={AddSalesInvoiceScreen} options={{ headerShown: false }} />
<Stack.Screen name="EditSalesInvoice" component={EditSalesInvoiceScreen} options={{ headerShown: false }} />
<Stack.Screen name="InvoiceDetails" component={InvoiceDetailsScreen} options={{ headerShown: false }} />




<Stack.Screen name="ExpenseList" component={ExpenseListScreen} options={{ headerShown: false }} />
<Stack.Screen name="AddExpense" component={AddExpenseScreen} options={{ headerShown: false }} />
<Stack.Screen name="EditExpense" component={EditExpenseScreen} options={{ headerShown: false }} />
<Stack.Screen name="ExpenseDetails" component={ExpenseDetailsScreen} options={{ headerShown: false }} />


<Stack.Screen name="PurchaseOrderListScreen" component={PurchaseOrderListScreen} options={{ headerShown: false }} />
<Stack.Screen name="AddPurchaseOrder" component={AddPurchaseOrderScreen} options={{ headerShown: false }} />
<Stack.Screen name="PurchaseOrderDetails" component={PurchaseOrderDetailsScreen} options={{ headerShown: false }} />
<Stack.Screen name="EditPurchaseOrder" component={EditPurchaseOrderScreen} options={{ headerShown: false }} />


<Stack.Screen name="PaymentEntryListScreen" component={PaymentEntryListScreen} options={{ headerShown: false }} />
<Stack.Screen name="AddPaymentEntry" component={AddPaymentEntryScreen} options={{ headerShown: false }} />
<Stack.Screen name="PaymentEntryDetails" component={PaymentEntryDetailsScreen} options={{ headerShown: false }} />
<Stack.Screen name="EditPaymentEntry" component={EditPaymentEntryScreen} options={{ headerShown: false }} />


<Stack.Screen name="BankListScreen" component={BankListScreen} options={{ headerShown: false }} />

<Stack.Screen name="salesReport" component={SalesReportScreen} options={{ headerShown: false }} />
<Stack.Screen name="SalesReportFilters" component={SalesReportFiltersScreen} options={{ headerShown: false }} />
<Stack.Screen name="CustomerSelectorScreen" component={CustomerSelectorScreen} options={{ headerShown: false }} />

<Stack.Screen name="StaffSelectorScreen" component={StaffSelectorScreen} options={{ headerShown: false }} />
<Stack.Screen name="customerReport" component={CustomerReportScreen} options={{ headerShown: false }} />
<Stack.Screen name="inventoryStats" component={InventoryReportScreen} options={{ headerShown: false }} />
<Stack.Screen name="InventoryReportFilters" component={InventoryReportFiltersScreen} options={{ headerShown: false }} />


<Stack.Screen name="financialSummary" component={FinancialSummaryScreen} options={{ headerShown: false }} />
<Stack.Screen name="FinancialSummaryFilters" component={FinancialSummaryFiltersScreen} options={{ headerShown: false }} />






      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AuthStack;