import React from "react";
import { RotateCcw, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function ReturnPolicyPage() {
  return (
    <div className="bg-slate-50 min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-xs space-y-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Return, Replacement & Fitment Guarantee Policy
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Last updated: September 2026 • 7-Day Fitment Return • 30-Day Testing Warranty
            </p>
          </div>

          <div className="space-y-6 text-xs text-slate-600 leading-relaxed">
            <section>
              <h2 className="text-sm font-bold text-slate-900 mb-2">1. 7-Day Vehicle Fitment Guarantee</h2>
              <p>
                We understand that cross-referencing automotive parts with chassis numbers and model years can sometimes result in compatibility discrepancies. If a part purchased from GearTrade fails to mount or fit your vehicle, you may initiate a return within 7 calendar days of physical delivery.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-bold text-slate-900 mb-2">2. 30-Day Mechanical & Electrical Warranty</h2>
              <p>
                All pre-owned alternators, starters, steering racks, turbochargers, gearboxes, and electronics include our standard 30-Day Replacement Testing Warranty. If an item exhibits internal bearing play, electrical failure, or diagnostic fault codes within 30 days, we provide a replacement unit or full refund.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-bold text-slate-900 mb-2">3. Return Inspection Criteria</h2>
              <p>
                To qualify for a return:
                <br />• Tamper-evident warranty seals placed by our technicians must remain intact.
                <br />• The part must not have been disassembled, modified, or subjected to incorrect oil grades/fluids.
                <br />• Pre-existing cosmetic damage disclosed at the time of purchase is not grounds for return.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-bold text-slate-900 mb-2">4. Refund Processing Time</h2>
              <p>
                Upon receipt of the returned item at our Pune or Delhi hub, our technicians verify the unit within 48 hours. Refunds are credited back to the original payment method (UPI / Bank Account / Card) within 3-5 business days.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
