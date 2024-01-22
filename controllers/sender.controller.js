import twilio from "twilio";
import dotenv from "dotenv";
import pQueue from "p-queue";

dotenv.config();

export const smsSender = async (req, res) => {
  try {
    console.log("Request Body:", req.body);
    const { twilioAccounts, smsList, smsMessage } = req.body;

    const twilioCount = twilioAccounts.length;
    const messageCount = smsMessage.length;

    const twilioClients = twilioAccounts.map(
      ({ accountSid, authToken, messagingServiceSid, fromNumber }) => {
        if (messagingServiceSid) {
          return {
            client: twilio(accountSid, authToken).services(messagingServiceSid),
            fromNumber,
          };
        } else {
          return { client: twilio(accountSid, authToken), fromNumber };
        }
      }
    );

    const getRandomTwilioClient = () => {
      const randomIndex = Math.floor(Math.random() * twilioCount);
      const twilioClient = twilioClients[randomIndex];

      // If messagingServiceSid is not present, use the Twilio number directly
      if (!twilioClient.client.messagingServiceSid) {
        return twilioClient;
      }

      // If messagingServiceSid is present, use the specified service
      return {
        client: twilio(
          twilioClient.client.accountSid,
          twilioClient.client.authToken
        ).services(twilioClient.client.messagingServiceSid),
        fromNumber: twilioClient.fromNumber,
      };
    };

    const smsQueue = new pQueue({ concurrency: 100 });

    const sendSMS = async (phoneNumber, smsMessage) => {
      const twilioClient = getRandomTwilioClient();

      try {
        const messageInfo = await twilioClient.client.messages.create({
          body: smsMessage,
          messagingServiceSid: twilioClient.client.messagingServiceSid,
          to: phoneNumber,
        });

        console.log(`SMS sent to ${phoneNumber}: ${messageInfo.sid}`);
        return { phoneNumber, status: "success", sid: messageInfo.sid };
      } catch (error) {
        console.error(`Failed to send SMS to ${phoneNumber}: ${error.message}`);
        return { phoneNumber, status: "failed", error: error.message };
      }
    };

    const results = await Promise.all(
      smsList.map((phoneNumber, index) =>
        smsQueue.add(() =>
          sendSMS(phoneNumber, smsMessage[index % messageCount])
        )
      )
    );

    res.status(200).json({ message: "SMS sent successfully", results });
  } catch (error) {
    console.error(`Failed to send SMS: ${error.message}`);
    res
      .status(500)
      .json({ message: "Failed to send SMS", error: error.message });
  }
};