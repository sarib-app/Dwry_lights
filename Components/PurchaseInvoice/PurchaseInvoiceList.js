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
import getAuthToken from '../Globals/Store/LocalData';
import getUserRole from '../Globals/Store/GetRoleId';
import simplePermissions from '../Globals/Store/PermissionsDemo';

const API_BASE_URL = 'https://planetdory.dwrylight.com/api';

const PurchaseInvoiceListScreen = ({ navigation }) => {
  const [purchaseInvoices, setPurchaseInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isRTL, setIsRTL] = useState(false);
  const [roleId, setRoleId] = useState(null);
  const [userPermissions, setUserPermissions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  
  const translate = (key) => languageService.translate(key);

  useEffect(() => {
    initializeScreen();
    fetchPurchaseInvoices();
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
  const hasPurchaseInvoicePermission = (type) => {
    // If admin (not role 3), allow everything
    if (roleId !== 3) {
      return true;
    }
    
    // For staff (role 3), check specific permissions
    const permissionName = `purchase_invoice.${type}`;
    return userPermissions.some(permission => 
      permission.name === permissionName && permission.module === 'purchase_invoice'
    );
  };

  const canCreatePurchaseInvoices = () => hasPurchaseInvoicePermission('create');
  const canEditPurchaseInvoices = () => hasPurchaseInvoicePermission('edit');
  const canDeletePurchaseInvoices = () => hasPurchaseInvoicePermission('delete');
  const canViewPurchaseInvoices = () => hasPurchaseInvoicePermission('view') || hasPurchaseInvoicePermission('management');

  // Get auth token from AsyncStorage
  const getAuthToken = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      return token ? `Bearer ${token}` : null;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  };

  // Fetch all purchase invoices with pagination
  const fetchPurchaseInvoices = async (page = 1, append = false) => {
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

      const response = await fetch(`${API_BASE_URL}/fetch_all_purchase_invoices?page=${page}`, {
        method: 'GET',
        headers: {
          'Authorization': token,
        },
      });
      
      const result = await response.json();
      console.log('Purchase Invoices API Response:', result);
      
      if (result.status === 200 || result.status === '200') {
        const newInvoices = result?.data || [];
        
        if (append) {
          setPurchaseInvoices(prev => [...prev, ...newInvoices]);
        } else {
          setPurchaseInvoices(newInvoices);
        }
        
        // Check if there's more data based on pagination response
        let hasNextPage = false;
        if (result.next_page_url != null) {
          hasNextPage = true;
        } else if (result.current_page != null && result.last_page != null) {
          hasNextPage = result.current_page < result.last_page;
        } else if (Array.isArray(newInvoices) && newInvoices.length > 0) {
          const perPage = result.per_page || 10;
          hasNextPage = newInvoices.length === perPage;
        }
        
        setHasMoreData(hasNextPage);
        setCurrentPage(page);
      } else {
        Alert.alert(translate('error'), result.message || translate('failedToFetchPurchaseInvoices'));
      }
    } catch (error) {
      console.error('Fetch purchase invoices error:', error);
      Alert.alert(translate('error'), translate('networkErrorFetchingPurchaseInvoices'));
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  // Load more purchase invoices
  const loadMorePurchaseInvoices = () => {
    if (hasMoreData && !loading && !loadingMore) {
      const nextPage = currentPage + 1;
      fetchPurchaseInvoices(nextPage, true);
    }
  };

  // Delete purchase invoice
  const deletePurchaseInvoice = async (invoiceId) => {
    // Check delete permission
    if (!canDeletePurchaseInvoices()) {
      Alert.alert(translate('accessDenied'), translate('noPermissionToDeletePurchaseInvoice'));
      return;
    }

    Alert.alert(
      translate('deletePurchaseInvoice'),
      translate('confirmDeletePurchaseInvoice'),
      [
        { text: translate('cancel'), style: 'cancel' },
        {
          text: translate('delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await getAuthToken();
              if (!token) return;

              const response = await fetch(`${API_BASE_URL}/delete_purchase_invoice/${invoiceId}`, {
                method: 'POST',
                headers: {
                  'Authorization': token,
                },
              });
              
              const result = await response.json();
              
              if (result.status === 200 || result.status === '200') {
                Alert.alert(translate('success'), translate('purchaseInvoiceDeletedSuccessfully'));
                // Reset to first page and refresh
                setCurrentPage(1);
                setHasMoreData(true);
                fetchPurchaseInvoices(1, false);
              } else {
                Alert.alert(translate('error'), result.message || translate('failedToDeletePurchaseInvoice'));
              }
            } catch (error) {
              console.error('Delete purchase invoice error:', error);
              Alert.alert(translate('error'), translate('networkErrorDeletingPurchaseInvoice'));
            }
          },
        },
      ]
    );
  };

  // Filter invoices based on search query
  const filteredInvoices = purchaseInvoices.filter(invoice =>
    invoice.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.po_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.supplier?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.notes?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setCurrentPage(1);
    setHasMoreData(true);
    fetchPurchaseInvoices(1, false);
  }, []);

  // Calculate totals for display
  const calculateTotals = () => {
    return purchaseInvoices.reduce((totals, invoice) => {
      totals.totalAmount += parseFloat(invoice.total_amount) || 0;
      totals.paidAmount += invoice.payment_status === 'paid' ? (parseFloat(invoice.total_amount) || 0) : 0;
      totals.pendingAmount += invoice.payment_status === 'pending' ? (parseFloat(invoice.total_amount) || 0) : 0;
      return totals;
    }, { totalAmount: 0, paidAmount: 0, pendingAmount: 0 });
  };

  const totals = calculateTotals();

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

  // Get payment status color
  const getPaymentStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid': return '#27AE60';
      case 'pending': return '#F39C12';
      case 'overdue': return '#E74C3C';
      default: return '#95A5A6';
    }
  };

  // Parse items from JSON string
  const parseItems = (itemsString) => {
    try {
      return JSON.parse(itemsString || '[]');
    } catch (error) {
      return [];
    }
  };

  // Render purchase invoice card
  const renderInvoiceCard = (invoice) => {
    const items = parseItems(invoice.items);
    const statusColor = getPaymentStatusColor(invoice.payment_status);
    
    return (
      <View key={invoice.id} style={styles.invoiceCard}>
        <View style={[styles.invoiceHeader, isRTL && styles.rtlInvoiceHeader]}>
          <View style={styles.invoiceInfo}>
            <Text style={[styles.invoiceNumber, isRTL && styles.arabicText]}>
              {invoice.invoice_number}
            </Text>
            <Text style={[styles.poNumber, isRTL && styles.arabicText]}>
              PO: {invoice.po_number}
            </Text>
            {invoice.supplier && (
              <Text style={[styles.supplier, isRTL && styles.arabicText]}>
                {translate('supplier')}: {invoice.supplier.name}
              </Text>
            )}
          </View>
          
          <View style={styles.invoiceActions}>
            <View style={[styles.paymentStatus, { backgroundColor: `${statusColor}20` }]}>
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <Text style={[styles.statusText, { color: statusColor }, isRTL && styles.arabicText]}>
                {translate(invoice.payment_status)}
              </Text>
            </View>
            
            <View style={styles.actionButtons}>
              {canEditPurchaseInvoices() && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => navigation.navigate('EditPurchaseInvoice', { invoice })}
                >
                  <Ionicons name="pencil" size={16} color="#6B7D3D" />
                </TouchableOpacity>
              )}
              {canDeletePurchaseInvoices() && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => deletePurchaseInvoice(invoice.id)}
                >
                  <Ionicons name="trash" size={16} color="#E74C3C" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        <View style={styles.invoiceDetails}>
          <View style={[styles.detailRow, isRTL && styles.rtlDetailRow]}>
            <Ionicons name="calendar" size={16} color="#666" />
            <Text style={[styles.detailText, isRTL && styles.arabicText]}>
              {translate('invoiceDate')}: {formatDate(invoice.invoice_date)}
            </Text>
          </View>
          
          <View style={[styles.detailRow, isRTL && styles.rtlDetailRow]}>
            <Ionicons name="time" size={16} color="#666" />
            <Text style={[styles.detailText, isRTL && styles.arabicText]}>
              {translate('dueDate')}: {formatDate(invoice.due_date)}
            </Text>
          </View>
          
          <View style={[styles.detailRow, isRTL && styles.rtlDetailRow]}>
            <Ionicons name="card" size={16} color="#666" />
            <Text style={[styles.detailText, isRTL && styles.arabicText]}>
              {translate('paymentMethod')}: {translate(invoice.payment_method?.toLowerCase()?.replace(' ', ''))}
            </Text>
          </View>
        </View>

        <View style={styles.invoiceMeta}>
          <View style={styles.metaRow}>
            <Text style={[styles.metaLabel, isRTL && styles.arabicText]}>
              {translate('subtotal')}:
            </Text>
            <Text style={[styles.metaValue, isRTL && styles.arabicText]}>
              {formatCurrency(invoice.subtotal)}
            </Text>
          </View>
          
          <View style={styles.metaRow}>
            <Text style={[styles.metaLabel, isRTL && styles.arabicText]}>
              {translate('tax')} ({invoice.tax_percentage}%):
            </Text>
            <Text style={[styles.metaValue, isRTL && styles.arabicText]}>
              {formatCurrency(invoice.tax_amount)}
            </Text>
          </View>
          
          <View style={styles.metaRow}>
            <Text style={[styles.metaLabel, isRTL && styles.arabicText]}>
              {translate('discount')} ({invoice.discount_percentage}%):
            </Text>
            <Text style={[styles.metaValue, { color: '#E74C3C' }, isRTL && styles.arabicText]}>
              -{formatCurrency(invoice.discount_amount)}
            </Text>
          </View>
          
          <View style={[styles.metaRow, styles.totalRow]}>
            <Text style={[styles.totalLabel, isRTL && styles.arabicText]}>
              {translate('totalAmount')}:
            </Text>
            <Text style={[styles.totalValue, isRTL && styles.arabicText]}>
              {formatCurrency(invoice.total_amount)}
            </Text>
          </View>
        </View>

        {items.length > 0 && (
          <View style={styles.itemsSection}>
            <Text style={[styles.itemsTitle, isRTL && styles.arabicText]}>
              {translate('items')} ({items.length})
            </Text>
            {items.slice(0, 2).map((item, index) => (
              <View key={index} style={[styles.itemRow, isRTL && styles.rtlItemRow]}>
                <Text style={[styles.itemText, isRTL && styles.arabicText]}>
                  {translate('item')} {item.item_id}: {item.quantity} × {formatCurrency(item.unit_price)}
                </Text>
                <Text style={[styles.itemTotal, isRTL && styles.arabicText]}>
                  {formatCurrency(item.total_price || (item.quantity * item.unit_price))}
                </Text>
              </View>
            ))}
            {items.length > 2 && (
              <Text style={[styles.moreItems, isRTL && styles.arabicText]}>
                +{items.length - 2} {translate('moreItems')}
              </Text>
            )}
          </View>
        )}

        {invoice.notes && (
          <View style={styles.notesSection}>
            <Text style={[styles.notesTitle, isRTL && styles.arabicText]}>
              {translate('notes')}:
            </Text>
            <Text style={[styles.notesText, isRTL && styles.arabicText]} numberOfLines={2}>
              {invoice.notes}
            </Text>
          </View>
        )}

        <View style={[styles.createdBy, isRTL && styles.rtlCreatedBy]}>
          <Ionicons name="person" size={14} color="#999" />
          <Text style={[styles.createdByText, isRTL && styles.arabicText]}>
            {translate('createdBy')}: {invoice.created_by?.first_name} {invoice.created_by?.last_name}
          </Text>
          <Text style={[styles.createdDate, isRTL && styles.arabicText]}>
            {formatDate(invoice.created_at)}
          </Text>
        </View>
      </View>
    );
  };

  // Show loading if permissions not loaded yet
  if (loading || roleId === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B7D3D" />
        <Text style={[styles.loadingText, isRTL && styles.arabicText]}>
          {translate('loadingPurchaseInvoices')}
        </Text>
      </View>
    );
  }

  // Check if user has access to view purchase invoices at all
  if (!canViewPurchaseInvoices()) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.noAccessContainer}>
          <Ionicons name="lock-closed" size={64} color="#ccc" />
          <Text style={styles.noAccessText}>Access Denied</Text>
          <Text style={styles.noAccessSubtext}>
            You do not have permission to view purchase invoices
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
          <View style={[styles.headerContent, isRTL && styles.rtlHeaderContent]}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
              <Text style={[styles.headerTitle, isRTL && styles.arabicText]}>
                {translate('purchaseInvoices')}
              </Text>
              <Text style={[styles.headerSubtitle, isRTL && styles.arabicText]}>
                {purchaseInvoices.length} {translate('invoices')} • {translate('total')}: {formatCurrency(totals.totalAmount)}
                {roleId === 3 && (
                  <Text style={{ color: '#fff', opacity: 0.8 }}> • Permission Based</Text>
                )}
              </Text>
            </View>
            {canCreatePurchaseInvoices() && (
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate('AddPurchaseInvoice')}
              >
                <Ionicons name="add" size={24} color="#fff" />
              </TouchableOpacity>
            )}
            {!canCreatePurchaseInvoices() && (
              <View style={[styles.addButton, { opacity: 0.3 }]} />
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
              {canViewPurchaseInvoices() && ' View'}
              {canCreatePurchaseInvoices() && ' • Create'}
              {canEditPurchaseInvoices() && ' • Edit'}
              {canDeletePurchaseInvoices() && ' • Delete'}
            </Text>
          </View>
        </View>
      )}

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="receipt" size={24} color="#6B7D3D" />
          <Text style={[styles.statNumber, isRTL && styles.arabicText]}>
            {formatCurrency(totals.totalAmount)}
          </Text>
          <Text style={[styles.statLabel, isRTL && styles.arabicText]}>
            {translate('totalAmount')}
          </Text>
        </View>
        
        <View style={styles.statCard}>
          <Ionicons name="checkmark-circle" size={24} color="#27AE60" />
          <Text style={[styles.statNumber, isRTL && styles.arabicText]}>
            {formatCurrency(totals.paidAmount)}
          </Text>
          <Text style={[styles.statLabel, isRTL && styles.arabicText]}>
            {translate('paidAmount')}
          </Text>
        </View>
        
        <View style={styles.statCard}>
          <Ionicons name="time" size={24} color="#F39C12" />
          <Text style={[styles.statNumber, isRTL && styles.arabicText]}>
            {formatCurrency(totals.pendingAmount)}
          </Text>
          <Text style={[styles.statLabel, isRTL && styles.arabicText]}>
            {translate('pendingAmount')}
          </Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, isRTL && styles.rtlSearchBar]}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={[styles.searchInput, isRTL && styles.arabicText]}
            placeholder={translate('searchPurchaseInvoices')}
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

      {/* Invoice List */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6B7D3D']} />
        }
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const paddingToBottom = 20;
          const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
          if (isCloseToBottom && hasMoreData && !loading && !loadingMore) {
            loadMorePurchaseInvoices();
          }
        }}
        scrollEventThrottle={400}
      >
        {filteredInvoices.length > 0 ? (
          <>
            {filteredInvoices.map(renderInvoiceCard)}
            
            {/* Load More Indicator */}
            {loadingMore && (
              <View style={styles.loadMoreContainer}>
                <ActivityIndicator size="small" color="#6B7D3D" />
                <Text style={styles.loadMoreText}>Loading more invoices...</Text>
              </View>
            )}
            {!hasMoreData && purchaseInvoices.length > 0 && (
              <View style={styles.loadMoreContainer}>
                <Text style={styles.loadMoreText}>No more invoices to load</Text>
              </View>
            )}
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color="#ccc" />
            <Text style={[styles.emptyText, isRTL && styles.arabicText]}>
              {searchQuery ? translate('noPurchaseInvoicesFound') : translate('noPurchaseInvoicesAvailable')}
            </Text>
            <Text style={[styles.emptySubtext, isRTL && styles.arabicText]}>
              {searchQuery ? translate('tryAdjustingSearch') : translate('addFirstPurchaseInvoice')}
            </Text>
            {!searchQuery && (
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => navigation.navigate('AddPurchaseInvoice')}
              >
                <Text style={[styles.emptyButtonText, isRTL && styles.arabicText]}>
                  {translate('addPurchaseInvoice')}
                </Text>
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
    fontSize: 11,
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  invoiceCard: {
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
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  rtlInvoiceHeader: {
    flexDirection: 'row-reverse',
  },
  invoiceInfo: {
    flex: 1,
  },
  invoiceNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  poNumber: {
    fontSize: 14,
    color: '#6B7D3D',
    fontWeight: '600',
    marginBottom: 4,
  },
  supplier: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  invoiceActions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  paymentStatus: {
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
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: 'rgba(107, 125, 61, 0.1)',
  },
  deleteButton: {
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
  },
  invoiceDetails: {
    marginBottom: 15,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rtlDetailRow: {
    flexDirection: 'row-reverse',
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  invoiceMeta: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 15,
    marginBottom: 15,
    gap: 8,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6B7D3D',
  },
  itemsSection: {
    marginBottom: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  itemsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  rtlItemRow: {
    flexDirection: 'row-reverse',
  },
  itemText: {
    fontSize: 13,
    color: '#666',
    flex: 1,
  },
  itemTotal: {
    fontSize: 13,
    color: '#6B7D3D',
    fontWeight: '600',
  },
  moreItems: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 4,
  },
  notesSection: {
    marginBottom: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  notesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  notesText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  createdBy: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  rtlCreatedBy: {
    flexDirection: 'row-reverse',
  },
  createdByText: {
    fontSize: 12,
    color: '#999',
    flex: 1,
  },
  createdDate: {
    fontSize: 12,
    color: '#999',
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
  arabicText: {
    textAlign: 'right',
    fontFamily: 'Arabic',
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

export default PurchaseInvoiceListScreen;