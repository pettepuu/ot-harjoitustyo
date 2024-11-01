import {useState, useEffect} from 'react';
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
import EditIcon from '@mui/icons-material/Edit';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import {DesktopDatePicker} from '@mui/x-date-pickers/DesktopDatePicker';

const UpdateSubCategory = ({setAddDashboardSuccess, setMessage, setEffectOpen}) => {
    const [open, setOpen] = useState(false);
    const [subCategory, setsubCategory] = useState('');
    const [balance, setBalance] = useState('');
    const [categoryList, setCategoryList] = useState([]);
    const [SubCategoryList, setSubCategoryList] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedSubCategory, setSelectedSubCategory] = useState('');
    const [isDisabled, setIsDisabled] = useState(false);
    //budget goal variables
    const [showGoal, setShowGoal] = useState(false);
    const [budgetGoal, setBudgetGoal] = useState('0');
    const [budgetGoalType, setBudgetGoalType] = useState('1');
    const [budgetGoalDate, setBudgetGoalDate] = useState(new Date());
    const [budgetGoalMonthlyAmount, setBudgetGoalMonthlyAmount] = useState('');

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setShowGoal(false);
        setsubCategory('');
        setBalance('');
        setSelectedCategory('');
        setSelectedSubCategory('');
        setBudgetGoal('0');
        setBudgetGoalType('1');
    };

    const calculateBudgetGoalMonthlyAmount = () => {
        if (budgetGoalType === '2') {
            const today = new Date();
            const monthsLeft = (new Date(budgetGoalDate).getFullYear() - today.getFullYear()) * 12 + (new Date(budgetGoalDate).getMonth() - today.getMonth());
            const monthlyAmount = Math.ceil(budgetGoal / monthsLeft);
            setBudgetGoalMonthlyAmount(monthlyAmount);
        }
    }

    const insertBudgetGoal = () => {
        if (!showGoal) {
            return;
        }
        const userID = localStorage.getItem('UserID');
        const postUrl = 'http://localhost:3001/goal/new-goal';
        Axios.post(postUrl, {
            Type: budgetGoalType,
            Date: budgetGoalDate,
            Amount: budgetGoal,
            SubCategoryName: selectedSubCategory,
            UserID: userID,
        }).then(() => {
            setShowGoal(false);
            setOpen(false);
            setBudgetGoalDate(new Date())
            setBudgetGoal('0');
            setBudgetGoalType('1');
            setMessage('Budget addition successful')
            setEffectOpen(true)
        }).catch((response) => {
            setShowGoal(false);
            alert(response.response.data);
        });
    }

    const handleDelete = () => {
        const userID = localStorage.getItem('UserID');
        const postUrl = 'http://localhost:3001/subcategory/deactivate-subcategory';
        Axios.post(postUrl, {
            SubCategoryName: selectedSubCategory,
            UserID: userID
        }).then(() => {
            //Deleted subcategory balance goes to availablefunds
            handleAddBudget();
        }).catch((response) => {
            alert(response.response.data);
        });
    };

    const handleAddBudget = () => {
        const userID = localStorage.getItem('UserID');
        const baseUrl = `http://localhost:3001/budget/new-budget`;
        const year = localStorage.getItem('Year')
        const month = localStorage.getItem('Month')
        const date = `${year}-${month}-01`

        Axios.post(baseUrl,
            {
                Amount: balance,
                BudgetDate: date,
                FromSubCategory: selectedSubCategory,
                ToSubCategory: 'Available Funds',
                UserID: userID,
                Type: 1
            }).then(() => {
            setOpen(false);
            setsubCategory('');
            setBalance('');
            setSelectedCategory('');
            setSelectedSubCategory('');
            setAddDashboardSuccess(true)
            setMessage('Subcategory was deleted')
            setEffectOpen(true)
        }).catch(response => {
            alert(response.response.data);
        });
    };

    const handleEditSubCategory = () => {
        setIsDisabled(true);
        const userID = localStorage.getItem('UserID');
        const postUrl = 'http://localhost:3001/subcategory/update-subcategory';
        const getUrl = `http://localhost:3001/subcategory/user-${userID}/get-subcategory-details/subCategoryName-${selectedSubCategory}`;
        Axios.get(getUrl).then((response) => {
            setBalance(response.data[0].Balance);
            Axios.post(postUrl, {
                NewSubCategoryName: subCategory,
                NewCategory: selectedCategory,
                UserID: userID,
                SubCategoryName: selectedSubCategory,
            }).then(() => {
                if (budgetGoalType !== '' && budgetGoal > 0) {
                    insertBudgetGoal();
                }
                setOpen(false);
                setsubCategory('');
                setBalance('');
                setSelectedCategory('');
                setSelectedSubCategory('');
                setBudgetGoal('0');
                setBudgetGoalType('1');
                setAddDashboardSuccess(true)
                setMessage('Subcategory was edited')
                setEffectOpen(true)
                setIsDisabled(false);
                setMessage('Edit subcategory was successful')
                setEffectOpen(true)
            });
        }).catch((response) => {
            setIsDisabled(false);
            alert(response.response.data);
        });
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


    const getUserSubCategories = () => {
        const userID = localStorage.getItem('UserID');
        const baseUrl = `http://localhost:3001/subcategory/${userID}`;
        const updatedArray = [];
        Axios.get(baseUrl).then((response) => {
            for (let x = 0; x < response.data.length; x++) {
                if (response.data[x].SubCategoryName.toString() !== 'Account Transfer' && response.data[x].SubCategoryName.toString() !== 'Available Funds') {
                    const subCategory = response.data[x].SubCategoryName;
                    updatedArray.push({value: subCategory});
                }
            }
            setSubCategoryList(updatedArray);
        }).catch((response) => {
            alert(response.response.data);
        });
    };


    const getUserGoals = () => {
        const userID = localStorage.getItem('UserID');
        const baseUrl = `http://localhost:3001/goal/${userID}/get-goal-amounts`;
        Axios.get(baseUrl).then((response) => {
            for (let x = 0; x < response.data.length; x++) {
                const budgetGoal = response.data[x].Amount;
                const budgetType = response.data[x].GoalType;
                const subCategory = response.data[x].SubCategoryName;
                if (subCategory === selectedSubCategory) {
                    setBudgetGoal(budgetGoal);
                    setBudgetGoalType(budgetType);
                }
            }
        }).catch((response) => {
            alert(response.response.data);
        });
    };


    const updateValues = () => {
        const userID = localStorage.getItem('UserID');
        const baseUrl = `http://localhost:3001/subcategory/user-${userID}/get-subcategory-details/subCategoryName-${selectedSubCategory}`;
        Axios.get(baseUrl).then((response) => {
            setSelectedCategory(response.data[0].CategoryName);
            setBalance(response.data[0].Balance);
            setsubCategory(selectedSubCategory);
            getUserGoals();
        }).catch(response => {
            alert(response.response.data);
        });
    };


    useEffect(() => {
        getUserCategories();
        getUserSubCategories();
    }, [open]);

    useEffect(() => {
        calculateBudgetGoalMonthlyAmount();
    }, [budgetGoalType, budgetGoalDate]);


    useEffect(() => {
        if (selectedSubCategory !== '') {
            updateValues();
        }
    }, [selectedSubCategory]);

    return (
        <div className="subcategory-button">
            <Button id="subcategory-button-1" sx={{fontSize: "13px"}} onClick={handleClickOpen}>
                <EditIcon sx={{fontSize: "18px", marginLeft: "-2px", marginRight: "8px"}}/> edit subcategory & goal
            </Button>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Edit subcategory & goal</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        To edit a subcategory, you need to select a
                        subcategory. You can
                        change category or subcategory's
                        name if it is needed. It is also possible to delete
                        subcategory by
                        pressing the delete button.
                    </DialogContentText>

                    <FormControl required margin="dense">
                        <InputLabel
                            id="Category-type-label">SubCategory</InputLabel>
                        <Select
                            style={{height: '50px', width: '200px'}}
                            labelId="SubCategory-type-label"
                            id="SubCategory"
                            fullWidth
                            value={selectedSubCategory}
                            onChange={(event) => {
                                setSelectedSubCategory(event.target.value);
                            }}
                        >
                            {SubCategoryList.map((subCategory) => (
                                <MenuItem key={subCategory.value}
                                          value={subCategory.value}>
                                    {subCategory.value}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl required margin="dense">
                        <InputLabel
                            id="SubCategory-type-label">Category</InputLabel>
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
                                <MenuItem key={category.value}
                                          value={category.value}>
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
                        label="Subcategory name"
                        fullWidth
                        inputProps={{maxLength: 50}}
                        value={subCategory}
                        variant="filled"
                        onChange={(event) => {
                            setsubCategory(event.target.value);
                        }}
                    />
                    <TextField
                        autoFocus
                        disabled
                        margin="dense"
                        id="balance"
                        label="Balance"
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
                                Here you can set a goal for a subcategory. You can
                                select a single
                                time goal, a monthly amount to save or assign a future
                                date as a
                                deadline for amount saved.
                            </DialogContentText>


                            <RadioGroup name="select-budget-goal-type"
                                        required
                                        value={budgetGoalType}
                                        aria-labelledby="subcategory-button-1"
                                        onChange={(e) => setBudgetGoalType(e.target.value)}>

                                <FormControlLabel control={<Radio/>}
                                                  label="Monthly Saving Goal"
                                                  id="ByMonth"
                                                  value="1"/>
                                <FormControlLabel control={<Radio/>} label="Save by Date"
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
                                required
                                margin="dense"
                                id="ByDateGoal"
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
                    {budgetGoalType === '2' && (
                        <p>To meet your goal, you need to budget {budgetGoalMonthlyAmount} € monthly.</p>
                    )}

                </DialogContent>
                <DialogActions style={{justifyContent: "space-between"}}>
                    <Button onClick={handleDelete} className="delete-button"
                            style={{color: "red", backgroundColor: "#ffebee"}}>
                        Delete
                    </Button>
                    <div>
                        <Button onClick={handleClose} className="cancel-button">
                            Cancel
                        </Button>
                        <Button onClick={handleEditSubCategory} disabled={isDisabled}
                                className="Save-button">
                            Save changes
                        </Button>
                    </div>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default UpdateSubCategory;