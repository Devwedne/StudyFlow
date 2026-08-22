ALTER TABLE materias
  DROP CONSTRAINT IF EXISTS materias_codigo_por_usuario_unico;

ALTER TABLE materias
  ADD COLUMN IF NOT EXISTS data_inicio DATE,
  ADD COLUMN IF NOT EXISTS data_termino DATE,
  ADD COLUMN IF NOT EXISTS nota_1 NUMERIC(4, 2),
  ADD COLUMN IF NOT EXISTS nota_2 NUMERIC(4, 2);

UPDATE materias
   SET data_inicio = COALESCE(data_inicio, CURRENT_DATE),
       data_termino = COALESCE(data_termino, CURRENT_DATE + 120);

ALTER TABLE materias
  ALTER COLUMN data_inicio SET NOT NULL,
  ALTER COLUMN data_termino SET NOT NULL;

ALTER TABLE materias
  DROP COLUMN IF EXISTS codigo,
  DROP COLUMN IF EXISTS carga,
  DROP COLUMN IF EXISTS horas_estudadas,
  DROP COLUMN IF EXISTS progresso,
  DROP COLUMN IF EXISTS pendencias,
  DROP COLUMN IF EXISTS status;

ALTER TABLE materias
  ADD COLUMN IF NOT EXISTS media NUMERIC(4, 2)
    GENERATED ALWAYS AS (
      CASE
        WHEN nota_1 IS NOT NULL AND nota_2 IS NOT NULL
          THEN ROUND((nota_1 + nota_2) / 2, 2)
        ELSE NULL
      END
    ) STORED;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'materias_periodo_valido'
  ) THEN
    ALTER TABLE materias
      ADD CONSTRAINT materias_periodo_valido
      CHECK (data_termino >= data_inicio);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'materias_nota_1_valida'
  ) THEN
    ALTER TABLE materias
      ADD CONSTRAINT materias_nota_1_valida
      CHECK (nota_1 IS NULL OR nota_1 BETWEEN 0 AND 10);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'materias_nota_2_valida'
  ) THEN
    ALTER TABLE materias
      ADD CONSTRAINT materias_nota_2_valida
      CHECK (nota_2 IS NULL OR nota_2 BETWEEN 0 AND 10);
  END IF;
END $$;
