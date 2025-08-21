// Globals/Hooks/usePermissions.js
import { useState, useEffect } from 'react';
// import permissionsService from '../Store/PermissionsService';
import permissionsService from './PermissionsDemo';

export const usePermissions = () => {
  const [permissions, setPermissions] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadPermissions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await permissionsService.fetchUserPermissions();
        
        if (isMounted) {
          setPermissions(result.permissions);
          setUser(result.user);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
          console.error('Error loading permissions:', err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Load permissions initially
    loadPermissions();

    // Listen for permission changes
    const unsubscribe = permissionsService.addListener((newPermissions, newUser) => {
      if (isMounted) {
        setPermissions(newPermissions);
        setUser(newUser);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Helper functions
  const hasPermission = (module, type = 'management') => {
    return permissionsService.hasPermission(module, type);
  };

  const hasModuleAccess = (module) => {
    return permissionsService.hasModuleAccess(module);
  };

  const canCreate = (module) => {
    return permissionsService.canCreate(module);
  };

  const canEdit = (module) => {
    return permissionsService.canEdit(module);
  };

  const canDelete = (module) => {
    return permissionsService.canDelete(module);
  };

  const canView = (module) => {
    return permissionsService.canView(module);
  };

  const canPrint = (module) => {
    return permissionsService.canPrint(module);
  };

  const getAccessibleModules = () => {
    return permissionsService.getAccessibleModules();
  };

  const getModulePermissions = (module) => {
    return permissionsService.getModulePermissions(module);
  };

  const isAdmin = () => {
    return permissionsService.isAdmin();
  };

  const refreshPermissions = async () => {
    try {
      setLoading(true);
      setError(null);
      await permissionsService.refreshPermissions();
    } catch (err) {
      setError(err.message);
      console.error('Error refreshing permissions:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    permissions,
    user,
    loading,
    error,
    hasPermission,
    hasModuleAccess,
    canCreate,
    canEdit,
    canDelete,
    canView,
    canPrint,
    getAccessibleModules,
    getModulePermissions,
    isAdmin,
    refreshPermissions
  };
};