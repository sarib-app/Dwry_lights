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
import { BarChart, PieChart, LineChart } from 'react-native-chart-kit';
import languageService from '../Globals/Store/Lang';
import getAuthToken from '../Globals/Store/LocalData';
import commonStyles from '../Globals/CommonStyles';

const API_BASE_URL = 'https://planetdory.dwrylight.com/api';
const { width: screenWidth } = Dimensions.get('window');

const FinancialSummaryScreen = ({ navigation }) => {
  // State management
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isRTL, setIsRTL] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    date_from: '',
    date_to: '',
  });

  const translate = (key) => languageService.translate(key);

  useEffect(() => {
    initializeScreen();
  }, []);

  const initializeScreen = async () => {
    const language = await languageService.loadSavedLanguage();
    setCurrentLanguage(language);
    setIsRTL(language === 'ar');
    
    const defaultFilters = setDefaultDateRange();
    setTimeout(() => {
      fetchFinancialSummary(defaultFilters);
    }, 100);
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
      date_from: formatDate(firstDay),
      date_to: formatDate(lastDay)
    };
    
    setFilters(newFilters);
    return newFilters;
  };

  // Fetch financial summary data
  const fetchFinancialSummary = async (currentFilters = filters) => {
    const token = await getAuthToken();
    if (!token) {
      Alert.alert(translate('error'), translate('authTokenNotFound'));
      return;
    }

    setLoading(true);
    try {
      const payload = {
        date_from: currentFilters.date_from,
        date_to: currentFilters.date_to,
      };

      const response = await fetch(`${API_BASE_URL}/financial_summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        body: JSON.stringify(payload),
      });
      
      const result = await response.json();
      console.log('Financial Summary API Response:', result);
      
      if (result.status === 200) {
        setReportData(result.data);
      } else {
        Alert.alert(translate('error'), result.message || translate('failedToFetchFinancialSummary'));
      }
    } catch (error) {
      console.error('Fetch financial summary error:', error);
      Alert.alert(translate('error'), translate('networkErrorFetchingFinancialSummary'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchFinancialSummary();
  }, [filters]);

  // Format currency
  const formatCurrency = (amount) => {
    const number = parseFloat(amount) || 0;
    return isRTL ? `${number.toLocaleString()} ر.س` : `$${number.toLocaleString()}`;
  };

  // Get profit/loss color
  const getProfitLossColor = (amount) => {
    const value = parseFloat(amount) || 0;
    if (value > 0) return '#27AE60'; // Green for profit
    if (value < 0) return '#E74C3C'; // Red for loss
    return '#95A5A6'; // Gray for break-even
  };

  // Render financial overview cards
  const renderOverviewCards = () => {
    if (!reportData) return null;

    const cards = [
      {
        title: translate('totalIncome'),
        value: formatCurrency(reportData.total_income),
        icon: 'trending-up',
        color: '#27AE60',
        bgColor: 'rgba(39, 174, 96, 0.1)',
      },
      {
        title: translate('totalExpenses'),
        value: formatCurrency(reportData.total_expenses),
        icon: 'trending-down',
        color: '#E74C3C',
        bgColor: 'rgba(231, 76, 60, 0.1)',
      },
      {
        title: translate('netProfitLoss'),
        value: formatCurrency(reportData.net_profit_or_loss),
        icon: parseFloat(reportData.net_profit_or_loss) >= 0 ? 'checkmark-circle' : 'close-circle',
        color: getProfitLossColor(reportData.net_profit_or_loss),
        bgColor: `${getProfitLossColor(reportData.net_profit_or_loss)}20`,
      },
      {
        title: translate('totalPurchases'),
        value: formatCurrency(reportData.total_purchase),
        icon: 'bag',
        color: '#3498DB',
        bgColor: 'rgba(52, 152, 219, 0.1)',
      },
    ];

    return (
      <View style={styles.overviewContainer}>
        {cards.map((card, index) => (
          <View key={index} style={[styles.overviewCard, { backgroundColor: card.bgColor }]}>
            <View style={[styles.cardIcon, { backgroundColor: card.color }]}>
              <Ionicons name={card.icon} size={20} color="#fff" />
            </View>
            <Text style={[styles.cardValue, isRTL && commonStyles.arabicText]}>
              {card.value}
            </Text>
            <Text style={[styles.cardTitle, isRTL && commonStyles.arabicText]}>
              {card.title}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  // Render cash flow chart
  const renderCashFlowChart = () => {
    if (!reportData || !reportData.cash_flow_summary) return null;

    const cashFlow = reportData.cash_flow_summary;
    const chartData = {
      labels: [translate('income'), translate('expenses'), translate('purchases'), translate('spent')],
      datasets: [{
        data: [
          parseFloat(cashFlow.total_income) || 0,
          parseFloat(cashFlow.total_expenses) || 0,
          parseFloat(cashFlow.total_purchase) || 0,
          parseFloat(cashFlow.total_spent) || 0,
        ],
        colors: [
          () => '#27AE60',
          () => '#E74C3C',
          () => '#3498DB',
          () => '#F39C12',
        ]
      }]
    };

    return (
      <View style={commonStyles.card}>
        <Text style={[styles.chartTitle, isRTL && commonStyles.arabicText]}>
          {translate('cashFlowAnalysis')}
        </Text>
        <BarChart
          data={chartData}
          width={screenWidth - 60}
          height={220}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(107, 125, 61, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
            style: { borderRadius: 16 },
            propsForLabels: { fontSize: 10 },
          }}
          style={styles.chart}
          showValuesOnTopOfBars
        />
      </View>
    );
  };

  // Render profit vs loss breakdown
  const renderProfitLossBreakdown = () => {
    if (!reportData) return null;

    const netProfit = parseFloat(reportData.net_profit_or_loss) || 0;
    const productProfit = parseFloat(reportData.product_based_profit_or_loss) || 0;

    return (
      <View style={commonStyles.card}>
        <Text style={[styles.chartTitle, isRTL && commonStyles.arabicText]}>
          {translate('profitLossBreakdown')}
        </Text>
        
        <View style={styles.profitBreakdownContainer}>
          <View style={styles.profitItem}>
            <View style={[styles.profitIconContainer, { backgroundColor: 'rgba(39, 174, 96, 0.1)' }]}>
              <Ionicons name="trending-up" size={24} color="#27AE60" />
            </View>
            <View style={styles.profitInfo}>
              <Text style={[styles.profitLabel, isRTL && commonStyles.arabicText]}>
                {translate('netProfitLoss')}
              </Text>
              <Text style={[
                styles.profitValue, 
                { color: getProfitLossColor(netProfit) }, 
                isRTL && commonStyles.arabicText
              ]}>
                {formatCurrency(netProfit)}
              </Text>
            </View>
          </View>

          <View style={styles.profitItem}>
            <View style={[styles.profitIconContainer, { backgroundColor: 'rgba(52, 152, 219, 0.1)' }]}>
              <Ionicons name="cube" size={24} color="#3498DB" />
            </View>
            <View style={styles.profitInfo}>
              <Text style={[styles.profitLabel, isRTL && commonStyles.arabicText]}>
                {translate('productBasedProfit')}
              </Text>
              <Text style={[
                styles.profitValue, 
                { color: getProfitLossColor(productProfit) }, 
                isRTL && commonStyles.arabicText
              ]}>
                {formatCurrency(productProfit)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  // Render outstanding amounts
  const renderOutstandingAmounts = () => {
    if (!reportData) return null;

    const receivables = parseFloat(reportData.outstanding_receivables) || 0;
    const payables = parseFloat(reportData.outstanding_payables) || 0;
    
    if (receivables === 0 && payables === 0) return null;

    const outstandingData = [
      receivables > 0 && {
        name: translate('receivables'),
        population: receivables,
        color: '#27AE60',
        legendFontColor: '#333',
        legendFontSize: 12,
      },
      payables > 0 && {
        name: translate('payables'),
        population: payables,
        color: '#E74C3C',
        legendFontColor: '#333',
        legendFontSize: 12,
      },
    ].filter(Boolean);

    return (
      <View style={commonStyles.card}>
        <Text style={[styles.chartTitle, isRTL && commonStyles.arabicText]}>
          {translate('outstandingAmounts')}
        </Text>
        <PieChart
          data={outstandingData}
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

  // Render pending transactions summary
  const renderPendingTransactions = () => {
    if (!reportData) return null;

    const pendingIncome = parseFloat(reportData.pending_incomes) || 0;
    const pendingPurchases = parseFloat(reportData.pending_purchases) || 0;

    if (pendingIncome === 0 && pendingPurchases === 0) return null;

    return (
      <View style={commonStyles.card}>
        <Text style={[styles.chartTitle, isRTL && commonStyles.arabicText]}>
          {translate('pendingTransactions')}
        </Text>
        
        <View style={styles.pendingContainer}>
          {pendingIncome > 0 && (
            <View style={[styles.pendingItem, { backgroundColor: 'rgba(39, 174, 96, 0.1)' }]}>
              <Ionicons name="hourglass" size={20} color="#27AE60" />
              <View style={styles.pendingInfo}>
                <Text style={[styles.pendingLabel, isRTL && commonStyles.arabicText]}>
                  {translate('pendingIncome')}
                </Text>
                <Text style={[styles.pendingValue, isRTL && commonStyles.arabicText]}>
                  {formatCurrency(pendingIncome)}
                </Text>
              </View>
            </View>
          )}

          {pendingPurchases > 0 && (
            <View style={[styles.pendingItem, { backgroundColor: 'rgba(231, 76, 60, 0.1)' }]}>
              <Ionicons name="hourglass" size={20} color="#E74C3C" />
              <View style={styles.pendingInfo}>
                <Text style={[styles.pendingLabel, isRTL && commonStyles.arabicText]}>
                  {translate('pendingPurchases')}
                </Text>
                <Text style={[styles.pendingValue, isRTL && commonStyles.arabicText]}>
                  {formatCurrency(pendingPurchases)}
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
    );
  };

  // Render filter button
  const renderFilterButton = () => (
    <TouchableOpacity
      style={styles.filterButton}
      onPress={() => navigation.navigate('FinancialSummaryFilters', { 
        filters, 
        onFiltersChange: (newFilters) => {
          setFilters(newFilters);
          setTimeout(() => {
            fetchFinancialSummary(newFilters);
          }, 100);
        }
      })}
    >
      <Ionicons name="calendar" size={20} color="#fff" />
      <Text style={[styles.filterButtonText, isRTL && commonStyles.arabicText]}>
        {translate('dateRange')}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={commonStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B7D3D" />
        <Text style={[commonStyles.loadingText, isRTL && commonStyles.arabicText]}>
          {translate('loadingFinancialSummary')}
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
                {translate('financialSummary')}
              </Text>
              <Text style={[commonStyles.headerSubtitle, isRTL && commonStyles.arabicText]}>
                {translate('comprehensiveFinancialOverview')}
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
        {reportData ? (
          <>
            {/* Financial Overview Cards */}
            {renderOverviewCards()}

            {/* Cash Flow Analysis Chart */}
            {renderCashFlowChart()}

            {/* Profit/Loss Breakdown */}
            {renderProfitLossBreakdown()}

            {/* Outstanding Amounts */}
            {renderOutstandingAmounts()}

            {/* Pending Transactions */}
            {renderPendingTransactions()}
          </>
        ) : (
          <View style={commonStyles.emptyContainer}>
            <Ionicons name="analytics-outline" size={64} color="#ccc" />
            <Text style={[commonStyles.emptyText, isRTL && commonStyles.arabicText]}>
              {translate('noFinancialData')}
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

  // Overview Cards
  overviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    paddingVertical: 15,
    justifyContent: 'space-between',
  },
  
  overviewCard: {
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
  
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  
  cardValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
  },
  
  cardTitle: {
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

  // Profit/Loss Breakdown
  profitBreakdownContainer: {
    paddingVertical: 10,
  },

  profitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  profitIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },

  profitInfo: {
    flex: 1,
  },

  profitLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },

  profitValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  // Pending Transactions
  pendingContainer: {
    paddingVertical: 10,
    gap: 15,
  },

  pendingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    gap: 12,
  },

  pendingInfo: {
    flex: 1,
  },

  pendingLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },

  pendingValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default FinancialSummaryScreen;