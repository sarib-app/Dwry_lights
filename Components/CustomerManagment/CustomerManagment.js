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

const CustomerManagementScreen = ({ navigation }) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  
  const translate = (key) => languageService.translate(key);

  // Get auth token from AsyncStorage
  const getAuthToken = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        return `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return null;
  };

  // Fetch all customers with pagination
  const fetchCustomers = async (page = 1, append = false) => {
    try {
      const token = await getAuthToken();
      if (!token) {
        Alert.alert('Error', 'Authentication token not found');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/fetch_all_customers?page=${page}`, {
        method: 'GET',
        headers: {
          'Authorization': token,
        },
      });
      
      const result = await response.json();
      console.log('Customers API Response:', result);
      
      if (result.status == 200) {
        const newCustomers = result?.data || [];
        if (append) {
          setCustomers(prev => [...prev, ...newCustomers]);
        } else {
          setCustomers(newCustomers);
        }
        
        // Check if there's more data
        setHasMoreData(result.data?.next_page_url != null);
      } else {
        Alert.alert('Error', result.message || 'Failed to fetch customers');
      }
    } catch (error) {
      console.error('Fetch customers error:', error);
      Alert.alert('Error', 'Network error while fetching customers');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load more customers
  const loadMoreCustomers = () => {
    if (hasMoreData && !loading) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchCustomers(nextPage, true);
    }
  };

  // Delete customer
  const deleteCustomer = async (customerId) => {
    Alert.alert(
      'Delete Customer',
      'Are you sure you want to delete this customer?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await getAuthToken();
              if (!token) return;

              const response = await fetch(`${API_BASE_URL}/delete_customer/${customerId}`, {
                method: 'POST',
                headers: {
                  'Authorization': token,
                },
              });
              
              const result = await response.json();
              
              if (result.status == 200) {
                Alert.alert('Success', 'Customer deleted successfully');
                fetchCustomers(); // Refresh the list
              } else {
                Alert.alert('Error', result.message || 'Failed to delete customer');
              }
            } catch (error) {
              console.error('Delete customer error:', error);
              Alert.alert('Error', 'Network error while deleting customer');
            }
          },
        },
      ]
    );
  };

  // Filter customers based on search query
  const filteredCustomers = customers.filter(customer =>
    customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.name_ar?.includes(searchQuery) ||
    customer.territory?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.customer_type?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setCurrentPage(1);
    fetchCustomers(1);
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Calculate stats
  const calculateStats = () => {
    const territoryCount = new Set(customers.map(c => c.territory)).size;
    const typeCount = new Set(customers.map(c => c.customer_type)).size;
    return {
      totalCustomers: customers.length,
      territories: territoryCount,
      types: typeCount,
    };
  };

  const stats = calculateStats();

  // Get customer type color
  const getCustomerTypeColor = (type) => {
    const colors = {
      'Retail': '#E74C3C',
      'Wholesale': '#3498DB',
      'Corporate': '#9B59B6',
      'Individual': '#27AE60',
    };
    return colors[type] || '#95A5A6';
  };

  // Render customer card
const renderCustomerCard = (customer) => (
  <View key={customer.id} style={styles.customerCard}>
    <Text>
      {customer.name}
    </Text>
    <View style={styles.customerHeader}>
      <View style={styles.customerInfo}>
        <Text style={styles.customerName}>{customer.name}</Text>
        {customer.name_ar && <Text style={styles.customerNameAr}>{customer.name_ar}</Text>}
      </View>
      <View style={styles.customerActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => navigation.navigate('EditCustomer', { customer })}
        >
          <Ionicons name="pencil" size={16} color="#6B7D3D" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => deleteCustomer(customer.id)}
        >
          <Ionicons name="trash" size={16} color="#E74C3C" />
        </TouchableOpacity>
      </View>
    </View>

    <View style={styles.customerDetails}>
      <View style={styles.detailRow}>
        <Ionicons name="location" size={16} color="#666" />
        <Text style={styles.detailText} numberOfLines={1}>
          {customer.territory || 'No territory'}
        </Text>
      </View>
      <View style={styles.detailRow}>
        <View style={[styles.typeIndicator, { backgroundColor: getCustomerTypeColor(customer.customer_type) }]} />
        <Text style={styles.detailText}>{customer.customer_type || 'No type'}</Text>
      </View>
    </View>

    {customer.address_contact && (
      <Text style={styles.customerAddress} numberOfLines={2}>
        {customer.address_contact}
      </Text>
    )}

    {(customer.lat && customer.long) && (
      <TouchableOpacity style={styles.locationButton}>
        <Ionicons name="map" size={16} color="#3498DB" />
        <Text style={styles.locationText}>
          {parseFloat(customer.lat).toFixed(4)}, {parseFloat(customer.long).toFixed(4)}
        </Text>
      </TouchableOpacity>
    )}

    {customer.added_by && (
      <Text style={styles.addedBy}>
        Added by: {customer.added_by.first_name} {customer.added_by.last_name} ({customer.added_by.role})
      </Text>
    )}
  </View>
);
  if (loading && customers.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B7D3D" />
        <Text style={styles.loadingText}>Loading customers...</Text>
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
              <Text style={styles.headerTitle}>Customer Management</Text>
              <Text style={styles.headerSubtitle}>
                {stats.totalCustomers} customers • {stats.territories} territories
              </Text>
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('AddCustomer')}
            >
              <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="people" size={24} color="#6B7D3D" />
          <Text style={styles.statNumber}>{stats.totalCustomers}</Text>
          <Text style={styles.statLabel}>Total Customers</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="location" size={24} color="#E74C3C" />
          <Text style={styles.statNumber}>{stats.territories}</Text>
          <Text style={styles.statLabel}>Territories</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="business" size={24} color="#3498DB" />
          <Text style={styles.statNumber}>{stats.types}</Text>
          <Text style={styles.statLabel}>Customer Types</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search customers..."
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

      {/* Customers List */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6B7D3D']} />
        }
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
          if (isCloseToBottom && hasMoreData && !loading) {
            loadMoreCustomers();
          }
        }}
        scrollEventThrottle={400}
      >
        {filteredCustomers.length > 0 ? (
          <>
            {filteredCustomers.map(renderCustomerCard)}
            
            {/* Load More Indicator */}
            {hasMoreData && (
              <View style={styles.loadMoreContainer}>
                <ActivityIndicator size="small" color="#6B7D3D" />
                <Text style={styles.loadMoreText}>Loading more customers...</Text>
              </View>
            )}
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>
              {searchQuery ? 'No customers found' : 'No customers available'}
            </Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? 'Try adjusting your search' : 'Add your first customer to get started'}
            </Text>
            {!searchQuery && (
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => navigation.navigate('AddCustomer')}
              >
                <Text style={styles.emptyButtonText}>Add Customer</Text>
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
  customerCard: {
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
  customerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  customerNameAr: {
    fontSize: 16,
    color: '#666',
    textAlign: 'right',
  },
  customerActions: {
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
  customerDetails: {
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
  customerAddress: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 10,
    fontStyle: 'italic',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  locationText: {
    marginLeft: 5,
    fontSize: 12,
    color: '#3498DB',
    fontWeight: '500',
  },
  addedBy: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  loadMoreContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadMoreText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
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

export default CustomerManagementScreen;