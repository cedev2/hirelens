import Image from "next/image";
import { BiLogoInstagramAlt } from "react-icons/bi";
import { ImLinkedin2, ImYoutube, ImFacebook } from "react-icons/im";

export default function Footer() {
  const aboutLinks = [
    { label: "Companies", href: "https://hirelens.com/" },
    { label: "Terms", href: "/terms" },
    { label: "Advice", href: "/advice" },
    { label: "Privacy Policy", href: "/privacy-policy" },
  ];
  const resourceLinks = [
    { label: "Help Docs", href: "/help-docs" },
    { label: "Guide", href: "/guide" },
    { label: "Updates", href: "/updates" },
    { label: "Contact Us", href: "https://hirelens.com/" },
  ];

  const socialLinks = [
    { icon: <BiLogoInstagramAlt className="w-5 h-5" />, href: "https://hirelens.com/" },
    { icon: <ImLinkedin2 className="w-5 h-5" />, href: "https://hirelens.com/" },
    { icon: <ImFacebook className="w-5 h-5" />, href: "https://hirelens.com/" },
    { icon: <ImYoutube className="w-5 h-5" />, href: "https://hirelens.com/" },
  ];

  return (
    <footer className="bg-[#1a1a2e] text-white py-10 sm:py-14">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10">
        {/* Main grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-10 border-b border-gray-700">
          {/* Brand — spans 2 cols */}
          <div className="col-span-2 md:col-span-2">
            <Image
              src="/images/logo/logo-light.svg"
              alt="HireLens Logo"
              className="mb-3"
              width={120}
              height={36}
            />
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Great platform for job seekers passionate about startups.
              Find your dream job easier.
            </p>

            {/* Newsletter */}
            <div className="mt-6">
              <h4 className="text-sm font-semibold mb-2">Get job notifications</h4>
              <p className="text-gray-400 text-xs mb-3">
                The latest job news, articles, sent to your inbox.
              </p>
              <div className="flex max-w-sm">
                <input
                  type="email"
                  placeholder="Email Address"
                  className="flex-1 min-w-0 px-3 py-2.5 bg-white text-gray-700 text-sm outline-none placeholder-gray-400 rounded-l"
                />
                <button className="shrink-0 px-4 py-2.5 bg-[#087F5B] text-sm font-medium hover:bg-[#066B4D] transition-colors rounded-r">
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          {/* About */}
          <div>
            <h4 className="text-base font-semibold mb-4">About</h4>
            <ul className="space-y-3">
              {aboutLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-gray-400 text-sm hover:text-white transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-base font-semibold mb-4">Resources</h4>
            <ul className="space-y-3">
              {resourceLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-gray-400 text-sm hover:text-white transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 text-center sm:text-left">
          <p className="text-gray-500 text-sm">
            2026 © HireLens. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {socialLinks.map((social, index) => (
              <a key={index} href={social.href} className="text-gray-400 hover:text-white transition-colors">
                {social.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
