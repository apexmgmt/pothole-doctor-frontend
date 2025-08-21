// Google Apps Script endpoint for form submission
const GOOGLE_APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwPgoOgS3nseJob-ALgOXeUgbS_5mNlOH27p-YiBoc5s0V9qItxpHmbg_mjTwfW0rs/exec";

export const submitContactForm = async (formData) => {
  try {
    // Clean phone number before sending
    const cleanPhone = formData.phone ? formData.phone.toString().trim() : "";

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
        message: formData.message,
        privacy: formData.privacy,
      }),
    });

    // Since we're using no-cors, we can't read the response
    // But if the request completes without error, it's likely successful
    return { success: true, message: "Form submitted successfully!" };
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
    form.append("message", formData.message);
    form.append("privacy", formData.privacy);

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
