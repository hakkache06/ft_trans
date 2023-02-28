import {
  IconUsers,
  IconLock,
  IconEyeOff,
  IconArrowsLeftRight,
} from "@tabler/icons-react";

export const types = {
  public: {
    label: "Public",
    icon: <IconUsers size={16} />,
  },
  protected: {
    label: "Protected",
    icon: <IconLock size={16} />,
  },
  dm: {
    label: null,
    icon: <IconArrowsLeftRight size={16} />,
  },
  private: {
    label: "Private",
    icon: <IconEyeOff size={16} />,
  },
};

export const backgrounds = [
  "/backgrounds/1.jpeg",
  "/backgrounds/2.jpeg",
  "/backgrounds/3.png",
];
