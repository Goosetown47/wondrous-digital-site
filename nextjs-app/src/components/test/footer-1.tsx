'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function Footer1() {
  const footerLinks = {
    product: [
      { label: 'Overview', href: '#' },
      { label: 'Pricing', href: '#' },
      { label: 'Marketplace', href: '#' },
      { label: 'Features', href: '#' },
      { label: 'Integrations', href: '#' },
    ],
    company: [
      { label: 'About', href: '#' },
      { label: 'Team', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Contact', href: '#' },
      { label: 'Privacy', href: '#' },
    ],
    resources: [
      { label: 'Help', href: '#' },
      { label: 'Sales', href: '#' },
      { label: 'Advertise', href: '#' },
    ],
    social: [
      { label: 'Twitter', href: '#' },
      { label: 'Instagram', href: '#' },
      { label: 'LinkedIn', href: '#' },
    ],
  };

  return (
    <footer className="w-full bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="flex flex-col md:flex-row justify-between gap-8 mb-8">
          {/* Logo and Tagline */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Image
                src="/images/Branding/Wondrous_W_100x100.png"
                alt="Logo"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <span className="text-lg font-semibold text-gray-900">
                Business Name
              </span>
            </Link>
            <p className="text-sm text-gray-900 font-medium">
              Components made easy.
            </p>
          </div>

          {/* Link Columns */}
          <div className="flex flex-col md:flex-row gap-8 md:gap-28">
            {/* Product Column */}
            <div>
            <h3 className="font-semibold text-sm text-gray-900 mb-4">
              Product
            </h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="font-semibold text-sm text-gray-900 mb-4">
              Company
            </h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Column */}
          <div>
            <h3 className="font-semibold text-sm text-gray-900 mb-4">
              Resources
            </h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

            {/* Social Column */}
            <div>
              <h3 className="font-semibold text-sm text-gray-900 mb-4">
                Social
              </h3>
              <ul className="space-y-2">
                {footerLinks.social.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Copyright Bar */}
        <div className="pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600">
              © 2024 Business Name. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="#"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Terms and Conditions
              </Link>
              <Link
                href="#"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
