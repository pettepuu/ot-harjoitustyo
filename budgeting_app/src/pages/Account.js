import React, {useEffect, useState} from 'react';
import {AccountTransactionGrid, getAccountTransactions} from "../components/account/Account-TransactionGrid";
import {useParams} from "react-router-dom";
import {getPayeeList} from "../components/transaction/Payeelist";


const Account = ({loggedIn, setMessage, setEffectOpen, setAddAccTransactionSuccess, addAccTransactionSuccess}) => {
    const { AccountName } = useParams()
    localStorage.setItem('AccountName',AccountName)
    const [rows, setRows] = useState([])
    const [payeeList, setPayeeList] = useState([])

    useEffect(() => {
        if (loggedIn || addAccTransactionSuccess) {
            const userID = localStorage.getItem('UserID');
            getAccountTransactions(userID, AccountName).then((data) => setRows(data)).catch((error) => {
                console.log(error)
                console.log('error retrieving UserAccountTransactions')
            })
            getPayeeList().then((data) => setPayeeList(data)).catch((error) => {
                console.log(error)
                console.log('error retrieving Payeelist')
            })
            setAddAccTransactionSuccess(false)
        }
    }, [loggedIn, addAccTransactionSuccess, AccountName]);

    return (
        <div className="transaction">
            <AccountTransactionGrid rows={rows} payeeList={payeeList} AccountName={AccountName} setMessage={setMessage} setRows={setRows} setEffectOpen={setEffectOpen} setAddAccTransactionSuccess={setAddAccTransactionSuccess}/>
        </div>
    )
}

export default Account