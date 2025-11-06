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
import AsyncStorage from '@react-native-async-storage/async-storage';
import getAuthToken from '../Globals/Store/LocalData';
import getUserRole from '../Globals/Store/GetRoleId';
import simplePermissions from '../Globals/Store/PermissionsDemo';
// import { commonStyles, getStatusColor } from '../shared/CommonStyles';
import {commonStyles,getStatusColor} from '../Globals/CommonStyles';

const API_BASE_URL = 'https://planetdory.dwrylight.com/api';

const PurchaseOrderListScreen = ({ navigation }) => {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isRTL, setIsRTL] = useState(false);
  const [roleId, setRoleId] = useState(null);
  const [userPermissions, setUserPermissions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  
  const translate = (key) => languageService.translate(key);

  useEffect(() => {
    initializeScreen();
    fetchPurchaseOrders();
  }, []);

  const initializeScreen = async () => {
    try {
      // Get user role
      const role = await getUserRole();
      setRoleId(role);

      // Fetch user permissions if not admin
      if (role === 3) {
        const permissions = await simplePermissions.fetchUserPermissions();
        setUserPermissions(permissions);
      }

      // Load language
      const language = await languageService.loadSavedLanguage();
      setCurrentLanguage(language);
      setIsRTL(language === 'ar');
    } catch (error) {
      console.error('Error initializing permissions:', error);
    }
  };

  // Permission check functions
  const hasPurchaseOrderPermission = (type) => {
    // If admin (not role 3), allow everything
    if (roleId !== 3) {
      return true;
    }
    
    // For staff (role 3), check specific permissions
    const permissionName = `purchase_orders.${type}`;
    return userPermissions.some(permission => 
      permission.name === permissionName && permission.module === 'purchase_orders'
    );
  };

  const canCreatePurchaseOrders = () => hasPurchaseOrderPermission('create');
  const canEditPurchaseOrders = () => hasPurchaseOrderPermission('edit');
  const canDeletePurchaseOrders = () => hasPurchaseOrderPermission('delete');
  const canViewPurchaseOrders = () => hasPurchaseOrderPermission('view') || hasPurchaseOrderPermission('management');

  // Fetch all purchase orders with pagination
  const fetchPurchaseOrders = async (page = 1, append = false) => {
    try {
      // Set loading state
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const token = await getAuthToken();
      if (!token) {
        Alert.alert(translate('error'), translate('authTokenNotFound'));
        return;
      }

      const response = await fetch(`${API_BASE_URL}/fetch_all_purchase_orders?page=${page}`, {
        method: 'GET',
        headers: {
          'Authorization': token,
        },
      });
      
      const result = await response.json();
      console.log('Purchase Orders API Response:', result);
      
      if (result.status == 200) {
        const newOrders = result?.data || [];
        
        if (append) {
          setPurchaseOrders(prev => [...prev, ...newOrders]);
        } else {
          setPurchaseOrders(newOrders);
        }
        
        // Check if there's more data based on pagination response
        let hasNextPage = false;
        if (result.next_page_url != null) {
          hasNextPage = true;
        } else if (result.current_page != null && result.last_page != null) {
          hasNextPage = result.current_page < result.last_page;
        } else if (Array.isArray(newOrders) && newOrders.length > 0) {
          const perPage = result.per_page || 10;
          hasNextPage = newOrders.length === perPage;
        }
        
        setHasMoreData(hasNextPage);
        setCurrentPage(page);
      } else {
        Alert.alert(translate('error'), result.message || translate('failedToFetchPurchaseOrders'));
      }
    } catch (error) {
      console.error('Fetch purchase orders error:', error);
      Alert.alert(translate('error'), translate('networkErrorFetchingPurchaseOrders'));
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  // Load more purchase orders
  const loadMorePurchaseOrders = () => {
    if (hasMoreData && !loading && !loadingMore) {
      const nextPage = currentPage + 1;
      fetchPurchaseOrders(nextPage, true);
    }
  };

  // Delete purchase order
  const deletePurchaseOrder = async (orderId) => {
    // Check delete permission
    if (!canDeletePurchaseOrders()) {
      Alert.alert(translate('accessDenied'), translate('noPermissionToDeletePurchaseOrder'));
      return;
    }

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
                // Reset to first page and refresh
                setCurrentPage(1);
                setHasMoreData(true);
                fetchPurchaseOrders(1, false);
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
    setCurrentPage(1);
    setHasMoreData(true);
    fetchPurchaseOrders(1, false);
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

        {canEditPurchaseOrders() && (
          <TouchableOpacity
            style={[commonStyles.actionButton, commonStyles.editButton]}
            onPress={() => navigation.navigate('EditPurchaseOrder', { order })}
          >
            <Ionicons name="pencil" size={16} color="#6B7D3D" />
            <Text style={[commonStyles.actionButtonText, { color: '#6B7D3D' }, isRTL && commonStyles.arabicText]}>
              {translate('edit')}
            </Text>
          </TouchableOpacity>
        )}

        {canDeletePurchaseOrders() && (
          <TouchableOpacity
            style={[commonStyles.actionButton, commonStyles.deleteButton]}
            onPress={() => deletePurchaseOrder(order.id)}
          >
            <Ionicons name="trash" size={16} color="#E74C3C" />
            <Text style={[commonStyles.actionButtonText, { color: '#E74C3C' }, isRTL && commonStyles.arabicText]}>
              {translate('delete')}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  // Show loading if permissions not loaded yet
  if (loading || roleId === null) {
    return (
      <View style={commonStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B7D3D" />
        <Text style={[commonStyles.loadingText, isRTL && commonStyles.arabicText]}>
          {translate('loadingPurchaseOrders')}
        </Text>
      </View>
    );
  }

  // Check if user has access to view purchase orders at all
  if (!canViewPurchaseOrders()) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={styles.noAccessContainer}>
          <Ionicons name="lock-closed" size={64} color="#ccc" />
          <Text style={styles.noAccessText}>Access Denied</Text>
          <Text style={styles.noAccessSubtext}>
            You do not have permission to view purchase orders
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
                {roleId === 3 && (
                  <Text style={{ color: '#fff', opacity: 0.8 }}> • Permission Based</Text>
                )}
              </Text>
            </View>
            {canCreatePurchaseOrders() && (
              <TouchableOpacity
                style={commonStyles.addButton}
                onPress={() => navigation.navigate('AddPurchaseOrder')}
              >
                <Ionicons name="add" size={24} color="#fff" />
              </TouchableOpacity>
            )}
            {!canCreatePurchaseOrders() && (
              <View style={[commonStyles.addButton, { opacity: 0.3 }]} />
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
              {canViewPurchaseOrders() && ' View'}
              {canCreatePurchaseOrders() && ' • Create'}
              {canEditPurchaseOrders() && ' • Edit'}
              {canDeletePurchaseOrders() && ' • Delete'}
            </Text>
          </View>
        </View>
      )}

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
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const paddingToBottom = 20;
          const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
          if (isCloseToBottom && hasMoreData && !loading && !loadingMore) {
            loadMorePurchaseOrders();
          }
        }}
        scrollEventThrottle={400}
      >
        {filteredPurchaseOrders.length > 0 ? (
          <>
            {filteredPurchaseOrders.map(renderPurchaseOrderCard)}
            
            {/* Load More Indicator */}
            {loadingMore && (
              <View style={styles.loadMoreContainer}>
                <ActivityIndicator size="small" color="#6B7D3D" />
                <Text style={styles.loadMoreText}>Loading more orders...</Text>
              </View>
            )}
            {!hasMoreData && purchaseOrders.length > 0 && (
              <View style={styles.loadMoreContainer}>
                <Text style={styles.loadMoreText}>No more orders to load</Text>
              </View>
            )}
          </>
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
            {!searchQuery && filterStatus === 'all' && canCreatePurchaseOrders() && (
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

  // Permission-related styles
  permissionBar: {
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  
  permissionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  permissionText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6B7D3D',
    fontWeight: '500',
  },

  // Access denied styles
  noAccessContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafb',
    paddingHorizontal: 32,
  },
  
  noAccessText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  
  noAccessSubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  
  backButton: {
    backgroundColor: '#6B7D3D',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
});

export default PurchaseOrderListScreen;