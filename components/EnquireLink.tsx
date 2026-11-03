"use client";

interface EnquireLinkProps {
  serviceTitle?: string;
  className?: string;
  children: React.ReactNode;
}

export default function EnquireLink({
  serviceTitle = "Shaadi & Vivaah",
  className = "",
  children,
}: EnquireLinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (typeof window === "undefined") return;

    window.dispatchEvent(
      new CustomEvent("marwar:open-inquiry-modal", { detail: serviceTitle })
    );
    window.dispatchEvent(
      new CustomEvent("marwar:select-service", { detail: serviceTitle })
    );
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`cursor-pointer ${className}`}
    >
      {children}
    </button>
  );
}
