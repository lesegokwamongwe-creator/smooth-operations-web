import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Check, ArrowRight, Calculator, Info } from "lucide-react";
import { motion } from "motion/react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function LoanOptions() {
  const [amount, setAmount] = useState(200);
  const [results, setResults] = useState({
    totalInterest: 0,
    totalRepayment: 0,
    lateFeePenalty: 0,
  });

  useEffect(() => {
    // Fixed calculation: 31 days term
    // Interest is R40 for every R100 borrowed (R20 per R50)
    // This is exactly 40% (0.40)
    const interestRate = 0.40;
    
    const totalInterest = amount * interestRate;
    const totalRepayment = amount + totalInterest;
    const lateFeePenalty = totalRepayment * 0.10;

    setResults({
      totalInterest,
      totalRepayment,
      lateFeePenalty,
    });
  }, [amount]);

  const options = [
    {
      title: "Micro Loan",
      amount: "R200 - R2,000",
      term: "31 Days",
      idealFor: "Unexpected minor expenses, groceries, or transport before payday.",
      features: [
        "Instant approval",
        "No credit check required",
        "Repay in 31 days",
        "Zero hidden fees"
      ]
    },
    {
      title: "Standard Loan",
      amount: "R2,000 - R5,000",
      term: "31 Days",
      idealFor: "Car repairs, medical bills, or school fees.",
      popular: true,
      features: [
        "Fast processing",
        "Fixed 31-day term",
        "Competitive interest rates",
        "Early settlement allowed"
      ]
    },
    {
      title: "Maxi Loan",
      amount: "R5,000",
      term: "31 Days",
      idealFor: "Home improvements, debt consolidation, or larger emergencies.",
      features: [
        "Higher limits for steady earners",
        "Fixed 31-day repayment",
        "Fixed repayment amount",
        "Personalized service"
      ]
    }
  ];

  return (
    <div className="py-16 md:py-24 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Flexible Loan Options</h1>
          <p className="text-xl text-slate-600">
            Choose the amount and term that works best for your budget. We believe in transparent pricing with absolutely no hidden fees.
          </p>
        </div>

        {/* Loan Calculator Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-2xl shadow-slate-200 border border-slate-200 overflow-hidden mb-24 max-w-5xl mx-auto"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="p-8 md:p-12 border-b lg:border-b-0 lg:border-r border-slate-100">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Calculator className="w-6 h-6 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Loan Calculator</h2>
              </div>

              <div className="space-y-10">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-slate-700 font-semibold">Loan Amount</label>
                    <span className="text-2xl font-bold text-emerald-600">R {amount.toLocaleString()}</span>
                  </div>
                  <input 
                    type="range" 
                    min="200" 
                    max="5000" 
                    step="50"
                    value={amount}
                    onChange={(e) => setAmount(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                  <div className="flex justify-between text-xs text-slate-400 mt-2">
                    <span>R 200</span>
                    <span>R 5,000</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-slate-700 font-semibold">Repayment Term</label>
                    <span className="text-2xl font-bold text-emerald-600">31 Days</span>
                  </div>
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-700 font-medium text-center">
                    Fixed 31-day repayment period
                  </div>
                </div>
              </div>

              <div className="mt-10 flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <Info className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-slate-500 leading-relaxed">
                  Repayment is due exactly 31 days from the date of application. Calculations are based on R40 interest for every R100 borrowed (R20 per R50).
                </p>
              </div>
            </div>

            <div className="bg-slate-900 p-8 md:p-12 text-white flex flex-col justify-center">
              <div className="space-y-6">
                <div>
                  <p className="text-slate-400 font-medium mb-1">Total Repayment Amount</p>
                  <div className="text-5xl font-extrabold text-emerald-400 tracking-tight">
                    R {results.totalRepayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <p className="text-slate-500 text-sm mt-2 italic">Due in 31 days</p>
                </div>

                {/* Visual Breakdown Chart */}
                <div className="pt-2 pb-2 h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: 'Principal', amount: amount, color: '#10b981' },
                        { name: 'Interest', amount: results.totalInterest, color: '#f59e0b' }
                      ]}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R${value}`} />
                      <Tooltip 
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc' }}
                        formatter={(value: number) => [`R ${value.toLocaleString()}`, 'Amount']}
                      />
                      <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                        {
                          [
                            { name: 'Principal', amount: amount, color: '#10b981' },
                            { name: 'Interest', amount: results.totalInterest, color: '#f59e0b' }
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))
                        }
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-1 gap-4 pt-4 border-t border-slate-800">
                  <div>
                    <p className="text-slate-400 text-xs mb-1 uppercase tracking-wider font-semibold">Late Penalty (If Overdue)</p>
                    <p className="text-sm font-bold text-red-400">+ R {results.lateFeePenalty.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (10%)</p>
                  </div>
                </div>

                <Link
                  to="/apply"
                  className="block w-full py-5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold text-center transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-900/20"
                >
                  Apply for this Loan
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {options.map((option, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className={`relative bg-white rounded-3xl p-8 border ${
                option.popular ? 'border-emerald-500 shadow-xl shadow-emerald-100' : 'border-slate-200 shadow-lg shadow-slate-100'
              } flex flex-col`}
            >
              {option.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-500 text-white px-4 py-1 rounded-full text-sm font-bold tracking-wide">
                  MOST POPULAR
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-slate-500 mb-2">{option.title}</h3>
                <div className="text-3xl font-extrabold text-slate-900">{option.amount}</div>
                <div className="text-emerald-600 font-medium mt-1">Term: {option.term}</div>
              </div>
              
              <p className="text-slate-600 mb-8 pb-8 border-b border-slate-100 min-h-[80px]">
                {option.idealFor}
              </p>
              
              <ul className="space-y-4 mb-8 flex-grow">
                {option.features.map((feature, fIndex) => (
                  <li key={fIndex} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Link
                to="/apply"
                className={`w-full py-4 rounded-xl font-bold text-center transition-colors ${
                  option.popular 
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
                }`}
              >
                Apply for {option.title}
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 bg-white rounded-2xl p-8 md:p-12 border border-slate-200 text-center max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Transparent Pricing Guarantee</h2>
          <p className="text-slate-600 mb-6">
            In accordance with the National Credit Act (NCA), our interest rates and fees are capped. You will see a full breakdown of the total cost of credit before you sign any agreement.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-500">
            <span className="bg-slate-100 px-3 py-1 rounded-full">Interest Rate: 40% per R100 borrowed</span>
            <span className="bg-slate-100 px-3 py-1 rounded-full">No Initiation Fees</span>
            <span className="bg-slate-100 px-3 py-1 rounded-full">No Monthly Service Fees</span>
            <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full font-medium">10% Late Payment Penalty</span>
          </div>
        </div>

      </div>
    </div>
  );
}
