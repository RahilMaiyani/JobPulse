import { Eye, Download, Trash2, FileText } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const previewableTypes = ["pdf", "png", "jpg", "jpeg", "gif"];

const DocumentCard = ({ document, onDelete, isDeleting, onPreview }) => {
  const { user } = useAuth();
  const ownerId = document.userId?._id || document.userId;
  const isOwner = !!user && ownerId && ownerId === user._id;
  const canDelete = user?.role === "admin" || isOwner;
  const fileType = document.fileType?.toLowerCase() || "file";
  // console.log(document)
  const downloadUrl = document.fileUrl?.replace('/upload/', `/upload/fl_attachment:${document?.title}/`);

  const formattedDate = document.createdAt
    ? new Date(document.createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Unknown date";

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-slate-500 font-semibold">
              {document.category || "Other"}
            </p>
            <h3 className="mt-2 text-lg font-semibold text-slate-900 line-clamp-2">
              {document.title}
            </h3>
          </div>
          <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="text-sm text-slate-500 space-y-2">
          <p>
            <span className="font-semibold text-slate-700">Type:</span> {fileType}
          </p>
          <p>
            <span className="font-semibold text-slate-700">Uploaded:</span> {formattedDate}
          </p>
          {document.fileSize != null && (
            <p>
              <span className="font-semibold text-slate-700">Size:</span>{" "}
              {(document.fileSize / 1024).toFixed(1)} KB
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1 pt-3 border-t border-slate-100">
          {previewableTypes.includes(fileType) && onPreview ? (
            <button
              type="button"
              onClick={() => onPreview(document)}
              className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 transition"
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
          ) : null}
          
          <a
            href={downloadUrl}
            // target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition"
          >
            <Download className="w-4 h-4" />
            Download
          </a>

          {canDelete && onDelete ? (
            <button
              type="button"
              onClick={() => onDelete(document)}
              disabled={isDeleting}
              className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:border-red-300 hover:bg-red-100 transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default DocumentCard;
