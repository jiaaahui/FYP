import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Users, 
  Settings, 
  Check, 
  X, 
  Save, 
  RotateCcw, 
  AlertTriangle,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Edit3
} from 'lucide-react';

// Mock data - replace with your actual Firebase calls
const mockRoles = [
  { id: 'admin', name: 'Admin', description: 'Full system access', userCount: 3 },
  { id: 'delivery-team', name: 'Delivery Team', description: 'Delivery and schedule management', userCount: 8 },
  { id: 'manager', name: 'Manager', description: 'Management oversight', userCount: 2 },
  { id: 'warehouse staff', name: 'Warehouse Staff', description: 'Basic access', userCount: 15 }
];

const mockNavItems = [
  { key: 'dashboard', name: 'Dashboard', description: 'Main dashboard overview', icon: '📊' },
  { key: 'documents', name: 'Schedule', description: 'Schedule management and delivery planning', icon: '📅' },
  { key: 'products', name: 'Information', description: 'Product and inventory information', icon: '📦' },
  { key: 'users', name: 'Reports', description: 'Analytics and reporting tools', icon: '📈' },
  { key: 'employees', name: 'Employee Management', description: 'Employee data and performance', icon: '👥' },
  { key: 'settings', name: 'System Settings', description: 'System configuration', icon: '⚙️' }
];

// Initial access control data
const initialAccessControl = {
  'admin': ['dashboard', 'documents', 'products', 'users', 'employees', 'settings'],
  'delivery-team': ['documents'],
  'manager': ['dashboard', 'documents', 'users', 'employees'],
  'warehousestaff': ['dashboard']
};

export default function RoleAccessControl() {
  const [accessControl, setAccessControl] = useState(initialAccessControl);
  const [originalAccessControl, setOriginalAccessControl] = useState(initialAccessControl);
  const [selectedRole, setSelectedRole] = useState('admin');
  const [hasChanges, setHasChanges] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [showAddRole, setShowAddRole] = useState(false);

  useEffect(() => {
    const hasChangesCheck = JSON.stringify(accessControl) !== JSON.stringify(originalAccessControl);
    setHasChanges(hasChangesCheck);
  }, [accessControl, originalAccessControl]);

  const toggleAccess = (roleId, navKey) => {
    setAccessControl(prev => ({
      ...prev,
      [roleId]: prev[roleId]?.includes(navKey) 
        ? prev[roleId].filter(key => key !== navKey)
        : [...(prev[roleId] || []), navKey]
    }));
  };

  const saveChanges = () => {
    // Here you would save to Firebase
    setOriginalAccessControl({ ...accessControl });
    setHasChanges(false);
    alert('Access control settings saved successfully!');
  };

  const resetChanges = () => {
    setAccessControl({ ...originalAccessControl });
    setHasChanges(false);
  };

  const addNewRole = () => {
    if (newRoleName.trim()) {
      const roleId = newRoleName.toLowerCase().replace(/\s+/g, '-');
      setAccessControl(prev => ({
        ...prev,
        [roleId]: []
      }));
      setNewRoleName('');
      setShowAddRole(false);
      setSelectedRole(roleId);
    }
  };

  const deleteRole = (roleId) => {
    if (roleId === 'admin') {
      alert('Cannot delete admin role');
      return;
    }
    setAccessControl(prev => {
      const newState = { ...prev };
      delete newState[roleId];
      return newState;
    });
    if (selectedRole === roleId) {
      setSelectedRole('admin');
    }
  };

  const getRoleInfo = (roleId) => {
    return mockRoles.find(role => role.id === roleId) || 
           { id: roleId, name: roleId, description: 'Custom role', userCount: 0 };
  };

  const getAccessCount = (roleId) => {
    return accessControl[roleId]?.length || 0;
  };

  const selectedRoleInfo = getRoleInfo(selectedRole);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Role-Based Access Control</h1>
                <p className="text-gray-600">Manage what each role can access in the system</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {showPreview ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                {showPreview ? 'Hide Preview' : 'Preview Access'}
              </button>
              {hasChanges && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={resetChanges}
                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </button>
                  <button
                    onClick={saveChanges}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>

          {hasChanges && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                <p className="text-yellow-800 text-sm">
                  You have unsaved changes. Don't forget to save your access control modifications.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Role Selection Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Roles</h3>
                <button
                  onClick={() => setShowAddRole(true)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Add New Role"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {showAddRole && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <input
                    type="text"
                    placeholder="New role name"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded mb-2 text-sm"
                    onKeyPress={(e) => e.key === 'Enter' && addNewRole()}
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={addNewRole}
                      className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => { setShowAddRole(false); setNewRoleName(''); }}
                      className="px-3 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {Object.keys(accessControl).map(roleId => {
                  const roleInfo = getRoleInfo(roleId);
                  const accessCount = getAccessCount(roleId);
                  const isSelected = selectedRole === roleId;
                  
                  return (
                    <div
                      key={roleId}
                      onClick={() => setSelectedRole(roleId)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors relative group ${
                        isSelected 
                          ? 'bg-blue-50 border-2 border-blue-200' 
                          : 'border border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-900 text-sm">{roleInfo.name}</h4>
                            {roleId !== 'admin' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteRole(roleId);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 rounded transition-all"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{roleInfo.userCount} users</p>
                          <p className="text-xs text-blue-600 mt-1">{accessCount} permissions</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Access Control Panel */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Access Permissions: {selectedRoleInfo.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">{selectedRoleInfo.description}</p>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {selectedRoleInfo.userCount} users
                  </div>
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 mr-1" />
                    {getAccessCount(selectedRole)} permissions
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockNavItems.map(navItem => {
                  const hasAccess = accessControl[selectedRole]?.includes(navItem.key);
                  
                  return (
                    <div
                      key={navItem.key}
                      className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                        hasAccess
                          ? 'border-green-200 bg-green-50'
                          : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                      }`}
                      onClick={() => toggleAccess(selectedRole, navItem.key)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center flex-1">
                          <span className="text-2xl mr-3">{navItem.icon}</span>
                          <div>
                            <h4 className="font-medium text-gray-900">{navItem.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">{navItem.description}</p>
                          </div>
                        </div>
                        <div className={`p-2 rounded-full ${
                          hasAccess 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-gray-200 text-gray-400'
                        }`}>
                          {hasAccess ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Access Preview Panel */}
            {showPreview && (
              <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Navigation Preview for {selectedRoleInfo.name}
                </h3>
                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="flex flex-col space-y-2">
                    {mockNavItems.map(navItem => {
                      const hasAccess = accessControl[selectedRole]?.includes(navItem.key);
                      
                      return (
                        <div
                          key={navItem.key}
                          className={`flex items-center p-3 rounded ${
                            hasAccess 
                              ? 'text-white bg-gray-800 hover:bg-gray-700' 
                              : 'text-gray-500 opacity-50 cursor-not-allowed'
                          }`}
                        >
                          <span className="mr-3">{navItem.icon}</span>
                          <span className="font-medium">{navItem.name}</span>
                          {!hasAccess && (
                            <X className="h-4 w-4 ml-auto text-red-500" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  This shows how the navigation would appear for users with the "{selectedRoleInfo.name}" role.
                  Grayed out items would be hidden or inaccessible.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}