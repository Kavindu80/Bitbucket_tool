const express = require('express');
const axios = require('axios');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Student = require('./models/Student');
const Admin = require('./models/Admin');

dotenv.config();

const app = express();
const BITBUCKET_API_URL = 'https://api.bitbucket.org/2.0';

// Proper CORS configuration
app.use(cors({
  origin: 'https://bitbucket-tool-janakage.vercel.app', // Change this to your frontend URL if needed
  methods: 'GET, POST, PUT, DELETE, OPTIONS',
  allowedHeaders: 'Authorization, Content-Type',
  credentials: true,
}));

app.use(express.json());
app.use(morgan('dev'));

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

app.use((err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    status: err.statusCode || 500,
  });

  res.status(err.statusCode || 500).json({
    success: false,
    error: {
      message: err.message || 'Internal Server Error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
});

const validateCredentials = async (workspace, accessToken) => {
  try {
    const response = await axios.get(`${BITBUCKET_API_URL}/repositories/${workspace}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      timeout: 5000,
    });
    return response.status === 200;
  } catch (error) {
    throw new AppError(`Validation failed: ${error.message}`, error.response?.status || 500);
  }
};

// Login route
app.post(
  '/api/login',
  asyncHandler(async (req, res, next) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return next(new AppError('Username and password are required.', 400));
    }

    const student = await Student.findOne({ username });
    if (!student || !(await bcrypt.compare(password, student.password))) {
      return next(new AppError('Invalid username or password.', 401));
    }

    if (!(await validateCredentials(student.workspaceName, student.token))) {
      return next(new AppError('Workspace or token validation failed.', 401));
    }

    res.json({ success: true, message: 'Login successful', workspace: student.workspaceName, token: student.token });
  })
);

// Fetch projects
app.get(
  '/api/projects',
  asyncHandler(async (req, res, next) => {
    const { workspace } = req.query;
    const accessToken = req.headers.authorization?.split(' ')[1];

    if (!workspace || !accessToken) {
      return next(new AppError('Workspace and access token are required.', 400));
    }

    try {
      const response = await axios.get(`${BITBUCKET_API_URL}/repositories/${workspace}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      res.json({ success: true, repositories: response.data.values });
    } catch (error) {
      next(new AppError('Failed to fetch repositories.', 500));
    }
  })
);

// Fetch commits
app.get(
  '/api/commits',
  asyncHandler(async (req, res, next) => {
    const { workspace, repoSlug } = req.query;
    const accessToken = req.headers.authorization?.split(' ')[1];

    if (!workspace || !repoSlug || !accessToken) {
      return next(new AppError('Workspace, repoSlug, and access token are required.', 400));
    }

    try {
      const response = await axios.get(`${BITBUCKET_API_URL}/repositories/${workspace}/${repoSlug}/commits`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      res.json({ success: true, commits: response.data.values });
    } catch (error) {
      next(new AppError('Failed to fetch commits.', 500));
    }
  })
);

// Connect to MongoDB
mongoose.connect('mongodb+srv://kavindu:xppFRIgfwykHia2E@cluster0.iofqwq5.mongodb.net/bitbucket_admin?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
const adminRoutes = require('./routes/Admins');
app.use('/api/admin', adminRoutes);


const studentRoutes = require('./routes/Students');
app.use('/api/students', studentRoutes);


app.get('/', (req, res) => {
  res.send('Bitbucket Dashboard Backend is running.');
});

app.listen(4000, () => {
  console.log("Server is running");
});
