CREATE TABLE IF NOT EXISTS materias (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  codigo VARCHAR(30) NOT NULL,
  nome VARCHAR(150) NOT NULL,
  professor VARCHAR(120) NOT NULL,
  carga INTEGER NOT NULL CHECK (carga BETWEEN 1 AND 1000),
  horas_estudadas INTEGER NOT NULL DEFAULT 0 CHECK (horas_estudadas >= 0),
  progresso SMALLINT NOT NULL DEFAULT 0 CHECK (progresso BETWEEN 0 AND 100),
  pendencias INTEGER NOT NULL DEFAULT 0 CHECK (pendencias >= 0),
  status VARCHAR(20) NOT NULL DEFAULT 'andamento'
    CHECK (status IN ('andamento', 'concluida')),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT materias_codigo_por_usuario_unico UNIQUE (usuario_id, codigo)
);

CREATE INDEX IF NOT EXISTS materias_usuario_id_idx ON materias(usuario_id);
