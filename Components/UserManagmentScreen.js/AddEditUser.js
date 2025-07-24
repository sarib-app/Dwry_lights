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

const AddEditUserScreen = ({ navigation, route }) => {
  const { user, isEdit, onUserAdded, onUserUpdated } = route.params || {};
  
  // State management
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isRTL, setIsRTL] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    iqama_no: '',
    dob: new Date(),
    role_id: 3, // Default to staff role
    password: '',
    password_confirmation: '',
  });

  // UI states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Role options
  const roleOptions = [
    { id: 1, name: 'superadmin', label: 'Super Admin' },
    { id: 2, name: 'admin', label: 'Admin' },
    { id: 3, name: 'staff', label: 'Staff' },
  ];

  const translate = (key) => languageService.translate(key);

  useEffect(() => {
    initializeScreen();
  }, []);

  const initializeScreen = async () => {
    const language = await languageService.loadSavedLanguage();
    setCurrentLanguage(language);
    setIsRTL(language === 'ar');
    
    await loadUserData();
    
    // If editing, populate form with user data
    if (isEdit && user) {
      const roleId = getRoleIdFromName(user.role);
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        iqama_no: user.iqama_no || '',
        dob: user.dob ? new Date(user.dob) : new Date(),
        role_id: roleId,
        password: '',
        password_confirmation: '',
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

  // Get role ID from role name
  const getRoleIdFromName = (roleName) => {
    const roleMap = {
      'Super Admin': 1,
      'Admin': 2,
      'Staff': 3,
    };
    return roleMap[roleName] || 3;
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

    if (!formData.first_name.trim()) {
      newErrors.first_name = translate('firstNameRequired');
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = translate('lastNameRequired');
    }

    if (!formData.email.trim()) {
      newErrors.email = translate('emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = translate('invalidEmail');
    }

    if (!formData.iqama_no.trim()) {
      newErrors.iqama_no = translate('iqamaRequired');
    }

    // Password validation only for new users or when password is provided for edit
    if (!isEdit || formData.password.trim()) {
      if (!formData.password.trim()) {
        newErrors.password = translate('passwordRequired');
      } else if (formData.password.length < 8) {
        newErrors.password = translate('passwordTooShort');
      }

      if (!formData.password_confirmation.trim()) {
        newErrors.password_confirmation = translate('confirmPasswordRequired');
      } else if (formData.password !== formData.password_confirmation) {
        newErrors.password_confirmation = translate('passwordsDoNotMatch');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle date change
  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      updateFormData('dob', selectedDate);
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
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim(),
        iqama_no: formData.iqama_no.trim(),
        dob: formData.dob.toISOString().split('T')[0],
        role_id: formData.role_id,
      };

      // Add password fields only if provided (for new users or password change)
      if (!isEdit || formData.password.trim()) {
        payload.password = formData.password;
        payload.password_confirmation = formData.password_confirmation;
      }

      let url = `${API_BASE_URL}/register`;
      let method = 'POST';

      if (isEdit) {
        url = `${API_BASE_URL}/update_user`;
        method = 'POST';
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        body: JSON.stringify(payload),
      });
      
      const result = await response.json();
      console.log('User API Response:', result);
      
      if (result.status === 200) {
        Alert.alert(
          translate('success'), 
          isEdit ? translate('userUpdatedSuccessfully') : translate('userAddedSuccessfully'),
          [
            { 
              text: translate('ok'), 
              onPress: () => {
                if (isEdit && onUserUpdated) {
                  onUserUpdated();
                } else if (!isEdit && onUserAdded) {
                  onUserAdded();
                }
                navigation.goBack();
              }
            }
          ]
        );
      } else {
        Alert.alert(translate('error'), result.message || (isEdit ? translate('failedToUpdateUser') : translate('failedToAddUser')));
      }
    } catch (error) {
      console.error('User API error:', error);
      Alert.alert(translate('error'), isEdit ? translate('networkErrorUpdatingUser') : translate('networkErrorAddingUser'));
    } finally {
      setLoading(false);
    }
  };

  // Render form input
  const renderInput = (key, label, options = {}) => {
    const {
      placeholder,
      keyboardType = 'default',
      secureTextEntry = false,
      required = false,
      showToggle = false
    } = options;

    return (
      <View style={commonStyles.inputGroup}>
        <Text style={[commonStyles.label, isRTL && commonStyles.arabicText]}>
          {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
        <View style={[styles.inputContainer, errors[key] && styles.inputError]}>
          <TextInput
            style={[
              styles.textInput,
              isRTL && commonStyles.arabicInput
            ]}
            value={formData[key]}
            onChangeText={(value) => updateFormData(key, value)}
            placeholder={placeholder || label}
            placeholderTextColor="#999"
            keyboardType={keyboardType}
            secureTextEntry={secureTextEntry}
            textAlign={isRTL ? 'right' : 'left'}
          />
          {showToggle && (
            <TouchableOpacity
              onPress={() => {
                if (key === 'password') {
                  setShowPassword(!showPassword);
                } else if (key === 'password_confirmation') {
                  setShowConfirmPassword(!showConfirmPassword);
                }
              }}
            >
              <Ionicons 
                name={secureTextEntry ? "eye-off" : "eye"} 
                size={20} 
                color="#666" 
              />
            </TouchableOpacity>
          )}
        </View>
        {errors[key] && (
          <Text style={[styles.errorText, isRTL && commonStyles.arabicText]}>
            {errors[key]}
          </Text>
        )}
      </View>
    );
  };

  // Render role selector
  const renderRoleSelector = () => (
    <View style={commonStyles.inputGroup}>
      <Text style={[commonStyles.label, isRTL && commonStyles.arabicText]}>
        {translate('userRole')} <Text style={styles.required}>*</Text>
      </Text>
      <View style={styles.roleContainer}>
        {roleOptions.map((role) => (
          <TouchableOpacity
            key={role.id}
            style={[
              styles.roleOption,
              formData.role_id === role.id && styles.roleOptionActive
            ]}
            onPress={() => updateFormData('role_id', role.id)}
          >
            <Ionicons 
              name={
                role.name === 'superadmin' ? 'shield' :
                role.name === 'admin' ? 'settings' :
                'person'
              }
              size={16} 
              color={formData.role_id === role.id ? "#fff" : "#666"} 
            />
            <Text style={[
              styles.roleOptionText,
              formData.role_id === role.id && styles.roleOptionTextActive,
              isRTL && commonStyles.arabicText
            ]}>
              {translate(role.name)}
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
        {translate('dateOfBirth')} <Text style={styles.required}>*</Text>
      </Text>
      <TouchableOpacity
        style={[styles.dateInput, isRTL && styles.rtlInput]}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={[styles.dateText, isRTL && commonStyles.arabicText]}>
          {formatDate(formData.dob)}
        </Text>
        <Ionicons name="calendar" size={20} color="#666" />
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={formData.dob}
          mode="date"
          display="default"
          maximumDate={new Date()}
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
                {isEdit ? translate('editUser') : translate('addUser')}
              </Text>
              <Text style={[commonStyles.headerSubtitle, isRTL && commonStyles.arabicText]}>
                {isEdit ? translate('updateUserDetails') : translate('addNewSystemUser')}
              </Text>
            </View>
            <View style={commonStyles.placeholder} />
          </View>
        </LinearGradient>
      </View>

      <ScrollView style={commonStyles.content} showsVerticalScrollIndicator={false}>
        {/* Personal Information */}
        <View style={commonStyles.section}>
          <Text style={[commonStyles.sectionTitle, isRTL && commonStyles.arabicText]}>
            {translate('personalInformation')}
          </Text>
          
          {renderInput('first_name', translate('firstName'), {
            placeholder: translate('enterFirstName'),
            required: true
          })}

          {renderInput('last_name', translate('lastName'), {
            placeholder: translate('enterLastName'),
            required: true
          })}

          {renderInput('email', translate('email'), {
            placeholder: translate('enterEmail'),
            keyboardType: 'email-address',
            required: true
          })}

          {renderInput('iqama_no', translate('iqamaNumber'), {
            placeholder: translate('enterIqamaNumber'),
            required: true
          })}

          {renderDatePicker()}
        </View>

        {/* System Access */}
        <View style={commonStyles.section}>
          <Text style={[commonStyles.sectionTitle, isRTL && commonStyles.arabicText]}>
            {translate('systemAccess')}
          </Text>

          {renderRoleSelector()}

          {renderInput('password', translate('password'), {
            placeholder: isEdit ? translate('leaveBlankToKeepCurrent') : translate('enterPassword'),
            secureTextEntry: !showPassword,
            required: !isEdit,
            showToggle: true
          })}

          {renderInput('password_confirmation', translate('confirmPassword'), {
            placeholder: translate('confirmYourPassword'),
            secureTextEntry: !showConfirmPassword,
            required: !isEdit || formData.password.trim().length > 0,
            showToggle: true
          })}
        </View>

        {/* Password Requirements */}
        {(!isEdit || formData.password.trim()) && (
          <View style={styles.passwordRequirements}>
            <Text style={[styles.requirementsTitle, isRTL && commonStyles.arabicText]}>
              {translate('passwordRequirements')}
            </Text>
            <Text style={[styles.requirementText, isRTL && commonStyles.arabicText]}>
              • {translate('minEightCharacters')}
            </Text>
            <Text style={[styles.requirementText, isRTL && commonStyles.arabicText]}>
              • {translate('passwordsMustMatch')}
            </Text>
          </View>
        )}

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
            {isEdit ? translate('updateUser') : translate('addUser')}
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

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 15,
  },

  textInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    color: '#333',
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

  // Role Selector
  roleContainer: {
    gap: 8,
  },

  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
    gap: 10,
  },

  roleOptionActive: {
    backgroundColor: '#6B7D3D',
    borderColor: '#6B7D3D',
  },

  roleOptionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    flex: 1,
  },

  roleOptionTextActive: {
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

  // Password Requirements
  passwordRequirements: {
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },

  requirementsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3498DB',
    marginBottom: 8,
  },

  requirementText: {
    fontSize: 12,
    color: '#3498DB',
    marginBottom: 2,
  },
});

export default AddEditUserScreen;