import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";

interface HeaderProps {
  onHelpClick: () => void;
}

export default function Header({ onHelpClick }: HeaderProps) {
  const { user, logoutMutation } = useAuth();
  const [, navigate] = useLocation();

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    navigate("/");
  };

  return (
    <header className="bg-white p-4 shadow-sm border-b">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-[#1e293b]">
          Ease Up
        </Link>
        <div className="flex items-center gap-4">
          <button 
            className="p-2 rounded-full hover:bg-gray-100 focus:ring-2 focus:ring-primary min-h-[3.5rem] min-w-[3.5rem] flex items-center justify-center"
            onClick={onHelpClick}
            aria-label="Help"
          >
            <span className="material-icons text-3xl text-[#475569]">help_outline</span>
          </button>
          
          {user ? (
            <>
              <Link href="/profile" aria-label="Go to profile">
                <Avatar className="h-12 w-12 cursor-pointer">
                  <AvatarFallback className="bg-[#373276] text-white text-lg">
                    {user.fullName ? user.fullName[0] : user.username[0]}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <Button 
                variant="outline" 
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
              >
                {logoutMutation.isPending ? "Logging out..." : "Logout"}
              </Button>
            </>
          ) : (
            <Button 
              variant="default" 
              onClick={() => navigate("/auth")}
            >
              Login / Register
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
