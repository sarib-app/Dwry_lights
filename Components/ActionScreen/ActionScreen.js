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
  }, [])

  // All action items
  const allActionItems = [
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
    { id: 16, title: 'Purchase Invoice', icon: 'receipt', color: '#9B59B6', category: 'financial' },
    { id: 10, title: 'Payments', icon: 'wallet', color: '#16A085', category: 'financial' },
    
    // Operations
    { id: 11, title: 'Reports', icon: 'analytics', color: '#34495E', category: 'operations' },
    { id: 12, title: 'Territories', icon: 'map', color: '#8E44AD', category: 'operations' },
    { id: 13, title: 'Quotations', icon: 'document-attach', color: '#2ECC71', category: 'operations' },
    { id: 14, title: 'Returns', icon: 'return-up-back', color: '#C0392B', category: 'operations' },
  ];

  // Staff-only action items (role ID 3)
  const staffActionItems = [
    { id: 1, title: 'Items', icon: 'cube', color: '#6B7D3D', category: 'core' },
    { id: 7, title: 'Sales Invoice', icon: 'receipt', color: '#27AE60', category: 'financial' },
    { id: 16, title: 'Purchase Invoice', icon: 'receipt', color: '#9B59B6', category: 'financial' },
  ];

  // Get action items based on role
  const getActionItemsForRole = () => {
    if (roleId === 3) {
      return staffActionItems;
    }
    return allActionItems;
  };

  const actionItems = getActionItemsForRole();

  const allCategories = [
    { key: 'core', title: 'Core Business', icon: 'business' },
    { key: 'people', title: 'People Management', icon: 'people' },
    { key: 'financial', title: 'Financial', icon: 'card' },
    { key: 'operations', title: 'Operations', icon: 'settings' },
  ];

  // Get categories that have items for current role
  const getVisibleCategories = () => {
    const visibleCategories = [];
    
    allCategories.forEach(category => {
      const hasItems = actionItems.some(item => item.category === category.key);
      if (hasItems) {
        visibleCategories.push(category);
      }
    });
    
    return visibleCategories;
  };

  const categories = getVisibleCategories();

  const handleActionPress = (actionTitle) => {
    // In handleActionPress function, add:
    if (actionTitle === 'Inventory') {
      navigation.navigate('InventoryManagement');
    } else if (actionTitle === 'Items') {
      navigation.navigate('ItemManagementScreen');
    } else if (actionTitle === 'Customers') {
      navigation.navigate('CustomerManagement');
    } else if (actionTitle === 'Suppliers') {
      navigation.navigate('SupplierManagement');
    } else if (actionTitle === 'Sales Invoice') {
      navigation.navigate('SalesInvoiceList');
    } else if(actionTitle === 'Expenses'){
      navigation.navigate('ExpenseList');
    } else if(actionTitle === 'Purchase Orders'){
      navigation.navigate('PurchaseOrderListScreen');
    } else if(actionTitle === 'Payments'){
      navigation.navigate('PaymentEntryListScreen');
    } else if(actionTitle === 'Banks'){
      navigation.navigate('BankListScreen');
    } else if(actionTitle === 'Staff'){
      navigation.navigate('Staffmanagment');
    } else if(actionTitle === 'User'){
      navigation.navigate('UserManagementScreen');
    } else if(actionTitle === 'Purchase Invoice'){
      navigation.navigate('PurchaseInvoiceListScreen');
    } else {
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
      style={[
        styles.actionCard,
        roleId === 3 && styles.staffActionCard // Special styling for staff
      ]}
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
    
    // Don't render category if no items
    if (categoryItems.length === 0) {
      return null;
    }
    
    return (
      <View key={category.key} style={styles.categorySection}>
        <View style={styles.categoryHeader}>
          <Ionicons name={category.icon} size={20} color="#6B7D3D" />
          <Text style={styles.categoryTitle}>
            {translate(category.title.toLowerCase().replace(' ', ''))}
          </Text>
          {roleId === 3 && (
            <View style={styles.staffBadge}>
              <Text style={styles.staffBadgeText}>Staff Access</Text>
            </View>
          )}
        </View>
        
        <View style={[
          styles.actionsGrid,
          roleId === 3 && styles.staffActionsGrid // Center items for staff
        ]}>
          {categoryItems.map(renderActionCard)}
        </View>
      </View>
    );
  };

  // Get header subtitle based on role
  const getHeaderSubtitle = () => {
    if (roleId === 3) {
      return 'Staff Dashboard - Limited Access';
    }
    return 'Manage your business operations';
  };

  // Show loading state if role is not determined yet
  if (roleId === null) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={roleId === 3 ? ['#9B59B6', '#8E44AD'] : ['#6B7D3D', '#4A5D23']}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>{translate('actions')}</Text>
            <Text style={styles.headerSubtitle}>{getHeaderSubtitle()}</Text>
            {roleId === 3 && (
              <View style={styles.roleIndicator}>
                <Ionicons name="person-circle" size={16} color="#fff" />
                <Text style={styles.roleText}>Staff Member</Text>
              </View>
            )}
          </View>
        </LinearGradient>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.length > 0 ? (
          categories.map(renderCategory)
        ) : (
          <View style={styles.noAccessContainer}>
            <Ionicons name="lock-closed" size={64} color="#ccc" />
            <Text style={styles.noAccessText}>No actions available</Text>
            <Text style={styles.noAccessSubtext}>
              Contact your administrator for access
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    marginBottom: 20,
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingVertical: 25,
    paddingTop: 40,
  },
  headerContent: {
    // Additional styling for header content
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
    marginBottom: 8,
  },
  roleIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  roleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
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
    flex: 1,
  },
  staffBadge: {
    backgroundColor: '#9B59B6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  staffBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  staffActionsGrid: {
    justifyContent: 'flex-start',
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
  staffActionCard: {
    width: (width - 65) / 2, // Slightly smaller for staff
    marginHorizontal: 5,
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
  noAccessContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  noAccessText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 20,
    marginBottom: 8,
  },
  noAccessSubtext: {
    fontSize: 14,
    color: '#bbb',
    textAlign: 'center',
  },
});

export default ActionsScreen;