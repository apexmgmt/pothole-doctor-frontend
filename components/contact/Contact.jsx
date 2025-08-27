import React from "react";
import { useState } from "react";
import { submitContactForm } from "../../services/contact.service";

const ContactSection = () => {
  // Add CSS to fix dropdown width issues
  React.useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .contact-select {
        width: 100% !important;
        max-width: 100% !important;
        box-sizing: border-box !important;
      }
      .contact-select option {
        max-width: 100% !important;
        word-wrap: break-word !important;
        overflow-wrap: break-word !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    company: "",
    projectType: "",
    projectDescription: "",
    timeline: "",
    hearAboutUs: "",
    privacy: false,
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const result = await submitContactForm(formData);

      if (result.success) {
        setSubmitStatus({ type: "success", message: result.message });
        // Reset form on successful submission
        setFormData({
          firstName: "",
          lastName: "",
          phone: "",
          email: "",
          company: "",
          projectType: "",
          projectDescription: "",
          timeline: "",
          hearAboutUs: "",
          privacy: false,
        });
      } else {
        setSubmitStatus({ type: "error", message: result.message });
      }
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-10 md:py-15 bg-white">
      <div className="container">
        <div className="flex gap-10 items-start min-[991px]:flex-row flex-col">
          <div className="space-y-2.5 md:space-y-4 flex-1 xl:max-w-[520px]  max-[991px]:w-full  min-[991px]:sticky  min-[991px]:top-5">
            <h1 className="text-heading font-semibold font-primary text-title leading-tight mb-4 md:mb-6 uppercase">
              Get in Touch With Pothole Doctors{" "}
            </h1>
            <p className="text-text-color text-body-text leading-relaxed max-w-[460px]">
              We’re here to answer your questions and provide fast, reliable
              pavement solutions.
            </p>

            <div className="space-y-4 md:space-y-6 mt-7 sm:mt-6 min-[991px]:mt-[90px] ">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 md:w-12 md:h-12 bg-primary-foreground rounded-lg flex items-center justify-center">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M18.3087 15.275C18.3087 15.575 18.242 15.8833 18.1003 16.1833C17.9587 16.4833 17.7753 16.7666 17.5337 17.0333C17.1253 17.4833 16.6753 17.8083 16.167 18.0166C15.667 18.225 15.1253 18.3333 14.542 18.3333C13.692 18.3333 12.7837 18.1333 11.8253 17.725C10.867 17.3166 9.90866 16.7666 8.95866 16.075C8.00033 15.375 7.09199 14.6 6.22533 13.7416C5.36699 12.875 4.59199 11.9666 3.90033 11.0166C3.21699 10.0666 2.66699 9.11663 2.26699 8.17496C1.86699 7.22496 1.66699 6.31663 1.66699 5.44996C1.66699 4.88329 1.76699 4.34163 1.96699 3.84163C2.16699 3.33329 2.48366 2.86663 2.92533 2.44996C3.45866 1.92496 4.04199 1.66663 4.65866 1.66663C4.89199 1.66663 5.12533 1.71663 5.33366 1.81663C5.55033 1.91663 5.74199 2.06663 5.89199 2.28329L7.82533 5.00829C7.97533 5.21663 8.08366 5.40829 8.15866 5.59163C8.23366 5.76663 8.27533 5.94163 8.27533 6.09996C8.27533 6.29996 8.21699 6.49996 8.10033 6.69163C7.99199 6.88329 7.83366 7.08329 7.63366 7.28329L7.00033 7.94163C6.90866 8.03329 6.86699 8.14163 6.86699 8.27496C6.86699 8.34163 6.87533 8.39996 6.89199 8.46663C6.91699 8.53329 6.94199 8.58329 6.95866 8.63329C7.10866 8.90829 7.36699 9.26663 7.73366 9.69996C8.10866 10.1333 8.50866 10.575 8.94199 11.0166C9.39199 11.4583 9.82533 11.8666 10.267 12.2416C10.7003 12.6083 11.0587 12.8583 11.342 13.0083C11.3837 13.025 11.4337 13.05 11.492 13.075C11.5587 13.1 11.6253 13.1083 11.7003 13.1083C11.842 13.1083 11.9503 13.0583 12.042 12.9666L12.6753 12.3416C12.8837 12.1333 13.0837 11.975 13.2753 11.875C13.467 11.7583 13.6587 11.7 13.867 11.7C14.0253 11.7 14.192 11.7333 14.3753 11.8083C14.5587 11.8833 14.7503 11.9916 14.9587 12.1333L17.717 14.0916C17.9337 14.2416 18.0837 14.4166 18.1753 14.625C18.2587 14.8333 18.3087 15.0416 18.3087 15.275Z"
                      stroke="#53AA57"
                      strokeWidth="1.5"
                      strokeMiterlimit="10"
                    />
                  </svg>
                </div>
                <span className="text-body-text font-medium">
                  (740) 330-5155
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-9 h-9 md:w-12 md:h-12 bg-primary-foreground rounded-lg flex items-center justify-center">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M7 8.5L9.94202 10.2394C11.6572 11.2535 12.3428 11.2535 14.058 10.2394L17 8.5"
                      stroke="#53AA57"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M2.01577 13.4756C2.08114 16.5411 2.11383 18.0739 3.24496 19.2093C4.37609 20.3448 5.95034 20.3843 9.09884 20.4634C11.0393 20.5122 12.9607 20.5122 14.9012 20.4634C18.0497 20.3843 19.6239 20.3448 20.755 19.2093C21.8862 18.0739 21.9189 16.5411 21.9842 13.4756C22.0053 12.4899 22.0053 11.51 21.9842 10.5244C21.9189 7.45886 21.8862 5.92609 20.755 4.79066C19.6239 3.65523 18.0497 3.61568 14.9012 3.53657C12.9607 3.48781 11.0393 3.48781 9.09882 3.53656C5.95034 3.61566 4.37609 3.65521 3.24496 4.79065C2.11383 5.92608 2.08114 7.45885 2.01577 10.5243C1.99474 11.51 1.99474 12.4899 2.01577 13.4756Z"
                      stroke="#53AA57"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span className="text-body-text font-medium">
                  todd@potholedoctors.com 
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-9 h-9 md:w-12 md:h-12 bg-primary-foreground rounded-lg flex items-center justify-center">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M13.6177 21.367C13.1841 21.773 12.6044 22 12.0011 22C11.3978 22 10.8182 21.773 10.3845 21.367C6.41302 17.626 1.09076 13.4469 3.68627 7.37966C5.08963 4.09916 8.45834 2 12.0011 2C15.5439 2 18.9126 4.09916 20.316 7.37966C22.9082 13.4393 17.599 17.6389 13.6177 21.367Z"
                      stroke="#53AA57"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M15.5 11C15.5 12.933 13.933 14.5 12 14.5C10.067 14.5 8.5 12.933 8.5 11C8.5 9.067 10.067 7.5 12 7.5C13.933 7.5 15.5 9.067 15.5 11Z"
                      stroke="#53AA57"
                      strokeWidth="1.5"
                    />
                  </svg>
                </div>
                <span className="text-body-text font-medium">
                  708-D Fairground Rd, Lucasville, OH 45648
                </span>
              </div>
            </div>
          </div>

          <div className="flex-1 w-full">
            <div className="text-[28px] font-semibold text-title font-primary uppercase mb-[30px]">
              CONTACT US
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 xl:space-y-6">
              <div className="grid sm:grid-cols-2 gap-4 xl:gap-6">
                <div className="space-y-2 xl:space-y-3">
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-title uppercase"
                  >
                    FIRST NAME
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 sm:py-3 text-base text-body-text border border-border rounded-lg focus:ring focus:ring-primary focus:border-transparent transition-all outline-none"
                    placeholder="First Name"
                    required
                  />
                </div>
                <div className="space-y-2 xl:space-y-3">
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-title uppercase"
                  >
                    LAST NAME
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 sm:py-3 text-base text-body-text border border-border rounded-lg focus:ring focus:ring-primary focus:border-transparent transition-all outline-none"
                    placeholder="Last Name"
                    required
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2  gap-4 xl:gap-6">
                <div className="space-y-2 xl:space-y-3">
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-title uppercase"
                  >
                    PHONE NO
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 sm:py-3 text-base text-body-text border border-border rounded-lg focus:ring focus:ring-primary focus:border-transparent transition-all outline-none"
                    placeholder="Phone No"
                    required
                  />
                </div>
                <div className="space-y-2 xl:space-y-3">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-title uppercase"
                  >
                    EMAIL
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 sm:py-3 text-base text-body-text border border-border rounded-lg focus:ring focus:ring-primary focus:border-transparent transition-all outline-none"
                    placeholder="Email"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="company"
                  className="block text-sm font-medium text-title uppercase"
                >
                  COMPANY NAME
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 text-base text-body-text border border-border rounded-lg focus:ring focus:ring-primary focus:border-transparent transition-all outline-none"
                  placeholder="Company Name"
                  required
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="projectType"
                  className="block text-sm font-medium text-title uppercase"
                >
                  PROJECT TYPE
                </label>
                <div className="relative">
                  <select
                    id="projectType"
                    name="projectType"
                    value={formData.projectType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 text-base text-body-text border border-border rounded-lg focus:ring focus:ring-primary focus:border-transparent transition-all outline-none appearance-none bg-white [&>option]:py-2 [&>option]:px-3 contact-select"
                    style={{ maxWidth: "100%" }}
                  >
                    <option value="" defaultValue hidden>
                      Select Project Type
                    </option>
                    <option value="pothole-repairs">Pothole Repairs</option>
                    <option value="catch-basin-repairs">
                      Catch Basin Repairs
                    </option>
                    <option value="birdbath-repairs">Birdbath Repairs</option>
                    <option value="speed-bump-installation">
                      Speed Bump Installation
                    </option>
                    <option value="parking-block-installation">
                      Parking Block Installation
                    </option>
                    <option value="parking-block-repainting">
                      Parking Block Repainting
                    </option>
                    <option value="crack-sealing">Crack Sealing</option>
                    <option value="asphalt-sealcoating">
                      Asphalt Sealcoating
                    </option>
                  </select>
                  <svg
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3 4.5L6 7.5L9 4.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="projectDescription"
                  className="block text-sm font-medium text-title uppercase"
                >
                  WHAT KIND OF PROJECT ARE YOU PLANNING TO WORK ON?
                </label>
                <textarea
                  id="projectDescription"
                  name="projectDescription"
                  value={formData.projectDescription}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-4 py-3 text-base text-body-text border border-border rounded-lg focus:ring focus:ring-primary focus:border-transparent transition-all outline-none resize-vertical"
                  placeholder="Type here"
                  required
                ></textarea>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="timeline"
                  className="block text-sm font-medium text-title uppercase"
                >
                  WHEN WOULD YOU IDEALLY LIKE THIS PROJECT COMPLETED?
                </label>
                <input
                  type="text"
                  id="timeline"
                  name="timeline"
                  value={formData.timeline}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 text-base text-body-text border border-border rounded-lg focus:ring focus:ring-primary focus:border-transparent transition-all outline-none"
                  placeholder="Type here"
                  required
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="hearAboutUs"
                  className="block text-sm font-medium text-title uppercase"
                >
                  HOW DID YOU HEAR ABOUT US?
                </label>
                <div className="relative">
                  <select
                    id="hearAboutUs"
                    name="hearAboutUs"
                    value={formData.hearAboutUs}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 text-base text-body-text border border-border rounded-lg focus:ring focus:ring-primary focus:border-transparent transition-all outline-none appearance-none bg-white [&>option]:py-2 [&>option]:px-3 contact-select"
                    style={{ maxWidth: "100%" }}
                  >
                    <option value="">Select</option>
                    <option value="google">Google Search</option>
                    <option value="social-media">Social Media</option>
                    <option value="referral">Referral</option>
                    <option value="advertisement">Advertisement</option>
                    <option value="website">Website</option>
                    <option value="other">Other</option>
                  </select>
                  <svg
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3 4.5L6 7.5L9 4.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex items-center space-x-3">
                  <label className="relative cursor-pointer">
                    <input
                      type="checkbox"
                      id="privacy"
                      name="privacy"
                      checked={formData.privacy}
                      onChange={handleInputChange}
                      className="sr-only"
                      required
                    />
                    <div
                      className={`w-4 h-4 md:w-6 md:h-6 border-2 rounded transition-all duration-200 ${
                        formData.privacy
                          ? "bg-primary border-primary"
                          : "border-border hover:border-primary"
                      }`}
                    >
                      {formData.privacy && (
                        <svg
                          className="w-3 h-3 text-primary-foreground mx-auto md:mt-0.5 md:w-4 md:h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </label>
                  <label
                    htmlFor="privacy"
                    className="text-sm text-title leading-relaxed cursor-pointer select-none"
                  >
                    I agree to the Privacy Policy and to be contacted by MSC
                    regarding my query.
                  </label>
                </div>
              </div>

              {/* Status Messages */}
              {submitStatus && (
                <div
                  className={`p-4 rounded-lg ${
                    submitStatus.type === "success"
                      ? "bg-green-50 border border-green-200 text-green-800"
                      : "bg-red-50 border border-red-200 text-red-800"
                  }`}
                >
                  {submitStatus.message}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className={`py-3 md:py-4 px-4 md:px-6 rounded-lg font-semibold tracking-wide uppercase transition-colors flex items-center justify-center gap-1.5 w-max cursor-pointer ${
                  isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-primary text-white hover:bg-primary/85"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>SENDING...</span>
                  </>
                ) : (
                  <>
                    <span>SUBMIT</span>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M13.9658 6.53345L6.89475 13.6045"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M8.54497 6.062C8.54497 6.062 13.6611 5.28563 14.4375 6.06202C15.2139 6.83842 14.4375 11.9546 14.4375 11.9546"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
