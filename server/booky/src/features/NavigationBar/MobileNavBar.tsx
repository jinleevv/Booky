import { motion, useCycle } from "framer-motion";
import MobileNavMenu from "./MobileNavMenu";
import { MenuToggle } from "./Toggles";

const sidebar = {
  open: (height = 1000) => ({
    clipPath: `circle(${height * 2 + 200}px at calc(100% - 40px) 40px)`,
    transition: {
      type: "spring",
      stiffness: 20,
      restDelta: 2,
    },
  }),
  closed: {
    clipPath: "circle(30px at calc(100% - 40px) 40px)",
    transition: {
      delay: 0.5,
      type: "spring",
      stiffness: 400,
      damping: 40,
    },
  },
};

export default function MobileNavBar() {
  const [isOpen, toggleOpen] = useCycle(false, true);

  return (
    <motion.nav
      initial={false}
      animate={isOpen ? "open" : "closed"}
      className="flex w-full justify-end z-50 pb-3 border-b-1"
    >
      <motion.div
        className="fixed -top-5 right-0 w-[300px] h-screen bg-gradient-to-b from-white to-red-100 rounded-l-2xl shadow-lg border-l"
        variants={sidebar}
      >
        <MobileNavMenu />
      </motion.div>

      <div className="relative z-50 mt-4 mr-4">
        <MenuToggle toggle={() => toggleOpen()} />
      </div>
    </motion.nav>
  );
}
