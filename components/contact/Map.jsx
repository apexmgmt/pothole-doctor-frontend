import React from "react";

const MapSection = () => {
  return (
    <section className="py-10 md:py-15 bg-white">
      <div className="container">
        <div className="rounded-2xl overflow-hidden ">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.9663095343008!2d-73.8460879!3d40.7182173!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25f4b8b1b1b1b%3A0x1b1b1b1b1b1b1b1b!2sForest%20Hills%2C%20Queens%2C%20NY%2C%20USA!5e0!3m2!1sen!2sus!4v1234567890!5m2!1sen!2sus"
            // width="100%"
            // height="300"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="The Pothole Doctors Location"
            className="w-full h-[300px] md:h-[440px]"
          ></iframe>
        </div>
      </div>
    </section>
  );
};

export default MapSection;
