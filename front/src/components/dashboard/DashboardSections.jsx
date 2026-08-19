export function StatisticsGrid({ estatisticas }) {
  return (
    <section className="statistics-grid" aria-label="Resumo acadêmico">
      {estatisticas.map(({ titulo, valor, detalhe, tom, progresso, Icone }) => (
        <article className="stat-card" key={titulo}>
          <div className="stat-card-heading">
            <span>{titulo}</span>
            <Icone aria-hidden="true" />
          </div>
          <div className="stat-card-value">
            <strong>{valor}</strong>
            {detalhe && <small className={`stat-${tom}`}>{detalhe}</small>}
          </div>
          {progresso && (
            <div className="stat-progress" aria-label={`${progresso}% concluído`}>
              <span style={{ width: `${progresso}%` }} />
            </div>
          )}
        </article>
      ))}
    </section>
  )
}

export function ScheduleSection({ itens, onVerTudo }) {
  return (
    <section className="dashboard-section schedule-section" aria-labelledby="agenda-titulo">
      <header className="dashboard-section-heading">
        <h2 id="agenda-titulo">Agenda Semanal</h2>
        <button type="button" onClick={onVerTudo}>Ver tudo</button>
      </header>
      <div className="schedule-list" id="agenda-lista" tabIndex="-1">
        {itens.map((item) => (
          <article className={`schedule-item schedule-${item.tom}`} key={`${item.horario}-${item.titulo}`}>
            <time>{item.horario}</time>
            <span><strong>{item.titulo}</strong><small>{item.local}</small></span>
          </article>
        ))}
        {itens.length === 0 && <p className="empty-state">Nenhum compromisso encontrado.</p>}
      </div>
    </section>
  )
}

export function TasksSection({ trabalhos }) {
  return (
    <section className="dashboard-section tasks-section" id="proximos-trabalhos" aria-labelledby="trabalhos-titulo">
      <header className="dashboard-section-heading"><h2 id="trabalhos-titulo">Próximos Trabalhos</h2></header>
      <div className="tasks-list">
        {trabalhos.map((trabalho) => (
          <article className="task-item" key={trabalho.titulo}>
            <span><strong>{trabalho.titulo}</strong><small>{trabalho.materia} • {trabalho.prazo}</small></span>
            <em className={`priority-${trabalho.tom}`}>{trabalho.prioridade}</em>
          </article>
        ))}
        {trabalhos.length === 0 && <p className="empty-state">Nenhum trabalho encontrado.</p>}
      </div>
    </section>
  )
}

export function SubjectProgressSection({ materias }) {
  return (
    <section className="dashboard-section subject-progress-section" id="progresso-materias" aria-labelledby="progresso-titulo">
      <h2 id="progresso-titulo">Progresso por Matéria</h2>
      <div className="subject-progress-grid">
        {materias.map((materia) => (
          <article className="subject-progress" key={materia.nome}>
            <div><strong>{materia.nome}</strong><span>{materia.percentual}%</span></div>
            <div className="subject-progress-bar" aria-label={`${materia.percentual}% concluído`}>
              <span className={`progress-${materia.tom}`} style={{ width: `${materia.percentual}%` }} />
            </div>
            <small>{materia.resumo}</small>
          </article>
        ))}
      </div>
    </section>
  )
}
