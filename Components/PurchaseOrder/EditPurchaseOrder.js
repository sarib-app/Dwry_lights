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
// import { commonStyles } from '../shared/CommonStyles';
import commonStyles from '../Globals/CommonStyles';

const API_BASE_URL = 'https://planetdory.dwrylight.com/api';

const EditPurchaseOrderScreen = ({ navigation, route }) => {
  const { order } = route.params;
  
  const [formData, setFormData] = useState({
    supplier_name: order.supplier_name || '',
    po_date: order.po_date || new Date().toISOString().split('T')[0],
    expected_delivery_date: order.expected_delivery_date || '',
    items: order.items || [],
    tax_amount: parseFloat(order.tax_amount || 0),
    shipping_cost: parseFloat(order.shipping_cost || 0),
    notes: order.notes || ''
  });

  const [availableItems, setAvailableItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [showItemPicker, setShowItemPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerType, setDatePickerType] = useState('po');
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isRTL, setIsRTL] = useState(false);

  const translate = (key) => languageService.translate(key);

  useEffect(() => {
    initializeScreen();
    fetchItems();
  }, []);

  const initializeScreen = async () => {
    const language = await languageService.loadSavedLanguage();
    setCurrentLanguage(language);
    setIsRTL(language === 'ar');
  };

  // Fetch items
  const fetchItems = async () => {
    const token = await getAuthToken();
    if (!token) {
      setLoadingData(false);
      return;
    }

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
    } finally {
      setLoadingData(false);
    }
  };

  // Handle input change
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Calculate total amount
  const calculateTotal = () => {
    const itemsTotal = formData.items.reduce((sum, item) => sum + (item.quantity * item.unit_cost), 0);
    const taxAmount = parseFloat(formData.tax_amount) || 0;
    const shippingCost = parseFloat(formData.shipping_cost) || 0;
    return itemsTotal + taxAmount + shippingCost;
  };

  // Handle item selection
  const handleItemSelect = (item) => {
    const newItem = {
      name: item.name,
      qty: 1,
      selling_rate: parseFloat(item.amount || 0),
      description: item.description || '',
      images: item.images || []
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
      if (field === 'qty' || field === 'selling_rate') {
        newItems[index] = { ...newItems[index], [field]: parseFloat(value) || 0 };
      } else {
        newItems[index] = { ...newItems[index], [field]: value };
      }
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
      setFormData(prev => ({
        ...prev,
        [datePickerType === 'po' ? 'po_date' : 'expected_delivery_date']: dateString
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    if (!formData.supplier_name.trim()) {
      Alert.alert(translate('validationError'), translate('supplierNameRequired'));
      return false;
    }
    if (!formData.expected_delivery_date) {
      Alert.alert(translate('validationError'), translate('expectedDeliveryRequired'));
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
        supplier_name: formData.supplier_name,
        po_date: formData.po_date,
        expected_delivery_date: formData.expected_delivery_date,
        items: formData.items,
        tax_amount: parseFloat(formData.tax_amount),
        shipping_cost: parseFloat(formData.shipping_cost),
        notes: formData.notes
      };

      const response = await fetch(`${API_BASE_URL}/update_purchase_order/${order.id}`, {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log('Update purchase order response:', result);

      if (result.status == 200) {
        Alert.alert(
          translate('success'),
          translate('purchaseOrderUpdatedSuccessfully'),
          [{ text: translate('ok'), onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert(translate('error'), result.message || translate('failedToUpdatePurchaseOrder'));
      }
    } catch (error) {
      console.error('Update purchase order error:', error);
      Alert.alert(translate('error'), translate('networkErrorUpdatingPurchaseOrder'));
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
              {translate('editPurchaseOrder')}
            </Text>
            <View style={commonStyles.placeholder} />
          </View>
        </LinearGradient>
      </View>

      {/* Form */}
      <ScrollView style={commonStyles.content} showsVerticalScrollIndicator={false}>
        {/* Purchase Order Information */}
        <View style={commonStyles.section}>
          <Text style={[commonStyles.sectionTitle, isRTL && commonStyles.arabicText]}>
            {translate('purchaseOrderInformation')}
          </Text>
          
          <View style={commonStyles.inputGroup}>
            <Text style={[commonStyles.label, isRTL && commonStyles.arabicText]}>
              {translate('poNumber')}
            </Text>
            <View style={styles.readOnlyInput}>
              <Text style={[styles.readOnlyText, isRTL && commonStyles.arabicText]}>
                {order.po_number}
              </Text>
            </View>
          </View>
          
          <View style={commonStyles.row}>
            <View style={[commonStyles.inputGroup, commonStyles.halfWidth]}>
              <Text style={[commonStyles.label, isRTL && commonStyles.arabicText]}>
                {translate('poDate')} *
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
                {translate('expectedDelivery')} *
              </Text>
              <TouchableOpacity
                style={commonStyles.dateInput}
                onPress={() => {
                  setDatePickerType('delivery');
                  setShowDatePicker(true);
                }}
              >
                <Text style={[commonStyles.dateText, isRTL && commonStyles.arabicText]}>
                  {formData.expected_delivery_date || translate('selectExpectedDeliveryDate')}
                </Text>
                <Ionicons name="calendar" size={20} color="#666" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Supplier Information */}
        <View style={commonStyles.section}>
          <Text style={[commonStyles.sectionTitle, isRTL && commonStyles.arabicText]}>
            {translate('supplierInformation')}
          </Text>
          
          <View style={commonStyles.inputGroup}>
            <Text style={[commonStyles.label, isRTL && commonStyles.arabicText]}>
              {translate('supplierName')} *
            </Text>
            <TextInput
              style={[commonStyles.input, isRTL && commonStyles.arabicInput]}
              placeholder={translate('enterSupplierName')}
              value={formData.supplier_name}
              onChangeText={(value) => handleInputChange('supplier_name', value)}
              textAlign={isRTL ? 'right' : 'left'}
            />
          </View>
        </View>

        {/* Items Section */}
        <View style={commonStyles.section}>
          <View style={[commonStyles.sectionHeader, isRTL && commonStyles.rtlSectionHeader]}>
            <Text style={[commonStyles.sectionTitle, isRTL && commonStyles.arabicText]}>
              {translate('orderItems')}
            </Text>
            <TouchableOpacity
              style={commonStyles.addItemButton}
              onPress={() => setShowItemPicker(true)}
            >
              <Ionicons name="add-circle" size={20} color="#6B7D3D" />
              <Text style={[commonStyles.addItemText, isRTL && commonStyles.arabicText]}>
                {translate('addPOItem')}
              </Text>
            </TouchableOpacity>
          </View>

          {formData.items.map((item, index) => (
            <View key={index} style={commonStyles.itemCard}>
              <View style={[commonStyles.itemHeader, isRTL && commonStyles.rtlItemHeader]}>
                <Text style={[commonStyles.itemDescription, isRTL && commonStyles.arabicText]}>
                  {item.name || item.item_name}
                </Text>
                <TouchableOpacity
                  style={commonStyles.removeItemButton}
                  onPress={() => removeItem(index)}
                >
                  <Ionicons name="close-circle" size={20} color="#E74C3C" />
                </TouchableOpacity>
              </View>
              
              <View style={commonStyles.itemRow}>
                <View style={[commonStyles.itemInputGroup, commonStyles.flex1]}>
                  <Text style={[commonStyles.itemLabel, isRTL && commonStyles.arabicText]}>
                    {translate('orderQuantity')}
                  </Text>
                  <TextInput
                    style={[commonStyles.itemInput, isRTL && commonStyles.arabicInput]}
                    value={(item.qty || item.quantity || 0).toString()}
                    onChangeText={(value) => updateItem(index, 'qty', value)}
                    keyboardType="numeric"
                    textAlign={isRTL ? 'right' : 'left'}
                  />
                </View>
                
                <View style={[commonStyles.itemInputGroup, commonStyles.flex2]}>
                  <Text style={[commonStyles.itemLabel, isRTL && commonStyles.arabicText]}>
                    {translate('unitCost')}
                  </Text>
                  <TextInput
                    style={[commonStyles.itemInput, isRTL && commonStyles.arabicInput]}
                    value={(item.selling_rate || item.unit_cost || 0).toString()}
                    onChangeText={(value) => updateItem(index, 'selling_rate', value)}
                    keyboardType="decimal-pad"
                    textAlign={isRTL ? 'right' : 'left'}
                  />
                </View>
                
                <View style={[commonStyles.itemInputGroup, commonStyles.flex2]}>
                  <Text style={[commonStyles.itemLabel, isRTL && commonStyles.arabicText]}>
                    {translate('total')}
                  </Text>
                  <Text style={[commonStyles.itemTotal, isRTL && commonStyles.arabicText]}>
                    {formatCurrency((item.qty || item.quantity || 0) * (item.selling_rate || item.unit_cost || 0))}
                  </Text>
                </View>
              </View>

              {item.description && (
                <View style={styles.itemDescriptionContainer}>
                  <Text style={[styles.itemDescriptionLabel, isRTL && commonStyles.arabicText]}>
                    {translate('description')}:
                  </Text>
                  <Text style={[styles.itemDescriptionText, isRTL && commonStyles.arabicText]}>
                    {item.description}
                  </Text>
                </View>
              )}
            </View>
          ))}

          {formData.items.length === 0 && (
            <View style={commonStyles.noItemsContainer}>
              <Ionicons name="cube-outline" size={48} color="#ccc" />
              <Text style={[commonStyles.noItemsText, isRTL && commonStyles.arabicText]}>
                {translate('noItemsAdded')}
              </Text>
              <Text style={[commonStyles.noItemsSubtext, isRTL && commonStyles.arabicText]}>
                {translate('addItemsToPurchaseOrder')}
              </Text>
            </View>
          )}
        </View>

        {/* Financial Details */}
        <View style={commonStyles.section}>
          <Text style={[commonStyles.sectionTitle, isRTL && commonStyles.arabicText]}>
            {translate('financialDetails')}
          </Text>
          
          <View style={commonStyles.row}>
            <View style={[commonStyles.inputGroup, commonStyles.halfWidth]}>
              <Text style={[commonStyles.label, isRTL && commonStyles.arabicText]}>
                {translate('taxAmount')}
              </Text>
              <TextInput
                style={[commonStyles.input, isRTL && commonStyles.arabicInput]}
                placeholder="0"
                value={formData.tax_amount.toString()}
                onChangeText={(value) => handleInputChange('tax_amount', value)}
                keyboardType="decimal-pad"
                textAlign={isRTL ? 'right' : 'left'}
              />
            </View>

            <View style={[commonStyles.inputGroup, commonStyles.halfWidth]}>
              <Text style={[commonStyles.label, isRTL && commonStyles.arabicText]}>
                {translate('shippingCost')}
              </Text>
              <TextInput
                style={[commonStyles.input, isRTL && commonStyles.arabicInput]}
                placeholder="0"
                value={formData.shipping_cost.toString()}
                onChangeText={(value) => handleInputChange('shipping_cost', value)}
                keyboardType="decimal-pad"
                textAlign={isRTL ? 'right' : 'left'}
              />
            </View>
          </View>

          {/* Calculated Total */}
          <View style={commonStyles.calculatedSection}>
            <View style={[commonStyles.calculatedRow, commonStyles.totalRow]}>
              <Text style={[commonStyles.totalLabel, isRTL && commonStyles.arabicText]}>
                {translate('totalAmount')}:
              </Text>
              <Text style={[commonStyles.totalValue, isRTL && commonStyles.arabicText]}>
                {formatCurrency(calculateTotal())}
              </Text>
            </View>
          </View>
        </View>

        {/* Notes */}
        <View style={commonStyles.section}>
          <View style={commonStyles.inputGroup}>
            <Text style={[commonStyles.label, isRTL && commonStyles.arabicText]}>
              {translate('notes')}
            </Text>
            <TextInput
              style={[commonStyles.input, commonStyles.textArea, isRTL && commonStyles.arabicInput]}
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
          style={[commonStyles.submitButton, loading && commonStyles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="save" size={20} color="#fff" />
              <Text style={[commonStyles.submitButtonText, isRTL && commonStyles.arabicText]}>
                {translate('updatePurchaseOrder')}
              </Text>
            </>
          )}
        </TouchableOpacity>

        <View style={commonStyles.bottomSpace} />
      </ScrollView>

      {/* Item Picker Modal */}
      <Modal
        visible={showItemPicker}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={commonStyles.modalContainer}>
          <View style={[commonStyles.modalHeader, isRTL && commonStyles.rtlModalHeader]}>
            <Text style={[commonStyles.modalTitle, isRTL && commonStyles.arabicText]}>
              {translate('selectItem')}
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
                    {translate('price')}: {formatCurrency(item.amount)} • {translate('stock')}: {item.qty || 0}
                  </Text>
                  {item.description && (
                    <Text style={[styles.itemPickerDescription, isRTL && commonStyles.arabicText]} numberOfLines={1}>
                      {item.description}
                    </Text>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={commonStyles.noDataContainer}>
                <Ionicons name="cube-outline" size={48} color="#ccc" />
                <Text style={[commonStyles.noDataText, isRTL && commonStyles.arabicText]}>
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
          value={new Date(formData[datePickerType === 'po' ? 'po_date' : 'expected_delivery_date'] || Date.now())}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
    </SafeAreaView>
  );
};

// Screen-specific styles
const styles = StyleSheet.create({
  readOnlyInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#f5f5f5',
  },
  
  readOnlyText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  
  itemDescriptionContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  
  itemDescriptionLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    marginBottom: 4,
  },
  
  itemDescriptionText: {
    fontSize: 14,
    color: '#333',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  
  itemPickerDescription: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
    fontStyle: 'italic',
  },
});

export default EditPurchaseOrderScreen;