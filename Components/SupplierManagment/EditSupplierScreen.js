import React, { useState } from 'react';
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
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import languageService from '../Globals/Store/Lang';

const API_BASE_URL = 'https://planetdory.dwrylight.com/api';

const EditSupplierScreen = ({ navigation, route }) => {
  const { supplier } = route.params;
  
  const [formData, setFormData] = useState({
    name: supplier.name || '',
    name_ar: supplier.name_ar || '',
    contact_person: supplier.contact_person || '',
    email: supplier.email || '',
    phone: supplier.phone || '',
    address: supplier.address || '',
    city: supplier.city || '',
    supplier_type: supplier.supplier_type || '',
    payment_terms: supplier.payment_terms || '',
    credit_limit: supplier.credit_limit?.toString() || '',
    tax_number: supplier.tax_number || '',
    status: supplier.status === 'active',
  });
  const [loading, setLoading] = useState(false);
  const [showSupplierTypePicker, setShowSupplierTypePicker] = useState(false);
  const [showPaymentTermsPicker, setShowPaymentTermsPicker] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);

  const translate = (key) => languageService.translate(key);

  // Predefined options
  const supplierTypes = ['Local', 'International', 'Distributor', 'Manufacturer'];
  const paymentTerms = ['Cash', 'Net 15', 'Net 30', 'Net 45', 'Net 60', 'Net 90', 'COD'];
  const saudiCities = [
    'Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dammam', 'Khobar', 'Dhahran',
    'Taif', 'Abha', 'Tabuk', 'Buraidah', 'Khamis Mushait', 'Hail', 'Hofuf',
    'Jubail', 'Hafar Al-Batin', 'Yanbu', 'Qatif', 'Sakaka', 'Jazan'
  ];

  // Get auth token from AsyncStorage
  const getAuthToken = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken')
      if (token) {
        return `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return null;
  };

  // Handle input change
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Validate form
  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Validation Error', 'Supplier name is required');
      return false;
    }
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return false;
    }
    if (formData.credit_limit && isNaN(formData.credit_limit)) {
      Alert.alert('Validation Error', 'Credit limit must be a valid number');
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
        Alert.alert('Error', 'Authentication token not found');
        return;
      }

      // Only send fields that have values (as per your API structure)
      const payload = {};
      
      if (formData.name.trim()) payload.name = formData.name;
      if (formData.name_ar.trim()) payload.name_ar = formData.name_ar;
      if (formData.contact_person.trim()) payload.contact_person = formData.contact_person;
      if (formData.email.trim()) payload.email = formData.email;
      if (formData.phone.trim()) payload.phone = formData.phone;
      if (formData.address.trim()) payload.address = formData.address;
      if (formData.city.trim()) payload.city = formData.city;
      if (formData.supplier_type.trim()) payload.supplier_type = formData.supplier_type;
      if (formData.payment_terms.trim()) payload.payment_terms = formData.payment_terms;
      if (formData.credit_limit) payload.credit_limit = parseFloat(formData.credit_limit);
      if (formData.tax_number.trim()) payload.tax_number = formData.tax_number;
      payload.status = formData.status ? 'active' : 'inactive';

      const response = await fetch(`${API_BASE_URL}/update_supplier_by_id/${supplier.id}`, {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log('Update supplier response:', result);

      if (result.status == 200) {
        Alert.alert(
          'Success',
          'Supplier updated successfully!',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert('Error', result.message || 'Failed to update supplier');
      }
    } catch (error) {
      console.error('Update supplier error:', error);
      Alert.alert('Error', 'Network error while updating supplier');
    } finally {
      setLoading(false);
    }
  };

  // Render picker item
  const renderPickerItem = (item, onSelect) => (
    <TouchableOpacity
      style={styles.pickerItem}
      onPress={() => onSelect(item)}
    >
      <Text style={styles.pickerItemText}>{item}</Text>
      <Ionicons name="chevron-forward" size={20} color="#666" />
    </TouchableOpacity>
  );

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
            <Text style={styles.headerTitle}>Edit Supplier</Text>
            <View style={styles.placeholder} />
          </View>
        </LinearGradient>
      </View>

      {/* Form */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current Information Display */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Information</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="business" size={20} color="#6B7D3D" />
              <Text style={styles.infoLabel}>Original Name:</Text>
              <Text style={styles.infoValue}>{supplier.name}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="person" size={20} color="#E74C3C" />
              <Text style={styles.infoLabel}>Contact:</Text>
              <Text style={styles.infoValue}>{supplier.contact_person}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="call" size={20} color="#3498DB" />
              <Text style={styles.infoLabel}>Phone:</Text>
              <Text style={styles.infoValue}>{supplier.phone}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="card" size={20} color="#9B59B6" />
              <Text style={styles.infoLabel}>Credit Limit:</Text>
              <Text style={styles.infoValue}>
                {supplier.credit_limit ? `$${supplier.credit_limit.toLocaleString()}` : 'Not set'}
              </Text>
            </View>
          </View>
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Update Basic Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Supplier Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter supplier name"
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Supplier Name (Arabic)</Text>
            <TextInput
              style={styles.input}
              placeholder="أدخل اسم المورد"
              value={formData.name_ar}
              onChangeText={(value) => handleInputChange('name_ar', value)}
              textAlign="right"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contact Person</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter contact person name"
              value={formData.contact_person}
              onChangeText={(value) => handleInputChange('contact_person', value)}
            />
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="+966 50 123 4567"
              value={formData.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="supplier@company.com"
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>City</Text>
            <TouchableOpacity
              style={styles.selector}
              onPress={() => setShowCityPicker(true)}
            >
              <Text style={[styles.selectorText, !formData.city && styles.placeholder]}>
                {formData.city || 'Select city'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter complete address"
              value={formData.address}
              onChangeText={(value) => handleInputChange('address', value)}
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* Business Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Supplier Type</Text>
            <TouchableOpacity
              style={styles.selector}
              onPress={() => setShowSupplierTypePicker(true)}
            >
              <Text style={[styles.selectorText, !formData.supplier_type && styles.placeholder]}>
                {formData.supplier_type || 'Select supplier type'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Payment Terms</Text>
            <TouchableOpacity
              style={styles.selector}
              onPress={() => setShowPaymentTermsPicker(true)}
            >
              <Text style={[styles.selectorText, !formData.payment_terms && styles.placeholder]}>
                {formData.payment_terms || 'Select payment terms'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Credit Limit</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              value={formData.credit_limit}
              onChangeText={(value) => handleInputChange('credit_limit', value)}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tax Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter tax/VAT number"
              value={formData.tax_number}
              onChangeText={(value) => handleInputChange('tax_number', value)}
              keyboardType="numeric"
            />
          </View>

          {/* Status Toggle */}
          <View style={styles.switchContainer}>
            <View style={styles.switchInfo}>
              <Ionicons 
                name={formData.status ? "checkmark-circle" : "close-circle"} 
                size={20} 
                color={formData.status ? "#27AE60" : "#E74C3C"} 
              />
              <Text style={styles.switchLabel}>Supplier Status</Text>
            </View>
            <View style={styles.switchControl}>
              <Text style={[styles.switchText, !formData.status && styles.activeText]}>
                Inactive
              </Text>
              <Switch
                value={formData.status}
                onValueChange={(value) => handleInputChange('status', value)}
                trackColor={{ false: '#E74C3C', true: '#27AE60' }}
                thumbColor={formData.status ? '#fff' : '#fff'}
              />
              <Text style={[styles.switchText, formData.status && styles.activeText]}>
                Active
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
              <Ionicons name="save" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>Update Supplier</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* Supplier Type Picker Modal */}
      <Modal
        visible={showSupplierTypePicker}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Supplier Type</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowSupplierTypePicker(false)}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={supplierTypes}
            renderItem={({ item }) => renderPickerItem(item, (type) => {
              handleInputChange('supplier_type', type);
              setShowSupplierTypePicker(false);
            })}
            keyExtractor={(item) => item}
            style={styles.pickerList}
            showsVerticalScrollIndicator={false}
          />
        </SafeAreaView>
      </Modal>

      {/* Payment Terms Picker Modal */}
      <Modal
        visible={showPaymentTermsPicker}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Payment Terms</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowPaymentTermsPicker(false)}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={paymentTerms}
            renderItem={({ item }) => renderPickerItem(item, (terms) => {
              handleInputChange('payment_terms', terms);
              setShowPaymentTermsPicker(false);
            })}
            keyExtractor={(item) => item}
            style={styles.pickerList}
            showsVerticalScrollIndicator={false}
          />
        </SafeAreaView>
      </Modal>

      {/* City Picker Modal */}
      <Modal
        visible={showCityPicker}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select City</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowCityPicker(false)}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={saudiCities}
            renderItem={({ item }) => renderPickerItem(item, (city) => {
              handleInputChange('city', city);
              setShowCityPicker(false);
            })}
            keyExtractor={(item) => item}
            style={styles.pickerList}
            showsVerticalScrollIndicator={false}
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
  infoCard: {
    backgroundColor: '#f8fafb',
    borderRadius: 12,
    padding: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 2,
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
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  switchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchLabel: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  switchControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchText: {
    fontSize: 14,
    color: '#666',
    marginHorizontal: 8,
  },
  activeText: {
    fontWeight: '600',
    color: '#333',
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
  pickerItemText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
});

export default EditSupplierScreen;