import express, { Request, Response, RequestHandler } from "express";
import TaskFlow from "../../models/taskFlow";

const router = express.Router();

export const getTaskFlowHandler: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { taskFlowId } = req.params;
  try {
    if (!taskFlowId) {
      res.status(400).json({ message: "Invalid or missing taskFlowId" });
      return;
    }

    const taskFlow = await TaskFlow.findOne({ id: taskFlowId });

    if (!taskFlow) {
      res.status(404).json({ message: "Task Flow not found" });
      return;
    }

    res.status(200).json(taskFlow);
  } catch (error) {
    console.error("Error fetching task flow:", error);
    res.status(500).json({ message: "Server error" });
  }
};

router.get("/:taskFlowId", getTaskFlowHandler);

export default router;
