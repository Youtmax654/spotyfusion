import { pickPalette } from "@/lib/chakra";
import { firstCharToUpper } from "@/lib/utils";
import { Avatar, Badge, Card, Flex, Text } from "@chakra-ui/react";
import { useLoaderData } from "@tanstack/react-router";

export default function ProfileCard() {
  const { user } = useLoaderData({ from: "/dashboard" });

  return (
    <Card.Root width="100%" border="none">
      <Card.Body
        borderRadius="8px"
        padding="16px"
        display="flex"
        flexDirection="row"
        alignItems="center"
        gap={2}
        bg="bg.emphasized"
      >
        <Avatar.Root
          shape="full"
          size="md"
          colorPalette={pickPalette(user?.display_name || "User")}
        >
          <Avatar.Fallback name={user?.display_name || "User"} />
          <Avatar.Image src={user?.images?.[0]?.url} />
        </Avatar.Root>
        <Flex direction="column" gap={1}>
          <Text fontWeight="semibold">{user?.display_name}</Text>
          <Badge
            bg={user?.product === "premium" ? "green" : "gray"}
            color="white"
            width="fit-content"
            borderRadius="full"
          >
            {firstCharToUpper(user?.product || "other")}
          </Badge>
        </Flex>
      </Card.Body>
    </Card.Root>
  );
}
