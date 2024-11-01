import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Axios from "axios";
import {Select} from "@mui/material";
import AddCircleOutline from "@mui/icons-material/AddCircleOutline";
import {Box} from "@mui/material";
import {useState} from "react";

const CreateBankAcc = ({setCreateAccSuccess, setMessage, setEffectOpen}) => {
    const [open, setOpen] = useState(false);
    const [accountType, setAccountType] = useState("");
    const [accountName, setAccountName] = useState("");
    const [accountBalance, setAccountBalance] = useState("");
    const [isDisabled, setIsDisabled] = useState(false);
    const [accountTypeEmpty, setAccountTypeEmpty] = useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setAccountType("");
        setAccountName("");
        setAccountBalance("");
        setAccountTypeEmpty(false)
    };

    const handleCreateAcc = () => {
        setAccountTypeEmpty(false)
        setIsDisabled(true);
        const baseUrl = "http://localhost:3001/account/new-account";
        //Pitää tarkastaa aikavyöhyke oikein
        const today = new Date().toISOString().slice(0, 10);
        const userID = localStorage.getItem("UserID");
        if (accountType !== "") {
            Axios.post(baseUrl, {
                AccountName: accountName,
                AccountType: accountType,
                Balance: accountBalance,
                BalanceDate: today,
                UserID: userID,
            }).then(() => {
                setOpen(false);
                setIsDisabled(false);
                setAccountType("");
                setAccountName("");
                setAccountBalance("");
                setCreateAccSuccess(true)
                setMessage(`Account ${accountName} was created`)
                setEffectOpen(true)
                setAccountTypeEmpty(false)
            }).catch(response => {
                setIsDisabled(false);
                alert(response.response.data)
            });
        } else {
            setAccountTypeEmpty(true)
            setIsDisabled(false);
        }
    };

    return (<div className="bank-button">
        <Button id="bank-button-1" display="flex" justifycontent="space-between" onClick={handleClickOpen}>
            <Box mr={1} sx={{paddingLeft: "0px", paddingRight: "1px"}}>
                <AddCircleOutline sx={{fontSize: "20px"}}/>
            </Box>
            <Box mr={1} sx={{fontSize: "17px", fontWeight: "400", textAlign: "right"}}>
                Add
            </Box>
            <Box mr={1} sx={{fontSize: "17px", fontWeight: "400", textAlign: "right"}}>
                Account
            </Box>
        </Button>
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Create Bank Account</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    To create a bank account you must add your account name, select the
                    type of account you want to open and type in your balance for the
                    account.
                </DialogContentText>
                <TextField
                    required
                    autoFocus
                    margin="dense"
                    id="account-name"
                    label="Account Name"
                    fullWidth
                    inputProps={{maxLength: 20}}
                    value={accountName}
                    variant="filled"
                    onChange={(event) => {
                        setAccountName(event.target.value);
                    }}
                />
                <TextField
                    required
                    autoFocus
                    margin="dense"
                    id="account-balance"
                    label="Account Balance"
                    type="number"
                    fullWidth
                    inputProps={{maxLength: 11}}
                    value={accountBalance}
                    variant="filled"
                    onChange={(event) => {
                        setAccountBalance(event.target.value);
                    }}
                />
                <FormControl required margin="dense">
                    <InputLabel id="account-type-label">Account Type</InputLabel>
                    <Select
                        style={{height: "50px", width: "200px"}}
                        labelId="account-type-label"
                        id="account-type"
                        fullWidth
                        value={accountType}
                        onChange={(event) => {
                            setAccountType(event.target.value);
                        }}
                        error={accountTypeEmpty}
                        helperText={accountTypeEmpty ? "add AccountType" : ""}
                    >
                        <MenuItem value="Cash">Cash</MenuItem>
                        <MenuItem value="Checking">Checking</MenuItem>
                        <MenuItem value="Credit Card">Credit Card</MenuItem>
                        <MenuItem value="Savings">Savings</MenuItem>
                        <MenuItem value="Loan">Loan</MenuItem>
                    </Select>
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} className="cancel-button">
                    Cancel
                </Button>
                <Button onClick={handleCreateAcc} disabled={isDisabled} className="Save-button">
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    </div>);
}

export default CreateBankAcc