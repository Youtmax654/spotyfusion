import { createIcon } from "@chakra-ui/react";

const SaveIcon = createIcon({
    displayName: "SaveIcon",
    defaultProps: {
        fill: "none",
        viewBox: "0 0 20 20",
    },
    path: (
        <>
            <path
                d="M16.6667 17.5H3.33333C2.89131 17.5 2.46738 17.3244 2.15482 17.0118C1.84226 16.6993 1.66667 16.2754 1.66667 15.8333V4.16667C1.66667 3.72464 1.84226 3.30072 2.15482 2.98816C2.46738 2.67559 2.89131 2.5 3.33333 2.5H13.3333L18.3333 7.5V15.8333C18.3333 16.2754 18.1577 16.6993 17.8452 17.0118C17.5326 17.3244 17.1087 17.5 16.6667 17.5Z"
                stroke="currentColor"
                strokeWidth="1.66667"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M14.1667 17.5V10.8333H5.83333V17.5"
                stroke="currentColor"
                strokeWidth="1.66667"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M5.83333 2.5V7.5H12.5"
                stroke="currentColor"
                strokeWidth="1.66667"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </>
    ),
});

export default SaveIcon;
