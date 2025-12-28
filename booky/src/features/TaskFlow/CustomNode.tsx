import { Handle, Position } from "@xyflow/react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@heroui/date-picker";
import { getLocalTimeZone, now } from "@internationalized/date";
import { useState, useEffect } from "react";
import { Check, Lock, Unlock } from "lucide-react";

export default function TaskNode({ data, id, setNodes }: any) {
  const [isCompleted, setIsCompleted] = useState(data.isCompleted || false);
  const [isLocked, setIsLocked] = useState(data.isLocked || false);
  const [taskData, setTaskData] = useState(data); // ✅ Fix: Store data in state

  useEffect(() => {
    // Sync local state with global nodes state
    setNodes((prevNodes: any) =>
      prevNodes.map((node: any) =>
        node.id === id ? { ...node, data: taskData } : node
      )
    );
  }, [taskData, id, setNodes]);

  return (
    <div className="bg-white border rounded-lg shadow-md p-4 w-80">
      {/* Task Header with Check & Lock Buttons */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-lg font-semibold">Task</span>
        <div className="flex gap-2">
          {/* Checkmark Button */}
          <Button
            onClick={() => {
              setIsCompleted(!isCompleted);
              setTaskData({ ...taskData, isCompleted: !isCompleted });
            }}
            className={`w-6 h-6 flex items-center justify-center rounded-full border ${
              isCompleted ? "bg-black text-white" : "bg-white text-black"
            }`}
          >
            <Check size={16} />
          </Button>

          {/* Lock Button */}
          <Button
            onClick={() => {
              setIsLocked(!isLocked);
              setTaskData({ ...taskData, isLocked: !isLocked });
            }}
            className={`w-6 h-6 flex items-center justify-center rounded-full border ${
              isLocked ? "bg-black text-white" : "bg-white text-black"
            }`}
          >
            {isLocked ? <Lock size={16} /> : <Unlock size={16} />}
          </Button>
        </div>
      </div>

      {/* Task Title */}
      <Input
        className="mb-3"
        placeholder="Task Title"
        value={taskData.title}
        onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
        disabled={isLocked}
      />

      {/* Task Description */}
      <label className="font-semibold text-sm">Description</label>
      <Textarea
        className="mb-3"
        placeholder="Task Description"
        value={taskData.description}
        onChange={(e) =>
          setTaskData({ ...taskData, description: e.target.value })
        }
        disabled={isLocked}
      />

      {/* Assignee Input */}
      <label className="font-semibold text-sm">Assignee</label>
      <Input
        className="mb-3"
        placeholder="Assignee"
        value={taskData.assignee}
        onChange={(e) => setTaskData({ ...taskData, assignee: e.target.value })}
        disabled={isLocked}
      />

      {/* Deadline (Date Picker) */}
      <label className="font-semibold text-sm">Deadline</label>
      <DatePicker
        hideTimeZone
        showMonthAndYearPickers
        defaultValue={taskData.deadline || now(getLocalTimeZone())}
        onChange={(newDate) => setTaskData({ ...taskData, deadline: newDate })}
        className="w-full"
        isDisabled={isLocked}
      />

      {/* Handles for connections */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-2 h-2 bg-blue-500"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-2 h-2 bg-green-500"
      />
    </div>
  );
}
