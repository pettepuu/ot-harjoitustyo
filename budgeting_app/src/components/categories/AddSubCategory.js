import React, {useState} from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Axios from 'axios';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import {
    FormControlLabel,
    Radio,
    RadioGroup,
    Select, Switch,
    TextFieldProps,
} from '@mui/material';
import moment from 'moment/moment';
import AddCircleOutline from '@mui/icons-material/AddCircleOutline';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import {DesktopDatePicker} from '@mui/x-date-pickers/DesktopDatePicker';

const AddSubCategory = ({setAddDashboardSuccess, setEffectOpen, setMessage}) => {
    const [open, setOpen] = React.useState(false);
    const [subCategory, setSubCategory] = React.useState('');
    const [balance, setBalance] = React.useState(0);
    const [categoryList, setCategoryList] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');

    //budget goal variables
    const [showGoal, setShowGoal] = useState(false);
    const [budgetGoal, setBudgetGoal] = useState('');
    const [budgetGoalType, setBudgetGoalType] = useState('1');
    const [budgetGoalDate, setBudgetGoalDate] = useState(new Date());
    const [isDisabled, setIsDisabled] = useState(false);


    const handleClickOpen = () => {
        setOpen(true);

    };

    const handleClose = () => {
        setOpen(false);
        setShowGoal(false);
        setSubCategory('');
        setBalance(0);
        setSelectedCategory('');
    };

    const insertBudgetGoal = () => {
        if (!showGoal) {
            return;
        }
        const userID = localStorage.getItem('UserID');
        const postUrl = 'http://localhost:3001/goal/new-goal';
        // console.log(budgetGoalType, budgetGoalDate, budgetGoal, selectedSubCategory, userID);
        Axios.post(postUrl, {
            Type: budgetGoalType,
            Date: budgetGoalDate,
            Amount: budgetGoal,
            SubCategoryName: subCategory,
            UserID: userID,
        }).then(() => {
            setShowGoal(false);
            setOpen(false);
            setBudgetGoalDate(new Date())
            setBudgetGoal('0');
            setBudgetGoalType('1');
            setMessage('Subcategory goal was made')
            setEffectOpen(true)
        }).catch((response) => {
            setShowGoal(false);
            alert(response.response.data);
        });
    }

    const handleAddSubCategory = async () => {
        setIsDisabled(true);
        try {
            const userID = localStorage.getItem('UserID');
            let isFound = false;
            const checkCategoryNameUrl = `http://localhost:3001/category/${userID}`;
            const postUrl = 'http://localhost:3001/subcategory/new-subcategory';
            const getUrl = `http://localhost:3001/category/user-${userID}/find-categoryid/categoryname-${selectedCategory}`;
            const budgetUrl = `http://localhost:3001/budget/new-budget`;

            const getCategoryName = await Axios.get(checkCategoryNameUrl);
            for (let x = 0; x < getCategoryName.data.length; x++) {
                if (getCategoryName.data[x].CategoryName.toString() ===
                    subCategory.toString()) {
                    isFound = true;
                    break;
                }
            }

            if (!isFound) {
                if (subCategory.length > 2) {
                    const getCategoryID = await Axios.get(getUrl); //.data
                    await Axios.post(postUrl, {
                        SubCategoryName: subCategory,
                        Balance: 0,
                        UserID: userID,
                        CategoryID: getCategoryID.data,
                    });

                    if (balance > 0) {
                        await Axios.post(budgetUrl,
                            {
                                Amount: balance,
                                BudgetDate: moment().format('YYYY-MM-DD'),
                                FromSubCategory: 'Available Funds',
                                ToSubCategory: subCategory,
                                UserID: userID,
                            });
                    }
                    if (budgetGoalType !== '' && budgetGoal > 0) {
                        insertBudgetGoal();
                    }
                    setOpen(false);
                    setShowGoal(false);
                    setSubCategory('');
                    setIsDisabled(false);
                    setBalance(0);
                    setSelectedCategory('');
                    setAddDashboardSuccess(true)
                    setMessage('New subcategory was made')
                    setEffectOpen(true)
                } else {
                    alert('The subcategory name must be at least three characters long');
                    setIsDisabled(false);
                }
            } else {
                alert('Category name and Sub Category name can not be the same');
                setIsDisabled(false);
            }
        } catch (response) {
            setIsDisabled(false);
            alert(response.response.data);
        }
    };


    const getUserCategories = () => {
        const userID = localStorage.getItem('UserID');
        const baseUrl = `http://localhost:3001/category/${userID}`;
        const updatedArray = [];
        Axios.get(baseUrl).then((response) => {
            for (let x = 0; x < response.data.length; x++) {
                if (response.data[x].CategoryName.toString() !== 'Available') {
                    const category = response.data[x].CategoryName;
                    updatedArray.push({value: category});
                }
            }
            setCategoryList(updatedArray);
        }).catch((response) => {
            alert(response.response.data);
        });
    };


    React.useEffect(() => {
        getUserCategories();
    }, [open]);


    return (
        <div className="subcategory-button">
            <Button id="subcategory-button-1" sx={{fontSize: "13px"}} onClick={handleClickOpen}>
                <AddCircleOutline sx={{fontSize: "18px", marginLeft: "-2px", marginRight: "8px"}}/> Add subcategory
            </Button>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Create subcategory</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        To create a subcategory, you need to select a category and input
                        a
                        subcategory name. Optionally You can also add a balance for the
                        subcategory.
                    </DialogContentText>

                    <FormControl required margin="dense">
                        <InputLabel id="Category-type-label">Category</InputLabel>
                        <Select
                            style={{height: '50px', width: '200px'}}
                            labelId="Category-type-label"
                            id="Category"
                            fullWidth
                            value={selectedCategory}
                            onChange={(event) => {
                                setSelectedCategory(event.target.value);
                            }}
                        >
                            {categoryList.map((category) => (
                                <MenuItem key={category.value} value={category.value}>
                                    {category.value}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>


                    <TextField
                        required
                        autoFocus
                        margin="dense"
                        id="sub-category"
                        label="Sub Category"
                        fullWidth
                        inputProps={{maxLength: 50}}
                        value={subCategory}
                        variant="filled"
                        onChange={(event) => {
                            setSubCategory(event.target.value);
                        }}
                    />
                    <TextField
                        autoFocus
                        margin="dense"
                        id="balance"
                        label="Balance"
                        type="number"
                        fullWidth
                        inputProps={{maxLength: 20}}
                        value={balance}
                        variant="filled"
                        onChange={(event) => {
                            setBalance(event.target.value);
                        }}
                    />

                    <FormControlLabel control={<Switch default/>}
                                      id="Switch"
                                      label="Add a budget goal?"
                                      value="true"
                                      onChange={() => setShowGoal(!showGoal)}/>

                    {showGoal && (
                        <div>

                            <DialogContentText>
                                (Optional) Here you can set a budget goal for a subcategory.
                                You
                                can
                                select a single
                                time goal, a monthly amount to save or assign a future
                                date as a
                                deadline for amount saved.
                            </DialogContentText>


                            <RadioGroup name="select-budget-goal-type"
                                        value={budgetGoalType}
                                        aria-labelledby="subcategory-button-1"
                                        onChange={(e) => setBudgetGoalType(e.target.value)}>

                                <FormControlLabel control={<Radio/>}
                                                  label="Monthly Saving Goal"
                                                  id="ByMonth"
                                                  value="1"/>
                                <FormControlLabel control={<Radio/>}
                                                  id="budgetGoal"
                                                  label="Save by Date"
                                                  value="2"/>
                                {budgetGoalType === '2' && (
                                    <div>
                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <DesktopDatePicker
                                                label="Date"
                                                inputFormat="MM/YYYY"
                                                value={budgetGoalDate}
                                                onChange={date => setBudgetGoalDate(date)}
                                                renderInput={(params: TextFieldProps) => {
                                                    return <TextField {...params}/>;
                                                }}
                                                views={['month', 'year']}
                                                showDaysOutsideCurrentMonth
                                            />
                                        </LocalizationProvider>
                                    </div>

                                )}
                                <FormControlLabel control={<Radio/>}
                                                  label="Target Balance"
                                                  value="3"/>

                            </RadioGroup>


                            <TextField
                                autoFocus
                                margin="dense"
                                id="budgetingGoal"
                                label="Budget goal amount"
                                fullWidth
                                inputProps={{maxLength: 20}}
                                value={budgetGoal}
                                variant="filled"
                                onChange={(event) => {
                                    setBudgetGoal(event.target.value);
                                }}
                            />
                        </div>)}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} className="cancel-button">
                        Cancel
                    </Button>
                    <Button onClick={handleAddSubCategory} disabled={isDisabled} className="Save-button">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default AddSubCategory;
