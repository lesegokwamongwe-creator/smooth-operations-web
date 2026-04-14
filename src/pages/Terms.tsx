import React from "react";
import { ShieldCheck, FileText } from "lucide-react";
import { motion } from "motion/react";

export default function Terms() {
  return (
    <div className="py-16 md:py-24 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2rem] shadow-xl border border-slate-200 p-8 md:p-12"
        >
          <div className="flex items-center gap-4 mb-8 border-b border-slate-100 pb-8">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center shrink-0">
              <FileText className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Terms of Service</h1>
              <p className="text-slate-500 mt-2">Last updated: April 2026</p>
            </div>
          </div>

          <div className="prose prose-slate prose-emerald max-w-none">
            <p className="text-lg text-slate-600 leading-relaxed mb-8">
              Welcome to Smooth Operations. By accessing our website and using our services, you agree to be bound by the following terms and conditions. Please read them carefully.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">1. Acceptance of Terms</h2>
            <p className="text-slate-600 mb-6">
              By applying for a loan or using any services provided by Smooth Operations, you agree to these Terms of Service, our Privacy Policy, and any other policies referenced herein.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">2. Loan Applications & Eligibility</h2>
            <p className="text-slate-600 mb-6">
              To be eligible for a loan, you must be a South African citizen or permanent resident, be at least 18 years old, and have a verifiable source of income. All loan applications are subject to credit approval and affordability assessments in accordance with the National Credit Act (NCA).
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">3. Specific Loan Terms</h2>
            <ul className="list-disc pl-10 space-y-3 text-slate-600 mb-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <li>
                <strong>Repayment Schedule:</strong> The principal loan amount and all accrued interest must be repaid in full by the agreed-upon due date.
              </li>
              <li>
                <strong>Interest Calculation:</strong> Interest is applied at a fixed rate and does not compound over the duration of the loan term.
              </li>
              <li>
                <strong>Early Settlement:</strong> Borrowers are permitted to settle their outstanding loan balance prior to the due date without incurring any early repayment penalties.
              </li>
              <li>
                <strong>Late Payment Penalties:</strong> A late fee equivalent to 10% of the outstanding balance will be levied if the repayment is not received by the stipulated deadline.
              </li>
              <li>
                <strong>Approval Discretion:</strong> All loan applications and disbursements are strictly subject to final review and approval by Smooth Operations.
              </li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">4. Interest Rates & Fees</h2>
            <p className="text-slate-600 mb-6">
              Interest rates and fees are determined based on your credit profile and the loan amount. All applicable fees, including initiation fees and monthly service fees, will be clearly disclosed in your loan agreement before you accept the loan.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">5. Repayment & Debit Orders</h2>
            <p className="text-slate-600 mb-6">
              By accepting a loan, you authorize Smooth Operations to collect repayments via debit order (NAEDO/DebiCheck) from your designated bank account on the agreed-upon dates. If a payment is missed, additional penalty fees and interest may apply.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">6. Credit Bureau Reporting</h2>
            <p className="text-slate-600 mb-6">
              We reserve the right to report your payment behavior to registered credit bureaus. Late payments, missed payments, or defaults may negatively impact your credit score.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">7. Contact Information</h2>
            <p className="text-slate-600 mb-6">
              If you have any questions about these Terms, please contact us via our website at <a href="https://smoothoperations.netlify.app" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:text-emerald-700 font-medium">smoothoperations.netlify.app</a>.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
