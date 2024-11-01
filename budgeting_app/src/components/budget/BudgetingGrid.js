import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Axios from 'axios';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorIcon from '@mui/icons-material/Error';

const CollapsibleTable = ({rows}) => {

    const Row = (props) => {
        const {row} = props;
        const [open, setOpen] = React.useState(true);

        return (
            <React.Fragment>
                <TableRow className="BudgetCatHeaderRow">
                    <TableCell className="BudgetCatHeaderCell" width="5%">
                        <IconButton
                            aria-label="expand row"
                            size="small"
                            onClick={() => setOpen(!open)}
                        >
                            {open ? <KeyboardArrowUpIcon/> : <KeyboardArrowDownIcon/>}
                        </IconButton>
                    </TableCell>
                    <TableCell className="BudgetCatHeaderCell" width="30%"
                               component="th" scope="row">
                        {row.categoryName}
                    </TableCell>
                    <TableCell className="BudgetCatHeaderCell" align="right"
                               size="small"
                               width="10%">{row.totalBudgetedAmount.toFixed(
                        2)} €</TableCell>
                    <TableCell className="BudgetCatHeaderCellAcitivity" align="right"
                               size="small"
                               width="10%">{row.totalActivityAmount.toFixed(
                        2)} €</TableCell>
                    <TableCell className="BudgetCatHeaderCell2" align="right"
                               size="small"
                               width="10%">{row.totalAvailableAmount.toFixed(
                        2)} €</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell colSpan={6}>
                        <Collapse padding-right="0" style={{width: '100%'}} in={open}
                                  timeout="auto" unmountOnExit>
                            <Box sx={{margin: 0}}>
                                <Table size="small" aria-label="budgets">
                                    <TableHead>
                                    </TableHead>
                                    <TableBody>
                                        {row.subcategorySection.map((subcategoryRow, index) => (
                                            <TableRow key={index}>
                                                <TableCell className="BudgetSubCategoryCell"
                                                           align="left" sx={{width: "102px"}}></TableCell>
                                                <TableCell className="BudgetSubCategoryCell"
                                                           component="th" scope="row" size="small">
                                                    {subcategoryRow.subcategoryName}
                                                </TableCell>
                                                <TableCell className="BudgetSubCategoryCell"
                                                           align="right"
                                                           size="small">{subcategoryRow.budgetedAmount}</TableCell>
                                                <TableCell className="BudgetSubCategoryCellActivity"
                                                           align="right"
                                                           size="small">{subcategoryRow.activityAmount}</TableCell>
                                                <TableCell className="BudgetSubCategoryCell"
                                                           align="right" size="small"
                                                           icon={subcategoryRow.goalIcon}
                                                           style={{color: subcategoryRow.goalColor}}>
                                                    <div className="budgetStyleWrapper">
                                                        <div
                                                            className="goalIconClass">{subcategoryRow.goalIcon}</div>
                                                        <div>
                                <span
                                    style={{
                                        backgroundColor: subcategoryRow.goalColor,
                                        fontWeight: 'bold',
                                        color: subcategoryRow.goalColor === 'white' ? '#666666' : 'white'
                                    }}>{subcategoryRow.availableAmount}</span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Box>
                        </Collapse>
                    </TableCell>
                </TableRow>
            </React.Fragment>
        );
    };

    Row.propTypes = {
        row: PropTypes.shape({
            totalBudgetedAmount: PropTypes.number.isRequired,
            totalActivityAmount: PropTypes.number.isRequired,
            totalAvailableAmount: PropTypes.number.isRequired,
            subcategory: PropTypes.arrayOf(
                PropTypes.shape({
                    activityAmount: PropTypes.number.isRequired,
                    budgetedAmount: PropTypes.number.isRequired,
                    subcategoryName: PropTypes.string.isRequired,
                }),
            ),
            categoryName: PropTypes.string.isRequired,
        }).isRequired,
    };

    return (
        <TableContainer component={Paper}>
            <Table aria-label="collapsible table" density="">
                <TableHead>
                    <TableRow>
                        <TableCell align="left" className="BudgetHeaderCell"></TableCell>
                        <TableCell align="left" className="BudgetHeaderCell">ALL CATEGORIES</TableCell>
                        <TableCell align="right"
                                   className="BudgetHeaderCell">BUDGETED</TableCell>
                        <TableCell align="right"
                                   className="BudgetHeaderCell">ACTIVITY</TableCell>
                        <TableCell align="right"
                                   className="BudgetHeaderCell2">AVAILABLE</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map((row, index) => (
                        <Row key={index} row={row}/>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export const getGridData = async () => {
    const userID = localStorage.getItem('UserID');
    const month = localStorage.getItem('Month');
    const year = localStorage.getItem('Year');
    const date = `${year}-${month}`;

    const createData = (
        categoryName, totalBudgetedAmount, totalActivityAmount,
        totalAvailableAmount, subcategorySection) => {
        return {
            categoryName,
            totalBudgetedAmount,
            totalActivityAmount,
            totalAvailableAmount,
            subcategorySection,
        };
    };

    const getSql1 = `http://localhost:3001/subcategory/user-${userID}/activity-and-budgeted-this-month/date-${date}`;
    const resultBudget = await Axios.get(getSql1);
    const budgetData = resultBudget.data;

    const getSql2 = `http://localhost:3001/category/${userID}/return-category-dictionary/date-${date}`;
    const resultCategories = await Axios.get(getSql2);
    const categoryData = resultCategories.data;
    const categoryCount = categoryData.length;
    let tempArray = [];

    const getSql3 = `http://localhost:3001/goal/${userID}/get-goal-amounts`;
    const resultGoals = await Axios.get(getSql3);
    const goalsData = resultGoals.data;

    for (let x = 0; categoryCount > x; x++) {
        const categoryName = categoryData[x].category;
        const subCategoryCount = categoryData[x].subcategory.length;

        let subcategoryArray = [];
        let totalAvailable = 0.00;
        let totalBudgeted = 0.00;
        let totalActivity = 0.00;

        for (let y = 0; subCategoryCount > y; y++) {

            const subCategoryName = categoryData[x].subcategory[y].category;
            const availableAmount = parseFloat(
                categoryData[x].subcategory[y].balance);

            const budgetedIndex = budgetData.findIndex(
                obj => obj.SubCategoryName === subCategoryName);

            const goalIndex = goalsData.findIndex(
                obj => obj.SubCategoryName === subCategoryName);

            let activityAmount = 0.00;
            let budgetedAmount = 0.00;
            let goalAmount = 0.00;
            let goalType = 0;
            let goalDate = 0;
            let color;
            let icon;

            if (budgetedIndex !== -1) {
                budgetedAmount = parseFloat(budgetData[budgetedIndex].Budgeted) || 0.00;
                activityAmount = parseFloat(budgetData[budgetedIndex].Activity) || 0.00;
            }
            if (goalIndex !== -1) {
                goalAmount = parseFloat(goalsData[goalIndex].Amount) || 0.00;
                goalType = parseInt(goalsData[goalIndex].GoalType);
                goalDate = goalsData[goalIndex].GoalDate;
            }


            //Goaltype switch-case
            switch (goalType) {
                //subcategory doesn't have goal --> text is dark grey in dashboard
                case 0:
                    color = 'white';
                    break;

                //type 1 - Monthly Saving Goal
                case 1:
                    if (availableAmount < 0) {
                        //red
                        color = '#ca0000';
                        icon = <ErrorIcon style={{
                            fill: '#ca0000', paddingBottom: "3px",
                            fontSize: "23px", marginLeft: "-2px", marginRight: "6px"
                        }}/>;
                    } else if (budgetedAmount < goalAmount) {
                        //orange
                        color = '#fd8200';
                        icon = <ErrorOutlineIcon style={{
                            fill: 'orange', paddingBottom: "3px",
                            fontSize: "23px", marginLeft: "-2px", marginRight: "6px"
                        }}/>;
                    } else if (budgetedAmount >= goalAmount) {
                        //green
                        color = '#099300';
                        icon = <CheckCircleOutlineIcon style={{
                            fill: 'green', paddingBottom: "3px",
                            fontSize: "23px", marginLeft: "-2px", marginRight: "6px"
                        }}/>;
                    }
                    break;

                //type 2 - Save by Date
                case 2:
                    const currentDate = new Date().toISOString();

                    if (availableAmount >= goalAmount) {
                        //green
                        color = '#099300';
                        icon = <CheckCircleOutlineIcon style={{
                            fill: 'green', paddingBottom: "3px",
                            fontSize: "23px", marginLeft: "-2px", marginRight: "6px"
                        }}/>;
                    } else if (goalDate >= currentDate && availableAmount < goalAmount) {
                        //orange
                        color = '#fd8200';
                        icon = <ErrorOutlineIcon style={{
                            fill: 'orange', paddingBottom: "3px",
                            fontSize: "23px", marginLeft: "-2px", marginRight: "6px"
                        }}/>;
                    } else if (goalDate < currentDate && availableAmount < goalAmount) {
                        //red
                        color = '#ca0000';
                        icon = <ErrorIcon style={{
                            fill: '#ca0000', paddingBottom: "3px",
                            fontSize: "23px", marginLeft: "-2px", marginRight: "6px"
                        }}/>;
                    }
                    break;

                //type 3 - Target Balance
                case 3:

                    if (availableAmount >= goalAmount) {
                        //green
                        color = '#099300';
                        icon = <CheckCircleOutlineIcon style={{
                            fill: 'green', paddingBottom: "3px",
                            fontSize: "23px", marginLeft: "-2px", marginRight: "6px"
                        }}/>;
                    } else {
                        //orange
                        color = '#fd8200';
                        icon = <ErrorOutlineIcon style={{
                            fill: 'orange', paddingBottom: "3px",
                            fontSize: "23px", marginLeft: "-2px", marginRight: "6px"
                        }}/>;
                    }
                    break;
            }

            totalAvailable += availableAmount;
            totalBudgeted += budgetedAmount;
            totalActivity += activityAmount;

            const subcategoryJson = {
                subcategoryName: subCategoryName,
                budgetedAmount: budgetedAmount.toFixed(2),
                activityAmount: activityAmount.toFixed(2),
                availableAmount: availableAmount.toFixed(2),
                goalColor: color,
                goalIcon: icon,
            };
            subcategoryArray.push(subcategoryJson);
        }

        tempArray.push(
            createData(categoryName, parseFloat(totalBudgeted.toFixed(2)),
                parseFloat(totalActivity.toFixed(2)),
                parseFloat(totalAvailable.toFixed(2)),
                subcategoryArray));
    }

    return tempArray;
};

export default CollapsibleTable;