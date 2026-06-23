import React from 'react';

const formatCPF = (cpf: string) => {
  if (!cpf) return '';
  const digits = cpf.replace(/\D/g, '');
  if (digits.length === 11) return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  return cpf;
};

const formatPhone = (phone: string) => {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11) return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  if (digits.length === 10) return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  return phone;
};

export default function Receipt({ data }: { data: any }) {
  if (!data) return null;

  return (
    <div
      id="receipt-container"
      className="bg-surface w-[600px] rounded-[32px] overflow-hidden shadow-2xl relative"
      style={{ fontFamily: 'sans-serif' }}
    >
      {/* Top Banner */}
      <div className="bg-primary px-8 py-10 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-secondary/30 rounded-full blur-xl"></div>
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-black/20 rounded-full blur-xl"></div>
        <h1 className="text-white text-3xl font-black uppercase tracking-tighter m-0 relative z-10" style={{ fontFamily: 'Anton, sans-serif' }}>
          1ª CORRIDA COM SÃO PEDRO
        </h1>
        <p className="text-white/80 font-bold tracking-widest text-sm mt-2 relative z-10">COMPROVANTE OFICIAL</p>
      </div>

      {/* Content */}
      <div className="p-8 pb-12">
        <div className="flex justify-between items-start mb-10 border-b border-white/10 pb-6">
          <div>
            <p className="text-primary/70 text-xs font-bold uppercase tracking-widest mb-1">ATLETA</p>
            <h2 className="text-white text-2xl font-bold uppercase">{data.nome}</h2>
            <p className="text-white/60 text-sm mt-1">Inscrição: #{Math.floor(Math.random() * 9000) + 1000}</p>
          </div>
          {data.categoria && data.categoria !== "NÃO DEFINIDA" && (
            <div className="bg-secondary/10 border border-secondary/30 rounded-xl px-4 py-2 text-center shadow-[0_0_15px_rgba(138,18,217,0.3)]">
              <p className="text-secondary text-[10px] font-bold uppercase tracking-widest mb-1">CATEGORIA</p>
              <p className="text-white font-bold whitespace-nowrap">{data.categoria}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-6">
          {data.cpf && (
            <div>
              <p className="text-primary/70 text-xs font-bold uppercase tracking-widest mb-1">CPF</p>
              <p className="text-white font-medium">{formatCPF(data.cpf)}</p>
            </div>
          )}
          {data.nascimento && (
            <div>
              <p className="text-primary/70 text-xs font-bold uppercase tracking-widest mb-1">NASCIMENTO</p>
              <p className="text-white font-medium">
                {data.nascimento.includes('-') ? data.nascimento.split('-').reverse().join('/') : data.nascimento}
              </p>
            </div>
          )}
          {data.sexo && (
            <div>
              <p className="text-primary/70 text-xs font-bold uppercase tracking-widest mb-1">SEXO</p>
              <p className="text-white font-medium">{data.sexo}</p>
            </div>
          )}
          {data.whatsapp && (
            <div>
              <p className="text-primary/70 text-xs font-bold uppercase tracking-widest mb-1">WHATSAPP</p>
              <p className="text-white font-medium">{formatPhone(data.whatsapp)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer Cutout / Dashed line effect */}
      <div className="relative border-t-2 border-dashed border-white/20 pt-6 pb-8 bg-surface-container-low text-center">
        <div className="absolute -top-4 -left-4 w-8 h-8 bg-background rounded-full"></div>
        <div className="absolute -top-4 -right-4 w-8 h-8 bg-background rounded-full"></div>
        <p className="text-white/50 text-xs tracking-widest font-bold">DATA DO EVENTO: 12 DE JULHO</p>
      </div>
    </div>
  );
}

