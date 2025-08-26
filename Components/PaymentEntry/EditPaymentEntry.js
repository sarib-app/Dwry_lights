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
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import languageService from '../Globals/Store/Lang';
import getAuthToken from '../Globals/Store/LocalData';
import commonStyles from '../Globals/CommonStyles';

const API_BASE_URL = 'https://planetdory.dwrylight.com/api';

const EditPaymentEntryScreen = ({ navigation, route }) => {
  const { entry } = route.params;
  
  const [formData, setFormData] = useState({
    bank_id: entry.bank_id || '',
    type: entry.type || 'credit',
    payment_type: entry.payment_type || 'sales_invoice',
    reference_id: entry.reference_id || '',
    payment_date: entry.payment_date || new Date().toISOString().split('T')[0],
    amount: (entry.amount || '').toString(),
    payment_method: entry.payment_method || 'Cash',
    transaction_reference: entry.transaction_reference || '',
    notes: entry.notes || '',
    recorded_by: entry.recorded_by?.id || '',
    image: null,
    video: null,
    currentImageUrl: entry.image_url || null,
    currentVideoUrl: entry.video_url || null,
    // Credit note fields
    credit_note_applied: entry.credit_note_applied || 0,
    credit_notes: entry.credit_notes || [],
    actual_amount: entry.actual_amount || 0,
  });

  const [banks, setBanks] = useState([]);
  const [salesInvoices, setSalesInvoices] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [referenceData, setReferenceData] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(entry.recorded_by || null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [showBankPicker, setShowBankPicker] = useState(false);
  const [showReferencePicker, setShowReferencePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isRTL, setIsRTL] = useState(false);
  
  // Credit note states
  const [creditNotes, setCreditNotes] = useState([]);
  const [selectedCreditNotes, setSelectedCreditNotes] = useState(entry.credit_notes || []);
  const [loadingCreditNotes, setLoadingCreditNotes] = useState(false);

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

  // Credit note effects
  useEffect(() => {
    if (formData.payment_type === 'sales_invoice' && formData.reference_id) {
      resetCreditNotes();
      fetchCreditNotes();
      setActualAmountFromReference();
    } else {
      resetCreditNotes();
    }
  }, [formData.reference_id, formData.payment_type]);

  useEffect(() => {
    calculateFinalAmount();
  }, [selectedCreditNotes, formData.actual_amount]);

  // Handle staff selection from route params
  useEffect(() => {
    if (route.params?.selectedStaff) {
      console.log('Staff selected from route params:', route.params.selectedStaff);
      setSelectedStaff(route.params.selectedStaff);
      setFormData(prev => ({ ...prev, recorded_by: route.params.selectedStaff.id.toString() }));
    }
  }, [route.params?.selectedStaff]);

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

  // Handle staff selection navigation
  const handleStaffSelection = () => {
    navigation.navigate('StaffSelectorScreen', {
      selectedStaffId: formData.recorded_by,
      onStaffSelect: (staff) => {
        console.log('Staff selected in callback:', staff);
        if (staff) {
          setSelectedStaff(staff);
          setFormData(prev => ({ 
            ...prev, 
            recorded_by: staff.id.toString() 
          }));
        } else {
          setSelectedStaff(null);
          setFormData(prev => ({ 
            ...prev, 
            recorded_by: '' 
          }));
        }
      }
    });
  };

  // Handle image selection
  const handleImagePicker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(translate('permission'), translate('cameraPermissionRequired'));
      return;
    }

    Alert.alert(
      translate('selectImage'),
      translate('chooseImageSource'),
      [
        { text: translate('camera'), onPress: () => openImagePicker('camera') },
        { text: translate('gallery'), onPress: () => openImagePicker('library') },
        { text: translate('cancel'), style: 'cancel' }
      ]
    );
  };

  const openImagePicker = async (source) => {
    try {
      let result;
      
      if (source === 'camera') {
        const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
        if (cameraStatus.status !== 'granted') {
          Alert.alert(translate('permission'), translate('cameraPermissionRequired'));
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets[0]) {
        setFormData(prev => ({ ...prev, image: result.assets[0] }));
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert(translate('error'), translate('failedToSelectImage'));
    }
  };

  // Handle video selection
  const handleVideoPicker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(translate('permission'), translate('mediaPermissionRequired'));
      return;
    }

    Alert.alert(
      translate('selectVideo'),
      translate('chooseVideoSource'),
      [
        { text: translate('camera'), onPress: () => openVideoPicker('camera') },
        { text: translate('gallery'), onPress: () => openVideoPicker('library') },
        { text: translate('cancel'), style: 'cancel' }
      ]
    );
  };

  const openVideoPicker = async (source) => {
    try {
      let result;
      
      if (source === 'camera') {
        const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
        if (cameraStatus.status !== 'granted') {
          Alert.alert(translate('permission'), translate('cameraPermissionRequired'));
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Videos,
          allowsEditing: true,
          quality: 0.8,
          videoMaxDuration: 300, // 5 minutes max
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Videos,
          allowsEditing: true,
          quality: 0.8,
          videoMaxDuration: 300, // 5 minutes max
        });
      }

      if (!result.canceled && result.assets[0]) {
        const video = result.assets[0];
        
        // Check file size (limit to 50MB)
        if (video.fileSize && video.fileSize > 50 * 1024 * 1024) {
          Alert.alert(translate('error'), translate('videoTooLarge'));
          return;
        }

        setFormData(prev => ({ ...prev, video: video }));
      }
    } catch (error) {
      console.error('Video picker error:', error);
      Alert.alert(translate('error'), translate('failedToSelectVideo'));
    }
  };

  // Remove image
  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: null }));
  };

  // Remove video
  const removeVideo = () => {
    setFormData(prev => ({ ...prev, video: null }));
  };

  // Remove current image
  const removeCurrentImage = () => {
    setFormData(prev => ({ ...prev, currentImageUrl: null }));
  };

  // Remove current video
  const removeCurrentVideo = () => {
    setFormData(prev => ({ ...prev, currentVideoUrl: null }));
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
    if (!formData.recorded_by) {
      Alert.alert(translate('validationError'), translate('staffRequired'));
      return false;
    }
    
    // Validate credit notes if any are selected
    if (selectedCreditNotes.length > 0 && !validateCreditNotes()) {
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

      // Create FormData for file uploads
      const formDataToSend = new FormData();
      formDataToSend.append('bank_id', formData.bank_id.toString());
      formDataToSend.append('type', formData.type);
      formDataToSend.append('payment_type', formData.payment_type);
      formDataToSend.append('reference_id', formData.reference_id.toString());
      formDataToSend.append('payment_date', formData.payment_date);
      formDataToSend.append('amount', formData.amount);
      formDataToSend.append('payment_method', formData.payment_method);
      formDataToSend.append('transaction_reference', formData.transaction_reference);
      formDataToSend.append('notes', formData.notes);
      formDataToSend.append('recorded_by', formData.recorded_by.toString());

      // Add credit note fields if credit notes are applied
      if (formData.credit_note_applied > 0) {
        formDataToSend.append('credit_note_applied', formData.credit_note_applied.toString());
        formDataToSend.append('actual_amount', formData.actual_amount.toString());
        formDataToSend.append('credit_notes', JSON.stringify(selectedCreditNotes));
      }

      // Add image if selected (new image)
      if (formData.image) {
        formDataToSend.append('image', {
          uri: formData.image.uri,
          type: formData.image.type || 'image/jpeg',
          name: formData.image.fileName || 'image.jpg',
        });
      } else if (!formData.currentImageUrl) {
        // If no new image and current image was removed, send empty
        formDataToSend.append('image', '');
      }

      // Add video if selected (new video)
      if (formData.video) {
        formDataToSend.append('video', {
          uri: formData.video.uri,
          type: formData.video.type || 'video/mp4',
          name: formData.video.fileName || 'video.mp4',
        });
      } else if (!formData.currentVideoUrl) {
        // If no new video and current video was removed, send empty
        formDataToSend.append('video', '');
      }

      const response = await fetch(`${API_BASE_URL}/update_payment_entry/${entry.id}`, {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'multipart/form-data',
        },
        body: formDataToSend,
      });

      const result = await response.json();
      console.log('Update payment entry response:', result);

      if (result.status == 200) {
        Alert.alert(
          translate('success'),
          translate('paymentEntryUpdatedSuccessfully'),
          [{ text: translate('ok'), onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert(translate('error'), result.message || translate('failedToUpdatePaymentEntry'));
      }
    } catch (error) {
      console.error('Update payment entry error:', error);
      Alert.alert(translate('error'), translate('networkErrorUpdatingPaymentEntry'));
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

  // Credit note functions
  const fetchCreditNotes = async () => {
    if (!formData.reference_id || formData.payment_type !== 'sales_invoice') return;
    
    setLoadingCreditNotes(true);
    const token = await getAuthToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/get_credit_notes`, {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sale_invoice_id: formData.reference_id
        }),
      });

      const result = await response.json();
      if (result.status == 200) {
        setCreditNotes(result.data || []);
      }
    } catch (error) {
      console.error('Fetch credit notes error:', error);
    } finally {
      setLoadingCreditNotes(false);
    }
  };

  const setActualAmountFromReference = () => {
    if (formData.payment_type === 'sales_invoice' && formData.reference_id) {
      const reference = referenceData.find(r => r.id == formData.reference_id);
      if (reference && reference.total_amount) {
        setFormData(prev => ({ ...prev, actual_amount: reference.total_amount }));
      }
    }
  };

  const resetCreditNotes = () => {
    setSelectedCreditNotes([]);
    setFormData(prev => ({ 
      ...prev, 
      credit_note_applied: 0,
      actual_amount: 0 
    }));
  };

  const calculateFinalAmount = () => {
    const totalCreditApplied = selectedCreditNotes.reduce((sum, cn) => sum + parseFloat(cn.used_amount || 0), 0);
    const actualAmount = parseFloat(formData.actual_amount) || 0;
    const finalAmount = actualAmount - totalCreditApplied;
    
    setFormData(prev => ({ 
      ...prev, 
      credit_note_applied: totalCreditApplied,
      amount: finalAmount.toString()
    }));
  };

  const handleCreditNoteToggle = (creditNote) => {
    if (isCreditNoteSelected(creditNote.credit_note_id)) {
      setSelectedCreditNotes(prev => 
        prev.filter(cn => cn.credit_note_id !== creditNote.credit_note_id)
      );
    } else {
      setSelectedCreditNotes(prev => [...prev, {
        ...creditNote,
        used_amount: creditNote.remaining_amount
      }]);
    }
  };

  const handleCreditNoteAmountChange = (creditNoteId, amount) => {
    setSelectedCreditNotes(prev => 
      prev.map(cn => 
        cn.credit_note_id === creditNoteId 
          ? { ...cn, used_amount: parseFloat(amount) || 0 }
          : cn
      )
    );
  };

  const isCreditNoteSelected = (creditNoteId) => {
    return selectedCreditNotes.some(cn => cn.credit_note_id === creditNoteId);
  };

  const getSelectedCreditNote = (creditNoteId) => {
    return selectedCreditNotes.find(cn => cn.credit_note_id === creditNoteId);
  };

  const validateCreditNotes = () => {
    for (const creditNote of selectedCreditNotes) {
      if (creditNote.used_amount <= 0) {
        Alert.alert(translate('error'), translate('creditNoteAmountMustBePositive'));
        return false;
      }
      if (creditNote.used_amount > creditNote.remaining_amount) {
        Alert.alert(translate('error'), translate('creditNoteAmountExceedsRemaining'));
        return false;
      }
    }
    return true;
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
              {translate('editPaymentEntry')}
            </Text>
            <View style={commonStyles.placeholder} />
          </View>
        </LinearGradient>
      </View>

      {/* Form */}
      <ScrollView style={commonStyles.content} showsVerticalScrollIndicator={false}>
        {/* Entry Information */}
        <View style={commonStyles.section}>
          <Text style={[commonStyles.sectionTitle, isRTL && commonStyles.arabicText]}>
            {translate('entryInformation')}
          </Text>
          
          <View style={commonStyles.inputGroup}>
            <Text style={[commonStyles.label, isRTL && commonStyles.arabicText]}>
              {translate('entryId')}
            </Text>
            <View style={styles.readOnlyInput}>
              <Text style={[styles.readOnlyText, isRTL && commonStyles.arabicText]}>
                #{entry.id}
              </Text>
            </View>
          </View>

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

          {/* Staff Selection */}
          <View style={commonStyles.inputGroup}>
            <Text style={[commonStyles.label, isRTL && commonStyles.arabicText]}>
              {translate('recordedBy')} *
            </Text>
            <TouchableOpacity
              style={commonStyles.selector}
              onPress={handleStaffSelection}
            >
              <Text style={[
                commonStyles.selectorText, 
                !selectedStaff && commonStyles.placeholder, 
                isRTL && commonStyles.arabicText
              ]}>
                {selectedStaff 
                  ? `${selectedStaff.first_name} ${selectedStaff.last_name}` || selectedStaff.name || selectedStaff.full_name
                  : translate('selectStaffPlaceholder')
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

        {/* Credit Notes Section - Only show for sales invoice */}
        {formData.payment_type === 'sales_invoice' && formData.reference_id && (
          <View style={commonStyles.section}>
            <Text style={[commonStyles.sectionTitle, isRTL && commonStyles.arabicText]}>
              {translate('creditNotes')}
            </Text>
            
            {/* Actual Amount Display */}
            {formData.actual_amount > 0 && (
              <View style={styles.actualAmountContainer}>
                <Text style={[styles.actualAmountLabel, isRTL && commonStyles.arabicText]}>
                  {translate('actualAmount')}:
                </Text>
                <Text style={[styles.actualAmountValue, isRTL && commonStyles.arabicText]}>
                  {formatCurrency(formData.actual_amount)}
                </Text>
              </View>
            )}

            {/* Credit Notes List */}
            {loadingCreditNotes ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#6B7D3D" />
                <Text style={[styles.loadingText, isRTL && commonStyles.arabicText]}>
                  {translate('loadingCreditNotes')}
                </Text>
              </View>
            ) : creditNotes.length === 0 ? (
              <View style={styles.noDataContainer}>
                <Text style={[styles.noDataText, isRTL && commonStyles.arabicText]}>
                  {translate('noCreditNotesAvailable')}
                </Text>
                <Text style={[styles.noDataSubtext, isRTL && commonStyles.arabicText]}>
                  {translate('createCreditNotesFirst')}
                </Text>
              </View>
            ) : (
              <View style={styles.creditNotesContainer}>
                <Text style={[styles.creditNotesHeaderText, isRTL && commonStyles.arabicText]}>
                  {translate('availableCreditNotes')}
                </Text>
                
                {creditNotes.map((creditNote, index) => (
                  <View key={index} style={styles.creditNoteItem}>
                    <View style={styles.creditNoteCheckbox}>
                      <TouchableOpacity
                        style={[
                          styles.checkbox,
                          isCreditNoteSelected(creditNote.credit_note_id) && styles.checkboxChecked
                        ]}
                        onPress={() => handleCreditNoteToggle(creditNote)}
                      >
                        {isCreditNoteSelected(creditNote.credit_note_id) && (
                          <Ionicons name="checkmark" size={16} color="#fff" />
                        )}
                      </TouchableOpacity>
                    </View>
                    
                    <View style={styles.creditNoteDetails}>
                      <Text style={[styles.creditNoteNumber, isRTL && commonStyles.arabicText]}>
                        {translate('creditNote')} #{creditNote.credit_note_number}
                      </Text>
                      <Text style={[styles.creditNoteCustomer, isRTL && commonStyles.arabicText]}>
                        {translate('customer')}: {creditNote.customer_name}
                      </Text>
                      <Text style={[styles.creditNoteReturn, isRTL && commonStyles.arabicText]}>
                        {translate('returnInvoice')}: #{creditNote.return_invoice_number}
                      </Text>
                      <Text style={[styles.creditNoteRemaining, isRTL && commonStyles.arabicText]}>
                        {translate('remainingAmount')}: {formatCurrency(creditNote.remaining_amount)}
                      </Text>
                    </View>

                    {/* Amount Input for Selected Credit Note */}
                    {isCreditNoteSelected(creditNote.credit_note_id) && (
                      <View style={styles.creditNoteAmountInputContainer}>
                        <Text style={[styles.creditNoteAmountLabel, isRTL && commonStyles.arabicText]}>
                          {translate('amountToUse')}:
                        </Text>
                        <TextInput
                          style={[styles.creditNoteAmountInput, isRTL && commonStyles.arabicInput]}
                          placeholder="0.00"
                          value={getSelectedCreditNote(creditNote.credit_note_id)?.used_amount?.toString() || ''}
                          onChangeText={(value) => handleCreditNoteAmountChange(creditNote.credit_note_id, value)}
                          keyboardType="decimal-pad"
                          textAlign={isRTL ? 'right' : 'left'}
                        />
                      </View>
                    )}
                  </View>
                ))}

                {/* Credit Applied Summary */}
                {selectedCreditNotes.length > 0 && (
                  <View style={styles.creditAppliedSummary}>
                    <Text style={[styles.creditAppliedLabel, isRTL && commonStyles.arabicText]}>
                      {translate('totalCreditApplied')}:
                    </Text>
                    <Text style={[styles.creditAppliedValue, isRTL && commonStyles.arabicText]}>
                      -{formatCurrency(formData.credit_note_applied)}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        )}

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

        {/* Media Attachments */}
        <View style={commonStyles.section}>
          <Text style={[commonStyles.sectionTitle, isRTL && commonStyles.arabicText]}>
            {translate('attachments')}
          </Text>
          
          {/* Current Image Display */}
          {formData.currentImageUrl && (
            <View style={commonStyles.inputGroup}>
              <Text style={[commonStyles.label, isRTL && commonStyles.arabicText]}>
                {translate('currentImage')}
              </Text>
              <View style={styles.mediaContainer}>
                <Image source={{ uri: formData.currentImageUrl }} style={styles.imagePreview} />
                <TouchableOpacity style={styles.removeButton} onPress={removeCurrentImage}>
                  <Ionicons name="close-circle" size={24} color="#ff4444" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          
          {/* Image Upload */}
          <View style={commonStyles.inputGroup}>
            <Text style={[commonStyles.label, isRTL && commonStyles.arabicText]}>
              {formData.currentImageUrl ? translate('replaceImage') : translate('image')}
            </Text>
            {formData.image ? (
              <View style={styles.mediaContainer}>
                <Image source={{ uri: formData.image.uri }} style={styles.imagePreview} />
                <TouchableOpacity style={styles.removeButton} onPress={removeImage}>
                  <Ionicons name="close-circle" size={24} color="#ff4444" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.mediaUploadButton} onPress={handleImagePicker}>
                <Ionicons name="camera" size={24} color="#6B7D3D" />
                <Text style={[styles.mediaUploadText, isRTL && commonStyles.arabicText]}>
                  {formData.currentImageUrl ? translate('selectNewImage') : translate('selectImage')}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Current Video Display */}
          {formData.currentVideoUrl && (
            <View style={commonStyles.inputGroup}>
              <Text style={[commonStyles.label, isRTL && commonStyles.arabicText]}>
                {translate('currentVideo')}
              </Text>
              <View style={styles.mediaContainer}>
                <View style={styles.videoPreview}>
                  <Ionicons name="videocam" size={40} color="#6B7D3D" />
                  <Text style={[styles.videoFileName, isRTL && commonStyles.arabicText]}>
                    {translate('currentVideoFile')}
                  </Text>
                  <TouchableOpacity 
                    style={styles.viewVideoButton}
                    onPress={() => {
                      // Open video in browser or external app
                      // You can use Linking.openURL(formData.currentVideoUrl) if needed
                    }}
                  >
                    <Text style={[styles.viewVideoText, isRTL && commonStyles.arabicText]}>
                      {translate('viewVideo')}
                    </Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.removeButton} onPress={removeCurrentVideo}>
                  <Ionicons name="close-circle" size={24} color="#ff4444" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Video Upload */}
          <View style={commonStyles.inputGroup}>
            <Text style={[commonStyles.label, isRTL && commonStyles.arabicText]}>
              {formData.currentVideoUrl ? translate('replaceVideo') : translate('video')}
            </Text>
            {formData.video ? (
              <View style={styles.mediaContainer}>
                <View style={styles.videoPreview}>
                  <Ionicons name="videocam" size={40} color="#6B7D3D" />
                  <Text style={[styles.videoFileName, isRTL && commonStyles.arabicText]}>
                    {formData.video.fileName || 'video.mp4'}
                  </Text>
                  <Text style={[styles.videoFileSize, isRTL && commonStyles.arabicText]}>
                    {formData.video.fileSize ? `${(formData.video.fileSize / (1024 * 1024)).toFixed(2)} MB` : ''}
                  </Text>
                  {formData.video.duration && (
                    <Text style={[styles.videoFileSize, isRTL && commonStyles.arabicText]}>
                      {`${Math.floor(formData.video.duration / 60000)}:${Math.floor((formData.video.duration % 60000) / 1000).toString().padStart(2, '0')}`}
                    </Text>
                  )}
                </View>
                <TouchableOpacity style={styles.removeButton} onPress={removeVideo}>
                  <Ionicons name="close-circle" size={24} color="#ff4444" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.mediaUploadButton} onPress={handleVideoPicker}>
                <Ionicons name="videocam" size={24} color="#6B7D3D" />
                <Text style={[styles.mediaUploadText, isRTL && commonStyles.arabicText]}>
                  {formData.currentVideoUrl ? translate('selectNewVideo') : translate('selectVideo')}
                </Text>
              </TouchableOpacity>
            )}
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
                {translate('updatePaymentEntry')}
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

  // Media attachment styles
  mediaUploadButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },

  mediaUploadText: {
    fontSize: 14,
    color: '#6B7D3D',
    marginTop: 8,
    fontWeight: '500',
  },

  mediaContainer: {
    marginTop: 5,
    position: 'relative',
  },

  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },

  videoPreview: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },

  videoFileName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginTop: 8,
    textAlign: 'center',
  },

  videoFileSize: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },

  viewVideoButton: {
    backgroundColor: '#6B7D3D',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 10,
  },

  viewVideoText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },

  removeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  // Credit Notes styles
  actualAmountContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e9ecef',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  actualAmountLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },

  actualAmountValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6B7D3D',
  },

  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },

  loadingText: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
  },

  noDataContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },

  noDataText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },

  noDataSubtext: {
    fontSize: 14,
    color: '#bbb',
    textAlign: 'center',
    marginTop: 5,
  },

  creditNotesContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },

  creditNotesHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },

  creditNoteItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },

  creditNoteCheckbox: {
    marginBottom: 10,
  },

  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#6B7D3D',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },

  checkboxChecked: {
    backgroundColor: '#6B7D3D',
  },

  creditNoteDetails: {
    marginBottom: 10,
  },

  creditNoteNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },

  creditNoteCustomer: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },

  creditNoteReturn: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },

  creditNoteRemaining: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E74C3C',
  },

  creditNoteAmountInputContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },

  creditNoteAmountLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },

  creditNoteAmountInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
    fontSize: 14,
  },

  creditAppliedSummary: {
    backgroundColor: '#e8f5e8',
    borderRadius: 10,
    padding: 15,
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#4caf50',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  creditAppliedLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },

  creditAppliedValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E74C3C',
  },
});

export default EditPaymentEntryScreen;