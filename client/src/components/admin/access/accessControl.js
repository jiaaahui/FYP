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
  Edit3,
} from 'lucide-react';
import { db } from '../../../firebase';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  writeBatch,
  addDoc,
  serverTimestamp,
  deleteDoc,
} from 'firebase/firestore';

/**
 * RoleAccessControl (pretty UI)
 * - Restores the original, richer UI you had (roles list, preview, add/delete, save, reset).
 * - Loads roles from Firestore collection "Roles". Each document's id is treated as roleId.
 *   Document fields:
 *     - name: human-readable role name
 *     - permissions: array of permission keys (nav keys) e.g. ['dashboard','warehouse']
 * - Loads nav items from Firestore collection "nav_items" if present (doc id = nav key, fields name, description, icon optional).
 *   Falls back to built-in mockNavItems for development.
 * - Saves role permissions back into Roles collection and writes an audit record to "access_logs".
 *
 * Notes:
 * - The UI protects the 'admin' role from deletion.
 * - When roles use generated doc ids (like j4EGF...) this UI will show the stored name and use the doc id for persistence.
 * - For consistent sidebar behavior, ensure Roles.permissions values use your navigation keys (e.g. 'dashboard', 'warehouse').
 *
 * File location: client/src/components/admin/access/accessControl.js
 */

const mockNavItems = [
  { key: 'dashboard', name: 'Dashboard', description: 'Main dashboard overview', icon: '📊' },
  { key: 'schedule', name: 'Schedule', description: 'Schedule management and delivery planning', icon: '📅' },
  { key: 'info', name: 'Information', description: 'Product, team, and building data', icon: '📦' },
  { key: 'cases', name: 'Cases', description: 'Cases reported by employees', icon: '📈' },
  { key: 'access', name: 'Access Control', description: 'Role and permission management', icon: '🛡️' },
  { key: 'delivery', name: 'Delivery Schedule', description: 'Delivery schedule management', icon: '🚚' },
  { key: 'installation', name: 'Installation Schedule', description: 'Installation schedule management', icon: '🔧' },
  { key: 'warehouse', name: 'Warehouse Schedule', description: 'Warehouse loading and operations', icon: '🏭' },
];

export default function RoleAccessControl() {
  const [roles, setRoles] = useState([]); // [{ id, name, permissions }]
  const [navItems, setNavItems] = useState(mockNavItems);
  const [accessControl, setAccessControl] = useState({}); // { roleId: [perm,...] }
  const [originalAccessControl, setOriginalAccessControl] = useState({});
  const [selectedRole, setSelectedRole] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAddRole, setShowAddRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [error, setError] = useState(null);

  // Load roles and nav items from Firestore on mount
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // load nav_items if present
        try {
          const navSnap = await getDocs(collection(db, 'nav_items'));
          if (!navSnap.empty && mounted) {
            const items = navSnap.docs.map(d => ({ key: d.id, ...d.data() }));
            setNavItems(items);
          }
        } catch (navErr) {
          // ignore nav load errors; keep mock nav
          console.warn('nav_items load failed (using mockNavItems):', navErr);
        }

        // load Roles collection
        const rolesSnap = await getDocs(collection(db, 'Roles'));
        const loadedRoles = rolesSnap.docs.map(d => {
          const data = d.data() || {};
          return {
            id: d.id,
            name: data.name || d.id,
            permissions: Array.isArray(data.permissions) ? data.permissions : [],
            ...data,
          };
        });

        if (!mounted) return;

        setRoles(loadedRoles);

        // build accessControl map
        const map = {};
        loadedRoles.forEach(r => {
          // normalize permission keys to string values (don't mutate original stored values)
          map[r.id] = Array.isArray(r.permissions) ? r.permissions.slice() : [];
        });

        setAccessControl(map);
        setOriginalAccessControl(JSON.parse(JSON.stringify(map)));

        // select admin if present else first role
        const hasAdmin = loadedRoles.find(r => r.id === 'admin' || (r.name && r.name.toLowerCase() === 'admin'));
        setSelectedRole(hasAdmin ? (hasAdmin.id) : (loadedRoles[0] ? loadedRoles[0].id : null));
      } catch (err) {
        console.error('Failed to load roles or nav items:', err);
        setError('Failed to load role data. See console for details.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    setHasChanges(JSON.stringify(accessControl) !== JSON.stringify(originalAccessControl));
  }, [accessControl, originalAccessControl]);

  const toggleAccess = (roleId, navKey) => {
    setAccessControl(prev => ({
      ...prev,
      [roleId]: prev[roleId]?.includes(navKey)
        ? prev[roleId].filter(k => k !== navKey)
        : [...(prev[roleId] || []), navKey]
    }));
  };

  const saveChanges = async () => {
    setIsSaving(true);
    setError(null);
    try {
      // Write all changed role permissions to Roles collection
      const batch = writeBatch(db);
      Object.keys(accessControl).forEach(roleId => {
        const prev = originalAccessControl[roleId] || [];
        const curr = accessControl[roleId] || [];
        // only write when different
        if (JSON.stringify(prev) !== JSON.stringify(curr)) {
          const ref = doc(db, 'Roles', roleId);
          batch.set(ref, { permissions: curr }, { merge: true });
        }
      });
      await batch.commit();

      // Write audit log
      try {
        await addDoc(collection(db, 'access_logs'), {
          changes: accessControl,
          timestamp: serverTimestamp(),
        });
      } catch (logErr) {
        console.warn('Failed to write access log:', logErr);
      }

      setOriginalAccessControl(JSON.parse(JSON.stringify(accessControl)));
      setHasChanges(false);
      alert('Access control settings saved successfully!');
    } catch (err) {
      console.error('Failed to save access control:', err);
      setError('Failed to save changes. See console for details.');
    } finally {
      setIsSaving(false);
    }
  };

  const resetChanges = () => {
    setAccessControl(JSON.parse(JSON.stringify(originalAccessControl)));
    setHasChanges(false);
  };

  const addNewRole = async () => {
    const name = (newRoleName || '').trim();
    if (!name) return;
    setIsSaving(true);
    setError(null);
    try {
      // Use slug id for role doc id
      const slug = name.toLowerCase().replace(/\s+/g, '-');
      const roleRef = doc(db, 'Roles', slug);
      await setDoc(roleRef, { name, permissions: [] }, { merge: true });
      // refresh local list
      const newRole = { id: slug, name, permissions: [] };
      setRoles(prev => [...prev, newRole]);
      setAccessControl(prev => ({ ...prev, [slug]: [] }));
      setOriginalAccessControl(prev => ({ ...prev, [slug]: [] }));
      setSelectedRole(slug);
      setNewRoleName('');
      setShowAddRole(false);
    } catch (err) {
      console.error('Failed to add role:', err);
      setError('Failed to add role. See console for details.');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteRole = async (roleId) => {
    if (!roleId) return;
    // prevent deleting admin
    const roleObj = roles.find(r => r.id === roleId);
    const roleNameLower = (roleObj?.name || roleId).toString().toLowerCase();
    if (roleId === 'admin' || roleNameLower === 'admin') {
      alert('Cannot delete admin role');
      return;
    }

    if (!window.confirm(`Delete role "${roleObj?.name || roleId}"? This cannot be undone.`)) return;

    setIsSaving(true);
    setError(null);
    try {
      // delete doc from Roles
      await deleteDoc(doc(db, 'Roles', roleId));
      // update local state
      setRoles(prev => prev.filter(r => r.id !== roleId));
      setAccessControl(prev => {
        const copy = { ...prev };
        delete copy[roleId];
        return copy;
      });
      setOriginalAccessControl(prev => {
        const copy = { ...prev };
        delete copy[roleId];
        return copy;
      });
      if (selectedRole === roleId) {
        const first = roles.find(r => r.id !== roleId);
        setSelectedRole(first ? first.id : null);
      }
    } catch (err) {
      console.error('Failed to delete role:', err);
      setError('Failed to delete role. See console for details.');
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleInfo = (roleId) => {
    return roles.find(r => r.id === roleId) || { id: roleId, name: roleId, permissions: [], userCount: 0 };
  };

  const getAccessCount = (roleId) => {
    return accessControl[roleId]?.length || 0;
  };

  const selectedRoleInfo = selectedRole ? getRoleInfo(selectedRole) : null;

  // UI Rendering (original pretty UI, preserved look & feel)
  if (loading) {
    return <div className="p-6 text-gray-600">Loading access control...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
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
                    disabled={isSaving}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-60"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
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

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
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
                {roles.map(role => {
                  const roleId = role.id;
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
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditClick(role);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 text-gray-600 hover:bg-gray-50 rounded transition-all"
                                title="Edit role name"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>

                              {roleId !== 'admin' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteRole(roleId);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 rounded transition-all"
                                  title="Delete role"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{roleInfo.userCount || 0} users</p>
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
                    Access Permissions: {selectedRoleInfo ? selectedRoleInfo.name : '—'}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">{selectedRoleInfo ? selectedRoleInfo.description || '' : ''}</p>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {selectedRoleInfo ? (selectedRoleInfo.userCount || 0) : 0} users
                  </div>
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 mr-1" />
                    {selectedRole ? getAccessCount(selectedRole) : 0} permissions
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {navItems.map(navItem => {
                  const key = navItem.key;
                  const hasAccess = selectedRole ? (accessControl[selectedRole] || []).includes(key) : false;

                  return (
                    <div
                      key={key}
                      className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                        hasAccess
                          ? 'border-green-200 bg-green-50'
                          : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                      }`}
                      onClick={() => selectedRole && toggleAccess(selectedRole, key)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center flex-1">
                          <span className="text-2xl mr-3">{navItem.icon || '🔹'}</span>
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
                  Navigation Preview for {selectedRoleInfo ? selectedRoleInfo.name : ''}
                </h3>
                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="flex flex-col space-y-2">
                    {navItems.map(navItem => {
                      const hasAccess = selectedRole ? (accessControl[selectedRole] || []).includes(navItem.key) : false;

                      return (
                        <div
                          key={navItem.key}
                          className={`flex items-center p-3 rounded ${
                            hasAccess
                              ? 'text-white bg-gray-800 hover:bg-gray-700'
                              : 'text-gray-500 opacity-50 cursor-not-allowed'
                          }`}
                        >
                          <span className="mr-3">{navItem.icon || '🔹'}</span>
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
                  This shows how the navigation would appear for users with the "{selectedRoleInfo ? selectedRoleInfo.name : ''}" role.
                  Grayed out items would be hidden or inaccessible.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // helper inside to avoid re-defining in map closures
  function handleEditClick(role) {
    // simple prompt to edit role name inline (keeps UI compact)
    const newName = window.prompt('Edit role name:', role.name || '');
    if (!newName) return;
    const trimmed = newName.trim();
    if (trimmed === role.name) return;
    // update Firestore name field and local state
    updateDoc(doc(db, 'Roles', role.id), { name: trimmed })
      .then(() => {
        setRoles(prev => prev.map(r => r.id === role.id ? { ...r, name: trimmed } : r));
      })
      .catch(err => {
        console.error('Failed to update role name:', err);
        setError('Failed to update role name. See console for details.');
      });
  }
}