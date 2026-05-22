import { X, Download, ExternalLink, FileWarning } from 'lucide-react';

export default function DocumentPreviewModal({ previewDoc, closePreview }) {
  if (!previewDoc) return null;
  const downloadLink = previewDoc.fileUrl?.replace('/upload/', `/upload/fl_attachment:${previewDoc?.title}/`);

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md transition-all duration-300 animate-in fade-in"
      onClick={closePreview}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* --- Header --- */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white sticky top-0 z-10">
          <div className="flex flex-col">
            <h3 className="text-lg font-bold text-slate-800 leading-tight truncate max-w-50 sm:max-w-md">
              {previewDoc.title}
            </h3>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
              {previewDoc.fileType} Document
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={downloadLink}
              download
              className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
              title="Download"
            >
              <Download className="w-5 h-5" />
            </a>
            <button
              onClick={closePreview}
              className="p-2 animate-spin hover:bg-red-50 hover:text-red-500 rounded-full text-slate-400 transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* --- Content Area --- */}
        <div className="flex-1 overflow-auto bg-slate-50 p-4 sm:p-8 flex items-center justify-center">
          {previewDoc.fileType === "pdf" ? (
            <div className="w-full h-full min-h-[60vh] rounded-lg shadow-inner overflow-hidden border border-slate-200">
              <object
                data={`${previewDoc.fileUrl}#toolbar=0`}
                type="application/pdf"
                className="w-full h-full"
              >
                <div className="flex flex-col items-center justify-center py-20">
                  <FileWarning className="w-12 h-12 text-slate-300 mb-4" />
                  <p className="text-slate-500">PDF preview not supported by your browser.</p>
                  <a href={previewDoc.fileUrl} className="text-indigo-600 underline mt-2">Download to view</a>
                </div>
              </object>
            </div>
          ) : ["jpg", "jpeg", "png", "gif"].includes(previewDoc.fileType.toLowerCase()) ? (
            <div className="relative group">
              <img
                src={previewDoc.fileUrl}
                alt={previewDoc.title}
                className="max-w-full max-h-[70vh] rounded-lg shadow-lg object-contain bg-white"
                draggable="false"
              />  
            </div>
          ) : (
            /* --- Fallback State --- */
            <div className="text-center py-20 px-10 bg-white rounded-3xl border-2 border-dashed border-slate-200 shadow-sm max-w-sm">
              <div className="bg-slate-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ExternalLink className="w-8 h-8 text-slate-400" />
              </div>
              <h4 className="text-slate-800 font-bold mb-2">Preview Unavailable</h4>
              <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                We can't preview <b>.{previewDoc.fileType}</b> files here, but you can download it to your device.
              </p>
              <a
                href={previewDoc.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200"
              >
                <Download className="w-4 h-4" />
                Download File
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}