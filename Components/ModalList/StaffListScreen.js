import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import languageService from '../Globals/Store/Lang';
import getAuthToken from '../Globals/Store/LocalData';
import commonStyles from '../Globals/CommonStyles';

const API_BASE_URL = 'https://planetdory.dwrylight.com/api';

const StaffSelectorScreen = ({ navigation, route }) => {
  const { selectedStaffId, onStaffSelect } = route.params;
  
  const [staff, setStaff] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isRTL, setIsRTL] = useState(false);

  const translate = (key) => languageService.translate(key);

  useEffect(() => {
    initializeScreen();
    fetchStaff();
  }, []);

  useEffect(() => {
    filterStaff();
  }, [searchQuery, staff]);

  const initializeScreen = async () => {
    const language = await languageService.loadSavedLanguage();
    setCurrentLanguage(language);
    setIsRTL(language === 'ar');
  };

  // Fetch staff from API
  const fetchStaff = async () => {
    const token = await getAuthToken();
    if (!token) {
      Alert.alert(translate('error'), translate('authTokenNotFound'));
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/fetch_all_users`, {
        method: 'GET',
        headers: {
          'Authorization': token,
        },
      });
      
      const result = await response.json();
      console.log('Staff API Response:', result);
      
      if (result.status === 200) {
        setStaff(result.users || []);
        setFilteredStaff(result.users || []);
      } else {
        Alert.alert(translate('error'), result.message || translate('failedToFetchStaff'));
      }
    } catch (error) {
      console.error('Fetch staff error:', error);
      Alert.alert(translate('error'), translate('networkErrorFetchingStaff'));
    } finally {
      setLoading(false);
    }
  };

  // Filter staff based on search query
  const filterStaff = () => {
    if (!searchQuery.trim()) {
      setFilteredStaff(staff);
      return;
    }

    const filtered = staff.filter(member => {
      const firstName = member.first_name?.toLowerCase() || '';
      const lastName = member.last_name?.toLowerCase() || '';
      const email = member.email?.toLowerCase() || '';
      const role = member.role?.toLowerCase() || '';
      const fullName = `${firstName} ${lastName}`;

      const query = searchQuery.toLowerCase();

      return (
        firstName.includes(query) ||
        lastName.includes(query) ||
        fullName.includes(query) ||
        email.includes(query) ||
        role.includes(query)
      );
    });

    setFilteredStaff(filtered);
  };

  // Handle staff selection
  const handleStaffSelect = (staffMember) => {
    onStaffSelect(staffMember);
    navigation.goBack();
  };

  // Handle clear selection
  const handleClearSelection = () => {
    onStaffSelect(null);
    navigation.goBack();
  };

  // Get role color
  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'super admin':
        return '#E74C3C';
      case 'admin':
        return '#3498DB';
      case 'staff':
        return '#27AE60';
      default:
        return '#95A5A6';
    }
  };

  // Get role icon
  const getRoleIcon = (role) => {
    switch (role?.toLowerCase()) {
      case 'super admin':
        return 'shield-checkmark';
      case 'admin':
        return 'person-circle';
      case 'staff':
        return 'person';
      default:
        return 'person-outline';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US');
  };

  // Render staff item
  const renderStaffItem = ({ item }) => {
    const isSelected = selectedStaffId === item.id;
    const fullName = `${item.first_name} ${item.last_name}`;
    const roleColor = getRoleColor(item.role);
    const roleIcon = getRoleIcon(item.role);

    return (
      <TouchableOpacity
        style={[
          styles.staffItem,
          isSelected && styles.selectedStaffItem,
          isRTL && styles.rtlStaffItem
        ]}
        onPress={() => handleStaffSelect(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.staffIcon, { backgroundColor: `${roleColor}20` }]}>
          <Ionicons 
            name={roleIcon} 
            size={24} 
            color={roleColor} 
          />
        </View>
        
        <View style={styles.staffInfo}>
          <Text style={[
            styles.staffName,
            isSelected && styles.selectedStaffName,
            isRTL && commonStyles.arabicText
          ]}>
            {fullName}
          </Text>
          
          <View style={[styles.staffDetails, isRTL && styles.rtlStaffDetails]}>
            <View style={[styles.roleContainer, { backgroundColor: roleColor }]}>
              <Text style={styles.roleText}>
                {translate(item.role?.toLowerCase().replace(' ', '')) || item.role}
              </Text>
            </View>
          </View>
          
          <View style={[styles.contactInfo, isRTL && styles.rtlContactInfo]}>
            <View style={styles.contactItem}>
              <Ionicons name="mail" size={14} color="#666" />
              <Text style={[styles.contactText, isRTL && commonStyles.arabicText]}>
                {item.email}
              </Text>
            </View>
            
            {item.iqama_no && (
              <View style={styles.contactItem}>
                <Ionicons name="card" size={14} color="#666" />
                <Text style={[styles.contactText, isRTL && commonStyles.arabicText]}>
                  {translate('iqama')}: {item.iqama_no}
                </Text>
              </View>
            )}
          </View>
          
          <Text style={[styles.joinDate, isRTL && commonStyles.arabicText]}>
            {translate('joinedOn')}: {formatDate(item.created_at)}
          </Text>
        </View>
        
        {isSelected && (
          <View style={styles.selectedIndicator}>
            <Ionicons name="checkmark-circle" size={24} color="#6B7D3D" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Render empty state
  const renderEmptyState = () => (
    <View style={commonStyles.emptyContainer}>
      <Ionicons name="people-outline" size={64} color="#ccc" />
      <Text style={[commonStyles.emptyText, isRTL && commonStyles.arabicText]}>
        {searchQuery ? translate('noStaffFound') : translate('noStaffAvailable')}
      </Text>
      <Text style={[commonStyles.emptySubtext, isRTL && commonStyles.arabicText]}>
        {searchQuery ? translate('tryDifferentSearch') : translate('addStaffFirst')}
      </Text>
    </View>
  );

  // Render header with search and clear option
  const renderHeader = () => (
    <View>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, isRTL && styles.rtlSearchBar]}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={[styles.searchInput, isRTL && commonStyles.arabicInput]}
            placeholder={translate('searchStaff')}
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            textAlign={isRTL ? 'right' : 'left'}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Clear Selection Option */}
      {selectedStaffId && (
        <TouchableOpacity
          style={[styles.clearSelectionButton, isRTL && styles.rtlClearButton]}
          onPress={handleClearSelection}
        >
          <Ionicons name="close-circle-outline" size={20} color="#E74C3C" />
          <Text style={[styles.clearSelectionText, isRTL && commonStyles.arabicText]}>
            {translate('clearStaffSelection')}
          </Text>
        </TouchableOpacity>
      )}

      {/* Results Count */}
      <View style={styles.resultsHeader}>
        <Text style={[styles.resultsCount, isRTL && commonStyles.arabicText]}>
          {filteredStaff.length} {translate('staffMembersFound')}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={commonStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B7D3D" />
        <Text style={[commonStyles.loadingText, isRTL && commonStyles.arabicText]}>
          {translate('loadingStaff')}
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
                {translate('selectStaff')}
              </Text>
              <Text style={[commonStyles.headerSubtitle, isRTL && commonStyles.arabicText]}>
                {staff.length} {translate('staffMembersAvailable')}
              </Text>
            </View>
            <View style={commonStyles.placeholder} />
          </View>
        </LinearGradient>
      </View>

      <FlatList
        data={filteredStaff}
        renderItem={renderStaffItem}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // Search Container
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafb',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },

  rtlSearchBar: {
    flexDirection: 'row-reverse',
  },

  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },

  // Clear Selection
  clearSelectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 8,
    gap: 8,
  },

  rtlClearButton: {
    flexDirection: 'row-reverse',
  },

  clearSelectionText: {
    fontSize: 14,
    color: '#E74C3C',
    fontWeight: '500',
  },

  // Results Header
  resultsHeader: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#f8fafb',
  },

  resultsCount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },

  // List Content
  listContent: {
    flexGrow: 1,
  },

  separator: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginLeft: 80,
  },

  // Staff Item
  staffItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 20,
    backgroundColor: '#fff',
  },

  rtlStaffItem: {
    flexDirection: 'row-reverse',
  },

  selectedStaffItem: {
    backgroundColor: 'rgba(107, 125, 61, 0.05)',
    borderLeftWidth: 4,
    borderLeftColor: '#6B7D3D',
  },

  staffIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },

  staffInfo: {
    flex: 1,
  },

  staffName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },

  selectedStaffName: {
    color: '#6B7D3D',
  },

  staffDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  rtlStaffDetails: {
    flexDirection: 'row-reverse',
  },

  roleContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  roleText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
    textTransform: 'capitalize',
  },

  contactInfo: {
    marginBottom: 8,
  },

  rtlContactInfo: {
    alignItems: 'flex-end',
  },

  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },

  contactText: {
    fontSize: 12,
    color: '#666',
  },

  joinDate: {
    fontSize: 11,
    color: '#999',
    fontStyle: 'italic',
  },

  selectedIndicator: {
    marginLeft: 10,
  },
});

export default StaffSelectorScreen;