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
  TextInput,
  ActivityIndicator,
  Modal,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import languageService from '../Globals/Store/Lang';
import AsyncStorage from '@react-native-async-storage/async-storage';
import getAuthToken from '../Globals/Store/LocalData';
import getUserRole from '../Globals/Store/GetRoleId';
import simplePermissions from '../Globals/Store/PermissionsDemo';

const API_BASE_URL = 'https://planetdory.dwrylight.com/api';

const ExpenseListScreen = ({ navigation }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isRTL, setIsRTL] = useState(false);
  const [roleId, setRoleId] = useState(null);
  const [userPermissions, setUserPermissions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  
  const translate = (key) => languageService.translate(key);

  useEffect(() => {
    initializeScreen();
    fetchExpenses();
  }, []);

  const initializeScreen = async () => {
    try {
      // Get user role
      const role = await getUserRole();
      setRoleId(role);

      // Fetch user permissions if not admin
      if (role === 3) {
        const permissions = await simplePermissions.fetchUserPermissions();
        setUserPermissions(permissions);
      }

      // Load language
      const language = await languageService.loadSavedLanguage();
      setCurrentLanguage(language);
      setIsRTL(language === 'ar');
    } catch (error) {
      console.error('Error initializing permissions:', error);
    }
  };

  // Permission check functions
  const hasExpensePermission = (type) => {
    // If admin (not role 3), allow everything
    if (roleId !== 3) {
      return true;
    }
    
    // For staff (role 3), check specific permissions
    const permissionName = `expenses.${type}`;
    return userPermissions.some(permission => 
      permission.name === permissionName && permission.module === 'expenses'
    );
  };

  const canCreateExpenses = () => hasExpensePermission('create');
  const canEditExpenses = () => hasExpensePermission('edit');
  const canDeleteExpenses = () => hasExpensePermission('delete');
  const canViewExpenses = () => hasExpensePermission('view') || hasExpensePermission('management');

  // Fetch all expenses with pagination
  const fetchExpenses = async (page = 1, append = false) => {
    try {
      // Set loading state
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const token = await getAuthToken();
      if (!token) {
        Alert.alert(translate('error'), translate('authTokenNotFound'));
        return;
      }

      const response = await fetch(`${API_BASE_URL}/fetch_all_expenses?page=${page}`, {
        method: 'GET',
        headers: {
          'Authorization': token,
        },
      });
      
      const result = await response.json();
      console.log('Expenses API Response:', result);
      
      if (result.status == 200) {
        const newExpenses = result?.data || [];
        
        if (append) {
          setExpenses(prev => [...prev, ...newExpenses]);
        } else {
          setExpenses(newExpenses);
        }
        
        // Check if there's more data based on pagination response
        let hasNextPage = false;
        if (result.next_page_url != null) {
          hasNextPage = true;
        } else if (result.current_page != null && result.last_page != null) {
          hasNextPage = result.current_page < result.last_page;
        } else if (Array.isArray(newExpenses) && newExpenses.length > 0) {
          const perPage = result.per_page || 10;
          hasNextPage = newExpenses.length === perPage;
        }
        
        setHasMoreData(hasNextPage);
        setCurrentPage(page);
      } else {
        Alert.alert(translate('error'), result.message || translate('failedToFetchExpenses'));
      }
    } catch (error) {
      console.error('Fetch expenses error:', error);
      Alert.alert(translate('error'), translate('networkErrorFetchingExpenses'));
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  // Load more expenses
  const loadMoreExpenses = () => {
    if (hasMoreData && !loading && !loadingMore) {
      const nextPage = currentPage + 1;
      fetchExpenses(nextPage, true);
    }
  };

  // Delete expense
  const deleteExpense = async (expenseId) => {
    // Check delete permission
    if (!canDeleteExpenses()) {
      Alert.alert(translate('accessDenied'), translate('noPermissionToDeleteExpense'));
      return;
    }

    Alert.alert(
      translate('deleteExpense'),
      translate('deleteExpenseConfirmation'),
      [
        { text: translate('cancel'), style: 'cancel' },
        {
          text: translate('delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await getAuthToken();
              if (!token) return;

              const response = await fetch(`${API_BASE_URL}/delete_expense_by_id/${expenseId}`, {
                method: 'POST',
                headers: {
                  'Authorization': token,
                },
              });
              
              const result = await response.json();
              
              if (result.status == 200) {
                Alert.alert(translate('success'), translate('expenseDeletedSuccessfully'));
                // Reset to first page and refresh
                setCurrentPage(1);
                setHasMoreData(true);
                fetchExpenses(1, false);
              } else {
                Alert.alert(translate('error'), result.message || translate('failedToDeleteExpense'));
              }
            } catch (error) {
              console.error('Delete expense error:', error);
              Alert.alert(translate('error'), translate('networkErrorDeletingExpense'));
            }
          },
        },
      ]
    );
  };

  // Filter expenses based on search and status
  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = 
      expense.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.vendor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.staff?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.department?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === 'all' || expense.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setCurrentPage(1);
    setHasMoreData(true);
    fetchExpenses(1, false);
  }, []);

  // Calculate statistics
  const calculateStats = () => {
    return expenses.reduce((stats, expense) => {
      stats.totalAmount += parseFloat(expense.amount) || 0;
      stats.totalExpenses += 1;
      if (expense.status === 'approved') stats.approvedExpenses += 1;
      if (expense.status === 'pending') stats.pendingExpenses += 1;
      if (expense.status === 'rejected') stats.rejectedExpenses += 1;
      return stats;
    }, { totalAmount: 0, totalExpenses: 0, approvedExpenses: 0, pendingExpenses: 0, rejectedExpenses: 0 });
  };

  const stats = calculateStats();

  // Get expense status color and icon
  const getExpenseStatusInfo = (status) => {
    switch (status) {
      case 'approved':
        return { color: '#27AE60', icon: 'checkmark-circle', bgColor: 'rgba(39, 174, 96, 0.1)' };
      case 'pending':
        return { color: '#F39C12', icon: 'time', bgColor: 'rgba(243, 156, 18, 0.1)' };
      case 'rejected':
        return { color: '#E74C3C', icon: 'close-circle', bgColor: 'rgba(231, 76, 60, 0.1)' };
      default:
        return { color: '#95A5A6', icon: 'help-circle', bgColor: 'rgba(149, 165, 166, 0.1)' };
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US');
  };

  // Format currency
  const formatCurrency = (amount) => {
    const number = parseFloat(amount) || 0;
    return isRTL ? `${number.toFixed(2)} ر.س` : `$${number.toFixed(2)}`;
  };

  // Handle image view
  const handleImageView = (imageUrl) => {
    setSelectedImage(imageUrl);
    setShowImageModal(true);
  };

  // Get category icon
  const getCategoryIcon = (category) => {
    const categoryLower = category?.toLowerCase() || '';
    if (categoryLower.includes('office')) return 'business';
    if (categoryLower.includes('travel')) return 'airplane';
    if (categoryLower.includes('food') || categoryLower.includes('meal')) return 'restaurant';
    if (categoryLower.includes('fuel') || categoryLower.includes('gas')) return 'car';
    if (categoryLower.includes('equipment')) return 'construct';
    if (categoryLower.includes('software')) return 'laptop';
    return 'receipt';
  };

  // Render filter options
  const filterOptions = [
    { key: 'all', label: translate('allExpenses') },
    { key: 'approved', label: translate('approvedExpenses') },
    { key: 'pending', label: translate('pendingExpenses') },
    { key: 'rejected', label: translate('rejectedExpenses') },
  ];

  // Render expense card
  const renderExpenseCard = (expense) => {
    const statusInfo = getExpenseStatusInfo(expense.status);
    
    return (
      <View key={expense.id} style={styles.expenseCard}>
        <View style={[styles.expenseHeader, isRTL && styles.rtlExpenseHeader]}>
          <View style={styles.expenseInfo}>
            <View style={[styles.categoryRow, isRTL && styles.rtlCategoryRow]}>
              <View style={styles.categoryIconContainer}>
                <Ionicons name={getCategoryIcon(expense.category)} size={20} color="#6B7D3D" />
              </View>
              <Text style={[styles.categoryText, isRTL && styles.arabicText]}>
                {expense.category}
              </Text>
            </View>
            <Text style={[styles.expenseDescription, isRTL && styles.arabicText]}>
              {expense.description}
            </Text>
          </View>
          
          <View style={[styles.expenseAmount, isRTL && styles.rtlExpenseAmount]}>
            <Text style={[styles.amountText, isRTL && styles.arabicText]}>
              {formatCurrency(expense.amount)}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: statusInfo.bgColor }]}>
              <Ionicons name={statusInfo.icon} size={16} color={statusInfo.color} />
              <Text style={[styles.statusText, { color: statusInfo.color }, isRTL && styles.arabicText]}>
                {translate(expense.status)}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.expenseDetails, isRTL && styles.rtlExpenseDetails]}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar" size={16} color="#666" />
            <Text style={[styles.detailText, isRTL && styles.arabicText]}>
              {formatDate(expense.expense_date)}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="card" size={16} color="#666" />
            <Text style={[styles.detailText, isRTL && styles.arabicText]}>
              {expense.payment_method}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="person" size={16} color="#666" />
            <Text style={[styles.detailText, isRTL && styles.arabicText]}>
              {expense.staff}
            </Text>
          </View>
        </View>

        {(expense.vendor || expense.department) && (
          <View style={[styles.expenseMeta, isRTL && styles.rtlExpenseMeta]}>
            {expense.vendor && (
              <View style={styles.metaRow}>
                <Text style={[styles.metaLabel, isRTL && styles.arabicText]}>
                  {translate('vendor')}:
                </Text>
                <Text style={[styles.metaValue, isRTL && styles.arabicText]}>
                  {expense.vendor}
                </Text>
              </View>
            )}
            
            {expense.department && (
              <View style={styles.metaRow}>
                <Text style={[styles.metaLabel, isRTL && styles.arabicText]}>
                  {translate('department')}:
                </Text>
                <Text style={[styles.metaValue, isRTL && styles.arabicText]}>
                  {expense.department}
                </Text>
              </View>
            )}
          </View>
        )}

        {expense.receipt_image && (
          <TouchableOpacity
            style={styles.receiptImageContainer}
            onPress={() => handleImageView(expense.receipt_image)}
          >
            <Image
              source={{ uri: expense.receipt_image }}
              style={styles.receiptThumbnail}
              resizeMode="cover"
            />
            <View style={styles.imageOverlay}>
              <Ionicons name="eye" size={20} color="#fff" />
              <Text style={[styles.viewImageText, isRTL && styles.arabicText]}>
                {translate('viewReceipt')}
              </Text>
            </View>
          </TouchableOpacity>
        )}

        <View style={[styles.expenseActions, isRTL && styles.rtlExpenseActions]}>
          <TouchableOpacity
            style={[styles.actionButton, styles.viewButton]}
            onPress={() => navigation.navigate('ExpenseDetails', { expense })}
          >
            <Ionicons name="eye" size={16} color="#3498DB" />
            <Text style={[styles.actionButtonText, { color: '#3498DB' }, isRTL && styles.arabicText]}>
              {translate('view')}
            </Text>
          </TouchableOpacity>

          {canEditExpenses() && (
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() => navigation.navigate('EditExpense', { expense })}
            >
              <Ionicons name="pencil" size={16} color="#6B7D3D" />
              <Text style={[styles.actionButtonText, { color: '#6B7D3D' }, isRTL && styles.arabicText]}>
                {translate('edit')}
              </Text>
            </TouchableOpacity>
          )}

          {canDeleteExpenses() && (
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => deleteExpense(expense.id)}
            >
              <Ionicons name="trash" size={16} color="#E74C3C" />
              <Text style={[styles.actionButtonText, { color: '#E74C3C' }, isRTL && styles.arabicText]}>
                {translate('delete')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  // Show loading if permissions not loaded yet
  if (loading || roleId === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B7D3D" />
        <Text style={[styles.loadingText, isRTL && styles.arabicText]}>
          {translate('loadingExpenses')}
        </Text>
      </View>
    );
  }

  // Check if user has access to view expenses at all
  if (!canViewExpenses()) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.noAccessContainer}>
          <Ionicons name="lock-closed" size={64} color="#ccc" />
          <Text style={styles.noAccessText}>Access Denied</Text>
          <Text style={styles.noAccessSubtext}>
            You do not have permission to view expenses
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
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <LinearGradient colors={['#6B7D3D', '#4A5D23']} style={styles.headerGradient}>
          <View style={[styles.headerContent, isRTL && styles.rtlHeaderContent]}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
              <Text style={[styles.headerTitle, isRTL && styles.arabicText]}>
                {translate('expenseManagement')}
              </Text>
              <Text style={[styles.headerSubtitle, isRTL && styles.arabicText]}>
                {expenses.length} {translate('expensesTotal')} • {formatCurrency(stats.totalAmount)}
                {roleId === 3 && (
                  <Text style={{ color: '#fff', opacity: 0.8 }}> • Permission Based</Text>
                )}
              </Text>
            </View>
            {canCreateExpenses() && (
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate('AddExpense')}
              >
                <Ionicons name="add" size={24} color="#fff" />
              </TouchableOpacity>
            )}
            {!canCreateExpenses() && (
              <View style={[styles.addButton, { opacity: 0.3 }]} />
            )}
          </View>
        </LinearGradient>
      </View>

      {/* Permission Info Bar */}
      {roleId === 3 && (
        <View style={styles.permissionBar}>
          <View style={styles.permissionInfo}>
            <Ionicons name="information-circle" size={16} color="#6B7D3D" />
            <Text style={styles.permissionText}>
              Your permissions: 
              {canViewExpenses() && ' View'}
              {canCreateExpenses() && ' • Create'}
              {canEditExpenses() && ' • Edit'}
              {canDeleteExpenses() && ' • Delete'}
            </Text>
          </View>
        </View>
      )}

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="receipt" size={24} color="#6B7D3D" />
          <Text style={[styles.statNumber, isRTL && styles.arabicText]}>
            {stats.totalExpenses}
          </Text>
          <Text style={[styles.statLabel, isRTL && styles.arabicText]}>
            {translate('totalExpenses')}
          </Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="checkmark-circle" size={24} color="#27AE60" />
          <Text style={[styles.statNumber, isRTL && styles.arabicText]}>
            {stats.approvedExpenses}
          </Text>
          <Text style={[styles.statLabel, isRTL && styles.arabicText]}>
            {translate('approved')}
          </Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="time" size={24} color="#F39C12" />
          <Text style={[styles.statNumber, isRTL && styles.arabicText]}>
            {stats.pendingExpenses}
          </Text>
          <Text style={[styles.statLabel, isRTL && styles.arabicText]}>
            {translate('pending')}
          </Text>
        </View>
      </View>

      {/* Search and Filter Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, isRTL && styles.rtlSearchBar]}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={[styles.searchInput, isRTL && styles.arabicInput]}
            placeholder={translate('searchExpenses')}
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
        
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Ionicons name="filter" size={20} color="#6B7D3D" />
          <Text style={[styles.filterButtonText, isRTL && styles.arabicText]}>
            {translate('filter')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Expenses List */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6B7D3D']} />
        }
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const paddingToBottom = 20;
          const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
          if (isCloseToBottom && hasMoreData && !loading && !loadingMore) {
            loadMoreExpenses();
          }
        }}
        scrollEventThrottle={400}
      >
        {filteredExpenses.length > 0 ? (
          <>
            {filteredExpenses.map(renderExpenseCard)}
            
            {/* Load More Indicator */}
            {loadingMore && (
              <View style={styles.loadMoreContainer}>
                <ActivityIndicator size="small" color="#6B7D3D" />
                <Text style={styles.loadMoreText}>Loading more expenses...</Text>
              </View>
            )}
            {!hasMoreData && expenses.length > 0 && (
              <View style={styles.loadMoreContainer}>
                <Text style={styles.loadMoreText}>No more expenses to load</Text>
              </View>
            )}
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color="#ccc" />
            <Text style={[styles.emptyText, isRTL && styles.arabicText]}>
              {searchQuery || filterStatus !== 'all' 
                ? translate('noExpensesFound') 
                : translate('noExpensesAvailable')
              }
            </Text>
            <Text style={[styles.emptySubtext, isRTL && styles.arabicText]}>
              {searchQuery || filterStatus !== 'all'
                ? translate('tryAdjustingSearch')
                : translate('addFirstExpense')
              }
            </Text>
            {!searchQuery && filterStatus === 'all' && (
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => navigation.navigate('AddExpense')}
              >
                <Text style={[styles.emptyButtonText, isRTL && styles.arabicText]}>
                  {translate('addExpense')}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={[styles.modalHeader, isRTL && styles.rtlModalHeader]}>
            <Text style={[styles.modalTitle, isRTL && styles.arabicText]}>
              {translate('filterExpenses')}
            </Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowFilterModal(false)}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.filterOptions}>
            {filterOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.filterOption,
                  filterStatus === option.key && styles.filterOptionActive
                ]}
                onPress={() => {
                  setFilterStatus(option.key);
                  setShowFilterModal(false);
                }}
              >
                <Text style={[
                  styles.filterOptionText,
                  filterStatus === option.key && styles.filterOptionTextActive,
                  isRTL && styles.arabicText
                ]}>
                  {option.label}
                </Text>
                {filterStatus === option.key && (
                  <Ionicons name="checkmark" size={20} color="#6B7D3D" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </SafeAreaView>
      </Modal>

      {/* Image View Modal */}
      <Modal
        visible={showImageModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowImageModal(false)}
      >
        <View style={styles.imageModalContainer}>
          <TouchableOpacity
            style={styles.imageModalOverlay}
            onPress={() => setShowImageModal(false)}
          >
            <View style={styles.imageModalContent}>
              <TouchableOpacity
                style={styles.imageCloseButton}
                onPress={() => setShowImageModal(false)}
              >
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
              
              {selectedImage && (
                <Image
                  source={{ uri: selectedImage }}
                  style={styles.fullImage}
                  resizeMode="contain"
                />
              )}
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
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
    backgroundColor: '#f8fafb',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    marginBottom: 0,
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rtlHeaderContent: {
    flexDirection: 'row-reverse',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 10,
  },
  searchBar: {
    flex: 1,
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
  arabicInput: {
    marginLeft: 0,
    marginRight: 10,
    textAlign: 'right',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(107, 125, 61, 0.1)',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 5,
  },
  filterButtonText: {
    fontSize: 14,
    color: '#6B7D3D',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  expenseCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  rtlExpenseHeader: {
    flexDirection: 'row-reverse',
  },
  expenseInfo: {
    flex: 1,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rtlCategoryRow: {
    flexDirection: 'row-reverse',
  },
  categoryIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(107, 125, 61, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7D3D',
  },
  expenseDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    lineHeight: 22,
  },
  expenseAmount: {
    alignItems: 'flex-end',
  },
  rtlExpenseAmount: {
    alignItems: 'flex-start',
  },
  amountText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
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
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  expenseDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  rtlExpenseDetails: {
    flexDirection: 'row-reverse',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  expenseMeta: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 15,
    marginBottom: 15,
  },
  rtlExpenseMeta: {
    alignItems: 'flex-end',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  metaLabel: {
    fontSize: 13,
    color: '#666',
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  receiptImageContainer: {
    position: 'relative',
    height: 80,
    backgroundColor: '#f8fafb',
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
  },
  receiptThumbnail: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  viewImageText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  expenseActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 15,
  },
  rtlExpenseActions: {
    flexDirection: 'row-reverse',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 5,
  },
  viewButton: {
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
  },
  editButton: {
    backgroundColor: 'rgba(107, 125, 61, 0.1)',
  },
  deleteButton: {
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
    textAlign: 'center',
    marginBottom: 30,
  },
  emptyButton: {
    backgroundColor: '#6B7D3D',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8fafb',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  rtlModalHeader: {
    flexDirection: 'row-reverse',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterOptions: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  filterOptionActive: {
    backgroundColor: 'rgba(107, 125, 61, 0.1)',
    borderWidth: 1,
    borderColor: '#6B7D3D',
  },
  filterOptionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  filterOptionTextActive: {
    color: '#6B7D3D',
    fontWeight: '600',
  },
  
  // Image Modal Styles
  imageModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  imageModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageModalContent: {
    flex: 1,
    width: '100%',
    position: 'relative',
  },
  imageCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  fullImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },

  // RTL Support
  arabicText: {
    textAlign: 'right',
    fontFamily: 'Arabic',
  },

  // Permission-related styles
  permissionBar: {
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  
  permissionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  permissionText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6B7D3D',
    fontWeight: '500',
  },

  // Access denied styles
  noAccessContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafb',
    paddingHorizontal: 32,
  },
  
  noAccessText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  
  noAccessSubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  
  backButton: {
    backgroundColor: '#6B7D3D',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadMoreContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadMoreText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
  },
});

export default ExpenseListScreen;