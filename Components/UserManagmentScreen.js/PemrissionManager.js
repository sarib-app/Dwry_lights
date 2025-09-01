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
import commonStyles from '../Globals/CommonStyles';


const API_BASE_URL = 'https://planetdory.dwrylight.com/api';

const PermissionManagerScreen = ({ navigation, route }) => {
  const { userId, userName, userEmail } = route.params;

  // State management
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isRTL, setIsRTL] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingPermissions, setLoadingPermissions] = useState(true);

  // Data states
  const [allPermissions, setAllPermissions] = useState([]);
  const [userPermissions, setUserPermissions] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState(new Set());
  const [filteredPermissions, setFilteredPermissions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('assigned'); // 'assigned' or 'all'

  const translate = (key) => languageService.translate(key);

  useEffect(() => {
    initializeScreen();
  }, []);

  useEffect(() => {
    filterPermissions();
  }, [searchQuery, allPermissions, activeTab]);

  const initializeScreen = async () => {
    const language = await languageService.loadSavedLanguage();
    setCurrentLanguage(language);
    setIsRTL(language === 'ar');
    
    // Fetch all permissions from API
    await fetchAllPermissions();
    
    await fetchUserPermissions();
  };

  // Fetch all permissions from API
  const fetchAllPermissions = async () => {
    const token = await getAuthToken();
    if (!token) {
      Alert.alert(translate('error'), translate('authTokenNotFound'));
      return;
    }

    try {
      setLoadingPermissions(true);
      const response = await fetch(`${API_BASE_URL}/fetch_all_permissions`, {
        method: 'GET',
        headers: {
          'Authorization': token,
        },
      });
      
      const result = await response.json();
      console.log('All Permissions Response:', result);
      
      if (result.status === 200) {
        const permissions = result.data || [];
        console.log('Fetched permissions count:', permissions.length);
        setAllPermissions(permissions);
      } else {
        Alert.alert(translate('error'), result.message || translate('failedToFetchPermissions'));
        // Fallback to empty array if API fails
        setAllPermissions([]);
      }
    } catch (error) {
      console.error('Fetch all permissions error:', error);
      Alert.alert(translate('error'), translate('networkErrorFetchingPermissions'));
      // Fallback to empty array if network error
      setAllPermissions([]);
    } finally {
      setLoadingPermissions(false);
    }
  };

  // Fetch user's current permissions
  const fetchUserPermissions = async () => {
    const token = await getAuthToken();
    if (!token) {
      Alert.alert(translate('error'), translate('authTokenNotFound'));
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/get_staff_permissions/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': token,
        },
      });
      
      const result = await response.json();
      console.log('User Permissions Response:', result);
      
      if (result.status === 200) {
        const permissions = result.permissions || [];
        // In PermissionManagerScreen fetchUserPermissions function
// const result = await response.json();
console.log('=== PERMISSION MANAGER API RESPONSE ===');
console.log('API URL:', `${API_BASE_URL}/get_staff_permissions/${userId}`);
console.log('User ID:', userId);
console.log('Raw API Response:', result);
console.log('Permissions from API:', result.permissions?.map(p => ({
  id: p.id,
  name: p.name,
  module: p.module,
  type: p.type
})));
console.log('=========================================');
        setUserPermissions(permissions);
        
        // Initialize selected permissions with user's current permissions
        const currentPermissionIds = new Set(permissions.map(p => p.id));
        setSelectedPermissions(currentPermissionIds);
      } else {
        Alert.alert(translate('error'), result.message || translate('failedToFetchUserPermissions'));
      }
    } catch (error) {
      console.error('Fetch user permissions error:', error);
      Alert.alert(translate('error'), translate('networkErrorFetchingPermissions'));
    }
  };



  // Filter permissions based on search query and active tab
  const filterPermissions = () => {
    let permissionsToFilter = [];
    
    if (activeTab === 'assigned') {
      // Show only assigned permissions
      const userPermissionIds = new Set(userPermissions.map(p => p.id));
      permissionsToFilter = allPermissions.filter(p => userPermissionIds.has(p.id));
    } else {
      // Show all permissions
      permissionsToFilter = allPermissions;
    }
    
    if (!searchQuery.trim()) {
      // Sort by module and type
      const sorted = [...permissionsToFilter].sort((a, b) => {
        if (a.module !== b.module) {
          return a.module.localeCompare(b.module);
        }
        if (a.type === 'module' && b.type !== 'module') return -1;
        if (a.type !== 'module' && b.type === 'module') return 1;
        return a.name.localeCompare(b.name);
      });
      setFilteredPermissions(sorted);
      return;
    }

    const filtered = permissionsToFilter.filter(permission => {
      const searchLower = searchQuery.toLowerCase();
      return (
        permission.name.toLowerCase().includes(searchLower) ||
        permission.description.toLowerCase().includes(searchLower) ||
        permission.module.toLowerCase().includes(searchLower)
      );
    });
    setFilteredPermissions(filtered);
  };

  // Toggle permission selection
  const togglePermission = (permissionId) => {
    const newSelected = new Set(selectedPermissions);
    if (newSelected.has(permissionId)) {
      newSelected.delete(permissionId);
    } else {
      newSelected.add(permissionId);
    }
    setSelectedPermissions(newSelected);
  };

  // Save permissions
// Save permissions - WITH DEBUG
  const savePermissions = async () => {
    const token = await getAuthToken();
    if (!token) {
      Alert.alert(translate('error'), translate('authTokenNotFound'));
      return;
    }

    setSaving(true);
    try {
      const permissionIds = Array.from(selectedPermissions);
      
      // ADD THIS DEBUG - TO SEE WHAT YOU'RE ACTUALLY SAVING
      console.log('=== SAVING PERMISSIONS DEBUG ===');
      console.log('User ID:', userId);
      console.log('Selected Permission IDs:', permissionIds);
      console.log('Selected Permissions Details:', permissionIds.map(id => {
        const perm = allPermissions.find(p => p.id === id);
        return perm ? {
          id: perm.id,
          name: perm.name,
          module: perm.module,
          type: perm.type,
          description: perm.description
        } : `ID ${id} NOT FOUND`;
      }));
      
      // Check if customers and expenses are actually selected
      const customersPermission = allPermissions.find(p => p.module === 'customers' && p.type === 'module');
      const expensesPermission = allPermissions.find(p => p.module === 'expenses' && p.type === 'module');
      
      console.log('Customers permission in allPermissions:', customersPermission);
      console.log('Expenses permission in allPermissions:', expensesPermission);
      console.log('Is customers selected?', customersPermission ? selectedPermissions.has(customersPermission.id) : 'Permission not found');
      console.log('Is expenses selected?', expensesPermission ? selectedPermissions.has(expensesPermission.id) : 'Permission not found');
      console.log('================================');
      
      const response = await fetch(`${API_BASE_URL}/assign_permissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        body: JSON.stringify({
          staff_id: userId,
          permission_ids: permissionIds
        }),
      });
      
      const result = await response.json();
      console.log('=== API RESPONSE ===');
      console.log('Assign Permissions Response:', result);
      console.log('result.status', result.status);
      console.log('==================');
      
      if (result.status == 200 || result.data) {
        Alert.alert(
          translate('success'), 
          translate('permissionsUpdatedSuccessfully'),
          [
            {
              text: translate('ok'),
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        Alert.alert(translate('error'), result.message || translate('failedToUpdatePermissions'));
      }
    } catch (error) {
      console.error('Save permissions error:', error);
      Alert.alert(translate('error'), translate('networkErrorSavingPermissions'));
    } finally {
      setSaving(false);
    }
  };
  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchAllPermissions(),
        fetchUserPermissions()
      ]);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Get permission type color
  const getPermissionTypeColor = (type) => {
    switch (type.toLowerCase()) {
      case 'module': return '#9B59B6';
      case 'create': return '#27AE60';
      case 'edit': return '#3498DB';
      case 'delete': return '#E74C3C';
      case 'view': return '#F39C12';
      default: return '#95A5A6';
    }
  };

  // Get permission type icon
  const getPermissionTypeIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'module': return 'apps';
      case 'create': return 'add-circle';
      case 'edit': return 'create';
      case 'delete': return 'trash';
      case 'view': return 'eye';
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
          placeholder={translate('searchPermissions')}
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

  // Render tabs
  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      <TouchableOpacity
        style={[
          styles.tabButton,
          activeTab === 'assigned' && styles.activeTabButton
        ]}
        onPress={() => setActiveTab('assigned')}
      >
        <Text style={[
          styles.tabText,
          activeTab === 'assigned' && styles.activeTabText
        ]}>
          {translate('assigned')} ({userPermissions.length})
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.tabButton,
          activeTab === 'all' && styles.activeTabButton
        ]}
        onPress={() => setActiveTab('all')}
      >
        <Text style={[
          styles.tabText,
          activeTab === 'all' && styles.activeTabText
        ]}>
          {translate('all')} ({allPermissions.length})
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Render user info header
  const renderUserInfo = () => (
    <View style={styles.userInfoContainer}>
      <View style={styles.userIcon}>
        <Ionicons name="person" size={24} color="#9B59B6" />
      </View>
      <View style={styles.userDetails}>
        <Text style={[styles.userName, isRTL && commonStyles.arabicText]}>
          {userName}
        </Text>
        <Text style={[styles.userEmail, isRTL && commonStyles.arabicText]}>
          {userEmail}
        </Text>
      </View>
      <View style={styles.permissionCount}>
        <Text style={[styles.countNumber, isRTL && commonStyles.arabicText]}>
          {selectedPermissions.size}
        </Text>
        <Text style={[styles.countLabel, isRTL && commonStyles.arabicText]}>
          {translate('permissions')}
        </Text>
      </View>
    </View>
  );

  // Render permission item
  const renderPermissionItem = ({ item }) => {
    const isSelected = selectedPermissions.has(item.id);
    const isUserPermission = userPermissions.some(p => p.id === item.id);
    const isModuleType = item.type === 'module';
    
    return (
      <TouchableOpacity
        style={[
          styles.permissionCard,
          isSelected && styles.selectedPermissionCard,
          isUserPermission && styles.userPermissionCard,
          isRTL && styles.rtlPermissionCard
        ]}
        onPress={() => togglePermission(item.id)}
        activeOpacity={0.7}
      >
        {/* Permission Header */}
        <View style={[styles.permissionHeader, isRTL && styles.rtlPermissionHeader]}>
          <View style={styles.permissionInfo}>
            <View style={[styles.permissionTitleRow, isRTL && styles.rtlPermissionTitleRow]}>
              <View style={[
                styles.typeIcon,
                { backgroundColor: `${getPermissionTypeColor(item.type)}20` }
              ]}>
                <Ionicons 
                  name={getPermissionTypeIcon(item.type)} 
                  size={12} 
                  color={getPermissionTypeColor(item.type)} 
                />
              </View>
              
              <Text style={[
                styles.permissionName,
                isModuleType && styles.modulePermissionName,
                isRTL && commonStyles.arabicText
              ]}>
                {item.name}
              </Text>
              
              <View style={[
                styles.typeBadge,
                { backgroundColor: `${getPermissionTypeColor(item.type)}20` }
              ]}>
                <Text style={[
                  styles.typeText,
                  { color: getPermissionTypeColor(item.type) },
                  isRTL && commonStyles.arabicText
                ]}>
                  {item.type}
                </Text>
              </View>
            </View>
            
            <Text style={[styles.permissionDescription, isRTL && commonStyles.arabicText]}>
              {item.description}
            </Text>
          </View>

          {/* Selection Indicator */}
          <View style={[
            styles.selectionIndicator,
            isSelected && styles.selectedIndicator
          ]}>
            {isSelected && (
              <Ionicons name="checkmark" size={14} color="#fff" />
            )}
          </View>
        </View>

        {/* User Permission Badge */}
        {isUserPermission && (
          <View style={styles.userPermissionBadge}>
            <Ionicons name="person-circle" size={10} color="#9B59B6" />
            <Text style={[styles.userPermissionText, isRTL && commonStyles.arabicText]}>
              {translate('currentlyAssigned')}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };



  // Render empty state
  const renderEmptyState = () => (
    <View style={commonStyles.emptyContainer}>
      <Ionicons name="key-outline" size={64} color="#ccc" />
      <Text style={[commonStyles.emptyText, isRTL && commonStyles.arabicText]}>
        {searchQuery ? translate('noPermissionsFound') : translate('noPermissions')}
      </Text>
      <Text style={[commonStyles.emptySubtext, isRTL && commonStyles.arabicText]}>
        {searchQuery ? translate('tryDifferentSearch') : translate('noPermissionsAvailable')}
      </Text>
    </View>
  );



  return (
    <SafeAreaView style={commonStyles.container}>
      {/* Header */}
      <View style={commonStyles.header}>
        <LinearGradient colors={['#9B59B6', '#8E44AD']} style={commonStyles.headerGradient}>
          <View style={[commonStyles.headerContent, isRTL && commonStyles.rtlHeaderContent]}>
            <TouchableOpacity
              style={commonStyles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={24} color="#fff" />
            </TouchableOpacity>
            <View style={commonStyles.headerTextContainer}>
              <Text style={[commonStyles.headerTitle, isRTL && commonStyles.arabicText]}>
                {translate('permissionManager')}
              </Text>
              <Text style={[commonStyles.headerSubtitle, isRTL && commonStyles.arabicText]}>
                {translate('manageUserPermissions')}
              </Text>
            </View>
            <TouchableOpacity
              style={[
                commonStyles.addButton,
                saving && styles.disabledSaveButton
              ]}
              onPress={savePermissions}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size={20} color="#fff" />
              ) : (
                <Ionicons name="checkmark" size={24} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      <View style={commonStyles.content}>
        {/* User Info */}
        {renderUserInfo()}

        {/* Search Header */}
        {renderSearchHeader()}

        {/* Tabs */}
        {renderTabs()}

        {/* Permissions List */}
        {loadingPermissions ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#9B59B6" />
            <Text style={[styles.loadingText, isRTL && commonStyles.arabicText]}>
              {translate('loadingPermissions')}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredPermissions}
            renderItem={renderPermissionItem}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={renderEmptyState}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#9B59B6']} />
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // User Info Container
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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

  userIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(155, 89, 182, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },

  userDetails: {
    flex: 1,
  },

  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },

  userEmail: {
    fontSize: 14,
    color: '#666',
  },

  permissionCount: {
    alignItems: 'center',
    backgroundColor: 'rgba(155, 89, 182, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },

  countNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#9B59B6',
  },

  countLabel: {
    fontSize: 10,
    color: '#9B59B6',
    marginTop: 2,
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

  // Tabs Container
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },

  activeTabButton: {
    backgroundColor: '#9B59B6',
  },

  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },

  activeTabText: {
    color: '#fff',
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

  // Permission Cards
  listContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },

  permissionCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: 'transparent',
  },

  selectedPermissionCard: {
    borderColor: '#9B59B6',
    backgroundColor: 'rgba(155, 89, 182, 0.05)',
  },

  userPermissionCard: {
    backgroundColor: 'rgba(155, 89, 182, 0.02)',
  },

  rtlPermissionCard: {
    alignItems: 'flex-end',
  },

  permissionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  rtlPermissionHeader: {
    flexDirection: 'row-reverse',
  },

  permissionInfo: {
    flex: 1,
    marginRight: 10,
  },

  permissionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },

  rtlPermissionTitleRow: {
    flexDirection: 'row-reverse',
  },

  typeIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  permissionName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },

  modulePermissionName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#9B59B6',
  },

  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },

  typeText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },

  permissionDescription: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
    lineHeight: 14,
  },

  selectionIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },

  selectedIndicator: {
    backgroundColor: '#9B59B6',
    borderColor: '#9B59B6',
  },

  userPermissionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(155, 89, 182, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    gap: 3,
    marginTop: 6,
  },

  userPermissionText: {
    fontSize: 10,
    color: '#9B59B6',
    fontWeight: '600',
  },

  // Save Button
  disabledSaveButton: {
    opacity: 0.7,
  },

  // Loading Container
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },

  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
});

export default PermissionManagerScreen;