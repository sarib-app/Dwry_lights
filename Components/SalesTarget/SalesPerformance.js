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
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import languageService from '../Globals/Store/Lang';
import getAuthToken from '../Globals/Store/LocalData';
import AsyncStorage from '@react-native-async-storage/async-storage';
import commonStyles from '../Globals/CommonStyles';

const API_BASE_URL = 'https://planetdory.dwrylight.com/api';
const screenWidth = Dimensions.get('window').width;

const SalesPerformanceScreen = ({ navigation }) => {
  // State management
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isRTL, setIsRTL] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Data states
  const [performanceData, setPerformanceData] = useState(null);
  const [salesTargets, setSalesTargets] = useState([]);
  const [filteredTargets, setFilteredTargets] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' or 'targets'
  const [activeTargetTab, setActiveTargetTab] = useState('customers'); // 'customers', 'staff', 'staffPerCustomer'

  // Filter states
  const [filters, setFilters] = useState({
    period: new Date().toISOString().slice(0, 7), // YYYY-MM format
    staff_id: null,
    customer_id: null,
    territory: null,
  });

  const [selectedStaff, setSelectedStaff] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedTerritory, setSelectedTerritory] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const translate = (key) => languageService.translate(key);

  useEffect(() => {
    initializeScreen();
  }, []);

  useEffect(() => {
    filterTargetsByTab();
  }, [salesTargets, activeTargetTab]);

  // Add this new useEffect to refetch data when filters change
  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [filters.period, filters.staff_id, filters.customer_id, filters.territory]);

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
          setFilters(prev => ({
            ...prev,
            staff_id: user.id
          }));
        }
        
        // Auto-fetch after user data is loaded
        setTimeout(() => {
          fetchData();
        }, 100);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  // Filter targets by active tab
  const filterTargetsByTab = () => {
    // Always filter from the original salesTargets data, not from filteredTargets
    let filtered = [];
    
    console.log('Original Sales Targets:', salesTargets);
    console.log('Active Target Tab:', activeTargetTab);
    
    switch (activeTargetTab) {
      case 'customers':
        // Show records where customer_id is not null but staff_id is null
        filtered = salesTargets.filter(target => {
          const isCustomerOnly = target.customer_id != null && target.staff_id == null;
          console.log(`Target ${target.id}: customer_id=${target.customer_id}, staff_id=${target.staff_id}, isCustomerOnly=${isCustomerOnly}`);
          return isCustomerOnly;
        });
        break;
      case 'staff':
        // Show records where staff_id is not null but customer_id is null
        filtered = salesTargets.filter(target => {
          const isStaffOnly = target.staff_id != null && target.customer_id == null;
          console.log(`Target ${target.id}: customer_id=${target.customer_id}, staff_id=${target.staff_id}, isStaffOnly=${isStaffOnly}`);
          return isStaffOnly;
        });
        break;
      case 'staffPerCustomer':
        // Show records where both customer_id and staff_id are not null
        filtered = salesTargets.filter(target => {
          const isBoth = target.customer_id != null && target.staff_id != null;
          console.log(`Target ${target.id}: customer_id=${target.customer_id}, staff_id=${target.staff_id}, isBoth=${isBoth}`);
          return isBoth;
        });
        break;
      default:
        filtered = salesTargets;
    }
    
    console.log('Filtered Results:', filtered);
    setFilteredTargets(filtered);
  };

  // Fetch performance data
  const fetchPerformanceData = async () => {
    const token = await getAuthToken();
    if (!token) {
      Alert.alert(translate('error'), translate('authTokenNotFound'));
      return;
    }

    try {
      const payload = {
        period: filters.period, // Updated format: YYYY-MM
      };

      // Add optional filters
      if (filters.staff_id) {
        payload.staff_id = filters.staff_id;
      }
      if (filters.customer_id) {
        payload.customer_id = filters.customer_id;
      }
      if (filters.territory) {
        payload.territory = filters.territory;
      }

      const response = await fetch(`${API_BASE_URL}/getPerformance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        body: JSON.stringify(payload),
      });
      
      const result = await response.json();
      console.log('Performance API Response:', result);
      
      if (result.status === 200) {
        setPerformanceData(result.data);
      } else {
        Alert.alert(translate('error'), result.message || translate('failedToFetchPerformance'));
      }
    } catch (error) {
      console.error('Fetch performance error:', error);
      Alert.alert(translate('error'), translate('networkErrorFetchingPerformance'));
    }
  };

  // Fetch sales targets
  const fetchSalesTargets = async () => {
    const token = await getAuthToken();
    if (!token) {
      Alert.alert(translate('error'), translate('authTokenNotFound'));
      return;
    }

    try {
      const payload = {
        target_date: filters.period, // Updated format: YYYY-MM
      };

      // Add optional filters
      if (filters.staff_id) {
        payload.staff_id = filters.staff_id;
      }
      if (filters.customer_id) {
        payload.customer_id = filters.customer_id;
      }
      if (filters.territory) {
        payload.territory = filters.territory;
      }

      const response = await fetch(`${API_BASE_URL}/get_sales_targets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        body: JSON.stringify(payload),
      });
      
      const result = await response.json();
      console.log('Sales Targets API Response:', result);
      
      if (result.status === 200) {
        setSalesTargets(result.data || []);
      } else {
        Alert.alert(translate('error'), result.message || translate('failedToFetchTargets'));
      }
    } catch (error) {
      console.error('Fetch sales targets error:', error);
      Alert.alert(translate('error'), translate('networkErrorFetchingTargets'));
    }
  };

  // Fetch all data
  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchPerformanceData(),
        fetchSalesTargets()
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [filters]);

  // Handle period change - Remove the setTimeout and call fetchData directly
  const handlePeriodChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const period = selectedDate.toISOString().slice(0, 7);
      setFilters(prev => ({ ...prev, period }));
      // Data will be fetched automatically by the useEffect above
    }
  };

  // Format period for display
  const formatPeriod = (period) => {
    const date = new Date(period + '-01');
    return date.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'ahead': return '#27AE60';
      case 'on_track': return '#3498DB';
      case 'behind': return '#E74C3C';
      default: return '#95A5A6';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'ahead': return 'trending-up';
      case 'on_track': return 'checkmark-circle';
      case 'behind': return 'warning';
      default: return 'help-circle';
    }
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
              // Data will be fetched automatically by the useEffect
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
            // Data will be fetched automatically by the useEffect
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

      {/* Period Filter */}
      <TouchableOpacity
        style={[styles.filterButton, styles.periodFilterButton]}
        onPress={() => setShowDatePicker(true)}
      >
        <Ionicons name="calendar" size={16} color="#F39C12" />
        <Text style={[styles.filterButtonText, isRTL && commonStyles.arabicText]}>
          {formatPeriod(filters.period)}
        </Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={new Date(filters.period + '-01')}
          mode="date"
          display="default"
          onChange={handlePeriodChange}
        />
      )}
    </View>
  );

  // Render tab selector
  const renderTabSelector = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[
          styles.tabButton,
          activeTab === 'dashboard' && styles.tabButtonActive
        ]}
        onPress={() => setActiveTab('dashboard')}
      >
        <Ionicons 
          name="analytics" 
          size={16} 
          color={activeTab === 'dashboard' ? "#fff" : "#6B7D3D"} 
        />
        <Text style={[
          styles.tabButtonText,
          activeTab === 'dashboard' && styles.tabButtonTextActive,
          isRTL && commonStyles.arabicText
        ]}>
          {translate('dashboard')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.tabButton,
          activeTab === 'targets' && styles.tabButtonActive
        ]}
        onPress={() => setActiveTab('targets')}
      >
        <Ionicons 
          name="flag" 
          size={16} 
          color={activeTab === 'targets' ? "#fff" : "#6B7D3D"} 
        />
        <Text style={[
          styles.tabButtonText,
          activeTab === 'targets' && styles.tabButtonTextActive,
          isRTL && commonStyles.arabicText
        ]}>
          {translate('targets')}
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Render target sub-tabs
  const renderTargetSubTabs = () => {
    if (activeTab !== 'targets') return null;

    return (
      <View style={styles.subTabContainer}>
        <TouchableOpacity
          style={[
            styles.subTabButton,
            activeTargetTab === 'customers' && styles.subTabButtonActive
          ]}
          onPress={() => setActiveTargetTab('customers')}
        >
          <Ionicons 
            name="person" 
            size={14} 
            color={activeTargetTab === 'customers' ? "#fff" : "#6B7D3D"} 
          />
          <Text style={[
            styles.subTabButtonText,
            activeTargetTab === 'customers' && styles.subTabButtonTextActive,
            isRTL && commonStyles.arabicText
          ]}>
            {translate('customers')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.subTabButton,
            activeTargetTab === 'staff' && styles.subTabButtonActive
          ]}
          onPress={() => setActiveTargetTab('staff')}
        >
          <Ionicons 
            name="people" 
            size={14} 
            color={activeTargetTab === 'staff' ? "#fff" : "#6B7D3D"} 
          />
          <Text style={[
            styles.subTabButtonText,
            activeTargetTab === 'staff' && styles.subTabButtonTextActive,
            isRTL && commonStyles.arabicText
          ]}>
            {translate('staff')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.subTabButton,
            activeTargetTab === 'staffPerCustomer' && styles.subTabButtonActive
          ]}
          onPress={() => setActiveTargetTab('staffPerCustomer')}
        >
          <Ionicons 
            name="people-circle" 
            size={14} 
            color={activeTargetTab === 'staffPerCustomer' ? "#fff" : "#6B7D3D"} 
          />
          <Text style={[
            styles.subTabButtonText,
            activeTargetTab === 'staffPerCustomer' && styles.subTabButtonTextActive,
            isRTL && commonStyles.arabicText
          ]}>
            {translate('staffPerCustomer')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Render main performance overview
  const renderPerformanceOverview = () => {
    if (!performanceData) {
      return (
        <View style={commonStyles.emptyContainer}>
          <Ionicons name="analytics-outline" size={64} color="#ccc" />
          <Text style={[commonStyles.emptyText, isRTL && commonStyles.arabicText]}>
            {translate('noPerformanceData')}
          </Text>
          <Text style={[commonStyles.emptySubtext, isRTL && commonStyles.arabicText]}>
            {translate('adjustFiltersToViewData')}
          </Text>
        </View>
      );
    }

    const {
      target_amount,
      achieved_amount,
      achievement_percentage,
      remaining_amount,
      days_left_in_period,
      daily_target_needed,
      status,
      comparison_with_last_period
    } = performanceData;

    return (
      <View style={styles.dashboardContainer}>
        {/* Status Overview Card */}
        <View style={[styles.statusCard, { borderLeftColor: getStatusColor(status) }]}>
          <View style={[styles.statusHeader, isRTL && styles.rtlStatusHeader]}>
            <View style={styles.statusInfo}>
              <Text style={[styles.statusTitle, isRTL && commonStyles.arabicText]}>
                {translate('performanceStatus')}
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(status)}20` }]}>
                <Ionicons name={getStatusIcon(status)} size={16} color={getStatusColor(status)} />
                <Text style={[styles.statusText, { color: getStatusColor(status) }, isRTL && commonStyles.arabicText]}>
                  {translate(status)}
                </Text>
              </View>
            </View>
            <Text style={[styles.achievementPercentage, { color: getStatusColor(status) }, isRTL && commonStyles.arabicText]}>
              {achievement_percentage?.toFixed(1)}%
            </Text>
          </View>
        </View>

        {/* Progress Chart - Custom Implementation */}
        <View style={styles.chartCard}>
          <Text style={[styles.chartTitle, isRTL && commonStyles.arabicText]}>
            {translate('targetProgress')}
          </Text>
          <View style={styles.customProgressContainer}>
            {/* Custom Circular Progress */}
            <View style={styles.circularProgressWrapper}>
              <View style={styles.circularProgressBackground}>
                <View 
                  style={[
                    styles.circularProgressFill,
                    {
                      transform: [
                        { rotate: `${(achievement_percentage * 3.6) - 90}deg` }
                      ]
                    }
                  ]}
                />
              </View>
              <View style={styles.circularProgressInner}>
                <Text style={[styles.progressPercentageText, isRTL && commonStyles.arabicText]}>
                  {achievement_percentage?.toFixed(1)}%
                </Text>
                <Text style={[styles.progressLabel, isRTL && commonStyles.arabicText]}>
                  {translate('achieved')}
                </Text>
              </View>
            </View>

            {/* Progress Details */}
            <View style={styles.progressDetails}>
              <View style={[styles.progressDetailItem, isRTL && styles.rtlProgressDetail]}>
                <View style={[styles.progressIndicator, { backgroundColor: '#27AE60' }]} />
                <Text style={[styles.progressDetailLabel, isRTL && commonStyles.arabicText]}>
                  {translate('achieved')}: {parseFloat(achieved_amount).toLocaleString()}
                </Text>
              </View>
              <View style={[styles.progressDetailItem, isRTL && styles.rtlProgressDetail]}>
                <View style={[styles.progressIndicator, { backgroundColor: '#E74C3C' }]} />
                <Text style={[styles.progressDetailLabel, isRTL && commonStyles.arabicText]}>
                  {translate('remaining')}: {remaining_amount?.toLocaleString()}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Key Metrics Grid */}
        <View style={styles.metricsGrid}>
          {/* Target Amount */}
          <View style={[styles.metricCard, { backgroundColor: 'rgba(52, 152, 219, 0.1)' }]}>
            <Ionicons name="flag-outline" size={24} color="#3498DB" />
            <Text style={[styles.metricValue, { color: '#3498DB' }, isRTL && commonStyles.arabicText]}>
              {parseFloat(target_amount).toLocaleString()}
            </Text>
            <Text style={[styles.metricLabel, isRTL && commonStyles.arabicText]}>
              {translate('targetAmount')}
            </Text>
          </View>

          {/* Achieved Amount */}
          <View style={[styles.metricCard, { backgroundColor: 'rgba(39, 174, 96, 0.1)' }]}>
            <Ionicons name="checkmark-circle-outline" size={24} color="#27AE60" />
            <Text style={[styles.metricValue, { color: '#27AE60' }, isRTL && commonStyles.arabicText]}>
              {parseFloat(achieved_amount).toLocaleString()}
            </Text>
            <Text style={[styles.metricLabel, isRTL && commonStyles.arabicText]}>
              {translate('achievedAmount')}
            </Text>
          </View>

          {/* Remaining Amount */}
          <View style={[styles.metricCard, { backgroundColor: 'rgba(231, 76, 60, 0.1)' }]}>
            <Ionicons name="hourglass-outline" size={24} color="#E74C3C" />
            <Text style={[styles.metricValue, { color: '#E74C3C' }, isRTL && commonStyles.arabicText]}>
              {remaining_amount?.toLocaleString()}
            </Text>
            <Text style={[styles.metricLabel, isRTL && commonStyles.arabicText]}>
              {translate('remainingAmount')}
            </Text>
          </View>

          {/* Days Left */}
          <View style={[styles.metricCard, { backgroundColor: 'rgba(243, 156, 18, 0.1)' }]}>
            <Ionicons name="time-outline" size={24} color="#F39C12" />
            <Text style={[styles.metricValue, { color: '#F39C12' }, isRTL && commonStyles.arabicText]}>
              {Math.ceil(days_left_in_period)}
            </Text>
            <Text style={[styles.metricLabel, isRTL && commonStyles.arabicText]}>
              {translate('daysLeft')}
            </Text>
          </View>
        </View>

        {/* Daily Target Needed */}
        <View style={styles.dailyTargetCard}>
          <View style={[styles.dailyTargetHeader, isRTL && styles.rtlDailyTargetHeader]}>
            <Ionicons name="trending-up" size={24} color="#6B7D3D" />
            <View style={styles.dailyTargetInfo}>
              <Text style={[styles.dailyTargetTitle, isRTL && commonStyles.arabicText]}>
                {translate('dailyTargetNeeded')}
              </Text>
              <Text style={[styles.dailyTargetValue, isRTL && commonStyles.arabicText]}>
                {daily_target_needed?.toLocaleString()} / {translate('day')}
              </Text>
            </View>
          </View>
        </View>

        {/* Comparison with Last Period */}
        {comparison_with_last_period !== 0 && (
          <View style={styles.comparisonCard}>
            <View style={[styles.comparisonHeader, isRTL && styles.rtlComparisonHeader]}>
              <Ionicons 
                name={comparison_with_last_period > 0 ? "trending-up" : "trending-down"} 
                size={20} 
                color={comparison_with_last_period > 0 ? "#27AE60" : "#E74C3C"} 
              />
              <Text style={[styles.comparisonText, isRTL && commonStyles.arabicText]}>
                {translate('comparisonWithLastPeriod')}
              </Text>
              <Text style={[
                styles.comparisonValue, 
                { color: comparison_with_last_period > 0 ? "#27AE60" : "#E74C3C" },
                isRTL && commonStyles.arabicText
              ]}>
                {comparison_with_last_period > 0 ? '+' : ''}{comparison_with_last_period}%
              </Text>
            </View>
          </View>
        )}

        {/* Achievement Breakdown - Custom Implementation */}
        <View style={styles.chartCard}>
          <Text style={[styles.chartTitle, isRTL && commonStyles.arabicText]}>
            {translate('achievementBreakdown')}
          </Text>
          <View style={styles.achievementBreakdownContainer}>
            {/* Custom Bar Chart */}
            <View style={styles.barChartContainer}>
              <View style={styles.barChart}>
                <View style={styles.barBackground}>
                  <View 
                    style={[
                      styles.barFill,
                      {
                        width: `${achievement_percentage}%`,
                        backgroundColor: getStatusColor(status)
                      }
                    ]}
                  />
                </View>
                <Text style={[styles.barChartLabel, isRTL && commonStyles.arabicText]}>
                  {achievement_percentage?.toFixed(1)}% {translate('achieved')}
                </Text>
              </View>
            </View>

            {/* Achievement Stats */}
            <View style={styles.achievementStats}>
              <View style={[styles.achievementStatItem, isRTL && styles.rtlAchievementStat]}>
                <View style={[styles.statIndicator, { backgroundColor: '#27AE60' }]} />
                <View style={styles.statInfo}>
                  <Text style={[styles.statValue, isRTL && commonStyles.arabicText]}>
                    {parseFloat(achieved_amount).toLocaleString()}
                  </Text>
                  <Text style={[styles.statLabel, isRTL && commonStyles.arabicText]}>
                    {translate('achieved')}
                  </Text>
                </View>
              </View>

              <View style={[styles.achievementStatItem, isRTL && styles.rtlAchievementStat]}>
                <View style={[styles.statIndicator, { backgroundColor: '#E74C3C' }]} />
                <View style={styles.statInfo}>
                  <Text style={[styles.statValue, isRTL && commonStyles.arabicText]}>
                    {remaining_amount?.toLocaleString()}
                  </Text>
                  <Text style={[styles.statLabel, isRTL && commonStyles.arabicText]}>
                    {translate('remaining')}
                  </Text>
                </View>
              </View>

              <View style={[styles.achievementStatItem, isRTL && styles.rtlAchievementStat]}>
                <View style={[styles.statIndicator, { backgroundColor: '#3498DB' }]} />
                <View style={styles.statInfo}>
                  <Text style={[styles.statValue, isRTL && commonStyles.arabicText]}>
                    {parseFloat(target_amount).toLocaleString()}
                  </Text>
                  <Text style={[styles.statLabel, isRTL && commonStyles.arabicText]}>
                    {translate('targetAmount')}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  // Render enhanced sales target item with progress bars
  const renderTargetItem = ({ item }) => {
    const targetAmount = parseFloat(item.target_amount) || 0;
    const achievedAmount = parseFloat(item.achieved_amount) || 0;
    const pendingTargetAmount = parseFloat(item.pending_target_amount) || 0; // Updated field name
    const pendingInvoiceAmount = parseFloat(item.pending_invoice_amount) || 0; // New field
    const totalSalesAmount = achievedAmount + pendingInvoiceAmount; // Calculated field
    
    const achievementPercentage = targetAmount > 0 ? (achievedAmount / targetAmount) * 100 : 0;
    const totalSalesPercentage = targetAmount > 0 ? (totalSalesAmount / targetAmount) * 100 : 0;

    return (
      <View style={[styles.targetCard, isRTL && styles.rtlTargetCard]}>
        <View style={[styles.targetHeader, isRTL && styles.rtlTargetHeader]}>
          <View style={styles.targetInfo}>
            <Text style={[styles.targetTitle, isRTL && commonStyles.arabicText]}>
              {translate(item.target_type)} {translate('target')}
            </Text>
            <Text style={[styles.targetPeriod, isRTL && commonStyles.arabicText]}>
              {translate(item.target_period)} • {new Date(item.target_date + '-01').toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
            </Text>
          </View>
          
          <View style={[styles.targetBadge, { backgroundColor: `rgba(107, 125, 61, 0.1)` }]}>
            <Ionicons name="flag" size={16} color="#6B7D3D" />
            <Text style={[styles.targetAmount, isRTL && commonStyles.arabicText]}>
              {targetAmount.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Progress Chart */}
        <View style={styles.targetProgressContainer}>
          <Text style={[styles.progressTitle, isRTL && commonStyles.arabicText]}>
            {translate('progress')} - {achievementPercentage.toFixed(1)}%
          </Text>

          {/* Primary Progress Bar - Target vs Achieved vs Pending Target */}
          <View style={styles.progressBarSection}>
            <Text style={[styles.progressSectionTitle, isRTL && commonStyles.arabicText]}>
              {translate('targetProgress')}
            </Text>
            <View style={styles.multiProgressBar}>
              <View 
                style={[
                  styles.progressSegment,
                  styles.achievedSegment,
                  { width: `${Math.min((achievedAmount / targetAmount) * 100, 100)}%` }
                ]}
              />
              <View 
                style={[
                  styles.progressSegment,
                  styles.pendingTargetSegment,
                  { width: `${Math.min((pendingTargetAmount / targetAmount) * 100, 100)}%` }
                ]}
              />
            </View>
          </View>

          {/* Secondary Progress Bar - Total Sales Amount */}
          <View style={styles.progressBarSection}>
            <Text style={[styles.progressSectionTitle, isRTL && commonStyles.arabicText]}>
              {translate('totalSales')} - {totalSalesPercentage.toFixed(1)}%
            </Text>
            <View style={styles.multiProgressBar}>
              <View 
                style={[
                  styles.progressSegment,
                  styles.totalSalesSegment,
                  { width: `${Math.min(totalSalesPercentage, 100)}%` }
                ]}
              />
            </View>
          </View>

          {/* Pending Invoice Progress Bar */}
          <View style={styles.progressBarSection}>
            <Text style={[styles.progressSectionTitle, isRTL && commonStyles.arabicText]}>
              {translate('pendingInvoices')}
            </Text>
            <View style={styles.multiProgressBar}>
              <View 
                style={[
                  styles.progressSegment,
                  styles.pendingInvoiceSegment,
                  { width: `${Math.min((pendingInvoiceAmount / targetAmount) * 100, 100)}%` }
                ]}
              />
            </View>
          </View>

          {/* Progress Legend */}
          <View style={styles.progressLegend}>
            <View style={[styles.legendItem, isRTL && styles.rtlLegendItem]}>
              <View style={[styles.legendDot, { backgroundColor: '#3498DB' }]} />
              <Text style={[styles.legendText, isRTL && commonStyles.arabicText]}>
                {translate('target')}: {targetAmount.toLocaleString()}
              </Text>
            </View>

            <View style={[styles.legendItem, isRTL && styles.rtlLegendItem]}>
              <View style={[styles.legendDot, { backgroundColor: '#27AE60' }]} />
              <Text style={[styles.legendText, isRTL && commonStyles.arabicText]}>
                {translate('achieved')}: {achievedAmount.toLocaleString()}
              </Text>
            </View>

            <View style={[styles.legendItem, isRTL && styles.rtlLegendItem]}>
              <View style={[styles.legendDot, { backgroundColor: '#E74C3C' }]} />
              <Text style={[styles.legendText, isRTL && commonStyles.arabicText]}>
                {translate('pendingTarget')}: {pendingTargetAmount.toLocaleString()}
              </Text>
            </View>

            <View style={[styles.legendItem, isRTL && styles.rtlLegendItem]}>
              <View style={[styles.legendDot, { backgroundColor: '#F39C12' }]} />
              <Text style={[styles.legendText, isRTL && commonStyles.arabicText]}>
                {translate('pendingInvoices')}: {pendingInvoiceAmount.toLocaleString()}
              </Text>
            </View>

            <View style={[styles.legendItem, isRTL && styles.rtlLegendItem]}>
              <View style={[styles.legendDot, { backgroundColor: '#9B59B6' }]} />
              <Text style={[styles.legendText, isRTL && commonStyles.arabicText]}>
                {translate('totalSales')}: {totalSalesAmount.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.targetDetails}>
          {/* Territory */}
          {item.territory && (
            <View style={[styles.targetDetailRow, isRTL && styles.rtlDetailRow]}>
              <Ionicons name="map" size={16} color="#666" />
              <Text style={[styles.targetDetailLabel, isRTL && commonStyles.arabicText]}>
                {translate('territory')}:
              </Text>
              <Text style={[styles.targetDetailValue, isRTL && commonStyles.arabicText]}>
                {item.territory}
              </Text>
            </View>
          )}

          {/* Customer */}
          {item.customer_name && (
            <View style={[styles.targetDetailRow, isRTL && styles.rtlDetailRow]}>
              <Ionicons name="person" size={16} color="#666" />
              <Text style={[styles.targetDetailLabel, isRTL && commonStyles.arabicText]}>
                {translate('customer')}:
              </Text>
              <Text style={[styles.targetDetailValue, isRTL && commonStyles.arabicText]}>
                {item.customer_name}
              </Text>
            </View>
          )}

          {/* Staff (for staff per customer view) */}
          {item.staff_first_name && (
            <View style={[styles.targetDetailRow, isRTL && styles.rtlDetailRow]}>
              <Ionicons name="people" size={16} color="#666" />
              <Text style={[styles.targetDetailLabel, isRTL && commonStyles.arabicText]}>
                {translate('staff')}:
              </Text>
              <Text style={[styles.targetDetailValue, isRTL && commonStyles.arabicText]}>
                {item.staff_first_name} {item.staff_last_name}
              </Text>
            </View>
          )}

          {/* Set By */}
          <View style={[styles.targetDetailRow, isRTL && styles.rtlDetailRow]}>
            <Ionicons name="person-circle" size={16} color="#666" />
            <Text style={[styles.targetDetailLabel, isRTL && commonStyles.arabicText]}>
              {translate('setBy')}:
            </Text>
            <Text style={[styles.targetDetailValue, isRTL && commonStyles.arabicText]}>
              {item.set_by_first_name} {item.set_by_last_name}
            </Text>
          </View>

          {/* Created Date */}
          <View style={[styles.targetDetailRow, isRTL && styles.rtlDetailRow]}>
            <Ionicons name="calendar" size={16} color="#666" />
            <Text style={[styles.targetDetailLabel, isRTL && commonStyles.arabicText]}>
              {translate('createdOn')}:
            </Text>
            <Text style={[styles.targetDetailValue, isRTL && commonStyles.arabicText]}>
              {new Date(item.created_at).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  // Render targets list
  const renderTargetsList = () => {
    if (filteredTargets.length === 0) {
      return (
        <View style={commonStyles.emptyContainer}>
          <Ionicons name="flag-outline" size={64} color="#ccc" />
          <Text style={[commonStyles.emptyText, isRTL && commonStyles.arabicText]}>
            {translate('noSalesTargets')}
          </Text>
          <Text style={[commonStyles.emptySubtext, isRTL && commonStyles.arabicText]}>
            {translate('noTargetsForPeriod')}
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={filteredTargets}
        renderItem={renderTargetItem}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.targetsList}
      />
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={commonStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B7D3D" />
        <Text style={[commonStyles.loadingText, isRTL && commonStyles.arabicText]}>
          {translate('loadingSalesData')}
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
                {translate('salesPerformance')}
              </Text>
              <Text style={[commonStyles.headerSubtitle, isRTL && commonStyles.arabicText]}>
                {isAdmin ? translate('teamPerformanceAndTargets') : translate('yourPerformanceAndTargets')}
              </Text>
            </View>
            <TouchableOpacity
              style={commonStyles.addButton}
              onPress={() => fetchData()}
            >
              <Ionicons name="refresh" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      <View style={commonStyles.content}>
        {/* Filter Header */}
        {renderFilterHeader()}

        {/* Tab Selector */}
        {renderTabSelector()}

        {/* Target Sub-tabs */}
        {renderTargetSubTabs()}

        {/* Content */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6B7D3D']} />
          }
          style={styles.scrollContent}
        >
          {activeTab === 'dashboard' ? renderPerformanceOverview() : renderTargetsList()}
        </ScrollView>
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

  periodFilterButton: {
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

  // Tab Container
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },

  tabButtonActive: {
    backgroundColor: '#6B7D3D',
  },

  tabButtonText: {
    fontSize: 14,
    color: '#6B7D3D',
    fontWeight: '500',
  },

  tabButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },

  // Sub Tab Container
  subTabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  subTabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 4,
  },

  subTabButtonActive: {
    backgroundColor: '#6B7D3D',
  },

  subTabButtonText: {
    fontSize: 12,
    color: '#6B7D3D',
    fontWeight: '500',
  },

  subTabButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },

  scrollContent: {
    flex: 1,
  },

  // Dashboard Container
  dashboardContainer: {
    paddingBottom: 20,
  },

  // Status Card
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  rtlStatusHeader: {
    flexDirection: 'row-reverse',
  },

  statusInfo: {
    flex: 1,
  },

  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    gap: 6,
  },

  statusText: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },

  achievementPercentage: {
    fontSize: 28,
    fontWeight: 'bold',
  },

  // Chart Cards
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },

  // Custom Progress Chart
  customProgressContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },

  circularProgressWrapper: {
    position: 'relative',
    marginBottom: 20,
  },

  circularProgressBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
    position: 'relative',
    overflow: 'hidden',
  },

  circularProgressFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '50%',
    height: '100%',
    backgroundColor: '#6B7D3D',
    transformOrigin: 'right center',
  },

  circularProgressInner: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },

  progressPercentageText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6B7D3D',
  },

  progressLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },

  progressDetails: {
    width: '100%',
    gap: 8,
  },

  progressDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  rtlProgressDetail: {
    flexDirection: 'row-reverse',
  },

  progressIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },

  progressDetailLabel: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },

  // Custom Achievement Breakdown
  achievementBreakdownContainer: {
    paddingVertical: 10,
  },

  barChartContainer: {
    marginBottom: 20,
  },

  barChart: {
    marginBottom: 10,
  },

  barBackground: {
    height: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 8,
  },

  barFill: {
    height: '100%',
    borderRadius: 10,
    minWidth: 4,
  },

  barChartLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },

  achievementStats: {
    gap: 12,
  },

  achievementStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },

  rtlAchievementStat: {
    flexDirection: 'row-reverse',
  },

  statIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },

  statInfo: {
    flex: 1,
  },

  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },

  statLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },

  progressChartContainer: {
    alignItems: 'center',
  },

  pieChartContainer: {
    alignItems: 'center',
  },

  // Metrics Grid
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 15,
  },

  metricCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },

  metricLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },

  // Daily Target Card
  dailyTargetCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  dailyTargetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },

  rtlDailyTargetHeader: {
    flexDirection: 'row-reverse',
  },

  dailyTargetInfo: {
    flex: 1,
  },

  dailyTargetTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },

  dailyTargetValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6B7D3D',
  },

  // Comparison Card
  comparisonCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  comparisonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  rtlComparisonHeader: {
    flexDirection: 'row-reverse',
  },

  comparisonText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },

  comparisonValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Target Cards with Enhanced Progress
  targetsList: {
    flexGrow: 1,
    paddingBottom: 20,
  },

  targetCard: {
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

  rtlTargetCard: {
    alignItems: 'flex-end',
  },

  targetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },

  rtlTargetHeader: {
    flexDirection: 'row-reverse',
  },

  targetInfo: {
    flex: 1,
  },

  targetTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },

  targetPeriod: {
    fontSize: 12,
    color: '#666',
  },

  targetBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },

  targetAmount: {
    fontSize: 14,
    color: '#6B7D3D',
    fontWeight: '600',
  },

  // Target Progress Container
  targetProgressContainer: {
    marginBottom: 15,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },

  progressTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },

  progressBarSection: {
    marginBottom: 12,
  },

  progressSectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555',
    marginBottom: 6,
  },

  multiProgressBar: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: 8,
  },

  progressSegment: {
    height: '100%',
  },

  achievedSegment: {
    backgroundColor: '#27AE60',
  },

  pendingTargetSegment: {
    backgroundColor: '#E74C3C',
  },

  totalSalesSegment: {
    backgroundColor: '#9B59B6',
  },

  pendingInvoiceSegment: {
    backgroundColor: '#F39C12',
  },

  progressLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },

  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    flex: 1,
    minWidth: '45%',
    marginBottom: 4,
  },

  rtlLegendItem: {
    flexDirection: 'row-reverse',
  },

  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  legendText: {
    fontSize: 9,
    color: '#666',
    fontWeight: '500',
    flex: 1,
  },

  // Target Details
  targetDetails: {
    gap: 8,
  },

  targetDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  rtlDetailRow: {
    flexDirection: 'row-reverse',
  },

  targetDetailLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },

  targetDetailValue: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
    flex: 1,
  },
});

export default SalesPerformanceScreen;