import twilio from "twilio";
import dotenv from "dotenv";
import pQueue from "p-queue";

dotenv.config();

const sendSMS = async (twilioClient, phoneNumber, smsMessage) => {
  try {
    const messageInfo = await twilioClient.client.messages.create({
      body: smsMessage,
      from: twilioClient.twilioNumber,
      to: phoneNumber,
    });

    console.log(`SMS sent to ${phoneNumber}: ${messageInfo.sid}`);
    return { phoneNumber, status: "success", sid: messageInfo.sid };
  } catch (error) {
    console.error(`Failed to send SMS to ${phoneNumber}: ${error.message}`);
    return { phoneNumber, status: "failed", error: error.message };
  }
};

export const smsSender = async (req, res) => {
  try {
    console.log("Request Body:", req.body);
    const { twilioAccounts, smsList, smsMessage } = req.body;

    const twilioCount = twilioAccounts.length;
    const messageCount = smsMessage.length;

    const twilioClients = twilioAccounts.map(
      ({ accountSid, authToken, twilioNumber }) => {
        return {
          client: twilio(accountSid, authToken),
          twilioNumber,
        };
      }
    );

    const getRandomTwilioClient = () => {
      const randomIndex = Math.floor(Math.random() * twilioCount);
      return twilioClients[randomIndex];
    };

    const smsQueue = new pQueue({ concurrency: 100 });

    const results = await Promise.all(
      smsList.map((phoneNumber, index) =>
        smsQueue.add(() =>
          sendSMS(getRandomTwilioClient(), phoneNumber, smsMessage[index % messageCount])
        )
      )
    );

    res.status(200).json({ message: "SMS sent successfully", results });
  } catch (error) {
    console.error(`Failed to send SMS: ${error.message}`);
    res.status(500).json({ message: "Failed to send SMS", error: error.message });
  }
};
