const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcryptjs');      
const jwt = require('jsonwebtoken');     

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

mongoose.connect('mongodb://localhost:27017/giftyfy')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Schemas
const cakeSchema = new mongoose.Schema({ name: String, price: Number, image: String });
const birthdaySchema = new mongoose.Schema({ giftName: String, price: Number, image: String });
const anniversarySchema = new mongoose.Schema({ giftName: String, price: Number, image: String });
const giftSchema = new mongoose.Schema({ giftName: String, price: Number, image: String });

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  lastLogin: { type: Date }
});
const User = mongoose.model('User', userSchema, 'users');

// Models
const Cake = mongoose.model('Cake', cakeSchema, 'cakes');
const Birthday = mongoose.model('Birthday', birthdaySchema, 'birthday');
const Anniversary = mongoose.model('Anniversary', anniversarySchema, 'anniversary');
const Gift = mongoose.model('Gift', giftSchema, 'gift');

// Multer setup
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Cake routes
app.post('/api/cakes', upload.single('image'), async (req, res) => {
  const cake = new Cake({ name: req.body.name, price: req.body.price, image: req.file.filename });
  await cake.save();
  res.json(cake);
});
app.get('/api/cakes', async (req, res) => res.json(await Cake.find()));
app.delete('/api/cakes/:id', async (req, res) => {
  await Cake.findByIdAndDelete(req.params.id);
  res.json({ message: 'Cake deleted' });
});
app.put('/api/cakes/:id', upload.single('image'), async (req, res) => {
  const updateData = { name: req.body.name, price: req.body.price };
  if (req.file) updateData.image = req.file.filename;
  res.json(await Cake.findByIdAndUpdate(req.params.id, updateData, { new: true }));
});

// Birthday routes
app.post('/api/birthday', upload.single('image'), async (req, res) => {
  const gift = new Birthday({ giftName: req.body.giftName, price: req.body.price, image: req.file.filename });
  await gift.save();
  res.json(gift);
});
app.get('/api/birthday', async (req, res) => res.json(await Birthday.find()));
app.delete('/api/birthday/:id', async (req, res) => {
  await Birthday.findByIdAndDelete(req.params.id);
  res.json({ message: 'Gift deleted' });
});
app.put('/api/birthday/:id', upload.single('image'), async (req, res) => {
  const updateData = { giftName: req.body.giftName, price: req.body.price };
  if (req.file) updateData.image = req.file.filename;
  res.json(await Birthday.findByIdAndUpdate(req.params.id, updateData, { new: true }));
});

// Anniversary routes
app.post('/api/anniversary', upload.single('image'), async (req, res) => {
  const gift = new Anniversary({ giftName: req.body.giftName, price: req.body.price, image: req.file.filename });
  await gift.save();
  res.json(gift);
});
app.get('/api/anniversary', async (req, res) => res.json(await Anniversary.find()));
app.delete('/api/anniversary/:id', async (req, res) => {
  await Anniversary.findByIdAndDelete(req.params.id);
  res.json({ message: 'Gift deleted' });
});
app.put('/api/anniversary/:id', upload.single('image'), async (req, res) => {
  const updateData = { giftName: req.body.giftName, price: req.body.price };
  if (req.file) updateData.image = req.file.filename;
  res.json(await Anniversary.findByIdAndUpdate(req.params.id, updateData, { new: true }));
});

// Gift routes
app.post('/api/gift', upload.single('image'), async (req, res) => {
  const gift = new Gift({ giftName: req.body.giftName, price: req.body.price, image: req.file.filename });
  await gift.save();
  res.json(gift);
});
app.get('/api/gift', async (req, res) => res.json(await Gift.find()));
app.delete('/api/gift/:id', async (req, res) => {
  await Gift.findByIdAndDelete(req.params.id);
  res.json({ message: 'Gift deleted' });
});
app.put('/api/gift/:id', upload.single('image'), async (req, res) => {
  const updateData = { giftName: req.body.giftName, price: req.body.price };
  if (req.file) updateData.image = req.file.filename;
  res.json(await Gift.findByIdAndUpdate(req.params.id, updateData, { new: true }));
});

// User routes
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.json({ success: false, message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();

    res.json({ success: true, user: { email: newUser.email } });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.json({ success: false, message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.json({ success: false, message: "Invalid password" });

    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign({ id: user._id, email: user.email }, "secretKey", { expiresIn: "1h" });

    res.json({ success: true, token, user: { email: user.email, lastLogin: user.lastLogin } });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.get('/api/users/count', async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: "Error fetching user count" });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().select("email lastLogin");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users" });
  }
});

app.listen(5000, () => console.log('Server running on port 5000'));
