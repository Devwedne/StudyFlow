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
    NEW.data_inicio < periodo_inicio
    OR NEW.data_termino > periodo_termino
  ) THEN
    RAISE EXCEPTION USING
      ERRCODE = '23514',
      CONSTRAINT = 'materias_datas_no_periodo',
      MESSAGE = 'As datas da materia devem estar dentro do periodo letivo.';
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

DROP TRIGGER IF EXISTS materias_validar_datas_no_periodo ON materias;

CREATE TRIGGER materias_validar_datas_no_periodo
BEFORE INSERT OR UPDATE OF usuario_id, periodo_id, data_inicio, data_termino
ON materias
FOR EACH ROW
EXECUTE FUNCTION validar_materia_no_periodo();

CREATE OR REPLACE FUNCTION validar_avaliacao_no_periodo()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  periodo_inicio DATE;
  periodo_termino DATE;
BEGIN
  SELECT p.data_inicio, p.data_termino
    INTO periodo_inicio, periodo_termino
    FROM materias m
    JOIN periodos_letivos p ON p.id = m.periodo_id
   WHERE m.id = NEW.materia_id;

  IF FOUND AND NEW.data_prova NOT BETWEEN periodo_inicio AND periodo_termino THEN
    RAISE EXCEPTION USING
      ERRCODE = '23514',
      CONSTRAINT = 'avaliacoes_data_no_periodo',
      MESSAGE = 'A data da avaliacao deve estar dentro do periodo letivo.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS avaliacoes_validar_data_no_periodo ON provas;

CREATE TRIGGER avaliacoes_validar_data_no_periodo
BEFORE INSERT OR UPDATE OF materia_id, data_prova
ON provas
FOR EACH ROW
EXECUTE FUNCTION validar_avaliacao_no_periodo();

CREATE OR REPLACE FUNCTION validar_trabalho_no_periodo()
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

  IF FOUND AND NEW.data_entrega NOT BETWEEN periodo_inicio AND periodo_termino THEN
    RAISE EXCEPTION USING
      ERRCODE = '23514',
      CONSTRAINT = 'trabalhos_data_no_periodo',
      MESSAGE = 'A data de entrega deve estar dentro do periodo letivo.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
      FROM materias
     WHERE id = NEW.materia_id
       AND usuario_id = NEW.usuario_id
       AND periodo_id = NEW.periodo_id
  ) THEN
    RAISE EXCEPTION USING
      ERRCODE = '23514',
      CONSTRAINT = 'trabalhos_materia_no_periodo',
      MESSAGE = 'O trabalho e a materia devem pertencer ao mesmo periodo letivo.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trabalhos_validar_data_no_periodo ON trabalhos;

CREATE TRIGGER trabalhos_validar_data_no_periodo
BEFORE INSERT OR UPDATE OF usuario_id, periodo_id, materia_id, data_entrega
ON trabalhos
FOR EACH ROW
EXECUTE FUNCTION validar_trabalho_no_periodo();

CREATE OR REPLACE FUNCTION validar_conteudo_ao_alterar_periodo()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF EXISTS (
    SELECT 1
      FROM materias
     WHERE periodo_id = NEW.id
       AND (
         data_inicio < NEW.data_inicio
         OR data_termino > NEW.data_termino
       )
  ) OR EXISTS (
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
      MESSAGE = 'O periodo possui materias, avaliacoes ou trabalhos fora das novas datas.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS periodos_validar_conteudo_ao_alterar_datas ON periodos_letivos;

CREATE TRIGGER periodos_validar_conteudo_ao_alterar_datas
BEFORE UPDATE OF data_inicio, data_termino
ON periodos_letivos
FOR EACH ROW
EXECUTE FUNCTION validar_conteudo_ao_alterar_periodo();
