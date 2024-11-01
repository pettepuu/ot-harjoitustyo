import React, {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import styled from '@emotion/styled';

const SidebarLink = styled(Link)`
  display: flex;
  color: #e1e9fc;
  justify-content: flex-start;
  align-items: center;
  padding: 15px;
  height: 60px;
  text-decoration: none;
  font-size: 18px;
  border-left: 4px solid #15171c;

  &:hover {
    background: #252831;
    border-left: 4px solid #d380ff;
    cursor: pointer;
  }
`;

const SidebarLabel = styled.span`
  margin-left: 7px;
`;

const SidebarBalance = styled.span`
  font-size: 15px;
  color: ${props => (props.negative ? 'indianred' : 'darkseagreen')};
`;


const DropdownLinkSubMenu = styled(Link)`
  height: 60px;
  padding-left: 3rem;
  background: #15171c;
  display: flex;
  text-decoration: none;
  align-items: center;
  color: #ffffff;
  font-size: 14px;
  border-left: 4px solid #15171c;

  &:hover {
    background: #252831;
    border-left: 4px solid #d380ff;
    cursor: pointer;
  }
`;

const Submenu = ({item, createAccSuccess, addTransactionSuccess, addAccTransactionSuccess}) => {
    const [subnav, setSubnav] = useState(false);
    const showSubnav = () => setSubnav(!subnav);

    useEffect(() => {
        setSubnav(false)
    }, [createAccSuccess, addTransactionSuccess, addAccTransactionSuccess])

    return (
        <>
            <SidebarLink to={item.path} onClick={item.subNavi && showSubnav}>
                <div>
                    {item.icon}
                    <SidebarLabel>{item.title}</SidebarLabel>
                </div>
                <div>
                    {item.subNavi && subnav
                        ? item.iconOpen
                        : item.subNavi
                            ? item.iconClosed
                            : null}
                </div>
            </SidebarLink>
            {subnav &&
                item.subNavi.map((subitem, index) => {
                    const isNegative = subitem.balance < 0;
                    return (
                        <DropdownLinkSubMenu to={subitem.path} key={index}>
                            <div className="sideBarAccountDetails">
                                <div className="sideBarAccountName">
                                    {subitem.icon}
                                    <SidebarLabel>{subitem.title}</SidebarLabel>
                                </div>
                                <div className="sideBarAccountBalance">
                                    {subitem.balance && (
                                        <SidebarBalance negative={isNegative}>
                                            <div style={{display: 'flex'}}>
                                                {subitem.balance}
                                                <span style={{marginLeft: '5px'}}>€</span>
                                            </div>
                                        </SidebarBalance>
                                    )}
                                </div>
                            </div>
                        </DropdownLinkSubMenu>
                    );
                })}
        </>
    );
};

export default Submenu;
