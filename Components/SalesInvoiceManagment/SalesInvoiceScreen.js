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

const SalesInvoiceManagementScreen = ({ navigation }) => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const translate = (key) => languageService.translate(key);

  // Get auth token from AsyncStorage
  const getAuthToken = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        return `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return null;
  };

  // Fetch all sales invoices
  const fetchInvoices = async () => {
    try {
      const token = await getAuthToken();
      if (!token) {
        Alert.alert('Error', 'Authentication token not found');
        return;
      }

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
        Alert.alert('Error', result.message || 'Failed to fetch sales invoices');
      }
    } catch (error) {
      console.error('Fetch invoices error:', error);
      Alert.alert('Error', 'Network error while fetching sales invoices');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Delete sales invoice
  const deleteInvoice = async (invoiceId) => {
    Alert.alert(
      'Delete Sales Invoice',
      'Are you sure you want to delete this invoice?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
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
                Alert.alert('Success', 'Invoice deleted successfully');
                fetchInvoices(); // Refresh the list
              } else {
                Alert.alert('Error', result.message || 'Failed to delete invoice');
              }
            } catch (error) {
              console.error('Delete invoice error:', error);
              Alert.alert('Error', 'Network error while deleting invoice');
            }
          },
        },
      ]
    );
  };

  // Filter invoices based on search query
  const filteredInvoices = invoices.filter(invoice =>
    invoice.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.customer?.name_ar?.includes(searchQuery) ||
    invoice.payment_status?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.payment_method?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchInvoices();
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, []);

  // Calculate stats
  const calculateStats = () => {
    const totalAmount = invoices.reduce((sum, invoice) => sum + parseFloat(invoice.total_amount || 0), 0);
    const paidInvoices = invoices.filter(i => i.payment_status === 'paid').length;
    const pendingAmount = invoices
      .filter(i => i.payment_status !== 'paid')
      .reduce((sum, invoice) => sum + parseFloat(invoice.total_amount || 0), 0);
    
    return {
      totalInvoices: invoices.length,
      totalAmount,
      paidInvoices,
      pendingAmount,
    };
  };

  const stats = calculateStats();

  // Get payment status color
  const getPaymentStatusColor = (status) => {
    const colors = {
      'paid': '#27AE60',
      'pending': '#F39C12',
      'partial': '#3498DB',
      'overdue': '#E74C3C',
    };
    return colors[status] || '#95A5A6';
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Render invoice card
  const renderInvoiceCard = (invoice) => (
    <View key={invoice.id} style={styles.invoiceCard}>
      <View style={styles.invoiceHeader}>
        <View style={styles.invoiceInfo}>
          <View style={styles.invoiceNumberContainer}>
            <Text style={styles.invoiceNumber}>{invoice.invoice_number}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getPaymentStatusColor(invoice.payment_status) }]}>
              <Text style={styles.statusText}>
                {invoice.payment_status?.toUpperCase()}
              </Text>
            </View>
          </View>
          
          <Text style={styles.customerName}>{invoice.customer?.name}</Text>
          {invoice.customer?.name_ar && (
            <Text style={styles.customerNameAr}>{invoice.customer?.name_ar}</Text>
          )}
        </View>
        
        <View style={styles.invoiceActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.viewButton]}
            onPress={() => navigation.navigate('ViewSalesInvoice', { invoice })}
          >
            <Ionicons name="eye" size={16} color="#3498DB" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => navigation.navigate('EditSalesInvoice', { invoice })}
          >
            <Ionicons name="pencil" size={16} color="#6B7D3D" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => deleteInvoice(invoice.id)}
          >
            <Ionicons name="trash" size={16} color="#E74C3C" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.invoiceDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar" size={16} color="#666" />
          <Text style={styles.detailText}>Date: {formatDate(invoice.invoice_date)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="time" size={16} color="#666" />
          <Text style={styles.detailText}>Due: {formatDate(invoice.due_date)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="card" size={16} color="#666" />
          <Text style={styles.detailText}>{invoice.payment_method || 'N/A'}</Text>
        </View>
      </View>

      <View style={styles.itemsSection}>
        <Text style={styles.itemsTitle}>Items ({invoice.items?.length || 0}):</Text>
        {invoice.items?.slice(0, 2).map((item, index) => (
          <View key={index} style={styles.itemRow}>
            <Text style={styles.itemDescription} numberOfLines={1}>
              {item.description || `Item ${item.item_id}`}
            </Text>
            <Text style={styles.itemQty}>Qty: {item.qty}</Text>
            <Text style={styles.itemPrice}>${item.price}</Text>
          </View>
        ))}
        {invoice.items?.length > 2 && (
          <Text style={styles.moreItems}>+{invoice.items.length - 2} more items</Text>
        )}
      </View>

      <View style={styles.financialSection}>
        <View style={styles.financialRow}>
          <Text style={styles.financialLabel}>Subtotal:</Text>
          <Text style={styles.financialValue}>${invoice.subtotal}</Text>
        </View>
        
        {parseFloat(invoice.discount_amount) > 0 && (
          <View style={styles.financialRow}>
            <Text style={styles.financialLabel}>Discount ({invoice.discount_percentage}%):</Text>
            <Text style={[styles.financialValue, styles.discountValue]}>-${invoice.discount_amount}</Text>
          </View>
        )}
        
        <View style={styles.financialRow}>
          <Text style={styles.financialLabel}>Tax ({invoice.tax_percentage}%):</Text>
          <Text style={styles.financialValue}>${invoice.tax_amount}</Text>
        </View>
        
        <View style={[styles.financialRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total Amount:</Text>
          <Text style={styles.totalValue}>${invoice.total_amount}</Text>
        </View>
      </View>

      {invoice.notes && (
        <View style={styles.notesSection}>
          <Text style={styles.notesLabel}>Notes:</Text>
          <Text style={styles.notesText} numberOfLines={2}>{invoice.notes}</Text>
        </View>
      )}

      <View style={styles.metaInfo}>
        <Text style={styles.metaText}>Created by: {invoice.created_by}</Text>
        <Text style={styles.metaText}>Date: {formatDate(invoice.created_at)}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B7D3D" />
        <Text style={styles.loadingText}>Loading invoices...</Text>
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
              <Text style={styles.headerTitle}>Sales Invoices</Text>
              <Text style={styles.headerSubtitle}>
                {stats.totalInvoices} invoices • ${stats.totalAmount.toFixed(0)} total
              </Text>
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('CreateSalesInvoice')}
            >
              <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="receipt" size={20} color="#6B7D3D" />
          <Text style={styles.statNumber}>{stats.totalInvoices}</Text>
          <Text style={styles.statLabel}>Total Invoices</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="checkmark-circle" size={20} color="#27AE60" />
          <Text style={styles.statNumber}>{stats.paidInvoices}</Text>
          <Text style={styles.statLabel}>Paid</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="cash" size={20} color="#3498DB" />
          <Text style={styles.statNumber}>${stats.totalAmount.toFixed(0)}</Text>
          <Text style={styles.statLabel}>Total Revenue</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="time" size={20} color="#F39C12" />
          <Text style={styles.statNumber}>${stats.pendingAmount.toFixed(0)}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search invoices..."
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
            <Text style={styles.emptyText}>
              {searchQuery ? 'No invoices found' : 'No sales invoices available'}
            </Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? 'Try adjusting your search' : 'Create your first sales invoice to get started'}
            </Text>
            {!searchQuery && (
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => navigation.navigate('CreateSalesInvoice')}
              >
                <Text style={styles.emptyButtonText}>Create Invoice</Text>
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
    padding: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 10,
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
  invoiceInfo: {
    flex: 1,
  },
  invoiceNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  invoiceNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginLeft: 10,
  },
  statusText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginBottom: 2,
  },
  customerNameAr: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
  },
  invoiceActions: {
    flexDirection: 'row',
    gap: 6,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
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
  invoiceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  itemsSection: {
    marginBottom: 15,
  },
  itemsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  itemDescription: {
    fontSize: 12,
    color: '#555',
    flex: 2,
  },
  itemQty: {
    fontSize: 12,
    color: '#666',
    flex: 1,
    textAlign: 'center',
  },
  itemPrice: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  moreItems: {
    fontSize: 12,
    color: '#3498DB',
    fontStyle: 'italic',
    marginTop: 4,
  },
  financialSection: {
    backgroundColor: '#f8fafb',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  financialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  financialLabel: {
    fontSize: 14,
    color: '#666',
  },
  financialValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  discountValue: {
    color: '#E74C3C',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
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
  notesSection: {
    marginBottom: 15,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 10,
  },
  metaText: {
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
});

export default SalesInvoiceManagementScreen;