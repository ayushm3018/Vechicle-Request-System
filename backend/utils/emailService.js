import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.log('❌ Email service configuration error:', error);
  } else {
    console.log('✅ Email service is ready to send messages');
  }
});

// Send email to admin when new request is submitted
export const sendNewRequestNotification = async (requestData) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.ADMIN_EMAIL,
    subject: 'New Vehicle Request Submitted',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
          🚗 New Vehicle Requisition Request
        </h2>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #007bff; margin-top: 0;">Request Details:</h3>
          
          <p><strong>Officer Name:</strong> ${requestData.officer_name}</p>
          <p><strong>Designation:</strong> ${requestData.designation}</p>
          <p><strong>Required Date:</strong> ${new Date(requestData.required_date).toLocaleDateString()}</p>
          <p><strong>Required Time:</strong> ${requestData.required_time}</p>
          <p><strong>Report Place:</strong> ${requestData.report_place}</p>
          <p><strong>Places to Visit:</strong> ${requestData.places_to_visit}</p>
          <p><strong>Journey Purpose:</strong> ${requestData.journey_purpose}</p>
          <p><strong>Release Time:</strong> ${requestData.release_time}</p>
          <p><strong>Submitted At:</strong> ${new Date().toLocaleString()}</p>
        </div>
        
        <p style="color: #666; font-style: italic;">
          Please log in to the admin dashboard to review and approve/reject this request.
        </p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #888; font-size: 12px;">
          This is an automated email from Vehicle Requisition Management System.
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ New request notification sent to admin');
  } catch (error) {
    console.error('❌ Error sending new request notification:', error);
    throw error;
  }
};

// Send approval/rejection email to employee
export const sendRequestStatusNotification = async (requestData, status, vehicleInfo = null) => {
  const isApproved = status === 'approved';
  const subject = isApproved ? 'Vehicle Request Approved' : 'Vehicle Request Rejected';
  
  let vehicleDetails = '';
  if (isApproved && vehicleInfo) {
    vehicleDetails = `
      <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 15px 0; border: 1px solid #c3e6cb;">
        <h4 style="color: #155724; margin-top: 0;">Assigned Vehicle Details:</h4>
        <p><strong>Vehicle Number:</strong> ${vehicleInfo.vehicle_number}</p>
        <p><strong>Make/Model:</strong> ${vehicleInfo.make_model}</p>
        <p><strong>Driver Name:</strong> ${vehicleInfo.driver_name}</p>
      </div>
    `;
  }

  const statusColor = isApproved ? '#28a745' : '#dc3545';
  const statusIcon = isApproved ? '✅' : '❌';
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: requestData.employee_email || process.env.EMPLOYEE_EMAIL,
    subject: subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${statusColor}; border-bottom: 2px solid ${statusColor}; padding-bottom: 10px;">
          ${statusIcon} Vehicle Request ${status.charAt(0).toUpperCase() + status.slice(1)}
        </h2>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Your Request Details:</h3>
          
          <p><strong>Officer Name:</strong> ${requestData.officer_name}</p>
          <p><strong>Designation:</strong> ${requestData.designation}</p>
          <p><strong>Required Date:</strong> ${new Date(requestData.required_date).toLocaleDateString()}</p>
          <p><strong>Required Time:</strong> ${requestData.required_time}</p>
          <p><strong>Report Place:</strong> ${requestData.report_place}</p>
          <p><strong>Places to Visit:</strong> ${requestData.places_to_visit}</p>
          <p><strong>Journey Purpose:</strong> ${requestData.journey_purpose}</p>
          <p><strong>Release Time:</strong> ${requestData.release_time}</p>
        </div>
        
        ${vehicleDetails}
        
        ${!isApproved && requestData.rejection_reason ? `
          <div style="background-color: #f8d7da; padding: 15px; border-radius: 5px; margin: 15px 0; border: 1px solid #f5c6cb;">
            <h4 style="color: #721c24; margin-top: 0;">Rejection Reason:</h4>
            <p style="color: #721c24;">${requestData.rejection_reason}</p>
          </div>
        ` : ''}
        
        <p style="color: #666; font-style: italic;">
          ${isApproved ? 
            'Please be ready at the specified time and place. Contact the driver if needed.' : 
            'You may submit a new request with the necessary modifications.'
          }
        </p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #888; font-size: 12px;">
          This is an automated email from Vehicle Requisition Management System.
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ ${status} notification sent to employee`);
  } catch (error) {
    console.error(`❌ Error sending ${status} notification:`, error);
    throw error;
  }
};