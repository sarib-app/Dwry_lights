// languages.js - Global Language Service
import AsyncStorage from '@react-native-async-storage/async-storage';

const LANGUAGE_KEY = '@planet_dory_language';

// Language translations
export const translations = {
  en: {
    // App General
    appName: 'Planet Dory',
    appNameArabic: 'كوكب دوري',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    ok: 'OK',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    search: 'Search',
    filter: 'Filter',
    refresh: 'Refresh',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    submit: 'Submit',
    close: 'Close',
    confirm: 'Confirm',
    yes: 'Yes',
    no: 'No',

    // Language Selection
    selectLanguage: 'Select Language',
    english: 'English',
    arabic: 'العربية',
    languageChanged: 'Language changed successfully',

    // Authentication
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    forgotPassword: 'Forgot Password?',
    resetPassword: 'Reset Password',
    createAccount: 'Create Account',
    alreadyHaveAccount: 'Already have an account?',
    dontHaveAccount: "Don't have an account?",
    rememberMe: 'Remember me',
    useBiometricLogin: 'Use biometric login',
    welcomeBack: 'Welcome back! Please sign in to continue',

    // Registration Form
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    iqamaNumber: 'Iqama Number',
    dateOfBirth: 'Date of Birth',
    role: 'Role',
    phoneNumber: 'Phone Number',

    // Placeholders
    enterFirstName: 'Enter first name',
    enterLastName: 'Enter last name',
    enterEmail: 'Enter email address',
    enterPassword: 'Enter password',
    reenterPassword: 'Re-enter password',
    enterIqama: 'Enter Iqama number (10 digits)',
    enterPhone: 'Enter phone number',

    // Roles
    admin: 'Admin',
    warehouseManager: 'Warehouse Manager',
    salesRepresentative: 'Sales Representative',

    // Validation Messages
    required: 'This field is required',
    firstNameRequired: 'First name is required',
    lastNameRequired: 'Last name is required',
    emailRequired: 'Email is required',
    passwordRequired: 'Password is required',
    iqamaRequired: 'Iqama number is required',
    phoneRequired: 'Phone number is required',
    invalidEmail: 'Invalid email format',
    invalidIqama: 'Iqama number must be 10 digits',
    invalidPhone: 'Invalid phone number format',
    passwordMinLength: 'Password must be at least 6 characters',
    passwordsNotMatch: 'Passwords do not match',

    // Success Messages
    registrationSuccessful: 'Registration Successful',
    accountCreated: 'Account created successfully',
    loginSuccessful: 'Login Successful',
    profileUpdated: 'Profile updated successfully',
    passwordReset: 'Password reset link sent to your email',

    // Error Messages
    registrationError: 'Registration Error',
    loginError: 'Login Error',
    connectionError: 'Connection Error',
    networkError: 'Please check your internet connection',
    serverError: 'Server error occurred',
    unauthorizedError: 'Unauthorized access',
    emailAlreadyTaken: 'The email has already been taken',
    invalidCredentials: 'Invalid email or password',

    // Dashboard
    dashboard: 'Dashboard',
    todaySales: "Today's Sales",
    monthlySales: 'Monthly Sales',
    totalCustomers: 'Total Customers',
    pendingOrders: 'Pending Orders',
    lowStock: 'Low Stock Items',
    recentActivities: 'Recent Activities',

    // Customers
    customers: 'Customers',
    customer: 'Customer',
    customerName: 'Customer Name',
    customerDetails: 'Customer Details',
    addCustomer: 'Add Customer',
    editCustomer: 'Edit Customer',
    deleteCustomer: 'Delete Customer',
    customerCreated: 'Customer created successfully',
    customerUpdated: 'Customer updated successfully',
    customerDeleted: 'Customer deleted successfully',
    noCustomers: 'No customers found',

    // Products
    products: 'Products',
    product: 'Product',
    productName: 'Product Name',
    productDetails: 'Product Details',
    price: 'Price',
    quantity: 'Quantity',
    stock: 'Stock',
    category: 'Category',
    description: 'Description',

    // Sales
    sales: 'Sales',
    sale: 'Sale',
    createSale: 'Create Sale',
    saleAmount: 'Sale Amount',
    saleDate: 'Sale Date',
    invoice: 'Invoice',
    invoiceNumber: 'Invoice Number',
    total: 'Total',
    subtotal: 'Subtotal',
    tax: 'Tax',
    discount: 'Discount',
    grandTotal: 'Grand Total',

    // Navigation
    home: 'Home',
    profile: 'Profile',
    settings: 'Settings',
    reports: 'Reports',
    inventory: 'Inventory',
    visits: 'Visits',

    // Settings
    changeLanguage: 'Change Language',
    changePassword: 'Change Password',
    notifications: 'Notifications',
    about: 'About',
    version: 'Version',
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service',

    // Common Business Terms
    vat: 'VAT',
    vatNumber: 'VAT Number',
    customerNumber: 'Customer Number',
    poNumber: 'P.O. Number',
    issueDate: 'Issue Date',
    dueDate: 'Due Date',
    balanceDue: 'Balance Due',
    receivedBy: 'Received By',
    authorizedSignature: 'Authorized Signature',

    //Bottom Navigatuion
    // In English section:
insights: 'Insights',
actions: 'Actions',

//Auth stack language settere
selectLanguage: 'Select Language',
choosePreferred: 'Choose your preferred language',
continue: 'Continue',

// Permission Management
assigned: 'Assigned',
all: 'All',

//Action screen

items: 'Items',
inventory: 'Inventory',
categories: 'Categories',
customers: 'Customers',
staff: 'Staff',
suppliers: 'Suppliers',
'sales invoice': 'Sales Invoice',
'purchase orders': 'Purchase Orders',
expenses: 'Expenses',
payments: 'Payments',
reports: 'Reports',
territories: 'Territories',
quotations: 'Quotations',
returns: 'Returns',
corebusiness: 'Core Business',
peoplemanagement: 'People Management',
financial: 'Financial',
operations: 'Operations',



// Sales Invoice Management
salesInvoices: 'Sales Invoices',
invoicesTotal: 'invoices total',
addInvoice: 'Add Invoice',
editInvoice: 'Edit Invoice',
deleteInvoice: 'Delete Invoice',
deleteInvoiceConfirmation: 'Are you sure you want to delete this invoice?',
invoiceDeletedSuccessfully: 'Invoice deleted successfully',
failedToDeleteInvoice: 'Failed to delete invoice',
networkErrorDeletingInvoice: 'Network error while deleting invoice',
loadingInvoices: 'Loading invoices...',
searchInvoices: 'Search invoices...',
filterInvoices: 'Filter Invoices',
noInvoicesFound: 'No invoices found',
noInvoicesAvailable: 'No invoices available',
tryAdjustingSearch: 'Try adjusting your search filters',
addFirstInvoice: 'Add your first invoice to get started',
failedToFetchInvoices: 'Failed to fetch invoices',
networkErrorFetchingInvoices: 'Network error while fetching invoices',
authTokenNotFound: 'Authentication token not found',

// Invoice Status
paid: 'Paid',
pending: 'Pending',
overdue: 'Overdue',
allInvoices: 'All Invoices',
paidInvoices: 'Paid Invoices',
pendingInvoices: 'Pending Invoices',
overdueInvoices: 'Overdue Invoices',

// Invoice Details
invoiceNumber: 'Invoice Number',
invoiceDate: 'Invoice Date',
dueDate: 'Due Date',
totalAmount: 'Total Amount',
paymentMethod: 'Payment Method',
itemsCount: 'Items Count',
notes: 'Notes',
view: 'View',
totalInvoices: 'Total Invoices',

// Customer
customerName: 'Customer Name',

// Invoice Details Screen
invoiceDetails: 'Invoice Details',
customerInformation: 'Customer Information',
invoiceItems: 'Invoice Items',
financialSummary: 'Financial Summary',
paymentInformation: 'Payment Information',
invoiceActions: 'Invoice Actions',
processing: 'Processing',

// Customer Details
territory: 'Territory',
customerType: 'Customer Type',
address: 'Address',

// Item Details
itemDescription: 'Item Description',
itemCode: 'Item Code',
unitPrice: 'Unit Price',
costToCompany: 'Cost to Company',

// Actions
print: 'Print',
sharePDF: 'Share PDF',
shareText: 'Share Text',
editInvoice: 'Edit Invoice',
share: 'Share',

// Invoice Template
salesInvoiceSystem: 'Sales Invoice System',
generatedOn: 'Generated on',
generatedBy: 'Generated by',
createdBy: 'Created by',

// Messages
failedToFetchInvoiceDetails: 'Failed to fetch invoice details',
networkErrorFetchingDetails: 'Network error while fetching details',
printError: 'Failed to print invoice',
shareError: 'Failed to share invoice',
sharingNotAvailable: 'Sharing is not available on this device',

// General
info: 'Information',
items: 'Items',
qty: 'Qty',


// Expense Management
expenseManagement: 'Expense Management',
expensesTotal: 'expenses total',
addExpense: 'Add Expense',
editExpense: 'Edit Expense',
deleteExpense: 'Delete Expense',
deleteExpenseConfirmation: 'Are you sure you want to delete this expense?',
expenseDeletedSuccessfully: 'Expense deleted successfully',
failedToDeleteExpense: 'Failed to delete expense',
networkErrorDeletingExpense: 'Network error while deleting expense',
loadingExpenses: 'Loading expenses...',
searchExpenses: 'Search expenses...',
filterExpenses: 'Filter Expenses',
noExpensesFound: 'No expenses found',
noExpensesAvailable: 'No expenses available',
addFirstExpense: 'Add your first expense to get started',
failedToFetchExpenses: 'Failed to fetch expenses',
networkErrorFetchingExpenses: 'Network error while fetching expenses',

// Expense Status
approved: 'Approved',
pending: 'Pending',
rejected: 'Rejected',
allExpenses: 'All Expenses',
approvedExpenses: 'Approved Expenses',
pendingExpenses: 'Pending Expenses',
rejectedExpenses: 'Rejected Expenses',
totalExpenses: 'Total Expenses',

// Expense Form
expenseInformation: 'Expense Information',
assignmentDetails: 'Assignment Details',
expenseDate: 'Expense Date',
category: 'Category',
description: 'Description',
amount: 'Amount',
assignToStaff: 'Assign to Staff',
vendor: 'Vendor',
department: 'Department',
receiptImage: 'Receipt Image',
enterExpenseDescription: 'Enter expense description',
enterDepartment: 'Enter department',
selectStaffMember: 'Select staff member',
selectVendor: 'Select vendor',
addReceiptImage: 'Add Receipt Image',
tapToSelectOrTakePhoto: 'Tap to select from gallery or take photo',
viewReceipt: 'View Receipt',

// Image Actions
selectReceiptImage: 'Select Receipt Image',
chooseImageSource: 'Choose image source',
takePhoto: 'Take Photo',
chooseFromGallery: 'Choose from Gallery',
permissionRequired: 'Permission Required',
cameraPermission: 'We need camera permission to take photos',
cameraRollPermission: 'We need camera roll permission to select images',
failedToSelectImage: 'Failed to select image',
failedToTakePhoto: 'Failed to take photo',

// Categories
officesupplies: 'Office Supplies',
traveltransportation: 'Travel & Transportation',
mealsentertainment: 'Meals & Entertainment',
equipment: 'Equipment',
softwaresubscriptions: 'Software & Subscriptions',
marketing: 'Marketing',
training: 'Training',
utilities: 'Utilities',
rent: 'Rent',
other: 'Other',

// Validation & Messages
categoryRequired: 'Category is required',
descriptionRequired: 'Description is required',
validAmountRequired: 'Valid amount is required',
staffRequired: 'Staff assignment is required',
expenseCreatedSuccessfully: 'Expense created successfully!',
expenseUpdatedSuccessfully: 'Expense updated successfully!',
failedToCreateExpense: 'Failed to create expense',
failedToUpdateExpense: 'Failed to update expense',
networkErrorCreatingExpense: 'Network error while creating expense',
networkErrorUpdatingExpense: 'Network error while updating expense',
createExpense: 'Create Expense',
updateExpense: 'Update Expense',

// Staff & Suppliers
selectStaff: 'Select Staff',
selectVendor: 'Select Vendor',
noStaffAvailable: 'No staff members available',
noSuppliersAvailable: 'No suppliers available',


// Purchase Order Management
purchaseOrders: 'Purchase Orders',
ordersTotal: 'orders total',
addPurchaseOrder: 'Add Purchase Order',
editPurchaseOrder: 'Edit Purchase Order',
deletePurchaseOrder: 'Delete Purchase Order',
deletePurchaseOrderConfirmation: 'Are you sure you want to delete this purchase order?',
purchaseOrderDeletedSuccessfully: 'Purchase order deleted successfully',
failedToDeletePurchaseOrder: 'Failed to delete purchase order',
networkErrorDeletingPurchaseOrder: 'Network error while deleting purchase order',
loadingPurchaseOrders: 'Loading purchase orders...',
searchPurchaseOrders: 'Search purchase orders...',
filterPurchaseOrders: 'Filter Purchase Orders',
noPurchaseOrdersFound: 'No purchase orders found',
noPurchaseOrdersAvailable: 'No purchase orders available',
addFirstPurchaseOrder: 'Add your first purchase order to get started',
failedToFetchPurchaseOrders: 'Failed to fetch purchase orders',
networkErrorFetchingPurchaseOrders: 'Network error while fetching purchase orders',

// Purchase Order Details
poDate: 'PO Date',
expectedDelivery: 'Expected Delivery',
supplierName: 'Supplier Name',
totalOrders: 'Total Orders',
approvedOrders: 'Approved Orders',
deliveredOrders: 'Delivered Orders',
cancelledOrders: 'Cancelled Orders',
allPurchaseOrders: 'All Purchase Orders',

// PO Status (some already exist, adding missing ones)
delivered: 'Delivered',
cancelled: 'Cancelled',
shipped: 'Shipped',
processing: 'Processing',

// Additional missing keys I used
loadingData: 'Loading data...',




selectExpectedDeliveryDate: 'Select expected delivery date',
purchaseOrderInformation: 'Purchase Order Information',
supplierInformation: 'Supplier Information',
orderItems: 'Order Items',
addPOItem: 'Add Item',
orderQuantity: 'Order Quantity',
unitCost: 'Unit Cost',
selectSupplierPlaceholder: 'Select a supplier',
addItemsToPurchaseOrder: 'Add items to purchase order',
financialDetails: 'Financial Details',
taxAmount: 'Tax Amount',
shippingCost: 'Shipping Cost',
createPurchaseOrder: 'Create Purchase Order',
contactPerson: 'Contact Person',
supplierType: 'Supplier Type',


purchaseOrder: 'Purchase Order',
purchaseOrderSystem: 'Purchase Order System',
purchaseOrderDetails: 'Purchase Order Details',
purchaseOrderActions: 'Purchase Order Actions',
failedToFetchOrderDetails: 'Failed to fetch order details',
itemsSubtotal: 'Items Subtotal',
itemName: 'Item Name',
editPurchaseOrder: 'Edit Purchase Order',
status: 'Status',


supplierNameRequired: 'Supplier name is required',
enterSupplierName: 'Enter supplier name',
updatePurchaseOrder: 'Update Purchase Order',


// Payment Entry Management
paymentEntries: 'Payment Entries',
entriesTotal: 'entries total',
balance: 'Balance',
addPaymentEntry: 'Add Payment Entry',
editPaymentEntry: 'Edit Payment Entry',
deletePaymentEntry: 'Delete Payment Entry',
deletePaymentEntryConfirmation: 'Are you sure you want to delete this payment entry?',
paymentEntryDeletedSuccessfully: 'Payment entry deleted successfully',
failedToDeletePaymentEntry: 'Failed to delete payment entry',
networkErrorDeletingPaymentEntry: 'Network error while deleting payment entry',
loadingPaymentEntries: 'Loading payment entries...',
searchPaymentEntries: 'Search payment entries...',
filterPaymentEntries: 'Filter Payment Entries',
noPaymentEntriesFound: 'No payment entries found',
noPaymentEntriesAvailable: 'No payment entries available',
addFirstPaymentEntry: 'Add your first payment entry to get started',
failedToFetchPaymentEntries: 'Failed to fetch payment entries',
networkErrorFetchingPaymentEntries: 'Network error while fetching payment entries',

// Payment Types
sales_invoice: 'Sales Invoice',
purchase_invoice: 'Purchase Invoice',
expense: 'Expense',
credit: 'Credit',
debit: 'Debit',
allPayments: 'All Payments',
creditPayments: 'Credit Payments',
debitPayments: 'Debit Payments',

// Credit Notes
creditNotes: 'Credit Notes',
actualAmount: 'Actual Amount',
loadingCreditNotes: 'Loading credit notes...',
noCreditNotesAvailable: 'No credit notes available',
availableCreditNotes: 'Available Credit Notes',
returnInvoice: 'Return Invoice',
remainingAmount: 'Remaining Amount',
amountToUse: 'Amount to Use',
totalCreditApplied: 'Total Credit Applied',
createCreditNotesFirst: 'Create credit notes first',
appliedCreditNotes: 'Applied Credit Notes',
creditNote: 'Credit Note',
creditNoteAmountMustBePositive: 'Credit note amount must be positive',
creditNoteAmountExceedsRemaining: 'Credit note amount cannot exceed remaining amount',

// Payment Details
paymentDate: 'Payment Date',
transactionRef: 'Transaction Reference',
recordedBy: 'Recorded By',
totalEntries: 'Total Entries',
totalCredits: 'Total Credits',
totalDebits: 'Total Debits',


// Payment Entry Form
transactionType: 'Transaction Type',
selectBank: 'Select Bank',
selectBankPlaceholder: 'Select a bank account',
referenceInformation: 'Reference Information',
paymentType: 'Payment Type',
selectReference: 'Select Reference',
selectReferencePlaceholder: 'Select a reference',
noReferencesAvailable: 'No references available',
paymentDetails: 'Payment Details',
enterAmount: 'Enter amount',
enterTransactionReference: 'Enter transaction reference',
createPaymentEntry: 'Create Payment Entry',

// Validation
bankRequired: 'Bank is required',
referenceRequired: 'Reference is required',
paymentEntryCreatedSuccessfully: 'Payment entry created successfully!',
failedToCreatePaymentEntry: 'Failed to create payment entry',
networkErrorCreatingPaymentEntry: 'Network error while creating payment entry',

// Bank & Reference
noBanksAvailable: 'No banks available',
createReferencesFirst: 'Create sales invoices or expenses first',
customer: 'Customer',

// Payment Methods (if not already added)
cash: 'Cash',
banktransfer: 'Bank Transfer',
check: 'Check',
card: 'Card',

paymentEntrySystem: 'Payment Entry System',
entryId: 'Entry ID', 
paymentAmount: 'Payment Amount',
recordInformation: 'Record Information',
notSpecified: 'Not Specified',

entryInformation: 'Entry Information',
updatePaymentEntry: 'Update Payment Entry',
currentAmount: 'Current Amount',
paymentEntryUpdatedSuccessfully: 'Payment entry updated successfully!',
failedToUpdatePaymentEntry: 'Failed to update payment entry',
networkErrorUpdatingPaymentEntry: 'Network error while updating payment entry',

banks: 'Banks',
banksTotal: 'banks total',
addBank: 'Add Bank',
editBank: 'Edit Bank',
deleteBank: 'Delete Bank',
deleteBankConfirmation: 'Are you sure you want to delete this bank?',
bankDeletedSuccessfully: 'Bank deleted successfully',
failedToDeleteBank: 'Failed to delete bank',
networkErrorDeletingBank: 'Network error while deleting bank',
loadingBanks: 'Loading banks...',
searchBanks: 'Search banks...',
filterBanks: 'Filter Banks',
noBanksFound: 'No banks found',
noBanksAvailable: 'No banks available',
addFirstBank: 'Add your first bank to get started',
failedToFetchBanks: 'Failed to fetch banks',
networkErrorFetchingBanks: 'Network error while fetching banks',
totalBanks: 'Total Banks',
allBanks: 'All Banks',
activeBanks: 'Active Banks',
inactiveBanks: 'Inactive Banks',
accountNumber: 'Account Number',
branch: 'Branch',
iban: 'IBAN',
swiftCode: 'SWIFT Code',
active: 'Active',
inactive: 'Inactive',

reportsDashboard: 'Reports Dashboard',
businessAnalytics: 'Business Analytics',
salesReport: 'Sales Report',
customerReport: 'Customer Report',
inventoryStats: 'Inventory Stats',
financialSummary: 'Financial Summary',
setSalesTarget: 'Set Sales Target',
salesTargetReport: 'Sales Target Report',
recordVisit: 'Record Visit',
visitReport: 'Visit Report',
salesReports: 'Sales Reports',
customerReports: 'Customer Reports',
inventoryReports: 'Inventory Reports',
financialReports: 'Financial Reports',
salesTargets: 'Sales Targets',
customerVisits: 'Customer Visits',

 loadingSalesReport: 'Loading sales report...',
  failedToFetchSalesReport: 'Failed to fetch sales report',
  networkErrorFetchingSalesReport: 'Network error while fetching sales report',
  totalSales: 'Total Sales',
  totalProfit: 'Total Profit',
  numberOfInvoices: 'Number of Invoices',
  itemsSold: 'Items Sold',
  salesPerformance: 'Sales Performance',
  targetAchievement: 'Target Achievement',
  salesTarget: 'Sales Target',
  achieved: 'Achieved',
  topCustomers: 'Top Customers',
  paymentStatus: 'Payment Status',
  
  // Filters
  reportFilters: 'Report Filters',
  customizeYourReport: 'Customize Your Report',
  dateRange: 'Date Range',
  fromDate: 'From Date',
  toDate: 'To Date',
  selectDate: 'Select Date',
  dateRangeRequired: 'Date range is required',
  invalidDateRange: 'From date cannot be after to date',
  quickFilters: 'Quick Filters',
  thisMonth: 'This Month',
  lastMonth: 'Last Month',
  thisYear: 'This Year',
  selectStatus: 'Select Status',
  selectTerritory: 'Select Territory',
  allTerritories: 'All Territories',
  clearAll: 'Clear All',
  applyFilters: 'Apply Filters',
  
  // Customer Selector
  selectCustomer: 'Select Customer',
  customersAvailable: 'customers available',
  searchCustomers: 'Search customers...',
  customersFound: 'customers found',
  clearCustomerSelection: 'Clear Customer Selection',
  noCustomersFound: 'No customers found',
  noCustomersAvailable: 'No customers available',
  tryDifferentSearch: 'Try a different search term',
  addCustomersFirst: 'Add customers first to use this filter',
  loadingCustomers: 'Loading customers...',
  failedToFetchCustomers: 'Failed to fetch customers',
  networkErrorFetchingCustomers: 'Network error while fetching customers',
  customerSelected: 'Customer Selected',
  clearCustomer: 'Clear Customer',
  
  // Staff Selector
  selectStaff: 'Select Staff',
  staffMembersAvailable: 'staff members available',
  searchStaff: 'Search staff...',
  staffMembersFound: 'staff members found',
  clearStaffSelection: 'Clear Staff Selection',
  noStaffFound: 'No staff found',
  noStaffAvailable: 'No staff available',
  addStaffFirst: 'Add staff first to use this filter',
  loadingStaff: 'Loading staff...',
  failedToFetchStaff: 'Failed to fetch staff',
  networkErrorFetchingStaff: 'Network error while fetching staff',
  staffSelected: 'Staff Selected',
  clearStaff: 'Clear Staff',
  iqama: 'Iqama',
  joinedOn: 'Joined on',
  superadmin: 'Super Admin',
  admin: 'Admin',
  staff: 'Staff',
  
  // Chart labels
  sales: 'Sales',
  cost: 'Cost',
  profit: 'Profit',
  invoices: 'invoices',

    // Customer Report Translations
  customerReport: 'Customer Report',
  customerAnalytics: 'Customer Analytics',
  loadingCustomerReport: 'Loading customer report...',
  failedToFetchCustomerReport: 'Failed to fetch customer report',
  networkErrorFetchingCustomerReport: 'Network error while fetching customer report',
  pleaseSelectCustomer: 'Please select a customer first',
  selectCustomerToViewReport: 'Select a Customer to View Report',
  chooseCustomerFromList: 'Choose a customer from the list to view their detailed analytics',
  
  // Customer Report Stats
  totalOrders: 'Total Orders',
  totalVisits: 'Total Visits',
  customerPerformance: 'Customer Performance',
  targetAmount: 'Target Amount',
  remaining: 'Remaining',
  financialBreakdown: 'Financial Breakdown',
  totalRevenue: 'Total Revenue',
  totalCost: 'Total Cost',
  profitMargin: 'Profit Margin',
  totalLoss: 'Total Loss',
  orderStatus: 'Order Status',
  completed: 'Completed',
  revenue: 'Revenue',
  
  // Customer Report Filters
  customerReportFilters: 'Customer Report Filters',
  customizeReportPeriod: 'Customize Report Period',
  selectedCustomer: 'Selected Customer',
  customDateRange: 'Custom Date Range',
  resetToCurrentMonth: 'Reset to Current Month',
  change: 'Change',
  
  // Additional Common Translations
  adjustDateRangeOrTryAgain: 'Adjust the date range or try again later',
  noDataAvailable: 'No Data Available',
    // Inventory Report Translations
  inventoryReport: 'Inventory Report',
  loadingInventoryReport: 'Loading inventory report...',
  failedToFetchInventoryReport: 'Failed to fetch inventory report',
  networkErrorFetchingInventoryReport: 'Network error while fetching inventory report',
  itemsTracked: 'items tracked',
  noInventoryData: 'No Inventory Data',
  adjustFiltersOrAddItems: 'Adjust filters or add items to your inventory',
  
  // Inventory Stats
  totalItems: 'Total Items',
  totalValue: 'Total Value',
  lowStockItems: 'Low Stock Items',
  reorderNeeded: 'Reorder Needed',
  topItemsByValue: 'Top Items by Value',
  stockStatusOverview: 'Stock Status Overview',
  normalStock: 'Normal Stock',
  lowStock: 'Low Stock',
  inventoryItems: 'Inventory Items',
  
  // Item Details
  itemId: 'Item ID',
  currentStock: 'Current Stock',
  inventoryValue: 'Inventory Value',
  availableQty: 'Available Qty',
  soldQty: 'Sold Qty',
  reorderRecommended: 'Reorder Recommended',
  
  // Inventory Filters
  inventoryFilters: 'Inventory Filters',
  customizeInventoryReport: 'Customize Inventory Report',
  lowStockThreshold: 'Low Stock Threshold',
  thresholdDescription: 'Items with stock below this level will be marked as low stock',
  units: 'units',
  quickThresholds: 'Quick Thresholds',
  itemFilter: 'Item Filter',
  allItems: 'All Items',
  specificItemSelected: 'Specific Item Selected',
  clearItemFilter: 'Clear Item Filter',
  itemFilterNote: 'Leave empty to include all items, or select a specific item to focus on',
  filterSummary: 'Filter Summary',
  itemScope: 'Item Scope',
  specificItem: 'Specific Item',
  resetToDefault: 'Reset to Default',
  validThresholdRequired: 'Please enter a valid threshold value',
  items: 'items',


   // Financial Summary Report Translations
  financialSummary: 'Financial Summary',
  loadingFinancialSummary: 'Loading financial summary...',
  failedToFetchFinancialSummary: 'Failed to fetch financial summary',
  networkErrorFetchingFinancialSummary: 'Network error while fetching financial summary',
  comprehensiveFinancialOverview: 'Comprehensive Financial Overview',
  noFinancialData: 'No Financial Data',
  
  // Financial Overview Cards
  totalIncome: 'Total Income',
  totalExpenses: 'Total Expenses',
  netProfitLoss: 'Net Profit/Loss',
  totalPurchases: 'Total Purchases',
  
  // Charts and Analysis
  cashFlowAnalysis: 'Cash Flow Analysis',
  profitLossBreakdown: 'Profit/Loss Breakdown',
  productBasedProfit: 'Product Based Profit',
  outstandingAmounts: 'Outstanding Amounts',
  receivables: 'Receivables',
  payables: 'Payables',
  pendingTransactions: 'Pending Transactions',
  pendingIncome: 'Pending Income',
  pendingPurchases: 'Pending Purchases',
  
  // Chart Labels
  income: 'Income',
  expenses: 'Expenses',
  purchases: 'Purchases',
  spent: 'Spent',
  
  // Financial Filters
  financialFilters: 'Financial Filters',
  selectDateRange: 'Select Date Range',
  customDateRange: 'Custom Date Range',


  error: 'Error',
  authTokenNotFound: 'Authentication token not found',
  dateRangeRequired: 'Please select both from and to dates',
  invalidDateRange: 'From date cannot be later than to date',
  failedToFetchVisitHistory: 'Failed to fetch visit history',
  networkErrorFetchingVisitHistory: 'Network error while fetching visit history',
  failedToGetLocation: 'Failed to get current location',
  locationPermissionDenied: 'Location permission denied',
  selectCustomerAndLocation: 'Please select customer and ensure location is available',
  failedToVerifyLocation: 'Failed to verify location',
  networkErrorVerifyingLocation: 'Network error while verifying location',
  verifyLocationFirst: 'Please verify location first',
  purposeRequired: 'Purpose is required',
  failedToCheckin: 'Failed to submit check-in',
  networkErrorCheckin: 'Network error while submitting check-in',
  locationError: 'Location Error',
  youAreNotInCustomerRadius: 'You are not within the customer location radius',

  // Success messages
  success: 'Success',
  locationVerifiedSuccess: 'Location verified successfully',
  checkinSuccessful: 'Check-in submitted successfully',

  // General actions
  ok: 'OK',
  cancel: 'Cancel',
  tryAgain: 'Try Again',
  
  // Date and time filters
  quickFilters: 'Quick Filters',
  customDateRange: 'Custom Date Range',
  dateRange: 'Date Range',
  fromDate: 'From Date',
  toDate: 'To Date',
  selectDate: 'Select Date',
  selectDatePeriod: 'Select date period for filtering',
  today: 'Today',
  yesterday: 'Yesterday',
  thisWeek: 'This Week',
  thisMonth: 'This Month',
  resetToCurrentMonth: 'Reset to Current Month',
  applyFilters: 'Apply Filters',

  // Visit history
  visitHistory: 'Visit History',
  visitFilters: 'Visit Filters',
  allStaff: 'All Staff',
  allCustomers: 'All Customers',
  allStaffVisits: 'All staff visits and activities',
  yourVisitHistory: 'Your visit history and records',
  loadingVisitHistory: 'Loading visit history...',
  noVisitHistory: 'No visit history found',
  adjustFiltersOrStartVisiting: 'Try adjusting filters or start visiting customers',

  // Visit details
  checkinTime: 'Check-in Time',
  checkoutTime: 'Check-out Time',
  purpose: 'Purpose',
  notes: 'Notes',
  
  // Statistics
  totalVisits: 'Total Visits',
  completedVisits: 'Completed',
  avgDuration: 'Avg Duration',
  minutes: 'min',
  distance: 'Distance',

  // Check-in process
  staffCheckin: 'Staff Check-in',
  recordYourVisit: 'Record your customer visit',
  selectCustomer: 'Select Customer',
  tapToSelectCustomer: 'Tap to select customer',
  checkinDetails: 'Check-in Details',
  checkinType: 'Check-in Type',
  arrival: 'Arrival',
  departure: 'Departure',
  enterPurpose: 'Enter purpose of visit',
  enterNotes: 'Enter additional notes (optional)',
  submitCheckin: 'Submit Check-in',

  // Location verification
  locationVerification: 'Location Verification',
  locationObtained: 'Location obtained',
  locationNotAvailable: 'Location not available',
  refreshLocation: 'Refresh Location',
  locationVerified: 'Location verified',
  locationNotVerified: 'Location not verified',
  verifyLocation: 'Verify Location',

   // Set Sales Target Screen
   setSalesTarget: 'Set Sales Target',
  defineTargetsForPeriod: 'Define targets for specific period',
  targetConfiguration: 'Target Configuration',
  targetPeriod: 'Target Period',
  targetType: 'Target Type',
  targetDate: 'Target Date',
  targetAmount: 'Target Amount',
  targetAssignment: 'Target Assignment',
  
  // Target periods
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  yearly: 'Yearly',
  
  // Target types
  revenue: 'Revenue',
  visits: 'Visits',
  orders: 'Orders',
  
  // Form fields
  assignToStaff: 'Assign to Staff',
  selectStaff: 'Select Staff',
  specificCustomer: 'Specific Customer',
  selectCustomer: 'Select Customer',
  territory: 'Territory',
  selectTerritory: 'Select Territory',
  optional: 'Optional',
  enterTargetAmount: 'Enter target amount',
  
  // Validation messages
  targetAmountRequired: 'Target amount is required',
  targetAmountMustBePositive: 'Target amount must be positive',
  staffSelectionRequired: 'Staff selection is required',
  salesTargetSetSuccessfully: 'Sales target set successfully',
  failedToSetSalesTarget: 'Failed to set sales target',
  networkErrorSettingTarget: 'Network error while setting target',

  // Sales Performance Screen
  salesPerformance: 'Sales Performance',
  teamPerformanceAndTargets: 'Team performance and targets overview',
  yourPerformanceAndTargets: 'Your performance and targets',
  loadingSalesData: 'Loading sales data...',
  
  // Tabs
  dashboard: 'Dashboard',
  targets: 'Targets',
  target: 'Target',
  
  // Dashboard Metrics
  performanceStatus: 'Performance Status',
  targetProgress: 'Target Progress',
  achievementBreakdown: 'Achievement Breakdown',
  
  // Status types
  ahead: 'Ahead of Target',
  on_track: 'On Track',
  behind: 'Behind Target',
  
  // Performance metrics
  targetAmount: 'Target Amount',
  achievedAmount: 'Achieved Amount',
  remainingAmount: 'Remaining Amount',
  daysLeft: 'Days Left',
  dailyTargetNeeded: 'Daily Target Needed',
  day: 'Day',
  comparisonWithLastPeriod: 'Comparison with Last Period',
  achieved: 'Achieved',
  remaining: 'Remaining',
  
  // Empty states
  noPerformanceData: 'No performance data found',
  adjustFiltersToViewData: 'Adjust filters to view performance data',
  noSalesTargets: 'No sales targets found',
  noTargetsForPeriod: 'No targets set for this period',
  
  // Target details
  setBy: 'Set By',
  createdOn: 'Created On',
  customer: 'Customer',
  
  // Error messages
  failedToFetchPerformance: 'Failed to fetch performance data',
  networkErrorFetchingPerformance: 'Network error while fetching performance',
  failedToFetchTargets: 'Failed to fetch sales targets',
  networkErrorFetchingTargets: 'Network error while fetching targets',


    // Staff Management Screen
  staffManagement: 'Staff Management',
  manageTeamMembers: 'Manage your team members',
  searchStaff: 'Search staff members...',
  totalStaff: 'Total Staff',
  activeStaff: 'Active',
  inactiveStaff: 'Inactive',
  loadingStaff: 'Loading staff...',
  
  // Staff Status
  active: 'Active',
  inactive: 'Inactive',
  suspended: 'Suspended',
  
  // Staff Details
  hiredOn: 'Hired on',
  salary: 'Salary',
  
  // Actions
  edit: 'Edit',
  delete: 'Delete',
  confirmDelete: 'Confirm Delete',
  confirmDeleteStaff: 'Are you sure you want to delete',
  
  // Empty States
  noStaffFound: 'No staff found',
  noStaffMembers: 'No staff members yet',
  tryDifferentSearch: 'Try a different search term',
  addFirstStaffMember: 'Add your first team member',
  
  // Add/Edit Staff Screen
  addStaff: 'Add Staff',
  editStaff: 'Edit Staff',
  updateStaffDetails: 'Update staff member details',
  addNewTeamMember: 'Add a new team member',
  updateStaff: 'Update Staff',
  
  // Form Sections
  basicInformation: 'Basic Information',
  jobInformation: 'Job Information',
  additionalInformation: 'Additional Information',
  
  // Form Fields
  fullName: 'Full Name',
  arabicName: 'Arabic Name',
  email: 'Email',
  phone: 'Phone',
  position: 'Position',
  department: 'Department',
  hireDate: 'Hire Date',
  territoryAssigned: 'Territory Assigned',
  status: 'Status',
  address: 'Address',
  
  // Form Placeholders
  enterFullName: 'Enter full name',
  enterArabicName: 'Enter Arabic name',
  enterEmail: 'Enter email address',
  enterPhone: 'Enter phone number',
  enterPosition: 'Enter job position',
  enterDepartment: 'Enter department',
  enterSalary: 'Enter salary amount',
  enterTerritory: 'Enter assigned territory',
  enterAddress: 'Enter address',
  
  // Validation Messages
  nameRequired: 'Name is required',
  emailRequired: 'Email is required',
  invalidEmail: 'Please enter a valid email',
  phoneRequired: 'Phone number is required',
  positionRequired: 'Position is required',
  departmentRequired: 'Department is required',
  salaryRequired: 'Salary is required',
  invalidSalary: 'Please enter a valid salary amount',
  pleaseFillRequiredFields: 'Please fill in all required fields',
  
  // Success Messages
  staffAddedSuccessfully: 'Staff member added successfully',
  staffUpdatedSuccessfully: 'Staff member updated successfully',
  staffDeletedSuccessfully: 'Staff member deleted successfully',
  
  // Error Messages
  failedToFetchStaff: 'Failed to fetch staff members',
  networkErrorFetchingStaff: 'Network error while fetching staff',
  failedToAddStaff: 'Failed to add staff member',
  networkErrorAddingStaff: 'Network error while adding staff',
  failedToUpdateStaff: 'Failed to update staff member',
  networkErrorUpdatingStaff: 'Network error while updating staff',
  failedToDeleteStaff: 'Failed to delete staff member',
  networkErrorDeletingStaff: 'Network error while deleting staff',
  // User Management Screen
  userManagement: 'User Management',
  manageSystemUsers: 'Manage system users and roles',
  searchUsers: 'Search users...',
  totalUsers: 'Total Users',
  adminUsers: 'Admins',
  staffUsers: 'Staff',
  loadingUsers: 'Loading users...',
  
  // User Roles
  superadmin: 'Super Admin',
  admin: 'Admin',
  staff: 'Staff',
  
  // User Details
  iqamaNo: 'Iqama No',
  dateOfBirth: 'Date of Birth',
  registeredOn: 'Registered on',
  currentUser: 'Current User',
  
  // Actions
  edit: 'Edit',
  delete: 'Delete',
  confirmDelete: 'Confirm Delete',
  confirmDeleteUser: 'Are you sure you want to delete',
  cannotDeleteOwnAccount: 'You cannot delete your own account',
  
  // Empty States
  noUsersFound: 'No users found',
  noUsers: 'No users yet',
  tryDifferentSearch: 'Try a different search term',
  addFirstUser: 'Add your first system user',
  
  // Add/Edit User Screen
  addUser: 'Add User',
  editUser: 'Edit User',
  updateUserDetails: 'Update user details',
  addNewSystemUser: 'Add a new system user',
  updateUser: 'Update User',
  
  // Form Sections
  personalInformation: 'Personal Information',
  systemAccess: 'System Access',
  
  // Form Fields
  firstName: 'First Name',
  lastName: 'Last Name',
  email: 'Email',
  iqamaNumber: 'Iqama Number',
  userRole: 'User Role',
  password: 'Password',
  confirmPassword: 'Confirm Password',
  
  // Form Placeholders
  enterFirstName: 'Enter first name',
  enterLastName: 'Enter last name',
  enterEmail: 'Enter email address',
  enterIqamaNumber: 'Enter Iqama number',
  enterPassword: 'Enter password',
  confirmYourPassword: 'Confirm your password',
  leaveBlankToKeepCurrent: 'Leave blank to keep current password',
  
  // Password Requirements
  passwordRequirements: 'Password Requirements',
  minEightCharacters: 'Minimum 8 characters',
  passwordsMustMatch: 'Passwords must match',
  
  // Validation Messages
  firstNameRequired: 'First name is required',
  lastNameRequired: 'Last name is required',
  emailRequired: 'Email is required',
  invalidEmail: 'Please enter a valid email',
  iqamaRequired: 'Iqama number is required',
  passwordRequired: 'Password is required',
  passwordTooShort: 'Password must be at least 8 characters',
  confirmPasswordRequired: 'Please confirm your password',
  passwordsDoNotMatch: 'Passwords do not match',
  pleaseFillRequiredFields: 'Please fill in all required fields',
  
  // Success Messages
  userAddedSuccessfully: 'User added successfully',
  userUpdatedSuccessfully: 'User updated successfully',
  userDeletedSuccessfully: 'User deleted successfully',
  
  // Error Messages
  failedToFetchUsers: 'Failed to fetch users',
  networkErrorFetchingUsers: 'Network error while fetching users',
  failedToAddUser: 'Failed to add user',
  networkErrorAddingUser: 'Network error while adding user',
  failedToUpdateUser: 'Failed to update user',
  networkErrorUpdatingUser: 'Network error while updating user',
  failedToDeleteUser: 'Failed to delete user',
  networkErrorDeletingUser: 'Network error while deleting user',
    // Settings Screen
  settings: 'Settings',
  manageYourPreferences: 'Manage your app preferences',
  
  // User Profile
  user: 'User',
  
  // Section Titles
  legal: 'Legal',
  support: 'Support',
  account: 'Account',
  
  // Menu Items
  termsAndConditions: 'Terms and Conditions',
  privacyPolicy: 'Privacy Policy',
  help: 'Help',
  aboutUs: 'About Us',
  logout: 'Logout',
  
  // Email Help
  helpRequest: 'Help Request - Dory Sales App',
  pleaseDescribeYourIssue: 'Please describe your issue or question here...',
  contactUs: 'Contact Us',
  pleaseContactUs: 'Please contact us at:',
  
  // Logout Confirmation
  confirmLogout: 'Confirm Logout',
  areYouSureLogout: 'Are you sure you want to logout?',
  cancel: 'Cancel',
  
  // App Info
  appVersion: 'App Version',
  
  // Success Messages
  ok: 'OK',
  
  // Error Messages
  error: 'Error',
  cannotOpenLink: 'Cannot open this link',
  failedToOpenLink: 'Failed to open link',
  failedToOpenEmail: 'Failed to open email client',
  logoutFailed: 'Logout failed. Please try again.',



  // Purchase Invoice Management
'purchaseInvoices': 'Purchase Invoices',
'addPurchaseInvoice': 'Add Purchase Invoice',
'editPurchaseInvoice': 'Edit Purchase Invoice',
'createPurchaseInvoice': 'Create Purchase Invoice',
'updatePurchaseInvoice': 'Update Purchase Invoice',
'deletePurchaseInvoice': 'Delete Purchase Invoice',
'confirmDeletePurchaseInvoice': 'Are you sure you want to delete this purchase invoice?',
'purchaseInvoiceCreatedSuccessfully': 'Purchase invoice created successfully!',
'purchaseInvoiceUpdatedSuccessfully': 'Purchase invoice updated successfully!',
'purchaseInvoiceDeletedSuccessfully': 'Purchase invoice deleted successfully!',
'failedToCreatePurchaseInvoice': 'Failed to create purchase invoice',
'failedToUpdatePurchaseInvoice': 'Failed to update purchase invoice',
'failedToDeletePurchaseInvoice': 'Failed to delete purchase invoice',
'failedToFetchPurchaseInvoices': 'Failed to fetch purchase invoices',
'networkErrorCreatingPurchaseInvoice': 'Network error while creating purchase invoice',
'networkErrorUpdatingPurchaseInvoice': 'Network error while updating purchase invoice',
'networkErrorDeletingPurchaseInvoice': 'Network error while deleting purchase invoice',
'networkErrorFetchingPurchaseInvoices': 'Network error while fetching purchase invoices',
'loadingPurchaseInvoices': 'Loading purchase invoices...',
'searchPurchaseInvoices': 'Search purchase invoices...',
'noPurchaseInvoicesFound': 'No purchase invoices found',
'noPurchaseInvoicesAvailable': 'No purchase invoices available',
'addFirstPurchaseInvoice': 'Add your first purchase invoice to get started',

// Form Fields
'purchaseOrderInformation': 'Purchase Order Information',
'selectPurchaseOrder': 'Select Purchase Order',
'selectPOPlaceholder': 'Select a purchase order',
'selectSupplier': 'Select Supplier',
'selectSupplierPlaceholder': 'Choose a supplier',
'selectInventory': 'Select Inventory',
'selectInventoryPlaceholder': 'Choose an inventory item',
'invoiceInformation': 'Invoice Information',
'invoiceDate': 'Invoice Date',
'dueDate': 'Due Date',
'selectDueDate': 'Select due date',
'invoiceItems': 'Invoice Items',
'addItem': 'Add Item',
'totalPrice': 'Total Price',
'noItemsAdded': 'No items added',
'addItemsToInvoice': 'Add items to create the invoice',
'financialDetails': 'Financial Details',
'taxPercentage': 'Tax Percentage',
'discountPercentage': 'Discount Percentage',
'calculatedTotals': 'Calculated Totals',
'subtotal': 'Subtotal',
'taxAmount': 'Tax Amount',
'discountAmount': 'Discount Amount',
'totalAmount': 'Total Amount',
'paymentInformation': 'Payment Information',
'paymentStatus': 'Payment Status',
'paymentMethod': 'Payment Method',
'pending': 'Pending',
'paid': 'Paid',
'overdue': 'Overdue',
'banktransfer': 'Bank Transfer',
'cash': 'Cash',
'card': 'Card',
'check': 'Check',
'notes': 'Notes',
'enterNotes': 'Enter notes...',

// Suppliers & Inventory
'supplier': 'Supplier',
'suppliers': 'Suppliers',
'contact': 'Contact',
'noSuppliersAvailable': 'No suppliers available',
'inventory': 'Inventory',
'noInventoryAvailable': 'No inventory available',

// Validation
'supplierRequired': 'Supplier selection is required',
'poNumberRequired': 'PO number is required',
'dueDateRequired': 'Due date is required',
'itemsRequired': 'At least one item is required',

// List View
'invoices': 'invoices',
'total': 'Total',
'paidAmount': 'Paid Amount',
'pendingAmount': 'Pending Amount',
'items': 'Items',
'moreItems': 'more items',
'createdBy': 'Created by',
'noDate': 'No date',

// General
'optional': 'Optional',
'item': 'Item',
'quantity': 'Quantity',
'unitPrice': 'Unit Price',
'price': 'Price',
'stock': 'Stock',
'cost': 'Cost',
'selectItem': 'Select Item',
'noItemsAvailable': 'No items available',
'loadingData': 'Loading data...',
'tryAdjustingSearch': 'Try adjusting your search terms',

  "salesTarget": "Sales Target",
  "revenueTarget": "Revenue Target", 
  "visitsTarget": "Visits Target",

  },
  ar: {
    // App General
    appName: 'كوكب دوري',
    appNameArabic: 'كوكب دوري',
    loading: 'جاري التحميل...',
    error: 'خطأ',
    success: 'نجح',
    ok: 'موافق',
    cancel: 'إلغاء',
    save: 'حفظ',
    delete: 'حذف',
    edit: 'تعديل',
    add: 'إضافة',
    search: 'بحث',
    filter: 'تصفية',
    refresh: 'تحديث',
    back: 'رجوع',
    next: 'التالي',
    previous: 'السابق',
    submit: 'إرسال',
    close: 'إغلاق',
    confirm: 'تأكيد',
    yes: 'نعم',
    no: 'لا',

    // Language Selection
    selectLanguage: 'اختر اللغة',
    english: 'English',
    arabic: 'العربية',
    languageChanged: 'تم تغيير اللغة بنجاح',

    // Authentication
    login: 'تسجيل الدخول',
    register: 'تسجيل',
    logout: 'تسجيل الخروج',
    forgotPassword: 'نسيت كلمة المرور؟',
    resetPassword: 'إعادة تعيين كلمة المرور',
    createAccount: 'إنشاء حساب جديد',
    alreadyHaveAccount: 'لديك حساب بالفعل؟',
    dontHaveAccount: 'لا تملك حساباً؟',
    rememberMe: 'تذكرني',
    useBiometricLogin: 'استخدم المصادقة البيومترية',
    welcomeBack: 'مرحباً بعودتك! يرجى تسجيل الدخول للمتابعة',

    // Registration Form
    firstName: 'الاسم الأول',
    lastName: 'اسم العائلة',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    confirmPassword: 'تأكيد كلمة المرور',
    iqamaNumber: 'رقم الإقامة',
    dateOfBirth: 'تاريخ الميلاد',
    role: 'الدور الوظيفي',
    phoneNumber: 'رقم الهاتف',

    // Placeholders
    enterFirstName: 'أدخل الاسم الأول',
    enterLastName: 'أدخل اسم العائلة',
    enterEmail: 'أدخل البريد الإلكتروني',
    enterPassword: 'أدخل كلمة المرور',
    reenterPassword: 'أعد إدخال كلمة المرور',
    enterIqama: 'أدخل رقم الإقامة (10 أرقام)',
    enterPhone: 'أدخل رقم الهاتف',

    // Roles
    admin: 'مدير',
    warehouseManager: 'مدير المستودع',
    salesRepresentative: 'مندوب مبيعات',

    // Validation Messages
    required: 'هذا الحقل مطلوب',
    firstNameRequired: 'الاسم الأول مطلوب',
    lastNameRequired: 'اسم العائلة مطلوب',
    emailRequired: 'البريد الإلكتروني مطلوب',
    passwordRequired: 'كلمة المرور مطلوبة',
    iqamaRequired: 'رقم الإقامة مطلوب',
    phoneRequired: 'رقم الهاتف مطلوب',
    invalidEmail: 'البريد الإلكتروني غير صحيح',
    invalidIqama: 'رقم الإقامة يجب أن يكون 10 أرقام',
    invalidPhone: 'تنسيق رقم الهاتف غير صحيح',
    passwordMinLength: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
    passwordsNotMatch: 'كلمات المرور غير متطابقة',

    // Success Messages
    registrationSuccessful: 'نجح التسجيل',
    accountCreated: 'تم إنشاء الحساب بنجاح',
    loginSuccessful: 'نجح تسجيل الدخول',
    profileUpdated: 'تم تحديث الملف الشخصي بنجاح',
    passwordReset: 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني',

    // Error Messages
    registrationError: 'خطأ في التسجيل',
    loginError: 'خطأ في تسجيل الدخول',
    connectionError: 'خطأ في الاتصال',
    networkError: 'تحقق من اتصال الإنترنت',
    serverError: 'حدث خطأ في الخادم',
    unauthorizedError: 'وصول غير مصرح',
    emailAlreadyTaken: 'البريد الإلكتروني مستخدم بالفعل',
    invalidCredentials: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',

    // Dashboard
    dashboard: 'لوحة التحكم',
    todaySales: 'مبيعات اليوم',
    monthlySales: 'المبيعات الشهرية',
    totalCustomers: 'إجمالي العملاء',
    pendingOrders: 'الطلبات المعلقة',
    lowStock: 'المنتجات قليلة المخزون',
    recentActivities: 'الأنشطة الأخيرة',

    // Customers
    customers: 'العملاء',
    customer: 'عميل',
    customerName: 'اسم العميل',
    customerDetails: 'تفاصيل العميل',
    addCustomer: 'إضافة عميل',
    editCustomer: 'تعديل عميل',
    deleteCustomer: 'حذف عميل',
    customerCreated: 'تم إنشاء العميل بنجاح',
    customerUpdated: 'تم تحديث العميل بنجاح',
    customerDeleted: 'تم حذف العميل بنجاح',
    noCustomers: 'لا يوجد عملاء',

    // Products
    products: 'المنتجات',
    product: 'منتج',
    productName: 'اسم المنتج',
    productDetails: 'تفاصيل المنتج',
    price: 'السعر',
    quantity: 'الكمية',
    stock: 'المخزون',
    category: 'الفئة',
    description: 'الوصف',

    // Sales
    sales: 'المبيعات',
    sale: 'مبيعة',
    createSale: 'إنشاء مبيعة',
    saleAmount: 'مبلغ البيع',
    saleDate: 'تاريخ البيع',
    invoice: 'فاتورة',
    invoiceNumber: 'رقم الفاتورة',
    total: 'المجموع',
    subtotal: 'المجموع الفرعي',
    tax: 'الضريبة',
    discount: 'الخصم',
    grandTotal: 'المجموع الإجمالي',

    // Navigation
    home: 'الرئيسية',
    profile: 'الملف الشخصي',
    settings: 'الإعدادات',
    reports: 'التقارير',
    inventory: 'المخزون',
    visits: 'الزيارات',

    // Settings
    changeLanguage: 'تغيير اللغة',
    changePassword: 'تغيير كلمة المرور',
    notifications: 'الإشعارات',
    about: 'حول',
    version: 'الإصدار',
    privacyPolicy: 'سياسة الخصوصية',
    termsOfService: 'شروط الخدمة',

    // Common Business Terms
    vat: 'ضريبة القيمة المضافة',
    vatNumber: 'الرقم الضريبي',
    customerNumber: 'رقم العميل',
    poNumber: 'رقم أمر الشراء',
    issueDate: 'تاريخ الإصدار',
    dueDate: 'تاريخ الاستحقاق',
    balanceDue: 'الرصيد المستحق',
    receivedBy: 'استلم بواسطة',
    authorizedSignature: 'التوقيع المخول',

    
    // Bottom Nav:
insights: 'الإحصائيات',

//Auth stack language settere
actions: 'الإجراءات',selectLanguage: 'اختر اللغة',
choosePreferred: 'اختر لغتك المفضلة',
continue: 'متابعة',

// Permission Management
assigned: 'المخصصة',
all: 'الكل',

//Action Screen

items: 'العناصر',
inventory: 'المخزون',
categories: 'الفئات',
customers: 'العملاء',
staff: 'الموظفين',
suppliers: 'الموردين',
'sales invoice': 'فاتورة مبيعات',
'purchase orders': 'أوامر الشراء',
expenses: 'المصروفات',
payments: 'المدفوعات',
reports: 'التقارير',
territories: 'المناطق',
quotations: 'عروض الأسعار',
returns: 'المرتجعات',
corebusiness: 'الأعمال الأساسية',
peoplemanagement: 'إدارة الأشخاص',
financial: 'المالية',
operations: 'العمليات',


// Sales Invoice Management
salesInvoices: 'فواتير المبيعات',
invoicesTotal: 'إجمالي الفواتير',
addInvoice: 'إضافة فاتورة',
editInvoice: 'تعديل فاتورة',
deleteInvoice: 'حذف فاتورة',
deleteInvoiceConfirmation: 'هل أنت متأكد من حذف هذه الفاتورة؟',
invoiceDeletedSuccessfully: 'تم حذف الفاتورة بنجاح',
failedToDeleteInvoice: 'فشل في حذف الفاتورة',
networkErrorDeletingInvoice: 'خطأ شبكة أثناء حذف الفاتورة',
loadingInvoices: 'جاري تحميل الفواتير...',
searchInvoices: 'البحث في الفواتير...',
filterInvoices: 'تصفية الفواتير',
noInvoicesFound: 'لم يتم العثور على فواتير',
noInvoicesAvailable: 'لا توجد فواتير متاحة',
tryAdjustingSearch: 'جرب تعديل مرشحات البحث',
addFirstInvoice: 'أضف فاتورتك الأولى للبدء',
failedToFetchInvoices: 'فشل في جلب الفواتير',
networkErrorFetchingInvoices: 'خطأ شبكة أثناء جلب الفواتير',
authTokenNotFound: 'لم يتم العثور على رمز المصادقة',

// Invoice Status
paid: 'مدفوعة',
pending: 'معلقة',
overdue: 'متأخرة',
allInvoices: 'جميع الفواتير',
paidInvoices: 'الفواتير المدفوعة',
pendingInvoices: 'الفواتير المعلقة',
overdueInvoices: 'الفواتير المتأخرة',

// Invoice Details
invoiceNumber: 'رقم الفاتورة',
invoiceDate: 'تاريخ الفاتورة',
dueDate: 'تاريخ الاستحقاق',
totalAmount: 'المبلغ الإجمالي',
paymentMethod: 'طريقة الدفع',
itemsCount: 'عدد العناصر',
notes: 'ملاحظات',
view: 'عرض',
totalInvoices: 'إجمالي الفواتير',

// Customer
customerName: 'اسم العميل',

// Invoice Details Screen
invoiceDetails: 'تفاصيل الفاتورة',
customerInformation: 'معلومات العميل',
invoiceItems: 'عناصر الفاتورة',
financialSummary: 'الملخص المالي',
paymentInformation: 'معلومات الدفع',
invoiceActions: 'إجراءات الفاتورة',
processing: 'جاري المعالجة',

// Customer Details
territory: 'المنطقة',
customerType: 'نوع العميل',
address: 'العنوان',

// Item Details
itemDescription: 'وصف العنصر',
itemCode: 'رمز العنصر',
unitPrice: 'سعر الوحدة',
costToCompany: 'Cost to Company',

// Actions
print: 'طباعة',
sharePDF: 'مشاركة PDF',
shareText: 'مشاركة نص',
editInvoice: 'تعديل الفاتورة',
share: 'مشاركة',

// Invoice Template
salesInvoiceSystem: 'نظام فواتير المبيعات',
generatedOn: 'تم الإنشاء في',
generatedBy: 'تم الإنشاء بواسطة',
createdBy: 'أنشأ بواسطة',

// Messages
failedToFetchInvoiceDetails: 'فشل في جلب تفاصيل الفاتورة',
networkErrorFetchingDetails: 'خطأ شبكة أثناء جلب التفاصيل',
printError: 'فشل في طباعة الفاتورة',
shareError: 'فشل في مشاركة الفاتورة',
sharingNotAvailable: 'المشاركة غير متاحة على هذا الجهاز',

// General
info: 'معلومات',
items: 'العناصر',
qty: 'الكمية',


// Expense Management
expenseManagement: 'إدارة المصروفات',
expensesTotal: 'إجمالي المصروفات',
addExpense: 'إضافة مصروف',
editExpense: 'تعديل مصروف',
deleteExpense: 'حذف مصروف',
deleteExpenseConfirmation: 'هل أنت متأكد من حذف هذا المصروف؟',
expenseDeletedSuccessfully: 'تم حذف المصروف بنجاح',
failedToDeleteExpense: 'فشل في حذف المصروف',
networkErrorDeletingExpense: 'خطأ شبكة أثناء حذف المصروف',
loadingExpenses: 'جاري تحميل المصروفات...',
searchExpenses: 'البحث في المصروفات...',
filterExpenses: 'تصفية المصروفات',
noExpensesFound: 'لم يتم العثور على مصروفات',
noExpensesAvailable: 'لا توجد مصروفات متاحة',
addFirstExpense: 'أضف مصروفك الأول للبدء',
failedToFetchExpenses: 'فشل في جلب المصروفات',
networkErrorFetchingExpenses: 'خطأ شبكة أثناء جلب المصروفات',

// Expense Status
approved: 'موافق عليه',
pending: 'معلق',
rejected: 'مرفوض',
allExpenses: 'جميع المصروفات',
approvedExpenses: 'المصروفات الموافق عليها',
pendingExpenses: 'المصروفات المعلقة',
rejectedExpenses: 'المصروفات المرفوضة',
totalExpenses: 'إجمالي المصروفات',

// Expense Form
expenseInformation: 'معلومات المصروف',
assignmentDetails: 'تفاصيل التخصيص',
expenseDate: 'تاريخ المصروف',
category: 'الفئة',
description: 'الوصف',
amount: 'المبلغ',
assignToStaff: 'تخصيص للموظف',
vendor: 'المورد',
department: 'القسم',
receiptImage: 'صورة الإيصال',
enterExpenseDescription: 'أدخل وصف المصروف',
enterDepartment: 'أدخل القسم',
selectStaffMember: 'اختر عضو فريق',
selectVendor: 'اختر مورد',
addReceiptImage: 'إضافة صورة إيصال',
tapToSelectOrTakePhoto: 'اضغط للاختيار من المعرض أو التقاط صورة',
viewReceipt: 'عرض الإيصال',

// Image Actions
selectReceiptImage: 'اختر صورة الإيصال',
chooseImageSource: 'اختر مصدر الصورة',
takePhoto: 'التقاط صورة',
chooseFromGallery: 'اختيار من المعرض',
permissionRequired: 'إذن مطلوب',
cameraPermission: 'نحتاج إذن الكاميرا لالتقاط الصور',
cameraRollPermission: 'نحتاج إذن المعرض لاختيار الصور',
failedToSelectImage: 'فشل في اختيار الصورة',
failedToTakePhoto: 'فشل في التقاط الصورة',

// Categories
officesupplies: 'مستلزمات المكتب',
traveltransportation: 'السفر والنقل',
mealsentertainment: 'الوجبات والترفيه',
equipment: 'المعدات',
softwaresubscriptions: 'البرامج والاشتراكات',
marketing: 'التسويق',
training: 'التدريب',
utilities: 'المرافق',
rent: 'الإيجار',
other: 'أخرى',

// Validation & Messages
categoryRequired: 'الفئة مطلوبة',
descriptionRequired: 'الوصف مطلوب',
validAmountRequired: 'مبلغ صحيح مطلوب',
staffRequired: 'تخصيص الموظف مطلوب',
expenseCreatedSuccessfully: 'تم إنشاء المصروف بنجاح!',
expenseUpdatedSuccessfully: 'تم تحديث المصروف بنجاح!',
failedToCreateExpense: 'فشل في إنشاء المصروف',
failedToUpdateExpense: 'فشل في تحديث المصروف',
networkErrorCreatingExpense: 'خطأ شبكة أثناء إنشاء المصروف',
networkErrorUpdatingExpense: 'خطأ شبكة أثناء تحديث المصروف',
createExpense: 'إنشاء مصروف',
updateExpense: 'تحديث مصروف',

// Staff & Suppliers
selectStaff: 'اختر موظف',
selectVendor: 'اختر مورد',
noStaffAvailable: 'لا يوجد موظفون متاحون',
noSuppliersAvailable: 'لا يوجد موردون متاحون',


// Purchase Order Management
purchaseOrders: 'أوامر الشراء',
ordersTotal: 'إجمالي الأوامر',
addPurchaseOrder: 'إضافة أمر شراء',
editPurchaseOrder: 'تعديل أمر شراء',
deletePurchaseOrder: 'حذف أمر شراء',
deletePurchaseOrderConfirmation: 'هل أنت متأكد من حذف أمر الشراء هذا؟',
purchaseOrderDeletedSuccessfully: 'تم حذف أمر الشراء بنجاح',
failedToDeletePurchaseOrder: 'فشل في حذف أمر الشراء',
networkErrorDeletingPurchaseOrder: 'خطأ شبكة أثناء حذف أمر الشراء',
loadingPurchaseOrders: 'جاري تحميل أوامر الشراء...',
searchPurchaseOrders: 'البحث في أوامر الشراء...',
filterPurchaseOrders: 'تصفية أوامر الشراء',
noPurchaseOrdersFound: 'لم يتم العثور على أوامر شراء',
noPurchaseOrdersAvailable: 'لا توجد أوامر شراء متاحة',
addFirstPurchaseOrder: 'أضف أمر الشراء الأول للبدء',
failedToFetchPurchaseOrders: 'فشل في جلب أوامر الشراء',
networkErrorFetchingPurchaseOrders: 'خطأ شبكة أثناء جلب أوامر الشراء',

// Purchase Order Details
poDate: 'تاريخ أمر الشراء',
expectedDelivery: 'التسليم المتوقع',
supplierName: 'اسم المورد',
totalOrders: 'إجمالي الأوامر',
approvedOrders: 'الأوامر المعتمدة',
deliveredOrders: 'الأوامر المُسلّمة',
cancelledOrders: 'الأوامر الملغية',
allPurchaseOrders: 'جميع أوامر الشراء',

// PO Status (some already exist, adding missing ones)
delivered: 'مُسلّم',
cancelled: 'ملغي',
shipped: 'مُرسل',
processing: 'قيد المعالجة',

// Additional missing keys
loadingData: 'جاري تحميل البيانات...',



selectExpectedDeliveryDate: 'اختر تاريخ التسليم المتوقع',
purchaseOrderInformation: 'معلومات أمر الشراء',
supplierInformation: 'معلومات المورد',
orderItems: 'عناصر الأمر',
addPOItem: 'إضافة عنصر',
orderQuantity: 'كمية الطلب',
unitCost: 'تكلفة الوحدة',
selectSupplierPlaceholder: 'اختر مورد',
addItemsToPurchaseOrder: 'أضف عناصر لأمر الشراء',
financialDetails: 'التفاصيل المالية',
taxAmount: 'مبلغ الضريبة',
shippingCost: 'تكلفة الشحن',
createPurchaseOrder: 'إنشاء أمر شراء',
contactPerson: 'الشخص المسؤول',
supplierType: 'نوع المورد',


purchaseOrder: 'أمر شراء',
purchaseOrderSystem: 'نظام أوامر الشراء',
purchaseOrderDetails: 'تفاصيل أمر الشراء',
purchaseOrderActions: 'إجراءات أمر الشراء',
failedToFetchOrderDetails: 'فشل في جلب تفاصيل الأمر',
itemsSubtotal: 'مجموع العناصر',
itemName: 'اسم العنصر',
editPurchaseOrder: 'تعديل أمر الشراء',
status: 'الحالة',


supplierNameRequired: 'اسم المورد مطلوب',
enterSupplierName: 'أدخل اسم المورد',
updatePurchaseOrder: 'تحديث أمر الشراء',

// Payment Entry Management
paymentEntries: 'إدخالات الدفع',
entriesTotal: 'إجمالي الإدخالات',
balance: 'الرصيد',
addPaymentEntry: 'إضافة إدخال دفع',
editPaymentEntry: 'تعديل إدخال دفع',
deletePaymentEntry: 'حذف إدخال دفع',
deletePaymentEntryConfirmation: 'هل أنت متأكد من حذف إدخال الدفع هذا؟',
paymentEntryDeletedSuccessfully: 'تم حذف إدخال الدفع بنجاح',
failedToDeletePaymentEntry: 'فشل في حذف إدخال الدفع',
networkErrorDeletingPaymentEntry: 'خطأ شبكة أثناء حذف إدخال الدفع',
loadingPaymentEntries: 'جاري تحميل إدخالات الدفع...',
searchPaymentEntries: 'البحث في إدخالات الدفع...',
filterPaymentEntries: 'تصفية إدخالات الدفع',
noPaymentEntriesFound: 'لم يتم العثور على إدخالات دفع',
noPaymentEntriesAvailable: 'لا توجد إدخالات دفع متاحة',
addFirstPaymentEntry: 'أضف إدخال الدفع الأول للبدء',
failedToFetchPaymentEntries: 'فشل في جلب إدخالات الدفع',
networkErrorFetchingPaymentEntries: 'خطأ شبكة أثناء جلب إدخالات الدفع',

// Payment Types
sales_invoice: 'فاتورة مبيعات',
purchase_invoice: 'فاتورة شراء',
expense: 'مصروف',
credit: 'دائن',
debit: 'مدين',
allPayments: 'جميع المدفوعات',
creditPayments: 'المدفوعات الدائنة',
debitPayments: 'المدفوعات المدينة',

// Credit Notes
creditNotes: 'إشعارات الائتمان',
actualAmount: 'المبلغ الفعلي',
loadingCreditNotes: 'جاري تحميل إشعارات الائتمان...',
noCreditNotesAvailable: 'لا توجد إشعارات ائتمان متاحة',
availableCreditNotes: 'إشعارات الائتمان المتاحة',
returnInvoice: 'فاتورة الإرجاع',
remainingAmount: 'المبلغ المتبقي',
amountToUse: 'المبلغ المراد استخدامه',
totalCreditApplied: 'إجمالي الائتمان المطبق',
createCreditNotesFirst: 'قم بإنشاء إشعارات ائتمان أولاً',
appliedCreditNotes: 'إشعارات الائتمان المطبقة',
creditNote: 'إشعار الائتمان',
creditNoteAmountMustBePositive: 'يجب أن يكون مبلغ إشعار الائتمان موجباً',
creditNoteAmountExceedsRemaining: 'لا يمكن أن يتجاوز مبلغ إشعار الائتمان المبلغ المتبقي',

// Payment Details
paymentDate: 'تاريخ الدفع',
transactionRef: 'مرجع المعاملة',
recordedBy: 'سجل بواسطة',
totalEntries: 'إجمالي الإدخالات',
totalCredits: 'إجمالي الدائن',
totalDebits: 'إجمالي المدين',


// Payment Entry Form
transactionType: 'نوع المعاملة',
selectBank: 'اختر البنك',
selectBankPlaceholder: 'اختر حساب بنكي',
referenceInformation: 'معلومات المرجع',
paymentType: 'نوع الدفع',
selectReference: 'اختر المرجع',
selectReferencePlaceholder: 'اختر مرجع',
noReferencesAvailable: 'لا توجد مراجع متاحة',
paymentDetails: 'تفاصيل الدفع',
enterAmount: 'أدخل المبلغ',
enterTransactionReference: 'أدخل مرجع المعاملة',
createPaymentEntry: 'إنشاء إدخال دفع',

// Validation
bankRequired: 'البنك مطلوب',
referenceRequired: 'المرجع مطلوب',
paymentEntryCreatedSuccessfully: 'تم إنشاء إدخال الدفع بنجاح!',
failedToCreatePaymentEntry: 'فشل في إنشاء إدخال الدفع',
networkErrorCreatingPaymentEntry: 'خطأ شبكة أثناء إنشاء إدخال الدفع',

// Bank & Reference
noBanksAvailable: 'لا توجد بنوك متاحة',
createReferencesFirst: 'قم بإنشاء فواتير مبيعات أو مصروفات أولاً',
customer: 'العميل',

// Payment Methods (if not already added)
cash: 'نقداً',
banktransfer: 'تحويل بنكي',
check: 'شيك',
card: 'بطاقة',

paymentEntrySystem: 'نظام إدخالات الدفع',
entryId: 'رقم الإدخال',
paymentAmount: 'مبلغ الدفع', 
recordInformation: 'معلومات السجل',
notSpecified: 'غير محدد',

entryInformation: 'معلومات الإدخال',
updatePaymentEntry: 'تحديث إدخال الدفع',
currentAmount: 'المبلغ الحالي',
paymentEntryUpdatedSuccessfully: 'تم تحديث إدخال الدفع بنجاح!',
failedToUpdatePaymentEntry: 'فشل في تحديث إدخال الدفع',
networkErrorUpdatingPaymentEntry: 'خطأ شبكة أثناء تحديث إدخال الدفع',


banks: 'البنوك',
banksTotal: 'إجمالي البنوك',
addBank: 'إضافة بنك',
editBank: 'تعديل بنك',
deleteBank: 'حذف بنك',
deleteBankConfirmation: 'هل أنت متأكد من حذف هذا البنك؟',
bankDeletedSuccessfully: 'تم حذف البنك بنجاح',
failedToDeleteBank: 'فشل في حذف البنك',
networkErrorDeletingBank: 'خطأ شبكة أثناء حذف البنك',
loadingBanks: 'جاري تحميل البنوك...',
searchBanks: 'البحث في البنوك...',
filterBanks: 'تصفية البنوك',
noBanksFound: 'لم يتم العثور على بنوك',
noBanksAvailable: 'لا توجد بنوك متاحة',
addFirstBank: 'أضف بنكك الأول للبدء',
failedToFetchBanks: 'فشل في جلب البنوك',
networkErrorFetchingBanks: 'خطأ شبكة أثناء جلب البنوك',
totalBanks: 'إجمالي البنوك',
allBanks: 'جميع البنوك',
activeBanks: 'البنوك النشطة',
inactiveBanks: 'البنوك غير النشطة',
accountNumber: 'رقم الحساب',
branch: 'الفرع',
iban: 'رقم الآيبان',
swiftCode: 'رمز السويفت',
active: 'نشط',
inactive: 'غير نشط',

reportsDashboard: 'لوحة التقارير',
businessAnalytics: 'التحليلات التجارية',
salesReport: 'تقرير المبيعات',
customerReport: 'تقرير العملاء',
inventoryStats: 'إحصائيات المخزون',
financialSummary: 'ملخص مالي',
setSalesTarget: 'تعيين هدف المبيعات',
salesTargetReport: 'تقرير هدف المبيعات',
recordVisit: 'تسجيل زيارة',
visitReport: 'تقرير الزيارات',
salesReports: 'تقارير المبيعات',
customerReports: 'تقارير العملاء',
inventoryReports: 'تقارير المخزون',
financialReports: 'تقارير مالية',
salesTargets: 'أهداف المبيعات',
customerVisits: 'زيارات العملاء',

 // Sales Report
  loadingSalesReport: 'جاري تحميل تقرير المبيعات...',
  failedToFetchSalesReport: 'فشل في جلب تقرير المبيعات',
  networkErrorFetchingSalesReport: 'خطأ شبكة أثناء جلب تقرير المبيعات',
  totalSales: 'إجمالي المبيعات',
  totalProfit: 'إجمالي الربح',
  numberOfInvoices: 'عدد الفواتير',
  itemsSold: 'العناصر المباعة',
  salesPerformance: 'أداء المبيعات',
  targetAchievement: 'تحقيق الهدف',
  salesTarget: 'هدف المبيعات',
  achieved: 'المحقق',
  topCustomers: 'أفضل العملاء',
  paymentStatus: 'حالة الدفع',
  
  // Filters
  reportFilters: 'مرشحات التقرير',
  customizeYourReport: 'خصص تقريرك',
  dateRange: 'نطاق التاريخ',
  fromDate: 'من تاريخ',
  toDate: 'إلى تاريخ',
  selectDate: 'اختر التاريخ',
  dateRangeRequired: 'نطاق التاريخ مطلوب',
  invalidDateRange: 'تاريخ البداية لا يمكن أن يكون بعد تاريخ النهاية',
  quickFilters: 'المرشحات السريعة',
  thisMonth: 'هذا الشهر',
  lastMonth: 'الشهر الماضي',
  thisYear: 'هذه السنة',
  selectStatus: 'اختر الحالة',
  selectTerritory: 'اختر المنطقة',
  allTerritories: 'جميع المناطق',
  clearAll: 'مسح الكل',
  applyFilters: 'تطبيق المرشحات',
  
  // Customer Selector
  selectCustomer: 'اختر عميل',
  customersAvailable: 'عميل متاح',
  searchCustomers: 'البحث في العملاء...',
  customersFound: 'عميل موجود',
  clearCustomerSelection: 'إلغاء اختيار العميل',
  noCustomersFound: 'لم يتم العثور على عملاء',
  noCustomersAvailable: 'لا يوجد عملاء متاحون',
  tryDifferentSearch: 'جرب مصطلح بحث مختلف',
  addCustomersFirst: 'أضف عملاء أولاً لاستخدام هذا المرشح',
  loadingCustomers: 'جاري تحميل العملاء...',
  failedToFetchCustomers: 'فشل في جلب العملاء',
  networkErrorFetchingCustomers: 'خطأ شبكة أثناء جلب العملاء',
  customerSelected: 'تم اختيار العميل',
  clearCustomer: 'إلغاء العميل',
  
  // Staff Selector
  selectStaff: 'اختر موظف',
  staffMembersAvailable: 'عضو فريق متاح',
  searchStaff: 'البحث في الموظفين...',
  staffMembersFound: 'عضو فريق موجود',
  clearStaffSelection: 'إلغاء اختيار الموظف',
  noStaffFound: 'لم يتم العثور على موظفين',
  noStaffAvailable: 'لا يوجد موظفون متاحون',
  addStaffFirst: 'أضف موظفين أولاً لاستخدام هذا المرشح',
  loadingStaff: 'جاري تحميل الموظفين...',
  failedToFetchStaff: 'فشل في جلب الموظفين',
  networkErrorFetchingStaff: 'خطأ شبكة أثناء جلب الموظفين',
  staffSelected: 'تم اختيار الموظف',
  clearStaff: 'إلغاء الموظف',
  iqama: 'الإقامة',
  joinedOn: 'انضم في',
  superadmin: 'مدير عام',
  admin: 'مدير',
  staff: 'موظف',
  
  // Chart labels
  sales: 'المبيعات',
  cost: 'التكلفة',
  profit: 'الربح',
  invoices: 'فواتير',
  // Customer Report Translations
  customerReport: 'تقرير العميل',
  customerAnalytics: 'تحليلات العميل',
  loadingCustomerReport: 'جاري تحميل تقرير العميل...',
  failedToFetchCustomerReport: 'فشل في جلب تقرير العميل',
  networkErrorFetchingCustomerReport: 'خطأ شبكة أثناء جلب تقرير العميل',
  pleaseSelectCustomer: 'يرجى اختيار عميل أولاً',
  selectCustomerToViewReport: 'اختر عميل لعرض التقرير',
  chooseCustomerFromList: 'اختر عميل من القائمة لعرض تحليلاته التفصيلية',
  
  // Customer Report Stats
  totalOrders: 'إجمالي الطلبات',
  totalVisits: 'إجمالي الزيارات',
  customerPerformance: 'أداء العميل',
  targetAmount: 'المبلغ المستهدف',
  remaining: 'المتبقي',
  financialBreakdown: 'التفصيل المالي',
  totalRevenue: 'إجمالي الإيرادات',
  totalCost: 'إجمالي التكلفة',
  profitMargin: 'هامش الربح',
  totalLoss: 'إجمالي الخسارة',
  orderStatus: 'حالة الطلبات',
  completed: 'مكتمل',
  revenue: 'الإيرادات',
  
  // Customer Report Filters
  customerReportFilters: 'مرشحات تقرير العميل',
  customizeReportPeriod: 'تخصيص فترة التقرير',
  selectedCustomer: 'العميل المحدد',
  customDateRange: 'نطاق تاريخ مخصص',
  resetToCurrentMonth: 'إعادة تعيين للشهر الحالي',
  change: 'تغيير',
  
  // Additional Common Translations
  adjustDateRangeOrTryAgain: 'اضبط نطاق التاريخ أو حاول مرة أخرى لاحقاً',
  noDataAvailable: 'لا توجد بيانات متاحة',

  // Inventory Report Translations
  inventoryReport: 'تقرير المخزون',
  loadingInventoryReport: 'جاري تحميل تقرير المخزون...',
  failedToFetchInventoryReport: 'فشل في جلب تقرير المخزون',
  networkErrorFetchingInventoryReport: 'خطأ شبكة أثناء جلب تقرير المخزون',
  itemsTracked: 'عنصر متتبع',
  noInventoryData: 'لا توجد بيانات مخزون',
  adjustFiltersOrAddItems: 'اضبط المرشحات أو أضف عناصر إلى مخزونك',
  
  // Inventory Stats
  totalItems: 'إجمالي العناصر',
  totalValue: 'القيمة الإجمالية',
  lowStockItems: 'عناصر مخزون منخفض',
  reorderNeeded: 'يحتاج إعادة طلب',
  topItemsByValue: 'أفضل العناصر حسب القيمة',
  stockStatusOverview: 'نظرة عامة على حالة المخزون',
  normalStock: 'مخزون طبيعي',
  lowStock: 'مخزون منخفض',
  inventoryItems: 'عناصر المخزون',
  
  // Item Details
  itemId: 'رقم العنصر',
  currentStock: 'المخزون الحالي',
  inventoryValue: 'قيمة المخزون',
  availableQty: 'الكمية المتاحة',
  soldQty: 'الكمية المباعة',
  reorderRecommended: 'يُنصح بإعادة الطلب',
  
  // Inventory Filters
  inventoryFilters: 'مرشحات المخزون',
  customizeInventoryReport: 'تخصيص تقرير المخزون',
  lowStockThreshold: 'حد المخزون المنخفض',
  thresholdDescription: 'العناصر التي يقل مخزونها عن هذا المستوى ستُعتبر مخزون منخفض',
  units: 'وحدة',
  quickThresholds: 'حدود سريعة',
  itemFilter: 'مرشح العنصر',
  allItems: 'جميع العناصر',
  specificItemSelected: 'تم اختيار عنصر محدد',
  clearItemFilter: 'إلغاء مرشح العنصر',
  itemFilterNote: 'اتركه فارغاً لتشمل جميع العناصر، أو اختر عنصر محدد للتركيز عليه',
  filterSummary: 'ملخص المرشحات',
  itemScope: 'نطاق العنصر',
  specificItem: 'عنصر محدد',
  resetToDefault: 'إعادة تعيين للافتراضي',
  validThresholdRequired: 'يرجى إدخال قيمة حد صالحة',
  items: 'عناصر',

  
  // Financial Summary Report Translations
  financialSummary: 'الملخص المالي',
  loadingFinancialSummary: 'جاري تحميل الملخص المالي...',
  failedToFetchFinancialSummary: 'فشل في جلب الملخص المالي',
  networkErrorFetchingFinancialSummary: 'خطأ شبكة أثناء جلب الملخص المالي',
  comprehensiveFinancialOverview: 'نظرة عامة مالية شاملة',
  noFinancialData: 'لا توجد بيانات مالية',
  
  // Financial Overview Cards
  totalIncome: 'إجمالي الدخل',
  totalExpenses: 'إجمالي المصروفات',
  netProfitLoss: 'صافي الربح/الخسارة',
  totalPurchases: 'إجمالي المشتريات',
  
  // Charts and Analysis
  cashFlowAnalysis: 'تحليل التدفق النقدي',
  profitLossBreakdown: 'تفصيل الربح/الخسارة',
  productBasedProfit: 'الربح المبني على المنتج',
  outstandingAmounts: 'المبالغ المستحقة',
  receivables: 'المستحقات',
  payables: 'المدفوعات',
  pendingTransactions: 'المعاملات المعلقة',
  pendingIncome: 'الدخل المعلق',
  pendingPurchases: 'المشتريات المعلقة',
  
  // Chart Labels
  income: 'الدخل',
  expenses: 'المصروفات',
  purchases: 'المشتريات',
  spent: 'المنفق',
  
  // Financial Filters
  financialFilters: 'مرشحات مالية',
  selectDateRange: 'اختر نطاق التاريخ',
  customDateRange: 'نطاق تاريخ مخصص',

  // Error messages
  error: 'خطأ',
  authTokenNotFound: 'رمز المصادقة غير موجود',
  dateRangeRequired: 'يرجى تحديد تاريخ البداية والنهاية',
  invalidDateRange: 'تاريخ البداية لا يمكن أن يكون بعد تاريخ النهاية',
  failedToFetchVisitHistory: 'فشل في جلب تاريخ الزيارات',
  networkErrorFetchingVisitHistory: 'خطأ في الشبكة أثناء جلب تاريخ الزيارات',
  failedToGetLocation: 'فشل في الحصول على الموقع الحالي',
  locationPermissionDenied: 'تم رفض إذن الموقع',
  selectCustomerAndLocation: 'يرجى اختيار العميل والتأكد من توفر الموقع',
  failedToVerifyLocation: 'فشل في التحقق من الموقع',
  networkErrorVerifyingLocation: 'خطأ في الشبكة أثناء التحقق من الموقع',
  verifyLocationFirst: 'يرجى التحقق من الموقع أولاً',
  purposeRequired: 'الغرض مطلوب',
  failedToCheckin: 'فشل في إرسال تسجيل الحضور',
  networkErrorCheckin: 'خطأ في الشبكة أثناء إرسال تسجيل الحضور',
  locationError: 'خطأ في الموقع',
  youAreNotInCustomerRadius: 'أنت لست ضمن نطاق موقع العميل',

  // Success messages
  success: 'نجح',
  locationVerifiedSuccess: 'تم التحقق من الموقع بنجاح',
  checkinSuccessful: 'تم إرسال تسجيل الحضور بنجاح',

  // General actions
  ok: 'موافق',
  cancel: 'إلغاء',
  tryAgain: 'حاول مرة أخرى',
  
  // Date and time filters
  quickFilters: 'المرشحات السريعة',
  customDateRange: 'نطاق تاريخ مخصص',
  dateRange: 'نطاق التاريخ',
  fromDate: 'من تاريخ',
  toDate: 'إلى تاريخ',
  selectDate: 'اختر التاريخ',
  selectDatePeriod: 'اختر فترة التاريخ للتصفية',
  today: 'اليوم',
  yesterday: 'أمس',
  thisWeek: 'هذا الأسبوع',
  thisMonth: 'هذا الشهر',
  resetToCurrentMonth: 'إعادة تعيين للشهر الحالي',
  applyFilters: 'تطبيق المرشحات',

  // Visit history
  visitHistory: 'تاريخ الزيارات',
  visitFilters: 'مرشحات الزيارات',
  allStaff: 'جميع الموظفين',
  allCustomers: 'جميع العملاء',
  allStaffVisits: 'جميع زيارات وأنشطة الموظفين',
  yourVisitHistory: 'تاريخ زياراتك وسجلاتك',
  loadingVisitHistory: 'جاري تحميل تاريخ الزيارات...',
  noVisitHistory: 'لم يتم العثور على تاريخ زيارات',
  adjustFiltersOrStartVisiting: 'جرب تعديل المرشحات أو ابدأ زيارة العملاء',

  // Visit details
  checkinTime: 'وقت تسجيل الدخول',
  checkoutTime: 'وقت تسجيل الخروج',
  purpose: 'الغرض',
  notes: 'ملاحظات',
  
  // Statistics
  totalVisits: 'إجمالي الزيارات',
  completedVisits: 'مكتملة',
  avgDuration: 'متوسط المدة',
  minutes: 'دقيقة',
  distance: 'المسافة',

  // Check-in process
  staffCheckin: 'تسجيل حضور الموظف',
  recordYourVisit: 'سجل زيارة العميل',
  selectCustomer: 'اختر العميل',
  tapToSelectCustomer: 'اضغط لاختيار العميل',
  checkinDetails: 'تفاصيل تسجيل الحضور',
  checkinType: 'نوع تسجيل الحضور',
  arrival: 'وصول',
  departure: 'مغادرة',
  enterPurpose: 'أدخل الغرض من الزيارة',
  enterNotes: 'أدخل ملاحظات إضافية (اختياري)',
  submitCheckin: 'إرسال تسجيل الحضور',

  // Location verification
  locationVerification: 'التحقق من الموقع',
  locationObtained: 'تم الحصول على الموقع',
  locationNotAvailable: 'الموقع غير متوفر',
  refreshLocation: 'تحديث الموقع',
  locationVerified: 'تم التحقق من الموقع',
  locationNotVerified: 'لم يتم التحقق من الموقع',
  verifyLocation: 'التحقق من الموقع',


    // Set Sales Target Screen
 // Set Sales Target Screen
  setSalesTarget: 'تحديد هدف المبيعات',
  defineTargetsForPeriod: 'تحديد الأهداف لفترة محددة',
  targetConfiguration: 'إعداد الهدف',
  targetPeriod: 'فترة الهدف',
  targetType: 'نوع الهدف',
  targetDate: 'تاريخ الهدف',
  targetAmount: 'مبلغ الهدف',
  targetAssignment: 'تخصيص الهدف',
  
  // Target periods
  monthly: 'شهري',
  quarterly: 'ربع سنوي',
  yearly: 'سنوي',
  
  // Target types
  revenue: 'الإيرادات',
  visits: 'الزيارات',
  orders: 'الطلبات',
  
  // Form fields
  assignToStaff: 'تخصيص للموظف',
  selectStaff: 'اختر الموظف',
  specificCustomer: 'عميل محدد',
  selectCustomer: 'اختر العميل',
  territory: 'المنطقة',
  selectTerritory: 'اختر المنطقة',
  optional: 'اختياري',
  enterTargetAmount: 'أدخل مبلغ الهدف',
  
  // Validation messages
  targetAmountRequired: 'مبلغ الهدف مطلوب',
  targetAmountMustBePositive: 'يجب أن يكون مبلغ الهدف إيجابي',
  staffSelectionRequired: 'اختيار الموظف مطلوب',
  salesTargetSetSuccessfully: 'تم تحديد هدف المبيعات بنجاح',
  failedToSetSalesTarget: 'فشل في تحديد هدف المبيعات',
  networkErrorSettingTarget: 'خطأ في الشبكة أثناء تحديد الهدف',

  // Sales Performance Screen
  salesPerformance: 'أداء المبيعات',
  teamPerformanceAndTargets: 'نظرة عامة على أداء الفريق والأهداف',
  yourPerformanceAndTargets: 'أداؤك وأهدافك',
  loadingSalesData: 'جاري تحميل بيانات المبيعات...',
  
  // Tabs
  dashboard: 'لوحة التحكم',
  targets: 'الأهداف',
  target: 'هدف',
  
  // Dashboard Metrics
  performanceStatus: 'حالة الأداء',
  targetProgress: 'تقدم الهدف',
  achievementBreakdown: 'تفصيل الإنجاز',
  
  // Status types
  ahead: 'متقدم عن الهدف',
  on_track: 'على المسار الصحيح',
  behind: 'متأخر عن الهدف',
  
  // Performance metrics
  targetAmount: 'مبلغ الهدف',
  achievedAmount: 'المبلغ المحقق',
  remainingAmount: 'المبلغ المتبقي',
  daysLeft: 'الأيام المتبقية',
  dailyTargetNeeded: 'الهدف اليومي المطلوب',
  day: 'يوم',
  comparisonWithLastPeriod: 'المقارنة مع الفترة السابقة',
  achieved: 'محقق',
  remaining: 'متبقي',
  
  // Empty states
  noPerformanceData: 'لم يتم العثور على بيانات الأداء',
  adjustFiltersToViewData: 'قم بتعديل المرشحات لعرض بيانات الأداء',
  noSalesTargets: 'لم يتم العثور على أهداف مبيعات',
  noTargetsForPeriod: 'لم يتم تحديد أهداف لهذه الفترة',
  
  // Target details
  setBy: 'تم التحديد بواسطة',
  createdOn: 'تم الإنشاء في',
  customer: 'العميل',
  
  // Error messages
  failedToFetchPerformance: 'فشل في جلب بيانات الأداء',
  networkErrorFetchingPerformance: 'خطأ في الشبكة أثناء جلب الأداء',
  failedToFetchTargets: 'فشل في جلب أهداف المبيعات',
  networkErrorFetchingTargets: 'خطأ في الشبكة أثناء جلب الأهداف',


   // Staff Management Screen
  staffManagement: 'إدارة الموظفين',
  manageTeamMembers: 'إدارة أعضاء فريقك',
  searchStaff: 'البحث في الموظفين...',
  totalStaff: 'إجمالي الموظفين',
  activeStaff: 'نشط',
  inactiveStaff: 'غير نشط',
  loadingStaff: 'جاري تحميل الموظفين...',
  
  // Staff Status
  active: 'نشط',
  inactive: 'غير نشط',
  suspended: 'معلق',
  
  // Staff Details
  hiredOn: 'تم التوظيف في',
  salary: 'الراتب',
  
  // Actions
  edit: 'تعديل',
  delete: 'حذف',
  confirmDelete: 'تأكيد الحذف',
  confirmDeleteStaff: 'هل أنت متأكد من حذف',
  
  // Empty States
  noStaffFound: 'لم يتم العثور على موظفين',
  noStaffMembers: 'لا يوجد موظفون بعد',
  tryDifferentSearch: 'جرب مصطلح بحث مختلف',
  addFirstStaffMember: 'أضف أول عضو في فريقك',
  
  // Add/Edit Staff Screen
  addStaff: 'إضافة موظف',
  editStaff: 'تعديل الموظف',
  updateStaffDetails: 'تحديث تفاصيل الموظف',
  addNewTeamMember: 'إضافة عضو جديد للفريق',
  updateStaff: 'تحديث الموظف',
  
  // Form Sections
  basicInformation: 'المعلومات الأساسية',
  jobInformation: 'معلومات الوظيفة',
  additionalInformation: 'معلومات إضافية',
  
  // Form Fields
  fullName: 'الاسم الكامل',
  arabicName: 'الاسم بالعربية',
  email: 'البريد الإلكتروني',
  phone: 'الهاتف',
  position: 'المنصب',
  department: 'القسم',
  hireDate: 'تاريخ التوظيف',
  territoryAssigned: 'المنطقة المخصصة',
  status: 'الحالة',
  address: 'العنوان',
  
  // Form Placeholders
  enterFullName: 'أدخل الاسم الكامل',
  enterArabicName: 'أدخل الاسم بالعربية',
  enterEmail: 'أدخل عنوان البريد الإلكتروني',
  enterPhone: 'أدخل رقم الهاتف',
  enterPosition: 'أدخل المنصب الوظيفي',
  enterDepartment: 'أدخل القسم',
  enterSalary: 'أدخل مبلغ الراتب',
  enterTerritory: 'أدخل المنطقة المخصصة',
  enterAddress: 'أدخل العنوان',
  
  // Validation Messages
  nameRequired: 'الاسم مطلوب',
  emailRequired: 'البريد الإلكتروني مطلوب',
  invalidEmail: 'يرجى إدخال بريد إلكتروني صحيح',
  phoneRequired: 'رقم الهاتف مطلوب',
  positionRequired: 'المنصب مطلوب',
  departmentRequired: 'القسم مطلوب',
  salaryRequired: 'الراتب مطلوب',
  invalidSalary: 'يرجى إدخال مبلغ راتب صحيح',
  pleaseFillRequiredFields: 'يرجى ملء جميع الحقول المطلوبة',
  
  // Success Messages
  staffAddedSuccessfully: 'تم إضافة الموظف بنجاح',
  staffUpdatedSuccessfully: 'تم تحديث الموظف بنجاح',
  staffDeletedSuccessfully: 'تم حذف الموظف بنجاح',
  
  // Error Messages
  failedToFetchStaff: 'فشل في جلب الموظفين',
  networkErrorFetchingStaff: 'خطأ في الشبكة أثناء جلب الموظفين',
  failedToAddStaff: 'فشل في إضافة الموظف',
  networkErrorAddingStaff: 'خطأ في الشبكة أثناء إضافة الموظف',
  failedToUpdateStaff: 'فشل في تحديث الموظف',
  networkErrorUpdatingStaff: 'خطأ في الشبكة أثناء تحديث الموظف',
  failedToDeleteStaff: 'فشل في حذف الموظف',
  networkErrorDeletingStaff: 'خطأ في الشبكة أثناء حذف الموظف',


  // User Management Screen
  userManagement: 'إدارة المستخدمين',
  manageSystemUsers: 'إدارة مستخدمي النظام والأدوار',
  searchUsers: 'البحث في المستخدمين...',
  totalUsers: 'إجمالي المستخدمين',
  adminUsers: 'المدراء',
  staffUsers: 'الموظفين',
  loadingUsers: 'جاري تحميل المستخدمين...',
  
  // User Roles
  superadmin: 'مدير عام',
  admin: 'مدير',
  staff: 'موظف',
  
  // User Details
  iqamaNo: 'رقم الإقامة',
  dateOfBirth: 'تاريخ الميلاد',
  registeredOn: 'تم التسجيل في',
  currentUser: 'المستخدم الحالي',
  
  // Actions
  edit: 'تعديل',
  delete: 'حذف',
  confirmDelete: 'تأكيد الحذف',
  confirmDeleteUser: 'هل أنت متأكد من حذف',
  cannotDeleteOwnAccount: 'لا يمكنك حذف حسابك الخاص',
  
  // Empty States
  noUsersFound: 'لم يتم العثور على مستخدمين',
  noUsers: 'لا يوجد مستخدمون بعد',
  tryDifferentSearch: 'جرب مصطلح بحث مختلف',
  addFirstUser: 'أضف أول مستخدم للنظام',
  
  // Add/Edit User Screen
  addUser: 'إضافة مستخدم',
  editUser: 'تعديل المستخدم',
  updateUserDetails: 'تحديث تفاصيل المستخدم',
  addNewSystemUser: 'إضافة مستخدم جديد للنظام',
  updateUser: 'تحديث المستخدم',
  
  // Form Sections
  personalInformation: 'المعلومات الشخصية',
  systemAccess: 'الوصول للنظام',
  
  // Form Fields
  firstName: 'الاسم الأول',
  lastName: 'اسم العائلة',
  email: 'البريد الإلكتروني',
  iqamaNumber: 'رقم الإقامة',
  userRole: 'دور المستخدم',
  password: 'كلمة المرور',
  confirmPassword: 'تأكيد كلمة المرور',
  
  // Form Placeholders
  enterFirstName: 'أدخل الاسم الأول',
  enterLastName: 'أدخل اسم العائلة',
  enterEmail: 'أدخل عنوان البريد الإلكتروني',
  enterIqamaNumber: 'أدخل رقم الإقامة',
  enterPassword: 'أدخل كلمة المرور',
  confirmYourPassword: 'أكد كلمة المرور',
  leaveBlankToKeepCurrent: 'اتركه فارغاً للاحتفاظ بكلمة المرور الحالية',
  
  // Password Requirements
  passwordRequirements: 'متطلبات كلمة المرور',
  minEightCharacters: 'الحد الأدنى 8 أحرف',
  passwordsMustMatch: 'يجب أن تتطابق كلمات المرور',
  
  // Validation Messages
  firstNameRequired: 'الاسم الأول مطلوب',
  lastNameRequired: 'اسم العائلة مطلوب',
  emailRequired: 'البريد الإلكتروني مطلوب',
  invalidEmail: 'يرجى إدخال بريد إلكتروني صحيح',
  iqamaRequired: 'رقم الإقامة مطلوب',
  passwordRequired: 'كلمة المرور مطلوبة',
  passwordTooShort: 'يجب أن تكون كلمة المرور 8 أحرف على الأقل',
  confirmPasswordRequired: 'يرجى تأكيد كلمة المرور',
  passwordsDoNotMatch: 'كلمات المرور غير متطابقة',
  pleaseFillRequiredFields: 'يرجى ملء جميع الحقول المطلوبة',
  
  // Success Messages
  userAddedSuccessfully: 'تم إضافة المستخدم بنجاح',
  userUpdatedSuccessfully: 'تم تحديث المستخدم بنجاح',
  userDeletedSuccessfully: 'تم حذف المستخدم بنجاح',
  
  // Error Messages
  failedToFetchUsers: 'فشل في جلب المستخدمين',
  networkErrorFetchingUsers: 'خطأ في الشبكة أثناء جلب المستخدمين',
  failedToAddUser: 'فشل في إضافة المستخدم',
  networkErrorAddingUser: 'خطأ في الشبكة أثناء إضافة المستخدم',
  failedToUpdateUser: 'فشل في تحديث المستخدم',
  networkErrorUpdatingUser: 'خطأ في الشبكة أثناء تحديث المستخدم',
  failedToDeleteUser: 'فشل في حذف المستخدم',
  networkErrorDeletingUser: 'خطأ في الشبكة أثناء حذف المستخدم',

   // Settings Screen
  settings: 'الإعدادات',
  manageYourPreferences: 'إدارة تفضيلات التطبيق',
  
  // User Profile
  user: 'مستخدم',
  
  // Section Titles
  legal: 'قانوني',
  support: 'الدعم',
  account: 'الحساب',
  
  // Menu Items
  termsAndConditions: 'الشروط والأحكام',
  privacyPolicy: 'سياسة الخصوصية',
  help: 'المساعدة',
  aboutUs: 'من نحن',
  logout: 'تسجيل الخروج',
  
  // Email Help
  helpRequest: 'طلب مساعدة - تطبيق دوري للمبيعات',
  pleaseDescribeYourIssue: 'يرجى وصف مشكلتك أو سؤالك هنا...',
  contactUs: 'اتصل بنا',
  pleaseContactUs: 'يرجى التواصل معنا على:',
  
  // Logout Confirmation
  confirmLogout: 'تأكيد تسجيل الخروج',
  areYouSureLogout: 'هل أنت متأكد من تسجيل الخروج؟',
  cancel: 'إلغاء',
  
  // App Info
  appVersion: 'إصدار التطبيق',
  
  // Success Messages
  ok: 'موافق',
  
  // Error Messages
  error: 'خطأ',
  cannotOpenLink: 'لا يمكن فتح هذا الرابط',
  failedToOpenLink: 'فشل في فتح الرابط',
  failedToOpenEmail: 'فشل في فتح تطبيق البريد الإلكتروني',
  logoutFailed: 'فشل في تسجيل الخروج. يرجى المحاولة مرة أخرى.',

  // Purchase Invoice Management
'purchaseInvoices': 'فواتير الشراء',
'addPurchaseInvoice': 'إضافة فاتورة شراء',
'editPurchaseInvoice': 'تعديل فاتورة الشراء',
'createPurchaseInvoice': 'إنشاء فاتورة الشراء',
'updatePurchaseInvoice': 'تحديث فاتورة الشراء',
'deletePurchaseInvoice': 'حذف فاتورة الشراء',
'confirmDeletePurchaseInvoice': 'هل أنت متأكد من حذف فاتورة الشراء هذه؟',
'purchaseInvoiceCreatedSuccessfully': 'تم إنشاء فاتورة الشراء بنجاح!',
'purchaseInvoiceUpdatedSuccessfully': 'تم تحديث فاتورة الشراء بنجاح!',
'purchaseInvoiceDeletedSuccessfully': 'تم حذف فاتورة الشراء بنجاح!',
'failedToCreatePurchaseInvoice': 'فشل في إنشاء فاتورة الشراء',
'failedToUpdatePurchaseInvoice': 'فشل في تحديث فاتورة الشراء',
'failedToDeletePurchaseInvoice': 'فشل في حذف فاتورة الشراء',
'failedToFetchPurchaseInvoices': 'فشل في جلب فواتير الشراء',
'networkErrorCreatingPurchaseInvoice': 'خطأ في الشبكة أثناء إنشاء فاتورة الشراء',
'networkErrorUpdatingPurchaseInvoice': 'خطأ في الشبكة أثناء تحديث فاتورة الشراء',
'networkErrorDeletingPurchaseInvoice': 'خطأ في الشبكة أثناء حذف فاتورة الشراء',
'networkErrorFetchingPurchaseInvoices': 'خطأ في الشبكة أثناء جلب فواتير الشراء',
'loadingPurchaseInvoices': 'جاري تحميل فواتير الشراء...',
'searchPurchaseInvoices': 'البحث في فواتير الشراء...',
'noPurchaseInvoicesFound': 'لم يتم العثور على فواتير شراء',
'noPurchaseInvoicesAvailable': 'لا توجد فواتير شراء متاحة',
'addFirstPurchaseInvoice': 'أضف فاتورة الشراء الأولى للبدء',

// Form Fields
'purchaseOrderInformation': 'معلومات أمر الشراء',
'selectPurchaseOrder': 'اختر أمر الشراء',
'selectPOPlaceholder': 'اختر أمر شراء',
'selectSupplier': 'اختر المورد',
'selectSupplierPlaceholder': 'اختر مورد',
'selectInventory': 'اختر المخزون',
'selectInventoryPlaceholder': 'اختر عنصر من المخزون',
'invoiceInformation': 'معلومات الفاتورة',
'invoiceDate': 'تاريخ الفاتورة',
'dueDate': 'تاريخ الاستحقاق',
'selectDueDate': 'اختر تاريخ الاستحقاق',
'invoiceItems': 'عناصر الفاتورة',
'addItem': 'إضافة عنصر',
'totalPrice': 'السعر الإجمالي',
'noItemsAdded': 'لم تتم إضافة عناصر',
'addItemsToInvoice': 'أضف عناصر لإنشاء الفاتورة',
'financialDetails': 'التفاصيل المالية',
'taxPercentage': 'نسبة الضريبة',
'discountPercentage': 'نسبة الخصم',
'calculatedTotals': 'المجاميع المحسوبة',
'subtotal': 'المجموع الفرعي',
'taxAmount': 'مبلغ الضريبة',
'discountAmount': 'مبلغ الخصم',
'totalAmount': 'المبلغ الإجمالي',
'paymentInformation': 'معلومات الدفع',
'paymentStatus': 'حالة الدفع',
'paymentMethod': 'طريقة الدفع',
'pending': 'معلق',
'paid': 'مدفوع',
'overdue': 'متأخر',
'banktransfer': 'تحويل مصرفي',
'cash': 'نقدي',
'card': 'بطاقة',
'check': 'شيك',
'notes': 'ملاحظات',
'enterNotes': 'أدخل الملاحظات...',

// Suppliers & Inventory
'supplier': 'المورد',
'suppliers': 'الموردين',
'contact': 'جهة الاتصال',
'noSuppliersAvailable': 'لا توجد موردين متاحين',
'inventory': 'المخزون',
'noInventoryAvailable': 'لا يوجد مخزون متاح',

// Validation
'supplierRequired': 'اختيار المورد مطلوب',
'poNumberRequired': 'رقم أمر الشراء مطلوب',
'dueDateRequired': 'تاريخ الاستحقاق مطلوب',
'itemsRequired': 'مطلوب عنصر واحد على الأقل',

// List View
'invoices': 'فواتير',
'total': 'المجموع',
'paidAmount': 'المبلغ المدفوع',
'pendingAmount': 'المبلغ المعلق',
'items': 'العناصر',
'moreItems': 'عناصر أكثر',
'createdBy': 'أنشئ بواسطة',
'noDate': 'لا يوجد تاريخ',

// General
'optional': 'اختياري',
'item': 'عنصر',
'quantity': 'الكمية',
'unitPrice': 'سعر الوحدة',
'price': 'السعر',
'stock': 'المخزون',
'cost': 'التكلفة',
'selectItem': 'اختر عنصر',
'noItemsAvailable': 'لا توجد عناصر متاحة',
'loadingData': 'جاري تحميل البيانات...',
'tryAdjustingSearch': 'جرب تعديل كلمات البحث',

  "salesTarget": "هدف المبيعات",
  "revenueTarget": "هدف الإيرادات",
  "visitsTarget": "هدف الزيارات", 

  }
};

class LanguageService {
  constructor() {
    this.currentLanguage = 'en';
    this.isRTL = false;
    this.listeners = [];
  }

  // Get current language
  getCurrentLanguage() {
    return this.currentLanguage;
  }

  // Check if current language is RTL
  isRTLLanguage() {
    return this.isRTL;
  }

  // Load saved language from storage
  async loadSavedLanguage() {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ar')) {
        this.currentLanguage = savedLanguage;
        this.isRTL = savedLanguage === 'ar';
        this.notifyListeners();
      }
      return this.currentLanguage;
    } catch (error) {
      console.error('Error loading saved language:', error);
      return 'en';
    }
  }

  // Set language and save to storage
  async setLanguage(language) {
    if (language !== 'en' && language !== 'ar') {
      throw new Error('Unsupported language. Only "en" and "ar" are supported.');
    }

    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, language);
      this.currentLanguage = language;
      this.isRTL = language === 'ar';
      this.notifyListeners();
      return true;
    } catch (error) {
      console.error('Error saving language:', error);
      return false;
    }
  }

  // Get translation for a key
  translate(key, defaultValue = key) {
    const languageTranslations = translations[this.currentLanguage];
    return languageTranslations[key] || defaultValue;
  }

  // Short alias for translate
  t(key, defaultValue = key) {
    return this.translate(key, defaultValue);
  }

  // Add listener for language changes
  addListener(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  // Notify all listeners when language changes
  notifyListeners() {
    this.listeners.forEach(callback => {
      callback(this.currentLanguage, this.isRTL);
    });
  }

  // Get all available languages
  getAvailableLanguages() {
    return [
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'ar', name: 'Arabic', nativeName: 'العربية' }
    ];
  }

  // Format text direction based on current language
  getTextDirection() {
    return this.isRTL ? 'rtl' : 'ltr';
  }

  // Get flex direction for RTL support
  getFlexDirection() {
    return this.isRTL ? 'row-reverse' : 'row';
  }

  // Get text alignment
  getTextAlign() {
    return this.isRTL ? 'right' : 'left';
  }
}

// Export singleton instance
const languageService = new LanguageService();
export default languageService;