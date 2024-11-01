const express = require('express');
const router = express.Router();
const pool = require('../helpers/database');

//Changes date format
const moment = require('moment');

/**
 * Get users all budgets
 */
router.get('/:id', async (req, res) => {
  try {
    const sqlQuery = `SELECT budget.Amount, budget.ToCategory, budget.FromCategory, budget.BudgetDate FROM budget 
INNER JOIN mergebsc ON budget.BudgetID = mergebsc.BudgetID 
INNER JOIN subcategory ON mergebsc.FromSubCategoryID = subcategory.SubCategoryID 
WHERE subcategory.UserID=?`;

    const rows = await pool.query(sqlQuery, req.params.id);

    //For changing date-format to YYYY-MM-DD
    for (let i = 0; i < rows.length; i++) {
      rows[i].BudgetDate = moment(rows[i].BudgetDate).format('YYYY-MM-DD');
    }

    res.status(200).json(rows);
  } catch (error) {
    res.status(400).send('Something went wrong, please try again');
  }
});

/**
 * Add new budget (transfer money from x-category to y-category)
 */
router.post('/new-budget', async (req, res) => {
  try {
    const {
      Amount,
      BudgetDate,
      FromSubCategory,
      ToSubCategory,
      UserID,
        Type
    } = req.body;

    //if type is 1, it's for deleting subcategory (Not to reduce balance from Subcategory)

    const insertBudget = `INSERT INTO budget (Amount, BudgetDate, FromCategory, ToCategory) VALUES (?, ?, ?, ?)`;
    const rows = await pool.query(insertBudget,
        [Amount, BudgetDate, FromSubCategory, ToSubCategory]);

    const budgetID = rows.insertId;
    const fromSubCategoryIDQuery = `SELECT subcategory.SubCategoryID from subcategory WHERE subcategory.SubCategoryName = '${FromSubCategory}' AND subcategory.UserID = '${UserID}'`;
    const toSubCategoryIDQuery = `SELECT subcategory.SubCategoryID from subcategory WHERE subcategory.SubCategoryName = '${ToSubCategory}' AND subcategory.UserID = '${UserID}'`;
    const FromSubCategoryIDResult = await pool.query(fromSubCategoryIDQuery);
    const ToSubCategoryIDResult = await pool.query(toSubCategoryIDQuery);
    const FromSubCategoryID = FromSubCategoryIDResult[0].SubCategoryID;
    const ToSubCategoryID = ToSubCategoryIDResult[0].SubCategoryID;

    const insertMergebsc = `INSERT INTO mergebsc(mergebsc.BudgetID, mergebsc.FromSubCategoryID, mergebsc.ToSubCategoryID) VALUES (${budgetID}, ?, ?);`;
    await pool.query(insertMergebsc, [FromSubCategoryID, ToSubCategoryID]);

    if(Type !== 1) {
      const updateFromBalance = `UPDATE subcategory 
SET SubCategory.Balance = (SELECT SubCategory.Balance FROM subcategory WHERE subcategory.SubCategoryID = ${FromSubCategoryID}) - ${Amount} 
WHERE subcategory.SubCategoryID = ${FromSubCategoryID}`;
      await pool.query(updateFromBalance);
    }
    const updateToBalance = `UPDATE subcategory 
SET SubCategory.Balance = (SELECT SubCategory.Balance FROM subcategory WHERE subcategory.SubCategoryID = ${ToSubCategoryID}) + ${Amount} 
WHERE subcategory.SubCategoryID = ${ToSubCategoryID}`;
    await pool.query(updateToBalance);

    const budgetIDtoString = budgetID.toString();
    res.status(200).json({budgetID: budgetIDtoString});

  } catch (error) {
    res.status(400).send('Something went wrong, please try again');
  }
});

module.exports = router;