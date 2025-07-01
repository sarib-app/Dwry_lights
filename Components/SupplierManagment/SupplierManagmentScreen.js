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

const API_BASE_URL = 'https://planetdory.dwrylight.com/api';

const SupplierManagementScreen = ({ navigation }) => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const translate = (key) => languageService.translate(key);

  // Get auth token from AsyncStorage
  const getAuthToken = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken')
      if (token) {
        return `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return null;
  };

  // Fetch all suppliers
  const fetchSuppliers = async () => {
    try {
      const token = await getAuthToken();
      if (!token) {
        Alert.alert('Error', 'Authentication token not found');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/fetch_all_suppliers`, {
        method: 'GET',
        headers: {
          'Authorization': token,
        },
      });
      
      const result = await response.json();
      console.log('Suppliers API Response:', result);
      
      if (result.status == 200) {
        setSuppliers(result.data || []);
      } else {
        Alert.alert('Error', result.message || 'Failed to fetch suppliers');
      }
    } catch (error) {
      console.error('Fetch suppliers error:', error);
      Alert.alert('Error', 'Network error while fetching suppliers');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Delete supplier
  const deleteSupplier = async (supplierId) => {
    Alert.alert(
      'Delete Supplier',
      'Are you sure you want to delete this supplier?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await getAuthToken();
              if (!token) return;

              const response = await fetch(`${API_BASE_URL}/delete_supplier_by_id/${supplierId}`, {
                method: 'POST',
                headers: {
                  'Authorization': token,
                },
              });
              
              const result = await response.json();
              
              if (result.status == 200) {
                Alert.alert('Success', 'Supplier deleted successfully');
                fetchSuppliers(); // Refresh the list
              } else {
                Alert.alert('Error', result.message || 'Failed to delete supplier');
              }
            } catch (error) {
              console.error('Delete supplier error:', error);
              Alert.alert('Error', 'Network error while deleting supplier');
            }
          },
        },
      ]
    );
  };

  // Filter suppliers based on search query
  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.name_ar?.includes(searchQuery) ||
    supplier.contact_person?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.supplier_type?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchSuppliers();
  }, []);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  // Calculate stats
  const calculateStats = () => {
    const totalCreditLimit = suppliers.reduce((sum, supplier) => sum + (supplier.credit_limit || 0), 0);
    const activeSuppliers = suppliers.filter(s => s.status !== 'inactive').length;
    const supplierTypes = new Set(suppliers.map(s => s.supplier_type)).size;
    
    return {
      totalSuppliers: suppliers.length,
      activeSuppliers,
      totalCreditLimit,
      supplierTypes,
    };
  };

  const stats = calculateStats();

  // Get supplier type color
  const getSupplierTypeColor = (type) => {
    const colors = {
      'Local': '#27AE60',
      'International': '#3498DB',
      'Distributor': '#9B59B6',
      'Manufacturer': '#E67E22',
    };
    return colors[type] || '#95A5A6';
  };

  // Get status color
  const getStatusColor = (status) => {
    return status === 'active' ? '#27AE60' : '#E74C3C';
  };

  // Render supplier card
  const renderSupplierCard = (supplier) => (
    <View key={supplier.id} style={styles.supplierCard}>
      <View style={styles.supplierHeader}>
        <View style={styles.supplierInfo}>
          <View style={styles.nameContainer}>
            <Text style={styles.supplierName}>{supplier.name}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(supplier.status) }]}>
              <Text style={styles.statusText}>
                {supplier.status === 'active' ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>
          {supplier.name_ar && <Text style={styles.supplierNameAr}>{supplier.name_ar}</Text>}
        </View>
        <View style={styles.supplierActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => navigation.navigate('EditSupplier', { supplier })}
          >
            <Ionicons name="pencil" size={16} color="#6B7D3D" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => deleteSupplier(supplier.id)}
          >
            <Ionicons name="trash" size={16} color="#E74C3C" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.contactSection}>
        <View style={styles.contactRow}>
          <Ionicons name="person" size={16} color="#666" />
          <Text style={styles.contactText}>{supplier.contact_person}</Text>
        </View>
        
        {supplier.phone && (
          <TouchableOpacity style={styles.contactRow}>
            <Ionicons name="call" size={16} color="#666" />
            <Text style={styles.contactText}>{supplier.phone}</Text>
          </TouchableOpacity>
        )}
        
        {supplier.email && (
          <TouchableOpacity style={styles.contactRow}>
            <Ionicons name="mail" size={16} color="#666" />
            <Text style={styles.contactText}>{supplier.email}</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.supplierDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="location" size={16} color="#666" />
          <Text style={styles.detailText}>{supplier.city || 'No city'}</Text>
        </View>
        <View style={styles.detailRow}>
          <View style={[styles.typeIndicator, { backgroundColor: getSupplierTypeColor(supplier.supplier_type) }]} />
          <Text style={styles.detailText}>{supplier.supplier_type || 'No type'}</Text>
        </View>
      </View>

      {supplier.address && (
        <Text style={styles.supplierAddress} numberOfLines={2}>
          📍 {supplier.address}
        </Text>
      )}

      <View style={styles.businessInfo}>
        <View style={styles.businessRow}>
          <Text style={styles.businessLabel}>Payment Terms:</Text>
          <Text style={styles.businessValue}>{supplier.payment_terms || 'Not set'}</Text>
        </View>
        
        <View style={styles.businessRow}>
          <Text style={styles.businessLabel}>Credit Limit:</Text>
          <Text style={styles.businessValue}>
            {supplier.credit_limit ? `$${supplier.credit_limit.toLocaleString()}` : 'Not set'}
          </Text>
        </View>
        
        {supplier.tax_number && (
          <View style={styles.businessRow}>
            <Text style={styles.businessLabel}>Tax Number:</Text>
            <Text style={styles.businessValue}>{supplier.tax_number}</Text>
          </View>
        )}
      </View>

      {/* {supplier.added_by && (
        <Text style={styles.addedBy}>Added by user ID: {supplier.added_by}</Text>
      )} */}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B7D3D" />
        <Text style={styles.loadingText}>Loading suppliers...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <LinearGradient colors={['#6B7D3D', '#4A5D23']} style={styles.headerGradient}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Supplier Management</Text>
              <Text style={styles.headerSubtitle}>
                {stats.activeSuppliers}/{stats.totalSuppliers} active • ${stats.totalCreditLimit.toLocaleString()} credit
              </Text>
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('AddSupplier')}
            >
              <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="business" size={24} color="#6B7D3D" />
          <Text style={styles.statNumber}>{stats.totalSuppliers}</Text>
          <Text style={styles.statLabel}>Total Suppliers</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="checkmark-circle" size={24} color="#27AE60" />
          <Text style={styles.statNumber}>{stats.activeSuppliers}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="card" size={24} color="#E74C3C" />
          <Text style={styles.statNumber}>${stats.totalCreditLimit.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Total Credit</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search suppliers..."
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

      {/* Suppliers List */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6B7D3D']} />
        }
      >
        {filteredSuppliers.length > 0 ? (
          filteredSuppliers.map(renderSupplierCard)
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="business-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>
              {searchQuery ? 'No suppliers found' : 'No suppliers available'}
            </Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? 'Try adjusting your search' : 'Add your first supplier to get started'}
            </Text>
            {!searchQuery && (
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => navigation.navigate('AddSupplier')}
              >
                <Text style={styles.emptyButtonText}>Add Supplier</Text>
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
  backButton: {
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
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
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
    fontSize: 16,
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
  supplierCard: {
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
  supplierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  supplierInfo: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  supplierName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 10,
  },
  statusText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  supplierNameAr: {
    fontSize: 16,
    color: '#666',
    textAlign: 'right',
  },
  supplierActions: {
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
  contactSection: {
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#555',
    flex: 1,
  },
  supplierDetails: {
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
    flex: 1,
  },
  typeIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 6,
  },
  supplierAddress: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 15,
    fontStyle: 'italic',
  },
  businessInfo: {
    backgroundColor: '#f8fafb',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  businessRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  businessLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  businessValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  addedBy: {
    fontSize: 12,
    color: '#999',
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
});

export default SupplierManagementScreen;