import React from "react";
import { ShieldCheck } from "lucide-react";
import { motion } from "motion/react";

export default function Privacy() {
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
              <ShieldCheck className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Privacy Policy</h1>
              <p className="text-slate-500 mt-2">Last updated: April 2026</p>
            </div>
          </div>

          <div className="prose prose-slate prose-emerald max-w-none">
            <p className="text-lg text-slate-600 leading-relaxed mb-8">
              At Smooth Operations, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services, in compliance with the Protection of Personal Information Act (POPIA).
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">1. Information We Collect</h2>
            <p className="text-slate-600 mb-6">
              We collect personal information that you voluntarily provide to us when applying for a loan, including:
            </p>
            <ul className="list-disc pl-6 text-slate-600 mb-6 space-y-2">
              <li>Identity information (Name, ID number)</li>
              <li>Contact details (Email, Phone number, Address)</li>
              <li>Financial information (Income, Bank statements, Payslips)</li>
              <li>Employment details</li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">2. How We Use Your Information</h2>
            <p className="text-slate-600 mb-6">
              We use the information we collect primarily to:
            </p>
            <ul className="list-disc pl-6 text-slate-600 mb-6 space-y-2">
              <li>Process and evaluate your loan application</li>
              <li>Perform credit checks and affordability assessments</li>
              <li>Communicate with you regarding your account</li>
              <li>Prevent fraud and ensure security</li>
              <li>Comply with legal and regulatory obligations</li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">3. Data Security</h2>
            <p className="text-slate-600 mb-6">
              We implement industry-standard security measures, including 256-bit SSL encryption, to protect your personal information from unauthorized access, alteration, disclosure, or destruction.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">4. Sharing Your Information</h2>
            <p className="text-slate-600 mb-6">
              We do not sell your personal information. We may share your data with trusted third parties, such as credit bureaus and payment processors, solely for the purpose of providing our services and complying with the law.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">5. Your Rights</h2>
            <p className="text-slate-600 mb-6">
              Under POPIA, you have the right to access, update, or request deletion of your personal information. To exercise these rights, please contact our privacy officer.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
