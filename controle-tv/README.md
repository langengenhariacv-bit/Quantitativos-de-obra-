# Controle TV

Controle remoto para a TV LG, sem anúncios, que funciona de dois jeitos:

- **Wi-Fi** (TVs LG webOS): setas, volume, canais, mídia, atalhos de apps
  (Netflix, YouTube, Prime, Disney+, Globoplay), entradas e digitação de texto.
- **Infravermelho** (celulares com emissor IR, como o POCO X7 Pro): liga a TV,
  setas, volume, canais, números e menus, sem precisar de rede.

No modo **Automático**, o app usa o Wi-Fi quando está conectado e o
infravermelho quando não está. Para ligar a TV desligada, ele usa o
infravermelho e depois volta a se conectar pelo Wi-Fi.

## Baixar o APK

O GitHub compila o app sozinho a cada alteração nesta pasta.

1. No GitHub, abra a aba **Actions** do repositório e entre no workflow
   **Controle TV (APK)**.
2. Abra a execução mais recente que terminou com ✅ e baixe o arquivo
   `controle-tv-apk` na seção **Artifacts**.
3. Extraia o `app-debug.apk` do zip e passe para o celular (cabo, Drive ou
   WhatsApp).
4. No celular, abra o APK e permita a instalação de **fontes desconhecidas**
   quando o Android pedir.

## Versão web (iPhone e outros celulares)

A mesma tela também funciona no navegador, só pelo Wi-Fi (o iPhone não tem
infravermelho). O workflow **Controle TV (web)** publica a versão web no
GitHub Pages sempre que a pasta `controle-tv/` muda na `main`:

https://langengenhariacv-bit.github.io/Quantitativos-de-obra-/

No iPhone:

1. Abra o link no **Safari** e toque em Compartilhar → **Adicionar à Tela de
   Início**.
2. Digite o IP da TV e toque em **Conectar**. Se aparecer o aviso do
   certificado, toque no link indicado, depois em **Mostrar detalhes →
   Visitar este site**, volte e conecte de novo.
3. Se o iPhone pedir acesso à **rede local**, permita.

A versão web só funciona com TVs LG de 2018 em diante, que aceitam conexão
segura na porta 3001.

## Primeiro uso

1. Para o infravermelho, aponte o celular para a TV e toque em ⏻.
2. Para o Wi-Fi, encontre o IP da TV em Configurações → Geral → Rede → Wi-Fi
   → Configurações avançadas. Digite o IP no cartão **Conexão**, toque em
   **Conectar** e aceite o pedido que aparece na tela da TV. O app guarda o
   pareamento.

## Compilar no computador

Precisa do JDK 17 e do Android SDK (o Android Studio instala os dois).

```
cd controle-tv/android
./gradlew assembleDebug
```

O APK fica em `app/build/outputs/apk/debug/app-debug.apk`.

## Como funciona

- `app/src/main/assets/index.html`: a tela do controle.
- `LgTv.java`: o protocolo SSAP da LG. Usa `wss://IP:3001` e, se não der,
  `ws://IP:3000`. Aceita o certificado oficial das TVs LG; para outros
  modelos, guarda o certificado da primeira conexão e exige o mesmo depois.
- `IrBlaster.java`: os códigos NEC das TVs LG (endereço 0x04), enviados pelo
  `ConsumerIrManager` do Android.
