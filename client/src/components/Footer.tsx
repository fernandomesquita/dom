import { Heart } from "lucide-react";
import packageJson from "../../../package.json";

/**
 * Footer Global do Sistema DOM-EARA
 * 
 * Exibido em todas as páginas do aluno (via StudentLayout)
 * - Versão automática do package.json
 * - Copyright dinâmico (ano atual)
 * - Links institucionais
 */

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const version = packageJson.version;

  return (
    <footer className="border-t bg-background">
      <div className="container py-8">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Coluna 1: Sobre */}
          <div>
            <h3 className="font-semibold mb-3">DOM-EARA</h3>
            <p className="text-sm text-muted-foreground">
              Plataforma completa de mentoria com metodologia EARA® para organizar seus estudos e alcançar sua aprovação.
            </p>
          </div>

          {/* Coluna 2: Links */}
          <div>
            <h3 className="font-semibold mb-3">Links Úteis</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="/sobre" className="hover:text-foreground transition-colors">
                  Sobre
                </a>
              </li>
              <li>
                <a href="/planos" className="hover:text-foreground transition-colors">
                  Planos
                </a>
              </li>
              <li>
                <a href="/contato" className="hover:text-foreground transition-colors">
                  Contato
                </a>
              </li>
              <li>
                <a href="/termos" className="hover:text-foreground transition-colors">
                  Termos de Uso
                </a>
              </li>
            </ul>
          </div>

          {/* Coluna 3: Suporte */}
          <div>
            <h3 className="font-semibold mb-3">Suporte</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="/ajuda" className="hover:text-foreground transition-colors">
                  Central de Ajuda
                </a>
              </li>
              <li>
                <a href="/faq" className="hover:text-foreground transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="mailto:suporte@dom-eara.com" className="hover:text-foreground transition-colors">
                  suporte@dom-eara.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Linha inferior: Copyright + Versão */}
        <div className="mt-8 pt-6 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <span>© {currentYear} DOM-EARA. Feito com</span>
            <Heart className="h-4 w-4 text-red-500 fill-current" />
            <span>para concurseiros.</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/privacidade" className="hover:text-foreground transition-colors">
              Privacidade
            </a>
            <a href="/lgpd" className="hover:text-foreground transition-colors">
              LGPD
            </a>
            <span className="text-xs">v{version}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
