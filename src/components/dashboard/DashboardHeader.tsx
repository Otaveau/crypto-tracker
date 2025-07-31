import { Wallet, User, LogOut, Plus } from 'lucide-react';
import { signOut } from 'next-auth/react';

interface DashboardHeaderProps {
  userEmail?: string | null;
  userName?: string | null;
  onAddCrypto: () => void;
}

export default function DashboardHeader({ userEmail, userName, onAddCrypto }: DashboardHeaderProps) {
  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <header className="bg-white/10 backdrop-blur-lg border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Wallet className="h-8 w-8 text-purple-400 mr-3" />
            <h1 className="text-xl font-bold text-white">Crypto Portfolio</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-gray-300">
              <User size={20} />
              <span className="hidden sm:block">{userName || userEmail}</span>
            </div>
            
            <button
              onClick={onAddCrypto}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-medium transition-all transform hover:scale-105"
            >
              <Plus size={18} />
              <span className="hidden sm:block">Ajouter</span>
            </button>
            
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-medium transition-colors"
              title="Se déconnecter"
            >
              <LogOut size={18} />
              <span className="hidden sm:block">Déconnexion</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}