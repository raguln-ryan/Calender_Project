// src/MyFrontend.Tests/components/ThemeToggle.test.jsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ThemeToggle from "../../components/ThemeToggle";

describe("ThemeToggle Component", () => {
  const toggleDarkMode = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders the theme label", () => {
    render(<ThemeToggle darkMode={false} toggleDarkMode={toggleDarkMode} />);
    expect(screen.getByText("Theme")).toBeInTheDocument();
  });

  test("renders the correct icon for light mode", () => {
    render(<ThemeToggle darkMode={false} toggleDarkMode={toggleDarkMode} />);
    expect(screen.getByText("☀️")).toBeInTheDocument();
  });

  test("renders the correct icon for dark mode", () => {
    render(<ThemeToggle darkMode={true} toggleDarkMode={toggleDarkMode} />);
    expect(screen.getByText("🌙")).toBeInTheDocument();
  });

  test("checkbox reflects the darkMode prop", () => {
    const { rerender } = render(<ThemeToggle darkMode={false} toggleDarkMode={toggleDarkMode} />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeChecked();

    rerender(<ThemeToggle darkMode={true} toggleDarkMode={toggleDarkMode} />);
    expect(checkbox).toBeChecked();
  });

  test("calls toggleDarkMode when checkbox is clicked", () => {
    render(<ThemeToggle darkMode={false} toggleDarkMode={toggleDarkMode} />);
    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);
    expect(toggleDarkMode).toHaveBeenCalledTimes(1);
  });
});
