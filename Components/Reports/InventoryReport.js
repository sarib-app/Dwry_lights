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
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BarChart, PieChart } from 'react-native-chart-kit';
import languageService from '../Globals/Store/Lang';
import getAuthToken from '../Globals/Store/LocalData';
import commonStyles from '../Globals/CommonStyles';

const API_BASE_URL = 'https://planetdory.dwrylight.com/api';
const { width: screenWidth } = Dimensions.get('window');

const InventoryReportScreen = ({ navigation }) => {
  // State management
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isRTL, setIsRTL] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Filter states
  const [filters, setFilters] = useState({
    low_stock_threshold: 1000,
    item_id: null,
  });

  const translate = (key) => languageService.translate(key);

  useEffect(() => {
    initializeScreen();
  }, []);

  const initializeScreen = async () => {
    const language = await languageService.loadSavedLanguage();
    setCurrentLanguage(language);
    setIsRTL(language === 'ar');
    
    // Auto-fetch all inventory data
    fetchInventoryReport();
  };

  // Fetch inventory report data
  const fetchInventoryReport = async () => {
    const token = await getAuthToken();
    if (!token) {
      Alert.alert(translate('error'), translate('authTokenNotFound'));
      return;
    }

    setLoading(true);
    try {
      const payload = {
        low_stock_threshold: filters.low_stock_threshold,
      };

      // Add item filter if selected
      if (filters.item_id) {
        payload.item_id = filters.item_id;
      }

      const response = await fetch(`${API_BASE_URL}/inventory_report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        body: JSON.stringify(payload),
      });
      
      const result = await response.json();
      console.log('Inventory Report API Response:', result);
      
      if (result.status === 200) {
        setReportData(result.data.report || []);
      } else {
        Alert.alert(translate('error'), result.message || translate('failedToFetchInventoryReport'));
      }
    } catch (error) {
      console.error('Fetch inventory report error:', error);
      Alert.alert(translate('error'), translate('networkErrorFetchingInventoryReport'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchInventoryReport();
  }, [filters]);

  // Format currency
  const formatCurrency = (amount) => {
    const number = parseFloat(amount) || 0;
    return isRTL ? `${number.toLocaleString()} ر.س` : `$${number.toLocaleString()}`;
  };

  // Calculate summary stats
  const calculateStats = () => {
    if (!reportData.length) return null;

    return reportData.reduce((stats, item) => {
      stats.totalItems += 1;
      stats.totalValue += parseFloat(item.inventory_value) || 0;
      stats.totalStockLevel += parseInt(item.current_stock_level) || 0;
      stats.totalSoldQuantity += parseInt(item.total_sold_quantity) || 0;
      
      if (item.low_stock_alert) {
        stats.lowStockItems += 1;
      }
      
      if (item.reorder_suggestion === 'Reorder recommended') {
        stats.reorderItems += 1;
      }
      
      return stats;
    }, { 
      totalItems: 0,
      totalValue: 0,
      totalStockLevel: 0,
      totalSoldQuantity: 0,
      lowStockItems: 0,
      reorderItems: 0
    });
  };

  // Render stats cards in grid
  const renderStatsCards = () => {
    const stats = calculateStats();
    if (!stats) return null;

    const statsArray = [
      {
        title: translate('totalItems'),
        value: stats.totalItems.toString(),
        icon: 'cube',
        color: '#6B7D3D',
        bgColor: 'rgba(107, 125, 61, 0.1)',
      },
      {
        title: translate('totalValue'),
        value: formatCurrency(stats.totalValue),
        icon: 'cash',
        color: '#27AE60',
        bgColor: 'rgba(39, 174, 96, 0.1)',
      },
      {
        title: translate('lowStockItems'),
        value: stats.lowStockItems.toString(),
        icon: 'warning',
        color: '#E74C3C',
        bgColor: 'rgba(231, 76, 60, 0.1)',
      },
      {
        title: translate('reorderNeeded'),
        value: stats.reorderItems.toString(),
        icon: 'refresh-circle',
        color: '#F39C12',
        bgColor: 'rgba(243, 156, 18, 0.1)',
      },
    ];

    return (
      <View style={styles.statsContainer}>
        {statsArray.map((stat, index) => (
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

  // Render inventory value chart
  const renderInventoryChart = () => {
    if (!reportData.length) return null;

    // Get top 5 items by value for chart
    const topItems = [...reportData]
      .sort((a, b) => parseFloat(b.inventory_value) - parseFloat(a.inventory_value))
      .slice(0, 5);

    const chartData = {
      labels: topItems.map(item => item.name.length > 8 ? `${item.name.substring(0, 8)}...` : item.name),
      datasets: [{
        data: topItems.map(item => parseFloat(item.inventory_value) || 0)
      }]
    };

    return (
      <View style={commonStyles.card}>
        <Text style={[styles.chartTitle, isRTL && commonStyles.arabicText]}>
          {translate('topItemsByValue')}
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
            propsForLabels: { fontSize: 10 },
          }}
          style={styles.chart}
          showValuesOnTopOfBars
        />
      </View>
    );
  };

  // Render stock status summary
  const renderStockStatusChart = () => {
    if (!reportData.length) return null;

    const lowStockCount = reportData.filter(item => item.low_stock_alert).length;
    const normalStockCount = reportData.length - lowStockCount;
    
    if (normalStockCount === 0 && lowStockCount === 0) return null;

    const stockData = [
      {
        name: translate('normalStock'),
        population: normalStockCount,
        color: '#27AE60',
        legendFontColor: '#333',
        legendFontSize: 12,
      },
      {
        name: translate('lowStock'),
        population: lowStockCount,
        color: '#E74C3C',
        legendFontColor: '#333',
        legendFontSize: 12,
      },
    ].filter(item => item.population > 0);

    return (
      <View style={commonStyles.card}>
        <Text style={[styles.chartTitle, isRTL && commonStyles.arabicText]}>
          {translate('stockStatusOverview')}
        </Text>
        <PieChart
          data={stockData}
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

  // Get stock status color and icon
  const getStockStatus = (item) => {
    if (item.low_stock_alert) {
      return {
        color: '#E74C3C',
        bgColor: 'rgba(231, 76, 60, 0.1)',
        icon: 'warning',
        text: translate('lowStock')
      };
    }
    return {
      color: '#27AE60',
      bgColor: 'rgba(39, 174, 96, 0.1)',
      icon: 'checkmark-circle',
      text: translate('normalStock')
    };
  };

  // Render inventory item card
  const renderInventoryItem = ({ item }) => {
    const stockStatus = getStockStatus(item);
    
    return (
      <View style={[styles.itemCard, isRTL && styles.rtlItemCard]}>
        {/* Item Header */}
        <View style={[styles.itemHeader, isRTL && styles.rtlItemHeader]}>
          <View style={styles.itemInfo}>
            <Text style={[styles.itemName, isRTL && commonStyles.arabicText]}>
              {item.name}
            </Text>
            <Text style={[styles.itemId, isRTL && commonStyles.arabicText]}>
              {translate('itemId')}: {item.item_id}
            </Text>
          </View>
          
          <View style={[styles.stockBadge, { backgroundColor: stockStatus.bgColor }]}>
            <Ionicons name={stockStatus.icon} size={16} color={stockStatus.color} />
            <Text style={[styles.stockBadgeText, { color: stockStatus.color }, isRTL && commonStyles.arabicText]}>
              {stockStatus.text}
            </Text>
          </View>
        </View>

        {/* Item Details */}
        <View style={styles.itemDetails}>
          <View style={[styles.detailRow, isRTL && styles.rtlDetailRow]}>
            <View style={styles.detailItem}>
              <Ionicons name="cube" size={16} color="#666" />
              <Text style={[styles.detailLabel, isRTL && commonStyles.arabicText]}>
                {translate('currentStock')}
              </Text>
              <Text style={[styles.detailValue, isRTL && commonStyles.arabicText]}>
                {item.current_stock_level}
              </Text>
            </View>
            
            <View style={styles.detailItem}>
              <Ionicons name="pricetag" size={16} color="#666" />
              <Text style={[styles.detailLabel, isRTL && commonStyles.arabicText]}>
                {translate('inventoryValue')}
              </Text>
              <Text style={[styles.detailValue, isRTL && commonStyles.arabicText]}>
                {formatCurrency(item.inventory_value)}
              </Text>
            </View>
          </View>

          <View style={[styles.detailRow, isRTL && styles.rtlDetailRow]}>
            <View style={styles.detailItem}>
              <Ionicons name="trending-down" size={16} color="#666" />
              <Text style={[styles.detailLabel, isRTL && commonStyles.arabicText]}>
                {translate('availableQty')}
              </Text>
              <Text style={[styles.detailValue, isRTL && commonStyles.arabicText]}>
                {item.available_quantity}
              </Text>
            </View>
            
            <View style={styles.detailItem}>
              <Ionicons name="trending-up" size={16} color="#666" />
              <Text style={[styles.detailLabel, isRTL && commonStyles.arabicText]}>
                {translate('soldQty')}
              </Text>
              <Text style={[styles.detailValue, isRTL && commonStyles.arabicText]}>
                {item.total_sold_quantity}
              </Text>
            </View>
          </View>
        </View>

        {/* Reorder Suggestion */}
        {item.reorder_suggestion === 'Reorder recommended' && (
          <View style={styles.reorderAlert}>
            <Ionicons name="alert-circle" size={20} color="#F39C12" />
            <Text style={[styles.reorderText, isRTL && commonStyles.arabicText]}>
              {translate('reorderRecommended')}
            </Text>
          </View>
        )}
      </View>
    );
  };

  // Render filter button
  const renderFilterButton = () => (
    <TouchableOpacity
      style={styles.filterButton}
      onPress={() => navigation.navigate('InventoryReportFilters', { 
        filters, 
        onFiltersChange: (newFilters) => {
          setFilters(newFilters);
          setTimeout(() => {
            fetchInventoryReport();
          }, 100);
        }
      })}
    >
      <Ionicons name="options" size={20} color="#fff" />
      <Text style={[styles.filterButtonText, isRTL && commonStyles.arabicText]}>
        {translate('filters')}
      </Text>
    </TouchableOpacity>
  );

  // Render empty state
  const renderEmptyState = () => (
    <View style={commonStyles.emptyContainer}>
      <Ionicons name="cube-outline" size={64} color="#ccc" />
      <Text style={[commonStyles.emptyText, isRTL && commonStyles.arabicText]}>
        {translate('noInventoryData')}
      </Text>
      <Text style={[commonStyles.emptySubtext, isRTL && commonStyles.arabicText]}>
        {translate('adjustFiltersOrAddItems')}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={commonStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B7D3D" />
        <Text style={[commonStyles.loadingText, isRTL && commonStyles.arabicText]}>
          {translate('loadingInventoryReport')}
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
                {translate('inventoryReport')}
              </Text>
              <Text style={[commonStyles.headerSubtitle, isRTL && commonStyles.arabicText]}>
                {reportData.length} {translate('itemsTracked')}
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
        {reportData.length > 0 ? (
          <>
            {/* Stats Cards */}
            {renderStatsCards()}

            {/* Inventory Value Chart */}
            {renderInventoryChart()}

            {/* Stock Status Chart */}
            {renderStockStatusChart()}

            {/* Inventory Items List */}
            <View style={commonStyles.card}>
              <View style={[styles.listHeader, isRTL && styles.rtlListHeader]}>
                <Text style={[styles.chartTitle, isRTL && commonStyles.arabicText]}>
                  {translate('inventoryItems')}
                </Text>
                <Text style={[styles.itemCount, isRTL && commonStyles.arabicText]}>
                  {reportData.length} {translate('items')}
                </Text>
              </View>
              
              <FlatList
                data={reportData}
                renderItem={renderInventoryItem}
                keyExtractor={(item) => item.item_id.toString()}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
              />
            </View>
          </>
        ) : (
          renderEmptyState()
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

  // List Header
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  rtlListHeader: {
    flexDirection: 'row-reverse',
  },

  itemCount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },

  separator: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 10,
  },

  // Inventory Item Card
  itemCard: {
    backgroundColor: '#f8fafb',
    borderRadius: 12,
    padding: 15,
    marginBottom: 0,
  },

  rtlItemCard: {
    alignItems: 'flex-end',
  },

  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },

  rtlItemHeader: {
    flexDirection: 'row-reverse',
  },

  itemInfo: {
    flex: 1,
  },

  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },

  itemId: {
    fontSize: 12,
    color: '#666',
  },

  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
    gap: 4,
  },

  stockBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Item Details
  itemDetails: {
    marginBottom: 10,
  },

  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  rtlDetailRow: {
    flexDirection: 'row-reverse',
  },

  detailItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  detailLabel: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },

  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },

  // Reorder Alert
  reorderAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(243, 156, 18, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },

  reorderText: {
    fontSize: 12,
    color: '#F39C12',
    fontWeight: '600',
  },
});

export default InventoryReportScreen;