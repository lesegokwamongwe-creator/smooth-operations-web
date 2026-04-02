import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function FAQ() {
  const faqs = [
    {
      question: "What are the requirements to qualify for a loan?",
      answer: "To qualify, you must be a South African citizen with a valid ID, be at least 18 years old, have a regular monthly income (employed for at least 3 months), and have an active bank account in your name where your salary is deposited."
    },
    {
      question: "How long does it take to get the money?",
      answer: "Once your application is approved and you've accepted the loan offer, the funds are transferred directly into your bank account. Depending on your bank, this usually reflects within 24 hours, often much sooner."
    },
    {
      question: "Do you do credit checks?",
      answer: "Yes, as a responsible registered credit provider, we are required by the National Credit Act to perform a credit check to ensure you can comfortably afford the repayments. However, a less-than-perfect credit score doesn't automatically mean you'll be declined."
    },
    {
      question: "How do I repay the loan?",
      answer: "Repayments are collected automatically via a secure debit order (Naedo) from your bank account on your agreed payday. This ensures you never miss a payment and helps build a positive credit profile."
    },
    {
      question: "Can I settle my loan early?",
      answer: "Absolutely! You can settle your loan at any time before the end of the term without any early settlement penalties. In fact, settling early will save you money on interest."
    },
    {
      question: "What happens if I can't make a payment?",
      answer: "If you miss your payment on the due date (31 days from application), a 10% late fee penalty will be added to your outstanding balance. If you anticipate difficulty making a payment, please contact our support team immediately to discuss your options."
    }
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="py-16 md:py-24 bg-slate-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-slate-600">
            Got questions? We've got answers. If you can't find what you're looking for, feel free to contact our support team.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
              >
                <span className="text-lg font-semibold text-slate-900 pr-8">{faq.question}</span>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${openIndex === index ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                  {openIndex === index ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-6 pb-6 text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-slate-600 mb-4">Still have questions?</p>
          <a href="/contact" className="text-emerald-600 font-bold hover:text-emerald-700 underline underline-offset-4">
            Contact our support team
          </a>
        </div>

      </div>
    </div>
  );
}
