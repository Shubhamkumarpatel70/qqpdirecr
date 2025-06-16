import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import api from '../utils/axios';
import {
  FiMenu, FiX, FiHome, FiPlusSquare, FiUsers,
  FiFileText, FiLogOut
} from 'react-icons/fi';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [courseCategory, setCourseCategory] = useState('btech');
  const [posts, setPosts] = useState([]);
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postsRes, usersRes] = await Promise.all([
          api.get('/api/posts'),
          api.get('/api/users')
        ]);
        setPosts(postsRes.data);
        setUsers(usersRes.data);
        setStats({
          totalPosts: postsRes.data.length,
          totalUsers: usersRes.data.length
        });
      } catch (err) {
        setError('Failed to fetch data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Socket connection
    const socket = io(process.env.REACT_APP_API_URL || 'https://qqpdirecr-backend.onrender.com');
    
    socket.on('activeUsers', (count) => {
      setActiveUsers(count);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('title', postTitle);
    formData.append('content', postContent);
    formData.append('courseCategory', courseCategory);
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
      setPosts([...posts, response.data]);
      setActiveTab('view-posts');
    } catch (err) {
      console.error('Error creating post:', err);
      setError(err.response?.data?.error || 'Failed to create post. Please try again.');
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
              {posts.slice(0, 5).map(post => (
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
      case 'view-posts':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">All Posts</h3>
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
                {posts.map((post) => (
                  <div key={post._id} className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="inline-block px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded">
                            {post.courseCategory?.toUpperCase() || 'OTHER'}
                          </span>
                          <h4 className="mt-2 font-semibold text-lg">{post.title}</h4>
                        </div>
                        <button
                          onClick={() => handleDeletePost(post._id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </div>
                      <p className="mt-2 text-gray-600">{post.content}</p>
                      <div className="mt-4 text-sm text-gray-500">
                        Posted on: {new Date(post.createdAt).toLocaleDateString()}
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
                  {users.map((user) => (
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
              <button onClick={() => { setActiveTab('view-posts'); setMenuOpen(false); }} className={`w-full flex items-center p-2 rounded-lg ${activeTab === 'view-posts' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}>
                <FiFileText className="mr-3" />
                <span>View Posts</span>
              </button>
            </li>
            <li>
              <button onClick={() => { setActiveTab('manage-users'); setMenuOpen(false); }} className={`w-full flex items-center p-2 rounded-lg ${activeTab === 'manage-users' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}>
                <FiUsers className="mr-3" />
                <span>Manage Users</span>
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
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
