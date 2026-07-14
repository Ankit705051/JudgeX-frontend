const features = [
  {
    icon: "⚡",
    title: "In-browser IDE",
    description:
      "Syntax highlighting, autocomplete, and multi-language support — no setup required.",
  },
  {
    icon: "✓",
    title: "Instant Judge",
    description:
      "Sub-second verdicts against thousands of test cases and edge conditions.",
  },
  {
    icon: "◆",
    title: "Interview Tracks",
    description:
      "Curated paths for Google, Meta, Amazon, and 180+ top companies.",
  },
  {
    icon: "✦",
    title: "AI Hints",
    description:
      "Stuck? Get context-aware nudges that teach the pattern — never the answer.",
  },
  {
    icon: "◉",
    title: "Mock Interviews",
    description:
      "Pair up with peers or our AI interviewer to simulate the real thing.",
  },
  {
    icon: "▲",
    title: "Progress Analytics",
    description:
      "Track strengths, weaknesses, and streaks across every topic and difficulty.",
  },
];

const Features = () => {
  return (
    <section className="bg-[#050B14] py-24">
      <div className="max-w-7xl mx-auto px-6">

        {/* Heading */}
        <div className="text-center mb-16">
          <p className="text-yellow-500 font-semibold mb-3">
            Why JudgeX
          </p>

          <h2 className="text-4xl md:text-5xl font-bold text-white">
            Everything you need to land the offer
          </h2>

          <p className="text-slate-400 mt-4 max-w-2xl mx-auto">
            Built by engineers who've sat on both sides of the whiteboard.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-[#0B1220] border border-slate-800 rounded-2xl p-6 hover:border-yellow-500/50 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-yellow-500/70 flex items-center justify-center text-2xl mb-5">
                {feature.icon}
              </div>

              <h3 className="text-xl font-semibold text-white mb-3">
                {feature.title}
              </h3>

              <p className="text-slate-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Features;