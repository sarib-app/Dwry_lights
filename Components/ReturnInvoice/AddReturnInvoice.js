import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
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
import commonStyles from '../Globals/CommonStyles';

const API_BASE_URL = 'https://planetdory.dwrylight.com/api';

const AddReturnInvoiceScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isRTL, setIsRTL] = useState(false);
  const [roleId, setRoleId] = useState(null);
  const [userPermissions, setUserPermissions] = useState([]);

  // Form state
  const [saleInvoiceId, setSaleInvoiceId] = useState('');
  const [returnNumber, setReturnNumber] = useState('');
  const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [notes, setNotes] = useState('');

  // Modal states
  const [showSaleInvoiceModal, setShowSaleInvoiceModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [saleInvoices, setSaleInvoices] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);

  const translate = (key) => languageService.translate(key);

  useEffect(() => {
    initializeScreen();
    fetchSaleInvoices();
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

  const fetchSaleInvoices = async () => {
    try {
      const token = await getAuthToken();
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/fetch_all_sale_invoices`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      const result = await response.json();
      if (result.status === 200) {
        setSaleInvoices(result.data || []);
      }
    } catch (error) {
      console.error('Fetch sale invoices error:', error);
    }
  };

  const fetchAvailableItems = async () => {
    try {
      const token = await getAuthToken();
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/fetch_all_items`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      const result = await response.json();
      if (result.status === 200) {
        setAvailableItems(result.data || []);
      }
    } catch (error) {
      console.error('Fetch items error:', error);
    }
  };

  const addItem = () => {
    if (!saleInvoiceId) {
      Alert.alert(translate('error'), translate('pleaseSelectSaleInvoiceFirst'));
      return;
    }
    fetchAvailableItems();
    setShowItemModal(true);
  };

  const handleAddItem = (item) => {
    const newItem = {
      item_id: item.id,
      description: item.name,
      qty: 1,
      price: parseFloat(item.selling_price) || 0,
      cost_to_company: parseFloat(item.cost_price) || 0
    };

    setItems([...items, newItem]);
    calculateTotals([...items, newItem]);
    setShowItemModal(false);
  };

  const removeItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    calculateTotals(newItems);
  };

  const updateItemQuantity = (index, qty) => {
    const newItems = [...items];
    newItems[index].qty = parseInt(qty) || 0;
    setItems(newItems);
    calculateTotals(newItems);
  };

  const updateItemPrice = (index, price) => {
    const newItems = [...items];
    newItems[index].price = parseFloat(price) || 0;
    setItems(newItems);
    calculateTotals(newItems);
  };

  const calculateTotals = (currentItems) => {
    const subtotal = currentItems.reduce((sum, item) => sum + (item.qty * item.price), 0);
    const tax = subtotal * 0.15; // 15% tax
    const total = subtotal + tax;

    setSubtotal(subtotal);
    setTaxAmount(tax);
    setTotalAmount(total);
  };

  const generateReturnNumber = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    setReturnNumber(`RET-${timestamp}-${random}`);
  };

  const handleSubmit = async () => {
    if (!canCreateReturnInvoices()) {
      Alert.alert(translate('accessDenied'), translate('noPermissionToCreateReturnInvoice'));
      return;
    }

    if (!saleInvoiceId) {
      Alert.alert(translate('error'), translate('pleaseSelectSaleInvoice'));
      return;
    }

    if (items.length === 0) {
      Alert.alert(translate('error'), translate('pleaseAddAtLeastOneItem'));
      return;
    }

    if (!returnNumber) {
      Alert.alert(translate('error'), translate('pleaseEnterReturnNumber'));
      return;
    }

    setLoading(true);
    try {
      const token = await getAuthToken();
      if (!token) {
        Alert.alert(translate('error'), translate('authTokenNotFound'));
        return;
      }

      const requestBody = {
        sale_invoice_id: parseInt(saleInvoiceId),
        return_number: returnNumber,
        return_date: returnDate,
        items: items,
        subtotal: subtotal,
        tax_amount: taxAmount,
        discount_amount: discountAmount,
        total_amount: totalAmount,
        notes: notes
      };

      const response = await fetch(`${API_BASE_URL}/return_sale_invoice`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      const result = await response.json();
      
      if (result.status === 200) {
        Alert.alert(
          translate('success'),
          translate('returnInvoiceCreatedSuccessfully'),
          [
            {
              text: translate('ok'),
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        Alert.alert(translate('error'), result.message || translate('failedToCreateReturnInvoice'));
      }
    } catch (error) {
      console.error('Create return invoice error:', error);
      Alert.alert(translate('error'), translate('networkErrorCreatingReturnInvoice'));
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    const number = parseFloat(amount) || 0;
    return isRTL ? `${number.toFixed(2)} ر.س` : `$${number.toFixed(2)}`;
  };

  if (!canCreateReturnInvoices()) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={styles.noAccessContainer}>
          <Ionicons name="lock-closed" size={64} color="#ccc" />
          <Text style={styles.noAccessText}>Access Denied</Text>
          <Text style={styles.noAccessSubtext}>
            You do not have permission to create return invoices
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
                {translate('addReturnInvoice')}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      <ScrollView style={commonStyles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          {/* Sale Invoice Selection */}
          <View style={styles.formSection}>
            <Text style={[styles.sectionTitle, isRTL && commonStyles.arabicText]}>
              {translate('selectSaleInvoice')}
            </Text>
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => setShowSaleInvoiceModal(true)}
            >
              <Text style={[styles.selectButtonText, isRTL && commonStyles.arabicText]}>
                {saleInvoiceId ? `Invoice #${saleInvoiceId}` : translate('selectSaleInvoice')}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Return Details */}
          <View style={styles.formSection}>
            <Text style={[styles.sectionTitle, isRTL && commonStyles.arabicText]}>
              {translate('returnDetails')}
            </Text>
            
            <View style={styles.inputRow}>
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, isRTL && commonStyles.arabicText]}>
                  {translate('returnNumber')}
                </Text>
                <View style={styles.inputWithButton}>
                  <TextInput
                    style={[styles.textInput, isRTL && commonStyles.arabicText]}
                    value={returnNumber}
                    onChangeText={setReturnNumber}
                    placeholder={translate('enterReturnNumber')}
                    placeholderTextColor="#999"
                  />
                  <TouchableOpacity style={styles.generateButton} onPress={generateReturnNumber}>
                    <Ionicons name="refresh" size={16} color="#6B7D3D" />
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, isRTL && commonStyles.arabicText]}>
                  {translate('returnDate')}
                </Text>
                <TextInput
                  style={[styles.textInput, isRTL && commonStyles.arabicText]}
                  value={returnDate}
                  onChangeText={setReturnDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#999"
                />
              </View>
            </View>
          </View>

          {/* Items Section */}
          <View style={styles.formSection}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, isRTL && commonStyles.arabicText]}>
                {translate('returnedItems')}
              </Text>
              <TouchableOpacity style={styles.addItemButton} onPress={addItem}>
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.addItemButtonText}>{translate('addItem')}</Text>
              </TouchableOpacity>
            </View>

            {items.length > 0 ? (
              items.map((item, index) => (
                <View key={index} style={styles.itemCard}>
                  <View style={styles.itemHeader}>
                    <Text style={[styles.itemName, isRTL && commonStyles.arabicText]}>
                      {item.description}
                    </Text>
                    <TouchableOpacity onPress={() => removeItem(index)}>
                      <Ionicons name="close-circle" size={20} color="#E74C3C" />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.itemInputs}>
                    <View style={styles.inputContainer}>
                      <Text style={[styles.inputLabel, isRTL && commonStyles.arabicText]}>
                        {translate('quantity')}
                      </Text>
                      <TextInput
                        style={[styles.textInput, styles.quantityInput, isRTL && commonStyles.arabicText]}
                        value={item.qty.toString()}
                        onChangeText={(text) => updateItemQuantity(index, text)}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor="#999"
                      />
                    </View>
                    
                    <View style={styles.inputContainer}>
                      <Text style={[styles.inputLabel, isRTL && commonStyles.arabicText]}>
                        {translate('price')}
                      </Text>
                      <TextInput
                        style={[styles.textInput, styles.priceInput, isRTL && commonStyles.arabicText]}
                        value={item.price.toString()}
                        onChangeText={(text) => updateItemPrice(index, text)}
                        keyboardType="numeric"
                        placeholder="0.00"
                        placeholderTextColor="#999"
                      />
                    </View>
                    
                    <View style={styles.inputContainer}>
                      <Text style={[styles.inputLabel, isRTL && commonStyles.arabicText]}>
                        {translate('total')}
                      </Text>
                      <Text style={[styles.itemTotal, isRTL && commonStyles.arabicText]}>
                        {formatCurrency(item.qty * item.price)}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyItems}>
                <Ionicons name="cube-outline" size={48} color="#ccc" />
                <Text style={[styles.emptyItemsText, isRTL && commonStyles.arabicText]}>
                  {translate('noItemsAdded')}
                </Text>
              </View>
            )}
          </View>

          {/* Totals Section */}
          <View style={styles.formSection}>
            <Text style={[styles.sectionTitle, isRTL && commonStyles.arabicText]}>
              {translate('totals')}
            </Text>
            
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, isRTL && commonStyles.arabicText]}>
                {translate('subtotal')}:
              </Text>
              <Text style={[styles.totalValue, isRTL && commonStyles.arabicText]}>
                {formatCurrency(subtotal)}
              </Text>
            </View>
            
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, isRTL && commonStyles.arabicText]}>
                {translate('tax')} (15%):
              </Text>
              <Text style={[styles.totalValue, isRTL && commonStyles.arabicText]}>
                {formatCurrency(taxAmount)}
              </Text>
            </View>
            
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, isRTL && commonStyles.arabicText]}>
                {translate('discount')}:
              </Text>
              <Text style={[styles.totalValue, isRTL && commonStyles.arabicText]}>
                -{formatCurrency(discountAmount)}
              </Text>
            </View>
            
            <View style={[styles.totalRow, styles.grandTotal]}>
              <Text style={[styles.grandTotalLabel, isRTL && commonStyles.arabicText]}>
                {translate('totalAmount')}:
              </Text>
              <Text style={[styles.grandTotalValue, isRTL && commonStyles.arabicText]}>
                {formatCurrency(totalAmount)}
              </Text>
            </View>
          </View>

          {/* Notes Section */}
          <View style={styles.formSection}>
            <Text style={[styles.sectionTitle, isRTL && commonStyles.arabicText]}>
              {translate('notes')}
            </Text>
            <TextInput
              style={[styles.textArea, isRTL && commonStyles.arabicText]}
              value={notes}
              onChangeText={setNotes}
              placeholder={translate('enterNotes')}
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark" size={20} color="#fff" />
                <Text style={styles.submitButtonText}>{translate('createReturnInvoice')}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Sale Invoice Selection Modal */}
      <Modal
        visible={showSaleInvoiceModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSaleInvoiceModal(false)}
      >
        <SafeAreaView style={commonStyles.modalContainer}>
          <View style={[commonStyles.modalHeader, isRTL && commonStyles.rtlModalHeader]}>
            <Text style={[commonStyles.modalTitle, isRTL && commonStyles.arabicText]}>
              {translate('selectSaleInvoice')}
            </Text>
            <TouchableOpacity
              style={commonStyles.modalCloseButton}
              onPress={() => setShowSaleInvoiceModal(false)}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={saleInvoices}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.invoiceOption}
                onPress={() => {
                  setSaleInvoiceId(item.id);
                  setShowSaleInvoiceModal(false);
                }}
              >
                <Text style={[styles.invoiceOptionText, isRTL && commonStyles.arabicText]}>
                  {translate('invoice')} #{item.invoice_number}
                </Text>
                <Text style={[styles.invoiceOptionSubtext, isRTL && commonStyles.arabicText]}>
                  {item.customer?.name} • {formatCurrency(item.total_amount)}
                </Text>
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>

      {/* Item Selection Modal */}
      <Modal
        visible={showItemModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowItemModal(false)}
      >
        <SafeAreaView style={commonStyles.modalContainer}>
          <View style={[commonStyles.modalHeader, isRTL && commonStyles.rtlModalHeader]}>
            <Text style={[commonStyles.modalTitle, isRTL && commonStyles.arabicText]}>
              {translate('selectItem')}
            </Text>
            <TouchableOpacity
              style={commonStyles.modalCloseButton}
              onPress={() => setShowItemModal(false)}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={availableItems}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.itemOption}
                onPress={() => handleAddItem(item)}
              >
                <Text style={[styles.itemOptionText, isRTL && commonStyles.arabicText]}>
                  {item.name}
                </Text>
                <Text style={[styles.itemOptionSubtext, isRTL && commonStyles.arabicText]}>
                  {translate('price')}: {formatCurrency(item.selling_price)}
                </Text>
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    padding: 20,
  },
  formSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#6B7D3D',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  selectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    padding: 16,
    minHeight: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  selectButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 16,
  },
  inputContainer: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputWithButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
    minHeight: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  quantityInput: {
    flex: 1,
  },
  priceInput: {
    flex: 1,
  },
  generateButton: {
    backgroundColor: '#6B7D3D',
    padding: 16,
    borderRadius: 12,
    marginLeft: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  addItemButton: {
    backgroundColor: '#6B7D3D',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  addItemButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyItems: {
    alignItems: 'center',
    paddingVertical: 60,
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderStyle: 'dashed',
  },
  emptyItemsText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
    fontWeight: '500',
  },
  itemCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  itemInputs: {
    flexDirection: 'row',
    gap: 16,
  },
  itemTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6B7D3D',
    textAlign: 'center',
    paddingTop: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingVertical: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  totalLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  grandTotal: {
    borderTopWidth: 2,
    borderTopColor: '#6B7D3D',
    paddingTop: 20,
    marginTop: 16,
  },
  grandTotalLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  grandTotalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6B7D3D',
  },
  textArea: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
    minHeight: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#6B7D3D',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 12,
    marginTop: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  invoiceOption: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  invoiceOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  invoiceOptionSubtext: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  itemOption: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  itemOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  itemOptionSubtext: {
    fontSize: 14,
    color: '#666',
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

export default AddReturnInvoiceScreen;
