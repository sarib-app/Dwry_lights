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

const { width } = Dimensions.get('window');

const ReportsDashboardScreen = ({ navigation }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isRTL, setIsRTL] = useState(false);

  // Initialize language and set up listener
  useEffect(() => {
    const loadLanguage = async () => {
      const lang = await languageService.loadSavedLanguage();
      setCurrentLanguage(lang);
      setIsRTL(lang === 'ar');
    };

    loadLanguage();

    const unsubscribe = languageService.addListener(() => {
      loadLanguage();
    });

    return () => unsubscribe();
  }, []);

  const translate = (key) => languageService.translate(key);

  // Report items with translation KEYS (not text)
  const reportItems = [
    { id: 1, titleKey: 'salesReport', icon: 'bar-chart', color: '#3498DB', category: 'sales' },
    { id: 2, titleKey: 'customerReport', icon: 'people', color: '#9B59B6', category: 'customer' },
    { id: 3, titleKey: 'inventoryStats', icon: 'cube', color: '#E74C3C', category: 'inventory' },
    { id: 4, titleKey: 'financialSummary', icon: 'wallet', color: '#27AE60', category: 'financial' },
    { id: 5, titleKey: 'setSalesTarget', icon: 'target', color: '#F39C12', category: 'targets' },
    { id: 6, titleKey: 'salesTargetReport', icon: 'document-text', color: '#1ABC9C', category: 'targets' },
    { id: 7, titleKey: 'recordVisit', icon: 'location', color: '#D35400', category: 'visits' },
    { id: 8, titleKey: 'visitReport', icon: 'map', color: '#16A085', category: 'visits' },
  ];

  const categories = [
    { key: 'sales', titleKey: 'salesReports', icon: 'trending-up' },
    { key: 'customer', titleKey: 'customerReports', icon: 'people' },
    { key: 'inventory', titleKey: 'inventoryReports', icon: 'cube' },
    { key: 'financial', titleKey: 'financialReports', icon: 'wallet' },
    { key: 'targets', titleKey: 'salesTargets', icon: 'target' },
    { key: 'visits', titleKey: 'customerVisits', icon: 'location' },
  ];

  const handleReportPress = (titleKey) => {
    const screenName = translate(titleKey).replace(/\s+/g, '');
    navigation.navigate(titleKey);
  };

  const renderReportCard = (item) => (
    <TouchableOpacity
      key={item.id}
      style={styles.actionCard}
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
    
    return (
      <View key={category.key} style={styles.categorySection}>
        <View style={styles.categoryHeader}>
          <Ionicons name={category.icon} size={20} color="#6B7D3D" />
          <Text style={styles.categoryTitle}>{translate(category.titleKey)}</Text>
        </View>
        <View style={styles.actionsGrid}>
          {categoryItems.map(renderReportCard)}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={['#6B7D3D', '#4A5D23']}
          style={styles.headerGradient}
        >
          <Text style={styles.headerTitle}>{translate('reportsDashboard')}</Text>
          <Text style={styles.headerSubtitle}>{translate('businessAnalytics')}</Text>
        </LinearGradient>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map(renderCategory)}
      </ScrollView>
    </SafeAreaView>
  );
};

// Keep your existing styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafb',
  },
  header: {
    marginBottom: 20,
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingVertical: 25,
    paddingTop: 40,
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
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
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
});

export default ReportsDashboardScreen;  