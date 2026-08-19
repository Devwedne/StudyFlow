import { UserRound } from 'lucide-react'

function UserPopover({ usuarioLogado, usuarios, carregando, erro }) {
  return (
    <section className="dashboard-popover profile-popover" aria-labelledby="perfil-titulo">
      <div className="profile-popover-heading">
        <UserRound aria-hidden="true" />
        <span>
          <strong id="perfil-titulo">{usuarioLogado.nome}</strong>
          <small>{usuarioLogado.email}</small>
        </span>
      </div>
      <h3>Usuários cadastrados ({usuarios.length})</h3>
      {carregando && <p className="profile-list-status">Carregando...</p>}
      {erro && <p className="profile-list-status form-error" role="alert">{erro}</p>}
      {!carregando && !erro && (
        <ul className="dashboard-users-list">
          {usuarios.map((usuario) => (
            <li key={usuario.id}>
              <span className="dashboard-user-avatar" aria-hidden="true">{usuario.nome.charAt(0).toUpperCase()}</span>
              <span><strong>{usuario.nome}</strong><small>{usuario.email}</small></span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default UserPopover
