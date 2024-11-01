import {useEffect, useState} from "react";
import TextField from "@mui/material/TextField";
import {styled, TextFieldProps} from "@mui/material";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {DesktopDatePicker} from "@mui/x-date-pickers/DesktopDatePicker";
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import IconButton from '@mui/material/IconButton';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

const moment = require('moment')

const CssTextField = styled(TextField)({
    '& label.Mui-focused': {
        color: 'white',
    },
    '& .MuiInput-underline:after': {
        borderBottomColor: 'white',
        color: 'white',
    },
    '& .MuiOutlinedInput-root': {
        '& fieldset': {
            borderColor: 'white',
            color: 'white',
        },
        '&:hover fieldset': {
            borderColor: '#d380ff',
            color: 'white',
        },
        '&.Mui-focused fieldset': {
            borderColor: '#d380ff',
            color: 'white',
        },
        '& .MuiInputBase-input': {
            color: 'white',
        },
        '& .MuiIconButton-root': {
            color: 'white',
        },
        '& .MuiIconButton-root:hover': {
            color: '#d380ff',
        },
        '& .MuiButtonBase-root': {
            color: 'white',
        },
        '& .MuiButtonBase-root:hover': {
            color: '#d380ff',
        }

    },
});

const DateSelector = ({setAddDashboardSuccess}) => {
    const [date, setDate] = useState(moment());

    useEffect(() => {
        localStorage.setItem("Month", date.format("MM"));
        localStorage.setItem("Year", date.format("YYYY"));
    }, [date]);

    const handleDateChange = (newDate) => {
        setDate(newDate);
        setAddDashboardSuccess(true);
    };

    const handlePrevMonthClick = () => {
        const newDate = date.clone().subtract(1, "month");
        setDate(newDate);
        handleDateChange(newDate);
    };

    const handleNextMonthClick = () => {
        const newDate = date.clone().add(1, "month");
        setDate(newDate);
        handleDateChange(newDate);
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DesktopDatePicker
                className="monthYearPicker"
                label=""
                inputFormat="MMMM YYYY"
                value={date}
                onChange={handleDateChange}
                renderInput={(params: TextFieldProps) => (
                    <div className="dateSelector"
                         style={{
                             display: "flex",
                             alignItems: "center",
                             textColor: "white",
                         }}
                    >
                        <IconButton size="medium" sx={{color: 'white'}} onClick={handlePrevMonthClick}>
                            <KeyboardArrowLeftIcon/>
                        </IconButton>
                        <CssTextField
                            variant="outlined"
                            size="small"
                            label=""
                            {...params}
                        />
                        <IconButton size="medium" sx={{color: 'white'}} onClick={handleNextMonthClick}>
                            <KeyboardArrowRightIcon/>
                        </IconButton>
                    </div>
                )}
                views={["month", "year"]}
                showDaysOutsideCurrentMonth
            />
        </LocalizationProvider>
    );
};

export default DateSelector;