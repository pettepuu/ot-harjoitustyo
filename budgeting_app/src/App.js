import './App.css';
import Sidebar from './components/application-interface/Sidebar';
import Header from './components/application-interface/Header';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Accounts from './pages/Accounts';
import {useEffect, useState} from 'react';
import Account from "./pages/Account";
import CustomAlert from "./utils/alert";
import * as React from "react";
const MemoizedSidebar = React.memo(Sidebar);
const App = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false);
    const [createAccSuccess, setCreateAccSuccess] = useState(false);
    const [addTransactionSuccess, setaddTransactionSuccess] = useState(false);
    const [addAccTransactionSuccess, setAddAccTransactionSuccess] = useState(false);
    const [addDashboardSuccess, setAddDashboardSuccess] = useState(false);
    const [effectOpen, setEffectOpen] = useState(false);
    const [message, setMessage] = useState('');

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen)
    }

    useEffect(() => {
        if (localStorage.getItem('UserID') !== null) {
            setLoggedIn(true)
            setIsSidebarOpen(true)
            setTimeout(() => {
                localStorage.clear();
                setLoggedIn(false)
            }, 3600000); // 3600000 milliseconds = 60 minutes
        }
    }, [localStorage.getItem('UserID')])

    return (
        <Router>
            <div className="custom-alert">
                <CustomAlert effectOpen={effectOpen} message={message} setMessage={setMessage} setEffectOpen={setEffectOpen}/>
            </div>
            <div className="header">
                <Header setIsSidebarOpen={setIsSidebarOpen} toggleSidebar={toggleSidebar} loggedIn={loggedIn}
                        setLoggedIn={setLoggedIn} createAccSuccess={createAccSuccess}
                        setCreateAccSuccess={setCreateAccSuccess} setEffectOpen={setEffectOpen} setMessage={setMessage} setAddDashboardSuccess={setAddDashboardSuccess}/>
            </div>
            <div className="row">
                <div className={`column left ${isSidebarOpen ? '' : 'hidden'}`}>
                    <MemoizedSidebar loggedIn={loggedIn} createAccSuccess={createAccSuccess}
                                     setCreateAccSuccess={setCreateAccSuccess} setEffectOpen={setEffectOpen} setMessage={setMessage}
                                     addTransactionSuccess={addTransactionSuccess} addAccTransactionSuccess={addAccTransactionSuccess}/>
                </div>
                <div className={`column middle ${loggedIn ? '' : 'hidden'}`}>
                    <Routes>
                        <Route path="/dashboard" element={<Dashboard loggedIn={loggedIn} addDashboardSuccess={addDashboardSuccess}
                                                                     setAddDashboardSuccess={setAddDashboardSuccess}
                                                                     setEffectOpen={setEffectOpen} setMessage={setMessage}/>}/>
                        <Route path="/accounts" element={<Accounts loggedIn={loggedIn} addTransactionSuccess={addTransactionSuccess}
                                                                   setaddTransactionSuccess={setaddTransactionSuccess}
                                                                   setEffectOpen={setEffectOpen} setMessage={setMessage} createAccSuccess={createAccSuccess}/>}/>
                        <Route path={`/accounts/:AccountName`} element={<Account loggedIn={loggedIn} setEffectOpen={setEffectOpen}
                                                                                 setMessage={setMessage}
                                                                                 addAccTransactionSuccess={addAccTransactionSuccess}
                                                                                 setAddAccTransactionSuccess={setAddAccTransactionSuccess}/>}/>
                    </Routes>
                </div>
                {/*<div className="column right">*/}
                {/*  <p> Oikea sarake</p>*/}
                {/*</div>*/}
            </div>
        </Router>
    );
}

export default App;
