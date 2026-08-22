import PageTopbar from '../PageTopbar'
import Sidebar from '../Sidebar'

function ManagementLayout({ paginaAtiva, topbar, usuarioLogado, onSair, children }) {
  return (
    <div className="dashboard-shell">
      <Sidebar paginaAtiva={paginaAtiva} onSair={onSair} />
      <div className="dashboard-main">
        <PageTopbar {...topbar} usuarioLogado={usuarioLogado} />
        {children}
      </div>
    </div>
  )
}

export default ManagementLayout
