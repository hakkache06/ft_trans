import { IconUsers, IconLock, IconEyeOff } from "@tabler/icons-react";

export const types = {
  public: {
    label: "Public",
    icon: <IconUsers size={16} />,
  },
  protected: {
    label: "Protected",
    icon: <IconLock size={16} />,
  },
  private: {
    label: "Private",
    icon: <IconEyeOff size={16} />,
  },
};
