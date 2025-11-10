// components/layout/Footer.jsx
export default function Footer() {
  return (
    <footer className="mt-20 border-t border-[(--ink-900-06)]">
      <div className="container-px mx-auto py-10 text-sm text-[(--ink-700)]">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <p>
            © {new Date().getFullYear()}{" "}
            {process.env.NEXT_PUBLIC_APP_NAME || "Wellvix"}.
          </p>
          <nav className="flex gap-4">
            <a href="/legal/terms" className="hover:opacity-80">
              Terms
            </a>
            <a href="/legal/privacy" className="hover:opacity-80">
              Privacy
            </a>
            <a href="/legal/refund" className="hover:opacity-80">
              Refunds
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
