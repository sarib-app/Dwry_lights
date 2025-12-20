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
import getAuthToken from '../Globals/Store/LocalData';
import commonStyles from '../Globals/CommonStyles';

const API_BASE_URL = 'https://planetdory.dwrylight.com/api';

const QuickPurchaseScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    supplier_name: '',
    supplier_contact: '',
    supplier_id: '',
    po_date: new Date().toISOString().split('T')[0],
    expected_delivery_date: '',
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: '',
    items: [],
    tax_amount: 0,
    shipping_cost: 0,
    shipment_cost: 0,
    description: '',
    cost: 0,
    vat: 0,
    vendor: '',
    subtotal: 0,
    total: 0,
    tax_percentage: 0,
    discount_percentage: 0,
    payment_method: 'Bank Transfer',
    notes: '',
    is_paid: false,
    created_by: '',
  });

  const [suppliers, setSuppliers] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [showSupplierPicker, setShowSupplierPicker] = useState(false);
  const [showItemPicker, setShowItemPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerType, setDatePickerType] = useState('po');
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isRTL, setIsRTL] = useState(false);

  const translate = (key) => languageService.translate(key);

  const paymentMethods = ['Cash', 'Bank Transfer', 'Check', 'Card'];

  useEffect(() => {
    initializeScreen();
    fetchInitialData();
  }, []);

  useEffect(() => {
    calculateTotals();
  }, [formData.items, formData.tax_amount, formData.shipping_cost, formData.tax_percentage, formData.discount_percentage]);

  const initializeScreen = async () => {
    const language = await languageService.loadSavedLanguage();
    setCurrentLanguage(language);
    setIsRTL(language === 'ar');
    
    // Load user data from AsyncStorage (same pattern as other purchase screens)
    await loadUserData();
  };

  // Load user data from AsyncStorage
  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        setFormData(prev => ({ ...prev, created_by: user.id }));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const fetchInitialData = async () => {
    await Promise.all([fetchSuppliers(), fetchItems()]);
    setLoadingData(false);
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
      if (result.status == 200) {
        setSuppliers(result.data || []);
      }
    } catch (error) {
      console.error('Fetch suppliers error:', error);
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
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Calculate totals
  const calculateTotals = () => {
    // Calculate items subtotal
    const itemsSubtotal = formData.items.reduce((sum, item) => {
      return sum + (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_cost) || 0);
    }, 0);

    // Calculate tax amount if tax_percentage is provided
    let taxAmount = parseFloat(formData.tax_amount) || 0;
    if (formData.tax_percentage > 0 && itemsSubtotal > 0) {
      taxAmount = (itemsSubtotal * parseFloat(formData.tax_percentage)) / 100;
    }

    // Calculate discount
    const discountAmount = itemsSubtotal * (parseFloat(formData.discount_percentage) || 0) / 100;
    const subtotalAfterDiscount = itemsSubtotal - discountAmount;

    // Shipping cost
    const shippingCost = parseFloat(formData.shipping_cost) || parseFloat(formData.shipment_cost) || 0;

    // Total
    const total = subtotalAfterDiscount + taxAmount + shippingCost;

    // VAT (same as tax_amount for this API)
    const vat = taxAmount;

    setFormData(prev => ({
      ...prev,
      subtotal: itemsSubtotal,
      tax_amount: taxAmount,
      vat: vat,
      shipping_cost: shippingCost,
      shipment_cost: shippingCost,
      total: total,
      cost: itemsSubtotal, // cost is the items total
    }));
  };

  // Handle supplier selection
  const handleSupplierSelect = (supplier) => {
    setFormData(prev => ({
      ...prev,
      supplier_id: supplier.id,
      supplier_name: supplier.name || supplier.supplier_name || '',
      supplier_contact: supplier.contact || supplier.phone || supplier.email || supplier.supplier_contact || '',
      vendor: supplier.name || supplier.supplier_name || '',
    }));
    setShowSupplierPicker(false);
  };

  // Handle item selection - auto-fill from item data
  const handleItemSelect = (item) => {
    const newItem = {
      item_id: item.id,
      quantity: 1,
      unit_cost: parseFloat(item.unit_cost || item.cost || item.amount || item.price || 0),
      unit_price: parseFloat(item.unit_price || item.price || item.amount || item.selling_price || 0),
    };
    
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
    setShowItemPicker(false);
  };

  // Update item in list
  const updateItem = (index, field, value) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems[index] = { 
        ...newItems[index], 
        [field]: field === 'quantity' || field === 'unit_cost' || field === 'unit_price' 
          ? parseFloat(value) || 0 
          : value 
      };
      return { ...prev, items: newItems };
    });
  };

  // Remove item from list
  const removeItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  // Handle date selection
  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const dateString = selectedDate.toISOString().split('T')[0];
      const fieldMap = {
        'po': 'po_date',
        'expected': 'expected_delivery_date',
        'invoice': 'invoice_date',
        'due': 'due_date',
      };
      setFormData(prev => ({
        ...prev,
        [fieldMap[datePickerType]]: dateString
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    if (!formData.supplier_id) {
      Alert.alert(translate('validationError'), 'Please select a supplier');
      return false;
    }
    if (!formData.supplier_name) {
      Alert.alert(translate('validationError'), 'Supplier name is required');
      return false;
    }
    if (formData.items.length === 0) {
      Alert.alert(translate('validationError'), 'Please add at least one item');
      return false;
    }
    if (!formData.po_date) {
      Alert.alert(translate('validationError'), 'PO date is required');
      return false;
    }
    if (!formData.invoice_date) {
      Alert.alert(translate('validationError'), 'Invoice date is required');
      return false;
    }
    
    // Ensure due_date is set and is >= invoice_date
    let dueDate = formData.due_date || formData.invoice_date;
    if (new Date(dueDate) < new Date(formData.invoice_date)) {
      Alert.alert(translate('validationError'), 'Due date must be after or equal to invoice date');
      return false;
    }
    
    if (!formData.created_by || formData.created_by === 0) {
      Alert.alert(translate('validationError'), 'User ID not found. Please login again.');
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

      // Ensure due_date is at least equal to invoice_date
      let dueDate = formData.due_date;
      if (!dueDate || dueDate === '') {
        dueDate = formData.invoice_date;
      }
      // If due_date is before invoice_date, set it to invoice_date
      if (new Date(dueDate) < new Date(formData.invoice_date)) {
        dueDate = formData.invoice_date;
      }

      // Ensure expected_delivery_date is set
      let expectedDeliveryDate = formData.expected_delivery_date;
      if (!expectedDeliveryDate || expectedDeliveryDate === '') {
        expectedDeliveryDate = formData.po_date;
      }

      const payload = {
        // Purchase Order fields
        supplier_name: formData.supplier_name,
        supplier_contact: formData.supplier_contact || '',
        po_date: formData.po_date,
        expected_delivery_date: expectedDeliveryDate,
        
        // Items array (with item_id - must exist)
        items: formData.items.map(item => ({
          item_id: parseInt(item.item_id),
          quantity: parseFloat(item.quantity) || 0,
          unit_cost: parseFloat(item.unit_cost) || 0,
          unit_price: parseFloat(item.unit_price) || 0,
        })),
        
        // Purchase Order totals
        tax_amount: parseFloat(formData.tax_amount) || 0,
        shipping_cost: parseFloat(formData.shipping_cost) || 0,
        
        // Inventory fields (optional)
        description: formData.description || '',
        cost: parseFloat(formData.cost) || 0,
        vat: parseFloat(formData.vat) || 0,
        vendor: formData.vendor || formData.supplier_name,
        subtotal: parseFloat(formData.subtotal) || 0,
        total: parseFloat(formData.total) || 0,
        shipment_cost: parseFloat(formData.shipment_cost) || parseFloat(formData.shipping_cost) || 0,
        is_paid: formData.is_paid || false,
        
        // Purchase Invoice fields
        supplier_id: parseInt(formData.supplier_id),
        invoice_date: formData.invoice_date,
        due_date: dueDate,
        tax_percentage: parseFloat(formData.tax_percentage) || 0,
        discount_percentage: parseFloat(formData.discount_percentage) || 0,
        payment_method: formData.payment_method || 'Bank Transfer',
        notes: formData.notes || '',
        created_by: parseInt(formData.created_by),
      };

      const response = await fetch(`${API_BASE_URL}/quick_purchase`, {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log('Quick purchase response:', result);

      if (result.status == 200 || result.success) {
        Alert.alert(
          translate('success'),
          'Quick purchase completed successfully! PO, Purchase Invoice, and Inventory have been created.',
          [{ text: translate('ok'), onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert(translate('error'), result.message || 'Failed to complete quick purchase');
      }
    } catch (error) {
      console.error('Quick purchase error:', error);
      Alert.alert(translate('error'), 'Network error while processing quick purchase');
    } finally {
      setLoading(false);
    }
  };

  // Get selected supplier
  const selectedSupplier = suppliers.find(s => s.id == formData.supplier_id);

  // Format currency
  const formatCurrency = (amount) => {
    const number = parseFloat(amount) || 0;
    return isRTL ? `${number.toFixed(2)} ر.س` : `$${number.toFixed(2)}`;
  };

  if (loadingData) {
    return (
      <View style={commonStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B7D3D" />
        <Text style={[commonStyles.loadingText, isRTL && commonStyles.arabicText]}>
          {translate('loadingData')}
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
            <Text style={[commonStyles.headerTitle, isRTL && commonStyles.arabicText]}>
              Quick Purchase
            </Text>
            <View style={commonStyles.placeholder} />
          </View>
        </LinearGradient>
      </View>

      {/* Form */}
      <ScrollView style={commonStyles.content} showsVerticalScrollIndicator={false}>
        {/* Supplier Information */}
        <View style={commonStyles.section}>
          <Text style={[commonStyles.sectionTitle, isRTL && commonStyles.arabicText]}>
            Supplier Information
          </Text>
          
          <View style={commonStyles.inputGroup}>
            <Text style={[commonStyles.label, isRTL && commonStyles.arabicText]}>
              Select Supplier *
            </Text>
            <TouchableOpacity
              style={commonStyles.selector}
              onPress={() => setShowSupplierPicker(true)}
            >
              <Text style={[
                commonStyles.selectorText, 
                !selectedSupplier && commonStyles.placeholder, 
                isRTL && commonStyles.arabicText
              ]}>
                {selectedSupplier 
                  ? selectedSupplier.name || selectedSupplier.supplier_name
                  : 'Select supplier'
                }
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {selectedSupplier && (
            <>
              <View style={commonStyles.inputGroup}>
                <Text style={[commonStyles.label, isRTL && commonStyles.arabicText]}>
                  Supplier Name *
                </Text>
                <TextInput
                  style={[commonStyles.input, isRTL && commonStyles.arabicInput]}
                  placeholder="Supplier name"
                  value={formData.supplier_name}
                  onChangeText={(value) => handleInputChange('supplier_name', value)}
                  textAlign={isRTL ? 'right' : 'left'}
                />
              </View>

              <View style={commonStyles.inputGroup}>
                <Text style={[commonStyles.label, isRTL && commonStyles.arabicText]}>
                  Supplier Contact
                </Text>
                <TextInput
                  style={[commonStyles.input, isRTL && commonStyles.arabicInput]}
                  placeholder="Phone or email"
                  value={formData.supplier_contact}
                  onChangeText={(value) => handleInputChange('supplier_contact', value)}
                  keyboardType="phone-pad"
                  textAlign={isRTL ? 'right' : 'left'}
                />
              </View>
            </>
          )}
        </View>

        {/* Dates */}
        <View style={commonStyles.section}>
          <Text style={[commonStyles.sectionTitle, isRTL && commonStyles.arabicText]}>
            Dates
          </Text>
          
          <View style={commonStyles.row}>
            <View style={[commonStyles.inputGroup, commonStyles.halfWidth]}>
              <Text style={[commonStyles.label, isRTL && commonStyles.arabicText]}>
                PO Date *
              </Text>
              <TouchableOpacity
                style={commonStyles.dateInput}
                onPress={() => {
                  setDatePickerType('po');
                  setShowDatePicker(true);
                }}
              >
                <Text style={[commonStyles.dateText, isRTL && commonStyles.arabicText]}>
                  {formData.po_date}
                </Text>
                <Ionicons name="calendar" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={[commonStyles.inputGroup, commonStyles.halfWidth]}>
              <Text style={[commonStyles.label, isRTL && commonStyles.arabicText]}>
                Expected Delivery
              </Text>
              <TouchableOpacity
                style={commonStyles.dateInput}
                onPress={() => {
                  setDatePickerType('expected');
                  setShowDatePicker(true);
                }}
              >
                <Text style={[commonStyles.dateText, isRTL && commonStyles.arabicText]}>
                  {formData.expected_delivery_date || 'Select date'}
                </Text>
                <Ionicons name="calendar" size={20} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={commonStyles.row}>
            <View style={[commonStyles.inputGroup, commonStyles.halfWidth]}>
              <Text style={[commonStyles.label, isRTL && commonStyles.arabicText]}>
                Invoice Date *
              </Text>
              <TouchableOpacity
                style={commonStyles.dateInput}
                onPress={() => {
                  setDatePickerType('invoice');
                  setShowDatePicker(true);
                }}
              >
                <Text style={[commonStyles.dateText, isRTL && commonStyles.arabicText]}>
                  {formData.invoice_date}
                </Text>
                <Ionicons name="calendar" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={[commonStyles.inputGroup, commonStyles.halfWidth]}>
              <Text style={[commonStyles.label, isRTL && commonStyles.arabicText]}>
                Due Date
              </Text>
              <TouchableOpacity
                style={commonStyles.dateInput}
                onPress={() => {
                  setDatePickerType('due');
                  setShowDatePicker(true);
                }}
              >
                <Text style={[commonStyles.dateText, isRTL && commonStyles.arabicText]}>
                  {formData.due_date || 'Select date'}
                </Text>
                <Ionicons name="calendar" size={20} color="#666" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Items */}
        <View style={commonStyles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[commonStyles.sectionTitle, isRTL && commonStyles.arabicText]}>
              Items *
            </Text>
            <TouchableOpacity
              style={styles.addItemButton}
              onPress={() => setShowItemPicker(true)}
            >
              <Ionicons name="add-circle" size={24} color="#6B7D3D" />
              <Text style={[styles.addItemText, isRTL && commonStyles.arabicText]}>
                Add Item
              </Text>
            </TouchableOpacity>
          </View>

          {formData.items.length === 0 ? (
            <View style={styles.emptyItemsContainer}>
              <Ionicons name="cube-outline" size={48} color="#ccc" />
              <Text style={[styles.emptyItemsText, isRTL && commonStyles.arabicText]}>
                No items added. Tap "Add Item" to start.
              </Text>
            </View>
          ) : (
            formData.items.map((item, index) => {
              const selectedItem = availableItems.find(i => i.id === item.item_id);
              return (
                <View key={index} style={styles.itemCard}>
                  <View style={styles.itemHeader}>
                    <View style={styles.itemInfo}>
                      <Text style={[styles.itemName, isRTL && commonStyles.arabicText]}>
                        {selectedItem?.name || `Item #${item.item_id}`}
                      </Text>
                      {selectedItem?.description && (
                        <Text style={[styles.itemDescription, isRTL && commonStyles.arabicText]}>
                          {selectedItem.description}
                        </Text>
                      )}
                    </View>
                    <TouchableOpacity
                      style={styles.removeItemButton}
                      onPress={() => removeItem(index)}
                    >
                      <Ionicons name="close-circle" size={24} color="#E74C3C" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.itemFields}>
                    <View style={[commonStyles.inputGroup, styles.itemField]}>
                      <Text style={[commonStyles.label, isRTL && commonStyles.arabicText]}>
                        Quantity
                      </Text>
                      <TextInput
                        style={[commonStyles.input, isRTL && commonStyles.arabicInput]}
                        value={item.quantity?.toString() || '1'}
                        onChangeText={(value) => updateItem(index, 'quantity', value)}
                        keyboardType="numeric"
                        textAlign={isRTL ? 'right' : 'left'}
                      />
                    </View>

                    <View style={[commonStyles.inputGroup, styles.itemField]}>
                      <Text style={[commonStyles.label, isRTL && commonStyles.arabicText]}>
                        Unit Cost
                      </Text>
                      <TextInput
                        style={[commonStyles.input, isRTL && commonStyles.arabicInput]}
                        value={item.unit_cost?.toString() || '0'}
                        onChangeText={(value) => updateItem(index, 'unit_cost', value)}
                        keyboardType="decimal-pad"
                        textAlign={isRTL ? 'right' : 'left'}
                      />
                    </View>

                    <View style={[commonStyles.inputGroup, styles.itemField]}>
                      <Text style={[commonStyles.label, isRTL && commonStyles.arabicText]}>
                        Unit Price
                      </Text>
                      <TextInput
                        style={[commonStyles.input, isRTL && commonStyles.arabicInput]}
                        value={item.unit_price?.toString() || '0'}
                        onChangeText={(value) => updateItem(index, 'unit_price', value)}
                        keyboardType="decimal-pad"
                        textAlign={isRTL ? 'right' : 'left'}
                      />
                    </View>
                  </View>

                  <View style={styles.itemTotal}>
                    <Text style={[styles.itemTotalLabel, isRTL && commonStyles.arabicText]}>
                      Item Total:
                    </Text>
                    <Text style={[styles.itemTotalValue, isRTL && commonStyles.arabicText]}>
                      {formatCurrency((parseFloat(item.quantity) || 0) * (parseFloat(item.unit_cost) || 0))}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Financial Details */}
        <View style={commonStyles.section}>
          <Text style={[commonStyles.sectionTitle, isRTL && commonStyles.arabicText]}>
            Financial Details
          </Text>
          
          <View style={commonStyles.row}>
            <View style={[commonStyles.inputGroup, commonStyles.halfWidth]}>
              <Text style={[commonStyles.label, isRTL && commonStyles.arabicText]}>
                Tax Percentage (%)
              </Text>
              <TextInput
                style={[commonStyles.input, isRTL && commonStyles.arabicInput]}
                placeholder="0"
                value={formData.tax_percentage?.toString() || '0'}
                onChangeText={(value) => handleInputChange('tax_percentage', value)}
                keyboardType="decimal-pad"
                textAlign={isRTL ? 'right' : 'left'}
              />
            </View>

            <View style={[commonStyles.inputGroup, commonStyles.halfWidth]}>
              <Text style={[commonStyles.label, isRTL && commonStyles.arabicText]}>
                Discount Percentage (%)
              </Text>
              <TextInput
                style={[commonStyles.input, isRTL && commonStyles.arabicInput]}
                placeholder="0"
                value={formData.discount_percentage?.toString() || '0'}
                onChangeText={(value) => handleInputChange('discount_percentage', value)}
                keyboardType="decimal-pad"
                textAlign={isRTL ? 'right' : 'left'}
              />
            </View>
          </View>

          <View style={commonStyles.inputGroup}>
            <Text style={[commonStyles.label, isRTL && commonStyles.arabicText]}>
              Shipping Cost
            </Text>
            <TextInput
              style={[commonStyles.input, isRTL && commonStyles.arabicInput]}
              placeholder="0.00"
              value={formData.shipping_cost?.toString() || '0'}
              onChangeText={(value) => {
                handleInputChange('shipping_cost', value);
                handleInputChange('shipment_cost', value);
              }}
              keyboardType="decimal-pad"
              textAlign={isRTL ? 'right' : 'left'}
            />
          </View>

          <View style={commonStyles.inputGroup}>
            <Text style={[commonStyles.label, isRTL && commonStyles.arabicText]}>
              Payment Method
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
                    styles.methodText,
                    formData.payment_method === method && styles.methodTextActive,
                    isRTL && commonStyles.arabicText
                  ]}>
                    {method}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Summary */}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, isRTL && commonStyles.arabicText]}>
                Subtotal:
              </Text>
              <Text style={[styles.summaryValue, isRTL && commonStyles.arabicText]}>
                {formatCurrency(formData.subtotal)}
              </Text>
            </View>
            {formData.discount_percentage > 0 && (
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, isRTL && commonStyles.arabicText]}>
                  Discount ({formData.discount_percentage}%):
                </Text>
                <Text style={[styles.summaryValue, isRTL && commonStyles.arabicText]}>
                  -{formatCurrency(formData.subtotal * (formData.discount_percentage / 100))}
                </Text>
              </View>
            )}
            {formData.tax_amount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, isRTL && commonStyles.arabicText]}>
                  Tax ({formData.tax_percentage}%):
                </Text>
                <Text style={[styles.summaryValue, isRTL && commonStyles.arabicText]}>
                  {formatCurrency(formData.tax_amount)}
                </Text>
              </View>
            )}
            {formData.shipping_cost > 0 && (
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, isRTL && commonStyles.arabicText]}>
                  Shipping:
                </Text>
                <Text style={[styles.summaryValue, isRTL && commonStyles.arabicText]}>
                  {formatCurrency(formData.shipping_cost)}
                </Text>
              </View>
            )}
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={[styles.totalLabel, isRTL && commonStyles.arabicText]}>
                Total:
              </Text>
              <Text style={[styles.totalValue, isRTL && commonStyles.arabicText]}>
                {formatCurrency(formData.total)}
              </Text>
            </View>
          </View>
        </View>

        {/* Additional Information */}
        <View style={commonStyles.section}>
          <Text style={[commonStyles.sectionTitle, isRTL && commonStyles.arabicText]}>
            Additional Information
          </Text>
          
          <View style={commonStyles.inputGroup}>
            <Text style={[commonStyles.label, isRTL && commonStyles.arabicText]}>
              Description
            </Text>
            <TextInput
              style={[commonStyles.input, commonStyles.textArea, isRTL && commonStyles.arabicInput]}
              placeholder="Purchase description"
              value={formData.description}
              onChangeText={(value) => handleInputChange('description', value)}
              multiline
              numberOfLines={3}
              textAlign={isRTL ? 'right' : 'left'}
            />
          </View>

          <View style={commonStyles.inputGroup}>
            <Text style={[commonStyles.label, isRTL && commonStyles.arabicText]}>
              Notes
            </Text>
            <TextInput
              style={[commonStyles.input, commonStyles.textArea, isRTL && commonStyles.arabicInput]}
              placeholder="Additional notes"
              value={formData.notes}
              onChangeText={(value) => handleInputChange('notes', value)}
              multiline
              numberOfLines={3}
              textAlign={isRTL ? 'right' : 'left'}
            />
          </View>

          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => handleInputChange('is_paid', !formData.is_paid)}
            >
              <Ionicons
                name={formData.is_paid ? "checkbox" : "square-outline"}
                size={24}
                color={formData.is_paid ? "#6B7D3D" : "#666"}
              />
              <Text style={[styles.checkboxLabel, isRTL && commonStyles.arabicText]}>
                Mark as Paid
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[commonStyles.submitButton, loading && commonStyles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={[commonStyles.submitButtonText, isRTL && commonStyles.arabicText]}>
                Complete Quick Purchase
              </Text>
            </>
          )}
        </TouchableOpacity>

        <View style={commonStyles.bottomSpace} />
      </ScrollView>

      {/* Supplier Picker Modal */}
      <Modal
        visible={showSupplierPicker}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={commonStyles.modalContainer}>
          <View style={[commonStyles.modalHeader, isRTL && commonStyles.rtlModalHeader]}>
            <Text style={[commonStyles.modalTitle, isRTL && commonStyles.arabicText]}>
              Select Supplier
            </Text>
            <TouchableOpacity
              style={commonStyles.modalCloseButton}
              onPress={() => setShowSupplierPicker(false)}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={suppliers}
            keyExtractor={(item) => item.id.toString()}
            style={commonStyles.pickerList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={commonStyles.pickerItem}
                onPress={() => handleSupplierSelect(item)}
              >
                <View style={commonStyles.pickerItemContent}>
                  <Text style={[commonStyles.pickerItemName, isRTL && commonStyles.arabicText]}>
                    {item.name || item.supplier_name}
                  </Text>
                  {(item.contact || item.phone || item.email) && (
                    <Text style={[commonStyles.pickerItemDetails, isRTL && commonStyles.arabicText]}>
                      {item.contact || item.phone || item.email}
                    </Text>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={commonStyles.noDataContainer}>
                <Ionicons name="business-outline" size={48} color="#ccc" />
                <Text style={[commonStyles.noDataText, isRTL && commonStyles.arabicText]}>
                  No suppliers available
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
        <SafeAreaView style={commonStyles.modalContainer}>
          <View style={[commonStyles.modalHeader, isRTL && commonStyles.rtlModalHeader]}>
            <Text style={[commonStyles.modalTitle, isRTL && commonStyles.arabicText]}>
              Select Item
            </Text>
            <TouchableOpacity
              style={commonStyles.modalCloseButton}
              onPress={() => setShowItemPicker(false)}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={availableItems}
            keyExtractor={(item) => item.id.toString()}
            style={commonStyles.pickerList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={commonStyles.pickerItem}
                onPress={() => handleItemSelect(item)}
              >
                <View style={commonStyles.pickerItemContent}>
                  <Text style={[commonStyles.pickerItemName, isRTL && commonStyles.arabicText]}>
                    {item.name}
                  </Text>
                  <Text style={[commonStyles.pickerItemDetails, isRTL && commonStyles.arabicText]}>
                    Cost: {formatCurrency(item.unit_cost || item.cost || item.amount || 0)} • 
                    Price: {formatCurrency(item.unit_price || item.price || item.selling_price || 0)}
                    {item.description && ` • ${item.description}`}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={commonStyles.noDataContainer}>
                <Ionicons name="cube-outline" size={48} color="#ccc" />
                <Text style={[commonStyles.noDataText, isRTL && commonStyles.arabicText]}>
                  No items available
                </Text>
              </View>
            }
          />
        </SafeAreaView>
      </Modal>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={new Date(formData[datePickerType === 'po' ? 'po_date' : datePickerType === 'expected' ? 'expected_delivery_date' : datePickerType === 'invoice' ? 'invoice_date' : 'due_date'] || new Date())}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(107, 125, 61, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addItemText: {
    marginLeft: 6,
    color: '#6B7D3D',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyItemsContainer: {
    alignItems: 'center',
    padding: 30,
  },
  emptyItemsText: {
    marginTop: 10,
    color: '#999',
    fontSize: 14,
  },
  itemCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 12,
    color: '#666',
  },
  removeItemButton: {
    marginLeft: 10,
  },
  itemFields: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  itemField: {
    flex: 1,
    marginBottom: 0,
  },
  itemTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  itemTotalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  itemTotalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6B7D3D',
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
    borderRadius: 15,
  },
  methodOptionActive: {
    backgroundColor: '#6B7D3D',
  },
  methodText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  methodTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  summaryContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    marginTop: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingTop: 12,
    marginTop: 8,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#6B7D3D',
  },
  checkboxContainer: {
    marginTop: 10,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxLabel: {
    marginLeft: 10,
    fontSize: 14,
    color: '#333',
  },
});

export default QuickPurchaseScreen;

