import { Link } from "wouter";

interface BottomNavigationProps {
  currentPath: string;
}

export default function BottomNavigation({ currentPath }: BottomNavigationProps) {
  return (
    <nav className="bg-white border-t border-neutral-200 fixed bottom-0 w-full shadow-lg z-10">
      <div className="container mx-auto">
        <div className="flex justify-around">
          <Link href="/">
            <a 
              className={`py-3 px-4 flex flex-col items-center w-full min-h-[4.5rem] focus:outline-none focus:ring-2 focus:ring-primary ${
                currentPath === "/" ? "text-primary" : "text-neutral-500 hover:text-primary"
              }`}
              aria-label="Home"
            >
              <span className="material-icons text-3xl">home</span>
              <span className="text-sm mt-1">Home</span>
            </a>
          </Link>
          <Link href="/bookings">
            <a 
              className={`py-3 px-4 flex flex-col items-center w-full min-h-[4.5rem] focus:outline-none focus:ring-2 focus:ring-primary ${
                currentPath === "/bookings" ? "text-primary" : "text-neutral-500 hover:text-primary"
              }`}
              aria-label="Bookings"
            >
              <span className="material-icons text-3xl">event_note</span>
              <span className="text-sm mt-1">Bookings</span>
            </a>
          </Link>
          <Link href="/messages">
            <a 
              className={`py-3 px-4 flex flex-col items-center w-full min-h-[4.5rem] focus:outline-none focus:ring-2 focus:ring-primary ${
                currentPath === "/messages" ? "text-primary" : "text-neutral-500 hover:text-primary"
              }`}
              aria-label="Messages"
            >
              <span className="material-icons text-3xl">message</span>
              <span className="text-sm mt-1">Messages</span>
            </a>
          </Link>
          <Link href="/profile">
            <a 
              className={`py-3 px-4 flex flex-col items-center w-full min-h-[4.5rem] focus:outline-none focus:ring-2 focus:ring-primary ${
                currentPath === "/profile" ? "text-primary" : "text-neutral-500 hover:text-primary"
              }`}
              aria-label="Profile"
            >
              <span className="material-icons text-3xl">person</span>
              <span className="text-sm mt-1">Profile</span>
            </a>
          </Link>
        </div>
      </div>
    </nav>
  );
}
