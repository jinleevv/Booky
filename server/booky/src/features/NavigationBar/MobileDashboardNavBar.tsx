import { motion, useCycle } from "framer-motion";
import { MenuToggle } from "./Toggles";
import MobileDashboardNavMenu from "./MobileDashboardNavMenu";

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

export default function MobileDashboardNavBar() {
  const [isOpen, toggleOpen] = useCycle(false, true);

  return (
    <motion.nav
      initial={false}
      animate={isOpen ? "open" : "closed"}
      className="flex w-full justify-end z-50 border-b-1"
    >
      <motion.div
        className="absolute -top-5 right-0 w-screen h-screen bg-gradient-to-b from-white to-red-100 rounded-l-2xl shadow-lg border-l"
        variants={sidebar}
      >
        <MobileDashboardNavMenu />
      </motion.div>

      <div className="relative z-50 mt-4 mr-4">
        <MenuToggle toggle={() => toggleOpen()} />
      </div>
    </motion.nav>
  );
}
