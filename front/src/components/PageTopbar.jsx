import { useState } from 'react'
import { Bell, Search, UserRound } from 'lucide-react'
import PeriodoLetivoSelector from './PeriodoLetivoSelector'

function PageTopbar({ titulo, placeholder, busca, onBusca, usuarioLogado }) {
  const [avisoAberto, setAvisoAberto] = useState(false)
  const inputId = `busca-${titulo?.toLocaleLowerCase('pt-BR') || 'pagina'}`

  return (
    <header className="dashboard-topbar management-topbar">
      <div className="management-topbar-start">
        {titulo && <strong className="management-topbar-title">{titulo}</strong>}
        <label className="management-search" htmlFor={inputId}>
          <Search aria-hidden="true" />
          <input
            id={inputId}
            type="search"
            placeholder={placeholder}
            value={busca}
            onChange={(event) => onBusca(event.target.value)}
          />
        </label>
      </div>

      <div className="dashboard-actions">
        <PeriodoLetivoSelector />
        <button
          className="notification-button"
          type="button"
          aria-label="Notificações"
          aria-expanded={avisoAberto}
          onClick={() => setAvisoAberto((aberto) => !aberto)}
        >
          <Bell aria-hidden="true" />
        </button>
        <span className="dashboard-avatar-button" title={usuarioLogado.nome}>
          <UserRound aria-hidden="true" />
        </span>

        {avisoAberto && (
          <div className="dashboard-popover notification-popover" role="status">
            <strong>Nenhuma nova notificação.</strong>
            <span>Seus avisos acadêmicos aparecerão aqui.</span>
          </div>
        )}
      </div>
    </header>
  )
}

export default PageTopbar
