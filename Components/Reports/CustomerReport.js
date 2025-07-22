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
import { BarChart, PieChart } from 'react-native-chart-kit';
import languageService from '../Globals/Store/Lang';
import getAuthToken from '../Globals/Store/LocalData';
import commonStyles from '../Globals/CommonStyles';

const API_BASE_URL = 'https://planetdory.dwrylight.com/api';
const { width: screenWidth } = Dimensions.get('window');

const CustomerReportScreen = ({ navigation }) => {
  // State management
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isRTL, setIsRTL] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Filter states
  const [filters, setFilters] = useState({
    date_from: '',
    date_to: '',
    customer_id: null,
  });

  const translate = (key) => languageService.translate(key);

  useEffect(() => {
    initializeScreen();
  }, []);

  const initializeScreen = async () => {
    const language = await languageService.loadSavedLanguage();
    setCurrentLanguage(language);
    setIsRTL(language === 'ar');
    
    setDefaultDateRange();
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

  // Fetch customer report data
  const fetchCustomerReport = async () => {
    if (!filters.customer_id) {
      Alert.alert(translate('error'), translate('pleaseSelectCustomer'));
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
        date_from: filters.date_from,
        date_to: filters.date_to,
        customer_id: filters.customer_id,
      };

      const response = await fetch(`${API_BASE_URL}/customer_report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        body: JSON.stringify(payload),
      });
      
      const result = await response.json();
      console.log('Customer Report API Response:', result);
      
      if (result.status === 200) {
        setReportData(result.data);
      } else {
        Alert.alert(translate('error'), result.message || translate('failedToFetchCustomerReport'));
      }
    } catch (error) {
      console.error('Fetch customer report error:', error);
      Alert.alert(translate('error'), translate('networkErrorFetchingCustomerReport'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refresh handler
  const onRefresh = useCallback(() => {
    if (!filters.customer_id) return;
    setRefreshing(true);
    fetchCustomerReport();
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
        value: formatCurrency(reportData.total_sales),
        icon: 'trending-up',
        color: '#6B7D3D',
        bgColor: 'rgba(107, 125, 61, 0.1)',
      },
      {
        title: translate('totalProfit'),
        value: formatCurrency(reportData.total_profit),
        icon: 'cash',
        color: '#27AE60',
        bgColor: 'rgba(39, 174, 96, 0.1)',
      },
      {
        title: translate('totalOrders'),
        value: reportData.total_orders.toString(),
        icon: 'receipt',
        color: '#3498DB',
        bgColor: 'rgba(52, 152, 219, 0.1)',
      },
      {
        title: translate('totalVisits'),
        value: reportData.total_visits.toString(),
        icon: 'location',
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

  // Render customer performance chart
  const renderPerformanceChart = () => {
    if (!reportData) return null;

    const chartData = {
      labels: [translate('sales'), translate('cost'), translate('profit'), translate('revenue')],
      datasets: [{
        data: [
          reportData.total_sales,
          reportData.total_cost_to_company,
          reportData.total_profit,
          reportData.total_revenue
        ],
        colors: [
          () => '#6B7D3D',
          () => '#E74C3C',
          () => '#27AE60',
          () => '#3498DB',
        ]
      }]
    };

    return (
      <View style={commonStyles.card}>
        <Text style={[styles.chartTitle, isRTL && commonStyles.arabicText]}>
          {translate('customerPerformance')}
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
    if (!reportData || !reportData.target_data) return null;

    const targetData = reportData.target_data;
    const achievementPercentage = Math.min(targetData.target_achieved_percentage, 100);
    
    return (
      <View style={commonStyles.card}>
        <Text style={[styles.chartTitle, isRTL && commonStyles.arabicText]}>
          {translate('targetAchievement')}
        </Text>
        
        <View style={styles.targetContainer}>
          <View style={styles.targetInfo}>
            <Text style={[styles.targetLabel, isRTL && commonStyles.arabicText]}>
              {translate('targetAmount')}
            </Text>
            <Text style={[styles.targetValue, isRTL && commonStyles.arabicText]}>
              {formatCurrency(targetData.target_amount)}
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
              {formatPercentage(targetData.target_achieved_percentage)}
            </Text>
          </View>
          
          <View style={styles.targetInfo}>
            <Text style={[styles.targetLabel, isRTL && commonStyles.arabicText]}>
              {translate('achieved')}
            </Text>
            <Text style={[styles.targetValue, isRTL && commonStyles.arabicText]}>
              {formatCurrency(targetData.achieved_amount)}
            </Text>
          </View>

          <View style={styles.targetInfo}>
            <Text style={[styles.targetLabel, isRTL && commonStyles.arabicText]}>
              {translate('remaining')}
            </Text>
            <Text style={[styles.targetValue, { color: '#E74C3C' }, isRTL && commonStyles.arabicText]}>
              {formatCurrency(targetData.left_target_amount)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  // Render financial breakdown
  const renderFinancialBreakdown = () => {
    if (!reportData) return null;

    const profitMargin = reportData.total_sales > 0 
      ? ((reportData.total_profit / reportData.total_sales) * 100).toFixed(1)
      : 0;

    return (
      <View style={commonStyles.card}>
        <Text style={[styles.chartTitle, isRTL && commonStyles.arabicText]}>
          {translate('financialBreakdown')}
        </Text>
        
        <View style={styles.breakdownContainer}>
          <View style={styles.breakdownItem}>
            <View style={styles.breakdownIconContainer}>
              <Ionicons name="trending-up" size={24} color="#6B7D3D" />
            </View>
            <View style={styles.breakdownInfo}>
              <Text style={[styles.breakdownLabel, isRTL && commonStyles.arabicText]}>
                {translate('totalRevenue')}
              </Text>
              <Text style={[styles.breakdownValue, isRTL && commonStyles.arabicText]}>
                {formatCurrency(reportData.total_revenue)}
              </Text>
            </View>
          </View>

          <View style={styles.breakdownItem}>
            <View style={[styles.breakdownIconContainer, { backgroundColor: 'rgba(231, 76, 60, 0.1)' }]}>
              <Ionicons name="trending-down" size={24} color="#E74C3C" />
            </View>
            <View style={styles.breakdownInfo}>
              <Text style={[styles.breakdownLabel, isRTL && commonStyles.arabicText]}>
                {translate('totalCost')}
              </Text>
              <Text style={[styles.breakdownValue, isRTL && commonStyles.arabicText]}>
                {formatCurrency(reportData.total_cost_to_company)}
              </Text>
            </View>
          </View>

          <View style={styles.breakdownItem}>
            <View style={[styles.breakdownIconContainer, { backgroundColor: 'rgba(39, 174, 96, 0.1)' }]}>
              <Ionicons name="checkmark-circle" size={24} color="#27AE60" />
            </View>
            <View style={styles.breakdownInfo}>
              <Text style={[styles.breakdownLabel, isRTL && commonStyles.arabicText]}>
                {translate('profitMargin')}
              </Text>
              <Text style={[styles.breakdownValue, { color: '#27AE60' }, isRTL && commonStyles.arabicText]}>
                {profitMargin}%
              </Text>
            </View>
          </View>

          {reportData.total_loss > 0 && (
            <View style={styles.breakdownItem}>
              <View style={[styles.breakdownIconContainer, { backgroundColor: 'rgba(231, 76, 60, 0.1)' }]}>
                <Ionicons name="close-circle" size={24} color="#E74C3C" />
              </View>
              <View style={styles.breakdownInfo}>
                <Text style={[styles.breakdownLabel, isRTL && commonStyles.arabicText]}>
                  {translate('totalLoss')}
                </Text>
                <Text style={[styles.breakdownValue, { color: '#E74C3C' }, isRTL && commonStyles.arabicText]}>
                  {formatCurrency(reportData.total_loss)}
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
    );
  };

  // Render order status summary
  const renderOrderStatus = () => {
    if (!reportData || reportData.total_orders === 0) return null;

    const completedOrders = reportData.total_orders - reportData.total_pending_orders;
    
    const orderData = [
      {
        name: translate('completed'),
        population: completedOrders,
        color: '#27AE60',
        legendFontColor: '#333',
        legendFontSize: 12,
      },
      {
        name: translate('pending'),
        population: reportData.total_pending_orders,
        color: '#F39C12',
        legendFontColor: '#333',
        legendFontSize: 12,
      },
    ].filter(item => item.population > 0);

    return (
      <View style={commonStyles.card}>
        <Text style={[styles.chartTitle, isRTL && commonStyles.arabicText]}>
          {translate('orderStatus')}
        </Text>
        <PieChart
          data={orderData}
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

  // Render customer selection and filter button
  const renderHeader = () => (
    <View style={styles.headerActions}>
      <TouchableOpacity
        style={[styles.actionButton, styles.customerButton]}
        onPress={() => navigation.navigate('CustomerSelectorScreen', {
          selectedCustomerId: filters.customer_id,
          onCustomerSelect: (customer) => {
            if (customer) {
              setSelectedCustomer(customer);
              setFilters(prev => ({ ...prev, customer_id: customer.id }));
              setTimeout(() => {
                fetchCustomerReport();
              }, 100);
            }
          }
        })}
      >
        <Ionicons name="person" size={20} color="#6B7D3D" />
        <Text style={[styles.actionButtonText, isRTL && commonStyles.arabicText]} numberOfLines={1}>
          {selectedCustomer 
            ? (isRTL ? (selectedCustomer.name_ar || selectedCustomer.name) : selectedCustomer.name)
            : translate('selectCustomer')
          }
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionButton, styles.filterButton]}
        onPress={() => navigation.navigate('CustomerReportFilters', { 
          filters, 
          onFiltersChange: (newFilters) => {
            setFilters(newFilters);
            setTimeout(() => {
              fetchCustomerReport();
            }, 100);
          },
          selectedCustomer
        })}
      >
        <Ionicons name="calendar" size={20} color="#3498DB" />
        <Text style={[styles.actionButtonText, isRTL && commonStyles.arabicText]}>
          {translate('dateRange')}
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Render empty state when no customer selected
  const renderEmptyState = () => (
    <View style={commonStyles.emptyContainer}>
      <Ionicons name="person-outline" size={64} color="#ccc" />
      <Text style={[commonStyles.emptyText, isRTL && commonStyles.arabicText]}>
        {translate('selectCustomerToViewReport')}
      </Text>
      <Text style={[commonStyles.emptySubtext, isRTL && commonStyles.arabicText]}>
        {translate('chooseCustomerFromList')}
      </Text>
      <TouchableOpacity
        style={commonStyles.emptyButton}
        onPress={() => navigation.navigate('CustomerSelectorScreen', {
          selectedCustomerId: null,
          onCustomerSelect: (customer) => {
            if (customer) {
              setSelectedCustomer(customer);
              setFilters(prev => ({ ...prev, customer_id: customer.id }));
              setTimeout(() => {
                fetchCustomerReport();
              }, 100);
            }
          }
        })}
      >
        <Text style={[commonStyles.emptyButtonText, isRTL && commonStyles.arabicText]}>
          {translate('selectCustomer')}
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={commonStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B7D3D" />
        <Text style={[commonStyles.loadingText, isRTL && commonStyles.arabicText]}>
          {translate('loadingCustomerReport')}
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
                {translate('customerReport')}
              </Text>
              <Text style={[commonStyles.headerSubtitle, isRTL && commonStyles.arabicText]}>
                {selectedCustomer 
                  ? (isRTL ? (selectedCustomer.name_ar || selectedCustomer.name) : selectedCustomer.name)
                  : translate('customerAnalytics')
                }
              </Text>
            </View>
            <View style={commonStyles.placeholder} />
          </View>
        </LinearGradient>
      </View>

      <ScrollView
        style={commonStyles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={['#6B7D3D']}
            enabled={!!filters.customer_id}
          />
        }
      >
        {/* Header Actions */}
        {renderHeader()}

        {!filters.customer_id ? (
          renderEmptyState()
        ) : reportData ? (
          <>
            {/* Stats Cards */}
            {renderStatsCards()}

            {/* Performance Chart */}
            {renderPerformanceChart()}

            {/* Target Achievement */}
            {renderTargetAchievement()}

            {/* Financial Breakdown */}
            {renderFinancialBreakdown()}

            {/* Order Status */}
            {renderOrderStatus()}
          </>
        ) : (
          <View style={commonStyles.emptyContainer}>
            <Ionicons name="analytics-outline" size={64} color="#ccc" />
            <Text style={[commonStyles.emptyText, isRTL && commonStyles.arabicText]}>
              {translate('noDataAvailable')}
            </Text>
            <Text style={[commonStyles.emptySubtext, isRTL && commonStyles.arabicText]}>
              {translate('adjustDateRangeOrTryAgain')}
            </Text>
          </View>
        )}

        <View style={commonStyles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // Header Actions
  headerActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 12,
    gap: 8,
  },

  customerButton: {
    backgroundColor: 'rgba(107, 125, 61, 0.1)',
    borderWidth: 1,
    borderColor: '#6B7D3D',
  },

  filterButton: {
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
    borderWidth: 1,
    borderColor: '#3498DB',
  },

  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },

  // Stats Grid
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    paddingVertical: 15,
    justifyContent: 'space-between',
  },
  
  statCard: {
    width: (screenWidth - 60) / 2,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
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

  // Financial Breakdown
  breakdownContainer: {
    paddingVertical: 10,
  },

  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  breakdownIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(107, 125, 61, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },

  breakdownInfo: {
    flex: 1,
  },

  breakdownLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },

  breakdownValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default CustomerReportScreen;