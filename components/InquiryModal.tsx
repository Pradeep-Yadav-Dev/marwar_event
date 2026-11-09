"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import InquiryForm from "@/components/InquiryForm";

export default function InquiryModal() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [selectedService, setSelectedService] = useState("Shaadi & Vivaah");

  useEffect(() => {
    const onOpenModal = (e: Event) => {
      const custom = e as CustomEvent<string | undefined>;
      if (custom.detail) {
        setSelectedService(custom.detail);
      }
      setOpen(true);
    };

    const onCloseModal = () => {
      setOpen(false);
    };

    window.addEventListener("marwar:open-inquiry-modal", onOpenModal);
    window.addEventListener("marwar:close-inquiry-modal", onCloseModal);
    return () => {
      window.removeEventListener("marwar:open-inquiry-modal", onOpenModal);
      window.removeEventListener("marwar:close-inquiry-modal", onCloseModal);
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (
    pathname?.startsWith("/service/admin") ||
    pathname?.startsWith("/services/admin")
  ) {
    return null;
  }

  if (!open) return null;

  return (
    <div
      className="royal-modal-backdrop"
      onClick={() => setOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Plan Your Royal Celebration"
    >
      <div
        className="royal-modal-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="royal-modal-close"
          onClick={() => setOpen(false)}
          aria-label="Close inquiry modal"
        >
          <X className="w-4 h-4" />
        </button>

        <InquiryForm
          key={selectedService}
          defaultService={selectedService}
          onSuccess={() => setOpen(false)}
        />
      </div>
    </div>
  );
}
