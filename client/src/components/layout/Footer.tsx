export default function Footer() {
  return (
    <footer className="mt-28 bg-[#26384f] px-6 pt-16 sm:px-10">
      <div className="mx-auto grid max-w-6xl gap-10 pb-14 md:grid-cols-[1fr_auto]">
        <div>
          <span
            className="text-3xl font-extrabold tracking-tight"
            style={{ fontFamily: "'MuseoModerno', cursive" }}
          >
            <span className="text-[#23d7ff]">C</span>
            <span className="text-white">linggo</span>
          </span>
          <p className="mt-2 text-xs font-semibold text-white">
            Make Coding Your Playground
          </p>
        </div>

        <div className="md:text-right">
          <p className="text-sm font-bold text-white">Contact Us</p>
          <a
            href="mailto:clingo@gmail.com"
            className="mt-3 block text-sm text-white/80 transition-colors hover:text-[#23d7ff]"
          >
            clingo@gmail.com
          </a>
        </div>
      </div>

      <div className="border-t border-white/15 py-5 text-center">
        <p className="text-xs text-white/70">
          Copyright 2026 CLinggo. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
