import { Link } from "react-router-dom";
import { ShoppingBasket } from "lucide-react";
import { footerData } from "../assets/assets";

export default function Footer() {
  return (
    <footer className="bg-app-green text-white">
      <div className="mx-auto w-full max-w-[1280px] px-8 py-12">
        <div className="flex flex-col gap-10 lg:flex-row lg:justify-between lg:gap-8">
          <div className="max-w-[280px] space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <ShoppingBasket className="size-6" />
              <span className="text-xl font-semibold">Daily Basket</span>
            </Link>
            <p className="text-sm leading-5 text-white/90">{footerData.brand.description}</p>
            <div className="flex items-center gap-3">
              {footerData.brand.socials.map((social, index) => (
                <a
                  key={index}
                  href={social.link}
                  className="flex size-9 items-center justify-center rounded-lg bg-white text-app-green transition hover:bg-app-orange-light"
                >
                  <social.icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {footerData.sections.map((section) => (
            <div key={section.title} className="space-y-4">
              <h3 className="text-sm font-semibold">{section.title}</h3>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {"to" in link && link.to ? (
                      <Link to={link.to} className="text-sm text-white/90 hover:text-app-orange-light">
                        {link.label}
                      </Link>
                    ) : (
                      <a href={link.href} className="text-sm text-white/90 hover:text-app-orange-light">
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Contact Us</h3>
            <ul className="space-y-3">
              {footerData.contact.map((item) => (
                <li key={item.text} className="flex items-center gap-3">
                  <item.icon className="size-4 shrink-0" />
                  <span className="text-sm text-white/90">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/20 pt-6 sm:flex-row">
          <p className="text-xs text-white/90">{footerData.bottom.copyright}</p>
          <div className="flex items-center gap-4">
            {footerData.bottom.links.map((link) => (
              <a key={link.label} href={link.href} className="text-xs text-white/90 hover:text-white">
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
