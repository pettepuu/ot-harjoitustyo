import Axios from 'axios';
import {
    DataGrid, GridActionsCellItem,
    GridToolbarContainer,
    GridToolbarDensitySelector,
    GridToolbarExport,
    GridToolbarFilterButton, useGridApiContext
} from '@mui/x-data-grid';
import moment from "moment";
import AddAccTransaction from "../transaction/AddAccTransaction";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import {Select} from "@mui/material";
import PropTypes from "prop-types";
import React, {useState} from "react";
import MenuItem from "@mui/material/MenuItem";

export const AccountTransactionGrid = ({AccountName, setEffectOpen, setMessage, setAddAccTransactionSuccess, rows, setRows, payeeList}) => {
    const [selectedRows, setSelectedRows] = useState([]);
    const [pageSize, setPageSize] = useState(10)

    const CustomToolbar = () => {
        return (
            <GridToolbarContainer>
                <GridToolbarFilterButton />
                <GridToolbarDensitySelector />
                <GridToolbarExport />
                <AddAccTransaction setEffectOpen={setEffectOpen} setMessage={setMessage} AccountName={AccountName} setAddAccTransactionSuccess={setAddAccTransactionSuccess}/>
            </GridToolbarContainer>
        );
    }

    const SelectEditInputCell = (props) => {
        const { id, value, field } = props;
        const apiRef = useGridApiContext();
        const handleChange = async (event) => {
            await apiRef.current.setEditCellValue({ id, field, value: event.target.value });
        };

        if(field === ('TransactionRepeat')){
            return (
                <Select
                    value={value}
                    onChange={handleChange}
                    size="small"
                    sx={{ height: 1 }}
                    native
                    autoFocus
                >
                    <option>Once</option>
                    <option>Daily</option>
                    <option>Weekly</option>
                    <option>Monthly</option>
                    <option>Yearly</option>
                </Select>
            );
        }else if(field === ('Recipient')){
            return (
                <Select
                    size="small"
                    sx={{ height: 1 }}
                    autoFocus
                    onChange={handleChange}
                    value={value}
                >
                    {payeeList.map((payee) => (
                        <MenuItem key={payee.value} value={payee.value}>
                            {payee.value}
                        </MenuItem>
                    ))}
                </Select>
            )
        }
    }
    SelectEditInputCell.propTypes = {
        /**
         * The column field of the cell that triggered the event.
         */
        field: PropTypes.string.isRequired,
        /**
         * The grid row id.
         */
        id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
        /**
         * The cell value.
         * If the column has `valueGetter`, use `params.row` to directly access the fields.
         */
        value: PropTypes.any,
    };

    const handleCellEditCommit = ({ id, field, value }) => {
        const updatedRows = rows.map((row) => {
            if (row.id === id) {
                return {
                    ...row,
                    [field]: value,
                };
            }
            return row;
        });
        setRows(updatedRows);
    };

    const renderSelectEditInputCell = (params) => {
        return <SelectEditInputCell {...params} />;
    };

    const handleSaveClick = (id) => () => {
        const selectedData = rows.filter(row => row.id === id);
        const baseUrl = 'http://localhost:3001/transaction/update-transaction'
        Axios.post(baseUrl, {
            TransactionName: selectedData[0].TransactionName,
            Recipient: selectedData[0].Recipient,
            TransactionRepeat: selectedData[0].TransactionRepeat,
            Memo: selectedData[0].Memo,
            TransactionID: selectedData[0].id
        }).then(() => {
            setMessage('Edit was successful')
            setEffectOpen(true)
        }).catch(response => {
            alert(response.response.data)
        })
    };

    const handleDeleteClick = (id) => () => {
        const selectedData = rows.filter(row => row.id === id);
        const baseUrl = 'http://localhost:3001/transaction/delete-transaction'
        const UserID = localStorage.getItem('UserID')
        const AccountName = localStorage.getItem('AccountName')
        let Amount;
        if(selectedData[0].Inflow > 0){
            Amount = Math.abs(selectedData[0].Inflow) * -1
        }
        if(selectedData[0].Outflow > 0){
            Amount = selectedData[0].Outflow
        }
        console.log(Amount)
        if (window.confirm('Are you sure?')) {
            Axios.post(baseUrl, {
                TransactionID: selectedData[0].id,
                UserID: UserID,
                Amount: Amount,
                AccountName: AccountName,
                SubCategoryName: selectedData[0].Subcategory
            }).then(() => {
                setAddAccTransactionSuccess(true)
                setMessage('Delete was successful')
                setEffectOpen(true)
            }).catch(response => {
                alert(response.response.data)
            })
        }
    };

    const columns = [
        {field: 'TransactionDate',
            headerClassName: 'transactionsHeader',
            headerName: 'DATE',
            width: 110},
        {field: 'TransactionName',
            headerClassName: 'transactionsHeader',
            headerName: 'Transaction Name',
            width: 200,
            editable: true},
        {field: 'Subcategory',
            headerClassName: 'transactionsHeader',
            headerName: 'Subcategory',
            width: 200},
        {field: 'Outflow',
            headerClassName: 'transactionsHeader',
            headerName: 'Outflow',
            type: 'number',
            minWidth: 100},
        {field: 'Inflow',
            headerClassName: 'transactionsHeader',
            headerName: 'Inflow',
            type: 'number',
            minWidth: 100},
        {field: 'Recipient',
            headerClassName: 'transactionsHeader',
            headerName: 'Payee',
            minWidth: 100,
            width:200,
            renderEditCell: renderSelectEditInputCell,
            editable: true},
        {field: 'TransactionRepeat',
            headerClassName: 'transactionsHeader',
            headerName: 'Repeat',
            width: 100, renderEditCell: renderSelectEditInputCell,
            editable: true},
        {field: 'Memo',
            headerClassName: 'transactionsHeader',
            headerName: 'Memo',
            minWidth: 100,
            editable: true},
        {
            field: 'actions',
            headerClassName: 'transactionsHeader',
            type: 'actions',
            headerName: 'Actions',
            width: 100,
            cellClassName: 'actions',
            getActions: ({ id }) => {
                return [
                    <GridActionsCellItem
                        icon={<SaveIcon />}
                        label="Save"
                        onClick={handleSaveClick(id)}
                    />,
                    <GridActionsCellItem
                        icon={<DeleteIcon />}
                        label="Delete"
                        onClick={handleDeleteClick(id)}
                        color="inherit"
                    />,
                ];
            },
        },
    ];

    return(
        <div style={{ width: '100%' }} >
            <DataGrid
                sx={{
                    height: 300,
                    width: '100%',
                    ' & .transactionsHeader': {
                        fontWeight: "bold !important",
                    },
                    boxShadow: 2,
                    ' & .MuiDataGrid-cell:hover': {
                        color: '#A400FFFF',
                    },
                }}
                experimentalFeatures={{ columnGrouping: true }}
                density="compact"
                autoHeight {...columns}
                columns={columns}
                rows={rows}
                onSelectionModelChange={(newSelection) => {
                    setSelectedRows(newSelection);
                }}
                selectionModel={selectedRows}
                onCellEditCommit={handleCellEditCommit}
                components={{
                    Toolbar: CustomToolbar,
                }}
                className="TransactionGrid"
                rowsPerPageOptions={[10,25,50]}
                pageSize={pageSize}
                onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
            />
        </div>
    )
}

export const getAccountTransactions = (userID, accountName) => {
    const baseUrl = `http://localhost:3001/transaction/user-${userID}/accounts-transactions/account-${accountName}`;
    const updatedArray = [];
    return Axios.get(baseUrl).then(((response) => {
        for (let x = 0; x < response.data.length; x++) {
            let outflowCheck;
            let inflowCheck;

            if (response.data[x].Outflow === '0.00') {
                outflowCheck = null;
            } else outflowCheck = response.data[x].Outflow;

            if (response.data[x].Inflow === '0.00') {
                inflowCheck = null;
            } else inflowCheck = response.data[x].Inflow;

            updatedArray.push(
                {
                    id: response.data[x].TransactionID,
                    TransactionDate: moment(response.data[x].TransactionDate).format('YYYY-MM-DD'),
                    TransactionName: response.data[x].TransactionName,
                    Subcategory: response.data[x].SubcategoryName,
                    Outflow: outflowCheck,
                    Inflow: inflowCheck,
                    Recipient: response.data[x].Recipient,
                    TransactionRepeat: response.data[x].TransactionRepeat,
                    Memo: response.data[x].Memo,
                },
            );
        }
        return updatedArray;
    })).catch((response) => {
        alert(response.response.data);
    });
};