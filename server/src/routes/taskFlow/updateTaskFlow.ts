import express, { Request, Response, RequestHandler } from "express";
import TaskFlow from "../../models/taskFlow";

const router = express.Router();

export const updateTaskFlowHandler: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { taskFlowId } = req.params;
  const { nodes, edges } = req.body;
  try {
    if (!taskFlowId) {
      res.status(400).json({ message: "Invalid or missing taskFlowId" });
      return;
    }

    let taskFlow = await TaskFlow.findOne({ id: taskFlowId });

    if (!taskFlow) {
      // Create a new TaskFlow with the given ID
      taskFlow = new TaskFlow({
        id: taskFlowId,
        nodes: nodes, // Ensure it's an array
        edges: edges,
      });
    } else {
      taskFlow.nodes = nodes;
      taskFlow.edges = edges;
    }

    await taskFlow.save();

    res.status(200).json(taskFlow);
  } catch (error) {
    console.error("Error updating comments:", error);
    res.status(500).json({ message: "Server error" });
  }
};

router.patch("/updateTaskFlow/:taskFlowId", updateTaskFlowHandler);

export default router;
