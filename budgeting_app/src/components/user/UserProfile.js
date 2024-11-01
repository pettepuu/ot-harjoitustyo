import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import {useState} from "react";
import {IconButton, InputAdornment, MenuItem} from "@mui/material";
import {Visibility, VisibilityOff} from "@mui/icons-material";
import Axios from "axios";

const UserProfile = ({setEffectOpen, setMessage, handleLogout}) => {
    const [open, setOpen] = React.useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [password, setPassword] = useState('');
    const [rePassword, setRePassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [currentEmail, setCurrentEmail] = useState('');
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
    const [isDisabled, setIsDisabled] = useState(false);
    const [newEmail, setNewEmail] = useState("");
    const [emailError, setEmailError] = useState(false);
    const [emailInUse, setEmailInUse] = useState(false);

    const validateEmail = (email) => {
        // regular expression for email validation
        //const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const emailRegex = /^([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9-]+\.)+([a-zA-Z]{2,})$/;

        if (!emailRegex.test(email)) {
            // invalid email format
            return false;
        }

        // split the email address into parts
        const parts = email.split("@");
        const domainParts = parts[1].split(".");
        const tld = domainParts[domainParts.length - 1].toLowerCase();

        // list of valid top-level domains
        const validTLDs = ["com", "org", "net", "edu", "gov", "fi"];

        // check if the top-level domain is valid
        return validTLDs.includes(tld);
    };

    const handleEmailChange = (event) => {
        const value = event.target.value;
        setNewEmail(value);
        setEmailError(!validateEmail(value));
        setEmailInUse(false);
    };


    const handleClick = () => {
        setShowPassword(!showPassword);
    };

    const handleMouseDown = (e) => {
        e.preventDefault();
    };

    const handleClickOpen = () => {
        handleGetEmail()
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setOldPassword('')
        setPassword('');
        setRePassword('');
        setShowPassword(false)
        setNewEmail('')
        setEmailError(false)
    };
    const handleDeleteConfirmationOpen = () => {
        setDeleteConfirmationOpen(true);
    };

    const handleDeleteConfirmationClose = () => {
        setDeleteConfirmationOpen(false);
    };

    const handleChangePassword = () => {
        setIsDisabled(true);
        const baseUrl = "http://localhost:3001/user/change-password";
        const userID = localStorage.getItem('UserID')
        if (password === rePassword && password !== oldPassword && 8 <= password.length) {
            Axios.post(baseUrl, {
                oldPassword: oldPassword, newPassword: password, userID: userID
            }).then(() => {
                setOpen(false)
                setPassword('')
                setRePassword('')
                setOldPassword('')
                setShowPassword(false)
                setIsDisabled(false);
                setMessage('Password change was successful')
                setEffectOpen(true)
            }).catch(response => {
                setIsDisabled(false);
                alert(response.response.data)
            })
        } else {
            alert("Input of data doesn't meet requirements.")
        }
    }

    const handleDelete = () => {
        setIsDisabled(true);
        const baseUrl = "http://localhost:3001/user/delete-user";
        const userID = localStorage.getItem('UserID');
        const username = localStorage.getItem('Username');
        const url = "http://localhost:3001/user/login";
        Axios.post(url, {
            username: username, password: password,
        }).then(() => {
            Axios.post(baseUrl, {
                userID: userID,
            }).then(() => {
                handleLogout();
                setIsDisabled(false);
                alert("User Deleted");
                setDeleteConfirmationOpen(false);
            }).catch((response) => {
                setIsDisabled(false);
                alert(response.response.data)
            })
        }).catch((response) => {
            setIsDisabled(false);
            alert(response.response.data)
        })
    };

    const handleChangeEmail = () => {
        setIsDisabled(true);
        const baseUrl = "http://localhost:3001/user/change-email";
        const userID = localStorage.getItem('UserID')
        if (validateEmail(newEmail)) {
            Axios.post(baseUrl, {
                newEmail: newEmail, userID: userID
            }).then(() => {
                setOpen(false)
                setNewEmail('')
                setShowPassword(false)
                setIsDisabled(false);
                setMessage('Email change was successful')
                setEffectOpen(true)
            }).catch(response => {
                setIsDisabled(false);
                setEmailInUse(response.response.data)
            })
            //} else {
            //    alert('Email-address does not meet requirements.')
        }
    }
    const handleGetEmail = () => {
        const userID = localStorage.getItem('UserID')
        const baseUrl = `http://localhost:3001/user/${userID}/get-email`
        Axios.get(baseUrl).then(((response) => {
            setCurrentEmail(response.data)
        })).catch((response) => {
            alert(response.response.data);
        });
    }


    return (<div className='secondary-button'>
        <MenuItem onClick={handleClickOpen}>Profile</MenuItem>
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>User Profile</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Here you can change your password
                </DialogContentText>
                <TextField
                    required
                    autoFocus
                    margin="dense"
                    id="old-password"
                    label="Old Password"
                    type={showPassword ? 'text' : 'password'}
                    inputProps={{maxLength: 30}}
                    onKeyDown={(e) => {
                        e.stopPropagation();
                    }}
                    variant="filled"
                    fullWidth
                    InputProps={{
                        endAdornment: (<InputAdornment position="end">
                            <IconButton onClick={handleClick} onMouseDown={handleMouseDown}>
                                {showPassword ? <VisibilityOff/> : <Visibility/>}
                            </IconButton>
                        </InputAdornment>),
                    }}
                    onChange={(event) => {
                        setOldPassword(event.target.value)
                    }}
                />
                <TextField
                    required
                    autoFocus
                    margin="dense"
                    id="password-first"
                    label="New Password"
                    type={showPassword ? 'text' : 'password'}
                    inputProps={{maxLength: 30}}
                    onKeyDown={(e) => {
                        e.stopPropagation();
                    }}
                    variant="filled"
                    fullWidth
                    InputProps={{
                        endAdornment: (<InputAdornment position="end">
                            <IconButton onClick={handleClick} onMouseDown={handleMouseDown}>
                                {showPassword ? <VisibilityOff/> : <Visibility/>}
                            </IconButton>
                        </InputAdornment>),
                    }}
                    onChange={(event) => {
                        setPassword(event.target.value)
                    }}
                />
                <TextField
                    required
                    autoFocus
                    margin="dense"
                    id="password-again"
                    label="New Password"
                    type={showPassword ? 'text' : 'password'}
                    inputProps={{maxLength: 30}}
                    onKeyDown={(e) => {
                        e.stopPropagation();
                    }}

                    variant="filled"
                    fullWidth
                    InputProps={{
                        endAdornment: (<InputAdornment position="end">
                            <IconButton onClick={handleClick} onMouseDown={handleMouseDown}>
                                {showPassword ? <VisibilityOff/> : <Visibility/>}
                            </IconButton>
                        </InputAdornment>),
                    }}
                    onChange={(event) => {
                        setRePassword(event.target.value)
                    }}
                />
                <Button onClick={handleChangePassword} disabled={isDisabled} style={{float: "right"}}>Update
                    Password</Button>
                <hr style={{width: "100%", height: "2px"}}></hr>
                <DialogContentText>
                    Here you can change your email
                </DialogContentText>
                <TextField
                    autoFocus
                    disabled
                    margin="dense"
                    id="current-email"
                    label={currentEmail}
                    inputProps={{maxLength: 60}}
                    onKeyDown={(e) => {
                        e.stopPropagation();
                    }}
                    variant="filled"
                    fullWidth
                />
                <TextField
                    required
                    autoFocus
                    margin="dense"
                    id="first-email"
                    label="New email"
                    inputProps={{maxLength: 60}}
                    onKeyDown={(e) => {
                        e.stopPropagation();
                    }}
                    variant="filled"
                    fullWidth
                    value={newEmail}
                    onChange={handleEmailChange}
                    error={emailError || emailInUse}
                    helperText={emailError ? "Please enter a valid email address with a valid top-level domain (e.g. .com, .org, .net)" : emailInUse ? "Email already in use. Check your input." : ""}
                />
            </DialogContent>
            <DialogActions style={{justifyContent: "space-between"}}>
                <Button onClick={handleDeleteConfirmationOpen} style={{color: "red", backgroundColor: "#ffebee"}}>Delete
                    User</Button>
                <div>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleChangeEmail} disabled={isDisabled}>Update Email</Button>
                </div>
                <Dialog open={deleteConfirmationOpen} onClose={handleDeleteConfirmationClose}>
                    <DialogTitle>Delete User Account</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            If you are sure you want to delete your account, enter your password and click the
                            Delete button.
                        </DialogContentText>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="password"
                            label="Password For Deletion"
                            type={showPassword ? 'text' : 'password'}
                            inputProps={{maxLength: 30}}
                            onKeyDown={(e) => {
                                e.stopPropagation();
                            }}
                            variant="filled"
                            fullWidth
                            InputProps={{
                                endAdornment: (<InputAdornment position="end">
                                    <IconButton onClick={handleClick} onMouseDown={handleMouseDown}>
                                        {showPassword ? <VisibilityOff/> : <Visibility/>}
                                    </IconButton>
                                </InputAdornment>),
                            }}
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleDeleteConfirmationClose}>Cancel</Button>
                        <Button onClick={handleDelete} disabled={isDisabled} style={{color: "red"}}>Delete</Button>
                    </DialogActions>
                </Dialog>
            </DialogActions>
        </Dialog>
    </div>);
}

export default UserProfile;