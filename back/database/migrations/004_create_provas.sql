CREATE TABLE IF NOT EXISTS provas (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  materia_id INTEGER NOT NULL REFERENCES materias(id) ON DELETE CASCADE,
  titulo VARCHAR(100) NOT NULL,
  data_prova DATE NOT NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT provas_unica_por_materia UNIQUE (materia_id, titulo, data_prova)
);

CREATE INDEX IF NOT EXISTS provas_materia_id_idx ON provas(materia_id);
CREATE INDEX IF NOT EXISTS provas_data_idx ON provas(data_prova);
