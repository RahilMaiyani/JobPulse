import API from "./axios";

export const sendEmail = async (data) => {
    const res = await API.post("/email/send", data);
    console.log(data);
    return res.data;
}