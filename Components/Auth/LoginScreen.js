// LoginScreen.js - Creative & Professional Login Screen
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
  Dimensions,
  ImageBackground,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

// Import our services
// import Apis from './api';
import Apis from '../Globals/Store/Apis';
// import languageService from './languages';
import languageService from '../Globals/Store/Lang';
// import Validation from './validation';
import Validation from '../Globals/Store/Validation';

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    email: 'admin@gmail.com',
    password: 'password123',
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isRTL, setIsRTL] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Animation references
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;
  const logoScaleAnim = useRef(new Animated.Value(0.3)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const floatingAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    initializeScreen();
    startAnimations();
    loadSavedCredentials();
  }, []);

  const initializeScreen = async () => {
    const language = await languageService.loadSavedLanguage();
    setCurrentLanguage(language);
    setIsRTL(language === 'ar');
  };

  const startAnimations = () => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(logoScaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous floating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatingAnim, {
          toValue: -10,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatingAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Pulse animation for logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const loadSavedCredentials = async () => {
    try {
      const savedEmail = await AsyncStorage.getItem('rememberedEmail');
      const savedRemember = await AsyncStorage.getItem('rememberMe');
      
      if (savedEmail && savedRemember === 'true') {
        setFormData({ ...formData, email: savedEmail });
        setRememberMe(true);
      }
    } catch (error) {
      console.log('Error loading saved credentials:', error);
    }
  };

  const translate = (key) => {
    return languageService.translate(key);
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    
    // Clear error with animation
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const handleLogin = async () => {
    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Validate form
    const validation = Validation.validateLoginForm(formData);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const result = await Apis.login(formData);

      if (result.success) {
        // Success haptic
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Store credentials if remember me is checked
        if (rememberMe) {
          await AsyncStorage.setItem('rememberedEmail', formData.email);
          await AsyncStorage.setItem('rememberMe', 'true');
        } else {
          await AsyncStorage.removeItem('rememberedEmail');
          await AsyncStorage.removeItem('rememberMe');
        }

        // Store auth token and user data
        if (result.data.token) {
          await AsyncStorage.setItem('userToken', result.data.token);
          await AsyncStorage.setItem('userData', JSON.stringify(result.data.user));
        }

        Alert.alert(
          translate('loginSuccessful'),
          result.data.message || translate('Welcome back!'),
          [
            {
              text: translate('ok'),
              onPress: () => {
                console.log('Login successful:', result.data);
                console.log('User Data:', result.data.user);
                console.log('Token:', result.data.token);
                // navigation.navigate('Dashboard');
              }
            }
          ]
        );
        // Replace the navigation line in handleLogin success:
// navigation.navigate('Dashboard');
        navigation.navigate('MainBottomTabs');
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        
        if (result.message) {
          setErrors(result.message);
        } else {
          Alert.alert(
            translate('loginError'),
            result.message || translate('invalidCredentials')
          );
        }
      }
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        translate('connectionError'),
        translate('networkError')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const handleBiometricLogin = () => {
    // TODO: Implement biometric authentication
    Alert.alert('Coming Soon', 'Biometric login will be available soon!');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4A5D23" />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={['#6B7D3D', '#4A5D23', '#2D3A16']}
        locations={[0, 0.5, 1]}
        style={styles.gradientBackground}
      >
        {/* Floating Elements */}
        <Animated.View 
          style={[
            styles.floatingElement,
            styles.floatingElement1,
            { transform: [{ translateY: floatingAnim }] }
          ]}
        />
        <Animated.View 
          style={[
            styles.floatingElement,
            styles.floatingElement2,
            { transform: [{ translateY: floatingAnim }] }
          ]}
        />
        <Animated.View 
          style={[
            styles.floatingElement,
            styles.floatingElement3,
            { transform: [{ translateY: floatingAnim }] }
          ]}
        />

        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
        >
          <Animated.View 
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            {/* Logo Section */}
            <Animated.View 
              style={[
                styles.logoSection,
                {
                  transform: [
                    { scale: logoScaleAnim },
                    { scale: pulseAnim }
                  ]
                }
              ]}
            >
              <View style={styles.logoContainer}>
                <LinearGradient
                  colors={['#8FBC8F', '#6B7D3D']}
                  style={styles.logoGradient}
                >
                  <Text style={styles.logoEmoji}>🌍</Text>
                </LinearGradient>
                
                {/* Glow effect */}
                <View style={styles.logoGlow} />
              </View>
              
              <Text style={[styles.appTitle, isRTL && styles.arabicText]}>
                {translate('appName')}
              </Text>
              
              <Text style={[styles.appSubtitle, isRTL && styles.arabicText]}>
                {translate('welcomeBack')}
              </Text>
            </Animated.View>

            {/* Login Form */}
            <View style={styles.formContainer}>
              <View style={styles.glassmorphicCard}>
                {/* Email Input */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, isRTL && styles.arabicText]}>
                    {translate('email')}
                  </Text>
                  <View style={[styles.inputContainer, errors.email && styles.inputError]}>
                    <View style={styles.inputIconContainer}>
                      <Ionicons name="mail" size={20} color="#6B7D3D" />
                    </View>
                    <TextInput
                      style={[styles.input, isRTL && styles.arabicInput]}
                      value={formData.email}
                      onChangeText={(text) => handleInputChange('email', text)}
                      placeholder={translate('enterEmail')}
                      placeholderTextColor="rgba(107, 125, 61, 0.6)"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      textAlign={isRTL ? 'right' : 'left'}
                    />
                  </View>
                  {errors.email && (
                    <Animated.Text 
                      style={[styles.errorText, isRTL && styles.arabicText]}
                    >
                      {errors.email}
                    </Animated.Text>
                  )}
                </View>

                {/* Password Input */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, isRTL && styles.arabicText]}>
                    {translate('password')}
                  </Text>
                  <View style={[styles.inputContainer, errors.password && styles.inputError]}>
                    <View style={styles.inputIconContainer}>
                      <Ionicons name="lock-closed" size={20} color="#6B7D3D" />
                    </View>
                    <TextInput
                      style={[styles.input, isRTL && styles.arabicInput]}
                      value={formData.password}
                      onChangeText={(text) => handleInputChange('password', text)}
                      placeholder={translate('enterPassword')}
                      placeholderTextColor="rgba(107, 125, 61, 0.6)"
                      secureTextEntry={!showPassword}
                      textAlign={isRTL ? 'right' : 'left'}
                    />
                    <TouchableOpacity 
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeButton}
                    >
                      <Ionicons 
                        name={showPassword ? "eye" : "eye-off"} 
                        size={20} 
                        color="#6B7D3D" 
                      />
                    </TouchableOpacity>
                  </View>
                  {errors.password && (
                    <Animated.Text 
                      style={[styles.errorText, isRTL && styles.arabicText]}
                    >
                      {errors.password}
                    </Animated.Text>
                  )}
                </View>

                {/* Remember Me & Forgot Password */}
                <View style={[styles.optionsRow, isRTL && styles.rtlOptionsRow]}>
                  <TouchableOpacity 
                    style={[styles.rememberContainer, isRTL && styles.rtlRememberContainer]}
                    onPress={() => setRememberMe(!rememberMe)}
                  >
                    <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
                      {rememberMe && (
                        <Ionicons name="checkmark" size={14} color="#fff" />
                      )}
                    </View>
                    <Text style={[styles.rememberText, isRTL && styles.arabicText]}>
                      {translate('rememberMe')}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={handleForgotPassword}>
                    <Text style={[styles.forgotText, isRTL && styles.arabicText]}>
                      {translate('forgotPassword')}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Login Button */}
                <TouchableOpacity
                  style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                  onPress={handleLogin}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={loading ? ['#9CA3AF', '#6B7280'] : ['#8FBC8F', '#6B7D3D']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.loginButtonGradient}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <>
                        <Text style={[styles.loginButtonText, isRTL && styles.arabicText]}>
                          {translate('login')}
                        </Text>
                        <Ionicons 
                          name={isRTL ? "arrow-back" : "arrow-forward"} 
                          size={20} 
                          color="#fff" 
                          style={styles.loginButtonIcon}
                        />
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {/* Biometric Login */}
                <TouchableOpacity
                  style={styles.biometricButton}
                  onPress={handleBiometricLogin}
                  activeOpacity={0.7}
                >
                  <View style={styles.biometricIconContainer}>
                    <Ionicons name="finger-print" size={24} color="#6B7D3D" />
                  </View>
                  <Text style={[styles.biometricText, isRTL && styles.arabicText]}>
                    {translate('useBiometricLogin')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Register Link */}
            <View style={[styles.registerContainer, isRTL && styles.rtlRegisterContainer]}>
              <Text style={[styles.registerText, isRTL && styles.arabicText]}>
                {translate('dontHaveAccount')}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={[styles.registerLink, isRTL && styles.arabicText]}>
                  {translate('register')}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
  },
  floatingElement: {
    position: 'absolute',
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  floatingElement1: {
    width: 80,
    height: 80,
    top: '10%',
    left: '10%',
  },
  floatingElement2: {
    width: 60,
    height: 60,
    top: '20%',
    right: '15%',
  },
  floatingElement3: {
    width: 40,
    height: 40,
    bottom: '30%',
    left: '20%',
  },
  keyboardAvoid: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  logoGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6B7D3D',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  logoEmoji: {
    fontSize: 45,
  },
  logoGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(139, 188, 143, 0.3)',
    top: -10,
    left: -10,
    zIndex: -1,
  },
  appTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  appSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 22,
  },
  formContainer: {
    marginBottom: 30,
  },
  glassmorphicCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 25,
    padding: 30,
    backdropFilter: 'blur(10px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 15,
  },
  inputGroup: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  inputIconContainer: {
    marginRight: 15,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
  },
  arabicInput: {
    textAlign: 'right',
  },
  eyeButton: {
    padding: 5,
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 12,
    marginTop: 8,
    marginLeft: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  rtlOptionsRow: {
    flexDirection: 'row-reverse',
  },
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rtlRememberContainer: {
    flexDirection: 'row-reverse',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: '#6B7D3D',
    borderColor: '#6B7D3D',
  },
  rememberText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
  },
  forgotText: {
    color: '#8FBC8F',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  loginButton: {
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  loginButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  loginButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 25,
    borderRadius: 15,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
  loginButtonIcon: {
    marginLeft: 5,
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  biometricIconContainer: {
    marginRight: 10,
  },
  biometricText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    fontWeight: '500',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rtlRegisterContainer: {
    flexDirection: 'row-reverse',
  },
  registerText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    marginRight: 5,
  },
  registerLink: {
    color: '#8FBC8F',
    fontSize: 16,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    marginLeft: 5,
  },
  arabicText: {
    textAlign: 'right',
    fontFamily: 'Arabic',
  },
});

export default LoginScreen;