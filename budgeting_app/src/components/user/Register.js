import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import {useState} from "react";
import Axios from "axios";
import {IconButton, InputAdornment} from "@mui/material";
import {Visibility, VisibilityOff} from "@mui/icons-material";

const Register = ({setEffectOpen, setMessage}) => {
    const [open, setOpen] = React.useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rePassword, setRePassword] = useState('');
    const [email, setEmail] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [emailError, setEmailError] = useState(false);
    const [isDisabled, setIsDisabled] = useState(false);

    const handleChange = (event) => {
        const value = event.target.value;
        setEmail(value);
        setEmailError(!validateEmail(value));
    };

    const validateEmail = (email) => {
        // regular expression for email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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


    const handleClick = () => {
        setShowPassword(!showPassword);
    };

    const handleMouseDown = (e) => {
        e.preventDefault();
    };

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setUsername('');
        setPassword('');
        setRePassword('');
        setEmail('');
    };

    const handleSignUp = () => {
        setIsDisabled(true);
        const baseUrl = "http://localhost:3001/user/register";
        if (validateEmail(email)) {
            if (password === rePassword && 8 <= password.length && 3 <= username.length) {
                Axios.post(baseUrl, {
                    username: username,
                    password: password,
                    email: email
                }).then(() => {
                    setOpen(false);
                    setUsername('');
                    setIsDisabled(false);
                    setPassword('');
                    setRePassword('');
                    setEmail('');
                    setMessage('Register was successful')
                    setEffectOpen(true)
                }).catch(response => {
                    setIsDisabled(false);
                    alert(response.response.data)
                })
            } else {
                alert("Input of data doesn't meet requirements.")
                setIsDisabled(false);
            }
        } else {
            alert('Email-address does not meet requirements.')
            setIsDisabled(false);
        }
    };

    return (
        <div className='secondary-button'>
            <Button variant="outlined" onClick={handleClickOpen} id='signup-button'>
                Sign Up
            </Button>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Sign Up</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        To register, please fill out your desired username, password and email.
                    </DialogContentText>
                    <TextField
                        required
                        autoFocus
                        margin="dense"
                        id="username"
                        label="Username"
                        fullWidth
                        inputProps={{maxLength: 30}}
                        variant="filled"
                        value={username}
                        onChange={(event) => {
                            setUsername(event.target.value)
                        }}
                    />
                    <TextField
                        required
                        autoFocus
                        margin="dense"
                        id="password"
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        inputProps={{maxLength: 30}}
                        fullWidth
                        variant="filled"
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={handleClick} onMouseDown={handleMouseDown}>
                                        {showPassword ? <VisibilityOff/> : <Visibility/>}
                                    </IconButton>
                                </InputAdornment>
                            ),
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
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        inputProps={{maxLength: 30}}
                        fullWidth
                        variant="filled"
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={handleClick} onMouseDown={handleMouseDown}>
                                        {showPassword ? <VisibilityOff/> : <Visibility/>}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                        onChange={(event) => {
                            setRePassword(event.target.value)
                        }}
                    />
                    <TextField
                        required
                        autoFocus
                        margin="dense"
                        id="email"
                        label="Email Address"
                        type="email"
                        fullWidth
                        inputProps={{
                            style: {textTransform: "lowercase"},
                            maxLength: 60,
                        }}
                        variant="filled"
                        value={email}
                        onChange={handleChange}
                        error={emailError}
                        helperText={
                            emailError
                                ? "Please enter a valid email address with a valid top-level domain (e.g. .com, .org, .net)"
                                : ""
                        }
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleSignUp} disabled={isDisabled}>Sign up</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default Register
