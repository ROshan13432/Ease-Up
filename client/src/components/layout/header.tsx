import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "wouter";

interface HeaderProps {
  onHelpClick: () => void;
}

export default function Header({ onHelpClick }: HeaderProps) {
  const { user } = useAuth();

  return (
    <header className="bg-primary p-4 text-white shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/">
          <a className="text-2xl font-bold">CareBridge</a>
        </Link>
        <div className="flex items-center gap-4">
          <button 
            className="p-2 rounded-full hover:bg-primary-light focus:ring-2 focus:ring-white min-h-[3.5rem] min-w-[3.5rem] flex items-center justify-center"
            onClick={onHelpClick}
            aria-label="Help"
          >
            <span className="material-icons text-3xl">help_outline</span>
          </button>
          <Link href="/profile">
            <a aria-label="Go to profile">
              <Avatar className="h-12 w-12 cursor-pointer">
                <AvatarFallback className="bg-white text-primary text-lg">
                  {user?.fullName ? user.fullName.charAt(0).toUpperCase() : user?.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </a>
          </Link>
        </div>
      </div>
    </header>
  );
}
