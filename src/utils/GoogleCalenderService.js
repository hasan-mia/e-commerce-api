const { google } = require("googleapis");
const path = require("path");

const addToBusinessCalendar = async (booking) => {
  try {
    // 1. Authenticate with Service Account
    const serviceAccountKeyFile = path.join(
      __dirname,
      "..",
      "assets",
      "service-account.json"
    );
    const auth = new google.auth.GoogleAuth({
      keyFile: serviceAccountKeyFile,
      scopes: ["https://www.googleapis.com/auth/calendar"],
    });

    console.log(
      "🔑 Authenticating with Google Calendar API using service account...",
      auth
    );

    const calendar = google.calendar({ version: "v3", auth });

    // 2. Calculate end time
    const startDateTime = new Date(
      `${booking.scheduled_date}T${booking.scheduled_time}:00`
    );
    const endDateTime = new Date(
      startDateTime.getTime() + booking.duration * 60000
    );

    // Format for Google Calendar API
    const formatDateTime = (date, timezone) => {
      // If timezone is offset like "+06", convert to IANA timezone
      const ianaTimezone = convertToIANATimezone(timezone) || "UTC";
      return {
        dateTime: date.toISOString().slice(0, 19), // Remove 'Z'
        timeZone: ianaTimezone,
      };
    };

    // 3. Create event
    const event = {
      summary: `${booking.customer_name} - ${booking.service.title}`,
      description: `
Booking Number: ${booking.booking_number}
Confirmation Code: ${booking.confirmation_code}

Customer Details:
- Email: ${booking.customer_email}
- Phone: ${booking.customer_phone}
${booking.customer_company ? `- Company: ${booking.customer_company}` : ""}

Service: ${booking.service.title}
${booking.description ? `Description: ${booking.description}` : ""}
${booking.notes ? `Notes: ${booking.notes}` : ""}

Referral Source: ${booking.referral_source}
      `.trim(),
      start: formatDateTime(startDateTime, booking.timezone),
      end: formatDateTime(endDateTime, booking.timezone),
      attendees: [
        { email: booking.customer_email, responseStatus: "needsAction" },
        { email: "info@ahadandco.com", responseStatus: "accepted" }, // Your email
      ],
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 24 * 60 }, // 1 day before
          { method: "popup", minutes: 30 }, // 30 min before
        ],
      },
      // Optional: Add color
      colorId: "9", // Blue color (you can choose 1-11)
    };

    // 4. Insert event into calendar
    const response = await calendar.events.insert({
      calendarId: "primary",
      resource: event,
      sendUpdates: "all",
    });

    console.log("✅ Event created:", response.data.htmlLink);
    return response.data;
  } catch (error) {
    console.error("❌ Error creating calendar event:", error.message);
    throw error;
  }
};

// Helper function to convert timezone offset to IANA timezone
const convertToIANATimezone = (timezone) => {
  const timezoneMap = {
    "+06": "Asia/Dhaka",
    "+05:30": "Asia/Kolkata",
    "-05": "America/New_York",
    "-06": "America/Chicago",
    "-07": "America/Denver",
    "-08": "America/Los_Angeles",
    // Add more as needed
  };

  return timezoneMap[timezone] || timezone;
};

// Calculate end time helper
const calculateEndTime = (booking) => {
  const start = new Date(
    `${booking.scheduled_date}T${booking.scheduled_time}:00`
  );
  const end = new Date(start.getTime() + booking.duration * 60000);
  return end.toISOString().slice(0, 19);
};

const generateCalendarLinks = (booking) => {
  // ----- Helper: Format date -----
  const formatDateHuman = (date, timezone = "UTC") =>
    new Date(date).toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: timezone,
    });

  const formatGoogleDate = (date) =>
    date.toISOString().replace(/[-:]/g, "").split(".")[0] + "00";

  const startDate = new Date(
    `${booking.scheduled_date}T${booking.scheduled_time}`
  );
  const endDate = new Date(startDate);
  endDate.setMinutes(endDate.getMinutes() + (booking.duration || 30));

  const startGoogle = formatGoogleDate(startDate);
  const endGoogle = formatGoogleDate(endDate);

  const startOutlook = startDate.toISOString().slice(0, 16);
  const endOutlook = endDate.toISOString().slice(0, 16);

  // ----- Default guest -----
  const defaultGuest =
    process.env.GOOGLE_MEET_GUEST_EMAIL || "apptawseer@gmail.com";

  // ----- Rich description -----
  const descriptionLines = [
    `Hi ${booking.customer_name || "there"},`,
    ``,
    `Welcome to ${booking.service?.company_name || "Our Company"}!`,
    `Your appointment for ${
      booking.service?.title || "our service"
    } has been confirmed.`,
    ``,
    `When: ${formatDateHuman(
      `${booking.scheduled_date}T${booking.scheduled_time}`,
      booking.timezone
    )}`,
    `Where: ${
      booking.google_meet_link ||
      booking.meeting_location ||
      booking.customer_phone ||
      "Online Meeting"
    }`,
    `Calendar: ${booking.customer_email || "Not provided"}`,
    `Organizer: ${booking.service?.organizer_email || defaultGuest}`,
    `Attendee: ${booking.customer_email || "Not provided"}`,
    ``,
    `Event Name: ${booking.service?.title || "Meeting"}`,
    ``,
    `${
      booking.description ||
      "This meeting is scheduled to discuss your selected service."
    }`,
    ``,
    `Telephone Number: ${booking.customer_phone || "Not Provided"}`,
    `Are you a new client?: ${booking.is_new_client ? "Yes" : "No"}`,
    `Questions / Matters to discuss: ${booking.description || "None provided"}`,
    ``,
    booking.reschedule_url ? `Reschedule: ${booking.reschedule_url}` : "",
    booking.cancel_url ? `Cancel: ${booking.cancel_url}` : "",
    ``,
    `We look forward to speaking with you!`,
    `${booking.service?.company_name || "Our Company"}`,
    `${booking.service?.website || ""}`,
  ];

  const description = descriptionLines.filter(Boolean).join("\n");

  // ===== 1️⃣ Google Calendar Link =====
  const googleParams = new URLSearchParams({
    action: "TEMPLATE",
    text: booking.service?.title || "Meeting",
    details: description,
    location: booking.google_meet_link || "Online Meeting",
    ctz: booking.timezone || "UTC",
    dates: `${startGoogle}/${endGoogle}`,
    add: defaultGuest,
  });

  if (booking.guest_email) {
    googleParams.append("add", booking.guest_email);
  }

  const googleLink = `https://calendar.google.com/calendar/render?${googleParams.toString()}`;

  // ===== 2️⃣ Outlook Web Link =====
  const outlookParams = new URLSearchParams({
    subject: booking.service?.title || "Meeting",
    body: description,
    startdt: startOutlook,
    enddt: endOutlook,
    location: booking.google_meet_link || "Online Meeting",
  });

  const outlookLink = `https://outlook.office.com/calendar/0/deeplink/compose?${outlookParams.toString()}`;

  // ===== 3️⃣ ICS File Content =====
  const formatICSDate = (date) =>
    date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  let icsContent = `
    BEGIN:VCALENDAR
    VERSION:2.0
    PRODID:-//Your Company//Your App//EN
    BEGIN:VEVENT
    UID:${booking.id || Date.now()}@yourapp.com
    DTSTAMP:${formatICSDate(new Date())}
    DTSTART:${formatICSDate(startDate)}
    DTEND:${formatICSDate(endDate)}
    SUMMARY:${booking.service?.title || "Meeting"}
    DESCRIPTION:${description.replace(/\n/g, "\\n")}
    LOCATION:${booking.google_meet_link || "Online Meeting"}
    `;

  // Add attendees
  const attendees = [defaultGuest];
  if (booking.guest_email) attendees.push(booking.guest_email);
  attendees.forEach((email) => {
    icsContent += `ATTENDEE;CN=${email};RSVP=TRUE:mailto:${email}\n`;
  });

  icsContent += "END:VEVENT\nEND:VCALENDAR";

  return {
    google: googleLink,
    outlook: outlookLink,
    ics: icsContent,
  };
};

module.exports = {
  addToBusinessCalendar,
  calculateEndTime,
  generateCalendarLinks,
};
