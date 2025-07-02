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

const API_BASE_URL = 'https://planetdory.dwrylight.com/api';

const SalesInvoiceListScreen = ({ navigation }) => {
  const [invoices, setInvoices] = useState([]);
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
    fetchInvoices();
  }, []);

  const initializeScreen = async () => {
    const language = await languageService.loadSavedLanguage();
    setCurrentLanguage(language);
    setIsRTL(language === 'ar');
  };

  // Fetch all invoices
  const fetchInvoices = async () => {
    const token = await getAuthToken();
    if (!token) {
      Alert.alert(translate('error'), translate('authTokenNotFound'));
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/fetch_all_sale_invoices`, {
        method: 'GET',
        headers: {
          'Authorization': token,
        },
      });
      
      const result = await response.json();
      console.log('Sales Invoices API Response:', result);
      
      if (result.status == 200) {
        setInvoices(result.data || []);
      } else {
        Alert.alert(translate('error'), result.message || translate('failedToFetchInvoices'));
      }
    } catch (error) {
      console.error('Fetch invoices error:', error);
      Alert.alert(translate('error'), translate('networkErrorFetchingInvoices'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Delete invoice
  const deleteInvoice = async (invoiceId) => {
    Alert.alert(
      translate('deleteInvoice'),
      translate('deleteInvoiceConfirmation'),
      [
        { text: translate('cancel'), style: 'cancel' },
        {
          text: translate('delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await getAuthToken();
              if (!token) return;

              const response = await fetch(`${API_BASE_URL}/delete_sale_invoice_by_id/${invoiceId}`, {
                method: 'POST',
                headers: {
                  'Authorization': token,
                },
              });
              
              const result = await response.json();
              
              if (result.status == 200) {
                Alert.alert(translate('success'), translate('invoiceDeletedSuccessfully'));
                fetchInvoices();
              } else {
                Alert.alert(translate('error'), result.message || translate('failedToDeleteInvoice'));
              }
            } catch (error) {
              console.error('Delete invoice error:', error);
              Alert.alert(translate('error'), translate('networkErrorDeletingInvoice'));
            }
          },
        },
      ]
    );
  };

  // Filter invoices based on search and status
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.customer?.name_ar?.includes(searchQuery) ||
      invoice.created_by?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === 'all' || invoice.payment_status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchInvoices();
  }, []);

  // Calculate statistics
  const calculateStats = () => {
    return invoices.reduce((stats, invoice) => {
      stats.totalAmount += parseFloat(invoice.total_amount) || 0;
      stats.totalInvoices += 1;
      if (invoice.payment_status === 'paid') stats.paidInvoices += 1;
      if (invoice.payment_status === 'pending') stats.pendingInvoices += 1;
      return stats;
    }, { totalAmount: 0, totalInvoices: 0, paidInvoices: 0, pendingInvoices: 0 });
  };

  const stats = calculateStats();

  // Get payment status color
  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid': return '#27AE60';
      case 'pending': return '#F39C12';
      case 'overdue': return '#E74C3C';
      default: return '#95A5A6';
    }
  };

  // Format date
  const formatDate = (dateString) => {
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
    { key: 'all', label: translate('allInvoices') },
    { key: 'paid', label: translate('paidInvoices') },
    { key: 'pending', label: translate('pendingInvoices') },
    { key: 'overdue', label: translate('overdueInvoices') },
  ];

  // Render invoice card
  const renderInvoiceCard = (invoice) => (
    <View key={invoice.id} style={styles.invoiceCard}>
      <View style={[styles.invoiceHeader, isRTL && styles.rtlInvoiceHeader]}>
        <View style={styles.invoiceInfo}>
          <Text style={[styles.invoiceNumber, isRTL && styles.arabicText]}>
            {invoice.invoice_number}
          </Text>
          <Text style={[styles.customerName, isRTL && styles.arabicText]}>
            {isRTL ? invoice.customer?.name_ar || invoice.customer?.name : invoice.customer?.name}
          </Text>
        </View>
        
        <View style={[styles.invoiceActions, isRTL && styles.rtlInvoiceActions]}>
          <View style={[styles.paymentStatus, { backgroundColor: getPaymentStatusColor(invoice.payment_status) }]}>
            <Text style={styles.paymentStatusText}>
              {translate(invoice.payment_status)}
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.invoiceDetails, isRTL && styles.rtlInvoiceDetails]}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar" size={16} color="#666" />
          <Text style={[styles.detailText, isRTL && styles.arabicText]}>
            {translate('invoiceDate')}: {formatDate(invoice.invoice_date)}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="time" size={16} color="#666" />
          <Text style={[styles.detailText, isRTL && styles.arabicText]}>
            {translate('dueDate')}: {formatDate(invoice.due_date)}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="cash" size={16} color="#666" />
          <Text style={[styles.detailText, isRTL && styles.arabicText]}>
            {translate('totalAmount')}: {formatCurrency(invoice.total_amount)}
          </Text>
        </View>
      </View>

      <View style={[styles.invoiceMeta, isRTL && styles.rtlInvoiceMeta]}>
        <View style={styles.metaRow}>
          <Text style={[styles.metaLabel, isRTL && styles.arabicText]}>
            {translate('paymentMethod')}:
          </Text>
          <Text style={[styles.metaValue, isRTL && styles.arabicText]}>
            {invoice.payment_method}
          </Text>
        </View>
        
        <View style={styles.metaRow}>
          <Text style={[styles.metaLabel, isRTL && styles.arabicText]}>
            {translate('itemsCount')}:
          </Text>
          <Text style={[styles.metaValue, isRTL && styles.arabicText]}>
            {invoice.items?.length || 0}
          </Text>
        </View>

        {invoice.notes && (
          <View style={styles.notesRow}>
            <Text style={[styles.notesLabel, isRTL && styles.arabicText]}>
              {translate('notes')}:
            </Text>
            <Text style={[styles.notesText, isRTL && styles.arabicText]} numberOfLines={2}>
              {invoice.notes}
            </Text>
          </View>
        )}
      </View>

      <View style={[styles.invoiceActions, isRTL && styles.rtlInvoiceActions]}>
        <TouchableOpacity
          style={[styles.actionButton, styles.viewButton]}
          onPress={() => navigation.navigate('InvoiceDetails', { invoice })}
        >
          <Ionicons name="eye" size={16} color="#3498DB" />
          <Text style={[styles.actionButtonText, { color: '#3498DB' }, isRTL && styles.arabicText]}>
            {translate('view')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => navigation.navigate('EditSalesInvoice', { invoice })}
        >
          <Ionicons name="pencil" size={16} color="#6B7D3D" />
          <Text style={[styles.actionButtonText, { color: '#6B7D3D' }, isRTL && styles.arabicText]}>
            {translate('edit')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => deleteInvoice(invoice.id)}
        >
          <Ionicons name="trash" size={16} color="#E74C3C" />
          <Text style={[styles.actionButtonText, { color: '#E74C3C' }, isRTL && styles.arabicText]}>
            {translate('delete')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B7D3D" />
        <Text style={[styles.loadingText, isRTL && styles.arabicText]}>
          {translate('loadingInvoices')}
        </Text>
      </View>
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
                {translate('salesInvoices')}
              </Text>
              <Text style={[styles.headerSubtitle, isRTL && styles.arabicText]}>
                {invoices.length} {translate('invoicesTotal')} • {formatCurrency(stats.totalAmount)}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('AddSalesInvoice')}
            >
              <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="receipt" size={24} color="#6B7D3D" />
          <Text style={[styles.statNumber, isRTL && styles.arabicText]}>
            {stats.totalInvoices}
          </Text>
          <Text style={[styles.statLabel, isRTL && styles.arabicText]}>
            {translate('totalInvoices')}
          </Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="checkmark-circle" size={24} color="#27AE60" />
          <Text style={[styles.statNumber, isRTL && styles.arabicText]}>
            {stats.paidInvoices}
          </Text>
          <Text style={[styles.statLabel, isRTL && styles.arabicText]}>
            {translate('paidInvoices')}
          </Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="time" size={24} color="#F39C12" />
          <Text style={[styles.statNumber, isRTL && styles.arabicText]}>
            {stats.pendingInvoices}
          </Text>
          <Text style={[styles.statLabel, isRTL && styles.arabicText]}>
            {translate('pendingInvoices')}
          </Text>
        </View>
      </View>

      {/* Search and Filter Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, isRTL && styles.rtlSearchBar]}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={[styles.searchInput, isRTL && styles.arabicInput]}
            placeholder={translate('searchInvoices')}
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
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Ionicons name="filter" size={20} color="#6B7D3D" />
          <Text style={[styles.filterButtonText, isRTL && styles.arabicText]}>
            {translate('filter')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Invoices List */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6B7D3D']} />
        }
      >
        {filteredInvoices.length > 0 ? (
          filteredInvoices.map(renderInvoiceCard)
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color="#ccc" />
            <Text style={[styles.emptyText, isRTL && styles.arabicText]}>
              {searchQuery || filterStatus !== 'all' 
                ? translate('noInvoicesFound') 
                : translate('noInvoicesAvailable')
              }
            </Text>
            <Text style={[styles.emptySubtext, isRTL && styles.arabicText]}>
              {searchQuery || filterStatus !== 'all'
                ? translate('tryAdjustingSearch')
                : translate('addFirstInvoice')
              }
            </Text>
            {!searchQuery && filterStatus === 'all' && (
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => navigation.navigate('AddSalesInvoice')}
              >
                <Text style={[styles.emptyButtonText, isRTL && styles.arabicText]}>
                  {translate('addInvoice')}
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
        <SafeAreaView style={styles.modalContainer}>
          <View style={[styles.modalHeader, isRTL && styles.rtlModalHeader]}>
            <Text style={[styles.modalTitle, isRTL && styles.arabicText]}>
              {translate('filterInvoices')}
            </Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowFilterModal(false)}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.filterOptions}>
            {filterOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.filterOption,
                  filterStatus === option.key && styles.filterOptionActive
                ]}
                onPress={() => {
                  setFilterStatus(option.key);
                  setShowFilterModal(false);
                }}
              >
                <Text style={[
                  styles.filterOptionText,
                  filterStatus === option.key && styles.filterOptionTextActive,
                  isRTL && styles.arabicText
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
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 10,
  },
  searchBar: {
    flex: 1,
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
  arabicInput: {
    marginLeft: 0,
    marginRight: 10,
    textAlign: 'right',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(107, 125, 61, 0.1)',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 5,
  },
  filterButtonText: {
    fontSize: 14,
    color: '#6B7D3D',
    fontWeight: '600',
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
  customerName: {
    fontSize: 16,
    color: '#666',
  },
  paymentStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignItems: 'center',
  },
  paymentStatusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  invoiceDetails: {
    marginBottom: 15,
  },
  rtlInvoiceDetails: {
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
  invoiceMeta: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 15,
    marginBottom: 15,
  },
  rtlInvoiceMeta: {
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
  invoiceActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 15,
  },
  rtlInvoiceActions: {
    flexDirection: 'row-reverse',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 5,
  },
  viewButton: {
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
  },
  editButton: {
    backgroundColor: 'rgba(107, 125, 61, 0.1)',
  },
  deleteButton: {
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
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
  
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8fafb',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  rtlModalHeader: {
    flexDirection: 'row-reverse',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterOptions: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  filterOptionActive: {
    backgroundColor: 'rgba(107, 125, 61, 0.1)',
    borderWidth: 1,
    borderColor: '#6B7D3D',
  },
  filterOptionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  filterOptionTextActive: {
    color: '#6B7D3D',
    fontWeight: '600',
  },
  
  // RTL Support
  arabicText: {
    textAlign: 'right',
    fontFamily: 'Arabic',
  },
});

export default SalesInvoiceListScreen;