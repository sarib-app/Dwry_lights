import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  ActivityIndicator,
  Modal,
  RefreshControl,
  Image,
  Linking,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import languageService from '../Globals/Store/Lang';
import getAuthToken from '../Globals/Store/LocalData';
import commonStyles from '../Globals/CommonStyles';

const API_BASE_URL = 'https://planetdory.dwrylight.com/api';
const { width: screenWidth } = Dimensions.get('window');

const PaymentEntryDetailsScreen = ({ navigation, route }) => {
  const { entry: initialEntry } = route.params;
  
  const [entry, setEntry] = useState(initialEntry);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showActionsModal, setShowActionsModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isRTL, setIsRTL] = useState(false);

  const translate = (key) => languageService.translate(key);

  useEffect(() => {
    initializeScreen();
    fetchEntryDetails();
  }, []);

  const initializeScreen = async () => {
    const language = await languageService.loadSavedLanguage();
    setCurrentLanguage(language);
    setIsRTL(language === 'ar');
  };

  // Fetch complete entry details
  const fetchEntryDetails = async () => {
    if (!initialEntry?.id) return;
    
    setRefreshing(true);
    const token = await getAuthToken();
    if (!token) {
      Alert.alert(translate('error'), translate('authTokenNotFound'));
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/fetch_payment_entry_by_id/${initialEntry.id}`, {
        method: 'GET',
        headers: {
          'Authorization': token,
        },
      });
      
      const result = await response.json();
      console.log('Payment Entry Details API Response:', result);
      
      if (result.status == 200) {
        setEntry(result.data || initialEntry);
      } else {
        Alert.alert(translate('error'), result.message || translate('failedToFetchEntryDetails'));
      }
    } catch (error) {
      console.error('Fetch entry details error:', error);
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

  // Get payment type color and icon
  const getPaymentTypeInfo = (type) => {
    switch (type) {
      case 'credit':
        return { color: '#27AE60', icon: 'arrow-down-circle', bgColor: 'rgba(39, 174, 96, 0.1)' };
      case 'debit':
        return { color: '#E74C3C', icon: 'arrow-up-circle', bgColor: 'rgba(231, 76, 60, 0.1)' };
      default:
        return { color: '#95A5A6', icon: 'help-circle', bgColor: 'rgba(149, 165, 166, 0.1)' };
    }
  };

  // Get payment type icon for payment category
  const getPaymentCategoryIcon = (paymentType) => {
    switch (paymentType) {
      case 'sales_invoice': return 'receipt';
      case 'purchase_invoice': return 'document-text';
      case 'expense': return 'card';
      default: return 'cash';
    }
  };

  // Handle image press
  const handleImagePress = () => {
    setShowImageModal(true);
  };

  // Handle video press
  const handleVideoPress = async () => {
    if (entry.video_url) {
      try {
        const supported = await Linking.canOpenURL(entry.video_url);
        if (supported) {
          await Linking.openURL(entry.video_url);
        } else {
          Alert.alert(translate('error'), translate('cannotOpenVideo'));
        }
      } catch (error) {
        console.error('Error opening video:', error);
        Alert.alert(translate('error'), translate('cannotOpenVideo'));
      }
    }
  };

  // Generate HTML for printing
  const generateEntryHTML = () => {
    const typeInfo = getPaymentTypeInfo(entry.type);
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Entry ${entry.id}</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                ${isRTL ? 'direction: rtl;' : ''}
            }
            .header {
                background: linear-gradient(135deg, #6B7D3D, #4A5D23);
                color: white;
                padding: 30px;
                border-radius: 10px;
                margin-bottom: 30px;
                text-align: center;
            }
            .company-name {
                font-size: 28px;
                font-weight: bold;
                margin-bottom: 5px;
            }
            .company-subtitle {
                font-size: 16px;
                opacity: 0.9;
            }
            .entry-info {
                display: flex;
                justify-content: space-between;
                margin-bottom: 30px;
                flex-wrap: wrap;
            }
            .info-section {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 10px;
                margin-bottom: 15px;
                flex: 1;
                min-width: 250px;
                margin-${isRTL ? 'left' : 'right'}: 15px;
            }
            .info-section:last-child {
                margin-${isRTL ? 'left' : 'right'}: 0;
            }
            .section-title {
                font-weight: bold;
                font-size: 16px;
                color: #6B7D3D;
                margin-bottom: 10px;
                border-bottom: 2px solid #6B7D3D;
                padding-bottom: 5px;
            }
            .type-badge {
                display: inline-block;
                padding: 8px 16px;
                border-radius: 20px;
                font-weight: bold;
                font-size: 12px;
                text-transform: uppercase;
                background-color: ${typeInfo.bgColor};
                color: ${typeInfo.color};
                margin-top: 10px;
            }
            .amount-section {
                background: #f8f9fa;
                padding: 25px;
                border-radius: 10px;
                margin: 30px 0;
                border: 2px solid #6B7D3D;
                text-align: center;
            }
            .amount-label {
                font-size: 16px;
                color: #666;
                margin-bottom: 10px;
            }
            .amount-value {
                font-size: 32px;
                font-weight: bold;
                color: ${typeInfo.color};
            }
            .details-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin: 30px 0;
            }
            .detail-item {
                background: white;
                padding: 15px;
                border-radius: 8px;
                border-left: 4px solid #6B7D3D;
            }
            .detail-label {
                font-size: 12px;
                color: #666;
                text-transform: uppercase;
                margin-bottom: 5px;
            }
            .detail-value {
                font-size: 16px;
                font-weight: 600;
                color: #333;
            }
            .notes-section {
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 10px;
                padding: 20px;
                margin-top: 30px;
            }
            .footer {
                text-align: center;
                margin-top: 50px;
                padding-top: 30px;
                border-top: 2px solid #6B7D3D;
                color: #666;
                font-size: 14px;
            }
            @media print {
                body { padding: 0; }
                .no-print { display: none; }
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="company-name">${translate('appName')}</div>
            <div class="company-subtitle">${translate('paymentEntrySystem')}</div>
        </div>

        <div class="entry-info">
            <div class="info-section">
                <div class="section-title">${translate('paymentEntryDetails')}</div>
                <p><strong>${translate('entryId')}:</strong> #${entry.id}</p>
                <p><strong>${translate('paymentDate')}:</strong> ${formatDate(entry.payment_date)}</p>
                <p><strong>${translate('paymentType')}:</strong> ${translate(entry.payment_type)}</p>
                <div class="type-badge">${translate(entry.type)}</div>
            </div>

            <div class="info-section">
                <div class="section-title">${translate('bankInformation')}</div>
                <p><strong>${translate('bankName')}:</strong> ${entry.bank_name || ''}</p>
                <p><strong>${translate('paymentMethod')}:</strong> ${entry.payment_method}</p>
                ${entry.transaction_reference ? `<p><strong>${translate('transactionRef')}:</strong> ${entry.transaction_reference}</p>` : ''}
            </div>
        </div>

        <div class="amount-section">
            <div class="amount-label">${translate('paymentAmount')}</div>
            <div class="amount-value">${entry.type === 'credit' ? '+' : '-'}${formatCurrency(entry.amount)}</div>
        </div>

        <div class="details-grid">
            <div class="detail-item">
                <div class="detail-label">${translate('recordedBy')}</div>
                <div class="detail-value">${entry.recorded_by?.first_name || ''} ${entry.recorded_by?.last_name || ''}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">${translate('createdAt')}</div>
                <div class="detail-value">${formatDate(entry.created_at)}</div>
            </div>
        </div>

        ${entry.notes ? `
        <div class="notes-section">
            <div class="section-title">${translate('notes')}</div>
            <p>${entry.notes}</p>
        </div>
        ` : ''}

        <div class="footer">
            <p>${translate('generatedOn')} ${new Date().toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}</p>
            <p>${translate('generatedBy')} ${translate('appName')}</p>
        </div>
    </body>
    </html>`;
  };

  // Print entry
  const handlePrint = async () => {
    try {
      setLoading(true);
      const html = generateEntryHTML();
      
      await Print.printAsync({
        html,
        printerUrl: undefined,
      });
    } catch (error) {
      console.error('Print error:', error);
      Alert.alert(translate('error'), translate('printError'));
    } finally {
      setLoading(false);
    }
  };

  // Share entry as PDF
  const handleSharePDF = async () => {
    try {
      setLoading(true);
      const html = generateEntryHTML();
      
      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: `${translate('paymentEntry')} #${entry.id}`,
        });
      } else {
        Alert.alert(translate('info'), translate('sharingNotAvailable'));
      }
    } catch (error) {
      console.error('Share PDF error:', error);
      Alert.alert(translate('error'), translate('shareError'));
    } finally {
      setLoading(false);
    }
  };

  // Share entry details as text
  const handleShareText = async () => {
    try {
      const entryText = `
${translate('paymentEntry')}: #${entry.id}
${translate('paymentType')}: ${translate(entry.payment_type)}
${translate('transactionType')}: ${translate(entry.type)}
${translate('paymentDate')}: ${formatDate(entry.payment_date)}
${translate('amount')}: ${entry.type === 'credit' ? '+' : '-'}${formatCurrency(entry.amount)}
${translate('bankName')}: ${entry.bank_name || ''}
${translate('paymentMethod')}: ${entry.payment_method}
${entry.transaction_reference ? `${translate('transactionRef')}: ${entry.transaction_reference}` : ''}
${translate('recordedBy')}: ${entry.recorded_by?.first_name || ''} ${entry.recorded_by?.last_name || ''}

${translate('generatedBy')} ${translate('appName')}
      `.trim();

      await Share.share({
        message: entryText,
        title: `${translate('paymentEntry')} #${entry.id}`,
      });
    } catch (error) {
      console.error('Share text error:', error);
      Alert.alert(translate('error'), translate('shareError'));
    }
  };

  const typeInfo = getPaymentTypeInfo(entry.type);

  const actionButtons = [
    {
      title: translate('print'),
      icon: 'print',
      action: handlePrint,
      color: '#6B7D3D'
    },
    {
      title: translate('sharePDF'),
      icon: 'document',
      action: handleSharePDF,
      color: '#3498DB'
    },
    {
      title: translate('shareText'),
      icon: 'share',
      action: handleShareText,
      color: '#9B59B6'
    },
    {
      title: translate('editPaymentEntry'),
      icon: 'pencil',
      action: () => navigation.navigate('EditPaymentEntry', { entry }),
      color: '#F39C12'
    }
  ];

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
                {translate('paymentEntryDetails')}
              </Text>
              <Text style={[commonStyles.headerSubtitle, isRTL && commonStyles.arabicText]}>
                #{entry.id}
              </Text>
            </View>
            
            <TouchableOpacity
              style={commonStyles.actionsButton}
              onPress={() => setShowActionsModal(true)}
            >
              <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      {/* Content */}
      <ScrollView 
        style={commonStyles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchEntryDetails} colors={['#6B7D3D']} />
        }
      >
        {/* Entry Header Card */}
        <View style={commonStyles.section}>
          <View style={[styles.entryHeaderRow, isRTL && commonStyles.rtlRow]}>
            <View style={styles.entryIdSection}>
              <Text style={[styles.entryIdLabel, isRTL && commonStyles.arabicText]}>
                {translate('entryId')}
              </Text>
              <Text style={[styles.entryId, isRTL && commonStyles.arabicText]}>
                #{entry.id}
              </Text>
            </View>
            
            <View style={[styles.typeContainer, { backgroundColor: typeInfo.bgColor }]}>
              <Ionicons name={typeInfo.icon} size={20} color={typeInfo.color} />
              <Text style={[styles.typeText, { color: typeInfo.color }, isRTL && commonStyles.arabicText]}>
                {translate(entry.type)}
              </Text>
            </View>
          </View>

          <View style={styles.paymentTypeRow}>
            <View style={[styles.paymentTypeSection, isRTL && commonStyles.rtlRow]}>
              <Ionicons 
                name={getPaymentCategoryIcon(entry.payment_type)} 
                size={20} 
                color="#6B7D3D" 
              />
              <Text style={[styles.paymentTypeText, isRTL && commonStyles.arabicText]}>
                {translate(entry.payment_type)}
              </Text>
            </View>
            
            <Text style={[styles.paymentDate, isRTL && commonStyles.arabicText]}>
              {formatDate(entry.payment_date)}
            </Text>
          </View>
        </View>

        {/* Amount Display */}
        <View style={commonStyles.section}>
          <View style={[styles.amountContainer, { borderColor: typeInfo.color }]}>
            <Text style={[styles.amountLabel, isRTL && commonStyles.arabicText]}>
              {translate('paymentAmount')}
            </Text>
            <Text style={[styles.amountValue, { color: typeInfo.color }, isRTL && commonStyles.arabicText]}>
              {entry.type === 'credit' ? '+' : '-'}{formatCurrency(entry.amount)}
            </Text>
          </View>
        </View>

        {/* Bank Information */}
        <View style={commonStyles.section}>
          <View style={[styles.sectionHeader, isRTL && commonStyles.rtlSectionHeader]}>
            <Ionicons name="card" size={24} color="#6B7D3D" />
            <Text style={[commonStyles.sectionTitle, isRTL && commonStyles.arabicText]}>
              {translate('bankInformation')}
            </Text>
          </View>
          
          <View style={styles.bankInfo}>
            <View style={styles.bankDetailRow}>
              <Text style={[styles.bankDetailLabel, isRTL && commonStyles.arabicText]}>
                {translate('bankName')}:
              </Text>
              <Text style={[styles.bankDetailValue, isRTL && commonStyles.arabicText]}>
                {entry.bank_name || translate('notSpecified')}
              </Text>
            </View>
            
            <View style={styles.bankDetailRow}>
              <Text style={[styles.bankDetailLabel, isRTL && commonStyles.arabicText]}>
                {translate('paymentMethod')}:
              </Text>
              <Text style={[styles.bankDetailValue, isRTL && commonStyles.arabicText]}>
                {entry.payment_method}
              </Text>
            </View>
            
            {entry.transaction_reference && (
              <View style={styles.bankDetailRow}>
                <Text style={[styles.bankDetailLabel, isRTL && commonStyles.arabicText]}>
                  {translate('transactionRef')}:
                </Text>
                <Text style={[styles.bankDetailValue, isRTL && commonStyles.arabicText]}>
                  {entry.transaction_reference}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Record Information */}
        <View style={commonStyles.section}>
          <View style={[styles.sectionHeader, isRTL && commonStyles.rtlSectionHeader]}>
            <Ionicons name="person" size={24} color="#6B7D3D" />
            <Text style={[commonStyles.sectionTitle, isRTL && commonStyles.arabicText]}>
              {translate('recordInformation')}
            </Text>
          </View>
          
          <View style={styles.recordInfo}>
            <View style={styles.recordDetailRow}>
              <Text style={[styles.recordDetailLabel, isRTL && commonStyles.arabicText]}>
                {translate('recordedBy')}:
              </Text>
              <Text style={[styles.recordDetailValue, isRTL && commonStyles.arabicText]}>
                {entry.recorded_by?.first_name} {entry.recorded_by?.last_name}
              </Text>
            </View>
            
            <View style={styles.recordDetailRow}>
              <Text style={[styles.recordDetailLabel, isRTL && commonStyles.arabicText]}>
                {translate('createdAt')}:
              </Text>
              <Text style={[styles.recordDetailValue, isRTL && commonStyles.arabicText]}>
                {formatDate(entry.created_at)}
              </Text>
            </View>
          </View>
        </View>

        {/* Media Attachments */}
        {(entry.image_url || entry.video_url) && (
          <View style={commonStyles.section}>
            <View style={[styles.sectionHeader, isRTL && commonStyles.rtlSectionHeader]}>
              <Ionicons name="images" size={24} color="#6B7D3D" />
              <Text style={[commonStyles.sectionTitle, isRTL && commonStyles.arabicText]}>
                {translate('attachments')}
              </Text>
            </View>
            
            <View style={styles.mediaContainer}>
              {/* Image Display */}
              {entry.image_url && (
                <View style={styles.mediaItem}>
                  <Text style={[styles.mediaLabel, isRTL && commonStyles.arabicText]}>
                    {translate('image')}
                  </Text>
                  <TouchableOpacity 
                    style={styles.imageContainer}
                    onPress={handleImagePress}
                    activeOpacity={0.8}
                  >
                    <Image 
                      source={{ uri: entry.image_url }} 
                      style={styles.attachmentImage}
                      resizeMode="cover"
                    />
                    <View style={styles.imageOverlay}>
                      <Ionicons name="expand" size={24} color="#fff" />
                    </View>
                  </TouchableOpacity>
                </View>
              )}

              {/* Video Display */}
              {entry.video_url && (
                <View style={styles.mediaItem}>
                  <Text style={[styles.mediaLabel, isRTL && commonStyles.arabicText]}>
                    {translate('video')}
                  </Text>
                  <TouchableOpacity 
                    style={styles.videoContainer}
                    onPress={handleVideoPress}
                    activeOpacity={0.8}
                  >
                    <View style={styles.videoPreview}>
                      <Ionicons name="play-circle" size={50} color="#6B7D3D" />
                      <Text style={[styles.videoText, isRTL && commonStyles.arabicText]}>
                        {translate('tapToPlayVideo')}
                      </Text>
                    </View>
                    <View style={styles.videoOverlay}>
                      <Ionicons name="videocam" size={20} color="#fff" />
                    </View>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Notes Section */}
        {entry.notes && (
          <View style={commonStyles.section}>
            <View style={[styles.sectionHeader, isRTL && commonStyles.rtlSectionHeader]}>
              <Ionicons name="document-text" size={24} color="#6B7D3D" />
              <Text style={[commonStyles.sectionTitle, isRTL && commonStyles.arabicText]}>
                {translate('notes')}
              </Text>
            </View>
            
            <View style={styles.notesContainer}>
              <Text style={[styles.notesText, isRTL && commonStyles.arabicText]}>
                {entry.notes}
              </Text>
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={commonStyles.quickActions}>
          <TouchableOpacity
            style={[commonStyles.quickActionButton, commonStyles.printButton]}
            onPress={handlePrint}
            disabled={loading}
          >
            <Ionicons name="print" size={20} color="#fff" />
            <Text style={[commonStyles.quickActionText, isRTL && commonStyles.arabicText]}>
              {translate('print')}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[commonStyles.quickActionButton, commonStyles.shareButton]}
            onPress={handleSharePDF}
            disabled={loading}
          >
            <Ionicons name="share" size={20} color="#fff" />
            <Text style={[commonStyles.quickActionText, isRTL && commonStyles.arabicText]}>
              {translate('share')}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={commonStyles.bottomSpace} />
      </ScrollView>

      {/* Image Modal */}
      <Modal
        visible={showImageModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowImageModal(false)}
      >
        <View style={styles.imageModalContainer}>
          <View style={styles.imageModalHeader}>
            <Text style={[styles.imageModalTitle, isRTL && commonStyles.arabicText]}>
              {translate('paymentImage')}
            </Text>
            <TouchableOpacity
              style={styles.imageModalCloseButton}
              onPress={() => setShowImageModal(false)}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={styles.imageModalContent}>
            {entry.image_url && (
              <Image 
                source={{ uri: entry.image_url }} 
                style={styles.fullScreenImage}
                resizeMode="contain"
              />
            )}
          </View>
        </View>
      </Modal>

      {/* Actions Modal */}
      <Modal
        visible={showActionsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowActionsModal(false)}
      >
        <SafeAreaView style={commonStyles.modalContainer}>
          <View style={[commonStyles.modalHeader, isRTL && commonStyles.rtlModalHeader]}>
            <Text style={[commonStyles.modalTitle, isRTL && commonStyles.arabicText]}>
              {translate('paymentEntryActions')}
            </Text>
            <TouchableOpacity
              style={commonStyles.modalCloseButton}
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
                <Text style={[styles.actionTitle, isRTL && commonStyles.arabicText]}>
                  {action.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </SafeAreaView>
      </Modal>

      {/* Loading Overlay */}
      {loading && (
        <View style={commonStyles.loadingOverlay}>
          <View style={commonStyles.loadingOverlayContainer}>
            <ActivityIndicator size="large" color="#6B7D3D" />
            <Text style={[commonStyles.loadingOverlayText, isRTL && commonStyles.arabicText]}>
              {translate('processing')}...
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

// Screen-specific styles
const styles = StyleSheet.create({
  entryHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  
  entryIdSection: {
    flex: 1,
  },
  
  entryIdLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  
  entryId: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 5,
  },
  
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  
  paymentTypeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  paymentTypeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  
  paymentTypeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textTransform: 'capitalize',
  },
  
  paymentDate: {
    fontSize: 14,
    color: '#666',
  },
  
  amountContainer: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  
  amountLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  
  amountValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 10,
  },
  
  bankInfo: {
    marginTop: 10,
  },
  
  bankDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  
  bankDetailLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  
  bankDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 2,
    textAlign: 'right',
  },
  
  recordInfo: {
    marginTop: 10,
  },
  
  recordDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  
  recordDetailLabel: {
    fontSize: 14,
    color: '#666',
  },
  
  recordDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },

  // Media attachment styles
  mediaContainer: {
    marginTop: 10,
    gap: 20,
  },

  mediaItem: {
    marginBottom: 15,
  },

  mediaLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },

  imageContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f8f9fa',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  attachmentImage: {
    width: '100%',
    height: 200,
  },

  imageOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },

  videoContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f8f9fa',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  videoPreview: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderStyle: 'dashed',
  },

  videoText: {
    fontSize: 14,
    color: '#6B7D3D',
    marginTop: 10,
    fontWeight: '500',
  },

  videoOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(107, 125, 61, 0.8)',
    borderRadius: 15,
    padding: 6,
  },

  // Image modal styles
  imageModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },

  imageModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  imageModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },

  imageModalCloseButton: {
    padding: 8,
  },

  imageModalContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  fullScreenImage: {
    width: screenWidth - 40,
    height: '80%',
  },
  
  notesContainer: {
    backgroundColor: '#fff3cd',
    borderRadius: 12,
    padding: 15,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  
  notesText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
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
});

export default PaymentEntryDetailsScreen;