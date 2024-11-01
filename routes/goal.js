const express = require('express');
const router = express.Router();
const pool = require('../helpers/database');
const moment = require('moment');

/**
 * Find users all goals and them subcategory names
 */
router.get('/:id/get-goal-amounts', async (req, res) => {
  try {
    const sqlQuery = `SELECT goal.Amount, goal.GoalType, subcategory.SubCategoryName, goal.GoalDate FROM goal 
INNER JOIN subcategory ON goal.SubCategoryID = subcategory.SubCategoryID 
WHERE UserID=? AND subcategory.IsActive = 1`;
    const rows = await pool.query(sqlQuery, req.params.id);
    res.status(200).json(rows);
  } catch (error) {
    res.status(400).send('Can not get goal amounts');
  }
});

/**
 * Add new goal
 */
router.post('/new-goal', async (req, res) => {
  try {
    const {SubCategoryName, Amount, Date, Type, UserID} = req.body;
    const formatDate = moment(Date).format('YYYY-MM-DD');

    const sqlQueryFindGoal = `SELECT goal.SubCategoryID 
 FROM goal 
 INNER JOIN subcategory ON goal.SubCategoryID = subcategory.SubCategoryID
 WHERE subcategory.SubCategoryName=? AND subcategory.UserID=?`;
    const resultFindGoal = await pool.query(sqlQueryFindGoal, [SubCategoryName, UserID]);

    if(resultFindGoal.length === 0) {
      const sqlQueryFindSubcategory = `SELECT subcategory.SubCategoryID FROM subcategory WHERE subcategory.SubcategoryName=? AND subcategory.UserID=?`;
      const resultFindSubcategoryID = await pool.query(sqlQueryFindSubcategory,
          [SubCategoryName, UserID]);
      const subCategoryID = resultFindSubcategoryID[0].SubCategoryID;

      const sqlQuery = `INSERT INTO goal (goal.Amount, goal.GoalDate, goal.GoalType, goal.SubCategoryID) VALUES (?, ?, ?, ?)`;
      await pool.query(sqlQuery,
          [Amount, formatDate, Type, subCategoryID]);
      res.status(200).json('New goal was added');

    } else {
      const subCategoryID = resultFindGoal[0].SubCategoryID;
      const sqlQuery = `UPDATE goal SET goal.Amount = ${Amount}, goal.GoalType = '${Type}', goal.GoalDate = '${formatDate}' WHERE goal.SubCategoryID = ${subCategoryID}`
      await pool.query(sqlQuery);
      res.status(200).json('Goal updated successfully');
    }
  } catch (error) {
    res.status(400).send('Something went wrong, please try again');
  }
});

module.exports = router;