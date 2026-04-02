import { Link } from "react-router-dom";
import { ArrowRight, Clock, ShieldCheck, ThumbsUp, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-luminosity"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/90 to-transparent"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-block py-1 px-3 rounded-full bg-emerald-500/20 text-emerald-300 text-sm font-semibold tracking-wider mb-6 border border-emerald-500/30">
                TRUSTED SOUTH AFRICAN LENDER
              </span>
              <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight mb-6">
                Get Up to <span className="text-emerald-400">R5,000</span> in 24 Hours 💸
              </h1>
              <p className="text-lg md:text-xl text-slate-300 mb-10 leading-relaxed">
                Quick cash when you need it most. Smooth Operations offers easy, flexible personal loans with no hidden fees. Apply online in minutes.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/apply"
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2"
                >
                  Apply Now <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/how-it-works"
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center"
                >
                  How It Works
                </Link>
              </div>
              
              <div className="mt-10 flex items-center gap-6 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>No paperwork</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>Instant decision</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Why Choose Smooth Operations?</h2>
            <p className="text-lg text-slate-600">We've streamlined the borrowing process to get you the funds you need without the traditional banking hassle.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                icon: <Clock className="w-10 h-10 text-emerald-600" />,
                title: "Lightning Fast",
                description: "Complete our simple online application in under 5 minutes. Get approved instantly and receive funds within 24 hours."
              },
              {
                icon: <ThumbsUp className="w-10 h-10 text-emerald-600" />,
                title: "Fixed Terms",
                description: "Borrow from R200 to R5,000. Repayment is due exactly 31 days from the date of your application."
              },
              {
                icon: <ShieldCheck className="w-10 h-10 text-emerald-600" />,
                title: "Safe & Secure",
                description: "Your data is protected with bank-level encryption. We are a registered credit provider committed to responsible lending."
              }
            ].map((benefit, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:shadow-lg hover:border-emerald-100 transition-all"
              >
                <div className="bg-emerald-100 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{benefit.title}</h3>
                <p className="text-slate-600 leading-relaxed">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-emerald-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to get started?</h2>
          <p className="text-emerald-100 text-lg mb-10">Join thousands of South Africans who trust Smooth Operations for their short-term financial needs.</p>
          <Link
            to="/apply"
            className="inline-flex items-center justify-center gap-2 bg-white text-emerald-700 hover:bg-slate-50 px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-xl"
          >
            Get Your Loan Today <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
