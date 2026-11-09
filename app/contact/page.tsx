import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import InquiryForm from "@/components/InquiryForm";
import { MapPin, Phone, Mail, Clock, Crown } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Marwar Events Concierge | Event Inquiries Jodhpur",
  description:
    "Get in touch with Rajasthan's premier royal wedding planners and event managers. Offices in Jodhpur, Udaipur, and Jaipur. Dedicated 24/7 concierge.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <Navbar />

      <section className="bg-stone-900 text-white py-16 lg:py-24 border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400 font-sans">
            Direct Concierge
          </span>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold mt-2">
            Connect With Our Royal Planners
          </h1>
          <p className="text-stone-400 mt-3 max-w-xl mx-auto text-base">
            Plan your royal celebration with guidance from our senior directors in Jodhpur, Rajasthan.
          </p>
        </div>
      </section>

      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Contact Details */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-sm space-y-6">
              <h2 className="text-2xl font-serif font-bold text-stone-900">
                Headquarters & Studio
              </h2>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800 shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-stone-900">Main Office</h4>
                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                      Pal Road, Near Residency, Jodhpur, Rajasthan 342008, India
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800 shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-stone-900">Direct Inquiries</h4>
                    <p className="text-xs text-stone-600 mt-1">
                      +91 98765 43210 / +91 291 274000
                    </p>
                    <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
                      Available on WhatsApp 24/7
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800 shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-stone-900">Email Concierge</h4>
                    <p className="text-xs text-stone-600 mt-1">concierge@marwarevents.com</p>
                    <p className="text-xs text-stone-600">weddings@marwarevents.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800 shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-stone-900">Studio Hours</h4>
                    <p className="text-xs text-stone-600 mt-1">Monday – Sunday: 9:00 AM – 9:00 PM IST</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-stone-900 text-stone-200 p-6 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Crown className="w-4 h-4" />
                <span>On-Site Consultations</span>
              </div>
              <p className="text-xs text-stone-400 leading-relaxed">
                We also offer in-person venue visits across Jodhpur, Udaipur, Jaipur, and Jaisalmer.
                Request a dedicated walkthrough with our senior venue planners.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-7">
            <InquiryForm />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

