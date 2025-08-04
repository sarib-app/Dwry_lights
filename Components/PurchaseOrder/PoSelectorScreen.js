import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import languageService from '../Globals/Store/Lang';

const API_BASE_URL = 'https://planetdory.dwrylight.com/api';

const POSelectorScreen = ({ navigation, route }) => {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [filteredPOs, setFilteredPOs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isRTL, setIsRTL] = useState(false);

  // Get params from navigation
  const { selectedPOId, onPOSelect } = route.params || {};

  const translate = (key) => languageService.translate(key);

  useEffect(() => {
    initializeScreen();
    fetchPurchaseOrders();
  }, []);

  useEffect(() => {
    filterPOs();
  }, [searchQuery, purchaseOrders]);

  const initializeScreen = async () => {
    const language = await languageService.loadSavedLanguage();
    setCurrentLanguage(language);
    setIsRTL(language === 'ar');
  };

  // Get auth token
  const getAuthToken = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      return token ? `Bearer ${token}` : null;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  };

  // Fetch purchase orders
  const fetchPurchaseOrders = async () => {
    try {
      const token = await getAuthToken();
      if (!token) {
        Alert.alert(translate('error'), translate('authTokenNotFound'));
        navigation.goBack();
        return;
      }

      const response = await fetch(`${API_BASE_URL}/fetch_all_purchase_orders`, {
        method: 'GET',
        headers: {
          'Authorization': token,
        },
      });

      const result = await response.json();
      console.log('Purchase Orders API Response:', result);

      if (result.status === 200 || result.status === '200') {
        setPurchaseOrders(result.data || []);
      } else {
        Alert.alert(translate('error'), result.message || translate('failedToFetchPOs'));
      }
    } catch (error) {
      console.error('Fetch purchase orders error:', error);
      Alert.alert(translate('error'), translate('networkErrorFetchingPOs'));
    } finally {
      setLoading(false);
    }
  };

  // Filter purchase orders based on search
  const filterPOs = () => {
    if (!searchQuery.trim()) {
      setFilteredPOs(purchaseOrders);
      return;
    }

    const filtered = purchaseOrders.filter(po => 
      po.po_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.supplier_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredPOs(filtered);
  };

  // Handle PO selection
  const handlePOSelect = (po) => {
    if (onPOSelect) {
      onPOSelect(po);
    }
    navigation.goBack();
  };

  // Handle clear selection
  const handleClearSelection = () => {
    if (onPOSelect) {
      onPOSelect(null);
    }
    navigation.goBack();
  };

  // Format currency
  const formatCurrency = (amount) => {
    const number = parseFloat(amount) || 0;
    return isRTL ? `${number.toLocaleString()} ر.س` : `$${number.toLocaleString()}`;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return translate('noDate');
    const date = new Date(dateString);
    return date.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US');
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return '#F39C12';
      case 'approved': return '#27AE60';
      case 'delivered': return '#3498DB';
      case 'cancelled': return '#E74C3C';
      default: return '#95A5A6';
    }
  };

  // Render purchase order item
  const renderPOItem = ({ item }) => {
    const isSelected = selectedPOId === item.id;
    
    return (
      <TouchableOpacity
        style={[styles.poItem, isSelected && styles.selectedPOItem]}
        onPress={() => handlePOSelect(item)}
      >
        <View style={[styles.poHeader, isRTL && styles.rtlPOHeader]}>
          <View style={styles.poInfo}>
            <Text style={[styles.poNumber, isRTL && styles.arabicText]}>
              {item.po_number}
            </Text>
            <Text style={[styles.poSupplier, isRTL && styles.arabicText]}>
              {item.supplier_name || translate('noSupplier')}
            </Text>
          </View>
          
          <View style={[styles.poStatus, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }, isRTL && styles.arabicText]}>
              {translate(item.status?.toLowerCase()) || translate('unknown')}
            </Text>
          </View>
        </View>

        <View style={styles.poDetails}>
          {item.description && (
            <Text style={[styles.poDescription, isRTL && styles.arabicText]} numberOfLines={2}>
              {item.description}
            </Text>
          )}
          
          <View style={[styles.poMeta, isRTL && styles.rtlPOMeta]}>
            <View style={[styles.metaItem, isRTL && styles.rtlMetaItem]}>
              <Ionicons name="calendar" size={14} color="#666" />
              <Text style={[styles.metaText, isRTL && styles.arabicText]}>
                {formatDate(item.order_date)}
              </Text>
            </View>
            
            {item.total_amount && (
              <View style={[styles.metaItem, isRTL && styles.rtlMetaItem]}>
                <Ionicons name="cash" size={14} color="#666" />
                <Text style={[styles.metaText, isRTL && styles.arabicText]}>
                  {formatCurrency(item.total_amount)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {isSelected && (
          <View style={styles.selectedIndicator}>
            <Ionicons name="checkmark-circle" size={20} color="#27AE60" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-outline" size={64} color="#ccc" />
      <Text style={[styles.emptyText, isRTL && styles.arabicText]}>
        {searchQuery ? translate('noPOsFound') : translate('noPOsAvailable')}
      </Text>
      <Text style={[styles.emptySubtext, isRTL && styles.arabicText]}>
        {searchQuery ? translate('tryDifferentSearch') : translate('createPOFirst')}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <LinearGradient colors={['#6B7D3D', '#4A5D23']} style={styles.headerGradient}>
          <View style={[styles.headerContent, isRTL && styles.rtlHeaderContent]}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
              <Text style={[styles.headerTitle, isRTL && styles.arabicText]}>
                {translate('selectPurchaseOrder')}
              </Text>
              <Text style={[styles.headerSubtitle, isRTL && styles.arabicText]}>
                {translate('choosePOForInventory')}
              </Text>
            </View>
            {selectedPOId && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={handleClearSelection}
              >
                <Ionicons name="close" size={20} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, isRTL && styles.rtlSearchBar]}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={[styles.searchInput, isRTL && styles.arabicText]}
            placeholder={translate('searchPOs')}
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

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6B7D3D" />
          <Text style={[styles.loadingText, isRTL && styles.arabicText]}>
            {translate('loadingPOs')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredPOs}
          renderItem={renderPOItem}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafb',
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
  rtlHeaderContent: {
    flexDirection: 'row-reverse',
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
  clearButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  rtlSearchBar: {
    flexDirection: 'row-reverse',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  poItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  selectedPOItem: {
    borderWidth: 2,
    borderColor: '#27AE60',
    backgroundColor: 'rgba(39, 174, 96, 0.05)',
  },
  poHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  rtlPOHeader: {
    flexDirection: 'row-reverse',
  },
  poInfo: {
    flex: 1,
  },
  poNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  poSupplier: {
    fontSize: 14,
    color: '#666',
  },
  poStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  poDetails: {
    gap: 8,
  },
  poDescription: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  poMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rtlPOMeta: {
    flexDirection: 'row-reverse',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  rtlMetaItem: {
    flexDirection: 'row-reverse',
  },
  metaText: {
    fontSize: 12,
    color: '#666',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
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
    marginTop: 15,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  arabicText: {
    textAlign: 'right',
    fontFamily: 'Arabic',
  },
});

export default POSelectorScreen;