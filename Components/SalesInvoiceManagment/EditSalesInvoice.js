import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import languageService from '../Globals/Store/Lang';
import getAuthToken from '../Globals/Store/LocalData';

const API_BASE_URL = 'https://planetdory.dwrylight.com/api';

const EditSalesInvoiceScreen = ({ navigation, route }) => {
  const { invoice } = route.params;
  
  const [formData, setFormData] = useState({
    customer_id: invoice.customer?.id || '',
    invoice_number: invoice.invoice_number || '',
    invoice_date: invoice.invoice_date || new Date().toISOString().split('T')[0],
    due_date: invoice.due_date || '',
    items: invoice.items || [],
    subtotal: parseFloat(invoice.subtotal || 0),
    tax_percentage: parseFloat(invoice.tax_percentage || 15),
    tax_amount: parseFloat(invoice.tax_amount || 0),
    discount_percentage: parseFloat(invoice.discount_percentage || 0),
    discount_amount: parseFloat(invoice.discount_amount || 0),
    total_amount: parseFloat(invoice.total_amount || 0),
    payment_status: invoice.payment_status || 'pending',
    payment_method: invoice.payment_method || 'Cash',
    notes: invoice.notes || '',
    created_by: invoice.created_by || 1
  });

  const [customers, setCustomers] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [showCustomerPicker, setShowCustomerPicker] = useState(false);
  const [showItemPicker, setShowItemPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerType, setDatePickerType] = useState('invoice');
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isRTL, setIsRTL] = useState(false);

  const translate = (key) => languageService.translate(key);

  const paymentMethods = ['Cash', 'Card', 'Bank Transfer', 'Check'];
  const paymentStatuses = ['pending', 'paid', 'overdue'];

  useEffect(() => {
    initializeScreen();
    fetchInitialData();
  }, []);

  const initializeScreen = async () => {
    const language = await languageService.loadSavedLanguage();
    setCurrentLanguage(language);
    setIsRTL(language === 'ar');
  };

  const fetchInitialData = async () => {
    await Promise.all([fetchCustomers(), fetchItems()]);
    setLoadingData(false);
  };

  // Fetch customers
  const fetchCustomers = async () => {
    const token = await getAuthToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/fetch_all_customers`, {
        method: 'GET',
        headers: { 'Authorization': token },
      });
      
      const result = await response.json();
      if (result.status == 200) {
        setCustomers(result.data || []);
      }
    } catch (error) {
      console.error('Fetch customers error:', error);
    }
  };

  // Fetch items
  const fetchItems = async () => {
    const token = await getAuthToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/fetch_all_items`, {
        method: 'GET',
        headers: { 'Authorization': token },
      });
      
      const result = await response.json();
      if (result.status == 200) {
        setAvailableItems(result.data || []);
      }
    } catch (error) {
      console.error('Fetch items error:', error);
    }
  };

  // Handle input change
  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Auto-calculate when financial fields change
      if (['tax_percentage', 'discount_percentage', 'discount_amount'].includes(field)) {
        calculateTotals(newData);
      }
      
      return newData;
    });
  };

  // Calculate totals
  const calculateTotals = (data = formData) => {
    const subtotal = data.items.reduce((sum, item) => sum + (item.qty * item.price), 0);
    const taxAmount = (subtotal * parseFloat(data.tax_percentage || 0)) / 100;
    const discountAmount = data.discount_amount || ((subtotal * parseFloat(data.discount_percentage || 0)) / 100);
    const totalAmount = subtotal + taxAmount - discountAmount;

    setFormData(prev => ({
      ...prev,
      subtotal: subtotal.toFixed(2),
      tax_amount: taxAmount.toFixed(2),
      discount_amount: discountAmount.toFixed(2),
      total_amount: totalAmount.toFixed(2)
    }));
  };

  // Handle customer selection
  const handleCustomerSelect = (customer) => {
    setFormData(prev => ({ ...prev, customer_id: customer.id }));
    setShowCustomerPicker(false);
  };

  // Handle item selection
  const handleItemSelect = (item) => {
    const newItem = {
      item_id: item.id,
      description: item.name,
      qty: 1,
      price: parseFloat(item.amount || 0)
    };
    
    setFormData(prev => {
      const newData = { ...prev, items: [...prev.items, newItem] };
      calculateTotals(newData);
      return newData;
    });
    setShowItemPicker(false);
  };

  // Update item in list
  const updateItem = (index, field, value) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: field === 'qty' || field === 'price' ? parseFloat(value) || 0 : value };
      const newData = { ...prev, items: newItems };
      calculateTotals(newData);
      return newData;
    });
  };

  // Remove item from list
  const removeItem = (index) => {
    setFormData(prev => {
      const newItems = prev.items.filter((_, i) => i !== index);
      const newData = { ...prev, items: newItems };
      calculateTotals(newData);
      return newData;
    });
  };

  // Handle date selection
  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const dateString = selectedDate.toISOString().split('T')[0];
      setFormData(prev => ({
        ...prev,
        [datePickerType === 'invoice' ? 'invoice_date' : 'due_date']: dateString
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    if (!formData.customer_id) {
      Alert.alert(translate('validationError'), translate('customerRequired'));
      return false;
    }
    if (!formData.invoice_number.trim()) {
      Alert.alert(translate('validationError'), translate('invoiceNumberRequired'));
      return false;
    }
    if (!formData.due_date) {
      Alert.alert(translate('validationError'), translate('dueDateRequired'));
      return false;
    }
    if (formData.items.length === 0) {
      Alert.alert(translate('validationError'), translate('itemsRequired'));
      return false;
    }
    return true;
  };

  // Submit form
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      const token = await getAuthToken();
      if (!token) {
        Alert.alert(translate('error'), translate('authTokenNotFound'));
        return;
      }

      const payload = {
        invoice_number: formData.invoice_number,
        payment_status: formData.payment_status,
        total_amount: parseFloat(formData.total_amount),
        items: formData.items,
        created_by: formData.created_by
      };

      const response = await fetch(`${API_BASE_URL}/update_sale_invoice_by_id/${invoice.id}`, {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log('Update invoice response:', result);

      if (result.status == 200) {
        Alert.alert(
          translate('success'),
          translate('invoiceUpdatedSuccessfully'),
          [{ text: translate('ok'), onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert(translate('error'), result.message || translate('failedToUpdateInvoice'));
      }
    } catch (error) {
      console.error('Update invoice error:', error);
      Alert.alert(translate('error'), translate('networkErrorUpdatingInvoice'));
    } finally {
      setLoading(false);
    }
  };

  // Get selected customer
  const selectedCustomer = customers.find(c => c.id == formData.customer_id) || invoice.customer;

  // Format currency
  const formatCurrency = (amount) => {
    const number = parseFloat(amount) || 0;
    return isRTL ? `${number.toFixed(2)} ر.س` : `$${number.toFixed(2)}`;
  };

  if (loadingData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B7D3D" />
        <Text style={[styles.loadingText, isRTL && styles.arabicText]}>
          {translate('loadingData')}
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
            <Text style={[styles.headerTitle, isRTL && styles.arabicText]}>
              {translate('editSalesInvoice')}
            </Text>
            <View style={styles.placeholder} />
          </View>
        </LinearGradient>
      </View>

      {/* Form */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Invoice Information */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isRTL && styles.arabicText]}>
            {translate('invoiceInformation')}
          </Text>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, isRTL && styles.arabicText]}>
              {translate('invoiceNumber')} *
            </Text>
            <TextInput
              style={[styles.input, isRTL && styles.arabicInput]}
              placeholder={translate('enterInvoiceNumber')}
              value={formData.invoice_number}
              onChangeText={(value) => handleInputChange('invoice_number', value)}
              textAlign={isRTL ? 'right' : 'left'}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={[styles.label, isRTL && styles.arabicText]}>
                {translate('invoiceDate')} *
              </Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => {
                  setDatePickerType('invoice');
                  setShowDatePicker(true);
                }}
              >
                <Text style={[styles.dateText, isRTL && styles.arabicText]}>
                  {formData.invoice_date}
                </Text>
                <Ionicons name="calendar" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={[styles.label, isRTL && styles.arabicText]}>
                {translate('dueDate')} *
              </Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => {
                  setDatePickerType('due');
                  setShowDatePicker(true);
                }}
              >
                <Text style={[styles.dateText, isRTL && styles.arabicText]}>
                  {formData.due_date || translate('selectDueDate')}
                </Text>
                <Ionicons name="calendar" size={20} color="#666" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Customer Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isRTL && styles.arabicText]}>
            {translate('customerInformation')}
          </Text>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, isRTL && styles.arabicText]}>
              {translate('selectCustomer')} *
            </Text>
            <TouchableOpacity
              style={styles.selector}
              onPress={() => setShowCustomerPicker(true)}
            >
              <Text style={[styles.selectorText, !selectedCustomer && styles.placeholder, isRTL && styles.arabicText]}>
                {selectedCustomer 
                  ? (isRTL ? selectedCustomer.name_ar || selectedCustomer.name : selectedCustomer.name)
                  : translate('selectCustomerPlaceholder')
                }
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Items Section */}
        <View style={styles.section}>
          <View style={[styles.sectionHeader, isRTL && styles.rtlSectionHeader]}>
            <Text style={[styles.sectionTitle, isRTL && styles.arabicText]}>
              {translate('invoiceItems')}
            </Text>
            <TouchableOpacity
              style={styles.addItemButton}
              onPress={() => setShowItemPicker(true)}
            >
              <Ionicons name="add-circle" size={20} color="#6B7D3D" />
              <Text style={[styles.addItemText, isRTL && styles.arabicText]}>
                {translate('addItem')}
              </Text>
            </TouchableOpacity>
          </View>

          {formData.items.map((item, index) => (
            <View key={index} style={styles.itemCard}>
              <View style={[styles.itemHeader, isRTL && styles.rtlItemHeader]}>
                <Text style={[styles.itemDescription, isRTL && styles.arabicText]}>
                  {item.description}
                </Text>
                <TouchableOpacity
                  style={styles.removeItemButton}
                  onPress={() => removeItem(index)}
                >
                  <Ionicons name="close-circle" size={20} color="#E74C3C" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.itemRow}>
                <View style={[styles.itemInputGroup, styles.flex1]}>
                  <Text style={[styles.itemLabel, isRTL && styles.arabicText]}>
                    {translate('quantity')}
                  </Text>
                  <TextInput
                    style={[styles.itemInput, isRTL && styles.arabicInput]}
                    value={item.qty.toString()}
                    onChangeText={(value) => updateItem(index, 'qty', value)}
                    keyboardType="numeric"
                    textAlign={isRTL ? 'right' : 'left'}
                  />
                </View>
                
                <View style={[styles.itemInputGroup, styles.flex2]}>
                  <Text style={[styles.itemLabel, isRTL && styles.arabicText]}>
                    {translate('unitPrice')}
                  </Text>
                  <TextInput
                    style={[styles.itemInput, isRTL && styles.arabicInput]}
                    value={item.price.toString()}
                    onChangeText={(value) => updateItem(index, 'price', value)}
                    keyboardType="decimal-pad"
                    textAlign={isRTL ? 'right' : 'left'}
                  />
                </View>
                
                <View style={[styles.itemInputGroup, styles.flex2]}>
                  <Text style={[styles.itemLabel, isRTL && styles.arabicText]}>
                    {translate('total')}
                  </Text>
                  <Text style={[styles.itemTotal, isRTL && styles.arabicText]}>
                    {formatCurrency(item.qty * item.price)}
                  </Text>
                </View>
              </View>
            </View>
          ))}

          {formData.items.length === 0 && (
            <View style={styles.noItemsContainer}>
              <Ionicons name="cube-outline" size={48} color="#ccc" />
              <Text style={[styles.noItemsText, isRTL && styles.arabicText]}>
                {translate('noItemsAdded')}
              </Text>
              <Text style={[styles.noItemsSubtext, isRTL && styles.arabicText]}>
                {translate('addItemsToInvoice')}
              </Text>
            </View>
          )}
        </View>

        {/* Financial Details */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isRTL && styles.arabicText]}>
            {translate('financialDetails')}
          </Text>
          
          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={[styles.label, isRTL && styles.arabicText]}>
                {translate('taxPercentage')}
              </Text>
              <TextInput
                style={[styles.input, isRTL && styles.arabicInput]}
                placeholder="15"
                value={formData.tax_percentage.toString()}
                onChangeText={(value) => handleInputChange('tax_percentage', value)}
                keyboardType="decimal-pad"
                textAlign={isRTL ? 'right' : 'left'}
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={[styles.label, isRTL && styles.arabicText]}>
                {translate('discountPercentage')}
              </Text>
              <TextInput
                style={[styles.input, isRTL && styles.arabicInput]}
                placeholder="0"
                value={formData.discount_percentage.toString()}
                onChangeText={(value) => handleInputChange('discount_percentage', value)}
                keyboardType="decimal-pad"
                textAlign={isRTL ? 'right' : 'left'}
              />
            </View>
          </View>

          {/* Calculated Totals */}
          <View style={styles.calculatedSection}>
            <Text style={[styles.calculatedTitle, isRTL && styles.arabicText]}>
              {translate('calculatedTotals')}
            </Text>
            
            <View style={styles.calculatedRow}>
              <Text style={[styles.calculatedLabel, isRTL && styles.arabicText]}>
                {translate('subtotal')}:
              </Text>
              <Text style={[styles.calculatedValue, isRTL && styles.arabicText]}>
                {formatCurrency(formData.subtotal)}
              </Text>
            </View>
            
            <View style={styles.calculatedRow}>
              <Text style={[styles.calculatedLabel, isRTL && styles.arabicText]}>
                {translate('taxAmount')}:
              </Text>
              <Text style={[styles.calculatedValue, isRTL && styles.arabicText]}>
                {formatCurrency(formData.tax_amount)}
              </Text>
            </View>
            
            <View style={styles.calculatedRow}>
              <Text style={[styles.calculatedLabel, isRTL && styles.arabicText]}>
                {translate('discountAmount')}:
              </Text>
              <Text style={[styles.calculatedValue, isRTL && styles.arabicText]}>
                -{formatCurrency(formData.discount_amount)}
              </Text>
            </View>
            
            <View style={[styles.calculatedRow, styles.totalRow]}>
              <Text style={[styles.totalLabel, isRTL && styles.arabicText]}>
                {translate('totalAmount')}:
              </Text>
              <Text style={[styles.totalValue, isRTL && styles.arabicText]}>
                {formatCurrency(formData.total_amount)}
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Information */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isRTL && styles.arabicText]}>
            {translate('paymentInformation')}
          </Text>
          
          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={[styles.label, isRTL && styles.arabicText]}>
                {translate('paymentStatus')}
              </Text>
              <View style={styles.statusContainer}>
                {paymentStatuses.map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.statusOption,
                      formData.payment_status === status && styles.statusOptionActive
                    ]}
                    onPress={() => handleInputChange('payment_status', status)}
                  >
                    <Text style={[
                      styles.statusOptionText,
                      formData.payment_status === status && styles.statusOptionTextActive,
                      isRTL && styles.arabicText
                    ]}>
                      {translate(status)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={[styles.label, isRTL && styles.arabicText]}>
                {translate('paymentMethod')}
              </Text>
              <View style={styles.methodContainer}>
                {paymentMethods.map((method) => (
                  <TouchableOpacity
                    key={method}
                    style={[
                      styles.methodOption,
                      formData.payment_method === method && styles.methodOptionActive
                    ]}
                    onPress={() => handleInputChange('payment_method', method)}
                  >
                    <Text style={[
                      styles.methodOptionText,
                      formData.payment_method === method && styles.methodOptionTextActive,
                      isRTL && styles.arabicText
                    ]}>
                      {translate(method.toLowerCase().replace(' ', ''))}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, isRTL && styles.arabicText]}>
              {translate('notes')}
            </Text>
            <TextInput
              style={[styles.input, styles.textArea, isRTL && styles.arabicInput]}
              placeholder={translate('enterNotes')}
              value={formData.notes}
              onChangeText={(value) => handleInputChange('notes', value)}
              multiline
              numberOfLines={3}
              textAlign={isRTL ? 'right' : 'left'}
            />
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="save" size={20} color="#fff" />
              <Text style={[styles.submitButtonText, isRTL && styles.arabicText]}>
                {translate('updateInvoice')}
              </Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* Customer Picker Modal */}
      <Modal
        visible={showCustomerPicker}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={[styles.modalHeader, isRTL && styles.rtlModalHeader]}>
            <Text style={[styles.modalTitle, isRTL && styles.arabicText]}>
              {translate('selectCustomer')}
            </Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowCustomerPicker(false)}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={customers}
            keyExtractor={(item) => item.id.toString()}
            style={styles.pickerList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.pickerItem}
                onPress={() => handleCustomerSelect(item)}
              >
                <View style={styles.pickerItemContent}>
                  <Text style={[styles.pickerItemName, isRTL && styles.arabicText]}>
                    {isRTL ? item.name_ar || item.name : item.name}
                  </Text>
                  <Text style={[styles.pickerItemDetails, isRTL && styles.arabicText]}>
                    {item.territory} • {item.customer_type}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.noDataContainer}>
                <Ionicons name="people-outline" size={48} color="#ccc" />
                <Text style={[styles.noDataText, isRTL && styles.arabicText]}>
                  {translate('noCustomersAvailable')}
                </Text>
              </View>
            }
          />
        </SafeAreaView>
      </Modal>

      {/* Item Picker Modal */}
      <Modal
        visible={showItemPicker}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={[styles.modalHeader, isRTL && styles.rtlModalHeader]}>
            <Text style={[styles.modalTitle, isRTL && styles.arabicText]}>
              {translate('selectItem')}
            </Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowItemPicker(false)}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={availableItems}
            keyExtractor={(item) => item.id.toString()}
            style={styles.pickerList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.pickerItem}
                onPress={() => handleItemSelect(item)}
              >
                <View style={styles.pickerItemContent}>
                  <Text style={[styles.pickerItemName, isRTL && styles.arabicText]}>
                    {item.name}
                  </Text>
                  <Text style={[styles.pickerItemDetails, isRTL && styles.arabicText]}>
                    {translate('price')}: {formatCurrency(item.amount)} • {translate('stock')}: {item.qty || 0}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.noDataContainer}>
                <Ionicons name="cube-outline" size={48} color="#ccc" />
                <Text style={[styles.noDataText, isRTL && styles.arabicText]}>
                  {translate('noItemsAvailable')}
                </Text>
              </View>
            }
          />
        </SafeAreaView>
      </Modal>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
    </SafeAreaView>
  );
};

// Use the same styles as AddSalesInvoiceScreen
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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  rtlSectionHeader: {
    flexDirection: 'row-reverse',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  arabicInput: {
    textAlign: 'right',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  halfWidth: {
    flex: 1,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9f9f9',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  selector: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9f9f9',
  },
  selectorText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(107, 125, 61, 0.1)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 5,
  },
  addItemText: {
    fontSize: 14,
    color: '#6B7D3D',
    fontWeight: '600',
  },
  itemCard: {
    backgroundColor: '#f8fafb',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  rtlItemHeader: {
    flexDirection: 'row-reverse',
  },
  itemDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  removeItemButton: {
    padding: 5,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  itemInputGroup: {
    marginBottom: 0,
  },
  flex1: { flex: 1 },
  flex2: { flex: 2 },
  itemLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 5,
  },
  itemInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6B7D3D',
    paddingVertical: 8,
  },
  noItemsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noItemsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    marginTop: 15,
    marginBottom: 5,
  },
  noItemsSubtext: {
    fontSize: 14,
    color: '#bbb',
    textAlign: 'center',
  },
  calculatedSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  calculatedTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  calculatedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  calculatedLabel: {
    fontSize: 14,
    color: '#666',
  },
  calculatedValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  totalRow: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
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
  statusContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusOption: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusOptionActive: {
    backgroundColor: '#6B7D3D',
  },
  statusOptionText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  statusOptionTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  methodContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  methodOption: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  methodOptionActive: {
    backgroundColor: '#6B7D3D',
  },
  methodOptionText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  methodOptionTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#6B7D3D',
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomSpace: {
    height: 30,
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
  pickerList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  pickerItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  pickerItemContent: {
    flex: 1,
  },
  pickerItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  pickerItemDetails: {
    fontSize: 14,
    color: '#666',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  noDataText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    marginTop: 15,
  },
  
  // RTL Support
  arabicText: {
    textAlign: 'right',
    fontFamily: 'Arabic',
  },
});

export default EditSalesInvoiceScreen;