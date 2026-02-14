import { Link, NavLink } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-[50vh] bg-stone-200 flex items-center  ">
        <div className="mx-120 max-w-6xl  ">
          
            <h1 className="mt-4  text-5xl font-extrabold leading-[1.05] tracking-tight text-black md:text-6xl">
              Monitor Your System.
             <br />
             Manage Your Operations.
              
            </h1>

            <p className="mt-5 text-base text-gray-600">
            Track performance, understand system status, and   view insights in a clean, intuitive dashboard.
            </p>

            <div className="mt-7">
              <Link
                to="/Signup"
                className="rounded-full bg-indigo-700 px-6 py-3 text-l font-bold text-white hover:bg-blue-800 transition"
              >
                Get Started
              </Link>
            </div>
          </div>

    </div>
  );
};

export default Home;
