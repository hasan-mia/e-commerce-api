const { google } = require("googleapis");
const { OAuth2Client } = require("google-auth-library");

class GoogleMeetService {
  constructor() {
    this.oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    // Set credentials (refresh token should be stored securely)
    this.oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    this.calendar = google.calendar({ version: "v3", auth: this.oauth2Client });
  }

  async createMeeting(config) {
    try {
      const event = {
        summary: config.summary,
        description: config.description,
        start: {
          dateTime: config.startDateTime,
          timeZone: config.timezone,
        },
        end: {
          dateTime: config.endDateTime,
          timeZone: config.timezone,
        },
        attendees: config.attendees.map((email) => ({ email })),
        conferenceData: {
          createRequest: {
            requestId: `meet-${Date.now()}`,
            conferenceSolutionKey: { type: "hangoutsMeet" },
          },
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: "email", minutes: 24 * 60 },
            { method: "popup", minutes: 30 },
          ],
        },
      };

      const response = await this.calendar.events.insert({
        calendarId: "primary",
        resource: event,
        conferenceDataVersion: 1,
        sendUpdates: "all",
      });

      const meetLink =
        response.data.hangoutLink ||
        response.data.conferenceData?.entryPoints?.[0]?.uri;
      const eventId = response.data.id;

      if (!meetLink || !eventId) {
        throw new Error("Failed to create Google Meet link");
      }

      return { meetLink, eventId };
    } catch (error) {
      console.error("Error creating Google Meet:", error);
      throw new Error(`Failed to create Google Meet: ${error.message}`);
    }
  }

  async updateMeeting(eventId, config) {
    try {
      const updateData = {};

      if (config.summary) updateData.summary = config.summary;
      if (config.description) updateData.description = config.description;
      if (config.startDateTime && config.endDateTime) {
        updateData.start = {
          dateTime: config.startDateTime,
          timeZone: config.timezone,
        };
        updateData.end = {
          dateTime: config.endDateTime,
          timeZone: config.timezone,
        };
      }
      if (config.attendees) {
        updateData.attendees = config.attendees.map((email) => ({ email }));
      }

      await this.calendar.events.patch({
        calendarId: "primary",
        eventId: eventId,
        resource: updateData,
        sendUpdates: "all",
      });
    } catch (error) {
      console.error("Error updating Google Meet:", error);
      throw new Error(`Failed to update Google Meet: ${error.message}`);
    }
  }

  async cancelMeeting(eventId) {
    try {
      await this.calendar.events.delete({
        calendarId: "primary",
        eventId: eventId,
        sendUpdates: "all",
      });
    } catch (error) {
      console.error("Error canceling Google Meet:", error);
      throw new Error(`Failed to cancel Google Meet: ${error.message}`);
    }
  }
}

module.exports = GoogleMeetService;
