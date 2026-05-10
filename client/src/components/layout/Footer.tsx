export default function Footer() {
  return (
    <footer
      className="mt-20 px-10 pt-10 pb-6"
      style={{
        background: "#14243d",
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div className="flex flex-col gap-3 col-span-2 md:col-span-1">
            <span
              className="text-xl font-bold"
              style={{ fontFamily: "'MuseoModerno', cursive" }}
            >
              <span className="text-[#00c8f0]">C</span>
              <span className="text-white">Lingo</span>
            </span>
            <p className="text-slate-500 text-xs leading-relaxed">
              Make Coding Your Playground
            </p>
          </div>

          {/* Help */}
          <div className="flex flex-col gap-3">
            <p className="text-white text-sm font-semibold">Help</p>
            <div className="flex flex-col gap-2">
              {["Privacy Policy", "About Your Account", "Lingo Guide"].map(
                (item) => (
                  <span
                    key={item}
                    className="text-slate-500 text-xs cursor-not-allowed select-none"
                  >
                    {item}
                  </span>
                ),
              )}
            </div>
          </div>

          {/* CLingo */}
          <div className="flex flex-col gap-3">
            <p className="text-white text-sm font-semibold">CLingo</p>
            <div className="flex flex-col gap-2">
              {["About Us", "Sponsorship"].map((item) => (
                <span
                  key={item}
                  className="text-slate-500 text-xs cursor-not-allowed select-none"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-3">
            <p className="text-white text-sm font-semibold">Contact Us</p>
            <a
              href="mailto:clingo@gmail.com"
              className="text-slate-400 text-xs hover:text-[#00c8f0] transition-colors flex items-center gap-1.5"
            >
              ✉ clingo@gmail.com
            </a>
            <p className="text-slate-500 text-xs">Every Day | 7/24</p>
            <p className="text-slate-500 text-xs">
              8:00 AM – 10:00 PM (Social Media)
            </p>
          </div>
        </div>

        {/* Bottom */}
        <div
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
          className="pt-5 text-center"
        >
          <p className="text-slate-600 text-xs">
            Copyright © 2026 CLingo. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
