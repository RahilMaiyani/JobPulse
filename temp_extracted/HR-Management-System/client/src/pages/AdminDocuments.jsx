import { useState, useMemo } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useUsers } from "../hooks/useUsers.js"; // 1. Import your hook
import { useDocuments, useUserDocuments } from "../hooks/useDocuments.js";
import DocumentCard from "../components/DocumentCard.jsx";
import DocumentSkeleton from "../components/DocumentSkeleton.jsx";
import EmptyState from "../components/EmptyState.jsx";
import DashboardLayout from "../layouts/DashboardLayout.jsx";
import AdminDocumentsSkeleton from "../components/AdminDocumentsSkeleton.jsx";
import { Search } from "lucide-react";
import DocumentPreviewModal from "../components/DocumentPreviewModal.jsx";
import DeleteModal from "../components/DeleteModal.jsx";
import { RotateCcw } from "lucide-react";
import { useTitle } from "../hooks/useTitle.js";

const AdminDocuments = () => {
  useTitle("Documents")
  const { user } = useAuth();
  
  const { data: users = [], isLoading: isLoadingUsers } = useUsers();
  const { isDeleting, deleteDocument } = useDocuments();

  const [selectedUserId, setSelectedUserId] = useState("");
  const [searchText, setSearchText] = useState("");
  const [previewDoc, setPreviewDoc] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null); 

  const resetSearch = () => {
    setSearchText("");
    setSelectedUserId("");
    setDeleteTarget(null);
    setPreviewDoc(null);
  }

  const employees = useMemo(() => 
    (users || []).filter((u) => u.role === 'employee'), 
    [users]
  );

  const filteredEmployees = useMemo(() => 
    employees.filter((emp) =>
      emp.name.toLowerCase().includes(searchText.toLowerCase())
    ), [employees, searchText]
  );

  const selectedEmployee = useMemo(() => 
    employees.find((e) => e._id === selectedUserId),
    [employees, selectedUserId]
  );

  const { documents, isLoadingUserDocuments } = useUserDocuments(selectedUserId);

  const handleConfirmDelete = async () => {
    if (deleteTarget) {
      await deleteDocument(deleteTarget._id);
      setDeleteTarget(null);
    }
  };

  // Auth Guard
  if (user?.role !== "admin") {
    return (
      <DashboardLayout>
        <div className="p-6 text-center">
          <p className="text-rose-600 font-bold">Admin access required</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-10 space-y-6">
        {isLoadingUsers ? (
          <AdminDocumentsSkeleton />
        ) : (
          <>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Document Management</h1>
              <p className="text-slate-500 mt-1 font-medium text-sm">View and manage employee documents</p>
            </div>

            {/* Search & Select Employee */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3">
                Search Employee
              </label>

              <div className="relative mb-3 flex gap-3">
                <>
                  <Search className="absolute left-3 top-3 w-5 h-5 text-slate-300" />
                  <input
                    type="text"
                    placeholder="Type name to filter..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  />
                </>
                <button 
                  onClick={resetSearch} 
                  className="flex items-center justify-center gap-2 h-10 border border-rose-200 bg-rose-50 text-rose-600 text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-rose-100 transition-colors w-30"
                >
                  <RotateCcw className="w-3.5 h-3.5 " />
                  <span>Clear</span>
                </button>
              </div>

              <div className="space-y-2 max-h-50 overflow-y-auto border border-slate-100 rounded-lg p-1 custom-scrollbar">
                {filteredEmployees.length === 0 ? (
                  <div className="p-4 text-center text-slate-400 italic text-sm">No employees found</div>
                ) : (
                  filteredEmployees.map((emp) => (
                    <button
                      key={emp._id}
                      onClick={() => setSelectedUserId(emp._id)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                        selectedUserId === emp._id
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100"
                          : "hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <div className="font-bold text-sm">{emp.name}</div>
                      <div className={`text-[10px] ${selectedUserId === emp._id ? "text-indigo-100" : "text-slate-400"}`}>
                        {emp.email}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Selected Employee Info */}
            {selectedEmployee && (
              <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 flex items-center gap-3">
                <img
                  src={selectedEmployee?.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedEmployee?.name)}&background=f1f5f9&color=475569`}
                  className="w-9 h-9 rounded-full object-cover border border-slate-100 shadow-sm transition-transform group-hover:scale-105"
                  alt={selectedEmployee?.name}
                  draggable="false"
                />
                <p className="text-indigo-900 text-sm">
                  <span className="font-bold">Active Selection:</span> {selectedEmployee.name} 
                </p>
              </div>
            )}

            {/* Documents Grid */}
            {selectedUserId ? (
              isLoadingUserDocuments ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => <DocumentSkeleton key={i} />)}
                </div>
              ) : (documents || []).length === 0 ? (
                <EmptyState
                  icon="FileBox"
                  title="No Documents"
                  description={`${selectedEmployee?.name || "This user"} has not uploaded any files yet.`}
                />
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Vault Contents ({documents.length})
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {documents.map((doc) => (
                      <DocumentCard
                        key={doc._id}
                        document={doc}
                        onDelete={() => setDeleteTarget(doc)}
                        isDeleting={isDeleting}
                        onPreview={() => setPreviewDoc(doc)}
                      />
                    ))}
                  </div>
                </div>
              )
            ) : (
              <EmptyState
                icon="Users"
                title="Select an Employee"
                description="Choose a member of the workforce to audit their document vault."
              />
            )}
          </>
        )}
      </div>

      <DocumentPreviewModal 
        previewDoc={previewDoc} 
        closePreview={() => setPreviewDoc(null)} 
      />

      <DeleteModal
        isOpen={!!deleteTarget}
        title={deleteTarget?.title}
        type="Document"
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </DashboardLayout>
  );
};

export default AdminDocuments;