import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="bg-[#0f0f0f] text-white">
      <div className="mx-auto grid min-h-[calc(100vh-56px)] max-w-[1500px] grid-cols-1 gap-8 px-4 py-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-6">
        <div className="flex flex-col justify-center">
          <div className="mb-5 inline-flex w-fit items-center gap-2 rounded border border-zinc-800 bg-[#1a1a1a] px-3 py-2 text-sm text-zinc-300">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            Online judge, contests, discussions and submissions
          </div>

          <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-normal text-white md:text-6xl">
            Practice coding like a real interview workspace.
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-400">
            JudgeX connects your backend problem bank, authenticated submissions,
            contest registration, leaderboards and community discussions into one
            focused coding platform.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/problems"
              className="rounded bg-yellow-500 px-5 py-3 font-semibold text-black transition hover:bg-yellow-400"
            >
              Start Solving
            </Link>
            <Link
              to="/contests"
              className="rounded border border-zinc-700 px-5 py-3 font-semibold text-zinc-100 transition hover:border-zinc-500 hover:bg-zinc-900"
            >
              View Contests
            </Link>
          </div>

          <div className="mt-10 grid max-w-2xl grid-cols-3 divide-x divide-zinc-800 rounded border border-zinc-800 bg-[#151515]">
            <div className="p-4">
              <p className="text-2xl font-semibold">4</p>
              <p className="mt-1 text-sm text-zinc-500">Languages</p>
            </div>
            <div className="p-4">
              <p className="text-2xl font-semibold">Live</p>
              <p className="mt-1 text-sm text-zinc-500">Judge Queue</p>
            </div>
            <div className="p-4">
              <p className="text-2xl font-semibold">RBAC</p>
              <p className="mt-1 text-sm text-zinc-500">Auth Backend</p>
            </div>
          </div>
        </div>

        <div className="flex items-center">
          <div className="w-full overflow-hidden rounded border border-zinc-800 bg-[#1a1a1a] shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-500" />
                <span className="h-3 w-3 rounded-full bg-yellow-500" />
                <span className="h-3 w-3 rounded-full bg-green-500" />
              </div>
              <span className="font-mono text-sm text-zinc-500">two-sum.js</span>
              <span className="rounded bg-green-500/10 px-2 py-1 text-xs font-medium text-green-400">
                Accepted
              </span>
            </div>

            <div className="grid lg:grid-cols-[1fr_260px]">
              <pre className="overflow-x-auto p-5 text-sm leading-7 text-zinc-300">
{`function twoSum(nums, target) {
  const seen = new Map();

  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (seen.has(diff)) return [seen.get(diff), i];
    seen.set(nums[i], i);
  }
}`}
              </pre>
              <div className="border-t border-zinc-800 bg-[#111111] p-4 lg:border-l lg:border-t-0">
                <p className="text-sm font-medium text-zinc-300">Submission Result</p>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Runtime</span>
                    <span className="text-green-400">64 ms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Memory</span>
                    <span className="text-green-400">42.1 MB</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Tests</span>
                    <span className="text-green-400">57 / 57</span>
                  </div>
                </div>
                <Link
                  to="/problems"
                  className="mt-6 block rounded bg-zinc-800 px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-zinc-700"
                >
                  Open Problem Set
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
