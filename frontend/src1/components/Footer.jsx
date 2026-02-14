const Footer = () => {
  return (
    <footer className="bg-stone-200 px-8 py-6">
      <ul className="flex justify-center gap-6 text-sm text-slate-600">
        <li>
          <a href="#" className="hover:text-slate-900 transition">
            Help 
          </a>
        </li>
        <li>
          <a href="#" className="hover:text-slate-900 transition">
            Privacy Policy
          </a>
        </li>
        <li>
          <a href="#" className="hover:text-slate-900 transition">
            Terms and Conditions
          </a>
        </li>
      </ul>
    </footer>
  );
};

export default Footer;
