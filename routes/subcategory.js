const express = require('express');
const router = express.Router();
const pool = require('../helpers/database');

/**
 * Returns users SubCategoryName and Balance
 */
router.get('/:id', async (req, res) => {
  try {
    const sqlQuery = `SELECT SubCategoryName, Balance FROM subcategory WHERE UserID=? AND subcategory.IsActive = 1`;
    const rows = await pool.query(sqlQuery, req.params.id);
    res.status(200).json(rows);
  } catch (error) {
    res.status(400).send('Something went wrong, please try again');
  }
});

/**
 * Get users subcategories
 */
router.get('/:id/subcategory-name', async (req, res) => {
  try {
    const sqlQuery = `SELECT subcategory.SubCategoryName FROM subcategory WHERE subcategory.UserID=? AND subcategory.IsActive = 1`;
    const rows = await pool.query(sqlQuery, req.params.id);
    res.status(200).json(rows);
  } catch (error) {
    res.status(400).send('Something went wrong, please try again');
  }
});

/**
 * Get users subcategories name and balance
 */
router.get('/:id/subcategory-name-and-balance', async (req, res) => {
  try {
    const sqlQuery = `SELECT subcategory.SubCategoryName, subcategory.Balance FROM subcategory WHERE UserID=? AND subcategory.IsActive = 1 
AND subcategory.SubCategoryName != 'Account Transfer';`;
    const rows = await pool.query(sqlQuery, req.params.id);
    res.status(200).json(rows);
  } catch (error) {
    res.status(400).send('Something went wrong, please try again');
  }
});

/**
 * Get available to budget balance
 */
router.get('/:id/available-to-budget', async (req, res) => {
  try {
    const sqlQuery = `SELECT subcategory.Balance FROM subcategory WHERE UserID=? AND subcategory.SubCategoryName = 'Available Funds'`;
    const rows = await pool.query(sqlQuery, req.params.id);
    res.status(200).send(rows);
  } catch (error) {
    res.status(400).send('Something went wrong, please try again');
  }
});

/**
 * Get certain subcategory's name, balance and category
 */
router.get(
    '/user-:UserID/get-subcategory-details/subCategoryName-:SubCategoryName',
    async (req, res) => {
      try {
        const UserID = req.params.UserID;
        const SubCategoryName = req.params.SubCategoryName;

        const sqlQuery = `SELECT subcategory.Balance, category.CategoryName
 FROM subcategory
 INNER JOIN category ON subcategory.CategoryID = category.CategoryID
 WHERE subcategory.SubCategoryName = '${SubCategoryName}' AND subcategory.UserID = '${UserID}'`;

        const rows = await pool.query(sqlQuery);
        res.status(200).json(rows);
      } catch (error) {
        res.status(400).send('Cant get Activity and Budgeted value');
      }
    });

/**
 * Get certain subcategory's transactions sum
 */
router.get('/user-:UserID/activity-and-budgeted-this-month/date-:Date',
    async (req, res) => {
      try {
        const userID = req.params.UserID;
        const date = req.params.Date;
        const startDate = `${date}-1`;
        const endDate = `${date}-31`;

        const sqlQueryActivity = `SELECT subcategory.SubCategoryName, (SUM(transaction.Inflow) - SUM(transaction.Outflow)) AS 'Balance' 
FROM subcategory 
INNER JOIN transaction ON subcategory.SubCategoryID = transaction.SubCategoryID 
INNER JOIN account ON transaction.AccountID = account.AccountID 
INNER JOIN user ON account.UserID = user.UserID 
WHERE user.UserID = '${userID}' AND transaction.TransactionDate BETWEEN '${startDate}' AND '${endDate}' AND NOT subcategory.SubCategoryName = 'Available Funds' 
GROUP BY subcategory.SubcategoryName;`;

        const activity = await pool.query(sqlQueryActivity);

        const sqlQueryBudgetedTo = `SELECT subcategory.SubCategoryName, SUM(budget.Amount) As 'Budgeted' from subcategory
INNER JOIN mergebsc ON subcategory.SubCategoryID = mergebsc.ToSubCategoryID
INNER JOIN budget ON mergebsc.BudgetID = budget.BudgetID
INNER JOIN user ON subcategory.UserID = user.UserID
WHERE user.UserID = '${userID}' AND budget.BudgetDate BETWEEN '${startDate}' AND '${endDate}' AND NOT subcategory.SubCategoryName = 'Available Funds'
GROUP BY subcategory.SubcategoryName;`;

        let budgeted = await pool.query(sqlQueryBudgetedTo);

        const sqlQueryBudgetedFrom = `SELECT subcategory.SubCategoryName, SUM(budget.Amount) As 'Budgeted' from subcategory
INNER JOIN mergebsc ON subcategory.SubCategoryID = mergebsc.FromSubCategoryID
INNER JOIN budget ON mergebsc.BudgetID = budget.BudgetID
INNER JOIN user ON subcategory.UserID = user.UserID
WHERE user.UserID = '${userID}' AND budget.BudgetDate BETWEEN '${startDate}' AND '${endDate}' AND NOT subcategory.SubCategoryName = 'Available Funds'
GROUP BY subcategory.SubcategoryName;`;

        const budgetedMinus = await pool.query(sqlQueryBudgetedFrom);

        const checkIfExists = new Set();

        for (let y = 0; budgetedMinus.length > y; y++) {
          checkIfExists.add(budgetedMinus[y].SubCategoryName);
        }

        for (let x = 0; budgeted.length > x; x++) {

          if (checkIfExists.has(budgeted[x].SubCategoryName)) {
            const minusIndex = budgetedMinus.findIndex(
                obj => obj.SubCategoryName === budgeted[x].SubCategoryName);

            budgeted[x].Budgeted = budgeted[x].Budgeted -
                budgetedMinus[minusIndex].Budgeted;
          }
        }

        for (let z = 0; budgeted.length > z; z++) {
          for (let n = 0; activity.length > n; n++) {
            if (budgeted[z].SubCategoryName === activity[n].SubCategoryName) {
              budgeted[z].Activity = activity[n].Balance;
              break;
            } else {
              budgeted[z].Activity = 0;
            }
          }
        }

        res.status(200).json(budgeted);

      } catch (error) {
        res.status(400).send('Something went wrong, please try again');
      }
    });

/**
 * Add new subcategory
 */
router.post('/new-subcategory', async (req, res) => {
  try {
    const {SubCategoryName, Balance, UserID, CategoryID} = req.body;

    const sqlQueryFindSubcategory = `SELECT subcategory.SubcategoryName FROM subcategory WHERE subcategory.SubcategoryName=? AND subcategory.UserID=?`;
    const resultFindSubcategory = await pool.query(sqlQueryFindSubcategory,
        [SubCategoryName, UserID]);

    if (resultFindSubcategory.length === 0) {

      const sqlQuery = `INSERT INTO subcategory (SubCategoryName, Balance, UserID, CategoryID) VALUES (?, ?, ?, ?)`;

      await pool.query(sqlQuery,
          [SubCategoryName, Balance, UserID, CategoryID]);
      res.status(200).json('New subcategory was added');
    } else {
      res.status(409).json('Subcategory already exists');
    }

  } catch (error) {
    res.status(400).send('Something went wrong, please try again');
  }
});

/**
 * Deactivate subcategory
 */
router.post('/deactivate-subcategory', async (req, res) => {
  try {
    const {UserID, SubCategoryName} = req.body;
    const sqlQuery = `UPDATE subcategory SET subcategory.IsActive = 0, subcategory.Balance = 0
 WHERE subcategory.UserID = '${UserID}' AND subcategory.SubCategoryName = '${SubCategoryName}'`;
    await pool.query(sqlQuery);

    const deleteGoal = `DELETE FROM goal WHERE goal.SubCategoryID =
 (SELECT subcategory.SubCategoryID from subcategory WHERE subcategory.UserID = '${UserID}' AND subcategory.SubCategoryName = '${SubCategoryName}')`;
    await pool.query(deleteGoal);

    res.status(200).send(`Subcategory ${SubCategoryName} is deactivated`);

  } catch (error) {
    res.status(400).send('Something went wrong, please try again');
  }
});

/**
 * Update subcategory's category and/or subcategory name
 */
router.post('/update-subcategory', async (req, res) => {
  try {
    const {NewSubCategoryName, NewCategory, UserID, SubCategoryName} = req.body;
    const sqlQuery = `UPDATE subcategory SET subcategory.SubCategoryName = '${NewSubCategoryName}',
 subcategory.CategoryID = (SELECT category.CategoryID FROM category WHERE category.CategoryName = '${NewCategory}' AND category.userID = '${UserID}')
 WHERE subcategory.UserID = '${UserID}' AND subcategory.SubCategoryName = '${SubCategoryName}'`;
    await pool.query(sqlQuery);

    res.status(200).
        send(
            `Subcategory is now ${NewSubCategoryName} and it's category is ${NewCategory}`);

  } catch (error) {
    res.status(400).send('Something went wrong, please try again');
  }
});

module.exports = router;