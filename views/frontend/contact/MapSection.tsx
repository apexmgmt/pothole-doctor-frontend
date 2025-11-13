import React from 'react'

const MapSection: React.FC = () => {
  return (
    <section className='py-10 md:py-15 bg-white'>
      <div className='container'>
        <div className='rounded-2xl overflow-hidden '>
          <iframe
            src='https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d8782.784250390601!2d-83.0002177820114!3d38.89692686989827!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8846f12ce993ade5%3A0x6ab2286df4dd88ac!2s708%20Fairground%20Rd%20Unit%20D%2C%20Lucasville%2C%20OH%2045648%2C%20USA!5e0!3m2!1sen!2sbd!4v1756041339641!5m2!1sen!2sbd'
            style={{ border: 0 }}
            allowFullScreen
            loading='lazy'
            referrerPolicy='no-referrer-when-downgrade'
            title='The Pothole Doctors Location'
            className='w-full h-[300px] md:h-[440px]'
          ></iframe>
        </div>
      </div>
    </section>
  )
}

export default MapSection
