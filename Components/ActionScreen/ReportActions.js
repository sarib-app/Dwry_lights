import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import languageService from '../Globals/Store/Lang';
import getUserRole from '../Globals/Store/GetRoleId';
// import simplePermissions from '../Globals/Store/SimplePermissions';
import simplePermissions from '../Globals/Store/PermissionsDemo';

const { width } = Dimensions.get('window');

const ReportsDashboardScreen = ({ navigation }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isRTL, setIsRTL] = useState(false);
  const [roleId, setRoleId] = useState(null);
  const [userPermissions, setUserPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initialize language and role
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Load language
        const lang = await languageService.loadSavedLanguage();
        setCurrentLanguage(lang);
        setIsRTL(lang === 'ar');

        // Get user role
        const role = await getUserRole();
        setRoleId(role);

        // Fetch user permissions
        const permissions = await simplePermissions.fetchUserPermissions();
        setUserPermissions(permissions);
      } catch (error) {
        console.error('Error initializing data:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeData();

    const unsubscribe = languageService.addListener(() => {
      const loadLanguage = async () => {
        const lang = await languageService.loadSavedLanguage();
        setCurrentLanguage(lang);
        setIsRTL(lang === 'ar');
      };
      loadLanguage();
    });

    return () => unsubscribe();
  }, []);

  const translate = (key) => languageService.translate(key);

  // All report items with their module names
  const allReportItems = [
    { id: 1, titleKey: 'salesReport', module: 'sales_report', icon: 'bar-chart', color: '#3498DB', category: 'sales' },
    { id: 2, titleKey: 'customerReport', module: 'customer_report', icon: 'people', color: '#9B59B6', category: 'customer' },
    { id: 3, titleKey: 'inventoryStats', module: 'inventory_stats', icon: 'cube', color: '#E74C3C', category: 'inventory' },
    { id: 4, titleKey: 'financialSummary', module: 'financial_summary', icon: 'wallet', color: '#27AE60', category: 'financial' },
    { id: 5, titleKey: 'setSalesTarget', module: 'set_sales_target', icon: 'target', color: '#F39C12', category: 'targets' },
    { id: 6, titleKey: 'salesTargetReport', module: 'sales_target_report', icon: 'document-text', color: '#1ABC9C', category: 'targets' },
    { id: 7, titleKey: 'recordVisit', module: 'record_visit', icon: 'location', color: '#D35400', category: 'visits' },
    { id: 8, titleKey: 'visitReport', module: 'visit_report', icon: 'map', color: '#16A085', category: 'visits' },
  ];

  // Filter report items based on permissions
  const getVisibleReportItems = () => {
    // If not role 3 (admin), show all items
    if (roleId !== 3) {
      return allReportItems;
    }
    
    // For role 3 (staff), filter by permissions
    return allReportItems.filter(item => {
      // Check if user has module access permission (e.g., "sales_report.management")
      return simplePermissions.hasModuleAccess(item.module);
    });
  };

  const reportItems = getVisibleReportItems();

  const allCategories = [
    { key: 'sales', titleKey: 'salesReports', icon: 'trending-up' },
    { key: 'customer', titleKey: 'customerReports', icon: 'people' },
    { key: 'inventory', titleKey: 'inventoryReports', icon: 'cube' },
    { key: 'financial', titleKey: 'financialReports', icon: 'wallet' },
    { key: 'targets', titleKey: 'salesTargets', icon: 'target' },
    { key: 'visits', titleKey: 'customerVisits', icon: 'location' },
  ];

  // Get categories that have visible items
  const getVisibleCategories = () => {
    const visibleCategories = [];
    
    allCategories.forEach(category => {
      const hasItems = reportItems.some(item => item.category === category.key);
      if (hasItems) {
        visibleCategories.push(category);
      }
    });
    
    return visibleCategories;
  };

  const categories = getVisibleCategories();

  const handleReportPress = (titleKey) => {
    navigation.navigate(titleKey);
  };

  const renderReportCard = (item) => (
    <TouchableOpacity
      key={item.id}
      style={[
        styles.actionCard,
        roleId === 3 && styles.staffActionCard
      ]}
      onPress={() => handleReportPress(item.titleKey)}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={[item.color, `${item.color}90`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradient}
      >
        <View style={styles.cardContent}>
          <View style={styles.iconContainer}>
            <Ionicons name={item.icon} size={28} color="#fff" />
          </View>
          <Text style={styles.cardTitle}>{translate(item.titleKey)}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderCategory = (category) => {
    const categoryItems = reportItems.filter(item => item.category === category.key);
    
    if (categoryItems.length === 0) {
      return null;
    }
    
    return (
      <View key={category.key} style={styles.categorySection}>
        <View style={styles.categoryHeader}>
          <Ionicons name={category.icon} size={20} color="#6B7D3D" />
          <Text style={styles.categoryTitle}>
            {translate(category.titleKey)}
          </Text>
          {roleId === 3 && (
            <View style={styles.staffBadge}>
              <Text style={styles.staffBadgeText}>Permission Based</Text>
            </View>
          )}
        </View>
        <View style={[
          styles.actionsGrid,
          roleId === 3 && styles.staffActionsGrid
        ]}>
          {categoryItems.map(renderReportCard)}
        </View>
      </View>
    );
  };

  // Show loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading permissions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={roleId === 3 ? ['#D35400', '#E67E22'] : ['#6B7D3D', '#4A5D23']}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>{translate('reportsDashboard')}</Text>
            <Text style={styles.headerSubtitle}>
              {roleId !== 3 
                ? 'Admin - Full Access to All Reports'
                : reportItems.length > 0 
                  ? `${reportItems.length} reports available` 
                  : 'No report permissions assigned'
              }
            </Text>
          </View>
        </LinearGradient>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.length > 0 ? (
          categories.map(renderCategory)
        ) : (
          <View style={styles.noAccessContainer}>
            <Ionicons name="lock-closed" size={64} color="#ccc" />
            <Text style={styles.noAccessText}>No reports available</Text>
            <Text style={styles.noAccessSubtext}>
              Contact your administrator for access
            </Text>
          </View>
        )}

        {/* Welcome Message */}
        {reportItems.length > 0 && (
          <View style={styles.staffWelcomeCard}>
            <View style={styles.staffWelcomeHeader}>
              <Ionicons name="information-circle" size={24} color="#D35400" />
              {/* <Text style={styles.staffWelcomeTitle">Reports Dashboard</Text> */}
              <Text  style={styles.staffWelcomeTitle}>
                Reports Dashboard
              </Text>
            </View>
            <Text style={styles.staffWelcomeText}>
              You have access to {reportItems.length} report modules based on your assigned permissions.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    marginBottom: 20,
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingVertical: 25,
    paddingTop: 40,
  },
  headerContent: {
    // Additional styling for header content
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  categorySection: {
    marginBottom: 30,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
    flex: 1,
  },
  staffBadge: {
    backgroundColor: '#D35400',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  staffBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  staffActionsGrid: {
    justifyContent: 'flex-start',
  },
  actionCard: {
    width: (width - 50) / 2,
    height: 120,
    marginBottom: 15,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  staffActionCard: {
    width: (width - 65) / 2,
    marginHorizontal: 5,
  },
  cardGradient: {
    flex: 1,
    borderRadius: 16,
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  noAccessContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  noAccessText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 20,
    marginBottom: 8,
  },
  noAccessSubtext: {
    fontSize: 14,
    color: '#bbb',
    textAlign: 'center',
  },
  staffWelcomeCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginTop: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#D35400',
  },
  staffWelcomeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  staffWelcomeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  staffWelcomeText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default ReportsDashboardScreen;