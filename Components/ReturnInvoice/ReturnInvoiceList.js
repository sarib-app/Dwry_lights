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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import languageService from '../Globals/Store/Lang';
import getAuthToken from '../Globals/Store/LocalData';
import getUserRole from '../Globals/Store/GetRoleId';
import simplePermissions from '../Globals/Store/PermissionsDemo';
import commonStyles from '../Globals/CommonStyles';

const API_BASE_URL = 'https://planetdory.dwrylight.com/api';

const ReturnInvoiceListScreen = ({ navigation }) => {
  const [returnInvoices, setReturnInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isRTL, setIsRTL] = useState(false);
  const [roleId, setRoleId] = useState(null);
  const [userPermissions, setUserPermissions] = useState([]);
  
  const translate = (key) => languageService.translate(key);

  useEffect(() => {
    initializeScreen();
    fetchReturnInvoices();
  }, []);

  const initializeScreen = async () => {
    try {
      const role = await getUserRole();
      setRoleId(role);
      if (role === 3) {
        const permissions = await simplePermissions.fetchUserPermissions();
        setUserPermissions(permissions);
      }
      const language = await languageService.loadSavedLanguage();
      setCurrentLanguage(language);
      setIsRTL(language === 'ar');
    } catch (error) {
      console.error('Error initializing permissions:', error);
    }
  };

  const hasReturnInvoicePermission = (type) => {
    if (roleId !== 3) return true;
    const permissionName = `return_invoices.${type}`;
    return userPermissions.some(permission => 
      permission.name === permissionName && permission.module === 'return_invoices'
    );
  };

  const canCreateReturnInvoices = () => hasReturnInvoicePermission('create');
  const canViewReturnInvoices = () => hasReturnInvoicePermission('view') || hasReturnInvoicePermission('management');
  const canApproveReturnInvoices = () => hasReturnInvoicePermission('approve') || hasReturnInvoicePermission('management');

  const fetchReturnInvoices = async () => {
    try {
      const token = await getAuthToken();
      if (!token) {
        Alert.alert(translate('error'), translate('authTokenNotFound'));
        return;
      }

      const requestBody = {
        customer_id: null,
        date_from: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
        date_to: new Date().toISOString().split('T')[0],
        status: filterStatus === 'all' ? null : filterStatus
      };

      const response = await fetch(`${API_BASE_URL}/get_return_invoices`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      const result = await response.json();
      if (result.status === 200) {
        setReturnInvoices(result.data || []);
      } else {
        Alert.alert(translate('error'), result.message || translate('failedToFetchReturnInvoices'));
      }
    } catch (error) {
      console.error('Fetch return invoices error:', error);
      Alert.alert(translate('error'), translate('networkErrorFetchingReturnInvoices'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const approveReturnInvoice = async (invoiceId) => {
    console.log('approveReturnInvoice', invoiceId);
    if (!canApproveReturnInvoices()) {
      Alert.alert(translate('accessDenied'), translate('noPermissionToApproveReturnInvoice'));
      return;
    }

    Alert.alert(
      translate('approveReturnInvoice'),
      translate('confirmApproveReturnInvoice'),
      [
        { text: translate('cancel'), style: 'cancel' },
        {
          text: translate('approve'),
          style: 'default',
          onPress: async () => {
            try {
              const token = await getAuthToken();
              if (!token) return;

              const response = await fetch(`${API_BASE_URL}/approve_return/${invoiceId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
              });
              
              const result = await response.json();
              if (result.status == 200) {
                Alert.alert(translate('success'), translate('returnInvoiceApprovedSuccessfully'));
                fetchReturnInvoices();
              } else {
                Alert.alert(translate('error'), result.message || translate('failedToApproveReturnInvoice'));
              }
            } catch (error) {
              console.error('Approve return invoice error:', error);
              Alert.alert(translate('error'), translate('networkErrorApprovingReturnInvoice'));
            }
          },
        },
      ]
    );
  };

  const filteredReturnInvoices = returnInvoices.filter(invoice => {
    const matchesSearch = 
      invoice.return_invoice_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.original_invoice?.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || invoice.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchReturnInvoices();
  }, [filterStatus]);

  const calculateStats = () => {
    return returnInvoices.reduce((stats, invoice) => {
      const amount = parseFloat(invoice.total_amount) || 0;
      stats.totalReturns += 1;
      stats.totalAmount += amount;
      if (invoice.status === 'approved') {
        stats.approvedReturns += 1;
        stats.approvedAmount += amount;
      } else if (invoice.status === 'pending') {
        stats.pendingReturns += 1;
        stats.pendingAmount += amount;
      }
      return stats;
    }, { 
      totalReturns: 0, approvedReturns: 0, pendingReturns: 0, 
      totalAmount: 0, approvedAmount: 0, pendingAmount: 0 
    });
  };

  const stats = calculateStats();

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US');
  };

  const formatCurrency = (amount) => {
    const number = parseFloat(amount) || 0;
    return isRTL ? `${number.toFixed(2)} ر.س` : `$${number.toFixed(2)}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#27AE60';
      case 'pending': return '#F39C12';
      case 'rejected': return '#E74C3C';
      default: return '#95A5A6';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return 'checkmark-circle';
      case 'pending': return 'time';
      case 'rejected': return 'close-circle';
      default: return 'help-circle';
    }
  };

  const filterOptions = [
    { key: 'all', label: translate('allReturns') },
    { key: 'pending', label: translate('pendingReturns') },
    { key: 'approved', label: translate('approvedReturns') },
  ];

  const renderReturnInvoiceCard = (invoice) => (
    <View key={invoice.return_invoice_number} style={commonStyles.card}>
      <View style={[styles.invoiceHeader, isRTL && commonStyles.rtlRow]}>
        <View style={styles.invoiceInfo}>
          <Text style={[styles.invoiceNumber, isRTL && commonStyles.arabicText]}>
            {invoice.return_invoice_number}
          </Text>
          <Text style={[styles.originalInvoice, isRTL && commonStyles.arabicText]}>
            {translate('originalInvoice')}: {invoice.original_invoice?.invoice_number}
          </Text>
          <Text style={[styles.customerName, isRTL && commonStyles.arabicText]}>
            {translate('customer')}: {isRTL ? invoice.customer?.name_ar : invoice.customer?.name}
          </Text>
        </View>
        
        <View style={[styles.statusContainer, isRTL && commonStyles.rtlRow]}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(invoice.status) }]}>
            <Ionicons name={getStatusIcon(invoice.status)} size={16} color="#fff" />
            <Text style={[styles.statusText, isRTL && commonStyles.arabicText]}>
              {translate(invoice.status)}
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.invoiceDetails, isRTL && styles.rtlInvoiceDetails]}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar" size={16} color="#666" />
          <Text style={[styles.detailText, isRTL && commonStyles.arabicText]}>
            {translate('returnDate')}: {formatDate(invoice.return_date)}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="cube" size={16} color="#666" />
          <Text style={[styles.detailText, isRTL && commonStyles.arabicText]}>
            {translate('items')}: {invoice.items?.length || 0}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="cash" size={16} color="#666" />
          <Text style={[styles.detailText, isRTL && commonStyles.arabicText]}>
            {translate('totalAmount')}: {formatCurrency(invoice.total_amount)}
          </Text>
        </View>
      </View>

      {invoice.items && invoice.items.length > 0 && (
        <View style={styles.itemsSection}>
          <Text style={[styles.itemsTitle, isRTL && commonStyles.arabicText]}>
            {translate('returnedItems')} ({invoice.items.length})
          </Text>
          {invoice.items.slice(0, 2).map((item, index) => (
            <View key={index} style={[styles.itemRow, isRTL && styles.rtlItemRow]}>
              <Text style={[styles.itemText, isRTL && commonStyles.arabicText]}>
                {item.description}: {item.qty} × {formatCurrency(item.price)}
              </Text>
              <Text style={[styles.itemTotal, isRTL && commonStyles.arabicText]}>
                {formatCurrency(item.qty * item.price)}
              </Text>
            </View>
          ))}
          {invoice.items.length > 2 && (
            <Text style={[styles.moreItems, isRTL && commonStyles.arabicText]}>
              +{invoice.items.length - 2} {translate('moreItems')}
            </Text>
          )}
        </View>
      )}

      <View style={[styles.invoiceMeta, isRTL && styles.rtlInvoiceMeta]}>
        <View style={styles.metaRow}>
          <Text style={[styles.metaLabel, isRTL && commonStyles.arabicText]}>
            {translate('subtotal')}:
          </Text>
          <Text style={[styles.metaValue, isRTL && commonStyles.arabicText]}>
            {formatCurrency(invoice.subtotal)}
          </Text>
        </View>
        
        <View style={styles.metaRow}>
          <Text style={[styles.metaLabel, isRTL && commonStyles.arabicText]}>
            {translate('tax')}:
          </Text>
          <Text style={[styles.metaValue, isRTL && commonStyles.arabicText]}>
            {formatCurrency(invoice.tax_amount)}
          </Text>
        </View>
        
        <View style={styles.metaRow}>
          <Text style={[styles.metaLabel, isRTL && commonStyles.arabicText]}>
            {translate('discount')}:
          </Text>
          <Text style={[styles.metaValue, { color: '#E74C3C' }, isRTL && commonStyles.arabicText]}>
            -{formatCurrency(invoice.discount_amount)}
          </Text>
        </View>
        
        <View style={[styles.metaRow, styles.totalRow]}>
          <Text style={[styles.totalLabel, isRTL && commonStyles.arabicText]}>
            {translate('totalAmount')}:
          </Text>
          <Text style={[styles.totalValue, isRTL && commonStyles.arabicText]}>
            {formatCurrency(invoice.total_amount)}
          </Text>
        </View>
      </View>

      <View style={[styles.invoiceActions, isRTL && commonStyles.rtlRow]}>
        <TouchableOpacity
          style={[commonStyles.actionButton, commonStyles.viewButton]}
          onPress={() => navigation.navigate('ReturnInvoiceDetails', { invoice })}
        >
          <Ionicons name="eye" size={16} color="#3498DB" />
          <Text style={[commonStyles.actionButtonText, { color: '#3498DB' }, isRTL && commonStyles.arabicText]}>
            {translate('view')}
          </Text>
        </TouchableOpacity>

        {invoice.status === 'pending' && canApproveReturnInvoices() && (
          <TouchableOpacity
            style={[commonStyles.actionButton, styles.approveButton]}
            onPress={() => console.log('approveReturnInvoice', invoice)}
          >
            <Ionicons name="checkmark" size={16} color="#27AE60" />
            <Text style={[commonStyles.actionButtonText, { color: '#27AE60' }, isRTL && commonStyles.arabicText]}>
              {translate('approve')}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (loading || roleId === null) {
    return (
      <View style={commonStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B7D3D" />
        <Text style={[commonStyles.loadingText, isRTL && commonStyles.arabicText]}>
          {translate('loadingReturnInvoices')}
        </Text>
      </View>
    );
  }

  if (!canViewReturnInvoices()) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={styles.noAccessContainer}>
          <Ionicons name="lock-closed" size={64} color="#ccc" />
          <Text style={styles.noAccessText}>Access Denied</Text>
          <Text style={styles.noAccessSubtext}>
            You do not have permission to view return invoices
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
                {translate('returnInvoices')}
              </Text>
              <Text style={[commonStyles.headerSubtitle, isRTL && commonStyles.arabicText]}>
                {returnInvoices.length} {translate('returnsTotal')} • {translate('total')}: {formatCurrency(stats.totalAmount)}
                {roleId === 3 && (
                  <Text style={{ color: '#fff', opacity: 0.8 }}> • Permission Based</Text>
                )}
              </Text>
            </View>
            {canCreateReturnInvoices() && (
              <TouchableOpacity
                style={commonStyles.addButton}
                onPress={() => navigation.navigate('AddReturnInvoice')}
              >
                <Ionicons name="add" size={24} color="#fff" />
              </TouchableOpacity>
            )}
            {!canCreateReturnInvoices() && (
              <View style={[commonStyles.addButton, { opacity: 0.3 }]} />
            )}
          </View>
        </LinearGradient>
      </View>

      {roleId === 3 && (
        <View style={styles.permissionBar}>
          <View style={styles.permissionInfo}>
            <Ionicons name="information-circle" size={16} color="#6B7D3D" />
            <Text style={styles.permissionText}>
              Your permissions: 
              {canViewReturnInvoices() && ' View'}
              {canCreateReturnInvoices() && ' • Create'}
              {canApproveReturnInvoices() && ' • Approve'}
            </Text>
          </View>
        </View>
      )}

      <View style={commonStyles.statsContainer}>
        <View style={commonStyles.statCard}>
          <Ionicons name="receipt" size={24} color="#6B7D3D" />
          <Text style={[commonStyles.statNumber, isRTL && commonStyles.arabicText]}>
            {stats.totalReturns}
          </Text>
          <Text style={[commonStyles.statLabel, isRTL && commonStyles.arabicText]}>
            {translate('totalReturns')}
          </Text>
        </View>
        <View style={commonStyles.statCard}>
          <Ionicons name="checkmark-circle" size={24} color="#27AE60" />
          <Text style={[commonStyles.statNumber, isRTL && commonStyles.arabicText]}>
            {stats.approvedReturns}
          </Text>
          <Text style={[commonStyles.statLabel, isRTL && commonStyles.arabicText]}>
            {translate('approvedReturns')}
          </Text>
        </View>
        <View style={commonStyles.statCard}>
          <Ionicons name="time" size={24} color="#F39C12" />
          <Text style={[commonStyles.statNumber, isRTL && commonStyles.arabicText]}>
            {stats.pendingReturns}
          </Text>
          <Text style={[commonStyles.statLabel, isRTL && commonStyles.arabicText]}>
            {translate('pendingReturns')}
          </Text>
        </View>
      </View>

      <View style={commonStyles.searchContainer}>
        <View style={[commonStyles.searchBar, isRTL && commonStyles.rtlSearchBar]}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={[commonStyles.searchInput, isRTL && commonStyles.arabicInput]}
            placeholder={translate('searchReturnInvoices')}
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

      <ScrollView
        style={commonStyles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6B7D3D']} />
        }
      >
        {filteredReturnInvoices.length > 0 ? (
          filteredReturnInvoices.map(renderReturnInvoiceCard)
        ) : (
          <View style={commonStyles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color="#ccc" />
            <Text style={[commonStyles.emptyText, isRTL && commonStyles.arabicText]}>
              {searchQuery || filterStatus !== 'all' 
                ? translate('noReturnInvoicesFound') 
                : translate('noReturnInvoicesAvailable')
              }
            </Text>
            <Text style={[commonStyles.emptySubtext, isRTL && commonStyles.arabicText]}>
              {searchQuery || filterStatus !== 'all'
                ? translate('tryAdjustingSearch')
                : translate('addFirstReturnInvoice')
              }
            </Text>
            {!searchQuery && filterStatus === 'all' && canCreateReturnInvoices() && (
              <TouchableOpacity
                style={commonStyles.emptyButton}
                onPress={() => navigation.navigate('AddReturnInvoice')}
              >
                <Text style={[commonStyles.emptyButtonText, isRTL && commonStyles.arabicText]}>
                  {translate('addReturnInvoice')}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showFilterModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <SafeAreaView style={commonStyles.modalContainer}>
          <View style={[commonStyles.modalHeader, isRTL && commonStyles.rtlModalHeader]}>
            <Text style={[commonStyles.modalTitle, isRTL && commonStyles.arabicText]}>
              {translate('filterReturnInvoices')}
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

const styles = StyleSheet.create({
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  invoiceInfo: { flex: 1 },
  invoiceNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  originalInvoice: {
    fontSize: 14,
    color: '#6B7D3D',
    fontWeight: '600',
    marginBottom: 6,
  },
  customerName: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  statusContainer: { alignItems: 'flex-end' },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  invoiceDetails: { marginBottom: 20 },
  rtlInvoiceDetails: { alignItems: 'flex-end' },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    lineHeight: 20,
  },
  itemsSection: {
    marginBottom: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  itemsTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    paddingVertical: 4,
  },
  rtlItemRow: { flexDirection: 'row-reverse' },
  itemText: {
    fontSize: 13,
    color: '#666',
    flex: 1,
    lineHeight: 18,
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
    marginTop: 8,
    textAlign: 'center',
    paddingVertical: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  invoiceMeta: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 20,
    marginBottom: 20,
    gap: 12,
  },
  rtlInvoiceMeta: { alignItems: 'flex-end' },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  metaLabel: { 
    fontSize: 14, 
    color: '#666',
    fontWeight: '500',
  },
  metaValue: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#333' 
  },
  totalRow: {
    borderTopWidth: 2,
    borderTopColor: '#6B7D3D',
    paddingTop: 12,
    marginTop: 12,
  },
  totalLabel: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#333' 
  },
  totalValue: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#6B7D3D' 
  },
  invoiceActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 20,
    gap: 12,
  },
  approveButton: { 
    backgroundColor: 'rgba(39, 174, 96, 0.1)',
    borderWidth: 1,
    borderColor: '#27AE60',
  },
  permissionBar: {
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  permissionInfo: { 
    flexDirection: 'row', 
    alignItems: 'center',
    gap: 8,
  },
  permissionText: {
    fontSize: 14,
    color: '#6B7D3D',
    fontWeight: '500',
    lineHeight: 20,
  },
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ReturnInvoiceListScreen;
