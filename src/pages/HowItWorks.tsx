import { Link } from "react-router-dom";
import { FileText, CheckCircle, Wallet, ArrowRight } from "lucide-react";
import { motion } from "motion/react";

export default function HowItWorks() {
  const steps = [
    {
      icon: <FileText className="w-8 h-8 text-emerald-600" />,
      title: "1. Apply Online",
      description: "Fill out our simple, secure online application form. It takes less than 5 minutes. You'll need your ID number, latest payslip, and bank details.",
    },
    {
      icon: <CheckCircle className="w-8 h-8 text-emerald-600" />,
      title: "2. Get Approved",
      description: "Our smart system reviews your application instantly. If approved, we'll show you exactly how much you qualify for and the transparent repayment terms.",
    },
    {
      icon: <Wallet className="w-8 h-8 text-emerald-600" />,
      title: "3. Receive Cash",
      description: "Once you accept the loan offer, the cash is transferred directly into your South African bank account within 24 hours.",
    }
  ];

  return (
    <div className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">How It Works</h1>
          <p className="text-xl text-slate-600">
            We've removed the red tape. Getting a loan with Smooth Operations is designed to be as fast and effortless as possible.
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Connecting line for desktop */}
          <div className="hidden md:block absolute left-[50%] top-12 bottom-12 w-0.5 bg-emerald-100 -translate-x-1/2"></div>

          <div className="space-y-12 md:space-y-0">
            {steps.map((step, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.5 }}
                className={`relative flex flex-col md:flex-row items-center gap-8 md:gap-16 ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                {/* Content */}
                <div className={`flex-1 text-center md:text-left ${index % 2 === 0 ? 'md:text-right' : ''}`}>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">{step.title}</h3>
                  <p className="text-slate-600 text-lg leading-relaxed">{step.description}</p>
                </div>

                {/* Icon Circle */}
                <div className="relative z-10 flex-shrink-0 w-24 h-24 bg-white rounded-full border-4 border-emerald-100 flex items-center justify-center shadow-lg shadow-emerald-100/50">
                  {step.icon}
                </div>

                {/* Empty space for alternating layout */}
                <div className="flex-1 hidden md:block"></div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-20 text-center bg-slate-50 rounded-3xl p-10 border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Need cash quickly?</h2>
          <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
            Don't let unexpected expenses derail your month. Apply now and get the financial breathing room you need.
          </p>
          <Link
            to="/apply"
            className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-emerald-600/20"
          >
            Start Your Application <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

      </div>
    </div>
  );
}
