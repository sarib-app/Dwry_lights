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
import * as Location from 'expo-location';
import languageService from '../Globals/Store/Lang';

const API_BASE_URL = 'https://planetdory.dwrylight.com/api';

const AddCustomerScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    name_ar: '',
    territory: '',
    customer_type: '',
    address_contact: '',
    lat: '',
    long: '',
    added_by: '',
  });
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [showTerritoryPicker, setShowTerritoryPicker] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [userId, setUserId] = useState('');

  const translate = (key) => languageService.translate(key);

  // Predefined territories (you can customize these)
  const territories = [
    'Eastern Region',
    'Western Region',
    'Central Region',
    'Northern Region',
    'Southern Region',
    'Riyadh Province',
    'Makkah Province',
    'Madinah Province',
    'Qassim Province',
    'Hail Province',
  ];

  // Customer types
  const customerTypes = [
    'Retail',
    'Wholesale',
    'Corporate',
    'Individual',
    'Distributor',
    'Reseller',
  ];

  // Get auth token and user ID from AsyncStorage
  const getAuthData = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const userIdFromStorage = await AsyncStorage.getItem('userId');
      
      if (userIdFromStorage) {
        setUserId(userIdFromStorage);
        setFormData(prev => ({ ...prev, added_by: userIdFromStorage }));
      }
      
      if (token) {
        return `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth data:', error);
    }
    return null;
  };

  useEffect(() => {
    getAuthData();
  }, []);

  // Handle input change
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Get current location
  const getCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Location permission is required to get your current location.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      
      // Get address from coordinates
      const address = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (address.length > 0) {
        const addr = address[0];
        const fullAddress = `${addr.street || ''} ${addr.streetNumber || ''}, ${addr.city || ''}, ${addr.region || ''}, ${addr.country || ''}`.trim();
        
        setFormData(prev => ({
          ...prev,
          lat: latitude.toString(),
          long: longitude.toString(),
          address_contact: fullAddress,
        }));
        
        Alert.alert('Success', 'Location captured successfully!');
      }
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Error', 'Failed to get current location');
    } finally {
      setLocationLoading(false);
    }
  };

  // Validate form
  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Validation Error', 'Customer name is required');
      return false;
    }
    if (!formData.territory.trim()) {
      Alert.alert('Validation Error', 'Territory is required');
      return false;
    }
    if (!formData.customer_type.trim()) {
      Alert.alert('Validation Error', 'Customer type is required');
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
        name: formData.name,
        name_ar: formData.name_ar,
        territory: formData.territory,
        customer_type: formData.customer_type,
        address_contact: formData.address_contact,
        lat: parseFloat(formData.lat) || 0,
        long: parseFloat(formData.long) || 0,
        added_by: parseInt(formData.added_by) || 1,
      };

      const response = await fetch(`${API_BASE_URL}/add_customer`, {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log('Add customer response:', result);

      if (result.status == 200) {
        Alert.alert(
          'Success',
          'Customer added successfully!',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert('Error', result.message || 'Failed to add customer');
      }
    } catch (error) {
      console.error('Add customer error:', error);
      Alert.alert('Error', 'Network error while adding customer');
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
            <Text style={styles.headerTitle}>Add New Customer</Text>
            <View style={styles.placeholder} />
          </View>
        </LinearGradient>
      </View>

      {/* Form */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Customer Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter customer name"
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Customer Name (Arabic)</Text>
            <TextInput
              style={styles.input}
              placeholder="أدخل اسم العميل"
              value={formData.name_ar}
              onChangeText={(value) => handleInputChange('name_ar', value)}
              textAlign="right"
            />
          </View>
        </View>

        {/* Territory & Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Classification</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Territory *</Text>
            <TouchableOpacity
              style={styles.selector}
              onPress={() => setShowTerritoryPicker(true)}
            >
              <Text style={[styles.selectorText, !formData.territory && styles.placeholder]}>
                {formData.territory || 'Select territory'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Customer Type *</Text>
            <TouchableOpacity
              style={styles.selector}
              onPress={() => setShowTypePicker(true)}
            >
              <Text style={[styles.selectorText, !formData.customer_type && styles.placeholder]}>
                {formData.customer_type || 'Select customer type'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Location & Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location & Address</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter customer address"
              value={formData.address_contact}
              onChangeText={(value) => handleInputChange('address_contact', value)}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.locationSection}>
            <Text style={styles.label}>GPS Coordinates</Text>
            
            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.subLabel}>Latitude</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0.0000"
                  value={formData.lat}
                  onChangeText={(value) => handleInputChange('lat', value)}
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.subLabel}>Longitude</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0.0000"
                  value={formData.long}
                  onChangeText={(value) => handleInputChange('long', value)}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.locationButton, locationLoading && styles.locationButtonDisabled]}
              onPress={getCurrentLocation}
              disabled={locationLoading}
            >
              {locationLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="location" size={20} color="#fff" />
              )}
              <Text style={styles.locationButtonText}>
                {locationLoading ? 'Getting Location...' : 'Get Current Location'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* User Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>User Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Added By (User ID)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter user ID"
              value={formData.added_by}
              onChangeText={(value) => handleInputChange('added_by', value)}
              keyboardType="numeric"
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
              <Text style={styles.submitButtonText}>Add Customer</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* Territory Picker Modal */}
      <Modal
        visible={showTerritoryPicker}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Territory</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowTerritoryPicker(false)}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={territories}
            renderItem={({ item }) => renderPickerItem(item, (territory) => {
              handleInputChange('territory', territory);
              setShowTerritoryPicker(false);
            })}
            keyExtractor={(item) => item}
            style={styles.pickerList}
            showsVerticalScrollIndicator={false}
          />
        </SafeAreaView>
      </Modal>

      {/* Customer Type Picker Modal */}
      <Modal
        visible={showTypePicker}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Customer Type</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowTypePicker(false)}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={customerTypes}
            renderItem={({ item }) => renderPickerItem(item, (type) => {
              handleInputChange('customer_type', type);
              setShowTypePicker(false);
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
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  subLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    marginBottom: 5,
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
  locationSection: {
    marginTop: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  halfWidth: {
    flex: 1,
  },
  locationButton: {
    backgroundColor: '#3498DB',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  locationButtonDisabled: {
    backgroundColor: '#95A5A6',
  },
  locationButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
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

export default AddCustomerScreen;