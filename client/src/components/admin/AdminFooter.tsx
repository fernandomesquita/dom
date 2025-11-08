export function AdminFooter() {
  const version = import.meta.env.VITE_APP_VERSION || '1.0.0';
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background py-4 px-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
        <p>
          © {currentYear} DOM-EARA. Todos os direitos reservados.
        </p>
        <div className="flex items-center gap-4">
          <span>Versão {version}</span>
          <a
            href="https://help.manus.im"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            Suporte
          </a>
          <a
            href="/docs"
            className="hover:text-foreground transition-colors"
          >
            Documentação
          </a>
        </div>
      </div>
    </footer>
  );
}
