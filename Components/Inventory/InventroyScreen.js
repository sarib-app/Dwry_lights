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
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import languageService from '../Globals/Store/Lang';

const API_BASE_URL = 'https://planetdory.dwrylight.com/api';

const EditInventoryScreen = ({ navigation, route }) => {
  const { inventory } = route.params;
  
  const [formData, setFormData] = useState({
    item_name: inventory.item_name || '',
    quantity: inventory.quantity?.toString() || '',
    cost: inventory.cost?.toString() || '',
    is_paid: inventory.is_paid || false,
  });
  const [loading, setLoading] = useState(false);

  const translate = (key) => languageService.translate(key);

  // Get auth token from AsyncStorage
  const getAuthToken = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
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
    if (!formData.item_name.trim()) {
      Alert.alert('Validation Error', 'Item name is required');
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
      
      if (formData.item_name.trim()) {
        payload.item_name = formData.item_name;
      }
      if (formData.quantity) {
        payload.quantity = parseInt(formData.quantity);
      }
      if (formData.cost) {
        payload.cost = parseFloat(formData.cost);
      }
      payload.is_paid = formData.is_paid;

      const response = await fetch(`${API_BASE_URL}/update_inventory/${inventory.id}`, {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log('Update inventory response:', result);

      if (result.status == 200) {
        Alert.alert(
          'Success',
          'Inventory updated successfully!',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert('Error', result.message || 'Failed to update inventory');
      }
    } catch (error) {
      console.error('Update inventory error:', error);
      Alert.alert('Error', 'Network error while updating inventory');
    } finally {
      setLoading(false);
    }
  };

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
            <Text style={styles.headerTitle}>Edit Inventory</Text>
            <View style={styles.placeholder} />
          </View>
        </LinearGradient>
      </View>

      {/* Form */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current Information Display */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Information</Text>
          
          <View style={styles.infoGrid}>
            <View style={styles.infoCard}>
              <Ionicons name="cube" size={20} color="#6B7D3D" />
              <Text style={styles.infoLabel}>Original Quantity</Text>
              <Text style={styles.infoValue}>{inventory.quantity || 0}</Text>
            </View>
            
            <View style={styles.infoCard}>
              <Ionicons name="cash" size={20} color="#E74C3C" />
              <Text style={styles.infoLabel}>Original Cost</Text>
              <Text style={styles.infoValue}>${inventory.cost || 0}</Text>
            </View>
            
            <View style={styles.infoCard}>
              <Ionicons name="receipt" size={20} color="#3498DB" />
              <Text style={styles.infoLabel}>Total Value</Text>
              <Text style={styles.infoValue}>${inventory.total || 0}</Text>
            </View>
          </View>

          {inventory.vendor && (
            <View style={styles.vendorInfo}>
              <Ionicons name="business" size={16} color="#666" />
              <Text style={styles.vendorText}>Vendor: {inventory.vendor}</Text>
            </View>
          )}
        </View>

        {/* Editable Fields */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Update Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Item Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter item name"
              value={formData.item_name}
              onChangeText={(value) => handleInputChange('item_name', value)}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Quantity</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                value={formData.quantity}
                onChangeText={(value) => handleInputChange('quantity', value)}
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Cost per Unit</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                value={formData.cost}
                onChangeText={(value) => handleInputChange('cost', value)}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          {/* Payment Status */}
          <View style={styles.switchContainer}>
            <View style={styles.switchInfo}>
              <Ionicons 
                name={formData.is_paid ? "checkmark-circle" : "time"} 
                size={20} 
                color={formData.is_paid ? "#27AE60" : "#F39C12"} 
              />
              <Text style={styles.switchLabel}>Payment Status</Text>
            </View>
            <View style={styles.switchControl}>
              <Text style={[styles.switchText, !formData.is_paid && styles.activeText]}>
                Pending
              </Text>
              <Switch
                value={formData.is_paid}
                onValueChange={(value) => handleInputChange('is_paid', value)}
                trackColor={{ false: '#F39C12', true: '#27AE60' }}
                thumbColor={formData.is_paid ? '#fff' : '#fff'}
              />
              <Text style={[styles.switchText, formData.is_paid && styles.activeText]}>
                Paid
              </Text>
            </View>
          </View>
        </View>

        {/* Calculation Preview */}
        {(formData.quantity && formData.cost) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Updated Calculation</Text>
            
            <View style={styles.calculationCard}>
              <View style={styles.calculationRow}>
                <Text style={styles.calculationLabel}>New Quantity:</Text>
                <Text style={styles.calculationValue}>{formData.quantity}</Text>
              </View>
              
              <View style={styles.calculationRow}>
                <Text style={styles.calculationLabel}>Cost per Unit:</Text>
                <Text style={styles.calculationValue}>${formData.cost}</Text>
              </View>
              
              <View style={[styles.calculationRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>New Total Value:</Text>
                <Text style={styles.totalValue}>
                  ${(parseFloat(formData.quantity || 0) * parseFloat(formData.cost || 0)).toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        )}

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
              <Text style={styles.submitButtonText}>Update Inventory</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.bottomSpace} />
      </ScrollView>
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
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  infoCard: {
    flex: 1,
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8fafb',
    borderRadius: 12,
    marginHorizontal: 5,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  vendorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  vendorText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  halfWidth: {
    flex: 1,
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
  calculationCard: {
    backgroundColor: '#f8fafb',
    borderRadius: 12,
    padding: 15,
  },
  calculationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  calculationLabel: {
    fontSize: 14,
    color: '#666',
  },
  calculationValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  totalRow: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6B7D3D',
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
});

export default EditInventoryScreen;