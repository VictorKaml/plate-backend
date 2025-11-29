const fetch = require("node-fetch");

async function test() {
  const res = await fetch("http://localhost:3000/api/check-plate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ license: "ns3737" }),
  });

  const data = await res.json();
  console.log(data);
}

test();
