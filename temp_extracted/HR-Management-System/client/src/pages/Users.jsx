import DashboardLayout from "../layouts/DashboardLayout";
import { useUsers, useDeleteUser } from "../hooks/useUsers";
import { useState, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import UserModal from "../components/UserModal";
import UsersTableSkeleton from "../components/UsersTableSkeleton";
import DeleteModal from "../components/DeleteModal";
import UserDetailsModal from "../components/UserDetailsModal";
import { useTitle } from "../hooks/useTitle";
import PayrollSetupModal from "../components/PayrollSetupModal"; // Added Import

import { 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  ChevronLeft, 
  ChevronRight, 
  Mail,
  Briefcase,
  RotateCcw,
  IndianRupee // Added Icon
} from "lucide-react";

export default function Users() {
  useTitle("Employees")
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [deleteUserName, setDeleteUserName] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // NEW STATE: Holds the user being configured for payroll
  const [payrollUser, setPayrollUser] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const USERS_PER_PAGE = 10;

  const { user } = useAuth();
  const { data: users = [], isLoading } = useUsers();
  const totalUsers = users?.length;
  const deleteMutation = useDeleteUser();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);

  const employees = users.filter((u) => u.role != 'admin');
  
  const departments = useMemo(() => {
    const deps = employees.map((u) => u.department).filter(Boolean);
    return ["", ...new Set(deps)];
  }, [users, employees]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch = u.name.toLowerCase().includes(search.toLowerCase());
      const matchDepartment = !department || u.department === department;
      const notSelf = u.email !== user.email;
      return matchSearch && matchDepartment && notSelf;
    });
  }, [users, search, department, user.email]);

  useMemo(() => {
    setCurrentPage(1);
  }, [search, department]);

  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * USERS_PER_PAGE;
    return filteredUsers.slice(start, start + USERS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  return (
    <DashboardLayout
      onAddUser={() => {
        setEditUser(null);
        setIsModalOpen(true);
      }}
    >
      <div className="p-10 max-w-350 mx-auto space-y-8 bg-slate-50/30 min-h-screen">
      {isLoading ? (
          <UsersTableSkeleton />
        ) : (
        <>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-3 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">User Management</h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">Manage employee access, roles, and departmental assignments.</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="text"
                placeholder="Search by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 h-11 border border-slate-200 rounded-lg w-64 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white shadow-sm"
              />
            </div>

            <div className="relative group">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="pl-10 pr-8 h-11 border border-slate-200 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white shadow-sm cursor-pointer min-w-45"
              >
                {departments.map((dep, i) => (
                  <option key={i} value={dep}>
                    {dep || "All Departments"}
                  </option>
                ))}
              </select>
            </div>
            <button 
              onClick={() => {
                setSearch("");
                setDepartment("");
              }} 
              className="flex items-center justify-center align-middle gap-2 h-11 border border-rose-200 bg-rose-50 text-rose-600 text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-rose-100 transition-colors w-30"
            >
              <RotateCcw className="w-3.5 h-3.5 " />
              <span>Clear</span>
            </button>
          </div>
        </div>
        <div className="flex justify-end text-sm text-slate-500 mb-4 mr-5">
          <span>Total Users : {totalUsers}</span>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">Employee</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">Contact Info</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">Organization</th>
                <th className="px-6 py-4 text-right text-[11px] font-bold text-slate-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-20 text-center text-slate-400 italic text-sm font-medium">
                    No matching records found.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((u) => (
                  <tr
                    key={u._id}
                    onClick={() => setSelectedUser(u)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <img
                          src={u.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=f1f5f9&color=475569`}
                          className="w-11 h-11 rounded-full object-cover border border-slate-100 shadow-sm transition-transform group-hover:scale-105"
                          alt={u.name}
                          draggable="false"
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-800">{u.name}</span>
                          <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 w-fit px-2 py-0.5 rounded mt-1">
                            {u.role}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Mail className="w-3.5 h-3.5 text-slate-300" />
                        <span className="font-medium">{u.email}</span>
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Briefcase className="w-3.5 h-3.5 text-slate-300" />
                        <span className="font-medium">
                          {u.department || <span className="text-slate-300 italic">Not Assigned</span>}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditUser(u);
                            setIsModalOpen(true);
                          }}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          title="Edit User"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); 
                            setPayrollUser(u);
                          }}
                          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                          title="Configure Payroll"
                        >
                          <IndianRupee className="w-4 h-4" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteUserName(u.name);
                            setDeleteUserId(u._id);
                          }}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="flex justify-between items-center px-6 py-4 bg-slate-50 border-t border-slate-200">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Displaying Page {currentPage} of {totalPages}
              </p>

              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={(e) => { e.stopPropagation(); setCurrentPage((p) => p - 1); }}
                  className="p-2 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  disabled={currentPage === totalPages}
                  onClick={(e) => { e.stopPropagation(); setCurrentPage((p) => p + 1); }}
                  className="p-2 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        
        </>
        )}
        <DeleteModal
          isOpen={!!deleteUserId}
          onClose={() => setDeleteUserId(null)}
          title={deleteUserName || 'user'}
          type={'user'}
          onConfirm={() => {
            deleteMutation.mutate(deleteUserId);
            setDeleteUserId(null);
          }}
        />

        <UserDetailsModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />

        <UserModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          editUser={editUser}
        />

        <PayrollSetupModal
          isOpen={!!payrollUser}
          onClose={() => setPayrollUser(null)}
          user={payrollUser}
        />

      </div>
    </DashboardLayout>
  );
}