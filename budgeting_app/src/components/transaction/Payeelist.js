import Axios from "axios";

export const getPayeeList = () => {
    const userID = localStorage.getItem('UserID');
    const baseUrl = `http://localhost:3001/transaction/user-${userID}/get-payee-list`;
    const updatedArray = [];
    return Axios.get(baseUrl).then((response) => {
        for (let x = 0; x < response.data.length; x++) {
            const payee = response.data[x].Payee;
            updatedArray.push({value: payee});
        }
        return updatedArray;
    }).catch((response) => {
        alert(response.response.data);
    });
};


