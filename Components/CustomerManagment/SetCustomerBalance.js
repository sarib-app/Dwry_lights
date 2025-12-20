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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://planetdory.dwrylight.com/api';

const SetCustomerBalanceScreen = ({ navigation, route }) => {
  const { customer } = route.params;

  const [balance, setBalance] = useState('');
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async () => {
    const numericBalance = parseFloat(balance);

    if (Number.isNaN(numericBalance)) {
      Alert.alert('Validation Error', 'Please enter a valid numeric balance amount');
      return;
    }

    setLoading(true);

    try {
      const token = await getAuthToken();
      if (!token) {
        Alert.alert('Error', 'Authentication token not found');
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/set_customer_balance/${customer.id}`,
        {
          method: 'POST',
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ balance: numericBalance }),
        }
      );

      const result = await response.json().catch(() => null);
      console.log('Set customer balance response:', result);

      if (response.ok && (result?.status === 200 || result?.success)) {
        Alert.alert(
          'Success',
          'Customer balance updated successfully',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        const message =
          result?.message ||
          result?.error ||
          'Failed to update customer balance';
        Alert.alert('Error', message);
      }
    } catch (error) {
      console.error('Set customer balance error:', error);
      Alert.alert('Error', 'Network error while updating customer balance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={['#6B7D3D', '#4A5D23']}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Set Customer Balance</Text>
            <View style={styles.placeholder} />
          </View>
        </LinearGradient>
      </View>

      {/* Current Balance Display at Top */}
      <View style={styles.balanceHeader}>
        <View style={styles.balanceHeaderContent}>
          <Ionicons name="wallet" size={24} color="#3498DB" />
          <View style={styles.balanceHeaderText}>
            <Text style={styles.balanceHeaderLabel}>Current Balance</Text>
            <Text style={styles.balanceHeaderValue}>
              {customer.balance !== undefined && customer.balance !== null
                ? customer.balance
                : 'Not set'}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Information</Text>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="person" size={20} color="#6B7D3D" />
              <Text style={styles.infoLabel}>Name:</Text>
              <Text style={styles.infoValue}>{customer.name}</Text>
            </View>

            {customer.name_ar ? (
              <View style={styles.infoRow}>
                <Ionicons name="language" size={20} color="#E74C3C" />
                <Text style={styles.infoLabel}>Arabic Name:</Text>
                <Text style={styles.infoValue}>{customer.name_ar}</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Set Balance</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Balance Amount</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter balance amount"
              keyboardType="numeric"
              value={balance}
              onChangeText={setBalance}
            />
            <Text style={styles.helperText}>
              Enter the desired balance for this customer. The backend will
              create the necessary adjustment entry automatically.
            </Text>
          </View>
        </View>

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
              <Text style={styles.submitButtonText}>Update Balance</Text>
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
  balanceHeader: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  balanceHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafb',
    padding: 15,
    borderRadius: 12,
  },
  balanceHeaderText: {
    marginLeft: 15,
    flex: 1,
  },
  balanceHeaderLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  balanceHeaderValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
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
    marginBottom: 16,
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
    textAlign: 'right',
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
  helperText: {
    fontSize: 12,
    color: '#888',
    marginTop: 6,
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

export default SetCustomerBalanceScreen;


