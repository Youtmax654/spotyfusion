import MusicNoteIcon from "@/icons/MusicNoteIcon";
import { Center, Flex, Icon, Text } from "@chakra-ui/react";

export default function Header() {
  return (
    <Flex
      as="header"
      alignItems="center"
      gap={3}
      style={{ userSelect: "none" }}
    >
      <Center
        width="40px"
        height="40px"
        borderRadius="8px"
        style={{
          background: "linear-gradient(135deg, #1DB954 0%, #1ED760 100%)",
        }}
      >
        <Icon as={MusicNoteIcon} color="white" boxSize={5} />
      </Center>
      <Text fontSize="xl" fontWeight="bold">
        SpotyFusion
      </Text>
    </Flex>
  );
}
