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
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import languageService from '../Globals/Store/Lang';
import AsyncStorage from '@react-native-async-storage/async-storage';
import getAuthToken from '../Globals/Store/LocalData';
import getUserRole from '../Globals/Store/GetRoleId';
import simplePermissions from '../Globals/Store/PermissionsDemo';
// import simplePermissions from '../Globals/Store/SimplePermissions';

const API_BASE_URL = 'https://planetdory.dwrylight.com/api';

const ItemManagementScreen = ({ navigation }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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
    fetchItems();
  }, []);

  // Permission check functions
  const hasItemPermission = (type) => {
    // If admin (not role 3), allow everything
    if (roleId !== 3) {
      return true;
    }
    
    // For staff (role 3), check specific permissions
    const permissionName = `items.${type}`;
    return userPermissions.some(permission => 
      permission.name === permissionName && permission.module === 'items'
    );
  };

  const canCreateItems = () => hasItemPermission('create');
  const canEditItems = () => hasItemPermission('edit');
  const canDeleteItems = () => hasItemPermission('delete');
  const canViewItems = () => hasItemPermission('view') || hasItemPermission('management');

  // Fetch all items
  const fetchItems = async () => {
    const token = await getAuthToken();
    if (token) {
      try {
        const response = await fetch(`${API_BASE_URL}/fetch_all_items`, {
          method: 'GET',
          headers: {
            'Authorization': token,
          },
        });
        
        const result = await response.json();
        console.log('Items API Response:', result);
        
        if (result.status == 200) {
          setItems(result.data || []);
        } else {
          Alert.alert('Error', result.message || 'Failed to fetch items');
        }
      } catch (error) {
        console.error('Fetch items error:', error);
        Alert.alert('Error', 'Network error while fetching items');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    }
  };

  // Delete item
  const deleteItem = async (itemId) => {
    // Check delete permission
    if (!canDeleteItems()) {
      Alert.alert('Access Denied', 'You do not have permission to delete items');
      return;
    }

    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await getAuthToken();
              const response = await fetch(`${API_BASE_URL}/destroy_item_by_id/${itemId}`, {
                method: 'POST',
                headers: {
                  'Authorization': token,
                },
              });
              
              const result = await response.json();
              
              if (result.status == 200) {
                Alert.alert('Success', 'Item deleted successfully');
                fetchItems(); // Refresh the list
              } else {
                Alert.alert('Error', result.message || 'Failed to delete item');
              }
            } catch (error) {
              console.error('Delete item error:', error);
              Alert.alert('Error', 'Network error while deleting item');
            }
          },
        },
      ]
    );
  };

  // Handle edit item
  const handleEditItem = (item) => {
    if (!canEditItems()) {
      Alert.alert('Access Denied', 'You do not have permission to edit items');
      return;
    }
    navigation.navigate('EditItem', { item });
  };

  // Handle add item
  const handleAddItem = () => {
    if (!canCreateItems()) {
      Alert.alert('Access Denied', 'You do not have permission to create items');
      return;
    }
    navigation.navigate('AddItem');
  };

  // Filter items based on search query
  const filteredItems = items.filter(item =>
    item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.name_ar?.includes(searchQuery) ||
    item.item_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchItems();
  }, []);

  // Render item card
  const renderItemCard = (item) => (
    <View key={item.id} style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.name}</Text>
          {item.name_ar && <Text style={styles.itemNameAr}>{item.name_ar}</Text>}
        </View>
        <View style={styles.itemActions}>
          {canEditItems() && (
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() => handleEditItem(item)}
            >
              <Ionicons name="pencil" size={16} color="#6B7D3D" />
            </TouchableOpacity>
          )}
          {canDeleteItems() && (
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => deleteItem(item.id)}
            >
              <Ionicons name="trash" size={16} color="#E74C3C" />
            </TouchableOpacity>
          )}
          {!canEditItems() && !canDeleteItems() && canViewItems() && (
            <TouchableOpacity
              style={[styles.actionButton, styles.viewButton]}
              onPress={() => {/* Handle view item details */}}
            >
              <Ionicons name="eye" size={16} color="#3498DB" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.itemDetails}>
        {item.item_code && (
          <View style={styles.detailRow}>
            <Ionicons name="barcode" size={16} color="#666" />
            <Text style={styles.detailText}>Code: {item.item_code}</Text>
          </View>
        )}
        <View style={styles.detailRow}>
          <Ionicons name="cube" size={16} color="#666" />
          <Text style={styles.detailText}>Qty: {item.qty || 0}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="cash" size={16} color="#666" />
          <Text style={styles.detailText}>Price: ${item.amount || 0}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="trending-up" size={16} color="#666" />
          <Text style={styles.detailText}>Selling: ${item.selling_rate || 0}</Text>
        </View>
      </View>

      {item.description && (
        <Text style={styles.itemDescription} numberOfLines={2}>
          {item.description}
        </Text>
      )}

      {item.images && item.images.length > 0 && (
        <ScrollView horizontal style={styles.imageScroll} showsHorizontalScrollIndicator={false}>
          {item.images.map((image, index) => (
            <Image
              key={index}
              source={{ uri: image }}
              style={styles.itemImage}
              resizeMode="cover"
            />
          ))}
        </ScrollView>
      )}
    </View>
  );

  // Show loading if permissions not loaded yet
  if (loading || roleId === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B7D3D" />
        <Text style={styles.loadingText}>Loading items...</Text>
      </View>
    );
  }

  // Check if user has access to view items at all
  if (!canViewItems()) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.noAccessContainer}>
          <Ionicons name="lock-closed" size={64} color="#ccc" />
          <Text style={styles.noAccessText}>Access Denied</Text>
          <Text style={styles.noAccessSubtext}>
            You do not have permission to view items
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
              <Text style={styles.headerTitle}>Item Management</Text>
              <Text style={styles.headerSubtitle}>
                {items.length} items total
                {roleId === 3 && (
                  <Text style={styles.permissionIndicator}> • Permission Based</Text>
                )}
              </Text>
            </View>
            {canCreateItems() && (
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddItem}
              >
                <Ionicons name="add" size={24} color="#fff" />
              </TouchableOpacity>
            )}
            {!canCreateItems() && (
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
              {canViewItems() && ' View'}
              {canCreateItems() && ' • Create'}
              {canEditItems() && ' • Edit'}
              {canDeleteItems() && ' • Delete'}
            </Text>
          </View>
        </View>
      )}

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search items..."
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

      {/* Items List */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6B7D3D']} />
        }
      >
        {filteredItems.length > 0 ? (
          filteredItems.map(renderItemCard)
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>
              {searchQuery ? 'No items found' : 'No items available'}
            </Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? 'Try adjusting your search' : 'Add your first item to get started'}
            </Text>
            {!searchQuery && canCreateItems() && (
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={handleAddItem}
              >
                <Text style={styles.emptyButtonText}>Add Item</Text>
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
  itemCard: {
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
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  itemNameAr: {
    fontSize: 16,
    color: '#666',
    textAlign: 'right',
  },
  itemActions: {
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
  itemDetails: {
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
  itemDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 15,
  },
  imageScroll: {
    marginTop: 10,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
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

export default ItemManagementScreen;