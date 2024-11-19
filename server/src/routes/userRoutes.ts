import express, { Request, Response, RequestHandler } from 'express';
import User from '../models/user';

const router = express.Router();

// User registration route
const registerUserHandler: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const { uid } = req.body;  

  try {
    if (!uid) {
      res.status(400).json({ message: 'Firebase token missing UID' });
      return;  
    }

    // Check if user already exists by UID
    const existingUser = await User.findOne({ uid });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return; 
    }

    // Create new user instance with UID only
    const newUser = new User({ _id: uid });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Register the route and use the handler
router.post('/register', registerUserHandler);

export default router;