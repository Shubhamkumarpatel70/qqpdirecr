import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import api from '../utils/axios';
import {
  FiMenu, FiX, FiHome, FiPlusSquare, FiUsers,
  FiFileText, FiLogOut, FiSearch, FiBook, FiMail, FiMessageSquare, FiSettings
} from 'react-icons/fi';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Function to refresh data
  const refreshData = async () => {
    try {
      const [postsRes, usersRes, searchRes, pyqRes, coursesRes, yearsRes, semestersRes, subjectsRes, contactRes, feedbackRes, collegesRes, branchesRes, batchesRes] = await Promise.all([
        api.get('/api/posts'), // All posts
        api.get('/api/users'), // All users
        api.get('/api/search/most-searched'), // Search analytics
        api.get('/api/pyqs'), // Previous Year Questions
        api.get('/api/academic/programs'), // Programs
        api.get('/api/academic/years'), // Years
        api.get('/api/academic/semesters'), // Semesters
        api.get('/api/academic/subjects'), // Subjects
        api.get('/api/contact'), // Contact form submissions
        api.get('/api/feedback'), // User feedback
        api.get('/api/academic/colleges'), // Colleges
        api.get('/api/academic/branches'), // Branches
        api.get('/api/academic/batches') // Batches
      ]);
      setPosts(postsRes.data);
      setUsers(usersRes.data);
      setMostSearched(searchRes.data);
      setPyqQuestions(pyqRes.data);
      setCourses(coursesRes.data);
      setYears(yearsRes.data);
      setSemesters(semestersRes.data);
      setSubjects(subjectsRes.data);
      setContactResponses(contactRes.data);
      setFeedbackResponses(feedbackRes.data);
      setColleges(collegesRes.data);
      setBranches(branchesRes.data);
      setBatches(batchesRes.data);
      setStats({
        totalPosts: postsRes.data.length,
        totalUsers: usersRes.data.length
      });
    } catch (err) {
      console.error('Failed to refresh data:', err);
      setError('Failed to refresh data');
    }
  };
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [courseCategory, setCourseCategory] = useState('btech');
  const [postStatus, setPostStatus] = useState('pending');
  const [posts, setPosts] = useState([]);
  const [editingPost, setEditingPost] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editCourseCategory, setEditCourseCategory] = useState('btech');
  const [editFile, setEditFile] = useState(null);
  const [editStatus, setEditStatus] = useState('pending');
  const [editLink, setEditLink] = useState('');
  const [users, setUsers] = useState([]);
  const [activeUsers, setActiveUsers] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalUsers: 0
  });
  const [academicData, setAcademicData] = useState({
    college: '',
    program: '',
    branch: '',
    batch: '',
    subject: ''
  });

  // New state for popup modal for user uploaded status update
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusModalPost, setStatusModalPost] = useState(null);
  const [statusModalStatus, setStatusModalStatus] = useState('');

  // Modal UI component for status update popup
  const StatusUpdateModal = () => {
    if (!statusModalOpen || !statusModalPost) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white rounded-lg p-6 w-96 shadow-lg relative">
          <h3 className="text-lg font-semibold mb-4">Update Post Status</h3>
          <p className="mb-2"><strong>Title:</strong> {statusModalPost.title}</p>
          <p className="mb-4"><strong>Uploaded by:</strong> {statusModalPost.user?.name || 'Unknown'}</p>
          <select
            value={statusModalStatus}
            onChange={(e) => setStatusModalStatus(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mb-4"
          >
            <option value="pending">Pending</option>
            <option value="coming soon">Coming Soon</option>
            <option value="approved">Approved</option>
          </select>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setStatusModalOpen(false)}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              onClick={saveStatusModal}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save
            </button>
          </div>
          <button
            onClick={() => setStatusModalOpen(false)}
            className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>
      </div>
    );
  };

  // New state for most searched terms and PYQ tab
  const [mostSearched, setMostSearched] = useState([]);
  const [pyqQuestions, setPyqQuestions] = useState([]);

  // New states for dynamic form data for Add PYQ
  const [courses, setCourses] = useState([]);
  const [years, setYears] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);

  // New states for colleges, branches, batches for Create Post form
  const [colleges, setColleges] = useState([]);
  const [branches, setBranches] = useState([]);
  const [batches, setBatches] = useState([]);

  // New state variables for selected college, branch, batch in Create Post form
  const [selectedCollege, setSelectedCollege] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');

  // State for contact responses
  const [contactResponses, setContactResponses] = useState([]);
  const [feedbackResponses, setFeedbackResponses] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await refreshData();
      } catch (err) {
        setError('Failed to fetch data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Socket connection
    const API_URL = process.env.REACT_APP_API_URL ||
      'https://qqpdirecr-backend.onrender.com';
    const socket = io(API_URL, {
      withCredentials: true
    });

    socket.on('activeUsers', (count) => {
      setActiveUsers(count);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Refresh data when switching tabs
  useEffect(() => {
    refreshData();
  }, [activeTab]);

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Open status update modal for user uploaded post
  const openStatusModal = (post) => {
    setStatusModalPost(post);
    setStatusModalStatus(post.status);
    setStatusModalOpen(true);
  };

  // Close status update modal
  const closeStatusModal = () => {
    setStatusModalOpen(false);
    setStatusModalPost(null);
    setStatusModalStatus('');
  };

  // Save status update from modal
  const saveStatusModal = async () => {
    if (!statusModalPost) return;
    try {
      await api.put(`/api/posts/${statusModalPost._id}/status`, { status: statusModalStatus });
      setPosts(posts.filter(post => post && post._id).map(post =>
        post._id === statusModalPost._id ? { ...post, status: statusModalStatus } : post
      ));
      closeStatusModal();
    } catch (err) {
      console.error('Error updating post status:', err);
      setError('Failed to update post status');
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('title', postTitle);
    formData.append('content', postContent);
    formData.append('courseCategory', courseCategory);
    formData.append('college', selectedCollege);
    formData.append('branch', selectedBranch);
    formData.append('batch', selectedBatch);
    formData.append('status', postStatus || 'approved'); // Default to 'approved' if not set
    if (e.target.file.files[0]) {
      formData.append('file', e.target.file.files[0]); // Append file if selected
    }
    formData.append('link', e.target.link.value); // Append link if provided

    try {
      const response = await api.post('/api/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess('Post created successfully!');
      setPostTitle('');
      setPostContent('');
      setPostStatus('approved'); // Reset to default for next post
      setPosts([...posts, response.data]);
      setActiveTab('questions');
    } catch (err) {
      console.error('Error creating post:', err);
      setError(err.response?.data?.error || 'Failed to create post. Please try again.');
    }
  };

  const startEditPost = (post) => {
    setEditingPost(post._id);
    setEditTitle(post.title);
    setEditContent(post.content);
    setEditCourseCategory(post.courseCategory);
    setEditLink(post.link || '');
    setEditStatus(post.status);
    setEditFile(null);
  };

  const cancelEditPost = () => {
    setEditingPost(null);
    setEditTitle('');
    setEditContent('');
    setEditCourseCategory('btech');
    setEditStatus('pending');
    setEditLink('');
    setEditFile(null);
  };

  const submitEditPost = async () => {
    try {
      const formData = new FormData();
      formData.append('title', editTitle);
      formData.append('content', editContent);
      formData.append('courseCategory', editCourseCategory);
      if (editFile) {
        formData.append('file', editFile);
      }
      formData.append('link', editLink);

      formData.append('status', editStatus);

      const response = await api.put(`/api/posts/${editingPost}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setPosts(posts.map(post => post._id === editingPost ? response.data : post));
      cancelEditPost();
    } catch (error) {
      console.error('Failed to update post:', error);
      setError('Failed to update post');
    }
  };

  const handleAcademicDataChange = (e) => {
    const { name, value } = e.target;
    setAcademicData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddAcademicData = async (type) => {
    const value = academicData[type];
    if (!value.trim()) {
      setError(`Please enter a value for ${type}.`);
      return;
    }

    try {
      // Fix pluralization for branch and batch
      let endpoint = '';
      if (type === 'program') {
        endpoint = 'courses';
      } else if (type === 'branch') {
        endpoint = 'branches';
      } else if (type === 'batch') {
        endpoint = 'batches';
      } else {
        endpoint = `${type}s`;
      }
      await api.post(`/api/academic/${endpoint}`, { name: value });
      setSuccess(`${type.charAt(0).toUpperCase() + type.slice(1)} added successfully!`);
      setAcademicData(prev => ({ ...prev, [type]: '' }));
      setError('');
      // Refresh data to update dropdowns immediately
      await refreshData();
    } catch (err) {
      console.error(`Error adding ${type}:`, err);
      setError(err.response?.data?.error || `Failed to add ${type}.`);
      setSuccess('');
    }
  };

  const handlePostUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name);

    try {
      const response = await api.post('/api/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setPosts([...posts, response.data]);
    } catch (err) {
      setError('Failed to upload post');
      console.error(err);
    }
  };

  const handleDeletePost = async (id) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await api.delete(`/api/posts/${id}`);
        setPosts(posts.filter(post => post._id !== id));
      } catch (err) {
        console.error('Error deleting post:', err);
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/api/posts/${id}/status`, { status: newStatus });
      setPosts(posts.map(post =>
        post._id === id ? { ...post, status: newStatus } : post
      ));
    } catch (err) {
      console.error('Error updating post status:', err);
      setError('Failed to update post status');
    }
  };

  // Fix for status select not updating correctly in user-uploaded posts
  // Removed duplicate handleStatusChange to avoid redeclaration error

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/api/users/${id}`);
        setUsers(users.filter(user => user._id !== id));
      } catch (err) {
        console.error('Error deleting user:', err);
      }
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-4">Statistics</h3>
              <div className="space-y-4">
                <div className="flex justify-between p-4 bg-blue-50 rounded">
                  <span>Total Posts</span>
                  <span className="font-bold">{stats.totalPosts}</span>
                </div>
                <div className="flex justify-between p-4 bg-green-50 rounded">
                  <span>Total Users</span>
                  <span className="font-bold">{stats.totalUsers}</span>
                </div>
                <div className="flex justify-between p-4 bg-yellow-50 rounded">
                  <span>Active Users</span>
                  <span className="font-bold">{activeUsers}</span>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
              {posts.filter(post => post && post._id).slice(0, 5).map(post => (
                <div key={post._id} className="mb-4 pb-4 border-b last:border-0">
                  <h4 className="font-medium">{post.title}</h4>
                  <p className="text-sm text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      case 'create-post':
        return (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">Create New Post</h3>
        <form onSubmit={handlePostSubmit} className="space-y-4">
              {error && <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>}
              {success && <div className="p-3 bg-green-100 text-green-700 rounded">{success}</div>}
              <div>
                <label className="block mb-1">Course Category</label>
                <select
                  value={courseCategory}
                  onChange={(e) => setCourseCategory(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="btech">BTech</option>
                  <option value="bca">BCA</option>
                  <option value="mca">MCA</option>
                  <option value="mba">MBA</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block mb-1">College</label>
                <select
                  value={selectedCollege}
                  onChange={(e) => setSelectedCollege(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Select College</option>
                  {colleges.map((college) => (
                    <option key={college} value={college}>{college}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1">Branch</label>
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Select Branch</option>
                  {branches.map((branch) => (
                    <option key={branch} value={branch}>{branch}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1">Batch</label>
                <select
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Select Batch</option>
                  {batches.map((batch) => (
                    <option key={batch} value={batch}>{batch}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1">Status</label>
                <select
                  value={postStatus}
                  onChange={(e) => setPostStatus(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                >                  
                  <option value="pending">Pending</option>
                  <option value="coming soon">Coming Soon</option>
                  <option value="approved">Approved</option>
                </select>
              </div>
              <div>
                <label className="block mb-1">Post Title</label>
                <input
                  type="text"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder="Post Title"
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block mb-1">Post Content</label>
                <textarea
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="Post Content"
                  className="w-full p-2 border rounded"
                  rows="5"
                  required
                />
              </div>
              <div>
                <label className="block mb-1">Upload File</label>
                <input
                  type="file"
                  name="file"
                  onChange={handlePostUpload}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block mb-1">Add Link</label>
                <input
                  type="url"
                  name="link"
                  placeholder="https://example.com"
                  className="w-full p-2 border rounded"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Create Post
              </button>
            </form>
          </div>
        );
      case 'questions':
        return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">Quiz</h3>
          <button
            onClick={() => setActiveTab('create-post')}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            <FiPlusSquare className="mr-2" />
            Add New Post
          </button>
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.filter(post => post && post._id).map((post) => (
                  <div key={post._id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">                  
                    <>
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="inline-block px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded">
                            {post.courseCategory?.toUpperCase() || 'OTHER'}
                          </span>
                          <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ml-2 ${
                            post.status === 'approved' ? 'bg-green-100 text-green-800' :
                            post.status === 'coming soon' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {post.status === 'approved' ? 'Approved' :
                             post.status === 'coming soon' ? 'Coming Soon' :
                             'Pending'}
                          </span>
                          <h4 className="mt-2 font-semibold text-lg">{post.title}</h4>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEditPost(post)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Update
                          </button>
                          <button
                            onClick={() => handleDeletePost(post._id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <p className="mt-2 text-gray-600">{post.content}</p>
                      <div className="mt-2 space-x-4">
                        {post.file && (
                          <a href={`${process.env.REACT_APP_API_URL || 'https://qqpdirecr-backend.onrender.com'}/uploads/${post.file}`} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                            View File
                          </a>
                        )}
                        {post.link && (
                          <a href={post.link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                            View Link
                          </a>
                        )}
                      </div>
                      <div className="mt-4 flex justify-between items-center">
                        <div className="text-sm text-gray-500">
                          By: {post.user?.name || 'Unknown'} | Posted on: {new Date(post.createdAt).toLocaleDateString()}
                        </div>
                        <button
                          onClick={() => openStatusModal(post)}
                          className="text-sm text-indigo-600 hover:underline"
                        >
                          Update Status
                        </button>

                        {post.status === 'coming soon' && (
                          <span className="ml-2 px-3 py-1 bg-yellow-300 text-yellow-900 text-sm rounded">
                            Coming Soon
                          </span>
                        )}
                      </div>
                    </>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
      case 'user-uploaded':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">User Uploaded Posts</h3>
            </div>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.filter(post => post && post._id && post.user?.role !== 'admin').map((post) => (
                  <div key={post._id} className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="inline-block px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded">
                            {post.courseCategory?.toUpperCase() || 'OTHER'}
                          </span>
                          <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ml-2 ${
                            post.status === 'approved' ? 'bg-green-100 text-green-800' :
                            post.status === 'coming soon' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {post.status === 'approved' ? 'Approved' :
                             post.status === 'coming soon' ? 'Coming Soon' :
                             'Pending'}
                          </span>
                          <h4 className="mt-2 font-semibold text-lg">{post.title}</h4>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEditPost(post)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Update
                          </button>
                          <button
                            onClick={() => handleDeletePost(post._id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <p className="mt-2 text-gray-600">{post.content}</p>
                      <div className="mt-2 space-x-4">
                        {post.file && (
                          <a href={`${process.env.REACT_APP_API_URL || 'https://qqpdirecr-backend.onrender.com'}/uploads/${post.file}`} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                            View File
                          </a>
                        )}
                        {post.link && (
                          <a href={post.link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                            View Link
                          </a>
                        )}
                      </div>
                      <div className="mt-4 flex justify-between items-center">
                        <div className="text-sm text-gray-500">
                          By: {post.user?.name || 'Unknown'} | Posted on: {new Date(post.createdAt).toLocaleDateString()}
                        </div>
                        <button
                          onClick={() => openStatusModal(post)}
                          className="text-sm text-indigo-600 hover:underline"
                        >
                          Update Status
                        </button>

                        {post.status === 'coming soon' && (
                          <span className="ml-2 px-3 py-1 bg-yellow-300 text-yellow-900 text-sm rounded">
                            Coming Soon
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'manage-users':
        return (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">Manage Users</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 bg-gray-50"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.filter(user => user && user._id).map((user) => (
                    <tr key={user._id}>
                      <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{user.role}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'most-searched':
        return (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">Most Searched Terms</h3>
            <div className="space-y-4">
              {mostSearched.length > 0 ? (
                mostSearched.filter(item => item && item._id).map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded">
                    <span className="font-medium">{item._id}</span>
                    <span className="text-gray-500">{item.count} searches</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No search data available</p>
              )}
            </div>
          </div>
        );
      case 'add-pyq':
        return (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">Add PYQ</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData();
              formData.append('title', e.target.title.value);
              formData.append('content', e.target.content.value);
              formData.append('courseCategory', e.target.program.value);
              formData.append('college', e.target.college.value);
              formData.append('program', e.target.program.value);
              formData.append('branch', e.target.branch.value);
              formData.append('batch', e.target.batch.value);
              formData.append('course', e.target.course.value);
              formData.append('year', e.target.year.value);
              formData.append('semester', e.target.semester.value);
              formData.append('subject', e.target.subject.value);
              if (e.target.file.files[0]) {
                formData.append('file', e.target.file.files[0]);
              }

              try {
                await api.post('/api/pyqs', formData, {
                  headers: { 'Content-Type': 'multipart/form-data' }
                });
                setSuccess('PYQ added successfully!');
                // Refresh PYQs
                const pyqRes = await api.get('/api/pyqs');
                setPyqQuestions(pyqRes.data);
              } catch (err) {
                setError('Failed to add PYQ');
                console.error(err);
              }
            }} className="space-y-4">
              {error && <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>}
              {success && <div className="p-3 bg-green-100 text-green-700 rounded">{success}</div>}
              <div>
                <label className="block mb-1">Title</label>
                <input type="text" name="title" className="w-full p-2 border rounded" required />
              </div>
              <div>
                <label className="block mb-1">Program</label>
                <select name="program" className="w-full p-2 border rounded" required>
                  <option value="">Select Program</option>
                  {courses.filter(course => course && course._id).map(course => (
                    <option key={course._id} value={course.name}>{course.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1">Course</label>
                <select name="course" className="w-full p-2 border rounded" required>
                  <option value="">Select Course</option>
                  {courses.filter(course => course && course._id).map(course => (
                    <option key={course._id} value={course._id}>{course.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1">Year</label>
                <select name="year" className="w-full p-2 border rounded" required>
                  <option value="">Select Year</option>
                  {years.filter(year => year && year._id).map(year => (
                    <option key={year._id} value={year._id}>{year.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1">Semester</label>
                <select name="semester" className="w-full p-2 border rounded" required>
                  <option value="">Select Semester</option>
                  {semesters.filter(semester => semester && semester._id).map(semester => (
                    <option key={semester._id} value={semester._id}>{semester.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1">Subject</label>
                <select name="subject" className="w-full p-2 border rounded" required>
                  <option value="">Select Subject</option>
                  {subjects.filter(subject => subject && subject._id).map(subject => (
                    <option key={subject._id} value={subject._id}>{subject.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1">College</label>
                <select name="college" className="w-full p-2 border rounded" required>
                  <option value="">Select College</option>
                  {colleges.map((college) => (
                    <option key={college} value={college}>{college}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1">Branch</label>
                <select name="branch" className="w-full p-2 border rounded" required>
                  <option value="">Select Branch</option>
                  {branches.map((branch) => (
                    <option key={branch} value={branch}>{branch}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1">Batch</label>
                <select name="batch" className="w-full p-2 border rounded" required>
                  <option value="">Select Batch</option>
                  {batches.map((batch) => (
                    <option key={batch} value={batch}>{batch}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1">Content</label>
                <textarea name="content" className="w-full p-2 border rounded" rows="3" required />
              </div>
              <div>
                <label className="block mb-1">Upload File</label>
                <input type="file" name="file" className="w-full p-2 border rounded" />
              </div>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Add PYQ
              </button>
            </form>
          </div>
        );
      case 'contact-responses':
        return (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">Contact Form Responses</h3>
            {contactResponses.length === 0 ? (
              <p className="text-gray-500">No contact form responses available.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {contactResponses.filter(response => response && response._id).map((response) => (
                      <tr key={response._id}>
                        <td className="px-6 py-4 whitespace-nowrap">{response.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{response.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{response.message}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{new Date(response.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      case 'feedback':
        return (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">User Feedback</h3>
            {feedbackResponses.length === 0 ? (
              <p className="text-gray-500">No feedback available.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feedback</th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {feedbackResponses.filter(response => response && response._id).map((response) => (
                      <tr key={response._id}>
                        <td className="px-6 py-4 whitespace-nowrap">{response.user?.name || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{response.user?.email || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-normal break-words">{response.message}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{new Date(response.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      case 'academic-settings':
        return (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">Academic Settings</h3>
            {error && <div className="p-3 mb-4 bg-red-100 text-red-700 rounded">{error}</div>}
            {success && <div className="p-3 mb-4 bg-green-100 text-green-700 rounded">{success}</div>}
            <div className="space-y-6">
              {/* Add College */}
              <div className="flex items-center space-x-2">
                <input type="text" name="college" value={academicData.college} onChange={handleAcademicDataChange} placeholder="Add new College" className="w-full p-2 border rounded" />
                <button onClick={() => handleAddAcademicData('college')} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 whitespace-nowrap">Add College</button>
              </div>
              {/* Add Program */}
              <div className="flex items-center space-x-2">
                <input type="text" name="program" value={academicData.program} onChange={handleAcademicDataChange} placeholder="Add new Program (e.g., B.Tech)" className="w-full p-2 border rounded" />
                <button onClick={() => handleAddAcademicData('program')} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 whitespace-nowrap">Add Program</button>
              </div>
              {/* Add Branch */}
              <div className="flex items-center space-x-2">
                <input type="text" name="branch" value={academicData.branch} onChange={handleAcademicDataChange} placeholder="Add new Branch (e.g., CSE)" className="w-full p-2 border rounded" />
                <button onClick={() => handleAddAcademicData('branch')} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 whitespace-nowrap">Add Branch</button>
              </div>
              {/* Add Batch */}
              <div className="flex items-center space-x-2">
                <input type="text" name="batch" value={academicData.batch} onChange={handleAcademicDataChange} placeholder="Add new Batch (e.g., 2020-2024)" className="w-full p-2 border rounded" />
                <button onClick={() => handleAddAcademicData('batch')} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 whitespace-nowrap">Add Batch</button>
              </div>
              {/* Add Subject */}
              <div className="flex items-center space-x-2">
                <input type="text" name="subject" value={academicData.subject} onChange={handleAcademicDataChange} placeholder="Add new Subject" className="w-full p-2 border rounded" />
                <button onClick={() => handleAddAcademicData('subject')} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 whitespace-nowrap">Add Subject</button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="lg:hidden bg-white shadow-sm p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-gray-600 hover:text-gray-800 focus:outline-none"
        >
          {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>
      <div className="flex">
        <div className={`fixed inset-y-0 left-0 z-20 w-64 bg-white shadow-lg transform ${menuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out`}>
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
            <p className="text-sm text-gray-500">Welcome, {user.name || 'Admin'}</p>
          </div>
          <ul className="space-y-2">
            <li>
              <button onClick={() => { setActiveTab('dashboard'); setMenuOpen(false); }} className={`w-full flex items-center p-2 rounded-lg ${activeTab === 'dashboard' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}>
                <FiHome className="mr-3" />
                <span>Dashboard</span>
              </button>
            </li>
            <li>
              <button onClick={() => { setActiveTab('create-post'); setMenuOpen(false); }} className={`w-full flex items-center p-2 rounded-lg ${activeTab === 'create-post' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}>
                <FiPlusSquare className="mr-3" />
                <span>Create Post</span>
              </button>
            </li>
            <li>
              <button onClick={() => { setActiveTab('questions'); setMenuOpen(false); }} className={`w-full flex items-center p-2 rounded-lg ${activeTab === 'questions' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}>
                <FiFileText className="mr-3" />
                <span>Questions</span>
              </button>
            </li>
            <li>
              <button onClick={() => { setActiveTab('user-uploaded'); setMenuOpen(false); }} className={`w-full flex items-center p-2 rounded-lg ${activeTab === 'user-uploaded' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}>
                <FiUsers className="mr-3" />
                <span>User Uploaded</span>
              </button>
            </li>
            <li>
              <button onClick={() => { setActiveTab('manage-users'); setMenuOpen(false); }} className={`w-full flex items-center p-2 rounded-lg ${activeTab === 'manage-users' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}>
                <FiUsers className="mr-3" />
                <span>Manage Users</span>
              </button>
            </li>
            <li>
              <button onClick={() => { setActiveTab('most-searched'); setMenuOpen(false); }} className={`w-full flex items-center p-2 rounded-lg ${activeTab === 'most-searched' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}>
                <FiSearch className="mr-3" />
                <span>Most Searched</span>
              </button>
            </li>
            <li>
              <button onClick={() => { setActiveTab('add-pyq'); setMenuOpen(false); }} className={`w-full flex items-center p-2 rounded-lg ${activeTab === 'add-pyq' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}>
                <FiBook className="mr-3" />
                <span>Add PYQ</span>
              </button>
            </li>
            <li>
              <button onClick={() => { setActiveTab('contact-responses'); setMenuOpen(false); }} className={`w-full flex items-center p-2 rounded-lg ${activeTab === 'contact-responses' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}>
                <FiMail className="mr-3" />
                <span>Contact Responses</span>
              </button>
            </li>
            <li>
              <button onClick={() => { setActiveTab('feedback'); setMenuOpen(false); }} className={`w-full flex items-center p-2 rounded-lg ${activeTab === 'feedback' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}>
                <FiMessageSquare className="mr-3" />
                <span>Feedback</span>
              </button>
            </li>
            <li>
              <button onClick={() => { setActiveTab('academic-settings'); setMenuOpen(false); }} className={`w-full flex items-center p-2 rounded-lg ${activeTab === 'academic-settings' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}>
                <FiSettings className="mr-3" />
                <span>Academic Settings</span>
              </button>
            </li>
            <li>
              <button onClick={logout} className="w-full flex items-center p-2 text-gray-700 rounded-lg hover:bg-gray-100">
                <FiLogOut className="mr-3" />
                <span>Logout</span>
              </button>
            </li>
          </ul>
        </div>
        <div className="flex-1 lg:ml-64">
          <div className="p-6">
            {renderContent()}
          </div>
          <StatusUpdateModal />
        </div>
        {editingPost && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
              <h3 className="text-xl font-semibold mb-4">Update Post</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md resize-none"
                    rows="4"
                    placeholder="Content"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course Category</label>
                  <select
                    value={editCourseCategory}
                    onChange={(e) => setEditCourseCategory(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="btech">BTech</option>
                    <option value="bca">BCA</option>
                    <option value="mca">MCA</option>
                    <option value="mba">MBA</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="pending">Pending</option>
                    <option value="coming soon">Coming Soon</option>
                    <option value="approved">Approved</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">File (optional)</label>
                  <input type="file" onChange={(e) => setEditFile(e.target.files[0])} className="w-full p-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Link (optional)</label>
                  <input type="url" value={editLink} onChange={(e) => setEditLink(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" placeholder="Link (optional)" />
                </div>
                <div className="flex justify-end space-x-2">
                  <button onClick={cancelEditPost} className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600">
                    Cancel
                  </button>
                  <button onClick={submitEditPost} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
