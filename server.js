const express = require('express');
const dotenv = require('dotenv');
dotenv.config({path: '.env'});
const PORT = process.env.LOCALPORT;
const app = express();
const cors = require('cors');
app.use(cors());

//middleware
app.use(express.json());
app.use(express.urlencoded({extended: false}));

const userRouter = require('./routes/user');
app.use('/user', userRouter);

const transactionRouter = require('./routes/transaction');
app.use('/transaction', transactionRouter);

const accountRouter = require('./routes/account');
app.use('/account', accountRouter);

const budgetRouter = require('./routes/budget');
app.use('/budget', budgetRouter);

const categoryRouter = require('./routes/category');
app.use('/category', categoryRouter);

const subcategoryRouter = require('./routes/subcategory');
app.use('/subcategory', subcategoryRouter);

const goalRouter = require('./routes/goal');
app.use('/goal', goalRouter);

//Start listening
app.listen(PORT, () => {
  console.log(`Listening port ${PORT}`);
});