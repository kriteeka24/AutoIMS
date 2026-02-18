import { Link, NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <div className="sticky top-0 z-50 w-full flex justify-center bg-stone-200 caret-transparent">
      <nav className="w-[90%] max-w-7xl rounded-2xl bg-stone-200 px-8 py-4">
        <div className="flex items-center">
          <div className="flex items-center gap-8 text-sm">
            <Link
              to="/"
              className="text-3xl font-bold text-indigo-700 leading-none"
            >
              {" "}
              <div className="flex items-center">
                <img
                  src="/autoims.png"
                  alt="AutoIMS Logo"
                  className="w-16 h-16"
                />

                <span>AutoIMS</span>
              </div>
            </Link>
          </div>

          {/* Right group: Auth */}
          <div className="ml-auto flex items-center gap-4 text-sm">
            <Link
              to="/login"
              className="inline-flex items-center text-gray-700 text-xl font-bold hover:text-indigo-700 transition"
            >
              Log in
            </Link>

            <Link
              to="/signup"
              className="inline-flex items-center  text-xl font-bold  text-gray-700  hover:text-indigo-700 transition"
            >
              Sign up
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
}
