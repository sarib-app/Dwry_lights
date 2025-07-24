import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import languageService from '../Globals/Store/Lang';
import getUserRole from '../Globals/Store/GetRoleId';

const { width } = Dimensions.get('window');
  // import getUserRole from './getUserRole';

const ActionsScreen = ({navigation}) => {
  const translate = (key) => languageService.translate(key);

// Use anywhere in your app
const [roleId, setRoleId] = React.useState(null);
useEffect(() => {
  
// Example usage
const checkUserRole = async () => {
  const role = await getUserRole();
  setRoleId(role);
};

checkUserRole();

},[])

  const actionItems = [
    // Core Business
    { id: 1, title: 'Items', icon: 'cube', color: '#6B7D3D', category: 'core' },
    { id: 2, title: 'Inventory', icon: 'library', color: '#8B5A2B', category: 'core' },
    { id: 3, title: 'Banks', icon: 'grid', color: '#4A90E2', category: 'core' },
    
    // People Management
    { id: 4, title: 'Customers', icon: 'people', color: '#E74C3C', category: 'people' },
    { id: 5, title: 'Staff', icon: 'person-circle', color: '#9B59B6', category: 'people' },
    { id: 15, title: 'User', icon: 'person', color: '#9B59B6', category: 'people' },
    { id: 6, title: 'Suppliers', icon: 'business', color: '#F39C12', category: 'people' },
    
    // Financial
    { id: 7, title: 'Sales Invoice', icon: 'receipt', color: '#27AE60', category: 'financial' },
    { id: 8, title: 'Purchase Orders', icon: 'document-text', color: '#3498DB', category: 'financial' },
    { id: 9, title: 'Expenses', icon: 'card', color: '#E67E22', category: 'financial' },
    { id: 10, title: 'Payments', icon: 'wallet', color: '#16A085', category: 'financial' },
    
    // Operations
    { id: 11, title: 'Reports', icon: 'analytics', color: '#34495E', category: 'operations' },
    { id: 12, title: 'Territories', icon: 'map', color: '#8E44AD', category: 'operations' },
    { id: 13, title: 'Quotations', icon: 'document-attach', color: '#2ECC71', category: 'operations' },
    { id: 14, title: 'Returns', icon: 'return-up-back', color: '#C0392B', category: 'operations' },
  ];

  const categories = [
    { key: 'core', title: 'Core Business', icon: 'business' },
    { key: 'people', title: 'People Management', icon: 'people' },
    { key: 'financial', title: 'Financial', icon: 'card' },
    { key: 'operations', title: 'Operations', icon: 'settings' },
  ];

  const handleActionPress = (actionTitle) => {
    // In handleActionPress function, add:
if (actionTitle === 'Inventory') {
  navigation.navigate('InventoryManagement');
} else if (actionTitle === 'Items') {
  navigation.navigate('ItemManagementScreen');
}
 else if (actionTitle === 'Customers') {
  navigation.navigate('CustomerManagement');
}
 else if (actionTitle === 'Suppliers') {
  navigation.navigate('SupplierManagement');
}
else if (actionTitle === 'Sales Invoice') {
  navigation.navigate('SalesInvoiceList');
}
else if(actionTitle === 'Expenses'){
  navigation.navigate('ExpenseList');
}
else if(actionTitle === 'Purchase Orders'){
  navigation.navigate('PurchaseOrderListScreen');
}
else if(actionTitle === 'Payments'){
  navigation.navigate('PaymentEntryListScreen');
}
else if(actionTitle === 'Banks'){
  navigation.navigate('BankListScreen');
}
else if(actionTitle === 'Staff'){
  navigation.navigate('Staffmanagment');
}

else if(actionTitle === 'User'){
  navigation.navigate('UserManagementScreen');
}
else {
    Alert.alert(
      actionTitle,
      'Coming Soon!',
      [{ text: 'OK', style: 'default' }]
    );
  }
  };

  const renderActionCard = (item) => (
    <TouchableOpacity
      key={item.id}
      style={styles.actionCard}
      onPress={() => handleActionPress(item.title)}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={[item.color, `${item.color}90`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradient}
      >
        <View style={styles.cardContent}>
          <View style={styles.iconContainer}>
            <Ionicons name={item.icon} size={28} color="#fff" />
          </View>
          <Text style={styles.cardTitle}>{translate(item.title.toLowerCase())}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderCategory = (category) => {
    const categoryItems = actionItems.filter(item => item.category === category.key);
    
    return (
      <View key={category.key} style={styles.categorySection}>
        <View style={styles.categoryHeader}>
          <Ionicons name={category.icon} size={20} color="#6B7D3D" />
          <Text style={styles.categoryTitle}>{translate(category.title.toLowerCase().replace(' ', ''))}</Text>
        </View>
        
        <View style={styles.actionsGrid}>
          {categoryItems.map(renderActionCard)}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={['#6B7D3D', '#4A5D23']}
          style={styles.headerGradient}
        >
          <Text style={styles.headerTitle}>{translate('actions')}</Text>
          <Text style={styles.headerSubtitle}>Manage your business operations</Text>
        </LinearGradient>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map(renderCategory)}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafb',
  },
  header: {
    marginBottom: 20,
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingVertical: 25,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  categorySection: {
    marginBottom: 30,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: (width - 50) / 2,
    height: 120,
    marginBottom: 15,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardGradient: {
    flex: 1,
    borderRadius: 16,
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
});

export default ActionsScreen;