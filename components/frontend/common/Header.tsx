'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'

export default function Header() {
  const pathname = usePathname()
  const [activeLink, setActiveLink] = useState<string>(pathname)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false)

  // Update activeLink when pathname changes
  useEffect(() => {
    setActiveLink(pathname)
  }, [pathname])

  // Hide scrollbar when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

  const handleLinkClick = (path: string) => {
    setActiveLink(path)
    setIsMobileMenuOpen(false)
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev)
  }

  return (
    <header className=' z-50 relative'>
      {/* Top Utility Bar */}
      {/* <div
        className="py-2 z-20 hidden md:block"
        style={{
          background:
            "linear-gradient(90deg, rgb(27, 43, 28) 0%, rgb(33, 30, 32) 18.41%, rgb(33, 30, 32) 82.15%, rgb(27, 43, 28) 100%)",
        }}
      >
        <div className="container">
          <div className="flex items-center justify-between">
            <ul className="flex gap-3">
              <li>
                <Link
                  href="#"
                  className="flex items-center justify-center w-6 h-6 transition-colors"
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 22 22"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M15.0882 5.52941C14.1755 5.52932 13.3639 5.52926 12.7087 5.61738C11.9966 5.71316 11.2775 5.93401 10.6897 6.52193C10.1019 7.10984 9.88117 7.82918 9.78548 8.54158C9.6974 9.19701 9.6974 10.0089 9.6975 10.9218V11.7855H8.91575C8.19615 11.7855 7.61282 12.369 7.61282 13.0888C7.61282 13.8085 8.19615 14.3922 8.91575 14.3922H9.6975V20.6435C9.6975 21.1379 9.6975 21.385 9.54251 21.5382C9.38751 21.6913 9.14225 21.6881 8.65172 21.6819C7.41191 21.6663 6.35757 21.6228 5.46352 21.5025C4.02858 21.3096 2.89007 20.906 1.99553 20.0111C1.101 19.1164 0.697571 17.9775 0.504643 16.5421C0.316386 15.1413 0.316396 13.3472 0.316406 11.063V10.9438C0.316396 8.65964 0.316386 6.86551 0.504643 5.46478C0.697571 4.02938 1.101 2.89052 1.99553 1.99569C2.89007 1.10087 4.02858 0.697319 5.46352 0.50434C6.86382 0.316019 8.65739 0.31603 10.9408 0.31604H11.0601C13.3435 0.31603 15.1371 0.316019 16.5374 0.50434C17.9723 0.697319 19.1108 1.10087 20.0054 1.99569C20.8999 2.89052 21.3033 4.02937 21.4962 5.46478C21.6845 6.86551 21.6845 8.65965 21.6845 10.9438V11.0631C21.6845 13.3472 21.6845 15.1413 21.4962 16.5421C21.3033 17.9775 20.8999 19.1164 20.0054 20.0111C19.1108 20.906 17.9723 21.3096 16.5374 21.5025C15.6433 21.6228 14.5889 21.6663 13.3491 21.6819C12.8586 21.6881 12.6134 21.6913 12.4584 21.5382C12.3034 21.385 12.3034 21.1379 12.3034 20.6435V14.3922H14.1275C14.8471 14.3922 15.4304 13.8085 15.4304 13.0888C15.4304 12.369 14.8471 11.7855 14.1275 11.7855H12.3034V11.0034C12.3034 9.98356 12.3062 9.34971 12.3681 8.88891C12.424 8.47298 12.5065 8.39082 12.5311 8.36639L12.5324 8.36514L12.5336 8.36387C12.558 8.33932 12.6401 8.25673 13.0559 8.20081C13.5167 8.13885 14.1503 8.13609 15.1698 8.13609H16.2122C16.9318 8.13609 17.5151 7.55257 17.5151 6.83274C17.5151 6.11293 16.9318 5.52941 16.2122 5.52941H15.0882Z"
                      fill="white"
                    />
                  </svg>
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="flex items-center justify-center w-6 h-6 transition-colors"
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 22 22"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M10.9408 0.315918H11.0601C13.3435 0.315908 15.1371 0.315897 16.5374 0.504155C17.9723 0.697083 19.1108 1.1005 20.0054 1.99504C20.8999 2.88958 21.3033 4.02809 21.4962 5.46304C21.6845 6.86334 21.6845 8.6569 21.6845 10.9403V11.0596C21.6845 13.343 21.6845 15.1366 21.4962 16.5369C21.3033 17.9718 20.8999 19.1103 20.0054 20.0049C19.1108 20.8994 17.9723 21.3028 16.5374 21.4957C15.1371 21.684 13.3435 21.684 11.0601 21.684H10.9408C8.65735 21.684 6.86383 21.684 5.46352 21.4957C4.02858 21.3028 2.89007 20.8994 1.99553 20.0049C1.101 19.1103 0.697571 17.9718 0.504643 16.5369C0.316386 15.1366 0.316396 13.343 0.316406 11.0596V10.9403C0.316396 8.65687 0.316386 6.86334 0.504643 5.46304C0.697571 4.02809 1.101 2.88958 1.99553 1.99504C2.89007 1.1005 4.02858 0.697083 5.46352 0.504155C6.86382 0.315897 8.65739 0.315908 10.9408 0.315918ZM6.83309 9.43643C6.83309 8.86075 6.36642 8.39409 5.79075 8.39409C5.21508 8.39409 4.7484 8.86075 4.7484 9.43643V16.2117C4.7484 16.7874 5.21508 17.254 5.79075 17.254C6.36642 17.254 6.83309 16.7874 6.83309 16.2117V9.43643ZM9.96018 7.87291C10.3826 7.87291 10.7465 8.12433 10.9102 8.48572C11.5438 8.09702 12.2893 7.87291 13.0872 7.87291C15.3899 7.87291 17.2566 9.73965 17.2566 12.0423V16.2117C17.2566 16.7874 16.7898 17.254 16.2142 17.254C15.6386 17.254 15.1719 16.7874 15.1719 16.2117V12.0423C15.1719 10.8909 14.2385 9.9576 13.0872 9.9576C11.9358 9.9576 11.0025 10.8909 11.0025 12.0423V16.2117C11.0025 16.7874 10.5358 17.254 9.96018 17.254C9.38449 17.254 8.91783 16.7874 8.91783 16.2117V8.91526C8.91783 8.33958 9.38449 7.87291 9.96018 7.87291ZM7.10183 5.78823C7.10183 6.50782 6.51848 7.09116 5.7989 7.09116H5.78953C5.06994 7.09116 4.4866 6.50782 4.4866 5.78823C4.4866 5.06863 5.06994 4.4853 5.78953 4.4853H5.7989C6.51848 4.4853 7.10183 5.06863 7.10183 5.78823Z"
                      fill="white"
                    />
                  </svg>
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="flex items-center justify-center w-6 h-6 transition-colors"
                >
                  <svg
                    width="22"
                    height="18"
                    viewBox="0 0 22 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M11.0003 0.086792C8.48047 0.086792 6.08331 0.249389 3.91814 0.542811C1.61319 0.85516 0.0498047 2.88029 0.0498047 5.12777V12.8722C0.0498047 15.1196 1.61319 17.1448 3.91814 17.4571C6.08331 17.7506 8.48047 17.9132 11.0003 17.9132C13.5201 17.9132 15.9173 17.7506 18.0825 17.4571C20.3874 17.1448 21.9508 15.1196 21.9508 12.8722V5.12778C21.9508 2.88029 20.3874 0.85516 18.0825 0.542811C15.9173 0.249389 13.5201 0.086792 11.0003 0.086792ZM9.35609 5.28892C9.12007 5.14731 8.8261 5.1436 8.58659 5.27921C8.34706 5.41482 8.19901 5.66879 8.19901 5.94403V12.0559C8.19901 12.3312 8.34706 12.5851 8.58659 12.7207C8.8261 12.8564 9.12007 12.8526 9.35609 12.711L14.4493 9.65508C14.6795 9.51705 14.8202 9.2683 14.8202 8.99999C14.8202 8.73167 14.6795 8.48292 14.4493 8.34489L9.35609 5.28892Z"
                      fill="white"
                    />
                  </svg>
                </Link>
              </li>
            </ul>
            <div className="flex items-center gap-5">
              <button className="flex items-center gap-1.5 bg-transparent text-white border border-border/20 p-2 rounded text-sm hover:bg-primary-foreground/10 font-medium transition-all cursor-pointer">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M10.0001 1.9375C7.13056 1.9375 4.39281 3.63477 3.24688 6.31351C2.18041 8.80645 2.75774 10.928 3.95981 12.7446C4.94535 14.234 6.38279 15.5633 7.67959 16.7626L7.6802 16.7631C7.92728 16.9916 8.16926 17.2154 8.40202 17.4347L8.40326 17.4359C8.8345 17.8396 9.40742 18.0625 10.0001 18.0625C10.5929 18.0625 11.1659 17.8396 11.5971 17.4358C11.8173 17.2297 12.0455 17.0194 12.2783 16.8049C13.5892 15.597 15.0468 14.254 16.0427 12.7457C17.2434 10.9271 17.8186 8.80338 16.7535 6.31351C15.6075 3.63477 12.8698 1.9375 10.0001 1.9375ZM9.99902 6.25C8.34217 6.25 6.99902 7.59315 6.99902 9.25C6.99902 10.9068 8.34217 12.25 9.99902 12.25C11.6558 12.25 12.999 10.9068 12.999 9.25C12.999 7.59315 11.6558 6.25 9.99902 6.25Z"
                    fill="white"
                  />
                </svg>
                Find Location
              </button>
              <button className="flex items-center gap-1.5 text-white text-sm hover:text-primary transition-colors bg-transparent border-none font-medium cursor-pointer">
                <span>Get Local Services</span>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M15 7.50004C15 7.50004 11.3176 12.5 10 12.5C8.68233 12.5 5 7.5 5 7.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div> */}

      {/* Main Navigation Bar */}
      <div className='py-2 lg:py-3 bg-[#272727] z-10'>
        <div className='container'>
          <div className='flex items-center justify-between'>
            <Link href='/' className='block h-12 lg:h-[75px] w-auto relative z-10'>
              <Image
                fill
                src='/images/header-logo.webp'
                alt='The Pothole Doctors Logo'
                className='h-full w-full !relative'
              />
              {/* Gradient background with border effect */}
              <span className='absolute top-2 right-0 lg:right-[-100px] w-screen sm:w-[50vw] h-full -z-10 bg-gradient-to-l from-[#53aa57] from-[29.75%] to-[#dcfaa2] to-[100%] skew-x-[-40deg] scale-y-[1.7] lg:scale-y-[1.5]'>
                <span
                  className='absolute top-0 right-0 w-screen sm:w-[50vw] h-full -z-10 pointer-events-none scale-y-90'
                  style={
                    {
                      WebkitMaskImage:
                        'linear-gradient(white, transparent) content-box, linear-gradient(white, transparent)',
                      WebkitMaskComposite: 'xor',
                      maskImage: 'linear-gradient(white, transparent) content-box, linear-gradient(white, transparent)',
                      maskComposite: 'exclude',
                      padding: '7px',
                      boxSizing: 'border-box'
                    } as React.CSSProperties
                  }
                >
                  <span
                    className='block w-full h-full bg-gradient-to-l from-[#ffffff] from-[29.75%] to-[#e0160f] to-[100%] scale-y-[1.2]'
                    style={
                      {
                        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                        WebkitMaskComposite: 'xor',
                        mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                        maskComposite: 'exclude'
                      } as React.CSSProperties
                    }
                  />
                </span>
              </span>
            </Link>

            {/* Desktop Navigation - Hidden on Mobile */}
            <div className='hidden md:flex items-center gap-8'>
              <nav>
                <ul className='flex items-center gap-8'>
                  <li>
                    <Link
                      href='/'
                      onClick={() => handleLinkClick('/')}
                      className={`text-sm font-medium transition-colors relative py-2
                      before:absolute before:bottom-0 before:left-0 before:w-full before:h-[2px] before:bg-primary before:transition-all before:duration-300 after:absolute after:top-1/2 after:left-1/2 after:h-[70px] lg:after:h-[100px] after:bg-white/5 after:skew-x-[-27deg] lg:after:skew-x-[-30deg] after:translate-x-[-50%] after:translate-y-[-50%] after:transition-all after:duration-300 after:ease-in-out
                      ${
                        activeLink === '/'
                          ? 'text-primary before:opacity-100 before:scale-x-100 after:w-[225%] after:opacity-100'
                          : 'text-white hover:text-primary before:opacity-0 before:scale-x-0 hover:before:opacity-100 hover:before:scale-x-100 after:w-0 after:opacity-0'
                      }`}
                    >
                      HOME
                    </Link>
                  </li>
                  <li>
                    <Link
                      href='/about'
                      onClick={() => handleLinkClick('/about')}
                      className={`text-sm font-medium transition-colors relative py-2
                      before:absolute before:bottom-0 before:left-0 before:w-full before:h-[2px] before:bg-primary before:transition-all before:duration-300
                      ${
                        activeLink === '/about'
                          ? 'text-primary before:opacity-100 before:scale-x-100 after:absolute after:top-1/2 after:left-1/2 after:w-[150%] after:h-[70px] lg:after:h-[100px] after:bg-white/5 after:skew-x-[-27deg] lg:after:skew-x-[-30deg] after:translate-[-50%]'
                          : 'text-white hover:text-primary before:opacity-0 before:scale-x-0 hover:before:opacity-100 hover:before:scale-x-100'
                      }`}
                    >
                      ABOUT US
                    </Link>
                  </li>
                  <li>
                    <Link
                      href='/contact'
                      onClick={() => handleLinkClick('/contact')}
                      className={`text-sm font-medium transition-colors relative py-2
                      before:absolute before:bottom-0 before:left-0 before:w-full before:h-[2px] before:bg-primary before:transition-all before:duration-300
                      ${
                        activeLink === '/contact'
                          ? 'text-primary before:opacity-100 before:scale-x-100 after:absolute after:top-1/2 after:left-1/2 after:w-[150%] after:h-[70px] lg:after:h-[100px] after:bg-white/5 after:skew-x-[-27deg] lg:after:skew-x-[-30deg] after:translate-[-50%]'
                          : 'text-white hover:text-primary before:opacity-0 before:scale-x-0 hover:before:opacity-100 hover:before:scale-x-100'
                      }`}
                    >
                      CONTACT
                    </Link>
                  </li>
                </ul>
              </nav>
              {/* <Link
                href="/login"
                className="text-title py-2.5 px-4 lg:py-4 lg:px-5 text-sm rounded-lg font-semibold tracking-wide hover:text-white transition-colors bg-white hover:bg-primary"
              >
                LOG IN
              </Link> */}
            </div>

            {/* Mobile Menu Button - Visible only on Mobile */}
            <button
              onClick={toggleMobileMenu}
              className='md:hidden flex flex-col justify-center items-center w-8 h-8 text-white hover:text-primary transition-colors cursor-pointer z-[100]'
              aria-label='Toggle mobile menu'
            >
              <span
                className={`block w-6 h-0.5 bg-current transition-all duration-300 ${
                  isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''
                }`}
              ></span>
              <span
                className={`block w-6 h-0.5 bg-current transition-all duration-300 mt-1 ${
                  isMobileMenuOpen ? 'opacity-0' : ''
                }`}
              ></span>
              <span
                className={`block w-6 h-0.5 bg-current transition-all duration-300 mt-1 ${
                  isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''
                }`}
              ></span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && <div className='fixed inset-0 bg-black/50 z-40 md:hidden' onClick={toggleMobileMenu}></div>}

      {/* Mobile Side Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-[#272727] z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className='flex flex-col h-full'>
          {/* Mobile Menu Header */}
          {/* <div className="flex items-center justify-between p-6 border-b border-white/10">
            <button
              onClick={toggleMobileMenu}
              className="text-white hover:text-primary transition-colors cursor-pointer ml-auto"
              aria-label="Close mobile menu"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18 6L6 18M6 6L18 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div> */}

          {/* Mobile Navigation */}
          <nav className='flex-1 p-6'>
            {/* <button
              onClick={toggleMobileMenu}
              className="text-white hover:text-red-500 transition-colors cursor-pointer ml-auto block"
              aria-label="Close mobile menu"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18 6L6 18M6 6L18 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button> */}
            <ul className='pt-4'>
              <li>
                <Link
                  href='/'
                  onClick={() => handleLinkClick('/')}
                  className={`block text-base font-medium transition-colors py-4 border-b border-white/10
                  ${activeLink === '/' ? 'text-primary' : 'text-white hover:text-primary'}`}
                >
                  HOME
                </Link>
              </li>
              <li>
                <Link
                  href='/about'
                  onClick={() => handleLinkClick('/about')}
                  className={`block text-base font-medium transition-colors py-4 border-b border-white/10
                  ${activeLink === '/about' ? 'text-primary' : 'text-white hover:text-primary'}`}
                >
                  ABOUT US
                </Link>
              </li>
              <li>
                <Link
                  href='/contact'
                  onClick={() => handleLinkClick('/contact')}
                  className={`block text-base font-medium transition-colors py-4 border-b border-white/10
                  ${activeLink === '/contact' ? 'text-primary' : 'text-white hover:text-primary'}`}
                >
                  CONTACT
                </Link>
              </li>
              <li>
                <Link
                  href='/location'
                  onClick={() => handleLinkClick('/location')}
                  className={`block text-base font-medium transition-colors py-4 border-b border-white/10
                  ${activeLink === '/location' ? 'text-primary' : 'text-white hover:text-primary'}`}
                >
                  LOCATION
                </Link>
              </li>
            </ul>
          </nav>

          {/* Mobile Menu Footer with Login Button */}
          <div className='p-6 border-t border-white/10'>
            <Link
              href='/login'
              onClick={() => setIsMobileMenuOpen(false)}
              className='block w-full text-center py-3 sm:py-4 px-6 text-sm rounded-lg font-semibold tracking-wide text-white bg-primary hover:bg-primary/85 transition-colors'
            >
              LOG IN
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
