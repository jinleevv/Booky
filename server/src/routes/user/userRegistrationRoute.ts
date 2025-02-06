import express, { Request, Response, RequestHandler } from "express";
import User from "../../models/user";

const router = express.Router();

// Route to register a new user.
const registerUserHandler: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { uid, email, name } = req.body;

  try {
    // Input validation.
    if (!uid || !email || !name) {
      res
        .status(400)
        .json({ message: "Missing required fields: uid, email, and/or name." });
      return;
    }

    // ✅ Ensure the email ends with either @mail.mcgill.ca or @mcgill.ca
    const mcgillEmailRegex =
      /^[a-zA-Z0-9._%+-]+@(mail\.mcgill\.ca|mcgill\.ca)$/;

    if (!mcgillEmailRegex.test(email)) {
      res
        .status(400)
        .json({ message: "Invalid email. Only McGill emails are allowed." });
    }

    // Check if user already exists by uid.
    const existingUser = await User.findOne({ _id: uid });
    if (existingUser) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    // Create new user.
    const newUser = new User({ _id: uid, email: email, name: name });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

router.post("/register", registerUserHandler);

export default router;
