import { Menu, Layout, notification} from "antd";

export const openSuccessNotification = (message,description) => {
    notification.success({
      message,
      description,
      placement:"topRight"
    });
  };

export const openErrorNotification = (message,description) => {
    notification.error({
      message,
      description,
      placement:"topRight"
    });
  };