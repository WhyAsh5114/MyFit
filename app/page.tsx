import AnimatedShinyText from "@/components/ui/animated-shiny-text";
import BoxReveal from "@/components/ui/box-reveal";
import Ripple from "@/components/ui/ripple";
import { TextAnimate } from "@/components/ui/text-animate";
import { BicepsFlexedIcon, PickaxeIcon } from "lucide-react";
import * as motion from "motion/react-client";
import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="grid place-items-center py-12 gap-4 md:gap-8 overflow-x-clip">
      <motion.div
        className="bg-secondary rounded-full"
        initial={{ scale: 0 }}
        animate={{ scale: 1, transition: { delay: 1 } }}
      >
        <AnimatedShinyText className="inline-flex gap-2 items-center justify-center px-4 py-1 transition ease-out hover:text-neutral-600 hover:duration-300 hover:dark:text-neutral-400">
          <PickaxeIcon strokeWidth={1} className="text-primary" />
          Starting work on MyFit v4
        </AnimatedShinyText>
      </motion.div>
      <div className="grid place-items-center gap-2 py-6 md:py-8">
        <TextAnimate
          animation="slideLeft"
          by="word"
          className="text-2xl md:text-5xl font-bold"
        >
          Complex workout tracker
        </TextAnimate>
        <BoxReveal duration={0.5}>
          <span className="text-sm md:text-lg text-center">
            For people{" "}
            <span className="text-primary">
              who know what they&apos;re doing
            </span>
          </span>
        </BoxReveal>
      </div>
      <motion.div
        className="relative w-full grid place-items-center h-96"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 1.5 } }}
      >
        <Link href="/dashboard">
          <BicepsFlexedIcon className="bg-primary w-16 h-16 md:w-24 md:h-24 p-4 md:p-6 rounded-lg" />
        </Link>
        <Ripple />
      </motion.div>
    </main>
  );
}
