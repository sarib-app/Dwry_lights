// RegistrationScreen.js - Updated Professional Registration Screen
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet, 
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import our professional services
// import Apis from './api';
import Apis from '../Globals/Store/Apis';
import languageService from '../Globals/Store/Lang';
import Validation from '../Globals/Store/Validation';

const RegistrationScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    iqama_no: '',
    dob: new Date(),
    role_id: 3, // Default to Sales Rep
    password: '',
    password_confirmation: ''
  });
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isRTL, setIsRTL] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const roles = [
    { id: 1, name: 'admin', nameKey: 'admin' },
    { id: 2, name: 'warehouseManager', nameKey: 'warehouseManager' },
    { id: 3, name: 'salesRepresentative', nameKey: 'salesRepresentative' }
  ];

  useEffect(() => {
    initializeLanguage();
  }, []);

  const initializeLanguage = async () => {
    const language = await languageService.loadSavedLanguage();
    setCurrentLanguage(language);
    setIsRTL(language === 'ar');

    // Add listener for language changes
    const removeListener = languageService.addListener((lang, rtl) => {
      setCurrentLanguage(lang);
      setIsRTL(rtl);
    });

    return removeListener;
  };

  const translate = (key) => {
    return languageService.translate(key);
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const handleRegister = async () => {
    // Validate form
    const validation = Validation.validateRegistrationForm(formData);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Prepare data for API
      const registrationData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        iqama_no: formData.iqama_no,
        dob: formData.dob.toISOString().split('T')[0],
        role_id: formData.role_id,
        password: formData.password,
        password_confirmation: formData.password_confirmation
      };

      // Call API service
      const result = await Apis.register(registrationData);

      if (result.success) {
        // Store token in AsyncStorage
        if (result.data.token) {
          await AsyncStorage.setItem('userToken', result.data.token);
          await AsyncStorage.setItem('userData', JSON.stringify(result.data.user));
        }

        Alert.alert(
          translate('registrationSuccessful'),
          translate('accountCreated'),
          [
            {
              text: translate('ok'),
              onPress: () => {
                // Navigate to dashboard or login screen
                console.log('Registration successful:', result.data);
                // navigation.navigate('Dashboard');
              }
            }
          ]
        );
      } else {
        // Handle API errors
        if (result.errors) {
          setErrors(result.errors);
        } else {
          Alert.alert(
            translate('registrationError'),
            result.error || translate('An error occurred during registration')
          );
        }
      }
    } catch (error) {
      Alert.alert(
        translate('connectionError'),
        translate('networkError')
      );
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || formData.dob;
    setShowDatePicker(false);
    handleInputChange('dob', currentDate);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={[styles.header, isRTL && styles.rtlHeader]}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoEmoji}>🌍</Text>
            </View>
            <Text style={[styles.title, isRTL && styles.arabicText]}>
              {translate('appName')}
            </Text>
            <Text style={[styles.subtitle, isRTL && styles.arabicText]}>
              {translate('createAccount')}
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* First Name */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, isRTL && styles.arabicText]}>
                {translate('firstName')} *
              </Text>
              <View style={[styles.inputContainer, errors.first_name && styles.inputError]}>
                <Ionicons name="person-outline" size={20} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, isRTL && styles.arabicInput]}
                  value={formData.first_name}
                  onChangeText={(text) => handleInputChange('first_name', text)}
                  placeholder={translate('enterFirstName')}
                  placeholderTextColor="#999"
                  textAlign={isRTL ? 'right' : 'left'}
                />
              </View>
              {errors.first_name && (
                <Text style={[styles.errorText, isRTL && styles.arabicText]}>
                  {errors.first_name}
                </Text>
              )}
            </View>

            {/* Last Name */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, isRTL && styles.arabicText]}>
                {translate('lastName')} *
              </Text>
              <View style={[styles.inputContainer, errors.last_name && styles.inputError]}>
                <Ionicons name="person-outline" size={20} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, isRTL && styles.arabicInput]}
                  value={formData.last_name}
                  onChangeText={(text) => handleInputChange('last_name', text)}
                  placeholder={translate('enterLastName')}
                  placeholderTextColor="#999"
                  textAlign={isRTL ? 'right' : 'left'}
                />
              </View>
              {errors.last_name && (
                <Text style={[styles.errorText, isRTL && styles.arabicText]}>
                  {errors.last_name}
                </Text>
              )}
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, isRTL && styles.arabicText]}>
                {translate('email')} *
              </Text>
              <View style={[styles.inputContainer, errors.email && styles.inputError]}>
                <Ionicons name="mail-outline" size={20} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.email}
                  onChangeText={(text) => handleInputChange('email', text)}
                  placeholder={translate('enterEmail')}
                  placeholderTextColor="#999"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  textAlign="left"
                />
              </View>
              {errors.email && (
                <Text style={[styles.errorText, isRTL && styles.arabicText]}>
                  {errors.email}
                </Text>
              )}
            </View>

            {/* Iqama Number */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, isRTL && styles.arabicText]}>
                {translate('iqamaNumber')} *
              </Text>
              <View style={[styles.inputContainer, errors.iqama_no && styles.inputError]}>
                <Ionicons name="card-outline" size={20} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.iqama_no}
                  onChangeText={(text) => handleInputChange('iqama_no', text)}
                  placeholder={translate('enterIqama')}
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  maxLength={10}
                  textAlign="left"
                />
              </View>
              {errors.iqama_no && (
                <Text style={[styles.errorText, isRTL && styles.arabicText]}>
                  {errors.iqama_no}
                </Text>
              )}
            </View>

            {/* Date of Birth */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, isRTL && styles.arabicText]}>
                {translate('dateOfBirth')} *
              </Text>
              <TouchableOpacity 
                style={[styles.inputContainer, styles.dateButton]}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={20} color="#999" style={styles.inputIcon} />
                <Text style={[styles.dateText, isRTL && styles.arabicText]}>
                  {formatDate(formData.dob)}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#999" />
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={formData.dob}
                  mode="date"
                  display="default"
                  onChange={onDateChange}
                  maximumDate={new Date()}
                />
              )}
              {errors.dob && (
                <Text style={[styles.errorText, isRTL && styles.arabicText]}>
                  {errors.dob}
                </Text>
              )}
            </View>

            {/* Role */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, isRTL && styles.arabicText]}>
                {translate('role')} *
              </Text>
              <View style={[styles.inputContainer, styles.pickerContainer]}>
                <Ionicons name="briefcase-outline" size={20} color="#999" style={styles.inputIcon} />
                <Picker
                  selectedValue={formData.role_id}
                  onValueChange={(itemValue) => handleInputChange('role_id', itemValue)}
                  style={[styles.picker, isRTL && styles.arabicPicker]}
                >
                  {roles.map((role) => (
                    <Picker.Item 
                      key={role.id} 
                      label={translate(role.nameKey)} 
                      value={role.id} 
                    />
                  ))}
                </Picker>
              </View>
              {errors.role_id && (
                <Text style={[styles.errorText, isRTL && styles.arabicText]}>
                  {errors.role_id}
                </Text>
              )}
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, isRTL && styles.arabicText]}>
                {translate('password')} *
              </Text>
              <View style={[styles.inputContainer, errors.password && styles.inputError]}>
                <Ionicons name="lock-closed-outline" size={20} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.password}
                  onChangeText={(text) => handleInputChange('password', text)}
                  placeholder={translate('enterPassword')}
                  placeholderTextColor="#999"
                  secureTextEntry={!showPassword}
                  textAlign="left"
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons 
                    name={showPassword ? "eye-outline" : "eye-off-outline"} 
                    size={20} 
                    color="#999" 
                  />
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text style={[styles.errorText, isRTL && styles.arabicText]}>
                  {errors.password}
                </Text>
              )}
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, isRTL && styles.arabicText]}>
                {translate('confirmPassword')} *
              </Text>
              <View style={[styles.inputContainer, errors.password_confirmation && styles.inputError]}>
                <Ionicons name="lock-closed-outline" size={20} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.password_confirmation}
                  onChangeText={(text) => handleInputChange('password_confirmation', text)}
                  placeholder={translate('reenterPassword')}
                  placeholderTextColor="#999"
                  secureTextEntry={!showConfirmPassword}
                  textAlign="left"
                />
                <TouchableOpacity 
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons 
                    name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} 
                    size={20} 
                    color="#999" 
                  />
                </TouchableOpacity>
              </View>
              {errors.password_confirmation && (
                <Text style={[styles.errorText, isRTL && styles.arabicText]}>
                  {errors.password_confirmation}
                </Text>
              )}
            </View>

            {/* Register Button */}
            <TouchableOpacity 
              style={[styles.registerButton, loading && styles.disabledButton]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Text style={[styles.registerButtonText, isRTL && styles.arabicText]}>
                    {translate('createAccount')}
                  </Text>
                  <Ionicons 
                    name={isRTL ? "arrow-back" : "arrow-forward"} 
                    size={20} 
                    color="#fff" 
                    style={styles.buttonIcon}
                  />
                </>
              )}
            </TouchableOpacity>

            {/* Login Link */}
            <View style={[styles.loginLinkContainer, isRTL && styles.rtlLoginLink]}>
              <Text style={[styles.loginLinkText, isRTL && styles.arabicText]}>
                {translate('alreadyHaveAccount')}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={[styles.loginLink, isRTL && styles.arabicText]}>
                  {translate('login')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafb',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 20,
  },
  rtlHeader: {
    alignItems: 'center',
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f9f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#6B7D3D',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  logoEmoji: {
    fontSize: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6B7D3D',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  arabicText: {
    textAlign: 'right',
    fontFamily: 'Arabic',
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    backgroundColor: '#f9fafb',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  inputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
  },
  arabicInput: {
    textAlign: 'right',
  },
  eyeIcon: {
    padding: 4,
  },
  dateButton: {
    justifyContent: 'space-between',
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
  },
  pickerContainer: {
    paddingVertical: 0,
    paddingHorizontal: 12,
  },
  picker: {
    flex: 1,
    marginLeft: 8,
  },
  arabicPicker: {
    textAlign: 'right',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
  registerButton: {
    backgroundColor: '#6B7D3D',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: '#6B7D3D',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
    shadowOpacity: 0,
    elevation: 0,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 4,
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  rtlLoginLink: {
    flexDirection: 'row-reverse',
  },
  loginLinkText: {
    fontSize: 14,
    color: '#6b7280',
    marginRight: 4,
  },
  loginLink: {
    fontSize: 14,
    color: '#6B7D3D',
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default RegistrationScreen;