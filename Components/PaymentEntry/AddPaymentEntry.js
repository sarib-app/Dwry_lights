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

const AddPaymentEntryScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    bank_id: '',
    type: 'credit',
    payment_type: 'sales_invoice',
    reference_id: '',
    payment_date: new Date().toISOString().split('T')[0],
    amount: '',
    payment_method: 'Cash',
    transaction_reference: '',
    notes: '',
    recorded_by: 1
  });

  const [banks, setBanks] = useState([]);
  const [salesInvoices, setSalesInvoices] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [referenceData, setReferenceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [showBankPicker, setShowBankPicker] = useState(false);
  const [showReferencePicker, setShowReferencePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isRTL, setIsRTL] = useState(false);

  const translate = (key) => languageService.translate(key);

  const paymentTypes = [
    { key: 'sales_invoice', label: translate('sales_invoice') },
    { key: 'purchase_invoice', label: translate('purchase_invoice') },
    { key: 'expense', label: translate('expense') },
  ];

  const paymentMethods = ['Cash', 'Bank Transfer', 'Check', 'Card'];
  const transactionTypes = [
    { key: 'credit', label: translate('credit') },
    { key: 'debit', label: translate('debit') },
  ];

  useEffect(() => {
    initializeScreen();
    fetchInitialData();
  }, []);

  useEffect(() => {
    // Update reference data when payment type changes
    updateReferenceData();
  }, [formData.payment_type]);

  const initializeScreen = async () => {
    const language = await languageService.loadSavedLanguage();
    setCurrentLanguage(language);
    setIsRTL(language === 'ar');
  };

  const fetchInitialData = async () => {
    await Promise.all([fetchBanks(), fetchSalesInvoices(), fetchExpenses()]);
    setLoadingData(false);
  };

  // Fetch banks
  const fetchBanks = async () => {
    const token = await getAuthToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/fetch_all_banks`, {
        method: 'GET',
        headers: { 'Authorization': token },
      });
      
      const result = await response.json();
      if (result.status == 200) {
        setBanks(result.data || []);
      }
    } catch (error) {
      console.error('Fetch banks error:', error);
    }
  };

  // Fetch sales invoices
  const fetchSalesInvoices = async () => {
    const token = await getAuthToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/fetch_all_sale_invoices`, {
        method: 'GET',
        headers: { 'Authorization': token },
      });
      
      const result = await response.json();
      if (result.status == 200) {
        setSalesInvoices(result.data || []);
      }
    } catch (error) {
      console.error('Fetch sales invoices error:', error);
    }
  };

  // Fetch expenses
  const fetchExpenses = async () => {
    const token = await getAuthToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/fetch_all_expenses`, {
        method: 'GET',
        headers: { 'Authorization': token },
      });
      
      const result = await response.json();
      if (result.status == 200) {
        setExpenses(result.data || []);
      }
    } catch (error) {
      console.error('Fetch expenses error:', error);
    }
  };

  // Update reference data based on payment type
  const updateReferenceData = () => {
    switch (formData.payment_type) {
      case 'sales_invoice':
        setReferenceData(salesInvoices);
        break;
      case 'purchase_invoice':
        // Will be implemented when purchase invoice API is available
        setReferenceData([]);
        break;
      case 'expense':
        setReferenceData(expenses);
        break;
      default:
        setReferenceData([]);
    }
    // Reset reference_id when payment type changes
    setFormData(prev => ({ ...prev, reference_id: '' }));
  };

  // Handle input change
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle bank selection
  const handleBankSelect = (bank) => {
    setFormData(prev => ({ ...prev, bank_id: bank.id }));
    setShowBankPicker(false);
  };

  // Handle reference selection
  const handleReferenceSelect = (reference) => {
    setFormData(prev => ({ ...prev, reference_id: reference.id }));
    setShowReferencePicker(false);
  };

  // Handle date selection
  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const dateString = selectedDate.toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, payment_date: dateString }));
    }
  };

  // Validate form
  const validateForm = () => {
    if (!formData.bank_id) {
      Alert.alert(translate('validationError'), translate('bankRequired'));
      return false;
    }
    if (!formData.reference_id) {
      Alert.alert(translate('validationError'), translate('referenceRequired'));
      return false;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      Alert.alert(translate('validationError'), translate('validAmountRequired'));
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
        bank_id: parseInt(formData.bank_id),
        type: formData.type,
        payment_type: formData.payment_type,
        reference_id: parseInt(formData.reference_id),
        payment_date: formData.payment_date,
        amount: parseFloat(formData.amount),
        payment_method: formData.payment_method,
        transaction_reference: formData.transaction_reference,
        notes: formData.notes,
        recorded_by: formData.recorded_by
      };

      const response = await fetch(`${API_BASE_URL}/add_payment_entry`, {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log('Add payment entry response:', result);

      if (result.status == 200) {
        Alert.alert(
          translate('success'),
          translate('paymentEntryCreatedSuccessfully'),
          [{ text: translate('ok'), onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert(translate('error'), result.message || translate('failedToCreatePaymentEntry'));
      }
    } catch (error) {
      console.error('Add payment entry error:', error);
      Alert.alert(translate('error'), translate('networkErrorCreatingPaymentEntry'));
    } finally {
      setLoading(false);
    }
  };

  // Get selected bank
  const selectedBank = banks.find(b => b.id == formData.bank_id);

  // Get selected reference
  const getSelectedReference = () => {
    const reference = referenceData.find(r => r.id == formData.reference_id);
    if (!reference) return null;

    switch (formData.payment_type) {
      case 'sales_invoice':
        return {
          title: reference.invoice_number,
          subtitle: `${translate('customer')}: ${reference.customer?.name || ''} • ${translate('amount')}: ${formatCurrency(reference.total_amount)}`
        };
      case 'expense':
        return {
          title: reference.description,
          subtitle: `${translate('category')}: ${reference.category} • ${translate('amount')}: ${formatCurrency(reference.amount)}`
        };
      default:
        return { title: reference.name || reference.title, subtitle: '' };
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    const number = parseFloat(amount) || 0;
    return isRTL ? `${number.toFixed(2)} ر.س` : `$${number.toFixed(2)}`;
  };

  // Render reference item for picker
  const renderReferenceItem = (item) => {
    let title, subtitle;
    
    switch (formData.payment_type) {
      case 'sales_invoice':
        title = item.invoice_number;
        subtitle = `${translate('customer')}: ${item.customer?.name || ''} • ${translate('amount')}: ${formatCurrency(item.total_amount)}`;
        break;
      case 'expense':
        title = item.description;
        subtitle = `${translate('category')}: ${item.category} • ${translate('amount')}: ${formatCurrency(item.amount)}`;
        break;
      default:
        title = item.name || item.title || `ID: ${item.id}`;
        subtitle = '';
    }

    return (
      <TouchableOpacity
        style={commonStyles.pickerItem}
        onPress={() => handleReferenceSelect(item)}
      >
        <View style={commonStyles.pickerItemContent}>
          <Text style={[commonStyles.pickerItemName, isRTL && commonStyles.arabicText]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[commonStyles.pickerItemDetails, isRTL && commonStyles.arabicText]}>
              {subtitle}
            </Text>
          )}
        </View>
        <Ionicons name="chevron-forward" size={20} color="#666" />
      </TouchableOpacity>
    );
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

  const selectedReference = getSelectedReference();

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
              {translate('addPaymentEntry')}
            </Text>
            <View style={commonStyles.placeholder} />
          </View>
        </LinearGradient>
      </View>

      {/* Form */}
      <ScrollView style={commonStyles.content} showsVerticalScrollIndicator={false}>
        {/* Payment Information */}
        <View style={commonStyles.section}>
          <Text style={[commonStyles.sectionTitle, isRTL && commonStyles.arabicText]}>
            {translate('paymentInformation')}
          </Text>
          
          <View style={commonStyles.row}>
            <View style={[commonStyles.inputGroup, commonStyles.halfWidth]}>
              <Text style={[commonStyles.label, isRTL && commonStyles.arabicText]}>
                {translate('transactionType')} *
              </Text>
              <View style={commonStyles.statusContainer}>
                {transactionTypes.map((type) => (
                  <TouchableOpacity
                    key={type.key}
                    style={[
                      commonStyles.statusOption,
                      formData.type === type.key && commonStyles.statusOptionActive
                    ]}
                    onPress={() => handleInputChange('type', type.key)}
                  >
                    <Text style={[
                      commonStyles.statusOptionText,
                      formData.type === type.key && commonStyles.statusOptionTextActive,
                      isRTL && commonStyles.arabicText
                    ]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={[commonStyles.inputGroup, commonStyles.halfWidth]}>
              <Text style={[commonStyles.label, isRTL && commonStyles.arabicText]}>
                {translate('paymentDate')} *
              </Text>
              <TouchableOpacity
                style={commonStyles.dateInput}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={[commonStyles.dateText, isRTL && commonStyles.arabicText]}>
                  {formData.payment_date}
                </Text>
                <Ionicons name="calendar" size={20} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={commonStyles.inputGroup}>
            <Text style={[commonStyles.label, isRTL && commonStyles.arabicText]}>
              {translate('selectBank')} *
            </Text>
            <TouchableOpacity
              style={commonStyles.selector}
              onPress={() => setShowBankPicker(true)}
            >
              <Text style={[
                commonStyles.selectorText, 
                !selectedBank && commonStyles.placeholder, 
                isRTL && commonStyles.arabicText
              ]}>
                {selectedBank 
                  ? selectedBank.bank_name
                  : translate('selectBankPlaceholder')
                }
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Reference Selection */}
        <View style={commonStyles.section}>
          <Text style={[commonStyles.sectionTitle, isRTL && commonStyles.arabicText]}>
            {translate('referenceInformation')}
          </Text>
          
          <View style={commonStyles.inputGroup}>
            <Text style={[commonStyles.label, isRTL && commonStyles.arabicText]}>
              {translate('paymentType')} *
            </Text>
            <View style={styles.paymentTypeContainer}>
              {paymentTypes.map((type) => (
                <TouchableOpacity
                  key={type.key}
                  style={[
                    styles.paymentTypeOption,
                    formData.payment_type === type.key && styles.paymentTypeOptionActive
                  ]}
                  onPress={() => handleInputChange('payment_type', type.key)}
                >
                  <Text style={[
                    styles.paymentTypeText,
                    formData.payment_type === type.key && styles.paymentTypeTextActive,
                    isRTL && commonStyles.arabicText
                  ]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={commonStyles.inputGroup}>
            <Text style={[commonStyles.label, isRTL && commonStyles.arabicText]}>
              {translate('selectReference')} *
            </Text>
            <TouchableOpacity
              style={commonStyles.selector}
              onPress={() => setShowReferencePicker(true)}
              disabled={referenceData.length === 0}
            >
              <View style={styles.referenceContent}>
                {selectedReference ? (
                  <>
                    <Text style={[styles.referenceTitle, isRTL && commonStyles.arabicText]}>
                      {selectedReference.title}
                    </Text>
                    {selectedReference.subtitle && (
                      <Text style={[styles.referenceSubtitle, isRTL && commonStyles.arabicText]}>
                        {selectedReference.subtitle}
                      </Text>
                    )}
                  </>
                ) : (
                  <Text style={[commonStyles.placeholder, isRTL && commonStyles.arabicText]}>
                    {referenceData.length === 0 
                      ? translate('noReferencesAvailable')
                      : translate('selectReferencePlaceholder')
                    }
                  </Text>
                )}
              </View>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Payment Details */}
        <View style={commonStyles.section}>
          <Text style={[commonStyles.sectionTitle, isRTL && commonStyles.arabicText]}>
            {translate('paymentDetails')}
          </Text>
          
          <View style={commonStyles.row}>
            <View style={[commonStyles.inputGroup, commonStyles.halfWidth]}>
              <Text style={[commonStyles.label, isRTL && commonStyles.arabicText]}>
                {translate('amount')} *
              </Text>
              <TextInput
                style={[commonStyles.input, isRTL && commonStyles.arabicInput]}
                placeholder={translate('enterAmount')}
                value={formData.amount}
                onChangeText={(value) => handleInputChange('amount', value)}
                keyboardType="decimal-pad"
                textAlign={isRTL ? 'right' : 'left'}
              />
            </View>

            <View style={[commonStyles.inputGroup, commonStyles.halfWidth]}>
              <Text style={[commonStyles.label, isRTL && commonStyles.arabicText]}>
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
                      styles.methodText,
                      formData.payment_method === method && styles.methodTextActive,
                      isRTL && commonStyles.arabicText
                    ]}>
                      {translate(method.toLowerCase().replace(' ', ''))}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View style={commonStyles.inputGroup}>
            <Text style={[commonStyles.label, isRTL && commonStyles.arabicText]}>
              {translate('transactionReference')}
            </Text>
            <TextInput
              style={[commonStyles.input, isRTL && commonStyles.arabicInput]}
              placeholder={translate('enterTransactionReference')}
              value={formData.transaction_reference}
              onChangeText={(value) => handleInputChange('transaction_reference', value)}
              textAlign={isRTL ? 'right' : 'left'}
            />
          </View>

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
              <Ionicons name="checkmark" size={20} color="#fff" />
              <Text style={[commonStyles.submitButtonText, isRTL && commonStyles.arabicText]}>
                {translate('createPaymentEntry')}
              </Text>
            </>
          )}
        </TouchableOpacity>

        <View style={commonStyles.bottomSpace} />
      </ScrollView>

      {/* Bank Picker Modal */}
      <Modal
        visible={showBankPicker}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={commonStyles.modalContainer}>
          <View style={[commonStyles.modalHeader, isRTL && commonStyles.rtlModalHeader]}>
            <Text style={[commonStyles.modalTitle, isRTL && commonStyles.arabicText]}>
              {translate('selectBank')}
            </Text>
            <TouchableOpacity
              style={commonStyles.modalCloseButton}
              onPress={() => setShowBankPicker(false)}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={banks}
            keyExtractor={(item) => item.id.toString()}
            style={commonStyles.pickerList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={commonStyles.pickerItem}
                onPress={() => handleBankSelect(item)}
              >
                <View style={commonStyles.pickerItemContent}>
                  <Text style={[commonStyles.pickerItemName, isRTL && commonStyles.arabicText]}>
                    {item.bank_name}
                  </Text>
                  <Text style={[commonStyles.pickerItemDetails, isRTL && commonStyles.arabicText]}>
                    {item.account_name} • {translate('balance')}: {formatCurrency(item.balance)}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={commonStyles.noDataContainer}>
                <Ionicons name="card-outline" size={48} color="#ccc" />
                <Text style={[commonStyles.noDataText, isRTL && commonStyles.arabicText]}>
                  {translate('noBanksAvailable')}
                </Text>
              </View>
            }
          />
        </SafeAreaView>
      </Modal>

      {/* Reference Picker Modal */}
      <Modal
        visible={showReferencePicker}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={commonStyles.modalContainer}>
          <View style={[commonStyles.modalHeader, isRTL && commonStyles.rtlModalHeader]}>
            <Text style={[commonStyles.modalTitle, isRTL && commonStyles.arabicText]}>
              {translate('selectReference')} - {translate(formData.payment_type)}
            </Text>
            <TouchableOpacity
              style={commonStyles.modalCloseButton}
              onPress={() => setShowReferencePicker(false)}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={referenceData}
            keyExtractor={(item) => item.id.toString()}
            style={commonStyles.pickerList}
            renderItem={({ item }) => renderReferenceItem(item)}
            ListEmptyComponent={
              <View style={commonStyles.noDataContainer}>
                <Ionicons name="document-outline" size={48} color="#ccc" />
                <Text style={[commonStyles.noDataText, isRTL && commonStyles.arabicText]}>
                  {translate('noReferencesAvailable')}
                </Text>
                <Text style={[styles.noDataSubtext, isRTL && commonStyles.arabicText]}>
                  {translate('createReferencesFirst')}
                </Text>
              </View>
            }
          />
        </SafeAreaView>
      </Modal>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={new Date(formData.payment_date)}
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
  paymentTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  
  paymentTypeOption: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  
  paymentTypeOptionActive: {
    backgroundColor: '#6B7D3D',
    borderColor: '#6B7D3D',
  },
  
  paymentTypeText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  
  paymentTypeTextActive: {
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
  
  referenceContent: {
    flex: 1,
  },
  
  referenceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  
  referenceSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  
  noDataSubtext: {
    fontSize: 14,
    color: '#bbb',
    textAlign: 'center',
    marginTop: 5,
  },
});

export default AddPaymentEntryScreen;