import { useForm } from "react-hook-form";
import { useEffect, useRef, useState } from "react";
import Modal from "./ui/Modal";
import { useCreateUser, useUpdateUser } from "../hooks/useUsers";
import { Camera, X, User, Mail, Shield, Briefcase, Lock } from "lucide-react";

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/jpg"];

export default function UserModal({ isOpen, onClose, editUser }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm();

  const [preview, setPreview] = useState("");
  const [imageError, setImageError] = useState("");
  const [apiError, setApiError] = useState("");
  const fileRef = useRef(null);

  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();

  useEffect(() => {
    if (!isOpen) return;

    if (editUser) {
      reset({
        name: editUser.name || "",
        email: editUser.email || "",
        department: editUser.department || "",
        role: editUser.role || "employee"
      });
      setPreview(editUser.profilePic || "");
    } else {
      reset({
        name: "",
        email: "",
        password: "",
        department: "",
        role: "employee"
      });
      setPreview("");
    }

    setImageError("");
    setApiError("");
  }, [editUser, isOpen, reset]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setImageError("Only JPG or PNG allowed");
      return;
    }

    if(file.size > MAX_IMAGE_SIZE) {
      setImageError("Maximum size is 2 MB");
      return;
    }

    setImageError("");
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    
    // FIX: Changed from readAsDataUrl to readAsDataURL
    reader.readAsDataURL(file);
  };

  const onSubmit = (data) => {
    setApiError("");
    data.profilePic = preview || "";
    const mutation = editUser ? updateMutation : createMutation;

    mutation.mutate(
      editUser ? { id: editUser._id, data } : data,
      {
        onSuccess: onClose,
        onError: (err) => {
          setApiError(err?.response?.data?.msg || "Internal Server Error");
        }
      }
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-md">
        {/* HEADER */}
        <div className="mb-5">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            {editUser ? "Update Identity" : "New Registration"}
          </h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* PHOTO UPLOADER */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full border-2 border-slate-100 shadow-sm bg-slate-50 overflow-hidden flex items-center justify-center">
                {preview ? (
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" draggable="false" />
                ) : (
                  <User className="w-10 h-10 text-slate-300" />
                )}
              </div>
              
              <label className="absolute bottom-0 right-0 w-8 h-8 bg-indigo-600 rounded-full border-2 border-white flex items-center justify-center shadow-md cursor-pointer hover:bg-indigo-700 transition-colors">
                <Camera className="w-4 h-4 text-white" />
                <input
                  type="file"
                  ref={fileRef}
                  onChange={handleImageChange}
                  className="hidden"
                  accept="image/*"
                />
              </label>

              {preview && (
                <button
                  type="button"
                  onClick={() => setPreview("")}
                  className="absolute -top-1 -right-1 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm text-slate-400 hover:text-rose-500 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            {imageError && (
              <p className="text-rose-500 text-[10px] font-bold uppercase tracking-tighter">
                {imageError}
              </p>
            )}
          </div>

          <div className="space-y-4">
            {/* NAME */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                <User className="w-3 h-3" /> Full Name
              </label>
              <input
                {...register("name", { required: "Name is required" })}
                placeholder="Employee Name"
                className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all"
              />
              {errors.name && (
                <p className="text-rose-500 text-[10px] font-bold uppercase mt-1 ml-1 tracking-tighter">{errors.name.message}</p>
              )}
            </div>

            {/* EMAIL */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                <Mail className="w-3 h-3" /> Email Address
              </label>
              <input
                {...register("email", {
                  required: "Email is required",
                  pattern: { value: /\S+@\S+\.\S+/, message: "Invalid email format" }
                })}
                placeholder="corporate@email.com"
                className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all"
              />
              {errors.email && (
                <p className="text-rose-500 text-[10px] font-bold uppercase mt-1 ml-1 tracking-tighter">{errors.email.message}</p>
              )}
            </div>

            {/* PASSWORD (Only on Create) */}
            {!editUser && (
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                  <Lock className="w-3 h-3" /> Initial Password
                </label>
                <input
                  type="password"
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 6, message: "Min. 6 characters" }
                  })}
                  placeholder="••••••••"
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all"
                />
                {errors.password && (
                  <p className="text-rose-500 text-[10px] font-bold uppercase mt-1 ml-1 tracking-tighter">{errors.password.message}</p>
                )}
              </div>
            )}

            {/* DEPT + ROLE */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                  <Briefcase className="w-3 h-3" /> Department
                </label>
                <input
                  {...register("department", { required: "Required" })}
                  placeholder="Engineering"
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                  <Shield className="w-3 h-3" /> Access Level
                </label>
                <select
                  {...register("role")}
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm font-medium bg-white focus:border-indigo-500 outline-none transition-all"
                >
                  <option value="employee">Employee</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
            </div>
          </div>

          {apiError && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-[11px] font-bold text-center uppercase tracking-tighter">
              {apiError}
            </div>
          )}

          {/* ACTIONS */}
          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="flex-1 h-11 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
            >
              {editUser ? "Save Changes" : "Confirm Entry"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}