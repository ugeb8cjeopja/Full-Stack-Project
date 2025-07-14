const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const port = 3019;


app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname)); 


mongoose.connect('mongodb://127.0.0.1:27017/expenseDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.once('open', () => {
  console.log('✅ Connected to MongoDB');
});


const expenseSchema = new mongoose.Schema({
  amount: String,
  category: String,
  description: String,
  date: String
});

const Expense = mongoose.model('Expense', expenseSchema);


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'track.html'));
});


app.post('/post', async (req, res) => {
  const { amount, category, description, date } = req.body;

  const newExpense = new Expense({
    amount,
    category,
    description,
    date
  });

  await newExpense.save();
  console.log('✅ New Expense Saved:', newExpense);

  res.send("Form submitted successfully");
});


app.listen(port, () => {
  console.log(`🚀 Server is running at http://localhost:${port}`);
});
const moment = require('moment'); 

app.get('/summary', async (req, res) => {
  const now = moment();
  const startOfMonth = now.clone().startOf('month').format('YYYY-MM-DD');
  const endOfMonth = now.clone().endOf('month').format('YYYY-MM-DD');

  const expenses = await Expense.find({
    date: { $gte: startOfMonth, $lte: endOfMonth }
  });

  const total = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
  const totalTransactions = expenses.length;

  // Find number of unique days with expenses
  const days = new Set(expenses.map(e => e.date));
  const avgPerDay = days.size ? (total / days.size).toFixed(2) : total;

  res.json({
    total: total.toFixed(2),
    totalTransactions,
    avgPerDay
  });
});
