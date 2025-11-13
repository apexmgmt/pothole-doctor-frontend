import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative bg-title text-white z-10 overflow-hidden">
      <figure className="absolute inset-0 -z-10">
        <Image
          fill
          src="/images/footer-bg.webp"
          alt=""
          className="w-full h-full object-cover"
        />
      </figure>

      <div className="relative z-10 pt-10 md:pt-15 pb-4 md:pb-[30px]">
        <div className="container">
          <div className="flex flex-col-reverse lg:flex-row items-center justify-between gap-8 mb-6">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-center leading-[1.3] font-primary lg:text-left uppercase ">
              From Cracks to Cures <br className="hidden sm:inline-block" /> —
              We’ve Got You <span className="gradient-text"> Covered</span>
            </h2>
            <Link href="/" className="block h-[75px] w-auto">
              <Image
                fill
                src="/images/footer-logo.webp"
                alt="The Pothole Doctors Logo"
                className="h-full w-full !relative"
              />
            </Link>
          </div>

          {/* Footer Menu */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 border-t border-border/[.16] pt-5 md:pt-[30px] mb-5 md:mb-[30px]">
            <nav>
              <ul className="flex flex-wrap items-center justify-center gap-2.5 md:gap-4 ">
                <li>
                  <Link
                    href="/"
                    className="p-2.5 text-sm font-semibold tracking-wide hover:text-primary transition-colors"
                  >
                    HOME
                  </Link>
                </li>
                <li>
                  <Link
                    href="/services"
                    className="p-2.5 text-sm font-semibold tracking-wide hover:text-primary transition-colors"
                  >
                    SERVICES
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className="p-2.5 text-sm font-semibold tracking-wide hover:text-primary transition-colors"
                  >
                    ABOUT US
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq"
                    className="p-2.5 text-sm font-semibold tracking-wide hover:text-primary transition-colors"
                  >
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="p-2.5 text-sm font-semibold tracking-wide hover:text-primary transition-colors"
                  >
                    CONTACT
                  </Link>
                </li>
              </ul>
            </nav>

            <div className="flex items-center gap-4">
              <Link
                href="#"
                className="transition-transform hover:-translate-y-1"
              >
                <svg
                  width="19"
                  height="19"
                  viewBox="0 0 19 19"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18.8134 9.41693C18.8134 4.4464 14.6019 0.416992 9.4067 0.416992C4.21152 0.416992 0 4.4464 0 9.41693C0 13.909 3.43988 17.6324 7.9369 18.3075V12.0185H5.54848V9.41693H7.9369V7.43413C7.9369 5.17852 9.34129 3.93259 11.49 3.93259C12.5188 3.93259 13.5956 4.10837 13.5956 4.10837V6.3232H12.4095C11.241 6.3232 10.8765 7.01701 10.8765 7.72944V9.41693H13.4854L13.0683 12.0185H10.8765V18.3075C15.3735 17.6324 18.8134 13.909 18.8134 9.41693Z"
                    fill="white"
                  />
                </svg>
              </Link>
              <Link
                href="#"
                className="transition-transform hover:-translate-y-1"
              >
                <svg
                  width="20"
                  height="19"
                  viewBox="0 0 20 19"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clipPath="url(#clip0_18_2176)">
                    <path
                      d="M11.9519 8.05007L18.8509 0.469971H17.2161L11.2257 7.05167L6.4412 0.469971H0.922852L8.15795 10.4227L0.922852 18.3716H2.55778L8.88377 11.4211L13.9365 18.3716H19.4549L11.9515 8.05007H11.9519ZM9.71268 10.5103L8.97961 9.51928L3.14687 1.63328H5.65802L10.3651 7.99754L11.0982 8.9886L17.2168 17.2612H14.7057L9.71268 10.5107V10.5103Z"
                      fill="white"
                    />
                  </g>
                </svg>
              </Link>
              <Link
                href="#"
                className="transition-transform hover:-translate-y-1"
              >
                <svg
                  width="19"
                  height="19"
                  viewBox="0 0 19 19"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clipPath="url(#clip0_18_2173)">
                    <path
                      d="M9.56314 2.03768C11.9672 2.03768 12.2519 2.04823 13.1974 2.09042C14.0761 2.12909 14.5505 2.27675 14.8669 2.39979C15.2851 2.56151 15.5874 2.75838 15.9002 3.07127C16.2165 3.38768 16.4098 3.6865 16.5715 4.10486C16.6945 4.42126 16.8422 4.89938 16.8808 5.77477C16.923 6.72398 16.9335 7.00874 16.9335 9.4099C16.9335 11.8146 16.923 12.0993 16.8808 13.045C16.8422 13.9239 16.6945 14.3985 16.5715 14.7149C16.4098 15.1333 16.213 15.4356 15.9002 15.7485C15.5839 16.0649 15.2851 16.2583 14.8669 16.42C14.5505 16.5431 14.0725 16.6907 13.1974 16.7294C12.2484 16.7716 11.9637 16.7821 9.56314 16.7821C7.15907 16.7821 6.87437 16.7716 5.92891 16.7294C5.05023 16.6907 4.57574 16.5431 4.25941 16.42C3.84116 16.2583 3.53889 16.0614 3.22608 15.7485C2.90976 15.4321 2.71645 15.1333 2.55477 14.7149C2.43175 14.3985 2.28413 13.9204 2.24547 13.045C2.20329 12.0958 2.19275 11.8111 2.19275 9.4099C2.19275 7.00523 2.20329 6.72046 2.24547 5.77477C2.28413 4.89587 2.43175 4.42126 2.55477 4.10486C2.71645 3.6865 2.91327 3.38416 3.22608 3.07127C3.54241 2.75487 3.84116 2.56151 4.25941 2.39979C4.57574 2.27675 5.05374 2.12909 5.92891 2.09042C6.87437 2.04823 7.15907 2.03768 9.56314 2.03768ZM9.56314 0.416992C7.1204 0.416992 6.81462 0.427539 5.8551 0.469726C4.89909 0.511913 4.24184 0.6666 3.67245 0.888083C3.07846 1.12011 2.57586 1.42597 2.07676 1.9287C1.57416 2.42792 1.26838 2.93065 1.0364 3.52127C0.814976 4.09431 0.660327 4.74821 0.618151 5.70446C0.575974 6.66773 0.56543 6.97359 0.56543 9.41693C0.56543 11.8603 0.575974 12.1661 0.618151 13.1259C0.660327 14.0821 0.814976 14.7396 1.0364 15.3091C1.26838 15.9032 1.57416 16.4059 2.07676 16.9052C2.57586 17.4044 3.07846 17.7138 3.66894 17.9423C4.24184 18.1637 4.89558 18.3184 5.85159 18.3606C6.81111 18.4028 7.11689 18.4134 9.55963 18.4134C12.0024 18.4134 12.3081 18.4028 13.2677 18.3606C14.2237 18.3184 14.8809 18.1637 15.4503 17.9423C16.0408 17.7138 16.5434 17.4044 17.0425 16.9052C17.5416 16.4059 17.8509 15.9032 18.0793 15.3126C18.3008 14.7396 18.4554 14.0857 18.4976 13.1294C18.5398 12.1696 18.5503 11.8638 18.5503 9.42045C18.5503 6.9771 18.5398 6.67125 18.4976 5.71149C18.4554 4.75524 18.3008 4.09783 18.0793 3.5283C17.8579 2.93065 17.5521 2.42792 17.0495 1.9287C16.5504 1.42949 16.0478 1.12011 15.4573 0.891598C14.8844 0.670115 14.2307 0.515429 13.2747 0.473242C12.3117 0.427539 12.0059 0.416992 9.56314 0.416992Z"
                      fill="white"
                    />
                    <path
                      d="M9.56328 4.7937C7.01158 4.7937 4.94141 6.86439 4.94141 9.41672C4.94141 11.969 7.01158 14.0397 9.56328 14.0397C12.115 14.0397 14.1852 11.969 14.1852 9.41672C14.1852 6.86439 12.115 4.7937 9.56328 4.7937ZM9.56328 12.4155C7.90784 12.4155 6.56521 11.0726 6.56521 9.41672C6.56521 7.76087 7.90784 6.41791 9.56328 6.41791C11.2187 6.41791 12.5613 7.76087 12.5613 9.41672C12.5613 11.0726 11.2187 12.4155 9.56328 12.4155Z"
                      fill="white"
                    />
                    <path
                      d="M15.4471 4.61103C15.4471 5.20868 14.9621 5.69032 14.3681 5.69032C13.7706 5.69032 13.2891 5.20517 13.2891 4.61103C13.2891 4.01338 13.7741 3.53174 14.3681 3.53174C14.9621 3.53174 15.4471 4.01689 15.4471 4.61103Z"
                      fill="white"
                    />
                  </g>
                </svg>
              </Link>
              <Link
                href="#"
                className="transition-transform hover:-translate-y-1"
              >
                <svg
                  width="20"
                  height="19"
                  viewBox="0 0 20 19"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clipPath="url(#clip0_18_2172)">
                    <path
                      d="M17.8876 0.416992H1.85575C1.08779 0.416992 0.466797 0.997066 0.466797 1.71425V17.1161C0.466797 17.8333 1.08779 18.4169 1.85575 18.4169H17.8876C18.6555 18.4169 19.2802 17.8333 19.2802 17.1196V1.71425C19.2802 0.997066 18.6555 0.416992 17.8876 0.416992ZM6.04835 15.7556H3.25574V7.16343H6.04835V15.7556ZM4.65204 5.99274C3.75547 5.99274 3.03159 5.30016 3.03159 4.44587C3.03159 3.59158 3.75547 2.89901 4.65204 2.89901C5.54494 2.89901 6.26882 3.59158 6.26882 4.44587C6.26882 5.29665 5.54494 5.99274 4.65204 5.99274ZM16.4986 15.7556H13.7097V11.579C13.7097 10.5841 13.6913 9.30092 12.2582 9.30092C10.8068 9.30092 10.5863 10.3872 10.5863 11.5087V15.7556H7.80108V7.16343H10.4761V8.33764H10.5129C10.884 7.66265 11.7953 6.94898 13.1511 6.94898C15.9768 6.94898 16.4986 8.72787 16.4986 11.0411V15.7556V15.7556Z"
                      fill="white"
                    />
                  </g>
                </svg>
              </Link>
              <Link
                href="#"
                className="transition-transform hover:-translate-y-1"
              >
                <svg
                  width="19"
                  height="19"
                  viewBox="0 0 19 19"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clipPath="url(#clip0_18_2171)">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M13.3902 5.32773C12.419 4.44146 11.1228 3.95864 9.78169 3.97848C7.32763 3.97848 5.2434 5.56251 4.50026 7.6955C4.10623 8.81325 4.10623 10.0237 4.50026 11.1414H4.50371C5.2503 13.2711 7.33108 14.8551 9.78515 14.8551C11.0519 14.8551 12.1395 14.5451 12.9824 13.9976V13.9953C13.9744 13.367 14.6518 12.3782 14.8627 11.2605H9.7817V7.79477H18.6544C18.765 8.39664 18.8169 9.01173 18.8169 9.62352C18.8169 12.3609 17.7944 14.6752 16.0153 16.2427L16.0171 16.2441C14.4583 17.6198 12.3187 18.4168 9.78169 18.4168C6.22501 18.4168 2.9725 16.4987 1.37563 13.4596C0.0414536 10.9165 0.0414569 7.92041 1.37564 5.37735C2.97251 2.33494 6.22501 0.416866 9.78169 0.416866C12.1182 0.39041 14.3753 1.23038 16.0759 2.75821L13.3902 5.32773Z"
                      fill="white"
                    />
                  </g>
                </svg>
              </Link>
            </div>
          </div>

          <div className="text-center text-sm text-white border-t border-border/[.16] pt-5 md:pt-[30px]">
            © 2025{" "}
            <Link href="/" className="hover:text-primary transition-colors">
              The Pothole Doctors
            </Link>
            . All rights reserved
          </div>
        </div>
      </div>
    </footer>
  );
}
