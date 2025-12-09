import { Link as ChakraLink } from "@chakra-ui/react";
import { createLink, type LinkComponent } from "@tanstack/react-router";
import * as React from "react";

type ChakraLinkProps = Omit<
  React.ComponentPropsWithoutRef<typeof ChakraLink>,
  "href"
>;

const ChakraLinkComponent = React.forwardRef<
  HTMLAnchorElement,
  ChakraLinkProps
>((props, ref) => {
  return <ChakraLink ref={ref} {...props} />;
});

const CreatedLinkComponent = createLink(ChakraLinkComponent);

export const Link: LinkComponent<typeof ChakraLinkComponent> = (props) => {
  return (
    <CreatedLinkComponent
      focusRing={"none"}
      _hover={{ textDecoration: "none" }}
      _focus={{ textDecoration: "none" }}
      preload={"intent"}
      {...props}
    />
  );
};
