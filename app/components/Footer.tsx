export default function Footer() {
  return (
    <footer className="w-full py-12 bg-surface-container-low border-t border-outline-variant">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 px-5 lg:px-20 max-w-[1440px] mx-auto">
        <div className="flex flex-col gap-6">
          <span className="font-display text-2xl text-on-surface">Lumière</span>
          <p className="text-on-surface-variant max-w-xs">
            The world&apos;s premier platform for luxury beauty fulfillment and
            verified sourcing.
          </p>
          <div className="flex gap-4">
            <a
              className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors"
              href="#"
            >
              public
            </a>
            <a
              className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors"
              href="#"
            >
              hub
            </a>
            <a
              className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors"
              href="#"
            >
              support_agent
            </a>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <span className="text-xs font-semibold tracking-[0.1em] uppercase text-primary mb-2">
            Company
          </span>
          <a
            className="text-on-surface-variant hover:text-primary underline-offset-4 hover:underline transition-all"
            href="#"
          >
            About Us
          </a>
          <a
            className="text-on-surface-variant hover:text-primary underline-offset-4 hover:underline transition-all"
            href="#"
          >
            Sustainability
          </a>
          <a
            className="text-on-surface-variant hover:text-primary underline-offset-4 hover:underline transition-all"
            href="#"
          >
            Careers
          </a>
          <a
            className="text-on-surface-variant hover:text-primary underline-offset-4 hover:underline transition-all"
            href="#"
          >
            Press
          </a>
        </div>
        <div className="flex flex-col gap-4">
          <span className="text-xs font-semibold tracking-[0.1em] uppercase text-primary mb-2">
            Help Center
          </span>
          <a
            className="text-on-surface-variant hover:text-primary underline-offset-4 hover:underline transition-all"
            href="#"
          >
            Shipping &amp; Returns
          </a>
          <a
            className="text-on-surface-variant hover:text-primary underline-offset-4 hover:underline transition-all"
            href="#"
          >
            Authenticity Guarantee
          </a>
          <a
            className="text-on-surface-variant hover:text-primary underline-offset-4 hover:underline transition-all"
            href="#"
          >
            Supplier Terms
          </a>
          <a
            className="text-on-surface-variant hover:text-primary underline-offset-4 hover:underline transition-all"
            href="#"
          >
            Privacy Policy
          </a>
        </div>
        <div className="flex flex-col gap-6">
          <span className="text-xs font-semibold tracking-[0.1em] uppercase text-primary">
            Join Our Newsletter
          </span>
          <p className="text-on-surface-variant">
            Exclusive drops and industry insights.
          </p>
          <div className="flex border-b border-outline py-2">
            <input
              className="bg-transparent border-none focus:ring-0 w-full placeholder:text-on-surface-variant"
              placeholder="Email Address"
              type="email"
            />
            <button className="material-symbols-outlined text-primary">
              arrow_forward
            </button>
          </div>
        </div>
      </div>
      <div className="mt-20 pt-8 border-t border-outline-variant/30 px-5 lg:px-20 max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">
          © 2026 Lumière Beauty. All rights reserved.
        </p>
        <div className="flex gap-8">
          <a
            className="text-[10px] text-on-surface-variant hover:text-primary transition-colors"
            href="#"
          >
            Terms
          </a>
          <a
            className="text-[10px] text-on-surface-variant hover:text-primary transition-colors"
            href="#"
          >
            Privacy
          </a>
          <a
            className="text-[10px] text-on-surface-variant hover:text-primary transition-colors"
            href="#"
          >
            Cookies
          </a>
        </div>
      </div>
    </footer>
  );
}
