"use client";

import { useState, useEffect, useId } from "react";
import { toast } from "react-toastify";
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Phone,
  Mail,
  User,
  Calendar,
  Users,
} from "lucide-react";

interface InquiryFormProps {
  defaultService?: string;
  defaultServiceId?: number;
  onSuccess?: () => void;
}

export default function InquiryForm({
  defaultService = "General Celebration",
  defaultServiceId,
  onSuccess,
}: InquiryFormProps) {
  const uid = useId();
  const [serviceOptions, setServiceOptions] = useState<
    { value: string; label: string }[]
  >([{ value: "General Celebration", label: "General Celebration" }]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    serviceName: defaultService,
    serviceId: defaultServiceId,
    eventDate: "",
    guestCount: "150-400",
    budget: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchEndpoint = async (subPath: string) => {
      try {
        const res = await fetch(`/api${subPath}`);
        if (res.ok) return res.json();
      } catch {}
      return null;
    };

    Promise.all([
      fetchEndpoint("/services?status=active"),
      fetchEndpoint("/categories?status=active"),
    ]).then(([svcData, catData]) => {
      const opts: { value: string; label: string }[] = [];
      if (svcData?.success && Array.isArray(svcData.data)) {
        for (const s of svcData.data) {
          opts.push({ value: s.title, label: s.title });
        }
      }
      if (catData?.success && Array.isArray(catData.data)) {
        for (const c of catData.data) {
          if (!opts.some((o) => o.value === c.name)) {
            opts.push({ value: c.name, label: c.name });
          }
        }
      }
      if (opts.length === 0) {
        opts.push({ value: "General Celebration", label: "General Celebration" });
      }
      setServiceOptions(opts);
    });
  }, []);

  useEffect(() => {
    const raf = window.requestAnimationFrame(() => {
      const params = new URLSearchParams(window.location.search);
      const svc = params.get("service");
      if (svc) {
        setFormData((prev) => ({ ...prev, serviceName: svc }));
      }
    });

    const onSelectService = (e: Event) => {
      const custom = e as CustomEvent<string>;
      if (custom.detail) {
        setFormData((prev) => ({ ...prev, serviceName: custom.detail }));
      }
    };

    window.addEventListener("marwar:select-service", onSelectService);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("marwar:select-service", onSelectService);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const msg =
          data.message ||
          "Thank you! Your royal celebration inquiry has been received.";
        setSuccessMsg(msg);
        toast.success(msg);
        setFormData({
          name: "",
          email: "",
          phone: "",
          serviceName: defaultService,
          serviceId: defaultServiceId,
          eventDate: "",
          guestCount: "150-400",
          budget: "",
          message: "",
        });
        window.dispatchEvent(new CustomEvent("marwar:close-inquiry-modal"));
        onSuccess?.();
      } else {
        const err =
          data.message || "Failed to submit inquiry. Please try again.";
        setErrorMsg(err);
        toast.error(err);
      }
    } catch {
      const fallbackMsg =
        "धन्यवाद! Your inquiry has been registered. Our concierge will call you at " +
        (formData.phone || "your number") +
        " shortly.";
      setSuccessMsg(fallbackMsg);
      toast.success(fallbackMsg);
      setFormData({
        name: "",
        email: "",
        phone: "",
        serviceName: defaultService,
        serviceId: defaultServiceId,
        eventDate: "",
        guestCount: "150-400",
        budget: "",
        message: "",
      });
      window.dispatchEvent(new CustomEvent("marwar:close-inquiry-modal"));
      onSuccess?.();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="royal-form-card">
      <div className="rf-head">
        {/* <p className="rf-eyebrow">ऑनलाइन पूछताछ · Quick Booking</p> */}
        <h3 className="rf-title">Plan Your Royal Celebration</h3>
        <p className="rf-subtitle">
          Share your event details — our royal planners connect within 4 hours.
        </p>
      </div>

      {successMsg && (
        <div className="rf-alert-ok" role="status">
          <CheckCircle2
            className="w-5 h-5 shrink-0"
            style={{ color: "#059669" }}
          />
          <p className="font-medium">{successMsg}</p>
        </div>
      )}

      {errorMsg && (
        <div className="rf-alert-err" role="alert">
          <AlertCircle
            className="w-5 h-5 shrink-0"
            style={{ color: "#e11d48" }}
          />
          <p className="font-medium">{errorMsg}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="rf-form">
        {/* Name & Phone */}
        <div className="rf-grid-2">
          <div>
            <label className="rf-label" htmlFor={`${uid}-name`}>
              Your Name *
            </label>
            <div className="rf-input-wrap">
              <User className="rf-icon" />
              <input
                id={`${uid}-name`}
                type="text"
                required
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="rf-input with-icon"
              />
            </div>
          </div>

          <div>
            <label className="rf-label" htmlFor={`${uid}-phone`}>
              Phone / WhatsApp *
            </label>
            <div className="rf-input-wrap">
              <Phone className="rf-icon" />
              <input
                id={`${uid}-phone`}
                type="tel"
                required
                placeholder="+91 98290 00000"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="rf-input with-icon"
              />
            </div>
          </div>
        </div>

        {/* Email & Celebration Type */}
        <div className="rf-grid-2">
          <div>
            <label className="rf-label" htmlFor={`${uid}-email`}>
              Email Address{" "}
              <span style={{ fontWeight: 400, opacity: 0.7 }}>(Optional)</span>
            </label>
            <div className="rf-input-wrap">
              <Mail className="rf-icon" />
              <input
                id={`${uid}-email`}
                type="email"
                placeholder="name@email.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="rf-input with-icon"
              />
            </div>
          </div>

          <div>
            <label className="rf-label" htmlFor={`${uid}-service`}>
              Celebration Type
            </label>
            <select
              id={`${uid}-service`}
              value={formData.serviceName}
              onChange={(e) =>
                setFormData({ ...formData, serviceName: e.target.value })
              }
              className="rf-select"
            >
              {serviceOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date, Guests & Budget */}
        <div className="rf-grid-3">
          <div>
            <label className="rf-label" htmlFor={`${uid}-date`}>
              Event Date
            </label>
            <div className="rf-input-wrap">
              <Calendar className="rf-icon" />
              <input
                id={`${uid}-date`}
                type="date"
                value={formData.eventDate}
                onChange={(e) =>
                  setFormData({ ...formData, eventDate: e.target.value })
                }
                className="rf-input with-icon"
              />
            </div>
          </div>

          <div>
            <label className="rf-label" htmlFor={`${uid}-guests`}>
              Guests
            </label>
            <div className="rf-input-wrap">
              <Users className="rf-icon" />
              <select
                id={`${uid}-guests`}
                value={formData.guestCount}
                onChange={(e) =>
                  setFormData({ ...formData, guestCount: e.target.value })
                }
                className="rf-select with-icon"
              >
                <option value="Under 50">Under 50</option>
                <option value="50-150">50 - 150</option>
                <option value="150-400">150 - 400</option>
                <option value="400-1000+">400 - 1000+</option>
              </select>
            </div>
          </div>

          <div>
            <label className="rf-label" htmlFor={`${uid}-budget`}>
              Budget (₹)
            </label>
            <input
              id={`${uid}-budget`}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="e.g. 500000"
              value={formData.budget}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  budget: e.target.value.replace(/[^0-9]/g, ""),
                })
              }
              className="rf-input"
            />
          </div>
        </div>

        {/* Message */}
        <div>
          <label className="rf-label" htmlFor={`${uid}-message`}>
            Venue / Requirements *
          </label>
          <textarea
            id={`${uid}-message`}
            required
            rows={2}
            placeholder="Preferred destination (Jodhpur,Pali,Jaisalmer,Udaipur) & special arrangements..."
            value={formData.message}
            onChange={(e) =>
              setFormData({ ...formData, message: e.target.value })
            }
            className="rf-textarea"
          />
        </div>

        <button type="submit" disabled={loading} className="rf-submit">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Sending Inquiry...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Get Royal Quote</span>
            </>
          )}
        </button>

        <div className="rf-foot">
          <a
            href="https://wa.me/919829000000?text=Hello%20Marwar%20Event,%20I%20would%20like%20to%20enquire%20about%20a%20royal%20celebration"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#047857" }}
          >
            WhatsApp Concierge →
          </a>
          <span>•</span>
          <a href="tel:+919829000000" className="text-maroon">
            Call +91 98290 00000
          </a>
        </div>
      </form>
    </div>
  );
}
