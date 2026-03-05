const sections = [
  {
    title: 'Before Installation',
    items: [
      'We must have water, electricity, and a climate-controlled (between 65-75 degrees) condition. This is to ensure proper installation and performance of your product.'
    ]
  },
  {
    title: 'During Installation',
    items: [
      'Please keep all pets out of the work area(s) during the project.',
      'Should the installers encounter excessive pet waste (eg., urine-infested carpet, etc.), the customer will be given the option to remedy the waste on their own. If not, our removal is subject to a $250 fee.',
      'We will move the furniture listed in our quote. Please remove all small furniture, lamps, small chairs, small tables, and all breakables from the work area. Remove all china from china cabinets. We do not move any type of fish tanks, breakable, antique, or heirloom pieces. Lower racks of closets must be cleared. We move furniture as a courtesy to our customers. We assume no responsibility for damages due to our movement of your furniture. There will be additional charges to move pianos, pool tables, appliances, or any large pieces of furniture that are not listed on your quote that are still in the work area. While we may move items, such as pool tables, that need balancing, it is your responsibility to have these items properly balanced afterward. Customers are responsible for plugging and unplugging all electronic devices, network cables, computers, etc. Our installers may refuse to move furniture items if there is any chance of damage that might result during moving.',
      'The customer is responsible for turning all water and gas appliances off. We may do this at no responsibility. Existing commodes will be removed and a new wax ring will be installed. We are not responsible for any water leaks or any plumbing problems. We encourage you to hire a plumber to avoid any plumbing problems.',
      'If the thickness of your new flooring requires cutting/shaving of doors to allow for closing, this will be an extra charge of $25 per door. Hollow-core doors may not be able to be cut.'
    ]
  },
  {
    title: 'Door Frames & Moldings (Including Quarter Round and Baseboard)',
    items: [
      'While we will always do our best to avoid any damage, wall paint, sheetrock, wallpaper, baseboards, and moldings may have scratches from carpet installation and installer tools. The customer is responsible for any touch-ups.',
      'We are not responsible for any door frame repair caused by the removal of the existing floor.'
    ]
  },
  {
    title: 'Subfloor',
    items: [
      'If the subfloor is unlevel, it may be necessary to repair the old floor or to install a new subfloor, especially when click vinyl planks are being installed. This work would be at an additional cost. There is a charge for removing the old material and for any unforeseen problems that arise after the removal of the existing floor. If the floor needs to be prepped in order to make it level, there will be an extra charge of $75 per bag (materials and labor), as needed, and cannot be limited to a certain number of bags. If the customer chooses not to level the floors, he/she must agree to accept the risk and there will be no warranties on material and/or installation.'
    ]
  },
  {
    title: 'Carpet',
    items: [
      'Seams are necessary for most carpet installations. While we do our best to hide them, there is no such thing as an invisible seam. Carpet roll crush occurs while the carpet is still on a roll and gradually fades.',
      'Carpet manufacturers recommend having the carpet cleaned by a professional carpet cleaner as needed or at least once every 18 months. Please refer to the specific warranty requirements of the carpet you have purchased.',
      'We offer a 12-month warranty on carpet stretching.',
      'With loop-type carpet such as berber, vacuum sweepers can have beater bars or other items that could potentially pull a loop and cause a runner. Be sure to use a vacuum sweeper that is suitable for this carpet type.'
    ]
  },
  {
    title: 'Tile',
    items: ['All houses settle over time. Cracks in grout should be expected over time as this movement occurs.']
  },
  {
    title: 'Vinyl Planks',
    items: [
      'Due to varying thicknesses of vinyl planks, there may be a difference between the thickness of your new vinyl planks and your previous flooring. As a result, there may be a need to raise or lower your baseboards and/or to add quarter round. If it is decided to lower your baseboard, there will be an unpainted area between where the baseboard was and your existing paint. The painting, if necessary, will be up to the customer. These issues are not always apparent during our measurements of your job and are subject to an additional charge.'
    ]
  },
  {
    title: 'Baseboards',
    items: [
      'If baseboards are purchased from us, they are installed in a primed condition and will need painted, if desired. This is the responsibility of the customer.'
    ]
  },
  {
    title: 'Installation Warranty',
    items: [
      "Materials are warrantied through the manufacturer and have specific requirements for each material. It is the customer's responsibility to understand the warranty requirements. Crabtree's Carpet is not responsible for any guarantees or warranties made by any salesperson that are not expressly written in this contract.",
      'We offer a 30-day warranty on the quality of installation.'
    ]
  },
  {
    title: 'Dust and Trash Disposal',
    items: [
      'Dust inherently occurs during the construction and installation processes. Dust amount will vary from job to job and we are not responsible for cleaning it upon completion.'
    ]
  },
  {
    title: 'Payments',
    items: [
      'We require a 50% deposit. For special-order products, deposits are NOT refundable once materials have been ordered.',
      'Final payments are due upon completion of installation. The installer is trusted and authorized to accept any final payment.',
      "There will be a $50 charge for all returned checks. All additional expenses incurred by collecting unpaid invoices will be at the customer's expense, including, but not limited to, attorney's fees.",
      'We accept cash, check, and credit/debit card payments for deposits and remaining balances.'
    ]
  },
  {
    title: 'Shortages and Add-Ons',
    items: [
      'If the customer provided the initial measurements, then the customer is responsible to pay for any shortages or additional material, including labor and return trip charges.',
      'If the customer decides to add an additional area after signing the original contract, he/she is required to sign a new contract for the added area.'
    ]
  },
  {
    title: 'Circumstances and Delays',
    items: [
      'Due to circumstances beyond our control, installation dates may change. Scheduled installation dates and times are approximate. No discounts will be given due to scheduling conflicts or the length of the job.',
      'Most materials are custom order. While we are provided with an estimated delivery date, the exact delivery date is beyond our control.'
    ]
  },
  {
    title: 'Return & Cancellation Policy',
    items: [
      'Discontinued items, remnants, or clearance items are "All sales final".',
      'All non-stock or special order items are generally not returnable.',
      'We may not accept returns after 30 days from date of purchase.',
      'Returns must be undamaged, in original packing, and in re-sellable condition.',
      'All materials not returned within 15 days are subject to a 35% restocking fee.'
    ]
  },
  {
    title: 'Debt Collection Policy',
    items: [
      'Payment is due as stated on your invoice.',
      'Any unpaid balance will accrue a finance charge of 1.5% per month (18% annually) until fully paid.',
      'If the account is referred to a collection agency or attorney, the customer agrees to pay all related costs, including attorney fees, court filing fees, and collection charges.'
    ]
  }
]

const InvoiceCustomerAgreement = () => {
  return (
    <div className='my-6 text-sm print:text-black'>
      <h3 className='text-lg font-semibold mb-4'>Customer Agreement</h3>
      <div className='space-y-4'>
        {sections.map((section, i) => (
          <div key={i}>
            <h4 className='font-semibold text-sm mb-1 text-primary-foreground print:text-black'>{section.title}</h4>
            <ul className='list-disc list-outside ml-5 space-y-1 text-primary-foreground/80 print:text-black/80'>
              {section.items.map((item, j) => (
                <li key={j}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

export default InvoiceCustomerAgreement
