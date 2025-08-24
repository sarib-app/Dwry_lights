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
import getUserRole from '../Globals/Store/GetRoleId';
import simplePermissions from '../Globals/Store/PermissionsDemo';
// import { commonStyles, getStatusColor } from '../shared/CommonStyles';
import commonStyles from '../Globals/CommonStyles';

const API_BASE_URL = 'https://planetdory.dwrylight.com/api';

const PaymentEntryListScreen = ({ navigation }) => {
  const [paymentEntries, setPaymentEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isRTL, setIsRTL] = useState(false);
  const [roleId, setRoleId] = useState(null);
  const [userPermissions, setUserPermissions] = useState([]);
  
  const translate = (key) => languageService.translate(key);

  useEffect(() => {
    initializeScreen();
    fetchPaymentEntries();
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
  const hasPaymentPermission = (type) => {
    // If admin (not role 3), allow everything
    if (roleId !== 3) {
      return true;
    }
    
    // For staff (role 3), check specific permissions
    const permissionName = `payments.${type}`;
    return userPermissions.some(permission => 
      permission.name === permissionName && permission.module === 'payments'
    );
  };

  const canCreatePayments = () => hasPaymentPermission('create');
  const canEditPayments = () => hasPaymentPermission('edit');
  const canDeletePayments = () => hasPaymentPermission('delete');
  const canViewPayments = () => hasPaymentPermission('view') || hasPaymentPermission('management');

  // Fetch all payment entries
  const fetchPaymentEntries = async () => {
    const token = await getAuthToken();
    if (!token) {
      Alert.alert(translate('error'), translate('authTokenNotFound'));
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/fetch_all_payment_entries`, {
        method: 'GET',
        headers: {
          'Authorization': token,
        },
      });
      
      const result = await response.json();
      console.log('Payment Entries API Response:', result);
      
      if (result.status == 200) {
        setPaymentEntries(result.data || []);
      } else {
        Alert.alert(translate('error'), result.message || translate('failedToFetchPaymentEntries'));
      }
    } catch (error) {
      console.error('Fetch payment entries error:', error);
      Alert.alert(translate('error'), translate('networkErrorFetchingPaymentEntries'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Delete payment entry
  const deletePaymentEntry = async (entryId) => {
    // Check delete permission
    if (!canDeletePayments()) {
      Alert.alert(translate('accessDenied'), translate('noPermissionToDeletePayment'));
      return;
    }

    Alert.alert(
      translate('deletePaymentEntry'),
      translate('deletePaymentEntryConfirmation'),
      [
        { text: translate('cancel'), style: 'cancel' },
        {
          text: translate('delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await getAuthToken();
              if (!token) return;

              const response = await fetch(`${API_BASE_URL}/delete_payment_entry/${entryId}`, {
                method: 'POST',
                headers: {
                  'Authorization': token,
                },
              });
              
              const result = await response.json();
              
              if (result.status == 200) {
                Alert.alert(translate('success'), translate('paymentEntryDeletedSuccessfully'));
                fetchPaymentEntries();
              } else {
                Alert.alert(translate('error'), result.message || translate('failedToDeletePaymentEntry'));
              }
            } catch (error) {
              console.error('Delete payment entry error:', error);
              Alert.alert(translate('error'), translate('networkErrorDeletingPaymentEntry'));
            }
          },
        },
      ]
    );
  };

  // Filter payment entries based on search and type
  const filteredPaymentEntries = paymentEntries.filter(entry => {
    const matchesSearch = 
      entry.transaction_reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.bank_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.payment_method?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.recorded_by?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.recorded_by?.last_name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType === 'all' || entry.type === filterType;

    return matchesSearch && matchesType;
  });

  // Refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPaymentEntries();
  }, []);

  // Calculate statistics
  const calculateStats = () => {
    return paymentEntries.reduce((stats, entry) => {
      const amount = parseFloat(entry.amount) || 0;
      stats.totalEntries += 1;
      
      if (entry.type === 'credit') {
        stats.totalCredits += amount;
        stats.creditEntries += 1;
      } else if (entry.type === 'debit') {
        stats.totalDebits += amount;
        stats.debitEntries += 1;
      }
      
      return stats;
    }, { 
      totalEntries: 0, 
      creditEntries: 0, 
      debitEntries: 0, 
      totalCredits: 0, 
      totalDebits: 0 
    });
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

  // Get payment type color
  const getPaymentTypeColor = (type) => {
    switch (type) {
      case 'credit': return '#27AE60';
      case 'debit': return '#E74C3C';
      default: return '#95A5A6';
    }
  };

  // Get payment type icon
  const getPaymentTypeIcon = (paymentType) => {
    switch (paymentType) {
      case 'sales_invoice': return 'receipt';
      case 'purchase_invoice': return 'document-text';
      case 'expense': return 'card';
      default: return 'cash';
    }
  };

  // Render filter options
  const filterOptions = [
    { key: 'all', label: translate('allPayments') },
    { key: 'credit', label: translate('creditPayments') },
    { key: 'debit', label: translate('debitPayments') },
  ];

  // Render payment entry card
  const renderPaymentEntryCard = (entry) => (
    <View key={entry.id} style={commonStyles.card}>
      <View style={[styles.entryHeader, isRTL && commonStyles.rtlRow]}>
        <View style={styles.entryInfo}>
          <View style={[styles.entryTitleRow, isRTL && commonStyles.rtlRow]}>
            <Ionicons 
              name={getPaymentTypeIcon(entry.payment_type)} 
              size={20} 
              color="#6B7D3D" 
              style={styles.entryIcon}
            />
            <Text style={[styles.entryTitle, isRTL && commonStyles.arabicText]}>
              {translate(entry.payment_type)}
            </Text>
          </View>
          <Text style={[styles.bankName, isRTL && commonStyles.arabicText]}>
            {entry.bank_name}
          </Text>
        </View>
        
        <View style={[styles.typeContainer, isRTL && commonStyles.rtlRow]}>
          <View style={[styles.typeBadge, { backgroundColor: getPaymentTypeColor(entry.type) }]}>
            <Ionicons 
              name={entry.type === 'credit' ? 'arrow-down' : 'arrow-up'} 
              size={16} 
              color="#fff" 
            />
            <Text style={[styles.typeText, isRTL && commonStyles.arabicText]}>
              {translate(entry.type)}
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.entryDetails, isRTL && styles.rtlEntryDetails]}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar" size={16} color="#666" />
          <Text style={[styles.detailText, isRTL && commonStyles.arabicText]}>
            {translate('paymentDate')}: {formatDate(entry.payment_date)}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="card" size={16} color="#666" />
          <Text style={[styles.detailText, isRTL && commonStyles.arabicText]}>
            {translate('paymentMethod')}: {entry.payment_method}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="cash" size={16} color="#666" />
          <Text style={[styles.detailText, isRTL && commonStyles.arabicText]}>
            {translate('amount')}: {formatCurrency(entry.amount)}
          </Text>
        </View>

        {entry.transaction_reference && (
          <View style={styles.detailRow}>
            <Ionicons name="finger-print" size={16} color="#666" />
            <Text style={[styles.detailText, isRTL && commonStyles.arabicText]}>
              {translate('transactionRef')}: {entry.transaction_reference}
            </Text>
          </View>
        )}
      </View>

      <View style={[styles.entryMeta, isRTL && styles.rtlEntryMeta]}>
        <View style={styles.metaRow}>
          <Text style={[styles.metaLabel, isRTL && commonStyles.arabicText]}>
            {translate('recordedBy')}:
          </Text>
          <Text style={[styles.metaValue, isRTL && commonStyles.arabicText]}>
            {entry.recorded_by?.first_name} {entry.recorded_by?.last_name}
          </Text>
        </View>

        {entry.notes && (
          <View style={styles.notesRow}>
            <Text style={[styles.notesLabel, isRTL && commonStyles.arabicText]}>
              {translate('notes')}:
            </Text>
            <Text style={[styles.notesText, isRTL && commonStyles.arabicText]} numberOfLines={2}>
              {entry.notes}
            </Text>
          </View>
        )}
      </View>

      <View style={[styles.entryActions, isRTL && commonStyles.rtlRow]}>
        <TouchableOpacity
          style={[commonStyles.actionButton, commonStyles.viewButton]}
          onPress={() => navigation.navigate('PaymentEntryDetails', { entry })}
        >
          <Ionicons name="eye" size={16} color="#3498DB" />
          <Text style={[commonStyles.actionButtonText, { color: '#3498DB' }, isRTL && commonStyles.arabicText]}>
            {translate('view')}
          </Text>
        </TouchableOpacity>

        {canEditPayments() && (
          <TouchableOpacity
            style={[commonStyles.actionButton, commonStyles.editButton]}
            onPress={() => navigation.navigate('EditPaymentEntry', { entry })}
          >
            <Ionicons name="pencil" size={16} color="#6B7D3D" />
            <Text style={[commonStyles.actionButtonText, { color: '#6B7D3D' }, isRTL && commonStyles.arabicText]}>
              {translate('edit')}
            </Text>
          </TouchableOpacity>
        )}

        {canDeletePayments() && (
          <TouchableOpacity
            style={[commonStyles.actionButton, commonStyles.deleteButton]}
            onPress={() => deletePaymentEntry(entry.id)}
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
          {translate('loadingPaymentEntries')}
        </Text>
      </View>
    );
  }

  // Check if user has access to view payments at all
  if (!canViewPayments()) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={styles.noAccessContainer}>
          <Ionicons name="lock-closed" size={64} color="#ccc" />
          <Text style={styles.noAccessText}>Access Denied</Text>
          <Text style={styles.noAccessSubtext}>
            You do not have permission to view payment entries
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
                {translate('paymentEntries')}
              </Text>
              <Text style={[commonStyles.headerSubtitle, isRTL && commonStyles.arabicText]}>
                {paymentEntries.length} {translate('entriesTotal')} • {translate('balance')}: {formatCurrency(stats.totalCredits - stats.totalDebits)}
                {roleId === 3 && (
                  <Text style={{ color: '#fff', opacity: 0.8 }}> • Permission Based</Text>
                )}
              </Text>
            </View>
            {canCreatePayments() && (
              <TouchableOpacity
                style={commonStyles.addButton}
                onPress={() => navigation.navigate('AddPaymentEntry')}
              >
                <Ionicons name="add" size={24} color="#fff" />
              </TouchableOpacity>
            )}
            {!canCreatePayments() && (
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
              {canViewPayments() && ' View'}
              {canCreatePayments() && ' • Create'}
              {canEditPayments() && ' • Edit'}
              {canDeletePayments() && ' • Delete'}
            </Text>
          </View>
        </View>
      )}

      {/* Stats Cards */}
      <View style={commonStyles.statsContainer}>
        <View style={commonStyles.statCard}>
          <Ionicons name="receipt" size={24} color="#6B7D3D" />
          <Text style={[commonStyles.statNumber, isRTL && commonStyles.arabicText]}>
            {stats.totalEntries}
          </Text>
          <Text style={[commonStyles.statLabel, isRTL && commonStyles.arabicText]}>
            {translate('totalEntries')}
          </Text>
        </View>
        <View style={commonStyles.statCard}>
          <Ionicons name="arrow-down-circle" size={24} color="#27AE60" />
          <Text style={[commonStyles.statNumber, isRTL && commonStyles.arabicText]}>
            {formatCurrency(stats.totalCredits)}
          </Text>
          <Text style={[commonStyles.statLabel, isRTL && commonStyles.arabicText]}>
            {translate('totalCredits')}
          </Text>
        </View>
        <View style={commonStyles.statCard}>
          <Ionicons name="arrow-up-circle" size={24} color="#E74C3C" />
          <Text style={[commonStyles.statNumber, isRTL && commonStyles.arabicText]}>
            {formatCurrency(stats.totalDebits)}
          </Text>
          <Text style={[commonStyles.statLabel, isRTL && commonStyles.arabicText]}>
            {translate('totalDebits')}
          </Text>
        </View>
      </View>

      {/* Search and Filter Bar */}
      <View style={commonStyles.searchContainer}>
        <View style={[commonStyles.searchBar, isRTL && commonStyles.rtlSearchBar]}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={[commonStyles.searchInput, isRTL && commonStyles.arabicInput]}
            placeholder={translate('searchPaymentEntries')}
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

      {/* Payment Entries List */}
      <ScrollView
        style={commonStyles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6B7D3D']} />
        }
      >
        {filteredPaymentEntries.length > 0 ? (
          filteredPaymentEntries.map(renderPaymentEntryCard)
        ) : (
          <View style={commonStyles.emptyContainer}>
            <Ionicons name="card-outline" size={64} color="#ccc" />
            <Text style={[commonStyles.emptyText, isRTL && commonStyles.arabicText]}>
              {searchQuery || filterType !== 'all' 
                ? translate('noPaymentEntriesFound') 
                : translate('noPaymentEntriesAvailable')
              }
            </Text>
            <Text style={[commonStyles.emptySubtext, isRTL && commonStyles.arabicText]}>
              {searchQuery || filterType !== 'all'
                ? translate('tryAdjustingSearch')
                : translate('addFirstPaymentEntry')
              }
            </Text>
            {!searchQuery && filterType === 'all' && (
              <TouchableOpacity
                style={commonStyles.emptyButton}
                onPress={() => navigation.navigate('AddPaymentEntry')}
              >
                <Text style={[commonStyles.emptyButtonText, isRTL && commonStyles.arabicText]}>
                  {translate('addPaymentEntry')}
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
              {translate('filterPaymentEntries')}
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
                  filterType === option.key && commonStyles.filterOptionActive
                ]}
                onPress={() => {
                  setFilterType(option.key);
                  setShowFilterModal(false);
                }}
              >
                <Text style={[
                  commonStyles.filterOptionText,
                  filterType === option.key && commonStyles.filterOptionTextActive,
                  isRTL && commonStyles.arabicText
                ]}>
                  {option.label}
                </Text>
                {filterType === option.key && (
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

// Screen-specific styles
const styles = StyleSheet.create({
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  
  entryInfo: {
    flex: 1,
  },
  
  entryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  
  entryIcon: {
    marginRight: 8,
  },
  
  entryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textTransform: 'capitalize',
  },
  
  bankName: {
    fontSize: 14,
    color: '#666',
  },
  
  typeContainer: {
    alignItems: 'flex-end',
  },
  
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
    gap: 4,
  },
  
  typeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  
  entryDetails: {
    marginBottom: 15,
  },
  
  rtlEntryDetails: {
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
  
  entryMeta: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 15,
    marginBottom: 15,
  },
  
  rtlEntryMeta: {
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
  
  entryActions: {
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
});

export default PaymentEntryListScreen;