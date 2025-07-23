import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import languageService from '../Globals/Store/Lang';
import commonStyles from '../Globals/CommonStyles';

const VisitHistoryFiltersScreen = ({ navigation, route }) => {
  const { filters: initialFilters, onFiltersChange } = route.params || {};
  
  const [filters, setFilters] = useState(initialFilters || {
    date_from: '',
    date_to: '',
    staff_id: null,
    customer_id: null,
  });
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isRTL, setIsRTL] = useState(false);
  
  // Date picker states
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);

  const translate = (key) => languageService.translate(key);

  useEffect(() => {
    initializeScreen();
  }, []);

  const initializeScreen = async () => {
    const language = await languageService.loadSavedLanguage();
    setCurrentLanguage(language);
    setIsRTL(language === 'ar');
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US');
  };

  // Handle date change
  const handleDateChange = (event, selectedDate, type) => {
    if (type === 'from') {
      setShowFromDatePicker(false);
    } else {
      setShowToDatePicker(false);
    }
    
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setFilters(prev => ({
        ...prev,
        [type === 'from' ? 'date_from' : 'date_to']: formattedDate
      }));
    }
  };

  // Apply filters
  const applyFilters = () => {
    if (!filters.date_from || !filters.date_to) {
      Alert.alert(translate('error'), translate('dateRangeRequired'));
      return;
    }
    
    if (new Date(filters.date_from) > new Date(filters.date_to)) {
      Alert.alert(translate('error'), translate('invalidDateRange'));
      return;
    }

    if (onFiltersChange) {
      onFiltersChange(filters);
    }
    navigation.goBack();
  };

  // Reset to current month
  const resetToCurrentMonth = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const formatDate = (date) => date.toISOString().split('T')[0];
    
    setFilters(prev => ({
      ...prev,
      date_from: formatDate(firstDay),
      date_to: formatDate(lastDay)
    }));
  };

  // Render quick date filters
  const renderQuickFilters = () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay());
    
    const firstDayThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayThisMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const formatDateForFilter = (date) => date.toISOString().split('T')[0];

    const quickFilters = [
      {
        label: translate('today'),
        action: () => setFilters(prev => ({
          ...prev,
          date_from: formatDateForFilter(today),
          date_to: formatDateForFilter(today)
        }))
      },
      {
        label: translate('yesterday'),
        action: () => setFilters(prev => ({
          ...prev,
          date_from: formatDateForFilter(yesterday),
          date_to: formatDateForFilter(yesterday)
        }))
      },
      {
        label: translate('thisWeek'),
        action: () => setFilters(prev => ({
          ...prev,
          date_from: formatDateForFilter(thisWeekStart),
          date_to: formatDateForFilter(today)
        }))
      },
      {
        label: translate('thisMonth'),
        action: () => setFilters(prev => ({
          ...prev,
          date_from: formatDateForFilter(firstDayThisMonth),
          date_to: formatDateForFilter(lastDayThisMonth)
        }))
      },
    ];

    return (
      <View style={commonStyles.section}>
        <Text style={[styles.sectionTitle, isRTL && commonStyles.arabicText]}>
          {translate('quickFilters')}
        </Text>
        
        <View style={styles.quickFiltersContainer}>
          {quickFilters.map((filter, index) => (
            <TouchableOpacity
              key={index}
              style={styles.quickFilterButton}
              onPress={filter.action}
            >
              <Text style={[styles.quickFilterText, isRTL && commonStyles.arabicText]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  // Render date pickers section
  const renderDatePickers = () => (
    <View style={commonStyles.section}>
      <Text style={[styles.sectionTitle, isRTL && commonStyles.arabicText]}>
        {translate('customDateRange')}
      </Text>
      
      <View style={[styles.row, isRTL && styles.rtlRow]}>
        <View style={styles.halfWidth}>
          <Text style={[styles.label, isRTL && commonStyles.arabicText]}>
            {translate('fromDate')}
          </Text>
          <TouchableOpacity
            style={[styles.dateInput, isRTL && styles.rtlInput]}
            onPress={() => setShowFromDatePicker(true)}
          >
            <Text style={[styles.dateText, isRTL && commonStyles.arabicText]}>
              {formatDate(filters.date_from) || translate('selectDate')}
            </Text>
            <Ionicons name="calendar" size={20} color="#666" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.halfWidth}>
          <Text style={[styles.label, isRTL && commonStyles.arabicText]}>
            {translate('toDate')}
          </Text>
          <TouchableOpacity
            style={[styles.dateInput, isRTL && styles.rtlInput]}
            onPress={() => setShowToDatePicker(true)}
          >
            <Text style={[styles.dateText, isRTL && commonStyles.arabicText]}>
              {formatDate(filters.date_to) || translate('selectDate')}
            </Text>
            <Ionicons name="calendar" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Date Pickers */}
      {showFromDatePicker && (
        <DateTimePicker
          value={filters.date_from ? new Date(filters.date_from) : new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => handleDateChange(event, selectedDate, 'from')}
        />
      )}
      
      {showToDatePicker && (
        <DateTimePicker
          value={filters.date_to ? new Date(filters.date_to) : new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => handleDateChange(event, selectedDate, 'to')}
        />
      )}
    </View>
  );

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
                {translate('visitFilters')}
              </Text>
              <Text style={[commonStyles.headerSubtitle, isRTL && commonStyles.arabicText]}>
                {translate('selectDatePeriod')}
              </Text>
            </View>
            <TouchableOpacity
              style={commonStyles.addButton}
              onPress={resetToCurrentMonth}
            >
              <Ionicons name="refresh" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      <ScrollView style={commonStyles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Filters */}
        {renderQuickFilters()}

        {/* Date Range */}
        {renderDatePickers()}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.resetButton, isRTL && styles.rtlButton]}
            onPress={resetToCurrentMonth}
          >
            <Ionicons name="refresh-outline" size={16} color="#666" />
            <Text style={[styles.resetButtonText, isRTL && commonStyles.arabicText]}>
              {translate('resetToCurrentMonth')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.applyButton, isRTL && styles.rtlButton]}
            onPress={applyFilters}
          >
            <Ionicons name="checkmark" size={16} color="#fff" />
            <Text style={[styles.applyButtonText, isRTL && commonStyles.arabicText]}>
              {translate('applyFilters')}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={commonStyles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },

  // Quick Filters
  quickFiltersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  quickFilterButton: {
    backgroundColor: 'rgba(107, 125, 61, 0.1)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#6B7D3D',
  },

  quickFilterText: {
    fontSize: 14,
    color: '#6B7D3D',
    fontWeight: '500',
  },

  // Date Pickers
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },

  rtlRow: {
    flexDirection: 'row-reverse',
  },

  halfWidth: {
    flex: 1,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },

  dateInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9f9f9',
  },

  rtlInput: {
    flexDirection: 'row-reverse',
  },

  dateText: {
    fontSize: 16,
    color: '#333',
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 30,
    paddingHorizontal: 20,
  },

  rtlButton: {
    flexDirection: 'row-reverse',
  },

  resetButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    gap: 8,
  },

  resetButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },

  applyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 12,
    backgroundColor: '#6B7D3D',
    gap: 8,
  },

  applyButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});

export default VisitHistoryFiltersScreen;