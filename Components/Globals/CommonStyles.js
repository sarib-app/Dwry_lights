// CommonStyles.js - Shared stylesheet for Planet Dory app
import { StyleSheet } from 'react-native';

export const commonStyles = StyleSheet.create({
  // === CONTAINERS & LAYOUT ===
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
  
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  
  bottomSpace: {
    height: 30,
  },

  // === HEADER STYLES ===
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
  
  actionsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  placeholder: {
    width: 40,
  },

  // === CARD & SECTION STYLES ===
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
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  
  rtlSectionHeader: {
    flexDirection: 'row-reverse',
  },
  
  card: {
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

  // === STATS CARDS ===
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

  // === SEARCH & FILTER ===
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

  // === FORM STYLES ===
  inputGroup: {
    marginBottom: 20,
  },
  
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  
  halfWidth: {
    flex: 1,
  },
  
  dateInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9f9f9',
  },
  
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  
  selector: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9f9f9',
  },
  
  selectorText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  
  placeholder: {
    color: '#999',
  },

  // === BUTTON STYLES ===
  submitButton: {
    backgroundColor: '#6B7D3D',
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    gap: 8,
  },
  
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
  
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(107, 125, 61, 0.1)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 5,
  },
  
  addItemText: {
    fontSize: 14,
    color: '#6B7D3D',
    fontWeight: '600',
  },

  // === ITEM MANAGEMENT ===
  itemCard: {
    backgroundColor: '#f8fafb',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  },
  
  removeItemButton: {
    padding: 5,
  },
  
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  
  itemInputGroup: {
    marginBottom: 0,
  },
  
  flex1: { flex: 1 },
  flex2: { flex: 2 },
  
  itemLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 5,
  },
  
  itemInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  
  itemTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6B7D3D',
    paddingVertical: 8,
  },

  // === STATUS STYLES ===
  statusContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  
  statusOption: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  
  statusOptionActive: {
    backgroundColor: '#6B7D3D',
  },
  
  statusOptionText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  
  statusOptionTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  
  paymentStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignItems: 'center',
  },
  
  paymentStatusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },

  // === MODAL STYLES ===
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
  
  pickerList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  
  pickerItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  pickerItemContent: {
    flex: 1,
  },
  
  pickerItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  
  pickerItemDetails: {
    fontSize: 14,
    color: '#666',
  },

  // === EMPTY STATES ===
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
  
  noItemsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  
  noItemsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    marginTop: 15,
    marginBottom: 5,
  },
  
  noItemsSubtext: {
    fontSize: 14,
    color: '#bbb',
    textAlign: 'center',
  },
  
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  
  noDataText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    marginTop: 15,
  },

  // === FINANCIAL SUMMARY ===
  calculatedSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  
  calculatedTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  
  calculatedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  
  calculatedLabel: {
    fontSize: 14,
    color: '#666',
  },
  
  calculatedValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  
  totalRow: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6B7D3D',
  },

  // === RTL SUPPORT ===
  arabicText: {
    textAlign: 'right',
    fontFamily: 'Arabic',
  },
  
  rtlRow: {
    flexDirection: 'row-reverse',
  },
  
  rtlInvoiceHeader: {
    flexDirection: 'row-reverse',
  },
  
  rtlInvoiceDetails: {
    alignItems: 'flex-end',
  },
  
  rtlInvoiceMeta: {
    alignItems: 'flex-end',
  },
  
  rtlInvoiceActions: {
    flexDirection: 'row-reverse',
  },
  
  rtlItemDetails: {
    flexDirection: 'row-reverse',
  },

  // === QUICK ACTIONS ===
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

  // === FILTER OPTIONS ===
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

  // === LOADING OVERLAY ===
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
  
  loadingOverlayContainer: {
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
  
  loadingOverlayText: {
    marginTop: 15,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
});

// Additional utility functions for common patterns
export const getStatusColor = (status) => {
  switch (status) {
    case 'paid':
    case 'approved':
    case 'completed':
    case 'delivered':
      return '#27AE60';
    case 'pending':
    case 'processing':
      return '#F39C12';
    case 'overdue':
    case 'rejected':
    case 'cancelled':
      return '#E74C3C';
    case 'shipped':
    case 'in_transit':
      return '#3498DB';
    default:
      return '#95A5A6';
  }
};

export const getStatusInfo = (status) => {
  const color = getStatusColor(status);
  let icon;
  
  switch (status) {
    case 'paid':
    case 'approved':
    case 'completed':
    case 'delivered':
      icon = 'checkmark-circle';
      break;
    case 'pending':
    case 'processing':
      icon = 'time';
      break;
    case 'overdue':
    case 'rejected':
    case 'cancelled':
      icon = 'close-circle';
      break;
    case 'shipped':
    case 'in_transit':
      icon = 'car';
      break;
    default:
      icon = 'help-circle';
  }
  
  return {
    color,
    icon,
    bgColor: `${color}20`, // 20% opacity
  };
};

export default commonStyles;