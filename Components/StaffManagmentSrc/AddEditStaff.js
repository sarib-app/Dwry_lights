import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import languageService from '../Globals/Store/Lang';
import getAuthToken from '../Globals/Store/LocalData';
import AsyncStorage from '@react-native-async-storage/async-storage';
import commonStyles from '../Globals/CommonStyles';

const API_BASE_URL = 'https://planetdory.dwrylight.com/api';

const AddEditStaffScreen = ({ navigation, route }) => {
  const { staff, isEdit, onStaffAdded, onStaffUpdated } = route.params || {};
  
  // State management
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isRTL, setIsRTL] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    name_ar: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    salary: '',
    hire_date: new Date(),
    territory_assigned: '',
    status: 'active',
    address: '',
  });

  // UI states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState({});

  const translate = (key) => languageService.translate(key);

  useEffect(() => {
    initializeScreen();
  }, []);

  const initializeScreen = async () => {
    const language = await languageService.loadSavedLanguage();
    setCurrentLanguage(language);
    setIsRTL(language === 'ar');
    
    await loadUserData();
    
    // If editing, populate form with staff data
    if (isEdit && staff) {
      setFormData({
        name: staff.name || '',
        name_ar: staff.name_ar || '',
        email: staff.email || '',
        phone: staff.phone || '',
        position: staff.position || '',
        department: staff.department || '',
        salary: staff.salary?.toString() || '',
        hire_date: staff.hire_date ? new Date(staff.hire_date) : new Date(),
        territory_assigned: staff.territory_assigned || '',
        status: staff.status || 'active',
        address: staff.address || '',
      });
    }
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

  // Update form data
  const updateFormData = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    // Clear error when user starts typing
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: null }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = translate('nameRequired');
    }

    if (!formData.email.trim()) {
      newErrors.email = translate('emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = translate('invalidEmail');
    }

    if (!formData.phone.trim()) {
      newErrors.phone = translate('phoneRequired');
    }

    if (!formData.position.trim()) {
      newErrors.position = translate('positionRequired');
    }

    if (!formData.department.trim()) {
      newErrors.department = translate('departmentRequired');
    }

    if (!formData.salary.trim()) {
      newErrors.salary = translate('salaryRequired');
    } else if (isNaN(parseFloat(formData.salary)) || parseFloat(formData.salary) <= 0) {
      newErrors.salary = translate('invalidSalary');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle date change
  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      updateFormData('hire_date', selectedDate);
    }
  };

  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US');
  };

  // Submit form
  const submitForm = async () => {
    if (!validateForm()) {
      Alert.alert(translate('error'), translate('pleaseFillRequiredFields'));
      return;
    }

    const token = await getAuthToken();
    if (!token) {
      Alert.alert(translate('error'), translate('authTokenNotFound'));
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        name_ar: formData.name_ar.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        position: formData.position.trim(),
        department: formData.department.trim(),
        salary: parseFloat(formData.salary),
        hire_date: formData.hire_date.toISOString().split('T')[0],
        territory_assigned: formData.territory_assigned.trim(),
        status: formData.status,
        address: formData.address.trim(),
        added_by: currentUser?.id,
      };

      let url = `${API_BASE_URL}/add_staff`;
      let method = 'POST';
      let body;

      if (isEdit) {
        url = `${API_BASE_URL}/update_staff/${staff.id}`;
        method = 'POST';
        
        // For update, use FormData
        const formData = new FormData();
        Object.keys(payload).forEach(key => {
          formData.append(key, payload[key]);
        });
        body = formData;
      } else {
        // For add, use JSON
        body = JSON.stringify(payload);
      }

      const headers = {
        'Authorization': token,
      };

      if (!isEdit) {
        headers['Content-Type'] = 'application/json';
      }

      const response = await fetch(url, {
        method,
        headers,
        body,
      });
      
      const result = await response.json();
      console.log('Staff API Response:', result);
      
      if (result.status === 200) {
        Alert.alert(
          translate('success'), 
          isEdit ? translate('staffUpdatedSuccessfully') : translate('staffAddedSuccessfully'),
          [
            { 
              text: translate('ok'), 
              onPress: () => {
                if (isEdit && onStaffUpdated) {
                  onStaffUpdated();
                } else if (!isEdit && onStaffAdded) {
                  onStaffAdded();
                }
                navigation.goBack();
              }
            }
          ]
        );
      } else {
        Alert.alert(translate('error'), result.message || (isEdit ? translate('failedToUpdateStaff') : translate('failedToAddStaff')));
      }
    } catch (error) {
      console.error('Staff API error:', error);
      Alert.alert(translate('error'), isEdit ? translate('networkErrorUpdatingStaff') : translate('networkErrorAddingStaff'));
    } finally {
      setLoading(false);
    }
  };

  // Render form input
  const renderInput = (key, label, options = {}) => {
    const {
      placeholder,
      keyboardType = 'default',
      multiline = false,
      numberOfLines = 1,
      required = false
    } = options;

    return (
      <View style={commonStyles.inputGroup}>
        <Text style={[commonStyles.label, isRTL && commonStyles.arabicText]}>
          {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
        <TextInput
          style={[
            commonStyles.input,
            multiline && commonStyles.textArea,
            errors[key] && styles.inputError,
            isRTL && commonStyles.arabicInput
          ]}
          value={formData[key]}
          onChangeText={(value) => updateFormData(key, value)}
          placeholder={placeholder || label}
          placeholderTextColor="#999"
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={numberOfLines}
          textAlign={isRTL ? 'right' : 'left'}
        />
        {errors[key] && (
          <Text style={[styles.errorText, isRTL && commonStyles.arabicText]}>
            {errors[key]}
          </Text>
        )}
      </View>
    );
  };

  // Render status selector
  const renderStatusSelector = () => (
    <View style={commonStyles.inputGroup}>
      <Text style={[commonStyles.label, isRTL && commonStyles.arabicText]}>
        {translate('status')} <Text style={styles.required}>*</Text>
      </Text>
      <View style={styles.statusContainer}>
        {['active', 'inactive', 'suspended'].map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.statusOption,
              formData.status === status && styles.statusOptionActive
            ]}
            onPress={() => updateFormData('status', status)}
          >
            <Ionicons 
              name={
                status === 'active' ? 'checkmark-circle' : 
                status === 'inactive' ? 'close-circle' : 
                'pause-circle'
              }
              size={16} 
              color={formData.status === status ? "#fff" : "#666"} 
            />
            <Text style={[
              styles.statusOptionText,
              formData.status === status && styles.statusOptionTextActive,
              isRTL && commonStyles.arabicText
            ]}>
              {translate(status)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // Render date picker
  const renderDatePicker = () => (
    <View style={commonStyles.inputGroup}>
      <Text style={[commonStyles.label, isRTL && commonStyles.arabicText]}>
        {translate('hireDate')} <Text style={styles.required}>*</Text>
      </Text>
      <TouchableOpacity
        style={[styles.dateInput, isRTL && styles.rtlInput]}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={[styles.dateText, isRTL && commonStyles.arabicText]}>
          {formatDate(formData.hire_date)}
        </Text>
        <Ionicons name="calendar" size={20} color="#666" />
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={formData.hire_date}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
    </View>
  );

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
            <View style={commonStyles.headerTextContainer}>
              <Text style={[commonStyles.headerTitle, isRTL && commonStyles.arabicText]}>
                {isEdit ? translate('editStaff') : translate('addStaff')}
              </Text>
              <Text style={[commonStyles.headerSubtitle, isRTL && commonStyles.arabicText]}>
                {isEdit ? translate('updateStaffDetails') : translate('addNewTeamMember')}
              </Text>
            </View>
            <View style={commonStyles.placeholder} />
          </View>
        </LinearGradient>
      </View>

      <ScrollView style={commonStyles.content} showsVerticalScrollIndicator={false}>
        {/* Basic Information */}
        <View style={commonStyles.section}>
          <Text style={[commonStyles.sectionTitle, isRTL && commonStyles.arabicText]}>
            {translate('basicInformation')}
          </Text>
          
          {renderInput('name', translate('fullName'), {
            placeholder: translate('enterFullName'),
            required: true
          })}

          {renderInput('name_ar', translate('arabicName'), {
            placeholder: translate('enterArabicName')
          })}

          {renderInput('email', translate('email'), {
            placeholder: translate('enterEmail'),
            keyboardType: 'email-address',
            required: true
          })}

          {renderInput('phone', translate('phone'), {
            placeholder: translate('enterPhone'),
            keyboardType: 'phone-pad',
            required: true
          })}
        </View>

        {/* Job Information */}
        <View style={commonStyles.section}>
          <Text style={[commonStyles.sectionTitle, isRTL && commonStyles.arabicText]}>
            {translate('jobInformation')}
          </Text>

          {renderInput('position', translate('position'), {
            placeholder: translate('enterPosition'),
            required: true
          })}

          {renderInput('department', translate('department'), {
            placeholder: translate('enterDepartment'),
            required: true
          })}

          {renderInput('salary', translate('salary'), {
            placeholder: translate('enterSalary'),
            keyboardType: 'numeric',
            required: true
          })}

          {renderDatePicker()}

          {renderInput('territory_assigned', translate('territoryAssigned'), {
            placeholder: translate('enterTerritory')
          })}

          {renderStatusSelector()}
        </View>

        {/* Additional Information */}
        <View style={commonStyles.section}>
          <Text style={[commonStyles.sectionTitle, isRTL && commonStyles.arabicText]}>
            {translate('additionalInformation')}
          </Text>

          {renderInput('address', translate('address'), {
            placeholder: translate('enterAddress'),
            multiline: true,
            numberOfLines: 3
          })}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            commonStyles.submitButton,
            loading && commonStyles.submitButtonDisabled
          ]}
          onPress={submitForm}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name={isEdit ? "checkmark" : "add"} size={20} color="#fff" />
          )}
          <Text style={[commonStyles.submitButtonText, isRTL && commonStyles.arabicText]}>
            {isEdit ? translate('updateStaff') : translate('addStaff')}
          </Text>
        </TouchableOpacity>

        <View style={commonStyles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // Form Validation
  required: {
    color: '#E74C3C',
    fontSize: 14,
  },

  inputError: {
    borderColor: '#E74C3C',
    borderWidth: 1,
  },

  errorText: {
    color: '#E74C3C',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },

  // Status Selector
  statusContainer: {
    flexDirection: 'row',
    gap: 8,
  },

  statusOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
    gap: 6,
  },

  statusOptionActive: {
    backgroundColor: '#6B7D3D',
    borderColor: '#6B7D3D',
  },

  statusOptionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },

  statusOptionTextActive: {
    color: '#fff',
    fontWeight: '600',
  },

  // Date Input
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

  rtlInput: {
    flexDirection: 'row-reverse',
  },

  dateText: {
    fontSize: 16,
    color: '#333',
  },
});

export default AddEditStaffScreen;