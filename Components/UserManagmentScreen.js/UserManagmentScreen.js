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

const API_BASE_URL = 'https://planetdory.dwrylight.com/api';

const UserManagementScreen = ({ navigation }) => {
  // State management
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isRTL, setIsRTL] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Data states
  const [userList, setUserList] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const translate = (key) => languageService.translate(key);

  useEffect(() => {
    initializeScreen();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchQuery, userList]);

  const initializeScreen = async () => {
    const language = await languageService.loadSavedLanguage();
    setCurrentLanguage(language);
    setIsRTL(language === 'ar');
    
    await loadUserData();
    fetchUserList();
  };

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

  // Fetch user list
  const fetchUserList = async () => {
    const token = await getAuthToken();
    if (!token) {
      Alert.alert(translate('error'), translate('authTokenNotFound'));
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/fetch_all_users`, {
        method: 'GET',
        headers: {
          'Authorization': token,
        },
      });
      
      const result = await response.json();
      console.log('User List API Response:', result);
      
      if (result.status === 200) {
        setUserList(result.users || []);
      } else {
        Alert.alert(translate('error'), result.message || translate('failedToFetchUsers'));
      }
    } catch (error) {
      console.error('Fetch users error:', error);
      Alert.alert(translate('error'), translate('networkErrorFetchingUsers'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Filter users based on search query
  const filterUsers = () => {
    if (!searchQuery.trim()) {
      setFilteredUsers(userList);
      return;
    }

    const filtered = userList.filter(user => {
      const searchLower = searchQuery.toLowerCase();
      return (
        user.first_name.toLowerCase().includes(searchLower) ||
        user.last_name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.iqama_no.includes(searchQuery) ||
        user.role.toLowerCase().includes(searchLower)
      );
    });
    setFilteredUsers(filtered);
  };

  // Refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUserList();
  }, []);

  // Delete user
  const deleteUser = async (userId) => {
    const token = await getAuthToken();
    if (!token) {
      Alert.alert(translate('error'), translate('authTokenNotFound'));
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/destroy_user/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': token,
        },
      });
      
      const result = await response.json();
      console.log('Delete User Response:', result);
      
      if (result.status === 200) {
        Alert.alert(translate('success'), translate('userDeletedSuccessfully'));
        fetchUserList(); // Refresh the list
      } else {
        Alert.alert(translate('error'), result.message || translate('failedToDeleteUser'));
      }
    } catch (error) {
      console.error('Delete user error:', error);
      Alert.alert(translate('error'), translate('networkErrorDeletingUser'));
    }
  };

  // Confirm delete
  const confirmDelete = (user) => {
    // Prevent deleting own account
    if (user.id === currentUser?.id) {
      Alert.alert(translate('error'), translate('cannotDeleteOwnAccount'));
      return;
    }

    Alert.alert(
      translate('confirmDelete'),
      `${translate('confirmDeleteUser')} ${user.first_name} ${user.last_name}?`,
      [
        { text: translate('cancel'), style: 'cancel' },
        { 
          text: translate('delete'), 
          style: 'destructive',
          onPress: () => deleteUser(user.id)
        }
      ]
    );
  };

  // Get role color
  const getRoleColor = (role) => {
    switch (role.toLowerCase()) {
      case 'super admin': return '#E74C3C';
      case 'admin': return '#3498DB';
      case 'manager': return '#F39C12';
      case 'staff': return '#27AE60';
      default: return '#95A5A6';
    }
  };

  // Get role icon
  const getRoleIcon = (role) => {
    switch (role.toLowerCase()) {
      case 'super admin': return 'shield';
      case 'admin': return 'settings';
      case 'manager': return 'briefcase';
      case 'staff': return 'person';
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
          placeholder={translate('searchUsers')}
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

  // Render user stats
  const renderUserStats = () => {
    const roleStats = userList.reduce((acc, user) => {
      const role = user.role.toLowerCase();
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {});

    const totalUsers = userList.length;
    const adminUsers = (roleStats['super admin'] || 0) + (roleStats['admin'] || 0);
    const staffUsers = (roleStats['staff'] || 0) + (roleStats['manager'] || 0);

    return (
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: 'rgba(52, 152, 219, 0.1)' }]}>
          <Ionicons name="people" size={20} color="#3498DB" />
          <Text style={[styles.statValue, { color: '#3498DB' }, isRTL && commonStyles.arabicText]}>
            {totalUsers}
          </Text>
          <Text style={[styles.statLabel, isRTL && commonStyles.arabicText]}>
            {translate('totalUsers')}
          </Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: 'rgba(231, 76, 60, 0.1)' }]}>
          <Ionicons name="shield" size={20} color="#E74C3C" />
          <Text style={[styles.statValue, { color: '#E74C3C' }, isRTL && commonStyles.arabicText]}>
            {adminUsers}
          </Text>
          <Text style={[styles.statLabel, isRTL && commonStyles.arabicText]}>
            {translate('adminUsers')}
          </Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: 'rgba(39, 174, 96, 0.1)' }]}>
          <Ionicons name="person" size={20} color="#27AE60" />
          <Text style={[styles.statValue, { color: '#27AE60' }, isRTL && commonStyles.arabicText]}>
            {staffUsers}
          </Text>
          <Text style={[styles.statLabel, isRTL && commonStyles.arabicText]}>
            {translate('staffUsers')}
          </Text>
        </View>
      </View>
    );
  };

  // Render user item
  const renderUserItem = ({ item }) => (
    <View style={[styles.userCard, isRTL && styles.rtlUserCard]}>
      {/* User Header */}
      <View style={[styles.userHeader, isRTL && styles.rtlUserHeader]}>
        <View style={styles.userInfo}>
          <Text style={[styles.userName, isRTL && commonStyles.arabicText]}>
            {item.first_name} {item.last_name}
          </Text>
          <Text style={[styles.userEmail, isRTL && commonStyles.arabicText]}>
            {item.email}
          </Text>
        </View>
        
        <View style={[styles.roleBadge, { backgroundColor: `${getRoleColor(item.role)}20` }]}>
          <Ionicons name={getRoleIcon(item.role)} size={16} color={getRoleColor(item.role)} />
          <Text style={[styles.roleText, { color: getRoleColor(item.role) }, isRTL && commonStyles.arabicText]}>
            {translate(item.role.toLowerCase().replace(' ', ''))}
          </Text>
        </View>
      </View>

      {/* User Details */}
      <View style={styles.userDetails}>
        {/* Iqama Number */}
        <View style={[styles.detailRow, isRTL && styles.rtlDetailRow]}>
          <Ionicons name="card" size={16} color="#666" />
          <Text style={[styles.detailLabel, isRTL && commonStyles.arabicText]}>
            {translate('iqamaNo')}:
          </Text>
          <Text style={[styles.detailText, isRTL && commonStyles.arabicText]}>
            {item.iqama_no}
          </Text>
        </View>

        {/* Date of Birth */}
        <View style={[styles.detailRow, isRTL && styles.rtlDetailRow]}>
          <Ionicons name="calendar" size={16} color="#666" />
          <Text style={[styles.detailLabel, isRTL && commonStyles.arabicText]}>
            {translate('dateOfBirth')}:
          </Text>
          <Text style={[styles.detailText, isRTL && commonStyles.arabicText]}>
            {new Date(item.dob).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
          </Text>
        </View>

        {/* Registration Date */}
        <View style={[styles.detailRow, isRTL && styles.rtlDetailRow]}>
          <Ionicons name="time" size={16} color="#666" />
          <Text style={[styles.detailLabel, isRTL && commonStyles.arabicText]}>
            {translate('registeredOn')}:
          </Text>
          <Text style={[styles.detailText, isRTL && commonStyles.arabicText]}>
            {new Date(item.created_at).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
          </Text>
        </View>

        {/* Current User Badge */}
        {item.id === currentUser?.id && (
          <View style={styles.currentUserBadge}>
            <Ionicons name="person-circle" size={16} color="#6B7D3D" />
            <Text style={[styles.currentUserText, isRTL && commonStyles.arabicText]}>
              {translate('currentUser')}
            </Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={[styles.actionButtons, isRTL && styles.rtlActionButtons]}>
  <TouchableOpacity
    style={[styles.actionButton, styles.permissionButton]}
    onPress={() => navigation.navigate('PermissionManagerScreen', { 
      userId: item.id,
      userName: `${item.first_name} ${item.last_name}`,
      userEmail: item.email
    })}
  >
    <Ionicons name="key" size={16} color="#9B59B6" />
    <Text style={[styles.actionButtonText, { color: '#9B59B6' }, isRTL && commonStyles.arabicText]}>
      {translate('permissions')}
    </Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={[styles.actionButton, styles.editButton]}
    onPress={() => navigation.navigate('AddEditUserScreen', { 
      user: item, 
      isEdit: true,
      onUserUpdated: fetchUserList 
    })}
  >
    <Ionicons name="create" size={16} color="#3498DB" />
    <Text style={[styles.actionButtonText, { color: '#3498DB' }, isRTL && commonStyles.arabicText]}>
      {translate('edit')}
    </Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={[
      styles.actionButton, 
      styles.deleteButton,
      item.id === currentUser?.id && styles.disabledButton
    ]}
    onPress={() => confirmDelete(item)}
    disabled={item.id === currentUser?.id}
  >
    <Ionicons name="trash" size={16} color={item.id === currentUser?.id ? "#ccc" : "#E74C3C"} />
    <Text style={[
      styles.actionButtonText, 
      { color: item.id === currentUser?.id ? "#ccc" : "#E74C3C" }, 
      isRTL && commonStyles.arabicText
    ]}>
      {translate('delete')}
    </Text>
  </TouchableOpacity>
</View>

    </View>
  );

  // Render empty state
  const renderEmptyState = () => (
    <View style={commonStyles.emptyContainer}>
      <Ionicons name="people-outline" size={64} color="#ccc" />
      <Text style={[commonStyles.emptyText, isRTL && commonStyles.arabicText]}>
        {searchQuery ? translate('noUsersFound') : translate('noUsers')}
      </Text>
      <Text style={[commonStyles.emptySubtext, isRTL && commonStyles.arabicText]}>
        {searchQuery ? translate('tryDifferentSearch') : translate('addFirstUser')}
      </Text>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={commonStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B7D3D" />
        <Text style={[commonStyles.loadingText, isRTL && commonStyles.arabicText]}>
          {translate('loadingUsers')}
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
                {translate('userManagement')}
              </Text>
              <Text style={[commonStyles.headerSubtitle, isRTL && commonStyles.arabicText]}>
                {translate('manageSystemUsers')}
              </Text>
            </View>
            <TouchableOpacity
              style={commonStyles.addButton}
              onPress={() => navigation.navigate('AddEditUserScreen', { 
                isEdit: false,
                onUserAdded: fetchUserList 
              })}
            >
              <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      <View style={commonStyles.content}>
        {/* Search Header */}
        {renderSearchHeader()}

        {/* User Stats */}
        {renderUserStats()}

        {/* User List */}
        <FlatList
          data={filteredUsers}
          renderItem={renderUserItem}
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

  // User Cards
  listContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },

  userCard: {
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

  rtlUserCard: {
    alignItems: 'flex-end',
  },

  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },

  rtlUserHeader: {
    flexDirection: 'row-reverse',
  },

  userInfo: {
    flex: 1,
  },

  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },

  userEmail: {
    fontSize: 12,
    color: '#666',
  },

  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },

  roleText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // User Details
  userDetails: {
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

  detailLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    minWidth: 80,
  },

  detailText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },

  currentUserBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(107, 125, 61, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 4,
    marginTop: 4,
  },

  currentUserText: {
    fontSize: 12,
    color: '#6B7D3D',
    fontWeight: '600',
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

  disabledButton: {
    backgroundColor: '#f5f5f5',
    borderColor: '#ccc',
  },

  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  permissionButton: {
  backgroundColor: 'rgba(155, 89, 182, 0.1)',
  borderWidth: 1,
  borderColor: '#9B59B6',
},
});

export default UserManagementScreen;