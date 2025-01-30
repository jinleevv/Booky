import Quill from "quill";
import "quill/dist/quill.snow.css";
import { useCallback, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";
// import { Document, ImageRun, Packer, Paragraph } from "docx";
// import { saveAs } from "file-saver";
import "./MeetingMinute.css";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import InlineBlot from "quill/blots/inline";
import { useHook } from "@/hooks";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const SAVE_INTERVAL_MS = 2000;

// Extend the Inline class from Parchment
class CommentBlot extends InlineBlot {
  static blotName = "comment";
  static tagName = "span";
  static className = "comment";

  static create(value: any) {
    const node = super.create() as HTMLElement;
    node.setAttribute("data-comment", value);
    node.style.backgroundColor = "yellow"; // Add background highlight
    node.style.cursor = "pointer"; // Optional: Change cursor to indicate it's a comment
    return node;
  }

  static formats(domNode: HTMLElement) {
    return domNode.getAttribute("data-comment");
  }

  format(name: string, value: any) {
    if (name === "comment") {
      if (value) {
        // If the comment format is being applied, update the data-comment attribute and background color
        this.domNode.setAttribute("data-comment", value);
        this.domNode.style.backgroundColor = "yellow";
      } else {
        // If the comment format is being removed, clear the data-comment attribute and remove the background color
        this.domNode.removeAttribute("data-comment");
        this.domNode.style.backgroundColor = ""; // Reset to default
      }
    } else {
      super.format(name, value);
    }
  }
}

// Register the custom CommentBlot with Quill
Quill.register(CommentBlot, true);

const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ font: [] }],
  [{ list: "ordered" }, { list: "bullet" }],
  ["bold", "italic", "underline"],
  [{ color: [] }, { background: [] }],
  [{ script: "sub" }, { script: "super" }],
  [{ align: [] }],
  ["image", "blockquote", "code-block"],
  ["clean"],
  [{ comment: "Add Comment" }],
];

// Add a custom icon for the "Add Comment" button
const CustomIcons = Quill.import("ui/icons");
CustomIcons["comment"] = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18px" height="18px">
    <path fill="currentColor" d="M20 2H4a2 2 0 0 0-2 2v14l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zM4 20h16l-4 4H4a2 2 0 0 1-2-2v-2l2 2z"/>
  </svg>
`;

export default function MeetingMinute() {
  const { date, time, meetingId } = useParams();
  const { server } = useHook();
  const { userEmail } = useHook();
  const [socket, setSocket] = useState<any>(null);
  const [quill, setQuill] = useState<any>(null);
  const [comments, setComments] = useState<
    { id: number; text: string; comment: string; range: any }[]
  >([]);
  const [title, setTitle] = useState<string>("");

  useEffect(() => {
    if (!socket) return;

    // Listen for real-time title updates
    socket.on("receive-title-change", (newTitle) => {
      setTitle(newTitle);
    });
  }, [socket]);

  useEffect(() => {
    const s = io("http://localhost:5002");
    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket === null || quill === null) return;
    socket.once("load-document", (document) => {
      setTitle(document.title || `Meeting Minute, ${date}, ${time}`); // Set title

      quill.setContents(document.data);
      quill.enable();
    });

    // Listen for real-time title updates
    socket.on("receive-title-change", (newTitle) => {
      setTitle(newTitle);
    });

    socket.emit("get-document", meetingId);
    fetchComments();
  }, [socket, quill, meetingId]);

  useEffect(() => {
    if (socket === null || quill === null) return;
    const interval = setInterval(() => {
      socket.emit("save-document", quill.getContents());
    }, SAVE_INTERVAL_MS);
    return () => {
      clearInterval(interval);
    };
  }, [socket, quill]);

  useEffect(() => {
    if (socket === null || quill === null) {
      return;
    }
    const handler = (delta) => {
      quill.updateContents(delta);
    };
    socket.on("receive-changes", handler);
    return () => {
      socket.off("receive-changes", handler);
    };
  }, [socket, quill]);

  useEffect(() => {
    if (socket === null || quill === null) {
      return;
    }
    const handler = (delta, oldDelta, source) => {
      if (source !== "user") return;
      socket.emit("send-changes", delta);
    };
    quill.on("text-change", handler);
    return () => {
      quill.off("text-change", handler);
    };
  }, [socket, quill]);

  const wrapperRef: any = useCallback((wrapper) => {
    if (wrapper == null) return;
    wrapper.innerHTML = "";
    const editor = document.createElement("div");
    wrapper.append(editor);
    const q = new Quill(editor, {
      theme: "snow",
      modules: {
        toolbar: {
          container: TOOLBAR_OPTIONS,
          handlers: {
            comment: () => handleAddComment(q),
          },
        },
      },
    });
    q.enable(false);
    q.setText("Loading");
    setQuill(q);
  }, []);

  // async function handleExport() {
  //   if (!quill) return;

  //   try {
  //     const delta = quill.getContents();
  //     const children = [];

  //     const editorElement = document.querySelector(".ql-editor");

  //     for (const op of delta.ops) {
  //       if (op.insert && typeof op.insert === "string") {
  //         children.push(
  //           new Paragraph({
  //             text: op.insert.trim(),
  //           })
  //         );
  //       } else if (op.insert && op.insert.image) {
  //         const src = op.insert.image;

  //         if (src.startsWith("data:image")) {
  //           const base64Data = src.split(",")[1];
  //           const buffer = Uint8Array.from(atob(base64Data), (c) =>
  //             c.charCodeAt(0)
  //           );

  //           // Find the corresponding image in the editor DOM
  //           const imageElement = editorElement?.querySelector<HTMLImageElement>(
  //             `img[src="${src}"]`
  //           );

  //           // Get image dimensions
  //           const width = imageElement?.naturalWidth || 300; // Default to 300px
  //           const height = imageElement?.naturalHeight || 200; // Default to 200px

  //           children.push(
  //             new Paragraph({
  //               children: [
  //                 new ImageRun({
  //                   data: buffer,
  //                   transformation: { width, height },
  //                   type: "png",
  //                 }),
  //               ],
  //             })
  //           );
  //         }
  //       }
  //     }

  //     const doc = new Document({
  //       sections: [
  //         {
  //           children,
  //         },
  //       ],
  //     });

  //     const buffer = await Packer.toBlob(doc);
  //     saveAs(buffer, `Meeting_Minutes_${date}_${time}.docx`);
  //   } catch (error) {
  //     toast("Failed to export document. Please try again.");
  //   }
  // }

  async function fetchComments() {
    if (!meetingId) return;
    try {
      const response = await fetch(`${server}/api/document/${meetingId}`);
      const data = await response.json();
      setComments(data.comments);
      if (quill) {
        quill.setContents(data.content);

        // Remove highlights for deleted comments
        if (data.comments) {
          setComments(data.comments);
        }
      }
    } catch (error) {
      toast.error("Failed to fetch meeting comments data:", error);
    }
  }

  async function handleAddComment(quillInstance: any) {
    const range = quillInstance.getSelection();
    if (!range || range.length === 0) {
      toast("Please select text to add a comment.");
      return;
    }

    const selectedText = quillInstance.getText(range.index, range.length);
    const comment = prompt("Add your comment:");

    if (comment) {
      const commentId = Date.now(); // Generate a unique ID for each comment

      const response = await fetch(
        `${server}/api/document/updateComments/${meetingId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: commentId,
            text: selectedText,
            comment: comment,
            range: range,
          }),
        }
      );

      if (!response.ok) {
        toast("Failed to update the comment");
        return;
      }
      setComments((prevComments) => [
        ...prevComments,
        { id: commentId, text: selectedText, comment, range },
      ]);
      // Format the selected text to indicate it has a comment
      quillInstance.formatText(range.index, range.length, "comment", commentId);
      toast("Successfully updated the comment");
    }
  }

  async function handleResolveComment(commentId: number) {
    const commentToRemove = comments.find((c) => c.id === commentId);

    if (commentToRemove) {
      const { range } = commentToRemove;

      const response = await fetch(
        `${server}/api/document/removeComments/${meetingId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: commentId,
          }),
        }
      );

      if (!response.ok) {
        toast("Failed to remove the comment");
        return;
      }

      // Clear the comment format (remove highlight)
      // quill?.formatText(range.index, range.length, "comment", false);

      // **Remove comment formatting properly**
      if (quill) {
        quill.removeFormat(range.index, range.length);
      }

      // Remove the comment from the state
      setComments((prevComments) =>
        prevComments.filter((comment) => comment.id !== commentId)
      );
      toast("Successfully removed the comment");
    }
  }

  // Send title updates in real-time
  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newTitle = e.target.value;
    setTitle(newTitle);
    socket.emit("send-title-change", newTitle); // Send to socket
  }

  return (
    <>
      {/* <div className="flex w-full h-12 justify-end">
        <Button onClick={handleExport}>Export</Button>
      </div> */}
      <div className="flex w-3/4 h-full justify-center gap-2">
        <img src="/booky_logo.png" alt="Booky Logo" className="w-26 h-14" />
        <Input
          className="w-1/2 h-14 border-none shadow-none focus-visible:border-gray-500"
          style={{ fontSize: "17px" }}
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Enter document title..."
        />
      </div>

      {/* Editor & Comments Container */}
      <div className="flex w-full h-full px-3 gap-4">
        {/* Meeting Minute Container (Centered Document) */}
        <div className="flex-1 flex w-full h-full justify-center">
          <div className="meetingMinuteContainer mt-2" ref={wrapperRef}></div>
        </div>

        {/* Comments Section */}
        {comments.length > 0 && (
          <div className="p-4 mt-4 rounded-lg w-1/4 h-full overflow-y-auto bg-gray-100 shadow">
            <h3 className="font-bold mb-4">Comments</h3>
            {comments.map((c) => (
              <div key={c.id} className="mb-4 border-b pb-2">
                <Label className="font-medium">Commenter: {userEmail}</Label>{" "}
                <br />
                <Label className="font-medium">
                  Selected Text: {c.text}
                </Label>{" "}
                <br />
                <Label className="text-gray-600">Comment: {c.comment}</Label>
                <div className="flex flex-col w-full h-full justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => handleResolveComment(c.id)}
                  >
                    Resolve
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
