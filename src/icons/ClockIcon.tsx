import { createIcon } from "@chakra-ui/react";

const ClockIcon = createIcon({
  displayName: "ClockIcon",
  defaultProps: {
    fill: "none",
    viewBox: "0 0 16 16",
  },
  path: (
    <>
      <path
        d="M8 4V8L10.6667 9.33333"
        stroke="currentColor"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.00001 14.6666C11.6819 14.6666 14.6667 11.6818 14.6667 7.99992C14.6667 4.31802 11.6819 1.33325 8.00001 1.33325C4.31811 1.33325 1.33334 4.31802 1.33334 7.99992C1.33334 11.6818 4.31811 14.6666 8.00001 14.6666Z"
        stroke="currentColor"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
});

export default ClockIcon;
