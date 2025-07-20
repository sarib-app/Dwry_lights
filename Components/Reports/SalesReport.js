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
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import languageService from '../Globals/Store/Lang';
import getAuthToken from '../Globals/Store/LocalData';
import AsyncStorage from '@react-native-async-storage/async-storage';
import commonStyles from '../Globals/CommonStyles';

const API_BASE_URL = 'https://planetdory.dwrylight.com/api';
const { width: screenWidth } = Dimensions.get('window');

const SalesReportScreen = ({ navigation }) => {
  // State management
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isRTL, setIsRTL] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Filter states
  const [filters, setFilters] = useState({
    date_from: '',
    date_to: '',
    territory: '',
    status: 'paid',
    customer_id: null,
    staff_id: null,
  });

  const translate = (key) => languageService.translate(key);

  useEffect(() => {
    initializeScreen();
  }, []);

  const initializeScreen = async () => {
    const language = await languageService.loadSavedLanguage();
    setCurrentLanguage(language);
    setIsRTL(language === 'ar');
    
    await loadUserData();
    const defaultFilters = setDefaultDateRange();
    // Auto-fetch report with default filters
    setTimeout(() => {
      fetchSalesReportWithFilters(defaultFilters);
    }, 100);
  };

  // Load user data from AsyncStorage
  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        setCurrentUser(user);
        setUserRole(user.role_id);
        
        // If user is staff (role_id = 3), set their ID in filters
        if (user.role_id === 3) {
          setFilters(prev => ({
            ...prev,
            staff_id: user.id
          }));
        }
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

    const newFilters = {
      ...filters,
      date_from: formatDate(firstDay),
      date_to: formatDate(lastDay)
    };
    
    setFilters(newFilters);
    return newFilters;
  };

  // Fetch sales report data
  const fetchSalesReport = async () => {
    fetchSalesReportWithFilters(filters);
  };

  const fetchSalesReportWithFilters = async (currentFilters) => {
    const token = await getAuthToken();
    if (!token) {
      Alert.alert(translate('error'), translate('authTokenNotFound'));
      return;
    }

    try {
      // Build request payload
      const payload = {
        date_from: currentFilters.date_from,
        date_to: currentFilters.date_to,
      };

      // Add optional filters
      if (currentFilters.territory) payload.territory = currentFilters.territory;
      if (currentFilters.status) payload.status = currentFilters.status;
      if (currentFilters.customer_id) payload.customer_id = currentFilters.customer_id;
      if (currentFilters.staff_id) payload.staff_id = currentFilters.staff_id;

      const response = await fetch(`${API_BASE_URL}/sales_report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        body: JSON.stringify(payload),
      });
      
      const result = await response.json();
      console.log('Sales Report API Response:', result);
      
      if (result.status === 200) {
        setReportData(result.data);
      } else {
        Alert.alert(translate('error'), result.message || translate('failedToFetchSalesReport'));
      }
    } catch (error) {
      console.error('Fetch sales report error:', error);
      Alert.alert(translate('error'), translate('networkErrorFetchingSalesReport'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchSalesReport();
  }, [filters]);

  // Format currency
  const formatCurrency = (amount) => {
    const number = parseFloat(amount) || 0;
    return isRTL ? `${number.toLocaleString()} ر.س` : `$${number.toLocaleString()}`;
  };

  // Format percentage
  const formatPercentage = (percentage) => {
    return `${parseFloat(percentage || 0).toFixed(1)}%`;
  };

  // Render stats cards in grid
  const renderStatsCards = () => {
    if (!reportData) return null;

    const stats = [
      {
        title: translate('totalSales'),
        value: formatCurrency(reportData.total_sales_amount),
        icon: 'trending-up',
        color: '#6B7D3D',
        bgColor: 'rgba(107, 125, 61, 0.1)',
      },
      {
        title: translate('totalProfit'),
        value: formatCurrency(reportData.total_profit_amount),
        icon: 'cash',
        color: '#27AE60',
        bgColor: 'rgba(39, 174, 96, 0.1)',
      },
      {
        title: translate('numberOfInvoices'),
        value: reportData.number_of_invoices.toString(),
        icon: 'receipt',
        color: '#3498DB',
        bgColor: 'rgba(52, 152, 219, 0.1)',
      },
      {
        title: translate('itemsSold'),
        value: reportData.total_sold_items_quantity.toString(),
        icon: 'cube',
        color: '#9B59B6',
        bgColor: 'rgba(155, 89, 182, 0.1)',
      },
    ];

    return (
      <View style={styles.statsContainer}>
        {stats.map((stat, index) => (
          <View key={index} style={[styles.statCard, { backgroundColor: stat.bgColor }]}>
            <View style={[styles.statIcon, { backgroundColor: stat.color }]}>
              <Ionicons name={stat.icon} size={20} color="#fff" />
            </View>
            <Text style={[styles.statValue, isRTL && commonStyles.arabicText]}>
              {stat.value}
            </Text>
            <Text style={[styles.statTitle, isRTL && commonStyles.arabicText]}>
              {stat.title}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  // Render sales performance chart
  const renderSalesChart = () => {
    if (!reportData) return null;

    const chartData = {
      labels: [translate('sales'), translate('cost'), translate('profit')],
      datasets: [{
        data: [
          reportData.total_sales_amount,
          reportData.total_cost_to_company,
          reportData.total_profit_amount
        ],
        colors: [
          () => '#6B7D3D',
          () => '#E74C3C',
          () => '#27AE60',
        ]
      }]
    };

    return (
      <View style={commonStyles.card}>
        <Text style={[styles.chartTitle, isRTL && commonStyles.arabicText]}>
          {translate('salesPerformance')}
        </Text>
        <BarChart
          data={chartData}
          width={screenWidth - 60}
          height={220}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(107, 125, 61, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
            style: { borderRadius: 16 },
            propsForLabels: { fontSize: 12 },
          }}
          style={styles.chart}
          showValuesOnTopOfBars
        />
      </View>
    );
  };

  // Render target achievement
  const renderTargetAchievement = () => {
    if (!reportData) return null;

    const achievementPercentage = Math.min(reportData.target_achieved_percentage, 100);
    
    return (
      <View style={commonStyles.card}>
        <Text style={[styles.chartTitle, isRTL && commonStyles.arabicText]}>
          {translate('targetAchievement')}
        </Text>
        
        <View style={styles.targetContainer}>
          <View style={styles.targetInfo}>
            <Text style={[styles.targetLabel, isRTL && commonStyles.arabicText]}>
              {translate('salesTarget')}
            </Text>
            <Text style={[styles.targetValue, isRTL && commonStyles.arabicText]}>
              {formatCurrency(reportData.target_sales_amount)}
            </Text>
          </View>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBackground}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${Math.min(achievementPercentage, 100)}%` }
                ]} 
              />
            </View>
            <Text style={[styles.progressText, isRTL && commonStyles.arabicText]}>
              {formatPercentage(reportData.target_achieved_percentage)}
            </Text>
          </View>
          
          <View style={styles.targetInfo}>
            <Text style={[styles.targetLabel, isRTL && commonStyles.arabicText]}>
              {translate('achieved')}
            </Text>
            <Text style={[styles.targetValue, isRTL && commonStyles.arabicText]}>
              {formatCurrency(reportData.total_sales_amount)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  // Render top customers
  const renderTopCustomers = () => {
    if (!reportData || !reportData.top_customers?.length) return null;

    return (
      <View style={commonStyles.card}>
        <Text style={[styles.chartTitle, isRTL && commonStyles.arabicText]}>
          {translate('topCustomers')}
        </Text>
        
        {reportData.top_customers.map((customer, index) => (
          <View key={customer.customer_id} style={styles.customerItem}>
            <View style={styles.customerRank}>
              <Text style={styles.rankNumber}>{index + 1}</Text>
            </View>
            <View style={styles.customerInfo}>
              <Text style={[styles.customerName, isRTL && commonStyles.arabicText]}>
                {customer.customer_name}
              </Text>
              <Text style={[styles.customerStats, isRTL && commonStyles.arabicText]}>
                {customer.total_invoices} {translate('invoices')} • {formatCurrency(customer.total_sales)}
              </Text>
            </View>
            <View style={styles.customerSales}>
              <Text style={[styles.salesAmount, isRTL && commonStyles.arabicText]}>
                {formatCurrency(customer.total_sales)}
              </Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  // Render payment status summary
  const renderPaymentStatus = () => {
    if (!reportData) return null;

    const paymentData = [
      {
        name: translate('paid'),
        population: reportData.total_paid_invoices,
        color: '#27AE60',
        legendFontColor: '#333',
        legendFontSize: 12,
      },
      {
        name: translate('pending'),
        population: reportData.pending_payments,
        color: '#F39C12',
        legendFontColor: '#333',
        legendFontSize: 12,
      },
      {
        name: translate('overdue'),
        population: reportData.overdue_payments,
        color: '#E74C3C',
        legendFontColor: '#333',
        legendFontSize: 12,
      },
    ].filter(item => item.population > 0);

    if (paymentData.length === 0) return null;

    return (
      <View style={commonStyles.card}>
        <Text style={[styles.chartTitle, isRTL && commonStyles.arabicText]}>
          {translate('paymentStatus')}
        </Text>
        <PieChart
          data={paymentData}
          width={screenWidth - 60}
          height={220}
          chartConfig={{
            color: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      </View>
    );
  };

  // Render filter button
  const renderFilterButton = () => (
    <TouchableOpacity
      style={styles.filterButton}
      onPress={() => navigation.navigate('SalesReportFilters', { 
        filters, 
        onFiltersChange: (newFilters) => {
          setFilters(newFilters);
          fetchSalesReportWithFilters(newFilters);
        },
        userRole,
        currentUser
      })}
    >
      <Ionicons name="options" size={20} color="#fff" />
      <Text style={[styles.filterButtonText, isRTL && commonStyles.arabicText]}>
        {translate('filters')}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={commonStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B7D3D" />
        <Text style={[commonStyles.loadingText, isRTL && commonStyles.arabicText]}>
          {translate('loadingSalesReport')}
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
                {translate('salesReport')}
              </Text>
              <Text style={[commonStyles.headerSubtitle, isRTL && commonStyles.arabicText]}>
                {translate('businessAnalytics')}
              </Text>
            </View>
            {renderFilterButton()}
          </View>
        </LinearGradient>
      </View>

      <ScrollView
        style={commonStyles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6B7D3D']} />
        }
      >
        {/* Stats Cards in Grid */}
        {renderStatsCards()}

        {/* Sales Performance Chart */}
        {renderSalesChart()}

        {/* Target Achievement */}
        {renderTargetAchievement()}

        {/* Payment Status */}
        {renderPaymentStatus()}

        {/* Top Customers */}
        {renderTopCustomers()}

        <View style={commonStyles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // Stats Grid
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 15,
    paddingVertical: 15,
    gap: 10,
  },
  
  statCard: {
    width: (screenWidth - 50) / 2,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
  },
  
  statTitle: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    lineHeight: 14,
  },

  // Charts
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },

  // Target Achievement
  targetContainer: {
    paddingVertical: 10,
  },
  
  targetInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  
  targetLabel: {
    fontSize: 14,
    color: '#666',
  },
  
  targetValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  
  progressContainer: {
    marginBottom: 15,
  },
  
  progressBackground: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  
  progressFill: {
    height: '100%',
    backgroundColor: '#6B7D3D',
    borderRadius: 4,
  },
  
  progressText: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6B7D3D',
  },

  // Top Customers
  customerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  
  customerRank: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#6B7D3D',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  
  rankNumber: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  
  customerInfo: {
    flex: 1,
  },
  
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  
  customerStats: {
    fontSize: 12,
    color: '#666',
  },
  
  customerSales: {
    alignItems: 'flex-end',
  },
  
  salesAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6B7D3D',
  },

  // Filter Button
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 5,
  },
  
  filterButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
});

export default SalesReportScreen;