import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useIntl } from "react-intl";
import { SearchInput } from "~/components/SearchInput";
import MenuIcon from "~/icons/menu.svg?react";
import HomeIcon from "~/icons/home.svg?react";
import PersonIcon from "~/icons/person.svg?react";

export const Route = createFileRoute("/_layout")({
  component: RouteComponent,
});

function RouteComponent() {
  const intl = useIntl();

  return (
    <div className="drawer not-md:drawer-end lg:drawer-open">
      <input id="nav-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
        <div className="navbar bg-base-100 shadow-sm sticky top-0 z-10 hidden md:flex">
          <div className="flex-1 lg:hidden gap-2 navbar-start">
            <label className="btn btn-square" htmlFor="nav-drawer">
              <MenuIcon className="size-6" />
            </label>
            <Link to="/" className="home-title">
              {intl.formatMessage({ id: "title" })}
            </Link>
          </div>
          <div className="navbar-start hidden lg:flex">
            <SearchInput className="input input-ghost" />
          </div>
          <div className="navbar-end">
            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-circle avatar"
              >
                <PersonIcon className="size-6" />
              </div>
              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
              >
                <li>
                  <a className="justify-between">
                    Profile
                    <span className="badge">New</span>
                  </a>
                </li>
                <li>
                  <a>Settings</a>
                </li>
                <li>
                  <a>Logout</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <main>
          <Outlet />
        </main>
        <div className="dock md:hidden">
          <button>
            <HomeIcon className="size-6" />
            <span className="dock-label">Home</span>
          </button>

          <button className="dock-active">
            <PersonIcon className="size-6" />
            <span className="dock-label">Person</span>
          </button>

          <label htmlFor="nav-drawer">
            <MenuIcon className="size-6" />
            <span className="dock-label">menu</span>
          </label>
        </div>
      </div>
      <div className="drawer-side">
        <label
          htmlFor="nav-drawer"
          aria-label="close sidebar"
          className="drawer-overlay"
        />
        <ul className="menu bg-base-200 text-base-content w-80 pt-0 min-h-full">
          {/* Sidebar content here */}
          <div className="sticky top-0 z-10 navbar bg-base-200 shadow-sm">
            <Link to="/" className="home-title hidden lg:inline">
              {intl.formatMessage({ id: "title" })}
            </Link>

            <SearchInput className="input input-ghost lg:hidden" />
          </div>

          <li>
            <a>Sidebar Item 1</a>
          </li>
          <li>
            <a>Sidebar Item 2</a>
          </li>
        </ul>
      </div>
    </div>
  );
}
