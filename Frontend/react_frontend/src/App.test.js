// src/MyFrontend.Tests/components/App.test.jsx
import React from "react";
import { render, screen } from "@testing-library/react";
import App from "../../App";
import AuthPage from "../../pages/AuthPage";
import CalendarPage from "../../pages/CalendarPage";
import { MemoryRouter } from "react-router-dom";

// Mock the pages
jest.mock("../../pages/AuthPage", () => ({ setIsAuthenticated }) => (
  <div data-testid="auth-page">AuthPage</div>
));
jest.mock("../../pages/CalendarPage", () => ({ setIsAuthenticated }) => (
  <div data-testid="calendar-page">CalendarPage</div>
));

describe("App Routing", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("renders AuthPage when not authenticated and at root", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByTestId("auth-page")).toBeInTheDocument();
  });

  test("redirects to CalendarPage when authenticated and at root", () => {
    localStorage.setItem("token", "123abc");

    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByTestId("calendar-page")).toBeInTheDocument();
  });

  test("redirects to AuthPage when accessing /calendar while not authenticated", () => {
    render(
      <MemoryRouter initialEntries={["/calendar"]}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByTestId("auth-page")).toBeInTheDocument();
  });

  test("renders CalendarPage when accessing /calendar while authenticated", () => {
    localStorage.setItem("token", "123abc");

    render(
      <MemoryRouter initialEntries={["/calendar"]}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByTestId("calendar-page")).toBeInTheDocument();
  });

  test("redirects unknown routes to root", () => {
    render(
      <MemoryRouter initialEntries={["/random-route"]}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByTestId("auth-page")).toBeInTheDocument();
  });
});
