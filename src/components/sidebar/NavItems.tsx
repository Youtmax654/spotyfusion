import { Button, Icon } from "@chakra-ui/react";
import { Link } from "../ui/link";

interface Props {
  path: string;
  label: string;
  icon: React.ElementType;
}
export default function NavItems({ path, label, icon }: Props) {
  return (
    <Button
      asChild
      width="100%"
      variant="ghost"
      justifyContent="flex-start"
      gap={5}
      px={4}
      py={6}
      borderLeftWidth="3px"
    >
      <Link
        to={path}
        activeProps={{
          bg: "bg.emphasized",
          color: "fg",
          fontWeight: "semibold",
          borderLeftColor: "green.500",
        }}
      >
        <Icon as={icon} boxSize={5} />
        {label}
      </Link>
    </Button>
  );
}
