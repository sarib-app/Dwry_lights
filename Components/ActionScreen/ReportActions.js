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

const { width } = Dimensions.get('window');

const ReportsDashboardScreen = ({ navigation }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isRTL, setIsRTL] = useState(false);
  const [roleId, setRoleId] = useState(null);

  // Initialize language and role
  useEffect(() => {
    const loadLanguage = async () => {
      const lang = await languageService.loadSavedLanguage();
      setCurrentLanguage(lang);
      setIsRTL(lang === 'ar');
    };

    const checkUserRole = async () => {
      const role = await getUserRole();
      setRoleId(role);
    };

    loadLanguage();
    checkUserRole();

    const unsubscribe = languageService.addListener(() => {
      loadLanguage();
    });

    return () => unsubscribe();
  }, []);

  const translate = (key) => languageService.translate(key);

  // All report items
  const allReportItems = [
    { id: 1, titleKey: 'salesReport', icon: 'bar-chart', color: '#3498DB', category: 'sales' },
    { id: 2, titleKey: 'customerReport', icon: 'people', color: '#9B59B6', category: 'customer' },
    { id: 3, titleKey: 'inventoryStats', icon: 'cube', color: '#E74C3C', category: 'inventory' },
    { id: 4, titleKey: 'financialSummary', icon: 'wallet', color: '#27AE60', category: 'financial' },
    { id: 5, titleKey: 'setSalesTarget', icon: 'target', color: '#F39C12', category: 'targets' },
    { id: 6, titleKey: 'salesTargetReport', icon: 'document-text', color: '#1ABC9C', category: 'targets' },
    { id: 7, titleKey: 'recordVisit', icon: 'location', color: '#D35400', category: 'visits' },
    { id: 8, titleKey: 'visitReport', icon: 'map', color: '#16A085', category: 'visits' },
  ];

  // Staff-only report items (role ID 3)
  const staffReportItems = [
    { id: 7, titleKey: 'recordVisit', icon: 'location', color: '#D35400', category: 'visits' },
    { id: 8, titleKey: 'visitReport', icon: 'map', color: '#16A085', category: 'visits' },
  ];

  // Get report items based on role
  const getReportItemsForRole = () => {
    if (roleId === 3) {
      return staffReportItems;
    }
    return allReportItems;
  };

  const reportItems = getReportItemsForRole();

  const allCategories = [
    { key: 'sales', titleKey: 'salesReports', icon: 'trending-up' },
    { key: 'customer', titleKey: 'customerReports', icon: 'people' },
    { key: 'inventory', titleKey: 'inventoryReports', icon: 'cube' },
    { key: 'financial', titleKey: 'financialReports', icon: 'wallet' },
    { key: 'targets', titleKey: 'salesTargets', icon: 'target' },
    { key: 'visits', titleKey: 'customerVisits', icon: 'location' },
  ];

  // Get categories that have items for current role
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
    const screenName = translate(titleKey).replace(/\s+/g, '');
    navigation.navigate(titleKey);
  };

  const renderReportCard = (item) => (
    <TouchableOpacity
      key={item.id}
      style={[
        styles.actionCard,
        roleId === 3 && styles.staffActionCard // Special styling for staff
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
    
    // Don't render category if no items
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
              <Text style={styles.staffBadgeText}>Staff Access</Text>
            </View>
          )}
        </View>
        <View style={[
          styles.actionsGrid,
          roleId === 3 && styles.staffActionsGrid // Center items for staff
        ]}>
          {categoryItems.map(renderReportCard)}
        </View>
      </View>
    );
  };

  // Get header subtitle based on role
  const getHeaderSubtitle = () => {
    if (roleId === 3) {
      return translate('staffReportsAccess') || 'Staff Reports - Limited Access';
    }
    return translate('businessAnalytics');
  };

  // Show loading state if role is not determined yet
  if (roleId === null) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
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
            <Text style={styles.headerSubtitle}>{getHeaderSubtitle()}</Text>
            {roleId === 3 && (
              <View style={styles.roleIndicator}>
                <Ionicons name="person-circle" size={16} color="#fff" />
                <Text style={styles.roleText}>Staff Member</Text>
              </View>
            )}
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

        {/* Staff Welcome Message */}
        {roleId === 3 && reportItems.length > 0 && (
          <View style={styles.staffWelcomeCard}>
            <View style={styles.staffWelcomeHeader}>
              <Ionicons name="information-circle" size={24} color="#D35400" />
              <Text style={styles.staffWelcomeTitle}>Staff Dashboard</Text>
            </View>
            <Text style={styles.staffWelcomeText}>
              You have access to visit management features. Record customer visits and view visit reports to track your field activities.
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
  roleIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  roleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
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
    width: (width - 65) / 2, // Slightly smaller for staff
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