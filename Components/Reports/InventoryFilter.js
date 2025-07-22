import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import languageService from '../Globals/Store/Lang';
import commonStyles from '../Globals/CommonStyles';

const InventoryReportFiltersScreen = ({ navigation, route }) => {
  const { filters: initialFilters, onFiltersChange } = route.params;
  
  const [filters, setFilters] = useState(initialFilters);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isRTL, setIsRTL] = useState(false);

  const translate = (key) => languageService.translate(key);

  useEffect(() => {
    initializeScreen();
  }, []);

  const initializeScreen = async () => {
    const language = await languageService.loadSavedLanguage();
    setCurrentLanguage(language);
    setIsRTL(language === 'ar');
  };

  // Apply filters
  const applyFilters = () => {
    // Validate threshold
    const threshold = parseInt(filters.low_stock_threshold);
    if (isNaN(threshold) || threshold < 0) {
      Alert.alert(translate('error'), translate('validThresholdRequired'));
      return;
    }

    onFiltersChange({
      ...filters,
      low_stock_threshold: threshold
    });
    navigation.goBack();
  };

  // Reset filters to default
  const resetFilters = () => {
    setFilters({
      low_stock_threshold: 1000,
      item_id: null,
    });
  };

  // Render threshold setting
  const renderThresholdSetting = () => (
    <View style={commonStyles.section}>
      <Text style={[styles.sectionTitle, isRTL && commonStyles.arabicText]}>
        {translate('lowStockThreshold')}
      </Text>
      
      <View style={styles.thresholdContainer}>
        <View style={styles.thresholdInfo}>
          <Ionicons name="information-circle" size={20} color="#3498DB" />
          <Text style={[styles.thresholdDescription, isRTL && commonStyles.arabicText]}>
            {translate('thresholdDescription')}
          </Text>
        </View>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.thresholdInput, isRTL && styles.rtlInput]}
            value={filters.low_stock_threshold.toString()}
            onChangeText={(text) => setFilters(prev => ({
              ...prev,
              low_stock_threshold: parseInt(text) || 0
            }))}
            keyboardType="numeric"
            placeholder="1000"
            placeholderTextColor="#999"
          />
          <Text style={[styles.inputLabel, isRTL && commonStyles.arabicText]}>
            {translate('units')}
          </Text>
        </View>
      </View>
      
      {/* Preset threshold buttons */}
      <View style={styles.presetContainer}>
        <Text style={[styles.presetTitle, isRTL && commonStyles.arabicText]}>
          {translate('quickThresholds')}
        </Text>
        
        <View style={styles.presetButtons}>
          {[100, 500, 1000, 2000, 5000].map((threshold) => (
            <TouchableOpacity
              key={threshold}
              style={[
                styles.presetButton,
                filters.low_stock_threshold === threshold && styles.activePresetButton
              ]}
              onPress={() => setFilters(prev => ({
                ...prev,
                low_stock_threshold: threshold
              }))}
            >
              <Text style={[
                styles.presetButtonText,
                filters.low_stock_threshold === threshold && styles.activePresetButtonText,
                isRTL && commonStyles.arabicText
              ]}>
                {threshold}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  // Render item filter section
  const renderItemFilter = () => (
    <View style={commonStyles.section}>
      <Text style={[styles.sectionTitle, isRTL && commonStyles.arabicText]}>
        {translate('itemFilter')}
      </Text>
      
      <TouchableOpacity
        style={[styles.selector, isRTL && styles.rtlSelector]}
        onPress={() => navigation.navigate('ItemSelectorScreen', {
          selectedItemId: filters.item_id,
          onItemSelect: (item) => {
            setFilters(prev => ({
              ...prev,
              item_id: item ? item.id : null
            }));
          }
        })}
      >
        <Text style={[styles.selectorText, isRTL && commonStyles.arabicText]}>
          {filters.item_id ? translate('specificItemSelected') : translate('allItems')}
        </Text>
        <Ionicons name="chevron-forward" size={20} color="#666" />
      </TouchableOpacity>
      
      {filters.item_id && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={() => setFilters(prev => ({ ...prev, item_id: null }))}
        >
          <Text style={[styles.clearButtonText, isRTL && commonStyles.arabicText]}>
            {translate('clearItemFilter')}
          </Text>
        </TouchableOpacity>
      )}
      
      <Text style={[styles.filterNote, isRTL && commonStyles.arabicText]}>
        {translate('itemFilterNote')}
      </Text>
    </View>
  );

  // Render filter summary
  const renderFilterSummary = () => (
    <View style={commonStyles.section}>
      <Text style={[styles.sectionTitle, isRTL && commonStyles.arabicText]}>
        {translate('filterSummary')}
      </Text>
      
      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Ionicons name="warning" size={18} color="#E74C3C" />
          <Text style={[styles.summaryLabel, isRTL && commonStyles.arabicText]}>
            {translate('lowStockThreshold')}:
          </Text>
          <Text style={[styles.summaryValue, isRTL && commonStyles.arabicText]}>
            {filters.low_stock_threshold} {translate('units')}
          </Text>
        </View>
        
        <View style={styles.summaryItem}>
          <Ionicons name="cube" size={18} color="#6B7D3D" />
          <Text style={[styles.summaryLabel, isRTL && commonStyles.arabicText]}>
            {translate('itemScope')}:
          </Text>
          <Text style={[styles.summaryValue, isRTL && commonStyles.arabicText]}>
            {filters.item_id ? translate('specificItem') : translate('allItems')}
          </Text>
        </View>
      </View>
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
                {translate('inventoryFilters')}
              </Text>
              <Text style={[commonStyles.headerSubtitle, isRTL && commonStyles.arabicText]}>
                {translate('customizeInventoryReport')}
              </Text>
            </View>
            <TouchableOpacity
              style={commonStyles.addButton}
              onPress={resetFilters}
            >
              <Ionicons name="refresh" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      <ScrollView style={commonStyles.content} showsVerticalScrollIndicator={false}>
        {/* Threshold Setting */}
        {renderThresholdSetting()}

        {/* Item Filter */}
        {renderItemFilter()}

        {/* Filter Summary */}
        {renderFilterSummary()}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.resetButton, isRTL && styles.rtlButton]}
            onPress={resetFilters}
          >
            <Ionicons name="refresh-outline" size={16} color="#666" />
            <Text style={[styles.resetButtonText, isRTL && commonStyles.arabicText]}>
              {translate('resetToDefault')}
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

  // Threshold Setting
  thresholdContainer: {
    marginBottom: 20,
  },

  thresholdInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    gap: 8,
  },

  thresholdDescription: {
    flex: 1,
    fontSize: 13,
    color: '#3498DB',
    lineHeight: 18,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 15,
    gap: 10,
  },

  thresholdInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },

  rtlInput: {
    textAlign: 'right',
  },

  inputLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },

  // Preset Buttons
  presetContainer: {
    marginTop: 20,
  },

  presetTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 12,
  },

  presetButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  presetButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },

  activePresetButton: {
    backgroundColor: '#6B7D3D',
    borderColor: '#6B7D3D',
  },

  presetButtonText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },

  activePresetButtonText: {
    color: '#fff',
    fontWeight: '600',
  },

  // Item Filter
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
    marginBottom: 10,
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
    alignSelf: 'flex-start',
    marginBottom: 10,
  },

  clearButtonText: {
    fontSize: 14,
    color: '#E74C3C',
    fontWeight: '500',
  },

  filterNote: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    lineHeight: 16,
  },

  // Filter Summary
  summaryContainer: {
    backgroundColor: '#f8fafb',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },

  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },

  summaryLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },

  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
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

export default InventoryReportFiltersScreen;