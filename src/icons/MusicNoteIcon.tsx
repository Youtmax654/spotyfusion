import { createIcon } from "@chakra-ui/react";

const MusicNoteIcon = createIcon({
  displayName: "MusicNoteIcon",
  defaultProps: {
    fill: "none",
    viewBox: "0 0 20 20",
  },
  path: (
    <>
      <path
        d="M7.5 15V4.16667L17.5 2.5V13.3333"
        stroke="currentColor"
        strokeOpacity="1"
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 17.5C6.38071 17.5 7.5 16.3807 7.5 15C7.5 13.6193 6.38071 12.5 5 12.5C3.61929 12.5 2.5 13.6193 2.5 15C2.5 16.3807 3.61929 17.5 5 17.5Z"
        stroke="currentColor"
        strokeOpacity="1"
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 15.8333C16.3807 15.8333 17.5 14.714 17.5 13.3333C17.5 11.9525 16.3807 10.8333 15 10.8333C13.6193 10.8333 12.5 11.9525 12.5 13.3333C12.5 14.714 13.6193 15.8333 15 15.8333Z"
        stroke="currentColor"
        strokeOpacity="1"
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
});

export default MusicNoteIcon;
