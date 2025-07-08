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

const API_BASE_URL = 'https://planetdory.dwrylight.com/api';

const AddExpenseScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    expense_date: new Date().toISOString().split('T')[0],
    category: '',
    description: '',
    amount: '',
    payment_method: 'Cash',
    staff_id: '',
    vendor: '',
    department: '',
    added_by: 1
  });

  const [suppliers, setSuppliers] = useState([]);
  const [staff, setStaff] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [showStaffPicker, setShowStaffPicker] = useState(false);
  const [showSupplierPicker, setShowSupplierPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isRTL, setIsRTL] = useState(false);

  const translate = (key) => languageService.translate(key);

  const paymentMethods = ['Cash', 'Card', 'Bank Transfer', 'Check'];
  const expenseCategories = [
    'Office Supplies',
    'Travel & Transportation',
    'Meals & Entertainment',
    'Equipment',
    'Software & Subscriptions',
    'Marketing',
    'Training',
    'Utilities',
    'Rent',
    'Other'
  ];

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
    await Promise.all([fetchSuppliers(), fetchStaff()]);
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

  // Fetch staff
  const fetchStaff = async () => {
    const token = await getAuthToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/fetch_all_staff`, {
        method: 'GET',
        headers: { 'Authorization': token },
      });
      
      const result = await response.json();
      if (result.status == 200) {
        setStaff(result.data || []);
      }
    } catch (error) {
      console.error('Fetch staff error:', error);
    }
  };

  // Handle input change
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle staff selection
  const handleStaffSelect = (staffMember) => {
    setFormData(prev => ({ ...prev, staff_id: staffMember.id }));
    setShowStaffPicker(false);
  };

  // Handle supplier selection
  const handleSupplierSelect = (supplier) => {
    setFormData(prev => ({ ...prev, vendor: supplier.name }));
    setShowSupplierPicker(false);
  };

  // Handle date selection
  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const dateString = selectedDate.toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, expense_date: dateString }));
    }
  };

  // Pick receipt image
  const pickReceiptImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(translate('permissionRequired'), translate('cameraRollPermission'));
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setSelectedImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert(translate('error'), translate('failedToSelectImage'));
    }
  };

  // Take photo
  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(translate('permissionRequired'), translate('cameraPermission'));
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setSelectedImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert(translate('error'), translate('failedToTakePhoto'));
    }
  };

  // Show image picker options
  const showImageOptions = () => {
    Alert.alert(
      translate('selectReceiptImage'),
      translate('chooseImageSource'),
      [
        { text: translate('cancel'), style: 'cancel' },
        { text: translate('takePhoto'), onPress: takePhoto },
        { text: translate('chooseFromGallery'), onPress: pickReceiptImage },
      ]
    );
  };

  // Remove selected image
  const removeImage = () => {
    setSelectedImage(null);
  };

  // Validate form
  const validateForm = () => {
    if (!formData.category) {
      Alert.alert(translate('validationError'), translate('categoryRequired'));
      return false;
    }
    if (!formData.description.trim()) {
      Alert.alert(translate('validationError'), translate('descriptionRequired'));
      return false;
    }
    if (!formData.amount || isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      Alert.alert(translate('validationError'), translate('validAmountRequired'));
      return false;
    }
    if (!formData.staff_id) {
      Alert.alert(translate('validationError'), translate('staffRequired'));
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

      const formDataToSend = new FormData();
      
      // Append form fields
      formDataToSend.append('expense_date', formData.expense_date);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('amount', formData.amount);
      formDataToSend.append('payment_method', formData.payment_method);
      formDataToSend.append('staff_id', formData.staff_id);
      formDataToSend.append('added_by', formData.added_by);
      
      if (formData.vendor) {
        formDataToSend.append('vendor', formData.vendor);
      }
      
      if (formData.department) {
        formDataToSend.append('department', formData.department);
      }

      // Append image if selected
      if (selectedImage) {
        formDataToSend.append('receipt_image', {
          uri: selectedImage.uri,
          type: 'image/jpeg',
          name: 'receipt.jpg',
        });
      }

      const response = await fetch(`${API_BASE_URL}/add_expense`, {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'multipart/form-data',
        },
        body: formDataToSend,
      });

      const result = await response.json();
      console.log('Add expense response:', result);

      if (result.status == 200) {
        Alert.alert(
          translate('success'),
          translate('expenseCreatedSuccessfully'),
          [{ text: translate('ok'), onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert(translate('error'), result.message || translate('failedToCreateExpense'));
      }
    } catch (error) {
      console.error('Add expense error:', error);
      Alert.alert(translate('error'), translate('networkErrorCreatingExpense'));
    } finally {
      setLoading(false);
    }
  };

  // Get selected staff
  const selectedStaff = staff.find(s => s.id == formData.staff_id);

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
              {translate('addExpense')}
            </Text>
            <View style={styles.placeholder} />
          </View>
        </LinearGradient>
      </View>

      {/* Form */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isRTL && styles.arabicText]}>
            {translate('expenseInformation')}
          </Text>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, isRTL && styles.arabicText]}>
              {translate('expenseDate')} *
            </Text>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={[styles.dateText, isRTL && styles.arabicText]}>
                {formData.expense_date}
              </Text>
              <Ionicons name="calendar" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, isRTL && styles.arabicText]}>
              {translate('category')} *
            </Text>
            <View style={styles.categoryContainer}>
              {expenseCategories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryOption,
                    formData.category === category && styles.categoryOptionActive
                  ]}
                  onPress={() => handleInputChange('category', category)}
                >
                  <Text style={[
                    styles.categoryOptionText,
                    formData.category === category && styles.categoryOptionTextActive,
                    isRTL && styles.arabicText
                  ]}>
                    {translate(category.toLowerCase().replace(/\s+/g, '').replace('&', ''))}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, isRTL && styles.arabicText]}>
              {translate('description')} *
            </Text>
            <TextInput
              style={[styles.input, styles.textArea, isRTL && styles.arabicInput]}
              placeholder={translate('enterExpenseDescription')}
              value={formData.description}
              onChangeText={(value) => handleInputChange('description', value)}
              multiline
              numberOfLines={3}
              textAlign={isRTL ? 'right' : 'left'}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, isRTL && styles.arabicText]}>
              {translate('amount')} *
            </Text>
            <TextInput
              style={[styles.input, isRTL && styles.arabicInput]}
              placeholder="0.00"
              value={formData.amount}
              onChangeText={(value) => handleInputChange('amount', value)}
              keyboardType="decimal-pad"
              textAlign={isRTL ? 'right' : 'left'}
            />
          </View>
        </View>

        {/* Staff & Vendor */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isRTL && styles.arabicText]}>
            {translate('assignmentDetails')}
          </Text>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, isRTL && styles.arabicText]}>
              {translate('assignToStaff')} *
            </Text>
            <TouchableOpacity
              style={styles.selector}
              onPress={() => setShowStaffPicker(true)}
            >
              <Text style={[styles.selectorText, !selectedStaff && styles.placeholder, isRTL && styles.arabicText]}>
                {selectedStaff 
                  ? `${selectedStaff.first_name} ${selectedStaff.last_name}`
                  : translate('selectStaffMember')
                }
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, isRTL && styles.arabicText]}>
              {translate('vendor')}
            </Text>
            <TouchableOpacity
              style={styles.selector}
              onPress={() => setShowSupplierPicker(true)}
            >
              <Text style={[styles.selectorText, !formData.vendor && styles.placeholder, isRTL && styles.arabicText]}>
                {formData.vendor || translate('selectVendor')}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, isRTL && styles.arabicText]}>
              {translate('department')}
            </Text>
            <TextInput
              style={[styles.input, isRTL && styles.arabicInput]}
              placeholder={translate('enterDepartment')}
              value={formData.department}
              onChangeText={(value) => handleInputChange('department', value)}
              textAlign={isRTL ? 'right' : 'left'}
            />
          </View>
        </View>

        {/* Payment Information */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isRTL && styles.arabicText]}>
            {translate('paymentInformation')}
          </Text>
          
          <View style={styles.inputGroup}>
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

        {/* Receipt Image */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isRTL && styles.arabicText]}>
            {translate('receiptImage')}
          </Text>
          
          {selectedImage ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: selectedImage.uri }} style={styles.selectedImage} />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={removeImage}
              >
                <Ionicons name="close-circle" size={24} color="#E74C3C" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.imagePickerButton}
              onPress={showImageOptions}
            >
              <Ionicons name="camera" size={32} color="#6B7D3D" />
              <Text style={[styles.imagePickerText, isRTL && styles.arabicText]}>
                {translate('addReceiptImage')}
              </Text>
              <Text style={[styles.imagePickerSubtext, isRTL && styles.arabicText]}>
                {translate('tapToSelectOrTakePhoto')}
              </Text>
            </TouchableOpacity>
          )}
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
                {translate('createExpense')}
              </Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* Staff Picker Modal */}
      <Modal
        visible={showStaffPicker}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={[styles.modalHeader, isRTL && styles.rtlModalHeader]}>
            <Text style={[styles.modalTitle, isRTL && styles.arabicText]}>
              {translate('selectStaff')}
            </Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowStaffPicker(false)}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={staff}
            keyExtractor={(item) => item.id.toString()}
            style={styles.pickerList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.pickerItem}
                onPress={() => handleStaffSelect(item)}
              >
                <View style={styles.pickerItemContent}>
                  <Text style={[styles.pickerItemName, isRTL && styles.arabicText]}>
                    {item.first_name} {item.last_name}
                  </Text>
                  <Text style={[styles.pickerItemDetails, isRTL && styles.arabicText]}>
                    {item.role} • {item.email}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.noDataContainer}>
                <Ionicons name="people-outline" size={48} color="#ccc" />
                <Text style={[styles.noDataText, isRTL && styles.arabicText]}>
                  {translate('noStaffAvailable')}
                </Text>
              </View>
            }
          />
        </SafeAreaView>
      </Modal>

      {/* Supplier Picker Modal */}
      <Modal
        visible={showSupplierPicker}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={[styles.modalHeader, isRTL && styles.rtlModalHeader]}>
            <Text style={[styles.modalTitle, isRTL && styles.arabicText]}>
              {translate('selectVendor')}
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
                style={styles.pickerItem}
                onPress={() => handleSupplierSelect(item)}
              >
                <View style={styles.pickerItemContent}>
                  <Text style={[styles.pickerItemName, isRTL && styles.arabicText]}>
                    {item.name}
                  </Text>
                  <Text style={[styles.pickerItemDetails, isRTL && styles.arabicText]}>
                    {item.email} • {item.phone}
                  </Text>
                </View>
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
  placeholder: {
    color: '#999',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryOption: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 8,
  },
  categoryOptionActive: {
    backgroundColor: '#6B7D3D',
  },
  categoryOptionText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  categoryOptionTextActive: {
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
  imageContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  selectedImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: -10,
    right: '25%',
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  imagePickerButton: {
    backgroundColor: '#f8fafb',
    borderWidth: 2,
    borderColor: '#6B7D3D',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePickerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7D3D',
    marginTop: 10,
  },
  imagePickerSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
    textAlign: 'center',
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

export default AddExpenseScreen;