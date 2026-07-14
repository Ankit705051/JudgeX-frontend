import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/auth.context.jsx";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navClass = ({ isActive }) =>
    `px-3 py-2 text-sm font-medium transition ${
      isActive
        ? "text-white"
        : "text-zinc-400 hover:text-white"
    }`;

  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-800 bg-[#111111]/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1500px] items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded bg-yellow-500">
              <span className="text-base font-black text-black">{`{}`}</span>
            </div>
            <h1 className="text-xl font-bold tracking-normal text-white">
              Judge<span className="text-gray-300">X</span>
            </h1>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            <NavLink
              to="/problems"
              className={navClass}
            >
              Problems
            </NavLink>

            <NavLink
              to="/submissions"
              className={navClass}
            >
              Submissions
            </NavLink>

            <NavLink
              to="/contests"
              className={navClass}
            >
              Contests
            </NavLink>

            <NavLink
              to="/discuss"
              className={navClass}
            >
              Discuss
            </NavLink>

            {user?.role === "admin" && (
              <NavLink
                to="/admin"
                className={navClass}
              >
                Admin
              </NavLink>
            )}

            <NavLink
              to="/interview"
              className={navClass}
            >
              Interview
            </NavLink>

            <NavLink
              to="/pricing"
              className={navClass}
            >
              Premium
            </NavLink>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <NavLink
                to="/profile"
                className="flex items-center gap-2 text-sm font-medium text-zinc-300 transition hover:text-white"
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt="Profile"
                    className="h-8 w-8 rounded-full object-cover border-2 border-zinc-700 hover:border-zinc-500 transition"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-300 border-2 border-zinc-700 hover:border-zinc-500 transition">
                    {(user.name || user.userName || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
              </NavLink>
              <button
                type="button"
                onClick={logout}
                className="rounded border border-zinc-700 px-3 py-2 text-sm text-zinc-300 transition hover:border-zinc-500 hover:text-white"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-zinc-300 transition hover:text-white"
              >
                Sign in
              </Link>

              <Link
                to="/register"
                className="rounded bg-yellow-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-yellow-400"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
