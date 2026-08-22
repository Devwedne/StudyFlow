ALTER TABLE materias
  ADD COLUMN IF NOT EXISTS periodo_letivo VARCHAR(6);

UPDATE materias
   SET periodo_letivo = CONCAT(
     EXTRACT(YEAR FROM data_inicio)::INTEGER,
     '.',
     CASE WHEN EXTRACT(MONTH FROM data_inicio) <= 6 THEN '1' ELSE '2' END
   )
 WHERE periodo_letivo IS NULL;

ALTER TABLE materias
  ALTER COLUMN periodo_letivo SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'materias_periodo_letivo_valido'
  ) THEN
    ALTER TABLE materias
      ADD CONSTRAINT materias_periodo_letivo_valido
      CHECK (periodo_letivo ~ '^[0-9]{4}\.[12]$');
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS materias_usuario_periodo_idx
  ON materias(usuario_id, periodo_letivo);
