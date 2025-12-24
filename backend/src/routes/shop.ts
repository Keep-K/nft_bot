import { FastifyInstance } from 'fastify';
import { z } from 'zod';

const CreateSessionBody = z.object({
  vendor: z.enum(["ALI", "AMAZON", "TEMU"]),
  productUrl: z.string().url()
});

export async function shopRoutes(app: FastifyInstance) {
  app.post('/session', { preHandler: app.requireAuth }, async (req: any, reply) => {
    const { vendor, productUrl } = CreateSessionBody.parse(req.body);

    if (vendor === "ALI" && !app.env.ENABLE_ALI) return reply.code(503).send({ error: "ALI_DISABLED" });
    if (vendor === "AMAZON" && !app.env.ENABLE_AMAZON) return reply.code(503).send({ error: "AMAZON_UPDATING" });
    if (vendor === "TEMU" && !app.env.ENABLE_TEMU) return reply.code(503).send({ error: "TEMU_UPDATING" });

    const session = await app.db.purchaseSession.create({
      data: { userId: req.user.userId, vendor, productUrl }
    });

    const bridgeUrl = `/shop/bridge/${session.id}`;
    return reply.send({ sessionId: session.id, bridgeUrl });
  });

  app.get('/bridge/:id', { preHandler: app.requireAuth }, async (req: any, reply) => {
    const id = req.params.id as string;

    const session = await app.db.purchaseSession.findFirst({
      where: { id, userId: req.user.userId }
    });
    if (!session) return reply.code(404).send('Not Found');

    if (session.vendor !== "ALI") {
      return reply.type('text/html; charset=utf-8').send(`
<!doctype html>
<html><body style="font-family:system-ui;padding:24px">
  <h2>${session.vendor} 연동은 업데이트 중입니다.</h2>
  <p>현재는 Ali 데모만 가능합니다.</p>
</body></html>
      `);
    }

    const checkoutUrl = `${app.env.SIWE_URI}/checkout?sessionId=${session.id}`;

    return reply.type('text/html; charset=utf-8').send(`
<!doctype html>
<html>
  <body style="font-family:system-ui;padding:24px">
    <h2>Ali 상품 선택</h2>
    <p>아래 버튼을 누르면 Ali 상품 페이지가 새 탭으로 열립니다. 상품을 확인한 뒤 다시 이 탭으로 돌아와 “복귀(구매 페이지)”를 누르세요.</p>
    <button id="open" style="padding:12px 16px;font-size:16px">Ali 열기</button>
    <a href="${checkoutUrl}" style="display:inline-block;margin-left:12px;padding:12px 16px;border:1px solid #ccc;text-decoration:none">복귀(구매 페이지)</a>

    <script>
      document.getElementById('open').onclick = () => window.open(${JSON.stringify(session.productUrl)}, '_blank', 'noopener');
    </script>
  </body>
</html>
    `);
  });

  app.post('/return/:id', { preHandler: app.requireAuth }, async (req: any, reply) => {
    const id = req.params.id as string;

    const session = await app.db.purchaseSession.findFirst({ where: { id, userId: req.user.userId } });
    if (!session) return reply.code(404).send({ error: "NOT_FOUND" });

    await app.db.purchaseSession.update({ where: { id }, data: { status: "RETURNED" } });
    return reply.send({ ok: true });
  });
}
