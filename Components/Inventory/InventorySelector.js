import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  FlatList,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import languageService from '../Globals/Store/Lang';

const API_BASE_URL = 'https://planetdory.dwrylight.com/api';

const InventorySelectorScreen = ({ route, navigation }) => {
  const { selectedInventoryId, onInventorySelect } = route.params;
  
  const [inventories, setInventories] = useState([]);
  const [filteredInventories, setFilteredInventories] = useState([]);
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isRTL, setIsRTL] = useState(false);

  const translate = (key) => languageService.translate(key);

  useEffect(() => {
    initializeScreen();
  }, []);

  useEffect(() => {
    filterInventories();
  }, [searchQuery, inventories]);

  const initializeScreen = async () => {
    const language = await languageService.loadSavedLanguage();
    setCurrentLanguage(language);
    setIsRTL(language === 'ar');
    
    await fetchInventories();
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

  // Fetch inventories from API
  const fetchInventories = async () => {
    setLoading(true);
    const token = await getAuthToken();
    
    if (!token) {
      Alert.alert(translate('error'), translate('authTokenNotFound'));
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/fetch_all_inventory`, {
        method: 'GET',
        headers: { 
          'Authorization': token,
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      console.log('Fetch inventory response:', result);

      if (result.status === 200 || result.status === '200') {
        // Based on the API response structure: result.data.data contains the inventory array
        const inventoryData = result.data?.data || [];
        setInventories(inventoryData);
        setFilteredInventories(inventoryData);
        
        // Set selected inventory if provided
        if (selectedInventoryId) {
          const selected = inventoryData.find(inv => inv.id === selectedInventoryId);
          if (selected) {
            setSelectedInventory(selected);
          }
        }
      } else {
        Alert.alert(translate('error'), result.message || translate('failedToFetchInventories'));
      }
    } catch (error) {
      console.error('Fetch inventories error:', error);
      Alert.alert(translate('error'), translate('networkErrorFetchingInventories'));
    } finally {
      setLoading(false);
    }
  };

  // Filter inventories based on search query
  const filterInventories = () => {
    if (!searchQuery.trim()) {
      setFilteredInventories(inventories);
      return;
    }

    const filtered = inventories.filter(inventory => 
      inventory.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inventory.po_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inventory.vendor?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setFilteredInventories(filtered);
  };

  // Handle inventory selection
  const handleInventorySelect = (inventory) => {
    setSelectedInventory(inventory);
  };

  // Confirm selection and go back
  const confirmSelection = () => {
    if (onInventorySelect) {
      onInventorySelect(selectedInventory);
    }
    navigation.goBack();
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedInventory(null);
    if (onInventorySelect) {
      onInventorySelect(null);
    }
    navigation.goBack();
  };

  // Format currency
  const formatCurrency = (amount) => {
    const number = parseFloat(amount) || 0;
    return isRTL ? `${number.toFixed(2)} ر.س` : `$${number.toFixed(2)}`;
  };

  // Render inventory item
  const renderInventoryItem = ({ item }) => {
    const isSelected = selectedInventory?.id === item.id;
    
    return (
      <TouchableOpacity
        style={[
          styles.inventoryItem,
          isSelected && styles.inventoryItemSelected,
          isRTL && styles.rtlInventoryItem
        ]}
        onPress={() => handleInventorySelect(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.inventoryItemContent, isRTL && styles.rtlInventoryItemContent]}>
          <View style={styles.inventoryItemHeader}>
            <View style={[styles.inventoryItemInfo, isRTL && styles.rtlInventoryItemInfo]}>
              <Text style={[styles.inventoryItemName, isRTL && styles.arabicText]}>
                {item.description || translate('unknownItem')}
              </Text>
              {item.po_number && (
                <Text style={[styles.inventoryItemSku, isRTL && styles.arabicText]}>
                  {translate('poNumber')}: {item.po_number}
                </Text>
              )}
            </View>
            
            {isSelected && (
              <View style={styles.selectedIndicator}>
                <Ionicons name="checkmark-circle" size={24} color="#6B7D3D" />
              </View>
            )}
          </View>
          
          <View style={[styles.inventoryItemDetails, isRTL && styles.rtlInventoryItemDetails]}>
            <View style={styles.inventoryDetailItem}>
              <Ionicons name="cube" size={16} color="#666" />
              <Text style={[styles.inventoryDetailText, isRTL && styles.arabicText]}>
                {translate('quantity')}: {item.quantity || 0}
              </Text>
            </View>
            
            <View style={styles.inventoryDetailItem}>
              <Ionicons name="pricetag" size={16} color="#666" />
              <Text style={[styles.inventoryDetailText, isRTL && styles.arabicText]}>
                {translate('cost')}: {formatCurrency(item.cost)}
              </Text>
            </View>
            
            <View style={styles.inventoryDetailItem}>
              <Ionicons name="calculator" size={16} color="#666" />
              <Text style={[styles.inventoryDetailText, isRTL && styles.arabicText]}>
                {translate('total')}: {formatCurrency(item.total)}
              </Text>
            </View>
            
            {item.vendor && (
              <View style={styles.inventoryDetailItem}>
                <Ionicons name="business" size={16} color="#666" />
                <Text style={[styles.inventoryDetailText, isRTL && styles.arabicText]}>
                  {translate('vendor')}: {item.vendor}
                </Text>
              </View>
            )}
          </View>
          
          {/* Payment Status Indicator */}
          <View style={[styles.paymentStatus, isRTL && styles.rtlPaymentStatus]}>
            <View style={[
              styles.paymentIndicator,
              item.is_paid === 1 ? styles.paymentPaid : styles.paymentUnpaid
            ]} />
            <Text style={[styles.paymentText, isRTL && styles.arabicText]}>
              {item.is_paid === 1 ? translate('paid') : translate('unpaid')}
            </Text>
          </View>

          {/* Stock Status Indicator */}
          <View style={[styles.stockStatus, isRTL && styles.rtlStockStatus]}>
            <View style={[
              styles.stockIndicator,
              item.quantity > 10 ? styles.stockHigh : 
              item.quantity > 0 ? styles.stockLow : styles.stockEmpty
            ]} />
            <Text style={[styles.stockText, isRTL && styles.arabicText]}>
              {item.quantity > 10 ? translate('inStock') : 
               item.quantity > 0 ? translate('lowStock') : translate('outOfStock')}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6B7D3D" />
          <Text style={[styles.loadingText, isRTL && styles.arabicText]}>
            {translate('loadingInventories')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

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
            
            <Text style={[styles.headerTitle, isRTL && styles.arabicText]}>
              {translate('selectInventory')}
            </Text>
            
            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearSelection}
            >
              <Text style={[styles.clearButtonText, isRTL && styles.arabicText]}>
                {translate('clear')}
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, isRTL && styles.rtlSearchBar]}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={[styles.searchInput, isRTL && styles.arabicInput]}
            placeholder={translate('searchInventories')}
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

      {/* Inventory List */}
      <FlatList
        data={filteredInventories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderInventoryItem}
        style={styles.inventoryList}
        contentContainerStyle={styles.inventoryListContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={64} color="#ccc" />
            <Text style={[styles.emptyTitle, isRTL && styles.arabicText]}>
              {searchQuery ? translate('noInventoriesFound') : translate('noInventoriesAvailable')}
            </Text>
            <Text style={[styles.emptySubtitle, isRTL && styles.arabicText]}>
              {searchQuery 
                ? translate('tryDifferentSearchTerm')
                : translate('noInventoriesInSystem')
              }
            </Text>
          </View>
        }
        ListHeaderComponent={
          filteredInventories.length > 0 ? (
            <View style={styles.listHeader}>
              <Text style={[styles.resultCount, isRTL && styles.arabicText]}>
                {filteredInventories.length} {translate('inventoriesFound')}
              </Text>
            </View>
          ) : null
        }
      />

      {/* Bottom Action Bar */}
      {selectedInventory && (
        <View style={styles.bottomActionBar}>
          <View style={[styles.selectedInventoryInfo, isRTL && styles.rtlSelectedInfo]}>
            <Ionicons name="checkmark-circle" size={20} color="#6B7D3D" />
            <Text style={[styles.selectedInventoryText, isRTL && styles.arabicText]}>
              {selectedInventory.description}
            </Text>
          </View>
          
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={confirmSelection}
          >
            <Ionicons name="checkmark" size={20} color="#fff" />
            <Text style={[styles.confirmButtonText, isRTL && styles.arabicText]}>
              {translate('confirm')}
            </Text>
          </TouchableOpacity>
        </View>
      )}
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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  clearButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
    gap: 10,
  },
  rtlSearchBar: {
    flexDirection: 'row-reverse',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  arabicInput: {
    textAlign: 'right',
  },
  listHeader: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  resultCount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  inventoryList: {
    flex: 1,
  },
  inventoryListContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  inventoryItem: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inventoryItemSelected: {
    borderColor: '#6B7D3D',
    backgroundColor: '#f8fafb',
  },
  rtlInventoryItem: {
    // RTL specific styles if needed
  },
  inventoryItemContent: {
    padding: 16,
  },
  rtlInventoryItemContent: {
    // RTL specific styles if needed
  },
  inventoryItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  inventoryItemInfo: {
    flex: 1,
  },
  rtlInventoryItemInfo: {
    alignItems: 'flex-end',
  },
  inventoryItemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  inventoryItemSku: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  selectedIndicator: {
    marginLeft: 10,
  },
  inventoryItemDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    marginBottom: 8,
  },
  rtlInventoryItemDetails: {
    flexDirection: 'row-reverse',
  },
  inventoryDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  inventoryDetailText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  inventoryItemDescription: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
    lineHeight: 20,
  },
  stockStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  rtlStockStatus: {
    flexDirection: 'row-reverse',
  },
  stockIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  stockHigh: {
    backgroundColor: '#27AE60',
  },
  stockLow: {
    backgroundColor: '#F39C12',
  },
  stockEmpty: {
    backgroundColor: '#E74C3C',
  },
  stockText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  paymentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 5,
  },
  rtlPaymentStatus: {
    flexDirection: 'row-reverse',
  },
  paymentIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  paymentPaid: {
    backgroundColor: '#27AE60',
  },
  paymentUnpaid: {
    backgroundColor: '#E74C3C',
  },
  paymentText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#999',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#bbb',
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomActionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  selectedInventoryInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rtlSelectedInfo: {
    flexDirection: 'row-reverse',
  },
  selectedInventoryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  confirmButton: {
    backgroundColor: '#6B7D3D',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // RTL Support
  arabicText: {
    textAlign: 'right',
    fontFamily: 'Arabic',
  },
});

export default InventorySelectorScreen;