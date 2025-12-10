import { Badge, HStack, Slider, Stack, Text } from "@chakra-ui/react";

interface Props {
  value: number[];
  onChange: (value: number[]) => void;
  label: string;
  description?: string;
}
export default function FeatureSlider({
  value,
  onChange,
  label,
  description,
}: Props) {
  return (
    <Stack gap="8px" width="100%">
      <HStack justifyContent="space-between" width="100%">
        <Text fontWeight="semibold" fontSize="md">
          {label}
        </Text>
        <Badge
          bg="white"
          color="black"
          borderRadius="16px"
          size="md"
          px="8px"
          py="4px"
        >
          {value[0].toFixed(2)}
        </Badge>
      </HStack>

      <Slider.Root
        defaultValue={[50]}
        onValueChange={(e) => onChange([e.value[0] / 100])}
      >
        <Slider.Control>
          <Slider.Track bg="spotify.greenDark" height="6px">
            <Slider.Range bg="spotify.green" />
          </Slider.Track>
          <Slider.Thumb
            index={0}
            boxSize={4}
            bg="spotify.green"
            borderColor="spotify.green"
          ></Slider.Thumb>
        </Slider.Control>
      </Slider.Root>

      {description && (
        <Text fontWeight="normal" fontSize="sm" color="spotify.lightGray">
          {description}
        </Text>
      )}
    </Stack>
  );
}
