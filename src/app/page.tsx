"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, Variants, AnimatePresence } from "framer-motion";
import { PackageCheck, Zap, RefreshCw, ChevronDown, CheckCircle, Store, CalendarCheck } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc, onSnapshot, query, orderBy, doc, where, getDocs } from "firebase/firestore";
import Receipt from "@/components/Receipt";

export default function Home() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success">("idle");
  const [categories, setCategories] = useState<{ id: string, nome: string }[]>([]);
  const [registrationData, setRegistrationData] = useState<any>(null);
  const [formConfig, setFormConfig] = useState<any>(null);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const isSubmittingRef = useRef(false);
  const { scrollY } = useScroll();

  useEffect(() => {
    const qCategories = query(collection(db, "categories"), orderBy("createdAt", "asc"));
    const unsub = onSnapshot(
      qCategories,
      (querySnapshot) => {
        const c: { id: string, nome: string }[] = [];
        querySnapshot.forEach((docSnap) => {
          c.push({ id: docSnap.id, nome: docSnap.data().nome });
        });
        setCategories(c);
      },
      (error) => {
        console.error("Erro de permissão no Firebase ao buscar categorias:", error);
      }
    );

    const unsubConfig = onSnapshot(doc(db, "settings", "form_config"),
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          setFormConfig(docSnapshot.data());
        } else {
          setFormConfig({ cpf: true, nascimento: true, sexo: true, whatsapp: true, categoria: true });
        }
      },
      (error) => {
        console.error("Erro de permissão no Firebase ao buscar config:", error);
        // Fallback default se o usuário ainda não configurou as regras do Firebase
        setFormConfig({ cpf: true, nascimento: true, sexo: true, whatsapp: true, categoria: true });
      }
    );

    return () => {
      unsub();
      unsubConfig();
    };
  }, []);

  // Parallax effects
  const bgY = useTransform(scrollY, [0, 1000], [0, 200]);
  const shape1Y = useTransform(scrollY, [0, 1000], [0, -150]);
  const shape2Y = useTransform(scrollY, [0, 1000], [0, -250]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingRef.current) return; // Sync block
    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const data = {
        nome: formData.get("nome"),
        cpf: formData.get("cpf"),
        nascimento: formData.get("nascimento"),
        sexo: formData.get("sexo"),
        whatsapp: formData.get("whatsapp"),
        categoria: formData.get("categoria") || "NÃO DEFINIDA",
        createdAt: new Date().toISOString()
      };

      // Verificação de duplicidade no banco de dados para evitar inscrições repetidas em produção
      if (data.cpf) {
        const q = query(collection(db, "registrations"), where("cpf", "==", data.cpf));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          alert("Este CPF já está inscrito no evento!");
          setIsSubmitting(false);
          isSubmittingRef.current = false;
          return;
        }
      } else if (data.whatsapp) {
        // Se CPF estiver desativado, checa por WhatsApp
        const q = query(collection(db, "registrations"), where("whatsapp", "==", data.whatsapp));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          alert("Este WhatsApp já possui uma inscrição no evento!");
          setIsSubmitting(false);
          isSubmittingRef.current = false;
          return;
        }
      }

      await addDoc(collection(db, "registrations"), data);

      setRegistrationData(data);
      setSubmitStatus("success");
      setIsSubmitting(false);
      isSubmittingRef.current = false;

      // Do not auto-close so the user can download the PDF
      // setTimeout(() => {
      //   setSubmitStatus("idle");
      //   (e.target as HTMLFormElement).reset();
      // }, 4000);
    } catch (error) {
      console.error("Error adding document: ", error);
      setIsSubmitting(false);
      isSubmittingRef.current = false;
      alert("Houve um erro ao realizar a inscrição. Tente novamente mais tarde.");
    }
  };

  const generatePDF = async () => {
    try {
      const { toPng } = await import('html-to-image');
      const jsPDF = (await import('jspdf')).default;

      const element = document.getElementById("receipt-container");
      if (!element) return;

      const dataUrl = await toPng(element, {
        backgroundColor: '#1E1E24', // Bg color do surface
        pixelRatio: 2
      });

      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("comprovante-sao-pedro.pdf");
    } catch (err) {
      console.error("Erro ao gerar PDF", err);
      alert("Houve um erro ao gerar o PDF.");
    }
  };

  // Animation Variants
  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  return (
    <>
      <div className="fixed inset-0 grain pointer-events-none z-[100] mix-blend-overlay"></div>

      {/* TopNavBar */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="fixed top-0 w-full z-[60] mix-blend-difference px-6 md:px-margin-desktop py-6 flex justify-between items-center"
      >
        <div className="font-headline-lg text-4xl md:text-5xl uppercase tracking-tighter text-white select-none">
          1ª CORRIDA COM <span className="text-primary">SÃO PEDRO</span>
        </div>
        <div className="hidden md:flex gap-12 items-center">
          {[
            { label: "EVENTO", id: "evento" },
            { label: "PERCURSO", id: "percurso" },
            { label: "INSCRIÇÃO", id: "inscricao" }
          ].map((item) => (
            <a key={item.id} href={`#${item.id}`} className="text-white/70 hover:text-white transition-all font-label-sm uppercase tracking-[0.3em] text-[10px] hover:tracking-[0.4em]">
              {item.label}
            </a>
          ))}
          <a className="relative group text-white px-8 py-3 font-label-sm uppercase font-bold rounded-full hover:scale-105 transition-all overflow-hidden" href="#inscricao">
            <div className="absolute inset-0 gradient-energy opacity-80 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <span className="relative z-10 inline-block drop-shadow-md text-white">INSCREVA-SE</span>
          </a>
        </div>
      </motion.nav>

      <main>
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center overflow-hidden" id="evento">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent z-10"></div>
            <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-black/80 to-transparent z-10 pointer-events-none"></div>

            <motion.div style={{ y: shape1Y }} className="absolute top-1/4 -right-20 w-96 h-96 gradient-energy rounded-full blur-decorative opacity-60"></motion.div>
            <motion.div style={{ y: shape2Y }} className="absolute bottom-1/4 -left-20 w-80 h-80 bg-purple-600 rounded-full blur-decorative opacity-50"></motion.div>

            <motion.img
              style={{ y: bgY, scale: 1.1 }}
              className="w-full h-full object-cover object-[center_0.5%] opacity-80 brightness-50"
              src="/hero_bg_runner.png"
              alt="Hero background"
            />
          </div>

          <div className="relative z-20 px-margin-mobile md:px-margin-desktop w-full mt-20">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 items-center gap-12">
              <motion.div
                className="lg:col-span-8"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                <motion.div variants={fadeUp} className="flex items-center gap-4 mb-8">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: 48 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-[2px] bg-secondary"
                  ></motion.div>
                  <span className="font-label-sm uppercase tracking-[0.5em] text-secondary font-bold">12 DE JULHO</span>
                </motion.div>

                <motion.div variants={fadeUp} className="relative group">
                  <h2 className="kinetic-text font-display-xl text-5xl sm:text-7xl md:text-[140px] italic uppercase leading-[0.8] mb-0 opacity-60 select-none absolute -top-12 -left-4 group-hover:opacity-70 transition-opacity duration-700">1ª CORRIDA</h2>
                  <h1 className="font-display-xl text-5xl sm:text-7xl md:text-[140px] italic uppercase leading-[0.85] mb-6 relative z-10 text-overlap break-words">
                    SÃO PEDRO<br />
                    <span className="text-transparent text-white gradient-energy text-4xl sm:text-5xl md:text-7xl block mt-4">PRAIA DO MACEIÓ</span>
                  </h1>
                </motion.div>

                <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-8 mt-12">
                  <div className="glass-panel p-6 border-l-4 border-primary rounded-3xl hover:scale-105 hover:bg-white/[0.05] transition-all cursor-default">
                    <div>
                      <p className="font-label-sm uppercase text-primary/80 mb-1 font-bold">12 de Julho</p>
                      <p className="font-display-xl text-4xl">06 horas</p>
                    </div>
                  </div>
                  <div className="glass-panel p-6 border-l-4 border-secondary rounded-3xl hover:scale-105 hover:bg-white/[0.05] transition-all cursor-default">
                    <div>
                      <p className="font-label-sm uppercase text-secondary/80 mb-1 font-bold">CONCENTRAÇÃO</p>
                      <p className="font-title-md text-lg">Ao lado da Igreja de São Pedro<br />(Praia do Maceió)</p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, delay: 0.6 }}
                className="lg:col-span-4 hidden lg:block"
              >
                <div className="relative group">
                  <div className="absolute -inset-4 border border-white/10 rounded-3xl group-hover:border-primary/50 transition-colors duration-500"></div>
                  <div className="bg-surface-container p-8 rounded-3xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10">
                      <p className="font-body-lg text-white/80 leading-relaxed mb-8">
                        &quot;Uma prova de superação, fôlego e solidariedade.&quot;
                      </p>
                      <div className="h-1 w-full bg-gradient-to-r from-primary to-transparent mb-4"></div>
                      <p className="font-label-sm uppercase tracking-widest text-[10px]">#MOVIMENTOPRO</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Solidariedade & Map */}
        <section className="py-32 relative bg-surface-dim overflow-hidden" id="percurso">
          <div className="absolute top-0 right-0 w-full h-full slant-section bg-surface-container-low -z-10"></div>

          <div className="px-margin-mobile md:px-margin-desktop max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeUp}
                className="relative group cursor-pointer"
              >
                <div className="absolute -inset-8 gradient-energy opacity-10 blur-3xl group-hover:opacity-30 transition-opacity duration-700"></div>
                <div
                  className="relative overflow-hidden rounded-[32px] border border-white/10 shadow-2xl shadow-black/50"
                  onClick={() => setIsMapOpen(true)}
                >
                  <motion.img
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.8 }}
                    className="w-full h-[500px] object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-100"
                    src="/percurso.jpeg"
                    alt="Percurso"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500"></div>
                  <div className="absolute bottom-8 left-8 right-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <h3 className="font-headline-lg text-4xl text-white mb-2 uppercase">PERCURSO</h3>
                    <p className="font-label-sm text-secondary font-bold tracking-[0.2em]">2,5KM - 5KM</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={staggerContainer}
              >
                <motion.h2 variants={fadeUp} className="font-headline-lg text-4xl sm:text-5xl md:text-6xl lg:text-6xl uppercase mb-8 leading-none break-words">
                  SOLIDARIEDADE <span className="text-secondary relative inline-block">ATIVA
                    <motion.span
                      initial={{ width: 0 }}
                      whileInView={{ width: "100%" }}
                      transition={{ delay: 0.5, duration: 0.8 }}
                      viewport={{ once: true }}
                      className="absolute -bottom-2 left-0 h-2 bg-secondary/30"
                    ></motion.span>
                  </span>
                </motion.h2>
                <motion.p variants={fadeUp} className="font-body-lg text-white/60 mb-12 max-w-lg leading-relaxed">
                  Sua energia corre por uma causa. O valor da inscrição é simbólico, focado em ajudar quem mais precisa através da doação de alimentos. Faça parte deste movimento.
                </motion.p>

                <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="glass-panel rounded-3xl p-10 flex flex-col items-center justify-center text-center hover:bg-white/[0.05] transition-colors border-white/10 hover:border-secondary/50">
                    <span className="font-display-xl text-7xl text-secondary mb-2 drop-shadow-[0_0_15px_rgba(138,18,217,0.5)]">01</span>
                    <span className="font-label-sm uppercase tracking-[0.3em] text-white/80 font-bold">QUILO</span>
                  </div>
                  <div className="gradient-energy rounded-3xl p-10 flex flex-col items-center justify-center text-center shadow-lg shadow-secondary/20 hover:shadow-secondary/40 transition-shadow">
                    <PackageCheck className="text-6xl mb-4 text-white animate-bounce" style={{ animationDuration: '3s' }} />
                    <span className="font-title-md uppercase text-white font-bold">ALIMENTO NÃO PERECÍVEL</span>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Registration Section */}
        <section className="py-section-gap relative overflow-hidden" id="inscricao">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.15, 0.1]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] gradient-energy rounded-full blur-[150px]"
          ></motion.div>

          <div className="px-margin-mobile md:px-margin-desktop max-w-5xl mx-auto relative z-10">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="text-center mb-24 relative"
            >
              <h2 className="font-display-xl text-5xl md:text-[120px] italic uppercase leading-none opacity-20 absolute -top-16 left-0 right-0 select-none">PRONTO PARA CORRER?</h2>
              <h2 className="font-headline-lg text-4xl md:text-8xl italic uppercase relative z-10 drop-shadow-lg">
                GARANTA SEU <span className="text-transparent text-white gradient-energy">LUGAR</span>
              </h2>
            </motion.div>

            <motion.form
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="glass-panel p-8 md:p-16 relative shadow-2xl border-white/10 backdrop-blur-xl"
              onSubmit={handleSubmit}
            >
              {submitStatus === "success" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 z-50 bg-surface/95 backdrop-blur-md flex flex-col items-center justify-center text-center p-8 border border-emerald-500/30 rounded-3xl"
                >
                  <button onClick={() => { setSubmitStatus("idle"); setRegistrationData(null); }} className="absolute top-4 right-4 text-white/50 hover:text-white">✕</button>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 10, delay: 0.2 }}
                    className="mb-6 drop-shadow-[0_0_20px_rgba(16,185,129,0.5)] text-emerald-500"
                  >
                    <CheckCircle className="w-24 h-24" />
                  </motion.div>
                  <h3 className="font-headline-lg italic text-4xl text-white mb-4">INSCRIÇÃO CONFIRMADA!</h3>
                  <p className="font-body-lg text-white/70 max-w-md mb-8">
                    Prepare seus tênis e sua fé! E não esqueça seu alimento não perecível no dia da prova, um gesto de solidariedade que faz a diferença!
                  </p>
                  <button
                    onClick={generatePDF}
                    className="bg-secondary text-white font-bold px-8 py-4 rounded-full hover:scale-105 transition-transform flex items-center gap-2 shadow-[0_0_20px_rgba(138,18,217,0.5)]"
                  >
                    BAIXAR COMPROVANTE (PDF)
                  </button>
                  {/* Hidden Receipt Component for PDF Generation */}
                  <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
                    <Receipt data={registrationData} />
                  </div>
                </motion.div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
                <div className="group relative">
                  <label className="font-label-sm uppercase text-primary/80 text-[10px] absolute -top-3 left-4 bg-surface px-2 transition-colors group-focus-within:text-primary z-10">Nome Completo</label>
                  <input name="nome" className="w-full bg-surface-container-low/50 border border-white/10 focus:border-primary focus:bg-primary/5 focus:ring-0 text-white font-title-md italic p-5 transition-all outline-none rounded-xl" placeholder="DIGITE SEU NOME" type="text" required />
                </div>
                {formConfig?.cpf !== false && (
                  <div className="group relative">
                    <label className="font-label-sm uppercase text-primary/80 text-[10px] absolute -top-3 left-4 bg-surface px-2 transition-colors group-focus-within:text-primary z-10">CPF</label>
                    <input name="cpf" className="w-full bg-surface-container-low/50 border border-white/10 focus:border-primary focus:bg-primary/5 focus:ring-0 text-white font-title-md italic p-5 transition-all outline-none rounded-xl" placeholder="000.000.000-00" type="text" required />
                  </div>
                )}
                {formConfig?.nascimento !== false && (
                  <div className="group relative">
                    <label className="font-label-sm uppercase text-primary/80 text-[10px] absolute -top-3 left-4 bg-surface px-2 transition-colors group-focus-within:text-primary z-10">Nascimento</label>
                    <input name="nascimento" className="w-full bg-surface-container-low/50 border border-white/10 focus:border-primary focus:bg-primary/5 focus:ring-0 text-white font-title-md italic p-5 transition-all outline-none rounded-xl cursor-pointer" type="date" required />
                  </div>
                )}
                {formConfig?.sexo !== false && (
                  <div className="group relative">
                    <label className="font-label-sm uppercase text-primary/80 text-[10px] absolute -top-3 left-4 bg-surface px-2 transition-colors group-focus-within:text-primary z-10">Sexo</label>
                    <div className="relative">
                      <select name="sexo" className="w-full bg-surface-container-low/50 border border-white/10 focus:border-primary focus:bg-primary/5 focus:ring-0 text-white font-title-md italic p-5 transition-all outline-none appearance-none rounded-xl cursor-pointer" required>
                        <option className="bg-surface text-white" value="">SELECIONE...</option>
                        <option className="bg-surface text-white" value="MASCULINO">MASCULINO</option>
                        <option className="bg-surface text-white" value="FEMININO">FEMININO</option>
                      </select>
                      <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none w-6 h-6" />
                    </div>
                  </div>
                )}
                {formConfig?.whatsapp !== false && (
                  <div className="group relative">
                    <label className="font-label-sm uppercase text-primary/80 text-[10px] absolute -top-3 left-4 bg-surface px-2 transition-colors group-focus-within:text-primary z-10">WhatsApp</label>
                    <input name="whatsapp" className="w-full bg-surface-container-low/50 border border-white/10 focus:border-primary focus:bg-primary/5 focus:ring-0 text-white font-title-md italic p-5 transition-all outline-none rounded-xl" placeholder="(00) 00000-0000" type="tel" required />
                  </div>
                )}
                {categories.length > 0 && formConfig?.categoria !== false && (
                  <div className="group relative">
                    <label className="font-label-sm uppercase text-primary/80 text-[10px] absolute -top-3 left-4 bg-surface px-2 transition-colors group-focus-within:text-primary z-10">Categoria</label>
                    <div className="relative">
                      <select name="categoria" className="w-full bg-surface-container-low/50 border border-white/10 focus:border-primary focus:bg-primary/5 focus:ring-0 text-white font-title-md italic p-5 transition-all outline-none appearance-none rounded-xl cursor-pointer" required>
                        <option className="bg-surface text-white" value="">SELECIONE...</option>
                        {categories.map((c) => (
                          <option key={c.id} className="bg-surface text-white" value={c.nome}>{c.nome}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none w-6 h-6" />
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-16 relative">
                <button
                  className={`relative overflow-hidden w-full rounded-2xl group hover:scale-[1.02] active:scale-95 text-white font-display-xl text-2xl sm:text-3xl md:text-5xl py-6 md:py-8 italic uppercase transition-all flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 shadow-[0_20px_50px_rgba(255,95,31,0.2)] hover:shadow-[0_20px_60px_rgba(255,95,31,0.4)] ${isSubmitting ? 'opacity-90 pointer-events-none' : ''}`}
                  type="submit"
                  disabled={isSubmitting || submitStatus === 'success'}
                >
                  <div className="absolute inset-0 gradient-energy opacity-90 group-hover:opacity-100 transition-opacity"></div>

                  {/* Button shine effect */}
                  <div className="absolute top-0 -left-[100%] h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine"></div>

                  <span className="relative z-10 inline-block tracking-normal sm:tracking-wider text-center">
                    {isSubmitting ? 'PROCESSANDO...' : 'CONFIRMAR INSCRIÇÃO'}
                  </span>
                  <span className={`relative z-10 inline-block ${isSubmitting ? 'animate-spin' : 'group-hover:translate-x-2 transition-transform'}`}>
                    {isSubmitting ? <RefreshCw className="w-8 h-8 md:w-12 md:h-12" /> : <Zap className="w-8 h-8 md:w-12 md:h-12" fill="currentColor" />}
                  </span>
                </button>
              </div>
            </motion.form>
          </div>
        </section>

        {/* Kit & Logistics */}
        <section className="py-32 relative overflow-hidden bg-surface-container-lowest/50 border-t border-white/5">
          <div className="px-margin-mobile md:px-margin-desktop max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="md:col-span-1 pr-12 flex flex-col justify-center"
              >
                <h2 className="font-headline-lg italic uppercase text-white leading-none text-6xl mb-6">ENTREGA DO<br /><span className="text-primary">ALIMENTO</span></h2>
                <p className="font-body-lg text-white/50 leading-relaxed">VOCÊ PODE FAZER A ENTREGA DO ALIMENTO NO DIA DO EVENTO OU ANTECIPADAMENTE.</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="group cursor-default"
              >
                <div className="glass-panel p-12 h-full border-b-4 border-primary hover:bg-primary/5 transition-all group-hover:-translate-y-4 group-hover:shadow-[0_20px_40px_rgba(255,95,31,0.1)]">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform text-primary">
                    <Store className="w-10 h-10" />
                  </div>
                  <h3 className="font-title-md italic uppercase mb-4 text-white">SECRETARIA PAROQUIAL</h3>
                  <p className="font-body-md text-white/50 leading-relaxed">A entrega pode ser feita na secretaria paroquial em horário comercial.</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="group cursor-default"
              >
                <div className="glass-panel p-12 h-full border-b-4 border-purple-500 hover:bg-purple-500/5 transition-all group-hover:-translate-y-4 group-hover:shadow-[0_20px_40px_rgba(168,85,247,0.1)]">
                  <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform text-purple-400">
                    <CalendarCheck className="w-10 h-10" />
                  </div>
                  <h3 className="font-title-md italic uppercase mb-4 text-white">NO DIA DO EVENTO</h3>
                  <p className="font-body-md text-white/50 leading-relaxed">Se preferir, a entrega do alimento pode ser feita no dia do evento.</p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-dim py-24 border-t border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full gradient-energy opacity-5 blur-[100px]"></div>
        <div className="px-margin-mobile md:px-margin-desktop max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end gap-12">
            <div>
              <div className="font-headline-lg text-6xl md:text-9xl uppercase opacity-10 select-none mb-4 hover:opacity-20 transition-opacity">1ª CORRIDA COM SÃO PEDRO</div>
              <p className="font-label-sm text-white/40 tracking-[0.4em]">© 2026 CORRIDA COM SÃO PEDRO.<br className="md:hidden" /> TODOS OS DIREITOS RESERVADOS.</p>
            </div>
            {/* <div className="flex flex-wrap gap-8 font-label-sm uppercase text-[10px] tracking-[0.2em]">
              {["Regulamento", "Privacidade", "Contato"].map(link => (
                <a key={link} className="text-white/50 hover:text-primary hover:tracking-[0.3em] transition-all" href="#">{link}</a>
              ))}
            </div> */}
          </div>
        </div>
      </footer>

      {/* Map Lightbox */}
      <AnimatePresence>
        {isMapOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4 sm:p-12 cursor-zoom-out backdrop-blur-md"
            onClick={() => setIsMapOpen(false)}
          >
            <motion.img
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              src="/percurso.jpeg"
              alt="Percurso Expandido"
              className="w-full h-auto max-h-full object-contain rounded-xl sm:rounded-3xl shadow-[0_0_50px_rgba(255,95,31,0.3)]"
            />
            <div className="absolute top-6 right-6 text-white/50 bg-black/50 w-12 h-12 flex items-center justify-center rounded-full backdrop-blur-md hover:bg-white/10 hover:text-white transition-colors">
              ✕
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Cache bust
