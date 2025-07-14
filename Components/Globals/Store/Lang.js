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
unitPrice: 'Unit Price',

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
unitPrice: 'سعر الوحدة',

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