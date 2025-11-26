require("dotenv").config();

const sendVerificationLinkTemplate = (data) => {
  const logoUrl =
    process.env.LOGO_URL ||
    "https://res.cloudinary.com/dkulytwjq/image/upload/v1750443855/vjjprg5i1nrg16gqvick.png";
  const companyName = "CPA Platform";

  const { user, verifyLink } = data;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Email Verification</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f5f7fa;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background-color: #fff;
          border: 1px solid #ddd;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
        .header {
          text-align: center;
          padding: 24px;
          border-bottom: 1px solid #eee;
        }
        .header img {
          max-width: 140px;
        }
        .content {
          padding: 24px;
        }
        .content h1 {
          font-size: 20px;
          color: #333;
          margin-bottom: 16px;
        }
        .content p {
          font-size: 16px;
          color: #555;
          line-height: 1.6;
        }
        .content a.button {
          display: inline-block;
          margin-top: 20px;
          padding: 12px 24px;
          background-color: #007bff;
          color: #fff !important;
          text-decoration: none;
          border-radius: 4px;
          font-weight: bold;
        }
        .footer {
          text-align: center;
          font-size: 13px;
          color: #888;
          padding: 20px;
          border-top: 1px solid #eee;
          background-color: #fafafa;
        }
        .footer a {
          color: #007bff;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${logoUrl}" alt="${companyName} Logo" />
        </div>
        <div class="content">
          <h1>Email Verification</h1>
          <p>Hi ${user.first_name || "there"},</p>
          <p>
            To complete your verification, please click the button below. This link will expire in <strong>15 minutes</strong>.
          </p>
          <p style="text-align: center;">
            <a href="${verifyLink}" class="button">Verify Now</a>
          </p>
          <p>
            If you did not request this, you can safely ignore this email.
          </p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} ${companyName}. All rights reserved.
          <br />
          <a href="https://erphasan.vercel.app">Visit our website</a>
        </div>
      </div>
    </body>
    </html>
  `;
};

const sendBookingEmailTemplate = (data) => {
  const logoUrl =
    process.env.LOGO_URL ||
    "https://res.cloudinary.com/dkulytwjq/image/upload/v1750443855/vjjprg5i1nrg16gqvick.png";
  const companyName = data.service?.company_name || "Our Company";

  const {
    customer_name,
    customer_email,
    scheduled_date,
    scheduled_time,
    timezone = "UTC",
    service,
    google_meet_link,
    meeting_location,
    customer_phone,
    description,
    reschedule_url,
    cancel_url,
    is_new_client,
  } = data;

  // Correct date formatting function
  const formatDateTime = (date, time) => {
    if (!date) return "Not Provided";

    // Combine date + time; fallback to 00:00 if time missing
    const dateTimeString = time ? `${date}T${time}:00` : `${date}T00:00:00`;

    try {
      const dateObj = new Date(dateTimeString);
      return dateObj.toLocaleString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: timezone,
      });
    } catch (err) {
      return "Invalid Date";
    }
  };

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Booking Confirmation</title>
      <style>
        body { font-family: Arial, sans-serif; background-color: #f5f7fa; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background-color: #fff; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); }
        .header { text-align: center; padding: 24px; border-bottom: 1px solid #eee; }
        .header img { max-width: 140px; }
        .content { padding: 24px; }
        .content h1 { font-size: 20px; color: #333; margin-bottom: 16px; }
        .content p { font-size: 16px; color: #555; line-height: 1.6; }
        .content a.button { display: inline-block; margin: 10px 0 20px 0; padding: 12px 24px; background-color: #007bff; color: #fff !important; text-decoration: none; border-radius: 4px; font-weight: bold; }
        .footer { text-align: center; font-size: 13px; color: #888; padding: 20px; border-top: 1px solid #eee; background-color: #fafafa; }
        .footer a { color: #007bff; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${logoUrl}" alt="${companyName} Logo" />
        </div>
        <div class="content">
          <h1>Booking Confirmation</h1>
          <p>Hi ${customer_name || "there"},</p>
          <p>Your appointment for <strong>${
            service?.title || "our service"
          }</strong> has been confirmed.</p>
          <p><strong>Date & Time:</strong> ${formatDateTime(
            scheduled_date,
            scheduled_time
          )}</p>
          <p><strong>Location / Meeting Link:</strong> ${
            google_meet_link || meeting_location || "Online Meeting"
          }</p>
          <p><strong>Organizer:</strong> ${
            service?.organizer_email || companyName
          }</p>
          <p><strong>Telephone:</strong> ${customer_phone || "Not Provided"}</p>
          <p><strong>New Client:</strong> ${is_new_client ? "Yes" : "No"}</p>
          <p><strong>Description / Discussion Points:</strong><br />${
            description || "No description provided."
          }</p>
          ${
            reschedule_url
              ? `<p style="text-align:center;"><a href="${reschedule_url}" class="button">Reschedule</a></p>`
              : ""
          }
          ${
            cancel_url
              ? `<p style="text-align:center;"><a href="${cancel_url}" class="button" style="background-color:#dc3545;">Cancel</a></p>`
              : ""
          }
          <p>We look forward to speaking with you!</p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} ${companyName}. All rights reserved.
          <br /><a href="${service?.website || "#"}">Visit our website</a>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = {
  sendVerificationLinkTemplate,
  sendBookingEmailTemplate,
};
