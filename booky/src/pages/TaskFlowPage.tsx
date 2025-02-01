import NavigationBar from "@/features/NavigationBar";
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import TaskNode from "@/features/TaskFlow/CustomNode";
import { useHook } from "@/hooks";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

const initialNodes = [
  {
    id: "1",
    type: "task",
    position: { x: 0, y: 0 },
    data: {
      title: "Task 1",
      description: "",
      assignee: "",
      deadline: null,
      isCompleted: false,
      isLocked: false,
    },
  },
];
const initialEdges = [{ id: "e1-2", source: "1", target: "2" }];

export default function TaskFlowPage() {
  const { server } = useHook();
  const { taskFlowId } = useParams();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // ✅ Fix: Use `useMemo` to prevent recreation of nodeTypes on every render
  const nodeTypes = useMemo(
    () => ({
      task: (props) => <TaskNode {...props} setNodes={setNodes} />,
    }),
    [setNodes]
  );

  useEffect(() => {
    fetchTaskFlow();
  }, [taskFlowId]);

  async function fetchTaskFlow() {
    try {
      const response = await fetch(`${server}/api/taskFlow/${taskFlowId}`);
      const data = await response.json();
      setNodes(data.nodes);
      setEdges(data.edges);
    } catch (error) {
      toast.error("Failed to fetch task flow");
    }
  }

  const addTaskNode = useCallback(() => {
    // Generate a unique ID for the new node
    const newNodeId = `${nodes.length + 1}`;

    // Get the last node in the list (latest one)
    const latestNode = nodes[nodes.length - 1];

    // Define the new node with full data fields
    const newNode = {
      id: newNodeId,
      type: "task",
      position: {
        x: latestNode ? latestNode.position.x + 200 : 0, // Shift right if there's a latest node
        y: latestNode ? latestNode.position.y + 100 : 0, // Shift down if there's a latest node
      },
      data: {
        title: `Task ${newNodeId}`, // Default task title
        description: "", // Empty description initially
        assignee: "", // Empty assignee initially
        deadline: null, // No deadline initially
        isCompleted: false, // Task starts as incomplete
        isLocked: false, // Task starts as editable
      },
    };

    // Define an edge from the latest node to the new node (if there's a latest node)
    const newEdge = latestNode
      ? {
          id: `e${latestNode.id}-${newNodeId}`,
          source: latestNode.id,
          target: newNodeId,
        }
      : null;

    // Update the nodes & edges state
    setNodes((prevNodes) => [...prevNodes, newNode]);
    if (newEdge) {
      setEdges((prevEdges) => [...prevEdges, newEdge]);
    }
  }, [nodes, setNodes, setEdges]);

  // Function to add a new edge when connecting nodes
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  async function handleSaveTaskFlow() {
    try {
      const response = await fetch(
        `${server}/api/taskFlow/updateTaskFlow/${taskFlowId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nodes: nodes,
            edges: edges,
          }),
        }
      );

      if (response.ok) {
        toast.success("Task Flow Updated Successfully!");
      } else {
        toast.error("Failed to update task flow");
      }
    } catch (error) {
      toast.error("Failed to update task flow");
    }
  }

  return (
    <section className="h-screen w-screen bg-white font-outfit">
      <NavigationBar />
      <main className="container">
        <div className="absolute w-3/6 h-2/6 bg-red-700 blur-[500px] top-1/2 translate-x-1/2"></div>
        <div className="p-10">
          {/* Button Container - Positioned Absolute */}
          <div className="absolute top-36 right-14 z-50">
            <Button onClick={addTaskNode} className="rounded-xl">
              Add Node
            </Button>
          </div>
          <Button onClick={handleSaveTaskFlow}>Save</Button>
          <div className="h-[800px] w-[1600px] z-10 border rounded-lg">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              minZoom={0.1}
              maxZoom={2}
              defaultViewport={{ x: 0, y: 0, zoom: 0.75 }}
            >
              <Controls />
              <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            </ReactFlow>
          </div>
        </div>
      </main>
    </section>
  );
}
