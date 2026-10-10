# Bello TECH

Catálogo de aparelhos seminovos com painel administrativo, integração com WhatsApp e armazenamento local de produtos e mídias.

## Requisitos

- Node.js 20.9 ou superior
- npm

## Iniciar no Windows

1. Abra esta pasta no VS Code.
2. No terminal integrado, execute:

   ```powershell
   npm install
   npm run dev
   ```

3. Acesse [http://localhost:3000](http://localhost:3000).
4. Abra [http://localhost:3000/admin](http://localhost:3000/admin) e entre com a senha local de desenvolvimento indicada em `.env.local`.

O arquivo `.env.local` contém credenciais apenas para o desenvolvimento local. Ele é ignorado pelo Git e não será enviado ao GitHub. Antes de publicar o site, defina `ADMIN_PASSWORD` como um segredo forte e exclusivo e gere um `SESSION_SECRET` aleatório com pelo menos 32 caracteres. Nunca use a senha de desenvolvimento na internet. O aplicativo recusa iniciar sem um segredo de sessão válido.

## Dados e mídias

- A lista de aparelhos é criada com os produtos de demonstração na primeira execução e fica em `data/products.json`.
- Arquivos enviados no painel ficam em `public/uploads/`.
- A pasta `data/` e os arquivos enviados são locais e ignorados pelo Git. Faça cópias de segurança dessas pastas para preservar seus dados.
- As fotos dos aparelhos de demonstração são carregadas do Unsplash. Cadastros e uploads próprios ficam armazenados localmente.
- As mensagens dos botões de compra são enviadas para o WhatsApp `+55 13 99705-2277`.

## Painel administrativo

O painel permite cadastrar, editar, destacar e excluir produtos; definir categoria, preço, condição, bateria, descrição, especificações e status; e enviar fotos JPG, PNG ou WEBP e vídeos MP4 (até 25 MB por arquivo e 12 arquivos por produto). As rotas de gestão e upload exigem sessão administrativa.

## Produção

```powershell
npm run build
npm run start
```

O armazenamento de produtos e mídias utiliza arquivos locais. Para manter cadastros após reinicializações, hospede em um servidor Node.js com disco persistente e faça backups de `data/` e `public/uploads/`. **Plataformas serverless com disco efêmero não preservam os cadastros e uploads.** Antes de abrir o site ao público, configure HTTPS, credenciais fortes exclusivas e armazenamento persistente; avalie rate limiting para o painel administrativo.
