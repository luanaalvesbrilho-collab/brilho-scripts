(function () {
  if (!window.LS || !window.LS.customer || !window.LS.customer.id) return;

  var cliente = {
    id: window.LS.customer.id,
    nome: window.LS.customer.name,
    email: window.LS.customer.email,
  };

  var originalFetch = window.fetch;
  window.fetch = async function () {
    var url = typeof arguments[0] === "string" ? arguments[0] : arguments[0]?.url || "";

    if (url.includes("/cart/add") || url.includes("/carrinho/adicionar")) {
      try {
        var body = arguments[1]?.body;
        var produto = {};
        if (body) {
          var parsed = typeof body === "string" ? JSON.parse(body) : body;
          produto = {
            variant_id: parsed.add?.id || parsed.id || "",
            quantidade: parsed.add?.quantity || parsed.quantity || 1,
          };
        }
        originalFetch("https://hook.us2.make.com/jgzf861b6piyt2at98y1trww4vcpcqdm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cliente: cliente,
            produto: produto,
            pagina: window.location.href,
            horario: new Date().toISOString(),
          }),
        });
      } catch (e) {}
    }

    return originalFetch.apply(this, arguments);
  };
})();
