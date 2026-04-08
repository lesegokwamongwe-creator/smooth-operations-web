import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, ArrowRight, Loader2, Search, Clock, CheckCircle, XCircle, LogIn, Copy, Check } from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "../lib/AuthContext";
import { signInWithGoogle, db } from "../lib/firebase";
import { collection, addDoc, query, where, onSnapshot, serverTimestamp } from "firebase/firestore";
import { handleFirestoreError, OperationType } from "../lib/firestoreUtils";

export default function ApplyNow() {
  const { user, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [formError, setFormError] = useState("");
  const [searchError, setSearchError] = useState("");
  const [pastApplications, setPastApplications] = useState<any[]>([]);
  const [currentApplication, setCurrentApplication] = useState<any>(null);
  
  // Status Check State
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<{
    status: 'Pending Review' | 'Approved' | 'Declined' | 'Paid';
    id: string;
    date: string;
    declineReason?: string;
    repaymentDate?: string;
    repaymentAmount?: number;
    loanAmount?: number;
  } | null>(null);

  useEffect(() => {
    if (!user) {
      setPastApplications([]);
      return;
    }

    const q = query(collection(db, "applications"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const apps = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Sort by date descending
      apps.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setPastApplications(apps);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "applications");
    });

    return () => unsubscribe();
  }, [user]);

  const handleStatusCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    
    setIsSearching(true);
    setSearchResult(null);
    setSearchError("");
    
    setTimeout(() => {
      setIsSearching(false);
      
      const foundApp = pastApplications.find(app => 
        app.id === searchQuery || app.mobile === searchQuery
      );

      if (foundApp) {
        setSearchResult({
          status: foundApp.status,
          id: foundApp.id,
          date: foundApp.date,
          declineReason: foundApp.declineReason,
          repaymentDate: foundApp.repaymentDate,
          repaymentAmount: foundApp.repaymentAmount,
          loanAmount: foundApp.loanAmount || foundApp.amount
        });
      } else {
        setSearchError("No application found with that ID or Mobile Number.");
      }
    }, 800); // Small delay for UX
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setFormError("");
    const formData = new FormData(e.target as HTMLFormElement);
    const loanAmount = parseInt(formData.get("loanAmount") as string);
    const netIncome = parseInt(formData.get("netIncome") as string);
    const email = formData.get("email") as string;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormError("Please enter a valid email address.");
      return;
    }
    
    const file = formData.get("payslip") as File;
    
    // Check file type and size
    const isImage = file && file.type.startsWith('image/');
    const isPDF = file && file.type === 'application/pdf';
    
    if (file) {
      if (isPDF && file.size > 700 * 1024) {
        setFormError("PDF payslip is too large. Please upload a PDF smaller than 700KB, or upload an image instead.");
        return;
      } else if (isImage && file.size > 10 * 1024 * 1024) {
        setFormError("Image is too large. Please upload an image smaller than 10MB.");
        return;
      } else if (!isImage && !isPDF) {
        setFormError("Invalid file format. Please upload a PDF or an Image (JPG/PNG).");
        return;
      }
    }
    
    setIsSubmitting(true);
    
    try {
      let payslipData = "";
      if (file && file.size > 0) {
        if (isImage) {
          // Compress image
          payslipData = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              const img = new Image();
              img.onload = () => {
                const canvas = document.createElement('canvas');
                let { width, height } = img;
                const MAX_DIMENSION = 1200;
                
                if (width > height && width > MAX_DIMENSION) {
                  height *= MAX_DIMENSION / width;
                  width = MAX_DIMENSION;
                } else if (height > MAX_DIMENSION) {
                  width *= MAX_DIMENSION / height;
                  height = MAX_DIMENSION;
                }
                
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);
                
                let quality = 0.8;
                let dataUrl = canvas.toDataURL('image/jpeg', quality);
                
                // Keep compressing if it's still larger than ~500KB (approx 666KB base64)
                while (dataUrl.length > 500 * 1024 * 1.33 && quality > 0.1) {
                  quality -= 0.1;
                  dataUrl = canvas.toDataURL('image/jpeg', quality);
                }
                resolve(dataUrl);
              };
              img.onerror = reject;
              img.src = e.target?.result as string;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        } else {
          // It's a PDF, just convert to base64
          payslipData = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        }
      }

      const newApp = {
        userId: user.uid,
        firstName: formData.get("firstName") as string,
        lastName: formData.get("lastName") as string,
        idNumber: formData.get("idNumber") as string,
        mobile: formData.get("mobile") as string,
        email: formData.get("email") as string,
        netIncome: netIncome,
        loanAmount: loanAmount,
        bankName: formData.get("bankName") as string,
        accountNumber: formData.get("accountNumber") as string,
        accountType: formData.get("accountType") as string,
        payslipData: payslipData,
        status: "Pending Review",
        date: new Date().toISOString().split('T')[0],
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, "applications"), newApp);
      
      setCurrentApplication({ ...newApp, id: docRef.id });
      setIsSubmitting(false);
      setIsSuccess(true);
    } catch (error) {
      setIsSubmitting(false);
      handleFirestoreError(error, OperationType.CREATE, "applications");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center py-16 px-4 bg-slate-50">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white max-w-lg w-full rounded-[2.5rem] p-10 text-center border border-slate-200 shadow-2xl mb-12 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500"></div>
          
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8 relative">
            <div className="absolute inset-0 bg-emerald-200 rounded-full animate-ping opacity-20"></div>
            <CheckCircle className="w-12 h-12 text-emerald-600 relative z-10" />
          </div>
          
          <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Success!</h2>
          <p className="text-xl font-bold text-emerald-600 mb-6">Your application has been received.</p>
          
          <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100">
            <p className="text-sm text-slate-500 uppercase tracking-widest font-bold mb-2">Application ID</p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl font-mono font-black text-slate-900 tracking-tighter">
                {currentApplication?.id}
              </span>
              <button 
                onClick={() => copyToClipboard(currentApplication?.id || "")}
                className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
                title="Copy ID"
              >
                {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <p className="text-slate-600 mb-10 leading-relaxed text-lg">
            Thank you for choosing <span className="font-bold text-slate-900">Smooth Operations</span>. Our team is currently reviewing your details. You will receive an update via SMS or Email shortly.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button 
              onClick={() => setIsSuccess(false)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-900 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
            >
              Apply Again
            </button>
            <Link 
              to="/"
              className="bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
            >
              Back to Home <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-3xl w-full"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Your Application History</h3>
            <span className="bg-slate-200 text-slate-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              {pastApplications.length} Total
            </span>
          </div>
          
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden">
            {pastApplications.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">ID</th>
                      <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Amount</th>
                      <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Date</th>
                      <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {pastApplications.map((app, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-8 py-5 font-mono text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">{app.id}</td>
                        <td className="px-8 py-5 text-sm font-bold text-slate-700">R {(app.loanAmount || app.amount)?.toLocaleString()}</td>
                        <td className="px-8 py-5 text-sm text-slate-500 font-medium">{app.date}</td>
                        <td className="px-8 py-5">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                            (app.status === 'Approved' || app.status === 'Paid') ? 'bg-emerald-100 text-emerald-800' :
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
              <div className="p-16 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-slate-500 font-medium">You have no past loan applications.</p>
              </div>
            )}
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

        {!user ? (
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-12 text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Sign in to Apply</h2>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              To protect your information and manage your loan applications securely, please sign in with your Google account.
            </p>
            <button
              onClick={signInWithGoogle}
              className="inline-flex items-center justify-center gap-3 bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all"
            >
              <LogIn className="w-5 h-5" />
              Sign in with Google
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="bg-emerald-600 p-6 text-white flex items-center justify-center gap-2">
              <ShieldCheck className="w-5 h-5" />
              <span className="font-medium">256-bit Secure SSL Encryption</span>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-8">
              
              {formError && (
                <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 text-sm font-medium">
                  {formError}
                </div>
              )}

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
                  <input required name="email" type="email" id="email" defaultValue={user.email || ''} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" placeholder="thabo@example.com" />
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
                    {Array.from({ length: (5000 - 200) / 50 + 1 }, (_, i) => 200 + i * 50).map((amount) => (
                      <option key={amount} value={amount}>
                        R{amount.toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Banking Details */}
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Banking Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="bankName" className="text-sm font-medium text-slate-700">Bank Name</label>
                  <select required name="bankName" id="bankName" className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white">
                    <option value="">Select Bank...</option>
                    <option value="Absa">Absa</option>
                    <option value="Capitec">Capitec</option>
                    <option value="FNB">FNB</option>
                    <option value="Nedbank">Nedbank</option>
                    <option value="Standard Bank">Standard Bank</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="accountType" className="text-sm font-medium text-slate-700">Account Type</label>
                  <select required name="accountType" id="accountType" className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white">
                    <option value="">Select Type...</option>
                    <option value="Savings">Savings</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Transmission">Transmission</option>
                  </select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="accountNumber" className="text-sm font-medium text-slate-700">Account Number</label>
                  <input required name="accountNumber" type="text" id="accountNumber" className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" placeholder="e.g. 1234567890" />
                </div>
              </div>
            </div>

            {/* Documents */}
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Documents</h3>
              <div className="space-y-2">
                <label htmlFor="payslip" className="text-sm font-medium text-slate-700">Latest Payslip</label>
                <input required name="payslip" type="file" id="payslip" accept=".pdf,image/*" className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" />
                <p className="text-xs text-slate-500 mt-1">Max file size: 10MB for Images (JPG/PNG), 700KB for PDFs.</p>
              </div>
            </div>

            {/* Consent & Mandate */}
            <div className="space-y-4">
              <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <input required name="consent" type="checkbox" id="consent" className="mt-1 w-5 h-5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500" />
                <label htmlFor="consent" className="text-sm text-slate-600 leading-relaxed">
                  I confirm that the information provided is true and correct. I consent to Smooth Operations performing a credit check and verifying my details in accordance with the POPI Act.
                </label>
              </div>

              <div className="flex items-start gap-3 bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                <input required name="mandate" type="checkbox" id="mandate" className="mt-1 w-5 h-5 text-emerald-600 rounded border-emerald-300 focus:ring-emerald-500" />
                <label htmlFor="mandate" className="text-sm text-emerald-800 leading-relaxed">
                  <strong>Debit Order Mandate:</strong> I hereby authorize Smooth Operations to issue and deliver payment instructions to my bank for collection against my account on the agreed repayment date (NAEDO/DebiCheck).
                </label>
              </div>
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
        )}

        {/* Check Status Section */}
        {user && (
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

            {searchError && (
              <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 text-sm font-medium mb-8 text-center">
                {searchError}
              </div>
            )}

            {searchResult && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-8 border border-slate-200 shadow-lg"
              >
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Application ID</p>
                    <p className="font-mono font-bold text-slate-900">{searchResult.id}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-slate-500 mb-1">Requested Amount</p>
                    <p className="font-bold text-slate-900">R {searchResult.loanAmount?.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500 mb-1">Applied On</p>
                    <p className="font-bold text-slate-900">{searchResult.date}</p>
                  </div>
                </div>

                <div className={`flex items-center gap-4 p-6 rounded-2xl ${
                  (searchResult.status === 'Approved' || searchResult.status === 'Paid') ? 'bg-emerald-50 border border-emerald-100' :
                  searchResult.status === 'Declined' ? 'bg-red-50 border border-red-100' :
                  'bg-amber-50 border border-amber-100'
                }`}>
                  <div className={`p-3 rounded-xl ${
                    (searchResult.status === 'Approved' || searchResult.status === 'Paid') ? 'bg-emerald-500' :
                    searchResult.status === 'Declined' ? 'bg-red-500' :
                    'bg-amber-500'
                  }`}>
                    {(searchResult.status === 'Approved' || searchResult.status === 'Paid') ? <CheckCircle className="w-6 h-6 text-white" /> :
                     searchResult.status === 'Declined' ? <XCircle className="w-6 h-6 text-white" /> :
                     <Clock className="w-6 h-6 text-white" />}
                  </div>
                  <div className="flex-grow">
                    <p className="text-sm text-slate-500 font-medium mb-0.5">Current Status</p>
                    <p className={`text-xl font-bold ${
                      (searchResult.status === 'Approved' || searchResult.status === 'Paid') ? 'text-emerald-700' :
                      searchResult.status === 'Declined' ? 'text-red-700' :
                      'text-amber-700'
                    }`}>
                      {searchResult.status}
                    </p>
                    {searchResult.status === 'Declined' && searchResult.declineReason && (
                      <p className="text-sm text-red-600 mt-1 font-medium">
                        Reason: {searchResult.declineReason}
                      </p>
                    )}
                    {(searchResult.status === 'Approved' || searchResult.status === 'Paid') && searchResult.repaymentDate && (
                      <div className="mt-3 pt-3 border-t border-emerald-200/50 flex justify-between items-center">
                        <div>
                          <p className="text-xs text-emerald-700/70 font-medium uppercase tracking-wider">Repayment Due</p>
                          <p className="text-sm font-bold text-emerald-900">{searchResult.repaymentDate}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-emerald-700/70 font-medium uppercase tracking-wider">Amount</p>
                          <p className="text-sm font-bold text-emerald-900">R {searchResult.repaymentAmount?.toLocaleString()}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <p className="mt-6 text-sm text-slate-500 text-center italic">
                  {searchResult.status === 'Approved' ? "Congratulations! Your funds will be disbursed shortly." :
                   searchResult.status === 'Paid' ? "Your loan has been successfully repaid. Thank you!" :
                   searchResult.status === 'Declined' ? "We're sorry, but we cannot offer you a loan at this time." :
                   "Our team is currently reviewing your application. Please check back later."}
                </p>
              </motion.div>
            )}
          </div>
        </div>
        )}

        {/* Application History Section */}
        {user && (
          <div className="mt-16 pt-16 border-t border-slate-200">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Your Application History</h2>
              <p className="text-slate-600">View your past loan applications and their current status.</p>
            </div>

            <div className="max-w-2xl mx-auto">
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
                            <td className="px-6 py-4 text-sm text-slate-700">R {app.loanAmount?.toLocaleString() || app.amount?.toLocaleString()}</td>
                            <td className="px-6 py-4 text-sm text-slate-500">{app.date}</td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col items-start gap-1">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  (app.status === 'Approved' || app.status === 'Paid') ? 'bg-emerald-100 text-emerald-800' :
                                  app.status === 'Declined' ? 'bg-red-100 text-red-800' :
                                  'bg-amber-100 text-amber-800'
                                }`}>
                                  {app.status}
                                </span>
                                {app.status === 'Declined' && app.declineReason && (
                                  <span className="text-xs text-red-600 font-medium">
                                    {app.declineReason}
                                  </span>
                                )}
                              </div>
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
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
