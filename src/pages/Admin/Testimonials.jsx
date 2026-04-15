import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaStar, FaTrash, FaPlus } from 'react-icons/fa';
import Sidebar from '../../components/Admin/Sidebar';
import { getTestimonials, addTestimonial, deleteTestimonial } from '../../services/firestore';
import toast from 'react-hot-toast';

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', review: '', rating: 5 });

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    const data = await getTestimonials();
    setTestimonials(data);
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.review) {
      toast.error('Please fill all fields');
      return;
    }
    await addTestimonial(formData);
    toast.success('Testimonial added!');
    setShowForm(false);
    setFormData({ name: '', review: '', rating: 5 });
    await fetchTestimonials();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this testimonial?')) {
      await deleteTestimonial(id);
      toast.success('Deleted');
      await fetchTestimonials();
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Manage Testimonials</h1>
          <button
            onClick={() => setShowForm(true)}
            className="bg-primary text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2"
          >
            <FaPlus /> Add Testimonial
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : testimonials.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
            <p className="text-gray-500">No testimonials yet. Add your first one!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex mb-2">
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className={i < testimonial.rating ? "text-yellow-400" : "text-gray-300"} />
                      ))}
                    </div>
                    <h3 className="font-semibold text-gray-800">{testimonial.name}</h3>
                  </div>
                  <button
                    onClick={() => handleDelete(testimonial.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <FaTrash />
                  </button>
                </div>
                <p className="text-gray-600 italic">"{testimonial.review}"</p>
                <p className="text-xs text-gray-400 mt-4">
                  {testimonial.createdAt?.toDate().toLocaleDateString()}
                </p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Add Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold mb-4">Add Testimonial</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Customer Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
                <textarea
                  placeholder="Review"
                  value={formData.review}
                  onChange={(e) => setFormData({ ...formData, review: e.target.value })}
                  rows="4"
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
                <div>
                  <label className="block mb-2">Rating: {formData.rating} stars</label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="flex-1 bg-primary text-white py-2 rounded-lg font-semibold">
                    Add
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-gray-200 py-2 rounded-lg">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Testimonials;