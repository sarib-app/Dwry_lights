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
import * as Location from 'expo-location';
import languageService from '../Globals/Store/Lang';
import getAuthToken from '../Globals/Store/LocalData';
import AsyncStorage from '@react-native-async-storage/async-storage';
import commonStyles from '../Globals/CommonStyles';

const API_BASE_URL = 'https://planetdory.dwrylight.com/api';

const StaffCheckinScreen = ({ navigation }) => {
  // State management
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isRTL, setIsRTL] = useState(false);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Location and customer states
  const [currentLocation, setCurrentLocation] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [locationVerified, setLocationVerified] = useState(false);
  const [verificationData, setVerificationData] = useState(null);
  
  // Check-in form states
  const [checkinType, setCheckinType] = useState('arrival'); // 'arrival' or 'departure'
  const [purpose, setPurpose] = useState('');
  const [notes, setNotes] = useState('');
  
  const translate = (key) => languageService.translate(key);

  useEffect(() => {
    initializeScreen();
  }, []);

  const initializeScreen = async () => {
    const language = await languageService.loadSavedLanguage();
    setCurrentLanguage(language);
    setIsRTL(language === 'ar');
    
    await loadUserData();
    await getCurrentLocation();
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

  // Get current location
  const getCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(translate('error'), translate('locationPermissionDenied'));
        setLocationLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert(translate('error'), translate('failedToGetLocation'));
    } finally {
      setLocationLoading(false);
    }
  };

  // Verify customer location
  const verifyCustomerLocation = async () => {
    if (!selectedCustomer || !currentLocation) {
      Alert.alert(translate('error'), translate('selectCustomerAndLocation'));
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
        customer_id: selectedCustomer.id,
        staff_lat: currentLocation.latitude,
        staff_long: currentLocation.longitude,
      };

      const response = await fetch(`${API_BASE_URL}/verifyCustomerLocation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        body: JSON.stringify(payload),
      });
      
      const result = await response.json();
      console.log('Location Verification Response:', result);
      
      if (result.status === 200) {
        setVerificationData(result);
        setLocationVerified(result.is_valid_checkin);
        
        if (result.is_valid_checkin) {
          Alert.alert(
            translate('success'), 
            translate('locationVerifiedSuccess'),
            [{ text: translate('ok') }]
          );
        } else {
          Alert.alert(
            translate('locationError'), 
            `${translate('youAreNotInCustomerRadius')}\n\n${translate('distance')}: ${result.distance_from_customer}`,
            [
              { text: translate('tryAgain'), onPress: getCurrentLocation },
              { text: translate('cancel'), style: 'cancel' }
            ]
          );
        }
      } else {
        Alert.alert(translate('error'), result.message || translate('failedToVerifyLocation'));
      }
    } catch (error) {
      console.error('Location verification error:', error);
      Alert.alert(translate('error'), translate('networkErrorVerifyingLocation'));
    } finally {
      setLoading(false);
    }
  };

  // Submit check-in
  const submitCheckin = async () => {
    if (!selectedCustomer || !currentLocation || !locationVerified) {
      Alert.alert(translate('error'), translate('verifyLocationFirst'));
      return;
    }

    if (!purpose.trim()) {
      Alert.alert(translate('error'), translate('purposeRequired'));
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
        customer_id: selectedCustomer.id,
        checkin_type: checkinType,
        lat: currentLocation.latitude,
        long: currentLocation.longitude,
        purpose: purpose.trim(),
        notes: notes.trim(),
      };

      const response = await fetch(`${API_BASE_URL}/staff_checkin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        body: JSON.stringify(payload),
      });
      
      const result = await response.json();
      console.log('Check-in Response:', result);
      
      if (result.status === 200) {
        Alert.alert(
          translate('success'), 
          translate('checkinSuccessful'),
          [
            { 
              text: translate('ok'), 
              onPress: () => {
                // Reset form
                setSelectedCustomer(null);
                setLocationVerified(false);
                setVerificationData(null);
                setPurpose('');
                setNotes('');
                setCheckinType('arrival');
              }
            }
          ]
        );
      } else {
        Alert.alert(translate('error'), result.message || translate('failedToCheckin'));
      }
    } catch (error) {
      console.error('Check-in error:', error);
      Alert.alert(translate('error'), translate('networkErrorCheckin'));
    } finally {
      setLoading(false);
    }
  };

  // Render customer selection
  const renderCustomerSelection = () => (
    <View style={commonStyles.section}>
      <Text style={[commonStyles.sectionTitle, isRTL && commonStyles.arabicText]}>
        {translate('selectCustomer')}
      </Text>
      
      <TouchableOpacity
        style={[styles.customerSelector, isRTL && styles.rtlSelector]}
        onPress={() => navigation.navigate('CustomerSelectorScreen', {
          selectedCustomerId: selectedCustomer?.id,
          onCustomerSelect: (customer) => {
            setSelectedCustomer(customer);
            setLocationVerified(false);
            setVerificationData(null);
          }
        })}
      >
        <View style={styles.customerInfo}>
          <Ionicons name="person" size={20} color="#6B7D3D" />
          <Text style={[styles.customerText, isRTL && commonStyles.arabicText]}>
            {selectedCustomer 
              ? (isRTL ? (selectedCustomer.name_ar || selectedCustomer.name) : selectedCustomer.name)
              : translate('tapToSelectCustomer')
            }
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#666" />
      </TouchableOpacity>
      
      {selectedCustomer && (
        <View style={styles.customerDetails}>
          <Text style={[styles.customerDetailText, isRTL && commonStyles.arabicText]}>
            {selectedCustomer.territory} • {selectedCustomer.customer_type}
          </Text>
        </View>
      )}
    </View>
  );

  // Render location verification
  const renderLocationVerification = () => (
    <View style={commonStyles.section}>
      <Text style={[commonStyles.sectionTitle, isRTL && commonStyles.arabicText]}>
        {translate('locationVerification')}
      </Text>
      
      <View style={styles.locationContainer}>
        <View style={[styles.locationInfo, isRTL && styles.rtlLocationInfo]}>
          <Ionicons 
            name={currentLocation ? "location" : "location-outline"} 
            size={20} 
            color={currentLocation ? "#27AE60" : "#666"} 
          />
          <Text style={[styles.locationText, isRTL && commonStyles.arabicText]}>
            {currentLocation 
              ? translate('locationObtained')
              : translate('locationNotAvailable')
            }
          </Text>
        </View>
        
        <TouchableOpacity
          style={[styles.refreshLocationButton, locationLoading && styles.disabledButton]}
          onPress={getCurrentLocation}
          disabled={locationLoading}
        >
          {locationLoading ? (
            <ActivityIndicator size="small" color="#6B7D3D" />
          ) : (
            <Ionicons name="refresh" size={16} color="#6B7D3D" />
          )}
          <Text style={[styles.refreshLocationText, isRTL && commonStyles.arabicText]}>
            {translate('refreshLocation')}
          </Text>
        </TouchableOpacity>
      </View>

      {verificationData && (
        <View style={[
          styles.verificationResult,
          { backgroundColor: locationVerified ? 'rgba(39, 174, 96, 0.1)' : 'rgba(231, 76, 60, 0.1)' }
        ]}>
          <Ionicons 
            name={locationVerified ? "checkmark-circle" : "close-circle"} 
            size={20} 
            color={locationVerified ? "#27AE60" : "#E74C3C"} 
          />
          <View style={styles.verificationInfo}>
            <Text style={[
              styles.verificationText,
              { color: locationVerified ? "#27AE60" : "#E74C3C" },
              isRTL && commonStyles.arabicText
            ]}>
              {locationVerified ? translate('locationVerified') : translate('locationNotVerified')}
            </Text>
            <Text style={[styles.distanceText, isRTL && commonStyles.arabicText]}>
              {translate('distance')}: {verificationData.distance_from_customer}
            </Text>
          </View>
        </View>
      )}

      <TouchableOpacity
        style={[styles.verifyButton, (!selectedCustomer || !currentLocation) && styles.disabledButton]}
        onPress={verifyCustomerLocation}
        disabled={!selectedCustomer || !currentLocation || loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Ionicons name="shield-checkmark" size={16} color="#fff" />
        )}
        <Text style={[styles.verifyButtonText, isRTL && commonStyles.arabicText]}>
          {translate('verifyLocation')}
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Render check-in form
  const renderCheckinForm = () => (
    <View style={commonStyles.section}>
      <Text style={[commonStyles.sectionTitle, isRTL && commonStyles.arabicText]}>
        {translate('checkinDetails')}
      </Text>
      
      {/* Check-in Type */}
      <View style={commonStyles.inputGroup}>
        <Text style={[commonStyles.label, isRTL && commonStyles.arabicText]}>
          {translate('checkinType')}
        </Text>
        <View style={styles.typeContainer}>
          <TouchableOpacity
            style={[
              styles.typeOption,
              checkinType === 'arrival' && styles.typeOptionActive
            ]}
            onPress={() => setCheckinType('arrival')}
          >
            <Ionicons 
              name="enter" 
              size={16} 
              color={checkinType === 'arrival' ? "#fff" : "#6B7D3D"} 
            />
            <Text style={[
              styles.typeOptionText,
              checkinType === 'arrival' && styles.typeOptionTextActive,
              isRTL && commonStyles.arabicText
            ]}>
              {translate('arrival')}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.typeOption,
              checkinType === 'departure' && styles.typeOptionActive
            ]}
            onPress={() => setCheckinType('departure')}
          >
            <Ionicons 
              name="exit" 
              size={16} 
              color={checkinType === 'departure' ? "#fff" : "#6B7D3D"} 
            />
            <Text style={[
              styles.typeOptionText,
              checkinType === 'departure' && styles.typeOptionTextActive,
              isRTL && commonStyles.arabicText
            ]}>
              {translate('departure')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Purpose */}
      <View style={commonStyles.inputGroup}>
        <Text style={[commonStyles.label, isRTL && commonStyles.arabicText]}>
          {translate('purpose')} *
        </Text>
        <TextInput
          style={[commonStyles.input, isRTL && commonStyles.arabicInput]}
          value={purpose}
          onChangeText={setPurpose}
          placeholder={translate('enterPurpose')}
          placeholderTextColor="#999"
          textAlign={isRTL ? 'right' : 'left'}
        />
      </View>

      {/* Notes */}
      <View style={commonStyles.inputGroup}>
        <Text style={[commonStyles.label, isRTL && commonStyles.arabicText]}>
          {translate('notes')}
        </Text>
        <TextInput
          style={[commonStyles.input, commonStyles.textArea, isRTL && commonStyles.arabicInput]}
          value={notes}
          onChangeText={setNotes}
          placeholder={translate('enterNotes')}
          placeholderTextColor="#999"
          multiline
          numberOfLines={4}
          textAlign={isRTL ? 'right' : 'left'}
        />
      </View>
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
                {translate('staffCheckin')}
              </Text>
              <Text style={[commonStyles.headerSubtitle, isRTL && commonStyles.arabicText]}>
                {translate('recordYourVisit')}
              </Text>
            </View>
            <View style={commonStyles.placeholder} />
          </View>
        </LinearGradient>
      </View>

      <ScrollView style={commonStyles.content} showsVerticalScrollIndicator={false}>
        {/* Customer Selection */}
        {renderCustomerSelection()}

        {/* Location Verification */}
        {renderLocationVerification()}

        {/* Check-in Form */}
        {locationVerified && renderCheckinForm()}

        {/* Submit Button */}
        {locationVerified && (
          <TouchableOpacity
            style={[
              commonStyles.submitButton,
              (!purpose.trim() || loading) && commonStyles.submitButtonDisabled
            ]}
            onPress={submitCheckin}
            disabled={!purpose.trim() || loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="checkmark" size={20} color="#fff" />
            )}
            <Text style={[commonStyles.submitButtonText, isRTL && commonStyles.arabicText]}>
              {translate('submitCheckin')}
            </Text>
          </TouchableOpacity>
        )}

        <View style={commonStyles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // Customer Selection
  customerSelector: {
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

  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },

  customerText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },

  customerDetails: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },

  customerDetailText: {
    fontSize: 14,
    color: '#666',
  },

  // Location Verification
  locationContainer: {
    marginBottom: 15,
  },

  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },

  rtlLocationInfo: {
    flexDirection: 'row-reverse',
  },

  locationText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },

  refreshLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(107, 125, 61, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    gap: 6,
  },

  refreshLocationText: {
    fontSize: 14,
    color: '#6B7D3D',
    fontWeight: '500',
  },

  verificationResult: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    gap: 10,
  },

  verificationInfo: {
    flex: 1,
  },

  verificationText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },

  distanceText: {
    fontSize: 12,
    color: '#666',
  },

  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6B7D3D',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },

  verifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  disabledButton: {
    backgroundColor: '#ccc',
  },

  // Check-in Type
  typeContainer: {
    flexDirection: 'row',
    gap: 10,
  },

  typeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#6B7D3D',
    backgroundColor: 'rgba(107, 125, 61, 0.1)',
    gap: 6,
  },

  typeOptionActive: {
    backgroundColor: '#6B7D3D',
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
});

export default StaffCheckinScreen;