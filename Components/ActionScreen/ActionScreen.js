import React, { useEffect, useState } from 'react';
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
// import simplePermissions from '../Globals/Store/SimplePermissions';
import simplePermissions from '../Globals/Store/PermissionsDemo';

const { width } = Dimensions.get('window');

const ActionsScreen = ({navigation}) => {
  const translate = (key) => languageService.translate(key);
  const [roleId, setRoleId] = useState(null);
  const [userPermissions, setUserPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Get user role
        const role = await getUserRole();
        setRoleId(role);

        // Fetch user permissions
        const permissions = await simplePermissions.fetchUserPermissions();
        setUserPermissions(permissions);
      } catch (error) {
        console.error('Error initializing data:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  // All action items with their module names
  const allActionItems = [
    // Core Business
    { id: 1, title: 'Items', module: 'items', icon: 'cube', color: '#6B7D3D', category: 'core' },
    { id: 2, title: 'Inventory', module: 'inventory', icon: 'library', color: '#8B5A2B', category: 'core' },
    // { id: 3, title: 'Banks', module: 'banks', icon: 'grid', color: '#4A90E2', category: 'core' },
    // { id: 33, title: 'Pemrissions', module: 'permissions', icon: 'grid', color: '#9B98E2', category: 'core' },

    
    // People Management
    { id: 4, title: 'Customers', module: 'customers', icon: 'people', color: '#E74C3C', category: 'people' },
    { id: 5, title: 'Staff', module: 'staff', icon: 'person-circle', color: '#9B59B6', category: 'people' },
    { id: 15, title: 'User', module: 'user', icon: 'person', color: '#9B59B6', category: 'people' },
    { id: 6, title: 'Suppliers', module: 'suppliers', icon: 'business', color: '#F39C12', category: 'people' },
    
    // Financial
    { id: 7, title: 'Sales Invoice', module: 'sales_invoice', icon: 'receipt', color: '#27AE60', category: 'financial' },
    { id: 8, title: 'Purchase Orders', module: 'purchase_orders', icon: 'document-text', color: '#3498DB', category: 'financial' },
    { id: 9, title: 'Expenses', module: 'expenses', icon: 'card', color: '#E67E22', category: 'financial' },
    { id: 16, title: 'Purchase Invoice', module: 'purchase_invoice', icon: 'receipt', color: '#9B59B6', category: 'financial' },
    { id: 10, title: 'Payments', module: 'payments', icon: 'wallet', color: '#16A085', category: 'financial' },
    
    // Operations
    { id: 11, title: 'Reports', module: 'reports', icon: 'analytics', color: '#34495E', category: 'operations' },
    { id: 12, title: 'Territories', module: 'territories', icon: 'map', color: '#8E44AD', category: 'operations' },
    { id: 13, title: 'Quotations', module: 'quotations', icon: 'document-attach', color: '#2ECC71', category: 'operations' },
    { id: 14, title: 'Returns', module: 'returns', icon: 'return-up-back', color: '#C0392B', category: 'operations' },
  ];

  // Filter action items based on permissions
  const getVisibleActionItems = () => {
    // If not role 3 (admin), show all items
    if (roleId !== 3) {
      return allActionItems;
    }
    // For role 3 (staff), filter by permissions
    return allActionItems.filter(item => {
      // Check if user has module access permission (e.g., "sales_invoice.management")
      return simplePermissions.hasModuleAccess(item.module);
    });
  };

  const actionItems = getVisibleActionItems();

  const allCategories = [
    { key: 'core', title: 'Core Business', icon: 'business' },
    { key: 'people', title: 'People Management', icon: 'people' },
    { key: 'financial', title: 'Financial', icon: 'card' },
    { key: 'operations', title: 'Operations', icon: 'settings' },
  ];

  // Get categories that have visible items
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
        roleId === 3 && styles.staffActionCard
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
              <Text style={styles.staffBadgeText}>Permission Based</Text>
            </View>
          )}
        </View>
        
        <View style={[
          styles.actionsGrid,
          roleId === 3 && styles.staffActionsGrid
        ]}>
          {categoryItems.map(renderActionCard)}
        </View>
      </View>
    );
  };

  // Show loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading permissions...</Text>
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
            <Text style={styles.headerSubtitle}>
              {roleId !== 3 
                ? 'Admin - Full Access to All Modules'
                : actionItems.length > 0 
                  ? `${actionItems.length} modules available` 
                  : 'No permissions assigned'
              }
            </Text>
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
    width: (width - 65) / 2,
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