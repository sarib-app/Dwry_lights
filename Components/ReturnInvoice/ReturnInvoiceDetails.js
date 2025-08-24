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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import languageService from '../Globals/Store/Lang';
import getAuthToken from '../Globals/Store/LocalData';
import getUserRole from '../Globals/Store/GetRoleId';
import simplePermissions from '../Globals/Store/PermissionsDemo';
import commonStyles from '../Globals/CommonStyles';

const API_BASE_URL = 'https://planetdory.dwrylight.com/api';

const ReturnInvoiceDetailsScreen = ({ navigation, route }) => {
  const { invoice } = route.params;
  const [loading, setLoading] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isRTL, setIsRTL] = useState(false);
  const [roleId, setRoleId] = useState(null);
  const [userPermissions, setUserPermissions] = useState([]);
  const [showActionsModal, setShowActionsModal] = useState(false);

  const translate = (key) => languageService.translate(key);

  useEffect(() => {
    initializeScreen();
  }, []);

  const initializeScreen = async () => {
    try {
      const role = await getUserRole();
      setRoleId(role);
      if (role === 3) {
        const permissions = await simplePermissions.fetchUserPermissions();
        setUserPermissions(permissions);
      }
      const language = await languageService.loadSavedLanguage();
      setCurrentLanguage(language);
      setIsRTL(language === 'ar');
    } catch (error) {
      console.error('Error initializing permissions:', error);
    }
  };

  const hasReturnInvoicePermission = (type) => {
    if (roleId !== 3) return true;
    const permissionName = `return_invoices.${type}`;
    return userPermissions.some(permission => 
      permission.name === permissionName && permission.module === 'return_invoices'
    );
  };

  const canViewReturnInvoices = () => hasReturnInvoicePermission('view') || hasReturnInvoicePermission('management');
  const canApproveReturnInvoices = () => hasReturnInvoicePermission('approve') || hasReturnInvoicePermission('management');

  const approveReturnInvoice = async () => {
    if (!canApproveReturnInvoices()) {
      Alert.alert(translate('accessDenied'), translate('noPermissionToApproveReturnInvoice'));
      return;
    }

    if (invoice.status === 'approved') {
      Alert.alert(translate('info'), translate('returnInvoiceAlreadyApproved'));
      return;
    }

    Alert.alert(
      translate('approveReturnInvoice'),
      translate('confirmApproveReturnInvoice'),
      [
        { text: translate('cancel'), style: 'cancel' },
        {
          text: translate('approve'),
          style: 'default',
          onPress: async () => {
            setLoading(true);
            try {
              const token = await getAuthToken();
              if (!token) return;

              const response = await fetch(`${API_BASE_URL}/approve_return/${invoice.id}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
              });
              
              const result = await response.json();
              if (result.status === 200) {
                Alert.alert(
                  translate('success'),
                  translate('returnInvoiceApprovedSuccessfully'),
                  [
                    {
                      text: translate('ok'),
                      onPress: () => navigation.goBack()
                    }
                  ]
                );
              } else {
                Alert.alert(translate('error'), result.message || translate('failedToApproveReturnInvoice'));
              }
            } catch (error) {
              console.error('Approve return invoice error:', error);
              Alert.alert(translate('error'), translate('networkErrorApprovingReturnInvoice'));
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // Generate HTML for printing
  const generateReturnInvoiceHTML = () => {
    return `
    <!DOCTYPE html>
    <html lang="${currentLanguage}">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${translate('returnInvoice')} ${invoice.return_invoice_number}</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
                background-color: #f8f9fa;
                direction: ${isRTL ? 'rtl' : 'ltr'};
            }
            .container {
                max-width: 800px;
                margin: 0 auto;
                background: white;
                padding: 30px;
                border-radius: 15px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                border-bottom: 3px solid #6B7D3D;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            .company-name {
                font-size: 28px;
                font-weight: bold;
                color: #6B7D3D;
                margin-bottom: 5px;
            }
            .company-subtitle {
                font-size: 16px;
                color: #666;
            }
            .invoice-info {
                display: flex;
                justify-content: space-between;
                margin-bottom: 30px;
                gap: 20px;
            }
            .info-section {
                flex: 1;
                background: #f8f9fa;
                padding: 20px;
                border-radius: 10px;
                border: 1px solid #e9ecef;
            }
            .section-title {
                font-size: 18px;
                font-weight: bold;
                color: #333;
                margin-bottom: 15px;
                padding-bottom: 8px;
                border-bottom: 2px solid #6B7D3D;
            }
            .info-section p {
                margin: 8px 0;
                font-size: 14px;
                color: #333;
            }
            .info-section strong {
                color: #6B7D3D;
            }
            .status-badge {
                display: inline-block;
                padding: 8px 16px;
                border-radius: 20px;
                color: white;
                font-weight: bold;
                text-transform: capitalize;
                margin-top: 10px;
            }
            .status-pending { background-color: #F39C12; }
            .status-approved { background-color: #27AE60; }
            .status-rejected { background-color: #E74C3C; }
            
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
        <div class="container">
            <div class="header">
                <div class="company-name">${translate('appName')}</div>
                <div class="company-subtitle">${translate('returnInvoiceSystem')}</div>
            </div>

            <div class="invoice-info">
                <div class="info-section">
                    <div class="section-title">${translate('returnInvoiceDetails')}</div>
                    <p><strong>${translate('returnInvoiceNumber')}:</strong> ${invoice.return_invoice_number}</p>
                    <p><strong>${translate('returnDate')}:</strong> ${formatDate(invoice.return_date)}</p>
                    <p><strong>${translate('originalInvoice')}:</strong> ${invoice.original_invoice?.invoice_number}</p>
                    <div class="status-badge status-${invoice.status}">${translate(invoice.status)}</div>
                </div>

                <div class="info-section">
                    <div class="section-title">${translate('customerInformation')}</div>
                    <p><strong>${translate('customerName')}:</strong> ${isRTL ? invoice.customer?.name_ar || invoice.customer?.name : invoice.customer?.name}</p>
                    <p><strong>${translate('customerType')}:</strong> ${invoice.customer?.customer_type || ''}</p>
                    ${invoice.customer?.territory ? `<p><strong>${translate('territory')}:</strong> ${invoice.customer.territory}</p>` : ''}
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
                    ${invoice.items?.map(item => `
                        <tr>
                            <td>${item.description}</td>
                            <td>${item.qty}</td>
                            <td>${formatCurrency(item.price)}</td>
                            <td>${formatCurrency(item.qty * item.price)}</td>
                        </tr>
                    `).join('') || ''}
                </tbody>
            </table>

            <div class="totals-section">
                <div class="total-row">
                    <span>${translate('subtotal')}:</span>
                    <span>${formatCurrency(invoice.subtotal)}</span>
                </div>
                <div class="total-row">
                    <span>${translate('taxAmount')}:</span>
                    <span>${formatCurrency(invoice.tax_amount)}</span>
                </div>
                <div class="total-row">
                    <span>${translate('discountAmount')}:</span>
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
                <p>${translate('returnInvoiceSystem')}</p>
            </div>
        </div>
    </body>
    </html>`;
  };

  // Print return invoice
  const handlePrint = async () => {
    try {
      setLoading(true);
      const html = generateReturnInvoiceHTML();
      
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

  // Share return invoice as PDF
  const handleSharePDF = async () => {
    try {
      setLoading(true);
      const html = generateReturnInvoiceHTML();
      
      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: `${translate('returnInvoice')} ${invoice.return_invoice_number}`,
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

  // Share return invoice details as text
  const handleShareText = async () => {
    try {
      const invoiceText = `
${translate('returnInvoice')}: ${invoice.return_invoice_number}
${translate('customerName')}: ${isRTL ? invoice.customer?.name_ar || invoice.customer?.name : invoice.customer?.name}
${translate('returnDate')}: ${formatDate(invoice.return_date)}
${translate('originalInvoice')}: ${invoice.original_invoice?.invoice_number}
${translate('totalAmount')}: ${formatCurrency(invoice.total_amount)}
${translate('status')}: ${translate(invoice.status)}

${translate('returnedItems')}:
${invoice.items?.map(item => `• ${item.description} - ${translate('qty')}: ${item.qty} - ${formatCurrency(item.qty * item.price)}`).join('\n') || ''}

${translate('generatedBy')} ${translate('appName')}
      `.trim();

      await Share.share({
        message: invoiceText,
        title: `${translate('returnInvoice')} ${invoice.return_invoice_number}`,
      });
    } catch (error) {
      console.error('Share text error:', error);
      Alert.alert(translate('error'), translate('shareError'));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    const number = parseFloat(amount) || 0;
    return isRTL ? `${number.toFixed(2)} ر.س` : `$${number.toFixed(2)}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#27AE60';
      case 'pending': return '#F39C12';
      case 'rejected': return '#E74C3C';
      default: return '#95A5A6';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return 'checkmark-circle';
      case 'pending': return 'time';
      case 'rejected': return 'close-circle';
      default: return 'help-circle';
    }
  };

  if (!canViewReturnInvoices()) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={styles.noAccessContainer}>
          <Ionicons name="lock-closed" size={64} color="#ccc" />
          <Text style={styles.noAccessText}>Access Denied</Text>
          <Text style={styles.noAccessSubtext}>
            You do not have permission to view return invoice details
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
                {translate('returnInvoiceDetails')}
              </Text>
              <Text style={[commonStyles.headerSubtitle, isRTL && commonStyles.arabicText]}>
                {invoice.return_invoice_number}
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

      <ScrollView style={commonStyles.content} showsVerticalScrollIndicator={false}>
        {/* Header Card */}
        <View style={styles.invoiceCard}>
          <View style={[styles.invoiceHeaderRow, isRTL && commonStyles.rtlRow]}>
            <View style={styles.invoiceNumberSection}>
              <Text style={[styles.invoiceNumberLabel, isRTL && commonStyles.arabicText]}>
                {translate('returnInvoiceNumber')}
              </Text>
              <Text style={[styles.invoiceNumber, isRTL && commonStyles.arabicText]}>
                {invoice.return_invoice_number}
              </Text>
            </View>
            
            <View style={styles.statusContainer}>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(invoice.status) }]}>
                <Ionicons name={getStatusIcon(invoice.status)} size={16} color="#fff" />
                <Text style={[styles.statusText, isRTL && commonStyles.arabicText]}>
                  {translate(invoice.status)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.dateRow}>
            <View style={styles.dateItem}>
              <Text style={[styles.dateLabel, isRTL && commonStyles.arabicText]}>
                {translate('returnDate')}
              </Text>
              <Text style={[styles.dateValue, isRTL && commonStyles.arabicText]}>
                {formatDate(invoice.return_date)}
              </Text>
            </View>
            
            <View style={styles.dateItem}>
              <Text style={[styles.dateLabel, isRTL && commonStyles.arabicText]}>
                {translate('originalInvoice')}
              </Text>
              <Text style={[styles.dateValue, isRTL && commonStyles.arabicText]}>
                {invoice.original_invoice?.invoice_number}
              </Text>
            </View>
          </View>
        </View>

        {/* Customer Information */}
        <View style={styles.invoiceCard}>
          <Text style={[styles.sectionTitle, isRTL && commonStyles.arabicText]}>
            {translate('customerInformation')}
          </Text>
          
          <View style={styles.customerInfo}>
            <View style={styles.customerRow}>
              <Ionicons name="person" size={20} color="#6B7D3D" />
              <Text style={[styles.customerLabel, isRTL && commonStyles.arabicText]}>
                {translate('customerName')}:
              </Text>
              <Text style={[styles.customerValue, isRTL && commonStyles.arabicText]}>
                {isRTL ? invoice.customer?.name_ar || invoice.customer?.name : invoice.customer?.name}
              </Text>
            </View>
            
            {invoice.customer?.territory && (
              <View style={styles.customerRow}>
                <Ionicons name="location" size={20} color="#6B7D3D" />
                <Text style={[styles.customerLabel, isRTL && commonStyles.arabicText]}>
                  {translate('territory')}:
                </Text>
                <Text style={[styles.customerValue, isRTL && commonStyles.arabicText]}>
                  {invoice.customer.territory}
                </Text>
              </View>
            )}
            
            {invoice.customer?.customer_type && (
              <View style={styles.customerRow}>
                <Ionicons name="business" size={20} color="#6B7D3D" />
                <Text style={[styles.customerLabel, isRTL && commonStyles.arabicText]}>
                  {translate('customerType')}:
                </Text>
                <Text style={[styles.customerValue, isRTL && commonStyles.arabicText]}>
                  {invoice.customer.customer_type}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Items Section */}
        {invoice.items && invoice.items.length > 0 && (
          <View style={styles.invoiceCard}>
            <Text style={[styles.sectionTitle, isRTL && commonStyles.arabicText]}>
              {translate('returnedItems')} ({invoice.items.length})
            </Text>
            
            {invoice.items.map((item, index) => (
              <View key={index} style={styles.itemCard}>
                <View style={styles.itemHeader}>
                  <Text style={[styles.itemName, isRTL && commonStyles.arabicText]}>
                    {item.description}
                  </Text>
                  <Text style={[styles.itemId, isRTL && commonStyles.arabicText]}>
                    ID: {item.item_id}
                  </Text>
                </View>
                
                <View style={styles.itemDetails}>
                  <View style={styles.itemDetail}>
                    <Text style={[styles.itemDetailLabel, isRTL && commonStyles.arabicText]}>
                      {translate('quantity')}:
                    </Text>
                    <Text style={[styles.itemDetailValue, isRTL && commonStyles.arabicText]}>
                      {item.qty}
                    </Text>
                  </View>
                  
                  <View style={styles.itemDetail}>
                    <Text style={[styles.itemDetailLabel, isRTL && commonStyles.arabicText]}>
                      {translate('unitPrice')}:
                    </Text>
                    <Text style={[styles.itemDetailValue, isRTL && commonStyles.arabicText]}>
                      {formatCurrency(item.price)}
                    </Text>
                  </View>
                  
                  <View style={styles.itemDetail}>
                    <Text style={[styles.itemDetailLabel, isRTL && commonStyles.arabicText]}>
                      {translate('total')}:
                    </Text>
                    <Text style={[styles.itemDetailValue, isRTL && commonStyles.arabicText]}>
                      {formatCurrency(item.qty * item.price)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Financial Summary */}
        <View style={styles.invoiceCard}>
          <Text style={[styles.sectionTitle, isRTL && commonStyles.arabicText]}>
            {translate('financialSummary')}
          </Text>
          
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, isRTL && commonStyles.arabicText]}>
              {translate('subtotal')}:
            </Text>
            <Text style={[styles.summaryValue, isRTL && commonStyles.arabicText]}>
              {formatCurrency(invoice.subtotal)}
            </Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, isRTL && commonStyles.arabicText]}>
              {translate('tax')}:
            </Text>
            <Text style={[styles.summaryValue, isRTL && commonStyles.arabicText]}>
              {formatCurrency(invoice.tax_amount)}
            </Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, isRTL && commonStyles.arabicText]}>
              {translate('discount')}:
            </Text>
            <Text style={[styles.summaryValue, { color: '#E74C3C' }, isRTL && commonStyles.arabicText]}>
              -{formatCurrency(invoice.discount_amount)}
            </Text>
          </View>
          
          <View style={[styles.summaryRow, styles.grandTotal]}>
            <Text style={[styles.grandTotalLabel, isRTL && commonStyles.arabicText]}>
              {translate('totalAmount')}:
            </Text>
            <Text style={[styles.grandTotalValue, isRTL && commonStyles.arabicText]}>
              {formatCurrency(invoice.total_amount)}
            </Text>
          </View>
        </View>

        {/* Notes Section */}
        {invoice.notes && (
          <View style={styles.invoiceCard}>
            <Text style={[styles.sectionTitle, isRTL && commonStyles.arabicText]}>
              {translate('notes')}
            </Text>
            <Text style={[styles.notesText, isRTL && commonStyles.arabicText]}>
              {invoice.notes}
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {invoice.status === 'pending' && canApproveReturnInvoices() && (
            <TouchableOpacity
              style={[styles.actionButton, styles.approveActionButton]}
              onPress={approveReturnInvoice}
              disabled={loading}
            >
              <Ionicons name="checkmark" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>{translate('approveReturn')}</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[styles.actionButton, styles.printButton]}
            onPress={handlePrint}
            disabled={loading}
          >
            <Ionicons name="print" size={20} color="#6B7D3D" />
            <Text style={[styles.actionButtonText, { color: '#6B7D3D' }]}>
              {translate('print')}
            </Text>
          </TouchableOpacity>
        </View>
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
              {translate('actions')}
            </Text>
            <TouchableOpacity
              style={commonStyles.modalCloseButton}
              onPress={() => setShowActionsModal(false)}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.actionsList}>
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => {
                setShowActionsModal(false);
                handlePrint();
              }}
            >
              <Ionicons name="print" size={24} color="#6B7D3D" />
              <Text style={[styles.actionItemText, isRTL && commonStyles.arabicText]}>
                {translate('print')}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => {
                setShowActionsModal(false);
                handleSharePDF();
              }}
            >
              <Ionicons name="document" size={24} color="#6B7D3D" />
              <Text style={[styles.actionItemText, isRTL && commonStyles.arabicText]}>
                {translate('shareAsPDF')}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => {
                setShowActionsModal(false);
                handleShareText();
              }}
            >
              <Ionicons name="share" size={24} color="#6B7D3D" />
              <Text style={[styles.actionItemText, isRTL && commonStyles.arabicText]}>
                {translate('shareAsText')}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 20,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#6B7D3D',
  },
  customerInfo: {
    gap: 16,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  customerLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
    flex: 1,
  },
  customerValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  itemCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  itemId: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemDetail: {
    alignItems: 'center',
    flex: 1,
  },
  itemDetailLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  itemDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  grandTotal: {
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingTop: 16,
    marginTop: 8,
  },
  grandTotalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6B7D3D',
  },
  notesText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginBottom: 30,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
  },
  approveActionButton: {
    backgroundColor: '#27AE60',
  },
  printButton: {
    backgroundColor: 'rgba(107, 125, 61, 0.1)',
    borderWidth: 1,
    borderColor: '#6B7D3D',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  actionsList: {
    padding: 20,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 16,
  },
  actionItemText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
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
});

export default ReturnInvoiceDetailsScreen;
