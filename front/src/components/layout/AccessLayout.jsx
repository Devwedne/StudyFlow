import studyFlowLogo from '../../assets/studyflowlogo.png'
import studyIllustration from '../../assets/banner-wide.png'

function AccessLayout({ children }) {
  return (
    <main className="access-page">
      <section className="brand-panel" aria-labelledby="studyflow-heading">
        <div className="brand-copy">
          <div className="brand-lockup">
            <img src={studyFlowLogo} alt="StudyFlow" />
          </div>

          <h1 id="studyflow-heading">
            Organize seus estudos com
            <br />
            StudyFlow
          </h1>
          <p>
            A plataforma definitiva para sua jornada acadêmica.
            <br className="desktop-break" /> Mantenha o foco, gerencie suas tarefas e alcance seus
            <br className="desktop-break" /> objetivos com clareza.
          </p>
        </div>

        <div className="illustration-wrap">
          <img
            className="study-illustration"
            src={studyIllustration}
            alt="Estudante organizando sua rotina acadêmica em uma escrivaninha"
          />
        </div>
      </section>

      <section className="auth-panel" aria-label="Acesso ao StudyFlow">
        {children}
      </section>
    </main>
  )
}

export default AccessLayout
