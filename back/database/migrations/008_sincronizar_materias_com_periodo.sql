UPDATE materias m
   SET data_inicio = p.data_inicio,
       data_termino = p.data_termino,
       atualizado_em = NOW()
  FROM periodos_letivos p
 WHERE p.id = m.periodo_id
   AND (
     m.data_inicio IS DISTINCT FROM p.data_inicio
     OR m.data_termino IS DISTINCT FROM p.data_termino
   );

CREATE OR REPLACE FUNCTION validar_materia_no_periodo()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  periodo_inicio DATE;
  periodo_termino DATE;
BEGIN
  SELECT data_inicio, data_termino
    INTO periodo_inicio, periodo_termino
    FROM periodos_letivos
   WHERE id = NEW.periodo_id
     AND usuario_id = NEW.usuario_id;

  IF FOUND AND (
    NEW.data_inicio IS DISTINCT FROM periodo_inicio
    OR NEW.data_termino IS DISTINCT FROM periodo_termino
  ) THEN
    RAISE EXCEPTION USING
      ERRCODE = '23514',
      CONSTRAINT = 'materias_datas_no_periodo',
      MESSAGE = 'As datas da materia devem ser iguais as datas do periodo letivo.';
  END IF;

  IF FOUND AND EXISTS (
    SELECT 1
      FROM provas
     WHERE materia_id = NEW.id
       AND data_prova NOT BETWEEN periodo_inicio AND periodo_termino
  ) THEN
    RAISE EXCEPTION USING
      ERRCODE = '23514',
      CONSTRAINT = 'materias_avaliacoes_no_periodo',
      MESSAGE = 'Existem avaliacoes fora do novo periodo letivo da materia.';
  END IF;

  IF TG_OP = 'UPDATE' AND EXISTS (
    SELECT 1
      FROM trabalhos
     WHERE materia_id = NEW.id
       AND periodo_id <> NEW.periodo_id
  ) THEN
    RAISE EXCEPTION USING
      ERRCODE = '23514',
      CONSTRAINT = 'materias_trabalhos_no_periodo',
      MESSAGE = 'Existem trabalhos vinculados ao periodo anterior da materia.';
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION validar_conteudo_ao_alterar_periodo()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF EXISTS (
    SELECT 1
      FROM provas a
      JOIN materias m ON m.id = a.materia_id
     WHERE m.periodo_id = NEW.id
       AND a.data_prova NOT BETWEEN NEW.data_inicio AND NEW.data_termino
  ) OR EXISTS (
    SELECT 1
      FROM trabalhos
     WHERE periodo_id = NEW.id
       AND data_entrega NOT BETWEEN NEW.data_inicio AND NEW.data_termino
  ) THEN
    RAISE EXCEPTION USING
      ERRCODE = '23514',
      CONSTRAINT = 'periodos_conteudo_dentro_das_datas',
      MESSAGE = 'O periodo possui avaliacoes ou trabalhos fora das novas datas.';
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION sincronizar_datas_materias_periodo()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE materias
     SET data_inicio = NEW.data_inicio,
         data_termino = NEW.data_termino,
         atualizado_em = NOW()
   WHERE periodo_id = NEW.id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS periodos_sincronizar_datas_materias ON periodos_letivos;

CREATE TRIGGER periodos_sincronizar_datas_materias
AFTER UPDATE OF data_inicio, data_termino
ON periodos_letivos
FOR EACH ROW
WHEN (
  OLD.data_inicio IS DISTINCT FROM NEW.data_inicio
  OR OLD.data_termino IS DISTINCT FROM NEW.data_termino
)
EXECUTE FUNCTION sincronizar_datas_materias_periodo();
