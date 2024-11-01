const express = require('express');
const router = express.Router();
const pool = require('../helpers/database');
const bcrypt = require('bcrypt');
const randomString = require("randomstring");
const saltRounds = 10;

/**
 * Router to check user data
 */
router.get('/:id', async (req, res) => {
  try {
    const sqlQuery = `SELECT UserID, Username, Email FROM user WHERE userID=?`;
    const rows = await pool.query(sqlQuery, req.params.id);
    res.status(200).json(rows);
  } catch (error) {
    res.status(400).send('Something went wrong, please try again');
  }
});

/**
 * Router to get users email
 */
router.get('/:id/get-email', async (req, res) => {
  try {
    const sqlQuery = `SELECT Email FROM user WHERE userID=?`;
    const rows = await pool.query(sqlQuery, req.params.id);
    res.status(200).json(rows[0].Email);
  } catch (error) {
    res.status(400).send('Something went wrong, please try again');
  }
});

/**
 * Router to register new user
 */
router.post('/register', async (req, res) => {
  try {
    const {username, email, password} = req.body;
    const encryptedPassword = await bcrypt.hash(password, saltRounds);

    const sqlQueryFindUsername = `SELECT user.Username FROM user WHERE user.Username=?`;
    const resultFindUsername = await pool.query(sqlQueryFindUsername, username);

    if (resultFindUsername.length === 0) {
      const sqlQueryFindEmail = `SELECT user.Email FROM user WHERE user.Email=?`;
      const resultFindEmail = await pool.query(sqlQueryFindEmail, email);

      if(resultFindEmail.length === 0){
        let generateUserID = randomString.generate({
          length: 40,
          charset: 'alphabetic'
        });

        const checkUserID = `SELECT user.UserID FROM user WHERE user.UserID=?`;
        let resultFindEmail = await pool.query(checkUserID, generateUserID);

        while(resultFindEmail.length !== 0){
          console.log('UserID is taken, I generate new')
          generateUserID = randomString.generate({
            length: 40,
            charset: 'alphabetic'
          });
          resultFindEmail = await pool.query(checkUserID, generateUserID);
        }

        const insertUser = 'INSERT INTO user (UserID, Username, Email, UserPassword) VALUES (?, ?, ?, ?)';
        await pool.query(insertUser, [generateUserID, username, email, encryptedPassword]);

        const getInsertedUserID = `SELECT user.UserID from user WHERE user.UserName = '${username}'`
        const insertedUserID = await pool.query(getInsertedUserID);
        const userID = insertedUserID[0].UserID;

        const insertCategory = `INSERT INTO category (CategoryName, UserID) VALUES ("Available", '${userID}')`;
        const resultInsertCategory = await pool.query(insertCategory);
        const insertedCategoryID = resultInsertCategory.insertId.toString();

        const insertSubCategory = `INSERT INTO subcategory (SubCategoryName, Balance, UserID, CategoryID) VALUES 
("Available Funds", 0, '${userID}', ${insertedCategoryID}), 
("Account Transfer", 0, '${userID}', ${insertedCategoryID})`;
        await pool.query(insertSubCategory);

        res.status(200).json('Register was successful');
      } else{
        res.status(409).send('Email is taken');
      }

    } else {
      res.status(409).send('Username is taken');
    }

  } catch (error) {
    res.status(400).send('Something went wrong, please try again');
  }
});

/**
 * Router to login in to your account
 */
router.post('/login', async (req, res) => {
  try {
    const {username, password} = req.body;

    const sqlGetUser = 'SELECT user.userID, user.UserPassword, user.IsActive FROM user WHERE user.Username=?';
    const rows = await pool.query(sqlGetUser, username);

    const isValid = await bcrypt.compare(password, rows[0].UserPassword);

    if(rows[0].IsActive === 1){
      if (isValid) {
        const sqlGetUser = `SELECT userID FROM user WHERE Username=?`;
        const userID = await pool.query(sqlGetUser, username);
        res.status(200).json(userID[0].userID);
      } else {
        res.status(401).send('Wrong password');
      }
    } else{
      res.status(401).send('User is not active');
    }

  } catch (error) {
    res.status(400).send("User not found, you must register first");
  }
});

/**
 * Router for password change
 */
router.post('/change-password', async (req, res) => {
  try{
    const {oldPassword, newPassword, userID} = req.body;

    const sqlGetUser = 'SELECT user.UserPassword FROM user WHERE user.UserID=?';
    const rows = await pool.query(sqlGetUser, [userID]);

    const isValid = await bcrypt.compare(oldPassword, rows[0].UserPassword);

    if (isValid) {
      const newEncryptedPassword = await bcrypt.hash(newPassword, saltRounds);

      const updateSQL = 'UPDATE user SET user.UserPassword =? WHERE user.UserID =?'
      await pool.query(updateSQL, [newEncryptedPassword, userID])

      res.status(200).send('Password changed successfully')

    } else{
      res.status(401).send('Old password is does not match, try again');
    }

  } catch (error) {
    res.status(400).send(error.message);
  }
});

/**
 * Router for email change
 */
router.post('/change-email', async (req, res) => {
  try{
    const {newEmail, userID} = req.body;

    const sqlQueryFindEmail = `SELECT user.Email FROM user WHERE user.Email=?`;
    const resultFindEmail = await pool.query(sqlQueryFindEmail, newEmail);

    if(resultFindEmail.length === 0) {

      const updateSQL = 'UPDATE user SET user.Email =? WHERE user.UserID =?'
      await pool.query(updateSQL, [newEmail, userID])

      res.status(200).send('Email changed successfully')
    } else {
      res.status(409).send('Email is already in use');
    }
  } catch (error) {
    res.status(400).send('Something went wrong');
  }
});

/**
 * Delete user
 */
router.post('/delete-user', async (req, res) => {
  try{
    const {userID} = req.body;

    const updateSQL = 'UPDATE user SET user.IsActive=0 WHERE user.UserID=?'
    await pool.query(updateSQL, userID)

    res.status(200).send('User is deleted')
  } catch (error) {
    res.status(400).send('Something went wrong');
  }
});



module.exports = router;