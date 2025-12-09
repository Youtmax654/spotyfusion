import { createIcon } from "@chakra-ui/react";

const PlaylistIcon = createIcon({
  displayName: "PlaylistIcon",
  defaultProps: {
    fill: "none",
    viewBox: "0 0 20 20",
  },
  path: (
    <>
      <path
        d="M13.3333 4.16675H2.5"
        stroke="currentColor"
        strokeOpacity="0.7"
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.16667 10H2.5"
        stroke="currentColor"
        strokeOpacity="0.7"
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.16667 15.8333H2.5"
        stroke="currentColor"
        strokeOpacity="0.7"
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17.5 13.3334V4.16675"
        stroke="currentColor"
        strokeOpacity="0.7"
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 15.8333C16.3807 15.8333 17.5 14.714 17.5 13.3333C17.5 11.9525 16.3807 10.8333 15 10.8333C13.6193 10.8333 12.5 11.9525 12.5 13.3333C12.5 14.714 13.6193 15.8333 15 15.8333Z"
        stroke="currentColor"
        strokeOpacity="0.7"
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
});

export default PlaylistIcon;
