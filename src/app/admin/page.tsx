"use client";

import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { LayoutDashboard, Users, Package, Settings, UserPlus, HeartHandshake, PackageOpen, Search, Filter, CheckSquare, Square, Edit, ChevronLeft, ChevronRight, UserCog, LogOut, Lock, Trash2, Plus, AlertCircle, Gift, Sparkles, Trophy, Ticket, Download, Menu, X } from "lucide-react";
import { signOut, useSession } from "next-auth/react";

interface Registration {
  id: string;
  nome: string;
  cpf: string;
  nascimento: string;
  sexo: string;
  whatsapp: string;
  createdAt: string;
  kit_entregue?: boolean;
  sorteado?: boolean;
  prize_id?: string;
  categoria?: string;
}

interface Category {
  id: string;
  nome: string;
  createdAt: string;
}

interface Kit {
  id: string;
  nome: string;
  descricao: string;
  categoria_vinculada: string;
  createdAt: string;
}

interface Prize {
  id: string;
  nome: string;
  descricao: string;
  winner_id: string | null;
  winner_name: string | null;
  raffledAt: string | null;
  createdAt: string;
}

interface AdminUser {
  id: string;
  nome: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("TODOS");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Form states for Users
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUser, setNewUser] = useState({ nome: "", email: "", password: "", role: "admin" });
  const [userError, setUserError] = useState("");
  const [savingUser, setSavingUser] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [modalMessage, setModalMessage] = useState<{ title: string, message: string, type?: "error" | "info" } | null>(null);

  // Prizes state
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [loadingPrizes, setLoadingPrizes] = useState(true);
  const [isAddingPrize, setIsAddingPrize] = useState(false);
  const [newPrize, setNewPrize] = useState({ nome: "", descricao: "" });
  const [rafflingPrizeId, setRafflingPrizeId] = useState<string | null>(null);
  const [prizeToDelete, setPrizeToDelete] = useState<string | null>(null);

  // Categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  // Edit Athlete state
  const [editingAthlete, setEditingAthlete] = useState<Registration | null>(null);
  const [savingAthlete, setSavingAthlete] = useState(false);
  const [athleteToDelete, setAthleteToDelete] = useState<Registration | null>(null);

  // Add Athlete state
  const [isAddingAthlete, setIsAddingAthlete] = useState(false);
  const [newAthlete, setNewAthlete] = useState({ nome: "", cpf: "", nascimento: "", sexo: "MASCULINO", whatsapp: "", categoria: "" });

  // Kits state
  const [kits, setKits] = useState<Kit[]>([]);
  const [loadingKits, setLoadingKits] = useState(true);
  const [isAddingKit, setIsAddingKit] = useState(false);
  const [newKit, setNewKit] = useState({ nome: "", descricao: "", categoria_vinculada: "" });
  const [kitToDelete, setKitToDelete] = useState<string | null>(null);

  // Export state
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportFilters, setExportFilters] = useState({ statusInscricao: "TODAS", kitStatus: "TODOS", categoria: "TODAS" });

  // Mobile Menu State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Registrations
    const q = query(collection(db, "registrations"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const regs: Registration[] = [];
      querySnapshot.forEach((doc) => {
        regs.push({ id: doc.id, ...doc.data() } as Registration);
      });
      setRegistrations(regs);
      setLoading(false);
    });

    // Users
    const qUsers = query(collection(db, "admin_users"), orderBy("createdAt", "desc"));
    const unsubUsers = onSnapshot(qUsers, (querySnapshot) => {
      const u: AdminUser[] = [];
      querySnapshot.forEach((doc) => {
        u.push({ id: doc.id, ...doc.data() } as AdminUser);
      });
      setAdminUsers(u);
      setLoadingUsers(false);
    });

    // Prizes
    const qPrizes = query(collection(db, "prizes"), orderBy("createdAt", "desc"));
    const unsubPrizes = onSnapshot(qPrizes, (querySnapshot) => {
      const p: Prize[] = [];
      querySnapshot.forEach((doc) => {
        p.push({ id: doc.id, ...doc.data() } as Prize);
      });
      setPrizes(p);
      setLoadingPrizes(false);
    });

    // Categories
    const qCategories = query(collection(db, "categories"), orderBy("createdAt", "asc"));
    const unsubCategories = onSnapshot(qCategories, (querySnapshot) => {
      const c: Category[] = [];
      querySnapshot.forEach((doc) => {
        c.push({ id: doc.id, ...doc.data() } as Category);
      });
      setCategories(c);
      setLoadingCategories(false);
    });

    // Kits
    const qKits = query(collection(db, "kits"), orderBy("createdAt", "desc"));
    const unsubKits = onSnapshot(qKits, (querySnapshot) => {
      const k: Kit[] = [];
      querySnapshot.forEach((doc) => {
        k.push({ id: doc.id, ...doc.data() } as Kit);
      });
      setKits(k);
      setLoadingKits(false);
    });

    return () => { unsubscribe(); unsubUsers(); unsubPrizes(); unsubCategories(); unsubKits(); };
  }, []);

  const navItems = [
    { label: "Dashboard", icon: <LayoutDashboard /> },
    { label: "Atletas", icon: <Users /> },
    { label: "Kits", icon: <Package /> },
    { label: "Sorteios", icon: <Gift /> },
    { label: "Usuários", icon: <UserCog /> },
    { label: "Configurações", icon: <Settings /> },
  ];

  const filteredRegistrations = registrations.filter(reg => {
    let matchesSearch = true;
    if (searchQuery) {
      const searchLow = searchQuery.toLowerCase();
      const nameMatch = reg.nome?.toLowerCase().includes(searchLow);
      const queryNumbers = searchLow.replace(/\D/g, '');
      const cpfMatch = queryNumbers.length > 0 && reg.cpf?.replace(/\D/g, '').includes(queryNumbers);
      matchesSearch = !!(nameMatch || cpfMatch);
    }

    let matchesFilter = true;
    if (filterType !== "TODOS") {
      if (filterType === "KIT: ENTREGUE") matchesFilter = !!reg.kit_entregue;
      else if (filterType === "KIT: PENDENTE") matchesFilter = !reg.kit_entregue;
      else if (filterType.startsWith("CAT: ")) {
        const catName = filterType.replace("CAT: ", "");
        const regCat = reg.categoria || "NÃO DEFINIDA";
        matchesFilter = regCat === catName;
      }
    }

    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filteredRegistrations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRegistrations = filteredRegistrations.slice(startIndex, startIndex + itemsPerPage);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingUser(true);
    setUserError("");

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser)
      });

      const data = await res.json();
      if (!res.ok) {
        setUserError(data.error || "Erro ao adicionar usuário.");
      } else {
        setIsAddingUser(false);
        setNewUser({ nome: "", email: "", password: "", role: "admin" });
      }
    } catch (err) {
      setUserError("Erro de conexão ao adicionar usuário.");
    } finally {
      setSavingUser(false);
    }
  };

  const handleDeleteUser = (id: string) => {
    setUserToDelete(id);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      const res = await fetch(`/api/admin/users?id=${userToDelete}`, { method: "DELETE" });
      if (!res.ok) setModalMessage({ title: "Erro", message: "Erro ao excluir usuário.", type: "error" });
    } catch (err) {
      setModalMessage({ title: "Erro", message: "Erro de conexão ao excluir usuário.", type: "error" });
    } finally {
      setUserToDelete(null);
    }
  };

  const handleAddPrize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrize.nome) return;
    try {
      await addDoc(collection(db, "prizes"), {
        nome: newPrize.nome,
        descricao: newPrize.descricao,
        winner_id: null,
        winner_name: null,
        raffledAt: null,
        createdAt: new Date().toISOString()
      });
      setNewPrize({ nome: "", descricao: "" });
      setIsAddingPrize(false);
    } catch (err) {
      setModalMessage({ title: "Erro", message: "Erro ao adicionar brinde. Verifique as permissões de acesso.", type: "error" });
    }
  };

  const handleRunRaffle = async (prize: Prize) => {
    const eligible = registrations.filter(r => !r.sorteado);
    if (eligible.length === 0) {
      setModalMessage({ title: "Aviso", message: "Nenhum atleta elegível para o sorteio! (Todos já foram sorteados ou a lista está vazia)", type: "info" });
      return;
    }

    setRafflingPrizeId(prize.id);

    setTimeout(async () => {
      const winner = eligible[Math.floor(Math.random() * eligible.length)];

      try {
        await updateDoc(doc(db, "prizes", prize.id), {
          winner_id: winner.id,
          winner_name: winner.nome || "Anônimo",
          raffledAt: new Date().toISOString()
        });

        await updateDoc(doc(db, "registrations", winner.id), {
          sorteado: true,
          prize_id: prize.id
        });
      } catch (err) {
        setModalMessage({ title: "Erro", message: "Erro ao salvar resultado do sorteio.", type: "error" });
      } finally {
        setRafflingPrizeId(null);
      }
    }, 3000);
  };

  const handleDeletePrize = (id: string) => {
    setPrizeToDelete(id);
  };

  const confirmDeletePrize = async () => {
    if (!prizeToDelete) return;
    try {
      await deleteDoc(doc(db, "prizes", prizeToDelete));
    } catch (err) {
      setModalMessage({ title: "Erro", message: "Erro ao excluir brinde.", type: "error" });
    } finally {
      setPrizeToDelete(null);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName) return;
    try {
      await addDoc(collection(db, "categories"), {
        nome: newCategoryName,
        createdAt: new Date().toISOString()
      });
      setNewCategoryName("");
    } catch (err) {
      setModalMessage({ title: "Erro", message: "Erro ao adicionar categoria.", type: "error" });
    }
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    try {
      await deleteDoc(doc(db, "categories", categoryToDelete));
    } catch (err) {
      setModalMessage({ title: "Erro", message: "Erro ao excluir categoria.", type: "error" });
    } finally {
      setCategoryToDelete(null);
    }
  };

  const handleAddKit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKit.nome) return;
    try {
      await addDoc(collection(db, "kits"), {
        ...newKit,
        createdAt: new Date().toISOString()
      });
      setNewKit({ nome: "", descricao: "", categoria_vinculada: "" });
      setIsAddingKit(false);
    } catch (err) {
      setModalMessage({ title: "Erro", message: "Erro ao adicionar kit.", type: "error" });
    }
  };

  const confirmDeleteKit = async () => {
    if (!kitToDelete) return;
    try {
      await deleteDoc(doc(db, "kits", kitToDelete));
    } catch (err) {
      setModalMessage({ title: "Erro", message: "Erro ao excluir kit.", type: "error" });
    } finally {
      setKitToDelete(null);
    }
  };

  const confirmDeleteAthlete = async () => {
    if (!athleteToDelete) return;
    try {
      await deleteDoc(doc(db, "registrations", athleteToDelete.id));
      setModalMessage({ title: "Sucesso", message: "Inscrição do atleta excluída.", type: "info" });
    } catch (err) {
      setModalMessage({ title: "Erro", message: "Erro ao excluir atleta.", type: "error" });
    } finally {
      setAthleteToDelete(null);
    }
  };

  const toggleKitStatus = async (athleteId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, "registrations", athleteId), {
        kit_entregue: !currentStatus
      });
    } catch (err) {
      setModalMessage({ title: "Erro", message: "Erro ao atualizar status do kit.", type: "error" });
    }
  };

  const handleSaveAthleteEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAthlete) return;
    setSavingAthlete(true);
    try {
      await updateDoc(doc(db, "registrations", editingAthlete.id), {
        nome: editingAthlete.nome,
        cpf: editingAthlete.cpf,
        nascimento: editingAthlete.nascimento,
        sexo: editingAthlete.sexo,
        whatsapp: editingAthlete.whatsapp,
        categoria: editingAthlete.categoria || "",
        kit_entregue: editingAthlete.kit_entregue || false
      });
      setEditingAthlete(null);
      setModalMessage({ title: "Sucesso", message: "Atleta atualizado com sucesso!", type: "info" });
    } catch (err) {
      setModalMessage({ title: "Erro", message: "Erro ao atualizar atleta.", type: "error" });
    } finally {
      setSavingAthlete(false);
    }
  };

  const handleSaveNewAthlete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAthlete.nome || !newAthlete.cpf) {
      setModalMessage({ title: "Erro", message: "Nome e CPF são obrigatórios.", type: "error" });
      return;
    }
    setSavingAthlete(true);
    try {
      await addDoc(collection(db, "registrations"), {
        ...newAthlete,
        kit_entregue: false,
        createdAt: new Date().toISOString()
      });
      setIsAddingAthlete(false);
      setNewAthlete({ nome: "", cpf: "", nascimento: "", sexo: "MASCULINO", whatsapp: "", categoria: "" });
      setModalMessage({ title: "Sucesso", message: "Inscrição criada com sucesso!", type: "info" });
    } catch (err) {
      setModalMessage({ title: "Erro", message: "Erro ao criar inscrição.", type: "error" });
    } finally {
      setSavingAthlete(false);
    }
  };

  const handleExportCSV = () => {
    const dataToExport = registrations.filter(reg => {
      let match = true;
      if (exportFilters.kitStatus === "ENTREGUE" && !reg.kit_entregue) match = false;
      if (exportFilters.kitStatus === "PENDENTE" && reg.kit_entregue) match = false;
      if (exportFilters.categoria !== "TODAS" && (reg.categoria || "NÃO DEFINIDA") !== exportFilters.categoria) match = false;
      // Nota: Atualmente todas inscrições no DB são "Confirmadas".
      return match;
    });

    const headers = ["ID", "Nome", "CPF", "Nascimento", "Sexo", "WhatsApp", "Categoria", "Kit Entregue", "Data da Inscrição", "Status da Inscrição"];

    const rows = dataToExport.map(reg => [
      reg.id,
      reg.nome || "",
      reg.cpf || "",
      reg.nascimento || "",
      reg.sexo || "",
      reg.whatsapp || "",
      reg.categoria || "NÃO DEFINIDA",
      reg.kit_entregue ? "Entregue" : "Pendente",
      reg.createdAt ? new Date(reg.createdAt).toLocaleDateString("pt-BR") : "",
      "Confirmada"
    ]);

    const csvContent = [
      headers.join(";"),
      ...rows.map(row => row.map(item => `"${String(item).replace(/"/g, '""')}"`).join(";"))
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `atletas-export-${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExportModalOpen(false);
  };

  return (
    <div className="bg-background text-on-background font-body-md selection:bg-primary selection:text-on-primary kinetic-bg min-h-screen">

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 w-full bg-surface-container-lowest border-b border-outline-variant z-40 p-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-secondary/10 border border-secondary/30 flex items-center justify-center neon-glow-pink rounded-full">
            <Trophy className="w-4 h-4 text-secondary" />
          </div>
          <h1 className="font-headline-sm text-secondary neon-text-pink uppercase leading-none tracking-tighter">SÃO PEDRO ADMIN</h1>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-on-background p-2 focus:outline-none">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation Shell */}
      <nav className={`h-screen w-64 fixed left-0 top-0 bg-surface-container-lowest border-r border-outline-variant flex flex-col p-gutter z-50 transform transition-transform duration-300 md:translate-x-0 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="mb-12 pt-4 px-2 hidden md:block">
          <h1 className="font-headline-lg-mobile text-secondary neon-text-pink uppercase leading-none tracking-tighter">SÃO PEDRO ADMIN</h1>
          <div className="h-1 w-full bg-secondary/10 mt-1 overflow-hidden rounded-full">
            <div className="h-full bg-secondary neon-glow-pink w-1/3"></div>
          </div>
          <p className="font-label-sm text-on-surface-variant opacity-70 mt-2">GESTÃO DE EVENTO</p>
        </div>
        <div className="flex-grow space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.label;
            return (
              <button
                key={item.label}
                onClick={() => {
                  setActiveTab(item.label);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-4 transition-all group ${isActive
                  ? "bg-primary text-on-primary font-bold slant-cut skew-active neon-glow-orange"
                  : "text-on-surface-variant hover:bg-surface-container-high border-b border-outline-variant/10"
                  }`}
              >
                <span className={`w-6 h-6 ${!isActive ? "group-hover:text-secondary transition-colors" : ""}`}>
                  {item.icon}
                </span>
                <span className={`font-label-sm uppercase tracking-widest ${isActive ? "italic" : "group-hover:text-on-surface transition-colors"}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
        <div className="mt-auto pt-6 border-t-2 border-outline-variant">
          <div className="flex items-center gap-3 mb-6 p-2 bg-surface-container-low border-l-4 border-secondary neon-glow-pink">
            <div className="w-10 h-10 bg-surface-container-highest border border-secondary/30 overflow-hidden flex items-center justify-center font-bold text-secondary">
              {session?.user?.name ? session.user.name.substring(0, 2).toUpperCase() : "AD"}
            </div>
            <div className="overflow-hidden">
              <p className="font-label-sm text-on-background italic truncate">{session?.user?.name || "Administrador"}</p>
              <p className="text-[10px] text-secondary uppercase font-bold tracking-widest neon-text-pink">Race Director</p>
            </div>
          </div>
          {/* <button className="w-full py-4 bg-transparent border-2 border-primary/40 text-primary font-bold font-label-sm uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-all slant-cut-reverse hover:neon-glow-orange">
            Exportar Dados
          </button> */}
          <button onClick={() => signOut({ callbackUrl: "/login" })} className="w-full mt-4 py-4 bg-transparent border-2 border-secondary/40 text-secondary font-bold font-label-sm uppercase tracking-widest hover:bg-secondary hover:text-on-secondary transition-all slant-cut hover:neon-glow-pink flex items-center justify-center gap-2">
            <LogOut className="w-4 h-4" />
            Sair do Sistema
          </button>
        </div>
      </nav>

      {/* Overlay for mobile when sidebar is open */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Main Content Canvas */}
      <main className="md:ml-64 p-4 pt-24 md:pt-margin-desktop md:p-margin-desktop min-h-screen">
        {activeTab === "Usuários" && (
          /* USERS MODULE */
          <div>
            <header className="flex justify-between items-start mb-16 relative">
              <div>
                <h2 className="font-headline-lg text-on-background tracking-tighter uppercase italic leading-none">Gestão de Usuários</h2>
                <p className="font-label-sm text-primary neon-text-orange uppercase tracking-[0.3em] mt-2">Controle de Acesso ao Sistema</p>
              </div>
              <div className="text-right flex flex-col items-end">
                <button
                  onClick={() => setIsAddingUser(!isAddingUser)}
                  className="bg-primary text-on-primary px-6 py-4 font-bold font-label-sm slant-cut flex items-center gap-2 hover:bg-secondary hover:text-on-secondary transition-all hover:neon-glow-pink"
                >
                  <Plus className="w-5 h-5" />
                  {isAddingUser ? "Voltar" : "Novo Usuário"}
                </button>
              </div>
            </header>

            {isAddingUser ? (
              <section className="bg-surface-container-low border border-outline-variant p-8 max-w-2xl mx-auto">
                <h3 className="font-headline-sm uppercase italic mb-8 border-b border-outline-variant/30 pb-4">Cadastrar Novo Usuário</h3>
                <form onSubmit={handleAddUser} className="space-y-6">
                  <div>
                    <label className="block text-[10px] text-on-surface-variant uppercase font-bold tracking-widest mb-2">Nome Completo</label>
                    <input
                      type="text"
                      value={newUser.nome}
                      onChange={(e) => setNewUser({ ...newUser, nome: e.target.value })}
                      className="w-full bg-surface-container border-0 border-l-4 border-primary focus:ring-0 focus:border-secondary text-on-background font-label-sm py-4 pl-6 uppercase placeholder:opacity-30 italic transition-all"
                      placeholder="EX: MARCOS AURÉLIO"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-on-surface-variant uppercase font-bold tracking-widest mb-2">E-mail</label>
                    <input
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      className="w-full bg-surface-container border-0 border-l-4 border-primary focus:ring-0 focus:border-secondary text-on-background font-label-sm py-4 pl-6 uppercase placeholder:opacity-30 italic transition-all"
                      placeholder="EMAIL@EXEMPLO.COM"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-on-surface-variant uppercase font-bold tracking-widest mb-2">Senha de Acesso</label>
                    <input
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      className="w-full bg-surface-container border-0 border-l-4 border-primary focus:ring-0 focus:border-secondary text-on-background font-label-sm py-4 pl-6 uppercase placeholder:opacity-30 italic transition-all"
                      placeholder="DIGITE UMA SENHA SEGURA"
                      required
                    />
                  </div>

                  {userError && (
                    <div className="bg-secondary/10 border-l-4 border-secondary p-4 flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-secondary" />
                      <p className="text-[10px] text-secondary uppercase font-bold tracking-wider">{userError}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={savingUser}
                    className="w-full bg-primary text-on-primary font-bold font-label-sm uppercase tracking-widest py-5 slant-cut-reverse hover:bg-secondary hover:text-on-secondary hover:neon-glow-pink transition-all flex justify-center items-center gap-2 disabled:opacity-50"
                  >
                    {savingUser ? "Salvando..." : "Criar Usuário"}
                  </button>
                </form>
              </section>
            ) : (
              <section className="bg-surface-container-lowest border border-outline-variant">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-container-low">
                        <th className="py-5 font-label-sm text-on-surface-variant uppercase tracking-[0.2em] px-6 text-[10px]">Identificação</th>
                        <th className="py-5 font-label-sm text-on-surface-variant uppercase tracking-[0.2em] px-6 text-[10px]">E-mail</th>
                        <th className="py-5 font-label-sm text-on-surface-variant uppercase tracking-[0.2em] px-6 text-[10px] text-center">Permissão</th>
                        <th className="py-5 font-label-sm text-on-surface-variant uppercase tracking-[0.2em] px-6 text-[10px] text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10">
                      {loadingUsers ? (
                        <tr>
                          <td colSpan={4} className="py-12 px-6 text-center text-on-surface-variant font-label-sm italic uppercase tracking-widest">Carregando usuários...</td>
                        </tr>
                      ) : adminUsers.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-12 px-6 text-center text-on-surface-variant font-label-sm italic uppercase tracking-widest">Nenhum usuário cadastrado.</td>
                        </tr>
                      ) : (
                        adminUsers.map((user) => (
                          <tr key={user.id} className="hover:bg-primary/5 transition-colors group">
                            <td className="py-6 px-6">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-surface-container-highest border border-primary/20 flex items-center justify-center font-bold text-primary neon-text-orange slant-cut italic">
                                  {user.nome ? user.nome.substring(0, 2).toUpperCase() : "??"}
                                </div>
                                <div>
                                  <p className="font-bold text-on-background uppercase tracking-tight text-md">{user.nome}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-6 px-6">
                              <p className="text-on-surface-variant italic font-label-sm">{user.email}</p>
                            </td>
                            <td className="py-6 px-6 text-center">
                              <span className="bg-primary/10 border border-primary text-primary px-3 py-1 text-[10px] font-bold uppercase italic tracking-wider neon-glow-orange">
                                {user.role === "admin" ? "ADMINISTRADOR" : "USUÁRIO"}
                              </span>
                            </td>
                            <td className="py-6 px-6 text-right">
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="w-10 h-10 border border-outline-variant/30 hover:bg-secondary hover:text-on-secondary hover:neon-glow-pink transition-all group/btn flex items-center justify-center ml-auto"
                                title="Excluir"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </div>
        )}

        {activeTab === "Dashboard" && (
          /* DASHBOARD MODULE */
          <div>
            <header className="flex justify-between items-start mb-16 relative">
              <div>
                <h2 className="font-headline-lg text-on-background tracking-tighter uppercase italic leading-none">Status da Operação</h2>
                <p className="font-label-sm text-primary neon-text-orange uppercase tracking-[0.3em] mt-2">Live Monitoring System</p>
              </div>
              <div className="text-right flex flex-col items-end">
                <div className="bg-primary text-on-primary px-4 py-1 font-bold font-label-sm slant-cut mb-2 neon-glow-orange">LIVE</div>
                <p className="font-label-sm text-on-surface-variant uppercase italic">Race Day 12.07 • 06:00H</p>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              <div className="bg-surface-container-low border-b-4 border-primary p-8 relative group overflow-hidden neon-glow-orange transition-all hover:bg-surface-container">
                <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-20 transition-opacity">
                  <UserPlus className="w-[120px] h-[120px] text-primary" />
                </div>
                <p className="font-label-sm text-on-surface-variant uppercase mb-4 tracking-widest">Total de Inscritos</p>
                <h3 className="font-display-xl text-primary neon-text-orange leading-none italic">{loading ? "..." : registrations.length}</h3>
                <div className="mt-6 flex items-center justify-between border-t border-outline-variant/30 pt-4">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold text-sm">+12%</span>
                    <span className="text-[10px] text-on-surface-variant uppercase">Semanal</span>
                  </div>
                  <div className="h-1 w-12 bg-primary/20"></div>
                </div>
              </div>
              <div className="bg-surface-container-low border-b-4 border-secondary p-8 relative group overflow-hidden neon-glow-pink transition-all hover:bg-surface-container">
                <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-20 transition-opacity">
                  <HeartHandshake className="w-[120px] h-[120px] text-secondary" />
                </div>
                <p className="font-label-sm text-on-surface-variant uppercase mb-4 tracking-widest">Arrecadação</p>
                <h3 className="font-display-xl text-secondary neon-text-pink leading-none italic">{loading ? "..." : registrations.length}<span className="text-4xl text-secondary/50">KG</span></h3>
                <div className="mt-6">
                  <div className="flex justify-between text-[10px] uppercase font-bold mb-2">
                    <span className="text-secondary neon-text-pink">Meta (500kg)</span>
                    <span className="text-on-background">{loading ? 0 : Math.min(Math.round((registrations.length / 500) * 100), 100)}%</span>
                  </div>
                  <div className="h-2 bg-surface-container-highest">
                    <div className="h-full bg-secondary neon-glow-pink transition-all duration-1000" style={{ width: `${loading ? 0 : Math.min(Math.round((registrations.length / 500) * 100), 100)}%` }}></div>
                  </div>
                </div>
              </div>
              <div className="bg-surface-container-low border-b-4 border-primary p-8 relative group overflow-hidden neon-glow-orange transition-all hover:bg-surface-container">
                <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-20 transition-opacity">
                  <PackageOpen className="w-[120px] h-[120px] text-primary" />
                </div>
                <p className="font-label-sm text-on-surface-variant uppercase mb-4 tracking-widest">Kits Entregues</p>
                <h3 className="font-display-xl text-on-background leading-none italic">{loading ? "..." : registrations.filter(r => r.kit_entregue).length}</h3>
                <div className="mt-6 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse neon-glow-orange"></div>
                  <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest">Atualização em Tempo Real</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Atletas" && (
          /* ATLETAS MODULE */
          <div>
            <header className="flex justify-between items-start mb-16 relative">
              <div>
                <h2 className="font-headline-lg text-on-background tracking-tighter uppercase italic leading-none">Gestão de Atletas</h2>
                <p className="font-label-sm text-primary neon-text-orange uppercase tracking-[0.3em] mt-2">Controle de Inscrições</p>
              </div>
              <div className="text-right flex flex-col sm:flex-row items-end gap-4">
                <button onClick={() => setIsExportModalOpen(true)} className="bg-surface-container text-on-surface-variant px-6 py-4 font-bold font-label-sm slant-cut flex items-center gap-2 hover:bg-secondary hover:text-on-secondary transition-all">
                  <Download className="w-5 h-5" />
                  Exportar Dados
                </button>
                <button onClick={() => setIsAddingAthlete(true)} className="bg-primary text-on-primary px-6 py-4 font-bold font-label-sm slant-cut flex items-center gap-2 hover:bg-secondary hover:text-on-secondary transition-all hover:neon-glow-pink">
                  <Plus className="w-5 h-5" />
                  Nova Inscrição
                </button>
              </div>
            </header>

            <section className="bg-surface-container-lowest border border-outline-variant">
              <div className="p-6 border-b border-outline-variant/30 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="relative w-full md:w-1/2">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/60 w-6 h-6" />
                  <input
                    className="w-full bg-surface-container border-0 border-l-4 border-primary focus:ring-0 focus:border-secondary text-on-background font-label-sm py-4 pl-12 uppercase placeholder:opacity-30 italic transition-all"
                    placeholder="BUSCAR ATLETA OU CPF..."
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <select
                    value={filterType}
                    onChange={(e) => {
                      setFilterType(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="bg-surface-container border-0 border-r-4 border-outline-variant text-on-surface-variant font-label-sm px-6 py-4 uppercase focus:ring-0 cursor-pointer w-full md:w-auto min-w-[200px]"
                  >
                    <option value="TODOS">TODOS OS ATLETAS</option>
                    <optgroup label="STATUS DO KIT" className="bg-surface text-on-surface">
                      <option value="KIT: ENTREGUE">KIT: ENTREGUE</option>
                      <option value="KIT: PENDENTE">KIT: PENDENTE</option>
                    </optgroup>
                    {categories.length > 0 && (
                      <optgroup label="CATEGORIAS" className="bg-surface text-on-surface">
                        <option value="CAT: NÃO DEFINIDA">CAT: NÃO DEFINIDA</option>
                        {categories.map((c) => (
                          <option key={c.id} value={`CAT: ${c.nome}`}>CAT: {c.nome}</option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-surface-container-low">
                      <th className="py-5 font-label-sm text-on-surface-variant uppercase tracking-[0.2em] px-6 text-[10px]">Identificação do Atleta</th>
                      <th className="py-5 font-label-sm text-on-surface-variant uppercase tracking-[0.2em] px-6 text-[10px]">Categoria / Modalidade</th>
                      <th className="py-5 font-label-sm text-on-surface-variant uppercase tracking-[0.2em] px-6 text-[10px] text-center">Status Insc.</th>
                      <th className="py-5 font-label-sm text-on-surface-variant uppercase tracking-[0.2em] px-6 text-[10px] text-center">Checkout Kit</th>
                      <th className="py-5 font-label-sm text-on-surface-variant uppercase tracking-[0.2em] px-6 text-[10px] text-right">Controles</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="py-12 px-6 text-center text-on-surface-variant font-label-sm italic uppercase tracking-widest">Carregando dados ao vivo...</td>
                      </tr>
                    ) : filteredRegistrations.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 px-6 text-center text-on-surface-variant font-label-sm italic uppercase tracking-widest">
                          {registrations.length === 0 ? "Nenhuma inscrição registrada." : "Nenhuma inscrição encontrada para a busca."}
                        </td>
                      </tr>
                    ) : (
                      paginatedRegistrations.map((reg) => (
                        <tr key={reg.id} className="hover:bg-primary/5 transition-colors group">
                          <td className="py-6 px-6">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary neon-text-orange slant-cut italic">
                                {reg.nome ? reg.nome.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() : "??"}
                              </div>
                              <div>
                                <p className="font-bold text-on-background uppercase tracking-tight text-lg">{reg.nome || "Anônimo"}</p>
                                <p className="text-[10px] text-primary/60 font-bold">REG_ID #{reg.id.substring(0, 5).toUpperCase()}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-6 px-6">
                            <span className="bg-primary/10 border border-primary text-primary px-3 py-1 text-[10px] font-bold uppercase italic tracking-wider neon-glow-orange">
                              {reg.categoria || "NÃO DEFINIDA"}
                            </span>
                          </td>
                          <td className="py-6 px-6 text-center">
                            <span className="inline-flex items-center gap-2 text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-400/20 px-3 py-1 bg-emerald-400/5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> CONFIRMADA
                            </span>
                          </td>
                          <td className="py-6 px-6 text-center">
                            <button onClick={() => toggleKitStatus(reg.id, !!reg.kit_entregue)} className="flex justify-center mx-auto hover:scale-110 transition-transform">
                              {reg.kit_entregue ? (
                                <CheckSquare className="text-primary w-8 h-8" />
                              ) : (
                                <Square className="text-outline-variant w-8 h-8" />
                              )}
                            </button>
                          </td>
                          <td className="py-6 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => setEditingAthlete(reg)} className="w-10 h-10 border border-outline-variant/30 hover:bg-primary hover:text-on-primary hover:neon-glow-orange transition-all group/btn flex items-center justify-center" title="Editar">
                                <Edit className="w-5 h-5" />
                              </button>
                              <button onClick={() => setAthleteToDelete(reg)} className="w-10 h-10 border border-outline-variant/30 hover:bg-secondary hover:text-on-secondary hover:neon-glow-pink transition-all group/btn flex items-center justify-center" title="Excluir">
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="p-6 border-t border-outline-variant/30 flex justify-between items-center bg-surface-container-low">
                <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest">Exibindo <span className="text-primary neon-text-orange">{filteredRegistrations.length > 0 ? startIndex + 1 : 0}-{Math.min(startIndex + itemsPerPage, filteredRegistrations.length)}</span> de {filteredRegistrations.length} Atletas Encontrados</p>
                <div className="flex gap-1">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="w-10 h-10 bg-surface-container border border-outline-variant/30 flex items-center justify-center hover:bg-primary hover:text-on-primary transition-all disabled:opacity-30 disabled:hover:bg-surface-container disabled:hover:text-current"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {Array.from({ length: totalPages }).map((_, i) => {
                    const pageNum = i + 1;
                    if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-10 h-10 font-bold transition-all ${currentPage === pageNum ? "bg-primary text-on-primary slant-cut neon-glow-orange" : "bg-surface-container border border-outline-variant/30 hover:bg-secondary hover:text-on-secondary"}`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                    if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                      return <span key={pageNum} className="w-10 h-10 flex items-center justify-center text-outline-variant">...</span>;
                    }
                    return null;
                  })}

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="w-10 h-10 bg-surface-container border border-outline-variant/30 flex items-center justify-center hover:bg-primary hover:text-on-primary transition-all disabled:opacity-30 disabled:hover:bg-surface-container disabled:hover:text-current"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}
        {activeTab === "Kits" && (
          <div>
            <header className="flex justify-between items-start mb-16 relative">
              <div>
                <h2 className="font-headline-lg text-on-background tracking-tighter uppercase italic leading-none">Gestão de Kits</h2>
                <p className="font-label-sm text-primary neon-text-orange uppercase tracking-[0.3em] mt-2">Kits Oficiais da Corrida</p>
              </div>
              <div className="text-right flex flex-col items-end">
                <button
                  onClick={() => setIsAddingKit(!isAddingKit)}
                  className="bg-primary text-on-primary px-6 py-4 font-bold font-label-sm slant-cut flex items-center gap-2 hover:bg-secondary hover:text-on-secondary transition-all hover:neon-glow-pink"
                >
                  <Plus className="w-5 h-5" />
                  {isAddingKit ? "Voltar" : "Cadastrar Kit"}
                </button>
              </div>
            </header>

            {isAddingKit ? (
              <section className="bg-surface-container-low border border-outline-variant p-8 max-w-2xl mx-auto mb-16">
                <h3 className="font-headline-sm uppercase italic mb-8 border-b border-outline-variant/30 pb-4 flex items-center gap-2"><Package className="w-6 h-6 text-primary" /> Novo Kit</h3>
                <form onSubmit={handleAddKit} className="space-y-6">
                  <div>
                    <label className="block text-[10px] text-on-surface-variant uppercase font-bold tracking-widest mb-2">Nome do Kit</label>
                    <input
                      type="text"
                      value={newKit.nome}
                      onChange={(e) => setNewKit({ ...newKit, nome: e.target.value })}
                      className="w-full bg-surface-container border-0 border-l-4 border-primary focus:ring-0 focus:border-secondary text-on-background font-label-sm py-4 pl-6 uppercase placeholder:opacity-30 italic transition-all"
                      placeholder="EX: KIT VIP"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-on-surface-variant uppercase font-bold tracking-widest mb-2">Descrição / Itens Inclusos (Opcional)</label>
                    <input
                      type="text"
                      value={newKit.descricao}
                      onChange={(e) => setNewKit({ ...newKit, descricao: e.target.value })}
                      className="w-full bg-surface-container border-0 border-l-4 border-primary focus:ring-0 focus:border-secondary text-on-background font-label-sm py-4 pl-6 uppercase placeholder:opacity-30 italic transition-all"
                      placeholder="EX: CAMISA + MEDALHA + CHIP"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-on-surface-variant uppercase font-bold tracking-widest mb-2">Categoria Vinculada (Opcional)</label>
                    <select
                      value={newKit.categoria_vinculada}
                      onChange={(e) => setNewKit({ ...newKit, categoria_vinculada: e.target.value })}
                      className="w-full bg-surface-container border-0 border-l-4 border-primary focus:ring-0 focus:border-secondary text-on-background font-label-sm py-4 pl-6 uppercase italic transition-all cursor-pointer"
                    >
                      <option value="">TODAS AS CATEGORIAS</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.nome}>{c.nome}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-primary text-on-primary font-bold font-label-sm uppercase tracking-widest py-5 slant-cut-reverse hover:bg-secondary hover:text-on-secondary hover:neon-glow-pink transition-all flex justify-center items-center gap-2"
                  >
                    Salvar Kit
                  </button>
                </form>
              </section>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                {loadingKits ? (
                  <div className="col-span-full py-12 text-center text-on-surface-variant font-label-sm italic uppercase tracking-widest">Carregando kits...</div>
                ) : kits.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-on-surface-variant font-label-sm italic uppercase tracking-widest border border-dashed border-outline-variant/30">Nenhum kit cadastrado.</div>
                ) : (
                  kits.map((kit) => (
                    <div key={kit.id} className="bg-surface-container-low border border-outline-variant p-6 relative group overflow-hidden transition-all hover:bg-surface-container border-b-4 border-b-primary hover:neon-glow-orange">
                      <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Package className="w-48 h-48 text-primary" />
                      </div>

                      <div className="relative z-10 flex flex-col h-full">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest mb-1">ID: #{kit.id.substring(0, 6)}</p>
                            <h3 className="font-headline-sm uppercase italic text-on-background">{kit.nome}</h3>
                            {kit.descricao && <p className="text-sm text-on-surface-variant mt-1">{kit.descricao}</p>}
                            {kit.categoria_vinculada && (
                              <p className="text-[10px] bg-primary/20 text-primary font-bold px-2 py-1 uppercase mt-3 inline-block tracking-widest">
                                Categoria: {kit.categoria_vinculada}
                              </p>
                            )}
                          </div>
                          <button onClick={() => setKitToDelete(kit.id)} className="w-8 h-8 text-on-surface-variant hover:text-secondary transition-colors" title="Excluir">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "Sorteios" && (
          <div>
            <header className="flex justify-between items-start mb-16 relative">
              <div>
                <h2 className="font-headline-lg text-on-background tracking-tighter uppercase italic leading-none">Sorteios e Brindes</h2>
                <p className="font-label-sm text-primary neon-text-orange uppercase tracking-[0.3em] mt-2">Premiação Oficial</p>
              </div>
              <div className="text-right flex flex-col items-end">
                <button
                  onClick={() => setIsAddingPrize(!isAddingPrize)}
                  className="bg-primary text-on-primary px-6 py-4 font-bold font-label-sm slant-cut flex items-center gap-2 hover:bg-secondary hover:text-on-secondary transition-all hover:neon-glow-pink"
                >
                  <Plus className="w-5 h-5" />
                  {isAddingPrize ? "Voltar" : "Cadastrar Brinde"}
                </button>
              </div>
            </header>

            {isAddingPrize ? (
              <section className="bg-surface-container-low border border-outline-variant p-8 max-w-2xl mx-auto mb-16">
                <h3 className="font-headline-sm uppercase italic mb-8 border-b border-outline-variant/30 pb-4 flex items-center gap-2"><Gift className="w-6 h-6 text-primary" /> Novo Brinde</h3>
                <form onSubmit={handleAddPrize} className="space-y-6">
                  <div>
                    <label className="block text-[10px] text-on-surface-variant uppercase font-bold tracking-widest mb-2">Item/Prêmio</label>
                    <input
                      type="text"
                      value={newPrize.nome}
                      onChange={(e) => setNewPrize({ ...newPrize, nome: e.target.value })}
                      className="w-full bg-surface-container border-0 border-l-4 border-primary focus:ring-0 focus:border-secondary text-on-background font-label-sm py-4 pl-6 uppercase placeholder:opacity-30 italic transition-all"
                      placeholder="EX: BICICLETA ARO 29"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-on-surface-variant uppercase font-bold tracking-widest mb-2">Descrição (Opcional)</label>
                    <input
                      type="text"
                      value={newPrize.descricao}
                      onChange={(e) => setNewPrize({ ...newPrize, descricao: e.target.value })}
                      className="w-full bg-surface-container border-0 border-l-4 border-primary focus:ring-0 focus:border-secondary text-on-background font-label-sm py-4 pl-6 uppercase placeholder:opacity-30 italic transition-all"
                      placeholder="DETALHES DO ITEM"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-primary text-on-primary font-bold font-label-sm uppercase tracking-widest py-5 slant-cut-reverse hover:bg-secondary hover:text-on-secondary hover:neon-glow-pink transition-all flex justify-center items-center gap-2"
                  >
                    Salvar Brinde
                  </button>
                </form>
              </section>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                {loadingPrizes ? (
                  <div className="col-span-full py-12 text-center text-on-surface-variant font-label-sm italic uppercase tracking-widest">Carregando brindes...</div>
                ) : prizes.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-on-surface-variant font-label-sm italic uppercase tracking-widest border border-dashed border-outline-variant/30">Nenhum brinde cadastrado.</div>
                ) : (
                  prizes.map((prize) => {
                    const isRaffling = rafflingPrizeId === prize.id;
                    const hasWinner = !!prize.winner_id;

                    return (
                      <div key={prize.id} className={`bg-surface-container-low border border-outline-variant p-6 relative group overflow-hidden transition-all ${hasWinner ? 'border-b-4 border-b-secondary neon-glow-pink' : 'hover:bg-surface-container border-b-4 border-b-primary hover:neon-glow-orange'}`}>
                        <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                          {hasWinner ? <Trophy className="w-48 h-48 text-secondary" /> : <Gift className="w-48 h-48 text-primary" />}
                        </div>

                        <div className="relative z-10 flex flex-col h-full">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest mb-1">ID: #{prize.id.substring(0, 6)}</p>
                              <h3 className="font-headline-sm uppercase italic text-on-background">{prize.nome}</h3>
                              {prize.descricao && <p className="text-sm text-on-surface-variant mt-1">{prize.descricao}</p>}
                            </div>
                            <button onClick={() => handleDeletePrize(prize.id)} className="w-8 h-8 text-on-surface-variant hover:text-secondary transition-colors" title="Excluir">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="mt-auto pt-6">
                            {hasWinner ? (
                              <div className="bg-secondary/10 border-l-4 border-secondary p-4 relative overflow-hidden">
                                <Sparkles className="absolute right-2 top-2 w-4 h-4 text-secondary/50" />
                                <p className="text-[10px] text-secondary uppercase font-bold tracking-widest mb-1">Ganhador</p>
                                <p className="font-bold text-on-background uppercase text-lg italic truncate">{prize.winner_name}</p>
                                <p className="text-[10px] text-on-surface-variant uppercase mt-2">Atleta #{prize.winner_id?.substring(0, 5)}</p>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleRunRaffle(prize)}
                                disabled={isRaffling || rafflingPrizeId !== null}
                                className={`w-full py-4 font-bold font-label-sm uppercase tracking-widest transition-all slant-cut flex items-center justify-center gap-2 ${isRaffling ? 'bg-primary/50 text-on-primary animate-pulse' : 'bg-primary text-on-primary hover:bg-secondary hover:text-on-secondary hover:neon-glow-pink disabled:opacity-30 disabled:hover:bg-primary disabled:hover:text-on-primary'}`}
                              >
                                {isRaffling ? (
                                  <>Sorteando...</>
                                ) : (
                                  <><Ticket className="w-5 h-5" /> Rodar Sorteio</>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}


        {activeTab === "Configurações" && (
          <div>
            <header className="flex justify-between items-start mb-16 relative">
              <div>
                <h2 className="font-headline-lg text-on-background tracking-tighter uppercase italic leading-none">Configurações Gerais</h2>
                <p className="font-label-sm text-primary neon-text-orange uppercase tracking-[0.3em] mt-2">Parâmetros do Sistema</p>
              </div>
            </header>

            <section className="bg-surface-container-lowest border border-outline-variant p-8 max-w-4xl mb-16">
              <h3 className="font-headline-sm uppercase italic mb-8 border-b border-outline-variant/30 pb-4 flex items-center gap-2">Categorias da Corrida</h3>

              <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row gap-4 mb-8">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="flex-1 bg-surface-container border-0 border-l-4 border-primary focus:ring-0 focus:border-secondary text-on-background font-label-sm py-4 pl-6 uppercase placeholder:opacity-30 italic transition-all"
                  placeholder="NOVA CATEGORIA (EX: 5KM RUN)"
                  required
                />
                <button
                  type="submit"
                  className="bg-primary text-on-primary px-8 font-bold font-label-sm uppercase tracking-widest slant-cut hover:bg-secondary hover:text-on-secondary hover:neon-glow-pink transition-all flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" /> Adicionar
                </button>
              </form>

              <div className="grid gap-4">
                {loadingCategories ? (
                  <p className="text-on-surface-variant italic font-label-sm uppercase py-4">Carregando categorias...</p>
                ) : categories.length === 0 ? (
                  <p className="text-on-surface-variant italic font-label-sm uppercase py-4 border border-dashed border-outline-variant/30 text-center">Nenhuma categoria cadastrada.</p>
                ) : (
                  categories.map(cat => (
                    <div key={cat.id} className="flex justify-between items-center bg-surface-container-low p-4 border border-outline-variant/50 hover:border-primary/50 transition-colors">
                      <span className="font-bold uppercase tracking-widest text-on-background">{cat.nome}</span>
                      <button onClick={() => setCategoryToDelete(cat.id)} className="w-10 h-10 border border-outline-variant/30 hover:bg-secondary hover:text-on-secondary hover:neon-glow-pink transition-all flex items-center justify-center">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        )}

        {(activeTab !== "Usuários" && activeTab !== "Dashboard" && activeTab !== "Atletas" && activeTab !== "Sorteios" && activeTab !== "Configurações") && (
          <div className="flex items-center justify-center min-h-[60vh]">
            <p className="text-on-surface-variant italic font-label-sm uppercase tracking-widest">Módulo {activeTab} em desenvolvimento</p>
          </div>
        )}

        <footer className="w-full py-20 flex flex-col md:flex-row justify-between items-end gap-12 border-t border-outline-variant mt-20">
          <div>
            <h4 className="font-headline-lg text-secondary/10 uppercase italic leading-none select-none">RACE DAY CORE v4.0</h4>
            <p className="font-body-md text-on-surface-variant uppercase tracking-widest mt-4">SISTEMA INTEGRADO DE GESTÃO ESPORTIVA</p>
            <p className="text-[10px] text-on-surface-variant/50 mt-2">© 2026 RACE ADMIN. TODOS OS DIREITOS RESERVADOS.</p>
          </div>
        </footer>
      </main>

      {/* Delete Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-surface-container-low border border-secondary p-8 max-w-md w-full relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-secondary neon-glow-pink"></div>
            <div className="absolute -right-12 -top-12 opacity-5">
              <AlertCircle className="w-32 h-32 text-secondary" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-secondary/10 border border-secondary/30 flex items-center justify-center text-secondary slant-cut neon-glow-pink">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-headline-sm uppercase italic text-on-background leading-none">Excluir Usuário?</h3>
                  <p className="font-label-sm text-secondary uppercase tracking-widest mt-1">Ação Irreversível</p>
                </div>
              </div>
              <p className="text-on-surface-variant text-sm mb-8">Esta ação removerá permanentemente o acesso deste administrador ao sistema. Você tem certeza que deseja prosseguir?</p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setUserToDelete(null)}
                  className="flex-1 py-4 border border-outline-variant hover:bg-surface-container hover:text-on-surface font-bold font-label-sm uppercase tracking-widest transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-4 bg-secondary text-on-secondary font-bold font-label-sm uppercase tracking-widest slant-cut hover:brightness-110 hover:neon-glow-pink transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Prize Confirmation Modal */}
      {prizeToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-surface-container-low border border-secondary p-8 max-w-md w-full relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-secondary neon-glow-pink"></div>
            <div className="absolute -right-12 -top-12 opacity-5">
              <AlertCircle className="w-32 h-32 text-secondary" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-secondary/10 border border-secondary/30 flex items-center justify-center text-secondary slant-cut neon-glow-pink">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-headline-sm uppercase italic text-on-background leading-none">Excluir Brinde?</h3>
                  <p className="font-label-sm text-secondary uppercase tracking-widest mt-1">Ação Irreversível</p>
                </div>
              </div>
              <p className="text-on-surface-variant text-sm mb-8">Esta ação removerá permanentemente o brinde do sistema. Você tem certeza que deseja prosseguir?</p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setPrizeToDelete(null)}
                  className="flex-1 py-4 border border-outline-variant hover:bg-surface-container hover:text-on-surface font-bold font-label-sm uppercase tracking-widest transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDeletePrize}
                  className="flex-1 py-4 bg-secondary text-on-secondary font-bold font-label-sm uppercase tracking-widest slant-cut hover:brightness-110 hover:neon-glow-pink transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}



      {/* Kit Delete Modal */}
      {kitToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-surface-container-low border border-secondary p-8 max-w-md w-full relative overflow-hidden group shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-1 bg-secondary neon-glow-pink"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-secondary/10 border border-secondary/30 flex items-center justify-center text-secondary slant-cut neon-glow-pink">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-headline-sm uppercase italic text-on-background leading-none">Excluir Kit?</h3>
                </div>
              </div>
              <p className="text-on-surface-variant text-sm mb-8">O kit será removido da base de dados. Essa ação não pode ser desfeita.</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={() => setKitToDelete(null)} className="flex-1 py-4 border border-outline-variant hover:bg-surface-container font-bold font-label-sm uppercase">Cancelar</button>
                <button onClick={confirmDeleteKit} className="flex-1 py-4 bg-secondary text-on-secondary font-bold font-label-sm uppercase slant-cut hover:neon-glow-pink flex justify-center items-center gap-2"><Trash2 className="w-4 h-4" /> Excluir</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Athlete Delete Modal */}
      {athleteToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-surface-container-low border border-secondary p-8 max-w-md w-full relative overflow-hidden group shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-1 bg-secondary neon-glow-pink"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-secondary/10 border border-secondary/30 flex items-center justify-center text-secondary slant-cut neon-glow-pink">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-headline-sm uppercase italic text-on-background leading-none">Excluir Inscrição?</h3>
                </div>
              </div>
              <p className="text-on-surface-variant text-sm mb-8">Esta ação apagará o registro de <strong>{athleteToDelete.nome || 'Anônimo'}</strong> da base. Ação irreversível!</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={() => setAthleteToDelete(null)} className="flex-1 py-4 border border-outline-variant hover:bg-surface-container font-bold font-label-sm uppercase">Cancelar</button>
                <button onClick={confirmDeleteAthlete} className="flex-1 py-4 bg-secondary text-on-secondary font-bold font-label-sm uppercase slant-cut hover:neon-glow-pink flex justify-center items-center gap-2"><Trash2 className="w-4 h-4" /> Excluir Atleta</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Delete Modal */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-surface-container-low border border-secondary p-8 max-w-md w-full relative overflow-hidden group shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-1 bg-secondary neon-glow-pink"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-secondary/10 border border-secondary/30 flex items-center justify-center text-secondary slant-cut neon-glow-pink">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-headline-sm uppercase italic text-on-background leading-none">Excluir Categoria?</h3>
                </div>
              </div>
              <p className="text-on-surface-variant text-sm mb-8">Essa categoria não estará mais disponível para novas inscrições. Prosseguir?</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={() => setCategoryToDelete(null)} className="flex-1 py-4 border border-outline-variant hover:bg-surface-container font-bold font-label-sm uppercase">Cancelar</button>
                <button onClick={confirmDeleteCategory} className="flex-1 py-4 bg-secondary text-on-secondary font-bold font-label-sm uppercase slant-cut hover:neon-glow-pink">Excluir</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Athlete Modal */}
      {editingAthlete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 overflow-y-auto py-12">
          <div className="bg-surface-container-lowest border border-primary p-8 max-w-2xl w-full relative group shadow-2xl my-auto">
            <div className="absolute top-0 left-0 w-full h-1 bg-primary neon-glow-orange"></div>
            <div className="relative z-10">
              <h3 className="font-headline-sm uppercase italic text-on-background mb-8 flex items-center gap-2 border-b border-outline-variant/30 pb-4">
                <Edit className="w-6 h-6 text-primary" /> Editar Atleta
              </h3>

              <form onSubmit={handleSaveAthleteEdit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] text-on-surface-variant uppercase font-bold tracking-widest mb-2">Nome Completo</label>
                    <input required type="text" value={editingAthlete.nome} onChange={(e) => setEditingAthlete({ ...editingAthlete, nome: e.target.value })} className="w-full bg-surface-container border-0 border-l-4 border-primary py-4 pl-6 uppercase text-sm focus:border-secondary transition-all" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-on-surface-variant uppercase font-bold tracking-widest mb-2">CPF</label>
                    <input required type="text" value={editingAthlete.cpf} onChange={(e) => setEditingAthlete({ ...editingAthlete, cpf: e.target.value })} className="w-full bg-surface-container border-0 border-l-4 border-primary py-4 pl-6 uppercase text-sm focus:border-secondary transition-all" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-on-surface-variant uppercase font-bold tracking-widest mb-2">Sexo</label>
                    <select value={editingAthlete.sexo} onChange={(e) => setEditingAthlete({ ...editingAthlete, sexo: e.target.value })} className="w-full bg-surface-container border-0 border-l-4 border-primary py-4 pl-6 uppercase text-sm focus:border-secondary transition-all">
                      <option value="MASCULINO">Masculino</option>
                      <option value="FEMININO">Feminino</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-on-surface-variant uppercase font-bold tracking-widest mb-2">Nascimento</label>
                    <input required type="date" value={editingAthlete.nascimento} onChange={(e) => setEditingAthlete({ ...editingAthlete, nascimento: e.target.value })} className="w-full bg-surface-container border-0 border-l-4 border-primary py-4 pl-6 uppercase text-sm focus:border-secondary transition-all" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-on-surface-variant uppercase font-bold tracking-widest mb-2">WhatsApp</label>
                    <input required type="text" value={editingAthlete.whatsapp} onChange={(e) => setEditingAthlete({ ...editingAthlete, whatsapp: e.target.value })} className="w-full bg-surface-container border-0 border-l-4 border-primary py-4 pl-6 uppercase text-sm focus:border-secondary transition-all" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-on-surface-variant uppercase font-bold tracking-widest mb-2">Categoria</label>
                    <select value={editingAthlete.categoria || ""} onChange={(e) => setEditingAthlete({ ...editingAthlete, categoria: e.target.value })} className="w-full bg-surface-container border-0 border-l-4 border-primary py-4 pl-6 uppercase text-sm focus:border-secondary transition-all">
                      <option value="">NÃO DEFINIDA</option>
                      {categories.map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-outline-variant/30">
                  <input type="checkbox" id="kit_entregue" checked={editingAthlete.kit_entregue || false} onChange={(e) => setEditingAthlete({ ...editingAthlete, kit_entregue: e.target.checked })} className="w-6 h-6 bg-surface-container border-primary text-primary focus:ring-primary focus:ring-offset-background transition-all" />
                  <label htmlFor="kit_entregue" className="text-sm font-bold uppercase tracking-widest text-on-background cursor-pointer select-none">Kit Entregue?</label>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-8">
                  <button type="button" onClick={() => setEditingAthlete(null)} className="flex-1 py-4 border border-outline-variant hover:bg-surface-container font-bold font-label-sm uppercase">Cancelar</button>
                  <button type="submit" disabled={savingAthlete} className="flex-1 py-4 bg-primary text-on-primary font-bold font-label-sm uppercase slant-cut hover:neon-glow-orange disabled:opacity-50 flex justify-center">
                    {savingAthlete ? "Salvando..." : "Salvar Alterações"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Athlete Modal */}
      {isAddingAthlete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 overflow-y-auto py-12">
          <div className="bg-surface-container-lowest border border-primary p-8 max-w-2xl w-full relative group shadow-2xl my-auto">
            <div className="absolute top-0 left-0 w-full h-1 bg-primary neon-glow-orange"></div>
            <div className="relative z-10">
              <h3 className="font-headline-sm uppercase italic text-on-background mb-8 flex items-center gap-2 border-b border-outline-variant/30 pb-4">
                <Plus className="w-6 h-6 text-primary" /> Nova Inscrição
              </h3>

              <form onSubmit={handleSaveNewAthlete} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] text-on-surface-variant uppercase font-bold tracking-widest mb-2">Nome Completo</label>
                    <input required type="text" value={newAthlete.nome} onChange={(e) => setNewAthlete({ ...newAthlete, nome: e.target.value })} className="w-full bg-surface-container border-0 border-l-4 border-primary py-4 pl-6 uppercase text-sm focus:border-secondary transition-all" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-on-surface-variant uppercase font-bold tracking-widest mb-2">CPF</label>
                    <input required type="text" value={newAthlete.cpf} onChange={(e) => setNewAthlete({ ...newAthlete, cpf: e.target.value })} className="w-full bg-surface-container border-0 border-l-4 border-primary py-4 pl-6 uppercase text-sm focus:border-secondary transition-all" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-on-surface-variant uppercase font-bold tracking-widest mb-2">Sexo</label>
                    <select required value={newAthlete.sexo} onChange={(e) => setNewAthlete({ ...newAthlete, sexo: e.target.value })} className="w-full bg-surface-container border-0 border-l-4 border-primary py-4 pl-6 uppercase text-sm focus:border-secondary transition-all">
                      <option value="MASCULINO">Masculino</option>
                      <option value="FEMININO">Feminino</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-on-surface-variant uppercase font-bold tracking-widest mb-2">Nascimento</label>
                    <input required type="date" value={newAthlete.nascimento} onChange={(e) => setNewAthlete({ ...newAthlete, nascimento: e.target.value })} className="w-full bg-surface-container border-0 border-l-4 border-primary py-4 pl-6 uppercase text-sm focus:border-secondary transition-all" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-on-surface-variant uppercase font-bold tracking-widest mb-2">WhatsApp</label>
                    <input required type="text" value={newAthlete.whatsapp} onChange={(e) => setNewAthlete({ ...newAthlete, whatsapp: e.target.value })} className="w-full bg-surface-container border-0 border-l-4 border-primary py-4 pl-6 uppercase text-sm focus:border-secondary transition-all" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-on-surface-variant uppercase font-bold tracking-widest mb-2">Categoria</label>
                    <select required value={newAthlete.categoria} onChange={(e) => setNewAthlete({ ...newAthlete, categoria: e.target.value })} className="w-full bg-surface-container border-0 border-l-4 border-primary py-4 pl-6 uppercase text-sm focus:border-secondary transition-all">
                      <option value="">SELECIONE UMA CATEGORIA</option>
                      <option value="NÃO DEFINIDA">NÃO DEFINIDA</option>
                      {categories.map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-8">
                  <button type="button" onClick={() => setIsAddingAthlete(false)} className="flex-1 py-4 border border-outline-variant hover:bg-surface-container font-bold font-label-sm uppercase">Cancelar</button>
                  <button type="submit" disabled={savingAthlete} className="flex-1 py-4 bg-primary text-on-primary font-bold font-label-sm uppercase slant-cut hover:neon-glow-orange disabled:opacity-50 flex justify-center">
                    {savingAthlete ? "Criando..." : "Criar Inscrição"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Generic Modal Message */}
      {modalMessage && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className={`bg-surface-container-low border ${modalMessage.type === 'error' ? 'border-secondary' : 'border-primary'} p-8 max-w-md w-full relative overflow-hidden group shadow-2xl`}>
            <div className={`absolute top-0 left-0 w-full h-1 ${modalMessage.type === 'error' ? 'bg-secondary neon-glow-pink' : 'bg-primary neon-glow-orange'}`}></div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-12 h-12 ${modalMessage.type === 'error' ? 'bg-secondary/10 border-secondary/30 text-secondary neon-glow-pink' : 'bg-primary/10 border-primary/30 text-primary neon-glow-orange'} border flex items-center justify-center slant-cut`}>
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-headline-sm uppercase italic text-on-background leading-none">{modalMessage.title}</h3>
                </div>
              </div>
              <p className="text-on-surface-variant text-sm mb-8 font-medium">{modalMessage.message}</p>

              <div className="flex justify-end">
                <button
                  onClick={() => setModalMessage(null)}
                  className={`px-8 py-4 ${modalMessage.type === 'error' ? 'bg-secondary text-on-secondary hover:neon-glow-pink' : 'bg-primary text-on-primary hover:neon-glow-orange'} font-bold font-label-sm uppercase tracking-widest slant-cut transition-all`}
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export CSV Modal */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 overflow-y-auto py-12">
          <div className="bg-surface-container-low border border-primary p-8 max-w-lg w-full relative group shadow-2xl my-auto">
            <div className="absolute top-0 left-0 w-full h-1 bg-primary neon-glow-orange"></div>
            <div className="relative z-10">
              <h3 className="font-headline-sm uppercase italic text-on-background mb-8 flex items-center gap-2 border-b border-outline-variant/30 pb-4">
                <Download className="w-6 h-6 text-primary" /> Exportar Dados (CSV)
              </h3>

              <p className="text-sm text-on-surface-variant mb-6">Selecione os filtros abaixo para gerar a planilha com os atletas desejados.</p>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] text-on-surface-variant uppercase font-bold tracking-widest mb-2">Status da Inscrição</label>
                  <select
                    value={exportFilters.statusInscricao}
                    onChange={(e) => setExportFilters({ ...exportFilters, statusInscricao: e.target.value })}
                    className="w-full bg-surface-container border-0 border-l-4 border-primary py-4 pl-6 uppercase text-sm focus:border-secondary transition-all"
                  >
                    <option value="TODAS">TODAS AS INSCRIÇÕES</option>
                    <option value="CONFIRMADA">APENAS CONFIRMADAS</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-on-surface-variant uppercase font-bold tracking-widest mb-2">Status do Kit</label>
                  <select
                    value={exportFilters.kitStatus}
                    onChange={(e) => setExportFilters({ ...exportFilters, kitStatus: e.target.value })}
                    className="w-full bg-surface-container border-0 border-l-4 border-primary py-4 pl-6 uppercase text-sm focus:border-secondary transition-all"
                  >
                    <option value="TODOS">TODOS</option>
                    <option value="ENTREGUE">APENAS KITS ENTREGUES</option>
                    <option value="PENDENTE">APENAS KITS PENDENTES</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-on-surface-variant uppercase font-bold tracking-widest mb-2">Categoria</label>
                  <select
                    value={exportFilters.categoria}
                    onChange={(e) => setExportFilters({ ...exportFilters, categoria: e.target.value })}
                    className="w-full bg-surface-container border-0 border-l-4 border-primary py-4 pl-6 uppercase text-sm focus:border-secondary transition-all"
                  >
                    <option value="TODAS">TODAS AS CATEGORIAS</option>
                    <option value="NÃO DEFINIDA">NÃO DEFINIDA</option>
                    {categories.map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-8 mt-4 border-t border-outline-variant/30">
                <button onClick={() => setIsExportModalOpen(false)} className="flex-1 py-4 border border-outline-variant hover:bg-surface-container font-bold font-label-sm uppercase">Cancelar</button>
                <button onClick={handleExportCSV} className="flex-1 py-4 bg-primary text-on-primary font-bold font-label-sm uppercase slant-cut hover:neon-glow-orange flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" /> Baixar Planilha
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
