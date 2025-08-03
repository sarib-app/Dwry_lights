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

const SetSalesTargetScreen = ({ navigation }) => {
  // State management
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isRTL, setIsRTL] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Form states
  const [targetPeriod, setTargetPeriod] = useState('monthly');
  const [targetDate, setTargetDate] = useState(new Date());
  const [targetAmount, setTargetAmount] = useState('');
  const [targetType, setTargetType] = useState('revenue');
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedTerritory, setSelectedTerritory] = useState(null);

  // UI states
  const [showDatePicker, setShowDatePicker] = useState(false);

  const translate = (key) => languageService.translate(key);

  useEffect(() => {
    initializeScreen();
  }, []);

  const initializeScreen = async () => {
    const language = await languageService.loadSavedLanguage();
    setCurrentLanguage(language);
    setIsRTL(language === 'ar');
    
    await loadUserData();
  };

  // Load user data from AsyncStorage
  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        setCurrentUser(user);
        
        // Check if user is admin (role_id not equal to 3)
        const userIsAdmin = user.role_id !== 3;
        setIsAdmin(userIsAdmin);
        
        // If staff, set their ID automatically
        if (!userIsAdmin) {
          setSelectedStaff(user);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  // Show paid feature alert
  const showPaidFeatureAlert = () => {
    const message = isRTL 
      ? 'هذه الميزة متوفرة في التحديثات المدفوعة'
      : 'This feature comes in paid updates';
    
    Alert.alert(
      isRTL ? 'ميزة مدفوعة' : 'Paid Feature',
      message,
      [{ text: isRTL ? 'موافق' : 'OK' }]
    );
  };

  // Handle target period selection
  const handleTargetPeriodSelect = (period) => {
    if (period === 'monthly') {
      setTargetPeriod(period);
    } else {
      showPaidFeatureAlert();
    }
  };

  // Handle target type selection
  const handleTargetTypeSelect = (type) => {
    if (type === 'revenue') {
      setTargetType(type);
    } else {
      showPaidFeatureAlert();
    }
  };

  // Handle territory selection (always show paid feature alert)
  const handleTerritorySelect = () => {
    showPaidFeatureAlert();
  };

  // Handle date change
  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setTargetDate(selectedDate);
    }
  };

  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US');
  };

  // Format date for API (YYYY-MM)
  const formatDateForAPI = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  // Validate form
  const validateForm = () => {
    if (!targetAmount.trim()) {
      Alert.alert(translate('error'), translate('targetAmountRequired'));
      return false;
    }

    if (parseFloat(targetAmount) <= 0) {
      Alert.alert(translate('error'), translate('targetAmountMustBePositive'));
      return false;
    }

    if (!isAdmin && !selectedStaff) {
      Alert.alert(translate('error'), translate('staffSelectionRequired'));
      return false;
    }

    return true;
  };

  // Submit sales target
  const submitSalesTarget = async () => {
    if (!validateForm()) return;

    const token = await getAuthToken();
    if (!token) {
      Alert.alert(translate('error'), translate('authTokenNotFound'));
      return;
    }

    setLoading(true);
    try {
      const payload = {
        target_period: targetPeriod,
        target_date: formatDateForAPI(targetDate), // Fixed date format
        target_amount: parseFloat(targetAmount),
        target_type: targetType,
        set_by: currentUser.id,
      };

      // Add optional fields
      if (selectedStaff) {
        payload.staff_id = selectedStaff.id;
      }

      if (selectedCustomer) {
        payload.customer_id = selectedCustomer.id;
      }

      if (selectedTerritory) {
        payload.territory = selectedTerritory.name;
      }

      const response = await fetch(`${API_BASE_URL}/set_sales_target`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        body: JSON.stringify(payload),
      });
      
      const result = await response.json();
      console.log('Set Sales Target Response:', result);
      
      if (result.status === 200) {
        Alert.alert(
          translate('success'), 
          translate('salesTargetSetSuccessfully'),
          [
            { 
              text: translate('ok'), 
              onPress: () => {
                // Reset form
                setTargetAmount('');
                setSelectedCustomer(null);
                if (isAdmin) {
                  setSelectedStaff(null);
                  setSelectedTerritory(null);
                }
                setTargetDate(new Date());
              }
            }
          ]
        );
      } else {
        Alert.alert(translate('error'), result.message || translate('failedToSetSalesTarget'));
      }
    } catch (error) {
      console.error('Set sales target error:', error);
      Alert.alert(translate('error'), translate('networkErrorSettingTarget'));
    } finally {
      setLoading(false);
    }
  };

  // Render target period selection
  const renderTargetPeriod = () => (
    <View style={commonStyles.inputGroup}>
      <Text style={[commonStyles.label, isRTL && commonStyles.arabicText]}>
        {translate('targetPeriod')} *
      </Text>
      <View style={styles.periodContainer}>
        {['monthly', 'quarterly', 'yearly'].map((period) => (
          <TouchableOpacity
            key={period}
            style={[
              styles.periodOption,
              targetPeriod === period && styles.periodOptionActive,
              period !== 'monthly' && styles.lockedOption
            ]}
            onPress={() => handleTargetPeriodSelect(period)}
          >
            <View style={styles.optionContent}>
              <Text style={[
                styles.periodOptionText,
                targetPeriod === period && styles.periodOptionTextActive,
                period !== 'monthly' && styles.lockedOptionText,
                isRTL && commonStyles.arabicText
              ]}>
                {translate(period)}
              </Text>
              {period !== 'monthly' && (
                <Ionicons name="lock-closed" size={14} color="#999" style={styles.lockIcon} />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // Render target type selection
  const renderTargetType = () => (
    <View style={commonStyles.inputGroup}>
      <Text style={[commonStyles.label, isRTL && commonStyles.arabicText]}>
        {translate('targetType')} *
      </Text>
      <View style={styles.typeContainer}>
        {['revenue', 'visits', 'orders'].map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.typeOption,
              targetType === type && styles.typeOptionActive,
              type !== 'revenue' && styles.lockedOption
            ]}
            onPress={() => handleTargetTypeSelect(type)}
          >
            <View style={styles.typeOptionContent}>
              <Ionicons 
                name={type === 'revenue' ? 'cash' : type === 'visits' ? 'location' : 'receipt'} 
                size={16} 
                color={targetType === type ? "#fff" : type === 'revenue' ? "#6B7D3D" : "#999"} 
              />
              <Text style={[
                styles.typeOptionText,
                targetType === type && styles.typeOptionTextActive,
                type !== 'revenue' && styles.lockedOptionText,
                isRTL && commonStyles.arabicText
              ]}>
                {translate(type)}
              </Text>
              {type !== 'revenue' && (
                <Ionicons name="lock-closed" size={12} color="#999" />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // Render staff selection (admin only)
  const renderStaffSelection = () => {
    if (!isAdmin) return null;

    return (
      <View style={commonStyles.inputGroup}>
        <Text style={[commonStyles.label, isRTL && commonStyles.arabicText]}>
          {translate('assignToStaff')}
        </Text>
        <TouchableOpacity
          style={[styles.selector, isRTL && styles.rtlSelector]}
          onPress={() => navigation.navigate('StaffSelectorScreen', {
            selectedStaffId: selectedStaff?.id,
            onStaffSelect: (staff) => {
              setSelectedStaff(staff);
            }
          })}
        >
          <View style={styles.selectorInfo}>
            <Ionicons name="people" size={20} color="#6B7D3D" />
            <Text style={[styles.selectorText, isRTL && commonStyles.arabicText]}>
              {selectedStaff 
                ? `${selectedStaff.first_name} ${selectedStaff.last_name}`
                : translate('selectStaff')
              }
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>
      </View>
    );
  };

  // Render customer selection
  const renderCustomerSelection = () => (
    <View style={commonStyles.inputGroup}>
      <Text style={[commonStyles.label, isRTL && commonStyles.arabicText]}>
        {translate('specificCustomer')} ({translate('optional')})
      </Text>
      <TouchableOpacity
        style={[styles.selector, isRTL && styles.rtlSelector]}
        onPress={() => navigation.navigate('CustomerSelectorScreen', {
          selectedCustomerId: selectedCustomer?.id,
          onCustomerSelect: (customer) => {
            setSelectedCustomer(customer);
          }
        })}
      >
        <View style={styles.selectorInfo}>
          <Ionicons name="person" size={20} color="#6B7D3D" />
          <Text style={[styles.selectorText, isRTL && commonStyles.arabicText]}>
            {selectedCustomer 
              ? (isRTL ? (selectedCustomer.name_ar || selectedCustomer.name) : selectedCustomer.name)
              : translate('selectCustomer')
            }
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#666" />
      </TouchableOpacity>
    </View>
  );

  // Render territory selection (admin only) - Now locked
  const renderTerritorySelection = () => {
    if (!isAdmin) return null;

    return (
      <View style={commonStyles.inputGroup}>
        <Text style={[commonStyles.label, isRTL && commonStyles.arabicText]}>
          {translate('territory')} ({translate('optional')})
        </Text>
        <TouchableOpacity
          style={[styles.selector, styles.lockedSelector, isRTL && styles.rtlSelector]}
          onPress={handleTerritorySelect}
        >
          <View style={styles.selectorInfo}>
            <Ionicons name="map" size={20} color="#999" />
            <Text style={[styles.selectorText, styles.lockedSelectorText, isRTL && commonStyles.arabicText]}>
              {translate('selectTerritory')}
            </Text>
            <Ionicons name="lock-closed" size={16} color="#999" />
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
      </View>
    );
  };

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
                {translate('setSalesTarget')}
              </Text>
              <Text style={[commonStyles.headerSubtitle, isRTL && commonStyles.arabicText]}>
                {translate('defineTargetsForPeriod')}
              </Text>
            </View>
            <View style={commonStyles.placeholder} />
          </View>
        </LinearGradient>
      </View>

      <ScrollView style={commonStyles.content} showsVerticalScrollIndicator={false}>
        {/* Target Period */}
        <View style={commonStyles.section}>
          <Text style={[commonStyles.sectionTitle, isRTL && commonStyles.arabicText]}>
            {translate('targetConfiguration')}
          </Text>
          {renderTargetPeriod()}
          {renderTargetType()}
        </View>

        {/* Target Date */}
        <View style={commonStyles.section}>
          <Text style={[commonStyles.sectionTitle, isRTL && commonStyles.arabicText]}>
            {translate('targetDate')}
          </Text>
          <View style={commonStyles.inputGroup}>
            <Text style={[commonStyles.label, isRTL && commonStyles.arabicText]}>
              {translate('targetDate')} *
            </Text>
            <TouchableOpacity
              style={[styles.dateInput, isRTL && styles.rtlInput]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={[styles.dateText, isRTL && commonStyles.arabicText]}>
                {formatDate(targetDate)}
              </Text>
              <Ionicons name="calendar" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={targetDate}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}
        </View>

        {/* Target Amount */}
        <View style={commonStyles.section}>
          <Text style={[commonStyles.sectionTitle, isRTL && commonStyles.arabicText]}>
            {translate('targetAmount')}
          </Text>
          <View style={commonStyles.inputGroup}>
            <Text style={[commonStyles.label, isRTL && commonStyles.arabicText]}>
              {translate('targetAmount')} *
            </Text>
            <TextInput
              style={[commonStyles.input, isRTL && commonStyles.arabicInput]}
              value={targetAmount}
              onChangeText={setTargetAmount}
              placeholder={translate('enterTargetAmount')}
              placeholderTextColor="#999"
              keyboardType="numeric"
              textAlign={isRTL ? 'right' : 'left'}
            />
          </View>
        </View>

        {/* Assignment */}
        <View style={commonStyles.section}>
          <Text style={[commonStyles.sectionTitle, isRTL && commonStyles.arabicText]}>
            {translate('targetAssignment')}
          </Text>
          {renderStaffSelection()}
          {renderCustomerSelection()}
          {renderTerritorySelection()}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            commonStyles.submitButton,
            loading && commonStyles.submitButtonDisabled
          ]}
          onPress={submitSalesTarget}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="checkmark" size={20} color="#fff" />
          )}
          <Text style={[commonStyles.submitButtonText, isRTL && commonStyles.arabicText]}>
            {translate('setSalesTarget')}
          </Text>
        </TouchableOpacity>

        <View style={commonStyles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // Period Selection
  periodContainer: {
    flexDirection: 'row',
    gap: 10,
  },

  periodOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#6B7D3D',
    backgroundColor: 'rgba(107, 125, 61, 0.1)',
    alignItems: 'center',
  },

  periodOptionActive: {
    backgroundColor: '#6B7D3D',
  },

  lockedOption: {
    borderColor: '#ddd',
    backgroundColor: '#f5f5f5',
  },

  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  periodOptionText: {
    fontSize: 14,
    color: '#6B7D3D',
    fontWeight: '500',
  },

  periodOptionTextActive: {
    color: '#fff',
    fontWeight: '600',
  },

  lockedOptionText: {
    color: '#999',
  },

  lockIcon: {
    marginLeft: 2,
  },

  // Type Selection
  typeContainer: {
    flexDirection: 'row',
    gap: 8,
  },

  typeOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#6B7D3D',
    backgroundColor: 'rgba(107, 125, 61, 0.1)',
    alignItems: 'center',
  },

  typeOptionActive: {
    backgroundColor: '#6B7D3D',
  },

  typeOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  typeOptionText: {
    fontSize: 14,
    color: '#6B7D3D',
    fontWeight: '500',
  },

  typeOptionTextActive: {
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

  // Selectors
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 15,
    backgroundColor: '#f9f9f9',
  },

  rtlSelector: {
    flexDirection: 'row-reverse',
  },

  lockedSelector: {
    borderColor: '#ddd',
    backgroundColor: '#f5f5f5',
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

  lockedSelectorText: {
    color: '#999',
  },
});

export default SetSalesTargetScreen;