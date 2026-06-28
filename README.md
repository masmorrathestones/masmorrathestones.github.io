# A MASMORRA - THE STONES

Site HTML/CSS/JS para RPG de dark romance, horror adulto, drama, investigação policial e true crime ficcional.

## Arquivos

- `index.html`: estrutura do site.
- `styles.css`: visual gótico, responsivo e sombrio.
- `script.js`: integração com Google Planilhas publicadas como CSV.

## Como conectar com Google Planilhas

No `script.js`, troque os valores dentro de `SHEETS`:

```js
const SHEETS = {
  inicio: "LINK_CSV_DA_PLANILHA_INICIO",
  mapa: "LINK_CSV_DA_PLANILHA_MAPA",
  personagens: "LINK_CSV_DA_PLANILHA_PERSONAGENS",
  eventos: "LINK_CSV_DA_PLANILHA_EVENTOS",
  avatares: "LINK_CSV_DA_PLANILHA_AVATARES",
};
```

## Cabeçalhos das planilhas

### Início

```text
title | eyebrow | description | banner
```

### Mapa

```text
foto | nome | tipo | descricao
```

### Personagens

```text
foto | nome | personalidade | historia | grupo | detalhes
```

No campo `grupo`, use preferencialmente:

```text
civil
criminoso
investigador
```

### Eventos

```text
foto | nome | tipo | data | hora
```

O campo `hora` pode ficar vazio.

### Avatares

```text
foto | nome
```

## Publicando a planilha como CSV

1. Abra a planilha no Google Sheets.
2. Vá em `Arquivo > Compartilhar > Publicar na Web`.
3. Escolha a aba correta.
4. Escolha o formato `Valores separados por vírgula (.csv)`.
5. Copie o link e cole no `script.js`.
