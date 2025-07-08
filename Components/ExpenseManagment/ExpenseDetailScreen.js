import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Modal,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import languageService from '../Globals/Store/Lang';
import getAuthToken from '../Globals/Store/LocalData';

const API_BASE_URL = 'https://planetdory.dwrylight.com/api';

const ExpenseDetailsScreen = ({ navigation, route }) => {
  const { expense: initialExpense } = route.params;
  
  const [expense, setExpense] = useState(initialExpense);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showActionsModal, setShowActionsModal] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isRTL, setIsRTL] = useState(false);

  const translate = (key) => languageService.translate(key);

  useEffect(() => {
    initializeScreen();
    fetchExpenseDetails();
  }, []);

  const initializeScreen = async () => {
    const language = await languageService.loadSavedLanguage();
    setCurrentLanguage(language);
    setIsRTL(language === 'ar');
  };

  // Fetch complete expense details
  const fetchExpenseDetails = async () => {
    if (!initialExpense?.id) return;
    
    setRefreshing(true);
    const token = await getAuthToken();
    if (!token) {
      Alert.alert(translate('error'), translate('authTokenNotFound'));
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/fetch_expense_by_id/${initialExpense.id}`, {
        method: 'GET',
        headers: {
          'Authorization': token,
        },
      });
      
      const result = await response.json();
      console.log('Expense Details API Response:', result);
      
      if (result.status == 200) {
        setExpense(result.data || initialExpense);
      } else {
        Alert.alert(translate('error'), result.message || translate('failedToFetchExpenseDetails'));
      }
    } catch (error) {
      console.error('Fetch expense details error:', error);
      Alert.alert(translate('error'), translate('networkErrorFetchingDetails'));
    } finally {
      setRefreshing(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    const number = parseFloat(amount) || 0;
    return isRTL ? `${number.toFixed(2)} ر.س` : `$${number.toFixed(2)}`;
  };

  // Get expense status info
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

  // Handle image view
  const handleImageView = () => {
    if (expense.receipt_image) {
      setShowImageModal(true);
    }
  };

  // Action buttons
  const actionButtons = [
    {
      title: translate('editExpense'),
      icon: 'pencil',
      action: () => navigation.navigate('EditExpense', { expense }),
      color: '#F39C12'
    },
    {
      title: translate('approveExpense'),
      icon: 'checkmark-circle',
      action: () => handleStatusUpdate('approved'),
      color: '#27AE60',
      show: expense.status !== 'approved'
    },
    {
      title: translate('rejectExpense'),
      icon: 'close-circle',
      action: () => handleStatusUpdate('rejected'),
      color: '#E74C3C',
      show: expense.status !== 'rejected'
    },
    {
      title: translate('markPending'),
      icon: 'time',
      action: () => handleStatusUpdate('pending'),
      color: '#F39C12',
      show: expense.status !== 'pending'
    }
  ].filter(action => action.show !== false);

  // Handle status update
  const handleStatusUpdate = async (newStatus) => {
    Alert.alert(
      translate('updateExpenseStatus'),
      translate('confirmStatusUpdate').replace('%status%', translate(newStatus)),
      [
        { text: translate('cancel'), style: 'cancel' },
        {
          text: translate('update'),
          onPress: async () => {
            setLoading(true);
            try {
              const token = await getAuthToken();
              if (!token) return;

              const formData = new FormData();
              formData.append('amount', expense.amount);
              formData.append('status', newStatus);

              const response = await fetch(`${API_BASE_URL}/update_expense_by_id/${expense.id}`, {
                method: 'POST',
                headers: {
                  'Authorization': token,
                  'Content-Type': 'multipart/form-data',
                },
                body: formData,
              });

              const result = await response.json();
              
              if (result.status == 200) {
                setExpense(prev => ({ ...prev, status: newStatus }));
                Alert.alert(translate('success'), translate('expenseStatusUpdated'));
                setShowActionsModal(false);
              } else {
                Alert.alert(translate('error'), result.message || translate('failedToUpdateStatus'));
              }
            } catch (error) {
              console.error('Update status error:', error);
              Alert.alert(translate('error'), translate('networkErrorUpdatingStatus'));
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const statusInfo = getExpenseStatusInfo(expense.status);

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
                {translate('expenseDetails')}
              </Text>
              <Text style={[styles.headerSubtitle, isRTL && styles.arabicText]}>
                {expense.category}
              </Text>
            </View>
            
            <TouchableOpacity
              style={styles.actionsButton}
              onPress={() => setShowActionsModal(true)}
            >
              <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchExpenseDetails} colors={['#6B7D3D']} />
        }
      >
        {/* Expense Header Card */}
        <View style={styles.expenseCard}>
          <View style={[styles.expenseHeaderRow, isRTL && styles.rtlRow]}>
            <View style={styles.categorySection}>
              <View style={styles.categoryIconContainer}>
                <Ionicons name={getCategoryIcon(expense.category)} size={24} color="#6B7D3D" />
              </View>
              <View style={styles.categoryInfo}>
                <Text style={[styles.categoryLabel, isRTL && styles.arabicText]}>
                  {translate('category')}
                </Text>
                <Text style={[styles.categoryText, isRTL && styles.arabicText]}>
                  {expense.category}
                </Text>
              </View>
            </View>
            
            <View style={styles.amountSection}>
              <Text style={[styles.amountLabel, isRTL && styles.arabicText]}>
                {translate('amount')}
              </Text>
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

          <View style={styles.dateRow}>
            <View style={styles.dateItem}>
              <Text style={[styles.dateLabel, isRTL && styles.arabicText]}>
                {translate('expenseDate')}
              </Text>
              <Text style={[styles.dateValue, isRTL && styles.arabicText]}>
                {formatDate(expense.expense_date)}
              </Text>
            </View>
            
            <View style={styles.dateItem}>
              <Text style={[styles.dateLabel, isRTL && styles.arabicText]}>
                {translate('paymentMethod')}
              </Text>
              <Text style={[styles.dateValue, isRTL && styles.arabicText]}>
                {expense.payment_method}
              </Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <View style={[styles.sectionHeader, isRTL && styles.rtlSectionHeader]}>
            <Ionicons name="document-text" size={24} color="#6B7D3D" />
            <Text style={[styles.sectionTitle, isRTL && styles.arabicText]}>
              {translate('description')}
            </Text>
          </View>
          
          <View style={styles.descriptionContainer}>
            <Text style={[styles.descriptionText, isRTL && styles.arabicText]}>
              {expense.description}
            </Text>
          </View>
        </View>

        {/* Staff Information */}
        <View style={styles.section}>
          <View style={[styles.sectionHeader, isRTL && styles.rtlSectionHeader]}>
            <Ionicons name="person" size={24} color="#6B7D3D" />
            <Text style={[styles.sectionTitle, isRTL && styles.arabicText]}>
              {translate('staffInformation')}
            </Text>
          </View>
          
          <View style={styles.staffInfo}>
            <View style={styles.staffRow}>
              <Text style={[styles.staffLabel, isRTL && styles.arabicText]}>
                {translate('expenseBy')}:
              </Text>
              <Text style={[styles.staffValue, isRTL && styles.arabicText]}>
                {expense.staff}
              </Text>
            </View>
            
            {expense.added_by && (
              <View style={styles.staffRow}>
                <Text style={[styles.staffLabel, isRTL && styles.arabicText]}>
                  {translate('addedBy')}:
                </Text>
                <Text style={[styles.staffValue, isRTL && styles.arabicText]}>
                  {expense.added_by.first_name} {expense.added_by.last_name}
                </Text>
              </View>
            )}
            
            {expense.department && (
              <View style={styles.staffRow}>
                <Text style={[styles.staffLabel, isRTL && styles.arabicText]}>
                  {translate('department')}:
                </Text>
                <Text style={[styles.staffValue, isRTL && styles.arabicText]}>
                  {expense.department}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Vendor Information */}
        {expense.vendor && (
          <View style={styles.section}>
            <View style={[styles.sectionHeader, isRTL && styles.rtlSectionHeader]}>
              <Ionicons name="business" size={24} color="#6B7D3D" />
              <Text style={[styles.sectionTitle, isRTL && styles.arabicText]}>
                {translate('vendorInformation')}
              </Text>
            </View>
            
            <View style={styles.vendorInfo}>
              <Text style={[styles.vendorName, isRTL && styles.arabicText]}>
                {expense.vendor}
              </Text>
              {expense.receipt_number && (
                <View style={styles.vendorRow}>
                  <Text style={[styles.vendorLabel, isRTL && styles.arabicText]}>
                    {translate('receiptNumber')}:
                  </Text>
                  <Text style={[styles.vendorValue, isRTL && styles.arabicText]}>
                    {expense.receipt_number}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Receipt Image */}
        {expense.receipt_image && (
          <View style={styles.section}>
            <View style={[styles.sectionHeader, isRTL && styles.rtlSectionHeader]}>
              <Ionicons name="camera" size={24} color="#6B7D3D" />
              <Text style={[styles.sectionTitle, isRTL && styles.arabicText]}>
                {translate('receiptImage')}
              </Text>
            </View>
            
            <TouchableOpacity
              style={styles.receiptImageContainer}
              onPress={handleImageView}
            >
              <Image
                source={{ uri: expense.receipt_image }}
                style={styles.receiptImage}
                resizeMode="cover"
              />
              <View style={styles.imageOverlay}>
                <Ionicons name="eye" size={24} color="#fff" />
                <Text style={[styles.viewImageText, isRTL && styles.arabicText]}>
                  {translate('viewReceipt')}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Timestamps */}
        <View style={styles.section}>
          <View style={[styles.sectionHeader, isRTL && styles.rtlSectionHeader]}>
            <Ionicons name="time" size={24} color="#6B7D3D" />
            <Text style={[styles.sectionTitle, isRTL && styles.arabicText]}>
              {translate('timestamps')}
            </Text>
          </View>
          
          <View style={styles.timestampInfo}>
            <View style={styles.timestampRow}>
              <Text style={[styles.timestampLabel, isRTL && styles.arabicText]}>
                {translate('createdAt')}:
              </Text>
              <Text style={[styles.timestampValue, isRTL && styles.arabicText]}>
                {formatDate(expense.created_at)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* Actions Modal */}
      <Modal
        visible={showActionsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowActionsModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={[styles.modalHeader, isRTL && styles.rtlModalHeader]}>
            <Text style={[styles.modalTitle, isRTL && styles.arabicText]}>
              {translate('expenseActions')}
            </Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowActionsModal(false)}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.actionsGrid}>
            {actionButtons.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.actionCard, { borderColor: action.color }]}
                onPress={() => {
                  setShowActionsModal(false);
                  action.action();
                }}
                disabled={loading}
              >
                <View style={[styles.actionIconContainer, { backgroundColor: action.color }]}>
                  <Ionicons name={action.icon} size={24} color="#fff" />
                </View>
                <Text style={[styles.actionTitle, isRTL && styles.arabicText]}>
                  {action.title}
                </Text>
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
              
              {expense.receipt_image && (
                <Image
                  source={{ uri: expense.receipt_image }}
                  style={styles.fullImage}
                  resizeMode="contain"
                />
              )}
            </View>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Loading Overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6B7D3D" />
            <Text style={[styles.loadingText, isRTL && styles.arabicText]}>
              {translate('processing')}...
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafb',
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
  actionsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  expenseCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  expenseHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  rtlRow: {
    flexDirection: 'row-reverse',
  },
  categorySection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(107, 125, 61, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  amountSection: {
    alignItems: 'flex-end',
  },
  amountLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  amountText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
    gap: 5,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateItem: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 10,
  },
  rtlSectionHeader: {
    flexDirection: 'row-reverse',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  descriptionContainer: {
    backgroundColor: '#f8fafb',
    borderRadius: 12,
    padding: 15,
  },
  descriptionText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  staffInfo: {
    marginTop: 10,
    gap: 12,
  },
  staffRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  staffLabel: {
    fontSize: 14,
    color: '#666',
  },
  staffValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  vendorInfo: {
    marginTop: 10,
  },
  vendorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  vendorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vendorLabel: {
    fontSize: 14,
    color: '#666',
  },
  vendorValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  receiptImageContainer: {
    position: 'relative',
    height: 200,
    backgroundColor: '#f8fafb',
    borderRadius: 12,
    marginTop: 10,
    overflow: 'hidden',
  },
  receiptImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  viewImageText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  timestampInfo: {
    marginTop: 10,
  },
  timestampRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timestampLabel: {
    fontSize: 14,
    color: '#666',
  },
  timestampValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  bottomSpace: {
    height: 30,
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
  actionsGrid: {
    padding: 20,
    gap: 15,
  },
  actionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    gap: 15,
  },
  actionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
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
  
  // Loading Overlay
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  
  // RTL Support
  arabicText: {
    textAlign: 'right',
    fontFamily: 'Arabic',
  },
});

export default ExpenseDetailsScreen;