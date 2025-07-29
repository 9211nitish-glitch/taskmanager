/*
 * =================================================================
 * TASK MANAGEMENT BACKEND API (Node.js, Express, MySQL)
 * =================================================================
 * */

const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const { customAlphabet } = require('nanoid');

const app = express();
const PORT = process.env.PORT || 8080;

// --- CONFIGURATION ---
const JWT_SECRET = 'your_super_secret_jwt_key_change_this';
const REFERRAL_LEVELS = [0.10, 0.05, 0.04, 0.03, 0.02];
const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 8);
const ADMIN_USER_ID = 1; // Assuming the first user (ID=1) is the admin. Change if needed.

// --- Database Configuration ---
const dbConfig = {
    host: 'swift.herosite.pro',
    user: 'test2',
    password: 'Trytohard@1',
    database: 'test2',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- FILE UPLOAD SETUP ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage: storage });

// --- AUTHENTICATION MIDDLEWARE ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.status(401).json({ message: 'Authentication token required.' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid or expired token.' });
        req.user = user;
        next();
    });
};

const isAdmin = async (req, res, next) => {
    try {
        const [rows] = await pool.query('SELECT role FROM users WHERE id = ?', [req.user.id]);
        if (rows.length === 0 || rows[0].role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin role required.' });
        }
        next();
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// --- Referral Distribution Logic ---
async function distributeReferralEarnings(connection, initialUserId, taskPoints, taskTitle) {
    let currentUserId = initialUserId;
    
    for (let i = 0; i < REFERRAL_LEVELS.length; i++) {
        const [users] = await connection.query('SELECT referredBy FROM users WHERE id = ?', [currentUserId]);
        if (users.length === 0 || !users[0].referredBy) break;
        
        const referrerId = users[0].referredBy;
        const commissionRate = REFERRAL_LEVELS[i];
        const commissionAmount = taskPoints * commissionRate;

        await connection.query("UPDATE users SET walletBalance = walletBalance + ? WHERE id = ?", [commissionAmount, referrerId]);
        const description = `Level ${i + 1} referral commission for task "${taskTitle}"`;
        await connection.query(
            "INSERT INTO transactions (userId, amount, type, description) VALUES (?, ?, 'credit', ?)",
            [referrerId, commissionAmount, description]
        );
        currentUserId = referrerId;
    }
}


// --- API ROUTES ---

app.post('/api/signup', async (req, res) => {
    const { name, email, mobile, password, referralId, userType } = req.body;
    if (!name || !email || !password || !userType) return res.status(400).json({ message: 'Name, email, password, and user type are required.' });

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        let referrerDbId = null;
        if (referralId) {
            const [referrer] = await connection.query('SELECT id FROM users WHERE referralCode = ?', [referralId]);
            if (referrer.length > 0) referrerDbId = referrer[0].id;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const referralCode = `TASK-${nanoid()}`;

        const [result] = await connection.query(
            'INSERT INTO users (name, email, mobile, password, referredBy, referralCode, userType) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, email, mobile, hashedPassword, referrerDbId, referralCode, userType]
        );
        
        await connection.commit();
        res.status(201).json({ message: 'User created successfully', userId: result.insertId });
    } catch (error) {
        await connection.rollback();
        if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Email or Referral Code already exists.' });
        res.status(500).json({ message: 'Database error', error: error.message });
    } finally {
        connection.release();
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) return res.status(401).json({ message: 'Invalid credentials' });

        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        const tokenPayload = { id: user.id, email: user.email, role: user.role };
        const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1d' });

        res.json({ message: 'Login successful', token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

app.get('/api/me', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, name, email, mobile, role, package, photoURL, bankDetails, upiId, interests, walletBalance, referralCode, userType, isProfileComplete, youtubeLink, instagramLink, otherLink FROM users WHERE id = ?', [req.user.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'User not found' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

// --- ADMIN ROUTES ---

app.get('/api/admin/users', authenticateToken, isAdmin, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, name, email, role, package, walletBalance, referralCode FROM users');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

app.post('/api/admin/tasks', authenticateToken, isAdmin, upload.single('media'), async (req, res) => {
    const { title, description, points, acceptTimer, completeTimer, userIds } = req.body;
    const mediaUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const acceptDeadline = new Date(Date.now() + Number(acceptTimer) * 60 * 60 * 1000);
    const completeDeadline = new Date(Date.now() + Number(completeTimer) * 60 * 60 * 1000);
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const [taskResult] = await connection.query(
            'INSERT INTO tasks (title, description, points, mediaUrl, acceptDeadline, completeDeadline) VALUES (?, ?, ?, ?, ?, ?)',
            [title, description, points, mediaUrl, acceptDeadline, completeDeadline]
        );
        const taskId = taskResult.insertId;
        const assignedUsers = JSON.parse(userIds);
        for (const userId of assignedUsers) {
            await connection.query('INSERT INTO task_assignments (taskId, userId) VALUES (?, ?)', [taskId, userId]);
        }
        await connection.commit();
        res.status(201).json({ message: 'Task created and assigned successfully', taskId });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ message: 'Database error', error: error.message });
    } finally {
        connection.release();
    }
});

app.get('/api/admin/tasks/pending', authenticateToken, isAdmin, async (req, res) => {
    try {
        const query = `
            SELECT t.id, t.title, t.points, s.fileUrl, s.submittedAt, u.id as userId, u.name as userName, u.email as userEmail
            FROM tasks t JOIN submissions s ON t.id = s.taskId JOIN users u ON s.userId = u.id
            WHERE t.status = 'pending_review' ORDER BY s.submittedAt DESC`;
        const [rows] = await pool.query(query);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

app.post('/api/admin/tasks/:id/approve', authenticateToken, isAdmin, async (req, res) => {
    const taskId = req.params.id;
    const { userId, points, title } = req.body;
    if (!userId || !points || !title) return res.status(400).json({ message: 'User ID, points, and title are required.' });

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        await connection.query("UPDATE tasks SET status = 'approved' WHERE id = ?", [taskId]);
        await connection.query("UPDATE users SET walletBalance = walletBalance + ? WHERE id = ?", [points, userId]);
        await connection.query(
            "INSERT INTO transactions (userId, amount, type, description) VALUES (?, ?, 'credit', ?)",
            [userId, points, `Points for approved task: "${title}"`]
        );
        await connection.query("UPDATE task_assignments SET status = 'completed' WHERE taskId = ? AND userId = ?", [taskId, userId]);
        await distributeReferralEarnings(connection, userId, points, title);
        await connection.commit();
        res.json({ message: 'Task approved and all earnings distributed successfully.' });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ message: 'Database error', error: error.message });
    } finally {
        connection.release();
    }
});

app.post('/api/admin/tasks/:id/reassign', authenticateToken, isAdmin, async (req, res) => {
    const taskId = req.params.id;
    const { userId, notes } = req.body;
    if (!userId || !notes) return res.status(400).json({ message: 'User ID and notes are required.' });

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        await connection.query("UPDATE tasks SET status = 're_assigned', reviewNotes = ? WHERE id = ?", [notes, taskId]);
        await connection.query("UPDATE task_assignments SET status = 'assigned' WHERE taskId = ? AND userId = ?", [taskId, userId]);
        await connection.query("DELETE FROM submissions WHERE taskId = ? AND userId = ?", [taskId, userId]);
        await connection.commit();
        res.json({ message: 'Task has been re-assigned to the user for correction.' });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ message: 'Database error', error: error.message });
    } finally {
        connection.release();
    }
});

app.get('/api/admin/packages', authenticateToken, isAdmin, async (req, res) => {
    try {
        const [packages] = await pool.query('SELECT * FROM packages ORDER BY price ASC');
        res.json(packages);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

app.post('/api/admin/packages', authenticateToken, isAdmin, async (req, res) => {
    const { name, tasks, price, color } = req.body;
    try {
        await pool.query(
            'INSERT INTO packages (name, tasks, price, color) VALUES (?, ?, ?, ?)',
            [name.toLowerCase(), tasks, price, color]
        );
        res.status(201).json({ message: 'Package created successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

app.put('/api/admin/packages/:id', authenticateToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    const { name, tasks, price, color } = req.body;
    try {
        await pool.query(
            'UPDATE packages SET name = ?, tasks = ?, price = ?, color = ? WHERE id = ?',
            [name.toLowerCase(), tasks, price, color, id]
        );
        res.json({ message: 'Package updated successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

app.get('/api/admin/purchases', authenticateToken, isAdmin, async (req, res) => {
    try {
        const [purchases] = await pool.query(`
            SELECT pp.id, pp.packageName, pp.amount, pp.utrNumber, pp.screenshotUrl, pp.status, pp.createdAt, u.name as userName, u.email as userEmail
            FROM package_purchases pp
            JOIN users u ON pp.userId = u.id
            WHERE pp.status = 'pending'
            ORDER BY pp.createdAt ASC
        `);
        res.json(purchases);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

app.post('/api/admin/purchases/:id/approve', authenticateToken, isAdmin, async (req, res) => {
    const purchaseId = req.params.id;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const [purchase] = await connection.query('SELECT * FROM package_purchases WHERE id = ?', [purchaseId]);
        if (purchase.length === 0) throw new Error('Purchase request not found.');

        const { userId, packageName } = purchase[0];
        
        await connection.query("UPDATE users SET package = ? WHERE id = ?", [packageName, userId]);
        await connection.query("UPDATE package_purchases SET status = 'approved' WHERE id = ?", [purchaseId]);

        await connection.commit();
        res.json({ message: 'Package purchase approved successfully.' });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ message: 'Database error', error: error.message });
    } finally {
        connection.release();
    }
});

app.post('/api/admin/purchases/:id/decline', authenticateToken, isAdmin, async (req, res) => {
    const purchaseId = req.params.id;
    try {
        await pool.query("UPDATE package_purchases SET status = 'declined' WHERE id = ?", [purchaseId]);
        res.json({ message: 'Package purchase declined.' });
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

// --- NEW --- ADMIN INQUIRY ROUTES
app.get('/api/admin/inquiries', authenticateToken, isAdmin, async (req, res) => {
    try {
        const [inquiries] = await pool.query(`
            SELECT i.id, i.query, i.status, i.createdAt, u.name as userName, u.email as userEmail, u.id as userId
            FROM inquiries i
            JOIN users u ON i.userId = u.id
            WHERE i.status = 'pending'
            ORDER BY i.createdAt ASC
        `);
        res.json(inquiries);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

app.post('/api/admin/inquiries/:id/reply', authenticateToken, isAdmin, async (req, res) => {
    const inquiryId = req.params.id;
    const { userId, message } = req.body;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        // Send reply as a chat message from admin to user
        await connection.query(
            'INSERT INTO chat_messages (senderId, receiverId, message) VALUES (?, ?, ?)',
            [ADMIN_USER_ID, userId, message]
        );
        // Mark inquiry as answered
        await connection.query("UPDATE inquiries SET status = 'answered' WHERE id = ?", [inquiryId]);
        await connection.commit();
        res.json({ message: 'Reply sent successfully.' });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ message: 'Database error', error: error.message });
    } finally {
        connection.release();
    }
});


// --- USER ROUTES ---

app.post('/api/user/complete-profile', authenticateToken, upload.single('profilePicture'), async (req, res) => {
    const { name, mobile, bankDetails, upiId, interests, youtubeLink, instagramLink, otherLink } = req.body;
    const photoURL = req.file ? `/uploads/${req.file.filename}` : null;

    if (!instagramLink) {
        return res.status(400).json({ message: 'Instagram link is mandatory.' });
    }

    try {
        await pool.query(
            `UPDATE users SET 
                name = ?, mobile = ?, bankDetails = ?, upiId = ?, interests = ?, 
                youtubeLink = ?, instagramLink = ?, otherLink = ?, photoURL = ?, isProfileComplete = TRUE
             WHERE id = ?`,
            [name, mobile, bankDetails, upiId, interests, youtubeLink, instagramLink, otherLink, photoURL, req.user.id]
        );
        res.json({ message: 'Profile completed successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

app.get('/api/tasks/missed', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT t.*, ta.status as assignment_status 
             FROM tasks t 
             JOIN task_assignments ta ON t.id = ta.taskId 
             WHERE ta.userId = ? AND (ta.status = 'rejected' OR (ta.status = 'assigned' AND t.acceptDeadline < NOW()))`,
            [req.user.id]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

app.post('/api/packages/purchase', authenticateToken, upload.single('screenshot'), async (req, res) => {
    const { packageName, amount, utrNumber } = req.body;
    const screenshotUrl = req.file ? `/uploads/${req.file.filename}` : null;

    if (!packageName || !amount || !utrNumber || !screenshotUrl) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        await pool.query(
            'INSERT INTO package_purchases (userId, packageName, amount, utrNumber, screenshotUrl) VALUES (?, ?, ?, ?, ?)',
            [req.user.id, packageName, amount, utrNumber, screenshotUrl]
        );
        res.status(201).json({ message: 'Your purchase request has been submitted for review.' });
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});


app.get('/api/tasks/my-tasks', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT t.*, ta.status as assignment_status FROM tasks t JOIN task_assignments ta ON t.id = ta.taskId WHERE ta.userId = ?`,
            [req.user.id]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

app.post('/api/tasks/:id/accept', authenticateToken, async (req, res) => {
    const taskId = req.params.id;
    const userId = req.user.id;
    try {
        const [result] = await pool.query("UPDATE task_assignments SET status = 'accepted' WHERE taskId = ? AND userId = ? AND status = 'assigned'", [taskId, userId]);
        if (result.affectedRows === 0) return res.status(404).json({message: "Task not found or already processed."});
        res.json({ message: 'Task accepted' });
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

app.post('/api/tasks/:id/submit', authenticateToken, upload.single('submissionFile'), async (req, res) => {
    const taskId = req.params.id;
    const userId = req.user.id;
    const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;
    if (!fileUrl) return res.status(400).json({ message: 'Submission file is required.' });
    
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const [assignment] = await connection.query("SELECT status FROM task_assignments WHERE taskId = ? AND userId = ?", [taskId, userId]);
        if (assignment.length === 0 || assignment[0].status !== 'accepted') throw new Error('Task must be accepted before submitting.');
        await connection.query('INSERT INTO submissions (taskId, userId, fileUrl) VALUES (?, ?, ?)', [taskId, userId, fileUrl]);
        await connection.query("UPDATE task_assignments SET status = 'submitted' WHERE taskId = ? AND userId = ?", [taskId, userId]);
        await connection.query("UPDATE tasks SET status = 'pending_review' WHERE id = ?", [taskId]);
        await connection.commit();
        res.json({ message: 'Task submitted for review' });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ message: 'Database error during submission.', error: error.message });
    } finally {
        connection.release();
    }
});

app.get('/api/wallet/history', authenticateToken, async (req, res) => {
    try {
        const [transactions] = await pool.query(
            'SELECT amount, type, description, timestamp FROM transactions WHERE userId = ? ORDER BY timestamp DESC',
            [req.user.id]
        );
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

app.post('/api/user/upgrade-package', authenticateToken, async (req, res) => {
    const { newPackage } = req.body;
    try {
        await pool.query("UPDATE users SET package = ? WHERE id = ?", [newPackage, req.user.id]);
        res.json({ message: `Package successfully upgraded to ${newPackage}.` });
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

app.get('/api/packages', async (req, res) => {
    try {
        const [packages] = await pool.query('SELECT * FROM packages ORDER BY price ASC');
        res.json(packages);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});


async function getReferralTree(userId, level = 0, maxLevel = 5) {
    if (level >= maxLevel) return [];

    const [referrals] = await pool.query('SELECT id, name, email, createdAt FROM users WHERE referredBy = ?', [userId]);
    const tree = [];
    for (const ref of referrals) {
        const children = await getReferralTree(ref.id, level + 1, maxLevel);
        tree.push({ ...ref, children });
    }
    return tree;
}

app.get('/api/referrals/tree', authenticateToken, async (req, res) => {
    try {
        const referralTree = await getReferralTree(req.user.id);
        res.json(referralTree);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

// --- NEW --- CHAT ROUTES
app.get('/api/chat/history', authenticateToken, async (req, res) => {
    try {
        const [messages] = await pool.query(
            'SELECT * FROM chat_messages WHERE (senderId = ? AND receiverId = ?) OR (senderId = ? AND receiverId = ?) ORDER BY createdAt ASC',
            [req.user.id, ADMIN_USER_ID, ADMIN_USER_ID, req.user.id]
        );
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

app.post('/api/inquiries', authenticateToken, async (req, res) => {
    const { query } = req.body;
    try {
        await pool.query('INSERT INTO inquiries (userId, query) VALUES (?, ?)', [req.user.id, query]);
        res.status(201).json({ message: 'Your inquiry has been submitted. The admin will reply shortly.' });
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});


// --- START SERVER ---
app.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
});
