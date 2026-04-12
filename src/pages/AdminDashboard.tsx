import React, { useState, useEffect } from "react";
import { useAuth } from "../lib/AuthContext";
import { db } from "../lib/firebase";
import { collection, query, onSnapshot, doc, updateDoc, orderBy, deleteField, limit } from "firebase/firestore";
import { handleFirestoreError, OperationType } from "../lib/firestoreUtils";
import { ShieldCheck, Loader2, Search, CheckCircle, XCircle, Clock, FileText, Calendar, Mail, MessageSquare, Send, Eye, Download, MessageCircle, Landmark, CreditCard, Users } from "lucide-react";
import { motion } from "motion/react";

export default function AdminDashboard() {
  const { user, role, loading } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [repaymentDate, setRepaymentDate] = useState("");
  const [repaymentAmount, setRepaymentAmount] = useState("");
  const [activeTab, setActiveTab] = useState<'applications' | 'reminders' | 'payouts' | 'clients'>('applications');
  const [loadLimit, setLoadLimit] = useState(50);
  const [hasMore, setHasMore] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText: string;
    confirmColor: string;
  } | null>(null);

  const isAdmin = role === 'admin';

  const clients = React.useMemo(() => {
    const clientMap = new Map<string, any>();
    
    applications.forEach(app => {
      const key = app.idNumber || app.email || app.mobile;
      if (!key) return;
      
      if (!clientMap.has(key)) {
        clientMap.set(key, {
          id: key,
          name: app.name || `${app.firstName || ''} ${app.lastName || ''}`.trim() || 'Unknown',
          idNumber: app.idNumber,
          mobile: app.mobile,
          email: app.email,
          totalApplications: 0,
          totalApprovedAmount: 0,
          totalRepaidAmount: 0,
          latestApplicationDate: app.date || new Date().toISOString(),
          applications: []
        });
      }
      
      const client = clientMap.get(key);
      client.totalApplications += 1;
      client.applications.push(app);

      if (app.status === 'Approved' || app.status === 'Paid') {
        client.totalApprovedAmount += (app.loanAmount || app.amount || 0);
      }
      if (app.status === 'Paid') {
        client.totalRepaidAmount += (app.repaymentAmount || app.loanAmount || app.amount || 0);
      }
      if (new Date(app.date || 0) > new Date(client.latestApplicationDate)) {
        client.latestApplicationDate = app.date;
      }
    });

    clientMap.forEach(client => {
      client.applications.sort((a: any, b: any) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : new Date(a.date || 0).getTime();
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : new Date(b.date || 0).getTime();
        return timeB - timeA;
      });
    });
    
    return Array.from(clientMap.values()).sort((a, b) => 
      new Date(b.latestApplicationDate).getTime() - new Date(a.latestApplicationDate).getTime()
    );
  }, [applications]);

  useEffect(() => {
    if (!isAdmin || !user) {
      if (!loading && !role) setIsLoading(false);
      return;
    }

    const q = query(collection(db, "applications"), orderBy("createdAt", "desc"), limit(loadLimit));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const apps = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setApplications(apps);
      setHasMore(snapshot.docs.length === loadLimit);
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "applications");
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [isAdmin, loadLimit]);

  const handleUpdateStatus = async (appId: string, newStatus: string) => {
    if (newStatus === 'Declined' && !declineReason.trim()) {
      alert("Please provide a decline reason.");
      return;
    }
    if (newStatus === 'Approved' && (!repaymentDate || !repaymentAmount)) {
      alert("Please provide a repayment date and amount for approved loans.");
      return;
    }

    setIsUpdating(true);
    try {
      const updateData: any = { status: newStatus };
      if (newStatus === 'Declined') {
        updateData.declineReason = declineReason;
        updateData.repaymentDate = deleteField();
        updateData.repaymentAmount = deleteField();
      } else if (newStatus === 'Approved') {
        updateData.declineReason = deleteField();
        updateData.repaymentDate = repaymentDate;
        updateData.repaymentAmount = parseFloat(repaymentAmount);
      } else {
        updateData.declineReason = deleteField();
        updateData.repaymentDate = deleteField();
        updateData.repaymentAmount = deleteField();
      }

      await updateDoc(doc(db, "applications", appId), updateData);
      
      setSelectedApp(null);
      setDeclineReason("");
      setRepaymentDate("");
      setRepaymentAmount("");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `applications/${appId}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSendReminder = async (appId: string, type: 'email' | 'sms' | 'whatsapp') => {
    try {
      await updateDoc(doc(db, "applications", appId), {
        lastReminderSent: new Date().toISOString()
      });
      // The actual sending is handled by the mailto:/sms:/wa.me links in the UI.
      // This just logs that the admin clicked it.
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `applications/${appId}`);
    }
  };

  const handleProcessDebitOrder = (appId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Process Debit Order",
      message: "Are you sure you want to process this debit order? This action will mark the loan as 'Paid'.",
      confirmText: "Process Debit",
      confirmColor: "bg-slate-900 hover:bg-slate-800",
      onConfirm: async () => {
        setConfirmDialog(null);
        setIsUpdating(true);
        try {
          await updateDoc(doc(db, "applications", appId), {
            status: 'Paid'
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.UPDATE, `applications/${appId}`);
        } finally {
          setIsUpdating(false);
        }
      }
    });
  };

  const confirmApproveApplication = () => {
    if (!repaymentDate || !repaymentAmount) {
      alert("Please provide a repayment date and amount for approved loans.");
      return;
    }
    setConfirmDialog({
      isOpen: true,
      title: "Approve Application",
      message: `Are you sure you want to approve this application? The repayment date will be set to ${repaymentDate} for an amount of R ${repaymentAmount}.`,
      confirmText: "Approve Application",
      confirmColor: "bg-emerald-600 hover:bg-emerald-700",
      onConfirm: () => {
        setConfirmDialog(null);
        handleUpdateStatus(selectedApp.id, 'Approved');
      }
    });
  };

  const formatWhatsAppNumber = (mobile: string) => {
    if (!mobile) return '';
    let cleaned = mobile.replace(/\D/g, '');
    // Assuming South African numbers (starting with 0)
    if (cleaned.startsWith('0')) {
      cleaned = '27' + cleaned.substring(1);
    }
    return cleaned;
  };

  const handleViewPayslip = (base64Data: string) => {
    try {
      const arr = base64Data.split(',');
      const mime = arr[0].match(/:(.*?);/)?.[1] || 'application/pdf';
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while(n--){
          u8arr[n] = bstr.charCodeAt(n);
      }
      const blob = new Blob([u8arr], {type: mime});
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (error) {
      console.error("Error opening payslip:", error);
      alert("Could not open payslip. Try downloading it instead.");
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center py-16 px-4 bg-slate-50">
        <div className="bg-white max-w-md w-full rounded-3xl p-10 text-center border border-slate-200 shadow-xl">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Access Denied</h2>
          <p className="text-slate-600">
            You do not have permission to view this page. This area is restricted to administrators.
          </p>
        </div>
      </div>
    );
  }

  const filteredApps = applications.filter(app => {
    const matchesSearch = app.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.firstName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.lastName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.idNumber || '').includes(searchQuery) ||
      (app.mobile || '').includes(searchQuery);
      
    if (activeTab === 'reminders') {
      return matchesSearch && app.status === 'Approved' && app.repaymentDate;
    }
    if (activeTab === 'payouts') {
      return matchesSearch && app.status === 'Approved';
    }
    return matchesSearch;
  }).sort((a, b) => {
    const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : new Date(a.date || 0).getTime();
    const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : new Date(b.date || 0).getTime();
    return timeB - timeA;
  });

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (client.idNumber || '').includes(searchQuery) ||
    (client.mobile || '').includes(searchQuery) ||
    (client.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-emerald-600" />
              Admin Dashboard
            </h1>
            <p className="text-slate-600 mt-2">Manage applications and send repayment reminders.</p>
          </div>
          
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, Name, or Mobile..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6 bg-white p-1.5 rounded-xl border border-slate-200 inline-flex overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'applications' 
                ? 'bg-slate-900 text-white shadow-sm' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            All Applications
          </button>
          <button
            onClick={() => setActiveTab('payouts')}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'payouts' 
                ? 'bg-emerald-600 text-white shadow-sm' 
                : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            <Landmark className="w-4 h-4" />
            Payouts (Bank Details)
          </button>
          <button
            onClick={() => setActiveTab('reminders')}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'reminders' 
                ? 'bg-emerald-600 text-white shadow-sm' 
                : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Active Loans & Reminders
          </button>
          <button
            onClick={() => setActiveTab('clients')}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'clients' 
                ? 'bg-emerald-600 text-white shadow-sm' 
                : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            <Users className="w-4 h-4" />
            Client Records
          </button>
        </div>

        {activeTab === 'clients' && (
          <div className="mb-6 bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
            <div className="mt-0.5 text-blue-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-blue-900">Client Records are generated from loaded applications</h4>
              <p className="text-sm text-blue-700 mt-1">
                To improve dashboard performance, only the most recent {loadLimit} applications are loaded by default. 
                Client totals shown here only reflect the currently loaded applications. Click "Load More" at the bottom to see older records.
              </p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">App ID</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">Applicant</th>
                  {activeTab === 'applications' ? (
                    <>
                      <th className="px-6 py-4 text-sm font-semibold text-slate-600">Amount</th>
                      <th className="px-6 py-4 text-sm font-semibold text-slate-600">Date</th>
                      <th className="px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
                      <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Action</th>
                    </>
                  ) : activeTab === 'payouts' ? (
                    <>
                      <th className="px-6 py-4 text-sm font-semibold text-slate-600">Bank Details</th>
                      <th className="px-6 py-4 text-sm font-semibold text-slate-600">Payout Amount</th>
                      <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Action</th>
                    </>
                  ) : activeTab === 'clients' ? (
                    <>
                      <th className="px-6 py-4 text-sm font-semibold text-slate-600">Client Details</th>
                      <th className="px-6 py-4 text-sm font-semibold text-slate-600">Contact Info</th>
                      <th className="px-6 py-4 text-sm font-semibold text-slate-600">Total Apps</th>
                      <th className="px-6 py-4 text-sm font-semibold text-slate-600">Total Approved</th>
                      <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Action</th>
                    </>
                  ) : (
                    <>
                      <th className="px-6 py-4 text-sm font-semibold text-slate-600">Repayment Due</th>
                      <th className="px-6 py-4 text-sm font-semibold text-slate-600">Amount Due</th>
                      <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Actions</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {activeTab === 'clients' ? (
                  filteredClients.map(client => (
                    <tr key={client.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 cursor-pointer" onClick={() => setSelectedClient(client)}>
                        <p className="font-medium text-slate-900 hover:text-emerald-600 transition-colors">{client.name}</p>
                        <p className="text-xs text-slate-500 font-mono">{client.idNumber || 'No ID'}</p>
                      </td>
                      <td className="px-6 py-4 cursor-pointer" onClick={() => setSelectedClient(client)}>
                        <p className="text-sm text-slate-900 hover:text-emerald-600 transition-colors">{client.mobile}</p>
                        <p className="text-xs text-slate-500">{client.email}</p>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{client.totalApplications}</td>
                      <td className="px-6 py-4 text-sm font-bold text-emerald-600">R {client.totalApprovedAmount.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => {
                            setSearchQuery(client.idNumber || client.mobile || client.email);
                            setActiveTab('applications');
                          }}
                          className="text-sm font-medium text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-lg transition-colors"
                        >
                          View History
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  filteredApps.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs font-medium text-slate-500">
                      {app.applicationNumber ? `#${app.applicationNumber}` : app.id}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">{app.name || `${app.firstName} ${app.lastName}`}</p>
                      <p className="text-xs text-slate-500">{app.mobile}</p>
                    </td>
                    
                    {activeTab === 'applications' ? (
                      <>
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">R {(app.loanAmount || app.amount)?.toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm text-slate-500">{app.date}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                            app.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            app.status === 'Declined' ? 'bg-red-50 text-red-700 border-red-200' :
                            'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {app.status === 'Approved' && <CheckCircle className="w-3.5 h-3.5" />}
                            {app.status === 'Declined' && <XCircle className="w-3.5 h-3.5" />}
                            {app.status === 'Pending Review' && <Clock className="w-3.5 h-3.5" />}
                            {app.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => {
                              setSelectedApp(app);
                              setRepaymentAmount((app.loanAmount || app.amount)?.toString() || "");
                            }}
                            className="text-sm font-medium text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-lg transition-colors"
                          >
                            Review
                          </button>
                        </td>
                      </>
                    ) : activeTab === 'payouts' ? (
                      <>
                        <td className="px-6 py-4">
                          <p className="font-medium text-slate-900">{app.bankName || 'N/A'}</p>
                          <p className="text-xs text-slate-500">{app.accountNumber ? `${app.accountNumber} (${app.accountType})` : 'No account provided'}</p>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-emerald-600">R {(app.loanAmount || app.amount)?.toLocaleString()}</td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => {
                              setSelectedApp(app);
                            }}
                            className="text-sm font-medium text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-lg transition-colors"
                          >
                            View Full App
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            {app.repaymentDate}
                          </div>
                          {app.lastReminderSent && (
                            <p className="text-xs text-slate-400 mt-1">
                              Last sent: {new Date(app.lastReminderSent).toLocaleDateString()}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-emerald-600">R {app.repaymentAmount?.toLocaleString()}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleProcessDebitOrder(app.id)}
                              disabled={isUpdating}
                              className="inline-flex items-center justify-center px-4 h-10 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors text-sm font-medium gap-2 mr-2 disabled:bg-slate-400"
                              title="Process Debit Order & Mark Paid"
                            >
                              <CreditCard className="w-4 h-4" />
                              <span className="hidden md:inline">Process Debit</span>
                            </button>
                            <a 
                              href={`mailto:${app.email}?subject=Loan Repayment Reminder&body=Dear ${app.name || app.firstName},%0D%0A%0D%0AThis is a friendly reminder from Smooth Operations that your loan repayment of R${app.repaymentAmount} is due on ${app.repaymentDate}.%0D%0A%0D%0AThank you!`}
                              onClick={() => handleSendReminder(app.id, 'email')}
                              className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                              title="Send Email Reminder"
                            >
                              <Mail className="w-5 h-5" />
                            </a>
                            <a 
                              href={`sms:${app.mobile}?body=Smooth Operations: Dear ${app.name || app.firstName}, your loan repayment of R${app.repaymentAmount} is due on ${app.repaymentDate}.`}
                              onClick={() => handleSendReminder(app.id, 'sms')}
                              className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                              title="Send SMS Reminder"
                            >
                              <MessageSquare className="w-5 h-5" />
                            </a>
                            <a 
                              href={`https://wa.me/${formatWhatsAppNumber(app.mobile)}?text=${encodeURIComponent(`Smooth Operations: Dear ${app.name || app.firstName}, your loan repayment of R${app.repaymentAmount} is due on ${app.repaymentDate}.`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => handleSendReminder(app.id, 'whatsapp')}
                              className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                              title="Send WhatsApp Reminder"
                            >
                              <MessageCircle className="w-5 h-5" />
                            </a>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                )))}
                {activeTab === 'clients' && filteredClients.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      No clients found matching your search.
                    </td>
                  </tr>
                )}
                {activeTab !== 'clients' && filteredApps.length === 0 && (
                  <tr>
                    <td colSpan={activeTab === 'applications' ? 6 : activeTab === 'payouts' ? 5 : 5} className="px-6 py-12 text-center text-slate-500">
                      No applications found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {hasMore && !searchQuery && (
            <div className="p-4 border-t border-slate-100 flex justify-center bg-slate-50">
              <button
                onClick={() => setLoadLimit(prev => prev + 50)}
                className="px-6 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors shadow-sm text-sm"
              >
                Load More
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Review Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b border-slate-100 p-6 flex items-center justify-between z-10">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Review Application</h2>
                <p className="text-sm font-mono text-slate-500 mt-1">ID: {selectedApp.applicationNumber ? `#${selectedApp.applicationNumber}` : selectedApp.id}</p>
              </div>
              <button 
                onClick={() => { setSelectedApp(null); setDeclineReason(""); setRepaymentDate(""); setRepaymentAmount(""); }}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-8">
              {/* Identity Verification */}
              {selectedApp.idNumber && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <ShieldCheck className="w-5 h-5 text-blue-600" />
                    <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider">Identity Verification</h3>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-blue-600/80 mb-1">South African ID Number</p>
                      <p className="text-lg font-mono font-bold text-blue-900 tracking-widest">{selectedApp.idNumber}</p>
                    </div>
                    <div className="bg-white px-3 py-1 rounded-lg border border-blue-200">
                      <span className="text-xs font-bold text-blue-600">
                        {selectedApp.idNumber?.length === 13 ? '13 Digits Valid' : 'Invalid Length'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Applicant Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Personal Details</h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm text-slate-500">Full Name</dt>
                      <dd className="font-medium text-slate-900">{selectedApp.name || `${selectedApp.firstName} ${selectedApp.lastName}`}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-slate-500">Email</dt>
                      <dd className="font-medium text-slate-900">{selectedApp.email}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-slate-500">Mobile</dt>
                      <dd className="font-medium text-slate-900">{selectedApp.mobile}</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Financial & Banking</h3>
                  <dl className="space-y-3">
                    {selectedApp.netIncome && (
                      <div>
                        <dt className="text-sm text-slate-500">Net Income</dt>
                        <dd className="font-medium text-slate-900">R {selectedApp.netIncome?.toLocaleString()}</dd>
                      </div>
                    )}
                    <div>
                      <dt className="text-sm text-slate-500">Requested Loan</dt>
                      <dd className="font-medium text-emerald-600 text-lg">R {(selectedApp.loanAmount || selectedApp.amount)?.toLocaleString()}</dd>
                    </div>
                    {selectedApp.bankName && (
                      <div>
                        <dt className="text-sm text-slate-500">Bank Name</dt>
                        <dd className="font-medium text-slate-900">{selectedApp.bankName}</dd>
                      </div>
                    )}
                    {selectedApp.accountNumber && (
                      <div>
                        <dt className="text-sm text-slate-500">Account</dt>
                        <dd className="font-medium text-slate-900">{selectedApp.accountNumber} ({selectedApp.accountType})</dd>
                      </div>
                    )}
                    {(selectedApp.status === 'Approved' || selectedApp.status === 'Paid') && selectedApp.repaymentDate && (
                      <div className="pt-3 border-t border-slate-200 mt-3">
                        <dt className="text-sm text-slate-500">Repayment Due Date</dt>
                        <dd className="font-medium text-slate-900">{selectedApp.repaymentDate}</dd>
                      </div>
                    )}
                    {(selectedApp.status === 'Approved' || selectedApp.status === 'Paid') && selectedApp.repaymentAmount && (
                      <div>
                        <dt className="text-sm text-slate-500">Repayment Amount</dt>
                        <dd className="font-medium text-emerald-600 text-lg">R {selectedApp.repaymentAmount?.toLocaleString()}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>

              {/* Payslip Document */}
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Documents</h3>
                {selectedApp.payslipData ? (
                  <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-8 h-8 text-emerald-600" />
                      <div>
                        <p className="font-medium text-slate-900">Payslip Document</p>
                        <p className="text-xs text-slate-500">Uploaded with application</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewPayslip(selectedApp.payslipData)}
                        className="text-sm font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      <a 
                        href={selectedApp.payslipData} 
                        download={`Payslip_${selectedApp.firstName}_${selectedApp.lastName}`}
                        className="text-sm font-medium text-emerald-600 hover:text-emerald-700 bg-white border border-emerald-200 hover:bg-emerald-50 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </a>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic">No payslip uploaded.</p>
                )}
              </div>

              {/* Action Area */}
              <div className="border-t border-slate-100 pt-6">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Update Status</h3>
                
                <div className="space-y-6">
                  {/* Approval Section */}
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-emerald-900 mb-1">Repayment Date</label>
                        <input 
                          type="date"
                          value={repaymentDate}
                          onChange={(e) => setRepaymentDate(e.target.value)}
                          className="w-full px-4 py-2 rounded-lg border border-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-emerald-900 mb-1">Repayment Amount (R)</label>
                        <input 
                          type="number"
                          value={repaymentAmount}
                          onChange={(e) => setRepaymentAmount(e.target.value)}
                          placeholder="e.g. 5500"
                          className="w-full px-4 py-2 rounded-lg border border-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                        />
                      </div>
                    </div>
                    <button
                      onClick={confirmApproveApplication}
                      disabled={isUpdating || selectedApp.status === 'Approved' || !repaymentDate || !repaymentAmount}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                    >
                      {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                      Approve Application
                    </button>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleUpdateStatus(selectedApp.id, 'Pending Review')}
                      disabled={isUpdating || selectedApp.status === 'Pending Review'}
                      className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 text-white py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                    >
                      <Clock className="w-5 h-5" />
                      Mark as Pending
                    </button>
                  </div>

                  {/* Decline Section */}
                  <div className="bg-red-50 border border-red-100 rounded-xl p-4 space-y-3">
                    <label className="block text-sm font-medium text-red-800">Decline Application</label>
                    <input 
                      type="text"
                      value={declineReason}
                      onChange={(e) => setDeclineReason(e.target.value)}
                      placeholder="Reason for declining (e.g., Insufficient income, Credit score below threshold)"
                      className="w-full px-4 py-2 rounded-lg border border-red-200 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                    />
                    <button
                      onClick={() => handleUpdateStatus(selectedApp.id, 'Declined')}
                      disabled={isUpdating || !declineReason.trim()}
                      className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                    >
                      {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />}
                      Decline Application
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmDialog && confirmDialog.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
          >
            <h3 className="text-xl font-bold text-slate-900 mb-2">{confirmDialog.title}</h3>
            <p className="text-slate-600 mb-6">{confirmDialog.message}</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 rounded-lg font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                className={`px-4 py-2 rounded-lg font-medium text-white transition-colors ${confirmDialog.confirmColor}`}
              >
                {confirmDialog.confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Client Details Modal */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b border-slate-100 p-6 flex items-center justify-between z-10">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Client Profile</h2>
                <p className="text-sm font-medium text-slate-500 mt-1">{selectedClient.name}</p>
              </div>
              <button 
                onClick={() => setSelectedClient(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-8">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Total Applications</p>
                  <p className="text-3xl font-extrabold text-slate-900">{selectedClient.totalApplications}</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5">
                  <p className="text-sm font-bold text-emerald-600/80 uppercase tracking-wider mb-1">Total Approved</p>
                  <p className="text-3xl font-extrabold text-emerald-600">R {selectedClient.totalApprovedAmount.toLocaleString()}</p>
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
                  <p className="text-sm font-bold text-blue-600/80 uppercase tracking-wider mb-1">Total Repaid</p>
                  <p className="text-3xl font-extrabold text-blue-600">R {selectedClient.totalRepaidAmount.toLocaleString()}</p>
                </div>
              </div>

              {/* Client Info */}
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Contact & Identity</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white border border-slate-200 rounded-2xl p-5">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">ID Number</p>
                    <p className="font-mono font-medium text-slate-900">{selectedClient.idNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Mobile</p>
                    <p className="font-medium text-slate-900">{selectedClient.mobile || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Email</p>
                    <p className="font-medium text-slate-900 truncate" title={selectedClient.email}>{selectedClient.email || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Applications History */}
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Application History</h3>
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                          <th className="px-4 py-3 text-xs font-semibold text-slate-600">ID</th>
                          <th className="px-4 py-3 text-xs font-semibold text-slate-600">Date</th>
                          <th className="px-4 py-3 text-xs font-semibold text-slate-600">Amount</th>
                          <th className="px-4 py-3 text-xs font-semibold text-slate-600">Status</th>
                          <th className="px-4 py-3 text-xs font-semibold text-slate-600">Repayment</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedClient.applications.map((app: any) => (
                          <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-3 font-mono text-xs font-medium text-slate-500">
                              {app.applicationNumber ? `#${app.applicationNumber}` : app.id}
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-600">{app.date}</td>
                            <td className="px-4 py-3 text-sm font-medium text-slate-900">R {(app.loanAmount || app.amount)?.toLocaleString()}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                app.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                app.status === 'Paid' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                app.status === 'Declined' ? 'bg-red-50 text-red-700 border-red-200' :
                                'bg-amber-50 text-amber-700 border-amber-200'
                              }`}>
                                {app.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-600">
                              {app.repaymentAmount ? `R ${app.repaymentAmount.toLocaleString()}` : '-'}
                              {app.repaymentDate && <span className="text-xs text-slate-400 block">{app.repaymentDate}</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
