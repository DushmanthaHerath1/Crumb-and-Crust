const footerLinks = [
  { label: "Location", value: "Fitzroy, Melbourne" },
  { label: "Hours", value: "Open Daily 7am - 3pm" },
  {
    label: "Connect",
    value: "Contact Us",
    isLink: true,
    linkValue: "location",
  },
];

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/10 bg-surface-container-lowest px-5 py-12 md:px-20">
      <div className="flex flex-col items-center gap-8">
        <div className="text-primary font-heading text-2xl font-bold tracking-wide">
          Crumb & Crust
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-6 sm:gap-12">
          {footerLinks.map((item) => (
            <div key={item.label} className="flex flex-col items-center gap-2">
              <span className="text-label-caps text-primary">{item.label}</span>
              {item.isLink ? (
                <a
                  href={`/#${item.linkValue}`}
                  className="text-base text-on-surface-variant hover:text-primary transition-colors"
                >
                  {item.value}
                </a>
              ) : (
                <span className="text-base text-on-surface-variant">
                  {item.value}
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="w-full border-t border-white/5 pt-8 text-center">
          <p className="text-sm text-on-surface-variant">
            © 2026 Crumb & Crust. Artisanal Melbourne Bakery.
          </p>
        </div>
      </div>
    </footer>
  );
}
