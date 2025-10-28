import React, { useEffect, useState } from 'react';
import { db } from '../../../firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { Shield, Users, Save, X } from 'lucide-react';

/**
 * AccessControl
 * - Loads Roles collection from Firestore
 * - Shows a list of roles and their permissions
 * - Allows editing a role's permissions and saving back to Firestore
 *
 * The UI matches the simpler design you provided in the second snippet.
 */

const ALL_PERMISSIONS = [
  'dashboard',
  'documents',
  'products',
  'users',
  'access',
  'delivery',
  'installation',
  'warehouse',
];

export default function AccessControl() {
  const [roles, setRoles] = useState([]); // [{ id, name, permissions }]
  const [loading, setLoading] = useState(true);
  const [editingRole, setEditingRole] = useState(null); // role object
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const fetchRoles = async () => {
      setLoading(true);
      setError(null);
      try {
        const snap = await getDocs(collection(db, 'Roles'));
        const data = snap.docs.map(d => {
          const raw = d.data() || {};
          return {
            id: d.id,
            name: raw.name || d.id,
            permissions: Array.isArray(raw.permissions) ? raw.permissions : [],
            // keep any extra fields if needed in future
            ...raw,
          };
        });
        if (!mounted) return;
        setRoles(data);
      } catch (err) {
        console.error('Failed to fetch Roles:', err);
        if (mounted) setError('Failed to load roles.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchRoles();
    return () => { mounted = false; };
  }, []);

  const handleEdit = (role) => {
    setEditingRole(role);
    setSelectedPermissions(Array.isArray(role.permissions) ? [...role.permissions] : []);
    setError(null);
  };

  const handleCancelEdit = () => {
    setEditingRole(null);
    setSelectedPermissions([]);
    setError(null);
  };

  const handleCheckboxChange = (perm) => {
    setSelectedPermissions(prev => (prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]));
  };

  const handleSave = async () => {
    if (!editingRole) return;
    setSaving(true);
    setError(null);
    try {
      const roleRef = doc(db, 'Roles', editingRole.id);
      await updateDoc(roleRef, {
        permissions: selectedPermissions,
      });

      // update local state
      setRoles(prev => prev.map(r => (r.id === editingRole.id ? { ...r, permissions: selectedPermissions } : r)));
      setEditingRole(null);
      setSelectedPermissions([]);
    } catch (err) {
      console.error('Failed to save role permissions:', err);
      setError('Failed to save changes. See console for details.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-gray-600">Loading roles...</div>;
  }

  return (
    <div className="p-6 bg-white shadow rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Shield className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">Access Control</h2>
        </div>
        <div className="text-sm text-gray-500">Manage role permissions</div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded">{error}</div>
      )}

      {editingRole ? (
        <div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Editing Role: <span className="text-blue-600">{editingRole.name}</span></h3>
            <p className="text-sm text-gray-500">Toggle permissions then click Save.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {ALL_PERMISSIONS.map(perm => (
              <label key={perm} className="flex items-center space-x-3 p-2 border rounded">
                <input
                  type="checkbox"
                  checked={selectedPermissions.includes(perm)}
                  onChange={() => handleCheckboxChange(perm)}
                />
                <span className="capitalize text-sm">{perm.replace('-', ' ')}</span>
              </label>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60 flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? 'Saving...' : 'Save'}</span>
            </button>
            <button
              onClick={handleCancelEdit}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 flex items-center space-x-2"
            >
              <X className="h-4 w-4" />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="overflow-auto">
          <table className="min-w-full table-auto border">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="py-2 px-4 border-b">Role Name</th>
                <th className="py-2 px-4 border-b">Permissions</th>
                <th className="py-2 px-4 border-b">Action</th>
              </tr>
            </thead>
            <tbody>
              {roles.map(role => (
                <tr key={role.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b align-top">
                    <div className="font-medium">{role.name}</div>
                    <div className="text-xs text-gray-500 mt-1 break-words">{role.id}</div>
                  </td>
                  <td className="py-2 px-4 border-b align-top">
                    <div className="text-sm text-gray-700">
                      {Array.isArray(role.permissions) && role.permissions.length > 0
                        ? role.permissions.join(', ')
                        : <span className="text-gray-400">No permissions</span>
                      }
                    </div>
                  </td>
                  <td className="py-2 px-4 border-b align-top">
                    <button
                      onClick={() => handleEdit(role)}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {roles.length === 0 && (
            <div className="mt-4 text-gray-600">No roles found in the Roles collection.</div>
          )}
        </div>
      )}
    </div>
  );
}