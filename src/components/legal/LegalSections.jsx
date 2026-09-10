export default function LegalSections({ sections }) {
  return (
    <div className="space-y-5 md:space-y-6">
      {sections.map((section, index) => (
        <div
          key={section.title}
          className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-colors duration-300 hover:border-amber-500/30 md:p-8"
        >
          <h2 className="font-heading text-2xl font-semibold text-white md:text-3xl">
            <span className="text-amber-400">{index + 1}.</span>{" "}
            {section.title}
          </h2>

          {section.paragraphs?.map((paragraph, i) => (
            <p key={i} className="mt-4 leading-relaxed text-zinc-400">
              {paragraph}
            </p>
          ))}

          {section.list && (
            <ul className="mt-4 space-y-2.5">
              {section.list.map((item, i) => (
                <li key={i} className="flex gap-3 text-zinc-400">
                  <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          )}

          {section.paragraphsAfter?.map((paragraph, i) => (
            <p key={i} className="mt-4 leading-relaxed text-zinc-400">
              {paragraph}
            </p>
          ))}
        </div>
      ))}
    </div>
  );
}
