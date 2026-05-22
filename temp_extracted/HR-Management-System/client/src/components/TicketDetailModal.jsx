import { useState, useEffect, useRef } from "react";
import { 
  X, Send, CheckCircle, Loader2, Clock, Circle, 
  Check, ChevronDown, AlertCircle, CheckCircle2 
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useAddReply, useUpdateTicketStatus } from "../hooks/useTickets";
import CloseTicketModal from "./CloseTicketModal";

const TicketDetailModal = ({ ticket, onClose }) => {
  const { user } = useAuth();
  const [replyText, setReplyText] = useState("");
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false); // NEW STATE
  const messagesEndRef = useRef(null);
  const menuRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => { scrollToBottom(); }, [ticket?.replies]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsStatusMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { mutate: sendReply, isPending: isSending } = useAddReply(() => {
    setReplyText("");
  });

  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateTicketStatus();

  if (!ticket) return null;

  const handleStatusUpdate = (newStatus) => {
    updateStatus({ id: ticket._id, status: newStatus });
    setIsStatusMenuOpen(false);
  };

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    sendReply({ id: ticket._id, message: replyText, userName: user.name });
  };

  // Opens the custom modal instead of window.confirm
  const handleOpenCloseModal = () => {
    setIsCloseModalOpen(true);
  };

  // The actual confirmation logic
  const handleConfirmClose = () => {
    updateStatus(
      { id: ticket._id, status: "Closed" },
      {
        onSuccess: () => {
          setIsCloseModalOpen(false);
          onClose(); // Closes the main TicketDetailModal as well
        }
      }
    );
  };

  // Status Styling Config
  const statusStyles = {
    "Open": { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: <Circle className="w-3 h-3 fill-current" /> },
    "In-Progress": { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", icon: <Clock className="w-3 h-3" /> },
    "Resolved": { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: <CheckCircle2 className="w-3 h-3" /> },
    "Closed": { bg: "bg-slate-100", text: "text-slate-500", border: "border-slate-200", icon: <Check className="w-3 h-3" /> }
  };

  const currentStyle = statusStyles[ticket.status] || statusStyles["Open"];

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in duration-300">
        <div className="bg-white rounded-4xl shadow-2xl w-full max-w-2xl h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-200">
          
          {/* HEADER SECTION */}
          <div className="bg-white p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] px-2 py-1 bg-slate-100 text-slate-500 rounded-md">
                  {ticket.category}
                </span>
                
                {/* PRO ADMIN STATUS PICKER */}
                {user.role === "admin" && ticket.status !== "Closed" ? (
                  <div className="relative" ref={menuRef}>
                    <button 
                      onClick={() => setIsStatusMenuOpen(!isStatusMenuOpen)}
                      disabled={isUpdatingStatus}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[11px] font-black uppercase tracking-wider transition-all hover:shadow-md active:scale-95 ${currentStyle.bg} ${currentStyle.text} ${currentStyle.border}`}
                    >
                      {isUpdatingStatus ? <Loader2 className="w-3 h-3 animate-spin" /> : currentStyle.icon}
                      {ticket.status}
                      <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isStatusMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Floating Menu */}
                    {isStatusMenuOpen && (
                      <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl z-10 py-2 animate-in slide-in-from-top-2 duration-200">
                        {["Open", "In-Progress", "Resolved"].map((s) => (
                          <button
                            key={s}
                            onClick={() => handleStatusUpdate(s)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <span className={statusStyles[s].text}>{statusStyles[s].icon}</span>
                            Set as {s}
                            {ticket.status === s && <Check className="w-3 h-3 ml-auto text-indigo-600" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <span className={`flex items-center gap-1.5 text-[10px] font-black px-3 py-1 rounded-full border uppercase tracking-wider ${currentStyle.bg} ${currentStyle.text} ${currentStyle.border}`}>
                    {currentStyle.icon}
                    {ticket.status}
                  </span>
                )}
              </div>
              <div className="text-2xl font-bold text-slate-900 leading-tight">{ticket.subject}</div>
            </div>
            
            <button onClick={onClose} className="ml-4 text-slate-400 hover:text-slate-900 p-2.5 bg-slate-50 rounded-full transition-all shrink-0">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* CHAT BODY */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-10 bg-slate-50/20">
            
            {/* Employee's Original Post */}
            <div className="relative pl-8">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-full"></div>
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4 text-indigo-500" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Initial Issue Report</span>
              </div>
              <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm text-[14px] text-slate-700 whitespace-pre-wrap leading-relaxed font-medium">
                {ticket.description}
              </div>
            </div>

            {/* Conversation History */}
            {ticket.replies?.map((reply, index) => {
              const isMe = reply.senderId === user._id;
              const isAdmin = reply.role === 'admin';
              return (
                <div key={index} className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[90%] ${isMe ? "ml-auto" : "mr-auto"}`}>
                  <span className={`text-[10px] font-bold mb-2 mx-2 uppercase tracking-widest ${isAdmin && !isMe ? "text-indigo-600" : "text-slate-400"}`}>
                    {isMe ? "You" : reply.senderName} {isAdmin && !isMe && "• ADMIN"}
                  </span>
                  
                  <div className={`px-5 py-3.5 rounded-3xl text-[14px] whitespace-pre-wrap leading-relaxed shadow-sm font-medium ${
                    isMe 
                      ? "bg-indigo-600 text-white rounded-tr-none shadow-indigo-200" 
                      : "bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-slate-100"
                  }`}>
                    {reply.message}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* FOOTER ACTIONS */}
          <div className="p-6 bg-white border-t border-slate-100 shrink-0">
            {ticket.status !== "Closed" ? (
              <div className="space-y-5">
                <form onSubmit={handleSendReply} className="flex gap-4">
                  <input
                    type="text"
                    placeholder="Type your response..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="flex-1 bg-slate-100 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-400"
                    disabled={isSending || isUpdatingStatus}
                  />
                  <button
                    type="submit"
                    disabled={!replyText.trim() || isSending || isUpdatingStatus}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 rounded-2xl font-bold transition-all disabled:opacity-50 shadow-xl shadow-indigo-100 flex items-center justify-center shrink-0"
                  >
                    {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  </button>
                </form>

                {user.role === "employee" && (
                  <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border transition-all ${
                    ticket.status === "Resolved" 
                      ? "bg-emerald-50 border-emerald-100" 
                      : "bg-slate-50 border-slate-200"
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${ticket.status === "Resolved" ? "bg-emerald-100" : "bg-slate-200"}`}>
                        <CheckCircle className={`w-4 h-4 ${ticket.status === "Resolved" ? "text-emerald-600" : "text-slate-500"}`} />
                      </div>
                      <p className={`text-xs font-bold ${ticket.status === "Resolved" ? "text-emerald-800" : "text-slate-500"}`}>
                        {ticket.status === "Resolved" 
                          ? "Has your issue been fixed? Close the ticket." 
                          : "Fixed it yourself? You can close this anytime."}
                      </p>
                    </div>
                    <button 
                      type="button"
                      onClick={handleOpenCloseModal}
                      disabled={isUpdatingStatus}
                      className={`flex items-center gap-2 text-xs font-black px-6 py-3 rounded-xl transition-all shadow-sm w-full sm:w-auto justify-center ${
                        ticket.status === "Resolved"
                          ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200"
                          : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      Close Ticket
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-4 text-slate-400">
                 <span className="text-[10px] font-black uppercase tracking-[0.3em]">This ticket is permanently closed</span>
                 <div className="mt-2 h-1 w-12 bg-slate-100 rounded-full"></div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* NEW CLOSE CONFIRMATION MODAL */}
      <CloseTicketModal 
        isOpen={isCloseModalOpen}
        onClose={() => setIsCloseModalOpen(false)}
        onConfirm={handleConfirmClose}
        isClosing={isUpdatingStatus}
      />
    </>
  );
};

export default TicketDetailModal;