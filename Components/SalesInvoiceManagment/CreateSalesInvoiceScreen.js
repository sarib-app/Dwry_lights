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
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import languageService from '../Globals/Store/Lang';

const API_BASE_URL = 'https://planetdory.dwrylight.com/api';

const CreateSalesInvoiceScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    customer_id: '',
    invoice_number: `INV-${Date.now()}`,
    invoice_date: new Date(),
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    items: [],
    subtotal: 0,
    tax_percentage: 15,
    tax_amount: 0,
    discount_percentage: 0,
    discount_amount: 0,
    total_amount: 0,
    payment_status: 'pending',
    payment_method: '',
    notes: '',
    created_by: '',
  });

  const [customers, setCustomers] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  
  const [showCustomerPicker, setShowCustomerPicker] = useState(false);
  const [showPaymentMethodPicker, setShowPaymentMethodPicker] = useState(false);
  const [showPaymentStatusPicker, setShowPaymentStatusPicker] = useState(false);
  const [showItemPicker, setShowItemPicker] = useState(false);
  const [showInvoiceDatePicker, setShowInvoiceDatePicker] = useState(false);
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);

  const paymentMethods = ['Cash', 'Card', 'Bank Transfer', 'Check', 'Digital Wallet'];
  const paymentStatuses = ['pending', 'paid', 'partial'];

  const translate = (key) => languageService.translate(key);

  // Get auth data from AsyncStorage
  const getAuthData = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const userIdFromStorage = await AsyncStorage.getItem('userId');
      
      if (userIdFromStorage) {
        setFormData(prev => ({ ...prev, created_by: parseInt(userIdFromStorage) }));
      }
      
      if (token) {
        return `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth data:', error);
    }
    return null;
  };

  // Fetch customers and items
  const fetchInitialData = async () => {
    try {
      const token = await getAuthData();
      if (!token) return;

      // Fetch customers
      const customersResponse = await fetch(`${API_BASE_URL}/fetch_all_customers`, {
        method: 'GET',
        headers: { 'Authorization': token },
      });
      const customersResult = await customersResponse.json();
      if (customersResult.status == 200) {
        setCustomers(customersResult.data?.data || customersResult.data || []);
      }

      // Fetch items
      const itemsResponse = await fetch(`${API_BASE_URL}/fetch_all_items`, {
        method: 'GET',
        headers: { 'Authorization': token },
      });
      const itemsResult = await itemsResponse.json();
      if (itemsResult.status == 200) {
        setAvailableItems(itemsResult.data || []);
      }

    } catch (error) {
      console.error('Error fetching initial data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Handle input change
  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Auto-calculate totals when relevant fields change
      if (['tax_percentage', 'discount_percentage', 'discount_amount'].includes(field) || field === 'items') {
        const subtotal = newData.items.reduce((sum, item) => sum + (item.qty * item.price), 0);
        const discountAmount = parseFloat(newData.discount_amount) || 0;
        const taxAmount = (subtotal - discountAmount) * (parseFloat(newData.tax_percentage) / 100);
        const totalAmount = subtotal - discountAmount + taxAmount;
        
        newData.subtotal = subtotal;
        newData.tax_amount = taxAmount;
        newData.total_amount = totalAmount;
      }
      
      return newData;
    });
  };

  // Add item to invoice
  const addItem = (item) => {
    const newItem = {
      item_id: item.id,
      description: item.name,
      qty: 1,
      price: parseFloat(item.selling_rate || item.amount || 0),
    };
    
    const updatedItems = [...formData.items, newItem];
    handleInputChange('items', updatedItems);
    setShowItemPicker(false);
  };

  // Update item in invoice
  const updateItem = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = { ...updatedItems[index], [field]: field === 'qty' || field === 'price' ? parseFloat(value) || 0 : value };
    handleInputChange('items', updatedItems);
  };

  // Remove item from invoice
  const removeItem = (index) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    handleInputChange('items', updatedItems);
  };

  // Validate form
  const validateForm = () => {
    if (!formData.customer_id) {
      Alert.alert('Validation Error', 'Please select a customer');
      return false;
    }
    if (!formData.invoice_number.trim()) {
      Alert.alert('Validation Error', 'Invoice number is required');
      return false;
    }
    if (formData.items.length === 0) {
      Alert.alert('Validation Error', 'Please add at least one item');
      return false;
    }
    return true;
  };

  // Submit form
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      const token = await getAuthData();
      if (!token) {
        Alert.alert('Error', 'Authentication token not found');
        return;
      }

      const payload = {
        customer_id: parseInt(formData.customer_id),
        invoice_number: formData.invoice_number,
        invoice_date: formData.invoice_date.toISOString().split('T')[0],
        due_date: formData.due_date.toISOString().split('T')[0],
        items: formData.items,
        subtotal: formData.subtotal,
        tax_percentage: formData.tax_percentage,
        tax_amount: formData.tax_amount,
        discount_percentage: formData.discount_percentage,
        discount_amount: formData.discount_amount,
        total_amount: formData.total_amount,
        payment_status: formData.payment_status,
        payment_method: formData.payment_method,
        notes: formData.notes,
        created_by: formData.created_by,
      };

      const response = await fetch(`${API_BASE_URL}/add_sale_invoice`, {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log('Create invoice response:', result);

      if (result.status == 200) {
        Alert.alert(
          'Success',
          'Sales invoice created successfully!',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert('Error', result.message || 'Failed to create sales invoice');
      }
    } catch (error) {
      console.error('Create invoice error:', error);
      Alert.alert('Error', 'Network error while creating sales invoice');
    } finally {
      setLoading(false);
    }
  };

  // Date change handlers
  const onInvoiceDateChange = (event, selectedDate) => {
    setShowInvoiceDatePicker(false);
    if (selectedDate) {
      handleInputChange('invoice_date', selectedDate);
    }
  };

  const onDueDateChange = (event, selectedDate) => {
    setShowDueDatePicker(false);
    if (selectedDate) {
      handleInputChange('due_date', selectedDate);
    }
  };

  // Render picker item
  const renderPickerItem = (item, onSelect, labelField = 'name') => (
    <TouchableOpacity
      style={styles.pickerItem}
      onPress={() => onSelect(item)}
    >
      <Text style={styles.pickerItemText}>{item[labelField]}</Text>
      <Ionicons name="chevron-forward" size={20} color="#666" />
    </TouchableOpacity>
  );

  if (loadingData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B7D3D" />
        <Text style={styles.loadingText}>Loading data...</Text>
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
            <Text style={styles.headerTitle}>Create Sales Invoice</Text>
            <View style={styles.placeholder} />
          </View>
        </LinearGradient>
      </View>

      {/* Form */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Invoice Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Invoice Details</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Invoice Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="INV-001"
              value={formData.invoice_number}
              onChangeText={(value) => handleInputChange('invoice_number', value)}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Invoice Date *</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowInvoiceDatePicker(true)}
              >
                <Text style={styles.dateText}>
                  {formData.invoice_date.toLocaleDateString()}
                </Text>
                <Ionicons name="calendar" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Due Date</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDueDatePicker(true)}
              >
                <Text style={styles.dateText}>
                  {formData.due_date.toLocaleDateString()}
                </Text>
                <Ionicons name="calendar" size={20} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Customer *</Text>
            <TouchableOpacity
              style={styles.selector}
              onPress={() => setShowCustomerPicker(true)}
            >
              <Text style={[styles.selectorText, !formData.customer_id && styles.placeholder]}>
                {formData.customer_id 
                  ? customers.find(c => c.id == formData.customer_id)?.name || 'Select customer'
                  : 'Select customer'
                }
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Items Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Items ({formData.items.length})</Text>
            <TouchableOpacity
              style={styles.addItemButton}
              onPress={() => setShowItemPicker(true)}
            >
              <Ionicons name="add" size={20} color="#6B7D3D" />
              <Text style={styles.addItemText}>Add Item</Text>
            </TouchableOpacity>
          </View>

          {formData.items.map((item, index) => (
            <View key={index} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemDescription}>{item.description}</Text>
                <TouchableOpacity
                  style={styles.removeItemButton}
                  onPress={() => removeItem(index)}
                >
                  <Ionicons name="close-circle" size={20} color="#E74C3C" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.itemInputs}>
                <View style={styles.itemInputGroup}>
                  <Text style={styles.itemLabel}>Qty</Text>
                  <TextInput
                    style={styles.itemInput}
                    value={item.qty.toString()}
                    onChangeText={(value) => updateItem(index, 'qty', value)}
                    keyboardType="numeric"
                  />
                </View>
                
                <View style={styles.itemInputGroup}>
                  <Text style={styles.itemLabel}>Price</Text>
                  <TextInput
                    style={styles.itemInput}
                    value={item.price.toString()}
                    onChangeText={(value) => updateItem(index, 'price', value)}
                    keyboardType="decimal-pad"
                  />
                </View>
                
                <View style={styles.itemInputGroup}>
                  <Text style={styles.itemLabel}>Total</Text>
                  <Text style={styles.itemTotal}>${(item.qty * item.price).toFixed(2)}</Text>
                </View>
              </View>
            </View>
          ))}

          {formData.items.length === 0 && (
            <View style={styles.noItemsContainer}>
              <Text style={styles.noItemsText}>No items added yet</Text>
              <TouchableOpacity
                style={styles.addFirstItemButton}
                onPress={() => setShowItemPicker(true)}
              >
                <Text style={styles.addFirstItemText}>Add First Item</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Calculations Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Calculations</Text>
          
          <View style={styles.calculationRow}>
            <Text style={styles.calculationLabel}>Subtotal:</Text>
            <Text style={styles.calculationValue}>${formData.subtotal.toFixed(2)}</Text>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Discount Amount</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              value={formData.discount_amount.toString()}
              onChangeText={(value) => handleInputChange('discount_amount', parseFloat(value) || 0)}
              keyboardType="decimal-pad"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tax Percentage (%)</Text>
            <TextInput
              style={styles.input}
              placeholder="15"
              value={formData.tax_percentage.toString()}
              onChangeText={(value) => handleInputChange('tax_percentage', parseFloat(value) || 0)}
              keyboardType="decimal-pad"
            />
          </View>
          
          <View style={styles.calculationRow}>
            <Text style={styles.calculationLabel}>Tax Amount:</Text>
            <Text style={styles.calculationValue}>${formData.tax_amount.toFixed(2)}</Text>
          </View>
          
          <View style={[styles.calculationRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Amount:</Text>
            <Text style={styles.totalValue}>${formData.total_amount.toFixed(2)}</Text>
          </View>
        </View>

        {/* Payment Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Details</Text>
          
          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Payment Status</Text>
              <TouchableOpacity
                style={styles.selector}
                onPress={() => setShowPaymentStatusPicker(true)}
              >
                <Text style={styles.selectorText}>{formData.payment_status}</Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Payment Method</Text>
              <TouchableOpacity
                style={styles.selector}
                onPress={() => setShowPaymentMethodPicker(true)}
              >
                <Text style={[styles.selectorText, !formData.payment_method && styles.placeholder]}>
                  {formData.payment_method || 'Select method'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Additional notes..."
              value={formData.notes}
              onChangeText={(value) => handleInputChange('notes', value)}
              multiline
              numberOfLines={3}
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
              <Ionicons name="checkmark" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>Create Invoice</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* Date Pickers */}
      {showInvoiceDatePicker && (
        <DateTimePicker
          value={formData.invoice_date}
          mode="date"
          display="default"
          onChange={onInvoiceDateChange}
        />
      )}

      {showDueDatePicker && (
        <DateTimePicker
          value={formData.due_date}
          mode="date"
          display="default"
          onChange={onDueDateChange}
        />
      )}

      {/* Customer Picker Modal */}
      <Modal visible={showCustomerPicker} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Customer</Text>
            <TouchableOpacity onPress={() => setShowCustomerPicker(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={customers}
            renderItem={({ item }) => renderPickerItem(item, (customer) => {
              handleInputChange('customer_id', customer.id);
              setShowCustomerPicker(false);
            })}
            keyExtractor={(item) => item.id.toString()}
            style={styles.pickerList}
          />
        </SafeAreaView>
      </Modal>

      {/* Item Picker Modal */}
      <Modal visible={showItemPicker} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Item</Text>
            <TouchableOpacity onPress={() => setShowItemPicker(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={availableItems}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.pickerItem} onPress={() => addItem(item)}>
                <View>
                  <Text style={styles.pickerItemText}>{item.name}</Text>
                  <Text style={styles.pickerItemSubtext}>Price: ${item.selling_rate || item.amount || 0}</Text>
                </View>
                <Ionicons name="add-circle" size={24} color="#6B7D3D" />
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id.toString()}
            style={styles.pickerList}
          />
        </SafeAreaView>
      </Modal>

      {/* Payment Method Picker Modal */}
      <Modal visible={showPaymentMethodPicker} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Payment Method</Text>
            <TouchableOpacity onPress={() => setShowPaymentMethodPicker(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={paymentMethods}
            renderItem={({ item }) => renderPickerItem({ name: item }, (method) => {
              handleInputChange('payment_method', method.name);
              setShowPaymentMethodPicker(false);
            })}
            keyExtractor={(item) => item}
            style={styles.pickerList}
          />
        </SafeAreaView>
      </Modal>

      {/* Payment Status Picker Modal */}
      <Modal visible={showPaymentStatusPicker} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Payment Status</Text>
            <TouchableOpacity onPress={() => setShowPaymentStatusPicker(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={paymentStatuses}
            renderItem={({ item }) => renderPickerItem({ name: item }, (status) => {
              handleInputChange('payment_status', status.name);
              setShowPaymentStatusPicker(false);
            })}
            keyExtractor={(item) => item}
            style={styles.pickerList}
          />
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 15,
  },
  halfWidth: {
    flex: 1,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  placeholder: {
    color: '#999',
  },
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(107, 125, 61, 0.1)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addItemText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#6B7D3D',
    fontWeight: '600',
  },
  itemCard: {
    backgroundColor: '#f8fafb',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
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
  itemInputs: {
    flexDirection: 'row',
    gap: 10,
  },
  itemInputGroup: {
    flex: 1,
  },
  itemLabel: {
    fontSize: 12,
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
    fontWeight: '600',
    color: '#6B7D3D',
    textAlign: 'center',
    paddingVertical: 8,
  },
  noItemsContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  noItemsText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  addFirstItemButton: {
    backgroundColor: '#6B7D3D',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  addFirstItemText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  calculationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  calculationLabel: {
    fontSize: 16,
    color: '#666',
  },
  calculationValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  totalRow: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6B7D3D',
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
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
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
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
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
  pickerItemText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  pickerItemSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
});

export default CreateSalesInvoiceScreen;