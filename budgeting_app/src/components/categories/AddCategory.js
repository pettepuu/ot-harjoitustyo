import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import Axios from "axios";
import AddCircleOutline from "@mui/icons-material/AddCircleOutline";
import {useState} from "react";

const AddCategory = ({setAddDashboardSuccess, setEffectOpen, setMessage}) => {
    const [open, setOpen] = React.useState(false);
    const [category, setCategory] = React.useState("");
    const [isDisabled, setIsDisabled] = useState(false);
    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setCategory("");
        setCategoryError(false);
        setCategoryAlreadyExistsError(false);
    };

    const [categoryError, setCategoryError] = useState(false);

    const [categoryAlreadyExistsError, setCategoryAlreadyExistsError] = useState(false);

    const handleAddCategory = () => {
        setIsDisabled(true);
        const baseUrl = "http://localhost:3001/category/new-category";
        const userID = localStorage.getItem("UserID");
        if (category.length > 2) {
            Axios.post(baseUrl, {
                CategoryName: category,
                UserID: userID,
            }).then(() => {
                setOpen(false);
                setCategory("");
                setAddDashboardSuccess(true)
                setMessage('New category was added')
                setEffectOpen(true)
                setCategoryError(false);
                setIsDisabled(false);
            }).catch(response => {
                setIsDisabled(false);
                switch (response.response.data) {
                    case "Category already exists":
                        setCategoryError(false);
                        setCategoryAlreadyExistsError(true)
                        break;
                }
            })
        } else {
            setIsDisabled(false);
            setCategoryError(true)
        }
    };

    return (
        <div className="category-button">
            <Button id="category-button-1" sx={{fontSize: "13px"}} onClick={handleClickOpen}>
                <AddCircleOutline sx={{fontSize: "18px", marginLeft: "-2px", marginRight: "8px"}}/> Add Category
            </Button>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Create a category</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        To create a category, type it in the text field
                    </DialogContentText>
                    <TextField
                        required
                        autoFocus
                        margin="dense"
                        id="category"
                        label="Category"
                        fullWidth
                        inputProps={{maxLength: 10}}
                        value={category}
                        variant="filled"
                        onChange={(event) => {
                            setCategory(event.target.value.slice(0, 1).toUpperCase() + event.target.value.slice(1).toLowerCase());
                        }}
                        error={categoryError || categoryAlreadyExistsError}
                        helperText={
                            categoryError
                                ? "Category should be atleast 3 character long"
                                : categoryAlreadyExistsError
                                    ? "Category already exists"
                                    : ""
                        }
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} className="cancel-button">
                        Cancel
                    </Button>
                    <Button type="submit" onClick={handleAddCategory} disabled={isDisabled} className="Save-button">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default AddCategory