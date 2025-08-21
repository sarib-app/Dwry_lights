// Globals/Store/SimplePermissions.js
import AsyncStorage from '@react-native-async-storage/async-storage';

class SimplePermissions {
  constructor() {
    this.userPermissions = [];
  }

  // Fetch user permissions from API
  async fetchUserPermissions() {
    try {
      // Get stored user ID and token (adjust these keys based on your auth system)
      const userData = await AsyncStorage.getItem('userData');
      const userId = userData ? JSON.parse(userData).id : '2'
      const token = await AsyncStorage.getItem('userToken') || 'cTY16iruYgpWDnECxgLsipS1Y3QMLndhiXHPaq9G17aad417';

      const myHeaders = new Headers();
      myHeaders.append("Authorization", `Bearer ${token}`);
      
      const requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
      };

      const response = await fetch(
        `https://planetdory.dwrylight.com/api/get_staff_permissions/${userId}`, 
        requestOptions
      );

      const result = await response.json();

      if (result.status === 200) {
        this.userPermissions = result.permissions || [];
        return this.userPermissions;
      } else {
        console.error('Failed to fetch permissions:', result.message);
        return [];
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
      return [];
    }
  }

  // Check if user has module access (looking for .management permission)
  hasModuleAccess(moduleName) {
    const permissionName = `${moduleName}.management`;
    return this.userPermissions.some(permission => 
      permission.name === permissionName && permission.type === 'module'
    );
  }

  // Get current permissions
  getCurrentPermissions() {
    return this.userPermissions;
  }
}

// Create and export singleton
const simplePermissions = new SimplePermissions();
export default simplePermissions;