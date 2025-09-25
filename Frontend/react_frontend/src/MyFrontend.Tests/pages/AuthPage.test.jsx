// src/MyFrontend.Tests/components/AuthPage.test.jsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AuthPage from "../../components/AuthPage";
import * as apiService from "../../services/api";
import { MemoryRouter } from "react-router-dom";

// Mock navigate
const mockedNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedNavigate,
}));

jest.mock("../../services/api");

describe("AuthPage Component", () => {
  const setIsAuthenticated = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders login form by default", () => {
    render(
      <MemoryRouter>
        <AuthPage setIsAuthenticated={setIsAuthenticated} />
      </MemoryRouter>
    );
    expect(screen.getByText("Login")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Username")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
  });

  test("switches to register form", () => {
    render(
      <MemoryRouter>
        <AuthPage setIsAuthenticated={setIsAuthenticated} />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByText("Don't have an account? Register"));
    expect(screen.getByText("Register")).toBeInTheDocument();
  });

  test("login form submits successfully", async () => {
    apiService.loginUser.mockResolvedValue({ token: "123abc" });

    render(
      <MemoryRouter>
        <AuthPage setIsAuthenticated={setIsAuthenticated} />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("Username"), { target: { value: "user" } });
    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "pass" } });

    fireEvent.click(screen.getByRole("button", { name: /Login/i }));

    await waitFor(() => {
      expect(apiService.loginUser).toHaveBeenCalledWith({ username: "user", password: "pass" });
      expect(localStorage.getItem("token")).toBe("123abc");
      expect(setIsAuthenticated).toHaveBeenCalledWith(true);
      expect(mockedNavigate).toHaveBeenCalledWith("/calendar", { replace: true });
    });
  });

  test("register form submits successfully", async () => {
    apiService.registerUser.mockResolvedValue({ message: "Registered" });

    render(
      <MemoryRouter>
        <AuthPage setIsAuthenticated={setIsAuthenticated} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText("Don't have an account? Register"));

    fireEvent.change(screen.getByPlaceholderText("Username"), { target: { value: "newuser" } });
    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "newpass" } });

    window.alert = jest.fn(); // mock alert

    fireEvent.click(screen.getByRole("button", { name: /Register/i }));

    await waitFor(() => {
      expect(apiService.registerUser).toHaveBeenCalledWith({ username: "newuser", password: "newpass" });
      expect(window.alert).toHaveBeenCalledWith("✅ Registration successful! You can login now.");
      expect(screen.getByText("Login")).toBeInTheDocument(); // switched back to login
    });
  });

  test("shows error message on login failure", async () => {
    apiService.loginUser.mockRejectedValue(new Error("Invalid credentials"));

    render(
      <MemoryRouter>
        <AuthPage setIsAuthenticated={setIsAuthenticated} />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("Username"), { target: { value: "user" } });
    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "wrong" } });

    fireEvent.click(screen.getByRole("button", { name: /Login/i }));

    await waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
    });
  });

  test("disables inputs and button while loading", async () => {
    let resolvePromise;
    apiService.loginUser.mockReturnValue(new Promise((res) => (resolvePromise = res)));

    render(
      <MemoryRouter>
        <AuthPage setIsAuthenticated={setIsAuthenticated} />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("Username"), { target: { value: "user" } });
    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "pass" } });

    fireEvent.click(screen.getByRole("button", { name: /Login/i }));

    expect(screen.getByPlaceholderText("Username")).toBeDisabled();
    expect(screen.getByPlaceholderText("Password")).toBeDisabled();
    expect(screen.getByRole("button")).toBeDisabled();

    resolvePromise({ token: "123" });
  });
});
