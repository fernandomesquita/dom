import { createRoot } from "react-dom/client";

// Teste 1: Renderizar apenas um div simples
function TestApp() {
  return (
    <div style={{ padding: '20px', fontSize: '24px', color: 'red' }}>
      <h1>🎯 TESTE: React está funcionando!</h1>
      <p>Se você vê esta mensagem, o React está renderizando corretamente.</p>
    </div>
  );
}

const rootElement = document.getElementById("root");
console.log("🔍 Root element:", rootElement);

if (rootElement) {
  console.log("✅ Root element encontrado, renderizando...");
  createRoot(rootElement).render(<TestApp />);
} else {
  console.error("❌ Root element não encontrado!");
}
