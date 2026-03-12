import { render, screen } from "@solidjs/testing-library";
import App from "./App";

describe("App", () => {
  it("renders the app scaffold header", () => {
    render(() => <App />);
    expect(screen.getByText("Starter UI Scaffold")).toBeInTheDocument();
  });
});
