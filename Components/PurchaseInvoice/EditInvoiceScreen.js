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
import AsyncStorage from '@react-native-async-storage/async-storage';
import languageService from '../Globals/Store/Lang';

const API_BASE_URL = 'https://planetdory.dwrylight.com/api';

const EditPurchaseInvoiceScreen = ({ route, navigation }) => {
  const { invoice } = route.params;

  const [formData, setFormData] = useState({
    inventory_id: invoice.inventory_id || '',
    po_number: invoice.po_number || '',
    amount: invoice.amount || '',
    supplier_id: invoice.supplier_id || '',
    invoice_date: invoice.invoice_date || new Date().toISOString().split('T')[0],
    due_date: invoice.due_date || '',
    items: [],
    subtotal: invoice.subtotal || 0,
    tax_percentage: invoice.tax_percentage || 15,
    tax_amount: invoice.tax_amount || 0,
    discount_percentage: invoice.discount_percentage || 0,
    discount_amount: invoice.discount_amount || 0,
    total_amount: invoice.total_amount || 0,
    payment_status: invoice.payment_status || 'pending',
    payment_method: invoice.payment_method || 'Bank Transfer',
    notes: invoice.notes || '',
    created_by: invoice.created_by || 1
  });

  const [availableItems, setAvailableItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedPO, setSelectedPO] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [showItemPicker, setShowItemPicker] = useState(false);
  const [showSupplierPicker, setShowSupplierPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerType, setDatePickerType] = useState('invoice');
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isRTL, setIsRTL] = useState(false);

  const translate = (key) => languageService.translate(key);

  const paymentMethods = ['Bank Transfer', 'Cash', 'Card', 'Check'];
  const paymentStatuses = ['pending', 'paid', 'overdue'];

  useEffect(() => {
    initializeScreen();
    fetchInitialData();
    populateExistingData();
  }, []);

  const initializeScreen = async () => {
    const language = await languageService.loadSavedLanguage();
    setCurrentLanguage(language);
    setIsRTL(language === 'ar');
    
    await loadUserData();
  };

  // Populate existing invoice data
  const populateExistingData = () => {
    // Parse existing items
    let existingItems = [];
    try {
      if (invoice.items) {
        existingItems = typeof invoice.items === 'string' 
          ? JSON.parse(invoice.items) 
          : Array.isArray(invoice.items) 
            ? invoice.items 
            : [];
      }
    } catch (error) {
      console.error('Error parsing existing items:', error);
      existingItems = [];
    }

    // Ensure items have proper numeric values
    const processedItems = existingItems.map(item => ({
      ...item,
      quantity: parseFloat(item.quantity) || 0,
      unit_price: parseFloat(item.unit_price) || 0,
      total_price: parseFloat(item.total_price) || (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0)
    }));

    // Update form data with processed values
    setFormData(prev => ({
      ...prev,
      items: processedItems,
      subtotal: parseFloat(invoice.subtotal) || 0,
      tax_amount: parseFloat(invoice.tax_amount) || 0,
      discount_amount: parseFloat(invoice.discount_amount) || 0,
      total_amount: parseFloat(invoice.total_amount) || 0,
      amount: parseFloat(invoice.amount) || parseFloat(invoice.total_amount) || 0,
      tax_percentage: parseFloat(invoice.tax_percentage) || 15,
      discount_percentage: parseFloat(invoice.discount_percentage) || 0
    }));

    // Set selected supplier if exists
    if (invoice.supplier) {
      setSelectedSupplier(invoice.supplier);
    }

    // Trigger calculation with processed data
    setTimeout(() => {
      calculateTotals({
        ...formData,
        items: processedItems,
        tax_percentage: parseFloat(invoice.tax_percentage) || 15,
        discount_percentage: parseFloat(invoice.discount_percentage) || 0
      });
    }, 100);
  };

  // Load user data from AsyncStorage
  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        setCurrentUser(user);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
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

  const fetchInitialData = async () => {
    await Promise.all([
      fetchItems(),
      fetchSuppliers()
    ]);
    setLoadingData(false);
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
      if (result.status === 200 || result.status === '200') {
        setAvailableItems(result.data || []);
      }
    } catch (error) {
      console.error('Fetch items error:', error);
    }
  };

  // Fetch suppliers
  const fetchSuppliers = async () => {
    const token = await getAuthToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/fetch_all_suppliers`, {
        method: 'GET',
        headers: { 'Authorization': token },
      });
      
      const result = await response.json();
      if (result.status === 200 || result.status === '200') {
        setSuppliers(result.data || []);
        
        // Set selected supplier after fetching
        if (invoice.supplier_id) {
          const foundSupplier = (result.data || []).find(s => s.id === invoice.supplier_id);
          if (foundSupplier) {
            setSelectedSupplier(foundSupplier);
          }
        }
      }
    } catch (error) {
      console.error('Fetch suppliers error:', error);
      // Mock suppliers if API doesn't exist
      const mockSuppliers = [
        { id: 1, name: 'ABC Supplies', contact_person: 'Ahmed Khan' },
        { id: 2, name: 'XYZ Corp', contact_person: 'Sara Ahmed' },
      ];
      setSuppliers(mockSuppliers);
      
      // Set selected supplier from mock data
      if (invoice.supplier_id) {
        const foundSupplier = mockSuppliers.find(s => s.id === invoice.supplier_id);
        if (foundSupplier) {
          setSelectedSupplier(foundSupplier);
        }
      }
    }
  };

  // Handle PO selection
  const handlePOSelection = () => {
    navigation.navigate('POSelectorScreen', {
      selectedPOId: selectedPO?.id,
      onPOSelect: (po) => {
        setSelectedPO(po);
        setFormData(prev => ({ ...prev, po_number: po ? po.po_number : '' }));
      }
    });
  };

  // Handle inventory selection
  const handleInventorySelection = () => {
    navigation.navigate('InventorySelectorScreen', {
      selectedInventoryId: selectedInventory?.id,
      onInventorySelect: (inventory) => {
        setSelectedInventory(inventory);
        setFormData(prev => ({ 
          ...prev, 
          inventory_id: inventory ? inventory.id : '' 
        }));
      }
    });
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
    const subtotal = data.items.reduce((sum, item) => {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.unit_price) || 0;
      return sum + (qty * price);
    }, 0);
    
    const taxAmount = (subtotal * parseFloat(data.tax_percentage || 0)) / 100;
    const discountFromPercentage = (subtotal * parseFloat(data.discount_percentage || 0)) / 100;
    const discountAmount = parseFloat(data.discount_amount) || discountFromPercentage || 0;
    const totalAmount = subtotal + taxAmount - discountAmount;

    setFormData(prev => ({
      ...prev,
      subtotal: parseFloat(subtotal).toFixed(2),
      tax_amount: parseFloat(taxAmount).toFixed(2),
      discount_amount: parseFloat(discountAmount).toFixed(2),
      total_amount: parseFloat(totalAmount).toFixed(2),
      amount: parseFloat(totalAmount).toFixed(2)
    }));
  };

  // Handle supplier selection
  const handleSupplierSelect = (supplier) => {
    setSelectedSupplier(supplier);
    setFormData(prev => ({ ...prev, supplier_id: supplier.id }));
    setShowSupplierPicker(false);
  };

  // Handle item selection
  const handleItemSelect = (item) => {
    const newItem = {
      item_id: item.id,
      quantity: 1,
      unit_price: parseFloat(item.amount || 0),
      total_price: parseFloat(item.amount || 0)
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
      if (field === 'quantity' || field === 'unit_price') {
        const numValue = parseFloat(value) || 0;
        newItems[index] = { 
          ...newItems[index], 
          [field]: numValue,
          total_price: field === 'quantity' 
            ? numValue * (parseFloat(newItems[index].unit_price) || 0)
            : (parseFloat(newItems[index].quantity) || 0) * numValue
        };
      } else {
        newItems[index] = { ...newItems[index], [field]: value };
      }
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
    if (!formData.supplier_id) {
      Alert.alert(translate('validationError'), translate('supplierRequired'));
      return false;
    }
    if (!formData.po_number.trim()) {
      Alert.alert(translate('validationError'), translate('poNumberRequired'));
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
        inventory_id: parseInt(formData.inventory_id) || null,
        po_number: formData.po_number,
        amount: parseFloat(formData.amount),
        supplier_id: parseInt(formData.supplier_id),
        invoice_date: formData.invoice_date,
        due_date: formData.due_date,
        items: formData.items,
        tax_percentage: parseFloat(formData.tax_percentage),
        discount_percentage: parseFloat(formData.discount_percentage),
        payment_status: formData.payment_status,
        payment_method: formData.payment_method,
        notes: formData.notes,
        created_by: formData.created_by
      };

      console.log('Update Purchase Invoice Payload:', payload);

      const response = await fetch(`${API_BASE_URL}/update_purchase_invoice/${invoice.id}`, {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('Non-JSON response:', textResponse);
        Alert.alert(translate('error'), 'Server returned invalid response format');
        return;
      }

      const result = await response.json();
      console.log('Update purchase invoice response:', result);

      if (result.status === 200 || result.status === '200') {
        Alert.alert(
          translate('success'),
          translate('purchaseInvoiceUpdatedSuccessfully'),
          [{ text: translate('ok'), onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert(translate('error'), result.message || translate('failedToUpdatePurchaseInvoice'));
      }
    } catch (error) {
      console.error('Update purchase invoice error:', error);
      if (error.message.includes('JSON Parse error')) {
        Alert.alert(translate('error'), translate('serverResponseError'));
      } else {
        Alert.alert(translate('error'), translate('networkErrorUpdatingPurchaseInvoice'));
      }
    } finally {
      setLoading(false);
    }
  };

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
            <View style={styles.headerTextContainer}>
              <Text style={[styles.headerTitle, isRTL && styles.arabicText]}>
                {translate('editPurchaseInvoice')}
              </Text>
              <Text style={[styles.headerSubtitle, isRTL && styles.arabicText]}>
                {invoice.invoice_number || `#${invoice.id}`}
              </Text>
            </View>
            <View style={styles.placeholder} />
          </View>
        </LinearGradient>
      </View>

      {/* Form */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Purchase Order & Supplier Information */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isRTL && styles.arabicText]}>
            {translate('purchaseOrderInformation')}
          </Text>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, isRTL && styles.arabicText]}>
              {translate('selectPurchaseOrder')} *
            </Text>
            <TouchableOpacity
              style={[styles.selector, isRTL && styles.rtlSelector]}
              onPress={handlePOSelection}
            >
              <View style={styles.selectorInfo}>
                <Ionicons name="document-text" size={20} color="#6B7D3D" />
                <Text style={[styles.selectorText, isRTL && styles.arabicText]}>
                  {selectedPO 
                    ? selectedPO.po_number
                    : formData.po_number || translate('selectPOPlaceholder')
                  }
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, isRTL && styles.arabicText]}>
              {translate('selectSupplier')} *
            </Text>
            <TouchableOpacity
              style={[styles.selector, isRTL && styles.rtlSelector]}
              onPress={() => setShowSupplierPicker(true)}
            >
              <View style={styles.selectorInfo}>
                <Ionicons name="business" size={20} color="#6B7D3D" />
                <Text style={[styles.selectorText, isRTL && styles.arabicText]}>
                  {selectedSupplier 
                    ? selectedSupplier.name
                    : translate('selectSupplierPlaceholder')
                  }
                </Text>
              </View>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, isRTL && styles.arabicText]}>
              {translate('selectInventory')} ({translate('optional')})
            </Text>
            <TouchableOpacity
              style={[styles.selector, isRTL && styles.rtlSelector]}
              onPress={handleInventorySelection}
            >
              <View style={styles.selectorInfo}>
                <Ionicons name="cube" size={20} color="#6B7D3D" />
                <Text style={[styles.selectorText, isRTL && styles.arabicText]}>
                  {selectedInventory 
                    ? selectedInventory.description
                    : translate('selectInventoryPlaceholder')
                  }
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Invoice Information */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isRTL && styles.arabicText]}>
            {translate('invoiceInformation')}
          </Text>
          
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
                  {translate('item')} {item.item_id}
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
                    value={item.quantity.toString()}
                    onChangeText={(value) => updateItem(index, 'quantity', value)}
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
                    value={item.unit_price.toString()}
                    onChangeText={(value) => updateItem(index, 'unit_price', value)}
                    keyboardType="decimal-pad"
                    textAlign={isRTL ? 'right' : 'left'}
                  />
                </View>
                
                <View style={[styles.itemInputGroup, styles.flex2]}>
                  <Text style={[styles.itemLabel, isRTL && styles.arabicText]}>
                    {translate('totalPrice')}
                  </Text>
                  <Text style={[styles.itemTotal, isRTL && styles.arabicText]}>
                    {formatCurrency(item.total_price)}
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
                {translate('updatePurchaseInvoice')}
              </Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* Supplier Picker Modal */}
      <Modal
        visible={showSupplierPicker}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={[styles.modalHeader, isRTL && styles.rtlModalHeader]}>
            <Text style={[styles.modalTitle, isRTL && styles.arabicText]}>
              {translate('selectSupplier')}
            </Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowSupplierPicker(false)}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={suppliers}
            keyExtractor={(item) => item.id.toString()}
            style={styles.pickerList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.pickerItem,
                  selectedSupplier?.id === item.id && styles.pickerItemSelected
                ]}
                onPress={() => handleSupplierSelect(item)}
              >
                <View style={styles.pickerItemContent}>
                  <Text style={[styles.pickerItemName, isRTL && styles.arabicText]}>
                    {item.name}
                  </Text>
                  {item.contact_person && (
                    <Text style={[styles.pickerItemDetails, isRTL && styles.arabicText]}>
                      {translate('contact')}: {item.contact_person}
                    </Text>
                  )}
                </View>
                {selectedSupplier?.id === item.id && (
                  <Ionicons name="checkmark-circle" size={20} color="#6B7D3D" />
                )}
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.noDataContainer}>
                <Ionicons name="business-outline" size={48} color="#ccc" />
                <Text style={[styles.noDataText, isRTL && styles.arabicText]}>
                  {translate('noSuppliersAvailable')}
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
          value={new Date(formData[datePickerType === 'invoice' ? 'invoice_date' : 'due_date'] || new Date())}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
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
  rtlSelector: {
    flexDirection: 'row-reverse',
  },
  selectorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  selectorText: {
    fontSize: 16,
    color: '#333',
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
    borderWidth: 2,
    borderColor: 'transparent',
  },
  pickerItemSelected: {
    borderColor: '#6B7D3D',
    backgroundColor: '#f8fafb',
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

export default EditPurchaseInvoiceScreen;