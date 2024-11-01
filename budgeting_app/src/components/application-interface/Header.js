import * as React from 'react';
import styled from '@emotion/styled';
import MenuIcon from '@mui/icons-material/Menu';
import {Link, useLocation } from 'react-router-dom';
import Login from '../user/Login';
import Total from './Total';
import {useEffect} from "react";
import DateSelector from './DateSelector';

const HeaderNavi = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
`;

const NaviIcon = styled(Link)`
  margin-left: 2rem;
  font-size: 2rem;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  color: #ffffff;
`;

const TotalWrapper = styled.div`
  font-size: 16px;
  display: flex;
  justify-content: flex-start;
  color: white;
  padding-left: 11em;
`;
const Header = ({toggleSidebar, loggedIn, setLoggedIn, setIsSidebarOpen, createAccSuccess, setCreateAccSuccess, setMessage, setEffectOpen, setAddDashboardSuccess}) => {

    const location = useLocation();
    const isDashboardPage = location.pathname === '/dashboard';

    useEffect(() => {
        if (loggedIn || createAccSuccess){
            setCreateAccSuccess(false)
        }
    },[loggedIn, createAccSuccess])

    return (
      <HeaderNavi>
        <NaviIcon to="#" onClick={() => {
            if(loggedIn){
                toggleSidebar()
            }
        }}>
          <MenuIcon/>
        </NaviIcon>
          {loggedIn && (
        <TotalWrapper>
          <Total> </Total>
        </TotalWrapper>
          )}
          {isDashboardPage && loggedIn && <DateSelector setAddDashboardSuccess={setAddDashboardSuccess}/>}
        <Login loggedIn={loggedIn} setLoggedIn={setLoggedIn} setIsSidebarOpen={setIsSidebarOpen} setEffectOpen={setEffectOpen} setMessage={setMessage}></Login>
      </HeaderNavi>
  );
};
export default Header;