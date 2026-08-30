import { MessageCircle } from "lucide-react";

export function WhatsAppButton({ number }: { number?: string | null }) {
  if (!number) return null;
  const digits = number.replace(/[^\d]/g, "");
  return (
    <a
      href={`https://wa.me/${digits}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with AMARC on WhatsApp"
      className="fixed right-5 bottom-5 z-40 flex h-13 w-13 items-center justify-center rounded-full bg-amber p-3.5 text-primary-foreground shadow-lg transition-transform hover:scale-105"
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  );
}
