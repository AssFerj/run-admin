"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Lock, Mail, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError("Credenciais inválidas ou sem permissão.");
      } else {
        router.push("/admin");
        router.refresh();
      }
    } catch (err) {
      setError("Erro de conexão com o sistema de autenticação.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center font-body-md selection:bg-primary selection:text-on-primary kinetic-bg p-gutter">
      <div className="w-full max-w-md bg-surface-container-lowest border border-outline-variant p-8 sm:p-12 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-primary neon-glow-orange"></div>
        <div className="absolute -right-20 -top-20 opacity-5 group-hover:opacity-10 transition-opacity">
          <Lock className="w-64 h-64 text-primary" />
        </div>
        
        <div className="relative z-10">
          <h1 className="font-headline-lg text-primary neon-text-orange uppercase italic leading-none tracking-tighter mb-2">RACE ADMIN</h1>
          <p className="font-label-sm text-on-surface-variant uppercase tracking-widest mb-10 opacity-70">Acesso Restrito</p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-[10px] text-on-surface-variant uppercase font-bold tracking-widest mb-2">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/50" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-surface-container border-0 border-l-4 border-primary focus:ring-0 focus:border-secondary text-on-background font-label-sm py-4 pl-12 uppercase placeholder:opacity-30 italic transition-all"
                  placeholder="DIGITE SEU E-MAIL"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-on-surface-variant uppercase font-bold tracking-widest mb-2">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/50" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-surface-container border-0 border-l-4 border-primary focus:ring-0 focus:border-secondary text-on-background font-label-sm py-4 pl-12 uppercase placeholder:opacity-30 italic transition-all"
                  placeholder="DIGITE SUA SENHA"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-secondary/10 border-l-4 border-secondary p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-secondary" />
                <p className="text-[10px] text-secondary uppercase font-bold tracking-wider">{error}</p>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary text-on-primary font-bold font-label-sm uppercase tracking-widest py-5 slant-cut hover:bg-secondary hover:text-on-secondary hover:neon-glow-pink transition-all flex justify-center items-center gap-2 disabled:opacity-50"
            >
              {loading ? "Autenticando..." : "Entrar no Sistema"}
            </button>
          </form>
        </div>
      </div>
      
      <p className="text-[10px] text-on-surface-variant/50 uppercase tracking-widest mt-12 text-center">
        © 2024 RACE ADMIN PRO. ACESSO MONITORADO.
      </p>
    </div>
  );
}
