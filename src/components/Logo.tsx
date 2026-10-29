import Image from "next/image";
import logoDark from "@/assets/logo.png";
import logoLight from "@/assets/logo-light.png";

export default function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className={`logo${light ? " logo--light" : ""}`} aria-label="Cyberspace">
      <Image src={light ? logoLight : logoDark} alt="Cyberspace" width={70} height={60} priority />
    </span>
  );
}
