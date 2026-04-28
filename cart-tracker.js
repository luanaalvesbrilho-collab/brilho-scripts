(function () {
  var sendData = function(data) {
    fetch("https://hook.us2.make.com/jgzf861b6piyt2at98y1trww4vcpcqdm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
  };

  var getCliente = function() {
    if (window.LS && window.LS.customer && window.LS.customer.id) {
      return {
        id: window.LS.customer.id,
        nome: window.LS.customer.name,
        email: window.LS.customer.email
      };
    }
    return { id: "", nome: "visitante", email: "" };
  };

  var originalFetch = window.fetch;
  window.fetch = function() {
    var args = arguments;
    var url = typeof args[0] === "string" ? args[0] : (args[0] && args[0].url) || "";
    
    if (url.indexOf("/cart") !== -1 || url.indexOf("carrinho") !== -1) {
      try {
        var body = args[1] && args[1].body;
        var produto = { variant_id: "", quantidade: 1 };
        if (body) {
          var parsed = typeof body === "string" ? JSON.parse(body) : body;
          produto.variant_id = (parsed.add && parsed.add.id) || parsed.id || "";
          produto.quantidade = (parsed.add && parsed.add.quantity) || parsed.quantity || 1;
        }
        sendData({
          cliente: getCliente(),
          produto: produto,
          pagina: window.location.href,
          horario: new Date().toISOString()
        });
      } catch(e) {
        sendData({
          cliente: getCliente(),
          produto: { variant_id: "erro_parse", quantidade: 1 },
          pagina: window.location.href,
          horario: new Date().toISOString()
        });
      }
    }
    return originalFetch.apply(this, args);
  };

  // Também intercepta XMLHttpRequest
  var originalOpen = XMLHttpRequest.prototype.open;
  var originalSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open = function(method, url) {
    this._url = url;
    return originalOpen.apply(this, arguments);
  };
  XMLHttpRequest.prototype.send = function(body) {
    if (this._url && (this._url.indexOf("/cart") !== -1 || this._url.indexOf("carrinho") !== -1)) {
      try {
        var produto = { variant_id: "", quantidade: 1 };
        if (body) {
          var parsed = typeof body === "string" ? JSON.parse(body) : body;
          produto.variant_id = (parsed.add && parsed.add.id) || parsed.id || "";
          produto.quantidade = (parsed.add && parsed.add.quantity) || parsed.quantity || 1;
        }
        sendData({
          cliente: getCliente(),
          produto: produto,
          pagina: window.location.href,
          horario: new Date().toISOString()
        });
      } catch(e) {}
    }
    return originalSend.apply(this, arguments);
  };
})();
