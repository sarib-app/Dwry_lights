# Permissions System for ActionScreen

This document explains how the permissions system has been implemented in the ActionScreen to provide granular access control based on user permissions.

## Overview

The ActionScreen now uses a comprehensive permissions system that replaces the basic role-based access control with granular, permission-based access control. Users can only see and access actions for modules they have permissions for.

## Key Features

### 1. Granular Permission Control
- **Module-level permissions**: Users can have different access levels for each module
- **Permission types**: view, create, edit, delete, management
- **Dynamic UI**: Actions are automatically shown/hidden based on permissions

### 2. Visual Permission Indicators
- **Permission badges**: Each action card shows the user's permission level
- **Color coding**: Different colors for different permission types
- **Disabled states**: Actions without permissions are visually distinct

### 3. Fallback Support
- **Staff fallback**: Staff users (role_id = 3) get basic view permissions if none are assigned
- **Graceful degradation**: Users without permissions see appropriate messages

## Architecture

### PermissionsService (`Components/Globals/Store/PermissionsService.js`)
A service class that handles all permission-related operations:

```javascript
// Check if user has a specific permission
await PermissionsService.hasPermission('items.create');

// Check if user has module access
await PermissionsService.hasModuleAccess('inventory');

// Get user's accessible modules
const modules = await PermissionsService.getAccessibleModules();
```

### Permission Structure
Permissions follow the format: `{module}.{action}`

Examples:
- `items.view` - Can view items
- `customers.create` - Can create customers
- `sales_invoice.management` - Full access to sales invoices
- `inventory.edit` - Can edit inventory records

## Implementation Details

### 1. Action Items with Module Mapping
Each action item now includes a `module` property that maps to the permissions system:

```javascript
const allActionItems = [
  { 
    id: 1, 
    title: 'Items', 
    icon: 'cube', 
    color: '#6B7D3D', 
    category: 'core', 
    module: 'items' // Maps to permissions
  },
  // ... more items
];
```

### 2. Permission Checking
Before allowing access to any action, the system checks if the user has at least view permission:

```javascript
const handleActionPress = async (actionItem) => {
  const { title, module } = actionItem;
  
  // Check if user has at least view permission
  if (!hasActionPermission(module, 'view')) {
    Alert.alert('Access Denied', `You don't have permission to access ${title}`);
    return;
  }
  
  // Proceed with navigation
  // ...
};
```

### 3. Dynamic UI Rendering
Action cards are rendered with different states based on permissions:

```javascript
const renderActionCard = (item) => {
  const hasViewPermission = hasActionPermission(item.module, 'view');
  const hasCreatePermission = hasActionPermission(item.module, 'create');
  const hasEditPermission = hasActionPermission(item.module, 'edit');
  const hasDeletePermission = hasActionPermission(item.module, 'delete');
  
  // Get permission level for display
  const getPermissionLevel = () => {
    if (hasDeletePermission) return 'Full Access';
    if (hasEditPermission) return 'Edit Access';
    if (hasCreatePermission) return 'Create Access';
    if (hasViewPermission) return 'View Only';
    return 'No Access';
  };
  
  // Render card with appropriate styling and permissions
  // ...
};
```

## Permission Levels

### 1. View Only (`{module}.view`)
- Can see the module/action
- Cannot create, edit, or delete
- Action card shows "View Only" badge

### 2. Create Access (`{module}.create`)
- Can view and create new records
- Cannot edit or delete existing records
- Action card shows "Create Access" badge

### 3. Edit Access (`{module}.edit`)
- Can view, create, and edit records
- Cannot delete records
- Action card shows "Edit Access" badge

### 4. Full Access (`{module}.delete`)
- Can perform all operations (view, create, edit, delete)
- Action card shows "Full Access" badge

### 5. Management Access (`{module}.management`)
- Complete control over the module
- Includes all CRUD operations
- Action card shows "Full Access" badge

## User Experience

### 1. Permission Loading
- Shows "Loading permissions..." while checking user permissions
- Gracefully handles permission loading errors

### 2. Visual Feedback
- **Enabled actions**: Full color, interactive, show permission level
- **Disabled actions**: Grayed out, non-interactive, show "No Access"
- **Permission badges**: Clear indication of what the user can do

### 3. Access Denied Handling
- Clear error messages when users try to access unauthorized modules
- Prevents navigation to restricted screens

### 4. Header Information
- Shows total number of permissions assigned
- Displays accessible modules count
- Role-specific information (e.g., "Staff Member")

## Configuration

### 1. User Permissions
User permissions are stored in AsyncStorage under `userData.permissions`:

```javascript
// Example user data structure
{
  id: 1,
  name: "John Doe",
  role_id: 2,
  permissions: [
    "items.view",
    "items.create",
    "customers.view",
    "sales_invoice.view"
  ]
}
```

### 2. Staff Fallback
If a staff user (role_id = 3) has no explicit permissions, they get basic view access to:
- Items
- Inventory
- Sales Invoice
- Purchase Invoice
- Customers
- Reports

### 3. Adding New Modules
To add a new module to the permissions system:

1. Add the module to `Permissions.js`
2. Add the action item to `allActionItems` with the correct `module` property
3. Update the navigation logic in `handleActionPress`

## Testing

### PermissionsDemo Component
A demo component (`Components/ActionScreen/PermissionsDemo.js`) is available to test the permissions system:

- **Role selection**: Test different permission sets
- **Permission visualization**: See how permissions are displayed
- **Access testing**: Test permission checks for different actions

### Demo Roles
- **Admin**: Full access to all modules
- **Manager**: Create and edit access to most modules
- **Staff**: View-only access to basic modules
- **Limited**: Minimal access to core modules

## Security Considerations

### 1. Client-Side Validation
- Permissions are checked on the client side for UI purposes
- **Important**: Server-side validation is still required for actual API calls

### 2. Permission Persistence
- Permissions are stored in AsyncStorage
- Should be refreshed when user logs in or permissions change

### 3. Fallback Security
- Staff fallback permissions are minimal and view-only
- No sensitive operations are allowed without explicit permissions

## Future Enhancements

### 1. Real-time Permission Updates
- WebSocket integration for live permission changes
- Automatic UI updates when permissions are modified

### 2. Permission Inheritance
- Role-based permission inheritance
- Permission groups and hierarchies

### 3. Advanced Permission Types
- Time-based permissions
- Location-based permissions
- Conditional permissions based on data

### 4. Audit Logging
- Track permission usage
- Log access attempts and denials

## Troubleshooting

### Common Issues

1. **Actions not showing**: Check if user has permissions for the module
2. **Permission badges not updating**: Ensure permissions are properly loaded from AsyncStorage
3. **Navigation blocked**: Verify that the user has at least view permission for the module

### Debug Mode
Enable debug logging by adding console logs to the PermissionsService:

```javascript
async hasPermission(permissionName) {
  const userPermissions = await this.getUserPermissions();
  console.log('Checking permission:', permissionName, 'User permissions:', userPermissions);
  return userPermissions.includes(permissionName);
}
```

## Conclusion

The permissions system provides a robust, scalable foundation for access control in the ActionScreen. It ensures users only see and can access what they're authorized to use, while maintaining a clean and intuitive user experience.

The system is designed to be easily extensible for future permission requirements and provides comprehensive fallback support for different user roles.
