const BillingInformation = () => {
  return (
    <div className='flex flex-col-reverse gap-4 sm:flex-row sm:justify-between mt-4 text-sm print:text-black'>
      {/* Bill To */}
      <div className='flex flex-col'>
        <h6 className='font-semibold text-base mb-4'>Bill To</h6>
        <p>The Pothole Doctors</p>
        <p>708-D Fairground Rd, Lucasville, OH 45648</p>
        <p>todd@potholedoctors.com</p>
        <p>(740) 330-5155</p>
      </div>
      {/* Service Site */}
      <div className='flex flex-col sm:text-right'>
        <h6 className='font-semibold text-base mb-4'>Service Site</h6>
        <p>708-D Fairground Rd, Lucasville, OH 45648</p>
        <p>todd@potholedoctors.com</p>
        <p>(740) 330-5155</p>
      </div>
    </div>
  )
}

export default BillingInformation
