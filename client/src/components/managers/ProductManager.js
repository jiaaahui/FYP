import React, { useState, useEffect, useCallback } from 'react';
import { useInformationService } from '../../services/informationService';
import DataTable from '../common/DataTable';
import Modal from '../common/Modal';

function ProductManager({ setError, setLoading }) {
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    ProductID: '',
    ProductName: '',
    Category: 'Appliance',
    PackageLengthCM: 0,
    PackageWidthCM: 0,
    PackageHeightCM: 0,
    EstimatedInstallationTimeMin: 0,
    EstimatedInstallationTimeMax: 0,
    InstallationTypeName: 'Basic',
    InstallerTeamRequiredFlag: false,
    FragileFlag: false,
    NoLieDownFlag: false,
    DismantleRequiredFlag: false,
    DismantleExtraTime: 0
  });

  const informationService = useInformationService();

  const categories = ['Appliance', 'Furniture', 'Electronics', 'Mattress', 'Other'];
  const installationTypes = ['Basic', 'Complex', 'Professional', 'None'];

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await informationService.getProducts();
      setProducts(data);
      setError('');
    } catch (error) {
      setError('Error loading products: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [informationService, setError, setLoading]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const calculateVolume = (length, width, height) => {
    return ((length * width * height) / 1000000).toFixed(3); // Convert cm³ to m³
  };

  const handleAdd = () => {
    setEditingProduct(null);
    const nextId = Math.max(...products.map(p => parseInt(p.ProductID.split('_')[1]) || 0), 0) + 1;
    setFormData({
      ProductID: `PRD_${String(nextId).padStart(5, '0')}`,
      ProductName: '',
      Category: 'Appliance',
      PackageLengthCM: 0,
      PackageWidthCM: 0,
      PackageHeightCM: 0,
      EstimatedInstallationTimeMin: 0,
      EstimatedInstallationTimeMax: 0,
      InstallationTypeName: 'Basic',
      InstallerTeamRequiredFlag: false,
      FragileFlag: false,
      NoLieDownFlag: false,
      DismantleRequiredFlag: false,
      DismantleExtraTime: 0
    });
    setIsModalOpen(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData(product);
    setIsModalOpen(true);
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        setLoading(true);
        await informationService.deleteProduct(productId);
        await loadProducts();
        setError('');
      } catch (error) {
        setError('Error deleting product: ' + error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSave = async () => {
    if (!formData.ProductName.trim()) {
      setError('Product Name is required');
      return;
    }

    try {
      setLoading(true);
      if (editingProduct) {
        await informationService.updateProduct(formData.ProductID, formData);
      } else {
        await informationService.createProduct(formData);
      }
      setIsModalOpen(false);
      await loadProducts();
      setError('');
    } catch (error) {
      setError('Error saving product: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { 
      key: 'ProductID', 
      label: 'Product ID', 
      sortable: true,
      render: (value) => <span className="id-badge">{value}</span>
    },
    { 
      key: 'ProductName', 
      label: 'Product Name', 
      sortable: true,
      render: (value) => <span className="product-name">{value}</span>
    },
    {
      key: 'Category',
      label: 'Category',
      sortable: true,
      render: (value) => (
        <span className={`category-badge category-${value.toLowerCase()}`}>{value}</span>
      )
    },
    {
      key: 'dimensions',
      label: 'Dimensions (L×W×H cm)',
      render: (value, product) => (
        <div className="dimensions-info">
          <span className="dimensions-text">
            {product.PackageLengthCM}×{product.PackageWidthCM}×{product.PackageHeightCM}
          </span>
          <span className="volume-text">
            {calculateVolume(product.PackageLengthCM, product.PackageWidthCM, product.PackageHeightCM)} m³
          </span>
        </div>
      )
    },
    {
      key: 'EstimatedInstallationTimeMin',
      label: 'Installation Time',
      render: (value, product) => (
        <span className="installation-time">
          {product.EstimatedInstallationTimeMin}-{product.EstimatedInstallationTimeMax} min
        </span>
      )
    },
    {
      key: 'InstallationTypeName',
      label: 'Installation Type',
      render: (value) => (
        <span className={`installation-badge installation-${value.toLowerCase()}`}>{value}</span>
      )
    },
    {
      key: 'flags',
      label: 'Special Requirements',
      render: (value, product) => (
        <div className="product-flags">
          {product.InstallerTeamRequiredFlag && (
            <span className="flag-badge installer">👷 Installer Required</span>
          )}
          {product.FragileFlag && (
            <span className="flag-badge fragile">🔸 Fragile</span>
          )}
          {product.NoLieDownFlag && (
            <span className="flag-badge no-lie">⬆️ No Lie Down</span>
          )}
          {product.DismantleRequiredFlag && (
            <span className="flag-badge dismantle">🔧 Dismantle Required</span>
          )}
        </div>
      )
    }
  ];

  const actions = [
    {
      label: 'Edit',
      icon: '✏️',
      onClick: handleEdit,
      variant: 'primary'
    },
    {
      label: 'Delete',
      icon: '🗑️',
      onClick: (product) => handleDelete(product.ProductID),
      variant: 'danger'
    }
  ];

  const productStats = {
    total: products.length,
    appliances: products.filter(p => p.Category === 'Appliance').length,
    furniture: products.filter(p => p.Category === 'Furniture').length,
    fragile: products.filter(p => p.FragileFlag).length,
    installerRequired: products.filter(p => p.InstallerTeamRequiredFlag).length
  };

  return (
    <div className="product-manager">
      <div className="manager-header">
        <div className="header-content">
          <h2>📦 Product Management</h2>
          <p>Manage product catalog and delivery specifications</p>
        </div>
        <button className="btn btn-primary" onClick={handleAdd}>
          <span className="btn-icon">➕</span>
          Add New Product
        </button>
      </div>

      <div className="data-summary">
        <div className="summary-card">
          <div className="summary-value">{productStats.total}</div>
          <div className="summary-label">Total Products</div>
        </div>
        <div className="summary-card">
          <div className="summary-value">{productStats.appliances}</div>
          <div className="summary-label">Appliances</div>
        </div>
        <div className="summary-card">
          <div className="summary-value">{productStats.fragile}</div>
          <div className="summary-label">Fragile Items</div>
        </div>
        <div className="summary-card">
          <div className="summary-value">{productStats.installerRequired}</div>
          <div className="summary-label">Need Installer</div>
        </div>
      </div>

      <DataTable
        data={products}
        columns={columns}
        actions={actions}
        searchable={true}
        searchPlaceholder="Search products..."
        emptyMessage="No products found"
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        size="large"
      >
        <div className="form-container">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Product ID</label>
              <input
                type="text"
                className="form-input"
                value={formData.ProductID}
                disabled
              />
            </div>
            <div className="form-group">
              <label className="form-label">Product Name *</label>
              <input
                type="text"
                className="form-input"
                value={formData.ProductName}
                onChange={(e) => setFormData({ ...formData, ProductName: e.target.value })}
                placeholder="Enter product name"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={formData.Category}
                onChange={(e) => setFormData({ ...formData, Category: e.target.value })}
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Installation Type</label>
              <select
                className="form-select"
                value={formData.InstallationTypeName}
                onChange={(e) => setFormData({ ...formData, InstallationTypeName: e.target.value })}
              >
                {installationTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-section">
            <h4>Package Dimensions (cm)</h4>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Length (cm)</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.PackageLengthCM}
                  onChange={(e) => setFormData({ ...formData, PackageLengthCM: parseInt(e.target.value) || 0 })}
                  min="0"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Width (cm)</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.PackageWidthCM}
                  onChange={(e) => setFormData({ ...formData, PackageWidthCM: parseInt(e.target.value) || 0 })}
                  min="0"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Height (cm)</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.PackageHeightCM}
                  onChange={(e) => setFormData({ ...formData, PackageHeightCM: parseInt(e.target.value) || 0 })}
                  min="0"
                />
              </div>
            </div>
            <div className="volume-display">
              <strong>Calculated Volume: </strong>
              {calculateVolume(formData.PackageLengthCM, formData.PackageWidthCM, formData.PackageHeightCM)} m³
            </div>
          </div>

          <div className="form-section">
            <h4>Installation Time (minutes)</h4>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Minimum Time</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.EstimatedInstallationTimeMin}
                  onChange={(e) => setFormData({ ...formData, EstimatedInstallationTimeMin: parseInt(e.target.value) || 0 })}
                  min="0"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Maximum Time</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.EstimatedInstallationTimeMax}
                  onChange={(e) => setFormData({ ...formData, EstimatedInstallationTimeMax: parseInt(e.target.value) || 0 })}
                  min="0"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Dismantle Extra Time</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.DismantleExtraTime}
                  onChange={(e) => setFormData({ ...formData, DismantleExtraTime: parseInt(e.target.value) || 0 })}
                  min="0"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h4>Special Requirements</h4>
            <div className="checkbox-grid">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.InstallerTeamRequiredFlag}
                  onChange={(e) => setFormData({ ...formData, InstallerTeamRequiredFlag: e.target.checked })}
                />
                <span className="checkbox-text">👷 Installer Team Required</span>
              </label>
              
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.FragileFlag}
                  onChange={(e) => setFormData({ ...formData, FragileFlag: e.target.checked })}
                />
                <span className="checkbox-text">🔸 Fragile Item</span>
              </label>
              
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.NoLieDownFlag}
                  onChange={(e) => setFormData({ ...formData, NoLieDownFlag: e.target.checked })}
                />
                <span className="checkbox-text">⬆️ Cannot Lie Down</span>
              </label>
              
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.DismantleRequiredFlag}
                  onChange={(e) => setFormData({ ...formData, DismantleRequiredFlag: e.target.checked })}
                />
                <span className="checkbox-text">🔧 Dismantle Required</span>
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button 
              className="btn btn-primary" 
              onClick={handleSave}
              disabled={!formData.ProductName.trim()}
            >
              {editingProduct ? 'Update' : 'Create'} Product
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default ProductManager;