import { useForm } from "react-hook-form";
import { useEffect, useRef, useState } from "react";
import Modal from "./ui/Modal";
import { useUpdateUser } from "../hooks/useUsers";
import { Camera, X, User, Lock, Mail, BadgeCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/jpg"];

export default function EmployeeProfileModal({ isOpen, onClose, user }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm();

  const { updateUser } = useAuth();

  const [preview, setPreview] = useState("");
  const [imageError, setImageError] = useState("");
  const [apiError, setApiError] = useState("");

  const fileRef = useRef(null);
  const updateMutation = useUpdateUser();

  useEffect(() => {
    if (!isOpen || !user) return;

    reset({
      name: user.name || "",
      email: user.email || "",
      password: ""
    });

    setPreview(user.profilePic || "");
    setImageError("");
    setApiError("");

    if (fileRef.current) fileRef.current.value = "";
  }, [isOpen, user, reset]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setImageError("Only JPG or PNG allowed");
      setPreview("");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setImageError("Max size 2MB");
      setPreview("");
      return;
    }

    setImageError("");
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setPreview("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const onSubmit = (data) => {
    setApiError("");
    if (imageError) return;

    updateUser(data, preview);
    // console.log(preview);

    const payload = {
      name: data.name,
      profilePic: preview
    };

    if (data.password) {
      payload.password = data.password;
    }

    updateMutation.mutate(
      { id: user._id, data: payload },
      {
        onSuccess: onClose,
        onError: (err) =>
          setApiError(err?.response?.data?.msg || "Update failed")
      }
    );
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-md">
        
        {/* HEADER */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BadgeCheck className="w-5 h-5 text-indigo-600" />
            My Profile Settings
          </h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Manage your personal identity and security.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          {/* AVATAR UPLOAD */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-slate-50 shadow-sm bg-slate-100 flex items-center justify-center">
                {preview ? (
                  <img src={preview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-slate-300" />
                )}
              </div>
              
              <label className="absolute bottom-0 right-0 w-8 h-8 bg-indigo-600 rounded-full border-2 border-white flex items-center justify-center cursor-pointer shadow-md hover:bg-indigo-700 transition-all active:scale-90">
                <Camera className="w-4 h-4 text-white" />
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  ref={fileRef}
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>

              {preview && (
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-1 -right-1 w-6 h-6 bg-white border border-slate-200 text-slate-400 hover:text-rose-500 rounded-full shadow-sm flex items-center justify-center transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Update Photo</p>
            {imageError && (
              <p className="text-rose-500 text-[11px] font-bold">{imageError}</p>
            )}
          </div>

          <div className="space-y-4">
            {/* NAME */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  {...register("name", { required: "Required" })}
                  className="w-full pl-10 pr-4 h-11 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
              {errors.name && (
                <p className="text-rose-500 text-[11px] font-bold mt-1 ml-1">{errors.name.message}</p>
              )}
            </div>

            {/* EMAIL (Disabled as per company policy) */}
            <div className="space-y-1 opacity-60">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                <Mail className="w-3 h-3" /> Corporate Email
              </label>
              <input
                {...register("email")}
                disabled
                className="w-full px-4 h-11 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-500 cursor-not-allowed"
              />
            </div>

            {/* PASSWORD */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                <Lock className="w-3 h-3" /> Security
              </label>
              <input
                type="password"
                {...register("password", {
                  minLength: { value: 6, message: "Min 6 characters" }
                })}
                placeholder="Enter new password to change..."
                className="w-full px-4 h-11 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300"
              />
              {errors.password && (
                <p className="text-rose-500 text-[11px] font-bold mt-1 ml-1">{errors.password.message}</p>
              )}
            </div>
          </div>

          {apiError && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs font-bold text-center">
              {apiError}
            </div>
          )}

          {/* ACTIONS */}
          <div className="flex gap-3 pt-6 border-t border-slate-100">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 h-11 border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors"
            >
              Discard
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="flex-1 h-11 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {updateMutation.isPending ? "Syncing..." : "Update Profile"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}