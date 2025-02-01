import mongoose, { Schema, Document } from "mongoose";

interface NodeData {
  title: string;
  description: string;
  assignee: string;
  deadline: Object | null;
  isCompleted: boolean;
  isLocked: boolean;
}

interface INode {
  id: string;
  type: string;
  position: {
    x: number;
    y: number;
  };
  data: NodeData;
}

interface IEdge {
  id: string;
  source: string;
  target: string;
}

interface ITaskFlow extends Document {
  id: string;
  nodes: INode[];
  edges: IEdge[];
}

const TaskFlowSchema = new Schema<ITaskFlow>({
  id: { type: String, required: true, unique: true },
  nodes: [
    {
      id: { type: String, required: true },
      type: { type: String, required: true },
      position: {
        x: { type: Number, required: true },
        y: { type: Number, required: true },
      },
      data: {
        title: { type: String, required: true },
        description: { type: String, required: false },
        assignee: { type: String, required: false },
        deadline: { type: Object, required: false, default: null },
        isCompleted: { type: Boolean, default: false },
        isLocked: { type: Boolean, default: false },
      },
      measured: {
        width: { type: Number, required: false, default: 320 },
        height: { type: Number, required: false, default: 350 },
      },
      selected: { type: Boolean, default: false },
      dragging: { type: Boolean, default: false },
    },
  ],
  edges: [
    {
      id: { type: String, required: true },
      source: { type: String, required: true },
      target: { type: String, required: true },
    },
  ],
});

const TaskFlow = mongoose.model<ITaskFlow>("TaskFlow", TaskFlowSchema);
export default TaskFlow;
