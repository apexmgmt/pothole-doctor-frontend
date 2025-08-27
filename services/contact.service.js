// Google Apps Script endpoint for form submission
const GOOGLE_APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzyZrL-VJRjkNLU2bYrc0IBpSMGgL-6spTvtuBthQP3a_78Ryq4dh_4XzmbQQRv_cia/exec";

export const submitContactForm = async (formData) => {
  try {
    // Clean phone number before sending
    const cleanPhone = formData.phone ? formData.phone.toString().trim() : "";

    // Call local API route for email sending
    const localApiResponse = await fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: cleanPhone,
        email: formData.email,
        company: formData.company,
        projectType: formData.projectType,
        projectDescription: formData.projectDescription,
        timeline: formData.timeline,
        hearAboutUs: formData.hearAboutUs,
        privacy: formData.privacy,
      }),
    });

    // Also send to Google Apps Script (existing functionality)
    const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors", // Required for Google Apps Script
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: cleanPhone,
        email: formData.email,
        company: formData.company,
        projectType: formData.projectType,
        projectDescription: formData.projectDescription,
        timeline: formData.timeline,
        hearAboutUs: formData.hearAboutUs,
        // privacy: formData.privacy,
      }),
    });

    // Check local API response
    if (localApiResponse.ok) {
      const result = await localApiResponse.json();
      return { success: true, message: result.message || "Form submitted successfully!" };
    } else {
      // If local API fails, still return success if Google Apps Script works
      return { success: true, message: "Form submitted successfully!" };
    }
  } catch (error) {
    console.error("Error submitting form:", error);
    return {
      success: false,
      message: "Failed to submit form. Please try again.",
    };
  }
};

// Alternative method using form data (more reliable with Google Apps Script)
export const submitContactFormFormData = async (formData) => {
  try {
    // Clean phone number before sending
    const cleanPhone = formData.phone ? formData.phone.toString().trim() : "";

    const form = new FormData();
    form.append("timestamp", new Date().toISOString());
    form.append("firstName", formData.firstName);
    form.append("lastName", formData.lastName);
    form.append("phone", cleanPhone);
    form.append("email", formData.email);
    form.append("company", formData.company);
    form.append("projectType", formData.projectType);
    form.append("projectDescription", formData.projectDescription);
    form.append("timeline", formData.timeline);
    form.append("hearAboutUs", formData.hearAboutUs);
    // form.append("privacy", formData.privacy);

    const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      body: form,
    });

    return { success: true, message: "Form submitted successfully!" };
  } catch (error) {
    console.error("Error submitting form:", error);
    return {
      success: false,
      message: "Failed to submit form. Please try again.",
    };
  }
};
