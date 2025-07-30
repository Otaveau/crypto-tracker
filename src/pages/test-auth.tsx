// src/pages/test-auth.tsx
import { useState } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';

export default function TestAuth() {
  const { data: session, status } = useSession();
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('Utilisateur Test');
  const [message, setMessage] = useState('');

  const handleSignup = async () => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage('✅ Inscription réussie ! Vous pouvez maintenant vous connecter.');
      } else {
        setMessage(`❌ ${data.message}`);
      }
    } catch (error) {
      setMessage('❌ Erreur lors de l\'inscription');
    }
  };

  const handleSignin = async () => {
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.ok) {
      setMessage('✅ Connexion réussie !');
    } else {
      setMessage(`❌ ${result?.error || 'Erreur de connexion'}`);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-white">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-white text-center mb-8">
          🔐 Test Authentification
        </h1>

        {session ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h2 className="text-xl text-white mb-4">Connecté ✅</h2>
            <p className="text-gray-300 mb-2">Email: {session.user?.email}</p>
            <p className="text-gray-300 mb-4">Nom: {session.user?.name}</p>
            <button
              onClick={() => signOut()}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg"
            >
              Se déconnecter
            </button>
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 space-y-4">
            <div>
              <label className="block text-gray-300 text-sm mb-2">Nom</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm mb-2">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSignup}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg"
              >
                Sign in
              </button>
              <button
                onClick={handleSignin}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg"
              >
                Login
              </button>
            </div>

            {message && (
              <div className="mt-4 p-3 bg-white/10 rounded-lg">
                <p className="text-white text-sm">{message}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}