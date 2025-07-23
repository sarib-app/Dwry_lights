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
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import languageService from '../Globals/Store/Lang';
import getAuthToken from '../Globals/Store/LocalData';
import AsyncStorage from '@react-native-async-storage/async-storage';
import commonStyles from '../Globals/CommonStyles';

const API_BASE_URL = 'https://planetdory.dwrylight.com/api';

const StaffVisitHistoryScreen = ({ navigation }) => {
  // State management
  const [visitHistory, setVisitHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isRTL, setIsRTL] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    staff_id: null,
    customer_id: null,
    date_from: '',
    date_to: '',
  });

  const [selectedStaff, setSelectedStaff] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const translate = (key) => languageService.translate(key);

  useEffect(() => {
    initializeScreen();
  }, []);

  const initializeScreen = async () => {
    const language = await languageService.loadSavedLanguage();
    setCurrentLanguage(language);
    setIsRTL(language === 'ar');
    
    await loadUserData();
    setDefaultDateRange();
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
          setFilters(prev => ({
            ...prev,
            staff_id: user.id
          }));
        }
        
        // Auto-fetch after user data is loaded
        setTimeout(() => {
          fetchVisitHistory();
        }, 100);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  // Set default date range (current month)
  const setDefaultDateRange = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const formatDate = (date) => {
      return date.toISOString().split('T')[0];
    };

    setFilters(prev => ({
      ...prev,
      date_from: formatDate(firstDay),
      date_to: formatDate(lastDay)
    }));
  };

  // Fetch visit history
  const fetchVisitHistory = async () => {
    const token = await getAuthToken();
    if (!token) {
      Alert.alert(translate('error'), translate('authTokenNotFound'));
      return;
    }

    // For staff users, staff_id is required
    if (!isAdmin && !filters.staff_id) {
      return;
    }

    setLoading(true);
    try {
      const payload = {
        date_from: filters.date_from,
        date_to: filters.date_to,
      };

      // Add staff_id (required for staff, optional for admin)
      if (filters.staff_id) {
        payload.staff_id = filters.staff_id;
      }

      // Add customer_id if selected
      if (filters.customer_id) {
        payload.customer_id = filters.customer_id;
      }

      const response = await fetch(`${API_BASE_URL}/staff_visit_history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        body: JSON.stringify(payload),
      });
      
      const result = await response.json();
      console.log('Visit History API Response:', result);
      
      if (result.status === 200) {
        setVisitHistory(result.data || []);
      } else {
        Alert.alert(translate('error'), result.message || translate('failedToFetchVisitHistory'));
      }
    } catch (error) {
      console.error('Fetch visit history error:', error);
      Alert.alert(translate('error'), translate('networkErrorFetchingVisitHistory'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchVisitHistory();
  }, [filters]);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US');
  };

  // Format time
  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString(isRTL ? 'ar-SA' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Render filter header
  const renderFilterHeader = () => (
    <View style={styles.filterHeader}>
      {/* Staff Filter - Only for admins */}
      {isAdmin && (
        <TouchableOpacity
          style={[styles.filterButton, styles.staffFilterButton]}
          onPress={() => navigation.navigate('StaffSelectorScreen', {
            selectedStaffId: filters.staff_id,
            onStaffSelect: (staff) => {
              setSelectedStaff(staff);
              setFilters(prev => ({
                ...prev,
                staff_id: staff ? staff.id : null
              }));
            }
          })}
        >
          <Ionicons name="people" size={16} color="#3498DB" />
          <Text style={[styles.filterButtonText, isRTL && commonStyles.arabicText]} numberOfLines={1}>
            {selectedStaff 
              ? `${selectedStaff.first_name} ${selectedStaff.last_name}`
              : translate('allStaff')
            }
          </Text>
        </TouchableOpacity>
      )}

      {/* Customer Filter */}
      <TouchableOpacity
        style={[styles.filterButton, styles.customerFilterButton]}
        onPress={() => navigation.navigate('CustomerSelectorScreen', {
          selectedCustomerId: filters.customer_id,
          onCustomerSelect: (customer) => {
            setSelectedCustomer(customer);
            setFilters(prev => ({
              ...prev,
              customer_id: customer ? customer.id : null
            }));
          }
        })}
      >
        <Ionicons name="person" size={16} color="#6B7D3D" />
        <Text style={[styles.filterButtonText, isRTL && commonStyles.arabicText]} numberOfLines={1}>
          {selectedCustomer 
            ? (isRTL ? (selectedCustomer.name_ar || selectedCustomer.name) : selectedCustomer.name)
            : translate('allCustomers')
          }
        </Text>
      </TouchableOpacity>

      {/* Date Filter */}
      <TouchableOpacity
        style={[styles.filterButton, styles.dateFilterButton]}
        onPress={() => navigation.navigate('VisitHistoryFilters', {
          filters,
          onFiltersChange: (newFilters) => {
            setFilters(newFilters);
            setTimeout(() => {
              fetchVisitHistory();
            }, 100);
          }
        })}
      >
        <Ionicons name="calendar" size={16} color="#F39C12" />
        <Text style={[styles.filterButtonText, isRTL && commonStyles.arabicText]}>
          {translate('dateRange')}
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Render visit item
  const renderVisitItem = ({ item }) => (
    <View style={[styles.visitCard, isRTL && styles.rtlVisitCard]}>
      {/* Visit Header */}
      <View style={[styles.visitHeader, isRTL && styles.rtlVisitHeader]}>
        <View style={styles.visitInfo}>
          <Text style={[styles.customerName, isRTL && commonStyles.arabicText]}>
            {item.customer_name}
          </Text>
          <Text style={[styles.visitDate, isRTL && commonStyles.arabicText]}>
            {formatDate(item.visit_date)}
          </Text>
        </View>
        
        <View style={styles.durationBadge}>
          <Ionicons name="time" size={16} color="#6B7D3D" />
          <Text style={[styles.durationText, isRTL && commonStyles.arabicText]}>
            {item.total_duration}
          </Text>
        </View>
      </View>

      {/* Visit Details */}
      <View style={styles.visitDetails}>
        <View style={[styles.timeRow, isRTL && styles.rtlTimeRow]}>
          <View style={styles.timeItem}>
            <View style={[styles.timeIcon, { backgroundColor: 'rgba(39, 174, 96, 0.1)' }]}>
              <Ionicons name="enter" size={16} color="#27AE60" />
            </View>
            <View style={styles.timeInfo}>
              <Text style={[styles.timeLabel, isRTL && commonStyles.arabicText]}>
                {translate('checkinTime')}
              </Text>
              <Text style={[styles.timeValue, isRTL && commonStyles.arabicText]}>
                {formatTime(item.checkin_time)}
              </Text>
            </View>
          </View>

          {item.checkout_time && (
            <View style={styles.timeItem}>
              <View style={[styles.timeIcon, { backgroundColor: 'rgba(231, 76, 60, 0.1)' }]}>
                <Ionicons name="exit" size={16} color="#E74C3C" />
              </View>
              <View style={styles.timeInfo}>
                <Text style={[styles.timeLabel, isRTL && commonStyles.arabicText]}>
                  {translate('checkoutTime')}
                </Text>
                <Text style={[styles.timeValue, isRTL && commonStyles.arabicText]}>
                  {formatTime(item.checkout_time)}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Purpose */}
        <View style={styles.purposeContainer}>
          <Ionicons name="flag" size={16} color="#3498DB" />
          <Text style={[styles.purposeLabel, isRTL && commonStyles.arabicText]}>
            {translate('purpose')}:
          </Text>
          <Text style={[styles.purposeText, isRTL && commonStyles.arabicText]}>
            {item.purpose}
          </Text>
        </View>

        {/* Notes */}
        {item.notes && (
          <View style={styles.notesContainer}>
            <Ionicons name="document-text" size={16} color="#666" />
            <Text style={[styles.notesLabel, isRTL && commonStyles.arabicText]}>
              {translate('notes')}:
            </Text>
            <Text style={[styles.notesText, isRTL && commonStyles.arabicText]}>
              {item.notes}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  // Render stats summary
  const renderStatsSummary = () => {
    if (!visitHistory.length) return null;

    const totalVisits = visitHistory.length;
    const completedVisits = visitHistory.filter(visit => visit.checkout_time).length;
    const averageDuration = visitHistory.reduce((acc, visit) => {
      const duration = parseFloat(visit.total_duration) || 0;
      return acc + duration;
    }, 0) / totalVisits;

    return (
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: 'rgba(107, 125, 61, 0.1)' }]}>
          <Ionicons name="location" size={20} color="#6B7D3D" />
          <Text style={[styles.statValue, isRTL && commonStyles.arabicText]}>
            {totalVisits}
          </Text>
          <Text style={[styles.statLabel, isRTL && commonStyles.arabicText]}>
            {translate('totalVisits')}
          </Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: 'rgba(39, 174, 96, 0.1)' }]}>
          <Ionicons name="checkmark-circle" size={20} color="#27AE60" />
          <Text style={[styles.statValue, isRTL && commonStyles.arabicText]}>
            {completedVisits}
          </Text>
          <Text style={[styles.statLabel, isRTL && commonStyles.arabicText]}>
            {translate('completedVisits')}
          </Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: 'rgba(52, 152, 219, 0.1)' }]}>
          <Ionicons name="time" size={20} color="#3498DB" />
          <Text style={[styles.statValue, isRTL && commonStyles.arabicText]}>
            {averageDuration.toFixed(1)}
          </Text>
          <Text style={[styles.statLabel, isRTL && commonStyles.arabicText]}>
            {translate('avgDuration')} ({translate('minutes')})
          </Text>
        </View>
      </View>
    );
  };

  // Render empty state
  const renderEmptyState = () => (
    <View style={commonStyles.emptyContainer}>
      <Ionicons name="location-outline" size={64} color="#ccc" />
      <Text style={[commonStyles.emptyText, isRTL && commonStyles.arabicText]}>
        {translate('noVisitHistory')}
      </Text>
      <Text style={[commonStyles.emptySubtext, isRTL && commonStyles.arabicText]}>
        {translate('adjustFiltersOrStartVisiting')}
      </Text>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={commonStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B7D3D" />
        <Text style={[commonStyles.loadingText, isRTL && commonStyles.arabicText]}>
          {translate('loadingVisitHistory')}
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
                {translate('visitHistory')}
              </Text>
              <Text style={[commonStyles.headerSubtitle, isRTL && commonStyles.arabicText]}>
                {isAdmin ? translate('allStaffVisits') : translate('yourVisitHistory')}
              </Text>
            </View>
            <TouchableOpacity
              style={commonStyles.addButton}
              onPress={() => fetchVisitHistory()}
            >
              <Ionicons name="refresh" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      <View style={commonStyles.content}>
        {/* Filter Header */}
        {renderFilterHeader()}

        {/* Stats Summary */}
        {renderStatsSummary()}

        {/* Visit History List */}
        <FlatList
          data={visitHistory}
          renderItem={renderVisitItem}
          keyExtractor={(item, index) => `${item.visit_date}-${index}`}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6B7D3D']} />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // Filter Header
  filterHeader: {
    flexDirection: 'row',
    paddingVertical: 15,
    gap: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 4,
  },

  staffFilterButton: {
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
    borderWidth: 1,
    borderColor: '#3498DB',
  },

  customerFilterButton: {
    backgroundColor: 'rgba(107, 125, 61, 0.1)',
    borderWidth: 1,
    borderColor: '#6B7D3D',
  },

  dateFilterButton: {
    backgroundColor: 'rgba(243, 156, 18, 0.1)',
    borderWidth: 1,
    borderColor: '#F39C12',
  },

  filterButtonText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
    textAlign: 'center',
  },

  // Stats Cards
  statsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },

  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
    marginBottom: 2,
  },

  statLabel: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    lineHeight: 12,
  },

  // Visit Cards
  listContent: {
    flexGrow: 1,
  },

  visitCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  rtlVisitCard: {
    alignItems: 'flex-end',
  },

  visitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },

  rtlVisitHeader: {
    flexDirection: 'row-reverse',
  },

  visitInfo: {
    flex: 1,
  },

  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },

  visitDate: {
    fontSize: 12,
    color: '#666',
  },

  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(107, 125, 61, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },

  durationText: {
    fontSize: 12,
    color: '#6B7D3D',
    fontWeight: '600',
  },

  // Visit Details
  visitDetails: {
    gap: 10,
  },

  timeRow: {
    flexDirection: 'row',
    gap: 15,
  },

  rtlTimeRow: {
    flexDirection: 'row-reverse',
  },

  timeItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  timeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  timeInfo: {
    flex: 1,
  },

  timeLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },

  timeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },

  purposeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  purposeLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },

  purposeText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    flex: 1,
  },

  notesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },

  notesLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },

  notesText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    lineHeight: 18,
  },
});

export default StaffVisitHistoryScreen;