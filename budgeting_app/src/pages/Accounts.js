import React, {useEffect, useState} from 'react';
import {AccountsTransactionGrid, getUserTransactions} from "../components/account/Accounts-TransactionGrid"
import {getPayeeList} from "../components/transaction/Payeelist";

const Accounts = ({loggedIn, addTransactionSuccess, setaddTransactionSuccess, setEffectOpen, setMessage, createAccSuccess}) => {
    const [rows, setRows] = useState([]);
    const [payeeList, setPayeeList] = useState([])

    useEffect(() => {
        if (loggedIn || addTransactionSuccess) {
            const userID = localStorage.getItem('UserID');
            getUserTransactions(userID).then((data) => setRows(data)).catch((error) => {
                console.log(error)
                console.log('error retrieving UserAccountsTransactions')
            })
            getPayeeList().then((data) => setPayeeList(data)).catch((error) => {
                console.log(error)
                console.log('error retrieving Payeelist')
            })
            setaddTransactionSuccess(false)
        }
    }, [loggedIn, addTransactionSuccess, createAccSuccess]);

  return (
      <div className="transaction">
          <AccountsTransactionGrid rows={rows} setRows={setRows} payeeList={payeeList} setaddTransactionSuccess={setaddTransactionSuccess} setEffectOpen={setEffectOpen} setMessage={setMessage}/>
      </div>
  )
}

export default Accounts