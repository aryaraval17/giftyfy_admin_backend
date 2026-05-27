const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const cors = require('cors');

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

// Models with explicit collection names
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

app.listen(5000, () => console.log('Server running on port 5000'));
