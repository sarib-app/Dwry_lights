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
  FlatList,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import languageService from '../Globals/Store/Lang';
import getAuthToken from '../Globals/Store/LocalData';
import AsyncStorage from '@react-native-async-storage/async-storage';
import commonStyles from '../Globals/CommonStyles';
import getUserRole from '../Globals/Store/GetRoleId';
// import simplePermissions from '../Globals/Store/SimplePermissions';
import simplePermissions from '../Globals/Store/PermissionsDemo';

const API_BASE_URL = 'https://planetdory.dwrylight.com/api';

const StaffManagementScreen = ({ navigation }) => {
  // State management
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isRTL, setIsRTL] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [roleId, setRoleId] = useState(null);
  const [userPermissions, setUserPermissions] = useState([]);

  // Data states
  const [staffList, setStaffList] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const translate = (key) => languageService.translate(key);

  useEffect(() => {
    initializeScreen();
  }, []);

  useEffect(() => {
    filterStaff();
  }, [searchQuery, staffList]);

  const initializeScreen = async () => {
    const language = await languageService.loadSavedLanguage();
    setCurrentLanguage(language);
    setIsRTL(language === 'ar');
    
    await loadUserData();
    await initializePermissions();
    fetchStaffList();
  };

  // Initialize permissions and role
  const initializePermissions = async () => {
    try {
      // Get user role
      const role = await getUserRole();
      setRoleId(role);

      // Fetch user permissions if not admin
      if (role === 3) {
        const permissions = await simplePermissions.fetchUserPermissions();
        setUserPermissions(permissions);
      }
    } catch (error) {
      console.error('Error initializing permissions:', error);
    }
  };

  // Permission check functions
  const hasStaffPermission = (type) => {
    // If admin (not role 3), allow everything
    if (roleId !== 3) {
      return true;
    }
    
    // For staff (role 3), check specific permissions
    const permissionName = `staff.${type}`;
    return userPermissions.some(permission => 
      permission.name === permissionName && permission.module === 'staff'
    );
  };

  const canCreateStaff = () => hasStaffPermission('create');
  const canEditStaff = () => hasStaffPermission('edit');
  const canDeleteStaff = () => hasStaffPermission('delete');
  const canViewStaff = () => hasStaffPermission('view') || hasStaffPermission('management');

  // Load user data from AsyncStorage
  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        setCurrentUser(user);
        
        // Check if user is admin (role_id not equal to 3)
        const userIsAdmin = user.role_id !== 3;
        setIsAdmin(userIsAdmin);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  // Fetch staff list
  const fetchStaffList = async () => {
    const token = await getAuthToken();
    if (!token) {
      Alert.alert(translate('error'), translate('authTokenNotFound'));
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/fetch_all_staff`, {
        method: 'GET',
        headers: {
          'Authorization': token,
        },
      });
      
      const result = await response.json();
      console.log('Staff List API Response:', result);
      
      if (result.status === 200) {
        setStaffList(result.data || []);
      } else {
        Alert.alert(translate('error'), result.message || translate('failedToFetchStaff'));
      }
    } catch (error) {
      console.error('Fetch staff error:', error);
      Alert.alert(translate('error'), translate('networkErrorFetchingStaff'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Filter staff based on search query
  const filterStaff = () => {
    if (!searchQuery.trim()) {
      setFilteredStaff(staffList);
      return;
    }

    const filtered = staffList.filter(staff => {
      const searchLower = searchQuery.toLowerCase();
      return (
        staff.name.toLowerCase().includes(searchLower) ||
        (staff.name_ar && staff.name_ar.includes(searchQuery)) ||
        staff.email.toLowerCase().includes(searchLower) ||
        staff.phone.includes(searchQuery) ||
        staff.position.toLowerCase().includes(searchLower) ||
        staff.department.toLowerCase().includes(searchLower) ||
        (staff.territory_assigned && staff.territory_assigned.toLowerCase().includes(searchLower))
      );
    });
    setFilteredStaff(filtered);
  };

  // Refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStaffList();
  }, []);

  // Delete staff
  const deleteStaff = async (staffId) => {
    // Check delete permission
    if (!canDeleteStaff()) {
      Alert.alert('Access Denied', 'You do not have permission to delete staff members');
      return;
    }

    const token = await getAuthToken();
    if (!token) {
      Alert.alert(translate('error'), translate('authTokenNotFound'));
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/delete_staff/${staffId}`, {
        method: 'POST',
        headers: {
          'Authorization': token,
        },
      });
      
      const result = await response.json();
      console.log('Delete Staff Response:', result);
      
      if (result.status === 200) {
        Alert.alert(translate('success'), translate('staffDeletedSuccessfully'));
        fetchStaffList(); // Refresh the list
      } else {
        Alert.alert(translate('error'), result.message || translate('failedToDeleteStaff'));
      }
    } catch (error) {
      console.error('Delete staff error:', error);
      Alert.alert(translate('error'), translate('networkErrorDeletingStaff'));
    }
  };

  // Handle edit staff
  const handleEditStaff = (staff) => {
    if (!canEditStaff()) {
      Alert.alert('Access Denied', 'You do not have permission to edit staff members');
      return;
    }
    navigation.navigate('AddEditStaffScreen', { 
      staff: staff, 
      isEdit: true,
      onStaffUpdated: fetchStaffList 
    });
  };

  // Handle add staff
  const handleAddStaff = () => {
    if (!canCreateStaff()) {
      Alert.alert('Access Denied', 'You do not have permission to create staff members');
      return;
    }
    navigation.navigate('AddEditStaffScreen', { 
      isEdit: false,
      onStaffAdded: fetchStaffList 
    });
  };

  // Confirm delete
  const confirmDelete = (staff) => {
    if (!canDeleteStaff()) {
      Alert.alert('Access Denied', 'You do not have permission to delete staff members');
      return;
    }

    Alert.alert(
      translate('confirmDelete'),
      `${translate('confirmDeleteStaff')} ${staff.name}?`,
      [
        { text: translate('cancel'), style: 'cancel' },
        { 
          text: translate('delete'), 
          style: 'destructive',
          onPress: () => deleteStaff(staff.id)
        }
      ]
    );
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#27AE60';
      case 'inactive': return '#E74C3C';
      case 'suspended': return '#F39C12';
      default: return '#95A5A6';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return 'checkmark-circle';
      case 'inactive': return 'close-circle';
      case 'suspended': return 'pause-circle';
      default: return 'help-circle';
    }
  };

  // Render search header
  const renderSearchHeader = () => (
    <View style={styles.searchContainer}>
      <View style={[styles.searchInputContainer, isRTL && styles.rtlSearchInput]}>
        <Ionicons name="search" size={20} color="#666" />
        <TextInput
          style={[styles.searchInput, isRTL && commonStyles.arabicInput]}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={translate('searchStaff')}
          placeholderTextColor="#999"
          textAlign={isRTL ? 'right' : 'left'}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  // Render staff stats
  const renderStaffStats = () => {
    const activeStaff = staffList.filter(staff => staff.status === 'active').length;
    const inactiveStaff = staffList.filter(staff => staff.status === 'inactive').length;
    const totalStaff = staffList.length;

    return (
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: 'rgba(39, 174, 96, 0.1)' }]}>
          <Ionicons name="people" size={20} color="#27AE60" />
          <Text style={[styles.statValue, { color: '#27AE60' }, isRTL && commonStyles.arabicText]}>
            {totalStaff}
          </Text>
          <Text style={[styles.statLabel, isRTL && commonStyles.arabicText]}>
            {translate('totalStaff')}
          </Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: 'rgba(39, 174, 96, 0.1)' }]}>
          <Ionicons name="checkmark-circle" size={20} color="#27AE60" />
          <Text style={[styles.statValue, { color: '#27AE60' }, isRTL && commonStyles.arabicText]}>
            {activeStaff}
          </Text>
          <Text style={[styles.statLabel, isRTL && commonStyles.arabicText]}>
            {translate('activeStaff')}
          </Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: 'rgba(231, 76, 60, 0.1)' }]}>
          <Ionicons name="close-circle" size={20} color="#E74C3C" />
          <Text style={[styles.statValue, { color: '#E74C3C' }, isRTL && commonStyles.arabicText]}>
            {inactiveStaff}
          </Text>
          <Text style={[styles.statLabel, isRTL && commonStyles.arabicText]}>
            {translate('inactiveStaff')}
          </Text>
        </View>
      </View>
    );
  };

  // Render staff item
  const renderStaffItem = ({ item }) => (
    <View style={[styles.staffCard, isRTL && styles.rtlStaffCard]}>
      {/* Staff Header */}
      <View style={[styles.staffHeader, isRTL && styles.rtlStaffHeader]}>
        <View style={styles.staffInfo}>
          <Text style={[styles.staffName, isRTL && commonStyles.arabicText]}>
            {isRTL ? (item.name_ar || item.name) : item.name}
          </Text>
          <Text style={[styles.staffPosition, isRTL && commonStyles.arabicText]}>
            {item.position} • {item.department}
          </Text>
        </View>
        
        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
          <Ionicons name={getStatusIcon(item.status)} size={16} color={getStatusColor(item.status)} />
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }, isRTL && commonStyles.arabicText]}>
            {translate(item.status)}
          </Text>
        </View>
      </View>

      {/* Staff Details */}
      <View style={styles.staffDetails}>
        {/* Contact Info */}
        <View style={[styles.detailRow, isRTL && styles.rtlDetailRow]}>
          <Ionicons name="mail" size={16} color="#666" />
          <Text style={[styles.detailText, isRTL && commonStyles.arabicText]}>
            {item.email}
          </Text>
        </View>

        <View style={[styles.detailRow, isRTL && styles.rtlDetailRow]}>
          <Ionicons name="call" size={16} color="#666" />
          <Text style={[styles.detailText, isRTL && commonStyles.arabicText]}>
            {item.phone}
          </Text>
        </View>

        {/* Territory */}
        {item.territory_assigned && (
          <View style={[styles.detailRow, isRTL && styles.rtlDetailRow]}>
            <Ionicons name="map" size={16} color="#666" />
            <Text style={[styles.detailText, isRTL && commonStyles.arabicText]}>
              {item.territory_assigned}
            </Text>
          </View>
        )}

        {/* Hire Date */}
        <View style={[styles.detailRow, isRTL && styles.rtlDetailRow]}>
          <Ionicons name="calendar" size={16} color="#666" />
          <Text style={[styles.detailText, isRTL && commonStyles.arabicText]}>
            {translate('hiredOn')}: {new Date(item.hire_date).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
          </Text>
        </View>

        {/* Salary */}
        <View style={[styles.detailRow, isRTL && styles.rtlDetailRow]}>
          <Ionicons name="cash" size={16} color="#666" />
          <Text style={[styles.detailText, isRTL && commonStyles.arabicText]}>
            {translate('salary')}: {parseFloat(item.salary).toLocaleString()}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={[styles.actionButtons, isRTL && styles.rtlActionButtons]}>
        {canEditStaff() && (
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => handleEditStaff(item)}
          >
            <Ionicons name="create" size={16} color="#3498DB" />
            <Text style={[styles.actionButtonText, { color: '#3498DB' }, isRTL && commonStyles.arabicText]}>
              {translate('edit')}
            </Text>
          </TouchableOpacity>
        )}

        {canDeleteStaff() && (
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => confirmDelete(item)}
          >
            <Ionicons name="trash" size={16} color="#E74C3C" />
            <Text style={[styles.actionButtonText, { color: '#E74C3C' }, isRTL && commonStyles.arabicText]}>
              {translate('delete')}
            </Text>
          </TouchableOpacity>
        )}

        {!canEditStaff() && !canDeleteStaff() && canViewStaff() && (
          <TouchableOpacity
            style={[styles.actionButton, styles.viewButton]}
            onPress={() => {/* Handle view staff details */}}
          >
            <Ionicons name="eye" size={16} color="#3498DB" />
            <Text style={[styles.actionButtonText, { color: '#3498DB' }, isRTL && commonStyles.arabicText]}>
              {translate('view')}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  // Render empty state
  const renderEmptyState = () => (
    <View style={commonStyles.emptyContainer}>
      <Ionicons name="people-outline" size={64} color="#ccc" />
      <Text style={[commonStyles.emptyText, isRTL && commonStyles.arabicText]}>
        {searchQuery ? translate('noStaffFound') : translate('noStaffMembers')}
      </Text>
      <Text style={[commonStyles.emptySubtext, isRTL && commonStyles.arabicText]}>
        {searchQuery ? translate('tryDifferentSearch') : translate('addFirstStaffMember')}
      </Text>
    </View>
  );

  // Show loading if permissions not loaded yet
  if ((loading && !refreshing) || roleId === null) {
    return (
      <View style={commonStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B7D3D" />
        <Text style={[commonStyles.loadingText, isRTL && commonStyles.arabicText]}>
          {translate('loadingStaff')}
        </Text>
      </View>
    );
  }

  // Check if user has access to view staff at all
  if (!canViewStaff()) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={styles.noAccessContainer}>
          <Ionicons name="lock-closed" size={64} color="#ccc" />
          <Text style={styles.noAccessText}>Access Denied</Text>
          <Text style={styles.noAccessSubtext}>
            You do not have permission to view staff members
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
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
                {translate('staffManagement')}
              </Text>
              <Text style={[commonStyles.headerSubtitle, isRTL && commonStyles.arabicText]}>
                {translate('manageTeamMembers')}
                {roleId === 3 && (
                  <Text style={styles.permissionIndicator}> • Permission Based</Text>
                )}
              </Text>
            </View>
            {canCreateStaff() && (
              <TouchableOpacity
                style={commonStyles.addButton}
                onPress={handleAddStaff}
              >
                <Ionicons name="add" size={24} color="#fff" />
              </TouchableOpacity>
            )}
            {!canCreateStaff() && (
              <View style={styles.addButtonPlaceholder} />
            )}
          </View>
        </LinearGradient>
      </View>

      <View style={commonStyles.content}>
        {/* Permission Info Bar */}
        {roleId === 3 && (
          <View style={styles.permissionBar}>
            <View style={styles.permissionInfo}>
              <Ionicons name="information-circle" size={16} color="#6B7D3D" />
              <Text style={styles.permissionText}>
                Your permissions: 
                {canViewStaff() && ' View'}
                {canCreateStaff() && ' • Create'}
                {canEditStaff() && ' • Edit'}
                {canDeleteStaff() && ' • Delete'}
              </Text>
            </View>
          </View>
        )}

        {/* Search Header */}
        {renderSearchHeader()}

        {/* Staff Stats */}
        {renderStaffStats()}

        {/* Staff List */}
        <FlatList
          data={filteredStaff}
          renderItem={renderStaffItem}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6B7D3D']} />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // Permission styles
  noAccessContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  noAccessText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#999',
    marginTop: 20,
    marginBottom: 10,
  },
  noAccessSubtext: {
    fontSize: 16,
    color: '#bbb',
    textAlign: 'center',
    marginBottom: 30,
  },
  backButton: {
    backgroundColor: '#6B7D3D',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  permissionIndicator: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  addButtonPlaceholder: {
    width: 40,
    height: 40,
  },
  permissionBar: {
    backgroundColor: 'rgba(107, 125, 61, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 15,
  },
  permissionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  permissionText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#6B7D3D',
    fontWeight: '500',
  },

  // Search Container
  searchContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    paddingHorizontal: 12,
    gap: 10,
  },

  rtlSearchInput: {
    flexDirection: 'row-reverse',
  },

  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    color: '#333',
  },

  // Stats Container
  statsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },

  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
    marginBottom: 2,
  },

  statLabel: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },

  // Staff Cards
  listContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },

  staffCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  rtlStaffCard: {
    alignItems: 'flex-end',
  },

  staffHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },

  rtlStaffHeader: {
    flexDirection: 'row-reverse',
  },

  staffInfo: {
    flex: 1,
  },

  staffName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },

  staffPosition: {
    fontSize: 12,
    color: '#666',
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },

  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },

  // Staff Details
  staffDetails: {
    gap: 8,
    marginBottom: 15,
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  rtlDetailRow: {
    flexDirection: 'row-reverse',
  },

  detailText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },

  rtlActionButtons: {
    flexDirection: 'row-reverse',
  },

  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },

  editButton: {
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
    borderWidth: 1,
    borderColor: '#3498DB',
  },

  deleteButton: {
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
    borderWidth: 1,
    borderColor: '#E74C3C',
  },

  viewButton: {
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
    borderWidth: 1,
    borderColor: '#3498DB',
  },

  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default StaffManagementScreen;