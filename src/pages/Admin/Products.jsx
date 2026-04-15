import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaWhatsapp, FaEye, FaSearch, FaFilter } from 'react-icons/fa';
import Sidebar from '../../components/Admin/Sidebar';
import ProductForm from '../../components/Admin/ProductForm';
import { getProducts, deleteProduct, createProduct, updateProduct } from '../../services/firestore';
import toast from 'react-hot-toast';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchTerm, categoryFilter, products]);

  const fetchProducts = async () => {
    const data = await getProducts();
    setProducts(data);
    setFilteredProducts(data);
    setLoading(false);
  };

  const filterProducts = () => {
    let filtered = [...products];
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(p => p.category === categoryFilter);
    }
    
    setFilteredProducts(filtered);
  };

  const handleCreate = async (productData, images) => {
    await createProduct(productData, images);
    await fetchProducts();
    toast.success('Product created successfully!');
  };

  const handleUpdate = async (productData, newImages) => {
    await updateProduct(editingProduct.id, productData, newImages);
    await fetchProducts();
    toast.success('Product updated successfully!');
  };

  const handleDelete = async (product) => {
    if (window.confirm(`Delete "${product.name}"? This action cannot be undone.`)) {
      await deleteProduct(product.id, product.images);
      toast.success('Product deleted');
      await fetchProducts();
    }
  };

  const getWhatsAppLink = (product) => {
    const message = `Hello Jeech Baby Shop,%0AI want to order:%0AProduct: ${product.name}%0APrice: KES ${product.price.toLocaleString()}`;
    return `https://wa.me/254705797336?text=${message}`;
  };

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'clothes', name: 'Baby Clothes' },
    { id: 'shoes', name: 'Baby Shoes' },
    { id: 'blankets', name: 'Blankets' },
    { id: 'toys', name: 'Toys' },
    { id: 'accessories', name: 'Accessories' },
  ];

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center space-x-3">
            <img 
              src="/logo.png" 
              alt="Jeech Baby Shop Logo" 
              className="h-10 w-auto object-contain"
            />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Manage Products</h1>
              <p className="text-sm text-gray-500">{filteredProducts.length} products total</p>
            </div>
          </div>
          <button
            onClick={() => {
              setEditingProduct(null);
              setShowForm(true);
            }}
            className="bg-primary text-white px-4 py-2 rounded-xl font-semibold flex items-center gap-2 hover:bg-opacity-90 transition-all shadow-md hover:shadow-lg"
          >
            <FaPlus /> Add New Product
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            
            {/* Category Filter */}
            <div className="relative">
              <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Products Table - Mobile Responsive */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <p className="text-gray-500 text-lg">No products found</p>
            <p className="text-gray-400 text-sm mt-2">Click "Add New Product" to get started</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View (hidden on mobile) */}
            <div className="hidden md:block bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left p-4 font-semibold text-gray-600">Image</th>
                      <th className="text-left p-4 font-semibold text-gray-600">Name</th>
                      <th className="text-left p-4 font-semibold text-gray-600">Price</th>
                      <th className="text-left p-4 font-semibold text-gray-600">Category</th>
                      <th className="text-left p-4 font-semibold text-gray-600">Featured</th>
                      <th className="text-left p-4 font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <motion.tr
                        key={product.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-b hover:bg-gray-50 transition-colors"
                      >
                        <td className="p-4">
                          <img
                            src={product.images?.[0] || 'https://via.placeholder.com/50'}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                        </td>
                        <td className="p-4 font-medium text-gray-800 max-w-xs truncate">{product.name}</td>
                        <td className="p-4 text-primary font-semibold">KES {product.price.toLocaleString()}</td>
                        <td className="p-4">
                          <span className="px-2 py-1 bg-pink-100 text-primary rounded-full text-xs capitalize">
                            {product.category}
                          </span>
                        </td>
                        <td className="p-4">
                          {product.featured ? '⭐ Yes' : 'No'}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <a
                              href={getWhatsAppLink(product)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-500 hover:text-green-600 p-2 hover:bg-green-50 rounded-lg transition-all"
                              title="Test WhatsApp Order"
                            >
                              <FaWhatsapp />
                            </a>
                            <a
                              href={`/product/${product.id}`}
                              target="_blank"
                              className="text-blue-500 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-lg transition-all"
                              title="View Product"
                            >
                              <FaEye />
                            </a>
                            <button
                              onClick={() => {
                                setEditingProduct(product);
                                setShowForm(true);
                              }}
                              className="text-yellow-500 hover:text-yellow-600 p-2 hover:bg-yellow-50 rounded-lg transition-all"
                              title="Edit"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDelete(product)}
                              className="text-red-500 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-all"
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card View (visible only on phones) */}
            <div className="md:hidden space-y-4">
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl shadow-lg p-4"
                >
                  <div className="flex gap-4">
                    <img
                      src={product.images?.[0] || 'https://via.placeholder.com/80'}
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-800 text-lg">{product.name}</h3>
                          <p className="text-primary font-bold text-xl">KES {product.price.toLocaleString()}</p>
                        </div>
                        {product.featured && (
                          <span className="text-yellow-500 text-sm">⭐ Featured</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="px-2 py-1 bg-pink-100 text-primary rounded-full text-xs capitalize">
                          {product.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 mt-4 pt-3 border-t">
                    <a
                      href={getWhatsAppLink(product)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-500 hover:text-green-600 p-2"
                      title="Test WhatsApp Order"
                    >
                      <FaWhatsapp size={18} />
                    </a>
                    <a
                      href={`/product/${product.id}`}
                      target="_blank"
                      className="text-blue-500 hover:text-blue-600 p-2"
                      title="View Product"
                    >
                      <FaEye size={18} />
                    </a>
                    <button
                      onClick={() => {
                        setEditingProduct(product);
                        setShowForm(true);
                      }}
                      className="text-yellow-500 hover:text-yellow-600 p-2"
                      title="Edit"
                    >
                      <FaEdit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(product)}
                      className="text-red-500 hover:text-red-600 p-2"
                      title="Delete"
                    >
                      <FaTrash size={18} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {showForm && (
          <ProductForm
            product={editingProduct}
            onSubmit={editingProduct ? handleUpdate : handleCreate}
            onClose={() => {
              setShowForm(false);
              setEditingProduct(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Products;