"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function STBLogo() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="flex items-center"
    >
      <Image
        src="/stb-logo.png"
        alt="STB Logo"
        width={160}
        height={160}
        priority
        className="object-contain"
      />
    </motion.div>
  );
}
