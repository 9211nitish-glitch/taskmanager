import React, { useState, useEffect, useCallback } from 'react';

// --- Configuration ---
const API_URL = 'http://localhost:8080';
const ADMIN_WHATSAPP_NUMBER = '918588004216'; // Your WhatsApp number with country code

// --- SVG Icons ---
const MenuIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>;
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197m0 0A5.975 5.975 0 0112 13a5.975 5.975 0 013 1.803M15 21a9 9 0 10-9-9" /></svg>;
const TaskIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>;
const WalletIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
const ProfileIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const ReferralIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4s-8 6-8 10a8 8 0 1016 0c0-4-8-10-8-10zm0 4a2 2 0 100 4 2 2 0 000-4z" /></svg>;
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.414L11 10.586V6z" clipRule="evenodd" /></svg>;
const PackageIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-14L4 7m0 0l8 4m-8-4v10l8 4m0-14L4 7" /></svg>;
const ShoppingCartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const ChatIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>;


// --- Helper Components ---
const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-full w-full">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
    </div>
);

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800">{title}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl leading-none">&times;</button>
                </div>
                <div>{children}</div>
            </div>
        </div>
    );
};

const Notification = ({ message, type, onDismiss }) => {
    if (!message) return null;
    const baseClasses = "p-4 rounded-md text-white my-4";
    const typeClasses = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    return (
        <div className={`${baseClasses} ${typeClasses}`}>
            <span>{message}</span>
            <button onClick={onDismiss} className="float-right font-bold">X</button>
        </div>
    );
};

// --- API Service ---
const apiService = {
    async request(endpoint, method = 'GET', body = null, isFormData = false) {
        const headers = {};
        const token = localStorage.getItem('token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config = { method, headers };
        
        if (body) {
            if (isFormData) {
                config.body = body;
            } else {
                headers['Content-Type'] = 'application/json';
                config.body = JSON.stringify(body);
            }
        }

        try {
            const response = await fetch(`${API_URL}${endpoint}`, config);
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'An error occurred');
            }
            return data;
        } catch (error) {
            console.error('API Error:', error.message);
            throw error;
        }
    },
};

// --- Authentication Components ---
const AuthPage = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
                    {isLogin ? 'Welcome Back!' : 'Create Your Account'}
                </h2>
                {isLogin ? <LoginForm onLogin={onLogin} /> : <SignUpForm onSignupSuccess={() => setIsLogin(true)} />}
                <p className="text-center text-sm text-gray-600 mt-4">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button onClick={() => setIsLogin(!isLogin)} className="font-medium text-blue-600 hover:text-blue-500">
                        {isLogin ? 'Sign Up' : 'Log In'}
                    </button>
                </p>
            </div>
        </div>
    );
};

const LoginForm = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const data = await apiService.request('/api/login', 'POST', { email, password });
            onLogin(data.token);
        } catch (err) {
            setError(err.message);
        }
        setLoading(false);
    };

    return (
        <form onSubmit={handleLogin} className="space-y-4">
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors">
                {loading ? 'Logging In...' : 'Log In'}
            </button>
        </form>
    );
};

const SignUpForm = ({ onSignupSuccess }) => {
    const [formData, setFormData] = useState({ name: '', email: '', mobile: '', password: '', confirmPassword: '', userType: 'user', referralId: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            await apiService.request('/api/signup', 'POST', formData);
            setSuccess('Account created successfully! Please log in.');
            setTimeout(() => onSignupSuccess(), 2000);
        } catch (err) {
            setError(err.message);
        }
        setLoading(false);
    };

    return (
        <form onSubmit={handleSignUp} className="space-y-4">
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            {success && <p className="text-green-500 text-sm text-center">{success}</p>}
            
            <div className="flex gap-4">
                <label className="flex-1">
                    <input type="radio" name="userType" value="user" checked={formData.userType === 'user'} onChange={handleChange} className="mr-2" />
                    General User
                </label>
                <label className="flex-1">
                    <input type="radio" name="userType" value="creator" checked={formData.userType === 'creator'} onChange={handleChange} className="mr-2" />
                    Content Creator
                </label>
            </div>

            <input name="name" placeholder="Full Name" onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
            <input name="email" type="email" placeholder="Email" onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
            <input name="mobile" type="tel" placeholder="Mobile Number" onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
            <input name="referralId" placeholder="Referral Code (Optional)" onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
            <input name="password" type="password" placeholder="Password" onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
            <input name="confirmPassword" type="password" placeholder="Confirm Password" onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
            <button type="submit" disabled={loading} className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:bg-green-300">
                {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
        </form>
    );
};


// --- Admin Dashboard Components ---
const AdminDashboard = ({ userData, handleLogout }) => {
    const [view, setView] = useState('home');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const renderView = () => {
        switch (view) {
            case 'users': return <AdminUserManagement />;
            case 'tasks': return <AdminTaskManagement />;
            case 'packages': return <AdminPackageManagement />;
            case 'purchases': return <AdminPurchaseRequests />;
            default: return <AdminHome />;
        }
    };

    return (
        <div className="relative min-h-screen md:flex">
            <div className="md:hidden flex justify-between items-center bg-gray-800 text-white p-4">
                <span className="text-xl font-bold">Admin Panel</span>
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                    <MenuIcon />
                </button>
            </div>
            <aside className={`bg-gray-800 text-white w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition duration-200 ease-in-out z-20 flex flex-col`}>
                <div className="p-4 text-2xl font-bold border-b border-gray-700 hidden md:block">Admin Panel</div>
                <nav className="flex-1">
                    <button onClick={() => { setView('home'); setIsSidebarOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2 rounded hover:bg-gray-700"><HomeIcon /> Dashboard</button>
                    <button onClick={() => { setView('users'); setIsSidebarOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2 rounded hover:bg-gray-700"><UsersIcon /> User Management</button>
                    <button onClick={() => { setView('tasks'); setIsSidebarOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2 rounded hover:bg-gray-700"><TaskIcon /> Task Management</button>
                    <button onClick={() => { setView('packages'); setIsSidebarOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2 rounded hover:bg-gray-700"><PackageIcon /> Package Management</button>
                    <button onClick={() => { setView('purchases'); setIsSidebarOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2 rounded hover:bg-gray-700"><ShoppingCartIcon /> Purchase Requests</button>
                </nav>
                <div className="p-2 border-t border-gray-700">
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 rounded hover:bg-red-700 bg-red-600"><LogoutIcon /> Logout</button>
                </div>
            </aside>
            <main className="flex-1 p-4 md:p-6 lg:p-10">
                {renderView()}
            </main>
        </div>
    );
};

const AdminHome = () => {
    return (
         <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
            <p>Welcome, Admin! Manage users and tasks from the sidebar.</p>
        </div>
    );
};

const AdminUserManagement = () => {
    const [users, setUsers] = useState([]);
    useEffect(() => {
        apiService.request('/api/admin/users').then(setUsers).catch(console.error);
    }, []);

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">User Management</h1>
            <div className="bg-white shadow rounded-lg overflow-x-auto">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Referral Code</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Wallet</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    <p className="text-gray-900 whitespace-no-wrap">{user.name}</p>
                                    <p className="text-gray-600 whitespace-no-wrap">{user.email}</p>
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{user.referralCode}</td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">₹{Number(user.walletBalance).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const AdminTaskManagement = () => {
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [isReviewModalOpen, setReviewModalOpen] = useState(false);
    const [taskToReview, setTaskToReview] = useState(null);
    const [reassignNotes, setReassignNotes] = useState('');
    
    const [users, setUsers] = useState([]);
    const [pendingTasks, setPendingTasks] = useState([]);
    const [notification, setNotification] = useState({ message: '', type: '' });

    const fetchAllData = useCallback(() => {
        apiService.request('/api/admin/users').then(data => {
            setUsers(data.filter(u => u.role !== 'admin'));
        }).catch(console.error);
        
        apiService.request('/api/admin/tasks/pending').then(setPendingTasks).catch(console.error);
    }, []);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    const handleCreateTask = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const selectedUsers = formData.getAll('userIds');
        formData.set('userIds', JSON.stringify(selectedUsers));

        try {
            await apiService.request('/api/admin/tasks', 'POST', formData, true);
            setCreateModalOpen(false);
            setNotification({ message: 'Task created successfully!', type: 'success' });
            fetchAllData();
        } catch (error) {
            setNotification({ message: error.message, type: 'error' });
        }
    };
    
    const openReviewModal = (task) => {
        setTaskToReview(task);
        setReviewModalOpen(true);
    };

    const handleApprove = async () => {
        if (!taskToReview) return;
        try {
            await apiService.request(`/api/admin/tasks/${taskToReview.id}/approve`, 'POST', {
                userId: taskToReview.userId,
                points: taskToReview.points,
                title: taskToReview.title 
            });
            setNotification({ message: 'Task approved!', type: 'success' });
            setReviewModalOpen(false);
            fetchAllData();
        } catch (error) {
            setNotification({ message: error.message, type: 'error' });
        }
    };

    const handleReassign = async () => {
        if (!taskToReview || !reassignNotes) {
            setNotification({ message: 'Re-assign notes cannot be empty.', type: 'error'});
            return;
        };
        try {
            await apiService.request(`/api/admin/tasks/${taskToReview.id}/reassign`, 'POST', {
                userId: taskToReview.userId,
                notes: reassignNotes
            });
            setNotification({ message: 'Task re-assigned!', type: 'success' });
            setReviewModalOpen(false);
            setReassignNotes('');
            fetchAllData();
        } catch (error) {
            setNotification({ message: error.message, type: 'error' });
        }
    };

    return (
        <div>
            <Notification message={notification.message} type={notification.type} onDismiss={() => setNotification({ message: '', type: '' })} />
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Task Management</h1>
                <button onClick={() => setCreateModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700">Create Task</button>
            </div>
            
            <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-700 my-4">Tasks Pending Review</h2>
                <div className="bg-white shadow rounded-lg overflow-x-auto">
                    <table className="min-w-full leading-normal">
                        <thead>
                            <tr>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Task Title</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Submitted By</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Submitted At</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingTasks.length > 0 ? pendingTasks.map(task => (
                                <tr key={task.id}>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{task.title}</td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{task.userName}</td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{new Date(task.submittedAt).toLocaleString()}</td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        <button onClick={() => openReviewModal(task)} className="text-indigo-600 hover:text-indigo-900">Review</button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="text-center py-10 text-gray-500">No tasks are currently pending review.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <Modal isOpen={isCreateModalOpen} onClose={() => setCreateModalOpen(false)} title="Create New Task">
                <form onSubmit={handleCreateTask} className="space-y-4">
                    <input name="title" placeholder="Task Title" className="w-full px-4 py-2 border rounded-lg" required />
                    <textarea name="description" placeholder="Task Description" className="w-full px-4 py-2 border rounded-lg" required />
                    <input name="points" type="number" step="0.01" placeholder="Points (1 point = 1 RS)" className="w-full px-4 py-2 border rounded-lg" required />
                    <input name="acceptTimer" type="number" placeholder="Time to Accept (in hours)" className="w-full px-4 py-2 border rounded-lg" required />
                    <input name="completeTimer" type="number" placeholder="Time to Complete (in hours)" className="w-full px-4 py-2 border rounded-lg" required />
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Assign to Users</label>
                        <select name="userIds" multiple className="w-full h-32 px-4 py-2 border rounded-lg" required>
                            {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Upload Media File (Optional)</label>
                        <input name="media" type="file" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg">Create Task</button>
                </form>
            </Modal>
            
            <Modal isOpen={isReviewModalOpen} onClose={() => setReviewModalOpen(false)} title="Review Task Submission">
                {taskToReview && (
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-bold text-lg">{taskToReview.title}</h4>
                            <p>Submitted by: {taskToReview.userName} ({taskToReview.userEmail})</p>
                            <p>Points: {taskToReview.points}</p>
                        </div>
                        <a href={`${API_URL}${taskToReview.fileUrl}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-semibold">View Submitted File</a>
                        
                        <div className="flex gap-4 mt-6">
                            <button onClick={handleApprove} className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">Approve</button>
                        </div>

                        <div className="border-t pt-4">
                            <h5 className="font-bold">Or Re-assign with Notes</h5>
                            <textarea 
                                value={reassignNotes}
                                onChange={(e) => setReassignNotes(e.target.value)}
                                placeholder="Notes for re-correction..." 
                                className="w-full px-4 py-2 border rounded-lg mt-2"
                            ></textarea>
                            <button onClick={handleReassign} className="w-full bg-yellow-500 text-white px-4 py-2 rounded-lg mt-2 hover:bg-yellow-600">Re-assign Task</button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

const AdminPackageManagement = () => {
    const [packages, setPackages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPackage, setEditingPackage] = useState(null);
    const [notification, setNotification] = useState({ message: '', type: '' });

    const fetchPackages = useCallback(() => {
        setIsLoading(true);
        apiService.request('/api/admin/packages')
            .then(setPackages)
            .catch(error => setNotification({ message: error.message, type: 'error' }))
            .finally(() => setIsLoading(false));
    }, []);

    useEffect(() => {
        fetchPackages();
    }, [fetchPackages]);

    const handleOpenModal = (pkg = null) => {
        setEditingPackage(pkg);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingPackage(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        try {
            if (editingPackage) {
                await apiService.request(`/api/admin/packages/${editingPackage.id}`, 'PUT', data);
                setNotification({ message: 'Package updated successfully!', type: 'success' });
            } else {
                await apiService.request('/api/admin/packages', 'POST', data);
                setNotification({ message: 'Package created successfully!', type: 'success' });
            }
            fetchPackages();
            handleCloseModal();
        } catch (error) {
            setNotification({ message: error.message, type: 'error' });
        }
    };

    return (
        <div>
            <Notification message={notification.message} type={notification.type} onDismiss={() => setNotification({ message: '', type: '' })} />
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Package Management</h1>
                <button onClick={() => handleOpenModal()} className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700">Create Package</button>
            </div>
            <div className="bg-white shadow rounded-lg overflow-x-auto">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tasks per Day</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Price</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan="4" className="text-center py-10"><LoadingSpinner /></td></tr>
                        ) : packages.map(pkg => (
                            <tr key={pkg.id}>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm capitalize">{pkg.name}</td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{pkg.tasks}</td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">₹{Number(pkg.price).toFixed(2)}</td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    <button onClick={() => handleOpenModal(pkg)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingPackage ? 'Edit Package' : 'Create Package'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input name="name" defaultValue={editingPackage?.name} placeholder="Package Name (e.g., gold)" className="w-full px-4 py-2 border rounded-lg" required />
                    <input name="tasks" defaultValue={editingPackage?.tasks} type="number" placeholder="Tasks per day" className="w-full px-4 py-2 border rounded-lg" required />
                    <input name="price" defaultValue={editingPackage?.price} type="number" step="0.01" placeholder="Price (e.g., 1000)" className="w-full px-4 py-2 border rounded-lg" required />
                    <input name="color" defaultValue={editingPackage?.color} placeholder="Border Color (e.g., border-yellow-400)" className="w-full px-4 py-2 border rounded-lg" required />
                    <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg">{editingPackage ? 'Update Package' : 'Create Package'}</button>
                </form>
            </Modal>
        </div>
    );
};

const AdminPurchaseRequests = () => {
    const [requests, setRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [notification, setNotification] = useState({ message: '', type: '' });

    const fetchRequests = useCallback(() => {
        setIsLoading(true);
        apiService.request('/api/admin/purchases')
            .then(setRequests)
            .catch(error => setNotification({ message: error.message, type: 'error' }))
            .finally(() => setIsLoading(false));
    }, []);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const handleApprove = async (id) => {
        try {
            await apiService.request(`/api/admin/purchases/${id}/approve`, 'POST');
            setNotification({ message: 'Purchase approved!', type: 'success' });
            fetchRequests();
        } catch (error) {
            setNotification({ message: error.message, type: 'error' });
        }
    };

    const handleDecline = async (id) => {
        try {
            await apiService.request(`/api/admin/purchases/${id}/decline`, 'POST');
            setNotification({ message: 'Purchase declined.', type: 'success' });
            fetchRequests();
        } catch (error) {
            setNotification({ message: error.message, type: 'error' });
        }
    };

    return (
        <div>
            <Notification message={notification.message} type={notification.type} onDismiss={() => setNotification({ message: '', type: '' })} />
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Package Purchase Requests</h1>
            <div className="bg-white shadow rounded-lg overflow-x-auto">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Package</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">UTR Number</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Screenshot</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan="5" className="text-center py-10"><LoadingSpinner /></td></tr>
                        ) : requests.length > 0 ? requests.map(req => (
                            <tr key={req.id}>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{req.userName} ({req.userEmail})</td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm capitalize">{req.packageName}</td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{req.utrNumber}</td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    <a href={`${API_URL}${req.screenshotUrl}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View</a>
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm flex gap-2">
                                    <button onClick={() => handleApprove(req.id)} className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600">Approve</button>
                                    <button onClick={() => handleDecline(req.id)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Decline</button>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="5" className="text-center py-10 text-gray-500">No pending purchase requests.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


// --- User Dashboard Components ---
const UserDashboard = ({ userData, handleLogout, refreshUserData }) => {
    const [view, setView] = useState('home');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const renderView = () => {
        switch (view) {
            case 'profile': return <UserProfile userData={userData} refreshUserData={refreshUserData} />;
            case 'wallet': return <UserWallet userData={userData} />;
            case 'referrals': return <UserReferrals userData={userData} />;
            case 'packages': return <Packages userData={userData} refreshUserData={refreshUserData} />;
            case 'missedTasks': return <MissedTasks />;
            default: return <UserHome />;
        }
    };
    
    // --- NEW --- Redirect to profile completion if needed
    if (userData.userType === 'creator' && !userData.isProfileComplete) {
        return <CompleteProfileForm userData={userData} refreshUserData={refreshUserData} />;
    }

    return (
        <div className="relative min-h-screen md:flex">
            <div className="md:hidden flex justify-between items-center bg-white shadow-md text-gray-800 p-4">
                <span className="text-xl font-bold text-blue-600">My Dashboard</span>
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                    <MenuIcon />
                </button>
            </div>
            <aside className={`bg-white shadow-md w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition duration-200 ease-in-out z-20 flex flex-col`}>
                <div className="p-4 text-2xl font-bold border-b border-gray-200 text-blue-600 hidden md:block">My Dashboard</div>
                 <div className="p-4 border-b border-gray-200">
                     <img src={userData.photoURL ? `${API_URL}${userData.photoURL}` : 'https://placehold.co/100x100/E2E8F0/4A5568?text=Avatar'} alt="User" className="w-24 h-24 rounded-full mx-auto mb-2 object-cover" />
                    <h3 className="text-center font-bold text-gray-800">{userData.name}</h3>
                    <p className="text-center text-sm text-gray-500">Balance: ₹{Number(userData.walletBalance).toFixed(2)}</p>
                </div>
                <nav className="flex-1">
                    <button onClick={() => { setView('home'); setIsSidebarOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2 rounded text-gray-600 hover:bg-blue-100 hover:text-blue-700"><HomeIcon /> Active Tasks</button>
                    <button onClick={() => { setView('missedTasks'); setIsSidebarOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2 rounded text-gray-600 hover:bg-blue-100 hover:text-blue-700"><TaskIcon /> Missed Tasks</button>
                    <button onClick={() => { setView('profile'); setIsSidebarOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2 rounded text-gray-600 hover:bg-blue-100 hover:text-blue-700"><ProfileIcon /> My Profile</button>
                    <button onClick={() => { setView('wallet'); setIsSidebarOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2 rounded text-gray-600 hover:bg-blue-100 hover:text-blue-700"><WalletIcon /> My Wallet</button>
                    <button onClick={() => { setView('referrals'); setIsSidebarOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2 rounded text-gray-600 hover:bg-blue-100 hover:text-blue-700"><ReferralIcon /> Referrals</button>
                    <button onClick={() => { setView('packages'); setIsSidebarOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2 rounded text-gray-600 hover:bg-blue-100 hover:text-blue-700"><PackageIcon /> Packages</button>
                </nav>
                 <div className="p-2 border-t border-gray-200">
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 rounded text-red-600 hover:bg-red-100"><LogoutIcon /> Logout</button>
                </div>
            </aside>
            <main className="flex-1 p-4 md:p-6 lg:p-10 bg-gray-50">
                {renderView()}
            </main>
            <ChatWidget />
        </div>
    );
};

const UserHome = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState({ message: '', type: '' });

    const fetchTasks = useCallback(async () => {
        setLoading(true);
        try {
            const fetchedTasks = await apiService.request('/api/tasks/my-tasks');
            setTasks(fetchedTasks);
        } catch (error) {
            setNotification({ message: error.message, type: 'error' });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const handleAccept = async (taskId) => {
        try {
            await apiService.request(`/api/tasks/${taskId}/accept`, 'POST');
            setNotification({ message: 'Task accepted!', type: 'success' });
            fetchTasks(); 
        } catch (error) {
            setNotification({ message: error.message, type: 'error' });
        }
    };
    
    const handleSubmitTask = async (e, taskId) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        try {
            await apiService.request(`/api/tasks/${taskId}/submit`, 'POST', formData, true);
            setNotification({ message: 'Task submitted successfully!', type: 'success' });
            fetchTasks();
        } catch (error) {
            setNotification({ message: error.message, type: 'error' });
        }
    };

    const activeTasks = tasks.filter(t => t.assignment_status === 'assigned' && t.status !== 're_assigned');
    const inProgressTasks = tasks.filter(t => t.assignment_status === 'accepted');
    const reAssignedTasks = tasks.filter(t => t.status === 're_assigned' && t.assignment_status === 'assigned');

    return (
         <div>
            <Notification message={notification.message} type={notification.type} onDismiss={() => setNotification({ message: '', type: '' })} />
            <h1 className="text-3xl font-bold text-gray-800 mb-6">My Tasks</h1>
            {loading ? <LoadingSpinner /> : (
            <>
                <section>
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">New & Re-assigned Tasks</h2>
                    <div className="space-y-4">
                        {reAssignedTasks.map(task => (
                             <div key={task.id} className="bg-yellow-100 p-4 rounded-lg shadow border-l-4 border-yellow-500">
                                <h3 className="font-bold text-yellow-800">{task.title} (Re-assigned)</h3>
                                <p className="text-sm text-yellow-700"><b>Admin Notes:</b> {task.reviewNotes}</p>
                                <div className="mt-4">
                                    <button onClick={() => handleAccept(task.id)} className="px-4 py-2 bg-green-500 text-white rounded-lg">Accept Again</button>
                                </div>
                            </div>
                        ))}
                        {activeTasks.map(task => (
                            <div key={task.id} className="bg-white p-4 rounded-lg shadow">
                                <h3 className="font-bold">{task.title}</h3>
                                <p className="text-sm text-gray-600">{task.description}</p>
                                <div className="flex items-center justify-between mt-2 text-sm">
                                    <span className="font-semibold text-green-600">Points: {task.points}</span>
                                    <span className="flex items-center gap-1 text-red-600"><ClockIcon /> Accept before: {new Date(task.acceptDeadline).toLocaleString()}</span>
                                </div>
                                <div className="flex gap-4 mt-4">
                                    <button onClick={() => handleAccept(task.id)} className="px-4 py-2 bg-green-500 text-white rounded-lg">Accept</button>
                                </div>
                            </div>
                        ))}
                        {activeTasks.length === 0 && reAssignedTasks.length === 0 && <p className="text-gray-500">No new tasks available.</p>}
                    </div>
                </section>
                
                <section className="mt-8">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Tasks In Progress</h2>
                    <div className="space-y-4">
                        {inProgressTasks.length > 0 ? inProgressTasks.map(task => (
                            <div key={task.id} className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
                                <h3 className="font-bold">{task.title}</h3>
                                <p className="text-sm text-gray-600">{task.description}</p>
                                {task.mediaUrl && <a href={`${API_URL}${task.mediaUrl}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View Task Media</a>}
                                <form onSubmit={(e) => handleSubmitTask(e, task.id)} className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700">Submit Your Work</label>
                                    <input name="submissionFile" type="file" required className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                                    <button type="submit" className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg">Submit for Review</button>
                                </form>
                            </div>
                        )) : <p className="text-gray-500">No tasks in progress.</p>}
                    </div>
                </section>
            </>
            )}
        </div>
    );
};

const UserProfile = ({ userData, refreshUserData }) => {
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">My Profile</h1>
            <div className="bg-white p-6 rounded-lg shadow max-w-2xl mx-auto">
                <p><strong>Name:</strong> {userData.name}</p>
                <p><strong>Email:</strong> {userData.email}</p>
                <p><strong>Mobile:</strong> {userData.mobile || 'Not provided'}</p>
                <p><strong>Package:</strong> <span className="capitalize">{userData.package}</span></p>
                <p className="mt-4 text-gray-500">Profile editing form would be here.</p>
            </div>
        </div>
    );
};

const UserWallet = ({ userData }) => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiService.request('/api/wallet/history')
            .then(setTransactions)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">My Wallet</h1>
            <div className="bg-white p-6 rounded-lg shadow max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 p-6 bg-blue-600 text-white rounded-lg">
                    <div className="text-center md:text-left">
                        <h2 className="text-lg font-semibold">Current Balance</h2>
                        <p className="text-4xl font-bold">₹{Number(userData.walletBalance).toFixed(2)}</p>
                    </div>
                    <button className="mt-4 md:mt-0 bg-white text-blue-600 font-bold px-6 py-3 rounded-lg shadow hover:bg-gray-100">Request Withdrawal</button>
                </div>

                <h3 className="text-xl font-bold text-gray-700 mb-4">Earning History</h3>
                {loading ? <LoadingSpinner /> : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full leading-normal">
                            <thead>
                                <tr>
                                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
                                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.length > 0 ? transactions.map((tx, index) => (
                                    <tr key={index}>
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{tx.description}</td>
                                        <td className={`px-5 py-5 border-b border-gray-200 bg-white text-sm font-semibold ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                                            {tx.type === 'credit' ? '+' : '-'} ₹{Number(tx.amount).toFixed(2)}
                                        </td>
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{new Date(tx.timestamp).toLocaleString()}</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="3" className="text-center py-10 text-gray-500">No transactions yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

const ReferralNode = ({ user, level }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
        <div style={{ marginLeft: `${level * 20}px` }} className="my-2">
            <div className="flex items-center bg-gray-100 p-2 rounded">
                <span className="font-semibold">{user.name}</span>
                <span className="text-sm text-gray-600 ml-2">({user.email})</span>
                {user.children && user.children.length > 0 && (
                    <button onClick={() => setIsOpen(!isOpen)} className="ml-auto text-blue-500 text-sm">
                        {isOpen ? 'Hide' : 'Show'} ({user.children.length})
                    </button>
                )}
            </div>
            {isOpen && user.children && user.children.length > 0 && (
                <div className="border-l-2 border-blue-200 mt-1">
                    {user.children.map(child => (
                        <ReferralNode key={child.id} user={child} level={level + 1} />
                    ))}
                </div>
            )}
        </div>
    );
};

const UserReferrals = ({ userData }) => {
    const [tree, setTree] = useState([]);
    const [loading, setLoading] = useState(true);
    const referralLink = `${window.location.protocol}//${window.location.host}/?ref=${userData.referralCode}`;

    useEffect(() => {
        apiService.request('/api/referrals/tree')
            .then(setTree)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">My Referrals</h1>
            <div className="bg-white p-6 rounded-lg shadow mb-6">
                <h2 className="text-xl font-bold mb-2">Your Unique Referral Code</h2>
                <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-lg">
                    <input type="text" readOnly value={userData.referralCode || '...'} className="flex-grow bg-transparent outline-none font-mono text-lg" />
                    <button onClick={() => navigator.clipboard.writeText(userData.referralCode)} className="bg-blue-500 text-white px-4 py-1 rounded-lg">Copy Code</button>
                </div>
                <p className="text-sm text-gray-500 mt-2">Share this link with friends: <a href={referralLink} className="text-blue-600">{referralLink}</a></p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold mb-4">Your Referral Tree</h2>
                {loading ? <LoadingSpinner /> : (
                    <div>
                        {tree.length > 0 ? tree.map(user => (
                            <ReferralNode key={user.id} user={user} level={0} />
                        )) : (
                            <p className="text-center py-10 text-gray-500">You haven't referred anyone yet.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const Packages = ({ userData, refreshUserData }) => {
    const [packages, setPackages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState(null);

    useEffect(() => {
        apiService.request('/api/packages')
            .then(setPackages)
            .catch(error => setNotification({ message: error.message, type: 'error' }))
            .finally(() => setIsLoading(false));
    }, []);

    const handleUpgradeClick = (pkg) => {
        setSelectedPackage(pkg);
        setPurchaseModalOpen(true);
    };

    const handlePurchaseSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        formData.append('packageName', selectedPackage.name);
        formData.append('amount', selectedPackage.price);

        try {
            const result = await apiService.request('/api/packages/purchase', 'POST', formData, true);
            setNotification({ message: result.message, type: 'success' });
            setPurchaseModalOpen(false);
        } catch (error) {
            setNotification({ message: error.message, type: 'error' });
        }
    };

    return (
        <div>
            <Notification message={notification.message} type={notification.type} onDismiss={() => setNotification({ message: '', type: '' })} />
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Our Packages</h1>
            {isLoading ? <LoadingSpinner /> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {packages.map(pkg => (
                        <div key={pkg.id} className={`bg-white p-6 rounded-lg shadow border-t-4 ${pkg.color}`}>
                            <h2 className="text-2xl font-bold text-gray-800 capitalize">{pkg.name}</h2>
                            <p className="text-gray-600 mt-2">Daily Tasks: {pkg.tasks}</p>
                            <p className="text-gray-600">Validity: {pkg.validity} days</p>
                            <p className="text-4xl font-bold my-4">₹{Number(pkg.price).toFixed(2)}</p>
                            {userData.package === pkg.name ? (
                                <button disabled className="w-full bg-gray-400 text-white font-bold py-2 px-4 rounded cursor-not-allowed">
                                    Current Plan
                                </button>
                            ) : (
                                <button onClick={() => handleUpgradeClick(pkg)} className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                                    Upgrade
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
            <Modal isOpen={purchaseModalOpen} onClose={() => setPurchaseModalOpen(false)} title={`Upgrade to ${selectedPackage?.name}`}>
                {selectedPackage && (
                    <form onSubmit={handlePurchaseSubmit} className="space-y-4">
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <p className="font-semibold">Please pay ₹{selectedPackage.price} to the following UPI ID:</p>
                            <p className="text-lg font-mono bg-gray-200 p-2 rounded mt-2 text-center">8588004216-3@ybl</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">UTR/Transaction Number</label>
                            <input name="utrNumber" type="text" className="w-full px-4 py-2 border rounded-lg" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Payment Screenshot</label>
                            <input name="screenshot" type="file" className="w-full text-sm" required />
                        </div>
                        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg">Submit for Review</button>
                    </form>
                )}
            </Modal>
        </div>
    );
};

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [timer, setTimer] = useState(null);

    useEffect(() => {
        if (isOpen) {
            const newTimer = setTimeout(() => {
                setChatHistory(prev => [...prev, { sender: 'admin', text: "Admin is not available right now. Please share your query, and we'll get back to you." }]);
            }, 2 * 60 * 1000); // 2 minutes
            setTimer(newTimer);
        } else {
            clearTimeout(timer);
        }
        return () => clearTimeout(timer);
    }, [isOpen]);

    const handleSend = () => {
        if (!message.trim()) return;
        const whatsappUrl = `https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
        setChatHistory(prev => [...prev, { sender: 'user', text: message }]);
        setMessage('');
        clearTimeout(timer); // Clear the auto-reply timer once user sends a message
    };

    return (
        <div className="fixed bottom-5 right-5 z-30">
            {isOpen && (
                <div className="bg-white w-80 h-96 shadow-xl rounded-lg flex flex-col">
                    <div className="bg-blue-600 text-white p-3 rounded-t-lg">
                        <h3 className="font-bold">Chat with Admin</h3>
                    </div>
                    <div className="flex-1 p-4 overflow-y-auto">
                        {chatHistory.map((chat, index) => (
                            <div key={index} className={`my-2 p-2 rounded-lg max-w-xs ${chat.sender === 'user' ? 'bg-blue-100 ml-auto' : 'bg-gray-200'}`}>
                                {chat.text}
                            </div>
                        ))}
                    </div>
                    <div className="p-2 border-t flex">
                        <input 
                            type="text" 
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Type your message..." 
                            className="flex-1 px-3 py-2 border rounded-l-md"
                        />
                        <button onClick={handleSend} className="bg-blue-600 text-white px-4 rounded-r-md">Send</button>
                    </div>
                </div>
            )}
            <button onClick={() => setIsOpen(!isOpen)} className="bg-blue-600 text-white rounded-full p-4 shadow-lg mt-4">
                <ChatIcon />
            </button>
        </div>
    );
};

const MissedTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiService.request('/api/tasks/missed')
            .then(setTasks)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Missed & Rejected Tasks</h1>
            {loading ? <LoadingSpinner /> : (
                <div className="space-y-4">
                    {tasks.length > 0 ? tasks.map(task => (
                        <div key={task.id} className="bg-white p-4 rounded-lg shadow opacity-70">
                            <h3 className="font-bold">{task.title}</h3>
                            <p className="text-sm text-gray-600">{task.description}</p>
                            <p className="text-sm text-red-600 font-semibold mt-2">
                                {task.assignment_status === 'rejected' 
                                    ? 'Reason: You rejected this task.' 
                                    : 'Reason: You missed the deadline to accept.'}
                            </p>
                        </div>
                    )) : (
                        <p className="text-center py-10 text-gray-500">You have no missed or rejected tasks.</p>
                    )}
                </div>
            )}
        </div>
    );
};

const CompleteProfileForm = ({ userData, refreshUserData }) => {
    const [formData, setFormData] = useState({
        name: userData.name || '',
        mobile: userData.mobile || '',
        bankDetails: '',
        upiId: '',
        interests: '',
        youtubeLink: '',
        instagramLink: '',
        otherLink: '',
    });
    const [notification, setNotification] = useState({ message: '', type: '' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formPayload = new FormData(e.target);
        Object.entries(formData).forEach(([key, value]) => {
            if (!formPayload.has(key)) {
                formPayload.append(key, value);
            }
        });

        try {
            await apiService.request('/api/user/complete-profile', 'POST', formPayload, true);
            setNotification({ message: 'Profile completed successfully! Welcome!', type: 'success' });
            setTimeout(() => {
                refreshUserData();
            }, 1500);
        } catch (error) {
            setNotification({ message: error.message, type: 'error' });
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-lg bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Complete Your Creator Profile</h2>
                <p className="text-center text-gray-500 mb-6">Please provide these details to activate your account.</p>
                <Notification message={notification.message} type={notification.type} onDismiss={() => setNotification({ message: '', type: '' })} />
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" className="w-full px-4 py-2 border rounded-lg" required />
                    <input name="mobile" value={formData.mobile} onChange={handleChange} placeholder="Mobile Number" className="w-full px-4 py-2 border rounded-lg" required />
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Profile Picture</label>
                        <input name="profilePicture" type="file" className="w-full text-sm" />
                    </div>
                    <input name="instagramLink" value={formData.instagramLink} onChange={handleChange} placeholder="Instagram Profile Link (Required)" className="w-full px-4 py-2 border rounded-lg" required />
                    <input name="youtubeLink" value={formData.youtubeLink} onChange={handleChange} placeholder="YouTube Channel Link (Optional)" className="w-full px-4 py-2 border rounded-lg" />
                    <input name="otherLink" value={formData.otherLink} onChange={handleChange} placeholder="Other Social Media Link (Optional)" className="w-full px-4 py-2 border rounded-lg" />
                    <textarea name="interests" value={formData.interests} onChange={handleChange} placeholder="Your Content Niche/Interests (e.g., Gaming, Fashion, Tech)" className="w-full px-4 py-2 border rounded-lg" />
                    <input name="bankDetails" value={formData.bankDetails} onChange={handleChange} placeholder="Bank Details (for payment)" className="w-full px-4 py-2 border rounded-lg" />
                    <input name="upiId" value={formData.upiId} onChange={handleChange} placeholder="UPI ID (for payment)" className="w-full px-4 py-2 border rounded-lg" />
                    
                    <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg">Save and Continue</button>
                </form>
            </div>
        </div>
    );
};


// --- Main App Component ---
function App() {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUserData(null);
    };
    
    const fetchUserData = useCallback(async () => {
        if (token) {
            try {
                const data = await apiService.request('/api/me');
                setUserData(data);
            } catch (error) {
                handleLogout();
            }
        }
        setLoading(false);
    }, [token]);

    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    const handleLogin = (newToken) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setLoading(true);
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>;
    }

    if (!userData) {
        return <AuthPage onLogin={handleLogin} />;
    }

    if (userData.role === 'admin') {
        return <AdminDashboard userData={userData} handleLogout={handleLogout} />;
    }
    
    return <UserDashboard userData={userData} handleLogout={handleLogout} refreshUserData={fetchUserData} />;
}

export default App;
