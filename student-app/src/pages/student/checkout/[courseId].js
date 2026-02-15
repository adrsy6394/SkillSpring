import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../../../components/Layout';
import { useAuth } from '@/context/AuthContext';
import { courseApi } from '@/services/courseApi';
import { enrollmentApi } from '@/services/enrollmentApi';
import { 
  CreditCard, Lock, ShieldCheck, CheckCircle, 
  ChevronLeft, Loader2, CreditCard as CardIcon 
} from 'lucide-react';
import Link from 'next/link';

export default function MockCheckout() {
  const router = useRouter();
  const { courseId } = router.query;
  const { user, loading: authLoading } = useAuth();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Card Form State
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    if (!router.isReady || authLoading) return;
    if (!user) {
      router.push(`/login?redirect=/student/checkout/${courseId}`);
      return;
    }

    const fetchCourse = async () => {
      try {
        const data = await courseApi.getCourseById(courseId);
        if (!data) throw new Error("Course not found");
        
        // Final sanity check: is user already enrolled?
        const enrolled = await enrollmentApi.checkEnrollment(courseId, user.id);
        if (enrolled) {
          router.push(`/player/${courseId}`);
          return;
        }

        setCourse(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [router.isReady, courseId, user, authLoading]);

  const handlePayment = async (e) => {
    e.preventDefault();
    setProcessing(true);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      await enrollmentApi.enrollUser(courseId, user.id, course.price || 0);
      setSuccess(true);
      
      // Auto-redirect after 3 seconds
      setTimeout(() => {
        router.push(`/player/${courseId}`);
      }, 3000);
    } catch (err) {
      alert("Payment simulation failed: " + err.message);
      setProcessing(false);
    }
  };

  if (loading) return <Layout><div className="min-h-screen flex items-center justify-center font-black text-slate-400 uppercase tracking-widest">Initialising Secure Checkout...</div></Layout>;
  
  if (!course) return <Layout><div className="p-20 text-center font-bold text-red-500">Course not found.</div></Layout>;

  if (success) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 animate-in zoom-in duration-500">
           <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-emerald-200">
              <CheckCircle className="h-12 w-12" />
           </div>
           <h1 className="text-4xl font-black text-slate-900 mb-4 text-center tracking-tight">Payment Successful!</h1>
           <p className="text-slate-500 font-medium text-center max-w-sm mb-10">
              Your enrollment is confirmed. You are being redirected to your learning experience now.
           </p>
           <Link 
             href={`/player/${courseId}`}
             className="px-10 py-4 bg-slate-900 text-white font-black uppercase tracking-widest rounded-2xl hover:scale-105 active:scale-95 transition-all"
           >
              Go to Player Now
           </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>Checkout | {course.title}</title>
      </Head>

      <div className="bg-slate-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-10">
            <button onClick={() => router.back()} className="p-2 hover:bg-white rounded-full transition-colors">
               <ChevronLeft className="h-6 w-6 text-slate-600" />
            </button>
            <h1 className="text-2xl font-black text-slate-900 font-outfit">Checkout</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Left: Payment Form */}
            <div className="space-y-8">
              <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl shadow-slate-200 border border-slate-100">
                <div className="flex items-center justify-between mb-8">
                   <h2 className="text-xl font-bold text-slate-900">Payment Information</h2>
                   <div className="flex gap-2">
                      <div className="h-6 w-10 bg-slate-100 rounded border border-slate-200 flex items-center justify-center text-[8px] font-bold text-slate-400">VISA</div>
                      <div className="h-6 w-10 bg-slate-100 rounded border border-slate-200 flex items-center justify-center text-[8px] font-bold text-slate-400">MC</div>
                   </div>
                </div>

                <form onSubmit={handlePayment} className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400">Cardholder Name</label>
                      <input 
                        required
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 outline-none transition-all font-medium text-black"
                      />
                   </div>

                   <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400">Card Number</label>
                      <div className="relative">
                         <input 
                           required
                           type="text" 
                           maxLength="19"
                           value={cardNumber}
                           onChange={(e) => {
                              const v = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
                              const matches = v.match(/\d{4,16}/g);
                              const match = matches && matches[0] || '';
                              const parts = [];
                              for (let i=0, len=match.length; i<len; i+=4) {
                                parts.push(match.substring(i, i+4));
                              }
                              if (parts.length) {
                                setCardNumber(parts.join(' '));
                              } else {
                                setCardNumber(v);
                              }
                           }}
                           placeholder="0000 0000 0000 0000"
                           className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 outline-none transition-all font-medium"
                         />
                         <CardIcon className="absolute right-6 top-4 h-6 w-6 text-slate-300" />
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">Expiry (MM/YY)</label>
                        <input 
                          required
                          type="text"
                          maxLength="5"
                          value={expiry}
                          onChange={(e) => setExpiry(e.target.value)}
                          placeholder="MM/YY"
                          className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 outline-none transition-all font-medium text-black"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">CVC</label>
                        <input 
                          required
                          type="text"
                          maxLength="3"
                          value={cvc}
                          onChange={(e) => setCvc(e.target.value)}
                          placeholder="123"
                          className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 outline-none transition-all font-medium text-black"
                        />
                      </div>
                   </div>

                   <div className="pt-4">
                      <button 
                        type="submit"
                        disabled={processing}
                        className="w-full py-5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-black uppercase tracking-widest rounded-[2rem] shadow-xl shadow-violet-200 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70"
                      >
                        {processing ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="h-5 w-5" />
                            Pay ₹{course.price?.toFixed(2) || '0.00'}
                          </>
                        )}
                      </button>
                   </div>
                </form>

                <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <Lock className="h-3 w-3" />
                    Secure SSL Encrypted Payment
                </div>
              </div>
            </div>

            {/* Right: Order Summary */}
            <div className="space-y-8">
              <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl shadow-slate-900/20">
                 <h2 className="text-xl font-bold mb-8">Order Summary</h2>
                 
                 <div className="flex gap-4 mb-8">
                    <div className="h-20 w-32 bg-white/10 rounded-2xl overflow-hidden relative">
                       {course.thumbnail ? (
                         <img src={course.thumbnail} fill className="object-cover" />
                       ) : (
                         <div className="w-full h-full flex items-center justify-center text-white/20 uppercase font-black text-[10px]">
                            Preview
                         </div>
                       )}
                    </div>
                    <div>
                       <h3 className="font-bold text-sm leading-tight mb-2 line-clamp-2">{course.title}</h3>
                       <p className="text-xs text-slate-400 font-medium">Instructor: {course.instructor?.full_name}</p>
                    </div>
                 </div>

                 <div className="space-y-4 pt-8 border-t border-white/10">
                    <div className="flex justify-between text-sm font-medium text-slate-400">
                       <span>Original Price</span>
                       <span className="line-through">₹{(course.price * 5).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium text-emerald-400">
                       <span>Fast Track Discount (80%)</span>
                       <span>- ₹{(course.price * 4).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between pt-4 text-xl font-black">
                       <span>Total Amount</span>
                       <span className="text-fuchsia-400">₹{course.price?.toFixed(2) || '0.00'}</span>
                    </div>
                 </div>

                 <div className="mt-10 p-6 bg-white/5 rounded-3xl border border-white/5">
                    <div className="flex gap-3 items-start">
                       <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0" />
                       <div>
                          <p className="text-xs font-bold uppercase tracking-widest mb-1">SkillSpring Guarantee</p>
                          <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                             Unlock full lifetime access to this course and all its future updates immediately after payment.
                          </p>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Secure Checkout Badge */}
              <div className="flex items-center justify-center gap-6 opacity-30">
                 <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-4" />
                 <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-6" />
                 <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" className="h-4" />
              </div>
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
}
