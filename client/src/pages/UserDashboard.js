  import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiCalendar, FiArchive, FiList, FiLogOut, FiHeart, FiMessageSquare, FiPlusSquare } from 'react-icons/fi';
import { io } from 'socket.io-client';
import api from '../utils/axios';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../redux/slices/authSlice';

const UserDashboard = () => {
  const [latestPosts, setLatestPosts] = useState([]);
  const [olderPosts, setOlderPosts] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('latest');
  const [socket, setSocket] = useState(null);
  const [activeUsers, setActiveUsers] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [feedback, setFeedback] = useState('');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // New states for upload post form
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postCourseCategory, setPostCourseCategory] = useState('btech');
  const [postStatus, setPostStatus] = useState('pending');
  const [postFile, setPostFile] = useState(null);
  const [postLink, setPostLink] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);

  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector((state) => state.auth.user); // Assuming user is in auth slice

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const [postsResponse, myPostsResponse] = await Promise.all([
        api.get('/api/posts'),
        api.get('/api/posts/my-posts')
      ]);
      setAllPosts(postsResponse.data);
      setMyPosts(myPostsResponse.data);
    } catch (err) {
      setError('Failed to fetch posts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();

    // Socket connection
    const API_URL = process.env.REACT_APP_API_URL || 
      (process.env.NODE_ENV === 'production'
        ? 'https://qqpdirecr-backend.onrender.com' 
        : 'http://localhost:5000');

    const socket = io(API_URL, {
      withCredentials: true
    });

    socket.on('activeUsers', (count) => {
      setActiveUsers(count);
    });

    socket.on('postUpdated', (updatedPost) => {
      setAllPosts(prevPosts => 
        prevPosts.map(post => 
          post._id === updatedPost._id ? updatedPost : post
        )
      );
      setLatestPosts(prevPosts => 
        prevPosts.map(post => 
          post._id === updatedPost._id ? updatedPost : post
        )
      );
      setOlderPosts(prevPosts => 
        prevPosts.map(post => 
          post._id === updatedPost._id ? updatedPost : post
        )
      );
    });

    socket.on('postDeleted', ({ id }) => {
      setAllPosts(prevPosts => prevPosts.filter(post => post._id !== id));
    });

    setSocket(socket);

    return () => {
      socket.disconnect();
    };
  }, [fetchPosts]);

  // New useEffect to refresh posts on tab switch
  useEffect(() => {
    fetchPosts();
  }, [activeSection, fetchPosts]);

  useEffect(() => {
    if (allPosts.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const fiveDaysAgo = new Date();
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

      const latest = allPosts.filter(post => new Date(post.createdAt) >= today);
      const older = allPosts.filter(post => new Date(post.createdAt) < fiveDaysAgo);

      setLatestPosts(latest);
      setOlderPosts(older);
    }
  }, [allPosts]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleFeedbackSubmit = async () => {
    if (!feedback.trim()) {
      setError('Feedback cannot be empty');
      return;
    }
    try {
      await api.post('/api/feedback', { message: feedback });
      setSuccess('Thank you for your feedback!');
      setFeedback('');
      setShowFeedbackModal(false);
      setError('');
    } catch (err) {
      setError('Failed to submit feedback');
      console.error(err);
    }
  };

  const renderPosts = () => {
    // Filter posts to include only those with status 'approved' or 'coming soon' for latest, older, all sections
    const filterStatus = ['approved', 'coming soon'];

    const postsToRender =
      activeSection === 'latest' ? latestPosts.filter(post => filterStatus.includes(post.status)) :
      activeSection === 'older' ? olderPosts.filter(post => filterStatus.includes(post.status)) :
      activeSection === 'all' ? allPosts.filter(post => filterStatus.includes(post.status)) :
      activeSection === 'my-posts' ? myPosts : // Show all user posts including pending
      allPosts;

    if (postsToRender.length === 0) {
      return (
        <div className="col-span-full text-center py-10">
          <p className="text-gray-500">
            {activeSection === 'latest' && 'No new posts today.'}
            {activeSection === 'older' && 'No older posts.'}
            {activeSection === 'all' && 'No posts found.'}
            {activeSection === 'my-posts' && 'No posts uploaded yet.'}
          </p>
        </div>
      );
    }

    return postsToRender.map((post) => (
      <PostCard
        key={post._id}
        post={post}
        socket={socket}
        onLike={fetchPosts} // Optional: refetch posts after like
        showStatus={activeSection === 'my-posts'}
        isUserPost={activeSection === 'my-posts'} // Pass prop to disable editing
      />
    ));
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!postTitle || !postContent) {
      setError('Title and content are required');
      return;
    }

    const formData = new FormData();
    formData.append('title', postTitle);
    formData.append('content', postContent);
    formData.append('courseCategory', postCourseCategory);
    formData.append('status', postStatus);
    if (postFile) {
      formData.append('file', postFile);
    }
    if (postLink) {
      formData.append('link', postLink);
    }

    try {
      const response = await api.post('/api/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess('Post uploaded successfully!');
      setPostTitle('');
      setPostContent('');
      setPostCourseCategory('btech');
      setPostStatus('pending');
      setPostFile(null);
      setPostLink('');
      setShowUploadForm(false);

      // Refresh posts list and switch to my posts tab
      fetchPosts();
      setActiveSection('my-posts');
    } catch (err) {
      console.error('Failed to upload post:', err);
      setError('Failed to upload post. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar/Navigation */}
        <div className="hidden lg:block fixed inset-y-0 left-0 z-20 w-64 bg-white shadow-lg">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-800">User Dashboard</h1>
            <button
              onClick={() => setShowFeedbackModal(!showFeedbackModal)}
              className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
              title="Give Feedback"
            >
              <FiMessageSquare />
              <span>Feedback</span>
            </button>
          </div>
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => setActiveSection('latest')}
                className={`w-full flex items-center p-2 rounded-lg ${activeSection === 'latest' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <FiCalendar className="mr-3" />
                <span>Latest Posts</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveSection('older')}
                className={`w-full flex items-center p-2 rounded-lg ${activeSection === 'older' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <FiArchive className="mr-3" />
                <span>Older Posts</span>
              </button>
            </li>
        <li>
          <button
            onClick={() => setActiveSection('all')}
            className={`w-full flex items-center p-2 rounded-lg ${activeSection === 'all' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            <FiList className="mr-3" />
            <span>All Posts</span>
          </button>
        </li>
        <li>
          <button
            onClick={() => setActiveSection('my-posts')}
            className={`w-full flex items-center p-2 rounded-lg ${activeSection === 'my-posts' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            <FiList className="mr-3" />
            <span>My Posts</span>
          </button>
        </li>
        <li>
          <button
            onClick={() => setShowUploadForm(!showUploadForm)}
            className={`w-full flex items-center p-2 rounded-lg ${showUploadForm ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            <FiPlusSquare className="mr-3" />
            <span>Upload Post</span>
          </button>
        </li>
        <li className="border-t border-gray-200 pt-2 mt-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center p-2 text-gray-700 rounded-lg hover:bg-gray-100"
          >
            <FiLogOut className="mr-3" />
            <span>Logout</span>
          </button>
        </li>
          </ul>
        </div>

        {/* Main content */}
        <div className="flex-1 lg:ml-64">
          <div className="p-6">
            {/* Desktop header */}
            <div className="hidden lg:flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold text-gray-800">
                {activeSection === 'latest' && 'Latest Posts (Today)'}
                {activeSection === 'older' && 'Older Posts (5+ Days Ago)'}
                {activeSection === 'all' && 'All Posts'}
                {activeSection === 'my-posts' && 'My Posts'}
              </h1>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {renderPosts()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom menu for small screens */}
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 lg:hidden flex justify-around py-2">
        <button
          onClick={() => setActiveSection('latest')}
          className={`flex flex-col items-center text-sm ${activeSection === 'latest' ? 'text-blue-600' : 'text-gray-600'}`}
          title="Latest Posts"
        >
          <FiCalendar size={20} />
          <span>Latest</span>
        </button>
        <button
          onClick={() => setActiveSection('older')}
          className={`flex flex-col items-center text-sm ${activeSection === 'older' ? 'text-blue-600' : 'text-gray-600'}`}
          title="Older Posts"
        >
          <FiArchive size={20} />
          <span>Older</span>
        </button>
        <button
          onClick={() => setActiveSection('all')}
          className={`flex flex-col items-center text-sm ${activeSection === 'all' ? 'text-blue-600' : 'text-gray-600'}`}
          title="All Posts"
        >
          <FiList size={20} />
          <span>All</span>
        </button>
        <button
          onClick={handleLogout}
          className="flex flex-col items-center text-sm text-gray-600"
          title="Logout"
        >
          <FiLogOut size={20} />
          <span>Logout</span>
        </button>
        <button
          onClick={() => setShowFeedbackModal(!showFeedbackModal)}
          className={`flex flex-col items-center text-sm ${showFeedbackModal ? 'text-blue-600' : 'text-gray-600'}`}
          title="Feedback"
        >
          <FiMessageSquare size={20} />
          <span>Feedback</span>
        </button>
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 max-w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Feedback</h2>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Enter your feedback here..."
              className="w-full p-2 border border-gray-300 rounded-md resize-none"
              rows="4"
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            {success && <p className="text-green-500 text-sm mt-2">{success}</p>}
            <div className="flex justify-end mt-4 space-x-2">
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleFeedbackSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Post Modal */}
      {showUploadForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 max-w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Upload Post</h2>
            <form onSubmit={handleUploadSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Course Category</label>
                <select
                  value={postCourseCategory}
                  onChange={(e) => setPostCourseCategory(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="btech">BTech</option>
                  <option value="bca">BCA</option>
                  <option value="mca">MCA</option>
                  <option value="mba">MBA</option>
                  <option value="other">Other</option>
                </select>
              </div>
              {user && user.role === 'admin' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={postStatus}
                    onChange={(e) => setPostStatus(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="pending">Pending</option>
                    <option value="coming soon">Coming Soon</option>
                    <option value="approved">Approved</option>
                  </select>
                </div>
              )}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Enter post title"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md resize-none"
                  rows="4"
                  placeholder="Enter post content"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">File (optional)</label>
                <input
                  type="file"
                  onChange={(e) => setPostFile(e.target.files[0])}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Link (optional)</label>
                <input
                  type="url"
                  value={postLink}
                  onChange={(e) => setPostLink(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="https://example.com"
                />
              </div>
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              {success && <p className="text-green-500 text-sm mt-2">{success}</p>}
              <div className="flex justify-end mt-4 space-x-2">
                <button
                  type="button"
                  onClick={() => setShowUploadForm(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;

const PostCard = ({ post, socket, showStatus = false, onUpdate, isUserPost = false, userRole }) => {
  const [isLiked, setIsLiked] = React.useState(false);
  const [likeCount, setLikeCount] = React.useState(post.likes || 0);
  const [showModal, setShowModal] = React.useState(false);
  const [editTitle, setEditTitle] = React.useState(post.title);
  const [editContent, setEditContent] = React.useState(post.content);
  const [editCourseCategory, setEditCourseCategory] = React.useState(post.courseCategory);
  const [editFile, setEditFile] = React.useState(null);
  const [editLink, setEditLink] = React.useState(post.link || '');
  const postDate = new Date(post.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const formatCategory = (category) => {
    const categories = {
      btech: 'BTech',
      bca: 'BCA',
      mca: 'MCA',
      mba: 'MBA',
      other: 'Other'
    };
    return categories[category] || category.toUpperCase();
  };

  const handleLike = async () => {
    try {
      const newLikeCount = isLiked ? likeCount - 1 : likeCount + 1;
      setLikeCount(newLikeCount);
      setIsLiked(!isLiked);

      await api.put(`/api/posts/${post._id}/like`, {
        like: !isLiked
      });

      if (socket) {
        socket.emit('likePost', {
          postId: post._id,
          likes: newLikeCount
        });
      }
    } catch (err) {
      console.error('Failed to like post:', err);
      setLikeCount(isLiked ? likeCount + 1 : likeCount - 1);
      setIsLiked(isLiked);
    }
  };

  const handleUpdateClick = () => {
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditTitle(post.title);
    setEditContent(post.content);
    setEditCourseCategory(post.courseCategory);
    setEditFile(null);
    setEditLink(post.link || '');
  };

  const handleUpdateSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append('title', editTitle);
      formData.append('content', editContent);
      formData.append('courseCategory', editCourseCategory);
      if (editFile) {
        formData.append('file', editFile);
      }
      formData.append('link', editLink);

      const response = await api.put(`/api/posts/${post._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (onUpdate) {
        onUpdate();
      }
      setShowModal(false);
    } catch (error) {
      console.error('Failed to update post:', error);
    }
  };

  const handleDownload = (post) => {
    const API_URL = process.env.REACT_APP_API_URL || 'https://qqpdirecr-backend.onrender.com';
    const downloadUrl = `${API_URL}/uploads/${post.file}`;
    window.open(downloadUrl, '_blank');
  };

  // Check if user can interact with the post based on status
  const canInteract = post.status === 'approved' || post.status === 'coming soon';

  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow duration-300">
        <div className="p-6">
          <div className="flex justify-between items-start mb-2 gap-2">
            <h3 className="font-semibold text-lg text-gray-800">{post.title}</h3>
            <div className="flex gap-2">
              {post.courseCategory && (
                <span className="inline-block px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">
                  {formatCategory(post.courseCategory)}
                </span>
              )}
              {showStatus && post.status && (
                <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                  post.status === 'approved' ? 'bg-green-100 text-green-800' :
                  post.status === 'coming soon' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {post.status === 'approved' ? 'Approved' :
                   post.status === 'coming soon' ? 'Coming Soon' :
                   'Pending'}
                </span>
              )}
              {showStatus && !isUserPost && (
                <button
                  onClick={handleUpdateClick}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Update
                </button>
              )}
            </div>
          </div>
          <p className="text-gray-600 mb-4 line-clamp-3">{post.content}</p>

          {/* Show file and link only if user is NOT admin */}
          {userRole !== 'admin' && (
            <>
              {post.file && canInteract && (
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => handleDownload(post)}
                    className="text-blue-500 hover:underline"
                  >
                    Download File
                  </button>
                </div>
              )}

              {post.link && canInteract && (
                <div className="mt-4">
                  <a
                    href={post.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    Preview Link
                  </a>
                </div>
              )}
            </>
          )}

          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-500">
              Posted on: {postDate}
            </div>
            {canInteract && (
              <button
                onClick={handleLike}
                className={`flex items-center space-x-1 ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
              >
                <FiHeart className={isLiked ? 'fill-current' : ''} />
                <span>{likeCount}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Update Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 max-w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Update Post</h2>
            <div className="space-y-4">
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

              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Title"
              />

              <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md resize-none"
                rows="4"
                placeholder="Content"
              />

              {/* Show file and link inputs only if user is NOT admin */}
              {userRole !== 'admin' && (
                <>
                  <label className="block text-sm font-medium text-gray-700 mb-1">File (optional)</label>
                  <input
                    type="file"
                    onChange={(e) => setEditFile(e.target.files[0])}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />

                  <label className="block text-sm font-medium text-gray-700 mb-1">Link (optional)</label>
                  <input
                    type="url"
                    value={editLink}
                    onChange={(e) => setEditLink(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Link (optional)"
                  />
                </>
              )}

              <div className="flex justify-end space-x-2">
                <button
                  onClick={handleModalClose}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateSubmit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
