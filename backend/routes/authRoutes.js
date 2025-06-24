const express = require('express');
const router = express.Router();
const User = require('../models/User');


router.get('/', (req, res) => {
  if (req.session.user) {
    return res.redirect('/tasks');
  }
  res.redirect('/register'); 
});


router.get('/register', (req, res) => {
  res.render('auth/register');
});

router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

   
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.send('User already exists. Please login instead.');
    }

    const newUser = new User({ username, password });
    await newUser.save();
    console.log('User registered:', newUser.username);
    res.redirect('/login');
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).send('Registration failed.');
  }
});

router.get('/login', (req, res) => {
  res.render('auth/login');
});


router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.send('User not found. Please register.');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.send('Incorrect password.');
    }

    req.session.user = user;
    console.log('User logged in:', user.username);
    res.redirect('/tasks');
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).send('Login failed.');
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

module.exports = router;
