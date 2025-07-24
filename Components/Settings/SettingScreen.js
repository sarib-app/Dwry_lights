import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import languageService from '../Globals/Store/Lang';
import commonStyles from '../Globals/CommonStyles';

const SettingsScreen = ({ navigation }) => {
  // State management
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isRTL, setIsRTL] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const translate = (key) => languageService.translate(key);

  useEffect(() => {
    initializeScreen();
  }, []);

  const initializeScreen = async () => {
    const language = await languageService.loadSavedLanguage();
    setCurrentLanguage(language);
    setIsRTL(language === 'ar');
    
    await loadUserData();
  };

  // Load user data from AsyncStorage
  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        setCurrentUser(user);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  // Open external link
  const openLink = async (url, title) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(translate('error'), translate('cannotOpenLink'));
      }
    } catch (error) {
      console.error(`Error opening ${title}:`, error);
      Alert.alert(translate('error'), translate('failedToOpenLink'));
    }
  };

  // Open email client
  const openEmail = async () => {
    const email = 'dory@gmail.com';
    const subject = translate('helpRequest');
    const body = translate('pleaseDescribeYourIssue');
    
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    try {
      const supported = await Linking.canOpenURL(mailtoUrl);
      if (supported) {
        await Linking.openURL(mailtoUrl);
      } else {
        // Fallback: show email address
        Alert.alert(
          translate('contactUs'),
          `${translate('pleaseContactUs')}\n\n${email}`,
          [
            { text: translate('ok') }
          ]
        );
      }
    } catch (error) {
      console.error('Error opening email:', error);
      Alert.alert(translate('error'), translate('failedToOpenEmail'));
    }
  };

  // Handle logout
  const handleLogout = () => {
    Alert.alert(
      translate('confirmLogout'),
      translate('areYouSureLogout'),
      [
        { text: translate('cancel'), style: 'cancel' },
        { 
          text: translate('logout'), 
          style: 'destructive',
          onPress: performLogout
        }
      ]
    );
  };

  // Perform logout
  const performLogout = async () => {
    try {
      // Clear user data from AsyncStorage
      await AsyncStorage.multiRemove(['userData', 'authToken']);
      
      // Navigate to login screen and reset navigation stack
      navigation.reset({
        index: 0,
        routes: [{ name: 'LoginScreen' }],
      });
    } catch (error) {
      console.error('Error during logout:', error);
      Alert.alert(translate('error'), translate('logoutFailed'));
    }
  };

  // Render user profile section
  const renderUserProfile = () => {
    if (!currentUser) return null;

    return (
      <View style={styles.profileSection}>
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Text style={[styles.avatarText, isRTL && commonStyles.arabicText]}>
              {currentUser.first_name?.charAt(0)?.toUpperCase()}{currentUser.last_name?.charAt(0)?.toUpperCase()}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, isRTL && commonStyles.arabicText]}>
              {currentUser.first_name} {currentUser.last_name}
            </Text>
            <Text style={[styles.profileEmail, isRTL && commonStyles.arabicText]}>
              {currentUser.email}
            </Text>
            <Text style={[styles.profileRole, isRTL && commonStyles.arabicText]}>
              {currentUser.role || translate('user')}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  // Render settings item
  const renderSettingsItem = (icon, title, onPress, showArrow = true, color = '#333') => (
    <TouchableOpacity
      style={[styles.settingsItem, isRTL && styles.rtlSettingsItem]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.settingsItemLeft, isRTL && styles.rtlSettingsItemLeft]}>
        <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
        <Text style={[styles.settingsItemText, { color }, isRTL && commonStyles.arabicText]}>
          {title}
        </Text>
      </View>
      {showArrow && (
        <Ionicons 
          name={isRTL ? "chevron-back" : "chevron-forward"} 
          size={20} 
          color="#999" 
        />
      )}
    </TouchableOpacity>
  );

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
                {translate('settings')}
              </Text>
              <Text style={[commonStyles.headerSubtitle, isRTL && commonStyles.arabicText]}>
                {translate('manageYourPreferences')}
              </Text>
            </View>
            <View style={commonStyles.placeholder} />
          </View>
        </LinearGradient>
      </View>

      <ScrollView style={commonStyles.content} showsVerticalScrollIndicator={false}>
        {/* User Profile */}
        {renderUserProfile()}

        {/* Settings Sections */}
        <View style={styles.settingsSection}>
          <Text style={[styles.sectionTitle, isRTL && commonStyles.arabicText]}>
            {translate('legal')}
          </Text>
          
          {renderSettingsItem(
            'document-text',
            translate('termsAndConditions'),
            () => openLink('https://example.com/terms', 'Terms and Conditions'),
            true,
            '#3498DB'
          )}

          {renderSettingsItem(
            'shield-checkmark',
            translate('privacyPolicy'),
            () => openLink('https://example.com/privacy', 'Privacy Policy'),
            true,
            '#9B59B6'
          )}
        </View>

        <View style={styles.settingsSection}>
          <Text style={[styles.sectionTitle, isRTL && commonStyles.arabicText]}>
            {translate('support')}
          </Text>
          
          {renderSettingsItem(
            'help-circle',
            translate('help'),
            openEmail,
            true,
            '#F39C12'
          )}

          {renderSettingsItem(
            'information-circle',
            translate('aboutUs'),
            () => openLink('https://example.com/about', 'About Us'),
            true,
            '#27AE60'
          )}
        </View>

        <View style={styles.settingsSection}>
          <Text style={[styles.sectionTitle, isRTL && commonStyles.arabicText]}>
            {translate('account')}
          </Text>
          
          {renderSettingsItem(
            'log-out',
            translate('logout'),
            handleLogout,
            false,
            '#E74C3C'
          )}
        </View>

        {/* App Version */}
        <View style={styles.versionSection}>
          <Text style={[styles.versionText, isRTL && commonStyles.arabicText]}>
            {translate('appVersion')} 1.0.0
          </Text>
          <Text style={[styles.companyText, isRTL && commonStyles.arabicText]}>
            © 2025 Dory Sales Management
          </Text>
        </View>

        <View style={commonStyles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // Profile Section
  profileSection: {
    marginBottom: 20,
  },

  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    gap: 15,
  },

  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6B7D3D',
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },

  profileInfo: {
    flex: 1,
  },

  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },

  profileEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },

  profileRole: {
    fontSize: 12,
    color: '#6B7D3D',
    fontWeight: '600',
    textTransform: 'uppercase',
  },

  // Settings Sections
  settingsSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    padding: 15,
    paddingBottom: 10,
    backgroundColor: '#f8f9fa',
  },

  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  rtlSettingsItem: {
    flexDirection: 'row-reverse',
  },

  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },

  rtlSettingsItemLeft: {
    flexDirection: 'row-reverse',
  },

  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },

  settingsItemText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },

  // Version Section
  versionSection: {
    alignItems: 'center',
    paddingVertical: 20,
    marginTop: 10,
  },

  versionText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 4,
  },

  companyText: {
    fontSize: 12,
    color: '#ccc',
  },
});

export default SettingsScreen;