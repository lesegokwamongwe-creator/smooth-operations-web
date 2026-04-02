import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, ArrowRight, Loader2, Search, Clock, CheckCircle, XCircle } from "lucide-react";
import { motion } from "motion/react";

export default function ApplyNow() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [pastApplications, setPastApplications] = useState<any[]>([]);
  const [currentApplication, setCurrentApplication] = useState<any>(null);
  
  // Status Check State
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<{
    status: 'Pending Review' | 'Approved' | 'Declined';
    id: string;
    date: string;
  } | null>(null);

  const handleStatusCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    
    setIsSearching(true);
    setSearchResult(null);
    
    // Simulate API search
    setTimeout(() => {
      setIsSearching(false);
      
      // Mock logic for demonstration
      if (searchQuery.includes("082") || searchQuery.includes("APP-123")) {
        setSearchResult({
          status: 'Approved',
          id: searchQuery.toUpperCase(),
          date: '2024-03-28'
        });
      } else if (searchQuery.includes("083") || searchQuery.includes("APP-456")) {
        setSearchResult({
          status: 'Declined',
          id: searchQuery.toUpperCase(),
          date: '2024-03-25'
        });
      } else {
        setSearchResult({
          status: 'Pending Review',
          id: searchQuery.toUpperCase(),
          date: '2024-04-01'
        });
      }
    }, 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const loanAmount = formData.get("loanAmount");
    
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      const newApp = {
        id: `APP-${Math.floor(100 + Math.random() * 900)}`,
        amount: parseInt(loanAmount as string),
        date: new Date().toISOString().split('T')[0],
        status: "Pending Review"
      };
      setCurrentApplication(newApp);
      setPastApplications(prev => [newApp, ...prev]);
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 2000);
  };

  if (isSuccess) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center py-16 px-4 bg-slate-50">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white max-w-md w-full rounded-3xl p-10 text-center border border-slate-200 shadow-xl mb-12"
        >
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Application Received!</h2>
          <p className="text-slate-600 mb-8">
            Thank you for applying with Smooth Operations. Your application ID is <span className="font-mono font-bold text-slate-900">{currentApplication?.id}</span>. Our team is reviewing your details and will contact you shortly.
          </p>
          <button 
            onClick={() => setIsSuccess(false)}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-xl font-bold transition-colors"
          >
            Apply for Another Loan
          </button>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-2xl w-full"
        >
          <h3 className="text-2xl font-bold text-slate-900 mb-6 text-center">Your Application History</h3>
          <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden">
            {pastApplications.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 text-sm font-semibold text-slate-600">ID</th>
                      <th className="px-6 py-4 text-sm font-semibold text-slate-600">Amount</th>
                      <th className="px-6 py-4 text-sm font-semibold text-slate-600">Date</th>
                      <th className="px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {pastApplications.map((app, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-mono text-sm font-medium text-slate-900">{app.id}</td>
                        <td className="px-6 py-4 text-sm text-slate-700">R {app.amount.toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm text-slate-500">{app.date}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            app.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                            app.status === 'Declined' ? 'bg-red-100 text-red-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {app.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center">
                <p className="text-slate-500">You have no past loan applications.</p>
              </div>
            )}
          </div>
          <div className="mt-8 text-center">
            <Link to="/" className="text-emerald-600 font-semibold hover:text-emerald-700 flex items-center justify-center gap-2">
              Return to Home <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="py-16 md:py-24 bg-slate-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Apply for a Loan</h1>
          <p className="text-lg text-slate-600">
            Complete this secure form to see how much you qualify for. It won't affect your credit score.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="bg-emerald-600 p-6 text-white flex items-center justify-center gap-2">
            <ShieldCheck className="w-5 h-5" />
            <span className="font-medium">256-bit Secure SSL Encryption</span>
          </div>
          
          <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-8">
            
            {/* Personal Details */}
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Personal Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-sm font-medium text-slate-700">First Name</label>
                  <input required name="firstName" type="text" id="firstName" className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" placeholder="e.g. Thabo" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-sm font-medium text-slate-700">Last Name</label>
                  <input required name="lastName" type="text" id="lastName" className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" placeholder="e.g. Mokoena" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="idNumber" className="text-sm font-medium text-slate-700">South African ID Number</label>
                  <input required name="idNumber" type="text" id="idNumber" pattern="\d{13}" maxLength={13} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" placeholder="13 digit ID number" />
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Contact Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="mobile" className="text-sm font-medium text-slate-700">Mobile Number</label>
                  <input required name="mobile" type="tel" id="mobile" className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" placeholder="082 123 4567" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-slate-700">Email Address</label>
                  <input required name="email" type="email" id="email" className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" placeholder="thabo@example.com" />
                </div>
              </div>
            </div>

            {/* Financial Details */}
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Financial Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="netIncome" className="text-sm font-medium text-slate-700">Monthly Net Income (After Tax)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">R</span>
                    <input required name="netIncome" type="number" id="netIncome" min="1000" className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" placeholder="5000" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="loanAmount" className="text-sm font-medium text-slate-700">Desired Loan Amount</label>
                  <select required name="loanAmount" id="loanAmount" className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white">
                    <option value="">Select amount...</option>
                    <option value="1000">R1,000</option>
                    <option value="2000">R2,000</option>
                    <option value="5000">R5,000</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Consent */}
            <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <input required name="consent" type="checkbox" id="consent" className="mt-1 w-5 h-5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500" />
              <label htmlFor="consent" className="text-sm text-slate-600 leading-relaxed">
                I confirm that the information provided is true and correct. I consent to Smooth Operations performing a credit check and verifying my details in accordance with the POPI Act.
              </label>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>Processing <Loader2 className="w-5 h-5 animate-spin" /></>
              ) : (
                <>Get Your Loan Today <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </form>
        </div>

        {/* Check Status Section */}
        <div className="mt-16 pt-16 border-t border-slate-200">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Already Applied?</h2>
            <p className="text-slate-600">Enter your Application ID or Mobile Number to check your status.</p>
          </div>

          <div className="max-w-xl mx-auto">
            <form onSubmit={handleStatusCheck} className="flex gap-2 mb-8">
              <div className="relative flex-grow">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. 082 123 4567 or APP-123"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
              </div>
              <button 
                type="submit"
                disabled={isSearching}
                className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-2xl font-bold transition-all disabled:bg-slate-400 flex items-center gap-2"
              >
                {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : "Check"}
              </button>
            </form>

            {searchResult && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-8 border border-slate-200 shadow-lg"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Application ID</p>
                    <p className="font-mono font-bold text-slate-900">{searchResult.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500 mb-1">Applied On</p>
                    <p className="font-bold text-slate-900">{searchResult.date}</p>
                  </div>
                </div>

                <div className={`flex items-center gap-4 p-6 rounded-2xl ${
                  searchResult.status === 'Approved' ? 'bg-emerald-50 border border-emerald-100' :
                  searchResult.status === 'Declined' ? 'bg-red-50 border border-red-100' :
                  'bg-amber-50 border border-amber-100'
                }`}>
                  <div className={`p-3 rounded-xl ${
                    searchResult.status === 'Approved' ? 'bg-emerald-500' :
                    searchResult.status === 'Declined' ? 'bg-red-500' :
                    'bg-amber-500'
                  }`}>
                    {searchResult.status === 'Approved' ? <CheckCircle className="w-6 h-6 text-white" /> :
                     searchResult.status === 'Declined' ? <XCircle className="w-6 h-6 text-white" /> :
                     <Clock className="w-6 h-6 text-white" />}
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 font-medium mb-0.5">Current Status</p>
                    <p className={`text-xl font-bold ${
                      searchResult.status === 'Approved' ? 'text-emerald-700' :
                      searchResult.status === 'Declined' ? 'text-red-700' :
                      'text-amber-700'
                    }`}>
                      {searchResult.status}
                    </p>
                  </div>
                </div>

                <p className="mt-6 text-sm text-slate-500 text-center italic">
                  {searchResult.status === 'Approved' ? "Congratulations! Your funds will be disbursed shortly." :
                   searchResult.status === 'Declined' ? "We're sorry, but we cannot offer you a loan at this time." :
                   "Our team is currently reviewing your application. Please check back later."}
                </p>
              </motion.div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
