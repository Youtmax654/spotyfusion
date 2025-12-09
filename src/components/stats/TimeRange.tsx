import type { TimeRangeType } from "@/schemas/TimeRange";
import { Button } from "@chakra-ui/react";
import { useNavigate, useSearch } from "@tanstack/react-router";

const timeRangeLabels: Record<TimeRangeType, string> = {
  short_term: "4 semaines",
  medium_term: "6 mois",
  long_term: "Tout le temps",
};

export default function TimeRange() {
  const navigate = useNavigate({ from: "/dashboard/stats" });
  const { range: timeRange } = useSearch({
    from: "/dashboard/stats/",
  });

  const handleTimeRangeChange = (newRange: TimeRangeType) => {
    navigate({
      search: (old) => ({ ...old, range: newRange }),
      replace: true,
    });
  };

  return (Object.keys(timeRangeLabels) as TimeRangeType[]).map((rangeKey) => (
    <Button
      key={rangeKey}
      px={4}
      py={2}
      fontSize="sm"
      height="41px"
      fontWeight="semibold"
      borderRadius="full"
      bg={timeRange === rangeKey ? "spotify.white" : "whiteAlpha.100"}
      color={timeRange === rangeKey ? "black" : "white"}
      onClick={() => handleTimeRangeChange(rangeKey)}
      _hover={{
        bg: timeRange === rangeKey ? "spotify.white" : "whiteAlpha.200",
        borderColor: timeRange === rangeKey ? "transparent" : "whiteAlpha.500",
      }}
    >
      {timeRangeLabels[rangeKey]}
    </Button>
  ));
}
