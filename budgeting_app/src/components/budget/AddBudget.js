import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import {Select} from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import DialogActions from '@mui/material/DialogActions';
import React, {useState} from 'react';
import Axios from 'axios';
import AddCircleOutline from "@mui/icons-material/AddCircleOutline";

const AddBudget = ({setAddDashboardSuccess, setEffectOpen, setMessage}) => {

    const [open, setOpen] = useState(false);
    const [amount, setAmount] = useState(0.00);
    const [fromSubCategory, setFromSubCategory] = useState('');
    const [toSubCategory, setToSubCategory] = useState('');
    const [subCategoryList, setSubCategoryList] = useState([]);
    const [isDisabled, setIsDisabled] = useState(false);
    const [fromSubEmptyError, setFromSubEmptyError] = useState(false);
    const [toSubEmptyError, setToSubEmptyError] = useState(false);
    const [amountEmptyError, setAmountEmptyError] = useState(false);

    const handleClickOpen = () => {
        setOpen(true);
        setAmountEmptyError(false);
        setToSubEmptyError(false);
        setFromSubEmptyError(false);
    };

    const handleClose = () => {
        setOpen(false);
        setFromSubCategory('');
        setToSubCategory('');
        setAmountEmptyError(false);
        setToSubEmptyError(false);
        setFromSubEmptyError(false);
    };

    const getUserSubcategories = () => {
        const userID = localStorage.getItem('UserID');
        const baseUrl = `http://localhost:3001/subcategory/${userID}/subcategory-name-and-balance`;
        const updatedArray = [];
        Axios.get(baseUrl,
        ).then(((response) => {
            for (let x = 0; x < response.data.length; x++) {
                const subCategoryName = response.data[x].SubCategoryName;
                const subCategoryBalance = response.data[x].Balance;
                updatedArray.push(
                    {
                        name: subCategoryName,
                        balance: subCategoryBalance,
                    },
                );
            }
            setSubCategoryList([]);
            setSubCategoryList(updatedArray);
        })).catch((response) => {
            console.log(response);
            alert('Something went wrong');
        });
    };

    const addBudget = () => {
        setIsDisabled(true);
        setFromSubEmptyError(false)
        setToSubEmptyError(false)
        const userID = localStorage.getItem('UserID');
        const baseUrl = `http://localhost:3001/budget/new-budget`;
        const year = localStorage.getItem('Year')
        const month = localStorage.getItem('Month')
        const date = `${year}-${month}-01`

        if (amount !== 0.00) {
            Axios.post(baseUrl,
                {
                    Amount: amount,
                    BudgetDate: date,
                    FromSubCategory: fromSubCategory,
                    ToSubCategory: toSubCategory,
                    UserID: userID,
                }).then(() => {
                setOpen(false);
                setFromSubCategory('');
                setIsDisabled(false);
                setToSubCategory('');
                setAmount(0.00);
                setAddDashboardSuccess(true)
                setMessage('Budget was made')
                setEffectOpen(true)
            }).catch(response => {
                setIsDisabled(false);
                switch (response.response.data) {
                    case "Something went wrong, please try again":
                        setFromSubEmptyError(true);
                        setToSubEmptyError(true);
                        setAmountEmptyError(true);
                        break;
                }
            });
        } else {
            if (toSubCategory === '') {
                setToSubEmptyError(true)
                setIsDisabled(false);
            }
            if (fromSubCategory === '') {
                setFromSubEmptyError(true)
                setIsDisabled(false);
            }
            setAmountEmptyError(true)
            setIsDisabled(false);
        }
    };

    return (
        <div>
            <Button onClick={handleClickOpen} sx={{fontSize: "13px"}}> <AddCircleOutline
                sx={{fontSize: "18px", marginLeft: "-2px", marginRight: "8px"}}/> Budget </Button>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Budget</DialogTitle>
                <DialogContent>
                    <div className="budget-selects">
                        <div className="subcategory-dropmenu">
                            <InputLabel id="account">From Sub Category *</InputLabel>
                            <Select
                                style={{height: '50px', width: '300px'}}
                                id="fromSubcategory"
                                labelId="account"
                                fullWidth
                                onOpen={getUserSubcategories}
                                value={fromSubCategory}
                                onChange={(event) => {
                                    setFromSubCategory(event.target.value);
                                }}
                                error={fromSubEmptyError}
                            >
                                {subCategoryList.filter(
                                    subcategory => subcategory.name.toString() !==
                                        toSubCategory.toString()).map((subcategory) => (
                                    <MenuItem key={subcategory.name} value={subcategory.name}>
                                        {subcategory.name} {subcategory.balance}
                                    </MenuItem>
                                ))}
                            </Select>
                        </div>
                        <div className="subcategory-dropmenu">
                            <InputLabel id="category">To Sub Category *</InputLabel>
                            <Select
                                style={{height: '50px', width: '300px'}}
                                id="subcategory-name"
                                labelId="category"
                                fullWidth
                                onOpen={getUserSubcategories}
                                value={toSubCategory}
                                onChange={(event) => {
                                    setToSubCategory(event.target.value);
                                }}
                                error={toSubEmptyError}
                            >
                                {subCategoryList.filter(
                                    subcategory => subcategory.name.toString() !==
                                        fromSubCategory.toString()).map((subcategory) => (
                                    <MenuItem key={subcategory.name}
                                              value={subcategory.name}>
                                        {subcategory.name} {subcategory.balance}
                                    </MenuItem>
                                ))}
                                >
                            </Select>
                        </div>
                    </div>
                    <TextField
                        style={{height: '50px', width: '300px', background: 'white'}}
                        required
                        autoFocus
                        margin="dense"
                        id="amount"
                        label="Amount"
                        type="number"
                        fullWidth
                        variant="filled"
                        onChange={(event) => {
                            setAmount(parseFloat(event.target.value));
                        }}
                        error={amountEmptyError}
                        helperText={
                            amountEmptyError
                                ? "Amount can't be empty"
                                : ""
                        }
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}
                            className="cancel-button">Cancel</Button>
                    <Button className="add-transaction" onClick={addBudget} disabled={isDisabled}>Make
                        budgeting</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default AddBudget