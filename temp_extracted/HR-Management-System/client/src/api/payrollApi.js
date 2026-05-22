import API from "./axios";

export const getPayrollStatus = async () => {
  const { data } = await API.get('/payroll/status');
  return data;
};

export const generatePayroll = async () => {
  const { data } = await API.post('/payroll/generate');
  return data;
};

export const setupEmployeeSalary = async ({ id, payload }) => {
  const { data } = await API.put(`/payroll/setup/${id}`, payload);
  return data;
};

export const getMyPayslips = async () => {
  const { data } = await API.get('/payroll/my-payslips');
  return data;
};

export const downloadPayslipPDF = async (id) => {
      const response = await API.get(`/payroll/download/${id}`, { responseType: 'blob' });
      return response.data;
}