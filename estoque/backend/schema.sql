CREATE TABLE IF NOT EXISTS estoque (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  versao integer NOT NULL DEFAULT 1,
  dados jsonb NOT NULL
);

CREATE TABLE IF NOT EXISTS credenciais (
  pessoa text PRIMARY KEY,
  senha text NOT NULL,
  tipo text NOT NULL DEFAULT 'senha' CHECK (tipo IN ('senha', 'pin'))
);

CREATE TABLE IF NOT EXISTS sessoes (
  token text PRIMARY KEY,
  pessoa text NOT NULL REFERENCES credenciais(pessoa) ON DELETE CASCADE,
  expira timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS tentativas (
  chave text PRIMARY KEY,
  total integer NOT NULL,
  janela timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS fotos (
  movimento text PRIMARY KEY,
  imagem text NOT NULL
);

CREATE TABLE IF NOT EXISTS estoque_revisoes (
  versao integer PRIMARY KEY,
  alteracoes jsonb NOT NULL
);
