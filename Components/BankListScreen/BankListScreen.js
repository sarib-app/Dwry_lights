import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  TextInput,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import languageService from '../Globals/Store/Lang';
import getAuthToken from '../Globals/Store/LocalData';
// import { commonStyles, getStatusColor } from '../shared/CommonStyles';
import commonStyles from '../Globals/CommonStyles';

const API_BASE_URL = 'https://planetdory.dwrylight.com/api';

const BankListScreen = ({ navigation }) => {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isRTL, setIsRTL] = useState(false);
  
  const translate = (key) => languageService.translate(key);

  useEffect(() => {
    initializeScreen();
    fetchBanks();
  }, []);

  const initializeScreen = async () => {
    const language = await languageService.loadSavedLanguage();
    setCurrentLanguage(language);
    setIsRTL(language === 'ar');
  };

  // Fetch all banks
  const fetchBanks = async () => {
    const token = await getAuthToken();
    if (!token) {
      Alert.alert(translate('error'), translate('authTokenNotFound'));
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/fetch_all_banks`, {
        method: 'GET',
        headers: {
          'Authorization': token,
        },
      });
      
      const result = await response.json();
      console.log('Banks API Response:', result);
      
      if (result.status == 200) {
        setBanks(result.data || []);
      } else {
        Alert.alert(translate('error'), result.message || translate('failedToFetchBanks'));
      }
    } catch (error) {
      console.error('Fetch banks error:', error);
      Alert.alert(translate('error'), translate('networkErrorFetchingBanks'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Delete bank
  const deleteBank = async (bankId) => {
    Alert.alert(
      translate('deleteBank'),
      translate('deleteBankConfirmation'),
      [
        { text: translate('cancel'), style: 'cancel' },
        {
          text: translate('delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await getAuthToken();
              if (!token) return;

              const response = await fetch(`${API_BASE_URL}/delete_bank/${bankId}`, {
                method: 'POST',
                headers: {
                  'Authorization': token,
                },
              });
              
              const result = await response.json();
              
              if (result.status == 200) {
                Alert.alert(translate('success'), translate('bankDeletedSuccessfully'));
                fetchBanks();
              } else {
                Alert.alert(translate('error'), result.message || translate('failedToDeleteBank'));
              }
            } catch (error) {
              console.error('Delete bank error:', error);
              Alert.alert(translate('error'), translate('networkErrorDeletingBank'));
            }
          },
        },
      ]
    );
  };

  // Filter banks based on search and status
  const filteredBanks = banks.filter(bank => {
    const matchesSearch = 
      bank.bank_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bank.account_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bank.account_number?.includes(searchQuery) ||
      bank.branch?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === 'all' || bank.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBanks();
  }, []);

  // Calculate statistics
  const calculateStats = () => {
    return banks.reduce((stats, bank) => {
      stats.totalBalance += parseFloat(bank.balance) || 0;
      stats.totalBanks += 1;
      if (bank.status === 'active') stats.activeBanks += 1;
      if (bank.status === 'inactive') stats.inactiveBanks += 1;
      return stats;
    }, { totalBalance: 0, totalBanks: 0, activeBanks: 0, inactiveBanks: 0 });
  };

  const stats = calculateStats();

  // Format currency
  const formatCurrency = (amount) => {
    const number = parseFloat(amount) || 0;
    return isRTL ? `${number.toFixed(2)} ر.س` : `$${number.toFixed(2)}`;
  };

  // Get bank status color
  const getBankStatusColor = (status) => {
    switch (status) {
      case 'active': return '#27AE60';
      case 'inactive': return '#E74C3C';
      default: return '#95A5A6';
    }
  };

  // Render filter options
  const filterOptions = [
    { key: 'all', label: translate('allBanks') },
    { key: 'active', label: translate('activeBanks') },
    { key: 'inactive', label: translate('inactiveBanks') },
  ];

  // Render bank card
  const renderBankCard = (bank) => (
    <View key={bank.id} style={commonStyles.card}>
      <View style={[styles.bankHeader, isRTL && commonStyles.rtlRow]}>
        <View style={styles.bankInfo}>
          <Text style={[styles.bankName, isRTL && commonStyles.arabicText]}>
            {bank.bank_name}
          </Text>
          <Text style={[styles.accountName, isRTL && commonStyles.arabicText]}>
            {bank.account_name}
          </Text>
        </View>
        
        <View style={[styles.bankStatusContainer, isRTL && commonStyles.rtlRow]}>
          <View style={[styles.statusBadge, { backgroundColor: getBankStatusColor(bank.status) }]}>
            <Text style={[styles.statusText, isRTL && commonStyles.arabicText]}>
              {translate(bank.status)}
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.bankDetails, isRTL && styles.rtlBankDetails]}>
        <View style={styles.detailRow}>
          <Ionicons name="card" size={16} color="#666" />
          <Text style={[styles.detailText, isRTL && commonStyles.arabicText]}>
            {translate('accountNumber')}: {bank.account_number}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="business" size={16} color="#666" />
          <Text style={[styles.detailText, isRTL && commonStyles.arabicText]}>
            {translate('branch')}: {bank.branch}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="cash" size={16} color="#666" />
          <Text style={[styles.detailText, isRTL && commonStyles.arabicText]}>
            {translate('balance')}: {formatCurrency(bank.balance)}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="globe" size={16} color="#666" />
          <Text style={[styles.detailText, isRTL && commonStyles.arabicText]}>
            {translate('currency')}: {bank.currency}
          </Text>
        </View>
      </View>

      <View style={[styles.bankMeta, isRTL && styles.rtlBankMeta]}>
        {bank.iban && (
          <View style={styles.metaRow}>
            <Text style={[styles.metaLabel, isRTL && commonStyles.arabicText]}>
              {translate('iban')}:
            </Text>
            <Text style={[styles.metaValue, isRTL && commonStyles.arabicText]}>
              {bank.iban}
            </Text>
          </View>
        )}
        
        {bank.swift_code && (
          <View style={styles.metaRow}>
            <Text style={[styles.metaLabel, isRTL && commonStyles.arabicText]}>
              {translate('swiftCode')}:
            </Text>
            <Text style={[styles.metaValue, isRTL && commonStyles.arabicText]}>
              {bank.swift_code}
            </Text>
          </View>
        )}
      </View>

      <View style={[styles.bankActions, isRTL && commonStyles.rtlRow]}>
        <TouchableOpacity
          style={[commonStyles.actionButton, commonStyles.viewButton]}
          onPress={() => navigation.navigate('BankDetails', { bank })}
        >
          <Ionicons name="eye" size={16} color="#3498DB" />
          <Text style={[commonStyles.actionButtonText, { color: '#3498DB' }, isRTL && commonStyles.arabicText]}>
            {translate('view')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[commonStyles.actionButton, commonStyles.editButton]}
          onPress={() => navigation.navigate('EditBank', { bank })}
        >
          <Ionicons name="pencil" size={16} color="#6B7D3D" />
          <Text style={[commonStyles.actionButtonText, { color: '#6B7D3D' }, isRTL && commonStyles.arabicText]}>
            {translate('edit')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[commonStyles.actionButton, commonStyles.deleteButton]}
          onPress={() => deleteBank(bank.id)}
        >
          <Ionicons name="trash" size={16} color="#E74C3C" />
          <Text style={[commonStyles.actionButtonText, { color: '#E74C3C' }, isRTL && commonStyles.arabicText]}>
            {translate('delete')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={commonStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B7D3D" />
        <Text style={[commonStyles.loadingText, isRTL && commonStyles.arabicText]}>
          {translate('loadingBanks')}
        </Text>
      </View>
    );
  }

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
                {translate('banks')}
              </Text>
              <Text style={[commonStyles.headerSubtitle, isRTL && commonStyles.arabicText]}>
                {banks.length} {translate('banksTotal')} • {formatCurrency(stats.totalBalance)}
              </Text>
            </View>
            <TouchableOpacity
              style={commonStyles.addButton}
              onPress={() => navigation.navigate('AddBank')}
            >
              <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      {/* Stats Cards */}
      <View style={commonStyles.statsContainer}>
        <View style={commonStyles.statCard}>
          <Ionicons name="business" size={24} color="#6B7D3D" />
          <Text style={[commonStyles.statNumber, isRTL && commonStyles.arabicText]}>
            {stats.totalBanks}
          </Text>
          <Text style={[commonStyles.statLabel, isRTL && commonStyles.arabicText]}>
            {translate('totalBanks')}
          </Text>
        </View>
        <View style={commonStyles.statCard}>
          <Ionicons name="checkmark-circle" size={24} color="#27AE60" />
          <Text style={[commonStyles.statNumber, isRTL && commonStyles.arabicText]}>
            {stats.activeBanks}
          </Text>
          <Text style={[commonStyles.statLabel, isRTL && commonStyles.arabicText]}>
            {translate('activeBanks')}
          </Text>
        </View>
        <View style={commonStyles.statCard}>
          <Ionicons name="close-circle" size={24} color="#E74C3C" />
          <Text style={[commonStyles.statNumber, isRTL && commonStyles.arabicText]}>
            {stats.inactiveBanks}
          </Text>
          <Text style={[commonStyles.statLabel, isRTL && commonStyles.arabicText]}>
            {translate('inactiveBanks')}
          </Text>
        </View>
      </View>

      {/* Search and Filter Bar */}
      <View style={commonStyles.searchContainer}>
        <View style={[commonStyles.searchBar, isRTL && commonStyles.rtlSearchBar]}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={[commonStyles.searchInput, isRTL && commonStyles.arabicInput]}
            placeholder={translate('searchBanks')}
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            textAlign={isRTL ? 'right' : 'left'}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity
          style={commonStyles.filterButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Ionicons name="filter" size={20} color="#6B7D3D" />
          <Text style={[commonStyles.filterButtonText, isRTL && commonStyles.arabicText]}>
            {translate('filter')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Banks List */}
      <ScrollView
        style={commonStyles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6B7D3D']} />
        }
      >
        {filteredBanks.length > 0 ? (
          filteredBanks.map(renderBankCard)
        ) : (
          <View style={commonStyles.emptyContainer}>
            <Ionicons name="business-outline" size={64} color="#ccc" />
            <Text style={[commonStyles.emptyText, isRTL && commonStyles.arabicText]}>
              {searchQuery || filterStatus !== 'all' 
                ? translate('noBanksFound') 
                : translate('noBanksAvailable')
              }
            </Text>
            <Text style={[commonStyles.emptySubtext, isRTL && commonStyles.arabicText]}>
              {searchQuery || filterStatus !== 'all'
                ? translate('tryAdjustingSearch')
                : translate('addFirstBank')
              }
            </Text>
            {!searchQuery && filterStatus === 'all' && (
              <TouchableOpacity
                style={commonStyles.emptyButton}
                onPress={() => navigation.navigate('AddBank')}
              >
                <Text style={[commonStyles.emptyButtonText, isRTL && commonStyles.arabicText]}>
                  {translate('addBank')}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <SafeAreaView style={commonStyles.modalContainer}>
          <View style={[commonStyles.modalHeader, isRTL && commonStyles.rtlModalHeader]}>
            <Text style={[commonStyles.modalTitle, isRTL && commonStyles.arabicText]}>
              {translate('filterBanks')}
            </Text>
            <TouchableOpacity
              style={commonStyles.modalCloseButton}
              onPress={() => setShowFilterModal(false)}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <View style={commonStyles.filterOptions}>
            {filterOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  commonStyles.filterOption,
                  filterStatus === option.key && commonStyles.filterOptionActive
                ]}
                onPress={() => {
                  setFilterStatus(option.key);
                  setShowFilterModal(false);
                }}
              >
                <Text style={[
                  commonStyles.filterOptionText,
                  filterStatus === option.key && commonStyles.filterOptionTextActive,
                  isRTL && commonStyles.arabicText
                ]}>
                  {option.label}
                </Text>
                {filterStatus === option.key && (
                  <Ionicons name="checkmark" size={20} color="#6B7D3D" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

// Screen-specific styles
const styles = StyleSheet.create({
  bankHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  
  bankInfo: {
    flex: 1,
  },
  
  bankName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  
  accountName: {
    fontSize: 16,
    color: '#666',
  },
  
  bankStatusContainer: {
    alignItems: 'flex-end',
  },
  
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignItems: 'center',
  },
  
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  
  bankDetails: {
    marginBottom: 15,
  },
  
  rtlBankDetails: {
    alignItems: 'flex-end',
  },
  
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  
  bankMeta: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 15,
    marginBottom: 15,
  },
  
  rtlBankMeta: {
    alignItems: 'flex-end',
  },
  
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  
  metaLabel: {
    fontSize: 14,
    color: '#666',
  },
  
  metaValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  
  bankActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 15,
  },
});

export default BankListScreen;