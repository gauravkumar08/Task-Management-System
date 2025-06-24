const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/task-manager')
  .then(() => {
    console.log('✅ Connected to MongoDB');
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
  });

// Set EJS as view engine and define views path
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../frontend/views'));

// Serve static assets (optional if you have CSS/JS/images in /public)
app.use(express.static(path.join(__dirname, '../frontend/public')));

// Middleware setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// Session management
app.use(session({
  secret: 'secretkey',
  resave: false,
  saveUninitialized: false
}));

// Make session user available to all views
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user;
  next();
});

// Routes
app.use('/', authRoutes);
app.use('/tasks', taskRoutes);

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
