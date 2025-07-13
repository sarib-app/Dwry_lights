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
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import languageService from '../Globals/Store/Lang';
import getAuthToken from '../Globals/Store/LocalData';
// import { commonStyles, getStatusColor } from '../shared/CommonStyles';
import {commonStyles,getStatusColor} from '../Globals/CommonStyles';

const API_BASE_URL = 'https://planetdory.dwrylight.com/api';

const PurchaseOrderListScreen = ({ navigation }) => {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isRTL, setIsRTL] = useState(false);
  
  const translate = (key) => languageService.translate(key);

  useEffect(() => {
    initializeScreen();
    fetchPurchaseOrders();
  }, []);

  const initializeScreen = async () => {
    const language = await languageService.loadSavedLanguage();
    setCurrentLanguage(language);
    setIsRTL(language === 'ar');
  };

  // Fetch all purchase orders
  const fetchPurchaseOrders = async () => {
    const token = await getAuthToken();
    if (!token) {
      Alert.alert(translate('error'), translate('authTokenNotFound'));
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/fetch_all_purchase_orders`, {
        method: 'GET',
        headers: {
          'Authorization': token,
        },
      });
      
      const result = await response.json();
      console.log('Purchase Orders API Response:', result);
      
      if (result.status == 200) {
        setPurchaseOrders(result.data || []);
      } else {
        Alert.alert(translate('error'), result.message || translate('failedToFetchPurchaseOrders'));
      }
    } catch (error) {
      console.error('Fetch purchase orders error:', error);
      Alert.alert(translate('error'), translate('networkErrorFetchingPurchaseOrders'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Delete purchase order
  const deletePurchaseOrder = async (orderId) => {
    Alert.alert(
      translate('deletePurchaseOrder'),
      translate('deletePurchaseOrderConfirmation'),
      [
        { text: translate('cancel'), style: 'cancel' },
        {
          text: translate('delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await getAuthToken();
              if (!token) return;

              const response = await fetch(`${API_BASE_URL}/delete_purchase_order/${orderId}`, {
                method: 'POST',
                headers: {
                  'Authorization': token,
                },
              });
              
              const result = await response.json();
              
              if (result.status == 200) {
                Alert.alert(translate('success'), translate('purchaseOrderDeletedSuccessfully'));
                fetchPurchaseOrders();
              } else {
                Alert.alert(translate('error'), result.message || translate('failedToDeletePurchaseOrder'));
              }
            } catch (error) {
              console.error('Delete purchase order error:', error);
              Alert.alert(translate('error'), translate('networkErrorDeletingPurchaseOrder'));
            }
          },
        },
      ]
    );
  };

  // Filter purchase orders based on search and status
  const filteredPurchaseOrders = purchaseOrders.filter(order => {
    const matchesSearch = 
      order.po_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.supplier_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.created_by?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.created_by?.last_name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPurchaseOrders();
  }, []);

  // Calculate statistics
  const calculateStats = () => {
    return purchaseOrders.reduce((stats, order) => {
      stats.totalAmount += parseFloat(order.total_amount) || 0;
      stats.totalOrders += 1;
      if (order.status === 'pending') stats.pendingOrders += 1;
      if (order.status === 'approved') stats.approvedOrders += 1;
      if (order.status === 'delivered') stats.deliveredOrders += 1;
      return stats;
    }, { totalAmount: 0, totalOrders: 0, pendingOrders: 0, approvedOrders: 0, deliveredOrders: 0 });
  };

  const stats = calculateStats();

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US');
  };

  // Format currency
  const formatCurrency = (amount) => {
    const number = parseFloat(amount) || 0;
    return isRTL ? `${number.toFixed(2)} ر.س` : `$${number.toFixed(2)}`;
  };

  // Render filter options
  const filterOptions = [
    { key: 'all', label: translate('allPurchaseOrders') },
    { key: 'pending', label: translate('pendingOrders') },
    { key: 'approved', label: translate('approvedOrders') },
    { key: 'delivered', label: translate('deliveredOrders') },
    { key: 'cancelled', label: translate('cancelledOrders') },
  ];

  // Render purchase order card
  const renderPurchaseOrderCard = (order) => (
    <View key={order.id} style={commonStyles.card}>
      <View style={[styles.orderHeader, isRTL && commonStyles.rtlRow]}>
        <View style={styles.orderInfo}>
          <Text style={[styles.poNumber, isRTL && commonStyles.arabicText]}>
            {order.po_number}
          </Text>
          <Text style={[styles.supplierName, isRTL && commonStyles.arabicText]}>
            {order.supplier_name}
          </Text>
        </View>
        
        <View style={[styles.orderStatusContainer, isRTL && commonStyles.rtlRow]}>
          <View style={[commonStyles.paymentStatus, { backgroundColor: getStatusColor(order.status) }]}>
            <Text style={commonStyles.paymentStatusText}>
              {translate(order.status)}
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.orderDetails, isRTL && styles.rtlOrderDetails]}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar" size={16} color="#666" />
          <Text style={[styles.detailText, isRTL && commonStyles.arabicText]}>
            {translate('poDate')}: {formatDate(order.po_date)}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="time" size={16} color="#666" />
          <Text style={[styles.detailText, isRTL && commonStyles.arabicText]}>
            {translate('expectedDelivery')}: {formatDate(order.expected_delivery_date)}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="cash" size={16} color="#666" />
          <Text style={[styles.detailText, isRTL && commonStyles.arabicText]}>
            {translate('totalAmount')}: {formatCurrency(order.total_amount)}
          </Text>
        </View>
      </View>

      <View style={[styles.orderMeta, isRTL && styles.rtlOrderMeta]}>
        <View style={styles.metaRow}>
          <Text style={[styles.metaLabel, isRTL && commonStyles.arabicText]}>
            {translate('itemsCount')}:
          </Text>
          <Text style={[styles.metaValue, isRTL && commonStyles.arabicText]}>
            {order.items?.length || 0}
          </Text>
        </View>
        
        <View style={styles.metaRow}>
          <Text style={[styles.metaLabel, isRTL && commonStyles.arabicText]}>
            {translate('createdBy')}:
          </Text>
          <Text style={[styles.metaValue, isRTL && commonStyles.arabicText]}>
            {order.created_by?.first_name} {order.created_by?.last_name}
          </Text>
        </View>

        {order.notes && (
          <View style={styles.notesRow}>
            <Text style={[styles.notesLabel, isRTL && commonStyles.arabicText]}>
              {translate('notes')}:
            </Text>
            <Text style={[styles.notesText, isRTL && commonStyles.arabicText]} numberOfLines={2}>
              {order.notes}
            </Text>
          </View>
        )}
      </View>

      <View style={[styles.orderActions, isRTL && commonStyles.rtlRow]}>
        <TouchableOpacity
          style={[commonStyles.actionButton, commonStyles.viewButton]}
          onPress={() => navigation.navigate('PurchaseOrderDetails', { order })}
        >
          <Ionicons name="eye" size={16} color="#3498DB" />
          <Text style={[commonStyles.actionButtonText, { color: '#3498DB' }, isRTL && commonStyles.arabicText]}>
            {translate('view')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[commonStyles.actionButton, commonStyles.editButton]}
          onPress={() => navigation.navigate('EditPurchaseOrder', { order })}
        >
          <Ionicons name="pencil" size={16} color="#6B7D3D" />
          <Text style={[commonStyles.actionButtonText, { color: '#6B7D3D' }, isRTL && commonStyles.arabicText]}>
            {translate('edit')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[commonStyles.actionButton, commonStyles.deleteButton]}
          onPress={() => deletePurchaseOrder(order.id)}
        >
          <Ionicons name="trash" size={16} color="#E74C3C" />
          <Text style={[commonStyles.actionButtonText, { color: '#E74C3C' }, isRTL && commonStyles.arabicText]}>
            {translate('delete')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={commonStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B7D3D" />
        <Text style={[commonStyles.loadingText, isRTL && commonStyles.arabicText]}>
          {translate('loadingPurchaseOrders')}
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
                {translate('purchaseOrders')}
              </Text>
              <Text style={[commonStyles.headerSubtitle, isRTL && commonStyles.arabicText]}>
                {purchaseOrders.length} {translate('ordersTotal')} • {formatCurrency(stats.totalAmount)}
              </Text>
            </View>
            <TouchableOpacity
              style={commonStyles.addButton}
              onPress={() => navigation.navigate('AddPurchaseOrder')}
            >
              <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      {/* Stats Cards */}
      <View style={commonStyles.statsContainer}>
        <View style={commonStyles.statCard}>
          <Ionicons name="document-text" size={24} color="#6B7D3D" />
          <Text style={[commonStyles.statNumber, isRTL && commonStyles.arabicText]}>
            {stats.totalOrders}
          </Text>
          <Text style={[commonStyles.statLabel, isRTL && commonStyles.arabicText]}>
            {translate('totalOrders')}
          </Text>
        </View>
        <View style={commonStyles.statCard}>
          <Ionicons name="time" size={24} color="#F39C12" />
          <Text style={[commonStyles.statNumber, isRTL && commonStyles.arabicText]}>
            {stats.pendingOrders}
          </Text>
          <Text style={[commonStyles.statLabel, isRTL && commonStyles.arabicText]}>
            {translate('pendingOrders')}
          </Text>
        </View>
        <View style={commonStyles.statCard}>
          <Ionicons name="checkmark-circle" size={24} color="#27AE60" />
          <Text style={[commonStyles.statNumber, isRTL && commonStyles.arabicText]}>
            {stats.deliveredOrders}
          </Text>
          <Text style={[commonStyles.statLabel, isRTL && commonStyles.arabicText]}>
            {translate('deliveredOrders')}
          </Text>
        </View>
      </View>

      {/* Search and Filter Bar */}
      <View style={commonStyles.searchContainer}>
        <View style={[commonStyles.searchBar, isRTL && commonStyles.rtlSearchBar]}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={[commonStyles.searchInput, isRTL && commonStyles.arabicInput]}
            placeholder={translate('searchPurchaseOrders')}
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
        
        <TouchableOpacity
          style={commonStyles.filterButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Ionicons name="filter" size={20} color="#6B7D3D" />
          <Text style={[commonStyles.filterButtonText, isRTL && commonStyles.arabicText]}>
            {translate('filter')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Purchase Orders List */}
      <ScrollView
        style={commonStyles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6B7D3D']} />
        }
      >
        {filteredPurchaseOrders.length > 0 ? (
          filteredPurchaseOrders.map(renderPurchaseOrderCard)
        ) : (
          <View style={commonStyles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color="#ccc" />
            <Text style={[commonStyles.emptyText, isRTL && commonStyles.arabicText]}>
              {searchQuery || filterStatus !== 'all' 
                ? translate('noPurchaseOrdersFound') 
                : translate('noPurchaseOrdersAvailable')
              }
            </Text>
            <Text style={[commonStyles.emptySubtext, isRTL && commonStyles.arabicText]}>
              {searchQuery || filterStatus !== 'all'
                ? translate('tryAdjustingSearch')
                : translate('addFirstPurchaseOrder')
              }
            </Text>
            {!searchQuery && filterStatus === 'all' && (
              <TouchableOpacity
                style={commonStyles.emptyButton}
                onPress={() => navigation.navigate('AddPurchaseOrder')}
              >
                <Text style={[commonStyles.emptyButtonText, isRTL && commonStyles.arabicText]}>
                  {translate('addPurchaseOrder')}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <SafeAreaView style={commonStyles.modalContainer}>
          <View style={[commonStyles.modalHeader, isRTL && commonStyles.rtlModalHeader]}>
            <Text style={[commonStyles.modalTitle, isRTL && commonStyles.arabicText]}>
              {translate('filterPurchaseOrders')}
            </Text>
            <TouchableOpacity
              style={commonStyles.modalCloseButton}
              onPress={() => setShowFilterModal(false)}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <View style={commonStyles.filterOptions}>
            {filterOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  commonStyles.filterOption,
                  filterStatus === option.key && commonStyles.filterOptionActive
                ]}
                onPress={() => {
                  setFilterStatus(option.key);
                  setShowFilterModal(false);
                }}
              >
                <Text style={[
                  commonStyles.filterOptionText,
                  filterStatus === option.key && commonStyles.filterOptionTextActive,
                  isRTL && commonStyles.arabicText
                ]}>
                  {option.label}
                </Text>
                {filterStatus === option.key && (
                  <Ionicons name="checkmark" size={20} color="#6B7D3D" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

// Screen-specific styles (minimal since we're using commonStyles)
const styles = StyleSheet.create({
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  
  orderInfo: {
    flex: 1,
  },
  
  poNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  
  supplierName: {
    fontSize: 16,
    color: '#666',
  },
  
  orderStatusContainer: {
    alignItems: 'flex-end',
  },
  
  orderDetails: {
    marginBottom: 15,
  },
  
  rtlOrderDetails: {
    alignItems: 'flex-end',
  },
  
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  
  orderMeta: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 15,
    marginBottom: 15,
  },
  
  rtlOrderMeta: {
    alignItems: 'flex-end',
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
  
  notesRow: {
    marginTop: 10,
  },
  
  notesLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  
  notesText: {
    fontSize: 14,
    color: '#333',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 15,
  },
});

export default PurchaseOrderListScreen;