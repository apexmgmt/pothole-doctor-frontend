import sgMail from '@sendgrid/mail';

export async function POST(req) {
  try {
    const body = await req.json();

    const { 
      firstName, 
      lastName, 
      email, 
      phone, 
      company, 
      projectType, 
      projectDescription, 
      timeline, 
      hearAboutUs,
      privacy 
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !projectDescription || !timeline) {
      return Response.json({ 
        success: false,
        message: 'Please fill in all required fields' 
      }, { status: 400 });
    }

    // Validate privacy agreement
    if (!privacy) {
      return Response.json({ 
        success: false,
        message: 'Please agree to the Privacy Policy' 
      }, { status: 400 });
    }

    // Set SendGrid API key
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    // Format project type for display
    const formatProjectType = (type) => {
      if (!type) return 'Not specified';
      
return type.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    };

    // Format company type for display
    const formatCompany = (company) => {
      if (!company) return 'Not specified';
      
return company.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    };

    // Format hear about us for display
    const formatHearAboutUs = (source) => {
      if (!source) return 'Not specified';
      
return source.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    };

    const emailHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Contact Form Submission - Pothole Doctors</title>
        <style>
            body {
                margin: 0;
                padding: 0;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
                background-color: #f5f5f5;
                line-height: 1.6;
            }
            .email-container {
                max-width: 600px;
                margin: 20px auto;
                background-color: #ffffff;
                border-radius: 12px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                overflow: hidden;
            }
            .header {
                background: linear-gradient(135deg, #53AA57 0%, #4a9a4e 100%);
                color: white;
                padding: 30px;
                text-align: center;
            }
            .header h1 {
                margin: 0;
                font-size: 24px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            .header p {
                margin: 8px 0 0 0;
                opacity: 0.9;
                font-size: 16px;
            }
            .content {
                padding: 0;
            }
            .section {
                padding: 25px 30px;
                border-bottom: 1px solid #e5e7eb;
            }
            .section:last-child {
                border-bottom: none;
            }
            .section-title {
                font-size: 18px;
                font-weight: 600;
                color: #1f2937;
                margin: 0 0 20px 0;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                border-bottom: 2px solid #53AA57;
                padding-bottom: 8px;
            }
            .field-group {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin-bottom: 20px;
            }
            .field {
                margin-bottom: 15px;
            }
            .field-label {
                font-size: 12px;
                font-weight: 600;
                color: #6b7280;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 4px;
            }
            .field-value {
                font-size: 14px;
                color: #1f2937;
                background-color: #f9fafb;
                padding: 10px 12px;
                border-radius: 6px;
                border-left: 3px solid #53AA57;
            }
            .full-width {
                grid-column: 1 / -1;
            }
            .project-description {
                background-color: #f9fafb;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                padding: 15px;
                margin-top: 8px;
                white-space: pre-wrap;
                line-height: 1.6;
            }
            .contact-info {
                background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
                padding: 25px 30px;
                text-align: center;
            }
            .contact-info h3 {
                margin: 0 0 15px 0;
                color: #1f2937;
                font-size: 16px;
            }
            .contact-details {
                display: flex;
                justify-content: space-around;
                flex-wrap: wrap;
                gap: 15px;
            }
            .contact-item {
                display: flex;
                align-items: center;
                gap: 8px;
                color: #53AA57;
                font-size: 14px;
                font-weight: 500;
            }
            .footer {
                background-color: #1f2937;
                color: white;
                padding: 20px 30px;
                text-align: center;
                font-size: 12px;
            }
            .timestamp {
                color: #9ca3af;
                font-size: 12px;
                text-align: right;
                padding: 15px 30px 0;
            }
            @media (max-width: 600px) {
                .field-group {
                    grid-template-columns: 1fr;
                }
                .contact-details {
                    flex-direction: column;
                    align-items: center;
                }
                .email-container {
                    margin: 10px;
                    border-radius: 8px;
                }
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <h1>Contact Form Submission</h1>
                <p>New inquiry from Pothole Doctors website</p>
            </div>
            
            <div class="timestamp">
                Received: ${new Date().toLocaleString('en-US', {
                  timeZone: 'America/New_York',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })} EST
            </div>

            <div class="content">
                <div class="section">
                    <h2 class="section-title">Personal Information</h2>
                    <div class="field-group">
                        <div class="field">
                            <div class="field-label">First Name</div>
                            <div class="field-value">${firstName}</div>
                        </div>
                        <div class="field">
                            <div class="field-label">Last Name</div>
                            <div class="field-value">${lastName}</div>
                        </div>
                    </div>
                    <div class="field-group">
                        <div class="field">
                            <div class="field-label">Phone Number</div>
                            <div class="field-value">${phone}</div>
                        </div>
                        <div class="field">
                            <div class="field-label">Email Address</div>
                            <div class="field-value">${email}</div>
                        </div>
                    </div>
                    <div class="field">
                        <div class="field-label">Company Type</div>
                        <div class="field-value">${formatCompany(company)}</div>
                    </div>
                </div>

                <div class="section">
                    <h2 class="section-title">Project Details</h2>
                    <div class="field">
                        <div class="field-label">Project Type</div>
                        <div class="field-value">${formatProjectType(projectType)}</div>
                    </div>
                    <div class="field">
                        <div class="field-label">Project Description</div>
                        <div class="project-description">${projectDescription}</div>
                    </div>
                    <div class="field">
                        <div class="field-label">Desired Timeline</div>
                        <div class="field-value">${timeline}</div>
                    </div>
                </div>

                <div class="section">
                    <h2 class="section-title">Additional Information</h2>
                    <div class="field">
                        <div class="field-label">How did they hear about us?</div>
                        <div class="field-value">${formatHearAboutUs(hearAboutUs)}</div>
                    </div>
                </div>
            </div>

            

            <div class="footer">
                <p>This email was generated automatically from the Pothole Doctors contact form.</p>
                <p>Please respond to the customer within 24 hours for the best service experience.</p>
            </div>
        </div>
    </body>
    </html>`;

    const msg = {
      to: process.env.SENDGRID_TO_EMAIL,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL,
        name: 'Pothole Doctors Website'
      },
      replyTo: {
        email: email,
        name: `${firstName} ${lastName}`
      },
      subject: `New Contact Form Submission - ${firstName} ${lastName} | ${formatProjectType(projectType)}`,
      text: `
NEW CONTACT FORM SUBMISSION - POTHOLE DOCTORS

Personal Information:
- Name: ${firstName} ${lastName}
- Email: ${email}
- Phone: ${phone}
- Company Type: ${formatCompany(company)}

Project Details:
- Project Type: ${formatProjectType(projectType)}
- Description: ${projectDescription}
- Timeline: ${timeline}

Additional Information:
- How they heard about us: ${formatHearAboutUs(hearAboutUs)}

Submitted: ${new Date().toLocaleString('en-US', {
        timeZone: 'America/New_York',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })} EST

Please respond within 24 hours for best customer service.
      `,
      html: emailHTML,
    };

    await sgMail.send(msg);
    
    return Response.json({ 
      success: true,
      message: 'Thank you for your inquiry! We\'ll get back to you within 24 hours.' 
    }, { status: 200 });

  } catch (error) {
    console.error('SendGrid error:', error);
    
return Response.json({ 
      success: false,
      message: 'Failed to send your message. Please try again or call us directly at (740) 330-5155.' 
    }, { status: 500 });
  }
}
