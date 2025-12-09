import { Button, Icon } from "@chakra-ui/react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface Props {
  direction: "left" | "right";
  onClick: () => void;
  visible: boolean;
}
export default function ScrollButton({ direction, onClick, visible }: Props) {
  return (
    <Button
      position="absolute"
      left={direction === "left" ? 0 : "auto"}
      right={direction === "right" ? 0 : "auto"}
      top="50%"
      transform="translateY(-50%)"
      width="48px"
      height="48px"
      p={0}
      borderRadius="full"
      border="1px solid"
      borderColor="border.emphasized"
      bg="spotify.darker"
      color="white"
      onClick={onClick}
      visibility={visible ? "visible" : "hidden"}
      zIndex={2}
    >
      <Icon
        as={direction === "left" ? FaChevronLeft : FaChevronRight}
        boxSize={4}
      />
    </Button>
  );
}
