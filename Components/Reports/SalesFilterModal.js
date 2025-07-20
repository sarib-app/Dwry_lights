import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import languageService from '../Globals/Store/Lang';
import commonStyles from '../Globals/CommonStyles';

const SalesReportFiltersScreen = ({ navigation, route }) => {
  const { filters: initialFilters, onFiltersChange, userRole, currentUser } = route.params;
  
  const [filters, setFilters] = useState(initialFilters);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isRTL, setIsRTL] = useState(false);
  
  // Date picker states
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
  
  // Modal states
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showTerritoryModal, setShowTerritoryModal] = useState(false);

  const translate = (key) => languageService.translate(key);

  useEffect(() => {
    initializeScreen();
  }, []);

  const initializeScreen = async () => {
    const language = await languageService.loadSavedLanguage();
    setCurrentLanguage(language);
    setIsRTL(language === 'ar');
  };

  // Status options
  const statusOptions = [
    { key: 'all', label: translate('allInvoices') },
    { key: 'paid', label: translate('paid') },
    { key: 'pending', label: translate('pending') },
    { key: 'overdue', label: translate('overdue') },
  ];

  // Territory options (static for now)
  const territoryOptions = [
    { key: '', label: translate('allTerritories') },
    { key: 'Eastern Region', label: isRTL ? 'المنطقة الشرقية' : 'Eastern Region' },
    { key: 'Western Region', label: isRTL ? 'المنطقة الغربية' : 'Western Region' },
    { key: 'Central Region', label: isRTL ? 'المنطقة الوسطى' : 'Central Region' },
    { key: 'Southern Region', label: isRTL ? 'المنطقة الجنوبية' : 'Southern Region' },
    { key: 'Northern Region', label: isRTL ? 'المنطقة الشمالية' : 'Northern Region' },
  ];

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

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      ...initialFilters,
      territory: '',
      status: 'paid',
      customer_id: null,
      staff_id: userRole === 3 ? currentUser?.id : null,
    });
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

    onFiltersChange(filters);
    navigation.goBack();
  };

  // Render date picker section
  const renderDatePickers = () => (
    <View style={commonStyles.section}>
      <Text style={[styles.sectionTitle, isRTL && commonStyles.arabicText]}>
        {translate('dateRange')}
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

  // Render status filter
  const renderStatusFilter = () => (
    <View style={commonStyles.section}>
      <Text style={[styles.sectionTitle, isRTL && commonStyles.arabicText]}>
        {translate('paymentStatus')}
      </Text>
      
      <TouchableOpacity
        style={[styles.selector, isRTL && styles.rtlSelector]}
        onPress={() => setShowStatusModal(true)}
      >
        <Text style={[styles.selectorText, isRTL && commonStyles.arabicText]}>
          {statusOptions.find(option => option.key === filters.status)?.label || translate('selectStatus')}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#666" />
      </TouchableOpacity>
    </View>
  );

  // Render territory filter
  const renderTerritoryFilter = () => (
    <View style={commonStyles.section}>
      <Text style={[styles.sectionTitle, isRTL && commonStyles.arabicText]}>
        {translate('territory')}
      </Text>
      
      <TouchableOpacity
        style={[styles.selector, isRTL && styles.rtlSelector]}
        onPress={() => setShowTerritoryModal(true)}
      >
        <Text style={[styles.selectorText, isRTL && commonStyles.arabicText]}>
          {territoryOptions.find(option => option.key === filters.territory)?.label || translate('allTerritories')}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#666" />
      </TouchableOpacity>
    </View>
  );

  // Render customer filter (only if not staff)
  const renderCustomerFilter = () => {
    if (userRole === 3) return null; // Hide for staff

    return (
      <View style={commonStyles.section}>
        <Text style={[styles.sectionTitle, isRTL && commonStyles.arabicText]}>
          {translate('customer')}
        </Text>
        
        <TouchableOpacity
          style={[styles.selector, isRTL && styles.rtlSelector]}
          onPress={() => navigation.navigate('CustomerSelectorScreen', {
            selectedCustomerId: filters.customer_id,
            onCustomerSelect: (customer) => {
              setFilters(prev => ({
                ...prev,
                customer_id: customer ? customer.id : null
              }));
            }
          })}
        >
          <Text style={[styles.selectorText, isRTL && commonStyles.arabicText]}>
            {filters.customer_id ? translate('customerSelected') : translate('selectCustomer')}
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>
        
        {filters.customer_id && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setFilters(prev => ({ ...prev, customer_id: null }))}
          >
            <Text style={[styles.clearButtonText, isRTL && commonStyles.arabicText]}>
              {translate('clearCustomer')}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // Render staff filter (only if not staff)
  const renderStaffFilter = () => {
    if (userRole === 3) return null; // Hide for staff

    return (
      <View style={commonStyles.section}>
        <Text style={[styles.sectionTitle, isRTL && commonStyles.arabicText]}>
          {translate('staff')}
        </Text>
        
        <TouchableOpacity
          style={[styles.selector, isRTL && styles.rtlSelector]}
          onPress={() => navigation.navigate('StaffSelectorScreen', {
            selectedStaffId: filters.staff_id,
            onStaffSelect: (staff) => {
              setFilters(prev => ({
                ...prev,
                staff_id: staff ? staff.id : null
              }));
            }
          })}
        >
          <Text style={[styles.selectorText, isRTL && commonStyles.arabicText]}>
            {filters.staff_id ? translate('staffSelected') : translate('selectStaff')}
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>
        
        {filters.staff_id && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setFilters(prev => ({ ...prev, staff_id: null }))}
          >
            <Text style={[styles.clearButtonText, isRTL && commonStyles.arabicText]}>
              {translate('clearStaff')}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // Render quick date filters
  const renderQuickFilters = () => {
    const today = new Date();
    const firstDayThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayThisMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    const firstDayThisYear = new Date(today.getFullYear(), 0, 1);

    const formatDateForFilter = (date) => date.toISOString().split('T')[0];

    const quickFilters = [
      {
        label: translate('thisMonth'),
        action: () => setFilters(prev => ({
          ...prev,
          date_from: formatDateForFilter(firstDayThisMonth),
          date_to: formatDateForFilter(lastDayThisMonth)
        }))
      },
      {
        label: translate('lastMonth'),
        action: () => setFilters(prev => ({
          ...prev,
          date_from: formatDateForFilter(firstDayLastMonth),
          date_to: formatDateForFilter(lastDayLastMonth)
        }))
      },
      {
        label: translate('thisYear'),
        action: () => setFilters(prev => ({
          ...prev,
          date_from: formatDateForFilter(firstDayThisYear),
          date_to: formatDateForFilter(today)
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

  // Render status selection modal
  const renderStatusModal = () => (
    <Modal
      visible={showStatusModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowStatusModal(false)}
    >
      <SafeAreaView style={commonStyles.modalContainer}>
        <View style={[commonStyles.modalHeader, isRTL && commonStyles.rtlModalHeader]}>
          <Text style={[commonStyles.modalTitle, isRTL && commonStyles.arabicText]}>
            {translate('selectStatus')}
          </Text>
          <TouchableOpacity
            style={commonStyles.modalCloseButton}
            onPress={() => setShowStatusModal(false)}
          >
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={commonStyles.pickerList}>
          {statusOptions.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                commonStyles.pickerItem,
                filters.status === option.key && styles.selectedItem
              ]}
              onPress={() => {
                setFilters(prev => ({ ...prev, status: option.key }));
                setShowStatusModal(false);
              }}
            >
              <Text style={[
                commonStyles.pickerItemName,
                filters.status === option.key && styles.selectedText,
                isRTL && commonStyles.arabicText
              ]}>
                {option.label}
              </Text>
              {filters.status === option.key && (
                <Ionicons name="checkmark" size={20} color="#6B7D3D" />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  // Render territory selection modal
  const renderTerritoryModal = () => (
    <Modal
      visible={showTerritoryModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowTerritoryModal(false)}
    >
      <SafeAreaView style={commonStyles.modalContainer}>
        <View style={[commonStyles.modalHeader, isRTL && commonStyles.rtlModalHeader]}>
          <Text style={[commonStyles.modalTitle, isRTL && commonStyles.arabicText]}>
            {translate('selectTerritory')}
          </Text>
          <TouchableOpacity
            style={commonStyles.modalCloseButton}
            onPress={() => setShowTerritoryModal(false)}
          >
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={commonStyles.pickerList}>
          {territoryOptions.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                commonStyles.pickerItem,
                filters.territory === option.key && styles.selectedItem
              ]}
              onPress={() => {
                setFilters(prev => ({ ...prev, territory: option.key }));
                setShowTerritoryModal(false);
              }}
            >
              <Text style={[
                commonStyles.pickerItemName,
                filters.territory === option.key && styles.selectedText,
                isRTL && commonStyles.arabicText
              ]}>
                {option.label}
              </Text>
              {filters.territory === option.key && (
                <Ionicons name="checkmark" size={20} color="#6B7D3D" />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    </Modal>
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
                {translate('reportFilters')}
              </Text>
              <Text style={[commonStyles.headerSubtitle, isRTL && commonStyles.arabicText]}>
                {translate('customizeYourReport')}
              </Text>
            </View>
            <TouchableOpacity
              style={commonStyles.addButton}
              onPress={clearFilters}
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

        {/* Status Filter */}
        {renderStatusFilter()}

        {/* Territory Filter */}
        {renderTerritoryFilter()}

        {/* Customer Filter */}
        {renderCustomerFilter()}

        {/* Staff Filter */}
        {renderStaffFilter()}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.clearAllButton, isRTL && styles.rtlButton]}
            onPress={clearFilters}
          >
            <Ionicons name="trash-outline" size={16} color="#E74C3C" />
            <Text style={[styles.clearAllButtonText, isRTL && commonStyles.arabicText]}>
              {translate('clearAll')}
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

      {/* Modals */}
      {renderStatusModal()}
      {renderTerritoryModal()}
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

  selector: {
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

  rtlSelector: {
    flexDirection: 'row-reverse',
  },

  selectorText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },

  clearButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },

  clearButtonText: {
    fontSize: 14,
    color: '#E74C3C',
    fontWeight: '500',
  },

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

  selectedItem: {
    backgroundColor: 'rgba(107, 125, 61, 0.1)',
    borderColor: '#6B7D3D',
  },

  selectedText: {
    color: '#6B7D3D',
    fontWeight: '600',
  },

  actionButtons: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 30,
    paddingHorizontal: 20,
  },

  rtlButton: {
    flexDirection: 'row-reverse',
  },

  clearAllButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 12,
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
    borderWidth: 1,
    borderColor: '#E74C3C',
    gap: 8,
  },

  clearAllButtonText: {
    fontSize: 16,
    color: '#E74C3C',
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

export default SalesReportFiltersScreen;