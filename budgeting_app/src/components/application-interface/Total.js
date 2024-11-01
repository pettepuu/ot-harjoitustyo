import Axios from 'axios';
import {useEffect, useState} from 'react';
import styled from '@emotion/styled';

const Total = () => {

    const [totalAmount, setTotalAmount] = useState(0);
    const [debt, setDebt] = useState(0);
    const [availableToBudget, setAvailableToBudget] = useState(0);
    const [accountStyle, setAccountStyle] = useState(true);
    const [debtStyle, setDebtStyle] = useState(true);
    const [budgetStyle, setBudgetStyle] = useState(true);

    const handleAccountChange = (props) => {
        setAccountStyle(props);
    };

    const handleDebtChange = (props) => {
        setDebtStyle(props);
    };

    useEffect(() => {
        fetchTotalAmount();
        fetchBudget();
    });

    const fetchTotalAmount = () => {

        const storedId = localStorage.getItem('UserID');
        const baseurl = `http://localhost:3001/account/${storedId}/sum-balance`;

        Axios.get(baseurl).then((res) => {
            if (res.data.balance_summary !== null) {
                if (parseInt(res.data.balance_summary) >= 0) {
                    handleAccountChange(true);
                } else {
                    handleAccountChange(false);
                }
                setTotalAmount(res.data.balance_summary);
            } else {
                setTotalAmount(0);
            }
            if (res.data.debt_summary !== null) {
                if (res.data.debt_summary >= 0) {
                    handleDebtChange(true);
                } else {
                    handleDebtChange(false);
                }
                setDebt(res.data.debt_summary);
            } else {
                setDebt(0);
            }
        }).catch((err) => {
            console.log(err);
        });
    };

    const fetchBudget = () => {
        const userID = localStorage.getItem('UserID');
        const baseurl = `http://localhost:3001/subcategory/${userID}/available-to-budget`;
        Axios.get(baseurl).then((res) => {
            setAvailableToBudget(res.data[0].Balance);
            if (availableToBudget < 0) {
                setBudgetStyle(false);
            } else {
                setBudgetStyle(true);
            }
        }).catch((err) => {
            console.log(err);
        });
    };

    const TotalsWrapper = styled.div`
      display: flex;
      flex-flow: row wrap;
      justify-content: space-around;

    `;

    const AccountStyleSwitcher = styled.a`
      &.positive {
        color: darkseagreen;
      }

      &.negative {
        color: indianred;
      }
    `;

    const SegmentWrapper = styled.div`
      padding-right: 2.5em;
    `;

    const DebtStyleSwitcher = styled.a`
      &.positive {
        color: darkseagreen;
      }

      &.negative {
        color: indianred;
      }
    `;

    const BudgetStyleSwitcher = styled.a`
      &.positive {
        color: darkseagreen;
      }

      &.negative {
        color: indianred;
      }
    `;

    return (
        <TotalsWrapper className="totals">
            <SegmentWrapper className="SegmentWrapper">
                Total: &nbsp;
                <AccountStyleSwitcher
                    className={accountStyle ? 'positive' : 'negative'}>
                    {totalAmount}€
                </AccountStyleSwitcher>
            </SegmentWrapper>

            <SegmentWrapper>
                Debts: &nbsp;
                <DebtStyleSwitcher className={debtStyle ? 'positive' : 'negative'}>
                    {debt}€
                </DebtStyleSwitcher>
            </SegmentWrapper>

            <SegmentWrapper>
                Available to budget: &nbsp;
                <BudgetStyleSwitcher
                    className={budgetStyle ? 'positive' : 'negative'}>
                    {availableToBudget}€
                </BudgetStyleSwitcher>
            </SegmentWrapper>
        </TotalsWrapper>
    );
};

export default Total;