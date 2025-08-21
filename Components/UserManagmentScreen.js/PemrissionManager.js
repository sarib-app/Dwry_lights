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
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Data states
  const [allPermissions, setAllPermissions] = useState([]);
  const [userPermissions, setUserPermissions] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState(new Set());
  const [filteredPermissions, setFilteredPermissions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const translate = (key) => languageService.translate(key);

  useEffect(() => {
    initializeScreen();
  }, []);

  useEffect(() => {
    filterPermissions();
  }, [searchQuery, allPermissions]);

  const initializeScreen = async () => {
    const language = await languageService.loadSavedLanguage();
    setCurrentLanguage(language);
    setIsRTL(language === 'ar');
    
    await fetchUserPermissions();
    await fetchAllPermissions(1, true);
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

  // Fetch all permissions with pagination
  const fetchAllPermissions = async (page = 1, reset = false) => {
    const token = await getAuthToken();
    if (!token) {
      Alert.alert(translate('error'), translate('authTokenNotFound'));
      return;
    }

    if (page === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/fetch_all_permissions?page=${page}`, {
        method: 'GET',
        headers: {
          'Authorization': token,
        },
      });
      
      const result = await response.json();
      console.log('All Permissions Response:', result);
      
      if (result.message === 'Permissions fetched successfully') {
        const newPermissions = result.data.data || [];
        
        if (reset) {
          setAllPermissions(newPermissions);
        } else {
          setAllPermissions(prev => [...prev, ...newPermissions]);
        }
        
        setCurrentPage(result.data.current_page);
        setTotalPages(result.data.last_page);
      } else {
        Alert.alert(translate('error'), result.message || translate('failedToFetchPermissions'));
      }
    } catch (error) {
      console.error('Fetch all permissions error:', error);
      Alert.alert(translate('error'), translate('networkErrorFetchingPermissions'));
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  // Load more permissions
  const loadMorePermissions = () => {
    if (currentPage < totalPages && !loadingMore) {
      fetchAllPermissions(currentPage + 1, false);
    }
  };

  // Filter permissions based on search query
  const filterPermissions = () => {
    if (!searchQuery.trim()) {
      // Group permissions by module and sort user permissions to top
      const userPermissionIds = new Set(userPermissions.map(p => p.id));
      const sorted = [...allPermissions].sort((a, b) => {
        // First sort by whether user has permission (user permissions first)
        const aHasPermission = userPermissionIds.has(a.id) ? 1 : 0;
        const bHasPermission = userPermissionIds.has(b.id) ? 1 : 0;
        
        if (aHasPermission !== bHasPermission) {
          return bHasPermission - aHasPermission;
        }
        
        // Then sort by module
        if (a.module !== b.module) {
          return a.module.localeCompare(b.module);
        }
        
        // Then sort by type (module type first)
        if (a.type === 'module' && b.type !== 'module') return -1;
        if (a.type !== 'module' && b.type === 'module') return 1;
        
        return a.name.localeCompare(b.name);
      });
      
      setFilteredPermissions(sorted);
      return;
    }

    const filtered = allPermissions.filter(permission => {
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
  const savePermissions = async () => {
    const token = await getAuthToken();
    if (!token) {
      Alert.alert(translate('error'), translate('authTokenNotFound'));
      return;
    }

    setSaving(true);
    try {
      const permissionIds = Array.from(selectedPermissions);
      
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
      console.log('Assign Permissions Response:', result);
      
      if (result.status === 200) {
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
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setCurrentPage(1);
    fetchUserPermissions();
    fetchAllPermissions(1, true);
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
                  size={14} 
                  color={getPermissionTypeColor(item.type)} 
                />
              </View>
              
              <Text style={[
                styles.permissionName,
                isModuleType && styles.modulePermissionName,
                isRTL && commonStyles.arabicText
              ]}>
                {item.name.replace(`${item.module}.`, '')}
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
            
            <Text style={[styles.moduleText, isRTL && commonStyles.arabicText]}>
              {translate('module')}: {item.module}
            </Text>
          </View>

          {/* Selection Indicator */}
          <View style={[
            styles.selectionIndicator,
            isSelected && styles.selectedIndicator
          ]}>
            {isSelected && (
              <Ionicons name="checkmark" size={16} color="#fff" />
            )}
          </View>
        </View>

        {/* User Permission Badge */}
        {isUserPermission && (
          <View style={styles.userPermissionBadge}>
            <Ionicons name="person-circle" size={12} color="#9B59B6" />
            <Text style={[styles.userPermissionText, isRTL && commonStyles.arabicText]}>
              {translate('currentlyAssigned')}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Render load more footer
  const renderFooter = () => {
    if (!loadingMore) return null;
    
    return (
      <View style={styles.loadMoreContainer}>
        <ActivityIndicator size="small" color="#9B59B6" />
        <Text style={[styles.loadMoreText, isRTL && commonStyles.arabicText]}>
          {translate('loadingMorePermissions')}
        </Text>
      </View>
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

  if (loading && !refreshing) {
    return (
      <View style={commonStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#9B59B6" />
        <Text style={[commonStyles.loadingText, isRTL && commonStyles.arabicText]}>
          {translate('loadingPermissions')}
        </Text>
      </View>
    );
  }

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

        {/* Permissions List */}
        <FlatList
          data={filteredPermissions}
          renderItem={renderPermissionItem}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={renderEmptyState}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#9B59B6']} />
          }
          onEndReached={loadMorePermissions}
          onEndReachedThreshold={0.1}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
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
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 2,
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
    marginRight: 15,
  },

  permissionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },

  rtlPermissionTitleRow: {
    flexDirection: 'row-reverse',
  },

  typeIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  permissionName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },

  modulePermissionName: {
    fontSize: 15,
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
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
    lineHeight: 16,
  },

  moduleText: {
    fontSize: 11,
    color: '#999',
    fontStyle: 'italic',
  },

  selectionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    gap: 4,
    marginTop: 8,
  },

  userPermissionText: {
    fontSize: 10,
    color: '#9B59B6',
    fontWeight: '600',
  },

  // Load More
  loadMoreContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },

  loadMoreText: {
    fontSize: 14,
    color: '#666',
  },

  // Save Button
  disabledSaveButton: {
    opacity: 0.7,
  },
});

export default PermissionManagerScreen;