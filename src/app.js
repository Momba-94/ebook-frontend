import React, { useState } from 'react';
import { BookOpen, Play, Loader2, FileText, Music, Download } from 'lucide-react';

// O TEU LINK DO RENDER JÁ CONFIGURADO
const API_URL = "https://book-api-ok1c.onrender.com"; 

function App() {
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [ebookData, setEbookData] = useState(null);

  // 1. GERAR ESTRUTURA (OPENAI)
  const handleGenerateIndex = async () => {
    if (!title) return alert("Por favor, insira um tema para o livro.");
    
    setIsLoading(true);
    setStatus('A ligar ao servidor...');

    try {
      const response = await fetch(`${API_URL}/generate-index`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: title })
      });

      if (!response.ok) throw new Error("Erro no servidor");

      const data = await response.json();
      setEbookData(data);
      setStatus('Estrutura gerada com sucesso!');
    } catch (error) {
      console.error(error);
      setStatus('Erro: O servidor pode estar a "acordar". Tente de novo em 30s.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. GERAR E DESCARREGAR PDF (FPDF2)
  const handleDownloadPDF = async () => {
    if (!ebookData) return;
    setStatus('A preparar o teu PDF...');
    
    try {
      const response = await fetch(`${API_URL}/generate-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: title, 
          chapters: ebookData.chapters 
        })
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setStatus('PDF descarregado com sucesso!');
    } catch (error) {
      setStatus('Erro ao gerar o ficheiro PDF.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 border border-slate-100">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-indigo-600 rounded-lg text-white">
            <BookOpen size={24} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">AI Ebook Studio</h1>
        </div>

        {/* Input */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1 ml-1">Tema do Livro</label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-700"
              placeholder="Ex: Guia de Viagem para Marte"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <button
            onClick={handleGenerateIndex}
            disabled={isLoading}
            className={`w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all shadow-lg ${
              isLoading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98]'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>{status}</span>
              </>
            ) : (
              <>
                <Play size={20} fill="currentColor" />
                <span>Gerar Estrutura do Livro</span>
              </>
            )}
          </button>
        </div>

        {/* Resultados */}
        {ebookData && (
          <div className="mt-8 pt-8 border-t border-slate-100 space-y-3 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Opções de Exportação</h3>
            
            <button
              onClick={handleDownloadPDF}
              className="w-full py-3 bg-white border-2 border-indigo-600 text-indigo-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-50 transition-colors"
            >
              <FileText size={18} />
              Descarregar PDF Completo
            </button>

            <p className="text-center text-[10px] text-slate-400 mt-4 italic leading-tight">
              Ligado a: {API_URL}<br/>
              Status atual: {status}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
