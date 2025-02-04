import { motion } from "framer-motion";
import { MenuItem } from "./MenuItems";
import { FileUser, LogIn, Vote, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const variants = {
  open: {
    transition: { staggerChildren: 0.07, delayChildren: 0.2 },
  },
  closed: {
    transition: { staggerChildren: 0.05, staggerDirection: -1 },
  },
};

const Items = [
  { id: "0", text: "Task Flow", icon: <Workflow />, link: "/taskFlow" },
  { id: "1", text: "Availability Poll", icon: <Vote />, link: "/poll" },
];

export default function MobileNavMenu() {
  const navigate = useNavigate();
  return (
    <motion.div
      variants={variants}
      className="flex flex-col h-full justify-between py-20 px-3"
    >
      {/* Navigation Items */}
      <motion.ul className="flex flex-col">
        {Items.map((item) => (
          <MenuItem
            id={item.id}
            key={item.id}
            text={item.text}
            icon={item.icon}
            link={item.link}
          />
        ))}
      </motion.ul>

      {/* Bottom Buttons */}
      <motion.div className="flex flex-col items-center space-y-3 pb-5 font-outfit">
        <Button
          variant="outline"
          className="flex w-full h-12 rounded-2xl justify-start gap-4"
          onClick={() => navigate("/login")}
        >
          <LogIn />
          Log In
        </Button>

        <Button
          className="flex w-full h-12 py-3 rounded-2xl justify-start gap-4"
          onClick={() => navigate("/register")}
        >
          <FileUser />
          Get Started
        </Button>
      </motion.div>
    </motion.div>
  );
}
