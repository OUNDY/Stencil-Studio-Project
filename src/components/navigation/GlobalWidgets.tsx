import { FloatingCart } from "./FloatingCart";
import { ChatbotWidget } from "./ChatbotWidget";
import { ThemeSwitcher } from "./ThemeSwitcher";

export const GlobalWidgets = () => {
  return (
    <>
      <ThemeSwitcher />
      <ChatbotWidget />
      <FloatingCart />
    </>
  );
};
