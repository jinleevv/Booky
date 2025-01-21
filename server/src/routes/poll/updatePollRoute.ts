import express, { Request, RequestHandler, Response } from "express";
import Poll from "../../models/poll";

const router = express.Router();

export const addParticipantToPoll: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { urlPath } = req.params;
  const { userEmail } = req.body;

  try {
    if (!userEmail) {
      res.status(400).json({
        message: "Missing email",
      });
      return;
    }

    // add the email to the participants field of poll
    const poll = await Poll.findOne({ urlPath: urlPath });

    if (!poll) {
      res.status(404).json({ message: "Poll not found" });
      return;
    }

    const participantExist = poll.participants!.some(
      (participant) => participant.email === userEmail
    );

    let message = "";
    if (participantExist) {
      message = "Participant already in the poll";
    } else {
      poll.participants!.push({ email: userEmail, schedule: [] });
      await poll.save();
      message = "Participant added to the poll";
    }

    res.status(200).json({ message: message });
  } catch (error) {
    console.error("Error updating poll, missing email:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updatePollHandler: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { urlPath } = req.params;
  const { userEmail, selectedSlots } = req.body;

  try {
    if (!userEmail || !selectedSlots) {
      res.status(400).json({
        message: "Missing required fields",
      });
      return;
    }

    const poll = await Poll.findOne({ urlPath: urlPath });

    if (!poll) {
      res.status(404).json({ message: "Poll not found" });
      return;
    }

    // Check if the participant already exists
    const participant = poll.participants!.find(
      (participant) => participant.email === userEmail
    );

    if (participant) {
      // Update the existing participant's schedule
      participant.schedule = selectedSlots;
    } else {
      // Add a new participant with the selected schedule
      poll.participants!.push({ email: userEmail, schedule: selectedSlots });
    }

    console.log(poll);
    for (const participant of poll.participants!) {
      console.log(participant);
    }

    // Remove __v field from poll object
    await poll.save();

    // transform map to object for json response

    res.status(200).json({
      message: "Participant schedule updated successfully",
    });
  } catch (error) {
    console.error("Error updating poll:", error);
    res.status(500).json({ message: "Server error" });
  }
};

router.patch("/:urlPath", addParticipantToPoll);
router.patch("/:urlPath/availability", updatePollHandler);

export default router;
