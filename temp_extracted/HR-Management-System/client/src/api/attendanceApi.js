import API from "./axios";

export const checkIn = async () => {
  const res = await API.post("/attendance/check-in");
  return res.data;
};

export const checkOut = async () => {
  const res = await API.post("/attendance/check-out");
  return res.data;
};

export const todayAttn = async () => {
    const res = await API.get("/attendance/today");
    // console.log(res.data)
    return res.data;
}

export const getAllAttendance = async () => {
  const res = await API.get("attendance/all");
  return res.data;
}

export const getFilterAttendance = async () => {
  const res = await API.get("/attendance/filters");
  return res.data;
}

export const getAttendanceHistory = async (selectedMonth, selectedYear, page) => {
  const res = await API.get(`/attendance/me?month=${selectedMonth}&year=${selectedYear}&page=${page}`);
  return res.data;
}


export const getUserAttendance = async (id) => {
  const res = await API.get(`/attendance/user/${id}`);
  // console.log(res)
  return res.data;
}