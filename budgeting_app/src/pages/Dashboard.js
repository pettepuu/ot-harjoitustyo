import AddCategory from '../components/categories/AddCategory';
import AddSubCategory from '../components/categories/AddSubCategory';
import MoveDeleteSubCategory from '../components/categories/UpdateSubCategory';
import React, {useEffect, useState} from 'react';
import AddBudget from '../components/budget/AddBudget';
import BudgetingGrid, {getGridData} from '../components/budget/BudgetingGrid.js';
import UpdateCategory from "../components/categories/UpdateCategory";

const Dashboard = ({loggedIn, addDashboardSuccess, setAddDashboardSuccess, setMessage, setEffectOpen}) => {
    const [rows, setRows] = useState([]);

    useEffect(() => {
        if (loggedIn || addDashboardSuccess) {
            getGridData().then((data) => setRows(data)).catch((error) => {
                console.log(error)
                alert('error DashBoard')
            })
            setAddDashboardSuccess(false)
        }
    }, [loggedIn, addDashboardSuccess]);
    return (
      <div className="home">
        <div className="budgetingRow">
          <AddCategory setAddDashboardSuccess={setAddDashboardSuccess} setMessage={setMessage} setEffectOpen={setEffectOpen}/>
          <UpdateCategory setAddDashboardSuccess={setAddDashboardSuccess} setMessage={setMessage} setEffectOpen={setEffectOpen}/>
          <AddSubCategory setAddDashboardSuccess={setAddDashboardSuccess} setMessage={setMessage} setEffectOpen={setEffectOpen}/>
          <MoveDeleteSubCategory setAddDashboardSuccess={setAddDashboardSuccess} setMessage={setMessage} setEffectOpen={setEffectOpen}/>
          <AddBudget setAddDashboardSuccess={setAddDashboardSuccess} setMessage={setMessage} setEffectOpen={setEffectOpen}/>
        </div>
        <BudgetingGrid rows={rows}/>
      </div>
  );

};

export default Dashboard;