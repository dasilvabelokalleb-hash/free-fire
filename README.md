# Bello TECH

Catálogo de aparelhos seminovos com painel administrativo, integração com WhatsApp e suporte a armazenamento local ou Vercel Blob.

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

- Localmente, a lista de aparelhos é criada com os produtos de demonstração na primeira execução e fica em `data/products.json`; os uploads ficam em `public/uploads/`.
- Na Vercel, conecte uma loja **Vercel Blob pública** ao projeto e inclua `BLOB_STORE_ID` e `BLOB_READ_WRITE_TOKEN` nos ambientes Production e Preview. O catálogo remoto é persistido em `products.json` e fotos/vídeos são enviados diretamente ao Blob.
- O disco local é usado apenas fora da Vercel. As pastas `data/` e os uploads locais são ignorados pelo Git; faça cópias de segurança se usar esse modo.
- As fotos dos aparelhos de demonstração são carregadas do Unsplash. Cadastros e uploads próprios ficam armazenados localmente no modo local e no Vercel Blob em produção.
- As mensagens dos botões de compra são enviadas para o WhatsApp `+55 13 99705-2277`.

## Painel administrativo

O painel permite cadastrar, editar, destacar e excluir produtos; definir categoria, preço, condição, bateria, descrição, especificações e status; e enviar fotos JPG, PNG ou WEBP e vídeos MP4 (até 25 MB por arquivo e 12 arquivos por produto). As rotas de gestão e upload exigem sessão administrativa.

## Produção

```powershell
npm run build
npm run start
```

Na Vercel, configure `ADMIN_PASSWORD` e `SESSION_SECRET` (pelo menos 32 caracteres) em Production e Preview; o Blob conectado fornece as variáveis de acesso ao armazenamento. O Blob está sujeito aos limites incluídos no plano Hobby. Antes de abrir o painel ao público, configure credenciais fortes exclusivas e avalie rate limiting para as rotas administrativas.
