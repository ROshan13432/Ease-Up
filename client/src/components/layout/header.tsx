import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "wouter";

interface HeaderProps {
  onHelpClick: () => void;
}

export default function Header({ onHelpClick }: HeaderProps) {
  return (
    <header className="bg-white p-4 shadow-sm border-b">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/">
          <a className="text-2xl font-bold text-[#1e293b]">Care Assistant</a>
        </Link>
        <div className="flex items-center gap-4">
          <button 
            className="p-2 rounded-full hover:bg-gray-100 focus:ring-2 focus:ring-primary min-h-[3.5rem] min-w-[3.5rem] flex items-center justify-center"
            onClick={onHelpClick}
            aria-label="Help"
          >
            <span className="material-icons text-3xl text-[#475569]">help_outline</span>
          </button>
          <Link href="/profile">
            <a aria-label="Go to profile">
              <Avatar className="h-12 w-12 cursor-pointer">
                <AvatarFallback className="bg-[#373276] text-white text-lg">
                  G
                </AvatarFallback>
              </Avatar>
            </a>
          </Link>
        </div>
      </div>
    </header>
  );
}
