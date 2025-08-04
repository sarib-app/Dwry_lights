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
import languageService from '../Globals/Store/Lang';

const API_BASE_URL = 'https://planetdory.dwrylight.com/api';

const AddInventoryScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    item_id: '',
    po_number: '',
    item_name: '',
    description: '',
    quantity: '',
    cost: '',
    vat_percentage: '15',
    vat_amount: '',
    vendor: '',
    subtotal: '',
    total: '',
    shipment_cost: '',
  });
  const [availableItems, setAvailableItems] = useState([]);
  const [selectedPO, setSelectedPO] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingItems, setLoadingItems] = useState(true);
  const [showItemPicker, setShowItemPicker] = useState(false);
  const [authToken, setAuthToken] = useState('');
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

  // Get auth token from AsyncStorage
  const getAuthToken = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        setAuthToken(`Bearer ${token}`);
        return `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return null;
  };

  // Fetch all items for the dropdown
  const fetchItems = async () => {
    try {
      const token = await getAuthToken();
      if (!token) {
        Alert.alert(translate('error'), translate('authTokenNotFound'));
        return;
      }

      const response = await fetch(`${API_BASE_URL}/fetch_all_items`, {
        method: 'GET',
        headers: {
          'Authorization': token,
        },
      });
      
      const result = await response.json();
      console.log('Items API Response:', result);
      
      if (result.status == 200) {
        setAvailableItems(result.data || []);
      } else {
        Alert.alert(translate('error'), result.message || translate('failedToFetchItems'));
      }
    } catch (error) {
      console.error('Fetch items error:', error);
      Alert.alert(translate('error'), translate('networkErrorFetchingItems'));
    } finally {
      setLoadingItems(false);
    }
  };

  // Handle PO selection
  const handlePOSelection = () => {
    navigation.navigate('POSelectorScreen', {
      selectedPOId: selectedPO?.id,
      onPOSelect: (po) => {
        setSelectedPO(po);
        setFormData(prev => ({
          ...prev,
          po_number: po ? po.po_number : ''
        }));
      }
    });
  };

  // Handle input change
  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Auto-calculate totals when relevant fields change
      if (['quantity', 'cost', 'vat_percentage', 'shipment_cost'].includes(field)) {
        const quantity = parseFloat(newData.quantity) || 0;
        const cost = parseFloat(newData.cost) || 0;
        const vatPercentage = parseFloat(newData.vat_percentage) || 0;
        const shipmentCost = parseFloat(newData.shipment_cost) || 0;
        
        const subtotal = quantity * cost;
        const vatAmount = (subtotal * vatPercentage) / 100;
        const total = subtotal + vatAmount + shipmentCost;
        
        newData.subtotal = subtotal.toString();
        newData.vat_amount = vatAmount.toString();
        newData.total = total.toString();
      }
      
      return newData;
    });
  };

  // Handle item selection
  const handleItemSelect = (item) => {
    setFormData(prev => ({
      ...prev,
      item_id: item.id,
      item_name: item.name,
      description: item.description || '',
      cost: item.amount?.toString() || '',
    }));
    setShowItemPicker(false);
  };

  // Validate form
  const validateForm = () => {
    if (!formData.item_name.trim()) {
      Alert.alert(translate('validationError'), translate('itemNameRequired'));
      return false;
    }
    if (!formData.quantity || isNaN(formData.quantity) || parseInt(formData.quantity) < 0) {
      Alert.alert(translate('validationError'), translate('validQuantityRequired'));
      return false;
    }
    if (!formData.cost || isNaN(formData.cost) || parseFloat(formData.cost) < 0) {
      Alert.alert(translate('validationError'), translate('validCostRequired'));
      return false;
    }
    if (!formData.po_number.trim()) {
      Alert.alert(translate('validationError'), translate('poNumberRequired'));
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
        item_id: parseInt(formData.item_id) || null,
        po_number: formData.po_number,
        item_name: formData.item_name,
        description: formData.description,
        quantity: parseInt(formData.quantity),
        cost: parseFloat(formData.cost),
        vat_percentage: parseFloat(formData.vat_percentage) || 0,
        vat_amount: parseFloat(formData.vat_amount) || 0,
        vendor: formData.vendor,
        subtotal: parseFloat(formData.subtotal) || 0,
        shipment_cost: parseFloat(formData.shipment_cost) || 0,
        total: parseFloat(formData.total) || 0,
      };

      console.log('Inventory Payload:', payload);

      const response = await fetch(`${API_BASE_URL}/make_inventory`, {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log('Add inventory response:', result);

      if (result.status == 200) {
        Alert.alert(
          translate('success'),
          translate('inventoryAddedSuccessfully'),
          [
            {
              text: translate('ok'),
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert(translate('error'), result.message || translate('failedToAddInventory'));
      }
    } catch (error) {
      console.error('Add inventory error:', error);
      Alert.alert(translate('error'), translate('networkErrorAddingInventory'));
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    const number = parseFloat(amount) || 0;
    return isRTL ? `${number.toFixed(2)} ر.س` : `$${number.toFixed(2)}`;
  };

  // Render item in picker
  const renderItemPickerItem = ({ item }) => (
    <TouchableOpacity
      style={styles.pickerItem}
      onPress={() => handleItemSelect(item)}
    >
      <View style={styles.pickerItemContent}>
        <Text style={[styles.pickerItemName, isRTL && styles.arabicText]}>
          {item.name}
        </Text>
        {item.name_ar && (
          <Text style={[styles.pickerItemNameAr, isRTL && styles.arabicText]}>
            {item.name_ar}
          </Text>
        )}
        <Text style={[styles.pickerItemPrice, isRTL && styles.arabicText]}>
          {translate('price')}: {formatCurrency(item.amount || 0)}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#666" />
    </TouchableOpacity>
  );

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
              {translate('addInventory')}
            </Text>
            <View style={styles.placeholder} />
          </View>
        </LinearGradient>
      </View>

      {/* Form */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* PO Selection - New Section */}
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
                    : translate('selectPOPlaceholder')
                  }
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
            {selectedPO && (
              <View style={styles.poInfo}>
                <Text style={[styles.poInfoText, isRTL && styles.arabicText]}>
                  {translate('supplier')}: {selectedPO.supplier_name || translate('noSupplier')}
                </Text>
                {selectedPO.description && (
                  <Text style={[styles.poInfoText, isRTL && styles.arabicText]}>
                    {selectedPO.description}
                  </Text>
                )}
              </View>
            )}
          </View>
        </View>

        {/* Item Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isRTL && styles.arabicText]}>
            {translate('itemInformation')}
          </Text>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, isRTL && styles.arabicText]}>
              {translate('selectItem')} *
            </Text>
            <TouchableOpacity
              style={styles.itemSelector}
              onPress={() => setShowItemPicker(true)}
            >
              <Text style={[
                styles.itemSelectorText, 
                !formData.item_name && styles.placeholder,
                isRTL && styles.arabicText
              ]}>
                {formData.item_name || translate('selectItemFromInventory')}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, isRTL && styles.arabicText]}>
              {translate('itemNameManualEntry')}
            </Text>
            <TextInput
              style={[styles.input, isRTL && styles.arabicInput]}
              placeholder={translate('orEnterItemNameManually')}
              value={formData.item_name}
              onChangeText={(value) => handleInputChange('item_name', value)}
              textAlign={isRTL ? 'right' : 'left'}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, isRTL && styles.arabicText]}>
              {translate('description')}
            </Text>
            <TextInput
              style={[styles.input, styles.textArea, isRTL && styles.arabicInput]}
              placeholder={translate('enterItemDescription')}
              value={formData.description}
              onChangeText={(value) => handleInputChange('description', value)}
              multiline
              numberOfLines={3}
              textAlign={isRTL ? 'right' : 'left'}
            />
          </View>
        </View>

        {/* Quantity & Cost */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isRTL && styles.arabicText]}>
            {translate('quantityAndPricing')}
          </Text>
          
          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={[styles.label, isRTL && styles.arabicText]}>
                {translate('quantity')} *
              </Text>
              <TextInput
                style={[styles.input, isRTL && styles.arabicInput]}
                placeholder="0"
                value={formData.quantity}
                onChangeText={(value) => handleInputChange('quantity', value)}
                keyboardType="numeric"
                textAlign={isRTL ? 'right' : 'left'}
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={[styles.label, isRTL && styles.arabicText]}>
                {translate('costPerUnit')} *
              </Text>
              <TextInput
                style={[styles.input, isRTL && styles.arabicInput]}
                placeholder="0.00"
                value={formData.cost}
                onChangeText={(value) => handleInputChange('cost', value)}
                keyboardType="decimal-pad"
                textAlign={isRTL ? 'right' : 'left'}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, isRTL && styles.arabicText]}>
              {translate('vendor')}
            </Text>
            <TextInput
              style={[styles.input, isRTL && styles.arabicInput]}
              placeholder={translate('enterVendorName')}
              value={formData.vendor}
              onChangeText={(value) => handleInputChange('vendor', value)}
              textAlign={isRTL ? 'right' : 'left'}
            />
          </View>
        </View>

        {/* Financial Details */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isRTL && styles.arabicText]}>
            {translate('financialDetails')}
          </Text>
          
          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={[styles.label, isRTL && styles.arabicText]}>
                {translate('vatPercentage')}
              </Text>
              <TextInput
                style={[styles.input, isRTL && styles.arabicInput]}
                placeholder="15"
                value={formData.vat_percentage}
                onChangeText={(value) => handleInputChange('vat_percentage', value)}
                keyboardType="decimal-pad"
                textAlign={isRTL ? 'right' : 'left'}
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={[styles.label, isRTL && styles.arabicText]}>
                {translate('shipmentCost')}
              </Text>
              <TextInput
                style={[styles.input, isRTL && styles.arabicInput]}
                placeholder="0.00"
                value={formData.shipment_cost}
                onChangeText={(value) => handleInputChange('shipment_cost', value)}
                keyboardType="decimal-pad"
                textAlign={isRTL ? 'right' : 'left'}
              />
            </View>
          </View>

          {/* Calculated Fields */}
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
                {translate('vatAmount')}:
              </Text>
              <Text style={[styles.calculatedValue, isRTL && styles.arabicText]}>
                {formatCurrency(formData.vat_amount)}
              </Text>
            </View>

            <View style={styles.calculatedRow}>
              <Text style={[styles.calculatedLabel, isRTL && styles.arabicText]}>
                {translate('shipmentCost')}:
              </Text>
              <Text style={[styles.calculatedValue, isRTL && styles.arabicText]}>
                {formatCurrency(formData.shipment_cost)}
              </Text>
            </View>
            
            <View style={[styles.calculatedRow, styles.totalRow]}>
              <Text style={[styles.totalLabel, isRTL && styles.arabicText]}>
                {translate('totalAmount')}:
              </Text>
              <Text style={[styles.totalValue, isRTL && styles.arabicText]}>
                {formatCurrency(formData.total)}
              </Text>
            </View>
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
              <Text style={[styles.submitButtonText, isRTL && styles.arabicText]}>
                {translate('addToInventory')}
              </Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.bottomSpace} />
      </ScrollView>

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
          
          {loadingItems ? (
            <View style={styles.modalLoading}>
              <ActivityIndicator size="large" color="#6B7D3D" />
              <Text style={[styles.modalLoadingText, isRTL && styles.arabicText]}>
                {translate('loadingItems')}
              </Text>
            </View>
          ) : (
            <>
              {availableItems.length > 0 ? (
                <FlatList
                  data={availableItems}
                  renderItem={renderItemPickerItem}
                  keyExtractor={(item) => item.id.toString()}
                  style={styles.pickerList}
                  showsVerticalScrollIndicator={false}
                />
              ) : (
                <View style={styles.noItemsContainer}>
                  <Ionicons name="cube-outline" size={48} color="#ccc" />
                  <Text style={[styles.noItemsText, isRTL && styles.arabicText]}>
                    {translate('noItemsAvailable')}
                  </Text>
                  <Text style={[styles.noItemsSubtext, isRTL && styles.arabicText]}>
                    {translate('addItemsFirstToCreateInventory')}
                  </Text>
                </View>
              )}
            </>
          )}
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
  poInfo: {
    marginTop: 8,
    paddingLeft: 30,
  },
  poInfoText: {
    fontSize: 12,
    color: '#6B7D3D',
    fontStyle: 'italic',
    marginBottom: 2,
  },
  itemSelector: {
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
  itemSelectorText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  placeholder: {
    color: '#999',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  halfWidth: {
    flex: 1,
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
  modalLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalLoadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
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
  pickerItemNameAr: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  pickerItemPrice: {
    fontSize: 14,
    color: '#6B7D3D',
    fontWeight: '500',
  },
  noItemsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  noItemsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 15,
    marginBottom: 8,
  },
  noItemsSubtext: {
    fontSize: 14,
    color: '#bbb',
    textAlign: 'center',
  },
  
  // RTL Support
  arabicText: {
    textAlign: 'right',
    fontFamily: 'Arabic',
  },
});

export default AddInventoryScreen;