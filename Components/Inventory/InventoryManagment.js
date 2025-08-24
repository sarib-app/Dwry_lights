import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import languageService from '../Globals/Store/Lang';
import getUserRole from '../Globals/Store/GetRoleId';
// import simplePermissions from '../Globals/Store/SimplePermissions';
import simplePermissions from '../Globals/Store/PermissionsDemo';

const API_BASE_URL = 'https://planetdory.dwrylight.com/api';

const InventoryManagementScreen = ({ navigation }) => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [roleId, setRoleId] = useState(null);
  const [userPermissions, setUserPermissions] = useState([]);
  
  const translate = (key) => languageService.translate(key);

  // Initialize permissions and role
  useEffect(() => {
    const initializePermissions = async () => {
      try {
        // Get user role
        const role = await getUserRole();
        setRoleId(role);

        // Fetch user permissions if not admin
        if (role === 3) {
          const permissions = await simplePermissions.fetchUserPermissions();
          setUserPermissions(permissions);
        }
      } catch (error) {
        console.error('Error initializing permissions:', error);
      }
    };

    initializePermissions();
    fetchInventory();
  }, []);

  // Permission check functions
  const hasInventoryPermission = (type) => {
    // If admin (not role 3), allow everything
    if (roleId !== 3) {
      return true;
    }
    
    // For staff (role 3), check specific permissions
    const permissionName = `inventory.${type}`;
    return userPermissions.some(permission => 
      permission.name === permissionName && permission.module === 'inventory'
    );
  };

  const canCreateInventory = () => hasInventoryPermission('create');
  const canEditInventory = () => hasInventoryPermission('edit');
  const canDeleteInventory = () => hasInventoryPermission('delete');
  const canViewInventory = () => hasInventoryPermission('view') || hasInventoryPermission('management');

  // Get auth token from AsyncStorage
  const getAuthToken = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        setAuthToken(`Bearer ${token}`);
        return `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return null;
  };

  // Fetch all inventory
  const fetchInventory = async () => {
    try {
      const token = await getAuthToken();
      if (!token) {
        Alert.alert('Error', 'Authentication token not found');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/fetch_all_inventory`, {
        method: 'GET',
        headers: {
          'Authorization': token,
        },
      });
      
      const result = await response.json();
      console.log('Inventory API Response:', result);
      
      if (result.status == 200) {
        setInventory(result.data.data || []);
      } else {
        Alert.alert('Error', result.message || 'Failed to fetch inventory');
      }
    } catch (error) {
      console.error('Fetch inventory error:', error);
      Alert.alert('Error', 'Network error while fetching inventory');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Delete inventory item
  const deleteInventory = async (inventoryId) => {
    // Check delete permission
    if (!canDeleteInventory()) {
      Alert.alert('Access Denied', 'You do not have permission to delete inventory');
      return;
    }

    Alert.alert(
      'Delete Inventory',
      'Are you sure you want to delete this inventory item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await getAuthToken();
              if (!token) return;

              const response = await fetch(`${API_BASE_URL}/delete_inventory_by_id/${inventoryId}`, {
                method: 'POST',
                headers: {
                  'Authorization': token,
                },
              });
              
              const result = await response.json();
              
              if (result.status == 200) {
                Alert.alert('Success', 'Inventory deleted successfully');
                fetchInventory(); // Refresh the list
              } else {
                Alert.alert('Error', result.message || 'Failed to delete inventory');
              }
            } catch (error) {
              console.error('Delete inventory error:', error);
              Alert.alert('Error', 'Network error while deleting inventory');
            }
          },
        },
      ]
    );
  };

  // Handle edit inventory
  const handleEditInventory = (item) => {
    if (!canEditInventory()) {
      Alert.alert('Access Denied', 'You do not have permission to edit inventory');
      return;
    }
    navigation.navigate('EditInventory', { inventory: item });
  };

  // Handle add inventory
  const handleAddInventory = () => {
    if (!canCreateInventory()) {
      Alert.alert('Access Denied', 'You do not have permission to create inventory');
      return;
    }
    navigation.navigate('AddInventory');
  };

  // Filter inventory based on search query
  const filteredInventory = inventory.filter(item =>
    item.item_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.vendor?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchInventory();
  }, []);

  // Calculate totals for display
  const calculateTotals = () => {
    return inventory.reduce((totals, item) => {
      totals.totalQuantity += parseInt(item.quantity) || 0;
      totals.totalValue += parseFloat(item.total) || 0;
      return totals;
    }, { totalQuantity: 0, totalValue: 0 });
  };

  const totals = calculateTotals();

  // Render inventory card
  const renderInventoryCard = (item) => (
    <View key={item.id} style={styles.inventoryCard}>
      <View style={styles.inventoryHeader}>
        <View style={styles.inventoryInfo}>
          <Text style={styles.itemName}>{item.item_name}</Text>
          {item.vendor && <Text style={styles.vendor}>Vendor: {item.vendor}</Text>}
        </View>
        <View style={styles.inventoryActions}>
          {canEditInventory() && (
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() => handleEditInventory(item)}
            >
              <Ionicons name="pencil" size={16} color="#6B7D3D" />
            </TouchableOpacity>
          )}
          {canDeleteInventory() && (
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => deleteInventory(item.id)}
            >
              <Ionicons name="trash" size={16} color="#E74C3C" />
            </TouchableOpacity>
          )}
          {!canEditInventory() && !canDeleteInventory() && canViewInventory() && (
            <TouchableOpacity
              style={[styles.actionButton, styles.viewButton]}
              onPress={() => {/* Handle view inventory details */}}
            >
              <Ionicons name="eye" size={16} color="#3498DB" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.inventoryDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="cube" size={16} color="#666" />
          <Text style={styles.detailText}>Qty: {item.quantity || 0}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="cash" size={16} color="#666" />
          <Text style={styles.detailText}>Cost: ${item.cost || 0}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="receipt" size={16} color="#666" />
          <Text style={styles.detailText}>Total: ${item.total || 0}</Text>
        </View>
      </View>

      <View style={styles.inventoryMeta}>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>VAT:</Text>
          <Text style={styles.metaValue}>${item.vat || 0}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Subtotal:</Text>
          <Text style={styles.metaValue}>${item.subtotal || 0}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Shipment:</Text>
          <Text style={styles.metaValue}>${item.shipment_cost || 0}</Text>
        </View>
        {item.is_paid !== undefined && (
          <View style={styles.paymentStatus}>
            <Ionicons 
              name={item.is_paid ? "checkmark-circle" : "time"} 
              size={16} 
              color={item.is_paid ? "#27AE60" : "#F39C12"} 
            />
            <Text style={[styles.paymentText, { color: item.is_paid ? "#27AE60" : "#F39C12" }]}>
              {item.is_paid ? 'Paid' : 'Pending'}
            </Text>
          </View>
        )}
      </View>

      {item.description && (
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
      )}
    </View>
  );

  // Show loading if permissions not loaded yet
  if (loading || roleId === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B7D3D" />
        <Text style={styles.loadingText}>Loading inventory...</Text>
      </View>
    );
  }

  // Check if user has access to view inventory at all
  if (!canViewInventory()) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.noAccessContainer}>
          <Ionicons name="lock-closed" size={64} color="#ccc" />
          <Text style={styles.noAccessText}>Access Denied</Text>
          <Text style={styles.noAccessSubtext}>
            You do not have permission to view inventory
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <LinearGradient colors={['#6B7D3D', '#4A5D23']} style={styles.headerGradient}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.headerBackButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Inventory Management</Text>
              <Text style={styles.headerSubtitle}>
                {inventory.length} items • Total Value: ${totals.totalValue.toFixed(2)}
                {roleId === 3 && (
                  <Text style={styles.permissionIndicator}> • Permission Based</Text>
                )}
              </Text>
            </View>
            {canCreateInventory() && (
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddInventory}
              >
                <Ionicons name="add" size={24} color="#fff" />
              </TouchableOpacity>
            )}
            {!canCreateInventory() && (
              <View style={styles.addButtonPlaceholder} />
            )}
          </View>
        </LinearGradient>
      </View>

      {/* Permission Info Bar */}
      {roleId === 3 && (
        <View style={styles.permissionBar}>
          <View style={styles.permissionInfo}>
            <Ionicons name="information-circle" size={16} color="#6B7D3D" />
            <Text style={styles.permissionText}>
              Your permissions: 
              {canViewInventory() && ' View'}
              {canCreateInventory() && ' • Create'}
              {canEditInventory() && ' • Edit'}
              {canDeleteInventory() && ' • Delete'}
            </Text>
          </View>
        </View>
      )}

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="cube" size={24} color="#6B7D3D" />
          <Text style={styles.statNumber}>{totals.totalQuantity}</Text>
          <Text style={styles.statLabel}>Total Quantity</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="cash" size={24} color="#E74C3C" />
          <Text style={styles.statNumber}>${totals.totalValue.toFixed(0)}</Text>
          <Text style={styles.statLabel}>Total Value</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="library" size={24} color="#3498DB" />
          <Text style={styles.statNumber}>{inventory.length}</Text>
          <Text style={styles.statLabel}>Inventory Items</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search inventory..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Inventory List */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6B7D3D']} />
        }
      >
        {filteredInventory.length > 0 ? (
          filteredInventory.map(renderInventoryCard)
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="library-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>
              {searchQuery ? 'No inventory found' : 'No inventory available'}
            </Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? 'Try adjusting your search' : 'Add your first inventory item to get started'}
            </Text>
            {!searchQuery && canCreateInventory() && (
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={handleAddInventory}
              >
                <Text style={styles.emptyButtonText}>Add Inventory</Text>
              </TouchableOpacity>
            )}
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
    backgroundColor: '#f8fafb',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  noAccessContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  noAccessText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#999',
    marginTop: 20,
    marginBottom: 10,
  },
  noAccessSubtext: {
    fontSize: 16,
    color: '#bbb',
    textAlign: 'center',
    marginBottom: 30,
  },
  header: {
    marginBottom: 0,
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
    textAlign: 'center',
  },
  permissionIndicator: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonPlaceholder: {
    width: 40,
    height: 40,
  },
  permissionBar: {
    backgroundColor: 'rgba(107, 125, 61, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  permissionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  permissionText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#6B7D3D',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    textAlign: 'center',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafb',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  inventoryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  inventoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  inventoryInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  vendor: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  inventoryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: 'rgba(107, 125, 61, 0.1)',
  },
  deleteButton: {
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
  },
  viewButton: {
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
  },
  inventoryDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  inventoryMeta: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 15,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  metaLabel: {
    fontSize: 14,
    color: '#666',
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  paymentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  paymentText: {
    marginLeft: 5,
    fontSize: 14,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
    textAlign: 'center',
    marginBottom: 30,
  },
  emptyButton: {
    backgroundColor: '#6B7D3D',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: '#6B7D3D',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default InventoryManagementScreen;