import MusicNoteIcon from "@/icons/MusicNoteIcon";
import { Flex, Icon, Stack, Text } from "@chakra-ui/react";

export default function Header() {
  return (
    <Flex
      as="header"
      alignItems="center"
      gap={3}
      style={{ userSelect: "none" }}
    >
      <Stack
        width="40px"
        height="40px"
        borderRadius="8px"
        alignItems="center"
        justifyContent="center"
        style={{
          background: "linear-gradient(135deg, #1DB954 0%, #1ED760 100%)",
        }}
      >
        <Icon as={MusicNoteIcon} color="white" boxSize={5} />
      </Stack>
      <Text fontSize="xl" fontWeight="bold">
        SpotyFusion
      </Text>
    </Flex>
  );
}
