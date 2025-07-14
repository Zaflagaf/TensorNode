"use client";
import { motion } from "framer-motion";
import "./page.scss";

export default function App() {
  return (
    <motion.div
      className="flex items-center justify-center w-full h-screen bg-black"
      animate={{
        opacity: [1, 0],
      }}
      transition={{ duration: 0.15, delay: 5, repeat: 0 }}
    >
      <motion.svg
        animate={{
          rotate: [0, 180, 360],
        }}
        transition={{
          repeat: Infinity,
          duration: 2,
          ease: "easeInOut",
        }}
        className="w-60"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 44.52 30.35"
      >
        <path
          className="cls-1"
          d="M29.35,15.17h7.09c3.91,0,7.09-3.17,7.09-7.09h0c0-3.91-3.17-7.09-7.09-7.09h-7.09s0,0,0,0c-7.83,0-14.17,6.35-14.17,14.17h0s-7.09,0-7.09,0c-3.91,0-7.09,3.17-7.09,7.09h0c0,3.91,3.17,7.09,7.09,7.09h7.09s0,0,0,0c7.83,0,14.17-6.35,14.17-14.17h0Z"
        />
        <path
          className="cls-2"
          d="M29.35,15.17h7.09c3.91,0,7.09,3.17,7.09,7.09h0c0,3.91-3.17,7.09-7.09,7.09h-7.09s0,0,0,0c-7.83,0-14.17-6.35-14.17-14.17h0s-7.09,0-7.09,0c-3.91,0-7.09-3.17-7.09-7.09h0c0-3.91,3.17-7.09,7.09-7.09h7.09s0,0,0,0c7.83,0,14.17,6.35,14.17,14.17h0Z"
        />
      </motion.svg>
    </motion.div>
  );
}
