import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as payrollApi from '../api/payrollApi';

export const usePayrollStatus = () => {
  return useQuery({
    queryKey: ['payroll-status'],
    queryFn: payrollApi.getPayrollStatus,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes so it doesn't spam the DB
  });
};

export const useMyPayslips = () => {
  return useQuery({
    queryKey: ['my-payslips'],
    queryFn: payrollApi.getMyPayslips,
  });
};

export const useGeneratePayroll = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: payrollApi.generatePayroll,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-status'] });
    },
  });
};

export const useSetupSalary = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: payrollApi.setupEmployeeSalary,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] }); 
    },
  });
};

export const useDownloadPayslip = () => {
  return useMutation({
    mutationFn: payrollApi.downloadPayslipPDF,
  });
};