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

const API_BASE_URL = 'https://planetdory.dwrylight.com/api';

const InvoiceDetailsScreen = ({ navigation, route }) => {
  const { invoice: initialInvoice } = route.params;
  
  const [invoice, setInvoice] = useState(initialInvoice);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showActionsModal, setShowActionsModal] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isRTL, setIsRTL] = useState(false);

  const translate = (key) => languageService.translate(key);

  useEffect(() => {
    initializeScreen();
    fetchInvoiceDetails();
  }, []);

  const initializeScreen = async () => {
    const language = await languageService.loadSavedLanguage();
    setCurrentLanguage(language);
    setIsRTL(language === 'ar');
  };

  // Fetch complete invoice details
  const fetchInvoiceDetails = async () => {
    if (!initialInvoice?.id) return;
    
    setRefreshing(true);
    const token = await getAuthToken();
    if (!token) {
      Alert.alert(translate('error'), translate('authTokenNotFound'));
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/fetch_sale_invoice_by_id/${initialInvoice.id}`, {
        method: 'GET',
        headers: {
          'Authorization': token,
        },
      });
      
      const result = await response.json();
      console.log('Invoice Details API Response:', result);
      
      if (result.status == 200) {
        setInvoice(result.data || initialInvoice);
      } else {
        Alert.alert(translate('error'), result.message || translate('failedToFetchInvoiceDetails'));
      }
    } catch (error) {
      console.error('Fetch invoice details error:', error);
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

  // Get payment status color and icon
  const getPaymentStatusInfo = (status) => {
    switch (status) {
      case 'paid':
        return { color: '#27AE60', icon: 'checkmark-circle', bgColor: 'rgba(39, 174, 96, 0.1)' };
      case 'pending':
        return { color: '#F39C12', icon: 'time', bgColor: 'rgba(243, 156, 18, 0.1)' };
      case 'overdue':
        return { color: '#E74C3C', icon: 'alert-circle', bgColor: 'rgba(231, 76, 60, 0.1)' };
      default:
        return { color: '#95A5A6', icon: 'help-circle', bgColor: 'rgba(149, 165, 166, 0.1)' };
    }
  };

  // Generate HTML for printing
  const generateInvoiceHTML = () => {
    const statusInfo = getPaymentStatusInfo(invoice.payment_status);
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice ${invoice.invoice_number}</title>
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
            .invoice-info {
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
            .payment-status {
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
            <div class="company-subtitle">${translate('salesInvoiceSystem')}</div>
        </div>

        <div class="invoice-info">
            <div class="info-section">
                <div class="section-title">${translate('invoiceDetails')}</div>
                <p><strong>${translate('invoiceNumber')}:</strong> ${invoice.invoice_number}</p>
                <p><strong>${translate('invoiceDate')}:</strong> ${formatDate(invoice.invoice_date)}</p>
                <p><strong>${translate('dueDate')}:</strong> ${formatDate(invoice.due_date)}</p>
                <div class="payment-status">${translate(invoice.payment_status)}</div>
            </div>

            <div class="info-section">
                <div class="section-title">${translate('customerInformation')}</div>
                <p><strong>${translate('customerName')}:</strong> ${isRTL ? invoice.customer?.name_ar || invoice.customer?.name : invoice.customer?.name}</p>
                <p><strong>${translate('territory')}:</strong> ${invoice.customer?.territory || ''}</p>
                <p><strong>${translate('customerType')}:</strong> ${invoice.customer?.customer_type || ''}</p>
                ${invoice.customer?.address_contact ? `<p><strong>${translate('address')}:</strong> ${invoice.customer.address_contact}</p>` : ''}
            </div>
        </div>

        <table class="items-table">
            <thead>
                <tr>
                    <th>${translate('itemDescription')}</th>
                    <th>${translate('quantity')}</th>
                    <th>${translate('unitPrice')}</th>
                    <th>${translate('total')}</th>
                </tr>
            </thead>
            <tbody>
                ${getItems().map(item => `
                    <tr>
                        <td>${item.description}</td>
                        <td>${item.qty}</td>
                        <td>${formatCurrency(item.price)}</td>
                        <td>${formatCurrency(item.qty * item.price)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <div class="totals-section">
            <div class="total-row">
                <span>${translate('subtotal')}:</span>
                <span>${formatCurrency(invoice.subtotal)}</span>
            </div>
            <div class="total-row">
                <span>${translate('taxAmount')} (${invoice.tax_percentage}%):</span>
                <span>${formatCurrency(invoice.tax_amount)}</span>
            </div>
            <div class="total-row">
                <span>${translate('discountAmount')} (${invoice.discount_percentage}%):</span>
                <span>-${formatCurrency(invoice.discount_amount)}</span>
            </div>
            <div class="total-row grand-total">
                <span>${translate('totalAmount')}:</span>
                <span>${formatCurrency(invoice.total_amount)}</span>
            </div>
        </div>

        ${invoice.notes ? `
        <div class="notes-section">
            <div class="section-title">${translate('notes')}</div>
            <p>${invoice.notes}</p>
        </div>
        ` : ''}

        <div class="footer">
            <p>${translate('generatedOn')} ${new Date().toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}</p>
            <p>${translate('paymentMethod')}: ${invoice.payment_method}</p>
            <p>${translate('createdBy')}: ${invoice.created_by}</p>
        </div>
    </body>
    </html>`;
  };

  // Print invoice
  const handlePrint = async () => {
    try {
      setLoading(true);
      const html = generateInvoiceHTML();
      
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

  // Share invoice as PDF
  const handleSharePDF = async () => {
    try {
      setLoading(true);
      const html = generateInvoiceHTML();
      
      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: `${translate('invoice')} ${invoice.invoice_number}`,
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

  // Share invoice details as text
  const handleShareText = async () => {
    try {
      const invoiceText = `
${translate('invoice')}: ${invoice.invoice_number}
${translate('customerName')}: ${isRTL ? invoice.customer?.name_ar || invoice.customer?.name : invoice.customer?.name}
${translate('invoiceDate')}: ${formatDate(invoice.invoice_date)}
${translate('dueDate')}: ${formatDate(invoice.due_date)}
${translate('totalAmount')}: ${formatCurrency(invoice.total_amount)}
${translate('paymentStatus')}: ${translate(invoice.payment_status)}

${translate('items')}:
${getItems().map(item => `• ${item.description} - ${translate('qty')}: ${item.qty} - ${formatCurrency(item.qty * item.price)}`).join('\n')}

${translate('generatedBy')} ${translate('appName')}
      `.trim();

      await Share.share({
        message: invoiceText,
        title: `${translate('invoice')} ${invoice.invoice_number}`,
      });
    } catch (error) {
      console.error('Share text error:', error);
      Alert.alert(translate('error'), translate('shareError'));
    }
  };

  const statusInfo = getPaymentStatusInfo(invoice.payment_status);

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
      title: translate('editInvoice'),
      icon: 'pencil',
      action: () => navigation.navigate('EditSalesInvoice', { invoice }),
      color: '#F39C12'
    }
  ];

  // Parse items safely
  const parseItems = (itemsString) => {
    try {
      if (!itemsString) return [];
      if (typeof itemsString === 'string') {
        return JSON.parse(itemsString);
      }
      return itemsString;
    } catch (error) {
      console.error('Error parsing items:', error);
      return [];
    }
  };

  // Get items safely
  const getItems = () => parseItems(invoice.items);

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
                {translate('invoiceDetails')}
              </Text>
              <Text style={[styles.headerSubtitle, isRTL && styles.arabicText]}>
                {invoice.invoice_number}
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
          <RefreshControl refreshing={refreshing} onRefresh={fetchInvoiceDetails} colors={['#6B7D3D']} />
        }
      >
        {/* Invoice Header Card */}
        <View style={styles.invoiceCard}>
          <View style={[styles.invoiceHeaderRow, isRTL && styles.rtlRow]}>
            <View style={styles.invoiceNumberSection}>
              <Text style={[styles.invoiceNumberLabel, isRTL && styles.arabicText]}>
                {translate('invoiceNumber')}
              </Text>
              <Text style={[styles.invoiceNumber, isRTL && styles.arabicText]}>
                {invoice.invoice_number}
              </Text>
            </View>
            
            <View style={[styles.paymentStatusContainer, { backgroundColor: statusInfo.bgColor }]}>
              <Ionicons name={statusInfo.icon} size={20} color={statusInfo.color} />
              <Text style={[styles.paymentStatusText, { color: statusInfo.color }, isRTL && styles.arabicText]}>
                {translate(invoice.payment_status)}
              </Text>
            </View>
          </View>

          <View style={styles.dateRow}>
            <View style={styles.dateItem}>
              <Text style={[styles.dateLabel, isRTL && styles.arabicText]}>
                {translate('invoiceDate')}
              </Text>
              <Text style={[styles.dateValue, isRTL && styles.arabicText]}>
                {formatDate(invoice.invoice_date)}
              </Text>
            </View>
            
            <View style={styles.dateItem}>
              <Text style={[styles.dateLabel, isRTL && styles.arabicText]}>
                {translate('dueDate')}
              </Text>
              <Text style={[styles.dateValue, isRTL && styles.arabicText]}>
                {formatDate(invoice.due_date)}
              </Text>
            </View>
          </View>
        </View>

        {/* Customer Information */}
        <View style={styles.section}>
          <View style={[styles.sectionHeader, isRTL && styles.rtlSectionHeader]}>
            <Ionicons name="person" size={24} color="#6B7D3D" />
            <Text style={[styles.sectionTitle, isRTL && styles.arabicText]}>
              {translate('customerInformation')}
            </Text>
          </View>
          
          <View style={styles.customerInfo}>
            <Text style={[styles.customerName, isRTL && styles.arabicText]}>
              {isRTL ? invoice.customer?.name_ar || invoice.customer?.name : invoice.customer?.name}
            </Text>
            
            <View style={styles.customerDetails}>
              <View style={styles.customerDetailRow}>
                <Ionicons name="location" size={16} color="#666" />
                <Text style={[styles.customerDetailText, isRTL && styles.arabicText]}>
                  {invoice.customer?.territory}
                </Text>
              </View>
              
              <View style={styles.customerDetailRow}>
                <Ionicons name="business" size={16} color="#666" />
                <Text style={[styles.customerDetailText, isRTL && styles.arabicText]}>
                  {invoice.customer?.customer_type}
                </Text>
              </View>
              
              {invoice.customer?.address_contact && (
                <View style={styles.customerDetailRow}>
                  <Ionicons name="home" size={16} color="#666" />
                  <Text style={[styles.customerDetailText, isRTL && styles.arabicText]}>
                    {invoice.customer.address_contact}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Items Section */}
        <View style={styles.section}>
          <View style={[styles.sectionHeader, isRTL && styles.rtlSectionHeader]}>
            <Ionicons name="list" size={24} color="#6B7D3D" />
            <Text style={[styles.sectionTitle, isRTL && styles.arabicText]}>
              {translate('invoiceItems')} ({getItems().length})
            </Text>
          </View>
          
          {getItems().map((item, index) => (
            <View key={index} style={styles.itemCard}>
              <View style={[styles.itemHeader, isRTL && styles.rtlItemHeader]}>
                <Text style={[styles.itemDescription, isRTL && styles.arabicText]}>
                  {item.description}
                </Text>
                <Text style={[styles.itemTotal, isRTL && styles.arabicText]}>
                  {formatCurrency(item.qty * item.price)}
                </Text>
              </View>
              
              <View style={[styles.itemDetails, isRTL && styles.rtlItemDetails]}>
                <View style={styles.itemDetailItem}>
                  <Text style={[styles.itemDetailLabel, isRTL && styles.arabicText]}>
                    {translate('quantity')}
                  </Text>
                  <Text style={[styles.itemDetailValue, isRTL && styles.arabicText]}>
                    {item.qty}
                  </Text>
                </View>
                
                <View style={styles.itemDetailItem}>
                  <Text style={[styles.itemDetailLabel, isRTL && styles.arabicText]}>
                    {translate('unitPrice')}
                  </Text>
                  <Text style={[styles.itemDetailValue, isRTL && styles.arabicText]}>
                    {formatCurrency(item.price)}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Financial Summary */}
        <View style={styles.section}>
          <View style={[styles.sectionHeader, isRTL && styles.rtlSectionHeader]}>
            <Ionicons name="calculator" size={24} color="#6B7D3D" />
            <Text style={[styles.sectionTitle, isRTL && styles.arabicText]}>
              {translate('financialSummary')}
            </Text>
          </View>
          
          <View style={styles.financialSummary}>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, isRTL && styles.arabicText]}>
                {translate('subtotal')}
              </Text>
              <Text style={[styles.summaryValue, isRTL && styles.arabicText]}>
                {formatCurrency(invoice.subtotal)}
              </Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, isRTL && styles.arabicText]}>
                {translate('taxAmount')} ({invoice.tax_percentage}%)
              </Text>
              <Text style={[styles.summaryValue, isRTL && styles.arabicText]}>
                {formatCurrency(invoice.tax_amount)}
              </Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, isRTL && styles.arabicText]}>
                {translate('discountAmount')} ({invoice.discount_percentage}%)
              </Text>
              <Text style={[styles.summaryValue, { color: '#E74C3C' }, isRTL && styles.arabicText]}>
                -{formatCurrency(invoice.discount_amount)}
              </Text>
            </View>
            
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={[styles.totalLabel, isRTL && styles.arabicText]}>
                {translate('totalAmount')}
              </Text>
              <Text style={[styles.totalValue, isRTL && styles.arabicText]}>
                {formatCurrency(invoice.total_amount)}
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Information */}
        <View style={styles.section}>
          <View style={[styles.sectionHeader, isRTL && styles.rtlSectionHeader]}>
            <Ionicons name="card" size={24} color="#6B7D3D" />
            <Text style={[styles.sectionTitle, isRTL && styles.arabicText]}>
              {translate('paymentInformation')}
            </Text>
          </View>
          
          <View style={styles.paymentInfo}>
            <View style={styles.paymentRow}>
              <Text style={[styles.paymentLabel, isRTL && styles.arabicText]}>
                {translate('paymentMethod')}
              </Text>
              <Text style={[styles.paymentValue, isRTL && styles.arabicText]}>
                {invoice.payment_method}
              </Text>
            </View>
            
            <View style={styles.paymentRow}>
              <Text style={[styles.paymentLabel, isRTL && styles.arabicText]}>
                {translate('paymentStatus')}
              </Text>
              <View style={[styles.paymentStatusBadge, { backgroundColor: statusInfo.bgColor }]}>
                <Text style={[styles.paymentStatusBadgeText, { color: statusInfo.color }, isRTL && styles.arabicText]}>
                  {translate(invoice.payment_status)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Notes Section */}
        {invoice.notes && (
          <View style={styles.section}>
            <View style={[styles.sectionHeader, isRTL && styles.rtlSectionHeader]}>
              <Ionicons name="document-text" size={24} color="#6B7D3D" />
              <Text style={[styles.sectionTitle, isRTL && styles.arabicText]}>
                {translate('notes')}
              </Text>
            </View>
            
            <View style={styles.notesContainer}>
              <Text style={[styles.notesText, isRTL && styles.arabicText]}>
                {invoice.notes}
              </Text>
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.quickActionButton, styles.printButton]}
            onPress={handlePrint}
            disabled={loading}
          >
            <Ionicons name="print" size={20} color="#fff" />
            <Text style={[styles.quickActionText, isRTL && styles.arabicText]}>
              {translate('print')}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.quickActionButton, styles.shareButton]}
            onPress={handleSharePDF}
            disabled={loading}
          >
            <Ionicons name="share" size={20} color="#fff" />
            <Text style={[styles.quickActionText, isRTL && styles.arabicText]}>
              {translate('share')}
            </Text>
          </TouchableOpacity>
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
              {translate('invoiceActions')}
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
  invoiceCard: {
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
  invoiceHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  rtlRow: {
    flexDirection: 'row-reverse',
  },
  invoiceNumberSection: {
    flex: 1,
  },
  invoiceNumberLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  invoiceNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  paymentStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 5,
  },
  paymentStatusText: {
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
  customerInfo: {
    marginTop: 10,
  },
  customerName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  customerDetails: {
    gap: 8,
  },
  customerDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  customerDetailText: {
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
  rtlItemHeader: {
    flexDirection: 'row-reverse',
  },
  itemDescription: {
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
  rtlItemDetails: {
    flexDirection: 'row-reverse',
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
  paymentInfo: {
    marginTop: 10,
    gap: 15,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentLabel: {
    fontSize: 14,
    color: '#666',
  },
  paymentValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  paymentStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  paymentStatusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
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
  quickActions: {
    flexDirection: 'row',
    gap: 15,
    marginVertical: 20,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 12,
    gap: 8,
  },
  printButton: {
    backgroundColor: '#6B7D3D',
  },
  shareButton: {
    backgroundColor: '#3498DB',
  },
  quickActionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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

export default InvoiceDetailsScreen;