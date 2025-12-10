import { IconButton } from "@chakra-ui/react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface Props {
  direction: "left" | "right";
  onClick: () => void;
  visible: boolean;
}
export default function ScrollButton({ direction, onClick, visible }: Props) {
  if (!visible) return null;

  return (
    <IconButton
      aria-label={direction === "left" ? "Scroll left" : "Scroll right"}
      position="absolute"
      left={direction === "left" ? 0 : "auto"}
      right={direction === "right" ? 0 : "auto"}
      top="50%"
      transform="translateY(-50%)"
      width="40px"
      height="40px"
      minW="40px"
      borderRadius="full"
      bg="rgba(0, 0, 0, 0.7)"
      color="white"
      onClick={onClick}
      zIndex={10}
      _hover={{ bg: "rgba(0, 0, 0, 0.9)" }}
    >
      {direction === "left" ? <FaChevronLeft /> : <FaChevronRight />}
    </IconButton>
  );
}
