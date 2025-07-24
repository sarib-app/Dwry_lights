import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Get the role_id of the currently logged-in user
 * @returns {Promise<number|null>} Returns role_id or null if not found
 */
const getUserRole = async () => {
  try {
    const userData = await AsyncStorage.getItem('userData');
    if (userData) {
      const user = JSON.parse(userData);
      return user.role_id || null;
    }
    return null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
};

export default getUserRole;