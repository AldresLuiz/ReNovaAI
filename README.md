<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:03A149,50:027D38,100:03A149&height=200&section=header&text=ReNovaAI&fontSize=34&fontColor=ffffff&fontAlignY=35&animation=fadeIn"/>
</p>

Projeto desenvolvido para o Hackathon Unifavip Wyden - 1ª edição, onde conquistamos o 1º lugar.

## Visão geral

O ReNovaAI é uma solução digital criada para facilitar o descarte correto de resíduos domésticos e industriais de pequeno porte. A proposta central é ajudar qualquer pessoa a descobrir, em poucos cliques, como e onde descartar corretamente um material, reduzindo o descarte inadequado e incentivando práticas mais sustentáveis.

O projeto foi pensado para pessoas com pouco letramento digital, com linguagem simples, interface acessível e fluxo intuitivo em dispositivos móveis.

## O problema

A falta de informação sobre o descarte correto de resíduos é um problema recorrente na rotina das pessoas. Muitas vezes, o cidadão não sabe:

- como descartar corretamente um item;
- quais cuidados são necessários para manuseio seguro;
- onde existe o ponto de coleta mais próximo;
- se o local aceita determinado tipo de resíduo.

Isso gera descarte indevido em lixo comum, risco ambiental e perda de materiais recicláveis.

## A solução

O ReNovaAI conecta a busca por um resíduo com:

- orientações claras de descarte;
- alertas de segurança e cuidados;
- indicação de pontos de coleta próximos;
- mapa e rota para o ponto mais adequado;
- suporte a busca por texto, atalhos e localização.

A plataforma foi construída com foco em usabilidade, acessibilidade e simplicidade, priorizando uma experiência rápida no celular.

## Funcionalidades principais

- Busca por resíduo por texto ou termos comuns;
- Sugestões e sinônimos para facilitar a pesquisa;
- Orientações de descarte com cuidados e alertas;
- Lista de pontos de coleta mais próximos;
- Geolocalização e busca por bairro/cidade;
- Mapa interativo com suporte à rota;
- Botão de "Como chegar" para direcionamento em apps de mapas;
- Fluxo mobile-first com foco em acessibilidade.

## Tecnologias utilizadas

- Frontend: HTML, CSS e JavaScript puro
- Backend: Node.js + Express
- Banco de dados: PostgreSQL
- Mapa: Leaflet + OpenStreetMap
- Geocodificação: Nominatim
- IA opcional: AWS Bedrock
- Containerização: Docker

## Arquitetura

O projeto foi estruturado em camadas:

- Frontend estático para fácil uso e deploy simples;
- Backend responsável por regras de negócio e acesso ao banco;
- PostgreSQL com dados de resíduos e pontos de coleta;
- Mapa e geolocalização para encontrar a melhor opção de descarte;
- API para integração entre interface e dados.

## Como executar localmente

### 1. Configure as variáveis de ambiente

Crie um arquivo `.env` com base no `.env.example` e ajuste os valores de conexão e segredos conforme o ambiente local.

### 2. Suba o projeto com Docker Compose

```bash
docker compose up --build
```

Esse comando inicia o backend, o banco e os serviços necessários para a aplicação funcionar.

### 3. Acesse a aplicação

Após o container subir, acesse o endereço local do projeto no navegador.

> Importante: ajuste o `.env` antes de iniciar o projeto, pois as configurações de banco, JWT e demais variáveis precisam estar corretas para o ambiente funcionar.

## Equipe

- Rafael - [GitHub](https://github.com/Rafaelht0)
- Bernardo - [GitHub](https://github.com/devbernardosantos)
- Aldres - [GitHub](https://github.com/AldresLuiz)
- Carlos - [GitHub](https://github.com/CarlosFerDK)
