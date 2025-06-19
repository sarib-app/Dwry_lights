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