import Quill from "quill";
import "quill/dist/quill.snow.css";
import { useCallback, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";
import { Document, ImageRun, Packer, Paragraph } from "docx";
import { saveAs } from "file-saver";
import "./MeetingMinute.css";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const SAVE_INTERVAL_MS = 2000;

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
];

export default function MeetingMinute() {
  const { date, time, meetingId } = useParams();
  const [socket, setSocket] = useState<any>(null);
  const [quill, setQuill] = useState<any>(null);
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
      quill.setContents(document);
      quill.enable();
    });
    socket.emit("get-document", meetingId);
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
      modules: { toolbar: TOOLBAR_OPTIONS },
    });
    q.enable(false);
    q.setText("Loading");
    setQuill(q);
  }, []);

  async function handleExport() {
    if (!quill) return;

    try {
      const delta = quill.getContents();
      const children = [];

      const editorElement = document.querySelector(".ql-editor");

      for (const op of delta.ops) {
        if (op.insert && typeof op.insert === "string") {
          children.push(
            new Paragraph({
              text: op.insert.trim(),
            })
          );
        } else if (op.insert && op.insert.image) {
          const src = op.insert.image;

          if (src.startsWith("data:image")) {
            const base64Data = src.split(",")[1];
            const buffer = Uint8Array.from(atob(base64Data), (c) =>
              c.charCodeAt(0)
            );

            // Find the corresponding image in the editor DOM
            const imageElement = editorElement?.querySelector<HTMLImageElement>(
              `img[src="${src}"]`
            );

            // Get image dimensions
            const width = imageElement?.naturalWidth || 300; // Default to 300px
            const height = imageElement?.naturalHeight || 200; // Default to 200px

            children.push(
              new Paragraph({
                children: [
                  new ImageRun({
                    data: buffer,
                    transformation: { width, height },
                    type: "png",
                  }),
                ],
              })
            );
          }
        }
      }

      const doc = new Document({
        sections: [
          {
            children,
          },
        ],
      });

      const buffer = await Packer.toBlob(doc);
      saveAs(buffer, `Meeting_Minutes_${date}_${time}.docx`);
    } catch (error) {
      toast("Failed to export document. Please try again.");
    }
  }

  return (
    <>
      <div className="flex w-full h-full justify-end">
        <Button onClick={handleExport}>Export</Button>
      </div>
      <div className="meetingMinuteContainer mt-4" ref={wrapperRef}></div>
    </>
  );
}
