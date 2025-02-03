import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const variants = {
  open: {
    y: 0,
    opacity: 1,
    transition: {
      y: { stiffness: 1000, velocity: -100 },
    },
  },
  closed: {
    y: 50,
    opacity: 0,
    transition: {
      y: { stiffness: 1000 },
    },
  },
};

export const MenuItem = ({ id, text, icon }) => {
  return (
    <>
      <motion.li
        variants={variants}
        className="flex font-outfit px-1 py-2 w-full rounded-md cursor-pointer transition-colors"
      >
        <Button
          className="flex w-full h-12 rounded-2xl justify-start gap-4"
          variant="outline"
        >
          {icon}
          {text}
        </Button>
      </motion.li>
    </>
  );
};
