import AsyncStorage from "@react-native-async-storage/async-storage"; 
 const getAuthToken = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        return `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return null;
  };

  export default getAuthToken