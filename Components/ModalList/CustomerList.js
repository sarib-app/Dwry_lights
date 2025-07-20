import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import languageService from '../Globals/Store/Lang';
import getAuthToken from '../Globals/Store/LocalData';
import commonStyles from '../Globals/CommonStyles';

const API_BASE_URL = 'https://planetdory.dwrylight.com/api';

const CustomerSelectorScreen = ({ navigation, route }) => {
  const { selectedCustomerId, onCustomerSelect } = route.params;
  
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isRTL, setIsRTL] = useState(false);

  const translate = (key) => languageService.translate(key);

  useEffect(() => {
    initializeScreen();
    fetchCustomers();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [searchQuery, customers]);

  const initializeScreen = async () => {
    const language = await languageService.loadSavedLanguage();
    setCurrentLanguage(language);
    setIsRTL(language === 'ar');
  };

  // Fetch customers from API
  const fetchCustomers = async () => {
    const token = await getAuthToken();
    if (!token) {
      Alert.alert(translate('error'), translate('authTokenNotFound'));
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/fetch_all_customers?page=1`, {
        method: 'GET',
        headers: {
          'Authorization': token,
        },
      });
      
      const result = await response.json();
      console.log('Customers API Response:', result);
      
      if (result.status === 200) {
        setCustomers(result.data || []);
        setFilteredCustomers(result.data || []);
      } else {
        Alert.alert(translate('error'), result.message || translate('failedToFetchCustomers'));
      }
    } catch (error) {
      console.error('Fetch customers error:', error);
      Alert.alert(translate('error'), translate('networkErrorFetchingCustomers'));
    } finally {
      setLoading(false);
    }
  };

  // Filter customers based on search query
  const filterCustomers = () => {
    if (!searchQuery.trim()) {
      setFilteredCustomers(customers);
      return;
    }

    const filtered = customers.filter(customer => {
      const name = isRTL ? customer.name_ar : customer.name;
      const englishName = customer.name;
      const arabicName = customer.name_ar;
      const territory = customer.territory;
      const customerType = customer.customer_type;

      return (
        name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        englishName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        arabicName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        territory?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customerType?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });

    setFilteredCustomers(filtered);
  };

  // Handle customer selection
  const handleCustomerSelect = (customer) => {
    onCustomerSelect(customer);
    navigation.goBack();
  };

  // Handle clear selection
  const handleClearSelection = () => {
    onCustomerSelect(null);
    navigation.goBack();
  };

  // Render customer item
  const renderCustomerItem = ({ item }) => {
    const isSelected = selectedCustomerId === item.id;
    const displayName = isRTL ? (item.name_ar || item.name) : item.name;

    return (
      <TouchableOpacity
        style={[
          styles.customerItem,
          isSelected && styles.selectedCustomerItem,
          isRTL && styles.rtlCustomerItem
        ]}
        onPress={() => handleCustomerSelect(item)}
        activeOpacity={0.7}
      >
        <View style={styles.customerIcon}>
          <Ionicons 
            name="person" 
            size={24} 
            color={isSelected ? '#6B7D3D' : '#666'} 
          />
        </View>
        
        <View style={styles.customerInfo}>
          <Text style={[
            styles.customerName,
            isSelected && styles.selectedCustomerName,
            isRTL && commonStyles.arabicText
          ]}>
            {displayName}
          </Text>
          
          <View style={[styles.customerDetails, isRTL && styles.rtlCustomerDetails]}>
            <View style={styles.detailItem}>
              <Ionicons name="location" size={14} color="#666" />
              <Text style={[styles.detailText, isRTL && commonStyles.arabicText]}>
                {item.territory}
              </Text>
            </View>
            
            <View style={styles.detailItem}>
              <Ionicons name="business" size={14} color="#666" />
              <Text style={[styles.detailText, isRTL && commonStyles.arabicText]}>
                {item.customer_type}
              </Text>
            </View>
          </View>
          
          {item.address_contact && (
            <Text style={[
              styles.customerAddress,
              isRTL && commonStyles.arabicText
            ]} numberOfLines={2}>
              {item.address_contact}
            </Text>
          )}
        </View>
        
        {isSelected && (
          <View style={styles.selectedIndicator}>
            <Ionicons name="checkmark-circle" size={24} color="#6B7D3D" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Render empty state
  const renderEmptyState = () => (
    <View style={commonStyles.emptyContainer}>
      <Ionicons name="people-outline" size={64} color="#ccc" />
      <Text style={[commonStyles.emptyText, isRTL && commonStyles.arabicText]}>
        {searchQuery ? translate('noCustomersFound') : translate('noCustomersAvailable')}
      </Text>
      <Text style={[commonStyles.emptySubtext, isRTL && commonStyles.arabicText]}>
        {searchQuery ? translate('tryDifferentSearch') : translate('addCustomersFirst')}
      </Text>
    </View>
  );

  // Render header with search and clear option
  const renderHeader = () => (
    <View>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, isRTL && styles.rtlSearchBar]}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={[styles.searchInput, isRTL && commonStyles.arabicInput]}
            placeholder={translate('searchCustomers')}
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            textAlign={isRTL ? 'right' : 'left'}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Clear Selection Option */}
      {selectedCustomerId && (
        <TouchableOpacity
          style={[styles.clearSelectionButton, isRTL && styles.rtlClearButton]}
          onPress={handleClearSelection}
        >
          <Ionicons name="close-circle-outline" size={20} color="#E74C3C" />
          <Text style={[styles.clearSelectionText, isRTL && commonStyles.arabicText]}>
            {translate('clearCustomerSelection')}
          </Text>
        </TouchableOpacity>
      )}

      {/* Results Count */}
      <View style={styles.resultsHeader}>
        <Text style={[styles.resultsCount, isRTL && commonStyles.arabicText]}>
          {filteredCustomers.length} {translate('customersFound')}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={commonStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B7D3D" />
        <Text style={[commonStyles.loadingText, isRTL && commonStyles.arabicText]}>
          {translate('loadingCustomers')}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={commonStyles.container}>
      {/* Header */}
      <View style={commonStyles.header}>
        <LinearGradient colors={['#6B7D3D', '#4A5D23']} style={commonStyles.headerGradient}>
          <View style={[commonStyles.headerContent, isRTL && commonStyles.rtlHeaderContent]}>
            <TouchableOpacity
              style={commonStyles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={24} color="#fff" />
            </TouchableOpacity>
            <View style={commonStyles.headerTextContainer}>
              <Text style={[commonStyles.headerTitle, isRTL && commonStyles.arabicText]}>
                {translate('selectCustomer')}
              </Text>
              <Text style={[commonStyles.headerSubtitle, isRTL && commonStyles.arabicText]}>
                {customers.length} {translate('customersAvailable')}
              </Text>
            </View>
            <View style={commonStyles.placeholder} />
          </View>
        </LinearGradient>
      </View>

      <FlatList
        data={filteredCustomers}
        renderItem={renderCustomerItem}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // Search Container
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

  rtlSearchBar: {
    flexDirection: 'row-reverse',
  },

  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },

  // Clear Selection
  clearSelectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 8,
    gap: 8,
  },

  rtlClearButton: {
    flexDirection: 'row-reverse',
  },

  clearSelectionText: {
    fontSize: 14,
    color: '#E74C3C',
    fontWeight: '500',
  },

  // Results Header
  resultsHeader: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#f8fafb',
  },

  resultsCount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },

  // List Content
  listContent: {
    flexGrow: 1,
  },

  separator: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginLeft: 80,
  },

  // Customer Item
  customerItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 20,
    backgroundColor: '#fff',
  },

  rtlCustomerItem: {
    flexDirection: 'row-reverse',
  },

  selectedCustomerItem: {
    backgroundColor: 'rgba(107, 125, 61, 0.05)',
    borderLeftWidth: 4,
    borderLeftColor: '#6B7D3D',
  },

  customerIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },

  customerInfo: {
    flex: 1,
  },

  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },

  selectedCustomerName: {
    color: '#6B7D3D',
  },

  customerDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    marginBottom: 8,
  },

  rtlCustomerDetails: {
    flexDirection: 'row-reverse',
  },

  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  detailText: {
    fontSize: 12,
    color: '#666',
  },

  customerAddress: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    lineHeight: 16,
  },

  selectedIndicator: {
    marginLeft: 10,
  },
});

export default CustomerSelectorScreen;