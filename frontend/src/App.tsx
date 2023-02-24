import { Link, Navigate, Outlet } from "react-router-dom";
import { Navbar, Avatar, Dropdown } from "flowbite-react";
import logo from "./assets/logo.png";
import { api, useAuth } from "./utils";
import { useEffect, useState } from "react";

export default function App() {
  const { token, tfa_required, logout } = useAuth();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (!token || tfa_required) return;
    api
      .get("user/profile")
      .json<any>()
      .then((data) => setUser(data));
  }, []);

  if (!token) return <Navigate to="/login" />;
  if (tfa_required) return <Navigate to="/tfa" />;

  return (
    <>
      <div className="container mx-auto">
        <Navbar fluid={true} rounded={true}>
          <Link to="">
            <Navbar.Brand>
              <img src={logo} className="mr-3 h-6 sm:h-9" alt="Logo" />
              <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
                Trandandan
              </span>
            </Navbar.Brand>
          </Link>
          <div className="flex md:order-2">
            {user && (
              <Dropdown
                arrowIcon={false}
                inline={true}
                label={
                  <Avatar
                    alt="User settings"
                    img={user.avatar}
                    rounded={true}
                  />
                }
              >
                <Dropdown.Header>
                  <span className="block text-sm font-medium">{user.name}</span>
                </Dropdown.Header>
                <Link to="profile">
                  <Dropdown.Item>Profile</Dropdown.Item>
                </Link>
                <Dropdown.Item onClick={logout}>Sign out</Dropdown.Item>
              </Dropdown>
            )}
            <Navbar.Toggle />
          </div>
          <Navbar.Collapse>
            <Link to="">
              <Navbar.Link active={true}>Home</Navbar.Link>
            </Link>
            <Link to="games">
              <Navbar.Link>Games</Navbar.Link>
            </Link>
            <Link to="chat">
              <Navbar.Link>Chat</Navbar.Link>
            </Link>
          </Navbar.Collapse>
        </Navbar>
        <Outlet />
      </div>
    </>
  );
}
