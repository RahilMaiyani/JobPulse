import { useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import EmptyState from "../components/EmptyState";
import { useMyTickets } from "../hooks/useTickets";
import { Plus, Ticket as TicketIcon, Clock, MessageSquare, ArrowRight } from "lucide-react";
import CreateTicketModal from "../components/CreateTicketModal"; 
import TicketDetailModal from "../components/TicketDetailModal";
import { useTitle } from "../hooks/useTitle";

const EmployeeHelpdesk = () => {
  useTitle("Helpdesk")
  const { data: tickets = [], isLoading } = useMyTickets();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Helper function to color-code statuses
  const getStatusColor = (status) => {
    switch (status) {
      case "Open": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "In-Progress": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Resolved": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "Closed": return "bg-slate-100 text-slate-800 border-slate-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <DashboardLayout>
      <div className="p-10 max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">IT & HR Helpdesk</h1>
            <p className="text-slate-500 mt-1 text-sm font-medium">Need assistance? Raise a ticket and we'll help you out.</p>
          </div>
          
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm shadow-indigo-200"
          >
            <Plus className="w-5 h-5" />
            Raise New Ticket
          </button>
        </div>

        {/* Tickets List */}
        {isLoading ? (
          // BEAUTIFUL SKELETON LOADER
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 animate-pulse flex flex-col sm:flex-row justify-between gap-4">
                <div className="space-y-3 w-full">
                  <div className="flex gap-2">
                    <div className="h-5 w-16 bg-slate-200 rounded-full"></div>
                    <div className="h-5 w-20 bg-slate-200 rounded-full"></div>
                  </div>
                  <div className="h-5 w-3/4 bg-slate-200 rounded"></div>
                  <div className="flex gap-4">
                    <div className="h-4 w-24 bg-slate-100 rounded"></div>
                    <div className="h-4 w-24 bg-slate-100 rounded"></div>
                  </div>
                </div>
                <div className="h-10 w-28 bg-slate-100 rounded-lg shrink-0"></div>
              </div>
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <EmptyState 
            icon="LifeBuoy" 
            title="No active tickets" 
            description="You don't have any open requests. Everything must be running smoothly!" 
          />
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <div 
                key={ticket._id}
                onClick={() => setSelectedTicket(ticket)}
                className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
                  
                  {/* Left Side: Badges & Info */}
                  <div className="flex-1 space-y-2.5">
                    
                    {/* Top Row: Badges */}
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                        ticket.priority === 'Urgent' ? 'bg-rose-50 text-rose-600 border-rose-200' : 
                        ticket.priority === 'High' ? 'bg-orange-50 text-orange-600 border-orange-200' : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}>
                        {ticket.priority} Priority
                      </span>
                    </div>

                    {/* Subject Line */}
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">
                      {ticket.subject}
                    </h3>

                    {/* Bottom Row: Metadata */}
                    <div className="flex items-center gap-5 text-xs text-slate-500 font-medium">
                      <span className="flex items-center gap-1.5"><TicketIcon className="w-3.5 h-3.5" /> {ticket.category}</span>
                      <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {new Date(ticket.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Right Side: Action Button */}
                  <div className="w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t border-slate-100 sm:border-0 mt-2 sm:mt-0">
                    <button className="w-full sm:w-auto flex items-center justify-center gap-2 text-sm font-bold text-indigo-600 bg-indigo-50 group-hover:bg-indigo-100 px-4 py-2.5 rounded-lg transition-colors">
                      {ticket.replies?.length > 0 ? (
                        <>
                          <MessageSquare className="w-4 h-4" />
                          <span>{ticket.replies.length} Replies</span>
                        </>
                      ) : (
                        <>
                          <span>View Ticket</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateTicketModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      /> 

      <TicketDetailModal 
        ticket={tickets.find(t => t._id === selectedTicket?._id) || selectedTicket} 
        onClose={() => setSelectedTicket(null)} 
      />

    </DashboardLayout>
  );
};

export default EmployeeHelpdesk;