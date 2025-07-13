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
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import languageService from '../Globals/Store/Lang';
import getAuthToken from '../Globals/Store/LocalData';
// import { commonStyles, getStatusInfo } from '../shared/CommonStyles';
import {commonStyles,getStatusInfo} from '../Globals/CommonStyles';

const API_BASE_URL = 'https://planetdory.dwrylight.com/api';

const PurchaseOrderDetailsScreen = ({ navigation, route }) => {
  const { order: initialOrder } = route.params;
  
  const [order, setOrder] = useState(initialOrder);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showActionsModal, setShowActionsModal] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isRTL, setIsRTL] = useState(false);

  const translate = (key) => languageService.translate(key);

  useEffect(() => {
    initializeScreen();
    fetchOrderDetails();
  }, []);

  const initializeScreen = async () => {
    const language = await languageService.loadSavedLanguage();
    setCurrentLanguage(language);
    setIsRTL(language === 'ar');
  };

  // Fetch complete order details
  const fetchOrderDetails = async () => {
    if (!initialOrder?.id) return;
    
    setRefreshing(true);
    const token = await getAuthToken();
    if (!token) {
      Alert.alert(translate('error'), translate('authTokenNotFound'));
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/fetch_purchase_order_by_id/${initialOrder.id}`, {
        method: 'GET',
        headers: {
          'Authorization': token,
        },
      });
      
      const result = await response.json();
      console.log('Purchase Order Details API Response:', result);
      
      if (result.status == 200) {
        setOrder(result.data || initialOrder);
      } else {
        Alert.alert(translate('error'), result.message || translate('failedToFetchOrderDetails'));
      }
    } catch (error) {
      console.error('Fetch order details error:', error);
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

  // Generate HTML for printing
  const generateOrderHTML = () => {
    const statusInfo = getStatusInfo(order.status);
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Purchase Order ${order.po_number}</title>
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
            .order-info {
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
            .status-badge {
                display: inline-block;
                padding: 8px 16px;
                border-radius: 20px;
                font-weight: bold;
                font-size: 12px;
                text-transform: uppercase;
                background-color: ${statusInfo.bgColor};
                color: ${statusInfo.color};
                margin-top: 10px;
            }
            .items-table {
                width: 100%;
                border-collapse: collapse;
                margin: 30px 0;
                background: white;
                border-radius: 10px;
                overflow: hidden;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .items-table th {
                background: #6B7D3D;
                color: white;
                padding: 15px;
                text-align: ${isRTL ? 'right' : 'left'};
                font-weight: bold;
            }
            .items-table td {
                padding: 15px;
                border-bottom: 1px solid #eee;
                text-align: ${isRTL ? 'right' : 'left'};
            }
            .items-table tr:last-child td {
                border-bottom: none;
            }
            .items-table tr:nth-child(even) {
                background-color: #f8f9fa;
            }
            .totals-section {
                background: #f8f9fa;
                padding: 25px;
                border-radius: 10px;
                margin-top: 30px;
                border: 2px solid #6B7D3D;
            }
            .total-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
                font-size: 16px;
            }
            .total-row.grand-total {
                font-weight: bold;
                font-size: 20px;
                color: #6B7D3D;
                border-top: 2px solid #6B7D3D;
                padding-top: 15px;
                margin-top: 15px;
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
            <div class="company-subtitle">${translate('purchaseOrderSystem')}</div>
        </div>

        <div class="order-info">
            <div class="info-section">
                <div class="section-title">${translate('purchaseOrderDetails')}</div>
                <p><strong>${translate('poNumber')}:</strong> ${order.po_number}</p>
                <p><strong>${translate('poDate')}:</strong> ${formatDate(order.po_date)}</p>
                <p><strong>${translate('expectedDelivery')}:</strong> ${formatDate(order.expected_delivery_date)}</p>
                <div class="status-badge">${translate(order.status)}</div>
            </div>

            <div class="info-section">
                <div class="section-title">${translate('supplierInformation')}</div>
                <p><strong>${translate('supplierName')}:</strong> ${order.supplier_name}</p>
                <p><strong>${translate('contactPerson')}:</strong> ${order.supplier_contact || ''}</p>
            </div>
        </div>

        <table class="items-table">
            <thead>
                <tr>
                    <th>${translate('itemName')}</th>
                    <th>${translate('quantity')}</th>
                    <th>${translate('unitCost')}</th>
                    <th>${translate('total')}</th>
                </tr>
            </thead>
            <tbody>
                ${order.items?.map(item => `
                    <tr>
                        <td>${item.item_name}</td>
                        <td>${item.quantity}</td>
                        <td>${formatCurrency(item.unit_cost)}</td>
                        <td>${formatCurrency(item.quantity * item.unit_cost)}</td>
                    </tr>
                `).join('') || ''}
            </tbody>
        </table>

        <div class="totals-section">
            <div class="total-row">
                <span>${translate('itemsSubtotal')}:</span>
                <span>${formatCurrency(order.items?.reduce((sum, item) => sum + (item.quantity * item.unit_cost), 0) || 0)}</span>
            </div>
            <div class="total-row">
                <span>${translate('taxAmount')}:</span>
                <span>${formatCurrency(order.tax_amount || 0)}</span>
            </div>
            <div class="total-row">
                <span>${translate('shippingCost')}:</span>
                <span>${formatCurrency(order.shipping_cost || 0)}</span>
            </div>
            <div class="total-row grand-total">
                <span>${translate('totalAmount')}:</span>
                <span>${formatCurrency(order.total_amount)}</span>
            </div>
        </div>

        ${order.notes ? `
        <div class="notes-section">
            <div class="section-title">${translate('notes')}</div>
            <p>${order.notes}</p>
        </div>
        ` : ''}

        <div class="footer">
            <p>${translate('generatedOn')} ${new Date().toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}</p>
            <p>${translate('createdBy')}: ${order.created_by?.first_name} ${order.created_by?.last_name}</p>
        </div>
    </body>
    </html>`;
  };

  // Print order
  const handlePrint = async () => {
    try {
      setLoading(true);
      const html = generateOrderHTML();
      
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

  // Share order as PDF
  const handleSharePDF = async () => {
    try {
      setLoading(true);
      const html = generateOrderHTML();
      
      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: `${translate('purchaseOrder')} ${order.po_number}`,
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

  // Share order details as text
  const handleShareText = async () => {
    try {
      const orderText = `
${translate('purchaseOrder')}: ${order.po_number}
${translate('supplierName')}: ${order.supplier_name}
${translate('poDate')}: ${formatDate(order.po_date)}
${translate('expectedDelivery')}: ${formatDate(order.expected_delivery_date)}
${translate('totalAmount')}: ${formatCurrency(order.total_amount)}
${translate('status')}: ${translate(order.status)}

${translate('items')}:
${order.items?.map(item => `• ${item.item_name} - ${translate('qty')}: ${item.quantity} - ${formatCurrency(item.quantity * item.unit_cost)}`).join('\n') || ''}

${translate('generatedBy')} ${translate('appName')}
      `.trim();

      await Share.share({
        message: orderText,
        title: `${translate('purchaseOrder')} ${order.po_number}`,
      });
    } catch (error) {
      console.error('Share text error:', error);
      Alert.alert(translate('error'), translate('shareError'));
    }
  };

  const statusInfo = getStatusInfo(order.status);

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
      title: translate('editPurchaseOrder'),
      icon: 'pencil',
      action: () => navigation.navigate('EditPurchaseOrder', { order }),
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
                {translate('purchaseOrderDetails')}
              </Text>
              <Text style={[commonStyles.headerSubtitle, isRTL && commonStyles.arabicText]}>
                {order.po_number}
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
          <RefreshControl refreshing={refreshing} onRefresh={fetchOrderDetails} colors={['#6B7D3D']} />
        }
      >
        {/* Order Header Card */}
        <View style={commonStyles.section}>
          <View style={[styles.orderHeaderRow, isRTL && commonStyles.rtlRow]}>
            <View style={styles.orderNumberSection}>
              <Text style={[styles.orderNumberLabel, isRTL && commonStyles.arabicText]}>
                {translate('poNumber')}
              </Text>
              <Text style={[styles.orderNumber, isRTL && commonStyles.arabicText]}>
                {order.po_number}
              </Text>
            </View>
            
            <View style={[styles.statusContainer, { backgroundColor: statusInfo.bgColor }]}>
              <Ionicons name={statusInfo.icon} size={20} color={statusInfo.color} />
              <Text style={[styles.statusText, { color: statusInfo.color }, isRTL && commonStyles.arabicText]}>
                {translate(order.status)}
              </Text>
            </View>
          </View>

          <View style={styles.dateRow}>
            <View style={styles.dateItem}>
              <Text style={[styles.dateLabel, isRTL && commonStyles.arabicText]}>
                {translate('poDate')}
              </Text>
              <Text style={[styles.dateValue, isRTL && commonStyles.arabicText]}>
                {formatDate(order.po_date)}
              </Text>
            </View>
            
            <View style={styles.dateItem}>
              <Text style={[styles.dateLabel, isRTL && commonStyles.arabicText]}>
                {translate('expectedDelivery')}
              </Text>
              <Text style={[styles.dateValue, isRTL && commonStyles.arabicText]}>
                {formatDate(order.expected_delivery_date)}
              </Text>
            </View>
          </View>
        </View>

        {/* Supplier Information */}
        <View style={commonStyles.section}>
          <View style={[styles.sectionHeader, isRTL && commonStyles.rtlSectionHeader]}>
            <Ionicons name="business" size={24} color="#6B7D3D" />
            <Text style={[commonStyles.sectionTitle, isRTL && commonStyles.arabicText]}>
              {translate('supplierInformation')}
            </Text>
          </View>
          
          <View style={styles.supplierInfo}>
            <Text style={[styles.supplierName, isRTL && commonStyles.arabicText]}>
              {order.supplier_name}
            </Text>
            
            {order.supplier_contact && (
              <View style={styles.supplierDetailRow}>
                <Ionicons name="mail" size={16} color="#666" />
                <Text style={[styles.supplierDetailText, isRTL && commonStyles.arabicText]}>
                  {order.supplier_contact}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Items Section */}
        <View style={commonStyles.section}>
          <View style={[styles.sectionHeader, isRTL && commonStyles.rtlSectionHeader]}>
            <Ionicons name="cube" size={24} color="#6B7D3D" />
            <Text style={[commonStyles.sectionTitle, isRTL && commonStyles.arabicText]}>
              {translate('orderItems')} ({order.items?.length || 0})
            </Text>
          </View>
          
          {order.items?.map((item, index) => (
            <View key={index} style={styles.itemCard}>
              <View style={[styles.itemHeader, isRTL && commonStyles.rtlItemHeader]}>
                <Text style={[styles.itemName, isRTL && commonStyles.arabicText]}>
                  {item.item_name}
                </Text>
                <Text style={[styles.itemTotal, isRTL && commonStyles.arabicText]}>
                  {formatCurrency(item.quantity * item.unit_cost)}
                </Text>
              </View>
              
              <View style={[styles.itemDetails, isRTL && commonStyles.rtlItemDetails]}>
                <View style={styles.itemDetailItem}>
                  <Text style={[styles.itemDetailLabel, isRTL && commonStyles.arabicText]}>
                    {translate('quantity')}
                  </Text>
                  <Text style={[styles.itemDetailValue, isRTL && commonStyles.arabicText]}>
                    {item.quantity}
                  </Text>
                </View>
                
                <View style={styles.itemDetailItem}>
                  <Text style={[styles.itemDetailLabel, isRTL && commonStyles.arabicText]}>
                    {translate('unitCost')}
                  </Text>
                  <Text style={[styles.itemDetailValue, isRTL && commonStyles.arabicText]}>
                    {formatCurrency(item.unit_cost)}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Financial Summary */}
        <View style={commonStyles.section}>
          <View style={[styles.sectionHeader, isRTL && commonStyles.rtlSectionHeader]}>
            <Ionicons name="calculator" size={24} color="#6B7D3D" />
            <Text style={[commonStyles.sectionTitle, isRTL && commonStyles.arabicText]}>
              {translate('financialSummary')}
            </Text>
          </View>
          
          <View style={styles.financialSummary}>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, isRTL && commonStyles.arabicText]}>
                {translate('itemsSubtotal')}
              </Text>
              <Text style={[styles.summaryValue, isRTL && commonStyles.arabicText]}>
                {formatCurrency(order.items?.reduce((sum, item) => sum + (item.quantity * item.unit_cost), 0) || 0)}
              </Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, isRTL && commonStyles.arabicText]}>
                {translate('taxAmount')}
              </Text>
              <Text style={[styles.summaryValue, isRTL && commonStyles.arabicText]}>
                {formatCurrency(order.tax_amount || 0)}
              </Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, isRTL && commonStyles.arabicText]}>
                {translate('shippingCost')}
              </Text>
              <Text style={[styles.summaryValue, isRTL && commonStyles.arabicText]}>
                {formatCurrency(order.shipping_cost || 0)}
              </Text>
            </View>
            
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={[styles.totalLabel, isRTL && commonStyles.arabicText]}>
                {translate('totalAmount')}
              </Text>
              <Text style={[styles.totalValue, isRTL && commonStyles.arabicText]}>
                {formatCurrency(order.total_amount)}
              </Text>
            </View>
          </View>
        </View>

        {/* Notes Section */}
        {order.notes && (
          <View style={commonStyles.section}>
            <View style={[styles.sectionHeader, isRTL && commonStyles.rtlSectionHeader]}>
              <Ionicons name="document-text" size={24} color="#6B7D3D" />
              <Text style={[commonStyles.sectionTitle, isRTL && commonStyles.arabicText]}>
                {translate('notes')}
              </Text>
            </View>
            
            <View style={styles.notesContainer}>
              <Text style={[styles.notesText, isRTL && commonStyles.arabicText]}>
                {order.notes}
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
              {translate('purchaseOrderActions')}
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
  orderHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  
  orderNumberSection: {
    flex: 1,
  },
  
  orderNumberLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  
  orderNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
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
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 10,
  },
  
  supplierInfo: {
    marginTop: 10,
  },
  
  supplierName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  
  supplierDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 5,
  },
  
  supplierDetailText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  
  itemCard: {
    backgroundColor: '#f8fafb',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  
  itemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6B7D3D',
  },
  
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  itemDetailItem: {
    flex: 1,
  },
  
  itemDetailLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  
  itemDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  
  financialSummary: {
    marginTop: 10,
  },
  
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  
  totalRow: {
    borderTopWidth: 2,
    borderTopColor: '#6B7D3D',
    borderBottomWidth: 0,
    paddingTop: 15,
    marginTop: 10,
  },
  
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6B7D3D',
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

export default PurchaseOrderDetailsScreen;