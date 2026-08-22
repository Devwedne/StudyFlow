CREATE TABLE IF NOT EXISTS periodos_letivos (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  ano SMALLINT NOT NULL CHECK (ano BETWEEN 1900 AND 2200),
  semestre SMALLINT NOT NULL CHECK (semestre IN (1, 2)),
  nome VARCHAR(20) NOT NULL,
  data_inicio DATE NOT NULL,
  data_termino DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'ativo'
    CHECK (status IN ('ativo', 'encerrado')),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT periodos_datas_validas CHECK (data_termino >= data_inicio),
  CONSTRAINT periodos_usuario_ano_semestre_unico UNIQUE (usuario_id, ano, semestre)
);

INSERT INTO periodos_letivos (
  usuario_id,
  ano,
  semestre,
  nome,
  data_inicio,
  data_termino,
  status
)
SELECT
  usuario_id,
  SPLIT_PART(periodo_letivo, '.', 1)::SMALLINT,
  SPLIT_PART(periodo_letivo, '.', 2)::SMALLINT,
  periodo_letivo,
  MIN(data_inicio),
  MAX(data_termino),
  CASE WHEN MAX(data_termino) < CURRENT_DATE THEN 'encerrado' ELSE 'ativo' END
FROM materias
GROUP BY usuario_id, periodo_letivo
ON CONFLICT (usuario_id, ano, semestre) DO NOTHING;

ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS periodo_atual_id INTEGER;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'usuarios_periodo_atual_fk'
  ) THEN
    ALTER TABLE usuarios
      ADD CONSTRAINT usuarios_periodo_atual_fk
      FOREIGN KEY (periodo_atual_id) REFERENCES periodos_letivos(id) ON DELETE SET NULL;
  END IF;
END $$;

ALTER TABLE materias
  ADD COLUMN IF NOT EXISTS periodo_id INTEGER;

UPDATE materias m
   SET periodo_id = p.id
  FROM periodos_letivos p
 WHERE p.usuario_id = m.usuario_id
   AND p.ano = SPLIT_PART(m.periodo_letivo, '.', 1)::SMALLINT
   AND p.semestre = SPLIT_PART(m.periodo_letivo, '.', 2)::SMALLINT
   AND m.periodo_id IS NULL;

ALTER TABLE materias
  ALTER COLUMN periodo_id SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'materias_periodo_id_fk'
  ) THEN
    ALTER TABLE materias
      ADD CONSTRAINT materias_periodo_id_fk
      FOREIGN KEY (periodo_id) REFERENCES periodos_letivos(id) ON DELETE RESTRICT;
  END IF;
END $$;

UPDATE usuarios u
   SET periodo_atual_id = COALESCE(
     u.periodo_atual_id,
     (
       SELECT p.id
         FROM periodos_letivos p
        WHERE p.usuario_id = u.id
        ORDER BY
          CASE WHEN p.status = 'ativo' THEN 0 ELSE 1 END,
          p.ano DESC,
          p.semestre DESC
        LIMIT 1
     )
   );

DROP INDEX IF EXISTS materias_usuario_periodo_idx;

ALTER TABLE materias
  DROP CONSTRAINT IF EXISTS materias_periodo_letivo_valido,
  DROP COLUMN IF EXISTS periodo_letivo;

CREATE INDEX IF NOT EXISTS periodos_usuario_idx
  ON periodos_letivos(usuario_id, ano DESC, semestre DESC);

CREATE INDEX IF NOT EXISTS materias_periodo_id_idx
  ON materias(periodo_id);

CREATE TABLE IF NOT EXISTS trabalhos (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  periodo_id INTEGER NOT NULL REFERENCES periodos_letivos(id) ON DELETE RESTRICT,
  materia_id INTEGER NOT NULL REFERENCES materias(id) ON DELETE CASCADE,
  titulo VARCHAR(150) NOT NULL,
  data_entrega DATE NOT NULL,
  prioridade VARCHAR(20) NOT NULL DEFAULT 'media'
    CHECK (prioridade IN ('baixa', 'media', 'alta')),
  status VARCHAR(20) NOT NULL DEFAULT 'pendente'
    CHECK (status IN ('pendente', 'andamento', 'concluido')),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS trabalhos_usuario_periodo_idx
  ON trabalhos(usuario_id, periodo_id);

CREATE INDEX IF NOT EXISTS trabalhos_data_entrega_idx
  ON trabalhos(data_entrega);
